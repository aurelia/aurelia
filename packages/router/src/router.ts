/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable max-lines-per-function */
import {
  DI,
  IContainer,
  Registration,
  IIndexable,
  bound,
  ILogger,
} from '@aurelia/kernel';
import {
  Aurelia,
  CustomElementType,
  CustomElement,
  ICustomElementController,
  ICustomElementViewModel,
  isRenderContext,
  IScheduler,
} from '@aurelia/runtime';
import {
  flattenViewportInstructions,
  stringifyViewportInstructions,
  isClearAllViewportsInstruction,
  isAddAllViewportsInstruction,
  isClearViewportInstruction,
  matchScope,
  matchChildren,
  parseViewportInstructions,
  cloneViewportInstructions,
  createClearViewportInstruction,
} from './instruction-resolver';
import {
  NavigatorInstruction,
  IRouteableComponent,
  NavigationInstruction,
  IRoute,
  IWindow,
  IHistory,
  ILocation,
  NavigatorEntry,
  NavigatorEntrySnapshot,
} from './interfaces';
import {
  NavigationInstructionResolver,
  IViewportInstructionsOptions,
} from './type-resolvers';
import { arrayRemove } from './utils';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { FoundRoute } from './found-route';
import {
  HookManager,
  IHookDefinition,
  HookIdentity,
  HookFunction,
  IHookOptions,
  BeforeNavigationHookFunction,
  TransformFromUrlHookFunction,
  TransformToUrlHookFunction,
} from './hook-manager';
import { Scope, IScopeOwner } from './scope';
import { IViewportScopeOptions, ViewportScope } from './viewport-scope';
import { IRouterEvents } from './router-events';
import { LinkHandler, AnchorEventInfo } from './link-handler';
import { IStateManager } from './state-manager';

/**
 * Public API
 */
export interface IGotoOptions {
  title?: string;
  query?: string;
  data?: Record<string, unknown>;
  replace?: boolean;
  append?: boolean;
  origin?: ICustomElementViewModel<Element> | Node;
}

/**
 * Public API
 */
export interface IRouterOptions {
  useUrlFragmentHash?: boolean;
  useHref?: boolean;
  statefulHistoryLength?: number;
  useDirectRoutes?: boolean;
  useConfiguredRoutes?: boolean;
  hooks?: IHookDefinition[];
}
export interface INavigatorStore {
  readonly length: number;
  readonly state: Record<string, unknown> | null;
  go(delta?: number, suppressPopstate?: boolean): Promise<void>;
  pushNavigatorState(state: INavigatorState): void;
  replaceNavigatorState(state: INavigatorState): void;
  popNavigatorState(): Promise<void>;
}

export interface INavigatorViewer {
  activate(options: {}): void;
  deactivate(): void;
}

export class NavigatorViewerState {
  private constructor(
    public readonly path: string,
    public readonly query: string,
    public readonly hash: string,
    public readonly instruction: string,
  ) {}

  public static fromLocation(
    location: {
      pathname: string;
      search: string;
      hash: string;
    },
    useUrlFragmentHash: boolean,
  ): NavigatorViewerState {
    return new NavigatorViewerState(
      location.pathname,
      location.search,
      location.hash,
      useUrlFragmentHash ? location.hash.slice(1) : location.pathname,
    );
  }
}

export interface INavigatorViewerEvent extends NavigatorViewerState {
  state?: INavigatorState;
}

export interface INavigatorFlags {
  first?: boolean;
  new?: boolean;
  refresh?: boolean;
  forward?: boolean;
  back?: boolean;
  replace?: boolean;
}

export interface INavigatorState {
  state?: Record<string, unknown>;
  entries: NavigatorEntry[];
  currentEntry: NavigatorEntry;
}

interface IForwardedState {
  resolve: (() => void) | null;
  suppressPopstate: boolean;
}
export interface IRouter extends Router { }
export const IRouter = DI.createInterface<IRouter>('IRouter').withDefault(x => x.singleton(Router));

/**
 * @internal
 */
class ClosestScope { }

export class Router {
  public rootScope: ViewportScope | null = null;

  /**
   * Public API
   */
  public activeComponents: ViewportInstruction[] = [];
  /**
   * Public API
   */
  public activeRoute: IRoute | null = null;

  /**
   * @internal
   */
  public appendedInstructions: ViewportInstruction[] = [];

  /**
   * @internal
   */
  public options: IRouterOptions = {
    useHref: true,
    statefulHistoryLength: 0,
    useDirectRoutes: true,
    useConfiguredRoutes: true,
  };

  private entries: (NavigatorEntry | NavigatorEntrySnapshot)[] = [];

  private isActive: boolean = false;

  private currentEntry: NavigatorInstruction;
  private processingNavigation: NavigatorInstruction | null = null;
  private lastNavigation: NavigatorInstruction | null = null;

  public constructor(
    @IContainer public readonly container: IContainer,
    @IRouterEvents public readonly events: IRouterEvents,
    @IScheduler public readonly scheduler: IScheduler,
    @IWindow public readonly window: IWindow,
    @IHistory public readonly history: IHistory,
    @ILocation public readonly location: ILocation,
    @ILogger private readonly logger: ILogger,
    public hookManager: HookManager,
    @IStateManager public readonly stateManager: IStateManager,
    public linkHandler: LinkHandler,
  ) {
    this.currentEntry = NavigatorInstruction.INITIAL;
    this.logger = logger.root.scopeTo('Router');
  }

