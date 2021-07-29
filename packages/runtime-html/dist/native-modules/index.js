export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "../../../platform/dist/native-modules/index.js";

import { BrowserPlatform as t } from "../../../platform-browser/dist/native-modules/index.js";

export { BrowserPlatform } from "../../../platform-browser/dist/native-modules/index.js";

import { Protocol as e, getPrototypeChain as i, Metadata as s, firstDefined as n, kebabCase as r, noop as o, emptyArray as l, DI as h, all as a, Registration as c, IPlatform as u, mergeArrays as f, fromDefinitionOrDefault as d, pascalCase as v, fromAnnotationOrTypeOrDefault as m, fromAnnotationOrDefinitionOrTypeOrDefault as p, IContainer as g, nextId as w, optional as x, InstanceProvider as b, isObject as y, ILogger as k, onResolve as A, resolveAll as C, camelCase as R, toArray as S, emptyObject as E, IServiceLocator as B, compareNumber as I, transient as T } from "../../../kernel/dist/native-modules/index.js";

import { BindingMode as D, subscriberCollection as P, withFlushQueue as O, connectable as $, registerAliases as L, ConnectableSwitcher as q, ProxyObservable as M, Scope as U, IObserverLocator as F, IExpressionParser as V, AccessScopeExpression as j, DelegationStrategy as _, BindingBehaviorExpression as N, BindingBehaviorFactory as H, PrimitiveLiteralExpression as W, bindingBehavior as z, BindingInterceptor as G, ISignaler as X, PropertyAccessor as K, INodeObserverLocator as Y, SetterObserver as Q, IDirtyChecker as Z, alias as J, applyMutationsToIndices as tt, getCollectionObserver as et, BindingContext as it, synchronizeIndices as st, valueConverter as nt } from "../../../runtime/dist/native-modules/index.js";

export { Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, BindingMode, BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Char, CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, CustomExpression, DelegationStrategy, DirtyCheckProperty, DirtyCheckSettings, ExpressionKind, ForOfStatement, HtmlLiteralExpression, IDirtyChecker, IExpressionParser, INodeObserverLocator, IObserverLocator, ISignaler, Interpolation, LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, ObserverLocator, OverrideContext, Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Scope, SetObserver, SetterObserver, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverter, ValueConverterDefinition, ValueConverterExpression, alias, applyMutationsToIndices, bindingBehavior, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, isIndexMap, observable, parseExpression, registerAliases, subscriberCollection, synchronizeIndices, valueConverter } from "../../../runtime/dist/native-modules/index.js";

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

function lt(t, i) {
    let n;
    function r(t, i) {
        if (arguments.length > 1) n.property = i;
        s.define(at, BindableDefinition.create(i, n), t.constructor, i);
        e.annotation.appendTo(t.constructor, ct.keyFrom(i));
    }
    if (arguments.length > 1) {
        n = {};
        r(t, i);
        return;
    } else if ("string" === typeof t) {
        n = {};
        return r;
    }
    n = void 0 === t ? {} : t;
    return r;
}

function ht(t) {
    return t.startsWith(at);
}

const at = e.annotation.keyFor("bindable");

const ct = Object.freeze({
    name: at,
    keyFrom(t) {
        return `${at}:${t}`;
    },
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
        let i;
        const n = {
            add(r) {
                let o;
                let l;
                if ("string" === typeof r) {
                    o = r;
                    l = {
                        property: o
                    };
                } else {
                    o = r.property;
                    l = r;
                }
                i = BindableDefinition.create(o, l);
                if (!s.hasOwn(at, t, o)) e.annotation.appendTo(t, ct.keyFrom(o));
                s.define(at, i, t, o);
                return n;
            },
            mode(t) {
                i.mode = t;
                return n;
            },
            callback(t) {
                i.callback = t;
                return n;
            },
            attribute(t) {
                i.attribute = t;
                return n;
            },
            primary() {
                i.primary = true;
                return n;
            },
            set(t) {
                i.set = t;
                return n;
            }
        };
        return n;
    },
    getAll(t) {
        const n = at.length + 1;
        const r = [];
        const o = i(t);
        let l = o.length;
        let h = 0;
        let a;
        let c;
        let u;
        let f;
        while (--l >= 0) {
            u = o[l];
            a = e.annotation.getKeys(u).filter(ht);
            c = a.length;
            for (f = 0; f < c; ++f) r[h++] = s.getOwn(at, u, a[f].slice(n));
        }
        return r;
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
        this.obj = t;
        this.key = e;
        this.set = s;
        this.$controller = n;
        this.value = void 0;
        this.t = void 0;
        this.f = 0;
        const r = t[i];
        const l = t.propertyChanged;
        const h = this.i = "function" === typeof r;
        const a = this.o = "function" === typeof l;
        const c = this.l = s !== o;
        this.cb = h ? r : o;
        this.u = a ? l : o;
        if (void 0 === this.cb && !a && !c) this.v = false; else {
            this.v = true;
            const i = t[e];
            this.value = c && void 0 !== i ? s(i) : i;
            this.A();
        }
    }
    get type() {
        return 1;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        if (this.l) t = this.set(t);
        if (this.v) {
            const i = this.value;
            if (Object.is(t, i)) return;
            this.value = t;
            this.t = i;
            this.f = e;
            if (null == this.$controller || this.$controller.isBound) {
                if (this.i) this.cb.call(this.obj, t, i, e);
                if (this.o) this.u.call(this.obj, this.key, t, i, e);
            }
            this.queue.add(this);
        } else this.obj[this.key] = t;
    }
    subscribe(t) {
        if (false === !this.v) {
            this.v = true;
            const t = this.obj[this.key];
            this.value = this.l ? this.set(t) : t;
            this.A();
        }
        this.subs.add(t);
    }
    flush() {
        ut = this.t;
        this.t = this.value;
        this.subs.notify(this.value, ut, this.f);
    }
    A() {
        Reflect.defineProperty(this.obj, this.key, {
            enumerable: true,
            configurable: true,
            get: () => this.value,
            set: t => {
                this.setValue(t, 0);
            }
        });
    }
}

P(BindableObserver);

O(BindableObserver);

let ut;

class CharSpec {
    constructor(t, e, i, s) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = i;
        this.isInverted = s;
        if (s) switch (t.length) {
          case 0:
            this.has = this.C;
            break;

          case 1:
            this.has = this.R;
            break;

          default:
            this.has = this.S;
        } else switch (t.length) {
          case 0:
            this.has = this.B;
            break;

          case 1:
            this.has = this.I;
            break;

          default:
            this.has = this.T;
        }
    }
    equals(t) {
        return this.chars === t.chars && this.repeat === t.repeat && this.isSymbol === t.isSymbol && this.isInverted === t.isInverted;
    }
    T(t) {
        return this.chars.includes(t);
    }
    I(t) {
        return this.chars === t;
    }
    B(t) {
        return false;
    }
    S(t) {
        return !this.chars.includes(t);
    }
    R(t) {
        return this.chars !== t;
    }
    C(t) {
        return true;
    }
}

class Interpretation {
    constructor() {
        this.parts = l;
        this.D = "";
        this.P = {};
        this.O = {};
    }
    get pattern() {
        const t = this.D;
        if ("" === t) return null; else return t;
    }
    set pattern(t) {
        if (null == t) {
            this.D = "";
            this.parts = l;
        } else {
            this.D = t;
            this.parts = this.O[t];
        }
    }
    append(t, e) {
        const i = this.P;
        if (void 0 === i[t]) i[t] = e; else i[t] += e;
    }
    next(t) {
        const e = this.P;
        let i;
        if (void 0 !== e[t]) {
            i = this.O;
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

const ft = h.createInterface("ISyntaxInterpreter", (t => t.singleton(SyntaxInterpreter)));

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
        s = s.filter(dt);
        if (s.length > 0) {
            s.sort(vt);
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

function dt(t) {
    return t.isEndpoint;
}

function vt(t, e) {
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

const mt = h.createInterface("IAttributePattern");

const pt = h.createInterface("IAttributeParser", (t => t.singleton(AttributeParser)));

class AttributeParser {
    constructor(t, e) {
        this.$ = {};
        this.L = t;
        const i = this.q = {};
        const s = e.reduce(((t, e) => {
            const s = bt.getPatternDefinitions(e.constructor);
            s.forEach((t => i[t.pattern] = e));
            return t.concat(s);
        }), l);
        t.add(s);
    }
    parse(t, e) {
        let i = this.$[t];
        if (null == i) i = this.$[t] = this.L.interpret(t);
        const s = i.pattern;
        if (null == s) return new AttrSyntax(t, e, t, null); else return this.q[s][s](t, e, i.parts);
    }
}

AttributeParser.inject = [ ft, a(mt) ];

function gt(...t) {
    return function e(i) {
        return bt.define(t, i);
    };
}

class AttributePatternResourceDefinition {
    constructor(t) {
        this.Type = t;
        this.name = void 0;
    }
    register(t) {
        c.singleton(mt, this.Type).register(t);
    }
}

const wt = e.resource.keyFor("attribute-pattern");

const xt = "attribute-pattern-definitions";

const bt = Object.freeze({
    name: wt,
    definitionAnnotationKey: xt,
    define(t, i) {
        const n = new AttributePatternResourceDefinition(i);
        s.define(wt, n, i);
        e.resource.appendTo(i, wt);
        e.annotation.set(i, xt, t);
        e.annotation.appendTo(i, xt);
        return i;
    },
    getPatternDefinitions(t) {
        return e.annotation.get(t, xt);
    }
});

let yt = class DotSeparatedAttributePattern {
    "PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[1]);
    }
    "PART.PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[2]);
    }
};

yt = rt([ gt({
    pattern: "PART.PART",
    symbols: "."
}, {
    pattern: "PART.PART.PART",
    symbols: "."
}) ], yt);

let kt = class RefAttributePattern {
    ref(t, e, i) {
        return new AttrSyntax(t, e, "element", "ref");
    }
    "PART.ref"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "ref");
    }
};

kt = rt([ gt({
    pattern: "ref",
    symbols: ""
}, {
    pattern: "PART.ref",
    symbols: "."
}) ], kt);

let At = class ColonPrefixedBindAttributePattern {
    ":PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "bind");
    }
};

At = rt([ gt({
    pattern: ":PART",
    symbols: ":"
}) ], At);

let Ct = class AtPrefixedTriggerAttributePattern {
    "@PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "trigger");
    }
};

Ct = rt([ gt({
    pattern: "@PART",
    symbols: "@"
}) ], Ct);

const Rt = () => Object.create(null);

const St = Object.prototype.hasOwnProperty;

const Et = Rt();

const Bt = (t, e, i) => {
    if (true === Et[e]) return true;
    if ("string" !== typeof e) return false;
    const s = e.slice(0, 5);
    return Et[e] = "aria-" === s || "data-" === s || i.isStandardSvgAttribute(t, e);
};

const It = u;

