import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';
import { Profile } from 'shared/models/profile';
import { ProfileService } from "shared/services/profile-service";
import { SharedState } from 'shared/state/shared-state';
import template from './profile.html';

@inject(SharedState, ProfileService, Router)
@customElement({ name: 'profile', template })
export class ProfileComponent {
  private username?: string;
  private profile?: Profile;

  constructor(private readonly sharedState: SharedState,
              private readonly profileService: ProfileService,
              private readonly router: Router) {
  }

  public async enter(parameters: { name: string }) {
    this.username = parameters.name;
    const profile = await this.profileService.get(this.username);
    return this.profile = profile;
  }

  public gotoFavorites() {
    this.router.goto(`profile-favorites(name=${this.username})@profile-posts`, 'Profile');
  }

  get isFavoritesActive() {
    return this.router.activeComponents.some((y) => y.indexOf('profile-favorites') > -1);
  }

  public gotoPosts() {
    this.router.goto(`profile-article(name=${this.username})@profile-posts`, 'Profile');
  }

  get isUser() {
    if (!this.profile) { return false; }
    return this.profile.username === this.sharedState.currentUser.username;
  }

  public onToggleFollowing() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('auth(type=login)');
      return;
    }
    if (!this.profile) { return; }
    this.profile.following = !this.profile.following;
    if (this.profile.following) {
      this.profileService.follow(this.profile!.username!);
    } else {
      this.profileService.unfollow(this.profile!.username!);
    }
  }
}
