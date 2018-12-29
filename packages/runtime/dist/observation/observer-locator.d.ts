import { ILifecycle } from '../lifecycle';
import { AccessorOrObserver, CollectionKind, CollectionObserver, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, IObservable, IObservedArray, IObservedMap, IObservedSet } from '../observation';
import { IDirtyChecker } from './dirty-checker';
export interface IObjectObservationAdapter {
    getObserver(object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}
export interface IObserverLocator {
    getObserver(obj: unknown, propertyName: string): AccessorOrObserver;
    getAccessor(obj: unknown, propertyName: string): IBindingTargetAccessor;
    addAdapter(adapter: IObjectObservationAdapter): void;
    getArrayObserver(observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
    getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
    getSetObserver(observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
}
export declare const IObserverLocator: import("@aurelia/kernel").InterfaceSymbol<IObserverLocator>;
export interface ITargetObserverLocator {
    getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver;
    overridesAccessor(obj: unknown, propertyName: string): boolean;
    handles(obj: unknown): boolean;
}
export declare const ITargetObserverLocator: import("@aurelia/kernel").InterfaceSymbol<ITargetObserverLocator>;
export interface ITargetAccessorLocator {
    getAccessor(lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor;
    handles(obj: unknown): boolean;
}
export declare const ITargetAccessorLocator: import("@aurelia/kernel").InterfaceSymbol<ITargetAccessorLocator>;
export declare class ObserverLocator implements IObserverLocator {
    private adapters;
    private dirtyChecker;
    private lifecycle;
    private targetObserverLocator;
    private targetAccessorLocator;
    constructor(lifecycle: ILifecycle, dirtyChecker: IDirtyChecker, targetObserverLocator: ITargetObserverLocator, targetAccessorLocator: ITargetAccessorLocator);
    getObserver(obj: unknown, propertyName: string): AccessorOrObserver;
    addAdapter(adapter: IObjectObservationAdapter): void;
    getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor;
    getArrayObserver(observedArray: IObservedArray): ICollectionObserver<CollectionKind.array>;
    getMapObserver(observedMap: IObservedMap): ICollectionObserver<CollectionKind.map>;
    getSetObserver(observedSet: IObservedSet): ICollectionObserver<CollectionKind.set>;
    private getOrCreateObserversLookup;
    private createObserversLookup;
    private getAdapterObserver;
    private createPropertyObserver;
}
export declare function getCollectionObserver(lifecycle: ILifecycle, collection: IObservedMap | IObservedSet | IObservedArray): CollectionObserver;
//# sourceMappingURL=observer-locator.d.ts.map