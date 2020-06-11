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

const viewportAgentLookup: WeakMap<object, ViewportAgent> = new WeakMap();

export class ViewportAgent {
  public componentAgent: ComponentAgent | null = null;

  public constructor(
    public readonly viewport: IViewport,
    public readonly hostController: ICompiledCustomElementController<HTMLElement>,
  ) {}

  public static for(
    viewport: IViewport,
    hostController: ICompiledCustomElementController<HTMLElement>,
  ): ViewportAgent {
    let viewportAgent = viewportAgentLookup.get(viewport);
    if (viewportAgent === void 0) {
      viewportAgentLookup.set(
        viewport,
        viewportAgent = new ViewportAgent(viewport, hostController)
      );
    }

    return viewportAgent;
  }

  public async update(
    transition: Transition,
    node: RouteNode,
  ): Promise<void> {
    // TODO: this is mostly placeholder right now. Lifecycles could be wired up here, or in the router,
    // or in the component agent. Still need to try and see what makes the most sense.
    if (this.componentAgent === null) {
      this.componentAgent = node.context!.createComponentAgent(
        this.hostController as ICustomElementController<HTMLElement>,
        node,
      );
      await this.componentAgent.activate(
        this.hostController as IHydratedController<HTMLElement>,
        this.hostController as IHydratedParentController<HTMLElement>,
        LifecycleFlags.none,
      );
    }
  }

  public activate(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.componentAgent?.activate(initiator, parent, flags);
  }

  public deactivate(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.componentAgent?.deactivate(initiator, parent, flags);
  }
}
