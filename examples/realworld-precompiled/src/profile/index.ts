import { customElement, IRouteViewModel, Params, IPlatform, route } from 'aurelia';
import { IArticleListState, IProfileState, IUserState } from '../state';
import { ArticleListQueryParams, Profile } from '../api';
import { h, queue } from '../util';

@customElement({
  name: 'author-articles',
  needsCompile: false,
  template: `<article-list class="au"></article-list>`,
  instructions: [[
    h.element('article-list', false, []),
  ]],
})
class AuthorArticlesCustomElement implements IRouteViewModel {
  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articles: IArticleListState,
  ) { }

  async loading({ name }: Params) {
    const params = ArticleListQueryParams.create({
      ...this.$articles.params,
      favorited: undefined,
      author: name as string,
    });
    await this.$articles.load(params);
  }
}

@customElement({
  name: 'favorited-articles',
  needsCompile: false,
  template: `<article-list class="au"></article-list>`,
  instructions: [[
    h.element('article-list', false, []),
  ]],
})
class FavoritedArticlesCustomElement implements IRouteViewModel {
  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articles: IArticleListState,
  ) { }

  async loading({ name }: Params) {
    const params = ArticleListQueryParams.create({
      ...this.$articles.params,
      author: undefined,
      favorited: name as string,
    });
    await this.$articles.load(params);
  }
}

@route({
  routes: [
    { id: 'author', path: '', component: AuthorArticlesCustomElement, title: 'Profile' },
    { path: 'favorites', component: FavoritedArticlesCustomElement, title: 'Profile' },
  ],
})
@customElement({
  name: 'profile-view',
  needsCompile: false,
  template: `<div class="profile-page"><div class="user-info"><div class="container"><div class="row"><div class="col-xs-12 col-md-10 offset-md-1"><img class="user-img au"><h4><!--au-start--><!--au-end--><au-m class="au"></au-m></h4><p><!--au-start--><!--au-end--><au-m class="au"></au-m></p><!--au-start--><!--au-end--><au-m class="au"></au-m><!--au-start--><!--au-end--><au-m class="au"></au-m></div></div></div></div><div class="container"><div class="row"><div class="col-xs-12 col-md-10 offset-md-1"><div class="articles-toggle"><ul class="nav nav-pills outline-active"><li class="nav-item"><a class="nav-link au">My Posts</a></li><li class="nav-item"><a class="nav-link au">Favorited Posts</a></li></ul></div><au-viewport class="au"></au-viewport></div></div></div></div>`,
  instructions: [[
    h.bindProp('profile.image', 'src', 2),
  ], [
    h.bindText('profile.username', false),
  ], [
    h.bindText('profile.bio', false),
  ], [
    h.templateCtrl('if', [h.bindProp('!isSelf', 'value', 2)], {
      template: `<button class="btn btn-sm btn-outline-secondary action-btn au" data-e2e="toggleFollowBtn"><i class="ion-plus-round"></i>&nbsp;<!--au-start--><!--au-end--><au-m class="au"></au-m> <!--au-start--><!--au-end--><au-m class="au"></au-m></button>`,
      instructions: [[
        h.bindListener('toggleFollow()', 'click', true, false),
      ], [
        h.bindText('profile.following?"Unfollow":"Follow"', false),
      ], [
        h.bindText('profile.username', false),
      ]],
    }),
  ], [
    h.templateCtrl('if', [h.bindProp('isSelf', 'value', 2)], {
      template: `<a class="btn btn-sm btn-outline-secondary action-btn au"><i class="ion-gear-a"></i> Edit Profile Settings</a>`,
      instructions: [[
        h.attr('href', [
          h.setProp('/settings', 'value'),
        ]),
      ]],
    }),
  ], [
    h.attr('load', [
      h.setProp('author', 'route'),
      h.bindProp('_author', 'active', 4),
    ]),
    h.bindAttr('class', '_author', 'active'),
  ], [
    h.attr('load', [
      h.setProp('favorites', 'route'),
      h.bindProp('_favorites', 'active', 4),
    ]),
    h.bindAttr('class', '_favorites', 'active'),
  ], [
    h.element('au-viewport', false, []),
  ]],
})
export class ProfileViewCustomElement implements IRouteViewModel {
  get isSelf(): boolean { return this.profile.username === this.$user.current.username; }
  get profile(): Profile { return this.$profile.current; }

  constructor(
    @IProfileState readonly $profile: IProfileState,
    @IUserState readonly $user: IUserState,
  ) { }

  async loading({ name }: Params) {
    await this.$profile.load(name as string);
  }

  @queue async toggleFollow() {
    await this.$profile.toggleFollow();
  }
}

