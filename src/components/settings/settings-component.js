import {inject} from 'aurelia-dependency-injection';
import {Router} from 'aurelia-router';
import {UserService} from '../../shared/services/user-service';
import {SharedState} from '../../shared/state/shared-state';

@inject(UserService, SharedState, Router)
export class SettingsComponent {

  constructor(userService, sharedState, router) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
  }

  update() {
    this.userService.update(this.sharedState.currentUser);
  }

  logout() {
    this.userService.purgeAuth();
    this.router.navigateToRoute('home');
  }
}
