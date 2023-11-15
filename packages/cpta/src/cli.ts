import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { $ } from "zx";
import { BuildConfig } from "./build";
import { get_cases } from "./case";
import { DEFAULT_IMAGE } from "./constants";
import { from_moodle } from "./ext/from-moodle";
import { pkg } from "./pkg";
import { generate_report } from "./report";
import { StageDir, checkout } from "./workspace";

const program = new Command(pkg.name).version(pkg.version).description(pkg.description);

program
	.command("from-moodle <moodle-archive>")
	.description("create a workspace from a Moodle archive file")
	.option("-o, --output [output-dir]", "Output directory", "./.works")
	.option("-c, --clean", "Clean output directory before creating workspaces")
	.action(async (archive, options) => {
		console.log("Creating workspaces from Moodle archive:", archive);

		if (options.clean) {
			fs.rmSync(options.output, { recursive: true, force: true });
		}

		await from_moodle(archive, options.output);
	});

program
	.command("make")
	.description("build all workspaces")
	.option("-w, --workspace [workspaces-dir]", "Workspace directory", "./.works")
	.option("-b, --build [build-dir]", "Build config directory", "./.build")
	.option("-f, --filter [filter]", "Filter workspaces by regular expression", ".*")
	.action(async (options) => {
		console.log("Building all workspaces in:", options.workspace);
		console.log("Build config directory:", options.build);
		console.log("Workspace Filter:", options.filter);

		const config = BuildConfig.from(options.build) ?? new BuildConfig();
		const workspaces = checkout(options.workspace, new RegExp(options.filter));

		const failed = new Map<string, string>();
		for (let i = 0; i < workspaces.length; i++) {
			const workspace = workspaces[i];
			try {
				await workspace.make({ config, force: true });
			} catch (e) {
				console.error(e);
				if (e instanceof Error) {
					failed.set(workspace.dir, e.message);
				}
			} finally {
				console.log(`Built ${workspace.name}, ${i + 1}/${workspaces.length}`);
			}
		}

		if (failed.size > 0) {
			console.log("=".repeat(80));
			console.log("Failed to build the following workspaces:");
			for (const [dir, err] of failed) {
				console.group(dir);
				console.log(err);
				console.groupEnd();
			}
		}
	});

program
	.command("exec")
	.description("execute all targets in the workspaces")
	.option("-w, --workspace [workspaces-dir]", "Workspace directory", "./.works")
	.option("-c, --case [cases-dir]", "Case directory", "./.cases")
	.option("-f, --filter [filter]", "Filter workspaces by regular expression", ".*")
	.action(async (options) => {
		console.log("Executing all targets in:", options.workspace);
		console.log("Case directory:", options.case);
		console.log("Workspace Filter:", options.filter);

		const workspaces = checkout(options.workspace, new RegExp(options.filter));
		const cases = await get_cases(options.case);

		for (let i = 0; i < workspaces.length; i++) {
			const workspace = workspaces[i];
			console.group(workspace.name);
			for (const c of cases.values()) {
				console.log(`Executing ${c.name}`);
				await workspace.exec(c, { force: true });
			}
			console.log(`Executed all cases for ${workspace.name}, ${i + 1}/${workspaces.length}`);
			console.groupEnd();
		}
	});

program
	.command("eval")
	.description("evaluate all targets in the workspaces according to specifications")
	.option("-w, --workspace [workspaces-dir]", "Workspace directory", "./.works")
	.option("-c, --case [cases-dir]", "Case directory", "./.cases")
	.option("-f, --filter [filter]", "Filter workspaces by regular expression", ".*")
	.action(async (options) => {
		console.log("Evaluating all targets in:", options.workspace);
		console.log("Case directory:", options.case);
		console.log("Workspace Filter:", options.filter);

		const workspaces = checkout(options.workspace, new RegExp(options.filter));
		const cases = await get_cases(options.case);

		const result = new Map<string, Map<string, [passed: boolean, detail: string]>>();

		for (let i = 0; i < workspaces.length; i++) {
			const workspace = workspaces[i];
			for (const c of cases.values()) {
				const res = await workspace.eval(c);
				if (!result.has(workspace.name)) {
					result.set(
						workspace.name,
						new Map<string, [passed: boolean, detail: string]>(),
					);
				}
				result.get(workspace.name)?.set(c.name, res);
			}
			console.log(`Evaluated ${workspace.name}, ${i + 1}/${workspaces.length}`);

			if (fs.existsSync(path.join(workspace.dir, StageDir.Result))) {
				fs.rmSync(path.join(workspace.dir, StageDir.Result), {
					recursive: true,
					force: true,
				});
			}
			fs.mkdirSync(path.join(workspace.dir, StageDir.Result), { recursive: true });
			const fp = path.join(workspace.dir, StageDir.Result, "result.json");
			const json = JSON.stringify(
				Array.from(result.get(workspace.name)?.entries() ?? []),
				null,
				4,
			);
			fs.writeFileSync(fp, json);
		}

		console.log("=".repeat(80));
		console.log("Failed cases:");
		for (const [workspace, cases] of result) {
			console.group(workspace);
			for (const [c, [passed, detail]] of cases) {
				if (!passed) {
					console.log(c);
					console.log(detail);
				}
			}
			console.groupEnd();
		}
	});

program
	.command("report")
	.argument("[students]", "Student list file", "./students.csv")
	.option("-w, --workspace [workspaces-dir]", "Workspace directory", "./.works")
	.option("-o, --output [output-file]", "Output file", "./report.xlsx")
	.description("generate a report from the workspaces")
	.action(async (csv, options) => {
		console.log("Making report from workspaces");

		const students = fs
			.readFileSync(csv, "utf-8")
			.split("\n")
			.map((line) => line.split(",")[0].trim())
			.filter((line) => line.length > 0);
		const report = await generate_report(students, options.workspace);

		XLSX.writeFile(report, options.output);
	});

program
	.command("dive")
	.description("dive into the workspaces within the container environment")
	.option("-w, --workspace [workspaces-dir]", "Workspace directory", "./.works")
	.option("-h, --harden", "Harden the container")
	.action(async (options) => {
		console.log("Diving into workspaces in container");
		if (!options.harden) {
			await $`docker run -it --rm -v ${options.workspace}:/works -w /works ${DEFAULT_IMAGE} bash`.nothrow();
		} else {
			await $`docker run -it --rm --network none --read-only --cpu-period 100000 --cpu-quota 100000 --memory 1G --memory-swap 1G --tmpfs /tmp -w /works -v ${options.workspace}:/works ${DEFAULT_IMAGE} bash`.nothrow();
		}
		console.log("Exited container");
	});

export { program };
