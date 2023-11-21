export class HanoiSimulator {
	constructor(n) {
		this.n = n;
		this.stacks = [[], [], []];
		this.stacks[0] = Array.from({ length: n }, (_, i) => i + 1);
		this.moves = 0;
	}

	move(disk, to) {
		to = to - 1;

		// disk should be on top of a stack
		let from = -1;
		for (let i = 0; i < 3; i++) {
			if (this.stacks[i].length > 0 && this.stacks[i][0] === disk) {
				from = i;
				break;
			}
		}
		if (from === -1) {
			throw new Error(
				`Illegal move (${disk} -> ${to + 1}) detected at step ${
					this.moves
				}, disk ${disk} is not on top of any stack`,
			);
		}
		this.stacks[from].shift();

		if (this.stacks[to].length === 0 || this.stacks[to][0] > disk) {
			this.stacks[to].unshift(disk);
		} else {
			throw new Error(
				`Illegal move (${disk} -> ${to + 1}) detected at step ${
					this.moves
				}, cannot put disk ${disk} on top of disk ${this.stacks[to][0]} (stack ${to + 1})`,
			);
		}

		this.moves++;
	}

	done() {
		return (
			this.stacks[0].length === 0 &&
			((this.stacks[1].length === 0 && this.stacks[2].length === this.n) ||
				(this.stacks[1].length === this.n && this.stacks[2].length === 0))
		);
	}
}
