import { inject } from '@aurelia/kernel';
import { customElement, ICustomElement } from '@aurelia/runtime';
import { Router } from '../../../../../../src';
import { State } from '../state';
import { wait } from '../utils';

@customElement({
  name: 'login', template: `
<div class="login">
  <p>You need to be logged in \${specialText} to continue.</p>
  <button data-test="login-button" click.trigger="login()">Okay, log me in \${specialText}</button>
</div>` })
@inject(State, Router)
export class Login {
  private returnTo: string = '';
  private specialLogin: boolean = false;
  private specialText: string = '';

  constructor(private readonly state: State, private readonly router: Router) { }

  public enter(params) {
    params = params || [];
    const returnTo = this.router.instructionResolver.decodeViewportInstructions(params[0]);
    this.returnTo = this.router.instructionResolver.stringifyViewportInstructions(returnTo);
    console.log('>>>>>>>>>', this.returnTo);
    this.specialLogin = !!params[1];
    this.specialText = this.specialLogin ? 'SPECIAL ' : '';
  }

  public login() {
    this.state.loggedIn = true;
    this.state.loggedInAt = new Date();
    if (this.specialLogin) {
      this.state.loggedInSpecial = true;
      this.state.loggedInSpecialAt = new Date();
    }
    if (this.returnTo) {
      this.state.loginReturnTo.push(this.returnTo);
    }
    if (this.state.loginReturnTo.length) {
      console.log(this.state.loginReturnTo.join('+'));
      this.router.goto(this.state.loginReturnTo.join('+'));
    }
    this.state.loginReturnTo = [];
  }
}
export interface Login extends ICustomElement<HTMLElement> { }
