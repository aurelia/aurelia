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
  Transition, ResolutionStrategy, LifecycleStrategy,
} from './router';
import {
  TransitionPlan,
} from './route';
import {
  resolveAll,
  runSequence,
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

type ExposedPromise<T> = Promise<T> & {
  resolve(value?: T): void;
  reject(reason?: unknown): void;
};

function createExposedPromise<T>(): ExposedPromise<T> {
  let $resolve: (value?: T) => void = (void 0)!;
  let $reject: (reason?: unknown) => void = (void 0)!;
  const promise = new Promise(function (resolve, reject) {
    $resolve = resolve;
    $reject = reject;
  }) as ExposedPromise<T>;
  promise.resolve = $resolve;
  promise.reject = $reject;
  return promise;
}

const viewportAgentLookup: WeakMap<object, ViewportAgent> = new WeakMap();

export class ViewportAgent {
  private readonly logger: ILogger;

  private isActive: boolean = false;

  private curCA: ComponentAgent | null = null;
  private curState: CurrentState = 'empty';
  private nextCA: ComponentAgent | null = null;
  private nextState: NextState = 'empty';

  private resolutionStrategy: ResolutionStrategy = 'dynamic';
  private lifecycleStrategy: LifecycleStrategy = 'parallel';
  private plan: TransitionPlan = 'replace';
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

    switch (this.curState) {
      case 'deactivate':
      case 'canLeave':
        throw new Error(`Unexpected curState at ${this}.activateFromViewport()`);
      case 'isActive':
        this.logger.trace(() => `activateFromViewport() - activating existing componentAgent at ${this}`);
        return this.curCA!.activate(initiator, parent, flags);
      case 'empty':
      case 'leave':
        switch (this.nextState) {
          case 'isScheduled':
          case 'activate':
            throw new Error(`Unexpected nextState at ${this}.activateFromViewport()`);
          case 'canEnter':
            switch (this.lifecycleStrategy) {
              case 'phased':
                throw new Error(`Unexpected nextState at ${this}.activateFromViewport()`);
              case 'parallel':
                switch (this.resolutionStrategy) {
                  case 'static':
                    this.logger.trace(() => `activateFromViewport() - activating nextCA at ${this}`);
                    this.nextState = 'activate';
                    return runSequence(
                      () => { return this.nextCA!.enter(this.nextNode!); },
                      () => { return this.nextCA!.activate(initiator, parent, flags); },
                    );
                  case 'dynamic':
                    throw new Error(`Unexpected nextState at ${this}.activateFromViewport()`);
                }
            }
            break;
          case 'empty':
            this.logger.trace(() => `activateFromViewport() - nothing to activate at ${this}`);
            break;
          case 'enter':
            switch (this.resolutionStrategy) {
              case 'static':
                this.logger.trace(() => `activateFromViewport() - activating nextCA at ${this}`);
                this.nextState = 'activate';
                return this.nextCA!.activate(initiator, parent, flags);
              case 'dynamic':
                switch (this.plan) {
                  case 'none':
                  case 'invoke-lifecycles':
                    this.logger.trace(() => `activateFromViewport() - activating nextCA at ${this}`);
                    this.nextState = 'activate';
                    return this.nextCA!.activate(initiator, parent, flags);
                  case 'replace':
                    this.logger.trace(() => `activateFromViewport() - deferring activation at ${this}`);
                    break;
                }
            }
        }
        break;
    }
  }

  public deactivateFromViewport(
    initiator: IHydratedController<HTMLElement>,
    parent: IHydratedParentController<HTMLElement>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.isActive = false;

    switch (this.curState) {
      case 'canLeave':
        throw new Error(`Unexpected curState at ${this}.activateFromViewport()`);
      case 'empty':
        this.logger.trace(() => `deactivateFromViewport() - nothing to deactivate at ${this}`);
        break;
      case 'deactivate':
        // This will happen with bottom-up deactivation because the child is already deactivated, the parent
        // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
        // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
        this.logger.trace(() => `deactivateFromViewport() - already deactivating at ${this}`);
        break;
      case 'isActive':
      case 'leave':
        this.logger.trace(() => `deactivateFromViewport() - deactivating curCA at ${this}`);
        this.curState = 'deactivate';
        return this.curCA!.deactivate(initiator, parent, flags);
    }
  }

  public handles(req: ViewportRequest): boolean {
    const tracePrefix = `handles(req:${req})`;
    if (req.resolutionStrategy === 'dynamic' && !this.isActive) {
      this.logger.trace(`${tracePrefix} -> false (viewport is not active and we're in dynamic resolution mode)`);
      return false;
    }

    if (this.nextState === 'isScheduled') {
      this.logger.trace(`${tracePrefix} -> false (update already scheduled for ${this.nextNode})`);
      return false;
    }

    if (req.append && this.curState === 'isActive') {
      this.logger.trace(`${tracePrefix} -> false (append mode, viewport already has content ${this.curCA})`);
      return false;
    }

    if (req.viewportName.length > 0 && this.viewport.name !== req.viewportName) {
      this.logger.trace(`${tracePrefix} -> false (names don't match)`);
      return false;
    }

    if (this.viewport.usedBy.length > 0 && !this.viewport.usedBy.split(',').includes(req.componentName)) {
      this.logger.trace(`${tracePrefix} -> false (componentName not included in usedBy)`);
      return false;
    }

    this.logger.trace(`${tracePrefix} -> true`);
    return true;
  }

  public scheduleUpdate(
    resolutionStrategy: ResolutionStrategy,
    lifecycleStrategy: LifecycleStrategy,
    next: RouteNode,
  ): void {
    switch (this.nextState) {
      case 'empty':
        this.nextNode = next;
        this.nextState = 'isScheduled';
        this.resolutionStrategy = resolutionStrategy;
        this.lifecycleStrategy = lifecycleStrategy;
        break;
      case 'isScheduled':
      case 'canEnter':
      case 'enter':
      case 'activate':
        throw new Error(`Unexpected nextState at ${this}.scheduleUpdate(next:${next})`);
    }

    switch (this.curState) {
      case 'empty':
      case 'isActive':
        break;
      case 'canLeave':
      case 'leave':
      case 'deactivate':
        throw new Error(`Unexpected curState at ${this}.scheduleUpdate(next:${next})`);
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

    switch (this.plan) {
      case 'none':
      case 'invoke-lifecycles':
        this.logger.trace(() => `scheduleUpdate(next:${next}) - plan set to '${this.plan}', compiling residue`);

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
            this.logger.trace(() => `scheduleUpdate(next:${next}) - plan set to '${this.plan}' (strat: 'dynamic'), deferring residue compilation`);

            // In dynamic mode, that means doing nothing here because child resolution will happen after this node is activated
            break;
          case 'static': {
            this.logger.trace(() => `scheduleUpdate(next:${next}) - plan set to '${this.plan}' (strat: 'static'), creating nextCA and compiling residue`);

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
    this.logger.trace(() => `cancelUpdate(nextNode:${this.nextNode})`);

    switch (this.curState) {
      case 'empty':
      case 'isActive':
        break;
      case 'canLeave':
        this.curState = 'isActive';
        break;
      case 'leave':
      case 'deactivate':
        // TODO: should schedule an 'undo' action
        break;
    }

    switch (this.nextState) {
      case 'empty':
      case 'isScheduled':
      case 'canEnter':
        this.nextNode = null;
        this.nextState = 'empty';
        break;
      case 'enter':
      case 'activate':
        // TODO: should schedule an 'undo' action
        break;
    }
  }

  public canLeave(tr: Transition): void | Promise<void> {
    switch (this.curState) {
      case 'isActive':
        this.curState = 'canLeave';

        if (tr.guardsResult === true) {
          switch (this.plan) {
            case 'none':
              this.logger.trace(() => `canLeave() - skipping: ${this}`);
              return;
            case 'invoke-lifecycles':
            case 'replace':
              return this.runCanLeave(tr, this.curCA!, this.nextNode);
          }
        }

        this.curState = 'isActive';
        this.logger.trace(() => `canLeave() - skipping: guardsResult is already non-true`);
        break;
      case 'leave': // Implies incorrect invocation order [leave -> canLeave]
        throw new Error(`Unexpected currentState at ${this}.canLeave()`);
      case 'empty':
      case 'canLeave':
      case 'deactivate':
        this.logger.trace(() => `canLeave() - skipping: ${this}`);
        break;
    }
  }

  private runCanLeave(tr: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    this.logger.trace(() => `runCanLeave() - starting [canLeave]`);

    return runSequence(
      () => { return ca.canLeave(nextNode); },
      (_, result) => {
        // Check again, because the value might have been assigned by a parallel hook
        if (tr.guardsResult === true && result !== true) {
          this.logger.trace(() => `runCanLeave() - finished [canLeave], ${ca}.canLeave returned ${result}, assigning to guardsResult`);
          tr.guardsResult = result;
        } else {
          this.logger.trace(() => `runCanLeave() - finished [canLeave], ${ca}.canLeave returned ${result}, ignoring`);
        }
      },
    );
  }

  public leave(tr: Transition): void | Promise<void> {
    switch (this.curState) {
      case 'canLeave':
        this.curState = 'leave';

        if (tr.guardsResult === true) {
          switch (this.plan) {
            case 'none':
              this.logger.trace(() => `leave() - skipping: ${this}`);
              return;
            case 'invoke-lifecycles':
            case 'replace':
              return this.runLeave(tr, this.curCA!, this.nextNode);
          }
        }

        throw new Error(`Unexpected guardsResult ${tr.guardsResult} on invoking [leave]`);
      case 'isActive': // Implies incorrect invocation order [leave] without invoking [canLeave] first
        throw new Error(`Unexpected currentState at ${this}.leave()`);
      case 'empty':
      case 'leave':
      case 'deactivate':
        this.logger.trace(() => `leave() - skipping: ${this}`);
        break;
    }
  }

  private runLeave(tr: Transition, ca: ComponentAgent, nextNode: RouteNode | null): void | Promise<void> {
    this.logger.trace(() => `runLeave() - starting [leave]`);

    return runSequence(
      () => { return ca.leave(nextNode); },
      () => { this.logger.trace(() => `runLeave() - finished [leave`); },
    );
  }

  public deactivateFromRouter(tr: Transition): void | Promise<void> {
    const lifecycleStrategy = tr.options.lifecycleStrategy;
    const prefix = `deactivateFromRouter(lifecycleStrategy:'${lifecycleStrategy}')`;

    switch (this.curState) {
      case 'leave':
        this.curState = 'deactivate';

        if (tr.guardsResult === true) {
          switch (this.plan) {
            case 'none':
            case 'invoke-lifecycles':
              this.logger.trace(() => `${prefix} - skipping: ${this}`);
              return;
            case 'replace':
              switch (this.nextState) {
                case 'empty':
                  this.logger.trace(() => `${prefix} - deactivating immediately: ${this}`);
                  return this.runDeactivate(tr);
                case 'isScheduled':
                  throw new Error(`Unexpected nextState at ${this}.${prefix}`);
                case 'canEnter':
                  switch (lifecycleStrategy) {
                    case 'phased':
                      throw new Error(`Unexpected nextState at ${this}.${prefix}`);
                    case 'parallel':
                      this.logger.trace(() => `${prefix} - deferring swap operation: ${this}`);
                      return this.deferredSwap = createExposedPromise();
                  }
                  break;
                case 'enter':
                  this.logger.trace(() => `${prefix} - deferring swap operation: ${this}`);
                  return this.deferredSwap = createExposedPromise();
                case 'activate':
                  return this.swap(tr);
              }
          }
        }

        throw new Error(`Unexpected guardsResult ${tr.guardsResult} on invoking [deactivate]`);
      case 'isActive': // Implies incorrect invocation order [swap] without invoking router hooks
        throw new Error(`Unexpected currentState at ${this}.runDeactivate()`);
      case 'canLeave':
        switch (lifecycleStrategy) {
          case 'phased':
            throw new Error(`Unexpected currentState at ${this}.runDeactivate()`); // Implies incorrect invocation order [canLeave -> swap]
          case 'parallel':
            switch (this.nextState) {
              case 'empty':
                this.logger.trace(() => `${prefix} - deactivating immediately: ${this}`);
                return this.runDeactivate(tr);
              case 'isScheduled':
                throw new Error(`Unexpected nextState at ${this}.${prefix}`);
              case 'canEnter':
              case 'enter':
                this.logger.trace(() => `${prefix} - deferring swap operation: ${this}`);
                return this.deferredSwap = createExposedPromise();
              case 'activate':
                return this.swap(tr);
            }
        }
        break;
      case 'empty':
      case 'deactivate':
        this.logger.trace(() => `runDeactivate() - skipping: ${this}`);
        return;
    }
  }

  private runDeactivate(tr: Transition): void | Promise<void> {
    const lifecycleStrategy = tr.options.lifecycleStrategy;
    const prefix = `runDeactivate(lifecycleStrategy:'${lifecycleStrategy}')`;

    const ca = this.curCA;
    if (ca === null) {
      this.logger.trace(() => `${prefix} - skipping [deactivate] because no previous component`);
    } else {
      this.logger.trace(() => `${prefix} - starting [deactivate]`);

      const controller = this.hostController as ICustomElementController<HTMLElement>;
      const flags = this.viewport.stateful
        ? LifecycleFlags.none
        : LifecycleFlags.dispose;

      return runSequence(
        () => { return ca.deactivate(null, controller, flags); },
        () => { this.logger.trace(() => `${prefix} - finished [deactivate]`); },
      );
    }
  }

  public canEnter(tr: Transition): void | Promise<void> {
    switch (this.nextState) {
      case 'isScheduled':
        this.nextState = 'canEnter';

        if (tr.guardsResult === true) {
          switch (this.plan) {
            case 'none':
              this.logger.trace(() => `canEnter() - skipping: ${this}`);
              return;
            case 'invoke-lifecycles':
              return this.runCanEnter(tr, this.curCA!, this.nextNode!);
            case 'replace': {
              const next = this.nextNode!;
              switch (this.resolutionStrategy) {
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
        }

        this.nextState = 'isScheduled';
        this.logger.trace(() => `canEnter() - skipping: guardsResult is already non-true`);
        break;
      case 'enter': // Implies incorrect invocation order [enter -> canEnter]
        throw new Error(`Unexpected nextState at ${this}.canEnter()`);
      case 'empty':
      case 'canEnter':
      case 'activate':
        this.logger.trace(() => `canEnter() - skipping: ${this}`);
        return;
    }
  }

  private runCanEnter(tr: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    this.logger.trace(() => `runCanEnter() - starting [canEnter]`);

    return runSequence(
      () => { return ca.canEnter(nextNode); },
      (_, result) => {
        // Check again, because the value might have been assigned by a parallel hook
        if (tr.guardsResult === true && result !== true) {
          this.logger.trace(() => `runCanEnter() - finished [canEnter], ${ca}.canEnter returned ${result}, assigning to guardsResult`);
          tr.guardsResult = result;
        } else {
          this.logger.trace(() => `runCanEnter() - finished [canEnter], ${ca}.canEnter returned ${result}, ignoring`);
        }
      },
    );
  }

  public enter(tr: Transition): void | Promise<void> {
    switch (this.nextState) {
      case 'canEnter':
        this.nextState = 'enter';

        if (tr.guardsResult === true) {
          switch (this.plan) {
            case 'none':
              this.logger.trace(() => `enter() - skipping: ${this}`);
              return;
            case 'invoke-lifecycles':
              return this.runEnter(tr, this.curCA!, this.nextNode!);
            case 'replace':
              return this.runEnter(tr, this.nextCA!, this.nextNode!);
          }
        }

        throw new Error(`Unexpected guardsResult ${tr.guardsResult} on invoking [enter]`);
      case 'isScheduled': // Implies incorrect invocation order [enter] without invoking [canEnter] first
        throw new Error(`Unexpected nextState at ${this}.enter()`);
      case 'empty':
      case 'enter':
      case 'activate':
        this.logger.trace(() => `enter() - skipping: ${this}`);
        return;
    }
  }

  private runEnter(transition: Transition, ca: ComponentAgent, nextNode: RouteNode): void | Promise<void> {
    this.logger.trace(() => `runEnter() - starting [enter]`);
    return runSequence(
      () => { return ca.enter(nextNode); },
      () => { this.logger.trace(() => `runEnter() - finished [enter]`); },
    );
  }

  public activateFromRouter(tr: Transition): void | Promise<void> {
    const lifecycleStrategy = tr.options.lifecycleStrategy;
    const prefix = `activateFromRouter(lifecycleStrategy:'${lifecycleStrategy}')`;
    switch (this.nextState) {
      case 'enter':
        this.nextState = 'activate';

        if (tr.guardsResult === true) {
          switch (this.plan) {
            case 'none':
            case 'invoke-lifecycles':
              this.logger.trace(() => `${prefix} - skipping: ${this}`);
              return;
            case 'replace':
              switch (this.curState) {
                case 'empty':
                  this.logger.trace(() => `${prefix} - activating immediately: ${this}`);
                  return this.runActivate(tr);
                case 'isActive':
                  throw new Error(`Unexpected curState at ${this}.${prefix}`);
                case 'canLeave':
                  switch (lifecycleStrategy) {
                    case 'phased':
                      throw new Error(`Unexpected curState at ${this}.${prefix}`);
                    case 'parallel':
                      this.logger.trace(() => `${prefix} - deferring swap operation: ${this}`);
                      return this.deferredSwap = createExposedPromise();
                  }
                  break;
                case 'leave':
                  this.logger.trace(() => `${prefix} - deferring swap operation: ${this}`);
                  return this.deferredSwap = createExposedPromise();
                case 'deactivate':
                  return this.swap(tr);
              }
          }
        }

        throw new Error(`Unexpected guardsResult ${tr.guardsResult} on invoking [activate]`);
      case 'isScheduled': // Implies incorrect invocation order [swap] without invoking router hooks
        throw new Error(`Unexpected nextState at ${this}.activateFromRouter()`);
      case 'canEnter':
        switch (lifecycleStrategy) {
          case 'phased':
            throw new Error(`Unexpected curState at ${this}.${prefix}`); // Implies incorrect invocation order [canEnter -> swap]
          case 'parallel':
            switch (this.curState) {
              case 'empty':
                this.logger.trace(() => `${prefix} - activating immediately: ${this}`);
                return this.runActivate(tr);
              case 'isActive':
                throw new Error(`Unexpected curState at ${this}.${prefix}`);
              case 'canLeave':
              case 'leave':
                this.logger.trace(() => `${prefix} - deferring swap operation: ${this}`);
                return this.deferredSwap = createExposedPromise();
              case 'deactivate':
                return this.swap(tr);
            }
        }
        break;
      case 'empty':
      case 'activate':
        this.logger.trace(() => `activateFromRouter() - skipping: ${this}`);
        return;
    }
  }

  private runActivate(tr: Transition): void | Promise<void> {
    const lifecycleStrategy = tr.options.lifecycleStrategy;
    const prefix = `runActivate(lifecycleStrategy:'${lifecycleStrategy}')`;
    this.logger.trace(() => `${prefix} - starting [activate]`);

    const ca = this.nextCA!;
    const controller = this.hostController as ICustomElementController<HTMLElement>;
    const flags = LifecycleFlags.none;

    return runSequence(
      () => { return ca.activate(null, controller, flags); },
      () => { this.logger.trace(() => `${prefix} - finished [activate]`); },
    );
  }

  private swap(tr: Transition): void | Promise<void> {
    this.logger.trace(() => `swap(swapStrategy:'${tr.options.swapStrategy}') - starting [swap]`);

    return runSequence(
      () => {
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
      () => { this.logger.trace(() => `swap(swapStrategy:'${tr.options.swapStrategy}') - finished [swap]`); },
      () => {
        this.deferredSwap!.resolve();
        this.deferredSwap = null;
      },
    );
  }

  public dispose(): void {
    if (this.viewport.stateful /* TODO: incorporate statefulHistoryLength / router opts as well */) {
      this.logger.trace(() => `dispose() - not disposing stateful viewport at ${this}`);
    } else {
      this.logger.trace(() => `dispose() - disposing ${this}`);
      this.curCA?.dispose();
    }
  }

  public endTransition(tr: Transition): void {
    switch (this.nextState) {
      case 'empty':
        switch (this.curState) {
          case 'empty': // Shouldn't be possible for nextState and curState to both be empty because that shouldn't end up in the route tree
          case 'isActive':
          case 'canLeave':
          case 'leave':
            throw new Error(`Unexpected curState at ${this}.endTransition()`);
          case 'deactivate':
            this.logger.trace(() => `endTransition() - setting curState to 'empty' at ${this}`);

            this.curState = 'empty';
            this.curCA = null;
        }
        break;
      case 'isScheduled':
      case 'canEnter':
      case 'enter':
        throw new Error(`Unexpected nextState at ${this}.endTransition()`);
      case 'activate':
        switch (this.curState) {
          case 'isActive':
          case 'canLeave':
          case 'leave':
            throw new Error(`Unexpected curState at ${this}.endTransition()`);
          case 'empty':
          case 'deactivate':
            switch (this.plan) {
              case 'none':
              case 'invoke-lifecycles':
                this.logger.trace(() => `endTransition() - setting curState to 'isActive' at ${this}`);

                this.curState = 'isActive';
                break;
              case 'replace':
                this.logger.trace(() => `endTransition() - setting curState to 'isActive' and reassigning curCA at ${this}`);

                this.curState = 'isActive';
                this.curCA = this.nextCA;
                break;
            }
        }
        break;
    }

    this.nextState = 'empty';
    this.nextNode = null;
    this.nextCA = null;
  }

  public toString(): string {
    return `VPA(cur:'${this.curState}',next:'${this.nextState}',plan:'${this.plan}',strat:'${this.resolutionStrategy}',c:${this.curCA},viewport:${this.viewport})`;
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
