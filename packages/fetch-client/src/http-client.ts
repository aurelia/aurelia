import { DI, IContainer, IIndexable, resolve } from '@aurelia/kernel';
import { HttpClientConfiguration } from './http-client-configuration';
import { Interceptor, ValidInterceptorMethodName } from './interfaces';
import { RetryInterceptor } from './interceptors';

const absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

/**
 * An interface to resolve what fetch function will be used for the http client
 * Default to the global fetch function via global `fetch` variable.
 */
export const IFetchFn = /*@__PURE__*/DI.createInterface<typeof fetch>('fetch', x => x.instance(fetch));

export const IHttpClient = /*@__PURE__*/DI.createInterface<IHttpClient>('IHttpClient', x => x.singleton(HttpClient));
export interface IHttpClient extends HttpClient {}
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
  public defaults: RequestInit | null = null;

  /**
   * The interceptors to be run during requests.
   * @internal
   */
  private _interceptors: Interceptor[] = [];

  /** @internal */
  private _dispatcher: Node | null = null;

  /** @internal */
  private readonly _container = resolve(IContainer);
  /** @internal */
  private readonly _fetchFn = resolve(IFetchFn);

  /**
   * Configure this client with default settings to be used by all requests.
   *
   * @param config - A configuration object, or a function that takes a config
   * object and configures it.
   * @returns The chainable instance of this HttpClient.
   * @chainable
   */
  public configure(config: RequestInit | ((config: HttpClientConfiguration) => HttpClientConfiguration) | HttpClientConfiguration): HttpClient {

    let normalizedConfig: HttpClientConfiguration;

    if (typeof config === 'object') {
      const requestInitConfiguration = { defaults: config as RequestInit };
      normalizedConfig = requestInitConfiguration as HttpClientConfiguration;
    } else if (typeof config === 'function') {
      normalizedConfig = this._container.invoke(HttpClientConfiguration);
      normalizedConfig.baseUrl = this.baseUrl;
      normalizedConfig.defaults = { ...this.defaults };
      normalizedConfig.interceptors = this._interceptors;
      normalizedConfig.dispatcher = this._dispatcher;

      const c = config(normalizedConfig);
      if (typeof config === 'object' && c != null) {
        normalizedConfig = c;
      } else {
        throw new Error(`The config callback did not return a valid HttpClientConfiguration like instance. Received ${typeof c}`);
      }
    } else {
      throw new Error(`invalid config, expecting a function or an object, received ${typeof config}`);
    }

    const defaults = normalizedConfig.defaults;
    if (defaults?.headers instanceof Headers) {
      // Headers instances are not iterable in all browsers. Require a plain
      // object here to allow default headers to be merged into request headers.
      // extract throwing error into an utility function
      throw new Error('Default headers must be a plain object.');
    }

    const interceptors = normalizedConfig.interceptors;
    if (interceptors?.length > 0) {
      // find if there is a RetryInterceptor
      if (interceptors.filter(x => x instanceof RetryInterceptor).length > 1) {
        throw new Error('Only one RetryInterceptor is allowed.');
      }

      const retryInterceptorIndex = interceptors.findIndex(x => isPrototypeOf(RetryInterceptor.prototype, x));

      if (retryInterceptorIndex >= 0 && retryInterceptorIndex !== interceptors.length - 1) {
        throw new Error('The retry interceptor must be the last interceptor defined.');
      }
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
  public fetch(input: Request | string, init?: RequestInit): Promise<Response> {
    this._trackRequestStart();

    let request = this.buildRequest(input, init);
    return this.processRequest(request, this._interceptors)
      .then(result => {
        let response: Promise<Response>;

        if (result instanceof Response) {
          response = Promise.resolve(result);
        } else if (result instanceof Request) {
          request = result;
          response = this._fetchFn(request);
        } else {
          throw new Error(`An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [${result}]`);
        }

        return this.processResponse(response, this._interceptors, request);
      })
      .then(result => {
        if (result instanceof Request) {
          return this.fetch(result);
        }
        return result;
      })
      .then(
        result => {
          this._trackRequestEnd();
          return result;
        },
        error => {
          this._trackRequestEnd();
          throw error;
        }
      );
  }

  /**
   * Creates a new Request object using the current configuration of this http client
   */
  public buildRequest(input: string | Request, init: RequestInit | undefined): Request {
    const defaults = this.defaults ?? {};
    let request: Request;
    let body: unknown;
    let requestContentType: string | null;

    const parsedDefaultHeaders = parseHeaderValues(defaults.headers as IIndexable);
    if (isPrototypeOf(Request.prototype, input)) {
      request = input as Request;
      requestContentType = new Headers(request.headers).get('Content-Type');
    } else {
      if (!init) {
        init = {};
      }
      body = init.body;
      const bodyObj = body !== undefined ? { body: body as BodyInit } : null;
      const requestInit: RequestInit = { ...defaults, headers: {}, ...init, ...bodyObj };
      requestContentType = new Headers(requestInit.headers as Headers).get('Content-Type');
      request = new Request(getRequestUrl(this.baseUrl, input as string), requestInit);
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!requestContentType) {
      if (new Headers(parsedDefaultHeaders).has('content-type')) {
        request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type') as string);
      } else if (body !== undefined && isJSON(body)) {
        request.headers.set('Content-Type', 'application/json');
      }
    }
    setDefaultHeaders(request.headers, parsedDefaultHeaders);
    if (body !== undefined && isPrototypeOf(Blob.prototype, body as Blob) && (body as Blob).type) {
      // work around bug in IE & Edge where the Blob type is ignored in the request
      // https://connect.microsoft.com/IE/feedback/details/2136163
      request.headers.set('Content-Type', (body as Blob).type);
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
  public get(input: Request | string, init?: RequestInit): Promise<Response> {
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
  public post(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response> {
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
  public put(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response> {
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
  public patch(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response> {
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
  public delete(input: Request | string, body?: BodyInit, init?: RequestInit): Promise<Response> {
    return this._callFetch(input, body, init, 'DELETE');
  }

  /** @internal */
  private _trackRequestStart(): void {
    this.isRequesting = !!(++this.activeRequestCount);
    if (this.isRequesting && this._dispatcher != null) {
      dispatch(this._dispatcher, HttpClientEvent.started);
    }
  }

  /** @internal */
  private _trackRequestEnd(): void {
    this.isRequesting = !!(--this.activeRequestCount);
    if (!this.isRequesting && this._dispatcher != null) {
      dispatch(this._dispatcher, HttpClientEvent.drained);
    }
  }

  private processRequest(request: Request, interceptors: Interceptor[]): Promise<Request | Response> {
    return this._applyInterceptors(request, interceptors, 'request', 'requestError', this);
  }

  private processResponse(response: Promise<Response>, interceptors: Interceptor[], request: Request): Promise<Request | Response> {
    return this._applyInterceptors(response, interceptors, 'response', 'responseError', request, this);
  }

  /** @internal */
  private _applyInterceptors(input: Request | Promise<Response | Request>, interceptors: Interceptor[] | undefined, successName: ValidInterceptorMethodName, errorName: ValidInterceptorMethodName, ...interceptorArgs: unknown[]): Promise<Request | Response> {
    return (interceptors ?? [])
      .reduce(
        (chain, interceptor) => {
          const successHandler = interceptor[successName];
          const errorHandler = interceptor[errorName];

          // TODO: Fix this, as it violates `strictBindCallApply`.
          return chain.then(
            successHandler ? (value => successHandler.call(interceptor, value, ...interceptorArgs)) : identity,
            errorHandler ? (reason => errorHandler.call(interceptor, reason, ...interceptorArgs)) : thrower);
        },
        Promise.resolve(input)
      );
  }

  /** @internal */
  private _callFetch(input: string | Request, body: BodyInit | undefined, init: RequestInit | undefined, method: string): Promise<Response> {
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

function parseHeaderValues(headers: Record<string, unknown> | undefined): Record<string, string>  {
  const parsedHeaders: Record<string, string> = {};
  const $headers = headers ?? {};
  for (const name in $headers) {
    if (hasOwnProperty($headers, name)) {
      parsedHeaders[name] = (typeof $headers[name] === 'function')
        ? ($headers[name] as () => string)()
        : $headers[name] as string;
    }
  }
  return parsedHeaders;
}

function getRequestUrl(baseUrl: string, url: string): string {
  if (absoluteUrlRegexp.test(url)) {
    return url;
  }

  return (baseUrl ?? '') + url;
}

function setDefaultHeaders(headers: Headers, defaultHeaders?: Record<string, string>): void {
  const $defaultHeaders = defaultHeaders ?? {};
  for (const name in $defaultHeaders) {
    if (hasOwnProperty($defaultHeaders, name) && !headers.has(name)) {
      headers.set(name, $defaultHeaders[name]);
    }
  }
}

function isJSON(str: unknown): boolean {
  try {
    JSON.parse(str as string);
  } catch (err) {
    return false;
  }

  return true;
}

function identity(x: unknown): unknown {
  return x;
}

function thrower(x: unknown): never {
  throw x;
}

function dispatch(node: Node, name: string): void {
  const evt = new node.ownerDocument!.defaultView!.CustomEvent(name, { bubbles: true, cancelable: true });
  setTimeout(() => { node.dispatchEvent(evt); }, 1);
}

const hasOwnProperty = (obj: object, v: PropertyKey) => Object.prototype.hasOwnProperty.call(obj, v) as boolean;
const isPrototypeOf = (proto: object, v: unknown) => Object.prototype.isPrototypeOf.call(proto, v) as boolean;

/**
 * A lookup containing events used by HttpClient.
 */
export const HttpClientEvent = {
  /**
   * Event to be triggered when a request is sent.
   */
  started: 'aurelia-fetch-client-request-started',
  /**
   * Event to be triggered when a request is completed.
   */
  drained: 'aurelia-fetch-client-requests-drained'
};
