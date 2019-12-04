// tslint:disable:max-line-length
// tslint:disable:comment-format
import { DI, IContainer, Key, Reporter, Registration, Metadata } from '@aurelia/kernel';
import { Aurelia, IController, IRenderContext, IViewModel, CustomElement, INode, DOM, Controller } from '@aurelia/runtime';
import { BrowserNavigator } from './browser-navigator';
import { InstructionResolver, IRouteSeparators } from './instruction-resolver';
import { INavigatorInstruction, IRouteableComponent, NavigationInstruction, IRoute, ComponentAppellation, ViewportHandle, ComponentParameters } from './interfaces';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { INavigatorEntry, INavigatorFlags, INavigatorOptions, INavigatorViewerEvent, IStoredNavigatorEntry, Navigator } from './navigator';
import { QueueItem } from './queue';
import { INavClasses } from './resources/nav';
import { NavigationInstructionResolver, IViewportInstructionsOptions } from './type-resolvers';
import { arrayRemove } from './utils';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { FoundRoute } from './found-route';
import { HookManager, IHookDefinition, HookIdentity, HookFunction, IHookOptions, BeforeNavigationHookFunction, TransformFromUrlHookFunction, TransformToUrlHookFunction } from './hook-manager';
import { Scope, IScopeOwner } from './scope';
import { CustomElementType } from '@aurelia/runtime';
import { IViewportScopeOptions, ViewportScope } from './viewport-scope';

export interface IGotoOptions {
  title?: string;
  query?: string;
  data?: Record<string, unknown>;
  replace?: boolean;
  append?: boolean;
  origin?: IViewModel | Element;
}

export interface IRouterOptions extends INavigatorOptions {
  separators?: IRouteSeparators;
  useUrlFragmentHash?: boolean;
  useHref?: boolean;
  statefulHistoryLength?: number;
  useDirectRoutes?: boolean;
  useConfiguredRoutes?: boolean;
  hooks?: IHookDefinition[];
  reportCallback?(instruction: INavigatorInstruction): void;
}

export interface IRouter {
  readonly isNavigating: boolean;
  activeComponents: ViewportInstruction[];
  readonly rootScope: ViewportScope | null;
  readonly activeRoute?: IRoute;
  readonly container: IContainer;
  readonly instructionResolver: InstructionResolver;
  navigator: Navigator;
  readonly navigation: BrowserNavigator;
  readonly hookManager: HookManager;
  readonly linkHandler: LinkHandler;
  readonly navs: Readonly<Record<string, Nav>>;
  readonly options: IRouterOptions;

  readonly statefulHistory: boolean;
  activate(options?: IRouterOptions): void;
  loadUrl(): Promise<void>;
  deactivate(): void;

  linkCallback(info: AnchorEventInfo): void;

  processNavigations(qInstruction: QueueItem<INavigatorInstruction>): Promise<void>;

  // tslint:disable-next-line:comment-format
  // External API to get viewport by name
  getViewport(name: string): Viewport | null;

  // // Called from the viewport custom element in created()
  // setClosestViewport(viewModel: IViewModel): void;
  // getClosestViewport(viewModelOrElement: IViewModel | Element): Viewport | null;

  // Called from the viewport scope custom element
  setClosestScope(viewModelOrContainer: IViewModel | IContainer, scope: Scope): void;
  getClosestScope(viewModelOrElement: IViewModel | Element | IController | IContainer): Scope | null;
  unsetClosestScope(viewModelOrContainer: IViewModel | IContainer): void;

  // Called from the viewport custom element in attached()
  connectViewport(viewModel: IViewModel, container: IContainer, name: string, element: Element, context: IRenderContext | null, /* parent: ViewportScope | null, */ options?: IViewportOptions): Viewport;
  // Called from the viewport custom element
  disconnectViewport(viewModel: IViewModel, container: IContainer, viewport: Viewport, element: Element | null, context: IRenderContext | null): void;
  // // Called from the viewport scope custom element in attached()
  connectViewportScope(name: string, viewModel: IViewModel, container: IContainer, element: Element, options?: IViewportScopeOptions): ViewportScope;
  // // Called from the viewport scope custom element
  disconnectViewportScope(viewModel: IViewModel, container: IContainer, viewportScope: ViewportScope): void;


  allViewports(includeDisabled?: boolean): Viewport[];
  findScope(elementOrViewmodelOrviewport: Element | IViewModel | Viewport | IController | null): Scope;

