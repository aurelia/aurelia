import { DI, IPlatform, resolve } from '@aurelia/kernel';
import { CacheItem } from './cach-service';
import { IStorage } from './storage';

export const IBrowserLocalStorage = /*@__PURE__*/DI.createInterface<BrowserLocalStorage>();
export class BrowserLocalStorage implements IStorage {
    cache = resolve(IPlatform).globalThis.localStorage;
    delete = (key: string) => this.cache.removeItem(key);
    set = <T = unknown>(key: string, value: CacheItem<T>) => this.cache.set(key, value);
    get = <T = unknown>(key: string) => this.cache.get(key) as T;
    clear = () => this.cache.clear();
}