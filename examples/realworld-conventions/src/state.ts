import { DI, ILifecycleHooks, ILogger } from 'aurelia';
import { IRouteableComponent, LoadInstruction, Navigation, Parameters, RoutingInstruction } from 'jwx-router';
import { Article, ArticleListResponse, ArticleResponse, Comment, ErrorRecordResponse, IApiService, IJwtService, ArticleQueryParams, User, UserLogin, UserRegistration, UserResponse, UserUpdate, ArticleListQueryParams, Profile, ProfileResponse, ErrorList } from './api';

/**
 * Singleton `User` state that represents the currently logged-in user.
 */
export const IUserState = DI.createInterface<IUserState>('IUserState', x => x.singleton(UserState));
export interface IUserState extends UserState { }
export class UserState {
  errors: ErrorList = [];
  current = User.NONE;
  isAuth = false;

  constructor(
    @IJwtService private readonly jwt: IJwtService,
    @IApiService private readonly api: IApiService,
  ) { }

  async load() {
    if (this.jwt.isTokenValid()) {
      const resp = await this.api.getCurrentUser();

      this.setAuth(resp.user);
    } else {
      this.clearAuth();
    }
  }

  async login(login: UserLogin) {
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

  logout(): void {
    this.clearAuth();
  }

  async register(registration: UserRegistration) {
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

  async update(user: UserUpdate) {
    const resp = await this.api.updateUser(user);

    if (resp instanceof UserResponse) {
      this.current = resp.user;
    }
  }

  private setAuth(user: User): void {
    this.jwt.saveToken(user.token);
    this.current = user;
    this.isAuth = true;
  }

  private clearAuth(): void {
    this.jwt.destroyToken();
    this.current = User.NONE;
    this.isAuth = false;
  }
}

/**
 * Singleton `Profile` state that represents the profile currently routed to.
 */
export const IProfileState = DI.createInterface<IProfileState>('IProfileState', x => x.singleton(ProfileState));
export interface IProfileState extends ProfileState { }
export class ProfileState {
  current = Profile.NONE;

  constructor(
    @IApiService private readonly api: IApiService,
  ) { }

  async toggleFollow() {
    const profile = this.current;
    const username = profile.username;
    let resp: ProfileResponse;
    if (profile.following) {
      resp = await this.api.unfollowUser(username);
    } else {
      resp = await this.api.followUser(username);
    }
    this.current = resp.profile;
  }

  async load(username: string) {
    const resp = await this.api.getProfile(username);
    this.current = resp.profile;
  }
}

/**
 * Singleton `Article` state that represents the article currently routed to.
 */
export const IArticleState = DI.createInterface<IArticleState>('IArticleState', x => x.singleton(ArticleState));
export interface IArticleState extends ArticleState { }
export class ArticleState {
  errors: ErrorList = [];
  current: Article = Article.NONE;
  comments: Comment[] = [];

  constructor(
    @IApiService private readonly api: IApiService,
  ) { }

  async toggleFollow() {
    const author = this.current.author;
    const username = author.username;
    let resp: ProfileResponse;
    if (author.following) {
      resp = await this.api.unfollowUser(username);
    } else {
      resp = await this.api.followUser(username);
    }
    this.current.author = resp.profile;
  }

  async toggleFavorite() {
    const article = this.current;
    let resp: ArticleResponse;
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

  async loadComments(slug: string) {
    const resp = await this.api.getCommentsFromArticle(slug);
    this.comments = resp.comments;
  }

  async save(article: Article) {
    this.errors = [];
    let resp: ErrorRecordResponse | ArticleResponse;
    if (article.slug) {
      resp = await this.api.updateArticle(article.slug, article);
    } else {
      resp = await this.api.createArticle(article);
    }
    if (resp instanceof ErrorRecordResponse) {
      this.errors = resp.toErrorList();
      return false;
    }
    this.current = resp.article
    return true;
  }

  async delete() {
    this.errors = [];
    await this.api.deleteArticle(this.current.slug);
    this.current = Article.NONE;
  }

  async addComment(body: string) {
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

  async deleteComment(commentId: number) {
    this.errors = [];
    const article = this.current;
    await this.api.deleteCommentFromArticle(article.slug, commentId);
    const idx = this.comments.findIndex(x => x.id === commentId);
    this.comments.splice(idx, 1);
  }
}

/**
 * Singleton `Article` list state that represents the list of articles (and the query params that narrow them down) currently being viewed.
 */
export const IArticleListState = DI.createInterface<IArticleListState>('IArticleListState', x => x.singleton(ArticleListState));
export interface IArticleListState extends ArticleListState { }
export class ArticleListState {
  items: Article[] = [];
  itemsCount = 0;
  currentPage = 0;
  pages: number[] = [];
  params: ArticleQueryParams = ArticleListQueryParams.create({ limit: 20, offset: 0 });

  constructor(
    @IApiService private readonly api: IApiService,
  ) { }

  async toggleFavorite(slug: string) {
    const idx = this.items.findIndex(x => x.slug === slug);
    const article = this.items[idx];
    let resp: ArticleResponse;
    if (article.favorited) {
      resp = await this.api.unfavoriteArticle(slug);
    } else {
      resp = await this.api.favoriteArticle(slug);
    }
    this.items.splice(idx, 1, resp.article);
  }

  async load(params: ArticleQueryParams = this.params) {
    this.params = params;
    let resp: ArticleListResponse;
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

/**
 * Singleton tags state that represents all global tags.
 */
export const ITagsState = DI.createInterface<ITagsState>('ITagsState', x => x.singleton(TagsState));
export interface ITagsState extends TagsState { }
export class TagsState {
  items: string[] = [];

  constructor(
    @IApiService private readonly api: IApiService,
  ) { }

  async load() {
    const resp = await this.api.getTags();
    this.items = resp.tags;
  }
}

export class AuthHandler implements ILifecycleHooks<IRouteableComponent, 'canLoad'> {
  constructor(
    @IUserState readonly auth: IUserState,
    @ILogger readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('AuthHandler')
  }

  canLoad(vm: IRouteableComponent, _params: Parameters, _instruction: RoutingInstruction, navigation: Navigation): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    if (!this.auth.isAuth) {
      this.logger.trace(`canLoad() - redirecting to login page`, navigation, this.auth);
      return 'login';
    }
    this.logger.trace(`canLoad() - proceeding`, navigation, this.auth);
    return true;
  }
}
