import { resolve } from '@aurelia/kernel';
import { CacheConfiguration, Interceptor } from '../../interfaces';
import { ICacheService } from './cach-service';

/** Default configuration which gets spread with overrides */
const defaultCacheConfig: CacheConfiguration = {
    /** 5 minutes */
    cacheTime: 300_000,
    /** Always stale */
    staleTime: 0
};

/**
 * Interceptor that caches requests on success.
 */
export class CacheInterceptor implements Interceptor {
    public static readonly prefix = 'au:interceptor:';

    /** @internal */
    private readonly _cacheService = resolve(ICacheService);
    /** @internal */
    private readonly _config?: CacheConfiguration;

    public constructor(config?: CacheConfiguration) {
        this._config = { ...defaultCacheConfig, ...(config ?? {}) };
    }

    public request(request: Request): Request | Response | Promise<Request | Response> {
        if (request.method !== 'GET') return request;
        const cacheItem = this._cacheService.get<Response>(this.key(request));
        return cacheItem ?? request;
    }

    public response(response: Response, request?: Request | undefined): Response | Promise<Response> {
        if (!request) {
            return response;
        }
        this._cacheService.setItem(this.key(request), {
            data: response,
            ...this._config
        });
        return response;
    }

    private key(request: Request): string {
        return `${CacheInterceptor.prefix}${request.url}`;
    }
}
