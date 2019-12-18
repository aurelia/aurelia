import { IRenderableController, IExpressionParser, IInstructionRenderer, IObserverLocator, ICompiledRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { IAttributeBindingInstruction, IListenerBindingInstruction, ISetAttributeInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction, ISetClassAttributeInstruction, ISetStyleAttributeInstruction } from './definitions';
import { IEventManager } from './observation/event-manager';
export declare class TextBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: ChildNode, instruction: ITextBindingInstruction): void;
}
export declare class ListenerBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly eventManager;
    constructor(parser: IExpressionParser, eventManager: IEventManager);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: HTMLElement, instruction: IListenerBindingInstruction): void;
}
export declare class SetAttributeRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: HTMLElement, instruction: ISetAttributeInstruction): void;
}
export declare class SetClassAttributeRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: HTMLElement, instruction: ISetClassAttributeInstruction): void;
}
export declare class SetStyleAttributeRenderer implements IInstructionRenderer {
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: HTMLElement, instruction: ISetStyleAttributeInstruction): void;
}
export declare class StylePropertyBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: HTMLElement, instruction: IStylePropertyBindingInstruction): void;
}
export declare class AttributeBindingRenderer implements IInstructionRenderer {
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, context: ICompiledRenderContext, controller: IRenderableController, target: HTMLElement, instruction: IAttributeBindingInstruction): void;
}
//# sourceMappingURL=html-renderer.d.ts.map