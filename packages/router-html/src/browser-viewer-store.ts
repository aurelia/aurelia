/* eslint-disable @typescript-eslint/promise-function-async */
import { IScheduler } from '@aurelia/runtime';
import {
  INavigatorState,
  INavigatorStore,
  INavigatorViewer,
  NavigatorViewerState,
  QueueTask,
  TaskQueue,
  INavigatorViewerEvent,
  INavigatorEntry,
  Navigator,
} from '@aurelia/router';
import { bound } from '@aurelia/kernel';
import { IWindow, IHistory, ILocation } from './interfaces';

interface IAction {
  execute(task: QueueTask<IAction>, resolve?: ((value?: void | PromiseLike<void>) => void) | null | undefined, suppressEvent?: boolean): void;
}

interface IForwardedState {
  resolve: (() => void) | null;
  suppressPopstate: boolean;
}

export interface IBrowserViewerStoreOptions {
  useUrlFragmentHash?: boolean;
}

export class BrowserViewerStore implements INavigatorStore<Element>, INavigatorViewer<Element> {
  public allowedExecutionCostWithinTick: number = 2; // Limit no of executed actions within the same RAF (due to browser limitation)

  private readonly pendingCalls: TaskQueue<IAction>;
  private isActive: boolean = false;
  private options: IBrowserViewerStoreOptions = {
    useUrlFragmentHash: true,
  };

  private forwardedState: IForwardedState = { resolve: null, suppressPopstate: false };

  public constructor(
    @IScheduler public readonly scheduler: IScheduler,
    @IWindow public readonly window: IWindow,
    @IHistory public readonly history: IHistory,
    @ILocation public readonly location: ILocation,
    private readonly navigator: Navigator<Element>,
  ) {
    this.pendingCalls = new TaskQueue<IAction>();
  }

  public activate(options: IBrowserViewerStoreOptions): void {
    if (this.isActive) {
      throw new Error('Browser navigation has already been activated');
    }
    this.isActive = true;
    if (options.useUrlFragmentHash != void 0) {
      this.options.useUrlFragmentHash = options.useUrlFragmentHash;
    }
    this.pendingCalls.activate({ scheduler: this.scheduler, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
    this.window.addEventListener('popstate', this.handlePopstate);
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Browser navigation has not been activated');
    }
    this.window.removeEventListener('popstate', this.handlePopstate);
    this.pendingCalls.deactivate();
    this.options = { useUrlFragmentHash: true };
    this.isActive = false;
  }

  public get length(): number {
    return this.history.length;
  }
  public get state(): Record<string, unknown> | null {
    // TODO: this cast is not necessarily safe. Either we should do some type checks (and throw on "invalid" state?), or otherwise ensure (e.g. with replaceState) that it's always an object.
    return this.history.state as Record<string, unknown> | null;
  }

  public get viewerState(): NavigatorViewerState {
    return NavigatorViewerState.fromLocation(this.location, this.options.useUrlFragmentHash === true);
  }

  public async go(delta: number, suppressPopstate: boolean = false): Promise<void> {
    let resolve: () => void;
    const eventPromise = new Promise($resolve => resolve = $resolve);

    this.pendingCalls.enqueue(
      task => {
        this.forwardedState = { resolve, suppressPopstate };
        this.history.go(delta);
        task.resolve();
      });

    await eventPromise;
  }

  public pushNavigatorState(state: INavigatorState<Element>): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      task => {
        this.history.pushState(state, title ?? '', `${fragment}${path}`);
        task.resolve();
      }).wait();
  }

  public replaceNavigatorState(state: INavigatorState<Element>): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      task => {
        this.history.replaceState(state, title ?? '', `${fragment}${path}`);
        task.resolve();
      }).wait();
  }

  public async popNavigatorState(): Promise<void> {
    let resolve: () => void;
    const promise = new Promise($resolve => resolve = $resolve);

    this.pendingCalls.enqueue(
      task => {
        this.forwardedState = { resolve, suppressPopstate: true };
        this.history.go(-1);
        task.resolve();
      });
    await promise;
  }

  @bound
  public handlePopstate(event: PopStateEvent): void {
    const { resolve, suppressPopstate } = this.forwardedState;
    this.forwardedState = { resolve: null, suppressPopstate: false };

    this.pendingCalls.enqueue(
      task => {
        if (!suppressPopstate) {
          const browserNavigationEvent: INavigatorViewerEvent<Element> = {
            ...this.viewerState,
            ...{
              event,
              state: this.history.state as INavigatorState<Element>,
            },
          };
          const entry: INavigatorEntry<Element> = browserNavigationEvent.state?.currentEntry ?? { instruction: '', fullStateInstruction: '' };
          entry.instruction = browserNavigationEvent.instruction;
          entry.fromBrowser = true;
          this.navigator.navigate(entry).catch(error => { throw error; });
        }
        if (resolve !== null) {
          resolve();
        }
        task.resolve();
      });
  }
}
