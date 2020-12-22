"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCartesianProduct = exports.eachCartesianJoinAsync = exports.eachCartesianJoin = exports.eachCartesianJoinFactory = void 0;
function eachCartesianJoinFactory(arrays, callback) {
    arrays = arrays.slice(0).filter(arr => arr.length > 0);
    if (typeof callback !== 'function') {
        throw new Error('Callback is not a function');
    }
    if (arrays.length === 0) {
        return;
    }
    const totalCallCount = arrays.reduce((count, arr) => count *= arr.length, 1);
    const argsIndices = Array(arrays.length).fill(0);
    const errors = [];
    let args = null;
    try {
        args = updateElementByIndicesFactory(arrays, Array(arrays.length), argsIndices);
        callback(...args);
    }
    catch (e) {
        errors.push(e);
    }
    let callCount = 1;
    if (totalCallCount === callCount) {
        return;
    }
    let stop = false;
    while (!stop) {
        const hasUpdate = updateIndices(arrays, argsIndices);
        if (hasUpdate) {
            try {
                callback(...updateElementByIndicesFactory(arrays, args, argsIndices));
            }
            catch (e) {
                errors.push(e);
            }
            callCount++;
            if (totalCallCount < callCount) {
                throw new Error('Invalid loop implementation.');
            }
        }
        else {
            stop = true;
        }
    }
    if (errors.length > 0) {
        const msg = `eachCartesionJoinFactory failed to load ${errors.length} tests:\n\n${errors.map(e => e.message).join('\n')}`;
        throw new Error(msg);
    }
}
exports.eachCartesianJoinFactory = eachCartesianJoinFactory;
function updateElementByIndicesFactory(arrays, args, indices) {
    for (let i = 0, ii = arrays.length; ii > i; ++i) {
        args[i] = arrays[i][indices[i]](...args);
    }
    return args;
}
function eachCartesianJoin(arrays, callback) {
    arrays = arrays.slice(0).filter(arr => arr.length > 0);
    if (typeof callback !== 'function') {
        throw new Error('Callback is not a function');
    }
    if (arrays.length === 0) {
        return;
    }
    const totalCallCount = arrays.reduce((count, arr) => count *= arr.length, 1);
    const argsIndices = Array(arrays.length).fill(0);
    const args = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
    callback(...args, 0);
    let callCount = 1;
    if (totalCallCount === callCount) {
        return;
    }
    let stop = false;
    while (!stop) {
        const hasUpdate = updateIndices(arrays, argsIndices);
        if (hasUpdate) {
            callback(...updateElementByIndices(arrays, args, argsIndices), callCount);
            callCount++;
            if (totalCallCount < callCount) {
                throw new Error('Invalid loop implementation.');
            }
        }
        else {
            stop = true;
        }
    }
}
exports.eachCartesianJoin = eachCartesianJoin;
async function eachCartesianJoinAsync(arrays, callback) {
    arrays = arrays.slice(0).filter(arr => arr.length > 0);
    if (typeof callback !== 'function') {
        throw new Error('Callback is not a function');
    }
    if (arrays.length === 0) {
        return;
    }
    const totalCallCount = arrays.reduce((count, arr) => count *= arr.length, 1);
    const argsIndices = Array(arrays.length).fill(0);
    const args = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
    await callback(...args, 0);
    let callCount = 1;
    if (totalCallCount === callCount) {
        return;
    }
    let stop = false;
    while (!stop) {
        const hasUpdate = updateIndices(arrays, argsIndices);
        if (hasUpdate) {
            await callback(...updateElementByIndices(arrays, args, argsIndices), callCount);
            callCount++;
            if (totalCallCount < callCount) {
                throw new Error('Invalid loop implementation.');
            }
        }
        else {
            stop = true;
        }
    }
}
exports.eachCartesianJoinAsync = eachCartesianJoinAsync;
function updateIndices(arrays, indices) {
    let arrIndex = arrays.length;
    while (arrIndex--) {
        if (indices[arrIndex] === arrays[arrIndex].length - 1) {
            if (arrIndex === 0) {
                return false;
            }
            continue;
        }
        indices[arrIndex] += 1;
        for (let i = arrIndex + 1, ii = arrays.length; ii > i; ++i) {
            indices[i] = 0;
        }
        return true;
    }
    return false;
}
function updateElementByIndices(arrays, args, indices) {
    for (let i = 0, ii = arrays.length; ii > i; ++i) {
        args[i] = arrays[i][indices[i]];
    }
    return args;
}
function* generateCartesianProduct(arrays) {
    const [head, ...tail] = arrays;
    const tailCombinations = tail.length > 0 ? generateCartesianProduct(tail) : [[]];
    for (const t of tailCombinations) {
        for (const h of head) {
            yield [h, ...t];
        }
    }
}
exports.generateCartesianProduct = generateCartesianProduct;
//# sourceMappingURL=each-cartesian-join.js.map