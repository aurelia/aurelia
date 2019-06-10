import { PLATFORM, Reporter } from '@aurelia/kernel';

export interface QueueItem<T> {
  resolve?: ((value?: void | PromiseLike<void>) => void);
  reject?: ((value?: void | PromiseLike<void>) => void);
  cost?: number;
}

export class Queue<T> {
  public isActive: boolean;
  public readonly pending: QueueItem<T>[];
  public processing: QueueItem<T>;
  public tickLimit: number;
  public unticked: number;
  private readonly callback: (item?: QueueItem<T>) => void;

  constructor(callback: (item?: QueueItem<T>) => void) {
    this.pending = [];
    this.processing = null;
    this.callback = callback;
    this.tickLimit = null;
    this.unticked = 0;
    this.isActive = false;
  }

  public get length(): number {
    return this.pending.length;
  }

  public activate(tickLimit: number): void {
    if (this.isActive) {
      // TODO: Fix error message
      throw Reporter.error(0);
    }
    this.isActive = true;
    this.tickLimit = tickLimit;
    PLATFORM.ticker.add(this.dequeue, this);
  }
  public deactivate(): void {
    if (!this.isActive) {
      // TODO: Fix error message
      throw Reporter.error(0);
    }
    PLATFORM.ticker.remove(this.dequeue, this);
    this.tickLimit = null;
    this.isActive = false;
  }

  public enqueue(itemOrItems: T | T[], costOrCosts?: number | number[]): Promise<void> | Promise<void>[] {
    const list = Array.isArray(itemOrItems);
    const items: T[] = list ? itemOrItems as T[] : [itemOrItems as T];
    const costs: number[] = items
      .map((value, index) => !Array.isArray(costOrCosts) ? costOrCosts : costOrCosts[index])
      .map(value => value !== undefined ? value : 1);
    const promises: Promise<void>[] = [];
    for (const item of items) {
      const qItem: QueueItem<T> = { ...item };
      qItem.cost = costs.shift();
      // tslint:disable-next-line:promise-must-complete
      promises.push(new Promise((resolve, reject) => {
        qItem.resolve = () => {
          resolve();
          this.processing = null;
          this.dequeue();
        };
        qItem.reject = () => {
          reject();
          this.processing = null;
          this.dequeue();
        };
      }));
      this.pending.push(qItem);
    }
    this.dequeue();
    return list ? promises : promises[0];
  }

  public dequeue(delta?: number): void {
    if (this.processing !== null) {
      return;
    }
    if (!this.pending.length) {
      this.unticked = 0;
      return;
    }
    if (this.tickLimit !== null) {
      if (delta === undefined) {
        if (this.unticked + this.pending[0].cost > this.tickLimit) {
          return;
        }
      } else {
        this.unticked = 0;
      }
    }
    this.processing = this.pending.shift();
    this.unticked += this.processing.cost;
    this.callback(this.processing);
  }
}
