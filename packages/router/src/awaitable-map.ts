// export class OpenPromise<T> {
//   public isPending: boolean = true;
//   public promise!: Promise<T>;
//   public resolve!: (value: T | PromiseLike<T>) => void;
//   public reject!: () => void;
// }

import { OpenPromise } from './open-promise.js';

export class AwaitableMap<K, V> {
  public map: Map<K, V | OpenPromise<V>> = new Map();

  public set(key: K, value: V): void {
    const openPromise = this.map.get(key);
    if (openPromise instanceof OpenPromise) {
      openPromise.resolve(value);
      // openPromise.isPending = false;
    }
    this.map.set(key, value);
  }

  public delete(key: K): void {
    const current = this.map.get(key);
    if (current instanceof OpenPromise) {
      current.reject();
      // current.isPending = false;
    }
    this.map.delete(key);
  }

  public await(key: K): V | Promise<V | void> {
    if (!this.map.has(key)) {
      const openPromise = new OpenPromise<V>();
      // openPromise.promise = new Promise((res, rej) => {
      //   openPromise.resolve = res;
      //   openPromise.reject = rej;
      // });
      this.map.set(key, openPromise);
      return openPromise.promise;
    }
    const current = this.map.get(key);
    if (current instanceof OpenPromise) {
      return current.promise;
    }
    return current!;
  }

  public has(key: K): boolean {
    return this.map.has(key) && !(this.map.get(key) instanceof OpenPromise);
  }

  public clone(): AwaitableMap<K, V> {
    const clone = new AwaitableMap<K, V>();
    clone.map = new Map(this.map);
    return clone;
  }
}
