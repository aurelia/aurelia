import { IRouter } from "@aurelia/router";
import { Auth } from "./auth";
import { customElement } from '@aurelia/runtime-html';
import template from './profile.html';

@customElement({
  name: 'profile',
  template,
})
export class Profile {
    public constructor(@IRouter private router: IRouter, private auth: Auth) {
    }

    public logout() {
        this.auth.logout();
        this.router.load('welcome');
    }
}
