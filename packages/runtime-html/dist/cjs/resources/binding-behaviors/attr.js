"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttrBindingBehavior = void 0;
const runtime_1 = require("@aurelia/runtime");
const data_attribute_accessor_js_1 = require("../../observation/data-attribute-accessor.js");
let AttrBindingBehavior = class AttrBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        binding.targetObserver = data_attribute_accessor_js_1.attrAccessor;
    }
    unbind(flags, _scope, _hostScope, binding) {
        return;
    }
};
AttrBindingBehavior = __decorate([
    runtime_1.bindingBehavior('attr')
], AttrBindingBehavior);
exports.AttrBindingBehavior = AttrBindingBehavior;
//# sourceMappingURL=attr.js.map