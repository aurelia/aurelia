"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/kernel");

var s = require("@aurelia/runtime-html");

var n = require("@aurelia/runtime");

var i = require("i18next");

function e(t) {
    return t && "object" === typeof t && "default" in t ? t["default"] : t;
}

var r = e(i);

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
***************************************************************************** */ function o(t, s, n, i) {
    var e = arguments.length, r = e < 3 ? s : null === i ? i = Object.getOwnPropertyDescriptor(s, n) : i, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(t, s, n, i); else for (var a = t.length - 1; a >= 0; a--) if (o = t[a]) r = (e < 3 ? o(r) : e > 3 ? o(s, n, r) : o(s, n)) || r;
    return e > 3 && r && Object.defineProperty(s, n, r), r;
}

function a(t, s) {
    return function(n, i) {
        s(n, i, t);
    };
}

exports.Signals = void 0;

(function(t) {
    t["I18N_EA_CHANNEL"] = "i18n:locale:changed";
    t["I18N_SIGNAL"] = "aurelia-translation-signal";
    t["RT_SIGNAL"] = "aurelia-relativetime-signal";
})(exports.Signals || (exports.Signals = {}));

var h;

(function(t) {
    t["translationValueConverterName"] = "t";
    t["dateFormatValueConverterName"] = "df";
    t["numberFormatValueConverterName"] = "nf";
    t["relativeTimeValueConverterName"] = "rt";
})(h || (h = {}));

function l(t, s) {
    const i = s.sourceExpression.expression;
    if (!(i instanceof n.ValueConverterExpression)) {
        const e = new n.ValueConverterExpression(i, t, s.sourceExpression.args);
        s.sourceExpression.expression = e;
    }
}

exports.DateFormatBindingBehavior = class DateFormatBindingBehavior {
    bind(t, s, n) {
        l("df", n);
    }
};

exports.DateFormatBindingBehavior = o([ n.bindingBehavior("df") ], exports.DateFormatBindingBehavior);

const c = t.DI.createInterface("I18nInitOptions");

const u = t.DI.createInterface("I18nextWrapper");

class I18nextWrapper {
    constructor() {
        this.i18next = r;
    }
}

var p;

(function(t) {
    t[t["Second"] = 1e3] = "Second";
    t[t["Minute"] = 6e4] = "Minute";
    t[t["Hour"] = 36e5] = "Hour";
    t[t["Day"] = 864e5] = "Day";
    t[t["Week"] = 6048e5] = "Week";
    t[t["Month"] = 2592e6] = "Month";
    t[t["Year"] = 31536e6] = "Year";
})(p || (p = {}));

class I18nKeyEvaluationResult {
    constructor(t) {
        this.value = void 0;
        const s = /\[([a-z\-, ]*)\]/gi;
        this.attributes = [];
        const n = s.exec(t);
        if (n) {
            t = t.replace(n[0], "");
            this.attributes = n[1].split(",");
        }
        this.key = t;
    }
}

const d = t.DI.createInterface("I18N");

