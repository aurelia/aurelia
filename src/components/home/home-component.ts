import { SharedState } from '../../shared/state/shared-state';
import { ArticleService } from "../../shared/services/article-service"
import { TagService } from '../../shared/services/tag-service';
import { inject } from '@aurelia/kernel';

@inject(SharedState, ArticleService, TagService)
export class HomeComponent {
  articles = [];
  shownList = 'all';
  tags = [];
  filterTag = undefined;
  pageNumber;
  totalPages;
  currentPage = 1;
  limit = 10;

  constructor(private readonly sharedState: SharedState, private readonly articleService: ArticleService, private readonly tagService: TagService) {
  }

  attached() {
    this.getArticles();
    this.getTags();
  }

  getArticles() {
    let params = {
      limit: this.limit,
      tag: undefined,
      offset: this.limit * (this.currentPage - 1)
    };
    if (this.filterTag !== undefined)
      params.tag = this.filterTag;
    this.articleService.getList(this.shownList, params)
      .then(response => {
        this.articles.splice(0);
        this.articles.push(...response.articles)

        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(new Array(Math.ceil(response.articlesCount / this.limit)), (val, index) => index + 1);
      })
  }

  getTags() {
    this.tagService.getList()
      .then(response => {
        this.tags.splice(0);
        this.tags.push(...response);
      })
  }

  setListTo(type, tag) {
    if (type === 'feed' && !this.sharedState.isAuthenticated) return;
    this.shownList = type;
    this.filterTag = tag;
    this.getArticles();
  }

  getFeedLinkClass() {
    let clazz = '';
    if (!this.sharedState.isAuthenticated)
      clazz += ' disabled';
    if (this.shownList === 'feed')
      clazz += ' active';
    return clazz;
  }

  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
