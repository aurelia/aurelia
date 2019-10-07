import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { bindable } from '@aurelia/runtime';
import { ProfileService } from 'shared/services/profile-service';
import { SharedState } from 'shared/state/shared-state';

@inject(IRouter, SharedState, ProfileService)
export class FollowButton {
  @bindable public article: any;
  @bindable public toggle: any;

  public constructor(private readonly router: IRouter,
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
