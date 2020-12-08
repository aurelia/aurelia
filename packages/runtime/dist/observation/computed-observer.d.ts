import { LifecycleFlags, AccessorType } from '../observation.js';
import type { IObservable, ISubscriber, ICollectionSubscriber, ISubscriberCollection, IConnectable } from '../observation.js';
import type { IServiceLocator } from '@aurelia/kernel';
import type { IConnectableBinding } from '../binding/connectable.js';
import type { IsBindingBehavior } from '../binding/ast.js';
import type { IWatcherCallback } from './watch.js';
import type { IObserverLocator } from './observer-locator.js';
import type { Scope } from './binding-context.js';
export interface ComputedObserver extends IConnectableBinding, ISubscriberCollection {
}
export declare class ComputedObserver implements IConnectableBinding, ISubscriber, ICollectionSubscriber, ISubscriberCollection {
    readonly obj: object;
    readonly get: (watcher: IConnectable) => unknown;
    readonly set: undefined | ((v: unknown) => void);
    readonly useProxy: boolean;
    readonly observerLocator: IObserverLocator;
    static create(obj: object, key: PropertyKey, descriptor: PropertyDescriptor, observerLocator: IObserverLocator, useProxy: boolean): ComputedObserver;
    id: number;
    interceptor: this;
    type: AccessorType;
    value: unknown;
    private isDirty;
    constructor(obj: object, get: (watcher: IConnectable) => unknown, set: undefined | ((v: unknown) => void), useProxy: boolean, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValue(v: unknown, _flags: LifecycleFlags): void;
    handleChange(): void;
    handleCollectionChange(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    private run;
    private compute;
}
export interface ComputedWatcher extends IConnectableBinding {
}
export declare class ComputedWatcher implements IConnectableBinding, ISubscriber, ICollectionSubscriber {
    readonly obj: IObservable;
    readonly observerLocator: IObserverLocator;
    readonly get: (obj: object, watcher: IConnectable) => unknown;
    private readonly cb;
    readonly useProxy: boolean;
    interceptor: this;
    id: number;
    value: unknown;
    isBound: boolean;
    private running;
    constructor(obj: IObservable, observerLocator: IObserverLocator, get: (obj: object, watcher: IConnectable) => unknown, cb: IWatcherCallback<object>, useProxy: boolean);
    handleChange(): void;
    handleCollectionChange(): void;
    $bind(): void;
    $unbind(): void;
    private run;
    private compute;
}
export declare class ExpressionWatcher implements IConnectableBinding {
    scope: Scope;
    locator: IServiceLocator;
    observerLocator: IObserverLocator;
    private readonly expression;
    private readonly callback;
    interceptor: this;
    value: unknown;
    isBound: boolean;
    constructor(scope: Scope, locator: IServiceLocator, observerLocator: IObserverLocator, expression: IsBindingBehavior, callback: IWatcherCallback<object>);
    handleChange(value: unknown): void;
    $bind(): void;
    $unbind(): void;
}
//# sourceMappingURL=computed-observer.d.ts.map