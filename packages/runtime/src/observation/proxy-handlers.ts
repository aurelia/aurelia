import { IIndexable, isObject, isArrayIndex } from '@aurelia/kernel';
import { collecting, currentSub as currentSub } from './subscriber-switcher';
import { doNotCollect, getProxy, rawKey, getRaw } from './proxy-observer';
import { IConnectable } from '../observation';
import { LifecycleFlags } from '../flags';

const $get = Reflect.get;

const objectHandler: ProxyHandler<object> = {
  get(target: IIndexable, key: PropertyKey, receiver?: unknown): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const v = $get(target, key, receiver);
    const connectable = currentSub();

    if (!collecting || doNotCollect(target, key) || connectable == null) {
      // maybe just use symbol
      return v;
    }

    // todo: static
    connectable.observeProperty(LifecycleFlags.none, target, key as string);

    if (isObject(v)) {
      return getProxy(v);
    }

    return v;
  },
};

const arrayHandler: ProxyHandler<unknown[]> = {
  get(target: unknown[], key: PropertyKey, receiver?): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const v = $get(target, key, receiver);
    const connectable = currentSub();

    if (!collecting || doNotCollect(target, key) || connectable == null) {
      return v;
    }

    if (key === 'length') {
      connectable
        // todo: static
        .observerLocator
        .getArrayObserver(LifecycleFlags.none, target)
        .getLengthObserver()
        .subscribe(connectable);
    } else if (isArrayIndex(key)) {
      // isArrayIndex expecting unknown is a bit much?
      // maybe just PropertyKey?
      connectable
        // todo: static
        .observerLocator
        .getArrayObserver(LifecycleFlags.none, target)
        .getIndexObserver(key as number)
        .subscribe(connectable);
    }

    if (isObject(v)) {
      return getProxy(v);
    }

    return v;
  },
};

type $MapOrSet = Map<unknown, unknown> | Set<unknown>;

const wrappedCollectionMethods: $MapOrSet = {
  forEach: function forEach(this: $MapOrSet) {
    const raw = getRaw(this);
    const connectable = currentSub();
    if (connectable != null) {
      connectable
        .observerLocator
        .getMapObserver(LifecycleFlags.none, (raw as unknown as Map<unknown, unknown>))
        .subscribeToCollection(connectable);
    }
    raw.forEach((v: unknown, key: unknown) => {
      
    });
  },
}


const collectionHandler: ProxyHandler<$MapOrSet> = {
  get(target: IIndexable<$MapOrSet>, key: PropertyKey, receiver?): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const v = $get(target, key, receiver);
    const connectable = currentSub();

    if (!collecting || doNotCollect(target, key) || connectable == null) {
      return v;
    }

    if (doNotCollect(target, key)) {
      return target[$key];
    }

    const currentSubscriber = currentSub();
    if (currentSubscriber == null) {
      return target[$key];
    }

    if (target instanceof Set) {
      if ($key === 'size') {
        const lengthObserver = getSetObserver(target).getLengthObserver();
        lengthObserver.subscribe(currentSubscriber);
        return lengthObserver.currentValue;
      }
      // todo: checking built-in method accesses
    } else {
      if ($key === 'size') {
        const lengthObserver = getMapObserver(target).getLengthObserver();
        lengthObserver.subscribe(currentSubscriber);
        return lengthObserver.currentValue;
      }
      // todo: checking built-in method accesses
    }

    const value = target[$key];
    if (!(value instanceof Object)) {
      return value;
    }

    switch (toStringTag.call(value)) {
      // todo: some array method needs not observing on all element
      // just need length observation
      // example: [].forEach only requires length observation or any mutation, not every index observation

      case funTag:
        // calling native methods on collection object
        // example: map.forEach | set.forEach | set.has
        if (value.toString().indexOf('[native code]') > -1) {
          return value;
        }
    }

    return getOrCreateProxy(value);
  },

  set(target: $MapOrSet, key: PropertyKey, value: unknown, receiver?): boolean {
    const $key = key as $PropertyKey;
    if ($key === 'size') {
      return false;
    }
    if (target instanceof Set) {

    } else {

    }
    return true;
  }
};