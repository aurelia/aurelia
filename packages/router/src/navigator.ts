import { EventAggregator, IContainer, IEventAggregator } from '@aurelia/kernel';
import { IRouteableComponent } from './interfaces.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { Navigation, IStoredNavigation, INavigation, NavigationFlags } from './navigation.js';
import { Runner, Step } from './utilities/runner.js';
import { arrayUnique } from './utilities/utils.js';
import { Viewport } from './endpoints/viewport.js';
import { OpenPromise } from './utilities/open-promise.js';

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

export class NavigatorNavigateEvent {
  public static eventName = 'au:router:navigation-navigate';

  public constructor(
    public readonly eventName: string,
    public readonly navigation: Navigation
  ) { }
  public static create(navigation: INavigation): NavigatorNavigateEvent {
    return new NavigatorNavigateEvent(
      NavigatorNavigateEvent.eventName,
      navigation as Navigation);
  }
}

export interface INavigatorOptions {
  viewer?: INavigatorViewer;
  store?: INavigatorStore;
  statefulHistoryLength?: number;
}

/**
 * @internal
 */
export interface IStoredNavigatorState {
  state?: Record<string, unknown>;
  navigations: IStoredNavigation[];
  navigationIndex: number;
}

/**
 * @internal
 */
export interface INavigatorState {
  state?: Record<string, unknown>;
  navigations: Navigation[];
  navigationIndex: number;
}

/**
 * @internal
 */
export class Navigator {
  /**
   * The index of the last _finished_ navigation.
   */
  public lastNavigationIndex: number = -1;

