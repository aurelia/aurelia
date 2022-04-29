import { ICustomElementController, Controller, IHydratedController, LifecycleFlags, ICustomElementViewModel, ILifecycleHooks, LifecycleHooksLookup } from '@aurelia/runtime-html';
import { Constructable, ILogger } from '@aurelia/kernel';

import { RouteDefinition } from './route-definition';
import { RouteNode } from './route-tree';
import { IRouteContext } from './route-context';
import { Params, NavigationInstruction, ViewportInstructionTree } from './instructions';
import { Transition } from './router';
import { Batch } from './util';

export interface IRouteViewModel extends ICustomElementViewModel {
  canLoad?(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  load?(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
  canUnload?(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
  unload?(next: RouteNode | null, current: RouteNode): void | Promise<void>;
}

const componentAgentLookup: WeakMap<object, ComponentAgent> = new WeakMap();

export class ComponentAgent<T extends IRouteViewModel = IRouteViewModel> {
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _hasCanLoad: boolean;
  /** @internal */ private readonly _hasLoad: boolean;
  /** @internal */ private readonly _hasCanUnload: boolean;
  /** @internal */ private readonly _hasUnload: boolean;
  public readonly canLoadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canLoad'>[];
  public readonly loadHooks: readonly ILifecycleHooks<IRouteViewModel, 'load'>[];
  public readonly canUnloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canUnload'>[];
  public readonly unloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'unload'>[];

  public constructor(
    public readonly instance: T,
    public readonly controller: ICustomElementController<T>,
    public readonly definition: RouteDefinition,
    public readonly routeNode: RouteNode,
    public readonly ctx: IRouteContext,
  ) {
    this._logger = ctx.container.get(ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);

    this._logger.trace(`constructor()`);

    const lifecycleHooks = controller.lifecycleHooks as LifecycleHooksLookup<IRouteViewModel>;
    this.canLoadHooks = (lifecycleHooks.canLoad ?? []).map(x => x.instance);
    this.loadHooks = (lifecycleHooks.load ?? []).map(x => x.instance);
    this.canUnloadHooks = (lifecycleHooks.canUnload ?? []).map(x => x.instance);
    this.unloadHooks = (lifecycleHooks.unload ?? []).map(x => x.instance);
    this._hasCanLoad = 'canLoad' in instance;
    this._hasLoad = 'load' in instance;
    this._hasCanUnload = 'canUnload' in instance;
    this._hasUnload = 'unload' in instance;
  }

  public static for<T extends IRouteViewModel>(
    componentInstance: T,
    hostController: ICustomElementController<T>,
    routeNode: RouteNode,
    ctx: IRouteContext,
  ): ComponentAgent<T> {
    let componentAgent = componentAgentLookup.get(componentInstance);
    if (componentAgent === void 0) {
      const container = ctx.container;
      const definition = RouteDefinition.resolve(componentInstance.constructor as Constructable, ctx.definition);
      const controller = Controller.$el(container, componentInstance, hostController.host, null);

      componentAgentLookup.set(
        componentInstance,
        componentAgent = new ComponentAgent(componentInstance, controller, definition, routeNode, ctx)
      );
    }

    return componentAgent as ComponentAgent<T>;
  }

  public activate(initiator: IHydratedController | null, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    if (initiator === null) {
      this._logger.trace(`activate() - initial`);
      return this.controller.activate(this.controller, parent, flags);
    }

    this._logger.trace(`activate()`);
    // Promise return values from user VM hooks are awaited by the initiator
    void this.controller.activate(initiator, parent, flags);
  }

  public deactivate(initiator: IHydratedController | null, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    if (initiator === null) {
      this._logger.trace(`deactivate() - initial`);
      return this.controller.deactivate(this.controller, parent, flags);
    }

    this._logger.trace(`deactivate()`);
    // Promise return values from user VM hooks are awaited by the initiator
    void this.controller.deactivate(initiator, parent, flags);
  }

  public dispose(): void {
    this._logger.trace(`dispose()`);

    this.controller.dispose();
  }

  public canUnload(tr: Transition, next: RouteNode | null, b: Batch): void {
    this._logger.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.canUnloadHooks) {
      tr.run(() => {
        b.push();
        return hook.canUnload(this.instance, next, this.routeNode);
      }, ret => {
        if (tr.guardsResult === true && ret !== true) {
          tr.guardsResult = false;
        }
        b.pop();
      });
    }
    if (this._hasCanUnload) {
      tr.run(() => {
        b.push();
        return this.instance.canUnload!(next, this.routeNode);
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
    this._logger.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.canLoadHooks) {
      tr.run(() => {
        b.push();
        return hook.canLoad(this.instance, next.params, next, this.routeNode);
      }, ret => {
        if (tr.guardsResult === true && ret !== true) {
          tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
        }
        b.pop();
      });
    }
    if (this._hasCanLoad) {
      tr.run(() => {
        b.push();
        return this.instance.canLoad!(next.params, next, this.routeNode);
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
    this._logger.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.unloadHooks) {
      tr.run(() => {
        b.push();
        return hook.unload(this.instance, next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    if (this._hasUnload) {
      tr.run(() => {
        b.push();
        return this.instance.unload!(next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    b.pop();
  }

  public load(tr: Transition, next: RouteNode, b: Batch): void {
    this._logger.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, next);
    b.push();
    for (const hook of this.loadHooks) {
      tr.run(() => {
        b.push();
        return hook.load(this.instance, next.params, next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    if (this._hasLoad) {
      tr.run(() => {
        b.push();
        return this.instance.load!(next.params, next, this.routeNode);
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
