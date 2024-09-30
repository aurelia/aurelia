import { I18N as i, Signals as t } from "../../../i18n/dist/native-modules/index.mjs";

import { DI as o, resolve as e, IEventAggregator as r, Registration as a, noop as n } from "../../../kernel/dist/native-modules/index.mjs";

import { IPlatform as s } from "../../../runtime-html/dist/native-modules/index.mjs";

import { ValidationMessageProvider as l, ValidationRuleAliasMessage as c } from "../../../validation/dist/native-modules/index.mjs";

import { ValidationController as d, ValidationControllerFactory as u, getDefaultValidationHtmlConfiguration as f, ValidationHtmlConfiguration as h } from "../../../validation-html/dist/native-modules/index.mjs";

const m = "i18n:locale:changed:validation";

const v = /*@__PURE__*/ o.createInterface("I18nKeyConfiguration");

class LocalizedValidationController extends d {
    constructor(i = e(r), t = e(s)) {
        super();
        this.localeChangeSubscription = i.subscribe(m, (() => {
            t.domQueue.queueTask((async () => {
                await this.revalidateErrors();
            }));
        }));
    }
}

class LocalizedValidationControllerFactory extends u {
    construct(i, t) {
        return i.invoke(LocalizedValidationController, t);
    }
}

const p = Symbol.for("au:validation:explicit-message-key");

class LocalizedValidationMessageProvider extends l {
    constructor(o = e(v), a = e(r)) {
        super(undefined, []);
        this.i18n = e(i);
        const n = o.DefaultNamespace;
        const s = o.DefaultKeyPrefix;
        if (n !== void 0 || s !== void 0) {
            this.keyPrefix = n !== void 0 ? `${n}:` : "";
            this.keyPrefix = s !== void 0 ? `${this.keyPrefix}${s}.` : this.keyPrefix;
        }
        a.subscribe(t.I18N_EA_CHANNEL, (() => {
            this.registeredMessages = new WeakMap;
            a.publish(m);
        }));
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
        const n = c.getDefaultMessages(i);
        const s = n.length;
        if (s === 1 && t === void 0) {
            e = n[0].defaultMessage;
        } else {
            e = n.find((i => i.name === t))?.defaultMessage;
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
                ...f(),
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
            return t.register(h.customize((i => {
                for (const t of Object.keys(i)) {
                    if (t in o) {
                        i[t] = o[t];
                    }
                }
            })), a.callback(v, (() => e)));
        },
        customize(t) {
            return createConfiguration(t ?? i);
        }
    };
}

const g = /*@__PURE__*/ createConfiguration(n);

export { v as I18nKeyConfiguration, LocalizedValidationController, LocalizedValidationControllerFactory, LocalizedValidationMessageProvider, g as ValidationI18nConfiguration };

