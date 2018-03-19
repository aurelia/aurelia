export const raw: { [path: string]: string } = Object.create(null);

raw['app'] = `import { autoinject } from "aurelia-dependency-injection";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { UserService } from "./shared/services/userservice";

@autoinject()
export class App {
  public message: string;
  public userService: UserService;

  public router: Router | undefined;

  constructor(userService: UserService) {
    this.message = "Hello World!"; // just for unit testing ;)
    this.userService = userService;
  }

  public configureRouter(config: RouterConfiguration, router: Router): void {
    config.title = "Conduit";
    config.map([
      {
        route: ["", "home"],
        moduleId: PLATFORM.moduleName("components/home/homecomponent"),
        name: "home",
        title: "Home"
      },
      {
        route: ["login"],
        moduleId: PLATFORM.moduleName("components/auth/authcomponent"),
        name: "login",
        title: "Sign in"
      },
      {
        route: ["register"],
        moduleId: PLATFORM.moduleName("components/auth/authcomponent"),
        name: "register",
        title: "Sign up"
      },
      {
        route: ["settings"],
        moduleId: PLATFORM.moduleName("components/settings/settingscomponent"),
        name: "settings",
        title: "Settings"
      },
      {
        route: [":name"],
        moduleId: PLATFORM.moduleName("components/profile/profilecomponent"),
        name: "profile",
        title: "Profile"
      },
      {
        route: ["editor/:slug?"],
        moduleId: PLATFORM.moduleName("components/editor/editorcomponent"),
        name: "editor",
        title: "Editor"
      },
      {
        route: ["article/:slug"],
        moduleId: PLATFORM.moduleName("components/article/articlecomponent"),
        name: "article",
        title: "article"
      }
    ]);

    this.router = router;
  }

  public attached(): void {
    this.userService.populate();
  }
}
`
raw['environment'] = `export default {
  debug: true,
  testing: true
};
`
raw['globals.d'] = `declare module "querystringify"
`
raw['index'] = `export * from "./shared/services/apiservice";
export * from "./app";
export * from "./components/article/articlecomponent";
export * from "./shared/services/articleservice";
export * from "./components/auth/authcomponent";
export * from "./shared/services/commentservice";
export * from "./components/editor/editorcomponent";
export * from "./components/home/homecomponent";
export * from "./shared/services/jwtservice";
export * from "./components/profile/profilearticlecomponent";
export * from "./components/profile/profilecomponent";
export * from "./components/profile/profilefavoritescomponent";
export * from "./shared/services/profileservice";
export * from "./components/settings/settingscomponent";
export * from "./shared/state/sharedstate";
export * from "./shared/services/tagservice";
export * from "aurelia-templating-binding";
export * from "./shared/services/userservice";
`
raw['main'] = `import { Aurelia } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import environment from "./environment";

Promise.config({ warnings: { wForgottenReturn: false } });

export function configure(au: Aurelia): void {
  au.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .plugin(PLATFORM.moduleName("aurelia-validation"));

  if (environment.debug) {
    au.use.developmentLogging();
  }

  if (environment.testing) {
    au.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  au.start().then(() => au.setRoot(PLATFORM.moduleName("app")));
}
`
raw['components/article/articlecomponent'] = `import { computedFrom } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig, Router } from "aurelia-router";
import { ArticleService } from "../../shared/services/articleservice";
import { CommentService } from "../../shared/services/commentservice";
import { ProfileService } from "../../shared/services/profileservice";
import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class ArticleComponent {
  public article: any;
  public comments: any[] = [];
  public myComment: any;

  public articleService: ArticleService;
  public commentService: CommentService;
  public userService: UserService;
  public sharedState: SharedState;
  public profileService: ProfileService;
  public router: Router;

  public routeConfig: RouteConfig | undefined;
  public slug: string = "";

  constructor(
    articleService: ArticleService,
    commentService: CommentService,
    userService: UserService,
    sharedState: SharedState,
    profileService: ProfileService,
    router: Router
  ) {
    this.articleService = articleService;
    this.commentService = commentService;
    this.userService = userService;
    this.sharedState = sharedState;
    this.profileService = profileService;
    this.router = router;
  }

  public activate(params: any, routeConfig: RouteConfig): Promise<void> {
    this.routeConfig = routeConfig;
    this.slug = params.slug;

    return this.articleService.get(this.slug).then(article => {
      this.article = article;
      this.commentService.getList(this.slug).then(comments => (this.comments = comments));
    });
  }

  public onToggleFavorited(): void {
    this.article.favorited = !this.article.favorited;
    if (this.article.favorited) {
      this.article.favoritesCount++;
      this.articleService.favorite(this.slug);
    } else {
      this.article.favoritesCount--;
      this.articleService.unfavorite(this.slug);
    }
  }

  public onToggleFollowing(): void {
    this.article.author.following = !this.article.author.following;
    if (this.article.author.following) {
      this.profileService.follow(this.article.author.username);
    } else {
      this.profileService.unfollow(this.article.author.username);
    }
  }

  public postComment(): Promise<void> {
    return this.commentService.add(this.slug, this.myComment).then(comment => {
      this.comments.push(comment);
      this.myComment = "";
    });
  }

  @computedFrom("article.author.username")
  public get canModify(): boolean {
    return this.article.author.username === this.sharedState.currentUser.username;
  }

  public deleteArticle(): void {
    this.articleService.destroy(this.article.slug).then(() => this.router.navigateToRoute("home"));
  }

  public deleteComment(commentId: string): void {
    this.commentService.destroy(commentId, this.slug).then(() => {
      this.commentService.getList(this.slug).then(comments => (this.comments = comments));
    });
  }
}
`
raw['components/article/comment'] = `import { computedFrom } from "aurelia-binding";
import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-templating";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class CommentCustomElement {
  @bindable()
  public comment: any;

  @bindable()
  public deleteCb: Function | undefined;

  public sharedState: SharedState;

  constructor(shSt: SharedState) {
    this.sharedState = shSt;
  }

  @computedFrom("comment.author.username")
  public get canModify(): boolean {
    return this.comment.author.username === this.sharedState.currentUser.username;
  }
}
`
raw['components/auth/authcomponent'] = `import { autoinject } from "aurelia-dependency-injection";
import { activationStrategy, RouteConfig, Router } from "aurelia-router";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class AuthComponent {
  // tslint:disable-next-line:no-reserved-keywords
  public type: string = "";
  public username: string = "";
  public email: string = "";
  public password: string = "";
  public errors: any[] = [];

  public userService: UserService;
  public sharedState: SharedState;
  public router: Router;
  public controller: ValidationController;

  constructor(
    userService: UserService,
    sharedState: SharedState,
    router: Router,
    controllerFactory: ValidationControllerFactory
  ) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();

    ValidationRules.ensure("email")
      .required()
      .email()
      .ensure("password")
      .required()
      .minLength(8)
      .ensure("username")
      .required()
      .when((auth: any) => auth.type === "register")
      .on(this);
  }

  public determineActivationStrategy(): string {
    return activationStrategy.replace;
  }

  public activate(_params: any, routeConfig: RouteConfig): void {
    this.type = routeConfig.name || "";
  }

  public get canSave(): boolean {
    if (this.type === "login") {
      return this.email !== "" && this.password !== "";
    } else {
      return this.username !== "" && this.email !== "" && this.password !== "";
    }
  }

  public submit(): void {
    this.errors = [];

    this.controller.validate().then(result => {
      if (result.valid) {
        const credentials = {
          username: this.username,
          email: this.email,
          password: this.password
        };
        this.userService
          .attemptAuth(this.type, credentials)
          .then(_data => this.router.navigateToRoute("home"))
          .catch(promise => {
            promise.then((err: any) => (this.errors = err.errors));
          });
      }
    });
  }
}
`
raw['components/editor/editorcomponent'] = `import { observable } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig, Router } from "aurelia-router";
import { ArticleService } from "../../shared/services/articleservice";

@autoinject()
export class EditorComponent {
  public article: any;

  @observable()
  public tag: string | undefined;

  public articleService: ArticleService;
  public router: Router;

  public routeConfig: RouteConfig | undefined;
  public slug: string | undefined;

  constructor(articleService: ArticleService, router: Router) {
    this.articleService = articleService;
    this.router = router;
  }

  public activate(params: any, routeConfig: RouteConfig): Promise<any> {
    this.routeConfig = routeConfig;
    this.slug = params.slug;

    if (this.slug) {
      return this.articleService.get(this.slug).then(article => {
        this.article = article;
      });
    } else {
      this.article = {
        title: "",
        description: "",
        body: "",
        tagList: []
      };
    }

    return Promise.resolve(null);
  }

  public tagChanged(newValue: string | undefined, _oldValue: string | undefined): void {
    if (newValue !== undefined && newValue !== "") {
      this.addTag(newValue);
    }
  }

  public addTag(tag: string): void {
    this.article.tagList.push(tag);
  }

  public removeTag(tag: string): void {
    this.article.tagList.splice(this.article.tagList.indexOf(tag), 1);
  }

  public publishArticle(): void {
    this.articleService.save(this.article).then(article => {
      this.slug = article.slug;
      this.router.navigateToRoute("article", { slug: this.slug });
    });
  }
}
`
raw['components/home/homecomponent'] = `import { Disposable } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { BindingEngine } from "aurelia-framework";
import { getLogger } from "aurelia-logging";
import { ArticleService } from "../../shared/services/articleservice";
import { TagService } from "../../shared/services/tagservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class HomeComponent {
  public articles: any[] = [];
  public shownList: string = "all";
  public tags: string[] = [];
  public filterTag: string | undefined;
  public pageNumber: number | undefined;
  public totalPages: number[] = [];
  public currentPage: number = 1;
  public limit: number = 10;

  public sharedState: SharedState;
  public bindingEngine: BindingEngine;
  public articleService: ArticleService;
  public tagService: TagService;

  public subscription: Disposable = null as any;

  constructor(
    sharedState: SharedState,
    bindingEngine: BindingEngine,
    articleService: ArticleService,
    tagService: TagService
  ) {
    this.sharedState = sharedState;
    this.bindingEngine = bindingEngine;
    this.articleService = articleService;
    this.tagService = tagService;
  }

  public bind(): void {
    this.subscription = this.bindingEngine
      .propertyObserver(this.sharedState, "isAuthenticated")
      .subscribe((newValue, _oldValue) => {
        getLogger("HomeComponent").info("homeComponent isAuthenticated: ", newValue);
      });
  }

  public unbind(): void {
    this.subscription.dispose();
  }

  public attached(): void {
    this.getArticles();
    this.getTags();
  }

  public getArticles(): void {
    const params: any = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1)
    };
    if (this.filterTag !== undefined) {
      params.tag = this.filterTag;
    }
    this.articleService.getList(this.shownList, params).then(response => {
      this.articles.splice(0);
      this.articles.push(...response.articles);

      // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
      this.totalPages = Array.from([Math.ceil(response.articlesCount / this.limit)], (_val, index) => index + 1);
    });
  }

  public getTags(): void {
    this.tagService.getList().then(response => {
      this.tags.splice(0);
      this.tags.push(...response);
    });
  }

  // tslint:disable-next-line:no-reserved-keywords
  public setListTo(type: string, tag: string): void {
    if (type === "feed" && !this.sharedState.isAuthenticated) {
      return;
    }
    this.shownList = type;
    this.filterTag = tag;
    this.getArticles();
  }

  public getFeedLinkClass(): string {
    let clazz = "";
    if (!this.sharedState.isAuthenticated) {
      clazz += " disabled";
    }
    if (this.shownList === "feed") {
      clazz += " active";
    }

    return clazz;
  }

  public setPageTo(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
`
raw['components/profile/profilearticlecomponent'] = `import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig } from "aurelia-router";
import { ArticleService } from "../../shared/services/articleservice";

@autoinject()
export class ProfileArticleComponent {
  public articles: any[] = [];
  public pageNumber: number | undefined;
  public totalPages: number[] = [];
  public currentPage: number = 1;
  public limit: number = 10;

  public articleService: ArticleService;

  public username: string | undefined;

  constructor(articleService: ArticleService) {
    this.articleService = articleService;
  }

  public activate(params: any, _routeConfig: RouteConfig): Promise<void> {
    this.username = params.name;

    return this.getArticles();
  }

  public getArticles(): Promise<void> {
    const queryParams = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
      author: this.username
    };

    return this.articleService.getList("all", queryParams).then(response => {
      this.articles.splice(0);
      this.articles.push(...response.articles);

      // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
      this.totalPages = Array.from([Math.ceil(response.articlesCount / this.limit)], (_val, index) => index + 1);
    });
  }

  public setPageTo(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
`
raw['components/profile/profilecomponent'] = `import { computedFrom } from "aurelia-binding";
import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { ProfileService } from "../../shared/services/profileservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class ProfileComponent {
  public sharedState: SharedState;
  public profileService: ProfileService;

  public router: Router | undefined;
  public username: string = "";
  public profile: any;

  constructor(sharedState: SharedState, profileService: ProfileService) {
    this.sharedState = sharedState;
    this.profileService = profileService;
  }

  public configureRouter(config: RouterConfiguration, router: Router): void {
    config.map([
      { route: [""], moduleId: "components/profile/profilearticlecomponent", name: "profilearticle", title: "Profile" },
      {
        route: ["favorites"],
        moduleId: "components/profile/profilefavoritescomponent",
        name: "profilefavorites",
        title: "Profile"
      }
    ]);

    this.router = router;
  }

  public activate(params: any, _routeConfig: RouteConfig): Promise<void> {
    this.username = params.name;

    return this.profileService.get(this.username).then(profile => (this.profile = profile));
  }

  @computedFrom("sharedState.currentUser.username")
  public get isUser(): boolean {
    return this.profile.username === this.sharedState.currentUser.username;
  }

  public onToggleFollowing(): void {
    this.profile.following = !this.profile.following;
    if (this.profile.following) {
      this.profileService.follow(this.profile.username);
    } else {
      this.profileService.unfollow(this.profile.username);
    }
  }
}
`
raw['components/profile/profilefavoritescomponent'] = `import { autoinject } from "aurelia-dependency-injection";
import { RouteConfig } from "aurelia-router";
import { ArticleService } from "../../shared/services/articleservice";

@autoinject()
export class ProfileFavoritesComponent {
  public articles: any[] = [];
  public pageNumber: number | undefined;
  public totalPages: number[] = [];
  public currentPage: number = 1;
  public limit: number = 10;

  public articleService: ArticleService;

  public username: string | undefined;

  constructor(articleService: ArticleService) {
    this.articleService = articleService;
  }

  public activate(params: any, _routeConfig: RouteConfig): Promise<void> {
    this.username = params.name;

    return this.getArticles();
  }

  public getArticles(): Promise<void> {
    const queryParams = {
      limit: this.limit,
      offset: this.limit * (this.currentPage - 1),
      favorited: this.username
    };

    return this.articleService.getList("all", queryParams).then(response => {
      this.articles.splice(0);
      this.articles.push(...response.articles);

      // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
      this.totalPages = Array.from([Math.ceil(response.articlesCount / this.limit)], (_val, index) => index + 1);
    });
  }

  public setPageTo(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
`
raw['components/settings/settingscomponent'] = `import { autoinject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { UserService } from "../../shared/services/userservice";
import { SharedState } from "../../shared/state/sharedstate";

@autoinject()
export class SettingsComponent {
  public userService: UserService;
  public sharedState: SharedState;
  public router: Router;

  constructor(userService: UserService, sharedState: SharedState, router: Router) {
    this.userService = userService;
    this.sharedState = sharedState;
    this.router = router;
  }

  public update(): void {
    this.userService.update(this.sharedState.currentUser);
  }

  public logout(): void {
    this.userService.purgeAuth();
    this.router.navigateToRoute("home");
  }
}
`
raw['resources/index'] = `import { FrameworkConfiguration } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([PLATFORM.moduleName("./value-converters/date")]);
}
`
raw['resources/elements/articlelist'] = `import { bindable } from "aurelia-framework";

export class ArticleList {
  @bindable()
  public articles: any[] | undefined;

  @bindable()
  public pageNumber: number | undefined;

  @bindable()
  public totalPages: number | undefined;

  @bindable()
  public currentPage: number | undefined;

  @bindable()
  public setPageCb: Function | undefined;
}
`
raw['resources/elements/articlepreview'] = `import { bindable } from "aurelia-framework";

export class ArticlePreview {
  @bindable()
  public article: any;
}
`
raw['resources/value-converters/date'] = `import moment from "moment";

export class DateValueConverter {
  /*
  * "2017-07-27T07:01:19.644Z"
  * into
  * "July 27, 2017"
  */
  public toView(value: string): string {
    return moment(value).format("MMMM D, YYYY");
  }
}
`
raw['resources/value-converters/formathtml'] = `export class FormatHtmlValueConverter {
  public toView(value: string): string {
    return value.replace(/(?:\r\n|\r|\n)/g, "<br />");
  }
}
`
raw['resources/value-converters/keys'] = `export class KeysValueConverter {
  public toView(value: Object): PropertyKey[] {
    if (value) {
      return Reflect.ownKeys(value);
    }

    return [];
  }
}
`
raw['shared/layouts/footerlayout'] = `export class FooterLayout {}
`
raw['shared/layouts/headerlayout'] = `import { autoinject } from "aurelia-dependency-injection";
import { bindable, bindingMode } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { SharedState } from "../state/sharedstate";

@autoinject()
export class HeaderLayout {
  public activeRoute: string = "";

  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public routerConfig: RouteConfig | undefined;

  public sharedState: SharedState;

  constructor(sharedState: SharedState) {
    this.sharedState = sharedState;
  }

  public routerConfigChanged(newValue: RouteConfig | undefined, _oldValue: RouteConfig | undefined): void {
    this.activeRoute = newValue && newValue.name ? newValue.name : "";
  }
}
`
raw['shared/models/user'] = `export class User {
  public email: string;
  public token: string;
  public username: string;
  public bio: string;
  public image: string;

  constructor() {
    this.email = "";
    this.token = "";
    this.username = "";
    this.bio = "";
    this.image = "";
  }
}
`
raw['shared/services/apiservice'] = `import { autoinject } from "aurelia-dependency-injection";
import { HttpClient, json } from "aurelia-fetch-client";
import * as qs from "querystringify";
import { config } from "./config";
import { JwtService } from "./jwtservice";
import { parseError, status } from "./servicehelper";

@autoinject()
export class ApiService {
  public http: HttpClient;
  public jwtService: JwtService;

  constructor(http: HttpClient, jwtService: JwtService) {
    this.http = http;
    this.jwtService = jwtService;
  }

  public setHeaders(): Headers {
    const headersConfig: any = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    if (this.jwtService.getToken()) {
      headersConfig.Authorization = \`Token \${this.jwtService.getToken()}\`;
    }

    return new Headers(headersConfig);
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get<T extends Object>(path: string, params?: any): Promise<T> {
    const options = {
      method: "GET",
      headers: this.setHeaders()
    };

    return this.http
      .fetch(\`\${config.api_url}\${path}?\${qs.stringify(params)}\`, options)
      .then(status)
      .catch(parseError);
  }

  public put<T extends Object>(path: string, body: T = {} as any): Promise<T> {
    const options = {
      method: "PUT",
      headers: this.setHeaders(),
      body: json(body)
    };

    return this.http
      .fetch(\`\${config.api_url}\${path}\`, options)
      .then(status)
      .catch(parseError);
  }

  public post<T extends Object>(path: string, body: T = {} as any): Promise<T> {
    const options = {
      method: "POST",
      headers: this.setHeaders(),
      body: json(body)
    };

    return this.http
      .fetch(\`\${config.api_url}\${path}\`, options)
      .then(status)
      .catch(parseError);
  }

  // tslint:disable-next-line:no-reserved-keywords
  public delete(path: string): Promise<any> {
    const options = {
      method: "DELETE",
      headers: this.setHeaders()
    };

    return this.http
      .fetch(\`\${config.api_url}\${path}\`, options)
      .then(status)
      .catch(parseError);
  }
}
`
raw['shared/services/articleservice'] = `import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class ArticleService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  // tslint:disable-next-line:no-reserved-keywords
  public getList(type: string, params?: any): Promise<any> {
    return this.apiService.get(\`/articles\${(type === "feed" ? "/feed" : "")}\`, params);
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get(slug: string): Promise<any> {
    return this.apiService.get<any>(\`/articles/\${slug}\`).then(data => data.article);
  }

  public destroy(slug: string): Promise<any> {
    return this.apiService.delete(\`/articles/\${slug}\`);
  }

  public save(article: any): Promise<any> {
    if (article.slug) {
      // If we're updating an existing article
      return this.apiService.put(\`/articles/\${article.slug}\`, { article: article }).then(data => data.article);
    } else {
      // Otherwise, create a new article
      return this.apiService.post("/articles/", { article: article }).then(data => data.article);
    }
  }

  public favorite(slug: string): Promise<any> {
    return this.apiService.post(\`/articles/\${slug}/favorite\`);
  }

  public unfavorite(slug: string): Promise<any> {
    return this.apiService.delete(\`/articles/\${slug}/favorite\`);
  }
}
`
raw['shared/services/commentservice'] = `import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class CommentService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  public add(slug: string, payload: any): Promise<any> {
    return this.apiService
      .post(\`/articles/\${slug}/comments\`, { comment: { body: payload } })
      .then(data => data.comment);
  }

  public getList(slug: string): Promise<any> {
    return this.apiService.get<any>(\`/articles/\${slug}/comments\`).then(data => data.comments);
  }

  public destroy(commentId: string, articleSlug: string): Promise<any> {
    return this.apiService.delete(\`/articles/\${articleSlug}/comments/\${commentId}\`);
  }
}
`
raw['shared/services/config'] = `export const config = {
  api_url: "https://conduit.productionready.io/api"
};
`
raw['shared/services/profileservice'] = `import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class ProfileService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  // tslint:disable-next-line:no-reserved-keywords
  public get(username: string): Promise<any> {
    return this.apiService.get<any>(\`/profiles/\${username}\`).then(data => data.profile);
  }

  public follow(username: string): Promise<any> {
    return this.apiService.post(\`/profiles/\${username}/follow\`);
  }

  public unfollow(username: string): Promise<any> {
    return this.apiService.delete(\`/profiles/\${username}/follow\`);
  }
}
`
raw['shared/services/jwtservice'] = `export class JwtService {
  public getToken(): string {
    return window.localStorage.jwtToken;
  }

  public saveToken(token: string): void {
    window.localStorage.jwtToken = token;
  }

  public destroyToken(): void {
    window.localStorage.removeItem("jwtToken");
  }
}
`
raw['shared/services/servicehelper'] = `export function status<T>(response: Response): T {
  if (response.status >= 200 && response.status < 400) {
    return response.json() as any;
  }

  throw response;
}

export function parseError(error: any): any {
  if (!(error instanceof Error)) {
    return new Promise<any>((_resolve, reject) => reject(error.json()));
  }

  return error;
}
`
raw['shared/services/tagservice'] = `import { autoinject } from "aurelia-dependency-injection";
import { ApiService } from "./apiservice";

@autoinject()
export class TagService {
  public apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  public getList(): Promise<any> {
    return this.apiService.get<any>("/tags").then(data => data.tags);
  }
}
`
raw['shared/services/userservice'] = `import { autoinject } from "aurelia-dependency-injection";
import { User } from "../models/user";
import { SharedState } from "../state/sharedstate";
import { ApiService } from "./apiservice";
import { JwtService } from "./jwtservice";

@autoinject()
export class UserService {
  public apiService: ApiService;
  public jwtService: JwtService;
  public sharedState: SharedState;

  constructor(apiService: ApiService, jwtService: JwtService, sharedState: SharedState) {
    this.apiService = apiService;
    this.jwtService = jwtService;
    this.sharedState = sharedState;
  }

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  public populate(): void {
    if (this.jwtService.getToken()) {
      this.apiService.get<any>("/user").then(data => this.setAuth(data.user));
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  public setAuth(user: User): void {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    this.sharedState.currentUser = user;
    this.sharedState.isAuthenticated = true;
  }

  public purgeAuth(): void {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    this.sharedState.currentUser = new User();
    this.sharedState.isAuthenticated = false;
  }

  // tslint:disable-next-line:no-reserved-keywords
  public attemptAuth(type: string, credentials: any): Promise<any> {
    const route = type === "login" ? "/login" : "";

    return this.apiService.post(\`/users\${route}\`, { user: credentials }).then(data => {
      this.setAuth(data.user);

      return data;
    });
  }

  public update(user: User): Promise<any> {
    return this.apiService.put("/user", { user }).then(data => {
      this.sharedState.currentUser = data.user;

      return data.user;
    });
  }
}
`
raw['shared/state/sharedstate'] = `import { User } from "../models/user";

export class SharedState {
  public currentUser: User;
  public isAuthenticated: boolean;

  constructor() {
    this.currentUser = new User();
    this.isAuthenticated = false;
  }
}
`
