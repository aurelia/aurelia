import { Params } from './instructions';
import type { RouteNode } from './route-tree';

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;

/** @internal */
export class Batch {
  public _done: boolean = false;
  public readonly _head: Batch;
  private _next: Batch | null = null;

  private constructor(
    private _stack: number,
    private _cb: ((b: Batch) => void) | null,
    head: Batch | null,
  ) {
    this._head = head ?? this;
  }

  public static _start(cb: (b: Batch) => void): Batch {
    return new Batch(0, cb, null);
  }

  public _push(): void {
    let cur = this as Batch;
    do {
      ++cur._stack;
      cur = cur._next!;
    } while (cur !== null);
  }

  public _pop(): void {
    let cur = this as Batch;
    do {
      if (--cur._stack === 0) {
        cur._invoke();
      }
      cur = cur._next!;
    } while (cur !== null);
  }

  private _invoke(): void {
    const cb = this._cb;
    if (cb !== null) {
      this._cb = null;
      cb(this);
      this._done = true;
    }
  }

  public _continueWith(cb: (b: Batch) => void): Batch {
    if (this._next === null) {
      return this._next = new Batch(this._stack, cb, this._head);
    } else {
      return this._next._continueWith(cb);
    }
  }

  public _start(): Batch {
    this._head._push();
    this._head._pop();
    return this;
  }
}

export function mergeDistinct(prev: RouteNode[], next: RouteNode[]): RouteNode[] {
  prev = prev.slice();
  next = next.slice();
  const merged: RouteNode[] = [];
  while (prev.length > 0) {
    const p = prev.shift()!;
    const prevVpa = p.context.vpa;
    if (merged.every(m => m.context.vpa !== prevVpa)) {
      const i = next.findIndex(n => n.context.vpa === prevVpa);
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

export function ensureArrayOfStrings(value: string | string[]): string[] {
  return typeof value === 'string' ? [value] : value;
}

export function ensureString(value: string | string[]): string {
  return typeof value === 'string' ? value : value[0];
}

export function mergeURLSearchParams(source: URLSearchParams, other: Params | null, clone: boolean) {
  const query = clone ? new URLSearchParams(source) : source;
  if(other == null) return query;
  for(const [key, value] of Object.entries(other)) {
    if (value == null) continue;
    query.append(key, value);
  }
  return query;
}
