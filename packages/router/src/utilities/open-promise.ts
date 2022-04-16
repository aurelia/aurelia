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
  public promise!: Promise<T>;

  /**
   * The resolve method of the promise
   */
  private _resolve!: (value?: T | PromiseLike<T>) => void;

  /**
   * The reject method of the promise
   */
  private _reject!: (reason?: any) => void;

  public constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve as (value?: T | PromiseLike<T>) => void;
      this._reject = reject;
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
  }

  /**
   * Reject the (open) promise.
   *
   * @param reason - The reason the promise is rejected
   */
  public reject(reason?: any): void {
    this._reject(reason);
    this.isPending = false;
  }
}
