import { ILogger } from '@aurelia/kernel';
import {
  bindable,
  customElement,
  ICustomElementViewModel,
  IHydratedController,
  ICustomElementController,
  ICompiledCustomElementController
} from '@aurelia/runtime-html';

import type { ViewportAgent } from '../viewport-agent';
import { IRouteContext } from '../route-context';
import { defaultViewportName, type ViewportInstruction } from '../instructions';
import { type RouteNode } from '../route-tree';

export type FallbackFunction = (viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext) => string | null;

export interface IViewport {
  readonly name: string;
  readonly usedBy: string;
  readonly default: string;
  readonly fallback: string | FallbackFunction;
  /** @internal */
  _getFallback(viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext): string | null;
}

@customElement({ name: 'au-viewport' })
export class ViewportCustomElement implements ICustomElementViewModel, IViewport {
  @bindable public name: string = defaultViewportName;
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public fallback: string | FallbackFunction = '';

  private agent: ViewportAgent = (void 0)!;
  private controller: ICustomElementController = (void 0)!;

  public constructor(
    @ILogger private readonly logger: ILogger,
    @IRouteContext private readonly ctx: IRouteContext,
  ) {
    this.logger = logger.scopeTo(`au-viewport<${ctx.friendlyPath}>`);

    this.logger.trace('constructor()');
  }

  /** @internal */
  public _getFallback(viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext): string | null {
    const fallback = this.fallback;
    return typeof fallback === 'function'
      ? fallback(viewportInstruction, routeNode, context)
      : fallback;
  }

  public hydrated(controller: ICompiledCustomElementController): void {
    this.logger.trace('hydrated()');

    this.controller = controller as ICustomElementController;
    this.agent = this.ctx.registerViewport(this);
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    this.logger.trace('attaching()');

    return this.agent._activateFromViewport(initiator, this.controller);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    this.logger.trace('detaching()');

    return this.agent._deactivateFromViewport(initiator, this.controller);
  }

  public dispose(): void {
    this.logger.trace('dispose()');

    this.ctx.unregisterViewport(this);
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
    return `VP(ctx:'${this.ctx.friendlyPath}',${propStrings.join(',')})`;
  }
}

const props = [
  'name',
  'usedBy',
  'default',
  'fallback',
] as const;
