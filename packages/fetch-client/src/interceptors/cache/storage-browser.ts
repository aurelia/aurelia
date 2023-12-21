import { CacheItem } from './cach-service';
import { CacheInterceptor } from './cache-interceptor';
import { IStorage } from './storage';

export class BrowserStorage implements IStorage
{
    public constructor(public readonly cache: Storage){  }
    public readonly delete = (key: string) => this.cache.removeItem(key);
    public readonly has = (key: string) => Object.keys(this.cache).some(x=> x === key);
    public readonly set = <T = unknown>(key: string, value: CacheItem<T>) => this.cache.setItem(key, JSON.stringify(value));
    public readonly get = <T = unknown>(key: string) => JSON.parse(this.cache.getItem(key) ?? 'null') as CacheItem<T> | undefined;
    public readonly clear = () => {
        Object.keys(this.cache).forEach(key => {
            if(!key.startsWith(CacheInterceptor.prefix)) return;
            this.cache.removeItem(key);
        });
    }
}
