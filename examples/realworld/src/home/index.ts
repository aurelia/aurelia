import template from './index.html';

import { customElement, IRouteViewModel, IPlatform } from 'aurelia';
import { IArticleListState, ITagsState, IUserState } from '../state';
import { Article, ArticleListQueryParams, FeedArticleListQueryParams } from '../api';

@customElement({ name: 'home-view', template })
export class HomeViewCustomElement implements IRouteViewModel {
  get articles(): Article[] { return this.$articleList.items; }

  tag: string | undefined = undefined;
  mode: 'all' | 'feed' = 'all';

  constructor(
    @IPlatform readonly p: IPlatform,
    @IArticleListState readonly $articleList: IArticleListState,
    @ITagsState readonly $tags: ITagsState,
    @IUserState readonly $user: IUserState,
  ) {}

  attaching(): void {
    this.setView(this.mode);
  }

  setView(mode: 'all' | 'feed'): void {
    this.mode = mode;
    this.tag = undefined;
    this.p.taskQueue.queueTask(async () => {
      let params = this.$articleList.params;
      if (mode === 'all') {
        params = ArticleListQueryParams.create({ ...params, tag: undefined });
      } else {
        params = FeedArticleListQueryParams.create({ ...params });
      }
      await this.$articleList.load(params);
    });
  }

  setTag(tag: string): void {
    this.tag = tag;
    this.p.taskQueue.queueTask(async () => {
      const params = ArticleListQueryParams.create({ ...this.$articleList.params, tag });
      await this.$articleList.load(params);
    });
  }
}
