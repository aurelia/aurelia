/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable max-lines-per-function */
import {
  DI,
  IContainer,
  Reporter,
  Registration,
  Metadata,
  IIndexable,
  IEventAggregator,
  IDisposable,
} from '@aurelia/kernel';
import {
  Aurelia,
  CustomElementType,
  CustomElement,
  INode,
  DOM,
  ICustomElementController,
  ICustomElementViewModel,
  isRenderContext,
  IScheduler,
} from '@aurelia/runtime';
import {
  InstructionResolver,
  IRouteSeparators,
} from './instruction-resolver';
import {
  INavigatorInstruction,
  IRouteableComponent,
  NavigationInstruction,
  IRoute,
  ComponentAppellation,
  ViewportHandle,
  ComponentParameters,
  IStateManager,
} from './interfaces';
import {
  INavigatorEntry,
  INavigatorFlags,
  INavigatorOptions,
  INavigatorViewerEvent,
  IStoredNavigatorEntry,
  Navigator,
} from './navigator';
import { QueueItem } from './queue';
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

export interface IGotoOptions<T extends INode> {
  title?: string;
  query?: string;
  data?: Record<string, unknown>;
  replace?: boolean;
  append?: boolean;
  origin?: ICustomElementViewModel | T;
}

export interface IRouterOptions<T extends INode> extends INavigatorOptions<T> {
  separators?: IRouteSeparators;
  useUrlFragmentHash?: boolean;
  useHref?: boolean;
  statefulHistoryLength?: number;
  useDirectRoutes?: boolean;
  useConfiguredRoutes?: boolean;
  hooks?: IHookDefinition<T>[];
}

export interface IRouter<T extends INode> {
  readonly isNavigating: boolean;
  activeComponents: ViewportInstruction<T>[];
  readonly rootScope: ViewportScope<T> | null;
  readonly activeRoute?: IRoute<T>;
  readonly container: IContainer;
  readonly instructionResolver: InstructionResolver<T>;
  navigator: Navigator<T>;
  readonly stateManager: IStateManager<T>;
  readonly hookManager: HookManager<T>;
  readonly options: IRouterOptions<T>;

  readonly statefulHistory: boolean;
  activate(options?: IRouterOptions<T>): void;
  // loadUrl(): Promise<void>;
  deactivate(): void;

  // External API to get viewport by name
  getViewport(name: string): Viewport<T> | null;

  // Called from the viewport scope custom element
  setClosestScope(
    viewModelOrContainer: ICustomElementViewModel | IContainer,
    scope: Scope<T>,
  ): void;
  // getClosestScope(viewModelOrElement: ICustomElementViewModel | T | ICustomElementController | IContainer): Scope | null;
  unsetClosestScope(
    viewModelOrContainer: ICustomElementViewModel | IContainer,
  ): void;

  // Called from the viewport custom element
  connectViewport(
    viewport: Viewport<T> | null,
    controller: ICustomElementController<T>,
    name: string,
    options?: IViewportOptions,
  ): Viewport<T>;
  // Called from the viewport custom element
  disconnectViewport(
    viewport: Viewport<T>,
    controller: ICustomElementController<T>,
  ): void;
  // Called from the viewport scope custom element
  connectViewportScope(
    viewportScope: ViewportScope<T> | null,
    name: string,
    container: IContainer,
    element: T,
    options?: IViewportScopeOptions,
  ): ViewportScope<T>;
  // Called from the viewport scope custom element
  disconnectViewportScope(
    viewportScope: ViewportScope<T>,
    container: IContainer,
  ): void;

  allViewports(includeDisabled?: boolean): Viewport<T>[];
  findScope(
    elementOrViewmodelOrviewport: T | ICustomElementViewModel | Viewport<T> | ICustomElementController | null,
  ): Scope<T>;

  goto(
    instructions: NavigationInstruction<T> | NavigationInstruction<T>[],
    options?: IGotoOptions<T>,
  ): Promise<void>;
  refresh(): Promise<void>;
  back(): Promise<void>;
  forward(): Promise<void>;

  checkActive(instructions: ViewportInstruction<T>[]): boolean;

  addRoutes(routes: IRoute<T>[], context?: ICustomElementViewModel | T): IRoute<T>[];
  removeRoutes(routes: IRoute<T>[] | string[], context?: ICustomElementViewModel | T): void;
  addHooks(hooks: IHookDefinition<T>[]): HookIdentity[];

  addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction<T>, options?: IHookOptions<T>): HookIdentity;
  addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction<T>, options?: IHookOptions<T>): HookIdentity;
  addHook(transformToUrlHookFunction: TransformToUrlHookFunction<T>, options?: IHookOptions<T>): HookIdentity;
  addHook(hook: HookFunction<T>, options: IHookOptions<T>): HookIdentity;
  removeHooks(hooks: HookIdentity[]): void;

  createViewportInstruction(
    component: ComponentAppellation<T>,
    viewport?: ViewportHandle<T>,
    parameters?: ComponentParameters,
    ownsScope?: boolean,
    nextScopeInstructions?: ViewportInstruction<T>[] | null,
  ): ViewportInstruction<T>;
}

class ClosestScope { }

export const IRouter = DI.createInterface<IRouter<INode>>('IRouter').withDefault(x => x.singleton(Router));

export class Router<T extends INode> implements IRouter<T> {
  public rootScope: ViewportScope<T> | null = null;

  public activeComponents: ViewportInstruction<T>[] = [];
  public activeRoute?: IRoute<T>;

  public appendedInstructions: ViewportInstruction<T>[] = [];

  public options: IRouterOptions<T> = {
    useHref: true,
    statefulHistoryLength: 0,
    useDirectRoutes: true,
    useConfiguredRoutes: true,
  };
  private isActive: boolean = false;
  // private loadedFirst: boolean = false;

  private processingNavigation: INavigatorInstruction<T> | null = null;
  private lastNavigation: INavigatorInstruction<T> | null = null;
  private staleChecks: Record<string, ViewportInstruction<T>[]> = {};

  public constructor(
    @IContainer public readonly container: IContainer,
    @IRouterEvents public readonly events: IRouterEvents,
    @IScheduler public readonly scheduler: IScheduler,
    public navigator: Navigator<T>,
    public instructionResolver: InstructionResolver<T>,
    public hookManager: HookManager<T>,
    public readonly stateManager: IStateManager<T>,
  ) {}

  public get isNavigating(): boolean {
    return this.processingNavigation !== null;
  }

  public get statefulHistory(): boolean {
    return this.options.statefulHistoryLength !== void 0 && this.options.statefulHistoryLength > 0;
  }

  public activate(options?: IRouterOptions<T>): void {
    if (this.isActive) {
      throw new Error('Router has already been activated');
    }

    this.isActive = true;
    this.options = {
      ...this.options,
      ...options
    };
    if (this.options.hooks !== void 0) {
      this.addHooks(this.options.hooks);
    }

    this.instructionResolver.activate({ separators: this.options.separators });
    //  this.navigator.activate(this, {
    //    callback: this.navigatorCallback,
    //    store: this.navigation,
    //    statefulHistoryLength: this.options.statefulHistoryLength,
    //    serializeCallback: this.statefulHistory ? this.navigatorSerializeCallback : void 0,
    //  });
    // this.linkHandler.activate({ callback: this.linkCallback, useHref: this.options.useHref });
    // this.navigation.activate({
    //   callback: this.browserNavigatorCallback,
    //   useUrlFragmentHash: this.options.useUrlFragmentHash
    // });
    this.events.subscribe('au:router:navigate', (instruction: INavigatorInstruction<T>) => {
      this.scheduler.queueMicroTask(async () => {
        await this.processNavigations(instruction);
      }, { async: true });
    });
    this.ensureRootScope();
  }

