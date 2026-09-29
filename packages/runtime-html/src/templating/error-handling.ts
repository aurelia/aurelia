import { isFunction, isObject, isPromise } from '@aurelia/kernel';
import { createInterface } from '../utilities-di';

import type { IServiceLocator } from '@aurelia/kernel';
import type { IController, IHydratedController } from './controller';

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
 * Object errors that have already been passed to `IErrorHandler`, so a single
 * failure travelling through several reporting seams is only delivered once.
 *
 * @internal
 */
const notifiedErrors = new WeakSet<object>();

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
 * raised outside a controller context). Object errors are only delivered once.
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
  if (isTaggable(error)) {
    if (notifiedErrors.has(error)) {
      return;
    }
    notifiedErrors.add(error);
  }
  if (!container.has(IErrorHandler, true)) {
    return;
  }
  const origin = isTaggable(error) ? errorOrigins.get(error) : void 0;
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
 * Run post-activation work (a template-controller driven view activation or
 * recomposition) and route its failures through `reportError`: a synchronous
 * throw reports to an enclosing error boundary and is swallowed when handled,
 * otherwise it rethrows; a promise rejection reports first and keeps a derived
 * rejection so unhandled errors keep reaching the caller's host channel.
 *
 * @internal
 */
export function runReported(
  controller: IHydratedController,
  work: () => void | Promise<void>,
): void | Promise<void> {
  let result: void | Promise<void>;
  try {
    result = work();
  } catch (err) {
    if (!reportError(controller, err, 'attaching')) {
      throw err;
    }
    return;
  }
  if (isPromise(result)) {
    return result.catch((err: unknown) => {
      if (!reportError(controller, err, 'attaching')) {
        throw err;
      }
    });
  }
}
