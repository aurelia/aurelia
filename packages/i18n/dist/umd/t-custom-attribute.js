(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "./i18n"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const i18n_1 = require("./i18n");
    // TODO write unit tests
    /**
     * `t` custom attribute to facilitate the translation via HTML
     * @export
     */
    let TCustomAttribute = class TCustomAttribute {
        constructor(node, i18n) {
            this.node = node;
            this.i18n = i18n;
            this.value = (void 0);
        }
        binding(flags) {
            return this.isStringValue(this.value)
                ? this.i18n.updateValue(this.node, this.value)
                : runtime_1.LifecycleTask.done;
        }
        isStringValue(value) {
            const valueType = typeof value;
            if (valueType !== 'string') {
                throw new Error(`Only string value is supported by the localization attribute, found value of type ${valueType}`);
            }
            // skip translation if the value is null, undefined, or empty
            return !!value;
        }
    };
    tslib_1.__decorate([
        runtime_1.bindable
    ], TCustomAttribute.prototype, "value", void 0);
    TCustomAttribute = tslib_1.__decorate([
        runtime_1.customAttribute({ name: 't' }),
        tslib_1.__param(0, runtime_1.INode),
        tslib_1.__param(1, i18n_1.I18N)
    ], TCustomAttribute);
    exports.TCustomAttribute = TCustomAttribute;
});
//# sourceMappingURL=t-custom-attribute.js.map