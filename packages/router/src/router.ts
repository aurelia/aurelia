import { IContainer, InterfaceSymbol } from '@aurelia/kernel';
import { Aurelia, ICustomElementType } from '@aurelia/runtime';
import { HistoryBrowser, IHistoryOptions, INavigationInstruction } from './history-browser';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { IParsedQuery, parseQuery } from './parser';
import { IComponentViewport, Scope } from './scope';
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

  public viewports: Record<string, Viewport> = {};

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

  constructor(public container: IContainer) {
    this.historyBrowser = new HistoryBrowser();
    this.linkHandler = new LinkHandler();
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
    return;
  }

  public linkCallback = (info: AnchorEventInfo): void => {
    let href = info.href;
    if (href.startsWith('#')) {
      href = href.substring(1);
    }
    if (!href.startsWith('/')) {
      const scope = this.closestScope(info.anchor);
      const context = scope.context();
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
      return Promise.resolve();
    }

    if (title) {
      this.historyBrowser.setEntryTitle(title);
    }

    this.ensureRootScope();
    const usedViewports = (clearViewports ? this.rootScope.allViewports().filter((value) => value.component !== null) : []);
    const defaultViewports = this.rootScope.allViewports().filter((value) => value.options.default && value.component === null);

    let keepHistoryEntry = instruction.isFirst;

    // TODO: Take care of cancellations down in subsets/iterations
    let { componentViewports, viewportsRemaining } = this.rootScope.findViewports(views);
    let guard = 100;
    while (componentViewports.length || viewportsRemaining || defaultViewports.length) {
      // Guard against endless loop
      if (!guard--) {
        break;
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
        this.historyBrowser.cancel();
        this.isRedirecting = false;
      }

      let results = await Promise.all(changedViewports.map((value) => value.canLeave()));
      if (results.findIndex((value) => value === false) >= 0) {
        this.historyBrowser.cancel();
        this.processingNavigation = null;
        return Promise.resolve();
      }
      results = await Promise.all(changedViewports.map((value) => value.canEnter()));
      if (results.findIndex((value) => value === false) >= 0) {
        this.historyBrowser.cancel();
        this.processingNavigation = null;
        return Promise.resolve();
      }
      await Promise.all(changedViewports.map((value) => value.loadContent()));
      // TODO: Remove this once multi level recursiveness has been fixed
      // results = await Promise.all(changedViewports.map((value) => value.loadContent()));
      // if (results.findIndex((value) => value === false) >= 0) {
      //   this.historyBrowser.cancel();
      //   return Promise.resolve();
      // }

      if (changedViewports.reduce((accumulated: boolean, current: Viewport) => !current.options.noHistory || accumulated, keepHistoryEntry)) {
        keepHistoryEntry = true;
      }

      // TODO: Fix multi level recursiveness!
      const remaining = this.rootScope.findViewports();
      componentViewports = [];
      let addedViewport: IComponentViewport;
      while (addedViewport = this.addedViewports.shift()) {
        if (!remaining.componentViewports.find((value) => value.viewport === addedViewport.viewport)) {
          componentViewports.push(addedViewport);
        }
      }
      componentViewports = [...componentViewports, ...remaining.componentViewports];
      viewportsRemaining = remaining.viewportsRemaining;
    }

    this.replacePaths(instruction);

    if (!keepHistoryEntry) {
      this.historyBrowser.pop().catch(error => { throw error; });
    }
    this.processingNavigation = null;

    if (this.pendingNavigations.length) {
      this.processNavigations().catch(error => { throw error; });
    }
  }

  public addProcessingViewport(viewport: Viewport, component: string): void {
    if (this.processingNavigation) {
      this.addedViewports.push({ viewport: viewport, component: component });
    }
  }

  // public view(views: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void> {
  //   console.log('Router.view:', views, title, data);

  // tslint:disable-next-line:no-commented-code
  //   if (title) {
  //     this.historyBrowser.setEntryTitle(title);
  //   }

  // tslint:disable-next-line:no-commented-code
  //   const viewports: Viewport[] = [];
  //   for (const v in views) {
  //     const component: ICustomElementType = views[v];
  //     const viewport = this.findViewport(`${v}:${component}`);
  //     if (viewport.setNextContent(component, { path: '' })) {
  //       viewports.push(viewport);
  //     }
  //   }

  // tslint:disable-next-line:no-commented-code
  //   // We've gone via a redirected route back to same viewport status so
  //   // we need to remove the added history entry for the redirect
  //   if (!viewports.length && this.isRedirecting) {
  //     this.historyBrowser.cancel();
  //     this.isRedirecting = false;
  //   }

  // tslint:disable-next-line:no-commented-code
  //   let cancel: boolean = false;
  //   return Promise.all(viewports.map((value) => value.canLeave()))
  //     .then((promises: boolean[]) => {
  //       if (cancel || promises.findIndex((value) => value === false) >= 0) {
  //         cancel = true;
  //         return Promise.resolve([]);
  //       } else {
  //         return Promise.all(viewports.map((value) => value.canEnter()));
  //       }
  //     }).then((promises: boolean[]) => {
  //       if (cancel || promises.findIndex((value) => value === false) >= 0) {
  //         cancel = true;
  //         return Promise.resolve([]);
  //       } else {
  //         return Promise.all(viewports.map((value) => value.loadContent()));
  //       }
  //     }).then(() => {
  //       if (cancel) {
  //         this.historyBrowser.cancel();
  //       }
  //     }).then(() => {
  //       const viewports = Object.values(this.viewports).map((value) => value.description()).filter((value) => value && value.length);
  //       this.historyBrowser.history.replaceState({}, null, '#/' + viewports.join('/'));
  //     });
  // }

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
  public addViewport(name: string, element: Element, options?: IViewportOptions): Viewport {
    // tslint:disable-next-line:no-console
    console.log('Viewport added', name, element);
    const parentScope = this.findScope(element);
    return parentScope.addViewport(name, element, options);
  }
  // Called from the viewport custom element
  public removeViewport(viewport: Viewport): void {
    // TODO: There's something hinky with remove!
    const scope = viewport.owningScope;
    if (!scope.removeViewport(viewport)) {
      this.removeScope(scope);
    }
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

  public goto(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): void {
    if (typeof pathOrViewports === 'string') {
      this.historyBrowser.goto(pathOrViewports, title, data);
    }
    // else {
    //   this.view(pathOrViewports, title, data);
    // }
  }

  public replace(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): void {
    if (typeof pathOrViewports === 'string') {
      this.historyBrowser.replace(pathOrViewports, title, data);
    }
  }

  public refresh(): void {
    this.historyBrowser.refresh();
  }

  public back(): void {
    this.historyBrowser.back();
  }

  public forward(): void {
    this.historyBrowser.forward();
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

  private ensureRootScope(): void {
    if (!this.rootScope) {
      const aureliaRootElement = this.container.get(Aurelia).root().$host;
      this.rootScope = new Scope(this, aureliaRootElement as Element, null);
      this.scopes.push(this.rootScope);
    }
  }

  private closestScope(element: Element): Scope {
    let closest: number = Number.MAX_SAFE_INTEGER;
    let scope: Scope;
    for (const sc of this.scopes) {
      let el = element;
      let i = 0;
      while (el) {
        if (el === sc.element) {
          break;
        }
        i++;
        el = el.parentElement;
      }
      if (i < closest) {
        closest = i;
        scope = sc;
      }
    }
    return scope;
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

  private replacePaths(instruction: INavigationInstruction): void {
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
    this.historyBrowser.replacePath(
      state + query,
      fullViewportStates.join(this.separators.sibling) + query,
      instruction);
  }
}
