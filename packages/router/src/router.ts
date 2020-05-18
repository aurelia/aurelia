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
  IRouteSeparators, flattenViewportInstructions, stringifyViewportInstructions, isClearAllViewportsInstruction, isAddAllViewportsInstruction, isClearViewportInstruction, matchScope, matchChildren, createViewportInstruction, parseViewportInstructions, cloneViewportInstructions, createClearViewportInstruction,
} from './instruction-resolver';
import {
  INavigatorInstruction,
  IRouteableComponent,
  NavigationInstruction,
  IRoute,
  ComponentAppellation,
  ViewportHandle,
  ComponentParameters,
  IWindow,
  IHistory,
  ILocation,
} from './interfaces';
import { NavigationInstructionResolver, IViewportInstructionsOptions } from './type-resolvers';
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
import { INavClasses } from './resources/nav';
import { Nav, INavRoute } from './nav';
import { LinkHandler, AnchorEventInfo } from './link-handler';
import { IStateManager } from './state-manager';

export interface IGotoOptions {
  title?: string;
  query?: string;
  data?: Record<string, unknown>;
  replace?: boolean;
  append?: boolean;
  origin?: ICustomElementViewModel<Element> | Node;
}

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

export interface IStoredNavigatorEntry {
  instruction: string | ViewportInstruction[];
  fullStateInstruction: string | ViewportInstruction[];
  scope?: Scope | null;
  index?: number;
  firstEntry?: boolean; // Index might change to not require first === 0, firstEntry should be reliable
  route?: IRoute;
  path?: string;
  title?: string;
  query?: string;
  parameters?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export interface INavigatorEntry extends IStoredNavigatorEntry {
  fromBrowser?: boolean;
  replacing?: boolean;
  refreshing?: boolean;
  repeating?: boolean;
  untracked?: boolean;
  historyMovement?: number;
  resolve?: ((value?: void | PromiseLike<void>) => void);
  reject?: ((value?: void | PromiseLike<void>) => void);
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
  entries: IStoredNavigatorEntry[];
  currentEntry: IStoredNavigatorEntry;
}

interface IForwardedState {
  resolve: (() => void) | null;
  suppressPopstate: boolean;
}
export const IRouter = DI.createInterface<IRouter>('IRouter').withDefault(x => x.singleton(Router));
export interface IRouter {
  readonly isNavigating: boolean;
  activeComponents: ViewportInstruction[];
  readonly rootScope: ViewportScope | null;
  readonly activeRoute?: IRoute;
  readonly container: IContainer;
  readonly stateManager: IStateManager;
  readonly hookManager: HookManager;
  readonly options: IRouterOptions;

  readonly statefulHistory: boolean;

  readonly linkHandler: LinkHandler;
  readonly navs: Readonly<Record<string, Nav>>;

  activate(options?: IRouterOptions): void;
  loadUrl(): Promise<void>;
  deactivate(): void;

  // External API to get viewport by name
  getViewport(name: string): Viewport | null;

  // Called from the viewport scope custom element
  setClosestScope(
    viewModelOrContainer: ICustomElementViewModel<Element> | IContainer,
    scope: Scope,
  ): void;
  // getClosestScope(viewModelOrElement: ICustomElementViewModel | T | ICustomElementController | IContainer): Scope | null;
  unsetClosestScope(
    viewModelOrContainer: ICustomElementViewModel<Element> | IContainer,
  ): void;

  // Called from the viewport custom element
  connectViewport(
    viewport: Viewport | null,
    controller: ICustomElementController<Element>,
    name: string,
    options?: IViewportOptions,
  ): Viewport;
  // Called from the viewport custom element
  disconnectViewport(
    viewport: Viewport,
    controller: ICustomElementController<Element>,
  ): void;
  // Called from the viewport scope custom element
  connectViewportScope(
    viewportScope: ViewportScope | null,
    name: string,
    container: IContainer,
    element: Node,
    options?: IViewportScopeOptions,
  ): ViewportScope;
  // Called from the viewport scope custom element
  disconnectViewportScope(
    viewportScope: ViewportScope,
    container: IContainer,
  ): void;

