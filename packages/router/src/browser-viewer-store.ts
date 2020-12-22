import { IWindow, IHistory, ILocation, IPlatform } from '@aurelia/runtime-html';
import { INavigatorState, INavigatorStore, INavigatorViewer, INavigatorViewerOptions, INavigatorViewerState } from './navigator.js';
import { QueueTask, TaskQueue } from './task-queue.js';

/**
 * @internal
 */
interface IAction {
  execute(task: QueueTask<IAction>, resolve?: ((value?: void | PromiseLike<void>) => void) | null | undefined, suppressEvent?: boolean): void;
}

/**
 * @internal
 */
interface IForwardedState {
  eventTask: QueueTask<IAction> | null;
  suppressPopstate: boolean;
}

/**
 * @internal - Shouldn't be used directly
 */
export interface IBrowserViewerStoreOptions extends INavigatorViewerOptions {
  useUrlFragmentHash?: boolean;
}

/**
 * @internal - Shouldn't be used directly
 */
export class BrowserViewerStore implements INavigatorStore, INavigatorViewer {
  public allowedExecutionCostWithinTick: number = 2; // Limit no of executed actions within the same RAF (due to browser limitation)

  private readonly pendingCalls: TaskQueue<IAction>;
  private isActive: boolean = false;
  private options: IBrowserViewerStoreOptions = {
    useUrlFragmentHash: true,
    callback: () => { return; },
  };

  private forwardedState: IForwardedState = { eventTask: null, suppressPopstate: false };

  public constructor(
    @IPlatform public readonly platform: IPlatform,
    @IWindow public readonly window: IWindow,
    @IHistory public readonly history: IHistory,
    @ILocation public readonly location: ILocation,
  ) {
    this.pendingCalls = new TaskQueue<IAction>();
  }

  public start(options: IBrowserViewerStoreOptions): void {
    if (this.isActive) {
      throw new Error('Browser navigation has already been started');
    }
    this.isActive = true;
    this.options.callback = options.callback;
    if (options.useUrlFragmentHash != void 0) {
      this.options.useUrlFragmentHash = options.useUrlFragmentHash;
    }
    this.pendingCalls.start({ platform: this.platform, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
    this.window.addEventListener('popstate', this.handlePopstate as (e: PopStateEvent) => void);
  }

  public stop(): void {
    if (!this.isActive) {
      throw new Error('Browser navigation has not been started');
    }
    this.window.removeEventListener('popstate', this.handlePopstate as (e: PopStateEvent) => void);
    this.pendingCalls.stop();
    this.options = { useUrlFragmentHash: true, callback: () => { return; } };
    this.isActive = false;
  }

  public get length(): number {
    return this.history.length;
  }
  public get state(): Record<string, unknown> {
    return this.history.state as Record<string, unknown>;
  }

  public get viewerState(): INavigatorViewerState {
    const { pathname, search, hash } = this.location;
    return {
      path: pathname,
      query: search,
      hash,
      instruction: this.options.useUrlFragmentHash ? hash.slice(1) : pathname,
    };
  }

  public async go(delta: number, suppressPopstateEvent: boolean = false): Promise<void> {
    const doneTask: QueueTask<IAction> = this.pendingCalls.createQueueTask((task: QueueTask<IAction>) => task.resolve(), 1);

    this.pendingCalls.enqueue([
      (task: QueueTask<IAction>) => {
        const store: BrowserViewerStore = this;
        const eventTask: QueueTask<IAction> = doneTask;
        const suppressPopstate: boolean = suppressPopstateEvent;

        store.forwardState({ eventTask, suppressPopstate });
        task.resolve();
      },
      (task: QueueTask<IAction>) => {
        const history: History = this.history;
        const steps: number = delta;

        history.go(steps);
        task.resolve();
      },
    ], [0, 1]);

    return doneTask.wait();
  }

  public async pushNavigatorState(state: INavigatorState): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      (task: QueueTask<IAction>) => {
        const history: History = this.history;
        const data: INavigatorState = state;
        const titleOrEmpty: string = title || '';
        const url: string = `${fragment}${path}`;

        history.pushState(data, titleOrEmpty, url);
        task.resolve();
      }, 1).wait();
  }

  public async replaceNavigatorState(state: INavigatorState): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      (task: QueueTask<IAction>) => {
        const history: History = this.history;
        const data: INavigatorState = state;
        const titleOrEmpty: string = title || '';
        const url: string = `${fragment}${path}`;

        history.replaceState(data, titleOrEmpty, url);
        task.resolve();
      }, 1).wait();
  }

  public async popNavigatorState(): Promise<void> {
    const doneTask: QueueTask<IAction> = this.pendingCalls.createQueueTask((task: QueueTask<IAction>) => task.resolve(), 1);

    this.pendingCalls.enqueue(
      async (task: QueueTask<IAction>): Promise<void> => {
        const store: BrowserViewerStore = this;
        const eventTask: QueueTask<IAction> = doneTask;

        await store.popState(eventTask);
        task.resolve();
      }, 1);
    return doneTask.wait();
  }

  public readonly handlePopstate: (event: PopStateEvent) => Promise<void> =
    async (event: PopStateEvent): Promise<void> => {
      const { eventTask, suppressPopstate } = this.forwardedState;
      this.forwardedState = { eventTask: null, suppressPopstate: false };

      return this.pendingCalls.enqueue(
        async (task: QueueTask<IAction>) => {
          const store: BrowserViewerStore = this;
          const ev: PopStateEvent = event;
          const evTask: QueueTask<IAction> | null = eventTask;
          const suppressPopstateEvent: boolean = suppressPopstate;

          await store.popstate(ev, evTask, suppressPopstateEvent);
          task.resolve();
        }, 1).wait();
    };

  public async popState(doneTask: QueueTask<IAction>): Promise<void> {
    await this.go(-1, true);
    const state = this.history.state as INavigatorState;
    // TODO: Fix browser forward bug after pop on first entry
    if (state && state.currentEntry && !state.currentEntry.firstEntry) {
      await this.go(-1, true);
      await this.pushNavigatorState(state);
    }
    await doneTask.execute();
  }

  public forwardState(state: IForwardedState): void {
    this.forwardedState = state;
  }

  public async popstate(ev: PopStateEvent, eventTask: QueueTask<IAction> | null, suppressPopstate: boolean = false): Promise<void> {
    if (!suppressPopstate) {
      this.options.callback({
        ...this.viewerState,
        ...{
          event: ev,
          state: this.history.state as INavigatorState,
        },
      });
    }
    if (eventTask !== null) {
      await eventTask.execute();
    }
  }

  public setTitle(title: string): void {
    this.window.document.title = title;
  }
}
