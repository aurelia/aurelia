import { Metadata } from '@aurelia/metadata';
import { Constructable, getResourceKeyFor, isFunction } from '@aurelia/kernel';
import type { RestResourceCacheOptions } from './rest-resource-cache';
import type { RestResourcePolicy } from './rest-resource-policy';
import type { IRestResourceSerializer } from './rest-resource-serializer';

export type RestResourceOperation =
  | 'list'
  | 'getOne'
  | 'getMany'
  | 'create'
  | 'update'
  | 'replace'
  | 'patch'
  | 'delete';

export interface RestResourceEndpoints {
  list: string;
  getOne: string;
  getMany: string;
  create: string;
  update: string;
  replace: string;
  patch: string;
  delete: string;
}

export interface RestResourceOptions<TModel = unknown> {
  /**
   * Base url for the requests.
   */
  baseUrl?: string;

  /**
   * Resource path segment, e.g. `users`.
   */
  resource?: string;

  /**
   * Unique key for the resource definition. Defaults to the decorated class name or resource name.
   */
  key?: string;

  /**
   * Identifier property on the model. Defaults to `id`.
   */
  idKey?: string;

  /**
   * Override resource endpoints.
   */
  endpoints?: Partial<RestResourceEndpoints>;

  /**
   * Default `RequestInit` merged into every request.
   */
  defaultInit?: RequestInit | null;

  /**
   * Default query parameters appended to every request.
   */
  defaultQuery?: Record<string, unknown> | null;

  /**
   * Cache behaviour for the resource.
   */
  cache?: RestResourceCacheOptions | null;

  /**
   * Serializer used to encode requests / decode responses.
   */
  serializer?: IRestResourceSerializer<TModel>;

  /**
   * Policies executed around each request.
   */
  policies?: RestResourcePolicy<TModel>[];
}

export interface RestResourceDefinition<TModel = unknown> {
  readonly Type?: Constructable;
  readonly key: string;
  readonly baseUrl: string;
  readonly resource: string;
  readonly idKey: string;
  readonly endpoints: RestResourceEndpoints;
  readonly defaultInit?: RequestInit;
  readonly defaultQuery?: Record<string, unknown>;
  readonly cache?: RestResourceCacheOptions | null;
  readonly serializer?: IRestResourceSerializer<TModel>;
  readonly policies?: RestResourcePolicy<TModel>[];
}

const metadataKey = /*@__PURE__*/getResourceKeyFor('rest-resource');

export type RestResourceDecorator = <T extends Constructable>(target: T, context: ClassDecoratorContext<T>) => T | void;

export const RestResource = {
  name: metadataKey,

  isDefined<T extends Constructable>(Type: T): boolean {
    return Metadata.has(metadataKey, Type);
  },

  define<TModel = unknown>(options: RestResourceOptions<TModel> | null | undefined, Type: Constructable): RestResourceDefinition<TModel> {
    const definition = normalizeDefinition<TModel>(options ?? {}, Type);
    Metadata.define(definition, Type, metadataKey);
    return definition;
  },

  getDefinition<TModel = unknown>(Type: Constructable): RestResourceDefinition<TModel> | undefined {
    return Metadata.get(metadataKey, Type) as RestResourceDefinition<TModel> | undefined;
  },
};

export function restResource<TModel = unknown>(options?: RestResourceOptions<TModel>): RestResourceDecorator {
  return function (target, context) {
    context.addInitializer(function (this: Constructable) {
      RestResource.define(options, this);
    });
  };
}

export type RestResourceTarget<TModel = unknown> = Constructable | RestResourceOptions<TModel>;

export function getRestResourceDefinition<TModel = unknown>(target: RestResourceTarget<TModel>): RestResourceDefinition<TModel> {
  if (isFunction(target)) {
    const Type = target as Constructable;
    const existing = RestResource.getDefinition<TModel>(Type);
    if (existing != null) {
      return existing;
    }
    return RestResource.define({}, Type);
  }
  return normalizeDefinition(target);
}

function normalizeDefinition<TModel = unknown>(options: RestResourceOptions<TModel>, Type?: Constructable): RestResourceDefinition<TModel> {
  const resourceName = options.resource ?? (Type?.name != null ? toKebabCase(Type.name) : 'resource');
  const idKey = options.idKey ?? 'id';
  const defaultInit = cloneRequestInit(options.defaultInit ?? undefined);
  const defaultQuery = options.defaultQuery != null ? { ...options.defaultQuery } : undefined;
  const endpoints = resolveEndpoints(resourceName, idKey, options.endpoints ?? {});
  const key = options.key ?? Type?.name ?? resourceName;

  return Object.freeze({
    Type,
    key,
    baseUrl: options.baseUrl ?? '',
    resource: resourceName,
    idKey,
    endpoints,
    defaultInit,
    defaultQuery,
    cache: options.cache ?? undefined,
    serializer: options.serializer ?? undefined,
    policies: options.policies ? [...options.policies] : undefined,
  }) as RestResourceDefinition<TModel>;
}

function resolveEndpoints(resource: string, idKey: string, overrides: Partial<RestResourceEndpoints>): RestResourceEndpoints {
  const base = resource.replace(/\/+$/, '');
  const idPlaceholder = `:${idKey}`;

  return {
    list: overrides.list ?? base,
    getOne: overrides.getOne ?? `${base}/${idPlaceholder}`,
    getMany: overrides.getMany ?? base,
    create: overrides.create ?? base,
    update: overrides.update ?? `${base}/${idPlaceholder}`,
    replace: overrides.replace ?? `${base}/${idPlaceholder}`,
    patch: overrides.patch ?? `${base}/${idPlaceholder}`,
    delete: overrides.delete ?? `${base}/${idPlaceholder}`,
  };
}

function cloneRequestInit(init?: RequestInit): RequestInit | undefined {
  if (init == null) {
    return undefined;
  }
  const clone: RequestInit = { ...init };
  const headers = init.headers;
  if (headers != null) {
    if (headers instanceof Headers) {
      clone.headers = new Headers(headers);
    } else if (Array.isArray(headers)) {
      clone.headers = [...headers];
    } else {
      clone.headers = { ...headers };
    }
  }
  return clone;
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
