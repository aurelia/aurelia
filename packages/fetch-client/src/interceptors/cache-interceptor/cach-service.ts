/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { DI, IDisposable, IEventAggregator, IPlatform, resolve } from '@aurelia/kernel';
import { IStorage } from './storage';
import { IHttpClient } from '../../http-client';

export type CacheItem<T = unknown> = {
    staleTime?: number;
    cacheTime?: number;
    lastCached?: number;
    data?: T;
};

export const ICacheService = /*@__PURE__*/DI.createInterface<CacheService>(x => x.singleton(CacheService));

/**
 * Events that are published by the CacheService
 */
export const CacheEvents = /*@__PURE__*/ Object.freeze({
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

type CacheChannels = typeof CacheEvents[keyof typeof CacheEvents];

export type CacheEvent<T> = {
    key: string;
    value: CacheItem<T>;
};

/**
 * A service that can be used to cache data
 */
export class CacheService implements IDisposable {

    private readonly storage = resolve(IStorage);
    /** @internal */ private readonly _platform = resolve(IPlatform);
    /** @internal */ private readonly ea = resolve(IEventAggregator);
    /** @internal */ private readonly _httpClient = resolve(IHttpClient);
    /** @internal */ private readonly _subscribedEvents: IDisposable[] = [];
    /** @internal */ private _interval = -1;
    /** @internal */ private readonly _timeouts: number[] = [];

    /** @internal */ private readonly _requestMap = new Map<string, Request>();

    public subscribe<T>(channel: CacheChannels, callback: (value: CacheEvent<T>) => void) {
        const event = this.ea.subscribe(channel, callback);
        this._subscribedEvents.push(event);
        return event;
    }

    public subscribeOnce<T>(channel: CacheChannels, callback: (value: CacheEvent<T>) => void) {
        const event = this.ea.subscribeOnce(channel, callback);
        this._subscribedEvents.push(event);
        return event;
    }

    public setStaleTimer(key: string, staleTime: number, request: Request) {
      const timeoutId = this._platform.setTimeout(async () => {
        this.delete(key);
        await this._httpClient.get(request);
        const value = this.getItem(key);
        this.ea.publish(CacheEvents.CacheStaleRefreshed, { key, value });

        this._clearTimeout(timeoutId);
      }, staleTime);
      this._timeouts.push(timeoutId);
    }

    public startBackgroundRefresh(timer?: number) {
      if(!timer || this._interval > -1) return;
      this._interval =  this._platform.setInterval(() => {
        this.ea.publish(CacheEvents.CacheBackgroundRefreshing);
        this._requestMap.forEach((req, key)=> {
          this.delete(key);
          void this._httpClient.get(req).then(() => {
            const value = this.getItem(key);
            this.ea.publish(CacheEvents.CacheBackgroundRefreshed, { key, value });
          });
        });
      }, timer);
    }

    public stopBackgroundRefresh() {
      this._platform.clearInterval(this._interval);
      this._interval = -1;
      this.ea.publish(CacheEvents.CacheBackgroundStopped);
    }

    public set<T>(key: string, value: T, options: Omit<CacheItem<T>, 'data'>, request: Request) {
        const cacheItem = {
            data: value,
            ...options
        };
        this.setItem(key, cacheItem, request);
    }

    public get<T>(key: string): T | undefined {
        return this.getItem<T>(key)?.data;
    }

    public setItem<T>(key: string, value: CacheItem<T>, request: Request) {
        value.lastCached = Date.now();
        this.storage.set(key, value);
        this._requestMap.set(key, request);
        this.ea.publish(CacheEvents.Set, { key, value });
    }

    /**
     * Tries to retrieve the item from the storage
     */
    public getItem<T>(key: string): CacheItem<T> | undefined {
        if (!this.storage.has(key)) {
            this.ea.publish(CacheEvents.CacheMiss, { key });
            return;
        }
        const value = this.storage.get<T>(key);
        if (!value?.staleTime || !value?.lastCached) {
            this.ea.publish(CacheEvents.CacheHit, { key, value });
            return value;
        }

        const now = Date.now();

        if (now > value.lastCached + (value.staleTime ?? 0)) {
            this.ea.publish(CacheEvents.CacheStale, { key, value });
            return;
        }

        if (now > value.lastCached + (value.cacheTime ?? 0)) {
            this.ea.publish(CacheEvents.CacheExpired, { key, value });
            return;
        }

        this.ea.publish(CacheEvents.CacheHit, { key, value });
        return value;
    }

    public delete(key: string) {
        this.storage.delete(key);
        this.ea.publish(CacheEvents.Clear, { key });
    }

    public clear() {
        this.storage.clear();
        this._requestMap.clear();
        this.ea.publish(CacheEvents.Reset);
        this.stopBackgroundRefresh();
        this._timeouts.forEach(x => {
          this._platform.clearTimeout(x);
        });
        this._timeouts.length = 0;
    }

    public dispose(): void {
        this.clear();
        this._subscribedEvents.forEach(x => x.dispose());
        this.ea.publish(CacheEvents.Dispose);
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
