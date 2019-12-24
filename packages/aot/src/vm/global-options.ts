export class GlobalOptions {
  public constructor(
    public readonly instantiate: boolean,
    public readonly evaluate: boolean,
    public readonly singleFile: boolean,
  ) {}
}
