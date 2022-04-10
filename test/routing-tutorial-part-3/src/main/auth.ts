import { RoutingInstruction } from '@aurelia/router';

export class Auth {
    public user: string;
    public redirectInstructions: RoutingInstruction[];

    private timeout: any;
    private timeoutTime: number = 0;

    public login(user: string) {
        this.user = user;
        this.createTimeout();
    }
    public logout() {
        this.user = void 0;
        this.removeTimeout();
    }

    public checkAccess(): boolean {
        this.createTimeout();
        return this.user !== void 0;
    }

    private createTimeout() {
        if (this.timeoutTime > 0) {
            this.removeTimeout();
            this.timeout = setTimeout(() => {
                this.user = void 0;
            }, this.timeoutTime * 1000);
        }
    }

    private removeTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = void 0;
        }
    }
}
