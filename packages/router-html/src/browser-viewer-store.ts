/* eslint-disable @typescript-eslint/promise-function-async */
import { IDOM, IScheduler } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
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

interface IAction {
  execute(task: QueueTask<IAction>, resolve?: ((value?: void | PromiseLike<void>) => void) | null | undefined, suppressEvent?: boolean): void;
}

interface IForwardedState {
  eventTask: QueueTask<IAction> | null;
  suppressPopstate: boolean;
}

export interface IBrowserViewerStoreOptions {
  useUrlFragmentHash?: boolean;
}

export class BrowserViewerStore implements INavigatorStore<Element>, INavigatorViewer<Element> {
  public window: Window;
  public history: History;
  public location: Location;

  public allowedExecutionCostWithinTick: number = 2; // Limit no of executed actions within the same RAF (due to browser limitation)

  private readonly pendingCalls: TaskQueue<IAction>;
  private isActive: boolean = false;
  private options: IBrowserViewerStoreOptions = {
    useUrlFragmentHash: true,
  };

  private forwardedState: IForwardedState = { eventTask: null, suppressPopstate: false };

  public constructor(
    @IScheduler public readonly scheduler: IScheduler,
    @IDOM dom: HTMLDOM,
    private readonly navigator: Navigator<Element>,
  ) {
    this.window = dom.window;
    this.history = dom.window.history;
    this.location = dom.window.location;
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
    this.window.addEventListener('popstate', this.handlePopstate as (ev: PopStateEvent) => void);
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Browser navigation has not been activated');
    }
    this.window.removeEventListener('popstate', this.handlePopstate as (ev: PopStateEvent) => void);
    this.pendingCalls.deactivate();
    this.options = { useUrlFragmentHash: true };
    this.isActive = false;
  }

  public get length(): number {
    return this.history.length;
  }
  public get state(): Record<string, unknown> {
    return this.history.state;
  }

  public get viewerState(): NavigatorViewerState {
    return NavigatorViewerState.fromLocation(this.location, this.options.useUrlFragmentHash === true);
  }

  public go(delta: number, suppressPopstateEvent: boolean = false): Promise<void> {
    const doneTask = this.pendingCalls.createQueueTask(task => task.resolve(), 1);

    this.pendingCalls.enqueue([
      task => {
        const store = this;
        const eventTask = doneTask;
        const suppressPopstate = suppressPopstateEvent;

        store.forwardState({ eventTask, suppressPopstate });
        task.resolve();
      },
      task => {
        const history = this.history;
        const steps = delta;

        history.go(steps);
        task.resolve();
      },
    ], [0, 1]);

    return doneTask.wait();
  }

  public pushNavigatorState(state: INavigatorState<Element>): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      task => {
        const history = this.history;
        const data = state;
        const titleOrEmpty = title || '';
        const url = `${fragment}${path}`;

        history.pushState(data, titleOrEmpty, url);
        task.resolve();
      }, 1).wait();
  }

  public replaceNavigatorState(state: INavigatorState<Element>): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      task => {
        const history = this.history;
        const data = state;
        const titleOrEmpty = title || '';
        const url = `${fragment}${path}`;

        history.replaceState(data, titleOrEmpty, url);
        task.resolve();
      }, 1).wait();
  }

  public popNavigatorState(): Promise<void> {
    const doneTask = this.pendingCalls.createQueueTask(task => task.resolve(), 1);

    this.pendingCalls.enqueue(
      async task => {
        const store = this;
        const eventTask = doneTask;

        await store.popState(eventTask);
        task.resolve();
      }, 1);
    return doneTask.wait();
  }

  public readonly handlePopstate = (event: PopStateEvent): Promise<void> => {
    const { eventTask, suppressPopstate } = this.forwardedState;
    this.forwardedState = { eventTask: null, suppressPopstate: false };

    return this.pendingCalls.enqueue(
      async task => {
        const store = this;
        const ev = event;
        const evTask = eventTask;
        const suppressPopstateEvent = suppressPopstate;

        await store.popstate(ev, evTask, suppressPopstateEvent);
        task.resolve();
      }, 1).wait();
  };

  public async popState(doneTask: QueueTask<IAction>): Promise<void> {
    await this.go(-1, true);
    const state = this.history.state;
    // TODO: Fix browser forward bug after pop on first entry
    if (state && state.navigationEntry && !state.navigationEntry.firstEntry) {
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
      const browserNavigationEvent: INavigatorViewerEvent<Element> = {
        ...this.viewerState,
        ...{
          event: ev,
          state: this.history.state,
        },
      };
      const entry: INavigatorEntry<Element> = (browserNavigationEvent.state && browserNavigationEvent.state.currentEntry
        ? browserNavigationEvent.state.currentEntry as INavigatorEntry<Element>
        : { instruction: '', fullStateInstruction: '' });
      entry.instruction = browserNavigationEvent.instruction;
      entry.fromBrowser = true;
      this.navigator.navigate(entry).catch(error => { throw error; });
    }
    if (eventTask !== null) {
      await eventTask.execute();
    }
  }
}
