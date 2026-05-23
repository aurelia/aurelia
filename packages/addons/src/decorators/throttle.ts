/**
 * Returns a decorator function that can be used to throttle a method from being executed too frequently.
 *
 * @param {number} time - The amount of time (in milliseconds) to wait before allowing the method to execute again.
 * @returns {Function} - The decorator function.
 */
export function throttle(time: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let timeout:number | undefined;

    /**
     * Executes the annotated method only if it hasn't been called within the specified time period.
     *
     * @param {...any} args - The arguments passed to the method.
     * @returns {any} - The result of the method (or undefined if the method was throttled).
     */
    descriptor.value = function(...args: any[]) {
      if (!timeout) {
        timeout = setTimeout(() => {
          clearTimeout(timeout);
          timeout = undefined;
        }, time);
        return descriptor.value.apply(this, args);
      }
    }

    return descriptor;
  };
}
