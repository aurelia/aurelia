import { DOM } from '@aurelia/runtime';
import { HttpClientConfiguration } from './http-client-configuration';
import { Interceptor, ValidInterceptorMethodName } from './interfaces';
import { RetryInterceptor } from './retry-interceptor';

/**
 * An HTTP client based on the Fetch API.
 */
export class HttpClient {
  /**
   * The current number of active requests.
   * Requests being processed by interceptors are considered active.
   */
  public activeRequestCount: number = 0;

  /**
   * Indicates whether or not the client is currently making one or more requests.
   */
  public isRequesting: boolean = false;

  /**
   * Indicates whether or not the client has been configured.
   */
  public isConfigured: boolean = false;

  /**
   * The base URL set by the config.
   */
  public baseUrl: string = '';

  /**
   * The default request init to merge with values specified at request time.
   */
  public defaults: RequestInit = null;

  /**
   * The interceptors to be run during requests.
   */
  public interceptors: Interceptor[] = [];

  /**
   * Creates an instance of HttpClient.
   */
  constructor() {
    if (typeof fetch === 'undefined') {
      // tslint:disable-next-line:max-line-length
      throw new Error('HttpClient requires a Fetch API implementation, but the current environment doesn\'t support it. You may need to load a polyfill such as https://github.com/github/fetch');
    }
  }

