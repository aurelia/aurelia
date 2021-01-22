/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IViewportScopeOptions, ViewportScope } from './viewport-scope.js';
import { CustomElement, CustomElementType, getEffectiveParentNode, ICustomElementController, ICustomElementViewModel, INode } from '@aurelia/runtime-html';
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
import { EndpointContent, Router } from './index.js';
import { IContainer, Metadata } from '@aurelia/kernel';

export type NextContentAction = 'skip' | 'reload' | 'swap' | '';

/**
 * The router uses routing scopes to organize all endpoints (viewports and viewport
 * scopes) into a hierarchical structure. Each routing scope belongs to a parent/owner
 * routing scope (except the root, that has no parent) and can in turn have several
 * routing scopes that it owns. A routing scope always has a connected endpoint. (And
 * an endpoint always has a connected routing scope.)
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
 * enabling endpoints and their routing data (routes) during transitions.
 *
 * Finally, when a navigation is complete, the routing scopes helps
 * 5) structure all existing routing instructions into a description of the complete
 * state of all the current endpoints and their contents.
 *
 * The hierarchy of the routing scopes often follows the DOM hierarchy, but it's not
 * a necessity; it's possible to have routing scopes that doesn't create their own
 * "owning capable scope", and thus placing all their "children" under the same "parent"
 * as themselves or for a routing scope to hoist itself up or down in the hierarchy and,
 * for example, place itself as a "child" to a DOM sibling endpoint. (Scope self-hoisting
 * will not be available for early-on alpha.)
 */

export class RoutingScope {
  public static lastId = 0;

  public id = -1;
  public scope: RoutingScope;

  public parent: RoutingScope | null = null;
  public children: RoutingScope[] = [];
  public replacedChildren: RoutingScope[] = [];
  public path: string | null = null;

  // public enabled: boolean = true;

  // Support collection feature in viewport scopes
  public childCollections: Record<string, unknown[]> = {};

  public constructor(
    public readonly router: IRouter,
    public readonly hasScope: boolean,
    public owningScope: RoutingScope | null,
    public endpointContent: EndpointContent,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
  ) {
    this.id = ++RoutingScope.lastId;
    this.owningScope = owningScope ?? this;
    this.scope = this.hasScope ? this : this.owningScope.scope;
    // setInterval(() => { console.log(this.toString(this.parent === null)); }, 10000);
  }

  public static for(origin: Element | ICustomElementViewModel | Viewport | ViewportScope | RoutingScope | ICustomElementController | IContainer | null): RoutingScope | null {
    if (origin == null) {
      return null;
    }
    if (origin instanceof RoutingScope || origin instanceof Viewport || origin instanceof ViewportScope) {
      return origin.scope;
    }
    // return this.getClosestScope(origin) || this.rootScope!.scope;
    let container: IContainer | null | undefined;

    if ('resourceResolvers' in origin) {
      container = origin;
    } else {
      if ('context' in origin) {
        container = origin.context;
      } else if ('$controller' in origin) {
        container = origin.$controller!.context;
      } else {
        const controller = RoutingScope.CustomElementFor(origin as Node);
        container = controller?.context;
      }
    }
    if (container == null) {
      return null;
    }
    const closestEndpoint = (container.has(Router.closestEndpointKey, true)
      ? container.get(Router.closestEndpointKey)
      : null) as Endpoint | null;
    return closestEndpoint?.scope ?? null;
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
    return `${this.owningScope !== this ? this.owningScope!.pathname : ''}/${this.endpoint!.name}`;
  }

