import template from './article-list.html';

import { customElement, IPlatform, IRouter } from 'aurelia';
import { IArticleListState, IUserState } from '../state';

@customElement({ name: 'article-list', template })
export class ArticleListCustomElement {
  get busy(): boolean { return this.$articleList.loadPending; }
  toggleFavoritePendingSlugs = new Set<string>();

  constructor(
    @IPlatform readonly p: IPlatform,
    @IRouter readonly router: IRouter,
    @IUserState readonly $user: IUserState,
    @IArticleListState readonly $articleList: IArticleListState,
  ) {}

  toggleFavorite(slug: string): void {
    this.toggleFavoritePendingSlugs.add(slug);
    this.p.taskQueue.queueTask(async () => {
      if (!this.$user.isAuth) {
        await this.router.load('login');
      } else {
        await this.$articleList.toggleFavorite(slug);
      }
      this.toggleFavoritePendingSlugs.delete(slug);
    });
  }

  setPage(page: number): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$articleList.load(this.$articleList.params.clone({
        offset: this.$articleList.params.limit * (page - 1),
      }));
    });
  }
}
