import {ApiService} from './api-service';
import { inject } from '@aurelia/kernel';

@inject(ApiService)
export class CommentService {

  constructor(private readonly apiService: ApiService) {
  }

  add(slug, payload) {
    return this.apiService.post(`/articles/${slug}/comments`, {comment: {body: payload}})
      .then(data => data.comment)
  }

  getList(slug) {
    return this.apiService.get(`/articles/${slug}/comments`)
      .then(data => data.comments)
  }

  destroy(commentId, articleSlug) {
    return this.apiService.delete(`/articles/${articleSlug}/comments/${commentId}`)
  }
}
