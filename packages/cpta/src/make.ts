import Dockerode from "dockerode";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_IMAGE } from "./constants";
import { Environment } from "./environment";
import { Workspace } from "./types";

export async function make_all(
	workspaces: string,
	build_config: string,
): Promise<Map<string, string>> {
	const failed = new Map<string, string>();

	const dirs = fs
		.readdirSync(workspaces, { withFileTypes: true })
		.filter((dir) => dir.isDirectory() && !dir.name.startsWith("."));
	for (let i = 0; i < dirs.length; i++) {
		const dir = dirs[i];
		const workspace = { dir: path.resolve(workspaces, dir.name) };
		try {
			await make(workspace, build_config);
		} catch (e) {
			console.error(e);
			if (e instanceof Error) {
				failed.set(workspace.dir, e.message);
			}
		} finally {
			console.log(`Built ${dir.name}, ${i + 1}/${dirs.length}`);
		}
	}

	return failed;
}

export async function make(workspace: Workspace, build_config: string): Promise<void> {
	const raw_dir = path.join(workspace.dir, "0-raw");
	if (!fs.existsSync(raw_dir)) {
		throw new Error(`No raw directory found in ${workspace.dir}`);
	}

	const restores = [raw_dir];
	if (build_config && fs.existsSync(path.join(build_config, "mount"))) {
		restores.push(path.join(build_config, "mount"));
	}

	const docker = new Dockerode();
	const env = await Environment.create(docker, DEFAULT_IMAGE, {
		restore: restores,
	});

	try {
		const [exit, stdout, stderr] = await env.exec(["make"]);
		if (await exit) {
			throw new Error(stderr.toString());
		}
	} finally {
		const build_dir = path.join(workspace.dir, "1-build");
		if (fs.existsSync(build_dir)) {
			fs.rmSync(build_dir, { recursive: true });
		}

		await env.store(build_dir, true);
		await env.destroy();
	}
}
