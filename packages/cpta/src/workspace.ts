import Dockerode from "dockerode";
import fs from "node:fs";
import path from "node:path";
import type { BuildConfig } from "./build";
import { DEFAULT_IMAGE } from "./constants";
import { Environment } from "./environment";
import type { Case } from "./types";

/**
 * Represents the different stages of a process.
 */
export enum Stage {
	None = -1,
	Raw,
	Build,
	Output,
	Result,
}

/**
 * Represents the different stage output directory.
 */
export enum StageDir {
	Raw = "0-raw",
	Build = "1-build",
	Output = "2-output",
	Result = "3-result",
}

export class StageError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "StageError";
	}
}

/**
 * Represents a workspace, which is a directory containing staged artifacts.
 */
export class Workspace {
	/**
	 * The directory path of the workspace.
	 */
	public readonly dir: string;

	constructor(dir: string) {
		this.dir = dir;
	}

	/**
	 * The name (id) of the workspace.
	 */
	get name(): string {
		return path.basename(this.dir);
	}

	/**
	 * Returns the current stage of the workspace.
	 * @returns {Stage} The current stage of the workspace.
	 */
	public stage(): Stage {
		if (fs.existsSync(path.join(this.dir, StageDir.Result))) {
			return Stage.Result;
		}
		if (fs.existsSync(path.join(this.dir, StageDir.Output))) {
			return Stage.Output;
		}
		if (fs.existsSync(path.join(this.dir, StageDir.Build))) {
			return Stage.Build;
		}
		if (fs.existsSync(path.join(this.dir, StageDir.Raw))) {
			return Stage.Raw;
		}
		return Stage.None;
	}

	/**
	 * Builds the workspace.
	 * @param force - Whether to force the build even if it has already been built.
	 * @param config - The build configuration to use.
	 */
	public async make({
		force = false,
		config = undefined as BuildConfig | undefined,
	} = {}): Promise<void> {
		if (this.stage() < Stage.Raw) {
			throw new StageError("stage is not ready for make");
		}
		if (this.stage() >= Stage.Build && !force) {
			return;
		}

		const in_dir = path.join(this.dir, StageDir.Raw);
		const out_dir = path.join(this.dir, StageDir.Build);

		const restores = [in_dir];
		const mountpoint = config?.mountpoint();
		if (mountpoint) {
			restores.push(mountpoint);
		}

		const docker = new Dockerode();
		const env = await Environment.create(docker, DEFAULT_IMAGE, {
			restore: restores,
		});

		try {
			const [exit, stdout, stderr] = await env.exec(["make"]);
			let exited = false;
			exit.finally(() => (exited = true));
			// timeout: 30s
			let timer: NodeJS.Timeout | null = null;
			const timeout = new Promise<"timeout" | null>((resolve) => {
				timer = setTimeout(async () => {
					if (exited) {
						resolve(null);
					} else {
						resolve("timeout");
					}
				}, 30 * 1000);
			});

			const code = await Promise.race([exit, timeout]);
			if (timer) {
				clearTimeout(timer);
			}
			if (code === "timeout") {
				throw new Error("Killed due to timeout.");
			} else if (await exit) {
				throw new Error(stderr.toString());
			}
		} finally {
			if (fs.existsSync(out_dir)) {
				fs.rmSync(out_dir, { recursive: true });
			}

			await env.store(out_dir, true);
			await env.destroy();
		}
	}

