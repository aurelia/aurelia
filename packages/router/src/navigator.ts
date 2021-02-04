import { EventAggregator, IEventAggregator } from '@aurelia/kernel';
import { IRouteableComponent } from './interfaces.js';
import { Queue, QueueItem } from './utilities/queue.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { Navigation, IStoredNavigation, INavigation } from './navigation.js';
import { Runner, Step } from './utilities/runner.js';
import { arrayUnique } from './utilities/utils.js';

/**
 * The navigator is responsible for managing (queueing) navigations and
 * feeding them to the router, keeping track of historical navigations/states
 * and providing an api to historical and current/last state.
 *
 * The navigator uses a first-in-first-out queue with a callback that gets
 * called with a queued item only when the previously processed item has been
 * resolved or rejected. All navigations are enqueued in this queue and once
 * dequeued into the callback the navigator enrich them with historical
 * navigation data and pass it on to the router for processing.
 *
 * An event is fired when a navigation is ready for processing by the router.
 *
 * Whenever the router has finalized or canceled a navigation it informs the
 * navigator which then updates current/last and historical states accordingly
 * and instructs the viewer and store (BrowserViewerStore) to do appropriate
 * updates.
 *
 * TODO: Make the queue not wait until currently processing item is done, so
 * that it won't be necessary to wait for long running navigations to finish
 * before doing a new navigation.
 */

/**
 * The navigator store is responsible for storing historical and current/last
 * navigations and providing navigations between them.
 */
/**
 * @internal
 */
export interface INavigatorStore {
  readonly length: number;
  readonly state: Record<string, unknown> | null;
  go(delta?: number, suppressPopstate?: boolean): Promise<boolean | void>;
  pushNavigatorState(state: IStoredNavigatorState): Promise<boolean | void>;
  replaceNavigatorState(state: IStoredNavigatorState): Promise<boolean | void>;
  popNavigatorState(): Promise<boolean | void>;
}

/**
 * The navigator viewer is responsible for viewing relevant navigation such
 * as title and URL (Location) path.
 */
/**
 * @internal
 */
export interface INavigatorViewer {
  start(options: INavigatorViewerOptions): void;
  stop(): void;
  setTitle(title: string): void;
}
/**
 * @internal
 */
export interface INavigatorViewerOptions {
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
export class NavigatorViewerEvent extends NavigatorViewerState {
  public event!: PopStateEvent;
  public state?: INavigatorState;
}

export class NavigatorNavigateEvent extends Navigation {
  public static eventName = 'au:router:navigation-navigate';

  public static createEvent(navigation: INavigation): NavigatorNavigateEvent {
    return Object.assign(
      new NavigatorNavigateEvent(),
      navigation,
    );
  }
}

export interface INavigatorOptions {
  viewer?: INavigatorViewer;
  store?: INavigatorStore;
  statefulHistoryLength?: number;
}

/**
 * Public API - part of Navigation
 */
export interface INavigationFlags {
  first: boolean;
  new: boolean;
  refresh: boolean;
  forward: boolean;
  back: boolean;
  replace: boolean;
}

/**
 * @internal
 */
export interface IStoredNavigatorState {
  state?: Record<string, unknown>;
  navigations: IStoredNavigation[];
  lastNavigation: IStoredNavigation;
}

/**
 * @internal
 */
export interface INavigatorState {
  state?: Record<string, unknown>;
  navigations: Navigation[];
  lastNavigation: Navigation;
}

/**
 * @internal
 */
export class Navigator {
  /**
   * The last _finished_ navigation.
   */
  public lastNavigation: Navigation;

  /**
   * All navigations, historical and current/last
   */
  public navigations: Navigation[] = [];

  /**
   * Queued navigations that have not yet been dequeued for processing.
   */
  private readonly pendingNavigations: Queue<Navigation>;

  /**
   * Navigator options
   */
  private options: INavigatorOptions = {
    /**
     * How many historical navigations that should be kept stateful,
     * default 0 means none.
     */
    statefulHistoryLength: 0,
  };
  /**
   * Whether the navigator is started
   */
  private isActive: boolean = false;

