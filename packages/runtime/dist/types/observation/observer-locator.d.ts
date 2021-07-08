import { IDirtyChecker } from './dirty-checker.js';
import { PropertyAccessor } from './property-accessor.js';
import type { Collection, IAccessor, ICollectionObserver, IObserver, AccessorOrObserver, CollectionKind, CollectionObserver } from '../observation.js';
export declare const propertyAccessor: PropertyAccessor;
export interface IObjectObservationAdapter {
    getObserver(object: unknown, propertyName: string, descriptor: PropertyDescriptor, requestor: IObserverLocator): AccessorOrObserver | null;
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
    private readonly dirtyChecker;
    private readonly nodeObserverLocator;
    protected static readonly inject: (import("@aurelia/kernel").InterfaceSymbol<IDirtyChecker> | import("@aurelia/kernel").InterfaceSymbol<INodeObserverLocator>)[];
    private readonly adapters;
    constructor(dirtyChecker: IDirtyChecker, nodeObserverLocator: INodeObserverLocator);
    addAdapter(adapter: IObjectObservationAdapter): void;
    getObserver(obj: object, key: PropertyKey): IObserver;
    getAccessor(obj: object, key: string): AccessorOrObserver;
    getArrayObserver(observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
    getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
    getSetObserver(observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
    private createObserver;
    private getAdapterObserver;
    private cache;
}
export declare type RepeatableCollection = Collection | null | undefined | number;
export declare function getCollectionObserver(collection: RepeatableCollection): CollectionObserver | undefined;
//# sourceMappingURL=observer-locator.d.ts.map