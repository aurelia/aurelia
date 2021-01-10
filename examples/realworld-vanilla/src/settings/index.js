import { CustomElement, IRouter, Watch, Route } from '../aurelia.js';
import { AuthHandler, IUserState } from '../state.js';

export const SettingsView = CustomElement.define({
  name: 'settings-view',
  template: `
    <div class="container page">
      <div class="row">

        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Your Settings</h1>

          <form submit.trigger="$event.preventDefault()">
            <fieldset>
              <fieldset class="form-group">
                <input class="form-control" type="text" placeholder="URL of profile picture" value.bind="local.image"
                  name="image">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Your Name" value.bind="local.username"
                  autocomplete="name" name="username">
              </fieldset>
              <fieldset class="form-group">
                <textarea class="form-control form-control-lg" rows="8" placeholder="Short bio about you"
                  value.bind="local.bio" name="bio"></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Email" value.bind="local.email"
                  autocomplete="email" name="email">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="password" placeholder="Password"
                  value.bind="local.password" autocomplete="current-password" name="password">
              </fieldset>
              <button class="btn btn-lg btn-primary pull-xs-right" click.delegate="update()" data-e2e="updateBtn">
                Update Settings
              </button>
            </fieldset>
          </form>

          <hr>
          <button class="btn btn-outline-danger" click.delegate="logout()">
            Or click here to logout.
          </button>
        </div>

      </div>

    </div>
    </div>
  `,
}, class {
  static get inject() { return [IUserState, IRouter]; }

  constructor($user, router) {
    this.$user = $user;
    this.router = router;
    this.local = $user.current.clone();
  }

  async update() {
    await this.$user.update(this.local);
  }

  async logout() {
    this.$user.logout();
    await this.router.load('');
  }
});

Route.define({
  canLoad: [AuthHandler],
}, SettingsView);

Watch.add(SettingsView, {
  expression: x => x.$user.current,
  callback() {
    this.local = this.$user.current.clone();
  },
});
