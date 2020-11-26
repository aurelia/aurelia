import { IRouter } from '@aurelia/router';
import { bindable } from '@aurelia/runtime-html';

import { Article } from 'shared/models/article';
import { IArticleService } from 'shared/services/article-service';
import { ISharedState } from 'shared/state/shared-state';

export class ArticleMeta {
  @bindable public article?: Article;

  public constructor(
    @IArticleService private readonly articleService: IArticleService,
    @ISharedState private readonly sharedState: ISharedState,
    @IRouter private readonly router: IRouter,
  ) {}

  public get canModify() {
    if (!this.article || !this.article.author) { return false; }
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
