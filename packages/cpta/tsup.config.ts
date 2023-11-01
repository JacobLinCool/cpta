import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";

export default defineConfig(() => ({
	entry: ["src/index.ts", "src/lib.ts", "src/postinstall.ts"],
	outDir: "dist",
	target: "node16",
	format: ["esm"],
	shims: true,
	clean: true,
	splitting: false,
	dts: true,
	onSuccess: async () => {
		const src = path.join("dist", "postinstall.js");
		const dest = path.join("scripts", "postinstall.js");
		fs.copyFileSync(src, dest);
		fs.chmodSync(dest, 0o755);
	},
}));
