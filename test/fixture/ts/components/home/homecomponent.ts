import { Disposable } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { BindingEngine } from "aurelia-framework";
import { getLogger } from "aurelia-logging";
import { ArticleService } from "../../shared/services/articleservice";
import { TagService } from "../../shared/services/tagservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class HomeComponent {
  public articles: any[] = [];
  public shownList: string = "all";
  public tags: string[] = [];
  public filterTag: string | undefined;
  public pageNumber: number | undefined;
  public totalPages: number[] = [];
  public currentPage: number = 1;
  public limit: number = 10;

  public sharedState: SharedState;
  public bindingEngine: BindingEngine;
  public articleService: ArticleService;
  public tagService: TagService;

  public subscription: Disposable = null as any;

  constructor(
    sharedState: SharedState,
    bindingEngine: BindingEngine,
    articleService: ArticleService,
    tagService: TagService
  ) {
    this.sharedState = sharedState;
    this.bindingEngine = bindingEngine;
    this.articleService = articleService;
    this.tagService = tagService;
  }

  public bind(): void {
    this.subscription = this.bindingEngine
      .propertyObserver(this.sharedState, "isAuthenticated")
      .subscribe((newValue, _oldValue) => {
        getLogger("HomeComponent").info("homeComponent isAuthenticated: ", newValue);
      });
  }

  public unbind(): void {
    this.subscription.dispose();
  }

  public attached(): void {
    this.getArticles();
    this.getTags();
  }

  public getArticles(): void {
    const params: any = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1)
    };
    if (this.filterTag !== undefined) {
      params.tag = this.filterTag;
    }
    this.articleService.getList(this.shownList, params).then(response => {
      this.articles.splice(0);
      this.articles.push(...response.articles);

      // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
      this.totalPages = Array.from([Math.ceil(response.articlesCount / this.limit)], (_val, index) => index + 1);
    });
  }

  public getTags(): void {
    this.tagService.getList().then(response => {
      this.tags.splice(0);
      this.tags.push(...response);
    });
  }

  // tslint:disable-next-line:no-reserved-keywords
  public setListTo(type: string, tag: string): void {
    if (type === "feed" && !this.sharedState.isAuthenticated) {
      return;
    }
    this.shownList = type;
    this.filterTag = tag;
    this.getArticles();
  }

  public getFeedLinkClass(): string {
    let clazz = "";
    if (!this.sharedState.isAuthenticated) {
      clazz += " disabled";
    }
    if (this.shownList === "feed") {
      clazz += " active";
    }

    return clazz;
  }

  public setPageTo(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
