// tslint:disable:max-line-length
import { IDOM, IScheduler } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { INavigatorState, INavigatorStore, INavigatorViewer, INavigatorViewerOptions, INavigatorViewerState } from './navigator';
import { QueueTask, TaskQueue } from './task-queue';

interface IAction {
  execute(task: QueueTask<IAction>, resolve?: ((value?: void | PromiseLike<void>) => void) | null | undefined, suppressEvent?: boolean): void;
}

class HistoryGoAction implements IAction {
  public constructor(
    public readonly taskQueue: TaskQueue<IAction>,
    public readonly history: History,
    public readonly delta: number,
    public readonly suppressPopstate: boolean = false,
  ) { }

  public execute(task: QueueTask<IAction>): void {
    this.history.go(this.delta);
    task.resolve();
  }
}
class HistoryPushStateAction implements IAction {
  public constructor(
    public readonly history: History,
    public readonly data: any,
    public readonly title: string,
    public readonly url?: string,
  ) { }

  public execute(task: QueueTask<IAction>): void {
    this.history.pushState(this.data, this.title, this.url);
    task.resolve();
  }
}
class HistoryReplaceStateAction implements IAction {
  public constructor(
    public readonly history: History,
    public readonly data: any,
    public readonly title: string,
    public readonly url?: string,
  ) { }

  public execute(task: QueueTask<IAction>): void {
    this.history.replaceState(this.data, this.title, this.url);
    task.resolve();
  }
}
class HistoryPopStateAction implements IAction {
  public constructor(
    public readonly store: BrowserViewerStore,
    public readonly doneTask: QueueTask<IAction>
  ) { }

  public async execute(task: QueueTask<IAction>): Promise<void> {
    await this.store.popState(this.doneTask);
    task.resolve();
  }
}
class ForwardStateAction implements IAction {
  public constructor(
    public readonly store: BrowserViewerStore,
    public readonly task: QueueTask<IAction> | null,
    public readonly suppressPopstate: boolean = false,
  ) { }

  public execute(task: QueueTask<IAction>): void {
    this.store.forwardState({ eventTask: this.task, suppressPopstate: this.suppressPopstate });
    task.resolve();
  }
}
class PopstateEventAction implements IAction {
  public constructor(
    public readonly store: BrowserViewerStore,
    public readonly ev: PopStateEvent,
    public readonly eventTask: QueueTask<IAction> | null,
    public readonly suppressPopstate: boolean,
  ) { }

  public execute(task: QueueTask<IAction>): void {
    this.store.popstate(this.ev, this.eventTask, this.suppressPopstate);
    task.resolve();
  }
}
class NoopAction implements IAction {
  public execute(task: QueueTask<IAction>): void {
    task.resolve();
  }
}

interface IForwardedState {
  eventTask: QueueTask<IAction> | null;
  suppressPopstate: boolean;
}

export interface IBrowserViewerStoreOptions extends INavigatorViewerOptions {
  useUrlFragmentHash?: boolean;
}

export class BrowserViewerStore implements INavigatorStore, INavigatorViewer {
  public window: Window;
  public history: History;
  public location: Location;

  public allowedExecutionCostWithinTick: number = 2; // Limit no of executed actions within the same RAF (due to browser limitation)

  private readonly pendingCalls: TaskQueue<IAction>;
  private isActive: boolean = false;
  private options: IBrowserViewerStoreOptions = {
    useUrlFragmentHash: true,
    callback: () => { },
  };

  private forwardedState: IForwardedState = { eventTask: null, suppressPopstate: false };

  public constructor(
    @IScheduler public readonly scheduler: IScheduler,
    @IDOM dom: HTMLDOM
  ) {
    this.window = dom.window;
    this.history = dom.window.history;
    this.location = dom.window.location;
    this.pendingCalls = new TaskQueue<IAction>(this.processCalls);
  }

