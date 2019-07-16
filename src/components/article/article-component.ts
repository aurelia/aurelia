import { ArticleService } from "../../shared/services/article-service";
import { CommentService } from "../../shared/services/comment-service";
import { SharedState } from "../../shared/state/shared-state";
import { inject } from "@aurelia/kernel";

@inject(ArticleService, CommentService, SharedState)
export class ArticleComponent {
  article: any;
  comments: any[];
  myComment: string;
  slug: any;

  constructor(private readonly articleService: ArticleService, private readonly commentService: CommentService, private readonly sharedState: SharedState) {
  }

  activate(params: { slug: any; }) {
    this.slug = params.slug;

    return this.articleService.get(this.slug)
      .then(article => {
        this.article = article;
        this.commentService.getList(this.slug)
          .then(comments => this.comments = comments);
      });
  }

  postComment() {
    return this.commentService.add(this.slug, this.myComment)
      .then(comment => {
        this.comments.push(comment);
        this.myComment = '';
      })
  }

  deleteComment(commentId: any) {
    this.commentService.destroy(commentId, this.slug)
      .then(() => {
        this.commentService.getList(this.slug)
          .then(comments => this.comments = comments);
      })
  }

}
