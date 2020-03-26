(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "../observation/class-attribute-accessor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
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
            tslib_1.__decorate([
                runtime_1.bindable,
                tslib_1.__metadata("design:type", String)
            ], ClassCustomAttribute.prototype, "value", void 0);
            ClassCustomAttribute = tslib_1.__decorate([
                runtime_1.customAttribute('class'),
                tslib_1.__param(0, runtime_1.INode),
                tslib_1.__metadata("design:paramtypes", [Object])
            ], ClassCustomAttribute);
            container.register(ClassCustomAttribute);
        }
    }
    exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;
});
//# sourceMappingURL=css-modules-registry.js.map