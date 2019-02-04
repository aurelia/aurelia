import { ViewportCustomElement } from './../dist/router/src/resources/viewport.d';
import { IContainer, InterfaceSymbol } from '@aurelia/kernel';
import { Aurelia, ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { HistoryBrowser, IHistoryOptions, INavigationInstruction } from './history-browser';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { IParsedQuery, parseQuery } from './parser';
import { ChildContainer, IComponentViewport, Scope } from './scope';
import { closestCustomElement } from './utils';
import { IViewportOptions, Viewport } from './viewport';

export interface IRouterOptions extends IHistoryOptions {
  separators?: IRouteSeparators;
  reportCallback?(instruction: INavigationInstruction): void;
  transformFromUrl?(path: string, router: Router): string;
  transformToUrl?(states: IComponentViewportParameters[], router: Router): string;
}

export interface IComponentViewportParameters {
  component: ICustomElementType | string;
  viewport?: Viewport | string;
  parameters?: Record<string, unknown>;
}

export interface IRoute {
  name?: string;
  path: string;
  redirect?: string;
  title?: string;
  viewports?: Record<string, string>;
  meta?: Record<string, string>;
}

export interface IRouteViewport {
  name: string;
  component: ICustomElementType | string;
}

export interface IRouteSeparators {
  viewport: string;
  sibling: string;
  scope: string;
  ownsScope: string;
  parameters: string;
  add: string;
  clear: string;
  action: string;
}

export class Router {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IContainer];

  public rootScope: Scope;
  public scopes: Scope[] = [];

  public separators: IRouteSeparators;

  public historyBrowser: HistoryBrowser;
  public linkHandler: LinkHandler;

  public navs: Record<string, Nav> = {};
  public activeComponents: string[] = [];

  public addedViewports: IComponentViewport[] = [];

  private options: IRouterOptions;
  private isActive: boolean = false;
  private isRedirecting: boolean = false;

  private readonly pendingNavigations: INavigationInstruction[] = [];
  private processingNavigation: INavigationInstruction = null;
  private lastNavigation: INavigationInstruction = null;

  constructor(public container: IContainer) {
    this.historyBrowser = new HistoryBrowser();
    this.linkHandler = new LinkHandler();
  }

  public get isNavigating(): boolean {
    return this.processingNavigation !== null;
  }

  public activate(options?: IRouterOptions): Promise<void> {
    if (this.isActive) {
      throw new Error('Router has already been activated.');
    }

    this.isActive = true;
    this.options = {
      ...{
        callback: (navigationInstruction) => {
          this.historyCallback(navigationInstruction);
        }
      }, ...options
    };

    this.separators = {
      ... {
        viewport: '@', // ':',
        sibling: '+', // '/',
        scope: '/', // '+',
        ownsScope: '!',
        parameters: '=',
        add: '+',
        clear: '-',
        action: '.',
      }, ...this.options.separators
    };

    this.linkHandler.activate({ callback: this.linkCallback });
    return this.historyBrowser.activate(this.options).catch(error => { throw error; });
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Router has not been activated.');
    }
    this.linkHandler.deactivate();
    this.historyBrowser.deactivate();
  }

  public linkCallback = (info: AnchorEventInfo): void => {
    let href = info.href;
    if (href.startsWith('#')) {
      href = href.substring(1);
    }
    if (!href.startsWith('/')) {
      const scope = this.closestScope(info.anchor);
      const context = scope.scopeContext();
      if (context) {
        href = `/${context}${this.separators.scope}${href}`;
      }
    }
    this.historyBrowser.setHash(href);
  }

  public historyCallback(instruction: INavigationInstruction): void {
    this.pendingNavigations.push(instruction);
    this.processNavigations().catch(error => { throw error; });
  }

  // TODO: Reduce complexity (currently at 46)
  public async processNavigations(): Promise<void> {
    if (this.processingNavigation !== null || !this.pendingNavigations.length) {
      return Promise.resolve();
    }

    const instruction: INavigationInstruction = this.pendingNavigations.shift();
    this.processingNavigation = instruction;

    if (this.options.reportCallback) {
      this.options.reportCallback(instruction);
    }

    if (instruction.isCancel) {
      this.processingNavigation = null;
      this.processNavigations().catch(error => { throw error; });
      return Promise.resolve();
    }

    let clearViewports: boolean = false;
    let fullStateInstruction: boolean = false;
    if ((instruction.isBack || instruction.isForward) && instruction.fullStatePath) {
      instruction.path = instruction.fullStatePath;
      fullStateInstruction = true;
      // tslint:disable-next-line:no-commented-code
      // if (!confirm('Perform history navigation?')) {
      //   this.historyBrowser.cancel();
      //   this.processingNavigation = null;
      //   return Promise.resolve();
      // }
    }

    let path = instruction.path;
    if (this.options.transformFromUrl && !fullStateInstruction) {
      path = this.options.transformFromUrl(path, this);
      if (Array.isArray(path)) {
        path = this.statesToString(path);
      }
    }

    if (path === this.separators.clear || path.startsWith(this.separators.clear + this.separators.add)) {
      clearViewports = true;
      if (path.startsWith(this.separators.clear)) {
        path = path.substring(1);
      }
    }

    const parsedQuery: IParsedQuery = parseQuery(instruction.query);
    instruction.parameters = parsedQuery.parameters;
    instruction.parameterList = parsedQuery.list;

    // TODO: Fetch title (probably when done)
    const title = null;
    const views: Record<string, string> = this.findViews(path);

    if (!views && !Object.keys(views).length && !clearViewports) {
      this.processingNavigation = null;
      this.processNavigations().catch(error => { throw error; });
      return Promise.resolve();
    }

    if (title) {
      await this.historyBrowser.setEntryTitle(title);
    }

    const usedViewports = (clearViewports ? this.allViewports().filter((value) => value.content.component !== null) : []);
    const defaultViewports = this.allViewports().filter((value) => value.options.default && value.content.component === null);

    const updatedViewports: Viewport[] = [];

    // TODO: Take care of cancellations down in subsets/iterations
    let { componentViewports, viewportsRemaining } = this.rootScope.findViewports(views);
    let guard = 100;
    while (componentViewports.length || viewportsRemaining || defaultViewports.length) {
      // Guard against endless loop
      if (!guard--) {
        throw new Error('Failed to resolve all viewports');
      }
      const changedViewports: Viewport[] = [];
      for (const componentViewport of componentViewports) {
        const { component, viewport } = componentViewport;
        if (viewport.setNextContent(component, instruction)) {
          changedViewports.push(viewport);
        }
        const usedIndex = usedViewports.findIndex((value) => value === viewport);
        if (usedIndex >= 0) {
          usedViewports.splice(usedIndex, 1);
        }
        const defaultIndex = defaultViewports.findIndex((value) => value === viewport);
        if (defaultIndex >= 0) {
          defaultViewports.splice(defaultIndex, 1);
        }
      }
      for (const viewport of usedViewports) {
        if (viewport.setNextContent(this.separators.clear, instruction)) {
          changedViewports.push(viewport);
        }
      }
      // TODO: Support/review viewports not found in first iteration
      let vp: Viewport;
      while (vp = defaultViewports.shift()) {
        if (vp.setNextContent(vp.options.default, instruction)) {
          changedViewports.push(vp);
        }
      }

      // We've gone via a redirected route back to same viewport status so
      // we need to remove the added history entry for the redirect
      // TODO: Take care of empty subsets/iterations where previous has length
      if (!changedViewports.length && this.isRedirecting) {
        const result = this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
        this.isRedirecting = false;
        this.processNavigations().catch(error => { throw error; });
        return result;
      }

      let results = await Promise.all(changedViewports.map((value) => value.canLeave()));
      if (results.findIndex((value) => value === false) >= 0) {
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
        for (const cvp of canEnter) {
          // TODO: Abort content change in the viewports
          this.addProcessingViewport(cvp.component, cvp.viewport);
        }
        value.abortContentChange();
        return true;
      }));
      if (results.some(result => result === false)) {
        return this.cancelNavigation([...changedViewports, ...updatedViewports], instruction);
      }

      // TODO: Should it be kept here?
      // await Promise.all(changedViewports.map((value) => value.loadContent()));

      // TODO: Remove this once multi level recursiveness has been fixed
      // results = await Promise.all(changedViewports.map((value) => value.loadContent()));
      // if (results.findIndex((value) => value === false) >= 0) {
      //   return this.historyBrowser.cancel();
      // }

      for (const viewport of changedViewports) {
        if (!updatedViewports.find((value) => value === viewport)) {
          updatedViewports.push(viewport);
        }
      }

      // TODO: Fix multi level recursiveness!
      const remaining = this.rootScope.findViewports();
      componentViewports = [];
      let addedViewport: IComponentViewport;
      while (addedViewport = this.addedViewports.shift()) {
        // TODO: Should this overwrite instead? I think so.
        if (!remaining.componentViewports.find((value) => value.viewport === addedViewport.viewport)) {
          componentViewports.push(addedViewport);
        }
      }
      componentViewports = [...componentViewports, ...remaining.componentViewports];
      viewportsRemaining = remaining.viewportsRemaining;
    }

    await Promise.all(updatedViewports.map((value) => value.loadContent()));
    await this.replacePaths(instruction);

    // Remove history entry if no history viewports updated
    if (!instruction.isFirst && !instruction.isRepeat && updatedViewports.every(viewport => viewport.options.noHistory)) {
      await this.historyBrowser.pop().catch(error => { throw error; });
    }

    updatedViewports.forEach((viewport) => {
      viewport.finalizeContentChange();
    });
    this.lastNavigation = this.processingNavigation;
    if (this.lastNavigation.isRepeat) {
      this.lastNavigation.isRepeat = false;
    }
    this.processingNavigation = null;

    this.processNavigations().catch(error => { throw error; });
  }

  public addProcessingViewport(component: string | ICustomElementType, viewport: Viewport | string): void {
    if (this.processingNavigation) {
      if (typeof viewport === 'string') {
        // TODO: Deal with not yet existing viewports
        viewport = this.allViewports().find((vp) => vp.name === viewport);
      }
      this.addedViewports.push({ viewport: viewport as Viewport, component: component });
    } else if (this.lastNavigation) {
      // const path = (typeof component === 'string' ? component : component.name)
      //   + this.separators.viewport
      //   + (typeof viewport === 'string' ? viewport : viewport.name);
      this.pendingNavigations.unshift(this.lastNavigation);
      this.lastNavigation.isRepeat = true;
      this.processNavigations().catch(error => { throw error; });
    }
  }

  public findViews(path: string): Record<string, string> {
    const views: Record<string, string> = {};
    // TODO: Let this govern start of scope
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    const sections: string[] = path.split(this.separators.sibling);

    // TODO: Remove this once multi level recursiveness is fixed
    // Expand with instances for all containing views
    // const expandedSections: string[] = [];
    // while (sections.length) {
    //   const part = sections.shift();
    //   const parts = part.split(this.separators.scope);
    //   for (let i = 1; i <= parts.length; i++) {
    //     expandedSections.push(parts.slice(0, i).join(this.separators.scope));
    //   }
    // }
    // sections = expandedSections;

    let index = 0;
    while (sections.length) {
      const view = sections.shift();
      const scopes = view.split(this.separators.scope);
      const leaf = scopes.pop();
      const parts = leaf.split(this.separators.viewport);
      // Noooooo?
      const component = parts[0];
      scopes.push(parts.length ? parts.join(this.separators.viewport) : `?${index++}`);
      const name = scopes.join(this.separators.scope);
      if (component) {
        views[name] = component;
      }
    }
    return views;
  }

  // public findViewport(name: string): Viewport {
  //   return this.rootScope.findViewport(name);
  // }

  public findScope(element: Element): Scope {
    this.ensureRootScope();
    return this.closestScope(element);
  }

  // Called from the viewport custom element in attached()
  public addViewport(name: string, element: Element, context: IRenderContext, elementVM: any, options?: IViewportOptions): Viewport {
    // tslint:disable-next-line:no-console
    console.log('Viewport added', name, element, elementVM);
    const parentScope = this.findScope(element);
    return parentScope.addViewport(name, element, context, elementVM, options);
  }
  // Called from the viewport custom element
  public removeViewport(viewport: Viewport, element: Element, context: IRenderContext): void {
    // TODO: There's something hinky with remove!
    const scope = viewport.owningScope;
    if (!scope.removeViewport(viewport, element, context)) {
      this.removeScope(scope);
    }
  }
  public allViewports(): Viewport[] {
    this.ensureRootScope();
    return this.rootScope.allViewports();
  }

  public removeScope(scope: Scope): void {
    if (scope !== this.rootScope) {
      scope.removeScope();
      const index = this.scopes.indexOf(scope);
      if (index >= 0) {
        this.scopes.splice(index, 1);
      }
    }
  }

  public goto(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void> {
    if (typeof pathOrViewports === 'string') {
      return this.historyBrowser.goto(pathOrViewports, title, data);
    }
    // else {
    //   this.view(pathOrViewports, title, data);
    // }
  }

  public replace(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void> {
    if (typeof pathOrViewports === 'string') {
      return this.historyBrowser.replace(pathOrViewports, title, data);
    }
  }

  public refresh(): Promise<void> {
    return this.historyBrowser.refresh();
  }

  public back(): Promise<void> {
    return this.historyBrowser.back();
  }

  public forward(): Promise<void> {
    return this.historyBrowser.forward();
  }

  public statesToString(states: IComponentViewportParameters[]): string {
    const stringStates: string[] = [];
    for (const state of states) {
      // TODO: Support non-string components
      let stateString: string = state.component as string;
      if (state.viewport) {
        stateString += this.separators.viewport + state.viewport;
      }
      if (state.parameters) {
        // TODO: Support more than one parameter
        for (const key in state.parameters) {
          stateString += this.separators.parameters + state.parameters[key];
        }
      }
      stringStates.push(stateString);
    }
    return stringStates.join(this.separators.sibling);
  }
  public statesFromString(statesString: string): IComponentViewportParameters[] {
    const states = [];
    const stateStrings = statesString.split(this.separators.sibling);
    for (const stateString of stateStrings) {
      let component, viewport, parameters;
      const [componentPart, rest] = stateString.split(this.separators.viewport);
      if (rest === undefined) {
        [component, parameters] = componentPart.split(this.separators.parameters);
      } else {
        component = componentPart;
        [viewport, parameters] = rest.split(this.separators.parameters);
      }
      // TODO: Support more than one parameter
      const state: IComponentViewportParameters = { component: component };
      if (viewport) {
        state.viewport = viewport;
      }
      if (parameters) {
        state.parameters = { id: parameters };
      }
      states.push(state);
    }
    return states;
  }

  public setNav(name: string, routes: INavRoute[]): void {
    const nav = this.findNav(name);
    if (nav) {
      nav.routes = [];
    }
    this.addNav(name, routes);
  }
  public addNav(name: string, routes: INavRoute[]): void {
    let nav = this.navs[name];
    if (!nav) {
      nav = this.navs[name] = new Nav(this, name);
    }
    nav.addRoutes(routes);
  }
  public findNav(name: string): Nav {
    return this.navs[name];
  }

  private async cancelNavigation(updatedViewports: Viewport[], instruction: INavigationInstruction): Promise<void> {
    updatedViewports.forEach((viewport) => {
      viewport.abortContentChange().catch(error => { throw error; });
    });
    if (instruction.isNew) {
      await this.historyBrowser.pop();
    } else {
      await this.historyBrowser.cancel();
    }
    this.processingNavigation = null;
    this.processNavigations().catch(error => { throw error; });
  }

  private ensureRootScope(): void {
    if (!this.rootScope) {
      const root = this.container.get(Aurelia).root();
      this.rootScope = new Scope(this, root.$host as Element, root.$context, null);
      this.scopes.push(this.rootScope);
    }
  }

  private closestScope(element: Element): Scope {
    const el = closestCustomElement(element);
    let container: ChildContainer = el.$customElement.$context.get(IContainer);
    while (container) {
      const scope = this.scopes.find((item) => item.context.get(IContainer) === container);
      if (scope) {
        return scope;
      }
      container = container.parent;
    }
  }

  private removeStateDuplicates(states: string[]): string[] {
    let sorted: string[] = states.slice().sort((a, b) => b.split(this.separators.scope).length - a.split(this.separators.scope).length);
    sorted = sorted.map((value) => `${this.separators.scope}${value}${this.separators.scope}`);

    let unique: string[] = [];
    if (sorted.length) {
      unique.push(sorted.shift());
      while (sorted.length) {
        const state = sorted.shift();
        if (unique.find((value) => {
          return value.indexOf(state) === -1;
        })) {
          unique.push(state);
        }
      }
    }
    unique = unique.map((value) => value.substring(1, value.length - 1));
    unique.sort((a, b) => a.split(this.separators.scope).length - b.split(this.separators.scope).length);

    return unique;
  }

  private replacePaths(instruction: INavigationInstruction): Promise<void> {
    this.activeComponents = this.rootScope.viewportStates(true, true);
    this.activeComponents = this.removeStateDuplicates(this.activeComponents);

    let viewportStates = this.rootScope.viewportStates();
    viewportStates = this.removeStateDuplicates(viewportStates);
    let state = viewportStates.join(this.separators.sibling);
    if (this.options.transformToUrl) {
      state = this.options.transformToUrl(this.statesFromString(state), this);
    }

    let fullViewportStates = this.rootScope.viewportStates(true);
    fullViewportStates = this.removeStateDuplicates(fullViewportStates);
    fullViewportStates.unshift(this.separators.clear);
    const query = (instruction.query && instruction.query.length ? `?${instruction.query}` : '');
    return this.historyBrowser.replacePath(
      state + query,
      fullViewportStates.join(this.separators.sibling) + query,
      instruction);
  }
}
