// No-fallthrough disabled due to large numbers of false positives
/* eslint-disable no-fallthrough */
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
  ResolutionStrategy,
  LifecycleStrategy,
  SwapStrategy,
} from './router';
import {
  TransitionPlan,
} from './route';
import {
  resolveAll,
  runSequence,
  ExposedPromise,
  createExposedPromise,
} from './util';

export class ViewportRequest {
  public constructor(
    public readonly viewportName: string,
    public readonly componentName: string,
    public readonly resolutionStrategy: ResolutionStrategy,
    public readonly append: boolean,
  ) { }

  public static create(
    input: ViewportRequest,
  ): ViewportRequest {
    return new ViewportRequest(
      input.viewportName,
      input.componentName,
      input.resolutionStrategy,
      input.append,
    );
  }

  public toString(): string {
    return `VR(viewport:'${this.viewportName}',component:'${this.componentName}',strat:'${this.resolutionStrategy}',append:${this.append})`;
  }
}

const viewportAgentLookup: WeakMap<object, ViewportAgent> = new WeakMap();

export class ViewportAgent {
  private readonly logger: ILogger;

  private isActive: boolean = false;

  private curCA: ComponentAgent | null = null;
  private nextCA: ComponentAgent | null = null;

  private get $state(): string { return $state(this.state); }
  private state: State = State.bothAreEmpty;
  private get currState(): CurrState { return this.state & State.curr; }
  private set currState(state: CurrState) { this.state = (this.state & State.next) | state; }
  private get nextState(): NextState { return this.state & State.next; }
  private set nextState(state: NextState) { this.state = (this.state & State.curr) | state; }

  private $resolution: ResolutionStrategy = 'dynamic';
  private $lifecycle: LifecycleStrategy = 'parallel';
  private $plan: TransitionPlan = 'replace';
  private $swap: SwapStrategy = 'add-first';
  private nextNode: RouteNode | null = null;

  private deferredSwap: ExposedPromise<void> | null = null;

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
    this.isActive = true;

