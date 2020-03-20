import { LocalizedValidationMessageProvider, LocalizedValidationControllerFactory, I18nKeyConfiguration } from './localization';
import { PLATFORM, Registration } from '@aurelia/kernel';
import { ValidationConfiguration, getDefaultValidationConfiguration } from '@aurelia/validation';
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = {
                ...getDefaultValidationConfiguration(),
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
            return container.register(ValidationConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const key of Object.keys(opt)) {
                    if (key in options) {
                        opt[key] = options[key]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), Registration.callback(I18nKeyConfiguration, () => keyConfiguration));
        },
        customize(cb) {
            return createConfiguration((cb !== null && cb !== void 0 ? cb : optionsProvider));
        },
    };
}
export const ValidationI18nConfiguration = createConfiguration(PLATFORM.noop);
//# sourceMappingURL=configuration.js.map