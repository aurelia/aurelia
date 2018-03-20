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
} from '../../fixture';
import { InjectorBuilder } from "../../../ioc/injector";
import { DependencyType } from '../../../ioc/types';
import { IContext } from '../../../ioc/interfaces';

describe('InjectorBuilder', () => {
  let sut: InjectorBuilder;

  it('should work with module configuration', () => {
    const type = DependencyType.wrap(App); // temporary verbose configuration
    const $module = {
      configure(ctx: IContext): void {
        ctx.register(type).toType(type);
      }
    };

    sut = InjectorBuilder.create($module);
    const injector = sut.build();

    const actual = injector.getInstance<App>(type);
    expect(actual instanceof App).toBe(true);
  });

  it('should work with registration', () => {
    const type = DependencyType.wrap(App); // temporary verbose configuration
    sut = InjectorBuilder.create();
    sut.register(type).toType(type);
    const injector = sut.build();

    const actual = injector.getInstance<App>(type);
    expect(actual instanceof App).toBe(true);
  });
});
