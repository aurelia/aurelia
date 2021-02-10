/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { CustomElementType } from '@aurelia/runtime-html';
import { RouteableComponentType } from '../interfaces.js';
import { IRouter } from '../router.js';
import { RoutingInstruction } from '../instructions/routing-instruction.js';
import { NextContentAction, RoutingScope } from '../routing-scope.js';
import { arrayRemove } from '../utilities/utils.js';
import { Navigation } from '../navigation.js';
import { NavigationCoordinator } from '../navigation-coordinator.js';
import { Runner, Step } from '../utilities/runner.js';
import { Routes } from '../decorators/routes.js';
import { Route } from '../route.js';
import { Endpoint, IConnectedCustomElement, IEndpointOptions } from './endpoint.js';
import { ViewportScopeContent } from './viewport-scope-content.js';

/**
 * The viewport scope is an endpoint that encapsulates an au-viewport-scope custom
 * element instance. Its content isn't managed by, or even relevant for, the viewport
 * scope since it's only a container custom element. Instead of managing content,
 * the viewport scope provides a way to
 * a) add a routing scope without having to add an actual viewport,
 * b) have segments in routes/paths/instructions without requiring a viewport, and
 * c) make viewports repeatable (something they can't be by themselves) by
 * enclosing them.
 *
 * Since it is an endpoint, the viewport scope is participating in navigations and
 * instructed by the router and navigation coordinator (but with a very simple
 * transition and other navigation actions).
 */
export interface IViewportScopeOptions extends IEndpointOptions {
  catches?: string | string[];
  collection?: boolean;
  source?: unknown[] | null;
}

export class ViewportScope extends Endpoint {
  public instruction: RoutingInstruction | null = null;

  public available: boolean = true;
  public sourceItem: unknown | null = null;
  public sourceItemIndex: number = -1;

  private remove: boolean = false;
  private add: boolean = false;

  public constructor(
    router: IRouter,
    name: string,
    connectedCE: IConnectedCustomElement | null,
    private readonly _owningScope: RoutingScope | null,
    private readonly _scope: boolean,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
    public options: IViewportScopeOptions = {
      catches: [],
      source: null,
    },
  ) {
    super(router, name, connectedCE, _owningScope, _scope);
    this.content = new ViewportScopeContent(router, this, _owningScope, _scope);
    if (this.catches.length > 0) {
      this.instruction = RoutingInstruction.create(this.catches[0], this.name) as RoutingInstruction;
    }
  }

  public get isViewportScope(): boolean {
    return true;
  }

  public get isEmpty(): boolean {
    return this.instruction === null;
  }

  public get passThroughScope(): boolean {
    return this.rootComponentType === null && this.catches.length === 0;
  }

  public get siblings(): ViewportScope[] {
    const parent: RoutingScope | null = this.connectedScope.parent;
    if (parent === null) {
      return [this];
    }
    return parent.enabledChildren
      .filter(child => child.isViewportScope && (child.endpoint as ViewportScope).name === this.name)
      .map(child => child.endpoint as ViewportScope);
  }

  public get source(): unknown[] | null {
    return this.options.source ?? null;
  }

  public get catches(): string[] {
    let catches: string | string[] = this.options.catches ?? [];
    if (typeof catches === 'string') {
      catches = catches.split(',');
    }
    return catches;
  }

  public get default(): string | undefined {
    if (this.catches.length > 0) {
      return this.catches[0];
    }
  }

  public get nextContentActivated(): boolean {
    // TODO(alpha): Fix this!
    return true;
    // return this.scope.parent?.endpoint?.nextContentActivated ?? false;
  }

  public toString(): string {
    const contentName = this.instruction?.component.name ?? '';
    const nextContentName = this.nextContent?.instruction.component.name ?? '';
    return `vs:${this.name}[${contentName}->${nextContentName}]`;
  }

  public setNextContent(routingInstruction: RoutingInstruction, navigation: Navigation): NextContentAction {
    routingInstruction.viewportScope = this;

    this.remove = routingInstruction.isClear || routingInstruction.isClearAll;
    this.add = routingInstruction.isAdd && Array.isArray(this.source);

    if (this.add) {
      routingInstruction.component.name = null;
    }

    if (this.default !== void 0 && routingInstruction.component.name === null) {
      routingInstruction.component.name = this.default;
    }

    this.nextContent = new ViewportScopeContent(this.router, this, this._owningScope, this._scope, routingInstruction);

    return 'swap';
  }

  public transition(coordinator: NavigationCoordinator): void {
    // console.log('ViewportScope swap'/*, this, coordinator*/);

    Runner.run(null,
      () => coordinator.addEntityState(this, 'guardedUnload'),
      () => coordinator.addEntityState(this, 'guardedLoad'),
      () => coordinator.addEntityState(this, 'guarded'),
      () => coordinator.addEntityState(this, 'loaded'),
      () => coordinator.addEntityState(this, 'unloaded'),
      () => coordinator.addEntityState(this, 'routed'),
      () => coordinator.addEntityState(this, 'swapped'),
      () => {
        this.content = !this.remove ? this.nextContent! : new ViewportScopeContent(this.router, this, this._owningScope, this._scope,);
        this.nextContent = null;
        coordinator.addEntityState(this, 'completed');
      }
    );
  }

  public finalizeContentChange(): void {
    // console.log('ViewportScope finalizing', this.content);
    if (this.remove && Array.isArray(this.source)) {
      this.removeSourceItem();
    }
  }
  public abortContentChange(step: Step<void> | null): void | Step<void> {
    this.nextContent = null;
    if (this.add) {
      const index = this.source!.indexOf(this.sourceItem);
      this.source!.splice(index, 1);
      this.sourceItem = null;
    }
  }

  public acceptSegment(segment: string): boolean {
    if (segment === null && segment === void 0 || segment.length === 0) {
      return true;
    }
    if (segment === RoutingInstruction.clear()
      || segment === RoutingInstruction.add()
      || segment === this.name) {
      return true;
    }

    if (this.catches.length === 0) {
      return true;
    }

    if (this.catches.includes(segment)) {
      return true;
    }
    if (this.catches.filter((value) => value.includes('*')).length) {
      return true;
    }
    return false;
  }

  public binding(): void {
    const source: unknown[] = this.source || [];
    if (source.length > 0 && this.sourceItem === null) {
      this.sourceItem = this.getAvailableSourceItem();
    }
  }
  public unbinding(): void {
    if (this.sourceItem !== null && this.source !== null) {
      arrayRemove(this.source, (item: unknown) => item === this.sourceItem);
    }
    this.sourceItem = null;
  }

  public getAvailableSourceItem(): unknown | null {
    if (this.source === null) {
      return null;
    }
    const siblings = this.siblings;
    for (const item of this.source) {
      if (siblings.every(sibling => sibling.sourceItem !== item)) {
        return item;
      }
    }
    return null;
  }
  public addSourceItem(): unknown {
    const item: unknown = {};
    this.source!.push(item);
    return item;
  }
  public removeSourceItem(): void {
    this.sourceItemIndex = this.source!.indexOf(this.sourceItem);
    if (this.sourceItemIndex >= 0) {
      this.source!.splice(this.sourceItemIndex, 1);
    }
  }

  public getRoutes(): Route[] | null {
    if (this.rootComponentType !== null) {
      // TODO: Fix it so that this isn't necessary!
      const Type = this.rootComponentType.constructor === this.rootComponentType.constructor.constructor
        ? this.rootComponentType
        : this.rootComponentType.constructor as RouteableComponentType;

      return Routes.getConfiguration(Type);
    }
    return null;
  }
}
