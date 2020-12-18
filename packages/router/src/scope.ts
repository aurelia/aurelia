/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IViewportScopeOptions, ViewportScope } from './viewport-scope.js';
import { CustomElementType } from '@aurelia/runtime-html';
import { LoadInstruction } from './interfaces.js';
import { FoundRoute } from './found-route.js';
import { IRouter } from './router.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { LoadInstructionResolver } from './type-resolvers.js';
import { Viewport, IViewportOptions } from './viewport.js';
import { arrayRemove } from './utils.js';
import { Collection } from './collection.js';
import { IConfigurableRoute, RouteRecognizer } from './route-recognizer.js';
import { Navigation } from './navigation.js';
import { NavigationCoordinator } from './navigation-coordinator.js';
import { Runner, Step } from './runner.js';
import { IRoute, Route } from './route.js';
import { IConnectedCustomElement } from './endpoints/endpoint.js';

export type NextContentAction = 'skip' | 'reload' | 'swap' | '';

/**
 * @internal - Shouldn't be used directly
 */
export interface IFindViewportsResult {
  foundViewports: RoutingInstruction[];
  remainingInstructions: RoutingInstruction[];
}

/**
 * @internal - Shouldn't be used directly
 */
export interface IScopeOwnerOptions {
  noHistory?: boolean;
}

/**
 * @internal - Shouldn't be used directly
 */
export interface IScopeOwner {
  readonly name: string;
  readonly connectedScope: Scope;
  readonly scope: Scope;
  readonly owningScope: Scope | null;
  enabled: boolean;
  path: string | null;

  options: IScopeOwnerOptions;

  isViewport: boolean;
  isViewportScope: boolean;
  isEmpty: boolean;

  nextContentActivated: boolean;
  parentNextContentActivated: boolean;
  nextContentAction: NextContentAction;

  setNextContent(routingInstruction: RoutingInstruction, navigation: Navigation): NextContentAction;
  transition(coordinator: NavigationCoordinator): void;
  canUnload(step: Step<boolean>): boolean | Promise<boolean>;
  canLoad(step: Step<boolean>, recurse: boolean): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
  load(step: Step<void>, recurse: boolean): void | Step<void>;
  unload(step: Step<void>, recurse: boolean): void | Step<void>;
  // loadContent(): Promise<boolean>;
  finalizeContentChange(): void;
  abortContentChange(step: Step<void> | null): void | Step<void>;

  getRoutes(): Route[] | null;
}

/**
 * @internal - Shouldn't be used directly
 */
export class Scope {
  public id: string = '.';
  public scope: Scope;

  public parent: Scope | null = null;
  public children: Scope[] = [];
  public replacedChildren: Scope[] = [];
  public path: string | null = null;

  public enabled: boolean = true;

  // Support collection feature in viewport scopes
  public childCollections: Record<string, unknown[]> = {};

  public constructor(
    public readonly router: IRouter,
    public readonly hasScope: boolean,
    public owningScope: Scope | null,
    public viewport: Viewport | null = null,
    public viewportScope: ViewportScope | null = null,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
  ) {
    this.owningScope = owningScope ?? this;
    this.scope = this.hasScope ? this : this.owningScope.scope;
    // console.log('Created scope', this.toString());
  }

  public get pathname(): string {
    return `${this.owningScope !== this ? this.owningScope!.pathname : ''}/${this.owner!.name}`;
  }

  public toString(recurse = false): string {
    return `${this.owningScope !== this ? this.owningScope!.toString() : ''}/${this.owner!.toString()}` +
      // eslint-disable-next-line prefer-template
      `${recurse ? `\n` + this.children.map(child => child.toString(true)).join('') : ''}`;
  }

  public get isViewport(): boolean {
    return this.viewport !== null;
  }
  public get isViewportScope(): boolean {
    return this.viewportScope !== null;
  }
  public get passThroughScope(): boolean {
    return this.isViewportScope && this.viewportScope!.passThroughScope;
  }

