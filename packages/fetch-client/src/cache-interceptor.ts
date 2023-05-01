import { CacheService, ICacheService } from './cach-service';
import { HttpClient } from './http-client';
import { CacheConfiguration, Interceptor, RetryableRequest, RetryConfiguration } from './interfaces';
import { DI, IContainer, Registration, resolve } from '@aurelia/kernel';

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
    private readonly cacheService = resolve(ICacheService);
    static readonly prefix = 'au:interceptor:';
    private config?: CacheConfiguration;

    constructor(config?: CacheConfiguration) {
        this.config = { ...defaultCacheConfig, ...(config ?? {}) }
    }

    public request(request: Request): Request | Response | Promise<Request | Response> {
        if (request.method !== 'GET') return request;
        const cacheItem = this.cacheService.get<Response>(`${CacheInterceptor.prefix}${request.url}`);
        return cacheItem ?? request;
    }

    public response(response: Response, request?: Request | undefined): Response | Promise<Response> {
        if (!request) return response;
        this.cacheService.setItem(request.url, {
            data: response,
            ...this.config
        });
        return response;
    }
    
    public static register(container: IContainer) {
        Registration.singleton(ICacheService, CacheService).register(container);
    }
}