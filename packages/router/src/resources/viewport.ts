/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  bindable,
  customElement,
  ICompiledCustomElementController,
  ICustomElementController,
  ICustomElementViewModel,
  IHydratedController,
  IHydratedParentController,
  LifecycleFlags,
} from '@aurelia/runtime';

import {
  ViewportAgent,
} from '../viewport-agent';
import {
  IRouteContext,
} from '../route-context';
import { ILogger } from '@aurelia/kernel';

export interface IViewport {
  readonly name: string;
  readonly usedBy: string;
  readonly default: string;
  readonly fallback: string;
  readonly noScope: boolean;
  readonly noLink: boolean;
  readonly noHistory: boolean;
  readonly stateful: boolean;
}

@customElement({ name: 'au-viewport' })
export class ViewportCustomElement implements ICustomElementViewModel<HTMLElement>, IViewport {
  @bindable public name: string = 'default';
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public fallback: string = '';
  @bindable public noScope: boolean = false;
  @bindable public noLink: boolean = false;
  @bindable public noHistory: boolean = false;
  @bindable public stateful: boolean = false;

  private agent: ViewportAgent = (void 0)!;
  private controller: ICustomElementController<HTMLElement> = (void 0)!;

  public constructor(
    @ILogger private readonly logger: ILogger,
    @IRouteContext private readonly ctx: IRouteContext,
  ) {
    this.logger = logger.scopeTo(`au-viewport<${ctx.friendlyPath}>`);

    this.logger.trace('constructor()');
  }

  protected nameChanged(newName: string, oldName: string): void {
    this.logger.trace(`nameChanged(newName:'${newName}',oldName:'${oldName}')`);

    this.ctx.renameViewportAgent(newName, oldName, this.agent);
  }

  public afterCompile(
    controller: ICompiledCustomElementController<HTMLElement>,
  ): void {
    this.logger.trace('afterCompile()');

    this.controller = controller as ICustomElementController<HTMLElement>;
  }

  public beforeBind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace('beforeBind()');

    if (this.agent === void 0) {
      this.ctx.addViewportAgent(this.name, this.agent = ViewportAgent.for(this, this.controller));
    }
  }

  public afterAttach(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace('afterAttach()');

    return this.agent.activate(initiator, this.controller, flags);
  }

  public afterUnbind(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace('afterUnbind()');

    return this.agent.deactivate(initiator, this.controller, flags);
  }

  public dispose(): void {
    this.logger.trace('dispose()');

    this.ctx.removeViewportAgent(this.name, this.agent);
  }
}
