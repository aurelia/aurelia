import { computedFrom } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { ProfileService } from "../../shared/services/profileservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class ProfileComponent {
  public sharedState: SharedState;
  public profileService: ProfileService;

  public router: Router | undefined;
  public username: string = "";
  public profile: any;

  constructor(sharedState: SharedState, profileService: ProfileService) {
    this.sharedState = sharedState;
    this.profileService = profileService;
  }

  public configureRouter(config: RouterConfiguration, router: Router): void {
    config.map([
      { route: [""], moduleId: "components/profile/profilearticlecomponent", name: "profilearticle", title: "Profile" },
      {
        route: ["favorites"],
        moduleId: "components/profile/profilefavoritescomponent",
        name: "profilefavorites",
        title: "Profile"
      }
    ]);

    this.router = router;
  }

  public activate(params: any, _routeConfig: RouteConfig): Promise<void> {
    this.username = params.name;

    return this.profileService.get(this.username).then(profile => (this.profile = profile));
  }

  @computedFrom("sharedState.currentUser.username")
  public get isUser(): boolean {
    return this.profile.username === this.sharedState.currentUser.username;
  }

  public onToggleFollowing(): void {
    this.profile.following = !this.profile.following;
    if (this.profile.following) {
      this.profileService.follow(this.profile.username);
    } else {
      this.profileService.unfollow(this.profile.username);
    }
  }
}
