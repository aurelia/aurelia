import { IContainer, IIndexable } from '@aurelia/kernel';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateLetElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetAttributeInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction, TemplatePartDefinitions } from './definitions';
import { IElement, IHTMLElement, INode, IRenderLocation } from './dom.interfaces';
import { IAttach, IAttachables, IBindables, IBindScope, IRenderable, IRenderContext } from './lifecycle';
import { IEventManager } from './observation/event-manager';
import { IObserverLocator } from './observation/observer-locator';
import { IInstructionRenderer, IRenderingEngine } from './templating/lifecycle-render';
export declare function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string>;
export declare function addBindable(renderable: IBindables, bindable: IBindScope): void;
export declare function addAttachable(renderable: IAttachables, attachable: IAttach): void;
export declare class TextBindingRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ITextBindingInstruction): void;
}
export declare class InterpolationBindingRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IInterpolationInstruction): void;
}
export declare class PropertyBindingRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IPropertyBindingInstruction): void;
}
export declare class IteratorBindingRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IIteratorBindingInstruction): void;
}
export declare class ListenerBindingRenderer implements IInstructionRenderer {
    private parser;
    private eventManager;
    constructor(parser: IExpressionParser, eventManager: IEventManager);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IListenerBindingInstruction): void;
}
export declare class CallBindingRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ICallBindingInstruction): void;
}
export declare class RefBindingRenderer implements IInstructionRenderer {
    private parser;
    constructor(parser: IExpressionParser);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IRefBindingInstruction): void;
}
export declare class StylePropertyBindingRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: IHTMLElement, instruction: IStylePropertyBindingInstruction): void;
}
export declare class SetPropertyRenderer implements IInstructionRenderer {
    render(context: IRenderContext, renderable: IRenderable, target: IIndexable, instruction: ISetPropertyInstruction): void;
}
export declare class SetAttributeRenderer implements IInstructionRenderer {
    render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: ISetAttributeInstruction): void;
}
export declare class CustomElementRenderer implements IInstructionRenderer {
    private renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(context: IRenderContext, renderable: IRenderable, target: IRenderLocation, instruction: IHydrateElementInstruction): void;
}
export declare class CustomAttributeRenderer implements IInstructionRenderer {
    private renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: IHydrateAttributeInstruction): void;
}
export declare class TemplateControllerRenderer implements IInstructionRenderer {
    private renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void;
}
export declare class LetElementRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: IElement, instruction: IHydrateLetElementInstruction): void;
}
export declare const HtmlRenderer: {
    register(container: IContainer): void;
};
//# sourceMappingURL=html-renderer.d.ts.map