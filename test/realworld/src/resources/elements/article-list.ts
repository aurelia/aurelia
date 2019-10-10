import { bindable } from "@aurelia/runtime";
import { Article } from "shared/models/article";

export class ArticleList {
  @bindable public articles?: Article[];
  @bindable public pageNumber?: number;
  @bindable public totalPages?: number[];
  @bindable public currentPage?: number;
  @bindable public setPageCb?: unknown;
}
