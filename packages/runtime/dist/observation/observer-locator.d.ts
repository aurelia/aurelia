import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { AccessorOrObserver, CollectionKind, CollectionObserver, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, IObservedArray, IObservedMap, IObservedSet } from '../observation';
import { IDirtyChecker } from './dirty-checker';
import { IScheduler } from '@aurelia/scheduler';
export interface IObjectObservationAdapter {
    getObserver(flags: LifecycleFlags, object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver | null;
}
export interface IObserverLocator extends ObserverLocator {
}
export declare const IObserverLocator: import("@aurelia/kernel").InterfaceSymbol<IObserverLocator>;
export interface ITargetObserverLocator {
    getObserver(flags: LifecycleFlags, scheduler: IScheduler, lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver | null;
    overridesAccessor(flags: LifecycleFlags, obj: unknown, propertyName: string): boolean;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare const ITargetObserverLocator: import("@aurelia/kernel").InterfaceSymbol<ITargetObserverLocator>;
export interface ITargetAccessorLocator {
    getAccessor(flags: LifecycleFlags, scheduler: IScheduler, lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare const ITargetAccessorLocator: import("@aurelia/kernel").InterfaceSymbol<ITargetAccessorLocator>;
export declare class ObserverLocator {
    private readonly lifecycle;
    private readonly scheduler;
    private readonly dirtyChecker;
    private readonly targetObserverLocator;
    private readonly targetAccessorLocator;
    private readonly adapters;
    constructor(lifecycle: ILifecycle, scheduler: IScheduler, dirtyChecker: IDirtyChecker, targetObserverLocator: ITargetObserverLocator, targetAccessorLocator: ITargetAccessorLocator);
    addAdapter(adapter: IObjectObservationAdapter): void;
    getObserver(flags: LifecycleFlags, obj: object, key: string): AccessorOrObserver;
    getAccessor(flags: LifecycleFlags, obj: object, key: string): IBindingTargetAccessor;
    getArrayObserver(flags: LifecycleFlags, observedArray: IObservedArray): ICollectionObserver<CollectionKind.array>;
    getMapObserver(flags: LifecycleFlags, observedMap: IObservedMap): ICollectionObserver<CollectionKind.map>;
    getSetObserver(flags: LifecycleFlags, observedSet: IObservedSet): ICollectionObserver<CollectionKind.set>;
    private createObserver;
    private getAdapterObserver;
    private cache;
}
export declare type RepeatableCollection = IObservedMap | IObservedSet | IObservedArray | null | undefined | number;
export declare function getCollectionObserver(flags: LifecycleFlags, lifecycle: ILifecycle, collection: RepeatableCollection): CollectionObserver | undefined;
//# sourceMappingURL=observer-locator.d.ts.map