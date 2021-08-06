"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/platform");

var e = require("@aurelia/platform-browser");

var s = require("@aurelia/kernel");

var i = require("@aurelia/runtime");

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
***************************************************************************** */ function n(t, e, s, i) {
    var n = arguments.length, o = n < 3 ? e : null === i ? i = Object.getOwnPropertyDescriptor(e, s) : i, r;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) o = Reflect.decorate(t, e, s, i); else for (var l = t.length - 1; l >= 0; l--) if (r = t[l]) o = (n < 3 ? r(o) : n > 3 ? r(e, s, o) : r(e, s)) || o;
    return n > 3 && o && Object.defineProperty(e, s, o), o;
}

function o(t, e) {
    return function(s, i) {
        e(s, i, t);
    };
}

const r = s.Metadata.getOwn;

const l = s.Metadata.hasOwn;

const h = s.Metadata.define;

const {annotation: c, resource: a} = s.Protocol;

const u = c.keyFor;

const f = a.keyFor;

const d = a.appendTo;

const p = c.appendTo;

const x = c.getKeys;

function m(t, e) {
    let s;
    function i(t, e) {
        if (arguments.length > 1) s.property = e;
        h(g, BindableDefinition.create(e, s), t.constructor, e);
        p(t.constructor, w.keyFrom(e));
    }
    if (arguments.length > 1) {
        s = {};
        i(t, e);
        return;
    } else if ("string" === typeof t) {
        s = {};
        return i;
    }
    s = void 0 === t ? {} : t;
    return i;
}

function v(t) {
    return t.startsWith(g);
}

const g = u("bindable");

const w = Object.freeze({
    name: g,
    keyFrom: t => `${g}:${t}`,
    from(...t) {
        const e = {};
        const s = Array.isArray;
        function i(t) {
            e[t] = BindableDefinition.create(t);
        }
        function n(t, s) {
            e[t] = s instanceof BindableDefinition ? s : BindableDefinition.create(t, s);
        }
        function o(t) {
            if (s(t)) t.forEach(i); else if (t instanceof BindableDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t[e])));
        }
        t.forEach(o);
        return e;
    },
    for(t) {
        let e;
        const s = {
            add(i) {
                let n;
                let o;
                if ("string" === typeof i) {
                    n = i;
                    o = {
                        property: n
                    };
                } else {
                    n = i.property;
                    o = i;
                }
                e = BindableDefinition.create(n, o);
                if (!l(g, t, n)) p(t, w.keyFrom(n));
                h(g, e, t, n);
                return s;
            },
            mode(t) {
                e.mode = t;
                return s;
            },
            callback(t) {
                e.callback = t;
                return s;
            },
            attribute(t) {
                e.attribute = t;
                return s;
            },
            primary() {
                e.primary = true;
                return s;
            },
            set(t) {
                e.set = t;
                return s;
            }
        };
        return s;
    },
    getAll(t) {
        const e = g.length + 1;
        const i = [];
        const n = s.getPrototypeChain(t);
        let o = n.length;
        let l = 0;
        let h;
        let c;
        let a;
        let u;
        while (--o >= 0) {
            a = n[o];
            h = x(a).filter(v);
            c = h.length;
            for (u = 0; u < c; ++u) i[l++] = r(g, a, h[u].slice(e));
        }
        return i;
    }
});

class BindableDefinition {
    constructor(t, e, s, i, n, o) {
        this.attribute = t;
        this.callback = e;
        this.mode = s;
        this.primary = i;
        this.property = n;
        this.set = o;
    }
    static create(t, e = {}) {
        return new BindableDefinition(s.firstDefined(e.attribute, s.kebabCase(t)), s.firstDefined(e.callback, `${t}Changed`), s.firstDefined(e.mode, i.BindingMode.toView), s.firstDefined(e.primary, false), s.firstDefined(e.property, t), s.firstDefined(e.set, s.noop));
    }
}

class BindableObserver {
    constructor(t, e, i, n, o) {
        this.set = n;
        this.$controller = o;
        this.v = void 0;
        this.ov = void 0;
        this.f = 0;
        const r = t[i];
        const l = t.propertyChanged;
        const h = this.t = "function" === typeof r;
        const c = this.i = "function" === typeof l;
        const a = this.HS = n !== s.noop;
        let u;
        this.O = t;
        this.K = e;
        this.cb = h ? r : s.noop;
        this.o = c ? l : s.noop;
        if (void 0 === this.cb && !c && !a) this.iO = false; else {
            this.iO = true;
            u = t[e];
            this.v = a && void 0 !== u ? n(u) : u;
            this.l();
        }
    }
    get type() {
        return 1;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        if (this.HS) t = this.set(t);
        const s = this.v;
        if (this.iO) {
            if (Object.is(t, s)) return;
            this.v = t;
            this.ov = s;
            this.f = e;
            if (null == this.$controller || this.$controller.isBound) {
                if (this.t) this.cb.call(this.O, t, s, e);
                if (this.i) this.o.call(this.O, this.K, t, s, e);
            }
            this.queue.add(this);
        } else this.O[this.K] = t;
    }
    subscribe(t) {
        if (false === !this.iO) {
            this.iO = true;
            this.v = this.HS ? this.set(this.O[this.K]) : this.O[this.K];
            this.l();
        }
        this.subs.add(t);
    }
    flush() {
        b = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, b, this.f);
    }
    l() {
        Reflect.defineProperty(this.O, this.K, {
            enumerable: true,
            configurable: true,
            get: () => this.v,
            set: t => {
                this.setValue(t, 0);
            }
        });
    }
}

i.subscriberCollection(BindableObserver);

i.withFlushQueue(BindableObserver);

let b;

