/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IViewportScopeOptions, ViewportScope } from './viewport-scope.js';
import { CustomElementType } from '@aurelia/runtime-html';
import { FoundRoute } from './found-route.js';
import { IRouter } from './router.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { LoadInstructionResolver } from './type-resolvers.js';
import { Viewport, IViewportOptions } from './viewport.js';
import { IConfigurableRoute, RouteRecognizer } from './route-recognizer.js';
import { Runner, Step } from './utilities/runner.js';
import { IRoute, Route } from './route.js';
import { Endpoint, IConnectedCustomElement } from './endpoints/endpoint.js';
import { RouterOptions } from './router-options.js';
import { EndpointMatcher, IMatchEndpointsResult } from './endpoint-matcher.js';

export type NextContentAction = 'skip' | 'reload' | 'swap' | '';

export class RoutingScope {
  public id: string = '.';
  public scope: RoutingScope;

  public parent: RoutingScope | null = null;
  public children: RoutingScope[] = [];
  public replacedChildren: RoutingScope[] = [];
  public path: string | null = null;

  public enabled: boolean = true;

  // Support collection feature in viewport scopes
  public childCollections: Record<string, unknown[]> = {};

  public constructor(
    public readonly router: IRouter,
    public readonly hasScope: boolean,
    public owningScope: RoutingScope | null,
    // public viewport: Viewport | null = null,
    public endpoint: Endpoint,
    // public viewportScope: ViewportScope | null = null,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
  ) {
    this.owningScope = owningScope ?? this;
    this.scope = this.hasScope ? this : this.owningScope.scope;
    console.log('Created scope', this.endpoint instanceof Endpoint, this.endpoint instanceof Viewport, this.endpoint instanceof ViewportScope, this.endpoint);
  }

  public static isViewport(endpoint: Endpoint): endpoint is Viewport {
    return endpoint instanceof Viewport;
  }
  public static isViewportScope(endpoint: Endpoint): endpoint is ViewportScope {
    return endpoint instanceof ViewportScope;
  }

  public get pathname(): string {
    return `${this.owningScope !== this ? this.owningScope!.pathname : ''}/${this.endpoint!.name}`;
  }

  public toString(recurse = false): string {
    return `${this.owningScope !== this ? this.owningScope!.toString() : ''}/${this.endpoint!.toString()}` +
      // eslint-disable-next-line prefer-template
      `${recurse ? `\n` + this.children.map(child => child.toString(true)).join('') : ''}`;
  }

  public get isViewport(): boolean {
    return this.endpoint instanceof Viewport;
  }
  public get isViewportScope(): boolean {
    return this.endpoint instanceof ViewportScope;
  }

  public get type(): string {
    return this.isViewport ? 'Viewport' : 'ViewportScope';
  }

  public get passThroughScope(): boolean {
    return this.isViewportScope && (this.endpoint as ViewportScope).passThroughScope;
  }

  public get enabledChildren(): RoutingScope[] {
    return this.children.filter(scope => scope.enabled);
  }
  public get hoistedChildren(): RoutingScope[] {
    const scopes = this.enabledChildren;
    while (scopes.some(scope => scope.passThroughScope)) {
      for (const scope of scopes.slice()) {
        if (scope.passThroughScope) {
          const index = scopes.indexOf(scope);
          scopes.splice(index, 1, ...scope.enabledChildren);
        }
      }
    }
    return scopes;
  }

  public get routingInstruction(): RoutingInstruction | null {
    if (this.endpoint.isViewportScope) {
      return (this.endpoint as ViewportScope).instruction;
    }
    if (this.isViewport) {
      return (this.endpoint as Viewport).content.instruction;
    }
    return null;
  }

  public get parentNextContentAction(): NextContentAction {
    if (this.parent === null) {
      return '';
    }
    const parentAction = this.parent.endpoint!.nextContentAction;
    if (parentAction === 'swap' || parentAction === 'skip') {
      return parentAction;
    }
    return this.parent.parentNextContentAction;
  }

