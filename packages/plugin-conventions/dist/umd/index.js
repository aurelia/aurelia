(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./name-convention", "./preprocess-resource", "./preprocess-html-template", "./strip-html-import"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var name_convention_1 = require("./name-convention");
    exports.nameConvention = name_convention_1.nameConvention;
    var preprocess_resource_1 = require("./preprocess-resource");
    exports.preprocessResource = preprocess_resource_1.preprocessResource;
    var preprocess_html_template_1 = require("./preprocess-html-template");
    exports.preprocessHtmlTemplate = preprocess_html_template_1.preprocessHtmlTemplate;
    var strip_html_import_1 = require("./strip-html-import");
    exports.stripHtmlImport = strip_html_import_1.stripHtmlImport;
});
//# sourceMappingURL=index.js.map