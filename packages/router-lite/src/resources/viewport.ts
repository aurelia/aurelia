import { Constructable, ILogger, resolve } from '@aurelia/kernel';
import {
  CustomElement,
  defineElement,
  ICompiledCustomElementController,
  ICustomElementController,
  ICustomElementViewModel,
  IHydratedController
} from '@aurelia/runtime-html';

import { trace, Events } from '../events';
import { defaultViewportName, IViewportInstruction } from '../instructions';
import { FallbackFunction, Routeable } from '../options';
import { IRouteContext } from '../route-context';
import { type RouteNode } from '../route-tree';
import type { ViewportAgent } from '../viewport-agent';

export interface IViewport {
  readonly name: string;
  readonly usedBy: string;
  readonly default: string;
  readonly fallback: Routeable | FallbackFunction;
  /** @internal */
  _getFallback(viewportInstruction: IViewportInstruction, routeNode: RouteNode, context: IRouteContext): Routeable | null;
}

export class ViewportCustomElement implements ICustomElementViewModel, IViewport {
  public name: string = defaultViewportName;
  public usedBy: string = '';
  public default: string = '';
  public fallback: Routeable | FallbackFunction = '';

  /** @internal */ private _agent: ViewportAgent = (void 0)!;
  /** @internal */ private _controller: ICustomElementController = (void 0)!;

  /** @internal */
  private readonly _ctx: IRouteContext = resolve(IRouteContext);
  /** @internal */
  private readonly _logger: ILogger = /*@__PURE__*/ (resolve(ILogger).scopeTo(`au-viewport<${this._ctx._friendlyPath}>`));

  /** @internal */
  public _getFallback(viewportInstruction: IViewportInstruction, routeNode: RouteNode, context: IRouteContext): Routeable | null {
    const fallback = this.fallback;
    return typeof fallback === 'function'
      && !CustomElement.isType(fallback as Constructable)
      ? (fallback as FallbackFunction)(viewportInstruction, routeNode, context)
      : fallback;
  }

  public hydrated(controller: ICompiledCustomElementController): void {
    if (__DEV__) trace(this._logger, Events.vpHydrated);

    this._controller = controller as ICustomElementController;
    this._agent = this._ctx._registerViewport(this);
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    if (__DEV__) trace(this._logger, Events.vpAttaching);

    return this._agent._activateFromViewport(initiator, this._controller);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    if (__DEV__) trace(this._logger, Events.vpDetaching);

    return this._agent._deactivateFromViewport(initiator, this._controller);
  }

  public dispose(): void {
    if (__DEV__) trace(this._logger, Events.vpDispose);

    this._ctx._unregisterViewport(this);
    this._agent._dispose();
    this._agent = (void 0)!;
  }

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(): string {
    const propStrings: string[] = [];
    for (const prop of props) {
      const value = this[prop];
      // Only report props that don't have default values (but always report name)
      // This is a bit naive and dirty right now, but it's mostly for debugging purposes anyway. Can clean up later. Maybe put it in a serializer
      switch (typeof value) {
        case 'string':
          if (value !== '') {
            propStrings.push(`${prop}:'${value}'`);
          }
          break;
        default: {
          propStrings.push(`${prop}:${String(value)}`);
        }
      }
    }
    return `VP(ctx:'${this._ctx._friendlyPath}',${propStrings.join(',')})`;
  }
}
defineElement({
  name: 'au-viewport',
  bindables: ['name', 'usedBy', 'default', 'fallback'],
}, ViewportCustomElement);

const props = [
  'name',
  'usedBy',
  'default',
  'fallback',
] as const;
