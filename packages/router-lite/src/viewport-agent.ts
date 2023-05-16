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

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(): string {
    return `VR(viewport:'${this.viewportName}',component:'${this.componentName}')`;
  }
}

const viewportAgentLookup: WeakMap<object, ViewportAgent> = new WeakMap();

export class ViewportAgent {
  /** @internal */ private readonly _logger: ILogger;

  /** @internal */ private _isActive: boolean = false;

  /** @internal */ private _curCA: ComponentAgent | null = null;
  /** @internal */ private _nextCA: ComponentAgent | null = null;

  /** @internal */ private _state: State = State.bothAreEmpty;
  /** @internal */ public get _currState(): CurrState { return this._state & State.curr; }
  /** @internal */ private set _currState(state: CurrState) { this._state = (this._state & State.next) | state; }
  /** @internal */ private get _nextState(): NextState { return this._state & State.next; }
  /** @internal */ private set _nextState(state: NextState) { this._state = (this._state & State.curr) | state; }

  /** @internal */ private _$plan: TransitionPlan = 'replace';
  /** @internal */ public _currNode: RouteNode | null = null;
  /** @internal */ public _nextNode: RouteNode | null = null;

  /** @internal */ private _currTransition: Transition | null = null;
  /** @internal */ private _cancellationPromise: Promise<void> | void | null = null;

  private constructor(
    public readonly viewport: IViewport,
    public readonly hostController: ICustomElementController,
    ctx: IRouteContext,
  ) {
    this._logger = ctx.container.get(ILogger).scopeTo(`ViewportAgent<${ctx._friendlyPath}>`);

    if (__DEV__) trace(this._logger, Events.vpaCreated);
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
    const tr = this._currTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
    this._isActive = true;

    const logger = /*@__PURE__*/ this._logger.scopeTo('activateFromViewport()');
    switch (this._nextState) {
      case State.nextIsEmpty:
        switch (this._currState) {
          case State.currIsEmpty:
            if (__DEV__) trace(logger, Events.vpaActivateFromVpNone, this);
            return;
          case State.currIsActive:
            if (__DEV__) trace(logger, Events.vpaActivateFromVpExisting, this);
            return this._curCA!._activate(initiator, parent);
          default:
            this._unexpectedState('activateFromViewport 1');
        }
      case State.nextLoadDone: {
        if (this._currTransition === null) throw new Error(getMessage(Events.vpaUnexpectedActivation, this));
        if (__DEV__) trace(logger, Events.vpaActivateFromVpNext, this);
        const b = Batch._start(b1 => { this._activate(initiator, this._currTransition!, b1); });
        const p = new Promise<void>(resolve => { b._continueWith(() => { resolve(); }); });
        return b._start()._done ? void 0 : p;
      }
      default:
        this._unexpectedState('activateFromViewport 2');
    }
  }

