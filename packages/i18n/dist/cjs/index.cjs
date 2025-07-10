"use strict";

var t = require("@aurelia/kernel");

var n = require("@aurelia/runtime-html");

var e = require("@aurelia/template-compiler");

var r = require("@aurelia/expression-parser");

var i = require("@aurelia/runtime");

var s = require("i18next");

const a = {
    I18N_EA_CHANNEL: "i18n:locale:changed",
    I18N_SIGNAL: "aurelia-translation-signal",
    RT_SIGNAL: "aurelia-relativetime-signal"
};

var o;

(function(t) {
    t["translationValueConverterName"] = "t";
    t["dateFormatValueConverterName"] = "df";
    t["numberFormatValueConverterName"] = "nf";
    t["relativeTimeValueConverterName"] = "rt";
})(o || (o = {}));

function createIntlFormatValueConverterExpression(t, n) {
    const e = n.ast.expression;
    if (!(e instanceof r.ValueConverterExpression)) {
        const i = new r.ValueConverterExpression(e, t, n.ast.args);
        n.ast.expression = i;
    }
}

const l = "Interpolation";

const c = "IsProperty";

const u = n.BindingMode.toView;

n.State.activating;

const h = "binding-behavior";

const f = "value-converter";

class DateFormatBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("df", n);
    }
}

DateFormatBindingBehavior.$au = {
    type: h,
    name: "df"
};

function __esDecorate(t, n, e, r, i, s) {
    function accept(t) {
        if (t !== void 0 && typeof t !== "function") throw new TypeError("Function expected");
        return t;
    }
    var a = r.kind, o = a === "getter" ? "get" : a === "setter" ? "set" : "value";
    var l = !n && t ? r["static"] ? t : t.prototype : null;
    var c = n || (l ? Object.getOwnPropertyDescriptor(l, r.name) : {});
    var u, h = false;
    for (var f = e.length - 1; f >= 0; f--) {
        var d = {};
        for (var m in r) d[m] = m === "access" ? {} : r[m];
        for (var m in r.access) d.access[m] = r.access[m];
        d.addInitializer = function(t) {
            if (h) throw new TypeError("Cannot add initializers after decoration has completed");
            s.push(accept(t || null));
        };
        var p = (0, e[f])(a === "accessor" ? {
            get: c.get,
            set: c.set
        } : c[o], d);
        if (a === "accessor") {
            if (p === void 0) continue;
            if (p === null || typeof p !== "object") throw new TypeError("Object expected");
            if (u = accept(p.get)) c.get = u;
            if (u = accept(p.set)) c.set = u;
            if (u = accept(p.init)) i.unshift(u);
        } else if (u = accept(p)) {
            if (a === "field") i.unshift(u); else c[o] = u;
        }
    }
    if (l) Object.defineProperty(l, r.name, c);
    h = true;
}

function __runInitializers(t, n, e) {
    var r = arguments.length > 2;
    for (var i = 0; i < n.length; i++) {
        e = r ? n[i].call(t, e) : n[i].call(t);
    }
    return r ? e : void 0;
}

typeof SuppressedError === "function" ? SuppressedError : function(t, n, e) {
    var r = new Error(e);
    return r.name = "SuppressedError", r.error = t, r.suppressed = n, r;
};

const d = /*@__PURE__*/ t.DI.createInterface("I18nInitOptions");

const m = /*@__PURE__*/ t.DI.createInterface("II18nextWrapper");

