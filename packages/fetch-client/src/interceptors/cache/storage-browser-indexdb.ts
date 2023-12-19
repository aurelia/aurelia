import { IPlatform, resolve } from '@aurelia/kernel';
import { CacheItem } from './cach-service';
import { IStorage } from './storage';
import { CacheInterceptor } from './cache-interceptor';

export class BrowserIndexDBStorage implements IStorage {
  public readonly cache = resolve(IPlatform).globalThis.indexedDB;
  private readonly database: IDBDatabase;
  public static cacheName = 'au-cache';
  constructor(){
    this.database = this.cache.open(BrowserIndexDBStorage.cacheName).result;
  }

  getStore = () => this.database.transaction(BrowserIndexDBStorage.cacheName, 'readwrite').objectStore(BrowserIndexDBStorage.cacheName);

  delete = (key: string) => {
    const store = this.getStore();
    store.delete(key);
  };

  has = (key: string) => this.getStore().count(key).result > 0;
  set = <T = unknown>(key: string, value: CacheItem<T>) =>this.getStore().put(value, key);
  get = <T = unknown>(key: string) => this.getStore().get(key).result as CacheItem<T> | undefined;
  clear = () => {
    const store = this.getStore();
    store.getAllKeys().result.forEach(key =>{
      store.delete(key);
    })
  };

}
