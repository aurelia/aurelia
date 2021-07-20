import { DI as t, IEventAggregator as n, toArray as i, camelCase as s, Registration as e } from "../../../kernel/dist/native-modules/index.js";

import { ValueConverterExpression as r, bindingBehavior as o, CustomExpression as a, Interpolation as h, CustomElement as l, connectable as c, AttrSyntax as u, attributePattern as f, BindingMode as d, IAttrMapper as m, bindingCommand as g, renderer as p, IExpressionParser as v, IObserverLocator as b, IPlatform as T, valueConverter as B, AppTask as w, AttributePattern as y, BindingCommand as C } from "../../../runtime-html/dist/native-modules/index.js";

import { ValueConverterExpression as I, bindingBehavior as x, ISignaler as M, valueConverter as P } from "../../../runtime/dist/native-modules/index.js";

import A from "i18next";

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
***************************************************************************** */ function L(t, n, i, s) {
    var e = arguments.length, r = e < 3 ? n : null === s ? s = Object.getOwnPropertyDescriptor(n, i) : s, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(t, n, i, s); else for (var a = t.length - 1; a >= 0; a--) if (o = t[a]) r = (e < 3 ? o(r) : e > 3 ? o(n, i, r) : o(n, i)) || r;
    return e > 3 && r && Object.defineProperty(n, i, r), r;
}

function R(t, n) {
    return function(i, s) {
        n(i, s, t);
    };
}

var E;

(function(t) {
    t["I18N_EA_CHANNEL"] = "i18n:locale:changed";
    t["I18N_SIGNAL"] = "aurelia-translation-signal";
    t["RT_SIGNAL"] = "aurelia-relativetime-signal";
})(E || (E = {}));

var k;

(function(t) {
    t["translationValueConverterName"] = "t";
    t["dateFormatValueConverterName"] = "df";
    t["numberFormatValueConverterName"] = "nf";
    t["relativeTimeValueConverterName"] = "rt";
})(k || (k = {}));

function j(t, n) {
    const i = n.sourceExpression.expression;
    if (!(i instanceof I)) {
        const s = new I(i, t, n.sourceExpression.args);
        n.sourceExpression.expression = s;
    }
}

let N = class DateFormatBindingBehavior {
    bind(t, n, i) {
        j("df", i);
    }
};

N = L([ x("df") ], N);

const V = t.createInterface("I18nInitOptions");

const $ = t.createInterface("I18nextWrapper");

class I18nextWrapper {
    constructor() {
        this.i18next = A;
    }
}

var O;

(function(t) {
    t[t["Second"] = 1e3] = "Second";
    t[t["Minute"] = 6e4] = "Minute";
    t[t["Hour"] = 36e5] = "Hour";
    t[t["Day"] = 864e5] = "Day";
    t[t["Week"] = 6048e5] = "Week";
    t[t["Month"] = 2592e6] = "Month";
    t[t["Year"] = 31536e6] = "Year";
})(O || (O = {}));

class I18nKeyEvaluationResult {
    constructor(t) {
        this.value = void 0;
        const n = /\[([a-z\-, ]*)\]/gi;
        this.attributes = [];
        const i = n.exec(t);
        if (i) {
            t = t.replace(i[0], "");
            this.attributes = i[1].split(",");
        }
        this.key = t;
    }
}

const D = t.createInterface("I18N");

