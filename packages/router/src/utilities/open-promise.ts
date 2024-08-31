/**
 * The OpenPromise provides an open API to a promise.
 */
export class OpenPromise<T = void> {
  /**
   * Whether the promise is still pending (not settled)
   */
  public isPending: boolean = true;

  /**
   * The actual promise
   */
  public promise: Promise<T>;

  /**
   * The resolve method of the promise
   * @internal
   */
  private _resolve!: (value?: T | PromiseLike<T>) => void;

  /**
   * The reject method of the promise
   * @internal
   */
  private _reject!: (reason?: unknown) => void;

  public static promises: OpenPromise<any>[] = [];

  public constructor(public readonly description: string = '') {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve as (value?: T | PromiseLike<T>) => void;
      this._reject = reject;
      OpenPromise.promises.push(this);
    });
  }

  /**
   * Resolve the (open) promise.
   *
   * @param value - The value to resolve with
   */
  public resolve(value?: T | PromiseLike<T>): void {
    this._resolve(value);
    this.isPending = false;
    OpenPromise.promises = OpenPromise.promises.filter((promise) => promise !== this);
  }

  /**
   * Reject the (open) promise.
   *
   * @param reason - The reason the promise is rejected
   */
  public reject(reason?: unknown): void {
    this._reject(reason);
    this.isPending = false;
    OpenPromise.promises = OpenPromise.promises.filter((promise) => promise !== this);
  }
}

(window as any).OpenPromise = OpenPromise;
