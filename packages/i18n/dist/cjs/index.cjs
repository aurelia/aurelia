"use strict";

var t = require("@aurelia/kernel");

var n = require("@aurelia/runtime-html");

var e = require("@aurelia/template-compiler");

var r = require("@aurelia/expression-parser");

var i = require("@aurelia/runtime");

var s = require("i18next");

const o = {
    I18N_EA_CHANNEL: "i18n:locale:changed",
    I18N_SIGNAL: "aurelia-translation-signal",
    RT_SIGNAL: "aurelia-relativetime-signal"
};

var a;

(function(t) {
    t["translationValueConverterName"] = "t";
    t["dateFormatValueConverterName"] = "df";
    t["numberFormatValueConverterName"] = "nf";
    t["relativeTimeValueConverterName"] = "rt";
})(a || (a = {}));

function createIntlFormatValueConverterExpression(t, n) {
    const e = n.ast.expression;
    if (!(e instanceof r.ValueConverterExpression)) {
        const i = new r.ValueConverterExpression(e, t, n.ast.args);
        n.ast.expression = i;
    }
}

const l = "Interpolation";

const c = "IsProperty";

const h = n.BindingMode.toView;

const u = n.State.activating;

const f = "binding-behavior";

const d = "value-converter";

class DateFormatBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("df", n);
    }
}

DateFormatBindingBehavior.$au = {
    type: f,
    name: "df"
};

function __esDecorate(t, n, e, r, i, s) {
    function accept(t) {
        if (t !== void 0 && typeof t !== "function") throw new TypeError("Function expected");
        return t;
    }
    var o = r.kind, a = o === "getter" ? "get" : o === "setter" ? "set" : "value";
    var l = {};
    var c, h = false;
    for (var u = e.length - 1; u >= 0; u--) {
        var f = {};
        for (var d in r) f[d] = d === "access" ? {} : r[d];
        for (var d in r.access) f.access[d] = r.access[d];
        f.addInitializer = function(t) {
            if (h) throw new TypeError("Cannot add initializers after decoration has completed");
            s.push(accept(t || null));
        };
        var m = (0, e[u])(o === "accessor" ? {
            get: l.get,
            set: l.set
        } : l[a], f);
        if (o === "accessor") {
            if (m === void 0) continue;
            if (m === null || typeof m !== "object") throw new TypeError("Object expected");
            if (c = accept(m.get)) l.get = c;
            if (c = accept(m.set)) l.set = c;
            if (c = accept(m.init)) i.unshift(c);
        } else if (c = accept(m)) {
            if (o === "field") i.unshift(c); else l[a] = c;
        }
    }
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

const m = /*@__PURE__*/ t.DI.createInterface("I18nInitOptions");

const p = /*@__PURE__*/ t.DI.createInterface("II18nextWrapper");

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

const g = /*@__PURE__*/ t.DI.createInterface("I18N");

let v = (() => {
    var e;
    let r;
    let s = [];
    let a = [];
    return e = class I18nService {
        constructor() {
            this.i18next = __runInitializers(this, s, void 0);
            this.initPromise = __runInitializers(this, a);
            this.i = new Set;
            this.h = t.resolve(n.ISignaler);
            this.ea = t.resolve(t.IEventAggregator);
            this.i18next = t.resolve(p).i18next;
            this.initPromise = this.u(t.resolve(m));
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
            this.ea.publish(o.I18N_EA_CHANNEL, e);
            this.i.forEach((t => t.handleLocaleChange(e)));
            this.h.dispatchSignal(o.I18N_SIGNAL);
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
            let o = r / 31536e6;
            if (Math.abs(o + i) >= 1) {
                return s.format(Math.round(o), "year");
            }
            o = r / 2592e6;
            if (Math.abs(o + i) >= 1) {
                return s.format(Math.round(o), "month");
            }
            o = r / 6048e5;
            if (Math.abs(o + i) >= 1) {
                return s.format(Math.round(o), "week");
            }
            o = r / 864e5;
            if (Math.abs(o + i) >= 1) {
                return s.format(Math.round(o), "day");
            }
            o = r / 36e5;
            if (Math.abs(o + i) >= 1) {
                return s.format(Math.round(o), "hour");
            }
            o = r / 6e4;
            if (Math.abs(o + i) >= 1) {
                return s.format(Math.round(o), "minute");
            }
            r = Math.abs(r) < 1e3 ? 1e3 : r;
            o = r / 1e3;
            return s.format(Math.round(o), "second");
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
        }, s, a);
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
        this.signals = [ o.I18N_SIGNAL ];
        this.i18n = t.resolve(g);
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
    type: d,
    name: "df"
};

class NumberFormatBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("nf", n);
    }
}

