export interface IWorkspace {
	dir: string;
}

export type ExecSpec = [command: string[], stdin: string][];
export type EvalSpec = "interactive" | ((stdout: string, stderr: string) => void | Promise<void>);

export interface Case {
	name: string;
	path: string;
	exec: ExecSpec;
	eval: EvalSpec;
}
