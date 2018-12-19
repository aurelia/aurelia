export class AttrSyntax {
  public readonly rawName: string;
  public readonly rawValue: string;
  public readonly target: string;
  public readonly command: string | null;

  constructor(rawName: string, rawValue: string, target: string, command: string | null) {
    this.rawName = rawName;
    this.rawValue = rawValue;
    this.target = target;
    this.command = command;
  }
}
