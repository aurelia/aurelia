import { inject } from '@aurelia/kernel';

import { Article } from 'models/article';
import { getPages } from 'shared/get-pages';
import { ArticleService } from 'shared/services/article-service';

@inject(ArticleService)
export class ProfileFavorites {
  public static parameters: string[] = ['name'];

  private readonly articles: Article[] = [];
  private readonly pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private readonly limit = 10;
  private username: any;

  public constructor(
    private readonly articleService: ArticleService,
  ) {}

  public async enter(params: { name: string }) {
    this.username = params.name;
    await this.getArticles();
  }

  public async getArticles() {
    const queryParams = {
      favorited: this.username,
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
    };

    const response = await this.articleService.getList('all', queryParams);
    this.articles.splice(0);
    this.articles.push(...response.articles);
    this.totalPages = getPages(response.articlesCount, this.limit);
  }

  public async setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    await this.getArticles();
  }
}
