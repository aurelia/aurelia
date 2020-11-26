import { DI, inject } from '@aurelia/kernel';

import { Article } from 'shared/models/article';
import { IApiService } from './api-service';

export interface ArticleResponse {
  articles: Article[];
  articlesCount: number;
}

export interface IArticleService extends ArticleService {}
export const IArticleService = DI.createInterface<IArticleService>('IArticleService').withDefault(x => x.singleton(ArticleService));
export class ArticleService {
  public constructor(
    @IApiService private readonly apiService: IApiService,
  ) {}

  public getList(type: string, params: any): Promise<ArticleResponse> {
    return this.apiService.get(`/articles${type === 'feed' ? '/feed' : ''}`, params);
  }

  public async get(slug: string): Promise<Article> {
    const data = await this.apiService.get(`/articles/${slug}`);
    return data.article;
  }

  public destroy(slug: string) {
    return this.apiService.delete(`/articles/${slug}`);
  }

  public async save(article: Article): Promise<Article> {
    if (article.slug) {
      // If we're updating an existing article
      const data = await this.apiService.put(`/articles/${article.slug}`, { article });
      return data.article;
    } else {
      // Otherwise, create a new article
      const result = await this.apiService.post('/articles/', { article });
      return result.article;
    }
  }

  public favorite(slug: string) {
    return this.apiService.post(`/articles/${slug}/favorite`);
  }

  public unfavorite(slug: string) {
    return this.apiService.delete(`/articles/${slug}/favorite`);
  }

}