  /**
   * An uninitialized navigation that's used before the
   * navigator is started and before first navigation is made
   */
  private readonly uninitializedNavigation: Navigation;

  public constructor(
    @IEventAggregator private readonly ea: EventAggregator,
  ) {
    this.uninitializedNavigation = Navigation.create({
      instruction: 'NAVIGATOR UNINITIALIZED',
      fullStateInstruction: '',
      index: 0,
    });
    this.lastNavigation = this.uninitializedNavigation;

    this.pendingNavigations = new Queue<Navigation>(this.processNavigations);
  }

  /**
   * The amount of queued navigations.
   */
  public get queued(): number {
    return this.pendingNavigations.length;
  }

  public start(options?: INavigatorOptions): void {
    if (this.isActive) {
      throw new Error('Navigator has already been started');
    }

    this.isActive = true;
    this.options = { ...options };
  }

  public stop(): void {
    if (!this.isActive) {
      throw new Error('Navigator has not been started');
    }
    this.pendingNavigations.clear();
    this.isActive = false;
  }

  /**
   * Enqueue a navigation for processing.
   *
   * @param navigation - The navigation to enqueue
   */
  public async navigate(navigation: Navigation): Promise<boolean | void> {
    return this.pendingNavigations.enqueue(navigation);
  }

  /**
   * Process a dequeued navigation. The method is called by the
   * pending navigations queue.
   *
   * @param qNavigation - The dequeued navigation to process
   */
  public processNavigations: (qNavigation: QueueItem<Navigation>) => void = (qNavigation: QueueItem<Navigation>): void => {
    const navigation = qNavigation as Navigation;
    const navigationFlags: INavigationFlags = {
      first: false,
      new: false,
      refresh: false,
      forward: false,
      back: false,
      replace: false,
    };

    // If no proper last navigation, no navigation has been processed this session, meaning
    // that this one is either a first navigation or a refresh (repeat navigation).
    if (this.lastNavigation === this.uninitializedNavigation) {
      // Load the navigation state and set appropriate flags...
      this.loadState();
      if (this.lastNavigation !== this.uninitializedNavigation) {
        navigationFlags.refresh = true;
      } else {
        navigationFlags.first = true;
        navigationFlags.new = true;
        // ...and create the first navigation.
        // TODO: Should this really be created here? Shouldn't it be in the viewer?
        this.lastNavigation = Navigation.create({
          index: 0,
          instruction: '',
          fullStateInstruction: '',
          // path: this.options.viewer.getPath(true),
          // fromBrowser: null,
        });
        this.navigations = [];
      }
    }
    // If navigation has an index and isn't replacing or refreshing, it's a historical
    // navigation...
    if (navigation.index !== void 0 && !(navigation.replacing ?? false) && !(navigation.refreshing ?? false)) {
      // ...set the movement size...
      navigation.historyMovement = navigation.index - (this.lastNavigation.index ?? 0);
      // ...and set the navigation instruction.
      navigation.instruction = this.navigations[navigation.index] != null ? this.navigations[navigation.index].fullStateInstruction : navigation.fullStateInstruction;
      // Set appropriate navigation flags.
      navigation.replacing = true;
      if (navigation.historyMovement > 0) {
        navigationFlags.forward = true;
      } else if (navigation.historyMovement < 0) {
        navigationFlags.back = true;
      }
    } else if ((navigation.refreshing ?? false) || navigationFlags.refresh) { // If the navigation is a refresh...
      // ...just reuse last index.
      navigation.index = this.lastNavigation.index;
    } else if (navigation.replacing ?? false) {  // If the navigation is replacing...
      // ...set appropriate flags...
      navigationFlags.replace = true;
      navigationFlags.new = true;
      // ...and reuse last index.
      navigation.index = this.lastNavigation.index;
    } else { // If the navigation is a new navigation...
      // ...set navigation flag...
      navigationFlags.new = true;
      // ...and create a new index.
      navigation.index = this.lastNavigation.index !== void 0 ? this.lastNavigation.index + 1 : this.navigations.length;
    }
    this.notifySubscribers(navigation, navigationFlags, this.lastNavigation);
  };

