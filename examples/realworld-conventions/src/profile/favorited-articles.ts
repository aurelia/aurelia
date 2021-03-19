import { IPlatform } from 'aurelia';
import { IRouteableComponent, Parameters } from 'jwx-router';
import { IArticleListState } from '../state';
import { ArticleListQueryParams } from '../api';

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
