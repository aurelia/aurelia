import { customElement } from '@aurelia/runtime';
import { UserService } from 'shared/services/user-service';
import { SharedState } from 'shared/state/shared-state';
import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import template from './settings-component.html';

@inject(UserService, SharedState, Router)
@customElement({ name: 'settings-component', template: template })
export class SettingsComponent {

  constructor(private readonly userService: UserService, private readonly sharedState: SharedState, private readonly router: Router) {
  }

  update() {
    this.userService.update(this.sharedState.currentUser);
  }

  logout() {
    this.userService.purgeAuth();
    this.router.goto('home');
  }
}
