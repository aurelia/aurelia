"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/metadata");

var n = require("@aurelia/expression-parser");

const r = t.DI.createInterface;

const i = Object.freeze;

const {aliasTo: s, singleton: l} = t.Registration;

const o = "Interpolation";

const u = "IsFunction";

const c = "IsProperty";

const a = "custom-element";

const h = /*@__PURE__*/ i({
    default: 0,
    oneTime: 1,
    toView: 2,
    fromView: 4,
    twoWay: 6
});

const d = /*@__PURE__*/ r("ITemplateCompiler");

const f = /*@__PURE__*/ r("IAttrMapper");

const createMappedError = (t, ...e) => {
    const n = String(t).padStart(4, "0");
    return new Error(`AUR${n}:${e.map(String)}`);
};

var p, m, g, w, b;

class CharSpec {
    constructor(t, e, n, r) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = n;
        this.isInverted = r;
        if (r) {
            switch (t.length) {
              case 0:
                this.has = this.i;
                break;

              case 1:
                this.has = this.u;
                break;

              default:
                this.has = this.A;
            }
        } else {
            switch (t.length) {
              case 0:
                this.has = this.I;
                break;

              case 1:
                this.has = this.B;
                break;

              default:
                this.has = this.P;
            }
        }
    }
    equals(t) {
        return this.chars === t.chars && this.repeat === t.repeat && this.isSymbol === t.isSymbol && this.isInverted === t.isInverted;
    }
    P(t) {
        return this.chars.includes(t);
    }
    B(t) {
        return this.chars === t;
    }
    I(t) {
        return false;
    }
    A(t) {
        return !this.chars.includes(t);
    }
    u(t) {
        return this.chars !== t;
    }
    i(t) {
        return true;
    }
}

class Interpretation {
    constructor() {
        this.parts = t.emptyArray;
        this.C = "";
        this.T = {};
        this.R = {};
    }
    get pattern() {
        const t = this.C;
        if (t === "") {
            return null;
        } else {
            return t;
        }
    }
    set pattern(e) {
        if (e == null) {
            this.C = "";
            this.parts = t.emptyArray;
        } else {
            this.C = e;
            this.parts = this.R[e];
        }
    }
    append(t, e) {
        const n = this.T;
        if (n[t] === undefined) {
            n[t] = e;
        } else {
            n[t] += e;
        }
    }
    next(t) {
        const e = this.T;
        let n;
        if (e[t] !== undefined) {
            n = this.R;
            if (n[t] === undefined) {
                n[t] = [ e[t] ];
            } else {
                n[t].push(e[t]);
            }
            e[t] = undefined;
        }
    }
}

class AttrParsingState {
    get C() {
        return this._ ? this.L[0] : null;
    }
    constructor(t, ...e) {
        this.charSpec = t;
        this.V = [];
        this.H = null;
        this._ = false;
        this.L = e;
    }
    findChild(t) {
        const e = this.V;
        const n = e.length;
        let r = null;
        let i = 0;
        for (;i < n; ++i) {
            r = e[i];
            if (t.equals(r.charSpec)) {
                return r;
            }
        }
        return null;
    }
    append(t, e) {
        const n = this.L;
        if (!n.includes(e)) {
            n.push(e);
        }
        let r = this.findChild(t);
        if (r == null) {
            r = new AttrParsingState(t, e);
            this.V.push(r);
            if (t.repeat) {
                r.V.push(r);
            }
        }
        return r;
    }
    findMatches(t, e) {
        const n = [];
        const r = this.V;
        const i = r.length;
        let s = 0;
        let l = null;
        let o = 0;
        let u = 0;
        for (;o < i; ++o) {
            l = r[o];
            if (l.charSpec.has(t)) {
                n.push(l);
                s = l.L.length;
                u = 0;
                if (l.charSpec.isSymbol) {
                    for (;u < s; ++u) {
                        e.next(l.L[u]);
                    }
                } else {
                    for (;u < s; ++u) {
                        e.append(l.L[u], t);
                    }
                }
            }
        }
        return n;
    }
}

class StaticSegment {
    constructor(t) {
        this.text = t;
        const e = this.M = t.length;
        const n = this.$ = [];
        let r = 0;
        for (;e > r; ++r) {
            n.push(new CharSpec(t[r], false, false, false));
        }
    }
    eachChar(t) {
        const e = this.M;
        const n = this.$;
        let r = 0;
        for (;e > r; ++r) {
            t(n[r]);
        }
    }
}

class DynamicSegment {
    constructor(t) {
        this.text = "PART";
        this.F = new CharSpec(t, true, false, true);
    }
    eachChar(t) {
        t(this.F);
    }
}

class SymbolSegment {
    constructor(t) {
        this.text = t;
        this.F = new CharSpec(t, false, true, false);
    }
    eachChar(t) {
        t(this.F);
    }
}

class SegmentTypes {
    constructor() {
        this.statics = 0;
        this.dynamics = 0;
        this.symbols = 0;
    }
}

const A = /*@__PURE__*/ r("ISyntaxInterpreter", t => t.singleton(SyntaxInterpreter));

class SyntaxInterpreter {
    constructor() {
        this.O = new AttrParsingState(null);
        this.W = [ this.O ];
    }
    add(t) {
        t = t.slice(0).sort((t, e) => t.pattern > e.pattern ? 1 : -1);
        const e = t.length;
        let n;
        let r;
        let i;
        let s;
        let l;
        let o;
        let u;
        let c = 0;
        let a;
        while (e > c) {
            n = this.O;
            r = t[c];
            i = r.pattern;
            s = new SegmentTypes;
            l = this.N(r, s);
            o = l.length;
            u = t => n = n.append(t, i);
            for (a = 0; o > a; ++a) {
                l[a].eachChar(u);
            }
            n.H = s;
            n._ = true;
            ++c;
        }
    }
    interpret(t) {
        const e = new Interpretation;
        const n = t.length;
        let r = this.W;
        let i = 0;
        let s;
        for (;i < n; ++i) {
            r = this.q(r, t.charAt(i), e);
            if (r.length === 0) {
                break;
            }
        }
        r = r.filter(isEndpoint);
        if (r.length > 0) {
            r.sort(sortEndpoint);
            s = r[0];
            if (!s.charSpec.isSymbol) {
                e.next(s.C);
            }
            e.pattern = s.C;
        }
        return e;
    }
    q(t, e, n) {
        const r = [];
        let i = null;
        const s = t.length;
        let l = 0;
        for (;l < s; ++l) {
            i = t[l];
            r.push(...i.findMatches(e, n));
        }
        return r;
    }
    N(t, e) {
        const n = [];
        const r = t.pattern;
        const i = r.length;
        const s = t.symbols;
        let l = 0;
        let o = 0;
        let u = "";
        while (l < i) {
            u = r.charAt(l);
            if (s.length === 0 || !s.includes(u)) {
                if (l === o) {
                    if (u === "P" && r.slice(l, l + 4) === "PART") {
                        o = l = l + 4;
                        n.push(new DynamicSegment(s));
                        ++e.dynamics;
                    } else {
                        ++l;
                    }
                } else {
                    ++l;
                }
            } else if (l !== o) {
                n.push(new StaticSegment(r.slice(o, l)));
                ++e.statics;
                o = l;
            } else {
                n.push(new SymbolSegment(r.slice(o, l + 1)));
                ++e.symbols;
                o = ++l;
            }
        }
        if (o !== l) {
            n.push(new StaticSegment(r.slice(o, l)));
            ++e.statics;
        }
        return n;
    }
}

