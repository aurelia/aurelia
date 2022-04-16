import template from './article-meta.html';

import { customElement } from 'aurelia';
import { IRouter, IRouteableComponent } from '@aurelia/router';
import { IArticleState, IUserState } from '../state';
import { Article, Profile } from '../api';
import { queue } from '../util';

@customElement({ name: 'article-meta', template })
export class ArticleMetaCustomElement implements IRouteableComponent {
  get article(): Article { return this.$article.current; }
  get author(): Profile { return this.article.author; }
  get canModify(): boolean { return this.author.username === this.$user.current.username; }

  constructor(
    @IRouter readonly router: IRouter,
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) {}

  @queue async toggleFollow() {
    await this.$article.toggleFollow();
  }

  @queue async toggleFavorite() {
    await this.$article.toggleFavorite();
  }

  @queue async delete() {
    await this.$article.delete();
    await this.router.load('');
  }
}
