import { Params } from './instructions';
import type { RouteNode } from './route-tree';

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
    query.append(key, value!);
  }
  return query;
}
