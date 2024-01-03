/** @type {import("cpta").ExecSpec} */
const exec = [
	[
		["./hw0504"],
		[
			[0x01, 0x04, 0x00, 0x02, 0x00, 0x02, 0x04],
			[0x0b, 0x00, 0x01, ...[...Array(0x100).keys()].map((x) => x % 0xff)],
			[0x09, 0x00, 0x00],
			0xff,
		]
			.flat()
			.map((x) => "0x" + x.toString(16).padStart(2, "0"))
			.join(" ") + "\n",
	],
];

export default exec;
