import { PLATFORM } from '@aurelia/kernel';
import { wait } from './../test/e2e/doc-example/src/utils';

export interface QueuedBrowserHistory extends History {
  activate(callback: Function): void;
  deactivate(): void;
}

interface QueueItem {
  object: Object;
  method: string;
  parameters: any[];
  resolve: Function;
}

export class QueuedBrowserHistory implements History {
  public history: History;

  private queue: QueueItem[];
  private isActive: boolean;
  private processingItem: QueueItem;
  private callback: Function;
  private isTicking: boolean;

  constructor() {
    this.history = window.history;
    this.queue = [];
    this.isActive = false;
    this.processingItem = null;
    this.callback = null;
    this.isTicking = false;
  }

  public activate(callback: Function): void {
    if (this.isActive) {
      throw new Error('Queued browser history has already been activated.');
    }
    this.isActive = true;
    this.callback = callback;
    window.addEventListener('popstate', this.handlePopstate);
  }
  public deactivate(): void {
    window.removeEventListener('popstate', this.handlePopstate);
    this.callback = null;
    this.isActive = false;
  }

  get length(): number {
    return this.history.length;
  }
  get state(): any {
    return this.history.state;
  }
  get scrollRestoration(): ScrollRestoration {
    return this.history.scrollRestoration;
  }

  public async go(delta?: number): Promise<void> {
    await this.enqueue(this.history, 'go', [delta]);
  }
  public back(): Promise<void> {
    return this.go(-1);
  }
  public forward(): Promise<void> {
    return this.go(1);
  }

  public async pushState(data: any, title: string, url?: string | null): Promise<void> {
    await this.enqueue(this.history, 'pushState', [data, title, url]);
  }

  public async replaceState(data: any, title: string, url?: string | null): Promise<void> {
    await this.enqueue(this.history, 'replaceState', [data, title, url]);
  }

  private handlePopstate = async (ev: PopStateEvent): Promise<void> => {
    await this.enqueue(this, 'popstate', [ev]);
  }

  private popstate(ev: PopStateEvent): void {
    this.callback(ev);
  }

  private enqueue(object: Object, method: string, parameters: any[]): Promise<void> {
    let _resolve;
    const promise: Promise<void> = new Promise((resolve) => {
      _resolve = resolve;
    });
    this.queue.push({
      object: object,
      method: method,
      parameters: parameters,
      resolve: _resolve,
    });
    this.dequeue();
    return promise;
  }

  private async dequeue(delta?: number): Promise<void> {
    if (!this.queue.length) {
      if (this.isTicking) {
        console.log('queued-browser-history STOPPING tick');
        PLATFORM.ticker.remove(this.dequeue, this);
        this.isTicking = false;
      }
      return;
    }
    if (this.processingItem !== null) {
      if (!this.isTicking) {
        console.log('queued-browser-history STARTING tick');
        this.isTicking = true;
        PLATFORM.ticker.add(this.dequeue, this);
      }
      return;
    }
    this.processingItem = this.queue.shift();
    console.log('queued-browser-history', delta ? 'tick' : '', this.processingItem.method, this.processingItem.parameters);
    const method = this.processingItem.object[this.processingItem.method];
    method.apply(this.processingItem.object, this.processingItem.parameters);
    const resolve = this.processingItem.resolve;
    this.processingItem = null;
    resolve();
  }
}
