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
  Controller,
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
  IRouteContext,
} from './route-context';

const viewportAgentLookup: WeakMap<object, ViewportAgent> = new WeakMap();

export class ViewportAgent {
  private readonly logger: ILogger;

  public componentAgent: ComponentAgent | null = null;

  private prevNode: RouteNode | null = null;
  private currentNode: RouteNode | null = null;
  private nextNode: RouteNode | null = null;

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
    ctx: IRouteContext,
  ): ViewportAgent {
    let viewportAgent = viewportAgentLookup.get(viewport);
    if (viewportAgent === void 0) {
      const controller = Controller.getCachedOrThrow<HTMLElement, IViewport>(viewport);
      viewportAgentLookup.set(
        viewport,
        viewportAgent = new ViewportAgent(viewport, controller, ctx)
      );
    }

    return viewportAgent;
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

  public scheduleUpdate(node: RouteNode): void {
    this.logger.trace(`scheduleUpdate(node:${node})`);

    this.nextNode = node;
  }

  public cancelUpdate(): void {
    this.logger.trace(`cancelUpdate(nextNode:${this.nextNode})`);

    this.nextNode = null;
  }

  public async update(): Promise<void> {
    this.prevNode = this.currentNode;
    const node = this.currentNode = this.nextNode;
    this.nextNode = null;

    let component = this.componentAgent;
    const controller = this.hostController as ICustomElementController<HTMLElement>;
    const flags = LifecycleFlags.none;
    if (node === null) {
      if (component !== null) {
        this.logger.trace(() => `update(node:${node}) - deactivating ${component}`);
        await component.deactivate(null, controller, flags);
      } else {
        this.logger.trace(() => `update(node:${node}) - nothing to do`);
      }
    } else if (component === null) {
      this.logger.trace(() => `update(node:${node}) - no componentAgent yet, so creating a new one`);

      component = this.componentAgent = node.context.createComponentAgent(controller, node);
      await component.activate(null, controller, flags);
    } else if (component.isSameComponent(node)) {
      this.logger.trace(() => `update(node:${node}) - componentAgent already exists and has same component as new node, so updating existing`);

      await component.update(node);
    } else {
      this.logger.trace(() => `update(node:${node}) - componentAgent already exists but component is different, so deactivating old and creating+activating new`);

      await component.deactivate(null, controller, flags);
      // TODO(fkleuver): figure out if this atomic-updates warning needs to be addressed
      component = this.componentAgent = node.context.createComponentAgent(controller, node);
      await component.activate(null, controller, flags);
    }
  }

  public canAccept(
    viewportName: string,
    componentName: string,
    append: boolean,
  ): boolean {
    const tracePrefix = `canAccept(viewportName:'${viewportName}',componentName:'${componentName}',append:${append})`;
    if (this.nextNode !== null) {
      this.logger.trace(`${tracePrefix} -> false (update already scheduled for ${this.nextNode})`);
      return false;
    }

    if (append && this.currentNode !== null) {
      this.logger.trace(`${tracePrefix} -> false (append mode, viewport already has content ${this.currentNode})`);
      return false;
    }

    if (viewportName.length > 0 && this.viewport.name !== viewportName) {
      this.logger.trace(`${tracePrefix} -> false (names don't match)`);
      return false;
    }

    if (this.viewport.usedBy.length > 0 && !this.viewport.usedBy.split(',').includes(componentName)) {
      this.logger.trace(`${tracePrefix} -> false (componentName not included in usedBy)`);
      return false;
    }

    this.logger.trace(`${tracePrefix} -> true`);
    return true;
  }

  public toString(): string {
    return `ViewportAgent(component:${this.componentAgent},viewport:${this.viewport})`;
  }
}
