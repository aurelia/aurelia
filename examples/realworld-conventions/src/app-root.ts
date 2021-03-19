import template from './app-root.html';

import { customElement, ICustomElementViewModel } from 'aurelia';
import { routes } from 'jwx-router';

import { ITagsState, IUserState } from './state';

import { HomeViewCustomElement } from './home';
import { AuthViewCustomElement } from './auth';
import { SettingsViewCustomElement } from './settings';
import { ProfileViewCustomElement } from './profile';
import { EditorViewCustomElement } from './editor';
import { ArticleViewCustomElement } from './article';

// @routes([
//   { id: 'home', path: '', component: import('./home'), title: 'Home' },
//   { path: 'login', component: import('./auth'), title: 'Sign in' },
//   { path: 'register', component: import('./auth'), title: 'Sign up' },
//   { path: 'settings', component: import('./settings'), title: 'Settings' },
//   { id: 'profile', path: 'profile/:name', component: import('./profile'), title: 'Profile' },
//   { id: 'editor', path: 'editor/:slug?', component: import('./editor'), title: 'Editor' },
//   { id: 'article', path: 'article/:slug', component: import('./article'), title: 'Article' },
// ])
// @customElement({
//   name: 'app-root',
//   template,
//   dependencies: [HomeViewCustomElement, AuthViewCustomElement, SettingsViewCustomElement, ProfileViewCustomElement, EditorViewCustomElement, ArticleViewCustomElement],
// })
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

