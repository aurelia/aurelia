import { DI as t, resolve as n, IEventAggregator as e, camelCase as i, toArray as r, registrableMetadataKey as s, Registration as a } from "../../../kernel/dist/native-modules/index.mjs";

import { BindingMode as o, State as l, ISignaler as c, BindingBehavior as h, mixinAstEvaluator as u, mixingBindingLimited as f, CustomElement as d, renderer as m, ValueConverter as p, AppTask as g } from "../../../runtime-html/dist/native-modules/index.mjs";

import { AttributePattern as v, AttrSyntax as B, BindingCommand as b } from "../../../template-compiler/dist/native-modules/index.mjs";

import { ValueConverterExpression as T, CustomExpression as C } from "../../../expression-parser/dist/native-modules/index.mjs";

import { nowrap as w, connectable as I, astEvaluate as y, astUnbind as P, AccessorType as x, astBind as V } from "../../../runtime/dist/native-modules/index.mjs";

import F from "i18next";

const _ = {
    I18N_EA_CHANNEL: "i18n:locale:changed",
    I18N_SIGNAL: "aurelia-translation-signal",
    RT_SIGNAL: "aurelia-relativetime-signal"
};

var A;

(function(t) {
    t["translationValueConverterName"] = "t";
    t["dateFormatValueConverterName"] = "df";
    t["numberFormatValueConverterName"] = "nf";
    t["relativeTimeValueConverterName"] = "rt";
})(A || (A = {}));

function createIntlFormatValueConverterExpression(t, n) {
    const e = n.ast.expression;
    if (!(e instanceof T)) {
        const i = new T(e, t, n.ast.args);
        n.ast.expression = i;
    }
}

const E = "Interpolation";

const N = "IsProperty";

const R = o.toView;

const L = l.activating;

const M = "binding-behavior";

const D = "value-converter";

class DateFormatBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("df", n);
    }
}

DateFormatBindingBehavior.$au = {
    type: M,
    name: "df"
};

function __esDecorate(t, n, e, i, r, s) {
    function accept(t) {
        if (t !== void 0 && typeof t !== "function") throw new TypeError("Function expected");
        return t;
    }
    var a = i.kind, o = a === "getter" ? "get" : a === "setter" ? "set" : "value";
    var l = !n && t ? i["static"] ? t : t.prototype : null;
    var c = n || (l ? Object.getOwnPropertyDescriptor(l, i.name) : {});
    var h, u = false;
    for (var f = e.length - 1; f >= 0; f--) {
        var d = {};
        for (var m in i) d[m] = m === "access" ? {} : i[m];
        for (var m in i.access) d.access[m] = i.access[m];
        d.addInitializer = function(t) {
            if (u) throw new TypeError("Cannot add initializers after decoration has completed");
            s.push(accept(t || null));
        };
        var p = (0, e[f])(a === "accessor" ? {
            get: c.get,
            set: c.set
        } : c[o], d);
        if (a === "accessor") {
            if (p === void 0) continue;
            if (p === null || typeof p !== "object") throw new TypeError("Object expected");
            if (h = accept(p.get)) c.get = h;
            if (h = accept(p.set)) c.set = h;
            if (h = accept(p.init)) r.unshift(h);
        } else if (h = accept(p)) {
            if (a === "field") r.unshift(h); else c[o] = h;
        }
    }
    if (l) Object.defineProperty(l, i.name, c);
    u = true;
}

function __runInitializers(t, n, e) {
    var i = arguments.length > 2;
    for (var r = 0; r < n.length; r++) {
        e = i ? n[r].call(t, e) : n[r].call(t);
    }
    return i ? e : void 0;
}

typeof SuppressedError === "function" ? SuppressedError : function(t, n, e) {
    var i = new Error(e);
    return i.name = "SuppressedError", i.error = t, i.suppressed = n, i;
};

const S = /*@__PURE__*/ t.createInterface("I18nInitOptions");

