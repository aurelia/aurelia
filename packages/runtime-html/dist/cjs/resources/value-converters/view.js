"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewValueConverter = void 0;
const view_js_1 = require("../../templating/view.js");
const runtime_1 = require("@aurelia/runtime");
let ViewValueConverter = class ViewValueConverter {
    constructor(viewLocator) {
        this.viewLocator = viewLocator;
    }
    toView(object, viewNameOrSelector) {
        return this.viewLocator.getViewComponentForObject(object, viewNameOrSelector);
    }
};
ViewValueConverter = __decorate([
    __param(0, view_js_1.IViewLocator)
], ViewValueConverter);
exports.ViewValueConverter = ViewValueConverter;
runtime_1.valueConverter('view')(ViewValueConverter);
//# sourceMappingURL=view.js.map