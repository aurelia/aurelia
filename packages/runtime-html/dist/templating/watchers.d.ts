import type { IServiceLocator } from '@aurelia/kernel';
import type { ICollectionSubscriber, IConnectable, IConnectableBinding, IObservable, IObserverLocator, IsBindingBehavior, ISubscriber, Scope } from '@aurelia/runtime';
import type { IWatcherCallback } from '../watch.js';
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
//# sourceMappingURL=watchers.d.ts.map