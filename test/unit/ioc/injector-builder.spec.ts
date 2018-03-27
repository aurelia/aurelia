import {
  Validator,
  PropertyAccessorParser,
  ValidationMessageParser,
  StandardValidator,
  ValidationRules
} from 'aurelia-validation';
import { BrowserHistory, LinkHandler, DefaultLinkHandler } from 'aurelia-history-browser';
import { Container } from 'aurelia-dependency-injection';
import { EventAggregator } from 'aurelia-event-aggregator';
import { History } from 'aurelia-history';
import { Router, AppRouter } from 'aurelia-router';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding';
import { BindingLanguage } from 'aurelia-templating';
import {
  verifyApp,
  verifyArticleComponent,
  verifyAuthComponent,
  verifyEditorComponent,
  verifyHomeComponent,
  verifyProfileArticleComponent,
  verifyProfileComponent,
  verifyProfileFavoritesComponent,
  verifySettingsComponent,
  registerTimes,
  resolveTimes
} from './util';
import {
  App,
  ArticleComponent,
  AuthComponent,
  EditorComponent,
  HomeComponent,
  ProfileArticleComponent,
  ProfileComponent,
  ProfileFavoritesComponent,
  SettingsComponent,
  UserService
} from '../../fixture/ts';
import { InjectorBuilder, DefaultInjector } from '../../../ioc/injector';
import { DependencyType } from '../../../ioc/types';
import { IContext } from '../../../ioc/interfaces';
import * as ts from 'typescript';
import { raw } from '../../fixture/ts/raw';
import * as AST from '../../../ioc/analysis/ast';
import { TypeScriptSyntaxTransformer } from '../../../ioc/analysis/ts-syntax-transformer';

describe('InjectorBuilder', () => {
  let sut: InjectorBuilder;

  beforeEach(() => {
    sut = InjectorBuilder.create();
    sut.register(History).toType(BrowserHistory);
    sut.register(Router).toType(AppRouter);
    sut.register(LinkHandler).toType(DefaultLinkHandler);
    sut.register(BindingLanguage).toType(TemplatingBindingLanguage);
    sut.register(Validator).toType(StandardValidator);
    const injector = sut.build();
    ValidationRules.initialize(injector.getInstance(ValidationMessageParser), injector.getInstance(PropertyAccessorParser));
  });

  it('should properly resolve App', () => {
    const injector = sut.build();
    const actual = injector.getInstance(App) as App;
    verifyApp(actual);
  });

  it('should properly resolve ArticleComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(ArticleComponent) as ArticleComponent;
    verifyArticleComponent(actual);
  });

  it('should properly resolve AuthComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(AuthComponent) as AuthComponent;
    verifyAuthComponent(actual);
  });

  it('should properly resolve EditorComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(EditorComponent) as EditorComponent;
    verifyEditorComponent(actual);
  });

  it('should properly resolve HomeComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(HomeComponent) as HomeComponent;
    verifyHomeComponent(actual);
  });

  it('should properly resolve ProfileArticleComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(ProfileArticleComponent) as ProfileArticleComponent;
    verifyProfileArticleComponent(actual);
  });

  it('should properly resolve ProfileComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(ProfileComponent) as ProfileComponent;
    verifyProfileComponent(actual);
  });

  it('should properly resolve ProfileFavoritesComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(ProfileFavoritesComponent) as ProfileFavoritesComponent;
    verifyProfileFavoritesComponent(actual);
  });

  it('should properly resolve SettingsComponent', () => {
    const injector = sut.build();
    const actual = injector.getInstance(SettingsComponent) as SettingsComponent;
    verifySettingsComponent(actual);
  });

  it('should be able to resolve 100 keys in less than 150ms (cold)', () => {
    const injector = sut.build();
    const actual = resolveTimes(100, injector as DefaultInjector);
    expect(actual).toBeLessThan(150);
  });

  it('should be able to resolve 10k keys in less than 10ms (warm)', () => {
    const injector = sut.build();
    const actual = resolveTimes(10000, injector as DefaultInjector, true);
    expect(actual).toBeLessThan(10);
  });

  it('should be able to resolve 1k keys in less than 1ms (warm)', () => {
    const injector = sut.build();
    const actual = resolveTimes(1000, injector as DefaultInjector, true);
    expect(actual).toBeLessThan(1);
  });

  it('should work with registration', () => {
    sut = InjectorBuilder.create();
    sut.register(App).toSelf();
    const injector = sut.build();

    const actual = injector.getInstance(App);
    expect(actual instanceof App).toBe(true);
  });
});
