import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';
import { User } from 'shared/models/user';
import { UserService } from 'shared/services/user-service';
import { SharedState } from 'shared/state/shared-state';
import template from './auth-component.html';

@inject(UserService, SharedState, Router)
@customElement({ name: 'auth-component', template })
export class AuthComponent {
  private user: User = {};
  private type: string = 'login';
  private errors?: string[];

  constructor(private readonly userService: UserService, private readonly router: Router) {
  }

  public enter(parameters: { type: string }) {
    this.type = parameters.type;
  }

  get canSave() {
    if (this.type === 'login') { return this.user.email !== '' && this.user.password !== ''; }
    return this.user.username !== '' && this.user.email !== '' && this.user.password !== '';
  }

  public submit() {
    const credentials = {
      email: this.user.email,
      password: this.user.password,
      username: this.user.username,
    };
    this.userService.attemptAuth(this.type, credentials)
      .then(() => this.router.goto('home-component'))
      .catch((promise) => {
        promise.then((err: { errors: string[]; }) => this.errors = err.errors);
      });
  }
}
