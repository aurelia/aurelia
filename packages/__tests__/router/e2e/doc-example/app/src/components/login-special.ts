import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { customElement, ICustomElementType } from '@aurelia/runtime';
import { State } from '../state';

@customElement({
  name: 'login-special', template: `
<div class="login">
  <p>You need to be logged in SPECIAL to continue.</p>
  <button data-test="login-button" click.trigger="login()">Okay, log me in SPECIAL</button>
</div>` })
@inject(State, IRouter)
export class LoginSpecial {
  public constructor(private readonly state: State, private readonly router: IRouter) { }

  public login() {
    this.state.loggedIn = true;
    this.state.loggedInAt = new Date();
    this.state.loggedInSpecial = true;
    this.state.loggedInSpecialAt = new Date();
    const instructions = this.state.loginReturnTo.length ? this.state.loginReturnTo : [];
    const goto = this.router.instructionResolver.stringifyViewportInstructions(instructions);
    console.log('login-special', goto);
    this.state.loginReturnTo = [];
    this.router.goto(goto, { replace: true });
  }
}
export interface LoginSpecial extends ICustomElementType { }
