import Dockerode from "dockerode";
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_IMAGE } from "../src/constants";
import { Environment } from "../src/environment";

describe("Environment", () => {
	const docker = new Dockerode();

	it("should be able to create an environment", async () => {
		const env = await Environment.create(docker, DEFAULT_IMAGE);
		expect(env).toBeDefined();

		const [exit, stdout, stderr] = await env.exec(["echo", "hello"]);
		expect(await exit).toBe(0);

		expect(stdout.toString()).toBe("hello\n");
		expect(stderr.toString()).toBe("");

		await env.destroy();
	});

	it("should be able to restore files to the environment", async () => {
		const env = await Environment.create(docker, DEFAULT_IMAGE, {
			restore: "packages/cpta/tests/fixtures/w",
		});

		const [exit, stdout, stderr] = await env.exec(["cat", "data.txt"]);
		expect(await exit).toBe(0);

		expect(stdout.toString()).toBe(
			fs.readFileSync("packages/cpta/tests/fixtures/w/data.txt", "utf-8"),
		);
		expect(stderr.toString()).toBe("");

		await env.destroy();
	});

	it("should be able to store workspace from the environment", async () => {
		const env = await Environment.create(docker, DEFAULT_IMAGE);

		const [exit] = await env.exec(["bash", "-c", "echo hi > data.txt"]);
		expect(await exit).toBe(0);

		await env.store("packages/cpta/tests/fixtures/o", true);

		await env.destroy();
	});
});
