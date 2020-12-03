import { HttpClientConfiguration } from './http-client-configuration.js';
import { Interceptor } from './interfaces.js';
export declare const IHttpClient: import("@aurelia/kernel").InterfaceSymbol<IHttpClient>;
export interface IHttpClient extends HttpClient {
}
/**
 * An HTTP client based on the Fetch API.
 */
export declare class HttpClient {
    /**
     * The current number of active requests.
     * Requests being processed by interceptors are considered active.
     */
    activeRequestCount: number;
    /**
     * Indicates whether or not the client is currently making one or more requests.
     */
    isRequesting: boolean;
    /**
     * Indicates whether or not the client has been configured.
     */
    isConfigured: boolean;
    /**
     * The base URL set by the config.
     */
    baseUrl: string;
    /**
     * The default request init to merge with values specified at request time.
     */
    defaults: RequestInit | null;
    /**
     * The interceptors to be run during requests.
     */
    interceptors: Interceptor[];
    dispatcher: Node | null;
    /**
     * Creates an instance of HttpClient.
     */
    constructor();
    /**
     * Configure this client with default settings to be used by all requests.
     *
     * @param config - A configuration object, or a function that takes a config
     * object and configures it.
     * @returns The chainable instance of this HttpClient.
     * @chainable
     */
    configure(config: RequestInit | ((config: HttpClientConfiguration) => HttpClientConfiguration) | HttpClientConfiguration): HttpClient;
    /**
     * Starts the process of fetching a resource. Default configuration parameters
     * will be applied to the Request. The constructed Request will be passed to
     * registered request interceptors before being sent. The Response will be passed
     * to registered Response interceptors before it is returned.
     *
     * See also https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    fetch(input: Request | string, init?: RequestInit): Promise<Response>;
    buildRequest(input: string | Request, init: RequestInit | undefined): Request;
    /**
     * Calls fetch as a GET request.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    get(input: Request | string, init?: RequestInit): Promise<Response>;
    /**
     * Calls fetch with request method set to POST.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    post(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response>;
    /**
     * Calls fetch with request method set to PUT.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    put(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response>;
    /**
     * Calls fetch with request method set to PATCH.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    patch(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response>;
    /**
     * Calls fetch with request method set to DELETE.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    delete(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response>;
    private trackRequestStart;
    private trackRequestEnd;
    private processRequest;
    private processResponse;
    private applyInterceptors;
    private callFetch;
}
//# sourceMappingURL=http-client.d.ts.map