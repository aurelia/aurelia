import {bindable} from 'aurelia-framework';

export class ArticlePreview {
  @bindable article;

  onToggleFavorited(value) {
    if (value) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }
}