const O = /*@__PURE__*/ t.createInterface("II18nextWrapper");

class I18nextWrapper {
    constructor() {
        this.i18next = F;
    }
}

class I18nKeyEvaluationResult {
    constructor(t) {
        this.value = void 0;
        const n = /\[([a-z\-, ]*)\]/gi;
        this.attributes = [];
        const e = n.exec(t);
        if (e) {
            t = t.replace(e[0], "");
            this.attributes = e[1].split(",");
        }
        this.key = t;
    }
}

const j = /*@__PURE__*/ t.createInterface("I18N");

let k = (() => {
    var t;
    let i;
    let r = [];
    let s = [];
    return t = class I18nService {
        constructor() {
            this.i18next = __runInitializers(this, r, void 0);
            this.initPromise = __runInitializers(this, s);
            this.i = new Set;
            this.h = n(c);
            this.ea = n(e);
            this.i18next = n(O).i18next;
            this.initPromise = this.u(n(S));
        }
        evaluate(t, n) {
            const e = t.split(";");
            const i = [];
            for (const t of e) {
                const e = new I18nKeyEvaluationResult(t);
                const r = e.key;
                const s = this.tr(r, n);
                if (this.options.skipTranslationOnMissingKey && s === r) {
                    console.warn(`[DEV:aurelia] Couldn't find translation for key: ${r}`);
                } else {
                    e.value = s;
                    i.push(e);
                }
            }
            return i;
        }
        tr(t, n) {
            return this.i18next.t(t, n);
        }
        getLocale() {
            return this.i18next.language;
        }
        async setLocale(t) {
            const n = this.getLocale();
            const e = {
                oldLocale: n,
                newLocale: t
            };
            await this.i18next.changeLanguage(t);
            this.ea.publish(_.I18N_EA_CHANNEL, e);
            this.i.forEach(t => t.handleLocaleChange(e));
            this.h.dispatchSignal(_.I18N_SIGNAL);
        }
        createNumberFormat(t, n) {
            return Intl.NumberFormat(n || this.getLocale(), t);
        }
        nf(t, n, e) {
            return this.createNumberFormat(n, e).format(t);
        }
        createDateTimeFormat(t, n) {
            return Intl.DateTimeFormat(n || this.getLocale(), t);
        }
        df(t, n, e) {
            return this.createDateTimeFormat(n, e).format(t);
        }
        uf(t, n) {
            const e = this.nf(1e4 / 3, undefined, n);
            let i = e[1];
            const r = e[5];
            if (i === ".") {
                i = "\\.";
            }
            const s = t.replace(new RegExp(i, "g"), "").replace(/[^\d.,-]/g, "").replace(r, ".");
            return Number(s);
        }
        createRelativeTimeFormat(t, n) {
            return new Intl.RelativeTimeFormat(n || this.getLocale(), t);
        }
        rt(t, n, e) {
            let i = t.getTime() - this.now();
            const r = this.options.rtEpsilon * (i > 0 ? 1 : 0);
            const s = this.createRelativeTimeFormat(n, e);
            let a = i / 31536e6;
            if (Math.abs(a + r) >= 1) {
                return s.format(Math.round(a), "year");
            }
            a = i / 2592e6;
            if (Math.abs(a + r) >= 1) {
                return s.format(Math.round(a), "month");
            }
            a = i / 6048e5;
            if (Math.abs(a + r) >= 1) {
                return s.format(Math.round(a), "week");
            }
            a = i / 864e5;
            if (Math.abs(a + r) >= 1) {
                return s.format(Math.round(a), "day");
            }
            a = i / 36e5;
            if (Math.abs(a + r) >= 1) {
                return s.format(Math.round(a), "hour");
            }
            a = i / 6e4;
            if (Math.abs(a + r) >= 1) {
                return s.format(Math.round(a), "minute");
            }
            i = Math.abs(i) < 1e3 ? 1e3 : i;
            a = i / 1e3;
            return s.format(Math.round(a), "second");
        }
        subscribeLocaleChange(t) {
            this.i.add(t);
        }
        unsubscribeLocaleChange(t) {
            this.i.delete(t);
        }
        now() {
            return (new Date).getTime();
        }
        async u(t) {
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
            for (const t of this.options.plugins) {
                this.i18next.use(t);
            }
            await this.i18next.init(this.options);
        }
    }, (() => {
        const n = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        i = [ w ];
        __esDecorate(null, null, i, {
            kind: "field",
            name: "i18next",
            static: false,
            private: false,
            access: {
                has: t => "i18next" in t,
                get: t => t.i18next,
                set: (t, n) => {
                    t.i18next = n;
                }
            },
            metadata: n
        }, r, s);
        if (n) Object.defineProperty(t, Symbol.metadata, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: n
        });
    })(), t;
})();

