import { isPromise, onResolve, resolve } from '@aurelia/kernel';
import { queueAsyncTask, queueTask, Scope } from '@aurelia/runtime';
import { IInstruction, type HydrateElementInstruction } from '@aurelia/template-compiler';
import { IRenderLocation } from '../../dom';
import { CustomElementStaticAuDefinition, elementTypeName } from '../custom-element';
import { activating, deactivating, disposed, IHydrationContext } from '../../templating/controller';
import { IRendering } from '../../templating/rendering';
import { defaultSlotName } from '../../templating/controller.projection';
import { notifyErrorHandler, reportError } from '../../templating/error-handling';
import { fromView } from '../../binding/interfaces-bindings';

import type { IContainer } from '@aurelia/kernel';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller';
import type { IViewFactory } from '../../templating/view';

/**
 * A containerless element that renders its default slot normally and, when
 * anything inside it fails to activate, tears the failed subtree down and
 * renders the `fallback` slot in its place. The rest of the tree is unaffected.
 *
 * ```html
 * <error-boundary reset-key.bind="userId" error.from-view="profileError">
 *   <user-profile user-id.bind="userId"></user-profile>
 *
 *   <template au-slot="fallback">
 *     <p>We couldn't load this profile: ${$host.error.message}</p>
 *     <button click.trigger="$host.reset()">Try again</button>
 *   </template>
 * </error-boundary>
 * ```
 */
export class ErrorBoundary implements ICustomElementViewModel {
  public static readonly $au: CustomElementStaticAuDefinition = {
    type: elementTypeName,
    name: 'error-boundary',
    template: null,
    containerless: true,
    bindables: {
      error: { mode: fromView },
      resetKey: true,
    },
  };

  /**
   * The error the boundary most recently caught, set before the fallback slot
   * is activated. A `from-view` bindable, so a parent can react to it with
   * `error.from-view`.
   */
  public error: unknown = null;

  /**
   * When this value changes while the fallback is showing, the boundary resets
   * itself and activates fresh content.
   */
  public resetKey: unknown;

  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  /** @internal */ private readonly _location: IRenderLocation;
  /** @internal */ private readonly _contentFactory: IViewFactory | null;
  /** @internal */ private readonly _fallbackFactory: IViewFactory | null;
  /** @internal */ private _scope: Scope | null = null;
  /** @internal */ private _view: ISyntheticView | undefined;
  /** @internal */ private _isFallback: boolean = false;
  /** @internal */ private _captured: boolean = false;
  /**
   * Incremented by `detaching` and `reset` so that failovers queued while a
   * transition was in flight can tell they are stale.
   */
  /** @internal */ private _version: number = 0;
  /**
   * A promise that never rejects, serializing post-activation view transitions
   * the same way `if` serializes swaps.
   */
  /** @internal */ private _pending: void | Promise<void> = void 0;

  public constructor() {
    const instruction = resolve(IInstruction) as HydrateElementInstruction;
    // The template compiler puts children under `default` and
    // <template au-slot="fallback"> under `fallback`.
    const projections = instruction.projections;
    const hdrContext = resolve(IHydrationContext);
    this._location = resolve(IRenderLocation);
    // The boundary's children are declared in the template of the element that
    // owns the current hydration context, so the factories are built on a child
    // of that context's container, the same way `au-slot` builds its fallback.
    const container: IContainer = hdrContext.controller.container.createChild({ inheritParentResources: true });
    const rendering = resolve(IRendering);
    this._contentFactory = projections?.[defaultSlotName] != null
      ? rendering.getViewFactory(projections[defaultSlotName], container)
      : null;
    this._fallbackFactory = projections?.fallback != null
      ? rendering.getViewFactory(projections.fallback, container)
      : null;
  }

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void {
    const outer = this.$controller.scope.parent ?? this.$controller.scope;
    // Both slots see the declaring scope, with `$host` pointing at the
    // boundary so the fallback can read `error` and call `reset()`.
    (this._scope = Scope.fromParent(outer, outer.bindingContext))
      .overrideContext.$host = this;
  }

  public attaching(): void | Promise<void> {
    const view = this._view;
    this._captured = false;
    if (view !== void 0 && !this._isFallback && (view.state & disposed) === 0) {
      // A healthy content view survived a detach (for example inside a
      // cached `if` view): reactivate it so component instances and their
      // state are kept, matching the `if` cache behavior.
      return this._activateView(view);
    }
    if (view !== void 0) {
      // A leftover failed or fallback view gets replaced by fresh content.
      this._view = void 0;
      try {
        view.dispose();
      } catch {
        // A stale view may already be partially torn down; ignore and rebuild.
      }
    }
    this._isFallback = false;
    this.error = null;
    return this._activate(this._contentFactory);
  }

