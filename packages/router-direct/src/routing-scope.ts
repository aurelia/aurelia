/* eslint-disable prefer-template */
import { NavigationCoordinator } from './navigation-coordinator';
import { IViewportScopeOptions, ViewportScope } from './endpoints/viewport-scope';
import { CustomElement, ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { FoundRoute } from './found-route';
import { IRouter } from './router';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Viewport } from './endpoints/viewport';
import { IViewportOptions } from './endpoints/viewport-options';
import { IConfigurableRoute, RouteRecognizer } from './route-recognizer';
import { Runner, Step } from './utilities/runner';
import { IRoute, Route } from './route';
import { Endpoint, EndpointTypeName, IConnectedCustomElement } from './endpoints/endpoint';
import { EndpointMatcher } from './endpoint-matcher';
import { EndpointContent, Router } from './index';
import { IContainer } from '@aurelia/kernel';
import { arrayUnique } from './utilities/utils';
import { Parameters } from './instructions/instruction-parameters';
import { Separators } from './router-options';

export type TransitionAction = 'skip' | 'reload' | 'swap' | '';

/**
 * The router uses routing scopes to organize all endpoints (viewports and viewport
 * scopes) into two hierarchical structures. Each routing scope belongs to a parent/child
 * hierarchy, that follows the DOM and is used when routing scopes are added and removed,
 * and an owner/owning hierarchy that's used when finding endpoints. Every routing scope
 * has a routing scope that owns it (except the root) and can in turn have several
 * routing scopes that it owns. A routing scope always has a connected endpoint content
 * and an endpoint content always has a connected routing scope.
 *
 * Every navigtion/load instruction that the router processes is first tied to a
 * routing scope, either a specified scope or the root scope. That routing scope is
 * then asked to
 * 1a) find routes (and their routing instructions) in the load instruction based on
 * the endpoint and its content (configured routes), and/or
 * 1b) find (direct) routing instructions in the load instruction.
 *
 * After that, the routing scope is used to
 * 2) match each of its routing instructions to an endpoint (viewport or viewport scope), and
 * 3) set the scope of the instruction to the next routing scopes ("children") and pass
 * the instructions on for matching in their new routing scopes.
 *
 * Once (component) transitions start in endpoints, the routing scopes assist by
 * 4) propagating routing hooks vertically through the hierarchy and disabling and
 * enabling endpoint contents and their routing data (routes) during transitions.
 *
 * Finally, when a navigation is complete, the routing scopes helps
 * 5) structure all existing routing instructions into a description of the complete
 * state of all the current endpoints and their contents.
 *
 * The hierarchy of the owner/owning routing scopes often follows the parent/child DOM
 * hierarchy, but it's not a necessity; it's possible to have routing scopes that doesn't
 * create their own "owning capable scope", and thus placing all their "children" under the
 * same "parent" as themselves or for a routing scope to hoist itself up or down in the
 * hierarchy and, for example, place itself as a "child" to a DOM sibling endpoint.
 * (Scope self-hoisting will not be available for early-on alpha.)
 */

export class RoutingScope {
  /** @internal */
  private static lastId = 0;

  public id = ++RoutingScope.lastId;

  /**
   * The parent of the routing scope (parent/child hierarchy)
   */
  public parent: RoutingScope | null = null;
  /**
   * The children of the routing scope (parent/child hierarchy)
   */
  public children: RoutingScope[] = [];

  public readonly router: IRouter;
  /**
   * Whether the routing scope has a scope and can own other scopes
   */
  public readonly hasScope: boolean;

  /**
   * The routing scope that owns this routing scope (owner/owning hierarchy)
   */
  public owningScope: RoutingScope | null;

  /**
   * The endpoint content the routing scope is connected to
   */
  public endpointContent: EndpointContent;

  public constructor(
    router: IRouter,
    /**
     * Whether the routing scope has a scope and can own other scopes
     */
    hasScope: boolean,

    /**
     * The routing scope that owns this routing scope (owner/owning hierarchy)
     */
    owningScope: RoutingScope | null,

    /**
     * The endpoint content the routing scope is connected to
     */
    endpointContent: EndpointContent,
  ) {
    this.router = router;
    this.hasScope = hasScope;
    this.owningScope = owningScope ?? this;
    this.endpointContent = endpointContent;
  }