class DateFormatValueConverter {
    constructor() {
        this.signals = [ _.I18N_SIGNAL ];
        this.i18n = n(j);
    }
    toView(t, n, e) {
        if (!t && t !== 0 || typeof t === "string" && t.trim() === "") {
            return t;
        }
        if (typeof t === "string") {
            const n = Number(t);
            const e = new Date(Number.isInteger(n) ? n : t);
            if (isNaN(e.getTime())) {
                return t;
            }
            t = e;
        }
        return this.i18n.df(t, n, e);
    }
}

DateFormatValueConverter.$au = {
    type: D,
    name: "df"
};

class NumberFormatBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("nf", n);
    }
}

NumberFormatBindingBehavior.$au = {
    type: M,
    name: "nf"
};

class NumberFormatValueConverter {
    constructor() {
        this.signals = [ _.I18N_SIGNAL ];
        this.i18n = n(j);
    }
    toView(t, n, e) {
        if (typeof t !== "number") {
            return t;
        }
        return this.i18n.nf(t, n, e);
    }
}

NumberFormatValueConverter.$au = {
    type: D,
    name: "nf"
};

class RelativeTimeBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("rt", n);
    }
}

RelativeTimeBindingBehavior.$au = {
    type: M,
    name: "rt"
};

class RelativeTimeValueConverter {
    constructor() {
        this.signals = [ _.I18N_SIGNAL, _.RT_SIGNAL ];
        this.i18n = n(j);
    }
    toView(t, n, e) {
        if (!(t instanceof Date)) {
            return t;
        }
        return this.i18n.rt(t, n, e);
    }
}

RelativeTimeValueConverter.$au = {
    type: D,
    name: "rt"
};

class TranslationBindingBehavior {
    bind(t, n) {
        const e = n.ast.expression;
        if (!(e instanceof T)) {
            const t = new T(e, "t", n.ast.args);
            n.ast.expression = t;
        }
    }
}

h.define("t", TranslationBindingBehavior);

const createMappedError = (t, ...n) => new Error(`AUR${String(t).padStart(4, "0")}:${n.map(String)}`);

const z = [ "textContent", "innerHTML", "prepend", "append" ];

const K = new Map([ [ "text", "textContent" ], [ "html", "innerHTML" ] ]);

const $ = {
    optional: true
};

const G = {
    preempt: true
};

