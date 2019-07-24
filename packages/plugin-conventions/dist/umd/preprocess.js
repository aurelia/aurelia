(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./preprocess-resource", "./preprocess-html-template", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const preprocess_resource_1 = require("./preprocess-resource");
    const preprocess_html_template_1 = require("./preprocess-html-template");
    const fs = require("fs");
    const path = require("path");
    function preprocess(filePath, contents, ts = false, _fileExists = fileExists // for testing
    ) {
        const ext = path.extname(filePath);
        if (ext === '.html') {
            return preprocess_html_template_1.preprocessHtmlTemplate(filePath, contents, ts);
        }
        else {
            const htmlFilePath = filePath.slice(0, -ext.length) + '.html';
            const hasHtmlPair = _fileExists(htmlFilePath);
            return preprocess_resource_1.preprocessResource(filePath, contents, hasHtmlPair);
        }
    }
    exports.preprocess = preprocess;
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
//# sourceMappingURL=preprocess.js.map