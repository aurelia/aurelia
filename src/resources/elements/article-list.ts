import { bindable, customElement } from "@aurelia/runtime";
import template from './article-list.html';


@customElement({ name: 'article-list', template })
export class ArticleList {
  @bindable articles;
  @bindable pageNumber;
  @bindable totalPages;
  @bindable currentPage;
  @bindable setPageCb;
}

