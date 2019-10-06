import { inject } from "@aurelia/kernel";
import { lifecycleLogger } from '@aurelia/router';
import { Article } from "models/article";
import { getPages } from "shared/get-pages";
import { ArticleService } from "shared/services/article-service";

// @lifecycleLogger('profile-favorites')
@inject(ArticleService)
export class ProfileFavorites {
  public static parameters: string[] = ['name'];

  private readonly articles: Article[] = [];
  private readonly pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private readonly limit = 10;
  private username: any;

  public constructor(private readonly articleService: ArticleService) {
  }

  public canEnter() { console.log(`profile-favorites canEnter`); return true; }
  public created() { console.log(`profile-favorites created`); }
  public binding() { console.log(`profile-favorites binding`); }
  public bound() { console.log(`profile-favorites bound`); }
  public attaching() { console.log(`profile-favorites attaching`); }
  public attached() { console.log(`profile-favorites attached`); }
  public canLeave() { console.log(`profile-favorites canLeave`); return true; }
  public leave() { console.log(`profile-favorites leave`); }
  public detaching() { console.log(`profile-favorites detaching`); }
  public detached() { console.log(`profile-favorites detached`); }
  public unbinding() { console.log(`profile-favorites unbinding`); }
  public unbound() { console.log(`profile-favorites unbound`); }

  public async enter(params: { name: string }) {
    console.log(`profile-favorites enter`);
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
