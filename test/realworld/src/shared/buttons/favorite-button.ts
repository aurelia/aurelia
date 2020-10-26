import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { bindable } from '@aurelia/runtime-html';

import { Article } from 'shared/models/article';
import { ArticleService } from 'shared/services/article-service';
import { SharedState } from 'shared/state/shared-state';

@inject(IRouter, SharedState, ArticleService)
export class FavoriteButton {
  @bindable public article?: Article;
  @bindable public toggle?: (toggled: boolean) => void;

  public constructor(
    private readonly router: IRouter,
    private readonly sharedState: SharedState,
    private readonly articleService: ArticleService,
  ) {}

  public onToggleFavorited() {
    if (!this.sharedState.isAuthenticated) {
      this.router.goto('auth(type=login)').catch((error: Error) => { throw error; });
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
