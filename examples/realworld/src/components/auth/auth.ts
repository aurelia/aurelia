import { IRouter } from '@aurelia/router';

import { User } from 'shared/models/user';
import { IUserService } from 'shared/services/user-service';

export class Auth {
  private readonly user: User = {};
  private type: string = 'login';
  private errors?: string[];

  public constructor(
    @IUserService private readonly userService: IUserService,
    @IRouter private readonly router: IRouter,
  ) {}

  public enter(parameters: { type: string }) {
    this.type = parameters.type;
  }

  public get canSave() {
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
