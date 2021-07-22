export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "@aurelia/platform";

import { BrowserPlatform as t } from "@aurelia/platform-browser";

export { BrowserPlatform } from "@aurelia/platform-browser";

import { Protocol as e, getPrototypeChain as i, Metadata as s, firstDefined as n, kebabCase as o, noop as r, emptyArray as l, DI as h, all as a, Registration as c, IPlatform as u, mergeArrays as f, fromDefinitionOrDefault as d, pascalCase as m, fromAnnotationOrTypeOrDefault as v, fromAnnotationOrDefinitionOrTypeOrDefault as p, IContainer as g, nextId as w, optional as b, InstanceProvider as y, ILogger as x, isObject as k, onResolve as C, resolveAll as A, camelCase as S, toArray as E, emptyObject as B, IServiceLocator as T, compareNumber as I, transient as R } from "@aurelia/kernel";

import { BindingMode as D, subscriberCollection as P, withFlushQueue as O, connectable as $, registerAliases as L, ConnectableSwitcher as q, ProxyObservable as M, Scope as F, IObserverLocator as V, IExpressionParser as j, AccessScopeExpression as _, DelegationStrategy as N, BindingBehaviorExpression as H, BindingBehaviorFactory as W, PrimitiveLiteralExpression as U, bindingBehavior as z, BindingInterceptor as G, ISignaler as X, PropertyAccessor as K, INodeObserverLocator as Y, SetterObserver as Q, IDirtyChecker as Z, alias as J, applyMutationsToIndices as tt, getCollectionObserver as et, BindingContext as it, synchronizeIndices as st, valueConverter as nt } from "@aurelia/runtime";

export { Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, BindingMode, BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Char, CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, CustomExpression, DelegationStrategy, DirtyCheckProperty, DirtyCheckSettings, ExpressionKind, ForOfStatement, HtmlLiteralExpression, IDirtyChecker, IExpressionParser, INodeObserverLocator, IObserverLocator, ISignaler, Interpolation, LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, ObserverLocator, OverrideContext, ParserState, Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Scope, SetObserver, SetterObserver, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverter, ValueConverterDefinition, ValueConverterExpression, alias, applyMutationsToIndices, bindingBehavior, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, isIndexMap, observable, parse, parseExpression, registerAliases, subscriberCollection, synchronizeIndices, valueConverter } from "@aurelia/runtime";

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
***************************************************************************** */ function ot(t, e, i, s) {
    var n = arguments.length, o = n < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, i) : s, r;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) o = Reflect.decorate(t, e, i, s); else for (var l = t.length - 1; l >= 0; l--) if (r = t[l]) o = (n < 3 ? r(o) : n > 3 ? r(e, i, o) : r(e, i)) || o;
    return n > 3 && o && Object.defineProperty(e, i, o), o;
}

function rt(t, e) {
    return function(i, s) {
        e(i, s, t);
    };
}

function lt(t, i) {
    let n;
    function o(t, i) {
        if (arguments.length > 1) n.property = i;
        s.define(ct.name, BindableDefinition.create(i, n), t.constructor, i);
        e.annotation.appendTo(t.constructor, ct.keyFrom(i));
    }
    if (arguments.length > 1) {
        n = {};
        o(t, i);
        return;
    } else if ("string" === typeof t) {
        n = {};
        return o;
    }
    n = void 0 === t ? {} : t;
    return o;
}

function ht(t) {
    return t.startsWith(ct.name);
}

const at = e.annotation.keyFor("bindable");

const ct = {
    name: at,
    keyFrom(t) {
        return `${ct.name}:${t}`;
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
        function o(t) {
            if (i(t)) t.forEach(s); else if (t instanceof BindableDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t[e])));
        }
        t.forEach(o);
        return e;
    },
    for(t) {
        let i;
        const n = {
            add(o) {
                let r;
                let l;
                if ("string" === typeof o) {
                    r = o;
                    l = {
                        property: r
                    };
                } else {
                    r = o.property;
                    l = o;
                }
                i = BindableDefinition.create(r, l);
                if (!s.hasOwn(at, t, r)) e.annotation.appendTo(t, ct.keyFrom(r));
                s.define(at, i, t, r);
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
        const n = ct.name.length + 1;
        const o = [];
        const r = i(t);
        let l = r.length;
        let h = 0;
        let a;
        let c;
        let u;
        let f;
        while (--l >= 0) {
            u = r[l];
            a = e.annotation.getKeys(u).filter(ht);
            c = a.length;
            for (f = 0; f < c; ++f) o[h++] = s.getOwn(at, u, a[f].slice(n));
        }
        return o;
    }
};

class BindableDefinition {
    constructor(t, e, i, s, n, o) {
        this.attribute = t;
        this.callback = e;
        this.mode = i;
        this.primary = s;
        this.property = n;
        this.set = o;
    }
    static create(t, e = {}) {
        return new BindableDefinition(n(e.attribute, o(t)), n(e.callback, `${t}Changed`), n(e.mode, D.toView), n(e.primary, false), n(e.property, t), n(e.set, r));
    }
}

class BindableObserver {
    constructor(t, e, i, s, n) {
        this.obj = t;
        this.propertyKey = e;
        this.set = s;
        this.$controller = n;
        this.value = void 0;
        this.oldValue = void 0;
        this.f = 0;
        const o = t[i];
        const l = t.propertyChanged;
        const h = this.hasCb = "function" === typeof o;
        const a = this.hasCbAll = "function" === typeof l;
        const c = this.hasSetter = s !== r;
        this.cb = h ? o : r;
        this.cbAll = a ? l : r;
        if (void 0 === this.cb && !a && !c) this.observing = false; else {
            this.observing = true;
            const i = t[e];
            this.value = c && void 0 !== i ? s(i) : i;
            this.t();
        }
    }
    get type() {
        return 1;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        if (this.hasSetter) t = this.set(t);
        if (this.observing) {
            const i = this.value;
            if (Object.is(t, i)) return;
            this.value = t;
            this.oldValue = i;
            this.f = e;
            if (null == this.$controller || this.$controller.isBound) {
                if (this.hasCb) this.cb.call(this.obj, t, i, e);
                if (this.hasCbAll) this.cbAll.call(this.obj, this.propertyKey, t, i, e);
            }
            this.queue.add(this);
        } else this.obj[this.propertyKey] = t;
    }
    subscribe(t) {
        if (false === !this.observing) {
            this.observing = true;
            const t = this.obj[this.propertyKey];
            this.value = this.hasSetter ? this.set(t) : t;
            this.t();
        }
        this.subs.add(t);
    }
    flush() {
        ut = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, ut, this.f);
    }
    t() {
        Reflect.defineProperty(this.obj, this.propertyKey, {
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
            this.has = this.i;
            break;

          case 1:
            this.has = this.o;
            break;

          default:
            this.has = this.l;
        } else switch (t.length) {
          case 0:
            this.has = this.u;
            break;

          case 1:
            this.has = this.v;
            break;

          default:
            this.has = this.C;
        }
    }
    equals(t) {
        return this.chars === t.chars && this.repeat === t.repeat && this.isSymbol === t.isSymbol && this.isInverted === t.isInverted;
    }
    C(t) {
        return this.chars.includes(t);
    }
    v(t) {
        return this.chars === t;
    }
    u(t) {
        return false;
    }
    l(t) {
        return !this.chars.includes(t);
    }
    o(t) {
        return this.chars !== t;
    }
    i(t) {
        return true;
    }
}

class Interpretation {
    constructor() {
        this.parts = l;
        this.A = "";
        this.S = {};
        this.B = {};
    }
    get pattern() {
        const t = this.A;
        if ("" === t) return null; else return t;
    }
    set pattern(t) {
        if (null == t) {
            this.A = "";
            this.parts = l;
        } else {
            this.A = t;
            this.parts = this.B[t];
        }
    }
    append(t, e) {
        const {S: i} = this;
        if (void 0 === i[t]) i[t] = e; else i[t] += e;
    }
    next(t) {
        const {S: e} = this;
        if (void 0 !== e[t]) {
            const {B: i} = this;
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
        for (let n = 0; n < i; ++n) {
            s = e[n];
            if (t.equals(s.charSpec)) return s;
        }
        return null;
    }
    append(t, e) {
        const {patterns: i} = this;
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
        let o = 0;
        let r = null;
        let l = 0;
        let h = 0;
        for (;l < n; ++l) {
            r = s[l];
            if (r.charSpec.has(t)) {
                i.push(r);
                o = r.patterns.length;
                h = 0;
                if (r.charSpec.isSymbol) for (;h < o; ++h) e.next(r.patterns[h]); else for (;h < o; ++h) e.append(r.patterns[h], t);
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
        for (let s = 0; s < e; ++s) i.push(new CharSpec(t[s], false, false, false));
    }
    eachChar(t) {
        const {len: e, specs: i} = this;
        for (let s = 0; s < e; ++s) t(i[s]);
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
        let e = 0;
        if (Array.isArray(t)) {
            const i = t.length;
            for (;e < i; ++e) this.add(t[e]);
            return;
        }
        let i = this.rootState;
        const s = t;
        const n = s.pattern;
        const o = new SegmentTypes;
        const r = this.parse(s, o);
        const l = r.length;
        const h = t => {
            i = i.append(t, n);
        };
        for (e = 0; e < l; ++e) r[e].eachChar(h);
        i.types = o;
        i.isEndpoint = true;
    }
    interpret(t) {
        const e = new Interpretation;
        let i = this.initialStates;
        const s = t.length;
        for (let n = 0; n < s; ++n) {
            i = this.getNextStates(i, t.charAt(n), e);
            if (0 === i.length) break;
        }
        i.sort(((t, e) => {
            if (t.isEndpoint) {
                if (!e.isEndpoint) return -1;
            } else if (e.isEndpoint) return 1; else return 0;
            const i = t.types;
            const s = e.types;
            if (i.statics !== s.statics) return s.statics - i.statics;
            if (i.dynamics !== s.dynamics) return s.dynamics - i.dynamics;
            if (i.symbols !== s.symbols) return s.symbols - i.symbols;
            return 0;
        }));
        if (i.length > 0) {
            const t = i[0];
            if (!t.charSpec.isSymbol) e.next(t.pattern);
            e.pattern = t.pattern;
        }
        return e;
    }
    getNextStates(t, e, i) {
        const s = [];
        let n = null;
        const o = t.length;
        for (let r = 0; r < o; ++r) {
            n = t[r];
            s.push(...n.findMatches(e, i));
        }
        return s;
    }
    parse(t, e) {
        const i = [];
        const s = t.pattern;
        const n = s.length;
        let o = 0;
        let r = 0;
        let l = "";
        while (o < n) {
            l = s.charAt(o);
            if (!t.symbols.includes(l)) if (o === r) if ("P" === l && "PART" === s.slice(o, o + 4)) {
                r = o += 4;
                i.push(new DynamicSegment(t.symbols));
                ++e.dynamics;
            } else ++o; else ++o; else if (o !== r) {
                i.push(new StaticSegment(s.slice(r, o)));
                ++e.statics;
                r = o;
            } else {
                i.push(new SymbolSegment(s.slice(r, o + 1)));
                ++e.symbols;
                r = ++o;
            }
        }
        if (r !== o) {
            i.push(new StaticSegment(s.slice(r, o)));
            ++e.statics;
        }
        return i;
    }
}

class AttrSyntax {
    constructor(t, e, i, s) {
        this.rawName = t;
        this.rawValue = e;
        this.target = i;
        this.command = s;
    }
}

const dt = h.createInterface("IAttributePattern");

const mt = h.createInterface("IAttributeParser", (t => t.singleton(AttributeParser)));

class AttributeParser {
    constructor(t, e) {
        this.T = {};
        this.I = t;
        const i = this.R = {};
        e.forEach((e => {
            const s = wt.getPatternDefinitions(e.constructor);
            t.add(s);
            s.forEach((t => {
                i[t.pattern] = e;
            }));
        }));
    }
    parse(t, e) {
        let i = this.T[t];
        if (null == i) i = this.T[t] = this.I.interpret(t);
        const s = i.pattern;
        if (null == s) return new AttrSyntax(t, e, t, null); else return this.R[s][s](t, e, i.parts);
    }
}

AttributeParser.inject = [ ft, a(dt) ];

function vt(...t) {
    return function e(i) {
        return wt.define(t, i);
    };
}

class AttributePatternResourceDefinition {
    constructor(t) {
        this.Type = t;
        this.name = void 0;
    }
    register(t) {
        c.singleton(dt, this.Type).register(t);
    }
}

const pt = e.resource.keyFor("attribute-pattern");

const gt = "attribute-pattern-definitions";

const wt = Object.freeze({
    name: pt,
    definitionAnnotationKey: gt,
    define(t, i) {
        const n = new AttributePatternResourceDefinition(i);
        s.define(pt, n, i);
        e.resource.appendTo(i, pt);
        e.annotation.set(i, gt, t);
        e.annotation.appendTo(i, gt);
        return i;
    },
    getPatternDefinitions(t) {
        return e.annotation.get(t, gt);
    }
});

let bt = class DotSeparatedAttributePattern {
    "PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[1]);
    }
    "PART.PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[2]);
    }
};

bt = ot([ vt({
    pattern: "PART.PART",
    symbols: "."
}, {
    pattern: "PART.PART.PART",
    symbols: "."
}) ], bt);

let yt = class RefAttributePattern {
    ref(t, e, i) {
        return new AttrSyntax(t, e, "element", "ref");
    }
    "PART.ref"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "ref");
    }
};

yt = ot([ vt({
    pattern: "ref",
    symbols: ""
}, {
    pattern: "PART.ref",
    symbols: "."
}) ], yt);

let xt = class ColonPrefixedBindAttributePattern {
    ":PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "bind");
    }
};

xt = ot([ vt({
    pattern: ":PART",
    symbols: ":"
}) ], xt);

let kt = class AtPrefixedTriggerAttributePattern {
    "@PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "trigger");
    }
};

kt = ot([ vt({
    pattern: "@PART",
    symbols: "@"
}) ], kt);

const Ct = () => Object.create(null);

const At = Object.prototype.hasOwnProperty;

const St = Ct();

const Et = (t, e, i) => {
    if (true === St[e]) return true;
    if ("string" !== typeof e) return false;
    const s = e.slice(0, 5);
    return St[e] = "aria-" === s || "data-" === s || i.isStandardSvgAttribute(t, e);
};

const Bt = u;

