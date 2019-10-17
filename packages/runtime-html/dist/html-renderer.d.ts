import { InterfaceSymbol, IRegistry, Key } from '@aurelia/kernel';
import { IController, IDOM, IExpressionParser, IInstructionRenderer, IObserverLocator, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { IAttributeBindingInstruction, IListenerBindingInstruction, ISetAttributeInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction, ISetClassAttributeInstruction, ISetStyleAttributeInstruction } from './definitions';
import { IEventManager } from './observation/event-manager';
export declare class TextBindingRenderer implements IInstructionRenderer {
    static readonly inject: readonly Key[];
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: ChildNode, instruction: ITextBindingInstruction): void;
}
export declare class ListenerBindingRenderer implements IInstructionRenderer {
    static readonly inject: readonly Key[];
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly eventManager;
    constructor(parser: IExpressionParser, eventManager: IEventManager);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IListenerBindingInstruction): void;
}
export declare class SetAttributeRenderer implements IInstructionRenderer {
    static readonly register: IRegistry['register'];
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ISetAttributeInstruction): void;
}
export declare class SetClassAttributeRenderer implements IInstructionRenderer {
    static readonly register: IRegistry['register'];
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ISetClassAttributeInstruction): void;
}
export declare class SetStyleAttributeRenderer implements IInstructionRenderer {
    static readonly register: IRegistry['register'];
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: ISetStyleAttributeInstruction): void;
}
export declare class StylePropertyBindingRenderer implements IInstructionRenderer {
    static readonly inject: readonly Key[];
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IStylePropertyBindingInstruction): void;
}
export declare class AttributeBindingRenderer implements IInstructionRenderer {
    static readonly inject: readonly InterfaceSymbol[];
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IAttributeBindingInstruction): void;
}
//# sourceMappingURL=html-renderer.d.ts.map