import { DI } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

import type { RestResourceDefaults } from './configuration';
import type { RestResourceDefinition, RestResourceEndpoints, RestResourceTarget } from './rest-resource';
import { getRestResourceDefinition } from './rest-resource';
import type { IRestResourceCache, RestResourceCacheEntry, RestResourceCacheOptions, RestResourceCacheOperation } from './rest-resource-cache';
import { MemoryRestResourceCache } from './rest-resource-cache';
import type { RestResourcePolicy, RestRequestContext, RestResponseContext, RestErrorContext } from './rest-resource-policy';
import type { IRestResourceSerializer, RestResourceSerializerContext } from './rest-resource-serializer';
import { JsonRestResourceSerializer } from './rest-resource-serializer';

export interface RestResourceClientRequestOptions {
  init?: RequestInit;
  skipCache?: boolean;
  signal?: AbortSignal;
  /**
   * When true, methods return a {@link RestResponse} wrapper containing status and headers.
   */
  returnResponse?: boolean;
}

export interface RestResourceClientListOptions extends RestResourceClientRequestOptions {
  query?: Record<string, unknown>;
  cacheKey?: string;
}

export interface RestResourceClientGetOptions extends RestResourceClientRequestOptions {
  query?: Record<string, unknown>;
  cacheKey?: string;
}

export interface RestResourceClientMutationOptions<TBody = unknown> extends RestResourceClientRequestOptions {
  body?: TBody;
}

export interface RestResponse<T = unknown> {
  /**
   * Parsed response body.
   */
  data: T;
  /**
   * HTTP status code.
   */
  status: number;
  /**
   * Response headers.
   */
  headers: Headers;
  /**
   * True when the response came from the in-memory cache.
   */
  fromCache: boolean;
  /**
   * Entity tag if present.
   */
  etag?: string;
}

type RestReturnValue<TValue, TOptions> = TOptions extends { returnResponse: true }
  ? RestResponse<TValue>
  : TValue;

interface InternalRequestResult<TValue> {
  value: TValue;
  response: Response | null;
  cacheEntry?: RestResourceCacheEntry<TValue>;
  fromCache: boolean;
}

export interface RestResourceInternalRequest<TValue = unknown> {
  method: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
  init?: RequestInit;
  cacheKey?: string;
  skipCache?: boolean;
  signal?: AbortSignal;
  parser?: (response: Response, context: RestResourceSerializerContext) => Promise<TValue>;
  operationName?: string;
  policies?: RestResourcePolicy[];
}

export interface RestBatchRequest<TValue = unknown> {
  endpoint: string;
  method?: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
  init?: RequestInit;
  parser?: (response: Response, context: RestResourceSerializerContext) => Promise<TValue>;
  operation?: string;
  cacheKey?: string;
  skipCache?: boolean;
  signal?: AbortSignal;
  map?: (response: RestResponse<TValue>) => unknown;
  policies?: RestResourcePolicy[];
}

export interface RestAsyncStateOptions<TValue, TArgs extends unknown[] = []> {
  immediate?: boolean;
  immediateArgs?: TArgs;
  initialValue?: TValue;
  onSuccess?: (value: TValue) => void;
  onError?: (error: unknown) => void;
}

export type RestAsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RestAsyncState<TValue, TArgs extends unknown[] = []> {
  readonly status: RestAsyncStatus;
  readonly loading: boolean;
  readonly value: TValue | undefined;
  readonly error: unknown;
  execute(...args: TArgs): Promise<TValue>;
  reset(): void;
}

export interface IRestResourceFactory {
  create<TModel = unknown>(target: RestResourceTarget<TModel>): RestResourceClient<TModel>;
  for<TModel = unknown>(definition: RestResourceDefinition<TModel>): RestResourceClient<TModel>;
}

export const IRestResourceFactory = /*@__PURE__*/DI.createInterface<IRestResourceFactory>('IRestResourceFactory');
export const IRestResourceDefaults = /*@__PURE__*/DI.createInterface<RestResourceDefaults>('IRestResourceDefaults');

export class RestResourceFactory implements IRestResourceFactory {
  public static inject = [IHttpClient, IRestResourceDefaults] as const;

  public constructor(
    private readonly httpClient: IHttpClient,
    private readonly defaults: RestResourceDefaults,
  ) {}

