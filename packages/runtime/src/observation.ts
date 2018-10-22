import { DI, IDisposable, IIndexable, PLATFORM } from '@aurelia/kernel';

export enum BindingFlags {
  none                   = 0b000_00000000_000_00,
  mustEvaluate           = 0b100_00000000_000_00,

  mutation               = 0b0000_00000000_000_11,
  isCollectionMutation   = 0b0000_00000000_000_01,
  isInstanceMutation     = 0b0000_00000000_000_10,

  update                 = 0b0000_00000000_111_00,
  updateTargetObserver   = 0b0000_00000000_001_00,
  updateTargetInstance   = 0b0000_00000000_010_00,
  updateSourceExpression = 0b0000_00000000_100_00,

  from                   = 0b0000_11111111_000_00,
  fromFlushChanges       = 0b0000_00000001_000_00,
  fromStartTask          = 0b0000_00000010_000_00,
  fromStopTask           = 0b0000_00000100_000_00,
  fromBind               = 0b0000_00001000_000_00,
  fromUnbind             = 0b0000_00010000_000_00,
  fromDOMEvent           = 0b0000_00100000_000_00,
  fromObserverSetter     = 0b0000_01000000_000_00,
  fromBindableHandler    = 0b0000_10000000_000_00,
}

/*@internal*/
export const enum SubscriberFlags {
  None            = 0,
  Subscriber0     = 0b0001,
  Subscriber1     = 0b0010,
  Subscriber2     = 0b0100,
  SubscribersRest = 0b1000,
  Any             = 0b1111,
}

export interface ILinkedNode {
  /*@internal*/$next?: IChangeTracker;
}

/**
 * Describes a type that tracks changes and can flush those changes in some way
 */
export interface IChangeTracker extends ILinkedNode {
  hasChanges?: boolean;
  flushChanges(): void;
}
/**
 * Represents a set of ChangeTrackers (typically observers) containing changes that can be flushed in some way (e.g. by calling subscribers).
 *
 * The LinkedChangeList itself also implements the IChangeTracker interface, allowing sets of changes to be grouped together and composed into a tree.
 */
export interface IChangeSet extends IChangeTracker {
  /**
   * A promise that resolves when the current set of changes has been flushed.
   * This is the same promise that is returned from `add`
   */
  readonly flushed: Promise<void>;

  /**
   * Indicates whether this LinkedChangeList is currently flushing changes
   */
  readonly flushing: boolean;

  /**
   * The number of ChangeTrackers that this set contains
   */
  readonly size: number;

  /**
   * Flushes the changes for all ChangeTrackers currently present in this set.
   */
  flushChanges(): void;

  /**
   * Returns this set of ChangeTrackers as an array.
   */
  toArray(): IChangeTracker[];

  /**
   * Adds a ChangeTracker to the set. Similar to how a normal Set behaves, adding the same item multiple times has the same effect as adding it once.
   *
   * @returns A promise that resolves when the changes have been flushed.
   */
  add(changeTracker: IChangeTracker): Promise<void>;

  /**
   * Returns true if the specified ChangeTracker is present in the set.
   */
  has(changeTracker: IChangeTracker): boolean;
}

export const IChangeSet = DI.createInterface<IChangeSet>()
  .withDefault(x => x.singleton(<any>LinkedChangeList));

const add = Set.prototype.add;

/*@internal*/
export class ChangeSet extends Set<IChangeTracker> implements IChangeSet {
  public flushed: Promise<void>;
  public flushing: boolean = false;

  /*@internal*/
  public promise: Promise<void> = Promise.resolve();

  public toArray(): IChangeTracker[] {
    const items = new Array<IChangeTracker>(this.size);
    let i = 0;
    for (const item of this.keys()) {
      items[i++] = item;
    }
    return items;
  }

  /**
   * This particular implementation is recursive; any changes added as a side-effect of flushing changes, will be flushed during the same tick.
   */
  public flushChanges = (): void => {
    this.flushing = true;
    while (this.size > 0) {
      const items = this.toArray();
      this.clear();
      const len = items.length;
      let i = 0;
      while (i < len) {
        items[i++].flushChanges();
      }
    }
    this.flushing = false;
  }

  public add(changeTracker: IChangeTracker): never; // this is a hack to keep intellisense/type checker from nagging about signature compatibility
  public add(changeTracker: IChangeTracker): Promise<void> {
    if (this.size === 0) {
      this.flushed = this.promise.then(this.flushChanges);
    }
    add.call(this, changeTracker);
    return this.flushed;
  }
}

const marker = PLATFORM.emptyObject as IChangeTracker;

/*@internal*/
export class LinkedChangeList implements IChangeSet {
  public flushed: Promise<void>;
  public flushing: boolean = false;
  public size: number = 0;
  private head: IChangeTracker = null;
  private tail: IChangeTracker = null;

  /*@internal*/
  public promise: Promise<void> = Promise.resolve();

  public toArray(): IChangeTracker[] {
    const items = new Array<IChangeTracker>(this.size);
    let i = 0;
    let current = this.head;
    let next;
    while (current) {
      items[i] = current;
      next = current.$next;
      current = next;
      i++;
    }
    return items;
  }

