import { DI, resolve, IContainer, factory, IPlatform, IEventAggregator } from '../../../kernel/dist/native-modules/index.mjs';

/**
 * Serialize an object to a JSON string. Useful for easily creating JSON fetch request bodies.
 *
 * @param body - The object to be serialized to JSON.
 * @param replacer - The JSON.stringify replacer used when serializing.
 * @returns A JSON string.
 */
function json(body, replacer) {
    return JSON.stringify((body !== undefined ? body : {}), replacer);
}

/**
 * A simple in-memory storage implementation for cache interceptor
 */
class MemoryStorage {
    constructor() {
        this.cache = new Map();
        this.delete = (key) => this.cache.delete(key);
        this.has = (key) => this.cache.has(key);
        this.set = (key, value) => this.cache.set(key, value);
        this.get = (key) => this.cache.get(key);
        this.clear = () => this.cache.clear();
    }
}

const ICacheStorage = /*@__PURE__*/ DI.createInterface(x => x.singleton(MemoryStorage));

/**
 * A class for configuring HttpClients.
 */
class HttpClientConfiguration {
    constructor() {
        /**
         * The base URL to be prepended to each Request's url before sending.
         */
        this.baseUrl = '';
        /**
         * Default values to apply to init objects when creating Requests. Note that
         * defaults cannot be applied when Request objects are manually created because
         * Request provides its own defaults and discards the original init object.
         * See also https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
         */
        this.defaults = {};
        /**
         * Interceptors to be added to the HttpClient.
         */
        this.interceptors = [];
        this.dispatcher = null;
        /** @internal */
        this._container = resolve(IContainer);
    }
    /**
     * Sets the baseUrl.
     *
     * @param baseUrl - The base URL.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    }
    /**
     * Sets the defaults.
     *
     * @param defaults - The defaults.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withDefaults(defaults) {
        this.defaults = defaults;
        return this;
    }
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
    withInterceptor(interceptor) {
        this.interceptors.push(interceptor);
        return this;
    }
    /**
     * Applies a configuration that addresses common application needs, including
     * configuring same-origin credentials, and using rejectErrorResponses.
     *
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    useStandardConfiguration() {
        const standardConfig = { credentials: 'same-origin' };
        Object.assign(this.defaults, standardConfig, this.defaults);
        return this.rejectErrorResponses();
    }
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
    rejectErrorResponses() {
        return this.withInterceptor({ response: rejectOnError });
    }
    withRetry(config) {
        const interceptor = this._container.invoke(RetryInterceptor, [config]);
        return this.withInterceptor(interceptor);
    }
    // public withCache(config?: ICacheConfiguration): HttpClientConfiguration {
    //   const interceptor = this._container.invoke(CacheInterceptor, [config]);
    //   return this.withInterceptor(interceptor);
    // }
    withDispatcher(dispatcher) {
        this.dispatcher = dispatcher;
        return this;
    }
}
function rejectOnError(response) {
    if (!response.ok) {
        throw response;
    }
    return response;
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => new Error(`AUR${String(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
    ;

const errorsMap = {
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    [5000 /* ErrorNames.http_client_fetch_fn_not_found */]: 'Could not resolve fetch function. Please provide a fetch function implementation or a polyfill for the global fetch function.',
    [5001 /* ErrorNames.http_client_configure_invalid_return */]: `The config callback did not return a valid HttpClientConfiguration like instance. Received {{0}}`,
    [5002 /* ErrorNames.http_client_configure_invalid_config */]: `invalid config, expecting a function or an object, received {{0}}`,
    [5004 /* ErrorNames.http_client_more_than_one_retry_interceptor */]: `Only one RetryInterceptor is allowed.`,
    [5005 /* ErrorNames.http_client_retry_interceptor_not_last */]: 'The retry interceptor must be the last interceptor defined.',
    [5003 /* ErrorNames.http_client_configure_invalid_header */]: 'Default headers must be a plain object.',
    [5006 /* ErrorNames.http_client_invalid_request_from_interceptor */]: `An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [{{{0}}]`,
    [5007 /* ErrorNames.retry_interceptor_invalid_exponential_interval */]: 'An interval less than or equal to 1 second is not allowed when using the exponential retry strategy. Received: {{0}}',
    [5008 /* ErrorNames.retry_interceptor_invalid_strategy */]: 'Invalid retry strategy: {{0}}',
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            value = String(value[method.slice(1)]);
                        }
                        else {
                            value = String(value);
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};

const absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;
/**
 * An interface to resolve what fetch function will be used for the http client
 * Default to the global fetch function via global `fetch` variable.
 */
const IFetchFn = /*@__PURE__*/ DI.createInterface('fetch', x => {
    if (typeof fetch !== 'function') {
        throw createMappedError(5000 /* ErrorNames.http_client_fetch_fn_not_found */);
    }
    return x.instance(fetch);
});
const IHttpClient = /*@__PURE__*/ DI.createInterface('IHttpClient', x => x.aliasTo(HttpClient));
/**
 * An HTTP client based on the Fetch API.
 */
class HttpClient {
    constructor() {
        /**
         * The current number of active requests.
         * Requests being processed by interceptors are considered active.
         */
        this.activeRequestCount = 0;
        /**
         * Indicates whether or not the client is currently making one or more requests.
         */
        this.isRequesting = false;
        /**
         * Indicates whether or not the client has been configured.
         */
        this.isConfigured = false;
        /**
         * The base URL set by the config.
         */
        this.baseUrl = '';
        /**
         * The default request init to merge with values specified at request time.
         */
        this.defaults = null;
        /**
         * @internal
         */
        this._interceptors = [];
        /** @internal */
        this._dispatcher = null;
        /** @internal */
        this._createConfiguration = resolve(factory(HttpClientConfiguration));
        /** @internal */
        this._fetchFn = resolve(IFetchFn);
    }
    /**
     * The interceptors to be run during requests.
     */
    get interceptors() {
        return this._interceptors.slice(0);
    }
    /**
     * Configure this client with default settings to be used by all requests.
     *
     * @param config - A configuration object, or a function that takes a config
     * object and configures it.
     * @returns The chainable instance of this HttpClient.
     * @chainable
     */
    configure(config) {
        let normalizedConfig;
        if (typeof config === 'object') {
            const requestInitConfiguration = { defaults: config };
            normalizedConfig = requestInitConfiguration;
        }
        else if (typeof config === 'function') {
            normalizedConfig = this._createConfiguration();
            normalizedConfig.baseUrl = this.baseUrl;
            normalizedConfig.defaults = { ...this.defaults };
            normalizedConfig.interceptors = this._interceptors;
            normalizedConfig.dispatcher = this._dispatcher;
            const c = config(normalizedConfig);
            if (c != null) {
                if (typeof c === 'object') {
                    normalizedConfig = c;
                }
                else {
                    throw createMappedError(5001 /* ErrorNames.http_client_configure_invalid_return */, typeof c);
                }
            }
        }
        else {
            throw createMappedError(5002 /* ErrorNames.http_client_configure_invalid_config */, typeof config);
        }
        const defaults = normalizedConfig.defaults;
        if (defaults?.headers instanceof Headers) {
            // Headers instances are not iterable in all browsers. Require a plain
            // object here to allow default headers to be merged into request headers.
            // extract throwing error into an utility function
            throw createMappedError(5003 /* ErrorNames.http_client_configure_invalid_header */);
        }
        const interceptors = normalizedConfig.interceptors;
        if (interceptors?.length > 0) {
            // find if there is a RetryInterceptor
            if (interceptors.filter(x => x instanceof RetryInterceptor).length > 1) {
                throw createMappedError(5004 /* ErrorNames.http_client_more_than_one_retry_interceptor */);
            }
            const retryInterceptorIndex = interceptors.findIndex(x => x instanceof RetryInterceptor);
            if (retryInterceptorIndex >= 0 && retryInterceptorIndex !== interceptors.length - 1) {
                throw createMappedError(5005 /* ErrorNames.http_client_retry_interceptor_not_last */);
            }
            // const cacheInterceptorIndex = interceptors.findIndex(x => x instanceof CacheInterceptor);
            // if (cacheInterceptorIndex >= 0) {
            //   if (retryInterceptorIndex > 0) {
            //     if (cacheInterceptorIndex < retryInterceptorIndex - 1) {
            //       throw new Error('The cache interceptor must be defined before the retry interceptor.');
            //     }
            //   } else {
            //     if (cacheInterceptorIndex !== interceptors.length - 1) {
            //       throw new Error('The cache interceptor is only allowed as the last interceptor or second last before the retry interceptor');
            //     }
            //   }
            // }
        }
        this.baseUrl = normalizedConfig.baseUrl;
        this.defaults = defaults;
        this._interceptors = normalizedConfig.interceptors ?? [];
        this._dispatcher = normalizedConfig.dispatcher;
        this.isConfigured = true;
        return this;
    }
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
    fetch(input, init) {
        this._trackRequestStart();
        let request = this.buildRequest(input, init);
        return this.processRequest(request, this._interceptors)
            .then(result => {
            let response;
            if (result instanceof Response) {
                response = Promise.resolve(result);
            }
            else if (result instanceof Request) {
                request = result;
                // if called directly, context of the fetch fn will be this HttpClient instance
                // which will throw illegal invokcation
                response = this._fetchFn.call(void 0, request);
            }
            else {
                throw createMappedError(5006 /* ErrorNames.http_client_invalid_request_from_interceptor */, result);
            }
            return this.processResponse(response, this._interceptors, request);
        })
            .then(result => {
            if (result instanceof Request) {
                return this.fetch(result);
            }
            return result;
        })
            .then(result => {
            this._trackRequestEnd();
            return result;
        }, error => {
            this._trackRequestEnd();
            throw error;
        });
    }
    /**
     * Creates a new Request object using the current configuration of this http client
     */
    buildRequest(input, init) {
        const defaults = this.defaults ?? {};
        let request;
        let body;
        let requestContentType;
        const parsedDefaultHeaders = parseHeaderValues(defaults.headers);
        if (input instanceof Request) {
            request = input;
            requestContentType = new Headers(request.headers).get('Content-Type');
        }
        else {
            if (!init) {
                init = {};
            }
            body = init.body;
            const bodyObj = body !== undefined ? { body: body } : null;
            const requestInit = { ...defaults, headers: {}, ...init, ...bodyObj };
            requestContentType = new Headers(requestInit.headers).get('Content-Type');
            request = new Request(getRequestUrl(this.baseUrl, input), requestInit);
        }
        if (!requestContentType) {
            if (new Headers(parsedDefaultHeaders).has('content-type')) {
                {
                    // eslint-disable-next-line no-console
                    console.warn('Request was created with header "content-type", converted to "Content-Type" instead.');
                }
                request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type'));
            }
            else if (body !== undefined && isJSON(body)) {
                request.headers.set('Content-Type', 'application/json');
            }
        }
        setDefaultHeaders(request.headers, parsedDefaultHeaders);
        if (body instanceof Blob && body.type) {
            // work around bug in IE & Edge where the Blob type is ignored in the request
            // https://connect.microsoft.com/IE/feedback/details/2136163
            request.headers.set('Content-Type', body.type);
        }
        return request;
    }
    /**
     * Calls fetch as a GET request.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    get(input, init) {
        return this.fetch(input, init);
    }
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
    post(input, body, init) {
        return this._callFetch(input, body, init, 'POST');
    }
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
    put(input, body, init) {
        return this._callFetch(input, body, init, 'PUT');
    }
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
    patch(input, body, init) {
        return this._callFetch(input, body, init, 'PATCH');
    }
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
    delete(input, body, init) {
        return this._callFetch(input, body, init, 'DELETE');
    }
    /**
     * Dispose and cleanup used resources of this client.
     */
    dispose() {
        this._interceptors.forEach(i => i.dispose?.());
        this._interceptors.length = 0;
        this._dispatcher = null;
    }
    /** @internal */
    _trackRequestStart() {
        this.isRequesting = !!(++this.activeRequestCount);
        if (this.isRequesting && this._dispatcher != null) {
            dispatch(this._dispatcher, HttpClientEvent.started);
        }
    }
    /** @internal */
    _trackRequestEnd() {
        this.isRequesting = !!(--this.activeRequestCount);
        if (!this.isRequesting && this._dispatcher != null) {
            dispatch(this._dispatcher, HttpClientEvent.drained);
        }
    }
    processRequest(request, interceptors) {
        return this._applyInterceptors(request, interceptors, 'request', 'requestError', Request, this);
    }
    processResponse(response, interceptors, request) {
        return this._applyInterceptors(response, interceptors, 'response', 'responseError', Response, request, this);
    }
    /** @internal */
    _applyInterceptors(input, interceptors, successName, errorName, Type, ...interceptorArgs) {
        return (interceptors ?? [])
            .reduce((chain, interceptor) => {
            const successHandler = interceptor[successName];
            const errorHandler = interceptor[errorName];
            return chain.then(successHandler ? (value => value instanceof Type ? successHandler.call(interceptor, value, ...interceptorArgs) : value) : identity, errorHandler ? (reason => errorHandler.call(interceptor, reason, ...interceptorArgs)) : thrower);
        }, Promise.resolve(input));
    }
    /** @internal */
    _callFetch(input, body, init, method) {
        if (!init) {
            init = {};
        }
        init.method = method;
        if (body != null) {
            init.body = body;
        }
        return this.fetch(input, init);
    }
}
function parseHeaderValues(headers) {
    const parsedHeaders = {};
    const $headers = headers ?? {};
    for (const name of Object.keys($headers)) {
        parsedHeaders[name] = (typeof $headers[name] === 'function')
            ? $headers[name]()
            : $headers[name];
    }
    return parsedHeaders;
}
function getRequestUrl(baseUrl, url) {
    if (absoluteUrlRegexp.test(url)) {
        return url;
    }
    return (baseUrl ?? '') + url;
}
function setDefaultHeaders(headers, defaultHeaders) {
    const $defaultHeaders = defaultHeaders ?? {};
    for (const name of Object.keys($defaultHeaders)) {
        if (!headers.has(name)) {
            headers.set(name, $defaultHeaders[name]);
        }
    }
}
function isJSON(str) {
    try {
        JSON.parse(str);
    }
    catch (err) {
        return false;
    }
    return true;
}
function identity(x) {
    return x;
}
function thrower(x) {
    throw x;
}
function dispatch(node, name) {
    const evt = new node.ownerDocument.defaultView.CustomEvent(name, { bubbles: true, cancelable: true });
    setTimeout(() => { node.dispatchEvent(evt); }, 1);
}
/**
 * A lookup containing events used by HttpClient.
 */
