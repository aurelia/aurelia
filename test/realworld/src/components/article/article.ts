import { Article as ArticleModel} from 'shared/models/article';
import { Comment } from 'shared/models/comment';
import { IArticleService } from 'shared/services/article-service';
import { ICommentService } from 'shared/services/comment-service';
import { ISharedState } from 'shared/state/shared-state';

export class Article {
  private article?: ArticleModel;
  private comments?: Comment[];
  private myComment: string = '';
  private slug: any;

  public constructor(
    @IArticleService private readonly articleService: IArticleService,
    @ICommentService private readonly commentService: ICommentService,
    @ISharedState private readonly sharedState: ISharedState,
  ) {}

  public async enter(params: { slug: any }) {
    this.slug = params.slug;

    const result = await Promise.all([this.articleService.get(this.slug), this.commentService.getList(this.slug)]);
    this.article = result[0];
    this.comments = result[1];
  }

  public async postComment() {
    if (!this.myComment) { return; }
    const comment = await this.commentService.add(this.slug, this.myComment);
    if (!this.comments) { this.comments = []; }
    this.comments.push(comment);
    this.myComment = '';
  }

  public async deleteComment(commentId: any) {
    await this.commentService.destroy(commentId, this.slug);
    await this.commentService.getList(this.slug);
  }
}
