import { inject } from '@aurelia/kernel';
import { IRouter, lifecycleLogger } from '@aurelia/router';
import { UserService } from 'shared/services/user-service';
import { SharedState } from 'shared/state/shared-state';

@lifecycleLogger('settings')
@inject(UserService, SharedState, IRouter)
export class Settings {

  public constructor(
    private readonly userService: UserService,
    private readonly sharedState: SharedState,
    private readonly router: IRouter) {
  }

  public created() { return; }
  public binding() { return; }
  public bound() { return; }
  public attaching() { return; }
  public attached() { return; }
  public detaching() { return; }
  public detached() { return; }
  public unbinding() { return; }
  public unbound() { return; }

  public update() {
    this.userService.update(this.sharedState.currentUser);
  }

  public logout() {
    this.userService.purgeAuth();
    this.router.goto('home');
  }
}