exports.I18nService = class I18nService {
    constructor(t, s, n, i) {
        this.ea = n;
        this.i = new Set;
        this.i18next = t.i18next;
        this.initPromise = this.o(s);
        this.h = i;
    }
    evaluate(t, s) {
        const n = t.split(";");
        const i = [];
        for (const t of n) {
            const n = new I18nKeyEvaluationResult(t);
            const e = n.key;
            const r = this.tr(e, s);
            if (this.options.skipTranslationOnMissingKey && r === e) console.warn(`Couldn't find translation for key: ${e}`); else {
                n.value = r;
                i.push(n);
            }
        }
        return i;
    }
    tr(t, s) {
        return this.i18next.t(t, s);
    }
    getLocale() {
        return this.i18next.language;
    }
    async setLocale(t) {
        const s = this.getLocale();
        const n = {
            oldLocale: s,
            newLocale: t
        };
        await this.i18next.changeLanguage(t);
        this.ea.publish("i18n:locale:changed", n);
        this.i.forEach((t => t.handleLocaleChange(n)));
        this.h.dispatchSignal("aurelia-translation-signal");
    }
    createNumberFormat(t, s) {
        return Intl.NumberFormat(s || this.getLocale(), t);
    }
    nf(t, s, n) {
        return this.createNumberFormat(s, n).format(t);
    }
    createDateTimeFormat(t, s) {
        return Intl.DateTimeFormat(s || this.getLocale(), t);
    }
    df(t, s, n) {
        return this.createDateTimeFormat(s, n).format(t);
    }
    uf(t, s) {
        const n = this.nf(1e4 / 3, void 0, s);
        let i = n[1];
        const e = n[5];
        if ("." === i) i = "\\.";
        const r = t.replace(new RegExp(i, "g"), "").replace(/[^\d.,-]/g, "").replace(e, ".");
        return Number(r);
    }
    createRelativeTimeFormat(t, s) {
        return new Intl.RelativeTimeFormat(s || this.getLocale(), t);
    }
    rt(t, s, n) {
        let i = t.getTime() - this.now();
        const e = this.options.rtEpsilon * (i > 0 ? 1 : 0);
        const r = this.createRelativeTimeFormat(s, n);
        let o = i / 31536e6;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "year");
        o = i / 2592e6;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "month");
        o = i / 6048e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "week");
        o = i / 864e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "day");
        o = i / 36e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "hour");
        o = i / 6e4;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "minute");
        i = Math.abs(i) < 1e3 ? 1e3 : i;
        o = i / 1e3;
        return r.format(Math.round(o), "second");
    }
    subscribeLocaleChange(t) {
        this.i.add(t);
    }
    now() {
        return (new Date).getTime();
    }
    async o(t) {
        const s = {
            lng: "en",
            fallbackLng: [ "en" ],
            debug: false,
            plugins: [],
            rtEpsilon: .01,
            skipTranslationOnMissingKey: false
        };
        this.options = {
            ...s,
            ...t
        };
        for (const t of this.options.plugins) this.i18next.use(t);
        await this.i18next.init(this.options);
    }
};

exports.I18nService = o([ a(0, u), a(1, c), a(2, t.IEventAggregator), a(3, n.ISignaler) ], exports.I18nService);

exports.DateFormatValueConverter = class DateFormatValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, s, n) {
        if (!t && 0 !== t || "string" === typeof t && "" === t.trim()) return t;
        if ("string" === typeof t) {
            const s = Number(t);
            const n = new Date(Number.isInteger(s) ? s : t);
            if (isNaN(n.getTime())) return t;
            t = n;
        }
        return this.i18n.df(t, s, n);
    }
};

exports.DateFormatValueConverter = o([ n.valueConverter("df"), a(0, d) ], exports.DateFormatValueConverter);

exports.NumberFormatBindingBehavior = class NumberFormatBindingBehavior {
    bind(t, s, n) {
        l("nf", n);
    }
};

exports.NumberFormatBindingBehavior = o([ n.bindingBehavior("nf") ], exports.NumberFormatBindingBehavior);

exports.NumberFormatValueConverter = class NumberFormatValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, s, n) {
        if ("number" !== typeof t) return t;
        return this.i18n.nf(t, s, n);
    }
};

exports.NumberFormatValueConverter = o([ n.valueConverter("nf"), a(0, d) ], exports.NumberFormatValueConverter);

exports.RelativeTimeBindingBehavior = class RelativeTimeBindingBehavior {
    bind(t, s, n) {
        l("rt", n);
    }
};

exports.RelativeTimeBindingBehavior = o([ n.bindingBehavior("rt") ], exports.RelativeTimeBindingBehavior);