function isEndpoint(t) {
    return t._;
}

function sortEndpoint(t, e) {
    const n = t.H;
    const r = e.H;
    if (n.statics !== r.statics) {
        return r.statics - n.statics;
    }
    if (n.dynamics !== r.dynamics) {
        return r.dynamics - n.dynamics;
    }
    if (n.symbols !== r.symbols) {
        return r.symbols - n.symbols;
    }
    return 0;
}

class AttrSyntax {
    constructor(t, e, n, r, i = null) {
        this.rawName = t;
        this.rawValue = e;
        this.target = n;
        this.command = r;
        this.parts = i;
    }
}

const y = /*@__PURE__*/ r("IAttributePattern");

const I = /*@__PURE__*/ r("IAttributeParser", t => t.singleton(AttributeParser));

class AttributeParser {
    constructor() {
        this.j = {};
        this.L = {};
        this.U = false;
        this.G = [];
        this.J = t.resolve(A);
        this.c = t.resolve(t.IContainer);
    }
    registerPattern(t, e) {
        if (this.U) throw createMappedError(88);
        const n = this.L;
        for (const {pattern: r} of t) {
            if (n[r] != null) throw createMappedError(89, r);
            n[r] = {
                patternType: e
            };
        }
        this.G.push(...t);
    }
    K() {
        this.J.add(this.G);
        const t = this.c;
        for (const [, e] of Object.entries(this.L)) {
            e.pattern = t.get(e.patternType);
        }
    }
    parse(t, e) {
        if (!this.U) {
            this.K();
            this.U = true;
        }
        let n = this.j[t];
        if (n == null) {
            n = this.j[t] = this.J.interpret(t);
        }
        const r = n.pattern;
        if (r == null) {
            return new AttrSyntax(t, e, t, null, null);
        } else {
            return this.L[r].pattern[r](t, e, n.parts);
        }
    }
}

function attributePattern(...e) {
    return function decorator(n, r) {
        const i = S.create(e, n);
        r.metadata[t.registrableMetadataKey] = i;
        return n;
    };
}

const S = /*@__PURE__*/ i({
    name: t.getResourceKeyFor("attribute-pattern"),
    create(t, e) {
        return {
            register(n) {
                n.get(I).registerPattern(t, e);
                l(y, e).register(n);
            }
        };
    }
});

class DotSeparatedAttributePattern {
    "PART.PART"(t, e, n) {
        return new AttrSyntax(t, e, n[0], n[1]);
    }
    "PART.PART.PART"(t, e, n) {
        return new AttrSyntax(t, e, `${n[0]}.${n[1]}`, n[2]);
    }
}

p = Symbol.metadata;

DotSeparatedAttributePattern[p] = {
    [t.registrableMetadataKey]: /*@__PURE__*/ S.create([ {
        pattern: "PART.PART",
        symbols: "."
    }, {
        pattern: "PART.PART.PART",
        symbols: "."
    } ], DotSeparatedAttributePattern)
};

class RefAttributePattern {
    ref(t, e, n) {
        return new AttrSyntax(t, e, "element", "ref");
    }
    "PART.ref"(t, e, n) {
        let r = n[0];
        if (r === "view-model") {
            r = "component";
        }
        return new AttrSyntax(t, e, r, "ref");
    }
}

m = Symbol.metadata;

RefAttributePattern[m] = {
    [t.registrableMetadataKey]: /*@__PURE__*/ S.create([ {
        pattern: "ref",
        symbols: ""
    }, {
        pattern: "PART.ref",
        symbols: "."
    } ], RefAttributePattern)
};

class EventAttributePattern {
    "PART.trigger:PART"(t, e, n) {
        return new AttrSyntax(t, e, n[0], "trigger", n);
    }
    "PART.capture:PART"(t, e, n) {
        return new AttrSyntax(t, e, n[0], "capture", n);
    }
}

g = Symbol.metadata;

EventAttributePattern[g] = {
    [t.registrableMetadataKey]: /*@__PURE__*/ S.create([ {
        pattern: "PART.trigger:PART",
        symbols: ".:"
    }, {
        pattern: "PART.capture:PART",
        symbols: ".:"
    } ], EventAttributePattern)
};

class ColonPrefixedBindAttributePattern {
    ":PART"(t, e, n) {
        return new AttrSyntax(t, e, n[0], "bind");
    }
}

w = Symbol.metadata;

ColonPrefixedBindAttributePattern[w] = {
    [t.registrableMetadataKey]: /*@__PURE__*/ S.create([ {
        pattern: ":PART",
        symbols: ":"
    } ], ColonPrefixedBindAttributePattern)
};

class AtPrefixedTriggerAttributePattern {
    "@PART"(t, e, n) {
        return new AttrSyntax(t, e, n[0], "trigger");
    }
    "@PART:PART"(t, e, n) {
        return new AttrSyntax(t, e, n[0], "trigger", [ n[0], "trigger", ...n.slice(1) ]);
    }
}

b = Symbol.metadata;

AtPrefixedTriggerAttributePattern[b] = {
    [t.registrableMetadataKey]: /*@__PURE__*/ S.create([ {
        pattern: "@PART",
        symbols: "@"
    }, {
        pattern: "@PART:PART",
        symbols: "@:"
    } ], AtPrefixedTriggerAttributePattern)
};

const B = e.Metadata.get;

e.Metadata.has;

const x = e.Metadata.define;

const P = "ra";

const C = "rb";

const T = "rc";

const R = "rd";

const E = "re";

const v = "rf";

const _ = "rg";

const k = "ri";

const L = "rj";

const D = "rk";

const V = "rl";

const H = "ha";

const M = "hb";

const $ = "hc";

const F = "hd";

const O = "he";

const W = "hf";

const N = "hg";

const q = "hs";

const j = "hp";

const U = "svb";

const z = /*@__PURE__*/ i({
    hydrateElement: P,
    hydrateAttribute: C,
    hydrateTemplateController: T,
    hydrateLetElement: R,
    setProperty: E,
    interpolation: v,
    propertyBinding: _,
    letBinding: k,
    refBinding: L,
    iteratorBinding: D,
    multiAttr: V,
    textBinding: H,
    listenerBinding: M,
    attributeBinding: $,
    stylePropertyBinding: F,
    setAttribute: O,
    setClassAttribute: W,
    setStyleAttribute: N,
    spreadTransferedBinding: q,
    spreadElementProp: j,
    spreadValueBinding: U
});

const G = /*@__PURE__*/ r("Instruction");

class InterpolationInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = v;
    }
}

class PropertyBindingInstruction {
    constructor(t, e, n) {
        this.from = t;
        this.to = e;
        this.mode = n;
        this.type = _;
    }
}

class IteratorBindingInstruction {
    constructor(t, e, n) {
        this.forOf = t;
        this.to = e;
        this.props = n;
        this.type = D;
    }
}

class RefBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = L;
    }
}

class SetPropertyInstruction {
    constructor(t, e) {
        this.value = t;
        this.to = e;
        this.type = E;
    }
}

class MultiAttrInstruction {
    constructor(t, e, n) {
        this.value = t;
        this.to = e;
        this.command = n;
        this.type = V;
    }
}

class HydrateElementInstruction {
    constructor(t, e, n, r, i, s) {
        this.res = t;
        this.props = e;
        this.projections = n;
        this.containerless = r;
        this.captures = i;
        this.data = s;
        this.type = P;
    }
}

