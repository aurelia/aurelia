import { noop, Registration } from '../../../kernel/dist/native-modules/index.js';
import { IValidationExpressionHydrator } from './rule-interfaces.js';
import { ICustomMessages, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule-provider.js';
import { IValidationMessageProvider } from './rules.js';
import { ModelValidationExpressionHydrator, ValidationDeserializer } from './serialization.js';
import { IValidator, StandardValidator } from './validator.js';
export function getDefaultValidationConfiguration() {
    return {
        ValidatorType: StandardValidator,
        MessageProviderType: ValidationMessageProvider,
        CustomMessages: [],
        HydratorType: ModelValidationExpressionHydrator,
    };
}
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationConfiguration();
            optionsProvider(options);
            container.register(Registration.instance(ICustomMessages, options.CustomMessages), Registration.singleton(IValidator, options.ValidatorType), Registration.singleton(IValidationMessageProvider, options.MessageProviderType), Registration.singleton(IValidationExpressionHydrator, options.HydratorType), Registration.transient(IValidationRules, ValidationRules), ValidationDeserializer);
            return container;
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
export const ValidationConfiguration = createConfiguration(noop);
//# sourceMappingURL=configuration.js.map