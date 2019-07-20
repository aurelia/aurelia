export class AttrSyntax {
  constructor(
    public rawName: string,
    public rawValue: string,
    public target: string,
    public command: string | null,
  ) {}
}