  public create<TModel = unknown>(target: RestResourceTarget<TModel>): RestResourceClient<TModel> {
    const definition = getRestResourceDefinition(target);
    return this.for(definition);
  }

  public for<TModel = unknown>(definition: RestResourceDefinition<TModel>): RestResourceClient<TModel> {
    return new RestResourceClient<TModel>(
      this.httpClient,
      definition,
      this.defaults,
      definition.policies as RestResourcePolicy<TModel>[] | undefined,
    );
  }
}

export class RestResourceClient<TModel = unknown> {
  private readonly http: IHttpClient;
  private readonly definition: RestResourceDefinition<TModel>;
  private readonly defaults: RestResourceDefaults;
  private readonly cacheStore: IRestResourceCache | null;
  private readonly serializer: IRestResourceSerializer<TModel>;
  private readonly cacheOptions: RestResourceCacheOptions | null | undefined;
  private readonly baseUrl: string;
  private readonly defaultInit: RequestInit | undefined;
  private readonly defaultQuery: Record<string, unknown> | undefined;
  private readonly cacheKeys = new Set<string>();
  private readonly policies: RestResourcePolicy<TModel>[];
  private readonly additionalPolicies: RestResourcePolicy<TModel>[];

  public constructor(
    http: IHttpClient,
    definition: RestResourceDefinition<TModel>,
    defaults: RestResourceDefaults,
    additionalPolicies: RestResourcePolicy<TModel>[] = [],
  ) {
    this.http = http;
    this.definition = definition;
    this.defaults = defaults;
    const cacheConfigured = definition.cache != null;
    const cacheDisabled = !cacheConfigured || definition.cache === null || defaults.cache === null;
    this.cacheStore = cacheDisabled ? null : (defaults.cache ?? new MemoryRestResourceCache());
    this.serializer = definition.serializer ?? defaults.serializer ?? new JsonRestResourceSerializer();
    this.cacheOptions = definition.cache;
    this.baseUrl = joinUrl(defaults.baseUrl, definition.baseUrl);
    this.defaultInit = mergeRequestInit(defaults.init ?? undefined, definition.defaultInit ?? undefined);
    this.defaultQuery = definition.defaultQuery ? { ...definition.defaultQuery } : undefined;
    this.additionalPolicies = additionalPolicies;
    this.policies = [
      ...(defaults.policies ?? []),
      ...(definition.policies ?? []),
      ...additionalPolicies,
    ];
  }

  public request(endpoint: keyof RestResourceEndpoints | string): RestResourceRequestBuilder<TModel> {
    const path = typeof endpoint === 'string' ? endpoint : this.definition.endpoints[endpoint];
    return new RestResourceRequestBuilder<TModel>(this, path);
  }

  public withPolicies(...policies: RestResourcePolicy<TModel>[]): RestResourceClient<TModel> {
    return new RestResourceClient<TModel>(
      this.http,
      this.definition,
      this.defaults,
      [...this.additionalPolicies, ...policies],
    );
  }

  public buildUrl(endpoint: string, params?: Record<string, unknown>, query?: Record<string, unknown>): string {
    const mergedQuery = this.mergeQuery(query);
    return this.createUrl(endpoint, { params, query: mergedQuery });
  }

  public async executeCustomRequest<TValue>(
    url: string,
    request: RestResourceInternalRequest<TValue>,
    operationName: string = 'custom',
  ): Promise<RestResponse<TValue>> {
    const options: RestResourceClientRequestOptions & { returnResponse: true } = { returnResponse: true };
    return this.performRequest(
      'custom',
      url,
      options,
      {
        ...request,
        skipCache: request.skipCache ?? true,
        operationName,
      },
      operationName,
    );
  }

  public async batch(requests: RestBatchRequest[]): Promise<RestResponse[]> {
    const tasks = requests.map(async req => {
      const computedUrl = this.buildUrl(req.endpoint, req.params, req.query);
      const response = await this.executeCustomRequest(
        computedUrl,
        {
          method: req.method ?? 'GET',
          params: req.params,
          query: req.query,
          body: req.body,
        init: req.init,
        cacheKey: req.cacheKey,
        skipCache: req.skipCache,
        signal: req.signal,
        parser: req.parser,
        operationName: req.operation,
        policies: req.policies,
      },
        req.operation ?? req.method?.toLowerCase() ?? 'batch',
      );
      if (typeof req.map === 'function') {
        const mapped = req.map(response);
        const mappedResponse: RestResponse = {
          ...response,
          data: mapped,
        };
        return mappedResponse;
      }
      return response;
    });
    return Promise.all(tasks);
  }