  /**
   * Refresh (reload) the last navigation.
   */
  public async refresh(): Promise<boolean | void> {
    const navigation = this.lastNavigation;
    // Don't refresh if there's been no navigation before
    if (navigation === this.uninitializedNavigation) {
      return Promise.reject();
    }
    // Set navigation flags...
    navigation.replacing = true;
    navigation.refreshing = true;
    // ...and enqueue the navigation again.
    return this.navigate(navigation);
  }

  /**
   * Go to an earlier or later navigation in navigation history.
   *
   * @param movement - Amount of steps to move, positive or negative
   */
  public async go(movement: number): Promise<boolean | void> {
    const newIndex = (this.lastNavigation.index ?? 0) + movement;
    // Reject going past last navigation
    if (newIndex >= this.navigations.length) {
      return Promise.reject();
    }
    // Get the appropriate navigation...
    const navigation = this.navigations[newIndex];
    // ...and enqueue it again.
    return this.navigate(navigation);
  }

  /**
   * Get the stored navigator state (json okay) as well as the last
   * navigation and all historical navigations from the store.
   */
  public getState(): IStoredNavigatorState {
    // Get the stored state and...
    const state = this.options.store != null ? { ...this.options.store.state } : {};
    // ...separate the historical navigations...
    const navigations = (state.navigations ?? []) as IStoredNavigation[];
    // ...and the last state.
    const lastNavigation = (state.lastNavigation ?? null) as IStoredNavigation;
    return { navigations, lastNavigation };
  }

  /**
   * Load the state stored in the store into the navigator's last and
   * historical states.
   */
  public loadState(): void {
    // Get the stored navigations (json)...
    const { navigations, lastNavigation } = this.getState();
    // ...and create the historical Navigations...
    this.navigations = navigations.map(navigation => Navigation.create(navigation));
    // ...and the last Navigation.
    this.lastNavigation = lastNavigation !== null
      ? Navigation.create(lastNavigation)
      : this.uninitializedNavigation;
  }

  /**
   * Save the last state to history and save the history to the store,
   * converting to json when necessary.
   *
   * @param push - Whether the last state should be pushed as a new entry
   * in the history or replace the last position.
   */
  public async saveState(push: boolean = false): Promise<boolean | void> {
    if (this.lastNavigation === this.uninitializedNavigation) {
      return;
    }
    // Get a storeable navigation...
    const storedNavigation = this.lastNavigation.toStoredNavigation();
    // ...and create a Navigation from it.
    this.navigations[storedNavigation.index ?? 0] = Navigation.create(storedNavigation);

    // If preserving history, serialize navigations that aren't preserved:
    // Should preserve...
    if ((this.options.statefulHistoryLength ?? 0) > 0) {
      // ...from 'index' and to the end.
      const index = this.navigations.length - (this.options.statefulHistoryLength ?? 0);
      // Work from beginning to the index that should be preserved...
      for (let i = 0; i < index; i++) {
        const navigation = this.navigations[i];
        // ...and serialize the navigation if necessary. (Serializing will free
        // components that are no longer used.)
        if (typeof navigation.instruction !== 'string' || typeof navigation.fullStateInstruction !== 'string') {
          await this.serializeNavigation(navigation, this.navigations.slice(index));
        }
      }
    }

    // If last navigation has a title...
    if (storedNavigation.title !== void 0) {
      // ...instruct the viewer to show it.
      this.options?.viewer?.setTitle(storedNavigation.title);
    }

    // If there's a store...
    if (this.options.store == null) {
      return Promise.resolve();
    }
    // ...prepare the state...
    const state: IStoredNavigatorState = {
      navigations: (this.navigations ?? []).map((navigation: Navigation) => this.toStoreableNavigation(navigation)),
      lastNavigation: this.toStoreableNavigation(storedNavigation),
    };

    // ...and save it in the right place.
    if (push) {
      return this.options?.store?.pushNavigatorState(state);
    } else {
      return this.options.store.replaceNavigatorState(state);
    }
  }

