import { AnyFunction, isFunction } from '@aurelia/kernel';
import { astTrackableMethodMarker } from './ast.eval';
import { rtObjectAssign } from './utilities';
import { createMappedError, ErrorNames } from './errors';

export type AstTrackDependencyFn<T = unknown> = (instance: T) => unknown;
export type AstTrackDependency = string | AstTrackDependencyFn;

export type AstTrackDecoratorOptions = {
  deps?: AstTrackDependency[] | AstTrackDependencyFn;
};

type AstTrackableMethodOptions = {
  deps?: AstTrackDependency[];
};

/* eslint-disable @typescript-eslint/ban-types */
function isClassMethodDecoratorContext(value: unknown): value is ClassMethodDecoratorContext {
  return value != null && typeof value === 'object' && 'kind' in value;
}

/**
 * @example
 * ```
 * class MyClass {
 *   \@astTrack
 *   method() {
 *     // ...
 *   }
 * }
 * ```
 */
export function astTrack(target: Function, context: ClassMethodDecoratorContext): void;
/**
 * @example
 * ```
 * class MyClass {
 *   @astTrack({ deps: ['prop', 'nested.prop'] })
 *   method() {
 *     // ...
 *   }
 * }
 * ```
 */
export function astTrack(options: AstTrackDecoratorOptions): (target: Function, context: ClassMethodDecoratorContext) => void;
/**
 * @example
 * ```
 * class MyClass {
 *   @astTrack('prop', 'nested.prop')
 *   @astTrack(vm => vm.prop + vm.prop2)
 *   method() {
 *     // ...
 *   }
 * }
 * ```
 */
export function astTrack(...dependencies: AstTrackDependency[]): (target: Function, context: ClassMethodDecoratorContext) => void;
export function astTrack(
  targetOrOptionsOrDependency?: unknown,
  ...rest: unknown[]
): void | ((target: Function, context: ClassMethodDecoratorContext) => void) {
  if (isFunction(targetOrOptionsOrDependency) && isClassMethodDecoratorContext(rest[0])) {
    return applyDecorator(targetOrOptionsOrDependency, rest[0], {});
  }

  const options: AstTrackableMethodOptions = {};

  if (typeof targetOrOptionsOrDependency === 'string') {
    options.deps = [targetOrOptionsOrDependency, ...rest as string[]];
  } else if (isFunction(targetOrOptionsOrDependency)) {
    options.deps = [targetOrOptionsOrDependency as AstTrackDependencyFn];
  } else if (targetOrOptionsOrDependency != null) {
    const configuredOptions = targetOrOptionsOrDependency as AstTrackDecoratorOptions;
    if (Object.prototype.hasOwnProperty.call(configuredOptions, 'deps')) {
      options.deps = configuredOptions.deps == null
        ? void 0
        : isFunction(configuredOptions.deps)
          ? [configuredOptions.deps]
          : configuredOptions.deps;
    }
  }

  return (target: Function, context: ClassMethodDecoratorContext) => {
    return applyDecorator(target, context, options);
  };
}

function applyDecorator(target: Function, context: ClassMethodDecoratorContext, options: AstTrackableMethodOptions): void {
  if (context.kind !== 'method') {
    throw createMappedError(ErrorNames.ast_track_decorator_not_a_method, String(context.name));
  }

  const trackableTarget = target as AnyFunction & { [astTrackableMethodMarker]?: AstTrackableMethodOptions };

  rtObjectAssign(trackableTarget, {
    [astTrackableMethodMarker]: {
      deps: options.deps,
    }
  });
}
/* eslint-enable @typescript-eslint/ban-types */