class HydrateAttributeInstruction {
    constructor(t, e, n) {
        this.res = t;
        this.alias = e;
        this.props = n;
        this.type = C;
    }
}

class HydrateTemplateController {
    constructor(t, e, n, r) {
        this.def = t;
        this.res = e;
        this.alias = n;
        this.props = r;
        this.type = T;
    }
}

class HydrateLetElementInstruction {
    constructor(t, e) {
        this.instructions = t;
        this.toBindingContext = e;
        this.type = R;
    }
}

class LetBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = k;
    }
}

class TextBindingInstruction {
    constructor(t) {
        this.from = t;
        this.type = H;
    }
}

class ListenerBindingInstruction {
    constructor(t, e, n, r) {
        this.from = t;
        this.to = e;
        this.capture = n;
        this.modifier = r;
        this.type = M;
    }
}

class StylePropertyBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = F;
    }
}

class SetAttributeInstruction {
    constructor(t, e) {
        this.value = t;
        this.to = e;
        this.type = O;
    }
}

class SetClassAttributeInstruction {
    constructor(t) {
        this.value = t;
        this.type = W;
    }
}

class SetStyleAttributeInstruction {
    constructor(t) {
        this.value = t;
        this.type = N;
    }
}

class AttributeBindingInstruction {
    constructor(t, e, n) {
        this.attr = t;
        this.from = e;
        this.to = n;
        this.type = $;
    }
}

class SpreadTransferedBindingInstruction {
    constructor() {
        this.type = q;
    }
}

class SpreadElementPropBindingInstruction {
    constructor(t) {
        this.instruction = t;
        this.type = j;
    }
}

class SpreadValueBindingInstruction {
    constructor(t, e) {
        this.target = t;
        this.from = e;
        this.type = U;
    }
}

function bindingCommand(t) {
    return function(e, n) {
        n.addInitializer(function() {
            Q.define(t, e);
        });
        return e;
    };
}

class BindingCommandDefinition {
    constructor(t, e, n, r) {
        this.Type = t;
        this.name = e;
        this.aliases = n;
        this.key = r;
    }
    static create(e, n) {
        let r;
        let i;
        if (t.isString(e)) {
            r = e;
            i = {
                name: r
            };
        } else {
            r = e.name;
            i = e;
        }
        return new BindingCommandDefinition(n, t.firstDefined(getCommandAnnotation(n, "name"), r), t.mergeArrays(getCommandAnnotation(n, "aliases"), i.aliases, n.aliases), getCommandKeyFrom(r));
    }
    register(t, e) {
        const n = this.Type;
        const r = typeof e === "string" ? getCommandKeyFrom(e) : this.key;
        const i = this.aliases;
        if (!t.has(r, false)) {
            t.register(t.has(n, false) ? null : l(n, n), s(n, r), ...i.map(t => s(n, getCommandKeyFrom(t))));
        }
    }
}

const J = "binding-command";

const K = /*@__PURE__*/ t.getResourceKeyFor(J);

const getCommandKeyFrom = t => `${K}:${t}`;

const getCommandAnnotation = (e, n) => B(t.Protocol.annotation.keyFor(n), e);

const Q = /*@__PURE__*/ (() => {
    const e = "__au_static_resource__";
    const getDefinitionFromStaticAu = (t, n, r) => {
        let i = B(e, t);
        if (i == null) {
            if (t.$au?.type === n) {
                i = r(t.$au, t);
                x(i, t, e);
            }
        }
        return i;
    };
    return i({
        name: K,
        keyFrom: getCommandKeyFrom,
        define(e, n) {
            const r = BindingCommandDefinition.create(e, n);
            const i = r.Type;
            x(r, i, K, t.resourceBaseName);
            return i;
        },
        getAnnotation: getCommandAnnotation,
        find(t, e) {
            const n = t.find(J, e);
            return n == null ? null : B(K, n) ?? getDefinitionFromStaticAu(n, J, BindingCommandDefinition.create) ?? null;
        },
        get(e, n) {
            return e.get(t.resource(getCommandKeyFrom(n)));
        }
    });
})();

class OneTimeBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(e, n, r) {
        const i = e.attr;
        let s = i.target;
        let l = e.attr.rawValue;
        l = l === "" ? t.camelCase(s) : l;
        if (e.bindable == null) {
            s = r.map(e.node, s) ?? t.camelCase(s);
        } else {
            s = e.bindable.name;
        }
        return new PropertyBindingInstruction(n.parse(l, c), s, 1);
    }
}

OneTimeBindingCommand.$au = {
    type: J,
    name: "one-time"
};

class ToViewBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(e, n, r) {
        const i = e.attr;
        let s = i.target;
        let l = e.attr.rawValue;
        l = l === "" ? t.camelCase(s) : l;
        if (e.bindable == null) {
            s = r.map(e.node, s) ?? t.camelCase(s);
        } else {
            s = e.bindable.name;
        }
        return new PropertyBindingInstruction(n.parse(l, c), s, 2);
    }
}

ToViewBindingCommand.$au = {
    type: J,
    name: "to-view"
};

class FromViewBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(e, n, r) {
        const i = e.attr;
        let s = i.target;
        let l = i.rawValue;
        l = l === "" ? t.camelCase(s) : l;
        if (e.bindable == null) {
            s = r.map(e.node, s) ?? t.camelCase(s);
        } else {
            s = e.bindable.name;
        }
        return new PropertyBindingInstruction(n.parse(l, c), s, 4);
    }
}

FromViewBindingCommand.$au = {
    type: J,
    name: "from-view"
};

class TwoWayBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(e, n, r) {
        const i = e.attr;
        let s = i.target;
        let l = i.rawValue;
        l = l === "" ? t.camelCase(s) : l;
        if (e.bindable == null) {
            s = r.map(e.node, s) ?? t.camelCase(s);
        } else {
            s = e.bindable.name;
        }
        return new PropertyBindingInstruction(n.parse(l, c), s, 6);
    }
}

TwoWayBindingCommand.$au = {
    type: J,
    name: "two-way"
};

class DefaultBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(e, n, r) {
        const i = e.attr;
        const s = e.bindable;
        let l = i.rawValue;
        let o = i.target;
        let u;
        let a;
        l = l === "" ? t.camelCase(o) : l;
        if (s == null) {
            a = r.isTwoWay(e.node, o) ? 6 : 2;
            o = r.map(e.node, o) ?? t.camelCase(o);
        } else {
            u = e.def.defaultBindingMode ?? 0;
            a = s.mode === 0 || s.mode == null ? u == null || u === 0 ? 2 : u : s.mode;
            o = s.name;
        }
        return new PropertyBindingInstruction(n.parse(l, c), o, t.isString(a) ? h[a] ?? 0 : a);
    }
}

DefaultBindingCommand.$au = {
    type: J,
    name: "bind"
};

class ForBindingCommand {
    constructor() {
        this.X = t.resolve(I);
    }
    get ignoreAttr() {
        return false;
    }
    build(e, n) {
        const r = e.bindable === null ? t.camelCase(e.attr.target) : e.bindable.name;
        const i = n.parse(e.attr.rawValue, "IsIterator");
        let s = t.emptyArray;
        if (i.semiIdx > -1) {
            const t = e.attr.rawValue.slice(i.semiIdx + 1);
            const n = t.indexOf(":");
            if (n > -1) {
                const e = t.slice(0, n).trim();
                const r = t.slice(n + 1).trim();
                const i = this.X.parse(e, r);
                s = [ new MultiAttrInstruction(r, i.target, i.command) ];
            }
        }
        return new IteratorBindingInstruction(i, r, s);
    }
}

