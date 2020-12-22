"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRelativeModulePath = exports.resolvePath = exports.joinPath = exports.normalizePath = void 0;
const path_1 = require("path");
exports.normalizePath = (function () {
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
function joinPath(...paths) {
    return exports.normalizePath(path_1.join(...paths));
}
exports.joinPath = joinPath;
function resolvePath(...paths) {
    return exports.normalizePath(path_1.resolve(...paths));
}
exports.resolvePath = resolvePath;
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
function isRelativeModulePath(path) {
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
exports.isRelativeModulePath = isRelativeModulePath;
//# sourceMappingURL=path-utils.js.map