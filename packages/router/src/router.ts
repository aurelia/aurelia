import { DI, IContainer, Key, Reporter } from '@aurelia/kernel';
import { Aurelia, IController, IRenderContext, IViewModel, Controller } from '@aurelia/runtime';
import { BrowserNavigator } from './browser-navigator';
import { Guardian, GuardTypes } from './guardian';
import { InstructionResolver, IRouteSeparators } from './instruction-resolver';
import { INavigatorInstruction, IRouteableComponent, NavigationInstruction, IRoute } from './interfaces';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { INavigatorEntry, INavigatorFlags, INavigatorOptions, INavigatorViewerEvent, IStoredNavigatorEntry, Navigator } from './navigator';
import { IParsedQuery, parseQuery } from './parser';
import { QueueItem } from './queue';
import { INavClasses } from './resources/nav';
import { RouteTable } from './route-table';
import { NavigationInstructionResolver } from './type-resolvers';
import { arrayRemove, closestController } from './utils';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
import { FoundRoute } from './found-route';

export interface IRouteTransformer {
  transformFromUrl?(route: string, router: IRouter): string | ViewportInstruction[];
  transformToUrl?(instructions: ViewportInstruction[], router: IRouter): string | ViewportInstruction[];

  addRoutes?(router: IRouter, routes: IRoute[], parent?: string): IRoute[];
  removeRoutes?(router: IRouter, routes: IRoute[] | string[]): void;
  findMatchingRoute?(router: IRouter, path: string): { match: IRoute | null; matching: string; remaining: string };
}

export const IRouteTransformer = DI.createInterface<IRouteTransformer>('IRouteTransformer').withDefault(x => x.singleton(RouteTable));

export interface IGotoOptions {
  title?: string;
  query?: string;
  data?: Record<string, unknown>;
  replace?: boolean;
  append?: boolean;
  origin?: IViewModel | Element;
}

export interface IRouterOptions extends INavigatorOptions, IRouteTransformer {
  separators?: IRouteSeparators;
  useUrlFragmentHash?: boolean;
  useHref?: boolean;
  statefulHistoryLength?: number;
  useDirectRoutes?: boolean;
  useConfiguredRoutes?: boolean;
  reportCallback?(instruction: INavigatorInstruction): void;
}

export interface IRouter {
  readonly isNavigating: boolean;
  activeComponents: ViewportInstruction[];
  readonly activeRoute?: IRoute;
  readonly container: IContainer;
  readonly instructionResolver: InstructionResolver;
  navigator: Navigator;
  readonly navigation: BrowserNavigator;
  readonly guardian: Guardian;
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

  // Called from the viewport custom element in attached()
  connectViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport;
  // Called from the viewport custom element
  disconnectViewport(viewport: Viewport, element: Element | null, context: IRenderContext | null): void;

  allViewports(includeDisabled?: boolean): Viewport[];
  findScope(element: Element | null): Viewport;

  goto(instructions: NavigationInstruction | NavigationInstruction[], options?: IGotoOptions): Promise<void>;
  refresh(): Promise<void>;
  back(): Promise<void>;
  forward(): Promise<void>;

  setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  updateNav(name?: string): void;
  findNav(name: string): Nav;
  closestViewport(elementOrViewModel: Element | IViewModel): Viewport | null;

  addRoutes(routes: IRoute[], context?: IViewModel | Element): IRoute[];
  removeRoutes(routes: IRoute[] | string[], context?: IViewModel | Element): void;
}

export const IRouter = DI.createInterface<IRouter>('IRouter').withDefault(x => x.singleton(Router));

export class Router implements IRouter {
  public static readonly inject: readonly Key[] = [IContainer, Navigator, BrowserNavigator, IRouteTransformer, LinkHandler, InstructionResolver];

  public rootScope: Viewport | null = null;

  public guardian: Guardian;

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

