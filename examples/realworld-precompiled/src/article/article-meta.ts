import { customElement, IRouter, IRouteViewModel } from 'aurelia';
import { IArticleState, IUserState } from '../state';
import { Article, Profile } from '../api';
import { h, queue } from '../util';

@customElement({
  name: 'article-meta',
  needsCompile: false,
  template: `<div class="article-meta"><a class="au"><img class="au"></a><div class="info"><a class="author au"><!--au-start--><!--au-end--><au-m class="au"></au-m></a><span class="date"><!--au-start--><!--au-end--><au-m class="au"></au-m></span></div><!--au-start--><!--au-end--><au-m class="au"></au-m><!--au-start--><!--au-end--><au-m class="au"></au-m></div>`,
  instructions: [[
    h.attr('href', [
      h.interpolation('/profile/${author.username}', 'value'),
    ]),
  ], [
    h.bindProp('author.image', 'src', 2),
  ], [
    h.attr('href', [
      h.interpolation('/profile/${author.username}', 'value'),
    ]),
  ], [
    h.bindText('author.username', false),
  ], [
    h.bindText('article.createdAt|date', false),
  ], [
    h.templateCtrl('if', [h.bindProp('canModify', 'value', 2)], {
      template: `<span><a class="btn btn-outline-secondary btn-sm au"><i class="ion-edit"></i>&nbsp;Edit Article</a>&nbsp;&nbsp;<button class="btn btn-outline-danger btn-sm au" data-e2e="deleteBtn"><i class="ion-trash-a"></i>&nbsp;Delete Article</button></span>`,
      instructions: [[
        h.attr('href', [
          h.interpolation('/editor/${article.slug}', 'value'),
        ]),
      ], [
        h.bindListener('delete()', 'click', true, false),
      ]],
    }),
  ], [
    h.templateCtrl('else', [h.setProp('', 'value')], {
      template: `<span><button class="btn btn-sm btn-outline-secondary au" data-e2e="toggleFollowBtn"><i class="ion-plus-round"></i>&nbsp;<!--au-start--><!--au-end--><au-m class="au"></au-m> <!--au-start--><!--au-end--><au-m class="au"></au-m></button>&nbsp;&nbsp;<button data-e2e="toggleFavoriteBtn" class="au"><i class="ion-heart"></i>&nbsp;<!--au-start--><!--au-end--><au-m class="au"></au-m> Post<span class="counter">(<!--au-start--><!--au-end--><au-m class="au"></au-m>)</span></button></span>`,
      instructions: [[
        h.bindListener('toggleFollow()', 'click', true, false),
      ], [
        h.bindText('author.following?"Unfollow":"Follow"', false),
      ], [
        h.bindText('author.username', false),
      ], [
        h.interpolation('btn btn-sm ${article.favorited?"btn-primary":"btn-outline-primary"}', 'class'),
        h.bindListener('toggleFavorite()', 'click', true, false),
      ], [
        h.bindText('article.favorited?"Unfavorite":"Favorite"', false),
      ], [
        h.bindText('article.favoritesCount', false),
      ]],
    }),
  ]],
})
export class ArticleMetaCustomElement implements IRouteViewModel {
  get article(): Article { return this.$article.current; }
  get author(): Profile { return this.article.author; }
  get canModify(): boolean { return this.author.username === this.$user.current.username; }

  constructor(
    @IRouter readonly router: IRouter,
    @IUserState readonly $user: IUserState,
    @IArticleState readonly $article: IArticleState,
  ) { }

  @queue async toggleFollow() {
    await this.$article.toggleFollow();
  }

  @queue async toggleFavorite() {
    await this.$article.toggleFavorite();
  }

  @queue async delete() {
    await this.$article.delete();
    await this.router.load('');
  }
}
