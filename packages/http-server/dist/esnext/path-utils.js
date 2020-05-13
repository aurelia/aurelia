import { join, resolve } from 'path';
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
//# sourceMappingURL=path-utils.js.map