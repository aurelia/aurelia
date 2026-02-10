import { AnyFunction } from '@aurelia/kernel';
import { astTrackableMethodMarker } from './ast.eval';
import { rtObjectAssign } from './utilities';
import { createMappedError, ErrorNames } from './errors';

export type AstTrackedDecoratorOptions = {
  useProxy?: boolean;
};

/* eslint-disable @typescript-eslint/ban-types */
/**
 * @example
 * ```
 * class MyClass {
 *   ⁣@astTracked
 *   method() {
 *     // ...
 *   }
 * }
 * ```
 */
export function astTracked(target: Function, context: ClassMethodDecoratorContext): void;
/**
 * @example
 * ```
 * class MyClass {
 *   ⁣@astTracked({ useProxy: true })
 *   method() {
 *     // ...
 *   }
 * }
 * ```
 */
export function astTracked(options: AstTrackedDecoratorOptions): (target: Function, context: ClassMethodDecoratorContext) => void;
export function astTracked(
  targetOrOptions: Function | AstTrackedDecoratorOptions,
  contextOrUndefined?: ClassMethodDecoratorContext,
): void | ((target: Function, context: ClassMethodDecoratorContext) => void) {

  let options: AstTrackedDecoratorOptions;

  if (typeof targetOrOptions === 'function') {
    options = { useProxy: true };
    return decorator(targetOrOptions, contextOrUndefined as ClassMethodDecoratorContext);
  }

  options = { useProxy: true, ...targetOrOptions };
  return decorator;

  function decorator(target: Function, context: ClassMethodDecoratorContext) {
    if (context.kind !== 'method') {
      throw createMappedError(ErrorNames.ast_tracked_decorator_not_a_method, String(context.name));
    }

    return rtObjectAssign(target as AnyFunction, {
      [astTrackableMethodMarker]: { ...options }
    });
  }
}
/* eslint-enable @typescript-eslint/ban-types */
