import { DI, IHttpClient, ILogger } from './aurelia.js';

// #region Response objects

export class User {
  static get NONE() {
    return User.create({
      email: '',
      token: '',
      username: '',
      bio: '',
      image: '',
    });
  }

  constructor(email, token, username, bio, image) {
    this.email = email;
    this.token = token;
    this.username = username;
    this.bio = bio;
    this.image = image;
  }

  static create(obj) {
    return new User(obj.email, obj.token, obj.username, obj.bio, obj.image);
  }

  clone() {
    return User.create(this);
  }
}

export class UserResponse {
  constructor(user) {
    this.user = user;
  }

  static create(obj) {
    return new UserResponse(User.create(obj.user));
  }
}

export class Profile {
  static get NONE() {
    return Profile.create({
      username: '',
      bio: '',
      image: '',
      following: false,
    });
  }

  constructor(username, bio, image, following) {
    this.username = username;
    this.bio = bio;
    this.image = image;
    this.following = following;
  }

  static create(obj) {
    return new Profile(obj.username, obj.bio, obj.image, obj.following);
  }

  clone() {
    return Profile.create(this);
  }
}

export class ProfileResponse {
  constructor(profile) {
    this.profile = profile;
  }

  static create(obj) {
    return new ProfileResponse(Profile.create(obj.profile));
  }
}
export class Article {
  static get NONE() {
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

  constructor(slug, title, description, body, tagList, createdAt, updatedAt, favorited, favoritesCount, author) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.body = body;
    this.tagList = tagList;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.favorited = favorited;
    this.favoritesCount = favoritesCount;
    this.author = author;
  }

  static create(obj) {
    return new Article(obj.slug, obj.title, obj.description, obj.body, obj.tagList.slice(), obj.createdAt, obj.updatedAt, obj.favorited, obj.favoritesCount, Profile.create(obj.author));
  }

  clone() {
    return Article.create(this);
  }
}

export class ArticleResponse {
  constructor(article) {
    this.article = article;
  }

  static create(obj) {
    return new ArticleResponse(Article.create(obj.article));
  }
}

export class ArticleListResponse {
  constructor(articles, articlesCount) {
    this.articles = articles;
    this.articlesCount = articlesCount;
  }

  static create(obj) {
    return new ArticleListResponse(obj.articles.map(Article.create), obj.articlesCount);
  }
}

export class Comment {
  constructor(id, body, createdAt, updatedAt, author) {
    this.id = id;
    this.body = body;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.author = author;
  }

  static create(obj) {
    return new Comment(obj.id, obj.body, obj.createdAt, obj.updatedAt, Profile.create(obj.author));
  }

  clone() {
    return Comment.create(this);
  }
}

export class CommentResponse {
  constructor(comment) {
    this.comment = comment;
  }

  static create(obj) {
    return new CommentResponse(Comment.create(obj.comment));
  }
}

export class CommentListResponse {
  constructor(comments) {
    this.comments = comments;
  }

  static create(obj) {
    return new CommentListResponse(obj.comments.map(Comment.create));
  }
}

export class TagListResponse {
  constructor(tags) {
    this.tags = tags;
  }

  static create(obj) {
    return new TagListResponse(obj.tags);
  }
}

export class ErrorRecordResponse {
  constructor(errors) {
    this.errors = errors;
  }

  static create(obj) {
    return new ErrorRecordResponse(Object.keys(obj.errors).reduce((errors, key) => {
      errors[key] = obj.errors[key].slice();
      return errors;
    }, {}));
  }

  toErrorList() {
    return Object.keys(this.errors).map(key => [key, this.errors[key]]);
  }
}

// #endregion

// #region Request objects

export class UserLogin {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  static create(input) {
    return new UserLogin(input.email, input.password);
  }
}

export class UserLoginRequest {
  constructor(user) {
    this.user = user;
  }

  static create(input) {
    return new UserLoginRequest(UserLogin.create(input));
  }
}

export class UserRegistration {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  static create(input) {
    return new UserRegistration(input.username, input.email, input.password);
  }
}

export class UserRegistrationRequest {
  constructor(user) {
    this.user = user;
  }

  static create(input) {
    return new UserRegistrationRequest(UserRegistration.create(input));
  }
}

export class UserUpdate {
  constructor(email, token, username, bio, image) {
    this.email = email;
    this.token = token;
    this.username = username;
    this.bio = bio;
    this.image = image;
  }

