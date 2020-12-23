import { DI } from '@aurelia/kernel';

import { Comment } from 'shared/models/comment';
import { IApiService } from './api-service';

export interface ICommentService extends CommentService {}
export const ICommentService = DI.createInterface<ICommentService>('ICommentService').withDefault(x => x.singleton(CommentService));
export class CommentService {
  public constructor(
    @IApiService private readonly apiService: IApiService,
  ) {}

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
