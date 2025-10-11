export type RestResourceCacheKey = string;

export interface RestResourceCacheEntry<TValue = unknown> {
  value: TValue;
  expiresAt: number | null;
  etag?: string;
  status?: number;
  headers?: [string, string][];
}

export interface IRestResourceCache {
  get<TValue = unknown>(key: RestResourceCacheKey): RestResourceCacheEntry<TValue> | undefined;
  set<TValue = unknown>(key: RestResourceCacheKey, entry: RestResourceCacheEntry<TValue>): void;
  delete(key: RestResourceCacheKey): void;
  clear(): void;
}

export type RestResourceCacheOperation =
  | 'list'
  | 'getOne'
  | 'getMany'
  | 'create'
  | 'update'
  | 'replace'
  | 'patch'
  | 'delete';

export interface RestResourceCacheOptions {
  /**
   * Time to live in milliseconds. Default: no expiration.
   */
  ttl?: number | null;

  /**
   * Which operations participate in caching. Default: ['list', 'getOne'].
   */
  operations?: RestResourceCacheOperation[];

  /**
   * Whether to cache empty responses (default true).
   */
  cacheEmptyResponses?: boolean;
}

export class MemoryRestResourceCache implements IRestResourceCache {
  private readonly cache = new Map<RestResourceCacheKey, RestResourceCacheEntry>();

  public get<TValue = unknown>(key: RestResourceCacheKey): RestResourceCacheEntry<TValue> | undefined {
    const entry = this.cache.get(key) as RestResourceCacheEntry<TValue> | undefined;
    if (entry == null) {
      return undefined;
    }
    if (entry.expiresAt != null && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry;
  }

  public set<TValue = unknown>(key: RestResourceCacheKey, entry: RestResourceCacheEntry<TValue>): void {
    this.cache.set(key, entry);
  }

  public delete(key: RestResourceCacheKey): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}
