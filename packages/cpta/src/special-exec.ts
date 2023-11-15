export abstract class SpecialExec {
	public abstract exec(in_dir: string, out_dir: string): Promise<void>;
}
