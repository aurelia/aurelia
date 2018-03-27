import * as ts from 'typescript';
import { raw } from '../../fixture/ts/raw';
import * as AST from '../../../ioc/analysis/ast';
import { SyntaxTransformer } from '../../../ioc/analysis/syntax-transformer';

describe('SyntaxTransformer', () => {
  let createSourceFileCount = 1; // Number.MAX_SAFE_INTEGER // restrict source files to process because it's cpu-intensive and clogs the console output
  let sourceFiles: ts.SourceFile[];
  let sut: SyntaxTransformer;

  beforeAll(() => {
    sourceFiles = [];
    for (const path in raw) {
      if (createSourceFileCount === 0) {
        break;
      }
      createSourceFileCount--;
      const sourceFile = ts.createSourceFile(path, raw[path], ts.ScriptTarget.ES2015);
      sourceFiles.push(sourceFile);
    }
    sut = new SyntaxTransformer();
  });

  it('should transform typescript sources to ioc AST', () => {
    const config = sut.create(...sourceFiles);

    console.log(AST.toJSON(config as any));
  });
});
