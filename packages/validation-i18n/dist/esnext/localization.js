import { __decorate, __metadata, __param } from "tslib";
import { I18N } from "@aurelia/i18n";
import { IValidator, ValidationControllerFactory, ValidationController, ValidationMessageProvider } from "@aurelia/validation";
import { IExpressionParser, IScheduler } from '@aurelia/runtime';
import { EventAggregator, IEventAggregator, ILogger, DI } from '@aurelia/kernel';
const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';
export const I18nKeyConfiguration = DI.createInterface('I18nKeyConfiguration').noDefault();
let LocalizedValidationController = class LocalizedValidationController extends ValidationController {
    constructor(ea, validator, parser, scheduler) {
        super(validator, parser, scheduler);
        this.localeChangeSubscription = ea.subscribe(I18N_VALIDATION_EA_CHANNEL, () => { scheduler.getPostRenderTaskQueue().queueTask(async () => { await this.revalidateErrors(); }); });
    }
};
LocalizedValidationController = __decorate([
    __param(0, IEventAggregator),
    __param(1, IValidator),
    __param(2, IExpressionParser),
    __param(3, IScheduler),
    __metadata("design:paramtypes", [EventAggregator, Object, Object, Object])
], LocalizedValidationController);
export { LocalizedValidationController };
export class LocalizedValidationControllerFactory extends ValidationControllerFactory {
    construct(container, _dynamicDependencies) {
        return _dynamicDependencies !== void 0
            ? Reflect.construct(LocalizedValidationController, _dynamicDependencies)
            : new LocalizedValidationController(container.get(IEventAggregator), container.get(IValidator), container.get(IExpressionParser), container.get(IScheduler));
    }
}
let LocalizedValidationMessageProvider = class LocalizedValidationMessageProvider extends ValidationMessageProvider {
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
    __param(0, I18nKeyConfiguration),
    __param(1, I18N),
    __param(2, IEventAggregator),
    __param(3, IExpressionParser),
    __param(4, ILogger),
    __metadata("design:paramtypes", [Object, Object, EventAggregator, Object, Object])
], LocalizedValidationMessageProvider);
export { LocalizedValidationMessageProvider };
//# sourceMappingURL=localization.js.map