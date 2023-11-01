#!/usr/bin/env node
import { $ } from "zx";
import { DEFAULT_IMAGE } from "./constants";

post();

async function post() {
	// try to pull the default image
	if (!process.env.CPTA_SKIP_PULL) {
		await $`docker pull ${DEFAULT_IMAGE}`.nothrow();
	}
}
