/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  ILogger,
} from '@aurelia/kernel';
import {
  IHydratedController,
  IHydratedParentController,
  LifecycleFlags,
  ICompiledCustomElementController,
  ICustomElementController,
} from '@aurelia/runtime';

import {
  IViewport,
} from './resources/viewport';
import {
  ComponentAgent,
} from './component-agent';
import {
  RouteNode,
} from './route-tree';
import {
  Transition,
} from './router';
import {
  IRouteContext,
} from './route-context';

const viewportAgentLookup: WeakMap<object, ViewportAgent> = new WeakMap();

export class ViewportAgent {
  private readonly logger: ILogger;

  public componentAgent: ComponentAgent | null = null;
  private lastTransitionId: number = 0;

  public get isEmpty(): boolean {
    const ca = this.componentAgent;
    return ca === null || ca.routeNode.component === null;
  }

  public constructor(
    public readonly viewport: IViewport,
    public readonly hostController: ICompiledCustomElementController<HTMLElement>,
    public readonly ctx: IRouteContext,
  ) {
    this.logger = ctx.get(ILogger).scopeTo(`ViewportAgent<${ctx.friendlyPath}>`);

    this.logger.trace(`constructor()`);
  }

  public static for(
    viewport: IViewport,
    hostController: ICompiledCustomElementController<HTMLElement>,
    ctx: IRouteContext,
  ): ViewportAgent {
    let viewportAgent = viewportAgentLookup.get(viewport);
    if (viewportAgent === void 0) {
      viewportAgentLookup.set(
        viewport,
        viewportAgent = new ViewportAgent(viewport, hostController, ctx)
      );
    }

    return viewportAgent;
  }

  public async update(
    transition: Transition,
    node: RouteNode,
  ): Promise<void> {
    this.lastTransitionId = transition.id;

    let component = this.componentAgent;
    const controller = this.hostController as ICustomElementController<HTMLElement>;
    const flags = LifecycleFlags.none;
    const ctx = node.context!;

    if (component === null) {
      this.logger.trace(() => `update(transition:${transition},node:${node}) - no componentAgent yet, so creating a new one`);

      component = this.componentAgent = ctx.createComponentAgent(controller, node);
      await component.activate(null, controller, flags);
    } else if (component.isSameComponent(transition, node)) {
      this.logger.trace(() => `update(transition:${transition},node:${node}) - componentAgent already exists and has same component as new node, so updating existing`);

      await component.update(transition, node);
    } else {
      this.logger.trace(() => `update(transition:${transition},node:${node}) - componentAgent already exists but component is different, so deactivating old and creating+activating new`);

      await component.deactivate(null, controller, flags);
      component = this.componentAgent = ctx.createComponentAgent(controller, node);
      await component.activate(null, controller, flags);
    }
  }

  public activate(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace(`activate()`);

    return this.componentAgent?.activate(initiator, parent, flags);
  }

  public deactivate(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace(`deactivate()`);

    return this.componentAgent?.deactivate(initiator, parent, flags);
  }

  /**
   * Returns `true` if this this agent has not been updated by the provided transition.
   */
  public isStale(
    transition: Transition,
  ): boolean {
    return this.lastTransitionId !== transition.id;
  }

  public toString(): string {
    return `ViewportAgent(viewport:${this.viewport},component:${this.componentAgent})`;
  }
}