	/**
	 * Executes the given case by running its commands in a container.
	 * @param c The case to execute.
	 * @param options An optional object containing additional options for the execution.
	 * @param options.force If true, forces the execution even if the output directory already exists.
	 * @throws If the workspace is not ready for execution. See {@link StageError}.
	 * @returns A Promise that resolves when the execution is complete.
	 */
	public async exec(c: Case, { force = false } = {}): Promise<void> {
		if (this.stage() < Stage.Build) {
			throw new StageError("stage is not ready for exec");
		}
		if (this.stage() >= Stage.Output && !force) {
			return;
		}

		const docker = new Dockerode();

		const restores = [path.join(this.dir, StageDir.Build)];
		if (fs.existsSync(path.join(c.path, "mount"))) {
			restores.push(path.join(c.path, "mount"));
		}

		const env = await Environment.create(docker, DEFAULT_IMAGE, {
			restore: restores,
		});

		const out_dir = path.join(this.dir, StageDir.Output, c.name);
		if (fs.existsSync(out_dir)) {
			fs.rmSync(out_dir, { recursive: true, force: true });
		}
		fs.mkdirSync(out_dir, { recursive: true });

		try {
			const out = fs.createWriteStream(path.join(out_dir, "stdout.log"));
			const err = fs.createWriteStream(path.join(out_dir, "stderr.log"));

			for (const exec of c.exec) {
				if ("exec" in exec) {
					await exec.exec(path.join(this.dir, StageDir.Build), out_dir);
				} else {
					const [command, stdin] = exec;
					const [exit, stdout, stderr] = await env.exec(command, stdin);
					let exited = false;
					exit.finally(() => (exited = true));

					// timeout: 30s
					let timer: NodeJS.Timeout | null = null;
					const timeout = new Promise<"timeout" | null>((resolve) => {
						timer = setTimeout(async () => {
							if (exited) {
								resolve(null);
							} else {
								resolve("timeout");
							}
						}, 30 * 1000);
					});

					const code = await Promise.race([exit, timeout]);
					if (timer) {
						clearTimeout(timer);
					}
					if (code === "timeout") {
						err.write(`Killed due to timeout.\n`);
					} else {
						out.write(stdout.toString() + "\n");

						if (code !== 0) {
							err.write(`Received non-zero exit code: ${code}\n`);
						}
						err.write(stderr.toString() + "\n");
					}
				}
			}

			out.close();
			err.close();
		} finally {
			await env.destroy();
		}
	}

	/**
	 * Evaluates the output of a test case.
	 * @param c The test case to evaluate.
	 * @param options Additional options for evaluation.
	 * @throws If the workspace is not ready for evaluation. See {@link StageError}.
	 * @returns A Promise that resolves to a tuple containing a boolean indicating whether the test passed and a message describing the result.
	 */
	public async eval(c: Case, {} = {}): Promise<[passed: boolean, message: string]> {
		if (this.stage() < Stage.Output) {
			throw new StageError("stage is not ready for eval");
		}

		const out_dir = path.join(this.dir, StageDir.Output, c.name);
		if (!fs.existsSync(out_dir)) {
			return [false, "No output directory"];
		}

		try {
			const stdout = fs.readFileSync(path.join(out_dir, "stdout.log"), "utf-8");
			const stderr = fs.readFileSync(path.join(out_dir, "stderr.log"), "utf-8");

			if (c.eval === "interactive") {
				console.log("=".repeat(80));
				console.log(`${path.basename(this.dir)}: ${c.name}`);
				console.log("-".repeat(80));
				console.log(stdout);
				console.log("-".repeat(80));
				console.log(`Press 'p' to pass, 'f' to fail.`);
				process.stdin.resume();
				process.stdin.setRawMode(true);
				const result = await new Promise<[boolean, string]>((resolve) => {
					process.stdin.on("data", (chunk) => {
						const char = chunk.toString();
						if (char === "p" || char === "P") {
							resolve([true, ""]);
						} else if (char === "f" || char === "F") {
							resolve([false, ""]);
						}
					});
				});
				process.stdin.setRawMode(false);
				process.stdin.pause();

				if (result[0] === false) {
					console.log("Write the reason why it failed, then press enter.");
					process.stdin.resume();
					result[1] = await new Promise<string>((resolve) => {
						process.stdin.on("data", (chunk) => {
							resolve(chunk.toString());
						});
					});
					process.stdin.pause();
				}

				return result;
			} else {
				await c.eval(stdout, stderr);
				return [true, ""];
			}
		} catch (err) {
			if (err instanceof Error) {
				return [false, err.message.trim()];
			}
			return [false, "Unknown error"];
		}
	}
}

/**
 * Returns an array of {@link Workspace} for each directory in the specified path.
 * Throws an error if the path does not exist.
 * @param dir The path to search for workspaces.
 * @param filter An optional regular expression to filter the workspace directories.
 * @returns An array of {@link Workspace}.
 */
export function checkout(dir: string, filter = /./): Workspace[] {
	if (!fs.existsSync(dir)) {
		throw new Error(`No such directory: ${dir}`);
	}

	const dirs = fs
		.readdirSync(dir, { withFileTypes: true })
		.filter(
			(dir) =>
				dir.isDirectory() &&
				!dir.name.startsWith(".") &&
				!dir.name.startsWith("_") &&
				filter.test(dir.name),
		)
		.sort((a, b) => a.name.localeCompare(b.name));

	return dirs.map((d) => new Workspace(path.join(dir, d.name)));
}
