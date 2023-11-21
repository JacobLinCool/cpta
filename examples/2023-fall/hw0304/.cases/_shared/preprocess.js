export function preprocess(raw) {
	/** @type {string[]} */
	const lines = raw.trim().split("\n");
	while (/[：:]/.test(lines[0])) {
		const idx = lines[0].search(/[：:]/);
		lines[0] = lines[0].slice(idx + 1).trim();
		if (!lines[0]) {
			lines.shift();
		}
	}
	const commands = lines.map((line) => line.match(/\d+/g)?.map(Number));
	if (!commands) {
		throw new Error("Malformed output.");
	}

	for (const command of commands) {
		if (!command) {
			throw new Error("Malformed output.");
		}
		if (command.length === 3) {
			// move disk a from rod b to rod c
			command[1] = command[2];
			command.pop();
		}
		if (command.length !== 2) {
			throw new Error(
				`Malformed output: ${
					command.length > 50
						? command.slice(0, 30) + " ... " + command.slice(-20)
						: command
				}`,
			);
		}
	}

	return commands;
}
