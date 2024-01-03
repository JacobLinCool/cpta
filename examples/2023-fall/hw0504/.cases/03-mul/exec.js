/** @type {import("cpta").ExecSpec} */
const exec = [
	[
		["./hw0504"],
		[
			[0x01, 0x03, 0x00, 0x01, 0x05, 0x00],
			[0x03, 0x03, 0x00, 0x03, 0x02, 0x01],
			[0x09, 0x00, 0x00],
			0xff,
		]
			.flat()
			.map((x) => "0x" + x.toString(16).padStart(2, "0"))
			.join(" ") + "\n",
	],
];

export default exec;
