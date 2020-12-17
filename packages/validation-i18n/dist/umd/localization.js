var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/i18n", "@aurelia/kernel", "@aurelia/runtime", "@aurelia/runtime-html", "@aurelia/validation", "@aurelia/validation-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalizedValidationMessageProvider = exports.LocalizedValidationControllerFactory = exports.LocalizedValidationController = exports.I18nKeyConfiguration = void 0;
    const i18n_1 = require("@aurelia/i18n");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const validation_1 = require("@aurelia/validation");
    const validation_html_1 = require("@aurelia/validation-html");
    const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';
    exports.I18nKeyConfiguration = kernel_1.DI.createInterface('I18nKeyConfiguration');
    let LocalizedValidationController = class LocalizedValidationController extends validation_html_1.ValidationController {
        constructor(locator, ea, validator, parser, platform) {
            super(validator, parser, platform, locator);
            this.localeChangeSubscription = ea.subscribe(I18N_VALIDATION_EA_CHANNEL, () => { platform.domReadQueue.queueTask(async () => { await this.revalidateErrors(); }); });
        }
    };
    LocalizedValidationController = __decorate([
        __param(0, kernel_1.IServiceLocator),
        __param(1, kernel_1.IEventAggregator),
        __param(2, validation_1.IValidator),
        __param(3, runtime_1.IExpressionParser),
        __param(4, runtime_html_1.IPlatform)
    ], LocalizedValidationController);
    exports.LocalizedValidationController = LocalizedValidationController;
    class LocalizedValidationControllerFactory extends validation_html_1.ValidationControllerFactory {
        construct(container, _dynamicDependencies) {
            return _dynamicDependencies !== void 0
                ? Reflect.construct(LocalizedValidationController, _dynamicDependencies)
                : new LocalizedValidationController(container, container.get(kernel_1.IEventAggregator), container.get(validation_1.IValidator), container.get(runtime_1.IExpressionParser), container.get(runtime_html_1.IPlatform));
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
    LocalizedValidationMessageProvider = __decorate([
        __param(0, exports.I18nKeyConfiguration),
        __param(1, i18n_1.I18N),
        __param(2, kernel_1.IEventAggregator),
        __param(3, runtime_1.IExpressionParser),
        __param(4, kernel_1.ILogger)
    ], LocalizedValidationMessageProvider);
    exports.LocalizedValidationMessageProvider = LocalizedValidationMessageProvider;
});
//# sourceMappingURL=localization.js.map