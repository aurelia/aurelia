import { CustomElement } from '../aurelia.js';
import { IArticleState, IUserState } from '../state.js';

export const CommentView = CustomElement.define({
  name: 'comment-view',
  template: `
    <div class="card">
      <div class="card-block">
        <p class="card-text">\${comment.body}</p>
      </div>
      <div class="card-footer">
        <a href="/profile/\${comment.author.username}" class="comment-author">
          <img src.bind="comment.author.image" class="comment-author-img" />
        </a>
        &nbsp;
        <a href="/profile/\${comment.author.username}" class="comment-author">\${comment.author.username}</a>
        <span class="date-posted">\${comment.createdAt | date}</span>
        <span class="mod-options" if.bind="canModify">
          <i class="ion-trash-a" click.delegate="delete()" data-e2e="deleteBtn"></i>
        </span>
      </div>
    </div>
  `,
  bindables: ['comment'],
}, class {
  static get inject() { return [IUserState, IArticleState]; }

  get canModify() { return this.comment.author.username === this.$user.current.username; }

  constructor($user, $article) {
    this.$user = $user;
    this.$article = $article;
  }

  async delete() {
    await this.$article.deleteComment(this.comment.id);
  }
});
