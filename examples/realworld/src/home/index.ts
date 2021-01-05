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
    this.p.taskQueue.queueTask(async () => {
      this.mode = mode;
      this.tag = undefined;
      const { limit, offset } = this.$articleList.params;
      const params = (mode === 'all' ? ArticleListQueryParams : FeedArticleListQueryParams).create({ limit, offset });
      await this.$articleList.load(params);
    });
  }

  setTag(tag: string): void {
    this.p.taskQueue.queueTask(async () => {
      this.tag = tag;
      const { limit, offset } = this.$articleList.params;
      const params = ArticleListQueryParams.create({ limit, offset, tag });
      await this.$articleList.load(params);
    });
  }
}
