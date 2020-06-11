import {
  ICustomElementController,
  Controller,
  ILifecycle,
  IHydratedController,
  IHydratedParentController,
  LifecycleFlags,
  ICustomElementViewModel,
} from '@aurelia/runtime';
import {
  Constructable,
} from '@aurelia/kernel';

import {
  RouteDefinition,
} from './route-definition';
import {
  RouteNode,
} from './route-tree';

export interface IRouteViewModel extends ICustomElementViewModel<HTMLElement> {
  canEnter?(...args: readonly unknown[]): unknown;
  enter?(...args: readonly unknown[]): unknown;
  canLeave?(...args: readonly unknown[]): unknown;
  leave?(...args: readonly unknown[]): unknown;
}

const componentAgentLookup: WeakMap<object, ComponentAgent> = new WeakMap();

export class ComponentAgent<T extends IRouteViewModel = IRouteViewModel> {
  public constructor(
    public readonly controller: ICustomElementController<HTMLElement, T>,
    public readonly definition: RouteDefinition,
    public readonly routeNode: RouteNode,
  ) {}

  public static for<T extends IRouteViewModel>(
    componentInstance: T,
    hostController: ICustomElementController<HTMLElement>,
    routeNode: RouteNode,
  ): ComponentAgent<T> {
    let componentAgent = componentAgentLookup.get(componentInstance);
    if (componentAgent === void 0) {
      const definition = RouteDefinition.resolve(componentInstance.constructor as Constructable);
      const context = hostController.context;
      const controller = Controller.forCustomElement(
        componentInstance,
        context.get(ILifecycle),
        hostController.host,
        context,
        void 0,
        void 0,
      );

      componentAgentLookup.set(
        componentInstance,
        componentAgent = new ComponentAgent(controller, definition, routeNode)
      );
    }

    return componentAgent as ComponentAgent<T>;
  }

  public activate(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.controller.activate(initiator, parent, flags);
  }

  public deactivate(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.controller.deactivate(initiator, parent, flags);
  }
}
