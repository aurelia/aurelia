import { CustomElement, Route } from './aurelia.js';

import { ITagsState, IUserState } from './state.js';

export const AppRoot = CustomElement.define({
  name: 'app-root',
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" load="route:home; active.bind:_home">conduit</a>
        <ul class="nav navbar-nav pull-xs-right">
          <li class="nav-item" active.class="_home">
            <a class="nav-link" load="route:home; active.bind:_home">Home</a>
          </li>
          <li class="nav-item" active.class="_editor" show.bind="$user.isAuth">
            <a class="nav-link" load="route:editor; active.bind:_editor"><i class="ion-compose"></i>&nbsp;New Post</a>
          </li>
          <li class="nav-item" active.class="_settings" show.bind="$user.isAuth">
            <a class="nav-link" load="route:settings; active.bind:_settings"><i class="ion-gear-a"></i>&nbsp;Settings</a>
          </li>
          <li class="nav-item" active.class="_login" show.bind="!$user.isAuth">
            <a class="nav-link" load="route:login; active.bind:_login">Sign in</a>
          </li>
          <li class="nav-item" active.class="_register" show.bind="!$user.isAuth">
            <a class="nav-link" load="route:register; active.bind:_register">Sign up</a>
          </li>
          <li class="nav-item" active.class="_profile" show.bind="$user.isAuth">
            <a class="nav-link" load="route:profile; params.bind:{name:$user.current.username}; active.bind:_profile">\${$user.current.username}</a>
          </li>
        </ul>
      </div>
    </nav>

    <au-viewport></au-viewport>

    <footer>
      <div class="container">
        <a href="/" class="logo-font">conduit</a>
        <span class="attribution">
          An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code & design licensed under
          MIT.
        </span>
      </div>
    </footer>
  `,
}, class {
  static get inject() { return [IUserState, ITagsState]; }

  constructor($user, $tags) {
    this.$user = $user;
    this.$tags = $tags;
  }

  async binding() {
    await Promise.all([
      this.$tags.load(),
      this.$user.load(),
    ]);
  }
});

Route.define({
  children: [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'login', component: import('./auth'), title: 'Sign in' },
    { path: 'register', component: import('./auth'), title: 'Sign up' },
    { path: 'settings', component: import('./settings'), title: 'Settings' },
    { id: 'profile', path: 'profile/:name', component: import('./profile'), title: 'Profile' },
    { id: 'editor', path: 'editor/:slug?', component: import('./editor'), title: 'Editor' },
    { id: 'article', path: 'article/:slug', component: import('./article'), title: 'Article' },
  ]
}, AppRoot);
