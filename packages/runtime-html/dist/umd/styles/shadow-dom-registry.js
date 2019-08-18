(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./shadow-dom-styles"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const shadow_dom_styles_1 = require("./shadow-dom-styles");
    class ShadowDOMRegistry {
        constructor(sharedStyles, createStyles) {
            this.sharedStyles = sharedStyles;
            this.createStyles = createStyles;
        }
        register(container, ...params) {
            container.register(kernel_1.Registration.instance(shadow_dom_styles_1.IShadowDOMStyles, this.createStyles(params, this.sharedStyles)));
        }
    }
    exports.ShadowDOMRegistry = ShadowDOMRegistry;
});
//# sourceMappingURL=shadow-dom-registry.js.map