let F = class I18nService {
    constructor(t, n, i, s) {
        this.ea = i;
        this.signaler = s;
        this.localeSubscribers = new Set;
        this.i18next = t.i18next;
        this.initPromise = this.initializeI18next(n);
    }
    evaluate(t, n) {
        const i = t.split(";");
        const s = [];
        for (const t of i) {
            const i = new I18nKeyEvaluationResult(t);
            const e = i.key;
            const r = this.tr(e, n);
            if (this.options.skipTranslationOnMissingKey && r === e) console.warn(`Couldn't find translation for key: ${e}`); else {
                i.value = r;
                s.push(i);
            }
        }
        return s;
    }
    tr(t, n) {
        return this.i18next.t(t, n);
    }
    getLocale() {
        return this.i18next.language;
    }
    async setLocale(t) {
        const n = this.getLocale();
        const i = {
            oldLocale: n,
            newLocale: t
        };
        await this.i18next.changeLanguage(t);
        this.ea.publish("i18n:locale:changed", i);
        this.localeSubscribers.forEach((t => t.handleLocaleChange(i)));
        this.signaler.dispatchSignal("aurelia-translation-signal");
    }
    createNumberFormat(t, n) {
        return Intl.NumberFormat(n || this.getLocale(), t);
    }
    nf(t, n, i) {
        return this.createNumberFormat(n, i).format(t);
    }
    createDateTimeFormat(t, n) {
        return Intl.DateTimeFormat(n || this.getLocale(), t);
    }
    df(t, n, i) {
        return this.createDateTimeFormat(n, i).format(t);
    }
    uf(t, n) {
        const i = this.nf(1e4 / 3, void 0, n);
        let s = i[1];
        const e = i[5];
        if ("." === s) s = "\\.";
        const r = t.replace(new RegExp(s, "g"), "").replace(/[^\d.,-]/g, "").replace(e, ".");
        return Number(r);
    }
    createRelativeTimeFormat(t, n) {
        return new Intl.RelativeTimeFormat(n || this.getLocale(), t);
    }
    rt(t, n, i) {
        let s = t.getTime() - this.now();
        const e = this.options.rtEpsilon * (s > 0 ? 1 : 0);
        const r = this.createRelativeTimeFormat(n, i);
        let o = s / 31536e6;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "year");
        o = s / 2592e6;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "month");
        o = s / 6048e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "week");
        o = s / 864e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "day");
        o = s / 36e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "hour");
        o = s / 6e4;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "minute");
        s = Math.abs(s) < 1e3 ? 1e3 : s;
        o = s / 1e3;
        return r.format(Math.round(o), "second");
    }
    subscribeLocaleChange(t) {
        this.localeSubscribers.add(t);
    }
    now() {
        return (new Date).getTime();
    }
    async initializeI18next(t) {
        const n = {
            lng: "en",
            fallbackLng: [ "en" ],
            debug: false,
            plugins: [],
            rtEpsilon: .01,
            skipTranslationOnMissingKey: false
        };
        this.options = {
            ...n,
            ...t
        };
        for (const t of this.options.plugins) this.i18next.use(t);
        await this.i18next.init(this.options);
    }
};

F = L([ R(0, $), R(1, V), R(2, n), R(3, M) ], F);

let K = class DateFormatValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, n, i) {
        if (!t && 0 !== t || "string" === typeof t && "" === t.trim()) return t;
        if ("string" === typeof t) {
            const n = Number(t);
            const i = new Date(Number.isInteger(n) ? n : t);
            if (isNaN(i.getTime())) return t;
            t = i;
        }
        return this.i18n.df(t, n, i);
    }
};

K = L([ P("df"), R(0, D) ], K);

let S = class NumberFormatBindingBehavior {
    bind(t, n, i) {
        j("nf", i);
    }
};

S = L([ x("nf") ], S);

let W = class NumberFormatValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, n, i) {
        if ("number" !== typeof t) return t;
        return this.i18n.nf(t, n, i);
    }
};

W = L([ P("nf"), R(0, D) ], W);

let z = class RelativeTimeBindingBehavior {
    bind(t, n, i) {
        j("rt", i);
    }
};

z = L([ x("rt") ], z);

let H = class RelativeTimeValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal", "aurelia-relativetime-signal" ];
    }
    toView(t, n, i) {
        if (!(t instanceof Date)) return t;
        return this.i18n.rt(t, n, i);
    }
};

H = L([ P("rt"), R(0, D) ], H);

let U = class TranslationBindingBehavior {
    bind(t, n, i) {
        const s = i.sourceExpression.expression;
        if (!(s instanceof r)) {
            const t = new r(s, "t", i.sourceExpression.args);
            i.sourceExpression.expression = t;
        }
    }
};

U = L([ o("t") ], U);

var G;

const Y = [ "textContent", "innerHTML", "prepend", "append" ];

const q = new Map([ [ "text", "textContent" ], [ "html", "innerHTML" ] ]);

const J = {
    optional: true
};

const Q = {
    reusable: false,
    preempt: true
};

