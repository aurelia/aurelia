import { DI, IContainer, Registration } from '@aurelia/kernel';

export type ICacheService = CacheService;
export const ICacheService = DI.createInterface<ICacheService>('CacheService');

/**
 * A service that provides storage and retrieval of cached items.
 */
export class CacheService {
  private readonly cache = new Map<string, unknown>();

  public setItem(key: string, item: unknown): void {
    this.cache.set(key, item);
  }

  public getItem(key: string): unknown | undefined {
    return this.cache.get(key);
  }

  public static register(container: IContainer) {
    Registration.singleton(ICacheService, CacheService).register(container);
  }
}