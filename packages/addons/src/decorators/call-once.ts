import { ICustomElementViewModel } from '@aurelia/runtime-html';

/**
 * Decorator that ensures a method is called only once no matter how many times it's invoked.
 * Caches and returns the result of the first call for all future invocations.
 * @param errorMessage Error message to display in case of concurrent calls (optional).
 */
export function callOnce(errorMessage = ''): MethodDecorator {
  const cache = new WeakMap<object, unknown>();
  return function (target: ICustomElementViewModel, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    if (typeof descriptor.value !== 'function') {
      throw new Error(`@callOnce can only be used on methods, not "${String(propertyKey)}".`);
    }

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      if (cache.has(this)) {
        if (errorMessage) {
          console.warn(`Warning: ${String(propertyKey)} ${errorMessage}`);
        }
        return cache.get(this);
      }
      const result = originalMethod.apply(this, args);
      cache.set(this, result);
      return result;
    };
  } as MethodDecorator;
}