exports.RelativeTimeValueConverter = class RelativeTimeValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal", "aurelia-relativetime-signal" ];
    }
    toView(t, s, n) {
        if (!(t instanceof Date)) return t;
        return this.i18n.rt(t, s, n);
    }
};

exports.RelativeTimeValueConverter = o([ n.valueConverter("rt"), a(0, d) ], exports.RelativeTimeValueConverter);

exports.TranslationBindingBehavior = class TranslationBindingBehavior {
    bind(t, n, i) {
        const e = i.sourceExpression.expression;
        if (!(e instanceof s.ValueConverterExpression)) {
            const t = new s.ValueConverterExpression(e, "t", i.sourceExpression.args);
            i.sourceExpression.expression = t;
        }
    }
};

exports.TranslationBindingBehavior = o([ s.bindingBehavior("t") ], exports.TranslationBindingBehavior);

const f = [ "textContent", "innerHTML", "prepend", "append" ];

const x = new Map([ [ "text", "textContent" ], [ "html", "innerHTML" ] ]);

const g = {
    optional: true
};

const m = {
    reusable: false,
    preempt: true
};

class TranslationBinding {
    constructor(t, s, n, i) {
        this.locator = n;
        this.interceptor = this;
        this.isBound = false;
        this.l = f;
        this.task = null;
        this.parameter = null;
        this.target = t;
        this.i18n = this.locator.get(d);
        this.platform = i;
        this.u = new Set;
        this.oL = s;
        this.i18n.subscribeLocaleChange(this);
    }
    static create({parser: t, observerLocator: n, context: i, controller: e, target: r, instruction: o, platform: a, isParameterContext: h}) {
        const l = this.getBinding({
            observerLocator: n,
            context: i,
            controller: e,
            target: r,
            platform: a
        });
        const c = "string" === typeof o.from ? t.parse(o.from, 53) : o.from;
        if (h) l.useParameter(c); else {
            const n = c instanceof s.CustomExpression ? t.parse(c.value, 2048) : void 0;
            l.expr = n || c;
        }
    }
    static getBinding({observerLocator: t, context: s, controller: n, target: i, platform: e}) {
        let r = n.bindings && n.bindings.find((t => t instanceof TranslationBinding && t.target === i));
        if (!r) {
            r = new TranslationBinding(i, t, s, e);
            n.addBinding(r);
        }
        return r;
    }
    $bind(t, n) {
        var i;
        if (!this.expr) throw new Error("key expression is missing");
        this.scope = n;
        this.g = this.expr instanceof s.Interpolation;
        this.T = this.expr.evaluate(t, n, this.locator, this);
        this.B();
        null === (i = this.parameter) || void 0 === i ? void 0 : i.$bind(t, n);
        this.C(t);
        this.isBound = true;
    }
    $unbind(t) {
        var s;
        if (!this.isBound) return;
        if (this.expr.hasUnbind) this.expr.unbind(t, this.scope, this);
        null === (s = this.parameter) || void 0 === s ? void 0 : s.$unbind(t);
        this.u.clear();
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
        }
        this.scope = void 0;
        this.obs.clearAll();
    }
    handleChange(t, s, n) {
        this.obs.version++;
        this.T = this.g ? this.expr.evaluate(n, this.scope, this.locator, this) : t;
        this.obs.clear();
        this.B();
        this.C(n);
    }
    handleLocaleChange() {
        this.C(0);
    }
    useParameter(t) {
        if (null != this.parameter) throw new Error("This translation parameter has already been specified.");
        this.parameter = new ParameterBinding(this, t, (t => this.C(t)));
    }
    C(t) {
        var n;
        const i = this.i18n.evaluate(this.T, null === (n = this.parameter) || void 0 === n ? void 0 : n.value);
        const e = Object.create(null);
        const r = [];
        const o = this.task;
        this.u.clear();
        for (const n of i) {
            const i = n.value;
            const o = this.I(n.attributes);
            for (const n of o) if (this.M(n)) e[n] = i; else {
                const e = s.CustomElement.for(this.target, g);
                const o = e && e.viewModel ? this.oL.getAccessor(e.viewModel, n) : this.oL.getAccessor(this.target, n);
                const a = 0 === (2 & t) && (4 & o.type) > 0;
                if (a) r.push(new AccessorUpdateTask(o, i, t, this.target, n)); else o.setValue(i, t, this.target, n);
                this.u.add(o);
            }
        }
        let a = false;
        if (Object.keys(e).length > 0) {
            a = 0 === (2 & t);
            if (!a) this.P(e, t);
        }
        if (r.length > 0 || a) this.task = this.platform.domWriteQueue.queueTask((() => {
            this.task = null;
            for (const t of r) t.run();
            if (a) this.P(e, t);
        }), m);
        null === o || void 0 === o ? void 0 : o.cancel();
    }
    I(t) {
        if (0 === t.length) t = "IMG" === this.target.tagName ? [ "src" ] : [ "textContent" ];
        for (const [s, n] of x) {
            const i = t.findIndex((t => t === s));
            if (i > -1) t.splice(i, 1, n);
        }
        return t;
    }
    M(t) {
        return this.l.includes(t);
    }
    P(s, n) {
        const i = t.toArray(this.target.childNodes);
        const e = [];
        const r = "au-i18n";
        for (const t of i) if (!Reflect.get(t, r)) e.push(t);
        const o = this.A(s, r, e);
        this.target.innerHTML = "";
        for (const s of t.toArray(o.content.childNodes)) this.target.appendChild(s);
    }
    A(t, s, n) {
        var i;
        const e = this.platform.document.createElement("template");
        this.L(e, t.prepend, s);
        if (!this.L(e, null !== (i = t.innerHTML) && void 0 !== i ? i : t.textContent, s)) for (const t of n) e.content.append(t);
        this.L(e, t.append, s);
        return e;
    }
    L(s, n, i) {
        if (void 0 !== n && null !== n) {
            const e = this.platform.document.createElement("div");
            e.innerHTML = n;
            for (const n of t.toArray(e.childNodes)) {
                Reflect.set(n, i, true);
                s.content.append(n);
            }
            return true;
        }
        return false;
    }
    B() {
        var t;
        const s = null !== (t = this.T) && void 0 !== t ? t : this.T = "";
        const n = typeof s;
        if ("string" !== n) throw new Error(`Expected the i18n key to be a string, but got ${s} of type ${n}`);
    }
}