let X = G = class TranslationBinding {
    constructor(t, n, i, s) {
        this.observerLocator = n;
        this.locator = i;
        this.interceptor = this;
        this.isBound = false;
        this.contentAttributes = Y;
        this.task = null;
        this.parameter = null;
        this.target = t;
        this.i18n = this.locator.get(D);
        this.platform = s;
        this.targetAccessors = new Set;
        this.i18n.subscribeLocaleChange(this);
    }
    static create({parser: t, observerLocator: n, context: i, controller: s, target: e, instruction: r, platform: o, isParameterContext: h}) {
        const l = this.getBinding({
            observerLocator: n,
            context: i,
            controller: s,
            target: e,
            platform: o
        });
        const c = "string" === typeof r.from ? t.parse(r.from, 53) : r.from;
        if (h) l.useParameter(c); else {
            const n = c instanceof a ? t.parse(c.value, 2048) : void 0;
            l.expr = n || c;
        }
    }
    static getBinding({observerLocator: t, context: n, controller: i, target: s, platform: e}) {
        let r = i.bindings && i.bindings.find((t => t instanceof G && t.target === s));
        if (!r) {
            r = new G(s, t, n, e);
            i.addBinding(r);
        }
        return r;
    }
    $bind(t, n) {
        var i;
        if (!this.expr) throw new Error("key expression is missing");
        this.scope = n;
        this.isInterpolation = this.expr instanceof h;
        this.keyExpression = this.expr.evaluate(t, n, this.locator, this);
        this.ensureKeyExpression();
        null === (i = this.parameter) || void 0 === i ? void 0 : i.$bind(t, n);
        this.updateTranslations(t);
        this.isBound = true;
    }
    $unbind(t) {
        var n;
        if (!this.isBound) return;
        if (this.expr.hasUnbind) this.expr.unbind(t, this.scope, this);
        null === (n = this.parameter) || void 0 === n ? void 0 : n.$unbind(t);
        this.targetAccessors.clear();
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
        }
        this.scope = void 0;
        this.obs.clear(true);
    }
    handleChange(t, n, i) {
        this.obs.version++;
        this.keyExpression = this.isInterpolation ? this.expr.evaluate(i, this.scope, this.locator, this) : t;
        this.obs.clear(false);
        this.ensureKeyExpression();
        this.updateTranslations(i);
    }
    handleLocaleChange() {
        this.updateTranslations(0);
    }
    useParameter(t) {
        if (null != this.parameter) throw new Error("This translation parameter has already been specified.");
        this.parameter = new Z(this, t, (t => this.updateTranslations(t)));
    }
    updateTranslations(t) {
        var n;
        const i = this.i18n.evaluate(this.keyExpression, null === (n = this.parameter) || void 0 === n ? void 0 : n.value);
        const s = Object.create(null);
        const e = [];
        const r = this.task;
        this.targetAccessors.clear();
        for (const n of i) {
            const i = n.value;
            const r = this.preprocessAttributes(n.attributes);
            for (const n of r) if (this.isContentAttribute(n)) s[n] = i; else {
                const s = l.for(this.target, J);
                const r = s && s.viewModel ? this.observerLocator.getAccessor(s.viewModel, n) : this.observerLocator.getAccessor(this.target, n);
                const o = 0 === (2 & t) && (4 & r.type) > 0;
                if (o) e.push(new AccessorUpdateTask(r, i, t, this.target, n)); else r.setValue(i, t, this.target, n);
                this.targetAccessors.add(r);
            }
        }
        let o = false;
        if (Object.keys(s).length > 0) {
            o = 0 === (2 & t);
            if (!o) this.updateContent(s, t);
        }
        if (e.length > 0 || o) this.task = this.platform.domWriteQueue.queueTask((() => {
            this.task = null;
            for (const t of e) t.run();
            if (o) this.updateContent(s, t);
        }), Q);
        null === r || void 0 === r ? void 0 : r.cancel();
    }
    preprocessAttributes(t) {
        if (0 === t.length) t = "IMG" === this.target.tagName ? [ "src" ] : [ "textContent" ];
        for (const [n, i] of q) {
            const s = t.findIndex((t => t === n));
            if (s > -1) t.splice(s, 1, i);
        }
        return t;
    }
    isContentAttribute(t) {
        return this.contentAttributes.includes(t);
    }
    updateContent(t, n) {
        const s = i(this.target.childNodes);
        const e = [];
        const r = "au-i18n";
        for (const t of s) if (!Reflect.get(t, r)) e.push(t);
        const o = this.prepareTemplate(t, r, e);
        this.target.innerHTML = "";
        for (const t of i(o.content.childNodes)) this.target.appendChild(t);
    }
    prepareTemplate(t, n, i) {
        var s;
        const e = this.platform.document.createElement("template");
        this.addContentToTemplate(e, t.prepend, n);
        if (!this.addContentToTemplate(e, null !== (s = t.innerHTML) && void 0 !== s ? s : t.textContent, n)) for (const t of i) e.content.append(t);
        this.addContentToTemplate(e, t.append, n);
        return e;
    }
    addContentToTemplate(t, n, s) {
        if (void 0 !== n && null !== n) {
            const e = this.platform.document.createElement("div");
            e.innerHTML = n;
            for (const n of i(e.childNodes)) {
                Reflect.set(n, s, true);
                t.content.append(n);
            }
            return true;
        }
        return false;
    }
    ensureKeyExpression() {
        var t;
        const n = null !== (t = this.keyExpression) && void 0 !== t ? t : this.keyExpression = "";
        const i = typeof n;
        if ("string" !== i) throw new Error(`Expected the i18n key to be a string, but got ${n} of type ${i}`);
    }
};

