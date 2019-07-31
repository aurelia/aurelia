import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';
import { UserService } from 'shared/services/user-service';
import { SharedState } from 'shared/state/shared-state';
import template from './settings.html';
@inject(UserService, SharedState, IRouter)
@customElement({ name: 'settings', template })
export class SettingsComponent {

  constructor(private readonly userService: UserService,
              private readonly sharedState: SharedState,
              private readonly router: IRouter) {
  }

  public update() {
    this.userService.update(this.sharedState.currentUser);
  }

  public logout() {
    this.userService.purgeAuth();
    this.router.goto('home');
  }
}
