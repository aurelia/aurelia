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

  private flushing: boolean = false;
  private readonly items: Set<IFlushable> = new Set();

  public get count(): number {
    return this.items.size;
  }

  public add(callable: IFlushable): void {
    this.items.add(callable);
    if (this.flushing) {
      return;
    }
    this.flushing = true;
    const items = this.items;
    let item: IFlushable;
    try {
      for (item of items) {
        items.delete(item);
        item.flush();
      }
    } finally {
      this.flushing = false;
    }
  }

  public clear(): void {
    this.items.clear();
    this.flushing = false;
  }
}

function getFlushQueue() {
  return FlushQueue.instance;
}
