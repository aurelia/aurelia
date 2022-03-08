import { customElement } from '@aurelia/runtime-html';
import { IRouter, ViewportInstruction } from '@aurelia/router-lite';
import { State } from '../state';

@customElement({
  name: 'login',
  template: `
    <div class="login">
      <p>You need to be logged in to continue.</p>
      <button data-test="login-button" click.trigger="login()">Okay, log me in</button>
    </div>
  `
})
export class Login {
  public constructor(
    private readonly state: State,
    @IRouter private readonly router: IRouter
  ) {}

  public login() {
    this.state.loggedIn = true;
    this.state.timedOut = false;
    this.state.loggedInAt = new Date();
    const instructions = this.state.loginReturnTo.length ? this.state.loginReturnTo : [new ViewportInstruction('main', 'gate')];
    const goto = this.router.instructionResolver.stringifyViewportInstructions(instructions);
    console.log(goto);
    this.state.loginReturnTo = [];
    this.router.goto(goto, { replace: true }).catch(err => { throw err; });
  }
}
