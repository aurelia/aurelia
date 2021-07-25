"use strict";

Object.defineProperty(exports, "t", {
    value: true
});

var t = require("@aurelia/platform");

var e = require("@aurelia/platform-browser");

var i = require("@aurelia/kernel");

var s = require("@aurelia/runtime");

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
***************************************************************************** */ function n(t, e, i, s) {
    var n = arguments.length, r = n < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, i) : s, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(t, e, i, s); else for (var l = t.length - 1; l >= 0; l--) if (o = t[l]) r = (n < 3 ? o(r) : n > 3 ? o(e, i, r) : o(e, i)) || r;
    return n > 3 && r && Object.defineProperty(e, i, r), r;
}

function r(t, e) {
    return function(i, s) {
        e(i, s, t);
    };
}

function o(t, e) {
    let s;
    function n(t, e) {
        if (arguments.length > 1) s.property = e;
        i.Metadata.define(h, BindableDefinition.create(e, s), t.constructor, e);
        i.Protocol.annotation.appendTo(t.constructor, u.keyFrom(e));
    }
    if (arguments.length > 1) {
        s = {};
        n(t, e);
        return;
    } else if ("string" === typeof t) {
        s = {};
        return n;
    }
    s = void 0 === t ? {} : t;
    return n;
}

function l(t) {
    return t.startsWith(h);
}

const h = i.Protocol.annotation.keyFor("bindable");

