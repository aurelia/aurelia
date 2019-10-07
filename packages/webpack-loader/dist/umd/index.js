(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/plugin-conventions", "loader-utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const plugin_conventions_1 = require("@aurelia/plugin-conventions");
    const loader_utils_1 = require("loader-utils");
    function default_1(contents, sourceMap) {
        return loader.call(this, contents);
    }
    exports.default = default_1;
    function loader(contents, _preprocess = plugin_conventions_1.preprocess // for testing
    ) {
        // eslint-disable-next-line no-unused-expressions, @typescript-eslint/strict-boolean-expressions
        this.cacheable && this.cacheable();
        const cb = this.async();
        const options = loader_utils_1.getOptions(this);
        const filePath = this.resourcePath;
        try {
            const result = _preprocess({ path: filePath, contents }, plugin_conventions_1.preprocessOptions({ ...options, stringModuleWrap }));
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
    function stringModuleWrap(id) {
        return `!!raw-loader!${id}`;
    }
});
//# sourceMappingURL=index.js.map