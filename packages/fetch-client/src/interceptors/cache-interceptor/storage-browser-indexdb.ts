import { IPlatform, resolve } from '@aurelia/kernel';
import { ICacheItem } from './cach-service';
import { ICacheStorage } from './storage';

export class BrowserIndexDBStorage implements ICacheStorage {
  public readonly cache = resolve(IPlatform).globalThis.indexedDB;
  private readonly database: IDBDatabase;
  public static cacheName = 'au-cache';
  public constructor(){
    this.database = this.cache.open(BrowserIndexDBStorage.cacheName).result;
  }

  public readonly getStore = () => this.database.transaction(BrowserIndexDBStorage.cacheName, 'readwrite').objectStore(BrowserIndexDBStorage.cacheName);

  public readonly delete = (key: string) => {
    const store = this.getStore();
    store.delete(key);
  };

  public readonly has = (key: string) => this.getStore().count(key).result > 0;
  public readonly set = <T = unknown>(key: string, value: ICacheItem<T>) =>this.getStore().put(value, key);
  public readonly get = <T = unknown>(key: string) => this.getStore().get(key).result as ICacheItem<T> | undefined;
  public readonly clear = () => {
    const store = this.getStore();
    store.getAllKeys().result.forEach(key =>{
      store.delete(key);
    });
  };

}
