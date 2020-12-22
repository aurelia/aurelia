import { noop, Registration } from '@aurelia/kernel';
import { getDefaultValidationHtmlConfiguration, ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { I18nKeyConfiguration, LocalizedValidationControllerFactory, LocalizedValidationMessageProvider } from './localization.js';
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = {
                ...getDefaultValidationHtmlConfiguration(),
                MessageProviderType: LocalizedValidationMessageProvider,
                ValidationControllerFactoryType: LocalizedValidationControllerFactory,
                DefaultNamespace: void 0,
                DefaultKeyPrefix: void 0,
            };
            optionsProvider(options);
            const keyConfiguration = {
                DefaultNamespace: options.DefaultNamespace,
                DefaultKeyPrefix: options.DefaultKeyPrefix,
            };
            return container.register(ValidationHtmlConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const key of Object.keys(opt)) {
                    if (key in options) {
                        opt[key] = options[key]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), Registration.callback(I18nKeyConfiguration, () => keyConfiguration));
        },
        customize(cb) {
            return createConfiguration(cb ?? optionsProvider);
        },
    };
}
export const ValidationI18nConfiguration = createConfiguration(noop);
//# sourceMappingURL=configuration.js.map