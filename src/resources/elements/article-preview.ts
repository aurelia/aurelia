import { bindable, customElement } from "@aurelia/runtime";
import { Article } from "../../components/editor/editor-component";
import template from './article-preview.html';

@customElement({ name: 'article-preview', template })
export class ArticlePreview {
  @bindable article: Article;

  onToggleFavorited(value) {
    if (value) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }
}
