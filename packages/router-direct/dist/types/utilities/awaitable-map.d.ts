/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { OpenPromise } from './open-promise';
export declare class AwaitableMap<K, V> {
    map: Map<K, V | OpenPromise<V>>;
    set(key: K, value: V): void;
    delete(key: K): void;
    await(key: K): V | Promise<V>;
    has(key: K): boolean;
    clone(): AwaitableMap<K, V>;
}
//# sourceMappingURL=awaitable-map.d.ts.map