  public async list<TOptions extends RestResourceClientListOptions = RestResourceClientListOptions>(options?: TOptions): Promise<RestReturnValue<TModel[], TOptions>> {
    const opts: TOptions = options ?? ({} as TOptions);
    const query = this.mergeQuery(opts.query);
    const url = this.createUrl(this.definition.endpoints.list, { query });
    const cacheKey = opts.cacheKey ?? this.buildCacheKey('list', query);

    return this.performRequest(
      'list',
      url,
      opts,
      {
        method: 'GET',
        cacheKey,
        skipCache: opts.skipCache,
        signal: opts.signal,
        init: opts.init,
        query,
      },
      'list',
    );
  }

  public async getOne<TOptions extends RestResourceClientGetOptions = RestResourceClientGetOptions>(id: unknown, options?: TOptions): Promise<RestReturnValue<TModel, TOptions>> {
    const opts: TOptions = options ?? ({} as TOptions);
    const params: Record<string, unknown> = { [this.definition.idKey]: id };
    const query = this.mergeQuery(opts.query);
    const url = this.createUrl(this.definition.endpoints.getOne, { params, query });
    const cacheKey = opts.cacheKey ?? this.buildCacheKey('getOne', { id, query });

    return this.performRequest(
      'getOne',
      url,
      opts,
      {
        method: 'GET',
        params,
        query,
        cacheKey,
        skipCache: opts.skipCache,
        signal: opts.signal,
        init: opts.init,
      },
      'getOne',
    );
  }

  public async getMany<TOptions extends RestResourceClientListOptions = RestResourceClientListOptions>(ids: unknown[], options?: TOptions): Promise<RestReturnValue<TModel[], TOptions>> {
    const opts: TOptions = options ?? ({} as TOptions);
    const query = this.mergeQuery({
      ...(opts.query ?? {}),
      ids: ids.join(','),
    });
    const url = this.createUrl(this.definition.endpoints.getMany, { query });
    const cacheKey = opts.cacheKey ?? this.buildCacheKey('getMany', { ids: [...ids], query });

    return this.performRequest(
      'getMany',
      url,
      opts,
      {
        method: 'GET',
        query,
        cacheKey,
        skipCache: opts.skipCache,
        signal: opts.signal,
        init: opts.init,
      },
      'getMany',
    );
  }

  public async create<TBody = Partial<TModel>, TOptions extends RestResourceClientMutationOptions<TBody> = RestResourceClientMutationOptions<TBody>>(body: TBody, options?: TOptions): Promise<RestReturnValue<TModel, TOptions>> {
    const opts: TOptions = options ?? ({} as TOptions);
    const url = this.createUrl(this.definition.endpoints.create);
    const result = await this.performRequest<TModel, TOptions>(
      'custom',
      url,
      opts,
      {
        method: 'POST',
        body,
        skipCache: true,
        signal: opts.signal,
        init: opts.init,
      },
      'create',
    );
    this.invalidate('list');
    this.invalidate('getOne');
    this.invalidate('getMany');
    return result;
  }

  public async update<TBody = Partial<TModel>, TOptions extends RestResourceClientMutationOptions<TBody> = RestResourceClientMutationOptions<TBody>>(id: unknown, body: TBody, options?: TOptions): Promise<RestReturnValue<TModel, TOptions>> {
    const opts: TOptions = options ?? ({} as TOptions);
    const params: Record<string, unknown> = { [this.definition.idKey]: id };
    const url = this.createUrl(this.definition.endpoints.update, { params });
    const result = await this.performRequest<TModel, TOptions>(
      'custom',
      url,
      opts,
      {
        method: 'PATCH',
        params,
        body,
        skipCache: true,
        signal: opts.signal,
        init: opts.init,
      },
      'update',
    );
    this.invalidate('list');
    this.invalidate('getOne');
    this.invalidate('getMany');
    return result;
  }

