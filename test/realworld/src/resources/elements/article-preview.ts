import { bindable } from "@aurelia/runtime";
import { Article } from "shared/models/article";

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
