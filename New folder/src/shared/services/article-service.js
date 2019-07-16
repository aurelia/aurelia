import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './api-service';

@inject(ApiService)
export class ArticleService {

  constructor(apiService) {
    this.apiService = apiService;
  }

  getList(type, params) {
    return this.apiService.get('/articles' + ((type === 'feed') ? '/feed' : ''), params)
  }

  get(slug) {
    return this.apiService.get('/articles/' + slug)
      .then(data => data.article)
  }

  destroy(slug) {
    return this.apiService.delete('/articles/' + slug)
  }

  save(article) {
    if (article.slug) {
      // If we're updating an existing article
      return this.apiService.put('/articles/' + article.slug, {article: article})
        .then(data => data.article)
    } else {
      // Otherwise, create a new article
      return this.apiService.post('/articles/', {article: article})
        .then(data => data.article)
    }
  }

  favorite(slug) {
    return this.apiService.post('/articles/' + slug + '/favorite')
  }

  unfavorite(slug) {
    return this.apiService.delete('/articles/' + slug + '/favorite')
  }

}
