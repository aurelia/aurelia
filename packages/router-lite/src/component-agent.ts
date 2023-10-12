import { ILogger } from '@aurelia/kernel';
import type { ICustomElementController, ICustomElementViewModel, IHydratedController, ILifecycleHooks, LifecycleHooksLookup } from '@aurelia/runtime-html';

import { Events, trace } from './events';
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

/**
 * A component agent handles an instance of a routed view-model (a component).
 * It deals with invoking the hooks (`canLoad`, `loading`, `canUnload`, `unloading`),
 * and activating, deactivating, and disposing the component (via the associated controller).
 *
 * @internal
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
    /** @internal */ private readonly _instance: T,
    /** @internal */ private readonly _controller: ICustomElementController<T>,
    /** @internal */ public readonly _routeNode: RouteNode,
    /** @internal */ private readonly _ctx: IRouteContext,
    /** @internal */ private readonly _routerOptions: RouterOptions,
  ) {
    this._logger = _ctx.container.get(ILogger).scopeTo(`ComponentAgent<${_ctx._friendlyPath}>`);

    if (__DEV__) trace(this._logger, Events.caCreated);

    const lifecycleHooks = _controller.lifecycleHooks as LifecycleHooksLookup<IRouteViewModel>;
    this._canLoadHooks = (lifecycleHooks.canLoad ?? []).map(x => x.instance);
    this._loadHooks = (lifecycleHooks.loading ?? []).map(x => x.instance);
    this._canUnloadHooks = (lifecycleHooks.canUnload ?? []).map(x => x.instance);
    this._unloadHooks = (lifecycleHooks.unloading ?? []).map(x => x.instance);
    this._hasCanLoad = 'canLoad' in _instance;
    this._hasLoad = 'loading' in _instance;
    this._hasCanUnload = 'canUnload' in _instance;
    this._hasUnload = 'unloading' in _instance;
  }

  /** @internal */
  public _activate(initiator: IHydratedController | null, parent: IHydratedController): void | Promise<void> {
    if (initiator === null) {
      if (__DEV__) trace(this._logger, Events.caActivateSelf);
      return this._controller.activate(this._controller, parent);
    }

    if (__DEV__) trace(this._logger, Events.caActivateInitiator);
    // Promise return values from user VM hooks are awaited by the initiator
    void this._controller.activate(initiator, parent);
  }

  /** @internal */
  public _deactivate(initiator: IHydratedController | null, parent: IHydratedController): void | Promise<void> {
    if (initiator === null) {
      if (__DEV__) trace(this._logger, Events.caDeactivateSelf);
      return this._controller.deactivate(this._controller, parent);
    }

    if (__DEV__) trace(this._logger, Events.caDeactivateInitiator);
    // Promise return values from user VM hooks are awaited by the initiator
    void this._controller.deactivate(initiator, parent);
  }

  /** @internal */
  public _dispose(): void {
    if (__DEV__) trace(this._logger, Events.caDispose);

    this._controller.dispose();
  }

  /** @internal */
  public _canUnload(tr: Transition, next: RouteNode | null, b: Batch): void {
    if (__DEV__) trace(this._logger, Events.caCanUnload, next, this._canUnloadHooks.length);
    b._push();
    let promise: Promise<void> = Promise.resolve();
    for (const hook of this._canUnloadHooks) {
      b._push();
      promise = promise.then(() => new Promise((res) => {
        if (tr.guardsResult !== true) {
          b._pop();
          res();
          return;
        }
        tr._run(() => {
          return hook.canUnload(this._instance, next, this._routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = false;
          }
          b._pop();
          res();
        });
      }));
    }
    if (this._hasCanUnload) {
      b._push();
      // deepscan-disable-next-line UNUSED_VAR_ASSIGN
      promise = promise.then(() => {
        if (tr.guardsResult !== true) {
          b._pop();
          return;
        }
        tr._run(() => {
          return this._instance.canUnload!(next, this._routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = false;
          }
          b._pop();
        });
      });
    }
    b._pop();
  }

  /** @internal */
  public _canLoad(tr: Transition, next: RouteNode, b: Batch): void {
    if (__DEV__) trace(this._logger, Events.caCanLoad, next, this._canLoadHooks.length);
    const rootCtx = this._ctx.root;
    b._push();
    let promise: Promise<void> = Promise.resolve();
    for (const hook of this._canLoadHooks) {
      b._push();
      promise = promise.then(() => new Promise((res) => {
        if (tr.guardsResult !== true) {
          b._pop();
          res();
          return;
        }
        tr._run(() => {
          return hook.canLoad(this._instance, next.params, next, this._routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this._routerOptions, void 0, rootCtx);
          }
          b._pop();
          res();
        });
      }));
    }
    if (this._hasCanLoad) {
      b._push();
      // deepscan-disable-next-line UNUSED_VAR_ASSIGN
      promise = promise.then(() => {
        if (tr.guardsResult !== true) {
          b._pop();
          return;
        }
        tr._run(() => {
          return this._instance.canLoad!(next.params, next, this._routeNode);
        }, ret => {
          if (tr.guardsResult === true && ret !== true) {
            tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this._routerOptions, void 0, rootCtx);
          }
          b._pop();
        });
      });
    }
    b._pop();
  }

  /** @internal */
  public _unloading(tr: Transition, next: RouteNode | null, b: Batch): void {
    if (__DEV__) trace(this._logger, Events.caUnloading, next, this._unloadHooks.length);
    b._push();
    for (const hook of this._unloadHooks) {
      tr._run(() => {
        b._push();
        return hook.unloading(this._instance, next, this._routeNode);
      }, () => {
        b._pop();
      });
    }
    if (this._hasUnload) {
      tr._run(() => {
        b._push();
        return this._instance.unloading!(next, this._routeNode);
      }, () => {
        b._pop();
      });
    }
    b._pop();
  }

  /** @internal */
  public _loading(tr: Transition, next: RouteNode, b: Batch): void {
    if (__DEV__) trace(this._logger, Events.caLoading, next, this._loadHooks.length);
    b._push();
    for (const hook of this._loadHooks) {
      tr._run(() => {
        b._push();
        return hook.loading(this._instance, next.params, next, this._routeNode);
      }, () => {
        b._pop();
      });
    }
    if (this._hasLoad) {
      tr._run(() => {
        b._push();
        return this._instance.loading!(next.params, next, this._routeNode);
      }, () => {
        b._pop();
      });
    }
    b._pop();
  }
}
