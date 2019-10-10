import { DI, IContainer, Key, Reporter } from '@aurelia/kernel';
import { Aurelia, CustomElement, IController, IRenderContext } from '@aurelia/runtime';
import { BrowserNavigator } from './browser-navigator';
import { Guardian, GuardTypes } from './guardian';
import { InstructionResolver, IRouteSeparators } from './instruction-resolver';
import { INavigatorInstruction, IRouteableComponent, NavigationInstruction } from './interfaces';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { INavigatorEntry, INavigatorFlags, INavigatorOptions, INavigatorViewerEvent, IStoredNavigatorEntry, Navigator } from './navigator';
import { IParsedQuery, parseQuery } from './parser';
import { QueueItem } from './queue';
import { INavClasses } from './resources/nav';
import { RouteTable } from './route-table';
import { NavigationInstructionResolver } from './type-resolvers';
import { arrayRemove } from './utils';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IRouteTransformer {
  transformFromUrl?(route: string, router: IRouter): string | ViewportInstruction[];
  transformToUrl?(instructions: ViewportInstruction[], router: IRouter): string | ViewportInstruction[];
}

export const IRouteTransformer = DI.createInterface<IRouteTransformer>('IRouteTransformer').withDefault(x => x.singleton(RouteTable));

export interface IGotoOptions {
  title?: string;
  query?: string;
  data?: Record<string, unknown>;
  replace?: boolean;
  append?: boolean;
  origin?: IRouteableComponent | Element;
}

export interface IRouterOptions extends INavigatorOptions, IRouteTransformer {
  separators?: IRouteSeparators;
  useUrlFragmentHash?: boolean;
  useHref?: boolean;
  statefulHistoryLength?: number;
  reportCallback?(instruction: INavigatorInstruction): void;
}

export interface IRouter {
  readonly isNavigating: boolean;
  activeComponents: ViewportInstruction[];
  readonly container: IContainer;
  readonly instructionResolver: InstructionResolver;
  navigator: Navigator;
  readonly navigation: BrowserNavigator;
  readonly guardian: Guardian;
  readonly navs: Readonly<Record<string, Nav>>;
  readonly options: IRouterOptions;

  readonly statefulHistory: boolean;
  activate(options?: IRouterOptions): void;
  loadUrl(): Promise<void>;
  deactivate(): void;

  linkCallback(info: AnchorEventInfo): void;

  processNavigations(qInstruction: QueueItem<INavigatorInstruction>): Promise<void>;

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
  closestViewport(element: Element): Viewport | null;
}

export const IRouter = DI.createInterface<IRouter>('IRouter').withDefault(x => x.singleton(Router));

export class Router implements IRouter {
  public static readonly inject: readonly Key[] = [IContainer, Navigator, BrowserNavigator, IRouteTransformer, LinkHandler, InstructionResolver];

  public rootScope: Viewport | null = null;

  public guardian: Guardian;

  public navs: Record<string, Nav> = {};
  public activeComponents: ViewportInstruction[] = [];

  public addedViewports: ViewportInstruction[] = [];

  public options: IRouterOptions = {
    useHref: true,
    statefulHistoryLength: 0,
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
      // if (!confirm('Perform history navigation?')) {
      //   this.navigator.cancel(instruction);
      //   this.processingNavigation = null;
      //   return Promise.resolve();
      // }
    }

    let instructions: ViewportInstruction[];
    let clearUsedViewports: boolean = fullStateInstruction;
    if (typeof instruction.instruction === 'string') {
      let path = instruction.instruction;
      let transformedInstruction: string | ViewportInstruction[] = path;
      if (this.options.transformFromUrl && !fullStateInstruction) {
        transformedInstruction = this.options.transformFromUrl(path, this);
      }
      if (Array.isArray(transformedInstruction)) {
        instructions = transformedInstruction;
      } else {
        path = transformedInstruction;
        // TODO: Review this
        if (path === '/') {
          path = '';
        }

        instructions = this.instructionResolver.parseViewportInstructions(path);
        // TODO: Used to have an early exit if no instructions. Restore it?
      }
    } else {
      instructions = instruction.instruction;
      // TODO: Used to have an early exit if no instructions. Restore it?
    }

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

    for (const instr of instructions) {
      if (instr.scope === null) {
        instr.scope = this.rootScope;
      }
    }

