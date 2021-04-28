import template from './article.html';

import marked from 'marked';
import { customElement } from 'aurelia';
import { IRouteableComponent, Parameters } from 'aurelia-direct-router';
import { IArticleState, IUserState } from '../state';
import { ArticleMetaCustomElement } from './article-meta';
import { CommentViewCustomElement } from './comment-view';
import { Article as ArticleData, User, Comment } from '../api';
import { queue } from '../util';

@customElement({
  name: 'article',
  template,
  dependencies: [
    ArticleMetaCustomElement,
    CommentViewCustomElement,
  ],
})
export class Article implements IRouteableComponent {
  static parameters = ['slug'];

  marked = marked;
  get article(): ArticleData { return this.$article.current; }
  get comments(): Comment[] { return this.$article.comments; }
  get user(): User { return this.$user.current; }

  myComment = '';

  constructor(
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) { }

  async load({ slug }: Parameters) {
    await Promise.all([
      this.$article.load(slug as string),
      this.$article.loadComments(slug as string),
    ]);
  }

  @queue async postComment() {
    const body = this.myComment;
    await this.$article.addComment(body);
    this.myComment = '';
  }
}
