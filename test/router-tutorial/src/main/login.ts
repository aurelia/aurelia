import { Auth } from "./auth";
import { IRouter } from "aurelia";

export class Login {
  public user: string;

  public constructor(@IRouter private readonly router: IRouter, private auth: Auth) {
  }

  public login() {
    this.auth.login(this.user);
    const redirect = this.auth.redirectInstructions ?? 'welcome';
    this.auth.redirectInstructions = void 0;
    this.router.goto(redirect);
  }
}
