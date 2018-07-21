import { CollectionObserver, CollectionKind, collectionObserver, ISetObserver, IImmediateSubscriber, IBatchedSubscriber, IObservedArray } from './collection-observer';

export interface IObservedSet extends Set<any> {
  $observer: CollectionObserver;
}

const proto = Set.prototype;
const add = proto.add;
const clear = proto.clear;
const del = proto.delete;

export function enableSetObservation(): void {
  proto.add = observeAdd;
  proto.clear = observeClear;
  proto.delete = observeDelete;
}

export function disableSetObservation(): void {
  proto.add = add;
  proto.clear = clear;
  proto.delete = del;
}

// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap

// https://tc39.github.io/ecma262/#sec-set.prototype.add
function observeAdd(this: IObservedSet, value: any): ReturnType<typeof add> {
  const o = this.$observer;
  if (o === undefined) {
    return add.call(this, value);
  }
  const oldSize = this.size;
  add.call(this, value);
  const newSize = this.size;
  if (newSize === oldSize) {
    return this;
  }
  o.indexMap[oldSize] = -oldSize - 2;
  o.notifyImmediate('add', arguments);
  return this;
};

// https://tc39.github.io/ecma262/#sec-set.prototype.clear
function observeClear(this: IObservedSet): ReturnType<typeof clear>  {
  const o = this.$observer;
  if (o === undefined) {
    return clear.call(this);
  }
  clear.call(this);
  o.indexMap.length = 0;
  o.notifyImmediate('clear');
  return undefined;
};

// https://tc39.github.io/ecma262/#sec-set.prototype.delete
function observeDelete(this: IObservedSet, value: any): ReturnType<typeof del> {
  const o = this.$observer;
  if (o === undefined) {
    return del.call(this, value);
  }
  const size = this.size;
  if (size === 0) {
    return false;
  }
  let i = 0;
  for (const entry of this.keys()) {
    if (entry === value) {
      o.indexMap.splice(i, 1);
      return del.call(this, value);
    }
    i++;
  }
  return false;
};

@collectionObserver(CollectionKind.set)
export class SetObserver implements ISetObserver {
  public collection: IObservedSet;
  public indexMap: Array<number>;
  public hasChanges: boolean;
  public lengthPropertyName: 'size';
  public collectionKind: CollectionKind.set;

  public immediateSubscriber0: IImmediateSubscriber;
  public immediateSubscriber1: IImmediateSubscriber;
  public immediateSubscribers: Array<IImmediateSubscriber>;
  public immediateSubscriberCount: number;
  public batchedSubscriber0: IBatchedSubscriber;
  public batchedSubscriber1: IBatchedSubscriber;
  public batchedSubscribers: Array<IBatchedSubscriber>;
  public batchedSubscriberCount: number;

  constructor(array: Partial<IObservedArray>) {
    array.$observer = this;
    this.collection = <any>array;
    this.resetIndexMap();
    this.immediateSubscribers = new Array();
    this.batchedSubscribers = new Array();
  }

  public resetIndexMap: () => void;
  public notifyImmediate: (origin: string, args?: IArguments) => void;
  public notifyBatched: (indexMap: Array<number>) => void;
  public subscribeBatched: (subscriber: IBatchedSubscriber) => void;
  public unsubscribeBatched: (subscriber: IBatchedSubscriber) => void;
  public subscribeImmediate: (subscriber: IImmediateSubscriber) => void;
  public unsubscribeImmediate: (subscriber: IImmediateSubscriber) => void;
  public flushChanges: () => void;
  public dispose: () => void;
}

export function getSetObserver(set: any): SetObserver {
  return set.$observer || new SetObserver(set);
}
