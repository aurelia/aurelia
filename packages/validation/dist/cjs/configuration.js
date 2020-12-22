"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationConfiguration = exports.getDefaultValidationConfiguration = void 0;
const kernel_1 = require("@aurelia/kernel");
const rule_interfaces_js_1 = require("./rule-interfaces.js");
const rule_provider_js_1 = require("./rule-provider.js");
const rules_js_1 = require("./rules.js");
const serialization_js_1 = require("./serialization.js");
const validator_js_1 = require("./validator.js");
function getDefaultValidationConfiguration() {
    return {
        ValidatorType: validator_js_1.StandardValidator,
        MessageProviderType: rule_provider_js_1.ValidationMessageProvider,
        CustomMessages: [],
        HydratorType: serialization_js_1.ModelValidationExpressionHydrator,
    };
}
exports.getDefaultValidationConfiguration = getDefaultValidationConfiguration;
function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = getDefaultValidationConfiguration();
            optionsProvider(options);
            container.register(kernel_1.Registration.instance(rule_provider_js_1.ICustomMessages, options.CustomMessages), kernel_1.Registration.singleton(validator_js_1.IValidator, options.ValidatorType), kernel_1.Registration.singleton(rules_js_1.IValidationMessageProvider, options.MessageProviderType), kernel_1.Registration.singleton(rule_interfaces_js_1.IValidationExpressionHydrator, options.HydratorType), kernel_1.Registration.transient(rule_provider_js_1.IValidationRules, rule_provider_js_1.ValidationRules), serialization_js_1.ValidationDeserializer);
            return container;
        },
        customize(cb) {
            return createConfiguration(cb ?? optionsProvider);
        },
    };
}
exports.ValidationConfiguration = createConfiguration(kernel_1.noop);
//# sourceMappingURL=configuration.js.map