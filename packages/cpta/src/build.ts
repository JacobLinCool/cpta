import fs from "node:fs";
import path from "node:path";

export class BuildConfig {
	constructor(public readonly dir?: string) {}

	public mountpoint(): string | null {
		if (!this.dir) {
			return null;
		}

		const mountpoint = path.join(this.dir, "mount");
		if (!fs.existsSync(mountpoint)) {
			return null;
		}

		return mountpoint;
	}

	static from(dir: string): BuildConfig | null {
		if (!fs.existsSync(dir)) {
			return null;
		}
		const config = new BuildConfig(dir);
		return config;
	}
}
