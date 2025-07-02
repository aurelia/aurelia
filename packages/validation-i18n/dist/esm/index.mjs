import { I18N as i, Signals as t } from "@aurelia/i18n";

import { DI as o, resolve as e, IEventAggregator as r, Registration as a, noop as n } from "@aurelia/kernel";

import { ValidationMessageProvider as s, ValidationRuleAliasMessage as l } from "@aurelia/validation";

import { ValidationController as c, ValidationControllerFactory as d, getDefaultValidationHtmlConfiguration as u, ValidationHtmlConfiguration as f } from "@aurelia/validation-html";

import { queueAsyncTask as h } from "@aurelia/runtime";

const v = "i18n:locale:changed:validation";

const m = /*@__PURE__*/ o.createInterface("I18nKeyConfiguration");

class LocalizedValidationController extends c {
    constructor(i = e(r)) {
        super();
        this.localeChangeSubscription = i.subscribe(v, () => {
            h(async () => {
                await this.revalidateErrors();
            });
        });
    }
}

class LocalizedValidationControllerFactory extends d {
    construct(i, t) {
        return i.invoke(LocalizedValidationController, t);
    }
}

const p = Symbol.for("au:validation:explicit-message-key");

class LocalizedValidationMessageProvider extends s {
    constructor(o = e(m), a = e(r)) {
        super(undefined, []);
        this.i18n = e(i);
        const n = o.DefaultNamespace;
        const s = o.DefaultKeyPrefix;
        if (n !== void 0 || s !== void 0) {
            this.keyPrefix = n !== void 0 ? `${n}:` : "";
            this.keyPrefix = s !== void 0 ? `${this.keyPrefix}${s}.` : this.keyPrefix;
        }
        a.subscribe(t.I18N_EA_CHANNEL, () => {
            this.registeredMessages = new WeakMap;
            a.publish(v);
        });
    }
    getMessage(i) {
        const t = i.messageKey;
        const o = this.registeredMessages.get(i);
        if (o != null) {
            const i = o.get(p) ?? o.get(t);
            if (i !== void 0) {
                return i;
            }
        }
        let e = t;
        const r = e != null ? this.getKey(e) : [];
        const a = this.i18n;
        if (a.i18next.exists(r)) return this.setMessage(i, a.tr(r));
        const n = l.getDefaultMessages(i);
        const s = n.length;
        if (s === 1 && t === void 0) {
            e = n[0].defaultMessage;
        } else {
            e = n.find(i => i.name === t)?.defaultMessage;
        }
        e ??= t;
        return this.setMessage(i, a.tr(this.getKey(e)));
    }
    getDisplayName(i, t) {
        if (t !== null && t !== undefined) {
            return t instanceof Function ? t() : t;
        }
        if (i === void 0) {
            return;
        }
        return this.i18n.tr(this.getKey(i));
    }
    getKey(i) {
        const t = this.keyPrefix;
        return t !== void 0 ? `${t}${i}` : i;
    }
}

function createConfiguration(i) {
    return {
        optionsProvider: i,
        register(t) {
            const o = {
                ...u(),
                MessageProviderType: LocalizedValidationMessageProvider,
                ValidationControllerFactoryType: LocalizedValidationControllerFactory,
                DefaultNamespace: void 0,
                DefaultKeyPrefix: void 0
            };
            i(o);
            const e = {
                DefaultNamespace: o.DefaultNamespace,
                DefaultKeyPrefix: o.DefaultKeyPrefix
            };
            return t.register(f.customize(i => {
                for (const t of Object.keys(i)) {
                    if (t in o) {
                        i[t] = o[t];
                    }
                }
            }), a.callback(m, () => e));
        },
        customize(t) {
            return createConfiguration(t ?? i);
        }
    };
}

const g = /*@__PURE__*/ createConfiguration(n);

export { m as I18nKeyConfiguration, LocalizedValidationController, LocalizedValidationControllerFactory, LocalizedValidationMessageProvider, g as ValidationI18nConfiguration };
//# sourceMappingURL=index.mjs.map
