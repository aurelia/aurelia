import { customElement, IRouteViewModel } from 'aurelia';
import { IArticleListState, ITagsState, IUserState } from '../state';
import { Article, ArticleListQueryParams, FeedArticleListQueryParams } from '../api';
import { h, queue } from '../util';

@customElement({
  name: 'home-view',
  needsCompile: false,
  template: `<div class="home-page"><div class="banner"><div class="container"><h1 class="logo-font">conduit</h1><p>A place to share your knowledge.</p></div></div><div class="container page"><div class="row"><div class="col-md-9"><div class="feed-toggle"><ul class="nav nav-pills outline-active"><!--au-start--><!--au-end--><au-m class="au"></au-m><li class="nav-item"><a class="nav-link au" data-e2e="globalFeedLink">Global Feed</a></li><!--au-start--><!--au-end--><au-m class="au"></au-m></ul></div><article-list class="au"></article-list></div><div class="col-md-3"><div class="sidebar"><p>Popular Tags</p><div class="tag-list"><!--au-start--><!--au-end--><au-m class="au"></au-m><!--au-start--><!--au-end--><au-m class="au"></au-m></div></div></div></div></div></div>`,
  instructions: [[
    h.templateCtrl('if', [h.bindProp('$user.isAuth', 'value', 2)], {
      template: `<li class="nav-item"><a class="nav-link au" data-e2e="yourFeedLink">Your Feed</a></li>`,
      instructions: [[
        h.bindAttr('class', 'mode==="feed"&&!tag', 'active'),
        h.bindListener('setView("feed")', 'click', true, false),
      ]],
    }),
  ], [
    h.bindAttr('class', 'mode==="all"&&!tag', 'active'),
    h.bindListener('setView("all")', 'click', true, false),
  ], [
    h.templateCtrl('if', [h.bindProp('tag', 'value', 2)], {
      template: `<li class="nav-item"><a class="nav-link active"><i class="ion-pound"></i><!--au-start--><!--au-end--><au-m class="au"></au-m></a></li>`,
      instructions: [[
        h.bindText('tag', false),
      ]],
    }),
  ], [
    h.element('article-list', false, []),
  ], [
    h.templateCtrl('repeat', [h.bindIterator('tag of $tags.items', 'items', [])], {
      template: `<a class="tag-pill tag-default au"><!--au-start--><!--au-end--><au-m class="au"></au-m></a>`,
      instructions: [[
        h.bindListener('setTag(tag)', 'click', true, false),
        h.interpolation('${tagTagLink}', 'data-e2e'),
      ], [
        h.bindText('tag', false),
      ]],
    }),
  ], [
    h.templateCtrl('if', [h.bindProp('$tags.items.length===0', 'value', 2)], {
      template: `<div>No tags are here... yet.</div>`,
      instructions: [],
    }),
  ]],
})
export class HomeViewCustomElement implements IRouteViewModel {
  get articles(): Article[] { return this.$articleList.items; }

  tag: string | undefined = undefined;
  mode: 'all' | 'feed' = 'all';

  constructor(
    @IArticleListState readonly $articleList: IArticleListState,
    @ITagsState readonly $tags: ITagsState,
    @IUserState readonly $user: IUserState,
  ) { }

  async binding() {
    await this.setView(this.mode);
  }

  @queue async setView(mode: 'all' | 'feed') {
    this.mode = mode;
    this.tag = undefined;
    const { limit, offset } = this.$articleList.params;
    const params = (mode === 'all' ? ArticleListQueryParams : FeedArticleListQueryParams).create({ limit, offset });
    await this.$articleList.load(params);
  }

  @queue async setTag(tag: string) {
    this.tag = tag;
    const { limit, offset } = this.$articleList.params;
    const params = ArticleListQueryParams.create({ limit, offset, tag });
    await this.$articleList.load(params);
  }
}
