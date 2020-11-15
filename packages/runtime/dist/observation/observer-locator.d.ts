import { AccessorOrObserver, CollectionKind, CollectionObserver, IAccessor, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, ILifecycle, IObservedArray, IObservedMap, IObservedSet, IObserver, LifecycleFlags } from '../observation';
import { IDirtyChecker } from './dirty-checker';
export interface IObjectObservationAdapter {
    getObserver(flags: LifecycleFlags, object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver | null;
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
export declare class ObserverLocator {
    private readonly lifecycle;
    private readonly dirtyChecker;
    private readonly nodeObserverLocator;
    private readonly adapters;
    constructor(lifecycle: ILifecycle, dirtyChecker: IDirtyChecker, nodeObserverLocator: INodeObserverLocator);
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