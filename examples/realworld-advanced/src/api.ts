import { IWindow } from '@aurelia/runtime-html';
import { DI, IHttpClient, ILogger } from 'aurelia';

// eslint-disable-next-line @typescript-eslint/ban-types
type FuncPropNames<T> = { [K in keyof T]: T[K] extends Function ? K : never; }[keyof T];
/**
 * Omit all function properties from the type.
 *
 * Used for modeling the object literal input parameters for the `static create` methods of classes that might also have instance methods.
 */
type OmitFuncProps<T> = Omit<T, FuncPropNames<T>>;

// #region Response objects

export class User {
  static get NONE(): User {
    return User.create({
      email: '',
      token: '',
      username: '',
      bio: '',
      image: '',
    });
  }

  private constructor(
    public email: string,
    public token: string,
    public username: string,
    public bio: string,
    public image: string,
  ) {}

  static create(obj: OmitFuncProps<User>): User {
    return new User(
      obj.email,
      obj.token,
      obj.username,
      obj.bio,
      obj.image,
    );
  }

  clone(): User {
    return User.create(this);
  }

  equals(other: User): boolean {
    return (
      this.email === other.email &&
      this.token === other.token &&
      this.username === other.username &&
      this.bio === other.bio &&
      this.image === other.image
    );
  }
}

export class UserResponse {
  private constructor(
    public user: User,
  ) {}

  static create(obj: OmitFuncProps<UserResponse>): UserResponse {
    return new UserResponse(User.create(obj.user));
  }
}

export class Profile {
  static get NONE(): Profile {
    return Profile.create({
      username: '',
      bio: '',
      image: '',
      following: false,
    });
  }

  private constructor(
    public username: string,
    public bio: string,
    public image: string,
    public following: boolean,
  ) {}

  static create(obj: OmitFuncProps<Profile>): Profile {
    return new Profile(
      obj.username,
      obj.bio,
      obj.image,
      obj.following,
    );
  }

  clone(): Profile {
    return Profile.create(this);
  }

  equals(other: Profile): boolean {
    return (
      this.username === other.username &&
      this.bio === other.bio &&
      this.image === other.image &&
      this.following === other.following
    );
  }
}

export class ProfileResponse {
  private constructor(
    public profile: Profile,
  ) {}

  static create(obj: OmitFuncProps<ProfileResponse>): ProfileResponse {
    return new ProfileResponse(Profile.create(obj.profile));
  }
}

export class Article {
  static get NONE(): Article {
    return Article.create({
      slug: '',
      title: '',
      description: '',
      body: '',
      tagList: [],
      createdAt: '',
      updatedAt: '',
      favorited: false,
      favoritesCount: 0,
      author: Profile.NONE,
    });
  }
  private constructor(
    public slug: string,
    public title: string,
    public description: string,
    public body: string,
    public tagList: string[],
    public createdAt: string,
    public updatedAt: string,
    public favorited: boolean,
    public favoritesCount: 0,
    public author: Profile,
  ) {}

  static create(obj: OmitFuncProps<Article>): Article {
    return new Article(
      obj.slug,
      obj.title,
      obj.description,
      obj.body,
      obj.tagList.slice(),
      obj.createdAt,
      obj.updatedAt,
      obj.favorited,
      obj.favoritesCount,
      Profile.create(obj.author),
    );
  }

  equals(other: Article): boolean {
    return (
      this.title === other.title &&
      this.description === other.description &&
      this.body === other.body &&
      this.tagList.length === other.tagList.length &&
      this.tagList.every((tag, i) => tag === other.tagList[i])
    );
  }

  clone(): Article {
    return Article.create(this);
  }
}

export class ArticleResponse {
  private constructor(
    public article: Article,
  ) {}

  static create(obj: OmitFuncProps<ArticleResponse>): ArticleResponse {
    return new ArticleResponse(Article.create(obj.article));
  }
}

export class ArticleListResponse {
  private constructor(
    public articles: Article[],
    public articlesCount: number,
  ) {}

