/**
 * Returns a decorator function that can be used to measure the time it takes to execute a method.
 *
 * @returns {Function} - The decorator function.
 */
export function timing() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor.value;

    /**
     * Executes the annotated method, measures the execution time and logs it to the console.
     *
     * @param {...any} args - The arguments passed to the method.
     * @returns {any} - The result of the method.
     */
    descriptor.value = function (...args: any[]) {
      console.time(`Method ${propertyKey.toString()} was called on type ${target.constructor.name}`);
      const result = originalMethod.apply(this, args);
      console.timeEnd(`Method ${propertyKey.toString()} was called on type ${target.constructor.name}`);
      return result;
    };

    return descriptor;
  }
}
