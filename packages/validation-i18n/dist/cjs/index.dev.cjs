'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var i18n = require('@aurelia/i18n');
var kernel = require('@aurelia/kernel');
var runtimeHtml = require('@aurelia/runtime-html');
var validation = require('@aurelia/validation');
var validationHtml = require('@aurelia/validation-html');

const I18N_VALIDATION_EA_CHANNEL = 'i18n:locale:changed:validation';
const I18nKeyConfiguration = /*@__PURE__*/ kernel.DI.createInterface('I18nKeyConfiguration');
class LocalizedValidationController extends validationHtml.ValidationController {
    constructor(ea = kernel.resolve(kernel.IEventAggregator), platform = kernel.resolve(runtimeHtml.IPlatform)) {
        super();
        this.localeChangeSubscription = ea.subscribe(I18N_VALIDATION_EA_CHANNEL, () => { platform.domQueue.queueTask(async () => { await this.revalidateErrors(); }); });
    }
}
class LocalizedValidationControllerFactory extends validationHtml.ValidationControllerFactory {
    construct(container, _dynamicDependencies) {
        return container.invoke(LocalizedValidationController, _dynamicDependencies);
    }
}
const explicitMessageKey = Symbol.for('au:validation:explicit-message-key');
class LocalizedValidationMessageProvider extends validation.ValidationMessageProvider {
    constructor(keyConfiguration = kernel.resolve(I18nKeyConfiguration), ea = kernel.resolve(kernel.IEventAggregator)) {
        super(undefined, []);
        this.i18n = kernel.resolve(i18n.I18N);
        const namespace = keyConfiguration.DefaultNamespace;
        const prefix = keyConfiguration.DefaultKeyPrefix;
        if (namespace !== void 0 || prefix !== void 0) {
            this.keyPrefix = namespace !== void 0 ? `${namespace}:` : '';
            this.keyPrefix = prefix !== void 0 ? `${this.keyPrefix}${prefix}.` : this.keyPrefix;
        }
        // as this is registered singleton, disposing the subscription does not make much sense.
        ea.subscribe(i18n.Signals.I18N_EA_CHANNEL, () => {
            this.registeredMessages = new WeakMap();
            ea.publish(I18N_VALIDATION_EA_CHANNEL);
        });
    }
    getMessage(rule) {
        const messageKey = rule.messageKey;
        const lookup = this.registeredMessages.get(rule);
        if (lookup != null) {
            const parsedMessage = lookup.get(explicitMessageKey) ?? lookup.get(messageKey);
            if (parsedMessage !== void 0) {
                return parsedMessage;
            }
        }
        let key = messageKey;
        const i18nKey = key != null ? this.getKey(key) : [];
        const i18n = this.i18n;
        if (i18n.i18next.exists(i18nKey))
            return this.setMessage(rule, i18n.tr(i18nKey));
        const validationMessages = validation.ValidationRuleAliasMessage.getDefaultMessages(rule);
        const messageCount = validationMessages.length;
        if (messageCount === 1 && messageKey === void 0) {
            key = validationMessages[0].defaultMessage;
        }
        else {
            key = validationMessages.find(m => m.name === messageKey)?.defaultMessage;
        }
        key ??= messageKey;
        return this.setMessage(rule, i18n.tr(this.getKey(key)));
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
}

function createConfiguration(optionsProvider) {
    return {
        optionsProvider,
        register(container) {
            const options = {
                ...validationHtml.getDefaultValidationHtmlConfiguration(),
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
            return container.register(validationHtml.ValidationHtmlConfiguration.customize((opt) => {
                // copy the customization iff the key exists in validation configuration
                for (const key of Object.keys(opt)) {
                    if (key in options) {
                        opt[key] = options[key]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
                    }
                }
            }), kernel.Registration.callback(I18nKeyConfiguration, () => keyConfiguration));
        },
        customize(cb) {
            return createConfiguration(cb ?? optionsProvider);
        },
    };
}
const ValidationI18nConfiguration = /*@__PURE__*/ createConfiguration(kernel.noop);

exports.I18nKeyConfiguration = I18nKeyConfiguration;
exports.LocalizedValidationController = LocalizedValidationController;
exports.LocalizedValidationControllerFactory = LocalizedValidationControllerFactory;
exports.LocalizedValidationMessageProvider = LocalizedValidationMessageProvider;
exports.ValidationI18nConfiguration = ValidationI18nConfiguration;
//# sourceMappingURL=index.dev.cjs.map
