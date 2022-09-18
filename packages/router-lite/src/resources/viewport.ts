import { ILogger } from '@aurelia/kernel';
import { LifecycleFlags, bindable, customElement, ICustomElementViewModel, IHydratedController, ICustomElementController, ICompiledCustomElementController } from '@aurelia/runtime-html';

import { ViewportAgent } from '../viewport-agent';
import { IRouteContext } from '../route-context';
import { defaultViewportName } from '../route-definition';

export interface IViewport {
  readonly name: string;
  readonly usedBy: string;
  readonly default: string;
  readonly fallback: string;
  readonly stateful: boolean;
}

@customElement({ name: 'au-viewport' })
export class ViewportCustomElement implements ICustomElementViewModel, IViewport {
  @bindable public name: string = defaultViewportName;
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public fallback: string = '';
  @bindable public stateful: boolean = false;

  private agent: ViewportAgent = (void 0)!;
  private controller: ICustomElementController = (void 0)!;

  public constructor(
    @ILogger private readonly logger: ILogger,
    @IRouteContext private readonly ctx: IRouteContext,
  ) {
    this.logger = logger.scopeTo(`au-viewport<${ctx.friendlyPath}>`);

    this.logger.trace('constructor()');
  }

  public hydrated(controller: ICompiledCustomElementController): void {
    this.logger.trace('hydrated()');

    this.controller = controller as ICustomElementController;
    this.agent = this.ctx.registerViewport(this);
  }

  public attaching(initiator: IHydratedController, _parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    this.logger.trace('attaching()');

    return this.agent.activateFromViewport(initiator, this.controller, flags);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    this.logger.trace('detaching()');

    return this.agent.deactivateFromViewport(initiator, this.controller, flags);
  }

  public dispose(): void {
    this.logger.trace('dispose()');

    this.ctx.unregisterViewport(this);
    this.agent.dispose();
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
  'stateful',
] as const;
