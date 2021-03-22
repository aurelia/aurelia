import template from './favorited-articles.html';

import { customElement, IPlatform } from 'aurelia';
import { IRouteableComponent, Parameters } from 'jwx-router';
import { IArticleListState } from '../state';
import { ArticleListQueryParams } from '../api';

@customElement({ name: 'favorited-articles', template })
export class FavoritedArticles implements IRouteableComponent {
  static parameters: string[] = ['name'];

  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articles: IArticleListState,
  ) { }

  async load({ name }: Parameters) {
    const params = ArticleListQueryParams.create({
      ...this.$articles.params,
      author: undefined,
      favorited: name as string,
    });
    await this.$articles.load(params);
  }
}
