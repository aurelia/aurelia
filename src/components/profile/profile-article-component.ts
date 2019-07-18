import { inject } from "@aurelia/kernel";
import { customElement } from "@aurelia/runtime";
import { getPages } from "shared/get-pages";
import { Article } from "shared/models/article";
import { ArticleService } from "shared/services/article-service";
import template from './profile-article-component.html';
@inject(ArticleService)
@customElement({ name: 'profile-article-component', template })
export class ProfileArticleComponent {
  private articles: Article[] = [];
  private pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private limit = 10;
  private username?: string;

  constructor(private readonly articleService: ArticleService) {
  }

  public enter(params: any) {
    this.username = params.name;
    return this.getArticles();
  }

  public async getArticles() {
    const queryParams = {
      author: this.username,
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
