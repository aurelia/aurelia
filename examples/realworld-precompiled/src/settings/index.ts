import template from './index.html';

import { customElement, IRouter, IRouteViewModel, IPlatform } from 'aurelia';
import { watch } from '@aurelia/runtime-html';
import { AuthHandler, IUserState } from '../state';
import { User } from '../api';
import { queue } from '../util';

@customElement({ name: 'settings-view', template, dependencies: [AuthHandler] })
export class SettingsViewCustomElement implements IRouteViewModel {
  local: User;

  constructor(
    @IPlatform readonly p: IPlatform,
    @IUserState readonly $user: IUserState,
    @IRouter readonly router: IRouter,
  ) {
    this.local = $user.current.clone();
  }

  @watch<SettingsViewCustomElement>(x => x.$user.current)
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