ForBindingCommand.$au = {
    type: J,
    name: "for"
};

class TriggerBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new ListenerBindingInstruction(e.parse(t.attr.rawValue, u), t.attr.target, false, t.attr.parts?.[2] ?? null);
    }
}

TriggerBindingCommand.$au = {
    type: J,
    name: "trigger"
};

class CaptureBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new ListenerBindingInstruction(e.parse(t.attr.rawValue, u), t.attr.target, true, t.attr.parts?.[2] ?? null);
    }
}

CaptureBindingCommand.$au = {
    type: J,
    name: "capture"
};

class AttrBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(e, n) {
        const r = e.attr;
        const i = r.target;
        let s = r.rawValue;
        s = s === "" ? t.camelCase(i) : s;
        return new AttributeBindingInstruction(i, n.parse(s, c), i);
    }
}

AttrBindingCommand.$au = {
    type: J,
    name: "attr"
};

class StyleBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new AttributeBindingInstruction("style", e.parse(t.attr.rawValue, c), t.attr.target);
    }
}

StyleBindingCommand.$au = {
    type: J,
    name: "style"
};

class ClassBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        let n = t.attr.target;
        if (n.includes(",")) {
            const t = n.split(",").filter(t => t.length > 0);
            if (t.length === 0) {
                throw createMappedError(723);
            }
            n = t.join(" ");
        }
        return new AttributeBindingInstruction("class", e.parse(t.attr.rawValue, c), n);
    }
}

ClassBindingCommand.$au = {
    type: J,
    name: "class"
};

class RefBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new RefBindingInstruction(e.parse(t.attr.rawValue, c), t.attr.target);
    }
}

RefBindingCommand.$au = {
    type: J,
    name: "ref"
};

class SpreadValueBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t) {
        return new SpreadValueBindingInstruction(t.attr.target, t.attr.rawValue);
    }
}

SpreadValueBindingCommand.$au = {
    type: J,
    name: "spread"
};

typeof SuppressedError === "function" ? SuppressedError : function(t, e, n) {
    var r = new Error(n);
    return r.name = "SuppressedError", r.error = t, r.suppressed = e, r;
};

const X = /*@__PURE__*/ r("ITemplateElementFactory", t => t.singleton(TemplateElementFactory));

const Y = {};

class TemplateElementFactory {
    constructor() {
        this.p = t.resolve(t.IPlatform);
        this.Y = this.t();
    }
    t() {
        return this.p.document.createElement("template");
    }
    createTemplate(e) {
        if (t.isString(e)) {
            let t = Y[e];
            if (t === void 0) {
                const n = this.Y;
                n.innerHTML = e;
                const r = n.content.firstElementChild;
                if (needsWrapping(r)) {
                    this.Y = this.t();
                    t = n;
                } else {
                    n.content.removeChild(r);
                    t = r;
                }
                Y[e] = t;
            }
            return t.cloneNode(true);
        }
        if (e.nodeName !== "TEMPLATE") {
            const t = this.t();
            t.content.appendChild(e);
            return t;
        }
        e.parentNode?.removeChild(e);
        return e.cloneNode(true);
        function needsWrapping(t) {
            if (t == null) return true;
            if (t.nodeName !== "TEMPLATE") return true;
            const e = t.nextElementSibling;
            if (e != null) return true;
            const n = t.previousSibling;
            if (n != null) {
                switch (n.nodeType) {
                  case 3:
                    return n.textContent.trim().length > 0;
                }
            }
            const r = t.nextSibling;
            if (r != null) {
                switch (r.nodeType) {
                  case 3:
                    return r.textContent.trim().length > 0;
                }
            }
            return false;
        }
    }
}

const Z = "au-start";

const tt = "au-end";

const insertBefore = (t, e, n) => t.insertBefore(e, n);

const insertManyBefore = (t, e, n) => {
    if (t === null) {
        return;
    }
    const r = n.length;
    let i = 0;
    while (r > i) {
        t.insertBefore(n[i], e);
        ++i;
    }
};

const appendToTemplate = (t, e) => t.content.appendChild(e);

const appendManyToTemplate = (t, e) => {
    const n = e.length;
    let r = 0;
    while (n > r) {
        t.content.appendChild(e[r]);
        ++r;
    }
};

const isElement = t => t.nodeType === 1;

const isTextNode = t => t.nodeType === 3;

const et = "au-slot";

const nt = "default";

const rt = (t => () => `anonymous-${++t}`)(0);

