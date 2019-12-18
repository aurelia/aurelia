import { join, resolve, } from 'path';
export const normalizePath = (function () {
    const cache = Object.create(null);
    const regex = /\\/g;
    return function (path) {
        let normalized = cache[path];
        if (normalized === void 0) {
            normalized = cache[path] = path.replace(regex, '/');
        }
        return normalized;
    };
})();
export function joinPath(...paths) {
    return normalizePath(join(...paths));
}
export function resolvePath(...paths) {
    return normalizePath(resolve(...paths));
}
/**
 * Returns `true` if this is an absolute POSIX, UNC or DOS path.
 *
 * Assumes path has already been normalized with `normalizePath`
 */
function isRootedDiskPath(path) {
    const ch0 = path.charCodeAt(0);
    return (ch0 === 47 /* Slash */
        || (ch0 >= 97 /* LowerA */
            && ch0 <= 122 /* LowerZ */
            && path.charCodeAt(1) === 58 /* Colon */));
}
export function isRelativeModulePath(path) {
    const ch0 = path.charCodeAt(0);
    if (ch0 === 46 /* Dot */) {
        const ch1 = path.charCodeAt(1);
        if (ch1 === 46 /* Dot */) {
            return path.charCodeAt(2) === 47 /* Slash */ || path.length === 2;
        }
        return ch1 === 47 /* Slash */ || path.length === 1;
    }
    return isRootedDiskPath(path);
}
//# sourceMappingURL=path-utils.js.map