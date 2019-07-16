import {inject, bindable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {SharedState} from '../../shared/state/shared-state';
import {ArticleService} from '../../shared/services/article-service';

@inject(Router, SharedState, ArticleService)
export class FavoriteButton {
  @bindable article;
  @bindable toggle;

  constructor(router, sharedState, articleService) {
    this.router = router;
    this.sharedState = sharedState;
    this.articleService = articleService;
  }

  onToggleFavorited() {
    if (!this.sharedState.isAuthenticated) {
      this.router.navigateToRoute('login');
      return;
    }
    this.article.favorited = !this.article.favorited;
    if (this.article.favorited)
      this.articleService.favorite(this.article.slug);
    else
      this.articleService.unfavorite(this.article.slug);
    
    this.toggle(this.article.favorited)
  }
}