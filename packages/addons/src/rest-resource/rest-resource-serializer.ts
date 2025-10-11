import type { RestResourceDefinition } from './rest-resource';

export interface RestSerializerInitializeInit {
  init?: RequestInit;
  body?: unknown;
}

export interface RestResourceSerializerContext<TModel = unknown> {
  operation: string;
  definition: RestResourceDefinition<TModel>;
}

export interface IRestResourceSerializer<TModel = unknown> {
  prepareRequest(init: RestSerializerInitializeInit, context: RestResourceSerializerContext<TModel>): RequestInit;
  read(response: Response, context: RestResourceSerializerContext<TModel>): Promise<unknown>;
}

export class JsonRestResourceSerializer implements IRestResourceSerializer {
  public prepareRequest(init: RestSerializerInitializeInit, _context: RestResourceSerializerContext): RequestInit {
    const baseInit: RequestInit = { ...(init.init ?? {}) };
    const headers = new Headers(baseInit.headers ?? undefined);
    if (init.body != null && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    const body = init.body != null ? JSON.stringify(init.body) : baseInit.body;
    return {
      ...baseInit,
      headers,
      body,
    };
  }

  public async read(response: Response, _context: RestResourceSerializerContext): Promise<unknown> {
    if (response.status === 204) {
      return null;
    }
    const contentType = response.headers.get('content-type');
    if (contentType != null && !contentType.includes('application/json')) {
      return response.text();
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    return response.json();
  }
}