  public activate(options: IBrowserViewerStoreOptions): void {
    if (this.isActive) {
      throw new Error('Browser navigation has already been activated');
    }
    this.isActive = true;
    this.options.callback = options.callback;
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
    this.options = { useUrlFragmentHash: true, callback: () => { } };
    this.isActive = false;
  }

  public get length(): number {
    return this.history.length;
  }
  public get state(): Record<string, unknown> {
    return this.history.state;
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

  public go(delta: number, suppressPopstate: boolean = false): Promise<void> {
    const eventTask: QueueTask<IAction> = this.pendingCalls.createQueueTask(new NoopAction(), 1);
    this.pendingCalls.enqueue([
      new ForwardStateAction(this, eventTask, suppressPopstate),
      new HistoryGoAction(this.pendingCalls, this.history, delta, suppressPopstate),
    ], [0, 1]);
    return eventTask.wait();
  }

  public pushNavigatorState(state: INavigatorState): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment: string = this.options.useUrlFragmentHash ? '#/' : '';
    return this.pendingCalls.enqueue(
      new HistoryPushStateAction(this.history, state, title || '', `${fragment}${path}`), 1
    ).wait();
  }

  public replaceNavigatorState(state: INavigatorState): Promise<void> {
    const { title, path } = state.currentEntry;
    const fragment: string = this.options.useUrlFragmentHash ? '#/' : '';
    return this.pendingCalls.enqueue(
      new HistoryReplaceStateAction(this.history, state, title || '', `${fragment}${path}`), 1
    ).wait();
  }

  public popNavigatorState(): Promise<void> {
    const doneTask: QueueTask<IAction> = this.pendingCalls.createQueueTask(new NoopAction(), 1);
    this.pendingCalls.enqueue(
      new HistoryPopStateAction(this, doneTask), 1
    );
    return doneTask.wait();
  }

  public readonly handlePopstate = (ev: PopStateEvent): Promise<void> => {
    const { eventTask, suppressPopstate } = this.forwardedState;
    this.forwardedState = { eventTask: null, suppressPopstate: false };
    return this.pendingCalls.enqueue(
      new PopstateEventAction(this, ev, eventTask, suppressPopstate), 1
    ).wait();
  }

  public async popState(doneTask: QueueTask<IAction>): Promise<void> {
    await this.go(-1, true);
    const state = this.history.state;
    // TODO: Fix browser forward bug after pop on first entry
    if (state && state.navigationEntry && !state.navigationEntry.firstEntry) {
      await this.go(-1, true);
      await this.pushNavigatorState(state);
    }
    doneTask.execute();
  }

  public forwardState(state: IForwardedState): void {
    this.forwardedState = state;
  }

  public popstate(ev: PopStateEvent, eventTask: QueueTask<IAction> | null, suppressPopstate: boolean = false): void {
    if (!suppressPopstate) {
      this.options.callback({
        ...this.viewerState,
        ...{
          event: ev,
          state: this.history.state,
        },
      });
    }
    if (eventTask !== null) {
      eventTask.execute();
    }
  }

  // Everything that wants to await a browser event should pass suppressPopstate param
  // Events NOT resulting in popstate events should NOT pass suppressPopstate param
  private readonly processCalls = (task: QueueTask<IAction>): void => {
    // let resolve: ((value?: void | PromiseLike<void>) => void) | null = null;
    // let suppressPopstate: boolean = false;
    // if (task.item instanceof HistoryPopStateAction
    //   || task.item instanceof PopstateEventAction
    // ) {
    //   resolve = this.forwardedState.resolve;
    //   this.forwardedState.resolve = null;

    //   if (task.item instanceof PopstateEventAction && this.forwardedState.suppressPopstate) {
    //     suppressPopstate = true;
    //     this.forwardedState.suppressPopstate = false;
    //   }
    //   task.item.execute(resolve, suppressPopstate);
    //   task.resolve();
    // };
  }
}
