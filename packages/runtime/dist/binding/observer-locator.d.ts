import { IIndexable, Primitive } from '@aurelia/kernel';
import { AccessorOrObserver, CollectionKind, CollectionObserver, IBindingContext, IBindingTargetAccessor, IBindingTargetObserver, IChangeSet, ICollectionObserver, IObservable, IObservedArray, IObservedMap, IObservedSet, IOverrideContext } from '../observation';
import { IDirtyChecker } from './dirty-checker';
import { IEventManager } from './event-manager';
import { ISVGAnalyzer } from './svg-analyzer';
export interface IObjectObservationAdapter {
    getObserver(object: IObservable, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}
export interface IObserverLocator {
    getObserver(obj: IObservable, propertyName: string): AccessorOrObserver;
    getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor;
    addAdapter(adapter: IObjectObservationAdapter): void;
    getArrayObserver(array: (IIndexable | Primitive)[]): ICollectionObserver<CollectionKind.array>;
    getMapObserver(map: Map<IIndexable | Primitive, IIndexable | Primitive>): ICollectionObserver<CollectionKind.map>;
    getSetObserver(set: Set<IIndexable | Primitive>): ICollectionObserver<CollectionKind.set>;
}
export declare const IObserverLocator: import("@aurelia/kernel/dist/di").InterfaceSymbol<IObserverLocator>;
export declare class ObserverLocator implements IObserverLocator {
    private changeSet;
    private eventManager;
    private dirtyChecker;
    private svgAnalyzer;
    private adapters;
    constructor(changeSet: IChangeSet, eventManager: IEventManager, dirtyChecker: IDirtyChecker, svgAnalyzer: ISVGAnalyzer);
    getObserver(obj: IObservable | IBindingContext | IOverrideContext, propertyName: string): AccessorOrObserver;
    addAdapter(adapter: IObjectObservationAdapter): void;
    getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor;
    getArrayObserver(array: IObservedArray): ICollectionObserver<CollectionKind.array>;
    getMapObserver(map: IObservedMap): ICollectionObserver<CollectionKind.map>;
    getSetObserver(set: IObservedSet): ICollectionObserver<CollectionKind.set>;
    private getOrCreateObserversLookup;
    private createObserversLookup;
    private getAdapterObserver;
    private createPropertyObserver;
}
export declare function getCollectionObserver(changeSet: IChangeSet, collection: IObservedMap | IObservedSet | IObservedArray): CollectionObserver;
//# sourceMappingURL=observer-locator.d.ts.map