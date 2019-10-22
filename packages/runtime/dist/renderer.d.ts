import { Class, IRegistry } from '@aurelia/kernel';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, PartialCustomElementDefinitionParts } from './definitions';
import { IDOM, INode } from './dom';
import { LifecycleFlags } from './flags';
import { IBinding, IController, IRenderContext } from './lifecycle';
import { IObserverLocator } from './observation/observer-locator';
import { IInstructionRenderer, IInstructionTypeClassifier, IRenderingEngine } from './rendering-engine';
declare type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
declare type DecoratedInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;
declare type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;
export declare function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType>;
export declare function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string>;
export declare function addBinding(renderable: IController, binding: IBinding): void;
export declare function addComponent(renderable: IController, component: IController): void;
export declare function getTarget(potentialTarget: object): object;
export declare function getRefTarget(refHost: INode, refTargetName: string): object;
export declare class SetPropertyRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: ISetPropertyInstruction): void;
}
export declare class CustomElementRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateElementInstruction): void;
}
export declare class CustomAttributeRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateAttributeInstruction): void;
}
export declare class TemplateControllerRenderer implements IInstructionRenderer {
    private readonly renderingEngine;
    private readonly observerLocator;
    constructor(renderingEngine: IRenderingEngine, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateTemplateController, parts?: PartialCustomElementDefinitionParts): void;
}
export declare class LetElementRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IHydrateLetElementInstruction): void;
}
export declare class CallBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: ICallBindingInstruction): void;
}
export declare class RefBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    constructor(parser: IExpressionParser);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: INode, instruction: IRefBindingInstruction): void;
}
export declare class InterpolationBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: IInterpolationInstruction): void;
}
export declare class PropertyBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: IPropertyBindingInstruction): void;
}
export declare class IteratorBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: IController, instruction: IIteratorBindingInstruction): void;
}
export {};
//# sourceMappingURL=renderer.d.ts.map