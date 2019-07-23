import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';
import { User } from 'shared/models/user';
import { UserService } from 'shared/services/user-service';
import template from './auth.html';

@inject(UserService, Router)
@customElement({ name: 'auth', template })
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

  public async submit() {
    const credentials = {
      email: this.user.email,
      password: this.user.password,
      username: this.user.username,
    };
    try {
      await this.userService.attemptAuth(this.type, credentials);
      await this.router.goto('home');
    } catch (err) {
      this.errors = err.errors;
    }

  }
}
