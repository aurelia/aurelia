import { DI } from '@aurelia/kernel';
import { CacheItem, IStorage } from './cach-service';

export const IMemoryStorage = DI.createInterface<MemoryStorage>();
export class MemoryStorage implements IStorage{
    cache = new Map<string, unknown>();
    delete = (key: string) => this.cache.delete(key);
    set = <T = unknown>(key: string, value: CacheItem<T>) => this.cache.set(key, value);
    get = <T = unknown>(key: string) => this.cache.get(key) as T;
    clear = () => this.cache.clear();
}