import template from './article-meta.html';

import { customElement, IPlatform, IRouter, IRouteViewModel } from 'aurelia';
import { IArticleState, IUserState } from '../state';
import { Article, Profile } from '../api';

@customElement({ name: 'article-meta', template })
export class ArticleMetaCustomElement implements IRouteViewModel {
  get article(): Article { return this.$article.current; }
  get author(): Profile { return this.article.author; }
  get canModify(): boolean { return this.author.username === this.$user.current.username; }
  get busy(): boolean { return this.$article.deletePending || this.$article.toggleFavoritePending; }

  constructor(
    @IPlatform readonly p: IPlatform,
    @IRouter readonly router: IRouter,
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) {}

  toggleFollow(): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$article.toggleFollow();
    });
  }

  toggleFavorite(): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$article.toggleFavorite();
    });
  }

  delete(): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$article.delete();
      await this.router.load('');
    });
  }
}
