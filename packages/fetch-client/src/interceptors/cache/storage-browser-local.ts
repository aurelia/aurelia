// import { IPlatform, resolve } from '@aurelia/kernel';
// import { CacheItem } from './cach-service';
// import { IStorage } from './storage';

// todo: this storage implementation needs to be able to handle serialization & deserialization of response objects

// /**
//  * A simple browser local storage based storage implementation for cache interceptor
//  */
// export class BrowserLocalStorage implements IStorage {
//     public readonly cache = resolve(IPlatform).globalThis.localStorage;
//     public readonly delete = (key: string) => this.cache.removeItem(key);
//     public readonly has = (key: string) => this.cache.has(key);
//     public readonly set = <T = unknown>(key: string, value: CacheItem<T>) => this.cache.set(key, value);
//     public readonly get = <T = unknown>(key: string) => this.cache.get(key) as T;
//     public readonly clear = () => this.cache.clear();
// }
