import { IFetchInterceptor } from '../interfaces';

/**
 * The part of `ITransferState` (from `@aurelia/runtime-html`) that the transfer cache uses.
 * It is described here so the fetch client does not depend on the rendering packages.
 */
export interface ITransferCacheStore {
  readonly isServer: boolean;
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

export interface ITransferCacheOptions {
  /**
   * Response headers to record besides `content-type`. Recorded values are embedded in the page,
   * so list only headers the client reads.
   */
  includeHeaders?: readonly string[];
  /** Return `false` to keep a request out of the cache. */
  filter?(request: Request): boolean;
}

/** A recorded response, with short keys because every entry is embedded in the server's HTML. */
interface ITransferredResponse {
  /** body */
  b: string | null;
  /** status */
  s: number;
  /** status text */
  t: string;
  /** headers */
  h: [string, string][];
  /** final URL, recorded only when a redirect made it differ from the request URL */
  u?: string;
}

/**
 * Bodies travel as text, so only types that are text by definition are recorded. Subtypes must match
 * exactly or as a `+json`/`+xml` suffix: a substring test would admit binary types such as
 * `application/vnd.openxmlformats-officedocument.wordprocessingml.document`. `text/event-stream`
 * is excluded because reading it waits for a stream that may never close.
 */
const textContentType = /^(?:text\/(?!event-stream\s*(?:;|$))[\w.+-]+|application\/(?:[\w.-]+\+)?(?:json|xml)|application\/(?:javascript|x-www-form-urlencoded))\s*(?:;|$)/i;

/**
 * Records GET and HEAD responses during a server render and replays them on the client,
 * so components keep calling the http client and hydration does not request the same data again.
 *
 * ```ts
 * http.configure(c => c.withInterceptor(new TransferCacheInterceptor(resolve(ITransferState))));
 * ```
 */
export class TransferCacheInterceptor implements IFetchInterceptor {
  /** @internal */
  private readonly _store: ITransferCacheStore;
  /** @internal */
  private readonly _headers: readonly string[];
  /** @internal */
  private readonly _filter: ((request: Request) => boolean) | undefined;

  public constructor(store: ITransferCacheStore, options?: ITransferCacheOptions) {
    this._store = store;
    this._headers = ['content-type', ...(options?.includeHeaders ?? [])];
    this._filter = options?.filter;
  }

  public request(request: Request): Request | Response {
    const store = this._store;
    if (store.isServer || !this._isCacheable(request)) {
      return request;
    }
    const key = getTransferKey(request);
    const entry = store.get<ITransferredResponse>(key);
    if (entry === void 0) {
      return request;
    }
    // A replayed response describes the page as the server rendered it. Later requests,
    // such as a refresh after the user acts, must reach the network.
    store.remove(key);
    const response = new Response(entry.b, { status: entry.s, statusText: entry.t, headers: entry.h });
    // A constructed response has an empty `url`, which breaks response interceptors that read it.
    Object.defineProperty(response, 'url', { value: entry.u ?? request.url });
    return response;
  }

  public async response(response: Response, request?: Request): Promise<Response> {
    if (!this._store.isServer || request === void 0 || !response.ok || !this._isCacheable(request)) {
      return response;
    }
    const headers = response.headers;
    const cacheControl = headers.get('cache-control');
    const hasBody = request.method !== 'HEAD' && response.status !== 204 && response.status !== 205;
    if (
      // A response that sets a cookie or forbids shared caching is specific to the server's request.
      headers.has('set-cookie')
      || cacheControl !== null && /no-store|private/i.test(cacheControl)
      || hasBody && !textContentType.test(headers.get('content-type') ?? '')
    ) {
      return response;
    }
    const recorded: [string, string][] = [];
    for (const name of this._headers) {
      const value = headers.get(name);
      if (value !== null) {
        recorded.push([name, value]);
      }
    }
    const entry: ITransferredResponse = {
      b: hasBody ? await response.clone().text() : null,
      s: response.status,
      t: response.statusText,
      h: recorded,
    };
    if (response.url !== '' && response.url !== request.url) {
      entry.u = response.url;
    }
    this._store.set(getTransferKey(request), entry);
    return response;
  }

  /** @internal */
  private _isCacheable(request: Request): boolean {
    const method = request.method;
    return (method === 'GET' || method === 'HEAD')
      // Credentialed responses can hold one user's data, which must not end up in HTML a CDN or shared cache serves to others.
      && !request.headers.has('authorization')
      && !request.headers.has('cookie')
      && (this._filter?.(request) ?? true);
  }
}

function getTransferKey(request: Request): string {
  return `http:${request.method} ${request.url}`;
}
