import { ITemplateDefinition, TemplateDefinition } from '../definitions';
import { IResourceDescriptions } from '../resource';
export interface ITemplateCompiler {
    readonly name: string;
    compile(definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}
export declare const ITemplateCompiler: import("@aurelia/kernel/dist/di").InterfaceSymbol<ITemplateCompiler>;
export declare enum ViewCompileFlags {
    none = 1,
    surrogate = 2,
    shadowDOM = 4
}
//# sourceMappingURL=template-compiler.d.ts.map