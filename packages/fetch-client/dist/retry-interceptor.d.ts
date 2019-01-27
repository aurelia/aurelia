import { HttpClient } from './http-client';
import { Interceptor, RetryConfiguration } from './interfaces';
export declare const retryStrategy: {
    fixed: 0;
    incremental: 1;
    exponential: 2;
    random: 3;
};
export declare class RetryInterceptor implements Interceptor {
    retryConfig: RetryConfiguration;
    constructor(retryConfig?: RetryConfiguration);
    request(request: Request): Request;
    response(response: Response, request: Request): Response;
    responseError(error: Response, request: Request, httpClient: HttpClient): Promise<Response>;
}
//# sourceMappingURL=retry-interceptor.d.ts.map