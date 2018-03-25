import { DependencyInjectionCodeGenerator } from "../../../ioc/analysis/code-generator";
import * as ts from 'typescript';
import { raw } from '../../fixture/raw';
import * as AST from '../../../ioc/analysis/ast';
import { StaticModuleConfiguration } from '../../../ioc/static-module-configuration';
import { TypeScriptSyntaxTransformer } from '../../../ioc/analysis/syntax-transformer';
import { InjectorBuilder } from "../../../ioc/injector";
import { Node } from "../../../ioc/graph";

describe('DependencyInjectionCodeGenerator', () => {
  let sut: DependencyInjectionCodeGenerator;
  let config: StaticModuleConfiguration;

  beforeEach(() => {
    sut = new DependencyInjectionCodeGenerator();
  });

  beforeAll(() => {
    let sourceFiles = [];
    for (const path in raw) {
      const sourceFile = ts.createSourceFile(path, raw[path], ts.ScriptTarget.ES2015);
      sourceFiles.push(sourceFile);
    }
    let transformer = new TypeScriptSyntaxTransformer();
    config = transformer.create(...sourceFiles);
  });

  it('should return correct configuration', () => {
    const actual = sut.create(config);

    expect(actual.fileMap.size).toBe(26); // 26 exported classes in the fixture
  });
});
