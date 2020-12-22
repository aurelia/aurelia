"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePath = exports.joinPath = exports.normalizePath = void 0;
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
//# sourceMappingURL=path-utils.js.map