const HttpClientEvent = /*@__PURE__*/ Object.freeze({
    /**
     * Event to be triggered when a request is sent.
     */
    started: 'aurelia-fetch-client-request-started',
    /**
     * Event to be triggered when a request is completed.
     */
    drained: 'aurelia-fetch-client-requests-drained'
});

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
const ICacheService = /*@__PURE__*/ DI.createInterface(x => x.singleton(CacheService));
/**
 * Events that are published by the CacheService
 */
const CacheEvent = /*@__PURE__*/ Object.freeze({
    Set: 'au:fetch:cache:set',
    Get: 'au:fetch:cache:get',
    Clear: 'au:fetch:cache:clear',
    Reset: 'au:fetch:cache:reset',
    Dispose: 'au:fetch:cache:dispose',
    CacheHit: 'au:fetch:cache:hit',
    CacheMiss: 'au:fetch:cache:miss',
    CacheStale: 'au:fetch:cache:stale',
    CacheStaleRefreshed: 'au:fetch:cache:stale:refreshed',
    CacheExpired: 'au:fetch:cache:expired',
    CacheBackgroundRefreshed: 'au:fetch:cache:background:refreshed',
    CacheBackgroundRefreshing: 'au:fetch:cache:background:refreshing',
    CacheBackgroundStopped: 'au:fetch:cache:background:stopped',
});
/**
 * A service that can be used to cache data
 */
