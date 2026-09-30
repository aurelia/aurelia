import { isFunction, isObject, isPromise, onResolve } from '@aurelia/kernel';
import { createInterface } from '../utilities-di';

import type { IServiceLocator } from '@aurelia/kernel';
import type { IController, IHydratedController, ISyntheticView } from './controller';

/**
 * The lifecycle phase or channel an error was raised from.
 */
export type ErrorPhase = 'binding' | 'bound' | 'attaching' | 'attached' | 'detaching' | 'unbinding' | 'event' | 'task';

export interface ErrorInfo {
  /**
   * Where the error came from.
   */
  phase: ErrorPhase;
  /**
   * The controller the error was thrown in, when known.
   */
  controller: IHydratedController | null;
  /**
   * True when an error boundary caught it.
   */
  handled: boolean;
}

/**
 * An application-level hook that receives the errors the framework catches at
 * its reporting points, whether or not an `<error-boundary>` handled them:
 * lifecycle hooks and component creation, template controller swaps, queued
 * binding and watcher updates, app tasks, and event listeners. Computed getters
 * re-evaluated in `@aurelia/runtime`'s own queued tasks are not reported yet.
 */
export interface IErrorHandler {
  handleError(error: unknown, info: ErrorInfo): void;
}
export const IErrorHandler = /*@__PURE__*/createInterface<IErrorHandler>('IErrorHandler');

/** @internal */
interface IErrorOrigin {
  controller: IHydratedController;
  phase: ErrorPhase;
  /**
   * The controller and its ancestors when the error was tagged. Captured then
   * because tearing a failed view down clears `parent` before the report.
   */
  path: IController[];
}

/**
 * The controllers and phases a thrown object originated from, one per failure
 * still on its way to a report. As a throw unwinds, the innermost controller
 * tags first and outer layers must not add a tag of their own. Separate
 * failures sharing one object (a memoized rejection, say) each keep their
 * origin, and a report takes the one raised inside the reporting controller.
 *
 * @internal
 */
const errorOrigins = new WeakMap<object, IErrorOrigin[]>();

/**
 * Unhandled errors template controllers have reported and are rethrowing to
 * whatever triggered their swap. The outer seam a rethrow reaches on the way
 * out (a queued binding task, an event listener) sees the same failure, so
 * only those seams skip it, once. Other reporters never check the marks: user
 * code may catch a rethrow, and a later throw of the same object in this turn
 * is a separate failure. A set rather than a single slot, so a rethrow caught
 * while another is still unwinding cannot displace its mark. Unconsumed marks
 * are dropped on the next microtask.
 *
 * A seam only sees the error object, so it cannot tell a rethrow from a fresh
 * throw of the same object after user code caught the rethrow in the same
 * turn; that throw goes unreported. Tracking each propagation would cost every
 * listener call and task run, to refine error reporting alone.
 *
 * @internal
 */
const rethrownErrors = new Set<object>();

const isTaggable = (error: unknown): error is object =>
  isObject(error) || isFunction(error);

/**
 * Tag an error with the controller and phase it was thrown in and return it,
 * so it can be used inline, e.g. `this._reject(tagError(err, this, 'bound'))`.
 *
 * @internal
 */
export function tagError<T>(error: T, controller: IController, phase: ErrorPhase): T {
  if (isTaggable(error)) {
    const origins = errorOrigins.get(error);
    // An outer layer of a failure still unwinding adds nothing; anything else
    // is a separate failure.
    if (origins === void 0 || !origins.some(o => o.path.includes(controller))) {
      const path: IController[] = [];
      for (let c: IController | null = controller; c !== null; c = c.parent) {
        path.push(c);
      }
      const origin: IErrorOrigin = { controller: controller as IHydratedController, phase, path };
      if (origins === void 0) {
        errorOrigins.set(error, [origin]);
      } else {
        origins.push(origin);
      }
    }
  }
  return error;
}

/**
 * Deliver an error to the registered `IErrorHandler`, if any. The origin is
 * resolved from the tag written while the error unwound, falling back to the
 * reporting site when the error was never tagged (non-object throws, or errors
 * raised outside a controller context).
 * A throwing handler must not break the framework, so its own error is logged
 * to the console instead.
 *
 * @internal
 */
export function notifyErrorHandler(
  container: IServiceLocator,
  error: unknown,
  fallbackController: IController | null,
  fallbackPhase: ErrorPhase,
  handled: boolean,
): void {
  let origin: IErrorOrigin | undefined;
  const origins = isTaggable(error) ? errorOrigins.get(error) : void 0;
  if (origins !== void 0) {
    // A tag describes one throw only; a later throw of the same object must
    // be tagged afresh with its own origin.
    const i = fallbackController === null
      ? 0
      : origins.findIndex(o => o.path.includes(fallbackController));
    origin = origins.splice(i < 0 ? 0 : i, 1)[0];
    if (origins.length === 0) {
      errorOrigins.delete(error as object);
    }
  }
  if (!container.has(IErrorHandler, true)) {
    return;
  }
  try {
    container.get(IErrorHandler).handleError(error, {
      phase: origin?.phase ?? fallbackPhase,
      controller: origin?.controller ?? (fallbackController as IHydratedController | null),
      handled,
    });
  } catch (handlerError) {
    // eslint-disable-next-line no-console
    console.error(handlerError);
  }
}