  /** @internal */
  private _activate(factory: IViewFactory | null): void | Promise<void> {
    if (factory === null) {
      return;
    }
    let view: ISyntheticView;
    try {
      // Creating the view renders it, which constructs and hydrates the
      // content's components, so their constructor and `created` failures
      // surface here, before activation.
      view = factory.create(this.$controller).setLocation(this._location);
    } catch (err) {
      this._view = void 0;
      return this._fail(void 0, err, this._version, false);
    }
    return this._activateView(view);
  }

  /** @internal */
  private _activateView(view: ISyntheticView): void | Promise<void> {
    const version = this._version;
    const ctrl = this.$controller;
    this._view = view;
    // The view activates with itself as initiator (like `if`), so synchronous
    // throws land in the try/catch below and async rejections land on the
    // returned promise instead of the ancestor activation.
    let result: void | Promise<void>;
    try {
      result = view.activate(view, ctrl, this._scope!);
    } catch (err) {
      return this._fail(view, err, version, false);
    }
    if (isPromise(result)) {
      return result.then(() => void 0, (err: unknown) => this._fail(view, err, version, false));
    }
  }

  /**
   * Report the failure, tear down the failed view if creating it got that far
   * (reporting and ignoring any teardown errors) and activate the fallback in
   * its place. A rejection means the fallback itself failed; callers decide
   * how that escalates.
   *
   * @internal
   */
  private _fail(view: ISyntheticView | undefined, error: unknown, version: number, notified: boolean): void | Promise<void> {
    const ctrl = this.$controller;
    if (!notified) {
      notifyErrorHandler(ctrl.container, error, ctrl, 'attaching', true);
    }
    if (this._isStale(version)) {
      // The boundary is detaching; the ancestor's deactivation now owns the
      // view, so it must not be deactivated or disposed here. `_view` keeps the
      // reference so `dispose()` or the next `attaching` can clean it up.
      return;
    }
    return onResolve(view === void 0 ? void 0 : this._teardownView(view), () => {
      if (this._isStale(version)) {
        return;
      }
      this.error = error;
      this._isFallback = true;
      const factory = this._fallbackFactory;
      if (factory === null) {
        this._view = void 0;
        return;
      }
      const fallback = this._view = factory.create(ctrl).setLocation(this._location);
      let result: void | Promise<void>;
      try {
        result = fallback.activate(fallback, ctrl, this._scope!);
      } catch (err) {
        return this._failFallback(fallback, err, version);
      }
      if (isPromise(result)) {
        return result.then(() => void 0, (err: unknown) => this._failFallback(fallback, err, version));
      }
    });
  }

  /**
   * Tear down a fallback that failed to activate and re-raise the error, so it
   * propagates to the next boundary up (or the activation initiator).
   *
   * @internal
   */
  private _failFallback(view: ISyntheticView, error: unknown, version: number): void | Promise<void> {
    if (this._isStale(version)) {
      // Detaching mid-failover: the ancestor owns the view, so the error only
      // notifies the handler — matching the controller's own "activation
      // error ignored because we're deactivating" policy — and must not
      // escalate into an outer boundary's failover or hold the detached
      // activation open.
      notifyErrorHandler(this.$controller.container, error, this.$controller, 'attaching', false);
      return;
    }
    if (this._view === view) {
      this._view = void 0;
    }
    const teardown = this._teardownView(view);
    return isPromise(teardown)
      ? teardown.then(() => { throw error; })
      : Promise.reject(error);
  }

  /**
   * Deactivate and dispose a failed view. Deactivation errors are reported and
   * ignored, so one bad hook can't leave the rest of the tree mounted; if
   * deactivation aborted early the view's nodes are removed directly.
   *
   * @internal
   */
  private _teardownView(view: ISyntheticView): void | Promise<void> {
    const ctrl = this.$controller;
    const report = (err: unknown) => {
      notifyErrorHandler(ctrl.container, err, ctrl, 'detaching', true);
    };
    const finish = (failed: boolean) => {
      if (failed) {
        try {
          view.nodes?.remove();
        } catch (err) {
          report(err);
        }
        // An aborted teardown never unbinds; release the subtree's bindings so
        // they don't stay subscribed to observers on the declaring scope.
        try {
          view.accept(c => {
            const bindings = c.bindings;
            if (bindings !== null) {
              for (const binding of bindings) {
                try {
                  binding.unbind();
                } catch (err) {
                  notifyErrorHandler(ctrl.container, err, ctrl, 'unbinding', true);
                }
              }
            }
          });
        } catch (err) {
          notifyErrorHandler(ctrl.container, err, ctrl, 'unbinding', true);
        }
      }
      try {
        view.dispose();
      } catch (err) {
        report(err);
      }
    };
    let result: void | Promise<void>;
    try {
      result = view.deactivate(view, ctrl);
    } catch (err) {
      report(err);
      return finish(true);
    }
    if (isPromise(result)) {
      return result.then(() => finish(false), (err: unknown) => {
        report(err);
        finish(true);
      });
    }
    return finish(false);
  }