  /**
   * Finalize a navigation and make it the last navigation.
   *
   * @param navigation - The navigation to finalize
   */
  public async finalize(navigation: Navigation): Promise<void> {
    const previousLastNavigation = this.lastNavigation;
    this.lastNavigation = navigation;
    let index = navigation.index;
    // If this navigation shouldn't be added to history...
    if (navigation.untracked ?? false) {
      // ...and it's a navigation from the browser (back, forward, url)...
      if ((navigation.fromBrowser ?? false) && this.options.store != null) {
        // ...pop it from browser's history and...
        await this.options.store.popNavigatorState();
      }
      // ...restore the previous last navigation (and no need to save).
      this.lastNavigation = previousLastNavigation;
      index = previousLastNavigation.index ?? 0;
    } else if (navigation.replacing ?? false) { // If this isn't creating a new navigation...
      if ((navigation.historyMovement ?? 0) === 0) { // ...and it's not a navigation in the history...
        // ...use last navigation index.
        this.lastNavigation.index = previousLastNavigation.index ?? 0;
        this.navigations[previousLastNavigation.index ?? 0] = navigation;
      }
      await this.saveState();
    } else { // New navigation
      // Discard anything after the new navigation so that it becomes the last.
      this.navigations = this.navigations.slice(0, index);
      this.navigations.push(navigation);
      // Need to make sure components in discarded routing instructions are
      // disposed if stateful history is used...
      if ((this.options.statefulHistoryLength ?? 0) > 0) {
        // ...but not the ones that should be preserved, so keep...
        const indexPreserve = this.navigations.length - (this.options.statefulHistoryLength ?? 0);
        // ...the last ones as is.
        for (const navig of this.navigations.slice(index)) {
          // Only non-string instructions has components to dispose.
          if (typeof navig.instruction !== 'string' || typeof navig.fullStateInstruction !== 'string') {
            // Use serialize to dispose routing instruction components
            // since the end result is the same. Pass the navigations
            // that should be preserved so that components in them aren't
            // disposed if they also exist in discarded routing instructions.
            await this.serializeNavigation(navig, this.navigations.slice(indexPreserve, index));
          }
        }
      }
      await this.saveState(true);
    }
    // Resolve the navigation. Very important!
    navigation.resolve?.(true);
  }

  /**
   * Cancel a navigation and move to last finalized navigation.
   *
   * @param navigation - The navigation to cancel
   */
  public async cancel(navigation: Navigation): Promise<void> {
    if (this.options.store != null) {
      // If it's a new navigation...
      if (navigation.navigation?.new) {
        // ...from the browser (url)...
        if (navigation.fromBrowser ?? false) {
          // ...pop it from the browser's History.
          await this.options.store.popNavigatorState();
        }
        // Undo the history movement back to previous last navigation
      } else if ((navigation.historyMovement ?? 0) !== 0) {
        await this.options.store.go(-navigation.historyMovement!, true);
      }
    }
    // Resolve the navigation. Very important!
    navigation.resolve?.(false);
  }

  /**
   * Notifies subscribers that a navigation has been dequeued for processing.
   *
   * @param navigation - The INavigation to process
   * @param navigationFlags - Flags describing the navigations historical movement
   * @param previousNavigation - The previous navigation to be processed
   */
  private notifySubscribers(navigation: INavigation, navigationFlags: INavigationFlags, previousNavigation: Navigation): void {
    navigation = navigation instanceof Navigation ? navigation : Navigation.create({ ...navigation });
    (navigation as Navigation).navigation = navigationFlags;
    (navigation as Navigation).previous = previousNavigation;

    this.ea.publish(NavigatorNavigateEvent.eventName, NavigatorNavigateEvent.createEvent(navigation));
      // Object.assign(
      //   new NavigatorNavigateEvent(),
      //   navigation,
      // ));
  }

  /**
   * Make a Navigation storeable/json safe.
   *
   * @param navigation - The navigation to make storeable
   */
  private toStoreableNavigation(navigation: Navigation | IStoredNavigation): IStoredNavigation {
    // Get a navigation with only the properties that are stored
    const storeable = navigation instanceof Navigation ? navigation.toStoredNavigation() : navigation;
    // Make sure instruction is a string
    storeable.instruction = RoutingInstruction.stringify(storeable.instruction);
    // Make sure full state instruction is a string
    storeable.fullStateInstruction = RoutingInstruction.stringify(storeable.fullStateInstruction);
    // Only string scopes can be stored
    if (typeof storeable.scope !== 'string') {
      storeable.scope = null;
    }
    // TODO: Filter out non-json compatible data and parameters!
    return storeable;
  }

