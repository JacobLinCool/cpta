import debug from "debug";
import Dockerode from "dockerode";
import { WritableStream } from "memory-streams";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as tar from "tar";

const log = debug("cpta:environment");

export interface EnvironmentOptions {
	/**
	 * Restore workspace from a tarball or directory on host
	 */
	restore?: string | string[];
}

export class Environment {
	private docker: Dockerode;
	private cid: string;
	private _container: Dockerode.Container;

	constructor(docker: Dockerode, cid: string) {
		this.docker = docker;
		this.cid = cid;
		this._container = docker.getContainer(this.cid);
	}

	get container(): Dockerode.Container {
		return this._container;
	}

	/**
	 * Copy file/directory from host to container
	 * @param src the source file/directory (on host)
	 * @param dest the destination file/directory (on container, absolute or relative to workspace)
	 */
	async copy(src: string, dest: string): Promise<void> {
		const stream = tar.create({}, [src]);
		log({ stream });

		const res = await this.container.putArchive(stream, {
			path: path.resolve("/workspace", dest),
		});

		for await (const chunk of res) {
			// nothing, just consume the stream
		}
	}

	/**
	 * Pack the whole workspace into a tarball
	 * @param dest the destination of the tarball (on host)
	 * @param unpacked whether to unpack the tarball instead of storing it
	 */
	public async store(dest: string, unpacked = false): Promise<void> {
		const [exit, tarball, stderr] = await this.exec([
			"tar",
			"-C",
			"/workspace",
			"-cf",
			"-",
			".",
		]);
		log("tar exit", (await exit) ? "success" : stderr.toString());
		const buffer = tarball.toBuffer();

		if (!unpacked) {
			fs.writeFileSync(dest, buffer);
		} else {
			const tmp = path.join(
				os.tmpdir(),
				`cpta-${Date.now()}-${Math.random().toString(36).slice(2)}.tar`,
			);
			fs.writeFileSync(tmp, buffer);

			if (fs.existsSync(dest)) {
				fs.rmSync(dest, { recursive: true });
			}
			fs.mkdirSync(dest, { recursive: true });
			await tar.extract({ file: tmp, cwd: dest });
			fs.rmSync(tmp);
		}
	}

	/**
	 * Execute a command in the container
	 * @param cmd the command to execute
	 * @returns a tuple of exit code, stdout and stderr
	 */
	public async exec(
		cmd: string[],
	): Promise<[exit: Promise<number | null>, stdout: WritableStream, stderr: WritableStream]> {
		const exec = await this.container.exec({
			Cmd: cmd,
			AttachStdout: true,
			AttachStderr: true,
		});

		const duplex = await exec.start({});
		const stdout = new WritableStream();
		const stderr = new WritableStream();

		this.docker.modem.demuxStream(duplex, stdout, stderr);

		const exit = new Promise((resolve, reject) => {
			duplex.on("end", resolve);
			duplex.on("error", reject);
		})
			.then(() => exec.inspect())
			.then((info) => info.ExitCode);

		exit.finally(() => {
			stdout.end();
			stderr.end();
		});

		return [exit, stdout, stderr];
	}

	/**
	 * Destroy the environment
	 */
	public async destroy(): Promise<void> {
		await this.container.kill();
	}

	/**
	 * Create a new one-time-use environment
	 * @param docker dockerode instance
	 * @param image the image to use
	 */
	static async create(
		docker: Dockerode,
		image: string,
		opt: EnvironmentOptions = {},
	): Promise<Environment> {
		const restores = Array.isArray(opt.restore)
			? opt.restore
			: typeof opt.restore === "string"
			? [opt.restore]
			: [];
		for (let i = 0; i < restores.length; i++) {
			const restore = restores[i];
			if (!fs.existsSync(restore)) {
				throw new Error(`Restore path ${restore} does not exist`);
			}

			const stat = fs.statSync(restore);

			if (stat.isDirectory()) {
				// create a temporary tarball
				const tmp = path.join(
					os.tmpdir(),
					`cpta-${Date.now()}-${Math.random().toString(36).slice(2)}.tar`,
				);
				await tar.create({ file: tmp, cwd: restore }, ["."]);
				restores[i] = tmp;
			}
		}

		const container = await docker.createContainer({
			Image: image,
			HostConfig: {
				NetworkMode: "none",
				ReadonlyRootfs: true,
				CpuPeriod: 100000,
				CpuQuota: 100000,
				Memory: 1024 * 1024 * 1024,
				MemorySwap: 1024 * 1024 * 1024,
				Tmpfs: {
					"/workspace": "rw,exec,nodev,nosuid,size=1G",
					"/tmp": "rw,exec,nodev,nosuid,size=1G",
				},
				Binds: restores.map((restore, i) => `${restore}:/tmp/_workspace/${i}.tar:ro`),
				AutoRemove: true,
			},
			Cmd: ["/bin/bash", "-c", "while true; do sleep 10; done"],
			Hostname: "cp",
			WorkingDir: "/workspace",
			StopTimeout: 600,
		});
		log("created container", container.id);

		await container.start();
		log("started container", container.id);

		for (let i = 0; i < restores.length; i++) {
			const exec = await container.exec({
				Cmd: ["tar", "xf", `/tmp/_workspace/${i}.tar`, "-C", "/workspace"],
			});

			const duplex = await exec.start({});
			for await (const chunk of duplex) {
				// nothing, just consume the stream
			}
			log("restored workspace", i, container.id, restores[i]);
		}

		return new Environment(docker, container.id);
	}
}
