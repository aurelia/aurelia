import { inject } from '@aurelia/kernel';
import { IRouter, NavRoute } from '@aurelia/router';

import { Article } from 'models/article';
import { ArticleRequest } from 'models/article-request';
import { getPages } from 'shared/get-pages';
import { ArticleService } from 'shared/services/article-service';
import { TagService } from 'shared/services/tag-service';
import { SharedState } from 'shared/state/shared-state';

@inject(SharedState, IRouter, ArticleService, TagService)
export class Home {
  private articles: Article[] = [];
  private shownList = 'all';
  private tags: string[] = [];
  private filterTag?: string;
  private readonly pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private readonly limit = 10;

  public constructor(
    private readonly sharedState: SharedState,
    private readonly router: IRouter,
    private readonly articleService: ArticleService,
    private readonly tagService: TagService,
  ) {}

  public attached() {
    this.getArticles().catch((error: Error) => { throw error; });
    this.getTags().catch((error: Error) => { throw error; });
    this.setupNav();
  }

  public async getArticles() {
    const params: ArticleRequest = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
    };

    if (this.filterTag) {
      params.tag = this.filterTag;
    }

    const response = await this.articleService.getList(this.shownList, params);
    this.articles = response.articles;
    this.totalPages = getPages(response.articlesCount, this.limit);
  }

  public async getTags() {
    const response = await this.tagService.getList();
    this.tags = response;
  }

  public setupNav(): void {
    this.router.setNav(
      'home',
      [
        {
          execute: (route: NavRoute): void => { this.setListTo('feed', ''); this.router.updateNav('home'); },
          title: 'Your Feed',
          condition: () => this.sharedState.isAuthenticated,
          consideredActive: (): boolean => this.shownList === 'feed' && !this.filterTag,
        },
        {
          execute: (route: NavRoute): void => { this.setListTo('all', ''); this.router.updateNav('home'); },
          title: 'Global Feed',
          consideredActive: () => this.shownList === 'all' && !this.filterTag,
        },
      ],
      {
        ul: 'nav nav-pills outline-active',
        li: 'nav-item',
        a: 'nav-link',
        aActive: 'active',
      },
    );
  }

  public setListTo(type: string, tag: string) {
    if (type === 'feed' && !this.sharedState.isAuthenticated) { return; }
    this.shownList = type;
    this.filterTag = tag;
    this.getArticles().catch((error: Error) => { throw error; });
  }

  public getFeedLinkClass() {
    let clazz = '';
    if (!this.sharedState.isAuthenticated) {
      clazz += ' disabled';
    }
    if (this.shownList === 'feed') {
      clazz += ' active';
    }
    return clazz;
  }

  public setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    this.getArticles().catch((error: Error) => { throw error; });
  }
}
