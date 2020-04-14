(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/i18n", "@aurelia/kernel", "@aurelia/runtime", "@aurelia/validation", "@aurelia/validation-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const i18n_1 = require("@aurelia/i18n");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const validation_1 = require("@aurelia/validation");
    const validation_html_1 = require("@aurelia/validation-html");
    const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';
    exports.I18nKeyConfiguration = kernel_1.DI.createInterface('I18nKeyConfiguration').noDefault();
    let LocalizedValidationController = class LocalizedValidationController extends validation_html_1.ValidationController {
        constructor(ea, validator, parser, scheduler) {
            super(validator, parser, scheduler);
            this.localeChangeSubscription = ea.subscribe(I18N_VALIDATION_EA_CHANNEL, () => { scheduler.getPostRenderTaskQueue().queueTask(async () => { await this.revalidateErrors(); }); });
        }
    };
    LocalizedValidationController = tslib_1.__decorate([
        tslib_1.__param(0, kernel_1.IEventAggregator),
        tslib_1.__param(1, validation_1.IValidator),
        tslib_1.__param(2, runtime_1.IExpressionParser),
        tslib_1.__param(3, runtime_1.IScheduler),
        tslib_1.__metadata("design:paramtypes", [kernel_1.EventAggregator, Object, Object, Object])
    ], LocalizedValidationController);
    exports.LocalizedValidationController = LocalizedValidationController;
    class LocalizedValidationControllerFactory extends validation_html_1.ValidationControllerFactory {
        construct(container, _dynamicDependencies) {
            return _dynamicDependencies !== void 0
                ? Reflect.construct(LocalizedValidationController, _dynamicDependencies)
                : new LocalizedValidationController(container.get(kernel_1.IEventAggregator), container.get(validation_1.IValidator), container.get(runtime_1.IExpressionParser), container.get(runtime_1.IScheduler));
        }
    }
    exports.LocalizedValidationControllerFactory = LocalizedValidationControllerFactory;
    let LocalizedValidationMessageProvider = class LocalizedValidationMessageProvider extends validation_1.ValidationMessageProvider {
        constructor(keyConfiguration, i18n, ea, parser, logger) {
            super(parser, logger, []);
            this.i18n = i18n;
            const namespace = keyConfiguration.DefaultNamespace;
            const prefix = keyConfiguration.DefaultKeyPrefix;
            if (namespace !== void 0 || prefix !== void 0) {
                this.keyPrefix = namespace !== void 0 ? `${namespace}:` : '';
                this.keyPrefix = prefix !== void 0 ? `${this.keyPrefix}${prefix}.` : this.keyPrefix;
            }
            // as this is registered singleton, disposing the subscription does not make much sense.
            ea.subscribe("i18n:locale:changed" /* I18N_EA_CHANNEL */, () => {
                this.registeredMessages = new WeakMap();
                ea.publish(I18N_VALIDATION_EA_CHANNEL);
            });
        }
        getMessage(rule) {
            const parsedMessage = this.registeredMessages.get(rule);
            if (parsedMessage !== void 0) {
                return parsedMessage;
            }
            return this.setMessage(rule, this.i18n.tr(this.getKey(rule.messageKey)));
        }
        getDisplayName(propertyName, displayName) {
            if (displayName !== null && displayName !== undefined) {
                return (displayName instanceof Function) ? displayName() : displayName;
            }
            if (propertyName === void 0) {
                return;
            }
            return this.i18n.tr(this.getKey(propertyName));
        }
        getKey(key) {
            const keyPrefix = this.keyPrefix;
            return keyPrefix !== void 0 ? `${keyPrefix}${key}` : key;
        }
    };
    LocalizedValidationMessageProvider = tslib_1.__decorate([
        tslib_1.__param(0, exports.I18nKeyConfiguration),
        tslib_1.__param(1, i18n_1.I18N),
        tslib_1.__param(2, kernel_1.IEventAggregator),
        tslib_1.__param(3, runtime_1.IExpressionParser),
        tslib_1.__param(4, kernel_1.ILogger),
        tslib_1.__metadata("design:paramtypes", [Object, Object, kernel_1.EventAggregator, Object, Object])
    ], LocalizedValidationMessageProvider);
    exports.LocalizedValidationMessageProvider = LocalizedValidationMessageProvider;
});
//# sourceMappingURL=localization.js.map