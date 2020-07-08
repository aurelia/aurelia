import { Auth } from "./auth";
import { IRouter } from "aurelia";

export class Profile {
    public constructor(@IRouter private router: IRouter, private auth: Auth) {
    }

    public logout() {
        this.auth.logout();
        this.router.goto('welcome');
    }
}
