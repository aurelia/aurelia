/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { DI, IDisposable, IEventAggregator, IPlatform, resolve } from '@aurelia/kernel';
import { ICacheStorage } from './storage';
import { IHttpClient } from '../../http-client';

export type ICacheItem<T = unknown> = {
    staleTime?: number;
    cacheTime?: number;
    lastCached?: number;
    data?: T;
};

export const ICacheService = /*@__PURE__*/DI.createInterface<CacheService>(x => x.singleton(CacheService));

/**
 * Events that are published by the CacheService
 */
export const CacheEvent = /*@__PURE__*/ Object.freeze({
    Set: 'au:fetch:cache:set',
    Get: 'au:fetch:cache:get',
    Clear: 'au:fetch:cache:clear',
    Reset: 'au:fetch:cache:reset',
    Dispose: 'au:fetch:cache:dispose',
    CacheHit: 'au:fetch:cache:hit',
    CacheMiss: 'au:fetch:cache:miss',
    CacheStale: 'au:fetch:cache:stale',
    CacheStaleRefreshed: 'au:fetch:cache:stale:refreshed',
    CacheExpired: 'au:fetch:cache:expired',
    CacheBackgroundRefreshed: 'au:fetch:cache:background:refreshed',
    CacheBackgroundRefreshing: 'au:fetch:cache:background:refreshing',
    CacheBackgroundStopped: 'au:fetch:cache:background:stopped',
});

export type CacheEvent = typeof CacheEvent[keyof typeof CacheEvent];

export type ICacheEventData<T> = {
    key: string;
    value: ICacheItem<T>;
};

/**
 * A service that can be used to cache data
 */
export class CacheService implements IDisposable {

    private readonly storage = resolve(ICacheStorage);
    /** @internal */ private readonly _platform = resolve(IPlatform);
    /** @internal */ private readonly ea = resolve(IEventAggregator);
    /** @internal */ private readonly _httpClient = resolve(IHttpClient);
    /** @internal */ private readonly _subscribedEvents: IDisposable[] = [];
    /** @internal */ private _interval = -1;
    /** @internal */ private readonly _timeouts: number[] = [];

    /** @internal */ private readonly _requestMap = new Map<string, Request>();

    public subscribe<T>(event: CacheEvent, callback: (value: ICacheEventData<T>) => void) {
        const sub = this.ea.subscribe(event, callback);
        this._subscribedEvents.push(sub);
        return sub;
    }

    public subscribeOnce<T>(event: CacheEvent, callback: (value: ICacheEventData<T>) => void) {
        const sub = this.ea.subscribeOnce(event, callback);
        this._subscribedEvents.push(sub);
        return sub;
    }

    public setStaleTimer(key: string, staleTime: number, request: Request) {
      const timeoutId = this._platform.setTimeout(async () => {
        this.delete(key);
        await this._httpClient.get(request);
        const value = this.getItem(key);
        this.ea.publish(CacheEvent.CacheStaleRefreshed, { key, value });

        this._clearTimeout(timeoutId);
      }, staleTime);
      this._timeouts.push(timeoutId);
    }

    public startBackgroundRefresh(timer?: number) {
      if(!timer || this._interval > -1) return;
      this._interval =  this._platform.setInterval(() => {
        this.ea.publish(CacheEvent.CacheBackgroundRefreshing);
        this._requestMap.forEach((req, key)=> {
          this.delete(key);
          void this._httpClient.get(req).then(() => {
            const value = this.getItem(key);
            this.ea.publish(CacheEvent.CacheBackgroundRefreshed, { key, value });
          });
        });
      }, timer);
    }

    public stopBackgroundRefresh() {
      this._platform.clearInterval(this._interval);
      this._interval = -1;
      this.ea.publish(CacheEvent.CacheBackgroundStopped);
    }

    public set<T>(key: string, value: T, options: Omit<ICacheItem<T>, 'data'>, request: Request) {
        const cacheItem = {
            data: value,
            ...options
        };
        this.setItem(key, cacheItem, request);
    }

    public get<T>(key: string): T | undefined {
        return this.getItem<T>(key)?.data;
    }

    public setItem<T>(key: string, value: ICacheItem<T>, request: Request) {
        value.lastCached = Date.now();
        this.storage.set(key, value);
        this._requestMap.set(key, request);
        this.ea.publish(CacheEvent.Set, { key, value });
    }

    /**
     * Tries to retrieve the item from the storage
     */
    public getItem<T>(key: string): ICacheItem<T> | undefined {
        if (!this.storage.has(key)) {
            this.ea.publish(CacheEvent.CacheMiss, { key });
            return;
        }
        const value = this.storage.get<T>(key);
        if (!value?.staleTime || !value?.lastCached) {
            this.ea.publish(CacheEvent.CacheHit, { key, value });
            return value;
        }

        const now = Date.now();

        if (now > value.lastCached + (value.staleTime ?? 0)) {
            this.ea.publish(CacheEvent.CacheStale, { key, value });
            return;
        }

        if (now > value.lastCached + (value.cacheTime ?? 0)) {
            this.ea.publish(CacheEvent.CacheExpired, { key, value });
            return;
        }

        this.ea.publish(CacheEvent.CacheHit, { key, value });
        return value;
    }

    public delete(key: string) {
        this.storage.delete(key);
        this.ea.publish(CacheEvent.Clear, { key });
    }

    public clear() {
        this.storage.clear();
        this._requestMap.clear();
        this.ea.publish(CacheEvent.Reset);
        this.stopBackgroundRefresh();
        this._timeouts.forEach(x => {
          this._platform.clearTimeout(x);
        });
        this._timeouts.length = 0;
    }

    public dispose(): void {
        this.clear();
        this._subscribedEvents.forEach(x => x.dispose());
        this.ea.publish(CacheEvent.Dispose);
    }

    /** @internal */
    private _clearTimeout(id: number) {
      this._platform.clearTimeout(id);
      const idx = this._timeouts.indexOf(id);
      if (idx > -1) {
        this._timeouts.splice(idx, 1);
      }
    }
}
