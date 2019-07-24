(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./i18n", "./i18n-configuration-options", "./i18next-wrapper", "./t-custom-attribute"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const i18n_1 = require("./i18n");
    const i18n_configuration_options_1 = require("./i18n-configuration-options");
    const i18next_wrapper_1 = require("./i18next-wrapper");
    const t_custom_attribute_1 = require("./t-custom-attribute");
    function createI18nConfiguration(optionsProvider) {
        return {
            optionsProvider,
            register(container) {
                return container.register(t_custom_attribute_1.TCustomAttribute, kernel_1.Registration.callback(i18n_configuration_options_1.I18nConfigurationOptions, this.optionsProvider), kernel_1.Registration.singleton(i18next_wrapper_1.I18nWrapper, i18next_wrapper_1.I18nextWrapper), kernel_1.Registration.singleton(i18n_1.I18N, i18n_1.I18nService));
            },
            customize(cb) {
                return createI18nConfiguration(cb || optionsProvider);
            },
        };
    }
    exports.I18nConfiguration = createI18nConfiguration(() => Object.create(null));
});
//# sourceMappingURL=configuration.js.map