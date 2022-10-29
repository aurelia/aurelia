import template from './index.html';

import { customElement, IRouteViewModel } from 'aurelia';
import { IArticleListState, ITagsState, IUserState } from '../state';
import { Article, ArticleListQueryParams, FeedArticleListQueryParams } from '../api';
import { queue } from '../util';

@customElement({ name: 'home-view', template })
export class HomeViewCustomElement implements IRouteViewModel {
  get articles(): Article[] { return this.$articleList.items; }

  tag: string | undefined = undefined;
  mode: 'all' | 'feed' = 'all';

  constructor(
    @IArticleListState readonly $articleList: IArticleListState,
    @ITagsState readonly $tags: ITagsState,
    @IUserState readonly $user: IUserState,
  ) {}

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
