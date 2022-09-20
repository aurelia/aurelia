import { createIndexMap, AccessorType } from '../observation';
import { CollectionSizeObserver } from './collection-length-observer';
import { subscriberCollection } from './subscriber-collection';
import { def, defineMetadata, getOwnMetadata } from '../utilities-objects';

import type {
  CollectionKind,
  ICollectionObserver,
  ICollectionSubscriberCollection,
} from '../observation';
import { batching, addCollectionBatch } from './subscriber-batch';

// multiple applications of Aurelia wouldn't have different observers for the same Map object
const lookupMetadataKey = '__au_map_obs__';
const observerLookup = (() => {
  let lookup: WeakMap<Map<unknown, unknown>, MapObserver> = getOwnMetadata(lookupMetadataKey, Map);
  if (lookup == null) {
    defineMetadata(lookupMetadataKey, lookup = new WeakMap<Map<unknown, unknown>, MapObserver>(), Map);
  }
  return lookup;
})();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto = Map.prototype as { [K in keyof Map<any, any>]: Map<any, any>[K] & { observing?: boolean } };

const $set = proto.set;
const $clear = proto.clear;
const $delete = proto.delete;

const native = { set: $set, clear: $clear, delete: $delete };
const methods: ['set', 'clear', 'delete'] = ['set', 'clear', 'delete'];

// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap

const observe = {
  // https://tc39.github.io/ecma262/#sec-map.prototype.map
  set: function (this: Map<unknown, unknown>, key: unknown, value: unknown): ReturnType<typeof $set> {
    const o = observerLookup.get(this);
    if (o === undefined) {
      $set.call(this, key, value);
      return this;
    }
    const oldValue = this.get(key);
    const oldSize = this.size;
    $set.call(this, key, value);
    const newSize = this.size;
    if (newSize === oldSize) {
      let i = 0;
      for (const entry of this.entries()) {
        if (entry[0] === key) {
          if (entry[1] !== oldValue) {
            o.indexMap.deletedIndices.push(o.indexMap[i]);
            o.indexMap.deletedItems.push(entry);
            o.indexMap[i] = -2;
            o.notify();
          }
          return this;
        }
        i++;
      }
      return this;
    }
    o.indexMap[oldSize] = -2;
    o.notify();
    return this;
  },
  // https://tc39.github.io/ecma262/#sec-map.prototype.clear
  clear: function (this: Map<unknown, unknown>): ReturnType<typeof $clear>  {
    const o = observerLookup.get(this);
    if (o === undefined) {
      return $clear.call(this);
    }
    const size = this.size;
    if (size > 0) {
      const indexMap = o.indexMap;
      let i = 0;
      // deepscan-disable-next-line
      for (const key of this.keys()) {
        if (indexMap[i] > -1) {
          indexMap.deletedIndices.push(indexMap[i]);
          indexMap.deletedItems.push(key);
        }
        i++;
      }
      $clear.call(this);
      indexMap.length = 0;
      o.notify();
    }
    return undefined;
  },
  // https://tc39.github.io/ecma262/#sec-map.prototype.delete
  delete: function (this: Map<unknown, unknown>, value: unknown): ReturnType<typeof $delete> {
    const o = observerLookup.get(this);
    if (o === undefined) {
      return $delete.call(this, value);
    }
    const size = this.size;
    if (size === 0) {
      return false;
    }
    let i = 0;
    const indexMap = o.indexMap;
    for (const entry of this.keys()) {
      if (entry === value) {
        if (indexMap[i] > -1) {
          indexMap.deletedIndices.push(indexMap[i]);
          indexMap.deletedItems.push(entry);
        }
        indexMap.splice(i, 1);
        const deleteResult = $delete.call(this, value);
        if (deleteResult === true) {
          o.notify();
        }
        return deleteResult;
      }
      ++i;
    }
    return false;
  }
};

const descriptorProps = {
  writable: true,
  enumerable: false,
  configurable: true
};

for (const method of methods) {
  def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}

let enableMapObservationCalled = false;

const observationEnabledKey = '__au_map_on__';
export function enableMapObservation(): void {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!(getOwnMetadata(observationEnabledKey, Map) ?? false)) {
    defineMetadata(observationEnabledKey, true, Map);
    for (const method of methods) {
      if (proto[method].observing !== true) {
        def(proto, method, { ...descriptorProps, value: observe[method] });
      }
    }
  }
}

export function disableMapObservation(): void {
  for (const method of methods) {
    if (proto[method].observing === true) {
      def(proto, method, { ...descriptorProps, value: native[method] });
    }
  }
}

export interface MapObserver extends ICollectionObserver<CollectionKind.map>, ICollectionSubscriberCollection {}

export class MapObserver {
  public type: AccessorType = AccessorType.Map;
  private lenObs?: CollectionSizeObserver;

  public constructor(map: Map<unknown, unknown>) {

    if (!enableMapObservationCalled) {
      enableMapObservationCalled = true;
      enableMapObservation();
    }

    this.collection = map;
    this.indexMap = createIndexMap(map.size);
    this.lenObs = void 0;

    observerLookup.set(map, this);
  }

  public notify(): void {
    const subs = this.subs;
    const indexMap = this.indexMap;
    if (batching) {
      addCollectionBatch(subs, this.collection, indexMap);
      return;
    }

    const map = this.collection;
    const size = map.size;

    this.indexMap = createIndexMap(size);
    subs.notifyCollection(map, indexMap);
  }

  public getLengthObserver(): CollectionSizeObserver {
    return this.lenObs ??= new CollectionSizeObserver(this);
  }
}

subscriberCollection(MapObserver);

export function getMapObserver(map: Map<unknown, unknown>): MapObserver {
  let observer = observerLookup.get(map);
  if (observer === void 0) {
    observer = new MapObserver(map);
  }
  return observer;
}