  /**
   * Serialize a navigation to string(s), freeing/disposing all components in it.
   * (Only components that doesn't exist in a preserved navigation will be disposed.)
   *
   * @param navigation - The navigation to serialize
   * @param preservedNavigations - Navigations that should be preserved, meaning
   * that any component used in them should not be disposed
   */
  private async serializeNavigation(navigation: Navigation, preservedNavigations: Navigation[]): Promise<void> {
    let excludeComponents = [];
    // Components in preserved navigations should not be serialized/freed
    for (const preservedNavigation of preservedNavigations) {
      // Get components from instruction...
      if (typeof preservedNavigation.instruction !== 'string') {
        excludeComponents.push(...RoutingInstruction.flat(preservedNavigation.instruction)
          .filter(instruction => instruction.viewport.instance !== null) // Both viewport instance and...
          .map(instruction => instruction.component.instance)); // ...component instance should be set
      }
      // ...and full state instruction
      if (typeof preservedNavigation.fullStateInstruction !== 'string') {
        excludeComponents.push(...RoutingInstruction.flat(preservedNavigation.fullStateInstruction)
          .filter(instruction => instruction.viewport.instance !== null) // Both viewport instance and...
          .map(instruction => instruction.component.instance)); // ...component instance should be set
      }
    }
    // Make excluded components unique
    excludeComponents = arrayUnique(excludeComponents) as IRouteableComponent[];

    let instructions: RoutingInstruction[] = [];
    // The instructions, one or two, with possible components to free
    if (typeof navigation.fullStateInstruction !== 'string') {
      // Save the instruction
      instructions.push(...navigation.fullStateInstruction);
      navigation.fullStateInstruction = RoutingInstruction.stringify(navigation.fullStateInstruction);
    }
    if (typeof navigation.instruction !== 'string') {
      // Save the instruction
      instructions.push(...navigation.instruction);
      navigation.instruction = RoutingInstruction.stringify(navigation.instruction);
    }

    // Process only the instructions with instances and make them unique
    instructions = instructions.filter(
      (instruction, i, arr) =>
        instruction.component.instance != null
        && arr.indexOf(instruction) === i
    );

    // Already freed components (updated when component is freed)
    const alreadyDone: IRouteableComponent[] = [];
    for (const instruction of instructions) {
      // Free (and dispose) instruction components except excluded and already done
      await this.freeInstructionComponents(instruction, excludeComponents, alreadyDone);
    }
  }

  /**
   * Free (and dispose) components in a routing instruction unless the components
   * should be excluded (due to also being in non-freed instructions) or have already
   * been freed/disposed.
   *
   * @param instruction - Routing instruction to free components in
   * @param excludeComponents - Components to exclude
   * @param alreadyDone - Components that's already been freed/disposed
   */
  private freeInstructionComponents(instruction: RoutingInstruction, excludeComponents: IRouteableComponent[], alreadyDone: IRouteableComponent[]): void | Promise<void> {
    const component = instruction.component.instance;
    const viewport = instruction.viewport.instance;
    // Both viewport and component instance should be set in order to free/dispose
    if (component === null || viewport === null || alreadyDone.some(done => done === component)) {
      return;
    }
    if (!excludeComponents.some(exclude => exclude === component)) {
      return Runner.run(null,
        (step: Step<void>) => viewport.freeContent(step, component),
        () => {
          alreadyDone.push(component);
        },
      ) as void | Promise<void>;
    }
    // If there are any next scope/child instructions...
    if (instruction.hasNextScopeInstructions) {
      for (const nextInstruction of instruction.nextScopeInstructions!) {
        // ...try freeing/disposing them as well.
        return this.freeInstructionComponents(nextInstruction, excludeComponents, alreadyDone);
      }
    }
  }
}