  public static for(
    origin: Element | ICustomElementViewModel | Viewport | ViewportScope | RoutingScope | ICustomElementController | IContainer | null,
    instruction?: string
  ): { scope: RoutingScope | null; instruction: string | undefined } {

    if (origin == null) {
      return { scope: null, instruction };
    }
    if (origin instanceof RoutingScope || origin instanceof Viewport || origin instanceof ViewportScope) {
      return { scope: origin.scope, instruction };
    }
    // return this.getClosestScope(origin) || this.rootScope!.scope;
    let container: IContainer | null | undefined;

    // res is a private prop of IContainer impl
    // TODO: should use a different way to detect if something is a container
    // or move this to the bottom if this else-if
    if ('res' in origin) {
      container = origin as IContainer;
    } else {
      if ('container' in origin) {
        container = origin.container;
      } else if ('$controller' in origin) {
        container = origin.$controller!.container;
      } else {
        const controller = CustomElement.for(origin as Node, { searchParents: true });
        container = controller?.container;
      }
    }
    if (container == null) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("RoutingScope failed to find a container for provided origin", origin);
      }
      return { scope: null, instruction };
    }
    const closestEndpoint = (container.has(Router.closestEndpointKey, true)
      ? container.get(Router.closestEndpointKey)
      : null) as Endpoint | null;

    let scope = closestEndpoint?.scope ?? null;

    if (scope === null || instruction === undefined) {
      const safeInstruction = instruction ?? '';
      return { scope, instruction: safeInstruction.startsWith('/') ? safeInstruction.slice(1) : instruction };
    }

    // Instruction specifies from root scope
    if (instruction.startsWith('/')) {
      return { scope: null, instruction: instruction.slice(1) };
    }
    // Instruction specifies scope traversals
    while (instruction.startsWith('.')) {
      // The same as no scope modification
      if (instruction.startsWith('./')) {
        instruction = instruction.slice(2);
      } else if (instruction.startsWith('../')) { // Traverse upwards
        scope = scope.parent ?? scope;
        instruction = instruction.slice(3);
      } else { // Bad traverse instruction
        break;
      }
    }
    // Testing without this since it seems to be removed
    // if (scope?.path != null) {
    //   instruction = `${scope.path}/${instruction}`;
    //   scope = null; // scope.root;
    // }
    return { scope, instruction };
  }

  /**
   * The routing scope children to this scope are added to. If this routing
   * scope has scope, this scope property equals this scope itself. If it
   * doesn't have scope this property equals the owning scope. Using this
   * ensures that routing scopes that don't have a their own scope aren't
   * part of the owner/owning hierarchy.
   */
  public get scope(): RoutingScope {
    return this.hasScope ? this : this.owningScope!.scope;
  }
  public get endpoint(): Endpoint {
    return this.endpointContent.endpoint;
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

  public get enabled(): boolean {
    return this.endpointContent.isActive;
  }

  public get passThroughScope(): boolean {
    return this.isViewportScope && (this.endpoint as ViewportScope).passThroughScope;
  }

  public get pathname(): string {
    return `${this.owningScope !== this ? this.owningScope!.pathname : ''}/${this.endpoint.name}`;
  }

  public get path(): string {
    const parentPath = this.parent?.path ?? '';
    const path = this.routingInstruction?.stringify(this.router, { endpointContext: true }, true) ?? '';
    const sep = this.routingInstruction ? Separators.for(this.router).scope : '';
    return `${parentPath}${path}${sep}`;
  }

  public toString(recurse = false): string {
    return `${this.owningScope !== this ? this.owningScope!.toString() : ''}/${!this.enabled ? '(' : ''}${this.endpoint.toString()}#${this.id}${!this.enabled ? ')' : ''}` +
      `${recurse ? `\n` + this.children.map(child => child.toString(true)).join('') : ''}`;
  }

  public toStringOwning(recurse = false): string {
    return `${this.owningScope !== this ? this.owningScope!.toString() : ''}/${!this.enabled ? '(' : ''}${this.endpoint.toString()}#${this.id}${!this.enabled ? ')' : ''}` +
      `${recurse ? `\n` + this.ownedScopes.map(child => child.toStringOwning(true)).join('') : ''}`;
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
  public get ownedScopes(): RoutingScope[] {
    return this.getOwnedScopes();
  }

  public get routingInstruction(): RoutingInstruction | null {
    if (this.endpoint.isViewportScope) {
      return (this.endpoint as ViewportScope).instruction;
    }
    if (this.isViewport) {
      return (this.endpoint as Viewport).activeContent.instruction;
    }
    return null;
  }

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

  public findInstructions(instructions: RoutingInstruction[], useDirectRouting: boolean, useConfiguredRoutes: boolean): FoundRoute {
    const router = this.router;
    let route = new FoundRoute();

    if (useConfiguredRoutes && !RoutingInstruction.containsSiblings(router, instructions)) {
      let clearInstructions = instructions.filter(instruction => instruction.isClear(router) || instruction.isClearAll(router));
      const nonClearInstructions = instructions.filter(instruction => !instruction.isClear(router) && !instruction.isClearAll(router));

      // As long as the sibling constraint (above) is in, this will only be at most one instruction
      if (nonClearInstructions.length > 0) {
        for (const instruction of nonClearInstructions) {
          const idOrPath = typeof instruction.route === 'string'
            ? instruction.route
            : instruction.unparsed ?? RoutingInstruction.stringify(router, [instruction]);
          const foundRoute = this.findMatchingRoute(idOrPath, instruction.parameters.parametersRecord ?? {});
          if (foundRoute.foundConfiguration) {
            route = foundRoute!;
            route.instructions = [...clearInstructions, ...route.instructions];
            clearInstructions = [];
          } else if (useDirectRouting) {
            route.instructions = [...clearInstructions, ...route.instructions, instruction];
            clearInstructions = [];
            route.remaining = RoutingInstruction.stringify(router, instruction.nextScopeInstructions ?? []);
          } else {
            throw new Error(`No route found for: ${RoutingInstruction.stringify(router, instructions)}!`);
          }
        }
      } else {
        route.instructions = [...clearInstructions];
      }
    } else if (useDirectRouting) {
      route.instructions.push(...instructions);
    } else {
      throw new Error(`No way to process sibling viewport routes with direct routing disabled: ${RoutingInstruction.stringify(router, instructions)}!`);
    }

    // Remove empty instructions so that default can be used
    route.instructions = route.instructions.filter(instr => instr.component.name !== '');

    for (const instruction of route.instructions) {
      if (instruction.scope === null) {
        instruction.scope = this;
      }
    }

    return route;
  }

  // Note: This can't change state other than the instructions!
  /**
   * Match the instructions to available endpoints within, and with the help of, their scope.
   *
   * @param instructions - The instructions to matched
   * @param alreadyFound - The already found matches
   * @param disregardViewports - Whether viewports should be ignored when matching
   */
  public matchEndpoints(instructions: RoutingInstruction[], alreadyFound: RoutingInstruction[], disregardViewports: boolean = false): { matchedInstructions: RoutingInstruction[]; remainingInstructions: RoutingInstruction[] } {
    const allMatchedInstructions: RoutingInstruction[] = [];
    const scopeInstructions = instructions.filter(instruction => (instruction.scope ?? this) === this);
    const allRemainingInstructions = instructions.filter(instruction => (instruction.scope ?? this) !== this);

    const { matchedInstructions, remainingInstructions } = EndpointMatcher.matchEndpoints(this, scopeInstructions, alreadyFound, disregardViewports);
    allMatchedInstructions.push(...matchedInstructions);
    allRemainingInstructions.push(...remainingInstructions);

    return { matchedInstructions: allMatchedInstructions, remainingInstructions: allRemainingInstructions };
  }

  public addEndpoint(type: EndpointTypeName, name: string, connectedCE: IConnectedCustomElement | null, options: IViewportOptions | IViewportScopeOptions = {}): Viewport | ViewportScope {
    let endpoint: Endpoint | null = this.getOwnedScopes()
      .find(scope => scope.type === type &&
        scope.endpoint.name === name)?.endpoint ?? null;

    // Each endpoint element has its own Endpoint
    if (connectedCE != null && endpoint?.connectedCE != null && endpoint.connectedCE !== connectedCE) {
      endpoint = this.getOwnedScopes(true)
        .find(scope => scope.type === type &&
          scope.endpoint.name === name &&
          scope.endpoint.connectedCE === connectedCE)?.endpoint
        ?? null;
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

  public removeEndpoint(step: Step | null, endpoint: Endpoint, connectedCE: IConnectedCustomElement | null): boolean {
    if (((connectedCE ?? null) !== null) || endpoint.removeEndpoint(step, connectedCE)) {
      this.removeChild(endpoint.connectedScope);
      return true;
    }
    return false;
  }

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

  public allScopes(includeDisabled: boolean = false): RoutingScope[] {
    const scopes: RoutingScope[] = includeDisabled ? this.children.slice() : this.enabledChildren;
    for (const scope of scopes.slice()) {
      scopes.push(...scope.allScopes(includeDisabled));
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

  public getChildren(timestamp: number): RoutingScope[] {
    const contents = this.children
      .map(scope => scope.endpoint.getTimeContent(timestamp))
      .filter(content => content !== null) as EndpointContent[];
    return contents.map(content => content.connectedScope);
  }

  public getAllRoutingScopes(timestamp: number): RoutingScope[] {
    const scopes = this.getChildren(timestamp);
    for (const scope of scopes.slice()) {
      scopes.push(...scope.getAllRoutingScopes(timestamp));
    }
    return scopes;
  }

  public getOwnedRoutingScopes(timestamp: number): RoutingScope[] {
    const scopes = this.getAllRoutingScopes(timestamp)
      .filter(scope => scope.owningScope === this);
    // Hoist children to pass through scopes
    for (const scope of scopes.slice()) {
      if (scope.passThroughScope) {
        const passThrough = scopes.indexOf(scope);
        scopes.splice(passThrough, 1, ...scope.getOwnedRoutingScopes(timestamp));
      }
    }
    return arrayUnique(scopes);
  }

  public getRoutingInstructions(timestamp: number): RoutingInstruction[] | null {
    const contents = arrayUnique(
      this.getOwnedRoutingScopes(timestamp) // hoistedChildren
        .map(scope => scope.endpoint)
    )
      .map(endpoint => endpoint.getTimeContent(timestamp))
      .filter(content => content !== null) as EndpointContent[];
    const instructions = [];

    for (const content of contents) {
      const instruction = content.instruction.clone(true, false, false);
      if ((instruction.component.name ?? '') !== '') {
        instruction.nextScopeInstructions = content.connectedScope.getRoutingInstructions(timestamp);
        instructions.push(instruction);
      }
    }
    return instructions;
  }

  public canUnload(coordinator: NavigationCoordinator, step: Step<boolean> | null): boolean | Promise<boolean> {
    return Runner.run(step,
      (stepParallel: Step<boolean>) => {
        return Runner.runParallel(stepParallel,
          ...this.children.map(child => child.endpoint !== null
            ? (childStep: Step<boolean>) => child.endpoint.canUnload(coordinator, childStep)
            : (childStep: Step<boolean>) => child.canUnload(coordinator, childStep)
          ));
      },
      (step: Step<boolean>) => (step.previousValue as boolean[]).every(result => result ?? true)) as boolean | Promise<boolean>;
  }

  public unload(coordinator: NavigationCoordinator, step: Step<void> | null): Step<void> {
    return Runner.runParallel(step,
      ...this.children.map(child => child.endpoint !== null
        ? (childStep: Step<void>) => child.endpoint.unload(coordinator, childStep)
        : (childStep: Step<void>) => child.unload(coordinator, childStep)
      )) as Step<void>;
  }

  public matchScope(instructions: RoutingInstruction[], deep = false): RoutingInstruction[] {
    const matching: RoutingInstruction[] = [];

    for (const instruction of instructions) {
      if (instruction.scope === this) {
        matching.push(instruction);
      } else if (deep && instruction.hasNextScopeInstructions) {
        matching.push(...this.matchScope(instruction.nextScopeInstructions!, deep));
      }
    }
    return matching;
  }

  public findMatchingRoute(path: string, parameters: Parameters): FoundRoute {
    let found: FoundRoute = new FoundRoute();
    if (this.isViewportScope && !this.passThroughScope) {
      found = this.findMatchingRouteInRoutes(path, this.endpoint.getRoutes(), parameters);
    } else if (this.isViewport) {
      found = this.findMatchingRouteInRoutes(path, this.endpoint.getRoutes(), parameters);
    } else {
      for (const child of this.enabledChildren) {
        found = child.findMatchingRoute(path, parameters);
        if (found.foundConfiguration) {
          break;
        }
      }
    }

    if (found.foundConfiguration) {
      return found;
    }

    if (this.parent != null) {
      return this.parent.findMatchingRoute(path, parameters);
    }

    return found;
  }

  private findMatchingRouteInRoutes(path: string, routes: Route[], parameters: Parameters): FoundRoute {
    const found = new FoundRoute();
    if (routes.length === 0) {
      return found;
    }

    routes = routes.map(route => this.ensureProperRoute(route));

    const cRoutes: IConfigurableRoute[] = [];
    for (const route of routes) {
      const paths = (Array.isArray(route.path) ? route.path : [route.path]);
      for (const path of paths) {
        cRoutes.push({
          ...route,
          path,
          handler: route,
        });
        if (path !== '') {
          cRoutes.push({
            ...route,
            path: `${path}/*remainingPath`,
            handler: route,
          });
        }
      }
    }

    if (path.startsWith('/') || path.startsWith('+')) {
      path = path.slice(1);
    }

    const idRoute = routes.find(route => route.id === path);
    let result = { params: {}, endpoint: {} } as any;
    if (idRoute != null) {
      result.endpoint = { route: { handler: idRoute } };
      path = Array.isArray(idRoute.path) ? idRoute.path[0] : idRoute.path;
      const segments = path.split('/').map(segment => {
        if (segment.startsWith(':')) {
          const name = segment.slice(1).replace(/\?$/, '');
          const param = parameters[name];
          result.params[name] = param;
          return param;
        } else {
          return segment;
        }
      });
      path = segments.join('/');
    } else {
      const recognizer = new RouteRecognizer();

      recognizer.add(cRoutes);
      result = recognizer.recognize(path);
    }
    if (result != null) {
      found.match = result.endpoint.route.handler;
      found.matching = path;
      const $params = { ...result.params };
      if ($params.remainingPath != null) {
        found.remaining = $params.remainingPath;
        Reflect.deleteProperty($params, 'remainingPath');
        found.matching = found.matching.slice(0, found.matching.indexOf(found.remaining));
      }
      found.params = $params;
      if (found.match?.redirectTo != null) {
        let redirectedTo = found.match?.redirectTo;
        if ((found.remaining ?? '').length > 0) {
          redirectedTo += `/${found.remaining}`;
        }
        return this.findMatchingRouteInRoutes(redirectedTo, routes, parameters);
      }
    }
    if (found.foundConfiguration) {
      // clone it so config doesn't get modified
      found.instructions = RoutingInstruction.clone(found.match!.instructions as RoutingInstruction[], false, true);
      const instructions = found.instructions.slice();
      while (instructions.length > 0) {
        const instruction = instructions.shift()!;
        instruction.parameters.addParameters(found.params);
        instruction.route = found;
        if (instruction.hasNextScopeInstructions) {
          instructions.unshift(...instruction.nextScopeInstructions!);
        }
      }
      if (found.instructions.length > 0) {
        found.instructions[0].routeStart = true;
      }

      const remaining = RoutingInstruction.parse(this.router, found.remaining);
      if (remaining.length > 0) {
        let lastInstruction = found.instructions[0];
        while (lastInstruction.hasNextScopeInstructions) {
          lastInstruction = lastInstruction.nextScopeInstructions![0];
        }
        lastInstruction.nextScopeInstructions = remaining;
      }
    }
    return found;
  }

  private ensureProperRoute(route: IRoute): Route {
    if (route.id === void 0) {
      route.id = Array.isArray(route.path) ? route.path.join(',') : route.path;
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
      route.instructions = RoutingInstruction.from(this.router, route.instructions!);
    }
    return route as Route;
  }
}
