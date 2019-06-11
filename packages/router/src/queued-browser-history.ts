import { InjectArray, PLATFORM, Reporter } from '@aurelia/kernel';
import { ILifecycle, Priority } from '@aurelia/runtime';
import { DOM } from '@aurelia/runtime-html';

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
  public static readonly inject: InjectArray = [ILifecycle];

  private readonly lifecycle: ILifecycle;
  private readonly queue: QueueItem[];
  private isActive: boolean;
  private currentHistoryActivity: QueueItem;
  private callback: (ev?: PopStateEvent) => void;

  private goResolve: ((value?: void | PromiseLike<void>) => void);
  private suppressPopstateResolve: ((value?: void | PromiseLike<void>) => void);

  constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;
    this.queue = [];
    this.isActive = false;
    this.currentHistoryActivity = null;
    this.callback = null;
    this.goResolve = null;
    this.suppressPopstateResolve = null;
  }

  public activate(callback: (ev?: PopStateEvent) => void): void {
    if (this.isActive) {
      throw Reporter.error(2003);
    }
    this.isActive = true;
    this.callback = callback;
    this.lifecycle.enqueueRAF(this.dequeue, this, Priority.low);
    DOM.window.addEventListener('popstate', this.handlePopstate);
  }
  public deactivate(): void {
    DOM.window.removeEventListener('popstate', this.handlePopstate);
    this.lifecycle.dequeueRAF(this.dequeue, this);
    this.callback = null;
    this.isActive = false;
  }

  get length(): number {
    return DOM.window.history.length;
  }
  // tslint:disable-next-line:no-any - typed according to DOM
  get state(): any {
    return DOM.window.history.state;
  }
  get scrollRestoration(): ScrollRestoration {
    return DOM.window.history.scrollRestoration;
  }

  public async go(delta?: number, suppressPopstate: boolean = false): Promise<void> {
    if (!suppressPopstate) {
      return this.enqueue(this, '_go', [delta], true);
    }
    const promise = this.enqueue(this, 'suppressPopstate', [], true);
    this.enqueue(DOM.window.history, 'go', [delta]).catch(error => { throw error; });
    return promise;
  }
  public back(): Promise<void> {
    return this.go(-1);
  }
  public forward(): Promise<void> {
    return this.go(1);
  }

  // tslint:disable-next-line:no-any - typed according to DOM
  public async pushState(data: any, title: string, url?: string | null): Promise<void> {
    return this.enqueue(DOM.window.history, 'pushState', [data, title, url]);
  }

  // tslint:disable-next-line:no-any - typed according to DOM
  public async replaceState(data: any, title: string, url?: string | null): Promise<void> {
    return this.enqueue(DOM.window.history, 'replaceState', [data, title, url]);
  }

  private readonly handlePopstate = async (ev: PopStateEvent): Promise<void> => {
    return this.enqueue(this, 'popstate', [ev]);
  }

  private async popstate(ev: PopStateEvent): Promise<void> {
    if (!this.suppressPopstateResolve) {
      if (this.goResolve) {
        const resolve = this.goResolve;
        this.goResolve = null;
        resolve();
        await Promise.resolve();
      }
      this.callback(ev);
    } else {
      const resolve = this.suppressPopstateResolve;
      this.suppressPopstateResolve = null;
      resolve();
    }
  }

  private _go(delta: number, resolve: ((value?: void | PromiseLike<void>) => void)): void {
    this.goResolve = resolve;
    DOM.window.history.go(delta);
  }

  private suppressPopstate(resolve: ((value?: void | PromiseLike<void>) => void)): void {
    this.suppressPopstateResolve = resolve;
  }

  private enqueue(target: object, methodName: string, parameters: unknown[], resolveInParameters: boolean = false): Promise<void> {
    let _resolve;
    // tslint:disable-next-line:promise-must-complete
    const promise: Promise<void> = new Promise((resolve) => {
      _resolve = resolve;
    });
    if (resolveInParameters) {
      parameters.push(_resolve);
      _resolve = null;
    }
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
    if (resolve) {
      resolve();
    }
  }
}
