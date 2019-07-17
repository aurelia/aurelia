import { SharedState } from '../state/shared-state';
import { ProfileService } from '../services/profile-service';
import { inject } from '@aurelia/kernel';
import { bindable, customElement } from '@aurelia/runtime';
import { Router } from '@aurelia/router';
import template from './follow-button.html';

@inject(Router, SharedState, ProfileService)
@customElement({ name: 'follow-button', template: template })
export class FollowButton {
  @bindable article: any;
  @bindable toggle: any;

  constructor(private readonly router: Router, private readonly sharedState: SharedState, private readonly profileService: ProfileService) {
  }

  onToggleFollowing() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('login');
      return;
    }
    this.article.author.following = !this.article.author.following;
    if (this.article.author.following)
      this.profileService.follow(this.article.author.username);
    else
      this.profileService.unfollow(this.article.author.username);

    this.toggle(this.article.author.following);
  }
}