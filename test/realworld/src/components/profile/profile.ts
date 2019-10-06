import { inject } from '@aurelia/kernel';
import { IRouter, lifecycleLogger, ReentryBehavior } from '@aurelia/router';
import { Profile as ProfileModel } from 'shared/models/profile';
import { ProfileService } from 'shared/services/profile-service';
import { SharedState } from 'shared/state/shared-state';

@inject(SharedState, ProfileService, IRouter)
// @lifecycleLogger('profile')
export class Profile {
  public static parameters: string[] = ['name'];
  public reentryBehavior: string = ReentryBehavior.refresh;

  private username?: string;
  private profile?: ProfileModel;

  public constructor(
    private readonly sharedState: SharedState,
    private readonly profileService: ProfileService,
    private readonly router: IRouter) {
  }

  public canEnter() { console.log(`profile canEnter`); return true; }
  public created() { console.log(`profile created`); }
  public binding() { console.log(`profile binding`); }
  public bound() { console.log(`profile bound`); }
  public attaching() { console.log(`profile attaching`); }
  public attached() { console.log(`profile attached`); }
  public canLeave() { console.log(`profile canLeave`); return true; }
  public leave() { console.log(`profile leave`); }
  public detaching() { console.log(`profile detaching`); }
  public detached() { console.log(`profile detached`); }
  public unbinding() { console.log(`profile unbinding`); }
  public unbound() { console.log(`profile unbound`); }

  public async enter(parameters: { name: string }) {
    console.log(`profile enter`);
    this.username = parameters.name;
    const profile = await this.profileService.get(this.username);
    this.router.setNav(
      'profile-posts',
      [
        {
          route: `profile-article(${this.username})`,
          title: 'My Posts',
        },
        {
          route: `profile-favorites(${this.username})`,
          title: 'Favorited Posts',
        },
      ], {
        ul: 'nav nav-pills outline-active',
        li: 'nav-item',
        a: 'nav-link',
        aActive: 'active',
      },
    );
    // this.router.goto(`/profile(${this.username})/profile-article(${this.username})`);
    this.profile = profile;
  }

  public get isUser() {
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
      this.profileService.follow(this.profile.username!);
    } else {
      this.profileService.unfollow(this.profile.username!);
    }
  }
}
