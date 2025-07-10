import { DI as t, Registration as e, getResourceKeyFor as n, registrableMetadataKey as i, emptyArray as r, resolve as s, IContainer as l, isString as o, firstDefined as u, mergeArrays as c, Protocol as a, resourceBaseName as h, resource as d, camelCase as f, IPlatform as m, createImplementationRegister as p, noop as g, toArray as w, pascalCase as b, ILogger as A, allResources as y } from "../../../kernel/dist/native-modules/index.mjs";

import { Metadata as I } from "../../../metadata/dist/native-modules/index.mjs";

import { PrimitiveLiteralExpression as S, IExpressionParser as B } from "../../../expression-parser/dist/native-modules/index.mjs";

const P = t.createInterface;

const C = Object.freeze;

const {aliasTo: T, singleton: R} = e;

const E = "Interpolation";

const x = "IsFunction";

const v = "IsProperty";

const _ = "custom-element";

const k = /*@__PURE__*/ C({
    default: 0,
    oneTime: 1,
    toView: 2,
    fromView: 4,
    twoWay: 6
});

const L = /*@__PURE__*/ P("ITemplateCompiler");

const D = /*@__PURE__*/ P("IAttrMapper");

const createMappedError = (t, ...e) => {
    const n = String(t).padStart(4, "0");
    return new Error(`AUR${n}:${e.map(String)}`);
};

var V, H, M, $, F;

