import { inject } from "@aurelia/kernel";
import { customElement } from "@aurelia/runtime";
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

  public getArticles() {
    const queryParams = {
      author: this.username,
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
    };
    return this.articleService.getList('all', queryParams)
      .then((response) => {
        this.articles.splice(0);
        this.articles.push(...response.articles);
        this.totalPages = Array.from(new Array(Math.ceil(response.articlesCount / this.limit)),
          (_, index) => index + 1);
      });
  }

  public setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
