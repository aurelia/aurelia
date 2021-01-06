import template from './index.html';

import marked from 'marked';
import { customElement, IRouteViewModel, Params } from 'aurelia';
import { IArticleState, IUserState } from '../state';
import { ArticleMetaCustomElement } from './article-meta';
import { CommentViewCustomElement } from './comment-view';
import { Article, User, Comment } from '../api';
import { queue } from '../util';

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

  myComment = '';

  constructor(
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) {}

  async load({ slug }: Params) {
    await Promise.all([
      this.$article.load(slug),
      this.$article.loadComments(slug!),
    ]);
  }

  @queue async postComment() {
    const body = this.myComment;
    await this.$article.addComment(body);
    this.myComment = '';
  }
}
