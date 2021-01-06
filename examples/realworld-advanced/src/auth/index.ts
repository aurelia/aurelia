import template from './index.html';

import { customElement, IRouter, IRouteViewModel, Params, IPlatform,  route, RouteNode } from 'aurelia';
import { IUserState } from '../state';

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
@customElement({ name: 'auth-view', template })
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
    @IPlatform readonly p: IPlatform,
    @IRouter readonly router: IRouter,
    @IUserState readonly $user: IUserState,
  ) {}

  load(params: Params, next: RouteNode): void {
    this.mode = next.instruction!.component.value as 'login' | 'register';
  }

  submit(): void {
    this.p.taskQueue.queueTask(async () => {
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
    });
  }
}
