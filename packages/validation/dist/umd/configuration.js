(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./rule-interfaces", "./rule-provider", "./rules", "./serialization", "./subscribers/validation-container-custom-element", "./subscribers/validation-errors-custom-attribute", "./validate-binding-behavior", "./validation-controller", "./validator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const rule_interfaces_1 = require("./rule-interfaces");
    const rule_provider_1 = require("./rule-provider");
    const rules_1 = require("./rules");
    const serialization_1 = require("./serialization");
    const validation_container_custom_element_1 = require("./subscribers/validation-container-custom-element");
    const validation_errors_custom_attribute_1 = require("./subscribers/validation-errors-custom-attribute");
    const validate_binding_behavior_1 = require("./validate-binding-behavior");
    const validation_controller_1 = require("./validation-controller");
    const validator_1 = require("./validator");
    function getDefaultValidationConfiguration() {
        return {
            ValidatorType: validator_1.StandardValidator,
            MessageProviderType: rule_provider_1.ValidationMessageProvider,
            ValidationControllerFactoryType: validation_controller_1.ValidationControllerFactory,
            CustomMessages: [],
            DefaultTrigger: validate_binding_behavior_1.ValidationTrigger.blur,
            HydratorType: serialization_1.ModelValidationHydrator,
            UseSubscriberCustomAttribute: true,
            UseSubscriberCustomElement: true
        };
    }
    exports.getDefaultValidationConfiguration = getDefaultValidationConfiguration;
    function createConfiguration(optionsProvider) {
        return {
            optionsProvider,
            register(container) {
                const options = getDefaultValidationConfiguration();
                optionsProvider(options);
                const key = kernel_1.Protocol.annotation.keyFor('di:factory');
                kernel_1.Protocol.annotation.set(validation_controller_1.IValidationController, 'di:factory', new options.ValidationControllerFactoryType());
                kernel_1.Protocol.annotation.appendTo(validation_controller_1.IValidationController, key);
                container.register(kernel_1.Registration.instance(rule_provider_1.ICustomMessages, options.CustomMessages), kernel_1.Registration.instance(validate_binding_behavior_1.IDefaultTrigger, options.DefaultTrigger), kernel_1.Registration.singleton(validator_1.IValidator, options.ValidatorType), kernel_1.Registration.singleton(rules_1.IValidationMessageProvider, options.MessageProviderType), kernel_1.Registration.singleton(rule_interfaces_1.IValidationHydrator, options.HydratorType), kernel_1.Registration.transient(rule_provider_1.IValidationRules, rule_provider_1.ValidationRules), validate_binding_behavior_1.ValidateBindingBehavior, serialization_1.ValidationDeserializer);
                if (options.UseSubscriberCustomAttribute) {
                    container.register(validation_errors_custom_attribute_1.ValidationErrorsCustomAttribute);
                }
                if (options.UseSubscriberCustomElement) {
                    container.register(validation_container_custom_element_1.ValidationContainerCustomElement);
                }
                return container;
            },
            customize(cb) {
                return createConfiguration((cb !== null && cb !== void 0 ? cb : optionsProvider));
            },
        };
    }
    exports.ValidationConfiguration = createConfiguration(kernel_1.PLATFORM.noop);
});
//# sourceMappingURL=configuration.js.map