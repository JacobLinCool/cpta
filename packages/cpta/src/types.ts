import { SpecialExec } from "./special-exec";

export interface IWorkspace {
	dir: string;
}

export type ExecSpec = ([command: string[], stdin: string] | SpecialExec)[];
export type EvalSpec = "interactive" | ((stdout: string, stderr: string) => void | Promise<void>);

export interface Case {
	name: string;
	path: string;
	exec: ExecSpec;
	eval: EvalSpec;
}
