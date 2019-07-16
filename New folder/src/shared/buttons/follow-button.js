import {inject, bindable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {SharedState} from '../../shared/state/shared-state';
import {ProfileService} from '../../shared/services/profile-service';

@inject(Router, SharedState, ProfileService)
export class FollowButton {
  @bindable article;
  @bindable toggle;

  constructor(router, sharedState, profileService) {
    this.router = router;
    this.sharedState = sharedState;
    this.profileService = profileService;
  }

  onToggleFollowing() {
    if (!this.sharedState.isAuthenticated) {
      this.router.navigateToRoute('login');
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