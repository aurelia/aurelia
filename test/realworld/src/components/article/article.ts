import { inject } from "@aurelia/kernel";
import { customElement } from "@aurelia/runtime";
import { Article } from "shared/models/article";
import { Comment } from "shared/models/comment";
import { ArticleService } from "shared/services/article-service";
import { CommentService } from "shared/services/comment-service";
import { SharedState } from "shared/state/shared-state";
import template from './article.html';

@inject(ArticleService, CommentService, SharedState)
@customElement({ name: 'article', template })
export class ArticleComponent {
  private article?: Article;
  private comments?: Comment[];
  private myComment: string = '';
  private slug: any;

  constructor(private readonly articleService: ArticleService,
              private readonly commentService: CommentService,
              private readonly sharedState: SharedState) {
  }

  public async enter(params: { slug: any; }) {
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