class CacheService {
    constructor() {
        this.storage = resolve(ICacheStorage);
        /** @internal */ this._platform = resolve(IPlatform);
        /** @internal */ this.ea = resolve(IEventAggregator);
        /** @internal */ this._httpClient = resolve(IHttpClient);
        /** @internal */ this._subscribedEvents = [];
        /** @internal */ this._interval = -1;
        /** @internal */ this._timeouts = [];
        /** @internal */ this._requestMap = new Map();
    }
    subscribe(event, callback) {
        const sub = this.ea.subscribe(event, callback);
        this._subscribedEvents.push(sub);
        return sub;
    }
    subscribeOnce(event, callback) {
        const sub = this.ea.subscribeOnce(event, callback);
        this._subscribedEvents.push(sub);
        return sub;
    }
    setStaleTimer(key, staleTime, request) {
        const timeoutId = this._platform.setTimeout(async () => {
            this.delete(key);
            await this._httpClient.get(request);
            const value = this.getItem(key);
            this.ea.publish(CacheEvent.CacheStaleRefreshed, { key, value });
            this._clearTimeout(timeoutId);
        }, staleTime);
        this._timeouts.push(timeoutId);
    }
    startBackgroundRefresh(timer) {
        if (!timer || this._interval > -1)
            return;
        this._interval = this._platform.setInterval(() => {
            this.ea.publish(CacheEvent.CacheBackgroundRefreshing);
            this._requestMap.forEach((req, key) => {
                this.delete(key);
                void this._httpClient.get(req).then(() => {
                    const value = this.getItem(key);
                    this.ea.publish(CacheEvent.CacheBackgroundRefreshed, { key, value });
                });
            });
        }, timer);
    }
    stopBackgroundRefresh() {
        this._platform.clearInterval(this._interval);
        this._interval = -1;
        this.ea.publish(CacheEvent.CacheBackgroundStopped);
    }
    set(key, value, options, request) {
        const cacheItem = {
            data: value,
            ...options
        };
        this.setItem(key, cacheItem, request);
    }
    get(key) {
        return this.getItem(key)?.data;
    }
    setItem(key, value, request) {
        value.lastCached = Date.now();
        this.storage.set(key, value);
        this._requestMap.set(key, request);
        this.ea.publish(CacheEvent.Set, { key, value });
    }
    /**
     * Tries to retrieve the item from the storage
     */
    getItem(key) {
        if (!this.storage.has(key)) {
            this.ea.publish(CacheEvent.CacheMiss, { key });
            return;
        }
        const value = this.storage.get(key);
        if (!value?.staleTime || !value?.lastCached) {
            this.ea.publish(CacheEvent.CacheHit, { key, value });
            return value;
        }
        const now = Date.now();
        if (now > value.lastCached + (value.staleTime ?? 0)) {
            this.ea.publish(CacheEvent.CacheStale, { key, value });
            return;
        }
        if (now > value.lastCached + (value.cacheTime ?? 0)) {
            this.ea.publish(CacheEvent.CacheExpired, { key, value });
            return;
        }
        this.ea.publish(CacheEvent.CacheHit, { key, value });
        return value;
    }
    delete(key) {
        this.storage.delete(key);
        this.ea.publish(CacheEvent.Clear, { key });
    }
    clear() {
        this.storage.clear();
        this._requestMap.clear();
        this.ea.publish(CacheEvent.Reset);
        this.stopBackgroundRefresh();
        this._timeouts.forEach(x => {
            this._platform.clearTimeout(x);
        });
        this._timeouts.length = 0;
    }
    dispose() {
        this.clear();
        this._subscribedEvents.forEach(x => x.dispose());
        this.ea.publish(CacheEvent.Dispose);
    }
    /** @internal */
    _clearTimeout(id) {
        this._platform.clearTimeout(id);
        const idx = this._timeouts.indexOf(id);
        if (idx > -1) {
            this._timeouts.splice(idx, 1);
        }
    }
}

