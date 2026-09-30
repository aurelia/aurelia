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
 * An application-level hook that receives every error the framework catches,
 * whether or not an `<error-boundary>` handled it.
 */
export interface IErrorHandler {
  handleError(error: unknown, info: ErrorInfo): void;
}
export const IErrorHandler = /*@__PURE__*/createInterface<IErrorHandler>('IErrorHandler');

/** @internal */
interface IErrorOrigin {
  controller: IHydratedController;
  phase: ErrorPhase;
}

/**
 * The controller and phase a thrown object originated from. Only the first tag
 * wins: as a synchronous throw unwinds, the innermost controller tags first and
 * outer layers must not overwrite the true origin.
 *
 * @internal
 */
const errorOrigins = new WeakMap<object, IErrorOrigin>();

/**
 * An unhandled error a template controller has reported and is rethrowing to
 * whatever triggered its swap. The next reporting seam it reaches on the way
 * out (a queued binding task, an event listener) sees the same failure, so it
 * is skipped once there. The rethrow unwinds synchronously; if nothing reports
 * it on the way out, the mark is dropped on the next microtask. Separate
 * throws of the same object are never marked, so each one is reported.
 *
 * @internal
 */
let rethrownError: object | null = null;

const isTaggable = (error: unknown): error is object =>
  isObject(error) || isFunction(error);

/**
 * Tag an error with the controller and phase it was thrown in and return it,
 * so it can be used inline, e.g. `this._reject(tagError(err, this, 'bound'))`.
 *
 * @internal
 */
export function tagError<T>(error: T, controller: IController, phase: ErrorPhase): T {
  if (isTaggable(error) && !errorOrigins.has(error)) {
    errorOrigins.set(error, { controller: controller as IHydratedController, phase });
  }
  return error;
}

/**
 * Deliver an error to the registered `IErrorHandler`, if any. The origin is
 * resolved from the tag written while the error unwound, falling back to the
 * reporting site when the error was never tagged (non-object throws, or errors
 * raised outside a controller context). An error a template controller already
 * reported is skipped when its rethrow reaches the next seam.
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
  if (isTaggable(error)) {
    // The tag describes this throw only; a later throw of the same object
    // must be tagged afresh with its own origin.
    origin = errorOrigins.get(error);
    errorOrigins.delete(error);
    if (error === rethrownError) {
      rethrownError = null;
      return;
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
    const marked = rethrownError = error;
    void Promise.resolve().then(() => {
      if (rethrownError === marked) {
        rethrownError = null;
      }
    });
  }
  throw error;
}

/**
 * Report an error thrown inside a framework-queued task body before the task
 * rethrows it through the queue's own channel. `controller` is duck-typed so
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
  notifyErrorHandler(hydrated?.container ?? locator, error, hydrated, 'task', false);
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
