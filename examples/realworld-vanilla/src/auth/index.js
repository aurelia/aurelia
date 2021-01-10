import { CustomElement, IRouter, Route } from '../aurelia.js';
import { IUserState } from '../state.js';

const CONSTANTS = {
  login: {
    msg: 'Sign in',
    other: {
      msg: 'Need an account?',
      href: '../register',
    },
  },
  register: {
    msg: 'Sign up',
    other: {
      msg: 'Have an account?',
      href: '../login',
    },
  },
};

export const AuthView = CustomElement.define({
  name: 'auth-view',
  template: `
    <div class="auth-page">
      <div class="container page">
        <div class="row">

          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">\${C[mode].msg}</h1>
            <p class="text-xs-center">
              <a href.bind="C[mode].other.href">\${C[mode].other.msg}</a>
            </p>

            <error-list errors.bind="$user.errors"></error-list>

            <form submit.trigger="$event.preventDefault()">
              <fieldset class="form-group" if.bind="mode === 'register'">
                <input class="form-control form-control-lg" type="text" placeholder="Your Name" value.bind="username"
                  autocomplete="name" required name="username">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Email" value.bind="email"
                  autocomplete="email" required name="email">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="password" placeholder="Password" value.bind="password"
                  autocomplete="current-password" name="password">
              </fieldset>
              <button class="btn btn-lg btn-primary pull-xs-right" click.trigger="submit()" data-e2e="submitBtn">
                \${C[mode].msg}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  `,
}, class {
  static get inject() { return [IRouter, IUserState]; }

  get isValid() {
    if (this.mode === 'login') {
      return this.email !== '' && this.password !== '';
    }
    return this.username !== '' && this.email !== '' && this.password !== '';
  }

  constructor(router, $user) {
    this.router = router;
    this.$user = $user;

    this.C = CONSTANTS;
    this.mode = 'login';

    this.username = '';
    this.email = '';
    this.password = '';
  }

  load(params, next) {
    this.mode = next.instruction.component.value;
  }

  async submit() {
    switch (this.mode) {
      case 'login':
        if (await this.$user.login({
          email: this.email,
          password: this.password,
        })) {
          await this.router.load('');
        }
        break;
      case 'register':
        if (await this.$user.register({
          username: this.username,
          email: this.email,
          password: this.password,
        })) {
          await this.router.load('');
        }
        break;
    }
  }
});

Route.configure({ transitionPlan: 'replace' }, AuthView);
