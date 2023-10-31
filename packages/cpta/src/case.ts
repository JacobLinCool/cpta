import path from "node:path";
import type { Case } from "./types";

export async function case_from_dir(dir: string): Promise<Case> {
	dir = path.resolve(dir);
	const name = path.basename(dir);

	const exec = await import(path.join(dir, "exec.js")).then((m) => m.default);
	const eval_func = await import(path.join(dir, "spec.js")).then((m) => m.default);

	return {
		name,
		path: dir,
		exec,
		eval: eval_func,
	};
}