  /**
   * Public API
   */
  public get isNavigating(): boolean {
    return this.processingNavigation !== null;
  }

  /**
   * @internal
   */
  public get statefulHistory(): boolean {
    return this.options.statefulHistoryLength !== void 0 && this.options.statefulHistoryLength > 0;
  }

  /**
   * Public API
   */
  public activate(options?: IRouterOptions): void {
    if (this.isActive) {
      throw new Error('Router has already been activated');
    }

    this.logger.debug('activating');

    this.isActive = true;
    this.options = {
      useUrlFragmentHash: true,
      ...this.options,
      ...options
    };
    if (this.options.hooks !== void 0) {
      this.addHooks(this.options.hooks);
    }

    this.linkHandler.activate({
      useHref: this.options.useHref,
    });

    this.events.subscribe('au:router:link-click', (info: AnchorEventInfo) => {
      const instruction = anchorEventInfoToInstruction(info);
      // Adds to Navigator's Queue, which makes sure it's serial
      this.goto(instruction, { origin: info.anchor! }).catch(error => { throw error; });
    });

    this.window.addEventListener('popstate', this.handlePopstate);

    this.ensureRootScope();
  }

  /**
   * Public API
   */
  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Router has not been activated');
    }

    this.logger.debug('deactivating');

    this.linkHandler.deactivate();
    this.events.unsubscribeAll();
    this.window.removeEventListener('popstate', this.handlePopstate);
  }

  /**
   * Public API
   */
  public loadUrl(): Promise<void> {
    this.logger.trace('loadUrl');

    const entry = NavigatorInstruction.create({
      ...this.viewerState,
      replacing: true,
      fromBrowser: false,
    });
    return this.navigate(entry);
  }

  /**
   * @internal
   */
  // TODO: use @bound and improve name (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  public navigatorSerializeCallback = async (
    entry: NavigatorEntry,
    preservedEntries: (NavigatorEntry | NavigatorEntrySnapshot)[],
  ): Promise<NavigatorEntrySnapshot> => {
    this.logger.trace(() => `navigatorSerializeCallback(${entry.toString()})`);

    const $excludeComponents: (IRouteableComponent | null)[] = [];
    for (const preservedEntry of preservedEntries) {
      if (typeof preservedEntry.instruction !== 'string') {
        $excludeComponents.push(
          ...flattenViewportInstructions(preservedEntry.instruction)
            .filter(instruction => instruction.viewport !== null)
            .map(instruction => instruction.componentInstance)
        );
      }
      if (typeof preservedEntry.fullStateInstruction !== 'string') {
        $excludeComponents.push(
          ...flattenViewportInstructions(preservedEntry.fullStateInstruction)
            .filter(instruction => instruction.viewport !== null)
            .map(instruction => instruction.componentInstance)
        );
      }
    }
    const excludeComponents = $excludeComponents.filter((x, i) => x !== null && $excludeComponents.indexOf(x) === i) as IRouteableComponent[];

    let instructions = [
      ...entry.instructions,
      ...entry.fullStateInstructions,
    ];
    instructions = instructions.filter((x, i) => (x?.componentInstance ?? null) !== null && instructions.indexOf(x) === i);

    const snapshot = entry.toSnapshot();

    const alreadyDone: IRouteableComponent[] = [];
    for (const instruction of instructions) {
      await this.freeComponents(instruction, excludeComponents, alreadyDone);
    }
    return snapshot;
  };

  /**
   * @internal
   */
  // TODO: use @bound and improve name (eslint-disable is temp)
  private async processNavigations(instruction: NavigatorInstruction): Promise<void> {
    this.logger.trace(() => `processNavigations(${instruction.toString()})`);

    this.processingNavigation = instruction;
    let fullStateInstruction = false;
    const instructionNavigation = instruction.navigation!;
    if ((instructionNavigation.back || instructionNavigation.forward) && instruction.fullStateInstruction) {
      fullStateInstruction = true;
      // if (!confirm('Perform history navigation?')) { this.navigator.cancel(instruction); this.processingNavigation = null; return Promise.resolve(); }
    }
    let configuredRoute = await this.findInstructions(
      this.rootScope!.scope,
      instruction.instruction,
      instruction.scope || this.rootScope!.scope,
      !fullStateInstruction);
    let instructions = configuredRoute.instructions;
    let configuredRoutePath: string | null = null;

    if (instruction.instruction.length > 0 && !configuredRoute.foundConfiguration && !configuredRoute.foundInstructions) {
      // TODO: Do something here!
      this.unknownRoute(configuredRoute.remaining);
    }

    if (configuredRoute.foundConfiguration) {
      instruction.path = (instruction.instruction as string).startsWith('/')
        ? (instruction.instruction as string).slice(1)
        : instruction.instruction as string;
      configuredRoutePath = `${configuredRoutePath || ''}${configuredRoute.matching}`;
      this.rootScope!.path = configuredRoutePath;
    }
    // TODO: Used to have an early exit if no instructions. Restore it?
    const clearScopeOwners: IScopeOwner[] = [];
    let clearViewportScopes: ViewportScope[] = [];
    for (const clearInstruction of instructions.filter(instr => isClearAllViewportsInstruction(instr))) {
      const scope = clearInstruction.scope || this.rootScope!.scope;
      clearScopeOwners.push(...scope.children.filter(x => !x.owner!.isEmpty).map(x => x.owner!));
      if (scope.viewportScope !== null) {
        clearViewportScopes.push(scope.viewportScope);
      }
    }
    instructions = instructions.filter(instr => !isClearAllViewportsInstruction(instr));

    for (const addInstruction of instructions.filter(instr => isAddAllViewportsInstruction(instr))) {
      addInstruction.setViewport((addInstruction.scope || this.rootScope!.scope).viewportScope!.name);
      addInstruction.scope = addInstruction.scope!.owningScope!;
    }

    const updatedScopeOwners: IScopeOwner[] = [];
    const alreadyFoundInstructions: ViewportInstruction[] = [];
    // TODO: Take care of cancellations down in subsets/iterations
    let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
    let guard = 100;
    do {
      if (!guard--) { // Guard against endless loop
        const err = new Error(`${remainingInstructions.length} remaining instructions after 100 iterations; there is likely an infinite loop.`);
        (err as Error & IIndexable)['remainingInstructions'] = remainingInstructions;
        throw err;
      }
      const changedScopeOwners: IScopeOwner[] = [];

      const hooked = await this.hookManager.invokeBeforeNavigation(viewportInstructions, instruction);
      if (hooked === false) {
        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
      } else {
        viewportInstructions = hooked as ViewportInstruction[];
      }
      for (const viewportInstruction of viewportInstructions) {
        const scopeOwner = viewportInstruction.owner;
        if (scopeOwner !== null) {
          scopeOwner.path = configuredRoutePath;
          if (scopeOwner.setNextContent(viewportInstruction, instruction)) {
            changedScopeOwners.push(scopeOwner);
          }
          arrayRemove(clearScopeOwners, value => value === scopeOwner);
          if (!isClearViewportInstruction(viewportInstruction)
            && viewportInstruction.scope !== null
            && viewportInstruction.scope!.parent! !== null
            && viewportInstruction.scope!.parent!.isViewportScope
          ) {
            arrayRemove(clearViewportScopes, value => value === viewportInstruction.scope!.parent!.viewportScope);
          }
        }
      }
      let results = await Promise.all(changedScopeOwners.map((value) => value.canLeave()));
      if (results.some(result => result === false)) {
        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
      }
      results = await Promise.all(changedScopeOwners.map(async (value) => {
        const canEnter = await value.canEnter();
        if (typeof canEnter === 'boolean') {
          if (canEnter) {
            return value.enter();
          } else {
            return false;
          }
        }
        await this.goto(canEnter, { append: true });
        await value.abortContentChange();
        // TODO: Abort content change in the viewports
        return true;
      }));
      if (results.some(result => result === false)) {
        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
      }
      for (const viewport of changedScopeOwners) {
        if (updatedScopeOwners.every(value => value !== viewport)) {
          updatedScopeOwners.push(viewport);
        }
      }
      // TODO: Fix multi level recursiveness!
      alreadyFoundInstructions.push(...viewportInstructions);
      ({ found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(remainingInstructions, alreadyFoundInstructions));

      // Look for configured child routes (once we've loaded everything so far?)
      if (configuredRoute.hasRemaining &&
        viewportInstructions.length === 0 &&
        remainingInstructions.length === 0) {
        let configured = new FoundRoute();
        const routeScopeOwners = alreadyFoundInstructions
          .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
          .map(instr => instr.owner!)
          .filter((value, index, arr) => arr.indexOf(value) === index);
        for (const owner of routeScopeOwners) {
          configured = await this.findInstructions(owner.scope, configuredRoute.remaining, owner.scope);
          if (configured.foundConfiguration) {
            break;
          }
        }
        if (configured.foundInstructions) {
          configuredRoute = configured;
          configuredRoutePath = `${configuredRoutePath || ''}/${configuredRoute.matching}`;
        } else {
          // TODO: Do something here!
          this.unknownRoute(configured.remaining);
        }
        this.appendInstructions(configured.instructions);
      }
      // Don't use defaults when it's a full state navigation
      if (fullStateInstruction) {
        this.appendedInstructions = this.appendedInstructions.filter(x => !x.default);
      }
      // Process non-defaults first
      let appendedInstructions = this.appendedInstructions.filter(x => !x.default);
      this.appendedInstructions = this.appendedInstructions.filter(x => x.default);
      if (appendedInstructions.length === 0) {
        const index = this.appendedInstructions.findIndex(x => x.default);
        if (index >= 0) {
          appendedInstructions = this.appendedInstructions.splice(index, 1);
        }
      }
      while (appendedInstructions.length > 0) {
        const appendedInstruction = appendedInstructions.shift()!;
        const existingAlreadyFound = alreadyFoundInstructions.some(x => x.sameViewport(appendedInstruction));
        const existingFound = viewportInstructions.find(value => value.sameViewport(appendedInstruction));
        const existingRemaining = remainingInstructions.find(value => value.sameViewport(appendedInstruction));
        if (appendedInstruction.default &&
          (existingAlreadyFound ||
            (existingFound !== void 0 && !existingFound.default) ||
            (existingRemaining !== void 0 && !existingRemaining.default))) {
          continue;
        }
        if (existingFound !== void 0) {
          arrayRemove(viewportInstructions, value => value === existingFound);
        }
        if (existingRemaining !== void 0) {
          arrayRemove(remainingInstructions, value => value === existingRemaining);
        }
        if (appendedInstruction.viewport !== null) {
          viewportInstructions.push(appendedInstruction);
        } else {
          remainingInstructions.push(appendedInstruction);
        }
      }
      if (viewportInstructions.length === 0 && remainingInstructions.length === 0) {
        viewportInstructions = clearScopeOwners.map(owner => {
          const instr = createClearViewportInstruction(owner.isViewport ? owner as Viewport : void 0);
          if (owner.isViewportScope) {
            instr.viewportScope = owner as ViewportScope;
          }
          return instr;
        });
        viewportInstructions.push(...clearViewportScopes.map(viewportScope => {
          const instr = createClearViewportInstruction();
          instr.viewportScope = viewportScope;
          return instr;
        }));
        clearViewportScopes = [];
      }
    } while (viewportInstructions.length > 0 || remainingInstructions.length > 0);

    await Promise.all(updatedScopeOwners.map((value) => value.loadContent()));
    await this.replacePaths(instruction);
    // this.updateNav();

    // Remove history entry if no history viewports updated
    if (
      instructionNavigation.new &&
      !instructionNavigation.first &&
      !instruction.repeating &&
      updatedScopeOwners.every(viewport => viewport.options.noHistory)
    ) {
      instruction.untracked = true;
    }
    updatedScopeOwners.forEach((viewport) => {
      viewport.finalizeContentChange();
    });
    this.lastNavigation = this.processingNavigation!;
    if (this.lastNavigation.repeating) {
      this.lastNavigation.repeating = false;
    }
    this.processingNavigation = null;
    await this.finalize(instruction);
  }

  private async finalize(instruction: NavigatorInstruction): Promise<void> {
    this.logger.trace(() => `finalize(${instruction.toString()})`);

    this.currentEntry = instruction;
    let index = this.currentEntry.index >= 0 ? this.currentEntry.index : 0;
    if (this.currentEntry.untracked) {
      if (instruction.fromBrowser) {
        await this.popNavigatorState();
      }
      index--;
      this.currentEntry.index = index;
      this.entries[index] = this.currentEntry.toEntry();
      await this.saveState();
    } else if (this.currentEntry.replacing) {
      this.entries[index] = this.currentEntry.toEntry();
      await this.saveState();
    } else { // New entry (add and discard later entries)
      if (this.statefulHistory !== void 0 && this.options.statefulHistoryLength! > 0) {
        // Need to clear the instructions we discard!
        const indexPreserve = this.entries.length - this.options.statefulHistoryLength!;
        for (const entry of this.entries.slice(index)) {
          if (entry.hasInstructions) {
            await this.navigatorSerializeCallback(entry, this.entries.slice(indexPreserve, index));
          }
        }
      }
      this.entries = this.entries.slice(0, index);
      this.entries.push(this.currentEntry.toEntry());
      await this.saveState(true);
    }
    this.currentEntry.resolve();
  }

  private async saveState(push: boolean = false): Promise<void> {

    if (this.currentEntry.isInitial) {
      this.logger.trace(`saveState(push:${push}) - discarding initial entry`);
      return;
    } else {
      this.logger.trace(`saveState(push:${push})`);
    }
    const storedEntry = this.currentEntry.toEntry();
    this.entries[storedEntry.index !== undefined ? storedEntry.index : 0] = storedEntry;

    if (this.statefulHistory && this.options.statefulHistoryLength! > 0) {
      const index = this.entries.length - this.options.statefulHistoryLength!;
      for (let i = 0; i < index; i++) {
        const entry = this.entries[i];
        if (entry.hasInstructions) {
          this.entries[i] = await this.navigatorSerializeCallback(entry, this.entries.slice(index));
        }
      }
    }

    const state: INavigatorState = {
      entries: this.entries.map(x => x.toEntry()),
      currentEntry: storedEntry.toEntry(),
    };

    if (push) {
      this.pushNavigatorState(state);
    } else {
      this.replaceNavigatorState(state);
    }
  }

  /**
   * @internal
   */
  public findScope(origin: Node | ICustomElementViewModel<Element> | Viewport | Scope | ICustomElementController<Element> | null): Scope {
    this.logger.trace(() => `findScope(origin:${origin})`);

    const rootScope = this.rootScope!.scope;

    // this.ensureRootScope();
    if (origin === void 0 || origin === null) {
      return rootScope;
    }

    if (origin instanceof Scope || origin instanceof Viewport) {
      return origin.scope;
    }

    let container: IContainer;
    if ('resourceResolvers' in origin) {
      container = origin as IContainer;
    } else if ('context' in origin) {
      container = origin.context;
    } else if ('$controller' in origin) {
      container = origin.$controller!.context;
    } else {
      const controller = CustomElement.for(origin, true);
      if (controller === void 0) {
        return rootScope;
      }
      container = controller.context;
    }

    if (!container.has(ClosestScope, true)) {
      return rootScope;
    }
    return container.get<Scope>(ClosestScope) ?? rootScope;
  }
  /**
   * @internal
   */
  public findParentScope(container: IContainer | null): Scope {
    this.logger.trace(() => `findParentScope(container:${container})`);

    if (container === null) {
      return this.rootScope!.scope;
    }
    // Already (prematurely) set on this view model so get it from container's parent instead
    if (container.has(ClosestScope, false)) {
      container = (container as IContainer & { parent: IContainer }).parent;
      if (container === null) {
        return this.rootScope!.scope;
      }
    }
    if (container.has(ClosestScope, true)) {
      return container.get<Scope>(ClosestScope);
    }
    return this.rootScope!.scope;
  }

  /**
   * Public API - Get viewport by name
   */
  public getViewport(name: string): Viewport | null {
    this.logger.trace(`getViewport(name:${name})`);

    return this.allViewports().find(viewport => viewport.name === name) || null;
  }
  /**
   * Public API (not yet implemented)
   */
  public addViewport(...args: unknown[]): unknown {
    throw new Error('Not implemented');
  }
  /**
   * Public API (not yet implemented)
   */
  public findViewportScope(...args: unknown[]): unknown {
    throw new Error('Not implemented');
  }
  /**
   * Public API (not yet implemented)
   */
  public addViewportScope(...args: unknown[]): unknown {
    throw new Error('Not implemented');
  }

  /**
   * @internal - Called from the viewport scope custom element in created()
   */
  public setClosestScope(
    viewModelOrContainer: ICustomElementViewModel<Element> | IContainer,
    scope: Scope,
  ): void {
    this.logger.trace(() => `setClosestScope(viewModelOrContainer:${viewModelOrContainer},scope:{id:${scope.id}})`);

    const container = this.getContainer(viewModelOrContainer);
    Registration.instance(ClosestScope, scope).register(container!);
  }
  public unsetClosestScope(viewModelOrContainer: ICustomElementViewModel<Element> | IContainer): void {
    this.logger.trace(() => `unsetClosestScope(viewModelOrContainer:${viewModelOrContainer})`);

    const container = this.getContainer(viewModelOrContainer);
    // TODO: Get an 'unregister' on container
    (container as any).resolvers.delete(ClosestScope);
  }

  /**
   * @internal - Called from the viewport custom element
   */
  public connectViewport(
    viewport: Viewport | null,
    controller: ICustomElementController<Element>,
    name: string,
    options?: IViewportOptions,
  ): Viewport {
    this.logger.trace(`connectViewport(name:${name})`);

    const parentScope = this.findParentScope(controller.context);
    if (viewport === null) {
      viewport = parentScope.addViewport(name, controller, options);
      this.setClosestScope(controller.context, viewport.connectedScope);
    }
    return viewport;
  }
  /**
   * @internal - Called from the viewport custom element
   */
  public disconnectViewport(
    viewport: Viewport,
    controller: ICustomElementController<Element>,
  ): void {
    this.logger.trace(`disconnectViewport(name:${viewport.name})`);

    if (!viewport.connectedScope.parent!.removeViewport(viewport, controller)) {
      throw new Error(`Failed to remove viewport: ${viewport.name}`);
    }
    this.unsetClosestScope(controller.context);
  }
  /**
   * @internal - Called from the viewport scope custom element
   */
  public connectViewportScope(
    viewportScope: ViewportScope | null,
    name: string,
    container: IContainer,
    element: Node,
    options?: IViewportScopeOptions,
  ): ViewportScope {
    this.logger.trace(`connectViewportScope(name:${name})`);

    const parentScope = this.findParentScope(container);
    if (viewportScope === null) {
      viewportScope = parentScope.addViewportScope(name, element, options);
      this.setClosestScope(container, viewportScope.connectedScope);
    }
    return viewportScope;
  }
  /**
   * @internal - Called from the viewport scope custom element
   */
  public disconnectViewportScope(viewportScope: ViewportScope, container: IContainer): void {
    this.logger.trace(`disconnectViewportScope(name:${viewportScope.name})`);

    if (!viewportScope.connectedScope.parent!.removeViewportScope(viewportScope)) {
      throw new Error(`Failed to remove viewport scope: ${viewportScope.path}`);
    }
    this.unsetClosestScope(container);
  }

  public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
    this.logger.trace(`allViewports(includeDisabled:${includeDisabled},includeReplaced:${includeReplaced})`);

    // this.ensureRootScope();
    return (this.rootScope as ViewportScope).scope.allViewports(includeDisabled, includeReplaced);
  }

  /**
   * Public API - THE navigation API
   */
  public async goto(
    instructions: NavigationInstruction | NavigationInstruction[],
    options?: IGotoOptions,
  ): Promise<void> {
    this.logger.trace(`goto(instructions:${instructions},options:${options})`);

    options = options || {};
    // TODO: Review query extraction; different pos for path and fragment!
    if (typeof instructions === 'string' && !options.query) {
      const [path, search] = instructions.split('?');
      instructions = path;
      options.query = search;
    }
    const toOptions: IViewportInstructionsOptions = {};
    if (options.origin) {
      toOptions.context = options.origin;
    }

    let scope: Scope | null = null;
    ({ instructions, scope } = NavigationInstructionResolver.createViewportInstructions(this, instructions, toOptions));

    if (options.append && this.processingNavigation !== null) {
      instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
      this.appendInstructions(instructions as ViewportInstruction[], scope);
      // Can't return current navigation promise since it can lead to deadlock in enter
      this.logger.trace(`goto(instructions:${instructions},options:${options}) - already processing, appending instruction`);
      return;
    }

    const entry = NavigatorInstruction.create({
      instruction: instructions as string | ViewportInstruction[],
      scope,
      title: options.title,
      data: options.data,
      query: options.query,
      replacing: options.replace,
      repeating: options.append,
      fromBrowser: false,
    });
    await this.navigate(entry);
  }

  /**
   * Public API
   */
  public async refresh(): Promise<void> {
    const entry = this.currentEntry;
    if (entry.isInitial) {
      this.logger.trace('refresh() - discarding initial entry');
      return;
    } else {
      this.logger.trace('refresh()');
    }

    entry.replacing = true;
    entry.refreshing = true;
    await this.navigate(entry);
  }

  /**
   * Public API
   */
  public async back(): Promise<void> {
    const newIndex = (this.currentEntry.index >= 0 ? this.currentEntry.index : 0) - 1;
    if (newIndex >= this.entries.length) {
      this.logger.trace('back() - discarding index out of bounds');
      return;
    } else {
      this.logger.trace('back()');
    }

    const entry = this.entries[newIndex].toInstruction();
    await this.navigate(entry);
  }

  /**
   * Public API
   */
  public async forward(): Promise<void> {
    const newIndex = (this.currentEntry.index >= 0 ? this.currentEntry.index : 0) + 1;
    if (newIndex >= this.entries.length) {
      this.logger.trace('forward() - discarding index out of bounds');
      return;
    } else {
      this.logger.trace('forward()');
    }

    const entry = this.entries[newIndex].toInstruction();
    await this.navigate(entry);
  }

  private async navigate(entry: NavigatorInstruction): Promise<void> {
    this.logger.trace('navigate');

    await this.scheduler.queueRenderTask(() => this.$navigate(entry), { async: true }).result;
  }

  private getState(): INavigatorState {
    this.logger.trace('getState');

    const state = this.state ?? {};
    const entries = (state.entries || []) as NavigatorEntry[];
    const currentEntry = (state.currentEntry as NavigatorEntry | null) ?? NavigatorInstruction.INITIAL;
    return { state, entries, currentEntry };
  }

  private loadState(): void {
    this.logger.trace('loadState');

    const state = this.getState();
    this.entries = state.entries;
    this.currentEntry = state.currentEntry.toInstruction();
  }

  private async $navigate(entry: NavigatorInstruction): Promise<void> {
    this.logger.trace(() => `$navigate(${entry.toString()})`);

    const navigationFlags: INavigatorFlags = {};

    if (this.currentEntry.isInitial) { // Refresh or first entry
      this.loadState();
      if (!this.currentEntry.isInitial) {
        navigationFlags.refresh = true;
      } else {
        navigationFlags.first = true;
        navigationFlags.new = true;
        // TODO: Should this really be created here? Shouldn't it be in the viewer?
        this.currentEntry = NavigatorInstruction.create({
          index: 0,
          instruction: '',
          fullStateInstruction: '',
        });
        this.entries = [];
      }
    }

    if (entry.index >= 0 && !entry.replacing && !entry.refreshing) { // History navigation
      entry.historyMovement = entry.index - (this.currentEntry.index >= 0 ? this.currentEntry.index : 0);
      entry.instruction = this.entries[entry.index]?.fullStateInstruction ?? entry.fullStateInstruction;
      entry.replacing = true;
      if (entry.historyMovement > 0) {
        navigationFlags.forward = true;
      } else if (entry.historyMovement < 0) {
        navigationFlags.back = true;
      }
    } else if (entry.refreshing || navigationFlags.refresh) { // Refreshing
      entry.index = this.currentEntry.index;
    } else if (entry.replacing) { // Replacing
      navigationFlags.replace = true;
      navigationFlags.new = true;
      entry.index = this.currentEntry.index;
    } else { // New entry
      navigationFlags.new = true;
      entry.index = this.currentEntry.index >= 0 ? this.currentEntry.index + 1 : this.entries.length;
    }

    entry.navigation = navigationFlags;
    entry.previous = this.currentEntry;

    // eslint-disable-next-line @typescript-eslint/promise-function-async
    this.scheduler.queueMicroTask(() => this.processNavigations(entry), { async: true });

    await entry.promise;
  }

  /**
   * Public API
   */
  public checkActive(instructions: ViewportInstruction[]): boolean {
    this.logger.trace('checkActive');

    for (const instruction of instructions) {
      const scopeInstructions = matchScope(this.activeComponents, instruction.scope!);
      const matching = scopeInstructions.filter(instr => instr.sameComponent(instruction, true));
      if (matching.length === 0) {
        return false;
      }
      if (Array.isArray(instruction.nextScopeInstructions)
        && instruction.nextScopeInstructions.length > 0
        && matchChildren(
          instruction.nextScopeInstructions,
          matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()
        ) === false) {
        return false;
      }
    }
    return true;
  }

  /**
   * Public API
   */
  public addRoutes(routes: IRoute[], context?: ICustomElementViewModel<Element> | Node): IRoute[] {
    // TODO: This should add to the context instead
    // TODO: Add routes without context to rootScope content (which needs to be created)?
    return [];
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.addRoutes(routes);
  }
  /**
   * Public API
   */
  public removeRoutes(routes: IRoute[] | string[], context?: ICustomElementViewModel<Element> | Node): void {
    // TODO: This should remove from the context instead
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.removeRoutes(routes);
  }

  /**
   * Public API
   */
  public addHooks(hooks: IHookDefinition[]): HookIdentity[] {
    this.logger.trace('addHooks');

    return hooks.map(hook => this.addHook(hook.hook, hook.options));
  }
  /**
   * Public API
   */
  public addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IHookOptions): HookIdentity;
  public addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IHookOptions): HookIdentity;
  public addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IHookOptions): HookIdentity;
  public addHook(hookFunction: HookFunction, options?: IHookOptions): HookIdentity;
  public addHook(hook: HookFunction, options: IHookOptions): HookIdentity {
    this.logger.trace('addHook');

    return this.hookManager.addHook(hook, options);
  }
  /**
   * Public API
   */
  public removeHooks(hooks: HookIdentity[]): void {
    this.logger.trace('removeHooks');
  }

  private async findInstructions(
    scope: Scope,
    instruction: string | ViewportInstruction[],
    instructionScope: Scope,
    transformUrl: boolean = false,
  ): Promise<FoundRoute> {
    this.logger.trace(`findInstructions(scope:${scope},instruction:${instruction},instructionScope:${instructionScope},transformUrl:${transformUrl})`);

    let route = new FoundRoute();
    if (typeof instruction === 'string') {
      instruction = transformUrl
        ? await this.hookManager.invokeTransformFromUrl(instruction, this.processingNavigation!)
        : instruction;
      if (Array.isArray(instruction)) {
        route.instructions = instruction;
      } else {
        // TODO: Review this
        if (instruction === '/') {
          instruction = '';
        }

        const instructions = parseViewportInstructions(instruction);
        if (this.options.useConfiguredRoutes && !this.hasSiblingInstructions(instructions)) {
          const foundRoute = scope.findMatchingRoute(instruction);
          if (foundRoute?.foundConfiguration) {
            route = foundRoute;
          } else {
            if (this.options.useDirectRoutes) {
              route.instructions = instructions;
              if (route.instructions.length > 0) {
                const nextInstructions = route.instructions[0].nextScopeInstructions || [];
                route.remaining = stringifyViewportInstructions(nextInstructions);
                route.instructions[0].nextScopeInstructions = null;
              }
            }
          }
        } else if (this.options.useDirectRoutes) {
          route.instructions = instructions;
        }
      }
    } else {
      route.instructions = instruction;
    }

    for (const instr of route.instructions) {
      if (instr.scope === null) {
        instr.scope = instructionScope;
      }
    }

    return route;
  }

  private hasSiblingInstructions(instructions: ViewportInstruction[] | null): boolean {
    if (instructions === null) {
      this.logger.trace(`hasSiblingInstructions(instructions:null) - false`);
      return false;
    }

    if (instructions.length > 1) {
      this.logger.trace(`hasSiblingInstructions(instructions.length:${instructions.length}) - true`);
      return true;
    }

    return instructions.some(instruction => this.hasSiblingInstructions(instruction.nextScopeInstructions));
  }

  private appendInstructions(instructions: ViewportInstruction[], scope: Scope | null = null): void {
    this.logger.trace(`appendInstructions(instructions.length:${instructions.length},scope:${scope})`);

    if (scope === null) {
      scope = this.rootScope!.scope;
    }
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = scope;
      }
    }
    this.appendedInstructions.push(...instructions);
  }

  private unknownRoute(route: string) {
    this.logger.trace(`unknownRoute(route:${route})`);

    if (typeof route !== 'string' || route.length === 0) {
      return;
    }
    if (this.options.useConfiguredRoutes && this.options.useDirectRoutes) {
      // TODO: Add missing/unknown route handling
      throw new Error(`No matching configured route or component found for '${route}'`);
    } else if (this.options.useConfiguredRoutes) {
      // TODO: Add missing/unknown route handling
      throw new Error(`No matching configured route found for '${route}'`);
    } else {
      // TODO: Add missing/unknown route handling
      throw new Error(`No matching route/component found for '${route}'`);
    }
  }

  private findViewports(
    instructions: ViewportInstruction[],
    alreadyFound: ViewportInstruction[],
    withoutViewports: boolean = false,
  ): {
    found: ViewportInstruction[];
    remaining: ViewportInstruction[];
  } {
    this.logger.trace(`findViewports(instructions.length:${instructions.length},alreadyFound.length:${alreadyFound.length},withoutViewports:${withoutViewports})`);

    const found: ViewportInstruction[] = [];
    const remaining: ViewportInstruction[] = [];

    while (instructions.length) {
      if (instructions[0].scope === null) {
        instructions[0].scope = this.rootScope!.scope;
      }
      const scope: Scope = instructions[0].scope!;
      const { foundViewports, remainingInstructions } = scope.findViewports(instructions.filter(instruction => instruction.scope === scope), alreadyFound, withoutViewports);
      found.push(...foundViewports);
      remaining.push(...remainingInstructions);
      instructions = instructions.filter(instruction => instruction.scope !== scope);
    }
    return { found: found.slice(), remaining };
  }

  private async cancelNavigation(
    updatedScopeOwners: IScopeOwner[],
    instruction: NavigatorInstruction,
  ): Promise<void> {
    this.logger.trace(() => `cancelNavigation(${instruction.toString()})`);

    // TODO: Take care of disabling viewports when cancelling and stateful!
    updatedScopeOwners.forEach((viewport) => {
      viewport.abortContentChange().catch(error => { throw error; });
    });

    if (instruction.fromBrowser) {
      if (instruction.navigation && instruction.navigation.new) {
        await this.popNavigatorState();
      } else {
        await this.go(instruction.historyMovement, true);
      }
    }

    this.processingNavigation = null;
    instruction.resolve();
  }

  private ensureRootScope(): ViewportScope {
    this.logger.trace('ensureRootScope');

    if (!this.rootScope) {
      const root = this.container.get(Aurelia).root;
      // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
      this.rootScope = new ViewportScope('rootScope', this, root.config.host as Node, null, true, root.config.component as CustomElementType);
    }
    return this.rootScope;
  }

  private async replacePaths(instruction: NavigatorInstruction): Promise<void> {
    this.logger.trace(() => `replacePaths(${instruction.toString()})`);

    (this.rootScope as ViewportScope).scope.reparentViewportInstructions();
    let instructions = this.rootScope!.scope.hoistedChildren
      .filter(scope => scope.viewportInstruction !== null && !scope.viewportInstruction.isEmpty())
      .map(scope => scope.viewportInstruction!);
    instructions = cloneViewportInstructions(instructions, true);

    // The following makes sure right viewport/viewport scopes are set and update
    // whether viewport name is necessary or not
    const alreadyFound: ViewportInstruction[] = [];
    let { found, remaining } = this.findViewports(instructions, alreadyFound, true);
    let guard = 100;
    while (remaining.length) {
      // Guard against endless loop
      if (!guard--) {
        throw new Error('Failed to find viewport when updating viewer paths.');
      }
      alreadyFound.push(...found);
      ({ found, remaining } = this.findViewports(remaining, alreadyFound, true));
    }

    this.activeComponents = instructions;
    this.activeRoute = instruction.route;

    // First invoke with viewport instructions (should it perhaps get full state?)
    let state = await this.hookManager.invokeTransformToUrl(instructions, instruction);
    if (typeof state !== 'string') {
      // Convert to string if necessary
      state = stringifyViewportInstructions(state, false, true);
    }
    // Invoke again with string
    state = await this.hookManager.invokeTransformToUrl(state, instruction);

    const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
    // if (instruction.path === void 0 || instruction.path.length === 0 || instruction.path === '/') {
    instruction.path = state + query;
    // }

    const fullViewportStates = [createClearViewportInstruction()];
    fullViewportStates.push(...cloneViewportInstructions(instructions, this.statefulHistory));
    instruction.fullStateInstruction = fullViewportStates;

    // TODO: Fetch and update title
  }

  private async freeComponents(
    instruction: ViewportInstruction,
    excludeComponents: IRouteableComponent[],
    alreadyDone: IRouteableComponent[],
  ): Promise<void> {
    this.logger.trace('freeComponents');

    const component = instruction.componentInstance;
    const viewport = instruction.viewport;
    if (component === null || viewport === null || alreadyDone.some(done => done === component)) {
      return;
    }
    if (!excludeComponents.some(exclude => exclude === component)) {
      await viewport.freeContent(component);
      alreadyDone.push(component);
      return;
    }
    if (instruction.nextScopeInstructions !== null) {
      for (const nextInstruction of instruction.nextScopeInstructions) {
        await this.freeComponents(nextInstruction, excludeComponents, alreadyDone);
      }
    }
  }

  private getContainer(viewModelOrContainer: ICustomElementViewModel<Element> | IContainer): IContainer | null {
    this.logger.trace(`getContainer(viewModelOrContainer:${viewModelOrContainer})`);

    if ('resourceResolvers' in viewModelOrContainer) {
      return viewModelOrContainer;
    }

    if (isRenderContext(viewModelOrContainer)) {
      return viewModelOrContainer.get(IContainer);
    }

    if ('$controller' in viewModelOrContainer) {
      return viewModelOrContainer.$controller!.context.get(IContainer);
    }

    return null;
  }

  private get state(): Record<string, unknown> | null {
    // TODO: this cast is not necessarily safe. Either we should do some type checks (and throw on "invalid" state?), or otherwise ensure (e.g. with replaceState) that it's always an object.
    return this.history.state as Record<string, unknown> | null;
  }

  private get viewerState(): NavigatorViewerState {
    return NavigatorViewerState.fromLocation(this.location, this.options.useUrlFragmentHash === true);
  }

  private forwardedState: IForwardedState = { resolve: null, suppressPopstate: false };
  private async go(delta: number, suppressPopstate: boolean = false): Promise<void> {
    this.logger.trace(`go(delta:${delta},suppressPopstate:${suppressPopstate})`);

    const promise = new Promise(resolve => {
      this.forwardedState = {
        resolve,
        suppressPopstate,
      };
    });

    this.history.go(delta);

    await promise;
  }

  private pushNavigatorState(state: INavigatorState): void {
    this.logger.trace('pushNavigatorState');

    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    this.history.pushState(state, title ?? '', `${fragment}${path}`);
  }

  private replaceNavigatorState(state: INavigatorState): void {
    this.logger.trace('replaceNavigatorState');

    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    this.history.replaceState(state, title ?? '', `${fragment}${path}`);
  }

  private async popNavigatorState(): Promise<void> {
    this.logger.trace('popNavigatorState');

    const promise = new Promise(resolve => {
      this.forwardedState = {
        resolve,
        suppressPopstate: true,
      };
    });

    this.history.go(-1);

    await promise;
  }

  @bound
  public handlePopstate(event: PopStateEvent): void {
    this.logger.trace('handlePopstate');

    const {
      resolve,
      suppressPopstate,
    } = this.forwardedState;

    this.forwardedState = {
      resolve: null,
      suppressPopstate: false,
    };

    if (!suppressPopstate) {
      const browserNavigationEvent: INavigatorViewerEvent = {
        ...this.viewerState,
        ...{
          event,
          state: this.history.state as INavigatorState,
        },
      };
      const entry = browserNavigationEvent.state?.currentEntry?.toInstruction() ?? NavigatorInstruction.create();
      entry.instruction = browserNavigationEvent.instruction;
      entry.fromBrowser = true;
      this.navigate(entry).catch(error => {
        this.logger.error(error);
        throw error;
      });
      if (resolve !== null) {
        resolve();
      }
    }
  }
}

function anchorEventInfoToInstruction(info: AnchorEventInfo) {
  let instruction = info.instruction || '';
  if (typeof instruction === 'string' && instruction.startsWith('#')) {
    instruction = instruction.slice(1);
    // '#' === '/' === '#/'
    if (!instruction.startsWith('/')) {
      instruction = `/${instruction}`;
    }
  }
  return instruction;
}
