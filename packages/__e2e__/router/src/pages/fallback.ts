export class Fallback {
  public missing: string;
  public load(parameters) {
    this.missing = parameters[0];
  }
}
