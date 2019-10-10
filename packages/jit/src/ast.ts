export class AttrSyntax {
  public constructor(
    public rawName: string,
    public rawValue: string,
    public target: string,
    public command: string | null,
  ) {}
}