const Tt = h.createInterface("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

function Dt(t) {
    const e = Rt();
    let i;
    for (i of t) e[i] = true;
    return e;
}

class SVGAnalyzer {
    constructor(t) {
        this.M = Object.assign(Rt(), {
            a: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "target", "transform", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            altGlyph: Dt([ "class", "dx", "dy", "externalResourcesRequired", "format", "glyphRef", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            altglyph: Rt(),
            altGlyphDef: Dt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphdef: Rt(),
            altGlyphItem: Dt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphitem: Rt(),
            animate: Dt([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateColor: Dt([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateMotion: Dt([ "accumulate", "additive", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keyPoints", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "origin", "path", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "rotate", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateTransform: Dt([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "type", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            circle: Dt([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "r", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            clipPath: Dt([ "class", "clipPathUnits", "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            "color-profile": Dt([ "id", "local", "name", "rendering-intent", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            cursor: Dt([ "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            defs: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            desc: Dt([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            ellipse: Dt([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            feBlend: Dt([ "class", "height", "id", "in", "in2", "mode", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feColorMatrix: Dt([ "class", "height", "id", "in", "result", "style", "type", "values", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComponentTransfer: Dt([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComposite: Dt([ "class", "height", "id", "in", "in2", "k1", "k2", "k3", "k4", "operator", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feConvolveMatrix: Dt([ "bias", "class", "divisor", "edgeMode", "height", "id", "in", "kernelMatrix", "kernelUnitLength", "order", "preserveAlpha", "result", "style", "targetX", "targetY", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDiffuseLighting: Dt([ "class", "diffuseConstant", "height", "id", "in", "kernelUnitLength", "result", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDisplacementMap: Dt([ "class", "height", "id", "in", "in2", "result", "scale", "style", "width", "x", "xChannelSelector", "xml:base", "xml:lang", "xml:space", "y", "yChannelSelector" ]),
            feDistantLight: Dt([ "azimuth", "elevation", "id", "xml:base", "xml:lang", "xml:space" ]),
            feFlood: Dt([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feFuncA: Dt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncB: Dt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncG: Dt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncR: Dt([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feGaussianBlur: Dt([ "class", "height", "id", "in", "result", "stdDeviation", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feImage: Dt([ "class", "externalResourcesRequired", "height", "id", "preserveAspectRatio", "result", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMerge: Dt([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMergeNode: Dt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            feMorphology: Dt([ "class", "height", "id", "in", "operator", "radius", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feOffset: Dt([ "class", "dx", "dy", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            fePointLight: Dt([ "id", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feSpecularLighting: Dt([ "class", "height", "id", "in", "kernelUnitLength", "result", "specularConstant", "specularExponent", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feSpotLight: Dt([ "id", "limitingConeAngle", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feTile: Dt([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feTurbulence: Dt([ "baseFrequency", "class", "height", "id", "numOctaves", "result", "seed", "stitchTiles", "style", "type", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            filter: Dt([ "class", "externalResourcesRequired", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            font: Dt([ "class", "externalResourcesRequired", "horiz-adv-x", "horiz-origin-x", "horiz-origin-y", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            "font-face": Dt([ "accent-height", "alphabetic", "ascent", "bbox", "cap-height", "descent", "font-family", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "hanging", "id", "ideographic", "mathematical", "overline-position", "overline-thickness", "panose-1", "slope", "stemh", "stemv", "strikethrough-position", "strikethrough-thickness", "underline-position", "underline-thickness", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "widths", "x-height", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-format": Dt([ "id", "string", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-name": Dt([ "id", "name", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-src": Dt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-uri": Dt([ "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            foreignObject: Dt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            g: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            glyph: Dt([ "arabic-form", "class", "d", "glyph-name", "horiz-adv-x", "id", "lang", "orientation", "style", "unicode", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            glyphRef: Dt([ "class", "dx", "dy", "format", "glyphRef", "id", "style", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            glyphref: Rt(),
            hkern: Dt([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ]),
            image: Dt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            line: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "x1", "x2", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            linearGradient: Dt([ "class", "externalResourcesRequired", "gradientTransform", "gradientUnits", "id", "spreadMethod", "style", "x1", "x2", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            marker: Dt([ "class", "externalResourcesRequired", "id", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            mask: Dt([ "class", "externalResourcesRequired", "height", "id", "maskContentUnits", "maskUnits", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            metadata: Dt([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "missing-glyph": Dt([ "class", "d", "horiz-adv-x", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            mpath: Dt([ "externalResourcesRequired", "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            path: Dt([ "class", "d", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "pathLength", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            pattern: Dt([ "class", "externalResourcesRequired", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            polygon: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            polyline: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            radialGradient: Dt([ "class", "cx", "cy", "externalResourcesRequired", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "spreadMethod", "style", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            rect: Dt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            script: Dt([ "externalResourcesRequired", "id", "type", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            set: Dt([ "attributeName", "attributeType", "begin", "dur", "end", "externalResourcesRequired", "fill", "id", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            stop: Dt([ "class", "id", "offset", "style", "xml:base", "xml:lang", "xml:space" ]),
            style: Dt([ "id", "media", "title", "type", "xml:base", "xml:lang", "xml:space" ]),
            svg: Dt([ "baseProfile", "class", "contentScriptType", "contentStyleType", "externalResourcesRequired", "height", "id", "onabort", "onactivate", "onclick", "onerror", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onresize", "onscroll", "onunload", "onzoom", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "version", "viewBox", "width", "x", "xml:base", "xml:lang", "xml:space", "y", "zoomAndPan" ]),
            switch: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            symbol: Dt([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            text: Dt([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "transform", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            textPath: Dt([ "class", "externalResourcesRequired", "id", "lengthAdjust", "method", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "textLength", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            title: Dt([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            tref: Dt([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            tspan: Dt([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            use: Dt([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            view: Dt([ "externalResourcesRequired", "id", "preserveAspectRatio", "viewBox", "viewTarget", "xml:base", "xml:lang", "xml:space", "zoomAndPan" ]),
            vkern: Dt([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ])
        });
        this.U = Dt([ "a", "altGlyph", "animate", "animateColor", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood", "feGaussianBlur", "feImage", "feMerge", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence", "filter", "font", "foreignObject", "g", "glyph", "glyphRef", "image", "line", "linearGradient", "marker", "mask", "missing-glyph", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use" ]);
        this.F = Dt([ "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "clip", "color-interpolation-filters", "color-interpolation", "color-profile", "color-rendering", "color", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "fill", "filter", "flood-color", "flood-opacity", "font-family", "font-size-adjust", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "stroke", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ]);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if ("altglyph" === e.firstElementChild.nodeName) {
            const t = this.M;
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
        return c.singleton(Tt, this).register(t);
    }
    isStandardSvgAttribute(t, e) {
        var i;
        if (!(t instanceof this.SVGElement)) return false;
        return true === this.U[t.nodeName] && true === this.F[e] || true === (null === (i = this.M[t.nodeName]) || void 0 === i ? void 0 : i[e]);
    }
}

SVGAnalyzer.inject = [ It ];

const Pt = h.createInterface("IAttrMapper", (t => t.singleton(AttrMapper)));

class AttrMapper {
    constructor(t) {
        this.svg = t;
        this.fns = [];
        this.V = Rt();
        this.j = Rt();
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
        return [ Tt ];
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
            n = null !== (e = (i = this.V)[r]) && void 0 !== e ? e : i[r] = Rt();
            for (o in s) {
                if (void 0 !== n[o]) throw $t(o, r);
                n[o] = s[o];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.j;
        for (const i in t) {
            if (void 0 !== e[i]) throw $t(i, "*");
            e[i] = t[i];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return Ot(t, e) || this.fns.length > 0 && this.fns.some((i => i(t, e)));
    }
    map(t, e) {
        var i, s, n;
        return null !== (n = null !== (s = null === (i = this.V[t.nodeName]) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : this.j[e]) && void 0 !== n ? n : Bt(t, e, this.svg) ? e : null;
    }
}

function Ot(t, e) {
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

function $t(t, e) {
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
        this.prop = e;
        this.attr = i;
        this.type = 2 | 1 | 4;
        this.value = null;
        this.t = null;
        this._ = false;
        this.f = 0;
        this.obj = t;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this._ = t !== this.t;
        if (0 === (256 & e)) this.N();
    }
    N() {
        if (this._) {
            this._ = false;
            const t = this.value;
            const e = this.attr;
            this.t = t;
            switch (e) {
              case "class":
                this.obj.classList.toggle(this.prop, !!t);
                break;

              case "style":
                {
                    let e = "";
                    let i = t;
                    if ("string" === typeof i && i.includes("!important")) {
                        e = "important";
                        i = i.replace("!important", "");
                    }
                    this.obj.style.setProperty(this.prop, i, e);
                    break;
                }

              default:
                if (null == t) this.obj.removeAttribute(e); else this.obj.setAttribute(e, String(t));
            }
        }
    }
    handleMutation(t) {
        let e = false;
        for (let i = 0, s = t.length; s > i; ++i) {
            const s = t[i];
            if ("attributes" === s.type && s.attributeName === this.prop) {
                e = true;
                break;
            }
        }
        if (e) {
            let t;
            switch (this.attr) {
              case "class":
                t = this.obj.classList.contains(this.prop);
                break;

              case "style":
                t = this.obj.style.getPropertyValue(this.prop);
                break;

              default:
                throw new Error(`AUR0651:${this.attr}`);
            }
            if (t !== this.value) {
                this.t = this.value;
                this.value = t;
                this._ = false;
                this.f = 0;
                this.queue.add(this);
            }
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.value = this.t = this.obj.getAttribute(this.prop);
            Lt(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) qt(this.obj, this);
    }
    flush() {
        Ft = this.t;
        this.t = this.value;
        this.subs.notify(this.value, Ft, this.f);
    }
}

P(AttributeObserver);

O(AttributeObserver);

const Lt = (t, e, i) => {
    if (void 0 === e.$eMObs) e.$eMObs = new Set;
    if (void 0 === e.$mObs) (e.$mObs = new t(Mt)).observe(e, {
        attributes: true
    });
    e.$eMObs.add(i);
};

const qt = (t, e) => {
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

const Mt = t => {
    t[0].target.$eMObs.forEach(Ut, t);
};

function Ut(t) {
    t.handleMutation(this);
}

let Ft;

class BindingTargetSubscriber {
    constructor(t) {
        this.b = t;
    }
    handleChange(t, e, i) {
        const s = this.b;
        if (t !== s.sourceExpression.evaluate(i, s.$scope, s.locator, null)) s.updateSource(t, i);
    }
}

const {oneTime: Vt, toView: jt, fromView: _t} = D;

const Nt = jt | Vt;

const Ht = {
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
        this.p = o.get(It);
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
            c = 0 === (s & Vt);
            if (c) this.obs.version++;
            t = r.evaluate(i, o, l, n);
            if (c) this.obs.clear(false);
        }
        if (t !== this.value) {
            this.value = t;
            if (a) {
                u = this.task;
                this.task = this.p.domWriteQueue.queueTask((() => {
                    this.task = null;
                    n.updateTarget(t, i);
                }), Ht);
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
        if (r & Nt) {
            l = (r & jt) > 0;
            o.updateTarget(this.value = s.evaluate(t, e, this.locator, l ? o : null), t);
        }
        if (r & _t) n.subscribe(null !== (i = this.targetSubscriber) && void 0 !== i ? i : this.targetSubscriber = new BindingTargetSubscriber(o));
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
        this.obs.clear(true);
        this.isBound = false;
    }
}

$(AttributeBinding);

const {toView: Wt} = D;

const zt = {
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
            }), zt);
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
            o = (this.mode & Wt) > 0;
            if (o) n.version++;
            t = s.evaluate(i, this.$scope, this.locator, o ? this.interceptor : null);
            if (o) n.clear(false);
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
        this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & Wt) > 0 ? this.interceptor : null);
        if (this.value instanceof Array) this.observeCollection(this.value);
    }
    $unbind(t) {
        if (!this.isBound) return;
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        this.obs.clear(true);
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
            l = (this.mode & Wt) > 0;
            if (l) r.version++;
            i |= this.strict ? 1 : 0;
            t = n.evaluate(i, this.$scope, this.locator, l ? this.interceptor : null);
            if (l) r.clear(false);
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
        const i = this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & Wt) > 0 ? this.interceptor : null);
        if (i instanceof Array) this.observeCollection(i);
        this.updateTarget(i, t);
    }
    $unbind(t) {
        var e;
        if (!this.isBound) return;
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        this.obs.clear(true);
        null === (e = this.task) || void 0 === e ? void 0 : e.cancel();
        this.task = null;
    }
    queueUpdate(t, e) {
        const i = this.task;
        this.task = this.p.domWriteQueue.queueTask((() => {
            this.task = null;
            this.updateTarget(t, e);
        }), zt);
        null === i || void 0 === i ? void 0 : i.cancel();
    }
}

$(ContentBinding);

class LetBinding {
    constructor(t, e, i, s, n = false) {
        this.sourceExpression = t;
        this.targetProperty = e;
        this.locator = s;
        this.toBindingContext = n;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.target = null;
        this.oL = i;
    }
    handleChange(t, e, i) {
        if (!this.isBound) return;
        const s = this.target;
        const n = this.targetProperty;
        const r = s[n];
        this.obs.version++;
        t = this.sourceExpression.evaluate(i, this.$scope, this.locator, this.interceptor);
        this.obs.clear(false);
        if (t !== r) s[n] = t;
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.$scope = e;
        this.target = this.toBindingContext ? e.bindingContext : e.overrideContext;
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
        this.obs.clear(true);
        this.isBound = false;
    }
}

$(LetBinding);

const {oneTime: Gt, toView: Xt, fromView: Kt} = D;

const Yt = Xt | Gt;

const Qt = {
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
        const s = this.targetObserver;
        const n = this.interceptor;
        const r = this.sourceExpression;
        const o = this.$scope;
        const l = this.locator;
        const h = 0 === (2 & i) && (4 & s.type) > 0;
        const a = this.obs;
        let c = false;
        if (10082 !== r.$kind || a.count > 1) {
            c = this.mode > Gt;
            if (c) a.version++;
            t = r.evaluate(i, o, l, n);
            if (c) a.clear(false);
        }
        if (h) {
            Zt = this.task;
            this.task = this.taskQueue.queueTask((() => {
                n.updateTarget(t, i);
                this.task = null;
            }), Qt);
            null === Zt || void 0 === Zt ? void 0 : Zt.cancel();
            Zt = null;
        } else n.updateTarget(t, i);
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
            if (r & Kt) o = n.getObserver(this.target, this.targetProperty); else o = n.getAccessor(this.target, this.targetProperty);
            this.targetObserver = o;
        }
        s = this.sourceExpression;
        const l = this.interceptor;
        const h = (r & Xt) > 0;
        if (r & Yt) l.updateTarget(s.evaluate(t, e, this.locator, h ? l : null), t);
        if (r & Kt) {
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
        Zt = this.task;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        if (null != Zt) {
            Zt.cancel();
            Zt = this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}

$(PropertyBinding);

let Zt = null;

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

const Jt = h.createInterface("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(c.instance(Jt, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return null === t ? e() : e(this.c.get(t));
    }
}

const te = Object.freeze({
    beforeCreate: ee("beforeCreate"),
    hydrating: ee("hydrating"),
    hydrated: ee("hydrated"),
    beforeActivate: ee("beforeActivate"),
    afterActivate: ee("afterActivate"),
    beforeDeactivate: ee("beforeDeactivate"),
    afterDeactivate: ee("afterDeactivate")
});

function ee(t) {
    function e(e, i) {
        if ("function" === typeof i) return new $AppTask(t, e, i);
        return new $AppTask(t, null, e);
    }
    return e;
}

function ie(t, i) {
    let n;
    function r(t, i) {
        if (arguments.length > 1) n.property = i;
        s.define(ne, ChildrenDefinition.create(i, n), t.constructor, i);
        e.annotation.appendTo(t.constructor, re.keyFrom(i));
    }
    if (arguments.length > 1) {
        n = {};
        r(t, i);
        return;
    } else if ("string" === typeof t) {
        n = {};
        return r;
    }
    n = void 0 === t ? {} : t;
    return r;
}

function se(t) {
    return t.startsWith(ne);
}

const ne = e.annotation.keyFor("children-observer");

const re = Object.freeze({
    name: e.annotation.keyFor("children-observer"),
    keyFrom(t) {
        return `${ne}:${t}`;
    },
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
        const n = ne.length + 1;
        const r = [];
        const o = i(t);
        let l = o.length;
        let h = 0;
        let a;
        let c;
        let u;
        while (--l >= 0) {
            u = o[l];
            a = e.annotation.getKeys(u).filter(se);
            c = a.length;
            for (let t = 0; t < c; ++t) r[h++] = s.getOwn(ne, u, a[t].slice(n));
        }
        return r;
    }
});

const oe = {
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
        return new ChildrenDefinition(n(e.callback, `${t}Changed`), n(e.property, t), null !== (i = e.options) && void 0 !== i ? i : oe, e.query, e.filter, e.map);
    }
}

class ChildrenObserver {
    constructor(t, e, i, s, n = le, r = he, o = ae, l) {
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
                this.H();
            }))).observe(this.controller.host, this.options);
        }
    }
    stop() {
        if (this.observing) {
            this.observing = false;
            this.observer.disconnect();
            this.children = l;
        }
    }
    H() {
        this.children = this.get();
        if (void 0 !== this.callback) this.callback.call(this.obj);
        this.subs.notify(this.children, void 0, 0);
    }
    get() {
        return ue(this.controller, this.query, this.filter, this.map);
    }
}

P()(ChildrenObserver);

function le(t) {
    return t.host.childNodes;
}

function he(t, e, i) {
    return !!i;
}

function ae(t, e, i) {
    return i;
}

const ce = {
    optional: true
};

function ue(t, e, i, s) {
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
        a = Se.for(h, ce);
        c = null !== (n = null === a || void 0 === a ? void 0 : a.viewModel) && void 0 !== n ? n : null;
        if (i(h, a, c)) l.push(s(h, a, c));
    }
    return l;
}

function fe(t) {
    return function(e) {
        return me.define(t, e);
    };
}

function de(t) {
    return function(e) {
        return me.define("string" === typeof t ? {
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
        const i = me.getAnnotation;
        let s;
        let r;
        if ("string" === typeof t) {
            s = t;
            r = {
                name: s
            };
        } else {
            s = t.name;
            r = t;
        }
        return new CustomAttributeDefinition(e, n(i(e, "name"), s), f(i(e, "aliases"), r.aliases, e.aliases), me.keyFrom(s), n(i(e, "defaultBindingMode"), r.defaultBindingMode, e.defaultBindingMode, D.toView), n(i(e, "isTemplateController"), r.isTemplateController, e.isTemplateController, false), ct.from(...ct.getAll(e), i(e, "bindables"), e.bindables, r.bindables), n(i(e, "noMultiBindings"), r.noMultiBindings, e.noMultiBindings, false), f(xe.getAnnotation(e), e.watches));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        c.transient(i, e).register(t);
        c.aliasTo(i, e).register(t);
        L(s, me, i, t);
    }
}

const ve = e.resource.keyFor("custom-attribute");

const me = Object.freeze({
    name: ve,
    keyFrom(t) {
        return `${ve}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.hasOwn(ve, t);
    },
    for(t, e) {
        var i;
        return null !== (i = Ri(t, me.keyFrom(e))) && void 0 !== i ? i : void 0;
    },
    define(t, i) {
        const n = CustomAttributeDefinition.create(t, i);
        s.define(ve, n, n.Type);
        s.define(ve, n, n);
        e.resource.appendTo(i, ve);
        return n.Type;
    },
    getDefinition(t) {
        const e = s.getOwn(ve, t);
        if (void 0 === e) throw new Error(`AUR0759:${t.name}`);
        return e;
    },
    annotate(t, i, n) {
        s.define(e.annotation.keyFor(i), n, t);
    },
    getAnnotation(t, i) {
        return s.getOwn(e.annotation.keyFor(i), t);
    }
});

function pe(t, e) {
    if (!t) throw new Error("AUR0772");
    return function i(s, n, r) {
        const o = null == n;
        const l = o ? s : s.constructor;
        const h = new WatchDefinition(t, o ? e : r.value);
        if (o) {
            if ("function" !== typeof e && (null == e || !(e in l.prototype))) throw new Error(`AUR0773:${String(e)}@${l.name}}`);
        } else if ("function" !== typeof (null === r || void 0 === r ? void 0 : r.value)) throw new Error(`AUR0774:${String(n)}`);
        xe.add(l, h);
        if (me.isType(l)) me.getDefinition(l).watches.push(h);
        if (Se.isType(l)) Se.getDefinition(l).watches.push(h);
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const ge = l;

const we = e.annotation.keyFor("watch");

const xe = {
    name: we,
    add(t, e) {
        let i = s.getOwn(we, t);
        if (null == i) s.define(we, i = [], t);
        i.push(e);
    },
    getAnnotation(t) {
        var e;
        return null !== (e = s.getOwn(we, t)) && void 0 !== e ? e : ge;
    }
};

function be(t) {
    return function(e) {
        return Se.define(t, e);
    };
}

function ye(t) {
    if (void 0 === t) return function(t) {
        Se.annotate(t, "shadowOptions", {
            mode: "open"
        });
    };
    if ("function" !== typeof t) return function(e) {
        Se.annotate(e, "shadowOptions", t);
    };
    Se.annotate(t, "shadowOptions", {
        mode: "open"
    });
}

function ke(t) {
    if (void 0 === t) return function(t) {
        Se.annotate(t, "containerless", true);
    };
    Se.annotate(t, "containerless", true);
}

const Ae = new WeakMap;

class CustomElementDefinition {
    constructor(t, e, i, s, n, r, o, l, h, a, c, u, f, d, v, m, p, g, w, x) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.cache = n;
        this.template = r;
        this.instructions = o;
        this.dependencies = l;
        this.injectable = h;
        this.needsCompile = a;
        this.surrogates = c;
        this.bindables = u;
        this.childrenObservers = f;
        this.containerless = d;
        this.isStrictBinding = v;
        this.shadowOptions = m;
        this.hasSlots = p;
        this.enhance = g;
        this.watches = w;
        this.processContent = x;
    }
    get type() {
        return 1;
    }
    static create(t, e = null) {
        const i = Se.getAnnotation;
        if (null === e) {
            const i = t;
            if ("string" === typeof i) throw new Error(`AUR0761:${t}`);
            const s = d("name", i, Se.generateName);
            if ("function" === typeof i.Type) e = i.Type; else e = Se.generateType(v(s));
            return new CustomElementDefinition(e, s, f(i.aliases), d("key", i, (() => Se.keyFrom(s))), d("cache", i, (() => 0)), d("template", i, (() => null)), f(i.instructions), f(i.dependencies), d("injectable", i, (() => null)), d("needsCompile", i, (() => true)), f(i.surrogates), ct.from(i.bindables), re.from(i.childrenObservers), d("containerless", i, (() => false)), d("isStrictBinding", i, (() => false)), d("shadowOptions", i, (() => null)), d("hasSlots", i, (() => false)), d("enhance", i, (() => false)), d("watches", i, (() => l)), m("processContent", e, (() => null)));
        }
        if ("string" === typeof t) return new CustomElementDefinition(e, t, f(i(e, "aliases"), e.aliases), Se.keyFrom(t), m("cache", e, (() => 0)), m("template", e, (() => null)), f(i(e, "instructions"), e.instructions), f(i(e, "dependencies"), e.dependencies), m("injectable", e, (() => null)), m("needsCompile", e, (() => true)), f(i(e, "surrogates"), e.surrogates), ct.from(...ct.getAll(e), i(e, "bindables"), e.bindables), re.from(...re.getAll(e), i(e, "childrenObservers"), e.childrenObservers), m("containerless", e, (() => false)), m("isStrictBinding", e, (() => false)), m("shadowOptions", e, (() => null)), m("hasSlots", e, (() => false)), m("enhance", e, (() => false)), f(xe.getAnnotation(e), e.watches), m("processContent", e, (() => null)));
        const s = d("name", t, Se.generateName);
        return new CustomElementDefinition(e, s, f(i(e, "aliases"), t.aliases, e.aliases), Se.keyFrom(s), p("cache", t, e, (() => 0)), p("template", t, e, (() => null)), f(i(e, "instructions"), t.instructions, e.instructions), f(i(e, "dependencies"), t.dependencies, e.dependencies), p("injectable", t, e, (() => null)), p("needsCompile", t, e, (() => true)), f(i(e, "surrogates"), t.surrogates, e.surrogates), ct.from(...ct.getAll(e), i(e, "bindables"), e.bindables, t.bindables), re.from(...re.getAll(e), i(e, "childrenObservers"), e.childrenObservers, t.childrenObservers), p("containerless", t, e, (() => false)), p("isStrictBinding", t, e, (() => false)), p("shadowOptions", t, e, (() => null)), p("hasSlots", t, e, (() => false)), p("enhance", t, e, (() => false)), f(t.watches, xe.getAnnotation(e), e.watches), p("processContent", t, e, (() => null)));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) return t;
        if (Ae.has(t)) return Ae.get(t);
        const e = CustomElementDefinition.create(t);
        Ae.set(t, e);
        s.define(Se.name, e, e.Type);
        return e;
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        if (!t.has(i, false)) {
            c.transient(i, e).register(t);
            c.aliasTo(i, e).register(t);
            L(s, Se, i, t);
        }
    }
}

const Ce = {
    name: void 0,
    searchParents: false,
    optional: false
};

const Re = e.resource.keyFor("custom-element");

const Se = Object.freeze({
    name: Re,
    keyFrom(t) {
        return `${Re}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.hasOwn(Re, t);
    },
    for(t, e = Ce) {
        if (void 0 === e.name && true !== e.searchParents) {
            const i = Ri(t, Re);
            if (null === i) {
                if (true === e.optional) return null;
                throw new Error("AUR0762");
            }
            return i;
        }
        if (void 0 !== e.name) {
            if (true !== e.searchParents) {
                const i = Ri(t, Re);
                if (null === i) throw new Error("AUR0763");
                if (i.is(e.name)) return i;
                return;
            }
            let i = t;
            let s = false;
            while (null !== i) {
                const t = Ri(i, Re);
                if (null !== t) {
                    s = true;
                    if (t.is(e.name)) return t;
                }
                i = Pi(i);
            }
            if (s) return;
            throw new Error("AUR0764");
        }
        let i = t;
        while (null !== i) {
            const t = Ri(i, Re);
            if (null !== t) return t;
            i = Pi(i);
        }
        throw new Error("AUR0765");
    },
    define(t, i) {
        const n = CustomElementDefinition.create(t, i);
        s.define(Re, n, n.Type);
        s.define(Re, n, n);
        e.resource.appendTo(n.Type, Re);
        return n.Type;
    },
    getDefinition(t) {
        const e = s.getOwn(Re, t);
        if (void 0 === e) throw new Error(`AUR0760:${t.name}`);
        return e;
    },
    annotate(t, i, n) {
        s.define(e.annotation.keyFor(i), n, t);
    },
    getAnnotation(t, i) {
        return s.getOwn(e.annotation.keyFor(i), t);
    },
    generateName: function() {
        let t = 0;
        return function() {
            return `unnamed-${++t}`;
        };
    }(),
    createInjectable() {
        const t = function(e, i, s) {
            const n = h.getOrCreateAnnotationParamTypes(e);
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

const Ee = e.annotation.keyFor("processContent");

function Be(t) {
    return void 0 === t ? function(t, e, i) {
        s.define(Ee, Ie(t, e), t);
    } : function(e) {
        t = Ie(e, t);
        const i = s.getOwn(Re, e);
        if (void 0 !== i) i.processContent = t; else s.define(Ee, t, e);
        return e;
    };
}

function Ie(t, e) {
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
        this.t = "";
        this.doNotCache = true;
        this.W = {};
        this.G = 0;
        this._ = false;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this._ = t !== this.t;
        if (0 === (256 & e)) this.N();
    }
    N() {
        if (this._) {
            this._ = false;
            const t = this.value;
            const e = this.W;
            const i = Te(t);
            let s = this.G;
            this.t = t;
            if (i.length > 0) this.X(i);
            this.G += 1;
            if (0 === s) return;
            s -= 1;
            for (const t in e) {
                if (!Object.prototype.hasOwnProperty.call(e, t) || e[t] !== s) continue;
                this.obj.classList.remove(t);
            }
        }
    }
    X(t) {
        const e = this.obj;
        const i = t.length;
        let s = 0;
        let n;
        for (;s < i; s++) {
            n = t[s];
            if (0 === n.length) continue;
            this.W[n] = this.G;
            e.classList.add(n);
        }
    }
}

function Te(t) {
    if ("string" === typeof t) return De(t);
    if ("object" !== typeof t) return l;
    if (t instanceof Array) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) i.push(...Te(t[s]));
            return i;
        } else return l;
    }
    const e = [];
    let i;
    for (i in t) if (Boolean(t[i])) if (i.includes(" ")) e.push(...De(i)); else e.push(i);
    return e;
}

function De(t) {
    const e = t.match(/\S+/g);
    if (null === e) return l;
    return e;
}

function Pe(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        var e;
        const i = Object.assign({}, ...this.modules);
        const s = me.define({
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
                this.element.className = Te(this.value).map((t => i[t] || t)).join(" ");
            }
        }, e.inject = [ Ei ], e));
        t.register(s);
    }
}

function Oe(...t) {
    return new ShadowDOMRegistry(t);
}

const $e = h.createInterface("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(It))) return t.get(AdoptedStyleSheetsStylesFactory);
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(qe);
        const i = t.get($e);
        t.register(c.instance(Le, i.createStyles(this.css, e)));
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

AdoptedStyleSheetsStylesFactory.inject = [ It ];

class StyleElementStylesFactory {
    constructor(t) {
        this.p = t;
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

StyleElementStylesFactory.inject = [ It ];

const Le = h.createInterface("IShadowDOMStyles");

const qe = h.createInterface("IShadowDOMGlobalStyles", (t => t.instance({
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

const Me = {
    shadowDOM(t) {
        return te.beforeCreate(g, (e => {
            if (null != t.sharedStyles) {
                const i = e.get($e);
                e.register(c.instance(qe, i.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: Ue, exit: Fe} = q;

const {wrap: Ve, unwrap: je} = M;

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
        this.obs.clear(true);
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
            Ue(this);
            return this.value = je(this.get.call(void 0, this.useProxy ? Ve(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            Fe(this);
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
            this.obs.clear(false);
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
        this.obs.clear(false);
    }
    $unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clear(true);
        this.value = void 0;
    }
}

$(ComputedWatcher);

$(ExpressionWatcher);

const _e = h.createInterface("ILifecycleHooks");

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
        c.singleton(_e, this.Type).register(t);
    }
}

const Ne = new WeakMap;

const He = e.annotation.keyFor("lifecycle-hooks");

const We = Object.freeze({
    name: He,
    define(t, i) {
        const n = LifecycleHooksDefinition.create(t, i);
        s.define(He, n, i);
        e.resource.appendTo(i, He);
        return n.Type;
    },
    resolve(t) {
        let e = Ne.get(t);
        if (void 0 === e) {
            e = new LifecycleHooksLookupImpl;
            const i = t.root;
            const n = i.id === t.id ? t.getAll(_e) : t.has(_e, false) ? [ ...i.getAll(_e), ...t.getAll(_e) ] : i.getAll(_e);
            let r;
            let o;
            let l;
            let h;
            let a;
            for (r of n) {
                o = s.getOwn(He, r.constructor);
                l = new LifecycleHooksEntry(o, r);
                for (h of o.propertyNames) {
                    a = e[h];
                    if (void 0 === a) e[h] = [ l ]; else a.push(l);
                }
            }
        }
        return e;
    }
});

class LifecycleHooksLookupImpl {}

function ze() {
    return function t(e) {
        return We.define({}, e);
    };
}

const Ge = h.createInterface("IViewFactory");

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
    create(t, e) {
        const i = this.cache;
        let s;
        if (null != i && i.length > 0) {
            s = i.pop();
            return s;
        }
        s = Controller.$view(this, t, e);
        return s;
    }
}

ViewFactory.maxCacheSize = 65535;

const Xe = new WeakSet;

function Ke(t) {
    return !Xe.has(t);
}

function Ye(t) {
    Xe.add(t);
    return CustomElementDefinition.create(t);
}

const Qe = e.resource.keyFor("views");

const Ze = Object.freeze({
    name: Qe,
    has(t) {
        return "function" === typeof t && (s.hasOwn(Qe, t) || "$views" in t);
    },
    get(t) {
        if ("function" === typeof t && "$views" in t) {
            const e = t.$views;
            const i = e.filter(Ke).map(Ye);
            for (const e of i) Ze.add(t, e);
        }
        let e = s.getOwn(Qe, t);
        if (void 0 === e) s.define(Qe, e = [], t);
        return e;
    },
    add(t, e) {
        const i = CustomElementDefinition.create(e);
        let n = s.getOwn(Qe, t);
        if (void 0 === n) s.define(Qe, n = [ i ], t); else n.push(i);
        return n;
    }
});

function Je(t) {
    return function(e) {
        Ze.add(e, t);
    };
}

const ti = h.createInterface("IViewLocator", (t => t.singleton(ViewLocator)));

class ViewLocator {
    constructor() {
        this.K = new WeakMap;
        this.Y = new Map;
    }
    getViewComponentForObject(t, e) {
        if (t) {
            const i = Ze.has(t.constructor) ? Ze.get(t.constructor) : [];
            const s = "function" === typeof e ? e(t, i) : this.Z(i, e);
            return this.J(t, i, s);
        }
        return null;
    }
    J(t, e, i) {
        let s = this.K.get(t);
        let n;
        if (void 0 === s) {
            s = {};
            this.K.set(t, s);
        } else n = s[i];
        if (void 0 === n) {
            const r = this.tt(t, e, i);
            n = Se.define(Se.getDefinition(r), class extends r {
                constructor() {
                    super(t);
                }
            });
            s[i] = n;
        }
        return n;
    }
    tt(t, e, i) {
        let s = this.Y.get(t.constructor);
        let n;
        if (void 0 === s) {
            s = {};
            this.Y.set(t.constructor, s);
        } else n = s[i];
        if (void 0 === n) {
            n = Se.define(this.et(e, i), class {
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
    Z(t, e) {
        if (e) return e;
        if (1 === t.length) return t[0].name;
        return "default-view";
    }
    et(t, e) {
        const i = t.find((t => t.name === e));
        if (void 0 === i) throw new Error(`Could not find view: ${e}`);
        return i;
    }
}

const ei = h.createInterface("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    constructor(t) {
        this.it = new WeakMap;
        this.st = new WeakMap;
        this.nt = (this.rt = t.root).get(It);
        this.ot = new FragmentNodeSequence(this.nt, this.nt.document.createDocumentFragment());
    }
    get renderers() {
        return null == this.rs ? this.rs = this.rt.getAll(Xi, false).reduce(((t, e) => {
            t[e.instructionType] = e;
            return t;
        }), Rt()) : this.rs;
    }
    compile(t, e, i) {
        if (false !== t.needsCompile) {
            const s = this.it;
            const n = e.get(Gi);
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
        if (true === t.enhance) return new FragmentNodeSequence(this.nt, t.template);
        let e;
        const i = this.st;
        if (i.has(t)) e = i.get(t); else {
            const s = this.nt;
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
        return null == e ? this.ot : new FragmentNodeSequence(this.nt, e.cloneNode(true));
    }
    render(t, e, i, s, n) {
        const r = s.instructions;
        const o = this.renderers;
        const l = i.length;
        if (i.length !== r.length) throw new Error(`AUR0757:${l}<>${r.length}`);
        let h = 0;
        let a = 0;
        let c = 0;
        let u;
        let f;
        let d;
        if (l > 0) while (l > h) {
            u = r[h];
            d = i[h];
            a = 0;
            c = u.length;
            while (c > a) {
                f = u[a];
                o[f.type].render(t, e, d, f);
                ++a;
            }
            ++h;
        }
        if (void 0 !== n && null !== n) {
            u = s.surrogates;
            if ((c = u.length) > 0) {
                a = 0;
                while (c > a) {
                    f = u[a];
                    o[f.type].render(t, e, n, f);
                    ++a;
                }
            }
        }
    }
}

Rendering.inject = [ g ];

var ii;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["host"] = 1] = "host";
    t[t["shadowRoot"] = 2] = "shadowRoot";
    t[t["location"] = 3] = "location";
})(ii || (ii = {}));

const si = {
    optional: true
};

const ni = new WeakMap;

class Controller {
    constructor(t, e, i, s, n, r, o) {
        this.container = t;
        this.vmKind = e;
        this.flags = i;
        this.definition = s;
        this.viewFactory = n;
        this.viewModel = r;
        this.host = o;
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
        this.lt = false;
        this.ht = l;
        this.$initiator = null;
        this.$flags = 0;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.at = 0;
        this.ct = 0;
        this.ut = 0;
        this.ft = t.root.get(ei);
        switch (e) {
          case 1:
          case 0:
            this.hooks = new HooksDefinition(r);
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
        return ni.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (void 0 === e) throw new Error(`AUR0500:${t}`);
        return e;
    }
    static $el(t, e, i, s, n = 0, r = void 0) {
        if (ni.has(e)) return ni.get(e);
        r = null !== r && void 0 !== r ? r : Se.getDefinition(e.constructor);
        const o = new Controller(t, 0, n, r, null, e, i);
        const l = t.get(x(wi));
        if (r.dependencies.length > 0) t.register(...r.dependencies);
        t.registerResolver(wi, new b("IHydrationContext", new HydrationContext(o, s, l)));
        ni.set(e, o);
        if (null == s || false !== s.hydrate) o.dt(s, l);
        return o;
    }
    static $attr(t, e, i, s = 0, n) {
        if (ni.has(e)) return ni.get(e);
        n = null !== n && void 0 !== n ? n : me.getDefinition(e.constructor);
        const r = new Controller(t, 1, s, n, null, e, i);
        ni.set(e, r);
        r.vt();
        return r;
    }
    static $view(t, e = 0, i = void 0) {
        const s = new Controller(t.container, 2, e, null, t, null, null);
        s.parent = null !== i && void 0 !== i ? i : null;
        s.gt();
        return s;
    }
    dt(t, e) {
        const i = this.container;
        const s = this.flags;
        const n = this.viewModel;
        let r = this.definition;
        this.scope = U.create(n, null, true);
        if (r.watches.length > 0) ci(this, i, r, n);
        oi(this, r, s, n);
        this.ht = li(this, r, s, n);
        if (this.hooks.hasDefine) {
            const t = n.define(this, e, r);
            if (void 0 !== t && t !== r) r = CustomElementDefinition.getOrCreate(t);
        }
        this.lifecycleHooks = We.resolve(i);
        r.register(i);
        if (null !== r.injectable) i.registerResolver(r.injectable, new b("definition.injectable", n));
        if (null == t || false !== t.hydrate) {
            this.wt(t);
            this.xt();
        }
    }
    wt(t) {
        if (this.hooks.hasHydrating) this.viewModel.hydrating(this);
        const e = this.bt = this.ft.compile(this.definition, this.container, t);
        const {shadowOptions: i, isStrictBinding: s, hasSlots: n, containerless: r} = e;
        this.isStrictBinding = s;
        if (null !== (this.hostController = Se.for(this.host, si))) this.host = this.container.root.get(It).document.createElement(this.definition.name);
        Si(this.host, Se.name, this);
        Si(this.host, this.definition.key, this);
        if (null !== i || n) {
            if (r) throw new Error("AUR0501");
            Si(this.shadowRoot = this.host.attachShadow(null !== i && void 0 !== i ? i : di), Se.name, this);
            Si(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2;
        } else if (r) {
            Si(this.location = $i(this.host), Se.name, this);
            Si(this.location, this.definition.key, this);
            this.mountTarget = 3;
        } else this.mountTarget = 1;
        this.viewModel.$controller = this;
        this.nodes = this.ft.createNodes(e);
        if (this.hooks.hasHydrated) this.viewModel.hydrated(this);
    }
    xt() {
        this.ft.render(this.flags, this, this.nodes.findTargets(), this.bt, this.host);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    vt() {
        const t = this.definition;
        const e = this.viewModel;
        if (t.watches.length > 0) ci(this, this.container, t, e);
        oi(this, t, this.flags, e);
        e.$controller = this;
        this.lifecycleHooks = We.resolve(this.container);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    gt() {
        this.bt = this.ft.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this.bt.isStrictBinding;
        this.ft.render(this.flags, this, (this.nodes = this.ft.createNodes(this.bt)).findTargets(), this.bt, void 0);
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
            throw new Error(`AUR0503:${this.name} ${pi(this.state)}`);
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
        this.yt();
        if (this.hooks.hasBinding) {
            const t = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.kt();
                t.then((() => {
                    this.bind();
                })).catch((t => {
                    this.At(t);
                }));
                return this.$promise;
            }
        }
        this.bind();
        return this.$promise;
    }
    bind() {
        let t = 0;
        let e = this.ht.length;
        let i;
        if (e > 0) while (e > t) {
            this.ht[t].start();
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
                this.kt();
                i.then((() => {
                    this.isBound = true;
                    this.Ct();
                })).catch((t => {
                    this.At(t);
                }));
                return;
            }
        }
        this.isBound = true;
        this.Ct();
    }
    Rt(...t) {
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
    Ct() {
        if (null !== this.hostController) switch (this.mountTarget) {
          case 1:
          case 2:
            this.hostController.Rt(this.host);
            break;

          case 3:
            this.hostController.Rt(this.location.$start, this.location);
            break;
        }
        switch (this.mountTarget) {
          case 1:
            this.nodes.appendTo(this.host, null != this.definition && this.definition.enhance);
            break;

          case 2:
            {
                const t = this.container;
                const e = t.has(Le, false) ? t.get(Le) : t.get(qe);
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
                this.kt();
                this.yt();
                t.then((() => {
                    this.St();
                })).catch((t => {
                    this.At(t);
                }));
            }
        }
        if (null !== this.children) {
            let t = 0;
            for (;t < this.children.length; ++t) void this.children[t].activate(this.$initiator, this, this.$flags, this.scope);
        }
        this.St();
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
            throw new Error(`AUR0505:${this.name} ${pi(this.state)}`);
        }
        this.$initiator = t;
        this.$flags = i;
        if (t === this) this.Et();
        let s = 0;
        if (this.ht.length) for (;s < this.ht.length; ++s) this.ht[s].stop();
        if (null !== this.children) for (s = 0; s < this.children.length; ++s) void this.children[s].deactivate(t, this, i);
        if (this.hooks.hasDetaching) {
            const e = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (e instanceof Promise) {
                this.kt();
                t.Et();
                e.then((() => {
                    t.Bt();
                })).catch((e => {
                    t.At(e);
                }));
            }
        }
        if (null === t.head) t.head = this; else t.tail.next = this;
        t.tail = this;
        if (t !== this) return;
        this.Bt();
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
        this.It();
    }
    kt() {
        if (void 0 === this.$promise) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) this.parent.kt();
        }
    }
    It() {
        if (void 0 !== this.$promise) {
            bi = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            bi();
            bi = void 0;
        }
    }
    At(t) {
        if (void 0 !== this.$promise) {
            yi = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            yi(t);
            yi = void 0;
        }
        if (this.$initiator !== this) this.parent.At(t);
    }
    yt() {
        ++this.at;
        if (this.$initiator !== this) this.parent.yt();
    }
    St() {
        if (0 === --this.at) {
            if (this.hooks.hasAttached) {
                ki = this.viewModel.attached(this.$initiator, this.$flags);
                if (ki instanceof Promise) {
                    this.kt();
                    ki.then((() => {
                        this.state = 2;
                        this.It();
                        if (this.$initiator !== this) this.parent.St();
                    })).catch((t => {
                        this.At(t);
                    }));
                    ki = void 0;
                    return;
                }
                ki = void 0;
            }
            this.state = 2;
            this.It();
        }
        if (this.$initiator !== this) this.parent.St();
    }
    Et() {
        ++this.ct;
    }
    Bt() {
        if (0 === --this.ct) {
            this.Tt();
            this.removeNodes();
            let t = this.$initiator.head;
            while (null !== t) {
                if (t !== this) {
                    if (t.debug) t.logger.trace(`detach()`);
                    t.removeNodes();
                }
                if (t.hooks.hasUnbinding) {
                    if (t.debug) t.logger.trace("unbinding()");
                    ki = t.viewModel.unbinding(t.$initiator, t.parent, t.$flags);
                    if (ki instanceof Promise) {
                        this.kt();
                        this.Tt();
                        ki.then((() => {
                            this.Dt();
                        })).catch((t => {
                            this.At(t);
                        }));
                    }
                    ki = void 0;
                }
                t = t.next;
            }
            this.Dt();
        }
    }
    Tt() {
        ++this.ut;
    }
    Dt() {
        if (0 === --this.ut) {
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
            return me.getDefinition(this.viewModel.constructor).name === t;

          case 0:
            return Se.getDefinition(this.viewModel.constructor).name === t;

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
            Si(t, Se.name, this);
            Si(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = 1;
        return this;
    }
    setShadowRoot(t) {
        if (0 === this.vmKind) {
            Si(t, Se.name, this);
            Si(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = 2;
        return this;
    }
    setLocation(t) {
        if (0 === this.vmKind) {
            Si(t, Se.name, this);
            Si(t, this.definition.key, this);
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
            this.children.forEach(xi);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (null !== this.viewModel) {
            ni.delete(this.viewModel);
            this.viewModel = null;
        }
        this.viewModel = null;
        this.host = null;
        this.shadowRoot = null;
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

function ri(t) {
    let e = t.$observers;
    if (void 0 === e) Reflect.defineProperty(t, "$observers", {
        enumerable: false,
        value: e = {}
    });
    return e;
}

function oi(t, e, i, s) {
    const n = e.bindables;
    const r = Object.getOwnPropertyNames(n);
    const o = r.length;
    if (o > 0) {
        let e;
        let i;
        let l = 0;
        const h = ri(s);
        for (;l < o; ++l) {
            e = r[l];
            if (void 0 === h[e]) {
                i = n[e];
                h[e] = new BindableObserver(s, e, i.callback, i.set, t);
            }
        }
    }
}

function li(t, e, i, s) {
    const n = e.childrenObservers;
    const r = Object.getOwnPropertyNames(n);
    const o = r.length;
    if (o > 0) {
        const e = ri(s);
        const i = [];
        let l;
        let h = 0;
        let a;
        for (;h < o; ++h) {
            l = r[h];
            if (void 0 == e[l]) {
                a = n[l];
                i[i.length] = e[l] = new ChildrenObserver(t, s, l, a.callback, a.query, a.filter, a.map, a.options);
            }
        }
        return i;
    }
    return l;
}

const hi = new Map;

const ai = t => {
    let e = hi.get(t);
    if (null == e) {
        e = new j(t, 0);
        hi.set(t, e);
    }
    return e;
};

function ci(t, e, i, s) {
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
            u = "string" === typeof a ? r.parse(a, 53) : ai(a);
            t.addBinding(new ExpressionWatcher(l, e, n, u, c));
        }
    }
}

function ui(t) {
    return t instanceof Controller && 0 === t.vmKind;
}

function fi(t) {
    return y(t) && Se.isType(t.constructor);
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

const di = {
    mode: "open"
};

var vi;

(function(t) {
    t[t["customElement"] = 0] = "customElement";
    t[t["customAttribute"] = 1] = "customAttribute";
    t[t["synthetic"] = 2] = "synthetic";
})(vi || (vi = {}));

var mi;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["activating"] = 1] = "activating";
    t[t["activated"] = 2] = "activated";
    t[t["deactivating"] = 4] = "deactivating";
    t[t["deactivated"] = 8] = "deactivated";
    t[t["released"] = 16] = "released";
    t[t["disposed"] = 32] = "disposed";
})(mi || (mi = {}));

function pi(t) {
    const e = [];
    if (1 === (1 & t)) e.push("activating");
    if (2 === (2 & t)) e.push("activated");
    if (4 === (4 & t)) e.push("deactivating");
    if (8 === (8 & t)) e.push("deactivated");
    if (16 === (16 & t)) e.push("released");
    if (32 === (32 & t)) e.push("disposed");
    return 0 === e.length ? "none" : e.join("|");
}

const gi = h.createInterface("IController");

const wi = h.createInterface("IHydrationContext");

class HydrationContext {
    constructor(t, e, i) {
        this.instruction = e;
        this.parent = i;
        this.controller = t;
    }
}

function xi(t) {
    t.dispose();
}

let bi;

let yi;

let ki;

const Ai = h.createInterface("IAppRoot");

const Ci = h.createInterface("IWorkTracker", (t => t.singleton(WorkTracker)));

class WorkTracker {
    constructor(t) {
        this.Pt = 0;
        this.Ot = null;
        this.It = null;
        this.$t = t.scopeTo("WorkTracker");
    }
    start() {
        this.$t.trace(`start(stack:${this.Pt})`);
        ++this.Pt;
    }
    finish() {
        this.$t.trace(`finish(stack:${this.Pt})`);
        if (0 === --this.Pt) {
            const t = this.It;
            if (null !== t) {
                this.It = this.Ot = null;
                t();
            }
        }
    }
    wait() {
        this.$t.trace(`wait(stack:${this.Pt})`);
        if (null === this.Ot) {
            if (0 === this.Pt) return Promise.resolve();
            this.Ot = new Promise((t => {
                this.It = t;
            }));
        }
        return this.Ot;
    }
}

WorkTracker.inject = [ k ];

class AppRoot {
    constructor(t, e, i, s) {
        this.config = t;
        this.platform = e;
        this.container = i;
        this.controller = void 0;
        this.Lt = void 0;
        this.host = t.host;
        this.work = i.get(Ci);
        s.prepare(this);
        i.registerResolver(e.HTMLElement, i.registerResolver(e.Element, i.registerResolver(Ei, new b("ElementResolver", t.host))));
        this.Lt = A(this.qt("beforeCreate"), (() => {
            const e = t.component;
            const s = i.createChild();
            let n;
            if (Se.isType(e)) n = this.container.get(e); else n = t.component;
            const r = {
                hydrate: false,
                projections: null
            };
            const o = this.controller = Controller.$el(s, n, this.host, r, 0);
            o.dt(r, null);
            return A(this.qt("hydrating"), (() => {
                o.wt(null);
                return A(this.qt("hydrated"), (() => {
                    o.xt();
                    this.Lt = void 0;
                }));
            }));
        }));
    }
    activate() {
        return A(this.Lt, (() => A(this.qt("beforeActivate"), (() => A(this.controller.activate(this.controller, null, 2, void 0), (() => this.qt("afterActivate")))))));
    }
    deactivate() {
        return A(this.qt("beforeDeactivate"), (() => A(this.controller.deactivate(this.controller, null, 0), (() => this.qt("afterDeactivate")))));
    }
    qt(t) {
        return C(...this.container.getAll(Jt).reduce(((e, i) => {
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

function Ri(t, e) {
    var i, s;
    return null !== (s = null === (i = t.$au) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : null;
}

function Si(t, e, i) {
    var s;
    var n;
    (null !== (s = (n = t).$au) && void 0 !== s ? s : n.$au = new Refs)[e] = i;
}

const Ei = h.createInterface("INode");

const Bi = h.createInterface("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(Ai, true)) return t.get(Ai).host;
    return t.get(It).document;
}))));

const Ii = h.createInterface("IRenderLocation");

var Ti;

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
})(Ti || (Ti = {}));

const Di = new WeakMap;

function Pi(t) {
    if (Di.has(t)) return Di.get(t);
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
        const e = Se.for(t);
        if (void 0 === e) return null;
        if (2 === e.mountTarget) return Pi(e.host);
    }
    return t.parentNode;
}

function Oi(t, e) {
    if (void 0 !== t.platform && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) Di.set(i[t], e);
    } else Di.set(t, e);
}

function $i(t) {
    if (Li(t)) return t;
    const e = t.ownerDocument.createComment("au-end");
    const i = t.ownerDocument.createComment("au-start");
    if (null !== t.parentNode) {
        t.parentNode.replaceChild(e, t);
        e.parentNode.insertBefore(i, e);
    }
    e.$start = i;
    return e;
}

function Li(t) {
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
            if ("AU-M" === r.nodeName) o[s] = $i(r); else o[s] = r;
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
        if (Li(t)) this.refNode = t; else {
            this.next = t;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (void 0 !== this.next) this.refNode = this.next.firstChild; else this.refNode = void 0;
    }
}

const qi = h.createInterface("IWindow", (t => t.callback((t => t.get(It).window))));

const Mi = h.createInterface("ILocation", (t => t.callback((t => t.get(qi).location))));

const Ui = h.createInterface("IHistory", (t => t.callback((t => t.get(qi).history))));

const Fi = {
    [_.capturing]: {
        capture: true
    },
    [_.bubbling]: {
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
        if (this.delegationStrategy === _.none) this.target.addEventListener(this.targetEvent, this); else this.handler = this.eventDelegator.addEventListener(this.locator.get(Bi), this.target, this.targetEvent, this, Fi[this.delegationStrategy]);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        const e = this.sourceExpression;
        if (e.hasUnbind) e.unbind(t, this.$scope, this.interceptor);
        this.$scope = null;
        if (this.delegationStrategy === _.none) this.target.removeEventListener(this.targetEvent, this); else {
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

const Vi = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = Vi) {
        this.Mt = t;
        this.Ut = e;
        this.Ft = i;
        this.Vt = 0;
        this.jt = new Map;
        this._t = new Map;
    }
    Nt() {
        if (1 === ++this.Vt) this.Mt.addEventListener(this.Ut, this, this.Ft);
    }
    Ht() {
        if (0 === --this.Vt) this.Mt.removeEventListener(this.Ut, this, this.Ft);
    }
    dispose() {
        if (this.Vt > 0) {
            this.Vt = 0;
            this.Mt.removeEventListener(this.Ut, this, this.Ft);
        }
        this.jt.clear();
        this._t.clear();
    }
    Wt(t) {
        const e = true === this.Ft.capture ? this.jt : this._t;
        let i = e.get(t);
        if (void 0 === i) e.set(t, i = Object.create(null));
        return i;
    }
    handleEvent(t) {
        const e = true === this.Ft.capture ? this.jt : this._t;
        const i = t.composedPath();
        if (true === this.Ft.capture) i.reverse();
        for (const s of i) {
            const i = e.get(s);
            if (void 0 === i) continue;
            const n = i[this.Ut];
            if (void 0 === n) continue;
            if ("function" === typeof n) n(t); else n.handleEvent(t);
            if (true === t.cancelBubble) return;
        }
    }
}

class DelegateSubscription {
    constructor(t, e, i, s) {
        this.zt = t;
        this.Gt = e;
        this.Ut = i;
        t.Nt();
        e[i] = s;
    }
    dispose() {
        this.zt.Ht();
        this.Gt[this.Ut] = void 0;
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

const ji = h.createInterface("IEventDelegator", (t => t.singleton(EventDelegator)));

class EventDelegator {
    constructor() {
        this.Xt = Object.create(null);
    }
    addEventListener(t, e, i, s, n) {
        var r;
        var o;
        const l = null !== (r = (o = this.Xt)[i]) && void 0 !== r ? r : o[i] = new Map;
        let h = l.get(t);
        if (void 0 === h) l.set(t, h = new ListenerTracker(t, i, n));
        return new DelegateSubscription(h, h.Wt(e), i, s);
    }
    dispose() {
        for (const t in this.Xt) {
            const e = this.Xt[t];
            for (const t of e.values()) t.dispose();
            e.clear();
        }
    }
}

const _i = h.createInterface("IProjections");

const Ni = h.createInterface("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

var Hi;

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
})(Hi || (Hi = {}));

const Wi = h.createInterface("Instruction");

function zi(t) {
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
    constructor(t, e, i, s, n) {
        this.res = t;
        this.alias = e;
        this.props = i;
        this.projections = s;
        this.containerless = n;
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

const Gi = h.createInterface("ITemplateCompiler");

const Xi = h.createInterface("IRenderer");

function Ki(t) {
    return function e(i) {
        const n = function(...e) {
            const s = new i(...e);
            s.instructionType = t;
            return s;
        };
        n.register = function t(e) {
            c.singleton(Xi, n).register(e);
        };
        const r = s.getOwnKeys(i);
        for (const t of r) s.define(t, s.getOwn(t, i), n);
        const o = Object.getOwnPropertyDescriptors(i);
        Object.keys(o).filter((t => "prototype" !== t)).forEach((t => {
            Reflect.defineProperty(n, t, o[t]);
        }));
        return n;
    };
}

function Yi(t, e, i) {
    if ("string" === typeof e) return t.parse(e, i);
    return e;
}

function Qi(t) {
    if (null != t.viewModel) return t.viewModel;
    return t;
}

function Zi(t, e) {
    if ("element" === e) return t;
    switch (e) {
      case "controller":
        return Se.for(t);

      case "view":
        throw new Error("AUR0750");

      case "view-model":
        return Se.for(t).viewModel;

      default:
        {
            const i = me.for(t, e);
            if (void 0 !== i) return i.viewModel;
            const s = Se.for(t, {
                name: e
            });
            if (void 0 === s) throw new Error(`AUR0751:${e}`);
            return s.viewModel;
        }
    }
}

let Ji = class SetPropertyRenderer {
    render(t, e, i, s) {
        const n = Qi(i);
        if (void 0 !== n.$observers && void 0 !== n.$observers[s.to]) n.$observers[s.to].setValue(s.value, 2); else n[s.to] = s.value;
    }
};

Ji = rt([ Ki("re") ], Ji);

let ts = class CustomElementRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ ei, It ];
    }
    render(t, e, i, s) {
        let n;
        let r;
        let o;
        let l;
        const h = s.res;
        const a = s.projections;
        const c = e.container;
        const u = Cs(this.p, e, i, s, i, null == a ? void 0 : new AuSlotsInfo(Object.keys(a)));
        switch (typeof h) {
          case "string":
            n = c.find(Se, h);
            if (null == n) throw new Error(`AUR0752:${h}@${e["name"]}`);
            break;

          default:
            n = h;
        }
        r = n.Type;
        o = u.invoke(r);
        u.registerResolver(r, new b(n.key, o));
        l = Controller.$el(u, o, i, s, t, n);
        t = l.flags;
        Si(i, n.key, l);
        const f = this.r.renderers;
        const d = s.props;
        const v = d.length;
        let m = 0;
        let p;
        while (v > m) {
            p = d[m];
            f[p.type].render(t, e, l, p);
            ++m;
        }
        e.addChild(l);
    }
};

ts = rt([ Ki("ra") ], ts);

let es = class CustomAttributeRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ ei, It ];
    }
    render(t, e, i, s) {
        let n = e.container;
        let r;
        switch (typeof s.res) {
          case "string":
            r = n.find(me, s.res);
            if (null == r) throw new Error(`AUR0753:${s.res}@${e["name"]}`);
            break;

          default:
            r = s.res;
        }
        const o = Rs(this.p, r, e, i, s, void 0, void 0);
        const l = Controller.$attr(e.container, o, i, t, r);
        Si(i, r.key, l);
        const h = this.r.renderers;
        const a = s.props;
        const c = a.length;
        let u = 0;
        let f;
        while (c > u) {
            f = a[u];
            h[f.type].render(t, e, l, f);
            ++u;
        }
        e.addChild(l);
    }
};

es = rt([ Ki("rb") ], es);

let is = class TemplateControllerRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ ei, It ];
    }
    render(t, e, i, s) {
        var n;
        let r = e.container;
        let o;
        switch (typeof s.res) {
          case "string":
            o = r.find(me, s.res);
            if (null == o) throw new Error(`AUR0754:${s.res}@${e["name"]}`);
            break;

          default:
            o = s.res;
        }
        const l = this.r.getViewFactory(s.def, r);
        const h = $i(i);
        const a = Rs(this.p, o, e, i, s, l, h);
        const c = Controller.$attr(e.container, a, i, t, o);
        Si(h, o.key, c);
        null === (n = a.link) || void 0 === n ? void 0 : n.call(a, t, e, c, i, s);
        const u = this.r.renderers;
        const f = s.props;
        const d = f.length;
        let v = 0;
        let m;
        while (d > v) {
            m = f[v];
            u[m.type].render(t, e, c, m);
            ++v;
        }
        e.addChild(c);
    }
};

is = rt([ Ki("rc") ], is);

let ss = class LetElementRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        i.remove();
        const n = s.instructions;
        const r = s.toBindingContext;
        const o = e.container;
        const l = n.length;
        let h;
        let a;
        let c;
        let u = 0;
        while (l > u) {
            h = n[u];
            a = Yi(this.parser, h.from, 48);
            c = new LetBinding(a, h.to, this.oL, o, r);
            e.addBinding(38962 === a.$kind ? us(c, a, o) : c);
            ++u;
        }
    }
};

ss = rt([ Ki("rd"), ot(0, V), ot(1, F) ], ss);

let ns = class CallBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        const n = Yi(this.parser, s.from, 153);
        const r = new CallBinding(n, Qi(i), s.to, this.oL, e.container);
        e.addBinding(38962 === n.$kind ? us(r, n, e.container) : r);
    }
};

ns.inject = [ V, F ];

ns = rt([ Ki("rh") ], ns);

let rs = class RefBindingRenderer {
    constructor(t) {
        this.parser = t;
    }
    render(t, e, i, s) {
        const n = Yi(this.parser, s.from, 5376);
        const r = new RefBinding(n, Zi(i, s.to), e.container);
        e.addBinding(38962 === n.$kind ? us(r, n, e.container) : r);
    }
};

rs = rt([ Ki("rj"), ot(0, V) ], rs);

let os = class InterpolationBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = e.container;
        const r = Yi(this.parser, s.from, 2048);
        const o = new InterpolationBinding(this.oL, r, Qi(i), s.to, D.toView, n, this.p.domWriteQueue);
        const l = o.partBindings;
        const h = l.length;
        let a = 0;
        let c;
        for (;h > a; ++a) {
            c = l[a];
            if (38962 === c.sourceExpression.$kind) l[a] = us(c, c.sourceExpression, n);
        }
        e.addBinding(o);
    }
};

os = rt([ Ki("rf"), ot(0, V), ot(1, F), ot(2, It) ], os);

let ls = class PropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Yi(this.parser, s.from, 48 | s.mode);
        const r = new PropertyBinding(n, Qi(i), s.to, s.mode, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === n.$kind ? us(r, n, e.container) : r);
    }
};

ls = rt([ Ki("rg"), ot(0, V), ot(1, F), ot(2, It) ], ls);

let hs = class IteratorBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Yi(this.parser, s.from, 539);
        const r = new PropertyBinding(n, Qi(i), s.to, D.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(r);
    }
};

hs = rt([ Ki("rk"), ot(0, V), ot(1, F), ot(2, It) ], hs);

let as = 0;

const cs = [];

function us(t, e, i) {
    while (e instanceof N) {
        cs[as++] = e;
        e = e.expression;
    }
    while (as > 0) {
        const e = cs[--as];
        const s = i.get(e.behaviorKey);
        if (s instanceof H) t = s.construct(t, e);
    }
    cs.length = 0;
    return t;
}

let fs = class TextBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = e.container;
        const r = i.nextSibling;
        const o = i.parentNode;
        const l = this.p.document;
        const h = Yi(this.parser, s.from, 2048);
        const a = h.parts;
        const c = h.expressions;
        const u = c.length;
        let f = 0;
        let d = a[0];
        let v;
        let m;
        if ("" !== d) o.insertBefore(l.createTextNode(d), r);
        for (;u > f; ++f) {
            m = c[f];
            v = new ContentBinding(m, o.insertBefore(l.createTextNode(""), r), n, this.oL, this.p, s.strict);
            e.addBinding(38962 === m.$kind ? us(v, m, n) : v);
            d = a[f + 1];
            if ("" !== d) o.insertBefore(l.createTextNode(d), r);
        }
        if ("AU-M" === i.nodeName) i.remove();
    }
};

fs = rt([ Ki("ha"), ot(0, V), ot(1, F), ot(2, It) ], fs);

let ds = class ListenerBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.eventDelegator = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Yi(this.parser, s.from, 80 | s.strategy + 6);
        const r = new Listener(this.p, s.to, s.strategy, n, i, s.preventDefault, this.eventDelegator, e.container);
        e.addBinding(38962 === n.$kind ? us(r, n, e.container) : r);
    }
};

ds = rt([ Ki("hb"), ot(0, V), ot(1, ji), ot(2, It) ], ds);

let vs = class SetAttributeRenderer {
    render(t, e, i, s) {
        i.setAttribute(s.to, s.value);
    }
};

vs = rt([ Ki("he") ], vs);

let ms = class SetClassAttributeRenderer {
    render(t, e, i, s) {
        xs(i.classList, s.value);
    }
};

ms = rt([ Ki("hf") ], ms);

let ps = class SetStyleAttributeRenderer {
    render(t, e, i, s) {
        i.style.cssText += s.value;
    }
};

ps = rt([ Ki("hg") ], ps);

let gs = class StylePropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Yi(this.parser, s.from, 48 | D.toView);
        const r = new PropertyBinding(n, i.style, s.to, D.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === n.$kind ? us(r, n, e.container) : r);
    }
};

gs = rt([ Ki("hd"), ot(0, V), ot(1, F), ot(2, It) ], gs);

let ws = class AttributeBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        const n = Yi(this.parser, s.from, 48 | D.toView);
        const r = new AttributeBinding(n, i, s.attr, s.to, D.toView, this.oL, e.container);
        e.addBinding(38962 === n.$kind ? us(r, n, e.container) : r);
    }
};

ws = rt([ Ki("hc"), ot(0, V), ot(1, F) ], ws);

function xs(t, e) {
    const i = e.length;
    let s = 0;
    for (let n = 0; n < i; ++n) if (32 === e.charCodeAt(n)) {
        if (n !== s) t.add(e.slice(s, n));
        s = n + 1;
    } else if (n + 1 === i) t.add(e.slice(s));
}

const bs = "IController";

const ys = "IInstruction";

const ks = "IRenderLocation";

const As = "IAuSlotsInfo";

function Cs(t, e, i, s, n, r) {
    const o = e.container.createChild();
    o.registerResolver(t.HTMLElement, o.registerResolver(t.Element, o.registerResolver(Ei, new b("ElementResolver", i))));
    o.registerResolver(gi, new b(bs, e));
    o.registerResolver(Wi, new b(ys, s));
    o.registerResolver(Ii, null == n ? Ss : new b(ks, n));
    o.registerResolver(Ge, Es);
    o.registerResolver(Ni, null == r ? Bs : new b(As, r));
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

function Rs(t, e, i, s, n, r, o, l) {
    const h = i.container.createChild();
    h.registerResolver(t.HTMLElement, h.registerResolver(t.Element, h.registerResolver(Ei, new b("ElementResolver", s))));
    h.registerResolver(gi, new b(bs, i));
    h.registerResolver(Wi, new b(ys, n));
    h.registerResolver(Ii, null == o ? Ss : new b(ks, o));
    h.registerResolver(Ge, null == r ? Es : new ViewFactoryProvider(r));
    h.registerResolver(Ni, null == l ? Bs : new b(As, l));
    return h.invoke(e.Type);
}

const Ss = new b(ks);

const Es = new ViewFactoryProvider(null);

const Bs = new b(As, new AuSlotsInfo(l));

function Is(t) {
    return function(e) {
        return Ds.define(t, e);
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
        const r = Ds.getAnnotation;
        return new BindingCommandDefinition(e, n(r(e, "name"), i), f(r(e, "aliases"), s.aliases, e.aliases), Ds.keyFrom(i), n(r(e, "type"), s.type, e.type, null));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        c.singleton(i, e).register(t);
        c.aliasTo(i, e).register(t);
        L(s, Ds, i, t);
    }
}

const Ts = e.resource.keyFor("binding-command");

const Ds = Object.freeze({
    name: Ts,
    keyFrom(t) {
        return `${Ts}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.hasOwn(Ts, t);
    },
    define(t, i) {
        const n = BindingCommandDefinition.create(t, i);
        s.define(Ts, n, n.Type);
        s.define(Ts, n, n);
        e.resource.appendTo(i, Ts);
        return n.Type;
    },
    getDefinition(t) {
        const e = s.getOwn(Ts, t);
        if (void 0 === e) throw new Error(`AUR0758:${t.name}`);
        return e;
    },
    annotate(t, i, n) {
        s.define(e.annotation.keyFor(i), n, t);
    },
    getAnnotation(t, i) {
        return s.getOwn(e.annotation.keyFor(i), t);
    }
});

let Ps = class OneTimeBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 49;
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = t.attr.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : R(s); else {
            if ("" === n && 1 === t.def.type) n = R(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(n, 49), s, D.oneTime);
    }
};

Ps.inject = [ Pt, V ];

Ps = rt([ Is("one-time") ], Ps);

let Os = class ToViewBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 50;
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = t.attr.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : R(s); else {
            if ("" === n && 1 === t.def.type) n = R(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(n, 50), s, D.toView);
    }
};

Os.inject = [ Pt, V ];

Os = rt([ Is("to-view") ], Os);

let $s = class FromViewBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 51;
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = i.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : R(s); else {
            if ("" === n && 1 === t.def.type) n = R(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(n, 51), s, D.fromView);
    }
};

$s.inject = [ Pt, V ];

$s = rt([ Is("from-view") ], $s);

let Ls = class TwoWayBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 52;
    }
    build(t) {
        var e;
        const i = t.attr;
        let s = i.target;
        let n = i.rawValue;
        if (null == t.bindable) s = null !== (e = this.m.map(t.node, s)) && void 0 !== e ? e : R(s); else {
            if ("" === n && 1 === t.def.type) n = R(s);
            s = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(n, 52), s, D.twoWay);
    }
};

Ls.inject = [ Pt, V ];

Ls = rt([ Is("two-way") ], Ls);

let qs = class DefaultBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 53;
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
            o = null !== (e = this.m.map(t.node, o)) && void 0 !== e ? e : R(o);
        } else {
            if ("" === l && 1 === t.def.type) l = R(o);
            n = t.def.defaultBindingMode;
            r = s.mode === D.default || null == s.mode ? null == n || n === D.default ? D.toView : n : s.mode;
            o = s.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(l, 53), o, r);
    }
};

qs.inject = [ Pt, V ];

qs = rt([ Is("bind") ], qs);

let Ms = class CallBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 153;
    }
    build(t) {
        const e = null === t.bindable ? R(t.attr.target) : t.bindable.property;
        return new CallBindingInstruction(this.xp.parse(t.attr.rawValue, 153), e);
    }
};

Ms.inject = [ V ];

Ms = rt([ Is("call") ], Ms);

let Us = class ForBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 539;
    }
    build(t) {
        const e = null === t.bindable ? R(t.attr.target) : t.bindable.property;
        return new IteratorBindingInstruction(this.xp.parse(t.attr.rawValue, 539), e);
    }
};

Us.inject = [ V ];

Us = rt([ Is("for") ], Us);

let Fs = class TriggerBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 4182;
    }
    build(t) {
        return new ListenerBindingInstruction(this.xp.parse(t.attr.rawValue, 4182), t.attr.target, true, _.none);
    }
};

Fs.inject = [ V ];

Fs = rt([ Is("trigger") ], Fs);

let Vs = class DelegateBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 4184;
    }
    build(t) {
        return new ListenerBindingInstruction(this.xp.parse(t.attr.rawValue, 4184), t.attr.target, false, _.bubbling);
    }
};

Vs.inject = [ V ];

Vs = rt([ Is("delegate") ], Vs);

let js = class CaptureBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 4183;
    }
    build(t) {
        return new ListenerBindingInstruction(this.xp.parse(t.attr.rawValue, 4183), t.attr.target, false, _.capturing);
    }
};

js.inject = [ V ];

js = rt([ Is("capture") ], js);

let _s = class AttrBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction(t.attr.target, this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

_s.inject = [ V ];

_s = rt([ Is("attr") ], _s);

let Ns = class StyleBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("style", this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

Ns.inject = [ V ];

Ns = rt([ Is("style") ], Ns);

let Hs = class ClassBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("class", this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

Hs.inject = [ V ];

Hs = rt([ Is("class") ], Hs);

let Ws = class RefBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new RefBindingInstruction(this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

Ws.inject = [ V ];

Ws = rt([ Is("ref") ], Ws);

const zs = h.createInterface("ITemplateElementFactory", (t => t.singleton(TemplateElementFactory)));

const Gs = {};

class TemplateElementFactory {
    constructor(t) {
        this.p = t;
        this.Kt = t.document.createElement("template");
    }
    createTemplate(t) {
        var e;
        if ("string" === typeof t) {
            let e = Gs[t];
            if (void 0 === e) {
                const i = this.Kt;
                i.innerHTML = t;
                const s = i.content.firstElementChild;
                if (null == s || "TEMPLATE" !== s.nodeName || null != s.nextElementSibling) {
                    this.Kt = this.p.document.createElement("template");
                    e = i;
                } else {
                    i.content.removeChild(s);
                    e = s;
                }
                Gs[t] = e;
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

TemplateElementFactory.inject = [ It ];

const Xs = function(t) {
    function e(t, i, s) {
        h.inject(e)(t, i, s);
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
        return c.singleton(Gi, this).register(t);
    }
    compile(t, e, i) {
        var s, n, r, o;
        const h = CustomElementDefinition.getOrCreate(t);
        if (null === h.template || void 0 === h.template) return h;
        if (false === h.needsCompile) return h;
        null !== i && void 0 !== i ? i : i = Qs;
        const a = new CompilationContext(t, e, i, null, null, void 0);
        const c = "string" === typeof h.template || !t.enhance ? a.Yt.createTemplate(h.template) : h.template;
        const u = "TEMPLATE" === c.nodeName && null != c.content;
        const f = u ? c.content : c;
        const d = e.get(Xs(an));
        const v = d.length;
        let m = 0;
        if (v > 0) while (v > m) {
            null === (n = (s = d[m]).compiling) || void 0 === n ? void 0 : n.call(s, c);
            ++m;
        }
        if (c.hasAttribute(on)) throw new Error("AUR0701");
        this.Qt(f, a);
        this.Zt(f, a);
        return CustomElementDefinition.create({
            ...t,
            name: t.name || Se.generateName(),
            dependencies: (null !== (r = t.dependencies) && void 0 !== r ? r : l).concat(null !== (o = a.deps) && void 0 !== o ? o : l),
            instructions: a.rows,
            surrogates: u ? this.Jt(c, a) : l,
            template: c,
            hasSlots: a.hasSlot,
            needsCompile: false
        });
    }
    Jt(t, e) {
        var i;
        const s = [];
        const n = t.attributes;
        const r = e.te;
        let o = n.length;
        let l = 0;
        let h;
        let a;
        let c;
        let u;
        let f = null;
        let d;
        let v;
        let m;
        let p;
        let g = null;
        let w;
        let x;
        let b;
        let y;
        for (;o > l; ++l) {
            h = n[l];
            a = h.name;
            c = h.value;
            u = e.ee.parse(a, c);
            b = u.target;
            y = u.rawValue;
            if (tn[b]) throw new Error(`AUR0702:${a}`);
            g = e.ie(u);
            if (null !== g && (4096 & g.bindingType) > 0) {
                Js.node = t;
                Js.attr = u;
                Js.bindable = null;
                Js.def = null;
                s.push(g.build(Js));
                continue;
            }
            f = e.se(b);
            if (null !== f) {
                if (f.isTemplateController) throw new Error(`AUR0703:${b}`);
                m = BindablesInfo.from(f, true);
                x = false === f.noMultiBindings && null === g && Ks(y);
                if (x) v = this.ne(t, y, f, e); else {
                    p = m.primary;
                    if (null === g) {
                        w = r.parse(y, 2048);
                        v = [ null === w ? new SetPropertyInstruction(y, p.property) : new InterpolationInstruction(w, p.property) ];
                    } else {
                        Js.node = t;
                        Js.attr = u;
                        Js.bindable = p;
                        Js.def = f;
                        v = [ g.build(Js) ];
                    }
                }
                t.removeAttribute(a);
                --l;
                --o;
                (null !== d && void 0 !== d ? d : d = []).push(new HydrateAttributeInstruction(this.resolveResources ? f : f.name, null != f.aliases && f.aliases.includes(b) ? b : void 0, v));
                continue;
            }
            if (null === g) {
                w = r.parse(y, 2048);
                if (null != w) {
                    t.removeAttribute(a);
                    --l;
                    --o;
                    s.push(new InterpolationInstruction(w, null !== (i = e.re.map(t, b)) && void 0 !== i ? i : R(b)));
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
                Js.node = t;
                Js.attr = u;
                Js.bindable = null;
                Js.def = null;
                s.push(g.build(Js));
            }
        }
        Ys();
        if (null != d) return d.concat(s);
        return s;
    }
    Zt(t, e) {
        switch (t.nodeType) {
          case 1:
            switch (t.nodeName) {
              case "LET":
                return this.oe(t, e);

              default:
                return this.le(t, e);
            }

          case 3:
            return this.he(t, e);

          case 11:
            {
                let i = t.firstChild;
                while (null !== i) i = this.Zt(i, e);
                break;
            }
        }
        return t.nextSibling;
    }
    oe(t, e) {
        const i = t.attributes;
        const s = i.length;
        const n = [];
        const r = e.te;
        let o = false;
        let l = 0;
        let h;
        let a;
        let c;
        let u;
        let f;
        let d;
        let v;
        let m;
        for (;s > l; ++l) {
            h = i[l];
            c = h.name;
            u = h.value;
            if ("to-binding-context" === c) {
                o = true;
                continue;
            }
            a = e.ee.parse(c, u);
            d = a.target;
            v = a.rawValue;
            f = e.ie(a);
            if (null !== f) {
                if (50 === f.bindingType || 53 === f.bindingType) {
                    n.push(new LetBindingInstruction(r.parse(v, f.bindingType), R(d)));
                    continue;
                }
                throw new Error(`AUR0704:${a.command}`);
            }
            m = r.parse(v, 2048);
            n.push(new LetBindingInstruction(null === m ? new W(v) : m, R(d)));
        }
        e.rows.push([ new HydrateLetElementInstruction(n, o) ]);
        return this.ae(t).nextSibling;
    }
    le(t, e) {
        var i, s, n, r, h;
        var a, c;
        const u = t.nextSibling;
        const f = (null !== (i = t.getAttribute("as-element")) && void 0 !== i ? i : t.nodeName).toLowerCase();
        const d = e.ce(f);
        const v = e.te;
        const m = this.debug ? o : () => {
            t.removeAttribute(y);
            --x;
            --w;
        };
        let p = t.attributes;
        let g;
        let w = p.length;
        let x = 0;
        let b;
        let y;
        let k;
        let A;
        let C;
        let S;
        let E = null;
        let B = false;
        let I;
        let T;
        let D;
        let P;
        let O;
        let $;
        let L;
        let q = null;
        let M;
        let U;
        let F;
        let V;
        let j = true;
        let _ = false;
        if ("slot" === f) e.root.hasSlot = true;
        if (null !== d) {
            j = null === (s = d.processContent) || void 0 === s ? void 0 : s.call(d.Type, t, e.p);
            p = t.attributes;
            w = p.length;
        }
        if (e.root.def.enhance && t.classList.contains("au")) throw new Error(`AUR0705`);
        for (;w > x; ++x) {
            b = p[x];
            y = b.name;
            k = b.value;
            switch (y) {
              case "as-element":
              case "containerless":
                m();
                if (!_) _ = "containerless" === y;
                continue;
            }
            A = e.ee.parse(y, k);
            q = e.ie(A);
            if (null !== q && 4096 & q.bindingType) {
                Js.node = t;
                Js.attr = A;
                Js.bindable = null;
                Js.def = null;
                (null !== C && void 0 !== C ? C : C = []).push(q.build(Js));
                m();
                continue;
            }
            F = A.target;
            V = A.rawValue;
            E = e.se(F);
            if (null !== E) {
                M = BindablesInfo.from(E, true);
                B = false === E.noMultiBindings && null === q && Ks(k);
                if (B) D = this.ne(t, k, E, e); else {
                    U = M.primary;
                    if (null === q) {
                        $ = v.parse(k, 2048);
                        D = [ null === $ ? new SetPropertyInstruction(k, U.property) : new InterpolationInstruction($, U.property) ];
                    } else {
                        Js.node = t;
                        Js.attr = A;
                        Js.bindable = U;
                        Js.def = E;
                        D = [ q.build(Js) ];
                    }
                }
                m();
                if (E.isTemplateController) (null !== P && void 0 !== P ? P : P = []).push(new HydrateTemplateController(Zs, this.resolveResources ? E : E.name, void 0, D)); else (null !== T && void 0 !== T ? T : T = []).push(new HydrateAttributeInstruction(this.resolveResources ? E : E.name, null != E.aliases && E.aliases.includes(F) ? F : void 0, D));
                continue;
            }
            if (null === q) {
                if (null !== d) {
                    M = BindablesInfo.from(d, false);
                    I = M.attrs[F];
                    if (void 0 !== I) {
                        $ = v.parse(V, 2048);
                        (null !== S && void 0 !== S ? S : S = []).push(null == $ ? new SetPropertyInstruction(V, I.property) : new InterpolationInstruction($, I.property));
                        m();
                        continue;
                    }
                }
                $ = v.parse(V, 2048);
                if (null != $) {
                    m();
                    (null !== C && void 0 !== C ? C : C = []).push(new InterpolationInstruction($, null !== (n = e.re.map(t, F)) && void 0 !== n ? n : R(F)));
                }
                continue;
            }
            m();
            if (null !== d) {
                M = BindablesInfo.from(d, false);
                I = M.attrs[F];
                if (void 0 !== I) {
                    Js.node = t;
                    Js.attr = A;
                    Js.bindable = I;
                    Js.def = d;
                    (null !== S && void 0 !== S ? S : S = []).push(q.build(Js));
                    continue;
                }
            }
            Js.node = t;
            Js.attr = A;
            Js.bindable = null;
            Js.def = null;
            (null !== C && void 0 !== C ? C : C = []).push(q.build(Js));
        }
        Ys();
        if (this.ue(t) && null != C && C.length > 1) this.fe(t, C);
        if (null !== d) {
            L = new HydrateElementInstruction(this.resolveResources ? d : d.name, void 0, null !== S && void 0 !== S ? S : l, null, _);
            if ("au-slot" === f) {
                const i = t.getAttribute("name") || "default";
                const s = e.h("template");
                const n = e.de();
                let r = t.firstChild;
                while (null !== r) {
                    if (1 === r.nodeType && r.hasAttribute("au-slot")) t.removeChild(r); else s.content.appendChild(r);
                    r = t.firstChild;
                }
                this.Zt(s.content, n);
                L.auSlot = {
                    name: i,
                    fallback: CustomElementDefinition.create({
                        name: Se.generateName(),
                        template: s,
                        instructions: n.rows,
                        needsCompile: false
                    })
                };
                t = this.ve(t, e);
            }
        }
        if (null != C || null != L || null != T) {
            g = l.concat(null !== L && void 0 !== L ? L : l, null !== T && void 0 !== T ? T : l, null !== C && void 0 !== C ? C : l);
            this.ae(t);
        }
        let N;
        if (null != P) {
            w = P.length - 1;
            x = w;
            O = P[x];
            let i;
            this.ve(t, e);
            if ("TEMPLATE" === t.nodeName) i = t; else {
                i = e.h("template");
                i.content.appendChild(t);
            }
            const s = i;
            const n = e.de(null == g ? [] : [ g ]);
            N = null === d || !d.containerless && !_ && false !== j;
            if (null !== d && d.containerless) this.ve(t, e);
            let o;
            let l;
            let h;
            let c;
            let u;
            let f;
            let v;
            let m;
            let p;
            let b = 0, y = 0;
            if (N) {
                if (null !== d) {
                    o = t.firstChild;
                    while (null !== o) if (1 === o.nodeType) {
                        l = o;
                        o = o.nextSibling;
                        h = l.getAttribute("au-slot");
                        if (null !== h) {
                            if ("" === h) h = "default";
                            l.removeAttribute("au-slot");
                            t.removeChild(l);
                            (null !== (r = (a = null !== u && void 0 !== u ? u : u = {})[h]) && void 0 !== r ? r : a[h] = []).push(l);
                        }
                    } else o = o.nextSibling;
                    if (null != u) {
                        c = {};
                        for (h in u) {
                            i = e.h("template");
                            f = u[h];
                            for (b = 0, y = f.length; y > b; ++b) {
                                v = f[b];
                                if ("TEMPLATE" === v.nodeName) if (v.attributes.length > 0) i.content.appendChild(v); else i.content.appendChild(v.content); else i.content.appendChild(v);
                            }
                            p = e.de();
                            this.Zt(i.content, p);
                            c[h] = CustomElementDefinition.create({
                                name: Se.generateName(),
                                template: i,
                                instructions: p.rows,
                                needsCompile: false
                            });
                        }
                        L.projections = c;
                    }
                }
                if ("TEMPLATE" === t.nodeName) this.Zt(t.content, n); else {
                    o = t.firstChild;
                    while (null !== o) o = this.Zt(o, n);
                }
            }
            O.def = CustomElementDefinition.create({
                name: Se.generateName(),
                template: s,
                instructions: n.rows,
                needsCompile: false
            });
            while (x-- > 0) {
                O = P[x];
                i = e.h("template");
                m = e.h("au-m");
                m.classList.add("au");
                i.content.appendChild(m);
                O.def = CustomElementDefinition.create({
                    name: Se.generateName(),
                    template: i,
                    needsCompile: false,
                    instructions: [ [ P[x + 1] ] ]
                });
            }
            e.rows.push([ O ]);
        } else {
            if (null != g) e.rows.push(g);
            N = null === d || !d.containerless && !_ && false !== j;
            if (null !== d && d.containerless) this.ve(t, e);
            if (N && t.childNodes.length > 0) {
                let i = t.firstChild;
                let s;
                let n;
                let r = null;
                let o;
                let l;
                let a;
                let u;
                let f;
                let v = 0, m = 0;
                while (null !== i) if (1 === i.nodeType) {
                    s = i;
                    i = i.nextSibling;
                    n = s.getAttribute("au-slot");
                    if (null !== n) {
                        if (null === d) throw new Error(`AUR0706:${t.nodeName}[${n}]`);
                        if ("" === n) n = "default";
                        t.removeChild(s);
                        s.removeAttribute("au-slot");
                        (null !== (h = (c = null !== o && void 0 !== o ? o : o = {})[n]) && void 0 !== h ? h : c[n] = []).push(s);
                    }
                } else i = i.nextSibling;
                if (null != o) {
                    r = {};
                    for (n in o) {
                        u = e.h("template");
                        l = o[n];
                        for (v = 0, m = l.length; m > v; ++v) {
                            a = l[v];
                            if ("TEMPLATE" === a.nodeName) if (a.attributes.length > 0) u.content.appendChild(a); else u.content.appendChild(a.content); else u.content.appendChild(a);
                        }
                        f = e.de();
                        this.Zt(u.content, f);
                        r[n] = CustomElementDefinition.create({
                            name: Se.generateName(),
                            template: u,
                            instructions: f.rows,
                            needsCompile: false
                        });
                    }
                    L.projections = r;
                }
                i = t.firstChild;
                while (null !== i) i = this.Zt(i, e);
            }
        }
        return u;
    }
    he(t, e) {
        let i = "";
        let s = t;
        while (null !== s && 3 === s.nodeType) {
            i += s.textContent;
            s = s.nextSibling;
        }
        const n = e.te.parse(i, 2048);
        if (null === n) return s;
        const r = t.parentNode;
        r.insertBefore(this.ae(e.h("au-m")), t);
        e.rows.push([ new TextBindingInstruction(n, !!e.def.isStrictBinding) ]);
        t.textContent = "";
        s = t.nextSibling;
        while (null !== s && 3 === s.nodeType) {
            r.removeChild(s);
            s = t.nextSibling;
        }
        return t.nextSibling;
    }
    ne(t, e, i, s) {
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
        let v;
        for (let m = 0; m < r; ++m) {
            c = e.charCodeAt(m);
            if (92 === c) ++m; else if (58 === c) {
                l = e.slice(a, m);
                while (e.charCodeAt(++m) <= 32) ;
                a = m;
                for (;m < r; ++m) {
                    c = e.charCodeAt(m);
                    if (92 === c) ++m; else if (59 === c) {
                        h = e.slice(a, m);
                        break;
                    }
                }
                if (void 0 === h) h = e.slice(a);
                f = s.ee.parse(l, h);
                d = s.ie(f);
                v = n.attrs[f.target];
                if (null == v) throw new Error(`AUR0707:${i.name}.${f.target}`);
                if (null === d) {
                    u = s.te.parse(h, 2048);
                    o.push(null === u ? new SetPropertyInstruction(h, v.property) : new InterpolationInstruction(u, v.property));
                } else {
                    Js.node = t;
                    Js.attr = f;
                    Js.bindable = v;
                    Js.def = i;
                    o.push(d.build(Js));
                }
                while (m < r && e.charCodeAt(++m) <= 32) ;
                a = m;
                l = void 0;
                h = void 0;
            }
        }
        Ys();
        return o;
    }
    Qt(t, e) {
        const i = t;
        const s = S(i.querySelectorAll("template[as-custom-element]"));
        const n = s.length;
        if (0 === n) return;
        if (n === i.childElementCount) throw new Error("AUR0708");
        const r = new Set;
        for (const t of s) {
            if (t.parentNode !== i) throw new Error("AUR0709");
            const s = ln(t, r);
            const n = class LocalTemplate {};
            const o = t.content;
            const l = S(o.querySelectorAll("bindable"));
            const h = ct.for(n);
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
                    mode: hn(t)
                });
                const s = t.getAttributeNames().filter((t => !rn.includes(t)));
                if (s.length > 0) ;
                o.removeChild(t);
            }
            e.me(Se.define({
                name: s,
                template: t
            }, n));
            i.removeChild(t);
        }
    }
    ue(t) {
        return "INPUT" === t.nodeName && 1 === en[t.type];
    }
    fe(t, e) {
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
    ae(t) {
        t.classList.add("au");
        return t;
    }
    ve(t, e) {
        const i = t.parentNode;
        const s = e.h("au-m");
        this.ae(i.insertBefore(s, t));
        i.removeChild(t);
        return s;
    }
}

class CompilationContext {
    constructor(t, e, i, s, n, r) {
        this.hasSlot = false;
        this.pe = Rt();
        const o = null !== s;
        this.c = e;
        this.root = null === n ? this : n;
        this.def = t;
        this.ci = i;
        this.parent = s;
        this.Yt = o ? s.Yt : e.get(zs);
        this.ee = o ? s.ee : e.get(pt);
        this.te = o ? s.te : e.get(V);
        this.re = o ? s.re : e.get(Pt);
        this.$t = o ? s.$t : e.get(k);
        this.p = o ? s.p : e.get(It);
        this.localEls = o ? s.localEls : new Set;
        this.rows = null !== r && void 0 !== r ? r : [];
    }
    me(t) {
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
    ce(t) {
        return this.c.find(Se, t);
    }
    se(t) {
        return this.c.find(me, t);
    }
    de(t) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, t);
    }
    ie(t) {
        if (this.root !== this) return this.root.ie(t);
        const e = t.command;
        if (null === e) return null;
        let i = this.pe[e];
        if (void 0 === i) {
            i = this.c.create(Ds, e);
            if (null === i) throw new Error(`AUR0713:${e}`);
            this.pe[e] = i;
        }
        return i;
    }
}

function Ks(t) {
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

function Ys() {
    Js.node = Js.attr = Js.bindable = Js.def = null;
}

const Qs = {
    projections: null
};

const Zs = {
    name: "unnamed"
};

const Js = {
    node: null,
    attr: null,
    bindable: null,
    def: null
};

const tn = Object.assign(Rt(), {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
});

const en = {
    checkbox: 1,
    radio: 1
};

const sn = new WeakMap;

class BindablesInfo {
    constructor(t, e, i) {
        this.attrs = t;
        this.bindables = e;
        this.primary = i;
    }
    static from(t, e) {
        let i = sn.get(t);
        if (null == i) {
            const s = t.bindables;
            const n = Rt();
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
            sn.set(t, i = new BindablesInfo(n, s, a));
        }
        return i;
    }
}

var nn;

(function(t) {
    t["property"] = "property";
    t["attribute"] = "attribute";
    t["mode"] = "mode";
})(nn || (nn = {}));

const rn = Object.freeze([ "property", "attribute", "mode" ]);

const on = "as-custom-element";

function ln(t, e) {
    const i = t.getAttribute(on);
    if (null === i || "" === i) throw new Error("AUR0715");
    if (e.has(i)) throw new Error(`AUR0716:${i}`); else {
        e.add(i);
        t.removeAttribute(on);
    }
    return i;
}

function hn(t) {
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

const an = h.createInterface("ITemplateCompilerHooks");

const cn = new WeakMap;

const un = e.resource.keyFor("compiler-hooks");

const fn = Object.freeze({
    name: un,
    define(t) {
        let i = cn.get(t);
        if (void 0 === i) {
            cn.set(t, i = new TemplateCompilerHooksDefinition(t));
            s.define(un, i, t);
            e.resource.appendTo(t, un);
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
        t.register(c.singleton(an, this.Type));
    }
}

const dn = t => {
    return void 0 === t ? e : e(t);
    function e(t) {
        return fn.define(t);
    }
};

class BindingModeBehavior {
    constructor(t) {
        this.mode = t;
        this.ge = new Map;
    }
    bind(t, e, i) {
        this.ge.set(i, i.mode);
        i.mode = this.mode;
    }
    unbind(t, e, i) {
        i.mode = this.ge.get(i);
        this.ge.delete(i);
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

const vn = 200;

class DebounceBindingBehavior extends G {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: vn
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
            this.opts.delay = isNaN(i) ? vn : i;
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
        this.Gt = new Map;
        this.we = t;
    }
    bind(t, e, i, ...s) {
        if (!("handleChange" in i)) throw new Error("AUR0817");
        if (0 === s.length) throw new Error("AUR0818");
        this.Gt.set(i, s);
        let n;
        for (n of s) this.we.addSignalListener(n, i);
    }
    unbind(t, e, i) {
        const s = this.Gt.get(i);
        this.Gt.delete(i);
        let n;
        for (n of s) this.we.removeSignalListener(n, i);
    }
}

SignalBindingBehavior.inject = [ X ];

z("signal")(SignalBindingBehavior);

const mn = 200;

class ThrottleBindingBehavior extends G {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: mn
        };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.xe = t.locator.get(u);
        this.be = this.xe.taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.ye((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, i) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.xe.performanceNow();
        }
        this.binding.handleChange(t, e, i);
    }
    updateSource(t, e) {
        this.ye((() => this.binding.updateSource(t, e)));
    }
    ye(t) {
        const e = this.opts;
        const i = this.xe;
        const s = this.lastCall + e.delay - i.performanceNow();
        if (s > 0) {
            const n = this.task;
            e.delay = s;
            this.task = this.be.queueTask((() => {
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
            this.opts.delay = this.delay = isNaN(i) ? mn : i;
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

const pn = new DataAttributeAccessor;

class AttrBindingBehavior {
    bind(t, e, i) {
        i.targetObserver = pn;
    }
    unbind(t, e, i) {
        return;
    }
}

z("attr")(AttrBindingBehavior);

function gn(t) {
    const e = t.composedPath()[0];
    if (this.target !== e) return;
    return this.selfEventCallSource(t);
}

class SelfBindingBehavior {
    bind(t, e, i) {
        if (!i.callSource || !i.targetEvent) throw new Error("AUR0801");
        i.selfEventCallSource = i.callSource;
        i.callSource = gn;
    }
    unbind(t, e, i) {
        i.callSource = i.selfEventCallSource;
        i.selfEventCallSource = null;
    }
}

z("self")(SelfBindingBehavior);

const wn = Rt();

class AttributeNSAccessor {
    constructor(t) {
        this.ns = t;
        this.type = 2 | 4;
    }
    static forNs(t) {
        var e;
        return null !== (e = wn[t]) && void 0 !== e ? e : wn[t] = new AttributeNSAccessor(t);
    }
    getValue(t, e) {
        return t.getAttributeNS(this.ns, e);
    }
    setValue(t, e, i, s) {
        if (void 0 == t) i.removeAttributeNS(this.ns, s); else i.setAttributeNS(this.ns, s, t);
    }
}

function xn(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.value = void 0;
        this.t = void 0;
        this.ke = void 0;
        this.Ae = void 0;
        this.f = 0;
        this.obj = t;
        this.oL = s;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        const i = this.value;
        if (t === i) return;
        this.value = t;
        this.t = i;
        this.f = e;
        this.Ce();
        this.Re();
        this.queue.add(this);
    }
    handleCollectionChange(t, e) {
        this.Re();
    }
    handleChange(t, e, i) {
        this.Re();
    }
    Re() {
        const t = this.value;
        const e = this.obj;
        const i = St.call(e, "model") ? e.model : e.value;
        const s = "radio" === e.type;
        const n = void 0 !== e.matcher ? e.matcher : xn;
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
        let t = this.t = this.value;
        const e = this.obj;
        const i = St.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = void 0 !== e.matcher ? e.matcher : xn;
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
        this.value = t;
        this.queue.add(this);
    }
    start() {
        this.handler.subscribe(this.obj, this);
        this.Ce();
    }
    stop() {
        var t, e;
        this.handler.dispose();
        null === (t = this.ke) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.ke = void 0;
        null === (e = this.Ae) || void 0 === e ? void 0 : e.unsubscribe(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.start();
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.stop();
    }
    flush() {
        bn = this.t;
        this.t = this.value;
        this.subs.notify(this.value, bn, this.f);
    }
    Ce() {
        var t, e, i, s, n, r, o;
        const l = this.obj;
        null === (n = null !== (t = this.Ae) && void 0 !== t ? t : this.Ae = null !== (i = null === (e = l.$observers) || void 0 === e ? void 0 : e.model) && void 0 !== i ? i : null === (s = l.$observers) || void 0 === s ? void 0 : s.value) || void 0 === n ? void 0 : n.subscribe(this);
        null === (r = this.ke) || void 0 === r ? void 0 : r.unsubscribe(this);
        this.ke = void 0;
        if ("checkbox" === l.type) null === (o = this.ke = Pn(this.value, this.oL)) || void 0 === o ? void 0 : o.subscribe(this);
    }
}

P(CheckedObserver);

O(CheckedObserver);

let bn;

const yn = Object.prototype.hasOwnProperty;

const kn = {
    childList: true,
    subtree: true,
    characterData: true
};

function An(t, e) {
    return t === e;
}

class SelectValueObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.value = void 0;
        this.t = void 0;
        this._ = false;
        this.Se = void 0;
        this.Ee = void 0;
        this.v = false;
        this.obj = t;
        this.oL = s;
    }
    getValue() {
        return this.v ? this.value : this.obj.multiple ? Array.from(this.obj.options).map((t => t.value)) : this.obj.value;
    }
    setValue(t, e) {
        this.t = this.value;
        this.value = t;
        this._ = t !== this.t;
        this.Be(t instanceof Array ? t : null);
        if (0 === (256 & e)) this.N();
    }
    N() {
        if (this._) {
            this._ = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        this.syncOptions();
    }
    syncOptions() {
        var t;
        const e = this.value;
        const i = this.obj;
        const s = Array.isArray(e);
        const n = null !== (t = i.matcher) && void 0 !== t ? t : An;
        const r = i.options;
        let o = r.length;
        while (o-- > 0) {
            const t = r[o];
            const i = yn.call(t, "model") ? t.model : t.value;
            if (s) {
                t.selected = -1 !== e.findIndex((t => !!n(i, t)));
                continue;
            }
            t.selected = !!n(i, e);
        }
    }
    syncValue() {
        const t = this.obj;
        const e = t.options;
        const i = e.length;
        const s = this.value;
        let n = 0;
        if (t.multiple) {
            if (!(s instanceof Array)) return true;
            let r;
            const o = t.matcher || An;
            const l = [];
            while (n < i) {
                r = e[n];
                if (r.selected) l.push(yn.call(r, "model") ? r.model : r.value);
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
                r = yn.call(o, "model") ? o.model : o.value;
                break;
            }
            ++n;
        }
        this.t = this.value;
        this.value = r;
        return true;
    }
    Ie() {
        (this.Ee = new this.obj.ownerDocument.defaultView.MutationObserver(this.Te.bind(this))).observe(this.obj, kn);
        this.Be(this.value instanceof Array ? this.value : null);
        this.v = true;
    }
    De() {
        var t;
        this.Ee.disconnect();
        null === (t = this.Se) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.Ee = this.Se = void 0;
        this.v = false;
    }
    Be(t) {
        var e;
        null === (e = this.Se) || void 0 === e ? void 0 : e.unsubscribe(this);
        this.Se = void 0;
        if (null != t) {
            if (!this.obj.multiple) throw new Error("AUR0654");
            (this.Se = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    Te() {
        this.syncOptions();
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.obj, this);
            this.Ie();
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.handler.dispose();
            this.De();
        }
    }
    flush() {
        Cn = this.t;
        this.t = this.value;
        this.subs.notify(this.value, Cn, 0);
    }
}

P(SelectValueObserver);

O(SelectValueObserver);

let Cn;

const Rn = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = 2 | 4;
        this.value = "";
        this.t = "";
        this.styles = {};
        this.version = 0;
        this._ = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t, e) {
        this.value = t;
        this._ = t !== this.t;
        if (0 === (256 & e)) this.N();
    }
    Pe(t) {
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
    Oe(t) {
        let e;
        let i;
        const s = [];
        for (i in t) {
            e = t[i];
            if (null == e) continue;
            if ("string" === typeof e) {
                if (i.startsWith(Rn)) {
                    s.push([ i, e ]);
                    continue;
                }
                s.push([ r(i), e ]);
                continue;
            }
            s.push(...this.$e(e));
        }
        return s;
    }
    Le(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) i.push(...this.$e(t[s]));
            return i;
        }
        return l;
    }
    $e(t) {
        if ("string" === typeof t) return this.Pe(t);
        if (t instanceof Array) return this.Le(t);
        if (t instanceof Object) return this.Oe(t);
        return l;
    }
    N() {
        if (this._) {
            this._ = false;
            const t = this.value;
            const e = this.styles;
            const i = this.$e(t);
            let s;
            let n = this.version;
            this.t = t;
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
        this.value = this.t = this.obj.style.cssText;
    }
}

class ValueAttributeObserver {
    constructor(t, e, i) {
        this.key = e;
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.value = "";
        this.t = "";
        this._ = false;
        this.obj = t;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        if (Object.is(t, this.value)) return;
        this.t = this.value;
        this.value = t;
        this._ = true;
        if (!this.handler.config.readonly && 0 === (256 & e)) this.N(e);
    }
    N(t) {
        var e;
        if (this._) {
            this._ = false;
            this.obj[this.key] = null !== (e = this.value) && void 0 !== e ? e : this.handler.config.default;
            if (0 === (2 & t)) this.queue.add(this);
        }
    }
    handleEvent() {
        this.t = this.value;
        this.value = this.obj[this.key];
        if (this.t !== this.value) {
            this._ = false;
            this.queue.add(this);
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.obj, this);
            this.value = this.t = this.obj[this.key];
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.handler.dispose();
    }
    flush() {
        Sn = this.t;
        this.t = this.value;
        this.subs.notify(this.value, Sn, 0);
    }
}

P(ValueAttributeObserver);

O(ValueAttributeObserver);

let Sn;

const En = "http://www.w3.org/1999/xlink";

const Bn = "http://www.w3.org/XML/1998/namespace";

const In = "http://www.w3.org/2000/xmlns/";

const Tn = Object.assign(Rt(), {
    "xlink:actuate": [ "actuate", En ],
    "xlink:arcrole": [ "arcrole", En ],
    "xlink:href": [ "href", En ],
    "xlink:role": [ "role", En ],
    "xlink:show": [ "show", En ],
    "xlink:title": [ "title", En ],
    "xlink:type": [ "type", En ],
    "xml:lang": [ "lang", Bn ],
    "xml:space": [ "space", Bn ],
    xmlns: [ "xmlns", In ],
    "xmlns:xlink": [ "xlink", In ]
});

const Dn = new K;

Dn.type = 2 | 4;

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
        this.qe = Rt();
        this.Me = Rt();
        this.Ue = Rt();
        this.Fe = Rt();
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
        const r = this.qe;
        let o;
        if ("string" === typeof t) {
            o = null !== (s = r[t]) && void 0 !== s ? s : r[t] = Rt();
            if (null == o[e]) o[e] = new NodeObserverConfig(i); else On(t, e);
        } else for (const i in t) {
            o = null !== (n = r[i]) && void 0 !== n ? n : r[i] = Rt();
            const s = t[i];
            for (e in s) if (null == o[e]) o[e] = new NodeObserverConfig(s[e]); else On(i, e);
        }
    }
    useConfigGlobal(t, e) {
        const i = this.Me;
        if ("object" === typeof t) for (const e in t) if (null == i[e]) i[e] = new NodeObserverConfig(t[e]); else On("*", e); else if (null == i[t]) i[t] = new NodeObserverConfig(e); else On("*", t);
    }
    getAccessor(t, e, i) {
        var s;
        if (e in this.Fe || e in (null !== (s = this.Ue[t.tagName]) && void 0 !== s ? s : E)) return this.getObserver(t, e, i);
        switch (e) {
          case "src":
          case "href":
          case "role":
            return pn;

          default:
            {
                const i = Tn[e];
                if (void 0 !== i) return AttributeNSAccessor.forNs(i[1]);
                if (Bt(t, e, this.svgAnalyzer)) return pn;
                return Dn;
            }
        }
    }
    overrideAccessor(t, e) {
        var i, s;
        var n, r;
        let o;
        if ("string" === typeof t) {
            o = null !== (i = (n = this.Ue)[t]) && void 0 !== i ? i : n[t] = Rt();
            o[e] = true;
        } else for (const e in t) for (const i of t[e]) {
            o = null !== (s = (r = this.Ue)[e]) && void 0 !== s ? s : r[e] = Rt();
            o[i] = true;
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) this.Fe[e] = true;
    }
    getObserver(t, e, i) {
        var s, n;
        switch (e) {
          case "role":
            return pn;

          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const r = null !== (n = null === (s = this.qe[t.tagName]) || void 0 === s ? void 0 : s[e]) && void 0 !== n ? n : this.Me[e];
        if (null != r) return new r.type(t, e, new EventSubscriber(r), i, this.locator);
        const o = Tn[e];
        if (void 0 !== o) return AttributeNSAccessor.forNs(o[1]);
        if (Bt(t, e, this.svgAnalyzer)) return pn;
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) return this.dirtyChecker.createProperty(t, e);
            throw new Error(`AUR0652:${String(e)}`);
        } else return new Q(t, e);
    }
}

NodeObserverLocator.inject = [ B, It, Z, Tt ];

function Pn(t, e) {
    if (t instanceof Array) return e.getArrayObserver(t);
    if (t instanceof Map) return e.getMapObserver(t);
    if (t instanceof Set) return e.getSetObserver(t);
}

function On(t, e) {
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

let $n = class Focus {
    constructor(t, e) {
        this.Ve = t;
        this.p = e;
        this.je = false;
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) this.apply(); else this.je = true;
    }
    attached() {
        if (this.je) {
            this.je = false;
            this.apply();
        }
        const t = this.Ve;
        t.addEventListener("focus", this);
        t.addEventListener("blur", this);
    }
    afterDetachChildren() {
        const t = this.Ve;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if ("focus" === t.type) this.value = true; else if (!this.isElFocused) this.value = false;
    }
    apply() {
        const t = this.Ve;
        const e = this.isElFocused;
        const i = this.value;
        if (i && !e) t.focus(); else if (!i && e) t.blur();
    }
    get isElFocused() {
        return this.Ve === this.p.document.activeElement;
    }
};

rt([ lt({
    mode: D.twoWay
}) ], $n.prototype, "value", void 0);

$n = rt([ ot(0, Ei), ot(1, It) ], $n);

fe("focus")($n);

let Ln = class Show {
    constructor(t, e, i) {
        this.el = t;
        this.p = e;
        this.isActive = false;
        this.task = null;
        this.$val = "";
        this.$prio = "";
        this.update = () => {
            this.task = null;
            if (Boolean(this.value) !== this.isToggled) if (this.isToggled === this.base) {
                this.isToggled = !this.base;
                this.$val = this.el.style.getPropertyValue("display");
                this.$prio = this.el.style.getPropertyPriority("display");
                this.el.style.setProperty("display", "none", "important");
            } else {
                this.isToggled = this.base;
                this.el.style.setProperty("display", this.$val, this.$prio);
                if ("" === this.el.getAttribute("style")) this.el.removeAttribute("style");
            }
        };
        this.isToggled = this.base = "hide" !== i.alias;
    }
    binding() {
        this.isActive = true;
        this.update();
    }
    detaching() {
        var t;
        this.isActive = false;
        null === (t = this.task) || void 0 === t ? void 0 : t.cancel();
        this.task = null;
    }
    valueChanged() {
        if (this.isActive && null === this.task) this.task = this.p.domWriteQueue.queueTask(this.update);
    }
};

rt([ lt ], Ln.prototype, "value", void 0);

Ln = rt([ ot(0, Ei), ot(1, It), ot(2, Wi) ], Ln);

J("hide")(Ln);

fe("show")(Ln);

class Portal {
    constructor(t, e, i) {
        this.id = w("au$component");
        this.strict = false;
        this.p = i;
        this._e = i.document.createElement("div");
        this.view = t.create();
        Oi(this.view.nodes, e);
    }
    attaching(t, e, i) {
        if (null == this.callbackContext) this.callbackContext = this.$controller.scope.bindingContext;
        const s = this._e = this.Ne();
        this.view.setHost(s);
        return this.He(t, s, i);
    }
    detaching(t, e, i) {
        return this.We(t, this._e, i);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) return;
        const e = this._e;
        const i = this._e = this.Ne();
        if (e === i) return;
        this.view.setHost(i);
        const s = A(this.We(null, i, t.flags), (() => this.He(null, i, t.flags)));
        if (s instanceof Promise) s.catch((t => {
            throw t;
        }));
    }
    He(t, e, i) {
        const {activating: s, callbackContext: n, view: r} = this;
        r.setHost(e);
        return A(null === s || void 0 === s ? void 0 : s.call(n, e, r), (() => this.ze(t, e, i)));
    }
    ze(t, e, i) {
        const {$controller: s, view: n} = this;
        if (null === t) n.nodes.appendTo(e); else return A(n.activate(null !== t && void 0 !== t ? t : n, s, i, s.scope), (() => this.Ge(e)));
        return this.Ge(e);
    }
    Ge(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    We(t, e, i) {
        const {deactivating: s, callbackContext: n, view: r} = this;
        return A(null === s || void 0 === s ? void 0 : s.call(n, e, r), (() => this.Xe(t, e, i)));
    }
    Xe(t, e, i) {
        const {$controller: s, view: n} = this;
        if (null === t) n.nodes.remove(); else return A(n.deactivate(t, s, i), (() => this.Ke(e)));
        return this.Ke(e);
    }
    Ke(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    Ne() {
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

Portal.inject = [ Ge, Ii, It ];

rt([ lt({
    primary: true
}) ], Portal.prototype, "target", void 0);

rt([ lt({
    callback: "targetChanged"
}) ], Portal.prototype, "renderContext", void 0);

rt([ lt() ], Portal.prototype, "strict", void 0);

rt([ lt() ], Portal.prototype, "deactivating", void 0);

rt([ lt() ], Portal.prototype, "activating", void 0);

rt([ lt() ], Portal.prototype, "deactivated", void 0);

rt([ lt() ], Portal.prototype, "activated", void 0);

rt([ lt() ], Portal.prototype, "callbackContext", void 0);

de("portal")(Portal);

class FlagsTemplateController {
    constructor(t, e, i) {
        this.factory = t;
        this.flags = i;
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    attaching(t, e, i) {
        const {$controller: s} = this;
        return this.view.activate(t, s, i | this.flags, s.scope);
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

FrequentMutations.inject = [ Ge, Ii ];

class ObserveShallow extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 128);
    }
}

ObserveShallow.inject = [ Ge, Ii ];

de("frequent-mutations")(FrequentMutations);

de("observe-shallow")(ObserveShallow);

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
        this.Ye = false;
        this.Qe = 0;
    }
    attaching(t, e, i) {
        let s;
        const n = this.$controller;
        const r = this.Qe++;
        const o = () => !this.Ye && this.Qe === r + 1;
        return A(this.pending, (() => {
            var e;
            if (!o()) return;
            this.pending = void 0;
            if (this.value) s = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(i); else s = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(i);
            if (null == s) return;
            s.setLocation(this.location);
            this.pending = A(s.activate(t, n, i, n.scope), (() => {
                if (o()) this.pending = void 0;
            }));
        }));
    }
    detaching(t, e, i) {
        this.Ye = true;
        return A(this.pending, (() => {
            var e;
            this.Ye = false;
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
        const r = this.Qe++;
        const o = () => !this.Ye && this.Qe === r + 1;
        let l;
        return A(A(this.pending, (() => this.pending = A(null === s || void 0 === s ? void 0 : s.deactivate(s, n, i), (() => {
            var e;
            if (!o()) return;
            if (t) l = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(i); else l = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(i);
            if (null == l) return;
            l.setLocation(this.location);
            return A(l.activate(l, n, i, n.scope), (() => {
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

If.inject = [ Ge, Ii, Ci ];

rt([ lt ], If.prototype, "value", void 0);

rt([ lt({
    set: t => "" === t || !!t && "false" !== t
}) ], If.prototype, "cache", void 0);

de("if")(If);

class Else {
    constructor(t) {
        this.factory = t;
        this.id = w("au$component");
    }
    link(t, e, i, s, n) {
        const r = e.children;
        const o = r[r.length - 1];
        if (o instanceof If) o.elseFactory = this.factory; else if (o.viewModel instanceof If) o.viewModel.elseFactory = this.factory; else throw new Error("AUR0810");
    }
}

Else.inject = [ Ge ];

de({
    name: "else"
})(Else);

function qn(t) {
    t.dispose();
}

class Repeat {
    constructor(t, e, i) {
        this.location = t;
        this.parent = e;
        this.factory = i;
        this.id = w("au$component");
        this.Ze = void 0;
        this.views = [];
        this.key = void 0;
        this.Je = void 0;
    }
    binding(t, e, i) {
        this.ti(i);
        const s = this.parent.bindings;
        const n = s.length;
        let r;
        let o = 0;
        for (;n > o; ++o) {
            r = s[o];
            if (r.target === this && "items" === r.targetProperty) {
                this.forOf = r.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(i, this.$controller.scope, r.locator, null);
    }
    attaching(t, e, i) {
        this.ei(i);
        return this.ii(t, i);
    }
    detaching(t, e, i) {
        this.ti(i);
        return this.si(t, i);
    }
    itemsChanged(t) {
        const {$controller: e} = this;
        if (!e.isActive) return;
        t |= e.flags;
        this.ti(t);
        this.ei(t);
        const i = A(this.si(null, t), (() => this.ii(null, t)));
        if (i instanceof Promise) i.catch((t => {
            throw t;
        }));
    }
    handleCollectionChange(t, e) {
        const {$controller: i} = this;
        if (!i.isActive) return;
        e |= i.flags;
        this.ei(e);
        if (void 0 === t) {
            const t = A(this.si(null, e), (() => this.ii(null, e)));
            if (t instanceof Promise) t.catch((t => {
                throw t;
            }));
        } else {
            const i = this.views.length;
            tt(t);
            if (t.deletedItems.length > 0) {
                t.deletedItems.sort(I);
                const s = A(this.ni(t, e), (() => this.ri(i, t, e)));
                if (s instanceof Promise) s.catch((t => {
                    throw t;
                }));
            } else this.ri(i, t, e);
        }
    }
    ti(t) {
        const e = this.Ze;
        if (4 & t) {
            if (void 0 !== e) e.unsubscribe(this);
        } else if (this.$controller.isActive) {
            const t = this.Ze = et(this.items);
            if (e !== t && e) e.unsubscribe(this);
            if (t) t.subscribe(this);
        }
    }
    ei(t) {
        const e = this.items;
        if (e instanceof Array) {
            this.Je = e;
            return;
        }
        const i = this.forOf;
        if (void 0 === i) return;
        const s = [];
        this.forOf.iterate(t, e, ((t, e, i) => {
            s[e] = i;
        }));
        this.Je = s;
    }
    ii(t, e) {
        let i;
        let s;
        let n;
        let r;
        const {$controller: o, factory: l, local: h, location: a, items: c} = this;
        const u = o.scope;
        const f = this.forOf.count(e, c);
        const d = this.views = Array(f);
        this.forOf.iterate(e, c, ((c, v, m) => {
            n = d[v] = l.create(e).setLocation(a);
            n.nodes.unlink();
            r = U.fromParent(u, it.create(h, m));
            jn(r.overrideContext, v, f);
            s = n.activate(null !== t && void 0 !== t ? t : n, o, e, r);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }));
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    si(t, e) {
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
    ni(t, e) {
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
    ri(t, e, i) {
        var s;
        let n;
        let r;
        let o;
        let l;
        let h = 0;
        const {$controller: a, factory: c, local: u, Je: f, location: d, views: v} = this;
        const m = e.length;
        for (;m > h; ++h) if (-2 === e[h]) {
            o = c.create(i);
            v.splice(h, 0, o);
        }
        if (v.length !== m) throw new Error(`AUR0814:${v.length}!=${m}`);
        const p = a.scope;
        const g = e.length;
        st(v, e);
        const w = Vn(e);
        const x = w.length;
        let b;
        let y = x - 1;
        h = g - 1;
        for (;h >= 0; --h) {
            o = v[h];
            b = v[h + 1];
            o.nodes.link(null !== (s = null === b || void 0 === b ? void 0 : b.nodes) && void 0 !== s ? s : d);
            if (-2 === e[h]) {
                l = U.fromParent(p, it.create(u, f[h]));
                jn(l.overrideContext, h, g);
                o.setLocation(d);
                r = o.activate(o, a, i, l);
                if (r instanceof Promise) (null !== n && void 0 !== n ? n : n = []).push(r);
            } else if (y < 0 || 1 === x || h !== w[y]) {
                jn(o.scope.overrideContext, h, g);
                o.nodes.insertBefore(o.location);
            } else {
                if (t !== g) jn(o.scope.overrideContext, h, g);
                --y;
            }
        }
        if (void 0 !== n) return 1 === n.length ? n[0] : Promise.all(n);
    }
    dispose() {
        this.views.forEach(qn);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (void 0 !== e) for (let i = 0, s = e.length; i < s; ++i) if (true === e[i].accept(t)) return true;
    }
}

Repeat.inject = [ Ii, gi, Ge ];

rt([ lt ], Repeat.prototype, "items", void 0);

de("repeat")(Repeat);

let Mn = 16;

let Un = new Int32Array(Mn);

let Fn = new Int32Array(Mn);

function Vn(t) {
    const e = t.length;
    if (e > Mn) {
        Mn = e;
        Un = new Int32Array(e);
        Fn = new Int32Array(e);
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
            o = Un[i];
            n = t[o];
            if (-2 !== n && n < s) {
                Fn[r] = o;
                Un[++i] = r;
                continue;
            }
            l = 0;
            h = i;
            while (l < h) {
                a = l + h >> 1;
                n = t[Un[a]];
                if (-2 !== n && n < s) l = a + 1; else h = a;
            }
            n = t[Un[l]];
            if (s < n || -2 === n) {
                if (l > 0) Fn[r] = Un[l - 1];
                Un[l] = r;
            }
        }
    }
    r = ++i;
    const c = new Int32Array(r);
    s = Un[i - 1];
    while (i-- > 0) {
        c[i] = s;
        s = Fn[s];
    }
    while (r-- > 0) Un[r] = 0;
    return c;
}

function jn(t, e, i) {
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
        this.factory = t;
        this.location = e;
        this.id = w("au$component");
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
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

With.inject = [ Ge, Ii ];

rt([ lt ], With.prototype, "value", void 0);

de("with")(With);

let _n = class Switch {
    constructor(t, e) {
        this.factory = t;
        this.location = e;
        this.id = w("au$component");
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
    }
    link(t, e, i, s, n) {
        this.view = this.factory.create(t, this.$controller).setLocation(this.location);
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
        this.queue((() => this.handleCaseChange(t, e)));
    }
    handleCaseChange(t, e) {
        const i = t.isMatch(this.value, e);
        const s = this.activeCases;
        const n = s.length;
        if (!i) {
            if (n > 0 && s[0].id === t.id) return this.clearActiveCases(null, e);
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
        return A(this.clearActiveCases(null, e, r), (() => {
            this.activeCases = r;
            return this.activateCases(null, e);
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
        return A(this.activeCases.length > 0 ? this.clearActiveCases(t, e, s) : void 0, (() => {
            this.activeCases = s;
            if (0 === s.length) return;
            return this.activateCases(t, e);
        }));
    }
    activateCases(t, e) {
        const i = this.$controller;
        if (!i.isActive) return;
        const s = this.activeCases;
        const n = s.length;
        if (0 === n) return;
        const r = i.scope;
        if (1 === n) return s[0].activate(t, e, r);
        return C(...s.map((i => i.activate(t, e, r))));
    }
    clearActiveCases(t, e, i = []) {
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
        return A(C(...s.reduce(((s, n) => {
            if (!i.includes(n)) s.push(n.deactivate(t, e));
            return s;
        }), [])), (() => {
            s.length = 0;
        }));
    }
    queue(t) {
        const e = this.promise;
        let i;
        i = this.promise = A(A(e, t), (() => {
            if (this.promise === i) this.promise = void 0;
        }));
    }
    accept(t) {
        if (true === this.$controller.accept(t)) return true;
        if (this.activeCases.some((e => e.accept(t)))) return true;
    }
};

rt([ lt ], _n.prototype, "value", void 0);

_n = rt([ de("switch"), ot(0, Ge), ot(1, Ii) ], _n);

let Nn = class Case {
    constructor(t, e, i, s) {
        this.factory = t;
        this.locator = e;
        this.id = w("au$component");
        this.fallThrough = false;
        this.debug = s.config.level <= 1;
        this.logger = s.scopeTo(`${this.constructor.name}-#${this.id}`);
        this.view = this.factory.create().setLocation(i);
    }
    link(t, e, i, s, n) {
        const r = e.parent;
        const o = null === r || void 0 === r ? void 0 : r.viewModel;
        if (o instanceof _n) {
            this.$switch = o;
            this.linkToSwitch(o);
        } else throw new Error("AUR0815");
    }
    detaching(t, e, i) {
        return this.deactivate(t, i);
    }
    isMatch(t, e) {
        if (this.debug) this.logger.debug("isMatch()");
        const i = this.value;
        if (Array.isArray(i)) {
            if (void 0 === this.observer) this.observer = this.observeCollection(e, i);
            return i.includes(t);
        }
        return i === t;
    }
    valueChanged(t, e, i) {
        var s;
        if (Array.isArray(t)) {
            null === (s = this.observer) || void 0 === s ? void 0 : s.unsubscribe(this);
            this.observer = this.observeCollection(i, t);
        } else if (void 0 !== this.observer) this.observer.unsubscribe(this);
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
        null === (t = this.observer) || void 0 === t ? void 0 : t.unsubscribe(this);
        null === (e = this.view) || void 0 === e ? void 0 : e.dispose();
        this.view = void 0;
    }
    linkToSwitch(t) {
        t.cases.push(this);
    }
    observeCollection(t, e) {
        const i = this.locator.getArrayObserver(e);
        i.subscribe(this);
        return i;
    }
    accept(t) {
        var e;
        if (true === this.$controller.accept(t)) return true;
        return null === (e = this.view) || void 0 === e ? void 0 : e.accept(t);
    }
};

rt([ lt ], Nn.prototype, "value", void 0);

rt([ lt({
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
}) ], Nn.prototype, "fallThrough", void 0);

Nn = rt([ de("case"), ot(0, Ge), ot(1, F), ot(2, Ii), ot(3, k) ], Nn);

let Hn = class DefaultCase extends Nn {
    linkToSwitch(t) {
        if (void 0 !== t.defaultCase) throw new Error("AUR0816");
        t.defaultCase = this;
    }
};

Hn = rt([ de("default-case") ], Hn);

let Wn = class PromiseTemplateController {
    constructor(t, e, i, s) {
        this.factory = t;
        this.location = e;
        this.platform = i;
        this.id = w("au$component");
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.logger = s.scopeTo("promise.resolve");
    }
    link(t, e, i, s, n) {
        this.view = this.factory.create(t, this.$controller).setLocation(this.location);
    }
    attaching(t, e, i) {
        const s = this.view;
        const n = this.$controller;
        return A(s.activate(t, n, i, this.viewScope = U.fromParent(n.scope, {})), (() => this.swap(t, i)));
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
        const r = this.platform.domWriteQueue;
        const o = this.fulfilled;
        const l = this.rejected;
        const h = this.pending;
        const a = this.viewScope;
        let c;
        const u = {
            reusable: false
        };
        const f = () => {
            void C(c = (this.preSettledTask = r.queueTask((() => C(null === o || void 0 === o ? void 0 : o.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.activate(t, e, a))), u)).result, n.then((i => {
                if (this.value !== n) return;
                const s = () => {
                    this.postSettlePromise = (this.postSettledTask = r.queueTask((() => C(null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === o || void 0 === o ? void 0 : o.activate(t, e, a, i))), u)).result;
                };
                if (1 === this.preSettledTask.status) void c.then(s); else {
                    this.preSettledTask.cancel();
                    s();
                }
            }), (i => {
                if (this.value !== n) return;
                const s = () => {
                    this.postSettlePromise = (this.postSettledTask = r.queueTask((() => C(null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === o || void 0 === o ? void 0 : o.deactivate(t, e), null === l || void 0 === l ? void 0 : l.activate(t, e, a, i))), u)).result;
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

rt([ lt ], Wn.prototype, "value", void 0);

Wn = rt([ de("promise"), ot(0, Ge), ot(1, Ii), ot(2, It), ot(3, k) ], Wn);

let zn = class PendingTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        Kn(e).pending = this;
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

rt([ lt({
    mode: D.toView
}) ], zn.prototype, "value", void 0);

zn = rt([ de("pending"), ot(0, Ge), ot(1, Ii) ], zn);

let Gn = class FulfilledTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        Kn(e).fulfilled = this;
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

rt([ lt({
    mode: D.toView
}) ], Gn.prototype, "value", void 0);

Gn = rt([ de("then"), ot(0, Ge), ot(1, Ii) ], Gn);

let Xn = class RejectedTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = w("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        Kn(e).rejected = this;
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

rt([ lt({
    mode: D.toView
}) ], Xn.prototype, "value", void 0);

Xn = rt([ de("catch"), ot(0, Ge), ot(1, Ii) ], Xn);

function Kn(t) {
    const e = t.parent;
    const i = null === e || void 0 === e ? void 0 : e.viewModel;
    if (i instanceof Wn) return i;
    throw new Error("AUR0813");
}

let Yn = class PromiseAttributePattern {
    "promise.resolve"(t, e, i) {
        return new AttrSyntax(t, e, "promise", "bind");
    }
};

Yn = rt([ gt({
    pattern: "promise.resolve",
    symbols: ""
}) ], Yn);

let Qn = class FulfilledAttributePattern {
    then(t, e, i) {
        return new AttrSyntax(t, e, "then", "from-view");
    }
};

Qn = rt([ gt({
    pattern: "then",
    symbols: ""
}) ], Qn);

let Zn = class RejectedAttributePattern {
    catch(t, e, i) {
        return new AttrSyntax(t, e, "catch", "from-view");
    }
};

Zn = rt([ gt({
    pattern: "catch",
    symbols: ""
}) ], Zn);

function Jn(t, e, i, s) {
    if ("string" === typeof e) return tr(t, e, i, s);
    if (Se.isType(e)) return er(t, e, i, s);
    throw new Error(`Invalid Tag or Type.`);
}

class RenderPlan {
    constructor(t, e, i) {
        this.node = t;
        this.instructions = e;
        this.dependencies = i;
        this.oi = void 0;
    }
    get definition() {
        if (void 0 === this.oi) this.oi = CustomElementDefinition.create({
            name: Se.generateName(),
            template: this.node,
            needsCompile: "string" === typeof this.node,
            instructions: this.instructions,
            dependencies: this.dependencies
        });
        return this.oi;
    }
    createView(t) {
        return this.getViewFactory(t).create();
    }
    getViewFactory(t) {
        return t.root.get(ei).getViewFactory(this.definition, t.createChild().register(...this.dependencies));
    }
    mergeInto(t, e, i) {
        t.appendChild(this.node);
        e.push(...this.instructions);
        i.push(...this.dependencies);
    }
}

function tr(t, e, i, s) {
    const n = [];
    const r = [];
    const o = [];
    const l = t.document.createElement(e);
    let h = false;
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (zi(e)) {
            h = true;
            n.push(e);
        } else l.setAttribute(t, e);
    }));
    if (h) {
        l.className = "au";
        r.push(n);
    }
    if (s) ir(t, l, s, r, o);
    return new RenderPlan(l, r, o);
}

function er(t, e, i, s) {
    const n = Se.getDefinition(e);
    const r = [];
    const o = [ r ];
    const l = [];
    const h = [];
    const a = n.bindables;
    const c = t.document.createElement(n.name);
    c.className = "au";
    if (!l.includes(e)) l.push(e);
    r.push(new HydrateElementInstruction(n, void 0, h, null, false));
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (zi(e)) h.push(e); else if (void 0 === a[t]) h.push(new SetAttributeInstruction(e, t)); else h.push(new SetPropertyInstruction(e, t));
    }));
    if (s) ir(t, c, s, o, l);
    return new RenderPlan(c, o, l);
}

function ir(t, e, i, s, n) {
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

function sr(t, e) {
    const i = e.to;
    if (void 0 !== i && "subject" !== i && "composing" !== i) t[i] = e;
    return t;
}

let nr = class AuRender {
    constructor(t, e, i, s) {
        this.p = t;
        this.r = s;
        this.id = w("au$component");
        this.component = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.li = e.props.reduce(sr, {});
        this.hi = i;
    }
    attaching(t, e, i) {
        const {component: s, view: n} = this;
        if (void 0 === n || this.lastSubject !== s) {
            this.lastSubject = s;
            this.composing = true;
            return this.compose(void 0, s, t, i);
        }
        return this.compose(n, s, t, i);
    }
    detaching(t, e, i) {
        return this.Xe(this.view, t, i);
    }
    componentChanged(t, e, i) {
        const {$controller: s} = this;
        if (!s.isActive) return;
        if (this.lastSubject === t) return;
        this.lastSubject = t;
        this.composing = true;
        i |= s.flags;
        const n = A(this.Xe(this.view, null, i), (() => this.compose(void 0, t, null, i)));
        if (n instanceof Promise) n.catch((t => {
            throw t;
        }));
    }
    compose(t, e, i, s) {
        return A(void 0 === t ? A(e, (t => this.ai(t, s))) : t, (t => this.ze(this.view = t, i, s)));
    }
    Xe(t, e, i) {
        return null === t || void 0 === t ? void 0 : t.deactivate(null !== e && void 0 !== e ? e : t, this.$controller, i);
    }
    ze(t, e, i) {
        const {$controller: s} = this;
        return A(null === t || void 0 === t ? void 0 : t.activate(null !== e && void 0 !== e ? e : t, s, i, s.scope), (() => {
            this.composing = false;
        }));
    }
    ai(t, e) {
        const i = this.ui(t, e);
        if (i) {
            i.setLocation(this.$controller.location);
            i.lockScope(this.$controller.scope);
            return i;
        }
        return;
    }
    ui(t, e) {
        if (!t) return;
        const i = this.hi.controller.container;
        if ("object" === typeof t) {
            if (rr(t)) return t;
            if ("createView" in t) return t.createView(i);
            if ("create" in t) return t.create(e);
            if ("template" in t) return this.r.getViewFactory(CustomElementDefinition.getOrCreate(t), i).create(e);
        }
        if ("string" === typeof t) {
            const e = i.find(Se, t);
            if (null == e) throw new Error(`AUR0809:${t}`);
            t = e.Type;
        }
        return Jn(this.p, t, this.li, this.$controller.host.childNodes).createView(i);
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
};

rt([ lt ], nr.prototype, "component", void 0);

rt([ lt({
    mode: D.fromView
}) ], nr.prototype, "composing", void 0);

nr = rt([ be({
    name: "au-render",
    template: null,
    containerless: true
}), ot(0, It), ot(1, Wi), ot(2, wi), ot(3, ei) ], nr);

function rr(t) {
    return "lockScope" in t;
}

class AuCompose {
    constructor(t, e, i, s, n, r) {
        this.ctn = t;
        this.parent = e;
        this.host = i;
        this.p = s;
        this.scopeBehavior = "auto";
        this.c = void 0;
        this.loc = n.containerless ? $i(this.host) : void 0;
        this.r = t.get(ei);
        this.fi = n;
        this.di = r;
    }
    static get inject() {
        return [ g, gi, Ei, It, Wi, T(CompositionContextFactory) ];
    }
    get pending() {
        return this.pd;
    }
    get composition() {
        return this.c;
    }
    attaching(t, e, i) {
        return this.pd = A(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, t, void 0)), (t => {
            if (this.di.isCurrent(t)) this.pd = void 0;
        }));
    }
    detaching(t) {
        const e = this.c;
        const i = this.pd;
        this.di.invalidate();
        this.c = this.pd = void 0;
        return A(i, (() => null === e || void 0 === e ? void 0 : e.deactivate(t)));
    }
    propertyChanged(t) {
        if ("model" === t && null != this.c) {
            this.c.update(this.model);
            return;
        }
        this.pd = A(this.pd, (() => A(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, t)), (t => {
            if (this.di.isCurrent(t)) this.pd = void 0;
        }))));
    }
    queue(t) {
        const e = this.di;
        const i = this.c;
        return A(e.create(t), (s => {
            if (e.isCurrent(s)) return A(this.compose(s), (n => {
                if (e.isCurrent(s)) return A(n.activate(), (() => {
                    if (e.isCurrent(s)) {
                        this.c = n;
                        return A(null === i || void 0 === i ? void 0 : i.deactivate(t.initiator), (() => s));
                    } else return A(n.controller.deactivate(n.controller, this.$controller, 4), (() => {
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
        const {ctn: h, host: a, $controller: c, loc: u} = this;
        const f = this.getDef(r);
        const d = h.createChild();
        const v = null == u ? a.parentNode : u.parentNode;
        if (null !== f) {
            if (f.containerless) throw new Error("AUR0806");
            if (null == u) {
                i = a;
                s = () => {};
            } else {
                i = v.insertBefore(this.p.document.createElement(f.name), u);
                s = () => {
                    i.remove();
                };
            }
            e = this.getVm(d, r, i);
        } else {
            i = null == u ? a : u;
            e = this.getVm(d, r, i);
        }
        const m = () => {
            if (null !== f) {
                const n = Controller.$el(d, e, i, null, 0, f);
                return new CompositionController(n, (() => n.activate(null !== l && void 0 !== l ? l : n, c, 2)), (t => A(n.deactivate(null !== t && void 0 !== t ? t : n, c, 4), s)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: Se.generateName(),
                    template: n
                });
                const r = this.r.getViewFactory(s, d);
                const o = Controller.$view(r, 2, c);
                const h = "auto" === this.scopeBehavior ? U.fromParent(this.parent.scope, e) : U.create(e);
                if (Li(i)) o.setLocation(i); else o.setHost(i);
                return new CompositionController(o, (() => o.activate(null !== l && void 0 !== l ? l : o, c, 2, h)), (t => o.deactivate(null !== t && void 0 !== t ? t : o, c, 4)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            }
        };
        if ("activate" in e) return A(e.activate(o), (() => m())); else return m();
    }
    getVm(t, e, i) {
        if (null == e) return new EmptyComponent$1;
        if ("object" === typeof e) return e;
        const s = this.p;
        const n = Li(i);
        t.registerResolver(s.Element, t.registerResolver(Ei, new b("ElementResolver", n ? null : i)));
        t.registerResolver(Ii, new b("IRenderLocation", n ? i : null));
        const r = t.invoke(e);
        t.registerResolver(e, new b("au-compose.viewModel", r));
        return r;
    }
    getDef(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Se.isType(e) ? Se.getDefinition(e) : null;
    }
}

rt([ lt ], AuCompose.prototype, "view", void 0);

rt([ lt ], AuCompose.prototype, "viewModel", void 0);

rt([ lt ], AuCompose.prototype, "model", void 0);

rt([ lt({
    set: t => {
        if ("scoped" === t || "auto" === t) return t;
        throw new Error("AUR0805");
    }
}) ], AuCompose.prototype, "scopeBehavior", void 0);

be("au-compose")(AuCompose);

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
        return A(t.load(), (t => new CompositionContext(this.id++, t)));
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
        this.vi = null;
        this.mi = null;
        let o;
        const l = e.auSlot;
        const h = null === (r = null === (n = i.instruction) || void 0 === n ? void 0 : n.projections) || void 0 === r ? void 0 : r[l.name];
        if (null == h) {
            o = s.getViewFactory(l.fallback, i.controller.container);
            this.pi = false;
        } else {
            o = s.getViewFactory(h, i.parent.controller.container);
            this.pi = true;
        }
        this.hi = i;
        this.view = o.create().setLocation(t);
    }
    static get inject() {
        return [ Ii, Wi, wi, ei ];
    }
    binding(t, e, i) {
        var s;
        this.vi = this.$controller.scope.parentScope;
        let n;
        if (this.pi) {
            n = this.hi.controller.scope.parentScope;
            (this.mi = U.fromParent(n, n.bindingContext)).overrideContext.$host = null !== (s = this.expose) && void 0 !== s ? s : this.vi.bindingContext;
        }
    }
    attaching(t, e, i) {
        return this.view.activate(t, this.$controller, i, this.pi ? this.mi : this.vi);
    }
    detaching(t, e, i) {
        return this.view.deactivate(t, this.$controller, i);
    }
    exposeChanged(t) {
        if (this.pi && null != this.mi) this.mi.overrideContext.$host = t;
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

rt([ lt ], AuSlot.prototype, "expose", void 0);

be({
    name: "au-slot",
    template: null,
    containerless: true
})(AuSlot);

const or = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const lr = h.createInterface("ISanitizer", (t => t.singleton(class {
    sanitize(t) {
        return t.replace(or, "");
    }
})));

let hr = class SanitizeValueConverter {
    constructor(t) {
        this.sanitizer = t;
    }
    toView(t) {
        if (null == t) return null;
        return this.sanitizer.sanitize(t);
    }
};

hr = rt([ ot(0, lr) ], hr);

nt("sanitize")(hr);

let ar = class ViewValueConverter {
    constructor(t) {
        this.viewLocator = t;
    }
    toView(t, e) {
        return this.viewLocator.getViewComponentForObject(t, e);
    }
};

ar = rt([ ot(0, ti) ], ar);

nt("view")(ar);

const cr = DebounceBindingBehavior;

const ur = OneTimeBindingBehavior;

const fr = ToViewBindingBehavior;

const dr = FromViewBindingBehavior;

const vr = SignalBindingBehavior;

const mr = ThrottleBindingBehavior;

const pr = TwoWayBindingBehavior;

const gr = TemplateCompiler;

const wr = NodeObserverLocator;

const xr = [ gr, wr ];

const br = SVGAnalyzer;

const yr = Ct;

const kr = At;

const Ar = kt;

const Cr = yt;

const Rr = [ Ar, Cr ];

const Sr = [ yr, kr ];

const Er = Ms;

const Br = qs;

const Ir = Us;

const Tr = $s;

const Dr = Ps;

const Pr = Os;

const Or = Ls;

const $r = Ws;

const Lr = Fs;

const qr = Vs;

const Mr = js;

const Ur = _s;

const Fr = Hs;

const Vr = Ns;

const jr = [ Br, Dr, Tr, Pr, Or, Er, Ir, $r, Lr, qr, Mr, Fr, Vr, Ur ];

const _r = hr;

const Nr = ar;

const Hr = FrequentMutations;

const Wr = ObserveShallow;

const zr = If;

const Gr = Else;

const Xr = Repeat;

const Kr = With;

const Yr = _n;

const Qr = Nn;

const Zr = Hn;

const Jr = Wn;

const to = zn;

const eo = Gn;

const io = Xn;

const so = Yn;

const no = Qn;

const ro = Zn;

const oo = AttrBindingBehavior;

const lo = SelfBindingBehavior;

const ho = UpdateTriggerBindingBehavior;

const ao = nr;

const co = AuCompose;

const uo = Portal;

const fo = $n;

const vo = Ln;

const mo = [ cr, ur, fr, dr, vr, mr, pr, _r, Nr, Hr, Wr, zr, Gr, Xr, Kr, Yr, Qr, Zr, Jr, to, eo, io, so, no, ro, oo, lo, ho, ao, co, uo, fo, vo, AuSlot ];

const po = ns;

const go = es;

const wo = ts;

const xo = os;

const bo = hs;

const yo = ss;

const ko = ls;

const Ao = rs;

const Co = Ji;

const Ro = is;

const So = ds;

const Eo = ws;

const Bo = vs;

const Io = ms;

const To = ps;

const Do = gs;

const Po = fs;

const Oo = [ ko, bo, po, Ao, xo, Co, wo, go, Ro, yo, So, Eo, Bo, Io, To, Do, Po ];

const $o = {
    register(t) {
        return t.register(...xr, ...mo, ...Rr, ...jr, ...Oo);
    },
    createContainer() {
        return this.register(h.createContainer());
    }
};

const Lo = h.createInterface("IAurelia");

class Aurelia {
    constructor(t = h.createContainer()) {
        this.container = t;
        this.gi = false;
        this.wi = false;
        this.xi = false;
        this.bi = void 0;
        this.next = void 0;
        this.yi = void 0;
        this.ki = void 0;
        if (t.has(Lo, true)) throw new Error("AUR0768");
        t.registerResolver(Lo, new b("IAurelia", this));
        t.registerResolver(Ai, this.Ai = new b("IAppRoot"));
    }
    get isRunning() {
        return this.gi;
    }
    get isStarting() {
        return this.wi;
    }
    get isStopping() {
        return this.xi;
    }
    get root() {
        if (null == this.bi) {
            if (null == this.next) throw new Error("AUR0767");
            return this.next;
        }
        return this.bi;
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.Ci(t.host), this.container, this.Ai);
        return this;
    }
    enhance(t, e) {
        var i;
        const s = null !== (i = t.container) && void 0 !== i ? i : this.container.createChild();
        const n = t.host;
        const r = this.Ci(n);
        const o = t.component;
        let l;
        if ("function" === typeof o) {
            s.registerResolver(r.HTMLElement, s.registerResolver(r.Element, s.registerResolver(Ei, new b("ElementResolver", n))));
            l = s.invoke(o);
        } else l = o;
        s.registerResolver(Bi, new b("IEventTarget", n));
        e = null !== e && void 0 !== e ? e : null;
        const h = Controller.$el(s, l, n, null, void 0, CustomElementDefinition.create({
            name: Se.generateName(),
            template: n,
            enhance: true
        }));
        return A(h.activate(h, e, 2), (() => h));
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domWriteQueue.yield();
        await t.domReadQueue.yield();
        await t.taskQueue.yield();
    }
    Ci(e) {
        let i;
        if (!this.container.has(It, false)) {
            if (null === e.ownerDocument.defaultView) throw new Error("AUR0769");
            i = new t(e.ownerDocument.defaultView);
            this.container.register(c.instance(It, i));
        } else i = this.container.get(It);
        return i;
    }
    start(t = this.next) {
        if (null == t) throw new Error("AUR0770");
        if (this.yi instanceof Promise) return this.yi;
        return this.yi = A(this.stop(), (() => {
            Reflect.set(t.host, "$aurelia", this);
            this.Ai.prepare(this.bi = t);
            this.wi = true;
            return A(t.activate(), (() => {
                this.gi = true;
                this.wi = false;
                this.yi = void 0;
                this.Ri(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (this.ki instanceof Promise) return this.ki;
        if (true === this.gi) {
            const e = this.bi;
            this.gi = false;
            this.xi = true;
            return this.ki = A(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) e.dispose();
                this.bi = void 0;
                this.Ai.dispose();
                this.xi = false;
                this.Ri(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.gi || this.xi) throw new Error("AUR0771");
        this.container.dispose();
    }
    Ri(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

var qo;

(function(t) {
    t[t["Element"] = 1] = "Element";
    t[t["Attribute"] = 2] = "Attribute";
})(qo || (qo = {}));

const Mo = h.createInterface("IDialogService");

const Uo = h.createInterface("IDialogController");

const Fo = h.createInterface("IDialogDomRenderer");

const Vo = h.createInterface("IDialogDom");

const jo = h.createInterface("IDialogGlobalSettings");

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

var _o;

(function(t) {
    t["Ok"] = "ok";
    t["Error"] = "error";
    t["Cancel"] = "cancel";
    t["Abort"] = "abort";
})(_o || (_o = {}));

class DialogController {
    constructor(t, e) {
        this.p = t;
        this.ctn = e;
        this.closed = new Promise(((t, e) => {
            this.It = t;
            this.At = e;
        }));
    }
    static get inject() {
        return [ It, g ];
    }
    activate(t) {
        var e;
        const i = this.ctn.createChild();
        const {model: s, template: n, rejectOnCancel: r} = t;
        const o = i.get(Fo);
        const l = null !== (e = t.host) && void 0 !== e ? e : this.p.document.body;
        const h = this.dom = o.render(l, t);
        const a = i.has(Bi, true) ? i.get(Bi) : null;
        const u = h.contentHost;
        this.settings = t;
        if (null == a || !a.contains(l)) i.register(c.instance(Bi, l));
        i.register(c.instance(Ei, u), c.instance(Vo, h));
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
                if (r) throw No(null, "Dialog activation rejected");
                return DialogOpenResult.create(true, this);
            }
            const l = this.cmp;
            return A(null === (o = l.activate) || void 0 === o ? void 0 : o.call(l, s), (() => {
                var e;
                const s = this.controller = Controller.$el(i, l, u, null, 0, CustomElementDefinition.create(null !== (e = this.getDefinition(l)) && void 0 !== e ? e : {
                    name: Se.generateName(),
                    template: n
                }));
                return A(s.activate(s, null, 2), (() => {
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
        if (this.Si) return this.Si;
        let i = true;
        const {controller: s, dom: n, cmp: r, settings: {mouseEvent: o, rejectOnCancel: l}} = this;
        const h = DialogCloseResult.create(t, e);
        const a = new Promise((a => {
            var c, u;
            a(A(null !== (u = null === (c = r.canDeactivate) || void 0 === c ? void 0 : c.call(r, h)) && void 0 !== u ? u : true, (a => {
                var c;
                if (true !== a) {
                    i = false;
                    this.Si = void 0;
                    if (l) throw No(null, "Dialog cancellation rejected");
                    return DialogCloseResult.create("abort");
                }
                return A(null === (c = r.deactivate) || void 0 === c ? void 0 : c.call(r, h), (() => A(s.deactivate(s, null, 4), (() => {
                    n.dispose();
                    n.overlay.removeEventListener(null !== o && void 0 !== o ? o : "click", this);
                    if (!l && "error" !== t) this.It(h); else this.At(No(e, "Dialog cancelled with a rejection on cancel"));
                    return h;
                }))));
            })));
        })).catch((t => {
            this.Si = void 0;
            throw t;
        }));
        this.Si = i ? a : void 0;
        return a;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(t) {
        const e = Ho(t);
        return new Promise((t => {
            var i, s;
            return t(A(null === (s = (i = this.cmp).deactivate) || void 0 === s ? void 0 : s.call(i, DialogCloseResult.create("error", e)), (() => A(this.controller.deactivate(this.controller, null, 4), (() => {
                this.dom.dispose();
                this.At(e);
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
        t.registerResolver(n.HTMLElement, t.registerResolver(n.Element, t.registerResolver(Ei, new b("ElementResolver", i))));
        return t.invoke(s);
    }
    getDefinition(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Se.isType(e) ? Se.getDefinition(e) : null;
    }
}

class EmptyComponent {}

function No(t, e) {
    const i = new Error(e);
    i.wasCancelled = true;
    i.value = t;
    return i;
}

function Ho(t) {
    const e = new Error;
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor(t, e, i) {
        this.rt = t;
        this.p = e;
        this.Ei = i;
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
        return [ g, It, jo ];
    }
    static register(t) {
        t.register(c.singleton(Mo, this), te.beforeDeactivate(Mo, (t => A(t.closeAll(), (t => {
            if (t.length > 0) throw new Error(`AUR0901:${t.length}`);
        })))));
    }
    open(t) {
        return zo(new Promise((e => {
            var i;
            const s = DialogSettings.from(this.Ei, t);
            const n = null !== (i = s.container) && void 0 !== i ? i : this.rt.createChild();
            e(A(s.load(), (t => {
                const e = n.invoke(DialogController);
                n.register(c.instance(Uo, e));
                n.register(c.callback(DialogController, (() => {
                    throw new Error("AUR0902");
                })));
                return A(e.activate(t), (t => {
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
        const i = Go(e);
        if (null == i) return;
        const s = this.top;
        if (null === s || 0 === s.settings.keyboard.length) return;
        const n = s.settings.keyboard;
        if ("Escape" === i && n.includes(i)) void s.cancel(); else if ("Enter" === i && n.includes(i)) void s.ok();
    }
}

class DialogSettings {
    static from(...t) {
        return Object.assign(new DialogSettings, ...t).Ii().Bi();
    }
    load() {
        const t = this;
        const e = this.component;
        const i = this.template;
        const s = C(null == e ? void 0 : A(e(), (e => {
            t.component = e;
        })), "function" === typeof i ? A(i(), (e => {
            t.template = e;
        })) : void 0);
        return s instanceof Promise ? s.then((() => t)) : t;
    }
    Ii() {
        if (null == this.component && null == this.template) throw new Error("AUR0903");
        return this;
    }
    Bi() {
        if (null == this.keyboard) this.keyboard = this.lock ? [] : [ "Enter", "Escape" ];
        if ("boolean" !== typeof this.overlayDismiss) this.overlayDismiss = !this.lock;
        return this;
    }
}

function Wo(t, e) {
    return this.then((i => i.dialog.closed.then(t, e)), e);
}

function zo(t) {
    t.whenClosed = Wo;
    return t;
}

function Go(t) {
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
        c.singleton(jo, this).register(t);
    }
}

const Xo = "position:absolute;width:100%;height:100%;top:0;left:0;";

class DefaultDialogDomRenderer {
    constructor(t) {
        this.p = t;
        this.wrapperCss = `${Xo} display:flex;`;
        this.overlayCss = Xo;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        c.singleton(Fo, this).register(t);
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

DefaultDialogDomRenderer.inject = [ It ];

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

function Ko(t, e) {
    return {
        settingsProvider: t,
        register: i => i.register(...e, te.beforeCreate((() => t(i.get(jo))))),
        customize(t, i) {
            return Ko(t, null !== i && void 0 !== i ? i : e);
        }
    };
}

const Yo = Ko((() => {
    throw new Error("AUR0904");
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(c.singleton(jo, this));
    }
} ]);

const Qo = Ko(o, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer ]);

export { AdoptedStyleSheetsStyles, AppRoot, te as AppTask, Ct as AtPrefixedTriggerAttributePattern, yr as AtPrefixedTriggerAttributePatternRegistration, AttrBindingBehavior, oo as AttrBindingBehaviorRegistration, _s as AttrBindingCommand, Ur as AttrBindingCommandRegistration, AttrSyntax, AttributeBinding, AttributeBindingInstruction, Eo as AttributeBindingRendererRegistration, AttributeNSAccessor, bt as AttributePattern, AuCompose, nr as AuRender, ao as AuRenderRegistration, AuSlot, AuSlotsInfo, Aurelia, ct as Bindable, BindableDefinition, BindableObserver, BindablesInfo, Ds as BindingCommand, BindingCommandDefinition, BindingModeBehavior, CSSModulesProcessorRegistry, CallBinding, Ms as CallBindingCommand, Er as CallBindingCommandRegistration, CallBindingInstruction, po as CallBindingRendererRegistration, js as CaptureBindingCommand, Mr as CaptureBindingCommandRegistration, Nn as Case, CheckedObserver, re as Children, ChildrenDefinition, ChildrenObserver, ClassAttributeAccessor, Hs as ClassBindingCommand, Fr as ClassBindingCommandRegistration, At as ColonPrefixedBindAttributePattern, kr as ColonPrefixedBindAttributePatternRegistration, ComputedWatcher, Controller, me as CustomAttribute, CustomAttributeDefinition, go as CustomAttributeRendererRegistration, Se as CustomElement, CustomElementDefinition, wo as CustomElementRendererRegistration, DataAttributeAccessor, DebounceBindingBehavior, cr as DebounceBindingBehaviorRegistration, qs as DefaultBindingCommand, Br as DefaultBindingCommandRegistration, jr as DefaultBindingLanguage, Rr as DefaultBindingSyntax, Hn as DefaultCase, xr as DefaultComponents, DefaultDialogDom, DefaultDialogDomRenderer, DefaultDialogGlobalSettings, Oo as DefaultRenderers, mo as DefaultResources, qo as DefinitionType, Vs as DelegateBindingCommand, qr as DelegateBindingCommandRegistration, DialogCloseResult, Yo as DialogConfiguration, DialogController, _o as DialogDeactivationStatuses, Qo as DialogDefaultConfiguration, DialogOpenResult, DialogService, yt as DotSeparatedAttributePattern, Cr as DotSeparatedAttributePatternRegistration, Else, Gr as ElseRegistration, EventDelegator, EventSubscriber, ExpressionWatcher, $n as Focus, Us as ForBindingCommand, Ir as ForBindingCommandRegistration, FragmentNodeSequence, FrequentMutations, FromViewBindingBehavior, dr as FromViewBindingBehaviorRegistration, $s as FromViewBindingCommand, Tr as FromViewBindingCommandRegistration, Gn as FulfilledTemplateController, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, Ai as IAppRoot, Jt as IAppTask, Pt as IAttrMapper, pt as IAttributeParser, mt as IAttributePattern, Ni as IAuSlotsInfo, Lo as IAurelia, gi as IController, Uo as IDialogController, Vo as IDialogDom, Fo as IDialogDomRenderer, jo as IDialogGlobalSettings, Mo as IDialogService, ji as IEventDelegator, Bi as IEventTarget, Ui as IHistory, wi as IHydrationContext, Wi as IInstruction, _e as ILifecycleHooks, Mi as ILocation, Ei as INode, wr as INodeObserverLocatorRegistration, It as IPlatform, _i as IProjections, Ii as IRenderLocation, Xi as IRenderer, ei as IRendering, Tt as ISVGAnalyzer, lr as ISanitizer, qe as IShadowDOMGlobalStyles, $e as IShadowDOMStyleFactory, Le as IShadowDOMStyles, ft as ISyntaxInterpreter, Gi as ITemplateCompiler, an as ITemplateCompilerHooks, gr as ITemplateCompilerRegistration, zs as ITemplateElementFactory, Ge as IViewFactory, ti as IViewLocator, qi as IWindow, Ci as IWorkTracker, If, zr as IfRegistration, Hi as InstructionType, InterpolationBinding, xo as InterpolationBindingRendererRegistration, InterpolationInstruction, Interpretation, IteratorBindingInstruction, bo as IteratorBindingRendererRegistration, LetBinding, LetBindingInstruction, yo as LetElementRendererRegistration, We as LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, Listener, ListenerBindingInstruction, So as ListenerBindingRendererRegistration, NodeObserverConfig, NodeObserverLocator, Ti as NodeType, NoopSVGAnalyzer, ObserveShallow, OneTimeBindingBehavior, ur as OneTimeBindingBehaviorRegistration, Ps as OneTimeBindingCommand, Dr as OneTimeBindingCommandRegistration, zn as PendingTemplateController, Portal, Wn as PromiseTemplateController, PropertyBinding, PropertyBindingInstruction, ko as PropertyBindingRendererRegistration, kt as RefAttributePattern, Ar as RefAttributePatternRegistration, RefBinding, $r as RefBindingCommandRegistration, RefBindingInstruction, Ao as RefBindingRendererRegistration, Xn as RejectedTemplateController, RenderPlan, Rendering, Repeat, Xr as RepeatRegistration, SVGAnalyzer, br as SVGAnalyzerRegistration, hr as SanitizeValueConverter, _r as SanitizeValueConverterRegistration, SelectValueObserver, SelfBindingBehavior, lo as SelfBindingBehaviorRegistration, SetAttributeInstruction, Bo as SetAttributeRendererRegistration, SetClassAttributeInstruction, Io as SetClassAttributeRendererRegistration, SetPropertyInstruction, Co as SetPropertyRendererRegistration, SetStyleAttributeInstruction, To as SetStyleAttributeRendererRegistration, ShadowDOMRegistry, Sr as ShortHandBindingSyntax, SignalBindingBehavior, vr as SignalBindingBehaviorRegistration, $o as StandardConfiguration, StyleAttributeAccessor, Ns as StyleBindingCommand, Vr as StyleBindingCommandRegistration, Me as StyleConfiguration, StyleElementStyles, StylePropertyBindingInstruction, Do as StylePropertyBindingRendererRegistration, _n as Switch, TemplateCompiler, fn as TemplateCompilerHooks, Ro as TemplateControllerRendererRegistration, TextBindingInstruction, Po as TextBindingRendererRegistration, ThrottleBindingBehavior, mr as ThrottleBindingBehaviorRegistration, ToViewBindingBehavior, fr as ToViewBindingBehaviorRegistration, Os as ToViewBindingCommand, Pr as ToViewBindingCommandRegistration, Fs as TriggerBindingCommand, Lr as TriggerBindingCommandRegistration, TwoWayBindingBehavior, pr as TwoWayBindingBehaviorRegistration, Ls as TwoWayBindingCommand, Or as TwoWayBindingCommandRegistration, UpdateTriggerBindingBehavior, ho as UpdateTriggerBindingBehaviorRegistration, ValueAttributeObserver, ViewFactory, ViewLocator, vi as ViewModelKind, ar as ViewValueConverter, Nr as ViewValueConverterRegistration, Ze as Views, xe as Watch, With, Kr as WithRegistration, Xs as allResources, gt as attributePattern, lt as bindable, Is as bindingCommand, ie as children, ke as containerless, $i as convertToRenderLocation, Jn as createElement, Pe as cssModules, fe as customAttribute, be as customElement, Pi as getEffectiveParentNode, Ri as getRef, ui as isCustomElementController, fi as isCustomElementViewModel, zi as isInstruction, Li as isRenderLocation, ze as lifecycleHooks, Be as processContent, Ki as renderer, Oi as setEffectiveParentNode, Si as setRef, Oe as shadowCSS, dn as templateCompilerHooks, de as templateController, ye as useShadowDOM, Je as view, pe as watch };
//# sourceMappingURL=index.js.map
