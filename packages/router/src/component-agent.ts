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
  ViewportInstructionTree,
} from './instructions';
import {
  runSequence,
} from './util';

export interface IRouteViewModel extends ICustomElementViewModel<HTMLElement> {
  canEnter?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  enter?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): void | Promise<void>;
  canLeave?(
    next: RouteNode | null,
    current: RouteNode,
  ): boolean | Promise<boolean>;
  leave?(
    next: RouteNode | null,
    current: RouteNode,
  ): void | Promise<void>;
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

  public dispose(): void {
    this.logger.trace(`dispose()`);

    this.controller.dispose();
  }

  public canEnter(next: RouteNode): boolean | ViewportInstructionTree | Promise<boolean | ViewportInstructionTree> {
    if (this.hasCanEnter) {
      this.logger.trace(`canEnter(next:%s) - invoking hook on component`, next);
      return runSequence(
        () => { return this.instance.canEnter!(next.params, next, this.routeNode); },
        (_, result) => {
          if (typeof result === 'boolean') {
            return result;
          }

          return ViewportInstructionTree.create(result);
        },
      );
    }

    this.logger.trace(`canEnter(next:%s) - component does not implement this hook, so skipping`, next);
    return true;
  }

  public enter(next: RouteNode): void | Promise<void> {
    if (this.hasEnter) {
      this.logger.trace(`enter(next:%s) - invoking hook on component`, next);
      return this.instance.enter!(next.params, next, this.routeNode);
    }

    this.logger.trace(`enter(next:%s) - component does not implement this hook, so skipping`, next);
  }

  public canLeave(next: RouteNode | null): boolean | Promise<boolean> {
    if (this.hasCanLeave) {
      this.logger.trace(`canLeave(next:%s) - invoking hook on component`, next);
      return this.instance.canLeave!(next, this.routeNode);
    }

    this.logger.trace(`canLeave(next:%s) - component does not implement this hook, so skipping`, next);
    return true;
  }

  public leave(next: RouteNode | null): void | Promise<void> {
    if (this.hasLeave) {
      this.logger.trace(`leave(next:%s) - invoking hook on component`, next);
      return this.instance.leave!(next, this.routeNode);
    }

    this.logger.trace(`leave(next:%s) - component does not implement this hook, so skipping`, next);
  }

  public toString(): string {
    return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component.name}')`;
  }
}
