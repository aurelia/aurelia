import {bindable} from 'aurelia-framework';

export class ArticleList {
  @bindable articles;
  @bindable pageNumber;
  @bindable totalPages;
  @bindable currentPage;
  @bindable setPageCb;
}

