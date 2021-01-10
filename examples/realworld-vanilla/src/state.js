import { DI, ILogger } from './aurelia.js';
import { Article, ErrorRecordResponse, IApiService, IJwtService, User, UserResponse, ArticleListQueryParams, Profile } from './api.js';

export const IUserState = DI.createInterface('IUserState', x => x.singleton(UserState));
export class UserState {
  static get inject() { return [IJwtService, IApiService]; }

  constructor(jwt, api) {
    this.jwt = jwt;
    this.api = api;
    this.errors = [];
    this.current = User.NONE;
    this.isAuth = false;
  }

  async load() {
    if (this.jwt.isTokenValid()) {
      const resp = await this.api.getCurrentUser();
      this.setAuth(resp.user);
    } else {
      this.clearAuth();
    }
  }

  async login(login) {
    this.errors = [];
    const resp = await this.api.loginUser(login);
    if (resp instanceof ErrorRecordResponse) {
      this.clearAuth();
      this.errors = resp.toErrorList();
      return false;
    }
    this.setAuth(resp.user);
    return true;
  }

  logout() {
    this.clearAuth();
  }

  async register(registration) {
    this.errors = [];
    const resp = await this.api.registerUser(registration);
    if (resp instanceof ErrorRecordResponse) {
      this.clearAuth();
      this.errors = resp.toErrorList();
      return false;
    }
    this.setAuth(resp.user);
    return true;
  }

  async update(user) {
    const resp = await this.api.updateUser(user);
    if (resp instanceof UserResponse) {
      this.current = resp.user;
    }
  }

  setAuth(user) {
    this.jwt.saveToken(user.token);
    this.current = user;
    this.isAuth = true;
  }

  clearAuth() {
    this.jwt.destroyToken();
    this.current = User.NONE;
    this.isAuth = false;
  }
}

export const IProfileState = DI.createInterface('IProfileState', x => x.singleton(ProfileState));
export class ProfileState {
  static get inject() { return [IApiService]; }

  constructor(api) {
    this.api = api;
    this.current = Profile.NONE;
  }

  async toggleFollow() {
    const profile = this.current;
    const username = profile.username;
    let resp;
    if (profile.following) {
      resp = await this.api.unfollowUser(username);
    } else {
      resp = await this.api.followUser(username);
    }
    this.current = resp.profile;
  }

  async load(username) {
    const resp = await this.api.getProfile(username);
    this.current = resp.profile;
  }
}

export const IArticleState = DI.createInterface('IArticleState', x => x.singleton(ArticleState));
export class ArticleState {
  static get inject() { return [IApiService]; }

  constructor(api) {
    this.api = api;
    this.errors = [];
    this.current = Article.NONE;
    this.comments = [];
  }

  async toggleFollow() {
    const author = this.current.author;
    const username = author.username;
    let resp;
    if (author.following) {
      resp = await this.api.unfollowUser(username);
    } else {
      resp = await this.api.followUser(username);
    }
    this.current.author = resp.profile;
  }

  async toggleFavorite() {
    const article = this.current;
    let resp;
    if (article.favorited) {
      resp = await this.api.unfavoriteArticle(article.slug);
    } else {
      resp = await this.api.favoriteArticle(article.slug);
    }
    this.current = resp.article;
  }

  async load(slug = '') {
    this.current = Article.NONE;
    this.comments = [];
    if (slug) {
      const resp = await this.api.getArticle(slug);
      this.current = resp.article;
    }
  }

  async loadComments(slug) {
    const resp = await this.api.getCommentsFromArticle(slug);
    this.comments = resp.comments;
  }

  async save(article) {
    this.errors = [];
    let resp;
    if (article.slug) {
      resp = await this.api.updateArticle(article.slug, article);
    } else {
      resp = await this.api.createArticle(article);
    }
    if (resp instanceof ErrorRecordResponse) {
      this.errors = resp.toErrorList();
      return false;
    }
    this.current = resp.article;
    return true;
  }

  async delete() {
    this.errors = [];
    await this.api.deleteArticle(this.current.slug);
    this.current = Article.NONE;
  }

  async addComment(body) {
    this.errors = [];
    const article = this.current;
    const resp = await this.api.addCommentToArticle(article.slug, { body });
    if (resp instanceof ErrorRecordResponse) {
      this.errors = resp.toErrorList();
      return false;
    }
    this.comments.push(resp.comment);
    return true;
  }

  async deleteComment(commentId) {
    this.errors = [];
    const article = this.current;
    await this.api.deleteCommentFromArticle(article.slug, commentId);
    const idx = this.comments.findIndex(x => x.id === commentId);
    this.comments.splice(idx, 1);
  }
}

export const IArticleListState = DI.createInterface('IArticleListState', x => x.singleton(ArticleListState));
export class ArticleListState {
  static get inject() { return [IApiService]; }

  constructor(api) {
    this.api = api;
    this.items = [];
    this.itemsCount = 0;
    this.currentPage = 0;
    this.pages = [];
    this.params = ArticleListQueryParams.create({ limit: 20, offset: 0 });
  }

  async toggleFavorite(slug) {
    const idx = this.items.findIndex(x => x.slug === slug);
    const article = this.items[idx];
    let resp;
    if (article.favorited) {
      resp = await this.api.unfavoriteArticle(slug);
    } else {
      resp = await this.api.favoriteArticle(slug);
    }
    this.items.splice(idx, 1, resp.article);
  }

  async load(params = this.params) {
    this.params = params;
    let resp;
    if (params.type === 'all') {
      resp = await this.api.getArticles(params);
    } else {
      resp = await this.api.getFeedArticles(params);
    }
    this.items = resp.articles;
    this.itemsCount = resp.articlesCount;
    this.currentPage = (params.offset + this.items.length) / params.limit;
    this.pages = Array.from(Array(Math.ceil(resp.articlesCount / params.limit)), (_, i) => i + 1);
  }
}

export const ITagsState = DI.createInterface('ITagsState', x => x.singleton(TagsState));
export class TagsState {
  static get inject() { return [IApiService]; }

  constructor(api) {
    this.api = api;
    this.items = [];
  }

  async load() {
    const resp = await this.api.getTags();
    this.items = resp.tags;
  }
}

export class AuthHandler {
  static get inject() { return [IUserState, ILogger]; }

  constructor(auth, logger) {
    this.auth = auth;
    this.logger = logger;
    this.logger = logger.scopeTo('AuthHandler');
  }

  canLoad(params, next) {
    if (!this.auth.isAuth) {
      this.logger.trace(`canLoad() - redirecting to login page`, next, this.auth);
      return 'login';
    }
    this.logger.trace(`canLoad() - proceeding`, next, this.auth);
    return true;
  }
}
