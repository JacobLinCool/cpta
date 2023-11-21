import { preprocess } from "../_shared/preprocess.js";
import { HanoiSimulator } from "../_shared/simulator.js";

/** @type {import("cpta").EvalSpec} */
export default function (stdout, stderr) {
	if (stdout.includes("./hw0304-1: no such file or directory")) {
		throw new Error("hw0304-1 not found");
	}
	if (stderr.includes("timeout")) {
		throw new Error("Timeout");
	}

	const simulator = new HanoiSimulator(2);
	for (const command of preprocess(stdout)) {
		simulator.move(...command);
	}

	if (!simulator.done()) {
		throw new Error("Final state is not correct.");
	}
}
