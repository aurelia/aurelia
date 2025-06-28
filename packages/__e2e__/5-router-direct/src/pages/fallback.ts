export class Fallback {
  public missing: string;
  public loading(parameters) {
    this.missing = parameters[0];
  }
}
