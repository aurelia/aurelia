import template from './home.html';

import { customElement } from 'aurelia';
import { IRouteableComponent } from '@aurelia/router';
import { IArticleListState, ITagsState, IUserState } from '../state';
import { Article, ArticleListQueryParams } from '../api';

@customElement({ name: 'home', template })
export class Home implements IRouteableComponent {
  get articles(): Article[] { return this.$articleList.items; }

  // tag: string | undefined = undefined;
  mode: 'all' | 'feed' = 'all';

  constructor(
    @IArticleListState readonly $articleList: IArticleListState,
    @ITagsState readonly $tags: ITagsState,
    @IUserState readonly $user: IUserState,
  ) { }

  loading() {
    if (this.$articleList.params instanceof ArticleListQueryParams) {
      this.$articleList.params.author = undefined;
      this.$articleList.params.favorited = undefined;
    }
  }

  get tag(): string | undefined {
    return (this.$articleList.params as ArticleListQueryParams).tag;
  }

  // async binding() {
  //   await this.setView(this.mode);
  // }

  // @queue async setView(mode: 'all' | 'feed') {
  //   this.mode = mode;
  //   this.tag = undefined;
  //   const { limit, offset } = this.$articleList.params;
  //   const params = (mode === 'all' ? ArticleListQueryParams : FeedArticleListQueryParams).create({ limit, offset });
  //   await this.$articleList.load(params);
  // }

  // @queue async setTag(tag: string) {
  //   // this.tag = tag;
  //   const { limit, offset } = this.$articleList.params;
  //   const params = ArticleListQueryParams.create({ limit, offset, tag });
  //   await this.$articleList.load(params);
  // }
}