X = G = L([ c() ], X);

class AccessorUpdateTask {
    constructor(t, n, i, s, e) {
        this.accessor = t;
        this.v = n;
        this.f = i;
        this.el = s;
        this.attr = e;
    }
    run() {
        this.accessor.setValue(this.v, this.f, this.el, this.attr);
    }
}

let Z = class ParameterBinding {
    constructor(t, n, i) {
        this.owner = t;
        this.expr = n;
        this.updater = i;
        this.interceptor = this;
        this.isBound = false;
        this.observerLocator = t.observerLocator;
        this.locator = t.locator;
    }
    handleChange(t, n, i) {
        this.obs.version++;
        this.value = this.expr.evaluate(i, this.scope, this.locator, this);
        this.obs.clear(false);
        this.updater(i);
    }
    $bind(t, n) {
        if (this.isBound) return;
        this.scope = n;
        if (this.expr.hasBind) this.expr.bind(t, n, this);
        this.value = this.expr.evaluate(t, n, this.locator, this);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        if (this.expr.hasUnbind) this.expr.unbind(t, this.scope, this);
        this.scope = void 0;
        this.obs.clear(true);
    }
};

Z = L([ c() ], Z);

const _ = "tpt";

const tt = "t-params.bind";

let nt = class TranslationParametersAttributePattern {
    [tt](t, n, i) {
        return new u(t, n, "", tt);
    }
};

nt = L([ f({
    pattern: tt,
    symbols: ""
}) ], nt);

class TranslationParametersBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = _;
        this.mode = d.toView;
    }
}

let it = class TranslationParametersBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 53;
    }
    static get inject() {
        return [ m ];
    }
    build(t) {
        var n;
        let i;
        if (null == t.bindable) i = null !== (n = this.m.map(t.node, t.attr.target)) && void 0 !== n ? n : s(t.attr.target); else i = t.bindable.property;
        return new TranslationParametersBindingInstruction(t.expr, i);
    }
};

it = L([ g(tt) ], it);

let st = class TranslationParametersBindingRenderer {
    constructor(t, n, i) {
        this.parser = t;
        this.oL = n;
        this.p = i;
    }
    render(t, n, i, s) {
        X.create({
            parser: this.parser,
            observerLocator: this.oL,
            context: n.container,
            controller: n,
            target: i,
            instruction: s,
            isParameterContext: true,
            platform: this.p
        });
    }
};

st = L([ p(_), R(0, v), R(1, b), R(2, T) ], st);

const et = "tt";

class TranslationAttributePattern {
    static registerAlias(t) {
        this.prototype[t] = function(n, i, s) {
            return new u(n, i, "", t);
        };
    }
}

class TranslationBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = et;
        this.mode = d.toView;
    }
}

class TranslationBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 284;
    }
    static get inject() {
        return [ m ];
    }
    build(t) {
        var n;
        let i;
        if (null == t.bindable) i = null !== (n = this.m.map(t.node, t.attr.target)) && void 0 !== n ? n : s(t.attr.target); else i = t.bindable.property;
        return new TranslationBindingInstruction(t.expr, i);
    }
}

