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
    if (!this.specialLogin) {
      alert("You've timed out!");
      this.state.loggedIn = false;
    }
    this.state.loggedInSpecial = false;
  }

  public login() {
    this.state.loggedIn = true;
    this.state.loggedInAt = new Date();
    if (this.specialLogin) {
      this.state.loggedInSpecial = true;
      this.state.loggedInSpecialAt = new Date();
    }
    console.log(this.router.instructionResolver.parseViewportInstructions(this.returnTo));
    this.router.goto(this.returnTo || this.state.loginReturnTo || 'authors+about');
    this.state.loginReturnTo = null;
  }
}
export interface Login extends ICustomElement<HTMLElement> { }
