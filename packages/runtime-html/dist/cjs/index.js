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
    var n = arguments.length, r = n < 3 ? e : null === i ? i = Object.getOwnPropertyDescriptor(e, s) : i, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(t, e, s, i); else for (var l = t.length - 1; l >= 0; l--) if (o = t[l]) r = (n < 3 ? o(r) : n > 3 ? o(e, s, r) : o(e, s)) || r;
    return n > 3 && r && Object.defineProperty(e, s, r), r;
}

function r(t, e) {
    return function(s, i) {
        e(s, i, t);
    };
}

function o(t, e) {
    let i;
    function n(t, e) {
        if (arguments.length > 1) i.property = e;
        s.Metadata.define(h, BindableDefinition.create(e, i), t.constructor, e);
        s.Protocol.annotation.appendTo(t.constructor, a.keyFrom(e));
    }
    if (arguments.length > 1) {
        i = {};
        n(t, e);
        return;
    } else if ("string" === typeof t) {
        i = {};
        return n;
    }
    i = void 0 === t ? {} : t;
    return n;
}

function l(t) {
    return t.startsWith(h);
}

const h = s.Protocol.annotation.keyFor("bindable");

const a = Object.freeze({
    name: h,
    keyFrom(t) {
        return `${h}:${t}`;
    },
    from(...t) {
        const e = {};
        const s = Array.isArray;
        function i(t) {
            e[t] = BindableDefinition.create(t);
        }
        function n(t, s) {
            e[t] = s instanceof BindableDefinition ? s : BindableDefinition.create(t, s);
        }
        function r(t) {
            if (s(t)) t.forEach(i); else if (t instanceof BindableDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t[e])));
        }
        t.forEach(r);
        return e;
    },
    for(t) {
        let e;
        const i = {
            add(n) {
                let r;
                let o;
                if ("string" === typeof n) {
                    r = n;
                    o = {
                        property: r
                    };
                } else {
                    r = n.property;
                    o = n;
                }
                e = BindableDefinition.create(r, o);
                if (!s.Metadata.hasOwn(h, t, r)) s.Protocol.annotation.appendTo(t, a.keyFrom(r));
                s.Metadata.define(h, e, t, r);
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
        const e = h.length + 1;
        const i = [];
        const n = s.getPrototypeChain(t);
        let r = n.length;
        let o = 0;
        let a;
        let c;
        let u;
        let f;
        while (--r >= 0) {
            u = n[r];
            a = s.Protocol.annotation.getKeys(u).filter(l);
            c = a.length;
            for (f = 0; f < c; ++f) i[o++] = s.Metadata.getOwn(h, u, a[f].slice(e));
        }
        return i;
    }
});

class BindableDefinition {
    constructor(t, e, s, i, n, r) {
        this.attribute = t;
        this.callback = e;
        this.mode = s;
        this.primary = i;
        this.property = n;
        this.set = r;
    }
    static create(t, e = {}) {
        return new BindableDefinition(s.firstDefined(e.attribute, s.kebabCase(t)), s.firstDefined(e.callback, `${t}Changed`), s.firstDefined(e.mode, i.BindingMode.toView), s.firstDefined(e.primary, false), s.firstDefined(e.property, t), s.firstDefined(e.set, s.noop));
    }
}

