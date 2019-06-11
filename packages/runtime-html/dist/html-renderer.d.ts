import { InjectArray, InterfaceSymbol, IRegistry } from '@aurelia/kernel';
import { IDOM, IExpressionParser, IInstructionRenderer, IObserverLocator, IController, IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { IAttributeBindingInstruction, IListenerBindingInstruction, ISetAttributeInstruction, IStylePropertyBindingInstruction, ITextBindingInstruction } from './definitions';
import { IEventManager } from './observation/event-manager';
export declare class TextBindingRenderer implements IInstructionRenderer {
    static readonly inject: InjectArray;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: ChildNode, instruction: ITextBindingInstruction): void;
}
export declare class ListenerBindingRenderer implements IInstructionRenderer {
    static readonly inject: InjectArray;
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
export declare class StylePropertyBindingRenderer implements IInstructionRenderer {
    static readonly inject: InjectArray;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IStylePropertyBindingInstruction): void;
}
export declare class AttributeBindingRenderer implements IInstructionRenderer {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    private readonly parser;
    private readonly observerLocator;
    constructor(parser: IExpressionParser, observerLocator: IObserverLocator);
    render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IController, target: HTMLElement, instruction: IAttributeBindingInstruction): void;
}
//# sourceMappingURL=html-renderer.d.ts.map