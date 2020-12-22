"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormatBindingBehavior = void 0;
const runtime_1 = require("@aurelia/runtime");
const utils_js_1 = require("../utils.js");
let DateFormatBindingBehavior = class DateFormatBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        utils_js_1.createIntlFormatValueConverterExpression("df" /* dateFormatValueConverterName */, binding);
    }
};
DateFormatBindingBehavior = __decorate([
    runtime_1.bindingBehavior("df" /* dateFormatValueConverterName */)
], DateFormatBindingBehavior);
exports.DateFormatBindingBehavior = DateFormatBindingBehavior;
//# sourceMappingURL=date-format-binding-behavior.js.map