import { IRouter } from '@aurelia/router';

import { IUserService } from 'shared/services/user-service';
import { ISharedState } from 'shared/state/shared-state';

export class Settings {
  public constructor(
    @IUserService private readonly userService: IUserService,
    @ISharedState private readonly sharedState: ISharedState,
    @IRouter private readonly router: IRouter,
  ) {}

  public define() { return; }
  public hydrating() { return; }
  public hydrated() { return; }
  public created() { return; }

  public binding() { return; }
  public bound() { return; }
  public attaching() { return; }
  public attached() { return; }

  public detaching() { return; }
  public unbinding() { return; }

  public update() {
    this.userService.update(this.sharedState.currentUser);
  }

  public logout() {
    this.userService.purgeAuth();
    this.router.goto('home').catch((error: Error) => { throw error; });
  }
}
