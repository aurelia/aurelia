import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IBindingContext, IBindingTargetObserver, ICollectionSubscribable, IObservable, ISubscribable, ISubscriber, Collection, LifecycleFlags } from '../observation.js';
import { IObserverLocator } from './observer-locator.js';
import { IWatcher } from './watcher-switcher.js';
import { IConnectableBinding } from '../binding/connectable.js';
import { IWatcherCallback } from './watch.js';
import { IsBindingBehavior } from '../binding/ast.js';
import { Scope } from './binding-context.js';
export interface ComputedOverrides {
    static?: boolean;
    volatile?: boolean;
}
export declare type ComputedLookup = {
    computed?: Record<string, ComputedOverrides>;
};
export declare function computed(config: ComputedOverrides): PropertyDecorator;
export interface CustomSetterObserver extends IBindingTargetObserver {
}
export declare class CustomSetterObserver implements CustomSetterObserver {
    readonly obj: IObservable & IIndexable;
    readonly propertyKey: string;
    private readonly descriptor;
    currentValue: unknown;
    oldValue: unknown;
    private observing;
    constructor(obj: IObservable & IIndexable, propertyKey: string, descriptor: PropertyDescriptor);
    setValue(newValue: unknown): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    convertProperty(): void;
}
export interface GetterObserver extends IBindingTargetObserver {
}
export declare class GetterObserver implements GetterObserver {
    private readonly overrides;
    readonly obj: IObservable;
    readonly propertyKey: string;
    private readonly descriptor;
    currentValue: unknown;
    oldValue: unknown;
    private readonly proxy;
    private readonly propertyDeps;
    private readonly collectionDeps;
    private subscriberCount;
    private isCollecting;
    constructor(flags: LifecycleFlags, overrides: ComputedOverrides, obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor, observerLocator: IObserverLocator);
    addPropertyDep(subscribable: ISubscribable): void;
    addCollectionDep(subscribable: ICollectionSubscribable): void;
    getValue(): unknown;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    handleChange(): void;
    handleCollectionChange(): void;
    getValueAndCollectDependencies(requireCollect: boolean): unknown;
    doNotCollect(target: IObservable | IBindingContext, key: PropertyKey, receiver?: unknown): boolean;
    private unsubscribeAllDependencies;
}
export interface ComputedWatcher extends IConnectableBinding {
}
export declare class ComputedWatcher implements IWatcher {
    readonly obj: IObservable;
    readonly observerLocator: IObserverLocator;
    readonly get: (obj: object, watcher: IWatcher) => unknown;
    private readonly cb;
    private readonly useProxy;
    private readonly observers;
    private running;
    private value;
    isBound: boolean;
    constructor(obj: IObservable, observerLocator: IObserverLocator, get: (obj: object, watcher: IWatcher) => unknown, cb: IWatcherCallback<object>, useProxy: boolean);
    handleChange(): void;
    handleCollectionChange(): void;
    $bind(): void;
    $unbind(): void;
    observe(obj: object, key: PropertyKey): void;
    observeCollection(collection: Collection): void;
    observeLength(collection: Collection): void;
    private run;
    private compute;
    private forCollection;
    private unobserveCollection;
}
export declare class ExpressionWatcher implements IConnectableBinding {
    scope: Scope;
    locator: IServiceLocator;
    observerLocator: IObserverLocator;
    private readonly expression;
    private readonly callback;
    isBound: boolean;
    constructor(scope: Scope, locator: IServiceLocator, observerLocator: IObserverLocator, expression: IsBindingBehavior, callback: IWatcherCallback<object>);
    handleChange(value: unknown): void;
    $bind(): void;
    $unbind(): void;
}
//# sourceMappingURL=computed-observer.d.ts.map