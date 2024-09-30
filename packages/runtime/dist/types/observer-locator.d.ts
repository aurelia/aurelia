import { ArrayObserver } from './array-observer';
import { ComputedGetterFn } from './computed-observer';
import { MapObserver } from './map-observer';
import { SetObserver } from './set-observer';
import type { Collection, IAccessor, ICollectionObserver, IObserver, AccessorOrObserver, CollectionObserver } from './interfaces';
export interface IObjectObservationAdapter {
    getObserver(object: unknown, key: PropertyKey, descriptor: PropertyDescriptor, requestor: IObserverLocator): IObserver | null;
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
export interface IComputedObserverLocator {
    getObserver(obj: object, key: PropertyKey, pd: ExtendedPropertyDescriptor, requestor: IObserverLocator): IObserver;
}
export declare const IComputedObserverLocator: import("@aurelia/kernel").InterfaceSymbol<IComputedObserverLocator>;
export type ExtendedPropertyDescriptor = PropertyDescriptor & {
    get?: ObservableGetter;
};
export type ObservableGetter = PropertyDescriptor['get'] & {
    getObserver?(obj: unknown): IObserver;
};
export declare class ObserverLocator {
    addAdapter(adapter: IObjectObservationAdapter): void;
    getObserver(obj: unknown, key: PropertyKey): IObserver;
    getObserver<T, R>(obj: T, key: ComputedGetterFn<T, R>): IObserver<R>;
    getAccessor(obj: object, key: PropertyKey): AccessorOrObserver;
    getArrayObserver(observedArray: unknown[]): ICollectionObserver<'array'>;
    getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<'map'>;
    getSetObserver(observedSet: Set<unknown>): ICollectionObserver<'set'>;
    private createObserver;
}
export type RepeatableCollection = Collection | null | undefined | number;
export declare const getCollectionObserver: {
    (array: unknown[]): ArrayObserver;
    (map: Map<unknown, unknown>): MapObserver;
    (set: Set<unknown>): SetObserver;
    (collection: RepeatableCollection): CollectionObserver | undefined;
};
export declare const getObserverLookup: <T extends IObserver>(instance: object) => Record<PropertyKey, T>;
//# sourceMappingURL=observer-locator.d.ts.map