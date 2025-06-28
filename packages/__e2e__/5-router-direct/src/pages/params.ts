export class Params {
  public params: string = '';

  public loading(parameters): void {
    this.params = JSON.stringify(parameters);
  }
}
