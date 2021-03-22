import template from './article-list.html';

import { customElement } from 'aurelia';
import { IRouteableComponent, Parameters, IRouter } from 'jwx-router';
import { ArticleListQueryParams, FeedArticleListQueryParams } from '../api';
import { IArticleListState } from '../state';
import { queue } from '../util';

@customElement({ name: 'article-list', template })
export class ArticleList implements IRouteableComponent {
  constructor(
    @IArticleListState readonly $articleList: IArticleListState,
  ) { }

  async load({ mode, page, tag }: Parameters) {
    if (typeof tag === 'string') {
      mode = 'all';
    }
    mode = mode ?? this.$articleList.params.type;
    const limit = this.$articleList.params.limit;
    const offset = typeof page === 'string'
      ? limit * (+page - 1)
      : this.$articleList.params.offset;

    const params = (mode === 'all' ? ArticleListQueryParams : FeedArticleListQueryParams)
      .create({
        ...this.$articleList.params,
        limit,
        offset,
        tag: tag as string | undefined
      });
    await this.$articleList.load(params);
  }

  @queue async toggleFavorite(slug: string) {
    await this.$articleList.toggleFavorite(slug);
  }

  // @queue async setPage(page: number) {
  //   const params = this.$articleList.params;
  //   await this.$articleList.load(params.clone({
  //     offset: params.limit * (page - 1),
  //   }));
  // }
}
