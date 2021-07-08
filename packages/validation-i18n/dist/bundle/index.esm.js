import { I18N } from '@aurelia/i18n';
import { DI, IEventAggregator, ILogger, IServiceLocator, Registration, noop } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/runtime';
import { IPlatform } from '@aurelia/runtime-html';
import { IValidator, ValidationMessageProvider } from '@aurelia/validation';
import { ValidationController, ValidationControllerFactory, getDefaultValidationHtmlConfiguration, ValidationHtmlConfiguration } from '@aurelia/validation-html';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';
const I18nKeyConfiguration = DI.createInterface('I18nKeyConfiguration');
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
class LocalizedValidationControllerFactory extends ValidationControllerFactory {
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

function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = {
                ...getDefaultValidationHtmlConfiguration(),
                MessageProviderType: LocalizedValidationMessageProvider,
                ValidationControllerFactoryType: LocalizedValidationControllerFactory,
                DefaultNamespace: void 0,
                DefaultKeyPrefix: void 0,
            };
            optionsProvider(options);
            const keyConfiguration = {
                DefaultNamespace: options.DefaultNamespace,
                DefaultKeyPrefix: options.DefaultKeyPrefix,
            };
            return container.register(ValidationHtmlConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const key of Object.keys(opt)) {
                    if (key in options) {
                        opt[key] = options[key]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), Registration.callback(I18nKeyConfiguration, () => keyConfiguration));
        },
        customize(cb) {
            return createConfiguration(cb !== null && cb !== void 0 ? cb : optionsProvider);
        },
    };
}
const ValidationI18nConfiguration = createConfiguration(noop);

export { I18nKeyConfiguration, LocalizedValidationController, LocalizedValidationControllerFactory, LocalizedValidationMessageProvider, ValidationI18nConfiguration };
//# sourceMappingURL=index.esm.js.map
