/** @type {import("cpta").EvalSpec} */
export default function (stdout, stderr) {
	if (stdout.includes("./hw0203: no such file or directory")) {
		throw new Error("hw0203 not found");
	}

	const upper = stdout.toUpperCase();
	const passed =
		upper.includes("S0") &&
		upper.includes("S1") &&
		upper.includes("S2") &&
		upper.includes("S3") &&
		!upper.includes("S4") &&
		upper.includes("S5") &&
		upper.includes("S6");
	if (passed) {
		return;
	}

	throw new Error(
		"Output: " +
			(stdout.trim()
				? stdout.substring(Math.max(0, stdout.length - 1000))
				: stderr.substring(Math.max(0, stderr.length - 1000))),
	);
}