let rt = class TranslationBindingRenderer {
    constructor(t, n, i) {
        this.parser = t;
        this.oL = n;
        this.p = i;
    }
    render(t, n, i, s) {
        X.create({
            parser: this.parser,
            observerLocator: this.oL,
            context: n.container,
            controller: n,
            target: i,
            instruction: s,
            platform: this.p
        });
    }
};

rt = L([ p(et), R(0, v), R(1, b), R(2, T) ], rt);

const ot = "tbt";

class TranslationBindAttributePattern {
    static registerAlias(t) {
        const n = `${t}.bind`;
        this.prototype[n] = function(t, i, s) {
            return new u(t, i, s[1], n);
        };
    }
}

class TranslationBindBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = ot;
        this.mode = d.toView;
    }
}

class TranslationBindBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 53;
    }
    static get inject() {
        return [ m ];
    }
    build(t) {
        var n;
        let i;
        if (null == t.bindable) i = null !== (n = this.m.map(t.node, t.attr.target)) && void 0 !== n ? n : s(t.attr.target); else i = t.bindable.property;
        return new TranslationBindBindingInstruction(t.expr, i);
    }
}

let at = class TranslationBindBindingRenderer {
    constructor(t, n, i) {
        this.parser = t;
        this.oL = n;
        this.p = i;
    }
    render(t, n, i, s) {
        X.create({
            parser: this.parser,
            observerLocator: this.oL,
            context: n.container,
            controller: n,
            target: i,
            instruction: s,
            platform: this.p
        });
    }
};

at = L([ p(ot), R(0, v), R(1, b), R(2, T) ], at);

let ht = class TranslationValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, n) {
        return this.i18n.tr(t, n);
    }
};

ht = L([ B("t"), R(0, D) ], ht);

const lt = [ ht, U ];

function ct(t) {
    const n = t.translationAttributeAliases;
    const i = Array.isArray(n) ? n : [ "t" ];
    const s = [];
    const r = [];
    const o = [];
    const a = [];
    for (const t of i) {
        const n = `${t}.bind`;
        s.push({
            pattern: t,
            symbols: ""
        });
        TranslationAttributePattern.registerAlias(t);
        r.push({
            pattern: n,
            symbols: "."
        });
        TranslationBindAttributePattern.registerAlias(t);
        if ("t" !== t) {
            o.push(t);
            a.push(n);
        }
    }
    const h = [ y.define(s, TranslationAttributePattern), C.define({
        name: "t",
        aliases: o
    }, TranslationBindingCommand), rt, y.define(r, TranslationBindAttributePattern), C.define({
        name: "t.bind",
        aliases: a
    }, TranslationBindBindingCommand), at, nt, it, st ];
    return {
        register(n) {
            return n.register(e.callback(V, (() => t.initOptions)), w.beforeActivate(D, (t => t.initPromise)), e.singleton($, I18nextWrapper), e.singleton(D, F), ...h, ...lt);
        }
    };
}

const ut = [ K, N ];

const ft = [ W, S ];

const dt = [ H, z ];

function mt(t) {
    return {
        optionsProvider: t,
        register(n) {
            const i = {
                initOptions: Object.create(null)
            };
            t(i);
            return n.register(ct(i), ...ut, ...ft, ...dt);
        },
        customize(n) {
            return mt(n || t);
        }
    };
}

const gt = mt((() => {}));

export { N as DateFormatBindingBehavior, K as DateFormatValueConverter, D as I18N, gt as I18nConfiguration, V as I18nInitOptions, I18nKeyEvaluationResult, F as I18nService, S as NumberFormatBindingBehavior, W as NumberFormatValueConverter, z as RelativeTimeBindingBehavior, H as RelativeTimeValueConverter, E as Signals, TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindBindingInstruction, at as TranslationBindBindingRenderer, ot as TranslationBindInstructionType, X as TranslationBinding, U as TranslationBindingBehavior, TranslationBindingCommand, TranslationBindingInstruction, rt as TranslationBindingRenderer, et as TranslationInstructionType, nt as TranslationParametersAttributePattern, it as TranslationParametersBindingCommand, TranslationParametersBindingInstruction, st as TranslationParametersBindingRenderer, _ as TranslationParametersInstructionType, ht as TranslationValueConverter };
//# sourceMappingURL=index.js.map
