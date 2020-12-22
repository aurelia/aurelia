"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loader = void 0;
const plugin_conventions_1 = require("@aurelia/plugin-conventions");
const loader_utils_1 = require("loader-utils");
function default_1(contents, sourceMap) {
    return loader.call(this, contents);
}
exports.default = default_1;
function loader(contents, _preprocess = plugin_conventions_1.preprocess // for testing
) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/strict-boolean-expressions
    this.cacheable && this.cacheable();
    // @ts-ignore TODO: fix types
    const cb = this.async();
    const options = loader_utils_1.getOptions(this);
    const filePath = this.resourcePath;
    try {
        const result = _preprocess({ path: filePath, contents }, plugin_conventions_1.preprocessOptions(options || {}));
        // webpack uses source-map 0.6.1 typings for RawSourceMap which
        // contains typing error version: string (should be number).
        // use result.map as any to bypass the typing issue.
        if (result) {
            cb(null, result.code, result.map);
            return;
        }
        // bypassed
        cb(null, contents);
    }
    catch (e) {
        cb(e);
    }
}
exports.loader = loader;
//# sourceMappingURL=index.js.map