  goto(instructions: NavigationInstruction | NavigationInstruction[], options?: IGotoOptions): Promise<void>;
  refresh(): Promise<void>;
  back(): Promise<void>;
  forward(): Promise<void>;

  checkActive(instructions: ViewportInstruction[]): boolean;

  setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  updateNav(name?: string): void;
  findNav(name: string): Nav;
  // closestViewport(elementOrViewModel: Element | IViewModel): Viewport | null;

  addRoutes(routes: IRoute[], context?: IViewModel | Element): IRoute[];
  removeRoutes(routes: IRoute[] | string[], context?: IViewModel | Element): void;
  addHooks(hooks: IHookDefinition[]): HookIdentity[];

  addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IHookOptions): HookIdentity;
  addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IHookOptions): HookIdentity;
  addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IHookOptions): HookIdentity;
  addHook(hook: HookFunction, options: IHookOptions): HookIdentity;
  removeHooks(hooks: HookIdentity[]): void;

  createViewportInstruction(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null): ViewportInstruction;
}

class ClosestViewportCustomElement { }
class ClosestScope { }

export const IRouter = DI.createInterface<IRouter>('IRouter').withDefault(x => x.singleton(Router));

export class Router implements IRouter {
  public static readonly inject: readonly Key[] = [IContainer, Navigator, BrowserNavigator, LinkHandler, InstructionResolver];

  public rootScope: ViewportScope | null = null;

  public hookManager: HookManager;

  public navs: Record<string, Nav> = {};
  public activeComponents: ViewportInstruction[] = [];
  public activeRoute?: IRoute;

  public appendedInstructions: ViewportInstruction[] = [];

  public options: IRouterOptions = {
    useHref: true,
    statefulHistoryLength: 0,
    useDirectRoutes: true,
    useConfiguredRoutes: true,
  };
  private isActive: boolean = false;
  private loadedFirst: boolean = false;

  private processingNavigation: INavigatorInstruction | null = null;
  private lastNavigation: INavigatorInstruction | null = null;
  private staleChecks: Record<string, ViewportInstruction[]> = {};

  public constructor(
    public readonly container: IContainer,
    public navigator: Navigator,
    public navigation: BrowserNavigator,
    public linkHandler: LinkHandler,
    public instructionResolver: InstructionResolver
  ) {
    this.hookManager = new HookManager();
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
      ...this.options,
      ...options
    };
    if (this.options.hooks !== void 0) {
      this.addHooks(this.options.hooks);
    }

