/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { CustomElementType } from '@aurelia/runtime-html';
import { RouteableComponentType } from '../interfaces';
import { IRouter } from '../router';
import { RoutingInstruction } from '../instructions/routing-instruction';
import { TransitionAction, RoutingScope } from '../routing-scope';
import { arrayRemove } from '../utilities/utils';
import { Navigation } from '../navigation';
import { NavigationCoordinator } from '../navigation-coordinator';
import { Runner, Step } from '../utilities/runner';
import { Routes } from '../decorators/routes';
import { Route } from '../route';
import { Endpoint, IConnectedCustomElement, IEndpointOptions } from './endpoint';
import { ViewportScopeContent } from './viewport-scope-content';

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
    owningScope: RoutingScope | null,
    scope: boolean,
    public rootComponentType: CustomElementType | null = null, // temporary. Metadata will probably eliminate it
    public options: IViewportScopeOptions = {
      catches: [],
      source: null,
    },
  ) {
    super(router, name, connectedCE);
    this.contents.push(new ViewportScopeContent(router, this, owningScope, scope));
    if (this.catches.length > 0) {
      this.instruction = RoutingInstruction.create(this.catches[0], this.name) as RoutingInstruction;
    }
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

  public toString(): string {
    const contentName = this.instruction?.component.name ?? '';
    const nextContentName = this.getNextContent()?.instruction.component.name ?? '';
    return `vs:${this.name}[${contentName}->${nextContentName}]`;
  }

  public setNextContent(instruction: RoutingInstruction, navigation: Navigation): TransitionAction {
    instruction.endpoint.set(this);

    this.remove = instruction.isClear(this.router) || instruction.isClearAll(this.router);
    this.add = instruction.isAdd(this.router) && Array.isArray(this.source);

    if (this.add) {
      instruction.component.name = null;
    }

    if (this.default !== void 0 && instruction.component.name === null) {
      instruction.component.name = this.default;
    }

    this.contents.push(new ViewportScopeContent(this.router, this, this.owningScope, this.scope.hasScope, instruction, navigation));

    return 'swap';
  }

  public transition(coordinator: NavigationCoordinator): void {
    Runner.run(null,
      (step: Step<void>) => coordinator.setEndpointStep(this, step.root),
      () => coordinator.addEndpointState(this, 'guardedUnload'),
      () => coordinator.addEndpointState(this, 'guardedLoad'),
      () => coordinator.addEndpointState(this, 'guarded'),
      () => coordinator.addEndpointState(this, 'loaded'),
      () => coordinator.addEndpointState(this, 'unloaded'),
      () => coordinator.addEndpointState(this, 'routed'),
      () => coordinator.addEndpointState(this, 'swapped'),
      () => coordinator.addEndpointState(this, 'completed'),
    );
  }

  public finalizeContentChange(coordinator: NavigationCoordinator, _step: Step<void> | null): void {
    const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
    let nextContent = this.contents[nextContentIndex];

    if (this.remove) {
      const emptyContent = new ViewportScopeContent(this.router, this, this.owningScope, this.scope.hasScope);
      this.contents.splice(nextContentIndex, 1, emptyContent);
      nextContent.delete();
      nextContent = emptyContent;
    }
    nextContent.completed = true;

    let removeable = 0;
    for (let i = 0, ii = nextContentIndex; i < ii; i++) {
      if (!(this.contents[0].navigation.completed ?? false)) {
        break;
      }
      removeable++;
    }
    this.contents.splice(0, removeable);

    if (this.remove && Array.isArray(this.source)) {
      this.removeSourceItem();
    }
  }
  public cancelContentChange(coordinator: NavigationCoordinator, noExitStep: Step<void> | null = null): void | Step<void> {
    // First cancel content change in all children
    [...new Set(this.scope.children.map(scope => scope.endpoint))].forEach(child => child.cancelContentChange(coordinator, noExitStep));

    const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
    if (nextContentIndex < 0) {
      return;
    }

    this.contents.splice(nextContentIndex, 1);
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
    if (segment === RoutingInstruction.clear(this.router)
      || segment === RoutingInstruction.add(this.router)
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

  public getRoutes(): Route[] {
    const routes = [];
    if (this.rootComponentType !== null) {
      // TODO: Fix it so that this isn't necessary!
      const Type = this.rootComponentType.constructor === this.rootComponentType.constructor.constructor
        ? this.rootComponentType
        : this.rootComponentType.constructor as RouteableComponentType;

      routes.push(...(Routes.getConfiguration(Type) ?? []));
    }
    return routes;
  }
}