/**
 * Whether an outer seam caught a template controller's already-reported
 * rethrow. Consumes the mark, so a later throw of the same object is reported.
 *
 * @internal
 */
export function isReportedRethrow(error: unknown): boolean {
  return isTaggable(error) && rethrownErrors.delete(error);
}

interface IErrorCapturing {
  /** @internal */
  _captureError(error: unknown, from: IHydratedController | null): boolean;
}

/**
 * Report an error raised by a controller that started work on its own after
 * activation completed. Walks the `parent` chain — the full ancestor chain,
 * not just the initiator boundary — calling the internal `_captureError` hook
 * on the first view model that claims the error (an ancestor `<error-boundary>`).
 * Whether handled or not, the error is then delivered to `IErrorHandler`.
 * Returns `true` when a boundary took over, so the caller can keep its current
 * behavior otherwise.
 *
 * This only runs after something has already thrown; activation pays nothing.
 *
 * @internal
 */
export function reportError(
  source: IHydratedController,
  error: unknown,
  fallbackPhase: ErrorPhase,
): boolean {
  let handled = false;
  let prev: IHydratedController | null = null;
  let c: IHydratedController | null = source;
  while (c !== null) {
    const vm = c.viewModel as IErrorCapturing | null;
    if (vm !== null && isFunction(vm._captureError)) {
      if (vm._captureError(error, prev) === true) {
        handled = true;
        break;
      }
    }
    prev = c;
    c = c.parent;
  }
  notifyErrorHandler(source.container, error, source, fallbackPhase, handled);
  return handled;
}

/**
 * Report a synchronous post-activation failure and rethrow it to the caller
 * when no error boundary took it over.
 *
 * @internal
 */
export function reportOrRethrow(controller: IHydratedController, error: unknown): void {
  if (reportError(controller, error, 'attaching')) {
    return;
  }
  if (isTaggable(error)) {
    rethrownErrors.add(error);
    void Promise.resolve().then(() => {
      rethrownErrors.delete(error);
    });
  }
  throw error;
}

/**
 * Report an error thrown inside a framework-queued task body before the task
 * rethrows it through the queue's own channel, unless it is a template
 * controller's rethrow that was already reported. `controller` is duck-typed so
 * bindings can pass their `IBindingController` without importing `Controller`;
 * anything else falls back to the supplied `locator`.
 *
 * @internal
 */
export function reportTaskError(
  locator: IServiceLocator,
  controller: unknown,
  error: unknown,
): void {
  const hydrated = isObject(controller) && 'vmKind' in controller
    ? controller as IHydratedController
    : null;
  if (!isReportedRethrow(error)) {
    notifyErrorHandler(hydrated?.container ?? locator, error, hydrated, 'task', false);
  }
}

/**
 * Tear down a view whose observer-driven activation rejected, then report the
 * activation error. A failing teardown or `settled` cleanup must not swallow
 * that error, so their errors are reported afterwards, on their own. Nothing awaits these swaps, so unhandled
 * errors go to the console instead of becoming unhandled rejections.
 *
 * @internal
 */
export function deactivateFailedView(
  controller: IHydratedController,
  view: ISyntheticView,
  error: unknown,
  settled?: () => void,
): void | Promise<void> {
  const teardownErrors: unknown[] = [];
  const onTeardownError = (err: unknown): void => {
    teardownErrors.push(err);
  };
  const report = (err: unknown, phase: ErrorPhase): void => {
    if (!reportError(controller, err, phase)) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };
  let teardown: void | Promise<void> = void 0;
  try {
    teardown = view.deactivate(view, controller);
  } catch (err) {
    onTeardownError(err);
  }
  return onResolve(isPromise(teardown) ? teardown.catch(onTeardownError) : teardown, () => {
    try {
      settled?.();
    } catch (err) {
      onTeardownError(err);
    }
    report(error, 'attaching');
    for (const err of teardownErrors) {
      report(err, 'detaching');
    }
  });
}

/**
 * Run post-activation work (a template-controller driven view activation or
 * recomposition) and route its failures through `reportError`: a synchronous
 * throw reports to an enclosing error boundary and is swallowed when handled,
 * otherwise it rethrows; a promise rejection reports first and keeps a derived
 * rejection so unhandled errors keep reaching the caller's host channel.
 * `onHandled` runs synchronously once a boundary has taken over a rejection,
 * before the boundary's queued failover tears the caller down.
 *
 * @internal
 */
export function runReported(
  controller: IHydratedController,
  work: () => void | Promise<void>,
  onHandled?: () => void,
): void | Promise<void> {
  let result: void | Promise<void>;
  try {
    result = work();
  } catch (err) {
    reportOrRethrow(controller, err);
    return;
  }
  if (isPromise(result)) {
    return result.catch((err: unknown) => {
      if (!reportError(controller, err, 'attaching')) {
        throw err;
      }
      onHandled?.();
    });
  }
}
