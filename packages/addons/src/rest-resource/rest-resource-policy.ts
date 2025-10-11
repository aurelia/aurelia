import type { RestResourceDefinition } from './rest-resource';
import type { RestResourceClient, RestResourceInternalRequest, RestResourceClientRequestOptions } from './rest-resource-client';
import type { RestResourceCacheEntry } from './rest-resource-cache';

export interface RestRequestContext<TModel = unknown, TValue = unknown> {
  readonly client: RestResourceClient<TModel>;
  readonly definition: RestResourceDefinition<TModel>;
  readonly operation: string;
  readonly options: Readonly<RestResourceClientRequestOptions>;
  get url(): string;
  setUrl(url: string): void;
  get request(): RestResourceInternalRequest<TValue>;
  setRequest(update: Partial<RestResourceInternalRequest<TValue>>): void;
}

export interface RestResponseContext<TModel = unknown, TValue = unknown> {
  readonly client: RestResourceClient<TModel>;
  readonly definition: RestResourceDefinition<TModel>;
  readonly operation: string;
  readonly fromCache: boolean;
  get request(): RestResourceInternalRequest<TValue>;
  get response(): Response;
  setResponse(response: Response): void;
  get data(): TValue;
  setData(data: TValue): void;
  get cacheEntry(): RestResourceCacheEntry<TValue> | undefined;
}

export interface RestErrorContext<TModel = unknown> {
  readonly client: RestResourceClient<TModel>;
  readonly definition: RestResourceDefinition<TModel>;
  readonly operation: string;
  readonly request: RestResourceInternalRequest<unknown>;
  readonly error: unknown;
}

export interface RestResourcePolicy<TModel = unknown> {
  onRequest?(context: RestRequestContext<TModel>): void | Promise<void>;
  onResponse?(context: RestResponseContext<TModel>): void | Promise<void>;
  onError?(context: RestErrorContext<TModel>): void | Promise<void>;
}
