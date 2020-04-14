(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/validation", "./subscribers/validation-container-custom-element", "./subscribers/validation-errors-custom-attribute", "./validate-binding-behavior", "./validation-controller", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const validation_1 = require("@aurelia/validation");
    const validation_container_custom_element_1 = require("./subscribers/validation-container-custom-element");
    const validation_errors_custom_attribute_1 = require("./subscribers/validation-errors-custom-attribute");
    const validate_binding_behavior_1 = require("./validate-binding-behavior");
    const validation_controller_1 = require("./validation-controller");
    const runtime_1 = require("@aurelia/runtime");
    function getDefaultValidationHtmlConfiguration() {
        return {
            ...validation_1.getDefaultValidationConfiguration(),
            ValidationControllerFactoryType: validation_controller_1.ValidationControllerFactory,
            DefaultTrigger: validate_binding_behavior_1.ValidationTrigger.focusout,
            UseSubscriberCustomAttribute: true,
            SubscriberCustomElementTemplate: validation_container_custom_element_1.defaultContainerTemplate
        };
    }
    exports.getDefaultValidationHtmlConfiguration = getDefaultValidationHtmlConfiguration;
    function createConfiguration(optionsProvider) {
        return {
            optionsProvider,
            register(container) {
                const options = getDefaultValidationHtmlConfiguration();
                optionsProvider(options);
                const key = kernel_1.Protocol.annotation.keyFor('di:factory');
                kernel_1.Protocol.annotation.set(validation_controller_1.IValidationController, 'di:factory', new options.ValidationControllerFactoryType());
                kernel_1.Protocol.annotation.appendTo(validation_controller_1.IValidationController, key);
                container.register(validation_1.ValidationConfiguration.customize((opt) => {
                    // copy the customization iff the key exists in validation configuration
                    for (const optKey of Object.keys(opt)) {
                        if (optKey in options) {
                            opt[optKey] = options[optKey]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                        }
                    }
                }), kernel_1.Registration.instance(validate_binding_behavior_1.IDefaultTrigger, options.DefaultTrigger), validate_binding_behavior_1.ValidateBindingBehavior);
                if (options.UseSubscriberCustomAttribute) {
                    container.register(validation_errors_custom_attribute_1.ValidationErrorsCustomAttribute);
                }
                const template = options.SubscriberCustomElementTemplate;
                if (template) { // we need the boolean coercion here to ignore null, undefined, and ''
                    container.register(runtime_1.CustomElement.define({ ...validation_container_custom_element_1.defaultContainerDefinition, template }, validation_container_custom_element_1.ValidationContainerCustomElement));
                }
                return container;
            },
            customize(cb) {
                return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
            },
        };
    }
    exports.ValidationHtmlConfiguration = createConfiguration(kernel_1.PLATFORM.noop);
});
//# sourceMappingURL=configuration.js.map