import marked from 'https://unpkg.com/marked@1.2.7/lib/marked.esm.js';
import { CustomElement } from '../aurelia.js';
import { IArticleState, IUserState } from '../state.js';
import { ArticleMeta } from './article-meta.js';
import { CommentView } from './comment-view.js';

export const ArticleView = CustomElement.define({
  name: 'article-view',
  template: `
    <div class="article-page">
      <div class="banner">
        <div class="container">
          <h1>\${article.title}</h1>
          <article-meta></article-meta>
        </div>
      </div>
      <div class="container page">
        <div class="row article-content">
          <div class="col-md-12">
            <div innerhtml.bind="marked(article.body)">
            </div>
          </div>
        </div>
        <hr />
        <div class="article-actions">
          <article-meta></article-meta>
        </div>
        <div class="row">
          <div class="col-xs-12 col-md-8 offset-md-2">

            <error-list errors.bind="$article.errors"></error-list>

            <form if.bind="$user.isAuth" submit.trigger="$event.preventDefault()" class="card comment-form">
              <div class="card-block">
                <textarea class="form-control" placeholder="Write a comment..." rows="3" value.bind="myComment"
                  name="myComment"></textarea>
              </div>
              <div class="card-footer">
                <img src.bind="user.image" class="comment-author-img" />
                <button class="btn btn-sm btn-primary" click.delegate="postComment()" data-e2e="postCommentBtn">
                  Post Comment
                </button>
              </div>
            </form>

            <comment-view repeat.for="comment of comments" comment.bind="comment">
            </comment-view>

          </div>
        </div>
      </div>
    </div>
  `,
  dependencies: [ArticleMeta, CommentView],
}, class {
  static get inject() { return [IUserState, IArticleState]; }

  get article() { return this.$article.current; }
  get comments() { return this.$article.comments; }
  get user() { return this.$user.current; }

  constructor($user, $article) {
    this.$user = $user;
    this.$article = $article;
    this.marked = marked;
    this.myComment = '';
  }

  async load({ slug }) {
    await Promise.all([
      this.$article.load(slug),
      this.$article.loadComments(slug),
    ]);
  }

  async postComment() {
    const body = this.myComment;
    await this.$article.addComment(body);
    this.myComment = '';
  }
});
