import { CustomElement } from '../aurelia.js';
import { IArticleListState, ITagsState, IUserState } from '../state.js';
import { ArticleListQueryParams, FeedArticleListQueryParams } from '../api.js';

export const x = CustomElement.define({
  name: 'home-view',
  template: `
    <div class="home-page">

      <div class="banner">
        <div class="container">
          <h1 class="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div class="container page">
        <div class="row">

          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <li if.bind="$user.isAuth" class="nav-item">
                  <a class="nav-link" active.class="mode === 'feed' && !tag" click.delegate="setView('feed')"
                    data-e2e="yourFeedLink">Your Feed</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" active.class="mode === 'all' && !tag" click.delegate="setView('all')"
                    data-e2e="globalFeedLink">Global Feed</a>
                </li>
                <li if.bind="tag" class="nav-item">
                  <a class="nav-link active">
                    <i class="ion-pound"></i>
                    \${tag}
                  </a>
                </li>
              </ul>
            </div>

            <article-list></article-list>
          </div>

          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              <div class="tag-list">
                <a repeat.for="tag of $tags.items" class="tag-pill tag-default" click.delegate="setTag(tag)"
                  data-e2e="\${tag}TagLink">\${tag}</a>
                <div if.bind="$tags.items.length === 0">No tags are here... yet.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
}, class {
  static get inject() { return [IArticleListState, ITagsState, IUserState]; }

  get articles() { return this.$articleList.items; }

  constructor($articleList, $tags, $user) {
    this.$articleList = $articleList;
    this.$tags = $tags;
    this.$user = $user;

    this.tag = undefined;
    this.mode = 'all';
  }

  async binding() {
    await this.setView(this.mode);
  }

  async setView(mode) {
    this.mode = mode;
    this.tag = undefined;
    const { limit, offset } = this.$articleList.params;
    const params = (mode === 'all' ? ArticleListQueryParams : FeedArticleListQueryParams).create({ limit, offset });
    await this.$articleList.load(params);
  }

  async setTag(tag) {
    this.tag = tag;
    const { limit, offset } = this.$articleList.params;
    const params = ArticleListQueryParams.create({ limit, offset, tag });
    await this.$articleList.load(params);
  }
});