const Tt = h.createInterface("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

function It(t) {
    const e = Ct();
    let i;
    for (i of t) e[i] = true;
    return e;
}

class SVGAnalyzer {
    constructor(t) {
        this.D = Object.assign(Ct(), {
            a: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "target", "transform", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            altGlyph: It([ "class", "dx", "dy", "externalResourcesRequired", "format", "glyphRef", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            altglyph: Ct(),
            altGlyphDef: It([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphdef: Ct(),
            altGlyphItem: It([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphitem: Ct(),
            animate: It([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateColor: It([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateMotion: It([ "accumulate", "additive", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keyPoints", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "origin", "path", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "rotate", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateTransform: It([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "type", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            circle: It([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "r", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            clipPath: It([ "class", "clipPathUnits", "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            "color-profile": It([ "id", "local", "name", "rendering-intent", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            cursor: It([ "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            defs: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            desc: It([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            ellipse: It([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            feBlend: It([ "class", "height", "id", "in", "in2", "mode", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feColorMatrix: It([ "class", "height", "id", "in", "result", "style", "type", "values", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComponentTransfer: It([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComposite: It([ "class", "height", "id", "in", "in2", "k1", "k2", "k3", "k4", "operator", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feConvolveMatrix: It([ "bias", "class", "divisor", "edgeMode", "height", "id", "in", "kernelMatrix", "kernelUnitLength", "order", "preserveAlpha", "result", "style", "targetX", "targetY", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDiffuseLighting: It([ "class", "diffuseConstant", "height", "id", "in", "kernelUnitLength", "result", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDisplacementMap: It([ "class", "height", "id", "in", "in2", "result", "scale", "style", "width", "x", "xChannelSelector", "xml:base", "xml:lang", "xml:space", "y", "yChannelSelector" ]),
            feDistantLight: It([ "azimuth", "elevation", "id", "xml:base", "xml:lang", "xml:space" ]),
            feFlood: It([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feFuncA: It([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncB: It([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncG: It([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncR: It([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feGaussianBlur: It([ "class", "height", "id", "in", "result", "stdDeviation", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feImage: It([ "class", "externalResourcesRequired", "height", "id", "preserveAspectRatio", "result", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMerge: It([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMergeNode: It([ "id", "xml:base", "xml:lang", "xml:space" ]),
            feMorphology: It([ "class", "height", "id", "in", "operator", "radius", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feOffset: It([ "class", "dx", "dy", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            fePointLight: It([ "id", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feSpecularLighting: It([ "class", "height", "id", "in", "kernelUnitLength", "result", "specularConstant", "specularExponent", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feSpotLight: It([ "id", "limitingConeAngle", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feTile: It([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feTurbulence: It([ "baseFrequency", "class", "height", "id", "numOctaves", "result", "seed", "stitchTiles", "style", "type", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            filter: It([ "class", "externalResourcesRequired", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            font: It([ "class", "externalResourcesRequired", "horiz-adv-x", "horiz-origin-x", "horiz-origin-y", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            "font-face": It([ "accent-height", "alphabetic", "ascent", "bbox", "cap-height", "descent", "font-family", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "hanging", "id", "ideographic", "mathematical", "overline-position", "overline-thickness", "panose-1", "slope", "stemh", "stemv", "strikethrough-position", "strikethrough-thickness", "underline-position", "underline-thickness", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "widths", "x-height", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-format": It([ "id", "string", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-name": It([ "id", "name", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-src": It([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-uri": It([ "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            foreignObject: It([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            g: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            glyph: It([ "arabic-form", "class", "d", "glyph-name", "horiz-adv-x", "id", "lang", "orientation", "style", "unicode", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            glyphRef: It([ "class", "dx", "dy", "format", "glyphRef", "id", "style", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            glyphref: Ct(),
            hkern: It([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ]),
            image: It([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            line: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "x1", "x2", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            linearGradient: It([ "class", "externalResourcesRequired", "gradientTransform", "gradientUnits", "id", "spreadMethod", "style", "x1", "x2", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            marker: It([ "class", "externalResourcesRequired", "id", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            mask: It([ "class", "externalResourcesRequired", "height", "id", "maskContentUnits", "maskUnits", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            metadata: It([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "missing-glyph": It([ "class", "d", "horiz-adv-x", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            mpath: It([ "externalResourcesRequired", "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            path: It([ "class", "d", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "pathLength", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            pattern: It([ "class", "externalResourcesRequired", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            polygon: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            polyline: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            radialGradient: It([ "class", "cx", "cy", "externalResourcesRequired", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "spreadMethod", "style", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            rect: It([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            script: It([ "externalResourcesRequired", "id", "type", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            set: It([ "attributeName", "attributeType", "begin", "dur", "end", "externalResourcesRequired", "fill", "id", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            stop: It([ "class", "id", "offset", "style", "xml:base", "xml:lang", "xml:space" ]),
            style: It([ "id", "media", "title", "type", "xml:base", "xml:lang", "xml:space" ]),
            svg: It([ "baseProfile", "class", "contentScriptType", "contentStyleType", "externalResourcesRequired", "height", "id", "onabort", "onactivate", "onclick", "onerror", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onresize", "onscroll", "onunload", "onzoom", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "version", "viewBox", "width", "x", "xml:base", "xml:lang", "xml:space", "y", "zoomAndPan" ]),
            switch: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            symbol: It([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            text: It([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "transform", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            textPath: It([ "class", "externalResourcesRequired", "id", "lengthAdjust", "method", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "textLength", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            title: It([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            tref: It([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            tspan: It([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            use: It([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            view: It([ "externalResourcesRequired", "id", "preserveAspectRatio", "viewBox", "viewTarget", "xml:base", "xml:lang", "xml:space", "zoomAndPan" ]),
            vkern: It([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ])
        });
        this.P = It([ "a", "altGlyph", "animate", "animateColor", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood", "feGaussianBlur", "feImage", "feMerge", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence", "filter", "font", "foreignObject", "g", "glyph", "glyphRef", "image", "line", "linearGradient", "marker", "mask", "missing-glyph", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use" ]);
        this.O = It([ "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "clip", "color-interpolation-filters", "color-interpolation", "color-profile", "color-rendering", "color", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "fill", "filter", "flood-color", "flood-opacity", "font-family", "font-size-adjust", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "stroke", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ]);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if ("altglyph" === e.firstElementChild.nodeName) {
            const t = this.D;
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
        return true === this.P[t.nodeName] && true === this.O[e] || true === (null === (i = this.D[t.nodeName]) || void 0 === i ? void 0 : i[e]);
    }
}

SVGAnalyzer.inject = [ Bt ];

const Rt = h.createInterface("IAttrMapper", (t => t.singleton(AttrMapper)));

class AttrMapper {
    constructor(t) {
        this.svg = t;
        this.fns = [];
        this.$ = Ct();
        this.L = Ct();
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
        let o;
        let r;
        for (o in t) {
            s = t[o];
            n = null !== (e = (i = this.$)[o]) && void 0 !== e ? e : i[o] = Ct();
            for (r in s) {
                if (void 0 !== n[r]) throw Pt(r, o);
                n[r] = s[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.L;
        for (const i in t) {
            if (void 0 !== e[i]) throw Pt(i, "*");
            e[i] = t[i];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return Dt(t, e) || this.fns.length > 0 && this.fns.some((i => i(t, e)));
    }
    map(t, e) {
        var i, s, n;
        return null !== (n = null !== (s = null === (i = this.$[t.nodeName]) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : this.L[e]) && void 0 !== n ? n : Et(t, e, this.svg) ? e : null;
    }
}

function Dt(t, e) {
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

function Pt(t, e) {
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
    constructor(t, e, i, s) {
        this.platform = t;
        this.obj = e;
        this.propertyKey = i;
        this.targetAttribute = s;
        this.value = null;
        this.oldValue = null;
        this.hasChanges = false;
        this.type = 2 | 1 | 4;
        this.f = 0;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this.hasChanges = t !== this.oldValue;
        if (0 === (256 & e)) this.flushChanges(e);
    }
    flushChanges(t) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const t = this.value;
            const e = this.targetAttribute;
            this.oldValue = t;
            switch (e) {
              case "class":
                this.obj.classList.toggle(this.propertyKey, !!t);
                break;

              case "style":
                {
                    let e = "";
                    let i = t;
                    if ("string" === typeof i && i.includes("!important")) {
                        e = "important";
                        i = i.replace("!important", "");
                    }
                    this.obj.style.setProperty(this.propertyKey, i, e);
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
            if ("attributes" === s.type && s.attributeName === this.propertyKey) {
                e = true;
                break;
            }
        }
        if (e) {
            let t;
            switch (this.targetAttribute) {
              case "class":
                t = this.obj.classList.contains(this.propertyKey);
                break;

              case "style":
                t = this.obj.style.getPropertyValue(this.propertyKey);
                break;

              default:
                throw new Error(`Unsupported observation of attribute: ${this.targetAttribute}`);
            }
            if (t !== this.value) {
                this.oldValue = this.value;
                this.value = t;
                this.hasChanges = false;
                this.f = 0;
                this.queue.add(this);
            }
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.value = this.oldValue = this.obj.getAttribute(this.propertyKey);
            Ot(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) $t(this.obj, this);
    }
    flush() {
        Mt = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Mt, this.f);
    }
}

P(AttributeObserver);

O(AttributeObserver);

const Ot = (t, e, i) => {
    if (void 0 === e.$eMObservers) e.$eMObservers = new Set;
    if (void 0 === e.$mObserver) (e.$mObserver = new t(Lt)).observe(e, {
        attributes: true
    });
    e.$eMObservers.add(i);
};

const $t = (t, e) => {
    const i = t.$eMObservers;
    if (i && i.delete(e)) {
        if (0 === i.size) {
            t.$mObserver.disconnect();
            t.$mObserver = void 0;
        }
        return true;
    }
    return false;
};

const Lt = t => {
    t[0].target.$eMObservers.forEach(qt, t);
};

function qt(t) {
    t.handleMutation(this);
}

let Mt;

class BindingTargetSubscriber {
    constructor(t) {
        this.b = t;
    }
    handleChange(t, e, i) {
        const s = this.b;
        if (t !== s.sourceExpression.evaluate(i, s.$scope, s.locator, null)) s.updateSource(t, i);
    }
}

const {oneTime: Ft, toView: Vt, fromView: jt} = D;

const _t = Vt | Ft;

const Nt = {
    reusable: false,
    preempt: true
};

class AttributeBinding {
    constructor(t, e, i, s, n, o, r) {
        this.sourceExpression = t;
        this.targetAttribute = i;
        this.targetProperty = s;
        this.mode = n;
        this.locator = r;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = null;
        this.task = null;
        this.targetSubscriber = null;
        this.persistentFlags = 0;
        this.value = void 0;
        this.target = e;
        this.p = r.get(Bt);
        this.oL = o;
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
        const o = this.sourceExpression;
        const r = this.$scope;
        const l = this.locator;
        const h = this.targetObserver;
        const a = 0 === (2 & i) && (4 & h.type) > 0;
        let c = false;
        let u;
        if (10082 !== o.$kind || this.obs.count > 1) {
            c = 0 === (s & Ft);
            if (c) this.obs.version++;
            t = o.evaluate(i, r, l, n);
            if (c) this.obs.clear(false);
        }
        if (t !== this.value) {
            this.value = t;
            if (a) {
                u = this.task;
                this.task = this.p.domWriteQueue.queueTask((() => {
                    this.task = null;
                    n.updateTarget(t, i);
                }), Nt);
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
        if (!n) n = this.targetObserver = new AttributeObserver(this.p, this.target, this.targetProperty, this.targetAttribute);
        s = this.sourceExpression;
        const o = this.mode;
        const r = this.interceptor;
        let l = false;
        if (o & _t) {
            l = (o & Vt) > 0;
            r.updateTarget(this.value = s.evaluate(t, e, this.locator, l ? r : null), t);
        }
        if (o & jt) n.subscribe(null !== (i = this.targetSubscriber) && void 0 !== i ? i : this.targetSubscriber = new BindingTargetSubscriber(r));
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

const {toView: Ht} = D;

const Wt = {
    reusable: false,
    preempt: true
};

class InterpolationBinding {
    constructor(t, e, i, s, n, o, r) {
        this.interpolation = e;
        this.target = i;
        this.targetProperty = s;
        this.mode = n;
        this.locator = o;
        this.taskQueue = r;
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
        for (;a > c; ++c) h[c] = new InterpolationPartBinding(l[c], i, s, o, t, this);
    }
    updateTarget(t, e) {
        const i = this.partBindings;
        const s = this.interpolation.parts;
        const n = i.length;
        let o = "";
        let r = 0;
        if (1 === n) o = s[0] + i[0].value + s[1]; else {
            o = s[0];
            for (;n > r; ++r) o += i[r].value + s[r + 1];
        }
        const l = this.targetObserver;
        const h = 0 === (2 & e) && (4 & l.type) > 0;
        let a;
        if (h) {
            a = this.task;
            this.task = this.taskQueue.queueTask((() => {
                this.task = null;
                l.setValue(o, e, this.target, this.targetProperty);
            }), Wt);
            null === a || void 0 === a ? void 0 : a.cancel();
            a = null;
        } else l.setValue(o, e, this.target, this.targetProperty);
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
    constructor(t, e, i, s, n, o) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.locator = s;
        this.owner = o;
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
        const o = 10082 === s.$kind && 1 === n.count;
        let r = false;
        if (!o) {
            r = (this.mode & Ht) > 0;
            if (r) n.version++;
            t = s.evaluate(i, this.$scope, this.locator, r ? this.interceptor : null);
            if (r) n.clear(false);
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
        this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & Ht) > 0 ? this.interceptor : null);
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
    constructor(t, e, i, s, n, o) {
        this.sourceExpression = t;
        this.target = e;
        this.locator = i;
        this.p = n;
        this.strict = o;
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
        const o = this.p.Node;
        const r = this.value;
        this.value = t;
        if (r instanceof o) null === (i = r.parentNode) || void 0 === i ? void 0 : i.removeChild(r);
        if (t instanceof o) {
            n.textContent = "";
            null === (s = n.parentNode) || void 0 === s ? void 0 : s.insertBefore(t, n);
        } else n.textContent = String(t);
    }
    handleChange(t, e, i) {
        var s;
        if (!this.isBound) return;
        const n = this.sourceExpression;
        const o = this.obs;
        const r = 10082 === n.$kind && 1 === o.count;
        let l = false;
        if (!r) {
            l = (this.mode & Ht) > 0;
            if (l) o.version++;
            i |= this.strict ? 1 : 0;
            t = n.evaluate(i, this.$scope, this.locator, l ? this.interceptor : null);
            if (l) o.clear(false);
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
        const i = this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & Ht) > 0 ? this.interceptor : null);
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
        }), Wt);
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
        const o = s[n];
        this.obs.version++;
        t = this.sourceExpression.evaluate(i, this.$scope, this.locator, this.interceptor);
        this.obs.clear(false);
        if (t !== o) s[n] = t;
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

const {oneTime: Ut, toView: zt, fromView: Gt} = D;

const Xt = zt | Ut;

const Kt = {
    reusable: false,
    preempt: true
};

class PropertyBinding {
    constructor(t, e, i, s, n, o, r) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.mode = s;
        this.locator = o;
        this.taskQueue = r;
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
        const o = this.sourceExpression;
        const r = this.$scope;
        const l = this.locator;
        const h = 0 === (2 & i) && (4 & s.type) > 0;
        const a = this.obs;
        let c = false;
        if (10082 !== o.$kind || a.count > 1) {
            c = this.mode > Ut;
            if (c) a.version++;
            t = o.evaluate(i, r, l, n);
            if (c) a.clear(false);
        }
        if (h) {
            Yt = this.task;
            this.task = this.taskQueue.queueTask((() => {
                n.updateTarget(t, i);
                this.task = null;
            }), Kt);
            null === Yt || void 0 === Yt ? void 0 : Yt.cancel();
            Yt = null;
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
        const o = this.mode;
        let r = this.targetObserver;
        if (!r) {
            if (o & Gt) r = n.getObserver(this.target, this.targetProperty); else r = n.getAccessor(this.target, this.targetProperty);
            this.targetObserver = r;
        }
        s = this.sourceExpression;
        const l = this.interceptor;
        const h = (o & zt) > 0;
        if (o & Xt) l.updateTarget(s.evaluate(t, e, this.locator, h ? l : null), t);
        if (o & Gt) {
            r.subscribe(null !== (i = this.targetSubscriber) && void 0 !== i ? i : this.targetSubscriber = new BindingTargetSubscriber(l));
            if (!h) l.updateSource(r.getValue(this.target, this.targetProperty), t);
        }
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        this.persistentFlags = 0;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        Yt = this.task;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        if (null != Yt) {
            Yt.cancel();
            Yt = this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}

$(PropertyBinding);

let Yt = null;

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

const Qt = h.createInterface("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(c.instance(Qt, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return null === t ? e() : e(this.c.get(t));
    }
}

const Zt = Object.freeze({
    beforeCreate: Jt("beforeCreate"),
    hydrating: Jt("hydrating"),
    hydrated: Jt("hydrated"),
    beforeActivate: Jt("beforeActivate"),
    afterActivate: Jt("afterActivate"),
    beforeDeactivate: Jt("beforeDeactivate"),
    afterDeactivate: Jt("afterDeactivate")
});

function Jt(t) {
    function e(e, i) {
        if ("function" === typeof i) return new $AppTask(t, e, i);
        return new $AppTask(t, null, e);
    }
    return e;
}

function te(t, i) {
    let n;
    function o(t, i) {
        if (arguments.length > 1) n.property = i;
        s.define(ie.name, ChildrenDefinition.create(i, n), t.constructor, i);
        e.annotation.appendTo(t.constructor, ie.keyFrom(i));
    }
    if (arguments.length > 1) {
        n = {};
        o(t, i);
        return;
    } else if ("string" === typeof t) {
        n = {};
        return o;
    }
    n = void 0 === t ? {} : t;
    return o;
}

function ee(t) {
    return t.startsWith(ie.name);
}

const ie = {
    name: e.annotation.keyFor("children-observer"),
    keyFrom(t) {
        return `${ie.name}:${t}`;
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
        function o(t) {
            if (i(t)) t.forEach(s); else if (t instanceof ChildrenDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t)));
        }
        t.forEach(o);
        return e;
    },
    getAll(t) {
        const n = ie.name.length + 1;
        const o = [];
        const r = i(t);
        let l = r.length;
        let h = 0;
        let a;
        let c;
        let u;
        while (--l >= 0) {
            u = r[l];
            a = e.annotation.getKeys(u).filter(ee);
            c = a.length;
            for (let t = 0; t < c; ++t) o[h++] = s.getOwn(ie.name, u, a[t].slice(n));
        }
        return o;
    }
};

const se = {
    childList: true
};

class ChildrenDefinition {
    constructor(t, e, i, s, n, o) {
        this.callback = t;
        this.property = e;
        this.options = i;
        this.query = s;
        this.filter = n;
        this.map = o;
    }
    static create(t, e = {}) {
        var i;
        return new ChildrenDefinition(n(e.callback, `${t}Changed`), n(e.property, t), null !== (i = e.options) && void 0 !== i ? i : se, e.query, e.filter, e.map);
    }
}

class ChildrenObserver {
    constructor(t, e, i, s, n = ne, o = oe, r = re, l) {
        this.controller = t;
        this.obj = e;
        this.propertyKey = i;
        this.query = n;
        this.filter = o;
        this.map = r;
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
                this.q();
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
    q() {
        this.children = this.get();
        if (void 0 !== this.callback) this.callback.call(this.obj);
        this.subs.notify(this.children, void 0, 0);
    }
    get() {
        return he(this.controller, this.query, this.filter, this.map);
    }
}

P()(ChildrenObserver);

function ne(t) {
    return t.host.childNodes;
}

function oe(t, e, i) {
    return !!i;
}

function re(t, e, i) {
    return i;
}

const le = {
    optional: true
};

function he(t, e, i, s) {
    var n;
    const o = e(t);
    const r = o.length;
    const l = [];
    let h;
    let a;
    let c;
    let u = 0;
    for (;u < r; ++u) {
        h = o[u];
        a = Ce.for(h, le);
        c = null !== (n = null === a || void 0 === a ? void 0 : a.viewModel) && void 0 !== n ? n : null;
        if (i(h, a, c)) l.push(s(h, a, c));
    }
    return l;
}

function ae(t) {
    return function(e) {
        return fe.define(t, e);
    };
}

function ce(t) {
    return function(e) {
        return fe.define("string" === typeof t ? {
            isTemplateController: true,
            name: t
        } : {
            isTemplateController: true,
            ...t
        }, e);
    };
}

class CustomAttributeDefinition {
    constructor(t, e, i, s, n, o, r, l, h) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.defaultBindingMode = n;
        this.isTemplateController = o;
        this.bindables = r;
        this.noMultiBindings = l;
        this.watches = h;
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
        return new CustomAttributeDefinition(e, n(fe.getAnnotation(e, "name"), i), f(fe.getAnnotation(e, "aliases"), s.aliases, e.aliases), fe.keyFrom(i), n(fe.getAnnotation(e, "defaultBindingMode"), s.defaultBindingMode, e.defaultBindingMode, D.toView), n(fe.getAnnotation(e, "isTemplateController"), s.isTemplateController, e.isTemplateController, false), ct.from(...ct.getAll(e), fe.getAnnotation(e, "bindables"), e.bindables, s.bindables), n(fe.getAnnotation(e, "noMultiBindings"), s.noMultiBindings, e.noMultiBindings, false), f(pe.getAnnotation(e), e.watches));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        c.transient(i, e).register(t);
        c.aliasTo(i, e).register(t);
        L(s, fe, i, t);
    }
}

const ue = e.resource.keyFor("custom-attribute");

const fe = Object.freeze({
    name: ue,
    keyFrom(t) {
        return `${ue}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.hasOwn(ue, t);
    },
    for(t, e) {
        var i;
        return null !== (i = ki(t, fe.keyFrom(e))) && void 0 !== i ? i : void 0;
    },
    define(t, i) {
        const n = CustomAttributeDefinition.create(t, i);
        s.define(ue, n, n.Type);
        s.define(ue, n, n);
        e.resource.appendTo(i, ue);
        return n.Type;
    },
    getDefinition(t) {
        const e = s.getOwn(ue, t);
        if (void 0 === e) throw new Error(`No definition found for type ${t.name}`);
        return e;
    },
    annotate(t, i, n) {
        s.define(e.annotation.keyFor(i), n, t);
    },
    getAnnotation(t, i) {
        return s.getOwn(e.annotation.keyFor(i), t);
    }
});

function de(t, e) {
    if (!t) throw new Error("Invalid watch config. Expected an expression or a fn");
    return function i(s, n, o) {
        const r = null == n;
        const l = r ? s : s.constructor;
        const h = new WatchDefinition(t, r ? e : o.value);
        if (r) {
            if ("function" !== typeof e && (null == e || !(e in l.prototype))) throw new Error(`Invalid change handler config. Method "${String(e)}" not found in class ${l.name}`);
        } else if ("function" !== typeof (null === o || void 0 === o ? void 0 : o.value)) throw new Error(`decorated target ${String(n)} is not a class method.`);
        pe.add(l, h);
        if (fe.isType(l)) fe.getDefinition(l).watches.push(h);
        if (Ce.isType(l)) Ce.getDefinition(l).watches.push(h);
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const me = l;

const ve = e.annotation.keyFor("watch");

const pe = {
    name: ve,
    add(t, e) {
        let i = s.getOwn(ve, t);
        if (null == i) s.define(ve, i = [], t);
        i.push(e);
    },
    getAnnotation(t) {
        var e;
        return null !== (e = s.getOwn(ve, t)) && void 0 !== e ? e : me;
    }
};

function ge(t) {
    return function(e) {
        return Ce.define(t, e);
    };
}

function we(t) {
    if (void 0 === t) return function(t) {
        Ce.annotate(t, "shadowOptions", {
            mode: "open"
        });
    };
    if ("function" !== typeof t) return function(e) {
        Ce.annotate(e, "shadowOptions", t);
    };
    Ce.annotate(t, "shadowOptions", {
        mode: "open"
    });
}

function be(t) {
    if (void 0 === t) return function(t) {
        Ce.annotate(t, "containerless", true);
    };
    Ce.annotate(t, "containerless", true);
}

const ye = new WeakMap;

class CustomElementDefinition {
    constructor(t, e, i, s, n, o, r, l, h, a, c, u, f, d, m, v, p, g, w, b) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.cache = n;
        this.template = o;
        this.instructions = r;
        this.dependencies = l;
        this.injectable = h;
        this.needsCompile = a;
        this.surrogates = c;
        this.bindables = u;
        this.childrenObservers = f;
        this.containerless = d;
        this.isStrictBinding = m;
        this.shadowOptions = v;
        this.hasSlots = p;
        this.enhance = g;
        this.watches = w;
        this.processContent = b;
    }
    static create(t, e = null) {
        if (null === e) {
            const i = t;
            if ("string" === typeof i) throw new Error(`Cannot create a custom element definition with only a name and no type: ${t}`);
            const s = d("name", i, Ce.generateName);
            if ("function" === typeof i.Type) e = i.Type; else e = Ce.generateType(m(s));
            return new CustomElementDefinition(e, s, f(i.aliases), d("key", i, (() => Ce.keyFrom(s))), d("cache", i, (() => 0)), d("template", i, (() => null)), f(i.instructions), f(i.dependencies), d("injectable", i, (() => null)), d("needsCompile", i, (() => true)), f(i.surrogates), ct.from(i.bindables), ie.from(i.childrenObservers), d("containerless", i, (() => false)), d("isStrictBinding", i, (() => false)), d("shadowOptions", i, (() => null)), d("hasSlots", i, (() => false)), d("enhance", i, (() => false)), d("watches", i, (() => l)), v("processContent", e, (() => null)));
        }
        if ("string" === typeof t) return new CustomElementDefinition(e, t, f(Ce.getAnnotation(e, "aliases"), e.aliases), Ce.keyFrom(t), v("cache", e, (() => 0)), v("template", e, (() => null)), f(Ce.getAnnotation(e, "instructions"), e.instructions), f(Ce.getAnnotation(e, "dependencies"), e.dependencies), v("injectable", e, (() => null)), v("needsCompile", e, (() => true)), f(Ce.getAnnotation(e, "surrogates"), e.surrogates), ct.from(...ct.getAll(e), Ce.getAnnotation(e, "bindables"), e.bindables), ie.from(...ie.getAll(e), Ce.getAnnotation(e, "childrenObservers"), e.childrenObservers), v("containerless", e, (() => false)), v("isStrictBinding", e, (() => false)), v("shadowOptions", e, (() => null)), v("hasSlots", e, (() => false)), v("enhance", e, (() => false)), f(pe.getAnnotation(e), e.watches), v("processContent", e, (() => null)));
        const i = d("name", t, Ce.generateName);
        return new CustomElementDefinition(e, i, f(Ce.getAnnotation(e, "aliases"), t.aliases, e.aliases), Ce.keyFrom(i), p("cache", t, e, (() => 0)), p("template", t, e, (() => null)), f(Ce.getAnnotation(e, "instructions"), t.instructions, e.instructions), f(Ce.getAnnotation(e, "dependencies"), t.dependencies, e.dependencies), p("injectable", t, e, (() => null)), p("needsCompile", t, e, (() => true)), f(Ce.getAnnotation(e, "surrogates"), t.surrogates, e.surrogates), ct.from(...ct.getAll(e), Ce.getAnnotation(e, "bindables"), e.bindables, t.bindables), ie.from(...ie.getAll(e), Ce.getAnnotation(e, "childrenObservers"), e.childrenObservers, t.childrenObservers), p("containerless", t, e, (() => false)), p("isStrictBinding", t, e, (() => false)), p("shadowOptions", t, e, (() => null)), p("hasSlots", t, e, (() => false)), p("enhance", t, e, (() => false)), f(t.watches, pe.getAnnotation(e), e.watches), p("processContent", t, e, (() => null)));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) return t;
        if (ye.has(t)) return ye.get(t);
        const e = CustomElementDefinition.create(t);
        ye.set(t, e);
        s.define(Ce.name, e, e.Type);
        return e;
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        if (!t.has(i, false)) {
            c.transient(i, e).register(t);
            c.aliasTo(i, e).register(t);
            L(s, Ce, i, t);
        }
    }
}

const xe = {
    name: void 0,
    searchParents: false,
    optional: false
};

const ke = e.resource.keyFor("custom-element");

const Ce = Object.freeze({
    name: ke,
    keyFrom(t) {
        return `${ke}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.hasOwn(ke, t);
    },
    for(t, e = xe) {
        if (void 0 === e.name && true !== e.searchParents) {
            const i = ki(t, ke);
            if (null === i) {
                if (true === e.optional) return null;
                throw new Error(`The provided node is not a custom element or containerless host.`);
            }
            return i;
        }
        if (void 0 !== e.name) {
            if (true !== e.searchParents) {
                const i = ki(t, ke);
                if (null === i) throw new Error(`The provided node is not a custom element or containerless host.`);
                if (i.is(e.name)) return i;
                return;
            }
            let i = t;
            let s = false;
            while (null !== i) {
                const t = ki(i, ke);
                if (null !== t) {
                    s = true;
                    if (t.is(e.name)) return t;
                }
                i = Ii(i);
            }
            if (s) return;
            throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
        }
        let i = t;
        while (null !== i) {
            const t = ki(i, ke);
            if (null !== t) return t;
            i = Ii(i);
        }
        throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
    },
    define(t, i) {
        const n = CustomElementDefinition.create(t, i);
        s.define(ke, n, n.Type);
        s.define(ke, n, n);
        e.resource.appendTo(n.Type, ke);
        return n.Type;
    },
    getDefinition(t) {
        const e = s.getOwn(ke, t);
        if (void 0 === e) throw new Error(`No definition found for type ${t.name}`);
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

const Ae = e.annotation.keyFor("processContent");

function Se(t) {
    return void 0 === t ? function(t, e, i) {
        s.define(Ae, Ee(t, e), t);
    } : function(e) {
        t = Ee(e, t);
        const i = s.getOwn(ke, e);
        if (void 0 !== i) i.processContent = t; else s.define(Ae, t, e);
        return e;
    };
}

function Ee(t, e) {
    if ("string" === typeof e) e = t[e];
    const i = typeof e;
    if ("function" !== i) throw new Error(`Invalid @processContent hook. Expected the hook to be a function (when defined in a class, it needs to be a static function) but got a ${i}.`);
    return e;
}

class ClassAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.value = "";
        this.oldValue = "";
        this.doNotCache = true;
        this.nameIndex = {};
        this.version = 0;
        this.hasChanges = false;
        this.isActive = false;
        this.type = 2 | 4;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this.hasChanges = t !== this.oldValue;
        if (0 === (256 & e)) this.flushChanges(e);
    }
    flushChanges(t) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const t = this.value;
            const e = this.nameIndex;
            let i = this.version;
            this.oldValue = t;
            const s = Be(t);
            if (s.length > 0) this.addClassesAndUpdateIndex(s);
            this.version += 1;
            if (0 === i) return;
            i -= 1;
            for (const t in e) {
                if (!Object.prototype.hasOwnProperty.call(e, t) || e[t] !== i) continue;
                this.obj.classList.remove(t);
            }
        }
    }
    addClassesAndUpdateIndex(t) {
        const e = this.obj;
        for (let i = 0, s = t.length; i < s; i++) {
            const s = t[i];
            if (0 === s.length) continue;
            this.nameIndex[s] = this.version;
            e.classList.add(s);
        }
    }
}

function Be(t) {
    if ("string" === typeof t) return Te(t);
    if ("object" !== typeof t) return l;
    if (t instanceof Array) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            for (let s = 0; s < e; ++s) i.push(...Be(t[s]));
            return i;
        } else return l;
    }
    const e = [];
    for (const i in t) if (Boolean(t[i])) if (i.includes(" ")) e.push(...Te(i)); else e.push(i);
    return e;
}

function Te(t) {
    const e = t.match(/\S+/g);
    if (null === e) return l;
    return e;
}

function Ie(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        var e;
        const i = Object.assign({}, ...this.modules);
        const s = fe.define({
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
                this.element.className = Be(this.value).map((t => i[t] || t)).join(" ");
            }
        }, e.inject = [ Ai ], e));
        t.register(s);
    }
}

function Re(...t) {
    return new ShadowDOMRegistry(t);
}

const De = h.createInterface("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(Bt))) return t.get(AdoptedStyleSheetsStylesFactory);
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Oe);
        const i = t.get(De);
        t.register(c.instance(Pe, i.createStyles(this.css, e)));
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

AdoptedStyleSheetsStylesFactory.inject = [ Bt ];

class StyleElementStylesFactory {
    constructor(t) {
        this.p = t;
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

StyleElementStylesFactory.inject = [ Bt ];

const Pe = h.createInterface("IShadowDOMStyles");

const Oe = h.createInterface("IShadowDOMGlobalStyles", (t => t.instance({
    applyTo: r
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

const $e = {
    shadowDOM(t) {
        return Zt.beforeCreate(g, (e => {
            if (null != t.sharedStyles) {
                const i = e.get(De);
                e.register(c.instance(Oe, i.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: Le, exit: qe} = q;

const {wrap: Me, unwrap: Fe} = M;

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
            Le(this);
            return this.value = Fe(this.get.call(void 0, this.useProxy ? Me(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            qe(this);
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

const Ve = h.createInterface("ILifecycleHooks");

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
        c.singleton(Ve, this.Type).register(t);
    }
}

const je = new WeakMap;

const _e = e.annotation.keyFor("lifecycle-hooks");

const Ne = Object.freeze({
    name: _e,
    define(t, i) {
        const n = LifecycleHooksDefinition.create(t, i);
        s.define(_e, n, i);
        e.resource.appendTo(i, _e);
        return n.Type;
    },
    resolve(t) {
        let e = je.get(t);
        if (void 0 === e) {
            e = new LifecycleHooksLookupImpl;
            const i = t.root;
            const n = i.id === t.id ? t.getAll(Ve) : t.has(Ve, false) ? [ ...i.getAll(Ve), ...t.getAll(Ve) ] : i.getAll(Ve);
            let o;
            let r;
            let l;
            let h;
            let a;
            for (o of n) {
                r = s.getOwn(_e, o.constructor);
                l = new LifecycleHooksEntry(r, o);
                for (h of r.propertyNames) {
                    a = e[h];
                    if (void 0 === a) e[h] = [ l ]; else a.push(l);
                }
            }
        }
        return e;
    }
});

class LifecycleHooksLookupImpl {}

function He() {
    return function t(e) {
        return Ne.define({}, e);
    };
}

const We = h.createInterface("IViewFactory");

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

const Ue = new WeakSet;

function ze(t) {
    return !Ue.has(t);
}

function Ge(t) {
    Ue.add(t);
    return CustomElementDefinition.create(t);
}

const Xe = e.resource.keyFor("views");

const Ke = Object.freeze({
    name: Xe,
    has(t) {
        return "function" === typeof t && (s.hasOwn(Xe, t) || "$views" in t);
    },
    get(t) {
        if ("function" === typeof t && "$views" in t) {
            const e = t.$views;
            const i = e.filter(ze).map(Ge);
            for (const e of i) Ke.add(t, e);
        }
        let e = s.getOwn(Xe, t);
        if (void 0 === e) s.define(Xe, e = [], t);
        return e;
    },
    add(t, e) {
        const i = CustomElementDefinition.create(e);
        let n = s.getOwn(Xe, t);
        if (void 0 === n) s.define(Xe, n = [ i ], t); else n.push(i);
        return n;
    }
});

function Ye(t) {
    return function(e) {
        Ke.add(e, t);
    };
}

const Qe = h.createInterface("IViewLocator", (t => t.singleton(ViewLocator)));

class ViewLocator {
    constructor() {
        this.M = new WeakMap;
        this.F = new Map;
    }
    getViewComponentForObject(t, e) {
        if (t) {
            const i = Ke.has(t.constructor) ? Ke.get(t.constructor) : [];
            const s = "function" === typeof e ? e(t, i) : this.V(i, e);
            return this.j(t, i, s);
        }
        return null;
    }
    j(t, e, i) {
        let s = this.M.get(t);
        let n;
        if (void 0 === s) {
            s = {};
            this.M.set(t, s);
        } else n = s[i];
        if (void 0 === n) {
            const o = this._(t, e, i);
            n = Ce.define(Ce.getDefinition(o), class extends o {
                constructor() {
                    super(t);
                }
            });
            s[i] = n;
        }
        return n;
    }
    _(t, e, i) {
        let s = this.F.get(t.constructor);
        let n;
        if (void 0 === s) {
            s = {};
            this.F.set(t.constructor, s);
        } else n = s[i];
        if (void 0 === n) {
            n = Ce.define(this.N(e, i), class {
                constructor(t) {
                    this.viewModel = t;
                }
                define(t, e, i) {
                    const s = this.viewModel;
                    t.scope = F.fromParent(t.scope, s);
                    if (void 0 !== s.define) return s.define(t, e, i);
                }
            });
            const o = n.prototype;
            if ("hydrating" in t) o.hydrating = function t(e) {
                this.viewModel.hydrating(e);
            };
            if ("hydrated" in t) o.hydrated = function t(e) {
                this.viewModel.hydrated(e);
            };
            if ("created" in t) o.created = function t(e) {
                this.viewModel.created(e);
            };
            if ("binding" in t) o.binding = function t(e, i, s) {
                return this.viewModel.binding(e, i, s);
            };
            if ("bound" in t) o.bound = function t(e, i, s) {
                return this.viewModel.bound(e, i, s);
            };
            if ("attaching" in t) o.attaching = function t(e, i, s) {
                return this.viewModel.attaching(e, i, s);
            };
            if ("attached" in t) o.attached = function t(e, i) {
                return this.viewModel.attached(e, i);
            };
            if ("detaching" in t) o.detaching = function t(e, i, s) {
                return this.viewModel.detaching(e, i, s);
            };
            if ("unbinding" in t) o.unbinding = function t(e, i, s) {
                return this.viewModel.unbinding(e, i, s);
            };
            if ("dispose" in t) o.dispose = function t() {
                this.viewModel.dispose();
            };
            s[i] = n;
        }
        return n;
    }
    V(t, e) {
        if (e) return e;
        if (1 === t.length) return t[0].name;
        return "default-view";
    }
    N(t, e) {
        const i = t.find((t => t.name === e));
        if (void 0 === i) throw new Error(`Could not find view: ${e}`);
        return i;
    }
}

const Ze = h.createInterface("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    constructor(t) {
        this.H = new WeakMap;
        this.W = new WeakMap;
        this.U = (this.G = t.root).get(Bt);
        this.X = new FragmentNodeSequence(this.U, this.U.document.createDocumentFragment());
    }
    get renderers() {
        return null == this.rs ? this.rs = this.G.getAll(Ui, false).reduce(((t, e) => {
            t[e.instructionType] = e;
            return t;
        }), Ct()) : this.rs;
    }
    compile(t, e, i) {
        if (false !== t.needsCompile) {
            const s = this.H;
            const n = e.get(Wi);
            let o = s.get(t);
            if (null == o) s.set(t, o = n.compile(t, e, i)); else e.register(...o.dependencies);
            return o;
        }
        return t;
    }
    getViewFactory(t, e) {
        return new ViewFactory(e, CustomElementDefinition.getOrCreate(t));
    }
    createNodes(t) {
        if (true === t.enhance) return new FragmentNodeSequence(this.U, t.template);
        let e;
        const i = this.W;
        if (i.has(t)) e = i.get(t); else {
            const s = this.U;
            const n = s.document;
            const o = t.template;
            let r;
            if (null === o) e = null; else if (o instanceof s.Node) if ("TEMPLATE" === o.nodeName) e = n.adoptNode(o.content); else (e = n.adoptNode(n.createDocumentFragment())).appendChild(o.cloneNode(true)); else {
                r = n.createElement("template");
                if ("string" === typeof o) r.innerHTML = o;
                n.adoptNode(e = r.content);
            }
            i.set(t, e);
        }
        return null == e ? this.X : new FragmentNodeSequence(this.U, e.cloneNode(true));
    }
    render(t, e, i, s, n) {
        const o = s.instructions;
        const r = this.renderers;
        const l = i.length;
        if (i.length !== o.length) throw new Error(`The compiled template is not aligned with the render instructions. There are ${l} targets and ${o.length} instructions.`);
        let h = 0;
        let a = 0;
        let c = 0;
        let u;
        let f;
        let d;
        if (l > 0) while (l > h) {
            u = o[h];
            d = i[h];
            a = 0;
            c = u.length;
            while (c > a) {
                f = u[a];
                r[f.type].render(t, e, d, f);
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
                    r[f.type].render(t, e, n, f);
                    ++a;
                }
            }
        }
    }
}

Rendering.inject = [ g ];

var Je;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["host"] = 1] = "host";
    t[t["shadowRoot"] = 2] = "shadowRoot";
    t[t["location"] = 3] = "location";
})(Je || (Je = {}));

const ti = {
    optional: true
};

const ei = new WeakMap;

class Controller {
    constructor(t, e, i, s, n, o, r) {
        this.container = t;
        this.vmKind = e;
        this.flags = i;
        this.definition = s;
        this.viewFactory = n;
        this.viewModel = o;
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
        this.K = false;
        this.Y = l;
        this.$initiator = null;
        this.$flags = 0;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.Z = 0;
        this.J = 0;
        this.tt = 0;
        this.logger = null;
        this.debug = false;
        this.et = t.root.get(Ze);
        switch (e) {
          case 1:
          case 0:
            this.hooks = new HooksDefinition(o);
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
        return ei.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (void 0 === e) throw new Error(`There is no cached controller for the provided ViewModel: ${String(t)}`);
        return e;
    }
    static $el(t, e, i, s, n = 0, o = void 0) {
        if (ei.has(e)) return ei.get(e);
        o = null !== o && void 0 !== o ? o : Ce.getDefinition(e.constructor);
        const r = new Controller(t, 0, n, o, null, e, i);
        const l = t.get(b(vi));
        if (o.dependencies.length > 0) t.register(...o.dependencies);
        t.registerResolver(vi, new y("IHydrationContext", new HydrationContext(r, s, l)));
        ei.set(e, r);
        if (null == s || false !== s.hydrate) r.it(s, l);
        return r;
    }
    static $attr(t, e, i, s = 0, n) {
        if (ei.has(e)) return ei.get(e);
        n = null !== n && void 0 !== n ? n : fe.getDefinition(e.constructor);
        const o = new Controller(t, 1, s, n, null, e, i);
        ei.set(e, o);
        o.st();
        return o;
    }
    static $view(t, e = 0, i = void 0) {
        const s = new Controller(t.container, 2, e, null, t, null, null);
        s.parent = null !== i && void 0 !== i ? i : null;
        s.nt();
        return s;
    }
    it(t, e) {
        this.logger = this.container.get(x).root;
        this.debug = this.logger.config.level <= 1;
        if (this.debug) this.logger = this.logger.scopeTo(this.name);
        const i = this.container;
        const s = this.flags;
        const n = this.viewModel;
        let o = this.definition;
        this.scope = F.create(n, null, true);
        if (o.watches.length > 0) li(this, i, o, n);
        si(this, o, s, n);
        this.Y = ni(this, o, s, n);
        if (this.hooks.hasDefine) {
            if (this.debug) this.logger.trace(`invoking define() hook`);
            const t = n.define(this, e, o);
            if (void 0 !== t && t !== o) o = CustomElementDefinition.getOrCreate(t);
        }
        this.lifecycleHooks = Ne.resolve(i);
        o.register(i);
        if (null !== o.injectable) i.registerResolver(o.injectable, new y("definition.injectable", n));
        if (null == t || false !== t.hydrate) {
            this.ot(t);
            this.rt();
        }
    }
    ot(t) {
        if (this.hooks.hasHydrating) {
            if (this.debug) this.logger.trace(`invoking hydrating() hook`);
            this.viewModel.hydrating(this);
        }
        const e = this.lt = this.et.compile(this.definition, this.container, t);
        const {shadowOptions: i, isStrictBinding: s, hasSlots: n, containerless: o} = e;
        this.isStrictBinding = s;
        if (null !== (this.hostController = Ce.for(this.host, ti))) this.host = this.container.root.get(Bt).document.createElement(this.definition.name);
        Ci(this.host, Ce.name, this);
        Ci(this.host, this.definition.key, this);
        if (null !== i || n) {
            if (o) throw new Error("You cannot combine the containerless custom element option with Shadow DOM.");
            Ci(this.shadowRoot = this.host.attachShadow(null !== i && void 0 !== i ? i : ci), Ce.name, this);
            Ci(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2;
        } else if (o) {
            Ci(this.location = Di(this.host), Ce.name, this);
            Ci(this.location, this.definition.key, this);
            this.mountTarget = 3;
        } else this.mountTarget = 1;
        this.viewModel.$controller = this;
        this.nodes = this.et.createNodes(e);
        if (this.hooks.hasHydrated) {
            if (this.debug) this.logger.trace(`invoking hydrated() hook`);
            this.viewModel.hydrated(this);
        }
    }
    rt() {
        this.et.render(this.flags, this, this.nodes.findTargets(), this.lt, this.host);
        if (this.hooks.hasCreated) {
            if (this.debug) this.logger.trace(`invoking created() hook`);
            this.viewModel.created(this);
        }
    }
    st() {
        const t = this.definition;
        const e = this.viewModel;
        if (t.watches.length > 0) li(this, this.container, t, e);
        si(this, t, this.flags, e);
        e.$controller = this;
        this.lifecycleHooks = Ne.resolve(this.container);
        if (this.hooks.hasCreated) {
            if (this.debug) this.logger.trace(`invoking created() hook`);
            this.viewModel.created(this);
        }
    }
    nt() {
        this.lt = this.et.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this.lt.isStrictBinding;
        this.et.render(this.flags, this, (this.nodes = this.et.createNodes(this.lt)).findTargets(), this.lt, void 0);
    }
    activate(t, e, i, s) {
        var n;
        switch (this.state) {
          case 0:
          case 8:
            if (!(null === e || e.isActive)) return;
            this.state = 1;
            break;

          case 2:
            return;

          case 32:
            throw new Error(`${this.name} trying to activate a controller that is disposed.`);

          default:
            throw new Error(`${this.name} unexpected state: ${di(this.state)}.`);
        }
        this.parent = e;
        if (this.debug && !this.K) {
            this.K = true;
            (null !== (n = this.logger) && void 0 !== n ? n : this.logger = this.container.get(x).root.scopeTo(this.name)).trace(`activate()`);
        }
        i |= 2;
        switch (this.vmKind) {
          case 0:
            this.scope.parentScope = null !== s && void 0 !== s ? s : null;
            break;

          case 1:
            this.scope = null !== s && void 0 !== s ? s : null;
            break;

          case 2:
            if (void 0 === s || null === s) throw new Error(`Scope is null or undefined`);
            if (!this.hasLockedScope) this.scope = s;
            break;
        }
        if (this.isStrictBinding) i |= 1;
        this.$initiator = t;
        this.$flags = i;
        this.ht();
        if (this.hooks.hasBinding) {
            if (this.debug) this.logger.trace(`binding()`);
            const t = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.at();
                t.then((() => {
                    this.bind();
                })).catch((t => {
                    this.ct(t);
                }));
                return this.$promise;
            }
        }
        this.bind();
        return this.$promise;
    }
    bind() {
        if (this.debug) this.logger.trace(`bind()`);
        let t = 0;
        let e = this.Y.length;
        let i;
        if (e > 0) while (e > t) {
            this.Y[t].start();
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
            if (this.debug) this.logger.trace(`bound()`);
            i = this.viewModel.bound(this.$initiator, this.parent, this.$flags);
            if (i instanceof Promise) {
                this.at();
                i.then((() => {
                    this.isBound = true;
                    this.ut();
                })).catch((t => {
                    this.ct(t);
                }));
                return;
            }
        }
        this.isBound = true;
        this.ut();
    }
    ft(...t) {
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
    ut() {
        if (this.debug) this.logger.trace(`attach()`);
        if (null !== this.hostController) switch (this.mountTarget) {
          case 1:
          case 2:
            this.hostController.ft(this.host);
            break;

          case 3:
            this.hostController.ft(this.location.$start, this.location);
            break;
        }
        switch (this.mountTarget) {
          case 1:
            this.nodes.appendTo(this.host, null != this.definition && this.definition.enhance);
            break;

          case 2:
            {
                const t = this.container;
                const e = t.has(Pe, false) ? t.get(Pe) : t.get(Oe);
                e.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }

          case 3:
            this.nodes.insertBefore(this.location);
            break;
        }
        if (this.hooks.hasAttaching) {
            if (this.debug) this.logger.trace(`attaching()`);
            const t = this.viewModel.attaching(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.at();
                this.ht();
                t.then((() => {
                    this.dt();
                })).catch((t => {
                    this.ct(t);
                }));
            }
        }
        if (null !== this.children) {
            let t = 0;
            for (;t < this.children.length; ++t) void this.children[t].activate(this.$initiator, this, this.$flags, this.scope);
        }
        this.dt();
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
            throw new Error(`${this.name} unexpected state: ${di(this.state)}.`);
        }
        if (this.debug) this.logger.trace(`deactivate()`);
        this.$initiator = t;
        this.$flags = i;
        if (t === this) this.vt();
        let s = 0;
        if (this.Y.length) for (;s < this.Y.length; ++s) this.Y[s].stop();
        if (null !== this.children) for (s = 0; s < this.children.length; ++s) void this.children[s].deactivate(t, this, i);
        if (this.hooks.hasDetaching) {
            if (this.debug) this.logger.trace(`detaching()`);
            const e = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (e instanceof Promise) {
                this.at();
                t.vt();
                e.then((() => {
                    t.gt();
                })).catch((e => {
                    t.ct(e);
                }));
            }
        }
        if (null === t.head) t.head = this; else t.tail.next = this;
        t.tail = this;
        if (t !== this) return;
        this.gt();
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
        if (this.debug) this.logger.trace(`unbind()`);
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
        this.wt();
    }
    at() {
        if (void 0 === this.$promise) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) this.parent.at();
        }
    }
    wt() {
        if (void 0 !== this.$promise) {
            gi = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            gi();
            gi = void 0;
        }
    }
    ct(t) {
        if (void 0 !== this.$promise) {
            wi = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            wi(t);
            wi = void 0;
        }
        if (this.$initiator !== this) this.parent.ct(t);
    }
    ht() {
        ++this.Z;
        if (this.$initiator !== this) this.parent.ht();
    }
    dt() {
        if (0 === --this.Z) {
            if (this.hooks.hasAttached) {
                if (this.debug) this.logger.trace(`attached()`);
                bi = this.viewModel.attached(this.$initiator, this.$flags);
                if (bi instanceof Promise) {
                    this.at();
                    bi.then((() => {
                        this.state = 2;
                        this.wt();
                        if (this.$initiator !== this) this.parent.dt();
                    })).catch((t => {
                        this.ct(t);
                    }));
                    bi = void 0;
                    return;
                }
                bi = void 0;
            }
            this.state = 2;
            this.wt();
        }
        if (this.$initiator !== this) this.parent.dt();
    }
    vt() {
        ++this.J;
    }
    gt() {
        if (0 === --this.J) {
            if (this.debug) this.logger.trace(`detach()`);
            this.bt();
            this.removeNodes();
            let t = this.$initiator.head;
            while (null !== t) {
                if (t !== this) {
                    if (t.debug) t.logger.trace(`detach()`);
                    t.removeNodes();
                }
                if (t.hooks.hasUnbinding) {
                    if (t.debug) t.logger.trace("unbinding()");
                    bi = t.viewModel.unbinding(t.$initiator, t.parent, t.$flags);
                    if (bi instanceof Promise) {
                        this.at();
                        this.bt();
                        bi.then((() => {
                            this.yt();
                        })).catch((t => {
                            this.ct(t);
                        }));
                    }
                    bi = void 0;
                }
                t = t.next;
            }
            this.yt();
        }
    }
    bt() {
        ++this.tt;
    }
    yt() {
        if (0 === --this.tt) {
            if (this.debug) this.logger.trace(`unbind()`);
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
            return fe.getDefinition(this.viewModel.constructor).name === t;

          case 0:
            return Ce.getDefinition(this.viewModel.constructor).name === t;

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
            Ci(t, Ce.name, this);
            Ci(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = 1;
        return this;
    }
    setShadowRoot(t) {
        if (0 === this.vmKind) {
            Ci(t, Ce.name, this);
            Ci(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = 2;
        return this;
    }
    setLocation(t) {
        if (0 === this.vmKind) {
            Ci(t, Ce.name, this);
            Ci(t, this.definition.key, this);
        }
        this.location = t;
        this.mountTarget = 3;
        return this;
    }
    release() {
        this.state |= 16;
    }
    dispose() {
        if (this.debug) this.logger.trace(`dispose()`);
        if (32 === (32 & this.state)) return;
        this.state |= 32;
        if (this.hooks.hasDispose) this.viewModel.dispose();
        if (null !== this.children) {
            this.children.forEach(pi);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (null !== this.viewModel) {
            ei.delete(this.viewModel);
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

function ii(t) {
    let e = t.$observers;
    if (void 0 === e) Reflect.defineProperty(t, "$observers", {
        enumerable: false,
        value: e = {}
    });
    return e;
}

function si(t, e, i, s) {
    const n = e.bindables;
    const o = Object.getOwnPropertyNames(n);
    const r = o.length;
    if (r > 0) {
        let e;
        let i;
        let l = 0;
        const h = ii(s);
        for (;l < r; ++l) {
            e = o[l];
            if (void 0 === h[e]) {
                i = n[e];
                h[e] = new BindableObserver(s, e, i.callback, i.set, t);
            }
        }
    }
}

function ni(t, e, i, s) {
    const n = e.childrenObservers;
    const o = Object.getOwnPropertyNames(n);
    const r = o.length;
    if (r > 0) {
        const e = ii(s);
        const i = [];
        let l;
        let h = 0;
        let a;
        for (;h < r; ++h) {
            l = o[h];
            if (void 0 == e[l]) {
                a = n[l];
                i[i.length] = e[l] = new ChildrenObserver(t, s, l, a.callback, a.query, a.filter, a.map, a.options);
            }
        }
        return i;
    }
    return l;
}

const oi = new Map;

const ri = t => {
    let e = oi.get(t);
    if (null == e) {
        e = new _(t, 0);
        oi.set(t, e);
    }
    return e;
};

function li(t, e, i, s) {
    const n = e.get(V);
    const o = e.get(j);
    const r = i.watches;
    const l = 0 === t.vmKind ? t.scope : F.create(s, null, true);
    const h = r.length;
    let a;
    let c;
    let u;
    let f = 0;
    for (;h > f; ++f) {
        ({expression: a, callback: c} = r[f]);
        c = "function" === typeof c ? c : Reflect.get(s, c);
        if ("function" !== typeof c) throw new Error(`Invalid callback for @watch decorator: ${String(c)}`);
        if ("function" === typeof a) t.addBinding(new ComputedWatcher(s, n, a, c, true)); else {
            u = "string" === typeof a ? o.parse(a, 53) : ri(a);
            t.addBinding(new ExpressionWatcher(l, e, n, u, c));
        }
    }
}

function hi(t) {
    return t instanceof Controller && 0 === t.vmKind;
}

function ai(t) {
    return k(t) && Ce.isType(t.constructor);
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

const ci = {
    mode: "open"
};

var ui;

(function(t) {
    t[t["customElement"] = 0] = "customElement";
    t[t["customAttribute"] = 1] = "customAttribute";
    t[t["synthetic"] = 2] = "synthetic";
})(ui || (ui = {}));

var fi;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["activating"] = 1] = "activating";
    t[t["activated"] = 2] = "activated";
    t[t["deactivating"] = 4] = "deactivating";
    t[t["deactivated"] = 8] = "deactivated";
    t[t["released"] = 16] = "released";
    t[t["disposed"] = 32] = "disposed";
})(fi || (fi = {}));

function di(t) {
    const e = [];
    if (1 === (1 & t)) e.push("activating");
    if (2 === (2 & t)) e.push("activated");
    if (4 === (4 & t)) e.push("deactivating");
    if (8 === (8 & t)) e.push("deactivated");
    if (16 === (16 & t)) e.push("released");
    if (32 === (32 & t)) e.push("disposed");
    return 0 === e.length ? "none" : e.join("|");
}

const mi = h.createInterface("IController");

const vi = h.createInterface("IHydrationContext");

class HydrationContext {
    constructor(t, e, i) {
        this.instruction = e;
        this.parent = i;
        this.controller = t;
    }
}

function pi(t) {
    t.dispose();
}

let gi;

let wi;

let bi;

const yi = h.createInterface("IAppRoot");

const xi = h.createInterface("IWorkTracker", (t => t.singleton(WorkTracker)));

class WorkTracker {
    constructor(t) {
        this.xt = 0;
        this.kt = null;
        this.wt = null;
        this.Ct = t.scopeTo("WorkTracker");
    }
    start() {
        this.Ct.trace(`start(stack:${this.xt})`);
        ++this.xt;
    }
    finish() {
        this.Ct.trace(`finish(stack:${this.xt})`);
        if (0 === --this.xt) {
            const t = this.wt;
            if (null !== t) {
                this.wt = this.kt = null;
                t();
            }
        }
    }
    wait() {
        this.Ct.trace(`wait(stack:${this.xt})`);
        if (null === this.kt) {
            if (0 === this.xt) return Promise.resolve();
            this.kt = new Promise((t => {
                this.wt = t;
            }));
        }
        return this.kt;
    }
}

WorkTracker.inject = [ x ];

class AppRoot {
    constructor(t, e, i, s) {
        this.config = t;
        this.platform = e;
        this.container = i;
        this.controller = void 0;
        this.At = void 0;
        this.host = t.host;
        this.work = i.get(xi);
        s.prepare(this);
        i.registerResolver(Ai, i.registerResolver(e.Element, new y("ElementProvider", t.host)));
        this.At = C(this.St("beforeCreate"), (() => {
            const e = t.component;
            const s = i.createChild();
            let n;
            if (Ce.isType(e)) n = this.container.get(e); else n = t.component;
            const o = {
                hydrate: false,
                projections: null
            };
            const r = this.controller = Controller.$el(s, n, this.host, o, 0);
            r.it(o, null);
            return C(this.St("hydrating"), (() => {
                r.ot(null);
                return C(this.St("hydrated"), (() => {
                    r.rt();
                    this.At = void 0;
                }));
            }));
        }));
    }
    activate() {
        return C(this.At, (() => C(this.St("beforeActivate"), (() => C(this.controller.activate(this.controller, null, 2, void 0), (() => this.St("afterActivate")))))));
    }
    deactivate() {
        return C(this.St("beforeDeactivate"), (() => C(this.controller.deactivate(this.controller, null, 0), (() => this.St("afterDeactivate")))));
    }
    St(t) {
        return A(...this.container.getAll(Qt).reduce(((e, i) => {
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

function ki(t, e) {
    var i, s;
    return null !== (s = null === (i = t.$au) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : null;
}

function Ci(t, e, i) {
    var s;
    var n;
    (null !== (s = (n = t).$au) && void 0 !== s ? s : n.$au = new Refs)[e] = i;
}

const Ai = h.createInterface("INode");

const Si = h.createInterface("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(yi, true)) return t.get(yi).host;
    return t.get(Bt).document;
}))));

const Ei = h.createInterface("IRenderLocation");

var Bi;

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
})(Bi || (Bi = {}));

const Ti = new WeakMap;

function Ii(t) {
    if (Ti.has(t)) return Ti.get(t);
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
        const e = Ce.for(t);
        if (void 0 === e) return null;
        if (2 === e.mountTarget) return Ii(e.host);
    }
    return t.parentNode;
}

function Ri(t, e) {
    if (void 0 !== t.platform && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) Ti.set(i[t], e);
    } else Ti.set(t, e);
}

function Di(t) {
    if (Pi(t)) return t;
    const e = t.ownerDocument.createComment("au-end");
    const i = t.ownerDocument.createComment("au-start");
    if (null !== t.parentNode) {
        t.parentNode.replaceChild(e, t);
        e.parentNode.insertBefore(i, e);
    }
    e.$start = i;
    return e;
}

function Pi(t) {
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
        let o;
        let r = this.targets = Array(n);
        while (n > s) {
            o = i[s];
            if ("AU-M" === o.nodeName) r[s] = Di(o); else r[s] = o;
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
        if (Pi(t)) this.refNode = t; else {
            this.next = t;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (void 0 !== this.next) this.refNode = this.next.firstChild; else this.refNode = void 0;
    }
}

const Oi = h.createInterface("IWindow", (t => t.callback((t => t.get(Bt).window))));

const $i = h.createInterface("ILocation", (t => t.callback((t => t.get(Oi).location))));

const Li = h.createInterface("IHistory", (t => t.callback((t => t.get(Oi).history))));

const qi = {
    [N.capturing]: {
        capture: true
    },
    [N.bubbling]: {
        capture: false
    }
};

class Listener {
    constructor(t, e, i, s, n, o, r, l) {
        this.platform = t;
        this.targetEvent = e;
        this.delegationStrategy = i;
        this.sourceExpression = s;
        this.target = n;
        this.preventDefault = o;
        this.eventDelegator = r;
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
        if (this.delegationStrategy === N.none) this.target.addEventListener(this.targetEvent, this); else this.handler = this.eventDelegator.addEventListener(this.locator.get(Si), this.target, this.targetEvent, this, qi[this.delegationStrategy]);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        const e = this.sourceExpression;
        if (e.hasUnbind) e.unbind(t, this.$scope, this.interceptor);
        this.$scope = null;
        if (this.delegationStrategy === N.none) this.target.removeEventListener(this.targetEvent, this); else {
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

const Mi = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = Mi) {
        this.Et = t;
        this.Bt = e;
        this.Tt = i;
        this.count = 0;
        this.It = new Map;
        this.Rt = new Map;
    }
    increment() {
        if (1 === ++this.count) this.Et.addEventListener(this.Bt, this, this.Tt);
    }
    decrement() {
        if (0 === --this.count) this.Et.removeEventListener(this.Bt, this, this.Tt);
    }
    dispose() {
        if (this.count > 0) {
            this.count = 0;
            this.Et.removeEventListener(this.Bt, this, this.Tt);
        }
        this.It.clear();
        this.Rt.clear();
    }
    getLookup(t) {
        const e = true === this.Tt.capture ? this.It : this.Rt;
        let i = e.get(t);
        if (void 0 === i) e.set(t, i = Object.create(null));
        return i;
    }
    handleEvent(t) {
        const e = true === this.Tt.capture ? this.It : this.Rt;
        const i = t.composedPath();
        if (true === this.Tt.capture) i.reverse();
        for (const s of i) {
            const i = e.get(s);
            if (void 0 === i) continue;
            const n = i[this.Bt];
            if (void 0 === n) continue;
            if ("function" === typeof n) n(t); else n.handleEvent(t);
            if (true === t.cancelBubble) return;
        }
    }
}

class DelegateSubscription {
    constructor(t, e, i, s) {
        this.Dt = t;
        this.Pt = e;
        this.Bt = i;
        t.increment();
        e[i] = s;
    }
    dispose() {
        this.Dt.decrement();
        this.Pt[this.Bt] = void 0;
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
        for (const i of this.config.events) t.addEventListener(i, e);
    }
    dispose() {
        const {target: t, handler: e} = this;
        let i;
        if (null !== t && null !== e) for (i of this.config.events) t.removeEventListener(i, e);
        this.target = this.handler = null;
    }
}

const Fi = h.createInterface("IEventDelegator", (t => t.singleton(EventDelegator)));

class EventDelegator {
    constructor() {
        this.Ot = Object.create(null);
    }
    addEventListener(t, e, i, s, n) {
        var o;
        var r;
        const l = null !== (o = (r = this.Ot)[i]) && void 0 !== o ? o : r[i] = new Map;
        let h = l.get(t);
        if (void 0 === h) l.set(t, h = new ListenerTracker(t, i, n));
        return new DelegateSubscription(h, h.getLookup(e), i, s);
    }
    dispose() {
        for (const t in this.Ot) {
            const e = this.Ot[t];
            for (const t of e.values()) t.dispose();
            e.clear();
        }
    }
}

const Vi = h.createInterface("IProjections");

const ji = h.createInterface("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

var _i;

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
})(_i || (_i = {}));

const Ni = h.createInterface("Instruction");

function Hi(t) {
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

const Wi = h.createInterface("ITemplateCompiler");

const Ui = h.createInterface("IRenderer");

function zi(t) {
    return function e(i) {
        const n = function(...e) {
            const s = new i(...e);
            s.instructionType = t;
            return s;
        };
        n.register = function t(e) {
            c.singleton(Ui, n).register(e);
        };
        const o = s.getOwnKeys(i);
        for (const t of o) s.define(t, s.getOwn(t, i), n);
        const r = Object.getOwnPropertyDescriptors(i);
        Object.keys(r).filter((t => "prototype" !== t)).forEach((t => {
            Reflect.defineProperty(n, t, r[t]);
        }));
        return n;
    };
}

function Gi(t, e, i) {
    if ("string" === typeof e) return t.parse(e, i);
    return e;
}

function Xi(t) {
    if (null != t.viewModel) return t.viewModel;
    return t;
}

function Ki(t, e) {
    if ("element" === e) return t;
    switch (e) {
      case "controller":
        return Ce.for(t);

      case "view":
        throw new Error("Not supported API");

      case "view-model":
        return Ce.for(t).viewModel;

      default:
        {
            const i = fe.for(t, e);
            if (void 0 !== i) return i.viewModel;
            const s = Ce.for(t, {
                name: e
            });
            if (void 0 === s) throw new Error(`Attempted to reference "${e}", but it was not found amongst the target's API.`);
            return s.viewModel;
        }
    }
}

let Yi = class SetPropertyRenderer {
    render(t, e, i, s) {
        const n = Xi(i);
        if (void 0 !== n.$observers && void 0 !== n.$observers[s.to]) n.$observers[s.to].setValue(s.value, 2); else n[s.to] = s.value;
    }
};

Yi = ot([ zi("re") ], Yi);

let Qi = class CustomElementRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Ze, Bt ];
    }
    render(t, e, i, s) {
        let n;
        let o;
        let r;
        let l;
        const h = s.res;
        const a = s.projections;
        const c = e.container;
        const u = ks(this.p, e, i, s, i, null == a ? void 0 : new AuSlotsInfo(Object.keys(a)));
        switch (typeof h) {
          case "string":
            n = c.find(Ce, h);
            if (null == n) throw new Error(`Element ${h} is not registered in ${e["name"]}.`);
            break;

          default:
            n = h;
        }
        o = n.Type;
        r = u.invoke(o);
        u.registerResolver(o, new y(n.key, r));
        l = Controller.$el(u, r, i, s, t, n);
        t = l.flags;
        Ci(i, n.key, l);
        const f = this.r.renderers;
        const d = s.props;
        const m = d.length;
        let v = 0;
        let p;
        while (m > v) {
            p = d[v];
            f[p.type].render(t, e, l, p);
            ++v;
        }
        e.addChild(l);
    }
};

Qi = ot([ zi("ra") ], Qi);

let Zi = class CustomAttributeRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Ze, Bt ];
    }
    render(t, e, i, s) {
        let n = e.container;
        let o;
        switch (typeof s.res) {
          case "string":
            o = n.find(fe, s.res);
            if (null == o) throw new Error(`Attribute ${s.res} is not registered in ${e["name"]}.`);
            break;

          default:
            o = s.res;
        }
        const r = Cs(this.p, o, e, i, s, void 0, void 0);
        const l = Controller.$attr(e.container, r, i, t, o);
        Ci(i, o.key, l);
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

Zi = ot([ zi("rb") ], Zi);

let Ji = class TemplateControllerRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Ze, Bt ];
    }
    render(t, e, i, s) {
        var n;
        let o = e.container;
        let r;
        switch (typeof s.res) {
          case "string":
            r = o.find(fe, s.res);
            if (null == r) throw new Error(`Attribute ${s.res} is not registered in ${e["name"]}.`);
            break;

          default:
            r = s.res;
        }
        const l = this.r.getViewFactory(s.def, o);
        const h = Di(i);
        const a = Cs(this.p, r, e, i, s, l, h);
        const c = Controller.$attr(e.container, a, i, t, r);
        Ci(h, r.key, c);
        null === (n = a.link) || void 0 === n ? void 0 : n.call(a, t, e, c, i, s);
        const u = this.r.renderers;
        const f = s.props;
        const d = f.length;
        let m = 0;
        let v;
        while (d > m) {
            v = f[m];
            u[v.type].render(t, e, c, v);
            ++m;
        }
        e.addChild(c);
    }
};

Ji = ot([ zi("rc") ], Ji);

let ts = class LetElementRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        i.remove();
        const n = s.instructions;
        const o = s.toBindingContext;
        const r = e.container;
        const l = n.length;
        let h;
        let a;
        let c;
        let u = 0;
        while (l > u) {
            h = n[u];
            a = Gi(this.parser, h.from, 48);
            c = new LetBinding(a, h.to, this.oL, r, o);
            e.addBinding(38962 === a.$kind ? hs(c, a, r) : c);
            ++u;
        }
    }
};

ts = ot([ zi("rd"), rt(0, j), rt(1, V) ], ts);

let es = class CallBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        const n = Gi(this.parser, s.from, 153);
        const o = new CallBinding(n, Xi(i), s.to, this.oL, e.container);
        e.addBinding(38962 === n.$kind ? hs(o, n, e.container) : o);
    }
};

es.inject = [ j, V ];

es = ot([ zi("rh") ], es);

let is = class RefBindingRenderer {
    constructor(t) {
        this.parser = t;
    }
    render(t, e, i, s) {
        const n = Gi(this.parser, s.from, 5376);
        const o = new RefBinding(n, Ki(i, s.to), e.container);
        e.addBinding(38962 === n.$kind ? hs(o, n, e.container) : o);
    }
};

is = ot([ zi("rj"), rt(0, j) ], is);

let ss = class InterpolationBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = e.container;
        const o = Gi(this.parser, s.from, 2048);
        const r = new InterpolationBinding(this.oL, o, Xi(i), s.to, D.toView, n, this.p.domWriteQueue);
        const l = r.partBindings;
        const h = l.length;
        let a = 0;
        let c;
        for (;h > a; ++a) {
            c = l[a];
            if (38962 === c.sourceExpression.$kind) l[a] = hs(c, c.sourceExpression, n);
        }
        e.addBinding(r);
    }
};

ss = ot([ zi("rf"), rt(0, j), rt(1, V), rt(2, Bt) ], ss);

let ns = class PropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Gi(this.parser, s.from, 48 | s.mode);
        const o = new PropertyBinding(n, Xi(i), s.to, s.mode, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === n.$kind ? hs(o, n, e.container) : o);
    }
};

ns = ot([ zi("rg"), rt(0, j), rt(1, V), rt(2, Bt) ], ns);

let os = class IteratorBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Gi(this.parser, s.from, 539);
        const o = new PropertyBinding(n, Xi(i), s.to, D.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(o);
    }
};

os = ot([ zi("rk"), rt(0, j), rt(1, V), rt(2, Bt) ], os);

let rs = 0;

const ls = [];

function hs(t, e, i) {
    while (e instanceof H) {
        ls[rs++] = e;
        e = e.expression;
    }
    while (rs > 0) {
        const e = ls[--rs];
        const s = i.get(e.behaviorKey);
        if (s instanceof W) t = s.construct(t, e);
    }
    ls.length = 0;
    return t;
}

let as = class TextBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = e.container;
        const o = i.nextSibling;
        const r = i.parentNode;
        const l = this.p.document;
        const h = Gi(this.parser, s.from, 2048);
        const a = h.parts;
        const c = h.expressions;
        const u = c.length;
        let f = 0;
        let d = a[0];
        let m;
        let v;
        if ("" !== d) r.insertBefore(l.createTextNode(d), o);
        for (;u > f; ++f) {
            v = c[f];
            m = new ContentBinding(v, r.insertBefore(l.createTextNode(""), o), n, this.oL, this.p, s.strict);
            e.addBinding(38962 === v.$kind ? hs(m, v, n) : m);
            d = a[f + 1];
            if ("" !== d) r.insertBefore(l.createTextNode(d), o);
        }
        if ("AU-M" === i.nodeName) i.remove();
    }
};

as = ot([ zi("ha"), rt(0, j), rt(1, V), rt(2, Bt) ], as);

let cs = class ListenerBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.eventDelegator = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Gi(this.parser, s.from, 80 | s.strategy + 6);
        const o = new Listener(this.p, s.to, s.strategy, n, i, s.preventDefault, this.eventDelegator, e.container);
        e.addBinding(38962 === n.$kind ? hs(o, n, e.container) : o);
    }
};

cs = ot([ zi("hb"), rt(0, j), rt(1, Fi), rt(2, Bt) ], cs);

let us = class SetAttributeRenderer {
    render(t, e, i, s) {
        i.setAttribute(s.to, s.value);
    }
};

us = ot([ zi("he") ], us);

let fs = class SetClassAttributeRenderer {
    render(t, e, i, s) {
        ps(i.classList, s.value);
    }
};

fs = ot([ zi("hf") ], fs);

let ds = class SetStyleAttributeRenderer {
    render(t, e, i, s) {
        i.style.cssText += s.value;
    }
};

ds = ot([ zi("hg") ], ds);

let ms = class StylePropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Gi(this.parser, s.from, 48 | D.toView);
        const o = new PropertyBinding(n, i.style, s.to, D.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === n.$kind ? hs(o, n, e.container) : o);
    }
};

ms = ot([ zi("hd"), rt(0, j), rt(1, V), rt(2, Bt) ], ms);

let vs = class AttributeBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        const n = Gi(this.parser, s.from, 48 | D.toView);
        const o = new AttributeBinding(n, i, s.attr, s.to, D.toView, this.oL, e.container);
        e.addBinding(38962 === n.$kind ? hs(o, n, e.container) : o);
    }
};

vs = ot([ zi("hc"), rt(0, j), rt(1, V) ], vs);

function ps(t, e) {
    const i = e.length;
    let s = 0;
    for (let n = 0; n < i; ++n) if (32 === e.charCodeAt(n)) {
        if (n !== s) t.add(e.slice(s, n));
        s = n + 1;
    } else if (n + 1 === i) t.add(e.slice(s));
}

const gs = "ElementProvider";

const ws = "IController";

const bs = "IInstruction";

const ys = "IRenderLocation";

const xs = "IAuSlotsInfo";

function ks(t, e, i, s, n, o) {
    const r = e.container.createChild();
    r.registerResolver(t.Element, r.registerResolver(Ai, new y(gs, i)));
    r.registerResolver(mi, new y(ws, e));
    r.registerResolver(Ni, new y(bs, s));
    r.registerResolver(Ei, null == n ? As : new y(ys, n));
    r.registerResolver(We, Ss);
    r.registerResolver(ji, null == o ? Es : new y(xs, o));
    return r;
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
        if (null === t) throw new Error("Cannot resolve ViewFactory before the provider was prepared.");
        if ("string" !== typeof t.name || 0 === t.name.length) throw new Error("Cannot resolve ViewFactory without a (valid) name.");
        return t;
    }
}

function Cs(t, e, i, s, n, o, r, l) {
    const h = i.container.createChild();
    h.registerResolver(t.Element, h.registerResolver(Ai, new y(gs, s)));
    h.registerResolver(mi, new y(ws, i));
    h.registerResolver(Ni, new y(bs, n));
    h.registerResolver(Ei, null == r ? As : new y(ys, r));
    h.registerResolver(We, null == o ? Ss : new ViewFactoryProvider(o));
    h.registerResolver(ji, null == l ? Es : new y(xs, l));
    return h.invoke(e.Type);
}

const As = new y(ys);

const Ss = new ViewFactoryProvider(null);

const Es = new y(xs, new AuSlotsInfo(l));

function Bs(t) {
    return function(e) {
        return Is.define(t, e);
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
        return new BindingCommandDefinition(e, n(Is.getAnnotation(e, "name"), i), f(Is.getAnnotation(e, "aliases"), s.aliases, e.aliases), Is.keyFrom(i), n(Is.getAnnotation(e, "type"), s.type, e.type, null));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        c.singleton(i, e).register(t);
        c.aliasTo(i, e).register(t);
        L(s, Is, i, t);
    }
}

const Ts = e.resource.keyFor("binding-command");

const Is = Object.freeze({
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
        if (void 0 === e) throw new Error(`No definition found for type ${t.name}`);
        return e;
    },
    annotate(t, i, n) {
        s.define(e.annotation.keyFor(i), n, t);
    },
    getAnnotation(t, i) {
        return s.getOwn(e.annotation.keyFor(i), t);
    }
});

let Rs = class OneTimeBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 49;
    }
    static get inject() {
        return [ Rt ];
    }
    build(t) {
        var e;
        let i;
        if (null == t.bindable) i = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : S(t.attr.target); else i = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, i, D.oneTime);
    }
};

Rs = ot([ Bs("one-time") ], Rs);

let Ds = class ToViewBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 50;
    }
    static get inject() {
        return [ Rt ];
    }
    build(t) {
        var e;
        let i;
        if (null == t.bindable) i = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : S(t.attr.target); else i = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, i, D.toView);
    }
};

Ds = ot([ Bs("to-view") ], Ds);

let Ps = class FromViewBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 51;
    }
    static get inject() {
        return [ Rt ];
    }
    build(t) {
        var e;
        let i;
        if (null == t.bindable) i = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : S(t.attr.target); else i = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, i, D.fromView);
    }
};

Ps = ot([ Bs("from-view") ], Ps);

let Os = class TwoWayBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 52;
    }
    static get inject() {
        return [ Rt ];
    }
    build(t) {
        var e;
        let i;
        if (null == t.bindable) i = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : S(t.attr.target); else i = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, i, D.twoWay);
    }
};

Os = ot([ Bs("two-way") ], Os);

let $s = class DefaultBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 53;
    }
    static get inject() {
        return [ Rt ];
    }
    build(t) {
        var e;
        const i = t.attr.target;
        const s = t.bindable;
        let n;
        let o;
        let r;
        if (null == s) {
            o = this.m.isTwoWay(t.node, i) ? D.twoWay : D.toView;
            r = null !== (e = this.m.map(t.node, i)) && void 0 !== e ? e : S(i);
        } else {
            n = t.def.defaultBindingMode;
            o = s.mode === D.default || null == s.mode ? null == n || n === D.default ? D.toView : n : s.mode;
            r = s.property;
        }
        return new PropertyBindingInstruction(t.expr, r, o);
    }
};

$s = ot([ Bs("bind") ], $s);

let Ls = class CallBindingCommand {
    constructor() {
        this.bindingType = 153;
    }
    build(t) {
        const e = null === t.bindable ? S(t.attr.target) : t.bindable.property;
        return new CallBindingInstruction(t.expr, e);
    }
};

Ls = ot([ Bs("call") ], Ls);

let qs = class ForBindingCommand {
    constructor() {
        this.bindingType = 539;
    }
    build(t) {
        const e = null === t.bindable ? S(t.attr.target) : t.bindable.property;
        return new IteratorBindingInstruction(t.expr, e);
    }
};

qs = ot([ Bs("for") ], qs);

let Ms = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, true, N.none);
    }
};

Ms = ot([ Bs("trigger") ], Ms);

let Fs = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, false, N.bubbling);
    }
};

Fs = ot([ Bs("delegate") ], Fs);

let Vs = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, false, N.capturing);
    }
};

Vs = ot([ Bs("capture") ], Vs);

let js = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction(t.attr.target, t.expr, t.attr.target);
    }
};

js = ot([ Bs("attr") ], js);

let _s = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("style", t.expr, t.attr.target);
    }
};

_s = ot([ Bs("style") ], _s);

let Ns = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("class", t.expr, t.attr.target);
    }
};

Ns = ot([ Bs("class") ], Ns);

let Hs = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new RefBindingInstruction(t.expr, t.attr.target);
    }
};

Hs = ot([ Bs("ref") ], Hs);

const Ws = h.createInterface("ITemplateElementFactory", (t => t.singleton(TemplateElementFactory)));

const Us = {};

class TemplateElementFactory {
    constructor(t) {
        this.p = t;
        this.$t = t.document.createElement("template");
    }
    createTemplate(t) {
        var e;
        if ("string" === typeof t) {
            let e = Us[t];
            if (void 0 === e) {
                const i = this.$t;
                i.innerHTML = t;
                const s = i.content.firstElementChild;
                if (null == s || "TEMPLATE" !== s.nodeName || null != s.nextElementSibling) {
                    this.$t = this.p.document.createElement("template");
                    e = i;
                } else {
                    i.content.removeChild(s);
                    e = s;
                }
                Us[t] = e;
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

TemplateElementFactory.inject = [ Bt ];

const zs = function(t) {
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
        return c.singleton(Wi, this).register(t);
    }
    compile(t, e, i) {
        var s, n, o, r;
        const h = CustomElementDefinition.getOrCreate(t);
        if (null === h.template || void 0 === h.template) return h;
        if (false === h.needsCompile) return h;
        null !== i && void 0 !== i ? i : i = Ks;
        const a = new CompilationContext(t, e, i, null, null, void 0);
        const c = "string" === typeof h.template || !t.enhance ? a.Lt.createTemplate(h.template) : h.template;
        const u = "TEMPLATE" === c.nodeName && null != c.content;
        const f = u ? c.content : c;
        const d = e.get(zs(ln));
        const m = d.length;
        let v = 0;
        if (m > 0) while (m > v) {
            null === (n = (s = d[v]).compiling) || void 0 === n ? void 0 : n.call(s, c);
            ++v;
        }
        if (c.hasAttribute(nn)) throw new Error("The root cannot be a local template itself.");
        this.qt(f, a);
        this.Mt(f, a);
        return CustomElementDefinition.create({
            ...t,
            name: t.name || Ce.generateName(),
            dependencies: (null !== (o = t.dependencies) && void 0 !== o ? o : l).concat(null !== (r = a.deps) && void 0 !== r ? r : l),
            instructions: a.rows,
            surrogates: u ? this.Ft(c, a) : l,
            template: c,
            hasSlots: a.hasSlot,
            needsCompile: false
        });
    }
    Ft(t, e) {
        var i;
        const s = [];
        const n = t.attributes;
        const o = e.Vt;
        let r = n.length;
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
        let y;
        let x;
        for (;r > l; ++l) {
            h = n[l];
            a = h.name;
            c = h.value;
            u = e.jt.parse(a, c);
            y = u.target;
            x = u.rawValue;
            if (Zs[y]) throw new Error(`Attribute ${a} is invalid on surrogate.`);
            g = e._t(u);
            if (null !== g && 4096 & g.bindingType) {
                w = o.parse(x, g.bindingType);
                Qs.node = t;
                Qs.attr = u;
                Qs.expr = w;
                Qs.bindable = null;
                Qs.def = null;
                s.push(g.build(Qs));
                continue;
            }
            f = e.Nt(y);
            if (null !== f) {
                if (f.isTemplateController) throw new Error(`Template controller ${y} is invalid on surrogate.`);
                v = BindablesInfo.from(f, true);
                b = false === f.noMultiBindings && null === g && Gs(x);
                if (b) m = this.Ht(t, x, f, e); else {
                    p = v.primary;
                    if (null === g) {
                        w = o.parse(x, 2048);
                        m = [ null === w ? new SetPropertyInstruction(x, p.property) : new InterpolationInstruction(w, p.property) ];
                    } else {
                        w = o.parse(x, g.bindingType);
                        Qs.node = t;
                        Qs.attr = u;
                        Qs.expr = w;
                        Qs.bindable = p;
                        Qs.def = f;
                        m = [ g.build(Qs) ];
                    }
                }
                t.removeAttribute(a);
                --l;
                --r;
                (null !== d && void 0 !== d ? d : d = []).push(new HydrateAttributeInstruction(this.resolveResources ? f : f.name, null != f.aliases && f.aliases.includes(y) ? y : void 0, m));
                continue;
            }
            if (null === g) {
                w = o.parse(x, 2048);
                if (null != w) {
                    t.removeAttribute(a);
                    --l;
                    --r;
                    s.push(new InterpolationInstruction(w, null !== (i = e.Wt.map(t, y)) && void 0 !== i ? i : S(y)));
                } else switch (a) {
                  case "class":
                    s.push(new SetClassAttributeInstruction(x));
                    break;

                  case "style":
                    s.push(new SetStyleAttributeInstruction(x));
                    break;

                  default:
                    s.push(new SetAttributeInstruction(x, a));
                }
            } else {
                w = o.parse(x, g.bindingType);
                Qs.node = t;
                Qs.attr = u;
                Qs.expr = w;
                Qs.bindable = null;
                Qs.def = null;
                s.push(g.build(Qs));
            }
        }
        Xs();
        if (null != d) return d.concat(s);
        return s;
    }
    Mt(t, e) {
        switch (t.nodeType) {
          case 1:
            switch (t.nodeName) {
              case "LET":
                return this.Ut(t, e);

              default:
                return this.zt(t, e);
            }

          case 3:
            return this.Gt(t, e);

          case 11:
            {
                let i = t.firstChild;
                while (null !== i) i = this.Mt(i, e);
                break;
            }
        }
        return t.nextSibling;
    }
    Ut(t, e) {
        const i = t.attributes;
        const s = i.length;
        const n = [];
        const o = e.Vt;
        let r = false;
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
                r = true;
                continue;
            }
            a = e.jt.parse(c, u);
            d = a.target;
            m = a.rawValue;
            f = e._t(a);
            if (null !== f) {
                if (50 === f.bindingType || 53 === f.bindingType) {
                    n.push(new LetBindingInstruction(o.parse(m, f.bindingType), S(d)));
                    continue;
                }
                throw new Error(`Invalid command ${a.command} for <let>. Only to-view/bind supported.`);
            }
            v = o.parse(m, 2048);
            if (null === v) e.Ct.warn(`Property ${d} is declared with literal string ${m}. ` + `Did you mean ${d}.bind="${m}"?`);
            n.push(new LetBindingInstruction(null === v ? new U(m) : v, S(d)));
        }
        e.rows.push([ new HydrateLetElementInstruction(n, r) ]);
        return this.Xt(t).nextSibling;
    }
    zt(t, e) {
        var i, s, n, o, h;
        var a, c;
        const u = t.nextSibling;
        const f = (null !== (i = t.getAttribute("as-element")) && void 0 !== i ? i : t.nodeName).toLowerCase();
        const d = e.Kt(f);
        const m = e.Vt;
        const v = this.debug ? r : () => {
            t.removeAttribute(x);
            --b;
            --w;
        };
        let p = t.attributes;
        let g;
        let w = p.length;
        let b = 0;
        let y;
        let x;
        let k;
        let C;
        let A;
        let E;
        let B = null;
        let T = false;
        let I;
        let R;
        let D;
        let P;
        let O;
        let $;
        let L;
        let q = null;
        let M;
        let F;
        let V;
        let j;
        let _ = true;
        let N = false;
        if ("slot" === f) e.root.hasSlot = true;
        if (null !== d) {
            _ = null === (s = d.processContent) || void 0 === s ? void 0 : s.call(d.Type, t, e.p);
            p = t.attributes;
            w = p.length;
        }
        if (e.root.def.enhance && t.classList.contains("au")) throw new Error(`AUR0710`);
        for (;w > b; ++b) {
            y = p[b];
            x = y.name;
            k = y.value;
            switch (x) {
              case "as-element":
              case "containerless":
                v();
                if (!N) N = "containerless" === x;
                continue;
            }
            C = e.jt.parse(x, k);
            q = e._t(C);
            if (null !== q && 4096 & q.bindingType) {
                $ = m.parse(k, q.bindingType);
                Qs.node = t;
                Qs.attr = C;
                Qs.expr = $;
                Qs.bindable = null;
                Qs.def = null;
                (null !== A && void 0 !== A ? A : A = []).push(q.build(Qs));
                v();
                continue;
            }
            V = C.target;
            j = C.rawValue;
            B = e.Nt(V);
            if (null !== B) {
                M = BindablesInfo.from(B, true);
                T = false === B.noMultiBindings && null === q && Gs(k);
                if (T) D = this.Ht(t, k, B, e); else {
                    F = M.primary;
                    if (null === q) {
                        $ = m.parse(k, 2048);
                        D = [ null === $ ? new SetPropertyInstruction(k, F.property) : new InterpolationInstruction($, F.property) ];
                    } else {
                        $ = m.parse(k, q.bindingType);
                        Qs.node = t;
                        Qs.attr = C;
                        Qs.expr = $;
                        Qs.bindable = F;
                        Qs.def = B;
                        D = [ q.build(Qs) ];
                    }
                }
                v();
                if (B.isTemplateController) (null !== P && void 0 !== P ? P : P = []).push(new HydrateTemplateController(Ys, this.resolveResources ? B : B.name, void 0, D)); else (null !== R && void 0 !== R ? R : R = []).push(new HydrateAttributeInstruction(this.resolveResources ? B : B.name, null != B.aliases && B.aliases.includes(V) ? V : void 0, D));
                continue;
            }
            if (null === q) {
                if (null !== d) {
                    M = BindablesInfo.from(d, false);
                    I = M.attrs[V];
                    if (void 0 !== I) {
                        $ = m.parse(j, 2048);
                        (null !== E && void 0 !== E ? E : E = []).push(null == $ ? new SetPropertyInstruction(j, I.property) : new InterpolationInstruction($, I.property));
                        v();
                        continue;
                    }
                }
                $ = m.parse(j, 2048);
                if (null != $) {
                    v();
                    (null !== A && void 0 !== A ? A : A = []).push(new InterpolationInstruction($, null !== (n = e.Wt.map(t, V)) && void 0 !== n ? n : S(V)));
                }
                continue;
            }
            v();
            if (null !== d) {
                M = BindablesInfo.from(d, false);
                I = M.attrs[V];
                if (void 0 !== I) {
                    k = 0 === k.length && (q.bindingType & (53 | 49 | 50 | 52)) > 0 ? S(x) : k;
                    $ = m.parse(k, q.bindingType);
                    Qs.node = t;
                    Qs.attr = C;
                    Qs.expr = $;
                    Qs.bindable = I;
                    Qs.def = d;
                    (null !== E && void 0 !== E ? E : E = []).push(q.build(Qs));
                    continue;
                }
            }
            $ = m.parse(j, q.bindingType);
            Qs.node = t;
            Qs.attr = C;
            Qs.expr = $;
            Qs.bindable = null;
            Qs.def = null;
            (null !== A && void 0 !== A ? A : A = []).push(q.build(Qs));
        }
        Xs();
        if (this.Yt(t) && null != A && A.length > 1) this.Qt(t, A);
        if (null !== d) {
            L = new HydrateElementInstruction(this.resolveResources ? d : d.name, void 0, null !== E && void 0 !== E ? E : l, null, N);
            if ("au-slot" === f) {
                const i = t.getAttribute("name") || "default";
                const s = e.h("template");
                const n = e.Zt();
                let o = t.firstChild;
                while (null !== o) {
                    if (1 === o.nodeType && o.hasAttribute("au-slot")) t.removeChild(o); else s.content.appendChild(o);
                    o = t.firstChild;
                }
                this.Mt(s.content, n);
                L.auSlot = {
                    name: i,
                    fallback: CustomElementDefinition.create({
                        name: Ce.generateName(),
                        template: s,
                        instructions: n.rows,
                        needsCompile: false
                    })
                };
                t = this.Jt(t, e);
            }
        }
        if (null != A || null != L || null != R) {
            g = l.concat(null !== L && void 0 !== L ? L : l, null !== R && void 0 !== R ? R : l, null !== A && void 0 !== A ? A : l);
            this.Xt(t);
        }
        let H;
        if (null != P) {
            w = P.length - 1;
            b = w;
            O = P[b];
            let i;
            this.Jt(t, e);
            if ("TEMPLATE" === t.nodeName) i = t; else {
                i = e.h("template");
                i.content.appendChild(t);
            }
            const s = i;
            const n = e.Zt(null == g ? [] : [ g ]);
            H = null === d || !d.containerless && !N && false !== _;
            if (null !== d && d.containerless) this.Jt(t, e);
            let r;
            let l;
            let h;
            let c;
            let u;
            let f;
            let m;
            let v;
            let p;
            let y = 0, x = 0;
            if (H) {
                if (null !== d) {
                    r = t.firstChild;
                    while (null !== r) if (1 === r.nodeType) {
                        l = r;
                        r = r.nextSibling;
                        h = l.getAttribute("au-slot");
                        if (null !== h) {
                            if ("" === h) h = "default";
                            l.removeAttribute("au-slot");
                            t.removeChild(l);
                            (null !== (o = (a = null !== u && void 0 !== u ? u : u = {})[h]) && void 0 !== o ? o : a[h] = []).push(l);
                        }
                    } else r = r.nextSibling;
                    if (null != u) {
                        c = {};
                        for (h in u) {
                            i = e.h("template");
                            f = u[h];
                            for (y = 0, x = f.length; x > y; ++y) {
                                m = f[y];
                                if ("TEMPLATE" === m.nodeName) if (m.attributes.length > 0) i.content.appendChild(m); else i.content.appendChild(m.content); else i.content.appendChild(m);
                            }
                            p = e.Zt();
                            this.Mt(i.content, p);
                            c[h] = CustomElementDefinition.create({
                                name: Ce.generateName(),
                                template: i,
                                instructions: p.rows,
                                needsCompile: false
                            });
                        }
                        L.projections = c;
                    }
                }
                if ("TEMPLATE" === t.nodeName) this.Mt(t.content, n); else {
                    r = t.firstChild;
                    while (null !== r) r = this.Mt(r, n);
                }
            }
            O.def = CustomElementDefinition.create({
                name: Ce.generateName(),
                template: s,
                instructions: n.rows,
                needsCompile: false
            });
            while (b-- > 0) {
                O = P[b];
                i = e.h("template");
                v = e.h("au-m");
                v.classList.add("au");
                i.content.appendChild(v);
                if (O.def !== Ys) throw new Error(`Invalid definition for processing ${O.res}.`);
                O.def = CustomElementDefinition.create({
                    name: Ce.generateName(),
                    template: i,
                    needsCompile: false,
                    instructions: [ [ P[b + 1] ] ]
                });
            }
            e.rows.push([ O ]);
        } else {
            if (null != g) e.rows.push(g);
            H = null === d || !d.containerless && !N && false !== _;
            if (null !== d && d.containerless) this.Jt(t, e);
            if (H && t.childNodes.length > 0) {
                let i = t.firstChild;
                let s;
                let n;
                let o = null;
                let r;
                let l;
                let a;
                let u;
                let f;
                let m = 0, v = 0;
                while (null !== i) if (1 === i.nodeType) {
                    s = i;
                    i = i.nextSibling;
                    n = s.getAttribute("au-slot");
                    if (null !== n) {
                        if (null === d) throw new Error(`Projection with [au-slot="${n}"] is attempted on a non custom element ${t.nodeName}.`);
                        if ("" === n) n = "default";
                        t.removeChild(s);
                        s.removeAttribute("au-slot");
                        (null !== (h = (c = null !== r && void 0 !== r ? r : r = {})[n]) && void 0 !== h ? h : c[n] = []).push(s);
                    }
                } else i = i.nextSibling;
                if (null != r) {
                    o = {};
                    for (n in r) {
                        u = e.h("template");
                        l = r[n];
                        for (m = 0, v = l.length; v > m; ++m) {
                            a = l[m];
                            if ("TEMPLATE" === a.nodeName) if (a.attributes.length > 0) u.content.appendChild(a); else u.content.appendChild(a.content); else u.content.appendChild(a);
                        }
                        f = e.Zt();
                        this.Mt(u.content, f);
                        o[n] = CustomElementDefinition.create({
                            name: Ce.generateName(),
                            template: u,
                            instructions: f.rows,
                            needsCompile: false
                        });
                    }
                    L.projections = o;
                }
                i = t.firstChild;
                while (null !== i) i = this.Mt(i, e);
            }
        }
        return u;
    }
    Gt(t, e) {
        let i = "";
        let s = t;
        while (null !== s && 3 === s.nodeType) {
            i += s.textContent;
            s = s.nextSibling;
        }
        const n = e.Vt.parse(i, 2048);
        if (null === n) return s;
        const o = t.parentNode;
        o.insertBefore(this.Xt(e.h("au-m")), t);
        e.rows.push([ new TextBindingInstruction(n, !!e.def.isStrictBinding) ]);
        t.textContent = "";
        s = t.nextSibling;
        while (null !== s && 3 === s.nodeType) {
            o.removeChild(s);
            s = t.nextSibling;
        }
        return t.nextSibling;
    }
    Ht(t, e, i, s) {
        const n = BindablesInfo.from(i, true);
        const o = e.length;
        const r = [];
        let l;
        let h;
        let a = 0;
        let c = 0;
        let u;
        let f;
        let d;
        let m;
        for (let v = 0; v < o; ++v) {
            c = e.charCodeAt(v);
            if (92 === c) ++v; else if (58 === c) {
                l = e.slice(a, v);
                while (e.charCodeAt(++v) <= 32) ;
                a = v;
                for (;v < o; ++v) {
                    c = e.charCodeAt(v);
                    if (92 === c) ++v; else if (59 === c) {
                        h = e.slice(a, v);
                        break;
                    }
                }
                if (void 0 === h) h = e.slice(a);
                f = s.jt.parse(l, h);
                d = s._t(f);
                m = n.attrs[f.target];
                if (null == m) throw new Error(`Bindable ${f.target} not found on ${i.name}.`);
                if (null === d) {
                    u = s.Vt.parse(h, 2048);
                    r.push(null === u ? new SetPropertyInstruction(h, m.property) : new InterpolationInstruction(u, m.property));
                } else {
                    u = s.Vt.parse(h, d.bindingType);
                    Qs.node = t;
                    Qs.attr = f;
                    Qs.expr = u;
                    Qs.bindable = m;
                    Qs.def = i;
                    r.push(d.build(Qs));
                }
                while (v < o && e.charCodeAt(++v) <= 32) ;
                a = v;
                l = void 0;
                h = void 0;
            }
        }
        Xs();
        return r;
    }
    qt(t, e) {
        const i = t;
        const s = E(i.querySelectorAll("template[as-custom-element]"));
        const n = s.length;
        if (0 === n) return;
        if (n === i.childElementCount) throw new Error("The custom element does not have any content other than local template(s).");
        const o = new Set;
        for (const t of s) {
            if (t.parentNode !== i) throw new Error("Local templates needs to be defined directly under root.");
            const s = on(t, o);
            const n = class LocalTemplate {};
            const r = t.content;
            const l = E(r.querySelectorAll("bindable"));
            const h = ct.for(n);
            const a = new Set;
            const c = new Set;
            for (const t of l) {
                if (t.parentNode !== r) throw new Error("Bindable properties of local templates needs to be defined directly under root.");
                const i = t.getAttribute("property");
                if (null === i) throw new Error(`The attribute 'property' is missing in ${t.outerHTML}`);
                const s = t.getAttribute("attribute");
                if (null !== s && c.has(s) || a.has(i)) throw new Error(`Bindable property and attribute needs to be unique; found property: ${i}, attribute: ${s}`); else {
                    if (null !== s) c.add(s);
                    a.add(i);
                }
                h.add({
                    property: i,
                    attribute: null !== s && void 0 !== s ? s : void 0,
                    mode: rn(t)
                });
                const n = t.getAttributeNames().filter((t => !sn.includes(t)));
                if (n.length > 0) e.Ct.warn(`The attribute(s) ${n.join(", ")} will be ignored for ${t.outerHTML}. Only ${sn.join(", ")} are processed.`);
                r.removeChild(t);
            }
            e.te(Ce.define({
                name: s,
                template: t
            }, n));
            i.removeChild(t);
        }
    }
    Yt(t) {
        return "INPUT" === t.nodeName && 1 === Js[t.type];
    }
    Qt(t, e) {
        switch (t.nodeName) {
          case "INPUT":
            {
                const t = e;
                let i;
                let s;
                let n = 0;
                let o;
                for (let e = 0; e < t.length && n < 3; e++) {
                    o = t[e];
                    switch (o.to) {
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
    Xt(t) {
        t.classList.add("au");
        return t;
    }
    Jt(t, e) {
        const i = t.parentNode;
        const s = e.h("au-m");
        this.Xt(i.insertBefore(s, t));
        i.removeChild(t);
        return s;
    }
}

class CompilationContext {
    constructor(t, e, i, s, n, o) {
        this.hasSlot = false;
        this.ee = Ct();
        const r = null !== s;
        this.c = e;
        this.root = null === n ? this : n;
        this.def = t;
        this.ci = i;
        this.parent = s;
        this.Lt = r ? s.Lt : e.get(Ws);
        this.jt = r ? s.jt : e.get(mt);
        this.Vt = r ? s.Vt : e.get(j);
        this.Wt = r ? s.Wt : e.get(Rt);
        this.Ct = r ? s.Ct : e.get(x);
        this.p = r ? s.p : e.get(Bt);
        this.localEls = r ? s.localEls : new Set;
        this.rows = null !== o && void 0 !== o ? o : [];
    }
    te(t) {
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
    Kt(t) {
        return this.c.find(Ce, t);
    }
    Nt(t) {
        return this.c.find(fe, t);
    }
    Zt(t) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, t);
    }
    _t(t) {
        if (this.root !== this) return this.root._t(t);
        const e = t.command;
        if (null === e) return null;
        let i = this.ee[e];
        if (void 0 === i) {
            i = this.c.create(Is, e);
            if (null === i) throw new Error(`Unknown binding command: ${e}`);
            this.ee[e] = i;
        }
        return i;
    }
}

function Gs(t) {
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

function Xs() {
    Qs.node = Qs.attr = Qs.expr = Qs.bindable = Qs.def = null;
}

const Ks = {
    projections: null
};

const Ys = {
    name: "unnamed"
};

const Qs = {
    node: null,
    expr: null,
    attr: null,
    bindable: null,
    def: null
};

const Zs = Object.assign(Ct(), {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
});

const Js = {
    checkbox: 1,
    radio: 1
};

const tn = new WeakMap;

class BindablesInfo {
    constructor(t, e, i) {
        this.attrs = t;
        this.bindables = e;
        this.primary = i;
    }
    static from(t, e) {
        let i = tn.get(t);
        if (null == i) {
            const s = t.bindables;
            const n = Ct();
            const o = e ? void 0 === t.defaultBindingMode ? D.default : t.defaultBindingMode : D.default;
            let r;
            let l;
            let h = false;
            let a;
            let c;
            for (l in s) {
                r = s[l];
                c = r.attribute;
                if (true === r.primary) {
                    if (h) throw new Error(`Primary already exists on ${t.name}`);
                    h = true;
                    a = r;
                } else if (!h && null == a) a = r;
                n[c] = BindableDefinition.create(l, r);
            }
            if (null == r && e) a = n.value = BindableDefinition.create("value", {
                mode: o
            });
            tn.set(t, i = new BindablesInfo(n, s, a));
        }
        return i;
    }
}

var en;

(function(t) {
    t["property"] = "property";
    t["attribute"] = "attribute";
    t["mode"] = "mode";
})(en || (en = {}));

const sn = Object.freeze([ "property", "attribute", "mode" ]);

const nn = "as-custom-element";

function on(t, e) {
    const i = t.getAttribute(nn);
    if (null === i || "" === i) throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
    if (e.has(i)) throw new Error(`Duplicate definition of the local template named ${i}`); else {
        e.add(i);
        t.removeAttribute(nn);
    }
    return i;
}

function rn(t) {
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

const ln = h.createInterface("ITemplateCompilerHooks");

const hn = new WeakMap;

const an = e.resource.keyFor("compiler-hooks");

const cn = Object.freeze({
    name: an,
    define(t) {
        let i = hn.get(t);
        if (void 0 === i) {
            hn.set(t, i = new TemplateCompilerHooksDefinition(t));
            s.define(an, i, t);
            e.resource.appendTo(t, an);
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
        t.register(c.singleton(ln, this.Type));
    }
}

const un = t => {
    return void 0 === t ? e : e(t);
    function e(t) {
        return cn.define(t);
    }
};

class BindingModeBehavior {
    constructor(t) {
        this.mode = t;
        this.originalModes = new Map;
    }
    bind(t, e, i) {
        this.originalModes.set(i, i.mode);
        i.mode = this.mode;
    }
    unbind(t, e, i) {
        i.mode = this.originalModes.get(i);
        this.originalModes.delete(i);
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

const fn = 200;

class DebounceBindingBehavior extends G {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: fn
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
            this.opts.delay = isNaN(i) ? fn : i;
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

let dn = class SignalBindingBehavior {
    constructor(t) {
        this.signaler = t;
        this.lookup = new Map;
    }
    bind(t, e, i, ...s) {
        if (!("handleChange" in i)) throw new Error(`The signal behavior can only be used with bindings that have a 'handleChange' method`);
        if (0 === s.length) throw new Error(`At least one signal name must be passed to the signal behavior, e.g. \`expr & signal:'my-signal'\``);
        this.lookup.set(i, s);
        for (const t of s) this.signaler.addSignalListener(t, i);
    }
    unbind(t, e, i) {
        const s = this.lookup.get(i);
        this.lookup.delete(i);
        for (const t of s) this.signaler.removeSignalListener(t, i);
    }
};

dn = ot([ rt(0, X) ], dn);

z("signal")(dn);

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
        this.ie = t.locator.get(u);
        this.se = this.ie.taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.ne((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, i) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.ie.performanceNow();
        }
        this.binding.handleChange(t, e, i);
    }
    updateSource(t, e) {
        this.ne((() => this.binding.updateSource(t, e)));
    }
    ne(t) {
        const e = this.opts;
        const i = this.ie;
        const s = this.lastCall + e.delay - i.performanceNow();
        if (s > 0) {
            const n = this.task;
            e.delay = s;
            this.task = this.se.queueTask((() => {
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
        this.propertyKey = "";
        this.type = 2 | 4;
    }
    getValue(t, e) {
        return t.getAttribute(e);
    }
    setValue(t, e, i, s) {
        if (void 0 == t) i.removeAttribute(s); else i.setAttribute(s, t);
    }
}

const vn = new DataAttributeAccessor;

class AttrBindingBehavior {
    bind(t, e, i) {
        i.targetObserver = vn;
    }
    unbind(t, e, i) {
        return;
    }
}

z("attr")(AttrBindingBehavior);

function pn(t) {
    const e = t.composedPath()[0];
    if (this.target !== e) return;
    return this.selfEventCallSource(t);
}

class SelfBindingBehavior {
    bind(t, e, i) {
        if (!i.callSource || !i.targetEvent) throw new Error("Self binding behavior only supports events.");
        i.selfEventCallSource = i.callSource;
        i.callSource = pn;
    }
    unbind(t, e, i) {
        i.callSource = i.selfEventCallSource;
        i.selfEventCallSource = null;
    }
}

z("self")(SelfBindingBehavior);

const gn = Ct();

class AttributeNSAccessor {
    constructor(t) {
        this.namespace = t;
        this.type = 2 | 4;
    }
    static forNs(t) {
        var e;
        return null !== (e = gn[t]) && void 0 !== e ? e : gn[t] = new AttributeNSAccessor(t);
    }
    getValue(t, e) {
        return t.getAttributeNS(this.namespace, e);
    }
    setValue(t, e, i, s) {
        if (void 0 == t) i.removeAttributeNS(this.namespace, s); else i.setAttributeNS(this.namespace, s, t);
    }
}

function wn(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.value = void 0;
        this.oldValue = void 0;
        this.type = 2 | 1 | 4;
        this.oe = void 0;
        this.re = void 0;
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
        this.oldValue = i;
        this.f = e;
        this.le();
        this.he();
        this.queue.add(this);
    }
    handleCollectionChange(t, e) {
        this.he();
    }
    handleChange(t, e, i) {
        this.he();
    }
    he() {
        const t = this.value;
        const e = this.obj;
        const i = At.call(e, "model") ? e.model : e.value;
        const s = "radio" === e.type;
        const n = void 0 !== e.matcher ? e.matcher : wn;
        if (s) e.checked = !!n(t, i); else if (true === t) e.checked = true; else {
            let s = false;
            if (t instanceof Array) s = -1 !== t.findIndex((t => !!n(t, i))); else if (t instanceof Set) {
                for (const e of t) if (n(e, i)) {
                    s = true;
                    break;
                }
            } else if (t instanceof Map) for (const e of t) {
                const t = e[0];
                const o = e[1];
                if (n(t, i) && true === o) {
                    s = true;
                    break;
                }
            }
            e.checked = s;
        }
    }
    handleEvent() {
        let t = this.oldValue = this.value;
        const e = this.obj;
        const i = At.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = void 0 !== e.matcher ? e.matcher : wn;
        if ("checkbox" === e.type) {
            if (t instanceof Array) {
                const e = t.findIndex((t => !!n(t, i)));
                if (s && -1 === e) t.push(i); else if (!s && -1 !== e) t.splice(e, 1);
                return;
            } else if (t instanceof Set) {
                const e = {};
                let o = e;
                for (const e of t) if (true === n(e, i)) {
                    o = e;
                    break;
                }
                if (s && o === e) t.add(i); else if (!s && o !== e) t.delete(o);
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
        this.le();
    }
    stop() {
        var t, e;
        this.handler.dispose();
        null === (t = this.oe) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.oe = void 0;
        null === (e = this.re) || void 0 === e ? void 0 : e.unsubscribe(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.start();
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.stop();
    }
    flush() {
        bn = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, bn, this.f);
    }
    le() {
        var t, e, i, s, n, o, r;
        const l = this.obj;
        null === (n = null !== (t = this.re) && void 0 !== t ? t : this.re = null !== (i = null === (e = l.$observers) || void 0 === e ? void 0 : e.model) && void 0 !== i ? i : null === (s = l.$observers) || void 0 === s ? void 0 : s.value) || void 0 === n ? void 0 : n.subscribe(this);
        null === (o = this.oe) || void 0 === o ? void 0 : o.unsubscribe(this);
        this.oe = void 0;
        if ("checkbox" === l.type) null === (r = this.oe = Dn(this.value, this.oL)) || void 0 === r ? void 0 : r.subscribe(this);
    }
}

P(CheckedObserver);

O(CheckedObserver);

let bn;

const yn = Object.prototype.hasOwnProperty;

const xn = {
    childList: true,
    subtree: true,
    characterData: true
};

function kn(t, e) {
    return t === e;
}

class SelectValueObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.value = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        this.type = 2 | 1 | 4;
        this.ae = void 0;
        this.ce = void 0;
        this.observing = false;
        this.obj = t;
        this.oL = s;
    }
    getValue() {
        return this.observing ? this.value : this.obj.multiple ? Array.from(this.obj.options).map((t => t.value)) : this.obj.value;
    }
    setValue(t, e) {
        this.oldValue = this.value;
        this.value = t;
        this.hasChanges = t !== this.oldValue;
        this.ue(t instanceof Array ? t : null);
        if (0 === (256 & e)) this.flushChanges(e);
    }
    flushChanges(t) {
        if (this.hasChanges) {
            this.hasChanges = false;
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
        const n = null !== (t = i.matcher) && void 0 !== t ? t : kn;
        const o = i.options;
        let r = o.length;
        while (r-- > 0) {
            const t = o[r];
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
            let o;
            const r = t.matcher || kn;
            const l = [];
            while (n < i) {
                o = e[n];
                if (o.selected) l.push(yn.call(o, "model") ? o.model : o.value);
                ++n;
            }
            let h;
            n = 0;
            while (n < s.length) {
                h = s[n];
                if (-1 === l.findIndex((t => !!r(h, t)))) s.splice(n, 1); else ++n;
            }
            n = 0;
            while (n < l.length) {
                h = l[n];
                if (-1 === s.findIndex((t => !!r(h, t)))) s.push(h);
                ++n;
            }
            return false;
        }
        let o = null;
        let r;
        while (n < i) {
            r = e[n];
            if (r.selected) {
                o = yn.call(r, "model") ? r.model : r.value;
                break;
            }
            ++n;
        }
        this.oldValue = this.value;
        this.value = o;
        return true;
    }
    start() {
        (this.ce = new this.obj.ownerDocument.defaultView.MutationObserver(this.fe.bind(this))).observe(this.obj, xn);
        this.ue(this.value instanceof Array ? this.value : null);
        this.observing = true;
    }
    stop() {
        var t;
        this.ce.disconnect();
        null === (t = this.ae) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.ce = this.ae = void 0;
        this.observing = false;
    }
    ue(t) {
        var e;
        null === (e = this.ae) || void 0 === e ? void 0 : e.unsubscribe(this);
        this.ae = void 0;
        if (null != t) {
            if (!this.obj.multiple) throw new Error("Only null or Array instances can be bound to a multi-select.");
            (this.ae = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    fe() {
        this.syncOptions();
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.obj, this);
            this.start();
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.handler.dispose();
            this.stop();
        }
    }
    flush() {
        Cn = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Cn, 0);
    }
}

P(SelectValueObserver);

O(SelectValueObserver);

let Cn;

const An = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.value = "";
        this.oldValue = "";
        this.styles = {};
        this.version = 0;
        this.hasChanges = false;
        this.type = 2 | 4;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t, e) {
        this.value = t;
        this.hasChanges = t !== this.oldValue;
        if (0 === (256 & e)) this.flushChanges(e);
    }
    de(t) {
        const e = [];
        const i = /url\([^)]+$/;
        let s = 0;
        let n = "";
        let o;
        let r;
        let l;
        let h;
        while (s < t.length) {
            o = t.indexOf(";", s);
            if (-1 === o) o = t.length;
            n += t.substring(s, o);
            s = o + 1;
            if (i.test(n)) {
                n += ";";
                continue;
            }
            r = n.indexOf(":");
            l = n.substring(0, r).trim();
            h = n.substring(r + 1).trim();
            e.push([ l, h ]);
            n = "";
        }
        return e;
    }
    me(t) {
        let e;
        let i;
        const s = [];
        for (i in t) {
            e = t[i];
            if (null == e) continue;
            if ("string" === typeof e) {
                if (i.startsWith(An)) {
                    s.push([ i, e ]);
                    continue;
                }
                s.push([ o(i), e ]);
                continue;
            }
            s.push(...this.ve(e));
        }
        return s;
    }
    pe(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) i.push(...this.ve(t[s]));
            return i;
        }
        return l;
    }
    ve(t) {
        if ("string" === typeof t) return this.de(t);
        if (t instanceof Array) return this.pe(t);
        if (t instanceof Object) return this.me(t);
        return l;
    }
    flushChanges(t) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const t = this.value;
            const e = this.styles;
            const i = this.ve(t);
            let s;
            let n = this.version;
            this.oldValue = t;
            let o;
            let r;
            let l;
            let h = 0;
            const a = i.length;
            for (;h < a; ++h) {
                o = i[h];
                r = o[0];
                l = o[1];
                this.setProperty(r, l);
                e[r] = n;
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
        this.value = this.oldValue = this.obj.style.cssText;
    }
}

class ValueAttributeObserver {
    constructor(t, e, i) {
        this.propertyKey = e;
        this.handler = i;
        this.value = "";
        this.oldValue = "";
        this.hasChanges = false;
        this.type = 2 | 1 | 4;
        this.obj = t;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        if (Object.is(t, this.value)) return;
        this.oldValue = this.value;
        this.value = t;
        this.hasChanges = true;
        if (!this.handler.config.readonly && 0 === (256 & e)) this.flushChanges(e);
    }
    flushChanges(t) {
        var e;
        if (this.hasChanges) {
            this.hasChanges = false;
            this.obj[this.propertyKey] = null !== (e = this.value) && void 0 !== e ? e : this.handler.config.default;
            if (0 === (2 & t)) this.queue.add(this);
        }
    }
    handleEvent() {
        this.oldValue = this.value;
        this.value = this.obj[this.propertyKey];
        if (this.oldValue !== this.value) {
            this.hasChanges = false;
            this.queue.add(this);
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.obj, this);
            this.value = this.oldValue = this.obj[this.propertyKey];
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.handler.dispose();
    }
    flush() {
        Sn = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Sn, 0);
    }
}

P(ValueAttributeObserver);

O(ValueAttributeObserver);

let Sn;

const En = "http://www.w3.org/1999/xlink";

const Bn = "http://www.w3.org/XML/1998/namespace";

const Tn = "http://www.w3.org/2000/xmlns/";

const In = Object.assign(Ct(), {
    "xlink:actuate": [ "actuate", En ],
    "xlink:arcrole": [ "arcrole", En ],
    "xlink:href": [ "href", En ],
    "xlink:role": [ "role", En ],
    "xlink:show": [ "show", En ],
    "xlink:title": [ "title", En ],
    "xlink:type": [ "type", En ],
    "xml:lang": [ "lang", Bn ],
    "xml:space": [ "space", Bn ],
    xmlns: [ "xmlns", Tn ],
    "xmlns:xlink": [ "xlink", Tn ]
});

const Rn = new K;

Rn.type = 2 | 4;

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
        this.events = Ct();
        this.globalEvents = Ct();
        this.overrides = Ct();
        this.globalOverrides = Ct();
        const n = [ "change", "input" ];
        const o = {
            events: n,
            default: ""
        };
        this.useConfig({
            INPUT: {
                value: o,
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
                value: o
            }
        });
        const r = {
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
            textContent: r,
            innerHTML: r
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
        const o = this.events;
        let r;
        if ("string" === typeof t) {
            r = null !== (s = o[t]) && void 0 !== s ? s : o[t] = Ct();
            if (null == r[e]) r[e] = new NodeObserverConfig(i); else Pn(t, e);
        } else for (const i in t) {
            r = null !== (n = o[i]) && void 0 !== n ? n : o[i] = Ct();
            const s = t[i];
            for (e in s) if (null == r[e]) r[e] = new NodeObserverConfig(s[e]); else Pn(i, e);
        }
    }
    useConfigGlobal(t, e) {
        const i = this.globalEvents;
        if ("object" === typeof t) for (const e in t) if (null == i[e]) i[e] = new NodeObserverConfig(t[e]); else Pn("*", e); else if (null == i[t]) i[t] = new NodeObserverConfig(e); else Pn("*", t);
    }
    getAccessor(t, e, i) {
        var s;
        if (e in this.globalOverrides || e in (null !== (s = this.overrides[t.tagName]) && void 0 !== s ? s : B)) return this.getObserver(t, e, i);
        switch (e) {
          case "src":
          case "href":
          case "role":
            return vn;

          default:
            {
                const i = In[e];
                if (void 0 !== i) return AttributeNSAccessor.forNs(i[1]);
                if (Et(t, e, this.svgAnalyzer)) return vn;
                return Rn;
            }
        }
    }
    overrideAccessor(t, e) {
        var i, s;
        var n, o;
        let r;
        if ("string" === typeof t) {
            r = null !== (i = (n = this.overrides)[t]) && void 0 !== i ? i : n[t] = Ct();
            r[e] = true;
        } else for (const e in t) for (const i of t[e]) {
            r = null !== (s = (o = this.overrides)[e]) && void 0 !== s ? s : o[e] = Ct();
            r[i] = true;
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) this.globalOverrides[e] = true;
    }
    getObserver(t, e, i) {
        var s, n;
        switch (e) {
          case "role":
            return vn;

          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const o = null !== (n = null === (s = this.events[t.tagName]) || void 0 === s ? void 0 : s[e]) && void 0 !== n ? n : this.globalEvents[e];
        if (null != o) return new o.type(t, e, new EventSubscriber(o), i, this.locator);
        const r = In[e];
        if (void 0 !== r) return AttributeNSAccessor.forNs(r[1]);
        if (Et(t, e, this.svgAnalyzer)) return vn;
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) return this.dirtyChecker.createProperty(t, e);
            throw new Error(`Unable to observe property ${String(e)}. Register observation mapping with .useConfig().`);
        } else return new Q(t, e);
    }
}

NodeObserverLocator.inject = [ T, Bt, Z, Tt ];

function Dn(t, e) {
    if (t instanceof Array) return e.getArrayObserver(t);
    if (t instanceof Map) return e.getMapObserver(t);
    if (t instanceof Set) return e.getSetObserver(t);
}

function Pn(t, e) {
    throw new Error(`Mapping for property ${String(e)} of <${t} /> already exists`);
}

class UpdateTriggerBindingBehavior {
    constructor(t) {
        this.oL = t;
    }
    bind(t, e, i, ...s) {
        if (0 === s.length) throw new Error("The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind=\"firstName & updateTrigger:'blur'\">");
        if (i.mode !== D.twoWay && i.mode !== D.fromView) throw new Error("The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.");
        const n = this.oL.getObserver(i.target, i.targetProperty);
        if (!n.handler) throw new Error("The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.");
        i.targetObserver = n;
        const o = n.handler;
        n.originalHandler = o;
        n.handler = new EventSubscriber(new NodeObserverConfig({
            default: o.config.default,
            events: s,
            readonly: o.config.readonly
        }));
    }
    unbind(t, e, i) {
        i.targetObserver.handler.dispose();
        i.targetObserver.handler = i.targetObserver.originalHandler;
        i.targetObserver.originalHandler = null;
    }
}

UpdateTriggerBindingBehavior.inject = [ V ];

z("updateTrigger")(UpdateTriggerBindingBehavior);

let On = class Focus {
    constructor(t, e) {
        this.ge = t;
        this.p = e;
        this.we = false;
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) this.apply(); else this.we = true;
    }
    attached() {
        if (this.we) {
            this.we = false;
            this.apply();
        }
        const t = this.ge;
        t.addEventListener("focus", this);
        t.addEventListener("blur", this);
    }
    afterDetachChildren() {
        const t = this.ge;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if ("focus" === t.type) this.value = true; else if (!this.isElFocused) this.value = false;
    }
    apply() {
        const t = this.ge;
        const e = this.isElFocused;
        const i = this.value;
        if (i && !e) t.focus(); else if (!i && e) t.blur();
    }
    get isElFocused() {
        return this.ge === this.p.document.activeElement;
    }
};

ot([ lt({
    mode: D.twoWay
}) ], On.prototype, "value", void 0);

On = ot([ rt(0, Ai), rt(1, Bt) ], On);

ae("focus")(On);

let $n = class Show {
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

ot([ lt ], $n.prototype, "value", void 0);

$n = ot([ rt(0, Ai), rt(1, Bt), rt(2, Ni) ], $n);

J("hide")($n);

ae("show")($n);

class Portal {
    constructor(t, e, i) {
        this.id = w("au$component");
        this.strict = false;
        this.p = i;
        this.be = i.document.createElement("div");
        this.view = t.create();
        Ri(this.view.nodes, e);
    }
    attaching(t, e, i) {
        if (null == this.callbackContext) this.callbackContext = this.$controller.scope.bindingContext;
        const s = this.be = this.ye();
        this.view.setHost(s);
        return this.xe(t, s, i);
    }
    detaching(t, e, i) {
        return this.ke(t, this.be, i);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) return;
        const e = this.be;
        const i = this.be = this.ye();
        if (e === i) return;
        this.view.setHost(i);
        const s = C(this.ke(null, i, t.flags), (() => this.xe(null, i, t.flags)));
        if (s instanceof Promise) s.catch((t => {
            throw t;
        }));
    }
    xe(t, e, i) {
        const {activating: s, callbackContext: n, view: o} = this;
        o.setHost(e);
        return C(null === s || void 0 === s ? void 0 : s.call(n, e, o), (() => this.Ce(t, e, i)));
    }
    Ce(t, e, i) {
        const {$controller: s, view: n} = this;
        if (null === t) n.nodes.appendTo(e); else return C(n.activate(null !== t && void 0 !== t ? t : n, s, i, s.scope), (() => this.Ae(e)));
        return this.Ae(e);
    }
    Ae(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    ke(t, e, i) {
        const {deactivating: s, callbackContext: n, view: o} = this;
        return C(null === s || void 0 === s ? void 0 : s.call(n, e, o), (() => this.Se(t, e, i)));
    }
    Se(t, e, i) {
        const {$controller: s, view: n} = this;
        if (null === t) n.nodes.remove(); else return C(n.deactivate(t, s, i), (() => this.Ee(e)));
        return this.Ee(e);
    }
    Ee(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    ye() {
        const t = this.p;
        const e = t.document;
        let i = this.target;
        let s = this.renderContext;
        if ("" === i) {
            if (this.strict) throw new Error("Empty querySelector");
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
            if (this.strict) throw new Error("Portal target not found");
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

Portal.inject = [ We, Ei, Bt ];

ot([ lt({
    primary: true
}) ], Portal.prototype, "target", void 0);

ot([ lt({
    callback: "targetChanged"
}) ], Portal.prototype, "renderContext", void 0);

ot([ lt() ], Portal.prototype, "strict", void 0);

ot([ lt() ], Portal.prototype, "deactivating", void 0);

ot([ lt() ], Portal.prototype, "activating", void 0);

ot([ lt() ], Portal.prototype, "deactivated", void 0);

ot([ lt() ], Portal.prototype, "activated", void 0);

ot([ lt() ], Portal.prototype, "callbackContext", void 0);

ce("portal")(Portal);

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

FrequentMutations.inject = [ We, Ei ];

class ObserveShallow extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 128);
    }
}

ObserveShallow.inject = [ We, Ei ];

ce("frequent-mutations")(FrequentMutations);

ce("observe-shallow")(ObserveShallow);

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
        this.wantsDeactivate = false;
        this.swapId = 0;
    }
    created() {
        this.ctrl = this.$controller;
    }
    attaching(t, e, i) {
        let s;
        const n = this.swapId++;
        const o = () => !this.wantsDeactivate && this.swapId === n + 1;
        return C(this.pending, (() => {
            var e;
            if (!o()) return;
            this.pending = void 0;
            if (this.value) s = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(i); else s = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(i);
            if (null == s) return;
            s.setLocation(this.location);
            this.pending = C(s.activate(t, this.ctrl, i, this.ctrl.scope), (() => {
                if (o()) this.pending = void 0;
            }));
        }));
    }
    detaching(t, e, i) {
        this.wantsDeactivate = true;
        return C(this.pending, (() => {
            var e;
            this.wantsDeactivate = false;
            this.pending = void 0;
            void (null === (e = this.view) || void 0 === e ? void 0 : e.deactivate(t, this.ctrl, i));
        }));
    }
    valueChanged(t, e, i) {
        if (!this.ctrl.isActive) return;
        t = !!t;
        e = !!e;
        if (t === e) return;
        this.work.start();
        const s = this.view;
        const n = this.swapId++;
        const o = () => !this.wantsDeactivate && this.swapId === n + 1;
        let r;
        return C(C(this.pending, (() => this.pending = C(null === s || void 0 === s ? void 0 : s.deactivate(s, this.ctrl, i), (() => {
            var e;
            if (!o()) return;
            if (t) r = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(i); else r = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(i);
            if (null == r) return;
            r.setLocation(this.location);
            return C(r.activate(r, this.ctrl, i, this.ctrl.scope), (() => {
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

If.inject = [ We, Ei, xi ];

ot([ lt ], If.prototype, "value", void 0);

ot([ lt({
    set: t => "" === t || !!t && "false" !== t
}) ], If.prototype, "cache", void 0);

ce("if")(If);

let Ln = class Else {
    constructor(t) {
        this.factory = t;
        this.id = w("au$component");
    }
    link(t, e, i, s, n) {
        const o = e.children;
        const r = o[o.length - 1];
        if (r instanceof If) r.elseFactory = this.factory; else if (r.viewModel instanceof If) r.viewModel.elseFactory = this.factory; else throw new Error(`Unsupported IfBehavior`);
    }
};

Ln = ot([ rt(0, We) ], Ln);

ce({
    name: "else"
})(Ln);

function qn(t) {
    t.dispose();
}

class Repeat {
    constructor(t, e, i) {
        this.location = t;
        this.parent = e;
        this.factory = i;
        this.id = w("au$component");
        this.hasPendingInstanceMutation = false;
        this.observer = void 0;
        this.views = [];
        this.key = void 0;
        this.Be = void 0;
    }
    binding(t, e, i) {
        this.Te(i);
        const s = this.parent.bindings;
        let n;
        for (let t = 0, e = s.length; t < e; ++t) {
            n = s[t];
            if (n.target === this && "items" === n.targetProperty) {
                this.forOf = n.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(i, this.$controller.scope, n.locator, null);
    }
    attaching(t, e, i) {
        this.Ie(i);
        return this.Re(t, i);
    }
    detaching(t, e, i) {
        this.Te(i);
        return this.De(t, i);
    }
    itemsChanged(t) {
        const {$controller: e} = this;
        if (!e.isActive) return;
        t |= e.flags;
        this.Te(t);
        this.Ie(t);
        const i = C(this.De(null, t), (() => this.Re(null, t)));
        if (i instanceof Promise) i.catch((t => {
            throw t;
        }));
    }
    handleCollectionChange(t, e) {
        const {$controller: i} = this;
        if (!i.isActive) return;
        e |= i.flags;
        this.Ie(e);
        if (void 0 === t) {
            const t = C(this.De(null, e), (() => this.Re(null, e)));
            if (t instanceof Promise) t.catch((t => {
                throw t;
            }));
        } else {
            const i = this.views.length;
            tt(t);
            if (t.deletedItems.length > 0) {
                t.deletedItems.sort(I);
                const s = C(this.Pe(t, e), (() => this.Oe(i, t, e)));
                if (s instanceof Promise) s.catch((t => {
                    throw t;
                }));
            } else this.Oe(i, t, e);
        }
    }
    Te(t) {
        const e = this.observer;
        if (4 & t) {
            if (void 0 !== e) e.unsubscribe(this);
        } else if (this.$controller.isActive) {
            const t = this.observer = et(this.items);
            if (e !== t && e) e.unsubscribe(this);
            if (t) t.subscribe(this);
        }
    }
    Ie(t) {
        const e = this.items;
        if (e instanceof Array) {
            this.Be = e;
            return;
        }
        const i = this.forOf;
        if (void 0 === i) return;
        const s = [];
        this.forOf.iterate(t, e, ((t, e, i) => {
            s[e] = i;
        }));
        this.Be = s;
    }
    Re(t, e) {
        let i;
        let s;
        let n;
        let o;
        const {$controller: r, factory: l, local: h, location: a, items: c} = this;
        const u = r.scope;
        const f = this.forOf.count(e, c);
        const d = this.views = Array(f);
        this.forOf.iterate(e, c, ((c, m, v) => {
            n = d[m] = l.create(e).setLocation(a);
            n.nodes.unlink();
            o = F.fromParent(u, it.create(h, v));
            _n(o.overrideContext, m, f);
            s = n.activate(null !== t && void 0 !== t ? t : n, r, e, o);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }));
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    De(t, e) {
        let i;
        let s;
        let n;
        const {views: o, $controller: r} = this;
        for (let l = 0, h = o.length; l < h; ++l) {
            n = o[l];
            n.release();
            s = n.deactivate(null !== t && void 0 !== t ? t : n, r, e);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    Pe(t, e) {
        let i;
        let s;
        let n;
        const {$controller: o, views: r} = this;
        const l = t.deletedItems;
        const h = l.length;
        let a = 0;
        for (;a < h; ++a) {
            n = r[l[a]];
            n.release();
            s = n.deactivate(n, o, e);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }
        a = 0;
        let c = 0;
        for (;a < h; ++a) {
            c = l[a] - a;
            r.splice(c, 1);
        }
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    Oe(t, e, i) {
        var s;
        let n;
        let o;
        let r;
        let l;
        const {$controller: h, factory: a, local: c, Be: u, location: f, views: d} = this;
        const m = e.length;
        for (let t = 0; t < m; ++t) if (-2 === e[t]) {
            r = a.create(i);
            d.splice(t, 0, r);
        }
        if (d.length !== m) throw new Error(`viewsLen=${d.length}, mapLen=${m}`);
        const v = h.scope;
        const p = e.length;
        st(d, e);
        const g = jn(e);
        const w = g.length;
        let b;
        let y = w - 1;
        let x = p - 1;
        for (;x >= 0; --x) {
            r = d[x];
            b = d[x + 1];
            r.nodes.link(null !== (s = null === b || void 0 === b ? void 0 : b.nodes) && void 0 !== s ? s : f);
            if (-2 === e[x]) {
                l = F.fromParent(v, it.create(c, u[x]));
                _n(l.overrideContext, x, p);
                r.setLocation(f);
                o = r.activate(r, h, i, l);
                if (o instanceof Promise) (null !== n && void 0 !== n ? n : n = []).push(o);
            } else if (y < 0 || 1 === w || x !== g[y]) {
                _n(r.scope.overrideContext, x, p);
                r.nodes.insertBefore(r.location);
            } else {
                if (t !== p) _n(r.scope.overrideContext, x, p);
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

Repeat.inject = [ Ei, mi, We ];

ot([ lt ], Repeat.prototype, "items", void 0);

ce("repeat")(Repeat);

let Mn = 16;

let Fn = new Int32Array(Mn);

let Vn = new Int32Array(Mn);

function jn(t) {
    const e = t.length;
    if (e > Mn) {
        Mn = e;
        Fn = new Int32Array(e);
        Vn = new Int32Array(e);
    }
    let i = 0;
    let s = 0;
    let n = 0;
    let o = 0;
    let r = 0;
    let l = 0;
    let h = 0;
    let a = 0;
    for (;o < e; o++) {
        s = t[o];
        if (-2 !== s) {
            r = Fn[i];
            n = t[r];
            if (-2 !== n && n < s) {
                Vn[o] = r;
                Fn[++i] = o;
                continue;
            }
            l = 0;
            h = i;
            while (l < h) {
                a = l + h >> 1;
                n = t[Fn[a]];
                if (-2 !== n && n < s) l = a + 1; else h = a;
            }
            n = t[Fn[l]];
            if (s < n || -2 === n) {
                if (l > 0) Vn[o] = Fn[l - 1];
                Fn[l] = o;
            }
        }
    }
    o = ++i;
    const c = new Int32Array(o);
    s = Fn[i - 1];
    while (i-- > 0) {
        c[i] = s;
        s = Vn[s];
    }
    while (o-- > 0) Fn[o] = 0;
    return c;
}

function _n(t, e, i) {
    const s = 0 === e;
    const n = e === i - 1;
    const o = e % 2 === 0;
    t.$index = e;
    t.$first = s;
    t.$last = n;
    t.$middle = !s && !n;
    t.$even = o;
    t.$odd = !o;
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
        let o;
        let r = 0, l = 0;
        if (s.isActive && null != n) {
            o = F.fromParent(s.scope, void 0 === t ? {} : t);
            for (l = n.length; l > r; ++r) n[r].$bind(2, o);
        }
    }
    attaching(t, e, i) {
        const {$controller: s, value: n} = this;
        const o = F.fromParent(s.scope, void 0 === n ? {} : n);
        return this.view.activate(t, s, i, o);
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

With.inject = [ We, Ei ];

ot([ lt ], With.prototype, "value", void 0);

ce("with")(With);

let Nn = class Switch {
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
        const o = [];
        let r = t.fallThrough;
        if (!r) o.push(t); else {
            const e = this.cases;
            const i = e.indexOf(t);
            for (let t = i, s = e.length; t < s && r; t++) {
                const i = e[t];
                o.push(i);
                r = i.fallThrough;
            }
        }
        return C(this.clearActiveCases(null, e, o), (() => {
            this.activeCases = o;
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
        const o = this.defaultCase;
        if (0 === s.length && void 0 !== o) s.push(o);
        return C(this.activeCases.length > 0 ? this.clearActiveCases(t, e, s) : void 0, (() => {
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
        const o = i.scope;
        if (1 === n) return s[0].activate(t, e, o);
        return A(...s.map((i => i.activate(t, e, o))));
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

ot([ lt ], Nn.prototype, "value", void 0);

Nn = ot([ ce("switch"), rt(0, We), rt(1, Ei) ], Nn);

let Hn = class Case {
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
        const o = e.parent;
        const r = null === o || void 0 === o ? void 0 : o.viewModel;
        if (r instanceof Nn) {
            this.$switch = r;
            this.linkToSwitch(r);
        } else throw new Error("The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.");
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

ot([ lt ], Hn.prototype, "value", void 0);

ot([ lt({
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
}) ], Hn.prototype, "fallThrough", void 0);

Hn = ot([ ce("case"), rt(0, We), rt(1, V), rt(2, Ei), rt(3, x) ], Hn);

let Wn = class DefaultCase extends Hn {
    linkToSwitch(t) {
        if (void 0 !== t.defaultCase) throw new Error("Multiple 'default-case's are not allowed.");
        t.defaultCase = this;
    }
};

Wn = ot([ ce("default-case") ], Wn);

let Un = class PromiseTemplateController {
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
        return C(s.activate(t, n, i, this.viewScope = F.fromParent(n.scope, {})), (() => this.swap(t, i)));
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
        const o = this.platform.domWriteQueue;
        const r = this.fulfilled;
        const l = this.rejected;
        const h = this.pending;
        const a = this.viewScope;
        let c;
        const u = {
            reusable: false
        };
        const f = () => {
            void A(c = (this.preSettledTask = o.queueTask((() => A(null === r || void 0 === r ? void 0 : r.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.activate(t, e, a))), u)).result, n.then((i => {
                if (this.value !== n) return;
                const s = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => A(null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === r || void 0 === r ? void 0 : r.activate(t, e, a, i))), u)).result;
                };
                if (1 === this.preSettledTask.status) void c.then(s); else {
                    this.preSettledTask.cancel();
                    s();
                }
            }), (i => {
                if (this.value !== n) return;
                const s = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => A(null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === r || void 0 === r ? void 0 : r.deactivate(t, e), null === l || void 0 === l ? void 0 : l.activate(t, e, a, i))), u)).result;
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

ot([ lt ], Un.prototype, "value", void 0);

Un = ot([ ce("promise"), rt(0, We), rt(1, Ei), rt(2, Bt), rt(3, x) ], Un);

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

ot([ lt({
    mode: D.toView
}) ], zn.prototype, "value", void 0);

zn = ot([ ce("pending"), rt(0, We), rt(1, Ei) ], zn);

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

ot([ lt({
    mode: D.toView
}) ], Gn.prototype, "value", void 0);

Gn = ot([ ce("then"), rt(0, We), rt(1, Ei) ], Gn);

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

ot([ lt({
    mode: D.toView
}) ], Xn.prototype, "value", void 0);

Xn = ot([ ce("catch"), rt(0, We), rt(1, Ei) ], Xn);

function Kn(t) {
    const e = t.parent;
    const i = null === e || void 0 === e ? void 0 : e.viewModel;
    if (i instanceof Un) return i;
    throw new Error("The parent promise.resolve not found; only `*[promise.resolve] > *[pending|then|catch]` relation is supported.");
}

function Yn(t, e, i, s) {
    if ("string" === typeof e) return Qn(t, e, i, s);
    if (Ce.isType(e)) return Zn(t, e, i, s);
    throw new Error(`Invalid Tag or Type.`);
}

class RenderPlan {
    constructor(t, e, i) {
        this.node = t;
        this.instructions = e;
        this.dependencies = i;
        this.$e = void 0;
    }
    get definition() {
        if (void 0 === this.$e) this.$e = CustomElementDefinition.create({
            name: Ce.generateName(),
            template: this.node,
            needsCompile: "string" === typeof this.node,
            instructions: this.instructions,
            dependencies: this.dependencies
        });
        return this.$e;
    }
    createView(t) {
        return this.getViewFactory(t).create();
    }
    getViewFactory(t) {
        return t.root.get(Ze).getViewFactory(this.definition, t.createChild().register(...this.dependencies));
    }
    mergeInto(t, e, i) {
        t.appendChild(this.node);
        e.push(...this.instructions);
        i.push(...this.dependencies);
    }
}

function Qn(t, e, i, s) {
    const n = [];
    const o = [];
    const r = [];
    const l = t.document.createElement(e);
    let h = false;
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (Hi(e)) {
            h = true;
            n.push(e);
        } else l.setAttribute(t, e);
    }));
    if (h) {
        l.className = "au";
        o.push(n);
    }
    if (s) Jn(t, l, s, o, r);
    return new RenderPlan(l, o, r);
}

function Zn(t, e, i, s) {
    const n = Ce.getDefinition(e);
    const o = [];
    const r = [ o ];
    const l = [];
    const h = [];
    const a = n.bindables;
    const c = t.document.createElement(n.name);
    c.className = "au";
    if (!l.includes(e)) l.push(e);
    o.push(new HydrateElementInstruction(n, void 0, h, null, false));
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (Hi(e)) h.push(e); else if (void 0 === a[t]) h.push(new SetAttributeInstruction(e, t)); else h.push(new SetPropertyInstruction(e, t));
    }));
    if (s) Jn(t, c, s, r, l);
    return new RenderPlan(c, r, l);
}

function Jn(t, e, i, s, n) {
    for (let o = 0, r = i.length; o < r; ++o) {
        const r = i[o];
        switch (typeof r) {
          case "string":
            e.appendChild(t.document.createTextNode(r));
            break;

          case "object":
            if (r instanceof t.Node) e.appendChild(r); else if ("mergeInto" in r) r.mergeInto(e, s, n);
        }
    }
}

function to(t, e) {
    const i = e.to;
    if (void 0 !== i && "subject" !== i && "composing" !== i) t[i] = e;
    return t;
}

let eo = class AuRender {
    constructor(t, e, i, s) {
        this.p = t;
        this.r = s;
        this.id = w("au$component");
        this.component = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.Le = e.props.reduce(to, {});
        this.qe = i;
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
        return this.Se(this.view, t, i);
    }
    componentChanged(t, e, i) {
        const {$controller: s} = this;
        if (!s.isActive) return;
        if (this.lastSubject === t) return;
        this.lastSubject = t;
        this.composing = true;
        i |= s.flags;
        const n = C(this.Se(this.view, null, i), (() => this.compose(void 0, t, null, i)));
        if (n instanceof Promise) n.catch((t => {
            throw t;
        }));
    }
    compose(t, e, i, s) {
        return C(void 0 === t ? C(e, (t => this.Me(t, s))) : t, (t => this.Ce(this.view = t, i, s)));
    }
    Se(t, e, i) {
        return null === t || void 0 === t ? void 0 : t.deactivate(null !== e && void 0 !== e ? e : t, this.$controller, i);
    }
    Ce(t, e, i) {
        const {$controller: s} = this;
        return C(null === t || void 0 === t ? void 0 : t.activate(null !== e && void 0 !== e ? e : t, s, i, s.scope), (() => {
            this.composing = false;
        }));
    }
    Me(t, e) {
        const i = this.Fe(t, e);
        if (i) {
            i.setLocation(this.$controller.location);
            i.lockScope(this.$controller.scope);
            return i;
        }
        return;
    }
    Fe(t, e) {
        if (!t) return;
        const i = this.qe.controller.container;
        if ("object" === typeof t) {
            if (io(t)) return t;
            if ("createView" in t) return t.createView(i);
            if ("create" in t) return t.create(e);
            if ("template" in t) return this.r.getViewFactory(CustomElementDefinition.getOrCreate(t), i).create(e);
        }
        if ("string" === typeof t) {
            const e = i.find(Ce, t);
            if (null == e) throw new Error(`Unable to find custom element ${t} for <au-render>.`);
            t = e.Type;
        }
        return Yn(this.p, t, this.Le, this.$controller.host.childNodes).createView(i);
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

ot([ lt ], eo.prototype, "component", void 0);

ot([ lt({
    mode: D.fromView
}) ], eo.prototype, "composing", void 0);

eo = ot([ ge({
    name: "au-render",
    template: null,
    containerless: true
}), rt(0, Bt), rt(1, Ni), rt(2, vi), rt(3, Ze) ], eo);

function io(t) {
    return "lockScope" in t;
}

class AuCompose {
    constructor(t, e, i, s, n, o) {
        this.ctn = t;
        this.parent = e;
        this.host = i;
        this.p = s;
        this.scopeBehavior = "auto";
        this.c = void 0;
        this.loc = n.containerless ? Di(this.host) : void 0;
        this.r = t.get(Ze);
        this.Ve = n;
        this.je = o;
    }
    static get inject() {
        return [ g, mi, Ai, Bt, Ni, R(CompositionContextFactory) ];
    }
    get pending() {
        return this.pd;
    }
    get composition() {
        return this.c;
    }
    attaching(t, e, i) {
        return this.pd = C(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, t, void 0)), (t => {
            if (this.je.isCurrent(t)) this.pd = void 0;
        }));
    }
    detaching(t) {
        const e = this.c;
        const i = this.pd;
        this.je.invalidate();
        this.c = this.pd = void 0;
        return C(i, (() => null === e || void 0 === e ? void 0 : e.deactivate(t)));
    }
    propertyChanged(t) {
        if ("model" === t && null != this.c) {
            this.c.update(this.model);
            return;
        }
        this.pd = C(this.pd, (() => C(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, t)), (t => {
            if (this.je.isCurrent(t)) this.pd = void 0;
        }))));
    }
    queue(t) {
        const e = this.je;
        const i = this.c;
        return C(e.create(t), (s => {
            if (e.isCurrent(s)) return C(this.compose(s), (n => {
                if (e.isCurrent(s)) return C(n.activate(), (() => {
                    if (e.isCurrent(s)) {
                        this.c = n;
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
        const {view: n, viewModel: o, model: r, initiator: l} = t.change;
        const {ctn: h, host: a, $controller: c, loc: u} = this;
        const f = this.getDef(o);
        const d = h.createChild();
        const m = null == u ? a.parentNode : u.parentNode;
        if (null !== f) {
            if (f.containerless) throw new Error("Containerless custom element is not supported by <au-compose/>");
            if (null == u) {
                i = a;
                s = () => {};
            } else {
                i = m.insertBefore(this.p.document.createElement(f.name), u);
                s = () => {
                    i.remove();
                };
            }
            e = this.getVm(d, o, i);
        } else {
            i = null == u ? a : u;
            e = this.getVm(d, o, i);
        }
        const v = () => {
            if (null !== f) {
                const n = Controller.$el(d, e, i, null, 0, f);
                return new CompositionController(n, (() => n.activate(null !== l && void 0 !== l ? l : n, c, 2)), (t => C(n.deactivate(null !== t && void 0 !== t ? t : n, c, 4), s)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: Ce.generateName(),
                    template: n
                });
                const o = this.r.getViewFactory(s, d);
                const r = Controller.$view(o, 2, c);
                const h = "auto" === this.scopeBehavior ? F.fromParent(this.parent.scope, e) : F.create(e);
                if (Pi(i)) r.setLocation(i); else r.setHost(i);
                return new CompositionController(r, (() => r.activate(null !== l && void 0 !== l ? l : r, c, 2, h)), (t => r.deactivate(null !== t && void 0 !== t ? t : r, c, 4)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            }
        };
        if ("activate" in e) return C(e.activate(r), (() => v())); else return v();
    }
    getVm(t, e, i) {
        if (null == e) return new EmptyComponent$1;
        if ("object" === typeof e) return e;
        const s = this.p;
        const n = Pi(i);
        t.registerResolver(s.Element, t.registerResolver(Ai, new y("ElementResolver", n ? null : i)));
        t.registerResolver(Ei, new y("IRenderLocation", n ? i : null));
        const o = t.invoke(e);
        t.registerResolver(e, new y("au-compose.viewModel", o));
        return o;
    }
    getDef(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Ce.isType(e) ? Ce.getDefinition(e) : null;
    }
}

ot([ lt ], AuCompose.prototype, "view", void 0);

ot([ lt ], AuCompose.prototype, "viewModel", void 0);

ot([ lt ], AuCompose.prototype, "model", void 0);

ot([ lt({
    set: t => {
        if ("scoped" === t || "auto" === t) return t;
        throw new Error('Invalid scope behavior config. Only "scoped" or "auto" allowed.');
    }
}) ], AuCompose.prototype, "scopeBehavior", void 0);

ge("au-compose")(AuCompose);

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
        if (0 !== this.state) throw new Error(`Composition has already been activated/deactivated. Id: ${this.controller.name}`);
        this.state = 1;
        return this.start();
    }
    deactivate(t) {
        switch (this.state) {
          case 1:
            this.state = -1;
            return this.stop(t);

          case -1:
            throw new Error("Composition has already been deactivated.");

          default:
            this.state = -1;
        }
    }
}

class AuSlot {
    constructor(t, e, i, s) {
        var n, o;
        this._e = null;
        this.Ne = null;
        let r;
        const l = e.auSlot;
        const h = null === (o = null === (n = i.instruction) || void 0 === n ? void 0 : n.projections) || void 0 === o ? void 0 : o[l.name];
        if (null == h) {
            r = s.getViewFactory(l.fallback, i.controller.container);
            this.He = false;
        } else {
            r = s.getViewFactory(h, i.parent.controller.container);
            this.He = true;
        }
        this.qe = i;
        this.view = r.create().setLocation(t);
    }
    static get inject() {
        return [ Ei, Ni, vi, Ze ];
    }
    binding(t, e, i) {
        var s;
        this._e = this.$controller.scope.parentScope;
        let n;
        if (this.He) {
            n = this.qe.controller.scope.parentScope;
            (this.Ne = F.fromParent(n, n.bindingContext)).overrideContext.$host = null !== (s = this.expose) && void 0 !== s ? s : this._e.bindingContext;
        }
    }
    attaching(t, e, i) {
        return this.view.activate(t, this.$controller, i, this.He ? this.Ne : this._e);
    }
    detaching(t, e, i) {
        return this.view.deactivate(t, this.$controller, i);
    }
    exposeChanged(t) {
        if (this.He && null != this.Ne) this.Ne.overrideContext.$host = t;
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

ot([ lt ], AuSlot.prototype, "expose", void 0);

ge({
    name: "au-slot",
    template: null,
    containerless: true
})(AuSlot);

const so = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const no = h.createInterface("ISanitizer", (t => t.singleton(class {
    sanitize(t) {
        return t.replace(so, "");
    }
})));

let oo = class SanitizeValueConverter {
    constructor(t) {
        this.sanitizer = t;
    }
    toView(t) {
        if (null == t) return null;
        return this.sanitizer.sanitize(t);
    }
};

oo = ot([ rt(0, no) ], oo);

nt("sanitize")(oo);

let ro = class ViewValueConverter {
    constructor(t) {
        this.viewLocator = t;
    }
    toView(t, e) {
        return this.viewLocator.getViewComponentForObject(t, e);
    }
};

ro = ot([ rt(0, Qe) ], ro);

nt("view")(ro);

const lo = DebounceBindingBehavior;

const ho = OneTimeBindingBehavior;

const ao = ToViewBindingBehavior;

const co = FromViewBindingBehavior;

const uo = dn;

const fo = ThrottleBindingBehavior;

const mo = TwoWayBindingBehavior;

const vo = TemplateCompiler;

const po = NodeObserverLocator;

const go = [ vo, po ];

const wo = SVGAnalyzer;

const bo = kt;

const yo = xt;

const xo = yt;

const ko = bt;

const Co = [ xo, ko ];

const Ao = [ bo, yo ];

const So = Ls;

const Eo = $s;

const Bo = qs;

const To = Ps;

const Io = Rs;

const Ro = Ds;

const Do = Os;

const Po = Hs;

const Oo = Ms;

const $o = Fs;

const Lo = Vs;

const qo = js;

const Mo = Ns;

const Fo = _s;

const Vo = [ Eo, Io, To, Ro, Do, So, Bo, Po, Oo, $o, Lo, Mo, Fo, qo ];

const jo = oo;

const _o = ro;

const No = FrequentMutations;

const Ho = ObserveShallow;

const Wo = If;

const Uo = Ln;

const zo = Repeat;

const Go = With;

const Xo = Nn;

const Ko = Hn;

const Yo = Wn;

const Qo = Un;

const Zo = zn;

const Jo = Gn;

const tr = Xn;

const er = AttrBindingBehavior;

const ir = SelfBindingBehavior;

const sr = UpdateTriggerBindingBehavior;

const nr = eo;

const or = AuCompose;

const rr = Portal;

const lr = On;

const hr = $n;

const ar = [ lo, ho, ao, co, uo, fo, mo, jo, _o, No, Ho, Wo, Uo, zo, Go, Xo, Ko, Yo, Qo, Zo, Jo, tr, er, ir, sr, nr, or, rr, lr, hr, AuSlot ];

const cr = es;

const ur = Zi;

const fr = Qi;

const dr = ss;

const mr = os;

const vr = ts;

const pr = ns;

const gr = is;

const wr = Yi;

const br = Ji;

const yr = cs;

const xr = vs;

const kr = us;

const Cr = fs;

const Ar = ds;

const Sr = ms;

const Er = as;

const Br = [ pr, mr, cr, gr, dr, wr, fr, ur, br, vr, yr, xr, kr, Cr, Ar, Sr, Er ];

const Tr = {
    register(t) {
        return t.register(...go, ...ar, ...Co, ...Vo, ...Br);
    },
    createContainer() {
        return this.register(h.createContainer());
    }
};

const Ir = h.createInterface("IAurelia");

class Aurelia {
    constructor(t = h.createContainer()) {
        this.container = t;
        this.We = false;
        this.Ue = false;
        this.ze = false;
        this.Ge = void 0;
        this.next = void 0;
        this.Xe = void 0;
        this.Ke = void 0;
        if (t.has(Ir, true)) throw new Error("An instance of Aurelia is already registered with the container or an ancestor of it.");
        t.registerResolver(Ir, new y("IAurelia", this));
        t.registerResolver(yi, this.Ye = new y("IAppRoot"));
    }
    get isRunning() {
        return this.We;
    }
    get isStarting() {
        return this.Ue;
    }
    get isStopping() {
        return this.ze;
    }
    get root() {
        if (null == this.Ge) {
            if (null == this.next) throw new Error(`root is not defined`);
            return this.next;
        }
        return this.Ge;
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.Qe(t.host), this.container, this.Ye);
        return this;
    }
    enhance(t, e) {
        var i;
        const s = null !== (i = t.container) && void 0 !== i ? i : this.container.createChild();
        const n = t.host;
        const o = this.Qe(n);
        const r = t.component;
        let l;
        if ("function" === typeof r) {
            s.registerResolver(o.Element, s.registerResolver(Ai, new y("ElementResolver", n)));
            l = s.invoke(r);
        } else l = r;
        s.registerResolver(Si, new y("IEventTarget", n));
        e = null !== e && void 0 !== e ? e : null;
        const h = Controller.$el(s, l, n, null, void 0, CustomElementDefinition.create({
            name: Ce.generateName(),
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
    Qe(e) {
        let i;
        if (!this.container.has(Bt, false)) {
            if (null === e.ownerDocument.defaultView) throw new Error(`Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`);
            i = new t(e.ownerDocument.defaultView);
            this.container.register(c.instance(Bt, i));
        } else i = this.container.get(Bt);
        return i;
    }
    start(t = this.next) {
        if (null == t) throw new Error(`There is no composition root`);
        if (this.Xe instanceof Promise) return this.Xe;
        return this.Xe = C(this.stop(), (() => {
            Reflect.set(t.host, "$aurelia", this);
            this.Ye.prepare(this.Ge = t);
            this.Ue = true;
            return C(t.activate(), (() => {
                this.We = true;
                this.Ue = false;
                this.Xe = void 0;
                this.Ze(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (this.Ke instanceof Promise) return this.Ke;
        if (true === this.We) {
            const e = this.Ge;
            this.We = false;
            this.ze = true;
            return this.Ke = C(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) e.dispose();
                this.Ge = void 0;
                this.Ye.dispose();
                this.ze = false;
                this.Ze(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.We || this.ze) throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
        this.container.dispose();
    }
    Ze(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

const Rr = h.createInterface("IDialogService");

const Dr = h.createInterface("IDialogController");

const Pr = h.createInterface("IDialogDomRenderer");

const Or = h.createInterface("IDialogDom");

const $r = h.createInterface("IDialogGlobalSettings");

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

var Lr;

(function(t) {
    t["Ok"] = "ok";
    t["Error"] = "error";
    t["Cancel"] = "cancel";
    t["Abort"] = "abort";
})(Lr || (Lr = {}));

class DialogController {
    constructor(t, e) {
        this.p = t;
        this.ctn = e;
        this.closed = new Promise(((t, e) => {
            this.wt = t;
            this.ct = e;
        }));
    }
    static get inject() {
        return [ Bt, g ];
    }
    activate(t) {
        var e;
        const i = this.ctn.createChild();
        const {model: s, template: n, rejectOnCancel: o} = t;
        const r = i.get(Pr);
        const l = null !== (e = t.host) && void 0 !== e ? e : this.p.document.body;
        const h = this.dom = r.render(l, t);
        const a = i.has(Si, true) ? i.get(Si) : null;
        const u = h.contentHost;
        this.settings = t;
        if (null == a || !a.contains(l)) i.register(c.instance(Si, l));
        i.register(c.instance(Ai, u), c.instance(Or, h));
        return new Promise((e => {
            var n, o;
            const r = Object.assign(this.cmp = this.getOrCreateVm(i, t, u), {
                $dialog: this
            });
            e(null !== (o = null === (n = r.canActivate) || void 0 === n ? void 0 : n.call(r, s)) && void 0 !== o ? o : true);
        })).then((e => {
            var r;
            if (true !== e) {
                h.dispose();
                if (o) throw qr(null, "Dialog activation rejected");
                return DialogOpenResult.create(true, this);
            }
            const l = this.cmp;
            return C(null === (r = l.activate) || void 0 === r ? void 0 : r.call(l, s), (() => {
                var e;
                const s = this.controller = Controller.$el(i, l, u, null, 0, CustomElementDefinition.create(null !== (e = this.getDefinition(l)) && void 0 !== e ? e : {
                    name: Ce.generateName(),
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
        if (this.Je) return this.Je;
        let i = true;
        const {controller: s, dom: n, cmp: o, settings: {mouseEvent: r, rejectOnCancel: l}} = this;
        const h = DialogCloseResult.create(t, e);
        const a = new Promise((a => {
            var c, u;
            a(C(null !== (u = null === (c = o.canDeactivate) || void 0 === c ? void 0 : c.call(o, h)) && void 0 !== u ? u : true, (a => {
                var c;
                if (true !== a) {
                    i = false;
                    this.Je = void 0;
                    if (l) throw qr(null, "Dialog cancellation rejected");
                    return DialogCloseResult.create("abort");
                }
                return C(null === (c = o.deactivate) || void 0 === c ? void 0 : c.call(o, h), (() => C(s.deactivate(s, null, 4), (() => {
                    n.dispose();
                    n.overlay.removeEventListener(null !== r && void 0 !== r ? r : "click", this);
                    if (!l && "error" !== t) this.wt(h); else this.ct(qr(e, "Dialog cancelled with a rejection on cancel"));
                    return h;
                }))));
            })));
        })).catch((t => {
            this.Je = void 0;
            throw t;
        }));
        this.Je = i ? a : void 0;
        return a;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(t) {
        const e = Mr(t);
        return new Promise((t => {
            var i, s;
            return t(C(null === (s = (i = this.cmp).deactivate) || void 0 === s ? void 0 : s.call(i, DialogCloseResult.create("error", e)), (() => C(this.controller.deactivate(this.controller, null, 4), (() => {
                this.dom.dispose();
                this.ct(e);
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
        t.registerResolver(Ai, t.registerResolver(n.Element, new y("ElementResolver", i)));
        return t.invoke(s);
    }
    getDefinition(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Ce.isType(e) ? Ce.getDefinition(e) : null;
    }
}

class EmptyComponent {}

function qr(t, e) {
    const i = new Error(e);
    i.wasCancelled = true;
    i.value = t;
    return i;
}

function Mr(t) {
    const e = new Error;
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor(t, e, i) {
        this.G = t;
        this.p = e;
        this.ti = i;
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
        return [ g, Bt, $r ];
    }
    static register(t) {
        t.register(c.singleton(Rr, this), Zt.beforeDeactivate(Rr, (t => C(t.closeAll(), (t => {
            if (t.length > 0) throw new Error(`There are still ${t.length} open dialog(s).`);
        })))));
    }
    open(t) {
        return Vr(new Promise((e => {
            var i;
            const s = DialogSettings.from(this.ti, t);
            const n = null !== (i = s.container) && void 0 !== i ? i : this.G.createChild();
            e(C(s.load(), (t => {
                const e = n.invoke(DialogController);
                n.register(c.instance(Dr, e));
                n.register(c.callback(DialogController, (() => {
                    throw new Error("Invalid injection of DialogController. Use IDialogController instead.");
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
        const i = jr(e);
        if (null == i) return;
        const s = this.top;
        if (null === s || 0 === s.settings.keyboard.length) return;
        const n = s.settings.keyboard;
        if ("Escape" === i && n.includes(i)) void s.cancel(); else if ("Enter" === i && n.includes(i)) void s.ok();
    }
}

class DialogSettings {
    static from(...t) {
        return Object.assign(new DialogSettings, ...t).validate().normalize();
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
    validate() {
        if (null == this.component && null == this.template) throw new Error('Invalid Dialog Settings. You must provide "component", "template" or both.');
        return this;
    }
    normalize() {
        if (null == this.keyboard) this.keyboard = this.lock ? [] : [ "Enter", "Escape" ];
        if ("boolean" !== typeof this.overlayDismiss) this.overlayDismiss = !this.lock;
        return this;
    }
}

function Fr(t, e) {
    return this.then((i => i.dialog.closed.then(t, e)), e);
}

function Vr(t) {
    t.whenClosed = Fr;
    return t;
}

function jr(t) {
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
        c.singleton($r, this).register(t);
    }
}

const _r = "position:absolute;width:100%;height:100%;top:0;left:0;";

class DefaultDialogDomRenderer {
    constructor(t) {
        this.p = t;
        this.wrapperCss = `${_r} display:flex;`;
        this.overlayCss = _r;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        c.singleton(Pr, this).register(t);
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
        const o = s.appendChild(i("div", this.hostCss));
        return new DefaultDialogDom(s, n, o);
    }
}

DefaultDialogDomRenderer.inject = [ Bt ];

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

function Nr(t, e) {
    return {
        settingsProvider: t,
        register: i => i.register(...e, Zt.beforeCreate((() => t(i.get($r))))),
        customize(t, i) {
            return Nr(t, null !== i && void 0 !== i ? i : e);
        }
    };
}

const Hr = Nr((() => {
    throw new Error("Invalid dialog configuration. " + "Specify the implementations for " + "<IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, " + "or use the DialogDefaultConfiguration export.");
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(c.singleton($r, this));
    }
} ]);

const Wr = Nr(r, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer ]);

export { AdoptedStyleSheetsStyles, AppRoot, Zt as AppTask, kt as AtPrefixedTriggerAttributePattern, bo as AtPrefixedTriggerAttributePatternRegistration, AttrBindingBehavior, er as AttrBindingBehaviorRegistration, js as AttrBindingCommand, qo as AttrBindingCommandRegistration, AttrSyntax, AttributeBinding, AttributeBindingInstruction, xr as AttributeBindingRendererRegistration, AttributeNSAccessor, wt as AttributePattern, AuCompose, eo as AuRender, nr as AuRenderRegistration, AuSlot, AuSlotsInfo, Aurelia, ct as Bindable, BindableDefinition, BindableObserver, BindablesInfo, Is as BindingCommand, BindingCommandDefinition, BindingModeBehavior, CSSModulesProcessorRegistry, CallBinding, Ls as CallBindingCommand, So as CallBindingCommandRegistration, CallBindingInstruction, cr as CallBindingRendererRegistration, Vs as CaptureBindingCommand, Lo as CaptureBindingCommandRegistration, Hn as Case, CheckedObserver, ie as Children, ChildrenDefinition, ChildrenObserver, ClassAttributeAccessor, Ns as ClassBindingCommand, Mo as ClassBindingCommandRegistration, xt as ColonPrefixedBindAttributePattern, yo as ColonPrefixedBindAttributePatternRegistration, ComputedWatcher, Controller, fe as CustomAttribute, CustomAttributeDefinition, ur as CustomAttributeRendererRegistration, Ce as CustomElement, CustomElementDefinition, fr as CustomElementRendererRegistration, DataAttributeAccessor, DebounceBindingBehavior, lo as DebounceBindingBehaviorRegistration, $s as DefaultBindingCommand, Eo as DefaultBindingCommandRegistration, Vo as DefaultBindingLanguage, Co as DefaultBindingSyntax, Wn as DefaultCase, go as DefaultComponents, DefaultDialogDom, DefaultDialogDomRenderer, DefaultDialogGlobalSettings, Br as DefaultRenderers, ar as DefaultResources, Fs as DelegateBindingCommand, $o as DelegateBindingCommandRegistration, DialogCloseResult, Hr as DialogConfiguration, DialogController, Lr as DialogDeactivationStatuses, Wr as DialogDefaultConfiguration, DialogOpenResult, DialogService, bt as DotSeparatedAttributePattern, ko as DotSeparatedAttributePatternRegistration, Ln as Else, Uo as ElseRegistration, EventDelegator, EventSubscriber, ExpressionWatcher, On as Focus, qs as ForBindingCommand, Bo as ForBindingCommandRegistration, FragmentNodeSequence, FrequentMutations, FromViewBindingBehavior, co as FromViewBindingBehaviorRegistration, Ps as FromViewBindingCommand, To as FromViewBindingCommandRegistration, Gn as FulfilledTemplateController, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, yi as IAppRoot, Qt as IAppTask, Rt as IAttrMapper, mt as IAttributeParser, dt as IAttributePattern, ji as IAuSlotsInfo, Ir as IAurelia, mi as IController, Dr as IDialogController, Or as IDialogDom, Pr as IDialogDomRenderer, $r as IDialogGlobalSettings, Rr as IDialogService, Fi as IEventDelegator, Si as IEventTarget, Li as IHistory, vi as IHydrationContext, Ni as IInstruction, Ve as ILifecycleHooks, $i as ILocation, Ai as INode, po as INodeObserverLocatorRegistration, Bt as IPlatform, Vi as IProjections, Ei as IRenderLocation, Ui as IRenderer, Ze as IRendering, Tt as ISVGAnalyzer, no as ISanitizer, Oe as IShadowDOMGlobalStyles, De as IShadowDOMStyleFactory, Pe as IShadowDOMStyles, ft as ISyntaxInterpreter, Wi as ITemplateCompiler, ln as ITemplateCompilerHooks, vo as ITemplateCompilerRegistration, Ws as ITemplateElementFactory, We as IViewFactory, Qe as IViewLocator, Oi as IWindow, xi as IWorkTracker, If, Wo as IfRegistration, _i as InstructionType, InterpolationBinding, dr as InterpolationBindingRendererRegistration, InterpolationInstruction, Interpretation, IteratorBindingInstruction, mr as IteratorBindingRendererRegistration, LetBinding, LetBindingInstruction, vr as LetElementRendererRegistration, Ne as LifecycleHooks, LifecycleHooksDefinition, LifecycleHooksEntry, Listener, ListenerBindingInstruction, yr as ListenerBindingRendererRegistration, NodeObserverConfig, NodeObserverLocator, Bi as NodeType, NoopSVGAnalyzer, ObserveShallow, OneTimeBindingBehavior, ho as OneTimeBindingBehaviorRegistration, Rs as OneTimeBindingCommand, Io as OneTimeBindingCommandRegistration, zn as PendingTemplateController, Portal, Un as PromiseTemplateController, PropertyBinding, PropertyBindingInstruction, pr as PropertyBindingRendererRegistration, yt as RefAttributePattern, xo as RefAttributePatternRegistration, RefBinding, Po as RefBindingCommandRegistration, RefBindingInstruction, gr as RefBindingRendererRegistration, Xn as RejectedTemplateController, RenderPlan, Rendering, Repeat, zo as RepeatRegistration, SVGAnalyzer, wo as SVGAnalyzerRegistration, oo as SanitizeValueConverter, jo as SanitizeValueConverterRegistration, SelectValueObserver, SelfBindingBehavior, ir as SelfBindingBehaviorRegistration, SetAttributeInstruction, kr as SetAttributeRendererRegistration, SetClassAttributeInstruction, Cr as SetClassAttributeRendererRegistration, SetPropertyInstruction, wr as SetPropertyRendererRegistration, SetStyleAttributeInstruction, Ar as SetStyleAttributeRendererRegistration, ShadowDOMRegistry, Ao as ShortHandBindingSyntax, dn as SignalBindingBehavior, uo as SignalBindingBehaviorRegistration, Tr as StandardConfiguration, StyleAttributeAccessor, _s as StyleBindingCommand, Fo as StyleBindingCommandRegistration, $e as StyleConfiguration, StyleElementStyles, StylePropertyBindingInstruction, Sr as StylePropertyBindingRendererRegistration, Nn as Switch, TemplateCompiler, cn as TemplateCompilerHooks, br as TemplateControllerRendererRegistration, TextBindingInstruction, Er as TextBindingRendererRegistration, ThrottleBindingBehavior, fo as ThrottleBindingBehaviorRegistration, ToViewBindingBehavior, ao as ToViewBindingBehaviorRegistration, Ds as ToViewBindingCommand, Ro as ToViewBindingCommandRegistration, Ms as TriggerBindingCommand, Oo as TriggerBindingCommandRegistration, TwoWayBindingBehavior, mo as TwoWayBindingBehaviorRegistration, Os as TwoWayBindingCommand, Do as TwoWayBindingCommandRegistration, UpdateTriggerBindingBehavior, sr as UpdateTriggerBindingBehaviorRegistration, ValueAttributeObserver, ViewFactory, ViewLocator, ui as ViewModelKind, ro as ViewValueConverter, _o as ViewValueConverterRegistration, Ke as Views, pe as Watch, With, Go as WithRegistration, zs as allResources, vt as attributePattern, lt as bindable, Bs as bindingCommand, te as children, be as containerless, Di as convertToRenderLocation, Yn as createElement, Ie as cssModules, ae as customAttribute, ge as customElement, Ii as getEffectiveParentNode, ki as getRef, hi as isCustomElementController, ai as isCustomElementViewModel, Hi as isInstruction, Pi as isRenderLocation, He as lifecycleHooks, Se as processContent, zi as renderer, Ri as setEffectiveParentNode, Ci as setRef, Re as shadowCSS, un as templateCompilerHooks, ce as templateController, we as useShadowDOM, Ye as view, de as watch };
//# sourceMappingURL=index.js.map
