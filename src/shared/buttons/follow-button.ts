import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { bindable, customElement } from '@aurelia/runtime';
import template from './follow-button.html';

import { ProfileService } from 'shared/services/profile-service';
import { SharedState } from 'shared/state/shared-state';

@inject(Router, SharedState, ProfileService)
@customElement({ name: 'follow-button', template })
export class FollowButton {
  @bindable public article: any;
  @bindable public toggle: any;

  constructor(private readonly router: Router,
              private readonly sharedState: SharedState,
              private readonly profileService: ProfileService) {
  }

  public onToggleFollowing() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('auth(type=login)');
      return;
    }
    this.article.author.following = !this.article.author.following;
    if (this.article.author.following) {
      this.profileService.follow(this.article.author.username);
    } else {
      this.profileService.unfollow(this.article.author.username);
    }

    this.toggle(this.article.author.following);
  }
}