  /**
   * All navigations, historical and current/last
   */
  public navigations: Navigation[] = [];

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
    @IContainer private readonly container: IContainer,
  ) {
    this.uninitializedNavigation = Navigation.create({
      instruction: 'NAVIGATOR UNINITIALIZED',
      fullStateInstruction: '',
      index: 0,
      completed: true,
    });
    this.lastNavigationIndex = -1;
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
    this.isActive = false;
  }

  /**
   * Perform a navigation. The navigation is enriched with historical
   * navigation data and passed to the router.
   *
   * @param navigation - The navigation to perform
   */
  public navigate(navigation: INavigation | Navigation): Promise<boolean> {
    if (!(navigation instanceof Navigation)) {
      navigation = Navigation.create(navigation);
    }
    const navigationFlags = new NavigationFlags();

    // If no proper last navigation, no navigation has been processed this session, meaning
    // that this one is either a first navigation or a refresh (repeat navigation).
    if (this.lastNavigationIndex === -1) {
      // Load the navigation state from the store (mutating `navigations` and
      // `lastNavigationIndex`) and then set appropriate flags...
      this.loadState();
      if (this.lastNavigationIndex !== -1) {
        navigationFlags.refresh = true;
      } else {
        navigationFlags.first = true;
        navigationFlags.new = true;
        // ...and create the first navigation.
        // TODO: Should this really be created here? Shouldn't it be in the viewer?
        this.lastNavigationIndex = 0;
        this.navigations = [Navigation.create({
          index: 0,
          instruction: '',
          fullStateInstruction: '',
          // path: this.options.viewer.getPath(true),
          // fromBrowser: null,
        })];
      }
    }
    // If navigation has an index and isn't replacing or refreshing, it's a historical
    // navigation...
    if (navigation.index !== void 0 && !(navigation.replacing ?? false) && !(navigation.refreshing ?? false)) {
      // ...set the movement size...
      navigation.historyMovement = navigation.index - Math.max(this.lastNavigationIndex, 0);
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
      // ...just reuse the navigation.
      // navigation.index = this.lastNavigationIndex;
      navigation = this.navigations[this.lastNavigationIndex];
      navigation.replacing = true;
      navigation.refreshing = true;
    } else if (navigation.replacing ?? false) {  // If the navigation is replacing...
      // ...set appropriate flags...
      navigationFlags.replace = true;
      navigationFlags.new = true;
      // ...and reuse last index.
      navigation.index = this.lastNavigationIndex;
    } else { // If the navigation is a new navigation...
      // ...set navigation flag...
      navigationFlags.new = true;
      // ...and create a new index.
      navigation.index = this.lastNavigationIndex + 1;
      this.navigations[navigation.index] = navigation as Navigation;
    }

    // Set the appropriate flags.
    (navigation as Navigation).navigation = navigationFlags;
    // Set the previous navigation.
    navigation.previous = this.navigations[Math.max(this.lastNavigationIndex, 0)];
    // Create a process with an awaitable promise.
    (navigation as Navigation).process = new OpenPromise();

    // Set the last navigated index to the navigation index
    this.lastNavigationIndex = navigation.index as number;

    this.notifySubscribers(navigation as Navigation);

    return (navigation as Navigation).process!.promise;
  }

  /**
   * Finalize a navigation and make it the last navigation.
   *
   * @param navigation - The navigation to finalize
   */
  public async finalize(navigation: Navigation, isLast: boolean): Promise<void> {
    // If this navigation shouldn't be added to history...
    if (navigation.untracked ?? false) {
      // ...and it's a navigation from the browser (back, forward, url)...
      if ((navigation.fromBrowser ?? false) && this.options.store != null) {
        // ...pop it from browser's history and...
        await this.options.store.popNavigatorState();
      }
      // ...restore the previous last navigation (and no need to save).
    } else if (navigation.replacing ?? false) { // If this isn't creating a new navigation...
      if ((navigation.historyMovement ?? 0) === 0) { // ...and it's not a navigation in the history...
        // ...use last navigation index.
        this.navigations[navigation.previous!.index!] = navigation;
      }
      await this.saveState(navigation.index!, false);
    } else { // New navigation
      const index = navigation.index as number;
      // Discard anything after the new navigation so that it becomes the last.
      if (isLast) {
        this.navigations = this.navigations.slice(0, index);
      }
      this.navigations[index] = navigation;
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
      // If it's a navigation from the browser (back, forward, url) we replace the state
      await this.saveState(navigation.index!, !(navigation.fromBrowser ?? false));
    }
    // Resolve the navigation. Very important!
    // Now done from the outside
    // navigation.resolve?.(true);
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
    // Now done from the outside
    // navigation.resolve?.(false);
  }

  /**
   * Go to an earlier or later navigation in navigation history.
   *
   * @param movement - Amount of steps to move, positive or negative
   */
  public async go(movement: number): Promise<boolean | void> {
    let newIndex = this.lastNavigationIndex + movement;

    // Stop going past last navigation
    newIndex = Math.min(newIndex, this.navigations.length - 1);

    // Move the store's history (but suppress the event so it's
    // a noop as far as the router is concerned)
    await this.options.store!.go(movement, true);

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
    const state: Partial<IStoredNavigatorState> = this.options.store != null ? { ...this.options.store.state } : {};
    // ...separate the historical navigations...
    const navigations = (state?.navigations ?? []);
    // ...and the last state.
    const navigationIndex = state?.navigationIndex as number ?? -1;
    return { navigations, navigationIndex };
  }

  /**
   * Load the state stored in the store into the navigator's last and
   * historical states.
   */
  public loadState(): void {
    // Get the stored navigations (json)...
    const { navigations, navigationIndex } = this.getState();
    // ...and create the historical Navigations...
    this.navigations = navigations.map(navigation => Navigation.create(navigation));
    // ...and the last navigation index.
    this.lastNavigationIndex = navigationIndex;
  }

  /**
   * Save the last state to history and save the history to the store,
   * converting to json when necessary.
   *
   * @param index - The index of the last navigation
   * @param push - Whether the last state should be pushed as a new entry
   * in the history or replace the last position.
   */
  public async saveState(index: number, push: boolean): Promise<boolean | void> {
    // Make sure all navigations are clean of non-persisting data
    for (let i = 0; i < this.navigations.length; i++) {
      this.navigations[i] = Navigation.create(this.navigations[i].toStoredNavigation());
    }

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

    // If there's a store...
    if (this.options.store == null) {
      return Promise.resolve();
    }
    // ...prepare the state...
    const state: IStoredNavigatorState = {
      navigations: (this.navigations ?? []).map((navigation: Navigation) => this.toStoreableNavigation(navigation)),
      navigationIndex: index,
    };
    // ...and save it in the right place.
    if (push) {
      return this.options?.store?.pushNavigatorState(state);
    } else {
      return this.options.store.replaceNavigatorState(state);
    }
  }

  /**
   * Refresh (reload) the last navigation.
   */
  public async refresh(): Promise<boolean | void> {
    // Don't refresh if there's been no navigation before
    if (this.lastNavigationIndex === -1) {
      return Promise.reject();
    }
    const navigation = this.navigations[this.lastNavigationIndex];

    // Set navigation flags...
    navigation.replacing = true;
    navigation.refreshing = true;
    // ...and enqueue the navigation again.
    return this.navigate(navigation);
  }

  /**
   * Notifies subscribers that a navigation has been dequeued for processing.
   *
   * @param navigation - The Navigation to process
   */
  private notifySubscribers(navigation: Navigation): void {
    this.ea.publish(NavigatorNavigateEvent.eventName, NavigatorNavigateEvent.create(navigation));
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
    storeable.instruction = RoutingInstruction.stringify(this.container, storeable.instruction);
    // Make sure full state instruction is a string
    storeable.fullStateInstruction = RoutingInstruction.stringify(this.container, storeable.fullStateInstruction);
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
          .filter(instruction => instruction.endpoint.instance !== null) // Both endpoint instance and...
          .map(instruction => instruction.component.instance)); // ...component instance should be set
      }
      // ...and full state instruction
      if (typeof preservedNavigation.fullStateInstruction !== 'string') {
        excludeComponents.push(...RoutingInstruction.flat(preservedNavigation.fullStateInstruction)
          .filter(instruction => instruction.endpoint.instance !== null) // Both endpoint instance and...
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
      navigation.fullStateInstruction = RoutingInstruction.stringify(this.container, navigation.fullStateInstruction);
    }
    if (typeof navigation.instruction !== 'string') {
      // Save the instruction
      instructions.push(...navigation.instruction);
      navigation.instruction = RoutingInstruction.stringify(this.container, navigation.instruction);
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
    const viewport = instruction.viewport?.instance as Viewport ?? null;
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
