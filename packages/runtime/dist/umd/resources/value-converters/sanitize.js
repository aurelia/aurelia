(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../value-converter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const value_converter_1 = require("../value-converter");
    const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    exports.ISanitizer = kernel_1.DI.createInterface('ISanitizer').withDefault(x => x.singleton(class {
        sanitize(input) {
            return input.replace(SCRIPT_REGEX, '');
        }
    }));
    /**
     * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
     */
    let SanitizeValueConverter = class SanitizeValueConverter {
        constructor(sanitizer) {
            this.sanitizer = sanitizer;
        }
        /**
         * Process the provided markup that flows to the view.
         *
         * @param untrustedMarkup - The untrusted markup to be sanitized.
         */
        toView(untrustedMarkup) {
            if (untrustedMarkup == null) {
                return null;
            }
            return this.sanitizer.sanitize(untrustedMarkup);
        }
    };
    SanitizeValueConverter = tslib_1.__decorate([
        value_converter_1.valueConverter('sanitize'),
        tslib_1.__param(0, exports.ISanitizer)
    ], SanitizeValueConverter);
    exports.SanitizeValueConverter = SanitizeValueConverter;
});
//# sourceMappingURL=sanitize.js.map