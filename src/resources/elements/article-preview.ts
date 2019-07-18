import { bindable, customElement } from "@aurelia/runtime";
import { Article } from "shared/models/article";
import template from './article-preview.html';

@customElement({ name: 'article-preview', template })
export class ArticlePreview {
  @bindable public article?: Article;

  public onToggleFavorited(value: boolean) {
    if (!this.article || !this.article.favoritesCount) { return; }

    if (value) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }
}
