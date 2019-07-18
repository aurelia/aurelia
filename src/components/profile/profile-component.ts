import { SharedState } from '../../shared/state/shared-state';
import { UserService } from "../../shared/services/user-service";
import { ProfileService } from "../../shared/services/profile-service";
import { Router, INavigatorOptions, Viewport } from '@aurelia/router';
import { inject } from '@aurelia/kernel';
import template from './profile-component.html';
import { customElement } from '@aurelia/runtime';
@inject(SharedState, ProfileService, Router)
@customElement({ name: 'profile-component', template: template })
export class ProfileComponent {
  username: any;
  profile: any;
  viewPort: Viewport;

  constructor(private readonly sharedState: SharedState, private readonly profileService: ProfileService, private readonly router: Router) {
    this.viewPort = this.router.getViewport('profile-posts');

  }

  configureRouter(config, router) {
    config.map([
      { route: [''], moduleId: 'components/profile/profile-article-component', name: 'profilearticle', title: 'Profile' },
      { route: ['favorites'], moduleId: 'components/profile/profile-favorites-component', name: 'profilefavorites', title: 'Profile' }
    ]);

    // this.router = router;
  }

  enter(parameters: any) {
    this.username = parameters.name;
    console.log(this.username);
    return this.profileService.get(this.username)
      .then(profile => this.profile = profile)
  }

  gotoFavorites() {

    console.log(this.username);
    console.log(this.router);
    this.router.goto(`profile-favorites-component(name=${this.username})@profile-posts`, 'Profile');
  }

  get isFavoritesActive(){
    console.log(this.router);
    return this.router.activeComponents.some(y=>y.indexOf('profile-favorites-component') > -1)
  }

  gotoPosts() {
    console.log(this.username);
    this.router.goto(`profile-article-component(name=${this.username})@profile-posts`, 'Profile');
  }

  get isUser() {
    return this.profile.username === this.sharedState.currentUser.username;
  }

  onToggleFollowing() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('auth-component(type=login)');
      return;
    }
    this.profile.following = !this.profile.following;
    if (this.profile.following)
      this.profileService.follow(this.profile.username);
    else
      this.profileService.unfollow(this.profile.username);
  }
}
