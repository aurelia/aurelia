export class State {
  public noDelay: boolean = true;
  public allowEnterAuthorDetails: boolean = true;
  public loggedIn: boolean = false;
  public loggedInSpecial: boolean = false;
  public loggedInAt: Date;
  public loggedInSpecialAt: Date;
  public loginReturnTo: string;
}
