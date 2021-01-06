import template from './app-root.html';

import { customElement, route, ICustomElementViewModel } from 'aurelia';

import { ITagsState, IUserState } from './state';

@route({
  children: [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'login', component: import('./auth'), title: 'Sign in' },
    { path: 'register', component: import('./auth'), title: 'Sign up' },
    { path: 'settings', component: import('./settings'), title: 'Settings' },
    { id: 'profile', path: 'profile/:name', component: import('./profile'), title: 'Profile' },
    { id: 'editor', path: 'editor/:slug?', component: import('./editor'), title: 'Editor' },
    { id: 'article', path: 'article/:slug', component: import('./article'), title: 'Article' },
  ]
})
@customElement({ name: 'app-root', template })
export class AppRootCustomElement implements ICustomElementViewModel {
  constructor(
    @IUserState readonly $user: IUserState,
    @ITagsState readonly $tags: ITagsState,
  ) {}

  async binding() {
    await Promise.all([
      this.$tags.load(),
      this.$user.load(),
    ]);
  }
}

