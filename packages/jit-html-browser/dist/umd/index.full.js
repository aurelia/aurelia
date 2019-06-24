(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/jit", "@aurelia/jit-html", "@aurelia/kernel", "@aurelia/runtime", "@aurelia/runtime-html", "@aurelia/runtime-html-browser", "./index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jit = require("@aurelia/jit");
    exports.jit = jit;
    const jitHtml = require("@aurelia/jit-html");
    exports.jitHtml = jitHtml;
    const kernel = require("@aurelia/kernel");
    exports.kernel = kernel;
    const runtime = require("@aurelia/runtime");
    exports.runtime = runtime;
    const runtimeHtml = require("@aurelia/runtime-html");
    exports.runtimeHtml = runtimeHtml;
    const runtimeHtmlBrowser = require("@aurelia/runtime-html-browser");
    exports.runtimeHtmlBrowser = runtimeHtmlBrowser;
    const jitHtmlBrowser = require("./index");
    exports.jitHtmlBrowser = jitHtmlBrowser;
});
//# sourceMappingURL=index.full.js.map