import template from './index.html';

import { customElement, IRouteViewModel, Params, IPlatform, route } from 'aurelia';
import { IArticleListState, IProfileState, IUserState } from '../state';
import { ArticleListQueryParams, Profile } from '../api';
import { queue } from '../util';

@customElement({ name: 'author-articles', template: '<article-list></article-list>' })
class AuthorArticlesCustomElement implements IRouteViewModel {
  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articles: IArticleListState,
  ) {}

  async load({ name }: Params) {
    const params = ArticleListQueryParams.create({
      ...this.$articles.params,
      favorited: undefined,
      author: name as string,
    });
    await this.$articles.load(params);
  }
}

@customElement({ name: 'favorited-articles', template: '<article-list></article-list>' })
class FavoritedArticlesCustomElement implements IRouteViewModel {
  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articles: IArticleListState,
  ) {}

  async load({ name }: Params) {
    const params = ArticleListQueryParams.create({
      ...this.$articles.params,
      author: undefined,
      favorited: name as string,
    });
    await this.$articles.load(params);
  }
}

@route({
  children: [
    { id: 'author', path: '', component: AuthorArticlesCustomElement, title: 'Profile' },
    { path: 'favorites', component: FavoritedArticlesCustomElement, title: 'Profile' },
  ],
})
@customElement({ name: 'profile-view', template })
export class ProfileViewCustomElement implements IRouteViewModel {
  get isSelf(): boolean { return this.profile.username === this.$user.current.username; }
  get profile(): Profile { return this.$profile.current; }

  constructor(
    @IProfileState readonly $profile: IProfileState,
    @IUserState readonly $user: IUserState,
  ) {}

  async load({ name }: Params) {
    await this.$profile.load(name as string);
  }

  @queue async toggleFollow() {
    await this.$profile.toggleFollow();
  }
}