const u = Object.freeze({
    name: h,
    keyFrom(t) {
        return `${h}:${t}`;
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
        let e;
        const s = {
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
                if (!i.Metadata.hasOwn(h, t, r)) i.Protocol.annotation.appendTo(t, u.keyFrom(r));
                i.Metadata.define(h, e, t, r);
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
        const e = h.length + 1;
        const s = [];
        const n = i.getPrototypeChain(t);
        let r = n.length;
        let o = 0;
        let u;
        let c;
        let a;
        let f;
        while (--r >= 0) {
            a = n[r];
            u = i.Protocol.annotation.getKeys(a).filter(l);
            c = u.length;
            for (f = 0; f < c; ++f) s[o++] = i.Metadata.getOwn(h, a, u[f].slice(e));
        }
        return s;
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
        return new BindableDefinition(i.firstDefined(e.attribute, i.kebabCase(t)), i.firstDefined(e.callback, `${t}Changed`), i.firstDefined(e.mode, s.BindingMode.toView), i.firstDefined(e.primary, false), i.firstDefined(e.property, t), i.firstDefined(e.set, i.noop));
    }
}

class BindableObserver {
    constructor(t, e, s, n, r) {
        this.obj = t;
        this.key = e;
        this.set = n;
        this.$controller = r;
        this.value = void 0;
        this.i = void 0;
        this.f = 0;
        const o = t[s];
        const l = t.propertyChanged;
        const h = this.o = "function" === typeof o;
        const u = this.l = "function" === typeof l;
        const c = this.u = n !== i.noop;
        this.cb = h ? o : i.noop;
        this.v = u ? l : i.noop;
        if (void 0 === this.cb && !u && !c) this.A = false; else {
            this.A = true;
            const i = t[e];
            this.value = c && void 0 !== i ? n(i) : i;
            this.C();
        }
    }
    get type() {
        return 1;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        if (this.u) t = this.set(t);
        if (this.A) {
            const i = this.value;
            if (Object.is(t, i)) return;
            this.value = t;
            this.i = i;
            this.f = e;
            if (null == this.$controller || this.$controller.isBound) {
                if (this.o) this.cb.call(this.obj, t, i, e);
                if (this.l) this.v.call(this.obj, this.key, t, i, e);
            }
            this.queue.add(this);
        } else this.obj[this.key] = t;
    }
    subscribe(t) {
        if (false === !this.A) {
            this.A = true;
            const t = this.obj[this.key];
            this.value = this.u ? this.set(t) : t;
            this.C();
        }
        this.subs.add(t);
    }
    flush() {
        c = this.i;
        this.i = this.value;
        this.subs.notify(this.value, c, this.f);
    }
    C() {
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

s.subscriberCollection(BindableObserver);

s.withFlushQueue(BindableObserver);

let c;

class CharSpec {
    constructor(t, e, i, s) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = i;
        this.isInverted = s;
        if (s) switch (t.length) {
          case 0:
            this.has = this.R;
            break;

          case 1:
            this.has = this.S;
            break;

          default:
            this.has = this.B;
        } else switch (t.length) {
          case 0:
            this.has = this.O;
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
    O(t) {
        return false;
    }
    B(t) {
        return !this.chars.includes(t);
    }
    S(t) {
        return this.chars !== t;
    }
    R(t) {
        return true;
    }
}

class Interpretation {
    constructor() {
        this.parts = i.emptyArray;
        this.j = "";
        this.D = {};
        this.P = {};
    }
    get pattern() {
        const t = this.j;
        if ("" === t) return null; else return t;
    }
    set pattern(t) {
        if (null == t) {
            this.j = "";
            this.parts = i.emptyArray;
        } else {
            this.j = t;
            this.parts = this.P[t];
        }
    }
    append(t, e) {
        const {D: i} = this;
        if (void 0 === i[t]) i[t] = e; else i[t] += e;
    }
    next(t) {
        const {D: e} = this;
        if (void 0 !== e[t]) {
            const {P: i} = this;
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

const a = i.DI.createInterface("ISyntaxInterpreter", (t => t.singleton(SyntaxInterpreter)));

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
        const r = new SegmentTypes;
        const o = this.parse(s, r);
        const l = o.length;
        const h = t => {
            i = i.append(t, n);
        };
        for (e = 0; e < l; ++e) o[e].eachChar(h);
        i.types = r;
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
        const r = t.length;
        for (let o = 0; o < r; ++o) {
            n = t[o];
            s.push(...n.findMatches(e, i));
        }
        return s;
    }
    parse(t, e) {
        const i = [];
        const s = t.pattern;
        const n = s.length;
        let r = 0;
        let o = 0;
        let l = "";
        while (r < n) {
            l = s.charAt(r);
            if (!t.symbols.includes(l)) if (r === o) if ("P" === l && "PART" === s.slice(r, r + 4)) {
                o = r += 4;
                i.push(new DynamicSegment(t.symbols));
                ++e.dynamics;
            } else ++r; else ++r; else if (r !== o) {
                i.push(new StaticSegment(s.slice(o, r)));
                ++e.statics;
                o = r;
            } else {
                i.push(new SymbolSegment(s.slice(o, r + 1)));
                ++e.symbols;
                o = ++r;
            }
        }
        if (o !== r) {
            i.push(new StaticSegment(s.slice(o, r)));
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

const f = i.DI.createInterface("IAttributePattern");

const d = i.DI.createInterface("IAttributeParser", (t => t.singleton(AttributeParser)));

class AttributeParser {
    constructor(t, e) {
        this.$ = {};
        this.L = t;
        const i = this.q = {};
        e.forEach((e => {
            const s = v.getPatternDefinitions(e.constructor);
            t.add(s);
            s.forEach((t => {
                i[t.pattern] = e;
            }));
        }));
    }
    parse(t, e) {
        let i = this.$[t];
        if (null == i) i = this.$[t] = this.L.interpret(t);
        const s = i.pattern;
        if (null == s) return new AttrSyntax(t, e, t, null); else return this.q[s][s](t, e, i.parts);
    }
}

AttributeParser.inject = [ a, i.all(f) ];

function p(...t) {
    return function e(i) {
        return v.define(t, i);
    };
}

class AttributePatternResourceDefinition {
    constructor(t) {
        this.Type = t;
        this.name = void 0;
    }
    register(t) {
        i.Registration.singleton(f, this.Type).register(t);
    }
}

const m = i.Protocol.resource.keyFor("attribute-pattern");

const x = "attribute-pattern-definitions";

const v = Object.freeze({
    name: m,
    definitionAnnotationKey: x,
    define(t, e) {
        const s = new AttributePatternResourceDefinition(e);
        i.Metadata.define(m, s, e);
        i.Protocol.resource.appendTo(e, m);
        i.Protocol.annotation.set(e, x, t);
        i.Protocol.annotation.appendTo(e, x);
        return e;
    },
    getPatternDefinitions(t) {
        return i.Protocol.annotation.get(t, x);
    }
});

exports.DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
    "PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[1]);
    }
    "PART.PART.PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], i[2]);
    }
};

exports.DotSeparatedAttributePattern = n([ p({
    pattern: "PART.PART",
    symbols: "."
}, {
    pattern: "PART.PART.PART",
    symbols: "."
}) ], exports.DotSeparatedAttributePattern);

exports.RefAttributePattern = class RefAttributePattern {
    ref(t, e, i) {
        return new AttrSyntax(t, e, "element", "ref");
    }
    "PART.ref"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "ref");
    }
};

exports.RefAttributePattern = n([ p({
    pattern: "ref",
    symbols: ""
}, {
    pattern: "PART.ref",
    symbols: "."
}) ], exports.RefAttributePattern);

exports.ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
    ":PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "bind");
    }
};

exports.ColonPrefixedBindAttributePattern = n([ p({
    pattern: ":PART",
    symbols: ":"
}) ], exports.ColonPrefixedBindAttributePattern);

exports.AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
    "@PART"(t, e, i) {
        return new AttrSyntax(t, e, i[0], "trigger");
    }
};

exports.AtPrefixedTriggerAttributePattern = n([ p({
    pattern: "@PART",
    symbols: "@"
}) ], exports.AtPrefixedTriggerAttributePattern);

const g = () => Object.create(null);

const b = Object.prototype.hasOwnProperty;

const w = g();

const y = (t, e, i) => {
    if (true === w[e]) return true;
    if ("string" !== typeof e) return false;
    const s = e.slice(0, 5);
    return w[e] = "aria-" === s || "data-" === s || i.isStandardSvgAttribute(t, e);
};

const k = i.IPlatform;

const A = i.DI.createInterface("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

function C(t) {
    const e = g();
    let i;
    for (i of t) e[i] = true;
    return e;
}

class SVGAnalyzer {
    constructor(t) {
        this.M = Object.assign(g(), {
            a: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "target", "transform", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            altGlyph: C([ "class", "dx", "dy", "externalResourcesRequired", "format", "glyphRef", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            altglyph: g(),
            altGlyphDef: C([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphdef: g(),
            altGlyphItem: C([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphitem: g(),
            animate: C([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateColor: C([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateMotion: C([ "accumulate", "additive", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keyPoints", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "origin", "path", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "rotate", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateTransform: C([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "type", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            circle: C([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "r", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            clipPath: C([ "class", "clipPathUnits", "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            "color-profile": C([ "id", "local", "name", "rendering-intent", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            cursor: C([ "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            defs: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            desc: C([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            ellipse: C([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            feBlend: C([ "class", "height", "id", "in", "in2", "mode", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feColorMatrix: C([ "class", "height", "id", "in", "result", "style", "type", "values", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComponentTransfer: C([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComposite: C([ "class", "height", "id", "in", "in2", "k1", "k2", "k3", "k4", "operator", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feConvolveMatrix: C([ "bias", "class", "divisor", "edgeMode", "height", "id", "in", "kernelMatrix", "kernelUnitLength", "order", "preserveAlpha", "result", "style", "targetX", "targetY", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDiffuseLighting: C([ "class", "diffuseConstant", "height", "id", "in", "kernelUnitLength", "result", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDisplacementMap: C([ "class", "height", "id", "in", "in2", "result", "scale", "style", "width", "x", "xChannelSelector", "xml:base", "xml:lang", "xml:space", "y", "yChannelSelector" ]),
            feDistantLight: C([ "azimuth", "elevation", "id", "xml:base", "xml:lang", "xml:space" ]),
            feFlood: C([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feFuncA: C([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncB: C([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncG: C([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncR: C([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feGaussianBlur: C([ "class", "height", "id", "in", "result", "stdDeviation", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feImage: C([ "class", "externalResourcesRequired", "height", "id", "preserveAspectRatio", "result", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMerge: C([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMergeNode: C([ "id", "xml:base", "xml:lang", "xml:space" ]),
            feMorphology: C([ "class", "height", "id", "in", "operator", "radius", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feOffset: C([ "class", "dx", "dy", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            fePointLight: C([ "id", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feSpecularLighting: C([ "class", "height", "id", "in", "kernelUnitLength", "result", "specularConstant", "specularExponent", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feSpotLight: C([ "id", "limitingConeAngle", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feTile: C([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feTurbulence: C([ "baseFrequency", "class", "height", "id", "numOctaves", "result", "seed", "stitchTiles", "style", "type", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            filter: C([ "class", "externalResourcesRequired", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            font: C([ "class", "externalResourcesRequired", "horiz-adv-x", "horiz-origin-x", "horiz-origin-y", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            "font-face": C([ "accent-height", "alphabetic", "ascent", "bbox", "cap-height", "descent", "font-family", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "hanging", "id", "ideographic", "mathematical", "overline-position", "overline-thickness", "panose-1", "slope", "stemh", "stemv", "strikethrough-position", "strikethrough-thickness", "underline-position", "underline-thickness", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "widths", "x-height", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-format": C([ "id", "string", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-name": C([ "id", "name", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-src": C([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-uri": C([ "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            foreignObject: C([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            g: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            glyph: C([ "arabic-form", "class", "d", "glyph-name", "horiz-adv-x", "id", "lang", "orientation", "style", "unicode", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            glyphRef: C([ "class", "dx", "dy", "format", "glyphRef", "id", "style", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            glyphref: g(),
            hkern: C([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ]),
            image: C([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            line: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "x1", "x2", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            linearGradient: C([ "class", "externalResourcesRequired", "gradientTransform", "gradientUnits", "id", "spreadMethod", "style", "x1", "x2", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            marker: C([ "class", "externalResourcesRequired", "id", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            mask: C([ "class", "externalResourcesRequired", "height", "id", "maskContentUnits", "maskUnits", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            metadata: C([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "missing-glyph": C([ "class", "d", "horiz-adv-x", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            mpath: C([ "externalResourcesRequired", "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            path: C([ "class", "d", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "pathLength", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            pattern: C([ "class", "externalResourcesRequired", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            polygon: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            polyline: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            radialGradient: C([ "class", "cx", "cy", "externalResourcesRequired", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "spreadMethod", "style", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            rect: C([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            script: C([ "externalResourcesRequired", "id", "type", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            set: C([ "attributeName", "attributeType", "begin", "dur", "end", "externalResourcesRequired", "fill", "id", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            stop: C([ "class", "id", "offset", "style", "xml:base", "xml:lang", "xml:space" ]),
            style: C([ "id", "media", "title", "type", "xml:base", "xml:lang", "xml:space" ]),
            svg: C([ "baseProfile", "class", "contentScriptType", "contentStyleType", "externalResourcesRequired", "height", "id", "onabort", "onactivate", "onclick", "onerror", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onresize", "onscroll", "onunload", "onzoom", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "version", "viewBox", "width", "x", "xml:base", "xml:lang", "xml:space", "y", "zoomAndPan" ]),
            switch: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            symbol: C([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            text: C([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "transform", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            textPath: C([ "class", "externalResourcesRequired", "id", "lengthAdjust", "method", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "textLength", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            title: C([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            tref: C([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            tspan: C([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            use: C([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            view: C([ "externalResourcesRequired", "id", "preserveAspectRatio", "viewBox", "viewTarget", "xml:base", "xml:lang", "xml:space", "zoomAndPan" ]),
            vkern: C([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ])
        });
        this.U = C([ "a", "altGlyph", "animate", "animateColor", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood", "feGaussianBlur", "feImage", "feMerge", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence", "filter", "font", "foreignObject", "g", "glyph", "glyphRef", "image", "line", "linearGradient", "marker", "mask", "missing-glyph", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use" ]);
        this.F = C([ "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "clip", "color-interpolation-filters", "color-interpolation", "color-profile", "color-rendering", "color", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "fill", "filter", "flood-color", "flood-opacity", "font-family", "font-size-adjust", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "stroke", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ]);
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
        return i.Registration.singleton(A, this).register(t);
    }
    isStandardSvgAttribute(t, e) {
        var i;
        if (!(t instanceof this.SVGElement)) return false;
        return true === this.U[t.nodeName] && true === this.F[e] || true === (null === (i = this.M[t.nodeName]) || void 0 === i ? void 0 : i[e]);
    }
}

SVGAnalyzer.inject = [ k ];

const R = i.DI.createInterface("IAttrMapper", (t => t.singleton(AttrMapper)));

class AttrMapper {
    constructor(t) {
        this.svg = t;
        this.fns = [];
        this.V = g();
        this._ = g();
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
        return [ A ];
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
            n = null !== (e = (i = this.V)[r]) && void 0 !== e ? e : i[r] = g();
            for (o in s) {
                if (void 0 !== n[o]) throw E(o, r);
                n[o] = s[o];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this._;
        for (const i in t) {
            if (void 0 !== e[i]) throw E(i, "*");
            e[i] = t[i];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return S(t, e) || this.fns.length > 0 && this.fns.some((i => i(t, e)));
    }
    map(t, e) {
        var i, s, n;
        return null !== (n = null !== (s = null === (i = this.V[t.nodeName]) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : this._[e]) && void 0 !== n ? n : y(t, e, this.svg) ? e : null;
    }
}

function S(t, e) {
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

function E(t, e) {
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
        this.i = null;
        this.N = false;
        this.f = 0;
        this.obj = t;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this.N = t !== this.i;
        if (0 === (256 & e)) this.H();
    }
    H() {
        if (this.N) {
            this.N = false;
            const t = this.value;
            const e = this.attr;
            this.i = t;
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
                this.i = this.value;
                this.value = t;
                this.N = false;
                this.f = 0;
                this.queue.add(this);
            }
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.value = this.i = this.obj.getAttribute(this.prop);
            B(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) O(this.obj, this);
    }
    flush() {
        j = this.i;
        this.i = this.value;
        this.subs.notify(this.value, j, this.f);
    }
}

s.subscriberCollection(AttributeObserver);

s.withFlushQueue(AttributeObserver);

const B = (t, e, i) => {
    if (void 0 === e.$eMObs) e.$eMObs = new Set;
    if (void 0 === e.$mObs) (e.$mObs = new t(I)).observe(e, {
        attributes: true
    });
    e.$eMObs.add(i);
};

const O = (t, e) => {
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

const I = t => {
    t[0].target.$eMObs.forEach(T, t);
};

function T(t) {
    t.handleMutation(this);
}

let j;

class BindingTargetSubscriber {
    constructor(t) {
        this.b = t;
    }
    handleChange(t, e, i) {
        const s = this.b;
        if (t !== s.sourceExpression.evaluate(i, s.$scope, s.locator, null)) s.updateSource(t, i);
    }
}

const {oneTime: D, toView: P, fromView: $} = s.BindingMode;

const L = P | D;

const q = {
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
        this.p = o.get(k);
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
        const u = 0 === (2 & i) && (4 & h.type) > 0;
        let c = false;
        let a;
        if (10082 !== r.$kind || this.obs.count > 1) {
            c = 0 === (s & D);
            if (c) this.obs.version++;
            t = r.evaluate(i, o, l, n);
            if (c) this.obs.clear(false);
        }
        if (t !== this.value) {
            this.value = t;
            if (u) {
                a = this.task;
                this.task = this.p.domWriteQueue.queueTask((() => {
                    this.task = null;
                    n.updateTarget(t, i);
                }), q);
                null === a || void 0 === a ? void 0 : a.cancel();
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
        if (r & L) {
            l = (r & P) > 0;
            o.updateTarget(this.value = s.evaluate(t, e, this.locator, l ? o : null), t);
        }
        if (r & $) n.subscribe(null !== (i = this.targetSubscriber) && void 0 !== i ? i : this.targetSubscriber = new BindingTargetSubscriber(o));
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

s.connectable(AttributeBinding);

const {toView: M} = s.BindingMode;

const U = {
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
        const u = l.length;
        let c = 0;
        for (;u > c; ++c) h[c] = new InterpolationPartBinding(l[c], i, s, r, t, this);
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
        let u;
        if (h) {
            u = this.task;
            this.task = this.taskQueue.queueTask((() => {
                this.task = null;
                l.setValue(r, e, this.target, this.targetProperty);
            }), U);
            null === u || void 0 === u ? void 0 : u.cancel();
            u = null;
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
    constructor(t, e, i, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.locator = n;
        this.owner = o;
        this.interceptor = this;
        this.mode = s.BindingMode.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
        this.oL = r;
    }
    handleChange(t, e, i) {
        if (!this.isBound) return;
        const s = this.sourceExpression;
        const n = this.obs;
        const r = 10082 === s.$kind && 1 === n.count;
        let o = false;
        if (!r) {
            o = (this.mode & M) > 0;
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
        this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & M) > 0 ? this.interceptor : null);
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

s.connectable(InterpolationPartBinding);

class ContentBinding {
    constructor(t, e, i, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.locator = i;
        this.p = r;
        this.strict = o;
        this.interceptor = this;
        this.mode = s.BindingMode.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
        this.oL = n;
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
            l = (this.mode & M) > 0;
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
        const i = this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & M) > 0 ? this.interceptor : null);
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
        }), U);
        null === i || void 0 === i ? void 0 : i.cancel();
    }
}

s.connectable(ContentBinding);

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

s.connectable(LetBinding);

const {oneTime: F, toView: V, fromView: _} = s.BindingMode;

const N = V | F;

const H = {
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
        const u = this.obs;
        let c = false;
        if (10082 !== r.$kind || u.count > 1) {
            c = this.mode > F;
            if (c) u.version++;
            t = r.evaluate(i, o, l, n);
            if (c) u.clear(false);
        }
        if (h) {
            W = this.task;
            this.task = this.taskQueue.queueTask((() => {
                n.updateTarget(t, i);
                this.task = null;
            }), H);
            null === W || void 0 === W ? void 0 : W.cancel();
            W = null;
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
            if (r & _) o = n.getObserver(this.target, this.targetProperty); else o = n.getAccessor(this.target, this.targetProperty);
            this.targetObserver = o;
        }
        s = this.sourceExpression;
        const l = this.interceptor;
        const h = (r & V) > 0;
        if (r & N) l.updateTarget(s.evaluate(t, e, this.locator, h ? l : null), t);
        if (r & _) {
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
        W = this.task;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        if (null != W) {
            W.cancel();
            W = this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}

s.connectable(PropertyBinding);

let W = null;

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

const z = i.DI.createInterface("IAppTask");

class $AppTask {
    constructor(t, e, i) {
        this.c = void 0;
        this.slot = t;
        this.k = e;
        this.cb = i;
    }
    register(t) {
        return this.c = t.register(i.Registration.instance(z, this));
    }
    run() {
        const t = this.k;
        const e = this.cb;
        return null === t ? e() : e(this.c.get(t));
    }
}

const G = Object.freeze({
    beforeCreate: X("beforeCreate"),
    hydrating: X("hydrating"),
    hydrated: X("hydrated"),
    beforeActivate: X("beforeActivate"),
    afterActivate: X("afterActivate"),
    beforeDeactivate: X("beforeDeactivate"),
    afterDeactivate: X("afterDeactivate")
});

function X(t) {
    function e(e, i) {
        if ("function" === typeof i) return new $AppTask(t, e, i);
        return new $AppTask(t, null, e);
    }
    return e;
}

function K(t, e) {
    let s;
    function n(t, e) {
        if (arguments.length > 1) s.property = e;
        i.Metadata.define(Q, ChildrenDefinition.create(e, s), t.constructor, e);
        i.Protocol.annotation.appendTo(t.constructor, Z.keyFrom(e));
    }
    if (arguments.length > 1) {
        s = {};
        n(t, e);
        return;
    } else if ("string" === typeof t) {
        s = {};
        return n;
    }
    s = void 0 === t ? {} : t;
    return n;
}

function Y(t) {
    return t.startsWith(Q);
}

const Q = i.Protocol.annotation.keyFor("children-observer");

const Z = Object.freeze({
    name: i.Protocol.annotation.keyFor("children-observer"),
    keyFrom(t) {
        return `${Q}:${t}`;
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
        const e = Q.length + 1;
        const s = [];
        const n = i.getPrototypeChain(t);
        let r = n.length;
        let o = 0;
        let l;
        let h;
        let u;
        while (--r >= 0) {
            u = n[r];
            l = i.Protocol.annotation.getKeys(u).filter(Y);
            h = l.length;
            for (let t = 0; t < h; ++t) s[o++] = i.Metadata.getOwn(Q, u, l[t].slice(e));
        }
        return s;
    }
});

const J = {
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
        var s;
        return new ChildrenDefinition(i.firstDefined(e.callback, `${t}Changed`), i.firstDefined(e.property, t), null !== (s = e.options) && void 0 !== s ? s : J, e.query, e.filter, e.map);
    }
}

class ChildrenObserver {
    constructor(t, e, i, s, n = tt, r = et, o = it, l) {
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
                this.W();
            }))).observe(this.controller.host, this.options);
        }
    }
    stop() {
        if (this.observing) {
            this.observing = false;
            this.observer.disconnect();
            this.children = i.emptyArray;
        }
    }
    W() {
        this.children = this.get();
        if (void 0 !== this.callback) this.callback.call(this.obj);
        this.subs.notify(this.children, void 0, 0);
    }
    get() {
        return nt(this.controller, this.query, this.filter, this.map);
    }
}

s.subscriberCollection()(ChildrenObserver);

function tt(t) {
    return t.host.childNodes;
}

function et(t, e, i) {
    return !!i;
}

function it(t, e, i) {
    return i;
}

const st = {
    optional: true
};

function nt(t, e, i, s) {
    var n;
    const r = e(t);
    const o = r.length;
    const l = [];
    let h;
    let u;
    let c;
    let a = 0;
    for (;a < o; ++a) {
        h = r[a];
        u = bt.for(h, st);
        c = null !== (n = null === u || void 0 === u ? void 0 : u.viewModel) && void 0 !== n ? n : null;
        if (i(h, u, c)) l.push(s(h, u, c));
    }
    return l;
}

function rt(t) {
    return function(e) {
        return ht.define(t, e);
    };
}

function ot(t) {
    return function(e) {
        return ht.define("string" === typeof t ? {
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
    static create(t, e) {
        let n;
        let r;
        if ("string" === typeof t) {
            n = t;
            r = {
                name: n
            };
        } else {
            n = t.name;
            r = t;
        }
        return new CustomAttributeDefinition(e, i.firstDefined(ht.getAnnotation(e, "name"), n), i.mergeArrays(ht.getAnnotation(e, "aliases"), r.aliases, e.aliases), ht.keyFrom(n), i.firstDefined(ht.getAnnotation(e, "defaultBindingMode"), r.defaultBindingMode, e.defaultBindingMode, s.BindingMode.toView), i.firstDefined(ht.getAnnotation(e, "isTemplateController"), r.isTemplateController, e.isTemplateController, false), u.from(...u.getAll(e), ht.getAnnotation(e, "bindables"), e.bindables, r.bindables), i.firstDefined(ht.getAnnotation(e, "noMultiBindings"), r.noMultiBindings, e.noMultiBindings, false), i.mergeArrays(ft.getAnnotation(e), e.watches));
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        i.Registration.transient(n, e).register(t);
        i.Registration.aliasTo(n, e).register(t);
        s.registerAliases(r, ht, n, t);
    }
}

const lt = i.Protocol.resource.keyFor("custom-attribute");

const ht = Object.freeze({
    name: lt,
    keyFrom(t) {
        return `${lt}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && i.Metadata.hasOwn(lt, t);
    },
    for(t, e) {
        var i;
        return null !== (i = ve(t, ht.keyFrom(e))) && void 0 !== i ? i : void 0;
    },
    define(t, e) {
        const s = CustomAttributeDefinition.create(t, e);
        i.Metadata.define(lt, s, s.Type);
        i.Metadata.define(lt, s, s);
        i.Protocol.resource.appendTo(e, lt);
        return s.Type;
    },
    getDefinition(t) {
        const e = i.Metadata.getOwn(lt, t);
        if (void 0 === e) throw new Error(`AUR0702:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        i.Metadata.define(i.Protocol.annotation.keyFor(e), s, t);
    },
    getAnnotation(t, e) {
        return i.Metadata.getOwn(i.Protocol.annotation.keyFor(e), t);
    }
});

function ut(t, e) {
    if (!t) throw new Error("AUR0715");
    return function i(s, n, r) {
        const o = null == n;
        const l = o ? s : s.constructor;
        const h = new WatchDefinition(t, o ? e : r.value);
        if (o) {
            if ("function" !== typeof e && (null == e || !(e in l.prototype))) throw new Error(`AUR0716:${String(e)}@${l.name}}`);
        } else if ("function" !== typeof (null === r || void 0 === r ? void 0 : r.value)) throw new Error(`AUR0717:${String(n)}`);
        ft.add(l, h);
        if (ht.isType(l)) ht.getDefinition(l).watches.push(h);
        if (bt.isType(l)) bt.getDefinition(l).watches.push(h);
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const ct = i.emptyArray;

const at = i.Protocol.annotation.keyFor("watch");

const ft = {
    name: at,
    add(t, e) {
        let s = i.Metadata.getOwn(at, t);
        if (null == s) i.Metadata.define(at, s = [], t);
        s.push(e);
    },
    getAnnotation(t) {
        var e;
        return null !== (e = i.Metadata.getOwn(at, t)) && void 0 !== e ? e : ct;
    }
};

function dt(t) {
    return function(e) {
        return bt.define(t, e);
    };
}

function pt(t) {
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

const xt = new WeakMap;

class CustomElementDefinition {
    constructor(t, e, i, s, n, r, o, l, h, u, c, a, f, d, p, m, x, v, g, b) {
        this.Type = t;
        this.name = e;
        this.aliases = i;
        this.key = s;
        this.cache = n;
        this.template = r;
        this.instructions = o;
        this.dependencies = l;
        this.injectable = h;
        this.needsCompile = u;
        this.surrogates = c;
        this.bindables = a;
        this.childrenObservers = f;
        this.containerless = d;
        this.isStrictBinding = p;
        this.shadowOptions = m;
        this.hasSlots = x;
        this.enhance = v;
        this.watches = g;
        this.processContent = b;
    }
    static create(t, e = null) {
        if (null === e) {
            const s = t;
            if ("string" === typeof s) throw new Error(`AUR0704:${t}`);
            const n = i.fromDefinitionOrDefault("name", s, bt.generateName);
            if ("function" === typeof s.Type) e = s.Type; else e = bt.generateType(i.pascalCase(n));
            return new CustomElementDefinition(e, n, i.mergeArrays(s.aliases), i.fromDefinitionOrDefault("key", s, (() => bt.keyFrom(n))), i.fromDefinitionOrDefault("cache", s, (() => 0)), i.fromDefinitionOrDefault("template", s, (() => null)), i.mergeArrays(s.instructions), i.mergeArrays(s.dependencies), i.fromDefinitionOrDefault("injectable", s, (() => null)), i.fromDefinitionOrDefault("needsCompile", s, (() => true)), i.mergeArrays(s.surrogates), u.from(s.bindables), Z.from(s.childrenObservers), i.fromDefinitionOrDefault("containerless", s, (() => false)), i.fromDefinitionOrDefault("isStrictBinding", s, (() => false)), i.fromDefinitionOrDefault("shadowOptions", s, (() => null)), i.fromDefinitionOrDefault("hasSlots", s, (() => false)), i.fromDefinitionOrDefault("enhance", s, (() => false)), i.fromDefinitionOrDefault("watches", s, (() => i.emptyArray)), i.fromAnnotationOrTypeOrDefault("processContent", e, (() => null)));
        }
        if ("string" === typeof t) return new CustomElementDefinition(e, t, i.mergeArrays(bt.getAnnotation(e, "aliases"), e.aliases), bt.keyFrom(t), i.fromAnnotationOrTypeOrDefault("cache", e, (() => 0)), i.fromAnnotationOrTypeOrDefault("template", e, (() => null)), i.mergeArrays(bt.getAnnotation(e, "instructions"), e.instructions), i.mergeArrays(bt.getAnnotation(e, "dependencies"), e.dependencies), i.fromAnnotationOrTypeOrDefault("injectable", e, (() => null)), i.fromAnnotationOrTypeOrDefault("needsCompile", e, (() => true)), i.mergeArrays(bt.getAnnotation(e, "surrogates"), e.surrogates), u.from(...u.getAll(e), bt.getAnnotation(e, "bindables"), e.bindables), Z.from(...Z.getAll(e), bt.getAnnotation(e, "childrenObservers"), e.childrenObservers), i.fromAnnotationOrTypeOrDefault("containerless", e, (() => false)), i.fromAnnotationOrTypeOrDefault("isStrictBinding", e, (() => false)), i.fromAnnotationOrTypeOrDefault("shadowOptions", e, (() => null)), i.fromAnnotationOrTypeOrDefault("hasSlots", e, (() => false)), i.fromAnnotationOrTypeOrDefault("enhance", e, (() => false)), i.mergeArrays(ft.getAnnotation(e), e.watches), i.fromAnnotationOrTypeOrDefault("processContent", e, (() => null)));
        const s = i.fromDefinitionOrDefault("name", t, bt.generateName);
        return new CustomElementDefinition(e, s, i.mergeArrays(bt.getAnnotation(e, "aliases"), t.aliases, e.aliases), bt.keyFrom(s), i.fromAnnotationOrDefinitionOrTypeOrDefault("cache", t, e, (() => 0)), i.fromAnnotationOrDefinitionOrTypeOrDefault("template", t, e, (() => null)), i.mergeArrays(bt.getAnnotation(e, "instructions"), t.instructions, e.instructions), i.mergeArrays(bt.getAnnotation(e, "dependencies"), t.dependencies, e.dependencies), i.fromAnnotationOrDefinitionOrTypeOrDefault("injectable", t, e, (() => null)), i.fromAnnotationOrDefinitionOrTypeOrDefault("needsCompile", t, e, (() => true)), i.mergeArrays(bt.getAnnotation(e, "surrogates"), t.surrogates, e.surrogates), u.from(...u.getAll(e), bt.getAnnotation(e, "bindables"), e.bindables, t.bindables), Z.from(...Z.getAll(e), bt.getAnnotation(e, "childrenObservers"), e.childrenObservers, t.childrenObservers), i.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", t, e, (() => false)), i.fromAnnotationOrDefinitionOrTypeOrDefault("isStrictBinding", t, e, (() => false)), i.fromAnnotationOrDefinitionOrTypeOrDefault("shadowOptions", t, e, (() => null)), i.fromAnnotationOrDefinitionOrTypeOrDefault("hasSlots", t, e, (() => false)), i.fromAnnotationOrDefinitionOrTypeOrDefault("enhance", t, e, (() => false)), i.mergeArrays(t.watches, ft.getAnnotation(e), e.watches), i.fromAnnotationOrDefinitionOrTypeOrDefault("processContent", t, e, (() => null)));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) return t;
        if (xt.has(t)) return xt.get(t);
        const e = CustomElementDefinition.create(t);
        xt.set(t, e);
        i.Metadata.define(bt.name, e, e.Type);
        return e;
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        if (!t.has(n, false)) {
            i.Registration.transient(n, e).register(t);
            i.Registration.aliasTo(n, e).register(t);
            s.registerAliases(r, bt, n, t);
        }
    }
}

const vt = {
    name: void 0,
    searchParents: false,
    optional: false
};

const gt = i.Protocol.resource.keyFor("custom-element");

const bt = Object.freeze({
    name: gt,
    keyFrom(t) {
        return `${gt}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && i.Metadata.hasOwn(gt, t);
    },
    for(t, e = vt) {
        if (void 0 === e.name && true !== e.searchParents) {
            const i = ve(t, gt);
            if (null === i) {
                if (true === e.optional) return null;
                throw new Error("AUR0705");
            }
            return i;
        }
        if (void 0 !== e.name) {
            if (true !== e.searchParents) {
                const i = ve(t, gt);
                if (null === i) throw new Error("AUR0706");
                if (i.is(e.name)) return i;
                return;
            }
            let i = t;
            let s = false;
            while (null !== i) {
                const t = ve(i, gt);
                if (null !== t) {
                    s = true;
                    if (t.is(e.name)) return t;
                }
                i = Ae(i);
            }
            if (s) return;
            throw new Error("AUR0707");
        }
        let i = t;
        while (null !== i) {
            const t = ve(i, gt);
            if (null !== t) return t;
            i = Ae(i);
        }
        throw new Error("AUR0708");
    },
    define(t, e) {
        const s = CustomElementDefinition.create(t, e);
        i.Metadata.define(gt, s, s.Type);
        i.Metadata.define(gt, s, s);
        i.Protocol.resource.appendTo(s.Type, gt);
        return s.Type;
    },
    getDefinition(t) {
        const e = i.Metadata.getOwn(gt, t);
        if (void 0 === e) throw new Error(`AUR0703:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        i.Metadata.define(i.Protocol.annotation.keyFor(e), s, t);
    },
    getAnnotation(t, e) {
        return i.Metadata.getOwn(i.Protocol.annotation.keyFor(e), t);
    },
    generateName: function() {
        let t = 0;
        return function() {
            return `unnamed-${++t}`;
        };
    }(),
    createInjectable() {
        const t = function(e, s, n) {
            const r = i.DI.getOrCreateAnnotationParamTypes(e);
            r[n] = t;
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

const wt = i.Protocol.annotation.keyFor("processContent");

function yt(t) {
    return void 0 === t ? function(t, e, s) {
        i.Metadata.define(wt, kt(t, e), t);
    } : function(e) {
        t = kt(e, t);
        const s = i.Metadata.getOwn(gt, e);
        if (void 0 !== s) s.processContent = t; else i.Metadata.define(wt, t, e);
        return e;
    };
}

function kt(t, e) {
    if ("string" === typeof e) e = t[e];
    const i = typeof e;
    if ("function" !== i) throw new Error(`AUR0709:${i}`);
    return e;
}

class ClassAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = 2 | 4;
        this.value = "";
        this.i = "";
        this.doNotCache = true;
        this.G = {};
        this.X = 0;
        this.N = false;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        this.value = t;
        this.N = t !== this.i;
        if (0 === (256 & e)) this.H();
    }
    H() {
        if (this.N) {
            this.N = false;
            const t = this.value;
            const e = this.G;
            const i = At(t);
            let s = this.X;
            this.i = t;
            if (i.length > 0) this.K(i);
            this.X += 1;
            if (0 === s) return;
            s -= 1;
            for (const t in e) {
                if (!Object.prototype.hasOwnProperty.call(e, t) || e[t] !== s) continue;
                this.obj.classList.remove(t);
            }
        }
    }
    K(t) {
        const e = this.obj;
        const i = t.length;
        let s = 0;
        let n;
        for (;s < i; s++) {
            n = t[s];
            if (0 === n.length) continue;
            this.G[n] = this.X;
            e.classList.add(n);
        }
    }
}

function At(t) {
    if ("string" === typeof t) return Ct(t);
    if ("object" !== typeof t) return i.emptyArray;
    if (t instanceof Array) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) i.push(...At(t[s]));
            return i;
        } else return i.emptyArray;
    }
    const e = [];
    let s;
    for (s in t) if (Boolean(t[s])) if (s.includes(" ")) e.push(...Ct(s)); else e.push(s);
    return e;
}

function Ct(t) {
    const e = t.match(/\S+/g);
    if (null === e) return i.emptyArray;
    return e;
}

function Rt(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        var e;
        const i = Object.assign({}, ...this.modules);
        const s = ht.define({
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
                this.element.className = At(this.value).map((t => i[t] || t)).join(" ");
            }
        }, e.inject = [ be ], e));
        t.register(s);
    }
}

function St(...t) {
    return new ShadowDOMRegistry(t);
}

const Et = i.DI.createInterface("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(k))) return t.get(AdoptedStyleSheetsStylesFactory);
    return t.get(StyleElementStylesFactory);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(Ot);
        const s = t.get(Et);
        t.register(i.Registration.instance(Bt, s.createStyles(this.css, e)));
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

AdoptedStyleSheetsStylesFactory.inject = [ k ];

class StyleElementStylesFactory {
    constructor(t) {
        this.p = t;
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
}

StyleElementStylesFactory.inject = [ k ];

const Bt = i.DI.createInterface("IShadowDOMStyles");

const Ot = i.DI.createInterface("IShadowDOMGlobalStyles", (t => t.instance({
    applyTo: i.noop
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

const It = {
    shadowDOM(t) {
        return G.beforeCreate(i.IContainer, (e => {
            if (null != t.sharedStyles) {
                const s = e.get(Et);
                e.register(i.Registration.instance(Ot, s.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: Tt, exit: jt} = s.ConnectableSwitcher;

const {wrap: Dt, unwrap: Pt} = s.ProxyObservable;

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
            Tt(this);
            return this.value = Pt(this.get.call(void 0, this.useProxy ? Dt(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            jt(this);
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

s.connectable(ComputedWatcher);

s.connectable(ExpressionWatcher);

const $t = i.DI.createInterface("ILifecycleHooks");

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
        i.Registration.singleton($t, this.Type).register(t);
    }
}

const Lt = new WeakMap;

const qt = i.Protocol.annotation.keyFor("lifecycle-hooks");

const Mt = Object.freeze({
    name: qt,
    define(t, e) {
        const s = LifecycleHooksDefinition.create(t, e);
        i.Metadata.define(qt, s, e);
        i.Protocol.resource.appendTo(e, qt);
        return s.Type;
    },
    resolve(t) {
        let e = Lt.get(t);
        if (void 0 === e) {
            e = new LifecycleHooksLookupImpl;
            const s = t.root;
            const n = s.id === t.id ? t.getAll($t) : t.has($t, false) ? [ ...s.getAll($t), ...t.getAll($t) ] : s.getAll($t);
            let r;
            let o;
            let l;
            let h;
            let u;
            for (r of n) {
                o = i.Metadata.getOwn(qt, r.constructor);
                l = new LifecycleHooksEntry(o, r);
                for (h of o.propertyNames) {
                    u = e[h];
                    if (void 0 === u) e[h] = [ l ]; else u.push(l);
                }
            }
        }
        return e;
    }
});

class LifecycleHooksLookupImpl {}

function Ut() {
    return function t(e) {
        return Mt.define({}, e);
    };
}

const Ft = i.DI.createInterface("IViewFactory");

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

const Vt = new WeakSet;

function _t(t) {
    return !Vt.has(t);
}

function Nt(t) {
    Vt.add(t);
    return CustomElementDefinition.create(t);
}

const Ht = i.Protocol.resource.keyFor("views");

const Wt = Object.freeze({
    name: Ht,
    has(t) {
        return "function" === typeof t && (i.Metadata.hasOwn(Ht, t) || "$views" in t);
    },
    get(t) {
        if ("function" === typeof t && "$views" in t) {
            const e = t.$views;
            const i = e.filter(_t).map(Nt);
            for (const e of i) Wt.add(t, e);
        }
        let e = i.Metadata.getOwn(Ht, t);
        if (void 0 === e) i.Metadata.define(Ht, e = [], t);
        return e;
    },
    add(t, e) {
        const s = CustomElementDefinition.create(e);
        let n = i.Metadata.getOwn(Ht, t);
        if (void 0 === n) i.Metadata.define(Ht, n = [ s ], t); else n.push(s);
        return n;
    }
});

function zt(t) {
    return function(e) {
        Wt.add(e, t);
    };
}

const Gt = i.DI.createInterface("IViewLocator", (t => t.singleton(ViewLocator)));

class ViewLocator {
    constructor() {
        this.Y = new WeakMap;
        this.Z = new Map;
    }
    getViewComponentForObject(t, e) {
        if (t) {
            const i = Wt.has(t.constructor) ? Wt.get(t.constructor) : [];
            const s = "function" === typeof e ? e(t, i) : this.J(i, e);
            return this.tt(t, i, s);
        }
        return null;
    }
    tt(t, e, i) {
        let s = this.Y.get(t);
        let n;
        if (void 0 === s) {
            s = {};
            this.Y.set(t, s);
        } else n = s[i];
        if (void 0 === n) {
            const r = this.et(t, e, i);
            n = bt.define(bt.getDefinition(r), class extends r {
                constructor() {
                    super(t);
                }
            });
            s[i] = n;
        }
        return n;
    }
    et(t, e, i) {
        let n = this.Z.get(t.constructor);
        let r;
        if (void 0 === n) {
            n = {};
            this.Z.set(t.constructor, n);
        } else r = n[i];
        if (void 0 === r) {
            r = bt.define(this.it(e, i), class {
                constructor(t) {
                    this.viewModel = t;
                }
                define(t, e, i) {
                    const n = this.viewModel;
                    t.scope = s.Scope.fromParent(t.scope, n);
                    if (void 0 !== n.define) return n.define(t, e, i);
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
            n[i] = r;
        }
        return r;
    }
    J(t, e) {
        if (e) return e;
        if (1 === t.length) return t[0].name;
        return "default-view";
    }
    it(t, e) {
        const i = t.find((t => t.name === e));
        if (void 0 === i) throw new Error(`Could not find view: ${e}`);
        return i;
    }
}

const Xt = i.DI.createInterface("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    constructor(t) {
        this.st = new WeakMap;
        this.nt = new WeakMap;
        this.rt = (this.ot = t.root).get(k);
        this.lt = new FragmentNodeSequence(this.rt, this.rt.document.createDocumentFragment());
    }
    get renderers() {
        return null == this.rs ? this.rs = this.ot.getAll(Me, false).reduce(((t, e) => {
            t[e.instructionType] = e;
            return t;
        }), g()) : this.rs;
    }
    compile(t, e, i) {
        if (false !== t.needsCompile) {
            const s = this.st;
            const n = e.get(qe);
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
        if (true === t.enhance) return new FragmentNodeSequence(this.rt, t.template);
        let e;
        const i = this.nt;
        if (i.has(t)) e = i.get(t); else {
            const s = this.rt;
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
        return null == e ? this.lt : new FragmentNodeSequence(this.rt, e.cloneNode(true));
    }
    render(t, e, i, s, n) {
        const r = s.instructions;
        const o = this.renderers;
        const l = i.length;
        if (i.length !== r.length) throw new Error(`AUR0757:${l}<>${r.length}`);
        let h = 0;
        let u = 0;
        let c = 0;
        let a;
        let f;
        let d;
        if (l > 0) while (l > h) {
            a = r[h];
            d = i[h];
            u = 0;
            c = a.length;
            while (c > u) {
                f = a[u];
                o[f.type].render(t, e, d, f);
                ++u;
            }
            ++h;
        }
        if (void 0 !== n && null !== n) {
            a = s.surrogates;
            if ((c = a.length) > 0) {
                u = 0;
                while (c > u) {
                    f = a[u];
                    o[f.type].render(t, e, n, f);
                    ++u;
                }
            }
        }
    }
}

Rendering.inject = [ i.IContainer ];

var Kt;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["host"] = 1] = "host";
    t[t["shadowRoot"] = 2] = "shadowRoot";
    t[t["location"] = 3] = "location";
})(Kt || (Kt = {}));

const Yt = {
    optional: true
};

const Qt = new WeakMap;

class Controller {
    constructor(t, e, s, n, r, o, l) {
        this.container = t;
        this.vmKind = e;
        this.flags = s;
        this.definition = n;
        this.viewFactory = r;
        this.viewModel = o;
        this.host = l;
        this.id = i.nextId("au$component");
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
        this.ht = false;
        this.ut = i.emptyArray;
        this.$initiator = null;
        this.$flags = 0;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.ct = 0;
        this.at = 0;
        this.ft = 0;
        this.logger = null;
        this.debug = false;
        this.dt = t.root.get(Xt);
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
        return Qt.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (void 0 === e) throw new Error(`AUR0500:${t}`);
        return e;
    }
    static $el(t, e, s, n, r = 0, o = void 0) {
        if (Qt.has(e)) return Qt.get(e);
        o = null !== o && void 0 !== o ? o : bt.getDefinition(e.constructor);
        const l = new Controller(t, 0, r, o, null, e, s);
        const h = t.get(i.optional(ce));
        if (o.dependencies.length > 0) t.register(...o.dependencies);
        t.registerResolver(ce, new i.InstanceProvider("IHydrationContext", new HydrationContext(l, n, h)));
        Qt.set(e, l);
        if (null == n || false !== n.hydrate) l.xt(n, h);
        return l;
    }
    static $attr(t, e, i, s = 0, n) {
        if (Qt.has(e)) return Qt.get(e);
        n = null !== n && void 0 !== n ? n : ht.getDefinition(e.constructor);
        const r = new Controller(t, 1, s, n, null, e, i);
        Qt.set(e, r);
        r.vt();
        return r;
    }
    static $view(t, e = 0, i = void 0) {
        const s = new Controller(t.container, 2, e, null, t, null, null);
        s.parent = null !== i && void 0 !== i ? i : null;
        s.gt();
        return s;
    }
    xt(t, e) {
        this.logger = this.container.get(i.ILogger).root;
        this.debug = this.logger.config.level <= 1;
        if (this.debug) this.logger = this.logger.scopeTo(this.name);
        const n = this.container;
        const r = this.flags;
        const o = this.viewModel;
        let l = this.definition;
        this.scope = s.Scope.create(o, null, true);
        if (l.watches.length > 0) se(this, n, l, o);
        Jt(this, l, r, o);
        this.ut = te(this, l, r, o);
        if (this.hooks.hasDefine) {
            if (this.debug) this.logger.trace(`invoking define() hook`);
            const t = o.define(this, e, l);
            if (void 0 !== t && t !== l) l = CustomElementDefinition.getOrCreate(t);
        }
        this.lifecycleHooks = Mt.resolve(n);
        l.register(n);
        if (null !== l.injectable) n.registerResolver(l.injectable, new i.InstanceProvider("definition.injectable", o));
        if (null == t || false !== t.hydrate) {
            this.bt(t);
            this.wt();
        }
    }
    bt(t) {
        if (this.hooks.hasHydrating) {
            if (this.debug) this.logger.trace(`invoking hydrating() hook`);
            this.viewModel.hydrating(this);
        }
        const e = this.yt = this.dt.compile(this.definition, this.container, t);
        const {shadowOptions: i, isStrictBinding: s, hasSlots: n, containerless: r} = e;
        this.isStrictBinding = s;
        if (null !== (this.hostController = bt.for(this.host, Yt))) this.host = this.container.root.get(k).document.createElement(this.definition.name);
        ge(this.host, bt.name, this);
        ge(this.host, this.definition.key, this);
        if (null !== i || n) {
            if (r) throw new Error("AUR0501");
            ge(this.shadowRoot = this.host.attachShadow(null !== i && void 0 !== i ? i : oe), bt.name, this);
            ge(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2;
        } else if (r) {
            ge(this.location = Re(this.host), bt.name, this);
            ge(this.location, this.definition.key, this);
            this.mountTarget = 3;
        } else this.mountTarget = 1;
        this.viewModel.$controller = this;
        this.nodes = this.dt.createNodes(e);
        if (this.hooks.hasHydrated) {
            if (this.debug) this.logger.trace(`invoking hydrated() hook`);
            this.viewModel.hydrated(this);
        }
    }
    wt() {
        this.dt.render(this.flags, this, this.nodes.findTargets(), this.yt, this.host);
        if (this.hooks.hasCreated) {
            if (this.debug) this.logger.trace(`invoking created() hook`);
            this.viewModel.created(this);
        }
    }
    vt() {
        const t = this.definition;
        const e = this.viewModel;
        if (t.watches.length > 0) se(this, this.container, t, e);
        Jt(this, t, this.flags, e);
        e.$controller = this;
        this.lifecycleHooks = Mt.resolve(this.container);
        if (this.hooks.hasCreated) {
            if (this.debug) this.logger.trace(`invoking created() hook`);
            this.viewModel.created(this);
        }
    }
    gt() {
        this.yt = this.dt.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this.yt.isStrictBinding;
        this.dt.render(this.flags, this, (this.nodes = this.dt.createNodes(this.yt)).findTargets(), this.yt, void 0);
    }
    activate(t, e, s, n) {
        var r;
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
            throw new Error(`AUR0503:${this.name} ${he(this.state)}`);
        }
        this.parent = e;
        if (this.debug && !this.ht) {
            this.ht = true;
            (null !== (r = this.logger) && void 0 !== r ? r : this.logger = this.container.get(i.ILogger).root.scopeTo(this.name)).trace(`activate()`);
        }
        s |= 2;
        switch (this.vmKind) {
          case 0:
            this.scope.parentScope = null !== n && void 0 !== n ? n : null;
            break;

          case 1:
            this.scope = null !== n && void 0 !== n ? n : null;
            break;

          case 2:
            if (void 0 === n || null === n) throw new Error("AUR0504");
            if (!this.hasLockedScope) this.scope = n;
            break;
        }
        if (this.isStrictBinding) s |= 1;
        this.$initiator = t;
        this.$flags = s;
        this.kt();
        if (this.hooks.hasBinding) {
            if (this.debug) this.logger.trace(`binding()`);
            const t = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.At();
                t.then((() => {
                    this.bind();
                })).catch((t => {
                    this.Ct(t);
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
        let e = this.ut.length;
        let i;
        if (e > 0) while (e > t) {
            this.ut[t].start();
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
                this.At();
                i.then((() => {
                    this.isBound = true;
                    this.Rt();
                })).catch((t => {
                    this.Ct(t);
                }));
                return;
            }
        }
        this.isBound = true;
        this.Rt();
    }
    St(...t) {
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
    Rt() {
        if (this.debug) this.logger.trace(`attach()`);
        if (null !== this.hostController) switch (this.mountTarget) {
          case 1:
          case 2:
            this.hostController.St(this.host);
            break;

          case 3:
            this.hostController.St(this.location.$start, this.location);
            break;
        }
        switch (this.mountTarget) {
          case 1:
            this.nodes.appendTo(this.host, null != this.definition && this.definition.enhance);
            break;

          case 2:
            {
                const t = this.container;
                const e = t.has(Bt, false) ? t.get(Bt) : t.get(Ot);
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
                this.At();
                this.kt();
                t.then((() => {
                    this.Et();
                })).catch((t => {
                    this.Ct(t);
                }));
            }
        }
        if (null !== this.children) {
            let t = 0;
            for (;t < this.children.length; ++t) void this.children[t].activate(this.$initiator, this, this.$flags, this.scope);
        }
        this.Et();
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
            throw new Error(`AUR0505:${this.name} ${he(this.state)}`);
        }
        if (this.debug) this.logger.trace(`deactivate()`);
        this.$initiator = t;
        this.$flags = i;
        if (t === this) this.Bt();
        let s = 0;
        if (this.ut.length) for (;s < this.ut.length; ++s) this.ut[s].stop();
        if (null !== this.children) for (s = 0; s < this.children.length; ++s) void this.children[s].deactivate(t, this, i);
        if (this.hooks.hasDetaching) {
            if (this.debug) this.logger.trace(`detaching()`);
            const e = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (e instanceof Promise) {
                this.At();
                t.Bt();
                e.then((() => {
                    t.Ot();
                })).catch((e => {
                    t.Ct(e);
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
        this.It();
    }
    At() {
        if (void 0 === this.$promise) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) this.parent.At();
        }
    }
    It() {
        if (void 0 !== this.$promise) {
            fe = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            fe();
            fe = void 0;
        }
    }
    Ct(t) {
        if (void 0 !== this.$promise) {
            de = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            de(t);
            de = void 0;
        }
        if (this.$initiator !== this) this.parent.Ct(t);
    }
    kt() {
        ++this.ct;
        if (this.$initiator !== this) this.parent.kt();
    }
    Et() {
        if (0 === --this.ct) {
            if (this.hooks.hasAttached) {
                if (this.debug) this.logger.trace(`attached()`);
                pe = this.viewModel.attached(this.$initiator, this.$flags);
                if (pe instanceof Promise) {
                    this.At();
                    pe.then((() => {
                        this.state = 2;
                        this.It();
                        if (this.$initiator !== this) this.parent.Et();
                    })).catch((t => {
                        this.Ct(t);
                    }));
                    pe = void 0;
                    return;
                }
                pe = void 0;
            }
            this.state = 2;
            this.It();
        }
        if (this.$initiator !== this) this.parent.Et();
    }
    Bt() {
        ++this.at;
    }
    Ot() {
        if (0 === --this.at) {
            if (this.debug) this.logger.trace(`detach()`);
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
                    pe = t.viewModel.unbinding(t.$initiator, t.parent, t.$flags);
                    if (pe instanceof Promise) {
                        this.At();
                        this.Tt();
                        pe.then((() => {
                            this.jt();
                        })).catch((t => {
                            this.Ct(t);
                        }));
                    }
                    pe = void 0;
                }
                t = t.next;
            }
            this.jt();
        }
    }
    Tt() {
        ++this.ft;
    }
    jt() {
        if (0 === --this.ft) {
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
            return ht.getDefinition(this.viewModel.constructor).name === t;

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
            ge(t, bt.name, this);
            ge(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = 1;
        return this;
    }
    setShadowRoot(t) {
        if (0 === this.vmKind) {
            ge(t, bt.name, this);
            ge(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = 2;
        return this;
    }
    setLocation(t) {
        if (0 === this.vmKind) {
            ge(t, bt.name, this);
            ge(t, this.definition.key, this);
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
            this.children.forEach(ae);
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
            for (let i = 0, s = e.length; i < s; ++i) if (true === e[i].accept(t)) return true;
        }
    }
}

function Zt(t) {
    let e = t.$observers;
    if (void 0 === e) Reflect.defineProperty(t, "$observers", {
        enumerable: false,
        value: e = {}
    });
    return e;
}

function Jt(t, e, i, s) {
    const n = e.bindables;
    const r = Object.getOwnPropertyNames(n);
    const o = r.length;
    if (o > 0) {
        let e;
        let i;
        let l = 0;
        const h = Zt(s);
        for (;l < o; ++l) {
            e = r[l];
            if (void 0 === h[e]) {
                i = n[e];
                h[e] = new BindableObserver(s, e, i.callback, i.set, t);
            }
        }
    }
}

function te(t, e, s, n) {
    const r = e.childrenObservers;
    const o = Object.getOwnPropertyNames(r);
    const l = o.length;
    if (l > 0) {
        const e = Zt(n);
        const i = [];
        let s;
        let h = 0;
        let u;
        for (;h < l; ++h) {
            s = o[h];
            if (void 0 == e[s]) {
                u = r[s];
                i[i.length] = e[s] = new ChildrenObserver(t, n, s, u.callback, u.query, u.filter, u.map, u.options);
            }
        }
        return i;
    }
    return i.emptyArray;
}

const ee = new Map;

const ie = t => {
    let e = ee.get(t);
    if (null == e) {
        e = new s.AccessScopeExpression(t, 0);
        ee.set(t, e);
    }
    return e;
};

function se(t, e, i, n) {
    const r = e.get(s.IObserverLocator);
    const o = e.get(s.IExpressionParser);
    const l = i.watches;
    const h = 0 === t.vmKind ? t.scope : s.Scope.create(n, null, true);
    const u = l.length;
    let c;
    let a;
    let f;
    let d = 0;
    for (;u > d; ++d) {
        ({expression: c, callback: a} = l[d]);
        a = "function" === typeof a ? a : Reflect.get(n, a);
        if ("function" !== typeof a) throw new Error(`AUR0506:${String(a)}`);
        if ("function" === typeof c) t.addBinding(new ComputedWatcher(n, r, c, a, true)); else {
            f = "string" === typeof c ? o.parse(c, 53) : ie(c);
            t.addBinding(new ExpressionWatcher(h, e, r, f, a));
        }
    }
}

function ne(t) {
    return t instanceof Controller && 0 === t.vmKind;
}

function re(t) {
    return i.isObject(t) && bt.isType(t.constructor);
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

const oe = {
    mode: "open"
};

exports.ViewModelKind = void 0;

(function(t) {
    t[t["customElement"] = 0] = "customElement";
    t[t["customAttribute"] = 1] = "customAttribute";
    t[t["synthetic"] = 2] = "synthetic";
})(exports.ViewModelKind || (exports.ViewModelKind = {}));

var le;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["activating"] = 1] = "activating";
    t[t["activated"] = 2] = "activated";
    t[t["deactivating"] = 4] = "deactivating";
    t[t["deactivated"] = 8] = "deactivated";
    t[t["released"] = 16] = "released";
    t[t["disposed"] = 32] = "disposed";
})(le || (le = {}));

function he(t) {
    const e = [];
    if (1 === (1 & t)) e.push("activating");
    if (2 === (2 & t)) e.push("activated");
    if (4 === (4 & t)) e.push("deactivating");
    if (8 === (8 & t)) e.push("deactivated");
    if (16 === (16 & t)) e.push("released");
    if (32 === (32 & t)) e.push("disposed");
    return 0 === e.length ? "none" : e.join("|");
}

const ue = i.DI.createInterface("IController");

const ce = i.DI.createInterface("IHydrationContext");

class HydrationContext {
    constructor(t, e, i) {
        this.instruction = e;
        this.parent = i;
        this.controller = t;
    }
}

function ae(t) {
    t.dispose();
}

let fe;

let de;

let pe;

const me = i.DI.createInterface("IAppRoot");

const xe = i.DI.createInterface("IWorkTracker", (t => t.singleton(WorkTracker)));

class WorkTracker {
    constructor(t) {
        this.Dt = 0;
        this.Pt = null;
        this.It = null;
        this.$t = t.scopeTo("WorkTracker");
    }
    start() {
        this.$t.trace(`start(stack:${this.Dt})`);
        ++this.Dt;
    }
    finish() {
        this.$t.trace(`finish(stack:${this.Dt})`);
        if (0 === --this.Dt) {
            const t = this.It;
            if (null !== t) {
                this.It = this.Pt = null;
                t();
            }
        }
    }
    wait() {
        this.$t.trace(`wait(stack:${this.Dt})`);
        if (null === this.Pt) {
            if (0 === this.Dt) return Promise.resolve();
            this.Pt = new Promise((t => {
                this.It = t;
            }));
        }
        return this.Pt;
    }
}

WorkTracker.inject = [ i.ILogger ];

class AppRoot {
    constructor(t, e, s, n) {
        this.config = t;
        this.platform = e;
        this.container = s;
        this.controller = void 0;
        this.Lt = void 0;
        this.host = t.host;
        this.work = s.get(xe);
        n.prepare(this);
        s.registerResolver(be, s.registerResolver(e.Element, new i.InstanceProvider("ElementProvider", t.host)));
        this.Lt = i.onResolve(this.qt("beforeCreate"), (() => {
            const e = t.component;
            const n = s.createChild();
            let r;
            if (bt.isType(e)) r = this.container.get(e); else r = t.component;
            const o = {
                hydrate: false,
                projections: null
            };
            const l = this.controller = Controller.$el(n, r, this.host, o, 0);
            l.xt(o, null);
            return i.onResolve(this.qt("hydrating"), (() => {
                l.bt(null);
                return i.onResolve(this.qt("hydrated"), (() => {
                    l.wt();
                    this.Lt = void 0;
                }));
            }));
        }));
    }
    activate() {
        return i.onResolve(this.Lt, (() => i.onResolve(this.qt("beforeActivate"), (() => i.onResolve(this.controller.activate(this.controller, null, 2, void 0), (() => this.qt("afterActivate")))))));
    }
    deactivate() {
        return i.onResolve(this.qt("beforeDeactivate"), (() => i.onResolve(this.controller.deactivate(this.controller, null, 0), (() => this.qt("afterDeactivate")))));
    }
    qt(t) {
        return i.resolveAll(...this.container.getAll(z).reduce(((e, i) => {
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

function ve(t, e) {
    var i, s;
    return null !== (s = null === (i = t.$au) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : null;
}

function ge(t, e, i) {
    var s;
    var n;
    (null !== (s = (n = t).$au) && void 0 !== s ? s : n.$au = new Refs)[e] = i;
}

const be = i.DI.createInterface("INode");

const we = i.DI.createInterface("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(me, true)) return t.get(me).host;
    return t.get(k).document;
}))));

const ye = i.DI.createInterface("IRenderLocation");

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

const ke = new WeakMap;

function Ae(t) {
    if (ke.has(t)) return ke.get(t);
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
        const e = bt.for(t);
        if (void 0 === e) return null;
        if (2 === e.mountTarget) return Ae(e.host);
    }
    return t.parentNode;
}

function Ce(t, e) {
    if (void 0 !== t.platform && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) ke.set(i[t], e);
    } else ke.set(t, e);
}

function Re(t) {
    if (Se(t)) return t;
    const e = t.ownerDocument.createComment("au-end");
    const i = t.ownerDocument.createComment("au-start");
    if (null !== t.parentNode) {
        t.parentNode.replaceChild(e, t);
        e.parentNode.insertBefore(i, e);
    }
    e.$start = i;
    return e;
}

function Se(t) {
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
            if ("AU-M" === r.nodeName) o[s] = Re(r); else o[s] = r;
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
        if (Se(t)) this.refNode = t; else {
            this.next = t;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (void 0 !== this.next) this.refNode = this.next.firstChild; else this.refNode = void 0;
    }
}

const Ee = i.DI.createInterface("IWindow", (t => t.callback((t => t.get(k).window))));

const Be = i.DI.createInterface("ILocation", (t => t.callback((t => t.get(Ee).location))));

const Oe = i.DI.createInterface("IHistory", (t => t.callback((t => t.get(Ee).history))));

const Ie = {
    [s.DelegationStrategy.capturing]: {
        capture: true
    },
    [s.DelegationStrategy.bubbling]: {
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
        if (this.delegationStrategy === s.DelegationStrategy.none) this.target.addEventListener(this.targetEvent, this); else this.handler = this.eventDelegator.addEventListener(this.locator.get(we), this.target, this.targetEvent, this, Ie[this.delegationStrategy]);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        const e = this.sourceExpression;
        if (e.hasUnbind) e.unbind(t, this.$scope, this.interceptor);
        this.$scope = null;
        if (this.delegationStrategy === s.DelegationStrategy.none) this.target.removeEventListener(this.targetEvent, this); else {
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

const Te = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = Te) {
        this.Mt = t;
        this.Ut = e;
        this.Ft = i;
        this.count = 0;
        this.Vt = new Map;
        this._t = new Map;
    }
    increment() {
        if (1 === ++this.count) this.Mt.addEventListener(this.Ut, this, this.Ft);
    }
    decrement() {
        if (0 === --this.count) this.Mt.removeEventListener(this.Ut, this, this.Ft);
    }
    dispose() {
        if (this.count > 0) {
            this.count = 0;
            this.Mt.removeEventListener(this.Ut, this, this.Ft);
        }
        this.Vt.clear();
        this._t.clear();
    }
    getLookup(t) {
        const e = true === this.Ft.capture ? this.Vt : this._t;
        let i = e.get(t);
        if (void 0 === i) e.set(t, i = Object.create(null));
        return i;
    }
    handleEvent(t) {
        const e = true === this.Ft.capture ? this.Vt : this._t;
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
        this.Nt = t;
        this.Ht = e;
        this.Ut = i;
        t.increment();
        e[i] = s;
    }
    dispose() {
        this.Nt.decrement();
        this.Ht[this.Ut] = void 0;
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

const je = i.DI.createInterface("IEventDelegator", (t => t.singleton(EventDelegator)));

class EventDelegator {
    constructor() {
        this.Wt = Object.create(null);
    }
    addEventListener(t, e, i, s, n) {
        var r;
        var o;
        const l = null !== (r = (o = this.Wt)[i]) && void 0 !== r ? r : o[i] = new Map;
        let h = l.get(t);
        if (void 0 === h) l.set(t, h = new ListenerTracker(t, i, n));
        return new DelegateSubscription(h, h.getLookup(e), i, s);
    }
    dispose() {
        for (const t in this.Wt) {
            const e = this.Wt[t];
            for (const t of e.values()) t.dispose();
            e.clear();
        }
    }
}

const De = i.DI.createInterface("IProjections");

const Pe = i.DI.createInterface("IAuSlotsInfo");

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

const $e = i.DI.createInterface("Instruction");

function Le(t) {
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

const qe = i.DI.createInterface("ITemplateCompiler");

const Me = i.DI.createInterface("IRenderer");

function Ue(t) {
    return function e(s) {
        const n = function(...e) {
            const i = new s(...e);
            i.instructionType = t;
            return i;
        };
        n.register = function t(e) {
            i.Registration.singleton(Me, n).register(e);
        };
        const r = i.Metadata.getOwnKeys(s);
        for (const t of r) i.Metadata.define(t, i.Metadata.getOwn(t, s), n);
        const o = Object.getOwnPropertyDescriptors(s);
        Object.keys(o).filter((t => "prototype" !== t)).forEach((t => {
            Reflect.defineProperty(n, t, o[t]);
        }));
        return n;
    };
}

function Fe(t, e, i) {
    if ("string" === typeof e) return t.parse(e, i);
    return e;
}

function Ve(t) {
    if (null != t.viewModel) return t.viewModel;
    return t;
}

function _e(t, e) {
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
            const i = ht.for(t, e);
            if (void 0 !== i) return i.viewModel;
            const s = bt.for(t, {
                name: e
            });
            if (void 0 === s) throw new Error(`AUR0751:${e}`);
            return s.viewModel;
        }
    }
}

let Ne = class SetPropertyRenderer {
    render(t, e, i, s) {
        const n = Ve(i);
        if (void 0 !== n.$observers && void 0 !== n.$observers[s.to]) n.$observers[s.to].setValue(s.value, 2); else n[s.to] = s.value;
    }
};

Ne = n([ Ue("re") ], Ne);

let He = class CustomElementRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Xt, k ];
    }
    render(t, e, s, n) {
        let r;
        let o;
        let l;
        let h;
        const u = n.res;
        const c = n.projections;
        const a = e.container;
        const f = mi(this.p, e, s, n, s, null == c ? void 0 : new AuSlotsInfo(Object.keys(c)));
        switch (typeof u) {
          case "string":
            r = a.find(bt, u);
            if (null == r) throw new Error(`AUR0752:${u}@${e["name"]}`);
            break;

          default:
            r = u;
        }
        o = r.Type;
        l = f.invoke(o);
        f.registerResolver(o, new i.InstanceProvider(r.key, l));
        h = Controller.$el(f, l, s, n, t, r);
        t = h.flags;
        ge(s, r.key, h);
        const d = this.r.renderers;
        const p = n.props;
        const m = p.length;
        let x = 0;
        let v;
        while (m > x) {
            v = p[x];
            d[v.type].render(t, e, h, v);
            ++x;
        }
        e.addChild(h);
    }
};

He = n([ Ue("ra") ], He);

let We = class CustomAttributeRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Xt, k ];
    }
    render(t, e, i, s) {
        let n = e.container;
        let r;
        switch (typeof s.res) {
          case "string":
            r = n.find(ht, s.res);
            if (null == r) throw new Error(`AUR0753:${s.res}@${e["name"]}`);
            break;

          default:
            r = s.res;
        }
        const o = xi(this.p, r, e, i, s, void 0, void 0);
        const l = Controller.$attr(e.container, o, i, t, r);
        ge(i, r.key, l);
        const h = this.r.renderers;
        const u = s.props;
        const c = u.length;
        let a = 0;
        let f;
        while (c > a) {
            f = u[a];
            h[f.type].render(t, e, l, f);
            ++a;
        }
        e.addChild(l);
    }
};

We = n([ Ue("rb") ], We);

let ze = class TemplateControllerRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Xt, k ];
    }
    render(t, e, i, s) {
        var n;
        let r = e.container;
        let o;
        switch (typeof s.res) {
          case "string":
            o = r.find(ht, s.res);
            if (null == o) throw new Error(`AUR0754:${s.res}@${e["name"]}`);
            break;

          default:
            o = s.res;
        }
        const l = this.r.getViewFactory(s.def, r);
        const h = Re(i);
        const u = xi(this.p, o, e, i, s, l, h);
        const c = Controller.$attr(e.container, u, i, t, o);
        ge(h, o.key, c);
        null === (n = u.link) || void 0 === n ? void 0 : n.call(u, t, e, c, i, s);
        const a = this.r.renderers;
        const f = s.props;
        const d = f.length;
        let p = 0;
        let m;
        while (d > p) {
            m = f[p];
            a[m.type].render(t, e, c, m);
            ++p;
        }
        e.addChild(c);
    }
};

ze = n([ Ue("rc") ], ze);

let Ge = class LetElementRenderer {
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
        let u;
        let c;
        let a = 0;
        while (l > a) {
            h = n[a];
            u = Fe(this.parser, h.from, 48);
            c = new LetBinding(u, h.to, this.oL, o, r);
            e.addBinding(38962 === u.$kind ? ei(c, u, o) : c);
            ++a;
        }
    }
};

Ge = n([ Ue("rd"), r(0, s.IExpressionParser), r(1, s.IObserverLocator) ], Ge);

let Xe = class CallBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        const n = Fe(this.parser, s.from, 153);
        const r = new CallBinding(n, Ve(i), s.to, this.oL, e.container);
        e.addBinding(38962 === n.$kind ? ei(r, n, e.container) : r);
    }
};

Xe.inject = [ s.IExpressionParser, s.IObserverLocator ];

Xe = n([ Ue("rh") ], Xe);

let Ke = class RefBindingRenderer {
    constructor(t) {
        this.parser = t;
    }
    render(t, e, i, s) {
        const n = Fe(this.parser, s.from, 5376);
        const r = new RefBinding(n, _e(i, s.to), e.container);
        e.addBinding(38962 === n.$kind ? ei(r, n, e.container) : r);
    }
};

Ke = n([ Ue("rj"), r(0, s.IExpressionParser) ], Ke);

let Ye = class InterpolationBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, n) {
        const r = e.container;
        const o = Fe(this.parser, n.from, 2048);
        const l = new InterpolationBinding(this.oL, o, Ve(i), n.to, s.BindingMode.toView, r, this.p.domWriteQueue);
        const h = l.partBindings;
        const u = h.length;
        let c = 0;
        let a;
        for (;u > c; ++c) {
            a = h[c];
            if (38962 === a.sourceExpression.$kind) h[c] = ei(a, a.sourceExpression, r);
        }
        e.addBinding(l);
    }
};

Ye = n([ Ue("rf"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, k) ], Ye);

let Qe = class PropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Fe(this.parser, s.from, 48 | s.mode);
        const r = new PropertyBinding(n, Ve(i), s.to, s.mode, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === n.$kind ? ei(r, n, e.container) : r);
    }
};

Qe = n([ Ue("rg"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, k) ], Qe);

let Ze = class IteratorBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, n) {
        const r = Fe(this.parser, n.from, 539);
        const o = new PropertyBinding(r, Ve(i), n.to, s.BindingMode.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(o);
    }
};

Ze = n([ Ue("rk"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, k) ], Ze);

let Je = 0;

const ti = [];

function ei(t, e, i) {
    while (e instanceof s.BindingBehaviorExpression) {
        ti[Je++] = e;
        e = e.expression;
    }
    while (Je > 0) {
        const e = ti[--Je];
        const n = i.get(e.behaviorKey);
        if (n instanceof s.BindingBehaviorFactory) t = n.construct(t, e);
    }
    ti.length = 0;
    return t;
}

let ii = class TextBindingRenderer {
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
        const h = Fe(this.parser, s.from, 2048);
        const u = h.parts;
        const c = h.expressions;
        const a = c.length;
        let f = 0;
        let d = u[0];
        let p;
        let m;
        if ("" !== d) o.insertBefore(l.createTextNode(d), r);
        for (;a > f; ++f) {
            m = c[f];
            p = new ContentBinding(m, o.insertBefore(l.createTextNode(""), r), n, this.oL, this.p, s.strict);
            e.addBinding(38962 === m.$kind ? ei(p, m, n) : p);
            d = u[f + 1];
            if ("" !== d) o.insertBefore(l.createTextNode(d), r);
        }
        if ("AU-M" === i.nodeName) i.remove();
    }
};

ii = n([ Ue("ha"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, k) ], ii);

let si = class ListenerBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.eventDelegator = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Fe(this.parser, s.from, 80 | s.strategy + 6);
        const r = new Listener(this.p, s.to, s.strategy, n, i, s.preventDefault, this.eventDelegator, e.container);
        e.addBinding(38962 === n.$kind ? ei(r, n, e.container) : r);
    }
};

si = n([ Ue("hb"), r(0, s.IExpressionParser), r(1, je), r(2, k) ], si);

let ni = class SetAttributeRenderer {
    render(t, e, i, s) {
        i.setAttribute(s.to, s.value);
    }
};

ni = n([ Ue("he") ], ni);

let ri = class SetClassAttributeRenderer {
    render(t, e, i, s) {
        ui(i.classList, s.value);
    }
};

ri = n([ Ue("hf") ], ri);

let oi = class SetStyleAttributeRenderer {
    render(t, e, i, s) {
        i.style.cssText += s.value;
    }
};

oi = n([ Ue("hg") ], oi);

let li = class StylePropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, n) {
        const r = Fe(this.parser, n.from, 48 | s.BindingMode.toView);
        const o = new PropertyBinding(r, i.style, n.to, s.BindingMode.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === r.$kind ? ei(o, r, e.container) : o);
    }
};

li = n([ Ue("hd"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, k) ], li);

let hi = class AttributeBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, n) {
        const r = Fe(this.parser, n.from, 48 | s.BindingMode.toView);
        const o = new AttributeBinding(r, i, n.attr, n.to, s.BindingMode.toView, this.oL, e.container);
        e.addBinding(38962 === r.$kind ? ei(o, r, e.container) : o);
    }
};

hi = n([ Ue("hc"), r(0, s.IExpressionParser), r(1, s.IObserverLocator) ], hi);

function ui(t, e) {
    const i = e.length;
    let s = 0;
    for (let n = 0; n < i; ++n) if (32 === e.charCodeAt(n)) {
        if (n !== s) t.add(e.slice(s, n));
        s = n + 1;
    } else if (n + 1 === i) t.add(e.slice(s));
}

const ci = "ElementProvider";

const ai = "IController";

const fi = "IInstruction";

const di = "IRenderLocation";

const pi = "IAuSlotsInfo";

function mi(t, e, s, n, r, o) {
    const l = e.container.createChild();
    l.registerResolver(t.Element, l.registerResolver(be, new i.InstanceProvider(ci, s)));
    l.registerResolver(ue, new i.InstanceProvider(ai, e));
    l.registerResolver($e, new i.InstanceProvider(fi, n));
    l.registerResolver(ye, null == r ? vi : new i.InstanceProvider(di, r));
    l.registerResolver(Ft, gi);
    l.registerResolver(Pe, null == o ? bi : new i.InstanceProvider(pi, o));
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

function xi(t, e, s, n, r, o, l, h) {
    const u = s.container.createChild();
    u.registerResolver(t.Element, u.registerResolver(be, new i.InstanceProvider(ci, n)));
    u.registerResolver(ue, new i.InstanceProvider(ai, s));
    u.registerResolver($e, new i.InstanceProvider(fi, r));
    u.registerResolver(ye, null == l ? vi : new i.InstanceProvider(di, l));
    u.registerResolver(Ft, null == o ? gi : new ViewFactoryProvider(o));
    u.registerResolver(Pe, null == h ? bi : new i.InstanceProvider(pi, h));
    return u.invoke(e.Type);
}

const vi = new i.InstanceProvider(di);

const gi = new ViewFactoryProvider(null);

const bi = new i.InstanceProvider(pi, new AuSlotsInfo(i.emptyArray));

function wi(t) {
    return function(e) {
        return ki.define(t, e);
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
        let s;
        let n;
        if ("string" === typeof t) {
            s = t;
            n = {
                name: s
            };
        } else {
            s = t.name;
            n = t;
        }
        return new BindingCommandDefinition(e, i.firstDefined(ki.getAnnotation(e, "name"), s), i.mergeArrays(ki.getAnnotation(e, "aliases"), n.aliases, e.aliases), ki.keyFrom(s), i.firstDefined(ki.getAnnotation(e, "type"), n.type, e.type, null));
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        i.Registration.singleton(n, e).register(t);
        i.Registration.aliasTo(n, e).register(t);
        s.registerAliases(r, ki, n, t);
    }
}

const yi = i.Protocol.resource.keyFor("binding-command");

const ki = Object.freeze({
    name: yi,
    keyFrom(t) {
        return `${yi}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && i.Metadata.hasOwn(yi, t);
    },
    define(t, e) {
        const s = BindingCommandDefinition.create(t, e);
        i.Metadata.define(yi, s, s.Type);
        i.Metadata.define(yi, s, s);
        i.Protocol.resource.appendTo(e, yi);
        return s.Type;
    },
    getDefinition(t) {
        const e = i.Metadata.getOwn(yi, t);
        if (void 0 === e) throw new Error(`AUR0701:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        i.Metadata.define(i.Protocol.annotation.keyFor(e), s, t);
    },
    getAnnotation(t, e) {
        return i.Metadata.getOwn(i.Protocol.annotation.keyFor(e), t);
    }
});

exports.OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 49;
    }
    static get inject() {
        return [ R ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.oneTime);
    }
};

exports.OneTimeBindingCommand = n([ wi("one-time") ], exports.OneTimeBindingCommand);

exports.ToViewBindingCommand = class ToViewBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 50;
    }
    static get inject() {
        return [ R ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.toView);
    }
};

exports.ToViewBindingCommand = n([ wi("to-view") ], exports.ToViewBindingCommand);

exports.FromViewBindingCommand = class FromViewBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 51;
    }
    static get inject() {
        return [ R ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.fromView);
    }
};

exports.FromViewBindingCommand = n([ wi("from-view") ], exports.FromViewBindingCommand);

exports.TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 52;
    }
    static get inject() {
        return [ R ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.twoWay);
    }
};

exports.TwoWayBindingCommand = n([ wi("two-way") ], exports.TwoWayBindingCommand);

exports.DefaultBindingCommand = class DefaultBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 53;
    }
    static get inject() {
        return [ R ];
    }
    build(t) {
        var e;
        const n = t.attr.target;
        const r = t.bindable;
        let o;
        let l;
        let h;
        if (null == r) {
            l = this.m.isTwoWay(t.node, n) ? s.BindingMode.twoWay : s.BindingMode.toView;
            h = null !== (e = this.m.map(t.node, n)) && void 0 !== e ? e : i.camelCase(n);
        } else {
            o = t.def.defaultBindingMode;
            l = r.mode === s.BindingMode.default || null == r.mode ? null == o || o === s.BindingMode.default ? s.BindingMode.toView : o : r.mode;
            h = r.property;
        }
        return new PropertyBindingInstruction(t.expr, h, l);
    }
};

exports.DefaultBindingCommand = n([ wi("bind") ], exports.DefaultBindingCommand);

exports.CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153;
    }
    build(t) {
        const e = null === t.bindable ? i.camelCase(t.attr.target) : t.bindable.property;
        return new CallBindingInstruction(t.expr, e);
    }
};

exports.CallBindingCommand = n([ wi("call") ], exports.CallBindingCommand);

exports.ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539;
    }
    build(t) {
        const e = null === t.bindable ? i.camelCase(t.attr.target) : t.bindable.property;
        return new IteratorBindingInstruction(t.expr, e);
    }
};

exports.ForBindingCommand = n([ wi("for") ], exports.ForBindingCommand);

exports.TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, true, s.DelegationStrategy.none);
    }
};

exports.TriggerBindingCommand = n([ wi("trigger") ], exports.TriggerBindingCommand);

exports.DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, false, s.DelegationStrategy.bubbling);
    }
};

exports.DelegateBindingCommand = n([ wi("delegate") ], exports.DelegateBindingCommand);

exports.CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, false, s.DelegationStrategy.capturing);
    }
};

exports.CaptureBindingCommand = n([ wi("capture") ], exports.CaptureBindingCommand);

exports.AttrBindingCommand = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction(t.attr.target, t.expr, t.attr.target);
    }
};

exports.AttrBindingCommand = n([ wi("attr") ], exports.AttrBindingCommand);

exports.StyleBindingCommand = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("style", t.expr, t.attr.target);
    }
};

exports.StyleBindingCommand = n([ wi("style") ], exports.StyleBindingCommand);

exports.ClassBindingCommand = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("class", t.expr, t.attr.target);
    }
};

exports.ClassBindingCommand = n([ wi("class") ], exports.ClassBindingCommand);

let Ai = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new RefBindingInstruction(t.expr, t.attr.target);
    }
};

Ai = n([ wi("ref") ], Ai);

const Ci = i.DI.createInterface("ITemplateElementFactory", (t => t.singleton(TemplateElementFactory)));

const Ri = {};

class TemplateElementFactory {
    constructor(t) {
        this.p = t;
        this.zt = t.document.createElement("template");
    }
    createTemplate(t) {
        var e;
        if ("string" === typeof t) {
            let e = Ri[t];
            if (void 0 === e) {
                const i = this.zt;
                i.innerHTML = t;
                const s = i.content.firstElementChild;
                if (null == s || "TEMPLATE" !== s.nodeName || null != s.nextElementSibling) {
                    this.zt = this.p.document.createElement("template");
                    e = i;
                } else {
                    i.content.removeChild(s);
                    e = s;
                }
                Ri[t] = e;
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

TemplateElementFactory.inject = [ k ];

const Si = function(t) {
    function e(t, s, n) {
        i.DI.inject(e)(t, s, n);
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
        return i.Registration.singleton(qe, this).register(t);
    }
    compile(t, e, s) {
        var n, r, o, l;
        const h = CustomElementDefinition.getOrCreate(t);
        if (null === h.template || void 0 === h.template) return h;
        if (false === h.needsCompile) return h;
        null !== s && void 0 !== s ? s : s = Oi;
        const u = new CompilationContext(t, e, s, null, null, void 0);
        const c = "string" === typeof h.template || !t.enhance ? u.Gt.createTemplate(h.template) : h.template;
        const a = "TEMPLATE" === c.nodeName && null != c.content;
        const f = a ? c.content : c;
        const d = e.get(Si(Fi));
        const p = d.length;
        let m = 0;
        if (p > 0) while (p > m) {
            null === (r = (n = d[m]).compiling) || void 0 === r ? void 0 : r.call(n, c);
            ++m;
        }
        if (c.hasAttribute(qi)) throw new Error("AUR0701");
        this.Xt(f, u);
        this.Kt(f, u);
        return CustomElementDefinition.create({
            ...t,
            name: t.name || bt.generateName(),
            dependencies: (null !== (o = t.dependencies) && void 0 !== o ? o : i.emptyArray).concat(null !== (l = u.deps) && void 0 !== l ? l : i.emptyArray),
            instructions: u.rows,
            surrogates: a ? this.Yt(c, u) : i.emptyArray,
            template: c,
            hasSlots: u.hasSlot,
            needsCompile: false
        });
    }
    Yt(t, e) {
        var s;
        const n = [];
        const r = t.attributes;
        const o = e.Qt;
        let l = r.length;
        let h = 0;
        let u;
        let c;
        let a;
        let f;
        let d = null;
        let p;
        let m;
        let x;
        let v;
        let g = null;
        let b;
        let w;
        let y;
        let k;
        for (;l > h; ++h) {
            u = r[h];
            c = u.name;
            a = u.value;
            f = e.Zt.parse(c, a);
            y = f.target;
            k = f.rawValue;
            if (ji[y]) throw new Error(`AUR0702:${c}`);
            g = e.Jt(f);
            if (null !== g && 4096 & g.bindingType) {
                b = o.parse(k, g.bindingType);
                Ti.node = t;
                Ti.attr = f;
                Ti.expr = b;
                Ti.bindable = null;
                Ti.def = null;
                n.push(g.build(Ti));
                continue;
            }
            d = e.te(y);
            if (null !== d) {
                if (d.isTemplateController) throw new Error(`AUR0703:${y}`);
                x = BindablesInfo.from(d, true);
                w = false === d.noMultiBindings && null === g && Ei(k);
                if (w) m = this.ee(t, k, d, e); else {
                    v = x.primary;
                    if (null === g) {
                        b = o.parse(k, 2048);
                        m = [ null === b ? new SetPropertyInstruction(k, v.property) : new InterpolationInstruction(b, v.property) ];
                    } else {
                        b = o.parse(k, g.bindingType);
                        Ti.node = t;
                        Ti.attr = f;
                        Ti.expr = b;
                        Ti.bindable = v;
                        Ti.def = d;
                        m = [ g.build(Ti) ];
                    }
                }
                t.removeAttribute(c);
                --h;
                --l;
                (null !== p && void 0 !== p ? p : p = []).push(new HydrateAttributeInstruction(this.resolveResources ? d : d.name, null != d.aliases && d.aliases.includes(y) ? y : void 0, m));
                continue;
            }
            if (null === g) {
                b = o.parse(k, 2048);
                if (null != b) {
                    t.removeAttribute(c);
                    --h;
                    --l;
                    n.push(new InterpolationInstruction(b, null !== (s = e.ie.map(t, y)) && void 0 !== s ? s : i.camelCase(y)));
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
                b = o.parse(k, g.bindingType);
                Ti.node = t;
                Ti.attr = f;
                Ti.expr = b;
                Ti.bindable = null;
                Ti.def = null;
                n.push(g.build(Ti));
            }
        }
        Bi();
        if (null != p) return p.concat(n);
        return n;
    }
    Kt(t, e) {
        switch (t.nodeType) {
          case 1:
            switch (t.nodeName) {
              case "LET":
                return this.se(t, e);

              default:
                return this.ne(t, e);
            }

          case 3:
            return this.re(t, e);

          case 11:
            {
                let i = t.firstChild;
                while (null !== i) i = this.Kt(i, e);
                break;
            }
        }
        return t.nextSibling;
    }
    se(t, e) {
        const n = t.attributes;
        const r = n.length;
        const o = [];
        const l = e.Qt;
        let h = false;
        let u = 0;
        let c;
        let a;
        let f;
        let d;
        let p;
        let m;
        let x;
        let v;
        for (;r > u; ++u) {
            c = n[u];
            f = c.name;
            d = c.value;
            if ("to-binding-context" === f) {
                h = true;
                continue;
            }
            a = e.Zt.parse(f, d);
            m = a.target;
            x = a.rawValue;
            p = e.Jt(a);
            if (null !== p) {
                if (50 === p.bindingType || 53 === p.bindingType) {
                    o.push(new LetBindingInstruction(l.parse(x, p.bindingType), i.camelCase(m)));
                    continue;
                }
                throw new Error(`AUR0704:${a.command}`);
            }
            v = l.parse(x, 2048);
            o.push(new LetBindingInstruction(null === v ? new s.PrimitiveLiteralExpression(x) : v, i.camelCase(m)));
        }
        e.rows.push([ new HydrateLetElementInstruction(o, h) ]);
        return this.oe(t).nextSibling;
    }
    ne(t, e) {
        var s, n, r, o, l;
        var h, u;
        const c = t.nextSibling;
        const a = (null !== (s = t.getAttribute("as-element")) && void 0 !== s ? s : t.nodeName).toLowerCase();
        const f = e.le(a);
        const d = e.Qt;
        const p = this.debug ? i.noop : () => {
            t.removeAttribute(w);
            --g;
            --v;
        };
        let m = t.attributes;
        let x;
        let v = m.length;
        let g = 0;
        let b;
        let w;
        let y;
        let k;
        let A;
        let C;
        let R = null;
        let S = false;
        let E;
        let B;
        let O;
        let I;
        let T;
        let j;
        let D;
        let P = null;
        let $;
        let L;
        let q;
        let M;
        let U = true;
        let F = false;
        if ("slot" === a) e.root.hasSlot = true;
        if (null !== f) {
            U = null === (n = f.processContent) || void 0 === n ? void 0 : n.call(f.Type, t, e.p);
            m = t.attributes;
            v = m.length;
        }
        if (e.root.def.enhance && t.classList.contains("au")) throw new Error(`AUR0705`);
        for (;v > g; ++g) {
            b = m[g];
            w = b.name;
            y = b.value;
            switch (w) {
              case "as-element":
              case "containerless":
                p();
                if (!F) F = "containerless" === w;
                continue;
            }
            k = e.Zt.parse(w, y);
            P = e.Jt(k);
            if (null !== P && 4096 & P.bindingType) {
                j = d.parse(y, P.bindingType);
                Ti.node = t;
                Ti.attr = k;
                Ti.expr = j;
                Ti.bindable = null;
                Ti.def = null;
                (null !== A && void 0 !== A ? A : A = []).push(P.build(Ti));
                p();
                continue;
            }
            q = k.target;
            M = k.rawValue;
            R = e.te(q);
            if (null !== R) {
                $ = BindablesInfo.from(R, true);
                S = false === R.noMultiBindings && null === P && Ei(y);
                if (S) O = this.ee(t, y, R, e); else {
                    L = $.primary;
                    if (null === P) {
                        j = d.parse(y, 2048);
                        O = [ null === j ? new SetPropertyInstruction(y, L.property) : new InterpolationInstruction(j, L.property) ];
                    } else {
                        j = d.parse(y, P.bindingType);
                        Ti.node = t;
                        Ti.attr = k;
                        Ti.expr = j;
                        Ti.bindable = L;
                        Ti.def = R;
                        O = [ P.build(Ti) ];
                    }
                }
                p();
                if (R.isTemplateController) (null !== I && void 0 !== I ? I : I = []).push(new HydrateTemplateController(Ii, this.resolveResources ? R : R.name, void 0, O)); else (null !== B && void 0 !== B ? B : B = []).push(new HydrateAttributeInstruction(this.resolveResources ? R : R.name, null != R.aliases && R.aliases.includes(q) ? q : void 0, O));
                continue;
            }
            if (null === P) {
                if (null !== f) {
                    $ = BindablesInfo.from(f, false);
                    E = $.attrs[q];
                    if (void 0 !== E) {
                        j = d.parse(M, 2048);
                        (null !== C && void 0 !== C ? C : C = []).push(null == j ? new SetPropertyInstruction(M, E.property) : new InterpolationInstruction(j, E.property));
                        p();
                        continue;
                    }
                }
                j = d.parse(M, 2048);
                if (null != j) {
                    p();
                    (null !== A && void 0 !== A ? A : A = []).push(new InterpolationInstruction(j, null !== (r = e.ie.map(t, q)) && void 0 !== r ? r : i.camelCase(q)));
                }
                continue;
            }
            p();
            if (null !== f) {
                $ = BindablesInfo.from(f, false);
                E = $.attrs[q];
                if (void 0 !== E) {
                    y = 0 === y.length && (P.bindingType & (53 | 49 | 50 | 52)) > 0 ? i.camelCase(w) : y;
                    j = d.parse(y, P.bindingType);
                    Ti.node = t;
                    Ti.attr = k;
                    Ti.expr = j;
                    Ti.bindable = E;
                    Ti.def = f;
                    (null !== C && void 0 !== C ? C : C = []).push(P.build(Ti));
                    continue;
                }
            }
            j = d.parse(M, P.bindingType);
            Ti.node = t;
            Ti.attr = k;
            Ti.expr = j;
            Ti.bindable = null;
            Ti.def = null;
            (null !== A && void 0 !== A ? A : A = []).push(P.build(Ti));
        }
        Bi();
        if (this.he(t) && null != A && A.length > 1) this.ue(t, A);
        if (null !== f) {
            D = new HydrateElementInstruction(this.resolveResources ? f : f.name, void 0, null !== C && void 0 !== C ? C : i.emptyArray, null, F);
            if ("au-slot" === a) {
                const i = t.getAttribute("name") || "default";
                const s = e.h("template");
                const n = e.ce();
                let r = t.firstChild;
                while (null !== r) {
                    if (1 === r.nodeType && r.hasAttribute("au-slot")) t.removeChild(r); else s.content.appendChild(r);
                    r = t.firstChild;
                }
                this.Kt(s.content, n);
                D.auSlot = {
                    name: i,
                    fallback: CustomElementDefinition.create({
                        name: bt.generateName(),
                        template: s,
                        instructions: n.rows,
                        needsCompile: false
                    })
                };
                t = this.ae(t, e);
            }
        }
        if (null != A || null != D || null != B) {
            x = i.emptyArray.concat(null !== D && void 0 !== D ? D : i.emptyArray, null !== B && void 0 !== B ? B : i.emptyArray, null !== A && void 0 !== A ? A : i.emptyArray);
            this.oe(t);
        }
        let V;
        if (null != I) {
            v = I.length - 1;
            g = v;
            T = I[g];
            let i;
            this.ae(t, e);
            if ("TEMPLATE" === t.nodeName) i = t; else {
                i = e.h("template");
                i.content.appendChild(t);
            }
            const s = i;
            const n = e.ce(null == x ? [] : [ x ]);
            V = null === f || !f.containerless && !F && false !== U;
            if (null !== f && f.containerless) this.ae(t, e);
            let r;
            let l;
            let u;
            let c;
            let a;
            let d;
            let p;
            let m;
            let b;
            let w = 0, y = 0;
            if (V) {
                if (null !== f) {
                    r = t.firstChild;
                    while (null !== r) if (1 === r.nodeType) {
                        l = r;
                        r = r.nextSibling;
                        u = l.getAttribute("au-slot");
                        if (null !== u) {
                            if ("" === u) u = "default";
                            l.removeAttribute("au-slot");
                            t.removeChild(l);
                            (null !== (o = (h = null !== a && void 0 !== a ? a : a = {})[u]) && void 0 !== o ? o : h[u] = []).push(l);
                        }
                    } else r = r.nextSibling;
                    if (null != a) {
                        c = {};
                        for (u in a) {
                            i = e.h("template");
                            d = a[u];
                            for (w = 0, y = d.length; y > w; ++w) {
                                p = d[w];
                                if ("TEMPLATE" === p.nodeName) if (p.attributes.length > 0) i.content.appendChild(p); else i.content.appendChild(p.content); else i.content.appendChild(p);
                            }
                            b = e.ce();
                            this.Kt(i.content, b);
                            c[u] = CustomElementDefinition.create({
                                name: bt.generateName(),
                                template: i,
                                instructions: b.rows,
                                needsCompile: false
                            });
                        }
                        D.projections = c;
                    }
                }
                if ("TEMPLATE" === t.nodeName) this.Kt(t.content, n); else {
                    r = t.firstChild;
                    while (null !== r) r = this.Kt(r, n);
                }
            }
            T.def = CustomElementDefinition.create({
                name: bt.generateName(),
                template: s,
                instructions: n.rows,
                needsCompile: false
            });
            while (g-- > 0) {
                T = I[g];
                i = e.h("template");
                m = e.h("au-m");
                m.classList.add("au");
                i.content.appendChild(m);
                T.def = CustomElementDefinition.create({
                    name: bt.generateName(),
                    template: i,
                    needsCompile: false,
                    instructions: [ [ I[g + 1] ] ]
                });
            }
            e.rows.push([ T ]);
        } else {
            if (null != x) e.rows.push(x);
            V = null === f || !f.containerless && !F && false !== U;
            if (null !== f && f.containerless) this.ae(t, e);
            if (V && t.childNodes.length > 0) {
                let i = t.firstChild;
                let s;
                let n;
                let r = null;
                let o;
                let h;
                let c;
                let a;
                let d;
                let p = 0, m = 0;
                while (null !== i) if (1 === i.nodeType) {
                    s = i;
                    i = i.nextSibling;
                    n = s.getAttribute("au-slot");
                    if (null !== n) {
                        if (null === f) throw new Error(`AUR0706:${t.nodeName}[${n}]`);
                        if ("" === n) n = "default";
                        t.removeChild(s);
                        s.removeAttribute("au-slot");
                        (null !== (l = (u = null !== o && void 0 !== o ? o : o = {})[n]) && void 0 !== l ? l : u[n] = []).push(s);
                    }
                } else i = i.nextSibling;
                if (null != o) {
                    r = {};
                    for (n in o) {
                        a = e.h("template");
                        h = o[n];
                        for (p = 0, m = h.length; m > p; ++p) {
                            c = h[p];
                            if ("TEMPLATE" === c.nodeName) if (c.attributes.length > 0) a.content.appendChild(c); else a.content.appendChild(c.content); else a.content.appendChild(c);
                        }
                        d = e.ce();
                        this.Kt(a.content, d);
                        r[n] = CustomElementDefinition.create({
                            name: bt.generateName(),
                            template: a,
                            instructions: d.rows,
                            needsCompile: false
                        });
                    }
                    D.projections = r;
                }
                i = t.firstChild;
                while (null !== i) i = this.Kt(i, e);
            }
        }
        return c;
    }
    re(t, e) {
        let i = "";
        let s = t;
        while (null !== s && 3 === s.nodeType) {
            i += s.textContent;
            s = s.nextSibling;
        }
        const n = e.Qt.parse(i, 2048);
        if (null === n) return s;
        const r = t.parentNode;
        r.insertBefore(this.oe(e.h("au-m")), t);
        e.rows.push([ new TextBindingInstruction(n, !!e.def.isStrictBinding) ]);
        t.textContent = "";
        s = t.nextSibling;
        while (null !== s && 3 === s.nodeType) {
            r.removeChild(s);
            s = t.nextSibling;
        }
        return t.nextSibling;
    }
    ee(t, e, i, s) {
        const n = BindablesInfo.from(i, true);
        const r = e.length;
        const o = [];
        let l;
        let h;
        let u = 0;
        let c = 0;
        let a;
        let f;
        let d;
        let p;
        for (let m = 0; m < r; ++m) {
            c = e.charCodeAt(m);
            if (92 === c) ++m; else if (58 === c) {
                l = e.slice(u, m);
                while (e.charCodeAt(++m) <= 32) ;
                u = m;
                for (;m < r; ++m) {
                    c = e.charCodeAt(m);
                    if (92 === c) ++m; else if (59 === c) {
                        h = e.slice(u, m);
                        break;
                    }
                }
                if (void 0 === h) h = e.slice(u);
                f = s.Zt.parse(l, h);
                d = s.Jt(f);
                p = n.attrs[f.target];
                if (null == p) throw new Error(`AUR0707:${i.name}.${f.target}`);
                if (null === d) {
                    a = s.Qt.parse(h, 2048);
                    o.push(null === a ? new SetPropertyInstruction(h, p.property) : new InterpolationInstruction(a, p.property));
                } else {
                    a = s.Qt.parse(h, d.bindingType);
                    Ti.node = t;
                    Ti.attr = f;
                    Ti.expr = a;
                    Ti.bindable = p;
                    Ti.def = i;
                    o.push(d.build(Ti));
                }
                while (m < r && e.charCodeAt(++m) <= 32) ;
                u = m;
                l = void 0;
                h = void 0;
            }
        }
        Bi();
        return o;
    }
    Xt(t, e) {
        const s = t;
        const n = i.toArray(s.querySelectorAll("template[as-custom-element]"));
        const r = n.length;
        if (0 === r) return;
        if (r === s.childElementCount) throw new Error("AUR0708");
        const o = new Set;
        for (const t of n) {
            if (t.parentNode !== s) throw new Error("AUR0709");
            const n = Mi(t, o);
            const r = class LocalTemplate {};
            const l = t.content;
            const h = i.toArray(l.querySelectorAll("bindable"));
            const c = u.for(r);
            const a = new Set;
            const f = new Set;
            for (const t of h) {
                if (t.parentNode !== l) throw new Error("AUR0710");
                const e = t.getAttribute("property");
                if (null === e) throw new Error("AUR0711");
                const i = t.getAttribute("attribute");
                if (null !== i && f.has(i) || a.has(e)) throw new Error(`AUR0712:${e}+${i}`); else {
                    if (null !== i) f.add(i);
                    a.add(e);
                }
                c.add({
                    property: e,
                    attribute: null !== i && void 0 !== i ? i : void 0,
                    mode: Ui(t)
                });
                const s = t.getAttributeNames().filter((t => !Li.includes(t)));
                if (s.length > 0) ;
                l.removeChild(t);
            }
            e.fe(bt.define({
                name: n,
                template: t
            }, r));
            s.removeChild(t);
        }
    }
    he(t) {
        return "INPUT" === t.nodeName && 1 === Di[t.type];
    }
    ue(t, e) {
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
    oe(t) {
        t.classList.add("au");
        return t;
    }
    ae(t, e) {
        const i = t.parentNode;
        const s = e.h("au-m");
        this.oe(i.insertBefore(s, t));
        i.removeChild(t);
        return s;
    }
}

class CompilationContext {
    constructor(t, e, n, r, o, l) {
        this.hasSlot = false;
        this.de = g();
        const h = null !== r;
        this.c = e;
        this.root = null === o ? this : o;
        this.def = t;
        this.ci = n;
        this.parent = r;
        this.Gt = h ? r.Gt : e.get(Ci);
        this.Zt = h ? r.Zt : e.get(d);
        this.Qt = h ? r.Qt : e.get(s.IExpressionParser);
        this.ie = h ? r.ie : e.get(R);
        this.$t = h ? r.$t : e.get(i.ILogger);
        this.p = h ? r.p : e.get(k);
        this.localEls = h ? r.localEls : new Set;
        this.rows = null !== l && void 0 !== l ? l : [];
    }
    fe(t) {
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
    le(t) {
        return this.c.find(bt, t);
    }
    te(t) {
        return this.c.find(ht, t);
    }
    ce(t) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, t);
    }
    Jt(t) {
        if (this.root !== this) return this.root.Jt(t);
        const e = t.command;
        if (null === e) return null;
        let i = this.de[e];
        if (void 0 === i) {
            i = this.c.create(ki, e);
            if (null === i) throw new Error(`AUR0713:${e}`);
            this.de[e] = i;
        }
        return i;
    }
}

function Ei(t) {
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

function Bi() {
    Ti.node = Ti.attr = Ti.expr = Ti.bindable = Ti.def = null;
}

const Oi = {
    projections: null
};

const Ii = {
    name: "unnamed"
};

const Ti = {
    node: null,
    expr: null,
    attr: null,
    bindable: null,
    def: null
};

const ji = Object.assign(g(), {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
});

const Di = {
    checkbox: 1,
    radio: 1
};

const Pi = new WeakMap;

class BindablesInfo {
    constructor(t, e, i) {
        this.attrs = t;
        this.bindables = e;
        this.primary = i;
    }
    static from(t, e) {
        let i = Pi.get(t);
        if (null == i) {
            const n = t.bindables;
            const r = g();
            const o = e ? void 0 === t.defaultBindingMode ? s.BindingMode.default : t.defaultBindingMode : s.BindingMode.default;
            let l;
            let h;
            let u = false;
            let c;
            let a;
            for (h in n) {
                l = n[h];
                a = l.attribute;
                if (true === l.primary) {
                    if (u) throw new Error(`AUR0714:${t.name}`);
                    u = true;
                    c = l;
                } else if (!u && null == c) c = l;
                r[a] = BindableDefinition.create(h, l);
            }
            if (null == l && e) c = r.value = BindableDefinition.create("value", {
                mode: o
            });
            Pi.set(t, i = new BindablesInfo(r, n, c));
        }
        return i;
    }
}

var $i;

(function(t) {
    t["property"] = "property";
    t["attribute"] = "attribute";
    t["mode"] = "mode";
})($i || ($i = {}));

const Li = Object.freeze([ "property", "attribute", "mode" ]);

const qi = "as-custom-element";

function Mi(t, e) {
    const i = t.getAttribute(qi);
    if (null === i || "" === i) throw new Error("AUR0715");
    if (e.has(i)) throw new Error(`AUR0716:${i}`); else {
        e.add(i);
        t.removeAttribute(qi);
    }
    return i;
}

function Ui(t) {
    switch (t.getAttribute("mode")) {
      case "oneTime":
        return s.BindingMode.oneTime;

      case "toView":
        return s.BindingMode.toView;

      case "fromView":
        return s.BindingMode.fromView;

      case "twoWay":
        return s.BindingMode.twoWay;

      case "default":
      default:
        return s.BindingMode.default;
    }
}

const Fi = i.DI.createInterface("ITemplateCompilerHooks");

const Vi = new WeakMap;

const _i = i.Protocol.resource.keyFor("compiler-hooks");

const Ni = Object.freeze({
    name: _i,
    define(t) {
        let e = Vi.get(t);
        if (void 0 === e) {
            Vi.set(t, e = new TemplateCompilerHooksDefinition(t));
            i.Metadata.define(_i, e, t);
            i.Protocol.resource.appendTo(t, _i);
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
        t.register(i.Registration.singleton(Fi, this.Type));
    }
}

const Hi = t => {
    return void 0 === t ? e : e(t);
    function e(t) {
        return Ni.define(t);
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
        super(s.BindingMode.oneTime);
    }
}

class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(s.BindingMode.toView);
    }
}

class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(s.BindingMode.fromView);
    }
}

class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(s.BindingMode.twoWay);
    }
}

s.bindingBehavior("oneTime")(OneTimeBindingBehavior);

s.bindingBehavior("toView")(ToViewBindingBehavior);

s.bindingBehavior("fromView")(FromViewBindingBehavior);

s.bindingBehavior("twoWay")(TwoWayBindingBehavior);

const Wi = 200;

class DebounceBindingBehavior extends s.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: Wi
        };
        this.firstArg = null;
        this.task = null;
        this.taskQueue = t.locator.get(i.IPlatform).taskQueue;
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
            this.opts.delay = isNaN(i) ? Wi : i;
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

s.bindingBehavior("debounce")(DebounceBindingBehavior);

class SignalBindingBehavior {
    constructor(t) {
        this.Ht = new Map;
        this.pe = t;
    }
    bind(t, e, i, ...s) {
        if (!("handleChange" in i)) throw new Error("AUR0817");
        if (0 === s.length) throw new Error("AUR0818");
        this.Ht.set(i, s);
        let n;
        for (n of s) this.pe.addSignalListener(n, i);
    }
    unbind(t, e, i) {
        const s = this.Ht.get(i);
        this.Ht.delete(i);
        let n;
        for (n of s) this.pe.removeSignalListener(n, i);
    }
}

SignalBindingBehavior.inject = [ s.ISignaler ];

s.bindingBehavior("signal")(SignalBindingBehavior);

const zi = 200;

class ThrottleBindingBehavior extends s.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: zi
        };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.me = t.locator.get(i.IPlatform);
        this.xe = this.me.taskQueue;
        if (e.args.length > 0) this.firstArg = e.args[0];
    }
    callSource(t) {
        this.ve((() => this.binding.callSource(t)));
        return;
    }
    handleChange(t, e, i) {
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.me.performanceNow();
        }
        this.binding.handleChange(t, e, i);
    }
    updateSource(t, e) {
        this.ve((() => this.binding.updateSource(t, e)));
    }
    ve(t) {
        const e = this.opts;
        const i = this.me;
        const s = this.lastCall + e.delay - i.performanceNow();
        if (s > 0) {
            const n = this.task;
            e.delay = s;
            this.task = this.xe.queueTask((() => {
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
            this.opts.delay = this.delay = isNaN(i) ? zi : i;
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

s.bindingBehavior("throttle")(ThrottleBindingBehavior);

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

const Gi = new DataAttributeAccessor;

class AttrBindingBehavior {
    bind(t, e, i) {
        i.targetObserver = Gi;
    }
    unbind(t, e, i) {
        return;
    }
}

s.bindingBehavior("attr")(AttrBindingBehavior);

function Xi(t) {
    const e = t.composedPath()[0];
    if (this.target !== e) return;
    return this.selfEventCallSource(t);
}

class SelfBindingBehavior {
    bind(t, e, i) {
        if (!i.callSource || !i.targetEvent) throw new Error("AUR0801");
        i.selfEventCallSource = i.callSource;
        i.callSource = Xi;
    }
    unbind(t, e, i) {
        i.callSource = i.selfEventCallSource;
        i.selfEventCallSource = null;
    }
}

s.bindingBehavior("self")(SelfBindingBehavior);

const Ki = g();

class AttributeNSAccessor {
    constructor(t) {
        this.ns = t;
        this.type = 2 | 4;
    }
    static forNs(t) {
        var e;
        return null !== (e = Ki[t]) && void 0 !== e ? e : Ki[t] = new AttributeNSAccessor(t);
    }
    getValue(t, e) {
        return t.getAttributeNS(this.ns, e);
    }
    setValue(t, e, i, s) {
        if (void 0 == t) i.removeAttributeNS(this.ns, s); else i.setAttributeNS(this.ns, s, t);
    }
}

function Yi(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.value = void 0;
        this.i = void 0;
        this.ge = void 0;
        this.be = void 0;
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
        this.i = i;
        this.f = e;
        this.we();
        this.ye();
        this.queue.add(this);
    }
    handleCollectionChange(t, e) {
        this.ye();
    }
    handleChange(t, e, i) {
        this.ye();
    }
    ye() {
        const t = this.value;
        const e = this.obj;
        const i = b.call(e, "model") ? e.model : e.value;
        const s = "radio" === e.type;
        const n = void 0 !== e.matcher ? e.matcher : Yi;
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
        let t = this.i = this.value;
        const e = this.obj;
        const i = b.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = void 0 !== e.matcher ? e.matcher : Yi;
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
        this.we();
    }
    stop() {
        var t, e;
        this.handler.dispose();
        null === (t = this.ge) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.ge = void 0;
        null === (e = this.be) || void 0 === e ? void 0 : e.unsubscribe(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.start();
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.stop();
    }
    flush() {
        Qi = this.i;
        this.i = this.value;
        this.subs.notify(this.value, Qi, this.f);
    }
    we() {
        var t, e, i, s, n, r, o;
        const l = this.obj;
        null === (n = null !== (t = this.be) && void 0 !== t ? t : this.be = null !== (i = null === (e = l.$observers) || void 0 === e ? void 0 : e.model) && void 0 !== i ? i : null === (s = l.$observers) || void 0 === s ? void 0 : s.value) || void 0 === n ? void 0 : n.subscribe(this);
        null === (r = this.ge) || void 0 === r ? void 0 : r.unsubscribe(this);
        this.ge = void 0;
        if ("checkbox" === l.type) null === (o = this.ge = us(this.value, this.oL)) || void 0 === o ? void 0 : o.subscribe(this);
    }
}

s.subscriberCollection(CheckedObserver);

s.withFlushQueue(CheckedObserver);

let Qi;

const Zi = Object.prototype.hasOwnProperty;

const Ji = {
    childList: true,
    subtree: true,
    characterData: true
};

function ts(t, e) {
    return t === e;
}

class SelectValueObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.value = void 0;
        this.i = void 0;
        this.N = false;
        this.ke = void 0;
        this.Ae = void 0;
        this.A = false;
        this.obj = t;
        this.oL = s;
    }
    getValue() {
        return this.A ? this.value : this.obj.multiple ? Array.from(this.obj.options).map((t => t.value)) : this.obj.value;
    }
    setValue(t, e) {
        this.i = this.value;
        this.value = t;
        this.N = t !== this.i;
        this.Ce(t instanceof Array ? t : null);
        if (0 === (256 & e)) this.H();
    }
    H() {
        if (this.N) {
            this.N = false;
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
        const n = null !== (t = i.matcher) && void 0 !== t ? t : ts;
        const r = i.options;
        let o = r.length;
        while (o-- > 0) {
            const t = r[o];
            const i = Zi.call(t, "model") ? t.model : t.value;
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
            const o = t.matcher || ts;
            const l = [];
            while (n < i) {
                r = e[n];
                if (r.selected) l.push(Zi.call(r, "model") ? r.model : r.value);
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
                r = Zi.call(o, "model") ? o.model : o.value;
                break;
            }
            ++n;
        }
        this.i = this.value;
        this.value = r;
        return true;
    }
    start() {
        (this.Ae = new this.obj.ownerDocument.defaultView.MutationObserver(this.Re.bind(this))).observe(this.obj, Ji);
        this.Ce(this.value instanceof Array ? this.value : null);
        this.A = true;
    }
    stop() {
        var t;
        this.Ae.disconnect();
        null === (t = this.ke) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.Ae = this.ke = void 0;
        this.A = false;
    }
    Ce(t) {
        var e;
        null === (e = this.ke) || void 0 === e ? void 0 : e.unsubscribe(this);
        this.ke = void 0;
        if (null != t) {
            if (!this.obj.multiple) throw new Error("AUR0654");
            (this.ke = this.oL.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    Re() {
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
        es = this.i;
        this.i = this.value;
        this.subs.notify(this.value, es, 0);
    }
}

s.subscriberCollection(SelectValueObserver);

s.withFlushQueue(SelectValueObserver);

let es;

const is = "--";

class StyleAttributeAccessor {
    constructor(t) {
        this.obj = t;
        this.type = 2 | 4;
        this.value = "";
        this.i = "";
        this.styles = {};
        this.version = 0;
        this.N = false;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(t, e) {
        this.value = t;
        this.N = t !== this.i;
        if (0 === (256 & e)) this.H();
    }
    Se(t) {
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
    Ee(t) {
        let e;
        let s;
        const n = [];
        for (s in t) {
            e = t[s];
            if (null == e) continue;
            if ("string" === typeof e) {
                if (s.startsWith(is)) {
                    n.push([ s, e ]);
                    continue;
                }
                n.push([ i.kebabCase(s), e ]);
                continue;
            }
            n.push(...this.Be(e));
        }
        return n;
    }
    Oe(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            let s = 0;
            for (;e > s; ++s) i.push(...this.Be(t[s]));
            return i;
        }
        return i.emptyArray;
    }
    Be(t) {
        if ("string" === typeof t) return this.Se(t);
        if (t instanceof Array) return this.Oe(t);
        if (t instanceof Object) return this.Ee(t);
        return i.emptyArray;
    }
    H() {
        if (this.N) {
            this.N = false;
            const t = this.value;
            const e = this.styles;
            const i = this.Be(t);
            let s;
            let n = this.version;
            this.i = t;
            let r;
            let o;
            let l;
            let h = 0;
            const u = i.length;
            for (;h < u; ++h) {
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
        this.value = this.i = this.obj.style.cssText;
    }
}

class ValueAttributeObserver {
    constructor(t, e, i) {
        this.propertyKey = e;
        this.handler = i;
        this.type = 2 | 1 | 4;
        this.value = "";
        this.i = "";
        this.N = false;
        this.obj = t;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        if (Object.is(t, this.value)) return;
        this.i = this.value;
        this.value = t;
        this.N = true;
        if (!this.handler.config.readonly && 0 === (256 & e)) this.H(e);
    }
    H(t) {
        var e;
        if (this.N) {
            this.N = false;
            this.obj[this.propertyKey] = null !== (e = this.value) && void 0 !== e ? e : this.handler.config.default;
            if (0 === (2 & t)) this.queue.add(this);
        }
    }
    handleEvent() {
        this.i = this.value;
        this.value = this.obj[this.propertyKey];
        if (this.i !== this.value) {
            this.N = false;
            this.queue.add(this);
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.handler.subscribe(this.obj, this);
            this.value = this.i = this.obj[this.propertyKey];
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.handler.dispose();
    }
    flush() {
        ss = this.i;
        this.i = this.value;
        this.subs.notify(this.value, ss, 0);
    }
}

s.subscriberCollection(ValueAttributeObserver);

s.withFlushQueue(ValueAttributeObserver);

let ss;

const ns = "http://www.w3.org/1999/xlink";

const rs = "http://www.w3.org/XML/1998/namespace";

const os = "http://www.w3.org/2000/xmlns/";

const ls = Object.assign(g(), {
    "xlink:actuate": [ "actuate", ns ],
    "xlink:arcrole": [ "arcrole", ns ],
    "xlink:href": [ "href", ns ],
    "xlink:role": [ "role", ns ],
    "xlink:show": [ "show", ns ],
    "xlink:title": [ "title", ns ],
    "xlink:type": [ "type", ns ],
    "xml:lang": [ "lang", rs ],
    "xml:space": [ "space", rs ],
    xmlns: [ "xmlns", os ],
    "xmlns:xlink": [ "xlink", os ]
});

const hs = new s.PropertyAccessor;

hs.type = 2 | 4;

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
        this.Ie = g();
        this.Te = g();
        this.je = g();
        this.De = g();
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
        i.Registration.aliasTo(s.INodeObserverLocator, NodeObserverLocator).register(t);
        i.Registration.singleton(s.INodeObserverLocator, NodeObserverLocator).register(t);
    }
    handles(t, e) {
        return t instanceof this.platform.Node;
    }
    useConfig(t, e, i) {
        var s, n;
        const r = this.Ie;
        let o;
        if ("string" === typeof t) {
            o = null !== (s = r[t]) && void 0 !== s ? s : r[t] = g();
            if (null == o[e]) o[e] = new NodeObserverConfig(i); else cs(t, e);
        } else for (const i in t) {
            o = null !== (n = r[i]) && void 0 !== n ? n : r[i] = g();
            const s = t[i];
            for (e in s) if (null == o[e]) o[e] = new NodeObserverConfig(s[e]); else cs(i, e);
        }
    }
    useConfigGlobal(t, e) {
        const i = this.Te;
        if ("object" === typeof t) for (const e in t) if (null == i[e]) i[e] = new NodeObserverConfig(t[e]); else cs("*", e); else if (null == i[t]) i[t] = new NodeObserverConfig(e); else cs("*", t);
    }
    getAccessor(t, e, s) {
        var n;
        if (e in this.De || e in (null !== (n = this.je[t.tagName]) && void 0 !== n ? n : i.emptyObject)) return this.getObserver(t, e, s);
        switch (e) {
          case "src":
          case "href":
          case "role":
            return Gi;

          default:
            {
                const i = ls[e];
                if (void 0 !== i) return AttributeNSAccessor.forNs(i[1]);
                if (y(t, e, this.svgAnalyzer)) return Gi;
                return hs;
            }
        }
    }
    overrideAccessor(t, e) {
        var i, s;
        var n, r;
        let o;
        if ("string" === typeof t) {
            o = null !== (i = (n = this.je)[t]) && void 0 !== i ? i : n[t] = g();
            o[e] = true;
        } else for (const e in t) for (const i of t[e]) {
            o = null !== (s = (r = this.je)[e]) && void 0 !== s ? s : r[e] = g();
            o[i] = true;
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) this.De[e] = true;
    }
    getObserver(t, e, i) {
        var n, r;
        switch (e) {
          case "role":
            return Gi;

          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const o = null !== (r = null === (n = this.Ie[t.tagName]) || void 0 === n ? void 0 : n[e]) && void 0 !== r ? r : this.Te[e];
        if (null != o) return new o.type(t, e, new EventSubscriber(o), i, this.locator);
        const l = ls[e];
        if (void 0 !== l) return AttributeNSAccessor.forNs(l[1]);
        if (y(t, e, this.svgAnalyzer)) return Gi;
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) return this.dirtyChecker.createProperty(t, e);
            throw new Error(`AUR0652:${String(e)}`);
        } else return new s.SetterObserver(t, e);
    }
}

NodeObserverLocator.inject = [ i.IServiceLocator, k, s.IDirtyChecker, A ];

function us(t, e) {
    if (t instanceof Array) return e.getArrayObserver(t);
    if (t instanceof Map) return e.getMapObserver(t);
    if (t instanceof Set) return e.getSetObserver(t);
}

function cs(t, e) {
    throw new Error(`AUR0653:${String(e)}@${t}`);
}

class UpdateTriggerBindingBehavior {
    constructor(t) {
        this.oL = t;
    }
    bind(t, e, i, ...n) {
        if (0 === n.length) throw new Error(`AUR0802`);
        if (i.mode !== s.BindingMode.twoWay && i.mode !== s.BindingMode.fromView) throw new Error("AUR0803");
        const r = this.oL.getObserver(i.target, i.targetProperty);
        if (!r.handler) throw new Error("AUR0804");
        i.targetObserver = r;
        const o = r.handler;
        r.originalHandler = o;
        r.handler = new EventSubscriber(new NodeObserverConfig({
            default: o.config.default,
            events: n,
            readonly: o.config.readonly
        }));
    }
    unbind(t, e, i) {
        i.targetObserver.handler.dispose();
        i.targetObserver.handler = i.targetObserver.originalHandler;
        i.targetObserver.originalHandler = null;
    }
}

UpdateTriggerBindingBehavior.inject = [ s.IObserverLocator ];

s.bindingBehavior("updateTrigger")(UpdateTriggerBindingBehavior);

exports.Focus = class Focus {
    constructor(t, e) {
        this.Pe = t;
        this.p = e;
        this.$e = false;
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) this.apply(); else this.$e = true;
    }
    attached() {
        if (this.$e) {
            this.$e = false;
            this.apply();
        }
        const t = this.Pe;
        t.addEventListener("focus", this);
        t.addEventListener("blur", this);
    }
    afterDetachChildren() {
        const t = this.Pe;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if ("focus" === t.type) this.value = true; else if (!this.isElFocused) this.value = false;
    }
    apply() {
        const t = this.Pe;
        const e = this.isElFocused;
        const i = this.value;
        if (i && !e) t.focus(); else if (!i && e) t.blur();
    }
    get isElFocused() {
        return this.Pe === this.p.document.activeElement;
    }
};

n([ o({
    mode: s.BindingMode.twoWay
}) ], exports.Focus.prototype, "value", void 0);

exports.Focus = n([ r(0, be), r(1, k) ], exports.Focus);

rt("focus")(exports.Focus);

let as = class Show {
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

n([ o ], as.prototype, "value", void 0);

as = n([ r(0, be), r(1, k), r(2, $e) ], as);

s.alias("hide")(as);

rt("show")(as);

class Portal {
    constructor(t, e, s) {
        this.id = i.nextId("au$component");
        this.strict = false;
        this.p = s;
        this.Le = s.document.createElement("div");
        this.view = t.create();
        Ce(this.view.nodes, e);
    }
    attaching(t, e, i) {
        if (null == this.callbackContext) this.callbackContext = this.$controller.scope.bindingContext;
        const s = this.Le = this.qe();
        this.view.setHost(s);
        return this.Me(t, s, i);
    }
    detaching(t, e, i) {
        return this.Ue(t, this.Le, i);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) return;
        const e = this.Le;
        const s = this.Le = this.qe();
        if (e === s) return;
        this.view.setHost(s);
        const n = i.onResolve(this.Ue(null, s, t.flags), (() => this.Me(null, s, t.flags)));
        if (n instanceof Promise) n.catch((t => {
            throw t;
        }));
    }
    Me(t, e, s) {
        const {activating: n, callbackContext: r, view: o} = this;
        o.setHost(e);
        return i.onResolve(null === n || void 0 === n ? void 0 : n.call(r, e, o), (() => this.Fe(t, e, s)));
    }
    Fe(t, e, s) {
        const {$controller: n, view: r} = this;
        if (null === t) r.nodes.appendTo(e); else return i.onResolve(r.activate(null !== t && void 0 !== t ? t : r, n, s, n.scope), (() => this.Ve(e)));
        return this.Ve(e);
    }
    Ve(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    Ue(t, e, s) {
        const {deactivating: n, callbackContext: r, view: o} = this;
        return i.onResolve(null === n || void 0 === n ? void 0 : n.call(r, e, o), (() => this._e(t, e, s)));
    }
    _e(t, e, s) {
        const {$controller: n, view: r} = this;
        if (null === t) r.nodes.remove(); else return i.onResolve(r.deactivate(t, n, s), (() => this.Ne(e)));
        return this.Ne(e);
    }
    Ne(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    qe() {
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

Portal.inject = [ Ft, ye, k ];

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

ot("portal")(Portal);

class FlagsTemplateController {
    constructor(t, e, s) {
        this.factory = t;
        this.flags = s;
        this.id = i.nextId("au$component");
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

FrequentMutations.inject = [ Ft, ye ];

class ObserveShallow extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 128);
    }
}

ObserveShallow.inject = [ Ft, ye ];

ot("frequent-mutations")(FrequentMutations);

ot("observe-shallow")(ObserveShallow);

class If {
    constructor(t, e, s) {
        this.ifFactory = t;
        this.location = e;
        this.work = s;
        this.id = i.nextId("au$component");
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        this.cache = true;
        this.pending = void 0;
        this.He = false;
        this.We = 0;
    }
    attaching(t, e, s) {
        let n;
        const r = this.$controller;
        const o = this.We++;
        const l = () => !this.He && this.We === o + 1;
        return i.onResolve(this.pending, (() => {
            var e;
            if (!l()) return;
            this.pending = void 0;
            if (this.value) n = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(s); else n = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(s);
            if (null == n) return;
            n.setLocation(this.location);
            this.pending = i.onResolve(n.activate(t, r, s, r.scope), (() => {
                if (l()) this.pending = void 0;
            }));
        }));
    }
    detaching(t, e, s) {
        this.He = true;
        return i.onResolve(this.pending, (() => {
            var e;
            this.He = false;
            this.pending = void 0;
            void (null === (e = this.view) || void 0 === e ? void 0 : e.deactivate(t, this.$controller, s));
        }));
    }
    valueChanged(t, e, s) {
        if (!this.$controller.isActive) return;
        t = !!t;
        e = !!e;
        if (t === e) return;
        this.work.start();
        const n = this.view;
        const r = this.$controller;
        const o = this.We++;
        const l = () => !this.He && this.We === o + 1;
        let h;
        return i.onResolve(i.onResolve(this.pending, (() => this.pending = i.onResolve(null === n || void 0 === n ? void 0 : n.deactivate(n, r, s), (() => {
            var e;
            if (!l()) return;
            if (t) h = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(s); else h = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(s);
            if (null == h) return;
            h.setLocation(this.location);
            return i.onResolve(h.activate(h, r, s, r.scope), (() => {
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

If.inject = [ Ft, ye, xe ];

n([ o ], If.prototype, "value", void 0);

n([ o({
    set: t => "" === t || !!t && "false" !== t
}) ], If.prototype, "cache", void 0);

ot("if")(If);

class Else {
    constructor(t) {
        this.factory = t;
        this.id = i.nextId("au$component");
    }
    link(t, e, i, s, n) {
        const r = e.children;
        const o = r[r.length - 1];
        if (o instanceof If) o.elseFactory = this.factory; else if (o.viewModel instanceof If) o.viewModel.elseFactory = this.factory; else throw new Error("AUR0810");
    }
}

Else.inject = [ Ft ];

ot({
    name: "else"
})(Else);

function fs(t) {
    t.dispose();
}

class Repeat {
    constructor(t, e, s) {
        this.location = t;
        this.parent = e;
        this.factory = s;
        this.id = i.nextId("au$component");
        this.ze = void 0;
        this.views = [];
        this.key = void 0;
        this.Ge = void 0;
    }
    binding(t, e, i) {
        this.Xe(i);
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
        this.Ke(i);
        return this.Ye(t, i);
    }
    detaching(t, e, i) {
        this.Xe(i);
        return this.Qe(t, i);
    }
    itemsChanged(t) {
        const {$controller: e} = this;
        if (!e.isActive) return;
        t |= e.flags;
        this.Xe(t);
        this.Ke(t);
        const s = i.onResolve(this.Qe(null, t), (() => this.Ye(null, t)));
        if (s instanceof Promise) s.catch((t => {
            throw t;
        }));
    }
    handleCollectionChange(t, e) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        e |= n.flags;
        this.Ke(e);
        if (void 0 === t) {
            const t = i.onResolve(this.Qe(null, e), (() => this.Ye(null, e)));
            if (t instanceof Promise) t.catch((t => {
                throw t;
            }));
        } else {
            const n = this.views.length;
            s.applyMutationsToIndices(t);
            if (t.deletedItems.length > 0) {
                t.deletedItems.sort(i.compareNumber);
                const s = i.onResolve(this.Ze(t, e), (() => this.Je(n, t, e)));
                if (s instanceof Promise) s.catch((t => {
                    throw t;
                }));
            } else this.Je(n, t, e);
        }
    }
    Xe(t) {
        const e = this.ze;
        if (4 & t) {
            if (void 0 !== e) e.unsubscribe(this);
        } else if (this.$controller.isActive) {
            const t = this.ze = s.getCollectionObserver(this.items);
            if (e !== t && e) e.unsubscribe(this);
            if (t) t.subscribe(this);
        }
    }
    Ke(t) {
        const e = this.items;
        if (e instanceof Array) {
            this.Ge = e;
            return;
        }
        const i = this.forOf;
        if (void 0 === i) return;
        const s = [];
        this.forOf.iterate(t, e, ((t, e, i) => {
            s[e] = i;
        }));
        this.Ge = s;
    }
    Ye(t, e) {
        let i;
        let n;
        let r;
        let o;
        const {$controller: l, factory: h, local: u, location: c, items: a} = this;
        const f = l.scope;
        const d = this.forOf.count(e, a);
        const p = this.views = Array(d);
        this.forOf.iterate(e, a, ((a, m, x) => {
            r = p[m] = h.create(e).setLocation(c);
            r.nodes.unlink();
            o = s.Scope.fromParent(f, s.BindingContext.create(u, x));
            vs(o.overrideContext, m, d);
            n = r.activate(null !== t && void 0 !== t ? t : r, l, e, o);
            if (n instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(n);
        }));
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    Qe(t, e) {
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
    Ze(t, e) {
        let i;
        let s;
        let n;
        const {$controller: r, views: o} = this;
        const l = t.deletedItems;
        const h = l.length;
        let u = 0;
        for (;h > u; ++u) {
            n = o[l[u]];
            n.release();
            s = n.deactivate(n, r, e);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }
        u = 0;
        let c = 0;
        for (;h > u; ++u) {
            c = l[u] - u;
            o.splice(c, 1);
        }
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    Je(t, e, i) {
        var n;
        let r;
        let o;
        let l;
        let h;
        let u = 0;
        const {$controller: c, factory: a, local: f, Ge: d, location: p, views: m} = this;
        const x = e.length;
        for (;x > u; ++u) if (-2 === e[u]) {
            l = a.create(i);
            m.splice(u, 0, l);
        }
        if (m.length !== x) throw new Error(`AUR0814:${m.length}!=${x}`);
        const v = c.scope;
        const g = e.length;
        s.synchronizeIndices(m, e);
        const b = xs(e);
        const w = b.length;
        let y;
        let k = w - 1;
        u = g - 1;
        for (;u >= 0; --u) {
            l = m[u];
            y = m[u + 1];
            l.nodes.link(null !== (n = null === y || void 0 === y ? void 0 : y.nodes) && void 0 !== n ? n : p);
            if (-2 === e[u]) {
                h = s.Scope.fromParent(v, s.BindingContext.create(f, d[u]));
                vs(h.overrideContext, u, g);
                l.setLocation(p);
                o = l.activate(l, c, i, h);
                if (o instanceof Promise) (null !== r && void 0 !== r ? r : r = []).push(o);
            } else if (k < 0 || 1 === w || u !== b[k]) {
                vs(l.scope.overrideContext, u, g);
                l.nodes.insertBefore(l.location);
            } else {
                if (t !== g) vs(l.scope.overrideContext, u, g);
                --k;
            }
        }
        if (void 0 !== r) return 1 === r.length ? r[0] : Promise.all(r);
    }
    dispose() {
        this.views.forEach(fs);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (void 0 !== e) for (let i = 0, s = e.length; i < s; ++i) if (true === e[i].accept(t)) return true;
    }
}

Repeat.inject = [ ye, ue, Ft ];

n([ o ], Repeat.prototype, "items", void 0);

ot("repeat")(Repeat);

let ds = 16;

let ps = new Int32Array(ds);

let ms = new Int32Array(ds);

function xs(t) {
    const e = t.length;
    if (e > ds) {
        ds = e;
        ps = new Int32Array(e);
        ms = new Int32Array(e);
    }
    let i = 0;
    let s = 0;
    let n = 0;
    let r = 0;
    let o = 0;
    let l = 0;
    let h = 0;
    let u = 0;
    for (;r < e; r++) {
        s = t[r];
        if (-2 !== s) {
            o = ps[i];
            n = t[o];
            if (-2 !== n && n < s) {
                ms[r] = o;
                ps[++i] = r;
                continue;
            }
            l = 0;
            h = i;
            while (l < h) {
                u = l + h >> 1;
                n = t[ps[u]];
                if (-2 !== n && n < s) l = u + 1; else h = u;
            }
            n = t[ps[l]];
            if (s < n || -2 === n) {
                if (l > 0) ms[r] = ps[l - 1];
                ps[l] = r;
            }
        }
    }
    r = ++i;
    const c = new Int32Array(r);
    s = ps[i - 1];
    while (i-- > 0) {
        c[i] = s;
        s = ms[s];
    }
    while (r-- > 0) ps[r] = 0;
    return c;
}

function vs(t, e, i) {
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
        this.id = i.nextId("au$component");
        this.id = i.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    valueChanged(t, e, i) {
        const n = this.$controller;
        const r = this.view.bindings;
        let o;
        let l = 0, h = 0;
        if (n.isActive && null != r) {
            o = s.Scope.fromParent(n.scope, void 0 === t ? {} : t);
            for (h = r.length; h > l; ++l) r[l].$bind(2, o);
        }
    }
    attaching(t, e, i) {
        const {$controller: n, value: r} = this;
        const o = s.Scope.fromParent(n.scope, void 0 === r ? {} : r);
        return this.view.activate(t, n, i, o);
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

With.inject = [ Ft, ye ];

n([ o ], With.prototype, "value", void 0);

ot("with")(With);

exports.Switch = class Switch {
    constructor(t, e) {
        this.factory = t;
        this.location = e;
        this.id = i.nextId("au$component");
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
        const s = t.isMatch(this.value, e);
        const n = this.activeCases;
        const r = n.length;
        if (!s) {
            if (r > 0 && n[0].id === t.id) return this.clearActiveCases(null, e);
            return;
        }
        if (r > 0 && n[0].id < t.id) return;
        const o = [];
        let l = t.fallThrough;
        if (!l) o.push(t); else {
            const e = this.cases;
            const i = e.indexOf(t);
            for (let t = i, s = e.length; t < s && l; t++) {
                const i = e[t];
                o.push(i);
                l = i.fallThrough;
            }
        }
        return i.onResolve(this.clearActiveCases(null, e, o), (() => {
            this.activeCases = o;
            return this.activateCases(null, e);
        }));
    }
    swap(t, e, s) {
        const n = [];
        let r = false;
        for (const t of this.cases) {
            if (r || t.isMatch(s, e)) {
                n.push(t);
                r = t.fallThrough;
            }
            if (n.length > 0 && !r) break;
        }
        const o = this.defaultCase;
        if (0 === n.length && void 0 !== o) n.push(o);
        return i.onResolve(this.activeCases.length > 0 ? this.clearActiveCases(t, e, n) : void 0, (() => {
            this.activeCases = n;
            if (0 === n.length) return;
            return this.activateCases(t, e);
        }));
    }
    activateCases(t, e) {
        const s = this.$controller;
        if (!s.isActive) return;
        const n = this.activeCases;
        const r = n.length;
        if (0 === r) return;
        const o = s.scope;
        if (1 === r) return n[0].activate(t, e, o);
        return i.resolveAll(...n.map((i => i.activate(t, e, o))));
    }
    clearActiveCases(t, e, s = []) {
        const n = this.activeCases;
        const r = n.length;
        if (0 === r) return;
        if (1 === r) {
            const i = n[0];
            if (!s.includes(i)) {
                n.length = 0;
                return i.deactivate(t, e);
            }
            return;
        }
        return i.onResolve(i.resolveAll(...n.reduce(((i, n) => {
            if (!s.includes(n)) i.push(n.deactivate(t, e));
            return i;
        }), [])), (() => {
            n.length = 0;
        }));
    }
    queue(t) {
        const e = this.promise;
        let s;
        s = this.promise = i.onResolve(i.onResolve(e, t), (() => {
            if (this.promise === s) this.promise = void 0;
        }));
    }
    accept(t) {
        if (true === this.$controller.accept(t)) return true;
        if (this.activeCases.some((e => e.accept(t)))) return true;
    }
};

n([ o ], exports.Switch.prototype, "value", void 0);

exports.Switch = n([ ot("switch"), r(0, Ft), r(1, ye) ], exports.Switch);

exports.Case = class Case {
    constructor(t, e, s, n) {
        this.factory = t;
        this.locator = e;
        this.id = i.nextId("au$component");
        this.fallThrough = false;
        this.debug = n.config.level <= 1;
        this.logger = n.scopeTo(`${this.constructor.name}-#${this.id}`);
        this.view = this.factory.create().setLocation(s);
    }
    link(t, e, i, s, n) {
        const r = e.parent;
        const o = null === r || void 0 === r ? void 0 : r.viewModel;
        if (o instanceof exports.Switch) {
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
    mode: s.BindingMode.oneTime
}) ], exports.Case.prototype, "fallThrough", void 0);

exports.Case = n([ ot("case"), r(0, Ft), r(1, s.IObserverLocator), r(2, ye), r(3, i.ILogger) ], exports.Case);

exports.DefaultCase = class DefaultCase extends exports.Case {
    linkToSwitch(t) {
        if (void 0 !== t.defaultCase) throw new Error("AUR0816");
        t.defaultCase = this;
    }
};

exports.DefaultCase = n([ ot("default-case") ], exports.DefaultCase);

exports.PromiseTemplateController = class PromiseTemplateController {
    constructor(t, e, s, n) {
        this.factory = t;
        this.location = e;
        this.platform = s;
        this.id = i.nextId("au$component");
        this.preSettledTask = null;
        this.postSettledTask = null;
        this.logger = n.scopeTo("promise.resolve");
    }
    link(t, e, i, s, n) {
        this.view = this.factory.create(t, this.$controller).setLocation(this.location);
    }
    attaching(t, e, n) {
        const r = this.view;
        const o = this.$controller;
        return i.onResolve(r.activate(t, o, n, this.viewScope = s.Scope.fromParent(o.scope, {})), (() => this.swap(t, n)));
    }
    valueChanged(t, e, i) {
        if (!this.$controller.isActive) return;
        this.swap(null, i);
    }
    swap(t, e) {
        var s, n;
        const r = this.value;
        if (!(r instanceof Promise)) {
            this.logger.warn(`The value '${String(r)}' is not a promise. No change will be done.`);
            return;
        }
        const o = this.platform.domWriteQueue;
        const l = this.fulfilled;
        const h = this.rejected;
        const u = this.pending;
        const c = this.viewScope;
        let a;
        const f = {
            reusable: false
        };
        const d = () => {
            void i.resolveAll(a = (this.preSettledTask = o.queueTask((() => i.resolveAll(null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === u || void 0 === u ? void 0 : u.activate(t, e, c))), f)).result, r.then((s => {
                if (this.value !== r) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => i.resolveAll(null === u || void 0 === u ? void 0 : u.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === l || void 0 === l ? void 0 : l.activate(t, e, c, s))), f)).result;
                };
                if (1 === this.preSettledTask.status) void a.then(n); else {
                    this.preSettledTask.cancel();
                    n();
                }
            }), (s => {
                if (this.value !== r) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => i.resolveAll(null === u || void 0 === u ? void 0 : u.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.activate(t, e, c, s))), f)).result;
                };
                if (1 === this.preSettledTask.status) void a.then(n); else {
                    this.preSettledTask.cancel();
                    n();
                }
            })));
        };
        if (1 === (null === (s = this.postSettledTask) || void 0 === s ? void 0 : s.status)) void this.postSettlePromise.then(d); else {
            null === (n = this.postSettledTask) || void 0 === n ? void 0 : n.cancel();
            d();
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

n([ o ], exports.PromiseTemplateController.prototype, "value", void 0);

exports.PromiseTemplateController = n([ ot("promise"), r(0, Ft), r(1, ye), r(2, k), r(3, i.ILogger) ], exports.PromiseTemplateController);

exports.PendingTemplateController = class PendingTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = i.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        gs(e).pending = this;
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

n([ o({
    mode: s.BindingMode.toView
}) ], exports.PendingTemplateController.prototype, "value", void 0);

exports.PendingTemplateController = n([ ot("pending"), r(0, Ft), r(1, ye) ], exports.PendingTemplateController);

exports.FulfilledTemplateController = class FulfilledTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = i.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        gs(e).fulfilled = this;
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

n([ o({
    mode: s.BindingMode.toView
}) ], exports.FulfilledTemplateController.prototype, "value", void 0);

exports.FulfilledTemplateController = n([ ot("then"), r(0, Ft), r(1, ye) ], exports.FulfilledTemplateController);

exports.RejectedTemplateController = class RejectedTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = i.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        gs(e).rejected = this;
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

n([ o({
    mode: s.BindingMode.toView
}) ], exports.RejectedTemplateController.prototype, "value", void 0);

exports.RejectedTemplateController = n([ ot("catch"), r(0, Ft), r(1, ye) ], exports.RejectedTemplateController);

function gs(t) {
    const e = t.parent;
    const i = null === e || void 0 === e ? void 0 : e.viewModel;
    if (i instanceof exports.PromiseTemplateController) return i;
    throw new Error("AUR0813");
}

function bs(t, e, i, s) {
    if ("string" === typeof e) return ws(t, e, i, s);
    if (bt.isType(e)) return ys(t, e, i, s);
    throw new Error(`Invalid Tag or Type.`);
}

class RenderPlan {
    constructor(t, e, i) {
        this.node = t;
        this.instructions = e;
        this.dependencies = i;
        this.ti = void 0;
    }
    get definition() {
        if (void 0 === this.ti) this.ti = CustomElementDefinition.create({
            name: bt.generateName(),
            template: this.node,
            needsCompile: "string" === typeof this.node,
            instructions: this.instructions,
            dependencies: this.dependencies
        });
        return this.ti;
    }
    createView(t) {
        return this.getViewFactory(t).create();
    }
    getViewFactory(t) {
        return t.root.get(Xt).getViewFactory(this.definition, t.createChild().register(...this.dependencies));
    }
    mergeInto(t, e, i) {
        t.appendChild(this.node);
        e.push(...this.instructions);
        i.push(...this.dependencies);
    }
}

function ws(t, e, i, s) {
    const n = [];
    const r = [];
    const o = [];
    const l = t.document.createElement(e);
    let h = false;
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (Le(e)) {
            h = true;
            n.push(e);
        } else l.setAttribute(t, e);
    }));
    if (h) {
        l.className = "au";
        r.push(n);
    }
    if (s) ks(t, l, s, r, o);
    return new RenderPlan(l, r, o);
}

function ys(t, e, i, s) {
    const n = bt.getDefinition(e);
    const r = [];
    const o = [ r ];
    const l = [];
    const h = [];
    const u = n.bindables;
    const c = t.document.createElement(n.name);
    c.className = "au";
    if (!l.includes(e)) l.push(e);
    r.push(new HydrateElementInstruction(n, void 0, h, null, false));
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (Le(e)) h.push(e); else if (void 0 === u[t]) h.push(new SetAttributeInstruction(e, t)); else h.push(new SetPropertyInstruction(e, t));
    }));
    if (s) ks(t, c, s, o, l);
    return new RenderPlan(c, o, l);
}

function ks(t, e, i, s, n) {
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

function As(t, e) {
    const i = e.to;
    if (void 0 !== i && "subject" !== i && "composing" !== i) t[i] = e;
    return t;
}

exports.AuRender = class AuRender {
    constructor(t, e, s, n) {
        this.p = t;
        this.r = n;
        this.id = i.nextId("au$component");
        this.component = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.ei = e.props.reduce(As, {});
        this.ii = s;
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
        return this._e(this.view, t, i);
    }
    componentChanged(t, e, s) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        if (this.lastSubject === t) return;
        this.lastSubject = t;
        this.composing = true;
        s |= n.flags;
        const r = i.onResolve(this._e(this.view, null, s), (() => this.compose(void 0, t, null, s)));
        if (r instanceof Promise) r.catch((t => {
            throw t;
        }));
    }
    compose(t, e, s, n) {
        return i.onResolve(void 0 === t ? i.onResolve(e, (t => this.si(t, n))) : t, (t => this.Fe(this.view = t, s, n)));
    }
    _e(t, e, i) {
        return null === t || void 0 === t ? void 0 : t.deactivate(null !== e && void 0 !== e ? e : t, this.$controller, i);
    }
    Fe(t, e, s) {
        const {$controller: n} = this;
        return i.onResolve(null === t || void 0 === t ? void 0 : t.activate(null !== e && void 0 !== e ? e : t, n, s, n.scope), (() => {
            this.composing = false;
        }));
    }
    si(t, e) {
        const i = this.ni(t, e);
        if (i) {
            i.setLocation(this.$controller.location);
            i.lockScope(this.$controller.scope);
            return i;
        }
        return;
    }
    ni(t, e) {
        if (!t) return;
        const i = this.ii.controller.container;
        if ("object" === typeof t) {
            if (Cs(t)) return t;
            if ("createView" in t) return t.createView(i);
            if ("create" in t) return t.create(e);
            if ("template" in t) return this.r.getViewFactory(CustomElementDefinition.getOrCreate(t), i).create(e);
        }
        if ("string" === typeof t) {
            const e = i.find(bt, t);
            if (null == e) throw new Error(`AUR0809:${t}`);
            t = e.Type;
        }
        return bs(this.p, t, this.ei, this.$controller.host.childNodes).createView(i);
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
    mode: s.BindingMode.fromView
}) ], exports.AuRender.prototype, "composing", void 0);

exports.AuRender = n([ dt({
    name: "au-render",
    template: null,
    containerless: true
}), r(0, k), r(1, $e), r(2, ce), r(3, Xt) ], exports.AuRender);

function Cs(t) {
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
        this.loc = n.containerless ? Re(this.host) : void 0;
        this.r = t.get(Xt);
        this.ri = n;
        this.oi = r;
    }
    static get inject() {
        return [ i.IContainer, ue, be, k, $e, i.transient(CompositionContextFactory) ];
    }
    get pending() {
        return this.pd;
    }
    get composition() {
        return this.c;
    }
    attaching(t, e, s) {
        return this.pd = i.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, t, void 0)), (t => {
            if (this.oi.isCurrent(t)) this.pd = void 0;
        }));
    }
    detaching(t) {
        const e = this.c;
        const s = this.pd;
        this.oi.invalidate();
        this.c = this.pd = void 0;
        return i.onResolve(s, (() => null === e || void 0 === e ? void 0 : e.deactivate(t)));
    }
    propertyChanged(t) {
        if ("model" === t && null != this.c) {
            this.c.update(this.model);
            return;
        }
        this.pd = i.onResolve(this.pd, (() => i.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, t)), (t => {
            if (this.oi.isCurrent(t)) this.pd = void 0;
        }))));
    }
    queue(t) {
        const e = this.oi;
        const s = this.c;
        return i.onResolve(e.create(t), (n => {
            if (e.isCurrent(n)) return i.onResolve(this.compose(n), (r => {
                if (e.isCurrent(n)) return i.onResolve(r.activate(), (() => {
                    if (e.isCurrent(n)) {
                        this.c = r;
                        return i.onResolve(null === s || void 0 === s ? void 0 : s.deactivate(t.initiator), (() => n));
                    } else return i.onResolve(r.controller.deactivate(r.controller, this.$controller, 4), (() => {
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
        const {view: o, viewModel: l, model: h, initiator: u} = t.change;
        const {ctn: c, host: a, $controller: f, loc: d} = this;
        const p = this.getDef(l);
        const m = c.createChild();
        const x = null == d ? a.parentNode : d.parentNode;
        if (null !== p) {
            if (p.containerless) throw new Error("AUR0806");
            if (null == d) {
                n = a;
                r = () => {};
            } else {
                n = x.insertBefore(this.p.document.createElement(p.name), d);
                r = () => {
                    n.remove();
                };
            }
            e = this.getVm(m, l, n);
        } else {
            n = null == d ? a : d;
            e = this.getVm(m, l, n);
        }
        const v = () => {
            if (null !== p) {
                const s = Controller.$el(m, e, n, null, 0, p);
                return new CompositionController(s, (() => s.activate(null !== u && void 0 !== u ? u : s, f, 2)), (t => i.onResolve(s.deactivate(null !== t && void 0 !== t ? t : s, f, 4), r)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            } else {
                const i = CustomElementDefinition.create({
                    name: bt.generateName(),
                    template: o
                });
                const r = this.r.getViewFactory(i, m);
                const l = Controller.$view(r, 2, f);
                const h = "auto" === this.scopeBehavior ? s.Scope.fromParent(this.parent.scope, e) : s.Scope.create(e);
                if (Se(n)) l.setLocation(n); else l.setHost(n);
                return new CompositionController(l, (() => l.activate(null !== u && void 0 !== u ? u : l, f, 2, h)), (t => l.deactivate(null !== t && void 0 !== t ? t : l, f, 4)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            }
        };
        if ("activate" in e) return i.onResolve(e.activate(h), (() => v())); else return v();
    }
    getVm(t, e, s) {
        if (null == e) return new EmptyComponent$1;
        if ("object" === typeof e) return e;
        const n = this.p;
        const r = Se(s);
        t.registerResolver(n.Element, t.registerResolver(be, new i.InstanceProvider("ElementResolver", r ? null : s)));
        t.registerResolver(ye, new i.InstanceProvider("IRenderLocation", r ? s : null));
        const o = t.invoke(e);
        t.registerResolver(e, new i.InstanceProvider("au-compose.viewModel", o));
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

dt("au-compose")(AuCompose);

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
        return i.onResolve(t.load(), (t => new CompositionContext(this.id++, t)));
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
        this.li = null;
        this.hi = null;
        let o;
        const l = e.auSlot;
        const h = null === (r = null === (n = i.instruction) || void 0 === n ? void 0 : n.projections) || void 0 === r ? void 0 : r[l.name];
        if (null == h) {
            o = s.getViewFactory(l.fallback, i.controller.container);
            this.ui = false;
        } else {
            o = s.getViewFactory(h, i.parent.controller.container);
            this.ui = true;
        }
        this.ii = i;
        this.view = o.create().setLocation(t);
    }
    static get inject() {
        return [ ye, $e, ce, Xt ];
    }
    binding(t, e, i) {
        var n;
        this.li = this.$controller.scope.parentScope;
        let r;
        if (this.ui) {
            r = this.ii.controller.scope.parentScope;
            (this.hi = s.Scope.fromParent(r, r.bindingContext)).overrideContext.$host = null !== (n = this.expose) && void 0 !== n ? n : this.li.bindingContext;
        }
    }
    attaching(t, e, i) {
        return this.view.activate(t, this.$controller, i, this.ui ? this.hi : this.li);
    }
    detaching(t, e, i) {
        return this.view.deactivate(t, this.$controller, i);
    }
    exposeChanged(t) {
        if (this.ui && null != this.hi) this.hi.overrideContext.$host = t;
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

dt({
    name: "au-slot",
    template: null,
    containerless: true
})(AuSlot);

const Rs = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const Ss = i.DI.createInterface("ISanitizer", (t => t.singleton(class {
    sanitize(t) {
        return t.replace(Rs, "");
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

exports.SanitizeValueConverter = n([ r(0, Ss) ], exports.SanitizeValueConverter);

s.valueConverter("sanitize")(exports.SanitizeValueConverter);

exports.ViewValueConverter = class ViewValueConverter {
    constructor(t) {
        this.viewLocator = t;
    }
    toView(t, e) {
        return this.viewLocator.getViewComponentForObject(t, e);
    }
};

exports.ViewValueConverter = n([ r(0, Gt) ], exports.ViewValueConverter);

s.valueConverter("view")(exports.ViewValueConverter);

const Es = DebounceBindingBehavior;

const Bs = OneTimeBindingBehavior;

const Os = ToViewBindingBehavior;

const Is = FromViewBindingBehavior;

const Ts = SignalBindingBehavior;

const js = ThrottleBindingBehavior;

const Ds = TwoWayBindingBehavior;

const Ps = TemplateCompiler;

const $s = NodeObserverLocator;

const Ls = [ Ps, $s ];

const qs = SVGAnalyzer;

const Ms = exports.AtPrefixedTriggerAttributePattern;

const Us = exports.ColonPrefixedBindAttributePattern;

const Fs = exports.RefAttributePattern;

const Vs = exports.DotSeparatedAttributePattern;

const _s = [ Fs, Vs ];

const Ns = [ Ms, Us ];

const Hs = exports.CallBindingCommand;

const Ws = exports.DefaultBindingCommand;

const zs = exports.ForBindingCommand;

const Gs = exports.FromViewBindingCommand;

const Xs = exports.OneTimeBindingCommand;

const Ks = exports.ToViewBindingCommand;

const Ys = exports.TwoWayBindingCommand;

const Qs = Ai;

const Zs = exports.TriggerBindingCommand;

const Js = exports.DelegateBindingCommand;

const tn = exports.CaptureBindingCommand;

const en = exports.AttrBindingCommand;

const sn = exports.ClassBindingCommand;

const nn = exports.StyleBindingCommand;

const rn = [ Ws, Xs, Gs, Ks, Ys, Hs, zs, Qs, Zs, Js, tn, sn, nn, en ];

const on = exports.SanitizeValueConverter;

const ln = exports.ViewValueConverter;

const hn = FrequentMutations;

const un = ObserveShallow;

const cn = If;

const an = Else;

const fn = Repeat;

const dn = With;

const pn = exports.Switch;

const mn = exports.Case;

const xn = exports.DefaultCase;

const vn = exports.PromiseTemplateController;

const gn = exports.PendingTemplateController;

const bn = exports.FulfilledTemplateController;

const wn = exports.RejectedTemplateController;

const yn = AttrBindingBehavior;

const kn = SelfBindingBehavior;

const An = UpdateTriggerBindingBehavior;

const Cn = exports.AuRender;

const Rn = AuCompose;

const Sn = Portal;

const En = exports.Focus;

const Bn = as;

const On = [ Es, Bs, Os, Is, Ts, js, Ds, on, ln, hn, un, cn, an, fn, dn, pn, mn, xn, vn, gn, bn, wn, yn, kn, An, Cn, Rn, Sn, En, Bn, AuSlot ];

const In = Xe;

const Tn = We;

const jn = He;

const Dn = Ye;

const Pn = Ze;

const $n = Ge;

const Ln = Qe;

const qn = Ke;

const Mn = Ne;

const Un = ze;

const Fn = si;

const Vn = hi;

const _n = ni;

const Nn = ri;

const Hn = oi;

const Wn = li;

const zn = ii;

const Gn = [ Ln, Pn, In, qn, Dn, Mn, jn, Tn, Un, $n, Fn, Vn, _n, Nn, Hn, Wn, zn ];

const Xn = {
    register(t) {
        return t.register(...Ls, ...On, ..._s, ...rn, ...Gn);
    },
    createContainer() {
        return this.register(i.DI.createContainer());
    }
};

const Kn = i.DI.createInterface("IAurelia");

class Aurelia {
    constructor(t = i.DI.createContainer()) {
        this.container = t;
        this.ai = false;
        this.fi = false;
        this.di = false;
        this.pi = void 0;
        this.next = void 0;
        this.mi = void 0;
        this.xi = void 0;
        if (t.has(Kn, true)) throw new Error("AUR0711");
        t.registerResolver(Kn, new i.InstanceProvider("IAurelia", this));
        t.registerResolver(me, this.vi = new i.InstanceProvider("IAppRoot"));
    }
    get isRunning() {
        return this.ai;
    }
    get isStarting() {
        return this.fi;
    }
    get isStopping() {
        return this.di;
    }
    get root() {
        if (null == this.pi) {
            if (null == this.next) throw new Error("AUR0710");
            return this.next;
        }
        return this.pi;
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.gi(t.host), this.container, this.vi);
        return this;
    }
    enhance(t, e) {
        var s;
        const n = null !== (s = t.container) && void 0 !== s ? s : this.container.createChild();
        const r = t.host;
        const o = this.gi(r);
        const l = t.component;
        let h;
        if ("function" === typeof l) {
            n.registerResolver(o.Element, n.registerResolver(be, new i.InstanceProvider("ElementResolver", r)));
            h = n.invoke(l);
        } else h = l;
        n.registerResolver(we, new i.InstanceProvider("IEventTarget", r));
        e = null !== e && void 0 !== e ? e : null;
        const u = Controller.$el(n, h, r, null, void 0, CustomElementDefinition.create({
            name: bt.generateName(),
            template: r,
            enhance: true
        }));
        return i.onResolve(u.activate(u, e, 2), (() => u));
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domWriteQueue.yield();
        await t.domReadQueue.yield();
        await t.taskQueue.yield();
    }
    gi(t) {
        let s;
        if (!this.container.has(k, false)) {
            if (null === t.ownerDocument.defaultView) throw new Error("AUR0712");
            s = new e.BrowserPlatform(t.ownerDocument.defaultView);
            this.container.register(i.Registration.instance(k, s));
        } else s = this.container.get(k);
        return s;
    }
    start(t = this.next) {
        if (null == t) throw new Error("AUR0713");
        if (this.mi instanceof Promise) return this.mi;
        return this.mi = i.onResolve(this.stop(), (() => {
            Reflect.set(t.host, "$aurelia", this);
            this.vi.prepare(this.pi = t);
            this.fi = true;
            return i.onResolve(t.activate(), (() => {
                this.ai = true;
                this.fi = false;
                this.mi = void 0;
                this.bi(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (this.xi instanceof Promise) return this.xi;
        if (true === this.ai) {
            const e = this.pi;
            this.ai = false;
            this.di = true;
            return this.xi = i.onResolve(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) e.dispose();
                this.pi = void 0;
                this.vi.dispose();
                this.di = false;
                this.bi(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.ai || this.di) throw new Error("AUR0714");
        this.container.dispose();
    }
    bi(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

const Yn = i.DI.createInterface("IDialogService");

const Qn = i.DI.createInterface("IDialogController");

const Zn = i.DI.createInterface("IDialogDomRenderer");

const Jn = i.DI.createInterface("IDialogDom");

const tr = i.DI.createInterface("IDialogGlobalSettings");

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
            this.It = t;
            this.Ct = e;
        }));
    }
    static get inject() {
        return [ k, i.IContainer ];
    }
    activate(t) {
        var e;
        const s = this.ctn.createChild();
        const {model: n, template: r, rejectOnCancel: o} = t;
        const l = s.get(Zn);
        const h = null !== (e = t.host) && void 0 !== e ? e : this.p.document.body;
        const u = this.dom = l.render(h, t);
        const c = s.has(we, true) ? s.get(we) : null;
        const a = u.contentHost;
        this.settings = t;
        if (null == c || !c.contains(h)) s.register(i.Registration.instance(we, h));
        s.register(i.Registration.instance(be, a), i.Registration.instance(Jn, u));
        return new Promise((e => {
            var i, r;
            const o = Object.assign(this.cmp = this.getOrCreateVm(s, t, a), {
                $dialog: this
            });
            e(null !== (r = null === (i = o.canActivate) || void 0 === i ? void 0 : i.call(o, n)) && void 0 !== r ? r : true);
        })).then((e => {
            var l;
            if (true !== e) {
                u.dispose();
                if (o) throw er(null, "Dialog activation rejected");
                return DialogOpenResult.create(true, this);
            }
            const h = this.cmp;
            return i.onResolve(null === (l = h.activate) || void 0 === l ? void 0 : l.call(h, n), (() => {
                var e;
                const n = this.controller = Controller.$el(s, h, a, null, 0, CustomElementDefinition.create(null !== (e = this.getDefinition(h)) && void 0 !== e ? e : {
                    name: bt.generateName(),
                    template: r
                }));
                return i.onResolve(n.activate(n, null, 2), (() => {
                    var e;
                    u.overlay.addEventListener(null !== (e = t.mouseEvent) && void 0 !== e ? e : "click", this);
                    return DialogOpenResult.create(false, this);
                }));
            }));
        }), (t => {
            u.dispose();
            throw t;
        }));
    }
    deactivate(t, e) {
        if (this.wi) return this.wi;
        let s = true;
        const {controller: n, dom: r, cmp: o, settings: {mouseEvent: l, rejectOnCancel: h}} = this;
        const u = DialogCloseResult.create(t, e);
        const c = new Promise((c => {
            var a, f;
            c(i.onResolve(null !== (f = null === (a = o.canDeactivate) || void 0 === a ? void 0 : a.call(o, u)) && void 0 !== f ? f : true, (c => {
                var a;
                if (true !== c) {
                    s = false;
                    this.wi = void 0;
                    if (h) throw er(null, "Dialog cancellation rejected");
                    return DialogCloseResult.create("abort");
                }
                return i.onResolve(null === (a = o.deactivate) || void 0 === a ? void 0 : a.call(o, u), (() => i.onResolve(n.deactivate(n, null, 4), (() => {
                    r.dispose();
                    r.overlay.removeEventListener(null !== l && void 0 !== l ? l : "click", this);
                    if (!h && "error" !== t) this.It(u); else this.Ct(er(e, "Dialog cancelled with a rejection on cancel"));
                    return u;
                }))));
            })));
        })).catch((t => {
            this.wi = void 0;
            throw t;
        }));
        this.wi = s ? c : void 0;
        return c;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(t) {
        const e = ir(t);
        return new Promise((t => {
            var s, n;
            return t(i.onResolve(null === (n = (s = this.cmp).deactivate) || void 0 === n ? void 0 : n.call(s, DialogCloseResult.create("error", e)), (() => i.onResolve(this.controller.deactivate(this.controller, null, 4), (() => {
                this.dom.dispose();
                this.Ct(e);
            })))));
        }));
    }
    handleEvent(t) {
        if (this.settings.overlayDismiss && !this.dom.contentHost.contains(t.target)) this.cancel();
    }
    getOrCreateVm(t, e, s) {
        const n = e.component;
        if (null == n) return new EmptyComponent;
        if ("object" === typeof n) return n;
        const r = this.p;
        t.registerResolver(be, t.registerResolver(r.Element, new i.InstanceProvider("ElementResolver", s)));
        return t.invoke(n);
    }
    getDefinition(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return bt.isType(e) ? bt.getDefinition(e) : null;
    }
}

class EmptyComponent {}

function er(t, e) {
    const i = new Error(e);
    i.wasCancelled = true;
    i.value = t;
    return i;
}

function ir(t) {
    const e = new Error;
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor(t, e, i) {
        this.ot = t;
        this.p = e;
        this.yi = i;
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
        return [ i.IContainer, k, tr ];
    }
    static register(t) {
        t.register(i.Registration.singleton(Yn, this), G.beforeDeactivate(Yn, (t => i.onResolve(t.closeAll(), (t => {
            if (t.length > 0) throw new Error(`AUR0901:${t.length}`);
        })))));
    }
    open(t) {
        return nr(new Promise((e => {
            var s;
            const n = DialogSettings.from(this.yi, t);
            const r = null !== (s = n.container) && void 0 !== s ? s : this.ot.createChild();
            e(i.onResolve(n.load(), (t => {
                const e = r.invoke(DialogController);
                r.register(i.Registration.instance(Qn, e));
                r.register(i.Registration.callback(DialogController, (() => {
                    throw new Error("AUR0902");
                })));
                return i.onResolve(e.activate(t), (t => {
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
        const i = rr(e);
        if (null == i) return;
        const s = this.top;
        if (null === s || 0 === s.settings.keyboard.length) return;
        const n = s.settings.keyboard;
        if ("Escape" === i && n.includes(i)) void s.cancel(); else if ("Enter" === i && n.includes(i)) void s.ok();
    }
}

class DialogSettings {
    static from(...t) {
        return Object.assign(new DialogSettings, ...t).Ai().ki();
    }
    load() {
        const t = this;
        const e = this.component;
        const s = this.template;
        const n = i.resolveAll(null == e ? void 0 : i.onResolve(e(), (e => {
            t.component = e;
        })), "function" === typeof s ? i.onResolve(s(), (e => {
            t.template = e;
        })) : void 0);
        return n instanceof Promise ? n.then((() => t)) : t;
    }
    Ai() {
        if (null == this.component && null == this.template) throw new Error("AUR0903");
        return this;
    }
    ki() {
        if (null == this.keyboard) this.keyboard = this.lock ? [] : [ "Enter", "Escape" ];
        if ("boolean" !== typeof this.overlayDismiss) this.overlayDismiss = !this.lock;
        return this;
    }
}

function sr(t, e) {
    return this.then((i => i.dialog.closed.then(t, e)), e);
}

function nr(t) {
    t.whenClosed = sr;
    return t;
}

function rr(t) {
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
        i.Registration.singleton(tr, this).register(t);
    }
}

const or = "position:absolute;width:100%;height:100%;top:0;left:0;";

class DefaultDialogDomRenderer {
    constructor(t) {
        this.p = t;
        this.wrapperCss = `${or} display:flex;`;
        this.overlayCss = or;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        i.Registration.singleton(Zn, this).register(t);
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

DefaultDialogDomRenderer.inject = [ k ];

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

function lr(t, e) {
    return {
        settingsProvider: t,
        register: i => i.register(...e, G.beforeCreate((() => t(i.get(tr))))),
        customize(t, i) {
            return lr(t, null !== i && void 0 !== i ? i : e);
        }
    };
}

const hr = lr((() => {
    throw new Error("AUR0904");
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(i.Registration.singleton(tr, this));
    }
} ]);

const ur = lr(i.noop, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer ]);

Object.defineProperty(exports, "Platform", {
    enumerable: true,
    get: function() {
        return t.Platform;
    }
});

Object.defineProperty(exports, "Task", {
    enumerable: true,
    get: function() {
        return t.Task;
    }
});

Object.defineProperty(exports, "TaskAbortError", {
    enumerable: true,
    get: function() {
        return t.TaskAbortError;
    }
});

Object.defineProperty(exports, "TaskQueue", {
    enumerable: true,
    get: function() {
        return t.TaskQueue;
    }
});

Object.defineProperty(exports, "TaskQueuePriority", {
    enumerable: true,
    get: function() {
        return t.TaskQueuePriority;
    }
});

Object.defineProperty(exports, "TaskStatus", {
    enumerable: true,
    get: function() {
        return t.TaskStatus;
    }
});

Object.defineProperty(exports, "BrowserPlatform", {
    enumerable: true,
    get: function() {
        return e.BrowserPlatform;
    }
});

Object.defineProperty(exports, "Access", {
    enumerable: true,
    get: function() {
        return s.Access;
    }
});

Object.defineProperty(exports, "AccessKeyedExpression", {
    enumerable: true,
    get: function() {
        return s.AccessKeyedExpression;
    }
});

Object.defineProperty(exports, "AccessMemberExpression", {
    enumerable: true,
    get: function() {
        return s.AccessMemberExpression;
    }
});

Object.defineProperty(exports, "AccessScopeExpression", {
    enumerable: true,
    get: function() {
        return s.AccessScopeExpression;
    }
});

Object.defineProperty(exports, "AccessThisExpression", {
    enumerable: true,
    get: function() {
        return s.AccessThisExpression;
    }
});

Object.defineProperty(exports, "AccessorType", {
    enumerable: true,
    get: function() {
        return s.AccessorType;
    }
});

Object.defineProperty(exports, "ArrayBindingPattern", {
    enumerable: true,
    get: function() {
        return s.ArrayBindingPattern;
    }
});

Object.defineProperty(exports, "ArrayIndexObserver", {
    enumerable: true,
    get: function() {
        return s.ArrayIndexObserver;
    }
});

Object.defineProperty(exports, "ArrayLiteralExpression", {
    enumerable: true,
    get: function() {
        return s.ArrayLiteralExpression;
    }
});

Object.defineProperty(exports, "ArrayObserver", {
    enumerable: true,
    get: function() {
        return s.ArrayObserver;
    }
});

Object.defineProperty(exports, "AssignExpression", {
    enumerable: true,
    get: function() {
        return s.AssignExpression;
    }
});

Object.defineProperty(exports, "BinaryExpression", {
    enumerable: true,
    get: function() {
        return s.BinaryExpression;
    }
});

Object.defineProperty(exports, "BindingBehavior", {
    enumerable: true,
    get: function() {
        return s.BindingBehavior;
    }
});

Object.defineProperty(exports, "BindingBehaviorDefinition", {
    enumerable: true,
    get: function() {
        return s.BindingBehaviorDefinition;
    }
});

Object.defineProperty(exports, "BindingBehaviorExpression", {
    enumerable: true,
    get: function() {
        return s.BindingBehaviorExpression;
    }
});

Object.defineProperty(exports, "BindingBehaviorFactory", {
    enumerable: true,
    get: function() {
        return s.BindingBehaviorFactory;
    }
});

Object.defineProperty(exports, "BindingBehaviorStrategy", {
    enumerable: true,
    get: function() {
        return s.BindingBehaviorStrategy;
    }
});

Object.defineProperty(exports, "BindingContext", {
    enumerable: true,
    get: function() {
        return s.BindingContext;
    }
});

Object.defineProperty(exports, "BindingIdentifier", {
    enumerable: true,
    get: function() {
        return s.BindingIdentifier;
    }
});

Object.defineProperty(exports, "BindingInterceptor", {
    enumerable: true,
    get: function() {
        return s.BindingInterceptor;
    }
});

Object.defineProperty(exports, "BindingMediator", {
    enumerable: true,
    get: function() {
        return s.BindingMediator;
    }
});

Object.defineProperty(exports, "BindingMode", {
    enumerable: true,
    get: function() {
        return s.BindingMode;
    }
});

Object.defineProperty(exports, "BindingType", {
    enumerable: true,
    get: function() {
        return s.BindingType;
    }
});

Object.defineProperty(exports, "CallFunctionExpression", {
    enumerable: true,
    get: function() {
        return s.CallFunctionExpression;
    }
});

Object.defineProperty(exports, "CallMemberExpression", {
    enumerable: true,
    get: function() {
        return s.CallMemberExpression;
    }
});

Object.defineProperty(exports, "CallScopeExpression", {
    enumerable: true,
    get: function() {
        return s.CallScopeExpression;
    }
});

Object.defineProperty(exports, "Char", {
    enumerable: true,
    get: function() {
        return s.Char;
    }
});

Object.defineProperty(exports, "CollectionKind", {
    enumerable: true,
    get: function() {
        return s.CollectionKind;
    }
});

Object.defineProperty(exports, "CollectionLengthObserver", {
    enumerable: true,
    get: function() {
        return s.CollectionLengthObserver;
    }
});

Object.defineProperty(exports, "CollectionSizeObserver", {
    enumerable: true,
    get: function() {
        return s.CollectionSizeObserver;
    }
});

Object.defineProperty(exports, "ComputedObserver", {
    enumerable: true,
    get: function() {
        return s.ComputedObserver;
    }
});

Object.defineProperty(exports, "ConditionalExpression", {
    enumerable: true,
    get: function() {
        return s.ConditionalExpression;
    }
});

Object.defineProperty(exports, "CustomExpression", {
    enumerable: true,
    get: function() {
        return s.CustomExpression;
    }
});

Object.defineProperty(exports, "DelegationStrategy", {
    enumerable: true,
    get: function() {
        return s.DelegationStrategy;
    }
});

Object.defineProperty(exports, "DirtyCheckProperty", {
    enumerable: true,
    get: function() {
        return s.DirtyCheckProperty;
    }
});

Object.defineProperty(exports, "DirtyCheckSettings", {
    enumerable: true,
    get: function() {
        return s.DirtyCheckSettings;
    }
});

Object.defineProperty(exports, "ExpressionKind", {
    enumerable: true,
    get: function() {
        return s.ExpressionKind;
    }
});

Object.defineProperty(exports, "ForOfStatement", {
    enumerable: true,
    get: function() {
        return s.ForOfStatement;
    }
});

Object.defineProperty(exports, "HtmlLiteralExpression", {
    enumerable: true,
    get: function() {
        return s.HtmlLiteralExpression;
    }
});

Object.defineProperty(exports, "IDirtyChecker", {
    enumerable: true,
    get: function() {
        return s.IDirtyChecker;
    }
});

Object.defineProperty(exports, "IExpressionParser", {
    enumerable: true,
    get: function() {
        return s.IExpressionParser;
    }
});

Object.defineProperty(exports, "INodeObserverLocator", {
    enumerable: true,
    get: function() {
        return s.INodeObserverLocator;
    }
});

Object.defineProperty(exports, "IObserverLocator", {
    enumerable: true,
    get: function() {
        return s.IObserverLocator;
    }
});

Object.defineProperty(exports, "ISignaler", {
    enumerable: true,
    get: function() {
        return s.ISignaler;
    }
});

Object.defineProperty(exports, "Interpolation", {
    enumerable: true,
    get: function() {
        return s.Interpolation;
    }
});

Object.defineProperty(exports, "LifecycleFlags", {
    enumerable: true,
    get: function() {
        return s.LifecycleFlags;
    }
});

Object.defineProperty(exports, "MapObserver", {
    enumerable: true,
    get: function() {
        return s.MapObserver;
    }
});

Object.defineProperty(exports, "ObjectBindingPattern", {
    enumerable: true,
    get: function() {
        return s.ObjectBindingPattern;
    }
});

Object.defineProperty(exports, "ObjectLiteralExpression", {
    enumerable: true,
    get: function() {
        return s.ObjectLiteralExpression;
    }
});

Object.defineProperty(exports, "ObserverLocator", {
    enumerable: true,
    get: function() {
        return s.ObserverLocator;
    }
});

Object.defineProperty(exports, "OverrideContext", {
    enumerable: true,
    get: function() {
        return s.OverrideContext;
    }
});

Object.defineProperty(exports, "ParserState", {
    enumerable: true,
    get: function() {
        return s.ParserState;
    }
});

Object.defineProperty(exports, "Precedence", {
    enumerable: true,
    get: function() {
        return s.Precedence;
    }
});

Object.defineProperty(exports, "PrimitiveLiteralExpression", {
    enumerable: true,
    get: function() {
        return s.PrimitiveLiteralExpression;
    }
});

Object.defineProperty(exports, "PrimitiveObserver", {
    enumerable: true,
    get: function() {
        return s.PrimitiveObserver;
    }
});

Object.defineProperty(exports, "PropertyAccessor", {
    enumerable: true,
    get: function() {
        return s.PropertyAccessor;
    }
});

Object.defineProperty(exports, "Scope", {
    enumerable: true,
    get: function() {
        return s.Scope;
    }
});

Object.defineProperty(exports, "SetObserver", {
    enumerable: true,
    get: function() {
        return s.SetObserver;
    }
});

Object.defineProperty(exports, "SetterObserver", {
    enumerable: true,
    get: function() {
        return s.SetterObserver;
    }
});

Object.defineProperty(exports, "TaggedTemplateExpression", {
    enumerable: true,
    get: function() {
        return s.TaggedTemplateExpression;
    }
});

Object.defineProperty(exports, "TemplateExpression", {
    enumerable: true,
    get: function() {
        return s.TemplateExpression;
    }
});

Object.defineProperty(exports, "UnaryExpression", {
    enumerable: true,
    get: function() {
        return s.UnaryExpression;
    }
});

Object.defineProperty(exports, "ValueConverter", {
    enumerable: true,
    get: function() {
        return s.ValueConverter;
    }
});

Object.defineProperty(exports, "ValueConverterDefinition", {
    enumerable: true,
    get: function() {
        return s.ValueConverterDefinition;
    }
});

Object.defineProperty(exports, "ValueConverterExpression", {
    enumerable: true,
    get: function() {
        return s.ValueConverterExpression;
    }
});

Object.defineProperty(exports, "alias", {
    enumerable: true,
    get: function() {
        return s.alias;
    }
});

Object.defineProperty(exports, "applyMutationsToIndices", {
    enumerable: true,
    get: function() {
        return s.applyMutationsToIndices;
    }
});

Object.defineProperty(exports, "bindingBehavior", {
    enumerable: true,
    get: function() {
        return s.bindingBehavior;
    }
});

Object.defineProperty(exports, "cloneIndexMap", {
    enumerable: true,
    get: function() {
        return s.cloneIndexMap;
    }
});

Object.defineProperty(exports, "connectable", {
    enumerable: true,
    get: function() {
        return s.connectable;
    }
});

Object.defineProperty(exports, "copyIndexMap", {
    enumerable: true,
    get: function() {
        return s.copyIndexMap;
    }
});

Object.defineProperty(exports, "createIndexMap", {
    enumerable: true,
    get: function() {
        return s.createIndexMap;
    }
});

Object.defineProperty(exports, "disableArrayObservation", {
    enumerable: true,
    get: function() {
        return s.disableArrayObservation;
    }
});

Object.defineProperty(exports, "disableMapObservation", {
    enumerable: true,
    get: function() {
        return s.disableMapObservation;
    }
});

Object.defineProperty(exports, "disableSetObservation", {
    enumerable: true,
    get: function() {
        return s.disableSetObservation;
    }
});

Object.defineProperty(exports, "enableArrayObservation", {
    enumerable: true,
    get: function() {
        return s.enableArrayObservation;
    }
});

Object.defineProperty(exports, "enableMapObservation", {
    enumerable: true,
    get: function() {
        return s.enableMapObservation;
    }
});

Object.defineProperty(exports, "enableSetObservation", {
    enumerable: true,
    get: function() {
        return s.enableSetObservation;
    }
});

Object.defineProperty(exports, "getCollectionObserver", {
    enumerable: true,
    get: function() {
        return s.getCollectionObserver;
    }
});

Object.defineProperty(exports, "isIndexMap", {
    enumerable: true,
    get: function() {
        return s.isIndexMap;
    }
});

Object.defineProperty(exports, "observable", {
    enumerable: true,
    get: function() {
        return s.observable;
    }
});

Object.defineProperty(exports, "parse", {
    enumerable: true,
    get: function() {
        return s.parse;
    }
});

Object.defineProperty(exports, "parseExpression", {
    enumerable: true,
    get: function() {
        return s.parseExpression;
    }
});

Object.defineProperty(exports, "registerAliases", {
    enumerable: true,
    get: function() {
        return s.registerAliases;
    }
});

Object.defineProperty(exports, "subscriberCollection", {
    enumerable: true,
    get: function() {
        return s.subscriberCollection;
    }
});

Object.defineProperty(exports, "synchronizeIndices", {
    enumerable: true,
    get: function() {
        return s.synchronizeIndices;
    }
});

Object.defineProperty(exports, "valueConverter", {
    enumerable: true,
    get: function() {
        return s.valueConverter;
    }
});

exports.AdoptedStyleSheetsStyles = AdoptedStyleSheetsStyles;

exports.AppRoot = AppRoot;

exports.AppTask = G;

exports.AtPrefixedTriggerAttributePatternRegistration = Ms;

exports.AttrBindingBehavior = AttrBindingBehavior;

exports.AttrBindingBehaviorRegistration = yn;

exports.AttrBindingCommandRegistration = en;

exports.AttrSyntax = AttrSyntax;

exports.AttributeBinding = AttributeBinding;

exports.AttributeBindingInstruction = AttributeBindingInstruction;

exports.AttributeBindingRendererRegistration = Vn;

exports.AttributeNSAccessor = AttributeNSAccessor;

exports.AttributePattern = v;

exports.AuCompose = AuCompose;

exports.AuRenderRegistration = Cn;

exports.AuSlot = AuSlot;

exports.AuSlotsInfo = AuSlotsInfo;

exports.Aurelia = Aurelia;

exports.Bindable = u;

exports.BindableDefinition = BindableDefinition;

exports.BindableObserver = BindableObserver;

exports.BindablesInfo = BindablesInfo;

exports.BindingCommand = ki;

exports.BindingCommandDefinition = BindingCommandDefinition;

exports.BindingModeBehavior = BindingModeBehavior;

exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;

exports.CallBinding = CallBinding;

exports.CallBindingCommandRegistration = Hs;

exports.CallBindingInstruction = CallBindingInstruction;

exports.CallBindingRendererRegistration = In;

exports.CaptureBindingCommandRegistration = tn;

exports.CheckedObserver = CheckedObserver;

exports.Children = Z;

exports.ChildrenDefinition = ChildrenDefinition;

exports.ChildrenObserver = ChildrenObserver;

exports.ClassAttributeAccessor = ClassAttributeAccessor;

exports.ClassBindingCommandRegistration = sn;

exports.ColonPrefixedBindAttributePatternRegistration = Us;

exports.ComputedWatcher = ComputedWatcher;

exports.Controller = Controller;

exports.CustomAttribute = ht;

exports.CustomAttributeDefinition = CustomAttributeDefinition;

exports.CustomAttributeRendererRegistration = Tn;

exports.CustomElement = bt;

exports.CustomElementDefinition = CustomElementDefinition;

exports.CustomElementRendererRegistration = jn;

exports.DataAttributeAccessor = DataAttributeAccessor;

exports.DebounceBindingBehavior = DebounceBindingBehavior;

exports.DebounceBindingBehaviorRegistration = Es;

exports.DefaultBindingCommandRegistration = Ws;

exports.DefaultBindingLanguage = rn;

exports.DefaultBindingSyntax = _s;

exports.DefaultComponents = Ls;

exports.DefaultDialogDom = DefaultDialogDom;

exports.DefaultDialogDomRenderer = DefaultDialogDomRenderer;

exports.DefaultDialogGlobalSettings = DefaultDialogGlobalSettings;

exports.DefaultRenderers = Gn;

exports.DefaultResources = On;

exports.DelegateBindingCommandRegistration = Js;

exports.DialogCloseResult = DialogCloseResult;

exports.DialogConfiguration = hr;

exports.DialogController = DialogController;

exports.DialogDefaultConfiguration = ur;

exports.DialogOpenResult = DialogOpenResult;

exports.DialogService = DialogService;

exports.DotSeparatedAttributePatternRegistration = Vs;

exports.Else = Else;

exports.ElseRegistration = an;

exports.EventDelegator = EventDelegator;

exports.EventSubscriber = EventSubscriber;

exports.ExpressionWatcher = ExpressionWatcher;

exports.ForBindingCommandRegistration = zs;

exports.FragmentNodeSequence = FragmentNodeSequence;

exports.FrequentMutations = FrequentMutations;

exports.FromViewBindingBehavior = FromViewBindingBehavior;

exports.FromViewBindingBehaviorRegistration = Is;

exports.FromViewBindingCommandRegistration = Gs;

exports.HydrateAttributeInstruction = HydrateAttributeInstruction;

exports.HydrateElementInstruction = HydrateElementInstruction;

exports.HydrateLetElementInstruction = HydrateLetElementInstruction;

exports.HydrateTemplateController = HydrateTemplateController;

exports.IAppRoot = me;

exports.IAppTask = z;

exports.IAttrMapper = R;

exports.IAttributeParser = d;

exports.IAttributePattern = f;

exports.IAuSlotsInfo = Pe;

exports.IAurelia = Kn;

exports.IController = ue;

exports.IDialogController = Qn;

exports.IDialogDom = Jn;

exports.IDialogDomRenderer = Zn;

exports.IDialogGlobalSettings = tr;

exports.IDialogService = Yn;

exports.IEventDelegator = je;

exports.IEventTarget = we;

exports.IHistory = Oe;

exports.IHydrationContext = ce;

exports.IInstruction = $e;

exports.ILifecycleHooks = $t;

exports.ILocation = Be;

exports.INode = be;

exports.INodeObserverLocatorRegistration = $s;

exports.IPlatform = k;

exports.IProjections = De;

exports.IRenderLocation = ye;

exports.IRenderer = Me;

exports.IRendering = Xt;

exports.ISVGAnalyzer = A;

exports.ISanitizer = Ss;

exports.IShadowDOMGlobalStyles = Ot;

exports.IShadowDOMStyleFactory = Et;

exports.IShadowDOMStyles = Bt;

exports.ISyntaxInterpreter = a;

exports.ITemplateCompiler = qe;

exports.ITemplateCompilerHooks = Fi;

exports.ITemplateCompilerRegistration = Ps;

exports.ITemplateElementFactory = Ci;

exports.IViewFactory = Ft;

exports.IViewLocator = Gt;

exports.IWindow = Ee;

exports.IWorkTracker = xe;

exports.If = If;

exports.IfRegistration = cn;

exports.InterpolationBinding = InterpolationBinding;

exports.InterpolationBindingRendererRegistration = Dn;

exports.InterpolationInstruction = InterpolationInstruction;

exports.Interpretation = Interpretation;

exports.IteratorBindingInstruction = IteratorBindingInstruction;

exports.IteratorBindingRendererRegistration = Pn;

exports.LetBinding = LetBinding;

exports.LetBindingInstruction = LetBindingInstruction;

exports.LetElementRendererRegistration = $n;

exports.LifecycleHooks = Mt;

exports.LifecycleHooksDefinition = LifecycleHooksDefinition;

exports.LifecycleHooksEntry = LifecycleHooksEntry;

exports.Listener = Listener;

exports.ListenerBindingInstruction = ListenerBindingInstruction;

exports.ListenerBindingRendererRegistration = Fn;

exports.NodeObserverConfig = NodeObserverConfig;

exports.NodeObserverLocator = NodeObserverLocator;

exports.NoopSVGAnalyzer = NoopSVGAnalyzer;

exports.ObserveShallow = ObserveShallow;

exports.OneTimeBindingBehavior = OneTimeBindingBehavior;

exports.OneTimeBindingBehaviorRegistration = Bs;

exports.OneTimeBindingCommandRegistration = Xs;

exports.Portal = Portal;

exports.PropertyBinding = PropertyBinding;

exports.PropertyBindingInstruction = PropertyBindingInstruction;

exports.PropertyBindingRendererRegistration = Ln;

exports.RefAttributePatternRegistration = Fs;

exports.RefBinding = RefBinding;

exports.RefBindingCommandRegistration = Qs;

exports.RefBindingInstruction = RefBindingInstruction;

exports.RefBindingRendererRegistration = qn;

exports.RenderPlan = RenderPlan;

exports.Rendering = Rendering;

exports.Repeat = Repeat;

exports.RepeatRegistration = fn;

exports.SVGAnalyzer = SVGAnalyzer;

exports.SVGAnalyzerRegistration = qs;

exports.SanitizeValueConverterRegistration = on;

exports.SelectValueObserver = SelectValueObserver;

exports.SelfBindingBehavior = SelfBindingBehavior;

exports.SelfBindingBehaviorRegistration = kn;

exports.SetAttributeInstruction = SetAttributeInstruction;

exports.SetAttributeRendererRegistration = _n;

exports.SetClassAttributeInstruction = SetClassAttributeInstruction;

exports.SetClassAttributeRendererRegistration = Nn;

exports.SetPropertyInstruction = SetPropertyInstruction;

exports.SetPropertyRendererRegistration = Mn;

exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;

exports.SetStyleAttributeRendererRegistration = Hn;

exports.ShadowDOMRegistry = ShadowDOMRegistry;

exports.ShortHandBindingSyntax = Ns;

exports.SignalBindingBehavior = SignalBindingBehavior;

exports.SignalBindingBehaviorRegistration = Ts;

exports.StandardConfiguration = Xn;

exports.StyleAttributeAccessor = StyleAttributeAccessor;

exports.StyleBindingCommandRegistration = nn;

exports.StyleConfiguration = It;

exports.StyleElementStyles = StyleElementStyles;

exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;

exports.StylePropertyBindingRendererRegistration = Wn;

exports.TemplateCompiler = TemplateCompiler;

exports.TemplateCompilerHooks = Ni;

exports.TemplateControllerRendererRegistration = Un;

exports.TextBindingInstruction = TextBindingInstruction;

exports.TextBindingRendererRegistration = zn;

exports.ThrottleBindingBehavior = ThrottleBindingBehavior;

exports.ThrottleBindingBehaviorRegistration = js;

exports.ToViewBindingBehavior = ToViewBindingBehavior;

exports.ToViewBindingBehaviorRegistration = Os;

exports.ToViewBindingCommandRegistration = Ks;

exports.TriggerBindingCommandRegistration = Zs;

exports.TwoWayBindingBehavior = TwoWayBindingBehavior;

exports.TwoWayBindingBehaviorRegistration = Ds;

exports.TwoWayBindingCommandRegistration = Ys;

exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;

exports.UpdateTriggerBindingBehaviorRegistration = An;

exports.ValueAttributeObserver = ValueAttributeObserver;

exports.ViewFactory = ViewFactory;

exports.ViewLocator = ViewLocator;

exports.ViewValueConverterRegistration = ln;

exports.Views = Wt;

exports.Watch = ft;

exports.With = With;

exports.WithRegistration = dn;

exports.allResources = Si;

exports.attributePattern = p;

exports.bindable = o;

exports.bindingCommand = wi;

exports.children = K;

exports.containerless = mt;

exports.convertToRenderLocation = Re;

exports.createElement = bs;

exports.cssModules = Rt;

exports.customAttribute = rt;

exports.customElement = dt;

exports.getEffectiveParentNode = Ae;

exports.getRef = ve;

exports.isCustomElementController = ne;

exports.isCustomElementViewModel = re;

exports.isInstruction = Le;

exports.isRenderLocation = Se;

exports.lifecycleHooks = Ut;

exports.processContent = yt;

exports.renderer = Ue;

exports.setEffectiveParentNode = Ce;

exports.setRef = ge;

exports.shadowCSS = St;

exports.templateCompilerHooks = Hi;

exports.templateController = ot;

exports.useShadowDOM = pt;

exports.view = zt;

exports.watch = ut;
//# sourceMappingURL=index.js.map
