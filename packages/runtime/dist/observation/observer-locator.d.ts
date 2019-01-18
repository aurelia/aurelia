import { InterfaceSymbol } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { AccessorOrObserver, CollectionKind, CollectionObserver, IBindingContext, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, IObservable, IObservedArray, IObservedMap, IObservedSet } from '../observation';
export interface IObjectObservationAdapter {
    getObserver(flags: LifecycleFlags, object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}
export interface IObserverLocator {
    getObserver(flags: LifecycleFlags, obj: IObservable | IBindingContext, propertyName: string): AccessorOrObserver;
    getAccessor(flags: LifecycleFlags, obj: IObservable, propertyName: string): IBindingTargetAccessor;
    addAdapter(adapter: IObjectObservationAdapter): void;
    getArrayObserver(flags: LifecycleFlags, observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
    getMapObserver(flags: LifecycleFlags, observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
    getSetObserver(flags: LifecycleFlags, observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
}
export declare const IObserverLocator: InterfaceSymbol<IObserverLocator>;
export interface ITargetObserverLocator {
    getObserver(flags: LifecycleFlags, lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver;
    overridesAccessor(flags: LifecycleFlags, obj: unknown, propertyName: string): boolean;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare const ITargetObserverLocator: InterfaceSymbol<ITargetObserverLocator>;
export interface ITargetAccessorLocator {
    getAccessor(flags: LifecycleFlags, lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor;
    handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export declare const ITargetAccessorLocator: InterfaceSymbol<ITargetAccessorLocator>;
export declare function getCollectionObserver(flags: LifecycleFlags, lifecycle: ILifecycle, collection: IObservedMap | IObservedSet | IObservedArray): CollectionObserver;
//# sourceMappingURL=observer-locator.d.ts.map