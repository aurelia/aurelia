import { inject } from "@aurelia/kernel";
import { customElement } from "@aurelia/runtime";
import { Article } from "shared/models/article";
import { Comment } from "shared/models/comment";
import { ArticleService } from "shared/services/article-service";
import { CommentService } from "shared/services/comment-service";
import { SharedState } from "shared/state/shared-state";
import template from './article-component.html';

@inject(ArticleService, CommentService, SharedState)
@customElement({ name: 'article-component', template })
export class ArticleComponent {
  private article?: Article;
  private comments?: Comment[];
  private myComment: string = '';
  private slug: any;

  constructor(private readonly articleService: ArticleService,
              private readonly commentService: CommentService,
              private readonly sharedState: SharedState) {
  }

  public enter(params: { slug: any; }) {
    this.slug = params.slug;

    return this.articleService.get(this.slug)
      .then((article) => {
        this.article = article;
        this.commentService.getList(this.slug)
          .then((comments) => this.comments = comments);
      });
  }

  public postComment() {
    if (!this.myComment) { return; }
    return this.commentService.add(this.slug, this.myComment)
      .then((comment) => {
        if (!this.comments) { this.comments = []; }
        this.comments.push(comment);
        this.myComment = '';
      });
  }

  public deleteComment(commentId: any) {
    this.commentService.destroy(commentId, this.slug)
      .then(() => {
        this.commentService.getList(this.slug)
          .then((comments) => this.comments = comments);
      });
  }

}
