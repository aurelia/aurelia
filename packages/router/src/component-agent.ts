/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
  ILogger,
} from '@aurelia/kernel';

import {
  RouteDefinition,
} from './route-definition';
import {
  RouteNode,
} from './route-tree';
import {
  IRouteContext,
} from './route-context';
import {
  Params,
  NavigationInstruction,
} from './instructions';

export interface IRouteViewModel extends ICustomElementViewModel<HTMLElement> {
  canEnter?(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | Promise<boolean | NavigationInstruction>;
  enter?(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
  canLeave?(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
  leave?(next: RouteNode | null, current: RouteNode): void | Promise<void>;
}

const componentAgentLookup: WeakMap<object, ComponentAgent> = new WeakMap();

export class ComponentAgent<T extends IRouteViewModel = IRouteViewModel> {
  private readonly logger: ILogger;

  public readonly hasCanEnter: boolean;
  public readonly hasEnter: boolean;
  public readonly hasCanLeave: boolean;
  public readonly hasLeave: boolean;

  public constructor(
    public readonly instance: T,
    public readonly controller: ICustomElementController<HTMLElement, T>,
    public readonly definition: RouteDefinition,
    public readonly routeNode: RouteNode,
    public readonly ctx: IRouteContext,
  ) {
    this.logger = ctx.get(ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);

    this.logger.trace(`constructor()`);

    this.hasCanEnter = 'canEnter' in instance;
    this.hasEnter = 'enter' in instance;
    this.hasCanLeave = 'canLeave' in instance;
    this.hasLeave = 'leave' in instance;
  }

  public static for<T extends IRouteViewModel>(
    componentInstance: T,
    hostController: ICustomElementController<HTMLElement>,
    routeNode: RouteNode,
    ctx: IRouteContext,
  ): ComponentAgent<T> {
    let componentAgent = componentAgentLookup.get(componentInstance);
    if (componentAgent === void 0) {
      const definition = RouteDefinition.resolve(componentInstance.constructor as Constructable);
      const controller = Controller.forCustomElement(
        componentInstance,
        ctx.get(ILifecycle),
        hostController.host,
        ctx,
        void 0,
        void 0,
      );

      componentAgentLookup.set(
        componentInstance,
        componentAgent = new ComponentAgent(componentInstance, controller, definition, routeNode, ctx)
      );
    }

    return componentAgent as ComponentAgent<T>;
  }

  public activate(
    initiator: IHydratedController<HTMLElement> | null,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace(`activate()`);

    return this.controller.activate(initiator ?? this.controller, parent, flags);
  }

  public deactivate(
    initiator: IHydratedController<HTMLElement> | null,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace(`deactivate()`);

    return this.controller.deactivate(initiator ?? this.controller, parent, flags);
  }

  public async canLeave(next: RouteNode | null): Promise<boolean> {
    if (this.hasCanLeave) {
      return this.instance.canLeave!(next, this.routeNode);
    }
    return true;
  }

  public isSameComponent(node: RouteNode): boolean {
    const currentComponent = this.routeNode.component;
    const nextComponent = node.component;
    if (currentComponent === nextComponent) {
      this.logger.trace(() => `isSameComponent(node:${node}) -> true`);

      return true;
    }

    // TODO: may need specific heuristics for component instances and/or uncompiled definitions / identical definitions under different contexts, etc.

    this.logger.trace(() => `isSameComponent(node:${node}) -> false`);

    return false;
  }

  public async update(node: RouteNode): Promise<void> {
    if (!this.routeNode.shallowEquals(node)) {
      // TODO
    }

    await Promise.resolve();
  }

  public toString(): string {
    return `ComponentAgent(ctx.friendlyPath:'${this.ctx.friendlyPath}',definition.component.name:'${this.definition.component.name}')`;
  }
}
