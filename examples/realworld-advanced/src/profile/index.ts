import template from './index.html';

import { customElement, IRouteViewModel, Params, IPlatform,  route, IRouter } from 'aurelia';
import { IArticleListState, IProfileState, IUserState } from '../state';
import { ArticleListQueryParams, Profile } from '../api';

@customElement({ name: 'author-articles', template: '<article-list></article-list>' })
class AuthorArticlesCustomElement implements IRouteViewModel {
  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articles: IArticleListState,
  ) {}

  load({ name }: Params): void {
    this.p.taskQueue.queueTask(async () => {
      const params = ArticleListQueryParams.create({
        ...this.$articles.params,
        favorited: undefined,
        author: name as string,
      });
      await this.$articles.load(params);
    });
  }
}

@customElement({ name: 'favorited-articles', template: '<article-list></article-list>' })
class FavoritedArticlesCustomElement implements IRouteViewModel {
  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articles: IArticleListState,
  ) {}

  load({ name }: Params): void {
    this.p.taskQueue.queueTask(async () => {
      const params = ArticleListQueryParams.create({
        ...this.$articles.params,
        author: undefined,
        favorited: name as string,
      });
      await this.$articles.load(params);
    });
  }
}

@route({
  routes: [
    { id: 'author', path: '', component: AuthorArticlesCustomElement, title: 'Profile' },
    { path: 'favorites', component: FavoritedArticlesCustomElement, title: 'Profile' },
  ],
})
@customElement({ name: 'profile-view', template })
export class ProfileViewCustomElement implements IRouteViewModel {
  get isSelf(): boolean { return this.profile.username === this.$user.current.username; }
  get profile(): Profile { return this.$profile.current; }

  constructor(
    @IPlatform readonly p: IPlatform,
    @IProfileState readonly $profile: IProfileState,
    @IUserState readonly $user: IUserState,
  ) {}

  load({ name }: Params): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$profile.load(name as string);
    });
  }

  toggleFollow(): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$profile.toggleFollow();
    });
  }
}