class TemplateCompiler {
    constructor() {
        this.debug = false;
        this.resolveResources = true;
    }
    compile(e, n) {
        if (e.template == null || e.needsCompile === false) {
            return e;
        }
        const r = new CompilationContext(e, n, null, null, void 0);
        const i = t.isString(e.template) || !e.enhance ? r.Z.createTemplate(e.template) : e.template;
        const s = i.nodeName === it && i.content != null;
        const l = s ? i.content : i;
        const o = pt.findAll(n);
        const u = o.length;
        let c = 0;
        if (u > 0) {
            while (u > c) {
                o[c].compiling?.(i);
                ++c;
            }
        }
        if (i.hasAttribute(dt)) {
            throw createMappedError(701, e);
        }
        this.tt(l, r);
        this.et(l, r);
        const a = {
            ...e,
            name: e.name || rt(),
            dependencies: (e.dependencies ?? t.emptyArray).concat(r.deps ?? t.emptyArray),
            instructions: r.rows,
            surrogates: s ? this.nt(i, r) : t.emptyArray,
            template: i,
            hasSlots: r.hasSlot,
            needsCompile: false
        };
        return a;
    }
    compileSpread(e, n, r, i, s) {
        const l = new CompilationContext(e, r, null, null, void 0);
        const u = [];
        const c = s ?? l.rt(i.nodeName.toLowerCase());
        const a = c !== null;
        const h = l.ep;
        const d = n.length;
        let f = 0;
        let p;
        let m = null;
        let g;
        let w;
        let b;
        let A;
        let y;
        let I = null;
        let S;
        let B;
        let x;
        let P;
        for (;d > f; ++f) {
            p = n[f];
            x = p.target;
            P = p.rawValue;
            if (x === "...$attrs") {
                u.push(new SpreadTransferedBindingInstruction);
                continue;
            }
            I = l.it(p);
            if (I !== null && I.ignoreAttr) {
                lt.node = i;
                lt.attr = p;
                lt.bindable = null;
                lt.def = null;
                u.push(I.build(lt, l.ep, l.m));
                continue;
            }
            if (a) {
                b = l.st(c);
                A = b.attrs[x];
                if (A !== void 0) {
                    if (I == null) {
                        S = h.parse(P, o);
                        u.push(new SpreadElementPropBindingInstruction(S == null ? new SetPropertyInstruction(P, A.name) : new InterpolationInstruction(S, A.name)));
                    } else {
                        lt.node = i;
                        lt.attr = p;
                        lt.bindable = A;
                        lt.def = c;
                        u.push(new SpreadElementPropBindingInstruction(I.build(lt, l.ep, l.m)));
                    }
                    continue;
                }
            }
            m = l.lt(x);
            if (m !== null) {
                if (m.isTemplateController) {
                    throw createMappedError(9998, x);
                }
                b = l.st(m);
                B = m.noMultiBindings === false && I === null && hasInlineBindings(P);
                if (B) {
                    w = this.ot(i, P, m, l);
                } else {
                    y = b.primary;
                    if (I === null) {
                        S = h.parse(P, o);
                        w = [ S === null ? new SetPropertyInstruction(P, y.name) : new InterpolationInstruction(S, y.name) ];
                    } else {
                        lt.node = i;
                        lt.attr = p;
                        lt.bindable = y;
                        lt.def = m;
                        w = [ I.build(lt, l.ep, l.m) ];
                    }
                }
                (g ??= []).push(new HydrateAttributeInstruction(this.resolveResources ? m : m.name, m.aliases != null && m.aliases.includes(x) ? x : void 0, w));
                continue;
            }
            if (I == null) {
                S = h.parse(P, o);
                if (S != null) {
                    u.push(new InterpolationInstruction(S, l.m.map(i, x) ?? t.camelCase(x)));
                } else {
                    switch (x) {
                      case "class":
                        u.push(new SetClassAttributeInstruction(P));
                        break;

                      case "style":
                        u.push(new SetStyleAttributeInstruction(P));
                        break;

                      default:
                        u.push(new SetAttributeInstruction(P, x));
                    }
                }
            } else {
                lt.node = i;
                lt.attr = p;
                lt.bindable = null;
                lt.def = null;
                u.push(I.build(lt, l.ep, l.m));
            }
        }
        resetCommandBuildInfo();
        if (g != null) {
            return g.concat(u);
        }
        return u;
    }
    nt(e, n) {
        const r = [];
        const i = e.attributes;
        const s = n.ep;
        let l = i.length;
        let u = 0;
        let c;
        let a;
        let h;
        let d;
        let f = null;
        let p;
        let m;
        let g;
        let w;
        let b = null;
        let A;
        let y;
        let I;
        let S;
        for (;l > u; ++u) {
            c = i[u];
            a = c.name;
            h = c.value;
            d = n.X.parse(a, h);
            I = d.target;
            S = d.rawValue;
            if (ot[I]) {
                throw createMappedError(702, a);
            }
            b = n.it(d);
            if (b !== null && b.ignoreAttr) {
                lt.node = e;
                lt.attr = d;
                lt.bindable = null;
                lt.def = null;
                r.push(b.build(lt, n.ep, n.m));
                continue;
            }
            f = n.lt(I);
            if (f !== null) {
                if (f.isTemplateController) {
                    throw createMappedError(703, I);
                }
                g = n.st(f);
                y = f.noMultiBindings === false && b === null && hasInlineBindings(S);
                if (y) {
                    m = this.ot(e, S, f, n);
                } else {
                    w = g.primary;
                    if (b === null) {
                        A = s.parse(S, o);
                        m = A === null ? S === "" ? [] : [ new SetPropertyInstruction(S, w.name) ] : [ new InterpolationInstruction(A, w.name) ];
                    } else {
                        lt.node = e;
                        lt.attr = d;
                        lt.bindable = w;
                        lt.def = f;
                        m = [ b.build(lt, n.ep, n.m) ];
                    }
                }
                e.removeAttribute(a);
                --u;
                --l;
                (p ??= []).push(new HydrateAttributeInstruction(this.resolveResources ? f : f.name, f.aliases != null && f.aliases.includes(I) ? I : void 0, m));
                continue;
            }
            if (b === null) {
                A = s.parse(S, o);
                if (A != null) {
                    e.removeAttribute(a);
                    --u;
                    --l;
                    r.push(new InterpolationInstruction(A, n.m.map(e, I) ?? t.camelCase(I)));
                } else {
                    switch (a) {
                      case "class":
                        r.push(new SetClassAttributeInstruction(S));
                        break;

                      case "style":
                        r.push(new SetStyleAttributeInstruction(S));
                        break;

                      default:
                        r.push(new SetAttributeInstruction(S, a));
                    }
                }
            } else {
                lt.node = e;
                lt.attr = d;
                lt.bindable = null;
                lt.def = null;
                r.push(b.build(lt, n.ep, n.m));
            }
        }
        resetCommandBuildInfo();
        if (p != null) {
            return p.concat(r);
        }
        return r;
    }
    et(t, e) {
        switch (t.nodeType) {
          case 1:
            switch (t.nodeName) {
              case "LET":
                return this.ut(t, e);

              default:
                return this.ct(t, e);
            }

          case 3:
            return this.ht(t, e);

          case 11:
            {
                let n = t.firstChild;
                while (n !== null) {
                    n = this.et(n, e);
                }
                break;
            }
        }
        return t.nextSibling;
    }
    ut(e, r) {
        const i = e.attributes;
        const s = i.length;
        const l = [];
        const u = r.ep;
        let a = false;
        let h = 0;
        let d;
        let f;
        let p;
        let m;
        let g;
        let w;
        let b;
        let A;
        for (;s > h; ++h) {
            d = i[h];
            p = d.name;
            m = d.value;
            if (p === "to-binding-context") {
                a = true;
                continue;
            }
            f = r.X.parse(p, m);
            w = f.target;
            b = f.rawValue;
            g = r.it(f);
            if (g !== null) {
                if (f.command === "bind") {
                    l.push(new LetBindingInstruction(u.parse(b, c), t.camelCase(w)));
                } else {
                    throw createMappedError(704, f);
                }
                continue;
            }
            A = u.parse(b, o);
            l.push(new LetBindingInstruction(A === null ? new n.PrimitiveLiteralExpression(b) : A, t.camelCase(w)));
        }
        r.rows.push([ new HydrateLetElementInstruction(l, a) ]);
        return this.dt(e, r).nextSibling;
    }
    ct(e, n) {
        const r = e.nextSibling;
        const i = (e.getAttribute("as-element") ?? e.nodeName).toLowerCase();
        const s = n.rt(i);
        const l = s !== null;
        const u = l && s.shadowOptions != null;
        const c = s?.capture;
        const h = c != null && typeof c !== "boolean";
        const d = c ? [] : t.emptyArray;
        const f = n.ep;
        const p = this.debug ? t.noop : () => {
            e.removeAttribute(y);
            --b;
            --w;
        };
        let m = e.attributes;
        let g;
        let w = m.length;
        let b = 0;
        let A;
        let y;
        let I;
        let S;
        let B;
        let x;
        let P = null;
        let C = false;
        let T;
        let R;
        let E;
        let v;
        let _;
        let k;
        let L;
        let D = null;
        let V;
        let H;
        let M;
        let $;
        let F = true;
        let O = false;
        let W = false;
        let N = false;
        let q;
        let j = 0;
        if (i === "slot") {
            if (n.root.def.shadowOptions == null) {
                throw createMappedError(717, n.root.def.name);
            }
            n.root.hasSlot = true;
        }
        if (l) {
            q = {};
            F = s.processContent?.call(s.Type, e, n.p, q);
            m = e.attributes;
            w = m.length;
        }
        for (;w > b; ++b) {
            A = m[b];
            y = A.name;
            I = A.value;
            switch (y) {
              case "as-element":
              case "containerless":
                p();
                O = O || y === "containerless";
                continue;
            }
            S = n.X.parse(y, I);
            D = n.it(S);
            M = S.target;
            $ = S.rawValue;
            if (c && (!h || h && c(M))) {
                if (D != null && D.ignoreAttr) {
                    p();
                    d.push(S);
                    continue;
                }
                W = M !== et && M !== "slot" && ((j = M.indexOf("...")) === -1 || j === 0 && M === "...$attrs");
                if (W) {
                    V = n.st(s);
                    if (V.attrs[M] == null && !n.lt(M)?.isTemplateController) {
                        p();
                        d.push(S);
                        continue;
                    }
                }
            }
            if (M === "...$attrs") {
                (B ??= []).push(new SpreadTransferedBindingInstruction);
                p();
                continue;
            }
            if (D?.ignoreAttr) {
                lt.node = e;
                lt.attr = S;
                lt.bindable = null;
                lt.def = null;
                (B ??= []).push(D.build(lt, n.ep, n.m));
                p();
                continue;
            }
            if (M.indexOf("...") === 0) {
                if (l && (M = M.slice(3)) !== "$element") {
                    (x ??= []).push(new SpreadValueBindingInstruction("$bindables", M === "$bindables" ? $ : M));
                    p();
                    continue;
                }
                throw createMappedError(720, M);
            }
            if (l) {
                V = n.st(s);
                T = V.attrs[M];
                if (T !== void 0) {
                    if (D === null) {
                        k = f.parse($, o);
                        (x ??= []).push(k == null ? new SetPropertyInstruction($, T.name) : new InterpolationInstruction(k, T.name));
                    } else {
                        lt.node = e;
                        lt.attr = S;
                        lt.bindable = T;
                        lt.def = s;
                        (x ??= []).push(D.build(lt, n.ep, n.m));
                    }
                    p();
                    continue;
                }
                if (M === "$bindables") {
                    if (D != null) {
                        lt.node = e;
                        lt.attr = S;
                        lt.bindable = null;
                        lt.def = s;
                        {
                            (x ??= []).push(D.build(lt, n.ep, n.m));
                        }
                    }
                    p();
                    continue;
                }
            }
            if (M === "$bindables") {
                throw createMappedError(721, e.nodeName, M, $);
            }
            P = n.lt(M);
            if (P !== null) {
                V = n.st(P);
                C = P.noMultiBindings === false && D === null && hasInlineBindings($);
                if (C) {
                    E = this.ot(e, $, P, n);
                } else {
                    H = V.primary;
                    if (D === null) {
                        k = f.parse($, o);
                        E = k === null ? $ === "" ? [] : [ new SetPropertyInstruction($, H.name) ] : [ new InterpolationInstruction(k, H.name) ];
                    } else {
                        lt.node = e;
                        lt.attr = S;
                        lt.bindable = H;
                        lt.def = P;
                        E = [ D.build(lt, n.ep, n.m) ];
                    }
                }
                p();
                if (P.isTemplateController) {
                    (v ??= []).push(new HydrateTemplateController(st, this.resolveResources ? P : P.name, void 0, E));
                } else {
                    (R ??= []).push(new HydrateAttributeInstruction(this.resolveResources ? P : P.name, P.aliases != null && P.aliases.includes(M) ? M : void 0, E));
                }
                continue;
            }
            if (D === null) {
                k = f.parse($, o);
                if (k != null) {
                    p();
                    (B ??= []).push(new InterpolationInstruction(k, n.m.map(e, M) ?? t.camelCase(M)));
                }
                continue;
            }
            lt.node = e;
            lt.attr = S;
            lt.bindable = null;
            lt.def = null;
            (B ??= []).push(D.build(lt, n.ep, n.m));
            p();
        }
        resetCommandBuildInfo();
        if (this.ft(e, B) && B != null && B.length > 1) {
            this.gt(e, B);
        }
        if (l) {
            L = new HydrateElementInstruction(this.resolveResources ? s : s.name, x ?? t.emptyArray, null, O, d, q);
        }
        if (B != null || L != null || R != null) {
            g = t.emptyArray.concat(L ?? t.emptyArray, R ?? t.emptyArray, B ?? t.emptyArray);
            N = true;
        }
        let U;
        if (v != null) {
            w = v.length - 1;
            b = w;
            _ = v[b];
            let t;
            if (isMarker(e)) {
                t = n.t();
                appendManyToTemplate(t, [ n.wt(), n.bt(Z), n.bt(tt) ]);
            } else {
                this.At(e, n);
                if (e.nodeName === "TEMPLATE") {
                    t = e;
                } else {
                    t = n.t();
                    appendToTemplate(t, e);
                }
            }
            const r = t;
            const o = n.yt(g == null ? [] : [ g ]);
            let c;
            let h;
            let d = false;
            let f;
            let p;
            let m;
            let A;
            let y;
            let I;
            let S = 0, B = 0;
            let x = e.firstChild;
            let P = false;
            if (F !== false) {
                while (x !== null) {
                    h = isElement(x) ? x.getAttribute(et) : null;
                    d = h !== null || l && !u;
                    c = x.nextSibling;
                    if (d) {
                        if (!l) {
                            throw createMappedError(706, h, i);
                        }
                        x.removeAttribute?.(et);
                        P = isTextNode(x) && x.textContent.trim() === "";
                        if (!P) {
                            ((p ??= {})[h || nt] ??= []).push(x);
                        }
                        e.removeChild(x);
                    }
                    x = c;
                }
            }
            if (p != null) {
                f = {};
                for (h in p) {
                    t = n.t();
                    m = p[h];
                    for (S = 0, B = m.length; B > S; ++S) {
                        A = m[S];
                        if (A.nodeName === "TEMPLATE") {
                            if (A.attributes.length > 0) {
                                appendToTemplate(t, A);
                            } else {
                                appendToTemplate(t, A.content);
                            }
                        } else {
                            appendToTemplate(t, A);
                        }
                    }
                    I = n.yt();
                    this.et(t.content, I);
                    f[h] = {
                        name: rt(),
                        type: a,
                        template: t,
                        instructions: I.rows,
                        needsCompile: false
                    };
                }
                L.projections = f;
            }
            if (N) {
                if (l && (O || s.containerless)) {
                    this.At(e, n);
                } else {
                    this.dt(e, n);
                }
            }
            U = !l || !s.containerless && !O && F !== false;
            if (U) {
                if (e.nodeName === it) {
                    this.et(e.content, o);
                } else {
                    x = e.firstChild;
                    while (x !== null) {
                        x = this.et(x, o);
                    }
                }
            }
            _.def = {
                name: rt(),
                type: a,
                template: r,
                instructions: o.rows,
                needsCompile: false
            };
            while (b-- > 0) {
                _ = v[b];
                t = n.t();
                y = n.wt();
                appendManyToTemplate(t, [ y, n.bt(Z), n.bt(tt) ]);
                _.def = {
                    name: rt(),
                    type: a,
                    template: t,
                    needsCompile: false,
                    instructions: [ [ v[b + 1] ] ]
                };
            }
            n.rows.push([ _ ]);
        } else {
            if (g != null) {
                n.rows.push(g);
            }
            let t = e.firstChild;
            let r;
            let o;
            let c = false;
            let h = null;
            let d;
            let f;
            let p;
            let m;
            let w;
            let b = false;
            let A = 0, y = 0;
            if (F !== false) {
                while (t !== null) {
                    o = isElement(t) ? t.getAttribute(et) : null;
                    c = o !== null || l && !u;
                    r = t.nextSibling;
                    if (c) {
                        if (!l) {
                            throw createMappedError(706, o, i);
                        }
                        t.removeAttribute?.(et);
                        b = isTextNode(t) && t.textContent.trim() === "";
                        if (!b) {
                            ((d ??= {})[o || nt] ??= []).push(t);
                        }
                        e.removeChild(t);
                    }
                    t = r;
                }
            }
            if (d != null) {
                h = {};
                for (o in d) {
                    m = n.t();
                    f = d[o];
                    for (A = 0, y = f.length; y > A; ++A) {
                        p = f[A];
                        if (p.nodeName === it) {
                            if (p.attributes.length > 0) {
                                appendToTemplate(m, p);
                            } else {
                                appendToTemplate(m, p.content);
                            }
                        } else {
                            appendToTemplate(m, p);
                        }
                    }
                    w = n.yt();
                    this.et(m.content, w);
                    h[o] = {
                        name: rt(),
                        type: a,
                        template: m,
                        instructions: w.rows,
                        needsCompile: false
                    };
                }
                L.projections = h;
            }
            if (N) {
                if (l && (O || s.containerless)) {
                    this.At(e, n);
                } else {
                    this.dt(e, n);
                }
            }
            U = !l || !s.containerless && !O && F !== false;
            if (U && e.childNodes.length > 0) {
                t = e.firstChild;
                while (t !== null) {
                    t = this.et(t, n);
                }
            }
        }
        return r;
    }
    ht(t, e) {
        const n = t.parentNode;
        const r = e.ep.parse(t.textContent, o);
        const i = t.nextSibling;
        let s;
        let l;
        let u;
        let c;
        let a;
        if (r !== null) {
            ({parts: s, expressions: l} = r);
            if (a = s[0]) {
                insertBefore(n, e.It(a), t);
            }
            for (u = 0, c = l.length; c > u; ++u) {
                insertManyBefore(n, t, [ e.wt(), e.It(" ") ]);
                if (a = s[u + 1]) {
                    insertBefore(n, e.It(a), t);
                }
                e.rows.push([ new TextBindingInstruction(l[u]) ]);
            }
            n.removeChild(t);
        }
        return i;
    }
    ot(t, e, n, r) {
        const i = r.st(n);
        const s = e.length;
        const l = [];
        let u = void 0;
        let c = void 0;
        let a = 0;
        let h = 0;
        let d;
        let f;
        let p;
        let m;
        for (let g = 0; g < s; ++g) {
            h = e.charCodeAt(g);
            if (h === 92) {
                ++g;
            } else if (h === 58) {
                u = e.slice(a, g);
                while (e.charCodeAt(++g) <= 32) ;
                a = g;
                for (;g < s; ++g) {
                    h = e.charCodeAt(g);
                    if (h === 92) {
                        ++g;
                    } else if (h === 59) {
                        c = e.slice(a, g);
                        break;
                    }
                }
                if (c === void 0) {
                    c = e.slice(a);
                }
                f = r.X.parse(u, c);
                p = r.it(f);
                m = i.attrs[f.target];
                if (m == null) {
                    throw createMappedError(707, f.target, n.name);
                }
                if (p === null) {
                    d = r.ep.parse(c, o);
                    l.push(d === null ? new SetPropertyInstruction(c, m.name) : new InterpolationInstruction(d, m.name));
                } else {
                    lt.node = t;
                    lt.attr = f;
                    lt.bindable = m;
                    lt.def = n;
                    l.push(p.build(lt, r.ep, r.m));
                }
                while (g < s && e.charCodeAt(++g) <= 32) ;
                a = g;
                u = void 0;
                c = void 0;
            }
        }
        resetCommandBuildInfo();
        return l;
    }
    tt(e, n) {
        const r = n.root.def.name;
        const i = e;
        const s = t.toArray(i.querySelectorAll("template[as-custom-element]"));
        const l = s.length;
        if (l === 0) {
            return;
        }
        if (l === i.childElementCount) {
            throw createMappedError(708, r);
        }
        const o = new Set;
        const u = [];
        for (const e of s) {
            if (e.parentNode !== i) {
                throw createMappedError(709, r);
            }
            const n = processTemplateName(r, e, o);
            const s = e.content;
            const l = t.toArray(s.querySelectorAll("bindable"));
            const c = new Set;
            const h = new Set;
            const d = l.reduce((e, r) => {
                if (r.parentNode !== s) {
                    throw createMappedError(710, n);
                }
                const i = r.getAttribute("name");
                if (i === null) {
                    throw createMappedError(711, r, n);
                }
                const l = r.getAttribute("attribute");
                if (l !== null && h.has(l) || c.has(i)) {
                    throw createMappedError(712, c, l);
                } else {
                    if (l !== null) {
                        h.add(l);
                    }
                    c.add(i);
                }
                const o = t.toArray(r.attributes).filter(t => !ht.includes(t.name));
                if (o.length > 0) ;
                r.remove();
                e[i] = {
                    name: i,
                    attribute: l ?? void 0,
                    mode: r.getAttribute("mode") ?? "default"
                };
                return e;
            }, {});
            class LocalDepType {}
            LocalDepType.$au = {
                type: a,
                name: n,
                template: e,
                bindables: d
            };
            Reflect.defineProperty(LocalDepType, "name", {
                value: t.pascalCase(n)
            });
            u.push(LocalDepType);
            i.removeChild(e);
        }
        const c = (n.root.def.dependencies ?? []).concat(n.root.def.Type == null ? t.emptyArray : [ n.root.def.Type ]);
        for (const t of u) {
            t.dependencies = c.concat(u.filter(e => e !== t));
            n.St(t);
        }
    }
    ft(t, e) {
        const n = t.nodeName;
        return n === "INPUT" && ut[t.type] === 1 || n === "SELECT" && (t.hasAttribute("multiple") || e?.some(t => t.type === _ && t.to === "multiple"));
    }
    gt(t, e) {
        switch (t.nodeName) {
          case "INPUT":
            {
                const t = e;
                let n = void 0;
                let r = void 0;
                let i = 0;
                let s;
                for (let e = 0; e < t.length && i < 3; e++) {
                    s = t[e];
                    switch (s.to) {
                      case "model":
                      case "value":
                      case "matcher":
                        n = e;
                        i++;
                        break;

                      case "checked":
                        r = e;
                        i++;
                        break;
                    }
                }
                if (r !== void 0 && n !== void 0 && r < n) {
                    [t[n], t[r]] = [ t[r], t[n] ];
                }
                break;
            }

          case "SELECT":
            {
                const t = e;
                let n = 0;
                let r = 0;
                let i = 0;
                let s;
                for (let e = 0; e < t.length && i < 2; ++e) {
                    s = t[e];
                    switch (s.to) {
                      case "multiple":
                        r = e;
                        i++;
                        break;

                      case "value":
                        n = e;
                        i++;
                        break;
                    }
                    if (i === 2 && n < r) {
                        [t[r], t[n]] = [ t[n], t[r] ];
                    }
                }
            }
        }
    }
    dt(t, e) {
        insertBefore(t.parentNode, e.bt("au*"), t);
        return t;
    }
    At(t, e) {
        if (isMarker(t)) {
            return t;
        }
        const n = t.parentNode;
        const r = e.wt();
        insertManyBefore(n, t, [ r, e.bt(Z), e.bt(tt) ]);
        n.removeChild(t);
        return r;
    }
}

