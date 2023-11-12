import fs from "node:fs";
import path from "node:path";
import type { Case } from "./types";

export async function case_from_dir(case_dir: string): Promise<Case> {
	case_dir = path.resolve(case_dir);
	const name = path.basename(case_dir);

	const exec = await import(path.join(case_dir, "exec.js")).then((m) => m.default);
	const eval_func = await import(path.join(case_dir, "spec.js")).then((m) => m.default);

	return {
		name,
		path: case_dir,
		exec,
		eval: eval_func,
	};
}

export async function get_cases(cases_dir: string): Promise<Map<string, Case>> {
	const cases = new Map<string, Case>();
	const dirs = fs.readdirSync(cases_dir, { withFileTypes: true });
	for (const dir of dirs) {
		if (dir.isDirectory()) {
			const c = await case_from_dir(path.join(cases_dir, dir.name));
			cases.set(c.name, c);
		}
	}
	return cases;
}
