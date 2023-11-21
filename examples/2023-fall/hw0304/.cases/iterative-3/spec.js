import { preprocess } from "../_shared/preprocess.js";
import { HanoiSimulator } from "../_shared/simulator.js";

/** @type {import("cpta").EvalSpec} */
export default function (stdout, stderr) {
	if (stdout.includes("./hw0304-2: no such file or directory")) {
		throw new Error("hw0304-2 not found");
	}
	if (stderr.includes("timeout")) {
		throw new Error("Timeout");
	}

	const simulator = new HanoiSimulator(20);
	for (const command of preprocess(stdout)) {
		simulator.move(...command);
	}

	if (!simulator.done()) {
		throw new Error("Final state is not correct.");
	}
}