    this.instructionResolver.activate({ separators: this.options.separators });
    this.navigator.activate(this, {
      callback: this.navigatorCallback,
      store: this.navigation,
      statefulHistoryLength: this.options.statefulHistoryLength,
      serializeCallback: this.statefulHistory ? this.navigatorSerializeCallback : void 0,
    });
    this.linkHandler.activate({ callback: this.linkCallback, useHref: this.options.useHref });
    this.navigation.activate({
      callback: this.browserNavigatorCallback,
      useUrlFragmentHash: this.options.useUrlFragmentHash
    });
    this.ensureRootScope();
  }

  public loadUrl(): Promise<void> {
    const entry: INavigatorEntry = {
      ...this.navigation.viewerState,
      ...{
        fullStateInstruction: '',
        replacing: true,
        fromBrowser: false,
      }
    };
    const result = this.navigator.navigate(entry);
    this.loadedFirst = true;
    return result;
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Router has not been activated');
    }
    this.linkHandler.deactivate();
    this.navigator.deactivate();
    this.navigation.deactivate();
  }

  public linkCallback = (info: AnchorEventInfo): void => {
    let instruction = info.instruction || '';
    if (typeof instruction === 'string' && instruction.startsWith('#')) {
      instruction = instruction.slice(1);
      // '#' === '/' === '#/'
      if (!instruction.startsWith('/')) {
        instruction = `/${instruction}`;
      }
    }
    // Adds to Navigator's Queue, which makes sure it's serial
    this.goto(instruction, { origin: info.anchor! }).catch(error => { throw error; });
  };

  public navigatorCallback = (instruction: INavigatorInstruction): void => {
    // Instructions extracted from queue, one at a time
    this.processNavigations(instruction).catch(error => { throw error; });
  };
  public navigatorSerializeCallback = async (entry: IStoredNavigatorEntry, preservedEntries: IStoredNavigatorEntry[]): Promise<IStoredNavigatorEntry> => {
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
    ) as IRouteableComponent[];

    const serialized: IStoredNavigatorEntry = { ...entry };
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

    const alreadyDone: IRouteableComponent[] = [];
    for (const instruction of instructions) {
      await this.freeComponents(instruction, excludeComponents, alreadyDone);
    }
    return serialized;
  };

  public browserNavigatorCallback = (browserNavigationEvent: INavigatorViewerEvent): void => {
    const entry: INavigatorEntry = (browserNavigationEvent.state && browserNavigationEvent.state.currentEntry
      ? browserNavigationEvent.state.currentEntry as INavigatorEntry
      : { instruction: '', fullStateInstruction: '' });
    entry.instruction = browserNavigationEvent.instruction;
    entry.fromBrowser = true;
    this.navigator.navigate(entry).catch(error => { throw error; });
  };

  public processNavigations = async (qInstruction: QueueItem<INavigatorInstruction>): Promise<void> => {
    const instruction: INavigatorInstruction = this.processingNavigation = qInstruction as INavigatorInstruction;

    if (this.options.reportCallback) {
      this.options.reportCallback(instruction);
    }
    let fullStateInstruction: boolean = false;
    const instructionNavigation: INavigatorFlags = instruction.navigation as INavigatorFlags;
    if ((instructionNavigation.back || instructionNavigation.forward) && instruction.fullStateInstruction) {
      fullStateInstruction = true;
      // if (!confirm('Perform history navigation?')) { this.navigator.cancel(instruction); this.processingNavigation = null;
      //   return Promise.resolve(); }
    }
    let clearUsedViewports: boolean = fullStateInstruction;
    let configuredRoute = await this.findInstructions(
      this.rootScope!.scope,
      instruction.instruction,
      instruction.scope || this.rootScope!.scope,
      !fullStateInstruction);
    let instructions = configuredRoute.instructions;
    let configuredRoutePath: string | null = null;

    if (instruction.instruction.length > 0
      && !configuredRoute.foundConfiguration
      && !configuredRoute.foundInstructions) {
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

    if (instructions.some(instr => this.instructionResolver.isClearAllViewportsInstruction(instr))) {
      clearUsedViewports = true;
      instructions = instructions.filter(instr => !this.instructionResolver.isClearAllViewportsInstruction(instr));
    }

    // TODO: Fetch title (probably when done)

    let clearViewports = (clearUsedViewports ? this.allViewports().filter((value) => value.content.componentInstance !== null) : []);
    // const doneDefaultViewports: Viewport[] = [];
    // let defaultViewports = this.allViewports().filter(viewport =>
    //   viewport.options.default
    //   && viewport.content.componentInstance === null
    //   && doneDefaultViewports.every(done => done !== viewport)
    // );
    const updatedViewports: Viewport[] = [];
    const alreadyFoundInstructions: ViewportInstruction[] = [];
    // TODO: Take care of cancellations down in subsets/iterations
    let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
    let guard = 100;
    while (viewportInstructions.length || remainingInstructions.length /*|| defaultViewports.length*/ || clearUsedViewports) {
      // Guard against endless loop
      if (!guard--) {
        console.log('remainingInstructions', remainingInstructions);
        throw Reporter.error(2002);
      }
      // defaultViewports = [];
      const changedViewports: Viewport[] = [];

      const hooked = await this.hookManager.invokeBeforeNavigation(viewportInstructions, instruction);
      if (hooked === false) {
        return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
      } else {
        viewportInstructions = hooked as ViewportInstruction[];
      }

      for (const viewportInstruction of viewportInstructions) {
        const scopeOwner: IScopeOwner | null = viewportInstruction.owner;
        if (scopeOwner !== null) {
          scopeOwner.path = configuredRoutePath;
          if (scopeOwner.setNextContent(viewportInstruction, instruction) && scopeOwner.isViewport) {
            changedViewports.push(scopeOwner as Viewport);
          }
          arrayRemove(clearViewports, value => value === scopeOwner);
        }
        // const viewport: Viewport = viewportInstruction.viewport as Viewport;
        // // Manual viewport scopes don't have viewports
        // if (viewport !== null) {
        //   viewport.path = configuredRoutePath;
        //   if (viewport.setNextContent(viewportInstruction, instruction)) {
        //     changedViewports.push(viewport);
        //   }
        //   arrayRemove(clearViewports, value => value === viewport);
        // }
      }
      let results = await Promise.all(changedViewports.map((value) => value.canLeave()));
      if (results.some(result => result === false)) {
        return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
      }
      results = await Promise.all(changedViewports.map(async (value) => {
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
        return this.cancelNavigation([...changedViewports, ...updatedViewports], qInstruction);
      }
      for (const viewport of changedViewports) {
        if (updatedViewports.every(value => value !== viewport)) {
          updatedViewports.push(viewport);
        }
      }

      // TODO: Fix multi level recursiveness!
      alreadyFoundInstructions.push(...viewportInstructions);
      ({ found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(remainingInstructions, alreadyFoundInstructions));
      // const remaining = this.findViewports(remainingInstructions, alreadyFoundInstructions);
      // viewportInstructions = remaining.found.slice();
      // remainingInstructions = remaining.remaining;

      // Look for configured child routes (once we've loaded everything so far?)
      if (configuredRoute.hasRemaining &&
        viewportInstructions.length === 0 &&
        remainingInstructions.length === 0) {
        let configured = new FoundRoute();
        // const routeViewportScopes: ViewportScope[] = alreadyFoundInstructions
        //   .filter(instr => instr.viewport === null || instr.viewport.path === configuredRoutePath)
        //   .map(instr => instr.scope)
        //   .filter((value, index, arr) => arr.indexOf(value) === index) as ViewportScope[];
        // for (const viewportScope of routeViewportScopes) {
        //   configured = await this.findInstructions(
        //     viewportScope,
        //     configuredRoute.remaining,
        //     viewportScope);
        //   if (configured.foundConfiguration) {
        //     break;
        //   }
        // }
        // const routeScopeOwners: IScopeOwner[] = alreadyFoundInstructions.getScopeOwners(configuredRoutePath);
        const routeScopeOwners: IScopeOwner[] = alreadyFoundInstructions
          .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
          .map(instr => instr.owner)
          .filter((value, index, arr) => arr.indexOf(value) === index) as IScopeOwner[];
        for (const owner of routeScopeOwners) {
          configured = await this.findInstructions(
            owner.scope,
            configuredRoute.remaining,
            owner.scope);
          if (configured.foundConfiguration) {
            break;
          }
        }
        // const routeViewports: Viewport[] = alreadyFoundInstructions
        //   .filter(instr => instr.viewport !== null && instr.viewport.path === configuredRoutePath)
        //   .map(instr => instr.viewport)
        //   .filter((value, index, arr) => arr.indexOf(value) === index) as Viewport[];
        // for (const viewport of routeViewports) {
        //   configured = await this.findInstructions(
        //     viewport.scope,
        //     configuredRoute.remaining,
        //     viewport.scope || viewport.owningScope!);
        //   if (configured.foundConfiguration) {
        //     break;
        //   }
        // }
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
      let appendedInstructions: ViewportInstruction[] = this.appendedInstructions.filter(instruction => !instruction.default);
      this.appendedInstructions = this.appendedInstructions.filter(instruction => instruction.default);
      if (appendedInstructions.length === 0) {
        const index: number = this.appendedInstructions.findIndex(instruction => instruction.default);
        if (index >= 0) {
          appendedInstructions = this.appendedInstructions.splice(index, 1);
        }
      }
      while (appendedInstructions.length > 0) {
        const appendedInstruction: ViewportInstruction = appendedInstructions.shift() as ViewportInstruction;
        const existingAlreadyFound: boolean = alreadyFoundInstructions.some(instruction => instruction.sameViewport(appendedInstruction));
        const existingFound: ViewportInstruction | undefined = viewportInstructions.find(value => value.sameViewport(appendedInstruction));
        const existingRemaining: ViewportInstruction | undefined = remainingInstructions.find(value => value.sameViewport(appendedInstruction));
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
      // clearViewports is empty if we're not clearing viewports
      if (viewportInstructions.length === 0 &&
        remainingInstructions.length === 0 /* &&
        defaultViewports.length === 0*/) {
        viewportInstructions = [
          ...viewportInstructions,
          ...clearViewports.map(viewport => this.createViewportInstruction(this.instructionResolver.clearViewportInstruction, viewport))
        ];
        clearViewports = [];
      }
      // TODO: Do we still need this? What if no viewport at all?
      // if (!this.allViewports().length) { viewportsRemaining = false; }
      clearUsedViewports = false;
    }

    await Promise.all(updatedViewports.map((value) => value.loadContent()));
    await this.replacePaths(instruction);
    // this.updateNav();

    // Remove history entry if no history viewports updated
    if (instructionNavigation.new && !instructionNavigation.first && !instruction.repeating && updatedViewports.every(viewport => viewport.options.noHistory)) {
      instruction.untracked = true;
    }

    updatedViewports.forEach((viewport) => {
      viewport.finalizeContentChange();
    });
    this.lastNavigation = this.processingNavigation;
    if (this.lastNavigation.repeating) {
      this.lastNavigation.repeating = false;
    }
    this.processingNavigation = null;
    await this.navigator.finalize(instruction);
  };

  public findScope(origin: Element | IViewModel | Viewport | Scope | IController | null): Scope {
    // this.ensureRootScope();
    if (origin === void 0 || origin === null) {
      return this.rootScope!.scope;
    }
    if (origin instanceof Scope || origin instanceof Viewport) {
      return origin.scope;
    }
    return this.getClosestScope(origin) || this.rootScope!.scope;
    // const viewport: Viewport | null = this.getClosestViewport(origin);

    // if (viewport !== null) {
    //   return viewport.scope;
    // }
    // return this.rootScope!;
  }
  public findParentScope(container: IContainer | null): Scope {
    // if (viewModel === void 0 || viewModel === null) {
    //   return this.rootScope!.scope;
    // }
    // // Gets the container on the view model
    // let container: IContainer | null = this.getClosestContainer(viewModel);
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

  // // Called from the viewport custom element
  // public setClosestViewport(viewModel: IViewModel): void {
  //   const container = viewModel.$controller!.context!.get(IContainer);
  //   Registration.instance(ClosestViewportCustomElement, viewModel).register(container);
  // }
  // public getClosestViewport(viewModelOrElement: IViewModel | Element): Viewport | null {
  //   const container = this.getClosestContainer(viewModelOrElement);
  //   if (container === null) {
  //     return null;
  //   }
  //   if (!container.has(ClosestViewportCustomElement, true)) {
  //     return null;
  //   }
  //   const viewportCE = container.get<IViewModel>(ClosestViewportCustomElement) as IViewModel & { viewport: Viewport };
  //   if (viewportCE === void 0) {
  //     return null;
  //   }
  //   return viewportCE.viewport || null;
  // }
  // Called from the viewport scope custom element in created()
  public setClosestScope(viewModelOrContainer: IViewModel | IContainer, scope: Scope): void {
    const container: IContainer | null = '$controller' in viewModelOrContainer
      ? (viewModelOrContainer as IViewModel).$controller!.context!.get(IContainer)
      : viewModelOrContainer as IContainer;
    Registration.instance(ClosestScope, scope).register(container!);
  }
  public getClosestScope(viewModelOrElement: IViewModel | Element | IController | IContainer): Scope | null {
    const container: IContainer | null = 'resourceResolvers' in viewModelOrElement
      ? viewModelOrElement as IContainer
      : this.getClosestContainer(viewModelOrElement as IViewModel | Element | IController);
    if (container === null) {
      return null;
    }
    if (!container.has(ClosestScope, true)) {
      return null;
    }
    return container.get<Scope>(ClosestScope) || null;
  }
  public unsetClosestScope(viewModelOrContainer: IViewModel | IContainer): void {
    const container: IContainer | null = '$controller' in viewModelOrContainer
      ? (viewModelOrContainer as IViewModel).$controller!.context!.get(IContainer)
      : viewModelOrContainer as IContainer;
    (container as any).resolvers.delete(ClosestScope);
  }

  // Called from the viewport custom element in attached()
  public connectViewport(viewModel: IViewModel, container: IContainer, name: string, element: Element, context: IRenderContext | null = null, /* parent: ViewportScope | null, */ options?: IViewportOptions): Viewport {
    // console.log('Viewport container', this.getClosestContainer(viewModel));
    // const parentScope: Scope = this.ensureRootScope().scope; // this.findParentScope(viewModel);
    const parentScope: Scope = this.findParentScope(container);
    // console.log('>>> connectViewport', name, container, parentScope);
    const viewport: Viewport = parentScope.addViewport(name, element, context, options);
    this.setClosestScope(container, viewport.connectedScope);
    // this.setClosestScope(viewModel, viewport.connectedScope);
    // viewport.connectedScope.reparent(viewModel);
    return viewport;
  }
  // Called from the viewport custom element
  public disconnectViewport(viewModel: IViewModel, container: IContainer, viewport: Viewport, element: Element | null, context: IRenderContext | null): void {
    if (!viewport.owningScope!.removeViewport(viewport, element, context)) {
      throw new Error(`Failed to remove viewport: ${viewport.name}`);
    }
    // this.unsetClosestScope(viewModel);
    this.unsetClosestScope(container);
  }
  // Called from the viewport scope custom element in attached()
  public connectViewportScope(name: string, viewModel: IViewModel, container: IContainer, element: Element, options?: IViewportScopeOptions): ViewportScope {
    // console.log('ViewportScope container', this.getClosestContainer(viewModel));
    // const parentScope: Scope = this.ensureRootScope().scope; // this.findParentScope(viewModel);
    const parentScope: Scope = this.findParentScope(container);
    // console.log('>>> connectViewportScope container', container, parentScope);
    const viewportScope: ViewportScope = parentScope.addViewportScope(name, element, options);
    this.setClosestScope(container, viewportScope.connectedScope);
    // this.setClosestScope(viewModel, viewportScope.connectedScope);
    // viewportScope.connectedScope.reparent(viewModel);
    return viewportScope;
  }
  // Called from the viewport scope custom element
  public disconnectViewportScope(viewModel: IViewModel, container: IContainer, viewportScope: ViewportScope): void {
    if (!viewportScope.owningScope!.removeViewportScope(viewportScope)) {
      throw new Error(`Failed to remove viewport scope: ${viewportScope.path}`);
    }
    // this.unsetClosestScope(viewModel);
    this.unsetClosestScope(container);
  }

  public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
    // this.ensureRootScope();
    return (this.rootScope as ViewportScope).scope.allViewports(includeDisabled, includeReplaced);
  }

  public goto(instructions: NavigationInstruction | NavigationInstruction[], options?: IGotoOptions): Promise<void> {
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

    // if (/* typeof instructions !== 'string' || */ instructions !== this.instructionResolver.clearViewportInstruction) {
    //   if (options.origin) {
    //     scope = this.findScope(options.origin);
    //     if (typeof instructions === 'string') {
    //       // If it's not from scope root, figure out which scope
    //       if (!instructions.startsWith('/')) {
    //         // Scope modifications
    //         if (instructions.startsWith('.')) {
    //           // The same as no scope modification
    //           if (instructions.startsWith('./')) {
    //             instructions = instructions.slice(2);
    //           }
    //           // Find out how many scopes upwards we should move
    //           while (instructions.startsWith('../')) {
    //             scope = scope.parent || scope;
    //             instructions = instructions.slice(3);
    //           }
    //         }
    //         if (scope.path !== null) {
    //           instructions = `${scope.path}/${instructions}`;
    //           scope = this.rootScope!.scope;
    //         }
    //       } else { // Specified root scope with /
    //         scope = this.rootScope!.scope;
    //       }
    //     } else {
    //       instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
    //       for (const instruction of instructions as ViewportInstruction[]) {
    //         if (instruction.scope === null) {
    //           instruction.scope = scope;
    //         }
    //       }
    //     }
    //   }
    // } else {
    //   instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
    // }

    // const scope: Scope | null = options.origin !== void 0 && options.origin !== null
    //   ? this.findScope(options.origin)
    //   : null;

    if (options.append && this.processingNavigation) {
      instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
      this.appendInstructions(instructions as ViewportInstruction[], scope);
      // Can't return current navigation promise since it can lead to deadlock in enter
      return Promise.resolve();
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

  public checkActive(instructions: ViewportInstruction[]): boolean {
    for (const instruction of instructions) {
      const scopeInstructions: ViewportInstruction[] = this.instructionResolver.matchScope(this.activeComponents, instruction.scope!);
      const matching: ViewportInstruction[] = scopeInstructions.filter(instr => instr.sameComponent(instruction));
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

  /**
   * Finds the closest ancestor viewport. The provided element, view model or controller
   * is NOT a valid ancestor.
   *
   * @param elementOrViewModelOrController - The element, view model or controller to search upward from.
   * @returns The Viewport that is the closest ancestor.
   */
  // public closestViewport(elementOrViewModelOrController: Element | IViewModel | IController): Viewport | null {
  //   let element: INode | undefined;
  //   if ('$controller' in elementOrViewModelOrController) {
  //     let controller: IController | undefined = elementOrViewModelOrController.$controller;
  //     while (controller !== void 0 && controller.host === void 0) {
  //       controller = controller.parent;
  //     }
  //     if (controller !== void 0) {
  //       element = controller.host;
  //     }
  //   } else {
  //     element = elementOrViewModelOrController;
  //   }
  //   if (element === void 0) {
  //     return null;
  //   }
  //   const controller: IController | undefined = CustomElement.for(element, 'au-viewport', true);
  //   if (controller !== void 0 && controller.viewModel !== void 0) {
  //     return (controller.viewModel as IViewModel & { viewport: Viewport }).viewport;
  //   }
  //   return null;
  //   // // let el: Element & { $viewport?: Viewport } | IViewModel | null = elementOrViewModelOrController;
  //   // // TODO: This might still be necessary. Find out!
  //   // // let $viewport: Viewport | undefined = el.$viewport;
  //   // // while (!$viewport && el.parentElement) {
  //   // //   el = el.parentElement;
  //   // //   $viewport = el.$viewport;
  //   // // }
  //   // // // TODO: Always also check controllers and return the closest one
  //   // // if (el.$viewport) {
  //   // //   return el.$viewport;
  //   // // }
  //   // // Fred's change:
  //   // // el = element;
  //   // // let controller = CustomElement.for(el);
  //   // // while (!controller && el.parentElement) {
  //   // //   el = el.parentElement;
  //   // //   CustomElement.for(el);
  //   // // }

  //   // // if ((elementOrViewModelOrController as IViewModel).$controller !== void 0) {
  //   // //   elementOrViewModelOrController = (elementOrViewModelOrController as IViewModel).$controller;
  //   // // }
  //   // // const element: HTMLElement = elementOrViewModelOrController instanceof Controller
  //   // //   ? elementOrViewModelOrController.host
  //   // //   : elementOrViewModelOrController;
  //   // // const controller: IController<HTMLElement> | undefined = CustomElement.for(element, 'au-viewport', true);
  //   // // return controller !== void 0 && controller.viewModel !== void 0
  //   // //   ? (controller.viewModel as IViewModel & { viewport: Viewport }).viewport : null;

  //   // let controller: any = elementOrViewModelOrController instanceof Controller ? elementOrViewModelOrController : closestController(elementOrViewModelOrController);
  //   // // Make sure we don't include the provided element, view model or controller
  //   // if (controller) {
  //   //   controller = controller.parent;
  //   // }
  //   // while (controller && !controller.host) {
  //   //   controller = controller.parent;
  //   // }
  //   // if (controller !== void 0 && controller.host !== void 0) {
  //   //   controller = CustomElement.for(controller.host, 'au-viewport', true);
  //   //   if (controller !== void 0) {
  //   //     return controller.viewModel.viewport;
  //   //   }
  //   // }
  //   // // while (controller) {
  //   // //   if (controller.host && controller.host.$au && controller.host.$au['au-viewport'] && controller.host.$au['au-viewport'].viewModel && controller.host.$au['au-viewport'].viewModel.viewport) {
  //   // //     return controller.host.$au['au-viewport'].viewModel.viewport;
  //   // //   }
  //   // //   // if (controller.host) {
  //   // //   //   const viewport = this.allViewports().find((item) => item.element === controller!.host);
  //   // //   //   if (viewport) {
  //   // //   //     return viewport;
  //   // //   //   }
  //   // //   // }
  //   // //   controller = controller.parent;
  //   // // }
  //   // return null;
  // }

  public addRoutes(routes: IRoute[], context?: IViewModel | Element): IRoute[] {
    // TODO: This should add to the context instead
    // TODO: Add routes without context to rootScope content (which needs to be created)?
    return [];
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.addRoutes(routes);
  }
  public removeRoutes(routes: IRoute[] | string[], context?: IViewModel | Element): void {
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

  public createViewportInstruction(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope: boolean = true, nextScopeInstructions: ViewportInstruction[] | null = null): ViewportInstruction {
    return this.instructionResolver.createViewportInstruction(component, viewport, parameters, ownsScope, nextScopeInstructions);
  }

  private async findInstructions(scope: Scope, instruction: string | ViewportInstruction[], instructionScope: Scope, transformUrl: boolean = false): Promise<FoundRoute> {
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
    const staleCheck: ViewportInstruction[] | undefined = this.staleChecks[name];
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

  private findViewports(instructions: ViewportInstruction[], alreadyFound: ViewportInstruction[], withoutViewports: boolean = false): { found: ViewportInstruction[]; remaining: ViewportInstruction[] } {
    const found: ViewportInstruction[] = [];
    const remaining: ViewportInstruction[] = [];

    while (instructions.length) {
      if (instructions[0].scope === null) {
        instructions[0].scope = this.rootScope!.scope;
      }
      const scope: Scope = instructions[0].scope!;
      // Start with non-defaults
      let { foundViewports, remainingInstructions } = scope.findViewports(instructions.filter(instruction => instruction.scope === scope /* && instruction.default */), alreadyFound, withoutViewports);
      found.push(...foundViewports);
      remaining.push(...remainingInstructions);
      // And then defaults
      // ({ foundViewports, remainingInstructions } = scope.findViewports(instructions.filter(instruction => instruction.scope === scope && !instruction.default), alreadyFound, withoutViewports));
      // found.push(...foundViewports);
      // remaining.push(...remainingInstructions);
      instructions = instructions.filter(instruction => instruction.scope !== scope);
    }
    return { found: found.slice(), remaining };
  }

  private async cancelNavigation(updatedViewports: Viewport[], qInstruction: QueueItem<INavigatorInstruction>): Promise<void> {
    // TODO: Take care of disabling viewports when cancelling and stateful!
    updatedViewports.forEach((viewport) => {
      viewport.abortContentChange().catch(error => { throw error; });
    });
    await this.navigator.cancel(qInstruction as INavigatorInstruction);
    this.processingNavigation = null;
    (qInstruction.resolve as ((value: void | PromiseLike<void>) => void))();
  }

  private ensureRootScope(): ViewportScope {
    if (!this.rootScope) {
      const root = this.container.get(Aurelia).root;
      // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
      this.rootScope = new ViewportScope('rootScope', this, root.config.host as Element, null, true, root.config.component as CustomElementType);
    }
    return this.rootScope;
  }

  private async replacePaths(instruction: INavigatorInstruction): Promise<void> {
    (this.rootScope as ViewportScope).scope.reparentViewportInstructions();
    let instructions: ViewportInstruction[] = (this.rootScope as ViewportScope).scope.hoistedChildren
      .filter(scope => scope.viewportInstruction !== null && !scope.viewportInstruction.isEmpty())
      .map(scope => scope.viewportInstruction) as ViewportInstruction[];
    // const viewports: Viewport[] = (this.rootScope as ViewportScope).enabledViewports.filter(viewport => !viewport.content.content.isEmpty());
    // let instructions = viewports.map(viewport => viewport.content.content);
    // TODO: Check if this is really necessary
    instructions = this.instructionResolver.cloneViewportInstructions(instructions, true);

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
    let state: string | ViewportInstruction[] = await this.hookManager.invokeTransformToUrl(instructions, instruction);
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
    return Promise.resolve();
  }

  private async freeComponents(instruction: ViewportInstruction, excludeComponents: IRouteableComponent[], alreadyDone: IRouteableComponent[]): Promise<void> {
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

  private getClosestContainer(viewModelOrElement: IViewModel | Element | IController): IContainer | null {
    let context;
    if ('context' in viewModelOrElement) {
      context = viewModelOrElement.context;
    } else {
      const viewModel: IViewModel | undefined = '$controller' in viewModelOrElement
        ? viewModelOrElement
        : this.CustomElementFor(viewModelOrElement); // CustomElement.for(viewModelOrElement, true)

      if (viewModel === void 0) {
        return null;
      }
      context = (viewModel as IViewModel & { context: IRenderContext }).context !== void 0
        ? (viewModel as IViewModel & { context: IRenderContext }).context
        : viewModel.$controller!.context;
    }

    const container = context!.get(IContainer);
    if (container === void 0) {
      return null;
    }
    return container;
  }
  // TODO: This is probably wrong since it caused test fails when in CustomElemnt.for
  // Fred probably knows and will need to look at it
  // This can most likely also be changed so that the node traversal isn't necessary
  private CustomElementFor(node: INode): IController<INode> | undefined {
    let cur: INode | null = node as INode | null;
    while (cur !== null) {
      const nodeResourceName: string = (cur as Element).nodeName.toLowerCase();
      const controller: IController<INode> = Metadata.getOwn(`${CustomElement.name}:${nodeResourceName}`, cur)
        || Metadata.getOwn(CustomElement.name, cur);
      if (controller !== void 0) {
        return controller;
      }
      cur = DOM.getEffectiveParentNode(cur);
    }
    return (void 0);
  }
}