/** Default configuration which gets spread with overrides */
const defaultCacheConfig = {
    /** 5 minutes */
    cacheTime: 300_000,
    /** Always stale */
    staleTime: 0,
    refreshStaleImmediate: false,
    refreshInterval: 0
};
/**
 * Interceptor that caches requests on success.
 */
class CacheInterceptor {
    constructor(config) {
        /** @internal */
        this._cacheService = resolve(ICacheService);
        this._config = { ...defaultCacheConfig, ...(config ?? {}) };
    }
    request(request) {
        this._cacheService.startBackgroundRefresh(this._config.refreshInterval);
        if (request.method !== 'GET')
            return request;
        const cacheItem = this._cacheService.get(this.key(request));
        return this.mark(cacheItem) ?? request;
    }
    response(response, request) {
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
        if (this._config?.refreshStaleImmediate && this._config.staleTime > 0) {
            this._cacheService.setStaleTimer(key, this._config.staleTime, request);
        }
        return response;
    }
    dispose() {
        this._cacheService.stopBackgroundRefresh();
    }
    key(request) {
        return `${CacheInterceptor.prefix}${request.url}`;
    }
    mark(response) {
        response?.headers.set(CacheInterceptor.cacheHeader, 'hit');
        return response;
    }
}
CacheInterceptor.prefix = 'au:interceptor:';
CacheInterceptor.cacheHeader = 'x-au-fetch-cache';