class TranslationBinding {
    static create({parser: t, observerLocator: n, context: e, controller: i, target: r, instruction: s, platform: a, isParameterContext: o}) {
        const l = this.B({
            observerLocator: n,
            context: e,
            controller: i,
            target: r,
            platform: a
        });
        const c = typeof s.from === "string" ? t.parse(s.from, N) : s.from;
        if (o) {
            l.useParameter(c);
        } else {
            const n = c instanceof C ? t.parse(c.value, E) : undefined;
            l.ast = n || c;
        }
    }
    static B({observerLocator: t, context: n, controller: e, target: i, platform: r}) {
        let s = e.bindings && e.bindings.find(t => t instanceof TranslationBinding && t.target === i);
        if (!s) {
            s = new TranslationBinding(e, n, t, r, i);
            e.addBinding(s);
        }
        return s;
    }
    constructor(t, n, e, i, r) {
        this.isBound = false;
        this.T = z;
        this.C = null;
        this.parameter = null;
        this.boundFn = false;
        this.strict = true;
        this.l = n;
        this.I = t;
        this.target = r;
        this.i18n = n.get(j);
        this.p = i;
        this.P = new Set;
        this.oL = e;
        this.V = i.domQueue;
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        const n = this.ast;
        if (n == null) throw createMappedError(4e3);
        this.s = t;
        this.i18n.subscribeLocaleChange(this);
        this.F = y(n, t, this, this);
        this._();
        this.parameter?.bind(t);
        this.updateTranslations();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.i18n.unsubscribeLocaleChange(this);
        P(this.ast, this.s, this);
        this.parameter?.unbind();
        this.P.clear();
        if (this.C !== null) {
            this.C.cancel();
            this.C = null;
        }
        this.s = void 0;
        this.obs.clearAll();
        this.isBound = false;
    }
    handleChange(t, n) {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        this.F = y(this.ast, this.s, this, this);
        this.obs.clear();
        this._();
        this.updateTranslations();
    }
    handleLocaleChange() {
        this.updateTranslations();
    }
    useParameter(t) {
        if (this.parameter != null) {
            throw createMappedError(4001);
        }
        this.parameter = new ParameterBinding(this, t, () => this.updateTranslations());
    }
    updateTranslations() {
        const t = this.i18n.evaluate(this.F, this.parameter?.value);
        const n = Object.create(null);
        const e = [];
        const r = this.C;
        this.P.clear();
        for (const r of t) {
            const t = r.value;
            const s = this.A(r.attributes);
            for (const r of s) {
                if (this.N(r)) {
                    n[r] = t;
                } else {
                    const n = d.for(this.target, $);
                    const s = n?.viewModel ? this.oL.getAccessor(n.viewModel, i(r)) : this.oL.getAccessor(this.target, r);
                    const a = this.I.state !== L && (s.type & x.Layout) > 0;
                    if (a) {
                        e.push(new AccessorUpdateTask(s, t, this.target, r));
                    } else {
                        s.setValue(t, this.target, r);
                    }
                    this.P.add(s);
                }
            }
        }
        let s = false;
        if (Object.keys(n).length > 0) {
            s = this.I.state !== L;
            if (!s) {
                this.R(n);
            }
        }
        if (e.length > 0 || s) {
            this.C = this.V.queueTask(() => {
                this.C = null;
                for (const t of e) {
                    t.run();
                }
                if (s) {
                    this.R(n);
                }
            }, G);
        }
        r?.cancel();
    }
    A(t) {
        if (t.length === 0) {
            t = this.target.tagName === "IMG" ? [ "src" ] : [ "textContent" ];
        }
        for (const [n, e] of K) {
            const i = t.findIndex(t => t === n);
            if (i > -1) {
                t.splice(i, 1, e);
            }
        }
        return t;
    }
    N(t) {
        return this.T.includes(t);
    }
    R(t) {
        const n = r(this.target.childNodes);
        const e = [];
        const i = "au-i18n";
        for (const t of n) {
            if (!Reflect.get(t, i)) {
                e.push(t);
            }
        }
        const s = this.L(t, i, e);
        this.target.innerHTML = "";
        for (const t of r(s.content.childNodes)) {
            this.target.appendChild(t);
        }
    }
    L(t, n, e) {
        const i = this.p.document.createElement("template");
        this.M(i, t.prepend, n);
        if (!this.M(i, t.innerHTML ?? t.textContent, n)) {
            for (const t of e) {
                i.content.append(t);
            }
        }
        this.M(i, t.append, n);
        return i;
    }
    M(t, n, e) {
        if (n !== void 0 && n !== null) {
            const i = this.p.document.createElement("div");
            i.innerHTML = n;
            for (const n of r(i.childNodes)) {
                Reflect.set(n, e, true);
                t.content.append(n);
            }
            return true;
        }
        return false;
    }
    _() {
        const t = this.F ??= "";
        const n = typeof t;
        if (n !== "string") {
            throw createMappedError(4002, t, n);
        }
    }
}

