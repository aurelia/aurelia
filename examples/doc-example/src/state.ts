import { ViewportInstruction } from '@aurelia/router-lite';

export class State {
  public noDelay: boolean = true;
  public allowEnterAuthorDetails: boolean = true;
  public loggedIn: boolean = false;
  public loggedInSpecial: boolean = false;
  public loggedInAt: Date;
  public loggedInSpecialAt: Date;
  public timedOut: boolean = false;
  public specialTimedOut: boolean = false;
  public loginReturnTo: ViewportInstruction[] = [];
}