NumberFormatBindingBehavior.$au = {
    type: f,
    name: "nf"
};

class NumberFormatValueConverter {
    constructor() {
        this.signals = [ o.I18N_SIGNAL ];
        this.i18n = t.resolve(g);
    }
    toView(t, n, e) {
        if (typeof t !== "number") {
            return t;
        }
        return this.i18n.nf(t, n, e);
    }
}

NumberFormatValueConverter.$au = {
    type: d,
    name: "nf"
};

class RelativeTimeBindingBehavior {
    bind(t, n) {
        createIntlFormatValueConverterExpression("rt", n);
    }
}

RelativeTimeBindingBehavior.$au = {
    type: f,
    name: "rt"
};

class RelativeTimeValueConverter {
    constructor() {
        this.signals = [ o.I18N_SIGNAL, o.RT_SIGNAL ];
        this.i18n = t.resolve(g);
    }
    toView(t, n, e) {
        if (!(t instanceof Date)) {
            return t;
        }
        return this.i18n.rt(t, n, e);
    }
}

RelativeTimeValueConverter.$au = {
    type: d,
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

const B = [ "textContent", "innerHTML", "prepend", "append" ];

const T = new Map([ [ "text", "textContent" ], [ "html", "innerHTML" ] ]);

const b = {
    optional: true
};

const x = {
    preempt: true
};

class TranslationBinding {
    static create({parser: t, observerLocator: n, context: e, controller: i, target: s, instruction: o, platform: a, isParameterContext: h}) {
        const u = this.B({
            observerLocator: n,
            context: e,
            controller: i,
            target: s,
            platform: a
        });
        const f = typeof o.from === "string" ? t.parse(o.from, c) : o.from;
        if (h) {
            u.useParameter(f);
        } else {
            const n = f instanceof r.CustomExpression ? t.parse(f.value, l) : undefined;
            u.ast = n || f;
        }
    }
    static B({observerLocator: t, context: n, controller: e, target: r, platform: i}) {
        let s = e.bindings && e.bindings.find((t => t instanceof TranslationBinding && t.target === r));
        if (!s) {
            s = new TranslationBinding(e, n, t, i, r);
            e.addBinding(s);
        }
        return s;
    }
    constructor(t, n, e, r, i) {
        this.isBound = false;
        this.T = B;
        this.C = null;
        this.parameter = null;
        this.boundFn = false;
        this.strict = true;
        this.l = n;
        this.I = t;
        this.target = i;
        this.i18n = n.get(g);
        this.p = r;
        this.P = new Set;
        this.oL = e;
        this.V = r.domQueue;
    }
    bind(t) {
        if (this.isBound) {
            return;
        }
        const n = this.ast;
        if (n == null) throw createMappedError(4e3);
        this.s = t;
        this.i18n.subscribeLocaleChange(this);
        this.F = i.astEvaluate(n, t, this, this);
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
        i.astUnbind(this.ast, this.s, this);
        this.parameter?.unbind();
        this.P.clear();
        if (this.C !== null) {
            this.C.cancel();
            this.C = null;
        }
        this.s = void 0;
        this.obs.clearAll();
    }
    handleChange(t, n) {
        this.obs.version++;
        this.F = i.astEvaluate(this.ast, this.s, this, this);
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
        this.parameter = new ParameterBinding(this, t, (() => this.updateTranslations()));
    }
    updateTranslations() {
        const e = this.i18n.evaluate(this.F, this.parameter?.value);
        const r = Object.create(null);
        const s = [];
        const o = this.C;
        this.P.clear();
        for (const o of e) {
            const e = o.value;
            const a = this.A(o.attributes);
            for (const o of a) {
                if (this.N(o)) {
                    r[o] = e;
                } else {
                    const r = n.CustomElement.for(this.target, b);
                    const a = r?.viewModel ? this.oL.getAccessor(r.viewModel, t.camelCase(o)) : this.oL.getAccessor(this.target, o);
                    const l = this.I.state !== u && (a.type & i.AccessorType.Layout) > 0;
                    if (l) {
                        s.push(new AccessorUpdateTask(a, e, this.target, o));
                    } else {
                        a.setValue(e, this.target, o);
                    }
                    this.P.add(a);
                }
            }
        }
        let a = false;
        if (Object.keys(r).length > 0) {
            a = this.I.state !== u;
            if (!a) {
                this.R(r);
            }
        }
        if (s.length > 0 || a) {
            this.C = this.V.queueTask((() => {
                this.C = null;
                for (const t of s) {
                    t.run();
                }
                if (a) {
                    this.R(r);
                }
            }), x);
        }
        o?.cancel();
    }
    A(t) {
        if (t.length === 0) {
            t = this.target.tagName === "IMG" ? [ "src" ] : [ "textContent" ];
        }
        for (const [n, e] of T) {
            const r = t.findIndex((t => t === n));
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
        const s = this.L(n, i, r);
        this.target.innerHTML = "";
        for (const n of t.toArray(s.content.childNodes)) {
            this.target.appendChild(n);
        }
    }
    L(t, n, e) {
        const r = this.p.document.createElement("template");
        this.M(r, t.prepend, n);
        if (!this.M(r, t.innerHTML ?? t.textContent, n)) {
            for (const t of e) {
                r.content.append(t);
            }
        }
        this.M(r, t.append, n);
        return r;
    }
    M(n, e, r) {
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
    _() {
        const t = this.F ??= "";
        const n = typeof t;
        if (n !== "string") {
            throw createMappedError(4002, t, n);
        }
    }
}

i.connectable(TranslationBinding, null);

n.mixinAstEvaluator(TranslationBinding);

n.mixingBindingLimited(TranslationBinding, (() => "updateTranslations"));

class AccessorUpdateTask {
    constructor(t, n, e, r) {
        this.accessor = t;
        this.v = n;
        this.el = e;
        this.attr = r;
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
        this.value = i.astEvaluate(this.ast, this.s, this, this);
        this.obs.clear();
        this.updater();
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
    }
}

(() => {
    i.connectable(ParameterBinding, null);
    n.mixinAstEvaluator(ParameterBinding);
})();

var C;

const w = "tpt";

const I = "t-params.bind";

class TranslationParametersAttributePattern {
    [(C = Symbol.metadata, I)](t, n) {
        return new e.AttrSyntax(t, n, "", I);
    }
}

TranslationParametersAttributePattern[C] = {
    [t.registrableMetadataKey]: e.AttributePattern.create([ {
        pattern: I,
        symbols: ""
    } ], TranslationParametersAttributePattern)
};

class TranslationParametersBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = w;
        this.mode = h;
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
    name: I
};

const y = /*@__PURE__*/ n.renderer(class TranslationParametersBindingRenderer {
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
            isParameterContext: true,
            platform: r
        });
    }
}, null);

