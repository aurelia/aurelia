import { Class, InterfaceSymbol, IRegistry } from '@aurelia/kernel';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetPropertyInstruction, TemplatePartDefinitions } from './definitions';
import { IDOM, INode } from './dom';
import { LifecycleFlags } from './flags';
import { IComponent, IRenderable, IRenderContext, IBinding } from './lifecycle';
import { IObserverLocator } from './observation/observer-locator';
import { IInstructionRenderer, IInstructionTypeClassifier, IRenderingEngine } from './rendering-engine';
declare type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
declare type DecoratedInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;
declare type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;
export declare function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType>;
export declare function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string>;
export declare function addBinding(renderable: IRenderable, binding: IBinding): void;
export declare function addComponent(renderable: IRenderable, component: IComponent): void;
export declare class SetPropertyRenderer implements IInstructionRenderer {
    static readonly register: IRegistry['register'];
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: object, instruction: ISetPropertyInstruction): void;
}
export declare class CustomElementRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateElementInstruction): void;
}
export declare class CustomAttributeRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateAttributeInstruction): void;
}
export declare class TemplateControllerRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void;
}
export declare class LetElementRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateLetElementInstruction): void;
}
export declare class CallBindingRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: ICallBindingInstruction): void;
}
export declare class RefBindingRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly parser;
    constructor(parser: IExpressionParser);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IRefBindingInstruction): void;
}
export declare class InterpolationBindingRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IInterpolationInstruction): void;
}
export declare class PropertyBindingRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IPropertyBindingInstruction): void;
}
export declare class IteratorBindingRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IIteratorBindingInstruction): void;
}
export {};
//# sourceMappingURL=renderer.d.ts.map