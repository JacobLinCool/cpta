#!/usr/bin/env node

// src/postinstall.ts
import { $ } from "zx";

// src/constants.ts
var DEFAULT_IMAGE = "buildpack-deps:stable";

// src/postinstall.ts
post();
async function post() {
	if (!process.env.CPTA_SKIP_PULL) {
		await $`docker pull ${DEFAULT_IMAGE}`.nothrow();
	}
}