  public constructor(
    public readonly container: IContainer,
    public navigator: Navigator,
    public navigation: BrowserNavigator,
    private readonly routeTransformer: IRouteTransformer,
    public linkHandler: LinkHandler,
    public instructionResolver: InstructionResolver
  ) {
    this.guardian = new Guardian();
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
      ...{
        transformFromUrl: this.routeTransformer.transformFromUrl,
        transformToUrl: this.routeTransformer.transformToUrl,
      }, ...options
    };

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
    let configuredRoute = this.findInstructions(
      this.rootScope!,
      instruction.instruction,
      instruction.scope || this.rootScope!,
      this.options.transformFromUrl && !fullStateInstruction);
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
    const parsedQuery: IParsedQuery = parseQuery(instruction.query);
    instruction.parameters = parsedQuery.parameters;
    instruction.parameterList = parsedQuery.list;

    // TODO: Fetch title (probably when done)

    let clearViewports = (clearUsedViewports ? this.allViewports().filter((value) => value.content.componentInstance !== null) : []);
    const doneDefaultViewports: Viewport[] = [];
    let defaultViewports = this.allViewports().filter(viewport =>
      viewport.options.default
      && viewport.content.componentInstance === null
      && doneDefaultViewports.every(done => done !== viewport)
    );
    const updatedViewports: Viewport[] = [];
    const alreadyFoundInstructions: ViewportInstruction[] = [];
    // TODO: Take care of cancellations down in subsets/iterations
    let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
    let guard = 100;
    while (viewportInstructions.length || remainingInstructions.length || defaultViewports.length || clearUsedViewports) {
      // Guard against endless loop
      if (!guard--) {
        throw Reporter.error(2002);
      }
      defaultViewports = [];
      const changedViewports: Viewport[] = [];

      const outcome = this.guardian.passes(GuardTypes.Before, viewportInstructions, instruction);
      if (!outcome) {
        return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
      }
      if (typeof outcome !== 'boolean') {
        viewportInstructions = outcome;
      }
      for (const viewportInstruction of viewportInstructions) {
        const viewport: Viewport = viewportInstruction.viewport as Viewport;
        viewport.path = configuredRoutePath;
        if (viewport.setNextContent(viewportInstruction, instruction)) {
          changedViewports.push(viewport);
        }
        arrayRemove(clearViewports, value => value === viewport);
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
      const remaining = this.findViewports(remainingInstructions, alreadyFoundInstructions);
      viewportInstructions = remaining.found.slice();
      remainingInstructions = remaining.remaining;

      // Look for configured child routes (once we've loaded everything so far?)
      if (configuredRoute.hasRemaining &&
        viewportInstructions.length === 0 &&
        remainingInstructions.length === 0) {
        let configured = new FoundRoute();
        const routeViewports: Viewport[] = alreadyFoundInstructions
          .filter(instr => instr.viewport !== null && instr.viewport.path === configuredRoutePath)
          .map(instr => instr.viewport)
          .filter((value, index, arr) => arr.indexOf(value) === index) as Viewport[];
        for (const viewport of routeViewports) {
          configured = this.findInstructions(
            viewport,
            configuredRoute.remaining,
            viewport.scope || viewport.owningScope!);
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

      while (this.appendedInstructions.length > 0) {
        const appendedInstruction = this.appendedInstructions.shift() as ViewportInstruction;
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
      // clearViewports is empty if we're not clearing viewports
      if (viewportInstructions.length === 0 &&
        remainingInstructions.length === 0 &&
        defaultViewports.length === 0) {
        viewportInstructions = [
          ...viewportInstructions,
          ...clearViewports.map(viewport => new ViewportInstruction(this.instructionResolver.clearViewportInstruction, viewport))
        ];
        clearViewports = [];
      }
      // TODO: Do we still need this? What if no viewport at all?
      // if (!this.allViewports().length) { viewportsRemaining = false; }
      clearUsedViewports = false;
    }

    await Promise.all(updatedViewports.map((value) => value.loadContent()));
    await this.replacePaths(instruction);
    this.updateNav();

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

  public findScope(element: Element): Viewport {
    this.ensureRootScope();
    return this.closestScope(element);
  }

  // External API to get viewport by name
  public getViewport(name: string): Viewport | null {
    return this.allViewports().find(viewport => viewport.name === name) || null;
  }

  // Called from the viewport custom element in attached()
  public connectViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport {
    Reporter.write(10000, 'Viewport added', name, element);
    const parentScope = this.findScope(element);
    const viewport = parentScope.addViewport(name, element, context, options);
    let parent = this.closestViewport(element);
    if (parent === viewport) {
      const controller = closestController(element);
      if (controller !== void 0 && controller.parent !== void 0) {
        parent = this.closestViewport(controller.parent);
      } else {
        parent = null;
      }
    }
    if (parent !== null) {
      parent.addChild(viewport);
    }
    return viewport;
  }
  // Called from the viewport custom element
  public disconnectViewport(viewport: Viewport, element: Element | null, context: IRenderContext | null): void {
    if (!viewport.owningScope!.removeViewport(viewport, element, context)) {
      throw new Error(`Failed to remove viewport: ${viewport.name}`);
    }
  }
  public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
    this.ensureRootScope();
    return (this.rootScope as Viewport).allViewports(includeDisabled, includeReplaced);
  }

  public goto(instructions: NavigationInstruction | NavigationInstruction[], options?: IGotoOptions): Promise<void> {
    options = options || {};
    // TODO: Review query extraction; different pos for path and fragment!
    if (typeof instructions === 'string' && !options.query) {
      const [path, search] = instructions.split('?');
      instructions = path;
      options.query = search;
    }
    let scope: Viewport | null = null;
    if (typeof instructions !== 'string' || instructions !== this.instructionResolver.clearViewportInstruction) {
      if (options.origin) {
        scope = this.closestScope(options.origin);
        if (typeof instructions === 'string') {
          // If it's not from scope root, figure out which scope
          if (!instructions.startsWith('/')) {
            // Scope modifications
            if (instructions.startsWith('.')) {
              // The same as no scope modification
              if (instructions.startsWith('./')) {
                instructions = instructions.slice(2);
              }
              // Find out how many scopes upwards we should move
              while (instructions.startsWith('../')) {
                scope = scope.parent || scope;
                instructions = instructions.slice(3);
              }
            }
            if (scope.path !== null) {
              instructions = `${scope.path}/${instructions}`;
              scope = this.rootScope;
            }
          } else { // Specified root scope with /
            scope = this.rootScope;
          }
        } else {
          instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
          for (const instruction of instructions as ViewportInstruction[]) {
            if (instruction.scope === null) {
              instruction.scope = scope;
            }
          }
        }
      }
      // instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
      // for (const instruction of instructions as ViewportInstruction[]) {
      //   if (instruction.scope === null) {
      //     instruction.scope = scope;
      //   }
      // }
    } else {
      instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
    }

    if (options.append && this.processingNavigation) {
      instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
      this.appendInstructions(instructions as ViewportInstruction[], scope);
      // Can't return current navigation promise since it can lead to deadlock in enter
      return Promise.resolve();
      // } else {
      //   // Can only append after first load has happened (defaults can fire too early)
      //   if (!this.loadedFirst) {
      //     return Promise.resolve();
      //   }
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
  public closestViewport(elementOrViewModelOrController: Element | IViewModel | IController): Viewport | null {
    // let el: Element & { $viewport?: Viewport } | IViewModel | null = elementOrViewModelOrController;
    // TODO: This might still be necessary. Find out!
    // let $viewport: Viewport | undefined = el.$viewport;
    // while (!$viewport && el.parentElement) {
    //   el = el.parentElement;
    //   $viewport = el.$viewport;
    // }
    // // TODO: Always also check controllers and return the closest one
    // if (el.$viewport) {
    //   return el.$viewport;
    // }
    // Fred's change:
    // el = element;
    // let controller = CustomElement.for(el);
    // while (!controller && el.parentElement) {
    //   el = el.parentElement;
    //   CustomElement.for(el);
    // }
    let controller: any = elementOrViewModelOrController instanceof Controller ? elementOrViewModelOrController : closestController(elementOrViewModelOrController);
    // Make sure we don't include the provided element, view model or controller
    if (controller) {
      controller = controller.parent;
    }
    while (controller) {
      if (controller.host && controller.host.$au && controller.host.$au['au-viewport'] && controller.host.$au['au-viewport'].viewModel && controller.host.$au['au-viewport'].viewModel.viewport) {
        return controller.host.$au['au-viewport'].viewModel.viewport;
      }
      // if (controller.host) {
      //   const viewport = this.allViewports().find((item) => item.element === controller!.host);
      //   if (viewport) {
      //     return viewport;
      //   }
      // }
      controller = controller.parent;
    }
    return null;
  }

  public addRoutes(routes: IRoute[], context?: IViewModel | Element): IRoute[] {
    const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    return viewport.addRoutes(routes);
  }
  public removeRoutes(routes: IRoute[] | string[], context?: IViewModel | Element): void {
    const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    return viewport.removeRoutes(routes);
  }

  private findInstructions(scope: Viewport, instruction: string | ViewportInstruction[], instructionScope: Viewport, transformUrl: boolean = false): FoundRoute {
    let route = new FoundRoute();
    if (typeof instruction === 'string') {
      instruction = transformUrl ? this.options.transformFromUrl!(instruction, this) : instruction;
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

  private appendInstructions(instructions: ViewportInstruction[], scope: Viewport | null = null): void {
    if (scope === null) {
      scope = this.rootScope;
    }
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = scope;
      }
    }
    this.appendedInstructions.push(...(instructions as ViewportInstruction[]));
  }

  private unknownRoute(route: string) {
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
        instructions[0].scope = this.rootScope;
      }
      const scope: Viewport = instructions[0].scope!;
      const { foundViewports, remainingInstructions } = scope.findViewports(instructions.filter(instruction => instruction.scope === scope), alreadyFound, withoutViewports);
      found.push(...foundViewports);
      remaining.push(...remainingInstructions);
      instructions = instructions.filter(instruction => instruction.scope !== scope);
    }
    return { found, remaining };
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

  private ensureRootScope(): void {
    if (!this.rootScope) {
      const root = this.container.get(Aurelia).root;
      this.rootScope = new Viewport(this, 'rootScope', root.host as Element, (root.controller as IController).context as IRenderContext, null, true);
    }
  }

  private closestScope(elementOrViewModel: Element | IViewModel): Viewport {
    const viewport = this.closestViewport(elementOrViewModel);
    if (viewport && (viewport.scope || viewport.owningScope)) {
      return viewport.scope || viewport.owningScope!;
    }
    return this.rootScope!;
  }

  private replacePaths(instruction: INavigatorInstruction): Promise<void> {
    (this.rootScope as Viewport).reparentViewportInstructions();
    const viewports: Viewport[] = (this.rootScope as Viewport).children.filter((viewport) => viewport.enabled && !viewport.content.content.isEmpty());
    let instructions = viewports.map(viewport => viewport.content.content);
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

    let state = this.instructionResolver.stringifyViewportInstructions(instructions, false, true);

    if (this.options.transformToUrl) {
      // TODO: Review this. Also, should it perhaps get full state?
      const routeOrInstructions = this.options.transformToUrl(this.instructionResolver.parseViewportInstructions(state), this);
      state = Array.isArray(routeOrInstructions) ? this.instructionResolver.stringifyViewportInstructions(routeOrInstructions) : routeOrInstructions;
    }

    const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
    // if (instruction.path === void 0 || instruction.path.length === 0 || instruction.path === '/') {
      instruction.path = state + query;
    // }

    const fullViewportStates = [new ViewportInstruction(this.instructionResolver.clearViewportInstruction)];
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
}
