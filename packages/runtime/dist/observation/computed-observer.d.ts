import { CollectionKind, LifecycleFlags, AccessorType } from '../observation.js';
import type { IObservable, ISubscriber, ICollectionObserver, ICollectionSubscriber, ISubscriberCollection, IWatcher } from '../observation.js';
import type { IServiceLocator } from '@aurelia/kernel';
import type { IConnectableBinding } from '../binding/connectable.js';
import type { IsBindingBehavior } from '../binding/ast.js';
import type { IWatcherCallback } from './watch.js';
import type { IObserverLocator } from './observer-locator.js';
import type { Scope } from './binding-context.js';
interface IWatcherImpl extends IWatcher, IConnectableBinding, ISubscriber, ICollectionSubscriber {
    id: number;
    observers: Map<ICollectionObserver<CollectionKind>, number>;
    readonly useProxy: boolean;
    unobserveCollection(all?: boolean): void;
}
export interface ComputedObserver extends IWatcherImpl, ISubscriberCollection {
}
export declare class ComputedObserver implements IWatcherImpl, ISubscriberCollection {
    readonly obj: object;
    readonly get: (watcher: IWatcher) => unknown;
    readonly set: undefined | ((v: unknown) => void);
    readonly useProxy: boolean;
    readonly observerLocator: IObserverLocator;
    interceptor: this;
    static create(obj: object, key: PropertyKey, descriptor: PropertyDescriptor, observerLocator: IObserverLocator, useProxy: boolean): ComputedObserver;
    observers: Map<ICollectionObserver<CollectionKind>, number>;
    type: AccessorType;
    value: unknown;
    private isDirty;
    constructor(obj: object, get: (watcher: IWatcher) => unknown, set: undefined | ((v: unknown) => void), useProxy: boolean, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValue(v: unknown, _flags: LifecycleFlags): void;
    handleChange(): void;
    handleCollectionChange(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    private run;
    private compute;
}
export interface ComputedWatcher extends IWatcherImpl {
}
export declare class ComputedWatcher implements IWatcher {
    readonly obj: IObservable;
    readonly observerLocator: IObserverLocator;
    readonly get: (obj: object, watcher: IWatcher) => unknown;
    private readonly cb;
    readonly useProxy: boolean;
    interceptor: this;
    private running;
    value: unknown;
    isBound: boolean;
    constructor(obj: IObservable, observerLocator: IObserverLocator, get: (obj: object, watcher: IWatcher) => unknown, cb: IWatcherCallback<object>, useProxy: boolean);
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
export {};
//# sourceMappingURL=computed-observer.d.ts.map