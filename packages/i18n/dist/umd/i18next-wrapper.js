(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "i18next"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.I18nextWrapper = exports.I18nWrapper = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const i18next_1 = require("i18next");
    exports.I18nWrapper = kernel_1.DI.createInterface('I18nextWrapper');
    /**
     * A wrapper class over i18next to facilitate the easy testing and DI.
     */
    class I18nextWrapper {
        constructor() {
            this.i18next = i18next_1.default;
        }
    }
    exports.I18nextWrapper = I18nextWrapper;
});
//# sourceMappingURL=i18next-wrapper.js.map