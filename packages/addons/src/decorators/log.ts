/**
 * Returns a decorator function that logs method calls with their respective arguments and results.
 *
 * @param {Object} target - The object being decorated.
 * @param {string|symbol} propertyKey - The name of the method being decorated.
 * @param {TypedPropertyDescriptor<any>} descriptor - The method's property descriptor.
 * @returns {TypedPropertyDescriptor<any>} - The modified property descriptor.
 */
export function log(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    /**
     * Logs the method call with its arguments and result, then returns the result.
     *
     * @param {...any} args - The arguments passed to the method.
     * @returns {any} - The result of the method.
     */
    descriptor.value = function(...args: any[]) {
        console.log(`Method ${propertyKey.toString()} was called on type ${target.constructor.name} with arguments: ${JSON.stringify(args)}`);
        const result = originalMethod.apply(this, args);
        console.log(`Method ${propertyKey.toString()} was called on type ${target.constructor.name} with result: ${JSON.stringify(result)}`);
        return result;
    };

    return descriptor;
};
