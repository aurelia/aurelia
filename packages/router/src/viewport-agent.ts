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
  RouteTreeCompiler,
} from './route-tree';
import {
  IRouteContext,
} from './route-context';
import {
  Transition,
} from './router';
import {
  TransitionPlan,
} from './route';
import {
  onResolve,
} from './util';

const viewportAgentLookup: WeakMap<object, ViewportAgent> = new WeakMap();

export class ViewportAgent {
  private readonly logger: ILogger;

  private isViewportActive: boolean = false;

  private curCA: ComponentAgent | null = null;
  private curState: CurrentState = 'empty';
  private nextCA: ComponentAgent | null = null;
  private nextState: NextState = 'empty';

  private plan: TransitionPlan = 'replace';
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

  public activateFromViewport(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace(`activateFromViewport()`);
    this.isViewportActive = true;

    return this.curCA?.activate(initiator, parent, flags);
  }

  public deactivateFromViewport(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.logger.trace(`deactivateFromViewport()`);
    this.isViewportActive = false;

    return this.curCA?.deactivate(initiator, parent, flags);
  }

  public canAccept(
    viewportName: string,
    componentName: string,
    append: boolean,
  ): boolean {
    const tracePrefix = `canAccept(viewportName:'${viewportName}',componentName:'${componentName}',append:${append})`;
    if (!this.isViewportActive) {
      this.logger.trace(`${tracePrefix} -> false (viewport is not active)`);
      return false;
    }

    if (this.nextState === 'isScheduled') {
      this.logger.trace(`${tracePrefix} -> false (update already scheduled for ${this.nextNode})`);
      return false;
    }

    if (append && this.curState === 'isActive') {
      this.logger.trace(`${tracePrefix} -> false (append mode, viewport already has content ${this.curCA})`);
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

  public scheduleUpdate(next: RouteNode): void {
    switch (this.nextState) {
      case 'empty': {
        this.nextNode = next;
        this.nextState = 'isScheduled';
        break;
      }
      case 'isScheduled':
      case 'canEnter':
      case 'enter':
      case 'activate': {
        throw new Error(`Unexpected nextState at ${this}.scheduleUpdate(next:${next})`);
      }
    }

    switch (this.curState) {
      case 'empty':
      case 'isActive': {
        break;
      }
      case 'canLeave':
      case 'leave':
      case 'deactivate': {
        throw new Error(`Unexpected curState at ${this}.scheduleUpdate(next:${next})`);
      }
    }

    const cur = this.curCA?.routeNode ?? null;
    if (cur === null || cur.component !== next.component) {
      // Component changed (or is cleared), so set to 'replace'
      this.plan = 'replace';
    } else {
      // Component is the same, so determine plan based on config and/or convention
      const plan = next.context.definition.config.transitionPlan;
      if (typeof plan === 'function') {
        this.plan = plan(cur, next);
      } else {
        this.plan = plan;
      }
    }

    this.logger.trace(() => `scheduleUpdate(next:${next}) - plan set to '${this.plan}'`);

    switch (this.plan) {
      case 'none':
      case 'invoke-lifecycles': {
        RouteTreeCompiler.compileResidue(next.tree, next.tree.instructions, next.context);
        break;
      }
      case 'replace': {
        break;
      }
    }
  }

  public cancelUpdate(): void {
    this.logger.trace(() => `cancelUpdate(nextNode:${this.nextNode})`);

    switch (this.curState) {
      case 'empty':
      case 'isActive': {
        break;
      }
      case 'canLeave': {
        this.curState = 'isActive';
        break;
      }
      case 'leave':
      case 'deactivate': {
        // TODO: should schedule an 'undo' action
        break;
      }
    }

    switch (this.nextState) {
      case 'empty':
      case 'isScheduled':
      case 'canEnter': {
        this.nextNode = null;
        this.nextState = 'empty';
        break;
      }
      case 'enter':
      case 'activate': {
        // TODO: should schedule an 'undo' action
        break;
      }
    }
  }

  public canLeave(transition: Transition): void | Promise<void> {
    switch (this.curState) {
      case 'isActive': {
        this.curState = 'canLeave';

        if (transition.guardsResult === true) {
          switch (this.plan) {
            case 'none': {
              this.logger.trace(() => `canLeave(transition:${transition}) - skipping: ${this}`);
              return;
            }
            case 'invoke-lifecycles':
            case 'replace': {
              return this.runCanLeave(transition, this.curCA!, this.nextNode);
            }
          }
        }

        this.curState = 'isActive';
        this.logger.trace(() => `canLeave(transition:${transition}) - skipping: guardsResult is already non-true`);
        break;
      }
      case 'leave': { // Implies incorrect invocation order [leave -> canLeave]
        throw new Error(`Unexpected currentState at ${this}.canLeave(transition:${transition})`);
      }
      case 'empty':
      case 'canLeave':
      case 'deactivate': {
        this.logger.trace(() => `canLeave(transition:${transition}) - skipping: ${this}`);
        break;
      }
    }
  }

  private runCanLeave(transition: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    this.logger.trace(() => `runCanLeave(transition:${transition}) - starting [canLeave]`);

    return onResolve(ca.canLeave(nextNode), result => {
      // Check again, because the value might have been assigned by a parallel hook
      if (transition.guardsResult === true && result !== true) {
        this.logger.trace(() => `runCanLeave(transition:${transition}) - finished [canLeave], ${ca}.canLeave returned ${result}, assigning to guardsResult`);
        transition.guardsResult = result;
      } else {
        this.logger.trace(() => `runCanLeave(transition:${transition}) - finished [canLeave], ${ca}.canLeave returned ${result}, ignoring`);
      }
    });
  }

  public leave(transition: Transition): void | Promise<void> {
    switch (this.curState) {
      case 'canLeave': {
        this.curState = 'leave';

        if (transition.guardsResult === true) {
          switch (this.plan) {
            case 'none': {
              this.logger.trace(() => `leave(transition:${transition}) - skipping: ${this}`);
              return;
            }
            case 'invoke-lifecycles':
            case 'replace': {
              return this.runLeave(transition, this.curCA!, this.nextNode);
            }
          }
        }

        throw new Error(`Unexpected guardsResult ${transition.guardsResult} on invoking [leave]`);
      }
      case 'isActive': { // Implies incorrect invocation order [leave] without invoking [canLeave] first
        throw new Error(`Unexpected currentState at ${this}.leave(transition:${transition})`);
      }
      case 'empty':
      case 'leave':
      case 'deactivate': {
        this.logger.trace(() => `leave(transition:${transition}) - skipping: ${this}`);
        break;
      }
    }
  }

  private runLeave(transition: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    this.logger.trace(() => `runLeave(transition:${transition}) - starting [leave]`);

    return onResolve(ca.leave(nextNode), () => {
      this.logger.trace(() => `runLeave(transition:${transition}) - finished [leave`);
    });
  }

  public canEnter(transition: Transition): void | Promise<void> {
    switch (this.nextState) {
      case 'isScheduled': {
        this.nextState = 'canEnter';

        if (transition.guardsResult === true) {
          switch (this.plan) {
            case 'none': {
              this.logger.trace(() => `canEnter(transition:${transition}) - skipping: ${this}`);
              return;
            }
            case 'invoke-lifecycles': {
              return this.runCanEnter(transition, this.curCA!, this.nextNode!);
            }
            case 'replace': {
              const controller = this.hostController as ICustomElementController<HTMLElement>;
              const next = this.nextNode!;
              const ca = this.nextCA = next.context.createComponentAgent(controller, next);
              return this.runCanEnter(transition, ca, next);
            }
          }
        }

        this.nextState = 'isScheduled';
        this.logger.trace(() => `canEnter(transition:${transition}) - skipping: guardsResult is already non-true`);
        break;
      }
      case 'enter': { // Implies incorrect invocation order [enter -> canEnter]
        throw new Error(`Unexpected nextState at ${this}.canEnter(transition:${transition})`);
      }
      case 'empty':
      case 'canEnter':
      case 'activate': {
        this.logger.trace(() => `canEnter(transition:${transition}) - skipping: ${this}`);
        return;
      }
    }
  }

  private runCanEnter(transition: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    this.logger.trace(() => `runCanEnter(transition:${transition}) - starting [canEnter]`);

    return onResolve(ca.canEnter(nextNode), result => {
      // Check again, because the value might have been assigned by a parallel hook
      if (transition.guardsResult === true && result !== true) {
        this.logger.trace(() => `runCanEnter(transition:${transition}) - finished [canEnter], ${ca}.canEnter returned ${result}, assigning to guardsResult`);
        transition.guardsResult = result;
      } else {
        this.logger.trace(() => `runCanEnter(transition:${transition}) - finished [canEnter], ${ca}.canEnter returned ${result}, ignoring`);
      }
    });
  }

  public enter(transition: Transition): void | Promise<void> {
    switch (this.nextState) {
      case 'canEnter': {
        this.nextState = 'enter';

        if (transition.guardsResult === true) {
          switch (this.plan) {
            case 'none': {
              this.logger.trace(() => `enter(transition:${transition}) - skipping: ${this}`);
              return;
            }
            case 'invoke-lifecycles': {
              return this.runEnter(transition, this.curCA!, this.nextNode!);
            }
            case 'replace': {
              return this.runEnter(transition, this.nextCA!, this.nextNode!);
            }
          }
        }

        throw new Error(`Unexpected guardsResult ${transition.guardsResult} on invoking [enter]`);
      }
      case 'isScheduled': { // Implies incorrect invocation order [enter] without invoking [canEnter] first
        throw new Error(`Unexpected nextState at ${this}.enter(transition:${transition})`);
      }
      case 'empty':
      case 'enter':
      case 'activate': {
        this.logger.trace(() => `enter(transition:${transition}) - skipping: ${this}`);
        return;
      }
    }
  }

  private runEnter(transition: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    this.logger.trace(() => `runEnter(transition:${transition}) - starting [enter]`);

    return onResolve(ca.enter(nextNode), () => {
      this.logger.trace(() => `runEnter(transition:${transition}) - finished [enter]`);
    });
  }

  public swap(transition: Transition): void | Promise<void> {
    return onResolve(this.runActivate(transition), () => {
      return this.runDeactivate(transition);
    });
  }

  private runDeactivate(transition: Transition): void | Promise<void> {
    switch (this.curState) {
      case 'leave': {
        this.curState = 'deactivate';

        if (transition.guardsResult === true) {
          switch (this.plan) {
            case 'none':
            case 'invoke-lifecycles': {
              this.logger.trace(() => `runDeactivate(transition:${transition}) - skipping: ${this}`);
              return;
            }
            case 'replace': {
              const ca = this.curCA;
              if (ca === null) {
                this.logger.trace(() => `runDeactivate(transition:${transition}) - skipping [deactivate] because no previous component`);
                return;
              } else {
                this.logger.trace(() => `runDeactivate(transition:${transition}) - starting [deactivate]`);

                const controller = this.hostController as ICustomElementController<HTMLElement>;
                const flags = LifecycleFlags.none;

                return onResolve(ca.deactivate(null, controller, flags), () => {
                  this.logger.trace(() => `runDeactivate(transition:${transition}) - finished [deactivate]`);
                });

              }
            }
          }
        }

        throw new Error(`Unexpected guardsResult ${transition.guardsResult} on invoking [deactivate]`);
      }
      case 'isActive': // Implies incorrect invocation order [swap] without invoking router hooks
      case 'canLeave': { // Implies incorrect invocation order [canLeave -> swap]
        throw new Error(`Unexpected currentState at ${this}.runDeactivate(transition:${transition})`);
      }
      case 'empty':
      case 'deactivate': {
        this.logger.trace(() => `runDeactivate(transition:${transition}) - skipping: ${this}`);
        return;
      }
    }
  }

  private runActivate(transition: Transition): void | Promise<void> {
    switch (this.nextState) {
      case 'enter': {
        this.nextState = 'activate';

        if (transition.guardsResult === true) {
          switch (this.plan) {
            case 'none':
            case 'invoke-lifecycles': {
              this.logger.trace(() => `runActivate(transition:${transition}) - ${this}`);
              return;
            }
            case 'replace': {
              this.logger.trace(() => `runActivate(transition:${transition}) - starting [activate]`);

              const ca = this.nextCA!;
              const controller = this.hostController as ICustomElementController<HTMLElement>;
              const flags = LifecycleFlags.none;

              return onResolve(ca.activate(null, controller, flags), () => {
                this.logger.trace(() => `runActivate(transition:${transition}) - finished [activate]`);
              });
            }
          }
        }

        throw new Error(`Unexpected guardsResult ${transition.guardsResult} on invoking [activate]`);
      }
      case 'isScheduled': // Implies incorrect invocation order [swap] without invoking router hooks
      case 'canEnter': { // Implies incorrect invocation order [canEnter -> swap]
        throw new Error(`Unexpected nextState at ${this}.runActivate(transition:${transition})`);
      }
      case 'empty':
      case 'activate': {
        this.logger.trace(() => `runActivate(transition:${transition}) - skipping: ${this}`);
        return;
      }
    }
  }

  public endTransition(transition: Transition): void {
    switch (this.nextState) {
      case 'empty': {
        switch (this.curState) {
          case 'empty': // Shouldn't be possible for nextState and curState to both be empty because that shouldn't end up in the route tree
          case 'isActive':
          case 'canLeave':
          case 'leave': {
            throw new Error(`Unexpected curState at ${this}.endTransition(transition:${transition})`);
          }
          case 'deactivate': {
            this.logger.trace(() => `endTransition(transition:${transition}) - setting curState to 'empty' at ${this}`);

            this.curState = 'empty';
            this.curCA = null;
          }
        }
        break;
      }
      case 'isScheduled':
      case 'canEnter':
      case 'enter': {
        throw new Error(`Unexpected nextState at ${this}.endTransition(transition:${transition})`);
      }
      case 'activate': {
        switch (this.curState) {
          case 'isActive':
          case 'canLeave':
          case 'leave': {
            throw new Error(`Unexpected curState at ${this}.endTransition(transition:${transition})`);
          }
          case 'empty':
          case 'deactivate': {
            switch (this.plan) {
              case 'none':
              case 'invoke-lifecycles': {
                this.logger.trace(() => `endTransition(transition:${transition}) - setting curState to 'isActive' at ${this}`);

                this.curState = 'isActive';
                break;
              }
              case 'replace': {
                this.logger.trace(() => `endTransition(transition:${transition}) - setting curState to 'isActive' and reassigning curCA at ${this}`);

                this.curState = 'isActive';
                this.curCA = this.nextCA;
                break;
              }
            }
          }
        }
        break;
      }
    }

    this.nextState = 'empty';
    this.nextNode = null;
    this.nextCA = null;
  }

  public toString(): string {
    return `VPA(cur:'${this.curState}',next:'${this.nextState}',plan:'${this.plan}',c:${this.curCA},viewport:${this.viewport})`;
  }
}

type NextState = (
  'empty' |
  'isScheduled' |
  'canEnter' |
  'enter' |
  'activate'
);

type CurrentState = (
  'empty' |
  'isActive' |
  'canLeave' |
  'leave' |
  'deactivate'
);