  public async replace<TBody = TModel, TOptions extends RestResourceClientMutationOptions<TBody> = RestResourceClientMutationOptions<TBody>>(id: unknown, body: TBody, options?: TOptions): Promise<RestReturnValue<TModel, TOptions>> {
    const opts = options ?? {} as TOptions;
    const params: Record<string, unknown> = { [this.definition.idKey]: id };
    const url = this.createUrl(this.definition.endpoints.replace, { params });
    const result = await this.performRequest<TModel, TOptions>(
      'custom',
      url,
      opts,
      {
        method: 'PUT',
        params,
        body,
        skipCache: true,
        signal: opts.signal,
        init: opts.init,
      },
      'replace',
    );
    this.invalidate('list');
    this.invalidate('getOne');
    this.invalidate('getMany');
    return result;
  }

  public async delete<TOptions extends RestResourceClientRequestOptions = RestResourceClientRequestOptions>(id: unknown, options?: TOptions): Promise<RestReturnValue<null, TOptions> | void> {
    const opts = options ?? {} as TOptions;
    const params: Record<string, unknown> = { [this.definition.idKey]: id };
    const url = this.createUrl(this.definition.endpoints.delete, { params });
    const result = await this.performRequest<null, TOptions>(
      'custom',
      url,
      opts,
      {
        method: 'DELETE',
        params,
        skipCache: true,
        signal: opts.signal,
        init: opts.init,
        parser: async () => null,
      },
      'delete',
    );
    this.invalidate('list');
    this.invalidate('getOne');
    this.invalidate('getMany');
    if (opts.returnResponse) {
      return result as RestReturnValue<null, TOptions>;
    }
  }

  public invalidate(operation?: RestResourceCacheOperation): void {
    if (this.cacheStore == null) {
      return;
    }

    if (operation == null) {
      for (const key of this.cacheKeys) {
        this.cacheStore.delete(key);
      }
      this.cacheKeys.clear();
      return;
    }

    const prefix = `${this.definition.key}:${operation}`;
    for (const key of Array.from(this.cacheKeys)) {
      if (key.startsWith(prefix)) {
        this.cacheStore.delete(key);
        this.cacheKeys.delete(key);
      }
    }
  }

  private async performRequest<TValue, TOptions extends RestResourceClientRequestOptions>(
    operation: RestResourceCacheOperation | 'custom',
    url: string,
    options: TOptions,
    request: RestResourceInternalRequest<TValue>,
    serializerOperation: string,
  ): Promise<RestReturnValue<TValue, TOptions>> {
    const returnResponse = options.returnResponse === true;
    const clonedRequest = cloneInternalRequest(request);
    const serializerKey = clonedRequest.operationName ?? serializerOperation;
    let currentUrl = url;
    let urlOverridden = false;
    const policies = [...this.policies, ...(clonedRequest.policies ?? [])];

    if (policies.length > 0) {
      const requestContext = this.createRequestContext(
        clonedRequest,
        () => currentUrl,
        newUrl => {
          urlOverridden = true;
          currentUrl = newUrl;
        },
        serializerKey,
        options,
      );
      await this.applyRequestPolicies(policies, requestContext);
      if (!urlOverridden) {
        currentUrl = applyRequestQuery(currentUrl, clonedRequest.query);
      }
    }

    const useCache = operation !== 'custom' && !(clonedRequest.skipCache ?? false);
    const cacheKey = clonedRequest.cacheKey;

    if (useCache && cacheKey != null) {
      const cached = this.fromCacheInternal<TValue>(operation as RestResourceCacheOperation, cacheKey);
      if (cached != null) {
        let cachedData = cached.value;
        let cachedResponse = cached.response ?? createSyntheticResponse(cached.cacheEntry);
        if (policies.length > 0) {
          const responseContext = this.createResponseContext(
            clonedRequest,
            cachedResponse,
            cachedData,
            cached.cacheEntry,
            serializerKey,
            true,
          );
          await this.applyResponsePolicies(policies, responseContext);
          cachedResponse = responseContext.response;
          cachedData = responseContext.data;
        }
        return this.resolveReturn<TValue, TOptions>(
          cachedData,
          returnResponse ? cachedResponse : null,
          true,
          cached.cacheEntry,
          returnResponse,
        );
      }
    }

    const init = this.prepareRequestInit(serializerKey, clonedRequest.method, clonedRequest.init, clonedRequest.body, clonedRequest.signal);

    let response: Response;
    try {
      response = await this.http.fetch(currentUrl, init);
    } catch (error) {
      if (policies.length > 0) {
        const errorContext = this.createErrorContext(clonedRequest, serializerKey, error);
        await this.applyErrorPolicies(policies, errorContext);
      }
      throw error;
    }
    try {
      ensureSuccess(response, currentUrl);
    } catch (error) {
      if (policies.length > 0) {
        const errorContext = this.createErrorContext(clonedRequest, serializerKey, error);
        await this.applyErrorPolicies(policies, errorContext);
      }
      throw error;
    }

    const context = this.createSerializerContext(serializerKey);
    const parser = clonedRequest.parser ?? (async (resp: Response) => this.serializer.read(resp, context) as Promise<TValue>);
    let data: TValue;
    try {
      data = await parser(response, context);
    } catch (error) {
      if (policies.length > 0) {
        const errorContext = this.createErrorContext(clonedRequest, serializerKey, error);
        await this.applyErrorPolicies(policies, errorContext);
      }
      throw error;
    }
    let cacheEntry: RestResourceCacheEntry<TValue> | undefined;

    if (policies.length > 0) {
      const responseContext = this.createResponseContext(
        clonedRequest,
        response,
        data,
        undefined,
        serializerKey,
        false,
      );
      await this.applyResponsePolicies(policies, responseContext);
      response = responseContext.response;
      data = responseContext.data;
    }

    if (useCache && cacheKey != null) {
      cacheEntry = this.toCache(operation as RestResourceCacheOperation, cacheKey, data, response);
    }

    return this.resolveReturn<TValue, TOptions>(data, response, false, cacheEntry, returnResponse);
  }

