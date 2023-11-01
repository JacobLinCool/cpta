/** @type {import("cpta").EvalSpec} */
export default function (stdout, stderr) {
	if (stdout.includes("./mid05: no such file or directory")) {
		throw new Error("mid05 not found");
	}

	if (stdout.includes("passed")) {
		return;
	}

	throw new Error(stdout.trim() ? stdout : stderr);
}
