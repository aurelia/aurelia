import { ICallable, IIndexable, IDisposable } from '../../kernel/interfaces';
import { IScope } from './binding-context';
import { BindingFlags } from './binding';

export interface IBindScope {
  $bind(flags: BindingFlags, scope: IScope): void;
  $unbind(flags: BindingFlags): void;
}
export interface IAccessor<T = any> {
  getValue(): T;
  setValue(newValue: T): void;
}

export interface ISubscribable {
  subscribe(context: string, callable: ICallable): void;
  unsubscribe(context: string, callable: ICallable): void;
}

export interface IBindingTargetAccessor<TGetReturn = any, TSetValue = TGetReturn> {
  getValue(obj: IIndexable, propertyName: string): TGetReturn;
  setValue(value: TSetValue, obj: IIndexable, propertyName: string): void;
}

export interface IBindingTargetObserver<TGetReturn = any, TSetValue = TGetReturn>
  extends IBindingTargetAccessor<TGetReturn, TSetValue>, ISubscribable {

  bind?(flags: BindingFlags): void;
  unbind?(flags: BindingFlags): void;
}

export interface IBindingCollectionObserver extends ISubscribable, ICallable {
  getValue?(target: IIndexable, targetProperty: string): any;
  setValue?(value: any, target: IIndexable, targetProperty: string): void;

  addChangeRecord(changeRecord: any): void;
  flushChangeRecords(): void;
  reset(oldCollection: any): any;
  getLengthObserver(): any;
}

export type AccessorOrObserver = IAccessor | IBindingTargetAccessor | IBindingTargetObserver | IBindingCollectionObserver;

export interface IObservable<T = any> {
  $observers: Record<string, AccessorOrObserver>;
}


/*
*  Property observation
*/

export interface IImmediatePropertySubscriber {
  (newValue: any, oldValue?: any): void;
}

export interface IBatchedPropertySubscriber {
  (newValue: any, oldValue?: any): void;
}

export interface IImmediatePropertySubscriberCollection {
  /*@internal*/immediateSubscriber0: IImmediatePropertySubscriber;
  /*@internal*/immediateSubscriber1: IImmediatePropertySubscriber;
  /*@internal*/immediateSubscribers: Array<IImmediatePropertySubscriber>;
  /*@internal*/immediateSubscriberCount: number;
  /*@internal*/notifyImmediate(newValue: any, previousValue?: any): void;
  subscribeImmediate(subscriber: IImmediatePropertySubscriber): void;
  unsubscribeImmediate(subscriber: IImmediatePropertySubscriber): void;
}

export interface IBatchedPropertySubscriberCollection {
  /*@internal*/batchedSubscriber0: IBatchedPropertySubscriber;
  /*@internal*/batchedSubscriber1: IBatchedPropertySubscriber;
  /*@internal*/batchedSubscribers: Array<IBatchedPropertySubscriber>;
  /*@internal*/batchedSubscriberCount: number;
  /*@internal*/notifyBatched(newValue: any, oldValue?: any): void;
  subscribeBatched(subscriber: IBatchedPropertySubscriber): void;
  unsubscribeBatched(subscriber: IBatchedPropertySubscriber): void;
}

export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends IDisposable, IImmediatePropertySubscriberCollection, IBatchedPropertySubscriberCollection {
  /*@internal*/observing: boolean;
  /*@internal*/obj: TObj;
  /*@internal*/propertyKey: TProp;
  /*@internal*/ownPropertyDescriptor: PropertyDescriptor;
  /*@internal*/oldValue?: any;
  /*@internal*/previousValue?: any;
  /*@internal*/currentValue: any;
  /*@internal*/hasChanges: boolean;
  flushChanges(): void;
  getValue(): any;
  setValue(newValue: any): void;
}

export type PropertyObserver = IPropertyObserver<any, PropertyKey>;



/*
*  Collection observation
*/

export interface IObservedCollection {
  $observer: CollectionObserver;
}
export interface IObservedArray extends IObservedCollection, Array<any> { }
export interface IObservedSet extends IObservedCollection, Set<any> { }
export interface IObservedMap extends IObservedCollection, Map<any, any> { }
export type ObservedCollection = IObservedArray | IObservedSet | IObservedMap;

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111
}

export interface IImmediateCollectionSubscriber {
  (origin: string, args?: IArguments): void;
}

export interface IBatchedCollectionSubscriber {
  (indexMap: Array<number>): void;
}

export interface IImmediateCollectionSubscriberCollection {
  /*@internal*/immediateSubscriber0: IImmediateCollectionSubscriber;
  /*@internal*/immediateSubscriber1: IImmediateCollectionSubscriber;
  /*@internal*/immediateSubscribers: Array<IImmediateCollectionSubscriber>;
  /*@internal*/immediateSubscriberCount: number;
  /*@internal*/notifyImmediate(origin: string, args?: IArguments): void;
  subscribeImmediate(subscriber: IImmediateCollectionSubscriber): void;
  unsubscribeImmediate(subscriber: IImmediateCollectionSubscriber): void;
}

export interface IBatchedCollectionSubscriberCollection {
  /*@internal*/batchedSubscriber0: IBatchedCollectionSubscriber;
  /*@internal*/batchedSubscriber1: IBatchedCollectionSubscriber;
  /*@internal*/batchedSubscribers: Array<IBatchedCollectionSubscriber>;
  /*@internal*/batchedSubscriberCount: number;
  /*@internal*/notifyBatched(indexMap: Array<number>): void;
  subscribeBatched(subscriber: IBatchedCollectionSubscriber): void;
  unsubscribeBatched(subscriber: IBatchedCollectionSubscriber): void;
}

export interface ICollectionObserver<T extends ObservedCollection> extends IDisposable, IImmediateCollectionSubscriberCollection, IBatchedCollectionSubscriberCollection {
  /*@internal*/collection: T;
  /*@internal*/indexMap: Array<number>;
  /*@internal*/hasChanges: boolean;
  /*@internal*/resetIndexMap(): void;
  flushChanges(): void;
}

export interface IArrayObserver extends ICollectionObserver<IObservedArray> {
  lengthPropertyName: 'length';
  collectionKind: CollectionKind.array;
}

export interface IMapObserver extends ICollectionObserver<IObservedMap> {
  lengthPropertyName: 'size';
  collectionKind: CollectionKind.map;
}

export interface ISetObserver extends ICollectionObserver<IObservedSet> {
  lengthPropertyName: 'size';
  collectionKind: CollectionKind.set;
}

export type CollectionObserver = IArrayObserver | IMapObserver | ISetObserver;
