import { PLATFORM, Reporter } from '@aurelia/kernel';
import { IStoredNavigationEntry } from './navigator';
import { Queue, QueueItem } from './queue';

export interface INavigationStore {
  length: number;
  state: Record<string, unknown>;
  go(delta?: number, suppressPopstate?: boolean): Promise<void>;
  push(state: INavigationState): Promise<void>;
  replace(state: INavigationState): Promise<void>;
  pop(): Promise<void>;
}

export interface INavigationViewer {
  activate(callback: (ev?: INavigationViewerEvent) => void): Promise<void>;
  deactivate(): void;
}

export interface INavigationViewerEvent {
  event: PopStateEvent;
  state?: INavigationState;
  path: string;
  data: string;
  hash: string;
  instruction: string;
}

export interface INavigationState {
  NavigationEntries: IStoredNavigationEntry[];
  NavigationEntry: IStoredNavigationEntry;
}

interface Call {
  target: object;
  methodName: string;
  parameters: unknown[];
  propagateResolve?: boolean;
  suppressPopstate?: boolean;
}

interface ForwardedState {
  suppressPopstate?: boolean;
  resolve?: ((value?: void | PromiseLike<void>) => void);
}
export class BrowserNavigation implements INavigationStore, INavigationViewer {
  public window: Window;
  public history: History;
  public location: Location;

  public useHash: boolean;
  public allowedNoOfExecsWithinTick: number; // Limit no of executed actions within the same PLATFORM.Tick (due to browser limitation)

  private readonly pendingCalls: Queue<Call>;
  private isActive: boolean;
  private callback: (ev?: INavigationViewerEvent) => void;

  private forwardedState: ForwardedState;

  constructor() {
    this.window = window;
    this.history = window.history;
    this.location = window.location;
    this.useHash = true;
    this.allowedNoOfExecsWithinTick = 2;
    this.pendingCalls = new Queue<Call>(this.processCalls);
    this.isActive = false;
    this.callback = null;
    this.forwardedState = {};
  }

  public activate(callback: (ev?: INavigationViewerEvent) => void): Promise<void> {
    if (this.isActive) {
      throw new Error('Browser navigation has already been activated');
    }
    this.isActive = true;
    this.callback = callback;
    this.pendingCalls.activate(this.allowedNoOfExecsWithinTick);
    this.window.addEventListener('popstate', this.handlePopstate);

    return new Promise(resolve => {
      setTimeout(
        async () => {
          await this.handlePopstate(null);
          resolve();
        },
        0);
    });
  }
  public deactivate(): void {
    this.window.removeEventListener('popstate', this.handlePopstate);
    this.pendingCalls.deactivate();
    this.callback = null;
    this.isActive = false;
  }

  get length(): number {
    return this.history.length;
  }
  get state(): Record<string, unknown> {
    return this.history.state;
  }

  public go(delta?: number, suppressPopstate: boolean = false): Promise<void> {
    return this.enqueue(this.history, 'go', [delta], suppressPopstate);
  }

  public push(state: INavigationState): Promise<void> {
    const { title, path } = state.NavigationEntry;
    return this.enqueue(this.history, 'pushState', [state, title, `#${path}`]);
  }

  public replace(state: INavigationState): Promise<void> {
    const { title, path } = state.NavigationEntry;
    return this.enqueue(this.history, 'replaceState', [state, title, `#${path}`]);
  }

  public pop(): Promise<void> {
    return this.enqueue(this, 'popState', []);
  }

  public readonly handlePopstate = (ev: PopStateEvent): Promise<void> => {
    return this.enqueue(this, 'popstate', [ev]);
  }

  private popstate(ev: PopStateEvent, resolve: ((value?: void | PromiseLike<void>) => void), suppressPopstate: boolean = false): void {
    if (!suppressPopstate) {
      const { pathname, search, hash } = this.location;
      this.callback({
        event: ev,
        state: this.history.state,
        path: pathname,
        data: search,
        hash,
        instruction: this.useHash ? hash.slice(1) : pathname,
      });
    }
    if (resolve) {
      resolve();
    }
  }

  private async popState(resolve: ((value?: void | PromiseLike<void>) => void)): Promise<void> {
    await this.go(-1, true);
    const state = this.history.state;
    // TODO: Fix browser forward bug after pop on first entry
    if (state && state.navigationEntry && !state.NavigationEntry.firstEntry) {
      await this.go(-1, true);
      return this.push(state);
    }
    resolve();
  }

  private forwardState(state: ForwardedState): void {
    this.forwardedState = state;
  }

  // Everything that wants to await a browser event should pass suppressPopstate param
  // Events NOT resulting in popstate events should NOT pass suppressPopstate param
  private enqueue(target: object, methodName: string, parameters: unknown[], suppressPopstate?: boolean): Promise<void> {
    const calls: Call[] = [];
    const costs: number[] = [];
    const promises: Promise<void>[] = [];

    if (suppressPopstate !== undefined) {
      // Due to (browser) events not having a promise, we create and propagate one
      let resolve: ((value?: void | PromiseLike<void>) => void);
      // tslint:disable-next-line:promise-must-complete
      promises.push(new Promise(_resolve => {
        resolve = _resolve;
      }));

      calls.push({
        target: this,
        methodName: 'forwardState',
        parameters: [
          {
            resolve,
            suppressPopstate,
          }
        ],
      });
      costs.push(0);
    }

    calls.push({
      target: target,
      methodName: methodName,
      parameters: parameters,
    });
    costs.push(1);

    promises.push(this.pendingCalls.enqueue(calls, costs)[0]);
    return promises[0];
  }

  private readonly processCalls = (qCall: QueueItem<Call>): void => {
    const call = qCall as Call;

    if (call.target === this && call.methodName !== 'forwardState') {
      call.parameters.push(this.forwardedState.resolve);
      this.forwardedState.resolve = null;

      // Should we suppress this popstate event?
      if (call.methodName === 'popstate' && this.forwardedState.suppressPopstate) {
        call.parameters.push(true);
        this.forwardedState.suppressPopstate = false;
      }
    }
    const method = call.target[call.methodName];
    Reporter.write(10000, 'DEQUEUE', call.methodName, call.parameters);
    method.apply(call.target, call.parameters);
    qCall.resolve();
  }
}
