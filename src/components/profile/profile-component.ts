import { SharedState } from '../../shared/state/shared-state';
import { UserService } from "../../shared/services/user-service";
import { ProfileService } from "../../shared/services/profile-service";
import { Router, INavigatorOptions } from '@aurelia/router';
import { inject } from '@aurelia/kernel';

@inject(SharedState, ProfileService, Router)
export class ProfileComponent {
  username: any;
  profile: any;

  constructor(private readonly sharedState: SharedState, private readonly profileService: ProfileService, private readonly router: Router) {
  }

  configureRouter(config, router) {
    config.map([
      { route: [''], moduleId: 'components/profile/profile-article-component', name: 'profilearticle', title: 'Profile' },
      { route: ['favorites'], moduleId: 'components/profile/profile-favorites-component', name: 'profilefavorites', title: 'Profile' }
    ]);

    // this.router = router;
  }

  enter(parameters: INavigatorOptions) {
    this.username = parameters.name;
    return this.profileService.get(this.username)
      .then(profile => this.profile = profile)
  }

  get isUser() {
    return this.profile.username === this.sharedState.currentUser.username;
  }

  onToggleFollowing() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('login');
      return;
    }
    this.profile.following = !this.profile.following;
    if (this.profile.following)
      this.profileService.follow(this.profile.username);
    else
      this.profileService.unfollow(this.profile.username);
  }
}
