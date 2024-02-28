import { ICacheItem } from './cach-service';
import { CacheInterceptor } from './cache-interceptor';
import { ICacheStorage } from './storage';

export class BrowserStorage implements ICacheStorage {
    public constructor(public readonly cache: Storage) {  }
    public readonly delete = (key: string) => this.cache.removeItem(key);
    public readonly has = (key: string) => Object.keys(this.cache).some(x=> x === key);
    public readonly set = <T = unknown>(key: string, value: ICacheItem<T>) => this.cache.setItem(key, JSON.stringify(value));
    public readonly get = <T = unknown>(key: string) => JSON.parse(this.cache.getItem(key) ?? 'null') as ICacheItem<T> | undefined;
    public readonly clear = () => {
        Object.keys(this.cache).forEach(key => {
            if(!key.startsWith(CacheInterceptor.prefix)) return;
            this.cache.removeItem(key);
        });
    };
}
