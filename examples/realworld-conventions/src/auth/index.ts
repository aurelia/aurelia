import template from './index.html';

import { customElement } from 'aurelia';
import { IRouter, IRouteableComponent, Parameters, route, RoutingInstruction } from '@aurelia/router-direct';
import { IUserState } from '../state';
import { queue } from '../util';

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

// @route({ transitionPlan: 'replace' })
@customElement({ name: 'auth-view', template })
export class AuthViewCustomElement implements IRouteableComponent {
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

  loading(params: Parameters, instruction: RoutingInstruction): void {
    this.mode = instruction.component.name as 'login' | 'register';
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
