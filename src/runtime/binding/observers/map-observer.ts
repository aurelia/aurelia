import { collectionObserver } from './collection-observer';
import { IObservedMap, CollectionKind, IMapObserver, IImmediateCollectionSubscriber, IBatchedCollectionSubscriber } from '../observation';

const proto = Map.prototype;
const set = proto.set;
const clear = proto.clear;
const del = proto.delete;

export function enableMapObservation(): void {
  proto.set = observeSet;
  proto.clear = observeClear;
  proto.delete = observeDelete;
}

export function disableMapObservation(): void {
  proto.set = set;
  proto.clear = clear;
  proto.delete = del;
}

// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap

// https://tc39.github.io/ecma262/#sec-map.prototype.map
function observeSet(this: IObservedMap, key: any, value: any): ReturnType<typeof set> {
  const o = this.$observer;
  if (o === undefined) {
    return set.call(this, key, value);
  }
  const oldSize = this.size;
  set.call(this, key, value);
  const newSize = this.size;
  if (newSize === oldSize) {
    let i = 0
    for (const entry of this.entries()) {
      if (entry[0] === key) {
        if (entry[1] !== value) {
          o.indexMap[i] = -i - 2;
        }
        return this;
      }
      i++;
    }
    return this;
  }
  o.indexMap[oldSize] = -oldSize - 2;
  o.notifyImmediate('set', arguments);
  return this;
};

// https://tc39.github.io/ecma262/#sec-map.prototype.clear
function observeClear(this: IObservedMap): ReturnType<typeof clear>  {
  const o = this.$observer;
  if (o === undefined) {
    return clear.call(this);
  }
  clear.call(this);
  o.indexMap.length = 0;
  o.notifyImmediate('clear');
  return undefined;
};

// https://tc39.github.io/ecma262/#sec-map.prototype.delete
function observeDelete(this: IObservedMap, value: any): ReturnType<typeof del> {
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


@collectionObserver(CollectionKind.map)
export class MapObserver implements IMapObserver {
  public collection: IObservedMap;
  public indexMap: Array<number>;
  public hasChanges: boolean;
  public lengthPropertyName: 'size';
  public collectionKind: CollectionKind.map;

  public immediateSubscriber0: IImmediateCollectionSubscriber;
  public immediateSubscriber1: IImmediateCollectionSubscriber;
  public immediateSubscribers: Array<IImmediateCollectionSubscriber>;
  public immediateSubscriberCount: number;
  public batchedSubscriber0: IBatchedCollectionSubscriber;
  public batchedSubscriber1: IBatchedCollectionSubscriber;
  public batchedSubscribers: Array<IBatchedCollectionSubscriber>;
  public batchedSubscriberCount: number;

  constructor(map: Map<any, any> & { $observer?: IMapObserver }) {
    map.$observer = this;
    this.collection = <IObservedMap>map;
    this.resetIndexMap();
    this.immediateSubscribers = new Array();
    this.batchedSubscribers = new Array();
  }

  public resetIndexMap: () => void;
  public notifyImmediate: (origin: string, args?: IArguments) => void;
  public notifyBatched: (indexMap: Array<number>) => void;
  public subscribeBatched: (subscriber: IBatchedCollectionSubscriber) => void;
  public unsubscribeBatched: (subscriber: IBatchedCollectionSubscriber) => void;
  public subscribeImmediate: (subscriber: IImmediateCollectionSubscriber) => void;
  public unsubscribeImmediate: (subscriber: IImmediateCollectionSubscriber) => void;
  public flushChanges: () => void;
  public dispose: () => void;
}

export function getMapObserver(map: any): MapObserver {
  return map.$observer || new MapObserver(map);
}
