var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "../../observation/data-attribute-accessor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttrBindingBehavior = void 0;
    const runtime_1 = require("@aurelia/runtime");
    const data_attribute_accessor_1 = require("../../observation/data-attribute-accessor");
    let AttrBindingBehavior = class AttrBindingBehavior {
        bind(flags, _scope, _hostScope, binding) {
            binding.targetObserver = data_attribute_accessor_1.attrAccessor;
        }
        unbind(flags, _scope, _hostScope, binding) {
            return;
        }
    };
    AttrBindingBehavior = __decorate([
        runtime_1.bindingBehavior('attr')
    ], AttrBindingBehavior);
    exports.AttrBindingBehavior = AttrBindingBehavior;
});
//# sourceMappingURL=attr.js.map