class CharSpec {
    constructor(t, e, n, i) {
        this.chars = t;
        this.repeat = e;
        this.isSymbol = n;
        this.isInverted = i;
        if (i) {
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
        this.parts = r;
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
    set pattern(t) {
        if (t == null) {
            this.C = "";
            this.parts = r;
        } else {
            this.C = t;
            this.parts = this.R[t];
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
        let i = null;
        let r = 0;
        for (;r < n; ++r) {
            i = e[r];
            if (t.equals(i.charSpec)) {
                return i;
            }
        }
        return null;
    }
    append(t, e) {
        const n = this.L;
        if (!n.includes(e)) {
            n.push(e);
        }
        let i = this.findChild(t);
        if (i == null) {
            i = new AttrParsingState(t, e);
            this.V.push(i);
            if (t.repeat) {
                i.V.push(i);
            }
        }
        return i;
    }
    findMatches(t, e) {
        const n = [];
        const i = this.V;
        const r = i.length;
        let s = 0;
        let l = null;
        let o = 0;
        let u = 0;
        for (;o < r; ++o) {
            l = i[o];
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
        let i = 0;
        for (;e > i; ++i) {
            n.push(new CharSpec(t[i], false, false, false));
        }
    }
    eachChar(t) {
        const e = this.M;
        const n = this.$;
        let i = 0;
        for (;e > i; ++i) {
            t(n[i]);
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

const O = /*@__PURE__*/ P("ISyntaxInterpreter", t => t.singleton(SyntaxInterpreter));

class SyntaxInterpreter {
    constructor() {
        this.O = new AttrParsingState(null);
        this.W = [ this.O ];
    }
    add(t) {
        t = t.slice(0).sort((t, e) => t.pattern > e.pattern ? 1 : -1);
        const e = t.length;
        let n;
        let i;
        let r;
        let s;
        let l;
        let o;
        let u;
        let c = 0;
        let a;
        while (e > c) {
            n = this.O;
            i = t[c];
            r = i.pattern;
            s = new SegmentTypes;
            l = this.N(i, s);
            o = l.length;
            u = t => n = n.append(t, r);
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
        let i = this.W;
        let r = 0;
        let s;
        for (;r < n; ++r) {
            i = this.j(i, t.charAt(r), e);
            if (i.length === 0) {
                break;
            }
        }
        i = i.filter(isEndpoint);
        if (i.length > 0) {
            i.sort(sortEndpoint);
            s = i[0];
            if (!s.charSpec.isSymbol) {
                e.next(s.C);
            }
            e.pattern = s.C;
        }
        return e;
    }
    j(t, e, n) {
        const i = [];
        let r = null;
        const s = t.length;
        let l = 0;
        for (;l < s; ++l) {
            r = t[l];
            i.push(...r.findMatches(e, n));
        }
        return i;
    }
    N(t, e) {
        const n = [];
        const i = t.pattern;
        const r = i.length;
        const s = t.symbols;
        let l = 0;
        let o = 0;
        let u = "";
        while (l < r) {
            u = i.charAt(l);
            if (s.length === 0 || !s.includes(u)) {
                if (l === o) {
                    if (u === "P" && i.slice(l, l + 4) === "PART") {
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
                n.push(new StaticSegment(i.slice(o, l)));
                ++e.statics;
                o = l;
            } else {
                n.push(new SymbolSegment(i.slice(o, l + 1)));
                ++e.symbols;
                o = ++l;
            }
        }
        if (o !== l) {
            n.push(new StaticSegment(i.slice(o, l)));
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
    const i = e.H;
    if (n.statics !== i.statics) {
        return i.statics - n.statics;
    }
    if (n.dynamics !== i.dynamics) {
        return i.dynamics - n.dynamics;
    }
    if (n.symbols !== i.symbols) {
        return i.symbols - n.symbols;
    }
    return 0;
}

class AttrSyntax {
    constructor(t, e, n, i, r = null) {
        this.rawName = t;
        this.rawValue = e;
        this.target = n;
        this.command = i;
        this.parts = r;
    }
}

const W = /*@__PURE__*/ P("IAttributePattern");

const N = /*@__PURE__*/ P("IAttributeParser", t => t.singleton(AttributeParser));

class AttributeParser {
    constructor() {
        this.U = {};
        this.L = {};
        this.q = false;
        this.G = [];
        this.J = s(O);
        this.c = s(l);
    }
    registerPattern(t, e) {
        if (this.q) throw createMappedError(88);
        const n = this.L;
        for (const {pattern: i} of t) {
            if (n[i] != null) throw createMappedError(89, i);
            n[i] = {
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
        if (!this.q) {
            this.K();
            this.q = true;
        }
        let n = this.U[t];
        if (n == null) {
            n = this.U[t] = this.J.interpret(t);
        }
        const i = n.pattern;
        if (i == null) {
            return new AttrSyntax(t, e, t, null, null);
        } else {
            return this.L[i].pattern[i](t, e, n.parts);
        }
    }
}

function attributePattern(...t) {
    return function decorator(e, n) {
        const r = j.create(t, e);
        n.metadata[i] = r;
        return e;
    };
}

const j = /*@__PURE__*/ C({
    name: n("attribute-pattern"),
    create(t, e) {
        return {
            register(n) {
                n.get(N).registerPattern(t, e);
                R(W, e).register(n);
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

V = Symbol.metadata;

DotSeparatedAttributePattern[V] = {
    [i]: /*@__PURE__*/ j.create([ {
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
        let i = n[0];
        if (i === "view-model") {
            i = "component";
        }
        return new AttrSyntax(t, e, i, "ref");
    }
}

H = Symbol.metadata;

RefAttributePattern[H] = {
    [i]: /*@__PURE__*/ j.create([ {
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

M = Symbol.metadata;

EventAttributePattern[M] = {
    [i]: /*@__PURE__*/ j.create([ {
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

$ = Symbol.metadata;

ColonPrefixedBindAttributePattern[$] = {
    [i]: /*@__PURE__*/ j.create([ {
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

F = Symbol.metadata;

AtPrefixedTriggerAttributePattern[F] = {
    [i]: /*@__PURE__*/ j.create([ {
        pattern: "@PART",
        symbols: "@"
    }, {
        pattern: "@PART:PART",
        symbols: "@:"
    } ], AtPrefixedTriggerAttributePattern)
};

const U = I.get;

I.has;

const q = I.define;

const z = "ra";

const G = "rb";

const J = "rc";

const K = "rd";

const Q = "re";

const X = "rf";

const Y = "rg";

const Z = "ri";

const tt = "rj";

const et = "rk";

const nt = "rl";

const it = "ha";

const rt = "hb";

const st = "hc";

const lt = "hd";

const ot = "he";

const ut = "hf";

const ct = "hg";

const at = "hs";

const ht = "hp";

const dt = "svb";

const ft = /*@__PURE__*/ C({
    hydrateElement: z,
    hydrateAttribute: G,
    hydrateTemplateController: J,
    hydrateLetElement: K,
    setProperty: Q,
    interpolation: X,
    propertyBinding: Y,
    letBinding: Z,
    refBinding: tt,
    iteratorBinding: et,
    multiAttr: nt,
    textBinding: it,
    listenerBinding: rt,
    attributeBinding: st,
    stylePropertyBinding: lt,
    setAttribute: ot,
    setClassAttribute: ut,
    setStyleAttribute: ct,
    spreadTransferedBinding: at,
    spreadElementProp: ht,
    spreadValueBinding: dt
});

const mt = /*@__PURE__*/ P("Instruction");

class InterpolationInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = X;
    }
}

class PropertyBindingInstruction {
    constructor(t, e, n) {
        this.from = t;
        this.to = e;
        this.mode = n;
        this.type = Y;
    }
}

class IteratorBindingInstruction {
    constructor(t, e, n) {
        this.forOf = t;
        this.to = e;
        this.props = n;
        this.type = et;
    }
}

class RefBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = tt;
    }
}

class SetPropertyInstruction {
    constructor(t, e) {
        this.value = t;
        this.to = e;
        this.type = Q;
    }
}

class MultiAttrInstruction {
    constructor(t, e, n) {
        this.value = t;
        this.to = e;
        this.command = n;
        this.type = nt;
    }
}

class HydrateElementInstruction {
    constructor(t, e, n, i, r, s) {
        this.res = t;
        this.props = e;
        this.projections = n;
        this.containerless = i;
        this.captures = r;
        this.data = s;
        this.type = z;
    }
}

class HydrateAttributeInstruction {
    constructor(t, e, n) {
        this.res = t;
        this.alias = e;
        this.props = n;
        this.type = G;
    }
}

class HydrateTemplateController {
    constructor(t, e, n, i) {
        this.def = t;
        this.res = e;
        this.alias = n;
        this.props = i;
        this.type = J;
    }
}

class HydrateLetElementInstruction {
    constructor(t, e) {
        this.instructions = t;
        this.toBindingContext = e;
        this.type = K;
    }
}

class LetBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = Z;
    }
}

class TextBindingInstruction {
    constructor(t) {
        this.from = t;
        this.type = it;
    }
}

class ListenerBindingInstruction {
    constructor(t, e, n, i) {
        this.from = t;
        this.to = e;
        this.capture = n;
        this.modifier = i;
        this.type = rt;
    }
}

class StylePropertyBindingInstruction {
    constructor(t, e) {
        this.from = t;
        this.to = e;
        this.type = lt;
    }
}

class SetAttributeInstruction {
    constructor(t, e) {
        this.value = t;
        this.to = e;
        this.type = ot;
    }
}

class SetClassAttributeInstruction {
    constructor(t) {
        this.value = t;
        this.type = ut;
    }
}

class SetStyleAttributeInstruction {
    constructor(t) {
        this.value = t;
        this.type = ct;
    }
}

class AttributeBindingInstruction {
    constructor(t, e, n) {
        this.attr = t;
        this.from = e;
        this.to = n;
        this.type = st;
    }
}

class SpreadTransferedBindingInstruction {
    constructor() {
        this.type = at;
    }
}

class SpreadElementPropBindingInstruction {
    constructor(t) {
        this.instruction = t;
        this.type = ht;
    }
}

class SpreadValueBindingInstruction {
    constructor(t, e) {
        this.target = t;
        this.from = e;
        this.type = dt;
    }
}

function bindingCommand(t) {
    return function(e, n) {
        n.addInitializer(function() {
            wt.define(t, e);
        });
        return e;
    };
}

class BindingCommandDefinition {
    constructor(t, e, n, i) {
        this.Type = t;
        this.name = e;
        this.aliases = n;
        this.key = i;
    }
    static create(t, e) {
        let n;
        let i;
        if (o(t)) {
            n = t;
            i = {
                name: n
            };
        } else {
            n = t.name;
            i = t;
        }
        return new BindingCommandDefinition(e, u(getCommandAnnotation(e, "name"), n), c(getCommandAnnotation(e, "aliases"), i.aliases, e.aliases), getCommandKeyFrom(n));
    }
    register(t, e) {
        const n = this.Type;
        const i = typeof e === "string" ? getCommandKeyFrom(e) : this.key;
        const r = this.aliases;
        if (!t.has(i, false)) {
            t.register(t.has(n, false) ? null : R(n, n), T(n, i), ...r.map(t => T(n, getCommandKeyFrom(t))));
        }
    }
}

const pt = "binding-command";

const gt = /*@__PURE__*/ n(pt);

const getCommandKeyFrom = t => `${gt}:${t}`;

const getCommandAnnotation = (t, e) => U(a.annotation.keyFor(e), t);

const wt = /*@__PURE__*/ (() => {
    const t = "__au_static_resource__";
    const getDefinitionFromStaticAu = (e, n, i) => {
        let r = U(t, e);
        if (r == null) {
            if (e.$au?.type === n) {
                r = i(e.$au, e);
                q(r, e, t);
            }
        }
        return r;
    };
    return C({
        name: gt,
        keyFrom: getCommandKeyFrom,
        define(t, e) {
            const n = BindingCommandDefinition.create(t, e);
            const i = n.Type;
            q(n, i, gt, h);
            return i;
        },
        getAnnotation: getCommandAnnotation,
        find(t, e) {
            const n = t.find(pt, e);
            return n == null ? null : U(gt, n) ?? getDefinitionFromStaticAu(n, pt, BindingCommandDefinition.create) ?? null;
        },
        get(t, e) {
            return t.get(d(getCommandKeyFrom(e)));
        }
    });
})();

class OneTimeBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e, n) {
        const i = t.attr;
        let r = i.target;
        let s = t.attr.rawValue;
        s = s === "" ? f(r) : s;
        if (t.bindable == null) {
            r = n.map(t.node, r) ?? f(r);
        } else {
            r = t.bindable.name;
        }
        return new PropertyBindingInstruction(e.parse(s, v), r, 1);
    }
}

OneTimeBindingCommand.$au = {
    type: pt,
    name: "one-time"
};

class ToViewBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e, n) {
        const i = t.attr;
        let r = i.target;
        let s = t.attr.rawValue;
        s = s === "" ? f(r) : s;
        if (t.bindable == null) {
            r = n.map(t.node, r) ?? f(r);
        } else {
            r = t.bindable.name;
        }
        return new PropertyBindingInstruction(e.parse(s, v), r, 2);
    }
}

ToViewBindingCommand.$au = {
    type: pt,
    name: "to-view"
};

class FromViewBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e, n) {
        const i = t.attr;
        let r = i.target;
        let s = i.rawValue;
        s = s === "" ? f(r) : s;
        if (t.bindable == null) {
            r = n.map(t.node, r) ?? f(r);
        } else {
            r = t.bindable.name;
        }
        return new PropertyBindingInstruction(e.parse(s, v), r, 4);
    }
}

FromViewBindingCommand.$au = {
    type: pt,
    name: "from-view"
};

class TwoWayBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e, n) {
        const i = t.attr;
        let r = i.target;
        let s = i.rawValue;
        s = s === "" ? f(r) : s;
        if (t.bindable == null) {
            r = n.map(t.node, r) ?? f(r);
        } else {
            r = t.bindable.name;
        }
        return new PropertyBindingInstruction(e.parse(s, v), r, 6);
    }
}

TwoWayBindingCommand.$au = {
    type: pt,
    name: "two-way"
};

class DefaultBindingCommand {
    get ignoreAttr() {
        return false;
    }
    build(t, e, n) {
        const i = t.attr;
        const r = t.bindable;
        let s = i.rawValue;
        let l = i.target;
        let u;
        let c;
        s = s === "" ? f(l) : s;
        if (r == null) {
            c = n.isTwoWay(t.node, l) ? 6 : 2;
            l = n.map(t.node, l) ?? f(l);
        } else {
            u = t.def.defaultBindingMode ?? 0;
            c = r.mode === 0 || r.mode == null ? u == null || u === 0 ? 2 : u : r.mode;
            l = r.name;
        }
        return new PropertyBindingInstruction(e.parse(s, v), l, o(c) ? k[c] ?? 0 : c);
    }
}

DefaultBindingCommand.$au = {
    type: pt,
    name: "bind"
};

class ForBindingCommand {
    constructor() {
        this.X = s(N);
    }
    get ignoreAttr() {
        return false;
    }
    build(t, e) {
        const n = t.bindable === null ? f(t.attr.target) : t.bindable.name;
        const i = e.parse(t.attr.rawValue, "IsIterator");
        let s = r;
        if (i.semiIdx > -1) {
            const e = t.attr.rawValue.slice(i.semiIdx + 1);
            const n = e.indexOf(":");
            if (n > -1) {
                const t = e.slice(0, n).trim();
                const i = e.slice(n + 1).trim();
                const r = this.X.parse(t, i);
                s = [ new MultiAttrInstruction(i, r.target, r.command) ];
            }
        }
        return new IteratorBindingInstruction(i, n, s);
    }
}

ForBindingCommand.$au = {
    type: pt,
    name: "for"
};

class TriggerBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new ListenerBindingInstruction(e.parse(t.attr.rawValue, x), t.attr.target, false, t.attr.parts?.[2] ?? null);
    }
}

TriggerBindingCommand.$au = {
    type: pt,
    name: "trigger"
};

class CaptureBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new ListenerBindingInstruction(e.parse(t.attr.rawValue, x), t.attr.target, true, t.attr.parts?.[2] ?? null);
    }
}

CaptureBindingCommand.$au = {
    type: pt,
    name: "capture"
};

class AttrBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        const n = t.attr;
        const i = n.target;
        let r = n.rawValue;
        r = r === "" ? f(i) : r;
        return new AttributeBindingInstruction(i, e.parse(r, v), i);
    }
}

AttrBindingCommand.$au = {
    type: pt,
    name: "attr"
};

class StyleBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new AttributeBindingInstruction("style", e.parse(t.attr.rawValue, v), t.attr.target);
    }
}

StyleBindingCommand.$au = {
    type: pt,
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
        return new AttributeBindingInstruction("class", e.parse(t.attr.rawValue, v), n);
    }
}

ClassBindingCommand.$au = {
    type: pt,
    name: "class"
};

class RefBindingCommand {
    get ignoreAttr() {
        return true;
    }
    build(t, e) {
        return new RefBindingInstruction(e.parse(t.attr.rawValue, v), t.attr.target);
    }
}

RefBindingCommand.$au = {
    type: pt,
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
    type: pt,
    name: "spread"
};

typeof SuppressedError === "function" ? SuppressedError : function(t, e, n) {
    var i = new Error(n);
    return i.name = "SuppressedError", i.error = t, i.suppressed = e, i;
};

const bt = /*@__PURE__*/ P("ITemplateElementFactory", t => t.singleton(TemplateElementFactory));

const At = {};

class TemplateElementFactory {
    constructor() {
        this.p = s(m);
        this.Y = this.t();
    }
    t() {
        return this.p.document.createElement("template");
    }
    createTemplate(t) {
        if (o(t)) {
            let e = At[t];
            if (e === void 0) {
                const n = this.Y;
                n.innerHTML = t;
                const i = n.content.firstElementChild;
                if (needsWrapping(i)) {
                    this.Y = this.t();
                    e = n;
                } else {
                    n.content.removeChild(i);
                    e = i;
                }
                At[t] = e;
            }
            return e.cloneNode(true);
        }
        if (t.nodeName !== "TEMPLATE") {
            const e = this.t();
            e.content.appendChild(t);
            return e;
        }
        t.parentNode?.removeChild(t);
        return t.cloneNode(true);
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
            const i = t.nextSibling;
            if (i != null) {
                switch (i.nodeType) {
                  case 3:
                    return i.textContent.trim().length > 0;
                }
            }
            return false;
        }
    }
}

const yt = "au-start";

const It = "au-end";

const insertBefore = (t, e, n) => t.insertBefore(e, n);

const insertManyBefore = (t, e, n) => {
    if (t === null) {
        return;
    }
    const i = n.length;
    let r = 0;
    while (i > r) {
        t.insertBefore(n[r], e);
        ++r;
    }
};

const appendToTemplate = (t, e) => t.content.appendChild(e);

const appendManyToTemplate = (t, e) => {
    const n = e.length;
    let i = 0;
    while (n > i) {
        t.content.appendChild(e[i]);
        ++i;
    }
};

const isElement = t => t.nodeType === 1;

const isTextNode = t => t.nodeType === 3;

const St = "au-slot";

const Bt = "default";

const Pt = (t => () => `anonymous-${++t}`)(0);

class TemplateCompiler {
    constructor() {
        this.debug = false;
        this.resolveResources = true;
    }
    compile(t, e) {
        if (t.template == null || t.needsCompile === false) {
            return t;
        }
        const n = new CompilationContext(t, e, null, null, void 0);
        const i = o(t.template) || !t.enhance ? n.Z.createTemplate(t.template) : t.template;
        const s = i.nodeName === Ct && i.content != null;
        const l = s ? i.content : i;
        const u = Vt.findAll(e);
        const c = u.length;
        let a = 0;
        if (c > 0) {
            while (c > a) {
                u[a].compiling?.(i);
                ++a;
            }
        }
        if (i.hasAttribute(Lt)) {
            throw createMappedError(701, t);
        }
        this.tt(l, n);
        this.et(l, n);
        const h = {
            ...t,
            name: t.name || Pt(),
            dependencies: (t.dependencies ?? r).concat(n.deps ?? r),
            instructions: n.rows,
            surrogates: s ? this.nt(i, n) : r,
            template: i,
            hasSlots: n.hasSlot,
            needsCompile: false
        };
        return h;
    }
    compileSpread(t, e, n, i, r) {
        const s = new CompilationContext(t, n, null, null, void 0);
        const l = [];
        const o = r ?? s.it(i.nodeName.toLowerCase());
        const u = o !== null;
        const c = s.ep;
        const a = e.length;
        let h = 0;
        let d;
        let m = null;
        let p;
        let g;
        let w;
        let b;
        let A;
        let y = null;
        let I;
        let S;
        let B;
        let P;
        for (;a > h; ++h) {
            d = e[h];
            B = d.target;
            P = d.rawValue;
            if (B === "...$attrs") {
                l.push(new SpreadTransferedBindingInstruction);
                continue;
            }
            y = s.rt(d);
            if (y !== null && y.ignoreAttr) {
                Rt.node = i;
                Rt.attr = d;
                Rt.bindable = null;
                Rt.def = null;
                l.push(y.build(Rt, s.ep, s.m));
                continue;
            }
            if (u) {
                w = s.st(o);
                b = w.attrs[B];
                if (b !== void 0) {
                    if (y == null) {
                        I = c.parse(P, E);
                        l.push(new SpreadElementPropBindingInstruction(I == null ? new SetPropertyInstruction(P, b.name) : new InterpolationInstruction(I, b.name)));
                    } else {
                        Rt.node = i;
                        Rt.attr = d;
                        Rt.bindable = b;
                        Rt.def = o;
                        l.push(new SpreadElementPropBindingInstruction(y.build(Rt, s.ep, s.m)));
                    }
                    continue;
                }
            }
            m = s.lt(B);
            if (m !== null) {
                if (m.isTemplateController) {
                    throw createMappedError(9998, B);
                }
                w = s.st(m);
                S = m.noMultiBindings === false && y === null && hasInlineBindings(P);
                if (S) {
                    g = this.ot(i, P, m, s);
                } else {
                    A = w.primary;
                    if (y === null) {
                        I = c.parse(P, E);
                        g = [ I === null ? new SetPropertyInstruction(P, A.name) : new InterpolationInstruction(I, A.name) ];
                    } else {
                        Rt.node = i;
                        Rt.attr = d;
                        Rt.bindable = A;
                        Rt.def = m;
                        g = [ y.build(Rt, s.ep, s.m) ];
                    }
                }
                (p ??= []).push(new HydrateAttributeInstruction(this.resolveResources ? m : m.name, m.aliases != null && m.aliases.includes(B) ? B : void 0, g));
                continue;
            }
            if (y == null) {
                I = c.parse(P, E);
                if (I != null) {
                    l.push(new InterpolationInstruction(I, s.m.map(i, B) ?? f(B)));
                } else {
                    switch (B) {
                      case "class":
                        l.push(new SetClassAttributeInstruction(P));
                        break;

                      case "style":
                        l.push(new SetStyleAttributeInstruction(P));
                        break;

                      default:
                        l.push(new SetAttributeInstruction(P, B));
                    }
                }
            } else {
                Rt.node = i;
                Rt.attr = d;
                Rt.bindable = null;
                Rt.def = null;
                l.push(y.build(Rt, s.ep, s.m));
            }
        }
        resetCommandBuildInfo();
        if (p != null) {
            return p.concat(l);
        }
        return l;
    }
    nt(t, e) {
        const n = [];
        const i = t.attributes;
        const r = e.ep;
        let s = i.length;
        let l = 0;
        let o;
        let u;
        let c;
        let a;
        let h = null;
        let d;
        let m;
        let p;
        let g;
        let w = null;
        let b;
        let A;
        let y;
        let I;
        for (;s > l; ++l) {
            o = i[l];
            u = o.name;
            c = o.value;
            a = e.X.parse(u, c);
            y = a.target;
            I = a.rawValue;
            if (Et[y]) {
                throw createMappedError(702, u);
            }
            w = e.rt(a);
            if (w !== null && w.ignoreAttr) {
                Rt.node = t;
                Rt.attr = a;
                Rt.bindable = null;
                Rt.def = null;
                n.push(w.build(Rt, e.ep, e.m));
                continue;
            }
            h = e.lt(y);
            if (h !== null) {
                if (h.isTemplateController) {
                    throw createMappedError(703, y);
                }
                p = e.st(h);
                A = h.noMultiBindings === false && w === null && hasInlineBindings(I);
                if (A) {
                    m = this.ot(t, I, h, e);
                } else {
                    g = p.primary;
                    if (w === null) {
                        b = r.parse(I, E);
                        m = b === null ? I === "" ? [] : [ new SetPropertyInstruction(I, g.name) ] : [ new InterpolationInstruction(b, g.name) ];
                    } else {
                        Rt.node = t;
                        Rt.attr = a;
                        Rt.bindable = g;
                        Rt.def = h;
                        m = [ w.build(Rt, e.ep, e.m) ];
                    }
                }
                t.removeAttribute(u);
                --l;
                --s;
                (d ??= []).push(new HydrateAttributeInstruction(this.resolveResources ? h : h.name, h.aliases != null && h.aliases.includes(y) ? y : void 0, m));
                continue;
            }
            if (w === null) {
                b = r.parse(I, E);
                if (b != null) {
                    t.removeAttribute(u);
                    --l;
                    --s;
                    n.push(new InterpolationInstruction(b, e.m.map(t, y) ?? f(y)));
                } else {
                    switch (u) {
                      case "class":
                        n.push(new SetClassAttributeInstruction(I));
                        break;

                      case "style":
                        n.push(new SetStyleAttributeInstruction(I));
                        break;

                      default:
                        n.push(new SetAttributeInstruction(I, u));
                    }
                }
            } else {
                Rt.node = t;
                Rt.attr = a;
                Rt.bindable = null;
                Rt.def = null;
                n.push(w.build(Rt, e.ep, e.m));
            }
        }
        resetCommandBuildInfo();
        if (d != null) {
            return d.concat(n);
        }
        return n;
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
    ut(t, e) {
        const n = t.attributes;
        const i = n.length;
        const r = [];
        const s = e.ep;
        let l = false;
        let o = 0;
        let u;
        let c;
        let a;
        let h;
        let d;
        let m;
        let p;
        let g;
        for (;i > o; ++o) {
            u = n[o];
            a = u.name;
            h = u.value;
            if (a === "to-binding-context") {
                l = true;
                continue;
            }
            c = e.X.parse(a, h);
            m = c.target;
            p = c.rawValue;
            d = e.rt(c);
            if (d !== null) {
                if (c.command === "bind") {
                    r.push(new LetBindingInstruction(s.parse(p, v), f(m)));
                } else {
                    throw createMappedError(704, c);
                }
                continue;
            }
            g = s.parse(p, E);
            r.push(new LetBindingInstruction(g === null ? new S(p) : g, f(m)));
        }
        e.rows.push([ new HydrateLetElementInstruction(r, l) ]);
        return this.dt(t, e).nextSibling;
    }
    ct(t, e) {
        const n = t.nextSibling;
        const i = (t.getAttribute("as-element") ?? t.nodeName).toLowerCase();
        const s = e.it(i);
        const l = s !== null;
        const o = l && s.shadowOptions != null;
        const u = s?.capture;
        const c = u != null && typeof u !== "boolean";
        const a = u ? [] : r;
        const h = e.ep;
        const d = this.debug ? g : () => {
            t.removeAttribute(y);
            --b;
            --w;
        };
        let m = t.attributes;
        let p;
        let w = m.length;
        let b = 0;
        let A;
        let y;
        let I;
        let S;
        let B;
        let P;
        let C = null;
        let T = false;
        let R;
        let x;
        let v;
        let k;
        let L;
        let D;
        let V;
        let H = null;
        let M;
        let $;
        let F;
        let O;
        let W = true;
        let N = false;
        let j = false;
        let U = false;
        let q;
        let z = 0;
        if (i === "slot") {
            if (e.root.def.shadowOptions == null) {
                throw createMappedError(717, e.root.def.name);
            }
            e.root.hasSlot = true;
        }
        if (l) {
            q = {};
            W = s.processContent?.call(s.Type, t, e.p, q);
            m = t.attributes;
            w = m.length;
        }
        for (;w > b; ++b) {
            A = m[b];
            y = A.name;
            I = A.value;
            switch (y) {
              case "as-element":
              case "containerless":
                d();
                N = N || y === "containerless";
                continue;
            }
            S = e.X.parse(y, I);
            H = e.rt(S);
            F = S.target;
            O = S.rawValue;
            if (u && (!c || c && u(F))) {
                if (H != null && H.ignoreAttr) {
                    d();
                    a.push(S);
                    continue;
                }
                j = F !== St && F !== "slot" && ((z = F.indexOf("...")) === -1 || z === 0 && F === "...$attrs");
                if (j) {
                    M = e.st(s);
                    if (M.attrs[F] == null && !e.lt(F)?.isTemplateController) {
                        d();
                        a.push(S);
                        continue;
                    }
                }
            }
            if (F === "...$attrs") {
                (B ??= []).push(new SpreadTransferedBindingInstruction);
                d();
                continue;
            }
            if (H?.ignoreAttr) {
                Rt.node = t;
                Rt.attr = S;
                Rt.bindable = null;
                Rt.def = null;
                (B ??= []).push(H.build(Rt, e.ep, e.m));
                d();
                continue;
            }
            if (F.indexOf("...") === 0) {
                if (l && (F = F.slice(3)) !== "$element") {
                    (P ??= []).push(new SpreadValueBindingInstruction("$bindables", F === "$bindables" ? O : F));
                    d();
                    continue;
                }
                throw createMappedError(720, F);
            }
            if (l) {
                M = e.st(s);
                R = M.attrs[F];
                if (R !== void 0) {
                    if (H === null) {
                        D = h.parse(O, E);
                        (P ??= []).push(D == null ? new SetPropertyInstruction(O, R.name) : new InterpolationInstruction(D, R.name));
                    } else {
                        Rt.node = t;
                        Rt.attr = S;
                        Rt.bindable = R;
                        Rt.def = s;
                        (P ??= []).push(H.build(Rt, e.ep, e.m));
                    }
                    d();
                    continue;
                }
                if (F === "$bindables") {
                    if (H != null) {
                        Rt.node = t;
                        Rt.attr = S;
                        Rt.bindable = null;
                        Rt.def = s;
                        {
                            (P ??= []).push(H.build(Rt, e.ep, e.m));
                        }
                    }
                    d();
                    continue;
                }
            }
            if (F === "$bindables") {
                throw createMappedError(721, t.nodeName, F, O);
            }
            C = e.lt(F);
            if (C !== null) {
                M = e.st(C);
                T = C.noMultiBindings === false && H === null && hasInlineBindings(O);
                if (T) {
                    v = this.ot(t, O, C, e);
                } else {
                    $ = M.primary;
                    if (H === null) {
                        D = h.parse(O, E);
                        v = D === null ? O === "" ? [] : [ new SetPropertyInstruction(O, $.name) ] : [ new InterpolationInstruction(D, $.name) ];
                    } else {
                        Rt.node = t;
                        Rt.attr = S;
                        Rt.bindable = $;
                        Rt.def = C;
                        v = [ H.build(Rt, e.ep, e.m) ];
                    }
                }
                d();
                if (C.isTemplateController) {
                    (k ??= []).push(new HydrateTemplateController(Tt, this.resolveResources ? C : C.name, void 0, v));
                } else {
                    (x ??= []).push(new HydrateAttributeInstruction(this.resolveResources ? C : C.name, C.aliases != null && C.aliases.includes(F) ? F : void 0, v));
                }
                continue;
            }
            if (H === null) {
                D = h.parse(O, E);
                if (D != null) {
                    d();
                    (B ??= []).push(new InterpolationInstruction(D, e.m.map(t, F) ?? f(F)));
                }
                continue;
            }
            Rt.node = t;
            Rt.attr = S;
            Rt.bindable = null;
            Rt.def = null;
            (B ??= []).push(H.build(Rt, e.ep, e.m));
            d();
        }
        resetCommandBuildInfo();
        if (this.ft(t, B) && B != null && B.length > 1) {
            this.gt(t, B);
        }
        if (l) {
            V = new HydrateElementInstruction(this.resolveResources ? s : s.name, P ?? r, null, N, a, q);
        }
        if (B != null || V != null || x != null) {
            p = r.concat(V ?? r, x ?? r, B ?? r);
            U = true;
        }
        let G;
        if (k != null) {
            w = k.length - 1;
            b = w;
            L = k[b];
            let n;
            if (isMarker(t)) {
                n = e.t();
                appendManyToTemplate(n, [ e.wt(), e.bt(yt), e.bt(It) ]);
            } else {
                this.At(t, e);
                if (t.nodeName === "TEMPLATE") {
                    n = t;
                } else {
                    n = e.t();
                    appendToTemplate(n, t);
                }
            }
            const r = n;
            const u = e.yt(p == null ? [] : [ p ]);
            let c;
            let a;
            let h = false;
            let d;
            let f;
            let m;
            let g;
            let A;
            let y;
            let I = 0, S = 0;
            let B = t.firstChild;
            let P = false;
            if (W !== false) {
                while (B !== null) {
                    a = isElement(B) ? B.getAttribute(St) : null;
                    h = a !== null || l && !o;
                    c = B.nextSibling;
                    if (h) {
                        if (!l) {
                            throw createMappedError(706, a, i);
                        }
                        B.removeAttribute?.(St);
                        P = isTextNode(B) && B.textContent.trim() === "";
                        if (!P) {
                            ((f ??= {})[a || Bt] ??= []).push(B);
                        }
                        t.removeChild(B);
                    }
                    B = c;
                }
            }
            if (f != null) {
                d = {};
                for (a in f) {
                    n = e.t();
                    m = f[a];
                    for (I = 0, S = m.length; S > I; ++I) {
                        g = m[I];
                        if (g.nodeName === "TEMPLATE") {
                            if (g.attributes.length > 0) {
                                appendToTemplate(n, g);
                            } else {
                                appendToTemplate(n, g.content);
                            }
                        } else {
                            appendToTemplate(n, g);
                        }
                    }
                    y = e.yt();
                    this.et(n.content, y);
                    d[a] = {
                        name: Pt(),
                        type: _,
                        template: n,
                        instructions: y.rows,
                        needsCompile: false
                    };
                }
                V.projections = d;
            }
            if (U) {
                if (l && (N || s.containerless)) {
                    this.At(t, e);
                } else {
                    this.dt(t, e);
                }
            }
            G = !l || !s.containerless && !N && W !== false;
            if (G) {
                if (t.nodeName === Ct) {
                    this.et(t.content, u);
                } else {
                    B = t.firstChild;
                    while (B !== null) {
                        B = this.et(B, u);
                    }
                }
            }
            L.def = {
                name: Pt(),
                type: _,
                template: r,
                instructions: u.rows,
                needsCompile: false
            };
            while (b-- > 0) {
                L = k[b];
                n = e.t();
                A = e.wt();
                appendManyToTemplate(n, [ A, e.bt(yt), e.bt(It) ]);
                L.def = {
                    name: Pt(),
                    type: _,
                    template: n,
                    needsCompile: false,
                    instructions: [ [ k[b + 1] ] ]
                };
            }
            e.rows.push([ L ]);
        } else {
            if (p != null) {
                e.rows.push(p);
            }
            let n = t.firstChild;
            let r;
            let u;
            let c = false;
            let a = null;
            let h;
            let d;
            let f;
            let m;
            let g;
            let w = false;
            let b = 0, A = 0;
            if (W !== false) {
                while (n !== null) {
                    u = isElement(n) ? n.getAttribute(St) : null;
                    c = u !== null || l && !o;
                    r = n.nextSibling;
                    if (c) {
                        if (!l) {
                            throw createMappedError(706, u, i);
                        }
                        n.removeAttribute?.(St);
                        w = isTextNode(n) && n.textContent.trim() === "";
                        if (!w) {
                            ((h ??= {})[u || Bt] ??= []).push(n);
                        }
                        t.removeChild(n);
                    }
                    n = r;
                }
            }
            if (h != null) {
                a = {};
                for (u in h) {
                    m = e.t();
                    d = h[u];
                    for (b = 0, A = d.length; A > b; ++b) {
                        f = d[b];
                        if (f.nodeName === Ct) {
                            if (f.attributes.length > 0) {
                                appendToTemplate(m, f);
                            } else {
                                appendToTemplate(m, f.content);
                            }
                        } else {
                            appendToTemplate(m, f);
                        }
                    }
                    g = e.yt();
                    this.et(m.content, g);
                    a[u] = {
                        name: Pt(),
                        type: _,
                        template: m,
                        instructions: g.rows,
                        needsCompile: false
                    };
                }
                V.projections = a;
            }
            if (U) {
                if (l && (N || s.containerless)) {
                    this.At(t, e);
                } else {
                    this.dt(t, e);
                }
            }
            G = !l || !s.containerless && !N && W !== false;
            if (G && t.childNodes.length > 0) {
                n = t.firstChild;
                while (n !== null) {
                    n = this.et(n, e);
                }
            }
        }
        return n;
    }
    ht(t, e) {
        const n = t.parentNode;
        const i = e.ep.parse(t.textContent, E);
        const r = t.nextSibling;
        let s;
        let l;
        let o;
        let u;
        let c;
        if (i !== null) {
            ({parts: s, expressions: l} = i);
            if (c = s[0]) {
                insertBefore(n, e.It(c), t);
            }
            for (o = 0, u = l.length; u > o; ++o) {
                insertManyBefore(n, t, [ e.wt(), e.It(" ") ]);
                if (c = s[o + 1]) {
                    insertBefore(n, e.It(c), t);
                }
                e.rows.push([ new TextBindingInstruction(l[o]) ]);
            }
            n.removeChild(t);
        }
        return r;
    }
    ot(t, e, n, i) {
        const r = i.st(n);
        const s = e.length;
        const l = [];
        let o = void 0;
        let u = void 0;
        let c = 0;
        let a = 0;
        let h;
        let d;
        let f;
        let m;
        for (let p = 0; p < s; ++p) {
            a = e.charCodeAt(p);
            if (a === 92) {
                ++p;
            } else if (a === 58) {
                o = e.slice(c, p);
                while (e.charCodeAt(++p) <= 32) ;
                c = p;
                for (;p < s; ++p) {
                    a = e.charCodeAt(p);
                    if (a === 92) {
                        ++p;
                    } else if (a === 59) {
                        u = e.slice(c, p);
                        break;
                    }
                }
                if (u === void 0) {
                    u = e.slice(c);
                }
                d = i.X.parse(o, u);
                f = i.rt(d);
                m = r.attrs[d.target];
                if (m == null) {
                    throw createMappedError(707, d.target, n.name);
                }
                if (f === null) {
                    h = i.ep.parse(u, E);
                    l.push(h === null ? new SetPropertyInstruction(u, m.name) : new InterpolationInstruction(h, m.name));
                } else {
                    Rt.node = t;
                    Rt.attr = d;
                    Rt.bindable = m;
                    Rt.def = n;
                    l.push(f.build(Rt, i.ep, i.m));
                }
                while (p < s && e.charCodeAt(++p) <= 32) ;
                c = p;
                o = void 0;
                u = void 0;
            }
        }
        resetCommandBuildInfo();
        return l;
    }
    tt(t, e) {
        const n = e.root.def.name;
        const i = t;
        const s = w(i.querySelectorAll("template[as-custom-element]"));
        const l = s.length;
        if (l === 0) {
            return;
        }
        if (l === i.childElementCount) {
            throw createMappedError(708, n);
        }
        const o = new Set;
        const u = [];
        for (const t of s) {
            if (t.parentNode !== i) {
                throw createMappedError(709, n);
            }
            const e = processTemplateName(n, t, o);
            const r = t.content;
            const s = w(r.querySelectorAll("bindable"));
            const l = new Set;
            const c = new Set;
            const a = s.reduce((t, n) => {
                if (n.parentNode !== r) {
                    throw createMappedError(710, e);
                }
                const i = n.getAttribute("name");
                if (i === null) {
                    throw createMappedError(711, n, e);
                }
                const s = n.getAttribute("attribute");
                if (s !== null && c.has(s) || l.has(i)) {
                    throw createMappedError(712, l, s);
                } else {
                    if (s !== null) {
                        c.add(s);
                    }
                    l.add(i);
                }
                const o = w(n.attributes).filter(t => !kt.includes(t.name));
                if (o.length > 0) ;
                n.remove();
                t[i] = {
                    name: i,
                    attribute: s ?? void 0,
                    mode: n.getAttribute("mode") ?? "default"
                };
                return t;
            }, {});
            class LocalDepType {}
            LocalDepType.$au = {
                type: _,
                name: e,
                template: t,
                bindables: a
            };
            Reflect.defineProperty(LocalDepType, "name", {
                value: b(e)
            });
            u.push(LocalDepType);
            i.removeChild(t);
        }
        const c = (e.root.def.dependencies ?? []).concat(e.root.def.Type == null ? r : [ e.root.def.Type ]);
        for (const t of u) {
            t.dependencies = c.concat(u.filter(e => e !== t));
            e.St(t);
        }
    }
    ft(t, e) {
        const n = t.nodeName;
        return n === "INPUT" && xt[t.type] === 1 || n === "SELECT" && (t.hasAttribute("multiple") || e?.some(t => t.type === Y && t.to === "multiple"));
    }
    gt(t, e) {
        switch (t.nodeName) {
          case "INPUT":
            {
                const t = e;
                let n = void 0;
                let i = void 0;
                let r = 0;
                let s;
                for (let e = 0; e < t.length && r < 3; e++) {
                    s = t[e];
                    switch (s.to) {
                      case "model":
                      case "value":
                      case "matcher":
                        n = e;
                        r++;
                        break;

                      case "checked":
                        i = e;
                        r++;
                        break;
                    }
                }
                if (i !== void 0 && n !== void 0 && i < n) {
                    [t[n], t[i]] = [ t[i], t[n] ];
                }
                break;
            }

          case "SELECT":
            {
                const t = e;
                let n = 0;
                let i = 0;
                let r = 0;
                let s;
                for (let e = 0; e < t.length && r < 2; ++e) {
                    s = t[e];
                    switch (s.to) {
                      case "multiple":
                        i = e;
                        r++;
                        break;

                      case "value":
                        n = e;
                        r++;
                        break;
                    }
                    if (r === 2 && n < i) {
                        [t[i], t[n]] = [ t[n], t[i] ];
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
        const i = e.wt();
        insertManyBefore(n, t, [ i, e.bt(yt), e.bt(It) ]);
        n.removeChild(t);
        return i;
    }
}

TemplateCompiler.register = p(L);

const Ct = "TEMPLATE";

const isMarker = t => t.nodeValue === "au*";

class CompilationContext {
    constructor(t, e, n, i, r) {
        this.hasSlot = false;
        this.deps = null;
        const s = n !== null;
        this.c = e;
        this.root = i === null ? this : i;
        this.def = t;
        this.parent = n;
        this.Bt = s ? n.Bt : e.get(vt);
        this.Pt = s ? n.Pt : e.get(_t);
        this.Z = s ? n.Z : e.get(bt);
        this.X = s ? n.X : e.get(N);
        this.ep = s ? n.ep : e.get(B);
        this.m = s ? n.m : e.get(D);
        this.Ct = s ? n.Ct : e.get(A);
        if (typeof (this.p = s ? n.p : e.get(m)).document?.nodeType !== "number") {
            throw createMappedError(722);
        }
        this.localEls = s ? n.localEls : new Set;
        this.rows = r ?? [];
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
    it(t) {
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
    rt(t) {
        const e = t.command;
        if (e === null) {
            return null;
        }
        return this.Pt.get(this.c, e);
    }
}

const hasInlineBindings = t => {
    const e = t.length;
    let n = 0;
    let i = 0;
    while (e > i) {
        n = t.charCodeAt(i);
        if (n === 92) {
            ++i;
        } else if (n === 58) {
            return true;
        } else if (n === 36 && t.charCodeAt(i + 1) === 123) {
            return false;
        }
        ++i;
    }
    return false;
};

const resetCommandBuildInfo = () => {
    Rt.node = Rt.attr = Rt.bindable = Rt.def = null;
};

const Tt = {
    name: "unnamed",
    type: _
};

const Rt = {
    node: null,
    attr: null,
    bindable: null,
    def: null
};

const Et = {
    id: true,
    name: true,
    "au-slot": true,
    "as-element": true
};

const xt = {
    checkbox: 1,
    radio: 1
};

const vt = /*@__PURE__*/ P("IResourceResolver");

const _t = /*@__PURE__*/ P("IBindingCommandResolver", t => {
    class DefaultBindingCommandResolver {
        constructor() {
            this.U = new WeakMap;
        }
        get(t, e) {
            let n = this.U.get(t);
            if (!n) {
                this.U.set(t, n = {});
            }
            return e in n ? n[e] : n[e] = wt.get(t, e);
        }
    }
    return t.singleton(DefaultBindingCommandResolver);
});

const kt = C([ "name", "attribute", "mode" ]);

const Lt = "as-custom-element";

const processTemplateName = (t, e, n) => {
    const i = e.getAttribute(Lt);
    if (i === null || i === "") {
        throw createMappedError(715, t);
    }
    if (n.has(i)) {
        throw createMappedError(716, i, t);
    } else {
        n.add(i);
        e.removeAttribute(Lt);
    }
    return i;
};

const Dt = /*@__PURE__*/ P("ITemplateCompilerHooks");

const Vt = C({
    name: /*@__PURE__*/ n("compiler-hooks"),
    define(t) {
        return {
            register(e) {
                R(Dt, t).register(e);
            }
        };
    },
    findAll(t) {
        return t.get(y(Dt));
    }
});

const templateCompilerHooks = (t, e) => {
    return t === void 0 ? decorator : decorator(t, e);
    function decorator(t, e) {
        e.metadata[i] = Vt.define(t);
        return t;
    }
};

export { AtPrefixedTriggerAttributePattern, AttrBindingCommand, AttrSyntax, AttributeBindingInstruction, AttributeParser, j as AttributePattern, wt as BindingCommand, BindingCommandDefinition, k as BindingMode, CaptureBindingCommand, ClassBindingCommand, ColonPrefixedBindAttributePattern, DefaultBindingCommand, DotSeparatedAttributePattern, EventAttributePattern, ForBindingCommand, FromViewBindingCommand, HydrateAttributeInstruction, HydrateElementInstruction, HydrateLetElementInstruction, HydrateTemplateController, D as IAttrMapper, N as IAttributeParser, W as IAttributePattern, _t as IBindingCommandResolver, mt as IInstruction, vt as IResourceResolver, O as ISyntaxInterpreter, L as ITemplateCompiler, Dt as ITemplateCompilerHooks, bt as ITemplateElementFactory, ft as InstructionType, InterpolationInstruction, Interpretation, IteratorBindingInstruction, LetBindingInstruction, ListenerBindingInstruction, MultiAttrInstruction, OneTimeBindingCommand, PropertyBindingInstruction, RefAttributePattern, RefBindingCommand, RefBindingInstruction, SetAttributeInstruction, SetClassAttributeInstruction, SetPropertyInstruction, SetStyleAttributeInstruction, SpreadElementPropBindingInstruction, SpreadTransferedBindingInstruction, SpreadValueBindingCommand, SpreadValueBindingInstruction, StyleBindingCommand, StylePropertyBindingInstruction, SyntaxInterpreter, TemplateCompiler, Vt as TemplateCompilerHooks, TextBindingInstruction, ToViewBindingCommand, TriggerBindingCommand, TwoWayBindingCommand, attributePattern, bindingCommand, Pt as generateElementName, templateCompilerHooks };

