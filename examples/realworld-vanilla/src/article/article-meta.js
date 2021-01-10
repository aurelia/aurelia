import { CustomElement, IRouter } from '../aurelia.js';
import { IArticleState, IUserState } from '../state.js';

export const ArticleMeta = CustomElement.define({
  name: 'article-meta',
  template: `
    <div class="article-meta">
      <a href="/profile/\${author.username}">
        <img src.bind="author.image" /></a>
      <div class="info">
        <a href="/profile/\${author.username}" class="author">\${author.username}</a>
        <span class="date">\${article.createdAt | date}</span>
      </div>
      <span if.bind="canModify">
        <a class="btn btn-outline-secondary btn-sm" href="/editor/\${article.slug}">
          <i class="ion-edit"></i>&nbsp;Edit Article
        </a>
        &nbsp;&nbsp;
        <button class="btn btn-outline-danger btn-sm" click.delegate="delete()" data-e2e="deleteBtn">
          <i class="ion-trash-a"></i>&nbsp;Delete Article
        </button>
      </span>
      <span else>
        <button class="btn btn-sm btn-outline-secondary" click.delegate="toggleFollow()" data-e2e="toggleFollowBtn">
          <i class="ion-plus-round"></i>
          &nbsp;\${author.following ? 'Unfollow' : 'Follow'} \${author.username}
        </button>
        &nbsp;&nbsp;
        <button class="btn btn-sm \${article.favorited ? 'btn-primary' : 'btn-outline-primary'}"
          click.delegate="toggleFavorite()" data-e2e="toggleFavoriteBtn">
          <i class="ion-heart"></i>
          &nbsp;\${article.favorited ? 'Unfavorite' : 'Favorite'} Post
          <span class="counter">(\${article.favoritesCount})</span>
        </button>
      </span>
    </div>
  `,
}, class {
  static get inject() { return [IRouter, IUserState, IArticleState]; }

  get article() { return this.$article.current; }
  get author() { return this.article.author; }
  get canModify() { return this.author.username === this.$user.current.username; }

  constructor(router, $user, $article) {
    this.router = router;
    this.$user = $user;
    this.$article = $article;
  }

  async toggleFollow() {
    await this.$article.toggleFollow();
  }

  async toggleFavorite() {
    await this.$article.toggleFavorite();
  }

  async delete() {
    await this.$article.delete();
    await this.router.load('');
  }
});
