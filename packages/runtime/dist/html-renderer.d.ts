import { IContainer } from '@aurelia/kernel';
import { IEventManager } from './binding/event-manager';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { IObserverLocator } from './binding/observer-locator';
import { ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetElementInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, ISetAttributeInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction, TemplatePartDefinitions } from './definitions';
import { INode, IRemovableNode } from './dom';
import { IAttach, IAttachables, IBindables, IBindScope, IRenderable, IRenderContext } from './lifecycle';
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
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IStylePropertyBindingInstruction): void;
}
export declare class SetPropertyRenderer implements IInstructionRenderer {
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ISetPropertyInstruction): void;
}
export declare class SetAttributeRenderer implements IInstructionRenderer {
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ISetAttributeInstruction): void;
}
export declare class CustomElementRenderer implements IInstructionRenderer {
    private renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateElementInstruction): void;
}
export declare class CustomAttributeRenderer implements IInstructionRenderer {
    private renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateAttributeInstruction): void;
}
export declare class TemplateControllerRenderer implements IInstructionRenderer {
    private renderingEngine;
    constructor(renderingEngine: IRenderingEngine);
    render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void;
}
export declare class LetElementRenderer implements IInstructionRenderer {
    private parser;
    private observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(context: IRenderContext, renderable: IRenderable, target: IRemovableNode, instruction: ILetElementInstruction): void;
}
export declare const HtmlRenderer: {
    register(container: IContainer): void;
};
//# sourceMappingURL=html-renderer.d.ts.map