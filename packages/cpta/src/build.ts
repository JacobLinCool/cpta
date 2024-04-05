import { parse } from "dotenv";
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

	public env(): string[] {
		if (!this.dir) {
			return [];
		}

		const env = path.join(this.dir, ".env");
		if (!fs.existsSync(env)) {
			return [];
		}

		const data = fs.readFileSync(env, "utf8");
		const parsed = parse(data);
		return Object.entries(parsed).map(([key, value]) => `${key}=${value}`);
	}

	static from(dir: string): BuildConfig | null {
		if (!fs.existsSync(dir)) {
			return null;
		}
		const config = new BuildConfig(dir);
		return config;
	}
}
