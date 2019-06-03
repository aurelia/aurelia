import { PLATFORM, Reporter } from '@aurelia/kernel';

export interface QueueItem<T> {
  resolve?: ((value?: void | PromiseLike<void>) => void);
  reject?: ((value?: void | PromiseLike<void>) => void);
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

  public async enqueue(item: T): Promise<void> {
    const qItem: QueueItem<T> = { ...item };
    // tslint:disable-next-line:promise-must-complete
    const promise: Promise<void> = new Promise((resolve, reject) => {
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
    });
    this.pending.push(qItem);
    this.dequeue();
    return promise;
  }

  public dequeue(delta?: number): void {
    if (this.processing !== null || !this.pending.length) {
      return;
    }
    if (this.tickLimit !== null) {
      if (delta === undefined) {
        this.unticked++;
        if (this.unticked > this.tickLimit) {
          return;
        }
      } else {
        this.unticked = 0;
      }
    }
    this.processing = this.pending.shift();
    this.callback(this.processing);
  }
}
