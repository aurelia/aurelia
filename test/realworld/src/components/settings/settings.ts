import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { UserService } from 'shared/services/user-service';
import { SharedState } from 'shared/state/shared-state';

@inject(UserService, SharedState, IRouter)
export class Settings {

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
