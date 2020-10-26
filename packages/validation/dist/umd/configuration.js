(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./rule-interfaces", "./rule-provider", "./rules", "./serialization", "./validator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValidationConfiguration = exports.getDefaultValidationConfiguration = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const rule_interfaces_1 = require("./rule-interfaces");
    const rule_provider_1 = require("./rule-provider");
    const rules_1 = require("./rules");
    const serialization_1 = require("./serialization");
    const validator_1 = require("./validator");
    function getDefaultValidationConfiguration() {
        return {
            ValidatorType: validator_1.StandardValidator,
            MessageProviderType: rule_provider_1.ValidationMessageProvider,
            CustomMessages: [],
            HydratorType: serialization_1.ModelValidationExpressionHydrator,
        };
    }
    exports.getDefaultValidationConfiguration = getDefaultValidationConfiguration;
    function createConfiguration(optionsProvider) {
        return {
            optionsProvider,
            register(container) {
                const options = getDefaultValidationConfiguration();
                optionsProvider(options);
                container.register(kernel_1.Registration.instance(rule_provider_1.ICustomMessages, options.CustomMessages), kernel_1.Registration.singleton(validator_1.IValidator, options.ValidatorType), kernel_1.Registration.singleton(rules_1.IValidationMessageProvider, options.MessageProviderType), kernel_1.Registration.singleton(rule_interfaces_1.IValidationExpressionHydrator, options.HydratorType), kernel_1.Registration.transient(rule_provider_1.IValidationRules, rule_provider_1.ValidationRules), serialization_1.ValidationDeserializer);
                return container;
            },
            customize(cb) {
                return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
            },
        };
    }
    exports.ValidationConfiguration = createConfiguration(kernel_1.noop);
});
//# sourceMappingURL=configuration.js.map