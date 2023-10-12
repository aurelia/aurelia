import { DI } from '@aurelia/kernel';
import { CacheItem } from './cach-service';

export type IStorage = {
    delete: (key: string) => void;
    set: <T = unknown>(key: string, value: CacheItem<T>) => void;
    get: <T = unknown>(key: string) => CacheItem<T>;
    clear: () => void;
}

export const IStorage = /*@__PURE__*/DI.createInterface<IStorage>();