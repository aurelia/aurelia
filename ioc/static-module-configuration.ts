import { IModuleConfiguration, IContext } from "./interfaces";
import * as AST from "./analysis/ast";


export class StaticModuleConfiguration implements IModuleConfiguration {
  public modules: AST.IModule[];

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
