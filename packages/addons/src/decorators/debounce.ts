/**
 * A decorator function that implements debounce functionality on a method. 
 *
 * @param {number} wait - The number of milliseconds to wait before invoking the wrapped method.
 * @returns {Function} - Returns a decorator function that can be applied to a class method.
 */
export function debounce(wait: number) {

    /**
     * A decorator function that wraps a class method with debounce functionality. 
     *
     * @param {Object} target - The object being decorated.
     * @param {string|symbol} propertyKey - The name of the method being decorated.
     * @param {PropertyDescriptor} descriptor - The descriptor for the method being decorated.
     * @returns {PropertyDescriptor} - Returns the updated descriptor for the decorated method.
     */
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        
        let timeout: number;
        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                originalMethod.apply(this, args);
            }, wait);
        };

        return descriptor;
    };
}