  public toString(recurse = false): string {
    return `${this.owningScope !== this ? this.owningScope!.toString() : ''}/${!this.enabled ? '(' : ''}${this.endpoint!.toString()}#${this.id}${!this.enabled ? ')' : ''}` +
      // eslint-disable-next-line prefer-template
      `${recurse ? `\n` + this.children.map(child => child.toString(true)).join('') : ''}`;
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
      const instructions = RoutingInstruction.parse(instruction);
      if (RouterOptions.useConfiguredRoutes && !RoutingInstruction.containsSiblings(instructions)) {
        const foundRoute = this.findMatchingRoute(instruction);
        if (foundRoute?.foundConfiguration ?? false) {
          route = foundRoute!;
        } else {
          if (RouterOptions.useDirectRoutes) {
            route.instructions = instructions;
            if (route.instructions.length > 0) {
              const nextInstructions = route.instructions[0].nextScopeInstructions ?? [];
              route.remaining = RoutingInstruction.stringify(nextInstructions);
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
      // e: endpoint.enabled = false;
      endpoint = this.getOwnedScopes(true)
        .find(scope => scope.type === type &&
          scope.endpoint.name === name &&
          scope.endpoint.connectedCE === connectedCE)?.endpoint
        ?? null;
      if (endpoint != null) {
        // e: endpoint.enabled = true;
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

  public clearReplacedChildren(): void {
    this.replacedChildren = [];
  }
  public disableReplacedChildren(): void {
    this.replacedChildren = this.enabledChildren;
    for (const scope of this.replacedChildren) {
      // e: scope.enabled = false;
    }
  }
  public reenableReplacedChildren(): void {
    for (const scope of this.replacedChildren) {
      // e: scope.enabled = true;
    }
  }

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

  public canUnload(step: Step<boolean> | null): boolean | Promise<boolean> {
    // console.log('canUnload', this.toString(), step!.path, step!.root.report);
    return Runner.run(step,
      (stepParallel: Step<boolean>) => {
        return Runner.runParallel(stepParallel,
          ...this.children.map(child => child.endpoint !== null
            ? (childStep: Step<boolean>) => child.endpoint!.canUnload(childStep)
            : (childStep: Step<boolean>) => child.canUnload(childStep)
          ));
      },
      (step: Step<boolean>) => (step.previousValue as boolean[]).every(result => result)) as boolean | Promise<boolean>;
  }

  public unload(step: Step<void> | null, recurse: boolean, transitionId: number): Step<void> {
    // console.log('unload routing scope', this.toString(), step!.path, step!.root.report);
    return Runner.runParallel(step,
      ...this.children.map(child => child.endpoint !== null
        ? (childStep: Step<void>) => child.endpoint.unload(childStep, recurse, transitionId)
        : (childStep: Step<void>) => child.unload(childStep, recurse, transitionId)
      )) as Step<void>;
  }

  public matchScope(instructions: RoutingInstruction[], deep = false): RoutingInstruction[] {
    const matching: RoutingInstruction[] = [];

    // matching.push(...instructions.filter(instruction => instruction.scope === this));
    // matching.push(...instructions
    //   .filter(instr => instr.scope !== this)
    //   .map(instr => Array.isArray(instr.nextScopeInstructions) ? this.matchScope(instr.nextScopeInstructions) : [])
    //   .flat());
    for (const instruction of instructions) {
      if (instruction.scope === this) {
        matching.push(instruction);
      } else if (deep && instruction.hasNextScopeInstructions) {
        matching.push(...this.matchScope(instruction.nextScopeInstructions!, deep));
      }
    }
    return matching;
  }

  // public matchChildren(instructions: RoutingInstruction[], active: RoutingInstruction[]): boolean {
  //   for (const instruction of instructions) {
  //     const matching = active.filter(instr => instr.sameComponent(instruction));
  //     if (matching.length === 0) {
  //       return false;
  //     }
  //     if (Array.isArray(instruction.nextScopeInstructions)
  //       && instruction.nextScopeInstructions.length > 0
  //       && this.matchChildren(
  //         instruction.nextScopeInstructions,
  //         matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()
  //       ) === false) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  public findMatchingRoute(path: string): FoundRoute | null {
    if (this.isViewportScope && !this.passThroughScope) {
      return this.findMatchingRouteInRoutes(path, this.endpoint.getRoutes());
    }
    if (this.isViewport) {
      return this.findMatchingRouteInRoutes(path, this.endpoint.getRoutes());
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
      found.instructions = RoutingInstruction.clone(found.match!.instructions as RoutingInstruction[], false, true);
      const instructions = found.instructions.slice();
      while (instructions.length > 0) {
        const instruction = instructions.shift()!;
        instruction.parameters.addParameters(found.params);
        instruction.route = '';
        if (instruction.hasNextScopeInstructions) {
          instructions.unshift(...instruction.nextScopeInstructions!);
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
      route.instructions = LoadInstructionResolver.toRoutingInstructions(route.instructions!);
    }
    return route as Route;
  }

    // TODO: This is probably wrong since it caused test fails when in CustomElement.for
  // Fred probably knows and will need to look at it
  // This can most likely also be changed so that the node traversal isn't necessary
  private static CustomElementFor(node: INode): ICustomElementController | undefined {
    let cur: INode | null = node;
    while (cur !== null) {
      const nodeResourceName: string = (cur as Element).nodeName.toLowerCase();
      const controller: ICustomElementController = Metadata.getOwn(CustomElement.name + ":" + nodeResourceName, cur)
        || Metadata.getOwn(CustomElement.name, cur);
      if (controller !== void 0) {
        return controller;
      }
      cur = getEffectiveParentNode(cur);
    }
    return (void 0);
  }
}
