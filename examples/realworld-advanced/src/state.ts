import { DI, ILifecycleHooks, ILogger, IRouteViewModel, lifecycleHooks, NavigationInstruction, Params, RouteNode } from 'aurelia';
import { Article, ArticleListResponse, ArticleResponse, Comment, ErrorRecordResponse, IApiService, IJwtService, ArticleQueryParams, User, UserLogin, UserRegistration, UserResponse, UserUpdate, ArticleListQueryParams, Profile, ProfileResponse, ErrorList } from './api';

/**
 * Singleton `User` state that represents the currently logged-in user.
 */
export const IUserState = DI.createInterface<IUserState>('IUserState', x => x.singleton(UserState));
export interface IUserState extends UserState {}
export class UserState {
  errors: ErrorList = [];
  current = User.NONE;
  isAuth = false;

  constructor(
    @IJwtService private readonly jwt: IJwtService,
    @IApiService private readonly api: IApiService,
  ) {}

  loadPending = false;
  async load(): Promise<void> {
    if (this.jwt.isTokenValid()) {
      this.loadPending = true;
      const resp = await this.api.getCurrentUser();
      this.loadPending = false;

      this.setAuth(resp.user);
    } else {
      this.clearAuth();
    }
  }

  loginPending = false;
  async login(login: UserLogin): Promise<boolean> {
    this.errors = [];

    this.loginPending = true;
    const resp = await this.api.loginUser(login);
    this.loginPending = false;

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

  registerPending = false;
  async register(registration: UserRegistration): Promise<boolean> {
    this.errors = [];

    this.registerPending = true;
    const resp = await this.api.registerUser(registration);
    this.registerPending = false;

    if (resp instanceof ErrorRecordResponse) {
      this.clearAuth();
      this.errors = resp.toErrorList();
      return false;
    }
    this.setAuth(resp.user);
    return true;
  }

  updatePending = false;
  async update(user: UserUpdate): Promise<void> {
    this.updatePending = true;
    const resp = await this.api.updateUser(user);
    this.updatePending = false;

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
export interface IProfileState extends ProfileState {}
export class ProfileState {
  current = Profile.NONE;

  constructor(
    @IApiService private readonly api: IApiService,
  ) {}

  toggleFollowPending = false;
  async toggleFollow(): Promise<void> {
    const profile = this.current;
    const username = profile.username;
    let resp: ProfileResponse;

    this.toggleFollowPending = true;
    if (profile.following) {
      resp = await this.api.unfollowUser(username);
    } else {
      resp = await this.api.followUser(username);
    }
    this.toggleFollowPending = false;

    this.current = resp.profile;
  }

  // Stuff for request deduplication.
  // Not super necessary in this app, but still good form when arbitrary components may request data from the state object.
  // This guarantees only the first request results in an api call, and subsequent requests will wait for the same initial promise.
  private nextUsername = '';
  private loadPromise: Promise<void> | null = null;
  loadPending = false;
  async load(username: string): Promise<void> {
    if (username === this.nextUsername) {
      return this.loadPromise ?? undefined;
    }

    this.nextUsername = username;
    return this.loadPromise = (async () => {
      this.loadPending = true;
      const resp = await this.api.getProfile(username);
      this.loadPending = false;
      this.loadPromise = null;

      this.current = resp.profile;
    })();
  }
}

/**
 * Singleton `Article` state that represents the article currently routed to.
 */
export const IArticleState = DI.createInterface<IArticleState>('IArticleState', x => x.singleton(ArticleState));
export interface IArticleState extends ArticleState {}
export class ArticleState {
  errors: ErrorList = [];
  current: Article = Article.NONE;
  comments: Comment[] = [];

  constructor(
    @IApiService private readonly api: IApiService,
  ) {}

  toggleFollowPending = false;
  async toggleFollow(): Promise<void> {
    const author = this.current.author;
    const username = author.username;
    let resp: ProfileResponse;

    this.toggleFollowPending = true;
    if (author.following) {
      resp = await this.api.unfollowUser(username);
    } else {
      resp = await this.api.followUser(username);
    }
    this.toggleFollowPending = false;

    this.current.author = resp.profile;
  }

  toggleFavoritePending = false;
  async toggleFavorite(): Promise<void> {
    const article = this.current;
    let resp: ArticleResponse;

    this.toggleFavoritePending = true;
    if (article.favorited) {
      resp = await this.api.unfavoriteArticle(article.slug);
    } else {
      resp = await this.api.favoriteArticle(article.slug);
    }
    this.toggleFavoritePending = false;

    this.current = resp.article;
  }

  private nextSlug = '';
  private loadPromise: Promise<void> | null = null;
  loadPending = false;
  async load(slug = ''): Promise<void> {
    if (slug === this.nextSlug) {
      return this.loadPromise ?? undefined;
    }

    this.nextSlug = slug;
    this.current = Article.NONE;
    this.comments = [];

    if (slug) {
      return this.loadPromise = (async () => {
        this.loadPending = true;
        // TODO: handle 404 and other errors gracefully
        const resp = await this.api.getArticle(slug);
        if (slug === this.nextSlug) {
          this.loadPending = false;
          this.loadPromise = null;
          this.current = resp.article;
        }
      })();
    }
  }

  private nextCommentsSlug = '';
  private loadCommentsPromise: Promise<void> | null = null;
  loadCommentsPending = false;
  async loadComments(slug: string): Promise<void> {
    if (slug === this.nextCommentsSlug) {
      return this.loadCommentsPromise ?? undefined;
    }

    this.nextCommentsSlug = slug;

    return this.loadCommentsPromise = (async () => {
      this.loadCommentsPending = true;
      // TODO: handle 404 and other errors gracefully
      const resp = await this.api.getCommentsFromArticle(slug);
      if (slug === this.nextCommentsSlug) {
        this.loadCommentsPending = false;
        this.loadCommentsPromise = null;
        this.comments = resp.comments;
      }
    })();
  }

  savePending = false;
  async save(article: Article): Promise<boolean> {
    this.errors = [];
    let resp: ErrorRecordResponse | ArticleResponse;

    this.savePending = true;
    if (article.slug) {
      resp = await this.api.updateArticle(article.slug, article);
    } else {
      resp = await this.api.createArticle(article);
    }
    this.savePending = false;

    if (resp instanceof ErrorRecordResponse) {
      this.errors = resp.toErrorList();
      return false;
    }
    this.current = resp.article
    return true;
  }

  deletePending = false;
  async delete(): Promise<void> {
    this.errors = [];

    this.deletePending = true;
    await this.api.deleteArticle(this.current.slug);
    this.deletePending = false;

    this.current = Article.NONE;
  }

  addCommentPending = false;
  async addComment(body: string): Promise<boolean> {
    this.errors = [];
    const article = this.current;

    this.addCommentPending = true;
    const resp = await this.api.addCommentToArticle(article.slug, { body });
    this.addCommentPending = false;

    if (resp instanceof ErrorRecordResponse) {
      this.errors = resp.toErrorList();
      return false;
    }
    this.comments.push(resp.comment);
    return true;
  }

  deleteCommentPending = false;
  async deleteComment(commentId: number): Promise<void> {
    if (this.deleteCommentPending) {
      return;
    }

    this.errors = [];
    const article = this.current;

    this.deleteCommentPending = true;
    await this.api.deleteCommentFromArticle(article.slug, commentId);
    this.deleteCommentPending = false;

    const idx = this.comments.findIndex(x => x.id === commentId);
    this.comments.splice(idx, 1);
  }
}

/**
 * Singleton `Article` list state that represents the list of articles (and the query params that narrow them down) currently being viewed.
 */
export const IArticleListState = DI.createInterface<IArticleListState>('IArticleListState', x => x.singleton(ArticleListState));
export interface IArticleListState extends ArticleListState {}
export class ArticleListState {
  items: Article[] = [];
  itemsCount = 0;
  currentPage = 0;
  pages: number[] = [];
  params: ArticleQueryParams = ArticleListQueryParams.create({ limit: 20, offset: 0 });

  constructor(
    @IApiService private readonly api: IApiService,
  ) {}

  toggleFavoritePending = {} as Record<string, boolean>;
  async toggleFavorite(slug: string): Promise<void> {
    const idx = this.items.findIndex(x => x.slug === slug);
    const article = this.items[idx];
    let resp: ArticleResponse;

    this.toggleFavoritePending[slug] = true;
    if (article.favorited) {
      resp = await this.api.unfavoriteArticle(slug);
    } else {
      resp = await this.api.favoriteArticle(slug);
    }
    this.toggleFavoritePending[slug] = false;

    this.items.splice(idx, 1, resp.article);
  }

  loadPending = false;
  async load(params: ArticleQueryParams = this.params): Promise<void> {
    this.params = params;
    let resp: ArticleListResponse;

    this.loadPending = true;
    if (params.type === 'all') {
      resp = await this.api.getArticles(params);
    } else {
      resp = await this.api.getFeedArticles(params);
    }
    this.loadPending = false;

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
export interface ITagsState extends TagsState {}
export class TagsState {
  items: string[] = [];

  constructor(
    @IApiService private readonly api: IApiService,
  ) {}

  loadPending = false;
  async load(): Promise<void> {
    this.loadPending = true;
    const resp = await this.api.getTags();
    this.loadPending = false;

    this.items = resp.tags;
  }
}

@lifecycleHooks()
export class AuthHandler implements ILifecycleHooks<IRouteViewModel, 'canLoad'> {
  constructor(
    @IUserState readonly auth: IUserState,
    @ILogger readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('AuthHandler')
  }

  canLoad(vm: IRouteViewModel, params: Params, next: RouteNode): boolean | NavigationInstruction {
    if (!this.auth.isAuth) {
      this.logger.trace(`canLoad() - redirecting to login page`, next, this.auth);
      return 'login';
    }
    this.logger.trace(`canLoad() - proceeding`, next, this.auth);
    return true;
  }
}
