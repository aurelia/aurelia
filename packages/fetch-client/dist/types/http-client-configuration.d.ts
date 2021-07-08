import { Interceptor, RetryConfiguration } from './interfaces.js';
/**
 * A class for configuring HttpClients.
 */
export declare class HttpClientConfiguration {
    /**
     * The base URL to be prepended to each Request's url before sending.
     */
    baseUrl: string;
    /**
     * Default values to apply to init objects when creating Requests. Note that
     * defaults cannot be applied when Request objects are manually created because
     * Request provides its own defaults and discards the original init object.
     * See also https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
     */
    defaults: RequestInit;
    /**
     * Interceptors to be added to the HttpClient.
     */
    interceptors: Interceptor[];
    dispatcher: Node | null;
    /**
     * Sets the baseUrl.
     *
     * @param baseUrl - The base URL.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withBaseUrl(baseUrl: string): HttpClientConfiguration;
    /**
     * Sets the defaults.
     *
     * @param defaults - The defaults.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withDefaults(defaults: RequestInit): HttpClientConfiguration;
    /**
     * Adds an interceptor to be run on all requests or responses.
     *
     * @param interceptor - An object with request, requestError,
     * response, or responseError methods. request and requestError act as
     * resolve and reject handlers for the Request before it is sent.
     * response and responseError act as resolve and reject handlers for
     * the Response after it has been received.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withInterceptor(interceptor: Interceptor): HttpClientConfiguration;
    /**
     * Applies a configuration that addresses common application needs, including
     * configuring same-origin credentials, and using rejectErrorResponses.
     *
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    useStandardConfiguration(): HttpClientConfiguration;
    /**
     * Causes Responses whose status codes fall outside the range 200-299 to reject.
     * The fetch API only rejects on network errors or other conditions that prevent
     * the request from completing, meaning consumers must inspect Response.ok in the
     * Promise continuation to determine if the server responded with a success code.
     * This method adds a response interceptor that causes Responses with error codes
     * to be rejected, which is common behavior in HTTP client libraries.
     *
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    rejectErrorResponses(): HttpClientConfiguration;
    withRetry(config?: RetryConfiguration): HttpClientConfiguration;
    withDispatcher(dispatcher: Node): HttpClientConfiguration;
}
//# sourceMappingURL=http-client-configuration.d.ts.map