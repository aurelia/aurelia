import { RouteRecognizer, RouteHandler, ConfigurableRoute, RecognizeResult } from './route-recognizer';
import { IContainer } from '@aurelia/kernel';
import { IRenderContext, CustomElement, CustomElementType } from '@aurelia/runtime';
import { IRoute, RouteableComponentType } from './interfaces';
import { FoundRoute } from './found-route';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
import { NavigationInstructionResolver } from './type-resolvers';
import { Viewport, IViewportOptions } from './viewport';

export interface IFindViewportsResult {
  foundViewports: ViewportInstruction[];
  remainingInstructions: ViewportInstruction[];
}

export interface IViewportScopeOptions {
}

export class ViewportScope {
  public scope: ViewportScope;

  public parent: ViewportScope | null = null;
  public children: ViewportScope[] = [];
  public replacedChildren: ViewportScope[] = [];
  public path: string | null = null;

  public enabled: boolean = true;

  public constructor(
    public readonly router: IRouter,
    scope: boolean,
    public owningScope: ViewportScope | null,
    public viewport: Viewport | null = null,
    public element: Element | null = null,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
    public options: IViewportScopeOptions = {},
  ) {
    this.owningScope = owningScope || this;
    this.scope = scope ? this : this.owningScope;
    if (element) {
      const controller = CustomElement.for(element);
      const dummy = controller;
    }
  }

  public get enabledChildren(): ViewportScope[] {
    return this.children.filter(scope => scope.enabled);
  }

  public get enabledViewports(): Viewport[] {
    return this.children.filter(scope => scope.viewport !== null && scope.enabled)
      .map(scope => scope.viewport) as Viewport[];
  }

  public addChild(viewportScope: ViewportScope): void {
    if (!this.children.some(vp => vp === viewportScope)) {
      if (viewportScope.parent !== null) {
        viewportScope.parent.removeChild(viewportScope);
      }
      this.children.push(viewportScope);
      viewportScope.parent = this;
    }
  }

  public removeChild(viewportScope: ViewportScope): void {
    const index: number = this.children.indexOf(viewportScope);
    if (index >= 0) {
      this.children.splice(index, 1);
      viewportScope.parent = null;
    }
  }

  public clearReplacedChildren(): void {
    this.replacedChildren = [];
  }
  public disableReplacedChildren(): void {
    this.replacedChildren = this.enabledChildren;
    for (const scope of this.replacedChildren) {
      scope.enabled = false;
    }
  }
  public reenableReplacedChildren(): void {
    for (const scope of this.replacedChildren) {
      scope.enabled = true;
    }
  }

  public getEnabledViewports(): Record<string, Viewport> {
    return this.getOwnedViewports().filter(viewport => viewport.enabled).reduce(
      (viewports: Record<string, Viewport>, viewport) => {
        viewports[viewport.name] = viewport;
        return viewports;
      },
      {});
  }

  public getOwnedViewports(includeDisabled: boolean = false): Viewport[] {
    return this.allViewports(includeDisabled).filter(viewport => viewport.owningScope === this);
  }

  public findViewports(instructions: ViewportInstruction[], alreadyFound: ViewportInstruction[], disregardViewports: boolean = false): IFindViewportsResult {
    const foundViewports: ViewportInstruction[] = [];
    let remainingInstructions: ViewportInstruction[] = [];

    // Get a shallow copy of all available viewports
    const availableViewports: Record<string, Viewport | null> = { ...this.getEnabledViewports() };
    for (const instruction of alreadyFound.filter(found => found.scope === this)) {
      availableViewports[instruction.viewportName!] = null;
    }

    const viewportInstructions = instructions.slice();

    // The viewport is already known
    if (!disregardViewports) {
      for (let i = 0; i < viewportInstructions.length; i++) {
        const instruction = viewportInstructions[i];
        if (instruction.viewport) {
          const remaining = this.foundViewport(instruction, instruction.viewport, disregardViewports);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[instruction.viewport.name] = null;
          viewportInstructions.splice(i--, 1);
        }
      }
    }

    // Configured viewport is ruling
    for (let i = 0; i < viewportInstructions.length; i++) {
      const instruction = viewportInstructions[i];
      instruction.needsViewportDescribed = true;
      for (const name in availableViewports) {
        if (Object.prototype.hasOwnProperty.call(availableViewports, name)) {
          const viewport: Viewport | null = availableViewports[name];
          // TODO: Also check if (resolved) component wants a specific viewport
          if (viewport && viewport.wantComponent(instruction.componentName as string)) {
            const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
            foundViewports.push(instruction);
            remainingInstructions.push(...remaining);
            availableViewports[name] = null;
            viewportInstructions.splice(i--, 1);
            break;
          }
        }
      }
    }

    // Next in line is specified viewport (but not if we're disregarding viewports)
    if (!disregardViewports) {
      for (let i = 0; i < viewportInstructions.length; i++) {
        const instruction = viewportInstructions[i];
        const name = instruction.viewportName;
        if (!name || !name.length) {
          continue;
        }
        const newScope = instruction.ownsScope;
        if (!this.getEnabledViewports()[name]) {
          this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
          availableViewports[name] = this.getEnabledViewports()[name];
        }
        const viewport = availableViewports[name];
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[name] = null;
          viewportInstructions.splice(i--, 1);
        }
      }
    }