  // public getEnabledViewports(viewportScopes: RoutingScope[]): Record<string, Viewport> {
  //   return viewportScopes
  //     .filter(scope => !scope.isViewportScope)
  //     .map(scope => scope.endpoint!)
  //     .reduce<Record<string, Viewport>>(
  //       (viewports, viewport) => {
  //         viewports[viewport.name] = viewport;
  //         return viewports;
  //       },
  //       {}
  //     );
  // }

  // public getOwnedViewports(includeDisabled: boolean = false): Viewport[] {
  //   return this.allViewports(includeDisabled).filter(viewport => viewport.owningScope === this);
  // }

  public getOwnedScopes(includeDisabled: boolean = false): RoutingScope[] {
    const scopes = this.allScopes(includeDisabled).filter(scope => scope.owningScope === this);
    // Hoist children to pass through scopes
    for (const scope of scopes.slice()) {
      if (scope.passThroughScope) {
        const index = scopes.indexOf(scope);
        scopes.splice(index, 1, ...scope.getOwnedScopes());
      }
    }
    return scopes;
  }

  public findInstructions(instruction: string | RoutingInstruction[]): FoundRoute {
    let route = new FoundRoute();
    if (typeof instruction === 'string') {
      const instructions = this.router.instructionResolver.parseRoutingInstructions(instruction);
      if (RouterOptions.useConfiguredRoutes && !this.router.hasSiblingInstructions(instructions)) {
        const foundRoute = this.findMatchingRoute(instruction);
        if (foundRoute?.foundConfiguration ?? false) {
          route = foundRoute!;
        } else {
          if (RouterOptions.useDirectRoutes) {
            route.instructions = instructions;
            if (route.instructions.length > 0) {
              const nextInstructions = route.instructions[0].nextScopeInstructions ?? [];
              route.remaining = this.router.instructionResolver.stringifyRoutingInstructions(nextInstructions);
              // TODO: Verify that it's okay to leave this in
              route.instructions[0].nextScopeInstructions = null;
            }
          }
        }
      } else if (RouterOptions.useDirectRoutes) {
        route.instructions = instructions;
      }
    } else {
      route.instructions = instruction;
    }

    for (const instr of route.instructions) {
      if (instr.scope === null) {
        instr.scope = this;
      }
    }

    return route;
  }

  // Note: This can't change state other than the instructions!
  public matchEndpoints(instructions: RoutingInstruction[], alreadyFound: RoutingInstruction[], disregardViewports: boolean = false): IMatchEndpointsResult {
    return EndpointMatcher.matchEndpoints(this, instructions, alreadyFound, disregardViewports);
  }

  public addEndpoint(type: string, name: string, connectedCE: IConnectedCustomElement | null, options: IViewportOptions | IViewportScopeOptions = {}): Viewport | ViewportScope {
    let endpoint: Endpoint | null = this.getOwnedScopes()
      .find(scope => scope.type === type &&
        scope.endpoint.name === name)?.endpoint ?? null;
    // Each endpoint element has its own Endpoint
    if (connectedCE != null && endpoint?.connectedCE != null && endpoint.connectedCE !== connectedCE) {
      endpoint.enabled = false;
      endpoint = this.getOwnedScopes(true)
        .find(scope => scope.type === type &&
          scope.endpoint.name === name &&
          scope.endpoint.connectedCE === connectedCE)?.endpoint
        ?? null;
      if (endpoint != null) {
        endpoint.enabled = true;
      }
    }
    if (endpoint == null) {
      endpoint = type === 'Viewport'
        ? new Viewport(this.router, name, connectedCE, this.scope, !!(options as IViewportOptions).scope, options)
        : new ViewportScope(this.router, name, connectedCE, this.scope, true, null, options);
      this.addChild(endpoint.connectedScope);
    }
    if (connectedCE != null) {
      endpoint.setConnectedCE(connectedCE, options);
    }
    return endpoint as Viewport | ViewportScope;
  }

