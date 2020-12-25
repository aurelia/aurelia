import { RouteNode } from './route-tree.js';

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;

export class Batch {
  public done: boolean = false;
  public readonly head: Batch;
  private next: Batch | null = null;

  private constructor(
    private stack: number,
    private cb: ((b: Batch) => void) | null,
    head: Batch | null,
  ) {
    this.head = head ?? this;
  }

  public static start(cb: (b: Batch) => void): Batch {
    return new Batch(0, cb, null);
  }

  public push(): void {
    let cur = this as Batch;
    do {
      ++cur.stack;
      cur = cur.next!;
    } while (cur !== null);
  }

  public pop(): void {
    let cur = this as Batch;
    do {
      if (--cur.stack === 0) {
        cur.invoke();
      }
      cur = cur.next!;
    } while (cur !== null);
  }

  private invoke(): void {
    const cb = this.cb;
    if (cb !== null) {
      this.cb = null;
      cb(this);
      this.done = true;
    }
  }

  public continueWith(cb: (b: Batch) => void): Batch {
    if (this.next === null) {
      return this.next = new Batch(this.stack, cb, this.head);
    } else {
      return this.next.continueWith(cb);
    }
  }

  public start(): Batch {
    this.head.push();
    this.head.pop();
    return this;
  }
}

/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
export function resolveAll(maybePromises: (void | Promise<void>)[]): void | Promise<void> {
  const promises: Promise<void>[] = [];
  for (const maybePromise of maybePromises) {
    if (maybePromise instanceof Promise) {
      promises.push(maybePromise);
    }
  }

  switch (promises.length) {
    case 0:
      return;
    case 1:
      return promises[0];
    default:
      return Promise.all(promises) as unknown as Promise<void>;
  }
}

export type ExposedPromise<T> = Promise<T> & {
  resolve(value?: T): void;
  reject(reason?: unknown): void;
};

export function createExposedPromise<T>(): ExposedPromise<T> {
  let $resolve: (value?: T) => void = (void 0)!;
  let $reject: (reason?: unknown) => void = (void 0)!;
  const promise = new Promise<void | T>(function (resolve, reject) {
    $resolve = resolve;
    $reject = reject;
  }) as ExposedPromise<T>;
  promise.resolve = $resolve;
  promise.reject = $reject;
  return promise;
}

export function mergeDistinct(prev: RouteNode[], next: RouteNode[]): RouteNode[] {
  prev = prev.slice();
  next = next.slice();
  const merged: RouteNode[] = [];
  while (prev.length > 0) {
    const p = prev.shift()!;
    if (merged.every(m => m.context.vpa !== p.context.vpa)) {
      const i = next.findIndex(n => n.context.vpa === p.context.vpa);
      if (i >= 0) {
        merged.push(...next.splice(0, i + 1));
      } else {
        merged.push(p);
      }
    }
  }
  merged.push(...next);
  return merged;
}

export function tryStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}
