import fs from "node:fs";
import path from "node:path";

export class BuildConfig {
	constructor(public readonly dir: string) {}

	public mountpoint(): string | null {
		const mountpoint = path.join(this.dir, "mount");
		if (!fs.existsSync(mountpoint)) {
			return null;
		}
		return mountpoint;
	}

	static from(dir: string): BuildConfig {
		if (!fs.existsSync(dir)) {
			throw new Error(`No build config found in ${dir}`);
		}
		const config = new BuildConfig(dir);
		return config;
	}
}