class I18nextWrapper {
    constructor() {
        this.i18next = s;
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

const p = /*@__PURE__*/ t.DI.createInterface("I18N");

let g = (() => {
    var e;
    let r;
    let s = [];
    let o = [];
    return e = class I18nService {
        constructor() {
            this.i18next = __runInitializers(this, s, void 0);
            this.initPromise = __runInitializers(this, o);
            this.i = new Set;
            this.u = t.resolve(n.ISignaler);
            this.ea = t.resolve(t.IEventAggregator);
            this.i18next = t.resolve(m).i18next;
            this.initPromise = this.h(t.resolve(d));
        }
        evaluate(t, n) {
            const e = t.split(";");
            const r = [];
            for (const t of e) {
                const e = new I18nKeyEvaluationResult(t);
                const i = e.key;
                const s = this.tr(i, n);
                if (this.options.skipTranslationOnMissingKey && s === i) {
                    console.warn(`[DEV:aurelia] Couldn't find translation for key: ${i}`);
                } else {
                    e.value = s;
                    r.push(e);
                }
            }
            return r;
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
            this.ea.publish(a.I18N_EA_CHANNEL, e);
            this.i.forEach(t => t.handleLocaleChange(e));
            this.u.dispatchSignal(a.I18N_SIGNAL);
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
            let r = e[1];
            const i = e[5];
            if (r === ".") {
                r = "\\.";
            }
            const s = t.replace(new RegExp(r, "g"), "").replace(/[^\d.,-]/g, "").replace(i, ".");
            return Number(s);
        }
        createRelativeTimeFormat(t, n) {
            return new Intl.RelativeTimeFormat(n || this.getLocale(), t);
        }
        rt(t, n, e) {
            let r = t.getTime() - this.now();
            const i = this.options.rtEpsilon * (r > 0 ? 1 : 0);
            const s = this.createRelativeTimeFormat(n, e);
            let a = r / 31536e6;
            if (Math.abs(a + i) >= 1) {
                return s.format(Math.round(a), "year");
            }
            a = r / 2592e6;
            if (Math.abs(a + i) >= 1) {
                return s.format(Math.round(a), "month");
            }
            a = r / 6048e5;
            if (Math.abs(a + i) >= 1) {
                return s.format(Math.round(a), "week");
            }
            a = r / 864e5;
            if (Math.abs(a + i) >= 1) {
                return s.format(Math.round(a), "day");
            }
            a = r / 36e5;
            if (Math.abs(a + i) >= 1) {
                return s.format(Math.round(a), "hour");
            }
            a = r / 6e4;
            if (Math.abs(a + i) >= 1) {
                return s.format(Math.round(a), "minute");
            }
            r = Math.abs(r) < 1e3 ? 1e3 : r;
            a = r / 1e3;
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
        async h(t) {
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
        const t = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        r = [ i.nowrap ];
        __esDecorate(null, null, r, {
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
            metadata: t
        }, s, o);
        if (t) Object.defineProperty(e, Symbol.metadata, {
            enumerable: true,
            configurable: true,
            writable: true,
            value: t
        });
    })(), e;
})();

class DateFormatValueConverter {
    constructor() {
        this.signals = [ a.I18N_SIGNAL ];
        this.i18n = t.resolve(p);
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
    type: f,
    name: "df"
};

class NumberFormatBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("nf", n);
    }
}

NumberFormatBindingBehavior.$au = {
    type: h,
    name: "nf"
};

class NumberFormatValueConverter {
    constructor() {
        this.signals = [ a.I18N_SIGNAL ];
        this.i18n = t.resolve(p);
    }
    toView(t, n, e) {
        if (typeof t !== "number") {
            return t;
        }
        return this.i18n.nf(t, n, e);
    }
}

NumberFormatValueConverter.$au = {
    type: f,
    name: "nf"
};

class RelativeTimeBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("rt", n);
    }
}

RelativeTimeBindingBehavior.$au = {
    type: h,
    name: "rt"
};

class RelativeTimeValueConverter {
    constructor() {
        this.signals = [ a.I18N_SIGNAL, a.RT_SIGNAL ];
        this.i18n = t.resolve(p);
    }
    toView(t, n, e) {
        if (!(t instanceof Date)) {
            return t;
        }
        return this.i18n.rt(t, n, e);
    }
}

RelativeTimeValueConverter.$au = {
    type: f,
    name: "rt"
};

class TranslationBindingBehavior {
    bind(t, n) {
        const e = n.ast.expression;
        if (!(e instanceof r.ValueConverterExpression)) {
            const t = new r.ValueConverterExpression(e, "t", n.ast.args);
            n.ast.expression = t;
        }
    }
}

n.BindingBehavior.define("t", TranslationBindingBehavior);

const createMappedError = (t, ...n) => new Error(`AUR${String(t).padStart(4, "0")}:${n.map(String)}`);

const v = [ "textContent", "innerHTML", "prepend", "append" ];

const B = new Map([ [ "text", "textContent" ], [ "html", "innerHTML" ] ]);

const b = {
    optional: true
};

