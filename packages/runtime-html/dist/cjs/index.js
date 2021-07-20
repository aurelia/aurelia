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
        i.Metadata.define(h.name, BindableDefinition.create(e, s), t.constructor, e);
        i.Protocol.annotation.appendTo(t.constructor, h.keyFrom(e));
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
    return t.startsWith(h.name);
}

const h = {
    name: i.Protocol.annotation.keyFor("bindable"),
    keyFrom(t) {
        return `${h.name}:${t}`;
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
                if (!i.Metadata.hasOwn(h.name, t, r)) i.Protocol.annotation.appendTo(t, h.keyFrom(r));
                i.Metadata.define(h.name, e, t, r);
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
        const e = h.name.length + 1;
        const s = [];
        const n = i.getPrototypeChain(t);
        let r = n.length;
        let o = 0;
        let a;
        let u;
        let c;
        while (--r >= 0) {
            c = n[r];
            a = i.Protocol.annotation.getKeys(c).filter(l);
            u = a.length;
            for (let t = 0; t < u; ++t) s[o++] = i.Metadata.getOwn(h.name, c, a[t].slice(e));
        }
        return s;
    }
};

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
        this.propertyKey = e;
        this.set = n;
        this.$controller = r;
        this.value = void 0;
        this.oldValue = void 0;
        this.f = 0;
        const o = t[s];
        const l = t.propertyChanged;
        const h = this.hasCb = "function" === typeof o;
        const a = this.hasCbAll = "function" === typeof l;
        const u = this.hasSetter = n !== i.noop;
        this.cb = h ? o : i.noop;
        this.cbAll = a ? l : i.noop;
        if (void 0 === this.cb && !a && !u) this.observing = false; else {
            this.observing = true;
            const i = t[e];
            this.value = u && void 0 !== i ? n(i) : i;
            this.createGetterSetter();
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
            this.createGetterSetter();
        }
        this.subs.add(t);
    }
    flush() {
        a = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, a, this.f);
    }
    createGetterSetter() {
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

s.subscriberCollection(BindableObserver);

s.withFlushQueue(BindableObserver);

let a;

class CharSpec {
    constructor(t, e, i, s) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = i;
        this.isInverted = s;
        if (s) switch (t.length) {
          case 0:
            this.has = this.hasOfNoneInverse;
            break;

          case 1:
            this.has = this.hasOfSingleInverse;
            break;

          default:
            this.has = this.hasOfMultipleInverse;
        } else switch (t.length) {
          case 0:
            this.has = this.hasOfNone;
            break;

          case 1:
            this.has = this.hasOfSingle;
            break;

          default:
            this.has = this.hasOfMultiple;
        }
    }
    equals(t) {
        return this.chars === t.chars && this.repeat === t.repeat && this.isSymbol === t.isSymbol && this.isInverted === t.isInverted;
    }
    hasOfMultiple(t) {
        return this.chars.includes(t);
    }
    hasOfSingle(t) {
        return this.chars === t;
    }
    hasOfNone(t) {
        return false;
    }
    hasOfMultipleInverse(t) {
        return !this.chars.includes(t);
    }
    hasOfSingleInverse(t) {
        return this.chars !== t;
    }
    hasOfNoneInverse(t) {
        return true;
    }
}

