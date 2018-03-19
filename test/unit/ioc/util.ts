import {
  ValidationController,
  Validator,
  PropertyAccessorParser,
  ValidationMessageProvider,
  ValidationMessageParser,
  StandardValidator,
  ValidationRules
} from "aurelia-validation";
import { BindingEngine } from "aurelia-binding";
import { BrowserHistory, DefaultLinkHandler } from "aurelia-history-browser";
import { Container } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";
import { HttpClient } from "aurelia-fetch-client";
import { LookupFunctions, Parser, ObserverLocator, EventManager } from "aurelia-binding";
import * as Binding from "aurelia-binding";
import { Router, PipelineProvider, AppRouter } from "aurelia-router";
import { TaskQueue } from "aurelia-task-queue";
import { TemplatingBindingLanguage, SyntaxInterpreter, AttributeMap } from "aurelia-templating-binding";
import { ViewResources } from "aurelia-templating";
import {
  App,
  UserService,
  ArticleComponent,
  AuthComponent,
  EditorComponent,
  HomeComponent,
  ProfileArticleComponent,
  ProfileComponent,
  ProfileFavoritesComponent,
  SettingsComponent,
  ApiService,
  ArticleService,
  CommentService,
  JwtService,
  ProfileService,
  TagService,
  SharedState
} from "../../fixture";
import { PLATFORM } from "aurelia-pal";

export function verifyApp(x: App): void {
  verifyInstance(x, App);

  verifyUserService(x.userService);
}

export function verifyArticleComponent(x: ArticleComponent): void {
  verifyInstance(x, ArticleComponent);

  verifyArticleService(x.articleService);
  verifyCommentService(x.commentService);
  verifyUserService(x.userService);
  verifySharedState(x.sharedState);
  verifyProfileService(x.profileService);
  verifyRouter(x.router);
}

export function verifyAuthComponent(x: AuthComponent): void {
  verifyInstance(x, AuthComponent);

  verifyUserService(x.userService);
  verifySharedState(x.sharedState);
  verifyRouter(x.router);
  verifyValidationController(x.controller);
}

export function verifyEditorComponent(x: EditorComponent): void {
  verifyInstance(x, EditorComponent);

  verifyArticleService(x.articleService);
  verifyRouter(x.router);
}

export function verifyHomeComponent(x: HomeComponent): void {
  verifyInstance(x, HomeComponent);

  verifySharedState(x.sharedState);
  verifyBindingEngine(x.bindingEngine);
  verifyArticleService(x.articleService);
  verifyTagService(x.tagService);
}

export function verifyProfileArticleComponent(x: ProfileArticleComponent): void {
  verifyInstance(x, ProfileArticleComponent);

  verifyArticleService(x.articleService);
}

export function verifyProfileComponent(x: ProfileComponent): void {
  verifyInstance(x, ProfileComponent);

  verifySharedState(x.sharedState);
  verifyProfileService(x.profileService);
}

export function verifyProfileFavoritesComponent(x: ProfileFavoritesComponent): void {
  verifyInstance(x, ProfileFavoritesComponent);

  verifyArticleService(x.articleService);
}

export function verifySettingsComponent(x: SettingsComponent): void {
  verifyInstance(x, SettingsComponent);

  verifyUserService(x.userService);
  verifySharedState(x.sharedState);
  verifyRouter(x.router);
}

export function verifyApiService(x: ApiService): void {
  verifyInstance(x, ApiService);

  verifyHttpClient(x.http);
  verifyJwtService(x.jwtService);
}

export function verifyArticleService(x: ArticleService): void {
  verifyInstance(x, ArticleService);

  verifyApiService(x.apiService);
}

export function verifyCommentService(x: CommentService): void {
  verifyInstance(x, CommentService);

  verifyApiService(x.apiService);
}

export function verifyJwtService(x: JwtService): void {
  verifyInstance(x, JwtService);
}

export function verifyProfileService(x: ProfileService): void {
  verifyInstance(x, ProfileService);

  verifyApiService(x.apiService);
}

export function verifyTagService(x: TagService): void {
  verifyInstance(x, TagService);

  verifyApiService(x.apiService);
}

export function verifyUserService(x: UserService): void {
  verifyInstance(x, UserService);

  verifyApiService(x.apiService);
  verifyJwtService(x.jwtService);
  verifySharedState(x.sharedState);
}

export function verifyHttpClient(x: HttpClient): void {
  verifyInstance(x, HttpClient);
}

export function verifySharedState(x: SharedState): void {
  verifyInstance(x, SharedState);
}

export function verifyRouter(x: Router): void {
  verifyInstance(x, Router);

  verifyContainer(x.container);
  verifyBrowserHistory(x.history);
}

export function verifyAppRouter(x: AppRouter): void {
  verifyRouter(x);

  verifyPipelineProvider((x as any).pipelineProvider);
  verifyEventAggregator((x as any).events);
}