    switch (this.currState) {
      case State.currIsActive:
        this.logger.trace(`activateFromViewport() - activating existing componentAgent at %s`, this);
        return this.curCA!.activate(initiator, parent, flags);
      case State.currIsEmpty:
      case State.currLeaveDone:
        switch (this.nextState) {
          case State.nextIsEmpty:
            this.logger.trace(`activateFromViewport() - nothing to activate at %s`, this);
            return;
          case State.nextCanEnterDone:
            if (this.$resolution === 'static' && this.$lifecycle === 'parallel') {
              this.logger.trace(`activateFromViewport() - activating nextCA at %s`, this);
              this.nextState = State.nextActivate;
              return runSequence(
                () => { return this.nextCA!.enter(this.nextNode!); },
                () => { return this.nextCA!.activate(initiator, parent, flags); },
              );
            }
            this.unexpectedState('activateFromViewport 1');
          case State.nextEnterDone:
            switch (this.$resolution) {
              case 'static':
                this.logger.trace(`activateFromViewport() - activating nextCA at %s`, this);
                this.nextState = State.nextActivate;
                return this.nextCA!.activate(initiator, parent, flags);
              case 'dynamic':
                switch (this.$plan) {
                  case 'none':
                  case 'invoke-lifecycles':
                    this.logger.trace(`activateFromViewport() - activating nextCA at %s`, this);
                    this.nextState = State.nextActivate;
                    return this.nextCA!.activate(initiator, parent, flags);
                  case 'replace':
                    this.logger.trace(`activateFromViewport() - deferring activation at %s`, this);
                    return;
                }
            }
          default:
            this.unexpectedState('activateFromViewport 2');
        }
      default:
        this.unexpectedState('activateFromViewport 3');
    }
  }

  public deactivateFromViewport(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.isActive = false;

    switch (this.currState) {
      case State.currIsEmpty:
        this.logger.trace(`deactivateFromViewport() - nothing to deactivate at %s`, this);
        return;
      case State.currDeactivate:
        // This will happen with bottom-up deactivation because the child is already deactivated, the parent
        // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
        // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
        this.logger.trace(`deactivateFromViewport() - already deactivating at %s`, this);
        return;
      case State.currIsActive:
      case State.currLeaveDone:
        this.logger.trace(`deactivateFromViewport() - deactivating curCA at %s`, this);
        this.currState = State.currDeactivate;
        return this.curCA!.deactivate(initiator, parent, flags);
      default:
        this.unexpectedState('deactivateFromViewport 1');
    }
  }

  public handles(req: ViewportRequest): boolean {
    if (req.resolutionStrategy === 'dynamic' && !this.isActive) {
      this.logger.trace(`handles(req:%s) -> false (viewport is not active and we're in dynamic resolution mode)`, req);
      return false;
    }

    if (this.nextState === State.nextIsScheduled) {
      this.logger.trace(`handles(req:%s) -> false (update already scheduled for %s)`, req, this.nextNode);
      return false;
    }

    if (req.append && this.currState === State.currIsActive) {
      this.logger.trace(`handles(req:%s) -> false (append mode, viewport already has content %s)`, req, this.curCA);
      return false;
    }

    if (req.viewportName.length > 0 && this.viewport.name !== req.viewportName) {
      this.logger.trace(`handles(req:%s) -> false (names don't match)`, req);
      return false;
    }

    if (this.viewport.usedBy.length > 0 && !this.viewport.usedBy.split(',').includes(req.componentName)) {
      this.logger.trace(`handles(req:%s) -> false (componentName not included in usedBy)`, req);
      return false;
    }

    this.logger.trace(`handles(req:%s) -> true`, req);
    return true;
  }

  public scheduleUpdate(
    resolutionStrategy: ResolutionStrategy,
    lifecycleStrategy: LifecycleStrategy,
    swapStrategy: SwapStrategy,
    next: RouteNode,
  ): void {
    switch (this.nextState) {
      case State.nextIsEmpty:
        this.nextNode = next;
        this.nextState = State.nextIsScheduled;
        this.$resolution = resolutionStrategy;
        this.$lifecycle = lifecycleStrategy;
        this.$swap = swapStrategy;
        break;
      default:
        this.unexpectedState('scheduleUpdate 1');
    }

    switch (this.currState) {
      case State.currIsEmpty:
      case State.currIsActive:
        break;
      default:
        this.unexpectedState('scheduleUpdate 2');
    }

    const cur = this.curCA?.routeNode ?? null;
    if (cur === null || cur.component !== next.component) {
      // Component changed (or is cleared), so set to 'replace'
      this.$plan = 'replace';
    } else {
      // Component is the same, so determine plan based on config and/or convention
      const plan = next.context.definition.config.transitionPlan;
      if (typeof plan === 'function') {
        this.$plan = plan(cur, next);
      } else {
        this.$plan = plan;
      }
    }

    switch (this.$plan) {
      case 'none':
      case 'invoke-lifecycles':
        this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s', compiling residue`, next, this.$plan);

        // These plans can only occur if there is already a current component active in this viewport,
        // and it is the same component as `next`.
        // This means the RouteContext of `next` was created during a previous transition and might contain
        // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
        // first pass of `Router.invokeLifecycles` instead of lazily in a later pass during `Router.processResidue`.
        // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
        // their target viewports have the appropriate updates scheduled.
        RouteTreeCompiler.compileResidue(next.tree, next.tree.instructions, next.context);
        break;
      case 'replace':
        // In the case of 'replace', always process this node and its subtree as if it's a new one
        switch (resolutionStrategy) {
          case 'dynamic':
            this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s' (strat: 'dynamic'), deferring residue compilation`, next, this.$plan);

            // In dynamic mode, that means doing nothing here because child resolution will happen after this node is activated
            break;
          case 'static': {
            this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s' (strat: 'static'), creating nextCA and compiling residue`, next, this.$plan);

            // In static mode, immediately create the component and drill down
            const controller = this.hostController as ICustomElementController<HTMLElement>;
            this.nextCA = next.context.createComponentAgent(controller, next);
            RouteTreeCompiler.compileResidue(next.tree, next.tree.instructions, next.context);
            break;
          }
        }
    }
  }

  public cancelUpdate(): void {
    this.logger.trace(`cancelUpdate(nextNode:%s)`, this.nextNode);

    switch (this.currState) {
      case State.currIsEmpty:
      case State.currIsActive:
        break;
      case State.currCanLeave:
      case State.currCanLeaveDone:
        this.currState = State.currIsActive;
        break;
      case State.currLeave:
      case State.currDeactivate:
        // TODO: should schedule an 'undo' action
        break;
    }

    switch (this.nextState) {
      case State.nextIsEmpty:
      case State.nextIsScheduled:
      case State.nextCanEnter:
      case State.nextCanEnterDone:
        this.nextNode = null;
        this.nextState = State.nextIsEmpty;
        break;
      case State.nextEnter:
      case State.nextActivate:
        // TODO: should schedule an 'undo' action
        break;
    }
  }

  public canLeave(tr: Transition): void | Promise<void> {
    if (tr.guardsResult !== true) {
      this.logger.trace(`canLeave() - skipping: guardsResult is already non-true`);
      return;
    }

    switch (this.currState) {
      case State.currIsActive:
        switch (this.$plan) {
          case 'none':
            this.currState = State.currCanLeaveDone;
            this.logger.trace(`canLeave() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
          case 'replace':
            this.currState = State.currCanLeave;
            return this.runCanLeave(tr, this.curCA!, this.nextNode);
        }
      case State.currIsEmpty:
      case State.currCanLeave:
      case State.currCanLeaveDone:
      case State.currDeactivate:
        this.logger.trace(`canLeave() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('canLeave 1');
    }
  }

  private runCanLeave(tr: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    this.logger.trace(`runCanLeave() - starting [canLeave]`);

    return runSequence(
      () => { return ca.canLeave(nextNode); },
      (_, result) => {
        this.currState = State.currCanLeaveDone;
        // Check again, because the value might have been assigned by a parallel hook
        if (tr.guardsResult === true && result !== true) {
          this.logger.trace(`runCanLeave() - finished [canLeave], %s.canLeave returned %s, assigning to guardsResult`, ca, result);
          tr.guardsResult = result;
        } else {
          this.logger.trace(`runCanLeave() - finished [canLeave], %s.canLeave returned %s, ignoring`, ca, result);
        }
      },
    );
  }

  public leave(tr: Transition): void | Promise<void> {
    ensureGuardsResultIsTrue(tr);
    switch (this.currState) {
      case State.currCanLeaveDone:
        switch (this.$plan) {
          case 'none':
            this.currState = State.currLeaveDone;
            this.logger.trace(`leave() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
          case 'replace':
            this.currState = State.currLeave;
            return this.runLeave(tr, this.curCA!, this.nextNode);
        }
      case State.currIsEmpty:
      case State.currLeave:
      case State.currDeactivate:
        this.logger.trace(`leave() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('leave 1');
    }
  }

  private runLeave(tr: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    this.logger.trace(`runLeave() - starting [leave]`);

    return runSequence(
      () => { return ca.leave(nextNode); },
      () => {
        this.currState = State.currLeaveDone;
        this.logger.trace(`runLeave() - finished [leave`);
      },
    );
  }

  public deactivateFromRouter(tr: Transition): void | Promise<void> {
    ensureGuardsResultIsTrue(tr);
    switch (this.currState) {
      case State.currLeaveDone:
        this.currState = State.currDeactivate;
        switch (this.$plan) {
          case 'none':
          case 'invoke-lifecycles':
            this.logger.trace(`deactivateFromRouter() - skipping: %s`, this);
            return;
          case 'replace':
            switch (this.nextState) {
              case State.nextCanEnterDone:
                if (this.$lifecycle === 'parallel' && this.$swap === 'remove-first') {
                  return this.runDeactivate(tr);
                }
                // falls through
              case State.nextCanEnter:
                if (this.$lifecycle === 'parallel') {
                  this.logger.trace(`deactivateFromRouter() - deferring swap operation 1: %s`, this);
                  return this.deferredSwap = createExposedPromise();
                }
                this.unexpectedState('deactivateFromRouter 1');
              case State.nextEnterDone:
                if (this.$swap === 'remove-first') {
                  return this.runDeactivate(tr);
                }
                // falls through
              case State.nextEnter:
                this.logger.trace(`deactivateFromRouter() - deferring swap operation 2: %s`, this);
                return this.deferredSwap = createExposedPromise();
              case State.nextIsEmpty:
              case State.nextActivate:
                return this.swap(tr);
              default:
                this.unexpectedState('deactivateFromRouter 2');
            }
        }
      case State.currCanLeaveDone:
        switch (this.$lifecycle) {
          case 'phased':
            this.unexpectedState('deactivateFromRouter 3');
          case 'parallel':
            switch (this.nextState) {
              case State.nextCanEnter:
              case State.nextCanEnterDone:
              case State.nextEnter:
              case State.nextEnterDone:
                this.logger.trace(`deactivateFromRouter() - deferring swap operation 3: %s`, this);
                return this.deferredSwap = createExposedPromise();
              case State.nextIsEmpty:
              case State.nextActivate:
                // TODO: leave?
                return this.swap(tr);
              default:
                this.unexpectedState('deactivateFromRouter 4');
            }
        }
      case State.currIsEmpty:
      case State.currDeactivate:
        this.logger.trace(`runDeactivate() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('deactivateFromRouter 5');
    }
  }

  private runDeactivate(tr: Transition): void | Promise<void> {
    const ca = this.curCA;
    if (ca === null) {
      this.logger.trace(`runDeactivate() - skipping [deactivate] because no previous component`);
    } else {
      this.logger.trace(`runDeactivate() - starting [deactivate]`);

      const controller = this.hostController as ICustomElementController<HTMLElement>;
      const flags = this.viewport.stateful
        ? LifecycleFlags.none
        : LifecycleFlags.dispose;

      return runSequence(
        () => { return ca.deactivate(null, controller, flags); },
        () => { this.logger.trace(`runDeactivate() - finished [deactivate]`); },
      );
    }
  }

  public canEnter(tr: Transition): void | Promise<void> {
    if (tr.guardsResult !== true) {
      this.logger.trace(`canEnter() - skipping: guardsResult is already non-true`);
      return;
    }

    switch (this.nextState) {
      case State.nextIsScheduled:
        switch (this.$plan) {
          case 'none':
            this.nextState = State.nextCanEnterDone;
            this.logger.trace(`canEnter() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
            this.nextState = State.nextCanEnter;
            return this.runCanEnter(tr, this.curCA!, this.nextNode!);
          case 'replace': {
            this.nextState = State.nextCanEnter;
            const next = this.nextNode!;
            switch (this.$resolution) {
              case 'static': {
                // nextCA was already created during scheduleUpdate, so do nothing
                break;
              }
              case 'dynamic': {
                const controller = this.hostController as ICustomElementController<HTMLElement>;
                this.nextCA = next.context.createComponentAgent(controller, next);
                break;
              }
            }
            const ca = this.nextCA!;
            return this.runCanEnter(tr, ca, next);
          }
        }
      case State.nextIsEmpty:
      case State.nextCanEnter:
      case State.nextCanEnterDone:
      case State.nextActivate:
        this.logger.trace(`canEnter() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('canEnter 1');
    }
  }

  private runCanEnter(tr: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    this.logger.trace(`runCanEnter() - starting [canEnter]`);

    return runSequence(
      () => { return ca.canEnter(nextNode); },
      (_, result) => {
        this.nextState = State.nextCanEnterDone;
        // Check again, because the value might have been assigned by a parallel hook
        if (tr.guardsResult === true && result !== true) {
          this.logger.trace(`runCanEnter() - finished [canEnter], %s.canEnter returned %s, assigning to guardsResult`, ca, result);
          tr.guardsResult = result;
        } else {
          this.logger.trace(`runCanEnter() - finished [canEnter], %s.canEnter returned %s, ignoring`, ca, result);
        }
      },
    );
  }

  public enter(tr: Transition): void | Promise<void> {
    ensureGuardsResultIsTrue(tr);
    switch (this.nextState) {
      case State.nextCanEnterDone:
        switch (this.$plan) {
          case 'none':
            this.nextState = State.nextEnterDone;
            this.logger.trace(`enter() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
            this.nextState = State.nextEnter;
            return this.runEnter(tr, this.curCA!, this.nextNode!);
          case 'replace':
            this.nextState = State.nextEnter;
            return this.runEnter(tr, this.nextCA!, this.nextNode!);
        }
      case State.nextIsEmpty:
      case State.nextEnter:
      case State.nextEnterDone:
      case State.nextActivate:
        this.logger.trace(`enter() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('enter 1');
    }
  }

  private runEnter(transition: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    this.logger.trace(`runEnter() - starting [enter]`);
    return runSequence(
      () => { return ca.enter(nextNode); },
      () => {
        this.nextState = State.nextEnterDone;
        this.logger.trace(`runEnter() - finished [enter]`);
      },
    );
  }

  public activateFromRouter(tr: Transition): void | Promise<void> {
    ensureGuardsResultIsTrue(tr);
    switch (this.nextState) {
      case State.nextEnterDone:
        this.nextState = State.nextActivate;
        switch (this.$plan) {
          case 'none':
          case 'invoke-lifecycles':
            this.logger.trace(`activateFromRouter() - skipping: %s`, this);
            return;
          case 'replace':
            switch (this.currState) {
              case State.currCanLeaveDone:
                if (this.$lifecycle === 'parallel' && this.$swap === 'add-first' && this.curCA!.routeNode.children.length === 0) {
                  return this.runActivate(tr);
                }
                // falls through
              case State.currCanLeave:
                if (this.$lifecycle === 'parallel') {
                  this.logger.trace(`activateFromRouter() - deferring swap operation 4: %s`, this);
                  return this.deferredSwap = createExposedPromise();
                }
                this.unexpectedState('activateFromRouter 1');
              case State.currLeaveDone:
                if (this.$swap === 'add-first' && this.curCA!.routeNode.children.length === 0) {
                  return this.runActivate(tr);
                }
                // falls through
              case State.currLeave:
                this.logger.trace(`activateFromRouter() - deferring swap operation 5: %s`, this);
                return this.deferredSwap = createExposedPromise();
              case State.currIsEmpty:
              case State.currDeactivate:
                return this.swap(tr);
              default:
                this.unexpectedState('activateFromRouter 2');
            }
        }
      case State.nextCanEnterDone:
        switch (this.$lifecycle) {
          case 'phased':
            this.unexpectedState('activateFromRouter 3');
          case 'parallel':
            switch (this.currState) {
              case State.currCanLeave:
              case State.currLeave:
                this.logger.trace(`activateFromRouter() - deferring swap operation 6: %s`, this);
                return this.deferredSwap = createExposedPromise();
              case State.currIsEmpty:
              case State.currDeactivate:
                return this.swap(tr);
              default:
                this.unexpectedState('activateFromRouter 4');
            }
        }
      case State.nextIsEmpty:
      case State.nextActivate:
        this.logger.trace(`activateFromRouter() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('activateFromRouter 5');
    }
  }

  private runActivate(tr: Transition): void | Promise<void> {
    this.logger.trace(`runActivate() - starting [activate]`);

    const ca = this.nextCA!;
    const controller = this.hostController as ICustomElementController<HTMLElement>;
    const flags = LifecycleFlags.none;

    return runSequence(
      () => { return ca.activate(null, controller, flags); },
      () => { this.logger.trace(`runActivate() - finished [activate]`); },
    );
  }

  private swap(tr: Transition): void | Promise<void> {
    this.logger.trace(`swap(swapStrategy:'${tr.options.swapStrategy}') - starting [swap]`);

    return runSequence(
      () => {
        if (this.curCA === null) {
          return this.runActivate(tr);
        }
        if (this.nextCA === null) {
          return this.runDeactivate(tr);
        }

        switch (tr.options.swapStrategy) {
          case 'add-first':
            return runSequence(
              () => { return this.runActivate(tr); },
              () => { return this.runDeactivate(tr); },
            );
          case 'remove-first':
            return runSequence(
              () => { return this.runDeactivate(tr); },
              () => { return this.runActivate(tr); },
            );
          case 'parallel':
            return resolveAll([
              this.runDeactivate(tr),
              this.runActivate(tr),
            ]);
        }
      },
      () => { this.logger.trace(`swap(swapStrategy:'${tr.options.swapStrategy}') - finished [swap]`); },
      () => {
        if (this.deferredSwap !== null) {
          this.deferredSwap.resolve();
          this.deferredSwap = null;
        }
      },
    );
  }

  public dispose(): void {
    if (this.viewport.stateful /* TODO: incorporate statefulHistoryLength / router opts as well */) {
      this.logger.trace(`dispose() - not disposing stateful viewport at %s`, this);
    } else {
      this.logger.trace(`dispose() - disposing %s`, this);
      this.curCA?.dispose();
    }
  }

  public endTransition(tr: Transition): void {
    switch (this.nextState) {
      case State.nextIsEmpty:
        switch (this.currState) {
          case State.currDeactivate:
            this.logger.trace(`endTransition() - setting currState to State.nextIsEmpty at %s`, this);

            this.currState = State.currIsEmpty;
            this.curCA = null;
            break;
          default:
            this.unexpectedState('endTransition 1');
        }
        break;
      case State.nextActivate:
        switch (this.currState) {
          case State.currIsEmpty:
          case State.currDeactivate:
            switch (this.$plan) {
              case 'none':
              case 'invoke-lifecycles':
                this.logger.trace(`endTransition() - setting currState to State.currIsActive at %s`, this);

                this.currState = State.currIsActive;
                break;
              case 'replace':
                this.logger.trace(`endTransition() - setting currState to State.currIsActive and reassigning curCA at %s`, this);

                this.currState = State.currIsActive;
                this.curCA = this.nextCA;
                break;
            }
            break;
          default:
            this.unexpectedState('endTransition 2');
        }
        break;
      default:
        this.unexpectedState('endTransition 3');
    }

    this.nextState = State.nextIsEmpty;
    this.nextNode = null;
    this.nextCA = null;
  }

  public toString(): string {
    return `VPA(state:${this.$state},plan:'${this.$plan}',lifecycle:'${this.$lifecycle}'resolution:'${this.$resolution}',c:${this.curCA},viewport:${this.viewport})`;
  }

  private unexpectedState(label: string): never {
    const err = new Error(`Unexpected state at ${label} of ${this}`);
    if (this.deferredSwap !== null) {
      this.deferredSwap.reject(err);
    }
    throw err;
  }
}

function ensureGuardsResultIsTrue(tr: Transition): void {
  if (tr.guardsResult !== true) {
    throw new Error(`Unexpected guardsResult ${tr.guardsResult}`);
  }
}

const enum State {
  curr                = 0b1111111_0000000,
  currIsEmpty         = 0b1000000_0000000,
  currIsActive        = 0b0100000_0000000,
  currCanLeave        = 0b0010000_0000000,
  currCanLeaveDone    = 0b0001000_0000000,
  currLeave           = 0b0000100_0000000,
  currLeaveDone       = 0b0000010_0000000,
  currDeactivate      = 0b0000001_0000000,
  next                = 0b0000000_1111111,
  nextIsEmpty         = 0b0000000_1000000,
  nextIsScheduled     = 0b0000000_0100000,
  nextCanEnter        = 0b0000000_0010000,
  nextCanEnterDone    = 0b0000000_0001000,
  nextEnter           = 0b0000000_0000100,
  nextEnterDone       = 0b0000000_0000010,
  nextActivate        = 0b0000000_0000001,
  bothAreEmpty        = 0b1000000_1000000,
}

type CurrState = (
  State.currIsEmpty |
  State.currIsActive |
  State.currCanLeave |
  State.currCanLeaveDone |
  State.currLeave |
  State.currLeaveDone |
  State.currDeactivate
);

type NextState = (
  State.nextIsEmpty |
  State.nextIsScheduled |
  State.nextCanEnter |
  State.nextCanEnterDone |
  State.nextEnter |
  State.nextEnterDone |
  State.nextActivate
);

// Stringifying uses arrays and does not have a negligible cost, so cache the results to not let trace logging
// in and of its own slow things down too much.
const $stateCache = new Map<State, string>();
function $state(state: State): string {
  let str = $stateCache.get(state);
  if (str === void 0) {
    $stateCache.set(state, str = stringifyState(state));
  }
  return str;
}
function stringifyState(state: State): string {
  const flags: string[] = [];

  if ((state & State.currIsEmpty) === State.currIsEmpty) {
    flags.push('currIsEmpty');
  }
  if ((state & State.currIsActive) === State.currIsActive) {
    flags.push('currIsActive');
  }
  if ((state & State.currCanLeave) === State.currCanLeave) {
    flags.push('currCanLeave');
  }
  if ((state & State.currCanLeaveDone) === State.currCanLeaveDone) {
    flags.push('currCanLeaveDone');
  }
  if ((state & State.currLeave) === State.currLeave) {
    flags.push('currLeave');
  }
  if ((state & State.currLeaveDone) === State.currLeaveDone) {
    flags.push('currLeaveDone');
  }
  if ((state & State.currDeactivate) === State.currDeactivate) {
    flags.push('currDeactivate');
  }
  if ((state & State.nextIsEmpty) === State.nextIsEmpty) {
    flags.push('nextIsEmpty');
  }
  if ((state & State.nextIsScheduled) === State.nextIsScheduled) {
    flags.push('nextIsScheduled');
  }
  if ((state & State.nextCanEnter) === State.nextCanEnter) {
    flags.push('nextCanEnter');
  }
  if ((state & State.nextCanEnterDone) === State.nextCanEnterDone) {
    flags.push('nextCanEnterDone');
  }
  if ((state & State.nextEnter) === State.nextEnter) {
    flags.push('nextEnter');
  }
  if ((state & State.nextEnterDone) === State.nextEnterDone) {
    flags.push('nextEnterDone');
  }
  if ((state & State.nextActivate) === State.nextActivate) {
    flags.push('nextActivate');
  }

  return flags.join('|');
}
