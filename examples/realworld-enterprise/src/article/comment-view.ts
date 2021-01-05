import template from './comment-view.html';

import { bindable, customElement, IPlatform, IRouteViewModel } from 'aurelia';
import { Comment } from '../api';
import { IArticleState, IUserState } from '../state';

@customElement({ name: 'comment-view', template })
export class CommentViewCustomElement implements IRouteViewModel {
  @bindable() comment!: Comment;
  get canModify(): boolean { return this.comment.author.username === this.$user.current.username; }

  constructor(
    @IPlatform readonly p: IPlatform,
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) {}

  delete(): void {
    this.p.taskQueue.queueTask(async () => {
      await this.$article.deleteComment(this.comment.id);
    });
  }
}
