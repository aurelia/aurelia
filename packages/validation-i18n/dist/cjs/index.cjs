"use strict";

var e = require("@aurelia/i18n");

var i = require("@aurelia/kernel");

var t = require("@aurelia/runtime-html");

var o = require("@aurelia/validation");

var r = require("@aurelia/validation-html");

const a = "i18n:locale:changed:validation";

const n = /*@__PURE__*/ i.DI.createInterface("I18nKeyConfiguration");

class LocalizedValidationController extends r.ValidationController {
    constructor(e = i.resolve(i.IEventAggregator), o = i.resolve(t.IPlatform)) {
        super();
        this.localeChangeSubscription = e.subscribe(a, (() => {
            o.domQueue.queueTask((async () => {
                await this.revalidateErrors();
            }));
        }));
    }
}

class LocalizedValidationControllerFactory extends r.ValidationControllerFactory {
    construct(e, i) {
        return e.invoke(LocalizedValidationController, i);
    }
}

const s = Symbol.for("au:validation:explicit-message-key");

class LocalizedValidationMessageProvider extends o.ValidationMessageProvider {
    constructor(t = i.resolve(n), o = i.resolve(i.IEventAggregator)) {
        super(undefined, []);
        this.i18n = i.resolve(e.I18N);
        const r = t.DefaultNamespace;
        const s = t.DefaultKeyPrefix;
        if (r !== void 0 || s !== void 0) {
            this.keyPrefix = r !== void 0 ? `${r}:` : "";
            this.keyPrefix = s !== void 0 ? `${this.keyPrefix}${s}.` : this.keyPrefix;
        }
        o.subscribe(e.Signals.I18N_EA_CHANNEL, (() => {
            this.registeredMessages = new WeakMap;
            o.publish(a);
        }));
    }
    getMessage(e) {
        const i = e.messageKey;
        const t = this.registeredMessages.get(e);
        if (t != null) {
            const e = t.get(s) ?? t.get(i);
            if (e !== void 0) {
                return e;
            }
        }
        let r = i;
        const a = r != null ? this.getKey(r) : [];
        const n = this.i18n;
        if (n.i18next.exists(a)) return this.setMessage(e, n.tr(a));
        const l = o.ValidationRuleAliasMessage.getDefaultMessages(e);
        const c = l.length;
        if (c === 1 && i === void 0) {
            r = l[0].defaultMessage;
        } else {
            r = l.find((e => e.name === i))?.defaultMessage;
        }
        r ??= i;
        return this.setMessage(e, n.tr(this.getKey(r)));
    }
    getDisplayName(e, i) {
        if (i !== null && i !== undefined) {
            return i instanceof Function ? i() : i;
        }
        if (e === void 0) {
            return;
        }
        return this.i18n.tr(this.getKey(e));
    }
    getKey(e) {
        const i = this.keyPrefix;
        return i !== void 0 ? `${i}${e}` : e;
    }
}

function createConfiguration(e) {
    return {
        optionsProvider: e,
        register(t) {
            const o = {
                ...r.getDefaultValidationHtmlConfiguration(),
                MessageProviderType: LocalizedValidationMessageProvider,
                ValidationControllerFactoryType: LocalizedValidationControllerFactory,
                DefaultNamespace: void 0,
                DefaultKeyPrefix: void 0
            };
            e(o);
            const a = {
                DefaultNamespace: o.DefaultNamespace,
                DefaultKeyPrefix: o.DefaultKeyPrefix
            };
            return t.register(r.ValidationHtmlConfiguration.customize((e => {
                for (const i of Object.keys(e)) {
                    if (i in o) {
                        e[i] = o[i];
                    }
                }
            })), i.Registration.callback(n, (() => a)));
        },
        customize(i) {
            return createConfiguration(i ?? e);
        }
    };
}

const l = /*@__PURE__*/ createConfiguration(i.noop);

exports.I18nKeyConfiguration = n;

exports.LocalizedValidationController = LocalizedValidationController;

exports.LocalizedValidationControllerFactory = LocalizedValidationControllerFactory;

exports.LocalizedValidationMessageProvider = LocalizedValidationMessageProvider;

exports.ValidationI18nConfiguration = l;
//# sourceMappingURL=index.cjs.map
