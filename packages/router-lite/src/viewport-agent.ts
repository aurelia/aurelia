// No-fallthrough disabled due to large numbers of false positives
/* eslint-disable no-fallthrough */
import { ILogger, onResolve, onResolveAll } from '@aurelia/kernel';
import { type IHydratedController, type ICustomElementController, Controller } from '@aurelia/runtime-html';

import type { IViewport } from './resources/viewport';
import type { ComponentAgent } from './component-agent';
import { type RouteNode, createAndAppendNodes } from './route-tree';
import type { IRouteContext } from './route-context';
import type { NavigationOptions, TransitionPlan } from './options';
import type { Transition } from './router';
import { Batch, mergeDistinct } from './util';
import { ViewportInstruction, defaultViewportName } from './instructions';
import { Events, getMessage, trace } from './events';

export class ViewportRequest {
  public constructor(
    public readonly viewportName: string,
    public readonly componentName: string,
  ) { }

  public toString(): string {
    return `VR(viewport:'${this.viewportName}',component:'${this.componentName}')`;
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

  private $plan: TransitionPlan = 'replace';
  private currNode: RouteNode | null = null;
  private nextNode: RouteNode | null = null;

  private currTransition: Transition | null = null;
  /** @internal */
  private _cancellationPromise: Promise<void> | void | null = null;

  private constructor(
    public readonly viewport: IViewport,
    public readonly hostController: ICustomElementController,
    ctx: IRouteContext,
  ) {
    this.logger = ctx.container.get(ILogger).scopeTo(`ViewportAgent<${ctx.friendlyPath}>`);

    if (__DEV__) trace(this.logger, Events.vpaCreated);
  }

  public static for(viewport: IViewport, ctx: IRouteContext): ViewportAgent {
    let viewportAgent = viewportAgentLookup.get(viewport);
    if (viewportAgent === void 0) {
      const controller = Controller.getCachedOrThrow<IViewport>(viewport);
      viewportAgentLookup.set(
        viewport,
        viewportAgent = new ViewportAgent(viewport, controller, ctx)
      );
    }

    return viewportAgent;
  }

  /** @internal */
  public _activateFromViewport(initiator: IHydratedController, parent: IHydratedController): void | Promise<void> {
    const tr = this.currTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
    this.isActive = true;

    const logger = /*@__PURE__*/ this.logger.scopeTo('activateFromViewport()');
    switch (this.nextState) {
      case State.nextIsEmpty:
        switch (this.currState) {
          case State.currIsEmpty:
            if (__DEV__) trace(logger, Events.vpaActivateFromVpNone, this);
            return;
          case State.currIsActive:
            if (__DEV__) trace(logger, Events.vpaActivateFromVpExisting, this);
            return this.curCA!._activate(initiator, parent);
          default:
            this._unexpectedState('activateFromViewport 1');
        }
      case State.nextLoadDone: {
        if (this.currTransition === null) throw new Error(getMessage(Events.vpaUnexpectedActivation, this));
        if (__DEV__) trace(logger, Events.vpaActivateFromVpNext, this);
        const b = Batch.start(b1 => { this._activate(initiator, this.currTransition!, b1); });
        const p = new Promise<void>(resolve => { b.continueWith(() => { resolve(); }); });
        return b.start().done ? void 0 : p;
      }
      default:
        this._unexpectedState('activateFromViewport 2');
    }
  }

  /** @internal */
  public _deactivateFromViewport(initiator: IHydratedController, parent: IHydratedController): void | Promise<void> {
    const tr = this.currTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
    this.isActive = false;

    const logger = /*@__PURE__*/ this.logger.scopeTo('deactivateFromViewport()');
    switch (this.currState) {
      case State.currIsEmpty:
        if (__DEV__) trace(logger, Events.vpaDeactivateFromVpNone, this);
        return;
      case State.currIsActive:
        if (__DEV__) trace(logger, Events.vpaDeactivateFromVpExisting, this);
        return this.curCA!._deactivate(initiator, parent);
      case State.currDeactivate:
        // This will happen with bottom-up deactivation because the child is already deactivated, the parent
        // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
        // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
        if (__DEV__) trace(logger, Events.vpaDeactivationFromVpRunning, this);
        return;
      default: {
        if (this.currTransition === null) throw new Error(getMessage(Events.vpaUnexpectedDeactivation, this));
        if (__DEV__) trace(logger, Events.vpaDeactivateFromVpCurrent, this);
        const b = Batch.start(b1 => { this._deactivate(initiator, this.currTransition!, b1); });
        const p = new Promise<void>(resolve => { b.continueWith(() => { resolve(); }); });
        return b.start().done ? void 0 : p;
      }
    }
  }

  /** @internal */
  public _handles(req: ViewportRequest): boolean {
    if (!this._isAvailable()) {
      return false;
    }

    const $vp = this.viewport;
    const reqVp = req.viewportName;
    const vp = $vp.name;
    const logger = /*@__PURE__*/ this.logger.scopeTo('handles()');
    /*
                     Name from viewport request

                     D (default)         N (Non-default)

          Name from  +-------------------------------------------+
     viewport agent  |                   |                       |
                     |        DD         |          DN           |
                     |    can handle     |      can't handle     |
          D (default)|                   |                       |
                     |                   |                       |
                     +-------------------------------------------+
                     |                   |                       |
     N (Non-default) |        DD         |          DD           |
                     |    can handle     |   can handle only     |
                     |                   |   if the names match  |
                     |                   |                       |
                     +-------------------------------------------+
    */
    if (reqVp !== defaultViewportName && vp !== reqVp) {
      if (__DEV__) trace(logger, Events.vpaHandlesVpMismatch, req, vp);
      return false;
    }

    const usedBy = $vp.usedBy;
    if (usedBy.length > 0 && !usedBy.split(',').includes(req.componentName)) {
      if (__DEV__) trace(logger, Events.vpaHandlesUsedByMismatch, req, usedBy);
      return false;
    }

    if (__DEV__) trace(logger, Events.vpaHandles, vp, req);
    return true;
  }

  /** @internal */
  public _isAvailable(): boolean {
    const logger = /*@__PURE__*/ this.logger.scopeTo('isAvailable()');
    if (!this.isActive) {
      if (__DEV__) trace(logger, Events.vpaIsAvailableInactive);
      return false;
    }

    if (this.nextState !== State.nextIsEmpty) {
      if (__DEV__) trace(logger, Events.vpaIsAvailableScheduled, this.nextNode);
      return false;
    }

    return true;
  }

  /** @internal */
  public _canUnload(tr: Transition, b: Batch): void {
    if (this.currTransition === null) { this.currTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) { return; }

    b.push();

    const logger = /*@__PURE__*/ this.logger.scopeTo('canUnload()');
    void onResolve(this._cancellationPromise, () => {
      // run canUnload bottom-up
      Batch.start(b1 => {
        if (__DEV__) trace(logger, Events.vpaCanUnloadChildren, this);
        for (const node of this.currNode!.children) {
          node.context.vpa._canUnload(tr, b1);
        }
      }).continueWith(b1 => {
        switch (this.currState) {
          case State.currIsActive:
            if (__DEV__) trace(logger, Events.vpaCanUnloadExisting, this);
            switch (this.$plan) {
              case 'none':
                this.currState = State.currCanUnloadDone;
                return;
              case 'invoke-lifecycles':
              case 'replace':
                this.currState = State.currCanUnload;
                b1.push();
                Batch.start(b2 => {
                  if (__DEV__) trace(logger, Events.vpaCanUnloadSelf, this);
                  this.curCA!._canUnload(tr, this.nextNode, b2);
                }).continueWith(() => {
                  if (__DEV__) trace(logger, Events.vpaCanUnloadFinished, this);
                  this.currState = State.currCanUnloadDone;
                  b1.pop();
                }).start();
                return;
            }
          case State.currIsEmpty:
            if (__DEV__) trace(logger, Events.vpaCanUnloadNone, this);
            return;
          default:
            tr.handleError(new Error(`Unexpected state at canUnload of ${this}`));
        }
      }).continueWith(() => {
        b.pop();
      }).start();
    });
  }

  /** @internal */
  public _canLoad(tr: Transition, b: Batch): void {
    if (this.currTransition === null) { this.currTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) { return; }

    b.push();

    const logger = /*@__PURE__*/ this.logger.scopeTo('canLoad()');
    // run canLoad top-down
    Batch.start(b1 => {
      switch (this.nextState) {
        case State.nextIsScheduled:
          if (__DEV__) trace(logger, Events.vpaCanLoadNext, this);
          this.nextState = State.nextCanLoad;
          switch (this.$plan) {
            case 'none':
              return;
            case 'invoke-lifecycles':
              return this.curCA!._canLoad(tr, this.nextNode!, b1);
            case 'replace':
              b1.push();
              void onResolve(
                this.nextNode!.context.createComponentAgent(this.hostController, this.nextNode!),
                ca => {
                  (this.nextCA = ca)._canLoad(tr, this.nextNode!, b1);
                  b1.pop();
                }
              );
          }
        case State.nextIsEmpty:
          if (__DEV__) trace(logger, Events.vpaCanLoadNone, this);
          return;
        default:
          this._unexpectedState('canLoad');
      }
    }).continueWith(b1 => {
      const next = this.nextNode!;
      switch (this.$plan) {
        case 'none':
        case 'invoke-lifecycles': {
          if (__DEV__) trace(logger, Events.vpaCanLoadResidue, next, this.$plan);

          // These plans can only occur if there is already a current component active in this viewport,
          // and it is the same component as `next`.
          // This means the RouteContext of `next` was created during a previous transition and might contain
          // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
          // first pass of activation, instead of lazily in a later pass after `processResidue`.
          // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
          // their target viewports have the appropriate updates scheduled.
          b1.push();
          const ctx = next.context;
          void onResolve(
            ctx.resolved,
            () => onResolve(
              onResolve(
                onResolveAll(
                  ...next.residue.splice(0).map(vi => createAndAppendNodes(this.logger, next, vi))
                ),
                () => onResolveAll(...ctx.getAvailableViewportAgents().reduce((acc, vpa) => {
                  const vp = vpa.viewport;
                  const component = vp.default;
                  if (component === null) return acc;
                  acc.push(createAndAppendNodes(this.logger, next, ViewportInstruction.create({ component, viewport: vp.name, })));
                  return acc;
                }, ([] as (void | Promise<void>)[]))),
              ),
              () => { b1.pop(); }
            )
          );
          return;
        }
        case 'replace':
          if (__DEV__) trace(logger, Events.vpaCanLoadResidueDelay, next);
          return;
      }
    }).continueWith(b1 => {
      switch (this.nextState) {
        case State.nextCanLoad:
          if (__DEV__) trace(logger, Events.vpaCanLoadChildren, this);
          this.nextState = State.nextCanLoadDone;
          for (const node of this.nextNode!.children) {
            node.context.vpa._canLoad(tr, b1);
          }
          return;
        case State.nextIsEmpty:
          return;
        default:
          this._unexpectedState('canLoad');
      }
    }).continueWith(() => {
      if (__DEV__) trace(logger, Events.vpaCanLoadFinished, this);
      b.pop();
    }).start();
  }

  /** @internal */
  public _unloading(tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();
    const logger = /*@__PURE__*/ this.logger.scopeTo('unloading()');

    // run unloading bottom-up
    Batch.start(b1 => {
      if (__DEV__) trace(logger, Events.vpaUnloadingChildren, this);
      for (const node of this.currNode!.children) {
        node.context.vpa._unloading(tr, b1);
      }
    }).continueWith(b1 => {
      switch (this.currState) {
        case State.currCanUnloadDone:
          if (__DEV__) trace(logger, Events.vpaUnloadingExisting, this);
          switch (this.$plan) {
            case 'none':
              this.currState = State.currUnloadDone;
              return;
            case 'invoke-lifecycles':
            case 'replace':
              this.currState = State.currUnload;
              b1.push();
              Batch.start(b2 => {
                if (__DEV__) trace(logger, Events.vpaUnloadingSelf, this);
                this.curCA!._unloading(tr, this.nextNode, b2);
              }).continueWith(() => {
                if (__DEV__) trace(logger, Events.vpaUnloadingFinished, this);
                this.currState = State.currUnloadDone;
                b1.pop();
              }).start();
              return;
          }
        case State.currIsEmpty:
          if (__DEV__) trace(logger, Events.vpaUnloadingNone, this);
          for (const node of this.currNode!.children) {
            node.context.vpa._unloading(tr, b);
          }
          return;
        default:
          this._unexpectedState('unloading');
      }
    }).continueWith(() => {
      b.pop();
    }).start();
  }

  /** @internal */
  public _loading(tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();
    const logger = /*@__PURE__*/ this.logger.scopeTo('loading()');

    // run load top-down
    Batch.start(b1 => {
      switch (this.nextState) {
        case State.nextCanLoadDone: {
          if (__DEV__) trace(logger, Events.vpaLoadingNext, this);
          this.nextState = State.nextLoad;
          switch (this.$plan) {
            case 'none':
              return;
            case 'invoke-lifecycles':
              return this.curCA!._loading(tr, this.nextNode!, b1);
            case 'replace':
              return this.nextCA!._loading(tr, this.nextNode!, b1);
          }
        }
        case State.nextIsEmpty:
          if (__DEV__) trace(logger, Events.vpaLoadingNone, this);
          return;
        default:
          this._unexpectedState('loading');
      }
    }).continueWith(b1 => {
      switch (this.nextState) {
        case State.nextLoad:
          if (__DEV__) trace(logger, Events.vpaLoadingChildren, this);
          this.nextState = State.nextLoadDone;
          for (const node of this.nextNode!.children) {
            node.context.vpa._loading(tr, b1);
          }
          return;
        case State.nextIsEmpty:
          return;
        default:
          this._unexpectedState('loading');
      }
    }).continueWith(() => {
      if (__DEV__) trace(logger, Events.vpaLoadingFinished, this);
      b.pop();
    }).start();
  }

  /** @internal */
  private _deactivate(initiator: IHydratedController | null, tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();
    const logger = /*@__PURE__*/ this.logger.scopeTo('deactivate()');

    switch (this.currState) {
      case State.currUnloadDone:
        if (__DEV__) trace(logger, Events.vpaDeactivateCurrent, this);
        this.currState = State.currDeactivate;
        switch (this.$plan) {
          case 'none':
          case 'invoke-lifecycles':
            b.pop();
            return;
          case 'replace': {
            const controller = this.hostController;
            const curCa = this.curCA!;
            tr.run(() => {
              return onResolve(curCa._deactivate(initiator, controller), () => {
                // Call dispose if initiator is null. If there is an initiator present, then the curCa will be disposed when the initiator is disposed.
                if (initiator === null) {
                  curCa._dispose();
                }
              });
            }, () => {
              b.pop();
            });
          }
        }
        return;
      case State.currIsEmpty:
        if (__DEV__) trace(logger, Events.vpaDeactivateNone, this);
        b.pop();
        return;
      case State.currDeactivate:
        if (__DEV__) trace(logger, Events.vpaDeactivationRunning, this);
        b.pop();
        return;
      default:
        this._unexpectedState('deactivate');
    }
  }

  /** @internal */
  private _activate(initiator: IHydratedController | null, tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();
    const logger = /*@__PURE__*/ this.logger.scopeTo('activate()');

    if (this.nextState === State.nextIsScheduled) {
      if (__DEV__) trace(logger, Events.vpaActivateNextScheduled, this);
      // This is the default v2 mode "lazy loading" situation
      Batch.start(b1 => {
        this._canLoad(tr, b1);
      }).continueWith(b1 => {
        this._loading(tr, b1);
      }).continueWith(b1 => {
        this._activate(initiator, tr, b1);
      }).continueWith(() => {
        b.pop();
      }).start();
      return;
    }

    switch (this.nextState) {
      case State.nextLoadDone:
        if (__DEV__) trace(logger, Events.vpaActivateNext, this);
        this.nextState = State.nextActivate;
        // run activate top-down
        Batch.start(b1 => {
          switch (this.$plan) {
            case 'none':
            case 'invoke-lifecycles':
              return;
            case 'replace': {
              const controller = this.hostController;
              tr.run(() => {
                b1.push();
                return this.nextCA!._activate(initiator, controller);
              }, () => {
                b1.pop();
              });
            }
          }
        }).continueWith(b1 => {
          this._processDynamicChildren(tr, b1);
        }).continueWith(() => {
          b.pop();
        }).start();
        return;
      case State.nextIsEmpty:
        if (__DEV__) trace(logger, Events.vpaActivateNone, this);
        b.pop();
        return;
      default:
        this._unexpectedState('activate');
    }
  }

  /** @internal */
  public _swap(tr: Transition, b: Batch): void {
    const logger = /*@__PURE__*/ this.logger.scopeTo('swap()');
    if (this.currState === State.currIsEmpty) {
      if (__DEV__) trace(logger, Events.vpaSwapEmptyCurr, this);
      this._activate(null, tr, b);
      return;
    }
    if (this.nextState === State.nextIsEmpty) {
      if (__DEV__) trace(logger, Events.vpaSwapEmptyNext, this);
      this._deactivate(null, tr, b);
      return;
    }

    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    if (!(
      this.currState === State.currUnloadDone &&
      this.nextState === State.nextLoadDone
    )) {
      this._unexpectedState('swap');
    }

    this.currState = State.currDeactivate;
    this.nextState = State.nextActivate;

    switch (this.$plan) {
      case 'none':
      case 'invoke-lifecycles': {
        if (__DEV__) trace(logger, Events.vpaSwapSkipToChildren, this);
        const nodes = mergeDistinct(this.nextNode!.children, this.currNode!.children);
        for (const node of nodes) {
          node.context.vpa._swap(tr, b);
        }
        return;
      }
      case 'replace': {
        if (__DEV__) trace(logger, Events.vpaSwap, this);
        const controller = this.hostController;
        const curCA = this.curCA!;
        const nextCA = this.nextCA!;
        b.push();
        Batch.start(b1 => {
          tr.run(() => {
            b1.push();
            return onResolve(curCA._deactivate(null, controller), () => curCA._dispose());
          }, () => {
            b1.pop();
          });
        }).continueWith(b1 => {
          tr.run(() => {
            b1.push();
            return nextCA._activate(null, controller);
          }, () => {
            b1.pop();
          });
        }).continueWith(b1 => {
          this._processDynamicChildren(tr, b1);
        }).continueWith(() => {
          b.pop();
        }).start();
        return;
      }
    }
  }

  /** @internal */
  private _processDynamicChildren(tr: Transition, b: Batch): void {
    if (__DEV__) trace(this.logger, Events.vpaProcessDynamicChildren, this);
    const next = this.nextNode!;

    tr.run(() => {
      b.push();
      const ctx = next.context;
      return onResolve(ctx.resolved, () => {
        const existingChildren = next.children.slice();
        return onResolve(
          onResolveAll(...next
            .residue
            .splice(0)
            .map(vi => createAndAppendNodes(this.logger, next, vi))),
          () => onResolve(
            onResolveAll(...ctx
              .getAvailableViewportAgents()
              .reduce((acc, vpa) => {
                const vp = vpa.viewport;
                const component = vp.default;
                if (component === null) return acc;
                acc.push(createAndAppendNodes(this.logger, next, ViewportInstruction.create({ component, viewport: vp.name, })));
                return acc;
              }, ([] as (void | Promise<void>)[]))
            ),
            () => next.children.filter(x => !existingChildren.includes(x))
          ),
        );
      });
    }, newChildren => {
      Batch.start(b1 => {
        for (const node of newChildren) {
          tr.run(() => {
            b1.push();
            return node.context.vpa._canLoad(tr, b1);
          }, () => {
            b1.pop();
          });
        }
      }).continueWith(b1 => {
        for (const node of newChildren) {
          tr.run(() => {
            b1.push();
            return node.context.vpa._loading(tr, b1);
          }, () => {
            b1.pop();
          });
        }
      }).continueWith(b1 => {
        for (const node of newChildren) {
          tr.run(() => {
            b1.push();
            return node.context.vpa._activate(null, tr, b1);
          }, () => {
            b1.pop();
          });
        }
      }).continueWith(() => {
        b.pop();
      }).start();
    });
  }

  /** @internal */
  public _scheduleUpdate(options: NavigationOptions, next: RouteNode): void {
    switch (this.nextState) {
      case State.nextIsEmpty:
        this.nextNode = next;
        this.nextState = State.nextIsScheduled;
        break;
      default:
        this._unexpectedState('scheduleUpdate 1');
    }

    switch (this.currState) {
      case State.currIsEmpty:
      case State.currIsActive:
      case State.currCanUnloadDone:
        break;
      default:
        this._unexpectedState('scheduleUpdate 2');
    }

    const cur = this.curCA?._routeNode ?? null;
    if (cur === null || cur.component !== next.component) {
      // Component changed (or is cleared), so set to 'replace'
      this.$plan = 'replace';
    } else {
      // Component is the same, so determine plan based on config and/or convention
      this.$plan = options.transitionPlan ?? next.context.config.getTransitionPlan(cur, next);
    }

    if (__DEV__) trace(this.logger, Events.vpaScheduleUpdate, this);
  }

  /** @internal */
  public _cancelUpdate(): void {
    if (this.currNode !== null) {
      this.currNode.children.forEach(function (node) {
        node.context.vpa._cancelUpdate();
      });
    }
    if (this.nextNode !== null) {
      this.nextNode.children.forEach(function (node) {
        node.context.vpa._cancelUpdate();
      });
    }

    if(__DEV__) trace(this.logger, Events.vpaCancelUpdate, this.nextNode);

    let currentDeactivationPromise: void | Promise<void> | null = null;
    let nextDeactivationPromise: void | Promise<void> | null = null;
    switch (this.currState) {
      case State.currIsEmpty:
      case State.currIsActive:
        this.currTransition = null;
        break;
      case State.currCanUnload:
      case State.currCanUnloadDone:
        this.currState = State.currIsActive;
        this.currTransition = null;
        break;
      case State.currUnload:
      case State.currUnloadDone:
      case State.currDeactivate:
        currentDeactivationPromise = onResolve(this.curCA?._deactivate(null, this.hostController), () => {
          this.curCA?._dispose();
          this.currState = State.currIsEmpty;
          this.curCA = null;
        });
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
      case State.nextLoadDone:
      case State.nextActivate: {
        nextDeactivationPromise = onResolve(this.nextCA?._deactivate(null, this.hostController), () => {
          this.nextCA?._dispose();
          this.$plan = 'replace';
          this.nextState = State.nextIsEmpty;
          this.nextCA = null;
          this.nextNode = null;
        });
        break;
      }
    }

    if (currentDeactivationPromise !== null && nextDeactivationPromise !== null) {
      this._cancellationPromise = onResolve(onResolveAll(currentDeactivationPromise, nextDeactivationPromise), () => {
        this.currTransition = null;
        this._cancellationPromise = null;
      });
    }
  }

  /** @internal */
  public _endTransition(): void {
    if (this.currNode !== null) {
      this.currNode.children.forEach(function (node) {
        node.context.vpa._endTransition();
      });
    }
    if (this.nextNode !== null) {
      this.nextNode.children.forEach(function (node) {
        node.context.vpa._endTransition();
      });
    }

    if (this.currTransition !== null) {
      const logger = /*@__PURE__*/ this.logger.scopeTo('endTransition()');
      ensureTransitionHasNotErrored(this.currTransition);
      switch (this.nextState) {
        case State.nextIsEmpty:
          switch (this.currState) {
            case State.currIsEmpty:
            case State.currDeactivate:
              if(__DEV__) trace(logger, Events.vpaEndTransitionEmptyCurr, this);
              this.currState = State.currIsEmpty;
              this.curCA = null;
              break;
            default:
              this._unexpectedState('endTransition 1');
          }
          break;
        case State.nextActivate:
          switch (this.currState) {
            case State.currIsEmpty:
            case State.currDeactivate:
              switch (this.$plan) {
                case 'none':
                case 'invoke-lifecycles':
                  if (__DEV__) trace(logger, Events.vpaEndTransitionActiveCurrLifecycle, this);
                  this.currState = State.currIsActive;
                  break;
                case 'replace':
                  if (__DEV__) trace(logger, Events.vpaEndTransitionActiveCurrReplace, this);
                  this.currState = State.currIsActive;
                  this.curCA = this.nextCA;
                  break;
              }
              this.currNode = this.nextNode!;
              break;
            default:
              this._unexpectedState('endTransition 2');
          }
          break;
        default:
          this._unexpectedState('endTransition 3');
      }

      this.$plan = 'replace';
      this.nextState = State.nextIsEmpty;
      this.nextNode = null;
      this.nextCA = null;
      this.currTransition = null;
    }
  }

  public toString(): string {
    return `VPA(state:${this.$state},plan:'${this.$plan}',n:${this.nextNode},c:${this.currNode},viewport:${this.viewport})`;
  }

  /** @internal */
  public _dispose(): void {
    if (__DEV__) trace(this.logger, Events.vpaDispose, this);
    this.curCA?._dispose();
  }

  /** @internal */
  private _unexpectedState(label: string): never {
    throw new Error(getMessage(Events.vpaUnexpectedState, label, this));
  }
}

function ensureGuardsResultIsTrue(vpa: ViewportAgent, tr: Transition): void {
  if (tr.guardsResult !== true) throw new Error(getMessage(Events.vpaUnexpectedGuardsResult, tr.guardsResult, vpa));
}

function ensureTransitionHasNotErrored(tr: Transition): void {
  if (tr.error !== void 0 && !tr.erredWithUnknownRoute) throw tr.error;
}

const enum State {
  curr              = 0b1111111_0000000,
  currIsEmpty       = 0b1000000_0000000,
  currIsActive      = 0b0100000_0000000,
  currCanUnload     = 0b0010000_0000000,
  currCanUnloadDone = 0b0001000_0000000,
  currUnload        = 0b0000100_0000000,
  currUnloadDone    = 0b0000010_0000000,
  currDeactivate    = 0b0000001_0000000,
  next              = 0b0000000_1111111,
  nextIsEmpty       = 0b0000000_1000000,
  nextIsScheduled   = 0b0000000_0100000,
  nextCanLoad       = 0b0000000_0010000,
  nextCanLoadDone   = 0b0000000_0001000,
  nextLoad          = 0b0000000_0000100,
  nextLoadDone      = 0b0000000_0000010,
  nextActivate      = 0b0000000_0000001,
  bothAreEmpty      = 0b1000000_1000000,
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
