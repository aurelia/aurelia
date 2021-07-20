"use strict";

Object.defineProperty(exports, "t", {
    value: true
});

var e = require("@aurelia/i18n");

var t = require("@aurelia/kernel");

var r = require("@aurelia/runtime");

var i = require("@aurelia/runtime-html");

var o = require("@aurelia/validation");

var a = require("@aurelia/validation-html");

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
***************************************************************************** */ function n(e, t, r, i) {
    var o = arguments.length, a = o < 3 ? t : null === i ? i = Object.getOwnPropertyDescriptor(t, r) : i, n;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) a = Reflect.decorate(e, t, r, i); else for (var s = e.length - 1; s >= 0; s--) if (n = e[s]) a = (o < 3 ? n(a) : o > 3 ? n(t, r, a) : n(t, r)) || a;
    return o > 3 && a && Object.defineProperty(t, r, a), a;
}

function s(e, t) {
    return function(r, i) {
        t(r, i, e);
    };
}

const l = "i18n:locale:changed:validation";

const c = t.DI.createInterface("I18nKeyConfiguration");

exports.LocalizedValidationController = class LocalizedValidationController extends a.ValidationController {
    constructor(e, t, r, i, o) {
        super(r, i, o, e);
        this.localeChangeSubscription = t.subscribe(l, (() => {
            o.domReadQueue.queueTask((async () => {
                await this.revalidateErrors();
            }));
        }));
    }
};

exports.LocalizedValidationController = n([ s(0, t.IServiceLocator), s(1, t.IEventAggregator), s(2, o.IValidator), s(3, r.IExpressionParser), s(4, i.IPlatform) ], exports.LocalizedValidationController);

class LocalizedValidationControllerFactory extends a.ValidationControllerFactory {
    construct(e, a) {
        return void 0 !== a ? Reflect.construct(exports.LocalizedValidationController, a) : new exports.LocalizedValidationController(e, e.get(t.IEventAggregator), e.get(o.IValidator), e.get(r.IExpressionParser), e.get(i.IPlatform));
    }
}

exports.LocalizedValidationMessageProvider = class LocalizedValidationMessageProvider extends o.ValidationMessageProvider {
    constructor(e, t, r, i, o) {
        super(i, o, []);
        this.i18n = t;
        const a = e.DefaultNamespace;
        const n = e.DefaultKeyPrefix;
        if (void 0 !== a || void 0 !== n) {
            this.keyPrefix = void 0 !== a ? `${a}:` : "";
            this.keyPrefix = void 0 !== n ? `${this.keyPrefix}${n}.` : this.keyPrefix;
        }
        r.subscribe("i18n:locale:changed", (() => {
            this.registeredMessages = new WeakMap;
            r.publish(l);
        }));
    }
    getMessage(e) {
        const t = this.registeredMessages.get(e);
        if (void 0 !== t) return t;
        return this.setMessage(e, this.i18n.tr(this.getKey(e.messageKey)));
    }
    getDisplayName(e, t) {
        if (null !== t && void 0 !== t) return t instanceof Function ? t() : t;
        if (void 0 === e) return;
        return this.i18n.tr(this.getKey(e));
    }
    getKey(e) {
        const t = this.keyPrefix;
        return void 0 !== t ? `${t}${e}` : e;
    }
};

exports.LocalizedValidationMessageProvider = n([ s(0, c), s(1, e.I18N), s(2, t.IEventAggregator), s(3, r.IExpressionParser), s(4, t.ILogger) ], exports.LocalizedValidationMessageProvider);

function u(e) {
    return {
        optionsProvider: e,
        register(r) {
            const i = {
                ...a.getDefaultValidationHtmlConfiguration(),
                MessageProviderType: exports.LocalizedValidationMessageProvider,
                ValidationControllerFactoryType: LocalizedValidationControllerFactory,
                DefaultNamespace: void 0,
                DefaultKeyPrefix: void 0
            };
            e(i);
            const o = {
                DefaultNamespace: i.DefaultNamespace,
                DefaultKeyPrefix: i.DefaultKeyPrefix
            };
            return r.register(a.ValidationHtmlConfiguration.customize((e => {
                for (const t of Object.keys(e)) if (t in i) e[t] = i[t];
            })), t.Registration.callback(c, (() => o)));
        },
        customize(t) {
            return u(null !== t && void 0 !== t ? t : e);
        }
    };
}

const d = u(t.noop);

exports.I18nKeyConfiguration = c;

exports.LocalizedValidationControllerFactory = LocalizedValidationControllerFactory;

exports.ValidationI18nConfiguration = d;
//# sourceMappingURL=index.js.map