  private resolveReturn<TValue, TOptions>(
    value: TValue,
    response: Response | null,
    fromCache: boolean,
    cacheEntry: RestResourceCacheEntry<TValue> | undefined,
    returnResponse: boolean,
  ): RestReturnValue<TValue, TOptions> {
    if (returnResponse) {
      return this.createResponse(value, response, fromCache, cacheEntry) as RestReturnValue<TValue, TOptions>;
    }
    return value as RestReturnValue<TValue, TOptions>;
  }

  private buildCacheKey(operation: RestResourceCacheOperation, extra?: unknown): string {
    const serialised = extra == null ? '' : `:${stringify(extra)}`;
    return `${this.definition.key}:${operation}${serialised}`;
  }

  private fromCacheInternal<TValue = unknown>(operation: RestResourceCacheOperation, cacheKey: string): InternalRequestResult<TValue> | null {
    if (!this.shouldCache(operation) || this.cacheStore == null) {
      return null;
    }
    const entry = this.cacheStore.get<TValue>(cacheKey);
    if (entry == null) {
      this.cacheKeys.delete(cacheKey);
      return null;
    }
    return {
      value: entry.value as TValue,
      response: null,
      cacheEntry: entry as RestResourceCacheEntry<TValue>,
      fromCache: true,
    };
  }

  private toCache<TValue = unknown>(operation: RestResourceCacheOperation, cacheKey: string, value: TValue, response: Response): RestResourceCacheEntry<TValue> | undefined {
    if (!this.shouldCache(operation) || this.cacheStore == null) {
      return undefined;
    }

    if (value == null && this.cacheOptions?.cacheEmptyResponses === false) {
      return undefined;
    }

    const ttl = this.cacheOptions?.ttl ?? null;
    const entry: RestResourceCacheEntry<TValue> = {
      value,
      expiresAt: ttl != null ? Date.now() + ttl : null,
      etag: response.headers.get('etag') ?? undefined,
      status: response.status,
      headers: serializeHeaders(response.headers),
    };

    this.cacheStore.set(cacheKey, entry);
    this.cacheKeys.add(cacheKey);
    return entry;
  }

  private createRequestContext<TValue>(
    request: RestResourceInternalRequest<TValue>,
    getUrl: () => string,
    setUrl: (url: string) => void,
    operation: string,
    options: RestResourceClientRequestOptions,
  ): RestRequestContext<TModel, TValue> {
    return {
      client: this,
      definition: this.definition,
      operation,
      options: Object.freeze({ ...options }),
      get url() {
        return getUrl();
      },
      setUrl,
      get request() {
        return request;
      },
      setRequest: update => {
        applyRequestUpdate(request, update);
      },
    };
  }

