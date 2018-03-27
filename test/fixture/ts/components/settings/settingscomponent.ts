import { autoinject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class SettingsComponent {
  public userService: UserService;
  public sharedState: SharedState;
  public router: Router;

  constructor(userService: UserService, sharedState: SharedState, router: Router) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
  }

  public update(): void {
    this.userService.update(this.sharedState.currentUser);
  }

  public logout(): void {
    this.userService.purgeAuth();
    this.router.navigateToRoute("home");
  }
}
