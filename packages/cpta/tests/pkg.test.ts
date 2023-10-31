import { expect, it } from "vitest";
import _package from "../package.json";
import { pkg } from "../src/pkg";

it("version", () => {
	expect(pkg.version).toBe(_package.version);
});
