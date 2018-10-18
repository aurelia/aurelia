import { IResourceDescriptions } from '../resource';
import { ITemplateDefinition, TemplateDefinition } from './instructions';
import { ViewCompileFlags } from './view-compile-flags';
export interface ITemplateCompiler {
    readonly name: string;
    compile(definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}
export declare const ITemplateCompiler: import("@aurelia/kernel/dist/di").InterfaceSymbol<ITemplateCompiler>;
//# sourceMappingURL=template-compiler.d.ts.map