  public get owner(): IScopeOwner | null {
    if (this.isViewport) {
      return this.viewport as IScopeOwner;
    }
    if (this.isViewportScope) {
      return this.viewportScope as IScopeOwner;
    }
    return null;
  }
  public get enabledChildren(): Scope[] {
    return this.children.filter(scope => scope.enabled);
  }
  public get hoistedChildren(): Scope[] {
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

  public get enabledViewports(): Viewport[] {
    return this.children
      .filter(scope => scope.isViewport && scope.enabled)
      .map(scope => scope.viewport!);
  }

  public get routingInstruction(): RoutingInstruction | null {
    if (this.isViewportScope) {
      return this.viewportScope!.content;
    }
    if (this.isViewport) {
      return this.viewport!.content!.content;
    }
    return null;
  }

  public get parentNextContentAction(): NextContentAction {
    if (this.parent === null) {
      return '';
    }
    const parentAction = this.parent.owner!.nextContentAction;
    if (parentAction === 'swap' || parentAction === 'skip') {
      return parentAction;
    }
    return this.parent.parentNextContentAction;
  }

  public getEnabledViewports(viewportScopes: Scope[]): Record<string, Viewport> {
    return viewportScopes
      .filter(scope => !scope.isViewportScope)
      .map(scope => scope.viewport!)
      .reduce<Record<string, Viewport>>(
        (viewports, viewport) => {
          viewports[viewport.name] = viewport;
          return viewports;
        },
        {}
      );
  }

  public getOwnedViewports(includeDisabled: boolean = false): Viewport[] {
    return this.allViewports(includeDisabled).filter(viewport => viewport.owningScope === this);
  }

  public getOwnedScopes(includeDisabled: boolean = false): Scope[] {
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
      if (this.router.options.useConfiguredRoutes && !this.router.hasSiblingInstructions(instructions)) {
        const foundRoute = this.findMatchingRoute(instruction);
        if (foundRoute?.foundConfiguration ?? false) {
          route = foundRoute!;
        } else {
          if (this.router.options.useDirectRoutes) {
            route.instructions = instructions;
            if (route.instructions.length > 0) {
              const nextInstructions = route.instructions[0].nextScopeInstructions ?? [];
              route.remaining = this.router.instructionResolver.stringifyRoutingInstructions(nextInstructions);
              // TODO: Verify that it's okay to leave this in
              route.instructions[0].nextScopeInstructions = null;
            }
          }
        }
      } else if (this.router.options.useDirectRoutes) {
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
  public findViewports(instructions: RoutingInstruction[], alreadyFound: RoutingInstruction[], disregardViewports: boolean = false): IFindViewportsResult {
    const foundViewports: RoutingInstruction[] = [];
    let remainingInstructions: RoutingInstruction[] = [];

    const ownedScopes = this.getOwnedScopes();
    // Get a shallow copy of all available manual viewport scopes
    const viewportScopes = ownedScopes.filter(scope => scope.isViewportScope).map(scope => scope.viewportScope!);
    const availableViewportScopes = viewportScopes.filter(viewportScope => alreadyFound.every(found => found.viewportScope !== viewportScope));
    // Get a shallow copy of all available viewports
    const availableViewports: Record<string, Viewport | null> = { ...this.getEnabledViewports(ownedScopes) };
    for (const instruction of alreadyFound.filter(found => found.scope === this)) {
      availableViewports[instruction.viewport.name!] = null;
    }

    const routingInstructions = new Collection<RoutingInstruction>(...instructions.slice());
    let instruction: RoutingInstruction | null = null;

    // The viewport scope is already known
    while ((instruction = routingInstructions.next()) !== null) {
      if (instruction.viewportScope !== null && !this.router.instructionResolver.isAddRoutingInstruction(instruction)) {
        remainingInstructions.push(...this.foundViewportScope(instruction, instruction.viewportScope));
        foundViewports.push(instruction);
        arrayRemove(availableViewportScopes, available => available === instruction!.viewportScope);
        routingInstructions.removeCurrent();
      }
    }

    // The viewport is already known
    if (!disregardViewports) {
      while ((instruction = routingInstructions.next()) !== null) {
        if (instruction.viewport.instance !== null) {
          remainingInstructions.push(...this.foundViewport(instruction, instruction.viewport.instance!, disregardViewports));
          foundViewports.push(instruction);
          availableViewports[instruction.viewport.name!] = null;
          routingInstructions.removeCurrent();
        }
      }
    }

    // Viewport scopes have priority
    while ((instruction = routingInstructions.next()) !== null) {
      for (let viewportScope of viewportScopes) {
        if (viewportScope.acceptSegment(instruction.component.name!)) {
          if (Array.isArray(viewportScope.source)) {
            // console.log('available', viewportScope.available, source);
            let available = availableViewportScopes.find(available => available.name === viewportScope.name);
            if (available === void 0 || this.router.instructionResolver.isAddRoutingInstruction(instruction)) {
              const item = viewportScope.addSourceItem();
              available = this.getOwnedScopes()
                .filter(scope => scope.isViewportScope)
                .map(scope => scope.viewportScope!)
                .find(viewportScope => viewportScope.sourceItem === item)!;
            }
            viewportScope = available;
          }
          remainingInstructions.push(...this.foundViewportScope(instruction, viewportScope));
          foundViewports.push(instruction);
          arrayRemove(availableViewportScopes, available => available === instruction!.viewportScope);
          routingInstructions.removeCurrent();
          break;
        }
      }
    }

    // Configured viewport is ruling
    while ((instruction = routingInstructions.next()) !== null) {
      instruction.needsViewportDescribed = true;
      for (const name in availableViewports) {
        const viewport = availableViewports[name];
        // TODO: Also check if (resolved) component wants a specific viewport
        if (viewport?.wantComponent(instruction.component.name!)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[name] = null;
          routingInstructions.removeCurrent();
          break;
        }
      }
    }

    // Next in line is specified viewport (but not if we're disregarding viewports)
    if (!disregardViewports) {
      while ((instruction = routingInstructions.next()) !== null) {
        const name = instruction.viewport.name;
        if (!name || !name.length) {
          continue;
        }
        const newScope = instruction.ownsScope;
        if (!this.getEnabledViewports(ownedScopes)[name]) {
          continue;
          // TODO: No longer pre-creating viewports. Evaluate!
          this.addViewport(name!, null, { scope: newScope, forceDescription: true });
          availableViewports[name!] = this.getEnabledViewports(ownedScopes)[name!];
        }
        const viewport = availableViewports[name];
        if (viewport?.acceptComponent(instruction.component.name!)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[name] = null;
          routingInstructions.removeCurrent();
        }
      }
    }

    // Finally, only one accepting viewport left?
    while ((instruction = routingInstructions.next()) !== null) {
      const remainingViewports: Viewport[] = [];
      for (const name in availableViewports) {
        const viewport = availableViewports[name];
        if (viewport?.acceptComponent(instruction.component.name!)) {
          remainingViewports.push(viewport);
        }
      }
      if (remainingViewports.length === 1) {
        const viewport = remainingViewports.shift()!;
        const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
        foundViewports.push(instruction);
        remainingInstructions.push(...remaining);
        availableViewports[viewport.name] = null;
        routingInstructions.removeCurrent();
      }
    }

    // If we're ignoring viewports, we now match them anyway
    if (disregardViewports) {
      while ((instruction = routingInstructions.next()) !== null) {
        let viewport = instruction.viewport.instance;
        if (!viewport) {
          const name = instruction.viewport.name;
          if ((name?.length ?? 0) === 0) {
            continue;
          }
          const newScope = instruction.ownsScope;
          if (!this.getEnabledViewports(ownedScopes)[name!]) {
            continue;
            // TODO: No longer pre-creating viewports. Evaluate!
            this.addViewport(name!, null, { scope: newScope, forceDescription: true });
            availableViewports[name!] = this.getEnabledViewports(ownedScopes)[name!];
          }
          viewport = availableViewports[name!];
        }
        if (viewport?.acceptComponent(instruction.component.name!)) {
          const remaining = this.foundViewport(instruction, viewport, disregardViewports);
          foundViewports.push(instruction);
          remainingInstructions.push(...remaining);
          availableViewports[viewport.name!] = null;
          routingInstructions.removeCurrent();
        }
      }
    }

    remainingInstructions = [...routingInstructions, ...remainingInstructions];
    return {
      foundViewports,
      remainingInstructions,
    };
  }

  public foundViewportScope(instruction: RoutingInstruction, viewportScope: ViewportScope): RoutingInstruction[] {
    instruction.viewportScope = viewportScope;
    instruction.needsViewportDescribed = false;
    const remaining = instruction.nextScopeInstructions?.slice() ?? [];
    for (const rem of remaining) {
      if (rem.scope === null) {
        rem.scope = viewportScope.scope.scope;
      }
    }
    return remaining;
  }

  public foundViewport(instruction: RoutingInstruction, viewport: Viewport, withoutViewports: boolean, doesntNeedViewportDescribed: boolean = false): RoutingInstruction[] {
    instruction.viewport.set(viewport);
    if (doesntNeedViewportDescribed) {
      instruction.needsViewportDescribed = false;
    }
    const remaining = instruction.nextScopeInstructions?.slice() ?? [];
    for (const rem of remaining) {
      if (rem.scope === null) {
        rem.scope = viewport.scope;
      }
    }
    return remaining;
  }

  public addViewport(name: string, connectedCE: IConnectedCustomElement | null, options: IViewportOptions = {}): Viewport {
    let viewport: Viewport | null = this.getEnabledViewports(this.getOwnedScopes())[name];
    // Each au-viewport element has its own Viewport
    if (((connectedCE ?? null) !== null) &&
      ((viewport?.connectedCE ?? null) !== null) &&
      viewport.connectedCE !== connectedCE) {
      viewport.enabled = false;
      viewport = this.getOwnedViewports(true).find(child => child.name === name && child.connectedCE === connectedCE) ?? null;
      if ((viewport ?? null) !== null) {
        viewport!.enabled = true;
      }
    }
    if ((viewport ?? null) === null) {
      viewport = new Viewport(this.router, name, connectedCE, this.scope, !!options.scope, options);
      this.addChild(viewport.connectedScope);
    }
    if ((connectedCE ?? null) !== null) {
      viewport!.setConnectedCE(connectedCE!, options);
    }
    return viewport!;
  }
  public removeViewport(step: Step | null, viewport: Viewport, connectedCE: IConnectedCustomElement | null): boolean {
    if (((connectedCE ?? null) !== null) || viewport.remove(step, connectedCE)) {
      this.removeChild(viewport.connectedScope);
      return true;
    }
    return false;
  }
  public addViewportScope(name: string, connectedCE: IConnectedCustomElement | null, options: IViewportScopeOptions = {}): ViewportScope {
    const viewportScope = new ViewportScope(name, this.router, connectedCE, this.scope, true, null, options);
    this.addChild(viewportScope.connectedScope);
    return viewportScope;
  }
  public removeViewportScope(viewportScope: ViewportScope): boolean {
    // viewportScope.remove();
    this.removeChild(viewportScope.connectedScope);
    return true;
  }

  public addChild(scope: Scope): void {
    if (!this.children.some(vp => vp === scope)) {
      if (scope.parent !== null) {
        scope.parent.removeChild(scope);
      }
      this.children.push(scope);
      scope.parent = this;
    }
  }
  public removeChild(scope: Scope): void {
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

  public allViewports(includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
    return this.allScopes(includeDisabled, includeReplaced).filter(scope => scope.isViewport).map(scope => scope.viewport!);
  }

  public allScopes(includeDisabled: boolean = false, includeReplaced: boolean = false): Scope[] {
    const scopes: Scope[] = includeDisabled ? this.children.slice() : this.enabledChildren;
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
      return this.findMatchingRouteInRoutes(path, this.viewportScope!.getRoutes());
    }
    if (this.isViewport) {
      return this.findMatchingRouteInRoutes(path, this.viewport!.getRoutes());
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

  // public canLoad(recurse: boolean): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
  //   const results = Runner.runAll(
  //     this.children.map(child =>
  //       child.viewport !== null
  //         ? child.viewport.canLoad(recurse)
  //         : child.canLoad(recurse))
  //   );
  //   if (results instanceof Promise) {
  //     return results.then(resolvedResults => {
  //       // console.log('then', 'canLoad');
  //       return resolvedResults.every(result => result as boolean);
  //     }
  //     );
  //   }
  //   return results.every(result => result as boolean);
  // }

  // public canUnload(): boolean | Promise<boolean> {
  //   // TODO: Review runAll!
  //   const results = Runner.runParallel(null,
  //     this.children.map(child =>
  //       child.viewport !== null
  //         ? child.viewport.canUnload(null)
  //         : child.canUnload())
  //   );
  //   if (results instanceof Promise) {
  //     return results.then(resolvedResults => {
  //       // console.log('then', 'canUnload');
  //       return resolvedResults.every(result => result as boolean);
  //     }
  //     );
  //   }
  //   return (results as boolean[]).every(result => result as boolean);
  // }

  public canUnload(step: Step<boolean> | null): boolean | Promise<boolean> {
    // console.log('canUnload', step.path);
    return Runner.run(step,
      (step: Step<boolean>) => {
        return Runner.runParallel(null,
          ...this.children.map(child => {
            return child.viewport !== null
              ? (childStep: Step<boolean>) => child.viewport!.canUnload(childStep)
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

  // public load(recurse: boolean): void | Promise<void> {
  //   const results = Runner.runAll(
  //     this.children.map(child =>
  //       child.viewport !== null
  //         ? child.viewport.load(recurse)
  //         : child.load(recurse))
  //   );
  //   if (results instanceof Promise) {
  //     return results as unknown as Promise<void>;
  //   }
  // }

  // public unload(recurse: boolean): void | Promise<void> {
  //   // TODO: Review runAll!
  //   const results = Runner.runParallel(null,
  //     this.children.map(child =>
  //       child.viewport !== null
  //         ? child.viewport.unload(null, recurse)
  //         : child.unload(recurse))
  //   );s
  //   if (results instanceof Promise) {
  //     return results as unknown as Promise<void>;
  //   }
  // }

  public unload(step: Step<void> | null, recurse: boolean): Step<void> {
    return Runner.runParallel(step,
      ...this.children.map(child => child.viewport !== null
        ? (step: Step<void>) => child.viewport!.unload(step, recurse)
        : (step: Step<void>) => child.unload(step, recurse))) as Step<void>;
  }

  // public removeContent(): void | Promise<void> {
  //   const results = Runner.runAll(
  //     this.children.map(child =>
  //       child.viewport !== null
  //         ? child.viewport.removeContent()
  //         : child.removeContent())
  //   );
  //   if (results instanceof Promise) {
  //     return results as unknown as Promise<void>;
  //   }
  // }

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
