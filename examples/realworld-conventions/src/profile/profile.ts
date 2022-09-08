import template from './profile.html';

import { customElement } from 'aurelia';
import { IRouteableComponent, Parameters } from '@aurelia/router';
import { IProfileState, IUserState } from '../state';
import { Profile as CurrentProfile } from '../api';
import { queue } from '../util';
import { ArticleList } from '../_shared/article-list';

@customElement({
  name: 'profile',
  template,
  dependencies: [ArticleList],
})
export class Profile implements IRouteableComponent {
  static parameters: string[] = ['name'];

  get isSelf(): boolean { return this.profile.username === this.$user.current.username; }
  get profile(): CurrentProfile { return this.$profile.current; }

  constructor(
    @IProfileState readonly $profile: IProfileState,
    @IUserState readonly $user: IUserState,
  ) { }

  async loading({ name }: Parameters) {
    await this.$profile.load(name as string);
  }

  @queue async toggleFollow() {
    await this.$profile.toggleFollow();
  }
}

