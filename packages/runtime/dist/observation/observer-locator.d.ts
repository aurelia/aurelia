import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { AccessorOrObserver, CollectionKind, CollectionObserver, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, IObservedArray, IObservedMap, IObservedSet } from '../observation';
import { IScheduler } from '../scheduler';
export interface IObjectObservationAdapter {
    getObserver(flags: LifecycleFlags, object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}
export interface IObserverLocator {
    getObserver(flags: LifecycleFlags, obj: object, propertyName: string): AccessorOrObserver;
    getAccessor(flags: LifecycleFlags, obj: object, propertyName: string): IBindingTargetAccessor;
    addAdapter(adapter: IObjectObservationAdapter): void;
    getArrayObserver(flags: LifecycleFlags, observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
    getMapObserver(flags: LifecycleFlags, observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
    getSetObserver(flags: LifecycleFlags, observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
}
export declare const IObserverLocator: import("@aurelia/kernel").InterfaceSymbol<IObserverLocator>;
export interface ITargetObserverLocator {
    getObserver(flags: LifecycleFlags, scheduler: IScheduler, lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver;
    overridesAccessor(flags: LifecycleFlags, obj: unknown, propertyName: string): boolean;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare const ITargetObserverLocator: import("@aurelia/kernel").InterfaceSymbol<ITargetObserverLocator>;
export interface ITargetAccessorLocator {
    getAccessor(flags: LifecycleFlags, scheduler: IScheduler, lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare const ITargetAccessorLocator: import("@aurelia/kernel").InterfaceSymbol<ITargetAccessorLocator>;
export declare type RepeatableCollection = IObservedMap | IObservedSet | IObservedArray | null | undefined | number;
export declare function getCollectionObserver(flags: LifecycleFlags, lifecycle: ILifecycle, collection: RepeatableCollection): CollectionObserver | undefined;
//# sourceMappingURL=observer-locator.d.ts.map