TemplateCompiler.register = t.createImplementationRegister(d);

const it = "TEMPLATE";

const isMarker = t => t.nodeValue === "au*";

class CompilationContext {
    constructor(e, r, i, s, l) {
        this.hasSlot = false;
        this.deps = null;
        const o = i !== null;
        this.c = r;
        this.root = s === null ? this : s;
        this.def = e;
        this.parent = i;
        this.Bt = o ? i.Bt : r.get(ct);
        this.xt = o ? i.xt : r.get(at);
        this.Z = o ? i.Z : r.get(X);
        this.X = o ? i.X : r.get(I);
        this.ep = o ? i.ep : r.get(n.IExpressionParser);
        this.m = o ? i.m : r.get(f);
        this.Pt = o ? i.Pt : r.get(t.ILogger);
        if (typeof (this.p = o ? i.p : r.get(t.IPlatform)).document?.nodeType !== "number") {
            throw createMappedError(722);
        }
        this.localEls = o ? i.localEls : new Set;
        this.rows = l ?? [];
    }
    St(t) {
        (this.root.deps ??= []).push(t);
        this.root.c.register(t);
        return this;
    }
    It(t) {
        return this.p.document.createTextNode(t);
    }
    bt(t) {
        return this.p.document.createComment(t);
    }
    wt() {
        return this.bt("au*");
    }
    h(t) {
        const e = this.p.document.createElement(t);
        if (t === "template") {
            this.p.document.adoptNode(e.content);
        }
        return e;
    }
    t() {
        return this.h("template");
    }
    rt(t) {
        return this.Bt.el(this.c, t);
    }
    lt(t) {
        return this.Bt.attr(this.c, t);
    }
    st(t) {
        return this.Bt.bindables(t);
    }
    yt(t) {
        return new CompilationContext(this.def, this.c, this, this.root, t);
    }
    it(t) {
        const e = t.command;
        if (e === null) {
            return null;
        }
        return this.xt.get(this.c, e);
    }
}