class BrowserIndexDBStorage {
    constructor() {
        this.cache = resolve(IPlatform).globalThis.indexedDB;
        this.getStore = () => this.database.transaction(BrowserIndexDBStorage.cacheName, 'readwrite').objectStore(BrowserIndexDBStorage.cacheName);
        this.delete = (key) => {
            const store = this.getStore();
            store.delete(key);
        };
        this.has = (key) => this.getStore().count(key).result > 0;
        this.set = (key, value) => this.getStore().put(value, key);
        this.get = (key) => this.getStore().get(key).result;
        this.clear = () => {
            const store = this.getStore();
            store.getAllKeys().result.forEach(key => {
                store.delete(key);
            });
        };
        this.database = this.cache.open(BrowserIndexDBStorage.cacheName).result;
    }
}
BrowserIndexDBStorage.cacheName = 'au-cache';

class BrowserStorage {
    constructor(cache) {
        this.cache = cache;
        this.delete = (key) => this.cache.removeItem(key);
        this.has = (key) => Object.keys(this.cache).some(x => x === key);
        this.set = (key, value) => this.cache.setItem(key, JSON.stringify(value));
        this.get = (key) => JSON.parse(this.cache.getItem(key) ?? 'null');
        this.clear = () => {
            Object.keys(this.cache).forEach(key => {
                if (!key.startsWith(CacheInterceptor.prefix))
                    return;
                this.cache.removeItem(key);
            });
        };
    }
}

/**
 * A simple browser local storage based storage implementation for cache interceptor
 */
class BrowserLocalStorage extends BrowserStorage {
    constructor() {
        super(resolve(IPlatform).globalThis.localStorage);
    }
}

/**
 * A simple browser session storage based storage implementation for cache interceptor
 */
class BrowserSessionStorage extends BrowserStorage {
    constructor() {
        super(resolve(IPlatform).globalThis.sessionStorage);
    }
}

/**
 * The strategy to use when retrying requests.
 */
const RetryStrategy = /*@__PURE__*/ Object.freeze({
    fixed: 0,
    incremental: 1,
    exponential: 2,
    random: 3
});
const defaultRetryConfig = {
    maxRetries: 3,
    interval: 1000,
    strategy: RetryStrategy.fixed
};
/**
 * Interceptor that retries requests on error, based on a given RetryConfiguration.
 */
