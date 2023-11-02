import { Command } from "commander";
import fs from "node:fs";
import * as XLSX from "xlsx";
import { $ } from "zx";
import { DEFAULT_IMAGE } from "./constants";
import { eval_all } from "./eval";
import { exec_all } from "./exec";
import { from_moodle } from "./ext/from-moodle";
import { make_all } from "./make";
import { pkg } from "./pkg";
import { generate_report } from "./report";

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
	.action(async (options) => {
		console.log("Building all workspaces in:", options.workspace);
		console.log("Build config directory:", options.build);

		const failed = await make_all(options.workspace, options.build);

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
	.action(async (options) => {
		console.log("Executing all targets in:", options.workspace);
		console.log("Case directory:", options.case);
		await exec_all(options.workspace, options.case);
	});

program
	.command("eval")
	.description("evaluate all targets in the workspaces according to specifications")
	.option("-w, --workspace [workspaces-dir]", "Workspace directory", "./.works")
	.option("-c, --case [cases-dir]", "Case directory", "./.cases")
	.action(async (options) => {
		console.log("Evaluating all targets in:", options.workspace);
		console.log("Case directory:", options.case);
		const result = await eval_all(options.workspace, options.case);
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