const hasInlineBindings = t => {
    const e = t.length;
    let n = 0;
    let r = 0;
    while (e > r) {
        n = t.charCodeAt(r);
        if (n === 92) {
            ++r;
        } else if (n === 58) {
            return true;
        } else if (n === 36 && t.charCodeAt(r + 1) === 123) {
            return false;
        }
        ++r;
    }
    return false;
};

const resetCommandBuildInfo = () => {
    lt.node = lt.attr = lt.bindable = lt.def = null;
};

const st = {
    name: "unnamed",
    type: a
};

const lt = {
    node: null,
    attr: null,
    bindable: null,
    def: null
};

const ot = {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
};

const ut = {
    checkbox: 1,
    radio: 1
};

const ct = /*@__PURE__*/ r("IResourceResolver");

const at = /*@__PURE__*/ r("IBindingCommandResolver", t => {
    class DefaultBindingCommandResolver {
        constructor() {
            this.j = new WeakMap;
        }
        get(t, e) {
            let n = this.j.get(t);
            if (!n) {
                this.j.set(t, n = {});
            }
            return e in n ? n[e] : n[e] = Q.get(t, e);
        }
    }
    return t.singleton(DefaultBindingCommandResolver);
});

const ht = i([ "name", "attribute", "mode" ]);

