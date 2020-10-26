(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./shadow-dom-styles", "./shadow-dom-registry", "../app-task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StyleConfiguration = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const shadow_dom_styles_1 = require("./shadow-dom-styles");
    const shadow_dom_registry_1 = require("./shadow-dom-registry");
    const app_task_1 = require("../app-task");
    exports.StyleConfiguration = {
        shadowDOM(config) {
            return app_task_1.AppTask.with(kernel_1.IContainer).beforeCreate().call(container => {
                if (config.sharedStyles) {
                    const factory = container.get(shadow_dom_registry_1.IShadowDOMStyleFactory);
                    container.register(kernel_1.Registration.instance(shadow_dom_styles_1.IShadowDOMGlobalStyles, factory.createStyles(config.sharedStyles, null)));
                }
            });
        }
    };
});
//# sourceMappingURL=style-configuration.js.map