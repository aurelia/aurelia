import { CollectionSizeObserver } from './collection-length-observer';
import { atObserver, createIndexMap } from './interfaces';
import { subscriberCollection } from './subscriber-collection';
import { rtDefineHiddenProp } from './utilities';

import { type IIndexable } from '@aurelia/kernel';
import type {
  AccessorType,
  ICollectionObserver,
  ICollectionSubscriberCollection,
} from './interfaces';
import { addCollectionBatch, batching } from './subscriber-batch';

export interface MapObserver extends ICollectionObserver<'map'>, ICollectionSubscriberCollection { }

export const getMapObserver = /*@__PURE__*/ (() => {
  // multiple applications of Aurelia wouldn't have different observers for the same Map object
  const lookupMetadataKey = Symbol.for('__au_map_obs__');
  const observerLookup = ((Map as IIndexable<typeof Map>)[lookupMetadataKey]
    ?? rtDefineHiddenProp(Map, lookupMetadataKey, new WeakMap())
  ) as WeakMap<Map<unknown, unknown>, MapObserverImpl>;

  const { set: $set, clear: $clear, delete: $delete } = Map.prototype;
  const methods = ['set', 'clear', 'delete'] as const;

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
    clear: function (this: Map<unknown, unknown>): ReturnType<typeof $clear> {
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

  function enableMapObservation(map: Map<unknown, unknown>): void {
    for (const method of methods) {
      rtDefineHiddenProp(map, method, observe[method]);
    }
  }

  // function disableMapObservation(map: Map<unknown, unknown>): void {
  //   for (const method of methods) {
  //     if (hasOwnProp.call(map, method)) {
  //       // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  //       delete map[method];
  //     }
  //   }
  // }

  interface MapObserverImpl extends MapObserver {}
  class MapObserverImpl {
    public type: AccessorType = atObserver;
    private lenObs?: CollectionSizeObserver;

    public constructor(map: Map<unknown, unknown>) {
      this.collection = map;
      this.indexMap = createIndexMap(map.size);
      this.lenObs = void 0;
    }

    public notify(): void {
      const subs = this.subs;
      subs.notifyDirty();

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

  subscriberCollection(MapObserverImpl, null!);

  return function getMapObserver(map: Map<unknown, unknown>): MapObserver {
    let observer = observerLookup.get(map);
    if (observer === void 0) {
      observerLookup.set(map, observer = new MapObserverImpl(map));
      enableMapObservation(map);
    }
    return observer;
  };
})();
