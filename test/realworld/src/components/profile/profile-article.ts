import { inject } from "@aurelia/kernel";
import { lifecycleLogger } from '@aurelia/router';
import { getPages } from "shared/get-pages";
import { Article } from "shared/models/article";
import { ArticleService } from "shared/services/article-service";

// @lifecycleLogger('profile-article')
@inject(ArticleService)
export class ProfileArticle {
  public static parameters: string[] = ['name'];

  private articles: Article[] = [];
  private readonly pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private readonly limit = 10;
  private username?: string;

  public constructor(private readonly articleService: ArticleService) {
  }

  public canEnter() { console.log(`profile-article canEnter`); return true; }
  public created() { console.log(`profile-article created`); }
  public binding() { console.log(`profile-article binding`); }
  public bound() { console.log(`profile-article bound`); }
  public attaching() { console.log(`profile-article attaching`); }
  public attached() { console.log(`profile-article attached`); }
  public canLeave() { console.log(`profile-article canLeave`); return true; }
  public leave() { console.log(`profile-article leave`); }
  public detaching() { console.log(`profile-article detaching`); }
  public detached() { console.log(`profile-article detached`); }
  public unbinding() { console.log(`profile-article unbinding`); }
  public unbound() { console.log(`profile-article unbound`); }

  public enter(params: any) {
    console.log(`profile-article enter`);
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
    this.articles = [...response.articles];
    this.totalPages = getPages(response.articlesCount, this.limit);
  }

  public async setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    await this.getArticles();
  }
}