const dt = "as-custom-element";

const processTemplateName = (t, e, n) => {
    const r = e.getAttribute(dt);
    if (r === null || r === "") {
        throw createMappedError(715, t);
    }
    if (n.has(r)) {
        throw createMappedError(716, r, t);
    } else {
        n.add(r);
        e.removeAttribute(dt);
    }
    return r;
};

const ft = /*@__PURE__*/ r("ITemplateCompilerHooks");

const pt = i({
    name: /*@__PURE__*/ t.getResourceKeyFor("compiler-hooks"),
    define(t) {
        return {
            register(e) {
                l(ft, t).register(e);
            }
        };
    },
    findAll(e) {
        return e.get(t.allResources(ft));
    }
});

const templateCompilerHooks = (e, n) => {
    return e === void 0 ? decorator : decorator(e, n);
    function decorator(e, n) {
        n.metadata[t.registrableMetadataKey] = pt.define(e);
        return e;
    }
};

exports.AtPrefixedTriggerAttributePattern = AtPrefixedTriggerAttributePattern;

exports.AttrBindingCommand = AttrBindingCommand;

exports.AttrSyntax = AttrSyntax;

exports.AttributeBindingInstruction = AttributeBindingInstruction;

exports.AttributeParser = AttributeParser;

exports.AttributePattern = S;

exports.BindingCommand = Q;

exports.BindingCommandDefinition = BindingCommandDefinition;

exports.BindingMode = h;

exports.CaptureBindingCommand = CaptureBindingCommand;

exports.ClassBindingCommand = ClassBindingCommand;

exports.ColonPrefixedBindAttributePattern = ColonPrefixedBindAttributePattern;

exports.DefaultBindingCommand = DefaultBindingCommand;

exports.DotSeparatedAttributePattern = DotSeparatedAttributePattern;

exports.EventAttributePattern = EventAttributePattern;

exports.ForBindingCommand = ForBindingCommand;

exports.FromViewBindingCommand = FromViewBindingCommand;

exports.HydrateAttributeInstruction = HydrateAttributeInstruction;

exports.HydrateElementInstruction = HydrateElementInstruction;

exports.HydrateLetElementInstruction = HydrateLetElementInstruction;

exports.HydrateTemplateController = HydrateTemplateController;

exports.IAttrMapper = f;

exports.IAttributeParser = I;

exports.IAttributePattern = y;

exports.IBindingCommandResolver = at;

exports.IInstruction = G;

exports.IResourceResolver = ct;

exports.ISyntaxInterpreter = A;

exports.ITemplateCompiler = d;

exports.ITemplateCompilerHooks = ft;

exports.ITemplateElementFactory = X;

exports.InstructionType = z;

exports.InterpolationInstruction = InterpolationInstruction;

exports.Interpretation = Interpretation;

exports.IteratorBindingInstruction = IteratorBindingInstruction;

exports.LetBindingInstruction = LetBindingInstruction;

exports.ListenerBindingInstruction = ListenerBindingInstruction;

exports.MultiAttrInstruction = MultiAttrInstruction;

exports.OneTimeBindingCommand = OneTimeBindingCommand;

exports.PropertyBindingInstruction = PropertyBindingInstruction;

exports.RefAttributePattern = RefAttributePattern;

exports.RefBindingCommand = RefBindingCommand;

exports.RefBindingInstruction = RefBindingInstruction;

exports.SetAttributeInstruction = SetAttributeInstruction;

exports.SetClassAttributeInstruction = SetClassAttributeInstruction;

exports.SetPropertyInstruction = SetPropertyInstruction;

exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;

exports.SpreadElementPropBindingInstruction = SpreadElementPropBindingInstruction;

exports.SpreadTransferedBindingInstruction = SpreadTransferedBindingInstruction;

exports.SpreadValueBindingCommand = SpreadValueBindingCommand;

exports.SpreadValueBindingInstruction = SpreadValueBindingInstruction;

exports.StyleBindingCommand = StyleBindingCommand;

exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;

exports.SyntaxInterpreter = SyntaxInterpreter;

exports.TemplateCompiler = TemplateCompiler;

exports.TemplateCompilerHooks = pt;

exports.TextBindingInstruction = TextBindingInstruction;

exports.ToViewBindingCommand = ToViewBindingCommand;

exports.TriggerBindingCommand = TriggerBindingCommand;

exports.TwoWayBindingCommand = TwoWayBindingCommand;

exports.attributePattern = attributePattern;

exports.bindingCommand = bindingCommand;

exports.generateElementName = rt;

exports.templateCompilerHooks = templateCompilerHooks;
//# sourceMappingURL=index.cjs.map
