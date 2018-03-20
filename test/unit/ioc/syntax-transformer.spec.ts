import * as ts from 'typescript';
import { raw } from '../../fixture/raw';
import * as AST from '../../../ioc/analysis/ast';
import { TypeScriptSyntaxTransformer } from '../../../ioc/analysis/syntax-transformer';

describe('SyntaxTransformer', () => {
  let createSourceFileCount = 10; // Number.MAX_SAFE_INTEGER // restrict source files to process because it's cpu-intensive and clogs the console output
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

    // set parents to null so JSON.stringify won't run into infinite recursion
    for (const mod of config.modules) {
      for (const item of mod.items) {
        item.parent = null;
        switch (item.kind) {
          case AST.NodeKind.Class: {
            for (const mem of item.members) {
              mem.parent = null;
              if (mem.kind === AST.NodeKind.Method || mem.kind === AST.NodeKind.Constructor) {
                for (const param of mem.parameters) {
                  param.parent = null;
                }
              }
            }
            if (item.ctor) {
              item.ctor.parent = null;
              for (const param of item.ctor.parameters) {
                param.parent = null;
              }
            }
            break;
          }
          case AST.NodeKind.Function: {
            for (const param of item.parameters) {
              param.parent = null;
            }
            break;
          }
        }
      }
    }

    // checking the resulting json from console is a temporary quick-n-dirty test
    console.log(JSON.stringify(config));
  });
});