class RetryInterceptor {
    /**
     * Creates an instance of RetryInterceptor.
     */
    constructor(retryConfig) {
        /** @internal */
        this.p = resolve(IPlatform);
        this.retryConfig = { ...defaultRetryConfig, ...(retryConfig ?? {}) };
        if (this.retryConfig.strategy === RetryStrategy.exponential
            && this.retryConfig.interval <= 1000) {
            throw createMappedError(5007 /* ErrorNames.retry_interceptor_invalid_exponential_interval */, this.retryConfig.interval);
        }
    }
    /**
     * Called with the request before it is sent. It remembers the request so it can be retried on error.
     *
     * @param request - The request to be sent.
     * @returns The existing request, a new request or a response; or a Promise for any of these.
     */
    request(request) {
        if (!request.retryConfig) {
            request.retryConfig = { ...this.retryConfig };
            request.retryConfig.counter = 0;
        }
        // do this on every request
        request.retryConfig.requestClone = request.clone();
        return request;
    }
    /**
     * Called with the response after it is received. Clears the remembered request, as it was succesfull.
     *
     * @param response - The response.
     * @returns The response; or a Promise for one.
     */
    response(response, request) {
        // retry was successful, so clean up after ourselves
        delete request.retryConfig;
        return response;
    }
    /**
     * Handles fetch errors and errors generated by previous interceptors. This
     * function acts as a Promise rejection handler. It wil retry the remembered request based on the
     * configured RetryConfiguration.
     *
     * @param error - The rejection value from the fetch request or from a
     * previous interceptor.
     * @returns The response of the retry; or a Promise for one.
     */
    responseError(error, request, httpClient) {
        const { retryConfig } = request;
        const { requestClone } = retryConfig;
        return Promise.resolve().then(() => {
            if (retryConfig.counter < retryConfig.maxRetries) {
                const result = retryConfig.doRetry != null ? retryConfig.doRetry(error, request) : true;
                return Promise.resolve(result).then(doRetry => {
                    if (doRetry) {
                        retryConfig.counter++;
                        const delay = calculateDelay(retryConfig);
                        return new Promise(resolve => this.p.setTimeout(resolve, !isNaN(delay) ? delay : 0))
                            .then(() => {
                            const newRequest = requestClone.clone();
                            if (typeof (retryConfig.beforeRetry) === 'function') {
                                return retryConfig.beforeRetry(newRequest, httpClient);
                            }
                            return newRequest;
                        })
                            .then(newRequest => {
                            const retryableRequest = { ...newRequest, retryConfig };
                            return httpClient.fetch(retryableRequest);
                        });
                    }
                    // no more retries, so clean up
                    delete request.retryConfig;
                    throw error;
                });
            }
            // no more retries, so clean up
            delete request.retryConfig;
            throw error;
        });
    }
}
function calculateDelay(retryConfig) {
    const { interval, strategy, minRandomInterval, maxRandomInterval, counter } = retryConfig;
    if (typeof (strategy) === 'function') {
        return retryConfig.strategy(counter);
    }
    switch (strategy) {
        case (RetryStrategy.fixed):
            return retryStrategies[RetryStrategy.fixed](interval);
        case (RetryStrategy.incremental):
            return retryStrategies[RetryStrategy.incremental](counter, interval);
        case (RetryStrategy.exponential):
            return retryStrategies[RetryStrategy.exponential](counter, interval);
        case (RetryStrategy.random):
            return retryStrategies[RetryStrategy.random](counter, interval, minRandomInterval, maxRandomInterval);
        default:
            throw createMappedError(5008 /* ErrorNames.retry_interceptor_invalid_strategy */, strategy);
    }
}
const retryStrategies = [
    // fixed
    interval => interval,
    // incremental
    (retryCount, interval) => interval * retryCount,
    // exponential
    (retryCount, interval) => retryCount === 1 ? interval : interval ** retryCount / 1000,
    // random
    (retryCount, interval, minRandomInterval = 0, maxRandomInterval = 60000) => {
        return Math.random() * (maxRandomInterval - minRandomInterval) + minRandomInterval;
    }
];

export { BrowserIndexDBStorage, BrowserLocalStorage, BrowserSessionStorage, CacheEvent, CacheInterceptor, CacheService, HttpClient, HttpClientConfiguration, HttpClientEvent, ICacheService, ICacheStorage, IFetchFn, IHttpClient, MemoryStorage, RetryInterceptor, RetryStrategy, json };
//# sourceMappingURL=index.dev.mjs.map
