import { UserService } from '../../shared/services/user-service';
import { SharedState } from '../../shared/state/shared-state';
import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';

@inject(UserService, SharedState, Router)
export class AuthComponent {
  type = '';
  username = '';
  email = '';
  password = '';
  errors = null;

  constructor(private readonly userService: UserService, private readonly sharedState: SharedState, private readonly router: Router) {
  }

  determineActivationStrategy() {
    // return activationStrategy.replace;
  }

  activate(params, routeConfig) {
    this.type = routeConfig.name;
  }

  get canSave() {
    if (this.type === 'login') {
      return this.email !== '' && this.password !== '';
    } else {
      return this.username !== '' && this.email !== '' && this.password !== '';
    }
  }

  submit() {
    this.errors = null;

    const credentials = {
      username: this.username,
      email: this.email,
      password: this.password
    };
    this.userService.attemptAuth(this.type, credentials)
      .then(data => this.router.goto('home'))
      .catch(promise => {
        promise.then(err => this.errors = err.errors)
      });
  }
}