  static create(obj: OmitFuncProps<ArticleListResponse>): ArticleListResponse {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return new ArticleListResponse(obj.articles.map(Article.create), obj.articlesCount);
  }
}

export class Comment {
  private constructor(
    public id: number,
    public body: string,
    public createdAt: string,
    public updatedAt: string,
    public author: Profile,
  ) {}

  static create(obj: OmitFuncProps<Comment>): Comment {
    return new Comment(
      obj.id,
      obj.body,
      obj.createdAt,
      obj.updatedAt,
      Profile.create(obj.author),
    );
  }

  clone(): Comment {
    return Comment.create(this);
  }
}

export class CommentResponse {
  private constructor(
    public comment: Comment,
  ) {}

  static create(obj: OmitFuncProps<CommentResponse>): CommentResponse {
    return new CommentResponse(Comment.create(obj.comment));
  }
}

export class CommentListResponse {
  private constructor(
    public comments: Comment[],
  ) {}

  static create(obj: OmitFuncProps<CommentListResponse>): CommentListResponse {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return new CommentListResponse(obj.comments.map(Comment.create));
  }
}

export class TagListResponse {
  private constructor(
    public tags: string[],
  ) {}

  static create(obj: OmitFuncProps<TagListResponse>): TagListResponse {
    return new TagListResponse(obj.tags);
  }
}

export type ErrorList = [string, string[]][];
export type ErrorRecord = Record<string, string[]>;
export class ErrorRecordResponse {
  private constructor(
    public errors: ErrorRecord,
  ) {}

  static create(obj: OmitFuncProps<ErrorRecordResponse>): ErrorRecordResponse {
    return new ErrorRecordResponse(Object.keys(obj.errors).reduce((errors, key) => {
      errors[key] = obj.errors[key].slice();
      return errors;
    }, {} as ErrorRecord));
  }

  toErrorList(): ErrorList {
    return Object.keys(this.errors).map(key => [key, this.errors[key]]);
  }
}

// #endregion

// #region Request objects

export class UserLogin {
  private constructor(
    public email: string,
    public password: string,
  ) {}

  static create(input: OmitFuncProps<UserLogin>): UserLogin {
    return new UserLogin(input.email, input.password);
  }
}

export class UserLoginRequest {
  private constructor(
    public user: UserLogin,
  ) {}

  static create(input: OmitFuncProps<UserLogin>): UserLoginRequest {
    return new UserLoginRequest(UserLogin.create(input));
  }
}

export class UserRegistration {
  private constructor(
    public username: string,
    public email: string,
    public password: string,
  ) {}

  static create(input: OmitFuncProps<UserRegistration>): UserRegistration {
    return new UserRegistration(input.username, input.email, input.password);
  }
}

export class UserRegistrationRequest {
  private constructor(
    public user: UserRegistration,
  ) {}

  static create(input: OmitFuncProps<UserRegistration>): UserRegistrationRequest {
    return new UserRegistrationRequest(UserRegistration.create(input));
  }
}

export class UserUpdate {
  private constructor(
    public email?: string,
    public token?: string,
    public username?: string,
    public bio?: string,
    public image?: string,
  ) {}

  static create(input: OmitFuncProps<UserUpdate>): UserUpdate {
    return new UserUpdate(
      input.email,
      input.token,
      input.username,
      input.bio,
      input.image,
    );
  }
}

export class UserUpdateRequest {
  private constructor(
    public user: UserUpdate,
  ) {}

  static create(input: OmitFuncProps<UserUpdate>): UserUpdateRequest {
    return new UserUpdateRequest(UserUpdate.create(input));
  }
}

type PurifyQueryParams<T> = Omit<T, 'type' | FuncPropNames<T>>;

export class ArticleListQueryParams {
  get type(): 'all' { return 'all'; }

  private constructor(
    public limit: number,
    public offset: number,
    public tag?: string,
    public author?: string,
    public favorited?: string,
  ) {}

  static create(input: PurifyQueryParams<ArticleListQueryParams>): ArticleListQueryParams {
    return new ArticleListQueryParams(
      input.limit,
      input.offset,
      input.tag,
      input.author,
      input.favorited,
    );
  }

