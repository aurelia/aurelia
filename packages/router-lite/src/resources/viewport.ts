import { Constructable, ILogger, resolve } from '@aurelia/kernel';
import {
  bindable,
  customElement,
  CustomElement,
  ICompiledCustomElementController,
  ICustomElementController,
  ICustomElementViewModel,
  IHydratedController
} from '@aurelia/runtime-html';

import { traceEvent, TraceEvents } from '../events';
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

@customElement({ name: 'au-viewport' })
export class ViewportCustomElement implements ICustomElementViewModel, IViewport {
  @bindable public name: string = defaultViewportName;
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public fallback: Routeable | FallbackFunction = '';

  private agent: ViewportAgent = (void 0)!;
  private controller: ICustomElementController = (void 0)!;

  /** @internal */
  private readonly _ctx: IRouteContext = resolve(IRouteContext);
  /** @internal */
  private readonly _logger: ILogger = /*@__PURE__*/ (resolve(ILogger).scopeTo(`au-viewport<${this._ctx.friendlyPath}>`));

  /** @internal */
  public _getFallback(viewportInstruction: IViewportInstruction, routeNode: RouteNode, context: IRouteContext): Routeable | null {
    const fallback = this.fallback;
    return typeof fallback === 'function'
      && !CustomElement.isType(fallback as Constructable)
      ? (fallback as FallbackFunction)(viewportInstruction, routeNode, context)
      : fallback;
  }

  public hydrated(controller: ICompiledCustomElementController): void {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, TraceEvents.vpHydrated);

    this.controller = controller as ICustomElementController;
    this.agent = this._ctx.registerViewport(this);
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, TraceEvents.vpAttaching);

    return this.agent._activateFromViewport(initiator, this.controller);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, TraceEvents.vpDetaching);

    return this.agent._deactivateFromViewport(initiator, this.controller);
  }

  public dispose(): void {
    if (__DEV__) /*@__PURE__*/ traceEvent(this._logger, TraceEvents.vpDispose);

    this._ctx.unregisterViewport(this);
    this.agent._dispose();
    this.agent = (void 0)!;
  }

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
        case 'boolean':
          if (value) {
            propStrings.push(`${prop}:${value}`);
          }
          break;
        default: {
          propStrings.push(`${prop}:${String(value)}`);
        }
      }
    }
    return `VP(ctx:'${this._ctx.friendlyPath}',${propStrings.join(',')})`;
  }
}

const props = [
  'name',
  'usedBy',
  'default',
  'fallback',
] as const;
