(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/jit"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlainAttributeSymbol = exports.CustomAttributeSymbol = exports.BindingSymbol = exports.TextSymbol = exports.TemplateControllerSymbol = exports.ProjectionSymbol = exports.PlainElementSymbol = exports.LetElementSymbol = exports.CustomElementSymbol = void 0;
    const jit_1 = require("@aurelia/jit");
    Object.defineProperty(exports, "BindingSymbol", { enumerable: true, get: function () { return jit_1.BindingSymbol; } });
    Object.defineProperty(exports, "CustomAttributeSymbol", { enumerable: true, get: function () { return jit_1.CustomAttributeSymbol; } });
    Object.defineProperty(exports, "PlainAttributeSymbol", { enumerable: true, get: function () { return jit_1.PlainAttributeSymbol; } });
    exports.CustomElementSymbol = jit_1.CustomElementSymbol;
    exports.LetElementSymbol = jit_1.LetElementSymbol;
    exports.PlainElementSymbol = jit_1.PlainElementSymbol;
    exports.ProjectionSymbol = jit_1.ProjectionSymbol;
    exports.TemplateControllerSymbol = jit_1.TemplateControllerSymbol;
    exports.TextSymbol = jit_1.TextSymbol;
});
//# sourceMappingURL=semantic-model.js.map