class CharSpec {
    constructor(t, e, s, i) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = s;
        this.isInverted = i;
        if (i) switch (t.length) {
          case 0:
            this.has = this.u;
            break;

          case 1:
            this.has = this.C;
            break;

          default:
            this.has = this.A;
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
    A(t) {
        return !this.chars.includes(t);
    }
    C(t) {
        return this.chars !== t;
    }
    u(t) {
        return true;
    }
}

class Interpretation {
    constructor() {
        this.parts = s.emptyArray;
        this.P = "";
        this.$ = {};
        this.L = {};
    }
    get pattern() {
        const t = this.P;
        if ("" === t) return null; else return t;
    }
    set pattern(t) {
        if (null == t) {
            this.P = "";
            this.parts = s.emptyArray;
        } else {
            this.P = t;
            this.parts = this.L[t];
        }
    }
    append(t, e) {
        const s = this.$;
        if (void 0 === s[t]) s[t] = e; else s[t] += e;
    }
    next(t) {
        const e = this.$;
        let s;
        if (void 0 !== e[t]) {
            s = this.L;
            if (void 0 === s[t]) s[t] = [ e[t] ]; else s[t].push(e[t]);
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
        const s = e.length;
        let i = null;
        let n = 0;
        for (;n < s; ++n) {
            i = e[n];
            if (t.equals(i.charSpec)) return i;
        }
        return null;
    }
    append(t, e) {
        const s = this.patterns;
        if (!s.includes(e)) s.push(e);
        let i = this.findChild(t);
        if (null == i) {
            i = new State$1(t, e);
            this.nextStates.push(i);
            if (t.repeat) i.nextStates.push(i);
        }
        return i;
    }
    findMatches(t, e) {
        const s = [];
        const i = this.nextStates;
        const n = i.length;
        let o = 0;
        let r = null;
        let l = 0;
        let h = 0;
        for (;l < n; ++l) {
            r = i[l];
            if (r.charSpec.has(t)) {
                s.push(r);
                o = r.patterns.length;
                h = 0;
                if (r.charSpec.isSymbol) for (;h < o; ++h) e.next(r.patterns[h]); else for (;h < o; ++h) e.append(r.patterns[h], t);
            }
        }
        return s;
    }
}

class StaticSegment {
    constructor(t) {
        this.text = t;
        const e = this.len = t.length;
        const s = this.specs = [];
        let i = 0;
        for (;e > i; ++i) s.push(new CharSpec(t[i], false, false, false));
    }
    eachChar(t) {
        const e = this.len;
        const s = this.specs;
        let i = 0;
        for (;e > i; ++i) t(s[i]);
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

const y = s.DI.createInterface("ISyntaxInterpreter", (t => t.singleton(SyntaxInterpreter)));

class SyntaxInterpreter {
    constructor() {
        this.rootState = new State$1(null);
        this.initialStates = [ this.rootState ];
    }
    add(t) {
        t = t.slice(0).sort(((t, e) => t.pattern > e.pattern ? 1 : -1));
        const e = t.length;
        let s;
        let i;
        let n;
        let o;
        let r;
        let l;
        let h;
        let c = 0;
        let a;
        while (e > c) {
            s = this.rootState;
            i = t[c];
            n = i.pattern;
            o = new SegmentTypes;
            r = this.parse(i, o);
            l = r.length;
            h = t => {
                s = s.append(t, n);
            };
            for (a = 0; l > a; ++a) r[a].eachChar(h);
            s.types = o;
            s.isEndpoint = true;
            ++c;
        }
    }
    interpret(t) {
        const e = new Interpretation;
        const s = t.length;
        let i = this.initialStates;
        let n = 0;
        let o;
        for (;n < s; ++n) {
            i = this.getNextStates(i, t.charAt(n), e);
            if (0 === i.length) break;
        }
        i = i.filter(k);
        if (i.length > 0) {
            i.sort(C);
            o = i[0];
            if (!o.charSpec.isSymbol) e.next(o.pattern);
            e.pattern = o.pattern;
        }
        return e;
    }
    getNextStates(t, e, s) {
        const i = [];
        let n = null;
        const o = t.length;
        let r = 0;
        for (;r < o; ++r) {
            n = t[r];
            i.push(...n.findMatches(e, s));
        }
        return i;
    }
    parse(t, e) {
        const s = [];
        const i = t.pattern;
        const n = i.length;
        const o = t.symbols;
        let r = 0;
        let l = 0;
        let h = "";
        while (r < n) {
            h = i.charAt(r);
            if (0 === o.length || !o.includes(h)) if (r === l) if ("P" === h && "PART" === i.slice(r, r + 4)) {
                l = r += 4;
                s.push(new DynamicSegment(o));
                ++e.dynamics;
            } else ++r; else ++r; else if (r !== l) {
                s.push(new StaticSegment(i.slice(l, r)));
                ++e.statics;
                l = r;
            } else {
                s.push(new SymbolSegment(i.slice(l, r + 1)));
                ++e.symbols;
                l = ++r;
            }
        }
        if (l !== r) {
            s.push(new StaticSegment(i.slice(l, r)));
            ++e.statics;
        }
        return s;
    }
}

function k(t) {
    return t.isEndpoint;
}

function C(t, e) {
    const s = t.types;
    const i = e.types;
    if (s.statics !== i.statics) return i.statics - s.statics;
    if (s.dynamics !== i.dynamics) return i.dynamics - s.dynamics;
    if (s.symbols !== i.symbols) return i.symbols - s.symbols;
    return 0;
}

class AttrSyntax {
    constructor(t, e, s, i) {
        this.rawName = t;
        this.rawValue = e;
        this.target = s;
        this.command = i;
    }
}

const A = s.DI.createInterface("IAttributePattern");

const R = s.DI.createInterface("IAttributeParser", (t => t.singleton(AttributeParser)));

class AttributeParser {
    constructor(t, e) {
        this.q = {};
        this.U = t;
        const i = this.M = {};
        const n = e.reduce(((t, e) => {
            const s = I(e.constructor);
            s.forEach((t => i[t.pattern] = e));
            return t.concat(s);
        }), s.emptyArray);
        t.add(n);
    }
    parse(t, e) {
        let s = this.q[t];
        if (null == s) s = this.q[t] = this.U.interpret(t);
        const i = s.pattern;
        if (null == i) return new AttrSyntax(t, e, t, null); else return this.M[i][i](t, e, s.parts);
    }
}

AttributeParser.inject = [ y, s.all(A) ];

function S(...t) {
    return function e(s) {
        return T.define(t, s);
    };
}

class AttributePatternResourceDefinition {
    constructor(t) {
        this.Type = t;
        this.name = void 0;
    }
    register(t) {
        s.Registration.singleton(A, this.Type).register(t);
    }
}

const E = f("attribute-pattern");

const B = "attribute-pattern-definitions";

const I = t => s.Protocol.annotation.get(t, B);

const T = Object.freeze({
    name: E,
    definitionAnnotationKey: B,
    define(t, e) {
        const i = new AttributePatternResourceDefinition(e);
        h(E, i, e);
        d(e, E);
        s.Protocol.annotation.set(e, B, t);
        p(e, B);
        return e;
    },
    getPatternDefinitions: I
});

exports.DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
    "PART.PART"(t, e, s) {
        return new AttrSyntax(t, e, s[0], s[1]);
    }
    "PART.PART.PART"(t, e, s) {
        return new AttrSyntax(t, e, s[0], s[2]);
    }
};

exports.DotSeparatedAttributePattern = n([ S({
    pattern: "PART.PART",
    symbols: "."
}, {
    pattern: "PART.PART.PART",
    symbols: "."
}) ], exports.DotSeparatedAttributePattern);

exports.RefAttributePattern = class RefAttributePattern {
    ref(t, e, s) {
        return new AttrSyntax(t, e, "element", "ref");
    }
    "PART.ref"(t, e, s) {
        return new AttrSyntax(t, e, s[0], "ref");
    }
};

exports.RefAttributePattern = n([ S({
    pattern: "ref",
    symbols: ""
}, {
    pattern: "PART.ref",
    symbols: "."
}) ], exports.RefAttributePattern);

exports.ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
    ":PART"(t, e, s) {
        return new AttrSyntax(t, e, s[0], "bind");
    }
};

exports.ColonPrefixedBindAttributePattern = n([ S({
    pattern: ":PART",
    symbols: ":"
}) ], exports.ColonPrefixedBindAttributePattern);

exports.AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
    "@PART"(t, e, s) {
        return new AttrSyntax(t, e, s[0], "trigger");
    }
};

exports.AtPrefixedTriggerAttributePattern = n([ S({
    pattern: "@PART",
    symbols: "@"
}) ], exports.AtPrefixedTriggerAttributePattern);

const D = () => Object.create(null);

const P = Object.prototype.hasOwnProperty;

const $ = D();

const O = (t, e, s) => {
    if (true === $[e]) return true;
    if ("string" !== typeof e) return false;
    const i = e.slice(0, 5);
    return $[e] = "aria-" === i || "data-" === i || s.isStandardSvgAttribute(t, e);
};

const L = s.IPlatform;

const q = s.DI.createInterface("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

function U(t) {
    const e = D();
    let s;
    for (s of t) e[s] = true;
    return e;
}

class SVGAnalyzer {
    constructor(t) {
        this.F = Object.assign(D(), {
            a: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "target", "transform", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            altGlyph: U([ "class", "dx", "dy", "externalResourcesRequired", "format", "glyphRef", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            altglyph: D(),
            altGlyphDef: U([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphdef: D(),
            altGlyphItem: U([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphitem: D(),
            animate: U([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateColor: U([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateMotion: U([ "accumulate", "additive", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keyPoints", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "origin", "path", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "rotate", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateTransform: U([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "type", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            circle: U([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "r", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            clipPath: U([ "class", "clipPathUnits", "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            "color-profile": U([ "id", "local", "name", "rendering-intent", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            cursor: U([ "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            defs: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            desc: U([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            ellipse: U([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            feBlend: U([ "class", "height", "id", "in", "in2", "mode", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feColorMatrix: U([ "class", "height", "id", "in", "result", "style", "type", "values", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComponentTransfer: U([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComposite: U([ "class", "height", "id", "in", "in2", "k1", "k2", "k3", "k4", "operator", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feConvolveMatrix: U([ "bias", "class", "divisor", "edgeMode", "height", "id", "in", "kernelMatrix", "kernelUnitLength", "order", "preserveAlpha", "result", "style", "targetX", "targetY", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDiffuseLighting: U([ "class", "diffuseConstant", "height", "id", "in", "kernelUnitLength", "result", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDisplacementMap: U([ "class", "height", "id", "in", "in2", "result", "scale", "style", "width", "x", "xChannelSelector", "xml:base", "xml:lang", "xml:space", "y", "yChannelSelector" ]),
            feDistantLight: U([ "azimuth", "elevation", "id", "xml:base", "xml:lang", "xml:space" ]),
            feFlood: U([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feFuncA: U([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncB: U([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncG: U([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncR: U([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feGaussianBlur: U([ "class", "height", "id", "in", "result", "stdDeviation", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feImage: U([ "class", "externalResourcesRequired", "height", "id", "preserveAspectRatio", "result", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMerge: U([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMergeNode: U([ "id", "xml:base", "xml:lang", "xml:space" ]),
            feMorphology: U([ "class", "height", "id", "in", "operator", "radius", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feOffset: U([ "class", "dx", "dy", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            fePointLight: U([ "id", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feSpecularLighting: U([ "class", "height", "id", "in", "kernelUnitLength", "result", "specularConstant", "specularExponent", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feSpotLight: U([ "id", "limitingConeAngle", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feTile: U([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feTurbulence: U([ "baseFrequency", "class", "height", "id", "numOctaves", "result", "seed", "stitchTiles", "style", "type", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            filter: U([ "class", "externalResourcesRequired", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            font: U([ "class", "externalResourcesRequired", "horiz-adv-x", "horiz-origin-x", "horiz-origin-y", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            "font-face": U([ "accent-height", "alphabetic", "ascent", "bbox", "cap-height", "descent", "font-family", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "hanging", "id", "ideographic", "mathematical", "overline-position", "overline-thickness", "panose-1", "slope", "stemh", "stemv", "strikethrough-position", "strikethrough-thickness", "underline-position", "underline-thickness", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "widths", "x-height", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-format": U([ "id", "string", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-name": U([ "id", "name", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-src": U([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-uri": U([ "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            foreignObject: U([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            g: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            glyph: U([ "arabic-form", "class", "d", "glyph-name", "horiz-adv-x", "id", "lang", "orientation", "style", "unicode", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            glyphRef: U([ "class", "dx", "dy", "format", "glyphRef", "id", "style", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            glyphref: D(),
            hkern: U([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ]),
            image: U([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            line: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "x1", "x2", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            linearGradient: U([ "class", "externalResourcesRequired", "gradientTransform", "gradientUnits", "id", "spreadMethod", "style", "x1", "x2", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            marker: U([ "class", "externalResourcesRequired", "id", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            mask: U([ "class", "externalResourcesRequired", "height", "id", "maskContentUnits", "maskUnits", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            metadata: U([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "missing-glyph": U([ "class", "d", "horiz-adv-x", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            mpath: U([ "externalResourcesRequired", "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            path: U([ "class", "d", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "pathLength", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            pattern: U([ "class", "externalResourcesRequired", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            polygon: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            polyline: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            radialGradient: U([ "class", "cx", "cy", "externalResourcesRequired", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "spreadMethod", "style", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            rect: U([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            script: U([ "externalResourcesRequired", "id", "type", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            set: U([ "attributeName", "attributeType", "begin", "dur", "end", "externalResourcesRequired", "fill", "id", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            stop: U([ "class", "id", "offset", "style", "xml:base", "xml:lang", "xml:space" ]),
            style: U([ "id", "media", "title", "type", "xml:base", "xml:lang", "xml:space" ]),
            svg: U([ "baseProfile", "class", "contentScriptType", "contentStyleType", "externalResourcesRequired", "height", "id", "onabort", "onactivate", "onclick", "onerror", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onresize", "onscroll", "onunload", "onzoom", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "version", "viewBox", "width", "x", "xml:base", "xml:lang", "xml:space", "y", "zoomAndPan" ]),
            switch: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            symbol: U([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            text: U([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "transform", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            textPath: U([ "class", "externalResourcesRequired", "id", "lengthAdjust", "method", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "textLength", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            title: U([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            tref: U([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            tspan: U([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            use: U([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            view: U([ "externalResourcesRequired", "id", "preserveAspectRatio", "viewBox", "viewTarget", "xml:base", "xml:lang", "xml:space", "zoomAndPan" ]),
            vkern: U([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ])
        });
        this.V = U([ "a", "altGlyph", "animate", "animateColor", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood", "feGaussianBlur", "feImage", "feMerge", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence", "filter", "font", "foreignObject", "g", "glyph", "glyphRef", "image", "line", "linearGradient", "marker", "mask", "missing-glyph", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use" ]);
        this.j = U([ "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "clip", "color-interpolation-filters", "color-interpolation", "color-profile", "color-rendering", "color", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "fill", "filter", "flood-color", "flood-opacity", "font-family", "font-size-adjust", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "stroke", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ]);
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
        return s.Registration.singleton(q, this).register(t);
    }
    isStandardSvgAttribute(t, e) {
        var s;
        if (!(t instanceof this.SVGElement)) return false;
        return true === this.V[t.nodeName] && true === this.j[e] || true === (null === (s = this.F[t.nodeName]) || void 0 === s ? void 0 : s[e]);
    }
}

SVGAnalyzer.inject = [ L ];

const M = s.DI.createInterface("IAttrMapper", (t => t.singleton(AttrMapper)));

class AttrMapper {
    constructor(t) {
        this.svg = t;
        this.fns = [];
        this._ = D();
        this.N = D();
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
        return [ q ];
    }
    useMapping(t) {
        var e;
        var s;
        let i;
        let n;
        let o;
        let r;
        for (o in t) {
            i = t[o];
            n = null !== (e = (s = this._)[o]) && void 0 !== e ? e : s[o] = D();
            for (r in i) {
                if (void 0 !== n[r]) throw V(r, o);
                n[r] = i[r];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.N;
        for (const s in t) {
            if (void 0 !== e[s]) throw V(s, "*");
            e[s] = t[s];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return F(t, e) || this.fns.length > 0 && this.fns.some((s => s(t, e)));
    }
    map(t, e) {
        var s, i, n;
        return null !== (n = null !== (i = null === (s = this._[t.nodeName]) || void 0 === s ? void 0 : s[e]) && void 0 !== i ? i : this.N[e]) && void 0 !== n ? n : O(t, e, this.svg) ? e : null;
    }
}

function F(t, e) {
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

function V(t, e) {
    return new Error(`Attribute ${t} has been already registered for ${"*" === e ? "all elements" : `<${e}/>`}`);
}

class CallBinding {
    constructor(t, e, s, i, n) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = s;
        this.locator = n;
        this.interceptor = this;
        this.isBound = false;
        this.targetObserver = i.getAccessor(e, s);
    }
    callSource(t) {
        const e = this.$scope.overrideContext;
        e.$event = t;
        const s = this.sourceExpression.evaluate(8, this.$scope, this.locator, null);
        Reflect.deleteProperty(e, "$event");
        return s;
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
    handleChange(t, e, s) {
        return;
    }
}

class AttributeObserver {
    constructor(t, e, s) {
        this.type = 2 | 1 | 4;
        this.v = null;
        this.ov = null;
        this.W = false;
        this.f = 0;
        this.O = t;
        this.H = e;
        this.X = s;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        this.v = t;
        this.W = t !== this.ov;
        if (0 === (256 & e)) this.Y();
    }
    Y() {
        if (this.W) {
            this.W = false;
            this.ov = this.v;
            switch (this.X) {
              case "class":
                this.O.classList.toggle(this.H, !!this.v);
                break;

              case "style":
                {
                    let t = "";
                    let e = this.v;
                    if ("string" === typeof e && e.includes("!important")) {
                        t = "important";
                        e = e.replace("!important", "");
                    }
                    this.O.style.setProperty(this.H, e, t);
                    break;
                }

              default:
                if (null == this.v) this.O.removeAttribute(this.X); else this.O.setAttribute(this.X, String(this.v));
            }
        }
    }
    handleMutation(t) {
        let e = false;
        for (let s = 0, i = t.length; i > s; ++s) {
            const i = t[s];
            if ("attributes" === i.type && i.attributeName === this.H) {
                e = true;
                break;
            }
        }
        if (e) {
            let t;
            switch (this.X) {
              case "class":
                t = this.O.classList.contains(this.H);
                break;

              case "style":
                t = this.O.style.getPropertyValue(this.H);
                break;

              default:
                throw new Error(`AUR0651:${this.X}`);
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
            this.v = this.ov = this.O.getAttribute(this.H);
            j(this.O.ownerDocument.defaultView.MutationObserver, this.O, this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) _(this.O, this);
    }
    flush() {
        H = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, H, this.f);
    }
}

i.subscriberCollection(AttributeObserver);

i.withFlushQueue(AttributeObserver);

const j = (t, e, s) => {
    if (void 0 === e.$eMObs) e.$eMObs = new Set;
    if (void 0 === e.$mObs) (e.$mObs = new t(N)).observe(e, {
        attributes: true
    });
    e.$eMObs.add(s);
};

const _ = (t, e) => {
    const s = t.$eMObs;
    if (s && s.delete(e)) {
        if (0 === s.size) {
            t.$mObs.disconnect();
            t.$mObs = void 0;
        }
        return true;
    }
    return false;
};

const N = t => {
    t[0].target.$eMObs.forEach(W, t);
};

function W(t) {
    t.handleMutation(this);
}

let H;

class BindingTargetSubscriber {
    constructor(t) {
        this.b = t;
    }
    handleChange(t, e, s) {
        const i = this.b;
        if (t !== i.sourceExpression.evaluate(s, i.$scope, i.locator, null)) i.updateSource(t, s);
    }
}

const {oneTime: z, toView: G, fromView: X} = i.BindingMode;

const K = G | z;

const Y = {
    reusable: false,
    preempt: true
};

class AttributeBinding {
    constructor(t, e, s, i, n, o, r) {
        this.sourceExpression = t;
        this.targetAttribute = s;
        this.targetProperty = i;
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
        this.p = r.get(L);
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
    handleChange(t, e, s) {
        if (!this.isBound) return;
        s |= this.persistentFlags;
        const i = this.mode;
        const n = this.interceptor;
        const o = this.sourceExpression;
        const r = this.$scope;
        const l = this.locator;
        const h = this.targetObserver;
        const c = 0 === (2 & s) && (4 & h.type) > 0;
        let a = false;
        let u;
        if (10082 !== o.$kind || this.obs.count > 1) {
            a = 0 === (i & z);
            if (a) this.obs.version++;
            t = o.evaluate(s, r, l, n);
            if (a) this.obs.clear();
        }
        if (t !== this.value) {
            this.value = t;
            if (c) {
                u = this.task;
                this.task = this.p.domWriteQueue.queueTask((() => {
                    this.task = null;
                    n.updateTarget(t, s);
                }), Y);
                null === u || void 0 === u ? void 0 : u.cancel();
            } else n.updateTarget(t, s);
        }
    }
    $bind(t, e) {
        var s;
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.persistentFlags = 961 & t;
        this.$scope = e;
        let i = this.sourceExpression;
        if (i.hasBind) i.bind(t, e, this.interceptor);
        let n = this.targetObserver;
        if (!n) n = this.targetObserver = new AttributeObserver(this.target, this.targetProperty, this.targetAttribute);
        i = this.sourceExpression;
        const o = this.mode;
        const r = this.interceptor;
        let l = false;
        if (o & K) {
            l = (o & G) > 0;
            r.updateTarget(this.value = i.evaluate(t, e, this.locator, l ? r : null), t);
        }
        if (o & X) n.subscribe(null !== (s = this.targetSubscriber) && void 0 !== s ? s : this.targetSubscriber = new BindingTargetSubscriber(r));
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

i.connectable(AttributeBinding);

const {toView: Z} = i.BindingMode;

const J = {
    reusable: false,
    preempt: true
};

class InterpolationBinding {
    constructor(t, e, s, i, n, o, r) {
        this.interpolation = e;
        this.target = s;
        this.targetProperty = i;
        this.mode = n;
        this.locator = o;
        this.taskQueue = r;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.oL = t;
        this.targetObserver = t.getAccessor(s, i);
        const l = e.expressions;
        const h = this.partBindings = Array(l.length);
        const c = l.length;
        let a = 0;
        for (;c > a; ++a) h[a] = new InterpolationPartBinding(l[a], s, i, o, t, this);
    }
    updateTarget(t, e) {
        const s = this.partBindings;
        const i = this.interpolation.parts;
        const n = s.length;
        let o = "";
        let r = 0;
        if (1 === n) o = i[0] + s[0].value + i[1]; else {
            o = i[0];
            for (;n > r; ++r) o += s[r].value + i[r + 1];
        }
        const l = this.targetObserver;
        const h = 0 === (2 & e) && (4 & l.type) > 0;
        let c;
        if (h) {
            c = this.task;
            this.task = this.taskQueue.queueTask((() => {
                this.task = null;
                l.setValue(o, e, this.target, this.targetProperty);
            }), J);
            null === c || void 0 === c ? void 0 : c.cancel();
            c = null;
        } else l.setValue(o, e, this.target, this.targetProperty);
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(t);
        }
        this.isBound = true;
        this.$scope = e;
        const s = this.partBindings;
        const i = s.length;
        let n = 0;
        for (;i > n; ++n) s[n].$bind(t, e);
        this.updateTarget(void 0, t);
    }
    $unbind(t) {
        var e;
        if (!this.isBound) return;
        this.isBound = false;
        this.$scope = void 0;
        const s = this.partBindings;
        const i = s.length;
        let n = 0;
        for (;i > n; ++n) s[n].interceptor.$unbind(t);
        null === (e = this.task) || void 0 === e ? void 0 : e.cancel();
        this.task = null;
    }
}

class InterpolationPartBinding {
    constructor(t, e, s, n, o, r) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = s;
        this.locator = n;
        this.owner = r;
        this.interceptor = this;
        this.mode = i.BindingMode.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
        this.oL = o;
    }
    handleChange(t, e, s) {
        if (!this.isBound) return;
        const i = this.sourceExpression;
        const n = this.obs;
        const o = 10082 === i.$kind && 1 === n.count;
        let r = false;
        if (!o) {
            r = (this.mode & Z) > 0;
            if (r) n.version++;
            t = i.evaluate(s, this.$scope, this.locator, r ? this.interceptor : null);
            if (r) n.clear();
        }
        if (t != this.value) {
            this.value = t;
            if (t instanceof Array) this.observeCollection(t);
            this.owner.updateTarget(t, s);
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
        this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & Z) > 0 ? this.interceptor : null);
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

i.connectable(InterpolationPartBinding);

class ContentBinding {
    constructor(t, e, s, n, o, r) {
        this.sourceExpression = t;
        this.target = e;
        this.locator = s;
        this.p = o;
        this.strict = r;
        this.interceptor = this;
        this.mode = i.BindingMode.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
        this.oL = n;
    }
    updateTarget(t, e) {
        var s, i;
        const n = this.target;
        const o = this.p.Node;
        const r = this.value;
        this.value = t;
        if (r instanceof o) null === (s = r.parentNode) || void 0 === s ? void 0 : s.removeChild(r);
        if (t instanceof o) {
            n.textContent = "";
            null === (i = n.parentNode) || void 0 === i ? void 0 : i.insertBefore(t, n);
        } else n.textContent = String(t);
    }
    handleChange(t, e, s) {
        var i;
        if (!this.isBound) return;
        const n = this.sourceExpression;
        const o = this.obs;
        const r = 10082 === n.$kind && 1 === o.count;
        let l = false;
        if (!r) {
            l = (this.mode & Z) > 0;
            if (l) o.version++;
            s |= this.strict ? 1 : 0;
            t = n.evaluate(s, this.$scope, this.locator, l ? this.interceptor : null);
            if (l) o.clear();
        }
        if (t === this.value) {
            null === (i = this.task) || void 0 === i ? void 0 : i.cancel();
            this.task = null;
            return;
        }
        const h = 0 === (2 & s);
        if (h) this.queueUpdate(t, s); else this.updateTarget(t, s);
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
        const s = this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & Z) > 0 ? this.interceptor : null);
        if (s instanceof Array) this.observeCollection(s);
        this.updateTarget(s, t);
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
        const s = this.task;
        this.task = this.p.domWriteQueue.queueTask((() => {
            this.task = null;
            this.updateTarget(t, e);
        }), J);
        null === s || void 0 === s ? void 0 : s.cancel();
    }
}

i.connectable(ContentBinding);

class LetBinding {
    constructor(t, e, s, i, n = false) {
        this.sourceExpression = t;
        this.targetProperty = e;
        this.locator = i;
        this.toBindingContext = n;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.target = null;
        this.oL = s;
    }
    handleChange(t, e, s) {
        if (!this.isBound) return;
        const i = this.target;
        const n = this.targetProperty;
        const o = i[n];
        this.obs.version++;
        t = this.sourceExpression.evaluate(s, this.$scope, this.locator, this.interceptor);
        this.obs.clear();
        if (t !== o) i[n] = t;
    }
    $bind(t, e) {
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        this.$scope = e;
        this.target = this.toBindingContext ? e.bindingContext : e.overrideContext;
        const s = this.sourceExpression;
        if (s.hasBind) s.bind(t, e, this.interceptor);
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

i.connectable(LetBinding);

const {oneTime: Q, toView: tt, fromView: et} = i.BindingMode;

const st = tt | Q;

const it = {
    reusable: false,
    preempt: true
};

class PropertyBinding {
    constructor(t, e, s, i, n, o, r) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = s;
        this.mode = i;
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
    handleChange(t, e, s) {
        if (!this.isBound) return;
        s |= this.persistentFlags;
        const i = 0 === (2 & s) && (4 & this.targetObserver.type) > 0;
        const n = this.obs;
        let o = false;
        if (10082 !== this.sourceExpression.$kind || n.count > 1) {
            o = this.mode > Q;
            if (o) n.version++;
            t = this.sourceExpression.evaluate(s, this.$scope, this.locator, this.interceptor);
            if (o) n.clear();
        }
        if (i) {
            nt = this.task;
            this.task = this.taskQueue.queueTask((() => {
                this.interceptor.updateTarget(t, s);
                this.task = null;
            }), it);
            null === nt || void 0 === nt ? void 0 : nt.cancel();
            nt = null;
        } else this.interceptor.updateTarget(t, s);
    }
    $bind(t, e) {
        var s;
        if (this.isBound) {
            if (this.$scope === e) return;
            this.interceptor.$unbind(2 | t);
        }
        t |= 1;
        this.persistentFlags = 961 & t;
        this.$scope = e;
        let i = this.sourceExpression;
        if (i.hasBind) i.bind(t, e, this.interceptor);
        const n = this.oL;
        const o = this.mode;
        let r = this.targetObserver;
        if (!r) {
            if (o & et) r = n.getObserver(this.target, this.targetProperty); else r = n.getAccessor(this.target, this.targetProperty);
            this.targetObserver = r;
        }
        i = this.sourceExpression;
        const l = this.interceptor;
        const h = (o & tt) > 0;
        if (o & st) l.updateTarget(i.evaluate(t, e, this.locator, h ? l : null), t);
        if (o & et) {
            r.subscribe(null !== (s = this.targetSubscriber) && void 0 !== s ? s : this.targetSubscriber = new BindingTargetSubscriber(l));
            if (!h) l.updateSource(r.getValue(this.target, this.targetProperty), t);
        }
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        this.persistentFlags = 0;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        nt = this.task;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        if (null != nt) {
            nt.cancel();
            nt = this.task = null;
        }
        this.obs.clearAll();
        this.isBound = false;
    }
}

i.connectable(PropertyBinding);

let nt = null;

class RefBinding {
    constructor(t, e, s) {
        this.sourceExpression = t;
        this.target = e;
        this.locator = s;
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
    handleChange(t, e, s) {
        return;
    }
}

const ot = s.DI.createInterface("IAppTask");

class $AppTask {
    constructor(t, e, s) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = s;
    }
    register(t) {
        return this.c = t.register(s.Registration.instance(ot, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return null === t ? e() : e(this.c.get(t));
    }
}

const rt = Object.freeze({
    beforeCreate: lt("beforeCreate"),
    hydrating: lt("hydrating"),
    hydrated: lt("hydrated"),
    beforeActivate: lt("beforeActivate"),
    afterActivate: lt("afterActivate"),
    beforeDeactivate: lt("beforeDeactivate"),
    afterDeactivate: lt("afterDeactivate")
});

function lt(t) {
    function e(e, s) {
        if ("function" === typeof s) return new $AppTask(t, e, s);
        return new $AppTask(t, null, e);
    }
    return e;
}

function ht(t, e) {
    let s;
    function i(t, e) {
        if (arguments.length > 1) s.property = e;
        h(at, ChildrenDefinition.create(e, s), t.constructor, e);
        p(t.constructor, ut.keyFrom(e));
    }
    if (arguments.length > 1) {
        s = {};
        i(t, e);
        return;
    } else if ("string" === typeof t) {
        s = {};
        return i;
    }
    s = void 0 === t ? {} : t;
    return i;
}

function ct(t) {
    return t.startsWith(at);
}

const at = u("children-observer");

const ut = Object.freeze({
    name: at,
    keyFrom: t => `${at}:${t}`,
    from(...t) {
        const e = {};
        const s = Array.isArray;
        function i(t) {
            e[t] = ChildrenDefinition.create(t);
        }
        function n(t, s) {
            e[t] = ChildrenDefinition.create(t, s);
        }
        function o(t) {
            if (s(t)) t.forEach(i); else if (t instanceof ChildrenDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t)));
        }
        t.forEach(o);
        return e;
    },
    getAll(t) {
        const e = at.length + 1;
        const i = [];
        const n = s.getPrototypeChain(t);
        let o = n.length;
        let l = 0;
        let h;
        let c;
        let a;
        while (--o >= 0) {
            a = n[o];
            h = x(a).filter(ct);
            c = h.length;
            for (let t = 0; t < c; ++t) i[l++] = r(at, a, h[t].slice(e));
        }
        return i;
    }
});

const ft = {
    childList: true
};

class ChildrenDefinition {
    constructor(t, e, s, i, n, o) {
        this.callback = t;
        this.property = e;
        this.options = s;
        this.query = i;
        this.filter = n;
        this.map = o;
    }
    static create(t, e = {}) {
        var i;
        return new ChildrenDefinition(s.firstDefined(e.callback, `${t}Changed`), s.firstDefined(e.property, t), null !== (i = e.options) && void 0 !== i ? i : ft, e.query, e.filter, e.map);
    }
}

class ChildrenObserver {
    constructor(t, e, s, i, n = dt, o = pt, r = xt, l) {
        this.controller = t;
        this.obj = e;
        this.propertyKey = s;
        this.query = n;
        this.filter = o;
        this.map = r;
        this.options = l;
        this.observing = false;
        this.children = void 0;
        this.observer = void 0;
        this.callback = e[i];
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
                this.Z();
            }))).observe(this.controller.host, this.options);
        }
    }
    stop() {
        if (this.observing) {
            this.observing = false;
            this.observer.disconnect();
            this.children = s.emptyArray;
        }
    }
    Z() {
        this.children = this.get();
        if (void 0 !== this.callback) this.callback.call(this.obj);
        this.subs.notify(this.children, void 0, 0);
    }
    get() {
        return vt(this.controller, this.query, this.filter, this.map);
    }
}

i.subscriberCollection()(ChildrenObserver);

function dt(t) {
    return t.host.childNodes;
}

function pt(t, e, s) {
    return !!s;
}

function xt(t, e, s) {
    return s;
}

const mt = {
    optional: true
};

function vt(t, e, s, i) {
    var n;
    const o = e(t);
    const r = o.length;
    const l = [];
    let h;
    let c;
    let a;
    let u = 0;
    for (;u < r; ++u) {
        h = o[u];
        c = Nt.for(h, mt);
        a = null !== (n = null === c || void 0 === c ? void 0 : c.viewModel) && void 0 !== n ? n : null;
        if (s(h, c, a)) l.push(i(h, c, a));
    }
    return l;
}

function gt(t) {
    return function(e) {
        return Ct.define(t, e);
    };
}

function wt(t) {
    return function(e) {
        return Ct.define("string" === typeof t ? {
            isTemplateController: true,
            name: t
        } : {
            isTemplateController: true,
            ...t
        }, e);
    };
}

class CustomAttributeDefinition {
    constructor(t, e, s, i, n, o, r, l, h) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
        this.defaultBindingMode = n;
        this.isTemplateController = o;
        this.bindables = r;
        this.noMultiBindings = l;
        this.watches = h;
    }
    get type() {
        return 2;
    }
    static create(t, e) {
        let n;
        let o;
        if ("string" === typeof t) {
            n = t;
            o = {
                name: n
            };
        } else {
            n = t.name;
            o = t;
        }
        return new CustomAttributeDefinition(e, s.firstDefined(kt(e, "name"), n), s.mergeArrays(kt(e, "aliases"), o.aliases, e.aliases), Ct.keyFrom(n), s.firstDefined(kt(e, "defaultBindingMode"), o.defaultBindingMode, e.defaultBindingMode, i.BindingMode.toView), s.firstDefined(kt(e, "isTemplateController"), o.isTemplateController, e.isTemplateController, false), w.from(...w.getAll(e), kt(e, "bindables"), e.bindables, o.bindables), s.firstDefined(kt(e, "noMultiBindings"), o.noMultiBindings, e.noMultiBindings, false), s.mergeArrays(Et.getAnnotation(e), e.watches));
    }
    register(t) {
        const {Type: e, key: n, aliases: o} = this;
        s.Registration.transient(n, e).register(t);
        s.Registration.aliasTo(n, e).register(t);
        i.registerAliases(o, Ct, n, t);
    }
}

const bt = f("custom-attribute");

const yt = t => `${bt}:${t}`;

const kt = (t, e) => r(u(e), t);

const Ct = Object.freeze({
    name: bt,
    keyFrom: yt,
    isType(t) {
        return "function" === typeof t && l(bt, t);
    },
    for(t, e) {
        var s;
        return null !== (s = je(t, yt(e))) && void 0 !== s ? s : void 0;
    },
    define(t, e) {
        const s = CustomAttributeDefinition.create(t, e);
        h(bt, s, s.Type);
        h(bt, s, s);
        d(e, bt);
        return s.Type;
    },
    getDefinition(t) {
        const e = r(bt, t);
        if (void 0 === e) throw new Error(`AUR0759:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        h(u(e), s, t);
    },
    getAnnotation: kt
});

function At(t, e) {
    if (!t) throw new Error("AUR0772");
    return function s(i, n, o) {
        const r = null == n;
        const l = r ? i : i.constructor;
        const h = new WatchDefinition(t, r ? e : o.value);
        if (r) {
            if ("function" !== typeof e && (null == e || !(e in l.prototype))) throw new Error(`AUR0773:${String(e)}@${l.name}}`);
        } else if ("function" !== typeof (null === o || void 0 === o ? void 0 : o.value)) throw new Error(`AUR0774:${String(n)}`);
        Et.add(l, h);
        if (Ct.isType(l)) Ct.getDefinition(l).watches.push(h);
        if (Nt.isType(l)) Nt.getDefinition(l).watches.push(h);
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const Rt = s.emptyArray;

const St = u("watch");

const Et = Object.freeze({
    name: St,
    add(t, e) {
        let s = r(St, t);
        if (null == s) h(St, s = [], t);
        s.push(e);
    },
    getAnnotation(t) {
        var e;
        return null !== (e = r(St, t)) && void 0 !== e ? e : Rt;
    }
});

function Bt(t) {
    return function(e) {
        return Nt.define(t, e);
    };
}

function It(t) {
    if (void 0 === t) return function(t) {
        jt(t, "shadowOptions", {
            mode: "open"
        });
    };
    if ("function" !== typeof t) return function(e) {
        jt(e, "shadowOptions", t);
    };
    jt(t, "shadowOptions", {
        mode: "open"
    });
}

function Tt(t) {
    if (void 0 === t) return function(t) {
        jt(t, "containerless", true);
    };
    jt(t, "containerless", true);
}

const Dt = new WeakMap;

class CustomElementDefinition {
    constructor(t, e, s, i, n, o, r, l, h, c, a, u, f, d, p, x, m, v, g, w) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
        this.cache = n;
        this.template = o;
        this.instructions = r;
        this.dependencies = l;
        this.injectable = h;
        this.needsCompile = c;
        this.surrogates = a;
        this.bindables = u;
        this.childrenObservers = f;
        this.containerless = d;
        this.isStrictBinding = p;
        this.shadowOptions = x;
        this.hasSlots = m;
        this.enhance = v;
        this.watches = g;
        this.processContent = w;
    }
    get type() {
        return 1;
    }
    static create(t, e = null) {
        if (null === e) {
            const i = t;
            if ("string" === typeof i) throw new Error(`AUR0761:${t}`);
            const n = s.fromDefinitionOrDefault("name", i, Vt);
            if ("function" === typeof i.Type) e = i.Type; else e = Nt.generateType(s.pascalCase(n));
            return new CustomElementDefinition(e, n, s.mergeArrays(i.aliases), s.fromDefinitionOrDefault("key", i, (() => Nt.keyFrom(n))), s.fromDefinitionOrDefault("cache", i, $t), s.fromDefinitionOrDefault("template", i, Ot), s.mergeArrays(i.instructions), s.mergeArrays(i.dependencies), s.fromDefinitionOrDefault("injectable", i, Ot), s.fromDefinitionOrDefault("needsCompile", i, qt), s.mergeArrays(i.surrogates), w.from(i.bindables), ut.from(i.childrenObservers), s.fromDefinitionOrDefault("containerless", i, Lt), s.fromDefinitionOrDefault("isStrictBinding", i, Lt), s.fromDefinitionOrDefault("shadowOptions", i, Ot), s.fromDefinitionOrDefault("hasSlots", i, Lt), s.fromDefinitionOrDefault("enhance", i, Lt), s.fromDefinitionOrDefault("watches", i, Ut), s.fromAnnotationOrTypeOrDefault("processContent", e, Ot));
        }
        if ("string" === typeof t) return new CustomElementDefinition(e, t, s.mergeArrays(_t(e, "aliases"), e.aliases), Nt.keyFrom(t), s.fromAnnotationOrTypeOrDefault("cache", e, $t), s.fromAnnotationOrTypeOrDefault("template", e, Ot), s.mergeArrays(_t(e, "instructions"), e.instructions), s.mergeArrays(_t(e, "dependencies"), e.dependencies), s.fromAnnotationOrTypeOrDefault("injectable", e, Ot), s.fromAnnotationOrTypeOrDefault("needsCompile", e, qt), s.mergeArrays(_t(e, "surrogates"), e.surrogates), w.from(...w.getAll(e), _t(e, "bindables"), e.bindables), ut.from(...ut.getAll(e), _t(e, "childrenObservers"), e.childrenObservers), s.fromAnnotationOrTypeOrDefault("containerless", e, Lt), s.fromAnnotationOrTypeOrDefault("isStrictBinding", e, Lt), s.fromAnnotationOrTypeOrDefault("shadowOptions", e, Ot), s.fromAnnotationOrTypeOrDefault("hasSlots", e, Lt), s.fromAnnotationOrTypeOrDefault("enhance", e, Lt), s.mergeArrays(Et.getAnnotation(e), e.watches), s.fromAnnotationOrTypeOrDefault("processContent", e, Ot));
        const i = s.fromDefinitionOrDefault("name", t, Vt);
        return new CustomElementDefinition(e, i, s.mergeArrays(_t(e, "aliases"), t.aliases, e.aliases), Nt.keyFrom(i), s.fromAnnotationOrDefinitionOrTypeOrDefault("cache", t, e, $t), s.fromAnnotationOrDefinitionOrTypeOrDefault("template", t, e, Ot), s.mergeArrays(_t(e, "instructions"), t.instructions, e.instructions), s.mergeArrays(_t(e, "dependencies"), t.dependencies, e.dependencies), s.fromAnnotationOrDefinitionOrTypeOrDefault("injectable", t, e, Ot), s.fromAnnotationOrDefinitionOrTypeOrDefault("needsCompile", t, e, qt), s.mergeArrays(_t(e, "surrogates"), t.surrogates, e.surrogates), w.from(...w.getAll(e), _t(e, "bindables"), e.bindables, t.bindables), ut.from(...ut.getAll(e), _t(e, "childrenObservers"), e.childrenObservers, t.childrenObservers), s.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", t, e, Lt), s.fromAnnotationOrDefinitionOrTypeOrDefault("isStrictBinding", t, e, Lt), s.fromAnnotationOrDefinitionOrTypeOrDefault("shadowOptions", t, e, Ot), s.fromAnnotationOrDefinitionOrTypeOrDefault("hasSlots", t, e, Lt), s.fromAnnotationOrDefinitionOrTypeOrDefault("enhance", t, e, Lt), s.mergeArrays(t.watches, Et.getAnnotation(e), e.watches), s.fromAnnotationOrDefinitionOrTypeOrDefault("processContent", t, e, Ot));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) return t;
        if (Dt.has(t)) return Dt.get(t);
        const e = CustomElementDefinition.create(t);
        Dt.set(t, e);
        h(Mt, e, e.Type);
        return e;
    }
    register(t) {
        const {Type: e, key: n, aliases: o} = this;
        if (!t.has(n, false)) {
            s.Registration.transient(n, e).register(t);
            s.Registration.aliasTo(n, e).register(t);
            i.registerAliases(o, Nt, n, t);
        }
    }
}

const Pt = {
    name: void 0,
    searchParents: false,
    optional: false
};

const $t = () => 0;

const Ot = () => null;

const Lt = () => false;

const qt = () => true;

const Ut = () => s.emptyArray;

const Mt = f("custom-element");

const Ft = t => `${Mt}:${t}`;

const Vt = (() => {
    let t = 0;
    return () => `unnamed-${++t}`;
})();

const jt = (t, e, s) => {
    h(u(e), s, t);
};

const _t = (t, e) => r(u(e), t);

const Nt = Object.freeze({
    name: Mt,
    keyFrom: Ft,
    isType(t) {
        return "function" === typeof t && l(Mt, t);
    },
    for(t, e = Pt) {
        if (void 0 === e.name && true !== e.searchParents) {
            const s = je(t, Mt);
            if (null === s) {
                if (true === e.optional) return null;
                throw new Error("AUR0762");
            }
            return s;
        }
        if (void 0 !== e.name) {
            if (true !== e.searchParents) {
                const s = je(t, Mt);
                if (null === s) throw new Error("AUR0763");
                if (s.is(e.name)) return s;
                return;
            }
            let s = t;
            let i = false;
            while (null !== s) {
                const t = je(s, Mt);
                if (null !== t) {
                    i = true;
                    if (t.is(e.name)) return t;
                }
                s = Ge(s);
            }
            if (i) return;
            throw new Error("AUR0764");
        }
        let s = t;
        while (null !== s) {
            const t = je(s, Mt);
            if (null !== t) return t;
            s = Ge(s);
        }
        throw new Error("AUR0765");
    },
    define(t, e) {
        const s = CustomElementDefinition.create(t, e);
        h(Mt, s, s.Type);
        h(Mt, s, s);
        d(s.Type, Mt);
        return s.Type;
    },
    getDefinition(t) {
        const e = r(Mt, t);
        if (void 0 === e) throw new Error(`AUR0760:${t.name}`);
        return e;
    },
    annotate: jt,
    getAnnotation: _t,
    generateName: Vt,
    createInjectable() {
        const t = function(e, i, n) {
            const o = s.DI.getOrCreateAnnotationParamTypes(e);
            o[n] = t;
            return e;
        };
        t.register = function(e) {
            return {
                resolve(e, s) {
                    if (s.has(t, true)) return s.get(t); else return null;
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
        return function(s, i = e) {
            const n = class {};
            t.value = s;
            Reflect.defineProperty(n, "name", t);
            if (i !== e) Object.assign(n.prototype, i);
            return n;
        };
    }()
});

const Wt = u("processContent");

function Ht(t) {
    return void 0 === t ? function(t, e, s) {
        h(Wt, zt(t, e), t);
    } : function(e) {
        t = zt(e, t);
        const s = r(Mt, e);
        if (void 0 !== s) s.processContent = t; else h(Wt, t, e);
        return e;
    };
}

function zt(t, e) {
    if ("string" === typeof e) e = t[e];
    const s = typeof e;
    if ("function" !== s) throw new Error(`AUR0766:${s}`);
    return e;
}

class ClassAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = 2 | 4;
        this.value = "";
        this.ov = "";
        this.doNotCache = true;
        this.J = {};
        this.tt = 0;
        this.W = false;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this.W = t !== this.ov;
        if (0 === (256 & e)) this.Y();
    }
    Y() {
        if (this.W) {
            this.W = false;
            const t = this.value;
            const e = this.J;
            const s = Gt(t);
            let i = this.tt;
            this.ov = t;
            if (s.length > 0) this.et(s);
            this.tt += 1;
            if (0 === i) return;
            i -= 1;
            for (const t in e) {
                if (!Object.prototype.hasOwnProperty.call(e, t) || e[t] !== i) continue;
                this.obj.classList.remove(t);
            }
        }
    }
    et(t) {
        const e = this.obj;
        const s = t.length;
        let i = 0;
        let n;
        for (;i < s; i++) {
            n = t[i];
            if (0 === n.length) continue;
            this.J[n] = this.tt;
            e.classList.add(n);
        }
    }
}

function Gt(t) {
    if ("string" === typeof t) return Xt(t);
    if ("object" !== typeof t) return s.emptyArray;
    if (t instanceof Array) {
        const e = t.length;
        if (e > 0) {
            const s = [];
            let i = 0;
            for (;e > i; ++i) s.push(...Gt(t[i]));
            return s;
        } else return s.emptyArray;
    }
    const e = [];
    let i;
    for (i in t) if (Boolean(t[i])) if (i.includes(" ")) e.push(...Xt(i)); else e.push(i);
    return e;
}

function Xt(t) {
    const e = t.match(/\S+/g);
    if (null === e) return s.emptyArray;
    return e;
}

function Kt(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        var e;
        const s = Object.assign({}, ...this.modules);
        const i = Ct.define({
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
                this.element.className = Gt(this.value).map((t => s[t] || t)).join(" ");
            }
        }, e.inject = [ Ne ], e));
        t.register(i);
    }
}

function Yt(...t) {
    return new ShadowDOMRegistry(t);
}

const Zt = s.DI.createInterface("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(L))) return t.get(AdoptedStyleSheetsStylesFactory);
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Qt);
        const i = t.get(Zt);
        t.register(s.Registration.instance(Jt, i.createStyles(this.css, e)));
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

AdoptedStyleSheetsStylesFactory.inject = [ L ];

class StyleElementStylesFactory {
    constructor(t) {
        this.p = t;
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

StyleElementStylesFactory.inject = [ L ];

const Jt = s.DI.createInterface("IShadowDOMStyles");

const Qt = s.DI.createInterface("IShadowDOMGlobalStyles", (t => t.instance({
    applyTo: s.noop
})));

class AdoptedStyleSheetsStyles {
    constructor(t, e, s, i = null) {
        this.sharedStyles = i;
        this.styleSheets = e.map((e => {
            let i;
            if (e instanceof t.CSSStyleSheet) i = e; else {
                i = s.get(e);
                if (void 0 === i) {
                    i = new t.CSSStyleSheet;
                    i.replaceSync(e);
                    s.set(e, i);
                }
            }
            return i;
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
    constructor(t, e, s = null) {
        this.p = t;
        this.localStyles = e;
        this.sharedStyles = s;
    }
    applyTo(t) {
        const e = this.localStyles;
        const s = this.p;
        for (let i = e.length - 1; i > -1; --i) {
            const n = s.document.createElement("style");
            n.innerHTML = e[i];
            t.prepend(n);
        }
        if (null !== this.sharedStyles) this.sharedStyles.applyTo(t);
    }
}

const te = {
    shadowDOM(t) {
        return rt.beforeCreate(s.IContainer, (e => {
            if (null != t.sharedStyles) {
                const i = e.get(Zt);
                e.register(s.Registration.instance(Qt, i.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: ee, exit: se} = i.ConnectableSwitcher;

const {wrap: ie, unwrap: ne} = i.ProxyObservable;

class ComputedWatcher {
    constructor(t, e, s, i, n) {
        this.obj = t;
        this.get = s;
        this.cb = i;
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
        const s = this.compute();
        if (!Object.is(s, e)) this.cb.call(t, s, e, t);
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            ee(this);
            return this.value = ne(this.get.call(void 0, this.useProxy ? ie(this.obj) : this.obj, this));
        } finally {
            this.obs.clear();
            this.running = false;
            se(this);
        }
    }
}

class ExpressionWatcher {
    constructor(t, e, s, i, n) {
        this.scope = t;
        this.locator = e;
        this.oL = s;
        this.expression = i;
        this.callback = n;
        this.interceptor = this;
        this.isBound = false;
        this.obj = t.bindingContext;
    }
    handleChange(t) {
        const e = this.expression;
        const s = this.obj;
        const i = this.value;
        const n = 10082 === e.$kind && 1 === this.obs.count;
        if (!n) {
            this.obs.version++;
            t = e.evaluate(0, this.scope, this.locator, this);
            this.obs.clear();
        }
        if (!Object.is(t, i)) {
            this.value = t;
            this.callback.call(s, t, i, s);
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

i.connectable(ComputedWatcher);

i.connectable(ExpressionWatcher);

const oe = s.DI.createInterface("ILifecycleHooks");

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
        const s = new Set;
        let i = e.prototype;
        while (i !== Object.prototype) {
            for (const t of Object.getOwnPropertyNames(i)) if ("constructor" !== t) s.add(t);
            i = Object.getPrototypeOf(i);
        }
        return new LifecycleHooksDefinition(e, s);
    }
    register(t) {
        s.Registration.singleton(oe, this.Type).register(t);
    }
}

const re = new WeakMap;

const le = u("lifecycle-hooks");

const he = Object.freeze({
    name: le,
    define(t, e) {
        const s = LifecycleHooksDefinition.create(t, e);
        h(le, s, e);
        d(e, le);
        return s.Type;
    },
    resolve(t) {
        let e = re.get(t);
        if (void 0 === e) {
            e = new LifecycleHooksLookupImpl;
            const s = t.root;
            const i = s.id === t.id ? t.getAll(oe) : t.has(oe, false) ? [ ...s.getAll(oe), ...t.getAll(oe) ] : s.getAll(oe);
            let n;
            let o;
            let l;
            let h;
            let c;
            for (n of i) {
                o = r(le, n.constructor);
                l = new LifecycleHooksEntry(o, n);
                for (h of o.propertyNames) {
                    c = e[h];
                    if (void 0 === c) e[h] = [ l ]; else c.push(l);
                }
            }
        }
        return e;
    }
});

class LifecycleHooksLookupImpl {}

function ce() {
    return function t(e) {
        return he.define({}, e);
    };
}

const ae = s.DI.createInterface("IViewFactory");

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
        let s;
        if (null != e && e.length > 0) {
            s = e.pop();
            return s;
        }
        s = Controller.$view(this, t);
        return s;
    }
}

ViewFactory.maxCacheSize = 65535;

const ue = new WeakSet;

function fe(t) {
    return !ue.has(t);
}

function de(t) {
    ue.add(t);
    return CustomElementDefinition.create(t);
}

const pe = f("views");

const xe = Object.freeze({
    name: pe,
    has(t) {
        return "function" === typeof t && (l(pe, t) || "$views" in t);
    },
    get(t) {
        if ("function" === typeof t && "$views" in t) {
            const e = t.$views;
            const s = e.filter(fe).map(de);
            for (const e of s) xe.add(t, e);
        }
        let e = r(pe, t);
        if (void 0 === e) h(pe, e = [], t);
        return e;
    },
    add(t, e) {
        const s = CustomElementDefinition.create(e);
        let i = r(pe, t);
        if (void 0 === i) h(pe, i = [ s ], t); else i.push(s);
        return i;
    }
});

function me(t) {
    return function(e) {
        xe.add(e, t);
    };
}

const ve = s.DI.createInterface("IViewLocator", (t => t.singleton(ViewLocator)));

class ViewLocator {
    constructor() {
        this.st = new WeakMap;
        this.it = new Map;
    }
    getViewComponentForObject(t, e) {
        if (t) {
            const s = xe.has(t.constructor) ? xe.get(t.constructor) : [];
            const i = "function" === typeof e ? e(t, s) : this.nt(s, e);
            return this.ot(t, s, i);
        }
        return null;
    }
    ot(t, e, s) {
        let i = this.st.get(t);
        let n;
        if (void 0 === i) {
            i = {};
            this.st.set(t, i);
        } else n = i[s];
        if (void 0 === n) {
            const o = this.rt(t, e, s);
            n = Nt.define(Nt.getDefinition(o), class extends o {
                constructor() {
                    super(t);
                }
            });
            i[s] = n;
        }
        return n;
    }
    rt(t, e, s) {
        let n = this.it.get(t.constructor);
        let o;
        if (void 0 === n) {
            n = {};
            this.it.set(t.constructor, n);
        } else o = n[s];
        if (void 0 === o) {
            o = Nt.define(this.lt(e, s), class {
                constructor(t) {
                    this.viewModel = t;
                }
                define(t, e, s) {
                    const n = this.viewModel;
                    t.scope = i.Scope.fromParent(t.scope, n);
                    if (void 0 !== n.define) return n.define(t, e, s);
                }
            });
            const r = o.prototype;
            if ("hydrating" in t) r.hydrating = function t(e) {
                this.viewModel.hydrating(e);
            };
            if ("hydrated" in t) r.hydrated = function t(e) {
                this.viewModel.hydrated(e);
            };
            if ("created" in t) r.created = function t(e) {
                this.viewModel.created(e);
            };
            if ("binding" in t) r.binding = function t(e, s, i) {
                return this.viewModel.binding(e, s, i);
            };
            if ("bound" in t) r.bound = function t(e, s, i) {
                return this.viewModel.bound(e, s, i);
            };
            if ("attaching" in t) r.attaching = function t(e, s, i) {
                return this.viewModel.attaching(e, s, i);
            };
            if ("attached" in t) r.attached = function t(e, s) {
                return this.viewModel.attached(e, s);
            };
            if ("detaching" in t) r.detaching = function t(e, s, i) {
                return this.viewModel.detaching(e, s, i);
            };
            if ("unbinding" in t) r.unbinding = function t(e, s, i) {
                return this.viewModel.unbinding(e, s, i);
            };
            if ("dispose" in t) r.dispose = function t() {
                this.viewModel.dispose();
            };
            n[s] = o;
        }
        return o;
    }
    nt(t, e) {
        if (e) return e;
        if (1 === t.length) return t[0].name;
        return "default-view";
    }
    lt(t, e) {
        const s = t.find((t => t.name === e));
        if (void 0 === s) throw new Error(`Could not find view: ${e}`);
        return s;
    }
}

const ge = s.DI.createInterface("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    constructor(t) {
        this.ht = new WeakMap;
        this.ct = new WeakMap;
        this.at = (this.ut = t.root).get(L);
        this.ft = new FragmentNodeSequence(this.at, this.at.document.createDocumentFragment());
    }
    get renderers() {
        return null == this.rs ? this.rs = this.ut.getAll(hs, false).reduce(((t, e) => {
            t[e.instructionType] = e;
            return t;
        }), D()) : this.rs;
    }
    compile(t, e, s) {
        if (false !== t.needsCompile) {
            const i = this.ht;
            const n = e.get(ls);
            let o = i.get(t);
            if (null == o) i.set(t, o = n.compile(t, e, s)); else e.register(...o.dependencies);
            return o;
        }
        return t;
    }
    getViewFactory(t, e) {
        return new ViewFactory(e, CustomElementDefinition.getOrCreate(t));
    }
    createNodes(t) {
        if (true === t.enhance) return new FragmentNodeSequence(this.at, t.template);
        let e;
        const s = this.ct;
        if (s.has(t)) e = s.get(t); else {
            const i = this.at;
            const n = i.document;
            const o = t.template;
            let r;
            if (null === o) e = null; else if (o instanceof i.Node) if ("TEMPLATE" === o.nodeName) e = n.adoptNode(o.content); else (e = n.adoptNode(n.createDocumentFragment())).appendChild(o.cloneNode(true)); else {
                r = n.createElement("template");
                if ("string" === typeof o) r.innerHTML = o;
                n.adoptNode(e = r.content);
            }
            s.set(t, e);
        }
        return null == e ? this.ft : new FragmentNodeSequence(this.at, e.cloneNode(true));
    }
    render(t, e, s, i) {
        const n = s.instructions;
        const o = this.renderers;
        const r = e.length;
        if (e.length !== n.length) throw new Error(`AUR0757:${r}<>${n.length}`);
        let l = 0;
        let h = 0;
        let c = 0;
        let a;
        let u;
        let f;
        if (r > 0) while (r > l) {
            a = n[l];
            f = e[l];
            h = 0;
            c = a.length;
            while (c > h) {
                u = a[h];
                o[u.type].render(t, f, u);
                ++h;
            }
            ++l;
        }
        if (void 0 !== i && null !== i) {
            a = s.surrogates;
            if ((c = a.length) > 0) {
                h = 0;
                while (c > h) {
                    u = a[h];
                    o[u.type].render(t, i, u);
                    ++h;
                }
            }
        }
    }
}

Rendering.inject = [ s.IContainer ];

var we;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["host"] = 1] = "host";
    t[t["shadowRoot"] = 2] = "shadowRoot";
    t[t["location"] = 3] = "location";
})(we || (we = {}));

const be = {
    optional: true
};

const ye = new WeakMap;

class Controller {
    constructor(t, e, i, n, o, r) {
        this.container = t;
        this.vmKind = e;
        this.definition = i;
        this.viewFactory = n;
        this.viewModel = o;
        this.host = r;
        this.id = s.nextId("au$component");
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
        this.dt = false;
        this.xt = s.emptyArray;
        this.flags = 0;
        this.$initiator = null;
        this.$flags = 0;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.vt = 0;
        this.gt = 0;
        this.wt = 0;
        this.bt = t.root.get(ge);
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
        return ye.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (void 0 === e) throw new Error(`AUR0500:${t}`);
        return e;
    }
    static $el(t, e, i, n, o = void 0) {
        if (ye.has(e)) return ye.get(e);
        o = null !== o && void 0 !== o ? o : Nt.getDefinition(e.constructor);
        const r = new Controller(t, 0, o, null, e, i);
        const l = t.get(s.optional(Oe));
        if (o.dependencies.length > 0) t.register(...o.dependencies);
        t.registerResolver(Oe, new s.InstanceProvider("IHydrationContext", new HydrationContext(r, n, l)));
        ye.set(e, r);
        if (null == n || false !== n.hydrate) r.yt(n, l);
        return r;
    }
    static $attr(t, e, s, i) {
        if (ye.has(e)) return ye.get(e);
        i = null !== i && void 0 !== i ? i : Ct.getDefinition(e.constructor);
        const n = new Controller(t, 1, i, null, e, s);
        ye.set(e, n);
        n.kt();
        return n;
    }
    static $view(t, e = void 0) {
        const s = new Controller(t.container, 2, null, t, null, null);
        s.parent = null !== e && void 0 !== e ? e : null;
        s.Ct();
        return s;
    }
    yt(t, e) {
        const n = this.container;
        const o = this.flags;
        const r = this.viewModel;
        let l = this.definition;
        this.scope = i.Scope.create(r, null, true);
        if (l.watches.length > 0) Ee(this, n, l, r);
        Ce(this, l, o, r);
        this.xt = Ae(this, l, r);
        if (this.hooks.hasDefine) {
            const t = r.define(this, e, l);
            if (void 0 !== t && t !== l) l = CustomElementDefinition.getOrCreate(t);
        }
        this.lifecycleHooks = he.resolve(n);
        l.register(n);
        if (null !== l.injectable) n.registerResolver(l.injectable, new s.InstanceProvider("definition.injectable", r));
        if (null == t || false !== t.hydrate) {
            this.At(t);
            this.Rt();
        }
    }
    At(t) {
        if (this.hooks.hasHydrating) this.viewModel.hydrating(this);
        const e = this.St = this.bt.compile(this.definition, this.container, t);
        const {shadowOptions: s, isStrictBinding: i, hasSlots: n, containerless: o} = e;
        this.isStrictBinding = i;
        if (null !== (this.hostController = Nt.for(this.host, be))) this.host = this.container.root.get(L).document.createElement(this.definition.name);
        _e(this.host, Nt.name, this);
        _e(this.host, this.definition.key, this);
        if (null !== s || n) {
            if (o) throw new Error("AUR0501");
            _e(this.shadowRoot = this.host.attachShadow(null !== s && void 0 !== s ? s : Te), Nt.name, this);
            _e(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2;
        } else if (o) {
            _e(this.location = Ke(this.host), Nt.name, this);
            _e(this.location, this.definition.key, this);
            this.mountTarget = 3;
        } else this.mountTarget = 1;
        this.viewModel.$controller = this;
        this.nodes = this.bt.createNodes(e);
        if (this.hooks.hasHydrated) this.viewModel.hydrated(this);
    }
    Rt() {
        this.bt.render(this, this.nodes.findTargets(), this.St, this.host);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    kt() {
        const t = this.definition;
        const e = this.viewModel;
        if (t.watches.length > 0) Ee(this, this.container, t, e);
        Ce(this, t, this.flags, e);
        e.$controller = this;
        this.lifecycleHooks = he.resolve(this.container);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    Ct() {
        this.St = this.bt.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this.St.isStrictBinding;
        this.bt.render(this, (this.nodes = this.bt.createNodes(this.St)).findTargets(), this.St, void 0);
    }
    activate(t, e, s, i) {
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
            throw new Error(`AUR0503:${this.name} ${Pe(this.state)}`);
        }
        this.parent = e;
        s |= 2;
        switch (this.vmKind) {
          case 0:
            this.scope.parentScope = null !== i && void 0 !== i ? i : null;
            break;

          case 1:
            this.scope = null !== i && void 0 !== i ? i : null;
            break;

          case 2:
            if (void 0 === i || null === i) throw new Error("AUR0504");
            if (!this.hasLockedScope) this.scope = i;
            break;
        }
        if (this.isStrictBinding) s |= 1;
        this.$initiator = t;
        this.$flags = s;
        this.Et();
        if (this.hooks.hasBinding) {
            const t = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.Bt();
                t.then((() => {
                    this.bind();
                })).catch((t => {
                    this.It(t);
                }));
                return this.$promise;
            }
        }
        this.bind();
        return this.$promise;
    }
    bind() {
        let t = 0;
        let e = this.xt.length;
        let s;
        if (e > 0) while (e > t) {
            this.xt[t].start();
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
            s = this.viewModel.bound(this.$initiator, this.parent, this.$flags);
            if (s instanceof Promise) {
                this.Bt();
                s.then((() => {
                    this.isBound = true;
                    this.Tt();
                })).catch((t => {
                    this.It(t);
                }));
                return;
            }
        }
        this.isBound = true;
        this.Tt();
    }
    Dt(...t) {
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
    Tt() {
        if (null !== this.hostController) switch (this.mountTarget) {
          case 1:
          case 2:
            this.hostController.Dt(this.host);
            break;

          case 3:
            this.hostController.Dt(this.location.$start, this.location);
            break;
        }
        switch (this.mountTarget) {
          case 1:
            this.nodes.appendTo(this.host, null != this.definition && this.definition.enhance);
            break;

          case 2:
            {
                const t = this.container;
                const e = t.has(Jt, false) ? t.get(Jt) : t.get(Qt);
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
                this.Bt();
                this.Et();
                t.then((() => {
                    this.Pt();
                })).catch((t => {
                    this.It(t);
                }));
            }
        }
        if (null !== this.children) {
            let t = 0;
            for (;t < this.children.length; ++t) void this.children[t].activate(this.$initiator, this, this.$flags, this.scope);
        }
        this.Pt();
    }
    deactivate(t, e, s) {
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
            throw new Error(`AUR0505:${this.name} ${Pe(this.state)}`);
        }
        this.$initiator = t;
        this.$flags = s;
        if (t === this) this.$t();
        let i = 0;
        if (this.xt.length) for (;i < this.xt.length; ++i) this.xt[i].stop();
        if (null !== this.children) for (i = 0; i < this.children.length; ++i) void this.children[i].deactivate(t, this, s);
        if (this.hooks.hasDetaching) {
            const e = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (e instanceof Promise) {
                this.Bt();
                t.$t();
                e.then((() => {
                    t.Ot();
                })).catch((e => {
                    t.It(e);
                }));
            }
        }
        if (null === t.head) t.head = this; else t.tail.next = this;
        t.tail = this;
        if (t !== this) return;
        this.Ot();
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
        this.Lt();
    }
    Bt() {
        if (void 0 === this.$promise) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) this.parent.Bt();
        }
    }
    Lt() {
        if (void 0 !== this.$promise) {
            qe = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            qe();
            qe = void 0;
        }
    }
    It(t) {
        if (void 0 !== this.$promise) {
            Ue = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            Ue(t);
            Ue = void 0;
        }
        if (this.$initiator !== this) this.parent.It(t);
    }
    Et() {
        ++this.vt;
        if (this.$initiator !== this) this.parent.Et();
    }
    Pt() {
        if (0 === --this.vt) {
            if (this.hooks.hasAttached) {
                Me = this.viewModel.attached(this.$initiator, this.$flags);
                if (Me instanceof Promise) {
                    this.Bt();
                    Me.then((() => {
                        this.state = 2;
                        this.Lt();
                        if (this.$initiator !== this) this.parent.Pt();
                    })).catch((t => {
                        this.It(t);
                    }));
                    Me = void 0;
                    return;
                }
                Me = void 0;
            }
            this.state = 2;
            this.Lt();
        }
        if (this.$initiator !== this) this.parent.Pt();
    }
    $t() {
        ++this.gt;
    }
    Ot() {
        if (0 === --this.gt) {
            this.qt();
            this.removeNodes();
            let t = this.$initiator.head;
            while (null !== t) {
                if (t !== this) {
                    if (t.debug) t.logger.trace(`detach()`);
                    t.removeNodes();
                }
                if (t.hooks.hasUnbinding) {
                    if (t.debug) t.logger.trace("unbinding()");
                    Me = t.viewModel.unbinding(t.$initiator, t.parent, t.$flags);
                    if (Me instanceof Promise) {
                        this.Bt();
                        this.qt();
                        Me.then((() => {
                            this.Ut();
                        })).catch((t => {
                            this.It(t);
                        }));
                    }
                    Me = void 0;
                }
                t = t.next;
            }
            this.Ut();
        }
    }
    qt() {
        ++this.wt;
    }
    Ut() {
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
            return Ct.getDefinition(this.viewModel.constructor).name === t;

          case 0:
            return Nt.getDefinition(this.viewModel.constructor).name === t;

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
            _e(t, Nt.name, this);
            _e(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = 1;
        return this;
    }
    setShadowRoot(t) {
        if (0 === this.vmKind) {
            _e(t, Nt.name, this);
            _e(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = 2;
        return this;
    }
    setLocation(t) {
        if (0 === this.vmKind) {
            _e(t, Nt.name, this);
            _e(t, this.definition.key, this);
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
            this.children.forEach(Le);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (null !== this.viewModel) {
            ye.delete(this.viewModel);
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
            for (let s = 0, i = e.length; s < i; ++s) if (true === e[s].accept(t)) return true;
        }
    }
}

function ke(t) {
    let e = t.$observers;
    if (void 0 === e) Reflect.defineProperty(t, "$observers", {
        enumerable: false,
        value: e = {}
    });
    return e;
}

function Ce(t, e, s, i) {
    const n = e.bindables;
    const o = Object.getOwnPropertyNames(n);
    const r = o.length;
    if (r > 0) {
        let e;
        let s;
        let l = 0;
        const h = ke(i);
        for (;l < r; ++l) {
            e = o[l];
            if (void 0 === h[e]) {
                s = n[e];
                h[e] = new BindableObserver(i, e, s.callback, s.set, t);
            }
        }
    }
}

function Ae(t, e, i) {
    const n = e.childrenObservers;
    const o = Object.getOwnPropertyNames(n);
    const r = o.length;
    if (r > 0) {
        const e = ke(i);
        const s = [];
        let l;
        let h = 0;
        let c;
        for (;h < r; ++h) {
            l = o[h];
            if (void 0 == e[l]) {
                c = n[l];
                s[s.length] = e[l] = new ChildrenObserver(t, i, l, c.callback, c.query, c.filter, c.map, c.options);
            }
        }
        return s;
    }
    return s.emptyArray;
}

const Re = new Map;

const Se = t => {
    let e = Re.get(t);
    if (null == e) {
        e = new i.AccessScopeExpression(t, 0);
        Re.set(t, e);
    }
    return e;
};

function Ee(t, e, s, n) {
    const o = e.get(i.IObserverLocator);
    const r = e.get(i.IExpressionParser);
    const l = s.watches;
    const h = 0 === t.vmKind ? t.scope : i.Scope.create(n, null, true);
    const c = l.length;
    let a;
    let u;
    let f;
    let d = 0;
    for (;c > d; ++d) {
        ({expression: a, callback: u} = l[d]);
        u = "function" === typeof u ? u : Reflect.get(n, u);
        if ("function" !== typeof u) throw new Error(`AUR0506:${String(u)}`);
        if ("function" === typeof a) t.addBinding(new ComputedWatcher(n, o, a, u, true)); else {
            f = "string" === typeof a ? r.parse(a, 53) : Se(a);
            t.addBinding(new ExpressionWatcher(h, e, o, f, u));
        }
    }
}

function Be(t) {
    return t instanceof Controller && 0 === t.vmKind;
}

function Ie(t) {
    return s.isObject(t) && Nt.isType(t.constructor);
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

const Te = {
    mode: "open"
};

exports.ViewModelKind = void 0;

(function(t) {
    t[t["customElement"] = 0] = "customElement";
    t[t["customAttribute"] = 1] = "customAttribute";
    t[t["synthetic"] = 2] = "synthetic";
})(exports.ViewModelKind || (exports.ViewModelKind = {}));

var De;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["activating"] = 1] = "activating";
    t[t["activated"] = 2] = "activated";
    t[t["deactivating"] = 4] = "deactivating";
    t[t["deactivated"] = 8] = "deactivated";
    t[t["released"] = 16] = "released";
    t[t["disposed"] = 32] = "disposed";
})(De || (De = {}));

function Pe(t) {
    const e = [];
    if (1 === (1 & t)) e.push("activating");
    if (2 === (2 & t)) e.push("activated");
    if (4 === (4 & t)) e.push("deactivating");
    if (8 === (8 & t)) e.push("deactivated");
    if (16 === (16 & t)) e.push("released");
    if (32 === (32 & t)) e.push("disposed");
    return 0 === e.length ? "none" : e.join("|");
}

const $e = s.DI.createInterface("IController");

const Oe = s.DI.createInterface("IHydrationContext");

class HydrationContext {
    constructor(t, e, s) {
        this.instruction = e;
        this.parent = s;
        this.controller = t;
    }
}

function Le(t) {
    t.dispose();
}

let qe;

let Ue;

let Me;

const Fe = s.DI.createInterface("IAppRoot");

const Ve = s.DI.createInterface("IWorkTracker", (t => t.singleton(WorkTracker)));

class WorkTracker {
    constructor(t) {
        this.Mt = 0;
        this.Ft = null;
        this.Lt = null;
        this.Vt = t.scopeTo("WorkTracker");
    }
    start() {
        this.Vt.trace(`start(stack:${this.Mt})`);
        ++this.Mt;
    }
    finish() {
        this.Vt.trace(`finish(stack:${this.Mt})`);
        if (0 === --this.Mt) {
            const t = this.Lt;
            if (null !== t) {
                this.Lt = this.Ft = null;
                t();
            }
        }
    }
    wait() {
        this.Vt.trace(`wait(stack:${this.Mt})`);
        if (null === this.Ft) {
            if (0 === this.Mt) return Promise.resolve();
            this.Ft = new Promise((t => {
                this.Lt = t;
            }));
        }
        return this.Ft;
    }
}

WorkTracker.inject = [ s.ILogger ];

class AppRoot {
    constructor(t, e, i, n) {
        this.config = t;
        this.platform = e;
        this.container = i;
        this.controller = void 0;
        this.jt = void 0;
        this.host = t.host;
        this.work = i.get(Ve);
        n.prepare(this);
        i.registerResolver(e.HTMLElement, i.registerResolver(e.Element, i.registerResolver(Ne, new s.InstanceProvider("ElementResolver", t.host))));
        this.jt = s.onResolve(this._t("beforeCreate"), (() => {
            const e = t.component;
            const n = i.createChild();
            let o;
            if (Nt.isType(e)) o = this.container.get(e); else o = t.component;
            const r = {
                hydrate: false,
                projections: null
            };
            const l = this.controller = Controller.$el(n, o, this.host, r);
            l.yt(r, null);
            return s.onResolve(this._t("hydrating"), (() => {
                l.At(null);
                return s.onResolve(this._t("hydrated"), (() => {
                    l.Rt();
                    this.jt = void 0;
                }));
            }));
        }));
    }
    activate() {
        return s.onResolve(this.jt, (() => s.onResolve(this._t("beforeActivate"), (() => s.onResolve(this.controller.activate(this.controller, null, 2, void 0), (() => this._t("afterActivate")))))));
    }
    deactivate() {
        return s.onResolve(this._t("beforeDeactivate"), (() => s.onResolve(this.controller.deactivate(this.controller, null, 0), (() => this._t("afterDeactivate")))));
    }
    _t(t) {
        return s.resolveAll(...this.container.getAll(ot).reduce(((e, s) => {
            if (s.slot === t) e.push(s.run());
            return e;
        }), []));
    }
    dispose() {
        var t;
        null === (t = this.controller) || void 0 === t ? void 0 : t.dispose();
    }
}

class Refs {}

function je(t, e) {
    var s, i;
    return null !== (i = null === (s = t.$au) || void 0 === s ? void 0 : s[e]) && void 0 !== i ? i : null;
}

function _e(t, e, s) {
    var i;
    var n;
    (null !== (i = (n = t).$au) && void 0 !== i ? i : n.$au = new Refs)[e] = s;
}

const Ne = s.DI.createInterface("INode");

const We = s.DI.createInterface("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(Fe, true)) return t.get(Fe).host;
    return t.get(L).document;
}))));

const He = s.DI.createInterface("IRenderLocation");

exports.NodeType = void 0;

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
})(exports.NodeType || (exports.NodeType = {}));

const ze = new WeakMap;

function Ge(t) {
    if (ze.has(t)) return ze.get(t);
    let e = 0;
    let s = t.nextSibling;
    while (null !== s) {
        if (8 === s.nodeType) switch (s.textContent) {
          case "au-start":
            ++e;
            break;

          case "au-end":
            if (0 === e--) return s;
        }
        s = s.nextSibling;
    }
    if (null === t.parentNode && 11 === t.nodeType) {
        const e = Nt.for(t);
        if (void 0 === e) return null;
        if (2 === e.mountTarget) return Ge(e.host);
    }
    return t.parentNode;
}

function Xe(t, e) {
    if (void 0 !== t.platform && !(t instanceof t.platform.Node)) {
        const s = t.childNodes;
        for (let t = 0, i = s.length; t < i; ++t) ze.set(s[t], e);
    } else ze.set(t, e);
}

function Ke(t) {
    if (Ye(t)) return t;
    const e = t.ownerDocument.createComment("au-end");
    const s = t.ownerDocument.createComment("au-start");
    if (null !== t.parentNode) {
        t.parentNode.replaceChild(e, t);
        e.parentNode.insertBefore(s, e);
    }
    e.$start = s;
    return e;
}

function Ye(t) {
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
        const s = e.querySelectorAll(".au");
        let i = 0;
        let n = s.length;
        let o;
        let r = this.targets = Array(n);
        while (n > i) {
            o = s[i];
            if ("AU-M" === o.nodeName) r[i] = Ke(o); else r[i] = o;
            ++i;
        }
        const l = e.childNodes;
        const h = this.childNodes = Array(n = l.length);
        i = 0;
        while (n > i) {
            h[i] = l[i];
            ++i;
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
                let s = this.firstChild;
                let i;
                const n = this.lastChild;
                while (null != s) {
                    i = s.nextSibling;
                    e.insertBefore(s, t);
                    if (s === n) break;
                    s = i;
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
            let s;
            const i = this.lastChild;
            while (null != e) {
                s = e.nextSibling;
                t.appendChild(e);
                if (e === i) break;
                e = s;
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
            let s;
            let i = this.firstChild;
            while (null !== i) {
                s = i.nextSibling;
                t.appendChild(i);
                if (i === e) break;
                i = s;
            }
        }
    }
    addToLinked() {
        const t = this.refNode;
        const e = t.parentNode;
        if (this.isMounted) {
            let s = this.firstChild;
            let i;
            const n = this.lastChild;
            while (null != s) {
                i = s.nextSibling;
                e.insertBefore(s, t);
                if (s === n) break;
                s = i;
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
        if (Ye(t)) this.refNode = t; else {
            this.next = t;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (void 0 !== this.next) this.refNode = this.next.firstChild; else this.refNode = void 0;
    }
}

const Ze = s.DI.createInterface("IWindow", (t => t.callback((t => t.get(L).window))));

const Je = s.DI.createInterface("ILocation", (t => t.callback((t => t.get(Ze).location))));

const Qe = s.DI.createInterface("IHistory", (t => t.callback((t => t.get(Ze).history))));

const ts = {
    [i.DelegationStrategy.capturing]: {
        capture: true
    },
    [i.DelegationStrategy.bubbling]: {
        capture: false
    }
};

class Listener {
    constructor(t, e, s, i, n, o, r, l) {
        this.platform = t;
        this.targetEvent = e;
        this.delegationStrategy = s;
        this.sourceExpression = i;
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
        const s = this.sourceExpression.evaluate(8, this.$scope, this.locator, null);
        Reflect.deleteProperty(e, "$event");
        if (true !== s && this.preventDefault) t.preventDefault();
        return s;
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
        const s = this.sourceExpression;
        if (s.hasBind) s.bind(t, e, this.interceptor);
        if (this.delegationStrategy === i.DelegationStrategy.none) this.target.addEventListener(this.targetEvent, this); else this.handler = this.eventDelegator.addEventListener(this.locator.get(We), this.target, this.targetEvent, this, ts[this.delegationStrategy]);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        const e = this.sourceExpression;
        if (e.hasUnbind) e.unbind(t, this.$scope, this.interceptor);
        this.$scope = null;
        if (this.delegationStrategy === i.DelegationStrategy.none) this.target.removeEventListener(this.targetEvent, this); else {
            this.handler.dispose();
            this.handler = null;
        }
        this.isBound = false;
    }
    observe(t, e) {
        return;
    }
    handleChange(t, e, s) {
        return;
    }
}

const es = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, s = es) {
        this.Nt = t;
        this.Wt = e;
        this.Ht = s;
        this.zt = 0;
        this.Gt = new Map;
        this.Xt = new Map;
    }
    Kt() {
        if (1 === ++this.zt) this.Nt.addEventListener(this.Wt, this, this.Ht);
    }
    Yt() {
        if (0 === --this.zt) this.Nt.removeEventListener(this.Wt, this, this.Ht);
    }
    dispose() {
        if (this.zt > 0) {
            this.zt = 0;
            this.Nt.removeEventListener(this.Wt, this, this.Ht);
        }
        this.Gt.clear();
        this.Xt.clear();
    }
    Zt(t) {
        const e = true === this.Ht.capture ? this.Gt : this.Xt;
        let s = e.get(t);
        if (void 0 === s) e.set(t, s = Object.create(null));
        return s;
    }
    handleEvent(t) {
        const e = true === this.Ht.capture ? this.Gt : this.Xt;
        const s = t.composedPath();
        if (true === this.Ht.capture) s.reverse();
        for (const i of s) {
            const s = e.get(i);
            if (void 0 === s) continue;
            const n = s[this.Wt];
            if (void 0 === n) continue;
            if ("function" === typeof n) n(t); else n.handleEvent(t);
            if (true === t.cancelBubble) return;
        }
    }
}

class DelegateSubscription {
    constructor(t, e, s, i) {
        this.Jt = t;
        this.Qt = e;
        this.Wt = s;
        t.Kt();
        e[s] = i;
    }
    dispose() {
        this.Jt.Yt();
        this.Qt[this.Wt] = void 0;
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
        let s;
        for (s of this.config.events) t.addEventListener(s, e);
    }
    dispose() {
        const {target: t, handler: e} = this;
        let s;
        if (null !== t && null !== e) for (s of this.config.events) t.removeEventListener(s, e);
        this.target = this.handler = null;
    }
}

const ss = s.DI.createInterface("IEventDelegator", (t => t.singleton(EventDelegator)));

class EventDelegator {
    constructor() {
        this.te = Object.create(null);
    }
    addEventListener(t, e, s, i, n) {
        var o;
        var r;
        const l = null !== (o = (r = this.te)[s]) && void 0 !== o ? o : r[s] = new Map;
        let h = l.get(t);
        if (void 0 === h) l.set(t, h = new ListenerTracker(t, s, n));
        return new DelegateSubscription(h, h.Zt(e), s, i);
    }
    dispose() {
        for (const t in this.te) {
            const e = this.te[t];
            for (const t of e.values()) t.dispose();
            e.clear();
        }
    }
}

const is = s.DI.createInterface("IProjections");

const ns = s.DI.createInterface("IAuSlotsInfo");

class AuSlotsInfo {
    constructor(t) {
        this.projectedSlots = t;
    }
}

exports.InstructionType = void 0;

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
})(exports.InstructionType || (exports.InstructionType = {}));

const os = s.DI.createInterface("Instruction");

function rs(t) {
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
    constructor(t, e, s) {
        this.from = t;
        this.to = e;
        this.mode = s;
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
    constructor(t, e, s, i, n) {
        this.res = t;
        this.alias = e;
        this.props = s;
        this.projections = i;
        this.containerless = n;
        this.auSlot = null;
    }
    get type() {
        return "ra";
    }
}

class HydrateAttributeInstruction {
    constructor(t, e, s) {
        this.res = t;
        this.alias = e;
        this.props = s;
    }
    get type() {
        return "rb";
    }
}

class HydrateTemplateController {
    constructor(t, e, s, i) {
        this.def = t;
        this.res = e;
        this.alias = s;
        this.props = i;
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
    constructor(t, e, s, i) {
        this.from = t;
        this.to = e;
        this.preventDefault = s;
        this.strategy = i;
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
    constructor(t, e, s) {
        this.attr = t;
        this.from = e;
        this.to = s;
    }
    get type() {
        return "hc";
    }
}

const ls = s.DI.createInterface("ITemplateCompiler");

const hs = s.DI.createInterface("IRenderer");

function cs(t) {
    return function e(i) {
        const n = function(...e) {
            const s = new i(...e);
            s.instructionType = t;
            return s;
        };
        n.register = function t(e) {
            s.Registration.singleton(hs, n).register(e);
        };
        const o = s.Metadata.getOwnKeys(i);
        for (const t of o) h(t, r(t, i), n);
        const l = Object.getOwnPropertyDescriptors(i);
        Object.keys(l).filter((t => "prototype" !== t)).forEach((t => {
            Reflect.defineProperty(n, t, l[t]);
        }));
        return n;
    };
}

function as(t, e, s) {
    if ("string" === typeof e) return t.parse(e, s);
    return e;
}

function us(t) {
    if (null != t.viewModel) return t.viewModel;
    return t;
}

function fs(t, e) {
    if ("element" === e) return t;
    switch (e) {
      case "controller":
        return Nt.for(t);

      case "view":
        throw new Error("AUR0750");

      case "view-model":
        return Nt.for(t).viewModel;

      default:
        {
            const s = Ct.for(t, e);
            if (void 0 !== s) return s.viewModel;
            const i = Nt.for(t, {
                name: e
            });
            if (void 0 === i) throw new Error(`AUR0751:${e}`);
            return i.viewModel;
        }
    }
}

let ds = class SetPropertyRenderer {
    render(t, e, s) {
        const i = us(e);
        if (void 0 !== i.$observers && void 0 !== i.$observers[s.to]) i.$observers[s.to].setValue(s.value, 2); else i[s.to] = s.value;
    }
};

ds = n([ cs("re") ], ds);

let ps = class CustomElementRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ ge, L ];
    }
    render(t, e, i) {
        let n;
        let o;
        let r;
        let l;
        const h = i.res;
        const c = i.projections;
        const a = t.container;
        const u = Ms(this.p, t, e, i, e, null == c ? void 0 : new AuSlotsInfo(Object.keys(c)));
        switch (typeof h) {
          case "string":
            n = a.find(Nt, h);
            if (null == n) throw new Error(`AUR0752:${h}@${t["name"]}`);
            break;

          default:
            n = h;
        }
        o = n.Type;
        r = u.invoke(o);
        u.registerResolver(o, new s.InstanceProvider(n.key, r));
        l = Controller.$el(u, r, e, i, n);
        _e(e, n.key, l);
        const f = this.r.renderers;
        const d = i.props;
        const p = d.length;
        let x = 0;
        let m;
        while (p > x) {
            m = d[x];
            f[m.type].render(t, l, m);
            ++x;
        }
        t.addChild(l);
    }
};

ps = n([ cs("ra") ], ps);

let xs = class CustomAttributeRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ ge, L ];
    }
    render(t, e, s) {
        let i = t.container;
        let n;
        switch (typeof s.res) {
          case "string":
            n = i.find(Ct, s.res);
            if (null == n) throw new Error(`AUR0753:${s.res}@${t["name"]}`);
            break;

          default:
            n = s.res;
        }
        const o = Fs(this.p, n, t, e, s, void 0, void 0);
        const r = Controller.$attr(t.container, o, e, n);
        _e(e, n.key, r);
        const l = this.r.renderers;
        const h = s.props;
        const c = h.length;
        let a = 0;
        let u;
        while (c > a) {
            u = h[a];
            l[u.type].render(t, r, u);
            ++a;
        }
        t.addChild(r);
    }
};

xs = n([ cs("rb") ], xs);

let ms = class TemplateControllerRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ ge, L ];
    }
    render(t, e, s) {
        var i;
        let n = t.container;
        let o;
        switch (typeof s.res) {
          case "string":
            o = n.find(Ct, s.res);
            if (null == o) throw new Error(`AUR0754:${s.res}@${t["name"]}`);
            break;

          default:
            o = s.res;
        }
        const r = this.r.getViewFactory(s.def, n);
        const l = Ke(e);
        const h = Fs(this.p, o, t, e, s, r, l);
        const c = Controller.$attr(t.container, h, e, o);
        _e(l, o.key, c);
        null === (i = h.link) || void 0 === i ? void 0 : i.call(h, t, c, e, s);
        const a = this.r.renderers;
        const u = s.props;
        const f = u.length;
        let d = 0;
        let p;
        while (f > d) {
            p = u[d];
            a[p.type].render(t, c, p);
            ++d;
        }
        t.addChild(c);
    }
};

ms = n([ cs("rc") ], ms);

let vs = class LetElementRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, s) {
        e.remove();
        const i = s.instructions;
        const n = s.toBindingContext;
        const o = t.container;
        const r = i.length;
        let l;
        let h;
        let c;
        let a = 0;
        while (r > a) {
            l = i[a];
            h = as(this.parser, l.from, 48);
            c = new LetBinding(h, l.to, this.oL, o, n);
            t.addBinding(38962 === h.$kind ? Rs(c, h, o) : c);
            ++a;
        }
    }
};

vs = n([ cs("rd"), o(0, i.IExpressionParser), o(1, i.IObserverLocator) ], vs);

let gs = class CallBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, s) {
        const i = as(this.parser, s.from, 153);
        const n = new CallBinding(i, us(e), s.to, this.oL, t.container);
        t.addBinding(38962 === i.$kind ? Rs(n, i, t.container) : n);
    }
};

gs.inject = [ i.IExpressionParser, i.IObserverLocator ];

gs = n([ cs("rh") ], gs);

let ws = class RefBindingRenderer {
    constructor(t) {
        this.parser = t;
    }
    render(t, e, s) {
        const i = as(this.parser, s.from, 5376);
        const n = new RefBinding(i, fs(e, s.to), t.container);
        t.addBinding(38962 === i.$kind ? Rs(n, i, t.container) : n);
    }
};

ws = n([ cs("rj"), o(0, i.IExpressionParser) ], ws);

let bs = class InterpolationBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const n = t.container;
        const o = as(this.parser, s.from, 2048);
        const r = new InterpolationBinding(this.oL, o, us(e), s.to, i.BindingMode.toView, n, this.p.domWriteQueue);
        const l = r.partBindings;
        const h = l.length;
        let c = 0;
        let a;
        for (;h > c; ++c) {
            a = l[c];
            if (38962 === a.sourceExpression.$kind) l[c] = Rs(a, a.sourceExpression, n);
        }
        t.addBinding(r);
    }
};

bs = n([ cs("rf"), o(0, i.IExpressionParser), o(1, i.IObserverLocator), o(2, L) ], bs);

let ys = class PropertyBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const i = as(this.parser, s.from, 48 | s.mode);
        const n = new PropertyBinding(i, us(e), s.to, s.mode, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(38962 === i.$kind ? Rs(n, i, t.container) : n);
    }
};

ys = n([ cs("rg"), o(0, i.IExpressionParser), o(1, i.IObserverLocator), o(2, L) ], ys);

let ks = class IteratorBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const n = as(this.parser, s.from, 539);
        const o = new PropertyBinding(n, us(e), s.to, i.BindingMode.toView, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(o);
    }
};

ks = n([ cs("rk"), o(0, i.IExpressionParser), o(1, i.IObserverLocator), o(2, L) ], ks);

let Cs = 0;

const As = [];

function Rs(t, e, s) {
    while (e instanceof i.BindingBehaviorExpression) {
        As[Cs++] = e;
        e = e.expression;
    }
    while (Cs > 0) {
        const e = As[--Cs];
        const n = s.get(e.behaviorKey);
        if (n instanceof i.BindingBehaviorFactory) t = n.construct(t, e);
    }
    As.length = 0;
    return t;
}

let Ss = class TextBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const i = t.container;
        const n = e.nextSibling;
        const o = e.parentNode;
        const r = this.p.document;
        const l = as(this.parser, s.from, 2048);
        const h = l.parts;
        const c = l.expressions;
        const a = c.length;
        let u = 0;
        let f = h[0];
        let d;
        let p;
        if ("" !== f) o.insertBefore(r.createTextNode(f), n);
        for (;a > u; ++u) {
            p = c[u];
            d = new ContentBinding(p, o.insertBefore(r.createTextNode(""), n), i, this.oL, this.p, s.strict);
            t.addBinding(38962 === p.$kind ? Rs(d, p, i) : d);
            f = h[u + 1];
            if ("" !== f) o.insertBefore(r.createTextNode(f), n);
        }
        if ("AU-M" === e.nodeName) e.remove();
    }
};

Ss = n([ cs("ha"), o(0, i.IExpressionParser), o(1, i.IObserverLocator), o(2, L) ], Ss);

let Es = class ListenerBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.eventDelegator = e;
        this.p = s;
    }
    render(t, e, s) {
        const i = as(this.parser, s.from, 80 | s.strategy + 6);
        const n = new Listener(this.p, s.to, s.strategy, i, e, s.preventDefault, this.eventDelegator, t.container);
        t.addBinding(38962 === i.$kind ? Rs(n, i, t.container) : n);
    }
};

Es = n([ cs("hb"), o(0, i.IExpressionParser), o(1, ss), o(2, L) ], Es);

let Bs = class SetAttributeRenderer {
    render(t, e, s) {
        e.setAttribute(s.to, s.value);
    }
};

Bs = n([ cs("he") ], Bs);

let Is = class SetClassAttributeRenderer {
    render(t, e, s) {
        $s(e.classList, s.value);
    }
};

Is = n([ cs("hf") ], Is);

let Ts = class SetStyleAttributeRenderer {
    render(t, e, s) {
        e.style.cssText += s.value;
    }
};

Ts = n([ cs("hg") ], Ts);

let Ds = class StylePropertyBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const n = as(this.parser, s.from, 48 | i.BindingMode.toView);
        const o = new PropertyBinding(n, e.style, s.to, i.BindingMode.toView, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(38962 === n.$kind ? Rs(o, n, t.container) : o);
    }
};

Ds = n([ cs("hd"), o(0, i.IExpressionParser), o(1, i.IObserverLocator), o(2, L) ], Ds);

let Ps = class AttributeBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, s) {
        const n = as(this.parser, s.from, 48 | i.BindingMode.toView);
        const o = new AttributeBinding(n, e, s.attr, s.to, i.BindingMode.toView, this.oL, t.container);
        t.addBinding(38962 === n.$kind ? Rs(o, n, t.container) : o);
    }
};

Ps = n([ cs("hc"), o(0, i.IExpressionParser), o(1, i.IObserverLocator) ], Ps);

function $s(t, e) {
    const s = e.length;
    let i = 0;
    for (let n = 0; n < s; ++n) if (32 === e.charCodeAt(n)) {
        if (n !== i) t.add(e.slice(i, n));
        i = n + 1;
    } else if (n + 1 === s) t.add(e.slice(i));
}

const Os = "IController";

const Ls = "IInstruction";

const qs = "IRenderLocation";

const Us = "IAuSlotsInfo";

function Ms(t, e, i, n, o, r) {
    const l = e.container.createChild();
    l.registerResolver(t.HTMLElement, l.registerResolver(t.Element, l.registerResolver(Ne, new s.InstanceProvider("ElementResolver", i))));
    l.registerResolver($e, new s.InstanceProvider(Os, e));
    l.registerResolver(os, new s.InstanceProvider(Ls, n));
    l.registerResolver(He, null == o ? Vs : new s.InstanceProvider(qs, o));
    l.registerResolver(ae, js);
    l.registerResolver(ns, null == r ? _s : new s.InstanceProvider(Us, r));
    return l;
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

function Fs(t, e, i, n, o, r, l, h) {
    const c = i.container.createChild();
    c.registerResolver(t.HTMLElement, c.registerResolver(t.Element, c.registerResolver(Ne, new s.InstanceProvider("ElementResolver", n))));
    c.registerResolver($e, new s.InstanceProvider(Os, i));
    c.registerResolver(os, new s.InstanceProvider(Ls, o));
    c.registerResolver(He, null == l ? Vs : new s.InstanceProvider(qs, l));
    c.registerResolver(ae, null == r ? js : new ViewFactoryProvider(r));
    c.registerResolver(ns, null == h ? _s : new s.InstanceProvider(Us, h));
    return c.invoke(e.Type);
}

const Vs = new s.InstanceProvider(qs);

const js = new ViewFactoryProvider(null);

const _s = new s.InstanceProvider(Us, new AuSlotsInfo(s.emptyArray));

function Ns(t) {
    return function(e) {
        return Gs.define(t, e);
    };
}

class BindingCommandDefinition {
    constructor(t, e, s, i, n) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
        this.type = n;
    }
    static create(t, e) {
        let i;
        let n;
        if ("string" === typeof t) {
            i = t;
            n = {
                name: i
            };
        } else {
            i = t.name;
            n = t;
        }
        return new BindingCommandDefinition(e, s.firstDefined(zs(e, "name"), i), s.mergeArrays(zs(e, "aliases"), n.aliases, e.aliases), Hs(i), s.firstDefined(zs(e, "type"), n.type, e.type, null));
    }
    register(t) {
        const {Type: e, key: n, aliases: o} = this;
        s.Registration.singleton(n, e).register(t);
        s.Registration.aliasTo(n, e).register(t);
        i.registerAliases(o, Gs, n, t);
    }
}

const Ws = f("binding-command");

const Hs = t => `${Ws}:${t}`;

const zs = (t, e) => r(u(e), t);

const Gs = Object.freeze({
    name: Ws,
    keyFrom: Hs,
    isType(t) {
        return "function" === typeof t && l(Ws, t);
    },
    define(t, e) {
        const s = BindingCommandDefinition.create(t, e);
        h(Ws, s, s.Type);
        h(Ws, s, s);
        d(e, Ws);
        return s.Type;
    },
    getDefinition(t) {
        const e = r(Ws, t);
        if (void 0 === e) throw new Error(`AUR0758:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        h(u(e), s, t);
    },
    getAnnotation: zs
});

exports.OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 49;
    }
    build(t) {
        var e;
        const n = t.attr;
        let o = n.target;
        let r = t.attr.rawValue;
        if (null == t.bindable) o = null !== (e = this.m.map(t.node, o)) && void 0 !== e ? e : s.camelCase(o); else {
            if ("" === r && 1 === t.def.type) r = s.camelCase(o);
            o = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(r, 49), o, i.BindingMode.oneTime);
    }
};

exports.OneTimeBindingCommand.inject = [ M, i.IExpressionParser ];

exports.OneTimeBindingCommand = n([ Ns("one-time") ], exports.OneTimeBindingCommand);

exports.ToViewBindingCommand = class ToViewBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 50;
    }
    build(t) {
        var e;
        const n = t.attr;
        let o = n.target;
        let r = t.attr.rawValue;
        if (null == t.bindable) o = null !== (e = this.m.map(t.node, o)) && void 0 !== e ? e : s.camelCase(o); else {
            if ("" === r && 1 === t.def.type) r = s.camelCase(o);
            o = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(r, 50), o, i.BindingMode.toView);
    }
};

exports.ToViewBindingCommand.inject = [ M, i.IExpressionParser ];

exports.ToViewBindingCommand = n([ Ns("to-view") ], exports.ToViewBindingCommand);

exports.FromViewBindingCommand = class FromViewBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 51;
    }
    build(t) {
        var e;
        const n = t.attr;
        let o = n.target;
        let r = n.rawValue;
        if (null == t.bindable) o = null !== (e = this.m.map(t.node, o)) && void 0 !== e ? e : s.camelCase(o); else {
            if ("" === r && 1 === t.def.type) r = s.camelCase(o);
            o = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(r, 51), o, i.BindingMode.fromView);
    }
};

exports.FromViewBindingCommand.inject = [ M, i.IExpressionParser ];

exports.FromViewBindingCommand = n([ Ns("from-view") ], exports.FromViewBindingCommand);

exports.TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 52;
    }
    build(t) {
        var e;
        const n = t.attr;
        let o = n.target;
        let r = n.rawValue;
        if (null == t.bindable) o = null !== (e = this.m.map(t.node, o)) && void 0 !== e ? e : s.camelCase(o); else {
            if ("" === r && 1 === t.def.type) r = s.camelCase(o);
            o = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(r, 52), o, i.BindingMode.twoWay);
    }
};

exports.TwoWayBindingCommand.inject = [ M, i.IExpressionParser ];

exports.TwoWayBindingCommand = n([ Ns("two-way") ], exports.TwoWayBindingCommand);

exports.DefaultBindingCommand = class DefaultBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 53;
    }
    build(t) {
        var e;
        const n = t.attr;
        const o = t.bindable;
        let r;
        let l;
        let h = n.target;
        let c = n.rawValue;
        if (null == o) {
            l = this.m.isTwoWay(t.node, h) ? i.BindingMode.twoWay : i.BindingMode.toView;
            h = null !== (e = this.m.map(t.node, h)) && void 0 !== e ? e : s.camelCase(h);
        } else {
            if ("" === c && 1 === t.def.type) c = s.camelCase(h);
            r = t.def.defaultBindingMode;
            l = o.mode === i.BindingMode.default || null == o.mode ? null == r || r === i.BindingMode.default ? i.BindingMode.toView : r : o.mode;
            h = o.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(c, 53), h, l);
    }
};

exports.DefaultBindingCommand.inject = [ M, i.IExpressionParser ];

exports.DefaultBindingCommand = n([ Ns("bind") ], exports.DefaultBindingCommand);

exports.CallBindingCommand = class CallBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 153;
    }
    build(t) {
        const e = null === t.bindable ? s.camelCase(t.attr.target) : t.bindable.property;
        return new CallBindingInstruction(this.xp.parse(t.attr.rawValue, 153), e);
    }
};

exports.CallBindingCommand.inject = [ i.IExpressionParser ];

exports.CallBindingCommand = n([ Ns("call") ], exports.CallBindingCommand);

exports.ForBindingCommand = class ForBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 539;
    }
    build(t) {
        const e = null === t.bindable ? s.camelCase(t.attr.target) : t.bindable.property;
        return new IteratorBindingInstruction(this.xp.parse(t.attr.rawValue, 539), e);
    }
};

exports.ForBindingCommand.inject = [ i.IExpressionParser ];

exports.ForBindingCommand = n([ Ns("for") ], exports.ForBindingCommand);

exports.TriggerBindingCommand = class TriggerBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 4182;
    }
    build(t) {
        return new ListenerBindingInstruction(this.xp.parse(t.attr.rawValue, 4182), t.attr.target, true, i.DelegationStrategy.none);
    }
};

exports.TriggerBindingCommand.inject = [ i.IExpressionParser ];

exports.TriggerBindingCommand = n([ Ns("trigger") ], exports.TriggerBindingCommand);

exports.DelegateBindingCommand = class DelegateBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 4184;
    }
    build(t) {
        return new ListenerBindingInstruction(this.xp.parse(t.attr.rawValue, 4184), t.attr.target, false, i.DelegationStrategy.bubbling);
    }
};

exports.DelegateBindingCommand.inject = [ i.IExpressionParser ];

exports.DelegateBindingCommand = n([ Ns("delegate") ], exports.DelegateBindingCommand);

exports.CaptureBindingCommand = class CaptureBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 4183;
    }
    build(t) {
        return new ListenerBindingInstruction(this.xp.parse(t.attr.rawValue, 4183), t.attr.target, false, i.DelegationStrategy.capturing);
    }
};

exports.CaptureBindingCommand.inject = [ i.IExpressionParser ];

exports.CaptureBindingCommand = n([ Ns("capture") ], exports.CaptureBindingCommand);

exports.AttrBindingCommand = class AttrBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction(t.attr.target, this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

exports.AttrBindingCommand.inject = [ i.IExpressionParser ];

exports.AttrBindingCommand = n([ Ns("attr") ], exports.AttrBindingCommand);

exports.StyleBindingCommand = class StyleBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("style", this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

exports.StyleBindingCommand.inject = [ i.IExpressionParser ];

exports.StyleBindingCommand = n([ Ns("style") ], exports.StyleBindingCommand);

exports.ClassBindingCommand = class ClassBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("class", this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

exports.ClassBindingCommand.inject = [ i.IExpressionParser ];

exports.ClassBindingCommand = n([ Ns("class") ], exports.ClassBindingCommand);

let Xs = class RefBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new RefBindingInstruction(this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

Xs.inject = [ i.IExpressionParser ];

Xs = n([ Ns("ref") ], Xs);

const Ks = s.DI.createInterface("ITemplateElementFactory", (t => t.singleton(TemplateElementFactory)));

const Ys = {};

class TemplateElementFactory {
    constructor(t) {
        this.p = t;
        this.ee = t.document.createElement("template");
    }
    createTemplate(t) {
        var e;
        if ("string" === typeof t) {
            let e = Ys[t];
            if (void 0 === e) {
                const s = this.ee;
                s.innerHTML = t;
                const i = s.content.firstElementChild;
                if (null == i || "TEMPLATE" !== i.nodeName || null != i.nextElementSibling) {
                    this.ee = this.p.document.createElement("template");
                    e = s;
                } else {
                    s.content.removeChild(i);
                    e = i;
                }
                Ys[t] = e;
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

TemplateElementFactory.inject = [ L ];

const Zs = function(t) {
    function e(t, i, n) {
        s.DI.inject(e)(t, i, n);
    }
    e.$isResolver = true;
    e.resolve = function(e, s) {
        if (s.root === s) return s.getAll(t, false);
        return s.has(t, false) ? s.getAll(t, false).concat(s.root.getAll(t, false)) : s.root.getAll(t, false);
    };
    return e;
};

class TemplateCompiler {
    constructor() {
        this.debug = false;
        this.resolveResources = true;
    }
    static register(t) {
        return s.Registration.singleton(ls, this).register(t);
    }
    compile(t, e, i) {
        var n, o, r, l;
        const h = CustomElementDefinition.getOrCreate(t);
        if (null === h.template || void 0 === h.template) return h;
        if (false === h.needsCompile) return h;
        null !== i && void 0 !== i ? i : i = ti;
        const c = new CompilationContext(t, e, i, null, null, void 0);
        const a = "string" === typeof h.template || !t.enhance ? c.se.createTemplate(h.template) : h.template;
        const u = "TEMPLATE" === a.nodeName && null != a.content;
        const f = u ? a.content : a;
        const d = e.get(Zs(ui));
        const p = d.length;
        let x = 0;
        if (p > 0) while (p > x) {
            null === (o = (n = d[x]).compiling) || void 0 === o ? void 0 : o.call(n, a);
            ++x;
        }
        if (a.hasAttribute(hi)) throw new Error("AUR0701");
        this.ie(f, c);
        this.ne(f, c);
        return CustomElementDefinition.create({
            ...t,
            name: t.name || mi(),
            dependencies: (null !== (r = t.dependencies) && void 0 !== r ? r : s.emptyArray).concat(null !== (l = c.deps) && void 0 !== l ? l : s.emptyArray),
            instructions: c.rows,
            surrogates: u ? this.oe(a, c) : s.emptyArray,
            template: a,
            hasSlots: c.hasSlot,
            needsCompile: false
        });
    }
    oe(t, e) {
        var i;
        const n = [];
        const o = t.attributes;
        const r = e.re;
        let l = o.length;
        let h = 0;
        let c;
        let a;
        let u;
        let f;
        let d = null;
        let p;
        let x;
        let m;
        let v;
        let g = null;
        let w;
        let b;
        let y;
        let k;
        for (;l > h; ++h) {
            c = o[h];
            a = c.name;
            u = c.value;
            f = e.le.parse(a, u);
            y = f.target;
            k = f.rawValue;
            if (ii[y]) throw new Error(`AUR0702:${a}`);
            g = e.he(f);
            if (null !== g && (4096 & g.bindingType) > 0) {
                si.node = t;
                si.attr = f;
                si.bindable = null;
                si.def = null;
                n.push(g.build(si));
                continue;
            }
            d = e.ce(y);
            if (null !== d) {
                if (d.isTemplateController) throw new Error(`AUR0703:${y}`);
                m = BindablesInfo.from(d, true);
                b = false === d.noMultiBindings && null === g && Js(k);
                if (b) x = this.ae(t, k, d, e); else {
                    v = m.primary;
                    if (null === g) {
                        w = r.parse(k, 2048);
                        x = [ null === w ? new SetPropertyInstruction(k, v.property) : new InterpolationInstruction(w, v.property) ];
                    } else {
                        si.node = t;
                        si.attr = f;
                        si.bindable = v;
                        si.def = d;
                        x = [ g.build(si) ];
                    }
                }
                t.removeAttribute(a);
                --h;
                --l;
                (null !== p && void 0 !== p ? p : p = []).push(new HydrateAttributeInstruction(this.resolveResources ? d : d.name, null != d.aliases && d.aliases.includes(y) ? y : void 0, x));
                continue;
            }
            if (null === g) {
                w = r.parse(k, 2048);
                if (null != w) {
                    t.removeAttribute(a);
                    --h;
                    --l;
                    n.push(new InterpolationInstruction(w, null !== (i = e.ue.map(t, y)) && void 0 !== i ? i : s.camelCase(y)));
                } else switch (a) {
                  case "class":
                    n.push(new SetClassAttributeInstruction(k));
                    break;

                  case "style":
                    n.push(new SetStyleAttributeInstruction(k));
                    break;

                  default:
                    n.push(new SetAttributeInstruction(k, a));
                }
            } else {
                si.node = t;
                si.attr = f;
                si.bindable = null;
                si.def = null;
                n.push(g.build(si));
            }
        }
        Qs();
        if (null != p) return p.concat(n);
        return n;
    }
    ne(t, e) {
        switch (t.nodeType) {
          case 1:
            switch (t.nodeName) {
              case "LET":
                return this.fe(t, e);

              default:
                return this.de(t, e);
            }

          case 3:
            return this.pe(t, e);

          case 11:
            {
                let s = t.firstChild;
                while (null !== s) s = this.ne(s, e);
                break;
            }
        }
        return t.nextSibling;
    }
    fe(t, e) {
        const n = t.attributes;
        const o = n.length;
        const r = [];
        const l = e.re;
        let h = false;
        let c = 0;
        let a;
        let u;
        let f;
        let d;
        let p;
        let x;
        let m;
        let v;
        for (;o > c; ++c) {
            a = n[c];
            f = a.name;
            d = a.value;
            if ("to-binding-context" === f) {
                h = true;
                continue;
            }
            u = e.le.parse(f, d);
            x = u.target;
            m = u.rawValue;
            p = e.he(u);
            if (null !== p) {
                if (50 === p.bindingType || 53 === p.bindingType) {
                    r.push(new LetBindingInstruction(l.parse(m, p.bindingType), s.camelCase(x)));
                    continue;
                }
                throw new Error(`AUR0704:${u.command}`);
            }
            v = l.parse(m, 2048);
            r.push(new LetBindingInstruction(null === v ? new i.PrimitiveLiteralExpression(m) : v, s.camelCase(x)));
        }
        e.rows.push([ new HydrateLetElementInstruction(r, h) ]);
        return this.xe(t).nextSibling;
    }
    de(t, e) {
        var i, n, o, r, l;
        var h, c;
        const a = t.nextSibling;
        const u = (null !== (i = t.getAttribute("as-element")) && void 0 !== i ? i : t.nodeName).toLowerCase();
        const f = e.me(u);
        const d = e.re;
        const p = this.debug ? s.noop : () => {
            t.removeAttribute(b);
            --g;
            --v;
        };
        let x = t.attributes;
        let m;
        let v = x.length;
        let g = 0;
        let w;
        let b;
        let y;
        let k;
        let C;
        let A;
        let R = null;
        let S = false;
        let E;
        let B;
        let I;
        let T;
        let D;
        let P;
        let $;
        let O = null;
        let L;
        let q;
        let U;
        let M;
        let F = true;
        let V = false;
        if ("slot" === u) e.root.hasSlot = true;
        if (null !== f) {
            F = null === (n = f.processContent) || void 0 === n ? void 0 : n.call(f.Type, t, e.p);
            x = t.attributes;
            v = x.length;
        }
        if (e.root.def.enhance && t.classList.contains("au")) throw new Error(`AUR0705`);
        for (;v > g; ++g) {
            w = x[g];
            b = w.name;
            y = w.value;
            switch (b) {
              case "as-element":
              case "containerless":
                p();
                if (!V) V = "containerless" === b;
                continue;
            }
            k = e.le.parse(b, y);
            O = e.he(k);
            if (null !== O && 4096 & O.bindingType) {
                si.node = t;
                si.attr = k;
                si.bindable = null;
                si.def = null;
                (null !== C && void 0 !== C ? C : C = []).push(O.build(si));
                p();
                continue;
            }
            U = k.target;
            M = k.rawValue;
            R = e.ce(U);
            if (null !== R) {
                L = BindablesInfo.from(R, true);
                S = false === R.noMultiBindings && null === O && Js(y);
                if (S) I = this.ae(t, y, R, e); else {
                    q = L.primary;
                    if (null === O) {
                        P = d.parse(y, 2048);
                        I = [ null === P ? new SetPropertyInstruction(y, q.property) : new InterpolationInstruction(P, q.property) ];
                    } else {
                        si.node = t;
                        si.attr = k;
                        si.bindable = q;
                        si.def = R;
                        I = [ O.build(si) ];
                    }
                }
                p();
                if (R.isTemplateController) (null !== T && void 0 !== T ? T : T = []).push(new HydrateTemplateController(ei, this.resolveResources ? R : R.name, void 0, I)); else (null !== B && void 0 !== B ? B : B = []).push(new HydrateAttributeInstruction(this.resolveResources ? R : R.name, null != R.aliases && R.aliases.includes(U) ? U : void 0, I));
                continue;
            }
            if (null === O) {
                if (null !== f) {
                    L = BindablesInfo.from(f, false);
                    E = L.attrs[U];
                    if (void 0 !== E) {
                        P = d.parse(M, 2048);
                        (null !== A && void 0 !== A ? A : A = []).push(null == P ? new SetPropertyInstruction(M, E.property) : new InterpolationInstruction(P, E.property));
                        p();
                        continue;
                    }
                }
                P = d.parse(M, 2048);
                if (null != P) {
                    p();
                    (null !== C && void 0 !== C ? C : C = []).push(new InterpolationInstruction(P, null !== (o = e.ue.map(t, U)) && void 0 !== o ? o : s.camelCase(U)));
                }
                continue;
            }
            p();
            if (null !== f) {
                L = BindablesInfo.from(f, false);
                E = L.attrs[U];
                if (void 0 !== E) {
                    si.node = t;
                    si.attr = k;
                    si.bindable = E;
                    si.def = f;
                    (null !== A && void 0 !== A ? A : A = []).push(O.build(si));
                    continue;
                }
            }
            si.node = t;
            si.attr = k;
            si.bindable = null;
            si.def = null;
            (null !== C && void 0 !== C ? C : C = []).push(O.build(si));
        }
        Qs();
        if (this.ve(t) && null != C && C.length > 1) this.ge(t, C);
        if (null !== f) {
            $ = new HydrateElementInstruction(this.resolveResources ? f : f.name, void 0, null !== A && void 0 !== A ? A : s.emptyArray, null, V);
            if ("au-slot" === u) {
                const s = t.getAttribute("name") || "default";
                const i = e.h("template");
                const n = e.we();
                let o = t.firstChild;
                while (null !== o) {
                    if (1 === o.nodeType && o.hasAttribute("au-slot")) t.removeChild(o); else i.content.appendChild(o);
                    o = t.firstChild;
                }
                this.ne(i.content, n);
                $.auSlot = {
                    name: s,
                    fallback: CustomElementDefinition.create({
                        name: mi(),
                        template: i,
                        instructions: n.rows,
                        needsCompile: false
                    })
                };
                t = this.be(t, e);
            }
        }
        if (null != C || null != $ || null != B) {
            m = s.emptyArray.concat(null !== $ && void 0 !== $ ? $ : s.emptyArray, null !== B && void 0 !== B ? B : s.emptyArray, null !== C && void 0 !== C ? C : s.emptyArray);
            this.xe(t);
        }
        let j;
        if (null != T) {
            v = T.length - 1;
            g = v;
            D = T[g];
            let s;
            this.be(t, e);
            if ("TEMPLATE" === t.nodeName) s = t; else {
                s = e.h("template");
                s.content.appendChild(t);
            }
            const i = s;
            const n = e.we(null == m ? [] : [ m ]);
            j = null === f || !f.containerless && !V && false !== F;
            if (null !== f && f.containerless) this.be(t, e);
            let o;
            let l;
            let c;
            let a;
            let u;
            let d;
            let p;
            let x;
            let w;
            let b = 0, y = 0;
            if (j) {
                if (null !== f) {
                    o = t.firstChild;
                    while (null !== o) if (1 === o.nodeType) {
                        l = o;
                        o = o.nextSibling;
                        c = l.getAttribute("au-slot");
                        if (null !== c) {
                            if ("" === c) c = "default";
                            l.removeAttribute("au-slot");
                            t.removeChild(l);
                            (null !== (r = (h = null !== u && void 0 !== u ? u : u = {})[c]) && void 0 !== r ? r : h[c] = []).push(l);
                        }
                    } else o = o.nextSibling;
                    if (null != u) {
                        a = {};
                        for (c in u) {
                            s = e.h("template");
                            d = u[c];
                            for (b = 0, y = d.length; y > b; ++b) {
                                p = d[b];
                                if ("TEMPLATE" === p.nodeName) if (p.attributes.length > 0) s.content.appendChild(p); else s.content.appendChild(p.content); else s.content.appendChild(p);
                            }
                            w = e.we();
                            this.ne(s.content, w);
                            a[c] = CustomElementDefinition.create({
                                name: mi(),
                                template: s,
                                instructions: w.rows,
                                needsCompile: false,
                                isStrictBinding: e.root.def.isStrictBinding
                            });
                        }
                        $.projections = a;
                    }
                }
                if ("TEMPLATE" === t.nodeName) this.ne(t.content, n); else {
                    o = t.firstChild;
                    while (null !== o) o = this.ne(o, n);
                }
            }
            D.def = CustomElementDefinition.create({
                name: mi(),
                template: i,
                instructions: n.rows,
                needsCompile: false,
                isStrictBinding: e.root.def.isStrictBinding
            });
            while (g-- > 0) {
                D = T[g];
                s = e.h("template");
                x = e.h("au-m");
                x.classList.add("au");
                s.content.appendChild(x);
                D.def = CustomElementDefinition.create({
                    name: mi(),
                    template: s,
                    needsCompile: false,
                    instructions: [ [ T[g + 1] ] ],
                    isStrictBinding: e.root.def.isStrictBinding
                });
            }
            e.rows.push([ D ]);
        } else {
            if (null != m) e.rows.push(m);
            j = null === f || !f.containerless && !V && false !== F;
            if (null !== f && f.containerless) this.be(t, e);
            if (j && t.childNodes.length > 0) {
                let s = t.firstChild;
                let i;
                let n;
                let o = null;
                let r;
                let h;
                let a;
                let u;
                let d;
                let p = 0, x = 0;
                while (null !== s) if (1 === s.nodeType) {
                    i = s;
                    s = s.nextSibling;
                    n = i.getAttribute("au-slot");
                    if (null !== n) {
                        if (null === f) throw new Error(`AUR0706:${t.nodeName}[${n}]`);
                        if ("" === n) n = "default";
                        t.removeChild(i);
                        i.removeAttribute("au-slot");
                        (null !== (l = (c = null !== r && void 0 !== r ? r : r = {})[n]) && void 0 !== l ? l : c[n] = []).push(i);
                    }
                } else s = s.nextSibling;
                if (null != r) {
                    o = {};
                    for (n in r) {
                        u = e.h("template");
                        h = r[n];
                        for (p = 0, x = h.length; x > p; ++p) {
                            a = h[p];
                            if ("TEMPLATE" === a.nodeName) if (a.attributes.length > 0) u.content.appendChild(a); else u.content.appendChild(a.content); else u.content.appendChild(a);
                        }
                        d = e.we();
                        this.ne(u.content, d);
                        o[n] = CustomElementDefinition.create({
                            name: mi(),
                            template: u,
                            instructions: d.rows,
                            needsCompile: false,
                            isStrictBinding: e.root.def.isStrictBinding
                        });
                    }
                    $.projections = o;
                }
                s = t.firstChild;
                while (null !== s) s = this.ne(s, e);
            }
        }
        return a;
    }
    pe(t, e) {
        let s = "";
        let i = t;
        while (null !== i && 3 === i.nodeType) {
            s += i.textContent;
            i = i.nextSibling;
        }
        const n = e.re.parse(s, 2048);
        if (null === n) return i;
        const o = t.parentNode;
        o.insertBefore(this.xe(e.h("au-m")), t);
        e.rows.push([ new TextBindingInstruction(n, !!e.def.isStrictBinding) ]);
        t.textContent = "";
        i = t.nextSibling;
        while (null !== i && 3 === i.nodeType) {
            o.removeChild(i);
            i = t.nextSibling;
        }
        return t.nextSibling;
    }
    ae(t, e, s, i) {
        const n = BindablesInfo.from(s, true);
        const o = e.length;
        const r = [];
        let l;
        let h;
        let c = 0;
        let a = 0;
        let u;
        let f;
        let d;
        let p;
        for (let x = 0; x < o; ++x) {
            a = e.charCodeAt(x);
            if (92 === a) ++x; else if (58 === a) {
                l = e.slice(c, x);
                while (e.charCodeAt(++x) <= 32) ;
                c = x;
                for (;x < o; ++x) {
                    a = e.charCodeAt(x);
                    if (92 === a) ++x; else if (59 === a) {
                        h = e.slice(c, x);
                        break;
                    }
                }
                if (void 0 === h) h = e.slice(c);
                f = i.le.parse(l, h);
                d = i.he(f);
                p = n.attrs[f.target];
                if (null == p) throw new Error(`AUR0707:${s.name}.${f.target}`);
                if (null === d) {
                    u = i.re.parse(h, 2048);
                    r.push(null === u ? new SetPropertyInstruction(h, p.property) : new InterpolationInstruction(u, p.property));
                } else {
                    si.node = t;
                    si.attr = f;
                    si.bindable = p;
                    si.def = s;
                    r.push(d.build(si));
                }
                while (x < o && e.charCodeAt(++x) <= 32) ;
                c = x;
                l = void 0;
                h = void 0;
            }
        }
        Qs();
        return r;
    }
    ie(t, e) {
        const i = t;
        const n = s.toArray(i.querySelectorAll("template[as-custom-element]"));
        const o = n.length;
        if (0 === o) return;
        if (o === i.childElementCount) throw new Error("AUR0708");
        const r = new Set;
        for (const t of n) {
            if (t.parentNode !== i) throw new Error("AUR0709");
            const n = ci(t, r);
            const o = class LocalTemplate {};
            const l = t.content;
            const h = s.toArray(l.querySelectorAll("bindable"));
            const c = w.for(o);
            const a = new Set;
            const u = new Set;
            for (const t of h) {
                if (t.parentNode !== l) throw new Error("AUR0710");
                const e = t.getAttribute("property");
                if (null === e) throw new Error("AUR0711");
                const s = t.getAttribute("attribute");
                if (null !== s && u.has(s) || a.has(e)) throw new Error(`AUR0712:${e}+${s}`); else {
                    if (null !== s) u.add(s);
                    a.add(e);
                }
                c.add({
                    property: e,
                    attribute: null !== s && void 0 !== s ? s : void 0,
                    mode: ai(t)
                });
                const i = t.getAttributeNames().filter((t => !li.includes(t)));
                if (i.length > 0) ;
                l.removeChild(t);
            }
            e.ye(Nt.define({
                name: n,
                template: t
            }, o));
            i.removeChild(t);
        }
    }
    ve(t) {
        return "INPUT" === t.nodeName && 1 === ni[t.type];
    }
    ge(t, e) {
        switch (t.nodeName) {
          case "INPUT":
            {
                const t = e;
                let s;
                let i;
                let n = 0;
                let o;
                for (let e = 0; e < t.length && n < 3; e++) {
                    o = t[e];
                    switch (o.to) {
                      case "model":
                      case "value":
                      case "matcher":
                        s = e;
                        n++;
                        break;

                      case "checked":
                        i = e;
                        n++;
                        break;
                    }
                }
                if (void 0 !== i && void 0 !== s && i < s) [t[s], t[i]] = [ t[i], t[s] ];
            }
        }
    }
    xe(t) {
        t.classList.add("au");
        return t;
    }
    be(t, e) {
        const s = t.parentNode;
        const i = e.h("au-m");
        this.xe(s.insertBefore(i, t));
        s.removeChild(t);
        return i;
    }
}

class CompilationContext {
    constructor(t, e, n, o, r, l) {
        this.hasSlot = false;
        this.ke = D();
        const h = null !== o;
        this.c = e;
        this.root = null === r ? this : r;
        this.def = t;
        this.ci = n;
        this.parent = o;
        this.se = h ? o.se : e.get(Ks);
        this.le = h ? o.le : e.get(R);
        this.re = h ? o.re : e.get(i.IExpressionParser);
        this.ue = h ? o.ue : e.get(M);
        this.Vt = h ? o.Vt : e.get(s.ILogger);
        this.p = h ? o.p : e.get(L);
        this.localEls = h ? o.localEls : new Set;
        this.rows = null !== l && void 0 !== l ? l : [];
    }
    ye(t) {
        var e;
        var s;
        (null !== (e = (s = this.root).deps) && void 0 !== e ? e : s.deps = []).push(t);
        this.root.c.register(t);
    }
    h(t) {
        const e = this.p.document.createElement(t);
        if ("template" === t) this.p.document.adoptNode(e.content);
        return e;
    }
    me(t) {
        return this.c.find(Nt, t);
    }
    ce(t) {
        return this.c.find(Ct, t);
    }
    we(t) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, t);
    }
    he(t) {
        if (this.root !== this) return this.root.he(t);
        const e = t.command;
        if (null === e) return null;
        let s = this.ke[e];
        if (void 0 === s) {
            s = this.c.create(Gs, e);
            if (null === s) throw new Error(`AUR0713:${e}`);
            this.ke[e] = s;
        }
        return s;
    }
}

function Js(t) {
    const e = t.length;
    let s = 0;
    let i = 0;
    while (e > i) {
        s = t.charCodeAt(i);
        if (92 === s) ++i; else if (58 === s) return true; else if (36 === s && 123 === t.charCodeAt(i + 1)) return false;
        ++i;
    }
    return false;
}

function Qs() {
    si.node = si.attr = si.bindable = si.def = null;
}

const ti = {
    projections: null
};

const ei = {
    name: "unnamed"
};

const si = {
    node: null,
    attr: null,
    bindable: null,
    def: null
};

const ii = Object.assign(D(), {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
});

const ni = {
    checkbox: 1,
    radio: 1
};

const oi = new WeakMap;

class BindablesInfo {
    constructor(t, e, s) {
        this.attrs = t;
        this.bindables = e;
        this.primary = s;
    }
    static from(t, e) {
        let s = oi.get(t);
        if (null == s) {
            const n = t.bindables;
            const o = D();
            const r = e ? void 0 === t.defaultBindingMode ? i.BindingMode.default : t.defaultBindingMode : i.BindingMode.default;
            let l;
            let h;
            let c = false;
            let a;
            let u;
            for (h in n) {
                l = n[h];
                u = l.attribute;
                if (true === l.primary) {
                    if (c) throw new Error(`AUR0714:${t.name}`);
                    c = true;
                    a = l;
                } else if (!c && null == a) a = l;
                o[u] = BindableDefinition.create(h, l);
            }
            if (null == l && e) a = o.value = BindableDefinition.create("value", {
                mode: r
            });
            oi.set(t, s = new BindablesInfo(o, n, a));
        }
        return s;
    }
}

var ri;

(function(t) {
    t["property"] = "property";
    t["attribute"] = "attribute";
    t["mode"] = "mode";
})(ri || (ri = {}));

const li = Object.freeze([ "property", "attribute", "mode" ]);

const hi = "as-custom-element";

function ci(t, e) {
    const s = t.getAttribute(hi);
    if (null === s || "" === s) throw new Error("AUR0715");
    if (e.has(s)) throw new Error(`AUR0716:${s}`); else {
        e.add(s);
        t.removeAttribute(hi);
    }
    return s;
}

function ai(t) {
    switch (t.getAttribute("mode")) {
      case "oneTime":
        return i.BindingMode.oneTime;

      case "toView":
        return i.BindingMode.toView;

      case "fromView":
        return i.BindingMode.fromView;

      case "twoWay":
        return i.BindingMode.twoWay;

      case "default":
      default:
        return i.BindingMode.default;
    }
}

const ui = s.DI.createInterface("ITemplateCompilerHooks");

const fi = new WeakMap;

const di = f("compiler-hooks");

const pi = Object.freeze({
    name: di,
    define(t) {
        let e = fi.get(t);
        if (void 0 === e) {
            fi.set(t, e = new TemplateCompilerHooksDefinition(t));
            h(di, e, t);
            d(t, di);
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
        t.register(s.Registration.singleton(ui, this.Type));
    }
}

const xi = t => {
    return void 0 === t ? e : e(t);
    function e(t) {
        return pi.define(t);
    }
};

const mi = Nt.generateName;

class BindingModeBehavior {
    constructor(t) {
        this.mode = t;
        this.Ce = new Map;
    }
    bind(t, e, s) {
        this.Ce.set(s, s.mode);
        s.mode = this.mode;
    }
    unbind(t, e, s) {
        s.mode = this.Ce.get(s);
        this.Ce.delete(s);
    }
}

class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(i.BindingMode.oneTime);
    }
}

class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(i.BindingMode.toView);
    }
}

class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(i.BindingMode.fromView);
    }
}

class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(i.BindingMode.twoWay);
    }
}

i.bindingBehavior("oneTime")(OneTimeBindingBehavior);

i.bindingBehavior("toView")(ToViewBindingBehavior);

i.bindingBehavior("fromView")(FromViewBindingBehavior);

i.bindingBehavior("twoWay")(TwoWayBindingBehavior);

const vi = 200;

class DebounceBindingBehavior extends i.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: vi
        };
        this.firstArg = null;
        this.task = null;
        this.taskQueue = t.locator.get(s.IPlatform).taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.queueTask((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, s) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
        }
        this.binding.handleChange(t, e, s);
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
            const s = Number(this.firstArg.evaluate(t, e, this.locator, null));
            this.opts.delay = isNaN(s) ? vi : s;
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

i.bindingBehavior("debounce")(DebounceBindingBehavior);

class SignalBindingBehavior {
    constructor(t) {
        this.Qt = new Map;
        this.Ae = t;
    }
    bind(t, e, s, ...i) {
        if (!("handleChange" in s)) throw new Error("AUR0817");
        if (0 === i.length) throw new Error("AUR0818");
        this.Qt.set(s, i);
        let n;
        for (n of i) this.Ae.addSignalListener(n, s);
    }
    unbind(t, e, s) {
        const i = this.Qt.get(s);
        this.Qt.delete(s);
        let n;
        for (n of i) this.Ae.removeSignalListener(n, s);
    }
}

SignalBindingBehavior.inject = [ i.ISignaler ];

i.bindingBehavior("signal")(SignalBindingBehavior);

const gi = 200;

class ThrottleBindingBehavior extends i.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: gi
        };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.Re = t.locator.get(s.IPlatform);
        this.Se = this.Re.taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.Ee((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, s) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.Re.performanceNow();
        }
        this.binding.handleChange(t, e, s);
    }
    updateSource(t, e) {
        this.Ee((() => this.binding.updateSource(t, e)));
    }
    Ee(t) {
        const e = this.opts;
        const s = this.Re;
        const i = this.lastCall + e.delay - s.performanceNow();
        if (i > 0) {
            const n = this.task;
            e.delay = i;
            this.task = this.Se.queueTask((() => {
                this.lastCall = s.performanceNow();
                this.task = null;
                e.delay = this.delay;
                t();
            }), e);
            null === n || void 0 === n ? void 0 : n.cancel();
        } else {
            this.lastCall = s.performanceNow();
            t();
        }
    }
    $bind(t, e) {
        if (null !== this.firstArg) {
            const s = Number(this.firstArg.evaluate(t, e, this.locator, null));
            this.opts.delay = this.delay = isNaN(s) ? gi : s;
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

i.bindingBehavior("throttle")(ThrottleBindingBehavior);

class DataAttributeAccessor {
    constructor() {
        this.type = 2 | 4;
    }
    getValue(t, e) {
        return t.getAttribute(e);
    }
    setValue(t, e, s, i) {
        if (void 0 == t) s.removeAttribute(i); else s.setAttribute(i, t);
    }
}

const wi = new DataAttributeAccessor;

class AttrBindingBehavior {
    bind(t, e, s) {
        s.targetObserver = wi;
    }
    unbind(t, e, s) {
        return;
    }
}

i.bindingBehavior("attr")(AttrBindingBehavior);

function bi(t) {
    const e = t.composedPath()[0];
    if (this.target !== e) return;
    return this.selfEventCallSource(t);
}

class SelfBindingBehavior {
    bind(t, e, s) {
        if (!s.callSource || !s.targetEvent) throw new Error("AUR0801");
        s.selfEventCallSource = s.callSource;
        s.callSource = bi;
    }
    unbind(t, e, s) {
        s.callSource = s.selfEventCallSource;
        s.selfEventCallSource = null;
    }
}

i.bindingBehavior("self")(SelfBindingBehavior);

const yi = D();

class AttributeNSAccessor {
    constructor(t) {
        this.ns = t;
        this.type = 2 | 4;
    }
    static forNs(t) {
        var e;
        return null !== (e = yi[t]) && void 0 !== e ? e : yi[t] = new AttributeNSAccessor(t);
    }
    getValue(t, e) {
        return t.getAttributeNS(this.ns, e);
    }
    setValue(t, e, s, i) {
        if (void 0 == t) s.removeAttributeNS(this.ns, i); else s.setAttributeNS(this.ns, i, t);
    }
}

function ki(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, s, i) {
        this.handler = s;
        this.type = 2 | 1 | 4;
        this.v = void 0;
        this.ov = void 0;
        this.Be = void 0;
        this.Ie = void 0;
        this.f = 0;
        this.O = t;
        this.oL = i;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        const s = this.v;
        if (t === s) return;
        this.v = t;
        this.ov = s;
        this.f = e;
        this.Te();
        this.De();
        this.queue.add(this);
    }
    handleCollectionChange(t, e) {
        this.De();
    }
    handleChange(t, e, s) {
        this.De();
    }
    De() {
        const t = this.v;
        const e = this.O;
        const s = P.call(e, "model") ? e.model : e.value;
        const i = "radio" === e.type;
        const n = void 0 !== e.matcher ? e.matcher : ki;
        if (i) e.checked = !!n(t, s); else if (true === t) e.checked = true; else {
            let i = false;
            if (t instanceof Array) i = -1 !== t.findIndex((t => !!n(t, s))); else if (t instanceof Set) {
                for (const e of t) if (n(e, s)) {
                    i = true;
                    break;
                }
            } else if (t instanceof Map) for (const e of t) {
                const t = e[0];
                const o = e[1];
                if (n(t, s) && true === o) {
                    i = true;
                    break;
                }
            }
            e.checked = i;
        }
    }
    handleEvent() {
        let t = this.ov = this.v;
        const e = this.O;
        const s = P.call(e, "model") ? e.model : e.value;
        const i = e.checked;
        const n = void 0 !== e.matcher ? e.matcher : ki;
        if ("checkbox" === e.type) {
            if (t instanceof Array) {
                const e = t.findIndex((t => !!n(t, s)));
                if (i && -1 === e) t.push(s); else if (!i && -1 !== e) t.splice(e, 1);
                return;
            } else if (t instanceof Set) {
                const e = {};
                let o = e;
                for (const e of t) if (true === n(e, s)) {
                    o = e;
                    break;
                }
                if (i && o === e) t.add(s); else if (!i && o !== e) t.delete(o);
                return;
            } else if (t instanceof Map) {
                let e;
                for (const i of t) {
                    const t = i[0];
                    if (true === n(t, s)) {
                        e = t;
                        break;
                    }
                }
                t.set(e, i);
                return;
            }
            t = i;
        } else if (i) t = s; else return;
        this.v = t;
        this.queue.add(this);
    }
    start() {
        this.handler.subscribe(this.O, this);
        this.Te();
    }
    stop() {
        var t, e;
        this.handler.dispose();
        null === (t = this.Be) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.Be = void 0;
        null === (e = this.Ie) || void 0 === e ? void 0 : e.unsubscribe(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.start();
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.stop();
    }
    flush() {
        Ci = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Ci, this.f);
    }
    Te() {
        var t, e, s, i, n, o, r;
        const l = this.O;
        null === (n = null !== (t = this.Ie) && void 0 !== t ? t : this.Ie = null !== (s = null === (e = l.$observers) || void 0 === e ? void 0 : e.model) && void 0 !== s ? s : null === (i = l.$observers) || void 0 === i ? void 0 : i.value) || void 0 === n ? void 0 : n.subscribe(this);
        null === (o = this.Be) || void 0 === o ? void 0 : o.unsubscribe(this);
        this.Be = void 0;
        if ("checkbox" === l.type) null === (r = this.Be = qi(this.v, this.oL)) || void 0 === r ? void 0 : r.subscribe(this);
    }
}

i.subscriberCollection(CheckedObserver);

i.withFlushQueue(CheckedObserver);

let Ci;

const Ai = Object.prototype.hasOwnProperty;

const Ri = {
    childList: true,
    subtree: true,
    characterData: true
};

function Si(t, e) {
    return t === e;
}

class SelectValueObserver {
    constructor(t, e, s, i) {
        this.type = 2 | 1 | 4;
        this.v = void 0;
        this.ov = void 0;
        this.W = false;
        this.Pe = void 0;
        this.$e = void 0;
        this.iO = false;
        this.O = t;
        this.oL = i;
        this.handler = s;
    }
    getValue() {
        return this.iO ? this.v : this.O.multiple ? Ei(this.O.options) : this.O.value;
    }
    setValue(t, e) {
        this.ov = this.v;
        this.v = t;
        this.W = t !== this.ov;
        this.Oe(t instanceof Array ? t : null);
        if (0 === (256 & e)) this.Y();
    }
    Y() {
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
        const s = this.O;
        const i = Array.isArray(e);
        const n = null !== (t = s.matcher) && void 0 !== t ? t : Si;
        const o = s.options;
        let r = o.length;
        while (r-- > 0) {
            const t = o[r];
            const s = Ai.call(t, "model") ? t.model : t.value;
            if (i) {
                t.selected = -1 !== e.findIndex((t => !!n(s, t)));
                continue;
            }
            t.selected = !!n(s, e);
        }
    }
    syncValue() {
        const t = this.O;
        const e = t.options;
        const s = e.length;
        const i = this.v;
        let n = 0;
        if (t.multiple) {
            if (!(i instanceof Array)) return true;
            let o;
            const r = t.matcher || Si;
            const l = [];
            while (n < s) {
                o = e[n];
                if (o.selected) l.push(Ai.call(o, "model") ? o.model : o.value);
                ++n;
            }
            let h;
            n = 0;
            while (n < i.length) {
                h = i[n];
                if (-1 === l.findIndex((t => !!r(h, t)))) i.splice(n, 1); else ++n;
            }
            n = 0;
            while (n < l.length) {
                h = l[n];
                if (-1 === i.findIndex((t => !!r(h, t)))) i.push(h);
                ++n;
            }
            return false;
        }
        let o = null;
        let r;
        while (n < s) {
            r = e[n];
            if (r.selected) {
                o = Ai.call(r, "model") ? r.model : r.value;
                break;
            }
            ++n;
        }
        this.ov = this.v;
        this.v = o;
        return true;
    }
    Le() {
        (this.$e = new this.O.ownerDocument.defaultView.MutationObserver(this.qe.bind(this))).observe(this.O, Ri);
        this.Oe(this.v instanceof Array ? this.v : null);
        this.iO = true;
    }
    Ue() {
        var t;
        this.$e.disconnect();
        null === (t = this.Pe) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.$e = this.Pe = void 0;
        this.iO = false;
    }
    Oe(t) {
        var e;
        null === (e = this.Pe) || void 0 === e ? void 0 : e.unsubscribe(this);
        this.Pe = void 0;
        if (null != t) {
            if (!this.O.multiple) throw new Error("AUR0654");
            (this.Pe = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    qe(t) {
        this.syncOptions();
        const e = this.syncValue();
        if (e) this.queue.add(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.O, this);
            this.Le();
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.handler.dispose();
            this.Ue();
        }
    }
    flush() {
        Bi = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Bi, 0);
    }
}

i.subscriberCollection(SelectValueObserver);

i.withFlushQueue(SelectValueObserver);

function Ei(t) {
    const e = [];
    if (0 === t.length) return e;
    const s = t.length;
    let i = 0;
    let n;
    while (s > i) {
        n = t[i];
        if (n.selected) e[e.length] = Ai.call(n, "model") ? n.model : n.value;
        ++i;
    }
    return e;
}

let Bi;

const Ii = "--";

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
        if (0 === (256 & e)) this.Y();
    }
    Me(t) {
        const e = [];
        const s = /url\([^)]+$/;
        let i = 0;
        let n = "";
        let o;
        let r;
        let l;
        let h;
        while (i < t.length) {
            o = t.indexOf(";", i);
            if (-1 === o) o = t.length;
            n += t.substring(i, o);
            i = o + 1;
            if (s.test(n)) {
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
    Fe(t) {
        let e;
        let i;
        const n = [];
        for (i in t) {
            e = t[i];
            if (null == e) continue;
            if ("string" === typeof e) {
                if (i.startsWith(Ii)) {
                    n.push([ i, e ]);
                    continue;
                }
                n.push([ s.kebabCase(i), e ]);
                continue;
            }
            n.push(...this.Ve(e));
        }
        return n;
    }
    je(t) {
        const e = t.length;
        if (e > 0) {
            const s = [];
            let i = 0;
            for (;e > i; ++i) s.push(...this.Ve(t[i]));
            return s;
        }
        return s.emptyArray;
    }
    Ve(t) {
        if ("string" === typeof t) return this.Me(t);
        if (t instanceof Array) return this.je(t);
        if (t instanceof Object) return this.Fe(t);
        return s.emptyArray;
    }
    Y() {
        if (this.W) {
            this.W = false;
            const t = this.value;
            const e = this.styles;
            const s = this.Ve(t);
            let i;
            let n = this.version;
            this.ov = t;
            let o;
            let r;
            let l;
            let h = 0;
            const c = s.length;
            for (;h < c; ++h) {
                o = s[h];
                r = o[0];
                l = o[1];
                this.setProperty(r, l);
                e[r] = n;
            }
            this.styles = e;
            this.version += 1;
            if (0 === n) return;
            n -= 1;
            for (i in e) {
                if (!Object.prototype.hasOwnProperty.call(e, i) || e[i] !== n) continue;
                this.obj.style.removeProperty(i);
            }
        }
    }
    setProperty(t, e) {
        let s = "";
        if (null != e && "function" === typeof e.indexOf && e.includes("!important")) {
            s = "important";
            e = e.replace("!important", "");
        }
        this.obj.style.setProperty(t, e, s);
    }
    bind(t) {
        this.value = this.ov = this.obj.style.cssText;
    }
}

class ValueAttributeObserver {
    constructor(t, e, s) {
        this.handler = s;
        this.type = 2 | 1 | 4;
        this.v = "";
        this.ov = "";
        this.W = false;
        this.O = t;
        this.K = e;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        if (Object.is(t, this.v)) return;
        this.ov = this.v;
        this.v = t;
        this.W = true;
        if (!this.handler.config.readonly && 0 === (256 & e)) this.Y(e);
    }
    Y(t) {
        var e;
        if (this.W) {
            this.W = false;
            this.O[this.K] = null !== (e = this.v) && void 0 !== e ? e : this.handler.config.default;
            if (0 === (2 & t)) this.queue.add(this);
        }
    }
    handleEvent() {
        this.ov = this.v;
        this.v = this.O[this.K];
        if (this.ov !== this.v) {
            this.W = false;
            this.queue.add(this);
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.O, this);
            this.v = this.ov = this.O[this.K];
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.handler.dispose();
    }
    flush() {
        Ti = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Ti, 0);
    }
}

i.subscriberCollection(ValueAttributeObserver);

i.withFlushQueue(ValueAttributeObserver);

let Ti;

const Di = "http://www.w3.org/1999/xlink";

const Pi = "http://www.w3.org/XML/1998/namespace";

const $i = "http://www.w3.org/2000/xmlns/";

const Oi = Object.assign(D(), {
    "xlink:actuate": [ "actuate", Di ],
    "xlink:arcrole": [ "arcrole", Di ],
    "xlink:href": [ "href", Di ],
    "xlink:role": [ "role", Di ],
    "xlink:show": [ "show", Di ],
    "xlink:title": [ "title", Di ],
    "xlink:type": [ "type", Di ],
    "xml:lang": [ "lang", Pi ],
    "xml:space": [ "space", Pi ],
    xmlns: [ "xmlns", $i ],
    "xmlns:xlink": [ "xlink", $i ]
});

const Li = new i.PropertyAccessor;

Li.type = 2 | 4;

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
    constructor(t, e, s, i) {
        this.locator = t;
        this.platform = e;
        this.dirtyChecker = s;
        this.svgAnalyzer = i;
        this.allowDirtyCheck = true;
        this._e = D();
        this.Ne = D();
        this.We = D();
        this.He = D();
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
        s.Registration.aliasTo(i.INodeObserverLocator, NodeObserverLocator).register(t);
        s.Registration.singleton(i.INodeObserverLocator, NodeObserverLocator).register(t);
    }
    handles(t, e) {
        return t instanceof this.platform.Node;
    }
    useConfig(t, e, s) {
        var i, n;
        const o = this._e;
        let r;
        if ("string" === typeof t) {
            r = null !== (i = o[t]) && void 0 !== i ? i : o[t] = D();
            if (null == r[e]) r[e] = new NodeObserverConfig(s); else Ui(t, e);
        } else for (const s in t) {
            r = null !== (n = o[s]) && void 0 !== n ? n : o[s] = D();
            const i = t[s];
            for (e in i) if (null == r[e]) r[e] = new NodeObserverConfig(i[e]); else Ui(s, e);
        }
    }
    useConfigGlobal(t, e) {
        const s = this.Ne;
        if ("object" === typeof t) for (const e in t) if (null == s[e]) s[e] = new NodeObserverConfig(t[e]); else Ui("*", e); else if (null == s[t]) s[t] = new NodeObserverConfig(e); else Ui("*", t);
    }
    getAccessor(t, e, i) {
        var n;
        if (e in this.He || e in (null !== (n = this.We[t.tagName]) && void 0 !== n ? n : s.emptyObject)) return this.getObserver(t, e, i);
        switch (e) {
          case "src":
          case "href":
          case "role":
            return wi;

          default:
            {
                const s = Oi[e];
                if (void 0 !== s) return AttributeNSAccessor.forNs(s[1]);
                if (O(t, e, this.svgAnalyzer)) return wi;
                return Li;
            }
        }
    }
    overrideAccessor(t, e) {
        var s, i;
        var n, o;
        let r;
        if ("string" === typeof t) {
            r = null !== (s = (n = this.We)[t]) && void 0 !== s ? s : n[t] = D();
            r[e] = true;
        } else for (const e in t) for (const s of t[e]) {
            r = null !== (i = (o = this.We)[e]) && void 0 !== i ? i : o[e] = D();
            r[s] = true;
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) this.He[e] = true;
    }
    getObserver(t, e, s) {
        var n, o;
        switch (e) {
          case "role":
            return wi;

          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const r = null !== (o = null === (n = this._e[t.tagName]) || void 0 === n ? void 0 : n[e]) && void 0 !== o ? o : this.Ne[e];
        if (null != r) return new r.type(t, e, new EventSubscriber(r), s, this.locator);
        const l = Oi[e];
        if (void 0 !== l) return AttributeNSAccessor.forNs(l[1]);
        if (O(t, e, this.svgAnalyzer)) return wi;
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) return this.dirtyChecker.createProperty(t, e);
            throw new Error(`AUR0652:${String(e)}`);
        } else return new i.SetterObserver(t, e);
    }
}

NodeObserverLocator.inject = [ s.IServiceLocator, L, i.IDirtyChecker, q ];

function qi(t, e) {
    if (t instanceof Array) return e.getArrayObserver(t);
    if (t instanceof Map) return e.getMapObserver(t);
    if (t instanceof Set) return e.getSetObserver(t);
}

function Ui(t, e) {
    throw new Error(`AUR0653:${String(e)}@${t}`);
}

class UpdateTriggerBindingBehavior {
    constructor(t) {
        this.oL = t;
    }
    bind(t, e, s, ...n) {
        if (0 === n.length) throw new Error(`AUR0802`);
        if (s.mode !== i.BindingMode.twoWay && s.mode !== i.BindingMode.fromView) throw new Error("AUR0803");
        const o = this.oL.getObserver(s.target, s.targetProperty);
        if (!o.handler) throw new Error("AUR0804");
        s.targetObserver = o;
        const r = o.handler;
        o.originalHandler = r;
        o.handler = new EventSubscriber(new NodeObserverConfig({
            default: r.config.default,
            events: n,
            readonly: r.config.readonly
        }));
    }
    unbind(t, e, s) {
        s.targetObserver.handler.dispose();
        s.targetObserver.handler = s.targetObserver.originalHandler;
        s.targetObserver.originalHandler = null;
    }
}

UpdateTriggerBindingBehavior.inject = [ i.IObserverLocator ];

i.bindingBehavior("updateTrigger")(UpdateTriggerBindingBehavior);

exports.Focus = class Focus {
    constructor(t, e) {
        this.ze = t;
        this.p = e;
        this.Ge = false;
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) this.apply(); else this.Ge = true;
    }
    attached() {
        if (this.Ge) {
            this.Ge = false;
            this.apply();
        }
        const t = this.ze;
        t.addEventListener("focus", this);
        t.addEventListener("blur", this);
    }
    afterDetachChildren() {
        const t = this.ze;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if ("focus" === t.type) this.value = true; else if (!this.isElFocused) this.value = false;
    }
    apply() {
        const t = this.ze;
        const e = this.isElFocused;
        const s = this.value;
        if (s && !e) t.focus(); else if (!s && e) t.blur();
    }
    get isElFocused() {
        return this.ze === this.p.document.activeElement;
    }
};

n([ m({
    mode: i.BindingMode.twoWay
}) ], exports.Focus.prototype, "value", void 0);

exports.Focus = n([ o(0, Ne), o(1, L) ], exports.Focus);

gt("focus")(exports.Focus);

let Mi = class Show {
    constructor(t, e, s) {
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
        this.isToggled = this.base = "hide" !== s.alias;
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

n([ m ], Mi.prototype, "value", void 0);

Mi = n([ o(0, Ne), o(1, L), o(2, os) ], Mi);

i.alias("hide")(Mi);

gt("show")(Mi);

class Portal {
    constructor(t, e, i) {
        this.id = s.nextId("au$component");
        this.strict = false;
        this.p = i;
        this.Xe = i.document.createElement("div");
        this.view = t.create();
        Xe(this.view.nodes, e);
    }
    attaching(t, e, s) {
        if (null == this.callbackContext) this.callbackContext = this.$controller.scope.bindingContext;
        const i = this.Xe = this.Ke();
        this.view.setHost(i);
        return this.Ye(t, i, s);
    }
    detaching(t, e, s) {
        return this.Ze(t, this.Xe, s);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) return;
        const e = this.Xe;
        const i = this.Xe = this.Ke();
        if (e === i) return;
        this.view.setHost(i);
        const n = s.onResolve(this.Ze(null, i, t.flags), (() => this.Ye(null, i, t.flags)));
        if (n instanceof Promise) n.catch((t => {
            throw t;
        }));
    }
    Ye(t, e, i) {
        const {activating: n, callbackContext: o, view: r} = this;
        r.setHost(e);
        return s.onResolve(null === n || void 0 === n ? void 0 : n.call(o, e, r), (() => this.Je(t, e, i)));
    }
    Je(t, e, i) {
        const {$controller: n, view: o} = this;
        if (null === t) o.nodes.appendTo(e); else return s.onResolve(o.activate(null !== t && void 0 !== t ? t : o, n, i, n.scope), (() => this.Qe(e)));
        return this.Qe(e);
    }
    Qe(t) {
        const {activated: e, callbackContext: s, view: i} = this;
        return null === e || void 0 === e ? void 0 : e.call(s, t, i);
    }
    Ze(t, e, i) {
        const {deactivating: n, callbackContext: o, view: r} = this;
        return s.onResolve(null === n || void 0 === n ? void 0 : n.call(o, e, r), (() => this.ts(t, e, i)));
    }
    ts(t, e, i) {
        const {$controller: n, view: o} = this;
        if (null === t) o.nodes.remove(); else return s.onResolve(o.deactivate(t, n, i), (() => this.es(e)));
        return this.es(e);
    }
    es(t) {
        const {deactivated: e, callbackContext: s, view: i} = this;
        return null === e || void 0 === e ? void 0 : e.call(s, t, i);
    }
    Ke() {
        const t = this.p;
        const e = t.document;
        let s = this.target;
        let i = this.renderContext;
        if ("" === s) {
            if (this.strict) throw new Error("AUR0811");
            return e.body;
        }
        if ("string" === typeof s) {
            let n = e;
            if ("string" === typeof i) i = e.querySelector(i);
            if (i instanceof t.Node) n = i;
            s = n.querySelector(s);
        }
        if (s instanceof t.Node) return s;
        if (null == s) {
            if (this.strict) throw new Error("AUR0812");
            return e.body;
        }
        return s;
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

Portal.inject = [ ae, He, L ];

n([ m({
    primary: true
}) ], Portal.prototype, "target", void 0);

n([ m({
    callback: "targetChanged"
}) ], Portal.prototype, "renderContext", void 0);

n([ m() ], Portal.prototype, "strict", void 0);

n([ m() ], Portal.prototype, "deactivating", void 0);

n([ m() ], Portal.prototype, "activating", void 0);

n([ m() ], Portal.prototype, "deactivated", void 0);

n([ m() ], Portal.prototype, "activated", void 0);

n([ m() ], Portal.prototype, "callbackContext", void 0);

wt("portal")(Portal);

class FlagsTemplateController {
    constructor(t, e, i) {
        this.factory = t;
        this.flags = i;
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    attaching(t, e, s) {
        const {$controller: i} = this;
        return this.view.activate(t, i, s | this.flags, i.scope);
    }
    detaching(t, e, s) {
        return this.view.deactivate(t, this.$controller, s);
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

FrequentMutations.inject = [ ae, He ];

class ObserveShallow extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 128);
    }
}

ObserveShallow.inject = [ ae, He ];

wt("frequent-mutations")(FrequentMutations);

wt("observe-shallow")(ObserveShallow);

class If {
    constructor(t, e, i) {
        this.ifFactory = t;
        this.location = e;
        this.work = i;
        this.id = s.nextId("au$component");
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        this.cache = true;
        this.pending = void 0;
        this.ss = false;
        this.os = 0;
    }
    attaching(t, e, i) {
        let n;
        const o = this.$controller;
        const r = this.os++;
        const l = () => !this.ss && this.os === r + 1;
        return s.onResolve(this.pending, (() => {
            var e;
            if (!l()) return;
            this.pending = void 0;
            if (this.value) n = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(); else n = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create();
            if (null == n) return;
            n.setLocation(this.location);
            this.pending = s.onResolve(n.activate(t, o, i, o.scope), (() => {
                if (l()) this.pending = void 0;
            }));
        }));
    }
    detaching(t, e, i) {
        this.ss = true;
        return s.onResolve(this.pending, (() => {
            var e;
            this.ss = false;
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
        const n = this.view;
        const o = this.$controller;
        const r = this.os++;
        const l = () => !this.ss && this.os === r + 1;
        let h;
        return s.onResolve(s.onResolve(this.pending, (() => this.pending = s.onResolve(null === n || void 0 === n ? void 0 : n.deactivate(n, o, i), (() => {
            var e;
            if (!l()) return;
            if (t) h = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(); else h = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create();
            if (null == h) return;
            h.setLocation(this.location);
            return s.onResolve(h.activate(h, o, i, o.scope), (() => {
                if (l()) this.pending = void 0;
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

If.inject = [ ae, He, Ve ];

n([ m ], If.prototype, "value", void 0);

n([ m({
    set: t => "" === t || !!t && "false" !== t
}) ], If.prototype, "cache", void 0);

wt("if")(If);

class Else {
    constructor(t) {
        this.factory = t;
        this.id = s.nextId("au$component");
    }
    link(t, e, s, i) {
        const n = t.children;
        const o = n[n.length - 1];
        if (o instanceof If) o.elseFactory = this.factory; else if (o.viewModel instanceof If) o.viewModel.elseFactory = this.factory; else throw new Error("AUR0810");
    }
}

Else.inject = [ ae ];

wt({
    name: "else"
})(Else);

function Fi(t) {
    t.dispose();
}

class Repeat {
    constructor(t, e, i) {
        this.location = t;
        this.parent = e;
        this.factory = i;
        this.id = s.nextId("au$component");
        this.ls = void 0;
        this.views = [];
        this.key = void 0;
        this.hs = void 0;
    }
    binding(t, e, s) {
        this.cs(s);
        const i = this.parent.bindings;
        const n = i.length;
        let o;
        let r = 0;
        for (;n > r; ++r) {
            o = i[r];
            if (o.target === this && "items" === o.targetProperty) {
                this.forOf = o.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(s, this.$controller.scope, o.locator, null);
    }
    attaching(t, e, s) {
        this.us(s);
        return this.fs(t, s);
    }
    detaching(t, e, s) {
        this.cs(s);
        return this.ds(t, s);
    }
    itemsChanged(t) {
        const {$controller: e} = this;
        if (!e.isActive) return;
        t |= e.flags;
        this.cs(t);
        this.us(t);
        const i = s.onResolve(this.ds(null, t), (() => this.fs(null, t)));
        if (i instanceof Promise) i.catch((t => {
            throw t;
        }));
    }
    handleCollectionChange(t, e) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        e |= n.flags;
        this.us(e);
        if (void 0 === t) {
            const t = s.onResolve(this.ds(null, e), (() => this.fs(null, e)));
            if (t instanceof Promise) t.catch((t => {
                throw t;
            }));
        } else {
            const n = this.views.length;
            i.applyMutationsToIndices(t);
            if (t.deletedItems.length > 0) {
                t.deletedItems.sort(s.compareNumber);
                const i = s.onResolve(this.ps(t, e), (() => this.xs(n, t, e)));
                if (i instanceof Promise) i.catch((t => {
                    throw t;
                }));
            } else this.xs(n, t, e);
        }
    }
    cs(t) {
        const e = this.ls;
        if (4 & t) {
            if (void 0 !== e) e.unsubscribe(this);
        } else if (this.$controller.isActive) {
            const t = this.ls = i.getCollectionObserver(this.items);
            if (e !== t && e) e.unsubscribe(this);
            if (t) t.subscribe(this);
        }
    }
    us(t) {
        const e = this.items;
        if (e instanceof Array) {
            this.hs = e;
            return;
        }
        const s = this.forOf;
        if (void 0 === s) return;
        const i = [];
        this.forOf.iterate(t, e, ((t, e, s) => {
            i[e] = s;
        }));
        this.hs = i;
    }
    fs(t, e) {
        let s;
        let n;
        let o;
        let r;
        const {$controller: l, factory: h, local: c, location: a, items: u} = this;
        const f = l.scope;
        const d = this.forOf.count(e, u);
        const p = this.views = Array(d);
        this.forOf.iterate(e, u, ((u, x, m) => {
            o = p[x] = h.create().setLocation(a);
            o.nodes.unlink();
            r = i.Scope.fromParent(f, i.BindingContext.create(c, m));
            Wi(r.overrideContext, x, d);
            n = o.activate(null !== t && void 0 !== t ? t : o, l, e, r);
            if (n instanceof Promise) (null !== s && void 0 !== s ? s : s = []).push(n);
        }));
        if (void 0 !== s) return 1 === s.length ? s[0] : Promise.all(s);
    }
    ds(t, e) {
        let s;
        let i;
        let n;
        let o = 0;
        const {views: r, $controller: l} = this;
        const h = r.length;
        for (;h > o; ++o) {
            n = r[o];
            n.release();
            i = n.deactivate(null !== t && void 0 !== t ? t : n, l, e);
            if (i instanceof Promise) (null !== s && void 0 !== s ? s : s = []).push(i);
        }
        if (void 0 !== s) return 1 === s.length ? s[0] : Promise.all(s);
    }
    ps(t, e) {
        let s;
        let i;
        let n;
        const {$controller: o, views: r} = this;
        const l = t.deletedItems;
        const h = l.length;
        let c = 0;
        for (;h > c; ++c) {
            n = r[l[c]];
            n.release();
            i = n.deactivate(n, o, e);
            if (i instanceof Promise) (null !== s && void 0 !== s ? s : s = []).push(i);
        }
        c = 0;
        let a = 0;
        for (;h > c; ++c) {
            a = l[c] - c;
            r.splice(a, 1);
        }
        if (void 0 !== s) return 1 === s.length ? s[0] : Promise.all(s);
    }
    xs(t, e, s) {
        var n;
        let o;
        let r;
        let l;
        let h;
        let c = 0;
        const {$controller: a, factory: u, local: f, hs: d, location: p, views: x} = this;
        const m = e.length;
        for (;m > c; ++c) if (-2 === e[c]) {
            l = u.create();
            x.splice(c, 0, l);
        }
        if (x.length !== m) throw new Error(`AUR0814:${x.length}!=${m}`);
        const v = a.scope;
        const g = e.length;
        i.synchronizeIndices(x, e);
        const w = Ni(e);
        const b = w.length;
        let y;
        let k = b - 1;
        c = g - 1;
        for (;c >= 0; --c) {
            l = x[c];
            y = x[c + 1];
            l.nodes.link(null !== (n = null === y || void 0 === y ? void 0 : y.nodes) && void 0 !== n ? n : p);
            if (-2 === e[c]) {
                h = i.Scope.fromParent(v, i.BindingContext.create(f, d[c]));
                Wi(h.overrideContext, c, g);
                l.setLocation(p);
                r = l.activate(l, a, s, h);
                if (r instanceof Promise) (null !== o && void 0 !== o ? o : o = []).push(r);
            } else if (k < 0 || 1 === b || c !== w[k]) {
                Wi(l.scope.overrideContext, c, g);
                l.nodes.insertBefore(l.location);
            } else {
                if (t !== g) Wi(l.scope.overrideContext, c, g);
                --k;
            }
        }
        if (void 0 !== o) return 1 === o.length ? o[0] : Promise.all(o);
    }
    dispose() {
        this.views.forEach(Fi);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (void 0 !== e) for (let s = 0, i = e.length; s < i; ++s) if (true === e[s].accept(t)) return true;
    }
}

Repeat.inject = [ He, $e, ae ];

n([ m ], Repeat.prototype, "items", void 0);

wt("repeat")(Repeat);

let Vi = 16;

let ji = new Int32Array(Vi);

let _i = new Int32Array(Vi);

function Ni(t) {
    const e = t.length;
    if (e > Vi) {
        Vi = e;
        ji = new Int32Array(e);
        _i = new Int32Array(e);
    }
    let s = 0;
    let i = 0;
    let n = 0;
    let o = 0;
    let r = 0;
    let l = 0;
    let h = 0;
    let c = 0;
    for (;o < e; o++) {
        i = t[o];
        if (-2 !== i) {
            r = ji[s];
            n = t[r];
            if (-2 !== n && n < i) {
                _i[o] = r;
                ji[++s] = o;
                continue;
            }
            l = 0;
            h = s;
            while (l < h) {
                c = l + h >> 1;
                n = t[ji[c]];
                if (-2 !== n && n < i) l = c + 1; else h = c;
            }
            n = t[ji[l]];
            if (i < n || -2 === n) {
                if (l > 0) _i[o] = ji[l - 1];
                ji[l] = o;
            }
        }
    }
    o = ++s;
    const a = new Int32Array(o);
    i = ji[s - 1];
    while (s-- > 0) {
        a[s] = i;
        i = _i[i];
    }
    while (o-- > 0) ji[o] = 0;
    return a;
}

function Wi(t, e, s) {
    const i = 0 === e;
    const n = e === s - 1;
    const o = e % 2 === 0;
    t.$index = e;
    t.$first = i;
    t.$last = n;
    t.$middle = !i && !n;
    t.$even = o;
    t.$odd = !o;
    t.$length = s;
}

class With {
    constructor(t, e) {
        this.factory = t;
        this.location = e;
        this.id = s.nextId("au$component");
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    valueChanged(t, e, s) {
        const n = this.$controller;
        const o = this.view.bindings;
        let r;
        let l = 0, h = 0;
        if (n.isActive && null != o) {
            r = i.Scope.fromParent(n.scope, void 0 === t ? {} : t);
            for (h = o.length; h > l; ++l) o[l].$bind(2, r);
        }
    }
    attaching(t, e, s) {
        const {$controller: n, value: o} = this;
        const r = i.Scope.fromParent(n.scope, void 0 === o ? {} : o);
        return this.view.activate(t, n, s, r);
    }
    detaching(t, e, s) {
        return this.view.deactivate(t, this.$controller, s);
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

With.inject = [ ae, He ];

n([ m ], With.prototype, "value", void 0);

wt("with")(With);

exports.Switch = class Switch {
    constructor(t, e) {
        this.factory = t;
        this.location = e;
        this.id = s.nextId("au$component");
        this.cases = [];
        this.activeCases = [];
        this.promise = void 0;
    }
    link(t, e, s, i) {
        this.view = this.factory.create(this.$controller).setLocation(this.location);
    }
    attaching(t, e, s) {
        const i = this.view;
        const n = this.$controller;
        this.queue((() => i.activate(t, n, s, n.scope)));
        this.queue((() => this.swap(t, s, this.value)));
        return this.promise;
    }
    detaching(t, e, s) {
        this.queue((() => {
            const e = this.view;
            return e.deactivate(t, this.$controller, s);
        }));
        return this.promise;
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
    valueChanged(t, e, s) {
        if (!this.$controller.isActive) return;
        this.queue((() => this.swap(null, s, this.value)));
    }
    caseChanged(t, e) {
        this.queue((() => this.handleCaseChange(t, e)));
    }
    handleCaseChange(t, e) {
        const i = t.isMatch(this.value, e);
        const n = this.activeCases;
        const o = n.length;
        if (!i) {
            if (o > 0 && n[0].id === t.id) return this.clearActiveCases(null, e);
            return;
        }
        if (o > 0 && n[0].id < t.id) return;
        const r = [];
        let l = t.fallThrough;
        if (!l) r.push(t); else {
            const e = this.cases;
            const s = e.indexOf(t);
            for (let t = s, i = e.length; t < i && l; t++) {
                const s = e[t];
                r.push(s);
                l = s.fallThrough;
            }
        }
        return s.onResolve(this.clearActiveCases(null, e, r), (() => {
            this.activeCases = r;
            return this.activateCases(null, e);
        }));
    }
    swap(t, e, i) {
        const n = [];
        let o = false;
        for (const t of this.cases) {
            if (o || t.isMatch(i, e)) {
                n.push(t);
                o = t.fallThrough;
            }
            if (n.length > 0 && !o) break;
        }
        const r = this.defaultCase;
        if (0 === n.length && void 0 !== r) n.push(r);
        return s.onResolve(this.activeCases.length > 0 ? this.clearActiveCases(t, e, n) : void 0, (() => {
            this.activeCases = n;
            if (0 === n.length) return;
            return this.activateCases(t, e);
        }));
    }
    activateCases(t, e) {
        const i = this.$controller;
        if (!i.isActive) return;
        const n = this.activeCases;
        const o = n.length;
        if (0 === o) return;
        const r = i.scope;
        if (1 === o) return n[0].activate(t, e, r);
        return s.resolveAll(...n.map((s => s.activate(t, e, r))));
    }
    clearActiveCases(t, e, i = []) {
        const n = this.activeCases;
        const o = n.length;
        if (0 === o) return;
        if (1 === o) {
            const s = n[0];
            if (!i.includes(s)) {
                n.length = 0;
                return s.deactivate(t, e);
            }
            return;
        }
        return s.onResolve(s.resolveAll(...n.reduce(((s, n) => {
            if (!i.includes(n)) s.push(n.deactivate(t, e));
            return s;
        }), [])), (() => {
            n.length = 0;
        }));
    }
    queue(t) {
        const e = this.promise;
        let i;
        i = this.promise = s.onResolve(s.onResolve(e, t), (() => {
            if (this.promise === i) this.promise = void 0;
        }));
    }
    accept(t) {
        if (true === this.$controller.accept(t)) return true;
        if (this.activeCases.some((e => e.accept(t)))) return true;
    }
};

n([ m ], exports.Switch.prototype, "value", void 0);

exports.Switch = n([ wt("switch"), o(0, ae), o(1, He) ], exports.Switch);

exports.Case = class Case {
    constructor(t, e, i, n) {
        this.factory = t;
        this.locator = e;
        this.id = s.nextId("au$component");
        this.fallThrough = false;
        this.debug = n.config.level <= 1;
        this.logger = n.scopeTo(`${this.constructor.name}-#${this.id}`);
        this.view = this.factory.create().setLocation(i);
    }
    link(t, e, s, i) {
        const n = t.parent;
        const o = null === n || void 0 === n ? void 0 : n.viewModel;
        if (o instanceof exports.Switch) {
            this.$switch = o;
            this.linkToSwitch(o);
        } else throw new Error("AUR0815");
    }
    detaching(t, e, s) {
        return this.deactivate(t, s);
    }
    isMatch(t, e) {
        if (this.debug) this.logger.debug("isMatch()");
        const s = this.value;
        if (Array.isArray(s)) {
            if (void 0 === this.observer) this.observer = this.observeCollection(e, s);
            return s.includes(t);
        }
        return s === t;
    }
    valueChanged(t, e, s) {
        var i;
        if (Array.isArray(t)) {
            null === (i = this.observer) || void 0 === i ? void 0 : i.unsubscribe(this);
            this.observer = this.observeCollection(s, t);
        } else if (void 0 !== this.observer) this.observer.unsubscribe(this);
        this.$switch.caseChanged(this, s);
    }
    handleCollectionChange(t, e) {
        this.$switch.caseChanged(this, e);
    }
    activate(t, e, s) {
        const i = this.view;
        if (i.isActive) return;
        return i.activate(null !== t && void 0 !== t ? t : i, this.$controller, e, s);
    }
    deactivate(t, e) {
        const s = this.view;
        if (!s.isActive) return;
        return s.deactivate(null !== t && void 0 !== t ? t : s, this.$controller, e);
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
        const s = this.locator.getArrayObserver(e);
        s.subscribe(this);
        return s;
    }
    accept(t) {
        var e;
        if (true === this.$controller.accept(t)) return true;
        return null === (e = this.view) || void 0 === e ? void 0 : e.accept(t);
    }
};

n([ m ], exports.Case.prototype, "value", void 0);

n([ m({
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
    mode: i.BindingMode.oneTime
}) ], exports.Case.prototype, "fallThrough", void 0);

exports.Case = n([ wt("case"), o(0, ae), o(1, i.IObserverLocator), o(2, He), o(3, s.ILogger) ], exports.Case);

exports.DefaultCase = class DefaultCase extends exports.Case {
    linkToSwitch(t) {
        if (void 0 !== t.defaultCase) throw new Error("AUR0816");
        t.defaultCase = this;
    }
};

exports.DefaultCase = n([ wt("default-case") ], exports.DefaultCase);

exports.PromiseTemplateController = class PromiseTemplateController {
    constructor(t, e, i, n) {
        this.factory = t;
        this.location = e;
        this.platform = i;
        this.id = s.nextId("au$component");
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.logger = n.scopeTo("promise.resolve");
    }
    link(t, e, s, i) {
        this.view = this.factory.create(this.$controller).setLocation(this.location);
    }
    attaching(t, e, n) {
        const o = this.view;
        const r = this.$controller;
        return s.onResolve(o.activate(t, r, n, this.viewScope = i.Scope.fromParent(r.scope, {})), (() => this.swap(t, n)));
    }
    valueChanged(t, e, s) {
        if (!this.$controller.isActive) return;
        this.swap(null, s);
    }
    swap(t, e) {
        var i, n;
        const o = this.value;
        if (!(o instanceof Promise)) {
            this.logger.warn(`The value '${String(o)}' is not a promise. No change will be done.`);
            return;
        }
        const r = this.platform.domWriteQueue;
        const l = this.fulfilled;
        const h = this.rejected;
        const c = this.pending;
        const a = this.viewScope;
        let u;
        const f = {
            reusable: false
        };
        const d = () => {
            void s.resolveAll(u = (this.preSettledTask = r.queueTask((() => s.resolveAll(null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === c || void 0 === c ? void 0 : c.activate(t, e, a))), f)).result, o.then((i => {
                if (this.value !== o) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = r.queueTask((() => s.resolveAll(null === c || void 0 === c ? void 0 : c.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === l || void 0 === l ? void 0 : l.activate(t, e, a, i))), f)).result;
                };
                if (1 === this.preSettledTask.status) void u.then(n); else {
                    this.preSettledTask.cancel();
                    n();
                }
            }), (i => {
                if (this.value !== o) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = r.queueTask((() => s.resolveAll(null === c || void 0 === c ? void 0 : c.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.activate(t, e, a, i))), f)).result;
                };
                if (1 === this.preSettledTask.status) void u.then(n); else {
                    this.preSettledTask.cancel();
                    n();
                }
            })));
        };
        if (1 === (null === (i = this.postSettledTask) || void 0 === i ? void 0 : i.status)) void this.postSettlePromise.then(d); else {
            null === (n = this.postSettledTask) || void 0 === n ? void 0 : n.cancel();
            d();
        }
    }
    detaching(t, e, s) {
        var i, n;
        null === (i = this.preSettledTask) || void 0 === i ? void 0 : i.cancel();
        null === (n = this.postSettledTask) || void 0 === n ? void 0 : n.cancel();
        this.preSettledTask = this.postSettledTask = null;
        return this.view.deactivate(t, this.$controller, s);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

n([ m ], exports.PromiseTemplateController.prototype, "value", void 0);

exports.PromiseTemplateController = n([ wt("promise"), o(0, ae), o(1, He), o(2, L), o(3, s.ILogger) ], exports.PromiseTemplateController);

exports.PendingTemplateController = class PendingTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, s, i) {
        Hi(t).pending = this;
    }
    activate(t, e, s) {
        const i = this.view;
        if (i.isActive) return;
        return i.activate(i, this.$controller, e, s);
    }
    deactivate(t, e) {
        const s = this.view;
        if (!s.isActive) return;
        return s.deactivate(s, this.$controller, e);
    }
    detaching(t, e, s) {
        return this.deactivate(t, s);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

n([ m({
    mode: i.BindingMode.toView
}) ], exports.PendingTemplateController.prototype, "value", void 0);

exports.PendingTemplateController = n([ wt("pending"), o(0, ae), o(1, He) ], exports.PendingTemplateController);

exports.FulfilledTemplateController = class FulfilledTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, s, i) {
        Hi(t).fulfilled = this;
    }
    activate(t, e, s, i) {
        this.value = i;
        const n = this.view;
        if (n.isActive) return;
        return n.activate(n, this.$controller, e, s);
    }
    deactivate(t, e) {
        const s = this.view;
        if (!s.isActive) return;
        return s.deactivate(s, this.$controller, e);
    }
    detaching(t, e, s) {
        return this.deactivate(t, s);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

n([ m({
    mode: i.BindingMode.toView
}) ], exports.FulfilledTemplateController.prototype, "value", void 0);

exports.FulfilledTemplateController = n([ wt("then"), o(0, ae), o(1, He) ], exports.FulfilledTemplateController);

exports.RejectedTemplateController = class RejectedTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, s, i) {
        Hi(t).rejected = this;
    }
    activate(t, e, s, i) {
        this.value = i;
        const n = this.view;
        if (n.isActive) return;
        return n.activate(n, this.$controller, e, s);
    }
    deactivate(t, e) {
        const s = this.view;
        if (!s.isActive) return;
        return s.deactivate(s, this.$controller, e);
    }
    detaching(t, e, s) {
        return this.deactivate(t, s);
    }
    dispose() {
        var t;
        null === (t = this.view) || void 0 === t ? void 0 : t.dispose();
        this.view = void 0;
    }
};

n([ m({
    mode: i.BindingMode.toView
}) ], exports.RejectedTemplateController.prototype, "value", void 0);

exports.RejectedTemplateController = n([ wt("catch"), o(0, ae), o(1, He) ], exports.RejectedTemplateController);

function Hi(t) {
    const e = t.parent;
    const s = null === e || void 0 === e ? void 0 : e.viewModel;
    if (s instanceof exports.PromiseTemplateController) return s;
    throw new Error("AUR0813");
}

let zi = class PromiseAttributePattern {
    "promise.resolve"(t, e, s) {
        return new AttrSyntax(t, e, "promise", "bind");
    }
};

zi = n([ S({
    pattern: "promise.resolve",
    symbols: ""
}) ], zi);

let Gi = class FulfilledAttributePattern {
    then(t, e, s) {
        return new AttrSyntax(t, e, "then", "from-view");
    }
};

Gi = n([ S({
    pattern: "then",
    symbols: ""
}) ], Gi);

let Xi = class RejectedAttributePattern {
    catch(t, e, s) {
        return new AttrSyntax(t, e, "catch", "from-view");
    }
};

Xi = n([ S({
    pattern: "catch",
    symbols: ""
}) ], Xi);

function Ki(t, e, s, i) {
    if ("string" === typeof e) return Yi(t, e, s, i);
    if (Nt.isType(e)) return Zi(t, e, s, i);
    throw new Error(`Invalid Tag or Type.`);
}

class RenderPlan {
    constructor(t, e, s) {
        this.node = t;
        this.instructions = e;
        this.dependencies = s;
        this.vs = void 0;
    }
    get definition() {
        if (void 0 === this.vs) this.vs = CustomElementDefinition.create({
            name: Nt.generateName(),
            template: this.node,
            needsCompile: "string" === typeof this.node,
            instructions: this.instructions,
            dependencies: this.dependencies
        });
        return this.vs;
    }
    createView(t) {
        return this.getViewFactory(t).create();
    }
    getViewFactory(t) {
        return t.root.get(ge).getViewFactory(this.definition, t.createChild().register(...this.dependencies));
    }
    mergeInto(t, e, s) {
        t.appendChild(this.node);
        e.push(...this.instructions);
        s.push(...this.dependencies);
    }
}

function Yi(t, e, s, i) {
    const n = [];
    const o = [];
    const r = [];
    const l = t.document.createElement(e);
    let h = false;
    if (s) Object.keys(s).forEach((t => {
        const e = s[t];
        if (rs(e)) {
            h = true;
            n.push(e);
        } else l.setAttribute(t, e);
    }));
    if (h) {
        l.className = "au";
        o.push(n);
    }
    if (i) Ji(t, l, i, o, r);
    return new RenderPlan(l, o, r);
}

function Zi(t, e, s, i) {
    const n = Nt.getDefinition(e);
    const o = [];
    const r = [ o ];
    const l = [];
    const h = [];
    const c = n.bindables;
    const a = t.document.createElement(n.name);
    a.className = "au";
    if (!l.includes(e)) l.push(e);
    o.push(new HydrateElementInstruction(n, void 0, h, null, false));
    if (s) Object.keys(s).forEach((t => {
        const e = s[t];
        if (rs(e)) h.push(e); else if (void 0 === c[t]) h.push(new SetAttributeInstruction(e, t)); else h.push(new SetPropertyInstruction(e, t));
    }));
    if (i) Ji(t, a, i, r, l);
    return new RenderPlan(a, r, l);
}

function Ji(t, e, s, i, n) {
    for (let o = 0, r = s.length; o < r; ++o) {
        const r = s[o];
        switch (typeof r) {
          case "string":
            e.appendChild(t.document.createTextNode(r));
            break;

          case "object":
            if (r instanceof t.Node) e.appendChild(r); else if ("mergeInto" in r) r.mergeInto(e, i, n);
        }
    }
}

function Qi(t, e) {
    const s = e.to;
    if (void 0 !== s && "subject" !== s && "composing" !== s) t[s] = e;
    return t;
}

exports.AuRender = class AuRender {
    constructor(t, e, i, n) {
        this.p = t;
        this.r = n;
        this.id = s.nextId("au$component");
        this.component = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.gs = e.props.reduce(Qi, {});
        this.ws = i;
    }
    attaching(t, e, s) {
        const {component: i, view: n} = this;
        if (void 0 === n || this.lastSubject !== i) {
            this.lastSubject = i;
            this.composing = true;
            return this.compose(void 0, i, t, s);
        }
        return this.compose(n, i, t, s);
    }
    detaching(t, e, s) {
        return this.ts(this.view, t, s);
    }
    componentChanged(t, e, i) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        if (this.lastSubject === t) return;
        this.lastSubject = t;
        this.composing = true;
        i |= n.flags;
        const o = s.onResolve(this.ts(this.view, null, i), (() => this.compose(void 0, t, null, i)));
        if (o instanceof Promise) o.catch((t => {
            throw t;
        }));
    }
    compose(t, e, i, n) {
        return s.onResolve(void 0 === t ? s.onResolve(e, (t => this.bs(t, n))) : t, (t => this.Je(this.view = t, i, n)));
    }
    ts(t, e, s) {
        return null === t || void 0 === t ? void 0 : t.deactivate(null !== e && void 0 !== e ? e : t, this.$controller, s);
    }
    Je(t, e, i) {
        const {$controller: n} = this;
        return s.onResolve(null === t || void 0 === t ? void 0 : t.activate(null !== e && void 0 !== e ? e : t, n, i, n.scope), (() => {
            this.composing = false;
        }));
    }
    bs(t, e) {
        const s = this.ys(t, e);
        if (s) {
            s.setLocation(this.$controller.location);
            s.lockScope(this.$controller.scope);
            return s;
        }
        return;
    }
    ys(t, e) {
        if (!t) return;
        const s = this.ws.controller.container;
        if ("object" === typeof t) {
            if (tn(t)) return t;
            if ("createView" in t) return t.createView(s);
            if ("create" in t) return t.create();
            if ("template" in t) return this.r.getViewFactory(CustomElementDefinition.getOrCreate(t), s).create();
        }
        if ("string" === typeof t) {
            const e = s.find(Nt, t);
            if (null == e) throw new Error(`AUR0809:${t}`);
            t = e.Type;
        }
        return Ki(this.p, t, this.gs, this.$controller.host.childNodes).createView(s);
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

n([ m ], exports.AuRender.prototype, "component", void 0);

n([ m({
    mode: i.BindingMode.fromView
}) ], exports.AuRender.prototype, "composing", void 0);

exports.AuRender = n([ Bt({
    name: "au-render",
    template: null,
    containerless: true
}), o(0, L), o(1, os), o(2, Oe), o(3, ge) ], exports.AuRender);

function tn(t) {
    return "lockScope" in t;
}

class AuCompose {
    constructor(t, e, s, i, n, o) {
        this.ctn = t;
        this.parent = e;
        this.host = s;
        this.p = i;
        this.scopeBehavior = "auto";
        this.c = void 0;
        this.loc = n.containerless ? Ke(this.host) : void 0;
        this.r = t.get(ge);
        this.ks = n;
        this.Cs = o;
    }
    static get inject() {
        return [ s.IContainer, $e, Ne, L, os, s.transient(CompositionContextFactory) ];
    }
    get pending() {
        return this.pd;
    }
    get composition() {
        return this.c;
    }
    attaching(t, e, i) {
        return this.pd = s.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, t, void 0)), (t => {
            if (this.Cs.isCurrent(t)) this.pd = void 0;
        }));
    }
    detaching(t) {
        const e = this.c;
        const i = this.pd;
        this.Cs.invalidate();
        this.c = this.pd = void 0;
        return s.onResolve(i, (() => null === e || void 0 === e ? void 0 : e.deactivate(t)));
    }
    propertyChanged(t) {
        if ("model" === t && null != this.c) {
            this.c.update(this.model);
            return;
        }
        this.pd = s.onResolve(this.pd, (() => s.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, t)), (t => {
            if (this.Cs.isCurrent(t)) this.pd = void 0;
        }))));
    }
    queue(t) {
        const e = this.Cs;
        const i = this.c;
        return s.onResolve(e.create(t), (n => {
            if (e.isCurrent(n)) return s.onResolve(this.compose(n), (o => {
                if (e.isCurrent(n)) return s.onResolve(o.activate(), (() => {
                    if (e.isCurrent(n)) {
                        this.c = o;
                        return s.onResolve(null === i || void 0 === i ? void 0 : i.deactivate(t.initiator), (() => n));
                    } else return s.onResolve(o.controller.deactivate(o.controller, this.$controller, 4), (() => {
                        o.controller.dispose();
                        return n;
                    }));
                }));
                o.controller.dispose();
                return n;
            }));
            return n;
        }));
    }
    compose(t) {
        let e;
        let n;
        let o;
        const {view: r, viewModel: l, model: h, initiator: c} = t.change;
        const {ctn: a, host: u, $controller: f, loc: d} = this;
        const p = this.getDef(l);
        const x = a.createChild();
        const m = null == d ? u.parentNode : d.parentNode;
        if (null !== p) {
            if (p.containerless) throw new Error("AUR0806");
            if (null == d) {
                n = u;
                o = () => {};
            } else {
                n = m.insertBefore(this.p.document.createElement(p.name), d);
                o = () => {
                    n.remove();
                };
            }
            e = this.getVm(x, l, n);
        } else {
            n = null == d ? u : d;
            e = this.getVm(x, l, n);
        }
        const v = () => {
            if (null !== p) {
                const i = Controller.$el(x, e, n, null, p);
                return new CompositionController(i, (() => i.activate(null !== c && void 0 !== c ? c : i, f, 2)), (t => s.onResolve(i.deactivate(null !== t && void 0 !== t ? t : i, f, 4), o)), (t => {
                    var s;
                    return null === (s = e.activate) || void 0 === s ? void 0 : s.call(e, t);
                }), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: Nt.generateName(),
                    template: r
                });
                const o = this.r.getViewFactory(s, x);
                const l = Controller.$view(o, f);
                const h = "auto" === this.scopeBehavior ? i.Scope.fromParent(this.parent.scope, e) : i.Scope.create(e);
                if (Ye(n)) l.setLocation(n); else l.setHost(n);
                return new CompositionController(l, (() => l.activate(null !== c && void 0 !== c ? c : l, f, 2, h)), (t => l.deactivate(null !== t && void 0 !== t ? t : l, f, 4)), (t => {
                    var s;
                    return null === (s = e.activate) || void 0 === s ? void 0 : s.call(e, t);
                }), t);
            }
        };
        if ("activate" in e) return s.onResolve(e.activate(h), (() => v())); else return v();
    }
    getVm(t, e, i) {
        if (null == e) return new EmptyComponent$1;
        if ("object" === typeof e) return e;
        const n = this.p;
        const o = Ye(i);
        t.registerResolver(n.Element, t.registerResolver(Ne, new s.InstanceProvider("ElementResolver", o ? null : i)));
        t.registerResolver(He, new s.InstanceProvider("IRenderLocation", o ? i : null));
        const r = t.invoke(e);
        t.registerResolver(e, new s.InstanceProvider("au-compose.viewModel", r));
        return r;
    }
    getDef(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Nt.isType(e) ? Nt.getDefinition(e) : null;
    }
}

n([ m ], AuCompose.prototype, "view", void 0);

n([ m ], AuCompose.prototype, "viewModel", void 0);

n([ m ], AuCompose.prototype, "model", void 0);

n([ m({
    set: t => {
        if ("scoped" === t || "auto" === t) return t;
        throw new Error("AUR0805");
    }
}) ], AuCompose.prototype, "scopeBehavior", void 0);

Bt("au-compose")(AuCompose);

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
        return s.onResolve(t.load(), (t => new CompositionContext(this.id++, t)));
    }
    invalidate() {
        this.id++;
    }
}

class ChangeInfo {
    constructor(t, e, s, i, n) {
        this.view = t;
        this.viewModel = e;
        this.model = s;
        this.initiator = i;
        this.src = n;
    }
    load() {
        if (this.view instanceof Promise || this.viewModel instanceof Promise) return Promise.all([ this.view, this.viewModel ]).then((([t, e]) => new LoadedChangeInfo(t, e, this.model, this.initiator, this.src))); else return new LoadedChangeInfo(this.view, this.viewModel, this.model, this.initiator, this.src);
    }
}

class LoadedChangeInfo {
    constructor(t, e, s, i, n) {
        this.view = t;
        this.viewModel = e;
        this.model = s;
        this.initiator = i;
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
    constructor(t, e, s, i, n) {
        this.controller = t;
        this.start = e;
        this.stop = s;
        this.update = i;
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
    constructor(t, e, s, i) {
        var n, o;
        this.As = null;
        this.Rs = null;
        let r;
        const l = e.auSlot;
        const h = null === (o = null === (n = s.instruction) || void 0 === n ? void 0 : n.projections) || void 0 === o ? void 0 : o[l.name];
        if (null == h) {
            r = i.getViewFactory(l.fallback, s.controller.container);
            this.Ss = false;
        } else {
            r = i.getViewFactory(h, s.parent.controller.container);
            this.Ss = true;
        }
        this.ws = s;
        this.view = r.create().setLocation(t);
    }
    static get inject() {
        return [ He, os, Oe, ge ];
    }
    binding(t, e, s) {
        var n;
        this.As = this.$controller.scope.parentScope;
        let o;
        if (this.Ss) {
            o = this.ws.controller.scope.parentScope;
            (this.Rs = i.Scope.fromParent(o, o.bindingContext)).overrideContext.$host = null !== (n = this.expose) && void 0 !== n ? n : this.As.bindingContext;
        }
    }
    attaching(t, e, s) {
        return this.view.activate(t, this.$controller, s, this.Ss ? this.Rs : this.As);
    }
    detaching(t, e, s) {
        return this.view.deactivate(t, this.$controller, s);
    }
    exposeChanged(t) {
        if (this.Ss && null != this.Rs) this.Rs.overrideContext.$host = t;
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

n([ m ], AuSlot.prototype, "expose", void 0);

Bt({
    name: "au-slot",
    template: null,
    containerless: true
})(AuSlot);

const en = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const sn = s.DI.createInterface("ISanitizer", (t => t.singleton(class {
    sanitize(t) {
        return t.replace(en, "");
    }
})));

exports.SanitizeValueConverter = class SanitizeValueConverter {
    constructor(t) {
        this.sanitizer = t;
    }
    toView(t) {
        if (null == t) return null;
        return this.sanitizer.sanitize(t);
    }
};

exports.SanitizeValueConverter = n([ o(0, sn) ], exports.SanitizeValueConverter);

i.valueConverter("sanitize")(exports.SanitizeValueConverter);

exports.ViewValueConverter = class ViewValueConverter {
    constructor(t) {
        this.viewLocator = t;
    }
    toView(t, e) {
        return this.viewLocator.getViewComponentForObject(t, e);
    }
};

exports.ViewValueConverter = n([ o(0, ve) ], exports.ViewValueConverter);

i.valueConverter("view")(exports.ViewValueConverter);

const nn = DebounceBindingBehavior;

const on = OneTimeBindingBehavior;

const rn = ToViewBindingBehavior;

const ln = FromViewBindingBehavior;

const hn = SignalBindingBehavior;

const cn = ThrottleBindingBehavior;

const an = TwoWayBindingBehavior;

const un = TemplateCompiler;

const fn = NodeObserverLocator;

const dn = [ un, fn ];

const pn = SVGAnalyzer;

const xn = exports.AtPrefixedTriggerAttributePattern;

const mn = exports.ColonPrefixedBindAttributePattern;

const vn = exports.RefAttributePattern;

const gn = exports.DotSeparatedAttributePattern;

const wn = [ vn, gn ];

const bn = [ xn, mn ];

const yn = exports.CallBindingCommand;

const kn = exports.DefaultBindingCommand;

const Cn = exports.ForBindingCommand;

const An = exports.FromViewBindingCommand;

const Rn = exports.OneTimeBindingCommand;

const Sn = exports.ToViewBindingCommand;

const En = exports.TwoWayBindingCommand;

const Bn = Xs;

const In = exports.TriggerBindingCommand;

const Tn = exports.DelegateBindingCommand;

const Dn = exports.CaptureBindingCommand;

const Pn = exports.AttrBindingCommand;

const $n = exports.ClassBindingCommand;

const On = exports.StyleBindingCommand;

const Ln = [ kn, Rn, An, Sn, En, yn, Cn, Bn, In, Tn, Dn, $n, On, Pn ];

const qn = exports.SanitizeValueConverter;

const Un = exports.ViewValueConverter;

const Mn = FrequentMutations;

const Fn = ObserveShallow;

const Vn = If;

const jn = Else;

const _n = Repeat;

const Nn = With;

const Wn = exports.Switch;

const Hn = exports.Case;

const zn = exports.DefaultCase;

const Gn = exports.PromiseTemplateController;

const Xn = exports.PendingTemplateController;

const Kn = exports.FulfilledTemplateController;

const Yn = exports.RejectedTemplateController;

const Zn = zi;

const Jn = Gi;

const Qn = Xi;

const to = AttrBindingBehavior;

const eo = SelfBindingBehavior;

const so = UpdateTriggerBindingBehavior;

const io = exports.AuRender;

const no = AuCompose;

const oo = Portal;

const ro = exports.Focus;

const lo = Mi;

const ho = [ nn, on, rn, ln, hn, cn, an, qn, Un, Mn, Fn, Vn, jn, _n, Nn, Wn, Hn, zn, Gn, Xn, Kn, Yn, Zn, Jn, Qn, to, eo, so, io, no, oo, ro, lo, AuSlot ];

const co = gs;

const ao = xs;

const uo = ps;

const fo = bs;

const po = ks;

const xo = vs;

const mo = ys;

const vo = ws;

const go = ds;

const wo = ms;

const bo = Es;

const yo = Ps;

const ko = Bs;

const Co = Is;

const Ao = Ts;

const Ro = Ds;

const So = Ss;

const Eo = [ mo, po, co, vo, fo, go, uo, ao, wo, xo, bo, yo, ko, Co, Ao, Ro, So ];

const Bo = {
    register(t) {
        return t.register(...dn, ...ho, ...wn, ...Ln, ...Eo);
    },
    createContainer() {
        return this.register(s.DI.createContainer());
    }
};

const Io = s.DI.createInterface("IAurelia");

class Aurelia {
    constructor(t = s.DI.createContainer()) {
        this.container = t;
        this.R = false;
        this.Es = false;
        this.Bs = false;
        this.Is = void 0;
        this.next = void 0;
        this.Ts = void 0;
        this.Ds = void 0;
        if (t.has(Io, true)) throw new Error("AUR0768");
        t.registerResolver(Io, new s.InstanceProvider("IAurelia", this));
        t.registerResolver(Fe, this.Ps = new s.InstanceProvider("IAppRoot"));
    }
    get isRunning() {
        return this.R;
    }
    get isStarting() {
        return this.Es;
    }
    get isStopping() {
        return this.Bs;
    }
    get root() {
        if (null == this.Is) {
            if (null == this.next) throw new Error("AUR0767");
            return this.next;
        }
        return this.Is;
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.$s(t.host), this.container, this.Ps);
        return this;
    }
    enhance(t, e) {
        var i;
        const n = null !== (i = t.container) && void 0 !== i ? i : this.container.createChild();
        const o = t.host;
        const r = this.$s(o);
        const l = t.component;
        let h;
        if ("function" === typeof l) {
            n.registerResolver(r.HTMLElement, n.registerResolver(r.Element, n.registerResolver(Ne, new s.InstanceProvider("ElementResolver", o))));
            h = n.invoke(l);
        } else h = l;
        n.registerResolver(We, new s.InstanceProvider("IEventTarget", o));
        e = null !== e && void 0 !== e ? e : null;
        const c = Controller.$el(n, h, o, null, CustomElementDefinition.create({
            name: Nt.generateName(),
            template: o,
            enhance: true
        }));
        return s.onResolve(c.activate(c, e, 2), (() => c));
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domWriteQueue.yield();
        await t.domReadQueue.yield();
        await t.taskQueue.yield();
    }
    $s(t) {
        let i;
        if (!this.container.has(L, false)) {
            if (null === t.ownerDocument.defaultView) throw new Error("AUR0769");
            i = new e.BrowserPlatform(t.ownerDocument.defaultView);
            this.container.register(s.Registration.instance(L, i));
        } else i = this.container.get(L);
        return i;
    }
    start(t = this.next) {
        if (null == t) throw new Error("AUR0770");
        if (this.Ts instanceof Promise) return this.Ts;
        return this.Ts = s.onResolve(this.stop(), (() => {
            Reflect.set(t.host, "$aurelia", this);
            this.Ps.prepare(this.Is = t);
            this.Es = true;
            return s.onResolve(t.activate(), (() => {
                this.R = true;
                this.Es = false;
                this.Ts = void 0;
                this.Os(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (this.Ds instanceof Promise) return this.Ds;
        if (true === this.R) {
            const e = this.Is;
            this.R = false;
            this.Bs = true;
            return this.Ds = s.onResolve(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) e.dispose();
                this.Is = void 0;
                this.Ps.dispose();
                this.Bs = false;
                this.Os(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.R || this.Bs) throw new Error("AUR0771");
        this.container.dispose();
    }
    Os(t, e, s) {
        const i = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        s.dispatchEvent(i);
    }
}

exports.DefinitionType = void 0;

(function(t) {
    t[t["Element"] = 1] = "Element";
    t[t["Attribute"] = 2] = "Attribute";
})(exports.DefinitionType || (exports.DefinitionType = {}));

const To = s.DI.createInterface("IDialogService");

const Do = s.DI.createInterface("IDialogController");

const Po = s.DI.createInterface("IDialogDomRenderer");

const $o = s.DI.createInterface("IDialogDom");

const Oo = s.DI.createInterface("IDialogGlobalSettings");

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

exports.DialogDeactivationStatuses = void 0;

(function(t) {
    t["Ok"] = "ok";
    t["Error"] = "error";
    t["Cancel"] = "cancel";
    t["Abort"] = "abort";
})(exports.DialogDeactivationStatuses || (exports.DialogDeactivationStatuses = {}));

class DialogController {
    constructor(t, e) {
        this.p = t;
        this.ctn = e;
        this.closed = new Promise(((t, e) => {
            this.Lt = t;
            this.It = e;
        }));
    }
    static get inject() {
        return [ L, s.IContainer ];
    }
    activate(t) {
        var e;
        const i = this.ctn.createChild();
        const {model: n, template: o, rejectOnCancel: r} = t;
        const l = i.get(Po);
        const h = null !== (e = t.host) && void 0 !== e ? e : this.p.document.body;
        const c = this.dom = l.render(h, t);
        const a = i.has(We, true) ? i.get(We) : null;
        const u = c.contentHost;
        this.settings = t;
        if (null == a || !a.contains(h)) i.register(s.Registration.instance(We, h));
        i.register(s.Registration.instance(Ne, u), s.Registration.instance($o, c));
        return new Promise((e => {
            var s, o;
            const r = Object.assign(this.cmp = this.getOrCreateVm(i, t, u), {
                $dialog: this
            });
            e(null !== (o = null === (s = r.canActivate) || void 0 === s ? void 0 : s.call(r, n)) && void 0 !== o ? o : true);
        })).then((e => {
            var l;
            if (true !== e) {
                c.dispose();
                if (r) throw Lo(null, "Dialog activation rejected");
                return DialogOpenResult.create(true, this);
            }
            const h = this.cmp;
            return s.onResolve(null === (l = h.activate) || void 0 === l ? void 0 : l.call(h, n), (() => {
                var e;
                const n = this.controller = Controller.$el(i, h, u, null, CustomElementDefinition.create(null !== (e = this.getDefinition(h)) && void 0 !== e ? e : {
                    name: Nt.generateName(),
                    template: o
                }));
                return s.onResolve(n.activate(n, null, 2), (() => {
                    var e;
                    c.overlay.addEventListener(null !== (e = t.mouseEvent) && void 0 !== e ? e : "click", this);
                    return DialogOpenResult.create(false, this);
                }));
            }));
        }), (t => {
            c.dispose();
            throw t;
        }));
    }
    deactivate(t, e) {
        if (this.Ls) return this.Ls;
        let i = true;
        const {controller: n, dom: o, cmp: r, settings: {mouseEvent: l, rejectOnCancel: h}} = this;
        const c = DialogCloseResult.create(t, e);
        const a = new Promise((a => {
            var u, f;
            a(s.onResolve(null !== (f = null === (u = r.canDeactivate) || void 0 === u ? void 0 : u.call(r, c)) && void 0 !== f ? f : true, (a => {
                var u;
                if (true !== a) {
                    i = false;
                    this.Ls = void 0;
                    if (h) throw Lo(null, "Dialog cancellation rejected");
                    return DialogCloseResult.create("abort");
                }
                return s.onResolve(null === (u = r.deactivate) || void 0 === u ? void 0 : u.call(r, c), (() => s.onResolve(n.deactivate(n, null, 4), (() => {
                    o.dispose();
                    o.overlay.removeEventListener(null !== l && void 0 !== l ? l : "click", this);
                    if (!h && "error" !== t) this.Lt(c); else this.It(Lo(e, "Dialog cancelled with a rejection on cancel"));
                    return c;
                }))));
            })));
        })).catch((t => {
            this.Ls = void 0;
            throw t;
        }));
        this.Ls = i ? a : void 0;
        return a;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(t) {
        const e = qo(t);
        return new Promise((t => {
            var i, n;
            return t(s.onResolve(null === (n = (i = this.cmp).deactivate) || void 0 === n ? void 0 : n.call(i, DialogCloseResult.create("error", e)), (() => s.onResolve(this.controller.deactivate(this.controller, null, 4), (() => {
                this.dom.dispose();
                this.It(e);
            })))));
        }));
    }
    handleEvent(t) {
        if (this.settings.overlayDismiss && !this.dom.contentHost.contains(t.target)) this.cancel();
    }
    getOrCreateVm(t, e, i) {
        const n = e.component;
        if (null == n) return new EmptyComponent;
        if ("object" === typeof n) return n;
        const o = this.p;
        t.registerResolver(o.HTMLElement, t.registerResolver(o.Element, t.registerResolver(Ne, new s.InstanceProvider("ElementResolver", i))));
        return t.invoke(n);
    }
    getDefinition(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return Nt.isType(e) ? Nt.getDefinition(e) : null;
    }
}

class EmptyComponent {}

function Lo(t, e) {
    const s = new Error(e);
    s.wasCancelled = true;
    s.value = t;
    return s;
}

function qo(t) {
    const e = new Error;
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor(t, e, s) {
        this.ut = t;
        this.p = e;
        this.qs = s;
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
        return [ s.IContainer, L, Oo ];
    }
    static register(t) {
        t.register(s.Registration.singleton(To, this), rt.beforeDeactivate(To, (t => s.onResolve(t.closeAll(), (t => {
            if (t.length > 0) throw new Error(`AUR0901:${t.length}`);
        })))));
    }
    open(t) {
        return Mo(new Promise((e => {
            var i;
            const n = DialogSettings.from(this.qs, t);
            const o = null !== (i = n.container) && void 0 !== i ? i : this.ut.createChild();
            e(s.onResolve(n.load(), (t => {
                const e = o.invoke(DialogController);
                o.register(s.Registration.instance(Do, e));
                o.register(s.Registration.callback(DialogController, (() => {
                    throw new Error("AUR0902");
                })));
                return s.onResolve(e.activate(t), (t => {
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
        const s = e.indexOf(t);
        if (s > -1) this.dlgs.splice(s, 1);
        if (0 === e.length) this.p.window.removeEventListener("keydown", this);
    }
    handleEvent(t) {
        const e = t;
        const s = Fo(e);
        if (null == s) return;
        const i = this.top;
        if (null === i || 0 === i.settings.keyboard.length) return;
        const n = i.settings.keyboard;
        if ("Escape" === s && n.includes(s)) void i.cancel(); else if ("Enter" === s && n.includes(s)) void i.ok();
    }
}

class DialogSettings {
    static from(...t) {
        return Object.assign(new DialogSettings, ...t).Ms().Us();
    }
    load() {
        const t = this;
        const e = this.component;
        const i = this.template;
        const n = s.resolveAll(null == e ? void 0 : s.onResolve(e(), (e => {
            t.component = e;
        })), "function" === typeof i ? s.onResolve(i(), (e => {
            t.template = e;
        })) : void 0);
        return n instanceof Promise ? n.then((() => t)) : t;
    }
    Ms() {
        if (null == this.component && null == this.template) throw new Error("AUR0903");
        return this;
    }
    Us() {
        if (null == this.keyboard) this.keyboard = this.lock ? [] : [ "Enter", "Escape" ];
        if ("boolean" !== typeof this.overlayDismiss) this.overlayDismiss = !this.lock;
        return this;
    }
}

function Uo(t, e) {
    return this.then((s => s.dialog.closed.then(t, e)), e);
}

function Mo(t) {
    t.whenClosed = Uo;
    return t;
}

function Fo(t) {
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
        s.Registration.singleton(Oo, this).register(t);
    }
}

const Vo = "position:absolute;width:100%;height:100%;top:0;left:0;";

class DefaultDialogDomRenderer {
    constructor(t) {
        this.p = t;
        this.wrapperCss = `${Vo} display:flex;`;
        this.overlayCss = Vo;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        s.Registration.singleton(Po, this).register(t);
    }
    render(t) {
        const e = this.p.document;
        const s = (t, s) => {
            const i = e.createElement(t);
            i.style.cssText = s;
            return i;
        };
        const i = t.appendChild(s("au-dialog-container", this.wrapperCss));
        const n = i.appendChild(s("au-dialog-overlay", this.overlayCss));
        const o = i.appendChild(s("div", this.hostCss));
        return new DefaultDialogDom(i, n, o);
    }
}

DefaultDialogDomRenderer.inject = [ L ];

class DefaultDialogDom {
    constructor(t, e, s) {
        this.wrapper = t;
        this.overlay = e;
        this.contentHost = s;
    }
    dispose() {
        this.wrapper.remove();
    }
}

function jo(t, e) {
    return {
        settingsProvider: t,
        register: s => s.register(...e, rt.beforeCreate((() => t(s.get(Oo))))),
        customize(t, s) {
            return jo(t, null !== s && void 0 !== s ? s : e);
        }
    };
}

const _o = jo((() => {
    throw new Error("AUR0904");
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(s.Registration.singleton(Oo, this));
    }
} ]);

const No = jo(s.noop, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer ]);

const Wo = s.DI.createInterface((t => t.singleton(WcCustomElementRegistry)));

class WcCustomElementRegistry {
    constructor(t, e, s) {
        this.ctn = t;
        this.p = e;
        this.r = s;
    }
    define(t, e, i) {
        if (!t.includes("-")) throw new Error('Invalid web-components custom element name. It must include a "-"');
        let n;
        if (null == e) throw new Error("Invalid custom element definition");
        switch (typeof e) {
          case "function":
            n = Nt.isType(e) ? Nt.getDefinition(e) : CustomElementDefinition.create(Nt.generateName(), e);
            break;

          default:
            n = CustomElementDefinition.getOrCreate(e);
            break;
        }
        if (n.containerless) throw new Error("Containerless custom element is not supported. Consider using buitl-in extends instead");
        const o = !(null === i || void 0 === i ? void 0 : i.extends) ? HTMLElement : this.p.document.createElement(i.extends).constructor;
        const r = this.ctn;
        const l = this.r;
        const h = n.bindables;
        const c = this.p;
        class CustomElementClass extends o {
            auInit() {
                if (this.auInited) return;
                this.auInited = true;
                const t = r.createChild();
                t.registerResolver(c.HTMLElement, t.registerResolver(c.Element, t.registerResolver(Ne, new s.InstanceProvider("ElementProvider", this))));
                const e = l.compile(n, t, {
                    projections: null
                });
                const i = t.invoke(e.Type);
                const o = this.auCtrl = Controller.$el(t, i, this, null, e);
                _e(this, e.key, o);
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
            attributeChangedCallback(t, e, s) {
                this.auInit();
                this.auCtrl.viewModel[t] = s;
            }
        }
        CustomElementClass.observedAttributes = Object.keys(h);
        for (const t in h) Object.defineProperty(CustomElementClass.prototype, t, {
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

WcCustomElementRegistry.inject = [ s.IContainer, L, ge ];

exports.Platform = t.Platform;

exports.Task = t.Task;

exports.TaskAbortError = t.TaskAbortError;

exports.TaskQueue = t.TaskQueue;

exports.TaskQueuePriority = t.TaskQueuePriority;

exports.TaskStatus = t.TaskStatus;

exports.BrowserPlatform = e.BrowserPlatform;

exports.Access = i.Access;

exports.AccessKeyedExpression = i.AccessKeyedExpression;

exports.AccessMemberExpression = i.AccessMemberExpression;

exports.AccessScopeExpression = i.AccessScopeExpression;

exports.AccessThisExpression = i.AccessThisExpression;

exports.AccessorType = i.AccessorType;

exports.ArrayBindingPattern = i.ArrayBindingPattern;

exports.ArrayIndexObserver = i.ArrayIndexObserver;

exports.ArrayLiteralExpression = i.ArrayLiteralExpression;

exports.ArrayObserver = i.ArrayObserver;

exports.AssignExpression = i.AssignExpression;

exports.BinaryExpression = i.BinaryExpression;

exports.BindingBehavior = i.BindingBehavior;

exports.BindingBehaviorDefinition = i.BindingBehaviorDefinition;

exports.BindingBehaviorExpression = i.BindingBehaviorExpression;

exports.BindingBehaviorFactory = i.BindingBehaviorFactory;

exports.BindingBehaviorStrategy = i.BindingBehaviorStrategy;

exports.BindingContext = i.BindingContext;

exports.BindingIdentifier = i.BindingIdentifier;

exports.BindingInterceptor = i.BindingInterceptor;

exports.BindingMediator = i.BindingMediator;

exports.BindingMode = i.BindingMode;

exports.BindingType = i.BindingType;

exports.CallFunctionExpression = i.CallFunctionExpression;

exports.CallMemberExpression = i.CallMemberExpression;

exports.CallScopeExpression = i.CallScopeExpression;

exports.Char = i.Char;

exports.CollectionKind = i.CollectionKind;

exports.CollectionLengthObserver = i.CollectionLengthObserver;

exports.CollectionSizeObserver = i.CollectionSizeObserver;

exports.ComputedObserver = i.ComputedObserver;

exports.ConditionalExpression = i.ConditionalExpression;

exports.CustomExpression = i.CustomExpression;

exports.DelegationStrategy = i.DelegationStrategy;

exports.DirtyCheckProperty = i.DirtyCheckProperty;

exports.DirtyCheckSettings = i.DirtyCheckSettings;

exports.ExpressionKind = i.ExpressionKind;

exports.ForOfStatement = i.ForOfStatement;

exports.HtmlLiteralExpression = i.HtmlLiteralExpression;

exports.IDirtyChecker = i.IDirtyChecker;

exports.IExpressionParser = i.IExpressionParser;

exports.INodeObserverLocator = i.INodeObserverLocator;

exports.IObserverLocator = i.IObserverLocator;

exports.ISignaler = i.ISignaler;

exports.Interpolation = i.Interpolation;

exports.LifecycleFlags = i.LifecycleFlags;

exports.MapObserver = i.MapObserver;

exports.ObjectBindingPattern = i.ObjectBindingPattern;

exports.ObjectLiteralExpression = i.ObjectLiteralExpression;

exports.ObserverLocator = i.ObserverLocator;

exports.OverrideContext = i.OverrideContext;

exports.Precedence = i.Precedence;

exports.PrimitiveLiteralExpression = i.PrimitiveLiteralExpression;

exports.PrimitiveObserver = i.PrimitiveObserver;

exports.PropertyAccessor = i.PropertyAccessor;

exports.Scope = i.Scope;

exports.SetObserver = i.SetObserver;

exports.SetterObserver = i.SetterObserver;

exports.TaggedTemplateExpression = i.TaggedTemplateExpression;

exports.TemplateExpression = i.TemplateExpression;

exports.UnaryExpression = i.UnaryExpression;

exports.ValueConverter = i.ValueConverter;

exports.ValueConverterDefinition = i.ValueConverterDefinition;

exports.ValueConverterExpression = i.ValueConverterExpression;

exports.alias = i.alias;

exports.applyMutationsToIndices = i.applyMutationsToIndices;

exports.bindingBehavior = i.bindingBehavior;

exports.cloneIndexMap = i.cloneIndexMap;

exports.connectable = i.connectable;

exports.copyIndexMap = i.copyIndexMap;

exports.createIndexMap = i.createIndexMap;

exports.disableArrayObservation = i.disableArrayObservation;

exports.disableMapObservation = i.disableMapObservation;

exports.disableSetObservation = i.disableSetObservation;

exports.enableArrayObservation = i.enableArrayObservation;

exports.enableMapObservation = i.enableMapObservation;

exports.enableSetObservation = i.enableSetObservation;

exports.getCollectionObserver = i.getCollectionObserver;

exports.isIndexMap = i.isIndexMap;

exports.observable = i.observable;

exports.parseExpression = i.parseExpression;

exports.registerAliases = i.registerAliases;

exports.subscriberCollection = i.subscriberCollection;

exports.synchronizeIndices = i.synchronizeIndices;

exports.valueConverter = i.valueConverter;

exports.AdoptedStyleSheetsStyles = AdoptedStyleSheetsStyles;

exports.AppRoot = AppRoot;

exports.AppTask = rt;

exports.AtPrefixedTriggerAttributePatternRegistration = xn;

exports.AttrBindingBehavior = AttrBindingBehavior;

exports.AttrBindingBehaviorRegistration = to;

exports.AttrBindingCommandRegistration = Pn;

exports.AttrSyntax = AttrSyntax;

exports.AttributeBinding = AttributeBinding;

exports.AttributeBindingInstruction = AttributeBindingInstruction;

exports.AttributeBindingRendererRegistration = yo;

exports.AttributeNSAccessor = AttributeNSAccessor;

exports.AttributePattern = T;

exports.AuCompose = AuCompose;

exports.AuRenderRegistration = io;

exports.AuSlot = AuSlot;

exports.AuSlotsInfo = AuSlotsInfo;

exports.Aurelia = Aurelia;

exports.Bindable = w;

exports.BindableDefinition = BindableDefinition;

exports.BindableObserver = BindableObserver;

exports.BindablesInfo = BindablesInfo;

exports.BindingCommand = Gs;

exports.BindingCommandDefinition = BindingCommandDefinition;

exports.BindingModeBehavior = BindingModeBehavior;

exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;

exports.CallBinding = CallBinding;

exports.CallBindingCommandRegistration = yn;

exports.CallBindingInstruction = CallBindingInstruction;

exports.CallBindingRendererRegistration = co;

exports.CaptureBindingCommandRegistration = Dn;

exports.CheckedObserver = CheckedObserver;

exports.Children = ut;

exports.ChildrenDefinition = ChildrenDefinition;

exports.ChildrenObserver = ChildrenObserver;

exports.ClassAttributeAccessor = ClassAttributeAccessor;

exports.ClassBindingCommandRegistration = $n;

exports.ColonPrefixedBindAttributePatternRegistration = mn;

exports.ComputedWatcher = ComputedWatcher;

exports.Controller = Controller;

exports.CustomAttribute = Ct;

exports.CustomAttributeDefinition = CustomAttributeDefinition;

exports.CustomAttributeRendererRegistration = ao;

exports.CustomElement = Nt;

exports.CustomElementDefinition = CustomElementDefinition;

exports.CustomElementRendererRegistration = uo;

exports.DataAttributeAccessor = DataAttributeAccessor;

exports.DebounceBindingBehavior = DebounceBindingBehavior;

exports.DebounceBindingBehaviorRegistration = nn;

exports.DefaultBindingCommandRegistration = kn;

exports.DefaultBindingLanguage = Ln;

exports.DefaultBindingSyntax = wn;

exports.DefaultComponents = dn;

exports.DefaultDialogDom = DefaultDialogDom;

exports.DefaultDialogDomRenderer = DefaultDialogDomRenderer;

exports.DefaultDialogGlobalSettings = DefaultDialogGlobalSettings;

exports.DefaultRenderers = Eo;

exports.DefaultResources = ho;

exports.DelegateBindingCommandRegistration = Tn;

exports.DialogCloseResult = DialogCloseResult;

exports.DialogConfiguration = _o;

exports.DialogController = DialogController;

exports.DialogDefaultConfiguration = No;

exports.DialogOpenResult = DialogOpenResult;

exports.DialogService = DialogService;

exports.DotSeparatedAttributePatternRegistration = gn;

exports.Else = Else;

exports.ElseRegistration = jn;

exports.EventDelegator = EventDelegator;

exports.EventSubscriber = EventSubscriber;

exports.ExpressionWatcher = ExpressionWatcher;

exports.ForBindingCommandRegistration = Cn;

exports.FragmentNodeSequence = FragmentNodeSequence;

exports.FrequentMutations = FrequentMutations;

exports.FromViewBindingBehavior = FromViewBindingBehavior;

exports.FromViewBindingBehaviorRegistration = ln;

exports.FromViewBindingCommandRegistration = An;

exports.HydrateAttributeInstruction = HydrateAttributeInstruction;

exports.HydrateElementInstruction = HydrateElementInstruction;

exports.HydrateLetElementInstruction = HydrateLetElementInstruction;

exports.HydrateTemplateController = HydrateTemplateController;

exports.IAppRoot = Fe;

exports.IAppTask = ot;

exports.IAttrMapper = M;

exports.IAttributeParser = R;

exports.IAttributePattern = A;

exports.IAuSlotsInfo = ns;

exports.IAurelia = Io;

exports.IController = $e;

exports.IDialogController = Do;

exports.IDialogDom = $o;

exports.IDialogDomRenderer = Po;

exports.IDialogGlobalSettings = Oo;

exports.IDialogService = To;

exports.IEventDelegator = ss;

exports.IEventTarget = We;

exports.IHistory = Qe;

exports.IHydrationContext = Oe;

exports.IInstruction = os;

exports.ILifecycleHooks = oe;

exports.ILocation = Je;

exports.INode = Ne;

exports.INodeObserverLocatorRegistration = fn;

exports.IPlatform = L;

exports.IProjections = is;

exports.IRenderLocation = He;

exports.IRenderer = hs;

exports.IRendering = ge;

exports.ISVGAnalyzer = q;

exports.ISanitizer = sn;

exports.IShadowDOMGlobalStyles = Qt;

exports.IShadowDOMStyleFactory = Zt;

exports.IShadowDOMStyles = Jt;

exports.ISyntaxInterpreter = y;

exports.ITemplateCompiler = ls;

exports.ITemplateCompilerHooks = ui;

exports.ITemplateCompilerRegistration = un;

exports.ITemplateElementFactory = Ks;

exports.IViewFactory = ae;

exports.IViewLocator = ve;

exports.IWcElementRegistry = Wo;

exports.IWindow = Ze;

exports.IWorkTracker = Ve;

exports.If = If;

exports.IfRegistration = Vn;

exports.InterpolationBinding = InterpolationBinding;

exports.InterpolationBindingRendererRegistration = fo;

exports.InterpolationInstruction = InterpolationInstruction;

exports.Interpretation = Interpretation;

exports.IteratorBindingInstruction = IteratorBindingInstruction;

exports.IteratorBindingRendererRegistration = po;

exports.LetBinding = LetBinding;

exports.LetBindingInstruction = LetBindingInstruction;

exports.LetElementRendererRegistration = xo;

exports.LifecycleHooks = he;

exports.LifecycleHooksDefinition = LifecycleHooksDefinition;

exports.LifecycleHooksEntry = LifecycleHooksEntry;

exports.Listener = Listener;

exports.ListenerBindingInstruction = ListenerBindingInstruction;

exports.ListenerBindingRendererRegistration = bo;

exports.NodeObserverConfig = NodeObserverConfig;

exports.NodeObserverLocator = NodeObserverLocator;

exports.NoopSVGAnalyzer = NoopSVGAnalyzer;

exports.ObserveShallow = ObserveShallow;

exports.OneTimeBindingBehavior = OneTimeBindingBehavior;

exports.OneTimeBindingBehaviorRegistration = on;

exports.OneTimeBindingCommandRegistration = Rn;

exports.Portal = Portal;

exports.PropertyBinding = PropertyBinding;

exports.PropertyBindingInstruction = PropertyBindingInstruction;

exports.PropertyBindingRendererRegistration = mo;

exports.RefAttributePatternRegistration = vn;

exports.RefBinding = RefBinding;

exports.RefBindingCommandRegistration = Bn;

exports.RefBindingInstruction = RefBindingInstruction;

exports.RefBindingRendererRegistration = vo;

exports.RenderPlan = RenderPlan;

exports.Rendering = Rendering;

exports.Repeat = Repeat;

exports.RepeatRegistration = _n;

exports.SVGAnalyzer = SVGAnalyzer;

exports.SVGAnalyzerRegistration = pn;

exports.SanitizeValueConverterRegistration = qn;

exports.SelectValueObserver = SelectValueObserver;

exports.SelfBindingBehavior = SelfBindingBehavior;

exports.SelfBindingBehaviorRegistration = eo;

exports.SetAttributeInstruction = SetAttributeInstruction;

exports.SetAttributeRendererRegistration = ko;

exports.SetClassAttributeInstruction = SetClassAttributeInstruction;

exports.SetClassAttributeRendererRegistration = Co;

exports.SetPropertyInstruction = SetPropertyInstruction;

exports.SetPropertyRendererRegistration = go;

exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;

exports.SetStyleAttributeRendererRegistration = Ao;

exports.ShadowDOMRegistry = ShadowDOMRegistry;

exports.ShortHandBindingSyntax = bn;

exports.SignalBindingBehavior = SignalBindingBehavior;

exports.SignalBindingBehaviorRegistration = hn;

exports.StandardConfiguration = Bo;

exports.StyleAttributeAccessor = StyleAttributeAccessor;

exports.StyleBindingCommandRegistration = On;

exports.StyleConfiguration = te;

exports.StyleElementStyles = StyleElementStyles;

exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;

exports.StylePropertyBindingRendererRegistration = Ro;

exports.TemplateCompiler = TemplateCompiler;

exports.TemplateCompilerHooks = pi;

exports.TemplateControllerRendererRegistration = wo;

exports.TextBindingInstruction = TextBindingInstruction;

exports.TextBindingRendererRegistration = So;

exports.ThrottleBindingBehavior = ThrottleBindingBehavior;

exports.ThrottleBindingBehaviorRegistration = cn;

exports.ToViewBindingBehavior = ToViewBindingBehavior;

exports.ToViewBindingBehaviorRegistration = rn;

exports.ToViewBindingCommandRegistration = Sn;

exports.TriggerBindingCommandRegistration = In;

exports.TwoWayBindingBehavior = TwoWayBindingBehavior;

exports.TwoWayBindingBehaviorRegistration = an;

exports.TwoWayBindingCommandRegistration = En;

exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;

exports.UpdateTriggerBindingBehaviorRegistration = so;

exports.ValueAttributeObserver = ValueAttributeObserver;

exports.ViewFactory = ViewFactory;

exports.ViewLocator = ViewLocator;

exports.ViewValueConverterRegistration = Un;

exports.Views = xe;

exports.Watch = Et;

exports.WcCustomElementRegistry = WcCustomElementRegistry;

exports.With = With;

exports.WithRegistration = Nn;

exports.allResources = Zs;

exports.attributePattern = S;

exports.bindable = m;

exports.bindingCommand = Ns;

exports.children = ht;

exports.containerless = Tt;

exports.convertToRenderLocation = Ke;

exports.createElement = Ki;

exports.cssModules = Kt;

exports.customAttribute = gt;

exports.customElement = Bt;

exports.getEffectiveParentNode = Ge;

exports.getRef = je;

exports.isCustomElementController = Be;

exports.isCustomElementViewModel = Ie;

exports.isInstruction = rs;

exports.isRenderLocation = Ye;

exports.lifecycleHooks = ce;

exports.processContent = Ht;

exports.renderer = cs;

exports.setEffectiveParentNode = Xe;

exports.setRef = _e;

exports.shadowCSS = Yt;

exports.templateCompilerHooks = xi;

exports.templateController = wt;

exports.useShadowDOM = It;

exports.view = me;

exports.watch = At;
//# sourceMappingURL=index.js.map
