(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./shadow-dom-styles", "./shadow-dom-registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const shadow_dom_styles_1 = require("./shadow-dom-styles");
    const shadow_dom_registry_1 = require("./shadow-dom-registry");
    exports.StyleConfiguration = {
        shadowDOM(config) {
            return runtime_1.StartTask.with(kernel_1.IContainer).beforeCreate().call(container => {
                if (config.sharedStyles) {
                    const factory = container.get(shadow_dom_registry_1.IShadowDOMStyleFactory);
                    container.register(kernel_1.Registration.instance(shadow_dom_styles_1.IShadowDOMGlobalStyles, factory.createStyles(config.sharedStyles, null)));
                }
            });
        }
    };
});
//# sourceMappingURL=style-configuration.js.map