  public has(item: IChangeTracker): boolean {
    let current = this.head;
    let next;
    while (current) {
      if (item === current) {
        return true;
      }
      next = current.$next;
      current = next;
    }
    return false;
  }

  /**
   * This particular implementation is recursive; any changes added as a side-effect of flushing changes, will be flushed during the same tick.
   */
  public flushChanges = (): void => {
    this.flushing = true;
    while (this.size > 0) {
      let current = this.head;
      this.head = this.tail = null;
      this.size = 0;
      let next;
      while (current && current !== marker) {
        next = current.$next;
        current.$next = null;
        current.flushChanges();
        current = next;
      }
    }
    this.flushing = false;
  }

  public add(item: IChangeTracker): never; // this is a hack to keep intellisense/type checker from nagging about signature compatibility
  public add(item: IChangeTracker): Promise<void> {
    if (this.size === 0) {
      this.flushed = this.promise.then(this.flushChanges);
    }
    if (item.$next) {
      return this.flushed;
    }
    // this is just to give the tail node a non-null value as a cheap way to check whether
    // something is queued already
    item.$next = marker;
    if (this.tail !== null) {
      this.tail.$next = item;
    } else {
      this.head = item;
    }
    this.tail = item;
    this.size++;
    return this.flushed;
  }

}

/**
 * Basic interface to normalize getting/setting a value of any property on any object
 */
export interface IAccessor<TValue = any> {
  getValue(): TValue;
  setValue(newValue: TValue, flags: BindingFlags): void;
}

/**
 * Describes a target observer for to-view bindings (in other words, an observer without the observation).
 */
export interface IBindingTargetAccessor<
  TObj = any,
  TProp = keyof TObj,
  TValue = any>
  extends IDisposable,
          IAccessor<TValue>,
          IPropertyChangeTracker<TObj, TProp> { }

/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<
  TObj = any,
  TProp = keyof TObj,
  TValue = any>
  extends IBindingTargetAccessor<TObj, TProp, TValue>,
          ISubscribable<MutationKind.instance>,
          ISubscriberCollection<MutationKind.instance> {

  bind?(flags: BindingFlags): void;
  unbind?(flags: BindingFlags): void;
}

export type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;


/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export type IndexMap = number[] & {
  deletedItems?: any[];
};

/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
export enum MutationKind {
  instance   = 0b01,
  collection = 0b10
}

/**
 * Describes a type that specifically tracks changes in an object property, or simply something that can have a getter and/or setter
 */
export interface IPropertyChangeTracker<TObj extends Object, TProp = keyof TObj, TValue = any> {
  obj: TObj;
  propertyKey?: TProp;
  currentValue?: TValue;
}

/**
 * Describes a type that specifically tracks changes in a collection (map, set or array)
 */
export interface ICollectionChangeTracker<T extends Collection> extends IChangeTracker {
  collection: T;
  indexMap: IndexMap;
  resetIndexMap(): void;
}

/**
 * Represents a (subscriber) function that can be called by a PropertyChangeNotifier
 */
