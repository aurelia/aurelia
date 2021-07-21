import { ITemplateCompiler } from './renderer.js';
import { BindableDefinition } from './bindable.js';
import { CustomElementDefinition } from './resources/custom-element.js';
import type { IContainer, IResolver, Constructable } from '@aurelia/kernel';
import type { CustomAttributeDefinition } from './resources/custom-attribute.js';
import type { PartialCustomElementDefinition } from './resources/custom-element.js';
import type { ICompliationInstruction } from './renderer.js';
export declare class TemplateCompiler implements ITemplateCompiler {
    static register(container: IContainer): IResolver<ITemplateCompiler>;
    debug: boolean;
    resolveResources: boolean;
    compile(partialDefinition: PartialCustomElementDefinition, container: IContainer, compilationInstruction: ICompliationInstruction | null): CustomElementDefinition;
    private _shouldReorderAttrs;
    private _reorder;
}
export declare class BindablesInfo<T extends 0 | 1 = 0> {
    readonly attrs: Record<string, BindableDefinition>;
    readonly bindables: Record<string, BindableDefinition>;
    readonly primary: T extends 1 ? BindableDefinition : BindableDefinition | undefined;
    static from(def: CustomAttributeDefinition, isAttr: true): BindablesInfo<1>;
    static from(def: CustomElementDefinition, isAttr: false): BindablesInfo<0>;
    protected constructor(attrs: Record<string, BindableDefinition>, bindables: Record<string, BindableDefinition>, primary: T extends 1 ? BindableDefinition : BindableDefinition | undefined);
}
/**
 * An interface describing the hooks a compilation process should invoke.
 *
 * A feature available to the default template compiler.
 */
export declare const ITemplateCompilerHooks: import("@aurelia/kernel").InterfaceSymbol<ITemplateCompilerHooks>;
export interface ITemplateCompilerHooks {
    /**
     * Should be invoked immediately before a template gets compiled
     */
    compiling?(template: HTMLElement): void;
}
export declare const TemplateCompilerHooks: Readonly<{
    name: string;
    define<K extends ITemplateCompilerHooks, T extends Constructable<K>>(Type: T): T;
}>;
/**
 * Decorator: Indicates that the decorated class is a template compiler hooks.
 *
 * An instance of this class will be created and appropriate compilation hooks will be invoked
 * at different phases of the default compiler.
 */
export declare const templateCompilerHooks: (target?: Function | undefined) => any;
//# sourceMappingURL=template-compiler.d.ts.map