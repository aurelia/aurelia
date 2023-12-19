/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { DI, IDisposable, IEventAggregator, resolve } from '@aurelia/kernel';
import { IStorage } from './storage';

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
export const CacheEvents = {
    Set: 'au:fetch:cache:set',
    Get: 'au:fetch:cache:get',
    Clear: 'au:fetch:cache:clear',
    Reset: 'au:fetch:cache:reset',
    Dispose: 'au:fetch:cache:dispose',
    CacheHit: 'au:fetch:cache:hit',
    CacheMiss: 'au:fetch:cache:miss',
    CacheStale: 'au:fetch:cache:stale',
    CacheExpired: 'au:fetch:cache:expired',
} as const;

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
    private readonly ea = resolve(IEventAggregator);
    /** @internal */
    private readonly _subscribedEvents: IDisposable[] = [];

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

    public set<T>(key: string, value: T, options: Omit<CacheItem<T>, 'data'>) {
        const cacheItem = {
            data: value,
            ...options
        };
        this.setItem(key, cacheItem);
    }

    public get<T>(key: string): T | undefined {
        return this.getItem<T>(key)?.data;
    }

    public setItem<T>(key: string, value: CacheItem<T>) {
        value.lastCached = Date.now();
        this.storage.set(key, value);
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
        if (Date.now() > value.lastCached + value.staleTime) {
            this.ea.publish(CacheEvents.CacheStale, { key, value });
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
        this.ea.publish(CacheEvents.Reset);
    }

    public dispose(): void {
        this.clear();
        this._subscribedEvents.forEach(x => x.dispose());
        this.ea.publish(CacheEvents.Dispose);
    }
}
