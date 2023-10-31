import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

export async function generate_report(
	students: string[],
	workspaces: string,
): Promise<XLSX.WorkBook> {
	const dirs = fs
		.readdirSync(workspaces, { withFileTypes: true })
		.filter((dir) => dir.isDirectory() && !dir.name.startsWith("."));

	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.aoa_to_sheet([["Student", "Score", "Message"]]);
	XLSX.utils.book_append_sheet(wb, ws, "Report");

	for (const student of students) {
		try {
			const dir = dirs.find((dir) => dir.name.includes(student));
			if (!dir) {
				throw new Error();
			}

			const json = path.join(workspaces, dir.name, "3-result", "result.json");
			if (!fs.existsSync(json)) {
				throw new Error();
			}

			const result: [id: string, [passed: boolean, detail: string]][] = JSON.parse(
				fs.readFileSync(
					path.join(workspaces, dir.name, "3-result", "result.json"),
					"utf-8",
				),
			);

			const score = result.reduce((acc, [id, [passed, detail]]) => {
				return acc + (passed ? 1 : 0);
			}, 0);

			const passed = result.filter(([id, [passed, detail]]) => passed);
			const failed = result.filter(([id, [passed, detail]]) => !passed);

			const message = `passed: ${
				passed.length ? passed.map((p) => p[0]).join(", ") : "none"
			}\nfailed: \n${
				failed.length
					? failed.map(([id, [passed, detail]]) => `  ${id}\n    ${detail}`).join("\n")
					: "none"
			}`;

			XLSX.utils.sheet_add_aoa(ws, [[student, score, message]], { origin: -1 });
		} catch {
			XLSX.utils.sheet_add_aoa(ws, [[student, 0, ""]], { origin: -1 });
		}
	}

	return wb;
}