    const alreadyFoundInstructions: ViewportInstruction[] = [];
    // TODO: Take care of cancellations down in subsets/iterations
    let { found: viewportInstructions, remaining: remainingInstructions } = this.findViewports(instructions, alreadyFoundInstructions);
    let guard = 100;
    while (viewportInstructions.length || remainingInstructions.length || defaultViewports.length || clearUsedViewports) {
      // Guard against endless loop
      if (!guard--) {
        throw Reporter.error(2002);
      }

      for (const defaultViewport of defaultViewports) {
        doneDefaultViewports.push(defaultViewport);
        if (viewportInstructions.every(value => value.viewport !== defaultViewport)) {
          const defaultInstruction = this.instructionResolver.parseViewportInstruction(defaultViewport.options.default as string);
          defaultInstruction.viewport = defaultViewport;
          viewportInstructions.push(defaultInstruction);
        }
      }

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
      viewportInstructions = [];
      while (this.addedViewports.length > 0) {
        const addedViewport = this.addedViewports.shift() as ViewportInstruction;
        // TODO: Should this overwrite instead? I think so.
        if (remaining.found.every(value => value.viewport !== addedViewport.viewport)) {
          viewportInstructions.push(addedViewport);
        }
      }
      viewportInstructions = [...viewportInstructions, ...remaining.found];
      remainingInstructions = remaining.remaining;
      defaultViewports = this.allViewports().filter(viewport =>
        viewport.options.default
        && viewport.content.componentInstance === null
        && doneDefaultViewports.every(done => done !== viewport)
        && updatedViewports.every(updated => updated !== viewport)
      );

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
      // if (!this.allViewports().length) {
      //   viewportsRemaining = false;
      // }
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
      if (element.parentElement !== null) {
        parent = this.closestViewport(element.parentElement);
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
  public allViewports(includeDisabled: boolean = false): Viewport[] {
    this.ensureRootScope();
    return (this.rootScope as Viewport).allViewports(includeDisabled);
  }

  public goto(instructions: NavigationInstruction | NavigationInstruction[], options?: IGotoOptions): Promise<void> {
    options = options || {};
    // TODO: Review query extraction; different pos for path and fragment!
    if (typeof instructions === 'string' && !options.query) {
      const [path, search] = instructions.split('?');
      instructions = path;
      options.query = search;
    }
    if (typeof instructions !== 'string' || instructions !== this.instructionResolver.clearViewportInstruction) {
      let scope: Viewport | null = null;
      if (options.origin) {
        scope = this.closestScope(options.origin as Element);
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
          } else { // Specified root scope with /
            scope = this.rootScope;
          }
        }
        // TODO: Maybe deal with non-strings?
      }
      instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
      for (const instruction of instructions as ViewportInstruction[]) {
        if (instruction.scope === null) {
          instruction.scope = scope;
        }
      }
    } else {
      instructions = NavigationInstructionResolver.toViewportInstructions(this, instructions);
    }

    if (options.append) {
      if (this.processingNavigation) {
        this.addedViewports.push(...(instructions as ViewportInstruction[]));
        // Can't return current navigation promise since it can lead to deadlock in enter
        return Promise.resolve();
      } else {
        // Can only append after first load has happened (defaults can fire too early)
        if (!this.loadedFirst) {
          return Promise.resolve();
        }
      }
    }

    const entry: INavigatorEntry = {
      instruction: instructions as ViewportInstruction[],
      fullStateInstruction: '',
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
   * Finds the closest ancestor viewport.
   *
   * @param element - The element to search upward from. The element is not searched.
   * @returns The Viewport that is the closest ancestor.
   */
  public closestViewport(element: Element): Viewport | null {
    let el: Element & { $viewport?: Viewport } | null = element;
    let $viewport: Viewport | undefined = el.$viewport;
    while (!$viewport && el.parentElement) {
      el = el.parentElement;
      $viewport = el.$viewport;
    }
    // TODO: Always also check controllers and return the closest one
    if (el.$viewport) {
      return el.$viewport;
    }
    el = element;
    let controller = CustomElement.behaviorFor(el);
    while (!controller && el.parentElement) {
      el = el.parentElement;
      CustomElement.behaviorFor(el);
    }
    while (controller) {
      if (controller.host) {
        const viewport = this.allViewports().find((item) => item.element === controller!.host);
        if (viewport) {
          return viewport;
        }
      }
      controller = controller.parent;
    }
    return null;
  }

  private findViewports(instructions: ViewportInstruction[], alreadyFound: ViewportInstruction[], withoutViewports: boolean = false): { found: ViewportInstruction[]; remaining: ViewportInstruction[] } {
    const found: ViewportInstruction[] = [];
    const remaining: ViewportInstruction[] = [];

    while (instructions.length) {
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

  private closestScope(element: Element): Viewport {
    const viewport = this.closestViewport(element);
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

    let state = this.instructionResolver.stringifyViewportInstructions(instructions, false, true);

    if (this.options.transformToUrl) {
      // TODO: Review this. Also, should it perhaps get full state?
      const routeOrInstructions = this.options.transformToUrl(this.instructionResolver.parseViewportInstructions(state), this);
      state = Array.isArray(routeOrInstructions) ? this.instructionResolver.stringifyViewportInstructions(routeOrInstructions) : routeOrInstructions;
    }

    const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
    instruction.path = state + query;

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
