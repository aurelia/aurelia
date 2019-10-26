import { IDOM } from '@aurelia/runtime';
import { DOM } from '@aurelia/runtime-html';
import { HttpClientConfiguration } from './http-client-configuration';
import { RetryInterceptor } from './retry-interceptor';
const absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;
/**
 * An HTTP client based on the Fetch API.
 */
export class HttpClient {
    /**
     * Creates an instance of HttpClient.
     */
    constructor(dom) {
        if (dom.window.fetch === undefined) {
            throw new Error('HttpClient requires a Fetch API implementation, but the current environment doesn\'t support it. You may need to load a polyfill such as https://github.com/github/fetch');
        }
        this.dom = dom;
        this.activeRequestCount = 0;
        this.isRequesting = false;
        this.isConfigured = false;
        this.baseUrl = '';
        this.defaults = null;
        this.interceptors = [];
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
            normalizedConfig = new HttpClientConfiguration();
            normalizedConfig.baseUrl = this.baseUrl;
            normalizedConfig.defaults = { ...this.defaults };
            normalizedConfig.interceptors = this.interceptors;
            const c = config(normalizedConfig);
            if (Object.prototype.isPrototypeOf.call(HttpClientConfiguration, c)) {
                normalizedConfig = c;
            }
        }
        else {
            throw new Error('invalid config');
        }
        const defaults = normalizedConfig.defaults;
        if (defaults !== undefined && Object.prototype.isPrototypeOf.call(Headers, defaults.headers)) {
            // Headers instances are not iterable in all browsers. Require a plain
            // object here to allow default headers to be merged into request headers.
            throw new Error('Default headers must be a plain object.');
        }
        const interceptors = normalizedConfig.interceptors;
        if (interceptors !== undefined && interceptors.length) {
            // find if there is a RetryInterceptor
            if (interceptors.filter(x => Object.prototype.isPrototypeOf.call(RetryInterceptor, x)).length > 1) {
                throw new Error('Only one RetryInterceptor is allowed.');
            }
            const retryInterceptorIndex = interceptors.findIndex(x => Object.prototype.isPrototypeOf.call(RetryInterceptor, x));
            if (retryInterceptorIndex >= 0 && retryInterceptorIndex !== interceptors.length - 1) {
                throw new Error('The retry interceptor must be the last interceptor defined.');
            }
        }
        this.baseUrl = normalizedConfig.baseUrl;
        this.defaults = defaults;
        this.interceptors = normalizedConfig.interceptors !== undefined ? normalizedConfig.interceptors : [];
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
        this.trackRequestStart();
        let request = this.buildRequest(input, init);
        return this.processRequest(request, this.interceptors).then(result => {
            let response;
            if (Object.prototype.isPrototypeOf.call(Response, result)) {
                response = Promise.resolve(result);
            }
            else if (Object.prototype.isPrototypeOf.call(Request, result)) {
                request = result;
                response = fetch(request);
            }
            else {
                throw new Error(`An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [${result}]`);
            }
            return this.processResponse(response, this.interceptors, request);
        })
            .then(result => {
            if (Object.prototype.isPrototypeOf.call(Request, result)) {
                return this.fetch(result);
            }
            return result;
        })
            .then(result => {
            this.trackRequestEnd();
            return result;
        }, error => {
            this.trackRequestEnd();
            throw error;
        });
    }
    buildRequest(input, init) {
        const defaults = this.defaults !== null ? this.defaults : {};
        let request;
        let body;
        let requestContentType;
        const parsedDefaultHeaders = parseHeaderValues(defaults.headers);
        if (Object.prototype.isPrototypeOf.call(Request, input)) {
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
                request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type'));
            }
            else if (body !== undefined && isJSON(body)) {
                request.headers.set('Content-Type', 'application/json');
            }
        }
        setDefaultHeaders(request.headers, parsedDefaultHeaders);
        if (body !== undefined && Object.prototype.isPrototypeOf.call(Blob, body) && body.type) {
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
        return this.callFetch(input, body, init, 'POST');
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
        return this.callFetch(input, body, init, 'PUT');
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
        return this.callFetch(input, body, init, 'PATCH');
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
        return this.callFetch(input, body, init, 'DELETE');
    }
    trackRequestStart() {
        this.isRequesting = !!(++this.activeRequestCount);
        if (this.isRequesting) {
            const evt = DOM.createCustomEvent('aurelia-fetch-client-request-started', { bubbles: true, cancelable: true });
            DOM.window.setTimeout(() => { DOM.dispatchEvent(evt); }, 1);
        }
    }
    trackRequestEnd() {
        this.isRequesting = !!(--this.activeRequestCount);
        if (!this.isRequesting) {
            const evt = DOM.createCustomEvent('aurelia-fetch-client-requests-drained', { bubbles: true, cancelable: true });
            DOM.window.setTimeout(() => { DOM.dispatchEvent(evt); }, 1);
        }
    }
    processRequest(request, interceptors) {
        return this.applyInterceptors(request, interceptors, 'request', 'requestError', this);
    }
    processResponse(response, interceptors, request) {
        return this.applyInterceptors(response, interceptors, 'response', 'responseError', request, this);
    }
    applyInterceptors(input, interceptors, successName, errorName, ...interceptorArgs) {
        return (interceptors !== undefined ? interceptors : [])
            .reduce((chain, interceptor) => {
            const successHandler = interceptor[successName];
            const errorHandler = interceptor[errorName];
            // TODO: Fix this, as it violates `strictBindCallApply`.
            return chain.then(successHandler ? (value => successHandler.call(interceptor, value, ...interceptorArgs)) : identity, errorHandler ? (reason => errorHandler.call(interceptor, reason, ...interceptorArgs)) : thrower);
        }, Promise.resolve(input));
    }
    callFetch(input, body, init, method) {
        if (!init) {
            init = {};
        }
        init.method = method;
        if (body) {
            init.body = body;
        }
        return this.fetch(input, init);
    }
}
HttpClient.inject = [IDOM];
function parseHeaderValues(headers) {
    const parsedHeaders = {};
    const $headers = headers !== undefined ? headers : {};
    for (const name in $headers) {
        if (Object.prototype.hasOwnProperty.call($headers, name)) {
            parsedHeaders[name] = (typeof $headers[name] === 'function')
                ? $headers[name]()
                : $headers[name];
        }
    }
    return parsedHeaders;
}
function getRequestUrl(baseUrl, url) {
    if (absoluteUrlRegexp.test(url)) {
        return url;
    }
    return (baseUrl !== undefined ? baseUrl : '') + url;
}
function setDefaultHeaders(headers, defaultHeaders) {
    const $defaultHeaders = defaultHeaders !== undefined ? defaultHeaders : {};
    for (const name in $defaultHeaders) {
        if (Object.prototype.hasOwnProperty.call($defaultHeaders, name) && !headers.has(name)) {
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
//# sourceMappingURL=http-client.js.map