export function verifyContainer(x: Container): void {
  verifyInstance(x, Container);
}

export function verifyBrowserHistory(x: BrowserHistory): void {
  verifyInstance(x, BrowserHistory);

  verifyDefaultLinkHandler((x as any).linkHandler);
}

export function verifyDefaultLinkHandler(x: DefaultLinkHandler): void {
  verifyInstance(x, DefaultLinkHandler);
}

export function verifyValidationController(x: ValidationController): void {
  verifyInstance(x, ValidationController);

  verifyStandardValidator((x as any).validator);
  verifyPropertyAccessorParser((x as any).propertyParser);
}

export function verifyStandardValidator(x: StandardValidator): void {
  verifyInstance(x, StandardValidator);

  verifyValidationMessageProvider((x as any).messageProvider);
  verifyLookupFunctions((x as any).lookupFunctions);
}

export function verifyPropertyAccessorParser(x: PropertyAccessorParser): void {
  verifyInstance(x, PropertyAccessorParser);

  verifyParser((x as any).parser);
}

export function verifyValidationMessageProvider(x: ValidationMessageProvider): void {
  verifyInstance(x, ValidationMessageProvider);

  verifyValidationMessageParser((x as any).parser);
}

export function verifyValidationMessageParser(x: ValidationMessageParser): void {
  verifyInstance(x, ValidationMessageParser);

  verifyTemplatingBindingLanguage((x as any).bindinqLanguage);
}

export function verifyTemplatingBindingLanguage(x: TemplatingBindingLanguage): void {
  verifyInstance(x, TemplatingBindingLanguage);

  verifyParser((x as any).parser);
  verifyObserverLocator((x as any).observerLocator);
  verifySyntaxInterpreter((x as any).syntaxInterpreter);
  verifyAttributeMap((x as any).attributeMap);
}

export function verifyParser(x: Parser): void {
  verifyInstance(x, Parser);
}

export function verifyObserverLocator(x: ObserverLocator): void {
  verifyInstance(x, ObserverLocator);

  verifyTaskQueue((x as any).taskQueue);
  verifyEventManager((x as any).eventManager);
  verifyDirtyChecker((x as any).dirtyChecker);
  verifySVGAnalyzer((x as any).svgAnalyzer);
  verifyParser((x as any).parser);
}

export function verifySyntaxInterpreter(x: SyntaxInterpreter): void {
  verifyInstance(x, SyntaxInterpreter);

  verifyParser((x as any).parser);
  verifyObserverLocator((x as any).observerLocator);
  verifyEventManager((x as any).eventManager);
  verifyAttributeMap((x as any).attributeMap);
}

export function verifyAttributeMap(x: AttributeMap): void {
  verifyInstance(x, AttributeMap);

  verifySVGAnalyzer((x as any).svg);
}

export function verifyViewResources(x: ViewResources): void {
  verifyInstance(x, ViewResources);
}

export function verifyLookupFunctions(x: LookupFunctions): void {
  verifyInstance(x);
}

export function verifyTaskQueue(x: TaskQueue): void {
  verifyInstance(x, TaskQueue);
}

export function verifySVGAnalyzer(x: Binding.SVGAnalyzer): void {
  verifyInstance(x, (Binding as any).SVGAnalyzer);
}

export function verifyEventManager(x: EventManager): void {
  verifyInstance(x, EventManager);
}

export function verifyBindingEngine(x: BindingEngine): void {
  verifyInstance(x, BindingEngine);

  verifyObserverLocator((x as any).observerLocator);
  verifyParser((x as any).parser);
}

export function verifyPipelineProvider(x: PipelineProvider): void {
  verifyInstance(x, PipelineProvider);

  verifyContainer((x as any).container);
}

export function verifyEventAggregator(x: EventAggregator): void {
  verifyInstance(x, EventAggregator);
}

export function verifyDirtyChecker(x: any): void {
  verifyInstance(x, (Binding as any).DirtyChecker);
}

export function verifyInstance<T>(x: T, $class?: Function): void {
  expect(x).toBeDefined(`Expected ${$class && $class.name} to be defined`);
  if ($class !== undefined) {
    expect(x instanceof $class).toBe(true, `Expected ${x} to be instance of ${$class.name}`);
  }
}

export function registerTimes(n: number, container: Container) {
  let i = 0;
  const start = PLATFORM.performance.now();
  for (i = 0; i < n; i++) {
      container.autoRegister(`key${i}`, new Function());
  }
  const end = PLATFORM.performance.now();
  return end - start;
}

export function resolveTimes(n: number, container: Container) {
  let i = 0;
  const start = PLATFORM.performance.now();
  for (i = 0; i < n; i++) {
      container.get(`key${i}`);
  }
  const end = PLATFORM.performance.now();
  return end - start;
}
