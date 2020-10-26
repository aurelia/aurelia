(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.I18nInitOptions = void 0;
    const kernel_1 = require("@aurelia/kernel");
    exports.I18nInitOptions = kernel_1.DI.createInterface('I18nInitOptions');
});
//# sourceMappingURL=i18n-configuration-options.js.map