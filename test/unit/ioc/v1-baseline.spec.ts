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
  SettingsComponent
} from '../../fixture';

/**
 * Baseline test
 */
describe('aurelia-dependency-injection version 1', () => {
  let sut: Container;

  beforeEach(() => {
    sut = new Container().makeGlobal();

    sut.registerAlias(BrowserHistory, History);
    sut.registerAlias(AppRouter, Router);
    sut.registerAlias(DefaultLinkHandler, LinkHandler);
    sut.registerAlias(TemplatingBindingLanguage, BindingLanguage);
    sut.registerAlias(StandardValidator, Validator);
    ValidationRules.initialize(sut.get(ValidationMessageParser), sut.get(PropertyAccessorParser));
  });

  it('should properly resolve App', () => {
    const actual = sut.get(App) as App;
    verifyApp(actual);
  });

  it('should properly resolve ArticleComponent', () => {
    const actual = sut.get(ArticleComponent) as ArticleComponent;
    verifyArticleComponent(actual);
  });

  it('should properly resolve AuthComponent', () => {
    const actual = sut.get(AuthComponent) as AuthComponent;
    verifyAuthComponent(actual);
  });

  it('should properly resolve EditorComponent', () => {
    const actual = sut.get(EditorComponent) as EditorComponent;
    verifyEditorComponent(actual);
  });

  it('should properly resolve HomeComponent', () => {
    const actual = sut.get(HomeComponent) as HomeComponent;
    verifyHomeComponent(actual);
  });

  it('should properly resolve ProfileArticleComponent', () => {
    const actual = sut.get(ProfileArticleComponent) as ProfileArticleComponent;
    verifyProfileArticleComponent(actual);
  });

  it('should properly resolve ProfileComponent', () => {
    const actual = sut.get(ProfileComponent) as ProfileComponent;
    verifyProfileComponent(actual);
  });

  it('should properly resolve ProfileFavoritesComponent', () => {
    const actual = sut.get(ProfileFavoritesComponent) as ProfileFavoritesComponent;
    verifyProfileFavoritesComponent(actual);
  });

  it('should properly resolve SettingsComponent', () => {
    const actual = sut.get(SettingsComponent) as SettingsComponent;
    verifySettingsComponent(actual);
  });

  it('should be able to register 1k keys in less than 20ms', () => {
    const actual = registerTimes(1000, sut);
    expect(actual).toBeLessThan(20);
  });

  it('should be able to resolve 1k keys in less than 20ms', () => {
    const actual = resolveTimes(1000, sut);
    expect(actual).toBeLessThan(20);
  });
});
