import { EventAggregator, IEventAggregator } from '@aurelia/kernel';
import { IWindow, IHistory, ILocation, IPlatform } from '@aurelia/runtime-html';
import { INavigatorState, INavigatorStore, INavigatorViewer, INavigatorViewerOptions } from './navigator.js';
import { QueueTask, TaskQueue } from './utilities/task-queue.js';

/**
 * @internal
 */
export interface IBrowserViewerStoreOptions extends INavigatorViewerOptions {
  /**
   * Whether the hash part of the Location URL should be used for state. If false,
   * the Location pathname will be used instead (sometimes referred to as "popstate").
   */
  useUrlFragmentHash?: boolean;
}

/**
 * Viewer and store layers on top of the browser. The viewer part is for getting
 * and setting a state (location) indicator and the store part is for storing
 * and retrieving historical states (locations). In the browser, the Location
 * is the viewer and the History API provides the store.
 *
 * All mutating actions towards the viewer and store are added as awaitable tasks
 * in a queue.
 *
 * Events are fired when the current state (location) changes, either through
 * direct change (manually altering the Location) or movement to a historical
 * state.
 *
 * All interaction with the browser's Location and History is performed through
 * these layers.
 *
 * @internal
 */
export class BrowserViewerStore implements INavigatorStore, INavigatorViewer {
  /**
   * Limit the number of executed actions within the same RAF (due to browser limitation).
   */
  public allowedExecutionCostWithinTick: number = 2;

  /**
   * State changes that have been triggered but not yet processed.
   */
  private readonly pendingCalls: TaskQueue<IAction>;

  /**
   * Whether the BrowserViewerStore is started or not.
   */
  private isActive: boolean = false;

  private options: IBrowserViewerStoreOptions = {
    useUrlFragmentHash: true,
  };

  /**
   * A "forwarded state" that's used to decide whether the browser's popstate
   * event should fire a change state event or not. Used by 'go' method and
   * its 'suppressEvent' option.
   */
  private forwardedState: IForwardedState = { eventTask: null, suppressPopstate: false };

  public constructor(
    @IPlatform private readonly platform: IPlatform,
    @IWindow private readonly window: IWindow,
    @IHistory private readonly history: IHistory,
    @ILocation private readonly location: ILocation,
    @IEventAggregator private readonly ea: EventAggregator,
  ) {
    this.pendingCalls = new TaskQueue<IAction>();
  }

