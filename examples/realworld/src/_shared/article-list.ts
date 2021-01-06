import template from './article-list.html';

import { customElement } from 'aurelia';
import { IArticleListState } from '../state';
import { queue } from '../util';

@customElement({ name: 'article-list', template })
export class ArticleListCustomElement {
  constructor(
    @IArticleListState readonly $articleList: IArticleListState,
  ) {}

  @queue async toggleFavorite(slug: string) {
    await this.$articleList.toggleFavorite(slug);
  }

  @queue async setPage(page: number) {
    const params = this.$articleList.params;
    await this.$articleList.load(params.clone({
      offset: params.limit * (page - 1),
    }));
  }
}
