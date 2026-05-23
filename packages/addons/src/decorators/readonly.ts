/**
 * A decorator function that sets a property to be readonly. 
 *
 * @param {Object} target - The object being decorated.
 * @param {string|symbol} key - The name of the property being decorated.
 */
export function readonly(target: any, key: string | symbol) {
    Object.defineProperty(target, key, {
        writable: false
    });
}
