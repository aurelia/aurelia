import { inject } from "@aurelia/kernel";
import { customElement } from "@aurelia/runtime";
import { Article } from "models/article";
import { getPages } from "shared/get-pages";
import { ArticleService } from "shared/services/article-service";
import template from './profile-favorites-component.html';
@inject(ArticleService)
@customElement({ name: 'profile-favorites-component', template })
export class ProfileFavoritesComponent {
  private articles: Article[] = [];
  private pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private limit = 10;
  private username: any;

  constructor(private readonly articleService: ArticleService) {
  }

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
