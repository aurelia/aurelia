"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationI18nConfiguration = void 0;
const kernel_1 = require("@aurelia/kernel");
const validation_html_1 = require("@aurelia/validation-html");
const localization_js_1 = require("./localization.js");
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = {
                ...validation_html_1.getDefaultValidationHtmlConfiguration(),
                MessageProviderType: localization_js_1.LocalizedValidationMessageProvider,
                ValidationControllerFactoryType: localization_js_1.LocalizedValidationControllerFactory,
                DefaultNamespace: void 0,
                DefaultKeyPrefix: void 0,
            };
            optionsProvider(options);
            const keyConfiguration = {
                DefaultNamespace: options.DefaultNamespace,
                DefaultKeyPrefix: options.DefaultKeyPrefix,
            };
            return container.register(validation_html_1.ValidationHtmlConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const key of Object.keys(opt)) {
                    if (key in options) {
                        opt[key] = options[key]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), kernel_1.Registration.callback(localization_js_1.I18nKeyConfiguration, () => keyConfiguration));
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
exports.ValidationI18nConfiguration = createConfiguration(kernel_1.noop);
//# sourceMappingURL=configuration.js.map