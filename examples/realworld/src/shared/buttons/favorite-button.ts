import { IRouter } from '@aurelia/router';
import { bindable } from '@aurelia/runtime-html';

import { Article } from 'shared/models/article';
import { IArticleService } from 'shared/services/article-service';
import { ISharedState } from 'shared/state/shared-state';

export class FavoriteButton {
  @bindable public article?: Article;
  @bindable public toggle?: (toggled: boolean) => void;

  public constructor(
    @IRouter private readonly router: IRouter,
    @ISharedState private readonly sharedState: ISharedState,
    @IArticleService private readonly articleService: IArticleService,
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
