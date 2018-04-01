import { raw } from '../../fixture/ts/raw';
import * as ts from 'typescript';
import * as AST from '../../../ioc/designtime/ast';
import { SyntaxTransformer } from '../../../ioc/designtime/syntax-transformer';
import { InjectorBuilder } from '../../../ioc/runtime/injector';
import { StaticModuleConfiguration } from '../../../ioc/designtime/configuration';
import { IInjector } from '../../../ioc/runtime/interfaces';
import { SyntaxEmitResult } from '../../../ioc/designtime/activators';
import { DefaultDesigntimeRequirementRegistrationFunction } from '../../../ioc/designtime/registration';

describe('StaticModuleConfiguration', () => {
  let sourceFiles: ts.SourceFile[];
  let transformer: SyntaxTransformer;
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
    transformer = new SyntaxTransformer();
    sut = transformer.create(...sourceFiles);
    injectorBuilder = InjectorBuilder.create(sut);
    injector = injectorBuilder.build(new DefaultDesigntimeRequirementRegistrationFunction());
    items = sut.modules.map(m => m.items).reduce((prev, cur) => prev.concat(cur));
  });

  function getClassNode(name: string): AST.IClass {
    return items.find(i => i.kind === AST.NodeKind.Class && i.name === name) as any;
  }

  it('should produce the correct result for App', () => {
    const node = getClassNode('App');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(1);
  });

  it('should produce the correct result for ArticleComponent', () => {
    const node = getClassNode('ArticleComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(6);
  });

  it('should produce the correct result for AuthComponent', () => {
    const node = getClassNode('AuthComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(4);
  });

  it('should produce the correct result for EditorComponent', () => {
    const node = getClassNode('EditorComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(2);
  });

  it('should produce the correct result for HomeComponent', () => {
    const node = getClassNode('HomeComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(4);
  });

  it('should produce the correct result for ProfileArticleComponent', () => {
    const node = getClassNode('ProfileArticleComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(1);
  });

  it('should produce the correct result for ProfileComponent', () => {
    const node = getClassNode('ProfileComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(2);
  });

  it('should produce the correct result for ProfileFavoritesComponent', () => {
    const node = getClassNode('ProfileFavoritesComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(1);
  });

  it('should produce the correct result for SettingsComponent', () => {
    const node = getClassNode('SettingsComponent');

    const actual = injector.getInstance<SyntaxEmitResult>(node);

    expect(actual.node).toEqual(node);
    expect(actual.dependencies.length).toBe(3);
  });
});
