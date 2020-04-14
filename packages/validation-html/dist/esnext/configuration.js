import { PLATFORM, Protocol, Registration } from '@aurelia/kernel';
import { getDefaultValidationConfiguration, ValidationConfiguration } from '@aurelia/validation';
import { ValidationContainerCustomElement, defaultContainerDefinition, defaultContainerTemplate } from './subscribers/validation-container-custom-element';
import { ValidationErrorsCustomAttribute } from './subscribers/validation-errors-custom-attribute';
import { IDefaultTrigger, ValidateBindingBehavior, ValidationTrigger } from './validate-binding-behavior';
import { IValidationController, ValidationControllerFactory } from './validation-controller';
import { CustomElement } from '@aurelia/runtime';
export function getDefaultValidationHtmlConfiguration() {
    return {
        ...getDefaultValidationConfiguration(),
        ValidationControllerFactoryType: ValidationControllerFactory,
        DefaultTrigger: ValidationTrigger.focusout,
        UseSubscriberCustomAttribute: true,
        SubscriberCustomElementTemplate: defaultContainerTemplate
    };
}
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationHtmlConfiguration();
            optionsProvider(options);
            const key = Protocol.annotation.keyFor('di:factory');
            Protocol.annotation.set(IValidationController, 'di:factory', new options.ValidationControllerFactoryType());
            Protocol.annotation.appendTo(IValidationController, key);
            container.register(ValidationConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const optKey of Object.keys(opt)) {
                    if (optKey in options) {
                        opt[optKey] = options[optKey]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), Registration.instance(IDefaultTrigger, options.DefaultTrigger), ValidateBindingBehavior);
            if (options.UseSubscriberCustomAttribute) {
                container.register(ValidationErrorsCustomAttribute);
            }
            const template = options.SubscriberCustomElementTemplate;
            if (template) { // we need the boolean coercion here to ignore null, undefined, and ''
                container.register(CustomElement.define({ ...defaultContainerDefinition, template }, ValidationContainerCustomElement));
            }
            return container;
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
export const ValidationHtmlConfiguration = createConfiguration(PLATFORM.noop);
//# sourceMappingURL=configuration.js.map