I(TranslationBinding, null);

u(TranslationBinding);

f(TranslationBinding, () => "updateTranslations");

class AccessorUpdateTask {
    constructor(t, n, e, i) {
        this.accessor = t;
        this.v = n;
        this.el = e;
        this.attr = i;
    }
    run() {
        this.accessor.setValue(this.v, this.el, this.attr);
    }
}

class ParameterBinding {
    constructor(t, n, e) {
        this.owner = t;
        this.ast = n;
        this.updater = e;
        this.isBound = false;
        this.boundFn = false;
        this.strict = true;
        this.oL = t.oL;
        this.l = t.l;
    }
    handleChange(t, n) {
        if (!this.isBound) {
            return;
        }
        this.obs.version++;
        this.value = y(this.ast, this.s, this, this);
        this.obs.clear();
        this.updater();
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        this.s = t;
        V(this.ast, t, this);
        this.value = y(this.ast, t, this, this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        P(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
        this.isBound = false;
    }
}

(() => {
    I(ParameterBinding, null);
    u(ParameterBinding);
})();

var H;

const U = "tpt";

const W = "t-params.bind";

class TranslationParametersAttributePattern {
    [(H = Symbol.metadata, W)](t, n) {
        return new B(t, n, "", W);
    }
}

TranslationParametersAttributePattern[H] = {
    [s]: v.create([ {
        pattern: W,
        symbols: ""
    } ], TranslationParametersAttributePattern)
};

class TranslationParametersBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = U;
        this.mode = R;
    }
}

class TranslationParametersBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(t, n, e) {
        const r = t.attr;
        let s = r.target;
        if (t.bindable == null) {
            s = e.map(t.node, s) ?? i(s);
        } else {
            s = t.bindable.name;
        }
        return new TranslationParametersBindingInstruction(n.parse(r.rawValue, N), s);
    }
}

TranslationParametersBindingCommand.$au = {
    type: "binding-command",
    name: W
};

const q = /*@__PURE__*/ m(class TranslationParametersBindingRenderer {
    constructor() {
        this.target = U;
    }
    render(t, n, e, i, r, s) {
        TranslationBinding.create({
            parser: r,
            observerLocator: s,
            context: t.container,
            controller: t,
            target: n,
            instruction: e,
            isParameterContext: true,
            platform: i
        });
    }
}, null);

const J = "tt";

class TranslationBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = J;
        this.mode = R;
    }
}

class TranslationBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(t, n, e) {
        let r;
        if (t.bindable == null) {
            r = e.map(t.node, t.attr.target) ?? i(t.attr.target);
        } else {
            r = t.bindable.name;
        }
        return new TranslationBindingInstruction(new C(t.attr.rawValue), r);
    }
}

const Q = /*@__PURE__*/ m(class TranslationBindingRenderer {
    constructor() {
        this.target = J;
    }
    render(t, n, e, i, r, s) {
        TranslationBinding.create({
            parser: r,
            observerLocator: s,
            context: t.container,
            controller: t,
            target: n,
            instruction: e,
            platform: i
        });
    }
}, null);

const X = "tbt";

class TranslationBindBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = X;
        this.mode = R;
    }
}

class TranslationBindBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(t, n, e) {
        let r;
        if (t.bindable == null) {
            r = e.map(t.node, t.attr.target) ?? i(t.attr.target);
        } else {
            r = t.bindable.name;
        }
        return new TranslationBindBindingInstruction(n.parse(t.attr.rawValue, N), r);
    }
}

