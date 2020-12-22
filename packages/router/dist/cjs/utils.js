"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deprecationWarning = exports.resolvePossiblePromise = exports.arrayRemove = void 0;
/**
 * @internal - Shouldn't be used directly
 */
function arrayRemove(arr, func) {
    const removed = [];
    let arrIndex = arr.findIndex(func);
    while (arrIndex >= 0) {
        removed.push(arr.splice(arrIndex, 1)[0]);
        arrIndex = arr.findIndex(func);
    }
    return removed;
}
exports.arrayRemove = arrayRemove;
function resolvePossiblePromise(value, callback) {
    // If we've got a Promise, wait for it's resolve
    if (value instanceof Promise) {
        return value.then((resolvedValue) => {
            if (callback !== void 0) {
                callback(resolvedValue);
            }
            return resolvedValue;
        });
    }
    if (callback !== void 0) {
        callback(value);
    }
    return value;
}
exports.resolvePossiblePromise = resolvePossiblePromise;
function deprecationWarning(oldFeature, newFeature) {
    console.warn(`[Deprecated] The ${oldFeature} has been deprecated. Please use the ${newFeature} instead.`);
}
exports.deprecationWarning = deprecationWarning;
//# sourceMappingURL=utils.js.map