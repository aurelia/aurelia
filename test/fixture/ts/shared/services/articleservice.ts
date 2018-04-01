import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class ArticleService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  // tslint:disable-next-line:no-reserved-keywords
  public getList(type: string, params?: any): Promise<any> {
    return this.apiService.get(`/articles${(type === "feed" ? "/feed" : "")}`, params);
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get(slug: string): Promise<any> {
    return this.apiService.get<any>(`/articles/${slug}`).then(data => data.article);
  }

  public destroy(slug: string): Promise<any> {
    return this.apiService.delete(`/articles/${slug}`);
  }

  public save(article: any): Promise<any> {
    if (article.slug) {
      // If we're updating an existing article
      return this.apiService.put(`/articles/${article.slug}`, { article: article }).then(data => data.article);
    } else {
      // Otherwise, create a new article
      return this.apiService.post("/articles/", { article: article }).then(data => data.article);
    }
  }

  public favorite(slug: string): Promise<any> {
    return this.apiService.post(`/articles/${slug}/favorite`);
  }

  public unfavorite(slug: string): Promise<any> {
    return this.apiService.delete(`/articles/${slug}/favorite`);
  }
}
