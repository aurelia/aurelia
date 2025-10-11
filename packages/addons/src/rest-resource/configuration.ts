import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { HttpClient, IHttpClient } from '@aurelia/fetch-client';

import type { IRestResourceCache } from './rest-resource-cache';
import { MemoryRestResourceCache } from './rest-resource-cache';
import type { RestResourcePolicy } from './rest-resource-policy';
import type { IRestResourceSerializer } from './rest-resource-serializer';
import { JsonRestResourceSerializer } from './rest-resource-serializer';
import { IRestResourceDefaults, IRestResourceFactory, RestResourceFactory } from './rest-resource-client';

export interface RestResourcePluginOptions {
  baseUrl?: string;
  init?: RequestInit;
  cache?: IRestResourceCache | null | false;
  serializer?: IRestResourceSerializer;
  policies?: RestResourcePolicy[];
}

export class RestResourceDefaults {
  public readonly baseUrl: string;
  public readonly init: RequestInit | null;
  public readonly cache: IRestResourceCache | null;
  public readonly serializer: IRestResourceSerializer;
  public readonly policies: RestResourcePolicy[];

  public constructor(options: RestResourcePluginOptions = {}) {
    this.baseUrl = options.baseUrl ?? '';
    this.init = options.init ?? null;
    const cacheOption = options.cache ?? new MemoryRestResourceCache();
    this.cache = cacheOption === false ? null : (cacheOption ?? null);
    this.serializer = options.serializer ?? new JsonRestResourceSerializer();
    this.policies = options.policies ?? [];
  }

  public merge(options?: RestResourcePluginOptions): RestResourceDefaults {
    if (options == null) {
      return this;
    }
    return new RestResourceDefaults({
      baseUrl: options.baseUrl ?? this.baseUrl,
      init: options.init ?? this.init ?? undefined,
      cache: options.cache !== undefined ? options.cache : this.cache,
      serializer: options.serializer ?? this.serializer,
      policies: options.policies ?? this.policies,
    });
  }
}

function configure(container: IContainer, options?: RestResourcePluginOptions): IContainer {
  const defaults = new RestResourceDefaults(options);
  return container.register(
    Registration.singleton(IHttpClient, HttpClient),
    Registration.singleton(IRestResourceFactory, RestResourceFactory),
    Registration.instance(IRestResourceDefaults, defaults),
  );
}

export const RestResourceConfiguration = {
  register(container: IContainer): IContainer {
    return configure(container);
  },
  customize(options?: RestResourcePluginOptions): IRegistry {
    return {
      register(container: IContainer) {
        return configure(container, options);
      },
    };
  },
};
