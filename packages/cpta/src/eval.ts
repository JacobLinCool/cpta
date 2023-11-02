import fs from "node:fs";
import path from "node:path";
import { case_from_dir } from "./case";
import type { Case, Workspace } from "./types";

export async function eval_all(
	workspaces: string,
	case_dir: string,
): Promise<Map<string, Map<string, [passed: boolean, detail: string]>>> {
	const result = new Map<string, Map<string, [passed: boolean, detail: string]>>();

	const cases = await get_cases(case_dir);

	const dirs = fs
		.readdirSync(workspaces, { withFileTypes: true })
		.filter((dir) => dir.isDirectory() && !dir.name.startsWith("."));
	for (let i = 0; i < dirs.length; i++) {
		const dir = dirs[i];
		const workspace = { dir: path.resolve(workspaces, dir.name) };
		for (const c of cases.values()) {
			const res = await eval_case(workspace, c);
			if (!result.has(path.basename(workspace.dir))) {
				result.set(
					path.basename(workspace.dir),
					new Map<string, [passed: boolean, detail: string]>(),
				);
			}
			result.get(path.basename(workspace.dir))?.set(c.name, res);
		}
		console.log(`Evaluated ${path.basename(workspace.dir)}, ${i + 1}/${dirs.length}`);

		if (fs.existsSync(path.join(workspace.dir, "3-result"))) {
			fs.rmSync(path.join(workspace.dir, "3-result"), { recursive: true, force: true });
		}
		fs.mkdirSync(path.join(workspace.dir, "3-result"), { recursive: true });
		const fp = path.join(workspace.dir, "3-result", "result.json");
		const json = JSON.stringify(
			Array.from(result.get(path.basename(workspace.dir))?.entries() ?? []),
			null,
			4,
		);
		fs.writeFileSync(fp, json);
	}

	return result;
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

async function eval_case(
	workspace: Workspace,
	c: Case,
): Promise<[passed: boolean, detail: string]> {
	const out_dir = path.join(workspace.dir, "2-output", c.name);
	if (!fs.existsSync(out_dir)) {
		return [false, "No output directory"];
	}

	try {
		const stdout = fs.readFileSync(path.join(out_dir, "stdout.log"), "utf-8");
		const stderr = fs.readFileSync(path.join(out_dir, "stderr.log"), "utf-8");

		if (c.eval === "interactive") {
			console.log("=".repeat(80));
			console.log(`${path.basename(workspace.dir)}: ${c.name}`);
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