    // Finally, only one accepting viewport left?
    for (let i = 0; i < viewportInstructions.length; i++) {
      const instruction = viewportInstructions[i];
      const remainingViewports: Viewport[] = [];
      for (const name in availableViewports) {
        if (Object.prototype.hasOwnProperty.call(availableViewports, name)) {
          const viewport: Viewport | null = availableViewports[name];
          if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
            remainingViewports.push(viewport);
          }
        }
      }
      if (remainingViewports.length === 1) {
        const viewport: Viewport = remainingViewports.shift() as Viewport;
        const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
        foundViewports.push(instruction);
        remainingInstructions.push(...remaining);
        availableViewports[viewport.name] = null;
        viewportInstructions.splice(i--, 1);
      }
    }

    // If we're ignoring viewports, we now match them anyway
    if (disregardViewports) {
      for (let i = 0; i < viewportInstructions.length; i++) {
        const instruction = viewportInstructions[i];
        let viewport = instruction.viewport;
        if (!viewport) {
          const name = instruction.viewportName;
          if (!name || !name.length) {
            continue;
          }
          const newScope = instruction.ownsScope;
          if (!this.getEnabledViewports()[name]) {
            this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
            availableViewports[name] = this.getEnabledViewports()[name];
          }
          viewport = availableViewports[name];
        }
        if (viewport && viewport.acceptComponent(instruction.componentName as string)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[viewport.name] = null;
          viewportInstructions.splice(i--, 1);
        }
      }
    }

    remainingInstructions = [...viewportInstructions, ...remainingInstructions];
    return {
      foundViewports,
      remainingInstructions,
    };
  }

  public foundViewport(instruction: ViewportInstruction, viewport: Viewport, withoutViewports: boolean, doesntNeedViewportDescribed: boolean = false): ViewportInstruction[] {
    instruction.setViewport(viewport);
    if (doesntNeedViewportDescribed) {
      instruction.needsViewportDescribed = false;
    }
    const remaining: ViewportInstruction[] = (instruction.nextScopeInstructions || []).slice();
    for (const rem of remaining) {
      if (rem.scope === null) {
        rem.scope = viewport.scope || viewport.owningScope;
      }
    }
    return remaining;
  }

  public addViewport(name: string, element: Element | null, context: IRenderContext | IContainer | null, options: IViewportOptions = {}): Viewport {
    let viewport: Viewport | null = this.getEnabledViewports()[name];
    // Each au-viewport element has its own Viewport
    if (element && viewport && viewport.element !== null && viewport.element !== element) {
      viewport.enabled = false;
      viewport = this.getOwnedViewports(true).find(child => child.name === name && child.element === element) || null;
      if (viewport) {
        viewport.enabled = true;
      }
    }
    if (!viewport) {
      viewport = new Viewport(this.router, name, null, null, this.scope || this.owningScope, !!options.scope, options);
      this.addChild(viewport.viewportScope);
    }
    // TODO: Either explain why || instead of && here (might only need one) or change it to && if that should turn out to not be relevant
    if (element || context) {
      viewport.setElement(element as Element, context as IRenderContext, options);
    }
    return viewport;
  }
  public removeViewport(viewport: Viewport, element: Element | null, context: IRenderContext | IContainer | null): boolean {
    if ((!element && !context) || viewport.remove(element, context)) {
      this.removeChild(viewport.viewportScope);
      return true;
    }
    return false;
  }

  public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
    const scopes: ViewportScope[] = includeDisabled ? this.children : this.enabledChildren;
    const viewports: Viewport[] = scopes.filter(scope => scope.viewport !== null).map(scope => scope.viewport!);
    for (const scope of scopes) {
      viewports.push(...scope.allViewports(includeDisabled, includeReplaced));
    }
    return viewports;
  }

  public reparentViewportInstructions(): ViewportInstruction[] | null {
    const enabledViewports = this.enabledViewports.filter(viewport => viewport.content.content
      && viewport.content.content.componentName);
    if (!enabledViewports.length) {
      return null;
    }
    for (const viewport of enabledViewports) {
      if (viewport.content.content !== void 0 && viewport.content.content !== null) {
        const childInstructions = viewport.viewportScope.reparentViewportInstructions();
        viewport.content.content.nextScopeInstructions = childInstructions !== null && childInstructions.length > 0 ? childInstructions : null;
      }
    }
    return enabledViewports.map(viewport => viewport.content.content);
  }

  public findMatchingRoute(path: string): FoundRoute | null {
    if (this.rootComponentType !== null) {
      return this.findMatchingRouteInRoutes(path, (this.rootComponentType as RouteableComponentType & { routes: IRoute[] }).routes);
    }
    if (this.viewport !== null) {
      return this.findMatchingRouteInRoutes(path, this.viewport.getRoutes());
    }

    // TODO: Match specified names here

    for (const child of this.enabledChildren) {
      const found = child.findMatchingRoute(path);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }

  public async canLeave(): Promise<boolean> {
    const results = await Promise.all(this.children.map(child =>
      child.viewport !== null
        ? child.viewport.canLeave()
        : child.canLeave()));
    return results.every(result => result === true);
  }

  private findMatchingRouteInRoutes(path: string, routes: IRoute[] | null): FoundRoute | null {
    if (!Array.isArray(routes)) {
      return null;
    }

    routes = routes.map(route => this.ensureProperRoute(route));
    const recognizableRoutes: ConfigurableRoute[] = routes.map(route => ({ path: route.path, handler: { name: route.id, route } }));
    for (let i: number = 0, ilen: number = recognizableRoutes.length; i < ilen; i++) {
      const newRoute: ConfigurableRoute = { ...recognizableRoutes[i] };
      newRoute.path += '/*remainingPath';
      recognizableRoutes.push(newRoute);
    }
    const found: FoundRoute = new FoundRoute();
    let params: Record<string, unknown> = {};
    if (path.startsWith('/') || path.startsWith('+')) {
      path = path.slice(1);
    }
    const recognizer: RouteRecognizer = new RouteRecognizer();
    recognizer.add(recognizableRoutes);
    const result: RecognizeResult[] = recognizer.recognize(path);
    if (result !== void 0 && result.length > 0) {
      found.match = (result[0].handler as RouteHandler & { route: IRoute }).route;
      found.matching = path;
      params = result[0].params;
      if (params.remainingPath !== void 0 && (params.remainingPath as string).length > 0) {
        found.remaining = params.remainingPath as string;
        delete params['remainingPath'];
        found.matching = found.matching.slice(0, found.matching.indexOf(found.remaining));
      }
    }
    if (found.foundConfiguration) {
      // clone it so config doesn't get modified
      found.instructions = this.router.instructionResolver.cloneViewportInstructions(found.match!.instructions as ViewportInstruction[]);
      const instructions: ViewportInstruction[] = found.instructions.slice();
      while (instructions.length > 0) {
        const instruction: ViewportInstruction = instructions.shift() as ViewportInstruction;
        instruction.addParameters(params);
        instruction.route = '';
        if (instruction.nextScopeInstructions !== null) {
          instructions.unshift(...instruction.nextScopeInstructions);
        }
      }
      if (found.instructions.length > 0) {
        found.instructions[0].route = found.matching;
      }
    }
    return found;
  }

  private ensureProperRoute(route: IRoute): IRoute {
    if (route.id === void 0) {
      route.id = route.path;
    }
    route.instructions = NavigationInstructionResolver.toViewportInstructions(this.router, route.instructions);
    return route;
  }
}