const Y = /*@__PURE__*/ m(class TranslationBindBindingRenderer {
    constructor() {
        this.target = X;
    }
    render(t, n, e, i, r, s) {
        TranslationBinding.create({
            parser: r,
            observerLocator: s,
            context: t.container,
            controller: t,
            target: n,
            instruction: e,
            platform: i
        });
    }
}, null);

class TranslationValueConverter {
    constructor() {
        this.signals = [ _.I18N_SIGNAL ];
        this.i18n = n(j);
    }
    toView(t, n) {
        return this.i18n.tr(t, n);
    }
}

p.define("t", TranslationValueConverter);

const Z = [ TranslationValueConverter, TranslationBindingBehavior ];

function coreComponents(t) {
    const n = t.translationAttributeAliases;
    const e = Array.isArray(n) ? n : [ "t" ];
    const i = [];
    const r = [];
    const s = [];
    const o = [];
    class TranslationAttributePattern {}
    class TranslationBindAttributePattern {}
    for (const t of e) {
        i.push({
            pattern: t,
            symbols: ""
        });
        TranslationAttributePattern.prototype[t] = function(n, e, i) {
            return new B(n, e, "", t);
        };
        const n = `${t}.bind`;
        r.push({
            pattern: n,
            symbols: "."
        });
        TranslationBindAttributePattern.prototype[n] = function(t, e, i) {
            return new B(t, e, i[1], n);
        };
        if (t !== "t") {
            s.push(t);
            o.push(n);
        }
    }
    const l = [ v.create(i, TranslationAttributePattern), b.define({
        name: "t",
        aliases: s
    }, TranslationBindingCommand), Q, v.create(r, TranslationBindAttributePattern), b.define({
        name: "t.bind",
        aliases: o
    }, TranslationBindBindingCommand), Y, TranslationParametersAttributePattern, TranslationParametersBindingCommand, q ];
    return {
        register(n) {
            const e = t.i18nextWrapper != null && typeof t.i18nextWrapper === "object" ? a.instance(O, t.i18nextWrapper) : a.singleton(O, I18nextWrapper);
            return n.register(a.callback(S, () => t.initOptions), g.activating(j, t => t.initPromise), e, a.singleton(j, k), ...l, ...Z);
        }
    };
}

const tt = [ DateFormatValueConverter, DateFormatBindingBehavior ];

const nt = [ NumberFormatValueConverter, NumberFormatBindingBehavior ];

const et = [ RelativeTimeValueConverter, RelativeTimeBindingBehavior ];

function createI18nConfiguration(t) {
    return {
        optionsProvider: t,
        register(n) {
            const e = {
                initOptions: Object.create(null)
            };
            t(e);
            return n.register(coreComponents(e), ...tt, ...nt, ...et);
        },
        customize(n) {
            return createI18nConfiguration(n || t);
        }
    };
}

const it = /*@__PURE__*/ createI18nConfiguration(() => {});

export { DateFormatBindingBehavior, DateFormatValueConverter, j as I18N, it as I18nConfiguration, S as I18nInitOptions, I18nKeyEvaluationResult, k as I18nService, O as II18nextWrapper, NumberFormatBindingBehavior, NumberFormatValueConverter, RelativeTimeBindingBehavior, RelativeTimeValueConverter, _ as Signals, TranslationBindBindingCommand, TranslationBindBindingInstruction, Y as TranslationBindBindingRenderer, X as TranslationBindInstructionType, TranslationBinding, TranslationBindingBehavior, TranslationBindingCommand, TranslationBindingInstruction, Q as TranslationBindingRenderer, J as TranslationInstructionType, TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingInstruction, q as TranslationParametersBindingRenderer, U as TranslationParametersInstructionType, TranslationValueConverter };

