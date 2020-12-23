import { IRouter } from '@aurelia/router';
import { bindable } from '@aurelia/runtime-html';

import { IProfileService } from 'shared/services/profile-service';
import { ISharedState } from 'shared/state/shared-state';

export class FollowButton {
  @bindable public article: any;
  @bindable public toggle: any;

  public constructor(
    @IRouter private readonly router: IRouter,
    @ISharedState private readonly sharedState: ISharedState,
    @IProfileService private readonly profileService: IProfileService,
  ) {}

  public onToggleFollowing() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('auth(type=login)').catch((error: Error) => { throw error; });
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
