import { ICallable, IDisposable, IIndexable } from '../../kernel/interfaces';
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

export interface IObservable<TObj extends Object, TProp extends keyof TObj> extends Object {
  $observers: Record<TProp, IPropertyObserver<TObj, TProp>>;
}

export interface IChangeTracker {
  hasChanges: boolean;
  flushChanges(): void;
}

export enum MutationKind {
  instance   = 0b01,
  collection = 0b10
}

export interface IPropertyChangeTracker<TObj extends Object, TProp extends keyof TObj> extends IChangeTracker {
  obj: TObj;
  propertyKey: TProp;
  oldValue?: any;
  previousValue?: any;
  currentValue: any;
}

export interface ICollectionChangeTracker<T extends Collection> extends IChangeTracker {  
  collection: T;
  indexMap: Array<number>;
  resetIndexMap(): void;
}

export interface IPropertyChangeHandler { (newValue: any, previousValue?: any, flags?: BindingFlags): void; }
export interface IPropertyChangeNotifier extends IPropertyChangeHandler {}

export interface IBatchedPropertyChangeHandler { (newValue: any, oldValue?: any, flags?: BindingFlags): void; }
export interface IBatchedPropertyChangeNotifier extends IBatchedPropertyChangeHandler {}

export interface IPropertySubscriber { handleChange(newValue: any, previousValue?: any, flags?: BindingFlags): void; }
export interface IBatchedPropertySubscriber { handleBatchedChange(newValue: any, oldValue?: any, flags?: BindingFlags): void; }

export interface ICollectionChangeHandler { (origin: string, args?: IArguments, flags?: BindingFlags): void; }
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {}

export interface IBatchedCollectionChangeHandler { (indexMap: Array<number>, flags?: BindingFlags): void; }
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {}

export interface ICollectionSubscriber { handleChange(origin: string, args?: IArguments, flags?: BindingFlags): void; }
export interface IBatchedCollectionSubscriber { handleBatchedChange(indexMap: Array<number>, flags?: BindingFlags): void; }

export type Subscriber = ICollectionSubscriber | IPropertySubscriber;
export type BatchedSubscriber = IPropertySubscriber | IBatchedPropertySubscriber;

export type MutationKindToSubscriber<T> =
  T extends MutationKind.instance ? IPropertySubscriber :
  T extends MutationKind.collection ? ICollectionSubscriber :
  never;

export type MutationKindToBatchedSubscriber<T> =
  T extends MutationKind.instance ? IBatchedPropertySubscriber :
  T extends MutationKind.collection ? IBatchedCollectionSubscriber :
  never;

export type MutationKindToNotifier<T> =
  T extends MutationKind.instance ? IPropertyChangeNotifier :
  T extends MutationKind.collection ? ICollectionChangeNotifier :
  never;

export type MutationKindToBatchedNotifier<T> =
  T extends MutationKind.instance ? IBatchedPropertyChangeNotifier :
  T extends MutationKind.collection ? IBatchedCollectionChangeNotifier :
  never;

export interface ISubscriberCollection<T extends MutationKind> {
  subscribers: Array<MutationKindToSubscriber<T>>;
  subscriberFlags: Array<BindingFlags>;
  notify: MutationKindToNotifier<T>;
  subscribe(subscriber: MutationKindToSubscriber<T>, flags?: BindingFlags): void;
  unsubscribe(subscriber: MutationKindToSubscriber<T>, flags?: BindingFlags): void;
}

export interface IBatchedSubscriberCollection<T extends MutationKind> {
  batchedSubscribers: Array<MutationKindToBatchedSubscriber<T>>;
  batchedSubscriberFlags: Array<BindingFlags>;
  notifyBatched: MutationKindToBatchedNotifier<T>;
  subscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>, flags?: BindingFlags): void;
  unsubscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>, flags?: BindingFlags): void;
}

export const enum PropertyObserverKind {
  noop      = 0b00001,
  get       = 0b00010,
  set       = 0b00100,
  customGet = 0b01000,
  customSet = 0b10000
}

export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends
  IDisposable,
  IAccessor<any>,
  IPropertyChangeTracker<TObj, TProp>,
  ISubscriberCollection<MutationKind.instance>,
  IBatchedSubscriberCollection<MutationKind.instance> {
  /*@internal*/observing: boolean;
  /*@internal*/ownPropertyDescriptor: PropertyDescriptor;
}

export type PropertyObserver = IPropertyObserver<any, PropertyKey>;

export type Collection = Array<any> | Set<any> | Map<any, any>;
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

export type LengthPropertyName<T> =
  T extends Array<any> ? 'length' :
  T extends Set<any> ? 'size' :
  T extends Map<any, any> ? 'size' :
  never;

export type CollectionTypeToKind<T> =
  T extends Array<any> ? CollectionKind.array | CollectionKind.indexed :
  T extends Set<any> ? CollectionKind.set | CollectionKind.keyed :
  T extends Map<any, any> ? CollectionKind.map | CollectionKind.keyed :
  never;

export type CollectionKindToType<T> =
  T extends CollectionKind.array ? Array<any> :
  T extends CollectionKind.indexed ? Array<any> :
  T extends CollectionKind.map ? Map<any, any> :
  T extends CollectionKind.set ? Set<any> :
  T extends CollectionKind.keyed ? Set<any> | Map<any, any> :
  never;

export type ObservedCollectionKindToType<T> =
  T extends CollectionKind.array ? IObservedArray :
  T extends CollectionKind.indexed ? IObservedArray :
  T extends CollectionKind.map ? IObservedMap :
  T extends CollectionKind.set ? IObservedSet :
  T extends CollectionKind.keyed ? IObservedSet | IObservedMap :
  never;


export interface ICollectionObserver<T extends CollectionKind> extends
  IDisposable,
  ICollectionChangeTracker<CollectionKindToType<T>>,
  ISubscriberCollection<MutationKind.collection>,
  IBatchedSubscriberCollection<MutationKind.collection> {
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
}

export type CollectionObserver = ICollectionObserver<CollectionKind>;