  static create(input) {
    return new UserUpdate(input.email, input.token, input.username, input.bio, input.image);
  }
}

export class UserUpdateRequest {
  constructor(user) {
    this.user = user;
  }

  static create(input) {
    return new UserUpdateRequest(UserUpdate.create(input));
  }
}

export class ArticleListQueryParams {
  get type() { return 'all'; }

  constructor(limit, offset, tag, author, favorited) {
    this.limit = limit;
    this.offset = offset;
    this.tag = tag;
    this.author = author;
    this.favorited = favorited;
  }

  static create(input) {
    return new ArticleListQueryParams(input.limit, input.offset, input.tag, input.author, input.favorited);
  }

  clone(overwrites = {}) {
    return ArticleListQueryParams.create({ ...this, ...overwrites });
  }

  toQueryString() {
    return toQueryString(this);
  }
}

export class FeedArticleListQueryParams {
  get type() { return 'feed'; }

  constructor(limit, offset) {
    this.limit = limit;
    this.offset = offset;
  }

  static create(input) {
    return new FeedArticleListQueryParams(input.limit, input.offset);
  }

  clone(overwrites = {}) {
    return FeedArticleListQueryParams.create({ ...this, ...overwrites });
  }

  toQueryString() {
    return toQueryString(this);
  }
}

