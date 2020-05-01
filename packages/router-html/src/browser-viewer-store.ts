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
import { bound } from '@aurelia/kernel';

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
  public get state(): Record<string, unknown> {
    return this.history.state;
  }

  public get viewerState(): NavigatorViewerState {
    return NavigatorViewerState.fromLocation(this.location, this.options.useUrlFragmentHash === true);
  }

  public go(delta: number, suppressPopstate: boolean = false): Promise<void> {
    const eventTask = this.pendingCalls.createQueueTask(task => task.resolve(), 1);

    this.pendingCalls.enqueue([
      task => {
        this.forwardedState = { eventTask, suppressPopstate };
        task.resolve();
      },
      task => {
        this.history.go(delta);
        task.resolve();
      },
    ], [0, 1]);

    return eventTask.wait();
  }

  public pushNavigatorState(state: INavigatorState<Element>): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      task => {
        this.history.pushState(state, title ?? '', `${fragment}${path}`);
        task.resolve();
      }, 1).wait();
  }

  public replaceNavigatorState(state: INavigatorState<Element>): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      task => {
        this.history.replaceState(state, title ?? '', `${fragment}${path}`);
        task.resolve();
      }, 1).wait();
  }

  public popNavigatorState(): Promise<void> {
    const doneTask = this.pendingCalls.createQueueTask(task => task.resolve(), 1);

    this.pendingCalls.enqueue(
      async task => {
        await this.go(-1, true);
        const state = this.history.state;
        // TODO: Fix browser forward bug after pop on first entry
        if (state && state.navigationEntry && !state.navigationEntry.firstEntry) {
          await this.go(-1, true);
          await this.pushNavigatorState(state);
        }
        await doneTask.execute();
        task.resolve();
      }, 1);
    return doneTask.wait();
  }

  @bound
  public handlePopstate(event: PopStateEvent): void {
    const { eventTask, suppressPopstate } = this.forwardedState;
    this.forwardedState = { eventTask: null, suppressPopstate: false };

    this.pendingCalls.enqueue(
      async task => {
        if (!suppressPopstate) {
          const browserNavigationEvent: INavigatorViewerEvent<Element> = {
            ...this.viewerState,
            ...{
              event,
              state: this.history.state,
            },
          };
          const entry: INavigatorEntry<Element> = browserNavigationEvent.state?.currentEntry ?? { instruction: '', fullStateInstruction: '' };
          entry.instruction = browserNavigationEvent.instruction;
          entry.fromBrowser = true;
          this.navigator.navigate(entry).catch(error => { throw error; });
        }
        if (eventTask !== null) {
          await eventTask.execute();
        }
        task.resolve();
      }, 1);
  }
}
