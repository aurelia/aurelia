import template from './comment-view.html';

import { bindable, customElement } from 'aurelia';
import { IRouteableComponent } from 'aurelia-direct-router';
import { Comment } from '../api';
import { IArticleState, IUserState } from '../state';
import { queue } from '../util';

@customElement({ name: 'comment-view', template })
export class CommentViewCustomElement implements IRouteableComponent {
  @bindable() comment!: Comment;
  get canModify(): boolean { return this.comment.author.username === this.$user.current.username; }

  constructor(
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) { }

  @queue async delete() {
    await this.$article.deleteComment(this.comment.id);
  }
}