class BindableObserver {
    constructor(t, e, i, n, r) {
        this.obj = t;
        this.key = e;
        this.set = n;
        this.$controller = r;
        this.value = void 0;
        this.t = void 0;
        this.f = 0;
        const o = t[i];
        const l = t.propertyChanged;
        const h = this.i = "function" === typeof o;
        const a = this.o = "function" === typeof l;
        const c = this.l = n !== s.noop;
        this.cb = h ? o : s.noop;
        this.u = a ? l : s.noop;
        if (void 0 === this.cb && !a && !c) this.v = false; else {
            this.v = true;
            const s = t[e];
            this.value = c && void 0 !== s ? n(s) : s;
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
            const s = this.value;
            if (Object.is(t, s)) return;
            this.value = t;
            this.t = s;
            this.f = e;
            if (null == this.$controller || this.$controller.isBound) {
                if (this.i) this.cb.call(this.obj, t, s, e);
                if (this.o) this.u.call(this.obj, this.key, t, s, e);
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
        c = this.t;
        this.t = this.value;
        this.subs.notify(this.value, c, this.f);
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

i.subscriberCollection(BindableObserver);

i.withFlushQueue(BindableObserver);

let c;

class CharSpec {
    constructor(t, e, s, i) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = s;
        this.isInverted = i;
        if (i) switch (t.length) {
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
            this.has = this.T;
            break;

          default:
            this.has = this.I;
        }
    }
    equals(t) {
        return this.chars === t.chars && this.repeat === t.repeat && this.isSymbol === t.isSymbol && this.isInverted === t.isInverted;
    }
    I(t) {
        return this.chars.includes(t);
    }
    T(t) {
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
        this.parts = s.emptyArray;
        this.D = "";
        this.P = {};
        this.$ = {};
    }
    get pattern() {
        const t = this.D;
        if ("" === t) return null; else return t;
    }
    set pattern(t) {
        if (null == t) {
            this.D = "";
            this.parts = s.emptyArray;
        } else {
            this.D = t;
            this.parts = this.$[t];
        }
    }
    append(t, e) {
        const s = this.P;
        if (void 0 === s[t]) s[t] = e; else s[t] += e;
    }
    next(t) {
        const e = this.P;
        let s;
        if (void 0 !== e[t]) {
            s = this.$;
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
        let r = 0;
        let o = null;
        let l = 0;
        let h = 0;
        for (;l < n; ++l) {
            o = i[l];
            if (o.charSpec.has(t)) {
                s.push(o);
                r = o.patterns.length;
                h = 0;
                if (o.charSpec.isSymbol) for (;h < r; ++h) e.next(o.patterns[h]); else for (;h < r; ++h) e.append(o.patterns[h], t);
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

const u = s.DI.createInterface("ISyntaxInterpreter", (t => t.singleton(SyntaxInterpreter)));

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
        let r;
        let o;
        let l;
        let h;
        let a = 0;
        let c;
        while (e > a) {
            s = this.rootState;
            i = t[a];
            n = i.pattern;
            r = new SegmentTypes;
            o = this.parse(i, r);
            l = o.length;
            h = t => {
                s = s.append(t, n);
            };
            for (c = 0; l > c; ++c) o[c].eachChar(h);
            s.types = r;
            s.isEndpoint = true;
            ++a;
        }
    }
    interpret(t) {
        const e = new Interpretation;
        const s = t.length;
        let i = this.initialStates;
        let n = 0;
        let r;
        for (;n < s; ++n) {
            i = this.getNextStates(i, t.charAt(n), e);
            if (0 === i.length) break;
        }
        i = i.filter(f);
        if (i.length > 0) {
            i.sort(d);
            r = i[0];
            if (!r.charSpec.isSymbol) e.next(r.pattern);
            e.pattern = r.pattern;
        }
        return e;
    }
    getNextStates(t, e, s) {
        const i = [];
        let n = null;
        const r = t.length;
        let o = 0;
        for (;o < r; ++o) {
            n = t[o];
            i.push(...n.findMatches(e, s));
        }
        return i;
    }
    parse(t, e) {
        const s = [];
        const i = t.pattern;
        const n = i.length;
        const r = t.symbols;
        let o = 0;
        let l = 0;
        let h = "";
        while (o < n) {
            h = i.charAt(o);
            if (0 === r.length || !r.includes(h)) if (o === l) if ("P" === h && "PART" === i.slice(o, o + 4)) {
                l = o += 4;
                s.push(new DynamicSegment(r));
                ++e.dynamics;
            } else ++o; else ++o; else if (o !== l) {
                s.push(new StaticSegment(i.slice(l, o)));
                ++e.statics;
                l = o;
            } else {
                s.push(new SymbolSegment(i.slice(l, o + 1)));
                ++e.symbols;
                l = ++o;
            }
        }
        if (l !== o) {
            s.push(new StaticSegment(i.slice(l, o)));
            ++e.statics;
        }
        return s;
    }
}

function f(t) {
    return t.isEndpoint;
}

function d(t, e) {
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

const p = s.DI.createInterface("IAttributePattern");

const x = s.DI.createInterface("IAttributeParser", (t => t.singleton(AttributeParser)));

class AttributeParser {
    constructor(t, e) {
        this.O = {};
        this.L = t;
        const i = this.q = {};
        const n = e.reduce(((t, e) => {
            const s = w.getPatternDefinitions(e.constructor);
            s.forEach((t => i[t.pattern] = e));
            return t.concat(s);
        }), s.emptyArray);
        t.add(n);
    }
    parse(t, e) {
        let s = this.O[t];
        if (null == s) s = this.O[t] = this.L.interpret(t);
        const i = s.pattern;
        if (null == i) return new AttrSyntax(t, e, t, null); else return this.q[i][i](t, e, s.parts);
    }
}

AttributeParser.inject = [ u, s.all(p) ];

function v(...t) {
    return function e(s) {
        return w.define(t, s);
    };
}

class AttributePatternResourceDefinition {
    constructor(t) {
        this.Type = t;
        this.name = void 0;
    }
    register(t) {
        s.Registration.singleton(p, this.Type).register(t);
    }
}

const m = s.Protocol.resource.keyFor("attribute-pattern");

const g = "attribute-pattern-definitions";

const w = Object.freeze({
    name: m,
    definitionAnnotationKey: g,
    define(t, e) {
        const i = new AttributePatternResourceDefinition(e);
        s.Metadata.define(m, i, e);
        s.Protocol.resource.appendTo(e, m);
        s.Protocol.annotation.set(e, g, t);
        s.Protocol.annotation.appendTo(e, g);
        return e;
    },
    getPatternDefinitions(t) {
        return s.Protocol.annotation.get(t, g);
    }
});

exports.DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
    "PART.PART"(t, e, s) {
        return new AttrSyntax(t, e, s[0], s[1]);
    }
    "PART.PART.PART"(t, e, s) {
        return new AttrSyntax(t, e, s[0], s[2]);
    }
};

exports.DotSeparatedAttributePattern = n([ v({
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

exports.RefAttributePattern = n([ v({
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

exports.ColonPrefixedBindAttributePattern = n([ v({
    pattern: ":PART",
    symbols: ":"
}) ], exports.ColonPrefixedBindAttributePattern);

exports.AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
    "@PART"(t, e, s) {
        return new AttrSyntax(t, e, s[0], "trigger");
    }
};

exports.AtPrefixedTriggerAttributePattern = n([ v({
    pattern: "@PART",
    symbols: "@"
}) ], exports.AtPrefixedTriggerAttributePattern);

const y = () => Object.create(null);

const b = Object.prototype.hasOwnProperty;

const k = y();

const A = (t, e, s) => {
    if (true === k[e]) return true;
    if ("string" !== typeof e) return false;
    const i = e.slice(0, 5);
    return k[e] = "aria-" === i || "data-" === i || s.isStandardSvgAttribute(t, e);
};

const C = s.IPlatform;

const R = s.DI.createInterface("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

function S(t) {
    const e = y();
    let s;
    for (s of t) e[s] = true;
    return e;
}

class SVGAnalyzer {
    constructor(t) {
        this.U = Object.assign(y(), {
            a: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "target", "transform", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            altGlyph: S([ "class", "dx", "dy", "externalResourcesRequired", "format", "glyphRef", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            altglyph: y(),
            altGlyphDef: S([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphdef: y(),
            altGlyphItem: S([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphitem: y(),
            animate: S([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateColor: S([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateMotion: S([ "accumulate", "additive", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keyPoints", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "origin", "path", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "rotate", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateTransform: S([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "type", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            circle: S([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "r", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            clipPath: S([ "class", "clipPathUnits", "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            "color-profile": S([ "id", "local", "name", "rendering-intent", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            cursor: S([ "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            defs: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            desc: S([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            ellipse: S([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            feBlend: S([ "class", "height", "id", "in", "in2", "mode", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feColorMatrix: S([ "class", "height", "id", "in", "result", "style", "type", "values", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComponentTransfer: S([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComposite: S([ "class", "height", "id", "in", "in2", "k1", "k2", "k3", "k4", "operator", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feConvolveMatrix: S([ "bias", "class", "divisor", "edgeMode", "height", "id", "in", "kernelMatrix", "kernelUnitLength", "order", "preserveAlpha", "result", "style", "targetX", "targetY", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDiffuseLighting: S([ "class", "diffuseConstant", "height", "id", "in", "kernelUnitLength", "result", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDisplacementMap: S([ "class", "height", "id", "in", "in2", "result", "scale", "style", "width", "x", "xChannelSelector", "xml:base", "xml:lang", "xml:space", "y", "yChannelSelector" ]),
            feDistantLight: S([ "azimuth", "elevation", "id", "xml:base", "xml:lang", "xml:space" ]),
            feFlood: S([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feFuncA: S([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncB: S([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncG: S([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncR: S([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feGaussianBlur: S([ "class", "height", "id", "in", "result", "stdDeviation", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feImage: S([ "class", "externalResourcesRequired", "height", "id", "preserveAspectRatio", "result", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMerge: S([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMergeNode: S([ "id", "xml:base", "xml:lang", "xml:space" ]),
            feMorphology: S([ "class", "height", "id", "in", "operator", "radius", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feOffset: S([ "class", "dx", "dy", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            fePointLight: S([ "id", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feSpecularLighting: S([ "class", "height", "id", "in", "kernelUnitLength", "result", "specularConstant", "specularExponent", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feSpotLight: S([ "id", "limitingConeAngle", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feTile: S([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feTurbulence: S([ "baseFrequency", "class", "height", "id", "numOctaves", "result", "seed", "stitchTiles", "style", "type", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            filter: S([ "class", "externalResourcesRequired", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            font: S([ "class", "externalResourcesRequired", "horiz-adv-x", "horiz-origin-x", "horiz-origin-y", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            "font-face": S([ "accent-height", "alphabetic", "ascent", "bbox", "cap-height", "descent", "font-family", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "hanging", "id", "ideographic", "mathematical", "overline-position", "overline-thickness", "panose-1", "slope", "stemh", "stemv", "strikethrough-position", "strikethrough-thickness", "underline-position", "underline-thickness", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "widths", "x-height", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-format": S([ "id", "string", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-name": S([ "id", "name", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-src": S([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-uri": S([ "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            foreignObject: S([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            g: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            glyph: S([ "arabic-form", "class", "d", "glyph-name", "horiz-adv-x", "id", "lang", "orientation", "style", "unicode", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            glyphRef: S([ "class", "dx", "dy", "format", "glyphRef", "id", "style", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            glyphref: y(),
            hkern: S([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ]),
            image: S([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            line: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "x1", "x2", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            linearGradient: S([ "class", "externalResourcesRequired", "gradientTransform", "gradientUnits", "id", "spreadMethod", "style", "x1", "x2", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            marker: S([ "class", "externalResourcesRequired", "id", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            mask: S([ "class", "externalResourcesRequired", "height", "id", "maskContentUnits", "maskUnits", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            metadata: S([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "missing-glyph": S([ "class", "d", "horiz-adv-x", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            mpath: S([ "externalResourcesRequired", "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            path: S([ "class", "d", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "pathLength", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            pattern: S([ "class", "externalResourcesRequired", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            polygon: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            polyline: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            radialGradient: S([ "class", "cx", "cy", "externalResourcesRequired", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "spreadMethod", "style", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            rect: S([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            script: S([ "externalResourcesRequired", "id", "type", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            set: S([ "attributeName", "attributeType", "begin", "dur", "end", "externalResourcesRequired", "fill", "id", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            stop: S([ "class", "id", "offset", "style", "xml:base", "xml:lang", "xml:space" ]),
            style: S([ "id", "media", "title", "type", "xml:base", "xml:lang", "xml:space" ]),
            svg: S([ "baseProfile", "class", "contentScriptType", "contentStyleType", "externalResourcesRequired", "height", "id", "onabort", "onactivate", "onclick", "onerror", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onresize", "onscroll", "onunload", "onzoom", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "version", "viewBox", "width", "x", "xml:base", "xml:lang", "xml:space", "y", "zoomAndPan" ]),
            switch: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            symbol: S([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            text: S([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "transform", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            textPath: S([ "class", "externalResourcesRequired", "id", "lengthAdjust", "method", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "textLength", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            title: S([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            tref: S([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            tspan: S([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            use: S([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            view: S([ "externalResourcesRequired", "id", "preserveAspectRatio", "viewBox", "viewTarget", "xml:base", "xml:lang", "xml:space", "zoomAndPan" ]),
            vkern: S([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ])
        });
        this.F = S([ "a", "altGlyph", "animate", "animateColor", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood", "feGaussianBlur", "feImage", "feMerge", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence", "filter", "font", "foreignObject", "g", "glyph", "glyphRef", "image", "line", "linearGradient", "marker", "mask", "missing-glyph", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use" ]);
        this.M = S([ "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "clip", "color-interpolation-filters", "color-interpolation", "color-profile", "color-rendering", "color", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "fill", "filter", "flood-color", "flood-opacity", "font-family", "font-size-adjust", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "stroke", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ]);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if ("altglyph" === e.firstElementChild.nodeName) {
            const t = this.U;
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
        return s.Registration.singleton(R, this).register(t);
    }
    isStandardSvgAttribute(t, e) {
        var s;
        if (!(t instanceof this.SVGElement)) return false;
        return true === this.F[t.nodeName] && true === this.M[e] || true === (null === (s = this.U[t.nodeName]) || void 0 === s ? void 0 : s[e]);
    }
}

SVGAnalyzer.inject = [ C ];

const E = s.DI.createInterface("IAttrMapper", (t => t.singleton(AttrMapper)));

class AttrMapper {
    constructor(t) {
        this.svg = t;
        this.fns = [];
        this.V = y();
        this.j = y();
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
        return [ R ];
    }
    useMapping(t) {
        var e;
        var s;
        let i;
        let n;
        let r;
        let o;
        for (r in t) {
            i = t[r];
            n = null !== (e = (s = this.V)[r]) && void 0 !== e ? e : s[r] = y();
            for (o in i) {
                if (void 0 !== n[o]) throw T(o, r);
                n[o] = i[o];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.j;
        for (const s in t) {
            if (void 0 !== e[s]) throw T(s, "*");
            e[s] = t[s];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return B(t, e) || this.fns.length > 0 && this.fns.some((s => s(t, e)));
    }
    map(t, e) {
        var s, i, n;
        return null !== (n = null !== (i = null === (s = this.V[t.nodeName]) || void 0 === s ? void 0 : s[e]) && void 0 !== i ? i : this.j[e]) && void 0 !== n ? n : A(t, e, this.svg) ? e : null;
    }
}

function B(t, e) {
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

function T(t, e) {
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
        this.prop = e;
        this.attr = s;
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
                    let s = t;
                    if ("string" === typeof s && s.includes("!important")) {
                        e = "important";
                        s = s.replace("!important", "");
                    }
                    this.obj.style.setProperty(this.prop, s, e);
                    break;
                }

              default:
                if (null == t) this.obj.removeAttribute(e); else this.obj.setAttribute(e, String(t));
            }
        }
    }
    handleMutation(t) {
        let e = false;
        for (let s = 0, i = t.length; i > s; ++s) {
            const i = t[s];
            if ("attributes" === i.type && i.attributeName === this.prop) {
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
            I(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) D(this.obj, this);
    }
    flush() {
        O = this.t;
        this.t = this.value;
        this.subs.notify(this.value, O, this.f);
    }
}

i.subscriberCollection(AttributeObserver);

i.withFlushQueue(AttributeObserver);

const I = (t, e, s) => {
    if (void 0 === e.$eMObs) e.$eMObs = new Set;
    if (void 0 === e.$mObs) (e.$mObs = new t(P)).observe(e, {
        attributes: true
    });
    e.$eMObs.add(s);
};

const D = (t, e) => {
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

const P = t => {
    t[0].target.$eMObs.forEach($, t);
};

function $(t) {
    t.handleMutation(this);
}

let O;

class BindingTargetSubscriber {
    constructor(t) {
        this.b = t;
    }
    handleChange(t, e, s) {
        const i = this.b;
        if (t !== i.sourceExpression.evaluate(s, i.$scope, i.locator, null)) i.updateSource(t, s);
    }
}

const {oneTime: L, toView: q, fromView: U} = i.BindingMode;

const F = q | L;

const M = {
    reusable: false,
    preempt: true
};

class AttributeBinding {
    constructor(t, e, s, i, n, r, o) {
        this.sourceExpression = t;
        this.targetAttribute = s;
        this.targetProperty = i;
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
        this.p = o.get(C);
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
    handleChange(t, e, s) {
        if (!this.isBound) return;
        s |= this.persistentFlags;
        const i = this.mode;
        const n = this.interceptor;
        const r = this.sourceExpression;
        const o = this.$scope;
        const l = this.locator;
        const h = this.targetObserver;
        const a = 0 === (2 & s) && (4 & h.type) > 0;
        let c = false;
        let u;
        if (10082 !== r.$kind || this.obs.count > 1) {
            c = 0 === (i & L);
            if (c) this.obs.version++;
            t = r.evaluate(s, o, l, n);
            if (c) this.obs.clear(false);
        }
        if (t !== this.value) {
            this.value = t;
            if (a) {
                u = this.task;
                this.task = this.p.domWriteQueue.queueTask((() => {
                    this.task = null;
                    n.updateTarget(t, s);
                }), M);
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
        const r = this.mode;
        const o = this.interceptor;
        let l = false;
        if (r & F) {
            l = (r & q) > 0;
            o.updateTarget(this.value = i.evaluate(t, e, this.locator, l ? o : null), t);
        }
        if (r & U) n.subscribe(null !== (s = this.targetSubscriber) && void 0 !== s ? s : this.targetSubscriber = new BindingTargetSubscriber(o));
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

i.connectable(AttributeBinding);

const {toView: V} = i.BindingMode;

const j = {
    reusable: false,
    preempt: true
};

class InterpolationBinding {
    constructor(t, e, s, i, n, r, o) {
        this.interpolation = e;
        this.target = s;
        this.targetProperty = i;
        this.mode = n;
        this.locator = r;
        this.taskQueue = o;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.oL = t;
        this.targetObserver = t.getAccessor(s, i);
        const l = e.expressions;
        const h = this.partBindings = Array(l.length);
        const a = l.length;
        let c = 0;
        for (;a > c; ++c) h[c] = new InterpolationPartBinding(l[c], s, i, r, t, this);
    }
    updateTarget(t, e) {
        const s = this.partBindings;
        const i = this.interpolation.parts;
        const n = s.length;
        let r = "";
        let o = 0;
        if (1 === n) r = i[0] + s[0].value + i[1]; else {
            r = i[0];
            for (;n > o; ++o) r += s[o].value + i[o + 1];
        }
        const l = this.targetObserver;
        const h = 0 === (2 & e) && (4 & l.type) > 0;
        let a;
        if (h) {
            a = this.task;
            this.task = this.taskQueue.queueTask((() => {
                this.task = null;
                l.setValue(r, e, this.target, this.targetProperty);
            }), j);
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
    constructor(t, e, s, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = s;
        this.locator = n;
        this.owner = o;
        this.interceptor = this;
        this.mode = i.BindingMode.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
        this.oL = r;
    }
    handleChange(t, e, s) {
        if (!this.isBound) return;
        const i = this.sourceExpression;
        const n = this.obs;
        const r = 10082 === i.$kind && 1 === n.count;
        let o = false;
        if (!r) {
            o = (this.mode & V) > 0;
            if (o) n.version++;
            t = i.evaluate(s, this.$scope, this.locator, o ? this.interceptor : null);
            if (o) n.clear(false);
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
        this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & V) > 0 ? this.interceptor : null);
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

i.connectable(InterpolationPartBinding);

class ContentBinding {
    constructor(t, e, s, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.locator = s;
        this.p = r;
        this.strict = o;
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
        const r = this.p.Node;
        const o = this.value;
        this.value = t;
        if (o instanceof r) null === (s = o.parentNode) || void 0 === s ? void 0 : s.removeChild(o);
        if (t instanceof r) {
            n.textContent = "";
            null === (i = n.parentNode) || void 0 === i ? void 0 : i.insertBefore(t, n);
        } else n.textContent = String(t);
    }
    handleChange(t, e, s) {
        var i;
        if (!this.isBound) return;
        const n = this.sourceExpression;
        const r = this.obs;
        const o = 10082 === n.$kind && 1 === r.count;
        let l = false;
        if (!o) {
            l = (this.mode & V) > 0;
            if (l) r.version++;
            s |= this.strict ? 1 : 0;
            t = n.evaluate(s, this.$scope, this.locator, l ? this.interceptor : null);
            if (l) r.clear(false);
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
        const s = this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & V) > 0 ? this.interceptor : null);
        if (s instanceof Array) this.observeCollection(s);
        this.updateTarget(s, t);
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
        const s = this.task;
        this.task = this.p.domWriteQueue.queueTask((() => {
            this.task = null;
            this.updateTarget(t, e);
        }), j);
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
        const r = i[n];
        this.obs.version++;
        t = this.sourceExpression.evaluate(s, this.$scope, this.locator, this.interceptor);
        this.obs.clear(false);
        if (t !== r) i[n] = t;
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
        this.obs.clear(true);
        this.isBound = false;
    }
}

i.connectable(LetBinding);

const {oneTime: _, toView: N, fromView: H} = i.BindingMode;

const W = N | _;

const z = {
    reusable: false,
    preempt: true
};

class PropertyBinding {
    constructor(t, e, s, i, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = s;
        this.mode = i;
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
    handleChange(t, e, s) {
        if (!this.isBound) return;
        s |= this.persistentFlags;
        const i = this.targetObserver;
        const n = this.interceptor;
        const r = this.sourceExpression;
        const o = this.$scope;
        const l = this.locator;
        const h = 0 === (2 & s) && (4 & i.type) > 0;
        const a = this.obs;
        let c = false;
        if (10082 !== r.$kind || a.count > 1) {
            c = this.mode > _;
            if (c) a.version++;
            t = r.evaluate(s, o, l, n);
            if (c) a.clear(false);
        }
        if (h) {
            G = this.task;
            this.task = this.taskQueue.queueTask((() => {
                n.updateTarget(t, s);
                this.task = null;
            }), z);
            null === G || void 0 === G ? void 0 : G.cancel();
            G = null;
        } else n.updateTarget(t, s);
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
        const r = this.mode;
        let o = this.targetObserver;
        if (!o) {
            if (r & H) o = n.getObserver(this.target, this.targetProperty); else o = n.getAccessor(this.target, this.targetProperty);
            this.targetObserver = o;
        }
        i = this.sourceExpression;
        const l = this.interceptor;
        const h = (r & N) > 0;
        if (r & W) l.updateTarget(i.evaluate(t, e, this.locator, h ? l : null), t);
        if (r & H) {
            o.subscribe(null !== (s = this.targetSubscriber) && void 0 !== s ? s : this.targetSubscriber = new BindingTargetSubscriber(l));
            if (!h) l.updateSource(o.getValue(this.target, this.targetProperty), t);
        }
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        this.persistentFlags = 0;
        if (this.sourceExpression.hasUnbind) this.sourceExpression.unbind(t, this.$scope, this.interceptor);
        this.$scope = void 0;
        G = this.task;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        if (null != G) {
            G.cancel();
            G = this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}

i.connectable(PropertyBinding);

let G = null;

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

const X = s.DI.createInterface("IAppTask");

class $AppTask {
    constructor(t, e, s) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = s;
    }
    register(t) {
        return this.c = t.register(s.Registration.instance(X, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return null === t ? e() : e(this.c.get(t));
    }
}

const K = Object.freeze({
    beforeCreate: Y("beforeCreate"),
    hydrating: Y("hydrating"),
    hydrated: Y("hydrated"),
    beforeActivate: Y("beforeActivate"),
    afterActivate: Y("afterActivate"),
    beforeDeactivate: Y("beforeDeactivate"),
    afterDeactivate: Y("afterDeactivate")
});

function Y(t) {
    function e(e, s) {
        if ("function" === typeof s) return new $AppTask(t, e, s);
        return new $AppTask(t, null, e);
    }
    return e;
}

function Z(t, e) {
    let i;
    function n(t, e) {
        if (arguments.length > 1) i.property = e;
        s.Metadata.define(Q, ChildrenDefinition.create(e, i), t.constructor, e);
        s.Protocol.annotation.appendTo(t.constructor, tt.keyFrom(e));
    }
    if (arguments.length > 1) {
        i = {};
        n(t, e);
        return;
    } else if ("string" === typeof t) {
        i = {};
        return n;
    }
    i = void 0 === t ? {} : t;
    return n;
}

function J(t) {
    return t.startsWith(Q);
}

const Q = s.Protocol.annotation.keyFor("children-observer");

const tt = Object.freeze({
    name: s.Protocol.annotation.keyFor("children-observer"),
    keyFrom(t) {
        return `${Q}:${t}`;
    },
    from(...t) {
        const e = {};
        const s = Array.isArray;
        function i(t) {
            e[t] = ChildrenDefinition.create(t);
        }
        function n(t, s) {
            e[t] = ChildrenDefinition.create(t, s);
        }
        function r(t) {
            if (s(t)) t.forEach(i); else if (t instanceof ChildrenDefinition) e[t.property] = t; else if (void 0 !== t) Object.keys(t).forEach((e => n(e, t)));
        }
        t.forEach(r);
        return e;
    },
    getAll(t) {
        const e = Q.length + 1;
        const i = [];
        const n = s.getPrototypeChain(t);
        let r = n.length;
        let o = 0;
        let l;
        let h;
        let a;
        while (--r >= 0) {
            a = n[r];
            l = s.Protocol.annotation.getKeys(a).filter(J);
            h = l.length;
            for (let t = 0; t < h; ++t) i[o++] = s.Metadata.getOwn(Q, a, l[t].slice(e));
        }
        return i;
    }
});

const et = {
    childList: true
};

class ChildrenDefinition {
    constructor(t, e, s, i, n, r) {
        this.callback = t;
        this.property = e;
        this.options = s;
        this.query = i;
        this.filter = n;
        this.map = r;
    }
    static create(t, e = {}) {
        var i;
        return new ChildrenDefinition(s.firstDefined(e.callback, `${t}Changed`), s.firstDefined(e.property, t), null !== (i = e.options) && void 0 !== i ? i : et, e.query, e.filter, e.map);
    }
}

class ChildrenObserver {
    constructor(t, e, s, i, n = st, r = it, o = nt, l) {
        this.controller = t;
        this.obj = e;
        this.propertyKey = s;
        this.query = n;
        this.filter = r;
        this.map = o;
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
                this.H();
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
    H() {
        this.children = this.get();
        if (void 0 !== this.callback) this.callback.call(this.obj);
        this.subs.notify(this.children, void 0, 0);
    }
    get() {
        return ot(this.controller, this.query, this.filter, this.map);
    }
}

i.subscriberCollection()(ChildrenObserver);

function st(t) {
    return t.host.childNodes;
}

function it(t, e, s) {
    return !!s;
}

function nt(t, e, s) {
    return s;
}

const rt = {
    optional: true
};

function ot(t, e, s, i) {
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
        a = bt.for(h, rt);
        c = null !== (n = null === a || void 0 === a ? void 0 : a.viewModel) && void 0 !== n ? n : null;
        if (s(h, a, c)) l.push(i(h, a, c));
    }
    return l;
}

function lt(t) {
    return function(e) {
        return ct.define(t, e);
    };
}

function ht(t) {
    return function(e) {
        return ct.define("string" === typeof t ? {
            isTemplateController: true,
            name: t
        } : {
            isTemplateController: true,
            ...t
        }, e);
    };
}

class CustomAttributeDefinition {
    constructor(t, e, s, i, n, r, o, l, h) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
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
        const n = ct.getAnnotation;
        let r;
        let o;
        if ("string" === typeof t) {
            r = t;
            o = {
                name: r
            };
        } else {
            r = t.name;
            o = t;
        }
        return new CustomAttributeDefinition(e, s.firstDefined(n(e, "name"), r), s.mergeArrays(n(e, "aliases"), o.aliases, e.aliases), ct.keyFrom(r), s.firstDefined(n(e, "defaultBindingMode"), o.defaultBindingMode, e.defaultBindingMode, i.BindingMode.toView), s.firstDefined(n(e, "isTemplateController"), o.isTemplateController, e.isTemplateController, false), a.from(...a.getAll(e), n(e, "bindables"), e.bindables, o.bindables), s.firstDefined(n(e, "noMultiBindings"), o.noMultiBindings, e.noMultiBindings, false), s.mergeArrays(pt.getAnnotation(e), e.watches));
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        s.Registration.transient(n, e).register(t);
        s.Registration.aliasTo(n, e).register(t);
        i.registerAliases(r, ct, n, t);
    }
}

const at = s.Protocol.resource.keyFor("custom-attribute");

const ct = Object.freeze({
    name: at,
    keyFrom(t) {
        return `${at}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.Metadata.hasOwn(at, t);
    },
    for(t, e) {
        var s;
        return null !== (s = we(t, ct.keyFrom(e))) && void 0 !== s ? s : void 0;
    },
    define(t, e) {
        const i = CustomAttributeDefinition.create(t, e);
        s.Metadata.define(at, i, i.Type);
        s.Metadata.define(at, i, i);
        s.Protocol.resource.appendTo(e, at);
        return i.Type;
    },
    getDefinition(t) {
        const e = s.Metadata.getOwn(at, t);
        if (void 0 === e) throw new Error(`AUR0759:${t.name}`);
        return e;
    },
    annotate(t, e, i) {
        s.Metadata.define(s.Protocol.annotation.keyFor(e), i, t);
    },
    getAnnotation(t, e) {
        return s.Metadata.getOwn(s.Protocol.annotation.keyFor(e), t);
    }
});

function ut(t, e) {
    if (!t) throw new Error("AUR0772");
    return function s(i, n, r) {
        const o = null == n;
        const l = o ? i : i.constructor;
        const h = new WatchDefinition(t, o ? e : r.value);
        if (o) {
            if ("function" !== typeof e && (null == e || !(e in l.prototype))) throw new Error(`AUR0773:${String(e)}@${l.name}}`);
        } else if ("function" !== typeof (null === r || void 0 === r ? void 0 : r.value)) throw new Error(`AUR0774:${String(n)}`);
        pt.add(l, h);
        if (ct.isType(l)) ct.getDefinition(l).watches.push(h);
        if (bt.isType(l)) bt.getDefinition(l).watches.push(h);
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const ft = s.emptyArray;

const dt = s.Protocol.annotation.keyFor("watch");

const pt = {
    name: dt,
    add(t, e) {
        let i = s.Metadata.getOwn(dt, t);
        if (null == i) s.Metadata.define(dt, i = [], t);
        i.push(e);
    },
    getAnnotation(t) {
        var e;
        return null !== (e = s.Metadata.getOwn(dt, t)) && void 0 !== e ? e : ft;
    }
};

function xt(t) {
    return function(e) {
        return bt.define(t, e);
    };
}

function vt(t) {
    if (void 0 === t) return function(t) {
        bt.annotate(t, "shadowOptions", {
            mode: "open"
        });
    };
    if ("function" !== typeof t) return function(e) {
        bt.annotate(e, "shadowOptions", t);
    };
    bt.annotate(t, "shadowOptions", {
        mode: "open"
    });
}

function mt(t) {
    if (void 0 === t) return function(t) {
        bt.annotate(t, "containerless", true);
    };
    bt.annotate(t, "containerless", true);
}

const gt = new WeakMap;

class CustomElementDefinition {
    constructor(t, e, s, i, n, r, o, l, h, a, c, u, f, d, p, x, v, m, g, w) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = i;
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
        this.isStrictBinding = p;
        this.shadowOptions = x;
        this.hasSlots = v;
        this.enhance = m;
        this.watches = g;
        this.processContent = w;
    }
    get type() {
        return 1;
    }
    static create(t, e = null) {
        const i = bt.getAnnotation;
        if (null === e) {
            const i = t;
            if ("string" === typeof i) throw new Error(`AUR0761:${t}`);
            const n = s.fromDefinitionOrDefault("name", i, bt.generateName);
            if ("function" === typeof i.Type) e = i.Type; else e = bt.generateType(s.pascalCase(n));
            return new CustomElementDefinition(e, n, s.mergeArrays(i.aliases), s.fromDefinitionOrDefault("key", i, (() => bt.keyFrom(n))), s.fromDefinitionOrDefault("cache", i, (() => 0)), s.fromDefinitionOrDefault("template", i, (() => null)), s.mergeArrays(i.instructions), s.mergeArrays(i.dependencies), s.fromDefinitionOrDefault("injectable", i, (() => null)), s.fromDefinitionOrDefault("needsCompile", i, (() => true)), s.mergeArrays(i.surrogates), a.from(i.bindables), tt.from(i.childrenObservers), s.fromDefinitionOrDefault("containerless", i, (() => false)), s.fromDefinitionOrDefault("isStrictBinding", i, (() => false)), s.fromDefinitionOrDefault("shadowOptions", i, (() => null)), s.fromDefinitionOrDefault("hasSlots", i, (() => false)), s.fromDefinitionOrDefault("enhance", i, (() => false)), s.fromDefinitionOrDefault("watches", i, (() => s.emptyArray)), s.fromAnnotationOrTypeOrDefault("processContent", e, (() => null)));
        }
        if ("string" === typeof t) return new CustomElementDefinition(e, t, s.mergeArrays(i(e, "aliases"), e.aliases), bt.keyFrom(t), s.fromAnnotationOrTypeOrDefault("cache", e, (() => 0)), s.fromAnnotationOrTypeOrDefault("template", e, (() => null)), s.mergeArrays(i(e, "instructions"), e.instructions), s.mergeArrays(i(e, "dependencies"), e.dependencies), s.fromAnnotationOrTypeOrDefault("injectable", e, (() => null)), s.fromAnnotationOrTypeOrDefault("needsCompile", e, (() => true)), s.mergeArrays(i(e, "surrogates"), e.surrogates), a.from(...a.getAll(e), i(e, "bindables"), e.bindables), tt.from(...tt.getAll(e), i(e, "childrenObservers"), e.childrenObservers), s.fromAnnotationOrTypeOrDefault("containerless", e, (() => false)), s.fromAnnotationOrTypeOrDefault("isStrictBinding", e, (() => false)), s.fromAnnotationOrTypeOrDefault("shadowOptions", e, (() => null)), s.fromAnnotationOrTypeOrDefault("hasSlots", e, (() => false)), s.fromAnnotationOrTypeOrDefault("enhance", e, (() => false)), s.mergeArrays(pt.getAnnotation(e), e.watches), s.fromAnnotationOrTypeOrDefault("processContent", e, (() => null)));
        const n = s.fromDefinitionOrDefault("name", t, bt.generateName);
        return new CustomElementDefinition(e, n, s.mergeArrays(i(e, "aliases"), t.aliases, e.aliases), bt.keyFrom(n), s.fromAnnotationOrDefinitionOrTypeOrDefault("cache", t, e, (() => 0)), s.fromAnnotationOrDefinitionOrTypeOrDefault("template", t, e, (() => null)), s.mergeArrays(i(e, "instructions"), t.instructions, e.instructions), s.mergeArrays(i(e, "dependencies"), t.dependencies, e.dependencies), s.fromAnnotationOrDefinitionOrTypeOrDefault("injectable", t, e, (() => null)), s.fromAnnotationOrDefinitionOrTypeOrDefault("needsCompile", t, e, (() => true)), s.mergeArrays(i(e, "surrogates"), t.surrogates, e.surrogates), a.from(...a.getAll(e), i(e, "bindables"), e.bindables, t.bindables), tt.from(...tt.getAll(e), i(e, "childrenObservers"), e.childrenObservers, t.childrenObservers), s.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", t, e, (() => false)), s.fromAnnotationOrDefinitionOrTypeOrDefault("isStrictBinding", t, e, (() => false)), s.fromAnnotationOrDefinitionOrTypeOrDefault("shadowOptions", t, e, (() => null)), s.fromAnnotationOrDefinitionOrTypeOrDefault("hasSlots", t, e, (() => false)), s.fromAnnotationOrDefinitionOrTypeOrDefault("enhance", t, e, (() => false)), s.mergeArrays(t.watches, pt.getAnnotation(e), e.watches), s.fromAnnotationOrDefinitionOrTypeOrDefault("processContent", t, e, (() => null)));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) return t;
        if (gt.has(t)) return gt.get(t);
        const e = CustomElementDefinition.create(t);
        gt.set(t, e);
        s.Metadata.define(bt.name, e, e.Type);
        return e;
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        if (!t.has(n, false)) {
            s.Registration.transient(n, e).register(t);
            s.Registration.aliasTo(n, e).register(t);
            i.registerAliases(r, bt, n, t);
        }
    }
}

const wt = {
    name: void 0,
    searchParents: false,
    optional: false
};

const yt = s.Protocol.resource.keyFor("custom-element");

const bt = Object.freeze({
    name: yt,
    keyFrom(t) {
        return `${yt}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.Metadata.hasOwn(yt, t);
    },
    for(t, e = wt) {
        if (void 0 === e.name && true !== e.searchParents) {
            const s = we(t, yt);
            if (null === s) {
                if (true === e.optional) return null;
                throw new Error("AUR0762");
            }
            return s;
        }
        if (void 0 !== e.name) {
            if (true !== e.searchParents) {
                const s = we(t, yt);
                if (null === s) throw new Error("AUR0763");
                if (s.is(e.name)) return s;
                return;
            }
            let s = t;
            let i = false;
            while (null !== s) {
                const t = we(s, yt);
                if (null !== t) {
                    i = true;
                    if (t.is(e.name)) return t;
                }
                s = Re(s);
            }
            if (i) return;
            throw new Error("AUR0764");
        }
        let s = t;
        while (null !== s) {
            const t = we(s, yt);
            if (null !== t) return t;
            s = Re(s);
        }
        throw new Error("AUR0765");
    },
    define(t, e) {
        const i = CustomElementDefinition.create(t, e);
        s.Metadata.define(yt, i, i.Type);
        s.Metadata.define(yt, i, i);
        s.Protocol.resource.appendTo(i.Type, yt);
        return i.Type;
    },
    getDefinition(t) {
        const e = s.Metadata.getOwn(yt, t);
        if (void 0 === e) throw new Error(`AUR0760:${t.name}`);
        return e;
    },
    annotate(t, e, i) {
        s.Metadata.define(s.Protocol.annotation.keyFor(e), i, t);
    },
    getAnnotation(t, e) {
        return s.Metadata.getOwn(s.Protocol.annotation.keyFor(e), t);
    },
    generateName: function() {
        let t = 0;
        return function() {
            return `unnamed-${++t}`;
        };
    }(),
    createInjectable() {
        const t = function(e, i, n) {
            const r = s.DI.getOrCreateAnnotationParamTypes(e);
            r[n] = t;
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

const kt = s.Protocol.annotation.keyFor("processContent");

function At(t) {
    return void 0 === t ? function(t, e, i) {
        s.Metadata.define(kt, Ct(t, e), t);
    } : function(e) {
        t = Ct(e, t);
        const i = s.Metadata.getOwn(yt, e);
        if (void 0 !== i) i.processContent = t; else s.Metadata.define(kt, t, e);
        return e;
    };
}

function Ct(t, e) {
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
            const s = Rt(t);
            let i = this.G;
            this.t = t;
            if (s.length > 0) this.X(s);
            this.G += 1;
            if (0 === i) return;
            i -= 1;
            for (const t in e) {
                if (!Object.prototype.hasOwnProperty.call(e, t) || e[t] !== i) continue;
                this.obj.classList.remove(t);
            }
        }
    }
    X(t) {
        const e = this.obj;
        const s = t.length;
        let i = 0;
        let n;
        for (;i < s; i++) {
            n = t[i];
            if (0 === n.length) continue;
            this.W[n] = this.G;
            e.classList.add(n);
        }
    }
}

function Rt(t) {
    if ("string" === typeof t) return St(t);
    if ("object" !== typeof t) return s.emptyArray;
    if (t instanceof Array) {
        const e = t.length;
        if (e > 0) {
            const s = [];
            let i = 0;
            for (;e > i; ++i) s.push(...Rt(t[i]));
            return s;
        } else return s.emptyArray;
    }
    const e = [];
    let i;
    for (i in t) if (Boolean(t[i])) if (i.includes(" ")) e.push(...St(i)); else e.push(i);
    return e;
}

function St(t) {
    const e = t.match(/\S+/g);
    if (null === e) return s.emptyArray;
    return e;
}

function Et(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        var e;
        const s = Object.assign({}, ...this.modules);
        const i = ct.define({
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
                this.element.className = Rt(this.value).map((t => s[t] || t)).join(" ");
            }
        }, e.inject = [ be ], e));
        t.register(i);
    }
}

function Bt(...t) {
    return new ShadowDOMRegistry(t);
}

const Tt = s.DI.createInterface("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(C))) return t.get(AdoptedStyleSheetsStylesFactory);
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Dt);
        const i = t.get(Tt);
        t.register(s.Registration.instance(It, i.createStyles(this.css, e)));
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

AdoptedStyleSheetsStylesFactory.inject = [ C ];

class StyleElementStylesFactory {
    constructor(t) {
        this.p = t;
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

StyleElementStylesFactory.inject = [ C ];

const It = s.DI.createInterface("IShadowDOMStyles");

const Dt = s.DI.createInterface("IShadowDOMGlobalStyles", (t => t.instance({
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

const Pt = {
    shadowDOM(t) {
        return K.beforeCreate(s.IContainer, (e => {
            if (null != t.sharedStyles) {
                const i = e.get(Tt);
                e.register(s.Registration.instance(Dt, i.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: $t, exit: Ot} = i.ConnectableSwitcher;

const {wrap: Lt, unwrap: qt} = i.ProxyObservable;

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
        this.obs.clear(true);
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
            $t(this);
            return this.value = qt(this.get.call(void 0, this.useProxy ? Lt(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            Ot(this);
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
            this.obs.clear(false);
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
        this.obs.clear(false);
    }
    $unbind() {
        if (!this.isBound) return;
        this.isBound = false;
        this.obs.clear(true);
        this.value = void 0;
    }
}

i.connectable(ComputedWatcher);

i.connectable(ExpressionWatcher);

const Ut = s.DI.createInterface("ILifecycleHooks");

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
        s.Registration.singleton(Ut, this.Type).register(t);
    }
}

const Ft = new WeakMap;

const Mt = s.Protocol.annotation.keyFor("lifecycle-hooks");

const Vt = Object.freeze({
    name: Mt,
    define(t, e) {
        const i = LifecycleHooksDefinition.create(t, e);
        s.Metadata.define(Mt, i, e);
        s.Protocol.resource.appendTo(e, Mt);
        return i.Type;
    },
    resolve(t) {
        let e = Ft.get(t);
        if (void 0 === e) {
            e = new LifecycleHooksLookupImpl;
            const i = t.root;
            const n = i.id === t.id ? t.getAll(Ut) : t.has(Ut, false) ? [ ...i.getAll(Ut), ...t.getAll(Ut) ] : i.getAll(Ut);
            let r;
            let o;
            let l;
            let h;
            let a;
            for (r of n) {
                o = s.Metadata.getOwn(Mt, r.constructor);
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

function jt() {
    return function t(e) {
        return Vt.define({}, e);
    };
}

const _t = s.DI.createInterface("IViewFactory");

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

const Nt = new WeakSet;

function Ht(t) {
    return !Nt.has(t);
}

function Wt(t) {
    Nt.add(t);
    return CustomElementDefinition.create(t);
}

const zt = s.Protocol.resource.keyFor("views");

const Gt = Object.freeze({
    name: zt,
    has(t) {
        return "function" === typeof t && (s.Metadata.hasOwn(zt, t) || "$views" in t);
    },
    get(t) {
        if ("function" === typeof t && "$views" in t) {
            const e = t.$views;
            const s = e.filter(Ht).map(Wt);
            for (const e of s) Gt.add(t, e);
        }
        let e = s.Metadata.getOwn(zt, t);
        if (void 0 === e) s.Metadata.define(zt, e = [], t);
        return e;
    },
    add(t, e) {
        const i = CustomElementDefinition.create(e);
        let n = s.Metadata.getOwn(zt, t);
        if (void 0 === n) s.Metadata.define(zt, n = [ i ], t); else n.push(i);
        return n;
    }
});

function Xt(t) {
    return function(e) {
        Gt.add(e, t);
    };
}

const Kt = s.DI.createInterface("IViewLocator", (t => t.singleton(ViewLocator)));

class ViewLocator {
    constructor() {
        this.K = new WeakMap;
        this.Y = new Map;
    }
    getViewComponentForObject(t, e) {
        if (t) {
            const s = Gt.has(t.constructor) ? Gt.get(t.constructor) : [];
            const i = "function" === typeof e ? e(t, s) : this.Z(s, e);
            return this.J(t, s, i);
        }
        return null;
    }
    J(t, e, s) {
        let i = this.K.get(t);
        let n;
        if (void 0 === i) {
            i = {};
            this.K.set(t, i);
        } else n = i[s];
        if (void 0 === n) {
            const r = this.tt(t, e, s);
            n = bt.define(bt.getDefinition(r), class extends r {
                constructor() {
                    super(t);
                }
            });
            i[s] = n;
        }
        return n;
    }
    tt(t, e, s) {
        let n = this.Y.get(t.constructor);
        let r;
        if (void 0 === n) {
            n = {};
            this.Y.set(t.constructor, n);
        } else r = n[s];
        if (void 0 === r) {
            r = bt.define(this.et(e, s), class {
                constructor(t) {
                    this.viewModel = t;
                }
                define(t, e, s) {
                    const n = this.viewModel;
                    t.scope = i.Scope.fromParent(t.scope, n);
                    if (void 0 !== n.define) return n.define(t, e, s);
                }
            });
            const o = r.prototype;
            if ("hydrating" in t) o.hydrating = function t(e) {
                this.viewModel.hydrating(e);
            };
            if ("hydrated" in t) o.hydrated = function t(e) {
                this.viewModel.hydrated(e);
            };
            if ("created" in t) o.created = function t(e) {
                this.viewModel.created(e);
            };
            if ("binding" in t) o.binding = function t(e, s, i) {
                return this.viewModel.binding(e, s, i);
            };
            if ("bound" in t) o.bound = function t(e, s, i) {
                return this.viewModel.bound(e, s, i);
            };
            if ("attaching" in t) o.attaching = function t(e, s, i) {
                return this.viewModel.attaching(e, s, i);
            };
            if ("attached" in t) o.attached = function t(e, s) {
                return this.viewModel.attached(e, s);
            };
            if ("detaching" in t) o.detaching = function t(e, s, i) {
                return this.viewModel.detaching(e, s, i);
            };
            if ("unbinding" in t) o.unbinding = function t(e, s, i) {
                return this.viewModel.unbinding(e, s, i);
            };
            if ("dispose" in t) o.dispose = function t() {
                this.viewModel.dispose();
            };
            n[s] = r;
        }
        return r;
    }
    Z(t, e) {
        if (e) return e;
        if (1 === t.length) return t[0].name;
        return "default-view";
    }
    et(t, e) {
        const s = t.find((t => t.name === e));
        if (void 0 === s) throw new Error(`Could not find view: ${e}`);
        return s;
    }
}

const Yt = s.DI.createInterface("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    constructor(t) {
        this.st = new WeakMap;
        this.it = new WeakMap;
        this.nt = (this.rt = t.root).get(C);
        this.ot = new FragmentNodeSequence(this.nt, this.nt.document.createDocumentFragment());
    }
    get renderers() {
        return null == this.rs ? this.rs = this.rt.getAll(Ve, false).reduce(((t, e) => {
            t[e.instructionType] = e;
            return t;
        }), y()) : this.rs;
    }
    compile(t, e, s) {
        if (false !== t.needsCompile) {
            const i = this.st;
            const n = e.get(Me);
            let r = i.get(t);
            if (null == r) i.set(t, r = n.compile(t, e, s)); else e.register(...r.dependencies);
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
        const s = this.it;
        if (s.has(t)) e = s.get(t); else {
            const i = this.nt;
            const n = i.document;
            const r = t.template;
            let o;
            if (null === r) e = null; else if (r instanceof i.Node) if ("TEMPLATE" === r.nodeName) e = n.adoptNode(r.content); else (e = n.adoptNode(n.createDocumentFragment())).appendChild(r.cloneNode(true)); else {
                o = n.createElement("template");
                if ("string" === typeof r) o.innerHTML = r;
                n.adoptNode(e = o.content);
            }
            s.set(t, e);
        }
        return null == e ? this.ot : new FragmentNodeSequence(this.nt, e.cloneNode(true));
    }
    render(t, e, s, i) {
        const n = s.instructions;
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
        if (void 0 !== i && null !== i) {
            c = s.surrogates;
            if ((a = c.length) > 0) {
                h = 0;
                while (a > h) {
                    u = c[h];
                    r[u.type].render(t, i, u);
                    ++h;
                }
            }
        }
    }
}

Rendering.inject = [ s.IContainer ];

var Zt;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["host"] = 1] = "host";
    t[t["shadowRoot"] = 2] = "shadowRoot";
    t[t["location"] = 3] = "location";
})(Zt || (Zt = {}));

const Jt = {
    optional: true
};

const Qt = new WeakMap;

class Controller {
    constructor(t, e, i, n, r, o) {
        this.container = t;
        this.vmKind = e;
        this.definition = i;
        this.viewFactory = n;
        this.viewModel = r;
        this.host = o;
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
        this.lt = false;
        this.ht = s.emptyArray;
        this.flags = 0;
        this.$initiator = null;
        this.$flags = 0;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.at = 0;
        this.ct = 0;
        this.ut = 0;
        this.ft = t.root.get(Yt);
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
        return Qt.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (void 0 === e) throw new Error(`AUR0500:${t}`);
        return e;
    }
    static $el(t, e, i, n, r = void 0) {
        if (Qt.has(e)) return Qt.get(e);
        r = null !== r && void 0 !== r ? r : bt.getDefinition(e.constructor);
        const o = new Controller(t, 0, r, null, e, i);
        const l = t.get(s.optional(fe));
        if (r.dependencies.length > 0) t.register(...r.dependencies);
        t.registerResolver(fe, new s.InstanceProvider("IHydrationContext", new HydrationContext(o, n, l)));
        Qt.set(e, o);
        if (null == n || false !== n.hydrate) o.dt(n, l);
        return o;
    }
    static $attr(t, e, s, i) {
        if (Qt.has(e)) return Qt.get(e);
        i = null !== i && void 0 !== i ? i : ct.getDefinition(e.constructor);
        const n = new Controller(t, 1, i, null, e, s);
        Qt.set(e, n);
        n.xt();
        return n;
    }
    static $view(t, e = void 0) {
        const s = new Controller(t.container, 2, null, t, null, null);
        s.parent = null !== e && void 0 !== e ? e : null;
        s.vt();
        return s;
    }
    dt(t, e) {
        const n = this.container;
        const r = this.flags;
        const o = this.viewModel;
        let l = this.definition;
        this.scope = i.Scope.create(o, null, true);
        if (l.watches.length > 0) re(this, n, l, o);
        ee(this, l, r, o);
        this.ht = se(this, l, o);
        if (this.hooks.hasDefine) {
            const t = o.define(this, e, l);
            if (void 0 !== t && t !== l) l = CustomElementDefinition.getOrCreate(t);
        }
        this.lifecycleHooks = Vt.resolve(n);
        l.register(n);
        if (null !== l.injectable) n.registerResolver(l.injectable, new s.InstanceProvider("definition.injectable", o));
        if (null == t || false !== t.hydrate) {
            this.gt(t);
            this.wt();
        }
    }
    gt(t) {
        if (this.hooks.hasHydrating) this.viewModel.hydrating(this);
        const e = this.yt = this.ft.compile(this.definition, this.container, t);
        const {shadowOptions: s, isStrictBinding: i, hasSlots: n, containerless: r} = e;
        this.isStrictBinding = i;
        if (null !== (this.hostController = bt.for(this.host, Jt))) this.host = this.container.root.get(C).document.createElement(this.definition.name);
        ye(this.host, bt.name, this);
        ye(this.host, this.definition.key, this);
        if (null !== s || n) {
            if (r) throw new Error("AUR0501");
            ye(this.shadowRoot = this.host.attachShadow(null !== s && void 0 !== s ? s : he), bt.name, this);
            ye(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2;
        } else if (r) {
            ye(this.location = Ee(this.host), bt.name, this);
            ye(this.location, this.definition.key, this);
            this.mountTarget = 3;
        } else this.mountTarget = 1;
        this.viewModel.$controller = this;
        this.nodes = this.ft.createNodes(e);
        if (this.hooks.hasHydrated) this.viewModel.hydrated(this);
    }
    wt() {
        this.ft.render(this, this.nodes.findTargets(), this.yt, this.host);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    xt() {
        const t = this.definition;
        const e = this.viewModel;
        if (t.watches.length > 0) re(this, this.container, t, e);
        ee(this, t, this.flags, e);
        e.$controller = this;
        this.lifecycleHooks = Vt.resolve(this.container);
        if (this.hooks.hasCreated) this.viewModel.created(this);
    }
    vt() {
        this.yt = this.ft.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this.yt.isStrictBinding;
        this.ft.render(this, (this.nodes = this.ft.createNodes(this.yt)).findTargets(), this.yt, void 0);
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
            throw new Error(`AUR0503:${this.name} ${ce(this.state)}`);
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
        this.bt();
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
        let s;
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
            s = this.viewModel.bound(this.$initiator, this.parent, this.$flags);
            if (s instanceof Promise) {
                this.kt();
                s.then((() => {
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
                const e = t.has(It, false) ? t.get(It) : t.get(Dt);
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
                this.bt();
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
            throw new Error(`AUR0505:${this.name} ${ce(this.state)}`);
        }
        this.$initiator = t;
        this.$flags = s;
        if (t === this) this.Et();
        let i = 0;
        if (this.ht.length) for (;i < this.ht.length; ++i) this.ht[i].stop();
        if (null !== this.children) for (i = 0; i < this.children.length; ++i) void this.children[i].deactivate(t, this, s);
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
        this.Tt();
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
    Tt() {
        if (void 0 !== this.$promise) {
            pe = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            pe();
            pe = void 0;
        }
    }
    At(t) {
        if (void 0 !== this.$promise) {
            xe = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            xe(t);
            xe = void 0;
        }
        if (this.$initiator !== this) this.parent.At(t);
    }
    bt() {
        ++this.at;
        if (this.$initiator !== this) this.parent.bt();
    }
    St() {
        if (0 === --this.at) {
            if (this.hooks.hasAttached) {
                ve = this.viewModel.attached(this.$initiator, this.$flags);
                if (ve instanceof Promise) {
                    this.kt();
                    ve.then((() => {
                        this.state = 2;
                        this.Tt();
                        if (this.$initiator !== this) this.parent.St();
                    })).catch((t => {
                        this.At(t);
                    }));
                    ve = void 0;
                    return;
                }
                ve = void 0;
            }
            this.state = 2;
            this.Tt();
        }
        if (this.$initiator !== this) this.parent.St();
    }
    Et() {
        ++this.ct;
    }
    Bt() {
        if (0 === --this.ct) {
            this.It();
            this.removeNodes();
            let t = this.$initiator.head;
            while (null !== t) {
                if (t !== this) {
                    if (t.debug) t.logger.trace(`detach()`);
                    t.removeNodes();
                }
                if (t.hooks.hasUnbinding) {
                    if (t.debug) t.logger.trace("unbinding()");
                    ve = t.viewModel.unbinding(t.$initiator, t.parent, t.$flags);
                    if (ve instanceof Promise) {
                        this.kt();
                        this.It();
                        ve.then((() => {
                            this.Dt();
                        })).catch((t => {
                            this.At(t);
                        }));
                    }
                    ve = void 0;
                }
                t = t.next;
            }
            this.Dt();
        }
    }
    It() {
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
            return ct.getDefinition(this.viewModel.constructor).name === t;

          case 0:
            return bt.getDefinition(this.viewModel.constructor).name === t;

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
            ye(t, bt.name, this);
            ye(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = 1;
        return this;
    }
    setShadowRoot(t) {
        if (0 === this.vmKind) {
            ye(t, bt.name, this);
            ye(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = 2;
        return this;
    }
    setLocation(t) {
        if (0 === this.vmKind) {
            ye(t, bt.name, this);
            ye(t, this.definition.key, this);
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
            this.children.forEach(de);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (null !== this.viewModel) {
            Qt.delete(this.viewModel);
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

function te(t) {
    let e = t.$observers;
    if (void 0 === e) Reflect.defineProperty(t, "$observers", {
        enumerable: false,
        value: e = {}
    });
    return e;
}

function ee(t, e, s, i) {
    const n = e.bindables;
    const r = Object.getOwnPropertyNames(n);
    const o = r.length;
    if (o > 0) {
        let e;
        let s;
        let l = 0;
        const h = te(i);
        for (;l < o; ++l) {
            e = r[l];
            if (void 0 === h[e]) {
                s = n[e];
                h[e] = new BindableObserver(i, e, s.callback, s.set, t);
            }
        }
    }
}

function se(t, e, i) {
    const n = e.childrenObservers;
    const r = Object.getOwnPropertyNames(n);
    const o = r.length;
    if (o > 0) {
        const e = te(i);
        const s = [];
        let l;
        let h = 0;
        let a;
        for (;h < o; ++h) {
            l = r[h];
            if (void 0 == e[l]) {
                a = n[l];
                s[s.length] = e[l] = new ChildrenObserver(t, i, l, a.callback, a.query, a.filter, a.map, a.options);
            }
        }
        return s;
    }
    return s.emptyArray;
}

const ie = new Map;

const ne = t => {
    let e = ie.get(t);
    if (null == e) {
        e = new i.AccessScopeExpression(t, 0);
        ie.set(t, e);
    }
    return e;
};

function re(t, e, s, n) {
    const r = e.get(i.IObserverLocator);
    const o = e.get(i.IExpressionParser);
    const l = s.watches;
    const h = 0 === t.vmKind ? t.scope : i.Scope.create(n, null, true);
    const a = l.length;
    let c;
    let u;
    let f;
    let d = 0;
    for (;a > d; ++d) {
        ({expression: c, callback: u} = l[d]);
        u = "function" === typeof u ? u : Reflect.get(n, u);
        if ("function" !== typeof u) throw new Error(`AUR0506:${String(u)}`);
        if ("function" === typeof c) t.addBinding(new ComputedWatcher(n, r, c, u, true)); else {
            f = "string" === typeof c ? o.parse(c, 53) : ne(c);
            t.addBinding(new ExpressionWatcher(h, e, r, f, u));
        }
    }
}

function oe(t) {
    return t instanceof Controller && 0 === t.vmKind;
}

function le(t) {
    return s.isObject(t) && bt.isType(t.constructor);
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

const he = {
    mode: "open"
};

exports.ViewModelKind = void 0;

(function(t) {
    t[t["customElement"] = 0] = "customElement";
    t[t["customAttribute"] = 1] = "customAttribute";
    t[t["synthetic"] = 2] = "synthetic";
})(exports.ViewModelKind || (exports.ViewModelKind = {}));

var ae;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["activating"] = 1] = "activating";
    t[t["activated"] = 2] = "activated";
    t[t["deactivating"] = 4] = "deactivating";
    t[t["deactivated"] = 8] = "deactivated";
    t[t["released"] = 16] = "released";
    t[t["disposed"] = 32] = "disposed";
})(ae || (ae = {}));

function ce(t) {
    const e = [];
    if (1 === (1 & t)) e.push("activating");
    if (2 === (2 & t)) e.push("activated");
    if (4 === (4 & t)) e.push("deactivating");
    if (8 === (8 & t)) e.push("deactivated");
    if (16 === (16 & t)) e.push("released");
    if (32 === (32 & t)) e.push("disposed");
    return 0 === e.length ? "none" : e.join("|");
}

const ue = s.DI.createInterface("IController");

const fe = s.DI.createInterface("IHydrationContext");

class HydrationContext {
    constructor(t, e, s) {
        this.instruction = e;
        this.parent = s;
        this.controller = t;
    }
}

function de(t) {
    t.dispose();
}

let pe;

let xe;

let ve;

const me = s.DI.createInterface("IAppRoot");

const ge = s.DI.createInterface("IWorkTracker", (t => t.singleton(WorkTracker)));

class WorkTracker {
    constructor(t) {
        this.Pt = 0;
        this.$t = null;
        this.Tt = null;
        this.Ot = t.scopeTo("WorkTracker");
    }
    start() {
        this.Ot.trace(`start(stack:${this.Pt})`);
        ++this.Pt;
    }
    finish() {
        this.Ot.trace(`finish(stack:${this.Pt})`);
        if (0 === --this.Pt) {
            const t = this.Tt;
            if (null !== t) {
                this.Tt = this.$t = null;
                t();
            }
        }
    }
    wait() {
        this.Ot.trace(`wait(stack:${this.Pt})`);
        if (null === this.$t) {
            if (0 === this.Pt) return Promise.resolve();
            this.$t = new Promise((t => {
                this.Tt = t;
            }));
        }
        return this.$t;
    }
}

WorkTracker.inject = [ s.ILogger ];

class AppRoot {
    constructor(t, e, i, n) {
        this.config = t;
        this.platform = e;
        this.container = i;
        this.controller = void 0;
        this.Lt = void 0;
        this.host = t.host;
        this.work = i.get(ge);
        n.prepare(this);
        i.registerResolver(e.HTMLElement, i.registerResolver(e.Element, i.registerResolver(be, new s.InstanceProvider("ElementResolver", t.host))));
        this.Lt = s.onResolve(this.qt("beforeCreate"), (() => {
            const e = t.component;
            const n = i.createChild();
            let r;
            if (bt.isType(e)) r = this.container.get(e); else r = t.component;
            const o = {
                hydrate: false,
                projections: null
            };
            const l = this.controller = Controller.$el(n, r, this.host, o);
            l.dt(o, null);
            return s.onResolve(this.qt("hydrating"), (() => {
                l.gt(null);
                return s.onResolve(this.qt("hydrated"), (() => {
                    l.wt();
                    this.Lt = void 0;
                }));
            }));
        }));
    }
    activate() {
        return s.onResolve(this.Lt, (() => s.onResolve(this.qt("beforeActivate"), (() => s.onResolve(this.controller.activate(this.controller, null, 2, void 0), (() => this.qt("afterActivate")))))));
    }
    deactivate() {
        return s.onResolve(this.qt("beforeDeactivate"), (() => s.onResolve(this.controller.deactivate(this.controller, null, 0), (() => this.qt("afterDeactivate")))));
    }
    qt(t) {
        return s.resolveAll(...this.container.getAll(X).reduce(((e, s) => {
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

function we(t, e) {
    var s, i;
    return null !== (i = null === (s = t.$au) || void 0 === s ? void 0 : s[e]) && void 0 !== i ? i : null;
}

function ye(t, e, s) {
    var i;
    var n;
    (null !== (i = (n = t).$au) && void 0 !== i ? i : n.$au = new Refs)[e] = s;
}

const be = s.DI.createInterface("INode");

const ke = s.DI.createInterface("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(me, true)) return t.get(me).host;
    return t.get(C).document;
}))));

const Ae = s.DI.createInterface("IRenderLocation");

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

const Ce = new WeakMap;

function Re(t) {
    if (Ce.has(t)) return Ce.get(t);
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
        const e = bt.for(t);
        if (void 0 === e) return null;
        if (2 === e.mountTarget) return Re(e.host);
    }
    return t.parentNode;
}

function Se(t, e) {
    if (void 0 !== t.platform && !(t instanceof t.platform.Node)) {
        const s = t.childNodes;
        for (let t = 0, i = s.length; t < i; ++t) Ce.set(s[t], e);
    } else Ce.set(t, e);
}

function Ee(t) {
    if (Be(t)) return t;
    const e = t.ownerDocument.createComment("au-end");
    const s = t.ownerDocument.createComment("au-start");
    if (null !== t.parentNode) {
        t.parentNode.replaceChild(e, t);
        e.parentNode.insertBefore(s, e);
    }
    e.$start = s;
    return e;
}

function Be(t) {
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
        let r;
        let o = this.targets = Array(n);
        while (n > i) {
            r = s[i];
            if ("AU-M" === r.nodeName) o[i] = Ee(r); else o[i] = r;
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
        if (Be(t)) this.refNode = t; else {
            this.next = t;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (void 0 !== this.next) this.refNode = this.next.firstChild; else this.refNode = void 0;
    }
}

const Te = s.DI.createInterface("IWindow", (t => t.callback((t => t.get(C).window))));

const Ie = s.DI.createInterface("ILocation", (t => t.callback((t => t.get(Te).location))));

const De = s.DI.createInterface("IHistory", (t => t.callback((t => t.get(Te).history))));

const Pe = {
    [i.DelegationStrategy.capturing]: {
        capture: true
    },
    [i.DelegationStrategy.bubbling]: {
        capture: false
    }
};

class Listener {
    constructor(t, e, s, i, n, r, o, l) {
        this.platform = t;
        this.targetEvent = e;
        this.delegationStrategy = s;
        this.sourceExpression = i;
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
        if (this.delegationStrategy === i.DelegationStrategy.none) this.target.addEventListener(this.targetEvent, this); else this.handler = this.eventDelegator.addEventListener(this.locator.get(ke), this.target, this.targetEvent, this, Pe[this.delegationStrategy]);
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

const $e = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, s = $e) {
        this.Ut = t;
        this.Ft = e;
        this.Mt = s;
        this.Vt = 0;
        this.jt = new Map;
        this._t = new Map;
    }
    Nt() {
        if (1 === ++this.Vt) this.Ut.addEventListener(this.Ft, this, this.Mt);
    }
    Ht() {
        if (0 === --this.Vt) this.Ut.removeEventListener(this.Ft, this, this.Mt);
    }
    dispose() {
        if (this.Vt > 0) {
            this.Vt = 0;
            this.Ut.removeEventListener(this.Ft, this, this.Mt);
        }
        this.jt.clear();
        this._t.clear();
    }
    Wt(t) {
        const e = true === this.Mt.capture ? this.jt : this._t;
        let s = e.get(t);
        if (void 0 === s) e.set(t, s = Object.create(null));
        return s;
    }
    handleEvent(t) {
        const e = true === this.Mt.capture ? this.jt : this._t;
        const s = t.composedPath();
        if (true === this.Mt.capture) s.reverse();
        for (const i of s) {
            const s = e.get(i);
            if (void 0 === s) continue;
            const n = s[this.Ft];
            if (void 0 === n) continue;
            if ("function" === typeof n) n(t); else n.handleEvent(t);
            if (true === t.cancelBubble) return;
        }
    }
}

class DelegateSubscription {
    constructor(t, e, s, i) {
        this.zt = t;
        this.Gt = e;
        this.Ft = s;
        t.Nt();
        e[s] = i;
    }
    dispose() {
        this.zt.Ht();
        this.Gt[this.Ft] = void 0;
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

const Oe = s.DI.createInterface("IEventDelegator", (t => t.singleton(EventDelegator)));

class EventDelegator {
    constructor() {
        this.Xt = Object.create(null);
    }
    addEventListener(t, e, s, i, n) {
        var r;
        var o;
        const l = null !== (r = (o = this.Xt)[s]) && void 0 !== r ? r : o[s] = new Map;
        let h = l.get(t);
        if (void 0 === h) l.set(t, h = new ListenerTracker(t, s, n));
        return new DelegateSubscription(h, h.Wt(e), s, i);
    }
    dispose() {
        for (const t in this.Xt) {
            const e = this.Xt[t];
            for (const t of e.values()) t.dispose();
            e.clear();
        }
    }
}

const Le = s.DI.createInterface("IProjections");

const qe = s.DI.createInterface("IAuSlotsInfo");

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

const Ue = s.DI.createInterface("Instruction");

function Fe(t) {
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

const Me = s.DI.createInterface("ITemplateCompiler");

const Ve = s.DI.createInterface("IRenderer");

function je(t) {
    return function e(i) {
        const n = function(...e) {
            const s = new i(...e);
            s.instructionType = t;
            return s;
        };
        n.register = function t(e) {
            s.Registration.singleton(Ve, n).register(e);
        };
        const r = s.Metadata.getOwnKeys(i);
        for (const t of r) s.Metadata.define(t, s.Metadata.getOwn(t, i), n);
        const o = Object.getOwnPropertyDescriptors(i);
        Object.keys(o).filter((t => "prototype" !== t)).forEach((t => {
            Reflect.defineProperty(n, t, o[t]);
        }));
        return n;
    };
}

function _e(t, e, s) {
    if ("string" === typeof e) return t.parse(e, s);
    return e;
}

function Ne(t) {
    if (null != t.viewModel) return t.viewModel;
    return t;
}

function He(t, e) {
    if ("element" === e) return t;
    switch (e) {
      case "controller":
        return bt.for(t);

      case "view":
        throw new Error("AUR0750");

      case "view-model":
        return bt.for(t).viewModel;

      default:
        {
            const s = ct.for(t, e);
            if (void 0 !== s) return s.viewModel;
            const i = bt.for(t, {
                name: e
            });
            if (void 0 === i) throw new Error(`AUR0751:${e}`);
            return i.viewModel;
        }
    }
}

let We = class SetPropertyRenderer {
    render(t, e, s) {
        const i = Ne(e);
        if (void 0 !== i.$observers && void 0 !== i.$observers[s.to]) i.$observers[s.to].setValue(s.value, 2); else i[s.to] = s.value;
    }
};

We = n([ je("re") ], We);

let ze = class CustomElementRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Yt, C ];
    }
    render(t, e, i) {
        let n;
        let r;
        let o;
        let l;
        const h = i.res;
        const a = i.projections;
        const c = t.container;
        const u = vs(this.p, t, e, i, e, null == a ? void 0 : new AuSlotsInfo(Object.keys(a)));
        switch (typeof h) {
          case "string":
            n = c.find(bt, h);
            if (null == n) throw new Error(`AUR0752:${h}@${t["name"]}`);
            break;

          default:
            n = h;
        }
        r = n.Type;
        o = u.invoke(r);
        u.registerResolver(r, new s.InstanceProvider(n.key, o));
        l = Controller.$el(u, o, e, i, n);
        ye(e, n.key, l);
        const f = this.r.renderers;
        const d = i.props;
        const p = d.length;
        let x = 0;
        let v;
        while (p > x) {
            v = d[x];
            f[v.type].render(t, l, v);
            ++x;
        }
        t.addChild(l);
    }
};

ze = n([ je("ra") ], ze);

let Ge = class CustomAttributeRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Yt, C ];
    }
    render(t, e, s) {
        let i = t.container;
        let n;
        switch (typeof s.res) {
          case "string":
            n = i.find(ct, s.res);
            if (null == n) throw new Error(`AUR0753:${s.res}@${t["name"]}`);
            break;

          default:
            n = s.res;
        }
        const r = ms(this.p, n, t, e, s, void 0, void 0);
        const o = Controller.$attr(t.container, r, e, n);
        ye(e, n.key, o);
        const l = this.r.renderers;
        const h = s.props;
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

Ge = n([ je("rb") ], Ge);

let Xe = class TemplateControllerRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Yt, C ];
    }
    render(t, e, s) {
        var i;
        let n = t.container;
        let r;
        switch (typeof s.res) {
          case "string":
            r = n.find(ct, s.res);
            if (null == r) throw new Error(`AUR0754:${s.res}@${t["name"]}`);
            break;

          default:
            r = s.res;
        }
        const o = this.r.getViewFactory(s.def, n);
        const l = Ee(e);
        const h = ms(this.p, r, t, e, s, o, l);
        const a = Controller.$attr(t.container, h, e, r);
        ye(l, r.key, a);
        null === (i = h.link) || void 0 === i ? void 0 : i.call(h, t, a, e, s);
        const c = this.r.renderers;
        const u = s.props;
        const f = u.length;
        let d = 0;
        let p;
        while (f > d) {
            p = u[d];
            c[p.type].render(t, a, p);
            ++d;
        }
        t.addChild(a);
    }
};

Xe = n([ je("rc") ], Xe);

let Ke = class LetElementRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, s) {
        e.remove();
        const i = s.instructions;
        const n = s.toBindingContext;
        const r = t.container;
        const o = i.length;
        let l;
        let h;
        let a;
        let c = 0;
        while (o > c) {
            l = i[c];
            h = _e(this.parser, l.from, 48);
            a = new LetBinding(h, l.to, this.oL, r, n);
            t.addBinding(38962 === h.$kind ? is(a, h, r) : a);
            ++c;
        }
    }
};

Ke = n([ je("rd"), r(0, i.IExpressionParser), r(1, i.IObserverLocator) ], Ke);

let Ye = class CallBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, s) {
        const i = _e(this.parser, s.from, 153);
        const n = new CallBinding(i, Ne(e), s.to, this.oL, t.container);
        t.addBinding(38962 === i.$kind ? is(n, i, t.container) : n);
    }
};

Ye.inject = [ i.IExpressionParser, i.IObserverLocator ];

Ye = n([ je("rh") ], Ye);

let Ze = class RefBindingRenderer {
    constructor(t) {
        this.parser = t;
    }
    render(t, e, s) {
        const i = _e(this.parser, s.from, 5376);
        const n = new RefBinding(i, He(e, s.to), t.container);
        t.addBinding(38962 === i.$kind ? is(n, i, t.container) : n);
    }
};

Ze = n([ je("rj"), r(0, i.IExpressionParser) ], Ze);

let Je = class InterpolationBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const n = t.container;
        const r = _e(this.parser, s.from, 2048);
        const o = new InterpolationBinding(this.oL, r, Ne(e), s.to, i.BindingMode.toView, n, this.p.domWriteQueue);
        const l = o.partBindings;
        const h = l.length;
        let a = 0;
        let c;
        for (;h > a; ++a) {
            c = l[a];
            if (38962 === c.sourceExpression.$kind) l[a] = is(c, c.sourceExpression, n);
        }
        t.addBinding(o);
    }
};

Je = n([ je("rf"), r(0, i.IExpressionParser), r(1, i.IObserverLocator), r(2, C) ], Je);

let Qe = class PropertyBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const i = _e(this.parser, s.from, 48 | s.mode);
        const n = new PropertyBinding(i, Ne(e), s.to, s.mode, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(38962 === i.$kind ? is(n, i, t.container) : n);
    }
};

Qe = n([ je("rg"), r(0, i.IExpressionParser), r(1, i.IObserverLocator), r(2, C) ], Qe);

let ts = class IteratorBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const n = _e(this.parser, s.from, 539);
        const r = new PropertyBinding(n, Ne(e), s.to, i.BindingMode.toView, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(r);
    }
};

ts = n([ je("rk"), r(0, i.IExpressionParser), r(1, i.IObserverLocator), r(2, C) ], ts);

let es = 0;

const ss = [];

function is(t, e, s) {
    while (e instanceof i.BindingBehaviorExpression) {
        ss[es++] = e;
        e = e.expression;
    }
    while (es > 0) {
        const e = ss[--es];
        const n = s.get(e.behaviorKey);
        if (n instanceof i.BindingBehaviorFactory) t = n.construct(t, e);
    }
    ss.length = 0;
    return t;
}

let ns = class TextBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const i = t.container;
        const n = e.nextSibling;
        const r = e.parentNode;
        const o = this.p.document;
        const l = _e(this.parser, s.from, 2048);
        const h = l.parts;
        const a = l.expressions;
        const c = a.length;
        let u = 0;
        let f = h[0];
        let d;
        let p;
        if ("" !== f) r.insertBefore(o.createTextNode(f), n);
        for (;c > u; ++u) {
            p = a[u];
            d = new ContentBinding(p, r.insertBefore(o.createTextNode(""), n), i, this.oL, this.p, s.strict);
            t.addBinding(38962 === p.$kind ? is(d, p, i) : d);
            f = h[u + 1];
            if ("" !== f) r.insertBefore(o.createTextNode(f), n);
        }
        if ("AU-M" === e.nodeName) e.remove();
    }
};

ns = n([ je("ha"), r(0, i.IExpressionParser), r(1, i.IObserverLocator), r(2, C) ], ns);

let rs = class ListenerBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.eventDelegator = e;
        this.p = s;
    }
    render(t, e, s) {
        const i = _e(this.parser, s.from, 80 | s.strategy + 6);
        const n = new Listener(this.p, s.to, s.strategy, i, e, s.preventDefault, this.eventDelegator, t.container);
        t.addBinding(38962 === i.$kind ? is(n, i, t.container) : n);
    }
};

rs = n([ je("hb"), r(0, i.IExpressionParser), r(1, Oe), r(2, C) ], rs);

let os = class SetAttributeRenderer {
    render(t, e, s) {
        e.setAttribute(s.to, s.value);
    }
};

os = n([ je("he") ], os);

let ls = class SetClassAttributeRenderer {
    render(t, e, s) {
        us(e.classList, s.value);
    }
};

ls = n([ je("hf") ], ls);

let hs = class SetStyleAttributeRenderer {
    render(t, e, s) {
        e.style.cssText += s.value;
    }
};

hs = n([ je("hg") ], hs);

let as = class StylePropertyBindingRenderer {
    constructor(t, e, s) {
        this.parser = t;
        this.oL = e;
        this.p = s;
    }
    render(t, e, s) {
        const n = _e(this.parser, s.from, 48 | i.BindingMode.toView);
        const r = new PropertyBinding(n, e.style, s.to, i.BindingMode.toView, this.oL, t.container, this.p.domWriteQueue);
        t.addBinding(38962 === n.$kind ? is(r, n, t.container) : r);
    }
};

as = n([ je("hd"), r(0, i.IExpressionParser), r(1, i.IObserverLocator), r(2, C) ], as);

let cs = class AttributeBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, s) {
        const n = _e(this.parser, s.from, 48 | i.BindingMode.toView);
        const r = new AttributeBinding(n, e, s.attr, s.to, i.BindingMode.toView, this.oL, t.container);
        t.addBinding(38962 === n.$kind ? is(r, n, t.container) : r);
    }
};

cs = n([ je("hc"), r(0, i.IExpressionParser), r(1, i.IObserverLocator) ], cs);

function us(t, e) {
    const s = e.length;
    let i = 0;
    for (let n = 0; n < s; ++n) if (32 === e.charCodeAt(n)) {
        if (n !== i) t.add(e.slice(i, n));
        i = n + 1;
    } else if (n + 1 === s) t.add(e.slice(i));
}

const fs = "IController";

const ds = "IInstruction";

const ps = "IRenderLocation";

const xs = "IAuSlotsInfo";

function vs(t, e, i, n, r, o) {
    const l = e.container.createChild();
    l.registerResolver(t.HTMLElement, l.registerResolver(t.Element, l.registerResolver(be, new s.InstanceProvider("ElementResolver", i))));
    l.registerResolver(ue, new s.InstanceProvider(fs, e));
    l.registerResolver(Ue, new s.InstanceProvider(ds, n));
    l.registerResolver(Ae, null == r ? gs : new s.InstanceProvider(ps, r));
    l.registerResolver(_t, ws);
    l.registerResolver(qe, null == o ? ys : new s.InstanceProvider(xs, o));
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

function ms(t, e, i, n, r, o, l, h) {
    const a = i.container.createChild();
    a.registerResolver(t.HTMLElement, a.registerResolver(t.Element, a.registerResolver(be, new s.InstanceProvider("ElementResolver", n))));
    a.registerResolver(ue, new s.InstanceProvider(fs, i));
    a.registerResolver(Ue, new s.InstanceProvider(ds, r));
    a.registerResolver(Ae, null == l ? gs : new s.InstanceProvider(ps, l));
    a.registerResolver(_t, null == o ? ws : new ViewFactoryProvider(o));
    a.registerResolver(qe, null == h ? ys : new s.InstanceProvider(xs, h));
    return a.invoke(e.Type);
}

const gs = new s.InstanceProvider(ps);

const ws = new ViewFactoryProvider(null);

const ys = new s.InstanceProvider(xs, new AuSlotsInfo(s.emptyArray));

function bs(t) {
    return function(e) {
        return As.define(t, e);
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
        const r = As.getAnnotation;
        return new BindingCommandDefinition(e, s.firstDefined(r(e, "name"), i), s.mergeArrays(r(e, "aliases"), n.aliases, e.aliases), As.keyFrom(i), s.firstDefined(r(e, "type"), n.type, e.type, null));
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        s.Registration.singleton(n, e).register(t);
        s.Registration.aliasTo(n, e).register(t);
        i.registerAliases(r, As, n, t);
    }
}

const ks = s.Protocol.resource.keyFor("binding-command");

const As = Object.freeze({
    name: ks,
    keyFrom(t) {
        return `${ks}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s.Metadata.hasOwn(ks, t);
    },
    define(t, e) {
        const i = BindingCommandDefinition.create(t, e);
        s.Metadata.define(ks, i, i.Type);
        s.Metadata.define(ks, i, i);
        s.Protocol.resource.appendTo(e, ks);
        return i.Type;
    },
    getDefinition(t) {
        const e = s.Metadata.getOwn(ks, t);
        if (void 0 === e) throw new Error(`AUR0758:${t.name}`);
        return e;
    },
    annotate(t, e, i) {
        s.Metadata.define(s.Protocol.annotation.keyFor(e), i, t);
    },
    getAnnotation(t, e) {
        return s.Metadata.getOwn(s.Protocol.annotation.keyFor(e), t);
    }
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
        let r = n.target;
        let o = t.attr.rawValue;
        if (null == t.bindable) r = null !== (e = this.m.map(t.node, r)) && void 0 !== e ? e : s.camelCase(r); else {
            if ("" === o && 1 === t.def.type) o = s.camelCase(r);
            r = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(o, 49), r, i.BindingMode.oneTime);
    }
};

exports.OneTimeBindingCommand.inject = [ E, i.IExpressionParser ];

exports.OneTimeBindingCommand = n([ bs("one-time") ], exports.OneTimeBindingCommand);

exports.ToViewBindingCommand = class ToViewBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 50;
    }
    build(t) {
        var e;
        const n = t.attr;
        let r = n.target;
        let o = t.attr.rawValue;
        if (null == t.bindable) r = null !== (e = this.m.map(t.node, r)) && void 0 !== e ? e : s.camelCase(r); else {
            if ("" === o && 1 === t.def.type) o = s.camelCase(r);
            r = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(o, 50), r, i.BindingMode.toView);
    }
};

exports.ToViewBindingCommand.inject = [ E, i.IExpressionParser ];

exports.ToViewBindingCommand = n([ bs("to-view") ], exports.ToViewBindingCommand);

exports.FromViewBindingCommand = class FromViewBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 51;
    }
    build(t) {
        var e;
        const n = t.attr;
        let r = n.target;
        let o = n.rawValue;
        if (null == t.bindable) r = null !== (e = this.m.map(t.node, r)) && void 0 !== e ? e : s.camelCase(r); else {
            if ("" === o && 1 === t.def.type) o = s.camelCase(r);
            r = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(o, 51), r, i.BindingMode.fromView);
    }
};

exports.FromViewBindingCommand.inject = [ E, i.IExpressionParser ];

exports.FromViewBindingCommand = n([ bs("from-view") ], exports.FromViewBindingCommand);

exports.TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 52;
    }
    build(t) {
        var e;
        const n = t.attr;
        let r = n.target;
        let o = n.rawValue;
        if (null == t.bindable) r = null !== (e = this.m.map(t.node, r)) && void 0 !== e ? e : s.camelCase(r); else {
            if ("" === o && 1 === t.def.type) o = s.camelCase(r);
            r = t.bindable.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(o, 52), r, i.BindingMode.twoWay);
    }
};

exports.TwoWayBindingCommand.inject = [ E, i.IExpressionParser ];

exports.TwoWayBindingCommand = n([ bs("two-way") ], exports.TwoWayBindingCommand);

exports.DefaultBindingCommand = class DefaultBindingCommand {
    constructor(t, e) {
        this.m = t;
        this.xp = e;
        this.bindingType = 53;
    }
    build(t) {
        var e;
        const n = t.attr;
        const r = t.bindable;
        let o;
        let l;
        let h = n.target;
        let a = n.rawValue;
        if (null == r) {
            l = this.m.isTwoWay(t.node, h) ? i.BindingMode.twoWay : i.BindingMode.toView;
            h = null !== (e = this.m.map(t.node, h)) && void 0 !== e ? e : s.camelCase(h);
        } else {
            if ("" === a && 1 === t.def.type) a = s.camelCase(h);
            o = t.def.defaultBindingMode;
            l = r.mode === i.BindingMode.default || null == r.mode ? null == o || o === i.BindingMode.default ? i.BindingMode.toView : o : r.mode;
            h = r.property;
        }
        return new PropertyBindingInstruction(this.xp.parse(a, 53), h, l);
    }
};

exports.DefaultBindingCommand.inject = [ E, i.IExpressionParser ];

exports.DefaultBindingCommand = n([ bs("bind") ], exports.DefaultBindingCommand);

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

exports.CallBindingCommand = n([ bs("call") ], exports.CallBindingCommand);

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

exports.ForBindingCommand = n([ bs("for") ], exports.ForBindingCommand);

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

exports.TriggerBindingCommand = n([ bs("trigger") ], exports.TriggerBindingCommand);

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

exports.DelegateBindingCommand = n([ bs("delegate") ], exports.DelegateBindingCommand);

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

exports.CaptureBindingCommand = n([ bs("capture") ], exports.CaptureBindingCommand);

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

exports.AttrBindingCommand = n([ bs("attr") ], exports.AttrBindingCommand);

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

exports.StyleBindingCommand = n([ bs("style") ], exports.StyleBindingCommand);

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

exports.ClassBindingCommand = n([ bs("class") ], exports.ClassBindingCommand);

let Cs = class RefBindingCommand {
    constructor(t) {
        this.xp = t;
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new RefBindingInstruction(this.xp.parse(t.attr.rawValue, 32), t.attr.target);
    }
};

Cs.inject = [ i.IExpressionParser ];

Cs = n([ bs("ref") ], Cs);

const Rs = s.DI.createInterface("ITemplateElementFactory", (t => t.singleton(TemplateElementFactory)));

const Ss = {};

class TemplateElementFactory {
    constructor(t) {
        this.p = t;
        this.Kt = t.document.createElement("template");
    }
    createTemplate(t) {
        var e;
        if ("string" === typeof t) {
            let e = Ss[t];
            if (void 0 === e) {
                const s = this.Kt;
                s.innerHTML = t;
                const i = s.content.firstElementChild;
                if (null == i || "TEMPLATE" !== i.nodeName || null != i.nextElementSibling) {
                    this.Kt = this.p.document.createElement("template");
                    e = s;
                } else {
                    s.content.removeChild(i);
                    e = i;
                }
                Ss[t] = e;
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

TemplateElementFactory.inject = [ C ];

const Es = function(t) {
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
        return s.Registration.singleton(Me, this).register(t);
    }
    compile(t, e, i) {
        var n, r, o, l;
        const h = CustomElementDefinition.getOrCreate(t);
        if (null === h.template || void 0 === h.template) return h;
        if (false === h.needsCompile) return h;
        null !== i && void 0 !== i ? i : i = Is;
        const a = new CompilationContext(t, e, i, null, null, void 0);
        const c = "string" === typeof h.template || !t.enhance ? a.Yt.createTemplate(h.template) : h.template;
        const u = "TEMPLATE" === c.nodeName && null != c.content;
        const f = u ? c.content : c;
        const d = e.get(Es(js));
        const p = d.length;
        let x = 0;
        if (p > 0) while (p > x) {
            null === (r = (n = d[x]).compiling) || void 0 === r ? void 0 : r.call(n, c);
            ++x;
        }
        if (c.hasAttribute(Fs)) throw new Error("AUR0701");
        this.Zt(f, a);
        this.Jt(f, a);
        return CustomElementDefinition.create({
            ...t,
            name: t.name || bt.generateName(),
            dependencies: (null !== (o = t.dependencies) && void 0 !== o ? o : s.emptyArray).concat(null !== (l = a.deps) && void 0 !== l ? l : s.emptyArray),
            instructions: a.rows,
            surrogates: u ? this.Qt(c, a) : s.emptyArray,
            template: c,
            hasSlots: a.hasSlot,
            needsCompile: false
        });
    }
    Qt(t, e) {
        var i;
        const n = [];
        const r = t.attributes;
        const o = e.te;
        let l = r.length;
        let h = 0;
        let a;
        let c;
        let u;
        let f;
        let d = null;
        let p;
        let x;
        let v;
        let m;
        let g = null;
        let w;
        let y;
        let b;
        let k;
        for (;l > h; ++h) {
            a = r[h];
            c = a.name;
            u = a.value;
            f = e.ee.parse(c, u);
            b = f.target;
            k = f.rawValue;
            if ($s[b]) throw new Error(`AUR0702:${c}`);
            g = e.se(f);
            if (null !== g && (4096 & g.bindingType) > 0) {
                Ps.node = t;
                Ps.attr = f;
                Ps.bindable = null;
                Ps.def = null;
                n.push(g.build(Ps));
                continue;
            }
            d = e.ie(b);
            if (null !== d) {
                if (d.isTemplateController) throw new Error(`AUR0703:${b}`);
                v = BindablesInfo.from(d, true);
                y = false === d.noMultiBindings && null === g && Bs(k);
                if (y) x = this.ne(t, k, d, e); else {
                    m = v.primary;
                    if (null === g) {
                        w = o.parse(k, 2048);
                        x = [ null === w ? new SetPropertyInstruction(k, m.property) : new InterpolationInstruction(w, m.property) ];
                    } else {
                        Ps.node = t;
                        Ps.attr = f;
                        Ps.bindable = m;
                        Ps.def = d;
                        x = [ g.build(Ps) ];
                    }
                }
                t.removeAttribute(c);
                --h;
                --l;
                (null !== p && void 0 !== p ? p : p = []).push(new HydrateAttributeInstruction(this.resolveResources ? d : d.name, null != d.aliases && d.aliases.includes(b) ? b : void 0, x));
                continue;
            }
            if (null === g) {
                w = o.parse(k, 2048);
                if (null != w) {
                    t.removeAttribute(c);
                    --h;
                    --l;
                    n.push(new InterpolationInstruction(w, null !== (i = e.re.map(t, b)) && void 0 !== i ? i : s.camelCase(b)));
                } else switch (c) {
                  case "class":
                    n.push(new SetClassAttributeInstruction(k));
                    break;

                  case "style":
                    n.push(new SetStyleAttributeInstruction(k));
                    break;

                  default:
                    n.push(new SetAttributeInstruction(k, c));
                }
            } else {
                Ps.node = t;
                Ps.attr = f;
                Ps.bindable = null;
                Ps.def = null;
                n.push(g.build(Ps));
            }
        }
        Ts();
        if (null != p) return p.concat(n);
        return n;
    }
    Jt(t, e) {
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
                let s = t.firstChild;
                while (null !== s) s = this.Jt(s, e);
                break;
            }
        }
        return t.nextSibling;
    }
    oe(t, e) {
        const n = t.attributes;
        const r = n.length;
        const o = [];
        const l = e.te;
        let h = false;
        let a = 0;
        let c;
        let u;
        let f;
        let d;
        let p;
        let x;
        let v;
        let m;
        for (;r > a; ++a) {
            c = n[a];
            f = c.name;
            d = c.value;
            if ("to-binding-context" === f) {
                h = true;
                continue;
            }
            u = e.ee.parse(f, d);
            x = u.target;
            v = u.rawValue;
            p = e.se(u);
            if (null !== p) {
                if (50 === p.bindingType || 53 === p.bindingType) {
                    o.push(new LetBindingInstruction(l.parse(v, p.bindingType), s.camelCase(x)));
                    continue;
                }
                throw new Error(`AUR0704:${u.command}`);
            }
            m = l.parse(v, 2048);
            o.push(new LetBindingInstruction(null === m ? new i.PrimitiveLiteralExpression(v) : m, s.camelCase(x)));
        }
        e.rows.push([ new HydrateLetElementInstruction(o, h) ]);
        return this.ae(t).nextSibling;
    }
    le(t, e) {
        var i, n, r, o, l;
        var h, a;
        const c = t.nextSibling;
        const u = (null !== (i = t.getAttribute("as-element")) && void 0 !== i ? i : t.nodeName).toLowerCase();
        const f = e.ce(u);
        const d = e.te;
        const p = this.debug ? s.noop : () => {
            t.removeAttribute(y);
            --g;
            --m;
        };
        let x = t.attributes;
        let v;
        let m = x.length;
        let g = 0;
        let w;
        let y;
        let b;
        let k;
        let A;
        let C;
        let R = null;
        let S = false;
        let E;
        let B;
        let T;
        let I;
        let D;
        let P;
        let $;
        let O = null;
        let L;
        let q;
        let U;
        let F;
        let M = true;
        let V = false;
        if ("slot" === u) e.root.hasSlot = true;
        if (null !== f) {
            M = null === (n = f.processContent) || void 0 === n ? void 0 : n.call(f.Type, t, e.p);
            x = t.attributes;
            m = x.length;
        }
        if (e.root.def.enhance && t.classList.contains("au")) throw new Error(`AUR0705`);
        for (;m > g; ++g) {
            w = x[g];
            y = w.name;
            b = w.value;
            switch (y) {
              case "as-element":
              case "containerless":
                p();
                if (!V) V = "containerless" === y;
                continue;
            }
            k = e.ee.parse(y, b);
            O = e.se(k);
            if (null !== O && 4096 & O.bindingType) {
                Ps.node = t;
                Ps.attr = k;
                Ps.bindable = null;
                Ps.def = null;
                (null !== A && void 0 !== A ? A : A = []).push(O.build(Ps));
                p();
                continue;
            }
            U = k.target;
            F = k.rawValue;
            R = e.ie(U);
            if (null !== R) {
                L = BindablesInfo.from(R, true);
                S = false === R.noMultiBindings && null === O && Bs(b);
                if (S) T = this.ne(t, b, R, e); else {
                    q = L.primary;
                    if (null === O) {
                        P = d.parse(b, 2048);
                        T = [ null === P ? new SetPropertyInstruction(b, q.property) : new InterpolationInstruction(P, q.property) ];
                    } else {
                        Ps.node = t;
                        Ps.attr = k;
                        Ps.bindable = q;
                        Ps.def = R;
                        T = [ O.build(Ps) ];
                    }
                }
                p();
                if (R.isTemplateController) (null !== I && void 0 !== I ? I : I = []).push(new HydrateTemplateController(Ds, this.resolveResources ? R : R.name, void 0, T)); else (null !== B && void 0 !== B ? B : B = []).push(new HydrateAttributeInstruction(this.resolveResources ? R : R.name, null != R.aliases && R.aliases.includes(U) ? U : void 0, T));
                continue;
            }
            if (null === O) {
                if (null !== f) {
                    L = BindablesInfo.from(f, false);
                    E = L.attrs[U];
                    if (void 0 !== E) {
                        P = d.parse(F, 2048);
                        (null !== C && void 0 !== C ? C : C = []).push(null == P ? new SetPropertyInstruction(F, E.property) : new InterpolationInstruction(P, E.property));
                        p();
                        continue;
                    }
                }
                P = d.parse(F, 2048);
                if (null != P) {
                    p();
                    (null !== A && void 0 !== A ? A : A = []).push(new InterpolationInstruction(P, null !== (r = e.re.map(t, U)) && void 0 !== r ? r : s.camelCase(U)));
                }
                continue;
            }
            p();
            if (null !== f) {
                L = BindablesInfo.from(f, false);
                E = L.attrs[U];
                if (void 0 !== E) {
                    Ps.node = t;
                    Ps.attr = k;
                    Ps.bindable = E;
                    Ps.def = f;
                    (null !== C && void 0 !== C ? C : C = []).push(O.build(Ps));
                    continue;
                }
            }
            Ps.node = t;
            Ps.attr = k;
            Ps.bindable = null;
            Ps.def = null;
            (null !== A && void 0 !== A ? A : A = []).push(O.build(Ps));
        }
        Ts();
        if (this.ue(t) && null != A && A.length > 1) this.fe(t, A);
        if (null !== f) {
            $ = new HydrateElementInstruction(this.resolveResources ? f : f.name, void 0, null !== C && void 0 !== C ? C : s.emptyArray, null, V);
            if ("au-slot" === u) {
                const s = t.getAttribute("name") || "default";
                const i = e.h("template");
                const n = e.de();
                let r = t.firstChild;
                while (null !== r) {
                    if (1 === r.nodeType && r.hasAttribute("au-slot")) t.removeChild(r); else i.content.appendChild(r);
                    r = t.firstChild;
                }
                this.Jt(i.content, n);
                $.auSlot = {
                    name: s,
                    fallback: CustomElementDefinition.create({
                        name: bt.generateName(),
                        template: i,
                        instructions: n.rows,
                        needsCompile: false
                    })
                };
                t = this.pe(t, e);
            }
        }
        if (null != A || null != $ || null != B) {
            v = s.emptyArray.concat(null !== $ && void 0 !== $ ? $ : s.emptyArray, null !== B && void 0 !== B ? B : s.emptyArray, null !== A && void 0 !== A ? A : s.emptyArray);
            this.ae(t);
        }
        let j;
        if (null != I) {
            m = I.length - 1;
            g = m;
            D = I[g];
            let s;
            this.pe(t, e);
            if ("TEMPLATE" === t.nodeName) s = t; else {
                s = e.h("template");
                s.content.appendChild(t);
            }
            const i = s;
            const n = e.de(null == v ? [] : [ v ]);
            j = null === f || !f.containerless && !V && false !== M;
            if (null !== f && f.containerless) this.pe(t, e);
            let r;
            let l;
            let a;
            let c;
            let u;
            let d;
            let p;
            let x;
            let w;
            let y = 0, b = 0;
            if (j) {
                if (null !== f) {
                    r = t.firstChild;
                    while (null !== r) if (1 === r.nodeType) {
                        l = r;
                        r = r.nextSibling;
                        a = l.getAttribute("au-slot");
                        if (null !== a) {
                            if ("" === a) a = "default";
                            l.removeAttribute("au-slot");
                            t.removeChild(l);
                            (null !== (o = (h = null !== u && void 0 !== u ? u : u = {})[a]) && void 0 !== o ? o : h[a] = []).push(l);
                        }
                    } else r = r.nextSibling;
                    if (null != u) {
                        c = {};
                        for (a in u) {
                            s = e.h("template");
                            d = u[a];
                            for (y = 0, b = d.length; b > y; ++y) {
                                p = d[y];
                                if ("TEMPLATE" === p.nodeName) if (p.attributes.length > 0) s.content.appendChild(p); else s.content.appendChild(p.content); else s.content.appendChild(p);
                            }
                            w = e.de();
                            this.Jt(s.content, w);
                            c[a] = CustomElementDefinition.create({
                                name: bt.generateName(),
                                template: s,
                                instructions: w.rows,
                                needsCompile: false,
                                isStrictBinding: e.root.def.isStrictBinding
                            });
                        }
                        $.projections = c;
                    }
                }
                if ("TEMPLATE" === t.nodeName) this.Jt(t.content, n); else {
                    r = t.firstChild;
                    while (null !== r) r = this.Jt(r, n);
                }
            }
            D.def = CustomElementDefinition.create({
                name: bt.generateName(),
                template: i,
                instructions: n.rows,
                needsCompile: false,
                isStrictBinding: e.root.def.isStrictBinding
            });
            while (g-- > 0) {
                D = I[g];
                s = e.h("template");
                x = e.h("au-m");
                x.classList.add("au");
                s.content.appendChild(x);
                D.def = CustomElementDefinition.create({
                    name: bt.generateName(),
                    template: s,
                    needsCompile: false,
                    instructions: [ [ I[g + 1] ] ],
                    isStrictBinding: e.root.def.isStrictBinding
                });
            }
            e.rows.push([ D ]);
        } else {
            if (null != v) e.rows.push(v);
            j = null === f || !f.containerless && !V && false !== M;
            if (null !== f && f.containerless) this.pe(t, e);
            if (j && t.childNodes.length > 0) {
                let s = t.firstChild;
                let i;
                let n;
                let r = null;
                let o;
                let h;
                let c;
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
                        (null !== (l = (a = null !== o && void 0 !== o ? o : o = {})[n]) && void 0 !== l ? l : a[n] = []).push(i);
                    }
                } else s = s.nextSibling;
                if (null != o) {
                    r = {};
                    for (n in o) {
                        u = e.h("template");
                        h = o[n];
                        for (p = 0, x = h.length; x > p; ++p) {
                            c = h[p];
                            if ("TEMPLATE" === c.nodeName) if (c.attributes.length > 0) u.content.appendChild(c); else u.content.appendChild(c.content); else u.content.appendChild(c);
                        }
                        d = e.de();
                        this.Jt(u.content, d);
                        r[n] = CustomElementDefinition.create({
                            name: bt.generateName(),
                            template: u,
                            instructions: d.rows,
                            needsCompile: false,
                            isStrictBinding: e.root.def.isStrictBinding
                        });
                    }
                    $.projections = r;
                }
                s = t.firstChild;
                while (null !== s) s = this.Jt(s, e);
            }
        }
        return c;
    }
    he(t, e) {
        let s = "";
        let i = t;
        while (null !== i && 3 === i.nodeType) {
            s += i.textContent;
            i = i.nextSibling;
        }
        const n = e.te.parse(s, 2048);
        if (null === n) return i;
        const r = t.parentNode;
        r.insertBefore(this.ae(e.h("au-m")), t);
        e.rows.push([ new TextBindingInstruction(n, !!e.def.isStrictBinding) ]);
        t.textContent = "";
        i = t.nextSibling;
        while (null !== i && 3 === i.nodeType) {
            r.removeChild(i);
            i = t.nextSibling;
        }
        return t.nextSibling;
    }
    ne(t, e, s, i) {
        const n = BindablesInfo.from(s, true);
        const r = e.length;
        const o = [];
        let l;
        let h;
        let a = 0;
        let c = 0;
        let u;
        let f;
        let d;
        let p;
        for (let x = 0; x < r; ++x) {
            c = e.charCodeAt(x);
            if (92 === c) ++x; else if (58 === c) {
                l = e.slice(a, x);
                while (e.charCodeAt(++x) <= 32) ;
                a = x;
                for (;x < r; ++x) {
                    c = e.charCodeAt(x);
                    if (92 === c) ++x; else if (59 === c) {
                        h = e.slice(a, x);
                        break;
                    }
                }
                if (void 0 === h) h = e.slice(a);
                f = i.ee.parse(l, h);
                d = i.se(f);
                p = n.attrs[f.target];
                if (null == p) throw new Error(`AUR0707:${s.name}.${f.target}`);
                if (null === d) {
                    u = i.te.parse(h, 2048);
                    o.push(null === u ? new SetPropertyInstruction(h, p.property) : new InterpolationInstruction(u, p.property));
                } else {
                    Ps.node = t;
                    Ps.attr = f;
                    Ps.bindable = p;
                    Ps.def = s;
                    o.push(d.build(Ps));
                }
                while (x < r && e.charCodeAt(++x) <= 32) ;
                a = x;
                l = void 0;
                h = void 0;
            }
        }
        Ts();
        return o;
    }
    Zt(t, e) {
        const i = t;
        const n = s.toArray(i.querySelectorAll("template[as-custom-element]"));
        const r = n.length;
        if (0 === r) return;
        if (r === i.childElementCount) throw new Error("AUR0708");
        const o = new Set;
        for (const t of n) {
            if (t.parentNode !== i) throw new Error("AUR0709");
            const n = Ms(t, o);
            const r = class LocalTemplate {};
            const l = t.content;
            const h = s.toArray(l.querySelectorAll("bindable"));
            const c = a.for(r);
            const u = new Set;
            const f = new Set;
            for (const t of h) {
                if (t.parentNode !== l) throw new Error("AUR0710");
                const e = t.getAttribute("property");
                if (null === e) throw new Error("AUR0711");
                const s = t.getAttribute("attribute");
                if (null !== s && f.has(s) || u.has(e)) throw new Error(`AUR0712:${e}+${s}`); else {
                    if (null !== s) f.add(s);
                    u.add(e);
                }
                c.add({
                    property: e,
                    attribute: null !== s && void 0 !== s ? s : void 0,
                    mode: Vs(t)
                });
                const i = t.getAttributeNames().filter((t => !Us.includes(t)));
                if (i.length > 0) ;
                l.removeChild(t);
            }
            e.xe(bt.define({
                name: n,
                template: t
            }, r));
            i.removeChild(t);
        }
    }
    ue(t) {
        return "INPUT" === t.nodeName && 1 === Os[t.type];
    }
    fe(t, e) {
        switch (t.nodeName) {
          case "INPUT":
            {
                const t = e;
                let s;
                let i;
                let n = 0;
                let r;
                for (let e = 0; e < t.length && n < 3; e++) {
                    r = t[e];
                    switch (r.to) {
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
    ae(t) {
        t.classList.add("au");
        return t;
    }
    pe(t, e) {
        const s = t.parentNode;
        const i = e.h("au-m");
        this.ae(s.insertBefore(i, t));
        s.removeChild(t);
        return i;
    }
}

class CompilationContext {
    constructor(t, e, n, r, o, l) {
        this.hasSlot = false;
        this.ve = y();
        const h = null !== r;
        this.c = e;
        this.root = null === o ? this : o;
        this.def = t;
        this.ci = n;
        this.parent = r;
        this.Yt = h ? r.Yt : e.get(Rs);
        this.ee = h ? r.ee : e.get(x);
        this.te = h ? r.te : e.get(i.IExpressionParser);
        this.re = h ? r.re : e.get(E);
        this.Ot = h ? r.Ot : e.get(s.ILogger);
        this.p = h ? r.p : e.get(C);
        this.localEls = h ? r.localEls : new Set;
        this.rows = null !== l && void 0 !== l ? l : [];
    }
    xe(t) {
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
    ce(t) {
        return this.c.find(bt, t);
    }
    ie(t) {
        return this.c.find(ct, t);
    }
    de(t) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, t);
    }
    se(t) {
        if (this.root !== this) return this.root.se(t);
        const e = t.command;
        if (null === e) return null;
        let s = this.ve[e];
        if (void 0 === s) {
            s = this.c.create(As, e);
            if (null === s) throw new Error(`AUR0713:${e}`);
            this.ve[e] = s;
        }
        return s;
    }
}

function Bs(t) {
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

function Ts() {
    Ps.node = Ps.attr = Ps.bindable = Ps.def = null;
}

const Is = {
    projections: null
};

const Ds = {
    name: "unnamed"
};

const Ps = {
    node: null,
    attr: null,
    bindable: null,
    def: null
};

const $s = Object.assign(y(), {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
});

const Os = {
    checkbox: 1,
    radio: 1
};

const Ls = new WeakMap;

class BindablesInfo {
    constructor(t, e, s) {
        this.attrs = t;
        this.bindables = e;
        this.primary = s;
    }
    static from(t, e) {
        let s = Ls.get(t);
        if (null == s) {
            const n = t.bindables;
            const r = y();
            const o = e ? void 0 === t.defaultBindingMode ? i.BindingMode.default : t.defaultBindingMode : i.BindingMode.default;
            let l;
            let h;
            let a = false;
            let c;
            let u;
            for (h in n) {
                l = n[h];
                u = l.attribute;
                if (true === l.primary) {
                    if (a) throw new Error(`AUR0714:${t.name}`);
                    a = true;
                    c = l;
                } else if (!a && null == c) c = l;
                r[u] = BindableDefinition.create(h, l);
            }
            if (null == l && e) c = r.value = BindableDefinition.create("value", {
                mode: o
            });
            Ls.set(t, s = new BindablesInfo(r, n, c));
        }
        return s;
    }
}

var qs;

(function(t) {
    t["property"] = "property";
    t["attribute"] = "attribute";
    t["mode"] = "mode";
})(qs || (qs = {}));

const Us = Object.freeze([ "property", "attribute", "mode" ]);

const Fs = "as-custom-element";

function Ms(t, e) {
    const s = t.getAttribute(Fs);
    if (null === s || "" === s) throw new Error("AUR0715");
    if (e.has(s)) throw new Error(`AUR0716:${s}`); else {
        e.add(s);
        t.removeAttribute(Fs);
    }
    return s;
}

function Vs(t) {
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

const js = s.DI.createInterface("ITemplateCompilerHooks");

const _s = new WeakMap;

const Ns = s.Protocol.resource.keyFor("compiler-hooks");

const Hs = Object.freeze({
    name: Ns,
    define(t) {
        let e = _s.get(t);
        if (void 0 === e) {
            _s.set(t, e = new TemplateCompilerHooksDefinition(t));
            s.Metadata.define(Ns, e, t);
            s.Protocol.resource.appendTo(t, Ns);
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
        t.register(s.Registration.singleton(js, this.Type));
    }
}

const Ws = t => {
    return void 0 === t ? e : e(t);
    function e(t) {
        return Hs.define(t);
    }
};

class BindingModeBehavior {
    constructor(t) {
        this.mode = t;
        this.me = new Map;
    }
    bind(t, e, s) {
        this.me.set(s, s.mode);
        s.mode = this.mode;
    }
    unbind(t, e, s) {
        s.mode = this.me.get(s);
        this.me.delete(s);
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

const zs = 200;

class DebounceBindingBehavior extends i.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: zs
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
            this.opts.delay = isNaN(s) ? zs : s;
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
        this.Gt = new Map;
        this.ge = t;
    }
    bind(t, e, s, ...i) {
        if (!("handleChange" in s)) throw new Error("AUR0817");
        if (0 === i.length) throw new Error("AUR0818");
        this.Gt.set(s, i);
        let n;
        for (n of i) this.ge.addSignalListener(n, s);
    }
    unbind(t, e, s) {
        const i = this.Gt.get(s);
        this.Gt.delete(s);
        let n;
        for (n of i) this.ge.removeSignalListener(n, s);
    }
}

SignalBindingBehavior.inject = [ i.ISignaler ];

i.bindingBehavior("signal")(SignalBindingBehavior);

const Gs = 200;

class ThrottleBindingBehavior extends i.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: Gs
        };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.we = t.locator.get(s.IPlatform);
        this.ye = this.we.taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.be((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, s) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.we.performanceNow();
        }
        this.binding.handleChange(t, e, s);
    }
    updateSource(t, e) {
        this.be((() => this.binding.updateSource(t, e)));
    }
    be(t) {
        const e = this.opts;
        const s = this.we;
        const i = this.lastCall + e.delay - s.performanceNow();
        if (i > 0) {
            const n = this.task;
            e.delay = i;
            this.task = this.ye.queueTask((() => {
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
            this.opts.delay = this.delay = isNaN(s) ? Gs : s;
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

const Xs = new DataAttributeAccessor;

class AttrBindingBehavior {
    bind(t, e, s) {
        s.targetObserver = Xs;
    }
    unbind(t, e, s) {
        return;
    }
}

i.bindingBehavior("attr")(AttrBindingBehavior);

function Ks(t) {
    const e = t.composedPath()[0];
    if (this.target !== e) return;
    return this.selfEventCallSource(t);
}

class SelfBindingBehavior {
    bind(t, e, s) {
        if (!s.callSource || !s.targetEvent) throw new Error("AUR0801");
        s.selfEventCallSource = s.callSource;
        s.callSource = Ks;
    }
    unbind(t, e, s) {
        s.callSource = s.selfEventCallSource;
        s.selfEventCallSource = null;
    }
}

i.bindingBehavior("self")(SelfBindingBehavior);

const Ys = y();

class AttributeNSAccessor {
    constructor(t) {
        this.ns = t;
        this.type = 2 | 4;
    }
    static forNs(t) {
        var e;
        return null !== (e = Ys[t]) && void 0 !== e ? e : Ys[t] = new AttributeNSAccessor(t);
    }
    getValue(t, e) {
        return t.getAttributeNS(this.ns, e);
    }
    setValue(t, e, s, i) {
        if (void 0 == t) s.removeAttributeNS(this.ns, i); else s.setAttributeNS(this.ns, i, t);
    }
}

function Zs(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, s, i) {
        this.handler = s;
        this.type = 2 | 1 | 4;
        this.value = void 0;
        this.t = void 0;
        this.ke = void 0;
        this.Ae = void 0;
        this.f = 0;
        this.obj = t;
        this.oL = i;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        const s = this.value;
        if (t === s) return;
        this.value = t;
        this.t = s;
        this.f = e;
        this.Ce();
        this.Re();
        this.queue.add(this);
    }
    handleCollectionChange(t, e) {
        this.Re();
    }
    handleChange(t, e, s) {
        this.Re();
    }
    Re() {
        const t = this.value;
        const e = this.obj;
        const s = b.call(e, "model") ? e.model : e.value;
        const i = "radio" === e.type;
        const n = void 0 !== e.matcher ? e.matcher : Zs;
        if (i) e.checked = !!n(t, s); else if (true === t) e.checked = true; else {
            let i = false;
            if (t instanceof Array) i = -1 !== t.findIndex((t => !!n(t, s))); else if (t instanceof Set) {
                for (const e of t) if (n(e, s)) {
                    i = true;
                    break;
                }
            } else if (t instanceof Map) for (const e of t) {
                const t = e[0];
                const r = e[1];
                if (n(t, s) && true === r) {
                    i = true;
                    break;
                }
            }
            e.checked = i;
        }
    }
    handleEvent() {
        let t = this.t = this.value;
        const e = this.obj;
        const s = b.call(e, "model") ? e.model : e.value;
        const i = e.checked;
        const n = void 0 !== e.matcher ? e.matcher : Zs;
        if ("checkbox" === e.type) {
            if (t instanceof Array) {
                const e = t.findIndex((t => !!n(t, s)));
                if (i && -1 === e) t.push(s); else if (!i && -1 !== e) t.splice(e, 1);
                return;
            } else if (t instanceof Set) {
                const e = {};
                let r = e;
                for (const e of t) if (true === n(e, s)) {
                    r = e;
                    break;
                }
                if (i && r === e) t.add(s); else if (!i && r !== e) t.delete(r);
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
        Js = this.t;
        this.t = this.value;
        this.subs.notify(this.value, Js, this.f);
    }
    Ce() {
        var t, e, s, i, n, r, o;
        const l = this.obj;
        null === (n = null !== (t = this.Ae) && void 0 !== t ? t : this.Ae = null !== (s = null === (e = l.$observers) || void 0 === e ? void 0 : e.model) && void 0 !== s ? s : null === (i = l.$observers) || void 0 === i ? void 0 : i.value) || void 0 === n ? void 0 : n.subscribe(this);
        null === (r = this.ke) || void 0 === r ? void 0 : r.unsubscribe(this);
        this.ke = void 0;
        if ("checkbox" === l.type) null === (o = this.ke = ci(this.value, this.oL)) || void 0 === o ? void 0 : o.subscribe(this);
    }
}

i.subscriberCollection(CheckedObserver);

i.withFlushQueue(CheckedObserver);

let Js;

const Qs = Object.prototype.hasOwnProperty;

const ti = {
    childList: true,
    subtree: true,
    characterData: true
};

function ei(t, e) {
    return t === e;
}

class SelectValueObserver {
    constructor(t, e, s, i) {
        this.handler = s;
        this.type = 2 | 1 | 4;
        this.value = void 0;
        this.t = void 0;
        this._ = false;
        this.Se = void 0;
        this.Ee = void 0;
        this.v = false;
        this.obj = t;
        this.oL = i;
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
        const s = this.obj;
        const i = Array.isArray(e);
        const n = null !== (t = s.matcher) && void 0 !== t ? t : ei;
        const r = s.options;
        let o = r.length;
        while (o-- > 0) {
            const t = r[o];
            const s = Qs.call(t, "model") ? t.model : t.value;
            if (i) {
                t.selected = -1 !== e.findIndex((t => !!n(s, t)));
                continue;
            }
            t.selected = !!n(s, e);
        }
    }
    syncValue() {
        const t = this.obj;
        const e = t.options;
        const s = e.length;
        const i = this.value;
        let n = 0;
        if (t.multiple) {
            if (!(i instanceof Array)) return true;
            let r;
            const o = t.matcher || ei;
            const l = [];
            while (n < s) {
                r = e[n];
                if (r.selected) l.push(Qs.call(r, "model") ? r.model : r.value);
                ++n;
            }
            let h;
            n = 0;
            while (n < i.length) {
                h = i[n];
                if (-1 === l.findIndex((t => !!o(h, t)))) i.splice(n, 1); else ++n;
            }
            n = 0;
            while (n < l.length) {
                h = l[n];
                if (-1 === i.findIndex((t => !!o(h, t)))) i.push(h);
                ++n;
            }
            return false;
        }
        let r = null;
        let o;
        while (n < s) {
            o = e[n];
            if (o.selected) {
                r = Qs.call(o, "model") ? o.model : o.value;
                break;
            }
            ++n;
        }
        this.t = this.value;
        this.value = r;
        return true;
    }
    Te() {
        (this.Ee = new this.obj.ownerDocument.defaultView.MutationObserver(this.Ie.bind(this))).observe(this.obj, ti);
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
    Ie() {
        this.syncOptions();
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.obj, this);
            this.Te();
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.handler.dispose();
            this.De();
        }
    }
    flush() {
        si = this.t;
        this.t = this.value;
        this.subs.notify(this.value, si, 0);
    }
}

i.subscriberCollection(SelectValueObserver);

i.withFlushQueue(SelectValueObserver);

let si;

const ii = "--";

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
        const s = /url\([^)]+$/;
        let i = 0;
        let n = "";
        let r;
        let o;
        let l;
        let h;
        while (i < t.length) {
            r = t.indexOf(";", i);
            if (-1 === r) r = t.length;
            n += t.substring(i, r);
            i = r + 1;
            if (s.test(n)) {
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
    $e(t) {
        let e;
        let i;
        const n = [];
        for (i in t) {
            e = t[i];
            if (null == e) continue;
            if ("string" === typeof e) {
                if (i.startsWith(ii)) {
                    n.push([ i, e ]);
                    continue;
                }
                n.push([ s.kebabCase(i), e ]);
                continue;
            }
            n.push(...this.Oe(e));
        }
        return n;
    }
    Le(t) {
        const e = t.length;
        if (e > 0) {
            const s = [];
            let i = 0;
            for (;e > i; ++i) s.push(...this.Oe(t[i]));
            return s;
        }
        return s.emptyArray;
    }
    Oe(t) {
        if ("string" === typeof t) return this.Pe(t);
        if (t instanceof Array) return this.Le(t);
        if (t instanceof Object) return this.$e(t);
        return s.emptyArray;
    }
    N() {
        if (this._) {
            this._ = false;
            const t = this.value;
            const e = this.styles;
            const s = this.Oe(t);
            let i;
            let n = this.version;
            this.t = t;
            let r;
            let o;
            let l;
            let h = 0;
            const a = s.length;
            for (;h < a; ++h) {
                r = s[h];
                o = r[0];
                l = r[1];
                this.setProperty(o, l);
                e[o] = n;
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
        this.value = this.t = this.obj.style.cssText;
    }
}

class ValueAttributeObserver {
    constructor(t, e, s) {
        this.key = e;
        this.handler = s;
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
        ni = this.t;
        this.t = this.value;
        this.subs.notify(this.value, ni, 0);
    }
}

i.subscriberCollection(ValueAttributeObserver);

i.withFlushQueue(ValueAttributeObserver);

let ni;

const ri = "http://www.w3.org/1999/xlink";

const oi = "http://www.w3.org/XML/1998/namespace";

const li = "http://www.w3.org/2000/xmlns/";

const hi = Object.assign(y(), {
    "xlink:actuate": [ "actuate", ri ],
    "xlink:arcrole": [ "arcrole", ri ],
    "xlink:href": [ "href", ri ],
    "xlink:role": [ "role", ri ],
    "xlink:show": [ "show", ri ],
    "xlink:title": [ "title", ri ],
    "xlink:type": [ "type", ri ],
    "xml:lang": [ "lang", oi ],
    "xml:space": [ "space", oi ],
    xmlns: [ "xmlns", li ],
    "xmlns:xlink": [ "xlink", li ]
});

const ai = new i.PropertyAccessor;

ai.type = 2 | 4;

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
        this.qe = y();
        this.Ue = y();
        this.Fe = y();
        this.Me = y();
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
        s.Registration.aliasTo(i.INodeObserverLocator, NodeObserverLocator).register(t);
        s.Registration.singleton(i.INodeObserverLocator, NodeObserverLocator).register(t);
    }
    handles(t, e) {
        return t instanceof this.platform.Node;
    }
    useConfig(t, e, s) {
        var i, n;
        const r = this.qe;
        let o;
        if ("string" === typeof t) {
            o = null !== (i = r[t]) && void 0 !== i ? i : r[t] = y();
            if (null == o[e]) o[e] = new NodeObserverConfig(s); else ui(t, e);
        } else for (const s in t) {
            o = null !== (n = r[s]) && void 0 !== n ? n : r[s] = y();
            const i = t[s];
            for (e in i) if (null == o[e]) o[e] = new NodeObserverConfig(i[e]); else ui(s, e);
        }
    }
    useConfigGlobal(t, e) {
        const s = this.Ue;
        if ("object" === typeof t) for (const e in t) if (null == s[e]) s[e] = new NodeObserverConfig(t[e]); else ui("*", e); else if (null == s[t]) s[t] = new NodeObserverConfig(e); else ui("*", t);
    }
    getAccessor(t, e, i) {
        var n;
        if (e in this.Me || e in (null !== (n = this.Fe[t.tagName]) && void 0 !== n ? n : s.emptyObject)) return this.getObserver(t, e, i);
        switch (e) {
          case "src":
          case "href":
          case "role":
            return Xs;

          default:
            {
                const s = hi[e];
                if (void 0 !== s) return AttributeNSAccessor.forNs(s[1]);
                if (A(t, e, this.svgAnalyzer)) return Xs;
                return ai;
            }
        }
    }
    overrideAccessor(t, e) {
        var s, i;
        var n, r;
        let o;
        if ("string" === typeof t) {
            o = null !== (s = (n = this.Fe)[t]) && void 0 !== s ? s : n[t] = y();
            o[e] = true;
        } else for (const e in t) for (const s of t[e]) {
            o = null !== (i = (r = this.Fe)[e]) && void 0 !== i ? i : r[e] = y();
            o[s] = true;
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) this.Me[e] = true;
    }
    getObserver(t, e, s) {
        var n, r;
        switch (e) {
          case "role":
            return Xs;

          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const o = null !== (r = null === (n = this.qe[t.tagName]) || void 0 === n ? void 0 : n[e]) && void 0 !== r ? r : this.Ue[e];
        if (null != o) return new o.type(t, e, new EventSubscriber(o), s, this.locator);
        const l = hi[e];
        if (void 0 !== l) return AttributeNSAccessor.forNs(l[1]);
        if (A(t, e, this.svgAnalyzer)) return Xs;
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) return this.dirtyChecker.createProperty(t, e);
            throw new Error(`AUR0652:${String(e)}`);
        } else return new i.SetterObserver(t, e);
    }
}

NodeObserverLocator.inject = [ s.IServiceLocator, C, i.IDirtyChecker, R ];

function ci(t, e) {
    if (t instanceof Array) return e.getArrayObserver(t);
    if (t instanceof Map) return e.getMapObserver(t);
    if (t instanceof Set) return e.getSetObserver(t);
}

function ui(t, e) {
    throw new Error(`AUR0653:${String(e)}@${t}`);
}

class UpdateTriggerBindingBehavior {
    constructor(t) {
        this.oL = t;
    }
    bind(t, e, s, ...n) {
        if (0 === n.length) throw new Error(`AUR0802`);
        if (s.mode !== i.BindingMode.twoWay && s.mode !== i.BindingMode.fromView) throw new Error("AUR0803");
        const r = this.oL.getObserver(s.target, s.targetProperty);
        if (!r.handler) throw new Error("AUR0804");
        s.targetObserver = r;
        const o = r.handler;
        r.originalHandler = o;
        r.handler = new EventSubscriber(new NodeObserverConfig({
            default: o.config.default,
            events: n,
            readonly: o.config.readonly
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
        const s = this.value;
        if (s && !e) t.focus(); else if (!s && e) t.blur();
    }
    get isElFocused() {
        return this.Ve === this.p.document.activeElement;
    }
};

n([ o({
    mode: i.BindingMode.twoWay
}) ], exports.Focus.prototype, "value", void 0);

exports.Focus = n([ r(0, be), r(1, C) ], exports.Focus);

lt("focus")(exports.Focus);

let fi = class Show {
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

n([ o ], fi.prototype, "value", void 0);

fi = n([ r(0, be), r(1, C), r(2, Ue) ], fi);

i.alias("hide")(fi);

lt("show")(fi);

class Portal {
    constructor(t, e, i) {
        this.id = s.nextId("au$component");
        this.strict = false;
        this.p = i;
        this._e = i.document.createElement("div");
        this.view = t.create();
        Se(this.view.nodes, e);
    }
    attaching(t, e, s) {
        if (null == this.callbackContext) this.callbackContext = this.$controller.scope.bindingContext;
        const i = this._e = this.Ne();
        this.view.setHost(i);
        return this.He(t, i, s);
    }
    detaching(t, e, s) {
        return this.We(t, this._e, s);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) return;
        const e = this._e;
        const i = this._e = this.Ne();
        if (e === i) return;
        this.view.setHost(i);
        const n = s.onResolve(this.We(null, i, t.flags), (() => this.He(null, i, t.flags)));
        if (n instanceof Promise) n.catch((t => {
            throw t;
        }));
    }
    He(t, e, i) {
        const {activating: n, callbackContext: r, view: o} = this;
        o.setHost(e);
        return s.onResolve(null === n || void 0 === n ? void 0 : n.call(r, e, o), (() => this.ze(t, e, i)));
    }
    ze(t, e, i) {
        const {$controller: n, view: r} = this;
        if (null === t) r.nodes.appendTo(e); else return s.onResolve(r.activate(null !== t && void 0 !== t ? t : r, n, i, n.scope), (() => this.Ge(e)));
        return this.Ge(e);
    }
    Ge(t) {
        const {activated: e, callbackContext: s, view: i} = this;
        return null === e || void 0 === e ? void 0 : e.call(s, t, i);
    }
    We(t, e, i) {
        const {deactivating: n, callbackContext: r, view: o} = this;
        return s.onResolve(null === n || void 0 === n ? void 0 : n.call(r, e, o), (() => this.Xe(t, e, i)));
    }
    Xe(t, e, i) {
        const {$controller: n, view: r} = this;
        if (null === t) r.nodes.remove(); else return s.onResolve(r.deactivate(t, n, i), (() => this.Ke(e)));
        return this.Ke(e);
    }
    Ke(t) {
        const {deactivated: e, callbackContext: s, view: i} = this;
        return null === e || void 0 === e ? void 0 : e.call(s, t, i);
    }
    Ne() {
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

Portal.inject = [ _t, Ae, C ];

n([ o({
    primary: true
}) ], Portal.prototype, "target", void 0);

n([ o({
    callback: "targetChanged"
}) ], Portal.prototype, "renderContext", void 0);

n([ o() ], Portal.prototype, "strict", void 0);

n([ o() ], Portal.prototype, "deactivating", void 0);

n([ o() ], Portal.prototype, "activating", void 0);

n([ o() ], Portal.prototype, "deactivated", void 0);

n([ o() ], Portal.prototype, "activated", void 0);

n([ o() ], Portal.prototype, "callbackContext", void 0);

ht("portal")(Portal);

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

FrequentMutations.inject = [ _t, Ae ];

class ObserveShallow extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 128);
    }
}

ObserveShallow.inject = [ _t, Ae ];

ht("frequent-mutations")(FrequentMutations);

ht("observe-shallow")(ObserveShallow);

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
        this.Ye = false;
        this.Ze = 0;
    }
    attaching(t, e, i) {
        let n;
        const r = this.$controller;
        const o = this.Ze++;
        const l = () => !this.Ye && this.Ze === o + 1;
        return s.onResolve(this.pending, (() => {
            var e;
            if (!l()) return;
            this.pending = void 0;
            if (this.value) n = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(); else n = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create();
            if (null == n) return;
            n.setLocation(this.location);
            this.pending = s.onResolve(n.activate(t, r, i, r.scope), (() => {
                if (l()) this.pending = void 0;
            }));
        }));
    }
    detaching(t, e, i) {
        this.Ye = true;
        return s.onResolve(this.pending, (() => {
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
        const n = this.view;
        const r = this.$controller;
        const o = this.Ze++;
        const l = () => !this.Ye && this.Ze === o + 1;
        let h;
        return s.onResolve(s.onResolve(this.pending, (() => this.pending = s.onResolve(null === n || void 0 === n ? void 0 : n.deactivate(n, r, i), (() => {
            var e;
            if (!l()) return;
            if (t) h = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(); else h = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create();
            if (null == h) return;
            h.setLocation(this.location);
            return s.onResolve(h.activate(h, r, i, r.scope), (() => {
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

If.inject = [ _t, Ae, ge ];

n([ o ], If.prototype, "value", void 0);

n([ o({
    set: t => "" === t || !!t && "false" !== t
}) ], If.prototype, "cache", void 0);

ht("if")(If);

class Else {
    constructor(t) {
        this.factory = t;
        this.id = s.nextId("au$component");
    }
    link(t, e, s, i) {
        const n = t.children;
        const r = n[n.length - 1];
        if (r instanceof If) r.elseFactory = this.factory; else if (r.viewModel instanceof If) r.viewModel.elseFactory = this.factory; else throw new Error("AUR0810");
    }
}

Else.inject = [ _t ];

ht({
    name: "else"
})(Else);

function di(t) {
    t.dispose();
}

class Repeat {
    constructor(t, e, i) {
        this.location = t;
        this.parent = e;
        this.factory = i;
        this.id = s.nextId("au$component");
        this.Je = void 0;
        this.views = [];
        this.key = void 0;
        this.Qe = void 0;
    }
    binding(t, e, s) {
        this.ts(s);
        const i = this.parent.bindings;
        const n = i.length;
        let r;
        let o = 0;
        for (;n > o; ++o) {
            r = i[o];
            if (r.target === this && "items" === r.targetProperty) {
                this.forOf = r.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(s, this.$controller.scope, r.locator, null);
    }
    attaching(t, e, s) {
        this.es(s);
        return this.ss(t, s);
    }
    detaching(t, e, s) {
        this.ts(s);
        return this.os(t, s);
    }
    itemsChanged(t) {
        const {$controller: e} = this;
        if (!e.isActive) return;
        t |= e.flags;
        this.ts(t);
        this.es(t);
        const i = s.onResolve(this.os(null, t), (() => this.ss(null, t)));
        if (i instanceof Promise) i.catch((t => {
            throw t;
        }));
    }
    handleCollectionChange(t, e) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        e |= n.flags;
        this.es(e);
        if (void 0 === t) {
            const t = s.onResolve(this.os(null, e), (() => this.ss(null, e)));
            if (t instanceof Promise) t.catch((t => {
                throw t;
            }));
        } else {
            const n = this.views.length;
            i.applyMutationsToIndices(t);
            if (t.deletedItems.length > 0) {
                t.deletedItems.sort(s.compareNumber);
                const i = s.onResolve(this.ls(t, e), (() => this.hs(n, t, e)));
                if (i instanceof Promise) i.catch((t => {
                    throw t;
                }));
            } else this.hs(n, t, e);
        }
    }
    ts(t) {
        const e = this.Je;
        if (4 & t) {
            if (void 0 !== e) e.unsubscribe(this);
        } else if (this.$controller.isActive) {
            const t = this.Je = i.getCollectionObserver(this.items);
            if (e !== t && e) e.unsubscribe(this);
            if (t) t.subscribe(this);
        }
    }
    es(t) {
        const e = this.items;
        if (e instanceof Array) {
            this.Qe = e;
            return;
        }
        const s = this.forOf;
        if (void 0 === s) return;
        const i = [];
        this.forOf.iterate(t, e, ((t, e, s) => {
            i[e] = s;
        }));
        this.Qe = i;
    }
    ss(t, e) {
        let s;
        let n;
        let r;
        let o;
        const {$controller: l, factory: h, local: a, location: c, items: u} = this;
        const f = l.scope;
        const d = this.forOf.count(e, u);
        const p = this.views = Array(d);
        this.forOf.iterate(e, u, ((u, x, v) => {
            r = p[x] = h.create().setLocation(c);
            r.nodes.unlink();
            o = i.Scope.fromParent(f, i.BindingContext.create(a, v));
            gi(o.overrideContext, x, d);
            n = r.activate(null !== t && void 0 !== t ? t : r, l, e, o);
            if (n instanceof Promise) (null !== s && void 0 !== s ? s : s = []).push(n);
        }));
        if (void 0 !== s) return 1 === s.length ? s[0] : Promise.all(s);
    }
    os(t, e) {
        let s;
        let i;
        let n;
        let r = 0;
        const {views: o, $controller: l} = this;
        const h = o.length;
        for (;h > r; ++r) {
            n = o[r];
            n.release();
            i = n.deactivate(null !== t && void 0 !== t ? t : n, l, e);
            if (i instanceof Promise) (null !== s && void 0 !== s ? s : s = []).push(i);
        }
        if (void 0 !== s) return 1 === s.length ? s[0] : Promise.all(s);
    }
    ls(t, e) {
        let s;
        let i;
        let n;
        const {$controller: r, views: o} = this;
        const l = t.deletedItems;
        const h = l.length;
        let a = 0;
        for (;h > a; ++a) {
            n = o[l[a]];
            n.release();
            i = n.deactivate(n, r, e);
            if (i instanceof Promise) (null !== s && void 0 !== s ? s : s = []).push(i);
        }
        a = 0;
        let c = 0;
        for (;h > a; ++a) {
            c = l[a] - a;
            o.splice(c, 1);
        }
        if (void 0 !== s) return 1 === s.length ? s[0] : Promise.all(s);
    }
    hs(t, e, s) {
        var n;
        let r;
        let o;
        let l;
        let h;
        let a = 0;
        const {$controller: c, factory: u, local: f, Qe: d, location: p, views: x} = this;
        const v = e.length;
        for (;v > a; ++a) if (-2 === e[a]) {
            l = u.create();
            x.splice(a, 0, l);
        }
        if (x.length !== v) throw new Error(`AUR0814:${x.length}!=${v}`);
        const m = c.scope;
        const g = e.length;
        i.synchronizeIndices(x, e);
        const w = mi(e);
        const y = w.length;
        let b;
        let k = y - 1;
        a = g - 1;
        for (;a >= 0; --a) {
            l = x[a];
            b = x[a + 1];
            l.nodes.link(null !== (n = null === b || void 0 === b ? void 0 : b.nodes) && void 0 !== n ? n : p);
            if (-2 === e[a]) {
                h = i.Scope.fromParent(m, i.BindingContext.create(f, d[a]));
                gi(h.overrideContext, a, g);
                l.setLocation(p);
                o = l.activate(l, c, s, h);
                if (o instanceof Promise) (null !== r && void 0 !== r ? r : r = []).push(o);
            } else if (k < 0 || 1 === y || a !== w[k]) {
                gi(l.scope.overrideContext, a, g);
                l.nodes.insertBefore(l.location);
            } else {
                if (t !== g) gi(l.scope.overrideContext, a, g);
                --k;
            }
        }
        if (void 0 !== r) return 1 === r.length ? r[0] : Promise.all(r);
    }
    dispose() {
        this.views.forEach(di);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (void 0 !== e) for (let s = 0, i = e.length; s < i; ++s) if (true === e[s].accept(t)) return true;
    }
}

Repeat.inject = [ Ae, ue, _t ];

n([ o ], Repeat.prototype, "items", void 0);

ht("repeat")(Repeat);

let pi = 16;

let xi = new Int32Array(pi);

let vi = new Int32Array(pi);

function mi(t) {
    const e = t.length;
    if (e > pi) {
        pi = e;
        xi = new Int32Array(e);
        vi = new Int32Array(e);
    }
    let s = 0;
    let i = 0;
    let n = 0;
    let r = 0;
    let o = 0;
    let l = 0;
    let h = 0;
    let a = 0;
    for (;r < e; r++) {
        i = t[r];
        if (-2 !== i) {
            o = xi[s];
            n = t[o];
            if (-2 !== n && n < i) {
                vi[r] = o;
                xi[++s] = r;
                continue;
            }
            l = 0;
            h = s;
            while (l < h) {
                a = l + h >> 1;
                n = t[xi[a]];
                if (-2 !== n && n < i) l = a + 1; else h = a;
            }
            n = t[xi[l]];
            if (i < n || -2 === n) {
                if (l > 0) vi[r] = xi[l - 1];
                xi[l] = r;
            }
        }
    }
    r = ++s;
    const c = new Int32Array(r);
    i = xi[s - 1];
    while (s-- > 0) {
        c[s] = i;
        i = vi[i];
    }
    while (r-- > 0) xi[r] = 0;
    return c;
}

function gi(t, e, s) {
    const i = 0 === e;
    const n = e === s - 1;
    const r = e % 2 === 0;
    t.$index = e;
    t.$first = i;
    t.$last = n;
    t.$middle = !i && !n;
    t.$even = r;
    t.$odd = !r;
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
        const r = this.view.bindings;
        let o;
        let l = 0, h = 0;
        if (n.isActive && null != r) {
            o = i.Scope.fromParent(n.scope, void 0 === t ? {} : t);
            for (h = r.length; h > l; ++l) r[l].$bind(2, o);
        }
    }
    attaching(t, e, s) {
        const {$controller: n, value: r} = this;
        const o = i.Scope.fromParent(n.scope, void 0 === r ? {} : r);
        return this.view.activate(t, n, s, o);
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

With.inject = [ _t, Ae ];

n([ o ], With.prototype, "value", void 0);

ht("with")(With);

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
        const r = n.length;
        if (!i) {
            if (r > 0 && n[0].id === t.id) return this.clearActiveCases(null, e);
            return;
        }
        if (r > 0 && n[0].id < t.id) return;
        const o = [];
        let l = t.fallThrough;
        if (!l) o.push(t); else {
            const e = this.cases;
            const s = e.indexOf(t);
            for (let t = s, i = e.length; t < i && l; t++) {
                const s = e[t];
                o.push(s);
                l = s.fallThrough;
            }
        }
        return s.onResolve(this.clearActiveCases(null, e, o), (() => {
            this.activeCases = o;
            return this.activateCases(null, e);
        }));
    }
    swap(t, e, i) {
        const n = [];
        let r = false;
        for (const t of this.cases) {
            if (r || t.isMatch(i, e)) {
                n.push(t);
                r = t.fallThrough;
            }
            if (n.length > 0 && !r) break;
        }
        const o = this.defaultCase;
        if (0 === n.length && void 0 !== o) n.push(o);
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
        const r = n.length;
        if (0 === r) return;
        const o = i.scope;
        if (1 === r) return n[0].activate(t, e, o);
        return s.resolveAll(...n.map((s => s.activate(t, e, o))));
    }
    clearActiveCases(t, e, i = []) {
        const n = this.activeCases;
        const r = n.length;
        if (0 === r) return;
        if (1 === r) {
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

n([ o ], exports.Switch.prototype, "value", void 0);

exports.Switch = n([ ht("switch"), r(0, _t), r(1, Ae) ], exports.Switch);

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
        const r = null === n || void 0 === n ? void 0 : n.viewModel;
        if (r instanceof exports.Switch) {
            this.$switch = r;
            this.linkToSwitch(r);
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

n([ o ], exports.Case.prototype, "value", void 0);

n([ o({
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

exports.Case = n([ ht("case"), r(0, _t), r(1, i.IObserverLocator), r(2, Ae), r(3, s.ILogger) ], exports.Case);

exports.DefaultCase = class DefaultCase extends exports.Case {
    linkToSwitch(t) {
        if (void 0 !== t.defaultCase) throw new Error("AUR0816");
        t.defaultCase = this;
    }
};

exports.DefaultCase = n([ ht("default-case") ], exports.DefaultCase);

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
        const r = this.view;
        const o = this.$controller;
        return s.onResolve(r.activate(t, o, n, this.viewScope = i.Scope.fromParent(o.scope, {})), (() => this.swap(t, n)));
    }
    valueChanged(t, e, s) {
        if (!this.$controller.isActive) return;
        this.swap(null, s);
    }
    swap(t, e) {
        var i, n;
        const r = this.value;
        if (!(r instanceof Promise)) {
            this.logger.warn(`The value '${String(r)}' is not a promise. No change will be done.`);
            return;
        }
        const o = this.platform.domWriteQueue;
        const l = this.fulfilled;
        const h = this.rejected;
        const a = this.pending;
        const c = this.viewScope;
        let u;
        const f = {
            reusable: false
        };
        const d = () => {
            void s.resolveAll(u = (this.preSettledTask = o.queueTask((() => s.resolveAll(null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === a || void 0 === a ? void 0 : a.activate(t, e, c))), f)).result, r.then((i => {
                if (this.value !== r) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => s.resolveAll(null === a || void 0 === a ? void 0 : a.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === l || void 0 === l ? void 0 : l.activate(t, e, c, i))), f)).result;
                };
                if (1 === this.preSettledTask.status) void u.then(n); else {
                    this.preSettledTask.cancel();
                    n();
                }
            }), (i => {
                if (this.value !== r) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => s.resolveAll(null === a || void 0 === a ? void 0 : a.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.activate(t, e, c, i))), f)).result;
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

n([ o ], exports.PromiseTemplateController.prototype, "value", void 0);

exports.PromiseTemplateController = n([ ht("promise"), r(0, _t), r(1, Ae), r(2, C), r(3, s.ILogger) ], exports.PromiseTemplateController);

exports.PendingTemplateController = class PendingTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, s, i) {
        wi(t).pending = this;
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

n([ o({
    mode: i.BindingMode.toView
}) ], exports.PendingTemplateController.prototype, "value", void 0);

exports.PendingTemplateController = n([ ht("pending"), r(0, _t), r(1, Ae) ], exports.PendingTemplateController);

exports.FulfilledTemplateController = class FulfilledTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, s, i) {
        wi(t).fulfilled = this;
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

n([ o({
    mode: i.BindingMode.toView
}) ], exports.FulfilledTemplateController.prototype, "value", void 0);

exports.FulfilledTemplateController = n([ ht("then"), r(0, _t), r(1, Ae) ], exports.FulfilledTemplateController);

exports.RejectedTemplateController = class RejectedTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = s.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, s, i) {
        wi(t).rejected = this;
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

n([ o({
    mode: i.BindingMode.toView
}) ], exports.RejectedTemplateController.prototype, "value", void 0);

exports.RejectedTemplateController = n([ ht("catch"), r(0, _t), r(1, Ae) ], exports.RejectedTemplateController);

function wi(t) {
    const e = t.parent;
    const s = null === e || void 0 === e ? void 0 : e.viewModel;
    if (s instanceof exports.PromiseTemplateController) return s;
    throw new Error("AUR0813");
}

let yi = class PromiseAttributePattern {
    "promise.resolve"(t, e, s) {
        return new AttrSyntax(t, e, "promise", "bind");
    }
};

yi = n([ v({
    pattern: "promise.resolve",
    symbols: ""
}) ], yi);

let bi = class FulfilledAttributePattern {
    then(t, e, s) {
        return new AttrSyntax(t, e, "then", "from-view");
    }
};

bi = n([ v({
    pattern: "then",
    symbols: ""
}) ], bi);

let ki = class RejectedAttributePattern {
    catch(t, e, s) {
        return new AttrSyntax(t, e, "catch", "from-view");
    }
};

ki = n([ v({
    pattern: "catch",
    symbols: ""
}) ], ki);

function Ai(t, e, s, i) {
    if ("string" === typeof e) return Ci(t, e, s, i);
    if (bt.isType(e)) return Ri(t, e, s, i);
    throw new Error(`Invalid Tag or Type.`);
}

class RenderPlan {
    constructor(t, e, s) {
        this.node = t;
        this.instructions = e;
        this.dependencies = s;
        this.cs = void 0;
    }
    get definition() {
        if (void 0 === this.cs) this.cs = CustomElementDefinition.create({
            name: bt.generateName(),
            template: this.node,
            needsCompile: "string" === typeof this.node,
            instructions: this.instructions,
            dependencies: this.dependencies
        });
        return this.cs;
    }
    createView(t) {
        return this.getViewFactory(t).create();
    }
    getViewFactory(t) {
        return t.root.get(Yt).getViewFactory(this.definition, t.createChild().register(...this.dependencies));
    }
    mergeInto(t, e, s) {
        t.appendChild(this.node);
        e.push(...this.instructions);
        s.push(...this.dependencies);
    }
}

function Ci(t, e, s, i) {
    const n = [];
    const r = [];
    const o = [];
    const l = t.document.createElement(e);
    let h = false;
    if (s) Object.keys(s).forEach((t => {
        const e = s[t];
        if (Fe(e)) {
            h = true;
            n.push(e);
        } else l.setAttribute(t, e);
    }));
    if (h) {
        l.className = "au";
        r.push(n);
    }
    if (i) Si(t, l, i, r, o);
    return new RenderPlan(l, r, o);
}

function Ri(t, e, s, i) {
    const n = bt.getDefinition(e);
    const r = [];
    const o = [ r ];
    const l = [];
    const h = [];
    const a = n.bindables;
    const c = t.document.createElement(n.name);
    c.className = "au";
    if (!l.includes(e)) l.push(e);
    r.push(new HydrateElementInstruction(n, void 0, h, null, false));
    if (s) Object.keys(s).forEach((t => {
        const e = s[t];
        if (Fe(e)) h.push(e); else if (void 0 === a[t]) h.push(new SetAttributeInstruction(e, t)); else h.push(new SetPropertyInstruction(e, t));
    }));
    if (i) Si(t, c, i, o, l);
    return new RenderPlan(c, o, l);
}

function Si(t, e, s, i, n) {
    for (let r = 0, o = s.length; r < o; ++r) {
        const o = s[r];
        switch (typeof o) {
          case "string":
            e.appendChild(t.document.createTextNode(o));
            break;

          case "object":
            if (o instanceof t.Node) e.appendChild(o); else if ("mergeInto" in o) o.mergeInto(e, i, n);
        }
    }
}

function Ei(t, e) {
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
        this.us = e.props.reduce(Ei, {});
        this.fs = i;
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
        return this.Xe(this.view, t, s);
    }
    componentChanged(t, e, i) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        if (this.lastSubject === t) return;
        this.lastSubject = t;
        this.composing = true;
        i |= n.flags;
        const r = s.onResolve(this.Xe(this.view, null, i), (() => this.compose(void 0, t, null, i)));
        if (r instanceof Promise) r.catch((t => {
            throw t;
        }));
    }
    compose(t, e, i, n) {
        return s.onResolve(void 0 === t ? s.onResolve(e, (t => this.ds(t, n))) : t, (t => this.ze(this.view = t, i, n)));
    }
    Xe(t, e, s) {
        return null === t || void 0 === t ? void 0 : t.deactivate(null !== e && void 0 !== e ? e : t, this.$controller, s);
    }
    ze(t, e, i) {
        const {$controller: n} = this;
        return s.onResolve(null === t || void 0 === t ? void 0 : t.activate(null !== e && void 0 !== e ? e : t, n, i, n.scope), (() => {
            this.composing = false;
        }));
    }
    ds(t, e) {
        const s = this.ps(t, e);
        if (s) {
            s.setLocation(this.$controller.location);
            s.lockScope(this.$controller.scope);
            return s;
        }
        return;
    }
    ps(t, e) {
        if (!t) return;
        const s = this.fs.controller.container;
        if ("object" === typeof t) {
            if (Bi(t)) return t;
            if ("createView" in t) return t.createView(s);
            if ("create" in t) return t.create();
            if ("template" in t) return this.r.getViewFactory(CustomElementDefinition.getOrCreate(t), s).create();
        }
        if ("string" === typeof t) {
            const e = s.find(bt, t);
            if (null == e) throw new Error(`AUR0809:${t}`);
            t = e.Type;
        }
        return Ai(this.p, t, this.us, this.$controller.host.childNodes).createView(s);
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

n([ o ], exports.AuRender.prototype, "component", void 0);

n([ o({
    mode: i.BindingMode.fromView
}) ], exports.AuRender.prototype, "composing", void 0);

exports.AuRender = n([ xt({
    name: "au-render",
    template: null,
    containerless: true
}), r(0, C), r(1, Ue), r(2, fe), r(3, Yt) ], exports.AuRender);

function Bi(t) {
    return "lockScope" in t;
}

class AuCompose {
    constructor(t, e, s, i, n, r) {
        this.ctn = t;
        this.parent = e;
        this.host = s;
        this.p = i;
        this.scopeBehavior = "auto";
        this.c = void 0;
        this.loc = n.containerless ? Ee(this.host) : void 0;
        this.r = t.get(Yt);
        this.xs = n;
        this.vs = r;
    }
    static get inject() {
        return [ s.IContainer, ue, be, C, Ue, s.transient(CompositionContextFactory) ];
    }
    get pending() {
        return this.pd;
    }
    get composition() {
        return this.c;
    }
    attaching(t, e, i) {
        return this.pd = s.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, t, void 0)), (t => {
            if (this.vs.isCurrent(t)) this.pd = void 0;
        }));
    }
    detaching(t) {
        const e = this.c;
        const i = this.pd;
        this.vs.invalidate();
        this.c = this.pd = void 0;
        return s.onResolve(i, (() => null === e || void 0 === e ? void 0 : e.deactivate(t)));
    }
    propertyChanged(t) {
        if ("model" === t && null != this.c) {
            this.c.update(this.model);
            return;
        }
        this.pd = s.onResolve(this.pd, (() => s.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, t)), (t => {
            if (this.vs.isCurrent(t)) this.pd = void 0;
        }))));
    }
    queue(t) {
        const e = this.vs;
        const i = this.c;
        return s.onResolve(e.create(t), (n => {
            if (e.isCurrent(n)) return s.onResolve(this.compose(n), (r => {
                if (e.isCurrent(n)) return s.onResolve(r.activate(), (() => {
                    if (e.isCurrent(n)) {
                        this.c = r;
                        return s.onResolve(null === i || void 0 === i ? void 0 : i.deactivate(t.initiator), (() => n));
                    } else return s.onResolve(r.controller.deactivate(r.controller, this.$controller, 4), (() => {
                        r.controller.dispose();
                        return n;
                    }));
                }));
                r.controller.dispose();
                return n;
            }));
            return n;
        }));
    }
    compose(t) {
        let e;
        let n;
        let r;
        const {view: o, viewModel: l, model: h, initiator: a} = t.change;
        const {ctn: c, host: u, $controller: f, loc: d} = this;
        const p = this.getDef(l);
        const x = c.createChild();
        const v = null == d ? u.parentNode : d.parentNode;
        if (null !== p) {
            if (p.containerless) throw new Error("AUR0806");
            if (null == d) {
                n = u;
                r = () => {};
            } else {
                n = v.insertBefore(this.p.document.createElement(p.name), d);
                r = () => {
                    n.remove();
                };
            }
            e = this.getVm(x, l, n);
        } else {
            n = null == d ? u : d;
            e = this.getVm(x, l, n);
        }
        const m = () => {
            if (null !== p) {
                const i = Controller.$el(x, e, n, null, p);
                return new CompositionController(i, (() => i.activate(null !== a && void 0 !== a ? a : i, f, 2)), (t => s.onResolve(i.deactivate(null !== t && void 0 !== t ? t : i, f, 4), r)), (t => {
                    var s;
                    return null === (s = e.activate) || void 0 === s ? void 0 : s.call(e, t);
                }), t);
            } else {
                const s = CustomElementDefinition.create({
                    name: bt.generateName(),
                    template: o
                });
                const r = this.r.getViewFactory(s, x);
                const l = Controller.$view(r, f);
                const h = "auto" === this.scopeBehavior ? i.Scope.fromParent(this.parent.scope, e) : i.Scope.create(e);
                if (Be(n)) l.setLocation(n); else l.setHost(n);
                return new CompositionController(l, (() => l.activate(null !== a && void 0 !== a ? a : l, f, 2, h)), (t => l.deactivate(null !== t && void 0 !== t ? t : l, f, 4)), (t => {
                    var s;
                    return null === (s = e.activate) || void 0 === s ? void 0 : s.call(e, t);
                }), t);
            }
        };
        if ("activate" in e) return s.onResolve(e.activate(h), (() => m())); else return m();
    }
    getVm(t, e, i) {
        if (null == e) return new EmptyComponent$1;
        if ("object" === typeof e) return e;
        const n = this.p;
        const r = Be(i);
        t.registerResolver(n.Element, t.registerResolver(be, new s.InstanceProvider("ElementResolver", r ? null : i)));
        t.registerResolver(Ae, new s.InstanceProvider("IRenderLocation", r ? i : null));
        const o = t.invoke(e);
        t.registerResolver(e, new s.InstanceProvider("au-compose.viewModel", o));
        return o;
    }
    getDef(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return bt.isType(e) ? bt.getDefinition(e) : null;
    }
}

n([ o ], AuCompose.prototype, "view", void 0);

n([ o ], AuCompose.prototype, "viewModel", void 0);

n([ o ], AuCompose.prototype, "model", void 0);

n([ o({
    set: t => {
        if ("scoped" === t || "auto" === t) return t;
        throw new Error("AUR0805");
    }
}) ], AuCompose.prototype, "scopeBehavior", void 0);

xt("au-compose")(AuCompose);

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
        var n, r;
        this.gs = null;
        this.ws = null;
        let o;
        const l = e.auSlot;
        const h = null === (r = null === (n = s.instruction) || void 0 === n ? void 0 : n.projections) || void 0 === r ? void 0 : r[l.name];
        if (null == h) {
            o = i.getViewFactory(l.fallback, s.controller.container);
            this.ys = false;
        } else {
            o = i.getViewFactory(h, s.parent.controller.container);
            this.ys = true;
        }
        this.fs = s;
        this.view = o.create().setLocation(t);
    }
    static get inject() {
        return [ Ae, Ue, fe, Yt ];
    }
    binding(t, e, s) {
        var n;
        this.gs = this.$controller.scope.parentScope;
        let r;
        if (this.ys) {
            r = this.fs.controller.scope.parentScope;
            (this.ws = i.Scope.fromParent(r, r.bindingContext)).overrideContext.$host = null !== (n = this.expose) && void 0 !== n ? n : this.gs.bindingContext;
        }
    }
    attaching(t, e, s) {
        return this.view.activate(t, this.$controller, s, this.ys ? this.ws : this.gs);
    }
    detaching(t, e, s) {
        return this.view.deactivate(t, this.$controller, s);
    }
    exposeChanged(t) {
        if (this.ys && null != this.ws) this.ws.overrideContext.$host = t;
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

n([ o ], AuSlot.prototype, "expose", void 0);

xt({
    name: "au-slot",
    template: null,
    containerless: true
})(AuSlot);

const Ti = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const Ii = s.DI.createInterface("ISanitizer", (t => t.singleton(class {
    sanitize(t) {
        return t.replace(Ti, "");
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

exports.SanitizeValueConverter = n([ r(0, Ii) ], exports.SanitizeValueConverter);

i.valueConverter("sanitize")(exports.SanitizeValueConverter);

exports.ViewValueConverter = class ViewValueConverter {
    constructor(t) {
        this.viewLocator = t;
    }
    toView(t, e) {
        return this.viewLocator.getViewComponentForObject(t, e);
    }
};

exports.ViewValueConverter = n([ r(0, Kt) ], exports.ViewValueConverter);

i.valueConverter("view")(exports.ViewValueConverter);

const Di = DebounceBindingBehavior;

const Pi = OneTimeBindingBehavior;

const $i = ToViewBindingBehavior;

const Oi = FromViewBindingBehavior;

const Li = SignalBindingBehavior;

const qi = ThrottleBindingBehavior;

const Ui = TwoWayBindingBehavior;

const Fi = TemplateCompiler;

const Mi = NodeObserverLocator;

const Vi = [ Fi, Mi ];

const ji = SVGAnalyzer;

const _i = exports.AtPrefixedTriggerAttributePattern;

const Ni = exports.ColonPrefixedBindAttributePattern;

const Hi = exports.RefAttributePattern;

const Wi = exports.DotSeparatedAttributePattern;

const zi = [ Hi, Wi ];

const Gi = [ _i, Ni ];

const Xi = exports.CallBindingCommand;

const Ki = exports.DefaultBindingCommand;

const Yi = exports.ForBindingCommand;

const Zi = exports.FromViewBindingCommand;

const Ji = exports.OneTimeBindingCommand;

const Qi = exports.ToViewBindingCommand;

const tn = exports.TwoWayBindingCommand;

const en = Cs;

const sn = exports.TriggerBindingCommand;

const nn = exports.DelegateBindingCommand;

const rn = exports.CaptureBindingCommand;

const on = exports.AttrBindingCommand;

const ln = exports.ClassBindingCommand;

const hn = exports.StyleBindingCommand;

const an = [ Ki, Ji, Zi, Qi, tn, Xi, Yi, en, sn, nn, rn, ln, hn, on ];

const cn = exports.SanitizeValueConverter;

const un = exports.ViewValueConverter;

const fn = FrequentMutations;

const dn = ObserveShallow;

const pn = If;

const xn = Else;

const vn = Repeat;

const mn = With;

const gn = exports.Switch;

const wn = exports.Case;

const yn = exports.DefaultCase;

const bn = exports.PromiseTemplateController;

const kn = exports.PendingTemplateController;

const An = exports.FulfilledTemplateController;

const Cn = exports.RejectedTemplateController;

const Rn = yi;

const Sn = bi;

const En = ki;

const Bn = AttrBindingBehavior;

const Tn = SelfBindingBehavior;

const In = UpdateTriggerBindingBehavior;

const Dn = exports.AuRender;

const Pn = AuCompose;

const $n = Portal;

const On = exports.Focus;

const Ln = fi;

const qn = [ Di, Pi, $i, Oi, Li, qi, Ui, cn, un, fn, dn, pn, xn, vn, mn, gn, wn, yn, bn, kn, An, Cn, Rn, Sn, En, Bn, Tn, In, Dn, Pn, $n, On, Ln, AuSlot ];

const Un = Ye;

const Fn = Ge;

const Mn = ze;

const Vn = Je;

const jn = ts;

const _n = Ke;

const Nn = Qe;

const Hn = Ze;

const Wn = We;

const zn = Xe;

const Gn = rs;

const Xn = cs;

const Kn = os;

const Yn = ls;

const Zn = hs;

const Jn = as;

const Qn = ns;

const tr = [ Nn, jn, Un, Hn, Vn, Wn, Mn, Fn, zn, _n, Gn, Xn, Kn, Yn, Zn, Jn, Qn ];

const er = {
    register(t) {
        return t.register(...Vi, ...qn, ...zi, ...an, ...tr);
    },
    createContainer() {
        return this.register(s.DI.createContainer());
    }
};

const sr = s.DI.createInterface("IAurelia");

class Aurelia {
    constructor(t = s.DI.createContainer()) {
        this.container = t;
        this.bs = false;
        this.ks = false;
        this.As = false;
        this.Cs = void 0;
        this.next = void 0;
        this.Rs = void 0;
        this.Ss = void 0;
        if (t.has(sr, true)) throw new Error("AUR0768");
        t.registerResolver(sr, new s.InstanceProvider("IAurelia", this));
        t.registerResolver(me, this.Es = new s.InstanceProvider("IAppRoot"));
    }
    get isRunning() {
        return this.bs;
    }
    get isStarting() {
        return this.ks;
    }
    get isStopping() {
        return this.As;
    }
    get root() {
        if (null == this.Cs) {
            if (null == this.next) throw new Error("AUR0767");
            return this.next;
        }
        return this.Cs;
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.Bs(t.host), this.container, this.Es);
        return this;
    }
    enhance(t, e) {
        var i;
        const n = null !== (i = t.container) && void 0 !== i ? i : this.container.createChild();
        const r = t.host;
        const o = this.Bs(r);
        const l = t.component;
        let h;
        if ("function" === typeof l) {
            n.registerResolver(o.HTMLElement, n.registerResolver(o.Element, n.registerResolver(be, new s.InstanceProvider("ElementResolver", r))));
            h = n.invoke(l);
        } else h = l;
        n.registerResolver(ke, new s.InstanceProvider("IEventTarget", r));
        e = null !== e && void 0 !== e ? e : null;
        const a = Controller.$el(n, h, r, null, CustomElementDefinition.create({
            name: bt.generateName(),
            template: r,
            enhance: true
        }));
        return s.onResolve(a.activate(a, e, 2), (() => a));
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domWriteQueue.yield();
        await t.domReadQueue.yield();
        await t.taskQueue.yield();
    }
    Bs(t) {
        let i;
        if (!this.container.has(C, false)) {
            if (null === t.ownerDocument.defaultView) throw new Error("AUR0769");
            i = new e.BrowserPlatform(t.ownerDocument.defaultView);
            this.container.register(s.Registration.instance(C, i));
        } else i = this.container.get(C);
        return i;
    }
    start(t = this.next) {
        if (null == t) throw new Error("AUR0770");
        if (this.Rs instanceof Promise) return this.Rs;
        return this.Rs = s.onResolve(this.stop(), (() => {
            Reflect.set(t.host, "$aurelia", this);
            this.Es.prepare(this.Cs = t);
            this.ks = true;
            return s.onResolve(t.activate(), (() => {
                this.bs = true;
                this.ks = false;
                this.Rs = void 0;
                this.Ts(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (this.Ss instanceof Promise) return this.Ss;
        if (true === this.bs) {
            const e = this.Cs;
            this.bs = false;
            this.As = true;
            return this.Ss = s.onResolve(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) e.dispose();
                this.Cs = void 0;
                this.Es.dispose();
                this.As = false;
                this.Ts(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.bs || this.As) throw new Error("AUR0771");
        this.container.dispose();
    }
    Ts(t, e, s) {
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

const ir = s.DI.createInterface("IDialogService");

const nr = s.DI.createInterface("IDialogController");

const rr = s.DI.createInterface("IDialogDomRenderer");

const or = s.DI.createInterface("IDialogDom");

const lr = s.DI.createInterface("IDialogGlobalSettings");

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
            this.Tt = t;
            this.At = e;
        }));
    }
    static get inject() {
        return [ C, s.IContainer ];
    }
    activate(t) {
        var e;
        const i = this.ctn.createChild();
        const {model: n, template: r, rejectOnCancel: o} = t;
        const l = i.get(rr);
        const h = null !== (e = t.host) && void 0 !== e ? e : this.p.document.body;
        const a = this.dom = l.render(h, t);
        const c = i.has(ke, true) ? i.get(ke) : null;
        const u = a.contentHost;
        this.settings = t;
        if (null == c || !c.contains(h)) i.register(s.Registration.instance(ke, h));
        i.register(s.Registration.instance(be, u), s.Registration.instance(or, a));
        return new Promise((e => {
            var s, r;
            const o = Object.assign(this.cmp = this.getOrCreateVm(i, t, u), {
                $dialog: this
            });
            e(null !== (r = null === (s = o.canActivate) || void 0 === s ? void 0 : s.call(o, n)) && void 0 !== r ? r : true);
        })).then((e => {
            var l;
            if (true !== e) {
                a.dispose();
                if (o) throw hr(null, "Dialog activation rejected");
                return DialogOpenResult.create(true, this);
            }
            const h = this.cmp;
            return s.onResolve(null === (l = h.activate) || void 0 === l ? void 0 : l.call(h, n), (() => {
                var e;
                const n = this.controller = Controller.$el(i, h, u, null, CustomElementDefinition.create(null !== (e = this.getDefinition(h)) && void 0 !== e ? e : {
                    name: bt.generateName(),
                    template: r
                }));
                return s.onResolve(n.activate(n, null, 2), (() => {
                    var e;
                    a.overlay.addEventListener(null !== (e = t.mouseEvent) && void 0 !== e ? e : "click", this);
                    return DialogOpenResult.create(false, this);
                }));
            }));
        }), (t => {
            a.dispose();
            throw t;
        }));
    }
    deactivate(t, e) {
        if (this.Is) return this.Is;
        let i = true;
        const {controller: n, dom: r, cmp: o, settings: {mouseEvent: l, rejectOnCancel: h}} = this;
        const a = DialogCloseResult.create(t, e);
        const c = new Promise((c => {
            var u, f;
            c(s.onResolve(null !== (f = null === (u = o.canDeactivate) || void 0 === u ? void 0 : u.call(o, a)) && void 0 !== f ? f : true, (c => {
                var u;
                if (true !== c) {
                    i = false;
                    this.Is = void 0;
                    if (h) throw hr(null, "Dialog cancellation rejected");
                    return DialogCloseResult.create("abort");
                }
                return s.onResolve(null === (u = o.deactivate) || void 0 === u ? void 0 : u.call(o, a), (() => s.onResolve(n.deactivate(n, null, 4), (() => {
                    r.dispose();
                    r.overlay.removeEventListener(null !== l && void 0 !== l ? l : "click", this);
                    if (!h && "error" !== t) this.Tt(a); else this.At(hr(e, "Dialog cancelled with a rejection on cancel"));
                    return a;
                }))));
            })));
        })).catch((t => {
            this.Is = void 0;
            throw t;
        }));
        this.Is = i ? c : void 0;
        return c;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(t) {
        const e = ar(t);
        return new Promise((t => {
            var i, n;
            return t(s.onResolve(null === (n = (i = this.cmp).deactivate) || void 0 === n ? void 0 : n.call(i, DialogCloseResult.create("error", e)), (() => s.onResolve(this.controller.deactivate(this.controller, null, 4), (() => {
                this.dom.dispose();
                this.At(e);
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
        const r = this.p;
        t.registerResolver(r.HTMLElement, t.registerResolver(r.Element, t.registerResolver(be, new s.InstanceProvider("ElementResolver", i))));
        return t.invoke(n);
    }
    getDefinition(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return bt.isType(e) ? bt.getDefinition(e) : null;
    }
}

class EmptyComponent {}

function hr(t, e) {
    const s = new Error(e);
    s.wasCancelled = true;
    s.value = t;
    return s;
}

function ar(t) {
    const e = new Error;
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor(t, e, s) {
        this.rt = t;
        this.p = e;
        this.Ds = s;
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
        return [ s.IContainer, C, lr ];
    }
    static register(t) {
        t.register(s.Registration.singleton(ir, this), K.beforeDeactivate(ir, (t => s.onResolve(t.closeAll(), (t => {
            if (t.length > 0) throw new Error(`AUR0901:${t.length}`);
        })))));
    }
    open(t) {
        return ur(new Promise((e => {
            var i;
            const n = DialogSettings.from(this.Ds, t);
            const r = null !== (i = n.container) && void 0 !== i ? i : this.rt.createChild();
            e(s.onResolve(n.load(), (t => {
                const e = r.invoke(DialogController);
                r.register(s.Registration.instance(nr, e));
                r.register(s.Registration.callback(DialogController, (() => {
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
        const s = fr(e);
        if (null == s) return;
        const i = this.top;
        if (null === i || 0 === i.settings.keyboard.length) return;
        const n = i.settings.keyboard;
        if ("Escape" === s && n.includes(s)) void i.cancel(); else if ("Enter" === s && n.includes(s)) void i.ok();
    }
}

class DialogSettings {
    static from(...t) {
        return Object.assign(new DialogSettings, ...t).$s().Ps();
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
    $s() {
        if (null == this.component && null == this.template) throw new Error("AUR0903");
        return this;
    }
    Ps() {
        if (null == this.keyboard) this.keyboard = this.lock ? [] : [ "Enter", "Escape" ];
        if ("boolean" !== typeof this.overlayDismiss) this.overlayDismiss = !this.lock;
        return this;
    }
}

function cr(t, e) {
    return this.then((s => s.dialog.closed.then(t, e)), e);
}

function ur(t) {
    t.whenClosed = cr;
    return t;
}

function fr(t) {
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
        s.Registration.singleton(lr, this).register(t);
    }
}

const dr = "position:absolute;width:100%;height:100%;top:0;left:0;";

class DefaultDialogDomRenderer {
    constructor(t) {
        this.p = t;
        this.wrapperCss = `${dr} display:flex;`;
        this.overlayCss = dr;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        s.Registration.singleton(rr, this).register(t);
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
        const r = i.appendChild(s("div", this.hostCss));
        return new DefaultDialogDom(i, n, r);
    }
}

DefaultDialogDomRenderer.inject = [ C ];

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

function pr(t, e) {
    return {
        settingsProvider: t,
        register: s => s.register(...e, K.beforeCreate((() => t(s.get(lr))))),
        customize(t, s) {
            return pr(t, null !== s && void 0 !== s ? s : e);
        }
    };
}

const xr = pr((() => {
    throw new Error("AUR0904");
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(s.Registration.singleton(lr, this));
    }
} ]);

const vr = pr(s.noop, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer ]);

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

exports.AppTask = K;

exports.AtPrefixedTriggerAttributePatternRegistration = _i;

exports.AttrBindingBehavior = AttrBindingBehavior;

exports.AttrBindingBehaviorRegistration = Bn;

exports.AttrBindingCommandRegistration = on;

exports.AttrSyntax = AttrSyntax;

exports.AttributeBinding = AttributeBinding;

exports.AttributeBindingInstruction = AttributeBindingInstruction;

exports.AttributeBindingRendererRegistration = Xn;

exports.AttributeNSAccessor = AttributeNSAccessor;

exports.AttributePattern = w;

exports.AuCompose = AuCompose;

exports.AuRenderRegistration = Dn;

exports.AuSlot = AuSlot;

exports.AuSlotsInfo = AuSlotsInfo;

exports.Aurelia = Aurelia;

exports.Bindable = a;

exports.BindableDefinition = BindableDefinition;

exports.BindableObserver = BindableObserver;

exports.BindablesInfo = BindablesInfo;

exports.BindingCommand = As;

exports.BindingCommandDefinition = BindingCommandDefinition;

exports.BindingModeBehavior = BindingModeBehavior;

exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;

exports.CallBinding = CallBinding;

exports.CallBindingCommandRegistration = Xi;

exports.CallBindingInstruction = CallBindingInstruction;

exports.CallBindingRendererRegistration = Un;

exports.CaptureBindingCommandRegistration = rn;

exports.CheckedObserver = CheckedObserver;

exports.Children = tt;

exports.ChildrenDefinition = ChildrenDefinition;

exports.ChildrenObserver = ChildrenObserver;

exports.ClassAttributeAccessor = ClassAttributeAccessor;

exports.ClassBindingCommandRegistration = ln;

exports.ColonPrefixedBindAttributePatternRegistration = Ni;

exports.ComputedWatcher = ComputedWatcher;

exports.Controller = Controller;

exports.CustomAttribute = ct;

exports.CustomAttributeDefinition = CustomAttributeDefinition;

exports.CustomAttributeRendererRegistration = Fn;

exports.CustomElement = bt;

exports.CustomElementDefinition = CustomElementDefinition;

exports.CustomElementRendererRegistration = Mn;

exports.DataAttributeAccessor = DataAttributeAccessor;

exports.DebounceBindingBehavior = DebounceBindingBehavior;

exports.DebounceBindingBehaviorRegistration = Di;

exports.DefaultBindingCommandRegistration = Ki;

exports.DefaultBindingLanguage = an;

exports.DefaultBindingSyntax = zi;

exports.DefaultComponents = Vi;

exports.DefaultDialogDom = DefaultDialogDom;

exports.DefaultDialogDomRenderer = DefaultDialogDomRenderer;

exports.DefaultDialogGlobalSettings = DefaultDialogGlobalSettings;

exports.DefaultRenderers = tr;

exports.DefaultResources = qn;

exports.DelegateBindingCommandRegistration = nn;

exports.DialogCloseResult = DialogCloseResult;

exports.DialogConfiguration = xr;

exports.DialogController = DialogController;

exports.DialogDefaultConfiguration = vr;

exports.DialogOpenResult = DialogOpenResult;

exports.DialogService = DialogService;

exports.DotSeparatedAttributePatternRegistration = Wi;

exports.Else = Else;

exports.ElseRegistration = xn;

exports.EventDelegator = EventDelegator;

exports.EventSubscriber = EventSubscriber;

exports.ExpressionWatcher = ExpressionWatcher;

exports.ForBindingCommandRegistration = Yi;

exports.FragmentNodeSequence = FragmentNodeSequence;

exports.FrequentMutations = FrequentMutations;

exports.FromViewBindingBehavior = FromViewBindingBehavior;

exports.FromViewBindingBehaviorRegistration = Oi;

exports.FromViewBindingCommandRegistration = Zi;

exports.HydrateAttributeInstruction = HydrateAttributeInstruction;

exports.HydrateElementInstruction = HydrateElementInstruction;

exports.HydrateLetElementInstruction = HydrateLetElementInstruction;

exports.HydrateTemplateController = HydrateTemplateController;

exports.IAppRoot = me;

exports.IAppTask = X;

exports.IAttrMapper = E;

exports.IAttributeParser = x;

exports.IAttributePattern = p;

exports.IAuSlotsInfo = qe;

exports.IAurelia = sr;

exports.IController = ue;

exports.IDialogController = nr;

exports.IDialogDom = or;

exports.IDialogDomRenderer = rr;

exports.IDialogGlobalSettings = lr;

exports.IDialogService = ir;

exports.IEventDelegator = Oe;

exports.IEventTarget = ke;

exports.IHistory = De;

exports.IHydrationContext = fe;

exports.IInstruction = Ue;

exports.ILifecycleHooks = Ut;

exports.ILocation = Ie;

exports.INode = be;

exports.INodeObserverLocatorRegistration = Mi;

exports.IPlatform = C;

exports.IProjections = Le;

exports.IRenderLocation = Ae;

exports.IRenderer = Ve;

exports.IRendering = Yt;

exports.ISVGAnalyzer = R;

exports.ISanitizer = Ii;

exports.IShadowDOMGlobalStyles = Dt;

exports.IShadowDOMStyleFactory = Tt;

exports.IShadowDOMStyles = It;

exports.ISyntaxInterpreter = u;

exports.ITemplateCompiler = Me;

exports.ITemplateCompilerHooks = js;

exports.ITemplateCompilerRegistration = Fi;

exports.ITemplateElementFactory = Rs;

exports.IViewFactory = _t;

exports.IViewLocator = Kt;

exports.IWindow = Te;

exports.IWorkTracker = ge;

exports.If = If;

exports.IfRegistration = pn;

exports.InterpolationBinding = InterpolationBinding;

exports.InterpolationBindingRendererRegistration = Vn;

exports.InterpolationInstruction = InterpolationInstruction;

exports.Interpretation = Interpretation;

exports.IteratorBindingInstruction = IteratorBindingInstruction;

exports.IteratorBindingRendererRegistration = jn;

exports.LetBinding = LetBinding;

exports.LetBindingInstruction = LetBindingInstruction;

exports.LetElementRendererRegistration = _n;

exports.LifecycleHooks = Vt;

exports.LifecycleHooksDefinition = LifecycleHooksDefinition;

exports.LifecycleHooksEntry = LifecycleHooksEntry;

exports.Listener = Listener;

exports.ListenerBindingInstruction = ListenerBindingInstruction;

exports.ListenerBindingRendererRegistration = Gn;

exports.NodeObserverConfig = NodeObserverConfig;

exports.NodeObserverLocator = NodeObserverLocator;

exports.NoopSVGAnalyzer = NoopSVGAnalyzer;

exports.ObserveShallow = ObserveShallow;

exports.OneTimeBindingBehavior = OneTimeBindingBehavior;

exports.OneTimeBindingBehaviorRegistration = Pi;

exports.OneTimeBindingCommandRegistration = Ji;

exports.Portal = Portal;

exports.PropertyBinding = PropertyBinding;

exports.PropertyBindingInstruction = PropertyBindingInstruction;

exports.PropertyBindingRendererRegistration = Nn;

exports.RefAttributePatternRegistration = Hi;

exports.RefBinding = RefBinding;

exports.RefBindingCommandRegistration = en;

exports.RefBindingInstruction = RefBindingInstruction;

exports.RefBindingRendererRegistration = Hn;

exports.RenderPlan = RenderPlan;

exports.Rendering = Rendering;

exports.Repeat = Repeat;

exports.RepeatRegistration = vn;

exports.SVGAnalyzer = SVGAnalyzer;

exports.SVGAnalyzerRegistration = ji;

exports.SanitizeValueConverterRegistration = cn;

exports.SelectValueObserver = SelectValueObserver;

exports.SelfBindingBehavior = SelfBindingBehavior;

exports.SelfBindingBehaviorRegistration = Tn;

exports.SetAttributeInstruction = SetAttributeInstruction;

exports.SetAttributeRendererRegistration = Kn;

exports.SetClassAttributeInstruction = SetClassAttributeInstruction;

exports.SetClassAttributeRendererRegistration = Yn;

exports.SetPropertyInstruction = SetPropertyInstruction;

exports.SetPropertyRendererRegistration = Wn;

exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;

exports.SetStyleAttributeRendererRegistration = Zn;

exports.ShadowDOMRegistry = ShadowDOMRegistry;

exports.ShortHandBindingSyntax = Gi;

exports.SignalBindingBehavior = SignalBindingBehavior;

exports.SignalBindingBehaviorRegistration = Li;

exports.StandardConfiguration = er;

exports.StyleAttributeAccessor = StyleAttributeAccessor;

exports.StyleBindingCommandRegistration = hn;

exports.StyleConfiguration = Pt;

exports.StyleElementStyles = StyleElementStyles;

exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;

exports.StylePropertyBindingRendererRegistration = Jn;

exports.TemplateCompiler = TemplateCompiler;

exports.TemplateCompilerHooks = Hs;

exports.TemplateControllerRendererRegistration = zn;

exports.TextBindingInstruction = TextBindingInstruction;

exports.TextBindingRendererRegistration = Qn;

exports.ThrottleBindingBehavior = ThrottleBindingBehavior;

exports.ThrottleBindingBehaviorRegistration = qi;

exports.ToViewBindingBehavior = ToViewBindingBehavior;

exports.ToViewBindingBehaviorRegistration = $i;

exports.ToViewBindingCommandRegistration = Qi;

exports.TriggerBindingCommandRegistration = sn;

exports.TwoWayBindingBehavior = TwoWayBindingBehavior;

exports.TwoWayBindingBehaviorRegistration = Ui;

exports.TwoWayBindingCommandRegistration = tn;

exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;

exports.UpdateTriggerBindingBehaviorRegistration = In;

exports.ValueAttributeObserver = ValueAttributeObserver;

exports.ViewFactory = ViewFactory;

exports.ViewLocator = ViewLocator;

exports.ViewValueConverterRegistration = un;

exports.Views = Gt;

exports.Watch = pt;

exports.With = With;

exports.WithRegistration = mn;

exports.allResources = Es;

exports.attributePattern = v;

exports.bindable = o;

exports.bindingCommand = bs;

exports.children = Z;

exports.containerless = mt;

exports.convertToRenderLocation = Ee;

exports.createElement = Ai;

exports.cssModules = Et;

exports.customAttribute = lt;

exports.customElement = xt;

exports.getEffectiveParentNode = Re;

exports.getRef = we;

exports.isCustomElementController = oe;

exports.isCustomElementViewModel = le;

exports.isInstruction = Fe;

exports.isRenderLocation = Be;

exports.lifecycleHooks = jt;

exports.processContent = At;

exports.renderer = je;

exports.setEffectiveParentNode = Se;

exports.setRef = ye;

exports.shadowCSS = Bt;

exports.templateCompilerHooks = Ws;

exports.templateController = ht;

exports.useShadowDOM = vt;

exports.view = Xt;

exports.watch = ut;
//# sourceMappingURL=index.js.map
