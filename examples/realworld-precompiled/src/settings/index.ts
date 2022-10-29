import { customElement, IRouter, IRouteViewModel, IPlatform } from 'aurelia';
import { watch } from '@aurelia/runtime-html';
import { AuthHandler, IUserState } from '../state';
import { User } from '../api';
import { h, queue } from '../util';

@customElement({
  name: 'settings-view',
  needsCompile: false,
  dependencies: [AuthHandler],
  template: `<div class="container page"><div class="row"><div class="col-md-6 offset-md-3 col-xs-12"><h1 class="text-xs-center">Your Settings</h1><form class="au"><fieldset><fieldset class="form-group"><input class="form-control au" type="text" placeholder="URL of profile picture" name="image"></fieldset><fieldset class="form-group"><input class="form-control form-control-lg au" type="text" placeholder="Your Name" autocomplete="name" name="username"></fieldset><fieldset class="form-group"><textarea class="form-control form-control-lg au" rows="8" placeholder="Short bio about you" name="bio"></textarea></fieldset><fieldset class="form-group"><input class="form-control form-control-lg au" type="text" placeholder="Email" autocomplete="email" name="email"></fieldset><fieldset class="form-group"><input class="form-control form-control-lg au" type="password" placeholder="Password" autocomplete="current-password" name="password"></fieldset><button class="btn btn-lg btn-primary pull-xs-right au" data-e2e="updateBtn">Update Settings</button></fieldset></form><hr><button class="btn btn-outline-danger au">Or click here to logout.</button></div></div></div>`,
  instructions: [[
    h.bindListener('$event.preventDefault()', 'submit', true, false),
  ], [
    h.bindProp('local.image', 'value', 6),
  ], [
    h.bindProp('local.username', 'value', 6),
  ], [
    h.bindProp('local.bio', 'value', 6),
  ], [
    h.bindProp('local.email', 'value', 6),
  ], [
    h.bindProp('local.password', 'value', 6),
  ], [
    h.bindListener('update()', 'click', true, false),
  ], [
    h.bindListener('logout()', 'click', true, false),
  ]],
})
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