  equals(other: ArticleQueryParams): boolean {
    return (
      this.type === other.type &&
      this.limit === other.limit &&
      this.offset === other.offset &&
      this.tag === other.tag &&
      this.author === other.author &&
      this.favorited === other.favorited
    );
  }

  clone(overwrites: Partial<PurifyQueryParams<ArticleListQueryParams>> = {}): ArticleListQueryParams {
    return ArticleListQueryParams.create({ ...this, ...overwrites });
  }

  toQueryString(): string {
    return toQueryString(this);
  }
}

export class FeedArticleListQueryParams {
  get type(): 'feed' { return 'feed'; }

  private constructor(
    public limit: number,
    public offset: number,
  ) {}

  static create(input: PurifyQueryParams<FeedArticleListQueryParams>): FeedArticleListQueryParams {
    return new FeedArticleListQueryParams(input.limit, input.offset);
  }

  equals(other: ArticleQueryParams): boolean {
    return (
      this.type === other.type &&
      this.limit === other.limit &&
      this.offset === other.offset
    );
  }

  clone(overwrites: Partial<PurifyQueryParams<FeedArticleListQueryParams>> = {}): FeedArticleListQueryParams {
    return FeedArticleListQueryParams.create({ ...this, ...overwrites });
  }

  toQueryString(): string {
    return toQueryString(this);
  }
}

export type ArticleQueryParams = (
  ArticleListQueryParams |
  FeedArticleListQueryParams
);