  public start(options: IBrowserViewerStoreOptions): void {
    if (this.isActive) {
      throw new Error('Browser navigation has already been started');
    }
    this.isActive = true;
    if (options.useUrlFragmentHash != void 0) {
      this.options.useUrlFragmentHash = options.useUrlFragmentHash;
    }
    this.pendingCalls.start({ platform: this.platform, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.window.addEventListener('popstate', this.handlePopStateEvent);
  }

  public stop(): void {
    if (!this.isActive) {
      throw new Error('Browser navigation has not been started');
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.window.removeEventListener('popstate', this.handlePopStateEvent);
    this.pendingCalls.stop();
    this.options = { useUrlFragmentHash: true };
    this.isActive = false;
  }

  public get length(): number {
    return this.history.length;
  }

  /**
   * The stored state for the current state/location.
   */
  public get state(): Record<string, unknown> {
    return this.history.state as Record<string, unknown>;
  }

  /**
   * Get the viewer's (browser Location) current state/location (URL).
   */
  public get viewerState(): NavigatorViewerState {
    const { pathname, search, hash } = this.location;
    return Object.assign(
      new NavigatorViewerState(),
      {
        path: pathname,
        query: search.slice(1),
        hash,
        instruction: this.options.useUrlFragmentHash ? hash.slice(1) : pathname,
      });
  }

  /**
   * Enqueue an awaitable 'go' task that navigates delta amount of steps
   * back or forward in the states history.
   *
   * @param delta - The amount of steps, positive or negative, to move in the states history
   * @param suppressEvent - If true, no state change event is fired when the go task is executed
   */
  public async go(delta: number, suppressEvent: boolean = false): Promise<boolean | void> {
    const doneTask: QueueTask<IAction> = this.pendingCalls.createQueueTask((task: QueueTask<IAction>) => task.resolve(), 1);

    this.pendingCalls.enqueue([
      (task: QueueTask<IAction>) => {
        const store: BrowserViewerStore = this;
        const eventTask: QueueTask<IAction> = doneTask;
        const suppressPopstate: boolean = suppressEvent;

        // Set the "forwarded state" that decides whether the browser's popstate event
        // should fire a change state event or not
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

  /**
   * Enqueue an awaitable 'push state' task that pushes a state after the current
   * historical state. Any pre-existing historical states after the current are
   * discarded before the push.
   *
   * @param state - The state to push
   */
  public async pushNavigatorState(state: INavigatorState): Promise<boolean | void> {
    const { title, path } = state.navigations[state.navigationIndex];
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      (task: QueueTask<IAction>) => {
        const history: History = this.history;
        const data: INavigatorState = state;
        const titleOrEmpty: string = title || '';
        const url: string = `${fragment}${path}`;

        try {
          history.pushState(data, titleOrEmpty, url);
          this.setTitle(titleOrEmpty);
        } catch (err) {
          const clean = this.tryCleanState(data, 'push', err);
          history.pushState(clean, titleOrEmpty, url);
          this.setTitle(titleOrEmpty);
        }
        task.resolve();
      }, 1).wait();
  }

  /**
   * Enqueue an awaitable 'replace state' task that replace the current historical
   * state with the provided  state.
   *
   * @param state - The state to replace with
   */
  public async replaceNavigatorState(state: INavigatorState, title?: string, path?: string): Promise<boolean | void> {
    // const { title, path } = state.currentEntry;
    const lastNavigation = state.navigations[state.navigationIndex];
    title ??= lastNavigation.title;
    path ??= lastNavigation.path;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    return this.pendingCalls.enqueue(
      (task: QueueTask<IAction>) => {
        const history: History = this.history;
        const data: INavigatorState = state;
        const titleOrEmpty: string = title || '';
        const url: string = `${fragment}${path}`;

        try {
          history.replaceState(data, titleOrEmpty, url);
          this.setTitle(titleOrEmpty);
        } catch (err) {
          const clean = this.tryCleanState(data, 'replace', err);
          history.replaceState(clean, titleOrEmpty, url);
          this.setTitle(titleOrEmpty);
        }
        task.resolve();
      }, 1).wait();
  }

  /**
   * Enqueue an awaitable 'pop state' task that pops the last of the historical states.
   */
  public async popNavigatorState(): Promise<boolean | void> {
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

  public setTitle(title: string): void {
    this.window.document.title = title;
  }

  /**
   * Enqueue an awaitable 'pop state' task when the viewer's state (browser's
   * Location) changes.
   *
   * @param event - The browser's PopStateEvent
   */
  private readonly handlePopStateEvent: (event: PopStateEvent) => Promise<boolean | void> =
    async (event: PopStateEvent): Promise<boolean | void> => {
      // Get event to resolve when done and whether state change event should be suppressed
      const { eventTask, suppressPopstate } = this.forwardedState;
      this.forwardedState = { eventTask: null, suppressPopstate: false };

      return this.pendingCalls.enqueue(
        async (task: QueueTask<IAction>) => {
          const store: BrowserViewerStore = this;
          const ev: PopStateEvent = event;
          const evTask: QueueTask<IAction> | null = eventTask;
          const suppressPopstateEvent: boolean = suppressPopstate;

          await store.notifySubscribers(ev, evTask, suppressPopstateEvent);
          task.resolve();
        }, 1).wait();
    };

  /**
   * Notifies subscribers that the state has changed
   *
   * @param ev - The browser's popstate event
   * @param eventTask - A task to execute once subscribers have been notified
   * @param suppressEvent - Whether to suppress the event or not
   */
  private async notifySubscribers(ev: PopStateEvent, eventTask: QueueTask<IAction> | null, suppressEvent: boolean = false): Promise<void> {
    if (!suppressEvent) {
      this.ea.publish(NavigatorStateChangeEvent.eventName,
        NavigatorStateChangeEvent.create(this.viewerState, ev, this.history.state as INavigatorState));
    }
    if (eventTask !== null) {
      await eventTask.execute();
    }
  }

  /**
   * Pop the last historical state by re-pushing the second to last
   * historical state (since browser History doesn't have a popState).
   *
   * @param doneTask - Task to execute once pop is done
   */
  private async popState(doneTask: QueueTask<IAction>): Promise<void> {
    await this.go(-1, true);
    const state = this.history.state as INavigatorState;
    // TODO: Fix browser forward bug after pop on first entry
    const lastNavigation = state?.navigations?.[state?.navigationIndex ?? 0];
    if (lastNavigation != null && !lastNavigation.firstEntry) {
      await this.go(-1, true);
      await this.pushNavigatorState(state);
    }
    await doneTask.execute();
  }

  /**
   * Set the "forwarded state" that decides whether the browser's popstate event
   * should fire a change state event or not.
   *
   * @param state - The forwarded state
   */
  private forwardState(state: IForwardedState): void {
    this.forwardedState = state;
  }

  /**
   * Tries to clean up the state for pushing or replacing to browser History.
   *
   * @param data - The state to attempt to clean
   * @param type - The type of action, push or replace, that failed
   * @param originalError - The origial error when trying to push or replace
   */
  private tryCleanState(data: unknown, type: 'push' | 'replace', originalError: Error): unknown {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (err) {
      throw new Error(`Failed to ${type} state, probably due to unserializable data and/or parameters: ${err}${originalError}`);
    }
  }
}

/**
 * The state used when communicating with the navigator viewer.
 */
/**
 * @internal
 */
export class NavigatorViewerState {
  /**
   * The URL (Location) path
   */
  public path!: string;

  /**
   * The URL (Location) query
   */
  public query!: string;

  /**
   * The URL (Location) hash
   */
  public hash!: string;

  /**
   * The navigation instruction
   */
  public instruction!: string;
}

/**
 * @internal
 */
interface IForwardedState {
  eventTask: QueueTask<IAction> | null;
  suppressPopstate: boolean;
}

/**
 * @internal
 */
interface IAction {
  execute(task: QueueTask<IAction>, resolve?: ((value?: void | boolean | PromiseLike<void> | PromiseLike<boolean>) => void) | null | undefined, suppressEvent?: boolean): void;
}

export class NavigatorStateChangeEvent {
  public static eventName = 'au:router:navigation-state-change';

  public constructor(
    public readonly eventName: string,
    public readonly viewerState: NavigatorViewerState,
    public readonly event: PopStateEvent,
    public readonly state: INavigatorState,
  ) { }
  public static create(
    viewerState: NavigatorViewerState,
    ev: PopStateEvent,
    navigatorState: INavigatorState,
  ): NavigatorStateChangeEvent {
    return new NavigatorStateChangeEvent(
      NavigatorStateChangeEvent.eventName,
      viewerState,
      ev,
      navigatorState);
  }
}
