import { OpenPromise } from './open-promise.js';
export declare class AwaitableMap<K, V> {
    map: Map<K, V | OpenPromise<V>>;
    set(key: K, value: V): void;
    delete(key: K): void;
    await(key: K): V | Promise<V | void>;
    has(key: K): boolean;
    clone(): AwaitableMap<K, V>;
}
//# sourceMappingURL=awaitable-map.d.ts.map