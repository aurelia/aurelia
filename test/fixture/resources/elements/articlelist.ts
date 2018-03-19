import { bindable } from "aurelia-framework";

export class ArticleList {
  @bindable()
  public articles: any[] | undefined;

  @bindable()
  public pageNumber: number | undefined;

  @bindable()
  public totalPages: number | undefined;

  @bindable()
  public currentPage: number | undefined;

  @bindable()
  public setPageCb: Function | undefined;
}