class TranslationBinding {
    static create({parser: t, observerLocator: n, context: e, controller: i, target: s, instruction: a, platform: o, isParameterContext: u}) {
        const h = this.B({
            observerLocator: n,
            context: e,
            controller: i,
            target: s,
            platform: o
        });
        const f = typeof a.from === "string" ? t.parse(a.from, c) : a.from;
        if (u) {
            h.useParameter(f);
        } else {
            const n = f instanceof r.CustomExpression ? t.parse(f.value, l) : undefined;
            h.ast = n || f;
        }
    }
    static B({observerLocator: t, context: n, controller: e, target: r, platform: i}) {
        let s = e.bindings && e.bindings.find(t => t instanceof TranslationBinding && t.target === r);
        if (!s) {
            s = new TranslationBinding(e, n, t, i, r);
            e.addBinding(s);
        }
        return s;
    }
    constructor(t, n, e, r, i) {
        this.isBound = false;
        this.T = v;
        this.C = false;
        this.parameter = null;
        this.boundFn = false;
        this.strict = true;
        this.l = n;
        this.I = t;
        this.target = i;
        this.i18n = n.get(p);
        this.p = r;
        this.P = new Set;
        this.oL = e;
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        const n = this.ast;
        if (n == null) throw createMappedError(4e3);
        this.s = t;
        this.i18n.subscribeLocaleChange(this);
        this.V = i.astEvaluate(n, t, this, this);
        this.F();
        this.parameter?.bind(t);
        this.updateTranslations();
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.i18n.unsubscribeLocaleChange(this);
        i.astUnbind(this.ast, this.s, this);
        this.parameter?.unbind();
        this.P.clear();
        this.C = false;
        this.s = void 0;
        this.obs.clearAll();
        this.isBound = false;
    }
    handleChange(t, n) {
        if (!this.isBound) return;
        if (this.C) return;
        this.C = true;
        i.queueTask(() => {
            this.C = false;
            if (!this.isBound) return;
            this.obs.version++;
            this.V = i.astEvaluate(this.ast, this.s, this, this);
            this.obs.clear();
            this.F();
            this.updateTranslations();
        });
    }
    handleLocaleChange() {
        if (!this.isBound) return;
        if (this.C) return;
        this.C = true;
        i.queueTask(() => {
            this.C = false;
            if (!this.isBound) return;
            this.updateTranslations();
        });
    }
    useParameter(t) {
        if (this.parameter != null) {
            throw createMappedError(4001);
        }
        this.parameter = new ParameterBinding(this, t, () => this.updateTranslations());
    }
    updateTranslations() {
        const e = this.i18n.evaluate(this.V, this.parameter?.value);
        const r = Object.create(null);
        this.P.clear();
        for (const i of e) {
            const e = i.value;
            const s = this._(i.attributes);
            for (const i of s) {
                if (this.N(i)) {
                    r[i] = e;
                } else {
                    const r = n.CustomElement.for(this.target, b);
                    const s = r?.viewModel ? this.oL.getAccessor(r.viewModel, t.camelCase(i)) : this.oL.getAccessor(this.target, i);
                    s.setValue(e, this.target, i);
                    this.P.add(s);
                }
            }
        }
        if (Object.keys(r).length > 0) {
            this.R(r);
        }
    }
    _(t) {
        if (t.length === 0) {
            t = this.target.tagName === "IMG" ? [ "src" ] : [ "textContent" ];
        }
        for (const [n, e] of B) {
            const r = t.findIndex(t => t === n);
            if (r > -1) {
                t.splice(r, 1, e);
            }
        }
        return t;
    }
    N(t) {
        return this.T.includes(t);
    }
    R(n) {
        const e = t.toArray(this.target.childNodes);
        const r = [];
        const i = "au-i18n";
        for (const t of e) {
            if (!Reflect.get(t, i)) {
                r.push(t);
            }
        }
        const s = this.A(n, i, r);
        this.target.innerHTML = "";
        for (const n of t.toArray(s.content.childNodes)) {
            this.target.appendChild(n);
        }
    }
    A(t, n, e) {
        const r = this.p.document.createElement("template");
        this.L(r, t.prepend, n);
        if (!this.L(r, t.innerHTML ?? t.textContent, n)) {
            for (const t of e) {
                r.content.append(t);
            }
        }
        this.L(r, t.append, n);
        return r;
    }
    L(n, e, r) {
        if (e !== void 0 && e !== null) {
            const i = this.p.document.createElement("div");
            i.innerHTML = e;
            for (const e of t.toArray(i.childNodes)) {
                Reflect.set(e, r, true);
                n.content.append(e);
            }
            return true;
        }
        return false;
    }
    F() {
        const t = this.V ??= "";
        const n = typeof t;
        if (n !== "string") {
            throw createMappedError(4002, t, n);
        }
    }
}