class AccessorUpdateTask {
    constructor(t, s, n, i, e) {
        this.accessor = t;
        this.v = s;
        this.f = n;
        this.el = i;
        this.attr = e;
    }
    run() {
        this.accessor.setValue(this.v, this.f, this.el, this.attr);
    }
}

class ParameterBinding {
    constructor(t, s, n) {
        this.owner = t;
        this.expr = s;
        this.updater = n;
        this.interceptor = this;
        this.isBound = false;
        this.oL = t.oL;
        this.locator = t.locator;
    }
    handleChange(t, s, n) {
        this.obs.version++;
        this.value = this.expr.evaluate(n, this.scope, this.locator, this);
        this.obs.clear();
        this.updater(n);
    }
    $bind(t, s) {
        if (this.isBound) return;
        this.scope = s;
        if (this.expr.hasBind) this.expr.bind(t, s, this);
        this.value = this.expr.evaluate(t, s, this.locator, this);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        if (this.expr.hasUnbind) this.expr.unbind(t, this.scope, this);
        this.scope = void 0;
        this.obs.clearAll();
    }
}

s.connectable(TranslationBinding);

s.connectable(ParameterBinding);

const v = "tpt";

const b = "t-params.bind";

exports.TranslationParametersAttributePattern = class TranslationParametersAttributePattern {
    [b](t, n, i) {
        return new s.AttrSyntax(t, n, "", b);
    }
};

