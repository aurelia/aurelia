import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { type IServiceLocator, IContainer } from '@aurelia/kernel';
import { ICollectionSubscriber, IObserverLocatorBasedConnectable, ISubscriber, type Scope, IAstEvaluator } from '@aurelia/runtime';
import { IBinding } from './interfaces-bindings';
export declare class ListenerBindingOptions {
    readonly prevent: boolean;
    readonly capture: boolean;
    readonly onError: (event: Event, error: unknown) => void;
    constructor(prevent: boolean, capture: boolean | undefined, onError: (event: Event, error: unknown) => void);
}
export interface ListenerBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
/**
 * Listener binding. Handle event binding between view and view model
 */
export declare class ListenerBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    ast: IsBindingBehavior;
    target: Node;
    targetEvent: string;
    strict: boolean;
    isBound: boolean;
    /**
     * Whether this binding only handles events originate from the target this binding is bound to
     */
    self: boolean;
    constructor(locator: IServiceLocator, ast: IsBindingBehavior, target: Node, targetEvent: string, options: ListenerBindingOptions, modifiedEventHandler: IModifiedEventHandler | null, strict: boolean);
    callSource(event: Event): void;
    handleEvent(event: Event): void;
    bind(scope: Scope): void;
    unbind(): void;
}
export type IModifiedEventHandler = (event: Event) => boolean;
export interface IModifiedEventHandlerCreator {
    readonly type: string | string[];
    getHandler(modifier: string): IModifiedEventHandler;
}
export declare const IModifiedEventHandlerCreator: import("@aurelia/kernel").InterfaceSymbol<IModifiedEventHandlerCreator>;
export interface IKeyMapping {
    readonly meta: string[];
    readonly keys: Record</* modifier */ string, /* key */ string>;
}
export declare const IKeyMapping: import("@aurelia/kernel").InterfaceSymbol<IKeyMapping>;
export interface IEventModifier {
    getHandler(type: string, modifier: string | null): IModifiedEventHandler | null;
}
export declare const IEventModifier: import("@aurelia/kernel").InterfaceSymbol<IEventModifier>;
export declare class EventModifier implements IEventModifier {
    static register(c: IContainer): void;
    getHandler(type: string, modifier: string | null): IModifiedEventHandler | null;
}
export declare const EventModifierRegistration: {
    register(c: IContainer): void;
};
//# sourceMappingURL=listener-binding.d.ts.map