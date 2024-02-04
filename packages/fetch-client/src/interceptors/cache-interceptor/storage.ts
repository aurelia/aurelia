import { DI } from '@aurelia/kernel';
import { ICacheItem } from './cach-service';
import { MemoryStorage } from './storage-memory';

export interface ICacheStorage {
    delete: (key: string) => void;
    /** Returns true if there's a value associated with the given key */
    has: (key: string) => boolean;
    set: <T = unknown>(key: string, value: ICacheItem<T>) => void;
    get: <T = unknown>(key: string) => ICacheItem<T> | undefined;
    clear: () => void;
}

export const ICacheStorage = /*@__PURE__*/DI.createInterface<ICacheStorage>(x => x.singleton(MemoryStorage));
