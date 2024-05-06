import { resolve } from '@aurelia/kernel';
import { IFetchInterceptor } from '../../interfaces';
import { ICacheService } from './cach-service';

/** Default configuration which gets spread with overrides */
const defaultCacheConfig: ICacheConfiguration = {
  /** 5 minutes */
  cacheTime: 300_000,
  /** Always stale */
  staleTime: 0,
  refreshStaleImmediate : false,
  refreshInterval: 0
};

export interface ICacheConfiguration {
  cacheTime?: number;
  staleTime?: number;
  refreshStaleImmediate?: boolean;
  refreshInterval?: number;
}

/**
 * Interceptor that caches requests on success.
 */
export class CacheInterceptor implements IFetchInterceptor {
  public static readonly prefix = 'au:interceptor:';
  public static readonly cacheHeader = 'x-au-fetch-cache';

  /** @internal */
  private readonly _cacheService = resolve(ICacheService);
  /** @internal */
  private readonly _config: ICacheConfiguration;

  public constructor(config?: ICacheConfiguration) {
    this._config = { ...defaultCacheConfig, ...(config ?? {}) };
  }

  public request(request: Request): Request | Response | Promise<Request | Response> {
    this._cacheService.startBackgroundRefresh(this._config.refreshInterval);
    if (request.method !== 'GET') return request;
    const cacheItem = this._cacheService.get<Response & Record<string, boolean>>(this.key(request));
    return this.mark(cacheItem) ?? request;
  }

  public response(response: Response, request?: Request | undefined): Response | Promise<Response> {
    if (!request) {
      return response;
    }
    if (response.headers.has(CacheInterceptor.cacheHeader)) {
      return response;
    }
    const key = this.key(request);
    this._cacheService.setItem(key, {
      data: response,
      ...this._config
    }, request);

    if(this._config?.refreshStaleImmediate && this._config.staleTime! > 0) {
      this._cacheService.setStaleTimer(key, this._config.staleTime!, request);
    }

    return response;
  }

  public dispose(): void {
    this._cacheService.stopBackgroundRefresh();
  }

  private key(request: Request): string {
    return `${CacheInterceptor.prefix}${request.url}`;
  }

  private mark(response?: Response) {
    response?.headers.set(CacheInterceptor.cacheHeader, 'hit');
    return response;
  }
}
