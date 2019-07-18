import { inject } from "@aurelia/kernel";
import { Router } from "@aurelia/router";
import { bindable, customElement } from "@aurelia/runtime";
import { Article } from "shared/models/article";
import { ArticleService } from "shared/services/article-service";
import { SharedState } from "shared/state/shared-state";
import template from './article-meta.html';

@inject(ArticleService, SharedState, Router)
@customElement({ name: 'article-meta', template })
export class ArticleMeta {
  @bindable public article?: Article;

  constructor(private readonly articleService: ArticleService,
              private readonly sharedState: SharedState,
              private readonly router: Router) {
  }

  get canModify() {
    if (!this.article || !this.article.author) { return; }
    return this.article.author.username === this.sharedState.currentUser.username;
  }

  public onToggleFavorited(value: boolean) {
    if (!this.article || !this.article.favoritesCount) { return; }
    if (value) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }

  public onToggleFollowing(value: boolean) {
    if (!this.article || !this.article.author) { return; }
    this.article.author.following = value;
  }

  public deleteArticle() {
    if (!this.article || !this.article.slug) { return; }
    this.articleService.destroy(this.article.slug)
      .then(() => this.router.goto('home'));
  }
}
