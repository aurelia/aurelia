import { customElement, IRouter, IRouteViewModel, Params, route, RouteNode } from 'aurelia';
import { IUserState } from '../state';
import { h, queue } from '../util';

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

@route({ transitionPlan: 'replace' })
@customElement({
  name: 'auth-view',
  needsCompile: false,
  template: `<div class="auth-page"><div class="container page"><div class="row"><div class="col-md-6 offset-md-3 col-xs-12"><h1 class="text-xs-center"><!--au-start--><!--au-end--><au-m class="au"></au-m></h1><p class="text-xs-center"><a class="au"><!--au-start--><!--au-end--><au-m class="au"></au-m></a></p><error-list class="au"></error-list><form class="au"><!--au-start--><!--au-end--><au-m class="au"></au-m><fieldset class="form-group"><input class="form-control form-control-lg au" type="text" placeholder="Email" autocomplete="email" required="" name="email"></fieldset><fieldset class="form-group"><input class="form-control form-control-lg au" type="password" placeholder="Password" autocomplete="current-password" name="password"></fieldset><button class="btn btn-lg btn-primary pull-xs-right au" data-e2e="submitBtn"><!--au-start--><!--au-end--><au-m class="au"></au-m></button></form></div></div></div></div>`,
  instructions: [[
    h.bindText('C[mode].msg', false),
  ], [
    h.attr('href', [
      h.bindProp('C[mode].other.href', 'value', 2),
    ]),
  ], [
    h.bindText('C[mode].other.msg', false),
  ], [
    h.element('error-list', false, [
      h.bindProp('$user.errors', 'errors', 2),
    ]),
  ], [
    h.bindListener('$event.preventDefault()', 'submit', true, false),
  ], [
    h.templateCtrl('if', [h.bindProp('mode==="register"', 'value', 2)], {
      template: `<fieldset class="form-group"><input class="form-control form-control-lg au" type="text" placeholder="Your Name" autocomplete="name" required="" name="username"></fieldset>`,
      instructions: [[
        h.bindProp('username', 'value', 6),
      ]],
    }),
  ], [
    h.bindProp('email', 'value', 6),
  ], [
    h.bindProp('password', 'value', 6),
  ], [
    h.bindListener('submit()', 'click', true, false),
  ], [
    h.bindText('C[mode].msg', false),
  ]],
})
export class AuthViewCustomElement implements IRouteViewModel {
  C = CONSTANTS;
  mode: 'login' | 'register' = 'login';

  username = '';
  email = '';
  password = '';

  get isValid(): boolean {
    switch (this.mode) {
      case 'login':
        return this.email !== '' && this.password !== '';
      case 'register':
        return this.username !== '' && this.email !== '' && this.password !== '';
    }
  }

  constructor(
    @IRouter readonly router: IRouter,
    @IUserState readonly $user: IUserState,
  ) { }

  loading(params: Params, next: RouteNode): void {
    this.mode = next.instruction!.component.value as 'login' | 'register';
  }

  @queue async submit() {
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
}
