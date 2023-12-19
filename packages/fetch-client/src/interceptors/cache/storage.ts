import { DI } from '@aurelia/kernel';
import { CacheItem } from './cach-service';
import { MemoryStorage } from './storage-memory';

export type IStorage = {
    delete: (key: string) => void;
    /** Returns true if there's a value associated with the given key */
    has: (key: string) => boolean;
    set: <T = unknown>(key: string, value: CacheItem<T>) => void;
    get: <T = unknown>(key: string) => CacheItem<T> | undefined;
    clear: () => void;
};

export const IStorage = /*@__PURE__*/DI.createInterface<IStorage>(x => x.singleton(MemoryStorage));
