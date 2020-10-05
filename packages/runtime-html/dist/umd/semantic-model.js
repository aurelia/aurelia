(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlainAttributeSymbol = exports.CustomAttributeSymbol = exports.BindingSymbol = exports.TextSymbol = exports.TemplateControllerSymbol = exports.ProjectionSymbol = exports.PlainElementSymbol = exports.LetElementSymbol = exports.CustomElementSymbol = void 0;
    const runtime_1 = require("@aurelia/runtime");
    Object.defineProperty(exports, "BindingSymbol", { enumerable: true, get: function () { return runtime_1.BindingSymbol; } });
    Object.defineProperty(exports, "CustomAttributeSymbol", { enumerable: true, get: function () { return runtime_1.CustomAttributeSymbol; } });
    Object.defineProperty(exports, "PlainAttributeSymbol", { enumerable: true, get: function () { return runtime_1.PlainAttributeSymbol; } });
    exports.CustomElementSymbol = runtime_1.CustomElementSymbol;
    exports.LetElementSymbol = runtime_1.LetElementSymbol;
    exports.PlainElementSymbol = runtime_1.PlainElementSymbol;
    exports.ProjectionSymbol = runtime_1.ProjectionSymbol;
    exports.TemplateControllerSymbol = runtime_1.TemplateControllerSymbol;
    exports.TextSymbol = runtime_1.TextSymbol;
});
//# sourceMappingURL=semantic-model.js.map