  // public addViewport(name: string, connectedCE: IConnectedCustomElement | null, options: IViewportOptions = {}): Viewport {
  //   let viewport: Viewport | null = this.getOwnedScopes()
  //     .find(scope => scope.isViewport && scope.endpoint.name === name)?.endpoint as Viewport ?? null;
  //   // let viewport: Viewport | null = this.getEnabledViewports(this.getOwnedScopes())[name];
  //   // Each au-viewport element has its own Viewport
  //   if (((connectedCE ?? null) !== null) &&
  //     ((viewport?.connectedCE ?? null) !== null) &&
  //     viewport.connectedCE !== connectedCE) {
  //     viewport.enabled = false;
  //     // viewport = this.getOwnedViewports(true).find(child => child.name === name && child.connectedCE === connectedCE) ?? null;
  //     viewport = this.getOwnedScopes(true)
  //       .find(child => child.isViewport &&
  //         child.endpoint.name === name &&
  //         child.endpoint.connectedCE === connectedCE)?.endpoint as Viewport
  //       ?? null;
  //     if ((viewport ?? null) !== null) {
  //       viewport.enabled = true;
  //     }
  //   }
  //   if ((viewport ?? null) === null) {
  //     viewport = new Viewport(this.router, name, connectedCE, this.scope, !!options.scope, options);
  //     this.addChild(viewport.connectedScope);
  //   }
  //   if ((connectedCE ?? null) !== null) {
  //     viewport!.setConnectedCE(connectedCE!, options);
  //   }
  //   return viewport!;
  // }
  // public removeViewport(step: Step | null, viewport: Viewport, connectedCE: IConnectedCustomElement | null): boolean {
  //   if (((connectedCE ?? null) !== null) || viewport.remove(step, connectedCE)) {
  //     this.removeChild(viewport.connectedScope);
  //     return true;
  //   }
  //   return false;
  // }
  public removeEndpoint(step: Step | null, endpoint: Endpoint, connectedCE: IConnectedCustomElement | null): boolean {
    if (((connectedCE ?? null) !== null) || endpoint.removeEndpoint(step, connectedCE)) {
      this.removeChild(endpoint.connectedScope);
      return true;
    }
    return false;
  }
  // public addViewportScope(name: string, connectedCE: IConnectedCustomElement | null, options: IViewportScopeOptions = {}): ViewportScope {
  //   const viewportScope = new ViewportScope(name, this.router, connectedCE, this.scope, true, null, options);
  //   this.addChild(viewportScope.connectedScope);
  //   return viewportScope;
  // }
  // public removeViewportScope(viewportScope: ViewportScope): boolean {
  //   // viewportScope.remove();
  //   this.removeChild(viewportScope.connectedScope);
  //   return true;
  // }

