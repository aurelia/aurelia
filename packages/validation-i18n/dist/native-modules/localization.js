var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { I18N } from '../../../i18n/dist/native-modules/index.js';
import { DI, IEventAggregator, ILogger, IServiceLocator } from '../../../kernel/dist/native-modules/index.js';
import { IExpressionParser } from '../../../runtime/dist/native-modules/index.js';
import { IPlatform } from '../../../runtime-html/dist/native-modules/index.js';
import { IValidator, ValidationMessageProvider } from '../../../validation/dist/native-modules/index.js';
import { ValidationController, ValidationControllerFactory } from '../../../validation-html/dist/native-modules/index.js';
const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';
export const I18nKeyConfiguration = DI.createInterface('I18nKeyConfiguration');
let LocalizedValidationController = class LocalizedValidationController extends ValidationController {
    constructor(locator, ea, validator, parser, platform) {
        super(validator, parser, platform, locator);
        this.localeChangeSubscription = ea.subscribe(I18N_VALIDATION_EA_CHANNEL, () => { platform.domReadQueue.queueTask(async () => { await this.revalidateErrors(); }); });
    }
};
LocalizedValidationController = __decorate([
    __param(0, IServiceLocator),
    __param(1, IEventAggregator),
    __param(2, IValidator),
    __param(3, IExpressionParser),
    __param(4, IPlatform)
], LocalizedValidationController);
export { LocalizedValidationController };
export class LocalizedValidationControllerFactory extends ValidationControllerFactory {
    construct(container, _dynamicDependencies) {
        return _dynamicDependencies !== void 0
            ? Reflect.construct(LocalizedValidationController, _dynamicDependencies)
            : new LocalizedValidationController(container, container.get(IEventAggregator), container.get(IValidator), container.get(IExpressionParser), container.get(IPlatform));
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
    __param(4, ILogger)
], LocalizedValidationMessageProvider);
export { LocalizedValidationMessageProvider };
//# sourceMappingURL=localization.js.map