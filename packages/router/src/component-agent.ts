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
  onResolve,
  resolveAll,
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
import { instantiateHook, RouterHookObject } from './hooks';
import { Transition } from './router';

export interface IRouteViewModel extends ICustomElementViewModel<HTMLElement> {
  canLoad?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  load?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
  ): void | Promise<void>;
  canUnload?(
    next: RouteNode | null,
    current: RouteNode,
  ): boolean | Promise<boolean>;
  unload?(
    next: RouteNode | null,
    current: RouteNode,
  ): void | Promise<void>;
}

const componentAgentLookup: WeakMap<object, ComponentAgent> = new WeakMap();

export class ComponentAgent<T extends IRouteViewModel = IRouteViewModel> {
  private readonly logger: ILogger;

  public readonly canLoadHooks: readonly RouterHookObject<'canLoad'>[];
  public readonly loadHooks: readonly RouterHookObject<'load'>[];
  public readonly canUnloadHooks: readonly RouterHookObject<'canUnload'>[];
  public readonly unloadHooks: readonly RouterHookObject<'unload'>[];

  public constructor(
    public readonly instance: T,
    public readonly controller: ICustomElementController<HTMLElement, T>,
    public readonly definition: RouteDefinition,
    public readonly routeNode: RouteNode,
    public readonly ctx: IRouteContext,
  ) {
    this.logger = ctx.get(ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);

    this.logger.trace(`constructor()`);

    this.canLoadHooks = (
      'canLoad' in instance ? [instance as RouterHookObject<'canLoad'>] : []
    ).concat(definition.config.canLoad.map(x => instantiateHook(ctx, 'canLoad', x)));
    this.loadHooks = (
      'load' in instance ? [instance as RouterHookObject<'load'>] : []
    ).concat(definition.config.load.map(x => instantiateHook(ctx, 'load', x)));
    this.canUnloadHooks = (
      'canUnload' in instance ? [instance as RouterHookObject<'canUnload'>] : []
    ).concat(definition.config.canUnload.map(x => instantiateHook(ctx, 'canUnload', x)));
    this.unloadHooks = (
      'unload' in instance ? [instance as RouterHookObject<'unload'>] : []
    ).concat(definition.config.unload.map(x => instantiateHook(ctx, 'unload', x)));
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

  public canLoad(
    tr: Transition,
    next: RouteNode,
  ): void | Promise<void> {
    this.logger.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, next);
    return resolveAll(...this.canLoadHooks.map(x => {
      if (tr.guardsResult === true) {
        return onResolve(x.canLoad(next.params, next, this.routeNode), result => {
          if (tr.guardsResult === true && result !== true) {
            tr.guardsResult = result === false ? false : ViewportInstructionTree.create(result);
          }
        });
      }
      return void 0;
    }));
  }

  public load(
    tr: Transition,
    next: RouteNode,
  ): void | Promise<void> {
    this.logger.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, next);
    return resolveAll(...this.loadHooks.map(x => {
      if (tr.guardsResult === true) {
        return x.load(next.params, next, this.routeNode);
      }
      return void 0;
    }));
  }

  public canUnload(
    tr: Transition,
    next: RouteNode | null,
  ): void | Promise<void> {
    this.logger.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, next);
    return resolveAll(...this.canUnloadHooks.map(x => {
      if (tr.guardsResult === true) {
        return onResolve(x.canUnload(next, this.routeNode), result => {
          if (tr.guardsResult === true && result !== true) {
            tr.guardsResult = false;
          }
        });
      }
      return void 0;
    }));
  }

  public unload(
    tr: Transition,
    next: RouteNode | null,
  ): void | Promise<void> {
    this.logger.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, next);
    return resolveAll(...this.unloadHooks.map(x => {
      if (tr.guardsResult === true) {
        return x.unload(next, this.routeNode);
      }
      return void 0;
    }));
  }

  public toString(): string {
    return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component!.name}')`;
  }
}
