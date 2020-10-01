(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./name-convention", "./preprocess-resource", "./preprocess-html-template", "./strip-meta-data", "./preprocess", "./options"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var name_convention_1 = require("./name-convention");
    Object.defineProperty(exports, "nameConvention", { enumerable: true, get: function () { return name_convention_1.nameConvention; } });
    var preprocess_resource_1 = require("./preprocess-resource");
    Object.defineProperty(exports, "preprocessResource", { enumerable: true, get: function () { return preprocess_resource_1.preprocessResource; } });
    var preprocess_html_template_1 = require("./preprocess-html-template");
    Object.defineProperty(exports, "preprocessHtmlTemplate", { enumerable: true, get: function () { return preprocess_html_template_1.preprocessHtmlTemplate; } });
    var strip_meta_data_1 = require("./strip-meta-data");
    Object.defineProperty(exports, "stripMetaData", { enumerable: true, get: function () { return strip_meta_data_1.stripMetaData; } });
    var preprocess_1 = require("./preprocess");
    Object.defineProperty(exports, "preprocess", { enumerable: true, get: function () { return preprocess_1.preprocess; } });
    var options_1 = require("./options");
    Object.defineProperty(exports, "defaultCssExtensions", { enumerable: true, get: function () { return options_1.defaultCssExtensions; } });
    Object.defineProperty(exports, "defaultJsExtensions", { enumerable: true, get: function () { return options_1.defaultJsExtensions; } });
    Object.defineProperty(exports, "defaultTemplateExtensions", { enumerable: true, get: function () { return options_1.defaultTemplateExtensions; } });
    Object.defineProperty(exports, "preprocessOptions", { enumerable: true, get: function () { return options_1.preprocessOptions; } });
});
//# sourceMappingURL=index.js.map