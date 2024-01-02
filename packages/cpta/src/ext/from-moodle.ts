import { fileTypeFromFile } from "file-type";
import fs from "node:fs";
import path from "node:path";
import { $ } from "zx";

/**
 * Extracts the contents of a Moodle archive to a specified directory.
 * @param archive - The path to the Moodle archive.
 * @param outdir - The path to the output directory.
 */
export async function from_moodle(archive: string, outdir: string) {
	await $`unzip ${archive} -d ${outdir}`;
	const students = remove_suffix(outdir);
	const contents = await unzip(outdir, students);
	hoist(contents);
	await cleanup(contents);
}

/**
 * Removes the suffix "_<number>_assignsubmission_file_" from all directories in the given path.
 * @param out - The path to the directory containing the directories to be renamed.
 * @returns An array of strings representing the names of the directories in the given path after renaming.
 */
function remove_suffix(out: string) {
	const regex = /_\d+_assignsubmission_file_[^.]*/;
	const dirs = fs.readdirSync(out);
	for (const dir of dirs) {
		const p = path.resolve(out, dir);
		const is_dir = fs.statSync(p).isDirectory();
		if (is_dir) {
			if (dir.match(regex)) {
				fs.renameSync(p, path.resolve(out, dir.replace(regex, "")));
			}
		} else {
			const d = path.resolve(out, path.basename(p, path.extname(p)));
			fs.mkdirSync(d);
			fs.renameSync(p, path.resolve(d, path.basename(p)));
		}
	}

	return fs.readdirSync(out);
}

/**
 * Unzips the files in the specified directories and extracts them to the "0-raw" subdirectory.
 * @param out - The output directory to extract the files to.
 * @param dirs - An array of directories containing the files to extract.
 * @returns An array of paths to the extracted files.
 */
async function unzip(out: string, dirs: string[]) {
	for (let i = 0; i < dirs.length; i++) {
		const dir = dirs[i];
		const p = path.resolve(out, dir);
		const files = fs.readdirSync(p);
		for (const file of files) {
			const fp = path.resolve(p, file);
			await $`ditto -x -k --sequesterRsrc ${fp} ${path.resolve(p, "0-raw")}`.quiet();
		}
		console.log(`Unzipped ${dir}, ${i + 1}/${dirs.length}`);
	}

	return dirs.map((dir) => path.resolve(out, dir, "0-raw"));
}

/**
 * Hoists the contents of an array of strings.
 * @param contents An array of strings to hoist.
 */
function hoist(contents: string[]) {
	for (const content of contents) {
		try_hoist(content);
	}
}

/**
 * Recursively hoists a directory if it only contains one subdirectory.
 * If the directory is hoisted, all files and directories within the subdirectory
 * are moved to the parent directory, and the subdirectory is deleted.
 * @param dir - The directory to attempt to hoist.
 */
function try_hoist(dir: string) {
	if (!fs.statSync(dir).isDirectory()) {
		return;
	}
	const files = fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((file) => !file.name.startsWith(".") && !file.name.startsWith("_"));
	if (files.length === 1) {
		try_hoist(path.resolve(dir, files[0].name));
		console.log(`Hoisting ${dir}`);
		const fp = path.resolve(dir, files[0].name);
		const stats = fs.statSync(fp);

		if (stats.isDirectory()) {
			console.group();
			const inners = fs.readdirSync(fp);
			for (const inner of inners) {
				// check if the destination path already exists, and if it does, append a suffix
				const new_dest = path.resolve(dir, inner);
				let safe_dest = new_dest;
				let counter = 1;
				while (fs.existsSync(safe_dest)) {
					safe_dest = `${new_dest}_${counter}`;
					counter++;
				}
				fs.renameSync(path.resolve(fp, inner), safe_dest);
				console.log(`Moved ${path.resolve(fp, inner)} to ${safe_dest}`);
			}
			fs.rmdirSync(fp);
			console.groupEnd();
		}
	}
}

/**
 * Removes all ELF (unix executable or linkable) and EXE (windows executable) files from the specified directories.
 * @param contents An array of directory paths to clean up.
 */
async function cleanup(contents: string[]) {
	for (const content of contents) {
		const files = fs.readdirSync(content).filter((file) => !file.startsWith("."));
		for (const file of files) {
			const fp = path.resolve(content, file);
			if (fs.statSync(fp).isFile()) {
				const type = await fileTypeFromFile(fp);
				if (
					type?.ext === "elf" ||
					type?.ext === "exe" ||
					(type === undefined && is_macho(fp))
				) {
					fs.unlinkSync(fp);
					console.log(`Removed ${fp}`);
				}
			}
		}
	}
}

// workaround until https://github.com/sindresorhus/file-type/pull/615 is merged
function is_macho(file: string) {
	const fd = fs.openSync(file, "r");
	const buf = Buffer.alloc(4);
	fs.readSync(fd, buf, 0, 4, 0);
	fs.closeSync(fd);
	return buf.toString("hex") === "cffaedfe";
}
