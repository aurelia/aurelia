import { Auth } from "./auth";
import { IRouter } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import template from './login.html';

@customElement({
  name: 'login',
  template,
})
export class Login {
    public user: string;

    public constructor(@IRouter private router: IRouter, private auth: Auth) {
    }

    public login() {
        this.auth.login(this.user);
        const redirect = this.auth.redirectInstructions ?? 'welcome';
        this.auth.redirectInstructions = void 0;
        this.router.load(redirect);
    }
}