function toQueryString(obj) {
  const keys = Object.keys(obj);
  const pairs = [];
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined) {
      pairs.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

export class ArticleCreate {
  constructor(title, description, body, tagList) {
    this.title = title;
    this.description = description;
    this.body = body;
    this.tagList = tagList;
  }

  static create(input) {
    return new ArticleCreate(input.title, input.description, input.body, input.tagList.slice());
  }
}

export class ArticleCreateRequest {
  constructor(article) {
    this.article = article;
  }

  static create(input) {
    return new ArticleCreateRequest(ArticleCreate.create(input));
  }
}

export class ArticleUpdate {
  constructor(title, description, body, tagList) {
    this.title = title;
    this.description = description;
    this.body = body;
    this.tagList = tagList;
  }

  static create(input) {
    return new ArticleUpdate(input.title, input.description, input.body, input.tagList?.slice());
  }
}

export class ArticleUpdateRequest {
  constructor(article) {
    this.article = article;
  }

  static create(input) {
    return new ArticleUpdateRequest(ArticleUpdate.create(input));
  }
}

export class CommentCreate {
  constructor(body) {
    this.body = body;
  }

  static create(input) {
    return new CommentCreate(input.body);
  }
}

export class CommentCreateRequest {
  constructor(comment) {
    this.comment = comment;
  }

  static create(input) {
    return new CommentCreateRequest(CommentCreate.create(input));
  }
}

// #endregion

// #region Api service

export const IJwtService = DI.createInterface('IJwtService', x => x.singleton(JwtService));
export class JwtService {
  getToken() {
    return window.localStorage.getItem('jwtToken');
  }

  saveToken(token) {
    window.localStorage.setItem('jwtToken', token);
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

  isTokenValid() {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  getAuthorizationHeader() {
    if (this.isTokenValid()) {
      return `Token ${this.getToken()}`;
    }
    return null;
  }
}

export const IApiService = DI.createInterface('IApiService', x => x.singleton(ApiService));
export class ApiService {
  static get inject() { return [ILogger, IHttpClient, IJwtService]; }

  constructor(logger, http, jwt) {
    this.logger = logger.scopeTo('ApiService');
    this.http = http;
    this.jwt = jwt;

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
            request.headers.append('Authorization', jwt.getAuthorizationHeader());
          } else {
            logger.debug(`request(${request.method} ${request.url}) - skipping auth header`);
          }
          return request;
        },
      })
    );
  }

  loginUser(login) {
    const body = JSON.stringify(UserLoginRequest.create(login));
    this.logger.trace(`loginUser(body:${body})`);
    return this.handle(this.http.post(`/users/login`, body), UserResponse, true);
  }

  registerUser(registration) {
    const body = JSON.stringify(UserRegistrationRequest.create(registration));
    this.logger.trace(`registerUser(body:${body})`);
    return this.handle(this.http.post(`/users`, body), UserResponse, true);
  }

  getCurrentUser() {
    this.logger.trace(`getCurrentUser()`);
    return this.handle(this.http.get(`/user`), UserResponse);
  }

  updateUser(user) {
    const body = JSON.stringify(UserUpdateRequest.create(user));
    this.logger.trace(`updateUser(body:${body})`);
    return this.handle(this.http.put(`/user`, body), UserResponse);
  }

  getProfile(username) {
    this.logger.trace(`getProfile(username:'${username}')`);
    return this.handle(this.http.get(`/profiles/${username}`), ProfileResponse);
  }

  followUser(username) {
    this.logger.trace(`followUser(username:'${username}')`);
    return this.handle(this.http.post(`/profiles/${username}/follow`), ProfileResponse);
  }

  unfollowUser(username) {
    this.logger.trace(`unfollowUser(username:'${username}')`);
    return this.handle(this.http.delete(`/profiles/${username}/follow`), ProfileResponse);
  }

  getArticles(params) {
    const query = ArticleListQueryParams.create(params).toQueryString();
    this.logger.trace(`getArticles(query:'${query}')`);
    return this.handle(this.http.get(`/articles${query}`), ArticleListResponse);
  }

  getFeedArticles(params) {
    const query = FeedArticleListQueryParams.create(params).toQueryString();
    this.logger.trace(`getFeedArticles(query:'${query}')`);
    return this.handle(this.http.get(`/articles/feed${query}`), ArticleListResponse);
  }

  getArticle(slug) {
    this.logger.trace(`getArticle(slug:'${slug}')`);
    return this.handle(this.http.get(`/articles/${slug}`), ArticleResponse);
  }

  createArticle(article) {
    const body = JSON.stringify(ArticleCreateRequest.create(article));
    this.logger.trace(`createArticle(body:${body})`);
    return this.handle(this.http.post(`/articles`, body), ArticleResponse, true);
  }

  updateArticle(slug, article) {
    const body = JSON.stringify(ArticleUpdateRequest.create(article));
    this.logger.trace(`updateArticle(slug:'${slug}',body:${body})`);
    return this.handle(this.http.put(`/articles/${slug}`, body), ArticleResponse, true);
  }

  deleteArticle(slug) {
    this.logger.trace(`deleteArticle(slug:'${slug}')`);
    return this.handle(this.http.delete(`/articles/${slug}`));
  }

  addCommentToArticle(slug, comment) {
    const body = JSON.stringify(CommentCreateRequest.create(comment));
    this.logger.trace(`addCommentToArticle(slug:'${slug}',body:${body})`);
    return this.handle(this.http.post(`/articles/${slug}/comments`, body), CommentResponse, true);
  }

  getCommentsFromArticle(slug) {
    this.logger.trace(`getCommentsFromArticle(slug:'${slug}')`);
    return this.handle(this.http.get(`/articles/${slug}/comments`), CommentListResponse);
  }

  deleteCommentFromArticle(slug, id) {
    this.logger.trace(`deleteCommentFromArticle(slug:'${slug}',id:${id})`);
    return this.handle(this.http.delete(`/articles/${slug}/comments/${id}`));
  }

  favoriteArticle(slug) {
    this.logger.trace(`favoriteArticle(slug:'${slug}')`);
    return this.handle(this.http.post(`/articles/${slug}/favorite`), ArticleResponse);
  }

  unfavoriteArticle(slug) {
    this.logger.trace(`unfavoriteArticle(slug:'${slug}')`);
    return this.handle(this.http.delete(`/articles/${slug}/favorite`), ArticleResponse);
  }

  getTags() {
    this.logger.trace(`getTags()`);
    return this.handle(this.http.get(`/tags`), TagListResponse);
  }

  async handle(p, Type, handleValidationErrors) {
    const response = await p;
    if (response.status >= 200 && response.status < 400) {
      if (Type === undefined) {
        this.logger.trace(`handle() - ignoring response body`, response);
        return;
      } else {
        this.logger.trace(`handle() - retrieving normal response body`, response);
        const json = await response.json();
        this.logger.trace(`handle() - done`, json);
        return Type.create(json);
      }
    }

    // https://github.com/gothinkster/realworld/tree/master/api#errors-and-status-codes
    if (response.status === 422 && handleValidationErrors) {
      this.logger.trace(`handle() - retrieving error response body`, response);
      const json = await response.json();
      this.logger.trace(`handle() - done`, json);
      return ErrorRecordResponse.create(json);
    }

    throw new HttpError(response);
  }
}

// #endregion

export class HttpError extends Error {
  constructor(response) {
    super(`HTTP error code ${response.status} (${response.statusText})`);
    this.response = response;
  }
}
