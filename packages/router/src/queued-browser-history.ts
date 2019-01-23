import { PLATFORM } from '@aurelia/kernel';

export interface QueuedBrowserHistory extends History {
  activate(callback: Function): void;
  deactivate(): void;
}

interface QueueItem {
  object: object;
  method: string;
  parameters: unknown[];
  resolve: Function;
}

export class QueuedBrowserHistory implements History {
  public history: History;

  private readonly queue: QueueItem[];
  private isActive: boolean;
  private processingItem: QueueItem;
  private callback: Function;

  constructor() {
    this.history = window.history;
    this.queue = [];
    this.isActive = false;
    this.processingItem = null;
    this.callback = null;
  }

  public activate(callback: Function): void {
    if (this.isActive) {
      throw new Error('Queued browser history has already been activated.');
    }
    this.isActive = true;
    this.callback = callback;
    PLATFORM.ticker.add(this.dequeue, this);
    window.addEventListener('popstate', this.handlePopstate);
  }
  public deactivate(): void {
    window.removeEventListener('popstate', this.handlePopstate);
    PLATFORM.ticker.remove(this.dequeue, this);
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

  private readonly handlePopstate = async (ev: PopStateEvent): Promise<void> => {
    await this.enqueue(this, 'popstate', [ev]);
  }

  private popstate(ev: PopStateEvent): void {
    this.callback(ev);
  }

  private enqueue(object: object, method: string, parameters: unknown[]): Promise<void> {
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
    if (!this.queue.length || this.processingItem !== null) {
      return;
    }
    this.processingItem = this.queue.shift();
    console.log('queued-browser-history', delta, this.processingItem.method, this.processingItem.parameters);
    const method = this.processingItem.object[this.processingItem.method];
    method.apply(this.processingItem.object, this.processingItem.parameters);
    const resolve = this.processingItem.resolve;
    this.processingItem = null;
    resolve();
  }
}
