import { marked } from 'marked';
import { customElement, IRouteViewModel, Params } from 'aurelia';
import { IArticleState, IUserState } from '../state';
import { ArticleMetaCustomElement } from './article-meta';
import { CommentViewCustomElement } from './comment-view';
import { Article, User, Comment } from '../api';
import { h, queue } from '../util';

@customElement({
  name: 'article-view',
  needsCompile: false,
  dependencies: [
    ArticleMetaCustomElement,
    CommentViewCustomElement,
  ],
  template: `<div class="article-page"><div class="banner"><div class="container"><h1><!--au-start--><!--au-end--><au-m class="au"></au-m></h1><article-meta class="au"></article-meta></div></div><div class="container page"><div class="row article-content"><div class="col-md-12"><div class="au"></div></div></div><hr><div class="article-actions"><article-meta class="au"></article-meta></div><div class="row"><div class="col-xs-12 col-md-8 offset-md-2"><error-list class="au"></error-list><!--au-start--><!--au-end--><au-m class="au"></au-m><!--au-start--><!--au-end--><au-m class="au"></au-m></div></div></div></div>`,
  instructions: [[
    h.bindText('article.title', false),
  ], [
    h.element('article-meta', false, []),
  ], [
    h.bindProp('marked(article.body)', 'innerHTML', 2),
  ], [
    h.element('article-meta', false, []),
  ], [
    h.element('error-list', false, [
      h.bindProp('$article.errors', 'errors', 2),
    ]),
  ], [
    h.templateCtrl('if', [h.bindProp('$user.isAuth', 'value', 2)], {
      template: `<form class="card comment-form au"><div class="card-block"><textarea class="form-control au" placeholder="Write a comment..." rows="3" name="myComment"></textarea></div><div class="card-footer"><img class="comment-author-img au"><button class="btn btn-sm btn-primary au" data-e2e="postCommentBtn">Post Comment</button></div></form>`,
      instructions: [[
        h.bindListener('$event.preventDefault()', 'submit', true, false),
      ], [
        h.bindProp('myComment', 'value', 6),
      ], [
        h.bindProp('user.image', 'src', 2),
      ], [
        h.bindListener('postComment()', 'click', true, false),
      ]],
    }),
  ], [
    h.templateCtrl('repeat', [h.bindIterator('comment of comments', 'items', [])], {
      template: `<comment-view class="au"></comment-view>`,
      instructions: [[
        h.element('comment-view', false, [
          h.bindProp('comment', 'comment', 2),
        ]),
      ]],
    }),
  ]],
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
  ) { }

  async loading({ slug }: Params) {
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
