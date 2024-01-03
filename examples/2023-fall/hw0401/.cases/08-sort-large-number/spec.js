/** @type {import("cpta").EvalSpec} */
export default function (stdout, stderr) {
	if (stdout.includes("./hw0401: no such file or directory")) {
		throw new Error("hw0401 not found");
	}

	if (stdout.includes("passed")) {
		return;
	}

	throw new Error(stdout.trim() ? stdout : stderr);
}
