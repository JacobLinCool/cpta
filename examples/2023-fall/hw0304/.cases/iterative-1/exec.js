import debug from "debug";
import fs from "node:fs";
import path from "node:path";
import { OpenAI } from "openai";

const log = debug("cpta:ext:llm-source-check");
log.enabled = true;

class LLMSourceCheck {
	openai = new OpenAI();

	constructor(file, criteria) {
		this.file = file;
		this.criteria = criteria;
	}

	async exec(in_dir, out_dir) {
		const fp = path.join(in_dir, this.file);
		if (!fs.existsSync(fp)) {
			fs.writeFileSync(
				path.join(out_dir, "llm-source-check.json"),
				JSON.stringify({ result: false, reason: "!File not found." }),
			);
			return;
		}
		const payload = {
			model: "gpt-4-1106-preview",
			max_tokens: 4096,
			temperature: 0,
			seed: 0,
			response_format: { type: "json_object" },
			messages: [
				{
					role: "system",
					content: `You should check the source code provided and make sure it meets the following criteria: ${this.criteria}. Answer in the json format: { result: boolean, reason: string }`,
				},
				{
					role: "user",
					content: fs.readFileSync(fp, "utf-8"),
				},
			],
		};
		log(payload);

		const res = await this.openai.chat.completions.create(payload);
		log(res);

		const result = res.choices[0].message.content;
		log(result);

		if (result) {
			fs.writeFileSync(path.join(out_dir, "llm-source-check.json"), result);
		}
	}
}

/** @type {import("cpta").ExecSpec} */
const exec = [
	[["./hw0304-2"], "2\n"],
	// new LLMSourceCheck("hw0304-2.c", 'Implement "iterative" version of Tower of Hanoi.'),
];

export default exec;
