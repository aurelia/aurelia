import { IContainer, IIndexable, IResourceDescriptions } from '@aurelia/kernel';
import { InstructionTypeName, ITargetedInstruction, PartialCustomElementDefinitionParts } from './definitions';
import { IDOM, INode, INodeSequenceFactory } from './dom';
import { LifecycleFlags } from './flags';
import { IController, IRenderContext, IViewFactory, IViewModel } from './lifecycle';
import { IAccessor, IPropertyObserver, ISubscribable, ISubscriberCollection } from './observation';
import { PartialCustomElementDefinition, CustomElementDefinition, CustomElementType } from './resources/custom-element';
export interface ITemplateCompiler {
    readonly name: string;
    compile(dom: IDOM, definition: PartialCustomElementDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): CustomElementDefinition;
}
export declare const ITemplateCompiler: import("@aurelia/kernel").InterfaceSymbol<ITemplateCompiler>;
export declare enum ViewCompileFlags {
    none = 1,
    surrogate = 2,
    shadowDOM = 4
}
export interface ITemplateFactory<T extends INode = INode> {
    create(parentRenderContext: IRenderContext<T>, definition: CustomElementDefinition): ITemplate<T>;
}
export declare const ITemplateFactory: import("@aurelia/kernel").InterfaceSymbol<ITemplateFactory<INode>>;
export interface ITemplate<T extends INode = INode> {
    readonly renderContext: IRenderContext<T>;
    readonly dom: IDOM<T>;
    readonly definition: CustomElementDefinition;
    render(controller: IController<T>, host?: T, parts?: Record<string, PartialCustomElementDefinition>, flags?: LifecycleFlags): void;
    render(viewModel: IViewModel<T>, host?: T, parts?: Record<string, PartialCustomElementDefinition>, flags?: LifecycleFlags): void;
}
export declare class CompiledTemplate<T extends INode = INode> implements ITemplate {
    readonly dom: IDOM<T>;
    readonly definition: CustomElementDefinition;
    readonly factory: INodeSequenceFactory<T>;
    readonly renderContext: IRenderContext<T>;
    constructor(dom: IDOM<T>, definition: CustomElementDefinition, factory: INodeSequenceFactory<T>, renderContext: IRenderContext<T>);
    render(viewModel: IViewModel<T>, host?: T, parts?: PartialCustomElementDefinitionParts, flags?: LifecycleFlags): void;
    render(controller: IController<T>, host?: T, parts?: PartialCustomElementDefinitionParts, flags?: LifecycleFlags): void;
}
export interface IInstructionTypeClassifier<TType extends string = string> {
    instructionType: TType;
}
export interface IInstructionRenderer<TType extends InstructionTypeName = InstructionTypeName> extends Partial<IInstructionTypeClassifier<TType>> {
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: unknown, instruction: ITargetedInstruction, ...rest: unknown[]): void;
}
export declare const IInstructionRenderer: import("@aurelia/kernel").InterfaceSymbol<IInstructionRenderer<string>>;
export interface IRenderer {
    instructionRenderers: Record<string, IInstructionRenderer['render']>;
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host?: INode, parts?: PartialCustomElementDefinitionParts): void;
}
export declare const IRenderer: import("@aurelia/kernel").InterfaceSymbol<IRenderer>;
export interface IRenderingEngine {
    getElementTemplate<T extends INode = INode>(dom: IDOM<T>, definition: CustomElementDefinition, parentContext?: IContainer | IRenderContext<T>, componentType?: CustomElementType): ITemplate<T> | undefined;
    getViewFactory<T extends INode = INode>(dom: IDOM<T>, source: PartialCustomElementDefinition, parentContext?: IContainer | IRenderContext<T>): IViewFactory<T>;
}
export declare const IRenderingEngine: import("@aurelia/kernel").InterfaceSymbol<IRenderingEngine>;
export interface ChildrenObserver extends IAccessor, ISubscribable, ISubscriberCollection, IPropertyObserver<IIndexable, string> {
}
//# sourceMappingURL=rendering-engine.d.ts.map