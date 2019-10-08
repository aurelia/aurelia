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
    const jit_1 = require("@aurelia/jit");
    exports.BindingSymbol = jit_1.BindingSymbol;
    exports.CustomAttributeSymbol = jit_1.CustomAttributeSymbol;
    exports.PlainAttributeSymbol = jit_1.PlainAttributeSymbol;
    exports.CustomElementSymbol = jit_1.CustomElementSymbol;
    exports.LetElementSymbol = jit_1.LetElementSymbol;
    exports.PlainElementSymbol = jit_1.PlainElementSymbol;
    exports.ReplacePartSymbol = jit_1.ReplacePartSymbol;
    exports.TemplateControllerSymbol = jit_1.TemplateControllerSymbol;
    exports.TextSymbol = jit_1.TextSymbol;
});
//# sourceMappingURL=semantic-model.js.map