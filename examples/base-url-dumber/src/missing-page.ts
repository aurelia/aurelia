export class MissingPage {
  public static parameters = ['id'];
  public missingComponent: string ;

  public enter(parameters: {id: string}): void {
    this.missingComponent = parameters.id;
  }
}
