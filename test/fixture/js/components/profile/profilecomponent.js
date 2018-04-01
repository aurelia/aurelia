import {inject} from 'aurelia-dependency-injection';
import {computedFrom} from 'aurelia-framework';
import {SharedState} from '../../shared/state/sharedstate';
import {UserService} from "../../shared/services/userservice";
import {ProfileService} from "../../shared/services/profileservice";

@inject(SharedState, ProfileService)
export class ProfileComponent {
  
  constructor(sharedState, ps) {
    this.sharedState = sharedState;
    this.profileService = ps;
  }
  
  configureRouter(config, router) {
    config.map([
      {route: [''], moduleId: 'components/profile/profilearticlecomponent', name: 'profilearticle', title: 'Profile'},
      {route: ['favorites'], moduleId: 'components/profile/profilefavoritescomponent', name: 'profilefavorites', title: 'Profile'}
    ]);
    
    this.router = router;
  }
  
  activate(params, routeConfig) {
    this.username = params.name;
    return this.profileService.get(this.username)
      .then(profile => this.profile = profile)
  }
  
  @computedFrom('sharedState.currentUser.username')
  get isUser() {
    return this.profile.username === this.sharedState.currentUser.username;
  }
  
  onToggleFollowing() {
    this.profile.following = !this.profile.following;
    if (this.profile.following)
      this.profileService.follow(this.profile.username);
    else
      this.profileService.unfollow(this.profile.username);
  }
}
