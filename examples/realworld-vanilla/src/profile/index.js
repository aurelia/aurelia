import { CustomElement, Route } from '../aurelia.js';
import { IArticleListState, IProfileState, IUserState } from '../state.js';
import { ArticleListQueryParams } from '../api.js';

const AuthorArticles = CustomElement.define({
  name: 'author-articles',
  template: '<article-list></article-list>',
}, class {
  static get inject() { return [IArticleListState]; }

  constructor($articles) {
    this.$articles = $articles;
  }

  async load({ name }) {
    const params = ArticleListQueryParams.create({
      ...this.$articles.params,
      favorited: undefined,
      author: name,
    });
    await this.$articles.load(params);
  }
});

const FavoritedArticles = CustomElement.define({
  name: 'favorited-articles',
  template: '<article-list></article-list>',
}, class {
  static get inject() { return [IArticleListState]; }

  constructor($articles) {
    this.$articles = $articles;
  }

  async load({ name }) {
    const params = ArticleListQueryParams.create({
      ...this.$articles.params,
      author: undefined,
      favorited: name,
    });
    await this.$articles.load(params);
  }
});


export const AuthView = CustomElement.define({
  name: 'auth-view',
  template: `
    <div class="profile-page">

      <div class="user-info">
        <div class="container">
          <div class="row">

            <div class="col-xs-12 col-md-10 offset-md-1">
              <img src.bind="profile.image" class="user-img" />
              <h4>\${profile.username}</h4>
              <p>\${profile.bio}</p>
              <button class="btn btn-sm btn-outline-secondary action-btn" if.bind="!isSelf"
                click.delegate="toggleFollow()" data-e2e="toggleFollowBtn">
                <i class="ion-plus-round"></i>
                &nbsp;
                \${profile.following ? 'Unfollow' : 'Follow'} \${profile.username}
              </button>
              <a href="/settings" class="btn btn-sm btn-outline-secondary action-btn" if.bind="isSelf">
                <i class="ion-gear-a"></i> Edit Profile Settings
              </a>
            </div>

          </div>
        </div>
      </div>

      <div class="container">
        <div class="row">

          <div class="col-xs-12 col-md-10 offset-md-1">
            <div class="articles-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <a class="nav-link" active.class="_author" load="route:author; active.bind:_author">
                    My Posts
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" active.class="_favorites" load="route:favorites; active.bind:_favorites">
                    Favorited Posts
                  </a>
                </li>
              </ul>
            </div>

            <au-viewport></au-viewport>

          </div>
        </div>
      </div>
    </div>
  `,
  dependencies: [AuthorArticles, FavoritedArticles]
}, class {
  static get inject() { return [IProfileState, IUserState]; }

  get isSelf() { return this.profile.username === this.$user.current.username; }
  get profile() { return this.$profile.current; }

  constructor($profile, $user) {
    this.$profile = $profile;
    this.$user = $user;
  }

  async load({ name }) {
    await this.$profile.load(name);
  }

  async toggleFollow() {
    await this.$profile.toggleFollow();
  }
});

Route.define({
  children: [
    { id: 'author', path: '', component: AuthorArticles, title: 'Profile' },
    { path: 'favorites', component: FavoritedArticles, title: 'Profile' },
  ],
}, AuthView);
