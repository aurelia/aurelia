import { Registration } from '@aurelia/kernel';
import { I18N, I18nService } from './i18n';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';
import { TCustomAttribute } from './t-custom-attribute';
function createI18nConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            return container.register(TCustomAttribute, Registration.callback(I18nConfigurationOptions, this.optionsProvider), Registration.singleton(I18nWrapper, I18nextWrapper), Registration.singleton(I18N, I18nService));
        },
        customize(cb) {
            return createI18nConfiguration(cb || optionsProvider);
        },
    };
}
export const I18nConfiguration = createI18nConfiguration(() => Object.create(null));
//# sourceMappingURL=configuration.js.map