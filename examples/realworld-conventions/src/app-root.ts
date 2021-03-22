import template from './app-root.html';

import { customElement, ICustomElementViewModel } from 'aurelia';
// import { routes } from 'jwx-router';

import { ITagsState, IUserState } from './state';

import { Home } from './home/home';
import { Settings } from './settings/settings';
import { Profile } from './profile/profile';
import { Editor } from './editor/editor';
import { Article } from './article/article';

// @routes([
//   { id: 'home', path: '', component: import('./home'), title: 'Home' },
//   { path: 'login', component: import('./auth'), title: 'Sign in' },
//   { path: 'register', component: import('./auth'), title: 'Sign up' },
//   { path: 'settings', component: import('./settings'), title: 'Settings' },
//   { id: 'profile', path: 'profile/:name', component: import('./profile'), title: 'Profile' },
//   { id: 'editor', path: 'editor/:slug?', component: import('./editor'), title: 'Editor' },
//   { id: 'article', path: 'article/:slug', component: import('./article'), title: 'Article' },
// ])
@customElement({
  name: 'app-root',
  template,
  dependencies: [Home, Settings, Profile, Editor, Article],
})
export class AppRoot implements ICustomElementViewModel {
  constructor(
    @IUserState readonly $user: IUserState,
    @ITagsState readonly $tags: ITagsState,
  ) { }

  async binding() {
    await Promise.all([
      this.$tags.load(),
      this.$user.load(),
    ]);
  }
}

