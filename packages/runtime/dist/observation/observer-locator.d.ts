import { InterfaceSymbol } from '@aurelia/kernel';
import { ILifecycle } from '../lifecycle';
import { AccessorOrObserver, CollectionKind, CollectionObserver, IBindingContext, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, IObservable, IObservedArray, IObservedMap, IObservedSet } from '../observation';
export interface IObjectObservationAdapter {
    getObserver(object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}
export interface IObserverLocator {
    getObserver(obj: IObservable | IBindingContext, propertyName: string): AccessorOrObserver;
    getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor;
    addAdapter(adapter: IObjectObservationAdapter): void;
    getArrayObserver(observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
    getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
    getSetObserver(observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
}
export declare const IObserverLocator: InterfaceSymbol<IObserverLocator>;
export interface ITargetObserverLocator {
    getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver;
    overridesAccessor(obj: unknown, propertyName: string): boolean;
    handles(obj: unknown): boolean;
}
export declare const ITargetObserverLocator: InterfaceSymbol<ITargetObserverLocator>;
export interface ITargetAccessorLocator {
    getAccessor(lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor;
    handles(obj: unknown): boolean;
}
export declare const ITargetAccessorLocator: InterfaceSymbol<ITargetAccessorLocator>;
export declare function getCollectionObserver(lifecycle: ILifecycle, collection: IObservedMap | IObservedSet | IObservedArray): CollectionObserver;
//# sourceMappingURL=observer-locator.d.ts.map