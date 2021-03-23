import template from './settings.html';

import { customElement, IPlatform, watch } from 'aurelia';
import { IRouter, IRouteableComponent } from 'jwx-router';
import { AuthHandler, IUserState } from '../state';
import { User } from '../api';
import { queue } from '../util';

@customElement({ name: 'settings', template })
export class Settings implements IRouteableComponent {
  local: User;

  constructor(
    @IPlatform readonly p: IPlatform,
    @IUserState readonly $user: IUserState,
    @IRouter readonly router: IRouter,
  ) {
    this.local = $user.current.clone();
  }

  @watch<Settings>(x => x.$user.current)
  sync() {
    this.local = this.$user.current.clone();
  }

  @queue async update() {
    await this.$user.update(this.local);
  }

  @queue async logout() {
    this.$user.logout();
    await this.router.load('');
  }
}
