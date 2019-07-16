import {inject, computedFrom, bindable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ArticleService} from "../../shared/services/article-service";
import {SharedState} from "../../shared/state/shared-state";

@inject(ArticleService, SharedState, Router)
export class ArticleMeta {
  @bindable article;

  constructor(articleService, sharedState, router) {
    this.articleService = articleService;
    this.sharedState = sharedState;
    this.router = router;
  }

  @computedFrom('sharedState.currentUser.username')
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
      .then(() => this.router.navigateToRoute('home'));
  }
}