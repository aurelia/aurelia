import { ICustomElementController, Controller, IHydratedController, LifecycleFlags, ICustomElementViewModel, IAppRoot } from '@aurelia/runtime-html';
import { Constructable, ILogger } from '@aurelia/kernel';

import { RouteDefinition } from './route-definition.js';
import { RouteNode } from './route-tree.js';
import { IRouteContext } from './route-context.js';
import { Params, NavigationInstruction, ViewportInstructionTree } from './instructions.js';
import { instantiateHook, RouterHookObject } from './hooks.js';
import { Transition } from './router.js';
import { Batch } from './util.js';

export interface IRouteViewModel extends ICustomElementViewModel {
  canLoad?(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  load?(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
  canUnload?(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
  unload?(next: RouteNode | null, current: RouteNode): void | Promise<void>;
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
    public readonly controller: ICustomElementController<T>,
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
    hostController: ICustomElementController,
    routeNode: RouteNode,
    ctx: IRouteContext,
  ): ComponentAgent<T> {
    let componentAgent = componentAgentLookup.get(componentInstance);
    if (componentAgent === void 0) {
      const definition = RouteDefinition.resolve(componentInstance.constructor as Constructable);
      const controller = Controller.forCustomElement(ctx.get(IAppRoot), ctx, componentInstance, hostController.host, null);

      componentAgentLookup.set(
        componentInstance,
        componentAgent = new ComponentAgent(componentInstance, controller, definition, routeNode, ctx)
      );
    }

    return componentAgent as ComponentAgent<T>;
  }

  public activate(initiator: IHydratedController | null, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    if (initiator === null) {
      this.logger.trace(`activate() - initial`);
      return this.controller.activate(this.controller, parent, flags);
    }

    this.logger.trace(`activate()`);
    // Promise return values from user VM hooks are awaited by the initiator
    void this.controller.activate(initiator, parent, flags);
  }

  public deactivate(initiator: IHydratedController | null, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    if (initiator === null) {
      this.logger.trace(`deactivate() - initial`);
      return this.controller.deactivate(this.controller, parent, flags);
    }

    this.logger.trace(`deactivate()`);
    // Promise return values from user VM hooks are awaited by the initiator
    void this.controller.deactivate(initiator, parent, flags);
  }

  public dispose(): void {
    this.logger.trace(`dispose()`);

    this.controller.dispose();
  }

  public canUnload(tr: Transition, next: RouteNode | null, b: Batch): void {
    this.logger.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.canUnloadHooks) {
      tr.run(() => {
        b.push();
        return hook.canUnload(next, this.routeNode);
      }, ret => {
        if (tr.guardsResult === true && ret !== true) {
          tr.guardsResult = false;
        }
        b.pop();
      });
    }
    b.pop();
  }

  public canLoad(tr: Transition, next: RouteNode, b: Batch): void {
    this.logger.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.canLoadHooks) {
      tr.run(() => {
        b.push();
        return hook.canLoad(next.params, next, this.routeNode);
      }, ret => {
        if (tr.guardsResult === true && ret !== true) {
          tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
        }
        b.pop();
      });
    }
    b.pop();
  }

  public unload(tr: Transition, next: RouteNode | null, b: Batch): void {
    this.logger.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.unloadHooks) {
      tr.run(() => {
        b.push();
        return hook.unload(next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    b.pop();
  }

  public load(tr: Transition, next: RouteNode, b: Batch): void {
    this.logger.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.loadHooks) {
      tr.run(() => {
        b.push();
        return hook.load(next.params, next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    b.pop();
  }

  public toString(): string {
    return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component!.name}')`;
  }
}
