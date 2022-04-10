import template from './article-list.html';

import { customElement } from 'aurelia';
import { IRouteableComponent, Parameters, RoutingInstruction } from '@aurelia/router';
import { ArticleListQueryParams, FeedArticleListQueryParams } from '../api';
import { IArticleListState } from '../state';
import { queue } from '../util';

@customElement({ name: 'article-list', template, aliases: ['author-articles', 'favorited-articles'] })
export class ArticleList implements IRouteableComponent {
  componentName = 'article-list';

  constructor(
    @IArticleListState readonly $articleList: IArticleListState,
  ) { }

  get tag(): string | undefined {
    return (this.$articleList.params as ArticleListQueryParams).tag;
  }

  get modeFilter(): string {
    return this.componentName === 'article-list' && this.tag === undefined
      ? `mode=${this.$articleList.params.type},` : '';
  }

  get tagFilter(): string {
    return this.tag !== undefined ? `tag=${this.tag},` : '';
  }

  async load({ mode, page, tag, name }: Parameters, instruction: RoutingInstruction): Promise<void> {
    // Component serves as three so set the right name
    this.componentName = instruction.component.name ?? 'article-list';

    // Set the right filter to name based on component
    const author = this.componentName === 'author-articles' ? name : undefined;
    const favorited = this.componentName === 'favorited-articles' ? name : undefined;

    // If it's filtered on tag, force into mode 'all'
    mode = typeof tag === 'string' ? 'all' : (mode ?? this.$articleList.params.type);

    const limit = this.$articleList.params.limit;
    const offset = typeof page === 'string'
      ? limit * (+page - 1)
      : this.$articleList.params.offset;

    const params = (mode === 'all' ? ArticleListQueryParams : FeedArticleListQueryParams)
      .create({
        author: author as string,
        favorited: favorited as string,
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