  /**
   * Configure this client with default settings to be used by all requests.
   *
   * @param config A configuration object, or a function that takes a config
   * object and configures it.
   * @returns The chainable instance of this HttpClient.
   * @chainable
   */
  public configure(config: RequestInit | ((config: HttpClientConfiguration) => void) | HttpClientConfiguration): HttpClient {
    let normalizedConfig: HttpClientConfiguration;

    if (typeof config === 'object') {
      normalizedConfig = { defaults: config as RequestInit } as HttpClientConfiguration;
    } else if (typeof config === 'function') {
      normalizedConfig = new HttpClientConfiguration();
      normalizedConfig.baseUrl = this.baseUrl;
      normalizedConfig.defaults = { ...this.defaults };
      normalizedConfig.interceptors = this.interceptors;

      const c = config(normalizedConfig);
      //tslint:disable-next-line no-any
      if (HttpClientConfiguration.prototype.isPrototypeOf(c as any)) {
        //tslint:disable-next-line no-any
        normalizedConfig = c as any;
      }
    } else {
      throw new Error('invalid config');
    }

    const defaults = normalizedConfig.defaults;
    if (defaults && Headers.prototype.isPrototypeOf(defaults.headers)) {
      // Headers instances are not iterable in all browsers. Require a plain
      // object here to allow default headers to be merged into request headers.
      throw new Error('Default headers must be a plain object.');
    }

    const interceptors = normalizedConfig.interceptors;

    if (interceptors && interceptors.length) {
      // find if there is a RetryInterceptor
      if (interceptors.filter(x => RetryInterceptor.prototype.isPrototypeOf(x)).length > 1) {
        throw new Error('Only one RetryInterceptor is allowed.');
      }

      const retryInterceptorIndex = interceptors.findIndex(x => RetryInterceptor.prototype.isPrototypeOf(x));

      if (retryInterceptorIndex >= 0 && retryInterceptorIndex !== interceptors.length - 1) {
        throw new Error('The retry interceptor must be the last interceptor defined.');
      }
    }

    this.baseUrl = normalizedConfig.baseUrl;
    this.defaults = defaults;
    this.interceptors = normalizedConfig.interceptors || [];
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
   * @param input The resource that you wish to fetch. Either a
   * Request object, or a string containing the URL of the resource.
   * @param init An options object containing settings to be applied to
   * the Request.
   * @returns A Promise for the Response from the fetch request.
   */
  public fetch(input: Request | string, init?: RequestInit): Promise<Response> {
    trackRequestStart(this);

    let request = this.buildRequest(input, init);
    return processRequest(request, this.interceptors, this).then(result => {
      let response = null;

      if (Response.prototype.isPrototypeOf(result)) {
        response = Promise.resolve(result);
      } else if (Request.prototype.isPrototypeOf(result)) {
        request = result;
        response = fetch(result);
      } else {
        // tslint:disable-next-line:max-line-length
        throw new Error(`An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [${result}]`);
      }

      return processResponse(response, this.interceptors, request, this);
    })
      .then(result => {
        if (Request.prototype.isPrototypeOf(result)) {
          return this.fetch(result);
        }
        return result;
      })
      .then(
        result => {
          trackRequestEnd(this);
          return result;
        },
        error => {
          trackRequestEnd(this);
          throw error;
        }
      );
  }

  public buildRequest(input: string | Request, init: RequestInit): Request {
    const defaults = this.defaults || {};
    let request: Request;
    //tslint:disable-next-line no-any
    let body: any;
    let requestContentType: string;

    const parsedDefaultHeaders = parseHeaderValues(defaults.headers) as HeadersInit;
    if (Request.prototype.isPrototypeOf(input)) {
      request = input as Request;
      requestContentType = new Headers(request.headers).get('Content-Type');
    } else {
      if (!init) {
        init = {} as RequestInit;
      }
      body = init.body;
      const bodyObj = body ? { body } : null;
      const requestInit = { ...defaults, headers: {}, ...init, ...bodyObj } as RequestInit;
      requestContentType = new Headers(requestInit.headers as Headers).get('Content-Type');
      request = new Request(getRequestUrl(this.baseUrl, input as string), requestInit);
    }
    if (!requestContentType) {
      if (new Headers(parsedDefaultHeaders).has('content-type')) {
        request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type'));
      } else if (body && isJSON(body)) {
        request.headers.set('Content-Type', 'application/json');
      }
    }
    setDefaultHeaders(request.headers, parsedDefaultHeaders);
    if (body && Blob.prototype.isPrototypeOf(body) && body.type) {
      // work around bug in IE & Edge where the Blob type is ignored in the request
      // https://connect.microsoft.com/IE/feedback/details/2136163
      request.headers.set('Content-Type', body.type);
    }
    return request;
  }

  /**
   * Calls fetch as a GET request.
   *
   * @param input The resource that you wish to fetch. Either a
   * Request object, or a string containing the URL of the resource.
   * @param init An options object containing settings to be applied to
   * the Request.
   * @returns A Promise for the Response from the fetch request.
   */
  public get(input: Request | string, init?: RequestInit): Promise<Response> {
    return this.fetch(input, init);
  }

  /**
   * Calls fetch with request method set to POST.
   *
   * @param input The resource that you wish to fetch. Either a
   * Request object, or a string containing the URL of the resource.
   * @param body The body of the request.
   * @param init An options object containing settings to be applied to
   * the Request.
   * @returns A Promise for the Response from the fetch request.
   */
  //tslint:disable-next-line no-any
  public post(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return callFetch(this, input, body, init, 'POST');
  }

  /**
   * Calls fetch with request method set to PUT.
   *
   * @param input The resource that you wish to fetch. Either a
   * Request object, or a string containing the URL of the resource.
   * @param body The body of the request.
   * @param init An options object containing settings to be applied to
   * the Request.
   * @returns A Promise for the Response from the fetch request.
   */
  //tslint:disable-next-line no-any
  public put(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return callFetch(this, input, body, init, 'PUT');
  }

  /**
   * Calls fetch with request method set to PATCH.
   *
   * @param input The resource that you wish to fetch. Either a
   * Request object, or a string containing the URL of the resource.
   * @param body The body of the request.
   * @param init An options object containing settings to be applied to
   * the Request.
   * @returns A Promise for the Response from the fetch request.
   */
  //tslint:disable-next-line no-any
  public patch(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return callFetch(this, input, body, init, 'PATCH');
  }

  /**
   * Calls fetch with request method set to DELETE.
   *
   * @param input The resource that you wish to fetch. Either a
   * Request object, or a string containing the URL of the resource.
   * @param body The body of the request.
   * @param init An options object containing settings to be applied to
   * the Request.
   * @returns A Promise for the Response from the fetch request.
   */
  //tslint:disable-next-line no-any
  public delete(input: Request | string, body?: any, init?: RequestInit): Promise<Response> {
    return callFetch(this, input, body, init, 'DELETE');
  }
}

const absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

function trackRequestStart(client: HttpClient): void {
  client.isRequesting = !!(++client.activeRequestCount);
  if (client.isRequesting) {
    const evt = DOM.createCustomEvent('aurelia-fetch-client-request-started', { bubbles: true, cancelable: true });
    setTimeout(() => DOM.dispatchEvent(evt), 1);
  }
}

function trackRequestEnd(client: HttpClient): void {
  client.isRequesting = !!(--client.activeRequestCount);
  if (!client.isRequesting) {
    const evt = DOM.createCustomEvent('aurelia-fetch-client-requests-drained', { bubbles: true, cancelable: true });
    setTimeout(() => DOM.dispatchEvent(evt), 1);
  }
}

function parseHeaderValues(headers: object): object {
  const parsedHeaders = {};
  for (const name in headers || {}) {
    if (headers.hasOwnProperty(name)) {
      parsedHeaders[name] = (typeof headers[name] === 'function') ? headers[name]() : headers[name];
    }
  }
  return parsedHeaders;
}

function getRequestUrl(baseUrl: string, url: string): string {
  if (absoluteUrlRegexp.test(url)) {
    return url;
  }

  return (baseUrl || '') + url;
}

function setDefaultHeaders(headers: Headers, defaultHeaders: object): void {
  for (const name in defaultHeaders || {}) {
    if (defaultHeaders.hasOwnProperty(name) && !headers.has(name)) {
      headers.set(name, defaultHeaders[name]);
    }
  }
}

function processRequest(request: Request, interceptors: Interceptor[], http: HttpClient) {
  return applyInterceptors(request, interceptors, 'request', 'requestError', http);
}

function processResponse(response: Promise<Response>, interceptors: Interceptor[], request: Request, http: HttpClient) {
  return applyInterceptors(response, interceptors, 'response', 'responseError', request, http);
}

// tslint:disable-next-line:max-line-length
function applyInterceptors(input: Request | Promise<Response | Request>, interceptors: Interceptor[], successName: ValidInterceptorMethodName, errorName: ValidInterceptorMethodName, ...interceptorArgs: any[]) {
  return (interceptors || [])
    .reduce((chain, interceptor) => {
      const successHandler = interceptor[successName];
      const errorHandler = interceptor[errorName];

      return chain.then(
        successHandler && (value => successHandler.call(interceptor, value, ...interceptorArgs)) || identity,
        errorHandler && (reason => errorHandler.call(interceptor, reason, ...interceptorArgs)) || thrower);
    }, Promise.resolve(input));
}

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (err) {
    return false;
  }

  return true;
}

function identity(x: any): any {
  return x;
}

function thrower(x: any): never {
  throw x;
}

function callFetch(client: HttpClient, input: string | Request, body: any, init: RequestInit, method: string) {
  if (!init) {
    init = {};
  }
  init.method = method;
  if (body) {
    init.body = body;
  }
  return client.fetch(input, init);
}
