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
    let AuHrefCustomAttribute = class AuHrefCustomAttribute {
        constructor(element) {
            this.element = element;
            this.hasHref = null;
        }
        binding() {
            this.updateValue();
        }
        valueChanged(newValue) {
            this.updateValue();
        }
        updateValue() {
            if (this.hasHref === null) {
                this.hasHref = this.element.hasAttribute('href');
            }
            if (!this.hasHref) {
                // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
                const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
                this.element.setAttribute('href', value);
            }
        }
    };
    tslib_1.__decorate([
        runtime_1.bindable({ mode: runtime_1.BindingMode.toView })
    ], AuHrefCustomAttribute.prototype, "value", void 0);
    AuHrefCustomAttribute = tslib_1.__decorate([
        runtime_1.customAttribute('au-href'),
        tslib_1.__param(0, runtime_1.INode)
    ], AuHrefCustomAttribute);
    exports.AuHrefCustomAttribute = AuHrefCustomAttribute;
});
//# sourceMappingURL=au-href.js.map