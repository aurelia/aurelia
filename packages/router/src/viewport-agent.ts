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
  private currentTransition: Transition | null = null;

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
    const tr = this.currentTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
    this.isActive = true;

    switch (this.currState) {
      case State.currIsActive:
        this.logger.trace(`activateFromViewport() - activating existing componentAgent at %s`, this);
        return this.curCA!.activate(initiator, parent, flags);
      case State.currIsEmpty:
      case State.currUnloadDone:
        switch (this.nextState) {
          case State.nextIsEmpty:
            this.logger.trace(`activateFromViewport() - nothing to activate at %s`, this);
            return;
          case State.nextCanLoadDone:
            if (this.$resolution === 'static' && this.$lifecycle === 'parallel') {
              this.logger.trace(`activateFromViewport() - activating nextCA at %s`, this);
              this.nextState = State.nextActivate;
              return runSequence(
                () => { return this.nextCA!.load(this.nextNode!); },
                () => { return this.nextCA!.activate(initiator, parent, flags); },
              );
            }
            this.unexpectedState('activateFromViewport 1');
          case State.nextLoadDone:
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
    const tr = this.currentTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
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
      case State.currUnloadDone:
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
      case State.currCanUnload:
      case State.currCanUnloadDone:
        this.currState = State.currIsActive;
        break;
      case State.currUnload:
      case State.currDeactivate:
        // TODO: should schedule an 'undo' action
        break;
    }

    switch (this.nextState) {
      case State.nextIsEmpty:
      case State.nextIsScheduled:
      case State.nextCanLoad:
      case State.nextCanLoadDone:
        this.nextNode = null;
        this.nextState = State.nextIsEmpty;
        break;
      case State.nextLoad:
      case State.nextActivate:
        // TODO: should schedule an 'undo' action
        break;
    }
  }

  public canUnload(tr: Transition): void | Promise<void> {
    if (this.currentTransition === null) { this.currentTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) {
      this.logger.trace(`canUnload() - skipping: guardsResult is already non-true`);
      return;
    }

    switch (this.currState) {
      case State.currIsActive:
        switch (this.$plan) {
          case 'none':
            this.currState = State.currCanUnloadDone;
            this.logger.trace(`canUnload() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
          case 'replace':
            this.currState = State.currCanUnload;
            return this.runCanUnload(tr, this.curCA!, this.nextNode);
        }
      case State.currIsEmpty:
      case State.currCanUnload:
      case State.currCanUnloadDone:
      case State.currDeactivate:
        this.logger.trace(`canUnload() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('canUnload 1');
    }
  }

  private runCanUnload(tr: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    this.logger.trace(`runCanUnload() - starting [canUnload]`);

    return runSequence(
      () => { return ca.canUnload(nextNode); },
      (_, result) => {
        this.currState = State.currCanUnloadDone;
        // Check again, because the value might have been assigned by a parallel hook
        if (tr.guardsResult === true && result !== true) {
          this.logger.trace(`runCanUnload() - finished [canUnload], %s.canUnload returned %s, assigning to guardsResult`, ca, result);
          tr.guardsResult = result;
        } else {
          this.logger.trace(`runCanUnload() - finished [canUnload], %s.canUnload returned %s, ignoring`, ca, result);
        }
      },
    );
  }

  public unload(tr: Transition): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(tr);
    switch (this.currState) {
      case State.currCanUnloadDone:
        switch (this.$plan) {
          case 'none':
            this.currState = State.currUnloadDone;
            this.logger.trace(`unload() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
          case 'replace':
            this.currState = State.currUnload;
            return this.runUnload(tr, this.curCA!, this.nextNode);
        }
      case State.currIsEmpty:
      case State.currUnload:
      case State.currDeactivate:
        this.logger.trace(`unload() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('unload 1');
    }
  }

  private runUnload(tr: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    this.logger.trace(`runUnload() - starting [unload]`);

    return runSequence(
      () => { return ca.unload(nextNode); },
      () => {
        this.currState = State.currUnloadDone;
        this.logger.trace(`runUnload() - finished [unload`);
      },
    );
  }

  public deactivateFromRouter(tr: Transition): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(tr);
    switch (this.currState) {
      case State.currUnloadDone:
        this.currState = State.currDeactivate;
        switch (this.$plan) {
          case 'none':
          case 'invoke-lifecycles':
            this.logger.trace(`deactivateFromRouter() - skipping: %s`, this);
            return;
          case 'replace':
            switch (this.nextState) {
              case State.nextCanLoadDone:
                if (this.$lifecycle === 'parallel' && this.$swap === 'remove-first') {
                  return this.runDeactivate(tr);
                }
                // falls through
              case State.nextCanLoad:
                if (this.$lifecycle === 'parallel') {
                  this.logger.trace(`deactivateFromRouter() - deferring swap operation 1: %s`, this);
                  return this.deferredSwap = createExposedPromise();
                }
                this.unexpectedState('deactivateFromRouter 1');
              case State.nextLoadDone:
                if (this.$swap === 'remove-first') {
                  return this.runDeactivate(tr);
                }
                // falls through
              case State.nextLoad:
                this.logger.trace(`deactivateFromRouter() - deferring swap operation 2: %s`, this);
                return this.deferredSwap = createExposedPromise();
              case State.nextIsEmpty:
              case State.nextActivate:
                return this.swap(tr);
              default:
                this.unexpectedState('deactivateFromRouter 2');
            }
        }
      case State.currCanUnloadDone:
        switch (this.$lifecycle) {
          case 'phased':
            this.unexpectedState('deactivateFromRouter 3');
          case 'parallel':
            switch (this.nextState) {
              case State.nextCanLoad:
              case State.nextCanLoadDone:
              case State.nextLoad:
              case State.nextLoadDone:
                this.logger.trace(`deactivateFromRouter() - deferring swap operation 3: %s`, this);
                return this.deferredSwap = createExposedPromise();
              case State.nextIsEmpty:
              case State.nextActivate:
                // TODO: unload?
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
    ensureTransitionHasNotErrored(tr);
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

  public canLoad(tr: Transition): void | Promise<void> {
    if (this.currentTransition === null) { this.currentTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) {
      this.logger.trace(`canLoad() - skipping: guardsResult is already non-true`);
      return;
    }

    switch (this.nextState) {
      case State.nextIsScheduled:
        switch (this.$plan) {
          case 'none':
            this.nextState = State.nextCanLoadDone;
            this.logger.trace(`canLoad() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
            this.nextState = State.nextCanLoad;
            return this.runCanLoad(tr, this.curCA!, this.nextNode!);
          case 'replace': {
            this.nextState = State.nextCanLoad;
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
            return this.runCanLoad(tr, ca, next);
          }
        }
      case State.nextIsEmpty:
      case State.nextCanLoad:
      case State.nextCanLoadDone:
      case State.nextActivate:
        this.logger.trace(`canLoad() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('canLoad 1');
    }
  }

  private runCanLoad(tr: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    this.logger.trace(`runCanLoad() - starting [canLoad]`);

    return runSequence(
      () => { return ca.canLoad(nextNode); },
      (_, result) => {
        this.nextState = State.nextCanLoadDone;
        // Check again, because the value might have been assigned by a parallel hook
        if (tr.guardsResult === true && result !== true) {
          this.logger.trace(`runCanLoad() - finished [canLoad], %s.canLoad returned %s, assigning to guardsResult`, ca, result);
          tr.guardsResult = result;
        } else {
          this.logger.trace(`runCanLoad() - finished [canLoad], %s.canLoad returned %s, ignoring`, ca, result);
        }
      },
    );
  }

  public load(tr: Transition): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(tr);
    switch (this.nextState) {
      case State.nextCanLoadDone:
        switch (this.$plan) {
          case 'none':
            this.nextState = State.nextLoadDone;
            this.logger.trace(`load() - skipping: %s`, this);
            return;
          case 'invoke-lifecycles':
            this.nextState = State.nextLoad;
            return this.runLoad(tr, this.curCA!, this.nextNode!);
          case 'replace':
            this.nextState = State.nextLoad;
            return this.runLoad(tr, this.nextCA!, this.nextNode!);
        }
      case State.nextIsEmpty:
      case State.nextLoad:
      case State.nextLoadDone:
      case State.nextActivate:
        this.logger.trace(`load() - skipping: %s`, this);
        return;
      default:
        this.unexpectedState('load 1');
    }
  }

  private runLoad(tr: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    this.logger.trace(`runLoad() - starting [load]`);
    return runSequence(
      () => { return ca.load(nextNode); },
      (_) => {
        this.nextState = State.nextLoadDone;
        this.logger.trace(`runLoad() - finished [load]`);
      },
    );
  }

  public activateFromRouter(tr: Transition): void | Promise<void> {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(tr);
    switch (this.nextState) {
      case State.nextLoadDone:
        this.nextState = State.nextActivate;
        switch (this.$plan) {
          case 'none':
          case 'invoke-lifecycles':
            this.logger.trace(`activateFromRouter() - skipping: %s`, this);
            return;
          case 'replace':
            switch (this.currState) {
              case State.currCanUnloadDone:
                if (this.$lifecycle === 'parallel' && this.$swap === 'add-first' && this.curCA!.routeNode.children.length === 0) {
                  return this.runActivate(tr);
                }
                // falls through
              case State.currCanUnload:
                if (this.$lifecycle === 'parallel') {
                  this.logger.trace(`activateFromRouter() - deferring swap operation 4: %s`, this);
                  return this.deferredSwap = createExposedPromise();
                }
                this.unexpectedState('activateFromRouter 1');
              case State.currUnloadDone:
                if (this.$swap === 'add-first' && this.curCA!.routeNode.children.length === 0) {
                  return this.runActivate(tr);
                }
                // falls through
              case State.currUnload:
                this.logger.trace(`activateFromRouter() - deferring swap operation 5: %s`, this);
                return this.deferredSwap = createExposedPromise();
              case State.currIsEmpty:
              case State.currDeactivate:
                return this.swap(tr);
              default:
                this.unexpectedState('activateFromRouter 2');
            }
        }
      case State.nextCanLoadDone:
        switch (this.$lifecycle) {
          case 'phased':
            this.unexpectedState('activateFromRouter 3');
          case 'parallel':
            switch (this.currState) {
              case State.currCanUnload:
              case State.currUnload:
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
    ensureTransitionHasNotErrored(tr);
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
    ensureTransitionHasNotErrored(tr);
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
    this.currentTransition = null;
    ensureTransitionHasNotErrored(tr);
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

function ensureTransitionHasNotErrored(tr: Transition): void {
  if (tr.error !== void 0) {
    throw tr.error;
  }
}

const enum State {
  curr                = 0b1111111_0000000,
  currIsEmpty         = 0b1000000_0000000,
  currIsActive        = 0b0100000_0000000,
  currCanUnload        = 0b0010000_0000000,
  currCanUnloadDone    = 0b0001000_0000000,
  currUnload           = 0b0000100_0000000,
  currUnloadDone       = 0b0000010_0000000,
  currDeactivate      = 0b0000001_0000000,
  next                = 0b0000000_1111111,
  nextIsEmpty         = 0b0000000_1000000,
  nextIsScheduled     = 0b0000000_0100000,
  nextCanLoad        = 0b0000000_0010000,
  nextCanLoadDone    = 0b0000000_0001000,
  nextLoad           = 0b0000000_0000100,
  nextLoadDone       = 0b0000000_0000010,
  nextActivate        = 0b0000000_0000001,
  bothAreEmpty        = 0b1000000_1000000,
}

type CurrState = (
  State.currIsEmpty |
  State.currIsActive |
  State.currCanUnload |
  State.currCanUnloadDone |
  State.currUnload |
  State.currUnloadDone |
  State.currDeactivate
);

type NextState = (
  State.nextIsEmpty |
  State.nextIsScheduled |
  State.nextCanLoad |
  State.nextCanLoadDone |
  State.nextLoad |
  State.nextLoadDone |
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
  if ((state & State.currCanUnload) === State.currCanUnload) {
    flags.push('currCanUnload');
  }
  if ((state & State.currCanUnloadDone) === State.currCanUnloadDone) {
    flags.push('currCanUnloadDone');
  }
  if ((state & State.currUnload) === State.currUnload) {
    flags.push('currUnload');
  }
  if ((state & State.currUnloadDone) === State.currUnloadDone) {
    flags.push('currUnloadDone');
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
  if ((state & State.nextCanLoad) === State.nextCanLoad) {
    flags.push('nextCanLoad');
  }
  if ((state & State.nextCanLoadDone) === State.nextCanLoadDone) {
    flags.push('nextCanLoadDone');
  }
  if ((state & State.nextLoad) === State.nextLoad) {
    flags.push('nextLoad');
  }
  if ((state & State.nextLoadDone) === State.nextLoadDone) {
    flags.push('nextLoadDone');
  }
  if ((state & State.nextActivate) === State.nextActivate) {
    flags.push('nextActivate');
  }

  return flags.join('|');
}
