import template from './index.html';

import marked from 'marked';
import { customElement, IPlatform, IRouteViewModel, Params } from 'aurelia';
import { IArticleState, IUserState } from '../state';
import { ArticleMetaCustomElement } from './article-meta';
import { CommentViewCustomElement } from './comment-view';
import { Article, User, Comment } from '../api';

@customElement({
  name: 'article-view',
  template,
  dependencies: [
    ArticleMetaCustomElement,
    CommentViewCustomElement,
  ],
})
export class ArticleViewCustomElement implements IRouteViewModel {
  marked = marked;
  get article(): Article { return this.$article.current; }
  get comments(): Comment[] { return this.$article.comments; }
  get user(): User { return this.$user.current; }

  get commentsBusy(): boolean { return this.$article.loadCommentsPending || this.$article.addCommentPending; }

  myComment = '';

  constructor(
    @IPlatform readonly p: IPlatform,
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) {}

  load({ slug }: Params): void {
    this.p.taskQueue.queueTask(async () => {
      await Promise.all([
        this.$article.load(slug),
        this.$article.loadComments(slug!),
      ]);
    });
  }

  postComment(): void {
    this.p.taskQueue.queueTask(async () => {
      const body = this.myComment;
      await this.$article.addComment(body);
      this.myComment = '';
    });
  }
}
