import * as ts from 'typescript';
import { raw } from '../../fixture/ts/raw';
import * as AST from '../../../ioc/analysis/ast';
import { TypeScriptSyntaxTransformer } from '../../../ioc/analysis/ts-syntax-transformer';

describe('SyntaxTransformer', () => {
  let createSourceFileCount = 1; // Number.MAX_SAFE_INTEGER // restrict source files to process because it's cpu-intensive and clogs the console output
  let sourceFiles: ts.SourceFile[];
  let sut: TypeScriptSyntaxTransformer;

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
    sut = new TypeScriptSyntaxTransformer();
  });

  it('should transform to ioc AST', () => {
    const config = sut.create(...sourceFiles);

    console.log(AST.toJSON(config as any));
  });
});
