import * as ts from 'typescript';
import { raw } from '../../fixture/raw';
import * as AST from '../../../ioc/analysis/ast';
import { TypeScriptSyntaxTransformer } from '../../../ioc/analysis/syntax-transformer';
import { StaticModuleConfiguration } from '../../../ioc/static-module-configuration';
import { InjectorBuilder } from '../../../ioc/injector';
import { IInjector } from '../../../ioc/interfaces';
import { EmitResult } from '../../../ioc/activators';

describe('StaticModuleConfiguration', () => {
  let sourceFiles: ts.SourceFile[];
  let transformer: TypeScriptSyntaxTransformer;
  let injectorBuilder: InjectorBuilder;
  let sut: StaticModuleConfiguration;
  let injector: IInjector;
  let items: AST.IModuleItem[];

  beforeAll(() => {
    sourceFiles = [];
    for (const path in raw) {
      const sourceFile = ts.createSourceFile(path, raw[path], ts.ScriptTarget.ES2015);
      sourceFiles.push(sourceFile);
    }
    transformer = new TypeScriptSyntaxTransformer();
    sut = transformer.create(...sourceFiles);
    injectorBuilder = InjectorBuilder.create(sut);
    injector = injectorBuilder.build();
    items = sut.modules.map(m => m.items).reduce((prev, cur) => prev.concat(cur));
  });

  it('should produce a valid constructor call for App', () => {
    const node = items.find(i => i.name === 'App');

    const expected = 'new App(new UserService(new SharedState()))';
    const actual = injector.getInstance<EmitResult>(node).text;;

    expect(actual).toEqual(expected);
  });

  // it('should produce a valid constructor call for ArticleComponent', () => {
  //   const node = items.find(i => i.name === 'ArticleComponent');

  //   const expected = 'new App(new UserService(new SharedState()))';
  //   const actual = injector.getInstance<EmitResult>(node).text;;

  //   expect(actual).toEqual(expected);
  // });

  // it('should produce a valid constructor call for AuthComponent', () => {
  //   const node = items.find(i => i.name === 'AuthComponent');

  //   const expected = 'new App(new UserService(new SharedState()))';
  //   const actual = injector.getInstance<EmitResult>(node).text;;

  //   expect(actual).toEqual(expected);
  // });

  // it('should produce a valid constructor call for EditorComponent', () => {
  //   const node = items.find(i => i.name === 'EditorComponent');

  //   const expected = 'new App(new UserService(new SharedState()))';
  //   const actual = injector.getInstance<EmitResult>(node).text;;

  //   expect(actual).toEqual(expected);
  // });

  it('should produce a valid constructor call for HomeComponent', () => {
    const node = items.find(i => i.name === 'HomeComponent');

    const expected = 'new HomeComponent(new TagService(new ApiService(new JwtService())))';
    const actual = injector.getInstance<EmitResult>(node).text;;

    expect(actual).toEqual(expected);
  });

  it('should produce a valid constructor call for ProfileArticleComponent', () => {
    const node = items.find(i => i.name === 'ProfileArticleComponent');

    const expected = 'new ProfileArticleComponent(new ArticleService(new ApiService(new JwtService())))';
    const actual = injector.getInstance<EmitResult>(node).text;;

    expect(actual).toEqual(expected);
  });

  it('should produce a valid constructor call for ProfileComponent', () => {
    const node = items.find(i => i.name === 'ProfileComponent');

    const expected = 'new ProfileComponent(new ProfileService(new ApiService(new JwtService())))';
    const actual = injector.getInstance<EmitResult>(node).text;;

    expect(actual).toEqual(expected);
  });

  it('should produce a valid constructor call for ProfileFavoritesComponent', () => {
    const node = items.find(i => i.name === 'ProfileFavoritesComponent');

    const expected = 'new ProfileFavoritesComponent(new ArticleService(new ApiService(new JwtService())))';
    const actual = injector.getInstance<EmitResult>(node).text;;

    expect(actual).toEqual(expected);
  });

  // it('should produce a valid constructor call for SettingsComponent', () => {
  //   const node = items.find(i => i.name === 'SettingsComponent');

  //   const expected = 'new App(new UserService(new SharedState()))';
  //   const actual = injector.getInstance<EmitResult>(node).text;

  //   expect(actual).toEqual(expected);
  // });
});
