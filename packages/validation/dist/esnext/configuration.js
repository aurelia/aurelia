import { PLATFORM, Protocol, Registration } from '@aurelia/kernel';
import { IValidationHydrator } from './rule-interfaces';
import { ICustomMessages, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ModelValidationHydrator, ValidationDeserializer } from "./serialization";
import { ValidationContainerCustomElement } from './subscribers/validation-container-custom-element';
import { ValidationErrorsCustomAttribute } from './subscribers/validation-errors-custom-attribute';
import { IDefaultTrigger, ValidateBindingBehavior, ValidationTrigger } from './validate-binding-behavior';
import { IValidationController, ValidationControllerFactory } from './validation-controller';
import { IValidator, StandardValidator } from './validator';
export function getDefaultValidationConfiguration() {
    return {
        ValidatorType: StandardValidator,
        MessageProviderType: ValidationMessageProvider,
        ValidationControllerFactoryType: ValidationControllerFactory,
        CustomMessages: [],
        DefaultTrigger: ValidationTrigger.blur,
        HydratorType: ModelValidationHydrator,
        UseSubscriberCustomAttribute: true,
        UseSubscriberCustomElement: true
    };
}
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationConfiguration();
            optionsProvider(options);
            const key = Protocol.annotation.keyFor('di:factory');
            Protocol.annotation.set(IValidationController, 'di:factory', new options.ValidationControllerFactoryType());
            Protocol.annotation.appendTo(IValidationController, key);
            container.register(Registration.instance(ICustomMessages, options.CustomMessages), Registration.instance(IDefaultTrigger, options.DefaultTrigger), Registration.singleton(IValidator, options.ValidatorType), Registration.singleton(IValidationMessageProvider, options.MessageProviderType), Registration.singleton(IValidationHydrator, options.HydratorType), Registration.transient(IValidationRules, ValidationRules), ValidateBindingBehavior, ValidationDeserializer);
            if (options.UseSubscriberCustomAttribute) {
                container.register(ValidationErrorsCustomAttribute);
            }
            if (options.UseSubscriberCustomElement) {
                container.register(ValidationContainerCustomElement);
            }
            return container;
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
export const ValidationConfiguration = createConfiguration(PLATFORM.noop);
//# sourceMappingURL=configuration.js.map