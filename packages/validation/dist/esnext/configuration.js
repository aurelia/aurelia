import { PLATFORM, Registration } from '@aurelia/kernel';
import { IValidationHydrator } from './rule-interfaces';
import { ICustomMessages, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ModelValidationHydrator, ValidationDeserializer } from './serialization';
import { IValidator, StandardValidator } from './validator';
export function getDefaultValidationConfiguration() {
    return {
        ValidatorType: StandardValidator,
        MessageProviderType: ValidationMessageProvider,
        CustomMessages: [],
        HydratorType: ModelValidationHydrator,
    };
}
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationConfiguration();
            optionsProvider(options);
            container.register(Registration.instance(ICustomMessages, options.CustomMessages), Registration.singleton(IValidator, options.ValidatorType), Registration.singleton(IValidationMessageProvider, options.MessageProviderType), Registration.singleton(IValidationHydrator, options.HydratorType), Registration.transient(IValidationRules, ValidationRules), ValidationDeserializer);
            return container;
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
export const ValidationConfiguration = createConfiguration(PLATFORM.noop);
//# sourceMappingURL=configuration.js.map