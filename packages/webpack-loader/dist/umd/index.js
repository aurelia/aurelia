(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "loader-utils", "@aurelia/plugin-conventions", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const loader_utils_1 = require("loader-utils");
    const plugin_conventions_1 = require("@aurelia/plugin-conventions");
    const fs = require("fs");
    function default_1(contents, sourceMap) {
        return loader.call(this, contents);
    }
    exports.default = default_1;
    function loader(contents, _fileExists = fileExists // for testing
    ) {
        // tslint:disable-next-line:no-unused-expression strict-boolean-expressions
        this.cacheable && this.cacheable();
        const cb = this.async();
        const options = loader_utils_1.getOptions(this);
        const ts = options && options.ts;
        const filePath = this.resourcePath;
        const ext = extname(filePath);
        let result;
        try {
            if (ext === '.html') {
                result = plugin_conventions_1.preprocessHtmlTemplate(filePath, contents, ts);
            }
            else {
                const htmlFilePath = filePath.slice(0, -ext.length) + '.html';
                const hasHtmlPair = _fileExists(htmlFilePath);
                result = plugin_conventions_1.preprocessResource(filePath, contents, hasHtmlPair);
            }
        }
        catch (e) {
            cb(e);
            return;
        }
        // webpack uses source-map 0.6.1 typings for RawSourceMap which
        // contains typing error version: string (should be number).
        // use result.map as any to bypass the typing issue.
        cb(null, result.code, result.map);
    }
    exports.loader = loader;
    function extname(filePath) {
        const idx = filePath.lastIndexOf('.');
        if (idx !== -1)
            return filePath.slice(idx);
        return '';
    }
    function fileExists(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.isFile();
        }
        catch (e) {
            return false;
        }
    }
});
//# sourceMappingURL=index.js.map