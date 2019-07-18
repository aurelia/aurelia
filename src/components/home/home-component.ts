import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { Article } from 'models/article';
import { ArticleRequest } from 'models/article-request';
import { getPages } from 'shared/get-pages';
import { ArticleService } from "shared/services/article-service";
import { TagService } from 'shared/services/tag-service';
import { SharedState } from 'shared/state/shared-state';
import template from './home-component.html';

@inject(SharedState, ArticleService, TagService)
@customElement({ name: 'home-component', template })
export class HomeComponent {
  private articles: Article[] = [];
  private shownList = 'all';
  private tags: string[] = [];
  private filterTag?: string;
  private pageNumber?: number;
  private totalPages?: number[];
  private currentPage = 1;
  private limit = 10;

  constructor(private readonly sharedState: SharedState,
              private readonly articleService: ArticleService,
              private readonly tagService: TagService) {
  }

  public attached() {
    this.getArticles();
    this.getTags();
  }

  public async getArticles() {
    const params: ArticleRequest = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
    };

    if (this.filterTag) {
      params.tag = this.filterTag!;
    }

    const response = await this.articleService.getList(this.shownList, params);
    this.articles = response.articles;
    this.totalPages = getPages(response.articlesCount, this.limit);
  }

  public async getTags() {
    const response = await this.tagService.getList();
    this.tags = response;
  }

  public setListTo(type: string, tag: string) {
    if (type === 'feed' && !this.sharedState.isAuthenticated) { return; }
    this.shownList = type;
    this.filterTag = tag;
    this.getArticles();
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
    this.getArticles();
  }
}
