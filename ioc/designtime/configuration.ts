import * as AST from './ast';
import * as ts from 'typescript';
import { IModuleConfiguration, IContext } from '../runtime/interfaces';

export class StaticDIConfiguration {
  public fileMap: Map<AST.IModule, ts.SourceFile> = new Map();
}

export class StaticModuleConfiguration implements IModuleConfiguration, AST.IModuleCollection {
  public isAnalysisASTNode: false = false;
  public modules: AST.IModule[];
  public rootDir: string;

  constructor(...modules: AST.IModule[]) {
    this.modules = modules;
  }

  public configure(ctx: IContext): void {
    for (const mod of this.modules) {
      for (const item of mod.items) {
        if (item.kind === AST.NodeKind.Class) {
          ctx.register(item);
        }
      }
    }
  }
}
