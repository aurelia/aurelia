import template from './index.html';

import { customElement, IRouter, IRouteViewModel, IPlatform,  route, watch } from 'aurelia';
import { AuthHandler, IUserState } from '../state';
import { User } from '../api';

@route({ canLoad: [AuthHandler] })
@customElement({ name: 'settings-view', template })
export class SettingsViewCustomElement implements IRouteViewModel {
  local: User;
  dirty = false;
  get busy(): boolean { return this.$user.updatePending; }

  constructor(
    @IPlatform readonly p: IPlatform,
    @IUserState readonly $user: IUserState,
    @IRouter readonly router: IRouter,
  ) {
    this.local = $user.current.clone();
  }

  @watch<SettingsViewCustomElement>(x => x.$user.current)
  sync(): void {
    this.local = this.$user.current.clone();
  }

  @watch<SettingsViewCustomElement>(x => !x.local.equals(x.$user.current))
  setDirty(dirty: boolean): void {
    this.dirty = dirty;
  }

  update(): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$user.update(this.local);
    });
  }

  logout(): void {
    this.p.taskQueue.queueTask(async () => {
      this.$user.logout();
      await this.router.load('');
    });
  }
}
