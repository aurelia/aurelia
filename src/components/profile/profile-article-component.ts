import { ArticleService } from "../../shared/services/article-service";
import { inject } from "@aurelia/kernel";

@inject(ArticleService)
export class ProfileArticleComponent {
  articles = [];
  pageNumber: any;
  totalPages: number[];
  currentPage = 1;
  limit = 10;
  username: any;

  constructor(private readonly articleService: ArticleService) {
  }

  activate(params: { name: any; }, routeConfig: any) {
    this.username = params.name;
    return this.getArticles();
  }

  getArticles() {
    let queryParams = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
      author: this.username
    };
    return this.articleService.getList('all', queryParams)
      .then(response => {
        this.articles.splice(0);
        this.articles.push(...response.articles)

        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(new Array(Math.ceil(response.articlesCount / this.limit)), (val, index) => index + 1);
      })
  }

  setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
