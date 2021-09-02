export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "../../../platform/dist/native-modules/index.js";

import { BrowserPlatform as t } from "../../../platform-browser/dist/native-modules/index.js";

export { BrowserPlatform } from "../../../platform-browser/dist/native-modules/index.js";

import { Metadata as e, Protocol as i, getPrototypeChain as s, firstDefined as n, kebabCase as r, noop as o, DI as l, emptyArray as h, all as a, Registration as c, IPlatform as u, mergeArrays as f, fromDefinitionOrDefault as d, pascalCase as m, fromAnnotationOrTypeOrDefault as v, fromAnnotationOrDefinitionOrTypeOrDefault as p, IContainer as g, nextId as w, optional as b, InstanceProvider as x, isObject as y, ILogger as k, onResolve as C, resolveAll as A, camelCase as S, toArray as R, emptyObject as E, IServiceLocator as B, compareNumber as I, transient as T } from "../../../kernel/dist/native-modules/index.js";

import { BindingMode as D, subscriberCollection as P, withFlushQueue as O, connectable as $, registerAliases as L, ConnectableSwitcher as q, ProxyObservable as M, Scope as U, IObserverLocator as F, IExpressionParser as V, AccessScopeExpression as _, DelegationStrategy as j, BindingBehaviorExpression as N, BindingBehaviorFactory as W, PrimitiveLiteralExpression as H, bindingBehavior as z, BindingInterceptor as G, ISignaler as X, PropertyAccessor as K, INodeObserverLocator as Y, SetterObserver as Q, IDirtyChecker as Z, alias as J, applyMutationsToIndices as tt, getCollectionObserver as et, BindingContext as it, synchronizeIndices as st, valueConverter as nt } from "../../../runtime/dist/native-modules/index.js";

export { Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, BindingMode, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Char, CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, CustomExpression, DelegationStrategy, DirtyCheckProperty, DirtyCheckSettings, ExpressionKind, ExpressionType, ForOfStatement, HtmlLiteralExpression, IDirtyChecker, IExpressionParser, INodeObserverLocator, IObserverLocator, ISignaler, Interpolation, LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, ObserverLocator, OverrideContext, Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Scope, SetObserver, SetterObserver, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverter, ValueConverterDefinition, ValueConverterExpression, alias, applyMutationsToIndices, bindingBehavior, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, isIndexMap, observable, parseExpression, registerAliases, subscriberCollection, synchronizeIndices, valueConverter } from "../../../runtime/dist/native-modules/index.js";

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
***************************************************************************** */ function rt(t, e, i, s) {
    var n = arguments.length, r = n < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, i) : s, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(t, e, i, s); else for (var l = t.length - 1; l >= 0; l--) if (o = t[l]) r = (n < 3 ? o(r) : n > 3 ? o(e, i, r) : o(e, i)) || r;
    return n > 3 && r && Object.defineProperty(e, i, r), r;
}

function ot(t, e) {
    return function(i, s) {
        e(i, s, t);
    };
}

const lt = e.getOwn;

const ht = e.hasOwn;

const at = e.define;

const {annotation: ct, resource: ut} = i;

const ft = ct.keyFor;

const dt = ut.keyFor;

const mt = ut.appendTo;

const vt = ct.appendTo;

const pt = ct.getKeys;

function gt(t, e) {
    let i;
    function s(t, e) {
        if (arguments.length > 1) i.property = e;
        at(bt, BindableDefinition.create(e, i), t.constructor, e);
        vt(t.constructor, xt.keyFrom(e));
    }
    if (arguments.length > 1) {
        i = {};
        s(t, e);
        return;
    } else if ("string" === typeof t) {
        i = {};
        return s;
    }
    i = void 0 === t ? {} : t;
    return s;
}

function wt(t) {
    return t.startsWith(bt);
}

const bt = ft("bindable");

const xt = Object.freeze({
    name: bt,
    keyFrom: t => `${bt}:${t}`,
    from(...t) {
        const e = {};
        const i = Array.isArray;
        function s(t) {
            e[t] = BindableDefinition.create(t);
        }
        function n(t, i) {
            e[t] = i instanceof BindableDefinition ? i : BindableDefinition.create(t, i);
        }
        function r(t) {
            if (i(t)) t.forEach(s); else if (t instanceof BindableDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t[e])));
        }
        t.forEach(r);
        return e;
    },
    for(t) {
        let e;
        const i = {
            add(s) {
                let n;
                let r;
                if ("string" === typeof s) {
                    n = s;
                    r = {
                        property: n
                    };
                } else {
                    n = s.property;
                    r = s;
                }
                e = BindableDefinition.create(n, r);
                if (!ht(bt, t, n)) vt(t, xt.keyFrom(n));
                at(bt, e, t, n);
                return i;
            },
            mode(t) {
                e.mode = t;
                return i;
            },
            callback(t) {
                e.callback = t;
                return i;
            },
            attribute(t) {
                e.attribute = t;
                return i;
            },
            primary() {
                e.primary = true;
                return i;
            },
            set(t) {
                e.set = t;
                return i;
            }
        };
        return i;
    },
    getAll(t) {
        const e = bt.length + 1;
        const i = [];
        const n = s(t);
        let r = n.length;
        let o = 0;
        let l;
        let h;
        let a;
        let c;
        while (--r >= 0) {
            a = n[r];
            l = pt(a).filter(wt);
            h = l.length;
            for (c = 0; c < h; ++c) i[o++] = lt(bt, a, l[c].slice(e));
        }
        return i;
    }
});

class BindableDefinition {
    constructor(t, e, i, s, n, r) {
        this.attribute = t;
        this.callback = e;
        this.mode = i;
        this.primary = s;
        this.property = n;
        this.set = r;
    }
    static create(t, e = {}) {
        return new BindableDefinition(n(e.attribute, r(t)), n(e.callback, `${t}Changed`), n(e.mode, D.toView), n(e.primary, false), n(e.property, t), n(e.set, o));
    }
}

class BindableObserver {
    constructor(t, e, i, s, n) {
        this.set = s;
        this.$controller = n;
        this.v = void 0;
        this.ov = void 0;
        this.f = 0;
        const r = t[i];
        const l = t.propertyChanged;
        const h = this.t = "function" === typeof r;
        const a = this.i = "function" === typeof l;
        const c = this.hs = s !== o;
        let u;
        this.o = t;
        this.k = e;
        this.cb = h ? r : o;
        this.u = a ? l : o;
        if (void 0 === this.cb && !a && !c) this.iO = false; else {
            this.iO = true;
            u = t[e];
            this.v = c && void 0 !== u ? s(u) : u;
            this.C();
        }
    }
    get type() {
        return 1;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        if (this.hs) t = this.set(t);
        const i = this.v;
        if (this.iO) {
            if (Object.is(t, i)) return;
            this.v = t;
            this.ov = i;
            this.f = e;
            if (null == this.$controller || this.$controller.isBound) {
                if (this.t) this.cb.call(this.o, t, i, e);
                if (this.i) this.u.call(this.o, this.k, t, i, e);
            }
            this.queue.add(this);
        } else this.o[this.k] = t;
    }
    subscribe(t) {
        if (false === !this.iO) {
            this.iO = true;
            this.v = this.hs ? this.set(this.o[this.k]) : this.o[this.k];
            this.C();
        }
        this.subs.add(t);
    }
    flush() {
        yt = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, yt, this.f);
    }
    C() {
        Reflect.defineProperty(this.o, this.k, {
            enumerable: true,
            configurable: true,
            get: () => this.v,
            set: t => {
                this.setValue(t, 0);
            }
        });
    }
}

P(BindableObserver);

O(BindableObserver);

let yt;

class CharSpec {
    constructor(t, e, i, s) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = i;
        this.isInverted = s;
        if (s) switch (t.length) {
          case 0:
            this.has = this.A;
            break;

          case 1:
            this.has = this.R;
            break;

          default:
            this.has = this.B;
        } else switch (t.length) {
          case 0:
            this.has = this.I;
            break;

          case 1:
            this.has = this.T;
            break;

          default:
            this.has = this.P;
        }
    }
    equals(t) {
        return this.chars === t.chars && this.repeat === t.repeat && this.isSymbol === t.isSymbol && this.isInverted === t.isInverted;
    }
    P(t) {
        return this.chars.includes(t);
    }
    T(t) {
        return this.chars === t;
    }
    I(t) {
        return false;
    }
    B(t) {
        return !this.chars.includes(t);
    }
    R(t) {
        return this.chars !== t;
    }
    A(t) {
        return true;
    }
}

class Interpretation {
    constructor() {
        this.parts = h;
        this.O = "";
        this.$ = {};
        this.L = {};
    }
    get pattern() {
        const t = this.O;
        if ("" === t) return null; else return t;
    }
    set pattern(t) {
        if (null == t) {
            this.O = "";
            this.parts = h;
        } else {
            this.O = t;
            this.parts = this.L[t];
        }
    }
    append(t, e) {
        const i = this.$;
        if (void 0 === i[t]) i[t] = e; else i[t] += e;
    }
    next(t) {
        const e = this.$;
        let i;
        if (void 0 !== e[t]) {
            i = this.L;
            if (void 0 === i[t]) i[t] = [ e[t] ]; else i[t].push(e[t]);
            e[t] = void 0;
        }
    }
}

class State$1 {
    constructor(t, ...e) {
        this.charSpec = t;
        this.nextStates = [];
        this.types = null;
        this.isEndpoint = false;
        this.patterns = e;
    }
    get pattern() {
        return this.isEndpoint ? this.patterns[0] : null;
    }
    findChild(t) {
        const e = this.nextStates;
        const i = e.length;
        let s = null;
        let n = 0;
        for (;n < i; ++n) {
            s = e[n];
            if (t.equals(s.charSpec)) return s;
        }
        return null;
    }
    append(t, e) {
        const i = this.patterns;
        if (!i.includes(e)) i.push(e);
        let s = this.findChild(t);
        if (null == s) {
            s = new State$1(t, e);
            this.nextStates.push(s);
            if (t.repeat) s.nextStates.push(s);
        }
        return s;
    }
    findMatches(t, e) {
        const i = [];
        const s = this.nextStates;
        const n = s.length;
        let r = 0;
        let o = null;
        let l = 0;
        let h = 0;
        for (;l < n; ++l) {
            o = s[l];
            if (o.charSpec.has(t)) {
                i.push(o);
                r = o.patterns.length;
                h = 0;
                if (o.charSpec.isSymbol) for (;h < r; ++h) e.next(o.patterns[h]); else for (;h < r; ++h) e.append(o.patterns[h], t);
            }
        }
        return i;
    }
}

class StaticSegment {
    constructor(t) {
        this.text = t;
        const e = this.len = t.length;
        const i = this.specs = [];
        let s = 0;
        for (;e > s; ++s) i.push(new CharSpec(t[s], false, false, false));
    }
    eachChar(t) {
        const e = this.len;
        const i = this.specs;
        let s = 0;
        for (;e > s; ++s) t(i[s]);
    }
}

class DynamicSegment {
    constructor(t) {
        this.text = "PART";
        this.spec = new CharSpec(t, true, false, true);
    }
    eachChar(t) {
        t(this.spec);
    }
}

class SymbolSegment {
    constructor(t) {
        this.text = t;
        this.spec = new CharSpec(t, false, true, false);
    }
    eachChar(t) {
        t(this.spec);
    }
}

class SegmentTypes {
    constructor() {
        this.statics = 0;
        this.dynamics = 0;
        this.symbols = 0;
    }
}

const kt = l.createInterface("ISyntaxInterpreter", (t => t.singleton(SyntaxInterpreter)));

class SyntaxInterpreter {
    constructor() {
        this.rootState = new State$1(null);
        this.initialStates = [ this.rootState ];
    }
    add(t) {
        t = t.slice(0).sort(((t, e) => t.pattern > e.pattern ? 1 : -1));
        const e = t.length;
        let i;
        let s;
        let n;
        let r;
        let o;
        let l;
        let h;
        let a = 0;
        let c;
        while (e > a) {
            i = this.rootState;
            s = t[a];
            n = s.pattern;
            r = new SegmentTypes;
            o = this.parse(s, r);
            l = o.length;
            h = t => {
                i = i.append(t, n);
            };
            for (c = 0; l > c; ++c) o[c].eachChar(h);
            i.types = r;
            i.isEndpoint = true;
            ++a;
        }
    }
    interpret(t) {
        const e = new Interpretation;
        const i = t.length;
        let s = this.initialStates;
        let n = 0;
        let r;
        for (;n < i; ++n) {
            s = this.getNextStates(s, t.charAt(n), e);
            if (0 === s.length) break;
        }
        s = s.filter(Ct);
        if (s.length > 0) {
            s.sort(At);
            r = s[0];
            if (!r.charSpec.isSymbol) e.next(r.pattern);
            e.pattern = r.pattern;
        }
        return e;
    }
    getNextStates(t, e, i) {
        const s = [];
        let n = null;
        const r = t.length;
        let o = 0;
        for (;o < r; ++o) {
            n = t[o];
            s.push(...n.findMatches(e, i));
        }
        return s;
    }
    parse(t, e) {
        const i = [];
        const s = t.pattern;
        const n = s.length;
        const r = t.symbols;
        let o = 0;
        let l = 0;
        let h = "";
        while (o < n) {
            h = s.charAt(o);
            if (0 === r.length || !r.includes(h)) if (o === l) if ("P" === h && "PART" === s.slice(o, o + 4)) {
                l = o += 4;
                i.push(new DynamicSegment(r));
                ++e.dynamics;
            } else ++o; else ++o; else if (o !== l) {
                i.push(new StaticSegment(s.slice(l, o)));
                ++e.statics;
                l = o;
            } else {
                i.push(new SymbolSegment(s.slice(l, o + 1)));
                ++e.symbols;
                l = ++o;
            }
        }
        if (l !== o) {
            i.push(new StaticSegment(s.slice(l, o)));
            ++e.statics;
        }
        return i;
    }
}

function Ct(t) {
    return t.isEndpoint;
}

function At(t, e) {
    const i = t.types;
    const s = e.types;
    if (i.statics !== s.statics) return s.statics - i.statics;
    if (i.dynamics !== s.dynamics) return s.dynamics - i.dynamics;
    if (i.symbols !== s.symbols) return s.symbols - i.symbols;
    return 0;
}

class AttrSyntax {
    constructor(t, e, i, s) {
        this.rawName = t;
        this.rawValue = e;
        this.target = i;
        this.command = s;
    }
}

const St = l.createInterface("IAttributePattern");

const Rt = l.createInterface("IAttributeParser", (t => t.singleton(AttributeParser)));

class AttributeParser {
    constructor(t, e) {
        this.q = {};
        this.M = t;
        const i = this.U = {};
        const s = e.reduce(((t, e) => {
            const s = Tt(e.constructor);
            s.forEach((t => i[t.pattern] = e));
            return t.concat(s);
        }), h);
        t.add(s);
    }
    parse(t, e) {
        let i = this.q[t];
        if (null == i) i = this.q[t] = this.M.interpret(t);
        const s = i.pattern;
        if (null == s) return new AttrSyntax(t, e, t, null); else return this.U[s][s](t, e, i.parts);
    }
}

AttributeParser.inject = [ kt, a(St) ];

function Et(...t) {
    return function e(i) {
        return Dt.define(t, i);
    };
}

class AttributePatternResourceDefinition {
    constructor(t) {
        this.Type = t;
        this.name = void 0;
    }
    register(t) {
        c.singleton(St, this.Type).register(t);
    }
}

const Bt = dt("attribute-pattern");

const It = "attribute-pattern-definitions";

const Tt = t => i.annotation.get(t, It);

const Dt = Object.freeze({
    name: Bt,
    definitionAnnotationKey: It,
    define(t, e) {
        const s = new AttributePatternResourceDefinition(e);
        at(Bt, s, e);
        mt(e, Bt);
        i.annotation.set(e, It, t);
        vt(e, It);
        return e;
    },
    getPatternDefinitions: Tt
});

let Pt = class DotSeparatedAttributePattern {
    "PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[1]);
    }
    "PART.PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[2]);
    }
};

Pt = rt([ Et({
    pattern: "PART.PART",
    symbols: "."
}, {
    pattern: "PART.PART.PART",
    symbols: "."
}) ], Pt);

let Ot = class RefAttributePattern {
    ref(t, e, i) {
        return new AttrSyntax(t, e, "element", "ref");
    }
    "PART.ref"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "ref");
    }
};

Ot = rt([ Et({
    pattern: "ref",
    symbols: ""
}, {
    pattern: "PART.ref",
    symbols: "."
}) ], Ot);

let $t = class ColonPrefixedBindAttributePattern {
    ":PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "bind");
    }
};

$t = rt([ Et({
    pattern: ":PART",
    symbols: ":"
}) ], $t);

let Lt = class AtPrefixedTriggerAttributePattern {
    "@PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "trigger");
    }
};

Lt = rt([ Et({
    pattern: "@PART",
    symbols: "@"
}) ], Lt);

let qt = class SpreadAttributePattern {
    "...$attrs"(t, e, i) {
        return new AttrSyntax(t, e, "", "...$attrs");
    }
};

qt = rt([ Et({
    pattern: "...$attrs",
    symbols: ""
}) ], qt);

const Mt = () => Object.create(null);

const Ut = Object.prototype.hasOwnProperty;

const Ft = Mt();

const Vt = (t, e, i) => {
    if (true === Ft[e]) return true;
    if ("string" !== typeof e) return false;
    const s = e.slice(0, 5);
    return Ft[e] = "aria-" === s || "data-" === s || i.isStandardSvgAttribute(t, e);
};

const _t = u;

