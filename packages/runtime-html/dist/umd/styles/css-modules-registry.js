(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    class CSSModulesProcessorRegistry {
        register(container, ...params) {
            const classLookup = Object.assign({}, ...params);
            let ClassCustomAttribute = class ClassCustomAttribute {
                constructor(element) {
                    this.element = element;
                }
                binding() {
                    this.valueChanged();
                }
                valueChanged() {
                    if (!this.value) {
                        this.element.className = '';
                        return;
                    }
                    this.element.className = this.value.split(' ')
                        .map(x => classLookup[x] || x)
                        .join(' ');
                }
            };
            tslib_1.__decorate([
                runtime_1.bindable
            ], ClassCustomAttribute.prototype, "value", void 0);
            ClassCustomAttribute = tslib_1.__decorate([
                runtime_1.customAttribute('class'),
                tslib_1.__param(0, runtime_1.INode)
            ], ClassCustomAttribute);
            container.register(ClassCustomAttribute);
        }
    }
    exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;
});
//# sourceMappingURL=css-modules-registry.js.map