exports.TranslationParametersAttributePattern = o([ s.attributePattern({
    pattern: b,
    symbols: ""
}) ], exports.TranslationParametersAttributePattern);

class TranslationParametersBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = v;
        this.mode = s.BindingMode.toView;
    }
}

exports.TranslationParametersBindingCommand = class TranslationParametersBindingCommand {
    constructor(t, s) {
        this.m = t;
        this.xp = s;
        this.bindingType = 53;
    }
    build(s) {
        var n;
        const i = s.attr;
        let e = i.target;
        if (null == s.bindable) e = null !== (n = this.m.map(s.node, e)) && void 0 !== n ? n : t.camelCase(e); else e = s.bindable.property;
        return new TranslationParametersBindingInstruction(this.xp.parse(i.rawValue, 53), e);
    }
};

exports.TranslationParametersBindingCommand.inject = [ s.IAttrMapper, s.IExpressionParser ];

exports.TranslationParametersBindingCommand = o([ s.bindingCommand(b) ], exports.TranslationParametersBindingCommand);

exports.TranslationParametersBindingRenderer = class TranslationParametersBindingRenderer {
    constructor(t, s, n) {
        this.parser = t;
        this.oL = s;
        this.p = n;
    }
    render(t, s, n) {
        TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.oL,
            context: t.container,
            controller: t,
            target: s,
            instruction: n,
            isParameterContext: true,
            platform: this.p
        });
    }
};

exports.TranslationParametersBindingRenderer = o([ s.renderer(v), a(0, s.IExpressionParser), a(1, s.IObserverLocator), a(2, s.IPlatform) ], exports.TranslationParametersBindingRenderer);

const T = "tt";

class TranslationAttributePattern {
    static registerAlias(t) {
        this.prototype[t] = function(n, i, e) {
            return new s.AttrSyntax(n, i, "", t);
        };
    }
}

class TranslationBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = T;
        this.mode = s.BindingMode.toView;
    }
}

class TranslationBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 284;
    }
    build(n) {
        var i;
        let e;
        if (null == n.bindable) e = null !== (i = this.m.map(n.node, n.attr.target)) && void 0 !== i ? i : t.camelCase(n.attr.target); else e = n.bindable.property;
        return new TranslationBindingInstruction(new s.CustomExpression(n.attr.rawValue), e);
    }
}

TranslationBindingCommand.inject = [ s.IAttrMapper ];

exports.TranslationBindingRenderer = class TranslationBindingRenderer {
    constructor(t, s, n) {
        this.parser = t;
        this.oL = s;
        this.p = n;
    }
    render(t, s, n) {
        TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.oL,
            context: t.container,
            controller: t,
            target: s,
            instruction: n,
            platform: this.p
        });
    }
};

exports.TranslationBindingRenderer = o([ s.renderer(T), a(0, s.IExpressionParser), a(1, s.IObserverLocator), a(2, s.IPlatform) ], exports.TranslationBindingRenderer);

const B = "tbt";

class TranslationBindAttributePattern {
    static registerAlias(t) {
        const n = `${t}.bind`;
        this.prototype[n] = function(t, i, e) {
            return new s.AttrSyntax(t, i, e[1], n);
        };
    }
}

class TranslationBindBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = B;
        this.mode = s.BindingMode.toView;
    }
}

class TranslationBindBindingCommand {
    constructor(t, s) {
        this.m = t;
        this.xp = s;
        this.bindingType = 53;
    }
    build(s) {
        var n;
        let i;
        if (null == s.bindable) i = null !== (n = this.m.map(s.node, s.attr.target)) && void 0 !== n ? n : t.camelCase(s.attr.target); else i = s.bindable.property;
        return new TranslationBindBindingInstruction(this.xp.parse(s.attr.rawValue, 53), i);
    }
}

TranslationBindBindingCommand.inject = [ s.IAttrMapper, s.IExpressionParser ];

