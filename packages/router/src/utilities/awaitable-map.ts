/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { OpenPromise } from './open-promise';

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

  public await(key: K): V | Promise<V> {
    if (!this.map.has(key)) {
      const openPromise = new OpenPromise<V>();
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