  /**
   * Called by `reportError` when a descendant template controller started a
   * view activation of its own after the boundary had finished activating.
   * The failover is queued so it is tracked by `tasksSettled()` and never runs
   * re-entrantly inside the controller that reported.
   *
   * @internal
   */
  public _captureError(error: unknown, from: IHydratedController | null): boolean {
    // Errors raised by the fallback itself, or by anything other than the
    // currently mounted content view, belong to the next boundary up.
    if (from !== this._view || this._isFallback) {
      return false;
    }
    if (this._captured) {
      return true;
    }
    this._captured = true;
    const view = from;
    const version = this._version;
    void queueAsyncTask(() => {
      if (this._isStale(version)) {
        return;
      }
      try {
        const transition = onResolve(this._pending, () => this._fail(view, error, version, true));
        // The queued failover must never reject: a fallback failure escalates
        // to the next boundary up, or surfaces through the task queue.
        return this._chain(transition);
      } catch (err) {
        this._escalate(err);
      }
    });
    return true;
  }

  /**
   * Whether a captured version is stale: either a newer transition bumped the
   * counter, or the boundary's controller started deactivating. The controller
   * state flag flips synchronously at deactivate entry, while `detaching()`
   * (and its `_version` bump) can be deferred behind a still-pending
   * activation, so both must be consulted.
   *
   * @internal
   */
  private _isStale(version: number): boolean {
    return version !== this._version || (this.$controller.state & deactivating) !== 0;
  }

  /**
   * Serialize a view transition on `_pending`, keeping the promise that never
   * rejects as the tail and clearing it when it settles — the same discipline
   * `if` applies to its swap chain.
   *
   * @internal
   */
  private _chain(transition: void | Promise<void>): void | Promise<void> {
    if (!isPromise(transition)) {
      return transition;
    }
    const pending = this._pending = transition.then(() => void 0, (err: unknown) => this._escalate(err));
    void pending.then(() => {
      if (this._pending === pending) {
        this._pending = void 0;
      }
    });
    return pending;
  }

  /** @internal */
  private _escalate(error: unknown): void {
    if (!reportError(this.$controller, error, 'attaching')) {
      queueTask(() => { throw error; });
    }
  }

  /**
   * Discard the fallback and build the content again from scratch, with new
   * component instances. Returns a promise (that never rejects) for callers and
   * tests to await.
   */
  public reset(): void | Promise<void> {
    const ctrl = this.$controller;
    if (!this._isFallback || !ctrl.isActive) {
      return;
    }
    const version = ++this._version;
    const view = this._view;
    const transition = onResolve(this._pending, () => onResolve(
      view === void 0 ? void 0 : this._teardownView(view),
      () => {
        if (version !== this._version) {
          return;
        }
        this._captured = false;
        this.error = null;
        this._isFallback = false;
        return this._activate(this._contentFactory);
      },
    ));
    return this._chain(transition);
  }

  public resetKeyChanged(): void {
    if (this._isFallback) {
      void this.reset();
    }
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    ++this._version;
    return onResolve(this._pending, () => {
      const view = this._view;
      if (view === void 0) {
        return;
      }
      if ((view.state & activating) === activating) {
        // The view's activation was interrupted; deactivating it on the
        // ancestor's initiator would let a late activation rejection
        // propagate back up that chain. Its own teardown machinery absorbs
        // the rejection and reports teardown errors instead. The detaching
        // return waits on the teardown so `stop()` can't resolve while the
        // failed subtree's nodes are still mounted.
        return onResolve(this._teardownView(view), () => {
          if (this._view === view) {
            this._view = void 0;
          }
        });
      }
      void view.deactivate(initiator, this.$controller);
    });
  }

  public dispose(): void {
    this._view?.dispose();
    this._view = void 0;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this._view?.accept(visitor) === true) {
      return true;
    }
  }
}