const jt = l.createInterface("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

function Nt(t) {
    const e = Mt();
    let i;
    for (i of t) e[i] = true;
    return e;
}

class SVGAnalyzer {
    constructor(t) {
        this.F = Object.assign(Mt(), {
            a: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "target", "transform", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            altGlyph: Nt([ "class", "dx", "dy", "externalResourcesRequired", "format", "glyphRef", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            altglyph: Mt(),
            altGlyphDef: Nt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphdef: Mt(),
            altGlyphItem: Nt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphitem: Mt(),
            animate: Nt([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateColor: Nt([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateMotion: Nt([ "accumulate", "additive", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keyPoints", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "origin", "path", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "rotate", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateTransform: Nt([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "type", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            circle: Nt([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "r", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            clipPath: Nt([ "class", "clipPathUnits", "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            "color-profile": Nt([ "id", "local", "name", "rendering-intent", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            cursor: Nt([ "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            defs: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            desc: Nt([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            ellipse: Nt([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            feBlend: Nt([ "class", "height", "id", "in", "in2", "mode", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feColorMatrix: Nt([ "class", "height", "id", "in", "result", "style", "type", "values", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComponentTransfer: Nt([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComposite: Nt([ "class", "height", "id", "in", "in2", "k1", "k2", "k3", "k4", "operator", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feConvolveMatrix: Nt([ "bias", "class", "divisor", "edgeMode", "height", "id", "in", "kernelMatrix", "kernelUnitLength", "order", "preserveAlpha", "result", "style", "targetX", "targetY", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDiffuseLighting: Nt([ "class", "diffuseConstant", "height", "id", "in", "kernelUnitLength", "result", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDisplacementMap: Nt([ "class", "height", "id", "in", "in2", "result", "scale", "style", "width", "x", "xChannelSelector", "xml:base", "xml:lang", "xml:space", "y", "yChannelSelector" ]),
            feDistantLight: Nt([ "azimuth", "elevation", "id", "xml:base", "xml:lang", "xml:space" ]),
            feFlood: Nt([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feFuncA: Nt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncB: Nt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncG: Nt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncR: Nt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feGaussianBlur: Nt([ "class", "height", "id", "in", "result", "stdDeviation", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feImage: Nt([ "class", "externalResourcesRequired", "height", "id", "preserveAspectRatio", "result", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMerge: Nt([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMergeNode: Nt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            feMorphology: Nt([ "class", "height", "id", "in", "operator", "radius", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feOffset: Nt([ "class", "dx", "dy", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            fePointLight: Nt([ "id", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feSpecularLighting: Nt([ "class", "height", "id", "in", "kernelUnitLength", "result", "specularConstant", "specularExponent", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feSpotLight: Nt([ "id", "limitingConeAngle", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feTile: Nt([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feTurbulence: Nt([ "baseFrequency", "class", "height", "id", "numOctaves", "result", "seed", "stitchTiles", "style", "type", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            filter: Nt([ "class", "externalResourcesRequired", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            font: Nt([ "class", "externalResourcesRequired", "horiz-adv-x", "horiz-origin-x", "horiz-origin-y", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            "font-face": Nt([ "accent-height", "alphabetic", "ascent", "bbox", "cap-height", "descent", "font-family", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "hanging", "id", "ideographic", "mathematical", "overline-position", "overline-thickness", "panose-1", "slope", "stemh", "stemv", "strikethrough-position", "strikethrough-thickness", "underline-position", "underline-thickness", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "widths", "x-height", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-format": Nt([ "id", "string", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-name": Nt([ "id", "name", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-src": Nt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-uri": Nt([ "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            foreignObject: Nt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            g: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            glyph: Nt([ "arabic-form", "class", "d", "glyph-name", "horiz-adv-x", "id", "lang", "orientation", "style", "unicode", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            glyphRef: Nt([ "class", "dx", "dy", "format", "glyphRef", "id", "style", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            glyphref: Mt(),
            hkern: Nt([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ]),
            image: Nt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            line: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "x1", "x2", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            linearGradient: Nt([ "class", "externalResourcesRequired", "gradientTransform", "gradientUnits", "id", "spreadMethod", "style", "x1", "x2", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            marker: Nt([ "class", "externalResourcesRequired", "id", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            mask: Nt([ "class", "externalResourcesRequired", "height", "id", "maskContentUnits", "maskUnits", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            metadata: Nt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "missing-glyph": Nt([ "class", "d", "horiz-adv-x", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            mpath: Nt([ "externalResourcesRequired", "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            path: Nt([ "class", "d", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "pathLength", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            pattern: Nt([ "class", "externalResourcesRequired", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            polygon: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            polyline: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            radialGradient: Nt([ "class", "cx", "cy", "externalResourcesRequired", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "spreadMethod", "style", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            rect: Nt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            script: Nt([ "externalResourcesRequired", "id", "type", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            set: Nt([ "attributeName", "attributeType", "begin", "dur", "end", "externalResourcesRequired", "fill", "id", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            stop: Nt([ "class", "id", "offset", "style", "xml:base", "xml:lang", "xml:space" ]),
            style: Nt([ "id", "media", "title", "type", "xml:base", "xml:lang", "xml:space" ]),
            svg: Nt([ "baseProfile", "class", "contentScriptType", "contentStyleType", "externalResourcesRequired", "height", "id", "onabort", "onactivate", "onclick", "onerror", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onresize", "onscroll", "onunload", "onzoom", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "version", "viewBox", "width", "x", "xml:base", "xml:lang", "xml:space", "y", "zoomAndPan" ]),
            switch: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            symbol: Nt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            text: Nt([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "transform", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            textPath: Nt([ "class", "externalResourcesRequired", "id", "lengthAdjust", "method", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "textLength", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            title: Nt([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            tref: Nt([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            tspan: Nt([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            use: Nt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            view: Nt([ "externalResourcesRequired", "id", "preserveAspectRatio", "viewBox", "viewTarget", "xml:base", "xml:lang", "xml:space", "zoomAndPan" ]),
            vkern: Nt([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ])
        });
        this.V = Nt([ "a", "altGlyph", "animate", "animateColor", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood", "feGaussianBlur", "feImage", "feMerge", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence", "filter", "font", "foreignObject", "g", "glyph", "glyphRef", "image", "line", "linearGradient", "marker", "mask", "missing-glyph", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use" ]);
        this._ = Nt([ "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "clip", "color-interpolation-filters", "color-interpolation", "color-profile", "color-rendering", "color", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "fill", "filter", "flood-color", "flood-opacity", "font-family", "font-size-adjust", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "stroke", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ]);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if ("altglyph" === e.firstElementChild.nodeName) {
            const t = this.F;
            let e = t.altGlyph;
            t.altGlyph = t.altglyph;
            t.altglyph = e;
            e = t.altGlyphDef;
            t.altGlyphDef = t.altglyphdef;
            t.altglyphdef = e;
            e = t.altGlyphItem;
            t.altGlyphItem = t.altglyphitem;
            t.altglyphitem = e;
            e = t.glyphRef;
            t.glyphRef = t.glyphref;
            t.glyphref = e;
        }
    }
    static register(t) {
        return c.singleton(jt, this).register(t);
    }
    isStandardSvgAttribute(t, e) {
        var i;
        if (!(t instanceof this.SVGElement)) return false;
        return true === this.V[t.nodeName] && true === this._[e] || true === (null === (i = this.F[t.nodeName]) || void 0 === i ? void 0 : i[e]);
    }
}

SVGAnalyzer.inject = [ _t ];

const Wt = l.createInterface("IAttrMapper", (t => t.singleton(AttrMapper)));

class AttrMapper {
    constructor(t) {
        this.svg = t;
        this.fns = [];
        this.j = Mt();
        this.N = Mt();
        this.useMapping({
            LABEL: {
                for: "htmlFor"
            },
            IMG: {
                usemap: "useMap"
            },
            INPUT: {
                maxlength: "maxLength",
                minlength: "minLength",
                formaction: "formAction",
                formenctype: "formEncType",
                formmethod: "formMethod",
                formnovalidate: "formNoValidate",
                formtarget: "formTarget",
                inputmode: "inputMode"
            },
            TEXTAREA: {
                maxlength: "maxLength"
            },
            TD: {
                rowspan: "rowSpan",
                colspan: "colSpan"
            },
            TH: {
                rowspan: "rowSpan",
                colspan: "colSpan"
            }
        });
        this.useGlobalMapping({
            accesskey: "accessKey",
            contenteditable: "contentEditable",
            tabindex: "tabIndex",
            textcontent: "textContent",
            innerhtml: "innerHTML",
            scrolltop: "scrollTop",
            scrollleft: "scrollLeft",
            readonly: "readOnly"
        });
    }
    static get inject() {
        return [ jt ];
    }
    useMapping(t) {
        var e;
        var i;
        let s;
        let n;
        let r;
        let o;
        for (r in t) {
            s = t[r];
            n = null !== (e = (i = this.j)[r]) && void 0 !== e ? e : i[r] = Mt();
            for (o in s) {
                if (void 0 !== n[o]) throw zt(o, r);
                n[o] = s[o];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.N;
        for (const i in t) {
            if (void 0 !== e[i]) throw zt(i, "*");
            e[i] = t[i];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return Ht(t, e) || this.fns.length > 0 && this.fns.some((i => i(t, e)));
    }
    map(t, e) {
        var i, s, n;
        return null !== (n = null !== (s = null === (i = this.j[t.nodeName]) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : this.N[e]) && void 0 !== n ? n : Vt(t, e, this.svg) ? e : null;
    }
}

function Ht(t, e) {
    switch (t.nodeName) {
      case "INPUT":
        switch (t.type) {
          case "checkbox":
          case "radio":
            return "checked" === e;

          default:
            return "value" === e || "files" === e || "value-as-number" === e || "value-as-date" === e;
        }

      case "TEXTAREA":
      case "SELECT":
        return "value" === e;

      default:
        switch (e) {
          case "textcontent":
          case "innerhtml":
            return t.hasAttribute("contenteditable");

          case "scrolltop":
          case "scrollleft":
            return true;

          default:
            return false;
        }
    }
}

function zt(t, e) {
    return new Error(`Attribute ${t} has been already registered for ${"*" === e ? "all elements" : `<${e}/>`}`);
}

class CallBinding {
    constructor(t, e, i, s, n) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.locator = n;
        this.interceptor = this;
        this.isBound = false;
        this.targetObserver = s.getAccessor(e, i);
    }
    callSource(t) {
        const e = this.$scope.overrideContext;
        e.$event = t;
        const i = this.sourceExpression.evaluate(8, this.$scope, this.locator, null);
        Reflect.deleteProperty(e, "$event");
        return i;
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.$scope = e;
        if (this.sourceExpression.hasBind) this.sourceExpression.bind(t, e, this.interceptor);
        this.targetObserver.setValue((t => this.interceptor.callSource(t)), t, this.target, this.targetProperty);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        this.targetObserver.setValue(null, t, this.target, this.targetProperty);
        this.isBound = false;
    }
    observe(t, e) {
        return;
    }
    handleChange(t, e, i) {
        return;
    }
}

class AttributeObserver {
    constructor(t, e, i) {
        this.type = 2 | 1 | 4;
        this.v = null;
        this.ov = null;
        this.W = false;
        this.f = 0;
        this.o = t;
        this.H = e;
        this.G = i;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        this.v = t;
        this.W = t !== this.ov;
        if (0 === (256 & e)) this.X();
    }
    X() {
        if (this.W) {
            this.W = false;
            this.ov = this.v;
            switch (this.G) {
              case "class":
                this.o.classList.toggle(this.H, !!this.v);
                break;

              case "style":
                {
                    let t = "";
                    let e = this.v;
                    if ("string" === typeof e && e.includes("!important")) {
                        t = "important";
                        e = e.replace("!important", "");
                    }
                    this.o.style.setProperty(this.H, e, t);
                    break;
                }

              default:
                if (null == this.v) this.o.removeAttribute(this.G); else this.o.setAttribute(this.G, String(this.v));
            }
        }
    }
    handleMutation(t) {
        let e = false;
        for (let i = 0, s = t.length; s > i; ++i) {
            const s = t[i];
            if ("attributes" === s.type && s.attributeName === this.H) {
                e = true;
                break;
            }
        }
        if (e) {
            let t;
            switch (this.G) {
              case "class":
                t = this.o.classList.contains(this.H);
                break;

              case "style":
                t = this.o.style.getPropertyValue(this.H);
                break;

              default:
                throw new Error(`AUR0651:${this.G}`);
            }
            if (t !== this.v) {
                this.ov = this.v;
                this.v = t;
                this.W = false;
                this.f = 0;
                this.queue.add(this);
            }
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.v = this.ov = this.o.getAttribute(this.H);
            Gt(this.o.ownerDocument.defaultView.MutationObserver, this.o, this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) Xt(this.o, this);
    }
    flush() {
        Qt = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Qt, this.f);
    }
}

P(AttributeObserver);

O(AttributeObserver);

const Gt = (t, e, i) => {
    if (void 0 === e.$eMObs) e.$eMObs = new Set;
    if (void 0 === e.$mObs) (e.$mObs = new t(Kt)).observe(e, {
        attributes: true
    });
    e.$eMObs.add(i);
};

const Xt = (t, e) => {
    const i = t.$eMObs;
    if (i && i.delete(e)) {
        if (0 === i.size) {
            t.$mObs.disconnect();
            t.$mObs = void 0;
        }
        return true;
    }
    return false;
};

const Kt = t => {
    t[0].target.$eMObs.forEach(Yt, t);
};

function Yt(t) {
    t.handleMutation(this);
}

let Qt;

class BindingTargetSubscriber {
    constructor(t) {
        this.b = t;
    }
    handleChange(t, e, i) {
        const s = this.b;
        if (t !== s.sourceExpression.evaluate(i, s.$scope, s.locator, null)) s.updateSource(t, i);
    }
}

const {oneTime: Zt, toView: Jt, fromView: te} = D;

const ee = Jt | Zt;

const ie = {
    reusable: false,
    preempt: true
};

class AttributeBinding {
    constructor(t, e, i, s, n, r, o) {
        this.sourceExpression = t;
        this.targetAttribute = i;
        this.targetProperty = s;
        this.mode = n;
        this.locator = o;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = null;
        this.task = null;
        this.targetSubscriber = null;
        this.persistentFlags = 0;
        this.value = void 0;
        this.target = e;
        this.p = o.get(_t);
        this.oL = r;
    }
    updateTarget(t, e) {
        e |= this.persistentFlags;
        this.targetObserver.setValue(t, e, this.target, this.targetProperty);
    }
    updateSource(t, e) {
        e |= this.persistentFlags;
        this.sourceExpression.assign(e, this.$scope, this.locator, t);
    }
    handleChange(t, e, i) {
        if (!this.isBound) return;
        i |= this.persistentFlags;
        const s = this.mode;
        const n = this.interceptor;
        const r = this.sourceExpression;
        const o = this.$scope;
        const l = this.locator;
        const h = this.targetObserver;
        const a = 0 === (2 & i) && (4 & h.type) > 0;
        let c = false;
        let u;
        if (10082 !== r.$kind || this.obs.count > 1) {
            c = 0 === (s & Zt);
            if (c) this.obs.version++;
            t = r.evaluate(i, o, l, n);
            if (c) this.obs.clear();
        }
        if (t !== this.value) {
            this.value = t;
            if (a) {
                u = this.task;
                this.task = this.p.domWriteQueue.queueTask((() => {
                    this.task = null;
                    n.updateTarget(t, i);
                }), ie);
                null === u || void 0 === u ? void 0 : u.cancel();
            } else n.updateTarget(t, i);
        }
    }
    $bind(t, e) {
        var i;
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.persistentFlags = 961 & t;
        this.$scope = e;
        let s = this.sourceExpression;
        if (s.hasBind) s.bind(t, e, this.interceptor);
        let n = this.targetObserver;
        if (!n) n = this.targetObserver = new AttributeObserver(this.target, this.targetProperty, this.targetAttribute);
        s = this.sourceExpression;
        const r = this.mode;
        const o = this.interceptor;
        let l = false;
        if (r & ee) {
            l = (r & Jt) > 0;
            o.updateTarget(this.value = s.evaluate(t, e, this.locator, l ? o : null), t);
        }
        if (r & te) n.subscribe(null !== (i = this.targetSubscriber) && void 0 !== i ? i : this.targetSubscriber = new BindingTargetSubscriber(o));
        this.isBound = true;
    }
    $unbind(t) {
        var e;
        if (!this.isBound) return;
        this.persistentFlags = 0;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = null;
        this.value = void 0;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        null === (e = this.task) || void 0 === e ? void 0 : e.cancel();
        this.task = null;
        this.obs.clearAll();
        this.isBound = false;
    }
}

$(AttributeBinding);

const {toView: se} = D;

const ne = {
    reusable: false,
    preempt: true
};

class InterpolationBinding {
    constructor(t, e, i, s, n, r, o) {
        this.interpolation = e;
        this.target = i;
        this.targetProperty = s;
        this.mode = n;
        this.locator = r;
        this.taskQueue = o;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.oL = t;
        this.targetObserver = t.getAccessor(i, s);
        const l = e.expressions;
        const h = this.partBindings = Array(l.length);
        const a = l.length;
        let c = 0;
        for (;a > c; ++c) h[c] = new InterpolationPartBinding(l[c], i, s, r, t, this);
    }
    updateTarget(t, e) {
        const i = this.partBindings;
        const s = this.interpolation.parts;
        const n = i.length;
        let r = "";
        let o = 0;
        if (1 === n) r = s[0] + i[0].value + s[1]; else {
            r = s[0];
            for (;n > o; ++o) r += i[o].value + s[o + 1];
        }
        const l = this.targetObserver;
        const h = 0 === (2 & e) && (4 & l.type) > 0;
        let a;
        if (h) {
            a = this.task;
            this.task = this.taskQueue.queueTask((() => {
                this.task = null;
                l.setValue(r, e, this.target, this.targetProperty);
            }), ne);
            null === a || void 0 === a ? void 0 : a.cancel();
            a = null;
        } else l.setValue(r, e, this.target, this.targetProperty);
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(t);
        }
        this.isBound = true;
        this.$scope = e;
        const i = this.partBindings;
        const s = i.length;
        let n = 0;
        for (;s > n; ++n) i[n].$bind(t, e);
        this.updateTarget(void 0, t);
    }
    $unbind(t) {
        var e;
        if (!this.isBound) return;
        this.isBound = false;
        this.$scope = void 0;
        const i = this.partBindings;
        const s = i.length;
        let n = 0;
        for (;s > n; ++n) i[n].interceptor.$unbind(t);
        null === (e = this.task) || void 0 === e ? void 0 : e.cancel();
        this.task = null;
    }
}

class InterpolationPartBinding {
    constructor(t, e, i, s, n, r) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.locator = s;
        this.owner = r;
        this.interceptor = this;
        this.mode = D.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
        this.oL = n;
    }
    handleChange(t, e, i) {
        if (!this.isBound) return;
        const s = this.sourceExpression;
        const n = this.obs;
        const r = 10082 === s.$kind && 1 === n.count;
        let o = false;
        if (!r) {
            o = (this.mode & se) > 0;
            if (o) n.version++;
            t = s.evaluate(i, this.$scope, this.locator, o ? this.interceptor : null);
            if (o) n.clear();
        }
        if (t != this.value) {
            this.value = t;
            if (t instanceof Array) this.observeCollection(t);
            this.owner.updateTarget(t, i);
        }
    }
    handleCollectionChange(t, e) {
        this.owner.updateTarget(void 0, e);
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(t);
        }
        this.isBound = true;
        this.$scope = e;
        if (this.sourceExpression.hasBind) this.sourceExpression.bind(t, e, this.interceptor);
        this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & se) > 0 ? this.interceptor : null);
        if (this.value instanceof Array) this.observeCollection(this.value);
    }
    $unbind(t) {
        if (!this.isBound) return;
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        this.obs.clearAll();
    }
}

$(InterpolationPartBinding);

class ContentBinding {
    constructor(t, e, i, s, n, r) {
        this.sourceExpression = t;
        this.target = e;
        this.locator = i;
        this.p = n;
        this.strict = r;
        this.interceptor = this;
        this.mode = D.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
        this.oL = s;
    }
    updateTarget(t, e) {
        var i, s;
        const n = this.target;
        const r = this.p.Node;
        const o = this.value;
        this.value = t;
        if (o instanceof r) null === (i = o.parentNode) || void 0 === i ? void 0 : i.removeChild(o);
        if (t instanceof r) {
            n.textContent = "";
            null === (s = n.parentNode) || void 0 === s ? void 0 : s.insertBefore(t, n);
        } else n.textContent = String(t);
    }
    handleChange(t, e, i) {
        var s;
        if (!this.isBound) return;
        const n = this.sourceExpression;
        const r = this.obs;
        const o = 10082 === n.$kind && 1 === r.count;
        let l = false;
        if (!o) {
            l = (this.mode & se) > 0;
            if (l) r.version++;
            i |= this.strict ? 1 : 0;
            t = n.evaluate(i, this.$scope, this.locator, l ? this.interceptor : null);
            if (l) r.clear();
        }
        if (t === this.value) {
            null === (s = this.task) || void 0 === s ? void 0 : s.cancel();
            this.task = null;
            return;
        }
        const h = 0 === (2 & i);
        if (h) this.queueUpdate(t, i); else this.updateTarget(t, i);
    }
    handleCollectionChange() {
        this.queueUpdate(this.value, 0);
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(t);
        }
        this.isBound = true;
        this.$scope = e;
        if (this.sourceExpression.hasBind) this.sourceExpression.bind(t, e, this.interceptor);
        t |= this.strict ? 1 : 0;
        const i = this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & se) > 0 ? this.interceptor : null);
        if (i instanceof Array) this.observeCollection(i);
        this.updateTarget(i, t);
    }
    $unbind(t) {
        var e;
        if (!this.isBound) return;
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        this.obs.clearAll();
        null === (e = this.task) || void 0 === e ? void 0 : e.cancel();
        this.task = null;
    }
    queueUpdate(t, e) {
        const i = this.task;
        this.task = this.p.domWriteQueue.queueTask((() => {
            this.task = null;
            this.updateTarget(t, e);
        }), ne);
        null === i || void 0 === i ? void 0 : i.cancel();
    }
}

$(ContentBinding);

class LetBinding {
    constructor(t, e, i, s, n = false) {
        this.sourceExpression = t;
        this.targetProperty = e;
        this.locator = s;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.target = null;
        this.oL = i;
        this.K = n;
    }
    handleChange(t, e, i) {
        if (!this.isBound) return;
        const s = this.target;
        const n = this.targetProperty;
        const r = s[n];
        this.obs.version++;
        t = this.sourceExpression.evaluate(i, this.$scope, this.locator, this.interceptor);
        this.obs.clear();
        if (t !== r) s[n] = t;
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.$scope = e;
        this.target = this.K ? e.bindingContext : e.overrideContext;
        const i = this.sourceExpression;
        if (i.hasBind) i.bind(t, e, this.interceptor);
        this.target[this.targetProperty] = this.sourceExpression.evaluate(2 | t, e, this.locator, this.interceptor);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        const e = this.sourceExpression;
        if (e.hasUnbind) e.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        this.obs.clearAll();
        this.isBound = false;
    }
}

$(LetBinding);

const {oneTime: re, toView: oe, fromView: le} = D;

const he = oe | re;

const ae = {
    reusable: false,
    preempt: true
};

class PropertyBinding {
    constructor(t, e, i, s, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.mode = s;
        this.locator = r;
        this.taskQueue = o;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.targetObserver = void 0;
        this.persistentFlags = 0;
        this.task = null;
        this.targetSubscriber = null;
        this.oL = n;
    }
    updateTarget(t, e) {
        e |= this.persistentFlags;
        this.targetObserver.setValue(t, e, this.target, this.targetProperty);
    }
    updateSource(t, e) {
        e |= this.persistentFlags;
        this.sourceExpression.assign(e, this.$scope, this.locator, t);
    }
    handleChange(t, e, i) {
        if (!this.isBound) return;
        i |= this.persistentFlags;
        const s = 0 === (2 & i) && (4 & this.targetObserver.type) > 0;
        const n = this.obs;
        let r = false;
        if (10082 !== this.sourceExpression.$kind || n.count > 1) {
            r = this.mode > re;
            if (r) n.version++;
            t = this.sourceExpression.evaluate(i, this.$scope, this.locator, this.interceptor);
            if (r) n.clear();
        }
        if (s) {
            ce = this.task;
            this.task = this.taskQueue.queueTask((() => {
                this.interceptor.updateTarget(t, i);
                this.task = null;
            }), ae);
            null === ce || void 0 === ce ? void 0 : ce.cancel();
            ce = null;
        } else this.interceptor.updateTarget(t, i);
    }
    $bind(t, e) {
        var i;
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        t |= 1;
        this.persistentFlags = 961 & t;
        this.$scope = e;
        let s = this.sourceExpression;
        if (s.hasBind) s.bind(t, e, this.interceptor);
        const n = this.oL;
        const r = this.mode;
        let o = this.targetObserver;
        if (!o) {
            if (r & le) o = n.getObserver(this.target, this.targetProperty); else o = n.getAccessor(this.target, this.targetProperty);
            this.targetObserver = o;
        }
        s = this.sourceExpression;
        const l = this.interceptor;
        const h = (r & oe) > 0;
        if (r & he) l.updateTarget(s.evaluate(t, e, this.locator, h ? l : null), t);
        if (r & le) {
            o.subscribe(null !== (i = this.targetSubscriber) && void 0 !== i ? i : this.targetSubscriber = new BindingTargetSubscriber(l));
            if (!h) l.updateSource(o.getValue(this.target, this.targetProperty), t);
        }
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        this.persistentFlags = 0;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        ce = this.task;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        if (null != ce) {
            ce.cancel();
            ce = this.task = null;
        }
        this.obs.clearAll();
        this.isBound = false;
    }
}

$(PropertyBinding);

let ce = null;

class RefBinding {
    constructor(t, e, i) {
        this.sourceExpression = t;
        this.target = e;
        this.locator = i;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.$scope = e;
        if (this.sourceExpression.hasBind) this.sourceExpression.bind(t, e, this);
        this.sourceExpression.assign(t, this.$scope, this.locator, this.target);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        let e = this.sourceExpression;
        if (e.evaluate(t, this.$scope, this.locator, null) === this.target) e.assign(t, this.$scope, this.locator, null);
        e = this.sourceExpression;
        if (e.hasUnbind) e.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        this.isBound = false;
    }
    observe(t, e) {
        return;
    }
    handleChange(t, e, i) {
        return;
    }
}

const ue = l.createInterface("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(c.instance(ue, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return null === t ? e() : e(this.c.get(t));
    }
}

const fe = Object.freeze({
    beforeCreate: de("beforeCreate"),
    hydrating: de("hydrating"),
    hydrated: de("hydrated"),
    beforeActivate: de("beforeActivate"),
    afterActivate: de("afterActivate"),
    beforeDeactivate: de("beforeDeactivate"),
    afterDeactivate: de("afterDeactivate")
});

function de(t) {
    function e(e, i) {
        if ("function" === typeof i) return new $AppTask(t, e, i);
        return new $AppTask(t, null, e);
    }
    return e;
}

function me(t, e) {
    let i;
    function s(t, e) {
        if (arguments.length > 1) i.property = e;
        at(pe, ChildrenDefinition.create(e, i), t.constructor, e);
        vt(t.constructor, ge.keyFrom(e));
    }
    if (arguments.length > 1) {
        i = {};
        s(t, e);
        return;
    } else if ("string" === typeof t) {
        i = {};
        return s;
    }
    i = void 0 === t ? {} : t;
    return s;
}

function ve(t) {
    return t.startsWith(pe);
}

const pe = ft("children-observer");

const ge = Object.freeze({
    name: pe,
    keyFrom: t => `${pe}:${t}`,
    from(...t) {
        const e = {};
        const i = Array.isArray;
        function s(t) {
            e[t] = ChildrenDefinition.create(t);
        }
        function n(t, i) {
            e[t] = ChildrenDefinition.create(t, i);
        }
        function r(t) {
            if (i(t)) t.forEach(s); else if (t instanceof ChildrenDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t)));
        }
        t.forEach(r);
        return e;
    },
    getAll(t) {
        const e = pe.length + 1;
        const i = [];
        const n = s(t);
        let r = n.length;
        let o = 0;
        let l;
        let h;
        let a;
        while (--r >= 0) {
            a = n[r];
            l = pt(a).filter(ve);
            h = l.length;
            for (let t = 0; t < h; ++t) i[o++] = lt(pe, a, l[t].slice(e));
        }
        return i;
    }
});

const we = {
    childList: true
};

class ChildrenDefinition {
    constructor(t, e, i, s, n, r) {
        this.callback = t;
        this.property = e;
        this.options = i;
        this.query = s;
        this.filter = n;
        this.map = r;
    }
    static create(t, e = {}) {
        var i;
        return new ChildrenDefinition(n(e.callback, `${t}Changed`), n(e.property, t), null !== (i = e.options) && void 0 !== i ? i : we, e.query, e.filter, e.map);
    }
}

class ChildrenObserver {
    constructor(t, e, i, s, n = be, r = xe, o = ye, l) {
        this.controller = t;
        this.obj = e;
        this.propertyKey = i;
        this.query = n;
        this.filter = r;
        this.map = o;
        this.options = l;
        this.observing = false;
        this.children = void 0;
        this.observer = void 0;
        this.callback = e[s];
        Reflect.defineProperty(this.obj, this.propertyKey, {
            enumerable: true,
            configurable: true,
            get: () => this.getValue(),
            set: () => {}
        });
    }
    getValue() {
        return this.observing ? this.children : this.get();
    }
    setValue(t) {}
    start() {
        var t;
        if (!this.observing) {
            this.observing = true;
            this.children = this.get();
            (null !== (t = this.observer) && void 0 !== t ? t : this.observer = new this.controller.host.ownerDocument.defaultView.MutationObserver((() => {
                this.Y();
            }))).observe(this.controller.host, this.options);
        }
    }
    stop() {
        if (this.observing) {
            this.observing = false;
            this.observer.disconnect();
            this.children = h;
        }
    }
    Y() {
        this.children = this.get();
        if (void 0 !== this.callback) this.callback.call(this.obj);
        this.subs.notify(this.children, void 0, 0);
    }
    get() {
        return Ce(this.controller, this.query, this.filter, this.map);
    }
}

P()(ChildrenObserver);

function be(t) {
    return t.host.childNodes;
}

function xe(t, e, i) {
    return !!i;
}

function ye(t, e, i) {
    return i;
}

const ke = {
    optional: true
};

function Ce(t, e, i, s) {
    var n;
    const r = e(t);
    const o = r.length;
    const l = [];
    let h;
    let a;
    let c;
    let u = 0;
    for (;u < o; ++u) {
        h = r[u];
        a = Ke.for(h, ke);
        c = null !== (n = null === a || void 0 === a ? void 0 : a.viewModel) && void 0 !== n ? n : null;
        if (i(h, a, c)) l.push(s(h, a, c));
    }
    return l;
}

function Ae(t) {
    return function(e) {
        return Ie.define(t, e);
    };
}

function Se(t) {
    return function(e) {
        return Ie.define("string" === typeof t ? {
            isTemplateController: true,
            name: t
        } : {
            isTemplateController: true,
            ...t
        }, e);
    };
}

class CustomAttributeDefinition {
    constructor(t, e, i, s, n, r, o, l, h) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.defaultBindingMode = n;
        this.isTemplateController = r;
        this.bindables = o;
        this.noMultiBindings = l;
        this.watches = h;
    }
    get type() {
        return 2;
    }
    static create(t, e) {
        let i;
        let s;
        if ("string" === typeof t) {
            i = t;
            s = {
                name: i
            };
        } else {
            i = t.name;
            s = t;
        }
        return new CustomAttributeDefinition(e, n(Be(e, "name"), i), f(Be(e, "aliases"), s.aliases, e.aliases), Ie.keyFrom(i), n(Be(e, "defaultBindingMode"), s.defaultBindingMode, e.defaultBindingMode, D.toView), n(Be(e, "isTemplateController"), s.isTemplateController, e.isTemplateController, false), xt.from(...xt.getAll(e), Be(e, "bindables"), e.bindables, s.bindables), n(Be(e, "noMultiBindings"), s.noMultiBindings, e.noMultiBindings, false), f(Oe.getAnnotation(e), e.watches));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        c.transient(i, e).register(t);
        c.aliasTo(i, e).register(t);
        L(s, Ie, i, t);
    }
}

const Re = dt("custom-attribute");

const Ee = t => `${Re}:${t}`;

const Be = (t, e) => lt(ft(e), t);

const Ie = Object.freeze({
    name: Re,
    keyFrom: Ee,
    isType(t) {
        return "function" === typeof t && ht(Re, t);
    },
    for(t, e) {
        var i;
        return null !== (i = Xi(t, Ee(e))) && void 0 !== i ? i : void 0;
    },
    define(t, e) {
        const i = CustomAttributeDefinition.create(t, e);
        at(Re, i, i.Type);
        at(Re, i, i);
        mt(e, Re);
        return i.Type;
    },
    getDefinition(t) {
        const e = lt(Re, t);
        if (void 0 === e) throw new Error(`AUR0759:${t.name}`);
        return e;
    },
    annotate(t, e, i) {
        at(ft(e), i, t);
    },
    getAnnotation: Be
});

function Te(t, e) {
    if (!t) throw new Error("AUR0772");
    return function i(s, n, r) {
        const o = null == n;
        const l = o ? s : s.constructor;
        const h = new WatchDefinition(t, o ? e : r.value);
        if (o) {
            if ("function" !== typeof e && (null == e || !(e in l.prototype))) throw new Error(`AUR0773:${String(e)}@${l.name}}`);
        } else if ("function" !== typeof (null === r || void 0 === r ? void 0 : r.value)) throw new Error(`AUR0774:${String(n)}`);
        Oe.add(l, h);
        if (Ie.isType(l)) Ie.getDefinition(l).watches.push(h);
        if (Ke.isType(l)) Ke.getDefinition(l).watches.push(h);
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const De = h;

const Pe = ft("watch");

const Oe = Object.freeze({
    name: Pe,
    add(t, e) {
        let i = lt(Pe, t);
        if (null == i) at(Pe, i = [], t);
        i.push(e);
    },
    getAnnotation(t) {
        var e;
        return null !== (e = lt(Pe, t)) && void 0 !== e ? e : De;
    }
});

function $e(t) {
    return function(e) {
        return Ke.define(t, e);
    };
}

function Le(t) {
    if (void 0 === t) return function(t) {
        Ge(t, "shadowOptions", {
            mode: "open"
        });
    };
    if ("function" !== typeof t) return function(e) {
        Ge(e, "shadowOptions", t);
    };
    Ge(t, "shadowOptions", {
        mode: "open"
    });
}

function qe(t) {
    if (void 0 === t) return function(t) {
        Ge(t, "containerless", true);
    };
    Ge(t, "containerless", true);
}

const Me = new WeakMap;

class CustomElementDefinition {
    constructor(t, e, i, s, n, r, o, l, h, a, c, u, f, d, m, v, p, g, w, b, x) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.cache = n;
        this.capture = r;
        this.template = o;
        this.instructions = l;
        this.dependencies = h;
        this.injectable = a;
        this.needsCompile = c;
        this.surrogates = u;
        this.bindables = f;
        this.childrenObservers = d;
        this.containerless = m;
        this.isStrictBinding = v;
        this.shadowOptions = p;
        this.hasSlots = g;
        this.enhance = w;
        this.watches = b;
        this.processContent = x;
    }
    get type() {
        return 1;
    }
    static create(t, e = null) {
        if (null === e) {
            const i = t;
            if ("string" === typeof i) throw new Error(`AUR0761:${t}`);
            const s = d("name", i, ze);
            if ("function" === typeof i.Type) e = i.Type; else e = Ke.generateType(m(s));
            return new CustomElementDefinition(e, s, f(i.aliases), d("key", i, (() => Ke.keyFrom(s))), d("cache", i, Fe), d("capture", i, _e), d("template", i, Ve), f(i.instructions), f(i.dependencies), d("injectable", i, Ve), d("needsCompile", i, je), f(i.surrogates), xt.from(i.bindables), ge.from(i.childrenObservers), d("containerless", i, _e), d("isStrictBinding", i, _e), d("shadowOptions", i, Ve), d("hasSlots", i, _e), d("enhance", i, _e), d("watches", i, Ne), v("processContent", e, Ve));
        }
        if ("string" === typeof t) return new CustomElementDefinition(e, t, f(Xe(e, "aliases"), e.aliases), Ke.keyFrom(t), v("cache", e, Fe), v("capture", e, _e), v("template", e, Ve), f(Xe(e, "instructions"), e.instructions), f(Xe(e, "dependencies"), e.dependencies), v("injectable", e, Ve), v("needsCompile", e, je), f(Xe(e, "surrogates"), e.surrogates), xt.from(...xt.getAll(e), Xe(e, "bindables"), e.bindables), ge.from(...ge.getAll(e), Xe(e, "childrenObservers"), e.childrenObservers), v("containerless", e, _e), v("isStrictBinding", e, _e), v("shadowOptions", e, Ve), v("hasSlots", e, _e), v("enhance", e, _e), f(Oe.getAnnotation(e), e.watches), v("processContent", e, Ve));
        const i = d("name", t, ze);
        return new CustomElementDefinition(e, i, f(Xe(e, "aliases"), t.aliases, e.aliases), Ke.keyFrom(i), p("cache", t, e, Fe), p("capture", t, e, _e), p("template", t, e, Ve), f(Xe(e, "instructions"), t.instructions, e.instructions), f(Xe(e, "dependencies"), t.dependencies, e.dependencies), p("injectable", t, e, Ve), p("needsCompile", t, e, je), f(Xe(e, "surrogates"), t.surrogates, e.surrogates), xt.from(...xt.getAll(e), Xe(e, "bindables"), e.bindables, t.bindables), ge.from(...ge.getAll(e), Xe(e, "childrenObservers"), e.childrenObservers, t.childrenObservers), p("containerless", t, e, _e), p("isStrictBinding", t, e, _e), p("shadowOptions", t, e, Ve), p("hasSlots", t, e, _e), p("enhance", t, e, _e), f(t.watches, Oe.getAnnotation(e), e.watches), p("processContent", t, e, Ve));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) return t;
        if (Me.has(t)) return Me.get(t);
        const e = CustomElementDefinition.create(t);
        Me.set(t, e);
        at(We, e, e.Type);
        return e;
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        if (!t.has(i, false)) {
            c.transient(i, e).register(t);
            c.aliasTo(i, e).register(t);
            L(s, Ke, i, t);
        }
    }
}

const Ue = {
    name: void 0,
    searchParents: false,
    optional: false
};

const Fe = () => 0;

const Ve = () => null;

const _e = () => false;

const je = () => true;

const Ne = () => h;

const We = dt("custom-element");

const He = t => `${We}:${t}`;

const ze = (() => {
    let t = 0;
    return () => `unnamed-${++t}`;
})();

const Ge = (t, e, i) => {
    at(ft(e), i, t);
};

const Xe = (t, e) => lt(ft(e), t);

const Ke = Object.freeze({
    name: We,
    keyFrom: He,
    isType(t) {
        return "function" === typeof t && ht(We, t);
    },
    for(t, e = Ue) {
        if (void 0 === e.name && true !== e.searchParents) {
            const i = Xi(t, We);
            if (null === i) {
                if (true === e.optional) return null;
                throw new Error("AUR0762");
            }
            return i;
        }
        if (void 0 !== e.name) {
            if (true !== e.searchParents) {
                const i = Xi(t, We);
                if (null === i) throw new Error("AUR0763");
                if (i.is(e.name)) return i;
                return;
            }
            let i = t;
            let s = false;
            while (null !== i) {
                const t = Xi(i, We);
                if (null !== t) {
                    s = true;
                    if (t.is(e.name)) return t;
                }
                i = es(i);
            }
            if (s) return;
            throw new Error("AUR0764");
        }
        let i = t;
        while (null !== i) {
            const t = Xi(i, We);
            if (null !== t) return t;
            i = es(i);
        }
        throw new Error("AUR0765");
    },
    define(t, e) {
        const i = CustomElementDefinition.create(t, e);
        at(We, i, i.Type);
        at(We, i, i);
        mt(i.Type, We);
        return i.Type;
    },
    getDefinition(t) {
        const e = lt(We, t);
        if (void 0 === e) throw new Error(`AUR0760:${t.name}`);
        return e;
    },
    annotate: Ge,
    getAnnotation: Xe,
    generateName: ze,
    createInjectable() {
        const t = function(e, i, s) {
            const n = l.getOrCreateAnnotationParamTypes(e);
            n[s] = t;
            return e;
        };
        t.register = function(e) {
            return {
                resolve(e, i) {
                    if (i.has(t, true)) return i.get(t); else return null;
                }
            };
        };
        return t;
    },
    generateType: function() {
        const t = {
            value: "",
            writable: false,
            enumerable: false,
            configurable: true
        };
        const e = {};
        return function(i, s = e) {
            const n = class {};
            t.value = i;
            Reflect.defineProperty(n, "name", t);
            if (s !== e) Object.assign(n.prototype, s);
            return n;
        };
    }()
});

const Ye = ft("processContent");

function Qe(t) {
    return void 0 === t ? function(t, e, i) {
        at(Ye, Ze(t, e), t);
    } : function(e) {
        t = Ze(e, t);
        const i = lt(We, e);
        if (void 0 !== i) i.processContent = t; else at(Ye, t, e);
        return e;
    };
}

function Ze(t, e) {
    if ("string" === typeof e) e = t[e];
    const i = typeof e;
    if ("function" !== i) throw new Error(`AUR0766:${i}`);
    return e;
}

class ClassAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = 2 | 4;
        this.value = "";
        this.ov = "";
        this.Z = {};
        this.J = 0;
        this.W = false;
    }
    get doNotCache() {
        return true;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this.W = t !== this.ov;
        if (0 === (256 & e)) this.X();
    }
    X() {
        if (this.W) {
            this.W = false;
            const t = this.value;
            const e = this.Z;
            const i = Je(t);
            let s = this.J;
            this.ov = t;
            if (i.length > 0) this.tt(i);
            this.J += 1;
            if (0 === s) return;
            s -= 1;
            for (const t in e) {
                if (!Object.prototype.hasOwnProperty.call(e, t) || e[t] !== s) continue;
                this.obj.classList.remove(t);
            }
        }
    }
    tt(t) {
        const e = this.obj;
        const i = t.length;
        let s = 0;
        let n;
        for (;s < i; s++) {
            n = t[s];
            if (0 === n.length) continue;
            this.Z[n] = this.J;
            e.classList.add(n);
        }
    }
}

function Je(t) {
    if ("string" === typeof t) return ti(t);
    if ("object" !== typeof t) return h;
    if (t instanceof Array) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) i.push(...Je(t[s]));
            return i;
        } else return h;
    }
    const e = [];
    let i;
    for (i in t) if (Boolean(t[i])) if (i.includes(" ")) e.push(...ti(i)); else e.push(i);
    return e;
}

function ti(t) {
    const e = t.match(/\S+/g);
    if (null === e) return h;
    return e;
}

function ei(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        var e;
        const i = Object.assign({}, ...this.modules);
        const s = Ie.define({
            name: "class",
            bindables: [ "value" ]
        }, (e = class CustomAttributeClass {
            constructor(t) {
                this.element = t;
            }
            binding() {
                this.valueChanged();
            }
            valueChanged() {
                if (!this.value) {
                    this.element.className = "";
                    return;
                }
                this.element.className = Je(this.value).map((t => i[t] || t)).join(" ");
            }
        }, e.inject = [ Yi ], e));
        t.register(s);
    }
}

function ii(...t) {
    return new ShadowDOMRegistry(t);
}

const si = l.createInterface("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(_t))) return t.get(AdoptedStyleSheetsStylesFactory);
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(ri);
        const i = t.get(si);
        t.register(c.instance(ni, i.createStyles(this.css, e)));
    }
}

class AdoptedStyleSheetsStylesFactory {
    constructor(t) {
        this.p = t;
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
}

AdoptedStyleSheetsStylesFactory.inject = [ _t ];

class StyleElementStylesFactory {
    constructor(t) {
        this.p = t;
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

StyleElementStylesFactory.inject = [ _t ];

const ni = l.createInterface("IShadowDOMStyles");

const ri = l.createInterface("IShadowDOMGlobalStyles", (t => t.instance({
    applyTo: o
})));

class AdoptedStyleSheetsStyles {
    constructor(t, e, i, s = null) {
        this.sharedStyles = s;
        this.styleSheets = e.map((e => {
            let s;
            if (e instanceof t.CSSStyleSheet) s = e; else {
                s = i.get(e);
                if (void 0 === s) {
                    s = new t.CSSStyleSheet;
                    s.replaceSync(e);
                    i.set(e, s);
                }
            }
            return s;
        }));
    }
    static supported(t) {
        return "adoptedStyleSheets" in t.ShadowRoot.prototype;
    }
    applyTo(t) {
        if (null !== this.sharedStyles) this.sharedStyles.applyTo(t);
        t.adoptedStyleSheets = [ ...t.adoptedStyleSheets, ...this.styleSheets ];
    }
}

class StyleElementStyles {
    constructor(t, e, i = null) {
        this.p = t;
        this.localStyles = e;
        this.sharedStyles = i;
    }
    applyTo(t) {
        const e = this.localStyles;
        const i = this.p;
        for (let s = e.length - 1; s > -1; --s) {
            const n = i.document.createElement("style");
            n.innerHTML = e[s];
            t.prepend(n);
        }
        if (null !== this.sharedStyles) this.sharedStyles.applyTo(t);
    }
}

const oi = {
    shadowDOM(t) {
        return fe.beforeCreate(g, (e => {
            if (null != t.sharedStyles) {
                const i = e.get(si);
                e.register(c.instance(ri, i.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: li, exit: hi} = q;

const {wrap: ai, unwrap: ci} = M;

class ComputedWatcher {
    constructor(t, e, i, s, n) {
        this.obj = t;
        this.get = i;
        this.cb = s;
        this.useProxy = n;
        this.interceptor = this;
        this.value = void 0;
        this.isBound = false;
        this.running = false;
        this.oL = e;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    $bind() {
        if (this.isBound) return;
        this.isBound = true;
        this.compute();
    }
    $unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clearAll();
    }
    run() {
        if (!this.isBound || this.running) return;
        const t = this.obj;
        const e = this.value;
        const i = this.compute();
        if (!Object.is(i, e)) this.cb.call(t, i, e, t);
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            li(this);
            return this.value = ci(this.get.call(void 0, this.useProxy ? ai(this.obj) : this.obj, this));
        } finally {
            this.obs.clear();
            this.running = false;
            hi(this);
        }
    }
}

class ExpressionWatcher {
    constructor(t, e, i, s, n) {
        this.scope = t;
        this.locator = e;
        this.oL = i;
        this.expression = s;
        this.callback = n;
        this.interceptor = this;
        this.isBound = false;
        this.obj = t.bindingContext;
    }
    handleChange(t) {
        const e = this.expression;
        const i = this.obj;
        const s = this.value;
        const n = 10082 === e.$kind && 1 === this.obs.count;
        if (!n) {
            this.obs.version++;
            t = e.evaluate(0, this.scope, this.locator, this);
            this.obs.clear();
        }
        if (!Object.is(t, s)) {
            this.value = t;
            this.callback.call(i, t, s, i);
        }
    }
    $bind() {
        if (this.isBound) return;
        this.isBound = true;
        this.obs.version++;
        this.value = this.expression.evaluate(0, this.scope, this.locator, this);
        this.obs.clear();
    }
    $unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clearAll();
        this.value = void 0;
    }
}

$(ComputedWatcher);

$(ExpressionWatcher);

const ui = l.createInterface("ILifecycleHooks");

class LifecycleHooksEntry {
    constructor(t, e) {
        this.definition = t;
        this.instance = e;
    }
}

class LifecycleHooksDefinition {
    constructor(t, e) {
        this.Type = t;
        this.propertyNames = e;
    }
    static create(t, e) {
        const i = new Set;
        let s = e.prototype;
        while (s !== Object.prototype) {
            for (const t of Object.getOwnPropertyNames(s)) if ("constructor" !== t) i.add(t);
            s = Object.getPrototypeOf(s);
        }
        return new LifecycleHooksDefinition(e, i);
    }
    register(t) {
        c.singleton(ui, this.Type).register(t);
    }
}

const fi = new WeakMap;

const di = ft("lifecycle-hooks");

const mi = Object.freeze({
    name: di,
    define(t, e) {
        const i = LifecycleHooksDefinition.create(t, e);
        at(di, i, e);
        mt(e, di);
        return i.Type;
    },
    resolve(t) {
        let e = fi.get(t);
        if (void 0 === e) {
            e = new LifecycleHooksLookupImpl;
            const i = t.root;
            const s = i.id === t.id ? t.getAll(ui) : t.has(ui, false) ? [ ...i.getAll(ui), ...t.getAll(ui) ] : i.getAll(ui);
            let n;
            let r;
            let o;
            let l;
            let h;
            for (n of s) {
                r = lt(di, n.constructor);
                o = new LifecycleHooksEntry(r, n);
                for (l of r.propertyNames) {
                    h = e[l];
                    if (void 0 === h) e[l] = [ o ]; else h.push(o);
                }
            }
        }
        return e;
    }
});

class LifecycleHooksLookupImpl {}

function vi() {
    return function t(e) {
        return mi.define({}, e);
    };
}

const pi = l.createInterface("IViewFactory");

class ViewFactory {
    constructor(t, e) {
        this.isCaching = false;
        this.cache = null;
        this.cacheSize = -1;
        this.name = e.name;
        this.container = t;
        this.def = e;
    }
    setCacheSize(t, e) {
        if (t) {
            if ("*" === t) t = ViewFactory.maxCacheSize; else if ("string" === typeof t) t = parseInt(t, 10);
            if (-1 === this.cacheSize || !e) this.cacheSize = t;
        }
        if (this.cacheSize > 0) this.cache = []; else this.cache = null;
        this.isCaching = this.cacheSize > 0;
    }
    canReturnToCache(t) {
        return null != this.cache && this.cache.length < this.cacheSize;
    }
    tryReturnToCache(t) {
        if (this.canReturnToCache(t)) {
            this.cache.push(t);
            return true;
        }
        return false;
    }
    create(t) {
        const e = this.cache;
        let i;
        if (null != e && e.length > 0) {
            i = e.pop();
            return i;
        }
        i = Controller.$view(this, t);
        return i;
    }
}

ViewFactory.maxCacheSize = 65535;

const gi = new WeakSet;

function wi(t) {
    return !gi.has(t);
}

function bi(t) {
    gi.add(t);
    return CustomElementDefinition.create(t);
}

const xi = dt("views");

const yi = Object.freeze({
    name: xi,
    has(t) {
        return "function" === typeof t && (ht(xi, t) || "$views" in t);
    },
    get(t) {
        if ("function" === typeof t && "$views" in t) {
            const e = t.$views;
            const i = e.filter(wi).map(bi);
            for (const e of i) yi.add(t, e);
        }
        let e = lt(xi, t);
        if (void 0 === e) at(xi, e = [], t);
        return e;
    },
    add(t, e) {
        const i = CustomElementDefinition.create(e);
        let s = lt(xi, t);
        if (void 0 === s) at(xi, s = [ i ], t); else s.push(i);
        return s;
    }
});

function ki(t) {
    return function(e) {
        yi.add(e, t);
    };
}

const Ci = l.createInterface("IViewLocator", (t => t.singleton(ViewLocator)));

class ViewLocator {
    constructor() {
        this.et = new WeakMap;
        this.it = new Map;
    }
    getViewComponentForObject(t, e) {
        if (t) {
            const i = yi.has(t.constructor) ? yi.get(t.constructor) : [];
            const s = "function" === typeof e ? e(t, i) : this.st(i, e);
            return this.nt(t, i, s);
        }
        return null;
    }
    nt(t, e, i) {
        let s = this.et.get(t);
        let n;
        if (void 0 === s) {
            s = {};
            this.et.set(t, s);
        } else n = s[i];
        if (void 0 === n) {
            const r = this.rt(t, e, i);
            n = Ke.define(Ke.getDefinition(r), class extends r {
                constructor() {
                    super(t);
                }
            });
            s[i] = n;
        }
        return n;
    }
    rt(t, e, i) {
        let s = this.it.get(t.constructor);
        let n;
        if (void 0 === s) {
            s = {};
            this.it.set(t.constructor, s);
        } else n = s[i];
        if (void 0 === n) {
            n = Ke.define(this.ot(e, i), class {
                constructor(t) {
                    this.viewModel = t;
                }
                define(t, e, i) {
                    const s = this.viewModel;
                    t.scope = U.fromParent(t.scope, s);
                    if (void 0 !== s.define) return s.define(t, e, i);
                }
            });
            const r = n.prototype;
            if ("hydrating" in t) r.hydrating = function t(e) {
                this.viewModel.hydrating(e);
            };
            if ("hydrated" in t) r.hydrated = function t(e) {
                this.viewModel.hydrated(e);
            };
            if ("created" in t) r.created = function t(e) {
                this.viewModel.created(e);
            };
            if ("binding" in t) r.binding = function t(e, i, s) {
                return this.viewModel.binding(e, i, s);
            };
            if ("bound" in t) r.bound = function t(e, i, s) {
                return this.viewModel.bound(e, i, s);
            };
            if ("attaching" in t) r.attaching = function t(e, i, s) {
                return this.viewModel.attaching(e, i, s);
            };
            if ("attached" in t) r.attached = function t(e, i) {
                return this.viewModel.attached(e, i);
            };
            if ("detaching" in t) r.detaching = function t(e, i, s) {
                return this.viewModel.detaching(e, i, s);
            };
            if ("unbinding" in t) r.unbinding = function t(e, i, s) {
                return this.viewModel.unbinding(e, i, s);
            };
            if ("dispose" in t) r.dispose = function t() {
                this.viewModel.dispose();
            };
            s[i] = n;
        }
        return n;
    }
    st(t, e) {
        if (e) return e;
        if (1 === t.length) return t[0].name;
        return "default-view";
    }
    ot(t, e) {
        const i = t.find((t => t.name === e));
        if (void 0 === i) throw new Error(`Could not find view: ${e}`);
        return i;
    }
}

const Ai = l.createInterface("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    constructor(t) {
        this.lt = new WeakMap;
        this.ht = new WeakMap;
        this.at = (this.ct = t.root).get(_t);
        this.ut = new FragmentNodeSequence(this.at, this.at.document.createDocumentFragment());
    }
    get renderers() {
        return null == this.rs ? this.rs = this.ct.getAll(gs, false).reduce(((t, e) => {
            t[e.instructionType] = e;
            return t;
        }), Mt()) : this.rs;
    }
    compile(t, e, i) {
        if (false !== t.needsCompile) {
            const s = this.lt;
            const n = e.get(ps);
            let r = s.get(t);
            if (null == r) s.set(t, r = n.compile(t, e, i)); else e.register(...r.dependencies);
            return r;
        }
        return t;
    }
    getViewFactory(t, e) {
        return new ViewFactory(e, CustomElementDefinition.getOrCreate(t));
    }
    createNodes(t) {
        if (true === t.enhance) return new FragmentNodeSequence(this.at, t.template);
        let e;
        const i = this.ht;
        if (i.has(t)) e = i.get(t); else {
            const s = this.at;
            const n = s.document;
            const r = t.template;
            let o;
            if (null === r) e = null; else if (r instanceof s.Node) if ("TEMPLATE" === r.nodeName) e = n.adoptNode(r.content); else (e = n.adoptNode(n.createDocumentFragment())).appendChild(r.cloneNode(true)); else {
                o = n.createElement("template");
                if ("string" === typeof r) o.innerHTML = r;
                n.adoptNode(e = o.content);
            }
            i.set(t, e);
        }
        return null == e ? this.ut : new FragmentNodeSequence(this.at, e.cloneNode(true));
    }
    render(t, e, i, s) {
        const n = i.instructions;
        const r = this.renderers;
        const o = e.length;
        if (e.length !== n.length) throw new Error(`AUR0757:${o}<>${n.length}`);
        let l = 0;
        let h = 0;
        let a = 0;
        let c;
        let u;
        let f;
        if (o > 0) while (o > l) {
            c = n[l];
            f = e[l];
            h = 0;
            a = c.length;
            while (a > h) {
                u = c[h];
                r[u.type].render(t, f, u);
                ++h;
            }
            ++l;
        }
        if (void 0 !== s && null !== s) {
            c = i.surrogates;
            if ((a = c.length) > 0) {
                h = 0;
                while (a > h) {
                    u = c[h];
                    r[u.type].render(t, s, u);
                    ++h;
                }
            }
        }
    }
}

Rendering.inject = [ g ];

var Si;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["host"] = 1] = "host";
    t[t["shadowRoot"] = 2] = "shadowRoot";
    t[t["location"] = 3] = "location";
})(Si || (Si = {}));

const Ri = {
    optional: true
};

const Ei = new WeakMap;

class Controller {
    constructor(t, e, i, s, n, r) {
        this.container = t;
        this.vmKind = e;
        this.definition = i;
        this.viewFactory = s;
        this.viewModel = n;
        this.host = r;
        this.id = w("au$component");
        this.head = null;
        this.tail = null;
        this.next = null;
        this.parent = null;
        this.bindings = null;
        this.children = null;
        this.hasLockedScope = false;
        this.isStrictBinding = false;
        this.scope = null;
        this.isBound = false;
        this.hostController = null;
        this.mountTarget = 0;
        this.shadowRoot = null;
        this.nodes = null;
        this.location = null;
        this.lifecycleHooks = null;
        this.state = 0;
        this.ft = false;
        this.dt = h;
        this.flags = 0;
        this.$initiator = null;
        this.$flags = 0;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.vt = 0;
        this.gt = 0;
        this.wt = 0;
        this.r = t.root.get(Ai);
        switch (e) {
          case 1:
          case 0:
            this.hooks = new HooksDefinition(n);
            break;

          case 2:
            this.hooks = HooksDefinition.none;
            break;
        }
    }
    get isActive() {
        return (this.state & (1 | 2)) > 0 && 0 === (4 & this.state);
    }
    get name() {
        var t;
        if (null === this.parent) switch (this.vmKind) {
          case 1:
            return `[${this.definition.name}]`;

          case 0:
            return this.definition.name;

          case 2:
            return this.viewFactory.name;
        }
        switch (this.vmKind) {
          case 1:
            return `${this.parent.name}>[${this.definition.name}]`;

          case 0:
            return `${this.parent.name}>${this.definition.name}`;

          case 2:
            return this.viewFactory.name === (null === (t = this.parent.definition) || void 0 === t ? void 0 : t.name) ? `${this.parent.name}[view]` : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    static getCached(t) {
        return Ei.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (void 0 === e) throw new Error(`AUR0500:${t}`);
        return e;
    }
    static $el(t, e, i, s, n = void 0) {
        if (Ei.has(e)) return Ei.get(e);
        n = null !== n && void 0 !== n ? n : Ke.getDefinition(e.constructor);
        const r = new Controller(t, 0, n, null, e, i);
        const o = t.get(b(_i));
        if (n.dependencies.length > 0) t.register(...n.dependencies);
        t.registerResolver(_i, new x("IHydrationContext", new HydrationContext(r, s, o)));
        Ei.set(e, r);
        if (null == s || false !== s.hydrate) r.bt(s, o);
        return r;
    }
    static $attr(t, e, i, s) {
        if (Ei.has(e)) return Ei.get(e);
        s = null !== s && void 0 !== s ? s : Ie.getDefinition(e.constructor);
        const n = new Controller(t, 1, s, null, e, i);
        Ei.set(e, n);
        n.xt();
        return n;
    }
    static $view(t, e = void 0) {
        const i = new Controller(t.container, 2, null, t, null, null);
        i.parent = null !== e && void 0 !== e ? e : null;
        i.yt();
        return i;
    }
    bt(t, e) {
        const i = this.container;
        const s = this.flags;
        const n = this.viewModel;
        let r = this.definition;
        this.scope = U.create(n, null, true);
        if (r.watches.length > 0) Oi(this, i, r, n);
        Ii(this, r, s, n);
        this.dt = Ti(this, r, n);
        if (this.hooks.hasDefine) {
            const t = n.define(this, e, r);
            if (void 0 !== t && t !== r) r = CustomElementDefinition.getOrCreate(t);
        }
        this.lifecycleHooks = mi.resolve(i);
        r.register(i);
        if (null !== r.injectable) i.registerResolver(r.injectable, new x("definition.injectable", n));
        if (null == t || false !== t.hydrate) {
            this.kt(t);
            this.Ct();
        }
    }
    kt(t) {
        if (this.hooks.hasHydrating) this.viewModel.hydrating(this);
        const e = this.At = this.r.compile(this.definition, this.container, t);
        const {shadowOptions: i, isStrictBinding: s, hasSlots: n, containerless: r} = e;
        this.isStrictBinding = s;
        if (null !== (this.hostController = Ke.for(this.host, Ri))) this.host = this.container.root.get(_t).document.createElement(this.definition.name);
        Ki(this.host, Ke.name, this);
        Ki(this.host, this.definition.key, this);
        if (null !== i || n) {
            if (r) throw new Error("AUR0501");
            Ki(this.shadowRoot = this.host.attachShadow(null !== i && void 0 !== i ? i : qi), Ke.name, this);
            Ki(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2;
        } else if (r) {
            Ki(this.location = ss(this.host), Ke.name, this);
            Ki(this.location, this.definition.key, this);
            this.mountTarget = 3;
        } else this.mountTarget = 1;
        this.viewModel.$controller = this;
        this.nodes = this.r.createNodes(e);
        if (this.hooks.hasHydrated) this.viewModel.hydrated(this);
    }
    Ct() {
        this.r.render(this, this.nodes.findTargets(), this.At, this.host);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    xt() {
        const t = this.definition;
        const e = this.viewModel;
        if (t.watches.length > 0) Oi(this, this.container, t, e);
        Ii(this, t, this.flags, e);
        e.$controller = this;
        this.lifecycleHooks = mi.resolve(this.container);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    yt() {
        this.At = this.r.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this.At.isStrictBinding;
        this.r.render(this, (this.nodes = this.r.createNodes(this.At)).findTargets(), this.At, void 0);
    }
    activate(t, e, i, s) {
        switch (this.state) {
          case 0:
          case 8:
            if (!(null === e || e.isActive)) return;
            this.state = 1;
            break;

          case 2:
            return;

          case 32:
            throw new Error(`AUR0502:${this.name}`);

          default:
            throw new Error(`AUR0503:${this.name} ${Fi(this.state)}`);
        }
        this.parent = e;
        i |= 2;
        switch (this.vmKind) {
          case 0:
            this.scope.parentScope = null !== s && void 0 !== s ? s : null;
            break;

          case 1:
            this.scope = null !== s && void 0 !== s ? s : null;
            break;

          case 2:
            if (void 0 === s || null === s) throw new Error("AUR0504");
            if (!this.hasLockedScope) this.scope = s;
            break;
        }
        if (this.isStrictBinding) i |= 1;
        this.$initiator = t;
        this.$flags = i;
        this.St();
        if (this.hooks.hasBinding) {
            const t = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.Rt();
                t.then((() => {
                    this.bind();
                })).catch((t => {
                    this.Et(t);
                }));
                return this.$promise;
            }
        }
        this.bind();
        return this.$promise;
    }
    bind() {
        let t = 0;
        let e = this.dt.length;
        let i;
        if (e > 0) while (e > t) {
            this.dt[t].start();
            ++t;
        }
        if (null !== this.bindings) {
            t = 0;
            e = this.bindings.length;
            while (e > t) {
                this.bindings[t].$bind(this.$flags, this.scope);
                ++t;
            }
        }
        if (this.hooks.hasBound) {
            i = this.viewModel.bound(this.$initiator, this.parent, this.$flags);
            if (i instanceof Promise) {
                this.Rt();
                i.then((() => {
                    this.isBound = true;
                    this.Bt();
                })).catch((t => {
                    this.Et(t);
                }));
                return;
            }
        }
        this.isBound = true;
        this.Bt();
    }
    It(...t) {
        switch (this.mountTarget) {
          case 1:
            this.host.append(...t);
            break;

          case 2:
            this.shadowRoot.append(...t);
            break;

          case 3:
            {
                let e = 0;
                for (;e < t.length; ++e) this.location.parentNode.insertBefore(t[e], this.location);
                break;
            }
        }
    }
    Bt() {
        if (null !== this.hostController) switch (this.mountTarget) {
          case 1:
          case 2:
            this.hostController.It(this.host);
            break;

          case 3:
            this.hostController.It(this.location.$start, this.location);
            break;
        }
        switch (this.mountTarget) {
          case 1:
            this.nodes.appendTo(this.host, null != this.definition && this.definition.enhance);
            break;

          case 2:
            {
                const t = this.container;
                const e = t.has(ni, false) ? t.get(ni) : t.get(ri);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case 3:
            this.nodes.insertBefore(this.location);
            break;
        }
        if (this.hooks.hasAttaching) {
            const t = this.viewModel.attaching(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.Rt();
                this.St();
                t.then((() => {
                    this.Tt();
                })).catch((t => {
                    this.Et(t);
                }));
            }
        }
        if (null !== this.children) {
            let t = 0;
            for (;t < this.children.length; ++t) void this.children[t].activate(this.$initiator, this, this.$flags, this.scope);
        }
        this.Tt();
    }
    deactivate(t, e, i) {
        switch (~16 & this.state) {
          case 2:
            this.state = 4;
            break;

          case 0:
          case 8:
          case 32:
          case 8 | 32:
            return;

          default:
            throw new Error(`AUR0505:${this.name} ${Fi(this.state)}`);
        }
        this.$initiator = t;
        this.$flags = i;
        if (t === this) this.Dt();
        let s = 0;
        if (this.dt.length) for (;s < this.dt.length; ++s) this.dt[s].stop();
        if (null !== this.children) for (s = 0; s < this.children.length; ++s) void this.children[s].deactivate(t, this, i);
        if (this.hooks.hasDetaching) {
            const e = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (e instanceof Promise) {
                this.Rt();
                t.Dt();
                e.then((() => {
                    t.Pt();
                })).catch((e => {
                    t.Et(e);
                }));
            }
        }
        if (null === t.head) t.head = this; else t.tail.next = this;
        t.tail = this;
        if (t !== this) return;
        this.Pt();
        return this.$promise;
    }
    removeNodes() {
        switch (this.vmKind) {
          case 0:
          case 2:
            this.nodes.remove();
            this.nodes.unlink();
        }
        if (null !== this.hostController) switch (this.mountTarget) {
          case 1:
          case 2:
            this.host.remove();
            break;

          case 3:
            this.location.$start.remove();
            this.location.remove();
            break;
        }
    }
    unbind() {
        const t = 4 | this.$flags;
        let e = 0;
        if (null !== this.bindings) for (;e < this.bindings.length; ++e) this.bindings[e].$unbind(t);
        this.parent = null;
        switch (this.vmKind) {
          case 1:
            this.scope = null;
            break;

          case 2:
            if (!this.hasLockedScope) this.scope = null;
            if (16 === (16 & this.state) && !this.viewFactory.tryReturnToCache(this) && this.$initiator === this) this.dispose();
            break;

          case 0:
            this.scope.parentScope = null;
            break;
        }
        if (32 === (32 & t) && this.$initiator === this) this.dispose();
        this.state = 32 & this.state | 8;
        this.$initiator = null;
        this.Ot();
    }
    Rt() {
        if (void 0 === this.$promise) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) this.parent.Rt();
        }
    }
    Ot() {
        if (void 0 !== this.$promise) {
            Ni = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            Ni();
            Ni = void 0;
        }
    }
    Et(t) {
        if (void 0 !== this.$promise) {
            Wi = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            Wi(t);
            Wi = void 0;
        }
        if (this.$initiator !== this) this.parent.Et(t);
    }
    St() {
        ++this.vt;
        if (this.$initiator !== this) this.parent.St();
    }
    Tt() {
        if (0 === --this.vt) {
            if (this.hooks.hasAttached) {
                Hi = this.viewModel.attached(this.$initiator, this.$flags);
                if (Hi instanceof Promise) {
                    this.Rt();
                    Hi.then((() => {
                        this.state = 2;
                        this.Ot();
                        if (this.$initiator !== this) this.parent.Tt();
                    })).catch((t => {
                        this.Et(t);
                    }));
                    Hi = void 0;
                    return;
                }
                Hi = void 0;
            }
            this.state = 2;
            this.Ot();
        }
        if (this.$initiator !== this) this.parent.Tt();
    }
    Dt() {
        ++this.gt;
    }
    Pt() {
        if (0 === --this.gt) {
            this.$t();
            this.removeNodes();
            let t = this.$initiator.head;
            while (null !== t) {
                if (t !== this) {
                    if (t.debug) t.logger.trace(`detach()`);
                    t.removeNodes();
                }
                if (t.hooks.hasUnbinding) {
                    if (t.debug) t.logger.trace("unbinding()");
                    Hi = t.viewModel.unbinding(t.$initiator, t.parent, t.$flags);
                    if (Hi instanceof Promise) {
                        this.Rt();
                        this.$t();
                        Hi.then((() => {
                            this.Lt();
                        })).catch((t => {
                            this.Et(t);
                        }));
                    }
                    Hi = void 0;
                }
                t = t.next;
            }
            this.Lt();
        }
    }
    $t() {
        ++this.wt;
    }
    Lt() {
        if (0 === --this.wt) {
            let t = this.$initiator.head;
            let e = null;
            while (null !== t) {
                if (t !== this) {
                    t.isBound = false;
                    t.unbind();
                }
                e = t.next;
                t.next = null;
                t = e;
            }
            this.head = this.tail = null;
            this.isBound = false;
            this.unbind();
        }
    }
    addBinding(t) {
        if (null === this.bindings) this.bindings = [ t ]; else this.bindings[this.bindings.length] = t;
    }
    addChild(t) {
        if (null === this.children) this.children = [ t ]; else this.children[this.children.length] = t;
    }
    is(t) {
        switch (this.vmKind) {
          case 1:
            return Ie.getDefinition(this.viewModel.constructor).name === t;

          case 0:
            return Ke.getDefinition(this.viewModel.constructor).name === t;

          case 2:
            return this.viewFactory.name === t;
        }
    }
    lockScope(t) {
        this.scope = t;
        this.hasLockedScope = true;
    }
    setHost(t) {
        if (0 === this.vmKind) {
            Ki(t, Ke.name, this);
            Ki(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = 1;
        return this;
    }
    setShadowRoot(t) {
        if (0 === this.vmKind) {
            Ki(t, Ke.name, this);
            Ki(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = 2;
        return this;
    }
    setLocation(t) {
        if (0 === this.vmKind) {
            Ki(t, Ke.name, this);
            Ki(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = 3;
        return this;
    }
    release() {
        this.state |= 16;
    }
    dispose() {
        if (32 === (32 & this.state)) return;
        this.state |= 32;
        if (this.hooks.hasDispose) this.viewModel.dispose();
        if (null !== this.children) {
            this.children.forEach(ji);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (null !== this.viewModel) {
            Ei.delete(this.viewModel);
            this.viewModel = null;
        }
        this.viewModel = null;
        this.host = null;
        this.shadowRoot = null;
        this.container.disposeResolvers();
    }
    accept(t) {
        if (true === t(this)) return true;
        if (this.hooks.hasAccept && true === this.viewModel.accept(t)) return true;
        if (null !== this.children) {
            const {children: e} = this;
            for (let i = 0, s = e.length; i < s; ++i) if (true === e[i].accept(t)) return true;
        }
    }
}

function Bi(t) {
    let e = t.$observers;
    if (void 0 === e) Reflect.defineProperty(t, "$observers", {
        enumerable: false,
        value: e = {}
    });
    return e;
}

function Ii(t, e, i, s) {
    const n = e.bindables;
    const r = Object.getOwnPropertyNames(n);
    const o = r.length;
    if (o > 0) {
        let e;
        let i;
        let l = 0;
        const h = Bi(s);
        for (;l < o; ++l) {
            e = r[l];
            if (void 0 === h[e]) {
                i = n[e];
                h[e] = new BindableObserver(s, e, i.callback, i.set, t);
            }
        }
    }
}

function Ti(t, e, i) {
    const s = e.childrenObservers;
    const n = Object.getOwnPropertyNames(s);
    const r = n.length;
    if (r > 0) {
        const e = Bi(i);
        const o = [];
        let l;
        let h = 0;
        let a;
        for (;h < r; ++h) {
            l = n[h];
            if (void 0 == e[l]) {
                a = s[l];
                o[o.length] = e[l] = new ChildrenObserver(t, i, l, a.callback, a.query, a.filter, a.map, a.options);
            }
        }
        return o;
    }
    return h;
}

const Di = new Map;

const Pi = t => {
    let e = Di.get(t);
    if (null == e) {
        e = new _(t, 0);
        Di.set(t, e);
    }
    return e;
};

function Oi(t, e, i, s) {
    const n = e.get(F);
    const r = e.get(V);
    const o = i.watches;
    const l = 0 === t.vmKind ? t.scope : U.create(s, null, true);
    const h = o.length;
    let a;
    let c;
    let u;
    let f = 0;
    for (;h > f; ++f) {
        ({expression: a, callback: c} = o[f]);
        c = "function" === typeof c ? c : Reflect.get(s, c);
        if ("function" !== typeof c) throw new Error(`AUR0506:${String(c)}`);
        if ("function" === typeof a) t.addBinding(new ComputedWatcher(s, n, a, c, true)); else {
            u = "string" === typeof a ? r.parse(a, 8) : Pi(a);
            t.addBinding(new ExpressionWatcher(l, e, n, u, c));
        }
    }
}

function $i(t) {
    return t instanceof Controller && 0 === t.vmKind;
}

function Li(t) {
    return y(t) && Ke.isType(t.constructor);
}

class HooksDefinition {
    constructor(t) {
        this.hasDefine = "define" in t;
        this.hasHydrating = "hydrating" in t;
        this.hasHydrated = "hydrated" in t;
        this.hasCreated = "created" in t;
        this.hasBinding = "binding" in t;
        this.hasBound = "bound" in t;
        this.hasAttaching = "attaching" in t;
        this.hasAttached = "attached" in t;
        this.hasDetaching = "detaching" in t;
        this.hasUnbinding = "unbinding" in t;
        this.hasDispose = "dispose" in t;
        this.hasAccept = "accept" in t;
    }
}

HooksDefinition.none = new HooksDefinition({});

const qi = {
    mode: "open"
};

var Mi;

(function(t) {
    t[t["customElement"] = 0] = "customElement";
    t[t["customAttribute"] = 1] = "customAttribute";
    t[t["synthetic"] = 2] = "synthetic";
})(Mi || (Mi = {}));

var Ui;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["activating"] = 1] = "activating";
    t[t["activated"] = 2] = "activated";
    t[t["deactivating"] = 4] = "deactivating";
    t[t["deactivated"] = 8] = "deactivated";
    t[t["released"] = 16] = "released";
    t[t["disposed"] = 32] = "disposed";
})(Ui || (Ui = {}));

function Fi(t) {
    const e = [];
    if (1 === (1 & t)) e.push("activating");
    if (2 === (2 & t)) e.push("activated");
    if (4 === (4 & t)) e.push("deactivating");
    if (8 === (8 & t)) e.push("deactivated");
    if (16 === (16 & t)) e.push("released");
    if (32 === (32 & t)) e.push("disposed");
    return 0 === e.length ? "none" : e.join("|");
}

const Vi = l.createInterface("IController");

const _i = l.createInterface("IHydrationContext");

class HydrationContext {
    constructor(t, e, i) {
        this.instruction = e;
        this.parent = i;
        this.controller = t;
    }
}

function ji(t) {
    t.dispose();
}

let Ni;

let Wi;

let Hi;

const zi = l.createInterface("IAppRoot");

const Gi = l.createInterface("IWorkTracker", (t => t.singleton(WorkTracker)));

class WorkTracker {
    constructor(t) {
        this.qt = 0;
        this.Mt = null;
        this.Ot = null;
        this.Ut = t.scopeTo("WorkTracker");
    }
    start() {
        this.Ut.trace(`start(stack:${this.qt})`);
        ++this.qt;
    }
    finish() {
        this.Ut.trace(`finish(stack:${this.qt})`);
        if (0 === --this.qt) {
            const t = this.Ot;
            if (null !== t) {
                this.Ot = this.Mt = null;
                t();
            }
        }
    }
    wait() {
        this.Ut.trace(`wait(stack:${this.qt})`);
        if (null === this.Mt) {
            if (0 === this.qt) return Promise.resolve();
            this.Mt = new Promise((t => {
                this.Ot = t;
            }));
        }
        return this.Mt;
    }
}

WorkTracker.inject = [ k ];

class AppRoot {
    constructor(t, e, i, s) {
        this.config = t;
        this.platform = e;
        this.container = i;
        this.controller = void 0;
        this.Ft = void 0;
        this.host = t.host;
        this.work = i.get(Gi);
        s.prepare(this);
        i.registerResolver(e.HTMLElement, i.registerResolver(e.Element, i.registerResolver(Yi, new x("ElementResolver", t.host))));
        this.Ft = C(this.Vt("beforeCreate"), (() => {
            const e = t.component;
            const s = i.createChild();
            let n;
            if (Ke.isType(e)) n = this.container.get(e); else n = t.component;
            const r = {
                hydrate: false,
                projections: null
            };
            const o = this.controller = Controller.$el(s, n, this.host, r);
            o.bt(r, null);
            return C(this.Vt("hydrating"), (() => {
                o.kt(null);
                return C(this.Vt("hydrated"), (() => {
                    o.Ct();
                    this.Ft = void 0;
                }));
            }));
        }));
    }
    activate() {
        return C(this.Ft, (() => C(this.Vt("beforeActivate"), (() => C(this.controller.activate(this.controller, null, 2, void 0), (() => this.Vt("afterActivate")))))));
    }
    deactivate() {
        return C(this.Vt("beforeDeactivate"), (() => C(this.controller.deactivate(this.controller, null, 0), (() => this.Vt("afterDeactivate")))));
    }
    Vt(t) {
        return A(...this.container.getAll(ue).reduce(((e, i) => {
            if (i.slot === t) e.push(i.run());
            return e;
        }), []));
    }
    dispose() {
        var t;
        null === (t = this.controller) || void 0 === t ? void 0 : t.dispose();
    }
}

class Refs {}

function Xi(t, e) {
    var i, s;
    return null !== (s = null === (i = t.$au) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : null;
}

function Ki(t, e, i) {
    var s;
    var n;
    (null !== (s = (n = t).$au) && void 0 !== s ? s : n.$au = new Refs)[e] = i;
}

const Yi = l.createInterface("INode");

const Qi = l.createInterface("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(zi, true)) return t.get(zi).host;
    return t.get(_t).document;
}))));

const Zi = l.createInterface("IRenderLocation");

var Ji;

(function(t) {
    t[t["Element"] = 1] = "Element";
    t[t["Attr"] = 2] = "Attr";
    t[t["Text"] = 3] = "Text";
    t[t["CDATASection"] = 4] = "CDATASection";
    t[t["EntityReference"] = 5] = "EntityReference";
    t[t["Entity"] = 6] = "Entity";
    t[t["ProcessingInstruction"] = 7] = "ProcessingInstruction";
    t[t["Comment"] = 8] = "Comment";
    t[t["Document"] = 9] = "Document";
    t[t["DocumentType"] = 10] = "DocumentType";
    t[t["DocumentFragment"] = 11] = "DocumentFragment";
    t[t["Notation"] = 12] = "Notation";
})(Ji || (Ji = {}));

const ts = new WeakMap;

function es(t) {
    if (ts.has(t)) return ts.get(t);
    let e = 0;
    let i = t.nextSibling;
    while (null !== i) {
        if (8 === i.nodeType) switch (i.textContent) {
          case "au-start":
            ++e;
            break;

          case "au-end":
            if (0 === e--) return i;
        }
        i = i.nextSibling;
    }
    if (null === t.parentNode && 11 === t.nodeType) {
        const e = Ke.for(t);
        if (void 0 === e) return null;
        if (2 === e.mountTarget) return es(e.host);
    }
    return t.parentNode;
}

function is(t, e) {
    if (void 0 !== t.platform && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) ts.set(i[t], e);
    } else ts.set(t, e);
}

function ss(t) {
    if (ns(t)) return t;
    const e = t.ownerDocument.createComment("au-end");
    const i = t.ownerDocument.createComment("au-start");
    if (null !== t.parentNode) {
        t.parentNode.replaceChild(e, t);
        e.parentNode.insertBefore(i, e);
    }
    e.$start = i;
    return e;
}

function ns(t) {
    return "au-end" === t.textContent;
}

class FragmentNodeSequence {
    constructor(t, e) {
        this.platform = t;
        this.fragment = e;
        this.isMounted = false;
        this.isLinked = false;
        this.next = void 0;
        this.refNode = void 0;
        const i = e.querySelectorAll(".au");
        let s = 0;
        let n = i.length;
        let r;
        let o = this.targets = Array(n);
        while (n > s) {
            r = i[s];
            if ("AU-M" === r.nodeName) o[s] = ss(r); else o[s] = r;
            ++s;
        }
        const l = e.childNodes;
        const h = this.childNodes = Array(n = l.length);
        s = 0;
        while (n > s) {
            h[s] = l[s];
            ++s;
        }
        this.firstChild = e.firstChild;
        this.lastChild = e.lastChild;
    }
    findTargets() {
        return this.targets;
    }
    insertBefore(t) {
        if (this.isLinked && !!this.refNode) this.addToLinked(); else {
            const e = t.parentNode;
            if (this.isMounted) {
                let i = this.firstChild;
                let s;
                const n = this.lastChild;
                while (null != i) {
                    s = i.nextSibling;
                    e.insertBefore(i, t);
                    if (i === n) break;
                    i = s;
                }
            } else {
                this.isMounted = true;
                t.parentNode.insertBefore(this.fragment, t);
            }
        }
    }
    appendTo(t, e = false) {
        if (this.isMounted) {
            let e = this.firstChild;
            let i;
            const s = this.lastChild;
            while (null != e) {
                i = e.nextSibling;
                t.appendChild(e);
                if (e === s) break;
                e = i;
            }
        } else {
            this.isMounted = true;
            if (!e) t.appendChild(this.fragment);
        }
    }
    remove() {
        if (this.isMounted) {
            this.isMounted = false;
            const t = this.fragment;
            const e = this.lastChild;
            let i;
            let s = this.firstChild;
            while (null !== s) {
                i = s.nextSibling;
                t.appendChild(s);
                if (s === e) break;
                s = i;
            }
        }
    }
    addToLinked() {
        const t = this.refNode;
        const e = t.parentNode;
        if (this.isMounted) {
            let i = this.firstChild;
            let s;
            const n = this.lastChild;
            while (null != i) {
                s = i.nextSibling;
                e.insertBefore(i, t);
                if (i === n) break;
                i = s;
            }
        } else {
            this.isMounted = true;
            e.insertBefore(this.fragment, t);
        }
    }
    unlink() {
        this.isLinked = false;
        this.next = void 0;
        this.refNode = void 0;
    }
    link(t) {
        this.isLinked = true;
        if (ns(t)) this.refNode = t; else {
            this.next = t;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (void 0 !== this.next) this.refNode = this.next.firstChild; else this.refNode = void 0;
    }
}

const rs = l.createInterface("IWindow", (t => t.callback((t => t.get(_t).window))));

const os = l.createInterface("ILocation", (t => t.callback((t => t.get(rs).location))));

const ls = l.createInterface("IHistory", (t => t.callback((t => t.get(rs).history))));

const hs = {
    [j.capturing]: {
        capture: true
    },
    [j.bubbling]: {
        capture: false
    }
};

class Listener {
    constructor(t, e, i, s, n, r, o, l) {
        this.platform = t;
        this.targetEvent = e;
        this.delegationStrategy = i;
        this.sourceExpression = s;
        this.target = n;
        this.preventDefault = r;
        this.eventDelegator = o;
        this.locator = l;
        this.interceptor = this;
        this.isBound = false;
        this.handler = null;
    }
    callSource(t) {
        const e = this.$scope.overrideContext;
        e.$event = t;
        const i = this.sourceExpression.evaluate(8, this.$scope, this.locator, null);
        Reflect.deleteProperty(e, "$event");
        if (true !== i && this.preventDefault) t.preventDefault();
        return i;
    }
    handleEvent(t) {
        this.interceptor.callSource(t);
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.$scope = e;
        const i = this.sourceExpression;
        if (i.hasBind) i.bind(t, e, this.interceptor);
        if (this.delegationStrategy === j.none) this.target.addEventListener(this.targetEvent, this); else this.handler = this.eventDelegator.addEventListener(this.locator.get(Qi), this.target, this.targetEvent, this, hs[this.delegationStrategy]);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        const e = this.sourceExpression;
        if (e.hasUnbind) e.unbind(t, this.$scope, this.interceptor);
        this.$scope = null;
        if (this.delegationStrategy === j.none) this.target.removeEventListener(this.targetEvent, this); else {
            this.handler.dispose();
            this.handler = null;
        }
        this.isBound = false;
    }
    observe(t, e) {
        return;
    }
    handleChange(t, e, i) {
        return;
    }
}

const as = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = as) {
        this._t = t;
        this.jt = e;
        this.Nt = i;
        this.Wt = 0;
        this.Ht = new Map;
        this.zt = new Map;
    }
    Gt() {
        if (1 === ++this.Wt) this._t.addEventListener(this.jt, this, this.Nt);
    }
    Xt() {
        if (0 === --this.Wt) this._t.removeEventListener(this.jt, this, this.Nt);
    }
    dispose() {
        if (this.Wt > 0) {
            this.Wt = 0;
            this._t.removeEventListener(this.jt, this, this.Nt);
        }
        this.Ht.clear();
        this.zt.clear();
    }
    Kt(t) {
        const e = true === this.Nt.capture ? this.Ht : this.zt;
        let i = e.get(t);
        if (void 0 === i) e.set(t, i = Mt());
        return i;
    }
    handleEvent(t) {
        const e = true === this.Nt.capture ? this.Ht : this.zt;
        const i = t.composedPath();
        if (true === this.Nt.capture) i.reverse();
        for (const s of i) {
            const i = e.get(s);
            if (void 0 === i) continue;
            const n = i[this.jt];
            if (void 0 === n) continue;
            if ("function" === typeof n) n(t); else n.handleEvent(t);
            if (true === t.cancelBubble) return;
        }
    }
}

class DelegateSubscription {
    constructor(t, e, i, s) {
        this.Yt = t;
        this.Qt = e;
        this.jt = i;
        t.Gt();
        e[i] = s;
    }
    dispose() {
        this.Yt.Xt();
        this.Qt[this.jt] = void 0;
    }
}

class EventSubscriber {
    constructor(t) {
        this.config = t;
        this.target = null;
        this.handler = null;
    }
    subscribe(t, e) {
        this.target = t;
        this.handler = e;
        let i;
        for (i of this.config.events) t.addEventListener(i, e);
    }
    dispose() {
        const {target: t, handler: e} = this;
        let i;
        if (null !== t && null !== e) for (i of this.config.events) t.removeEventListener(i, e);
        this.target = this.handler = null;
    }
}

const cs = l.createInterface("IEventDelegator", (t => t.singleton(EventDelegator)));

class EventDelegator {
    constructor() {
        this.Zt = Mt();
    }
    addEventListener(t, e, i, s, n) {
        var r;
        var o;
        const l = null !== (r = (o = this.Zt)[i]) && void 0 !== r ? r : o[i] = new Map;
        let h = l.get(t);
        if (void 0 === h) l.set(t, h = new ListenerTracker(t, i, n));
        return new DelegateSubscription(h, h.Kt(e), i, s);
    }
    dispose() {
        for (const t in this.Zt) {
            const e = this.Zt[t];
            for (const t of e.values()) t.dispose();
            e.clear();
        }
    }
}

const us = l.createInterface("IProjections");

const fs = l.createInterface("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

var ds;

(function(t) {
    t["hydrateElement"] = "ra";
    t["hydrateAttribute"] = "rb";
    t["hydrateTemplateController"] = "rc";
    t["hydrateLetElement"] = "rd";
    t["setProperty"] = "re";
    t["interpolation"] = "rf";
    t["propertyBinding"] = "rg";
    t["callBinding"] = "rh";
    t["letBinding"] = "ri";
    t["refBinding"] = "rj";
    t["iteratorBinding"] = "rk";
    t["textBinding"] = "ha";
    t["listenerBinding"] = "hb";
    t["attributeBinding"] = "hc";
    t["stylePropertyBinding"] = "hd";
    t["setAttribute"] = "he";
    t["setClassAttribute"] = "hf";
    t["setStyleAttribute"] = "hg";
    t["spreadBinding"] = "hs";
    t["spreadElementProp"] = "hp";
})(ds || (ds = {}));

const ms = l.createInterface("Instruction");

function vs(t) {
    const e = t.type;
    return "string" === typeof e && 2 === e.length;
}

class InterpolationInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
    }
    get type() {
        return "rf";
    }
}

class PropertyBindingInstruction {
    constructor(t, e, i) {
        this.from = t;
        this.to = e;
        this.mode = i;
    }
    get type() {
        return "rg";
    }
}

class IteratorBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
    }
    get type() {
        return "rk";
    }
}

class CallBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
    }
    get type() {
        return "rh";
    }
}

class RefBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
    }
    get type() {
        return "rj";
    }
}

class SetPropertyInstruction {
    constructor(t, e) {
        this.value = t;
        this.to = e;
    }
    get type() {
        return "re";
    }
}

class HydrateElementInstruction {
    constructor(t, e, i, s, n, r) {
        this.res = t;
        this.alias = e;
        this.props = i;
        this.projections = s;
        this.containerless = n;
        this.captures = r;
        this.auSlot = null;
    }
    get type() {
        return "ra";
    }
}

class HydrateAttributeInstruction {
    constructor(t, e, i) {
        this.res = t;
        this.alias = e;
        this.props = i;
    }
    get type() {
        return "rb";
    }
}

class HydrateTemplateController {
    constructor(t, e, i, s) {
        this.def = t;
        this.res = e;
        this.alias = i;
        this.props = s;
    }
    get type() {
        return "rc";
    }
}

class HydrateLetElementInstruction {
    constructor(t, e) {
        this.instructions = t;
        this.toBindingContext = e;
    }
    get type() {
        return "rd";
    }
}

class LetBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
    }
    get type() {
        return "ri";
    }
}

class TextBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.strict = e;
    }
    get type() {
        return "ha";
    }
}

class ListenerBindingInstruction {
    constructor(t, e, i, s) {
        this.from = t;
        this.to = e;
        this.preventDefault = i;
        this.strategy = s;
    }
    get type() {
        return "hb";
    }
}

class StylePropertyBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
    }
    get type() {
        return "hd";
    }
}

class SetAttributeInstruction {
    constructor(t, e) {
        this.value = t;
        this.to = e;
    }
    get type() {
        return "he";
    }
}

class SetClassAttributeInstruction {
    constructor(t) {
        this.value = t;
        this.type = "hf";
    }
}

class SetStyleAttributeInstruction {
    constructor(t) {
        this.value = t;
        this.type = "hg";
    }
}

class AttributeBindingInstruction {
    constructor(t, e, i) {
        this.attr = t;
        this.from = e;
        this.to = i;
    }
    get type() {
        return "hc";
    }
}

class SpreadBindingInstruction {
    get type() {
        return "hs";
    }
}

class SpreadElementPropBindingInstruction {
    constructor(t) {
        this.instructions = t;
    }
    get type() {
        return "hp";
    }
}

const ps = l.createInterface("ITemplateCompiler");

const gs = l.createInterface("IRenderer");

function ws(t) {
    return function i(s) {
        const n = function(...e) {
            const i = new s(...e);
            i.instructionType = t;
            return i;
        };
        n.register = function t(e) {
            c.singleton(gs, n).register(e);
        };
        const r = e.getOwnKeys(s);
        for (const t of r) at(t, lt(t, s), n);
        const o = Object.getOwnPropertyDescriptors(s);
        Object.keys(o).filter((t => "prototype" !== t)).forEach((t => {
            Reflect.defineProperty(n, t, o[t]);
        }));
        return n;
    };
}

function bs(t, e, i) {
    if ("string" === typeof e) return t.parse(e, i);
    return e;
}

function xs(t) {
    if (null != t.viewModel) return t.viewModel;
    return t;
}

function ys(t, e) {
    if ("element" === e) return t;
    switch (e) {
      case "controller":
        return Ke.for(t);

      case "view":
        throw new Error("AUR0750");

      case "view-model":
        return Ke.for(t).viewModel;

      default:
        {
            const i = Ie.for(t, e);
            if (void 0 !== i) return i.viewModel;
            const s = Ke.for(t, {
                name: e
            });
            if (void 0 === s) throw new Error(`AUR0751:${e}`);
            return s.viewModel;
        }
    }
}

let ks = class SetPropertyRenderer {
    render(t, e, i) {
        const s = xs(e);
        if (void 0 !== s.$observers && void 0 !== s.$observers[i.to]) s.$observers[i.to].setValue(i.value, 2); else s[i.to] = i.value;
    }
};

ks = rt([ ws("re") ], ks);

let Cs = class CustomElementRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Ai, _t ];
    }
    render(t, e, i) {
        let s;
        let n;
        let r;
        let o;
        const l = i.res;
        const h = i.projections;
        const a = t.container;
        const c = Ks(this.p, t, e, i, e, null == h ? void 0 : new AuSlotsInfo(Object.keys(h)));
        switch (typeof l) {
          case "string":
            s = a.find(Ke, l);
            if (null == s) throw new Error(`AUR0752:${l}@${t["name"]}`);
            break;

          default:
            s = l;
        }
        n = s.Type;
        r = c.invoke(n);
        c.registerResolver(n, new x(s.key, r));
        o = Controller.$el(c, r, e, i, s);
        Ki(e, s.key, o);
        const u = this.r.renderers;
        const f = i.props;
        const d = f.length;
        let m = 0;
        let v;
        while (d > m) {
            v = f[m];
            u[v.type].render(t, o, v);
            ++m;
        }
        t.addChild(o);
    }
};

Cs = rt([ ws("ra") ], Cs);

let As = class CustomAttributeRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Ai, _t ];
    }
    render(t, e, i) {
        let s = t.container;
        let n;
        switch (typeof i.res) {
          case "string":
            n = s.find(Ie, i.res);
            if (null == n) throw new Error(`AUR0753:${i.res}@${t["name"]}`);
            break;

          default:
            n = i.res;
        }
        const r = Ys(this.p, n, t, e, i, void 0, void 0);
        const o = Controller.$attr(t.container, r, e, n);
        Ki(e, n.key, o);
        const l = this.r.renderers;
        const h = i.props;
        const a = h.length;
        let c = 0;
        let u;
        while (a > c) {
            u = h[c];
            l[u.type].render(t, o, u);
            ++c;
        }
        t.addChild(o);
    }
};

As = rt([ ws("rb") ], As);

let Ss = class TemplateControllerRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Ai, _t ];
    }
    render(t, e, i) {
        var s;
        let n = t.container;
        let r;
        switch (typeof i.res) {
          case "string":
            r = n.find(Ie, i.res);
            if (null == r) throw new Error(`AUR0754:${i.res}@${t["name"]}`);
            break;

          default:
            r = i.res;
        }
        const o = this.r.getViewFactory(i.def, n);
        const l = ss(e);
        const h = Ys(this.p, r, t, e, i, o, l);
        const a = Controller.$attr(t.container, h, e, r);
        Ki(l, r.key, a);
        null === (s = h.link) || void 0 === s ? void 0 : s.call(h, t, a, e, i);
        const c = this.r.renderers;
        const u = i.props;
        const f = u.length;
        let d = 0;
        let m;
        while (f > d) {
            m = u[d];
            c[m.type].render(t, a, m);
            ++d;
        }
        t.addChild(a);
    }
};

Ss = rt([ ws("rc") ], Ss);

let Rs = class LetElementRenderer {
    constructor(t, e) {
        this.ep = t;
        this.oL = e;
    }
    render(t, e, i) {
        e.remove();
        const s = i.instructions;
        const n = i.toBindingContext;
        const r = t.container;
        const o = s.length;
        let l;
        let h;
        let a;
        let c = 0;
        while (o > c) {
            l = s[c];
            h = bs(this.ep, l.from, 8);
            a = new LetBinding(h, l.to, this.oL, r, n);
            t.addBinding(38962 === h.$kind ? $s(a, h, r) : a);
            ++c;
        }
    }
};

Rs.inject = [ V, F ];

Rs = rt([ ws("rd") ], Rs);

let Es = class CallBindingRenderer {
    constructor(t, e) {
        this.ep = t;
        this.oL = e;
    }
    render(t, e, i) {
        const s = bs(this.ep, i.from, 8 | 4);
        const n = new CallBinding(s, xs(e), i.to, this.oL, t.container);
        t.addBinding(38962 === s.$kind ? $s(n, s, t.container) : n);
    }
};

Es.inject = [ V, F ];

Es = rt([ ws("rh") ], Es);

let Bs = class RefBindingRenderer {
    constructor(t) {
        this.ep = t;
    }
    render(t, e, i) {
        const s = bs(this.ep, i.from, 8);
        const n = new RefBinding(s, ys(e, i.to), t.container);
        t.addBinding(38962 === s.$kind ? $s(n, s, t.container) : n);
    }
};

Bs.inject = [ V ];

Bs = rt([ ws("rj") ], Bs);

let Is = class InterpolationBindingRenderer {
    constructor(t, e, i) {
        this.ep = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i) {
        const s = t.container;
        const n = bs(this.ep, i.from, 1);
        const r = new InterpolationBinding(this.oL, n, xs(e), i.to, D.toView, s, this.p.domWriteQueue);
        const o = r.partBindings;
        const l = o.length;
        let h = 0;
        let a;
        for (;l > h; ++h) {
            a = o[h];
            if (38962 === a.sourceExpression.$kind) o[h] = $s(a, a.sourceExpression, s);
        }
        t.addBinding(r);
    }
};

Is.inject = [ V, F, _t ];

Is = rt([ ws("rf") ], Is);

let Ts = class PropertyBindingRenderer {
    constructor(t, e, i) {
        this.ep = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i) {
        const s = bs(this.ep, i.from, 8);
        const n = new PropertyBinding(s, xs(e), i.to, i.mode, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(38962 === s.$kind ? $s(n, s, t.container) : n);
    }
};

Ts.inject = [ V, F, _t ];

Ts = rt([ ws("rg") ], Ts);

let Ds = class IteratorBindingRenderer {
    constructor(t, e, i) {
        this.ep = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i) {
        const s = bs(this.ep, i.from, 2);
        const n = new PropertyBinding(s, xs(e), i.to, D.toView, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(38962 === s.iterable.$kind ? $s(n, s.iterable, t.container) : n);
    }
};

Ds.inject = [ V, F, _t ];

Ds = rt([ ws("rk") ], Ds);

let Ps = 0;

const Os = [];

function $s(t, e, i) {
    while (e instanceof N) {
        Os[Ps++] = e;
        e = e.expression;
    }
    while (Ps > 0) {
        const e = Os[--Ps];
        const s = i.get(e.behaviorKey);
        if (s instanceof W) t = s.construct(t, e);
    }
    Os.length = 0;
    return t;
}

let Ls = class TextBindingRenderer {
    constructor(t, e, i) {
        this.ep = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i) {
        const s = t.container;
        const n = e.nextSibling;
        const r = e.parentNode;
        const o = this.p.document;
        const l = bs(this.ep, i.from, 1);
        const h = l.parts;
        const a = l.expressions;
        const c = a.length;
        let u = 0;
        let f = h[0];
        let d;
        let m;
        if ("" !== f) r.insertBefore(o.createTextNode(f), n);
        for (;c > u; ++u) {
            m = a[u];
            d = new ContentBinding(m, r.insertBefore(o.createTextNode(""), n), s, this.oL, this.p, i.strict);
            t.addBinding(38962 === m.$kind ? $s(d, m, s) : d);
            f = h[u + 1];
            if ("" !== f) r.insertBefore(o.createTextNode(f), n);
        }
        if ("AU-M" === e.nodeName) e.remove();
    }
};

Ls.inject = [ V, F, _t ];

Ls = rt([ ws("ha") ], Ls);

let qs = class ListenerBindingRenderer {
    constructor(t, e, i) {
        this.ep = t;
        this.Jt = e;
        this.p = i;
    }
    render(t, e, i) {
        const s = bs(this.ep, i.from, 4);
        const n = new Listener(this.p, i.to, i.strategy, s, e, i.preventDefault, this.Jt, t.container);
        t.addBinding(38962 === s.$kind ? $s(n, s, t.container) : n);
    }
};

qs.inject = [ V, cs, _t ];

qs = rt([ ws("hb") ], qs);

let Ms = class SetAttributeRenderer {
    render(t, e, i) {
        e.setAttribute(i.to, i.value);
    }
};

Ms = rt([ ws("he") ], Ms);

let Us = class SetClassAttributeRenderer {
    render(t, e, i) {
        Ns(e.classList, i.value);
    }
};

Us = rt([ ws("hf") ], Us);

let Fs = class SetStyleAttributeRenderer {
    render(t, e, i) {
        e.style.cssText += i.value;
    }
};

Fs = rt([ ws("hg") ], Fs);

let Vs = class StylePropertyBindingRenderer {
    constructor(t, e, i) {
        this.ep = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i) {
        const s = bs(this.ep, i.from, 8);
        const n = new PropertyBinding(s, e.style, i.to, D.toView, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(38962 === s.$kind ? $s(n, s, t.container) : n);
    }
};

Vs.inject = [ V, F, _t ];

Vs = rt([ ws("hd") ], Vs);

let _s = class AttributeBindingRenderer {
    constructor(t, e) {
        this.ep = t;
        this.oL = e;
    }
    render(t, e, i) {
        const s = bs(this.ep, i.from, 8);
        const n = new AttributeBinding(s, e, i.attr, i.to, D.toView, this.oL, t.container);
        t.addBinding(38962 === s.$kind ? $s(n, s, t.container) : n);
    }
};

_s.inject = [ V, F ];

_s = rt([ ws("hc") ], _s);

let js = class SpreadRenderer {
    constructor(t, e) {
        this.te = t;
        this.r = e;
    }
    static get inject() {
        return [ ps, Ai ];
    }
    render(t, e, i) {
        const s = t.container;
        const n = s.get(_i);
        const r = this.r.renderers;
        const o = t => {
            let e = t;
            let i = n;
            while (null != i && e > 0) {
                i = i.parent;
                --e;
            }
            if (null == i) throw new Error("No scope context for spread binding.");
            return i;
        };
        const l = i => {
            var s, n;
            const a = o(i);
            const c = Ws(a);
            const u = this.te.compileSpread(a.controller.definition, null !== (n = null === (s = a.instruction) || void 0 === s ? void 0 : s.captures) && void 0 !== n ? n : h, a.controller.container, e);
            let f;
            for (f of u) switch (f.type) {
              case "hs":
                l(i + 1);
                break;

              case "hp":
                r[f.instructions.type].render(c, Ke.for(e), f.instructions);
                break;

              default:
                r[f.type].render(c, e, f);
            }
            t.addBinding(c);
        };
        l(0);
    }
};

js = rt([ ws("hs") ], js);

class SpreadBinding {
    constructor(t, e) {
        this.ee = t;
        this.ie = e;
        this.interceptor = this;
        this.isBound = false;
        this.ctrl = e.controller;
        this.locator = this.ctrl.container;
    }
    get container() {
        return this.locator;
    }
    get definition() {
        return this.ctrl.definition;
    }
    get isStrictBinding() {
        return this.ctrl.isStrictBinding;
    }
    $bind(t, e) {
        var i;
        if (this.isBound) return;
        this.isBound = true;
        const s = this.$scope = null !== (i = this.ie.controller.scope.parentScope) && void 0 !== i ? i : void 0;
        if (null == s) throw new Error("Invalid spreading. Context scope is null/undefined");
        this.ee.forEach((e => e.$bind(t, s)));
    }
    $unbind(t) {
        this.ee.forEach((e => e.$unbind(t)));
        this.isBound = false;
    }
    addBinding(t) {
        this.ee.push(t);
    }
    addChild(t) {
        if (1 !== t.vmKind) throw new Error("Spread binding does not support spreading custom attributes/template controllers");
        this.ctrl.addChild(t);
    }
}

function Ns(t, e) {
    const i = e.length;
    let s = 0;
    for (let n = 0; n < i; ++n) if (32 === e.charCodeAt(n)) {
        if (n !== s) t.add(e.slice(s, n));
        s = n + 1;
    } else if (n + 1 === i) t.add(e.slice(s));
}

const Ws = t => new SpreadBinding([], t);

const Hs = "IController";

const zs = "IInstruction";

const Gs = "IRenderLocation";

const Xs = "IAuSlotsInfo";

function Ks(t, e, i, s, n, r) {
    const o = e.container.createChild();
    o.registerResolver(t.HTMLElement, o.registerResolver(t.Element, o.registerResolver(Yi, new x("ElementResolver", i))));
    o.registerResolver(Vi, new x(Hs, e));
    o.registerResolver(ms, new x(zs, s));
    o.registerResolver(Zi, null == n ? Qs : new x(Gs, n));
    o.registerResolver(pi, Zs);
    o.registerResolver(fs, null == r ? Js : new x(Xs, r));
    return o;
}

class ViewFactoryProvider {
    constructor(t) {
        this.f = t;
    }
    get $isResolver() {
        return true;
    }
    resolve() {
        const t = this.f;
        if (null === t) throw new Error("AUR7055");
        if ("string" !== typeof t.name || 0 === t.name.length) throw new Error("AUR0756");
        return t;
    }
}

function Ys(t, e, i, s, n, r, o, l) {
    const h = i.container.createChild();
    h.registerResolver(t.HTMLElement, h.registerResolver(t.Element, h.registerResolver(Yi, new x("ElementResolver", s))));
    i = i instanceof Controller ? i : i.ctrl;
    h.registerResolver(Vi, new x(Hs, i));
    h.registerResolver(ms, new x(zs, n));
    h.registerResolver(Zi, null == o ? Qs : new x(Gs, o));
    h.registerResolver(pi, null == r ? Zs : new ViewFactoryProvider(r));
    h.registerResolver(fs, null == l ? Js : new x(Xs, l));
    return h.invoke(e.Type);
}

const Qs = new x(Gs);

const Zs = new ViewFactoryProvider(null);

const Js = new x(Xs, new AuSlotsInfo(h));

var tn;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["IgnoreAttr"] = 1] = "IgnoreAttr";
})(tn || (tn = {}));

function en(t) {
    return function(e) {
        return on.define(t, e);
    };
}

class BindingCommandDefinition {
    constructor(t, e, i, s, n) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.type = n;
    }
    static create(t, e) {
        let i;
        let s;
        if ("string" === typeof t) {
            i = t;
            s = {
                name: i
            };
        } else {
            i = t.name;
            s = t;
        }
        return new BindingCommandDefinition(e, n(rn(e, "name"), i), f(rn(e, "aliases"), s.aliases, e.aliases), nn(i), n(rn(e, "type"), s.type, e.type, null));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        c.singleton(i, e).register(t);
        c.aliasTo(i, e).register(t);
        L(s, on, i, t);
    }
}

const sn = dt("binding-command");

const nn = t => `${sn}:${t}`;

const rn = (t, e) => lt(ft(e), t);

const on = Object.freeze({
    name: sn,
    keyFrom: nn,
    define(t, e) {
        const i = BindingCommandDefinition.create(t, e);
        at(sn, i, i.Type);
        at(sn, i, i);
        mt(e, sn);
        return i.Type;
    },
    getAnnotation: rn
});

let ln = class OneTimeBindingCommand {
    constructor(t, e) {
        this.type = 0;
        this.m = t;
        this.ep = e;
    }
    get name() {
        return "one-time";
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = t.attr.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : S(s); else {
            if ("" === n && 1 === t.def.type) n = S(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.ep.parse(n, 8), s, D.oneTime);
    }
};

ln.inject = [ Wt, V ];

ln = rt([ en("one-time") ], ln);

let hn = class ToViewBindingCommand {
    constructor(t, e) {
        this.type = 0;
        this.m = t;
        this.ep = e;
    }
    get name() {
        return "to-view";
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = t.attr.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : S(s); else {
            if ("" === n && 1 === t.def.type) n = S(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.ep.parse(n, 8), s, D.toView);
    }
};

hn.inject = [ Wt, V ];

hn = rt([ en("to-view") ], hn);

let an = class FromViewBindingCommand {
    constructor(t, e) {
        this.type = 0;
        this.m = t;
        this.ep = e;
    }
    get name() {
        return "from-view";
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = i.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : S(s); else {
            if ("" === n && 1 === t.def.type) n = S(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.ep.parse(n, 8), s, D.fromView);
    }
};

an.inject = [ Wt, V ];

an = rt([ en("from-view") ], an);

let cn = class TwoWayBindingCommand {
    constructor(t, e) {
        this.type = 0;
        this.m = t;
        this.ep = e;
    }
    get name() {
        return "two-way";
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = i.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : S(s); else {
            if ("" === n && 1 === t.def.type) n = S(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.ep.parse(n, 8), s, D.twoWay);
    }
};

cn.inject = [ Wt, V ];

cn = rt([ en("two-way") ], cn);

let un = class DefaultBindingCommand {
    constructor(t, e) {
        this.type = 0;
        this.m = t;
        this.ep = e;
    }
    get name() {
        return "bind";
    }
    build(t) {
        var e;
        const i = t.attr;
        const s = t.bindable;
        let n;
        let r;
        let o = i.target;
        let l = i.rawValue;
        if (null == s) {
            r = this.m.isTwoWay(t.node, o) ? D.twoWay : D.toView;
            o = null !== (e = this.m.map(t.node, o)) && void 0 !== e ? e : S(o);
        } else {
            if ("" === l && 1 === t.def.type) l = S(o);
            n = t.def.defaultBindingMode;
            r = s.mode === D.default || null == s.mode ? null == n || n === D.default ? D.toView : n : s.mode;
            o = s.property;
        }
        return new PropertyBindingInstruction(this.ep.parse(l, 8), o, r);
    }
};

un.inject = [ Wt, V ];

un = rt([ en("bind") ], un);

let fn = class CallBindingCommand {
    constructor(t) {
        this.type = 0;
        this.ep = t;
    }
    get name() {
        return "call";
    }
    build(t) {
        const e = null === t.bindable ? S(t.attr.target) : t.bindable.property;
        return new CallBindingInstruction(this.ep.parse(t.attr.rawValue, 8 | 4), e);
    }
};

fn.inject = [ V ];

fn = rt([ en("call") ], fn);

let dn = class ForBindingCommand {
    constructor(t) {
        this.type = 0;
        this.ep = t;
    }
    get name() {
        return "for";
    }
    build(t) {
        const e = null === t.bindable ? S(t.attr.target) : t.bindable.property;
        return new IteratorBindingInstruction(this.ep.parse(t.attr.rawValue, 2), e);
    }
};

dn.inject = [ V ];

dn = rt([ en("for") ], dn);

let mn = class TriggerBindingCommand {
    constructor(t) {
        this.type = 1;
        this.ep = t;
    }
    get name() {
        return "trigger";
    }
    build(t) {
        return new ListenerBindingInstruction(this.ep.parse(t.attr.rawValue, 4), t.attr.target, true, j.none);
    }
};

mn.inject = [ V ];

mn = rt([ en("trigger") ], mn);

let vn = class DelegateBindingCommand {
    constructor(t) {
        this.type = 1;
        this.ep = t;
    }
    get name() {
        return "delegate";
    }
    build(t) {
        return new ListenerBindingInstruction(this.ep.parse(t.attr.rawValue, 4), t.attr.target, false, j.bubbling);
    }
};

vn.inject = [ V ];

vn = rt([ en("delegate") ], vn);

let pn = class CaptureBindingCommand {
    constructor(t) {
        this.type = 1;
        this.ep = t;
    }
    get name() {
        return "capture";
    }
    build(t) {
        return new ListenerBindingInstruction(this.ep.parse(t.attr.rawValue, 4), t.attr.target, false, j.capturing);
    }
};

pn.inject = [ V ];

pn = rt([ en("capture") ], pn);

let gn = class AttrBindingCommand {
    constructor(t) {
        this.type = 1;
        this.ep = t;
    }
    get name() {
        return "attr";
    }
    build(t) {
        return new AttributeBindingInstruction(t.attr.target, this.ep.parse(t.attr.rawValue, 8), t.attr.target);
    }
};

gn.inject = [ V ];

gn = rt([ en("attr") ], gn);

let wn = class StyleBindingCommand {
    constructor(t) {
        this.type = 1;
        this.ep = t;
    }
    get name() {
        return "style";
    }
    build(t) {
        return new AttributeBindingInstruction("style", this.ep.parse(t.attr.rawValue, 8), t.attr.target);
    }
};

wn.inject = [ V ];

wn = rt([ en("style") ], wn);

let bn = class ClassBindingCommand {
    constructor(t) {
        this.type = 1;
        this.ep = t;
    }
    get name() {
        return "class";
    }
    build(t) {
        return new AttributeBindingInstruction("class", this.ep.parse(t.attr.rawValue, 8), t.attr.target);
    }
};

bn.inject = [ V ];

bn = rt([ en("class") ], bn);

let xn = class RefBindingCommand {
    constructor(t) {
        this.type = 1;
        this.ep = t;
    }
    get name() {
        return "ref";
    }
    build(t) {
        return new RefBindingInstruction(this.ep.parse(t.attr.rawValue, 8), t.attr.target);
    }
};

xn.inject = [ V ];

xn = rt([ en("ref") ], xn);

let yn = class SpreadBindingCommand {
    constructor() {
        this.type = 1;
    }
    get name() {
        return "...$attrs";
    }
    build(t) {
        return new SpreadBindingInstruction;
    }
};

yn = rt([ en("...$attrs") ], yn);

const kn = l.createInterface("ITemplateElementFactory", (t => t.singleton(TemplateElementFactory)));

const Cn = {};

class TemplateElementFactory {
    constructor(t) {
        this.p = t;
        this.se = t.document.createElement("template");
    }
    createTemplate(t) {
        var e;
        if ("string" === typeof t) {
            let e = Cn[t];
            if (void 0 === e) {
                const i = this.se;
                i.innerHTML = t;
                const s = i.content.firstElementChild;
                if (null == s || "TEMPLATE" !== s.nodeName || null != s.nextElementSibling) {
                    this.se = this.p.document.createElement("template");
                    e = i;
                } else {
                    i.content.removeChild(s);
                    e = s;
                }
                Cn[t] = e;
            }
            return e.cloneNode(true);
        }
        if ("TEMPLATE" !== t.nodeName) {
            const e = this.p.document.createElement("template");
            e.content.appendChild(t);
            return e;
        }
        null === (e = t.parentNode) || void 0 === e ? void 0 : e.removeChild(t);
        return t.cloneNode(true);
    }
}

TemplateElementFactory.inject = [ _t ];

const An = function(t) {
    function e(t, i, s) {
        l.inject(e)(t, i, s);
    }
    e.$isResolver = true;
    e.resolve = function(e, i) {
        if (i.root === i) return i.getAll(t, false);
        return i.has(t, false) ? i.getAll(t, false).concat(i.root.getAll(t, false)) : i.root.getAll(t, false);
    };
    return e;
};

class TemplateCompiler {
    constructor() {
        this.debug = false;
        this.resolveResources = true;
    }
    static register(t) {
        return c.singleton(ps, this).register(t);
    }
    compile(t, e, i) {
        var s, n, r, o;
        const l = CustomElementDefinition.getOrCreate(t);
        if (null === l.template || void 0 === l.template) return l;
        if (false === l.needsCompile) return l;
        null !== i && void 0 !== i ? i : i = En;
        const a = new CompilationContext(t, e, i, null, null, void 0);
        const c = "string" === typeof l.template || !t.enhance ? a.ne.createTemplate(l.template) : l.template;
        const u = "TEMPLATE" === c.nodeName && null != c.content;
        const f = u ? c.content : c;
        const d = e.get(An(Un));
        const m = d.length;
        let v = 0;
        if (m > 0) while (m > v) {
            null === (n = (s = d[v]).compiling) || void 0 === n ? void 0 : n.call(s, c);
            ++v;
        }
        if (c.hasAttribute(Ln)) throw new Error("AUR0701");
        this.re(f, a);
        this.oe(f, a);
        return CustomElementDefinition.create({
            ...t,
            name: t.name || Nn(),
            dependencies: (null !== (r = t.dependencies) && void 0 !== r ? r : h).concat(null !== (o = a.deps) && void 0 !== o ? o : h),
            instructions: a.rows,
            surrogates: u ? this.le(c, a) : h,
            template: c,
            hasSlots: a.hasSlot,
            needsCompile: false
        });
    }
    compileSpread(t, e, i, s) {
        var n;
        const r = new CompilationContext(t, i, En, null, null, void 0);
        const o = [];
        const l = r.he(s.nodeName.toLowerCase());
        const h = r.ep;
        const a = e.length;
        let c = 0;
        let u;
        let f = null;
        let d;
        let m;
        let v;
        let p;
        let g;
        let w = null;
        let b;
        let x;
        let y;
        let k;
        for (;a > c; ++c) {
            u = e[c];
            y = u.target;
            k = u.rawValue;
            w = r.ae(u);
            if (null !== w && (1 & w.type) > 0) {
                In.node = s;
                In.attr = u;
                In.bindable = null;
                In.def = null;
                o.push(w.build(In));
                continue;
            }
            f = r.ce(y);
            if (null !== f) {
                if (f.isTemplateController) throw new Error(`AUR0703:${y}`);
                v = BindablesInfo.from(f, true);
                x = false === f.noMultiBindings && null === w && Sn(k);
                if (x) m = this.ue(s, k, f, r); else {
                    g = v.primary;
                    if (null === w) {
                        b = h.parse(k, 1);
                        m = [ null === b ? new SetPropertyInstruction(k, g.property) : new InterpolationInstruction(b, g.property) ];
                    } else {
                        In.node = s;
                        In.attr = u;
                        In.bindable = g;
                        In.def = f;
                        m = [ w.build(In) ];
                    }
                }
                (null !== d && void 0 !== d ? d : d = []).push(new HydrateAttributeInstruction(this.resolveResources ? f : f.name, null != f.aliases && f.aliases.includes(y) ? y : void 0, m));
                continue;
            }
            if (null === w) {
                b = h.parse(k, 1);
                if (null !== l) {
                    v = BindablesInfo.from(l, false);
                    p = v.attrs[y];
                    if (void 0 !== p) {
                        b = h.parse(k, 1);
                        o.push(new SpreadElementPropBindingInstruction(null == b ? new SetPropertyInstruction(k, p.property) : new InterpolationInstruction(b, p.property)));
                        continue;
                    }
                }
                if (null != b) o.push(new InterpolationInstruction(b, null !== (n = r.m.map(s, y)) && void 0 !== n ? n : S(y))); else switch (y) {
                  case "class":
                    o.push(new SetClassAttributeInstruction(k));
                    break;

                  case "style":
                    o.push(new SetStyleAttributeInstruction(k));
                    break;

                  default:
                    o.push(new SetAttributeInstruction(k, y));
                }
            } else {
                if (null !== l) {
                    v = BindablesInfo.from(l, false);
                    p = v.attrs[y];
                    if (void 0 !== p) {
                        In.node = s;
                        In.attr = u;
                        In.bindable = p;
                        In.def = l;
                        o.push(new SpreadElementPropBindingInstruction(w.build(In)));
                        continue;
                    }
                }
                In.node = s;
                In.attr = u;
                In.bindable = null;
                In.def = null;
                o.push(w.build(In));
            }
        }
        Rn();
        if (null != d) return d.concat(o);
        return o;
    }
    le(t, e) {
        var i;
        const s = [];
        const n = t.attributes;
        const r = e.ep;
        let o = n.length;
        let l = 0;
        let h;
        let a;
        let c;
        let u;
        let f = null;
        let d;
        let m;
        let v;
        let p;
        let g = null;
        let w;
        let b;
        let x;
        let y;
        for (;o > l; ++l) {
            h = n[l];
            a = h.name;
            c = h.value;
            u = e.fe.parse(a, c);
            x = u.target;
            y = u.rawValue;
            if (Tn[x]) throw new Error(`AUR0702:${a}`);
            g = e.ae(u);
            if (null !== g && (1 & g.type) > 0) {
                In.node = t;
                In.attr = u;
                In.bindable = null;
                In.def = null;
                s.push(g.build(In));
                continue;
            }
            f = e.ce(x);
            if (null !== f) {
                if (f.isTemplateController) throw new Error(`AUR0703:${x}`);
                v = BindablesInfo.from(f, true);
                b = false === f.noMultiBindings && null === g && Sn(y);
                if (b) m = this.ue(t, y, f, e); else {
                    p = v.primary;
                    if (null === g) {
                        w = r.parse(y, 1);
                        m = [ null === w ? new SetPropertyInstruction(y, p.property) : new InterpolationInstruction(w, p.property) ];
                    } else {
                        In.node = t;
                        In.attr = u;
                        In.bindable = p;
                        In.def = f;
                        m = [ g.build(In) ];
                    }
                }
                t.removeAttribute(a);
                --l;
                --o;
                (null !== d && void 0 !== d ? d : d = []).push(new HydrateAttributeInstruction(this.resolveResources ? f : f.name, null != f.aliases && f.aliases.includes(x) ? x : void 0, m));
                continue;
            }
            if (null === g) {
                w = r.parse(y, 1);
                if (null != w) {
                    t.removeAttribute(a);
                    --l;
                    --o;
                    s.push(new InterpolationInstruction(w, null !== (i = e.m.map(t, x)) && void 0 !== i ? i : S(x)));
                } else switch (a) {
                  case "class":
                    s.push(new SetClassAttributeInstruction(y));
                    break;

                  case "style":
                    s.push(new SetStyleAttributeInstruction(y));
                    break;

                  default:
                    s.push(new SetAttributeInstruction(y, a));
                }
            } else {
                In.node = t;
                In.attr = u;
                In.bindable = null;
                In.def = null;
                s.push(g.build(In));
            }
        }
        Rn();
        if (null != d) return d.concat(s);
        return s;
    }
    oe(t, e) {
        switch (t.nodeType) {
          case 1:
            switch (t.nodeName) {
              case "LET":
                return this.de(t, e);

              default:
                return this.me(t, e);
            }

          case 3:
            return this.ve(t, e);

          case 11:
            {
                let i = t.firstChild;
                while (null !== i) i = this.oe(i, e);
                break;
            }
        }
        return t.nextSibling;
    }
    de(t, e) {
        const i = t.attributes;
        const s = i.length;
        const n = [];
        const r = e.ep;
        let o = false;
        let l = 0;
        let h;
        let a;
        let c;
        let u;
        let f;
        let d;
        let m;
        let v;
        for (;s > l; ++l) {
            h = i[l];
            c = h.name;
            u = h.value;
            if ("to-binding-context" === c) {
                o = true;
                continue;
            }
            a = e.fe.parse(c, u);
            d = a.target;
            m = a.rawValue;
            f = e.ae(a);
            if (null !== f) switch (f.name) {
              case "to-view":
              case "bind":
                n.push(new LetBindingInstruction(r.parse(m, 8), S(d)));
                continue;

              default:
                throw new Error(`AUR0704:${a.command}`);
            }
            v = r.parse(m, 1);
            n.push(new LetBindingInstruction(null === v ? new H(m) : v, S(d)));
        }
        e.rows.push([ new HydrateLetElementInstruction(n, o) ]);
        return this.pe(t).nextSibling;
    }
    me(t, e) {
        var i, s, n, r, l, a;
        var c, u;
        const f = t.nextSibling;
        const d = (null !== (i = t.getAttribute("as-element")) && void 0 !== i ? i : t.nodeName).toLowerCase();
        const m = e.he(d);
        const v = !!(null === m || void 0 === m ? void 0 : m.capture);
        const p = v ? [] : h;
        const g = e.ep;
        const w = this.debug ? o : () => {
            t.removeAttribute(A);
            --k;
            --y;
        };
        let b = t.attributes;
        let x;
        let y = b.length;
        let k = 0;
        let C;
        let A;
        let R;
        let E;
        let B;
        let I;
        let T = null;
        let D = false;
        let P;
        let O;
        let $;
        let L;
        let q;
        let M;
        let U;
        let F = null;
        let V;
        let _;
        let j;
        let N;
        let W = true;
        let H = false;
        if ("slot" === d) e.root.hasSlot = true;
        if (null !== m) {
            W = null === (s = m.processContent) || void 0 === s ? void 0 : s.call(m.Type, t, e.p);
            b = t.attributes;
            y = b.length;
        }
        if (e.root.def.enhance && t.classList.contains("au")) throw new Error(`AUR0705`);
        for (;y > k; ++k) {
            C = b[k];
            A = C.name;
            R = C.value;
            switch (A) {
              case "as-element":
              case "containerless":
                w();
                if (!H) H = "containerless" === A;
                continue;
            }
            E = e.fe.parse(A, R);
            F = e.ae(E);
            j = E.target;
            N = E.rawValue;
            if (v) {
                if (null != F && 1 & F.type) {
                    w();
                    p.push(E);
                    continue;
                }
                if ("au-slot" !== j) {
                    V = BindablesInfo.from(m, false);
                    if (null == V.attrs[j] && !(null === (n = e.ce(j)) || void 0 === n ? void 0 : n.isTemplateController)) {
                        w();
                        p.push(E);
                        continue;
                    }
                }
            }
            if (null !== F && 1 & F.type) {
                In.node = t;
                In.attr = E;
                In.bindable = null;
                In.def = null;
                (null !== B && void 0 !== B ? B : B = []).push(F.build(In));
                w();
                continue;
            }
            T = e.ce(j);
            if (null !== T) {
                V = BindablesInfo.from(T, true);
                D = false === T.noMultiBindings && null === F && Sn(R);
                if (D) $ = this.ue(t, R, T, e); else {
                    _ = V.primary;
                    if (null === F) {
                        M = g.parse(R, 1);
                        $ = [ null === M ? new SetPropertyInstruction(R, _.property) : new InterpolationInstruction(M, _.property) ];
                    } else {
                        In.node = t;
                        In.attr = E;
                        In.bindable = _;
                        In.def = T;
                        $ = [ F.build(In) ];
                    }
                }
                w();
                if (T.isTemplateController) (null !== L && void 0 !== L ? L : L = []).push(new HydrateTemplateController(Bn, this.resolveResources ? T : T.name, void 0, $)); else (null !== O && void 0 !== O ? O : O = []).push(new HydrateAttributeInstruction(this.resolveResources ? T : T.name, null != T.aliases && T.aliases.includes(j) ? j : void 0, $));
                continue;
            }
            if (null === F) {
                if (null !== m) {
                    V = BindablesInfo.from(m, false);
                    P = V.attrs[j];
                    if (void 0 !== P) {
                        M = g.parse(N, 1);
                        (null !== I && void 0 !== I ? I : I = []).push(null == M ? new SetPropertyInstruction(N, P.property) : new InterpolationInstruction(M, P.property));
                        w();
                        continue;
                    }
                }
                M = g.parse(N, 1);
                if (null != M) {
                    w();
                    (null !== B && void 0 !== B ? B : B = []).push(new InterpolationInstruction(M, null !== (r = e.m.map(t, j)) && void 0 !== r ? r : S(j)));
                }
                continue;
            }
            w();
            if (null !== m) {
                V = BindablesInfo.from(m, false);
                P = V.attrs[j];
                if (void 0 !== P) {
                    In.node = t;
                    In.attr = E;
                    In.bindable = P;
                    In.def = m;
                    (null !== I && void 0 !== I ? I : I = []).push(F.build(In));
                    continue;
                }
            }
            In.node = t;
            In.attr = E;
            In.bindable = null;
            In.def = null;
            (null !== B && void 0 !== B ? B : B = []).push(F.build(In));
        }
        Rn();
        if (this.ge(t) && null != B && B.length > 1) this.we(t, B);
        if (null !== m) {
            U = new HydrateElementInstruction(this.resolveResources ? m : m.name, void 0, null !== I && void 0 !== I ? I : h, null, H, p);
            if ("au-slot" === d) {
                const i = t.getAttribute("name") || "default";
                const s = e.h("template");
                const n = e.be();
                let r = t.firstChild;
                while (null !== r) {
                    if (1 === r.nodeType && r.hasAttribute("au-slot")) t.removeChild(r); else s.content.appendChild(r);
                    r = t.firstChild;
                }
                this.oe(s.content, n);
                U.auSlot = {
                    name: i,
                    fallback: CustomElementDefinition.create({
                        name: Nn(),
                        template: s,
                        instructions: n.rows,
                        needsCompile: false
                    })
                };
                t = this.xe(t, e);
            }
        }
        if (null != B || null != U || null != O) {
            x = h.concat(null !== U && void 0 !== U ? U : h, null !== O && void 0 !== O ? O : h, null !== B && void 0 !== B ? B : h);
            this.pe(t);
        }
        let z;
        if (null != L) {
            y = L.length - 1;
            k = y;
            q = L[k];
            let i;
            this.xe(t, e);
            if ("TEMPLATE" === t.nodeName) i = t; else {
                i = e.h("template");
                i.content.appendChild(t);
            }
            const s = i;
            const n = e.be(null == x ? [] : [ x ]);
            let r;
            let o;
            let h;
            let a;
            let u;
            let f;
            let v;
            let p;
            let g = 0, w = 0;
            let b = t.firstChild;
            if (false !== W) while (null !== b) if (1 === b.nodeType) {
                r = b;
                b = b.nextSibling;
                o = r.getAttribute("au-slot");
                if (null !== o) {
                    if (null === m) throw new Error(`AUR0706:${d}[${o}]`);
                    if ("" === o) o = "default";
                    r.removeAttribute("au-slot");
                    t.removeChild(r);
                    (null !== (l = (c = null !== a && void 0 !== a ? a : a = {})[o]) && void 0 !== l ? l : c[o] = []).push(r);
                }
            } else b = b.nextSibling;
            if (null != a) {
                h = {};
                for (o in a) {
                    i = e.h("template");
                    u = a[o];
                    for (g = 0, w = u.length; w > g; ++g) {
                        f = u[g];
                        if ("TEMPLATE" === f.nodeName) if (f.attributes.length > 0) i.content.appendChild(f); else i.content.appendChild(f.content); else i.content.appendChild(f);
                    }
                    p = e.be();
                    this.oe(i.content, p);
                    h[o] = CustomElementDefinition.create({
                        name: Nn(),
                        template: i,
                        instructions: p.rows,
                        needsCompile: false,
                        isStrictBinding: e.root.def.isStrictBinding
                    });
                }
                U.projections = h;
            }
            if (null !== m && m.containerless) this.xe(t, e);
            z = null === m || !m.containerless && !H && false !== W;
            if (z) if ("TEMPLATE" === t.nodeName) this.oe(t.content, n); else {
                b = t.firstChild;
                while (null !== b) b = this.oe(b, n);
            }
            q.def = CustomElementDefinition.create({
                name: Nn(),
                template: s,
                instructions: n.rows,
                needsCompile: false,
                isStrictBinding: e.root.def.isStrictBinding
            });
            while (k-- > 0) {
                q = L[k];
                i = e.h("template");
                v = e.h("au-m");
                v.classList.add("au");
                i.content.appendChild(v);
                q.def = CustomElementDefinition.create({
                    name: Nn(),
                    template: i,
                    needsCompile: false,
                    instructions: [ [ L[k + 1] ] ],
                    isStrictBinding: e.root.def.isStrictBinding
                });
            }
            e.rows.push([ q ]);
        } else {
            if (null != x) e.rows.push(x);
            let i = t.firstChild;
            let s;
            let n;
            let r = null;
            let o;
            let l;
            let h;
            let c;
            let f;
            let d = 0, v = 0;
            if (false !== W) while (null !== i) if (1 === i.nodeType) {
                s = i;
                i = i.nextSibling;
                n = s.getAttribute("au-slot");
                if (null !== n) {
                    if (null === m) throw new Error(`AUR0706:${t.nodeName}[${n}]`);
                    if ("" === n) n = "default";
                    t.removeChild(s);
                    s.removeAttribute("au-slot");
                    (null !== (a = (u = null !== o && void 0 !== o ? o : o = {})[n]) && void 0 !== a ? a : u[n] = []).push(s);
                }
            } else i = i.nextSibling;
            if (null != o) {
                r = {};
                for (n in o) {
                    c = e.h("template");
                    l = o[n];
                    for (d = 0, v = l.length; v > d; ++d) {
                        h = l[d];
                        if ("TEMPLATE" === h.nodeName) if (h.attributes.length > 0) c.content.appendChild(h); else c.content.appendChild(h.content); else c.content.appendChild(h);
                    }
                    f = e.be();
                    this.oe(c.content, f);
                    r[n] = CustomElementDefinition.create({
                        name: Nn(),
                        template: c,
                        instructions: f.rows,
                        needsCompile: false,
                        isStrictBinding: e.root.def.isStrictBinding
                    });
                }
                U.projections = r;
            }
            if (null !== m && m.containerless) this.xe(t, e);
            z = null === m || !m.containerless && !H && false !== W;
            if (z && t.childNodes.length > 0) {
                i = t.firstChild;
                while (null !== i) i = this.oe(i, e);
            }
        }
        return f;
    }
    ve(t, e) {
        let i = "";
        let s = t;
        while (null !== s && 3 === s.nodeType) {
            i += s.textContent;
            s = s.nextSibling;
        }
        const n = e.ep.parse(i, 1);
        if (null === n) return s;
        const r = t.parentNode;
        r.insertBefore(this.pe(e.h("au-m")), t);
        e.rows.push([ new TextBindingInstruction(n, !!e.def.isStrictBinding) ]);
        t.textContent = "";
        s = t.nextSibling;
        while (null !== s && 3 === s.nodeType) {
            r.removeChild(s);
            s = t.nextSibling;
        }
        return t.nextSibling;
    }
    ue(t, e, i, s) {
        const n = BindablesInfo.from(i, true);
        const r = e.length;
        const o = [];
        let l;
        let h;
        let a = 0;
        let c = 0;
        let u;
        let f;
        let d;
        let m;
        for (let v = 0; v < r; ++v) {
            c = e.charCodeAt(v);
            if (92 === c) ++v; else if (58 === c) {
                l = e.slice(a, v);
                while (e.charCodeAt(++v) <= 32) ;
                a = v;
                for (;v < r; ++v) {
                    c = e.charCodeAt(v);
                    if (92 === c) ++v; else if (59 === c) {
                        h = e.slice(a, v);
                        break;
                    }
                }
                if (void 0 === h) h = e.slice(a);
                f = s.fe.parse(l, h);
                d = s.ae(f);
                m = n.attrs[f.target];
                if (null == m) throw new Error(`AUR0707:${i.name}.${f.target}`);
                if (null === d) {
                    u = s.ep.parse(h, 1);
                    o.push(null === u ? new SetPropertyInstruction(h, m.property) : new InterpolationInstruction(u, m.property));
                } else {
                    In.node = t;
                    In.attr = f;
                    In.bindable = m;
                    In.def = i;
                    o.push(d.build(In));
                }
                while (v < r && e.charCodeAt(++v) <= 32) ;
                a = v;
                l = void 0;
                h = void 0;
            }
        }
        Rn();
        return o;
    }
    re(t, e) {
        const i = t;
        const s = R(i.querySelectorAll("template[as-custom-element]"));
        const n = s.length;
        if (0 === n) return;
        if (n === i.childElementCount) throw new Error("AUR0708");
        const r = new Set;
        for (const t of s) {
            if (t.parentNode !== i) throw new Error("AUR0709");
            const s = qn(t, r);
            const n = class LocalTemplate {};
            const o = t.content;
            const l = R(o.querySelectorAll("bindable"));
            const h = xt.for(n);
            const a = new Set;
            const c = new Set;
            for (const t of l) {
                if (t.parentNode !== o) throw new Error("AUR0710");
                const e = t.getAttribute("property");
                if (null === e) throw new Error("AUR0711");
                const i = t.getAttribute("attribute");
                if (null !== i && c.has(i) || a.has(e)) throw new Error(`AUR0712:${e}+${i}`); else {
                    if (null !== i) c.add(i);
                    a.add(e);
                }
                h.add({
                    property: e,
                    attribute: null !== i && void 0 !== i ? i : void 0,
                    mode: Mn(t)
                });
                const s = t.getAttributeNames().filter((t => !$n.includes(t)));
                if (s.length > 0) ;
                o.removeChild(t);
            }
            e.ye(Ke.define({
                name: s,
                template: t
            }, n));
            i.removeChild(t);
        }
    }
    ge(t) {
        return "INPUT" === t.nodeName && 1 === Dn[t.type];
    }
    we(t, e) {
        switch (t.nodeName) {
          case "INPUT":
            {
                const t = e;
                let i;
                let s;
                let n = 0;
                let r;
                for (let e = 0; e < t.length && n < 3; e++) {
                    r = t[e];
                    switch (r.to) {
                      case "model":
                      case "value":
                      case "matcher":
                        i = e;
                        n++;
                        break;

                      case "checked":
                        s = e;
                        n++;
                        break;
                    }
                }
                if (void 0 !== s && void 0 !== i && s < i) [t[i], t[s]] = [ t[s], t[i] ];
            }
        }
    }
    pe(t) {
        t.classList.add("au");
        return t;
    }
    xe(t, e) {
        const i = t.parentNode;
        const s = e.h("au-m");
        this.pe(i.insertBefore(s, t));
        i.removeChild(t);
        return s;
    }
}

class CompilationContext {
    constructor(t, e, i, s, n, r) {
        this.hasSlot = false;
        this.ke = Mt();
        const o = null !== s;
        this.c = e;
        this.root = null === n ? this : n;
        this.def = t;
        this.ci = i;
        this.parent = s;
        this.ne = o ? s.ne : e.get(kn);
        this.fe = o ? s.fe : e.get(Rt);
        this.ep = o ? s.ep : e.get(V);
        this.m = o ? s.m : e.get(Wt);
        this.Ut = o ? s.Ut : e.get(k);
        this.p = o ? s.p : e.get(_t);
        this.localEls = o ? s.localEls : new Set;
        this.rows = null !== r && void 0 !== r ? r : [];
    }
    ye(t) {
        var e;
        var i;
        (null !== (e = (i = this.root).deps) && void 0 !== e ? e : i.deps = []).push(t);
        this.root.c.register(t);
    }
    h(t) {
        const e = this.p.document.createElement(t);
        if ("template" === t) this.p.document.adoptNode(e.content);
        return e;
    }
    he(t) {
        return this.c.find(Ke, t);
    }
    ce(t) {
        return this.c.find(Ie, t);
    }
    be(t) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, t);
    }
    ae(t) {
        if (this.root !== this) return this.root.ae(t);
        const e = t.command;
        if (null === e) return null;
        let i = this.ke[e];
        if (void 0 === i) {
            i = this.c.create(on, e);
            if (null === i) throw new Error(`AUR0713:${e}`);
            this.ke[e] = i;
        }
        return i;
    }
}

function Sn(t) {
    const e = t.length;
    let i = 0;
    let s = 0;
    while (e > s) {
        i = t.charCodeAt(s);
        if (92 === i) ++s; else if (58 === i) return true; else if (36 === i && 123 === t.charCodeAt(s + 1)) return false;
        ++s;
    }
    return false;
}

function Rn() {
    In.node = In.attr = In.bindable = In.def = null;
}

const En = {
    projections: null
};

const Bn = {
    name: "unnamed"
};

const In = {
    node: null,
    attr: null,
    bindable: null,
    def: null
};

const Tn = Object.assign(Mt(), {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
});

const Dn = {
    checkbox: 1,
    radio: 1
};

const Pn = new WeakMap;

class BindablesInfo {
    constructor(t, e, i) {
        this.attrs = t;
        this.bindables = e;
        this.primary = i;
    }
    static from(t, e) {
        let i = Pn.get(t);
        if (null == i) {
            const s = t.bindables;
            const n = Mt();
            const r = e ? void 0 === t.defaultBindingMode ? D.default : t.defaultBindingMode : D.default;
            let o;
            let l;
            let h = false;
            let a;
            let c;
            for (l in s) {
                o = s[l];
                c = o.attribute;
                if (true === o.primary) {
                    if (h) throw new Error(`AUR0714:${t.name}`);
                    h = true;
                    a = o;
                } else if (!h && null == a) a = o;
                n[c] = BindableDefinition.create(l, o);
            }
            if (null == o && e) a = n.value = BindableDefinition.create("value", {
                mode: r
            });
            Pn.set(t, i = new BindablesInfo(n, s, a));
        }
        return i;
    }
}

var On;

(function(t) {
    t["property"] = "property";
    t["attribute"] = "attribute";
    t["mode"] = "mode";
})(On || (On = {}));

const $n = Object.freeze([ "property", "attribute", "mode" ]);

const Ln = "as-custom-element";

function qn(t, e) {
    const i = t.getAttribute(Ln);
    if (null === i || "" === i) throw new Error("AUR0715");
    if (e.has(i)) throw new Error(`AUR0716:${i}`); else {
        e.add(i);
        t.removeAttribute(Ln);
    }
    return i;
}

function Mn(t) {
    switch (t.getAttribute("mode")) {
      case "oneTime":
        return D.oneTime;

      case "toView":
        return D.toView;

      case "fromView":
        return D.fromView;

      case "twoWay":
        return D.twoWay;

      case "default":
      default:
        return D.default;
    }
}

const Un = l.createInterface("ITemplateCompilerHooks");

const Fn = new WeakMap;

const Vn = dt("compiler-hooks");

const _n = Object.freeze({
    name: Vn,
    define(t) {
        let e = Fn.get(t);
        if (void 0 === e) {
            Fn.set(t, e = new TemplateCompilerHooksDefinition(t));
            at(Vn, e, t);
            mt(t, Vn);
        }
        return t;
    }
});

class TemplateCompilerHooksDefinition {
    constructor(t) {
        this.Type = t;
    }
    get name() {
        return "";
    }
    register(t) {
        t.register(c.singleton(Un, this.Type));
    }
}

const jn = t => {
    return void 0 === t ? e : e(t);
    function e(t) {
        return _n.define(t);
    }
};

const Nn = Ke.generateName;

class BindingModeBehavior {
    constructor(t) {
        this.mode = t;
        this.Ce = new Map;
    }
    bind(t, e, i) {
        this.Ce.set(i, i.mode);
        i.mode = this.mode;
    }
    unbind(t, e, i) {
        i.mode = this.Ce.get(i);
        this.Ce.delete(i);
    }
}

class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(D.oneTime);
    }
}

class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(D.toView);
    }
}

class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(D.fromView);
    }
}

class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(D.twoWay);
    }
}

z("oneTime")(OneTimeBindingBehavior);

z("toView")(ToViewBindingBehavior);

z("fromView")(FromViewBindingBehavior);

z("twoWay")(TwoWayBindingBehavior);

const Wn = 200;

class DebounceBindingBehavior extends G {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: Wn
        };
        this.firstArg = null;
        this.task = null;
        this.taskQueue = t.locator.get(u).taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.queueTask((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, i) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
        }
        this.binding.handleChange(t, e, i);
    }
    updateSource(t, e) {
        this.queueTask((() => this.binding.updateSource(t, e)));
    }
    queueTask(t) {
        const e = this.task;
        this.task = this.taskQueue.queueTask((() => {
            this.task = null;
            return t();
        }), this.opts);
        null === e || void 0 === e ? void 0 : e.cancel();
    }
    $bind(t, e) {
        if (null !== this.firstArg) {
            const i = Number(this.firstArg.evaluate(t, e, this.locator, null));
            this.opts.delay = isNaN(i) ? Wn : i;
        }
        this.binding.$bind(t, e);
    }
    $unbind(t) {
        var e;
        null === (e = this.task) || void 0 === e ? void 0 : e.cancel();
        this.task = null;
        this.binding.$unbind(t);
    }
}

z("debounce")(DebounceBindingBehavior);

class SignalBindingBehavior {
    constructor(t) {
        this.Qt = new Map;
        this.Ae = t;
    }
    bind(t, e, i, ...s) {
        if (!("handleChange" in i)) throw new Error("AUR0817");
        if (0 === s.length) throw new Error("AUR0818");
        this.Qt.set(i, s);
        let n;
        for (n of s) this.Ae.addSignalListener(n, i);
    }
    unbind(t, e, i) {
        const s = this.Qt.get(i);
        this.Qt.delete(i);
        let n;
        for (n of s) this.Ae.removeSignalListener(n, i);
    }
}

SignalBindingBehavior.inject = [ X ];

z("signal")(SignalBindingBehavior);

const Hn = 200;

class ThrottleBindingBehavior extends G {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: Hn
        };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.p = t.locator.get(u);
        this.Se = this.p.taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.Re((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, i) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.p.performanceNow();
        }
        this.binding.handleChange(t, e, i);
    }
    updateSource(t, e) {
        this.Re((() => this.binding.updateSource(t, e)));
    }
    Re(t) {
        const e = this.opts;
        const i = this.p;
        const s = this.lastCall + e.delay - i.performanceNow();
        if (s > 0) {
            const n = this.task;
            e.delay = s;
            this.task = this.Se.queueTask((() => {
                this.lastCall = i.performanceNow();
                this.task = null;
                e.delay = this.delay;
                t();
            }), e);
            null === n || void 0 === n ? void 0 : n.cancel();
        } else {
            this.lastCall = i.performanceNow();
            t();
        }
    }
    $bind(t, e) {
        if (null !== this.firstArg) {
            const i = Number(this.firstArg.evaluate(t, e, this.locator, null));
            this.opts.delay = this.delay = isNaN(i) ? Hn : i;
        }
        this.binding.$bind(t, e);
    }
    $unbind(t) {
        var e;
        null === (e = this.task) || void 0 === e ? void 0 : e.cancel();
        this.task = null;
        super.$unbind(t);
    }
}

z("throttle")(ThrottleBindingBehavior);

class DataAttributeAccessor {
    constructor() {
        this.type = 2 | 4;
    }
    getValue(t, e) {
        return t.getAttribute(e);
    }
    setValue(t, e, i, s) {
        if (void 0 == t) i.removeAttribute(s); else i.setAttribute(s, t);
    }
}

const zn = new DataAttributeAccessor;

class AttrBindingBehavior {
    bind(t, e, i) {
        i.targetObserver = zn;
    }
    unbind(t, e, i) {
        return;
    }
}

z("attr")(AttrBindingBehavior);

function Gn(t) {
    const e = t.composedPath()[0];
    if (this.target !== e) return;
    return this.selfEventCallSource(t);
}

class SelfBindingBehavior {
    bind(t, e, i) {
        if (!i.callSource || !i.targetEvent) throw new Error("AUR0801");
        i.selfEventCallSource = i.callSource;
        i.callSource = Gn;
    }
    unbind(t, e, i) {
        i.callSource = i.selfEventCallSource;
        i.selfEventCallSource = null;
    }
}

z("self")(SelfBindingBehavior);

const Xn = Mt();

class AttributeNSAccessor {
    constructor(t) {
        this.ns = t;
        this.type = 2 | 4;
    }
    static forNs(t) {
        var e;
        return null !== (e = Xn[t]) && void 0 !== e ? e : Xn[t] = new AttributeNSAccessor(t);
    }
    getValue(t, e) {
        return t.getAttributeNS(this.ns, e);
    }
    setValue(t, e, i, s) {
        if (void 0 == t) i.removeAttributeNS(this.ns, s); else i.setAttributeNS(this.ns, s, t);
    }
}

function Kn(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.v = void 0;
        this.ov = void 0;
        this.Ee = void 0;
        this.Be = void 0;
        this.f = 0;
        this.o = t;
        this.oL = s;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        const i = this.v;
        if (t === i) return;
        this.v = t;
        this.ov = i;
        this.f = e;
        this.Ie();
        this.Te();
        this.queue.add(this);
    }
    handleCollectionChange(t, e) {
        this.Te();
    }
    handleChange(t, e, i) {
        this.Te();
    }
    Te() {
        const t = this.v;
        const e = this.o;
        const i = Ut.call(e, "model") ? e.model : e.value;
        const s = "radio" === e.type;
        const n = void 0 !== e.matcher ? e.matcher : Kn;
        if (s) e.checked = !!n(t, i); else if (true === t) e.checked = true; else {
            let s = false;
            if (t instanceof Array) s = -1 !== t.findIndex((t => !!n(t, i))); else if (t instanceof Set) {
                for (const e of t) if (n(e, i)) {
                    s = true;
                    break;
                }
            } else if (t instanceof Map) for (const e of t) {
                const t = e[0];
                const r = e[1];
                if (n(t, i) && true === r) {
                    s = true;
                    break;
                }
            }
            e.checked = s;
        }
    }
    handleEvent() {
        let t = this.ov = this.v;
        const e = this.o;
        const i = Ut.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = void 0 !== e.matcher ? e.matcher : Kn;
        if ("checkbox" === e.type) {
            if (t instanceof Array) {
                const e = t.findIndex((t => !!n(t, i)));
                if (s && -1 === e) t.push(i); else if (!s && -1 !== e) t.splice(e, 1);
                return;
            } else if (t instanceof Set) {
                const e = {};
                let r = e;
                for (const e of t) if (true === n(e, i)) {
                    r = e;
                    break;
                }
                if (s && r === e) t.add(i); else if (!s && r !== e) t.delete(r);
                return;
            } else if (t instanceof Map) {
                let e;
                for (const s of t) {
                    const t = s[0];
                    if (true === n(t, i)) {
                        e = t;
                        break;
                    }
                }
                t.set(e, s);
                return;
            }
            t = s;
        } else if (s) t = i; else return;
        this.v = t;
        this.queue.add(this);
    }
    start() {
        this.handler.subscribe(this.o, this);
        this.Ie();
    }
    stop() {
        var t, e;
        this.handler.dispose();
        null === (t = this.Ee) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.Ee = void 0;
        null === (e = this.Be) || void 0 === e ? void 0 : e.unsubscribe(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.start();
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.stop();
    }
    flush() {
        Yn = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Yn, this.f);
    }
    Ie() {
        var t, e, i, s, n, r, o;
        const l = this.o;
        null === (n = null !== (t = this.Be) && void 0 !== t ? t : this.Be = null !== (i = null === (e = l.$observers) || void 0 === e ? void 0 : e.model) && void 0 !== i ? i : null === (s = l.$observers) || void 0 === s ? void 0 : s.value) || void 0 === n ? void 0 : n.subscribe(this);
        null === (r = this.Ee) || void 0 === r ? void 0 : r.unsubscribe(this);
        this.Ee = void 0;
        if ("checkbox" === l.type) null === (o = this.Ee = ar(this.v, this.oL)) || void 0 === o ? void 0 : o.subscribe(this);
    }
}

P(CheckedObserver);

O(CheckedObserver);

let Yn;

const Qn = Object.prototype.hasOwnProperty;

const Zn = {
    childList: true,
    subtree: true,
    characterData: true
};

function Jn(t, e) {
    return t === e;
}

class SelectValueObserver {
    constructor(t, e, i, s) {
        this.type = 2 | 1 | 4;
        this.v = void 0;
        this.ov = void 0;
        this.W = false;
        this.De = void 0;
        this.Pe = void 0;
        this.iO = false;
        this.o = t;
        this.oL = s;
        this.handler = i;
    }
    getValue() {
        return this.iO ? this.v : this.o.multiple ? tr(this.o.options) : this.o.value;
    }
    setValue(t, e) {
        this.ov = this.v;
        this.v = t;
        this.W = t !== this.ov;
        this.Oe(t instanceof Array ? t : null);
        if (0 === (256 & e)) this.X();
    }
    X() {
        if (this.W) {
            this.W = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        this.syncOptions();
    }
    syncOptions() {
        var t;
        const e = this.v;
        const i = this.o;
        const s = Array.isArray(e);
        const n = null !== (t = i.matcher) && void 0 !== t ? t : Jn;
        const r = i.options;
        let o = r.length;
        while (o-- > 0) {
            const t = r[o];
            const i = Qn.call(t, "model") ? t.model : t.value;
            if (s) {
                t.selected = -1 !== e.findIndex((t => !!n(i, t)));
                continue;
            }
            t.selected = !!n(i, e);
        }
    }
    syncValue() {
        const t = this.o;
        const e = t.options;
        const i = e.length;
        const s = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(s instanceof Array)) return true;
            let r;
            const o = t.matcher || Jn;
            const l = [];
            while (n < i) {
                r = e[n];
                if (r.selected) l.push(Qn.call(r, "model") ? r.model : r.value);
                ++n;
            }
            let h;
            n = 0;
            while (n < s.length) {
                h = s[n];
                if (-1 === l.findIndex((t => !!o(h, t)))) s.splice(n, 1); else ++n;
            }
            n = 0;
            while (n < l.length) {
                h = l[n];
                if (-1 === s.findIndex((t => !!o(h, t)))) s.push(h);
                ++n;
            }
            return false;
        }
        let r = null;
        let o;
        while (n < i) {
            o = e[n];
            if (o.selected) {
                r = Qn.call(o, "model") ? o.model : o.value;
                break;
            }
            ++n;
        }
        this.ov = this.v;
        this.v = r;
        return true;
    }
    $e() {
        (this.Pe = new this.o.ownerDocument.defaultView.MutationObserver(this.Le.bind(this))).observe(this.o, Zn);
        this.Oe(this.v instanceof Array ? this.v : null);
        this.iO = true;
    }
    qe() {
        var t;
        this.Pe.disconnect();
        null === (t = this.De) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.Pe = this.De = void 0;
        this.iO = false;
    }
    Oe(t) {
        var e;
        null === (e = this.De) || void 0 === e ? void 0 : e.unsubscribe(this);
        this.De = void 0;
        if (null != t) {
            if (!this.o.multiple) throw new Error("AUR0654");
            (this.De = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    Le(t) {
        this.syncOptions();
        const e = this.syncValue();
        if (e) this.queue.add(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.o, this);
            this.$e();
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.handler.dispose();
            this.qe();
        }
    }
    flush() {
        er = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, er, 0);
    }
}

P(SelectValueObserver);

O(SelectValueObserver);

function tr(t) {
    const e = [];
    if (0 === t.length) return e;
    const i = t.length;
    let s = 0;
    let n;
    while (i > s) {
        n = t[s];
        if (n.selected) e[e.length] = Qn.call(n, "model") ? n.model : n.value;
        ++s;
    }
    return e;
}

let er;

const ir = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = 2 | 4;
        this.value = "";
        this.ov = "";
        this.styles = {};
        this.version = 0;
        this.W = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t, e) {
        this.value = t;
        this.W = t !== this.ov;
        if (0 === (256 & e)) this.X();
    }
    Me(t) {
        const e = [];
        const i = /url\([^)]+$/;
        let s = 0;
        let n = "";
        let r;
        let o;
        let l;
        let h;
        while (s < t.length) {
            r = t.indexOf(";", s);
            if (-1 === r) r = t.length;
            n += t.substring(s, r);
            s = r + 1;
            if (i.test(n)) {
                n += ";";
                continue;
            }
            o = n.indexOf(":");
            l = n.substring(0, o).trim();
            h = n.substring(o + 1).trim();
            e.push([ l, h ]);
            n = "";
        }
        return e;
    }
    Ue(t) {
        let e;
        let i;
        const s = [];
        for (i in t) {
            e = t[i];
            if (null == e) continue;
            if ("string" === typeof e) {
                if (i.startsWith(ir)) {
                    s.push([ i, e ]);
                    continue;
                }
                s.push([ r(i), e ]);
                continue;
            }
            s.push(...this.Fe(e));
        }
        return s;
    }
    Ve(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) i.push(...this.Fe(t[s]));
            return i;
        }
        return h;
    }
    Fe(t) {
        if ("string" === typeof t) return this.Me(t);
        if (t instanceof Array) return this.Ve(t);
        if (t instanceof Object) return this.Ue(t);
        return h;
    }
    X() {
        if (this.W) {
            this.W = false;
            const t = this.value;
            const e = this.styles;
            const i = this.Fe(t);
            let s;
            let n = this.version;
            this.ov = t;
            let r;
            let o;
            let l;
            let h = 0;
            const a = i.length;
            for (;h < a; ++h) {
                r = i[h];
                o = r[0];
                l = r[1];
                this.setProperty(o, l);
                e[o] = n;
            }
            this.styles = e;
            this.version += 1;
            if (0 === n) return;
            n -= 1;
            for (s in e) {
                if (!Object.prototype.hasOwnProperty.call(e, s) || e[s] !== n) continue;
                this.obj.style.removeProperty(s);
            }
        }
    }
    setProperty(t, e) {
        let i = "";
        if (null != e && "function" === typeof e.indexOf && e.includes("!important")) {
            i = "important";
            e = e.replace("!important", "");
        }
        this.obj.style.setProperty(t, e, i);
    }
    bind(t) {
        this.value = this.ov = this.obj.style.cssText;
    }
}

class ValueAttributeObserver {
    constructor(t, e, i) {
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.v = "";
        this.ov = "";
        this.W = false;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        if (Object.is(t, this.v)) return;
        this.ov = this.v;
        this.v = t;
        this.W = true;
        if (!this.handler.config.readonly && 0 === (256 & e)) this.X(e);
    }
    X(t) {
        var e;
        if (this.W) {
            this.W = false;
            this.o[this.k] = null !== (e = this.v) && void 0 !== e ? e : this.handler.config.default;
            if (0 === (2 & t)) this.queue.add(this);
        }
    }
    handleEvent() {
        this.ov = this.v;
        this.v = this.o[this.k];
        if (this.ov !== this.v) {
            this.W = false;
            this.queue.add(this);
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.o, this);
            this.v = this.ov = this.o[this.k];
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.handler.dispose();
    }
    flush() {
        sr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, sr, 0);
    }
}

P(ValueAttributeObserver);

O(ValueAttributeObserver);

let sr;

const nr = "http://www.w3.org/1999/xlink";

const rr = "http://www.w3.org/XML/1998/namespace";

const or = "http://www.w3.org/2000/xmlns/";

const lr = Object.assign(Mt(), {
    "xlink:actuate": [ "actuate", nr ],
    "xlink:arcrole": [ "arcrole", nr ],
    "xlink:href": [ "href", nr ],
    "xlink:role": [ "role", nr ],
    "xlink:show": [ "show", nr ],
    "xlink:title": [ "title", nr ],
    "xlink:type": [ "type", nr ],
    "xml:lang": [ "lang", rr ],
    "xml:space": [ "space", rr ],
    xmlns: [ "xmlns", or ],
    "xmlns:xlink": [ "xlink", or ]
});

const hr = new K;

hr.type = 2 | 4;

class NodeObserverConfig {
    constructor(t) {
        var e;
        this.type = null !== (e = t.type) && void 0 !== e ? e : ValueAttributeObserver;
        this.events = t.events;
        this.readonly = t.readonly;
        this.default = t.default;
    }
}

class NodeObserverLocator {
    constructor(t, e, i, s) {
        this.locator = t;
        this.platform = e;
        this.dirtyChecker = i;
        this.svgAnalyzer = s;
        this.allowDirtyCheck = true;
        this._e = Mt();
        this.je = Mt();
        this.Ne = Mt();
        this.We = Mt();
        const n = [ "change", "input" ];
        const r = {
            events: n,
            default: ""
        };
        this.useConfig({
            INPUT: {
                value: r,
                valueAsNumber: {
                    events: n,
                    default: 0
                },
                checked: {
                    type: CheckedObserver,
                    events: n
                },
                files: {
                    events: n,
                    readonly: true
                }
            },
            SELECT: {
                value: {
                    type: SelectValueObserver,
                    events: [ "change" ],
                    default: ""
                }
            },
            TEXTAREA: {
                value: r
            }
        });
        const o = {
            events: [ "change", "input", "blur", "keyup", "paste" ],
            default: ""
        };
        const l = {
            events: [ "scroll" ],
            default: 0
        };
        this.useConfigGlobal({
            scrollTop: l,
            scrollLeft: l,
            textContent: o,
            innerHTML: o
        });
        this.overrideAccessorGlobal("css", "style", "class");
        this.overrideAccessor({
            INPUT: [ "value", "checked", "model" ],
            SELECT: [ "value" ],
            TEXTAREA: [ "value" ]
        });
    }
    static register(t) {
        c.aliasTo(Y, NodeObserverLocator).register(t);
        c.singleton(Y, NodeObserverLocator).register(t);
    }
    handles(t, e) {
        return t instanceof this.platform.Node;
    }
    useConfig(t, e, i) {
        var s, n;
        const r = this._e;
        let o;
        if ("string" === typeof t) {
            o = null !== (s = r[t]) && void 0 !== s ? s : r[t] = Mt();
            if (null == o[e]) o[e] = new NodeObserverConfig(i); else cr(t, e);
        } else for (const i in t) {
            o = null !== (n = r[i]) && void 0 !== n ? n : r[i] = Mt();
            const s = t[i];
            for (e in s) if (null == o[e]) o[e] = new NodeObserverConfig(s[e]); else cr(i, e);
        }
    }
    useConfigGlobal(t, e) {
        const i = this.je;
        if ("object" === typeof t) for (const e in t) if (null == i[e]) i[e] = new NodeObserverConfig(t[e]); else cr("*", e); else if (null == i[t]) i[t] = new NodeObserverConfig(e); else cr("*", t);
    }
    getAccessor(t, e, i) {
        var s;
        if (e in this.We || e in (null !== (s = this.Ne[t.tagName]) && void 0 !== s ? s : E)) return this.getObserver(t, e, i);
        switch (e) {
          case "src":
          case "href":
          case "role":
            return zn;

          default:
            {
                const i = lr[e];
                if (void 0 !== i) return AttributeNSAccessor.forNs(i[1]);
                if (Vt(t, e, this.svgAnalyzer)) return zn;
                return hr;
            }
        }
    }
    overrideAccessor(t, e) {
        var i, s;
        var n, r;
        let o;
        if ("string" === typeof t) {
            o = null !== (i = (n = this.Ne)[t]) && void 0 !== i ? i : n[t] = Mt();
            o[e] = true;
        } else for (const e in t) for (const i of t[e]) {
            o = null !== (s = (r = this.Ne)[e]) && void 0 !== s ? s : r[e] = Mt();
            o[i] = true;
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) this.We[e] = true;
    }
    getObserver(t, e, i) {
        var s, n;
        switch (e) {
          case "role":
            return zn;

          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const r = null !== (n = null === (s = this._e[t.tagName]) || void 0 === s ? void 0 : s[e]) && void 0 !== n ? n : this.je[e];
        if (null != r) return new r.type(t, e, new EventSubscriber(r), i, this.locator);
        const o = lr[e];
        if (void 0 !== o) return AttributeNSAccessor.forNs(o[1]);
        if (Vt(t, e, this.svgAnalyzer)) return zn;
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) return this.dirtyChecker.createProperty(t, e);
            throw new Error(`AUR0652:${String(e)}`);
        } else return new Q(t, e);
    }
}

NodeObserverLocator.inject = [ B, _t, Z, jt ];

function ar(t, e) {
    if (t instanceof Array) return e.getArrayObserver(t);
    if (t instanceof Map) return e.getMapObserver(t);
    if (t instanceof Set) return e.getSetObserver(t);
}

function cr(t, e) {
    throw new Error(`AUR0653:${String(e)}@${t}`);
}

class UpdateTriggerBindingBehavior {
    constructor(t) {
        this.oL = t;
    }
    bind(t, e, i, ...s) {
        if (0 === s.length) throw new Error(`AUR0802`);
        if (i.mode !== D.twoWay && i.mode !== D.fromView) throw new Error("AUR0803");
        const n = this.oL.getObserver(i.target, i.targetProperty);
        if (!n.handler) throw new Error("AUR0804");
        i.targetObserver = n;
        const r = n.handler;
        n.originalHandler = r;
        n.handler = new EventSubscriber(new NodeObserverConfig({
            default: r.config.default,
            events: s,
            readonly: r.config.readonly
        }));
    }
    unbind(t, e, i) {
        i.targetObserver.handler.dispose();
        i.targetObserver.handler = i.targetObserver.originalHandler;
        i.targetObserver.originalHandler = null;
    }
}

UpdateTriggerBindingBehavior.inject = [ F ];

z("updateTrigger")(UpdateTriggerBindingBehavior);

class Focus {
    constructor(t, e) {
        this.He = t;
        this.p = e;
        this.ze = false;
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) this.Ge(); else this.ze = true;
    }
    attached() {
        if (this.ze) {
            this.ze = false;
            this.Ge();
        }
        this.He.addEventListener("focus", this);
        this.He.addEventListener("blur", this);
    }
    afterDetachChildren() {
        const t = this.He;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if ("focus" === t.type) this.value = true; else if (!this.Xe) this.value = false;
    }
    Ge() {
        const t = this.He;
        const e = this.Xe;
        const i = this.value;
        if (i && !e) t.focus(); else if (!i && e) t.blur();
    }
    get Xe() {
        return this.He === this.p.document.activeElement;
    }
}

Focus.inject = [ Yi, _t ];

rt([ gt({
    mode: D.twoWay
}) ], Focus.prototype, "value", void 0);

Ae("focus")(Focus);

let ur = class Show {
    constructor(t, e, i) {
        this.el = t;
        this.p = e;
        this.Ke = false;
        this.Ye = null;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.Ye = null;
            if (Boolean(this.value) !== this.Qe) if (this.Qe === this.Ze) {
                this.Qe = !this.Ze;
                this.$val = this.el.style.getPropertyValue("display");
                this.$prio = this.el.style.getPropertyPriority("display");
                this.el.style.setProperty("display", "none", "important");
            } else {
                this.Qe = this.Ze;
                this.el.style.setProperty("display", this.$val, this.$prio);
                if ("" === this.el.getAttribute("style")) this.el.removeAttribute("style");
            }
        };
        this.Qe = this.Ze = "hide" !== i.alias;
    }
    binding() {
        this.Ke = true;
        this.update();
    }
    detaching() {
        var t;
        this.Ke = false;
        null === (t = this.Ye) || void 0 === t ? void 0 : t.cancel();
        this.Ye = null;
    }
    valueChanged() {
        if (this.Ke && null === this.Ye) this.Ye = this.p.domWriteQueue.queueTask(this.update);
    }
};

rt([ gt ], ur.prototype, "value", void 0);

ur = rt([ ot(0, Yi), ot(1, _t), ot(2, ms) ], ur);

J("hide")(ur);

Ae("show")(ur);

class Portal {
    constructor(t, e, i) {
        this.id = w("au$component");
        this.strict = false;
        this.p = i;
        this.Je = i.document.createElement("div");
        this.view = t.create();
        is(this.view.nodes, e);
    }
    attaching(t, e, i) {
        if (null == this.callbackContext) this.callbackContext = this.$controller.scope.bindingContext;
        const s = this.Je = this.ti();
        this.view.setHost(s);
        return this.ei(t, s, i);
    }
    detaching(t, e, i) {
        return this.ii(t, this.Je, i);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) return;
        const e = this.Je;
        const i = this.Je = this.ti();
        if (e === i) return;
        this.view.setHost(i);
        const s = C(this.ii(null, i, t.flags), (() => this.ei(null, i, t.flags)));
        if (s instanceof Promise) s.catch((t => {
            throw t;
        }));
    }
    ei(t, e, i) {
        const {activating: s, callbackContext: n, view: r} = this;
        r.setHost(e);
        return C(null === s || void 0 === s ? void 0 : s.call(n, e, r), (() => this.si(t, e, i)));
    }
    si(t, e, i) {
        const {$controller: s, view: n} = this;
        if (null === t) n.nodes.appendTo(e); else return C(n.activate(null !== t && void 0 !== t ? t : n, s, i, s.scope), (() => this.ni(e)));
        return this.ni(e);
    }
    ni(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    ii(t, e, i) {
        const {deactivating: s, callbackContext: n, view: r} = this;
        return C(null === s || void 0 === s ? void 0 : s.call(n, e, r), (() => this.ri(t, e, i)));
    }
    ri(t, e, i) {
        const {$controller: s, view: n} = this;
        if (null === t) n.nodes.remove(); else return C(n.deactivate(t, s, i), (() => this.oi(e)));
        return this.oi(e);
    }
    oi(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    ti() {
        const t = this.p;
        const e = t.document;
        let i = this.target;
        let s = this.renderContext;
        if ("" === i) {
            if (this.strict) throw new Error("AUR0811");
            return e.body;
        }
        if ("string" === typeof i) {
            let n = e;
            if ("string" === typeof s) s = e.querySelector(s);
            if (s instanceof t.Node) n = s;
            i = n.querySelector(i);
        }
        if (i instanceof t.Node) return i;
        if (null == i) {
            if (this.strict) throw new Error("AUR0812");
            return e.body;
        }
        return i;
    }
    dispose() {
        this.view.dispose();
        this.view = void 0;
        this.callbackContext = null;
    }
    accept(t) {
        var e;
        if (true === (null === (e = this.view) || void 0 === e ? void 0 : e.accept(t))) return true;
    }
}

Portal.inject = [ pi, Zi, _t ];

rt([ gt({
    primary: true
}) ], Portal.prototype, "target", void 0);

rt([ gt({
    callback: "targetChanged"
}) ], Portal.prototype, "renderContext", void 0);

rt([ gt() ], Portal.prototype, "strict", void 0);

rt([ gt() ], Portal.prototype, "deactivating", void 0);

rt([ gt() ], Portal.prototype, "activating", void 0);

rt([ gt() ], Portal.prototype, "deactivated", void 0);

rt([ gt() ], Portal.prototype, "activated", void 0);

rt([ gt() ], Portal.prototype, "callbackContext", void 0);

Se("portal")(Portal);

class FlagsTemplateController {
    constructor(t, e, i) {
        this.fs = i;
        this.id = w("au$component");
        this.view = t.create().setLocation(e);
    }
    attaching(t, e, i) {
        const {$controller: s} = this;
        return this.view.activate(t, s, i | this.fs, s.scope);
    }
    detaching(t, e, i) {
        return this.view.deactivate(t, this.$controller, i);
    }
    dispose() {
        this.view.dispose();
        this.view = void 0;
    }
    accept(t) {
        var e;
        if (true === (null === (e = this.view) || void 0 === e ? void 0 : e.accept(t))) return true;
    }
}

class FrequentMutations extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 512);
    }
}

FrequentMutations.inject = [ pi, Zi ];

class ObserveShallow extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 128);
    }
}

ObserveShallow.inject = [ pi, Zi ];

Se("frequent-mutations")(FrequentMutations);

Se("observe-shallow")(ObserveShallow);

class If {
    constructor(t, e, i) {
        this.ifFactory = t;
        this.location = e;
        this.work = i;
        this.id = w("au$component");
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        this.cache = true;
        this.pending = void 0;
        this.li = false;
        this.hi = 0;
    }
    attaching(t, e, i) {
        let s;
        const n = this.$controller;
        const r = this.hi++;
        const o = () => !this.li && this.hi === r + 1;
        return C(this.pending, (() => {
            var e;
            if (!o()) return;
            this.pending = void 0;
            if (this.value) s = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(); else s = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create();
            if (null == s) return;
            s.setLocation(this.location);
            this.pending = C(s.activate(t, n, i, n.scope), (() => {
                if (o()) this.pending = void 0;
            }));
        }));
    }
    detaching(t, e, i) {
        this.li = true;
        return C(this.pending, (() => {
            var e;
            this.li = false;
            this.pending = void 0;
            void (null === (e = this.view) || void 0 === e ? void 0 : e.deactivate(t, this.$controller, i));
        }));
    }
    valueChanged(t, e, i) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t === e) return;
        this.work.start();
        const s = this.view;
        const n = this.$controller;
        const r = this.hi++;
        const o = () => !this.li && this.hi === r + 1;
        let l;
        return C(C(this.pending, (() => this.pending = C(null === s || void 0 === s ? void 0 : s.deactivate(s, n, i), (() => {
            var e;
            if (!o()) return;
            if (t) l = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(); else l = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create();
            if (null == l) return;
            l.setLocation(this.location);
            return C(l.activate(l, n, i, n.scope), (() => {
                if (o()) this.pending = void 0;
            }));
        })))), (() => this.work.finish()));
    }
    dispose() {
        var t, e;
        null === (t = this.ifView) || void 0 === t ? void 0 : t.dispose();
        null === (e = this.elseView) || void 0 === e ? void 0 : e.dispose();
        this.ifView = this.elseView = this.view = void 0;
    }
    accept(t) {
        var e;
        if (true === (null === (e = this.view) || void 0 === e ? void 0 : e.accept(t))) return true;
    }
}

If.inject = [ pi, Zi, Gi ];

rt([ gt ], If.prototype, "value", void 0);

rt([ gt({
    set: t => "" === t || !!t && "false" !== t
}) ], If.prototype, "cache", void 0);

Se("if")(If);

class Else {
    constructor(t) {
        this.factory = t;
        this.id = w("au$component");
    }
    link(t, e, i, s) {
        const n = t.children;
        const r = n[n.length - 1];
        if (r instanceof If) r.elseFactory = this.factory; else if (r.viewModel instanceof If) r.viewModel.elseFactory = this.factory; else throw new Error("AUR0810");
    }
}

Else.inject = [ pi ];

Se({
    name: "else"
})(Else);

function fr(t) {
    t.dispose();
}

const dr = [ 38962, 36913 ];

class Repeat {
    constructor(t, e, i) {
        this.l = t;
        this.ai = e;
        this.f = i;
        this.id = w("au$component");
        this.views = [];
        this.key = void 0;
        this.ui = void 0;
        this.fi = false;
        this.di = false;
        this.mi = null;
        this.vi = void 0;
    }
    binding(t, e, i) {
        const s = this.ai.bindings;
        const n = s.length;
        let r;
        let o;
        let l = 0;
        for (;n > l; ++l) {
            r = s[l];
            if (r.target === this && "items" === r.targetProperty) {
                o = this.forOf = r.sourceExpression;
                this.pi = r;
                let t = o.iterable;
                while (null != t && dr.includes(t.$kind)) {
                    t = t.expression;
                    this.fi = true;
                }
                this.mi = t;
                break;
            }
        }
        this.gi(i);
        this.local = o.declaration.evaluate(i, this.$controller.scope, r.locator, null);
    }
    attaching(t, e, i) {
        this.wi(i);
        return this.bi(t, i);
    }
    detaching(t, e, i) {
        this.gi(i);
        return this.xi(t, i);
    }
    itemsChanged(t) {
        const {$controller: e} = this;
        if (!e.isActive) return;
        t |= e.flags;
        this.gi(t);
        this.wi(t);
        const i = C(this.xi(null, t), (() => this.bi(null, t)));
        if (i instanceof Promise) i.catch((t => {
            throw t;
        }));
    }
    handleCollectionChange(t, e) {
        const {$controller: i} = this;
        if (!i.isActive) return;
        if (this.fi) {
            if (this.di) return;
            this.di = true;
            this.items = this.forOf.iterable.evaluate(e, i.scope, this.pi.locator, null);
            this.di = false;
            return;
        }
        e |= i.flags;
        this.wi(e);
        if (void 0 === t) {
            const t = C(this.xi(null, e), (() => this.bi(null, e)));
            if (t instanceof Promise) t.catch((t => {
                throw t;
            }));
        } else {
            const i = this.views.length;
            tt(t);
            if (t.deletedItems.length > 0) {
                t.deletedItems.sort(I);
                const s = C(this.yi(t, e), (() => this.ki(i, t, e)));
                if (s instanceof Promise) s.catch((t => {
                    throw t;
                }));
            } else this.ki(i, t, e);
        }
    }
    gi(t) {
        var e;
        const i = this.$controller.scope;
        let s = this.Ci;
        let n = this.fi;
        if (n) {
            s = this.Ci = null !== (e = this.mi.evaluate(t, i, this.pi.locator, null)) && void 0 !== e ? e : null;
            n = this.fi = !Object.is(this.items, s);
        }
        const r = this.ui;
        if (4 & t) {
            if (void 0 !== r) r.unsubscribe(this);
        } else if (this.$controller.isActive) {
            const t = this.ui = et(n ? s : this.items);
            if (r !== t && r) r.unsubscribe(this);
            if (t) t.subscribe(this);
        }
    }
    wi(t) {
        const e = this.items;
        if (e instanceof Array) {
            this.vi = e;
            return;
        }
        const i = this.forOf;
        if (void 0 === i) return;
        const s = [];
        this.forOf.iterate(t, e, ((t, e, i) => {
            s[e] = i;
        }));
        this.vi = s;
    }
    bi(t, e) {
        let i;
        let s;
        let n;
        let r;
        const {$controller: o, f: l, local: h, l: a, items: c} = this;
        const u = o.scope;
        const f = this.forOf.count(e, c);
        const d = this.views = Array(f);
        this.forOf.iterate(e, c, ((c, m, v) => {
            n = d[m] = l.create().setLocation(a);
            n.nodes.unlink();
            r = U.fromParent(u, it.create(h, v));
            wr(r.overrideContext, m, f);
            s = n.activate(null !== t && void 0 !== t ? t : n, o, e, r);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }));
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    xi(t, e) {
        let i;
        let s;
        let n;
        let r = 0;
        const {views: o, $controller: l} = this;
        const h = o.length;
        for (;h > r; ++r) {
            n = o[r];
            n.release();
            s = n.deactivate(null !== t && void 0 !== t ? t : n, l, e);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    yi(t, e) {
        let i;
        let s;
        let n;
        const {$controller: r, views: o} = this;
        const l = t.deletedItems;
        const h = l.length;
        let a = 0;
        for (;h > a; ++a) {
            n = o[l[a]];
            n.release();
            s = n.deactivate(n, r, e);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }
        a = 0;
        let c = 0;
        for (;h > a; ++a) {
            c = l[a] - a;
            o.splice(c, 1);
        }
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    ki(t, e, i) {
        var s;
        let n;
        let r;
        let o;
        let l;
        let h = 0;
        const {$controller: a, f: c, local: u, vi: f, l: d, views: m} = this;
        const v = e.length;
        for (;v > h; ++h) if (-2 === e[h]) {
            o = c.create();
            m.splice(h, 0, o);
        }
        if (m.length !== v) throw new Error(`AUR0814:${m.length}!=${v}`);
        const p = a.scope;
        const g = e.length;
        st(m, e);
        const w = gr(e);
        const b = w.length;
        let x;
        let y = b - 1;
        h = g - 1;
        for (;h >= 0; --h) {
            o = m[h];
            x = m[h + 1];
            o.nodes.link(null !== (s = null === x || void 0 === x ? void 0 : x.nodes) && void 0 !== s ? s : d);
            if (-2 === e[h]) {
                l = U.fromParent(p, it.create(u, f[h]));
                wr(l.overrideContext, h, g);
                o.setLocation(d);
                r = o.activate(o, a, i, l);
                if (r instanceof Promise) (null !== n && void 0 !== n ? n : n = []).push(r);
            } else if (y < 0 || 1 === b || h !== w[y]) {
                wr(o.scope.overrideContext, h, g);
                o.nodes.insertBefore(o.location);
            } else {
                if (t !== g) wr(o.scope.overrideContext, h, g);
                --y;
            }
        }
        if (void 0 !== n) return 1 === n.length ? n[0] : Promise.all(n);
    }
    dispose() {
        this.views.forEach(fr);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (void 0 !== e) for (let i = 0, s = e.length; i < s; ++i) if (true === e[i].accept(t)) return true;
    }
}

Repeat.inject = [ Zi, Vi, pi ];

rt([ gt ], Repeat.prototype, "items", void 0);

Se("repeat")(Repeat);

let mr = 16;

let vr = new Int32Array(mr);

let pr = new Int32Array(mr);

function gr(t) {
    const e = t.length;
    if (e > mr) {
        mr = e;
        vr = new Int32Array(e);
        pr = new Int32Array(e);
    }
    let i = 0;
    let s = 0;
    let n = 0;
    let r = 0;
    let o = 0;
    let l = 0;
    let h = 0;
    let a = 0;
    for (;r < e; r++) {
        s = t[r];
        if (-2 !== s) {
            o = vr[i];
            n = t[o];
            if (-2 !== n && n < s) {
                pr[r] = o;
                vr[++i] = r;
                continue;
            }
            l = 0;
            h = i;
            while (l < h) {
                a = l + h >> 1;
                n = t[vr[a]];
                if (-2 !== n && n < s) l = a + 1; else h = a;
            }
            n = t[vr[l]];
            if (s < n || -2 === n) {
                if (l > 0) pr[r] = vr[l - 1];
                vr[l] = r;
            }
        }
    }
    r = ++i;
    const c = new Int32Array(r);
    s = vr[i - 1];
    while (i-- > 0) {
        c[i] = s;
        s = pr[s];
    }
    while (r-- > 0) vr[r] = 0;
    return c;
}

function wr(t, e, i) {
    const s = 0 === e;
    const n = e === i - 1;
    const r = e % 2 === 0;
    t.$index = e;
    t.$first = s;
    t.$last = n;
    t.$middle = !s && !n;
    t.$even = r;
    t.$odd = !r;
    t.$length = i;
}

class With {
    constructor(t, e) {
        this.id = w("au$component");
        this.id = w("au$component");
        this.view = t.create().setLocation(e);
    }
    valueChanged(t, e, i) {
        const s = this.$controller;
        const n = this.view.bindings;
        let r;
        let o = 0, l = 0;
        if (s.isActive && null != n) {
            r = U.fromParent(s.scope, void 0 === t ? {} : t);
            for (l = n.length; l > o; ++o) n[o].$bind(2, r);
        }
    }
    attaching(t, e, i) {
        const {$controller: s, value: n} = this;
        const r = U.fromParent(s.scope, void 0 === n ? {} : n);
        return this.view.activate(t, s, i, r);
    }
    detaching(t, e, i) {
        return this.view.deactivate(t, this.$controller, i);
    }
    dispose() {
        this.view.dispose();
        this.view = void 0;
    }
    accept(t) {
        var e;
        if (true === (null === (e = this.view) || void 0 === e ? void 0 : e.accept(t))) return true;
    }
}

With.inject = [ pi, Zi ];

rt([ gt ], With.prototype, "value", void 0);

Se("with")(With);

let br = class Switch {
    constructor(t, e) {
        this.f = t;
        this.l = e;
        this.id = w("au$component");
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
    }
    link(t, e, i, s) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e, i) {
        const s = this.view;
        const n = this.$controller;
        this.queue((() => s.activate(t, n, i, n.scope)));
        this.queue((() => this.swap(t, i, this.value)));
        return this.promise;
    }
    detaching(t, e, i) {
        this.queue((() => {
            const e = this.view;
            return e.deactivate(t, this.$controller, i);
        }));
        return this.promise;
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
    valueChanged(t, e, i) {
        if (!this.$controller.isActive) return;
        this.queue((() => this.swap(null, i, this.value)));
    }
    caseChanged(t, e) {
        this.queue((() => this.Ai(t, e)));
    }
    Ai(t, e) {
        const i = t.isMatch(this.value, e);
        const s = this.activeCases;
        const n = s.length;
        if (!i) {
            if (n > 0 && s[0].id === t.id) return this.Si(null, e);
            return;
        }
        if (n > 0 && s[0].id < t.id) return;
        const r = [];
        let o = t.fallThrough;
        if (!o) r.push(t); else {
            const e = this.cases;
            const i = e.indexOf(t);
            for (let t = i, s = e.length; t < s && o; t++) {
                const i = e[t];
                r.push(i);
                o = i.fallThrough;
            }
        }
        return C(this.Si(null, e, r), (() => {
            this.activeCases = r;
            return this.Ri(null, e);
        }));
    }
    swap(t, e, i) {
        const s = [];
        let n = false;
        for (const t of this.cases) {
            if (n || t.isMatch(i, e)) {
                s.push(t);
                n = t.fallThrough;
            }
            if (s.length > 0 && !n) break;
        }
        const r = this.defaultCase;
        if (0 === s.length && void 0 !== r) s.push(r);
        return C(this.activeCases.length > 0 ? this.Si(t, e, s) : void 0, (() => {
            this.activeCases = s;
            if (0 === s.length) return;
            return this.Ri(t, e);
        }));
    }
    Ri(t, e) {
        const i = this.$controller;
        if (!i.isActive) return;
        const s = this.activeCases;
        const n = s.length;
        if (0 === n) return;
        const r = i.scope;
        if (1 === n) return s[0].activate(t, e, r);
        return A(...s.map((i => i.activate(t, e, r))));
    }
    Si(t, e, i = []) {
        const s = this.activeCases;
        const n = s.length;
        if (0 === n) return;
        if (1 === n) {
            const n = s[0];
            if (!i.includes(n)) {
                s.length = 0;
                return n.deactivate(t, e);
            }
            return;
        }
        return C(A(...s.reduce(((s, n) => {
            if (!i.includes(n)) s.push(n.deactivate(t, e));
            return s;
        }), [])), (() => {
            s.length = 0;
        }));
    }
    queue(t) {
        const e = this.promise;
        let i;
        i = this.promise = C(C(e, t), (() => {
            if (this.promise === i) this.promise = void 0;
        }));
    }
    accept(t) {
        if (true === this.$controller.accept(t)) return true;
        if (this.activeCases.some((e => e.accept(t)))) return true;
    }
};

rt([ gt ], br.prototype, "value", void 0);

br = rt([ Se("switch"), ot(0, pi), ot(1, Zi) ], br);

let xr = class Case {
    constructor(t, e, i, s) {
        this.Ei = e;
        this.id = w("au$component");
        this.fallThrough = false;
        this.Bi = s.config.level <= 1;
        this.Ut = s.scopeTo(`${this.constructor.name}-#${this.id}`);
        this.view = t.create().setLocation(i);
    }
    link(t, e, i, s) {
        const n = t.parent;
        const r = null === n || void 0 === n ? void 0 : n.viewModel;
        if (r instanceof br) {
            this.$switch = r;
            this.linkToSwitch(r);
        } else throw new Error("AUR0815");
    }
    detaching(t, e, i) {
        return this.deactivate(t, i);
    }
    isMatch(t, e) {
        this.Ut.debug("isMatch()");
        const i = this.value;
        if (Array.isArray(i)) {
            if (void 0 === this.ui) this.ui = this.Ii(e, i);
            return i.includes(t);
        }
        return i === t;
    }
    valueChanged(t, e, i) {
        var s;
        if (Array.isArray(t)) {
            null === (s = this.ui) || void 0 === s ? void 0 : s.unsubscribe(this);
            this.ui = this.Ii(i, t);
        } else if (void 0 !== this.ui) this.ui.unsubscribe(this);
        this.$switch.caseChanged(this, i);
    }
    handleCollectionChange(t, e) {
        this.$switch.caseChanged(this, e);
    }
    activate(t, e, i) {
        const s = this.view;
        if (s.isActive) return;
        return s.activate(null !== t && void 0 !== t ? t : s, this.$controller, e, i);
    }
    deactivate(t, e) {
        const i = this.view;
        if (!i.isActive) return;
        return i.deactivate(null !== t && void 0 !== t ? t : i, this.$controller, e);
    }
    dispose() {
        var t, e;
        null === (t = this.ui) || void 0 === t ? void 0 : t.unsubscribe(this);
        null === (e = this.view) || void 0 === e ? void 0 : e.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    Ii(t, e) {
        const i = this.Ei.getArrayObserver(e);
        i.subscribe(this);
        return i;
    }
    accept(t) {
        var e;
        if (true === this.$controller.accept(t)) return true;
        return null === (e = this.view) || void 0 === e ? void 0 : e.accept(t);
    }
};

xr.inject = [ pi, F, Zi, k ];

rt([ gt ], xr.prototype, "value", void 0);

rt([ gt({
    set: t => {
        switch (t) {
          case "true":
            return true;

          case "false":
            return false;

          default:
            return !!t;
        }
    },
    mode: D.oneTime
}) ], xr.prototype, "fallThrough", void 0);

xr = rt([ Se("case") ], xr);

let yr = class DefaultCase extends xr {
    linkToSwitch(t) {
        if (void 0 !== t.defaultCase) throw new Error("AUR0816");
        t.defaultCase = this;
    }
};

yr = rt([ Se("default-case") ], yr);

let kr = class PromiseTemplateController {
    constructor(t, e, i, s) {
        this.f = t;
        this.l = e;
        this.p = i;
        this.id = w("au$component");
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.logger = s.scopeTo("promise.resolve");
    }
    link(t, e, i, s) {
        this.view = this.f.create(this.$controller).setLocation(this.l);
    }
    attaching(t, e, i) {
        const s = this.view;
        const n = this.$controller;
        return C(s.activate(t, n, i, this.viewScope = U.fromParent(n.scope, {})), (() => this.swap(t, i)));
    }
    valueChanged(t, e, i) {
        if (!this.$controller.isActive) return;
        this.swap(null, i);
    }
    swap(t, e) {
        var i, s;
        const n = this.value;
        if (!(n instanceof Promise)) {
            this.logger.warn(`The value '${String(n)}' is not a promise. No change will be done.`);
            return;
        }
        const r = this.p.domWriteQueue;
        const o = this.fulfilled;
        const l = this.rejected;
        const h = this.pending;
        const a = this.viewScope;
        let c;
        const u = {
            reusable: false
        };
        const f = () => {
            void A(c = (this.preSettledTask = r.queueTask((() => A(null === o || void 0 === o ? void 0 : o.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.activate(t, e, a))), u)).result, n.then((i => {
                if (this.value !== n) return;
                const s = () => {
                    this.postSettlePromise = (this.postSettledTask = r.queueTask((() => A(null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === o || void 0 === o ? void 0 : o.activate(t, e, a, i))), u)).result;
                };
                if (1 === this.preSettledTask.status) void c.then(s); else {
                    this.preSettledTask.cancel();
                    s();
                }
            }), (i => {
                if (this.value !== n) return;
                const s = () => {
                    this.postSettlePromise = (this.postSettledTask = r.queueTask((() => A(null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === o || void 0 === o ? void 0 : o.deactivate(t, e), null === l || void 0 === l ? void 0 : l.activate(t, e, a, i))), u)).result;
                };
                if (1 === this.preSettledTask.status) void c.then(s); else {
                    this.preSettledTask.cancel();
                    s();
                }
            })));
        };
        if (1 === (null === (i = this.postSettledTask) || void 0 === i ? void 0 : i.status)) void this.postSettlePromise.then(f); else {
            null === (s = this.postSettledTask) || void 0 === s ? void 0 : s.cancel();
            f();
        }
    }
    detaching(t, e, i) {
        var s, n;
        null === (s = this.preSettledTask) || void 0 === s ? void 0 : s.cancel();
        null === (n = this.postSettledTask) || void 0 === n ? void 0 : n.cancel();
        this.preSettledTask = this.postSettledTask = null;
        return this.view.deactivate(t, this.$controller, i);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

rt([ gt ], kr.prototype, "value", void 0);

kr = rt([ Se("promise"), ot(0, pi), ot(1, Zi), ot(2, _t), ot(3, k) ], kr);

let Cr = class PendingTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s) {
        Rr(t).pending = this;
    }
    activate(t, e, i) {
        const s = this.view;
        if (s.isActive) return;
        return s.activate(s, this.$controller, e, i);
    }
    deactivate(t, e) {
        const i = this.view;
        if (!i.isActive) return;
        return i.deactivate(i, this.$controller, e);
    }
    detaching(t, e, i) {
        return this.deactivate(t, i);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

rt([ gt({
    mode: D.toView
}) ], Cr.prototype, "value", void 0);

Cr = rt([ Se("pending"), ot(0, pi), ot(1, Zi) ], Cr);

let Ar = class FulfilledTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s) {
        Rr(t).fulfilled = this;
    }
    activate(t, e, i, s) {
        this.value = s;
        const n = this.view;
        if (n.isActive) return;
        return n.activate(n, this.$controller, e, i);
    }
    deactivate(t, e) {
        const i = this.view;
        if (!i.isActive) return;
        return i.deactivate(i, this.$controller, e);
    }
    detaching(t, e, i) {
        return this.deactivate(t, i);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

rt([ gt({
    mode: D.fromView
}) ], Ar.prototype, "value", void 0);

Ar = rt([ Se("then"), ot(0, pi), ot(1, Zi) ], Ar);

let Sr = class RejectedTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s) {
        Rr(t).rejected = this;
    }
    activate(t, e, i, s) {
        this.value = s;
        const n = this.view;
        if (n.isActive) return;
        return n.activate(n, this.$controller, e, i);
    }
    deactivate(t, e) {
        const i = this.view;
        if (!i.isActive) return;
        return i.deactivate(i, this.$controller, e);
    }
    detaching(t, e, i) {
        return this.deactivate(t, i);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

rt([ gt({
    mode: D.fromView
}) ], Sr.prototype, "value", void 0);

Sr = rt([ Se("catch"), ot(0, pi), ot(1, Zi) ], Sr);

function Rr(t) {
    const e = t.parent;
    const i = null === e || void 0 === e ? void 0 : e.viewModel;
    if (i instanceof kr) return i;
    throw new Error("AUR0813");
}

let Er = class PromiseAttributePattern {
    "promise.resolve"(t, e, i) {
        return new AttrSyntax(t, e, "promise", "bind");
    }
};

Er = rt([ Et({
    pattern: "promise.resolve",
    symbols: ""
}) ], Er);

let Br = class FulfilledAttributePattern {
    then(t, e, i) {
        return new AttrSyntax(t, e, "then", "from-view");
    }
};

Br = rt([ Et({
    pattern: "then",
    symbols: ""
}) ], Br);

let Ir = class RejectedAttributePattern {
    catch(t, e, i) {
        return new AttrSyntax(t, e, "catch", "from-view");
    }
};

Ir = rt([ Et({
    pattern: "catch",
    symbols: ""
}) ], Ir);

function Tr(t, e, i, s) {
    if ("string" === typeof e) return Dr(t, e, i, s);
    if (Ke.isType(e)) return Pr(t, e, i, s);
    throw new Error(`Invalid Tag or Type.`);
}

class RenderPlan {
    constructor(t, e, i) {
        this.node = t;
        this.instructions = e;
        this.Ti = i;
        this.Di = void 0;
    }
    get definition() {
        if (void 0 === this.Di) this.Di = CustomElementDefinition.create({
            name: Ke.generateName(),
            template: this.node,
            needsCompile: "string" === typeof this.node,
            instructions: this.instructions,
            dependencies: this.Ti
        });
        return this.Di;
    }
    createView(t) {
        return this.getViewFactory(t).create();
    }
    getViewFactory(t) {
        return t.root.get(Ai).getViewFactory(this.definition, t.createChild().register(...this.Ti));
    }
    mergeInto(t, e, i) {
        t.appendChild(this.node);
        e.push(...this.instructions);
        i.push(...this.Ti);
    }
}

function Dr(t, e, i, s) {
    const n = [];
    const r = [];
    const o = [];
    const l = t.document.createElement(e);
    let h = false;
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (vs(e)) {
            h = true;
            n.push(e);
        } else l.setAttribute(t, e);
    }));
    if (h) {
        l.className = "au";
        r.push(n);
    }
    if (s) Or(t, l, s, r, o);
    return new RenderPlan(l, r, o);
}

function Pr(t, e, i, s) {
    const n = Ke.getDefinition(e);
    const r = [];
    const o = [ r ];
    const l = [];
    const h = [];
    const a = n.bindables;
    const c = t.document.createElement(n.name);
    c.className = "au";
    if (!l.includes(e)) l.push(e);
    r.push(new HydrateElementInstruction(n, void 0, h, null, false, void 0));
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (vs(e)) h.push(e); else if (void 0 === a[t]) h.push(new SetAttributeInstruction(e, t)); else h.push(new SetPropertyInstruction(e, t));
    }));
    if (s) Or(t, c, s, o, l);
    return new RenderPlan(c, o, l);
}

function Or(t, e, i, s, n) {
    for (let r = 0, o = i.length; r < o; ++r) {
        const o = i[r];
        switch (typeof o) {
          case "string":
            e.appendChild(t.document.createTextNode(o));
            break;

          case "object":
            if (o instanceof t.Node) e.appendChild(o); else if ("mergeInto" in o) o.mergeInto(e, s, n);
        }
    }
}

function $r(t, e) {
    const i = e.to;
    if (void 0 !== i && "subject" !== i && "composing" !== i) t[i] = e;
    return t;
}

class AuRender {
    constructor(t, e, i, s) {
        this.p = t;
        this.Pi = e;
        this.Oi = i;
        this.r = s;
        this.id = w("au$component");
        this.component = void 0;
        this.composing = false;
        this.view = void 0;
        this.$i = void 0;
        this.Li = e.props.reduce($r, {});
    }
    attaching(t, e, i) {
        const {component: s, view: n} = this;
        if (void 0 === n || this.$i !== s) {
            this.$i = s;
            this.composing = true;
            return this.compose(void 0, s, t, i);
        }
        return this.compose(n, s, t, i);
    }
    detaching(t, e, i) {
        return this.ri(this.view, t, i);
    }
    componentChanged(t, e, i) {
        const {$controller: s} = this;
        if (!s.isActive) return;
        if (this.$i === t) return;
        this.$i = t;
        this.composing = true;
        i |= s.flags;
        const n = C(this.ri(this.view, null, i), (() => this.compose(void 0, t, null, i)));
        if (n instanceof Promise) n.catch((t => {
            throw t;
        }));
    }
    compose(t, e, i, s) {
        return C(void 0 === t ? C(e, (t => this.qi(t, s))) : t, (t => this.si(this.view = t, i, s)));
    }
    ri(t, e, i) {
        return null === t || void 0 === t ? void 0 : t.deactivate(null !== e && void 0 !== e ? e : t, this.$controller, i);
    }
    si(t, e, i) {
        const {$controller: s} = this;
        return C(null === t || void 0 === t ? void 0 : t.activate(null !== e && void 0 !== e ? e : t, s, i, s.scope), (() => {
            this.composing = false;
        }));
    }
    qi(t, e) {
        const i = this.Mi(t, e);
        if (i) {
            i.setLocation(this.$controller.location);
            i.lockScope(this.$controller.scope);
            return i;
        }
        return;
    }
    Mi(t, e) {
        if (!t) return;
        const i = this.Oi.controller.container;
        if ("object" === typeof t) {
            if (Lr(t)) return t;
            if ("createView" in t) return t.createView(i);
            if ("create" in t) return t.create();
            if ("template" in t) return this.r.getViewFactory(CustomElementDefinition.getOrCreate(t), i).create();
        }
        if ("string" === typeof t) {
            const e = i.find(Ke, t);
            if (null == e) throw new Error(`AUR0809:${t}`);
            t = e.Type;
        }
        return Tr(this.p, t, this.Li, this.$controller.host.childNodes).createView(i);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
    accept(t) {
        var e;
        if (true === (null === (e = this.view) || void 0 === e ? void 0 : e.accept(t))) return true;
    }
}

AuRender.inject = [ _t, ms, _i, Ai ];

rt([ gt ], AuRender.prototype, "component", void 0);

rt([ gt({
    mode: D.fromView
}) ], AuRender.prototype, "composing", void 0);

$e({
    name: "au-render",
    template: null,
    containerless: true,
    capture: true
})(AuRender);

function Lr(t) {
    return "lockScope" in t;
}

class AuCompose {
    constructor(t, e, i, s, n, r) {
        this.c = t;
        this.parent = e;
        this.host = i;
        this.p = s;
        this.scopeBehavior = "auto";
        this.Ui = void 0;
        this.l = n.containerless ? ss(this.host) : void 0;
        this.r = t.get(Ai);
        this.Pi = n;
        this.Fi = r;
    }
    static get inject() {
        return [ g, Vi, Yi, _t, ms, T(CompositionContextFactory) ];
    }
    get pending() {
        return this.Vi;
    }
    get composition() {
        return this.Ui;
    }
    attaching(t, e, i) {
        return this.Vi = C(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, t, void 0)), (t => {
            if (this.Fi.isCurrent(t)) this.Vi = void 0;
        }));
    }
    detaching(t) {
        const e = this.Ui;
        const i = this.Vi;
        this.Fi.invalidate();
        this.Ui = this.Vi = void 0;
        return C(i, (() => null === e || void 0 === e ? void 0 : e.deactivate(t)));
    }
    propertyChanged(t) {
        if ("model" === t && null != this.Ui) {
            this.Ui.update(this.model);
            return;
        }
        this.Vi = C(this.Vi, (() => C(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, t)), (t => {
            if (this.Fi.isCurrent(t)) this.Vi = void 0;
        }))));
    }
    queue(t) {
        const e = this.Fi;
        const i = this.Ui;
        return C(e.create(t), (s => {
            if (e.isCurrent(s)) return C(this.compose(s), (n => {
                if (e.isCurrent(s)) return C(n.activate(), (() => {
                    if (e.isCurrent(s)) {
                        this.Ui = n;
                        return C(null === i || void 0 === i ? void 0 : i.deactivate(t.initiator), (() => s));
                    } else return C(n.controller.deactivate(n.controller, this.$controller, 4), (() => {
                        n.controller.dispose();
                        return s;
                    }));
                }));
                n.controller.dispose();
                return s;
            }));
            return s;
        }));
    }
    compose(t) {
        let e;
        let i;
        let s;
        const {view: n, viewModel: r, model: o, initiator: l} = t.change;
        const {c: h, host: a, $controller: c, l: u} = this;
        const f = this.getDef(r);
        const d = h.createChild();
        const m = null == u ? a.parentNode : u.parentNode;
        if (null !== f) {
            if (f.containerless) throw new Error("AUR0806");
            if (null == u) {
                i = a;
                s = () => {};
            } else {
                i = m.insertBefore(this.p.document.createElement(f.name), u);
                s = () => {
                    i.remove();
                };
            }
            e = this.getVm(d, r, i);
        } else {
            i = null == u ? a : u;
            e = this.getVm(d, r, i);
        }
        const v = () => {
            if (null !== f) {
                const n = Controller.$el(d, e, i, {
                    projections: this.Pi.projections
                }, f);
                return new CompositionController(n, (() => n.activate(null !== l && void 0 !== l ? l : n, c, 2, c.scope.parentScope)), (t => C(n.deactivate(null !== t && void 0 !== t ? t : n, c, 4), s)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: Ke.generateName(),
                    template: n
                });
                const r = this.r.getViewFactory(s, d);
                const o = Controller.$view(r, c);
                const h = "auto" === this.scopeBehavior ? U.fromParent(this.parent.scope, e) : U.create(e);
                if (ns(i)) o.setLocation(i); else o.setHost(i);
                return new CompositionController(o, (() => o.activate(null !== l && void 0 !== l ? l : o, c, 2, h)), (t => o.deactivate(null !== t && void 0 !== t ? t : o, c, 4)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            }
        };
        if ("activate" in e) return C(e.activate(o), (() => v())); else return v();
    }
    getVm(t, e, i) {
        if (null == e) return new EmptyComponent$1;
        if ("object" === typeof e) return e;
        const s = this.p;
        const n = ns(i);
        t.registerResolver(s.Element, t.registerResolver(Yi, new x("ElementResolver", n ? null : i)));
        t.registerResolver(Zi, new x("IRenderLocation", n ? i : null));
        const r = t.invoke(e);
        t.registerResolver(e, new x("au-compose.viewModel", r));
        return r;
    }
    getDef(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Ke.isType(e) ? Ke.getDefinition(e) : null;
    }
}

rt([ gt ], AuCompose.prototype, "view", void 0);

rt([ gt ], AuCompose.prototype, "viewModel", void 0);

rt([ gt ], AuCompose.prototype, "model", void 0);

rt([ gt({
    set: t => {
        if ("scoped" === t || "auto" === t) return t;
        throw new Error("AUR0805");
    }
}) ], AuCompose.prototype, "scopeBehavior", void 0);

$e("au-compose")(AuCompose);

class EmptyComponent$1 {}

class CompositionContextFactory {
    constructor() {
        this.id = 0;
    }
    isFirst(t) {
        return 0 === t.id;
    }
    isCurrent(t) {
        return t.id === this.id - 1;
    }
    create(t) {
        return C(t.load(), (t => new CompositionContext(this.id++, t)));
    }
    invalidate() {
        this.id++;
    }
}

class ChangeInfo {
    constructor(t, e, i, s, n) {
        this.view = t;
        this.viewModel = e;
        this.model = i;
        this.initiator = s;
        this.src = n;
    }
    load() {
        if (this.view instanceof Promise || this.viewModel instanceof Promise) return Promise.all([ this.view, this.viewModel ]).then((([t, e]) => new LoadedChangeInfo(t, e, this.model, this.initiator, this.src))); else return new LoadedChangeInfo(this.view, this.viewModel, this.model, this.initiator, this.src);
    }
}

class LoadedChangeInfo {
    constructor(t, e, i, s, n) {
        this.view = t;
        this.viewModel = e;
        this.model = i;
        this.initiator = s;
        this.src = n;
    }
}

class CompositionContext {
    constructor(t, e) {
        this.id = t;
        this.change = e;
    }
}

class CompositionController {
    constructor(t, e, i, s, n) {
        this.controller = t;
        this.start = e;
        this.stop = i;
        this.update = s;
        this.context = n;
        this.state = 0;
    }
    activate() {
        if (0 !== this.state) throw new Error(`AUR0807:${this.controller.name}`);
        this.state = 1;
        return this.start();
    }
    deactivate(t) {
        switch (this.state) {
          case 1:
            this.state = -1;
            return this.stop(t);

          case -1:
            throw new Error("AUR0808");

          default:
            this.state = -1;
        }
    }
}

class AuSlot {
    constructor(t, e, i, s) {
        var n, r;
        this._i = null;
        this.ji = null;
        let o;
        const l = e.auSlot;
        const h = null === (r = null === (n = i.instruction) || void 0 === n ? void 0 : n.projections) || void 0 === r ? void 0 : r[l.name];
        if (null == h) {
            o = s.getViewFactory(l.fallback, i.controller.container);
            this.Ni = false;
        } else {
            o = s.getViewFactory(h, i.parent.controller.container);
            this.Ni = true;
        }
        this.Oi = i;
        this.view = o.create().setLocation(t);
    }
    static get inject() {
        return [ Zi, ms, _i, Ai ];
    }
    binding(t, e, i) {
        var s;
        this._i = this.$controller.scope.parentScope;
        let n;
        if (this.Ni) {
            n = this.Oi.controller.scope.parentScope;
            (this.ji = U.fromParent(n, n.bindingContext)).overrideContext.$host = null !== (s = this.expose) && void 0 !== s ? s : this._i.bindingContext;
        }
    }
    attaching(t, e, i) {
        return this.view.activate(t, this.$controller, i, this.Ni ? this.ji : this._i);
    }
    detaching(t, e, i) {
        return this.view.deactivate(t, this.$controller, i);
    }
    exposeChanged(t) {
        if (this.Ni && null != this.ji) this.ji.overrideContext.$host = t;
    }
    dispose() {
        this.view.dispose();
        this.view = void 0;
    }
    accept(t) {
        var e;
        if (true === (null === (e = this.view) || void 0 === e ? void 0 : e.accept(t))) return true;
    }
}

rt([ gt ], AuSlot.prototype, "expose", void 0);

$e({
    name: "au-slot",
    template: null,
    containerless: true
})(AuSlot);

const qr = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const Mr = l.createInterface("ISanitizer", (t => t.singleton(class {
    sanitize(t) {
        return t.replace(qr, "");
    }
})));

let Ur = class SanitizeValueConverter {
    constructor(t) {
        this.Wi = t;
    }
    toView(t) {
        if (null == t) return null;
        return this.Wi.sanitize(t);
    }
};

Ur = rt([ ot(0, Mr) ], Ur);

nt("sanitize")(Ur);

let Fr = class ViewValueConverter {
    constructor(t) {
        this.Hi = t;
    }
    toView(t, e) {
        return this.Hi.getViewComponentForObject(t, e);
    }
};

Fr = rt([ ot(0, Ci) ], Fr);

nt("view")(Fr);

const Vr = DebounceBindingBehavior;

const _r = OneTimeBindingBehavior;

const jr = ToViewBindingBehavior;

const Nr = FromViewBindingBehavior;

const Wr = SignalBindingBehavior;

const Hr = ThrottleBindingBehavior;

const zr = TwoWayBindingBehavior;

const Gr = TemplateCompiler;

const Xr = NodeObserverLocator;

const Kr = [ Gr, Xr ];

const Yr = SVGAnalyzer;

const Qr = Lt;

const Zr = $t;

const Jr = Ot;

const to = Pt;

const eo = qt;

const io = [ Jr, to, eo ];

const so = [ Qr, Zr ];

const no = fn;

const ro = un;

const oo = dn;

const lo = an;

const ho = ln;

const ao = hn;

const co = cn;

const uo = xn;

const fo = mn;

const mo = vn;

const vo = pn;

const po = gn;

const go = bn;

const wo = wn;

const bo = yn;

const xo = [ ro, ho, lo, ao, co, no, oo, uo, fo, mo, vo, go, wo, po, bo ];

const yo = Ur;

const ko = Fr;

const Co = FrequentMutations;

const Ao = ObserveShallow;

const So = If;

const Ro = Else;

const Eo = Repeat;

const Bo = With;

const Io = br;

const To = xr;

const Do = yr;

const Po = kr;

const Oo = Cr;

const $o = Ar;

const Lo = Sr;

const qo = Er;

const Mo = Br;

const Uo = Ir;

const Fo = AttrBindingBehavior;

const Vo = SelfBindingBehavior;

const _o = UpdateTriggerBindingBehavior;

const jo = AuRender;

const No = AuCompose;

const Wo = Portal;

const Ho = Focus;

const zo = ur;

const Go = [ Vr, _r, jr, Nr, Wr, Hr, zr, yo, ko, Co, Ao, So, Ro, Eo, Bo, Io, To, Do, Po, Oo, $o, Lo, qo, Mo, Uo, Fo, Vo, _o, jo, No, Wo, Ho, zo, AuSlot ];

const Xo = Es;

const Ko = As;

const Yo = Cs;

const Qo = Is;

const Zo = Ds;

const Jo = Rs;

const tl = Ts;

const el = Bs;

const il = ks;

const sl = Ss;

const nl = qs;

const rl = _s;

const ol = Ms;

const ll = Us;

const hl = Fs;

const al = Vs;

const cl = Ls;

const ul = js;

const fl = [ tl, Zo, Xo, el, Qo, il, Yo, Ko, sl, Jo, nl, rl, ol, ll, hl, al, cl, ul ];

const dl = {
    register(t) {
        return t.register(...Kr, ...Go, ...io, ...xo, ...fl);
    },
    createContainer() {
        return this.register(l.createContainer());
    }
};

const ml = l.createInterface("IAurelia");

class Aurelia {
    constructor(t = l.createContainer()) {
        this.container = t;
        this.ir = false;
        this.zi = false;
        this.Gi = false;
        this.Xi = void 0;
        this.next = void 0;
        this.Ki = void 0;
        this.Yi = void 0;
        if (t.has(ml, true)) throw new Error("AUR0768");
        t.registerResolver(ml, new x("IAurelia", this));
        t.registerResolver(zi, this.Qi = new x("IAppRoot"));
    }
    get isRunning() {
        return this.ir;
    }
    get isStarting() {
        return this.zi;
    }
    get isStopping() {
        return this.Gi;
    }
    get root() {
        if (null == this.Xi) {
            if (null == this.next) throw new Error("AUR0767");
            return this.next;
        }
        return this.Xi;
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.Zi(t.host), this.container, this.Qi);
        return this;
    }
    enhance(t, e) {
        var i;
        const s = null !== (i = t.container) && void 0 !== i ? i : this.container.createChild();
        const n = t.host;
        const r = this.Zi(n);
        const o = t.component;
        let l;
        if ("function" === typeof o) {
            s.registerResolver(r.HTMLElement, s.registerResolver(r.Element, s.registerResolver(Yi, new x("ElementResolver", n))));
            l = s.invoke(o);
        } else l = o;
        s.registerResolver(Qi, new x("IEventTarget", n));
        e = null !== e && void 0 !== e ? e : null;
        const h = Controller.$el(s, l, n, null, CustomElementDefinition.create({
            name: Ke.generateName(),
            template: n,
            enhance: true
        }));
        return C(h.activate(h, e, 2), (() => h));
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domWriteQueue.yield();
        await t.domReadQueue.yield();
        await t.taskQueue.yield();
    }
    Zi(e) {
        let i;
        if (!this.container.has(_t, false)) {
            if (null === e.ownerDocument.defaultView) throw new Error("AUR0769");
            i = new t(e.ownerDocument.defaultView);
            this.container.register(c.instance(_t, i));
        } else i = this.container.get(_t);
        return i;
    }
    start(t = this.next) {
        if (null == t) throw new Error("AUR0770");
        if (this.Ki instanceof Promise) return this.Ki;
        return this.Ki = C(this.stop(), (() => {
            Reflect.set(t.host, "$aurelia", this);
            this.Qi.prepare(this.Xi = t);
            this.zi = true;
            return C(t.activate(), (() => {
                this.ir = true;
                this.zi = false;
                this.Ki = void 0;
                this.Ji(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (this.Yi instanceof Promise) return this.Yi;
        if (true === this.ir) {
            const e = this.Xi;
            this.ir = false;
            this.Gi = true;
            return this.Yi = C(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) e.dispose();
                this.Xi = void 0;
                this.Qi.dispose();
                this.Gi = false;
                this.Ji(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.ir || this.Gi) throw new Error("AUR0771");
        this.container.dispose();
    }
    Ji(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

var vl;

(function(t) {
    t[t["Element"] = 1] = "Element";
    t[t["Attribute"] = 2] = "Attribute";
})(vl || (vl = {}));

const pl = l.createInterface("IDialogService");

const gl = l.createInterface("IDialogController");

const wl = l.createInterface("IDialogDomRenderer");

const bl = l.createInterface("IDialogDom");

const xl = l.createInterface("IDialogGlobalSettings");

class DialogOpenResult {
    constructor(t, e) {
        this.wasCancelled = t;
        this.dialog = e;
    }
    static create(t, e) {
        return new DialogOpenResult(t, e);
    }
}

class DialogCloseResult {
    constructor(t, e) {
        this.status = t;
        this.value = e;
    }
    static create(t, e) {
        return new DialogCloseResult(t, e);
    }
}

var yl;

(function(t) {
    t["Ok"] = "ok";
    t["Error"] = "error";
    t["Cancel"] = "cancel";
    t["Abort"] = "abort";
})(yl || (yl = {}));

class DialogController {
    constructor(t, e) {
        this.p = t;
        this.ctn = e;
        this.closed = new Promise(((t, e) => {
            this.Ot = t;
            this.Et = e;
        }));
    }
    static get inject() {
        return [ _t, g ];
    }
    activate(t) {
        var e;
        const i = this.ctn.createChild();
        const {model: s, template: n, rejectOnCancel: r} = t;
        const o = i.get(wl);
        const l = null !== (e = t.host) && void 0 !== e ? e : this.p.document.body;
        const h = this.dom = o.render(l, t);
        const a = i.has(Qi, true) ? i.get(Qi) : null;
        const u = h.contentHost;
        this.settings = t;
        if (null == a || !a.contains(l)) i.register(c.instance(Qi, l));
        i.register(c.instance(Yi, u), c.instance(bl, h));
        return new Promise((e => {
            var n, r;
            const o = Object.assign(this.cmp = this.getOrCreateVm(i, t, u), {
                $dialog: this
            });
            e(null !== (r = null === (n = o.canActivate) || void 0 === n ? void 0 : n.call(o, s)) && void 0 !== r ? r : true);
        })).then((e => {
            var o;
            if (true !== e) {
                h.dispose();
                if (r) throw kl(null, "Dialog activation rejected");
                return DialogOpenResult.create(true, this);
            }
            const l = this.cmp;
            return C(null === (o = l.activate) || void 0 === o ? void 0 : o.call(l, s), (() => {
                var e;
                const s = this.controller = Controller.$el(i, l, u, null, CustomElementDefinition.create(null !== (e = this.getDefinition(l)) && void 0 !== e ? e : {
                    name: Ke.generateName(),
                    template: n
                }));
                return C(s.activate(s, null, 2), (() => {
                    var e;
                    h.overlay.addEventListener(null !== (e = t.mouseEvent) && void 0 !== e ? e : "click", this);
                    return DialogOpenResult.create(false, this);
                }));
            }));
        }), (t => {
            h.dispose();
            throw t;
        }));
    }
    deactivate(t, e) {
        if (this.ts) return this.ts;
        let i = true;
        const {controller: s, dom: n, cmp: r, settings: {mouseEvent: o, rejectOnCancel: l}} = this;
        const h = DialogCloseResult.create(t, e);
        const a = new Promise((a => {
            var c, u;
            a(C(null !== (u = null === (c = r.canDeactivate) || void 0 === c ? void 0 : c.call(r, h)) && void 0 !== u ? u : true, (a => {
                var c;
                if (true !== a) {
                    i = false;
                    this.ts = void 0;
                    if (l) throw kl(null, "Dialog cancellation rejected");
                    return DialogCloseResult.create("abort");
                }
                return C(null === (c = r.deactivate) || void 0 === c ? void 0 : c.call(r, h), (() => C(s.deactivate(s, null, 4), (() => {
                    n.dispose();
                    n.overlay.removeEventListener(null !== o && void 0 !== o ? o : "click", this);
                    if (!l && "error" !== t) this.Ot(h); else this.Et(kl(e, "Dialog cancelled with a rejection on cancel"));
                    return h;
                }))));
            })));
        })).catch((t => {
            this.ts = void 0;
            throw t;
        }));
        this.ts = i ? a : void 0;
        return a;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(t) {
        const e = Cl(t);
        return new Promise((t => {
            var i, s;
            return t(C(null === (s = (i = this.cmp).deactivate) || void 0 === s ? void 0 : s.call(i, DialogCloseResult.create("error", e)), (() => C(this.controller.deactivate(this.controller, null, 4), (() => {
                this.dom.dispose();
                this.Et(e);
            })))));
        }));
    }
    handleEvent(t) {
        if (this.settings.overlayDismiss && !this.dom.contentHost.contains(t.target)) this.cancel();
    }
    getOrCreateVm(t, e, i) {
        const s = e.component;
        if (null == s) return new EmptyComponent;
        if ("object" === typeof s) return s;
        const n = this.p;
        t.registerResolver(n.HTMLElement, t.registerResolver(n.Element, t.registerResolver(Yi, new x("ElementResolver", i))));
        return t.invoke(s);
    }
    getDefinition(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Ke.isType(e) ? Ke.getDefinition(e) : null;
    }
}

class EmptyComponent {}

function kl(t, e) {
    const i = new Error(e);
    i.wasCancelled = true;
    i.value = t;
    return i;
}

function Cl(t) {
    const e = new Error;
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor(t, e, i) {
        this.ct = t;
        this.p = e;
        this.es = i;
        this.dlgs = [];
    }
    get controllers() {
        return this.dlgs.slice(0);
    }
    get top() {
        const t = this.dlgs;
        return t.length > 0 ? t[t.length - 1] : null;
    }
    static get inject() {
        return [ g, _t, xl ];
    }
    static register(t) {
        t.register(c.singleton(pl, this), fe.beforeDeactivate(pl, (t => C(t.closeAll(), (t => {
            if (t.length > 0) throw new Error(`AUR0901:${t.length}`);
        })))));
    }
    open(t) {
        return Sl(new Promise((e => {
            var i;
            const s = DialogSettings.from(this.es, t);
            const n = null !== (i = s.container) && void 0 !== i ? i : this.ct.createChild();
            e(C(s.load(), (t => {
                const e = n.invoke(DialogController);
                n.register(c.instance(gl, e));
                n.register(c.callback(DialogController, (() => {
                    throw new Error("AUR0902");
                })));
                return C(e.activate(t), (t => {
                    if (!t.wasCancelled) {
                        if (1 === this.dlgs.push(e)) this.p.window.addEventListener("keydown", this);
                        const t = () => this.remove(e);
                        e.closed.then(t, t);
                    }
                    return t;
                }));
            })));
        })));
    }
    closeAll() {
        return Promise.all(Array.from(this.dlgs).map((t => {
            if (t.settings.rejectOnCancel) return t.cancel().then((() => null));
            return t.cancel().then((e => "cancel" === e.status ? null : t));
        }))).then((t => t.filter((t => !!t))));
    }
    remove(t) {
        const e = this.dlgs;
        const i = e.indexOf(t);
        if (i > -1) this.dlgs.splice(i, 1);
        if (0 === e.length) this.p.window.removeEventListener("keydown", this);
    }
    handleEvent(t) {
        const e = t;
        const i = Rl(e);
        if (null == i) return;
        const s = this.top;
        if (null === s || 0 === s.settings.keyboard.length) return;
        const n = s.settings.keyboard;
        if ("Escape" === i && n.includes(i)) void s.cancel(); else if ("Enter" === i && n.includes(i)) void s.ok();
    }
}

class DialogSettings {
    static from(...t) {
        return Object.assign(new DialogSettings, ...t).os().ss();
    }
    load() {
        const t = this;
        const e = this.component;
        const i = this.template;
        const s = A(null == e ? void 0 : C(e(), (e => {
            t.component = e;
        })), "function" === typeof i ? C(i(), (e => {
            t.template = e;
        })) : void 0);
        return s instanceof Promise ? s.then((() => t)) : t;
    }
    os() {
        if (null == this.component && null == this.template) throw new Error("AUR0903");
        return this;
    }
    ss() {
        if (null == this.keyboard) this.keyboard = this.lock ? [] : [ "Enter", "Escape" ];
        if ("boolean" !== typeof this.overlayDismiss) this.overlayDismiss = !this.lock;
        return this;
    }
}

function Al(t, e) {
    return this.then((i => i.dialog.closed.then(t, e)), e);
}

function Sl(t) {
    t.whenClosed = Al;
    return t;
}

function Rl(t) {
    if ("Escape" === (t.code || t.key) || 27 === t.keyCode) return "Escape";
    if ("Enter" === (t.code || t.key) || 13 === t.keyCode) return "Enter";
    return;
}

class DefaultDialogGlobalSettings {
    constructor() {
        this.lock = true;
        this.startingZIndex = 1e3;
        this.rejectOnCancel = false;
    }
    static register(t) {
        c.singleton(xl, this).register(t);
    }
}

const El = "position:absolute;width:100%;height:100%;top:0;left:0;";

class DefaultDialogDomRenderer {
    constructor(t) {
        this.p = t;
        this.wrapperCss = `${El} display:flex;`;
        this.overlayCss = El;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        c.singleton(wl, this).register(t);
    }
    render(t) {
        const e = this.p.document;
        const i = (t, i) => {
            const s = e.createElement(t);
            s.style.cssText = i;
            return s;
        };
        const s = t.appendChild(i("au-dialog-container", this.wrapperCss));
        const n = s.appendChild(i("au-dialog-overlay", this.overlayCss));
        const r = s.appendChild(i("div", this.hostCss));
        return new DefaultDialogDom(s, n, r);
    }
}

DefaultDialogDomRenderer.inject = [ _t ];

class DefaultDialogDom {
    constructor(t, e, i) {
        this.wrapper = t;
        this.overlay = e;
        this.contentHost = i;
    }
    dispose() {
        this.wrapper.remove();
    }
}

function Bl(t, e) {
    return {
        settingsProvider: t,
        register: i => i.register(...e, fe.beforeCreate((() => t(i.get(xl))))),
        customize(t, i) {
            return Bl(t, null !== i && void 0 !== i ? i : e);
        }
    };
}

const Il = Bl((() => {
    throw new Error("AUR0904");
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(c.singleton(xl, this));
    }
} ]);

const Tl = Bl(o, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer ]);

const Dl = l.createInterface((t => t.singleton(WcCustomElementRegistry)));

class WcCustomElementRegistry {
    constructor(t, e, i) {
        this.ctn = t;
        this.p = e;
        this.r = i;
    }
    define(t, e, i) {
        if (!t.includes("-")) throw new Error('Invalid web-components custom element name. It must include a "-"');
        let s;
        if (null == e) throw new Error("Invalid custom element definition");
        switch (typeof e) {
          case "function":
            s = Ke.isType(e) ? Ke.getDefinition(e) : CustomElementDefinition.create(Ke.generateName(), e);
            break;

          default:
            s = CustomElementDefinition.getOrCreate(e);
            break;
        }
        if (s.containerless) throw new Error("Containerless custom element is not supported. Consider using buitl-in extends instead");
        const n = !(null === i || void 0 === i ? void 0 : i.extends) ? HTMLElement : this.p.document.createElement(i.extends).constructor;
        const r = this.ctn;
        const o = this.r;
        const l = s.bindables;
        const h = this.p;
        class CustomElementClass extends n {
            auInit() {
                if (this.auInited) return;
                this.auInited = true;
                const t = r.createChild();
                t.registerResolver(h.HTMLElement, t.registerResolver(h.Element, t.registerResolver(Yi, new x("ElementProvider", this))));
                const e = o.compile(s, t, {
                    projections: null
                });
                const i = t.invoke(e.Type);
                const n = this.auCtrl = Controller.$el(t, i, this, null, e);
                Ki(this, e.key, n);
            }
            connectedCallback() {
                this.auInit();
                this.auCtrl.activate(this.auCtrl, null, 0);
            }
            disconnectedCallback() {
                this.auCtrl.deactivate(this.auCtrl, null, 0);
            }
            adoptedCallback() {
                this.auInit();
            }
            attributeChangedCallback(t, e, i) {
                this.auInit();
                this.auCtrl.viewModel[t] = i;
            }
        }
        CustomElementClass.observedAttributes = Object.keys(l);
        for (const t in l) Object.defineProperty(CustomElementClass.prototype, t, {
            configurable: true,
            enumerable: false,
            get() {
                return this["auCtrl"].viewModel[t];
            },
            set(e) {
                if (!this["auInited"]) this["auInit"]();
                this["auCtrl"].viewModel[t] = e;
            }
        });
        this.p.customElements.define(t, CustomElementClass, i);
        return CustomElementClass;
    }
}

WcCustomElementRegistry.inject = [ g, _t, Ai ];

export { AdoptedStyleSheetsStyles, AppRoot, fe as AppTask, Lt as AtPrefixedTriggerAttributePattern, Qr as AtPrefixedTriggerAttributePatternRegistration, AttrBindingBehavior, Fo as AttrBindingBehaviorRegistration, gn as AttrBindingCommand, po as AttrBindingCommandRegistration, AttrSyntax, AttributeBinding, AttributeBindingInstruction, rl as AttributeBindingRendererRegistration, AttributeNSAccessor, Dt as AttributePattern, AuCompose, AuRender, jo as AuRenderRegistration, AuSlot, AuSlotsInfo, Aurelia, xt as Bindable, BindableDefinition, BindableObserver, BindablesInfo, on as BindingCommand, BindingCommandDefinition, BindingModeBehavior, CSSModulesProcessorRegistry, CallBinding, fn as CallBindingCommand, no as CallBindingCommandRegistration, CallBindingInstruction, Xo as CallBindingRendererRegistration, pn as CaptureBindingCommand, vo as CaptureBindingCommandRegistration, xr as Case, CheckedObserver, ge as Children, ChildrenDefinition, ChildrenObserver, ClassAttributeAccessor, bn as ClassBindingCommand, go as ClassBindingCommandRegistration, $t as ColonPrefixedBindAttributePattern, Zr as ColonPrefixedBindAttributePatternRegistration, tn as CommandType, ComputedWatcher, Controller, Ie as CustomAttribute, CustomAttributeDefinition, Ko as CustomAttributeRendererRegistration, Ke as CustomElement, CustomElementDefinition, Yo as CustomElementRendererRegistration, DataAttributeAccessor, DebounceBindingBehavior, Vr as DebounceBindingBehaviorRegistration, un as DefaultBindingCommand, ro as DefaultBindingCommandRegistration, xo as DefaultBindingLanguage, io as DefaultBindingSyntax, yr as DefaultCase, Kr as DefaultComponents, DefaultDialogDom, DefaultDialogDomRenderer, DefaultDialogGlobalSettings, fl as DefaultRenderers, Go as DefaultResources, vl as DefinitionType, vn as DelegateBindingCommand, mo as DelegateBindingCommandRegistration, DialogCloseResult, Il as DialogConfiguration, DialogController, yl as DialogDeactivationStatuses, Tl as DialogDefaultConfiguration, DialogOpenResult, DialogService, Pt as DotSeparatedAttributePattern, to as DotSeparatedAttributePatternRegistration, Else, Ro as ElseRegistration, EventDelegator, EventSubscriber, ExpressionWatcher, Focus, dn as ForBindingCommand, oo as ForBindingCommandRegistration, FragmentNodeSequence, FrequentMutations, FromViewBindingBehavior, Nr as FromViewBindingBehaviorRegistration, an as FromViewBindingCommand, lo as FromViewBindingCommandRegistration, Ar as FulfilledTemplateController, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, zi as IAppRoot, ue as IAppTask, Wt as IAttrMapper, Rt as IAttributeParser, St as IAttributePattern, fs as IAuSlotsInfo, ml as IAurelia, Vi as IController, gl as IDialogController, bl as IDialogDom, wl as IDialogDomRenderer, xl as IDialogGlobalSettings, pl as IDialogService, cs as IEventDelegator, Qi as IEventTarget, ls as IHistory, _i as IHydrationContext, ms as IInstruction, ui as ILifecycleHooks, os as ILocation, Yi as INode, Xr as INodeObserverLocatorRegistration, _t as IPlatform, us as IProjections, Zi as IRenderLocation, gs as IRenderer, Ai as IRendering, jt as ISVGAnalyzer, Mr as ISanitizer, ri as IShadowDOMGlobalStyles, si as IShadowDOMStyleFactory, ni as IShadowDOMStyles, kt as ISyntaxInterpreter, ps as ITemplateCompiler, Un as ITemplateCompilerHooks, Gr as ITemplateCompilerRegistration, kn as ITemplateElementFactory, pi as IViewFactory, Ci as IViewLocator, Dl as IWcElementRegistry, rs as IWindow, Gi as IWorkTracker, If, So as IfRegistration, ds as InstructionType, InterpolationBinding, Qo as InterpolationBindingRendererRegistration, InterpolationInstruction, Interpretation, IteratorBindingInstruction, Zo as IteratorBindingRendererRegistration, LetBinding, LetBindingInstruction, Jo as LetElementRendererRegistration, mi as LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, Listener, ListenerBindingInstruction, nl as ListenerBindingRendererRegistration, NodeObserverConfig, NodeObserverLocator, Ji as NodeType, NoopSVGAnalyzer, ObserveShallow, OneTimeBindingBehavior, _r as OneTimeBindingBehaviorRegistration, ln as OneTimeBindingCommand, ho as OneTimeBindingCommandRegistration, Cr as PendingTemplateController, Portal, kr as PromiseTemplateController, PropertyBinding, PropertyBindingInstruction, tl as PropertyBindingRendererRegistration, Ot as RefAttributePattern, Jr as RefAttributePatternRegistration, RefBinding, uo as RefBindingCommandRegistration, RefBindingInstruction, el as RefBindingRendererRegistration, Sr as RejectedTemplateController, RenderPlan, Rendering, Repeat, Eo as RepeatRegistration, SVGAnalyzer, Yr as SVGAnalyzerRegistration, Ur as SanitizeValueConverter, yo as SanitizeValueConverterRegistration, SelectValueObserver, SelfBindingBehavior, Vo as SelfBindingBehaviorRegistration, SetAttributeInstruction, ol as SetAttributeRendererRegistration, SetClassAttributeInstruction, ll as SetClassAttributeRendererRegistration, SetPropertyInstruction, il as SetPropertyRendererRegistration, SetStyleAttributeInstruction, hl as SetStyleAttributeRendererRegistration, ShadowDOMRegistry, so as ShortHandBindingSyntax, SignalBindingBehavior, Wr as SignalBindingBehaviorRegistration, dl as StandardConfiguration, StyleAttributeAccessor, wn as StyleBindingCommand, wo as StyleBindingCommandRegistration, oi as StyleConfiguration, StyleElementStyles, StylePropertyBindingInstruction, al as StylePropertyBindingRendererRegistration, br as Switch, TemplateCompiler, _n as TemplateCompilerHooks, sl as TemplateControllerRendererRegistration, TextBindingInstruction, cl as TextBindingRendererRegistration, ThrottleBindingBehavior, Hr as ThrottleBindingBehaviorRegistration, ToViewBindingBehavior, jr as ToViewBindingBehaviorRegistration, hn as ToViewBindingCommand, ao as ToViewBindingCommandRegistration, mn as TriggerBindingCommand, fo as TriggerBindingCommandRegistration, TwoWayBindingBehavior, zr as TwoWayBindingBehaviorRegistration, cn as TwoWayBindingCommand, co as TwoWayBindingCommandRegistration, UpdateTriggerBindingBehavior, _o as UpdateTriggerBindingBehaviorRegistration, ValueAttributeObserver, ViewFactory, ViewLocator, Mi as ViewModelKind, Fr as ViewValueConverter, ko as ViewValueConverterRegistration, yi as Views, Oe as Watch, WcCustomElementRegistry, With, Bo as WithRegistration, An as allResources, Et as attributePattern, gt as bindable, en as bindingCommand, me as children, qe as containerless, ss as convertToRenderLocation, Tr as createElement, ei as cssModules, Ae as customAttribute, $e as customElement, es as getEffectiveParentNode, Xi as getRef, $i as isCustomElementController, Li as isCustomElementViewModel, vs as isInstruction, ns as isRenderLocation, vi as lifecycleHooks, Qe as processContent, ws as renderer, is as setEffectiveParentNode, Ki as setRef, ii as shadowCSS, jn as templateCompilerHooks, Se as templateController, Le as useShadowDOM, ki as view, Te as watch };
//# sourceMappingURL=index.js.map
