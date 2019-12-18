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
    let GotoCustomAttribute = class GotoCustomAttribute {
        constructor(element) {
            this.hasHref = null;
            this.element = element;
        }
        beforeBind() {
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
        runtime_1.bindable({ mode: runtime_1.BindingMode.toView }),
        tslib_1.__metadata("design:type", Object)
    ], GotoCustomAttribute.prototype, "value", void 0);
    GotoCustomAttribute = tslib_1.__decorate([
        runtime_1.customAttribute('goto'),
        tslib_1.__param(0, runtime_1.INode),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], GotoCustomAttribute);
    exports.GotoCustomAttribute = GotoCustomAttribute;
});
//# sourceMappingURL=goto.js.map