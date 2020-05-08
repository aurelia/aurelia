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
        define(["require", "exports", "@aurelia/runtime", "../observation/class-attribute-accessor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const class_attribute_accessor_1 = require("../observation/class-attribute-accessor");
    function cssModules(...cssModules) {
        return new CSSModulesProcessorRegistry(cssModules);
    }
    exports.cssModules = cssModules;
    class CSSModulesProcessorRegistry {
        constructor(cssModules) {
            this.cssModules = cssModules;
        }
        register(container) {
            const classLookup = Object.assign({}, ...this.cssModules);
            let ClassCustomAttribute = class ClassCustomAttribute {
                constructor(element /* TODO(fkleuver): fix this type annotation reflection issue in AOT */) {
                    this.element = element;
                }
                beforeBind() {
                    this.valueChanged();
                }
                valueChanged() {
                    if (!this.value) {
                        this.element.className = '';
                        return;
                    }
                    this.element.className = class_attribute_accessor_1.getClassesToAdd(this.value)
                        .map(x => classLookup[x] || x)
                        .join(' ');
                }
            };
            __decorate([
                runtime_1.bindable,
                __metadata("design:type", String)
            ], ClassCustomAttribute.prototype, "value", void 0);
            ClassCustomAttribute = __decorate([
                runtime_1.customAttribute('class'),
                __param(0, runtime_1.INode),
                __metadata("design:paramtypes", [Object])
            ], ClassCustomAttribute);
            container.register(ClassCustomAttribute);
        }
    }
    exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;
});
//# sourceMappingURL=css-modules-registry.js.map