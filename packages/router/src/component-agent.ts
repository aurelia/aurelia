import { ILogger } from '@aurelia/kernel';
import { MountTarget, type ICustomElementController, type ICustomElementViewModel, type IHydratedController, type ILifecycleHooks, type LifecycleHooksLookup } from '@aurelia/runtime-html';

import { Events, trace } from './events';
import {
  NavigationInstruction,
  Params,
  ViewportInstructionTree
} from './instructions';
import type { INavigationOptions, IRouteConfig, RouterOptions } from './options';
import { IRouteContext } from './route-context';
import type { RouteNode } from './route-tree';
import type { Transition } from './router';
import { Batch } from './util';

export interface IRouteViewModel extends ICustomElementViewModel {
  getRouteConfig?(parentConfig: IRouteConfig | null, routeNode: RouteNode | null): IRouteConfig | Promise<IRouteConfig>;
  canLoad?(params: Params, next: RouteNode, current: RouteNode | null, options: INavigationOptions): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading?(params: Params, next: RouteNode, current: RouteNode | null, options: INavigationOptions): void | Promise<void>;
  loaded?(params: Params, next: RouteNode, current: RouteNode | null, options: INavigationOptions): void | Promise<void>;
  canUnload?(next: RouteNode | null, current: RouteNode, options: INavigationOptions): boolean | Promise<boolean>;
  unloading?(next: RouteNode | null, current: RouteNode, options: INavigationOptions): void | Promise<void>;
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
  /** @internal */ private readonly _hasLoaded: boolean;
  /** @internal */ private readonly _hasCanUnload: boolean;
  /** @internal */ private readonly _hasUnload: boolean;

  /** @internal */ private readonly _canLoadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canLoad'>[];
  /** @internal */ private readonly _loadHooks: readonly ILifecycleHooks<IRouteViewModel, 'loading'>[];
  /** @internal */ private readonly _loadedHooks: readonly ILifecycleHooks<IRouteViewModel, 'loaded'>[];
  /** @internal */ private readonly _canUnloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'canUnload'>[];
  /** @internal */ private readonly _unloadHooks: readonly ILifecycleHooks<IRouteViewModel, 'unloading'>[];

  /**
   * The component's controller.
   */
  public get controller(): ICustomElementController<T> {
    return this._controller;
  }

  public constructor(
    /** @internal */ private readonly _instance: T,
    /** @internal */ private readonly _controller: ICustomElementController<T>,
    /** @internal */ public readonly _routeNode: RouteNode,
    /** @internal */ private readonly _ctx: IRouteContext,
    /** @internal */ private readonly _routerOptions: RouterOptions,
  ) {
    this._logger = _controller.container.get(ILogger).scopeTo(`ComponentAgent<${_ctx.routeConfigContext._friendlyPath}>`);

    if (__DEV__) trace(this._logger, Events.caCreated);

    const lifecycleHooks = _controller.lifecycleHooks as LifecycleHooksLookup<IRouteViewModel>;
    this._canLoadHooks = (lifecycleHooks.canLoad ?? []).map(x => x.instance);
    this._loadHooks = (lifecycleHooks.loading ?? []).map(x => x.instance);
    this._loadedHooks = (lifecycleHooks.loaded ?? []).map(x => x.instance);
    this._canUnloadHooks = (lifecycleHooks.canUnload ?? []).map(x => x.instance);
    this._unloadHooks = (lifecycleHooks.unloading ?? []).map(x => x.instance);
    this._hasCanLoad = 'canLoad' in _instance;
    this._hasLoad = 'loading' in _instance;
    this._hasLoaded = 'loaded' in _instance;
    this._hasCanUnload = 'canUnload' in _instance;
    this._hasUnload = 'unloading' in _instance;
  }

  /** @internal */
  public _activate(initiator: IHydratedController | null, parent: IHydratedController): void | Promise<void> {
    this._mountToViewport();

    if (initiator === null) {
      if (__DEV__) trace(this._logger, Events.caActivateSelf);
      return this._controller.activate(this._controller, parent);
    }

    if (__DEV__) trace(this._logger, Events.caActivateInitiator);
    // Promise return values from user VM hooks are awaited by the initiator
    void this._controller.activate(initiator, parent);
  }

