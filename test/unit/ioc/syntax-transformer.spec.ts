import * as ts from 'typescript';
import { raw as rawTs } from '../../fixture/ts/raw';
import { raw as rawJs } from '../../fixture/js/raw';
import * as AST from '../../../ioc/analysis/ast';
import { SyntaxTransformer } from '../../../ioc/analysis/syntax-transformer';

describe('SyntaxTransformer', () => {
  let createTsSourceFileCount = Number.MAX_SAFE_INTEGER; // Number.MAX_SAFE_INTEGER // restrict source files to process because it's cpu-intensive and clogs the console output
  let createJsSourceFileCount = Number.MAX_SAFE_INTEGER;
  let tsSourceFiles: ts.SourceFile[];
  let jsSourceFiles: ts.SourceFile[];
  let sut: SyntaxTransformer;

  beforeAll(() => {
    tsSourceFiles = [];
    for (const path in rawTs) {
      if (createTsSourceFileCount === 0) {
        break;
      }
      createTsSourceFileCount--;
      const sourceFile = ts.createSourceFile(path, rawTs[path], ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
      tsSourceFiles.push(sourceFile);
    }
    jsSourceFiles = [];
    for (const path in rawJs) {
      if (createJsSourceFileCount === 0) {
        break;
      }
      createJsSourceFileCount--;
      const sourceFile = ts.createSourceFile(path, rawJs[path], ts.ScriptTarget.ES2015, true, ts.ScriptKind.JS);
      jsSourceFiles.push(sourceFile);
    }
    sut = new SyntaxTransformer();
  });

  it('should transform typescript sources to ioc AST', () => {
    const config = sut.create(...tsSourceFiles);
  });

  it('should transform javascript sources to ioc AST', () => {
    const config = sut.create(...jsSourceFiles);
  });
});
