"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationHtmlConfiguration = exports.getDefaultValidationHtmlConfiguration = void 0;
const kernel_1 = require("@aurelia/kernel");
const validation_1 = require("@aurelia/validation");
const validation_container_custom_element_js_1 = require("./subscribers/validation-container-custom-element.js");
const validation_errors_custom_attribute_js_1 = require("./subscribers/validation-errors-custom-attribute.js");
const validate_binding_behavior_js_1 = require("./validate-binding-behavior.js");
const validation_controller_js_1 = require("./validation-controller.js");
const runtime_html_1 = require("@aurelia/runtime-html");
function getDefaultValidationHtmlConfiguration() {
    return {
        ...validation_1.getDefaultValidationConfiguration(),
        ValidationControllerFactoryType: validation_controller_js_1.ValidationControllerFactory,
        DefaultTrigger: validate_binding_behavior_js_1.ValidationTrigger.focusout,
        UseSubscriberCustomAttribute: true,
        SubscriberCustomElementTemplate: validation_container_custom_element_js_1.defaultContainerTemplate
    };
}
exports.getDefaultValidationHtmlConfiguration = getDefaultValidationHtmlConfiguration;
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationHtmlConfiguration();
            optionsProvider(options);
            container.registerFactory(validation_controller_js_1.IValidationController, new options.ValidationControllerFactoryType());
            container.register(validation_1.ValidationConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const optKey of Object.keys(opt)) {
                    if (optKey in options) {
                        opt[optKey] = options[optKey]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), kernel_1.Registration.instance(validate_binding_behavior_js_1.IDefaultTrigger, options.DefaultTrigger), validate_binding_behavior_js_1.ValidateBindingBehavior);
            if (options.UseSubscriberCustomAttribute) {
                container.register(validation_errors_custom_attribute_js_1.ValidationErrorsCustomAttribute);
            }
            const template = options.SubscriberCustomElementTemplate;
            if (template) { // we need the boolean coercion here to ignore null, undefined, and ''
                container.register(runtime_html_1.CustomElement.define({ ...validation_container_custom_element_js_1.defaultContainerDefinition, template }, validation_container_custom_element_js_1.ValidationContainerCustomElement));
            }
            return container;
        },
        customize(cb) {
            return createConfiguration(cb ?? optionsProvider);
        },
    };
}
exports.ValidationHtmlConfiguration = createConfiguration(kernel_1.noop);
//# sourceMappingURL=configuration.js.map