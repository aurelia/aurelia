import { IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IBindingTargetObserver, ICollectionSubscribable, IObservable, ISubscribable, ISubscriber } from '../observation';
import { IObserverLocator } from './observer-locator';
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
    currentValue: unknown;
    oldValue: unknown;
    private readonly descriptor;
    private observing;
    constructor(obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor);
    setValue(newValue: unknown): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    convertProperty(): void;
}
export interface GetterObserver extends IBindingTargetObserver {
}
export declare class GetterObserver implements GetterObserver {
    readonly obj: IObservable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    private readonly proxy;
    private readonly propertyDeps;
    private readonly collectionDeps;
    private readonly overrides;
    private readonly descriptor;
    private subscriberCount;
    private isCollecting;
    constructor(flags: LifecycleFlags, overrides: ComputedOverrides, obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor, observerLocator: IObserverLocator, lifecycle: ILifecycle);
    addPropertyDep(subscribable: ISubscribable): void;
    addCollectionDep(subscribable: ICollectionSubscribable): void;
    getValue(): unknown;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    handleChange(): void;
    handleCollectionChange(): void;
    getValueAndCollectDependencies(requireCollect: boolean): unknown;
    doNotCollect(key: PropertyKey): boolean;
    private unsubscribeAllDependencies;
}
//# sourceMappingURL=computed-observer.d.ts.map