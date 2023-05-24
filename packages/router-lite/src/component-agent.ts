import { ILogger } from '@aurelia/kernel';
import type { ICustomElementController, ICustomElementViewModel, IHydratedController, ILifecycleHooks, LifecycleHooksLookup } from '@aurelia/runtime-html';

import { Events, traceEvent } from './events';
import {
  NavigationInstruction,
  Params,
  ViewportInstructionTree
} from './instructions';
import type { IRouteConfig, RouterOptions } from './options';
import { IRouteContext } from './route-context';
import type { RouteNode } from './route-tree';
import type { Transition } from './router';
import { Batch } from './util';

export interface IRouteViewModel extends ICustomElementViewModel {
  getRouteConfig?(parentConfig: IRouteConfig | null, routeNode: RouteNode | null): IRouteConfig | Promise<IRouteConfig>;
  canLoad?(params: Params, next: RouteNode, current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading?(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void>;
  canUnload?(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean>;
  unloading?(next: RouteNode | null, current: RouteNode): void | Promise<void>;
}

// type IHooksFn<T, Fn extends (...args: any[]) => unknown> = (vm: T, ...args: Parameters<Fn>) => ReturnType<Fn>;

/**
 * A component agent handles an instance of a routed view-model (a component).
 * It deals with invoking the hooks (`canLoad`, `loading`, `canUnload`, `unloading`),
 * and activating, deactivating, and disposing the component (via the associated controller).
 */
export class ComponentAgent<T extends IRouteViewModel = IRouteViewModel> {
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _hasCanLoad: boolean;
  /** @internal */ private readonly _hasLoad: boolean;
  /** @internal */ private readonly _hasCanUnload: boolean;
  /** @internal */ private readonly _hasUnload: boolean;

  /** @internal */ private readonly _canLoadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canLoad'>[];
  /** @internal */ private readonly _loadHooks: readonly ILifecycleHooks<IRouteViewModel, 'loading'>[];
  /** @internal */ private readonly _canUnloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canUnload'>[];
  /** @internal */ private readonly _unloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'unloading'>[];

  public constructor(
    public readonly instance: T,
    public readonly controller: ICustomElementController<T>,
    public readonly routeNode: RouteNode,
    public readonly ctx: IRouteContext,
    private readonly routerOptions: RouterOptions,
  ) {
    this._logger = /*@__PURE__*/ ctx.container.get(ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);

    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caCreated);

    const lifecycleHooks = controller.lifecycleHooks as LifecycleHooksLookup<IRouteViewModel>;
    this._canLoadHooks = (lifecycleHooks.canLoad ?? []).map(x => x.instance);
    this._loadHooks = (lifecycleHooks.loading ?? []).map(x => x.instance);
    this._canUnloadHooks = (lifecycleHooks.canUnload ?? []).map(x => x.instance);
    this._unloadHooks = (lifecycleHooks.unloading ?? []).map(x => x.instance);
    this._hasCanLoad = 'canLoad' in instance;
    this._hasLoad = 'loading' in instance;
    this._hasCanUnload = 'canUnload' in instance;
    this._hasUnload = 'unloading' in instance;
  }

  /** @internal */
  public _activate(initiator: IHydratedController | null, parent: IHydratedController): void | Promise<void> {
    if (initiator === null) {
      if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caActivateSelf);
      return this.controller.activate(this.controller, parent);
    }

    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caActivateInitiator);
    // Promise return values from user VM hooks are awaited by the initiator
    void this.controller.activate(initiator, parent);
  }

  /** @internal */
  public _deactivate(initiator: IHydratedController | null, parent: IHydratedController): void | Promise<void> {
    if (initiator === null) {
      if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caDeactivateSelf);
      return this.controller.deactivate(this.controller, parent);
    }

    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caDeactivateInitiator);
    // Promise return values from user VM hooks are awaited by the initiator
    void this.controller.deactivate(initiator, parent);
  }

  /** @internal */
  public _dispose(): void {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caDispose);

    this.controller.dispose();
  }

  /** @internal */
  public _canUnload(tr: Transition, next: RouteNode | null, b: Batch): void {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caCanUnload, next, this._canUnloadHooks.length);
    b.push();
    let promise: Promise<void> = Promise.resolve();
    for (const hook of this._canUnloadHooks) {
      b.push();
      promise = promise.then(() => new Promise((res) => {
        if (tr.guardsResult !== true) {
          b.pop();
          res();
          return;
        }
        tr.run(() => {
          return hook.canUnload(this.instance, next, this.routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = false;
          }
          b.pop();
          res();
        });
      }));
    }
    if (this._hasCanUnload) {
      b.push();
      // deepscan-disable-next-line UNUSED_VAR_ASSIGN
      promise = promise.then(() => {
        if (tr.guardsResult !== true) {
          b.pop();
          return;
        }
        tr.run(() => {
          return this.instance.canUnload!(next, this.routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = false;
          }
          b.pop();
        });
      });
    }
    b.pop();
  }

  /** @internal */
  public _canLoad(tr: Transition, next: RouteNode, b: Batch): void {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caCanLoad, next, this._canLoadHooks.length);
    const rootCtx = this.ctx.root;
    b.push();
    let promise: Promise<void> = Promise.resolve();
    for (const hook of this._canLoadHooks) {
      b.push();
      promise = promise.then(() => new Promise((res) => {
        if (tr.guardsResult !== true) {
          b.pop();
          res();
          return;
        }
        tr.run(() => {
          return hook.canLoad(this.instance, next.params, next, this.routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this.routerOptions, void 0, rootCtx);
          }
          b.pop();
          res();
        });
      }));
    }
    if (this._hasCanLoad) {
      b.push();
      // deepscan-disable-next-line UNUSED_VAR_ASSIGN
      promise = promise.then(() => {
        if (tr.guardsResult !== true) {
          b.pop();
          return;
        }
        tr.run(() => {
          return this.instance.canLoad!(next.params, next, this.routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this.routerOptions, void 0, rootCtx);
          }
          b.pop();
        });
      });
    }
    b.pop();
  }

  /** @internal */
  public _unloading(tr: Transition, next: RouteNode | null, b: Batch): void {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caUnloading, next, this._unloadHooks.length);
    b.push();
    for (const hook of this._unloadHooks) {
      tr.run(() => {
        b.push();
        return hook.unloading(this.instance, next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    if (this._hasUnload) {
      tr.run(() => {
        b.push();
        return this.instance.unloading!(next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    b.pop();
  }

  /** @internal */
  public _loading(tr: Transition, next: RouteNode, b: Batch): void {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, Events.caLoading, next, this._loadHooks.length);
    b.push();
    for (const hook of this._loadHooks) {
      tr.run(() => {
        b.push();
        return hook.loading(this.instance, next.params, next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    if (this._hasLoad) {
      tr.run(() => {
        b.push();
        return this.instance.loading!(next.params, next, this.routeNode);
      }, () => {
        b.pop();
      });
    }
    b.pop();
  }
}
