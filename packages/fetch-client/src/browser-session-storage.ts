import { DI, IPlatform, resolve } from '@aurelia/kernel';
import { CacheItem, IStorage } from './cach-service';

export const IBrowserSessionStorage = DI.createInterface<BrowserSessionStorage>();
export class BrowserSessionStorage implements IStorage{
    cache = resolve(IPlatform).globalThis.sessionStorage;
    delete = (key: string) => this.cache.removeItem(key);
    set = <T = unknown>(key: string, value: CacheItem<T>) => this.cache.set(key, value);
    get = <T = unknown>(key: string) => this.cache.get(key) as T;
    clear = () => this.cache.clear();
}