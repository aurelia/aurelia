import { ICacheItem } from './cach-service';
import { ICacheStorage } from './storage';

/**
 * A simple in-memory storage implementation for cache interceptor
 */
export class MemoryStorage implements ICacheStorage {
    public readonly cache = new Map<string, unknown>();
    public readonly delete = (key: string) => this.cache.delete(key);
    public readonly has = (key: string) => this.cache.has(key);
    public readonly set = <T = unknown>(key: string, value: ICacheItem<T>) => this.cache.set(key, value);
    public readonly get = <T = unknown>(key: string) => this.cache.get(key) as T;
    public readonly clear = () => this.cache.clear();
}
