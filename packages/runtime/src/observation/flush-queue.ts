import { def } from '../utilities-objects.js';

/* eslint-disable @typescript-eslint/ban-types */
/**
 * Add a readonly 'queue' property on the target class to return the default FlushQueue
 * implementation
 */
export function withFlushQueue(): ClassDecorator;
export function withFlushQueue(target: Function): void;
export function withFlushQueue(target?: Function): ClassDecorator | void {
  return target == null ? queueableDeco : queueableDeco(target);
}

function queueableDeco(target: Function): void {
  const proto = target.prototype as IWithFlushQueue;
  def(proto, 'queue', { get: getFlushQueue });
}
/* eslint-enable @typescript-eslint/ban-types */

export interface IFlushable {
  flush(): void;
}

export interface IWithFlushQueue {
  queue: FlushQueue;
}

export class FlushQueue {
  public static readonly instance: FlushQueue = new FlushQueue();

  private _flushing: boolean = false;
  private readonly _items: Set<IFlushable> = new Set();

  public get count(): number {
    return this._items.size;
  }

  public add(callable: IFlushable): void {
    this._items.add(callable);
    if (this._flushing) {
      return;
    }
    this._flushing = true;
    const items = this._items;
    let item: IFlushable;
    try {
      for (item of items) {
        items.delete(item);
        item.flush();
      }
    } finally {
      this._flushing = false;
    }
  }

  public clear(): void {
    this._items.clear();
    this._flushing = false;
  }
}

function getFlushQueue() {
  return FlushQueue.instance;
}
