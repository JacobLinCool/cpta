/** @type {import("cpta").EvalSpec} */
export default function (stdout, stderr) {
	if (stdout.includes("./hw0504: no such file or directory")) {
		throw new Error("hw0504 not found");
	}

	stdout = stdout.trim();
	stderr = stderr.trim();
	const number = stdout.match(/\d+/);
	const expected = 327160;

	if (parseInt(number) === expected) {
		return;
	}

	throw new Error(stdout ? `expected ${expected}, got ${number}` : stderr || "no output");
}
