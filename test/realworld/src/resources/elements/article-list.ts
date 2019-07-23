import { bindable, customElement } from "@aurelia/runtime";
import { Article } from "shared/models/article";
import template from './article-list.html';

@customElement({ name: 'article-list', template })
export class ArticleList {
  @bindable public articles?: Article[];
  @bindable public pageNumber?: number;
  @bindable public totalPages?: number[];
  @bindable public currentPage?: number;
  @bindable public setPageCb?: unknown;
}
