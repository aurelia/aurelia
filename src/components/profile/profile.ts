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

  constructor(
    private readonly sharedState: SharedState,
    private readonly profileService: ProfileService,
    private readonly router: Router) {
  }

  public async enter(parameters: { name: string }) {
    this.username = parameters.name;
    const profile = await this.profileService.get(this.username);
    this.router.setNav('profile-posts', [
      {
        route: `profile-article(name=${this.username})`,
        title: 'My Posts',
      },
      {
        route: `profile-favorites(name=${this.username})`,
        title: 'Favorited Posts',
      },
    ], {
        ul: 'nav nav-pills outline-active',
        li: 'nav-item',
        a: 'nav-link',
        aActive: 'active',
      });
    return this.profile = profile;
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
