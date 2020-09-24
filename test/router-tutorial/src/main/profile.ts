import { Auth } from "./auth";
import { IRouter } from "aurelia";

export class Profile {
  public constructor(@IRouter private readonly router: IRouter, private readonly auth: Auth) {
  }

  public logout() {
    this.auth.logout();
    this.router.goto('welcome');
  }

  public lazy() {
    this.router.goto([{ component: import('./lazy') }]).catch(err => err);
  }
}
