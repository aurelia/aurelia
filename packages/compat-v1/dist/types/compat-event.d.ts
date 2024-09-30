import { IContainer } from '@aurelia/kernel';
import { IObserverLocatorBasedConnectable, type IAstEvaluator, type Scope } from '@aurelia/runtime';
import { type IBinding } from '@aurelia/runtime-html';
import { type BindingCommandInstance, type ICommandBuildInfo, type IInstruction, type BindingCommandStaticAuDefinition } from '@aurelia/template-compiler';
import { IExpressionParser, IsBindingBehavior } from '@aurelia/expression-parser';
import type { IDisposable, IServiceLocator } from '@aurelia/kernel';
export declare const eventPreventDefaultBehavior: {
    register(container: IContainer): void;
};
export declare const delegateSyntax: {
    register(container: IContainer): void;
};
export declare class DelegateBindingCommand implements BindingCommandInstance {
    static readonly $au: BindingCommandStaticAuDefinition;
    get ignoreAttr(): boolean;
    build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction;
}
export declare class DelegateBindingInstruction implements IInstruction {
    from: string | IsBindingBehavior;
    to: string;
    preventDefault: boolean;
    readonly type = "dl";
    constructor(from: string | IsBindingBehavior, to: string, preventDefault: boolean);
}
export declare class DelegateListenerOptions {
    readonly prevent: boolean;
    constructor(prevent: boolean);
}
export interface DelegateListenerBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
/**
 * Listener binding. Handle event binding between view and view model
 */
export declare class DelegateListenerBinding implements IBinding {
    ast: IsBindingBehavior;
    target: Node;
    targetEvent: string;
    eventDelegator: IEventDelegator;
    isBound: boolean;
    private handler;
    self: boolean;
    constructor(locator: IServiceLocator, ast: IsBindingBehavior, target: Node, targetEvent: string, eventDelegator: IEventDelegator, options: DelegateListenerOptions);
    callSource(event: Event): unknown;
    handleEvent(event: Event): void;
    bind(_scope: Scope): void;
    unbind(): void;
}
export interface IEventDelegator extends EventDelegator {
}
export declare const IEventDelegator: import("@aurelia/kernel").InterfaceSymbol<IEventDelegator>;
export declare class EventDelegator implements IDisposable {
    addEventListener(publisher: EventTarget, target: Node, eventName: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): IDisposable;
    dispose(): void;
}
//# sourceMappingURL=compat-event.d.ts.map