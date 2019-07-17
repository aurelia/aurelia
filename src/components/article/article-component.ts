import { ArticleService } from "../../shared/services/article-service";
import { CommentService } from "../../shared/services/comment-service";
import { SharedState } from "../../shared/state/shared-state";
import { inject } from "@aurelia/kernel";
import { customElement } from "@aurelia/runtime";
import template from './article-component.html';

@inject(ArticleService, CommentService, SharedState)
@customElement({ name: 'article-component', template })
export class ArticleComponent {
  article: any;
  comments: any[];
  myComment: string;
  slug: any;

  constructor(private readonly articleService: ArticleService, private readonly commentService: CommentService, private readonly sharedState: SharedState) {
  }

  enter(params: { slug: any; }) {
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