  //  public async loadUrl(): Promise<void> {
  //    const entry: INavigatorEntry = {
  //      // ...this.navigation.viewerState,
  //      ...{
  //        fullStateInstruction: '',
  //        replacing: true,
  //        fromBrowser: false,
  //      }
  //    };
  //    const result = this.navigator.navigate(entry);
  //    this.loadedFirst = true;
  //    return result;
  //  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Router has not been activated');
    }
    // this.linkHandler.deactivate();
    this.navigator.deactivate();
    this.events.unsubscribeAll();
    // this.navigation.deactivate();
  }

  // TODO: use @bound and improve name (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  public navigatorSerializeCallback = async (
    entry: IStoredNavigatorEntry<T>,
    preservedEntries: IStoredNavigatorEntry<T>[],
  ): Promise<IStoredNavigatorEntry<T>> => {
    let excludeComponents = [];
    for (const preservedEntry of preservedEntries) {
      if (typeof preservedEntry.instruction !== 'string') {
        excludeComponents.push(...this.instructionResolver.flattenViewportInstructions(preservedEntry.instruction)
          .filter(instruction => instruction.viewport !== null)
          .map(instruction => instruction.componentInstance));
      }
      if (typeof preservedEntry.fullStateInstruction !== 'string') {
        excludeComponents.push(...this.instructionResolver.flattenViewportInstructions(preservedEntry.fullStateInstruction)
          .filter(instruction => instruction.viewport !== null)
          .map(instruction => instruction.componentInstance));
      }
    }
    excludeComponents = excludeComponents.filter(
      (component, i, arr) => component !== null && arr.indexOf(component) === i
    ) as IRouteableComponent<T>[];

    const serialized: IStoredNavigatorEntry<T> = { ...entry };
    let instructions = [];
    if (serialized.fullStateInstruction && typeof serialized.fullStateInstruction !== 'string') {
      instructions.push(...serialized.fullStateInstruction);
      serialized.fullStateInstruction = this.instructionResolver.stringifyViewportInstructions(serialized.fullStateInstruction);
    }
    if (serialized.instruction && typeof serialized.instruction !== 'string') {
      instructions.push(...serialized.instruction);
      serialized.instruction = this.instructionResolver.stringifyViewportInstructions(serialized.instruction);
    }
    instructions = instructions.filter(
      (instruction, i, arr) =>
        instruction !== null
        && instruction.componentInstance !== null
        && arr.indexOf(instruction) === i
    );

    const alreadyDone: IRouteableComponent<T>[] = [];
    for (const instruction of instructions) {
      await this.freeComponents(instruction, excludeComponents, alreadyDone);
    }
    return serialized;
  };

  // TODO: use @bound and improve name (eslint-disable is temp)
  private async processNavigations(qInstruction: INavigatorInstruction<T>): Promise<void> {
    const instruction = this.processingNavigation = qInstruction as INavigatorInstruction<T>;

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
    const clearScopeOwners: IScopeOwner<T>[] = [];
    let clearViewportScopes: ViewportScope<T>[] = [];
    for (const clearInstruction of instructions.filter(instr => this.instructionResolver.isClearAllViewportsInstruction(instr))) {
      const scope = clearInstruction.scope || this.rootScope!.scope;
      clearScopeOwners.push(...scope.children.filter(scope => !scope.owner!.isEmpty).map(scope => scope.owner!));
      if (scope.viewportScope !== null) {
        clearViewportScopes.push(scope.viewportScope);
      }
    }
    instructions = instructions.filter(instr => !this.instructionResolver.isClearAllViewportsInstruction(instr));

    for (const addInstruction of instructions.filter(instr => this.instructionResolver.isAddAllViewportsInstruction(instr))) {
      addInstruction.setViewport((addInstruction.scope || this.rootScope!.scope).viewportScope!.name);
      addInstruction.scope = addInstruction.scope!.owningScope!;
    }

    const updatedScopeOwners: IScopeOwner<T>[] = [];
    const alreadyFoundInstructions: ViewportInstruction<T>[] = [];
    // TODO: Take care of cancellations down in subsets/iterations
    let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
    let guard = 100;
    do {
      if (!guard--) { // Guard against endless loop
        const err = new Error(`${remainingInstructions.length} remaining instructions after 100 iterations; there is likely an infinite loop.`);
        (err as Error & IIndexable)['remainingInstructions'] = remainingInstructions;
        throw err;
      }
      const changedScopeOwners: IScopeOwner<T>[] = [];

      const hooked = await this.hookManager.invokeBeforeNavigation(viewportInstructions, instruction);
      if (hooked === false) {
        return this.cancelNavigation([...changedScopeOwners, ...updatedScopeOwners], instruction);
      } else {
        viewportInstructions = hooked as ViewportInstruction<T>[];
      }
      for (const viewportInstruction of viewportInstructions) {
        const scopeOwner = viewportInstruction.owner;
        if (scopeOwner !== null) {
          scopeOwner.path = configuredRoutePath;
          if (scopeOwner.setNextContent(viewportInstruction, instruction)) {
            changedScopeOwners.push(scopeOwner);
          }
          arrayRemove(clearScopeOwners, value => value === scopeOwner);
          if (!this.instructionResolver.isClearViewportInstruction(viewportInstruction)
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
        let configured = new FoundRoute<T>();
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
        const appendedInstruction = appendedInstructions.shift() as ViewportInstruction<T>;
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
          const instruction = this.createViewportInstruction(
            this.instructionResolver.clearViewportInstruction,
            owner.isViewport ? owner as Viewport<T> : void 0,
          );
          if (owner.isViewportScope) {
            instruction.viewportScope = owner as ViewportScope<T>;
          }
          return instruction;
        });
        viewportInstructions.push(...clearViewportScopes.map(viewportScope => {
          const instr = this.createViewportInstruction(this.instructionResolver.clearViewportInstruction);
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
    await this.navigator.finalize(instruction);
  }

  public findScope(origin: T | ICustomElementViewModel | Viewport<T> | Scope<T> | ICustomElementController | null): Scope<T> {
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
    return container.get<Scope<T>>(ClosestScope) ?? rootScope;
  }

  public findParentScope(container: IContainer | null): Scope<T> {
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
      return container.get<Scope<T>>(ClosestScope);
    }
    return this.rootScope!.scope;
  }

  // External API to get viewport by name
  public getViewport(name: string): Viewport<T> | null {
    return this.allViewports().find(viewport => viewport.name === name) || null;
  }

  // Called from the viewport scope custom element in created()
  public setClosestScope(
    viewModelOrContainer: ICustomElementViewModel | IContainer,
    scope: Scope<T>,
  ): void {
    const container = this.getContainer(viewModelOrContainer);
    Registration.instance(ClosestScope, scope).register(container!);
  }
  public unsetClosestScope(viewModelOrContainer: ICustomElementViewModel | IContainer): void {
    const container = this.getContainer(viewModelOrContainer);
    // TODO: Get an 'unregister' on container
    (container as any).resolvers.delete(ClosestScope);
  }

  // Called from the viewport custom element in attached()
  public connectViewport(
    viewport: Viewport<T> | null,
    controller: ICustomElementController<T>,
    name: string,
    options?: IViewportOptions,
  ): Viewport<T> {
    const parentScope = this.findParentScope(controller.context);
    if (viewport === null) {
      viewport = parentScope.addViewport(name, controller, options);
      this.setClosestScope(controller.context, viewport.connectedScope);
    }
    return viewport;
  }
  // Called from the viewport custom element
  public disconnectViewport(
    viewport: Viewport<T>,
    controller: ICustomElementController<T>,
  ): void {
    if (!viewport.connectedScope.parent!.removeViewport(viewport, controller)) {
      throw new Error(`Failed to remove viewport: ${viewport.name}`);
    }
    this.unsetClosestScope(controller.context);
  }
  // Called from the viewport scope custom element in attached()
  public connectViewportScope(
    viewportScope: ViewportScope<T> | null,
    name: string,
    container: IContainer,
    element: T,
    options?: IViewportScopeOptions,
  ): ViewportScope<T> {
    const parentScope = this.findParentScope(container);
    if (viewportScope === null) {
      viewportScope = parentScope.addViewportScope(name, element, options);
      this.setClosestScope(container, viewportScope.connectedScope);
    }
    return viewportScope;
  }
  // Called from the viewport scope custom element
  public disconnectViewportScope(viewportScope: ViewportScope<T>, container: IContainer): void {
    if (!viewportScope.connectedScope.parent!.removeViewportScope(viewportScope)) {
      throw new Error(`Failed to remove viewport scope: ${viewportScope.path}`);
    }
    this.unsetClosestScope(container);
  }

  public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport<T>[] {
    // this.ensureRootScope();
    return (this.rootScope as ViewportScope<T>).scope.allViewports(includeDisabled, includeReplaced);
  }

  public goto(
    instructions: NavigationInstruction<T> | NavigationInstruction<T>[],
    options?: IGotoOptions<T>,
  ): Promise<void> {
    options = options || {};
    // TODO: Review query extraction; different pos for path and fragment!
    if (typeof instructions === 'string' && !options.query) {
      const [path, search] = instructions.split('?');
      instructions = path;
      options.query = search;
    }
    const toOptions: IViewportInstructionsOptions<T> = {};
    if (options.origin) {
      toOptions.context = options.origin;
    }

    let scope: Scope<T> | null = null;
    ({ instructions, scope } = NavigationInstructionResolver.createViewportInstructions<T>(this, instructions, toOptions));

    if (options.append && this.processingNavigation) {
      instructions = NavigationInstructionResolver.toViewportInstructions<T>(this, instructions);
      this.appendInstructions(instructions as ViewportInstruction<T>[], scope);
      // Can't return current navigation promise since it can lead to deadlock in enter
      return Promise.resolve();
    }

    const entry: INavigatorEntry<T> = {
      instruction: instructions as ViewportInstruction<T>[],
      fullStateInstruction: '',
      scope: scope,
      title: options.title,
      data: options.data,
      query: options.query,
      replacing: options.replace,
      repeating: options.append,
      fromBrowser: false,
    };
    return this.navigator.navigate(entry);
  }

  public refresh(): Promise<void> {
    return this.navigator.refresh();
  }

  public back(): Promise<void> {
    return this.navigator.go(-1);
  }

  public forward(): Promise<void> {
    return this.navigator.go(1);
  }

  public checkActive(instructions: ViewportInstruction<T>[]): boolean {
    for (const instruction of instructions) {
      const scopeInstructions = this.instructionResolver.matchScope(this.activeComponents, instruction.scope!);
      const matching = scopeInstructions.filter(instr => instr.sameComponent(instruction, true));
      if (matching.length === 0) {
        return false;
      }
      if (Array.isArray(instruction.nextScopeInstructions)
        && instruction.nextScopeInstructions.length > 0
        && this.instructionResolver.matchChildren(
          instruction.nextScopeInstructions,
          matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()
        ) === false) {
        return false;
      }
    }
    return true;
  }

  public addRoutes(routes: IRoute<T>[], context?: ICustomElementViewModel | T): IRoute<T>[] {
    // TODO: This should add to the context instead
    // TODO: Add routes without context to rootScope content (which needs to be created)?
    return [];
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.addRoutes(routes);
  }
  public removeRoutes(routes: IRoute<T>[] | string[], context?: ICustomElementViewModel | T): void {
    // TODO: This should remove from the context instead
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.removeRoutes(routes);
  }

  public addHooks(hooks: IHookDefinition<T>[]): HookIdentity[] {
    return hooks.map(hook => this.addHook(hook.hook, hook.options));
  }
  public addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction<T>, options?: IHookOptions<T>): HookIdentity;
  public addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction<T>, options?: IHookOptions<T>): HookIdentity;
  public addHook(transformToUrlHookFunction: TransformToUrlHookFunction<T>, options?: IHookOptions<T>): HookIdentity;
  public addHook(hookFunction: HookFunction<T>, options?: IHookOptions<T>): HookIdentity;
  public addHook(hook: HookFunction<T>, options: IHookOptions<T>): HookIdentity {
    return this.hookManager.addHook(hook, options);
  }
  public removeHooks(hooks: HookIdentity[]): void {
    return;
  }

  public createViewportInstruction(
    component: ComponentAppellation<T>,
    viewport?: ViewportHandle<T>,
    parameters?: ComponentParameters,
    ownsScope: boolean = true,
    nextScopeInstructions: ViewportInstruction<T>[] | null = null,
  ): ViewportInstruction<T> {
    return this.instructionResolver.createViewportInstruction(component, viewport, parameters, ownsScope, nextScopeInstructions);
  }

  private async findInstructions(
    scope: Scope<T>,
    instruction: string | ViewportInstruction<T>[],
    instructionScope: Scope<T>,
    transformUrl: boolean = false,
  ): Promise<FoundRoute<T>> {
    let route = new FoundRoute<T>();
    if (typeof instruction === 'string') {
      instruction = transformUrl
        ? await this.hookManager.invokeTransformFromUrl(instruction as string, this.processingNavigation as INavigatorInstruction<T>)
        : instruction;
      if (Array.isArray(instruction)) {
        route.instructions = instruction;
      } else {
        // TODO: Review this
        if (instruction === '/') {
          instruction = '';
        }

        const instructions = this.instructionResolver.parseViewportInstructions(instruction);
        if (this.options.useConfiguredRoutes && !this.hasSiblingInstructions(instructions)) {
          const foundRoute = scope.findMatchingRoute(instruction);
          if (foundRoute !== null && foundRoute.foundConfiguration) {
            route = foundRoute;
          } else {
            if (this.options.useDirectRoutes) {
              route.instructions = instructions;
              if (route.instructions.length > 0) {
                const nextInstructions = route.instructions[0].nextScopeInstructions || [];
                route.remaining = this.instructionResolver.stringifyViewportInstructions(nextInstructions);
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

  private hasSiblingInstructions(instructions: ViewportInstruction<T>[] | null): boolean {
    if (instructions === null) {
      return false;
    }
    if (instructions.length > 1) {
      return true;
    }
    return instructions.some(instruction => this.hasSiblingInstructions(instruction.nextScopeInstructions));
  }

  private appendInstructions(instructions: ViewportInstruction<T>[], scope: Scope<T> | null = null): void {
    if (scope === null) {
      scope = this.rootScope!.scope;
    }
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = scope;
      }
    }
    this.appendedInstructions.push(...(instructions as ViewportInstruction<T>[]));
  }

  private checkStale(name: string, instructions: ViewportInstruction<T>[]): boolean {
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
    instructions: ViewportInstruction<T>[],
    alreadyFound: ViewportInstruction<T>[],
    withoutViewports: boolean = false,
  ): {
    found: ViewportInstruction<T>[];
    remaining: ViewportInstruction<T>[];
  } {
    const found: ViewportInstruction<T>[] = [];
    const remaining: ViewportInstruction<T>[] = [];

    while (instructions.length) {
      if (instructions[0].scope === null) {
        instructions[0].scope = this.rootScope!.scope;
      }
      const scope: Scope<T> = instructions[0].scope!;
      const { foundViewports, remainingInstructions } = scope.findViewports(instructions.filter(instruction => instruction.scope === scope), alreadyFound, withoutViewports);
      found.push(...foundViewports);
      remaining.push(...remainingInstructions);
      instructions = instructions.filter(instruction => instruction.scope !== scope);
    }
    return { found: found.slice(), remaining };
  }

  private async cancelNavigation(
    updatedScopeOwners: IScopeOwner<T>[],
    qInstruction: QueueItem<INavigatorInstruction<T>>,
  ): Promise<void> {
    // TODO: Take care of disabling viewports when cancelling and stateful!
    updatedScopeOwners.forEach((viewport) => {
      viewport.abortContentChange().catch(error => { throw error; });
    });
    await this.navigator.cancel(qInstruction as INavigatorInstruction<T>);
    this.processingNavigation = null;
    (qInstruction.resolve as ((value: void | PromiseLike<void>) => void))();
  }

  private ensureRootScope(): ViewportScope<T> {
    if (!this.rootScope) {
      const root = this.container.get(Aurelia).root;
      // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
      this.rootScope = new ViewportScope<T>('rootScope', this, root.config.host as T, null, true, root.config.component as CustomElementType);
    }
    return this.rootScope;
  }

  private async replacePaths(instruction: INavigatorInstruction<T>): Promise<void> {
    (this.rootScope as ViewportScope<T>).scope.reparentViewportInstructions();
    let instructions: ViewportInstruction<T>[] = (this.rootScope as ViewportScope<T>).scope.hoistedChildren
      .filter(scope => scope.viewportInstruction !== null && !scope.viewportInstruction.isEmpty())
      .map(scope => scope.viewportInstruction) as ViewportInstruction<T>[];
    instructions = this.instructionResolver.cloneViewportInstructions(instructions, true);

    // The following makes sure right viewport/viewport scopes are set and update
    // whether viewport name is necessary or not
    const alreadyFound: ViewportInstruction<T>[] = [];
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
      state = this.instructionResolver.stringifyViewportInstructions(state, false, true);
    }
    // Invoke again with string
    state = await this.hookManager.invokeTransformToUrl(state, instruction);

    const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
    // if (instruction.path === void 0 || instruction.path.length === 0 || instruction.path === '/') {
    instruction.path = state + query;
    // }

    const fullViewportStates = [this.createViewportInstruction(this.instructionResolver.clearViewportInstruction)];
    fullViewportStates.push(...this.instructionResolver.cloneViewportInstructions(instructions, this.statefulHistory));
    instruction.fullStateInstruction = fullViewportStates;

    // TODO: Fetch and update title

    return Promise.resolve();
  }

  private async freeComponents(
    instruction: ViewportInstruction<T>,
    excludeComponents: IRouteableComponent<T>[],
    alreadyDone: IRouteableComponent<T>[],
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

  private getContainer(viewModelOrContainer: ICustomElementViewModel | IContainer): IContainer | null {
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
}
