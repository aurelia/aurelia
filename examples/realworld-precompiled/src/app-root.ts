import { customElement, route, ICustomElementViewModel } from 'aurelia';

import { ITagsState, IUserState } from './state';
import { h } from './util';

@route({
  routes: [
    { id: 'home', path: '', component: import('./home'), title: 'Home' },
    { path: 'login', component: import('./auth'), title: 'Sign in' },
    { path: 'register', component: import('./auth'), title: 'Sign up' },
    { path: 'settings', component: import('./settings'), title: 'Settings' },
    { id: 'profile', path: 'profile/:name', component: import('./profile'), title: 'Profile' },
    { id: 'editor', path: 'editor/:slug?', component: import('./editor'), title: 'Editor' },
    { id: 'article', path: 'article/:slug', component: import('./article'), title: 'Article' },
  ]
})
@customElement({
  name: 'app-root',
  needsCompile: false,
  template: `<nav class="navbar navbar-light"><div class="container"><a class="navbar-brand au">conduit</a><ul class="nav navbar-nav pull-xs-right"><li class="nav-item au"><a class="nav-link au">Home</a></li><li class="nav-item au"><a class="nav-link au"><i class="ion-compose"></i>&nbsp;New Post</a></li><li class="nav-item au"><a class="nav-link au"><i class="ion-gear-a"></i>&nbsp;Settings</a></li><li class="nav-item au"><a class="nav-link au">Sign in</a></li><li class="nav-item au"><a class="nav-link au">Sign up</a></li><li class="nav-item au"><a class="nav-link au"><!--au-start--><!--au-end--><au-m class="au"></au-m></a></li></ul></div></nav><au-viewport class="au"></au-viewport><footer><div class="container"><a class="logo-font au">conduit</a><span class="attribution">An interactive learning project from <a class="au">Thinkster</a>. Code &amp; design licensed under MIT.</span></div></footer>`,
  instructions: [[
    h.attr('load', [
      h.setProp('home', 'route'),
      h.bindProp('_home', 'active', 4),
    ]),
  ], [
    h.bindAttr('class', '_home', 'active'),
  ], [
    h.attr('load', [
      h.setProp('home', 'route'),
      h.bindProp('_home', 'active', 4),
    ]),
  ], [
    h.attr('show', [
      h.bindProp('$user.isAuth', 'value', 2),
    ]),
    h.bindAttr('class', '_editor', 'active'),
  ], [
    h.attr('load', [
      h.setProp('editor', 'route'),
      h.bindProp('_editor', 'active', 4),
    ]),
  ], [
    h.attr('show', [
      h.bindProp('$user.isAuth', 'value', 2),
    ]),
    h.bindAttr('class', '_settings', 'active'),
  ], [
    h.attr('load', [
      h.setProp('settings', 'route'),
      h.bindProp('_settings', 'active', 4),
    ]),
  ], [
    h.attr('show', [
      h.bindProp('!$user.isAuth', 'value', 2),
    ]),
    h.bindAttr('class', '_login', 'active'),
  ], [
    h.attr('load', [
      h.setProp('login', 'route'),
      h.bindProp('_login', 'active', 4),
    ]),
  ], [
    h.attr('show', [
      h.bindProp('!$user.isAuth', 'value', 2),
    ]),
    h.bindAttr('class', '_register', 'active'),
  ], [
    h.attr('load', [
      h.setProp('register', 'route'),
      h.bindProp('_register', 'active', 4),
    ]),
  ], [
    h.attr('show', [
      h.bindProp('$user.isAuth', 'value', 2),
    ]),
    h.bindAttr('class', '_profile', 'active'),
  ], [
    h.attr('load', [
      h.setProp('profile', 'route'),
      h.bindProp(`{'name':$user.current.username}`, 'params', 2),
      h.bindProp('_profile', 'active', 4),
    ]),
  ], [
    h.bindText('$user.current.username', false),
  ], [
    h.element('au-viewport', false, []),
  ], [
    h.attr('href', [
      h.setProp('/', 'value'),
    ]),
  ], [
    h.attr('href', [
      h.setProp('https://thinkster.io', 'value'),
    ]),
  ]],
})
export class AppRootCustomElement implements ICustomElementViewModel {
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
