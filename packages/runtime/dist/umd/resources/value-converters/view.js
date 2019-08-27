(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../../templating/view", "../value-converter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const view_1 = require("../../templating/view");
    const value_converter_1 = require("../value-converter");
    let ViewValueConverter = class ViewValueConverter {
        constructor(viewLocator) {
            this.viewLocator = viewLocator;
        }
        toView(object, viewNameOrSelector) {
            return this.viewLocator.getViewComponentForObject(object, viewNameOrSelector);
        }
    };
    ViewValueConverter = tslib_1.__decorate([
        value_converter_1.valueConverter('view'),
        tslib_1.__param(0, view_1.IViewLocator)
    ], ViewValueConverter);
    exports.ViewValueConverter = ViewValueConverter;
});
//# sourceMappingURL=view.js.map