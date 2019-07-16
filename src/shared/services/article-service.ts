import { ApiService } from './api-service';
import { inject } from '@aurelia/kernel';

@inject(ApiService)
export class ArticleService {

  constructor(private readonly apiService: ApiService) {
  }

  getList(type: string, params: any) {
    return this.apiService.get('/articles' + ((type === 'feed') ? '/feed' : ''), params)
  }

  get(slug: string) {
    return this.apiService.get('/articles/' + slug)
      .then((data: { article: any; }) => data.article)
  }

  destroy(slug: string) {
    return this.apiService.delete('/articles/' + slug)
  }

  save(article: { slug: string; }) {
    if (article.slug) {
      // If we're updating an existing article
      return this.apiService.put('/articles/' + article.slug, { article: article })
        .then(data => data.article)
    } else {
      // Otherwise, create a new article
      return this.apiService.post('/articles/', { article: article })
        .then(data => data.article)
    }
  }

  favorite(slug: string) {
    return this.apiService.post('/articles/' + slug + '/favorite')
  }

  unfavorite(slug: string) {
    return this.apiService.delete('/articles/' + slug + '/favorite')
  }

}