i.connectable(TranslationBinding, null);

n.mixinAstEvaluator(TranslationBinding);

n.mixingBindingLimited(TranslationBinding, () => "updateTranslations");

class ParameterBinding {
    constructor(t, n, e) {
        this.owner = t;
        this.ast = n;
        this.updater = e;
        this.isBound = false;
        this.C = false;
        this.boundFn = false;
        this.strict = true;
        this.oL = t.oL;
        this.l = t.l;
    }
    handleChange(t, n) {
        if (!this.isBound) return;
        if (this.C) return;
        this.C = true;
        i.queueTask(() => {
            this.C = false;
            if (!this.isBound) return;
            this.obs.version++;
            this.value = i.astEvaluate(this.ast, this.s, this, this);
            this.obs.clear();
            this.updater();
        });
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        this.s = t;
        i.astBind(this.ast, t, this);
        this.value = i.astEvaluate(this.ast, t, this, this);
        this.isBound = true;
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        i.astUnbind(this.ast, this.s, this);
        this.s = void 0;
        this.obs.clearAll();
        this.isBound = false;
    }
}

(() => {
    i.connectable(ParameterBinding, null);
    n.mixinAstEvaluator(ParameterBinding);
})();

var T;

const x = "tpt";

const C = "t-params.bind";

class TranslationParametersAttributePattern {
    [(T = Symbol.metadata, C)](t, n) {
        return new e.AttrSyntax(t, n, "", C);
    }
}

TranslationParametersAttributePattern[T] = {
    [t.registrableMetadataKey]: e.AttributePattern.create([ {
        pattern: C,
        symbols: ""
    } ], TranslationParametersAttributePattern)
};

class TranslationParametersBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = x;
        this.mode = u;
    }
}

class TranslationParametersBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(n, e, r) {
        const i = n.attr;
        let s = i.target;
        if (n.bindable == null) {
            s = r.map(n.node, s) ?? t.camelCase(s);
        } else {
            s = n.bindable.name;
        }
        return new TranslationParametersBindingInstruction(e.parse(i.rawValue, c), s);
    }
}

TranslationParametersBindingCommand.$au = {
    type: "binding-command",
    name: C
};

const I = /*@__PURE__*/ n.renderer(class TranslationParametersBindingRenderer {
    constructor() {
        this.target = x;
    }
    render(t, n, e, r, i, s) {
        TranslationBinding.create({
            parser: i,
            observerLocator: s,
            context: t.container,
            controller: t,
            target: n,
            instruction: e,
            isParameterContext: true,
            platform: r
        });
    }
}, null);

const w = "tt";

class TranslationBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = w;
        this.mode = u;
    }
}

class TranslationBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(n, e, i) {
        let s;
        if (n.bindable == null) {
            s = i.map(n.node, n.attr.target) ?? t.camelCase(n.attr.target);
        } else {
            s = n.bindable.name;
        }
        return new TranslationBindingInstruction(new r.CustomExpression(n.attr.rawValue), s);
    }
}

const y = /*@__PURE__*/ n.renderer(class TranslationBindingRenderer {
    constructor() {
        this.target = w;
    }
    render(t, n, e, r, i, s) {
        TranslationBinding.create({
            parser: i,
            observerLocator: s,
            context: t.container,
            controller: t,
            target: n,
            instruction: e,
            platform: r
        });
    }
}, null);

const P = "tbt";

class TranslationBindBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = P;
        this.mode = u;
    }
}

class TranslationBindBindingCommand {
    constructor() {
        this.ignoreAttr = false;
    }
    build(n, e, r) {
        let i;
        if (n.bindable == null) {
            i = r.map(n.node, n.attr.target) ?? t.camelCase(n.attr.target);
        } else {
            i = n.bindable.name;
        }
        return new TranslationBindBindingInstruction(e.parse(n.attr.rawValue, c), i);
    }
}

const V = /*@__PURE__*/ n.renderer(class TranslationBindBindingRenderer {
    constructor() {
        this.target = P;
    }
    render(t, n, e, r, i, s) {
        TranslationBinding.create({
            parser: i,
            observerLocator: s,
            context: t.container,
            controller: t,
            target: n,
            instruction: e,
            platform: r
        });
    }
}, null);

