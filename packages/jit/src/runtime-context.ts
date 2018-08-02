export class RuntimeContext {
  public registeredCommands: string[];
  public registeredAttributes: string[];
  public registeredElements: string[];

  constructor() {
    this.registeredCommands = [];
    this.registeredAttributes = [];
    this.registeredElements = [];
  }
}
