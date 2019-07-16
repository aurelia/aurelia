import {inject} from 'aurelia-dependency-injection';
import {Router, activationStrategy} from 'aurelia-router';
import {UserService} from '../../shared/services/user-service';
import {SharedState} from '../../shared/state/shared-state';

@inject(UserService, SharedState, Router)
export class AuthComponent {
  type = '';
  username = '';
  email = '';
  password = '';
  errors = null;

  constructor(userService, sharedState, router) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
  }

  determineActivationStrategy() {
    return activationStrategy.replace;
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
      .then(data => this.router.navigateToRoute('home'))
      .catch(promise => {
        promise.then(err => this.errors = err.errors)
      });
  }
}
