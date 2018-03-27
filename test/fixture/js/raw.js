export const raw = Object.create(null);

raw['js/app'] = `import {inject} from 'aurelia-dependency-injection';
import {UserService} from './shared/services/userservice';

@inject(UserService)
export class App {
  
  constructor(userService) {
    this.message = 'Hello World!'; // just for unit testing ;)
    this.userService = userService;
  }
  
  configureRouter(config, router) {
    config.title = 'Conduit';
    config.map([
      {route: ['', 'home'], moduleId: 'components/home/homecomponent', name: 'home', title: 'Home'},
      {route: ['login'], moduleId: 'components/auth/authcomponent', name: 'login', title: 'Sign in'},
      {route: ['register'], moduleId: 'components/auth/authcomponent', name:'register', title: 'Sign up'},
      {route: ['settings'], moduleId: 'components/settings/settingscomponent', name:'settings', title: 'Settings'},
      {route: [':name'], moduleId: 'components/profile/profilecomponent', name:'profile', title: 'Profile'},
      {route: ['editor/:slug?'], moduleId: 'components/editor/editorcomponent', name:'editor', title: 'Editor'},
      {route: ['article/:slug'], moduleId: 'components/article/articlecomponent', name:'article', title: 'article'}
    ]);
    
    this.router = router;
  }
  
  attached() {
    this.userService.populate();
  }
}
`
raw['js/environment'] = `export default {
  debug: true,
  testing: true
};
`
raw['js/main'] = `import environment from './environment';

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources')
    .feature('shared')
    .plugin('aurelia-validation');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
`
raw['js/components/article/articlecomponent'] = `import {inject, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ArticleService} from "../../shared/services/articleservice";
import {CommentService} from "../../shared/services/commentservice";
import {UserService} from "../../shared/services/userservice";
import {SharedState} from "../../shared/state/sharedstate";
import {ProfileService} from "../../shared/services/profileservice";

@inject(ArticleService, CommentService, UserService, SharedState, ProfileService, Router)
export class ArticleComponent {
  article;
  comments;
  myComment;
  
  constructor(as, cs, us, shst, ps, r) {
    this.articleService = as;
    this.commentService = cs;
    this.userService = us;
    this.sharedState = shst;
    this.profileService = ps;
    this.router = r;
  }
  
  activate(params, routeConfig) {
    this.routeConfig = routeConfig;
    this.slug = params.slug;


    return this.articleService.get(this.slug)
      .then(article => {
        this.article = article;
        this.commentService.getList(this.slug)
          .then(comments => this.comments = comments);
      });
  }
  
  onToggleFavorited() {
    this.article.favorited = !this.article.favorited;
    if (this.article.favorited) {
      this.article.favoritesCount++;
      this.articleService.favorite(this.slug);
    } else {
      this.article.favoritesCount--;
      this.articleService.unfavorite(this.slug);
    }
  }
  
  onToggleFollowing() {
    this.article.author.following = !this.article.author.following;
    if (this.article.author.following)
      this.profileService.follow(this.article.author.username);
    else
      this.profileService.unfollow(this.article.author.username);
  }
  
  postComment() {
    return this.commentService.add(this.slug, this.myComment)
      .then(comment => {
        this.comments.push(comment);
        this.myComment = '';
      })
  }

  @computedFrom('article.author.username')
  get canModify() {
    return this.article.author.username === this.sharedState.currentUser.username;
  }

  deleteArticle() {
    this.articleService.destroy(this.article.slug)
      .then(() => this.router.navigateToRoute('home'));
  }

  deleteComment(commentId) {
    this.commentService.destroy(commentId, this.slug)
      .then(() => {
        this.commentService.getList(this.slug)
          .then(comments => this.comments = comments);
      })
  }

}
`
raw['js/components/article/comment'] = `import {bindable, computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {SharedState} from "../../shared/state/sharedstate";

@inject(SharedState)
export class CommentCustomElement {
  @bindable comment;
  @bindable deleteCb;

  constructor(shSt) {
    this.sharedState = shSt;
  }

  @computedFrom('comment.author.username')
  get canModify() {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
`
raw['js/components/auth/authcomponent'] = `import {inject} from 'aurelia-dependency-injection';
import {Router, activationStrategy} from 'aurelia-router';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {UserService} from '../../shared/services/userservice';
import {SharedState} from '../../shared/state/sharedstate';

@inject(UserService, SharedState, Router, ValidationControllerFactory)
export class AuthComponent {
  type = '';
  username = '';
  email = '';
  password = '';
  errors = null;
  
  constructor(userService, sharedState, router, controllerFactory) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();
    
    ValidationRules
      .ensure('email').required().email()
      .ensure('password').required().minLength(8)
      .ensure('username').required().when((auth) => auth.type === 'register')
      .on(this);
  }
  
  determineActivationStrategy() {
    return activationStrategy.replace;
  }
  
  activate(params, routeConfig) {
    this.type = routeConfig.name;
  }
  
  get canSave() {
    if (this.type === 'login') {
      return this.email !== '' && this.password !== '';
    } else {
      return this.username !== '' && this.email !== '' && this.password !== '';
    }
  }
  
  submit() {
    this.errors = null;
    
    this.controller.validate()
      .then(result => {
        if (result.valid) {
          const credentials = {
            username: this.username,
            email: this.email,
            password: this.password
          };
          this.userService.attemptAuth(this.type, credentials)
            .then(data => this.router.navigateToRoute('home'))
            .catch(promise => {
              promise.then(err => this.errors = err.errors)
            });
        }
      })
  }
}
`
raw['js/components/editor/editorcomponent'] = `import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router'
import {ArticleService} from "../../shared/services/articleservice";

@inject(ArticleService, Router)
export class EditorComponent {
  article;
  @observable() tag;
  
  constructor(as, r) {
    this.articleService = as;
    this.router = r;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;
    this.slug = params.slug;

    if (this.slug) {
      return this.articleService.get(this.slug)
        .then(article => {
          this.article = article;
        });
    } else {
      this .article = {
        title: '',
        description: '',
        body: '',
        tagList: []
      };
    }
    return null;
}
  
  tagChanged(newValue, oldValue) {
    if (newValue !== undefined && newValue !== '')
      this.addTag(this.tag);
  }
  
  addTag(tag) {
    this.article.tagList.push(tag);
  }
  
  removeTag(tag) {
    this.article.tagList.splice(this.article.tagList.indexOf(tag), 1);
  }
  
  publishArticle() {
    this.articleService.save(this.article)
      .then((article) => {
        this.slug = article.slug;
        this.router.navigateToRoute('article', {slug: this.slug})
      })
  }
}
`
raw['js/components/home/homecomponent'] = `import {BindingEngine} from 'aurelia-framework';
import {inject} from 'aurelia-dependency-injection';
import {SharedState} from '../../shared/state/sharedstate';
import {ArticleService} from "../../shared/services/articleservice"
import {TagService} from '../../shared/services/tagservice';

@inject(SharedState, BindingEngine, ArticleService, TagService)
export class HomeComponent {
  articles = [];
  shownList = 'all';
  tags = [];
  filterTag = undefined;
  pageNumber;
  totalPages;
  currentPage = 1;
  limit = 10;
  
  constructor(sharedState, bindingEngine, articleService, tagService) {
    this.sharedState = sharedState;
    this.bindingEngine = bindingEngine;
    this.articleService = articleService;
    this.tagService = tagService;
  }
  
  bind() {
    this.subscription = this.bindingEngine.propertyObserver(this.sharedState, 'isAuthenticated')
      .subscribe((newValue, oldValue) => {
        console.log('homeComponent isAuthenticated: ', newValue)
      })
  }
  
  unbind() {
    this.subscription.dispose();
  }
  
  attached() {
    this.getArticles();
    this.getTags();
  }
  
  getArticles() {
    let params = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1)
    };
    if (this.filterTag !== undefined)
      params.tag = this.filterTag;
    this.articleService.getList(this.shownList, params)
      .then(response => {
        this.articles.splice(0);
        this.articles.push(...response.articles)
  
        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(new Array(Math.ceil(response.articlesCount / this.limit)), (val, index) => index + 1);
      })
  }
  
  getTags() {
    this.tagService.getList()
      .then(response => {
        this.tags.splice(0);
        this.tags.push(...response);
      })
  }
  
  setListTo(type, tag) {
    if (type === 'feed' && !this.sharedState.isAuthenticated) return;
    this.shownList = type;
    this.filterTag = tag;
    this.getArticles();
  }
  
  getFeedLinkClass() {
    let clazz = '';
    if (!this.sharedState.isAuthenticated)
      clazz += ' disabled';
    if (this.shownList === 'feed')
      clazz += ' active';
    return clazz;
  }
  
  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
`
raw['js/components/profile/profilearticlecomponent'] = `import {inject} from 'aurelia-dependency-injection';
import {ArticleService} from "../../shared/services/articleservice";

@inject(ArticleService)
export class ProfileArticleComponent {
  articles = [];
  pageNumber;
  totalPages;
  currentPage = 1;
  limit = 10;
  
  constructor(as) {
    this.articleService = as;
  }
  
  activate(params, routeConfig) {
    this.username = params.name;
    return this.getArticles();
  }
  
  getArticles() {
    let queryParams = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
      author: this.username
    };
    return this.articleService.getList('all', queryParams)
      .then(response => {
        this.articles.splice(0);
        this.articles.push(...response.articles)
  
        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(new Array(Math.ceil(response.articlesCount / this.limit)), (val, index) => index + 1);
      })
  }
  
  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
`
raw['js/components/profile/profilecomponent'] = `import {inject} from 'aurelia-dependency-injection';
import {computedFrom} from 'aurelia-framework';
import {SharedState} from '../../shared/state/sharedstate';
import {UserService} from "../../shared/services/userservice";
import {ProfileService} from "../../shared/services/profileservice";

@inject(SharedState, ProfileService)
export class ProfileComponent {
  
  constructor(sharedState, ps) {
    this.sharedState = sharedState;
    this.profileService = ps;
  }
  
  configureRouter(config, router) {
    config.map([
      {route: [''], moduleId: 'components/profile/profilearticlecomponent', name: 'profilearticle', title: 'Profile'},
      {route: ['favorites'], moduleId: 'components/profile/profilefavoritescomponent', name: 'profilefavorites', title: 'Profile'}
    ]);
    
    this.router = router;
  }
  
  activate(params, routeConfig) {
    this.username = params.name;
    return this.profileService.get(this.username)
      .then(profile => this.profile = profile)
  }
  
  @computedFrom('sharedState.currentUser.username')
  get isUser() {
    return this.profile.username === this.sharedState.currentUser.username;
  }
  
  onToggleFollowing() {
    this.profile.following = !this.profile.following;
    if (this.profile.following)
      this.profileService.follow(this.profile.username);
    else
      this.profileService.unfollow(this.profile.username);
  }
}
`
raw['js/components/profile/profilefavoritescomponent'] = `import {inject} from 'aurelia-dependency-injection';
import {ArticleService} from "../../shared/services/articleservice";

@inject(ArticleService)
export class ProfileFavoritesComponent {
  articles = [];
  pageNumber;
  totalPages;
  currentPage = 1;
  limit = 10;
  
  constructor(as) {
    this.articleService = as;
  }
  
  activate(params, routeConfig) {
    this.username = params.name;
    return this.getArticles();
  }
  
  getArticles() {
    let queryParams = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
      favorited: this.username
    };
    return this.articleService.getList('all', queryParams)
      .then(response => {
        this.articles.splice(0);
        this.articles.push(...response.articles)
        
        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(new Array(Math.ceil(response.articlesCount / this.limit)), (val, index) => index + 1);
      })
  }
  
  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
`
raw['js/components/settings/settingscomponent'] = `import {inject} from 'aurelia-dependency-injection';
import {Router} from 'aurelia-router';
import {UserService} from '../../shared/services/userservice';
import {SharedState} from '../../shared/state/sharedstate';

@inject(UserService, SharedState, Router)
export class SettingsComponent {
  
  constructor(userService, sharedState, router) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
  }
  
  update() {
    this.userService.update(this.sharedState.currentUser);
  }
  
  logout() {
    this.userService.purgeAuth();
    this.router.navigateToRoute('home');
  }
}
`
raw['js/resources/index'] = `export function configure(config) {
  config.globalResources(['./value-converters/date']);
}
`
raw['js/resources/elements/articlelist'] = `import {bindable} from 'aurelia-framework';

export class ArticleList {
  @bindable articles;
  @bindable pageNumber;
  @bindable totalPages;
  @bindable currentPage;
  @bindable setPageCb;
}

`
raw['js/resources/elements/articlepreview'] = `import {bindable} from 'aurelia-framework';

export class ArticlePreview {
  @bindable article;
  
}
`
raw['js/resources/value-converters/date'] = `import moment from 'moment';

export class DateValueConverter {
  /*
  * "2017-07-27T07:01:19.644Z"
  * into
  * "July 27, 2017"
  */
  toView(value) {
    return moment(value).format('MMMM D, YYYY')
  }
}

`
raw['js/resources/value-converters/formathtml'] = `export class FormatHtmlValueConverter {
  toView(value) {
    return value.replace(/(?:\r\n|\r|\n)/g, '<br />');
  }
}

`
raw['js/resources/value-converters/keys'] = `export class KeysValueConverter {
  
  toView(value) {
    if (value)
      return Reflect.ownKeys(value);
  }
  
}
`
raw['js/shared/index'] = `export function configure(config) {
  //config.globalResources([]);
}
`
raw['js/shared/layouts/footerlayout'] = `export class FooterLayout {}
`
raw['js/shared/layouts/headerlayout'] = `import {inject} from 'aurelia-dependency-injection';
import {bindable, bindingMode} from 'aurelia-framework';
import {SharedState} from '../state/sharedstate';

@inject(SharedState)
export class HeaderLayout {
  activeRoute = '';
  @bindable({defaultBindingMode: bindingMode.twoWay}) routerConfig;
  
  constructor(sharedState) {
    this.sharedState = sharedState;
  }
  
  routerConfigChanged(newValue, oldValue) {
    this.activeRoute = newValue.name;
  }
}
`
raw['js/shared/models/user'] = `export class User {
  
  constructor() {
    this.email = '';
    this.token = '';
    this.username = '';
    this.bio = '';
    this.image = '';
  }
  
}
`
raw['js/shared/services/apiservice'] = `import {config} from './config';
import {HttpClient, json} from 'aurelia-fetch-client';
import {inject} from 'aurelia-dependency-injection';
import * as qs from 'querystringify';
import {JwtService} from './jwtservice';
import {status, parseError} from './servicehelper';

@inject(HttpClient, JwtService)
export class ApiService {
  
  constructor(http, jwtService) {
    this.http = http;
    this.jwtService = jwtService;
  }
  
  setHeaders() {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  
    if (this.jwtService.getToken()) {
      headersConfig['Authorization'] = \`Token \${this.jwtService.getToken()}\`;
    }
    return new Headers(headersConfig);
  }
  
  get(path, params) {
    const options = {
      method: 'GET',
      headers: this.setHeaders()
    };
    return this.http.fetch(\`\${config.api_url}\${path}?\${qs.stringify(params)}\`,options)
      .then(status)
      .catch(parseError)
  }
  
  put(path, body = {}) {
    const options = {
      method: 'PUT',
      headers: this.setHeaders(),
      body: json(body)
    };
    return this.http.fetch(\`\${config.api_url}\${path}\`,options)
      .then(status)
      .catch(parseError)
  }
  
  post(path, body = {}) {
    const options = {
      method: 'POST',
      headers: this.setHeaders(),
      body: json(body)
    };
    return this.http.fetch(\`\${config.api_url}\${path}\`,options)
      .then(status)
      .catch(parseError)
  }
  
  delete(path) {
    const options = {
      method: 'DELETE',
      headers: this.setHeaders()
    };
    return this.http.fetch(\`\${config.api_url}\${path}\`,options)
      .then(status)
      .catch(parseError)
  }
}
`
raw['js/shared/services/articleservice'] = `import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './apiservice';

@inject(ApiService)
export class ArticleService {

  constructor(apiService) {
    this.apiService = apiService;
  }
  
  getList(type, params) {
    return this.apiService.get('/articles' + ((type === 'feed') ? '/feed' : ''), params)
  }
  
  get(slug) {
    return this.apiService.get('/articles/' + slug)
      .then(data => data.article)
  }
  
  destroy(slug) {
    return this.apiService.delete('/articles/' + slug)
  }
  
  save(article) {
    if (article.slug) {
      // If we're updating an existing article
      return this.apiService.put('/articles/' + article.slug, {article: article})
        .then(data => data.article)
    } else {
      // Otherwise, create a new article
      return this.apiService.post('/articles/', {article: article})
        .then(data => data.article)
    }
  }
  
  favorite(slug) {
    return this.apiService.post('/articles/' + slug + '/favorite')
  }
  
  unfavorite(slug) {
    return this.apiService.delete('/articles/' + slug + '/favorite')
  }
  
}
`
raw['js/shared/services/commentservice'] = `import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './apiservice';

@inject(ApiService)
export class CommentService {
  
  constructor(apiService) {
    this.apiService = apiService;
  }
  
  add(slug, payload) {
    return this.apiService.post(\`/articles/\${slug}/comments\`, {comment: {body: payload}})
      .then(data => data.comment)
  }
  
  getList(slug) {
    return this.apiService.get(\`/articles/\${slug}/comments\`)
      .then(data => data.comments)
  }
  
  destroy(commentId, articleSlug) {
    return this.apiService.delete(\`/articles/\${articleSlug}/comments/\${commentId}\`)
  }
}
`
raw['js/shared/services/config'] = `export const config = {
  api_url: 'https://conduit.productionready.io/api'
}
`
raw['js/shared/services/jwtservice'] = `export class JwtService {
  
  getToken() {
    return window.localStorage['jwtToken'];
  }
  
  saveToken(token) {
    window.localStorage['jwtToken'] = token;
  }
  
  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }
  
}
`
raw['js/shared/services/profileservice'] = `import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './apiservice';

@inject(ApiService)
export class ProfileService {

  constructor(apiService) {
    this.apiService = apiService;
  }
  
  get(username) {
    return this.apiService.get('/profiles/' + username)
      .then(data => data.profile)
  }
  
  follow(username) {
    return this.apiService.post('/profiles/' + username + '/follow')
  }
  
  unfollow(username) {
    return this.apiService.delete('/profiles/' + username + '/follow')
  }
}
`
raw['js/shared/services/servicehelper'] = `export function status(response) {
  if (response.status >= 200 && response.status < 400) {
    return response.json();
  }
  
  throw response;
}

export function parseError(error) {
  if (!(error instanceof Error))
    return new Promise((resolve, reject) => reject(error.json()))
}
`
raw['js/shared/services/tagservice'] = `import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './apiservice';

@inject(ApiService)
export class TagService {

  constructor(apiService) {
    this.apiService = apiService;
  }
  
  getList() {
    return this.apiService.get('/tags')
      .then(data => data.tags)
  }
}
`
raw['js/shared/services/userservice'] = `import {inject} from 'aurelia-dependency-injection';
import {ApiService} from './apiservice';
import {JwtService} from './jwtservice';
import {User} from '../models/user';
import {SharedState} from '../state/sharedstate';

@inject(ApiService, JwtService, SharedState)
export class UserService {
  
  constructor(apiService, jwtService, sharedState) {
    this.apiService = apiService;
    this.jwtService = jwtService;
    this.sharedState = sharedState;
  }
  
  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    if (this.jwtService.getToken()) {
      this.apiService.get('/user')
        .then(data => this.setAuth(data.user))
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }
  
  setAuth(user) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    this.sharedState.currentUser = user;
    this.sharedState.isAuthenticated = true;
  }
  
  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    this.sharedState.currentUser = new User();
    this.sharedState.isAuthenticated = false;
  }
  
  attemptAuth(type, credentials) {
    const route = (type === 'login') ? '/login' : '';
    return this.apiService.post('/users' + route, {user: credentials})
      .then(data => {
        this.setAuth(data.user);
        return data;
      });
  }
  
  update(user) {
    return this.apiService.put('/user', { user })
      .then(data => {
        this.sharedState.currentUser = data.user;
        return data.user;
      });
    
  }
}
`
raw['js/shared/state/sharedstate'] = `import {User} from '../models/user';

export class SharedState {
  
  constructor() {
    this.currentUser = new User();
    this.isAuthenticated = false;
  }
}
`