class TranslationValueConverter {
    constructor() {
        this.signals = [ a.I18N_SIGNAL ];
        this.i18n = t.resolve(p);
    }
    toView(t, n) {
        return this.i18n.tr(t, n);
    }
}

n.ValueConverter.define("t", TranslationValueConverter);

const F = [ TranslationValueConverter, TranslationBindingBehavior ];

function coreComponents(r) {
    const i = r.translationAttributeAliases;
    const s = Array.isArray(i) ? i : [ "t" ];
    const a = [];
    const o = [];
    const l = [];
    const c = [];
    class TranslationAttributePattern {}
    class TranslationBindAttributePattern {}
    for (const t of s) {
        a.push({
            pattern: t,
            symbols: ""
        });
        TranslationAttributePattern.prototype[t] = function(n, r, i) {
            return new e.AttrSyntax(n, r, "", t);
        };
        const n = `${t}.bind`;
        o.push({
            pattern: n,
            symbols: "."
        });
        TranslationBindAttributePattern.prototype[n] = function(t, r, i) {
            return new e.AttrSyntax(t, r, i[1], n);
        };
        if (t !== "t") {
            l.push(t);
            c.push(n);
        }
    }
    const u = [ e.AttributePattern.create(a, TranslationAttributePattern), e.BindingCommand.define({
        name: "t",
        aliases: l
    }, TranslationBindingCommand), y, e.AttributePattern.create(o, TranslationBindAttributePattern), e.BindingCommand.define({
        name: "t.bind",
        aliases: c
    }, TranslationBindBindingCommand), V, TranslationParametersAttributePattern, TranslationParametersBindingCommand, I ];
    return {
        register(e) {
            const i = r.i18nextWrapper != null && typeof r.i18nextWrapper === "object" ? t.Registration.instance(m, r.i18nextWrapper) : t.Registration.singleton(m, I18nextWrapper);
            return e.register(t.Registration.callback(d, () => r.initOptions), n.AppTask.activating(p, t => t.initPromise), i, t.Registration.singleton(p, g), ...u, ...F);
        }
    };
}

const _ = [ DateFormatValueConverter, DateFormatBindingBehavior ];

const E = [ NumberFormatValueConverter, NumberFormatBindingBehavior ];

const N = [ RelativeTimeValueConverter, RelativeTimeBindingBehavior ];

function createI18nConfiguration(t) {
    return {
        optionsProvider: t,
        register(n) {
            const e = {
                initOptions: Object.create(null)
            };
            t(e);
            return n.register(coreComponents(e), ..._, ...E, ...N);
        },
        customize(n) {
            return createI18nConfiguration(n || t);
        }
    };
}

const R = /*@__PURE__*/ createI18nConfiguration(() => {});

exports.DateFormatBindingBehavior = DateFormatBindingBehavior;

exports.DateFormatValueConverter = DateFormatValueConverter;

exports.I18N = p;

exports.I18nConfiguration = R;

exports.I18nInitOptions = d;

exports.I18nKeyEvaluationResult = I18nKeyEvaluationResult;

exports.I18nService = g;

exports.II18nextWrapper = m;

exports.NumberFormatBindingBehavior = NumberFormatBindingBehavior;

exports.NumberFormatValueConverter = NumberFormatValueConverter;

exports.RelativeTimeBindingBehavior = RelativeTimeBindingBehavior;

exports.RelativeTimeValueConverter = RelativeTimeValueConverter;

exports.Signals = a;

exports.TranslationBindBindingCommand = TranslationBindBindingCommand;

exports.TranslationBindBindingInstruction = TranslationBindBindingInstruction;

exports.TranslationBindBindingRenderer = V;

exports.TranslationBindInstructionType = P;

exports.TranslationBinding = TranslationBinding;

exports.TranslationBindingBehavior = TranslationBindingBehavior;

exports.TranslationBindingCommand = TranslationBindingCommand;

exports.TranslationBindingInstruction = TranslationBindingInstruction;

exports.TranslationBindingRenderer = y;

exports.TranslationInstructionType = w;

exports.TranslationParametersAttributePattern = TranslationParametersAttributePattern;

exports.TranslationParametersBindingCommand = TranslationParametersBindingCommand;

exports.TranslationParametersBindingInstruction = TranslationParametersBindingInstruction;

exports.TranslationParametersBindingRenderer = I;

exports.TranslationParametersInstructionType = x;

exports.TranslationValueConverter = TranslationValueConverter;
//# sourceMappingURL=index.cjs.map
