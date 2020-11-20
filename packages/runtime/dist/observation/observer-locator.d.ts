import { AccessorOrObserver, CollectionKind, CollectionObserver, ILifecycle } from '../observation.js';
import { IDirtyChecker } from './dirty-checker.js';
import type { IAccessor, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, IObservedArray, IObservedMap, IObservedSet, IObserver } from '../observation.js';
export interface IObjectObservationAdapter {
    getObserver(object: unknown, propertyName: string, descriptor: PropertyDescriptor, requestor: IObserverLocator): IBindingTargetObserver | null;
}
export interface IObserverLocator extends ObserverLocator {
}
export declare const IObserverLocator: import("@aurelia/kernel").InterfaceSymbol<IObserverLocator>;
export interface INodeObserverLocator {
    handles(obj: unknown, key: PropertyKey, requestor: IObserverLocator): boolean;
    getObserver(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
    getAccessor(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
}
export declare const INodeObserverLocator: import("@aurelia/kernel").InterfaceSymbol<INodeObserverLocator>;
export declare type ExtendedPropertyDescriptor = PropertyDescriptor & {
    get?: ObservableGetter;
    set?: ObservableSetter;
};
export declare type ObservableGetter = PropertyDescriptor['get'] & {
    getObserver?(obj: unknown, requestor: IObserverLocator): IObserver;
};
export declare type ObservableSetter = PropertyDescriptor['set'] & {
    getObserver?(obj: unknown, requestor: IObserverLocator): IObserver;
};
export declare class ObserverLocator {
    private readonly lifecycle;
    private readonly dirtyChecker;
    private readonly nodeObserverLocator;
    private readonly adapters;
    constructor(lifecycle: ILifecycle, dirtyChecker: IDirtyChecker, nodeObserverLocator: INodeObserverLocator);
    addAdapter(adapter: IObjectObservationAdapter): void;
    getObserver(obj: object, key: string): AccessorOrObserver;
    getAccessor(obj: object, key: string): IBindingTargetAccessor;
    getArrayObserver(observedArray: IObservedArray): ICollectionObserver<CollectionKind.array>;
    getMapObserver(observedMap: IObservedMap): ICollectionObserver<CollectionKind.map>;
    getSetObserver(observedSet: IObservedSet): ICollectionObserver<CollectionKind.set>;
    private createObserver;
    private getAdapterObserver;
    private cache;
}
export declare type RepeatableCollection = IObservedMap | IObservedSet | IObservedArray | null | undefined | number;
export declare function getCollectionObserver(lifecycle: ILifecycle, collection: RepeatableCollection): CollectionObserver | undefined;
//# sourceMappingURL=observer-locator.d.ts.map