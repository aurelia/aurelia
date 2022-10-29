import { bindable, customElement, IRouteViewModel } from 'aurelia';
import { Comment } from '../api';
import { IArticleState, IUserState } from '../state';
import { h, queue } from '../util';

@customElement({
  name: 'comment-view',
  needsCompile: false,
  template: `<div class="card"><div class="card-block"><p class="card-text"><!--au-start--><!--au-end--><au-m class="au"></au-m></p></div><div class="card-footer"><a class="comment-author au"><img class="comment-author-img au"></a>&nbsp;<a class="comment-author au"><!--au-start--><!--au-end--><au-m class="au"></au-m></a><span class="date-posted"><!--au-start--><!--au-end--><au-m class="au"></au-m></span><!--au-start--><!--au-end--><au-m class="au"></au-m></div></div>`,
  instructions: [[
    h.bindText('comment.body', false),
  ], [
    h.attr('href', [
      h.interpolation('/profile/${comment.author.username}', 'value'),
    ]),
  ], [
    h.bindProp('comment.author.image', 'src', 2),
  ], [
    h.attr('href', [
      h.interpolation('/profile/${comment.author.username}', 'value'),
    ]),
  ], [
    h.bindText('comment.author.username', false),
  ], [
    h.bindText('comment.createdAt|date', false),
  ], [
    h.templateCtrl('if', [h.bindProp('canModify', 'value', 2)], {
      template: `<span class="mod-options"><i class="ion-trash-a au" data-e2e="deleteBtn"></i></span>`,
      instructions: [[
        h.bindListener('delete()', 'click', true, false),
      ]],
    }),
  ]],
})
export class CommentViewCustomElement implements IRouteViewModel {
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
