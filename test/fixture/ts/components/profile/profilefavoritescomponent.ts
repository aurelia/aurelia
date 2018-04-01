import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig } from "aurelia-router";
import { ArticleService } from "../../shared/services/articleservice";

@autoinject()
export class ProfileFavoritesComponent {
  public articles: any[] = [];
  public pageNumber: number | undefined;
  public totalPages: number[] = [];
  public currentPage: number = 1;
  public limit: number = 10;

  public articleService: ArticleService;

  public username: string | undefined;

  constructor(articleService: ArticleService) {
    this.articleService = articleService;
  }

  public activate(params: any, _routeConfig: RouteConfig): Promise<void> {
    this.username = params.name;

    return this.getArticles();
  }

  public getArticles(): Promise<void> {
    const queryParams = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
      favorited: this.username
    };

    return this.articleService.getList("all", queryParams).then(response => {
      this.articles.splice(0);
      this.articles.push(...response.articles);

      // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
      this.totalPages = Array.from([Math.ceil(response.articlesCount / this.limit)], (_val, index) => index + 1);
    });
  }

  public setPageTo(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
