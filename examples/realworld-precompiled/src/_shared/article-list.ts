import { customElement } from 'aurelia';
import { IArticleListState } from '../state';
import { h, queue } from '../util';

@customElement({
  name: 'article-list',
  needsCompile: false,
  template: `<!--au-start--><!--au-end--><au-m class="au"></au-m><!--au-start--><!--au-end--><au-m class="au"></au-m><!--au-start--><!--au-end--><au-m class="au"></au-m>`,
  instructions: [[
    h.templateCtrl('if', [h.bindProp('$articleList.items.length===0', 'value', 2)], {
      template: `<div class="article-preview">No articles are here... yet.</div>`,
      instructions: [],
    }),
  ], [
    h.templateCtrl('repeat', [h.bindIterator('article of $articleList.items', 'items', [])], {
      template: `<div class="article-preview au"><let author.bind="article.author" class="au"></let><div class="article-meta"><a class="au"><img class="au"></a><div class="info"><a class="author au"><!--au-start--><!--au-end--><au-m class="au"></au-m></a><span class="date"><!--au-start--><!--au-end--><au-m class="au"></au-m></span></div><button data-e2e="toggleFavoriteBtn" class="au"><i class="ion-heart"></i><!--au-start--><!--au-end--><au-m class="au"></au-m></button></div><a class="preview-link au"><h1><!--au-start--><!--au-end--><au-m class="au"></au-m></h1><p><!--au-start--><!--au-end--><au-m class="au"></au-m></p><span>Read more...</span><ul class="tag-list"><!--au-start--><!--au-end--><au-m class="au"></au-m></ul></a></div>`,
      instructions: [[
        h.interpolation('${article-article.slug}', 'data-e2e'),
      ], [
        h.letElement(false, [
          h.bindLet('article.author', 'author'),
        ]),
      ], [
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
        h.interpolation('btn btn-sm pull-xs-right ${article.favorited?"btn-primary":"btn-outline-primary"}', 'class'),
        h.bindListener('toggleFavorite(article.slug)', 'click', true, false),
      ], [
        h.bindText('article.favoritesCount', false),
      ], [
        h.attr('href', [
          h.interpolation('/article/${article.slug}', 'value'),
        ]),
      ], [
        h.bindText('article.title', false),
      ], [
        h.bindText('article.description', false),
      ], [
        h.templateCtrl('repeat', [h.bindIterator('tag of article.tagList', 'items', [])], {
          template: `<li class="tag-default tag-pill tag-outline"><!--au-start--><!--au-end--><au-m class="au"></au-m></li>`,
          instructions: [[
            h.bindText('tag', false),
          ]],
        }),
      ]],
    }),
  ], [
    h.templateCtrl('if', [h.bindProp('$articleList.pages.length>1', 'value', 2)], {
      template: `<nav><ul class="pagination"><!--au-start--><!--au-end--><au-m class="au"></au-m></ul></nav>`,
      instructions: [[
        h.templateCtrl('repeat', [h.bindIterator('page of $articleList.pages', 'items', [])], {
          template: `<li class="page-item au"><a class="page-link"><!--au-start--><!--au-end--><au-m class="au"></au-m></a></li>`,
          instructions: [[
            h.bindAttr('class', 'page===$articleList.currentPage', 'active'),
            h.bindListener('setPage(page)', 'click', true, false),
            h.interpolation('${page-pageLink}', 'data-e2e'),
          ], [
            h.bindText('page', false),
          ]],
        }),
      ]],
    }),
  ]],
})
export class ArticleListCustomElement {
  constructor(
    @IArticleListState readonly $articleList: IArticleListState,
  ) { }

  @queue async toggleFavorite(slug: string) {
    await this.$articleList.toggleFavorite(slug);
  }

  @queue async setPage(page: number) {
    const params = this.$articleList.params;
    await this.$articleList.load(params.clone({
      offset: params.limit * (page - 1),
    }));
  }
}

