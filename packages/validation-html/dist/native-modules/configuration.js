import { noop, Registration } from '../../../kernel/dist/native-modules/index.js';
import { getDefaultValidationConfiguration, ValidationConfiguration } from '../../../validation/dist/native-modules/index.js';
import { ValidationContainerCustomElement, defaultContainerDefinition, defaultContainerTemplate } from './subscribers/validation-container-custom-element.js';
import { ValidationErrorsCustomAttribute } from './subscribers/validation-errors-custom-attribute.js';
import { IDefaultTrigger, ValidateBindingBehavior, ValidationTrigger } from './validate-binding-behavior.js';
import { IValidationController, ValidationControllerFactory } from './validation-controller.js';
import { CustomElement } from '../../../runtime-html/dist/native-modules/index.js';
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
            container.registerFactory(IValidationController, new options.ValidationControllerFactoryType());
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
export const ValidationHtmlConfiguration = createConfiguration(noop);
//# sourceMappingURL=configuration.js.map