export type IPropertyChangeHandler<TValue = any> = (newValue: TValue, previousValue: TValue, flags: BindingFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations on a property
 */
export interface IPropertyChangeNotifier extends IPropertyChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the IPropertyChangeHandler interface
 */
export interface IPropertySubscriber<TValue = any> { handleChange(newValue: TValue, previousValue: TValue, flags: BindingFlags): void; }

/**
 * Represents a (subscriber) function that can be called by a CollectionChangeNotifier
 */
export type ICollectionChangeHandler = (origin: string, args: IArguments | null, flags?: BindingFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations in a collection
 */
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {}

/**
 * Represents a (subscriber) function that can be called by a BatchedCollectionChangeNotifier
 */
export type IBatchedCollectionChangeHandler = (indexMap: number[]) => void;
/**
 * Represents a (observer) function that can notify subscribers of batched mutations in a collection
 */
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the ICollectionChangeHandler interface
 */
export interface ICollectionSubscriber { handleChange(origin: string, args: IArguments | null, flags: BindingFlags): void; }
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedCollectionChangeNotifier interface
 */
export interface IBatchedCollectionSubscriber { handleBatchedChange(indexMap: number[]): void; }

/**
 * Either a property or collection subscriber
 */
export type Subscriber = ICollectionSubscriber | IPropertySubscriber;
/**
 * Either a batched property or batched collection subscriber
 */
export type BatchedSubscriber = IBatchedCollectionSubscriber;

/**
 * Helper type that translates from mutationKind enum to the correct subscriber interface
 */
export type MutationKindToSubscriber<T> =
  T extends MutationKind.instance ? IPropertySubscriber :
  T extends MutationKind.collection ? ICollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched subscriber interface
 */
export type MutationKindToBatchedSubscriber<T> =
  T extends MutationKind.collection ? IBatchedCollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct notifier interface
 */
export type MutationKindToNotifier<T> =
  T extends MutationKind.instance ? IPropertyChangeNotifier :
  T extends MutationKind.collection ? ICollectionChangeNotifier :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched notifier interface
 */
export type MutationKindToBatchedNotifier<T> =
  T extends MutationKind.collection ? IBatchedCollectionChangeNotifier :
  never;

export interface ISubscribable<T extends MutationKind> {
  subscribe(subscriber: MutationKindToSubscriber<T>): void;
  unsubscribe(subscriber: MutationKindToSubscriber<T>): void;
}


/**
 * A collection of property or collection subscribers
 */
export interface ISubscriberCollection<T extends MutationKind> extends ISubscribable<T> {
  /*@internal*/_subscriberFlags?: SubscriberFlags;
  /*@internal*/_subscriber0?: MutationKindToSubscriber<T>;
  /*@internal*/_subscriber1?: MutationKindToSubscriber<T>;
  /*@internal*/_subscriber2?: MutationKindToSubscriber<T>;
  /*@internal*/_subscribersRest?: MutationKindToSubscriber<T>[];

  callSubscribers: MutationKindToNotifier<T>;
  hasSubscribers(): boolean;
  hasSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  removeSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  addSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
}

/**
 * A collection of batched property or collection subscribers
 */
export interface IBatchedSubscriberCollection<T extends MutationKind> extends IBatchedSubscribable<T> {
  /*@internal*/_batchedSubscriberFlags?: SubscriberFlags;
  /*@internal*/_batchedSubscriber0?: MutationKindToBatchedSubscriber<T>;
  /*@internal*/_batchedSubscriber1?: MutationKindToBatchedSubscriber<T>;
  /*@internal*/_batchedSubscriber2?: MutationKindToBatchedSubscriber<T>;
  /*@internal*/_batchedSubscribersRest?: MutationKindToBatchedSubscriber<T>[];

  /*@internal*/changeSet?: IChangeSet;
  callBatchedSubscribers: MutationKindToBatchedNotifier<T>;

  /*@internal*/flushChanges(): void;
  hasBatchedSubscribers(): boolean;
  hasBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  removeBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  addBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
}

export interface IBatchedSubscribable<T extends MutationKind> {
  subscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
  unsubscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
}

/**
 * Describes a complete property observer with an accessor, change tracking fields, normal and batched subscribers
 */
export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends
  IDisposable,
  IAccessor<TObj[TProp]>,
  IPropertyChangeTracker<TObj, TProp>,
  ISubscriberCollection<MutationKind.instance> {
  /*@internal*/observing: boolean;
}

/**
 * An any-typed property observer
 */
export type PropertyObserver = IPropertyObserver<any, PropertyKey>;

/**
 * A collection (array, set or map)
 */
export type Collection = any[] | Set<any> | Map<any, any>;
interface IObservedCollection {
  $observer?: CollectionObserver;
}

/**
 * An array that is being observed for mutations
 */
export interface IObservedArray<T = any> extends IObservedCollection, Array<T> { }
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet<T = any> extends IObservedCollection, Set<T> { }
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap<K = any, V = any> extends IObservedCollection, Map<K, V> { }
/**
 * A collection that is being observed for mutations
 */
export type ObservedCollection = IObservedArray | IObservedSet | IObservedMap;

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111
}

export type LengthPropertyName<T> =
  T extends any[] ? 'length' :
  T extends Set<any> ? 'size' :
  T extends Map<any, any> ? 'size' :
  never;

export type CollectionTypeToKind<T> =
  T extends any[] ? CollectionKind.array | CollectionKind.indexed :
  T extends Set<any> ? CollectionKind.set | CollectionKind.keyed :
  T extends Map<any, any> ? CollectionKind.map | CollectionKind.keyed :
  never;

export type CollectionKindToType<T> =
  T extends CollectionKind.array ? any[] :
  T extends CollectionKind.indexed ? any[] :
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

/**
 * An observer that tracks collection mutations and notifies subscribers (either directly or in batches)
 */
export interface ICollectionObserver<T extends CollectionKind> extends
  IDisposable,
  ICollectionChangeTracker<CollectionKindToType<T>>,
  ISubscriberCollection<MutationKind.collection>,
  IBatchedSubscriberCollection<MutationKind.collection> {
    /*@internal*/changeSet: IChangeSet;
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
    lengthObserver: IBindingTargetObserver;
    getLengthObserver(): IBindingTargetObserver;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;


export interface IBindingContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  getObservers?(): ObserversLookup<IOverrideContext>;
}

export interface IOverrideContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  readonly bindingContext: IBindingContext;
  readonly parentOverrideContext: IOverrideContext | null;
  getObservers(): ObserversLookup<IOverrideContext>;
}

export interface IScope {
  readonly bindingContext: IBindingContext;
  readonly overrideContext: IOverrideContext;
}

export interface IObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> {

}

export type ObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
  Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> =
  { [P in TKey]: PropertyObserver; } & { getOrCreate(obj: IBindingContext | IOverrideContext, key: string): PropertyObserver };

export type IObservable = IIndexable & {
  readonly $synthetic?: false;
  $observers?: Record<string, AccessorOrObserver>;
};
