import {inject} from 'aurelia-dependency-injection';
import {ArticleService} from "../../shared/services/article-service";
import {CommentService} from "../../shared/services/comment-service";
import {SharedState} from "../../shared/state/shared-state";

@inject(ArticleService, CommentService, SharedState)
export class ArticleComponent {
  article;
  comments;
  myComment;

  constructor(articleService, commentService, sharedState) {
    this.articleService = articleService;
    this.commentService = commentService;
    this.sharedState = sharedState;
  }

  activate(params) {
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

  deleteComment(commentId) {
    this.commentService.destroy(commentId, this.slug)
      .then(() => {
        this.commentService.getList(this.slug)
          .then(comments => this.comments = comments);
      })
  }

}