  private createResponseContext<TValue>(
    request: RestResourceInternalRequest<TValue>,
    response: Response,
    data: TValue,
    cacheEntry: RestResourceCacheEntry<TValue> | undefined,
    operation: string,
    fromCache: boolean,
  ): RestResponseContext<TModel, TValue> {
    let currentResponse = response;
    let currentData = data;
    return {
      client: this,
      definition: this.definition,
      operation,
      fromCache,
      get request() {
        return request;
      },
      get response() {
        return currentResponse;
      },
      setResponse(value) {
        currentResponse = value;
      },
      get data() {
        return currentData;
      },
      setData(value) {
        currentData = value;
      },
      get cacheEntry() {
        return cacheEntry;
      },
    };
  }

  private createErrorContext(
    request: RestResourceInternalRequest<unknown>,
    operation: string,
    error: unknown,
  ): RestErrorContext<TModel> {
    return {
      client: this,
      definition: this.definition,
      operation,
      request,
      error,
    };
  }

  private async applyRequestPolicies(
    policies: RestResourcePolicy<TModel>[],
    context: RestRequestContext<TModel>,
  ): Promise<void> {
    for (const policy of policies) {
      await policy.onRequest?.(context);
    }
  }

  private async applyResponsePolicies(
    policies: RestResourcePolicy<TModel>[],
    context: RestResponseContext<TModel>,
  ): Promise<void> {
    for (const policy of policies) {
      await policy.onResponse?.(context);
    }
  }

  private async applyErrorPolicies(
    policies: RestResourcePolicy<TModel>[],
    context: RestErrorContext<TModel>,
  ): Promise<void> {
    for (const policy of policies) {
      await policy.onError?.(context);
    }
  }

  private shouldCache(operation: RestResourceCacheOperation): boolean {
    if (this.cacheStore == null) {
      return false;
    }
    if (this.cacheOptions == null) {
      return false;
    }
    const ops = this.cacheOptions?.operations;
    if (ops == null || ops.length === 0) {
      return operation === 'list' || operation === 'getOne' || operation === 'getMany';
    }
    return ops.includes(operation);
  }

  private mergeQuery(query?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (this.defaultQuery == null && query == null) {
      return undefined;
    }
    return {
      ...(this.defaultQuery ?? {}),
      ...(query ?? {}),
    };
  }

  private createUrl(endpoint: string, options: { params?: Record<string, unknown>; query?: Record<string, unknown> } = {}): string {
    const path = resolvePathParams(endpoint, options.params);
    const url = joinUrl(this.baseUrl, path);
    if (options.query == null || Object.keys(options.query).length === 0) {
      return url;
    }
    const search = buildQuery(options.query);
    return search.length > 0 ? `${url}?${search}` : url;
  }

  /** @internal */
  public prepareRequestInit(operation: RestResourceCacheOperation | string, method: string, overrideInit: RequestInit | undefined, body: unknown, signal: AbortSignal | undefined): RequestInit {
    const init = mergeRequestInit(this.defaultInit, overrideInit);
    const context: RestResourceSerializerContext<TModel> = this.createSerializerContext(String(operation));
    const prepared = this.serializer.prepareRequest({ init, body }, context);
    return {
      ...prepared,
      method,
      signal: signal ?? prepared.signal,
    };
  }

  private createSerializerContext(operation: string): RestResourceSerializerContext<TModel> {
    return {
      operation,
      definition: this.definition,
    };
  }

  private createResponse<TValue>(
    value: TValue,
    response: Response | null,
    fromCache: boolean,
    cacheEntry: RestResourceCacheEntry<TValue> | undefined,
  ): RestResponse<TValue> {
    const status = response?.status ?? cacheEntry?.status ?? 200;
    const headers = response != null
      ? new Headers(response.headers)
      : cacheEntry?.headers != null
        ? deserializeHeaders(cacheEntry.headers)
        : new Headers();
    const etag = response?.headers.get('etag') ?? cacheEntry?.etag;
    return {
      data: value,
      status,
      headers,
      fromCache,
      etag,
    };
  }

