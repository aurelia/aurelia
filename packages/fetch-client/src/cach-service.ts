import { BrowserLocalStorage } from './browser-local-storage';
import { HttpClient } from './http-client';
import { Interceptor, RetryableRequest, RetryConfiguration } from './interfaces';
import { DI, IContainer, IDisposable, IEventAggregator, Registration, resolve } from '@aurelia/kernel';

export type CacheItem<T = unknown> = {
    staleTime?: number;
    cacheTime?: number;
    lastCached?: number;
    data?: T
}

export type IStorage = {
    delete: (key: string) => void;
    set: <T = unknown>(key: string, value: CacheItem<T>) => void;
    get: <T = unknown>(key: string) => CacheItem<T>;
    clear: () => void;
}

export const IStorage = DI.createInterface<IStorage>();
export const ICacheService = DI.createInterface<CacheService>();


export const CacheEvents = {
    Set: 'au:cache:set',
    Get: 'au:cache:get',
    Clear: 'au:cache:clear',
    Reset: 'au:cache:reset',
    CacheHit: 'au:cache:hit',
    CacheMiss: 'au:cache:miss',
    CacheStale: 'au:cache:stale',
    CacheExpired: 'au:cache:expired',
} as const

type CacheChannels = typeof CacheEvents[keyof typeof CacheEvents];

export type CacheEvent<T> = {
    key: string,
    value: CacheItem<T>,
}

/**
 * Interceptor that caches requests on success.
 */
export class CacheService implements IDisposable {
    private readonly storage = resolve(IStorage);
    private readonly events = resolve(IEventAggregator);
    private subscribedEvents: IDisposable[] = [];

    public subscribe<T>(channel: CacheChannels, callback: (value: CacheEvent<T>) => void) {
        const event = this.events.subscribe(channel, callback);
        this.subscribedEvents.push(event);
        return event;
    }

    public subscribeOnce<T>(channel: CacheChannels, callback: (value: CacheEvent<T>) => void) {
        const event = this.events.subscribeOnce(channel, callback);
        this.subscribedEvents.push(event);
        return event;
    }

    public set<T>(key: string, value: T, options: Omit<CacheItem<T>, 'data'>) {
        const cacheItem = {
            data: value,
            ...options
        };
        this.setItem(key, cacheItem);
        this.events.publish('')
    }

    public setItem<T>(key: string, value: CacheItem<T>) {
        value.lastCached = Date.now();
        this.storage.set(key, value);

        if (value.cacheTime) {
            setTimeout(() => {
                this.events.publish(CacheEvents.CacheExpired, { key, value });
                this.delete(key);

            }, value.cacheTime);
        }
        this.events.publish(CacheEvents.Set, { key, value })
    }

    public get<T>(key: string): T | undefined {
        return this.getItem<T>(key)?.data;
    }

    /**
     * Tries to retrieve the item from the 
     * @param key 
     * @returns 
     */
    public getItem<T>(key: string): CacheItem<T> | undefined {
        const value = this.storage.get<T>(key);
        if (!value) {
            this.events.publish(CacheEvents.CacheMiss, { key })
            return;
        }
        if (!value.staleTime || !value.lastCached) {
            this.events.publish(CacheEvents.CacheHit, { key, value })
            return value;
        }
        if (Date.now() > value.lastCached + value.staleTime) {
            this.events.publish(CacheEvents.CacheStale, { key, value })
        };

        this.events.publish(CacheEvents.CacheHit, { key, value })
        return value;
    }

    public delete(key: string) {
        this.storage.delete(key);
        this.events.publish(CacheEvents.Clear, { key });
    }

    public clear() {
        this.storage.clear();
        this.events.publish(CacheEvents.Reset);
    }

    public dispose(): void {
        this.subscribedEvents.forEach(x => {
            try { x.dispose() } catch { }
        });
    }

    public static register(container: IContainer) {
        Registration.singleton(IStorage, BrowserLocalStorage).register(container);
    }
}