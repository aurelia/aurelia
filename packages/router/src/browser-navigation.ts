import { PLATFORM, Reporter } from '@aurelia/kernel';

export interface NavigationStore {
}

export interface NavigationViewer {
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

export class BrowserNavigation implements NavigationStore, NavigationViewer {
  public window: Window;
  public history: History;
  public location: Location;

  public useHash: boolean;

  private readonly queue: QueueItem[];
  private isActive: boolean;
  private currentHistoryActivity: QueueItem;
  private unticked: number;
  private callback: (ev?: PopStateEvent) => void;

  private goResolve: ((value?: void | PromiseLike<void>) => void);
  private suppressPopstateResolve: ((value?: void | PromiseLike<void>) => void);

  constructor() {
    this.window = window;
    this.history = window.history;
    this.location = window.location;
    this.useHash = true;
    this.queue = [];
    this.isActive = false;
    this.currentHistoryActivity = null;
    this.unticked = 0;
    this.callback = null;
    this.goResolve = null;
    this.suppressPopstateResolve = null;
  }

  public activate(callback: (ev?: PopStateEvent) => void): Promise<void> {
    if (this.isActive) {
      throw Reporter.error(2003); // Browser navigation has already been activated
    }
    this.isActive = true;
    this.callback = callback;
    PLATFORM.ticker.add(this.dequeue, this);
    this.window.addEventListener('popstate', this.handlePopstate);
    return this.handlePopstate(null);
  }
  public deactivate(): void {
    this.window.removeEventListener('popstate', this.handlePopstate);
    PLATFORM.ticker.remove(this.dequeue, this);
    this.callback = null;
    this.isActive = false;
  }

  get state(): Record<string, unknown> {
    return this.history.state;
  }

  public async go(delta?: number, suppressPopstate: boolean = false): Promise<void> {
    if (!suppressPopstate) {
      const promise2 = this.enqueue(this, '_go', [delta], true);
      this.dequeue();
      return promise2;
    }
    const promise = this.enqueue(this, 'suppressPopstate', [], true);
    this.enqueue(this.history, 'go', [delta]).catch(error => { throw error; });
    this.dequeue();
    this.dequeue();
    return promise;
  }

  public async push(state: Record<string, unknown>): Promise<void> {
    const { title, path } = state.NavigationEntry as any;
    const promise = this.enqueue(this.history, 'pushState', [state, title, `#${path}`]);
    this.dequeue();
    return promise;
  }

  public async replace(state: Record<string, unknown>): Promise<void> {
    const { title, path } = state.NavigationEntry as any;
    const promise = this.enqueue(this.history, 'replaceState', [state, title, `#${path}`]);
    this.dequeue();
    return promise;
  }

  public async pop(): Promise<void> {
    const promise = this.enqueue(this, '_popState', []);
    this.dequeue();
    return promise;
  }

  public readonly handlePopstate = async (ev: PopStateEvent): Promise<void> => {
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
      const { pathname, search, hash } = this.location;
      this.callback({
        event: ev,
        state: this.history.state,
        path: pathname,
        data: search,
        hash,
        instruction: this.useHash ? hash.slice(1) : pathname,
      } as any);
    } else {
      const resolve = this.suppressPopstateResolve;
      this.suppressPopstateResolve = null;
      resolve();
    }
  }

  private _go(delta: number, resolve: ((value?: void | PromiseLike<void>) => void)): void {
    this.goResolve = resolve;
    this.history.go(delta);
  }

  private async _popState(resolve: ((value?: void | PromiseLike<void>) => void)): Promise<void> {
    await this.go(-1, true);
    const state = this.history.state;
    // TODO: Fix browser forward bug after pop on first entry
    if (!state.NavigationEntry.firstEntry) {
      await this.go(-1, true);
      return this.push(state);
    }
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
    if (delta === undefined) {
      this.unticked++;
      if (this.unticked > 2) {
        return;
      }
    } else {
      this.unticked = 0;
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
