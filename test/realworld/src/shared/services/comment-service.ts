import { inject } from '@aurelia/kernel';
import { Comment } from 'shared/models/comment';
import { ApiService } from './api-service';

@inject(ApiService)
export class CommentService {

  public constructor(private readonly apiService: ApiService) {
  }

  public async add(slug: string, payload: string): Promise<Comment> {
    const data = await this.apiService.post(`/articles/${slug}/comments`, { comment: { body: payload } });
    return data.comment;
  }

  public async getList(slug: string): Promise<Comment[]> {
    const data = await this.apiService.get(`/articles/${slug}/comments`);
    return data.comments;
  }

  public destroy(commentId: number, articleSlug: string) {
    return this.apiService.delete(`/articles/${articleSlug}/comments/${commentId}`);
  }
}
