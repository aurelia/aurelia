import { IPlatform } from './platform';
import { createInterface } from './utilities-di';

/** The `id` of the `<script type="application/json">` element that carries the server's state to the client. */
export const transferStateId = 'au-state';

/**
 * Serializable state recorded during a server render and read by the client, so hydration
 * reuses the server's data instead of loading it again and flashing back to a loading state.
 */
export interface ITransferState {
  /** `true` while a server render records state for the client. */
  readonly isServer: boolean;
  has(key: string): boolean;
  get<T>(key: string): T | undefined;
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  /**
   * On the server, runs `load` and records its result under `key`.
   * On the client, returns the recorded value once and removes it, or runs `load` when there is none.
   */
  getOrLoad<T>(key: string, load: () => T | Promise<T>): Promise<T>;
  /** The state as JSON that is safe to embed in a `<script type="application/json">` element. */
  serialize(): string;
}

/**
 * Without an explicit registration this resolves to a client store seeded from the
 * `<script id="au-state">` element, so the same component code runs in a plain SPA,
 * on the server and during hydration. Servers register `new TransferState(void 0, true)`.
 */
export const ITransferState = /*@__PURE__*/createInterface<ITransferState>('ITransferState', x => x.cachedCallback(handler =>
  new TransferState(readTransferState(handler.get(IPlatform).document))
));

export class TransferState implements ITransferState {
  /** @internal */
  private readonly _values: Map<string, unknown>;

  public constructor(
    data?: Record<string, unknown>,
    public readonly isServer: boolean = false,
  ) {
    this._values = new Map(data === void 0 ? void 0 : Object.entries(data));
  }

  public has(key: string): boolean {
    return this._values.has(key);
  }

  public get<T>(key: string, fallback?: T): T | undefined {
    return this._values.has(key) ? this._values.get(key) as T : fallback;
  }

  public set<T>(key: string, value: T): void {
    this._values.set(key, value);
  }

  public remove(key: string): void {
    this._values.delete(key);
  }

  public async getOrLoad<T>(key: string, load: () => T | Promise<T>): Promise<T> {
    if (this.isServer) {
      const value = await load();
      this._values.set(key, value);
      return value;
    }
    if (this._values.has(key)) {
      const value = this._values.get(key) as T;
      // The recorded value describes the page as the server rendered it. Serving it again on a
      // later visit or refresh would show stale data, so only the first read after hydration uses it.
      this._values.delete(key);
      return value;
    }
    return load();
  }

  public serialize(): string {
    // Escaping `<` keeps `</script>` and `<!--` in values from ending the script element early.
    // `<` is a JSON escape, so `JSON.parse` restores it without a separate unescape step.
    return JSON.stringify(Object.fromEntries(this._values)).replace(/</g, '\\u003c');
  }
}

function readTransferState(doc: Document | undefined): Record<string, unknown> | undefined {
  const text = doc?.getElementById(transferStateId)?.textContent;
  if (!text) {
    return void 0;
  }
  try {
    const data: unknown = JSON.parse(text);
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
  } catch {
    // Unreadable state costs a refetch, which is what the client did before it had transfer state.
    // Failing here would stop the whole app from hydrating.
  }
  return void 0;
}
