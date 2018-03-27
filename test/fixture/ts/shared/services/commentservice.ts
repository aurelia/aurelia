import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class CommentService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  public add(slug: string, payload: any): Promise<any> {
    return this.apiService
      .post(`/articles/${slug}/comments`, { comment: { body: payload } })
      .then(data => data.comment);
  }

  public getList(slug: string): Promise<any> {
    return this.apiService.get<any>(`/articles/${slug}/comments`).then(data => data.comments);
  }

  public destroy(commentId: string, articleSlug: string): Promise<any> {
    return this.apiService.delete(`/articles/${articleSlug}/comments/${commentId}`);
  }
}