  allViewports(includeDisabled?: boolean): Viewport[];
  findScope(
    elementOrViewmodelOrviewport: Node | ICustomElementViewModel<Element> | Viewport | ICustomElementController<Element> | null,
  ): Scope;

  goto(
    instructions: NavigationInstruction | NavigationInstruction[],
    options?: IGotoOptions,
  ): Promise<void>;
  refresh(): Promise<void>;
  back(): Promise<void>;
  forward(): Promise<void>;

  checkActive(instructions: ViewportInstruction[]): boolean;

  addRoutes(routes: IRoute[], context?: ICustomElementViewModel<Element> | Node): IRoute[];
  removeRoutes(routes: IRoute[] | string[], context?: ICustomElementViewModel<Element> | Node): void;
  addHooks(hooks: IHookDefinition[]): HookIdentity[];

  addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IHookOptions): HookIdentity;
  addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IHookOptions): HookIdentity;
  addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IHookOptions): HookIdentity;
  addHook(hook: HookFunction, options: IHookOptions): HookIdentity;
  removeHooks(hooks: HookIdentity[]): void;

  setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  updateNav(name?: string): void;
  findNav(name: string): Nav;
}

class ClosestScope { }

export class Router implements IRouter {
  public navs: Record<string, Nav> = {};
  public rootScope: ViewportScope | null = null;

  public activeComponents: ViewportInstruction[] = [];
  public activeRoute?: IRoute;

  public appendedInstructions: ViewportInstruction[] = [];

  public options: IRouterOptions = {
    useHref: true,
    statefulHistoryLength: 0,
    useDirectRoutes: true,
    useConfiguredRoutes: true,
  };

  private currentEntry: INavigatorInstruction;
  private entries: IStoredNavigatorEntry[] = [];
  private readonly uninitializedEntry: INavigatorInstruction;

  private isActive: boolean = false;
  private loadedFirst: boolean = false;

  private processingNavigation: INavigatorInstruction | null = null;
  private lastNavigation: INavigatorInstruction | null = null;
  private staleChecks: Record<string, ViewportInstruction[]> = {};

  public constructor(
    @IContainer public readonly container: IContainer,
    @IRouterEvents public readonly events: IRouterEvents,
    @IScheduler public readonly scheduler: IScheduler,
    @IWindow public readonly window: IWindow,
    @IHistory public readonly history: IHistory,
    @ILocation public readonly location: ILocation,
    public hookManager: HookManager,
    @IStateManager public readonly stateManager: IStateManager,
    public linkHandler: LinkHandler,
  ) {
    this.uninitializedEntry = {
      instruction: 'NAVIGATOR UNINITIALIZED',
      fullStateInstruction: '',
    };
    this.currentEntry = this.uninitializedEntry;
  }

  public get isNavigating(): boolean {
    return this.processingNavigation !== null;
  }

  public get statefulHistory(): boolean {
    return this.options.statefulHistoryLength !== void 0 && this.options.statefulHistoryLength > 0;
  }

  public activate(options?: IRouterOptions): void {
    if (this.isActive) {
      throw new Error('Router has already been activated');
    }

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

  public async loadUrl(): Promise<void> {
    const entry: INavigatorEntry = {
      ...this.viewerState,
      ...{
        fullStateInstruction: '',
        replacing: true,
        fromBrowser: false,
      }
    };
    const result = this.navigate(entry);
    this.loadedFirst = true;
    return result;
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Router has not been activated');
    }

    this.linkHandler.deactivate();
    this.events.unsubscribeAll();
    this.window.removeEventListener('popstate', this.handlePopstate);
  }

