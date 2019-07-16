import { ArticleService } from "../../shared/services/article-service";
import { SharedState } from "../../shared/state/shared-state";
import { inject } from "@aurelia/kernel";
import { Router } from "@aurelia/router";
import { bindable } from "@aurelia/runtime";

@inject(ArticleService, SharedState, Router)
export class ArticleMeta {
  @bindable article;

  constructor(private readonly articleService: ArticleService, private readonly sharedState: SharedState, private readonly router: Router) {
  }

  get canModify() {
    return this.article.author.username === this.sharedState.currentUser.username;
  }

  onToggleFavorited(value) {
    if (value) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }

  onToggleFollowing(value) {
    this.article.author.following = value;
  }

  deleteArticle() {
    this.articleService.destroy(this.article.slug)
      .then(() => this.router.goto('home'));
  }
}