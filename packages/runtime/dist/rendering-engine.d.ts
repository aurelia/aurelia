import { Immutable, ImmutableArray, IRegistry, IResourceDescriptions } from '@aurelia/kernel';
import { InstructionTypeName, ITargetedInstruction, ITemplateDefinition, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { IDOM, INode, INodeSequenceFactory } from './dom';
import { IRenderable, IRenderContext, IViewFactory } from './lifecycle';
import { IAccessor, ISubscribable, ISubscriberCollection, MutationKind } from './observation';
import { ICustomAttribute, ICustomAttributeType } from './resources/custom-attribute';
import { ICustomElement, ICustomElementType } from './resources/custom-element';
export interface ITemplateCompiler {
    readonly name: string;
    compile(dom: IDOM, definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}
export declare const ITemplateCompiler: import("@aurelia/kernel").InterfaceSymbol<ITemplateCompiler>;
export declare enum ViewCompileFlags {
    none = 1,
    surrogate = 2,
    shadowDOM = 4
}
export interface ITemplateFactory<T extends INode = INode> {
    create(parentRenderContext: IRenderContext<T>, definition: TemplateDefinition): ITemplate<T>;
}
export declare const ITemplateFactory: import("@aurelia/kernel").InterfaceSymbol<ITemplateFactory<INode>>;
export interface ITemplate<T extends INode = INode> {
    readonly renderContext: IRenderContext<T>;
    readonly dom: IDOM<T>;
    render(renderable: IRenderable<T>, host?: T, parts?: Immutable<Record<string, ITemplateDefinition>>): void;
}
export declare class CompiledTemplate<T extends INode = INode> implements ITemplate {
    readonly factory: INodeSequenceFactory<T>;
    readonly renderContext: IRenderContext<T>;
    readonly dom: IDOM<T>;
    private readonly definition;
    constructor(dom: IDOM<T>, definition: TemplateDefinition, factory: INodeSequenceFactory<T>, renderContext: IRenderContext<T>);
    render(renderable: IRenderable<T>, host?: T, parts?: TemplatePartDefinitions): void;
}
export interface IInstructionTypeClassifier<TType extends string = string> {
    instructionType: TType;
}
export interface IInstructionRenderer<TType extends InstructionTypeName = InstructionTypeName> extends Partial<IInstructionTypeClassifier<TType>> {
    render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: unknown, instruction: ITargetedInstruction, ...rest: unknown[]): void;
}
export declare const IInstructionRenderer: import("@aurelia/kernel").InterfaceSymbol<IInstructionRenderer<string>>;
export interface IRenderer {
    instructionRenderers: Record<string, IInstructionRenderer>;
    render(dom: IDOM, context: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
}
export declare const IRenderer: import("@aurelia/kernel").InterfaceSymbol<IRenderer>;
export interface IRenderingEngine {
    getElementTemplate<T extends INode = INode>(dom: IDOM<T>, definition: TemplateDefinition, parentContext: IRenderContext<T> | null, componentType: ICustomElementType<T> | null): ITemplate<T>;
    getViewFactory<T extends INode = INode>(dom: IDOM<T>, source: Immutable<ITemplateDefinition>, parentContext: IRenderContext<T> | null): IViewFactory<T>;
    applyRuntimeBehavior<T extends INode = INode>(Type: ICustomAttributeType<T>, instance: ICustomAttribute<T>): void;
    applyRuntimeBehavior<T extends INode = INode>(Type: ICustomElementType<T>, instance: ICustomElement<T>): void;
}
export declare const IRenderingEngine: import("@aurelia/kernel").InterfaceSymbol<IRenderingEngine>;
export declare function createRenderContext(dom: IDOM, parentRenderContext: IRenderContext, dependencies: ImmutableArray<IRegistry>, componentType: ICustomElementType | null): IRenderContext;
export interface IChildrenObserver extends IAccessor, ISubscribable<MutationKind.instance>, ISubscriberCollection<MutationKind.instance> {
}
//# sourceMappingURL=rendering-engine.d.ts.map