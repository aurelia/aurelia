import template from './app-root.html';

import { customElement, route, ICustomElementViewModel, IPlatform } from 'aurelia';

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
    @IPlatform readonly p: IPlatform,
    @IUserState readonly $user: IUserState,
    @ITagsState readonly $tags: ITagsState,
  ) {
    p.taskQueue.queueTask(async () => {
      // tags can be loaded anonymously and no other state depends on it, so just initiate it asynchronously as early as we can.
      await $tags.load();
    });
  }

  async attaching(): Promise<void> {
    // various things depend on user/auth state, so by returning the promise from `attaching` (`binding` and `bound` would also work)
    // we make sure this is awaited before the router starts its invocations
    await this.$user.load();
  }
}

