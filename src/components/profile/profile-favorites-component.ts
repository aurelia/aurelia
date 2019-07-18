import { ArticleService } from "shared/services/article-service";
import { inject } from "@aurelia/kernel";
import { customElement } from "@aurelia/runtime";
import template from './profile-favorites-component.html';
import { Article } from "models/article";
@inject(ArticleService)
@customElement({ name: 'profile-favorites-component', template: template })
export class ProfileFavoritesComponent {
  private articles: Article[] = [];
  private pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private limit = 10;
  private username: any;

  constructor(private readonly articleService: ArticleService) {
  }

  enter(params: { name: string }) {
    console.log(params);
    this.username = params.name;
    return this.getArticles();
  }

  getArticles() {
    let queryParams = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
      favorited: this.username
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