  /**
   * Mount the component's host element to the viewport.
   * During SSR hydration, the element already exists in the DOM and mounting is skipped.
   * @internal
   */
  private _mountToViewport(): void {
    const controller = this._controller;
    const viewportHost = this._ctx.vpa.hostController.host;

    if (this._isMountedTo(viewportHost)) {
      return;
    }

    switch (controller.mountTarget) {
      case MountTarget.host:
      case MountTarget.shadowRoot:
        viewportHost.appendChild(controller.host);
        break;
      case MountTarget.location:
        viewportHost.append(controller.location!.$start!, controller.location!);
        break;
      case MountTarget.none:
        throw new Error('Invalid mount target for routed component');
    }
  }

  /**
   * Check if the component is already mounted to the given host.
   * Returns true during SSR hydration when the element was server-rendered.
   * @internal
   */
  private _isMountedTo(host: HTMLElement): boolean {
    const controller = this._controller;
    switch (controller.mountTarget) {
      case MountTarget.host:
      case MountTarget.shadowRoot:
        return controller.host.parentNode === host;
      case MountTarget.location:
        return controller.location?.$start?.parentNode === host;
      default:
        return false;
    }
  }

  /** @internal */
  public _deactivate(initiator: IHydratedController | null, parent: IHydratedController): void | Promise<void> {
    const controller = this._controller;
    // there's a case controller was disposed and is being deactivated again?
    // todo: these 3 lines seems invasive, and ugly, should this be a method on Controller?
    controller.host?.remove();
    controller.location?.remove();
    controller.location?.$start?.remove();
    if (initiator === null) {
      if (__DEV__) trace(this._logger, Events.caDeactivateSelf);
      return controller.deactivate(controller, parent);
    }

    if (__DEV__) trace(this._logger, Events.caDeactivateInitiator);
    // Promise return values from user VM hooks are awaited by the initiator
    void controller.deactivate(initiator, parent);
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
    const options = tr.options;
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
          return hook.canUnload(this._instance, next, this._routeNode, options);
        }, ret => {
          if (tr.guardsResult === true && ret === false) {
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
          return this._instance.canUnload!(next, this._routeNode, options);
        }, ret => {
          if (tr.guardsResult === true && ret === false) {
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
    const params = next._getParams(this._routerOptions.treatQueryAsParameters);
    const rootCtx = this._ctx.root;
    b._push();
    const options = tr.options;
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
          return hook.canLoad(this._instance, params, next, this._routeNode, options);
        }, ret => {
          if (tr.guardsResult === true && ret != null && ret !== true) {
            tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this._routerOptions, null, rootCtx, null);
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
          return this._instance.canLoad!(params, next, this._routeNode, options);
        }, ret => {
          if (tr.guardsResult === true && ret != null && ret !== true) {
            tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this._routerOptions, null, rootCtx, null);
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
    const options = tr.options;
    for (const hook of this._unloadHooks) {
      tr._run(() => {
        b._push();
        return hook.unloading(this._instance, next, this._routeNode, options);
      }, () => {
        b._pop();
      });
    }
    if (this._hasUnload) {
      tr._run(() => {
        b._push();
        return this._instance.unloading!(next, this._routeNode, options);
      }, () => {
        b._pop();
      });
    }
    b._pop();
  }

  /** @internal */
  public _loading(tr: Transition, next: RouteNode, b: Batch): void {
    if (__DEV__) trace(this._logger, Events.caLoading, next, this._loadHooks.length);
    const params = next._getParams(this._routerOptions.treatQueryAsParameters);
    b._push();
    const options = tr.options;
    for (const hook of this._loadHooks) {
      tr._run(() => {
        b._push();
        return hook.loading(this._instance, params, next, this._routeNode, options);
      }, () => {
        b._pop();
      });
    }
    if (this._hasLoad) {
      tr._run(() => {
        b._push();
        return this._instance.loading!(params, next, this._routeNode, options);
      }, () => {
        b._pop();
      });
    }
    b._pop();
  }

  /** @internal */
  public _loaded(tr: Transition, next: RouteNode, b: Batch): void {
    if (__DEV__) trace(this._logger, Events.caLoaded, next, this._loadedHooks.length);
    const params = next._getParams(this._routerOptions.treatQueryAsParameters);
    b._push();
    const options = tr.options;
    for (const hook of this._loadedHooks) {
      tr._run(() => {
        b._push();
        return hook.loaded(this._instance, params, next, this._routeNode, options);
      }, () => {
        b._pop();
      });
    }
    if (this._hasLoaded) {
      tr._run(() => {
        b._push();
        return this._instance.loaded!(params, next, this._routeNode, options);
      }, () => {
        b._pop();
      });
    }
    b._pop();
  }
}
