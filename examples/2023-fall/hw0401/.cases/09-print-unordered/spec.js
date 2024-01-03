/** @type {import("cpta").EvalSpec} */
export default function (stdout, stderr) {
	if (stdout.includes("./hw0401: no such file or directory")) {
		throw new Error("hw0401 not found");
	}

	const numbers = stdout.trim().match(/\d+/g);
	if (!numbers) {
		throw new Error("No numbers found");
	}

	const n = numbers.map(Number);
	const ans = [2, 5, 4, 3, 6, 1];

	let same = true;
	for (let i = 0; i < n.length; i++) {
		if (n[i] !== ans[i]) {
			same = false;
			break;
		}
	}

	if (same) {
		return;
	}

	throw new Error(`Expected: ${ans.join(" ")}, got: ${n.join(" ")}`);
}
