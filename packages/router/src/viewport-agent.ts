// No-fallthrough disabled due to large numbers of false positives
/* eslint-disable no-fallthrough */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ILogger, onResolve } from '@aurelia/kernel';
import { IHydratedController, LifecycleFlags, ICustomElementController, Controller } from '@aurelia/runtime-html';

import { IViewport } from './resources/viewport.js';
import { ComponentAgent } from './component-agent.js';
import { processResidue, getDynamicChildren, RouteNode } from './route-tree.js';
import { IRouteContext } from './route-context.js';
import { Transition, ResolutionMode, NavigationOptions } from './router.js';
import { TransitionPlan } from './route.js';
import { Batch, mergeDistinct } from './util.js';

export class ViewportRequest {
  public constructor(
    public readonly viewportName: string,
    public readonly componentName: string,
    public readonly resolution: ResolutionMode,
    public readonly append: boolean,
  ) { }

  public static create(input: ViewportRequest): ViewportRequest {
    return new ViewportRequest(
      input.viewportName,
      input.componentName,
      input.resolution,
      input.append,
    );
  }

  public toString(): string {
    return `VR(viewport:'${this.viewportName}',component:'${this.componentName}',resolution:'${this.resolution}',append:${this.append})`;
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

  private $resolution: ResolutionMode = 'dynamic';
  private $plan: TransitionPlan = 'replace';
  private currNode: RouteNode | null = null;
  private nextNode: RouteNode | null = null;

  private currTransition: Transition | null = null;
  private prevTransition: Transition | null = null;

  public constructor(
    public readonly viewport: IViewport,
    public readonly hostController: ICustomElementController,
    public readonly ctx: IRouteContext,
  ) {
    this.logger = ctx.get(ILogger).scopeTo(`ViewportAgent<${ctx.friendlyPath}>`);

    this.logger.trace(`constructor()`);
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

  public activateFromViewport(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    const tr = this.currTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
    this.isActive = true;

    switch (this.nextState) {
      case State.nextIsEmpty:
        switch (this.currState) {
          case State.currIsEmpty:
            this.logger.trace(`activateFromViewport() - nothing to activate at %s`, this);
            return;
          case State.currIsActive:
            this.logger.trace(`activateFromViewport() - activating existing componentAgent at %s`, this);
            return this.curCA!.activate(initiator, parent, flags);
          default:
            this.unexpectedState('activateFromViewport 1');
        }
      case State.nextLoadDone: {
        if (this.currTransition === null) {
          throw new Error(`Unexpected viewport activation outside of a transition context at ${this}`);
        }
        if (this.$resolution !== 'static') {
          throw new Error(`Unexpected viewport activation at ${this}`);
        }
        this.logger.trace(`activateFromViewport() - running ordinary activate at %s`, this);
        const b = Batch.start(b1 => { this.activate(initiator, this.currTransition!, b1); });
        const p = new Promise<void>(resolve => { b.continueWith(() => { resolve(); }); });
        return b.start().done ? void 0 : p;
      }
      default:
        this.unexpectedState('activateFromViewport 2');
    }
  }

  public deactivateFromViewport(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    const tr = this.currTransition;
    if (tr !== null) { ensureTransitionHasNotErrored(tr); }
    this.isActive = false;

    switch (this.currState) {
      case State.currIsEmpty:
        this.logger.trace(`deactivateFromViewport() - nothing to deactivate at %s`, this);
        return;
      case State.currIsActive:
        this.logger.trace(`deactivateFromViewport() - deactivating existing componentAgent at %s`, this);
        return this.curCA!.deactivate(initiator, parent, flags);
      case State.currDeactivate:
        // This will happen with bottom-up deactivation because the child is already deactivated, the parent
        // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
        // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
        this.logger.trace(`deactivateFromViewport() - already deactivating at %s`, this);
        return;
      default: {
        if (this.currTransition === null) {
          throw new Error(`Unexpected viewport deactivation outside of a transition context at ${this}`);
        }
        this.logger.trace(`deactivateFromViewport() - running ordinary deactivate at %s`, this);
        const b = Batch.start(b1 => { this.deactivate(initiator, this.currTransition!, b1); });
        const p = new Promise<void>(resolve => { b.continueWith(() => { resolve(); }); });
        return b.start().done ? void 0 : p;
      }
    }
  }

  public handles(req: ViewportRequest): boolean {
    if (!this.isAvailable(req.resolution)) {
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

  public isAvailable(resolution: ResolutionMode): boolean {
    if (resolution === 'dynamic' && !this.isActive) {
      this.logger.trace(`isAvailable(resolution:%s) -> false (viewport is not active and we're in dynamic resolution resolution)`, resolution);
      return false;
    }

    if (this.nextState !== State.nextIsEmpty) {
      this.logger.trace(`isAvailable(resolution:%s) -> false (update already scheduled for %s)`, resolution, this.nextNode);
      return false;
    }

    return true;
  }

  public canUnload(tr: Transition, b: Batch): void {
    if (this.currTransition === null) { this.currTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) { return; }

    b.push();

    // run canUnload bottom-up
    Batch.start(b1 => {
      this.logger.trace(`canUnload() - invoking on children at %s`, this);
      for (const node of this.currNode!.children) {
        node.context.vpa.canUnload(tr, b1);
      }
    }).continueWith(b1 => {
      switch (this.currState) {
        case State.currIsActive:
          this.logger.trace(`canUnload() - invoking on existing component at %s`, this);
          switch (this.$plan) {
            case 'none':
              this.currState = State.currCanUnloadDone;
              return;
            case 'invoke-lifecycles':
            case 'replace':
              this.currState = State.currCanUnload;
              b1.push();
              Batch.start(b2 => {
                this.logger.trace(`canUnload() - finished invoking on children, now invoking on own component at %s`, this);
                this.curCA!.canUnload(tr, this.nextNode, b2);
              }).continueWith(() => {
                this.logger.trace(`canUnload() - finished at %s`, this);
                this.currState = State.currCanUnloadDone;
                b1.pop();
              }).start();
              return;
          }
        case State.currIsEmpty:
          this.logger.trace(`canUnload() - nothing to unload at %s`, this);
          return;
        default:
          tr.handleError(new Error(`Unexpected state at canUnload of ${this}`));
      }
    }).continueWith(() => {
      b.pop();
    }).start();
  }

  public canLoad(tr: Transition, b: Batch): void {
    if (this.currTransition === null) { this.currTransition = tr; }
    ensureTransitionHasNotErrored(tr);
    if (tr.guardsResult !== true) { return; }

    b.push();

    // run canLoad top-down
    Batch.start(b1 => {
      switch (this.nextState) {
        case State.nextIsScheduled:
          this.logger.trace(`canLoad() - invoking on new component at %s`, this);
          this.nextState = State.nextCanLoad;
          switch (this.$plan) {
            case 'none':
              return;
            case 'invoke-lifecycles':
              return this.curCA!.canLoad(tr, this.nextNode!, b1);
            case 'replace':
              this.nextCA = this.nextNode!.context.createComponentAgent(this.hostController, this.nextNode!);
              return this.nextCA.canLoad(tr, this.nextNode!, b1);
          }
        case State.nextIsEmpty:
          this.logger.trace(`canLoad() - nothing to load at %s`, this);
          return;
        default:
          this.unexpectedState('canLoad');
      }
    }).continueWith(b1 => {
      const next = this.nextNode!;
      switch (this.$plan) {
        case 'none':
        case 'invoke-lifecycles':
          this.logger.trace(`canLoad(next:%s) - plan set to '%s', compiling residue`, next, this.$plan);

          // These plans can only occur if there is already a current component active in this viewport,
          // and it is the same component as `next`.
          // This means the RouteContext of `next` was created during a previous transition and might contain
          // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
          // first pass of activation, instead of lazily in a later pass after `processResidue`.
          // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
          // their target viewports have the appropriate updates scheduled.
          b1.push();
          void onResolve(processResidue(next), () => {
            b1.pop();
          });
          return;
        case 'replace':
          // In the case of 'replace', always process this node and its subtree as if it's a new one
          switch (this.$resolution) {
            case 'dynamic':
              // Residue compilation will happen at `ViewportAgent#processResidue`
              this.logger.trace(`canLoad(next:%s) - (resolution: 'dynamic'), delaying residue compilation until activate`, next, this.$plan);
              return;
            case 'static':
              this.logger.trace(`canLoad(next:%s) - (resolution: '${this.$resolution}'), creating nextCA and compiling residue`, next, this.$plan);
              b1.push();
              void onResolve(processResidue(next), () => {
                b1.pop();
              });
              return;
          }
      }
    }).continueWith(b1 => {
      switch (this.nextState) {
        case State.nextCanLoad:
          this.logger.trace(`canLoad() - finished own component, now invoking on children at %s`, this);
          this.nextState = State.nextCanLoadDone;
          for (const node of this.nextNode!.children) {
            node.context.vpa.canLoad(tr, b1);
          }
          return;
        case State.nextIsEmpty:
          return;
        default:
          this.unexpectedState('canLoad');
      }
    }).continueWith(() => {
      this.logger.trace(`canLoad() - finished at %s`, this);
      b.pop();
    }).start();
  }

  public unload(tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();

    // run unload bottom-up
    Batch.start(b1 => {
      this.logger.trace(`unload() - invoking on children at %s`, this);
      for (const node of this.currNode!.children) {
        node.context.vpa.unload(tr, b1);
      }
    }).continueWith(b1 => {
      switch (this.currState) {
        case State.currCanUnloadDone:
          this.logger.trace(`unload() - invoking on existing component at %s`, this);
          switch (this.$plan) {
            case 'none':
              this.currState = State.currUnloadDone;
              return;
            case 'invoke-lifecycles':
            case 'replace':
              this.currState = State.currUnload;
              b1.push();
              Batch.start(b2 => {
                this.logger.trace(`unload() - finished invoking on children, now invoking on own component at %s`, this);
                this.curCA!.unload(tr, this.nextNode, b2);
              }).continueWith(() => {
                this.logger.trace(`unload() - finished at %s`, this);
                this.currState = State.currUnloadDone;
                b1.pop();
              }).start();
              return;
          }
        case State.currIsEmpty:
          this.logger.trace(`unload() - nothing to unload at %s`, this);
          for (const node of this.currNode!.children) {
            node.context.vpa.unload(tr, b);
          }
          return;
        default:
          this.unexpectedState('unload');
      }
    }).continueWith(() => {
      b.pop();
    }).start();
  }

  public load(tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();

    // run load top-down
    Batch.start(b1 => {
      switch (this.nextState) {
        case State.nextCanLoadDone: {
          this.logger.trace(`load() - invoking on new component at %s`, this);
          this.nextState = State.nextLoad;
          switch (this.$plan) {
            case 'none':
              return;
            case 'invoke-lifecycles':
              return this.curCA!.load(tr, this.nextNode!, b1);
            case 'replace':
              return this.nextCA!.load(tr, this.nextNode!, b1);
          }
        }
        case State.nextIsEmpty:
          this.logger.trace(`load() - nothing to load at %s`, this);
          return;
        default:
          this.unexpectedState('load');
      }
    }).continueWith(b1 => {
      switch (this.nextState) {
        case State.nextLoad:
          this.logger.trace(`load() - finished own component, now invoking on children at %s`, this);
          this.nextState = State.nextLoadDone;
          for (const node of this.nextNode!.children) {
            node.context.vpa.load(tr, b1);
          }
          return;
        case State.nextIsEmpty:
          return;
        default:
          this.unexpectedState('load');
      }
    }).continueWith(() => {
      this.logger.trace(`load() - finished at %s`, this);
      b.pop();
    }).start();
  }

  public deactivate(initiator: IHydratedController | null, tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();

    switch (this.currState) {
      case State.currUnloadDone:
        this.logger.trace(`deactivate() - invoking on existing component at %s`, this);
        this.currState = State.currDeactivate;
        switch (this.$plan) {
          case 'none':
          case 'invoke-lifecycles':
            b.pop();
            return;
          case 'replace': {
            const controller = this.hostController;
            const deactivateFlags = this.viewport.stateful ? LifecycleFlags.none : LifecycleFlags.dispose;
            tr.run(() => {
              return this.curCA!.deactivate(initiator, controller, deactivateFlags);
            }, () => {
              b.pop();
            });
          }
        }
        return;
      case State.currIsEmpty:
        this.logger.trace(`deactivate() - nothing to deactivate at %s`, this);
        b.pop();
        return;
      case State.currDeactivate:
        this.logger.trace(`deactivate() - already deactivating at %s`, this);
        b.pop();
        return;
      default:
        this.unexpectedState('deactivate');
    }
  }

  public activate(initiator: IHydratedController | null, tr: Transition, b: Batch): void {
    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    b.push();

    if (
      this.nextState === State.nextIsScheduled &&
      this.$resolution === 'dynamic'
    ) {
      this.logger.trace(`activate() - invoking canLoad(), load() and activate() on new component due to resolution 'dynamic' at %s`, this);
      // This is the default v2 mode "lazy loading" situation
      Batch.start(b1 => {
        this.canLoad(tr, b1);
      }).continueWith(b1 => {
        this.load(tr, b1);
      }).continueWith(b1 => {
        this.activate(initiator, tr, b1);
      }).continueWith(() => {
        b.pop();
      }).start();
      return;
    }

    switch (this.nextState) {
      case State.nextLoadDone:
        this.logger.trace(`activate() - invoking on existing component at %s`, this);
        this.nextState = State.nextActivate;
        // run activate top-down
        Batch.start(b1 => {
          switch (this.$plan) {
            case 'none':
            case 'invoke-lifecycles':
              return;
            case 'replace': {
              const controller = this.hostController;
              const activateFlags = LifecycleFlags.none;
              tr.run(() => {
                b1.push();
                return this.nextCA!.activate(initiator, controller, activateFlags);
              }, () => {
                b1.pop();
              });
            }
          }
        }).continueWith(b1 => {
          this.processDynamicChildren(tr, b1);
        }).continueWith(() => {
          b.pop();
        }).start();
        return;
      case State.nextIsEmpty:
        this.logger.trace(`activate() - nothing to activate at %s`, this);
        b.pop();
        return;
      default:
        this.unexpectedState('activate');
    }
  }

  public swap(tr: Transition, b: Batch): void {
    if (this.currState === State.currIsEmpty) {
      this.logger.trace(`swap() - running activate on next instead, because there is nothing to deactivate at %s`, this);
      this.activate(null, tr, b);
      return;
    }
    if (this.nextState === State.nextIsEmpty) {
      this.logger.trace(`swap() - running deactivate on current instead, because there is nothing to activate at %s`, this);
      this.deactivate(null, tr, b);
      return;
    }

    ensureTransitionHasNotErrored(tr);
    ensureGuardsResultIsTrue(this, tr);

    if (!(
      this.currState === State.currUnloadDone &&
      this.nextState === State.nextLoadDone
    )) {
      this.unexpectedState('swap');
    }

    this.currState = State.currDeactivate;
    this.nextState = State.nextActivate;

    switch (this.$plan) {
      case 'none':
      case 'invoke-lifecycles': {
        this.logger.trace(`swap() - skipping this level and swapping children instead at %s`, this);
        const nodes = mergeDistinct(this.nextNode!.children, this.currNode!.children);
        for (const node of nodes) {
          node.context.vpa.swap(tr, b);
        }
        return;
      }
      case 'replace': {
        this.logger.trace(`swap() - running normally at %s`, this);
        const controller = this.hostController;
        const curCA = this.curCA!;
        const nextCA = this.nextCA!;
        const deactivateFlags = this.viewport.stateful ? LifecycleFlags.none : LifecycleFlags.dispose;
        const activateFlags = LifecycleFlags.none;
        b.push();
        switch (tr.options.swapStrategy) {
          case 'sequential-add-first':
            Batch.start(b1 => {
              tr.run(() => {
                b1.push();
                return nextCA.activate(null, controller, activateFlags);
              }, () => {
                b1.pop();
              });
            }).continueWith(b1 => {
              this.processDynamicChildren(tr, b1);
            }).continueWith(() => {
              tr.run(() => {
                return curCA.deactivate(null, controller, deactivateFlags);
              }, () => {
                b.pop();
              });
            }).start();
            return;
          case 'sequential-remove-first':
            Batch.start(b1 => {
              tr.run(() => {
                b1.push();
                return curCA.deactivate(null, controller, deactivateFlags);
              }, () => {
                b1.pop();
              });
            }).continueWith(b1 => {
              tr.run(() => {
                b1.push();
                return nextCA.activate(null, controller, activateFlags);
              }, () => {
                b1.pop();
              });
            }).continueWith(b1 => {
              this.processDynamicChildren(tr, b1);
            }).continueWith(() => {
              b.pop();
            }).start();
            return;
          case 'parallel-remove-first':
            tr.run(() => {
              b.push();
              return curCA.deactivate(null, controller, deactivateFlags);
            }, () => {
              b.pop();
            });
            Batch.start(b1 => {
              tr.run(() => {
                b1.push();
                return nextCA.activate(null, controller, activateFlags);
              }, () => {
                b1.pop();
              });
            }).continueWith(b1 => {
              this.processDynamicChildren(tr, b1);
            }).continueWith(() => {
              b.pop();
            }).start();
            return;
        }
      }
    }
  }

  private processDynamicChildren(tr: Transition, b: Batch): void {
    this.logger.trace(`processDynamicChildren() - %s`, this);
    const next = this.nextNode!;

    tr.run(() => {
      b.push();
      return getDynamicChildren(next);
    }, newChildren => {
      Batch.start(b1 => {
        for (const node of newChildren) {
          tr.run(() => {
            b1.push();
            return node.context.vpa.canLoad(tr, b1);
          }, () => {
            b1.pop();
          });
        }
      }).continueWith(b1 => {
        for (const node of newChildren) {
          tr.run(() => {
            b1.push();
            return node.context.vpa.load(tr, b1);
          }, () => {
            b1.pop();
          });
        }
      }).continueWith(b1 => {
        for (const node of newChildren) {
          tr.run(() => {
            b1.push();
            return node.context.vpa.activate(null, tr, b1);
          }, () => {
            b1.pop();
          });
        }
      }).continueWith(() => {
        b.pop();
      }).start();
    });
  }

  public scheduleUpdate(options: NavigationOptions, next: RouteNode): void | Promise<void> {
    switch (this.nextState) {
      case State.nextIsEmpty:
        this.nextNode = next;
        this.nextState = State.nextIsScheduled;
        this.$resolution = options.resolutionMode;
        break;
      default:
        this.unexpectedState('scheduleUpdate 1');
    }

    switch (this.currState) {
      case State.currIsEmpty:
      case State.currIsActive:
      case State.currCanUnloadDone:
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

    this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s'`, next, this.$plan);
  }

  public cancelUpdate(): void {
    if (this.currNode !== null) {
      this.currNode.children.forEach(function (node) {
        node.context.vpa.cancelUpdate();
      });
    }
    if (this.nextNode !== null) {
      this.nextNode.children.forEach(function (node) {
        node.context.vpa.cancelUpdate();
      });
    }

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

  public endTransition(): void {
    if (this.currNode !== null) {
      this.currNode.children.forEach(function (node) {
        node.context.vpa.endTransition();
      });
    }
    if (this.nextNode !== null) {
      this.nextNode.children.forEach(function (node) {
        node.context.vpa.endTransition();
      });
    }

    if (this.currTransition !== null) {
      ensureTransitionHasNotErrored(this.currTransition);
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
              this.currNode = this.nextNode!;
              break;
            default:
              this.unexpectedState('endTransition 2');
          }
          break;
        default:
          this.unexpectedState('endTransition 3');
      }

      this.$plan = 'replace';
      this.nextState = State.nextIsEmpty;
      this.nextNode = null;
      this.nextCA = null;
      this.prevTransition = this.currTransition;
      this.currTransition = null;
    }
  }

  public toString(): string {
    return `VPA(state:${this.$state},plan:'${this.$plan}',resolution:'${this.$resolution}',n:${this.nextNode},c:${this.currNode},viewport:${this.viewport})`;
  }

  public dispose(): void {
    if (this.viewport.stateful /* TODO: incorporate statefulHistoryLength / router opts as well */) {
      this.logger.trace(`dispose() - not disposing stateful viewport at %s`, this);
    } else {
      this.logger.trace(`dispose() - disposing %s`, this);
      this.curCA?.dispose();
    }
  }

  private unexpectedState(label: string): never {
    throw new Error(`Unexpected state at ${label} of ${this}`);
  }
}

function ensureGuardsResultIsTrue(vpa: ViewportAgent, tr: Transition): void {
  if (tr.guardsResult !== true) {
    throw new Error(`Unexpected guardsResult ${tr.guardsResult} at ${vpa}`);
  }
}

function ensureTransitionHasNotErrored(tr: Transition): void {
  if (tr.error !== void 0) {
    throw tr.error;
  }
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