  /** @internal */
  public _deactivateFromViewport(initiator: IHydratedController, parent: IHydratedController): void | Promise<void> {
    const tr = this._currTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
    this._isActive = false;

    const logger = /*@__PURE__*/ this._logger.scopeTo('deactivateFromViewport()');
    switch (this._currState) {
      case State.currIsEmpty:
        if (__DEV__) trace(logger, Events.vpaDeactivateFromVpNone, this);
        return;
      case State.currIsActive:
        if (__DEV__) trace(logger, Events.vpaDeactivateFromVpExisting, this);
        return this._curCA!._deactivate(initiator, parent);
      case State.currDeactivate:
        // This will happen with bottom-up deactivation because the child is already deactivated, the parent
        // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
        // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
        if (__DEV__) trace(logger, Events.vpaDeactivationFromVpRunning, this);
        return;
      default: {
        if (this._currTransition === null) throw new Error(getMessage(Events.vpaUnexpectedDeactivation, this));
        if (__DEV__) trace(logger, Events.vpaDeactivateFromVpCurrent, this);
        const b = Batch._start(b1 => { this._deactivate(initiator, this._currTransition!, b1); });
        const p = new Promise<void>(resolve => { b._continueWith(() => { resolve(); }); });
        return b._start()._done ? void 0 : p;
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
    const logger = /*@__PURE__*/ this._logger.scopeTo('handles()');
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
    const logger = /*@__PURE__*/ this._logger.scopeTo('isAvailable()');
    if (!this._isActive) {
      if (__DEV__) trace(logger, Events.vpaIsAvailableInactive);
      return false;
    }

    if (this._nextState !== State.nextIsEmpty) {
      if (__DEV__) trace(logger, Events.vpaIsAvailableScheduled, this._nextNode);
      return false;
    }

    return true;
  }

  /** @internal */
  public _canUnload(tr: Transition, b: Batch): void {
    if (this._currTransition === null) { this._currTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) { return; }

    b._push();

    const logger = /*@__PURE__*/ this._logger.scopeTo('canUnload()');
    void onResolve(this._cancellationPromise, () => {
      // run canUnload bottom-up
      Batch._start(b1 => {
        if (__DEV__) trace(logger, Events.vpaCanUnloadChildren, this);
        for (const node of this._currNode!.children) {
          node.context.vpa._canUnload(tr, b1);
        }
      })._continueWith(b1 => {
        switch (this._currState) {
          case State.currIsActive:
            if (__DEV__) trace(logger, Events.vpaCanUnloadExisting, this);
            switch (this._$plan) {
              case 'none':
                this._currState = State.currCanUnloadDone;
                return;
              case 'invoke-lifecycles':
              case 'replace':
                this._currState = State.currCanUnload;
                b1._push();
                Batch._start(b2 => {
                  if (__DEV__) trace(logger, Events.vpaCanUnloadSelf, this);
                  this._curCA!._canUnload(tr, this._nextNode, b2);
                })._continueWith(() => {
                  if (__DEV__) trace(logger, Events.vpaCanUnloadFinished, this);
                  this._currState = State.currCanUnloadDone;
                  b1._pop();
                })._start();
                return;
            }
          case State.currIsEmpty:
            if (__DEV__) trace(logger, Events.vpaCanUnloadNone, this);
            return;
          default:
            tr._handleError(new Error(`Unexpected state at canUnload of ${this}`));
        }
      })._continueWith(() => {
        b._pop();
      })._start();
    });
  }

  /** @internal */
  public _canLoad(tr: Transition, b: Batch): void {
    if (this._currTransition === null) { this._currTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) { return; }

    b._push();

    const logger = /*@__PURE__*/ this._logger.scopeTo('canLoad()');
    // run canLoad top-down
    Batch._start(b1 => {
      switch (this._nextState) {
        case State.nextIsScheduled:
          if (__DEV__) trace(logger, Events.vpaCanLoadNext, this);
          this._nextState = State.nextCanLoad;
          switch (this._$plan) {
            case 'none':
              return;
            case 'invoke-lifecycles':
              return this._curCA!._canLoad(tr, this._nextNode!, b1);
            case 'replace':
              b1._push();
              void onResolve(
                this._nextNode!.context._createComponentAgent(this.hostController, this._nextNode!),
                ca => {
                  (this._nextCA = ca)._canLoad(tr, this._nextNode!, b1);
                  b1._pop();
                }
              );
          }
        case State.nextIsEmpty:
          if (__DEV__) trace(logger, Events.vpaCanLoadNone, this);
          return;
        default:
          this._unexpectedState('canLoad');
      }
    })._continueWith(b1 => {
      const next = this._nextNode!;
      switch (this._$plan) {
        case 'none':
        case 'invoke-lifecycles': {
          if (__DEV__) trace(logger, Events.vpaCanLoadResidue, next, this._$plan);

          // These plans can only occur if there is already a current component active in this viewport,
          // and it is the same component as `next`.
          // This means the RouteContext of `next` was created during a previous transition and might contain
          // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
          // first pass of activation, instead of lazily in a later pass after `processResidue`.
          // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
          // their target viewports have the appropriate updates scheduled.
          b1._push();
          const ctx = next.context;
          void onResolve(
            ctx.allResolved,
            () => onResolve(
              onResolve(
                onResolveAll(
                  ...next.residue.splice(0).map(vi => createAndAppendNodes(this._logger, next, vi))
                ),
                () => onResolveAll(...ctx.getAvailableViewportAgents().reduce((acc, vpa) => {
                  const vp = vpa.viewport;
                  const component = vp.default;
                  if (component === null) return acc;
                  acc.push(createAndAppendNodes(this._logger, next, ViewportInstruction.create({ component, viewport: vp.name, })));
                  return acc;
                }, ([] as (void | Promise<void>)[]))),
              ),
              () => { b1._pop(); }
            )
          );
          return;
        }
        case 'replace':
          if (__DEV__) trace(logger, Events.vpaCanLoadResidueDelay, next);
          return;
      }
    })._continueWith(b1 => {
      switch (this._nextState) {
        case State.nextCanLoad:
          if (__DEV__) trace(logger, Events.vpaCanLoadChildren, this);
          this._nextState = State.nextCanLoadDone;
          for (const node of this._nextNode!.children) {
            node.context.vpa._canLoad(tr, b1);
          }
          return;
        case State.nextIsEmpty:
          return;
        default:
          this._unexpectedState('canLoad');
      }
    })._continueWith(() => {
      if (__DEV__) trace(logger, Events.vpaCanLoadFinished, this);
      b._pop();
    })._start();
  }

  /** @internal */
  public _unloading(tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b._push();
    const logger = /*@__PURE__*/ this._logger.scopeTo('unloading()');

    // run unloading bottom-up
    Batch._start(b1 => {
      if (__DEV__) trace(logger, Events.vpaUnloadingChildren, this);
      for (const node of this._currNode!.children) {
        node.context.vpa._unloading(tr, b1);
      }
    })._continueWith(b1 => {
      switch (this._currState) {
        case State.currCanUnloadDone:
          if (__DEV__) trace(logger, Events.vpaUnloadingExisting, this);
          switch (this._$plan) {
            case 'none':
              this._currState = State.currUnloadDone;
              return;
            case 'invoke-lifecycles':
            case 'replace':
              this._currState = State.currUnload;
              b1._push();
              Batch._start(b2 => {
                if (__DEV__) trace(logger, Events.vpaUnloadingSelf, this);
                this._curCA!._unloading(tr, this._nextNode, b2);
              })._continueWith(() => {
                if (__DEV__) trace(logger, Events.vpaUnloadingFinished, this);
                this._currState = State.currUnloadDone;
                b1._pop();
              })._start();
              return;
          }
        case State.currIsEmpty:
          if (__DEV__) trace(logger, Events.vpaUnloadingNone, this);
          for (const node of this._currNode!.children) {
            node.context.vpa._unloading(tr, b);
          }
          return;
        default:
          this._unexpectedState('unloading');
      }
    })._continueWith(() => {
      b._pop();
    })._start();
  }

  /** @internal */
  public _loading(tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b._push();
    const logger = /*@__PURE__*/ this._logger.scopeTo('loading()');

    // run load top-down
    Batch._start(b1 => {
      switch (this._nextState) {
        case State.nextCanLoadDone: {
          if (__DEV__) trace(logger, Events.vpaLoadingNext, this);
          this._nextState = State.nextLoad;
          switch (this._$plan) {
            case 'none':
              return;
            case 'invoke-lifecycles':
              return this._curCA!._loading(tr, this._nextNode!, b1);
            case 'replace':
              return this._nextCA!._loading(tr, this._nextNode!, b1);
          }
        }
        case State.nextIsEmpty:
          if (__DEV__) trace(logger, Events.vpaLoadingNone, this);
          return;
        default:
          this._unexpectedState('loading');
      }
    })._continueWith(b1 => {
      switch (this._nextState) {
        case State.nextLoad:
          if (__DEV__) trace(logger, Events.vpaLoadingChildren, this);
          this._nextState = State.nextLoadDone;
          for (const node of this._nextNode!.children) {
            node.context.vpa._loading(tr, b1);
          }
          return;
        case State.nextIsEmpty:
          return;
        default:
          this._unexpectedState('loading');
      }
    })._continueWith(() => {
      if (__DEV__) trace(logger, Events.vpaLoadingFinished, this);
      b._pop();
    })._start();
  }

  /** @internal */
  private _deactivate(initiator: IHydratedController | null, tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b._push();
    const logger = /*@__PURE__*/ this._logger.scopeTo('deactivate()');

    switch (this._currState) {
      case State.currUnloadDone:
        if (__DEV__) trace(logger, Events.vpaDeactivateCurrent, this);
        this._currState = State.currDeactivate;
        switch (this._$plan) {
          case 'none':
          case 'invoke-lifecycles':
            b._pop();
            return;
          case 'replace': {
            const controller = this.hostController;
            const curCa = this._curCA!;
            tr._run(() => {
              return onResolve(curCa._deactivate(initiator, controller), () => {
                // Call dispose if initiator is null. If there is an initiator present, then the curCa will be disposed when the initiator is disposed.
                if (initiator === null) {
                  curCa._dispose();
                }
              });
            }, () => {
              b._pop();
            });
          }
        }
        return;
      case State.currIsEmpty:
        if (__DEV__) trace(logger, Events.vpaDeactivateNone, this);
        b._pop();
        return;
      case State.currDeactivate:
        if (__DEV__) trace(logger, Events.vpaDeactivationRunning, this);
        b._pop();
        return;
      default:
        this._unexpectedState('deactivate');
    }
  }

  /** @internal */
  private _activate(initiator: IHydratedController | null, tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b._push();
    const logger = /*@__PURE__*/ this._logger.scopeTo('activate()');

    if (this._nextState === State.nextIsScheduled) {
      if (__DEV__) trace(logger, Events.vpaActivateNextScheduled, this);
      // This is the default v2 mode "lazy loading" situation
      Batch._start(b1 => {
        this._canLoad(tr, b1);
      })._continueWith(b1 => {
        this._loading(tr, b1);
      })._continueWith(b1 => {
        this._activate(initiator, tr, b1);
      })._continueWith(() => {
        b._pop();
      })._start();
      return;
    }

    switch (this._nextState) {
      case State.nextLoadDone:
        if (__DEV__) trace(logger, Events.vpaActivateNext, this);
        this._nextState = State.nextActivate;
        // run activate top-down
        Batch._start(b1 => {
          switch (this._$plan) {
            case 'none':
            case 'invoke-lifecycles':
              return;
            case 'replace': {
              const controller = this.hostController;
              tr._run(() => {
                b1._push();
                return this._nextCA!._activate(initiator, controller);
              }, () => {
                b1._pop();
              });
            }
          }
        })._continueWith(b1 => {
          this._processDynamicChildren(tr, b1);
        })._continueWith(() => {
          b._pop();
        })._start();
        return;
      case State.nextIsEmpty:
        if (__DEV__) trace(logger, Events.vpaActivateNone, this);
        b._pop();
        return;
      default:
        this._unexpectedState('activate');
    }
  }

  /** @internal */
  public _swap(tr: Transition, b: Batch): void {
    const logger = /*@__PURE__*/ this._logger.scopeTo('swap()');
    if (this._currState === State.currIsEmpty) {
      if (__DEV__) trace(logger, Events.vpaSwapEmptyCurr, this);
      this._activate(null, tr, b);
      return;
    }
    if (this._nextState === State.nextIsEmpty) {
      if (__DEV__) trace(logger, Events.vpaSwapEmptyNext, this);
      this._deactivate(null, tr, b);
      return;
    }

    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    if (!(
      this._currState === State.currUnloadDone &&
      this._nextState === State.nextLoadDone
    )) {
      this._unexpectedState('swap');
    }

    this._currState = State.currDeactivate;
    this._nextState = State.nextActivate;

    switch (this._$plan) {
      case 'none':
      case 'invoke-lifecycles': {
        if (__DEV__) trace(logger, Events.vpaSwapSkipToChildren, this);
        const nodes = mergeDistinct(this._nextNode!.children, this._currNode!.children);
        for (const node of nodes) {
          node.context.vpa._swap(tr, b);
        }
        return;
      }
      case 'replace': {
        if (__DEV__) trace(logger, Events.vpaSwap, this);
        const controller = this.hostController;
        const curCA = this._curCA!;
        const nextCA = this._nextCA!;
        b._push();
        Batch._start(b1 => {
          tr._run(() => {
            b1._push();
            return onResolve(curCA._deactivate(null, controller), () => curCA._dispose());
          }, () => {
            b1._pop();
          });
        })._continueWith(b1 => {
          tr._run(() => {
            b1._push();
            return nextCA._activate(null, controller);
          }, () => {
            b1._pop();
          });
        })._continueWith(b1 => {
          this._processDynamicChildren(tr, b1);
        })._continueWith(() => {
          b._pop();
        })._start();
        return;
      }
    }
  }

  /** @internal */
  private _processDynamicChildren(tr: Transition, b: Batch): void {
    if (__DEV__) trace(this._logger, Events.vpaProcessDynamicChildren, this);
    const next = this._nextNode!;

    tr._run(() => {
      b._push();
      const ctx = next.context;
      return onResolve(ctx.allResolved, () => {
        const existingChildren = next.children.slice();
        return onResolve(
          onResolveAll(...next
            .residue
            .splice(0)
            .map(vi => createAndAppendNodes(this._logger, next, vi))),
          () => onResolve(
            onResolveAll(...ctx
              .getAvailableViewportAgents()
              .reduce((acc, vpa) => {
                const vp = vpa.viewport;
                const component = vp.default;
                if (component === null) return acc;
                acc.push(createAndAppendNodes(this._logger, next, ViewportInstruction.create({ component, viewport: vp.name, })));
                return acc;
              }, ([] as (void | Promise<void>)[]))
            ),
            () => next.children.filter(x => !existingChildren.includes(x))
          ),
        );
      });
    }, newChildren => {
      Batch._start(b1 => {
        for (const node of newChildren) {
          tr._run(() => {
            b1._push();
            return node.context.vpa._canLoad(tr, b1);
          }, () => {
            b1._pop();
          });
        }
      })._continueWith(b1 => {
        for (const node of newChildren) {
          tr._run(() => {
            b1._push();
            return node.context.vpa._loading(tr, b1);
          }, () => {
            b1._pop();
          });
        }
      })._continueWith(b1 => {
        for (const node of newChildren) {
          tr._run(() => {
            b1._push();
            return node.context.vpa._activate(null, tr, b1);
          }, () => {
            b1._pop();
          });
        }
      })._continueWith(() => {
        b._pop();
      })._start();
    });
  }

  /** @internal */
  public _scheduleUpdate(options: NavigationOptions, next: RouteNode): void {
    switch (this._nextState) {
      case State.nextIsEmpty:
        this._nextNode = next;
        this._nextState = State.nextIsScheduled;
        break;
      default:
        this._unexpectedState('scheduleUpdate 1');
    }

    switch (this._currState) {
      case State.currIsEmpty:
      case State.currIsActive:
      case State.currCanUnloadDone:
        break;
      default:
        this._unexpectedState('scheduleUpdate 2');
    }

    const cur = this._curCA?._routeNode ?? null;
    if (cur === null || cur.component !== next.component) {
      // Component changed (or is cleared), so set to 'replace'
      this._$plan = 'replace';
    } else {
      // Component is the same, so determine plan based on config and/or convention
      this._$plan = options.transitionPlan ?? next.context.config._getTransitionPlan(cur, next);
    }

    if (__DEV__) trace(this._logger, Events.vpaScheduleUpdate, this);
  }

  /** @internal */
  public _cancelUpdate(): void {
    if (this._currNode !== null) {
      this._currNode.children.forEach(function (node) {
        node.context.vpa._cancelUpdate();
      });
    }
    if (this._nextNode !== null) {
      this._nextNode.children.forEach(function (node) {
        node.context.vpa._cancelUpdate();
      });
    }

    if(__DEV__) trace(this._logger, Events.vpaCancelUpdate, this._nextNode);

    let currentDeactivationPromise: void | Promise<void> | null = null;
    let nextDeactivationPromise: void | Promise<void> | null = null;
    switch (this._currState) {
      case State.currIsEmpty:
      case State.currIsActive:
        this._currTransition = null;
        break;
      case State.currCanUnload:
      case State.currCanUnloadDone:
        this._currState = State.currIsActive;
        this._currTransition = null;
        break;
      case State.currUnload:
      case State.currUnloadDone:
      case State.currDeactivate:
        currentDeactivationPromise = onResolve(this._curCA?._deactivate(null, this.hostController), () => {
          this._curCA?._dispose();
          this._currState = State.currIsEmpty;
          this._curCA = null;
        });
        break;
    }

    switch (this._nextState) {
      case State.nextIsEmpty:
      case State.nextIsScheduled:
      case State.nextCanLoad:
      case State.nextCanLoadDone:
        this._nextNode = null;
        this._nextState = State.nextIsEmpty;
        break;
      case State.nextLoad:
      case State.nextLoadDone:
      case State.nextActivate: {
        nextDeactivationPromise = onResolve(this._nextCA?._deactivate(null, this.hostController), () => {
          this._nextCA?._dispose();
          this._$plan = 'replace';
          this._nextState = State.nextIsEmpty;
          this._nextCA = null;
          this._nextNode = null;
        });
        break;
      }
    }

    if (currentDeactivationPromise !== null && nextDeactivationPromise !== null) {
      this._cancellationPromise = onResolve(onResolveAll(currentDeactivationPromise, nextDeactivationPromise), () => {
        this._currTransition = null;
        this._cancellationPromise = null;
      });
    }
  }

  /** @internal */
  public _endTransition(): void {
    if (this._currNode !== null) {
      this._currNode.children.forEach(function (node) {
        node.context.vpa._endTransition();
      });
    }
    if (this._nextNode !== null) {
      this._nextNode.children.forEach(function (node) {
        node.context.vpa._endTransition();
      });
    }

    if (this._currTransition !== null) {
      const logger = /*@__PURE__*/ this._logger.scopeTo('endTransition()');
      ensureTransitionHasNotErrored(this._currTransition);
      switch (this._nextState) {
        case State.nextIsEmpty:
          switch (this._currState) {
            case State.currIsEmpty:
            case State.currDeactivate:
              if(__DEV__) trace(logger, Events.vpaEndTransitionEmptyCurr, this);
              this._currState = State.currIsEmpty;
              this._curCA = null;
              break;
            default:
              this._unexpectedState('endTransition 1');
          }
          break;
        case State.nextActivate:
          switch (this._currState) {
            case State.currIsEmpty:
            case State.currDeactivate:
              switch (this._$plan) {
                case 'none':
                case 'invoke-lifecycles':
                  if (__DEV__) trace(logger, Events.vpaEndTransitionActiveCurrLifecycle, this);
                  this._currState = State.currIsActive;
                  break;
                case 'replace':
                  if (__DEV__) trace(logger, Events.vpaEndTransitionActiveCurrReplace, this);
                  this._currState = State.currIsActive;
                  this._curCA = this._nextCA;
                  break;
              }
              this._currNode = this._nextNode!;
              break;
            default:
              this._unexpectedState('endTransition 2');
          }
          break;
        default:
          this._unexpectedState('endTransition 3');
      }

      this._$plan = 'replace';
      this._nextState = State.nextIsEmpty;
      this._nextNode = null;
      this._nextCA = null;
      this._currTransition = null;
    }
  }

  // Should not be adjust for DEV as it is also used of logging in production build.
  public toString(): string {
    return `VPA(state:${$state(this._state)},plan:'${this._$plan}',n:${this._nextNode},c:${this._currNode},viewport:${this.viewport})`;
  }

  /** @internal */
  public _dispose(): void {
    if (__DEV__) trace(this._logger, Events.vpaDispose, this);
    this._curCA?._dispose();
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

export const enum State {
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
