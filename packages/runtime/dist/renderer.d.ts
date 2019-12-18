import { Class, IContainer, IRegistry, IServiceLocator } from '@aurelia/kernel';
import { IsBindingBehavior } from './ast';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, InstructionTypeName, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, ITargetedInstruction, PartialCustomElementDefinitionParts } from './definitions';
import { INode } from './dom';
import { LifecycleFlags } from './flags';
import { IController, IRenderableController } from './lifecycle';
import { IObserverLocator } from './observation/observer-locator';
import { CustomElementDefinition, PartialCustomElementDefinition } from './resources/custom-element';
import { ICompiledRenderContext } from './templating/render-context';
import { IInterceptableBinding } from './resources/binding-behavior';
export interface ITemplateCompiler {
    compile(partialDefinition: PartialCustomElementDefinition, context: IContainer): CustomElementDefinition;
}
export declare const ITemplateCompiler: import("@aurelia/kernel").InterfaceSymbol<ITemplateCompiler>;
export interface IInstructionTypeClassifier<TType extends string = string> {
    instructionType: TType;
}
export interface IInstructionRenderer<TType extends InstructionTypeName = InstructionTypeName> extends Partial<IInstructionTypeClassifier<TType>> {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: unknown, instruction: ITargetedInstruction, parts: PartialCustomElementDefinitionParts | undefined): void;
}
export declare const IInstructionRenderer: import("@aurelia/kernel").InterfaceSymbol<IInstructionRenderer<string>>;
export interface IRenderer {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host: INode | null | undefined, parts: PartialCustomElementDefinitionParts | undefined): void;
    renderInstructions(flags: LifecycleFlags, context: ICompiledRenderContext, instructions: readonly ITargetedInstruction[], controller: IRenderableController, target: unknown, parts: PartialCustomElementDefinitionParts | undefined): void;
}
export declare const IRenderer: import("@aurelia/kernel").InterfaceSymbol<IRenderer>;
declare type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
declare type DecoratedInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;
declare type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;
export declare function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType>;
export declare function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string>;
export declare function getTarget(potentialTarget: object): object;
export declare function getRefTarget(refHost: INode, refTargetName: string): object;
export declare class SetPropertyRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: IController, instruction: ISetPropertyInstruction): void;
}
export declare class CustomElementRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: INode, instruction: IHydrateElementInstruction, parts: PartialCustomElementDefinitionParts | undefined): void;
}
export declare class CustomAttributeRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: INode, instruction: IHydrateAttributeInstruction, parts: PartialCustomElementDefinitionParts | undefined): void;
}
export declare class TemplateControllerRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, parentContext: ICompiledRenderContext, controller: IRenderableController, target: INode, instruction: IHydrateTemplateController, parts: PartialCustomElementDefinitionParts | undefined): void;
}
export declare class LetElementRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: INode, instruction: IHydrateLetElementInstruction): void;
}
export declare class CallBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: IController, instruction: ICallBindingInstruction): void;
}
export declare class RefBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    constructor(parser: IExpressionParser);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: INode, instruction: IRefBindingInstruction): void;
}
export declare class InterpolationBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: IController, instruction: IInterpolationInstruction): void;
}
export declare class PropertyBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: IController, instruction: IPropertyBindingInstruction): void;
}
export declare class IteratorBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: IController, instruction: IIteratorBindingInstruction): void;
}
export declare function applyBindingBehavior(binding: IInterceptableBinding, expression: IsBindingBehavior, locator: IServiceLocator): IInterceptableBinding;
export {};
//# sourceMappingURL=renderer.d.ts.map