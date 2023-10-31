import { Command } from "commander";
import fs from "node:fs";
import { $ } from "zx";
import { DEFAULT_IMAGE } from "./constants";
import { from_moodle } from "./ext/from-moodle";
import { make_all } from "./make";
import { pkg } from "./pkg";

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
	.action(async (options) => {
		console.log("Building all workspaces in:", options.workspace);

		const failed = await make_all(options.workspace);

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
	.option("-i, --input [input-dir]", "Input directory", "./.inputs")
	.action((options) => {
		console.log("Executing all targets in:", options.workspace);
		console.log("Input directory:", options.input);
		throw new Error("Not implemented");
	});

program
	.command("eval")
	.description("evaluate all targets in the workspaces according to specifications")
	.option("-w, --workspace [workspaces-dir]", "Workspace directory", "./.works")
	.option("-s, --spec [spec-dir]", "Specification directory", "./.specs")
	.action((options) => {
		console.log("Evaluating all targets in:", options.workspace);
		console.log("Specification directory:", options.spec);
		throw new Error("Not implemented");
	});

program
	.command("report")
	.description("generate a report from the workspaces")
	.action(() => {
		console.log("Making report from workspaces");
		throw new Error("Not implemented");
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