class Interpretation {
    constructor() {
        this.parts = i.emptyArray;
        this.i = "";
        this.currentRecord = {};
        this.partsRecord = {};
    }
    get pattern() {
        const t = this.i;
        if ("" === t) return null; else return t;
    }
    set pattern(t) {
        if (null == t) {
            this.i = "";
            this.parts = i.emptyArray;
        } else {
            this.i = t;
            this.parts = this.partsRecord[t];
        }
    }
    append(t, e) {
        const {currentRecord: i} = this;
        if (void 0 === i[t]) i[t] = e; else i[t] += e;
    }
    next(t) {
        const {currentRecord: e} = this;
        if (void 0 !== e[t]) {
            const {partsRecord: i} = this;
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

const u = i.DI.createInterface("ISyntaxInterpreter", (t => t.singleton(SyntaxInterpreter)));

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

const c = i.DI.createInterface("IAttributePattern");

const f = i.DI.createInterface("IAttributeParser", (t => t.singleton(d)));

let d = class AttributeParser {
    constructor(t, e) {
        this.interpreter = t;
        this.cache = {};
        const i = this.patterns = {};
        e.forEach((e => {
            const s = m.getPatternDefinitions(e.constructor);
            t.add(s);
            s.forEach((t => {
                i[t.pattern] = e;
            }));
        }));
    }
    parse(t, e) {
        let i = this.cache[t];
        if (null == i) i = this.cache[t] = this.interpreter.interpret(t);
        const s = i.pattern;
        if (null == s) return new AttrSyntax(t, e, t, null); else return this.patterns[s][s](t, e, i.parts);
    }
};

d = n([ r(0, u), r(1, i.all(c)) ], d);

function p(...t) {
    return function e(i) {
        return m.define(t, i);
    };
}

class AttributePatternResourceDefinition {
    constructor(t) {
        this.Type = t;
        this.name = void 0;
    }
    register(t) {
        i.Registration.singleton(c, this.Type).register(t);
    }
}

const m = Object.freeze({
    name: i.Protocol.resource.keyFor("attribute-pattern"),
    definitionAnnotationKey: "attribute-pattern-definitions",
    define(t, e) {
        const s = new AttributePatternResourceDefinition(e);
        const {name: n, definitionAnnotationKey: r} = m;
        i.Metadata.define(n, s, e);
        i.Protocol.resource.appendTo(e, n);
        i.Protocol.annotation.set(e, r, t);
        i.Protocol.annotation.appendTo(e, r);
        return e;
    },
    getPatternDefinitions(t) {
        return i.Protocol.annotation.get(t, m.definitionAnnotationKey);
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

const x = g();

function v(t, e, i) {
    if (true === x[e]) return true;
    if ("string" !== typeof e) return false;
    const s = e.slice(0, 5);
    return x[e] = "aria-" === s || "data-" === s || i.isStandardSvgAttribute(t, e);
}

function g() {
    return Object.create(null);
}

const b = i.IPlatform;

const w = i.DI.createInterface("ISVGAnalyzer", (t => t.singleton(NoopSVGAnalyzer)));

class NoopSVGAnalyzer {
    isStandardSvgAttribute(t, e) {
        return false;
    }
}

function y(t) {
    const e = g();
    let i;
    for (i of t) e[i] = true;
    return e;
}

class SVGAnalyzer {
    constructor(t) {
        this.svgElements = Object.assign(g(), {
            a: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "target", "transform", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            altGlyph: y([ "class", "dx", "dy", "externalResourcesRequired", "format", "glyphRef", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            altglyph: g(),
            altGlyphDef: y([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphdef: g(),
            altGlyphItem: y([ "id", "xml:base", "xml:lang", "xml:space" ]),
            altglyphitem: g(),
            animate: y([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateColor: y([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateMotion: y([ "accumulate", "additive", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keyPoints", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "origin", "path", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "rotate", "systemLanguage", "to", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            animateTransform: y([ "accumulate", "additive", "attributeName", "attributeType", "begin", "by", "calcMode", "dur", "end", "externalResourcesRequired", "fill", "from", "id", "keySplines", "keyTimes", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "type", "values", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            circle: y([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "r", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            clipPath: y([ "class", "clipPathUnits", "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            "color-profile": y([ "id", "local", "name", "rendering-intent", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            cursor: y([ "externalResourcesRequired", "id", "requiredExtensions", "requiredFeatures", "systemLanguage", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            defs: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            desc: y([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            ellipse: y([ "class", "cx", "cy", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            feBlend: y([ "class", "height", "id", "in", "in2", "mode", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feColorMatrix: y([ "class", "height", "id", "in", "result", "style", "type", "values", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComponentTransfer: y([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feComposite: y([ "class", "height", "id", "in", "in2", "k1", "k2", "k3", "k4", "operator", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feConvolveMatrix: y([ "bias", "class", "divisor", "edgeMode", "height", "id", "in", "kernelMatrix", "kernelUnitLength", "order", "preserveAlpha", "result", "style", "targetX", "targetY", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDiffuseLighting: y([ "class", "diffuseConstant", "height", "id", "in", "kernelUnitLength", "result", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feDisplacementMap: y([ "class", "height", "id", "in", "in2", "result", "scale", "style", "width", "x", "xChannelSelector", "xml:base", "xml:lang", "xml:space", "y", "yChannelSelector" ]),
            feDistantLight: y([ "azimuth", "elevation", "id", "xml:base", "xml:lang", "xml:space" ]),
            feFlood: y([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feFuncA: y([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncB: y([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncG: y([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feFuncR: y([ "amplitude", "exponent", "id", "intercept", "offset", "slope", "tableValues", "type", "xml:base", "xml:lang", "xml:space" ]),
            feGaussianBlur: y([ "class", "height", "id", "in", "result", "stdDeviation", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feImage: y([ "class", "externalResourcesRequired", "height", "id", "preserveAspectRatio", "result", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMerge: y([ "class", "height", "id", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feMergeNode: y([ "id", "xml:base", "xml:lang", "xml:space" ]),
            feMorphology: y([ "class", "height", "id", "in", "operator", "radius", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feOffset: y([ "class", "dx", "dy", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            fePointLight: y([ "id", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feSpecularLighting: y([ "class", "height", "id", "in", "kernelUnitLength", "result", "specularConstant", "specularExponent", "style", "surfaceScale", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feSpotLight: y([ "id", "limitingConeAngle", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "x", "xml:base", "xml:lang", "xml:space", "y", "z" ]),
            feTile: y([ "class", "height", "id", "in", "result", "style", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            feTurbulence: y([ "baseFrequency", "class", "height", "id", "numOctaves", "result", "seed", "stitchTiles", "style", "type", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            filter: y([ "class", "externalResourcesRequired", "filterRes", "filterUnits", "height", "id", "primitiveUnits", "style", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            font: y([ "class", "externalResourcesRequired", "horiz-adv-x", "horiz-origin-x", "horiz-origin-y", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            "font-face": y([ "accent-height", "alphabetic", "ascent", "bbox", "cap-height", "descent", "font-family", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "hanging", "id", "ideographic", "mathematical", "overline-position", "overline-thickness", "panose-1", "slope", "stemh", "stemv", "strikethrough-position", "strikethrough-thickness", "underline-position", "underline-thickness", "unicode-range", "units-per-em", "v-alphabetic", "v-hanging", "v-ideographic", "v-mathematical", "widths", "x-height", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-format": y([ "id", "string", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-name": y([ "id", "name", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-src": y([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "font-face-uri": y([ "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            foreignObject: y([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            g: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            glyph: y([ "arabic-form", "class", "d", "glyph-name", "horiz-adv-x", "id", "lang", "orientation", "style", "unicode", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            glyphRef: y([ "class", "dx", "dy", "format", "glyphRef", "id", "style", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            glyphref: g(),
            hkern: y([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ]),
            image: y([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            line: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "x1", "x2", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            linearGradient: y([ "class", "externalResourcesRequired", "gradientTransform", "gradientUnits", "id", "spreadMethod", "style", "x1", "x2", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y1", "y2" ]),
            marker: y([ "class", "externalResourcesRequired", "id", "markerHeight", "markerUnits", "markerWidth", "orient", "preserveAspectRatio", "refX", "refY", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            mask: y([ "class", "externalResourcesRequired", "height", "id", "maskContentUnits", "maskUnits", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            metadata: y([ "id", "xml:base", "xml:lang", "xml:space" ]),
            "missing-glyph": y([ "class", "d", "horiz-adv-x", "id", "style", "vert-adv-y", "vert-origin-x", "vert-origin-y", "xml:base", "xml:lang", "xml:space" ]),
            mpath: y([ "externalResourcesRequired", "id", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            path: y([ "class", "d", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "pathLength", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            pattern: y([ "class", "externalResourcesRequired", "height", "id", "patternContentUnits", "patternTransform", "patternUnits", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "viewBox", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            polygon: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            polyline: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "points", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            radialGradient: y([ "class", "cx", "cy", "externalResourcesRequired", "fx", "fy", "gradientTransform", "gradientUnits", "id", "r", "spreadMethod", "style", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            rect: y([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rx", "ry", "style", "systemLanguage", "transform", "width", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            script: y([ "externalResourcesRequired", "id", "type", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            set: y([ "attributeName", "attributeType", "begin", "dur", "end", "externalResourcesRequired", "fill", "id", "max", "min", "onbegin", "onend", "onload", "onrepeat", "repeatCount", "repeatDur", "requiredExtensions", "requiredFeatures", "restart", "systemLanguage", "to", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            stop: y([ "class", "id", "offset", "style", "xml:base", "xml:lang", "xml:space" ]),
            style: y([ "id", "media", "title", "type", "xml:base", "xml:lang", "xml:space" ]),
            svg: y([ "baseProfile", "class", "contentScriptType", "contentStyleType", "externalResourcesRequired", "height", "id", "onabort", "onactivate", "onclick", "onerror", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onresize", "onscroll", "onunload", "onzoom", "preserveAspectRatio", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "version", "viewBox", "width", "x", "xml:base", "xml:lang", "xml:space", "y", "zoomAndPan" ]),
            switch: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "xml:base", "xml:lang", "xml:space" ]),
            symbol: y([ "class", "externalResourcesRequired", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "preserveAspectRatio", "style", "viewBox", "xml:base", "xml:lang", "xml:space" ]),
            text: y([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "transform", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            textPath: y([ "class", "externalResourcesRequired", "id", "lengthAdjust", "method", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "spacing", "startOffset", "style", "systemLanguage", "textLength", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space" ]),
            title: y([ "class", "id", "style", "xml:base", "xml:lang", "xml:space" ]),
            tref: y([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            tspan: y([ "class", "dx", "dy", "externalResourcesRequired", "id", "lengthAdjust", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "rotate", "style", "systemLanguage", "textLength", "x", "xml:base", "xml:lang", "xml:space", "y" ]),
            use: y([ "class", "externalResourcesRequired", "height", "id", "onactivate", "onclick", "onfocusin", "onfocusout", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "requiredExtensions", "requiredFeatures", "style", "systemLanguage", "transform", "width", "x", "xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space", "y" ]),
            view: y([ "externalResourcesRequired", "id", "preserveAspectRatio", "viewBox", "viewTarget", "xml:base", "xml:lang", "xml:space", "zoomAndPan" ]),
            vkern: y([ "g1", "g2", "id", "k", "u1", "u2", "xml:base", "xml:lang", "xml:space" ])
        });
        this.svgPresentationElements = y([ "a", "altGlyph", "animate", "animateColor", "circle", "clipPath", "defs", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood", "feGaussianBlur", "feImage", "feMerge", "feMorphology", "feOffset", "feSpecularLighting", "feTile", "feTurbulence", "filter", "font", "foreignObject", "g", "glyph", "glyphRef", "image", "line", "linearGradient", "marker", "mask", "missing-glyph", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tref", "tspan", "use" ]);
        this.svgPresentationAttributes = y([ "alignment-baseline", "baseline-shift", "clip-path", "clip-rule", "clip", "color-interpolation-filters", "color-interpolation", "color-profile", "color-rendering", "color", "cursor", "direction", "display", "dominant-baseline", "enable-background", "fill-opacity", "fill-rule", "fill", "filter", "flood-color", "flood-opacity", "font-family", "font-size-adjust", "font-size", "font-stretch", "font-style", "font-variant", "font-weight", "glyph-orientation-horizontal", "glyph-orientation-vertical", "image-rendering", "kerning", "letter-spacing", "lighting-color", "marker-end", "marker-mid", "marker-start", "mask", "opacity", "overflow", "pointer-events", "shape-rendering", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "stroke", "text-anchor", "text-decoration", "text-rendering", "unicode-bidi", "visibility", "word-spacing", "writing-mode" ]);
        this.SVGElement = t.globalThis.SVGElement;
        const e = t.document.createElement("div");
        e.innerHTML = "<svg><altGlyph /></svg>";
        if ("altglyph" === e.firstElementChild.nodeName) {
            const t = this.svgElements;
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
        return i.Registration.singleton(w, this).register(t);
    }
    isStandardSvgAttribute(t, e) {
        var i;
        if (!(t instanceof this.SVGElement)) return false;
        return true === this.svgPresentationElements[t.nodeName] && true === this.svgPresentationAttributes[e] || true === (null === (i = this.svgElements[t.nodeName]) || void 0 === i ? void 0 : i[e]);
    }
}

SVGAnalyzer.inject = [ b ];

const k = i.DI.createInterface("IAttrMapper", (t => t.singleton(AttrMapper)));

class AttrMapper {
    constructor(t) {
        this.svg = t;
        this.fns = [];
        this.tagAttrMap = g();
        this.globalAttrMap = g();
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
        return [ w ];
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
            n = null !== (e = (i = this.tagAttrMap)[r]) && void 0 !== e ? e : i[r] = g();
            for (o in s) {
                if (void 0 !== n[o]) throw A(o, r);
                n[o] = s[o];
            }
        }
    }
    useGlobalMapping(t) {
        const e = this.globalAttrMap;
        for (const i in t) {
            if (void 0 !== e[i]) throw A(i, "*");
            e[i] = t[i];
        }
    }
    useTwoWay(t) {
        this.fns.push(t);
    }
    isTwoWay(t, e) {
        return C(t, e) || this.fns.length > 0 && this.fns.some((i => i(t, e)));
    }
    map(t, e) {
        var i, s, n;
        return null !== (n = null !== (s = null === (i = this.tagAttrMap[t.nodeName]) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : this.globalAttrMap[e]) && void 0 !== n ? n : v(t, e, this.svg) ? e : null;
    }
}

function C(t, e) {
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

function A(t, e) {
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
    constructor(t, e, i, s, n) {
        this.platform = t;
        this.observerLocator = e;
        this.obj = i;
        this.propertyKey = s;
        this.targetAttribute = n;
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
            S(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) E(this.obj, this);
    }
    flush() {
        T = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, T, this.f);
    }
}

s.subscriberCollection(AttributeObserver);

s.withFlushQueue(AttributeObserver);

const S = (t, e, i) => {
    if (void 0 === e.$eMObservers) e.$eMObservers = new Set;
    if (void 0 === e.$mObserver) (e.$mObserver = new t(O)).observe(e, {
        attributes: true
    });
    e.$eMObservers.add(i);
};

const E = (t, e) => {
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

const O = t => {
    t[0].target.$eMObservers.forEach(B, t);
};

function B(t) {
    t.handleMutation(this);
}

let T;

class BindingTargetSubscriber {
    constructor(t) {
        this.b = t;
    }
    handleChange(t, e, i) {
        const s = this.b;
        if (t !== s.sourceExpression.evaluate(i, s.$scope, s.locator, null)) s.updateSource(t, i);
    }
}

const {oneTime: I, toView: R, fromView: D} = s.BindingMode;

const j = R | I;

const $ = {
    reusable: false,
    preempt: true
};

class AttributeBinding {
    constructor(t, e, i, s, n, r, o) {
        this.sourceExpression = t;
        this.targetAttribute = i;
        this.targetProperty = s;
        this.mode = n;
        this.observerLocator = r;
        this.locator = o;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = null;
        this.task = null;
        this.targetSubscriber = null;
        this.persistentFlags = 0;
        this.value = void 0;
        this.target = e;
        this.$platform = o.get(b);
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
        let u = false;
        let c;
        if (10082 !== r.$kind || this.obs.count > 1) {
            u = 0 === (s & I);
            if (u) this.obs.version++;
            t = r.evaluate(i, o, l, n);
            if (u) this.obs.clear(false);
        }
        if (t !== this.value) {
            this.value = t;
            if (a) {
                c = this.task;
                this.task = this.$platform.domWriteQueue.queueTask((() => {
                    this.task = null;
                    n.updateTarget(t, i);
                }), $);
                null === c || void 0 === c ? void 0 : c.cancel();
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
        if (!n) n = this.targetObserver = new AttributeObserver(this.$platform, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
        s = this.sourceExpression;
        const r = this.mode;
        const o = this.interceptor;
        let l = false;
        if (r & j) {
            l = (r & R) > 0;
            o.updateTarget(this.value = s.evaluate(t, e, this.locator, l ? o : null), t);
        }
        if (r & D) n.subscribe(null !== (i = this.targetSubscriber) && void 0 !== i ? i : this.targetSubscriber = new BindingTargetSubscriber(o));
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

const {toView: P} = s.BindingMode;

const L = {
    reusable: false,
    preempt: true
};

class InterpolationBinding {
    constructor(t, e, i, s, n, r, o) {
        this.observerLocator = t;
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
        this.targetObserver = t.getAccessor(i, s);
        const l = e.expressions;
        const h = this.partBindings = Array(l.length);
        const a = l.length;
        let u = 0;
        for (;a > u; ++u) h[u] = new InterpolationPartBinding(l[u], i, s, r, t, this);
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
            }), L);
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
    constructor(t, e, i, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.locator = n;
        this.observerLocator = r;
        this.owner = o;
        this.interceptor = this;
        this.mode = s.BindingMode.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
    }
    handleChange(t, e, i) {
        if (!this.isBound) return;
        const s = this.sourceExpression;
        const n = this.obs;
        const r = 10082 === s.$kind && 1 === n.count;
        let o = false;
        if (!r) {
            o = (this.mode & P) > 0;
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
        this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & P) > 0 ? this.interceptor : null);
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
        this.observerLocator = n;
        this.p = r;
        this.strict = o;
        this.interceptor = this;
        this.mode = s.BindingMode.toView;
        this.value = "";
        this.task = null;
        this.isBound = false;
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
            l = (this.mode & P) > 0;
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
        const i = this.value = this.sourceExpression.evaluate(t, e, this.locator, (this.mode & P) > 0 ? this.interceptor : null);
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
        }), L);
        null === i || void 0 === i ? void 0 : i.cancel();
    }
}

s.connectable(ContentBinding);

class LetBinding {
    constructor(t, e, i, s, n = false) {
        this.sourceExpression = t;
        this.targetProperty = e;
        this.observerLocator = i;
        this.locator = s;
        this.toBindingContext = n;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.task = null;
        this.target = null;
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

const {oneTime: q, toView: M, fromView: V} = s.BindingMode;

const F = M | q;

const N = {
    reusable: false,
    preempt: true
};

class PropertyBinding {
    constructor(t, e, i, s, n, r, o) {
        this.sourceExpression = t;
        this.target = e;
        this.targetProperty = i;
        this.mode = s;
        this.observerLocator = n;
        this.locator = r;
        this.taskQueue = o;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.targetObserver = void 0;
        this.persistentFlags = 0;
        this.task = null;
        this.targetSubscriber = null;
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
        let u = false;
        if (10082 !== r.$kind || a.count > 1) {
            u = this.mode > q;
            if (u) a.version++;
            t = r.evaluate(i, o, l, n);
            if (u) a.clear(false);
        }
        if (h) {
            H = this.task;
            this.task = this.taskQueue.queueTask((() => {
                n.updateTarget(t, i);
                this.task = null;
            }), N);
            null === H || void 0 === H ? void 0 : H.cancel();
            H = null;
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
        const n = this.observerLocator;
        const r = this.mode;
        let o = this.targetObserver;
        if (!o) {
            if (r & V) o = n.getObserver(this.target, this.targetProperty); else o = n.getAccessor(this.target, this.targetProperty);
            this.targetObserver = o;
        }
        s = this.sourceExpression;
        const l = this.interceptor;
        const h = (r & M) > 0;
        if (r & F) l.updateTarget(s.evaluate(t, e, this.locator, h ? l : null), t);
        if (r & V) {
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
        H = this.task;
        if (this.targetSubscriber) this.targetObserver.unsubscribe(this.targetSubscriber);
        if (null != H) {
            H.cancel();
            H = this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}

s.connectable(PropertyBinding);

let H = null;

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

const U = Object.freeze({
    beforeCreate: W("beforeCreate"),
    hydrating: W("hydrating"),
    hydrated: W("hydrated"),
    beforeActivate: W("beforeActivate"),
    afterActivate: W("afterActivate"),
    beforeDeactivate: W("beforeDeactivate"),
    afterDeactivate: W("afterDeactivate")
});

function W(t) {
    function e(e, i) {
        if ("function" === typeof i) return new $AppTask(t, e, i);
        return new $AppTask(t, null, e);
    }
    return e;
}

function G(t, e) {
    let s;
    function n(t, e) {
        if (arguments.length > 1) s.property = e;
        i.Metadata.define(X.name, ChildrenDefinition.create(e, s), t.constructor, e);
        i.Protocol.annotation.appendTo(t.constructor, X.keyFrom(e));
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

function K(t) {
    return t.startsWith(X.name);
}

const X = {
    name: i.Protocol.annotation.keyFor("children-observer"),
    keyFrom(t) {
        return `${X.name}:${t}`;
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
        const e = X.name.length + 1;
        const s = [];
        const n = i.getPrototypeChain(t);
        let r = n.length;
        let o = 0;
        let l;
        let h;
        let a;
        while (--r >= 0) {
            a = n[r];
            l = i.Protocol.annotation.getKeys(a).filter(K);
            h = l.length;
            for (let t = 0; t < h; ++t) s[o++] = i.Metadata.getOwn(X.name, a, l[t].slice(e));
        }
        return s;
    }
};

const Y = {
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
        return new ChildrenDefinition(i.firstDefined(e.callback, `${t}Changed`), i.firstDefined(e.property, t), null !== (s = e.options) && void 0 !== s ? s : Y, e.query, e.filter, e.map);
    }
}

exports.ChildrenObserver = class ChildrenObserver {
    constructor(t, e, i, s, n = Q, r = _, o = Z, l) {
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
                this.onChildrenChanged();
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
    onChildrenChanged() {
        this.children = this.get();
        if (void 0 !== this.callback) this.callback.call(this.obj);
        this.subs.notify(this.children, void 0, 0);
    }
    get() {
        return tt(this.controller, this.query, this.filter, this.map);
    }
};

exports.ChildrenObserver = n([ s.subscriberCollection() ], exports.ChildrenObserver);

function Q(t) {
    return t.host.childNodes;
}

function _(t, e, i) {
    return !!i;
}

function Z(t, e, i) {
    return i;
}

const J = {
    optional: true
};

function tt(t, e, i, s) {
    var n;
    const r = e(t);
    const o = r.length;
    const l = [];
    let h;
    let a;
    let u;
    let c = 0;
    for (;c < o; ++c) {
        h = r[c];
        a = ft.for(h, J);
        u = null !== (n = null === a || void 0 === a ? void 0 : a.viewModel) && void 0 !== n ? n : null;
        if (i(h, a, u)) l.push(s(h, a, u));
    }
    return l;
}

function et(t) {
    return function(e) {
        return st.define(t, e);
    };
}

function it(t) {
    return function(e) {
        return st.define("string" === typeof t ? {
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
        return new CustomAttributeDefinition(e, i.firstDefined(st.getAnnotation(e, "name"), n), i.mergeArrays(st.getAnnotation(e, "aliases"), r.aliases, e.aliases), st.keyFrom(n), i.firstDefined(st.getAnnotation(e, "defaultBindingMode"), r.defaultBindingMode, e.defaultBindingMode, s.BindingMode.toView), i.firstDefined(st.getAnnotation(e, "isTemplateController"), r.isTemplateController, e.isTemplateController, false), h.from(...h.getAll(e), st.getAnnotation(e, "bindables"), e.bindables, r.bindables), i.firstDefined(st.getAnnotation(e, "noMultiBindings"), r.noMultiBindings, e.noMultiBindings, false), i.mergeArrays(ot.getAnnotation(e), e.watches));
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        i.Registration.transient(n, e).register(t);
        i.Registration.aliasTo(n, e).register(t);
        s.registerAliases(r, st, n, t);
    }
}

const st = {
    name: i.Protocol.resource.keyFor("custom-attribute"),
    keyFrom(t) {
        return `${st.name}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && i.Metadata.hasOwn(st.name, t);
    },
    for(t, e) {
        var i;
        return null !== (i = he(t, st.keyFrom(e))) && void 0 !== i ? i : void 0;
    },
    define(t, e) {
        const s = CustomAttributeDefinition.create(t, e);
        i.Metadata.define(st.name, s, s.Type);
        i.Metadata.define(st.name, s, s);
        i.Protocol.resource.appendTo(e, st.name);
        return s.Type;
    },
    getDefinition(t) {
        const e = i.Metadata.getOwn(st.name, t);
        if (void 0 === e) throw new Error(`No definition found for type ${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        i.Metadata.define(i.Protocol.annotation.keyFor(e), s, t);
    },
    getAnnotation(t, e) {
        return i.Metadata.getOwn(i.Protocol.annotation.keyFor(e), t);
    }
};

function nt(t, e) {
    if (!t) throw new Error("Invalid watch config. Expected an expression or a fn");
    return function i(s, n, r) {
        const o = null == n;
        const l = o ? s : s.constructor;
        const h = new WatchDefinition(t, o ? e : r.value);
        if (o) {
            if ("function" !== typeof e && (null == e || !(e in l.prototype))) throw new Error(`Invalid change handler config. Method "${String(e)}" not found in class ${l.name}`);
        } else if ("function" !== typeof (null === r || void 0 === r ? void 0 : r.value)) throw new Error(`decorated target ${String(n)} is not a class method.`);
        ot.add(l, h);
        if (st.isType(l)) st.getDefinition(l).watches.push(h);
        if (ft.isType(l)) ft.getDefinition(l).watches.push(h);
    };
}

class WatchDefinition {
    constructor(t, e) {
        this.expression = t;
        this.callback = e;
    }
}

const rt = i.emptyArray;

const ot = {
    name: i.Protocol.annotation.keyFor("watch"),
    add(t, e) {
        let s = i.Metadata.getOwn(ot.name, t);
        if (null == s) i.Metadata.define(ot.name, s = [], t);
        s.push(e);
    },
    getAnnotation(t) {
        var e;
        return null !== (e = i.Metadata.getOwn(ot.name, t)) && void 0 !== e ? e : rt;
    }
};

function lt(t) {
    return function(e) {
        return ft.define(t, e);
    };
}

function ht(t) {
    if (void 0 === t) return function(t) {
        ft.annotate(t, "shadowOptions", {
            mode: "open"
        });
    };
    if ("function" !== typeof t) return function(e) {
        ft.annotate(e, "shadowOptions", t);
    };
    ft.annotate(t, "shadowOptions", {
        mode: "open"
    });
}

function at(t) {
    if (void 0 === t) return function(t) {
        ft.annotate(t, "containerless", true);
    };
    ft.annotate(t, "containerless", true);
}

const ut = new WeakMap;

class CustomElementDefinition {
    constructor(t, e, i, s, n, r, o, l, h, a, u, c, f, d, p, m, x, v, g, b) {
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
        this.surrogates = u;
        this.bindables = c;
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
            if ("string" === typeof s) throw new Error(`Cannot create a custom element definition with only a name and no type: ${t}`);
            const n = i.fromDefinitionOrDefault("name", s, ft.generateName);
            if ("function" === typeof s.Type) e = s.Type; else e = ft.generateType(i.pascalCase(n));
            return new CustomElementDefinition(e, n, i.mergeArrays(s.aliases), i.fromDefinitionOrDefault("key", s, (() => ft.keyFrom(n))), i.fromDefinitionOrDefault("cache", s, (() => 0)), i.fromDefinitionOrDefault("template", s, (() => null)), i.mergeArrays(s.instructions), i.mergeArrays(s.dependencies), i.fromDefinitionOrDefault("injectable", s, (() => null)), i.fromDefinitionOrDefault("needsCompile", s, (() => true)), i.mergeArrays(s.surrogates), h.from(s.bindables), X.from(s.childrenObservers), i.fromDefinitionOrDefault("containerless", s, (() => false)), i.fromDefinitionOrDefault("isStrictBinding", s, (() => false)), i.fromDefinitionOrDefault("shadowOptions", s, (() => null)), i.fromDefinitionOrDefault("hasSlots", s, (() => false)), i.fromDefinitionOrDefault("enhance", s, (() => false)), i.fromDefinitionOrDefault("watches", s, (() => i.emptyArray)), i.fromAnnotationOrTypeOrDefault("processContent", e, (() => null)));
        }
        if ("string" === typeof t) return new CustomElementDefinition(e, t, i.mergeArrays(ft.getAnnotation(e, "aliases"), e.aliases), ft.keyFrom(t), i.fromAnnotationOrTypeOrDefault("cache", e, (() => 0)), i.fromAnnotationOrTypeOrDefault("template", e, (() => null)), i.mergeArrays(ft.getAnnotation(e, "instructions"), e.instructions), i.mergeArrays(ft.getAnnotation(e, "dependencies"), e.dependencies), i.fromAnnotationOrTypeOrDefault("injectable", e, (() => null)), i.fromAnnotationOrTypeOrDefault("needsCompile", e, (() => true)), i.mergeArrays(ft.getAnnotation(e, "surrogates"), e.surrogates), h.from(...h.getAll(e), ft.getAnnotation(e, "bindables"), e.bindables), X.from(...X.getAll(e), ft.getAnnotation(e, "childrenObservers"), e.childrenObservers), i.fromAnnotationOrTypeOrDefault("containerless", e, (() => false)), i.fromAnnotationOrTypeOrDefault("isStrictBinding", e, (() => false)), i.fromAnnotationOrTypeOrDefault("shadowOptions", e, (() => null)), i.fromAnnotationOrTypeOrDefault("hasSlots", e, (() => false)), i.fromAnnotationOrTypeOrDefault("enhance", e, (() => false)), i.mergeArrays(ot.getAnnotation(e), e.watches), i.fromAnnotationOrTypeOrDefault("processContent", e, (() => null)));
        const s = i.fromDefinitionOrDefault("name", t, ft.generateName);
        return new CustomElementDefinition(e, s, i.mergeArrays(ft.getAnnotation(e, "aliases"), t.aliases, e.aliases), ft.keyFrom(s), i.fromAnnotationOrDefinitionOrTypeOrDefault("cache", t, e, (() => 0)), i.fromAnnotationOrDefinitionOrTypeOrDefault("template", t, e, (() => null)), i.mergeArrays(ft.getAnnotation(e, "instructions"), t.instructions, e.instructions), i.mergeArrays(ft.getAnnotation(e, "dependencies"), t.dependencies, e.dependencies), i.fromAnnotationOrDefinitionOrTypeOrDefault("injectable", t, e, (() => null)), i.fromAnnotationOrDefinitionOrTypeOrDefault("needsCompile", t, e, (() => true)), i.mergeArrays(ft.getAnnotation(e, "surrogates"), t.surrogates, e.surrogates), h.from(...h.getAll(e), ft.getAnnotation(e, "bindables"), e.bindables, t.bindables), X.from(...X.getAll(e), ft.getAnnotation(e, "childrenObservers"), e.childrenObservers, t.childrenObservers), i.fromAnnotationOrDefinitionOrTypeOrDefault("containerless", t, e, (() => false)), i.fromAnnotationOrDefinitionOrTypeOrDefault("isStrictBinding", t, e, (() => false)), i.fromAnnotationOrDefinitionOrTypeOrDefault("shadowOptions", t, e, (() => null)), i.fromAnnotationOrDefinitionOrTypeOrDefault("hasSlots", t, e, (() => false)), i.fromAnnotationOrDefinitionOrTypeOrDefault("enhance", t, e, (() => false)), i.mergeArrays(t.watches, ot.getAnnotation(e), e.watches), i.fromAnnotationOrDefinitionOrTypeOrDefault("processContent", t, e, (() => null)));
    }
    static getOrCreate(t) {
        if (t instanceof CustomElementDefinition) return t;
        if (ut.has(t)) return ut.get(t);
        const e = CustomElementDefinition.create(t);
        ut.set(t, e);
        i.Metadata.define(ft.name, e, e.Type);
        return e;
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        if (!t.has(n, false)) {
            i.Registration.transient(n, e).register(t);
            i.Registration.aliasTo(n, e).register(t);
            s.registerAliases(r, ft, n, t);
        }
    }
}

const ct = {
    name: void 0,
    searchParents: false,
    optional: false
};

const ft = {
    name: i.Protocol.resource.keyFor("custom-element"),
    keyFrom(t) {
        return `${ft.name}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && i.Metadata.hasOwn(ft.name, t);
    },
    for(t, e = ct) {
        if (void 0 === e.name && true !== e.searchParents) {
            const i = he(t, ft.name);
            if (null === i) {
                if (true === e.optional) return null;
                throw new Error(`The provided node is not a custom element or containerless host.`);
            }
            return i;
        }
        if (void 0 !== e.name) {
            if (true !== e.searchParents) {
                const i = he(t, ft.name);
                if (null === i) throw new Error(`The provided node is not a custom element or containerless host.`);
                if (i.is(e.name)) return i;
                return;
            }
            let i = t;
            let s = false;
            while (null !== i) {
                const t = he(i, ft.name);
                if (null !== t) {
                    s = true;
                    if (t.is(e.name)) return t;
                }
                i = pe(i);
            }
            if (s) return;
            throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
        }
        let i = t;
        while (null !== i) {
            const t = he(i, ft.name);
            if (null !== t) return t;
            i = pe(i);
        }
        throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
    },
    define(t, e) {
        const s = CustomElementDefinition.create(t, e);
        i.Metadata.define(ft.name, s, s.Type);
        i.Metadata.define(ft.name, s, s);
        i.Protocol.resource.appendTo(s.Type, ft.name);
        return s.Type;
    },
    getDefinition(t) {
        const e = i.Metadata.getOwn(ft.name, t);
        if (void 0 === e) throw new Error(`No definition found for type ${t.name}`);
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
};

const dt = i.Protocol.annotation.keyFor("processContent");

function pt(t) {
    return void 0 === t ? function(t, e, s) {
        i.Metadata.define(dt, mt(t, e), t);
    } : function(e) {
        t = mt(e, t);
        const s = i.Metadata.getOwn(ft.name, e);
        if (void 0 !== s) s.processContent = t; else i.Metadata.define(dt, t, e);
        return e;
    };
}

function mt(t, e) {
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
            const s = xt(t);
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

function xt(t) {
    if ("string" === typeof t) return vt(t);
    if ("object" !== typeof t) return i.emptyArray;
    if (t instanceof Array) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            for (let s = 0; s < e; ++s) i.push(...xt(t[s]));
            return i;
        } else return i.emptyArray;
    }
    const e = [];
    for (const i in t) if (Boolean(t[i])) if (i.includes(" ")) e.push(...vt(i)); else e.push(i);
    return e;
}

function vt(t) {
    const e = t.match(/\S+/g);
    if (null === e) return i.emptyArray;
    return e;
}

function gt(...t) {
    return new CSSModulesProcessorRegistry(t);
}

class CSSModulesProcessorRegistry {
    constructor(t) {
        this.modules = t;
    }
    register(t) {
        var e;
        const i = Object.assign({}, ...this.modules);
        const s = st.define({
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
                this.element.className = xt(this.value).map((t => i[t] || t)).join(" ");
            }
        }, e.inject = [ ue ], e));
        t.register(s);
    }
}

function bt(...t) {
    return new ShadowDOMRegistry(t);
}

const wt = i.DI.createInterface("IShadowDOMStyleFactory", (t => t.cachedCallback((t => {
    if (AdoptedStyleSheetsStyles.supported(t.get(b))) return t.get(yt);
    return t.get(kt);
}))));

class ShadowDOMRegistry {
    constructor(t) {
        this.css = t;
    }
    register(t) {
        const e = t.get(At);
        const s = t.get(wt);
        t.register(i.Registration.instance(Ct, s.createStyles(this.css, e)));
    }
}

let yt = class AdoptedStyleSheetsStylesFactory {
    constructor(t) {
        this.p = t;
        this.cache = new Map;
    }
    createStyles(t, e) {
        return new AdoptedStyleSheetsStyles(this.p, t, this.cache, e);
    }
};

yt = n([ r(0, b) ], yt);

let kt = class StyleElementStylesFactory {
    constructor(t) {
        this.p = t;
    }
    createStyles(t, e) {
        return new StyleElementStyles(this.p, t, e);
    }
};

kt = n([ r(0, b) ], kt);

const Ct = i.DI.createInterface("IShadowDOMStyles");

const At = i.DI.createInterface("IShadowDOMGlobalStyles", (t => t.instance({
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

const St = {
    shadowDOM(t) {
        return U.beforeCreate(i.IContainer, (e => {
            if (null != t.sharedStyles) {
                const s = e.get(wt);
                e.register(i.Registration.instance(At, s.createStyles(t.sharedStyles, null)));
            }
        }));
    }
};

const {enter: Et, exit: Ot} = s.ConnectableSwitcher;

const {wrap: Bt, unwrap: Tt} = s.ProxyObservable;

class ComputedWatcher {
    constructor(t, e, i, s, n) {
        this.obj = t;
        this.observerLocator = e;
        this.get = i;
        this.cb = s;
        this.useProxy = n;
        this.interceptor = this;
        this.value = void 0;
        this.isBound = false;
        this.running = false;
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
            Et(this);
            return this.value = Tt(this.get.call(void 0, this.useProxy ? Bt(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            Ot(this);
        }
    }
}

class ExpressionWatcher {
    constructor(t, e, i, s, n) {
        this.scope = t;
        this.locator = e;
        this.observerLocator = i;
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

const It = i.DI.createInterface("ILifecycleHooks");

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
        i.Registration.singleton(It, this.Type).register(t);
    }
}

const Rt = new WeakMap;

const Dt = {
    name: i.Protocol.annotation.keyFor("lifecycle-hooks"),
    define(t, e) {
        const s = LifecycleHooksDefinition.create(t, e);
        i.Metadata.define(Dt.name, s, e);
        i.Protocol.resource.appendTo(e, Dt.name);
        return s.Type;
    },
    resolve(t) {
        let e = Rt.get(t);
        if (void 0 === e) {
            e = new LifecycleHooksLookupImpl;
            const s = t.root;
            const n = s.id === t.id ? t.getAll(It) : t.has(It, false) ? [ ...s.getAll(It), ...t.getAll(It) ] : s.getAll(It);
            let r;
            let o;
            let l;
            let h;
            let a;
            for (r of n) {
                o = i.Metadata.getOwn(Dt.name, r.constructor);
                l = new LifecycleHooksEntry(o, r);
                for (h of o.propertyNames) {
                    a = e[h];
                    if (void 0 === a) e[h] = [ l ]; else a.push(l);
                }
            }
        }
        return e;
    }
};

class LifecycleHooksLookupImpl {}

function jt() {
    return function t(e) {
        return Dt.define({}, e);
    };
}

const $t = i.DI.createInterface("IViewFactory");

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
        s = Controller.forSyntheticView(this, t, e);
        return s;
    }
}

ViewFactory.maxCacheSize = 65535;

const Pt = new WeakSet;

function Lt(t) {
    return !Pt.has(t);
}

function qt(t) {
    Pt.add(t);
    return CustomElementDefinition.create(t);
}

const Mt = {
    name: i.Protocol.resource.keyFor("views"),
    has(t) {
        return "function" === typeof t && (i.Metadata.hasOwn(Mt.name, t) || "$views" in t);
    },
    get(t) {
        if ("function" === typeof t && "$views" in t) {
            const e = t.$views;
            const i = e.filter(Lt).map(qt);
            for (const e of i) Mt.add(t, e);
        }
        let e = i.Metadata.getOwn(Mt.name, t);
        if (void 0 === e) i.Metadata.define(Mt.name, e = [], t);
        return e;
    },
    add(t, e) {
        const s = CustomElementDefinition.create(e);
        let n = i.Metadata.getOwn(Mt.name, t);
        if (void 0 === n) i.Metadata.define(Mt.name, n = [ s ], t); else n.push(s);
        return n;
    }
};

function Vt(t) {
    return function(e) {
        Mt.add(e, t);
    };
}

const Ft = i.DI.createInterface("IViewLocator", (t => t.singleton(ViewLocator)));

class ViewLocator {
    constructor() {
        this.modelInstanceToBoundComponent = new WeakMap;
        this.modelTypeToUnboundComponent = new Map;
    }
    getViewComponentForObject(t, e) {
        if (t) {
            const i = Mt.has(t.constructor) ? Mt.get(t.constructor) : [];
            const s = "function" === typeof e ? e(t, i) : this.getViewName(i, e);
            return this.getOrCreateBoundComponent(t, i, s);
        }
        return null;
    }
    getOrCreateBoundComponent(t, e, i) {
        let s = this.modelInstanceToBoundComponent.get(t);
        let n;
        if (void 0 === s) {
            s = {};
            this.modelInstanceToBoundComponent.set(t, s);
        } else n = s[i];
        if (void 0 === n) {
            const r = this.getOrCreateUnboundComponent(t, e, i);
            n = ft.define(ft.getDefinition(r), class extends r {
                constructor() {
                    super(t);
                }
            });
            s[i] = n;
        }
        return n;
    }
    getOrCreateUnboundComponent(t, e, i) {
        let n = this.modelTypeToUnboundComponent.get(t.constructor);
        let r;
        if (void 0 === n) {
            n = {};
            this.modelTypeToUnboundComponent.set(t.constructor, n);
        } else r = n[i];
        if (void 0 === r) {
            r = ft.define(this.getView(e, i), class {
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
    getViewName(t, e) {
        if (e) return e;
        if (1 === t.length) return t[0].name;
        return "default-view";
    }
    getView(t, e) {
        const i = t.find((t => t.name === e));
        if (void 0 === i) throw new Error(`Could not find view: ${e}`);
        return i;
    }
}

const Nt = i.DI.createInterface("IRendering", (t => t.singleton(Rendering)));

class Rendering {
    constructor(t) {
        this.compilationCache = new WeakMap;
        this.fragmentCache = new WeakMap;
        this.p = (this.c = t.root).get(b);
        this.empty = new FragmentNodeSequence(this.p, this.p.document.createDocumentFragment());
    }
    get renderers() {
        return null == this.rs ? this.rs = this.c.getAll(Te, false).reduce(((t, e) => {
            t[e.instructionType] = e;
            return t;
        }), g()) : this.rs;
    }
    compile(t, e, i) {
        if (false !== t.needsCompile) {
            const s = this.compilationCache;
            const n = e.get(Be);
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
        if (true === t.enhance) return new FragmentNodeSequence(this.p, t.template);
        let e;
        const i = this.fragmentCache;
        if (i.has(t)) e = i.get(t); else {
            const s = this.p;
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
        return null == e ? this.empty : new FragmentNodeSequence(this.p, e.cloneNode(true));
    }
    render(t, e, i, s, n) {
        const r = s.instructions;
        const o = this.renderers;
        const l = i.length;
        if (i.length !== r.length) throw new Error(`The compiled template is not aligned with the render instructions. There are ${l} targets and ${r.length} instructions.`);
        let h = 0;
        let a = 0;
        let u = 0;
        let c;
        let f;
        let d;
        if (l > 0) while (l > h) {
            c = r[h];
            d = i[h];
            a = 0;
            u = c.length;
            while (u > a) {
                f = c[a];
                o[f.type].render(t, e, d, f);
                ++a;
            }
            ++h;
        }
        if (void 0 !== n && null !== n) {
            c = s.surrogates;
            if ((u = c.length) > 0) {
                a = 0;
                while (u > a) {
                    f = c[a];
                    o[f.type].render(t, e, n, f);
                    ++a;
                }
            }
        }
    }
}

Rendering.inject = [ i.IContainer ];

var Ht;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["host"] = 1] = "host";
    t[t["shadowRoot"] = 2] = "shadowRoot";
    t[t["location"] = 3] = "location";
})(Ht || (Ht = {}));

const zt = {
    optional: true
};

const Ut = new WeakMap;

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
        this.logger = null;
        this.debug = false;
        this.fullyNamed = false;
        this.childrenObs = i.emptyArray;
        this.$initiator = null;
        this.$flags = 0;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.activatingStack = 0;
        this.detachingStack = 0;
        this.unbindingStack = 0;
        this.r = t.root.get(Nt);
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
        return Ut.get(t);
    }
    static getCachedOrThrow(t) {
        const e = Controller.getCached(t);
        if (void 0 === e) throw new Error(`There is no cached controller for the provided ViewModel: ${String(t)}`);
        return e;
    }
    static forCustomElement(t, e, s, n, r = 0, o = void 0) {
        if (Ut.has(e)) return Ut.get(e);
        o = null !== o && void 0 !== o ? o : ft.getDefinition(e.constructor);
        const l = new Controller(t, 0, r, o, null, e, s);
        const h = t.get(i.optional(se));
        if (o.dependencies.length > 0) t.register(...o.dependencies);
        t.registerResolver(se, new i.InstanceProvider("IHydrationContext", new HydrationContext(l, n, h)));
        Ut.set(e, l);
        if (null == n || false !== n.hydrate) l.hydrateCustomElement(n, h);
        return l;
    }
    static forCustomAttribute(t, e, i, s = 0, n) {
        if (Ut.has(e)) return Ut.get(e);
        n = null !== n && void 0 !== n ? n : st.getDefinition(e.constructor);
        const r = new Controller(t, 1, s, n, null, e, i);
        Ut.set(e, r);
        r.hydrateCustomAttribute();
        return r;
    }
    static forSyntheticView(t, e = 0, i = void 0) {
        const s = new Controller(t.container, 2, e, null, t, null, null);
        s.parent = null !== i && void 0 !== i ? i : null;
        s.hydrateSynthetic();
        return s;
    }
    hydrateCustomElement(t, e) {
        this.logger = this.container.get(i.ILogger).root;
        this.debug = this.logger.config.level <= 1;
        if (this.debug) this.logger = this.logger.scopeTo(this.name);
        const n = this.container;
        const r = this.flags;
        const o = this.viewModel;
        let l = this.definition;
        this.scope = s.Scope.create(o, null, true);
        if (l.watches.length > 0) Qt(this, n, l, o);
        Gt(this, l, r, o);
        this.childrenObs = Kt(this, l, r, o);
        if (this.hooks.hasDefine) {
            if (this.debug) this.logger.trace(`invoking define() hook`);
            const t = o.define(this, e, l);
            if (void 0 !== t && t !== l) l = CustomElementDefinition.getOrCreate(t);
        }
        this.lifecycleHooks = Dt.resolve(n);
        l.register(n);
        if (null !== l.injectable) n.registerResolver(l.injectable, new i.InstanceProvider("definition.injectable", o));
        if (null == t || false !== t.hydrate) {
            this.hydrate(t);
            this.hydrateChildren();
        }
    }
    hydrate(t) {
        if (this.hooks.hasHydrating) {
            if (this.debug) this.logger.trace(`invoking hydrating() hook`);
            this.viewModel.hydrating(this);
        }
        const e = this.compiledDef = this.r.compile(this.definition, this.container, t);
        const {shadowOptions: i, isStrictBinding: s, hasSlots: n, containerless: r} = e;
        this.isStrictBinding = s;
        if (null !== (this.hostController = ft.for(this.host, zt))) this.host = this.container.root.get(b).document.createElement(this.definition.name);
        ae(this.host, ft.name, this);
        ae(this.host, this.definition.key, this);
        if (null !== i || n) {
            if (r) throw new Error("You cannot combine the containerless custom element option with Shadow DOM.");
            ae(this.shadowRoot = this.host.attachShadow(null !== i && void 0 !== i ? i : Jt), ft.name, this);
            ae(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2;
        } else if (r) {
            ae(this.location = xe(this.host), ft.name, this);
            ae(this.location, this.definition.key, this);
            this.mountTarget = 3;
        } else this.mountTarget = 1;
        this.viewModel.$controller = this;
        this.nodes = this.r.createNodes(e);
        if (this.hooks.hasHydrated) {
            if (this.debug) this.logger.trace(`invoking hydrated() hook`);
            this.viewModel.hydrated(this);
        }
    }
    hydrateChildren() {
        this.r.render(this.flags, this, this.nodes.findTargets(), this.compiledDef, this.host);
        if (this.hooks.hasCreated) {
            if (this.debug) this.logger.trace(`invoking created() hook`);
            this.viewModel.created(this);
        }
    }
    hydrateCustomAttribute() {
        const t = this.definition;
        const e = this.viewModel;
        if (t.watches.length > 0) Qt(this, this.container, t, e);
        Gt(this, t, this.flags, e);
        e.$controller = this;
        this.lifecycleHooks = Dt.resolve(this.container);
        if (this.hooks.hasCreated) {
            if (this.debug) this.logger.trace(`invoking created() hook`);
            this.viewModel.created(this);
        }
    }
    hydrateSynthetic() {
        this.compiledDef = this.r.compile(this.viewFactory.def, this.container, null);
        this.isStrictBinding = this.compiledDef.isStrictBinding;
        this.r.render(this.flags, this, (this.nodes = this.r.createNodes(this.compiledDef)).findTargets(), this.compiledDef, void 0);
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
            throw new Error(`${this.name} trying to activate a controller that is disposed.`);

          default:
            throw new Error(`${this.name} unexpected state: ${ee(this.state)}.`);
        }
        this.parent = e;
        if (this.debug && !this.fullyNamed) {
            this.fullyNamed = true;
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
            if (void 0 === n || null === n) throw new Error(`Scope is null or undefined`);
            if (!this.hasLockedScope) this.scope = n;
            break;
        }
        if (this.isStrictBinding) s |= 1;
        this.$initiator = t;
        this.$flags = s;
        this.enterActivating();
        if (this.hooks.hasBinding) {
            if (this.debug) this.logger.trace(`binding()`);
            const t = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (t instanceof Promise) {
                this.ensurePromise();
                t.then((() => {
                    this.bind();
                })).catch((t => {
                    this.reject(t);
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
        let e = this.childrenObs.length;
        let i;
        if (e > 0) while (e > t) {
            this.childrenObs[t].start();
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
                this.ensurePromise();
                i.then((() => {
                    this.isBound = true;
                    this.attach();
                })).catch((t => {
                    this.reject(t);
                }));
                return;
            }
        }
        this.isBound = true;
        this.attach();
    }
    append(...t) {
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
    attach() {
        var t;
        if (this.debug) this.logger.trace(`attach()`);
        if (null !== this.hostController) switch (this.mountTarget) {
          case 1:
          case 2:
            this.hostController.append(this.host);
            break;

          case 3:
            this.hostController.append(this.location.$start, this.location);
            break;
        }
        switch (this.mountTarget) {
          case 1:
            this.nodes.appendTo(this.host, null === (t = this.definition) || void 0 === t ? void 0 : t.enhance);
            break;

          case 2:
            {
                const t = this.container;
                const e = t.has(Ct, false) ? t.get(Ct) : t.get(At);
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
                this.ensurePromise();
                this.enterActivating();
                t.then((() => {
                    this.leaveActivating();
                })).catch((t => {
                    this.reject(t);
                }));
            }
        }
        if (null !== this.children) {
            let t = 0;
            for (;t < this.children.length; ++t) void this.children[t].activate(this.$initiator, this, this.$flags, this.scope);
        }
        this.leaveActivating();
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
            throw new Error(`${this.name} unexpected state: ${ee(this.state)}.`);
        }
        if (this.debug) this.logger.trace(`deactivate()`);
        this.$initiator = t;
        this.$flags = i;
        if (t === this) this.enterDetaching();
        let s = 0;
        if (this.childrenObs.length) for (;s < this.childrenObs.length; ++s) this.childrenObs[s].stop();
        if (null !== this.children) for (s = 0; s < this.children.length; ++s) void this.children[s].deactivate(t, this, i);
        if (this.hooks.hasDetaching) {
            if (this.debug) this.logger.trace(`detaching()`);
            const e = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (e instanceof Promise) {
                this.ensurePromise();
                t.enterDetaching();
                e.then((() => {
                    t.leaveDetaching();
                })).catch((e => {
                    t.reject(e);
                }));
            }
        }
        if (null === t.head) t.head = this; else t.tail.next = this;
        t.tail = this;
        if (t !== this) return;
        this.leaveDetaching();
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
        this.resolve();
    }
    ensurePromise() {
        if (void 0 === this.$promise) {
            this.$promise = new Promise(((t, e) => {
                this.$resolve = t;
                this.$reject = e;
            }));
            if (this.$initiator !== this) this.parent.ensurePromise();
        }
    }
    resolve() {
        if (void 0 !== this.$promise) {
            const t = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            t();
        }
    }
    reject(t) {
        if (void 0 !== this.$promise) {
            const e = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            e(t);
        }
        if (this.$initiator !== this) this.parent.reject(t);
    }
    enterActivating() {
        ++this.activatingStack;
        if (this.$initiator !== this) this.parent.enterActivating();
    }
    leaveActivating() {
        if (0 === --this.activatingStack) {
            if (this.hooks.hasAttached) {
                if (this.debug) this.logger.trace(`attached()`);
                const t = this.viewModel.attached(this.$initiator, this.$flags);
                if (t instanceof Promise) {
                    this.ensurePromise();
                    t.then((() => {
                        this.state = 2;
                        this.resolve();
                        if (this.$initiator !== this) this.parent.leaveActivating();
                    })).catch((t => {
                        this.reject(t);
                    }));
                    return;
                }
            }
            this.state = 2;
            this.resolve();
        }
        if (this.$initiator !== this) this.parent.leaveActivating();
    }
    enterDetaching() {
        ++this.detachingStack;
    }
    leaveDetaching() {
        if (0 === --this.detachingStack) {
            if (this.debug) this.logger.trace(`detach()`);
            this.enterUnbinding();
            this.removeNodes();
            let t = this.$initiator.head;
            while (null !== t) {
                if (t !== this) {
                    if (t.debug) t.logger.trace(`detach()`);
                    t.removeNodes();
                }
                if (t.hooks.hasUnbinding) {
                    if (t.debug) t.logger.trace("unbinding()");
                    const e = t.viewModel.unbinding(t.$initiator, t.parent, t.$flags);
                    if (e instanceof Promise) {
                        this.ensurePromise();
                        this.enterUnbinding();
                        e.then((() => {
                            this.leaveUnbinding();
                        })).catch((t => {
                            this.reject(t);
                        }));
                    }
                }
                t = t.next;
            }
            this.leaveUnbinding();
        }
    }
    enterUnbinding() {
        ++this.unbindingStack;
    }
    leaveUnbinding() {
        if (0 === --this.unbindingStack) {
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
            return st.getDefinition(this.viewModel.constructor).name === t;

          case 0:
            return ft.getDefinition(this.viewModel.constructor).name === t;

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
            ae(t, ft.name, this);
            ae(t, this.definition.key, this);
        }
        this.host = t;
        this.mountTarget = 1;
        return this;
    }
    setShadowRoot(t) {
        if (0 === this.vmKind) {
            ae(t, ft.name, this);
            ae(t, this.definition.key, this);
        }
        this.shadowRoot = t;
        this.mountTarget = 2;
        return this;
    }
    setLocation(t) {
        if (0 === this.vmKind) {
            ae(t, ft.name, this);
            ae(t, this.definition.key, this);
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
            this.children.forEach(ne);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.location = null;
        this.viewFactory = null;
        if (null !== this.viewModel) {
            Ut.delete(this.viewModel);
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

function Wt(t) {
    let e = t.$observers;
    if (void 0 === e) Reflect.defineProperty(t, "$observers", {
        enumerable: false,
        value: e = {}
    });
    return e;
}

function Gt(t, e, i, s) {
    const n = e.bindables;
    const r = Object.getOwnPropertyNames(n);
    const o = r.length;
    if (o > 0) {
        let e;
        let i;
        let l = 0;
        const h = Wt(s);
        for (;l < o; ++l) {
            e = r[l];
            if (void 0 === h[e]) {
                i = n[e];
                h[e] = new BindableObserver(s, e, i.callback, i.set, t);
            }
        }
    }
}

function Kt(t, e, s, n) {
    const r = e.childrenObservers;
    const o = Object.getOwnPropertyNames(r);
    const l = o.length;
    if (l > 0) {
        const e = Wt(n);
        const i = [];
        let s;
        let h = 0;
        let a;
        for (;h < l; ++h) {
            s = o[h];
            if (void 0 == e[s]) {
                a = r[s];
                i[i.length] = e[s] = new exports.ChildrenObserver(t, n, s, a.callback, a.query, a.filter, a.map, a.options);
            }
        }
        return i;
    }
    return i.emptyArray;
}

const Xt = new Map;

const Yt = t => {
    let e = Xt.get(t);
    if (null == e) {
        e = new s.AccessScopeExpression(t, 0);
        Xt.set(t, e);
    }
    return e;
};

function Qt(t, e, i, n) {
    const r = e.get(s.IObserverLocator);
    const o = e.get(s.IExpressionParser);
    const l = i.watches;
    const h = 0 === t.vmKind ? t.scope : s.Scope.create(n, null, true);
    const a = l.length;
    let u;
    let c;
    let f;
    let d = 0;
    for (;a > d; ++d) {
        ({expression: u, callback: c} = l[d]);
        c = "function" === typeof c ? c : Reflect.get(n, c);
        if ("function" !== typeof c) throw new Error(`Invalid callback for @watch decorator: ${String(c)}`);
        if ("function" === typeof u) t.addBinding(new ComputedWatcher(n, r, u, c, true)); else {
            f = "string" === typeof u ? o.parse(u, 53) : Yt(u);
            t.addBinding(new ExpressionWatcher(h, e, r, f, c));
        }
    }
}

function _t(t) {
    return t instanceof Controller && 0 === t.vmKind;
}

function Zt(t) {
    return i.isObject(t) && ft.isType(t.constructor);
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

const Jt = {
    mode: "open"
};

exports.ViewModelKind = void 0;

(function(t) {
    t[t["customElement"] = 0] = "customElement";
    t[t["customAttribute"] = 1] = "customAttribute";
    t[t["synthetic"] = 2] = "synthetic";
})(exports.ViewModelKind || (exports.ViewModelKind = {}));

var te;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["activating"] = 1] = "activating";
    t[t["activated"] = 2] = "activated";
    t[t["deactivating"] = 4] = "deactivating";
    t[t["deactivated"] = 8] = "deactivated";
    t[t["released"] = 16] = "released";
    t[t["disposed"] = 32] = "disposed";
})(te || (te = {}));

function ee(t) {
    const e = [];
    if (1 === (1 & t)) e.push("activating");
    if (2 === (2 & t)) e.push("activated");
    if (4 === (4 & t)) e.push("deactivating");
    if (8 === (8 & t)) e.push("deactivated");
    if (16 === (16 & t)) e.push("released");
    if (32 === (32 & t)) e.push("disposed");
    return 0 === e.length ? "none" : e.join("|");
}

const ie = i.DI.createInterface("IController");

const se = i.DI.createInterface("IHydrationContext");

class HydrationContext {
    constructor(t, e, i) {
        this.instruction = e;
        this.parent = i;
        this.controller = t;
    }
}

function ne(t) {
    t.dispose();
}

const re = i.DI.createInterface("IAppRoot");

const oe = i.DI.createInterface("IWorkTracker", (t => t.singleton(le)));

let le = class WorkTracker {
    constructor(t) {
        this.logger = t;
        this.stack = 0;
        this.promise = null;
        this.resolve = null;
        this.logger = t.scopeTo("WorkTracker");
    }
    start() {
        this.logger.trace(`start(stack:${this.stack})`);
        ++this.stack;
    }
    finish() {
        this.logger.trace(`finish(stack:${this.stack})`);
        if (0 === --this.stack) {
            const t = this.resolve;
            if (null !== t) {
                this.resolve = this.promise = null;
                t();
            }
        }
    }
    wait() {
        this.logger.trace(`wait(stack:${this.stack})`);
        if (null === this.promise) {
            if (0 === this.stack) return Promise.resolve();
            this.promise = new Promise((t => {
                this.resolve = t;
            }));
        }
        return this.promise;
    }
};

le = n([ r(0, i.ILogger) ], le);

class AppRoot {
    constructor(t, e, s, n) {
        this.config = t;
        this.platform = e;
        this.container = s;
        this.controller = void 0;
        this.hydratePromise = void 0;
        this.host = t.host;
        this.work = s.get(oe);
        n.prepare(this);
        s.registerResolver(ue, s.registerResolver(e.Element, new i.InstanceProvider("ElementProvider", t.host)));
        this.hydratePromise = i.onResolve(this.runAppTasks("beforeCreate"), (() => {
            const e = t.component;
            const n = s.createChild();
            let r;
            if (ft.isType(e)) r = this.container.get(e); else r = t.component;
            const o = {
                hydrate: false,
                projections: null
            };
            const l = this.controller = Controller.forCustomElement(n, r, this.host, o, 0);
            l.hydrateCustomElement(o, null);
            return i.onResolve(this.runAppTasks("hydrating"), (() => {
                l.hydrate(null);
                return i.onResolve(this.runAppTasks("hydrated"), (() => {
                    l.hydrateChildren();
                    this.hydratePromise = void 0;
                }));
            }));
        }));
    }
    activate() {
        return i.onResolve(this.hydratePromise, (() => i.onResolve(this.runAppTasks("beforeActivate"), (() => i.onResolve(this.controller.activate(this.controller, null, 2, void 0), (() => this.runAppTasks("afterActivate")))))));
    }
    deactivate() {
        return i.onResolve(this.runAppTasks("beforeDeactivate"), (() => i.onResolve(this.controller.deactivate(this.controller, null, 0), (() => this.runAppTasks("afterDeactivate")))));
    }
    runAppTasks(t) {
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

function he(t, e) {
    var i, s;
    return null !== (s = null === (i = t.$au) || void 0 === i ? void 0 : i[e]) && void 0 !== s ? s : null;
}

function ae(t, e, i) {
    var s;
    var n;
    (null !== (s = (n = t).$au) && void 0 !== s ? s : n.$au = new Refs)[e] = i;
}

const ue = i.DI.createInterface("INode");

const ce = i.DI.createInterface("IEventTarget", (t => t.cachedCallback((t => {
    if (t.has(re, true)) return t.get(re).host;
    return t.get(b).document;
}))));

const fe = i.DI.createInterface("IRenderLocation");

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

const de = new WeakMap;

function pe(t) {
    if (de.has(t)) return de.get(t);
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
        const e = ft.for(t);
        if (void 0 === e) return null;
        if (2 === e.mountTarget) return pe(e.host);
    }
    return t.parentNode;
}

function me(t, e) {
    if (void 0 !== t.platform && !(t instanceof t.platform.Node)) {
        const i = t.childNodes;
        for (let t = 0, s = i.length; t < s; ++t) de.set(i[t], e);
    } else de.set(t, e);
}

function xe(t) {
    if (ve(t)) return t;
    const e = t.ownerDocument.createComment("au-end");
    const i = t.ownerDocument.createComment("au-start");
    if (null !== t.parentNode) {
        t.parentNode.replaceChild(e, t);
        e.parentNode.insertBefore(i, e);
    }
    e.$start = i;
    return e;
}

function ve(t) {
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
            if ("AU-M" === r.nodeName) o[s] = xe(r); else o[s] = r;
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
        if (ve(t)) this.refNode = t; else {
            this.next = t;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (void 0 !== this.next) this.refNode = this.next.firstChild; else this.refNode = void 0;
    }
}

const ge = i.DI.createInterface("IWindow", (t => t.callback((t => t.get(b).window))));

const be = i.DI.createInterface("ILocation", (t => t.callback((t => t.get(ge).location))));

const we = i.DI.createInterface("IHistory", (t => t.callback((t => t.get(ge).history))));

const ye = {
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
        if (this.delegationStrategy === s.DelegationStrategy.none) this.target.addEventListener(this.targetEvent, this); else this.handler = this.eventDelegator.addEventListener(this.locator.get(ce), this.target, this.targetEvent, this, ye[this.delegationStrategy]);
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

const ke = {
    capture: false
};

class ListenerTracker {
    constructor(t, e, i = ke) {
        this.publisher = t;
        this.eventName = e;
        this.options = i;
        this.count = 0;
        this.captureLookups = new Map;
        this.bubbleLookups = new Map;
    }
    increment() {
        if (1 === ++this.count) this.publisher.addEventListener(this.eventName, this, this.options);
    }
    decrement() {
        if (0 === --this.count) this.publisher.removeEventListener(this.eventName, this, this.options);
    }
    dispose() {
        if (this.count > 0) {
            this.count = 0;
            this.publisher.removeEventListener(this.eventName, this, this.options);
        }
        this.captureLookups.clear();
        this.bubbleLookups.clear();
    }
    getLookup(t) {
        const e = true === this.options.capture ? this.captureLookups : this.bubbleLookups;
        let i = e.get(t);
        if (void 0 === i) e.set(t, i = Object.create(null));
        return i;
    }
    handleEvent(t) {
        const e = true === this.options.capture ? this.captureLookups : this.bubbleLookups;
        const i = t.composedPath();
        if (true === this.options.capture) i.reverse();
        for (const s of i) {
            const i = e.get(s);
            if (void 0 === i) continue;
            const n = i[this.eventName];
            if (void 0 === n) continue;
            if ("function" === typeof n) n(t); else n.handleEvent(t);
            if (true === t.cancelBubble) return;
        }
    }
}

class DelegateSubscription {
    constructor(t, e, i, s) {
        this.tracker = t;
        this.lookup = e;
        this.eventName = i;
        t.increment();
        e[i] = s;
    }
    dispose() {
        this.tracker.decrement();
        this.lookup[this.eventName] = void 0;
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
        if (null !== t && null !== e) for (const i of this.config.events) t.removeEventListener(i, e);
        this.target = this.handler = null;
    }
}

const Ce = i.DI.createInterface("IEventDelegator", (t => t.singleton(EventDelegator)));

class EventDelegator {
    constructor() {
        this.trackerMaps = Object.create(null);
    }
    addEventListener(t, e, i, s, n) {
        var r;
        var o;
        const l = null !== (r = (o = this.trackerMaps)[i]) && void 0 !== r ? r : o[i] = new Map;
        let h = l.get(t);
        if (void 0 === h) l.set(t, h = new ListenerTracker(t, i, n));
        return new DelegateSubscription(h, h.getLookup(e), i, s);
    }
    dispose() {
        for (const t in this.trackerMaps) {
            const e = this.trackerMaps[t];
            for (const t of e.values()) t.dispose();
            e.clear();
        }
    }
}

const Ae = i.DI.createInterface("IProjections");

const Se = i.DI.createInterface("IAuSlotsInfo");

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

const Ee = i.DI.createInterface("Instruction");

function Oe(t) {
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
        this.instructions = i;
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
        this.instructions = i;
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
        this.instructions = s;
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

const Be = i.DI.createInterface("ITemplateCompiler");

const Te = i.DI.createInterface("IRenderer");

function Ie(t) {
    return function e(s) {
        const n = function(...e) {
            const i = new s(...e);
            i.instructionType = t;
            return i;
        };
        n.register = function t(e) {
            i.Registration.singleton(Te, n).register(e);
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

function Re(t, e, i) {
    if ("string" === typeof e) return t.parse(e, i);
    return e;
}

function De(t) {
    if (null != t.viewModel) return t.viewModel;
    return t;
}

function je(t, e) {
    if ("element" === e) return t;
    switch (e) {
      case "controller":
        return ft.for(t);

      case "view":
        throw new Error("Not supported API");

      case "view-model":
        return ft.for(t).viewModel;

      default:
        {
            const i = st.for(t, e);
            if (void 0 !== i) return i.viewModel;
            const s = ft.for(t, {
                name: e
            });
            if (void 0 === s) throw new Error(`Attempted to reference "${e}", but it was not found amongst the target's API.`);
            return s.viewModel;
        }
    }
}

let $e = class SetPropertyRenderer {
    render(t, e, i, s) {
        const n = De(i);
        if (void 0 !== n.$observers && void 0 !== n.$observers[s.to]) n.$observers[s.to].setValue(s.value, 2); else n[s.to] = s.value;
    }
};

$e = n([ Ie("re") ], $e);

let Pe = class CustomElementRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Nt, b ];
    }
    render(t, e, s, n) {
        let r;
        let o;
        let l;
        let h;
        const a = n.res;
        const u = n.projections;
        const c = e.container;
        const f = oi(this.p, e, s, n, s, null == u ? void 0 : new AuSlotsInfo(Object.keys(u)));
        switch (typeof a) {
          case "string":
            r = c.find(ft, a);
            if (null == r) throw new Error(`Element ${a} is not registered in ${e["name"]}.`);
            break;

          default:
            r = a;
        }
        o = r.Type;
        l = f.invoke(o);
        f.registerResolver(o, new i.InstanceProvider(r.key, l));
        h = Controller.forCustomElement(f, l, s, n, t, r);
        t = h.flags;
        ae(s, r.key, h);
        const d = this.r.renderers;
        const p = n.instructions;
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

Pe = n([ Ie("ra") ], Pe);

let Le = class CustomAttributeRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Nt, b ];
    }
    render(t, e, i, s) {
        let n = e.container;
        let r;
        switch (typeof s.res) {
          case "string":
            r = n.find(st, s.res);
            if (null == r) throw new Error(`Attribute ${s.res} is not registered in ${e["name"]}.`);
            break;

          default:
            r = s.res;
        }
        const o = li(this.p, r, e, i, s, void 0, void 0);
        const l = Controller.forCustomAttribute(e.container, o, i, t, r);
        ae(i, r.key, l);
        const h = this.r.renderers;
        const a = s.instructions;
        const u = a.length;
        let c = 0;
        let f;
        while (u > c) {
            f = a[c];
            h[f.type].render(t, e, l, f);
            ++c;
        }
        e.addChild(l);
    }
};

Le = n([ Ie("rb") ], Le);

let qe = class TemplateControllerRenderer {
    constructor(t, e) {
        this.r = t;
        this.p = e;
    }
    static get inject() {
        return [ Nt, b ];
    }
    render(t, e, i, s) {
        var n;
        let r = e.container;
        let o;
        switch (typeof s.res) {
          case "string":
            o = r.find(st, s.res);
            if (null == o) throw new Error(`Attribute ${s.res} is not registered in ${e["name"]}.`);
            break;

          default:
            o = s.res;
        }
        const l = this.r.getViewFactory(s.def, r);
        const h = xe(i);
        const a = li(this.p, o, e, i, s, l, h);
        const u = Controller.forCustomAttribute(e.container, a, i, t, o);
        ae(h, o.key, u);
        null === (n = a.link) || void 0 === n ? void 0 : n.call(a, t, e, u, i, s);
        const c = this.r.renderers;
        const f = s.instructions;
        const d = f.length;
        let p = 0;
        let m;
        while (d > p) {
            m = f[p];
            c[m.type].render(t, e, u, m);
            ++p;
        }
        e.addChild(u);
    }
};

qe = n([ Ie("rc") ], qe);

let Me = class LetElementRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, s) {
        i.remove();
        const n = s.instructions;
        const r = s.toBindingContext;
        const o = e.container;
        let l;
        let h;
        let a;
        for (let t = 0, i = n.length; t < i; ++t) {
            l = n[t];
            h = Re(this.parser, l.from, 48);
            a = new LetBinding(h, l.to, this.oL, o, r);
            e.addBinding(38962 === h.$kind ? Ge(a, h, o) : a);
        }
    }
};

Me = n([ Ie("rd"), r(0, s.IExpressionParser), r(1, s.IObserverLocator) ], Me);

let Ve = class CallBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.observerLocator = e;
    }
    render(t, e, i, s) {
        const n = Re(this.parser, s.from, 153);
        const r = new CallBinding(n, De(i), s.to, this.observerLocator, e.container);
        e.addBinding(38962 === n.$kind ? Ge(r, n, e.container) : r);
    }
};

Ve = n([ Ie("rh"), r(0, s.IExpressionParser), r(1, s.IObserverLocator) ], Ve);

let Fe = class RefBindingRenderer {
    constructor(t) {
        this.parser = t;
    }
    render(t, e, i, s) {
        const n = Re(this.parser, s.from, 5376);
        const r = new RefBinding(n, je(i, s.to), e.container);
        e.addBinding(38962 === n.$kind ? Ge(r, n, e.container) : r);
    }
};

Fe = n([ Ie("rj"), r(0, s.IExpressionParser) ], Fe);

let Ne = class InterpolationBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, n) {
        const r = e.container;
        const o = Re(this.parser, n.from, 2048);
        const l = new InterpolationBinding(this.oL, o, De(i), n.to, s.BindingMode.toView, r, this.p.domWriteQueue);
        const h = l.partBindings;
        const a = h.length;
        let u = 0;
        let c;
        for (;a > u; ++u) {
            c = h[u];
            if (38962 === c.sourceExpression.$kind) h[u] = Ge(c, c.sourceExpression, r);
        }
        e.addBinding(l);
    }
};

Ne = n([ Ie("rf"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, b) ], Ne);

let He = class PropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Re(this.parser, s.from, 48 | s.mode);
        const r = new PropertyBinding(n, De(i), s.to, s.mode, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === n.$kind ? Ge(r, n, e.container) : r);
    }
};

He = n([ Ie("rg"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, b) ], He);

let ze = class IteratorBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, n) {
        const r = Re(this.parser, n.from, 539);
        const o = new PropertyBinding(r, De(i), n.to, s.BindingMode.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(o);
    }
};

ze = n([ Ie("rk"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, b) ], ze);

let Ue = 0;

const We = [];

function Ge(t, e, i) {
    while (e instanceof s.BindingBehaviorExpression) {
        We[Ue++] = e;
        e = e.expression;
    }
    while (Ue > 0) {
        const e = We[--Ue];
        const n = i.get(e.behaviorKey);
        if (n instanceof s.BindingBehaviorFactory) t = n.construct(t, e);
    }
    We.length = 0;
    return t;
}

let Ke = class TextBindingRenderer {
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
        const h = Re(this.parser, s.from, 2048);
        const a = h.parts;
        const u = h.expressions;
        const c = u.length;
        let f = 0;
        let d = a[0];
        let p;
        let m;
        if ("" !== d) o.insertBefore(l.createTextNode(d), r);
        for (;c > f; ++f) {
            m = u[f];
            p = new ContentBinding(m, o.insertBefore(l.createTextNode(""), r), n, this.oL, this.p, s.strict);
            e.addBinding(38962 === m.$kind ? Ge(p, m, n) : p);
            d = a[f + 1];
            if ("" !== d) o.insertBefore(l.createTextNode(d), r);
        }
        if ("AU-M" === i.nodeName) i.remove();
    }
};

Ke = n([ Ie("ha"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, b) ], Ke);

let Xe = class ListenerBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.eventDelegator = e;
        this.p = i;
    }
    render(t, e, i, s) {
        const n = Re(this.parser, s.from, 80 | s.strategy + 6);
        const r = new Listener(this.p, s.to, s.strategy, n, i, s.preventDefault, this.eventDelegator, e.container);
        e.addBinding(38962 === n.$kind ? Ge(r, n, e.container) : r);
    }
};

Xe = n([ Ie("hb"), r(0, s.IExpressionParser), r(1, Ce), r(2, b) ], Xe);

let Ye = class SetAttributeRenderer {
    render(t, e, i, s) {
        i.setAttribute(s.to, s.value);
    }
};

Ye = n([ Ie("he") ], Ye);

let Qe = class SetClassAttributeRenderer {
    render(t, e, i, s) {
        ti(i.classList, s.value);
    }
};

Qe = n([ Ie("hf") ], Qe);

let _e = class SetStyleAttributeRenderer {
    render(t, e, i, s) {
        i.style.cssText += s.value;
    }
};

_e = n([ Ie("hg") ], _e);

let Ze = class StylePropertyBindingRenderer {
    constructor(t, e, i) {
        this.parser = t;
        this.oL = e;
        this.p = i;
    }
    render(t, e, i, n) {
        const r = Re(this.parser, n.from, 48 | s.BindingMode.toView);
        const o = new PropertyBinding(r, i.style, n.to, s.BindingMode.toView, this.oL, e.container, this.p.domWriteQueue);
        e.addBinding(38962 === r.$kind ? Ge(o, r, e.container) : o);
    }
};

Ze = n([ Ie("hd"), r(0, s.IExpressionParser), r(1, s.IObserverLocator), r(2, b) ], Ze);

let Je = class AttributeBindingRenderer {
    constructor(t, e) {
        this.parser = t;
        this.oL = e;
    }
    render(t, e, i, n) {
        const r = Re(this.parser, n.from, 48 | s.BindingMode.toView);
        const o = new AttributeBinding(r, i, n.attr, n.to, s.BindingMode.toView, this.oL, e.container);
        e.addBinding(38962 === r.$kind ? Ge(o, r, e.container) : o);
    }
};

Je = n([ Ie("hc"), r(0, s.IExpressionParser), r(1, s.IObserverLocator) ], Je);

function ti(t, e) {
    const i = e.length;
    let s = 0;
    for (let n = 0; n < i; ++n) if (32 === e.charCodeAt(n)) {
        if (n !== s) t.add(e.slice(s, n));
        s = n + 1;
    } else if (n + 1 === i) t.add(e.slice(s));
}

const ei = "ElementProvider";

const ii = "IController";

const si = "IInstruction";

const ni = "IRenderLocation";

const ri = "IAuSlotsInfo";

function oi(t, e, s, n, r, o) {
    const l = e.container.createChild();
    l.registerResolver(t.Element, l.registerResolver(ue, new i.InstanceProvider(ei, s)));
    l.registerResolver(ie, new i.InstanceProvider(ii, e));
    l.registerResolver(Ee, new i.InstanceProvider(si, n));
    l.registerResolver(fe, null == r ? hi : new i.InstanceProvider(ni, r));
    l.registerResolver($t, ai);
    l.registerResolver(Se, null == o ? ui : new i.InstanceProvider(ri, o));
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
        if (null === t) throw new Error("Cannot resolve ViewFactory before the provider was prepared.");
        if ("string" !== typeof t.name || 0 === t.name.length) throw new Error("Cannot resolve ViewFactory without a (valid) name.");
        return t;
    }
}

function li(t, e, s, n, r, o, l, h) {
    const a = s.container.createChild();
    a.registerResolver(t.Element, a.registerResolver(ue, new i.InstanceProvider(ei, n)));
    a.registerResolver(ie, new i.InstanceProvider(ii, s));
    a.registerResolver(Ee, new i.InstanceProvider(si, r));
    a.registerResolver(fe, null == l ? hi : new i.InstanceProvider(ni, l));
    a.registerResolver($t, null == o ? ai : new ViewFactoryProvider(o));
    a.registerResolver(Se, null == h ? ui : new i.InstanceProvider(ri, h));
    return a.invoke(e.Type);
}

const hi = new i.InstanceProvider(ni);

const ai = new ViewFactoryProvider(null);

const ui = new i.InstanceProvider(ri, new AuSlotsInfo(i.emptyArray));

function ci(t) {
    return function(e) {
        return fi.define(t, e);
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
        return new BindingCommandDefinition(e, i.firstDefined(fi.getAnnotation(e, "name"), s), i.mergeArrays(fi.getAnnotation(e, "aliases"), n.aliases, e.aliases), fi.keyFrom(s), i.firstDefined(fi.getAnnotation(e, "type"), n.type, e.type, null));
    }
    register(t) {
        const {Type: e, key: n, aliases: r} = this;
        i.Registration.singleton(n, e).register(t);
        i.Registration.aliasTo(n, e).register(t);
        s.registerAliases(r, fi, n, t);
    }
}

const fi = {
    name: i.Protocol.resource.keyFor("binding-command"),
    keyFrom(t) {
        return `${fi.name}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && i.Metadata.hasOwn(fi.name, t);
    },
    define(t, e) {
        const s = BindingCommandDefinition.create(t, e);
        i.Metadata.define(fi.name, s, s.Type);
        i.Metadata.define(fi.name, s, s);
        i.Protocol.resource.appendTo(e, fi.name);
        return s.Type;
    },
    getDefinition(t) {
        const e = i.Metadata.getOwn(fi.name, t);
        if (void 0 === e) throw new Error(`No definition found for type ${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        i.Metadata.define(i.Protocol.annotation.keyFor(e), s, t);
    },
    getAnnotation(t, e) {
        return i.Metadata.getOwn(i.Protocol.annotation.keyFor(e), t);
    }
};

exports.OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 49;
    }
    static get inject() {
        return [ k ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.oneTime);
    }
};

exports.OneTimeBindingCommand = n([ ci("one-time") ], exports.OneTimeBindingCommand);

exports.ToViewBindingCommand = class ToViewBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 50;
    }
    static get inject() {
        return [ k ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.toView);
    }
};

exports.ToViewBindingCommand = n([ ci("to-view") ], exports.ToViewBindingCommand);

exports.FromViewBindingCommand = class FromViewBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 51;
    }
    static get inject() {
        return [ k ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.fromView);
    }
};

exports.FromViewBindingCommand = n([ ci("from-view") ], exports.FromViewBindingCommand);

exports.TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 52;
    }
    static get inject() {
        return [ k ];
    }
    build(t) {
        var e;
        let n;
        if (null == t.bindable) n = null !== (e = this.m.map(t.node, t.attr.target)) && void 0 !== e ? e : i.camelCase(t.attr.target); else n = t.bindable.property;
        return new PropertyBindingInstruction(t.expr, n, s.BindingMode.twoWay);
    }
};

exports.TwoWayBindingCommand = n([ ci("two-way") ], exports.TwoWayBindingCommand);

exports.DefaultBindingCommand = class DefaultBindingCommand {
    constructor(t) {
        this.m = t;
        this.bindingType = 53;
    }
    static get inject() {
        return [ k ];
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

exports.DefaultBindingCommand = n([ ci("bind") ], exports.DefaultBindingCommand);

exports.CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153;
    }
    build(t) {
        const e = null === t.bindable ? i.camelCase(t.attr.target) : t.bindable.property;
        return new CallBindingInstruction(t.expr, e);
    }
};

exports.CallBindingCommand = n([ ci("call") ], exports.CallBindingCommand);

exports.ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539;
    }
    build(t) {
        const e = null === t.bindable ? i.camelCase(t.attr.target) : t.bindable.property;
        return new IteratorBindingInstruction(t.expr, e);
    }
};

exports.ForBindingCommand = n([ ci("for") ], exports.ForBindingCommand);

exports.TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, true, s.DelegationStrategy.none);
    }
};

exports.TriggerBindingCommand = n([ ci("trigger") ], exports.TriggerBindingCommand);

exports.DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, false, s.DelegationStrategy.bubbling);
    }
};

exports.DelegateBindingCommand = n([ ci("delegate") ], exports.DelegateBindingCommand);

exports.CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183;
    }
    build(t) {
        return new ListenerBindingInstruction(t.expr, t.attr.target, false, s.DelegationStrategy.capturing);
    }
};

exports.CaptureBindingCommand = n([ ci("capture") ], exports.CaptureBindingCommand);

exports.AttrBindingCommand = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction(t.attr.target, t.expr, t.attr.target);
    }
};

exports.AttrBindingCommand = n([ ci("attr") ], exports.AttrBindingCommand);

exports.StyleBindingCommand = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("style", t.expr, t.attr.target);
    }
};

exports.StyleBindingCommand = n([ ci("style") ], exports.StyleBindingCommand);

exports.ClassBindingCommand = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new AttributeBindingInstruction("class", t.expr, t.attr.target);
    }
};

exports.ClassBindingCommand = n([ ci("class") ], exports.ClassBindingCommand);

let di = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 | 4096;
    }
    build(t) {
        return new RefBindingInstruction(t.expr, t.attr.target);
    }
};

di = n([ ci("ref") ], di);

const pi = i.DI.createInterface("ITemplateElementFactory", (t => t.singleton(TemplateElementFactory)));

const mi = {};

class TemplateElementFactory {
    constructor(t) {
        this.p = t;
        this.template = t.document.createElement("template");
    }
    createTemplate(t) {
        var e;
        if ("string" === typeof t) {
            let e = mi[t];
            if (void 0 === e) {
                const i = this.template;
                i.innerHTML = t;
                const s = i.content.firstElementChild;
                if (null == s || "TEMPLATE" !== s.nodeName || null != s.nextElementSibling) {
                    this.template = this.p.document.createElement("template");
                    e = i;
                } else {
                    i.content.removeChild(s);
                    e = s;
                }
                mi[t] = e;
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

TemplateElementFactory.inject = [ b ];

const xi = function(t) {
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
        return i.Registration.singleton(Be, this).register(t);
    }
    compile(t, e, s) {
        var n, r, o, l;
        const h = CustomElementDefinition.getOrCreate(t);
        if (null === h.template || void 0 === h.template) return h;
        if (false === h.needsCompile) return h;
        null !== s && void 0 !== s ? s : s = bi;
        const a = new CompilationContext(t, e, s, null, null, void 0);
        const u = "string" === typeof h.template || !t.enhance ? a.templateFactory.createTemplate(h.template) : h.template;
        const c = "TEMPLATE" === u.nodeName && null != u.content;
        const f = c ? u.content : u;
        const d = e.get(xi(Ii));
        const p = d.length;
        let m = 0;
        if (p > 0) while (p > m) {
            null === (r = (n = d[m]).compiling) || void 0 === r ? void 0 : r.call(n, u);
            ++m;
        }
        if (u.hasAttribute(Oi)) throw new Error("The root cannot be a local template itself.");
        this.local(f, a);
        this.node(f, a);
        return CustomElementDefinition.create({
            ...t,
            name: t.name || ft.generateName(),
            dependencies: (null !== (o = t.dependencies) && void 0 !== o ? o : i.emptyArray).concat(null !== (l = a.deps) && void 0 !== l ? l : i.emptyArray),
            instructions: a.rows,
            surrogates: c ? this.surrogate(u, a) : i.emptyArray,
            template: u,
            hasSlots: a.hasSlot,
            needsCompile: false
        });
    }
    surrogate(t, e) {
        var s;
        const n = [];
        const r = t.attributes;
        const o = e.exprParser;
        let l = r.length;
        let h = 0;
        let a;
        let u;
        let c;
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
            a = r[h];
            u = a.name;
            c = a.value;
            f = e.attrParser.parse(u, c);
            y = f.target;
            k = f.rawValue;
            if (ki[y]) throw new Error(`Attribute ${u} is invalid on surrogate.`);
            g = e.command(f);
            if (null !== g && 4096 & g.bindingType) {
                b = o.parse(k, g.bindingType);
                yi.node = t;
                yi.attr = f;
                yi.expr = b;
                yi.bindable = null;
                yi.def = null;
                n.push(g.build(yi));
                continue;
            }
            d = e.attr(y);
            if (null !== d) {
                if (d.isTemplateController) throw new Error(`Template controller ${y} is invalid on surrogate.`);
                x = BindablesInfo.from(d, true);
                w = false === d.noMultiBindings && null === g && vi(k);
                if (w) m = this.multiBindings(t, k, d, e); else {
                    v = x.primary;
                    if (null === g) {
                        b = o.parse(k, 2048);
                        m = [ null === b ? new SetPropertyInstruction(k, v.property) : new InterpolationInstruction(b, v.property) ];
                    } else {
                        b = o.parse(k, g.bindingType);
                        yi.node = t;
                        yi.attr = f;
                        yi.expr = b;
                        yi.bindable = v;
                        yi.def = d;
                        m = [ g.build(yi) ];
                    }
                }
                t.removeAttribute(u);
                --h;
                --l;
                (null !== p && void 0 !== p ? p : p = []).push(new HydrateAttributeInstruction(this.resolveResources ? d : d.name, null != d.aliases && d.aliases.includes(y) ? y : void 0, m));
                continue;
            }
            if (null === g) {
                b = o.parse(k, 2048);
                if (null != b) {
                    t.removeAttribute(u);
                    --h;
                    --l;
                    n.push(new InterpolationInstruction(b, null !== (s = e.attrMapper.map(t, y)) && void 0 !== s ? s : i.camelCase(y)));
                } else switch (u) {
                  case "class":
                    n.push(new SetClassAttributeInstruction(k));
                    break;

                  case "style":
                    n.push(new SetStyleAttributeInstruction(k));
                    break;

                  default:
                    n.push(new SetAttributeInstruction(k, u));
                }
            } else {
                b = o.parse(k, g.bindingType);
                yi.node = t;
                yi.attr = f;
                yi.expr = b;
                yi.bindable = null;
                yi.def = null;
                n.push(g.build(yi));
            }
        }
        gi();
        if (null != p) return p.concat(n);
        return n;
    }
    node(t, e) {
        switch (t.nodeType) {
          case 1:
            switch (t.nodeName) {
              case "LET":
                return this.declare(t, e);

              default:
                return this.element(t, e);
            }

          case 3:
            return this.text(t, e);

          case 11:
            {
                let i = t.firstChild;
                while (null !== i) i = this.node(i, e);
                break;
            }
        }
        return t.nextSibling;
    }
    declare(t, e) {
        const n = t.attributes;
        const r = n.length;
        const o = [];
        const l = e.exprParser;
        let h = false;
        let a = 0;
        let u;
        let c;
        let f;
        let d;
        let p;
        let m;
        let x;
        let v;
        for (;r > a; ++a) {
            u = n[a];
            f = u.name;
            d = u.value;
            if ("to-binding-context" === f) {
                h = true;
                continue;
            }
            c = e.attrParser.parse(f, d);
            m = c.target;
            x = c.rawValue;
            p = e.command(c);
            if (null !== p) {
                if (50 === p.bindingType || 53 === p.bindingType) {
                    o.push(new LetBindingInstruction(l.parse(x, p.bindingType), i.camelCase(m)));
                    continue;
                }
                throw new Error(`Invalid command ${c.command} for <let>. Only to-view/bind supported.`);
            }
            v = l.parse(x, 2048);
            if (null === v) e.logger.warn(`Property ${m} is declared with literal string ${x}. ` + `Did you mean ${m}.bind="${x}"?`);
            o.push(new LetBindingInstruction(null === v ? new s.PrimitiveLiteralExpression(x) : v, i.camelCase(m)));
        }
        e.rows.push([ new HydrateLetElementInstruction(o, h) ]);
        return this.mark(t).nextSibling;
    }
    element(t, e) {
        var s, n, r, o, l;
        var h, a;
        const u = t.nextSibling;
        const c = (null !== (s = t.getAttribute("as-element")) && void 0 !== s ? s : t.nodeName).toLowerCase();
        const f = e.el(c);
        const d = e.exprParser;
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
        let C;
        let A;
        let S = null;
        let E = false;
        let O;
        let B;
        let T;
        let I;
        let R;
        let D;
        let j;
        let $ = null;
        let P;
        let L;
        let q;
        let M;
        let V = true;
        let F = false;
        if ("slot" === c) e.root.hasSlot = true;
        if (null !== f) {
            V = null === (n = f.processContent) || void 0 === n ? void 0 : n.call(f.Type, t, e.p);
            m = t.attributes;
            v = m.length;
        }
        if (e.root.def.enhance && t.classList.contains("au")) throw new Error(`AUR0710`);
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
            k = e.attrParser.parse(w, y);
            $ = e.command(k);
            if (null !== $ && 4096 & $.bindingType) {
                D = d.parse(y, $.bindingType);
                yi.node = t;
                yi.attr = k;
                yi.expr = D;
                yi.bindable = null;
                yi.def = null;
                (null !== C && void 0 !== C ? C : C = []).push($.build(yi));
                p();
                continue;
            }
            q = k.target;
            M = k.rawValue;
            S = e.attr(q);
            if (null !== S) {
                P = BindablesInfo.from(S, true);
                E = false === S.noMultiBindings && null === $ && vi(y);
                if (E) T = this.multiBindings(t, y, S, e); else {
                    L = P.primary;
                    if (null === $) {
                        D = d.parse(y, 2048);
                        T = [ null === D ? new SetPropertyInstruction(y, L.property) : new InterpolationInstruction(D, L.property) ];
                    } else {
                        D = d.parse(y, $.bindingType);
                        yi.node = t;
                        yi.attr = k;
                        yi.expr = D;
                        yi.bindable = L;
                        yi.def = S;
                        T = [ $.build(yi) ];
                    }
                }
                p();
                if (S.isTemplateController) (null !== I && void 0 !== I ? I : I = []).push(new HydrateTemplateController(wi, this.resolveResources ? S : S.name, void 0, T)); else (null !== B && void 0 !== B ? B : B = []).push(new HydrateAttributeInstruction(this.resolveResources ? S : S.name, null != S.aliases && S.aliases.includes(q) ? q : void 0, T));
                continue;
            }
            if (null === $) {
                if (null !== f) {
                    P = BindablesInfo.from(f, false);
                    O = P.attrs[q];
                    if (void 0 !== O) {
                        D = d.parse(M, 2048);
                        (null !== A && void 0 !== A ? A : A = []).push(null == D ? new SetPropertyInstruction(M, O.property) : new InterpolationInstruction(D, O.property));
                        p();
                        continue;
                    }
                }
                D = d.parse(M, 2048);
                if (null != D) {
                    p();
                    (null !== C && void 0 !== C ? C : C = []).push(new InterpolationInstruction(D, null !== (r = e.attrMapper.map(t, q)) && void 0 !== r ? r : i.camelCase(q)));
                }
                continue;
            }
            p();
            if (null !== f) {
                P = BindablesInfo.from(f, false);
                O = P.attrs[q];
                if (void 0 !== O) {
                    y = 0 === y.length && ($.bindingType & (53 | 49 | 50 | 52)) > 0 ? i.camelCase(w) : y;
                    D = d.parse(y, $.bindingType);
                    yi.node = t;
                    yi.attr = k;
                    yi.expr = D;
                    yi.bindable = O;
                    yi.def = f;
                    (null !== A && void 0 !== A ? A : A = []).push($.build(yi));
                    continue;
                }
            }
            D = d.parse(M, $.bindingType);
            yi.node = t;
            yi.attr = k;
            yi.expr = D;
            yi.bindable = null;
            yi.def = null;
            (null !== C && void 0 !== C ? C : C = []).push($.build(yi));
        }
        gi();
        if (this.shouldReorderAttrs(t) && null != C && C.length > 1) this.reorder(t, C);
        if (null !== f) {
            j = new HydrateElementInstruction(this.resolveResources ? f : f.name, void 0, null !== A && void 0 !== A ? A : i.emptyArray, null, F);
            if ("au-slot" === c) {
                const i = t.getAttribute("name") || "default";
                const s = e.h("template");
                const n = e.child();
                let r = t.firstChild;
                while (null !== r) {
                    if (1 === r.nodeType && r.hasAttribute("au-slot")) t.removeChild(r); else s.content.appendChild(r);
                    r = t.firstChild;
                }
                this.node(s.content, n);
                j.auSlot = {
                    name: i,
                    fallback: CustomElementDefinition.create({
                        name: ft.generateName(),
                        template: s,
                        instructions: n.rows,
                        needsCompile: false
                    })
                };
                t = this.marker(t, e);
            }
        }
        if (null != C || null != j || null != B) {
            x = i.emptyArray.concat(null !== j && void 0 !== j ? j : i.emptyArray, null !== B && void 0 !== B ? B : i.emptyArray, null !== C && void 0 !== C ? C : i.emptyArray);
            this.mark(t);
        }
        let N;
        if (null != I) {
            v = I.length - 1;
            g = v;
            R = I[g];
            let i;
            this.marker(t, e);
            if ("TEMPLATE" === t.nodeName) i = t; else {
                i = e.h("template");
                i.content.appendChild(t);
            }
            const s = i;
            const n = e.child(null == x ? [] : [ x ]);
            N = null === f || !f.containerless && !F && false !== V;
            if (null !== f && f.containerless) this.marker(t, e);
            let r;
            let l;
            let a;
            let u;
            let c;
            let d;
            let p;
            let m;
            let b;
            let w = 0, y = 0;
            if (N) {
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
                            (null !== (o = (h = null !== c && void 0 !== c ? c : c = {})[a]) && void 0 !== o ? o : h[a] = []).push(l);
                        }
                    } else r = r.nextSibling;
                    if (null != c) {
                        u = {};
                        for (a in c) {
                            i = e.h("template");
                            d = c[a];
                            for (w = 0, y = d.length; y > w; ++w) {
                                p = d[w];
                                if ("TEMPLATE" === p.nodeName) if (p.attributes.length > 0) i.content.appendChild(p); else i.content.appendChild(p.content); else i.content.appendChild(p);
                            }
                            b = e.child();
                            this.node(i.content, b);
                            u[a] = CustomElementDefinition.create({
                                name: ft.generateName(),
                                template: i,
                                instructions: b.rows,
                                needsCompile: false
                            });
                        }
                        j.projections = u;
                    }
                }
                if ("TEMPLATE" === t.nodeName) this.node(t.content, n); else {
                    r = t.firstChild;
                    while (null !== r) r = this.node(r, n);
                }
            }
            R.def = CustomElementDefinition.create({
                name: ft.generateName(),
                template: s,
                instructions: n.rows,
                needsCompile: false
            });
            while (g-- > 0) {
                R = I[g];
                i = e.h("template");
                m = e.h("au-m");
                m.classList.add("au");
                i.content.appendChild(m);
                if (R.def !== wi) throw new Error(`Invalid definition for processing ${R.res}.`);
                R.def = CustomElementDefinition.create({
                    name: ft.generateName(),
                    template: i,
                    needsCompile: false,
                    instructions: [ [ I[g + 1] ] ]
                });
            }
            e.rows.push([ R ]);
        } else {
            if (null != x) e.rows.push(x);
            N = null === f || !f.containerless && !F && false !== V;
            if (null !== f && f.containerless) this.marker(t, e);
            if (N && t.childNodes.length > 0) {
                let i = t.firstChild;
                let s;
                let n;
                let r = null;
                let o;
                let h;
                let u;
                let c;
                let d;
                let p = 0, m = 0;
                while (null !== i) if (1 === i.nodeType) {
                    s = i;
                    i = i.nextSibling;
                    n = s.getAttribute("au-slot");
                    if (null !== n) {
                        if (null === f) throw new Error(`Projection with [au-slot="${n}"] is attempted on a non custom element ${t.nodeName}.`);
                        if ("" === n) n = "default";
                        t.removeChild(s);
                        s.removeAttribute("au-slot");
                        (null !== (l = (a = null !== o && void 0 !== o ? o : o = {})[n]) && void 0 !== l ? l : a[n] = []).push(s);
                    }
                } else i = i.nextSibling;
                if (null != o) {
                    r = {};
                    for (n in o) {
                        c = e.h("template");
                        h = o[n];
                        for (p = 0, m = h.length; m > p; ++p) {
                            u = h[p];
                            if ("TEMPLATE" === u.nodeName) if (u.attributes.length > 0) c.content.appendChild(u); else c.content.appendChild(u.content); else c.content.appendChild(u);
                        }
                        d = e.child();
                        this.node(c.content, d);
                        r[n] = CustomElementDefinition.create({
                            name: ft.generateName(),
                            template: c,
                            instructions: d.rows,
                            needsCompile: false
                        });
                    }
                    j.projections = r;
                }
                i = t.firstChild;
                while (null !== i) i = this.node(i, e);
            }
        }
        return u;
    }
    text(t, e) {
        let i = "";
        let s = t;
        while (null !== s && 3 === s.nodeType) {
            i += s.textContent;
            s = s.nextSibling;
        }
        const n = e.exprParser.parse(i, 2048);
        if (null === n) return s;
        const r = t.parentNode;
        r.insertBefore(this.mark(e.h("au-m")), t);
        e.rows.push([ new TextBindingInstruction(n, !!e.def.isStrictBinding) ]);
        t.textContent = "";
        s = t.nextSibling;
        while (null !== s && 3 === s.nodeType) {
            r.removeChild(s);
            s = t.nextSibling;
        }
        return t.nextSibling;
    }
    multiBindings(t, e, i, s) {
        const n = BindablesInfo.from(i, true);
        const r = e.length;
        const o = [];
        let l;
        let h;
        let a = 0;
        let u = 0;
        let c;
        let f;
        let d;
        let p;
        for (let m = 0; m < r; ++m) {
            u = e.charCodeAt(m);
            if (92 === u) ++m; else if (58 === u) {
                l = e.slice(a, m);
                while (e.charCodeAt(++m) <= 32) ;
                a = m;
                for (;m < r; ++m) {
                    u = e.charCodeAt(m);
                    if (92 === u) ++m; else if (59 === u) {
                        h = e.slice(a, m);
                        break;
                    }
                }
                if (void 0 === h) h = e.slice(a);
                f = s.attrParser.parse(l, h);
                d = s.command(f);
                p = n.attrs[f.target];
                if (null == p) throw new Error(`Bindable ${f.target} not found on ${i.name}.`);
                if (null === d) {
                    c = s.exprParser.parse(h, 2048);
                    o.push(null === c ? new SetPropertyInstruction(h, p.property) : new InterpolationInstruction(c, p.property));
                } else {
                    c = s.exprParser.parse(h, d.bindingType);
                    yi.node = t;
                    yi.attr = f;
                    yi.expr = c;
                    yi.bindable = p;
                    yi.def = i;
                    o.push(d.build(yi));
                }
                while (m < r && e.charCodeAt(++m) <= 32) ;
                a = m;
                l = void 0;
                h = void 0;
            }
        }
        gi();
        return o;
    }
    local(t, e) {
        const s = t;
        const n = i.toArray(s.querySelectorAll("template[as-custom-element]"));
        const r = n.length;
        if (0 === r) return;
        if (r === s.childElementCount) throw new Error("The custom element does not have any content other than local template(s).");
        const o = new Set;
        for (const t of n) {
            if (t.parentNode !== s) throw new Error("Local templates needs to be defined directly under root.");
            const n = Bi(t, o);
            const r = class LocalTemplate {};
            const l = t.content;
            const a = i.toArray(l.querySelectorAll("bindable"));
            const u = h.for(r);
            const c = new Set;
            const f = new Set;
            for (const t of a) {
                if (t.parentNode !== l) throw new Error("Bindable properties of local templates needs to be defined directly under root.");
                const i = t.getAttribute("property");
                if (null === i) throw new Error(`The attribute 'property' is missing in ${t.outerHTML}`);
                const s = t.getAttribute("attribute");
                if (null !== s && f.has(s) || c.has(i)) throw new Error(`Bindable property and attribute needs to be unique; found property: ${i}, attribute: ${s}`); else {
                    if (null !== s) f.add(s);
                    c.add(i);
                }
                u.add({
                    property: i,
                    attribute: null !== s && void 0 !== s ? s : void 0,
                    mode: Ti(t)
                });
                const n = t.getAttributeNames().filter((t => !Ei.includes(t)));
                if (n.length > 0) e.logger.warn(`The attribute(s) ${n.join(", ")} will be ignored for ${t.outerHTML}. Only ${Ei.join(", ")} are processed.`);
                l.removeChild(t);
            }
            e.addDep(ft.define({
                name: n,
                template: t
            }, r));
            s.removeChild(t);
        }
    }
    shouldReorderAttrs(t) {
        return "INPUT" === t.nodeName && 1 === Ci[t.type];
    }
    reorder(t, e) {
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
    mark(t) {
        t.classList.add("au");
        return t;
    }
    marker(t, e) {
        const i = t.parentNode;
        const s = e.h("au-m");
        this.mark(i.insertBefore(s, t));
        i.removeChild(t);
        return s;
    }
}

class CompilationContext {
    constructor(t, e, n, r, o, l) {
        this.hasSlot = false;
        this.commands = g();
        const h = null !== r;
        this.c = e;
        this.root = null === o ? this : o;
        this.def = t;
        this.ci = n;
        this.parent = r;
        this.templateFactory = h ? r.templateFactory : e.get(pi);
        this.attrParser = h ? r.attrParser : e.get(f);
        this.exprParser = h ? r.exprParser : e.get(s.IExpressionParser);
        this.attrMapper = h ? r.attrMapper : e.get(k);
        this.logger = h ? r.logger : e.get(i.ILogger);
        this.p = h ? r.p : e.get(b);
        this.localEls = h ? r.localEls : new Set;
        this.rows = null !== l && void 0 !== l ? l : [];
    }
    addDep(t) {
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
    el(t) {
        return this.c.find(ft, t);
    }
    attr(t) {
        return this.c.find(st, t);
    }
    child(t) {
        return new CompilationContext(this.def, this.c, this.ci, this, this.root, t);
    }
    command(t) {
        if (this.root !== this) return this.root.command(t);
        const e = t.command;
        if (null === e) return null;
        let i = this.commands[e];
        if (void 0 === i) {
            i = this.c.create(fi, e);
            if (null === i) throw new Error(`Unknown binding command: ${e}`);
            this.commands[e] = i;
        }
        return i;
    }
}

function vi(t) {
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

function gi() {
    yi.node = yi.attr = yi.expr = yi.bindable = yi.def = null;
}

const bi = {
    projections: null
};

const wi = {
    name: "unnamed"
};

const yi = {
    node: null,
    expr: null,
    attr: null,
    bindable: null,
    def: null
};

const ki = Object.assign(g(), {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
});

const Ci = {
    checkbox: 1,
    radio: 1
};

const Ai = new WeakMap;

class BindablesInfo {
    constructor(t, e, i) {
        this.attrs = t;
        this.bindables = e;
        this.primary = i;
    }
    static from(t, e) {
        let i = Ai.get(t);
        if (null == i) {
            const n = t.bindables;
            const r = g();
            const o = e ? void 0 === t.defaultBindingMode ? s.BindingMode.default : t.defaultBindingMode : s.BindingMode.default;
            let l;
            let h;
            let a = false;
            let u;
            let c;
            for (h in n) {
                l = n[h];
                c = l.attribute;
                if (true === l.primary) {
                    if (a) throw new Error(`Primary already exists on ${t.name}`);
                    a = true;
                    u = l;
                } else if (!a && null == u) u = l;
                r[c] = BindableDefinition.create(h, l);
            }
            if (null == l && e) u = r.value = BindableDefinition.create("value", {
                mode: o
            });
            Ai.set(t, i = new BindablesInfo(r, n, u));
        }
        return i;
    }
}

var Si;

(function(t) {
    t["property"] = "property";
    t["attribute"] = "attribute";
    t["mode"] = "mode";
})(Si || (Si = {}));

const Ei = Object.freeze([ "property", "attribute", "mode" ]);

const Oi = "as-custom-element";

function Bi(t, e) {
    const i = t.getAttribute(Oi);
    if (null === i || "" === i) throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
    if (e.has(i)) throw new Error(`Duplicate definition of the local template named ${i}`); else {
        e.add(i);
        t.removeAttribute(Oi);
    }
    return i;
}

function Ti(t) {
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

const Ii = i.DI.createInterface("ITemplateCompilerHooks");

const Ri = new WeakMap;

const Di = i.Protocol.resource.keyFor("compiler-hooks");

const ji = Object.freeze({
    name: Di,
    define(t) {
        let e = Ri.get(t);
        if (void 0 === e) {
            Ri.set(t, e = new TemplateCompilerHooksDefinition(t));
            i.Metadata.define(Di, e, t);
            i.Protocol.resource.appendTo(t, Di);
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
        t.register(i.Registration.singleton(Ii, this.Type));
    }
}

const $i = t => {
    return void 0 === t ? e : e(t);
    function e(t) {
        return ji.define(t);
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

const Pi = 200;

class DebounceBindingBehavior extends s.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: Pi
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
            this.opts.delay = isNaN(i) ? Pi : i;
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

exports.SignalBindingBehavior = class SignalBindingBehavior {
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

exports.SignalBindingBehavior = n([ r(0, s.ISignaler) ], exports.SignalBindingBehavior);

s.bindingBehavior("signal")(exports.SignalBindingBehavior);

const Li = 200;

class ThrottleBindingBehavior extends s.BindingInterceptor {
    constructor(t, e) {
        super(t, e);
        this.opts = {
            delay: Li
        };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.platform = t.locator.get(i.IPlatform);
        this.taskQueue = this.platform.taskQueue;
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
            this.lastCall = this.platform.performanceNow();
        }
        this.binding.handleChange(t, e, i);
    }
    updateSource(t, e) {
        this.queueTask((() => this.binding.updateSource(t, e)));
    }
    queueTask(t) {
        const e = this.opts;
        const i = this.platform;
        const s = this.lastCall + e.delay - i.performanceNow();
        if (s > 0) {
            const n = this.task;
            e.delay = s;
            this.task = this.taskQueue.queueTask((() => {
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
            this.opts.delay = this.delay = isNaN(i) ? Li : i;
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

const qi = new DataAttributeAccessor;

exports.AttrBindingBehavior = class AttrBindingBehavior {
    bind(t, e, i) {
        i.targetObserver = qi;
    }
    unbind(t, e, i) {
        return;
    }
};

exports.AttrBindingBehavior = n([ s.bindingBehavior("attr") ], exports.AttrBindingBehavior);

function Mi(t) {
    const e = t.composedPath()[0];
    if (this.target !== e) return;
    return this.selfEventCallSource(t);
}

exports.SelfBindingBehavior = class SelfBindingBehavior {
    bind(t, e, i) {
        if (!i.callSource || !i.targetEvent) throw new Error("Self binding behavior only supports events.");
        i.selfEventCallSource = i.callSource;
        i.callSource = Mi;
    }
    unbind(t, e, i) {
        i.callSource = i.selfEventCallSource;
        i.selfEventCallSource = null;
    }
};

exports.SelfBindingBehavior = n([ s.bindingBehavior("self") ], exports.SelfBindingBehavior);

const Vi = g();

class AttributeNSAccessor {
    constructor(t) {
        this.namespace = t;
        this.type = 2 | 4;
    }
    static forNs(t) {
        var e;
        return null !== (e = Vi[t]) && void 0 !== e ? e : Vi[t] = new AttributeNSAccessor(t);
    }
    getValue(t, e) {
        return t.getAttributeNS(this.namespace, e);
    }
    setValue(t, e, i, s) {
        if (void 0 == t) i.removeAttributeNS(this.namespace, s); else i.setAttributeNS(this.namespace, s, t);
    }
}

function Fi(t, e) {
    return t === e;
}

class CheckedObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.observerLocator = s;
        this.value = void 0;
        this.oldValue = void 0;
        this.type = 2 | 1 | 4;
        this.collectionObserver = void 0;
        this.valueObserver = void 0;
        this.f = 0;
        this.obj = t;
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
        this.observe();
        this.synchronizeElement();
        this.queue.add(this);
    }
    handleCollectionChange(t, e) {
        this.synchronizeElement();
    }
    handleChange(t, e, i) {
        this.synchronizeElement();
    }
    synchronizeElement() {
        const t = this.value;
        const e = this.obj;
        const i = Object.prototype.hasOwnProperty.call(e, "model") ? e.model : e.value;
        const s = "radio" === e.type;
        const n = void 0 !== e.matcher ? e.matcher : Fi;
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
        let t = this.oldValue = this.value;
        const e = this.obj;
        const i = Object.prototype.hasOwnProperty.call(e, "model") ? e.model : e.value;
        const s = e.checked;
        const n = void 0 !== e.matcher ? e.matcher : Fi;
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
        this.observe();
    }
    stop() {
        var t, e;
        this.handler.dispose();
        null === (t = this.collectionObserver) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.collectionObserver = void 0;
        null === (e = this.valueObserver) || void 0 === e ? void 0 : e.unsubscribe(this);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.start();
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.stop();
    }
    flush() {
        Ni = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Ni, this.f);
    }
    observe() {
        var t, e, i, s, n, r, o;
        const l = this.obj;
        null === (n = null !== (t = this.valueObserver) && void 0 !== t ? t : this.valueObserver = null !== (i = null === (e = l.$observers) || void 0 === e ? void 0 : e.model) && void 0 !== i ? i : null === (s = l.$observers) || void 0 === s ? void 0 : s.value) || void 0 === n ? void 0 : n.subscribe(this);
        null === (r = this.collectionObserver) || void 0 === r ? void 0 : r.unsubscribe(this);
        this.collectionObserver = void 0;
        if ("checkbox" === l.type) null === (o = this.collectionObserver = Ji(this.value, this.observerLocator)) || void 0 === o ? void 0 : o.subscribe(this);
    }
}

s.subscriberCollection(CheckedObserver);

s.withFlushQueue(CheckedObserver);

let Ni;

const Hi = Object.prototype.hasOwnProperty;

const zi = {
    childList: true,
    subtree: true,
    characterData: true
};

function Ui(t, e) {
    return t === e;
}

class SelectValueObserver {
    constructor(t, e, i, s) {
        this.handler = i;
        this.observerLocator = s;
        this.value = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        this.type = 2 | 1 | 4;
        this.arrayObserver = void 0;
        this.nodeObserver = void 0;
        this.observing = false;
        this.obj = t;
    }
    getValue() {
        return this.observing ? this.value : this.obj.multiple ? Array.from(this.obj.options).map((t => t.value)) : this.obj.value;
    }
    setValue(t, e) {
        this.oldValue = this.value;
        this.value = t;
        this.hasChanges = t !== this.oldValue;
        this.observeArray(t instanceof Array ? t : null);
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
        const n = null !== (t = i.matcher) && void 0 !== t ? t : Ui;
        const r = i.options;
        let o = r.length;
        while (o-- > 0) {
            const t = r[o];
            const i = Hi.call(t, "model") ? t.model : t.value;
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
            const o = t.matcher || Ui;
            const l = [];
            while (n < i) {
                r = e[n];
                if (r.selected) l.push(Hi.call(r, "model") ? r.model : r.value);
                ++n;
            }
            n = 0;
            while (n < s.length) {
                const t = s[n];
                if (-1 === l.findIndex((e => !!o(t, e)))) s.splice(n, 1); else ++n;
            }
            n = 0;
            while (n < l.length) {
                const t = l[n];
                if (-1 === s.findIndex((e => !!o(t, e)))) s.push(t);
                ++n;
            }
            return false;
        }
        let r = null;
        while (n < i) {
            const t = e[n];
            if (t.selected) {
                r = Hi.call(t, "model") ? t.model : t.value;
                break;
            }
            ++n;
        }
        this.oldValue = this.value;
        this.value = r;
        return true;
    }
    start() {
        (this.nodeObserver = new this.obj.ownerDocument.defaultView.MutationObserver(this.handleNodeChange.bind(this))).observe(this.obj, zi);
        this.observeArray(this.value instanceof Array ? this.value : null);
        this.observing = true;
    }
    stop() {
        var t;
        this.nodeObserver.disconnect();
        null === (t = this.arrayObserver) || void 0 === t ? void 0 : t.unsubscribe(this);
        this.nodeObserver = this.arrayObserver = void 0;
        this.observing = false;
    }
    observeArray(t) {
        var e;
        null === (e = this.arrayObserver) || void 0 === e ? void 0 : e.unsubscribe(this);
        this.arrayObserver = void 0;
        if (null != t) {
            if (!this.obj.multiple) throw new Error("Only null or Array instances can be bound to a multi-select.");
            (this.arrayObserver = this.observerLocator.getArrayObserver(t)).subscribe(this);
        }
    }
    handleEvent() {
        const t = this.syncValue();
        if (t) this.queue.add(this);
    }
    handleNodeChange() {
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
        Wi = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Wi, 0);
    }
}

s.subscriberCollection(SelectValueObserver);

s.withFlushQueue(SelectValueObserver);

let Wi;

const Gi = "--";

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
    getStyleTuplesFromString(t) {
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
    getStyleTuplesFromObject(t) {
        let e;
        const s = [];
        for (const n in t) {
            e = t[n];
            if (null == e) continue;
            if ("string" === typeof e) {
                if (n.startsWith(Gi)) {
                    s.push([ n, e ]);
                    continue;
                }
                s.push([ i.kebabCase(n), e ]);
                continue;
            }
            s.push(...this.getStyleTuples(e));
        }
        return s;
    }
    getStyleTuplesFromArray(t) {
        const e = t.length;
        if (e > 0) {
            const i = [];
            for (let s = 0; s < e; ++s) i.push(...this.getStyleTuples(t[s]));
            return i;
        }
        return i.emptyArray;
    }
    getStyleTuples(t) {
        if ("string" === typeof t) return this.getStyleTuplesFromString(t);
        if (t instanceof Array) return this.getStyleTuplesFromArray(t);
        if (t instanceof Object) return this.getStyleTuplesFromObject(t);
        return i.emptyArray;
    }
    flushChanges(t) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const t = this.value;
            const e = this.styles;
            const i = this.getStyleTuples(t);
            let s;
            let n = this.version;
            this.oldValue = t;
            let r;
            let o;
            let l;
            const h = i.length;
            for (let t = 0; t < h; ++t) {
                r = i[t];
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
        Ki = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Ki, 0);
    }
}

s.subscriberCollection(ValueAttributeObserver);

s.withFlushQueue(ValueAttributeObserver);

let Ki;

const Xi = "http://www.w3.org/1999/xlink";

const Yi = "http://www.w3.org/XML/1998/namespace";

const Qi = "http://www.w3.org/2000/xmlns/";

const _i = Object.assign(g(), {
    "xlink:actuate": [ "actuate", Xi ],
    "xlink:arcrole": [ "arcrole", Xi ],
    "xlink:href": [ "href", Xi ],
    "xlink:role": [ "role", Xi ],
    "xlink:show": [ "show", Xi ],
    "xlink:title": [ "title", Xi ],
    "xlink:type": [ "type", Xi ],
    "xml:lang": [ "lang", Yi ],
    "xml:space": [ "space", Yi ],
    xmlns: [ "xmlns", Qi ],
    "xmlns:xlink": [ "xlink", Qi ]
});

const Zi = new s.PropertyAccessor;

Zi.type = 2 | 4;

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
        this.events = g();
        this.globalEvents = g();
        this.overrides = g();
        this.globalOverrides = g();
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
        const r = this.events;
        let o;
        if ("string" === typeof t) {
            o = null !== (s = r[t]) && void 0 !== s ? s : r[t] = g();
            if (null == o[e]) o[e] = new NodeObserverConfig(i); else ts(t, e);
        } else for (const i in t) {
            o = null !== (n = r[i]) && void 0 !== n ? n : r[i] = g();
            const s = t[i];
            for (e in s) if (null == o[e]) o[e] = new NodeObserverConfig(s[e]); else ts(i, e);
        }
    }
    useConfigGlobal(t, e) {
        const i = this.globalEvents;
        if ("object" === typeof t) for (const e in t) if (null == i[e]) i[e] = new NodeObserverConfig(t[e]); else ts("*", e); else if (null == i[t]) i[t] = new NodeObserverConfig(e); else ts("*", t);
    }
    getAccessor(t, e, s) {
        var n;
        if (e in this.globalOverrides || e in (null !== (n = this.overrides[t.tagName]) && void 0 !== n ? n : i.emptyObject)) return this.getObserver(t, e, s);
        switch (e) {
          case "src":
          case "href":
          case "role":
            return qi;

          default:
            {
                const i = _i[e];
                if (void 0 !== i) return AttributeNSAccessor.forNs(i[1]);
                if (v(t, e, this.svgAnalyzer)) return qi;
                return Zi;
            }
        }
    }
    overrideAccessor(t, e) {
        var i, s;
        var n, r;
        let o;
        if ("string" === typeof t) {
            o = null !== (i = (n = this.overrides)[t]) && void 0 !== i ? i : n[t] = g();
            o[e] = true;
        } else for (const e in t) for (const i of t[e]) {
            o = null !== (s = (r = this.overrides)[e]) && void 0 !== s ? s : r[e] = g();
            o[i] = true;
        }
    }
    overrideAccessorGlobal(...t) {
        for (const e of t) this.globalOverrides[e] = true;
    }
    getObserver(t, e, i) {
        var n, r;
        switch (e) {
          case "role":
            return qi;

          case "class":
            return new ClassAttributeAccessor(t);

          case "css":
          case "style":
            return new StyleAttributeAccessor(t);
        }
        const o = null !== (r = null === (n = this.events[t.tagName]) || void 0 === n ? void 0 : n[e]) && void 0 !== r ? r : this.globalEvents[e];
        if (null != o) return new o.type(t, e, new EventSubscriber(o), i, this.locator);
        const l = _i[e];
        if (void 0 !== l) return AttributeNSAccessor.forNs(l[1]);
        if (v(t, e, this.svgAnalyzer)) return qi;
        if (e in t.constructor.prototype) {
            if (this.allowDirtyCheck) return this.dirtyChecker.createProperty(t, e);
            throw new Error(`Unable to observe property ${String(e)}. Register observation mapping with .useConfig().`);
        } else return new s.SetterObserver(t, e);
    }
}

NodeObserverLocator.inject = [ i.IServiceLocator, b, s.IDirtyChecker, w ];

function Ji(t, e) {
    if (t instanceof Array) return e.getArrayObserver(t);
    if (t instanceof Map) return e.getMapObserver(t);
    if (t instanceof Set) return e.getSetObserver(t);
}

function ts(t, e) {
    throw new Error(`Mapping for property ${String(e)} of <${t} /> already exists`);
}

exports.UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
    constructor(t) {
        this.observerLocator = t;
    }
    bind(t, e, i, ...n) {
        if (0 === n.length) throw new Error("The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind=\"firstName & updateTrigger:'blur'\">");
        if (i.mode !== s.BindingMode.twoWay && i.mode !== s.BindingMode.fromView) throw new Error("The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.");
        const r = this.observerLocator.getObserver(i.target, i.targetProperty);
        if (!r.handler) throw new Error("The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.");
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
};

exports.UpdateTriggerBindingBehavior = n([ s.bindingBehavior("updateTrigger"), r(0, s.IObserverLocator) ], exports.UpdateTriggerBindingBehavior);

exports.Focus = class Focus {
    constructor(t, e) {
        this.element = t;
        this.p = e;
        this.needsApply = false;
    }
    binding() {
        this.valueChanged();
    }
    valueChanged() {
        if (this.$controller.isActive) this.apply(); else this.needsApply = true;
    }
    attached() {
        if (this.needsApply) {
            this.needsApply = false;
            this.apply();
        }
        const t = this.element;
        t.addEventListener("focus", this);
        t.addEventListener("blur", this);
    }
    afterDetachChildren() {
        const t = this.element;
        t.removeEventListener("focus", this);
        t.removeEventListener("blur", this);
    }
    handleEvent(t) {
        if ("focus" === t.type) this.value = true; else if (!this.isElFocused) this.value = false;
    }
    apply() {
        const t = this.element;
        const e = this.isElFocused;
        const i = this.value;
        if (i && !e) t.focus(); else if (!i && e) t.blur();
    }
    get isElFocused() {
        return this.element === this.p.document.activeElement;
    }
};

n([ o({
    mode: s.BindingMode.twoWay
}) ], exports.Focus.prototype, "value", void 0);

exports.Focus = n([ et("focus"), r(0, ue), r(1, b) ], exports.Focus);

let es = class Show {
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

n([ o ], es.prototype, "value", void 0);

es = n([ et("show"), s.alias("hide"), r(0, ue), r(1, b), r(2, Ee) ], es);

exports.Portal = class Portal {
    constructor(t, e, s) {
        this.factory = t;
        this.originalLoc = e;
        this.p = s;
        this.id = i.nextId("au$component");
        this.strict = false;
        this.currentTarget = s.document.createElement("div");
        this.view = this.factory.create();
        me(this.view.nodes, e);
    }
    attaching(t, e, i) {
        if (null == this.callbackContext) this.callbackContext = this.$controller.scope.bindingContext;
        const s = this.currentTarget = this.resolveTarget();
        this.view.setHost(s);
        return this.$activating(t, s, i);
    }
    detaching(t, e, i) {
        return this.$deactivating(t, this.currentTarget, i);
    }
    targetChanged() {
        const {$controller: t} = this;
        if (!t.isActive) return;
        const e = this.currentTarget;
        const s = this.currentTarget = this.resolveTarget();
        if (e === s) return;
        this.view.setHost(s);
        const n = i.onResolve(this.$deactivating(null, s, t.flags), (() => this.$activating(null, s, t.flags)));
        if (n instanceof Promise) n.catch((t => {
            throw t;
        }));
    }
    $activating(t, e, s) {
        const {activating: n, callbackContext: r, view: o} = this;
        o.setHost(e);
        return i.onResolve(null === n || void 0 === n ? void 0 : n.call(r, e, o), (() => this.activate(t, e, s)));
    }
    activate(t, e, s) {
        const {$controller: n, view: r} = this;
        if (null === t) r.nodes.appendTo(e); else return i.onResolve(r.activate(null !== t && void 0 !== t ? t : r, n, s, n.scope), (() => this.$activated(e)));
        return this.$activated(e);
    }
    $activated(t) {
        const {activated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    $deactivating(t, e, s) {
        const {deactivating: n, callbackContext: r, view: o} = this;
        return i.onResolve(null === n || void 0 === n ? void 0 : n.call(r, e, o), (() => this.deactivate(t, e, s)));
    }
    deactivate(t, e, s) {
        const {$controller: n, view: r} = this;
        if (null === t) r.nodes.remove(); else return i.onResolve(r.deactivate(t, n, s), (() => this.$deactivated(e)));
        return this.$deactivated(e);
    }
    $deactivated(t) {
        const {deactivated: e, callbackContext: i, view: s} = this;
        return null === e || void 0 === e ? void 0 : e.call(i, t, s);
    }
    resolveTarget() {
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
};

n([ o({
    primary: true
}) ], exports.Portal.prototype, "target", void 0);

n([ o({
    callback: "targetChanged"
}) ], exports.Portal.prototype, "renderContext", void 0);

n([ o() ], exports.Portal.prototype, "strict", void 0);

n([ o() ], exports.Portal.prototype, "deactivating", void 0);

n([ o() ], exports.Portal.prototype, "activating", void 0);

n([ o() ], exports.Portal.prototype, "deactivated", void 0);

n([ o() ], exports.Portal.prototype, "activated", void 0);

n([ o() ], exports.Portal.prototype, "callbackContext", void 0);

exports.Portal = n([ it("portal"), r(0, $t), r(1, fe), r(2, b) ], exports.Portal);

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

FrequentMutations.inject = [ $t, fe ];

class ObserveShallow extends FlagsTemplateController {
    constructor(t, e) {
        super(t, e, 128);
    }
}

ObserveShallow.inject = [ $t, fe ];

it("frequent-mutations")(FrequentMutations);

it("observe-shallow")(ObserveShallow);

exports.If = class If {
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
        this.wantsDeactivate = false;
        this.swapId = 0;
    }
    created() {
        this.ctrl = this.$controller;
    }
    attaching(t, e, s) {
        let n;
        const r = this.swapId++;
        const o = () => !this.wantsDeactivate && this.swapId === r + 1;
        return i.onResolve(this.pending, (() => {
            var e;
            if (!o()) return;
            this.pending = void 0;
            if (this.value) n = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(s); else n = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(s);
            if (null == n) return;
            n.setLocation(this.location);
            this.pending = i.onResolve(n.activate(t, this.ctrl, s, this.ctrl.scope), (() => {
                if (o()) this.pending = void 0;
            }));
        }));
    }
    detaching(t, e, s) {
        this.wantsDeactivate = true;
        return i.onResolve(this.pending, (() => {
            var e;
            this.wantsDeactivate = false;
            this.pending = void 0;
            void (null === (e = this.view) || void 0 === e ? void 0 : e.deactivate(t, this.ctrl, s));
        }));
    }
    valueChanged(t, e, s) {
        if (!this.ctrl.isActive) return;
        t = !!t;
        e = !!e;
        if (t === e) return;
        this.work.start();
        const n = this.view;
        const r = this.swapId++;
        const o = () => !this.wantsDeactivate && this.swapId === r + 1;
        let l;
        return i.onResolve(i.onResolve(this.pending, (() => this.pending = i.onResolve(null === n || void 0 === n ? void 0 : n.deactivate(n, this.ctrl, s), (() => {
            var e;
            if (!o()) return;
            if (t) l = this.view = this.ifView = this.cache && null != this.ifView ? this.ifView : this.ifFactory.create(s); else l = this.view = this.elseView = this.cache && null != this.elseView ? this.elseView : null === (e = this.elseFactory) || void 0 === e ? void 0 : e.create(s);
            if (null == l) return;
            l.setLocation(this.location);
            return i.onResolve(l.activate(l, this.ctrl, s, this.ctrl.scope), (() => {
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
};

n([ o ], exports.If.prototype, "value", void 0);

n([ o({
    set: t => "" === t || !!t && "false" !== t
}) ], exports.If.prototype, "cache", void 0);

exports.If = n([ it("if"), r(0, $t), r(1, fe), r(2, oe) ], exports.If);

exports.Else = class Else {
    constructor(t) {
        this.factory = t;
        this.id = i.nextId("au$component");
    }
    link(t, e, i, s, n) {
        const r = e.children;
        const o = r[r.length - 1];
        if (o instanceof exports.If) o.elseFactory = this.factory; else if (o.viewModel instanceof exports.If) o.viewModel.elseFactory = this.factory; else throw new Error(`Unsupported IfBehavior`);
    }
};

exports.Else = n([ it({
    name: "else"
}), r(0, $t) ], exports.Else);

function is(t) {
    t.dispose();
}

exports.Repeat = class Repeat {
    constructor(t, e, s) {
        this.location = t;
        this.parent = e;
        this.factory = s;
        this.id = i.nextId("au$component");
        this.hasPendingInstanceMutation = false;
        this.observer = void 0;
        this.views = [];
        this.key = void 0;
        this.normalizedItems = void 0;
    }
    binding(t, e, i) {
        this.checkCollectionObserver(i);
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
        this.normalizeToArray(i);
        return this.activateAllViews(t, i);
    }
    detaching(t, e, i) {
        this.checkCollectionObserver(i);
        return this.deactivateAllViews(t, i);
    }
    itemsChanged(t) {
        const {$controller: e} = this;
        if (!e.isActive) return;
        t |= e.flags;
        this.checkCollectionObserver(t);
        this.normalizeToArray(t);
        const s = i.onResolve(this.deactivateAllViews(null, t), (() => this.activateAllViews(null, t)));
        if (s instanceof Promise) s.catch((t => {
            throw t;
        }));
    }
    handleCollectionChange(t, e) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        e |= n.flags;
        this.normalizeToArray(e);
        if (void 0 === t) {
            const t = i.onResolve(this.deactivateAllViews(null, e), (() => this.activateAllViews(null, e)));
            if (t instanceof Promise) t.catch((t => {
                throw t;
            }));
        } else {
            const n = this.views.length;
            s.applyMutationsToIndices(t);
            if (t.deletedItems.length > 0) {
                t.deletedItems.sort(i.compareNumber);
                const s = i.onResolve(this.deactivateAndRemoveViewsByKey(t, e), (() => this.createAndActivateAndSortViewsByKey(n, t, e)));
                if (s instanceof Promise) s.catch((t => {
                    throw t;
                }));
            } else this.createAndActivateAndSortViewsByKey(n, t, e);
        }
    }
    checkCollectionObserver(t) {
        const e = this.observer;
        if (4 & t) {
            if (void 0 !== e) e.unsubscribe(this);
        } else if (this.$controller.isActive) {
            const t = this.observer = s.getCollectionObserver(this.items);
            if (e !== t && e) e.unsubscribe(this);
            if (t) t.subscribe(this);
        }
    }
    normalizeToArray(t) {
        const e = this.items;
        if (e instanceof Array) {
            this.normalizedItems = e;
            return;
        }
        const i = this.forOf;
        if (void 0 === i) return;
        const s = [];
        this.forOf.iterate(t, e, ((t, e, i) => {
            s[e] = i;
        }));
        this.normalizedItems = s;
    }
    activateAllViews(t, e) {
        let i;
        let n;
        let r;
        let o;
        const {$controller: l, factory: h, local: a, location: u, items: c} = this;
        const f = l.scope;
        const d = this.forOf.count(e, c);
        const p = this.views = Array(d);
        this.forOf.iterate(e, c, ((c, m, x) => {
            r = p[m] = h.create(e).setLocation(u);
            r.nodes.unlink();
            o = s.Scope.fromParent(f, s.BindingContext.create(a, x));
            ls(o.overrideContext, m, d);
            n = r.activate(null !== t && void 0 !== t ? t : r, l, e, o);
            if (n instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(n);
        }));
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    deactivateAllViews(t, e) {
        let i;
        let s;
        let n;
        const {views: r, $controller: o} = this;
        for (let l = 0, h = r.length; l < h; ++l) {
            n = r[l];
            n.release();
            s = n.deactivate(null !== t && void 0 !== t ? t : n, o, e);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    deactivateAndRemoveViewsByKey(t, e) {
        let i;
        let s;
        let n;
        const {$controller: r, views: o} = this;
        const l = t.deletedItems;
        const h = l.length;
        let a = 0;
        for (;a < h; ++a) {
            n = o[l[a]];
            n.release();
            s = n.deactivate(n, r, e);
            if (s instanceof Promise) (null !== i && void 0 !== i ? i : i = []).push(s);
        }
        a = 0;
        let u = 0;
        for (;a < h; ++a) {
            u = l[a] - a;
            o.splice(u, 1);
        }
        if (void 0 !== i) return 1 === i.length ? i[0] : Promise.all(i);
    }
    createAndActivateAndSortViewsByKey(t, e, i) {
        var n;
        let r;
        let o;
        let l;
        let h;
        const {$controller: a, factory: u, local: c, normalizedItems: f, location: d, views: p} = this;
        const m = e.length;
        for (let t = 0; t < m; ++t) if (-2 === e[t]) {
            l = u.create(i);
            p.splice(t, 0, l);
        }
        if (p.length !== m) throw new Error(`viewsLen=${p.length}, mapLen=${m}`);
        const x = a.scope;
        const v = e.length;
        s.synchronizeIndices(p, e);
        const g = os(e);
        const b = g.length;
        let w;
        let y = b - 1;
        let k = v - 1;
        for (;k >= 0; --k) {
            l = p[k];
            w = p[k + 1];
            l.nodes.link(null !== (n = null === w || void 0 === w ? void 0 : w.nodes) && void 0 !== n ? n : d);
            if (-2 === e[k]) {
                h = s.Scope.fromParent(x, s.BindingContext.create(c, f[k]));
                ls(h.overrideContext, k, v);
                l.setLocation(d);
                o = l.activate(l, a, i, h);
                if (o instanceof Promise) (null !== r && void 0 !== r ? r : r = []).push(o);
            } else if (y < 0 || 1 === b || k !== g[y]) {
                ls(l.scope.overrideContext, k, v);
                l.nodes.insertBefore(l.location);
            } else {
                if (t !== v) ls(l.scope.overrideContext, k, v);
                --y;
            }
        }
        if (void 0 !== r) return 1 === r.length ? r[0] : Promise.all(r);
    }
    dispose() {
        this.views.forEach(is);
        this.views = void 0;
    }
    accept(t) {
        const {views: e} = this;
        if (void 0 !== e) for (let i = 0, s = e.length; i < s; ++i) if (true === e[i].accept(t)) return true;
    }
};

n([ o ], exports.Repeat.prototype, "items", void 0);

exports.Repeat = n([ it("repeat"), r(0, fe), r(1, ie), r(2, $t) ], exports.Repeat);

let ss = 16;

let ns = new Int32Array(ss);

let rs = new Int32Array(ss);

function os(t) {
    const e = t.length;
    if (e > ss) {
        ss = e;
        ns = new Int32Array(e);
        rs = new Int32Array(e);
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
            o = ns[i];
            n = t[o];
            if (-2 !== n && n < s) {
                rs[r] = o;
                ns[++i] = r;
                continue;
            }
            l = 0;
            h = i;
            while (l < h) {
                a = l + h >> 1;
                n = t[ns[a]];
                if (-2 !== n && n < s) l = a + 1; else h = a;
            }
            n = t[ns[l]];
            if (s < n || -2 === n) {
                if (l > 0) rs[r] = ns[l - 1];
                ns[l] = r;
            }
        }
    }
    r = ++i;
    const u = new Int32Array(r);
    s = ns[i - 1];
    while (i-- > 0) {
        u[i] = s;
        s = rs[s];
    }
    while (r-- > 0) ns[r] = 0;
    return u;
}

function ls(t, e, i) {
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

exports.With = class With {
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
};

n([ o ], exports.With.prototype, "value", void 0);

exports.With = n([ it("with"), r(0, $t), r(1, fe) ], exports.With);

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

exports.Switch = n([ it("switch"), r(0, $t), r(1, fe) ], exports.Switch);

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

exports.Case = n([ it("case"), r(0, $t), r(1, s.IObserverLocator), r(2, fe), r(3, i.ILogger) ], exports.Case);

exports.DefaultCase = class DefaultCase extends exports.Case {
    linkToSwitch(t) {
        if (void 0 !== t.defaultCase) throw new Error("Multiple 'default-case's are not allowed.");
        t.defaultCase = this;
    }
};

exports.DefaultCase = n([ it("default-case") ], exports.DefaultCase);

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
        const a = this.pending;
        const u = this.viewScope;
        let c;
        const f = {
            reusable: false
        };
        const d = () => {
            void i.resolveAll(c = (this.preSettledTask = o.queueTask((() => i.resolveAll(null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === a || void 0 === a ? void 0 : a.activate(t, e, u))), f)).result, r.then((s => {
                if (this.value !== r) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => i.resolveAll(null === a || void 0 === a ? void 0 : a.deactivate(t, e), null === h || void 0 === h ? void 0 : h.deactivate(t, e), null === l || void 0 === l ? void 0 : l.activate(t, e, u, s))), f)).result;
                };
                if (1 === this.preSettledTask.status) void c.then(n); else {
                    this.preSettledTask.cancel();
                    n();
                }
            }), (s => {
                if (this.value !== r) return;
                const n = () => {
                    this.postSettlePromise = (this.postSettledTask = o.queueTask((() => i.resolveAll(null === a || void 0 === a ? void 0 : a.deactivate(t, e), null === l || void 0 === l ? void 0 : l.deactivate(t, e), null === h || void 0 === h ? void 0 : h.activate(t, e, u, s))), f)).result;
                };
                if (1 === this.preSettledTask.status) void c.then(n); else {
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

exports.PromiseTemplateController = n([ it("promise"), r(0, $t), r(1, fe), r(2, b), r(3, i.ILogger) ], exports.PromiseTemplateController);

exports.PendingTemplateController = class PendingTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = i.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        hs(e).pending = this;
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

exports.PendingTemplateController = n([ it("pending"), r(0, $t), r(1, fe) ], exports.PendingTemplateController);

exports.FulfilledTemplateController = class FulfilledTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = i.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        hs(e).fulfilled = this;
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

exports.FulfilledTemplateController = n([ it("then"), r(0, $t), r(1, fe) ], exports.FulfilledTemplateController);

exports.RejectedTemplateController = class RejectedTemplateController {
    constructor(t, e) {
        this.factory = t;
        this.id = i.nextId("au$component");
        this.view = this.factory.create().setLocation(e);
    }
    link(t, e, i, s, n) {
        hs(e).rejected = this;
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

exports.RejectedTemplateController = n([ it("catch"), r(0, $t), r(1, fe) ], exports.RejectedTemplateController);

function hs(t) {
    const e = t.parent;
    const i = null === e || void 0 === e ? void 0 : e.viewModel;
    if (i instanceof exports.PromiseTemplateController) return i;
    throw new Error("The parent promise.resolve not found; only `*[promise.resolve] > *[pending|then|catch]` relation is supported.");
}

function as(t, e, i, s) {
    if ("string" === typeof e) return us(t, e, i, s);
    if (ft.isType(e)) return cs(t, e, i, s);
    throw new Error(`Invalid Tag or Type.`);
}

class RenderPlan {
    constructor(t, e, i) {
        this.node = t;
        this.instructions = e;
        this.dependencies = i;
        this.lazyDef = void 0;
    }
    get definition() {
        if (void 0 === this.lazyDef) this.lazyDef = CustomElementDefinition.create({
            name: ft.generateName(),
            template: this.node,
            needsCompile: "string" === typeof this.node,
            instructions: this.instructions,
            dependencies: this.dependencies
        });
        return this.lazyDef;
    }
    createView(t) {
        return this.getViewFactory(t).create();
    }
    getViewFactory(t) {
        return t.root.get(Nt).getViewFactory(this.definition, t.createChild().register(...this.dependencies));
    }
    mergeInto(t, e, i) {
        t.appendChild(this.node);
        e.push(...this.instructions);
        i.push(...this.dependencies);
    }
}

function us(t, e, i, s) {
    const n = [];
    const r = [];
    const o = [];
    const l = t.document.createElement(e);
    let h = false;
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (Oe(e)) {
            h = true;
            n.push(e);
        } else l.setAttribute(t, e);
    }));
    if (h) {
        l.className = "au";
        r.push(n);
    }
    if (s) fs(t, l, s, r, o);
    return new RenderPlan(l, r, o);
}

function cs(t, e, i, s) {
    const n = ft.getDefinition(e);
    const r = [];
    const o = [ r ];
    const l = [];
    const h = [];
    const a = n.bindables;
    const u = t.document.createElement(n.name);
    u.className = "au";
    if (!l.includes(e)) l.push(e);
    r.push(new HydrateElementInstruction(n, void 0, h, null, false));
    if (i) Object.keys(i).forEach((t => {
        const e = i[t];
        if (Oe(e)) h.push(e); else if (void 0 === a[t]) h.push(new SetAttributeInstruction(e, t)); else h.push(new SetPropertyInstruction(e, t));
    }));
    if (s) fs(t, u, s, o, l);
    return new RenderPlan(u, o, l);
}

function fs(t, e, i, s, n) {
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

function ds(t, e) {
    const i = e.to;
    if (void 0 !== i && "subject" !== i && "composing" !== i) t[i] = e;
    return t;
}

exports.AuRender = class AuRender {
    constructor(t, e, s, n) {
        this.p = t;
        this.hdrContext = s;
        this.r = n;
        this.id = i.nextId("au$component");
        this.component = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.properties = e.instructions.reduce(ds, {});
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
        return this.deactivate(this.view, t, i);
    }
    componentChanged(t, e, s) {
        const {$controller: n} = this;
        if (!n.isActive) return;
        if (this.lastSubject === t) return;
        this.lastSubject = t;
        this.composing = true;
        s |= n.flags;
        const r = i.onResolve(this.deactivate(this.view, null, s), (() => this.compose(void 0, t, null, s)));
        if (r instanceof Promise) r.catch((t => {
            throw t;
        }));
    }
    compose(t, e, s, n) {
        return i.onResolve(void 0 === t ? i.onResolve(e, (t => this.resolveView(t, n))) : t, (t => this.activate(this.view = t, s, n)));
    }
    deactivate(t, e, i) {
        return null === t || void 0 === t ? void 0 : t.deactivate(null !== e && void 0 !== e ? e : t, this.$controller, i);
    }
    activate(t, e, s) {
        const {$controller: n} = this;
        return i.onResolve(null === t || void 0 === t ? void 0 : t.activate(null !== e && void 0 !== e ? e : t, n, s, n.scope), (() => {
            this.composing = false;
        }));
    }
    resolveView(t, e) {
        const i = this.provideViewFor(t, e);
        if (i) {
            i.setLocation(this.$controller.location);
            i.lockScope(this.$controller.scope);
            return i;
        }
        return;
    }
    provideViewFor(t, e) {
        if (!t) return;
        const i = this.hdrContext.controller.container;
        if ("object" === typeof t) {
            if (ps(t)) return t;
            if ("createView" in t) return t.createView(i);
            if ("create" in t) return t.create(e);
            if ("template" in t) return this.r.getViewFactory(CustomElementDefinition.getOrCreate(t), i).create(e);
        }
        if ("string" === typeof t) {
            const e = i.find(ft, t);
            if (null == e) throw new Error(`Unable to find custom element ${t} for <au-render>.`);
            t = e.Type;
        }
        return as(this.p, t, this.properties, this.$controller.host.childNodes).createView(i);
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

exports.AuRender = n([ lt({
    name: "au-render",
    template: null,
    containerless: true
}), r(0, b), r(1, Ee), r(2, se), r(3, Nt) ], exports.AuRender);

function ps(t) {
    return "lockScope" in t;
}

exports.AuCompose = class AuCompose {
    constructor(t, e, i, s, n, r) {
        this.container = t;
        this.parent = e;
        this.host = i;
        this.p = s;
        this.instruction = n;
        this.contextFactory = r;
        this.scopeBehavior = "auto";
        this.c = void 0;
        this.loc = n.containerless ? xe(this.host) : void 0;
        this.r = t.get(Nt);
    }
    static get inject() {
        return [ i.IContainer, ie, ue, b, Ee, i.transient(CompositionContextFactory) ];
    }
    get pending() {
        return this.o;
    }
    get composition() {
        return this.c;
    }
    attaching(t, e, s) {
        return this.o = i.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, t, void 0)), (t => {
            if (this.contextFactory.isCurrent(t)) this.o = void 0;
        }));
    }
    detaching(t) {
        const e = this.c;
        const s = this.o;
        this.contextFactory.invalidate();
        this.c = this.o = void 0;
        return i.onResolve(s, (() => null === e || void 0 === e ? void 0 : e.deactivate(t)));
    }
    propertyChanged(t) {
        if ("model" === t && null != this.c) {
            this.c.update(this.model);
            return;
        }
        this.o = i.onResolve(this.o, (() => i.onResolve(this.queue(new ChangeInfo(this.view, this.viewModel, this.model, void 0, t)), (t => {
            if (this.contextFactory.isCurrent(t)) this.o = void 0;
        }))));
    }
    queue(t) {
        const e = this.contextFactory;
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
        const {view: o, viewModel: l, model: h, initiator: a} = t.change;
        const {container: u, host: c, $controller: f, loc: d} = this;
        const p = this.getDef(l);
        const m = u.createChild();
        const x = null == d ? c.parentNode : d.parentNode;
        if (null !== p) {
            if (p.containerless) throw new Error("Containerless custom element is not supported by <au-compose/>");
            if (null == d) {
                n = c;
                r = () => {};
            } else {
                n = x.insertBefore(this.p.document.createElement(p.name), d);
                r = () => {
                    n.remove();
                };
            }
            e = this.getVm(m, l, n);
        } else {
            n = null == d ? c : d;
            e = this.getVm(m, l, n);
        }
        const v = () => {
            if (null !== p) {
                const s = Controller.forCustomElement(m, e, n, null, 0, p);
                return new CompositionController(s, (() => s.activate(null !== a && void 0 !== a ? a : s, f, 2)), (t => i.onResolve(s.deactivate(null !== t && void 0 !== t ? t : s, f, 4), r)), (t => {
                    var i;
                    return null === (i = e.activate) || void 0 === i ? void 0 : i.call(e, t);
                }), t);
            } else {
                const i = CustomElementDefinition.create({
                    name: ft.generateName(),
                    template: o
                });
                const r = this.r.getViewFactory(i, m);
                const l = Controller.forSyntheticView(r, 2, f);
                const h = "auto" === this.scopeBehavior ? s.Scope.fromParent(this.parent.scope, e) : s.Scope.create(e);
                if (ve(n)) l.setLocation(n); else l.setHost(n);
                return new CompositionController(l, (() => l.activate(null !== a && void 0 !== a ? a : l, f, 2, h)), (t => l.deactivate(null !== t && void 0 !== t ? t : l, f, 4)), (t => {
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
        const r = ve(s);
        t.registerResolver(n.Element, t.registerResolver(ue, new i.InstanceProvider("ElementResolver", r ? null : s)));
        t.registerResolver(fe, new i.InstanceProvider("IRenderLocation", r ? s : null));
        const o = t.invoke(e);
        t.registerResolver(e, new i.InstanceProvider("au-compose.viewModel", o));
        return o;
    }
    getDef(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return ft.isType(e) ? ft.getDefinition(e) : null;
    }
};

n([ o ], exports.AuCompose.prototype, "view", void 0);

n([ o ], exports.AuCompose.prototype, "viewModel", void 0);

n([ o ], exports.AuCompose.prototype, "model", void 0);

n([ o({
    set: t => {
        if ("scoped" === t || "auto" === t) return t;
        throw new Error('Invalid scope behavior config. Only "scoped" or "auto" allowed.');
    }
}) ], exports.AuCompose.prototype, "scopeBehavior", void 0);

exports.AuCompose = n([ lt("au-compose") ], exports.AuCompose);

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
        var n, r;
        this.hdrContext = i;
        this.parentScope = null;
        this.outerScope = null;
        let o;
        const l = e.auSlot;
        const h = null === (r = null === (n = i.instruction) || void 0 === n ? void 0 : n.projections) || void 0 === r ? void 0 : r[l.name];
        if (null == h) {
            o = s.getViewFactory(l.fallback, i.controller.container);
            this.hasProjection = false;
        } else {
            o = s.getViewFactory(h, i.parent.controller.container);
            this.hasProjection = true;
        }
        this.view = o.create().setLocation(t);
    }
    static get inject() {
        return [ fe, Ee, se, Nt ];
    }
    binding(t, e, i) {
        var n;
        this.parentScope = this.$controller.scope.parentScope;
        let r;
        if (this.hasProjection) {
            r = this.hdrContext.controller.scope.parentScope;
            (this.outerScope = s.Scope.fromParent(r, r.bindingContext)).overrideContext.$host = null !== (n = this.expose) && void 0 !== n ? n : this.parentScope.bindingContext;
        }
    }
    attaching(t, e, i) {
        return this.view.activate(t, this.$controller, i, this.hasProjection ? this.outerScope : this.parentScope);
    }
    detaching(t, e, i) {
        return this.view.deactivate(t, this.$controller, i);
    }
    exposeChanged(t) {
        if (this.hasProjection && null != this.outerScope) this.outerScope.overrideContext.$host = t;
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

lt({
    name: "au-slot",
    template: null,
    containerless: true
})(AuSlot);

const ms = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

const xs = i.DI.createInterface("ISanitizer", (t => t.singleton(class {
    sanitize(t) {
        return t.replace(ms, "");
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

exports.SanitizeValueConverter = n([ r(0, xs) ], exports.SanitizeValueConverter);

s.valueConverter("sanitize")(exports.SanitizeValueConverter);

exports.ViewValueConverter = class ViewValueConverter {
    constructor(t) {
        this.viewLocator = t;
    }
    toView(t, e) {
        return this.viewLocator.getViewComponentForObject(t, e);
    }
};

exports.ViewValueConverter = n([ r(0, Ft) ], exports.ViewValueConverter);

s.valueConverter("view")(exports.ViewValueConverter);

const vs = DebounceBindingBehavior;

const gs = OneTimeBindingBehavior;

const bs = ToViewBindingBehavior;

const ws = FromViewBindingBehavior;

const ys = exports.SignalBindingBehavior;

const ks = ThrottleBindingBehavior;

const Cs = TwoWayBindingBehavior;

const As = TemplateCompiler;

const Ss = NodeObserverLocator;

const Es = [ As, Ss ];

const Os = SVGAnalyzer;

const Bs = exports.AtPrefixedTriggerAttributePattern;

const Ts = exports.ColonPrefixedBindAttributePattern;

const Is = exports.RefAttributePattern;

const Rs = exports.DotSeparatedAttributePattern;

const Ds = [ Is, Rs ];

const js = [ Bs, Ts ];

const $s = exports.CallBindingCommand;

const Ps = exports.DefaultBindingCommand;

const Ls = exports.ForBindingCommand;

const qs = exports.FromViewBindingCommand;

const Ms = exports.OneTimeBindingCommand;

const Vs = exports.ToViewBindingCommand;

const Fs = exports.TwoWayBindingCommand;

const Ns = di;

const Hs = exports.TriggerBindingCommand;

const zs = exports.DelegateBindingCommand;

const Us = exports.CaptureBindingCommand;

const Ws = exports.AttrBindingCommand;

const Gs = exports.ClassBindingCommand;

const Ks = exports.StyleBindingCommand;

const Xs = [ Ps, Ms, qs, Vs, Fs, $s, Ls, Ns, Hs, zs, Us, Gs, Ks, Ws ];

const Ys = exports.SanitizeValueConverter;

const Qs = exports.ViewValueConverter;

const _s = FrequentMutations;

const Zs = ObserveShallow;

const Js = exports.If;

const tn = exports.Else;

const en = exports.Repeat;

const sn = exports.With;

const nn = exports.Switch;

const rn = exports.Case;

const on = exports.DefaultCase;

const ln = exports.PromiseTemplateController;

const hn = exports.PendingTemplateController;

const an = exports.FulfilledTemplateController;

const un = exports.RejectedTemplateController;

const cn = exports.AttrBindingBehavior;

const fn = exports.SelfBindingBehavior;

const dn = exports.UpdateTriggerBindingBehavior;

const pn = exports.AuRender;

const mn = exports.AuCompose;

const xn = exports.Portal;

const vn = exports.Focus;

const gn = es;

const bn = [ vs, gs, bs, ws, ys, ks, Cs, Ys, Qs, _s, Zs, Js, tn, en, sn, nn, rn, on, ln, hn, an, un, cn, fn, dn, pn, mn, xn, vn, gn, AuSlot ];

const wn = Ve;

const yn = Le;

const kn = Pe;

const Cn = Ne;

const An = ze;

const Sn = Me;

const En = He;

const On = Fe;

const Bn = $e;

const Tn = qe;

const In = Xe;

const Rn = Je;

const Dn = Ye;

const jn = Qe;

const $n = _e;

const Pn = Ze;

const Ln = Ke;

const qn = [ En, An, wn, On, Cn, Bn, kn, yn, Tn, Sn, In, Rn, Dn, jn, $n, Pn, Ln ];

const Mn = {
    register(t) {
        return t.register(...Es, ...bn, ...Ds, ...Xs, ...qn);
    },
    createContainer() {
        return this.register(i.DI.createContainer());
    }
};

const Vn = i.DI.createInterface("IAurelia");

class Aurelia {
    constructor(t = i.DI.createContainer()) {
        this.container = t;
        this.l = false;
        this.u = false;
        this.v = false;
        this.C = void 0;
        this.next = void 0;
        this.startPromise = void 0;
        this.stopPromise = void 0;
        if (t.has(Vn, true)) throw new Error("An instance of Aurelia is already registered with the container or an ancestor of it.");
        t.registerResolver(Vn, new i.InstanceProvider("IAurelia", this));
        t.registerResolver(re, this.rootProvider = new i.InstanceProvider("IAppRoot"));
    }
    get isRunning() {
        return this.l;
    }
    get isStarting() {
        return this.u;
    }
    get isStopping() {
        return this.v;
    }
    get root() {
        if (null == this.C) {
            if (null == this.next) throw new Error(`root is not defined`);
            return this.next;
        }
        return this.C;
    }
    register(...t) {
        this.container.register(...t);
        return this;
    }
    app(t) {
        this.next = new AppRoot(t, this.initPlatform(t.host), this.container, this.rootProvider);
        return this;
    }
    enhance(t, e) {
        var s;
        const n = null !== (s = t.container) && void 0 !== s ? s : this.container.createChild();
        const r = t.host;
        const o = this.initPlatform(r);
        const l = t.component;
        let h;
        if ("function" === typeof l) {
            n.registerResolver(o.Element, n.registerResolver(ue, new i.InstanceProvider("ElementResolver", r)));
            h = n.invoke(l);
        } else h = l;
        n.registerResolver(ce, new i.InstanceProvider("IEventTarget", r));
        e = null !== e && void 0 !== e ? e : null;
        const a = Controller.forCustomElement(n, h, r, null, void 0, CustomElementDefinition.create({
            name: ft.generateName(),
            template: r,
            enhance: true
        }));
        return i.onResolve(a.activate(a, e, 2), (() => a));
    }
    async waitForIdle() {
        const t = this.root.platform;
        await t.domWriteQueue.yield();
        await t.domReadQueue.yield();
        await t.taskQueue.yield();
    }
    initPlatform(t) {
        let s;
        if (!this.container.has(b, false)) {
            if (null === t.ownerDocument.defaultView) throw new Error(`Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`);
            s = new e.BrowserPlatform(t.ownerDocument.defaultView);
            this.container.register(i.Registration.instance(b, s));
        } else s = this.container.get(b);
        return s;
    }
    start(t = this.next) {
        if (null == t) throw new Error(`There is no composition root`);
        if (this.startPromise instanceof Promise) return this.startPromise;
        return this.startPromise = i.onResolve(this.stop(), (() => {
            Reflect.set(t.host, "$aurelia", this);
            this.rootProvider.prepare(this.C = t);
            this.u = true;
            return i.onResolve(t.activate(), (() => {
                this.l = true;
                this.u = false;
                this.startPromise = void 0;
                this.dispatchEvent(t, "au-started", t.host);
            }));
        }));
    }
    stop(t = false) {
        if (this.stopPromise instanceof Promise) return this.stopPromise;
        if (true === this.l) {
            const e = this.C;
            this.l = false;
            this.v = true;
            return this.stopPromise = i.onResolve(e.deactivate(), (() => {
                Reflect.deleteProperty(e.host, "$aurelia");
                if (t) e.dispose();
                this.C = void 0;
                this.rootProvider.dispose();
                this.v = false;
                this.dispatchEvent(e, "au-stopped", e.host);
            }));
        }
    }
    dispose() {
        if (this.l || this.v) throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
        this.container.dispose();
    }
    dispatchEvent(t, e, i) {
        const s = new t.platform.window.CustomEvent(e, {
            detail: this,
            bubbles: true,
            cancelable: true
        });
        i.dispatchEvent(s);
    }
}

const Fn = i.DI.createInterface("IDialogService");

const Nn = i.DI.createInterface("IDialogController");

const Hn = i.DI.createInterface("IDialogDomRenderer");

const zn = i.DI.createInterface("IDialogDom");

const Un = i.DI.createInterface("IDialogGlobalSettings");

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
            this.resolve = t;
            this.reject = e;
        }));
    }
    static get inject() {
        return [ b, i.IContainer ];
    }
    activate(t) {
        var e;
        const s = this.ctn.createChild();
        const {model: n, template: r, rejectOnCancel: o} = t;
        const l = s.get(Hn);
        const h = null !== (e = t.host) && void 0 !== e ? e : this.p.document.body;
        const a = this.dom = l.render(h, t);
        const u = s.has(ce, true) ? s.get(ce) : null;
        const c = a.contentHost;
        this.settings = t;
        if (null == u || !u.contains(h)) s.register(i.Registration.instance(ce, h));
        s.register(i.Registration.instance(ue, c), i.Registration.instance(zn, a));
        return new Promise((e => {
            var i, r;
            const o = Object.assign(this.cmp = this.getOrCreateVm(s, t, c), {
                $dialog: this
            });
            e(null !== (r = null === (i = o.canActivate) || void 0 === i ? void 0 : i.call(o, n)) && void 0 !== r ? r : true);
        })).then((e => {
            var l;
            if (true !== e) {
                a.dispose();
                if (o) throw Wn(null, "Dialog activation rejected");
                return DialogOpenResult.create(true, this);
            }
            const h = this.cmp;
            return i.onResolve(null === (l = h.activate) || void 0 === l ? void 0 : l.call(h, n), (() => {
                var e;
                const n = this.controller = Controller.forCustomElement(s, h, c, null, 0, CustomElementDefinition.create(null !== (e = this.getDefinition(h)) && void 0 !== e ? e : {
                    name: ft.generateName(),
                    template: r
                }));
                return i.onResolve(n.activate(n, null, 2), (() => {
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
        if (this.closingPromise) return this.closingPromise;
        let s = true;
        const {controller: n, dom: r, cmp: o, settings: {mouseEvent: l, rejectOnCancel: h}} = this;
        const a = DialogCloseResult.create(t, e);
        const u = new Promise((u => {
            var c, f;
            u(i.onResolve(null !== (f = null === (c = o.canDeactivate) || void 0 === c ? void 0 : c.call(o, a)) && void 0 !== f ? f : true, (u => {
                var c;
                if (true !== u) {
                    s = false;
                    this.closingPromise = void 0;
                    if (h) throw Wn(null, "Dialog cancellation rejected");
                    return DialogCloseResult.create("abort");
                }
                return i.onResolve(null === (c = o.deactivate) || void 0 === c ? void 0 : c.call(o, a), (() => i.onResolve(n.deactivate(n, null, 4), (() => {
                    r.dispose();
                    r.overlay.removeEventListener(null !== l && void 0 !== l ? l : "click", this);
                    if (!h && "error" !== t) this.resolve(a); else this.reject(Wn(e, "Dialog cancelled with a rejection on cancel"));
                    return a;
                }))));
            })));
        })).catch((t => {
            this.closingPromise = void 0;
            throw t;
        }));
        this.closingPromise = s ? u : void 0;
        return u;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(t) {
        const e = Gn(t);
        return new Promise((t => {
            var s, n;
            return t(i.onResolve(null === (n = (s = this.cmp).deactivate) || void 0 === n ? void 0 : n.call(s, DialogCloseResult.create("error", e)), (() => i.onResolve(this.controller.deactivate(this.controller, null, 4), (() => {
                this.dom.dispose();
                this.reject(e);
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
        t.registerResolver(ue, t.registerResolver(r.Element, new i.InstanceProvider("ElementResolver", s)));
        return t.invoke(n);
    }
    getDefinition(t) {
        const e = "function" === typeof t ? t : null === t || void 0 === t ? void 0 : t.constructor;
        return ft.isType(e) ? ft.getDefinition(e) : null;
    }
}

class EmptyComponent {}

function Wn(t, e) {
    const i = new Error(e);
    i.wasCancelled = true;
    i.value = t;
    return i;
}

function Gn(t) {
    const e = new Error;
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor(t, e, i) {
        this.container = t;
        this.p = e;
        this.defaultSettings = i;
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
        return [ i.IContainer, b, Un ];
    }
    static register(t) {
        t.register(i.Registration.singleton(Fn, this), U.beforeDeactivate(Fn, (t => i.onResolve(t.closeAll(), (t => {
            if (t.length > 0) throw new Error(`There are still ${t.length} open dialog(s).`);
        })))));
    }
    open(t) {
        return Xn(new Promise((e => {
            var s;
            const n = DialogSettings.from(this.defaultSettings, t);
            const r = null !== (s = n.container) && void 0 !== s ? s : this.container.createChild();
            e(i.onResolve(n.load(), (t => {
                const e = r.invoke(DialogController);
                r.register(i.Registration.instance(Nn, e));
                r.register(i.Registration.callback(DialogController, (() => {
                    throw new Error("Invalid injection of DialogController. Use IDialogController instead.");
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
        const i = Yn(e);
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
        const s = this.template;
        const n = i.resolveAll(null == e ? void 0 : i.onResolve(e(), (e => {
            t.component = e;
        })), "function" === typeof s ? i.onResolve(s(), (e => {
            t.template = e;
        })) : void 0);
        return n instanceof Promise ? n.then((() => t)) : t;
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

function Kn(t, e) {
    return this.then((i => i.dialog.closed.then(t, e)), e);
}

function Xn(t) {
    t.whenClosed = Kn;
    return t;
}

function Yn(t) {
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
        i.Registration.singleton(Un, this).register(t);
    }
}

const Qn = "position:absolute;width:100%;height:100%;top:0;left:0;";

class DefaultDialogDomRenderer {
    constructor(t) {
        this.p = t;
        this.wrapperCss = `${Qn} display:flex;`;
        this.overlayCss = Qn;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        i.Registration.singleton(Hn, this).register(t);
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

DefaultDialogDomRenderer.inject = [ b ];

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

function _n(t, e) {
    return {
        settingsProvider: t,
        register: i => i.register(...e, U.beforeCreate((() => t(i.get(Un))))),
        customize(t, i) {
            return _n(t, null !== i && void 0 !== i ? i : e);
        }
    };
}

const Zn = _n((() => {
    throw new Error("Invalid dialog configuration. " + "Specify the implementations for " + "<IDialogService>, <IDialogGlobalSettings> and <IDialogDomRenderer>, " + "or use the DialogDefaultConfiguration export.");
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(i.Registration.singleton(Un, this));
    }
} ]);

const Jn = _n(i.noop, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer ]);

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

exports.AppTask = U;

exports.AtPrefixedTriggerAttributePatternRegistration = Bs;

exports.AttrBindingBehaviorRegistration = cn;

exports.AttrBindingCommandRegistration = Ws;

exports.AttrSyntax = AttrSyntax;

exports.AttributeBinding = AttributeBinding;

exports.AttributeBindingInstruction = AttributeBindingInstruction;

exports.AttributeBindingRendererRegistration = Rn;

exports.AttributeNSAccessor = AttributeNSAccessor;

exports.AttributePattern = m;

exports.AuRenderRegistration = pn;

exports.AuSlot = AuSlot;

exports.AuSlotsInfo = AuSlotsInfo;

exports.Aurelia = Aurelia;

exports.Bindable = h;

exports.BindableDefinition = BindableDefinition;

exports.BindableObserver = BindableObserver;

exports.BindablesInfo = BindablesInfo;

exports.BindingCommand = fi;

exports.BindingCommandDefinition = BindingCommandDefinition;

exports.BindingModeBehavior = BindingModeBehavior;

exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;

exports.CallBinding = CallBinding;

exports.CallBindingCommandRegistration = $s;

exports.CallBindingInstruction = CallBindingInstruction;

exports.CallBindingRendererRegistration = wn;

exports.CaptureBindingCommandRegistration = Us;

exports.CheckedObserver = CheckedObserver;

exports.Children = X;

exports.ChildrenDefinition = ChildrenDefinition;

exports.ClassAttributeAccessor = ClassAttributeAccessor;

exports.ClassBindingCommandRegistration = Gs;

exports.ColonPrefixedBindAttributePatternRegistration = Ts;

exports.ComputedWatcher = ComputedWatcher;

exports.Controller = Controller;

exports.CustomAttribute = st;

exports.CustomAttributeDefinition = CustomAttributeDefinition;

exports.CustomAttributeRendererRegistration = yn;

exports.CustomElement = ft;

exports.CustomElementDefinition = CustomElementDefinition;

exports.CustomElementRendererRegistration = kn;

exports.DataAttributeAccessor = DataAttributeAccessor;

exports.DebounceBindingBehavior = DebounceBindingBehavior;

exports.DebounceBindingBehaviorRegistration = vs;

exports.DefaultBindingCommandRegistration = Ps;

exports.DefaultBindingLanguage = Xs;

exports.DefaultBindingSyntax = Ds;

exports.DefaultComponents = Es;

exports.DefaultDialogDom = DefaultDialogDom;

exports.DefaultDialogDomRenderer = DefaultDialogDomRenderer;

exports.DefaultDialogGlobalSettings = DefaultDialogGlobalSettings;

exports.DefaultRenderers = qn;

exports.DefaultResources = bn;

exports.DelegateBindingCommandRegistration = zs;

exports.DialogCloseResult = DialogCloseResult;

exports.DialogConfiguration = Zn;

exports.DialogController = DialogController;

exports.DialogDefaultConfiguration = Jn;

exports.DialogOpenResult = DialogOpenResult;

exports.DialogService = DialogService;

exports.DotSeparatedAttributePatternRegistration = Rs;

exports.ElseRegistration = tn;

exports.EventDelegator = EventDelegator;

exports.EventSubscriber = EventSubscriber;

exports.ExpressionWatcher = ExpressionWatcher;

exports.ForBindingCommandRegistration = Ls;

exports.FragmentNodeSequence = FragmentNodeSequence;

exports.FrequentMutations = FrequentMutations;

exports.FromViewBindingBehavior = FromViewBindingBehavior;

exports.FromViewBindingBehaviorRegistration = ws;

exports.FromViewBindingCommandRegistration = qs;

exports.HydrateAttributeInstruction = HydrateAttributeInstruction;

exports.HydrateElementInstruction = HydrateElementInstruction;

exports.HydrateLetElementInstruction = HydrateLetElementInstruction;

exports.HydrateTemplateController = HydrateTemplateController;

exports.IAppRoot = re;

exports.IAppTask = z;

exports.IAttrMapper = k;

exports.IAttributeParser = f;

exports.IAttributePattern = c;

exports.IAuSlotsInfo = Se;

exports.IAurelia = Vn;

exports.IController = ie;

exports.IDialogController = Nn;

exports.IDialogDom = zn;

exports.IDialogDomRenderer = Hn;

exports.IDialogGlobalSettings = Un;

exports.IDialogService = Fn;

exports.IEventDelegator = Ce;

exports.IEventTarget = ce;

exports.IHistory = we;

exports.IHydrationContext = se;

exports.IInstruction = Ee;

exports.ILifecycleHooks = It;

exports.ILocation = be;

exports.INode = ue;

exports.INodeObserverLocatorRegistration = Ss;

exports.IPlatform = b;

exports.IProjections = Ae;

exports.IRenderLocation = fe;

exports.IRenderer = Te;

exports.IRendering = Nt;

exports.ISVGAnalyzer = w;

exports.ISanitizer = xs;

exports.IShadowDOMGlobalStyles = At;

exports.IShadowDOMStyleFactory = wt;

exports.IShadowDOMStyles = Ct;

exports.ISyntaxInterpreter = u;

exports.ITemplateCompiler = Be;

exports.ITemplateCompilerHooks = Ii;

exports.ITemplateCompilerRegistration = As;

exports.ITemplateElementFactory = pi;

exports.IViewFactory = $t;

exports.IViewLocator = Ft;

exports.IWindow = ge;

exports.IWorkTracker = oe;

exports.IfRegistration = Js;

exports.InterpolationBinding = InterpolationBinding;

exports.InterpolationBindingRendererRegistration = Cn;

exports.InterpolationInstruction = InterpolationInstruction;

exports.Interpretation = Interpretation;

exports.IteratorBindingInstruction = IteratorBindingInstruction;

exports.IteratorBindingRendererRegistration = An;

exports.LetBinding = LetBinding;

exports.LetBindingInstruction = LetBindingInstruction;

exports.LetElementRendererRegistration = Sn;

exports.LifecycleHooks = Dt;

exports.LifecycleHooksDefinition = LifecycleHooksDefinition;

exports.LifecycleHooksEntry = LifecycleHooksEntry;

exports.Listener = Listener;

exports.ListenerBindingInstruction = ListenerBindingInstruction;

exports.ListenerBindingRendererRegistration = In;

exports.NodeObserverConfig = NodeObserverConfig;

exports.NodeObserverLocator = NodeObserverLocator;

exports.NoopSVGAnalyzer = NoopSVGAnalyzer;

exports.ObserveShallow = ObserveShallow;

exports.OneTimeBindingBehavior = OneTimeBindingBehavior;

exports.OneTimeBindingBehaviorRegistration = gs;

exports.OneTimeBindingCommandRegistration = Ms;

exports.PropertyBinding = PropertyBinding;

exports.PropertyBindingInstruction = PropertyBindingInstruction;

exports.PropertyBindingRendererRegistration = En;

exports.RefAttributePatternRegistration = Is;

exports.RefBinding = RefBinding;

exports.RefBindingCommandRegistration = Ns;

exports.RefBindingInstruction = RefBindingInstruction;

exports.RefBindingRendererRegistration = On;

exports.RenderPlan = RenderPlan;

exports.Rendering = Rendering;

exports.RepeatRegistration = en;

exports.SVGAnalyzer = SVGAnalyzer;

exports.SVGAnalyzerRegistration = Os;

exports.SanitizeValueConverterRegistration = Ys;

exports.SelectValueObserver = SelectValueObserver;

exports.SelfBindingBehaviorRegistration = fn;

exports.SetAttributeInstruction = SetAttributeInstruction;

exports.SetAttributeRendererRegistration = Dn;

exports.SetClassAttributeInstruction = SetClassAttributeInstruction;

exports.SetClassAttributeRendererRegistration = jn;

exports.SetPropertyInstruction = SetPropertyInstruction;

exports.SetPropertyRendererRegistration = Bn;

exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;

exports.SetStyleAttributeRendererRegistration = $n;

exports.ShadowDOMRegistry = ShadowDOMRegistry;

exports.ShortHandBindingSyntax = js;

exports.SignalBindingBehaviorRegistration = ys;

exports.StandardConfiguration = Mn;

exports.StyleAttributeAccessor = StyleAttributeAccessor;

exports.StyleBindingCommandRegistration = Ks;

exports.StyleConfiguration = St;

exports.StyleElementStyles = StyleElementStyles;

exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;

exports.StylePropertyBindingRendererRegistration = Pn;

exports.TemplateCompiler = TemplateCompiler;

exports.TemplateCompilerHooks = ji;

exports.TemplateControllerRendererRegistration = Tn;

exports.TextBindingInstruction = TextBindingInstruction;

exports.TextBindingRendererRegistration = Ln;

exports.ThrottleBindingBehavior = ThrottleBindingBehavior;

exports.ThrottleBindingBehaviorRegistration = ks;

exports.ToViewBindingBehavior = ToViewBindingBehavior;

exports.ToViewBindingBehaviorRegistration = bs;

exports.ToViewBindingCommandRegistration = Vs;

exports.TriggerBindingCommandRegistration = Hs;

exports.TwoWayBindingBehavior = TwoWayBindingBehavior;

exports.TwoWayBindingBehaviorRegistration = Cs;

exports.TwoWayBindingCommandRegistration = Fs;

exports.UpdateTriggerBindingBehaviorRegistration = dn;

exports.ValueAttributeObserver = ValueAttributeObserver;

exports.ViewFactory = ViewFactory;

exports.ViewLocator = ViewLocator;

exports.ViewValueConverterRegistration = Qs;

exports.Views = Mt;

exports.Watch = ot;

exports.WithRegistration = sn;

exports.allResources = xi;

exports.attributePattern = p;

exports.bindable = o;

exports.bindingCommand = ci;

exports.children = G;

exports.containerless = at;

exports.convertToRenderLocation = xe;

exports.createElement = as;

exports.cssModules = gt;

exports.customAttribute = et;

exports.customElement = lt;

exports.getEffectiveParentNode = pe;

exports.getRef = he;

exports.isCustomElementController = _t;

exports.isCustomElementViewModel = Zt;

exports.isInstruction = Oe;

exports.isRenderLocation = ve;

exports.lifecycleHooks = jt;

exports.processContent = pt;

exports.renderer = Ie;

exports.setEffectiveParentNode = me;

exports.setRef = ae;

exports.shadowCSS = bt;

exports.templateCompilerHooks = $i;

exports.templateController = it;

exports.useShadowDOM = ht;

exports.view = Vt;

exports.watch = nt;
//# sourceMappingURL=index.js.map
