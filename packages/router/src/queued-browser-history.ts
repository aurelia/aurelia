import { PLATFORM, Reporter } from '@aurelia/kernel';

export interface QueuedBrowserHistory extends History {
  activate(callback: (ev?: PopStateEvent) => void): void;
  deactivate(): void;
}

interface QueueItem {
  target: object;
  methodName: string;
  parameters: unknown[];
  // TODO: Could someone verify this? It's the resolve from a Promise<void>
  resolve: ((value?: void | PromiseLike<void>) => void);
}

export class QueuedBrowserHistory implements QueuedBrowserHistory {
  public window: Window;
  public history: History;

  private readonly queue: QueueItem[];
  private isActive: boolean;
  private currentHistoryActivity: QueueItem;
  private callback: (ev?: PopStateEvent) => void;

  constructor() {
    this.window = window;
    this.history = window.history;
    this.queue = [];
    this.isActive = false;
    this.currentHistoryActivity = null;
    this.callback = null;
  }

  public activate(callback: (ev?: PopStateEvent) => void): void {
    if (this.isActive) {
      throw Reporter.error(2003);
    }
    this.isActive = true;
    this.callback = callback;
    PLATFORM.ticker.add(this.dequeue, this);
    this.window.addEventListener('popstate', this.handlePopstate);
  }
  public deactivate(): void {
    this.window.removeEventListener('popstate', this.handlePopstate);
    PLATFORM.ticker.remove(this.dequeue, this);
    this.callback = null;
    this.isActive = false;
  }

  get length(): number {
    return this.history.length;
  }
  // tslint:disable-next-line:no-any - typed according to DOM
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

  // tslint:disable-next-line:no-any - typed according to DOM
  public async pushState(data: any, title: string, url?: string | null): Promise<void> {
    await this.enqueue(this.history, 'pushState', [data, title, url]);
  }

  // tslint:disable-next-line:no-any - typed according to DOM
  public async replaceState(data: any, title: string, url?: string | null): Promise<void> {
    await this.enqueue(this.history, 'replaceState', [data, title, url]);
  }

  private readonly handlePopstate = async (ev: PopStateEvent): Promise<void> => {
    await this.enqueue(this, 'popstate', [ev]);
  }

  private popstate(ev: PopStateEvent): void {
    this.callback(ev);
  }

  private enqueue(target: object, methodName: string, parameters: unknown[]): Promise<void> {
    let _resolve;
    // tslint:disable-next-line:promise-must-complete
    const promise: Promise<void> = new Promise((resolve) => {
      _resolve = resolve;
    });
    this.queue.push({
      target: target,
      methodName: methodName,
      parameters: parameters,
      resolve: _resolve,
    });
    return promise;
  }

  private async dequeue(delta?: number): Promise<void> {
    if (!this.queue.length || this.currentHistoryActivity !== null) {
      return;
    }
    this.currentHistoryActivity = this.queue.shift();
    const method = this.currentHistoryActivity.target[this.currentHistoryActivity.methodName];
    Reporter.write(10000, 'DEQUEUE', this.currentHistoryActivity.methodName, this.currentHistoryActivity.parameters);
    method.apply(this.currentHistoryActivity.target, this.currentHistoryActivity.parameters);
    const resolve = this.currentHistoryActivity.resolve;
    this.currentHistoryActivity = null;
    resolve();
  }
}