  public setNav(name: string, routes: INavRoute[], classes?: INavClasses): void {
    const nav = this.findNav(name);
    if (nav !== void 0 && nav !== null) {
      nav.routes = [];
    }
    this.addNav(name, routes, classes);
  }
  public addNav(name: string, routes: INavRoute[], classes?: INavClasses): void {
    let nav = this.navs[name];
    if (nav === void 0 || nav === null) {
      nav = this.navs[name] = new Nav(this, name, [], classes);
    }
    nav.addRoutes(routes);
    nav.update();
  }
  public updateNav(name?: string): void {
    const navs = name
      ? [name]
      : Object.keys(this.navs);
    for (const nav of navs) {
      if (this.navs[nav] !== void 0 && this.navs[nav] !== null) {
        this.navs[nav].update();
      }
    }
  }
  public findNav(name: string): Nav {
    return this.navs[name];
  }

  // TODO: use @bound and improve name (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  public navigatorSerializeCallback = async (
    entry: IStoredNavigatorEntry,
    preservedEntries: IStoredNavigatorEntry[],
  ): Promise<IStoredNavigatorEntry> => {
    let excludeComponents = [];
    for (const preservedEntry of preservedEntries) {
      if (typeof preservedEntry.instruction !== 'string') {
        excludeComponents.push(...flattenViewportInstructions(preservedEntry.instruction)
          .filter(instruction => instruction.viewport !== null)
          .map(instruction => instruction.componentInstance));
      }
      if (typeof preservedEntry.fullStateInstruction !== 'string') {
        excludeComponents.push(...flattenViewportInstructions(preservedEntry.fullStateInstruction)
          .filter(instruction => instruction.viewport !== null)
          .map(instruction => instruction.componentInstance));
      }
    }
    excludeComponents = excludeComponents.filter(
      (component, i, arr) => component !== null && arr.indexOf(component) === i
    ) as IRouteableComponent[];

    const serialized: IStoredNavigatorEntry = { ...entry };
    let instructions = [];
    if (serialized.fullStateInstruction && typeof serialized.fullStateInstruction !== 'string') {
      instructions.push(...serialized.fullStateInstruction);
      serialized.fullStateInstruction = stringifyViewportInstructions(serialized.fullStateInstruction);
    }
    if (serialized.instruction && typeof serialized.instruction !== 'string') {
      instructions.push(...serialized.instruction);
      serialized.instruction = stringifyViewportInstructions(serialized.instruction);
    }
    instructions = instructions.filter(
      (instruction, i, arr) =>
        instruction !== null
        && instruction.componentInstance !== null
        && arr.indexOf(instruction) === i
    );

    const alreadyDone: IRouteableComponent[] = [];
    for (const instruction of instructions) {
      await this.freeComponents(instruction, excludeComponents, alreadyDone);
    }
    return serialized;
  };

  // TODO: use @bound and improve name (eslint-disable is temp)
  private async processNavigations(qInstruction: INavigatorInstruction): Promise<void> {
    const instruction = this.processingNavigation = qInstruction as INavigatorInstruction;

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
        ? (instruction.instruction as string).slice(1) : instruction.instruction as string;
      configuredRoutePath = `${configuredRoutePath || ''}${configuredRoute.matching}`;
      this.rootScope!.path = configuredRoutePath;
    }
    // TODO: Used to have an early exit if no instructions. Restore it?
    const clearScopeOwners: IScopeOwner[] = [];
    let clearViewportScopes: ViewportScope[] = [];
    for (const clearInstruction of instructions.filter(instr => isClearAllViewportsInstruction(instr))) {
      const scope = clearInstruction.scope || this.rootScope!.scope;
      clearScopeOwners.push(...scope.children.filter(scope => !scope.owner!.isEmpty).map(scope => scope.owner!));
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
        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], qInstruction);
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
        this.appendedInstructions = this.appendedInstructions.filter(instruction => !instruction.default);
      }
      // Process non-defaults first
      let appendedInstructions = this.appendedInstructions.filter(instruction => !instruction.default);
      this.appendedInstructions = this.appendedInstructions.filter(instruction => instruction.default);
      if (appendedInstructions.length === 0) {
        const index = this.appendedInstructions.findIndex(instruction => instruction.default);
        if (index >= 0) {
          appendedInstructions = this.appendedInstructions.splice(index, 1);
        }
      }
      while (appendedInstructions.length > 0) {
        const appendedInstruction = appendedInstructions.shift() as ViewportInstruction;
        const existingAlreadyFound = alreadyFoundInstructions.some(instruction => instruction.sameViewport(appendedInstruction));
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
          const instruction = createClearViewportInstruction(owner.isViewport ? owner as Viewport : void 0);
          if (owner.isViewportScope) {
            instruction.viewportScope = owner as ViewportScope;
          }
          return instruction;
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
    this.lastNavigation = this.processingNavigation;
    if (this.lastNavigation.repeating) {
      this.lastNavigation.repeating = false;
    }
    this.processingNavigation = null;
    await this.finalize(instruction);
  }

  private async finalize(instruction: INavigatorInstruction): Promise<void> {
    this.currentEntry = instruction;
    let index = this.currentEntry.index !== undefined ? this.currentEntry.index : 0;
    if (this.currentEntry.untracked) {
      if (instruction.fromBrowser) {
        await this.popNavigatorState();
      }
      index--;
      this.currentEntry.index = index;
      this.entries[index] = this.toStoredEntry(this.currentEntry);
      await this.saveState();
    } else if (this.currentEntry.replacing) {
      this.entries[index] = this.toStoredEntry(this.currentEntry);
      await this.saveState();
    } else { // New entry (add and discard later entries)
      if (this.statefulHistory !== void 0 && this.options.statefulHistoryLength! > 0) {
        // Need to clear the instructions we discard!
        const indexPreserve = this.entries.length - this.options.statefulHistoryLength!;
        for (const entry of this.entries.slice(index)) {
          if (typeof entry.instruction !== 'string' || typeof entry.fullStateInstruction !== 'string') {
            await this.navigatorSerializeCallback(entry, this.entries.slice(indexPreserve, index));
          }
        }
      }
      this.entries = this.entries.slice(0, index);
      this.entries.push(this.toStoredEntry(this.currentEntry));
      await this.saveState(true);
    }
    if (this.currentEntry.resolve) {
      this.currentEntry.resolve();
    }
  }

  private async saveState(push: boolean = false): Promise<void> {
    if (this.currentEntry === this.uninitializedEntry) {
      return;
    }
    const storedEntry = this.toStoredEntry(this.currentEntry);
    this.entries[storedEntry.index !== undefined ? storedEntry.index : 0] = storedEntry;

    if (this.statefulHistory && this.options.statefulHistoryLength! > 0) {
      const index = this.entries.length - this.options.statefulHistoryLength!;
      for (let i = 0; i < index; i++) {
        const entry = this.entries[i];
        if (typeof entry.instruction !== 'string' || typeof entry.fullStateInstruction !== 'string') {
          this.entries[i] = await this.navigatorSerializeCallback(entry, this.entries.slice(index));
        }
      }
    }

    const state: INavigatorState = {
      entries: [],
      currentEntry: { ...this.toStoreableEntry(storedEntry) },
    };
    for (const entry of this.entries) {
      state.entries.push(this.toStoreableEntry(entry));
    }

    if (push) {
      this.pushNavigatorState(state);
    } else {
      this.replaceNavigatorState(state);
    }
  }

  private toStoredEntry(entry: INavigatorInstruction): IStoredNavigatorEntry {
    const {
      previous,
      fromBrowser,
      replacing,
      refreshing,
      untracked,
      historyMovement,
      navigation,
      scope,

      resolve,
      reject,

      ...storableEntry } = entry;
    return storableEntry;
  }

  public findScope(origin: Node | ICustomElementViewModel<Element> | Viewport | Scope | ICustomElementController<Element> | null): Scope {
    const rootScope = this.rootScope!.scope;

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

  public findParentScope(container: IContainer | null): Scope {
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

  // External API to get viewport by name
  public getViewport(name: string): Viewport | null {
    return this.allViewports().find(viewport => viewport.name === name) || null;
  }

  // Called from the viewport scope custom element in created()
  public setClosestScope(
    viewModelOrContainer: ICustomElementViewModel<Element> | IContainer,
    scope: Scope,
  ): void {
    const container = this.getContainer(viewModelOrContainer);
    Registration.instance(ClosestScope, scope).register(container!);
  }
  public unsetClosestScope(viewModelOrContainer: ICustomElementViewModel<Element> | IContainer): void {
    const container = this.getContainer(viewModelOrContainer);
    // TODO: Get an 'unregister' on container
    (container as any).resolvers.delete(ClosestScope);
  }

  // Called from the viewport custom element in attached()
  public connectViewport(
    viewport: Viewport | null,
    controller: ICustomElementController<Element>,
    name: string,
    options?: IViewportOptions,
  ): Viewport {
    const parentScope = this.findParentScope(controller.context);
    if (viewport === null) {
      viewport = parentScope.addViewport(name, controller, options);
      this.setClosestScope(controller.context, viewport.connectedScope);
    }
    return viewport;
  }
  // Called from the viewport custom element
  public disconnectViewport(
    viewport: Viewport,
    controller: ICustomElementController<Element>,
  ): void {
    if (!viewport.connectedScope.parent!.removeViewport(viewport, controller)) {
      throw new Error(`Failed to remove viewport: ${viewport.name}`);
    }
    this.unsetClosestScope(controller.context);
  }
  // Called from the viewport scope custom element in attached()
  public connectViewportScope(
    viewportScope: ViewportScope | null,
    name: string,
    container: IContainer,
    element: Node,
    options?: IViewportScopeOptions,
  ): ViewportScope {
    const parentScope = this.findParentScope(container);
    if (viewportScope === null) {
      viewportScope = parentScope.addViewportScope(name, element, options);
      this.setClosestScope(container, viewportScope.connectedScope);
    }
    return viewportScope;
  }
  // Called from the viewport scope custom element
  public disconnectViewportScope(viewportScope: ViewportScope, container: IContainer): void {
    if (!viewportScope.connectedScope.parent!.removeViewportScope(viewportScope)) {
      throw new Error(`Failed to remove viewport scope: ${viewportScope.path}`);
    }
    this.unsetClosestScope(container);
  }

  public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
    // this.ensureRootScope();
    return (this.rootScope as ViewportScope).scope.allViewports(includeDisabled, includeReplaced);
  }

  public async goto(
    instructions: NavigationInstruction | NavigationInstruction[],
    options?: IGotoOptions,
  ): Promise<void> {
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

    if (options.append && this.processingNavigation) {
      instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
      this.appendInstructions(instructions as ViewportInstruction[], scope);
      // Can't return current navigation promise since it can lead to deadlock in enter
      return;
    }

    const entry: INavigatorEntry = {
      instruction: instructions as ViewportInstruction[],
      fullStateInstruction: '',
      scope: scope,
      title: options.title,
      data: options.data,
      query: options.query,
      replacing: options.replace,
      repeating: options.append,
      fromBrowser: false,
    };
    await this.navigate(entry);
  }

  public async refresh(): Promise<void> {
    const entry = this.currentEntry;
    if (entry === this.uninitializedEntry) {
      return;
    }
    entry.replacing = true;
    entry.refreshing = true;
    await this.navigate(entry);
  }

  public async back(): Promise<void> {
    const newIndex = (this.currentEntry.index !== undefined ? this.currentEntry.index : 0) - 1;
    if (newIndex >= this.entries.length) {
      return;
    }
    const entry = this.entries[newIndex];
    await this.navigate(entry);
  }

  public async forward(): Promise<void> {
    const newIndex = (this.currentEntry.index !== undefined ? this.currentEntry.index : 0) + 1;
    if (newIndex >= this.entries.length) {
      return;
    }
    const entry = this.entries[newIndex];
    await this.navigate(entry);
  }

  private async navigate(entry: INavigatorInstruction): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    await this.scheduler.queueRenderTask(() => this.$navigate(entry), { async: true }).result;
  }

  private getState(): INavigatorState {
    const state = this.state ?? {};
    const entries = (state.entries || []) as IStoredNavigatorEntry[];
    const currentEntry = (state.currentEntry || this.uninitializedEntry) as IStoredNavigatorEntry;
    return { state, entries, currentEntry };
  }

  private loadState(): void {
    const state = this.getState();
    this.entries = state.entries;
    this.currentEntry = state.currentEntry;
  }

  private async $navigate(entry: INavigatorInstruction): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      entry.resolve = resolve;
      entry.reject = reject;
    });

    const navigationFlags: INavigatorFlags = {};

    if (this.currentEntry === this.uninitializedEntry) { // Refresh or first entry
      this.loadState();
      if (this.currentEntry !== this.uninitializedEntry) {
        navigationFlags.refresh = true;
      } else {
        navigationFlags.first = true;
        navigationFlags.new = true;
        // TODO: Should this really be created here? Shouldn't it be in the viewer?
        this.currentEntry = {
          index: 0,
          instruction: '',
          fullStateInstruction: '',
          // path: this.options.viewer.getPath(true),
          // fromBrowser: null,
        };
        this.entries = [];
      }
    }

    if (entry.index !== void 0 && !entry.replacing && !entry.refreshing) { // History navigation
      entry.historyMovement = entry.index - (this.currentEntry.index !== void 0 ? this.currentEntry.index : 0);
      entry.instruction = this.entries[entry.index] !== void 0 && this.entries[entry.index] !== null ? this.entries[entry.index].fullStateInstruction : entry.fullStateInstruction;
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
      entry.index = this.currentEntry.index !== void 0 ? this.currentEntry.index + 1 : this.entries.length;
    }

    entry.navigation = navigationFlags;
    entry.previous = this.currentEntry;

    // eslint-disable-next-line @typescript-eslint/promise-function-async
    this.scheduler.queueMicroTask(() => this.processNavigations(entry), { async: true });

    await promise;
  }

  public checkActive(instructions: ViewportInstruction[]): boolean {
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

  public addRoutes(routes: IRoute[], context?: ICustomElementViewModel<Element> | Node): IRoute[] {
    // TODO: This should add to the context instead
    // TODO: Add routes without context to rootScope content (which needs to be created)?
    return [];
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.addRoutes(routes);
  }
  public removeRoutes(routes: IRoute[] | string[], context?: ICustomElementViewModel<Element> | Node): void {
    // TODO: This should remove from the context instead
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.removeRoutes(routes);
  }

  public addHooks(hooks: IHookDefinition[]): HookIdentity[] {
    return hooks.map(hook => this.addHook(hook.hook, hook.options));
  }
  public addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IHookOptions): HookIdentity;
  public addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IHookOptions): HookIdentity;
  public addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IHookOptions): HookIdentity;
  public addHook(hookFunction: HookFunction, options?: IHookOptions): HookIdentity;
  public addHook(hook: HookFunction, options: IHookOptions): HookIdentity {
    return this.hookManager.addHook(hook, options);
  }
  public removeHooks(hooks: HookIdentity[]): void {
    return;
  }

  private async findInstructions(
    scope: Scope,
    instruction: string | ViewportInstruction[],
    instructionScope: Scope,
    transformUrl: boolean = false,
  ): Promise<FoundRoute> {
    let route = new FoundRoute();
    if (typeof instruction === 'string') {
      instruction = transformUrl
        ? await this.hookManager.invokeTransformFromUrl(instruction as string, this.processingNavigation as INavigatorInstruction)
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
          if (foundRoute !== null && foundRoute.foundConfiguration) {
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
      return false;
    }
    if (instructions.length > 1) {
      return true;
    }
    return instructions.some(instruction => this.hasSiblingInstructions(instruction.nextScopeInstructions));
  }

  private appendInstructions(instructions: ViewportInstruction[], scope: Scope | null = null): void {
    if (scope === null) {
      scope = this.rootScope!.scope;
    }
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = scope;
      }
    }
    this.appendedInstructions.push(...(instructions as ViewportInstruction[]));
  }

  private checkStale(name: string, instructions: ViewportInstruction[]): boolean {
    const staleCheck = this.staleChecks[name];
    if (staleCheck === void 0) {
      this.staleChecks[name] = instructions.slice();
      return false;
    }
    if (staleCheck.length !== instructions.length) {
      this.staleChecks[name] = instructions.slice();
      return false;
    }
    for (let i = 0, ii = instructions.length; i < ii; i++) {
      if (staleCheck[i] !== instructions[i]) {
        this.staleChecks[name] = instructions.slice();
        return false;
      }
    }
    return true;
  }

  private unknownRoute(route: string) {
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
    qInstruction: INavigatorInstruction,
  ): Promise<void> {
    // TODO: Take care of disabling viewports when cancelling and stateful!
    updatedScopeOwners.forEach((viewport) => {
      viewport.abortContentChange().catch(error => { throw error; });
    });
    await this.cancel(qInstruction as INavigatorInstruction);
    this.processingNavigation = null;
    (qInstruction.resolve as ((value: void | PromiseLike<void>) => void))();
  }

  private async cancel(instruction: INavigatorInstruction): Promise<void> {
    if (instruction.fromBrowser) {
      if (instruction.navigation && instruction.navigation.new) {
        await this.popNavigatorState();
      } else {
        await this.go(-(instruction.historyMovement || 0), true);
      }
    }
    if (this.currentEntry.resolve) {
      this.currentEntry.resolve();
    }
  }

  private ensureRootScope(): ViewportScope {
    if (!this.rootScope) {
      const root = this.container.get(Aurelia).root;
      // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
      this.rootScope = new ViewportScope('rootScope', this, root.config.host as Node, null, true, root.config.component as CustomElementType);
    }
    return this.rootScope;
  }

  private async replacePaths(instruction: INavigatorInstruction): Promise<void> {
    (this.rootScope as ViewportScope).scope.reparentViewportInstructions();
    let instructions: ViewportInstruction[] = (this.rootScope as ViewportScope).scope.hoistedChildren
      .filter(scope => scope.viewportInstruction !== null && !scope.viewportInstruction.isEmpty())
      .map(scope => scope.viewportInstruction) as ViewportInstruction[];
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

    return Promise.resolve();
  }

  private async freeComponents(
    instruction: ViewportInstruction,
    excludeComponents: IRouteableComponent[],
    alreadyDone: IRouteableComponent[],
  ): Promise<void> {
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

  private toStoreableEntry(entry: IStoredNavigatorEntry): IStoredNavigatorEntry {
    const storeable: IStoredNavigatorEntry = { ...entry };
    if (storeable.instruction && typeof storeable.instruction !== 'string') {
      storeable.instruction = stringifyViewportInstructions(storeable.instruction);
    }
    if (storeable.fullStateInstruction && typeof storeable.fullStateInstruction !== 'string') {
      storeable.fullStateInstruction = stringifyViewportInstructions(storeable.fullStateInstruction);
    }
    return storeable;
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
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    this.history.pushState(state, title ?? '', `${fragment}${path}`);
  }

  private replaceNavigatorState(state: INavigatorState): void {
    const { title, path } = state.currentEntry;
    const fragment = this.options.useUrlFragmentHash ? '#/' : '';

    this.history.replaceState(state, title ?? '', `${fragment}${path}`);
  }

  private async popNavigatorState(): Promise<void> {
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
      const entry: INavigatorEntry = browserNavigationEvent.state?.currentEntry ?? { instruction: '', fullStateInstruction: '' };
      entry.instruction = browserNavigationEvent.instruction;
      entry.fromBrowser = true;
      this.navigate(entry).catch(error => { throw error; });
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
