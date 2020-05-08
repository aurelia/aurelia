var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../templating/view", "../value-converter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    ViewValueConverter = __decorate([
        value_converter_1.valueConverter('view'),
        __param(0, view_1.IViewLocator),
        __metadata("design:paramtypes", [Object])
    ], ViewValueConverter);
    exports.ViewValueConverter = ViewValueConverter;
});
//# sourceMappingURL=view.js.map