function toQueryString(obj: PurifyQueryParams<ArticleQueryParams>): string {
  const keys = Object.keys(obj) as (keyof PurifyQueryParams<ArticleQueryParams>)[];
  const pairs: string[] = [];
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined) {
      pairs.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

export class ArticleCreate {
  private constructor(
    public title: string,
    public description: string,
    public body: string,
    public tagList: string[],
  ) {}

  static create(input: OmitFuncProps<ArticleCreate>): ArticleCreate {
    return new ArticleCreate(input.title, input.description, input.body, input.tagList.slice());
  }
}

export class ArticleCreateRequest {
  private constructor(
    public article: ArticleCreate,
  ) {}

  static create(input: OmitFuncProps<ArticleCreate>): ArticleCreateRequest {
    return new ArticleCreateRequest(ArticleCreate.create(input));
  }
}

export class ArticleUpdate {
  private constructor(
    public title?: string,
    public description?: string,
    public body?: string,
    public tagList?: string[],
  ) {}

  static create(input: OmitFuncProps<ArticleUpdate>): ArticleUpdate {
    return new ArticleUpdate(input.title, input.description, input.body, input.tagList?.slice());
  }
}

export class ArticleUpdateRequest {
  private constructor(
    public article: ArticleUpdate,
  ) {}

  static create(input: OmitFuncProps<ArticleUpdate>): ArticleUpdateRequest {
    return new ArticleUpdateRequest(ArticleUpdate.create(input));
  }
}

export class CommentCreate {
  private constructor(
    public body: string,
  ) {}

  static create(input: OmitFuncProps<CommentCreate>): CommentCreate {
    return new CommentCreate(input.body);
  }
}

export class CommentCreateRequest {
  private constructor(
    public comment: CommentCreate,
  ) {}

  static create(input: OmitFuncProps<CommentCreate>): CommentCreateRequest {
    return new CommentCreateRequest(CommentCreate.create(input));
  }
}

// #endregion

// #region Api service

export const IJwtService = DI.createInterface<IJwtService>('IJwtService', x => x.singleton(JwtService));
export interface IJwtService extends JwtService {}
export class JwtService {
  constructor(
    @IWindow readonly w: IWindow,
  ) {}

  getToken(): string | null {
    return this.w.localStorage.getItem('jwtToken');
  }

  saveToken(token: string): void {
    this.w.localStorage.setItem('jwtToken', token);
  }

  destroyToken(): void {
    this.w.localStorage.removeItem('jwtToken');
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  getAuthorizationHeader(): string | null {
    if (this.isTokenValid()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return `Token ${this.getToken()!}`;
    }
    return null;
  }
}

type CreateArg<T> = T extends { create(arg: infer A): any } ? A : never;

export const IApiService = DI.createInterface<IApiService>('IApiService', x => x.singleton(ApiService));
export interface IApiService extends ApiService {}
export class ApiService {
  constructor(
    @ILogger private readonly logger: ILogger,
    @IHttpClient private readonly http: IHttpClient,
    @IJwtService private readonly jwt: IJwtService,
  ) {
    this.logger = logger.scopeTo('ApiService');

    http.configure(x => x
      .withBaseUrl('https://conduit.productionready.io/api')
      .withDefaults({
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }).withInterceptor({
        request(request) {
          if (!request.headers.has('Authorization') && jwt.isTokenValid()) {
            logger.debug(`request(${request.method} ${request.url}) - adding auth header`);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.headers.append('Authorization', jwt.getAuthorizationHeader()!);
          } else {
            logger.debug(`request(${request.method} ${request.url}) - skipping auth header`);
          }
          return request;
        },
      })
    );
  }

  loginUser(login: CreateArg<typeof UserLogin>): Promise<UserResponse | ErrorRecordResponse> {
    const body = JSON.stringify(UserLoginRequest.create(login));
    this.logger.trace(`loginUser(body:${body})`);
    return this.handle(this.http.post(`/users/login`, body), UserResponse, true);
  }

  registerUser(registration: CreateArg<typeof UserRegistration>): Promise<UserResponse | ErrorRecordResponse> {
    const body = JSON.stringify(UserRegistrationRequest.create(registration));
    this.logger.trace(`registerUser(body:${body})`);
    return this.handle(this.http.post(`/users`, body), UserResponse, true);
  }

  getCurrentUser(): Promise<UserResponse> {
    this.logger.trace(`getCurrentUser()`);
    return this.handle(this.http.get(`/user`), UserResponse);
  }

  updateUser(user: CreateArg<typeof UserUpdate>): Promise<UserResponse> {
    const body = JSON.stringify(UserUpdateRequest.create(user));
    this.logger.trace(`updateUser(body:${body})`);
    return this.handle(this.http.put(`/user`, body), UserResponse);
  }

  getProfile(username: string): Promise<ProfileResponse> {
    this.logger.trace(`getProfile(username:'${username}')`);
    return this.handle(this.http.get(`/profiles/${username}`), ProfileResponse);
  }

  followUser(username: string): Promise<ProfileResponse> {
    this.logger.trace(`followUser(username:'${username}')`);
    return this.handle(this.http.post(`/profiles/${username}/follow`), ProfileResponse);
  }

  unfollowUser(username: string): Promise<ProfileResponse> {
    this.logger.trace(`unfollowUser(username:'${username}')`);
    return this.handle(this.http.delete(`/profiles/${username}/follow`), ProfileResponse);
  }

  getArticles(params: CreateArg<typeof ArticleListQueryParams>): Promise<ArticleListResponse> {
    const query = ArticleListQueryParams.create(params).toQueryString();
    this.logger.trace(`getArticles(query:'${query}')`);
    return this.handle(this.http.get(`/articles${query}`), ArticleListResponse);
  }

  getFeedArticles(params: CreateArg<typeof FeedArticleListQueryParams>): Promise<ArticleListResponse> {
    const query = FeedArticleListQueryParams.create(params).toQueryString();
    this.logger.trace(`getFeedArticles(query:'${query}')`);
    return this.handle(this.http.get(`/articles/feed${query}`), ArticleListResponse);
  }

  getArticle(slug: string): Promise<ArticleResponse> {
    this.logger.trace(`getArticle(slug:'${slug}')`);
    return this.handle(this.http.get(`/articles/${slug}`), ArticleResponse);
  }

  createArticle(article: CreateArg<typeof ArticleCreate>): Promise<ArticleResponse | ErrorRecordResponse> {
    const body = JSON.stringify(ArticleCreateRequest.create(article));
    this.logger.trace(`createArticle(body:${body})`);
    return this.handle(this.http.post(`/articles`, body), ArticleResponse, true);
  }

  updateArticle(slug: string, article: CreateArg<typeof ArticleUpdate>): Promise<ArticleResponse | ErrorRecordResponse> {
    const body = JSON.stringify(ArticleUpdateRequest.create(article));
    this.logger.trace(`updateArticle(slug:'${slug}',body:${body})`);
    return this.handle(this.http.put(`/articles/${slug}`, body), ArticleResponse, true);
  }

  deleteArticle(slug: string): Promise<void> {
    this.logger.trace(`deleteArticle(slug:'${slug}')`);
    return this.handle(this.http.delete(`/articles/${slug}`));
  }

  addCommentToArticle(slug: string, comment: CreateArg<typeof CommentCreate>): Promise<CommentResponse | ErrorRecordResponse> {
    const body = JSON.stringify(CommentCreateRequest.create(comment));
    this.logger.trace(`addCommentToArticle(slug:'${slug}',body:${body})`);
    return this.handle(this.http.post(`/articles/${slug}/comments`, body), CommentResponse, true);
  }

  getCommentsFromArticle(slug: string): Promise<CommentListResponse> {
    this.logger.trace(`getCommentsFromArticle(slug:'${slug}')`);
    return this.handle(this.http.get(`/articles/${slug}/comments`), CommentListResponse);
  }

  deleteCommentFromArticle(slug: string, id: number): Promise<void> {
    this.logger.trace(`deleteCommentFromArticle(slug:'${slug}',id:${id})`);
    return this.handle(this.http.delete(`/articles/${slug}/comments/${id}`));
  }

  favoriteArticle(slug: string): Promise<ArticleResponse> {
    this.logger.trace(`favoriteArticle(slug:'${slug}')`);
    return this.handle(this.http.post(`/articles/${slug}/favorite`), ArticleResponse);
  }

  unfavoriteArticle(slug: string): Promise<ArticleResponse> {
    this.logger.trace(`unfavoriteArticle(slug:'${slug}')`);
    return this.handle(this.http.delete(`/articles/${slug}/favorite`), ArticleResponse);
  }

  getTags(): Promise<TagListResponse> {
    this.logger.trace(`getTags()`);
    return this.handle(this.http.get(`/tags`), TagListResponse);
  }

  private async handle<T extends ResponseConstructor>(p: Promise<Response>, Type: T, handleValidationErrors: true): Promise<ReturnType<T['create']> | ErrorRecordResponse>;
  private async handle<T extends ResponseConstructor>(p: Promise<Response>, Type: T): Promise<ReturnType<T['create']>>;
  private async handle(p: Promise<Response>): Promise<void>;
  private async handle<T extends ResponseConstructor>(p: Promise<Response>, Type?: T, handleValidationErrors?: true): Promise<ReturnType<T['create']> | ErrorRecordResponse | void> {
    const response = await p;
    if (response.status >= 200 && response.status < 400) {
      if (Type === undefined) {
        this.logger.trace(`handle() - ignoring response body`, response);
        return;
      } else {
        this.logger.trace(`handle() - retrieving normal response body`, response);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json = await response.json();
        this.logger.trace(`handle() - done`, json);
        return Type.create(json) as ReturnType<T['create']>;
      }
    }

    // https://github.com/gothinkster/realworld/tree/master/api#errors-and-status-codes
    if (response.status === 422 && handleValidationErrors) {
      this.logger.trace(`handle() - retrieving error response body`, response);
      const json = await response.json() as ErrorRecordResponse;
      this.logger.trace(`handle() - done`, json);
      return ErrorRecordResponse.create(json);
    }

    throw new HttpError(response);
  }
}

type ResponseConstructor = (
  typeof UserResponse |
  typeof ProfileResponse |
  typeof ArticleResponse |
  typeof ArticleListResponse |
  typeof CommentResponse |
  typeof CommentListResponse |
  typeof TagListResponse
);

export class HttpError extends Error {
  constructor(public readonly response: Response) {
    super(`HTTP error code ${response.status} (${response.statusText})`);
  }
}

// #endregion