  public toAsyncState<TValue, TArgs extends unknown[] = []>(
    invoker: (...args: TArgs) => Promise<TValue>,
    options: RestAsyncStateOptions<TValue, TArgs> = {},
  ): RestAsyncState<TValue, TArgs> {
    let status: RestAsyncStatus = 'idle';
    let value: TValue | undefined = options.initialValue;
    let error: unknown = undefined;

    const execute = async (...args: TArgs): Promise<TValue> => {
      status = 'loading';
      error = undefined;
      try {
        const result = await invoker(...args);
        value = result;
        status = 'success';
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        error = err;
        status = 'error';
        options.onError?.(err);
        throw err;
      }
    };

    const reset = (): void => {
      status = 'idle';
      value = options.initialValue;
      error = undefined;
    };

    const state: RestAsyncState<TValue, TArgs> = {
      get status() {
        return status;
      },
      get loading() {
        return status === 'loading';
      },
      get value() {
        return value;
      },
      get error() {
        return error;
      },
      execute,
      reset,
    };

    if (options.immediate) {
      void execute(...(options.immediateArgs ?? [] as unknown as TArgs));
    }

    return state;
  }
}

export class RestResourceRequestBuilder<TModel = unknown> {
  private methodName = 'GET';
  private params: Record<string, unknown> | undefined;
  private queryParams: Record<string, unknown> | undefined;
  private init: RequestInit | undefined;
  private payload: unknown;
  private skipCacheFlag = true;
  private cacheKeyValue: string | undefined;
  private operationName: string | undefined;
  private signalValue: AbortSignal | undefined;
  private policyList: RestResourcePolicy[] = [];
  private parser:
    | ((response: Response, context: RestResourceSerializerContext<unknown>) => Promise<any>)
    | undefined;

  public constructor(
    private readonly client: RestResourceClient<TModel>,
    private readonly endpoint: string,
  ) {}

  public method(method: string): this {
    this.methodName = method.toUpperCase();
    return this;
  }

  public param(key: string, value: unknown): this {
    this.params = { ...(this.params ?? {}), [key]: value };
    return this;
  }

  public paramsAll(params: Record<string, unknown>): this {
    this.params = { ...(this.params ?? {}), ...params };
    return this;
  }

  public queryParam(key: string, value: unknown): this {
    this.queryParams = { ...(this.queryParams ?? {}), [key]: value };
    return this;
  }

  public query(params: Record<string, unknown>): this {
    this.queryParams = { ...(this.queryParams ?? {}), ...params };
    return this;
  }

  public header(key: string, value: string): this {
    const headers = new Headers(this.init?.headers ?? undefined);
    headers.set(key, value);
    this.init = { ...(this.init ?? {}), headers };
    return this;
  }

  public headers(headers: HeadersInit): this {
    const current = new Headers(this.init?.headers ?? undefined);
    applyHeaders(current, headers);
    this.init = { ...(this.init ?? {}), headers: current };
    return this;
  }

  public body(value: unknown): this {
    this.payload = value;
    return this;
  }

  public requestInit(value: RequestInit): this {
    this.init = mergeRequestInit(this.init, value);
    return this;
  }

  public policy(policy: RestResourcePolicy): this {
    this.policyList.push(policy);
    return this;
  }

  public skipCache(value: boolean = true): this {
    this.skipCacheFlag = value;
    return this;
  }

  public cacheKey(value: string): this {
    this.cacheKeyValue = value;
    return this;
  }

  public signal(signal: AbortSignal): this {
    this.signalValue = signal;
    return this;
  }

  public operation(name: string): this {
    this.operationName = name;
    return this;
  }

  public parseWith<TValue>(
    parser: (response: Response, context: RestResourceSerializerContext<unknown>) => Promise<TValue>,
  ): RestResourceRequestBuilder<TModel> {
    this.parser = parser;
    return this;
  }

  public async send<TValue = unknown>(): Promise<RestResponse<TValue>> {
    const url = this.client.buildUrl(this.endpoint, this.params, this.queryParams);
    return this.client.executeCustomRequest<TValue>(
      url,
      {
        method: this.methodName,
        params: this.params,
        query: this.queryParams,
        body: this.payload,
        init: this.init,
        cacheKey: this.cacheKeyValue,
        skipCache: this.skipCacheFlag,
        signal: this.signalValue,
        parser: this.parser,
        operationName: this.operationName,
        policies: this.policyList,
      },
      this.operationName ?? this.methodName.toLowerCase(),
    );
  }
}

function ensureSuccess(response: Response, url: string): void {
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
}

function mergeRequestInit(primary?: RequestInit, secondary?: RequestInit): RequestInit | undefined {
  if (primary == null && secondary == null) {
    return undefined;
  }
  const init: RequestInit = { ...(primary ?? {}) };
  if (secondary != null) {
    Object.assign(init, secondary);
    init.headers = mergeHeaders(primary?.headers, secondary.headers);
  } else if (primary?.headers != null) {
    init.headers = mergeHeaders(primary.headers, undefined);
  }
  return init;
}

