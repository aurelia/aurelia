import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { bindable, BindingStrategy, BindingType, customElement } from '@aurelia/runtime';
import { Article } from 'shared/models/article';
import { ArticleService } from 'shared/services/article-service';
import { SharedState } from 'shared/state/shared-state';
import template from './favorite-button.html';

@inject(Router, SharedState, ArticleService)
@customElement({ name: 'favorite-button', template })
export class FavoriteButton {
  @bindable public article?: Article;
  @bindable public toggle?: (toggled: boolean) => void;

  constructor(private readonly router: Router,
              private readonly sharedState: SharedState,
              private readonly articleService: ArticleService) {
  }

  public onToggleFavorited() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('auth(type=login)');
      return;
    }
    if (!this.article || !this.article.slug) { return; }
    this.article.favorited = !this.article.favorited;
    if (this.article.favorited) {
      this.articleService.favorite(this.article.slug);
    } else {
      this.articleService.unfavorite(this.article.slug);
    }

    if (this.toggle) {
      this.toggle(this.article.favorited);
    }
  }
}