const P = "tt";

class TranslationBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = P;
        this.mode = h;
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

const V = /*@__PURE__*/ n.renderer(class TranslationBindingRenderer {
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

const F = "tbt";

class TranslationBindBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = F;
        this.mode = h;
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

const _ = /*@__PURE__*/ n.renderer(class TranslationBindBindingRenderer {
    constructor() {
        this.target = F;
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
        this.signals = [ o.I18N_SIGNAL ];
        this.i18n = t.resolve(g);
    }
    toView(t, n) {
        return this.i18n.tr(t, n);
    }
}

n.ValueConverter.define("t", TranslationValueConverter);

const A = [ TranslationValueConverter, TranslationBindingBehavior ];

function coreComponents(r) {
    const i = r.translationAttributeAliases;
    const s = Array.isArray(i) ? i : [ "t" ];
    const o = [];
    const a = [];
    const l = [];
    const c = [];
    class TranslationAttributePattern {}
    class TranslationBindAttributePattern {}
    for (const t of s) {
        o.push({
            pattern: t,
            symbols: ""
        });
        TranslationAttributePattern.prototype[t] = function(n, r, i) {
            return new e.AttrSyntax(n, r, "", t);
        };
        const n = `${t}.bind`;
        a.push({
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
    const h = [ e.AttributePattern.create(o, TranslationAttributePattern), e.BindingCommand.define({
        name: "t",
        aliases: l
    }, TranslationBindingCommand), V, e.AttributePattern.create(a, TranslationBindAttributePattern), e.BindingCommand.define({
        name: "t.bind",
        aliases: c
    }, TranslationBindBindingCommand), _, TranslationParametersAttributePattern, TranslationParametersBindingCommand, y ];
    return {
        register(e) {
            const i = r.i18nextWrapper != null && typeof r.i18nextWrapper === "object" ? t.Registration.instance(p, r.i18nextWrapper) : t.Registration.singleton(p, I18nextWrapper);
            return e.register(t.Registration.callback(m, (() => r.initOptions)), n.AppTask.activating(g, (t => t.initPromise)), i, t.Registration.singleton(g, v), ...h, ...A);
        }
    };
}

const E = [ DateFormatValueConverter, DateFormatBindingBehavior ];

const N = [ NumberFormatValueConverter, NumberFormatBindingBehavior ];

const R = [ RelativeTimeValueConverter, RelativeTimeBindingBehavior ];

function createI18nConfiguration(t) {
    return {
        optionsProvider: t,
        register(n) {
            const e = {
                initOptions: Object.create(null)
            };
            t(e);
            return n.register(coreComponents(e), ...E, ...N, ...R);
        },
        customize(n) {
            return createI18nConfiguration(n || t);
        }
    };
}

const L = /*@__PURE__*/ createI18nConfiguration((() => {}));

exports.DateFormatBindingBehavior = DateFormatBindingBehavior;

exports.DateFormatValueConverter = DateFormatValueConverter;

exports.I18N = g;

exports.I18nConfiguration = L;

exports.I18nInitOptions = m;

exports.I18nKeyEvaluationResult = I18nKeyEvaluationResult;

exports.I18nService = v;

exports.II18nextWrapper = p;

exports.NumberFormatBindingBehavior = NumberFormatBindingBehavior;

exports.NumberFormatValueConverter = NumberFormatValueConverter;

exports.RelativeTimeBindingBehavior = RelativeTimeBindingBehavior;

exports.RelativeTimeValueConverter = RelativeTimeValueConverter;

exports.Signals = o;

exports.TranslationBindBindingCommand = TranslationBindBindingCommand;

exports.TranslationBindBindingInstruction = TranslationBindBindingInstruction;

exports.TranslationBindBindingRenderer = _;

exports.TranslationBindInstructionType = F;

exports.TranslationBinding = TranslationBinding;

exports.TranslationBindingBehavior = TranslationBindingBehavior;

exports.TranslationBindingCommand = TranslationBindingCommand;

exports.TranslationBindingInstruction = TranslationBindingInstruction;

exports.TranslationBindingRenderer = V;

exports.TranslationInstructionType = P;

exports.TranslationParametersAttributePattern = TranslationParametersAttributePattern;

exports.TranslationParametersBindingCommand = TranslationParametersBindingCommand;

exports.TranslationParametersBindingInstruction = TranslationParametersBindingInstruction;

exports.TranslationParametersBindingRenderer = y;

exports.TranslationParametersInstructionType = w;

exports.TranslationValueConverter = TranslationValueConverter;
//# sourceMappingURL=index.cjs.map