  public addChild(scope: RoutingScope): void {
    if (!this.children.some(vp => vp === scope)) {
      if (scope.parent !== null) {
        scope.parent.removeChild(scope);
      }
      this.children.push(scope);
      scope.parent = this;
    }
  }
  public removeChild(scope: RoutingScope): void {
    const index = this.children.indexOf(scope);
    if (index >= 0) {
      this.children.splice(index, 1);
      scope.parent = null;
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

  // public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
  //   return this.allScopes(includeDisabled, includeReplaced).filter(scope => scope.isViewport).map(scope => scope.endpoint!);
  // }

  public allScopes(includeDisabled: boolean = false, includeReplaced: boolean = false): RoutingScope[] {
    const scopes: RoutingScope[] = includeDisabled ? this.children.slice() : this.enabledChildren;
    for (const scope of scopes.slice()) {
      scopes.push(...scope.allScopes(includeDisabled, includeReplaced));
    }
    return scopes;
  }

  public reparentRoutingInstructions(): RoutingInstruction[] | null {
    const scopes = this.hoistedChildren
      .filter(scope => scope.routingInstruction !== null && scope.routingInstruction.component.name);
    if (!scopes.length) {
      return null;
    }
    for (const scope of scopes) {
      const childInstructions = scope.reparentRoutingInstructions();
      scope.routingInstruction!.nextScopeInstructions =
        childInstructions !== null && childInstructions.length > 0 ? childInstructions : null;
    }
    return scopes.map(scope => scope.routingInstruction!);
  }

  public findMatchingRoute(path: string): FoundRoute | null {
    if (this.isViewportScope && !this.passThroughScope) {
      return this.findMatchingRouteInRoutes(path, this.endpoint.getRoutes());
    }
    if (this.isViewport) {
      return this.findMatchingRouteInRoutes(path, this.endpoint!.getRoutes());
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

  public canUnload(step: Step<boolean> | null): boolean | Promise<boolean> {
    // console.log('canUnload', step.path);
    return Runner.run(step,
      () => {
        return Runner.runParallel(null,
          ...this.children.map(child => {
            return child.endpoint !== null
              ? (childStep: Step<boolean>) => child.endpoint!.canUnload(childStep)
              : (childStep: Step<boolean>) => child.canUnload(childStep);
          }));
      },
      (step: Step<boolean>) => step.previousValue ?? [], // Propagate to next, resolving promise if necessary
      (step: Step<boolean>) => {
        if (step.previousValue == null) { debugger; }
        return (step.previousValue as boolean[]).every(result => result);
      }
    ) as boolean | Promise<boolean>;
  }

  public unload(step: Step<void> | null, recurse: boolean): Step<void> {
    return Runner.runParallel(step,
      ...this.children.map(child => child.endpoint !== null
        ? (step: Step<void>) => child.endpoint!.unload(step, recurse)
        : (step: Step<void>) => child.unload(step, recurse))) as Step<void>;
  }

  private findMatchingRouteInRoutes(path: string, routes: Route[] | null): FoundRoute | null {
    if (!Array.isArray(routes)) {
      return null;
    }

    routes = routes.map(route => this.ensureProperRoute(route));
    const cRoutes: IConfigurableRoute[] = routes.map(route => ({
      path: route.path,
      handler: route,
    }));
    for (let i = 0, ii = cRoutes.length; i < ii; ++i) {
      const cRoute = cRoutes[i];
      cRoutes.push({
        ...cRoute,
        path: `${cRoute.path}/*remainingPath`,
      });
    }

    const found = new FoundRoute();
    if (path.startsWith('/') || path.startsWith('+')) {
      path = path.slice(1);
    }
    const recognizer = new RouteRecognizer();

    recognizer.add(cRoutes);
    const result = recognizer.recognize(path);
    if (result !== null) {
      found.match = result.endpoint.route.handler;
      found.matching = path;
      const $params = { ...result.params };
      if ($params.remainingPath !== void 0) {
        found.remaining = $params.remainingPath;
        Reflect.deleteProperty($params, 'remainingPath');
        found.matching = found.matching.slice(0, found.matching.indexOf(found.remaining));
      }
      found.params = $params;
      if (found.match.redirectTo !== null) {
        let redirectedTo = found.match.redirectTo;
        if ((found.remaining ?? '').length > 0) {
          redirectedTo += `/${found.remaining}`;
        }
        return this.findMatchingRouteInRoutes(redirectedTo, routes);
      }
    }
    if (found.foundConfiguration) {
      // clone it so config doesn't get modified
      found.instructions = this.router.instructionResolver.cloneRoutingInstructions(found.match!.instructions as RoutingInstruction[], false, true);
      const instructions = found.instructions.slice();
      while (instructions.length > 0) {
        const instruction = instructions.shift()!;
        instruction.parameters.addParameters(found.params);
        instruction.route = '';
        if (instruction.nextScopeInstructions !== null) {
          instructions.unshift(...instruction.nextScopeInstructions);
        }
      }
      if (found.instructions.length > 0) {
        found.instructions[0].route = found;
      }
    }
    return found;
  }

  private ensureProperRoute(route: IRoute): Route {
    if (route.id === void 0) {
      route.id = route.path;
    }
    if (route.instructions === void 0) {
      route.instructions = [{
        component: route.component!,
        viewport: route.viewport,
        parameters: route.parameters,
        children: route.children,
      }];
    }
    if (route.redirectTo === null) {
      route.instructions = LoadInstructionResolver.toRoutingInstructions(this.router, route.instructions!);
    }
    return route as Route;
  }
}
