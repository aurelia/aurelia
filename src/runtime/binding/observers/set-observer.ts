import { collectionObserver } from './collection-observer';
import { IObservedSet, CollectionKind, ICollectionSubscriber, IBatchedCollectionSubscriber, ICollectionObserver } from '../observation';

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
  o.notify('add', arguments);
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
  o.notify('clear');
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
export class SetObserver implements ICollectionObserver<CollectionKind.set> {
  public collection: IObservedSet;
  public indexMap: Array<number>;
  public hasChanges: boolean;
  public lengthPropertyName: 'size';
  public collectionKind: CollectionKind.set;

  public subscribers: Array<ICollectionSubscriber>;
  public batchedSubscribers: Array<IBatchedCollectionSubscriber>;

  constructor(set: Set<any> & { $observer?: ICollectionObserver<CollectionKind.set> }) {
    set.$observer = this;
    this.collection = <IObservedSet>set;
    this.resetIndexMap();
    this.subscribers = new Array();
    this.batchedSubscribers = new Array();
  }

  public resetIndexMap: () => void;
  public notify: (origin: string, args?: IArguments) => void;
  public notifyBatched: (indexMap: Array<number>) => void;
  public subscribeBatched: (subscriber: IBatchedCollectionSubscriber) => void;
  public unsubscribeBatched: (subscriber: IBatchedCollectionSubscriber) => void;
  public subscribe: (subscriber: ICollectionSubscriber) => void;
  public unsubscribe: (subscriber: ICollectionSubscriber) => void;
  public flushChanges: () => void;
  public dispose: () => void;
}

export function getSetObserver(set: any): SetObserver {
  return set.$observer || new SetObserver(set);
}