function mergeHeaders(base?: HeadersInit, override?: HeadersInit): HeadersInit | undefined {
  if (base == null && override == null) {
    return undefined;
  }
  const headers = new Headers();
  applyHeaders(headers, base);
  applyHeaders(headers, override);
  return headers;
}

function applyHeaders(target: Headers, source?: HeadersInit): void {
  if (source == null) {
    return;
  }
  if (source instanceof Headers) {
    source.forEach((value, key) => target.set(key, value));
    return;
  }
  if (Array.isArray(source)) {
    for (const [key, value] of source) {
      target.set(key, value);
    }
    return;
  }
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value != null) {
      target.set(key, String(value));
    }
  }
}

function serializeHeaders(headers: Headers): [string, string][] {
  const pairs: [string, string][] = [];
  headers.forEach((value, key) => {
    pairs.push([key, value]);
  });
  return pairs;
}

function deserializeHeaders(pairs: [string, string][]): Headers {
  const headers = new Headers();
  for (const [key, value] of pairs) {
    headers.append(key, value);
  }
  return headers;
}

function cloneInternalRequest<TValue>(request: RestResourceInternalRequest<TValue>): RestResourceInternalRequest<TValue> {
  return {
    ...request,
    params: request.params ? { ...request.params } : undefined,
    query: request.query ? { ...request.query } : undefined,
    init: request.init ? mergeRequestInit(undefined, request.init) : undefined,
    policies: request.policies ? [...request.policies] : undefined,
  };
}

function applyRequestUpdate<TValue>(
  target: RestResourceInternalRequest<TValue>,
  update: Partial<RestResourceInternalRequest<TValue>>,
): void {
  if (update.method != null) {
    target.method = update.method;
  }
  if (update.params != null) {
    target.params = { ...(target.params ?? {}), ...update.params };
  }
  if (update.query != null) {
    target.query = { ...(target.query ?? {}), ...update.query };
  }
  if (update.body !== undefined) {
    target.body = update.body;
  }
  if (update.init != null) {
    target.init = mergeRequestInit(target.init, update.init);
  }
  if (update.cacheKey !== undefined) {
    target.cacheKey = update.cacheKey;
  }
  if (update.skipCache !== undefined) {
    target.skipCache = update.skipCache;
  }
  if (update.signal !== undefined) {
    target.signal = update.signal;
  }
  if (update.parser !== undefined) {
    target.parser = update.parser;
  }
  if (update.operationName !== undefined) {
    target.operationName = update.operationName;
  }
  if (update.policies != null) {
    target.policies = [...(target.policies ?? []), ...update.policies];
  }
}

function createSyntheticResponse<TValue>(entry?: RestResourceCacheEntry<TValue>): Response {
  const headers = entry?.headers != null ? deserializeHeaders(entry.headers) : new Headers();
  if (entry?.etag != null) {
    headers.set('etag', entry.etag);
  }
  return new Response(null, {
    status: entry?.status ?? 200,
    headers,
  });
}

function applyRequestQuery(url: string, query?: Record<string, unknown>): string {
  const hashIndex = url.indexOf('#');
  const hasHash = hashIndex >= 0;
  const hash = hasHash ? url.slice(hashIndex) : '';
  const base = hasHash ? url.slice(0, hashIndex) : url;
  const [path] = base.split('?');
  if (query == null || Object.keys(query).length === 0) {
    return `${path}${hash}`;
  }
  const search = buildQuery(query);
  return search.length > 0 ? `${path}?${search}${hash}` : `${path}${hash}`;
}

function joinUrl(base: string, path: string): string {
  if (!base) {
    return path;
  }
  if (!path) {
    return base;
  }
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function resolvePathParams(path: string, params: Record<string, unknown> = {}): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    if (!(key in params)) {
      throw new Error(`Missing path parameter "${key}" for endpoint "${path}"`);
    }
    const value = params[key];
    if (value == null) {
      throw new Error(`Path parameter "${key}" is null or undefined`);
    }
    return encodeURIComponent(String(value));
  });
}

function buildQuery(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(query)) {
    const value = query[key];
    if (value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else if (typeof value === 'object') {
      params.set(key, stringify(value));
    } else {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

function stringify(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
