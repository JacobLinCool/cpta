import Dockerode from "dockerode";
import fs from "node:fs";
import path from "node:path";
import { case_from_dir } from "./case";
import { DEFAULT_IMAGE } from "./constants";
import { Environment } from "./environment";
import type { Case, Workspace } from "./types";

export async function exec_all(workspaces: string, case_dir: string): Promise<void> {
	const cases = await get_cases(case_dir);

	const dirs = fs
		.readdirSync(workspaces, { withFileTypes: true })
		.filter((dir) => dir.isDirectory() && !dir.name.startsWith("."));
	for (let i = 0; i < dirs.length; i++) {
		const dir = dirs[i];
		const workspace = { dir: path.resolve(workspaces, dir.name) };
		console.group(path.basename(workspace.dir));
		for (const c of cases.values()) {
			console.log(`Executing ${c.name}`);
			await exec(workspace, c);
		}
		console.log(
			`Executed all cases for ${path.basename(workspace.dir)}, ${i + 1}/${dirs.length}`,
		);
		console.groupEnd();
	}
}

async function get_cases(case_dir: string): Promise<Map<string, Case>> {
	const cases = new Map<string, Case>();
	const dirs = fs.readdirSync(case_dir, { withFileTypes: true });
	for (const dir of dirs) {
		if (dir.isDirectory()) {
			const c = await case_from_dir(path.join(case_dir, dir.name));
			cases.set(c.name, c);
		}
	}
	return cases;
}

async function exec(workspace: Workspace, c: Case): Promise<void> {
	const docker = new Dockerode();

	const restores = [path.join(workspace.dir, "1-build")];
	if (fs.existsSync(path.join(c.path, "mount"))) {
		restores.push(path.join(c.path, "mount"));
	}

	const env = await Environment.create(docker, DEFAULT_IMAGE, {
		restore: restores,
	});

	const out_dir = path.join(workspace.dir, "2-output", c.name);
	if (fs.existsSync(out_dir)) {
		fs.rmSync(out_dir, { recursive: true, force: true });
	}
	fs.mkdirSync(out_dir, { recursive: true });

	try {
		const out = fs.createWriteStream(path.join(out_dir, "stdout.log"));
		const err = fs.createWriteStream(path.join(out_dir, "stderr.log"));

		for (const [command, stdin] of c.exec) {
			const [exit, stdout, stderr] = await env.exec(command, stdin);
			const code = await exit;
			out.write(stdout.toString() + "\n");

			if (code !== 0) {
				err.write(`Received non-zero exit code: ${code}\n`);
			}
			err.write(stderr.toString() + "\n");
		}

		out.close();
		err.close();
	} finally {
		await env.destroy();
	}
}