exports.TranslationBindBindingRenderer = class TranslationBindBindingRenderer {
    constructor(t, s, n) {
        this.parser = t;
        this.oL = s;
        this.p = n;
    }
    render(t, s, n) {
        TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.oL,
            context: t.container,
            controller: t,
            target: s,
            instruction: n,
            platform: this.p
        });
    }
};

exports.TranslationBindBindingRenderer = o([ s.renderer(B), a(0, s.IExpressionParser), a(1, s.IObserverLocator), a(2, s.IPlatform) ], exports.TranslationBindBindingRenderer);

exports.TranslationValueConverter = class TranslationValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, s) {
        return this.i18n.tr(t, s);
    }
};

exports.TranslationValueConverter = o([ s.valueConverter("t"), a(0, d) ], exports.TranslationValueConverter);

const w = [ exports.TranslationValueConverter, exports.TranslationBindingBehavior ];

function y(n) {
    const i = n.translationAttributeAliases;
    const e = Array.isArray(i) ? i : [ "t" ];
    const r = [];
    const o = [];
    const a = [];
    const h = [];
    for (const t of e) {
        const s = `${t}.bind`;
        r.push({
            pattern: t,
            symbols: ""
        });
        TranslationAttributePattern.registerAlias(t);
        o.push({
            pattern: s,
            symbols: "."
        });
        TranslationBindAttributePattern.registerAlias(t);
        if ("t" !== t) {
            a.push(t);
            h.push(s);
        }
    }
    const l = [ s.AttributePattern.define(r, TranslationAttributePattern), s.BindingCommand.define({
        name: "t",
        aliases: a
    }, TranslationBindingCommand), exports.TranslationBindingRenderer, s.AttributePattern.define(o, TranslationBindAttributePattern), s.BindingCommand.define({
        name: "t.bind",
        aliases: h
    }, TranslationBindBindingCommand), exports.TranslationBindBindingRenderer, exports.TranslationParametersAttributePattern, exports.TranslationParametersBindingCommand, exports.TranslationParametersBindingRenderer ];
    return {
        register(i) {
            return i.register(t.Registration.callback(c, (() => n.initOptions)), s.AppTask.beforeActivate(d, (t => t.initPromise)), t.Registration.singleton(u, I18nextWrapper), t.Registration.singleton(d, exports.I18nService), ...l, ...w);
        }
    };
}

const C = [ exports.DateFormatValueConverter, exports.DateFormatBindingBehavior ];

const I = [ exports.NumberFormatValueConverter, exports.NumberFormatBindingBehavior ];

const M = [ exports.RelativeTimeValueConverter, exports.RelativeTimeBindingBehavior ];

function P(t) {
    return {
        optionsProvider: t,
        register(s) {
            const n = {
                initOptions: Object.create(null)
            };
            t(n);
            return s.register(y(n), ...C, ...I, ...M);
        },
        customize(s) {
            return P(s || t);
        }
    };
}

const A = P((() => {}));

exports.I18N = d;

exports.I18nConfiguration = A;

exports.I18nInitOptions = c;

exports.I18nKeyEvaluationResult = I18nKeyEvaluationResult;

exports.TranslationAttributePattern = TranslationAttributePattern;

exports.TranslationBindAttributePattern = TranslationBindAttributePattern;

exports.TranslationBindBindingCommand = TranslationBindBindingCommand;

exports.TranslationBindBindingInstruction = TranslationBindBindingInstruction;

exports.TranslationBindInstructionType = B;

exports.TranslationBinding = TranslationBinding;

exports.TranslationBindingCommand = TranslationBindingCommand;

exports.TranslationBindingInstruction = TranslationBindingInstruction;

exports.TranslationInstructionType = T;

exports.TranslationParametersBindingInstruction = TranslationParametersBindingInstruction;

exports.TranslationParametersInstructionType = v;
//# sourceMappingURL=index.js.map
