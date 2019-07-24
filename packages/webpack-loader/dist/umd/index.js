(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "loader-utils", "@aurelia/plugin-conventions", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const loader_utils_1 = require("loader-utils");
    const plugin_conventions_1 = require("@aurelia/plugin-conventions");
    const path = require("path");
    function default_1(contents, sourceMap) {
        return loader.call(this, contents);
    }
    exports.default = default_1;
    function loader(contents, _preprocess = plugin_conventions_1.preprocess // for testing
    ) {
        // tslint:disable-next-line:no-unused-expression strict-boolean-expressions
        this.cacheable && this.cacheable();
        const cb = this.async();
        const options = loader_utils_1.getOptions(this);
        const ts = options && options.ts;
        const filePath = this.resourcePath;
        const ext = path.extname(filePath);
        try {
            if (ext === '.html' || ext === '.js' || ext === '.ts') {
                const result = _preprocess(filePath, contents, ts);
                // webpack uses source-map 0.6.1 typings for RawSourceMap which
                // contains typing error version: string (should be number).
                // use result.map as any to bypass the typing issue.
                cb(null, result.code, result.map);
                return;
            }
            // bypass
            cb(null, contents);
        }
        catch (e) {
            cb(e);
        }
    }
    exports.loader = loader;
});
//# sourceMappingURL=index.js.map