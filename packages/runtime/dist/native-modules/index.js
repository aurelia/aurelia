import { Metadata as t, Protocol as e, Registration as r, DI as s, firstDefined as i, mergeArrays as n, fromAnnotationOrDefinitionOrTypeOrDefault as o, isNumberOrBigInt as h, isStringOrDate as u, emptyArray as c, isArrayIndex as a, IPlatform as l, ILogger as f } from "../../../kernel/dist/native-modules/index.js";

export { IPlatform } from "../../../kernel/dist/native-modules/index.js";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "../../../platform/dist/native-modules/index.js";

const d = Object.prototype.hasOwnProperty;

const v = Reflect.defineProperty;

const p = t => "function" === typeof t;

function g(t, e, r) {
    v(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function b(t, e, r, s = false) {
    if (s || !d.call(t, e)) g(t, e, r);
}

const w = () => Object.create(null);

const E = t.getOwn;

const y = t.hasOwn;

const A = t.define;

const m = e.annotation.keyFor;

const U = e.resource.keyFor;

const O = e.resource.appendTo;

function S(...t) {
    return function(e) {
        const r = m("aliases");
        const s = E(r, e);
        if (void 0 === s) A(r, t, e); else s.push(...t);
    };
}

function x(t, e, s, i) {
    for (let n = 0, o = t.length; n < o; ++n) r.aliasTo(s, e.keyFrom(t[n])).register(i);
}

const C = Object.freeze({});

class BindingContext {
    constructor(t, e) {
        if (void 0 !== t) if (void 0 !== e) this[t] = e; else for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) this[e] = t[e];
    }
    static create(t, e) {
        return new BindingContext(t, e);
    }
    static get(t, e, r, s) {
        var i, n;
        if (null == t) throw new Error(`AUR0203:${t}`);
        let o = t.overrideContext;
        let h = t;
        if (r > 0) {
            while (r > 0) {
                r--;
                h = h.parentScope;
                if (null == (null === h || void 0 === h ? void 0 : h.overrideContext)) return;
            }
            o = h.overrideContext;
            return e in o ? o : o.bindingContext;
        }
        while (!(null === h || void 0 === h ? void 0 : h.isBoundary) && null != o && !(e in o) && !(o.bindingContext && e in o.bindingContext)) {
            h = null !== (i = h.parentScope) && void 0 !== i ? i : null;
            o = null !== (n = null === h || void 0 === h ? void 0 : h.overrideContext) && void 0 !== n ? n : null;
        }
        if (o) return e in o ? o : o.bindingContext;
        if (16 & s) return C;
        return t.bindingContext || t.overrideContext;
    }
}

class Scope {
    constructor(t, e, r, s) {
        this.parentScope = t;
        this.bindingContext = e;
        this.overrideContext = r;
        this.isBoundary = s;
    }
    static create(t, e, r) {
        return new Scope(null, t, null == e ? OverrideContext.create(t) : e, null !== r && void 0 !== r ? r : false);
    }
    static fromOverride(t) {
        if (null == t) throw new Error(`AUR0204:${t}`);
        return new Scope(null, t.bindingContext, t, false);
    }
    static fromParent(t, e) {
        if (null == t) throw new Error(`AUR0205:${t}`);
        return new Scope(t, e, OverrideContext.create(e), false);
    }
}

class OverrideContext {
    constructor(t) {
        this.bindingContext = t;
    }
    static create(t) {
        return new OverrideContext(t);
    }
}

const B = s.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = w();
    }
    dispatchSignal(t, e) {
        const r = this.signals[t];
        if (void 0 === r) return;
        let s;
        for (s of r.keys()) s.handleChange(void 0, void 0, e);
    }
    addSignalListener(t, e) {
        const r = this.signals;
        const s = r[t];
        if (void 0 === s) r[t] = new Set([ e ]); else s.add(e);
    }
    removeSignalListener(t, e) {
        const r = this.signals[t];
        if (r) r.delete(e);
    }
}

var k;

(function(t) {
    t[t["singleton"] = 1] = "singleton";
    t[t["interceptor"] = 2] = "interceptor";
})(k || (k = {}));

function L(t) {
    return function(e) {
        return T.define(t, e);
    };
}

class BindingBehaviorDefinition {
    constructor(t, e, r, s, i) {
        this.Type = t;
        this.name = e;
        this.aliases = r;
        this.key = s;
        this.strategy = i;
    }
    static create(t, e) {
        let r;
        let s;
        if ("string" === typeof t) {
            r = t;
            s = {
                name: r
            };
        } else {
            r = t.name;
            s = t;
        }
        const h = Object.getPrototypeOf(e) === BindingInterceptor;
        return new BindingBehaviorDefinition(e, i(P(e, "name"), r), n(P(e, "aliases"), s.aliases, e.aliases), T.keyFrom(r), o("strategy", s, e, (() => h ? 2 : 1)));
    }
    register(t) {
        const {Type: e, key: s, aliases: i, strategy: n} = this;
        switch (n) {
          case 1:
            r.singleton(s, e).register(t);
            break;

          case 2:
            r.instance(s, new BindingBehaviorFactory(t, e)).register(t);
            break;
        }
        r.aliasTo(s, e).register(t);
        x(i, T, s, t);
    }
}

class BindingBehaviorFactory {
    constructor(t, e) {
        this.ctn = t;
        this.Type = e;
        this.deps = s.getDependencies(e);
    }
    construct(t, e) {
        const r = this.ctn;
        const s = this.deps;
        switch (s.length) {
          case 0:
            return new this.Type(t, e);

          case 1:
            return new this.Type(r.get(s[0]), t, e);

          case 2:
            return new this.Type(r.get(s[0]), r.get(s[1]), t, e);

          default:
            return new this.Type(...s.map((t => r.get(t))), t, e);
        }
    }
}

class BindingInterceptor {
    constructor(t, e) {
        this.binding = t;
        this.expr = e;
        this.interceptor = this;
        let r;
        while (t.interceptor !== this) {
            r = t.interceptor;
            t.interceptor = this;
            t = r;
        }
    }
    get oL() {
        return this.binding.oL;
    }
    get locator() {
        return this.binding.locator;
    }
    get $scope() {
        return this.binding.$scope;
    }
    get isBound() {
        return this.binding.isBound;
    }
    get obs() {
        return this.binding.obs;
    }
    get sourceExpression() {
        return this.binding.sourceExpression;
    }
    updateTarget(t, e) {
        this.binding.updateTarget(t, e);
    }
    updateSource(t, e) {
        this.binding.updateSource(t, e);
    }
    callSource(t) {
        return this.binding.callSource(t);
    }
    handleChange(t, e, r) {
        this.binding.handleChange(t, e, r);
    }
    handleCollectionChange(t, e) {
        this.binding.handleCollectionChange(t, e);
    }
    observe(t, e) {
        this.binding.observe(t, e);
    }
    observeCollection(t) {
        this.binding.observeCollection(t);
    }
    $bind(t, e) {
        this.binding.$bind(t, e);
    }
    $unbind(t) {
        this.binding.$unbind(t);
    }
}

const $ = U("binding-behavior");

const P = (t, e) => E(m(e), t);

const T = Object.freeze({
    name: $,
    keyFrom(t) {
        return `${$}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && y($, t);
    },
    define(t, e) {
        const r = BindingBehaviorDefinition.create(t, e);
        A($, r, r.Type);
        A($, r, r);
        O(e, $);
        return r.Type;
    },
    getDefinition(t) {
        const e = E($, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        A(m(e), r, t);
    },
    getAnnotation: P
});

function R(t) {
    return function(e) {
        return M.define(t, e);
    };
}

class ValueConverterDefinition {
    constructor(t, e, r, s) {
        this.Type = t;
        this.name = e;
        this.aliases = r;
        this.key = s;
    }
    static create(t, e) {
        let r;
        let s;
        if ("string" === typeof t) {
            r = t;
            s = {
                name: r
            };
        } else {
            r = t.name;
            s = t;
        }
        return new ValueConverterDefinition(e, i(I(e, "name"), r), n(I(e, "aliases"), s.aliases, e.aliases), M.keyFrom(r));
    }
    register(t) {
        const {Type: e, key: s, aliases: i} = this;
        r.singleton(s, e).register(t);
        r.aliasTo(s, e).register(t);
        x(i, M, s, t);
    }
}

const j = U("value-converter");

const I = (t, e) => E(m(e), t);

const M = Object.freeze({
    name: j,
    keyFrom: t => `${j}:${t}`,
    isType(t) {
        return "function" === typeof t && y(j, t);
    },
    define(t, e) {
        const r = ValueConverterDefinition.create(t, e);
        A(j, r, r.Type);
        A(j, r, r);
        O(e, j);
        return r.Type;
    },
    getDefinition(t) {
        const e = E(j, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        A(m(e), r, t);
    },
    getAnnotation: I
});

var F;

(function(t) {
    t[t["CallsFunction"] = 128] = "CallsFunction";
    t[t["HasAncestor"] = 256] = "HasAncestor";
    t[t["IsPrimary"] = 512] = "IsPrimary";
    t[t["IsLeftHandSide"] = 1024] = "IsLeftHandSide";
    t[t["HasBind"] = 2048] = "HasBind";
    t[t["HasUnbind"] = 4096] = "HasUnbind";
    t[t["IsAssignable"] = 8192] = "IsAssignable";
    t[t["IsLiteral"] = 16384] = "IsLiteral";
    t[t["IsResource"] = 32768] = "IsResource";
    t[t["IsForDeclaration"] = 65536] = "IsForDeclaration";
    t[t["Type"] = 31] = "Type";
    t[t["AccessThis"] = 1793] = "AccessThis";
    t[t["AccessScope"] = 10082] = "AccessScope";
    t[t["ArrayLiteral"] = 17955] = "ArrayLiteral";
    t[t["ObjectLiteral"] = 17956] = "ObjectLiteral";
    t[t["PrimitiveLiteral"] = 17925] = "PrimitiveLiteral";
    t[t["Template"] = 17958] = "Template";
    t[t["Unary"] = 39] = "Unary";
    t[t["CallScope"] = 1448] = "CallScope";
    t[t["CallMember"] = 1161] = "CallMember";
    t[t["CallFunction"] = 1162] = "CallFunction";
    t[t["AccessMember"] = 9323] = "AccessMember";
    t[t["AccessKeyed"] = 9324] = "AccessKeyed";
    t[t["TaggedTemplate"] = 1197] = "TaggedTemplate";
    t[t["Binary"] = 46] = "Binary";
    t[t["Conditional"] = 63] = "Conditional";
    t[t["Assign"] = 8208] = "Assign";
    t[t["ValueConverter"] = 36913] = "ValueConverter";
    t[t["BindingBehavior"] = 38962] = "BindingBehavior";
    t[t["HtmlLiteral"] = 51] = "HtmlLiteral";
    t[t["ArrayBindingPattern"] = 65556] = "ArrayBindingPattern";
    t[t["ObjectBindingPattern"] = 65557] = "ObjectBindingPattern";
    t[t["BindingIdentifier"] = 65558] = "BindingIdentifier";
    t[t["ForOfStatement"] = 6199] = "ForOfStatement";
    t[t["Interpolation"] = 24] = "Interpolation";
})(F || (F = {}));

class Unparser {
    constructor() {
        this.text = "";
    }
    static unparse(t) {
        const e = new Unparser;
        t.accept(e);
        return e.text;
    }
    visitAccessMember(t) {
        t.object.accept(this);
        this.text += `.${t.name}`;
    }
    visitAccessKeyed(t) {
        t.object.accept(this);
        this.text += "[";
        t.key.accept(this);
        this.text += "]";
    }
    visitAccessThis(t) {
        if (0 === t.ancestor) {
            this.text += "$this";
            return;
        }
        this.text += "$parent";
        let e = t.ancestor - 1;
        while (e--) this.text += ".$parent";
    }
    visitAccessScope(t) {
        let e = t.ancestor;
        while (e--) this.text += "$parent.";
        this.text += t.name;
    }
    visitArrayLiteral(t) {
        const e = t.elements;
        this.text += "[";
        for (let t = 0, r = e.length; t < r; ++t) {
            if (0 !== t) this.text += ",";
            e[t].accept(this);
        }
        this.text += "]";
    }
    visitObjectLiteral(t) {
        const e = t.keys;
        const r = t.values;
        this.text += "{";
        for (let t = 0, s = e.length; t < s; ++t) {
            if (0 !== t) this.text += ",";
            this.text += `'${e[t]}':`;
            r[t].accept(this);
        }
        this.text += "}";
    }
    visitPrimitiveLiteral(t) {
        this.text += "(";
        if ("string" === typeof t.value) {
            const e = t.value.replace(/'/g, "\\'");
            this.text += `'${e}'`;
        } else this.text += `${t.value}`;
        this.text += ")";
    }
    visitCallFunction(t) {
        this.text += "(";
        t.func.accept(this);
        this.writeArgs(t.args);
        this.text += ")";
    }
    visitCallMember(t) {
        this.text += "(";
        t.object.accept(this);
        this.text += `.${t.name}`;
        this.writeArgs(t.args);
        this.text += ")";
    }
    visitCallScope(t) {
        this.text += "(";
        let e = t.ancestor;
        while (e--) this.text += "$parent.";
        this.text += t.name;
        this.writeArgs(t.args);
        this.text += ")";
    }
    visitTemplate(t) {
        const {cooked: e, expressions: r} = t;
        const s = r.length;
        this.text += "`";
        this.text += e[0];
        for (let t = 0; t < s; t++) {
            r[t].accept(this);
            this.text += e[t + 1];
        }
        this.text += "`";
    }
    visitTaggedTemplate(t) {
        const {cooked: e, expressions: r} = t;
        const s = r.length;
        t.func.accept(this);
        this.text += "`";
        this.text += e[0];
        for (let t = 0; t < s; t++) {
            r[t].accept(this);
            this.text += e[t + 1];
        }
        this.text += "`";
    }
    visitUnary(t) {
        this.text += `(${t.operation}`;
        if (t.operation.charCodeAt(0) >= 97) this.text += " ";
        t.expression.accept(this);
        this.text += ")";
    }
    visitBinary(t) {
        this.text += "(";
        t.left.accept(this);
        if (105 === t.operation.charCodeAt(0)) this.text += ` ${t.operation} `; else this.text += t.operation;
        t.right.accept(this);
        this.text += ")";
    }
    visitConditional(t) {
        this.text += "(";
        t.condition.accept(this);
        this.text += "?";
        t.yes.accept(this);
        this.text += ":";
        t.no.accept(this);
        this.text += ")";
    }
    visitAssign(t) {
        this.text += "(";
        t.target.accept(this);
        this.text += "=";
        t.value.accept(this);
        this.text += ")";
    }
    visitValueConverter(t) {
        const e = t.args;
        t.expression.accept(this);
        this.text += `|${t.name}`;
        for (let t = 0, r = e.length; t < r; ++t) {
            this.text += ":";
            e[t].accept(this);
        }
    }
    visitBindingBehavior(t) {
        const e = t.args;
        t.expression.accept(this);
        this.text += `&${t.name}`;
        for (let t = 0, r = e.length; t < r; ++t) {
            this.text += ":";
            e[t].accept(this);
        }
    }
    visitArrayBindingPattern(t) {
        const e = t.elements;
        this.text += "[";
        for (let t = 0, r = e.length; t < r; ++t) {
            if (0 !== t) this.text += ",";
            e[t].accept(this);
        }
        this.text += "]";
    }
    visitObjectBindingPattern(t) {
        const e = t.keys;
        const r = t.values;
        this.text += "{";
        for (let t = 0, s = e.length; t < s; ++t) {
            if (0 !== t) this.text += ",";
            this.text += `'${e[t]}':`;
            r[t].accept(this);
        }
        this.text += "}";
    }
    visitBindingIdentifier(t) {
        this.text += t.name;
    }
    visitHtmlLiteral(t) {
        throw new Error("visitHtmlLiteral");
    }
    visitForOfStatement(t) {
        t.declaration.accept(this);
        this.text += " of ";
        t.iterable.accept(this);
    }
    visitInterpolation(t) {
        const {parts: e, expressions: r} = t;
        const s = r.length;
        this.text += "${";
        this.text += e[0];
        for (let t = 0; t < s; t++) {
            r[t].accept(this);
            this.text += e[t + 1];
        }
        this.text += "}";
    }
    writeArgs(t) {
        this.text += "(";
        for (let e = 0, r = t.length; e < r; ++e) {
            if (0 !== e) this.text += ",";
            t[e].accept(this);
        }
        this.text += ")";
    }
}

class CustomExpression {
    constructor(t) {
        this.value = t;
    }
    evaluate(t, e, r, s) {
        return this.value;
    }
}

class BindingBehaviorExpression {
    constructor(t, e, r) {
        this.expression = t;
        this.name = e;
        this.args = r;
        this.behaviorKey = T.keyFrom(e);
    }
    get $kind() {
        return 38962;
    }
    get hasBind() {
        return true;
    }
    get hasUnbind() {
        return true;
    }
    evaluate(t, e, r, s) {
        return this.expression.evaluate(t, e, r, s);
    }
    assign(t, e, r, s) {
        return this.expression.assign(t, e, r, s);
    }
    bind(t, e, r) {
        if (this.expression.hasBind) this.expression.bind(t, e, r);
        const s = r.locator.get(this.behaviorKey);
        if (null == s) throw new Error(`AUR0101:${this.name}`);
        if (!(s instanceof BindingBehaviorFactory)) if (void 0 === r[this.behaviorKey]) {
            r[this.behaviorKey] = s;
            s.bind.call(s, t, e, r, ...this.args.map((s => s.evaluate(t, e, r.locator, null))));
        } else throw new Error(`AUR0102:${this.name}`);
    }
    unbind(t, e, r) {
        const s = this.behaviorKey;
        const i = r;
        if (void 0 !== i[s]) {
            if ("function" === typeof i[s].unbind) i[s].unbind(t, e, r);
            i[s] = void 0;
        }
        if (this.expression.hasUnbind) this.expression.unbind(t, e, r);
    }
    accept(t) {
        return t.visitBindingBehavior(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class ValueConverterExpression {
    constructor(t, e, r) {
        this.expression = t;
        this.name = e;
        this.args = r;
        this.converterKey = M.keyFrom(e);
    }
    get $kind() {
        return 36913;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return true;
    }
    evaluate(t, e, r, s) {
        const i = r.get(this.converterKey);
        if (null == i) throw new Error(`AUR0103:${this.name}`);
        if (null !== s && "handleChange" in s) {
            const t = i.signals;
            if (null != t) {
                const e = r.get(B);
                for (let r = 0, i = t.length; r < i; ++r) e.addSignalListener(t[r], s);
            }
        }
        if ("toView" in i) return i.toView(this.expression.evaluate(t, e, r, s), ...this.args.map((i => i.evaluate(t, e, r, s))));
        return this.expression.evaluate(t, e, r, s);
    }
    assign(t, e, r, s) {
        const i = r.get(this.converterKey);
        if (null == i) throw new Error(`AUR0104:${this.name}`);
        if ("fromView" in i) s = i.fromView(s, ...this.args.map((s => s.evaluate(t, e, r, null))));
        return this.expression.assign(t, e, r, s);
    }
    unbind(t, e, r) {
        const s = r.locator.get(this.converterKey);
        if (void 0 === s.signals) return;
        const i = r.locator.get(B);
        for (let t = 0; t < s.signals.length; ++t) i.removeSignalListener(s.signals[t], r);
    }
    accept(t) {
        return t.visitValueConverter(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class AssignExpression {
    constructor(t, e) {
        this.target = t;
        this.value = e;
    }
    get $kind() {
        return 8208;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return this.target.assign(t, e, r, this.value.evaluate(t, e, r, s));
    }
    assign(t, e, r, s) {
        this.value.assign(t, e, r, s);
        return this.target.assign(t, e, r, s);
    }
    accept(t) {
        return t.visitAssign(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class ConditionalExpression {
    constructor(t, e, r) {
        this.condition = t;
        this.yes = e;
        this.no = r;
    }
    get $kind() {
        return 63;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return this.condition.evaluate(t, e, r, s) ? this.yes.evaluate(t, e, r, s) : this.no.evaluate(t, e, r, s);
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitConditional(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class AccessThisExpression {
    constructor(t = 0) {
        this.ancestor = t;
    }
    get $kind() {
        return 1793;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        var i;
        let n = e.overrideContext;
        let o = e;
        let h = this.ancestor;
        while (h-- && n) {
            o = o.parentScope;
            n = null !== (i = null === o || void 0 === o ? void 0 : o.overrideContext) && void 0 !== i ? i : null;
        }
        return h < 1 && n ? n.bindingContext : void 0;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitAccessThis(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

AccessThisExpression.$this = new AccessThisExpression(0);

AccessThisExpression.$parent = new AccessThisExpression(1);

class AccessScopeExpression {
    constructor(t, e = 0) {
        this.name = t;
        this.ancestor = e;
    }
    get $kind() {
        return 10082;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = BindingContext.get(e, this.name, this.ancestor, t);
        if (null !== s) s.observe(i, this.name);
        const n = i[this.name];
        if (null == n && "$host" === this.name) throw new Error("AUR0105");
        if (1 & t) return n;
        return null == n ? "" : n;
    }
    assign(t, e, r, s) {
        var i;
        if ("$host" === this.name) throw new Error("AUR0106");
        const n = BindingContext.get(e, this.name, this.ancestor, t);
        if (n instanceof Object) if (void 0 !== (null === (i = n.$observers) || void 0 === i ? void 0 : i[this.name])) {
            n.$observers[this.name].setValue(s, t);
            return s;
        } else return n[this.name] = s;
        return;
    }
    accept(t) {
        return t.visitAccessScope(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class AccessMemberExpression {
    constructor(t, e) {
        this.object = t;
        this.name = e;
    }
    get $kind() {
        return 9323;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = this.object.evaluate(t, e, r, (128 & t) > 0 ? null : s);
        if (1 & t) {
            if (null == i) return i;
            if (null !== s) s.observe(i, this.name);
            return i[this.name];
        }
        if (null !== s && i instanceof Object) s.observe(i, this.name);
        return i ? i[this.name] : "";
    }
    assign(t, e, r, s) {
        const i = this.object.evaluate(t, e, r, null);
        if (i instanceof Object) if (void 0 !== i.$observers && void 0 !== i.$observers[this.name]) i.$observers[this.name].setValue(s, t); else i[this.name] = s; else this.object.assign(t, e, r, {
            [this.name]: s
        });
        return s;
    }
    accept(t) {
        return t.visitAccessMember(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class AccessKeyedExpression {
    constructor(t, e) {
        this.object = t;
        this.key = e;
    }
    get $kind() {
        return 9324;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = this.object.evaluate(t, e, r, (128 & t) > 0 ? null : s);
        if (i instanceof Object) {
            const n = this.key.evaluate(t, e, r, (128 & t) > 0 ? null : s);
            if (null !== s) s.observe(i, n);
            return i[n];
        }
        return;
    }
    assign(t, e, r, s) {
        const i = this.object.evaluate(t, e, r, null);
        const n = this.key.evaluate(t, e, r, null);
        return i[n] = s;
    }
    accept(t) {
        return t.visitAccessKeyed(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class CallScopeExpression {
    constructor(t, e, r = 0) {
        this.name = t;
        this.args = e;
        this.ancestor = r;
    }
    get $kind() {
        return 1448;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = this.args.map((i => i.evaluate(t, e, r, s)));
        const n = BindingContext.get(e, this.name, this.ancestor, t);
        const o = D(t, n, this.name);
        if (o) return o.apply(n, i);
        return;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitCallScope(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class CallMemberExpression {
    constructor(t, e, r) {
        this.object = t;
        this.name = e;
        this.args = r;
    }
    get $kind() {
        return 1161;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = this.object.evaluate(t, e, r, (128 & t) > 0 ? null : s);
        const n = this.args.map((i => i.evaluate(t, e, r, s)));
        const o = D(t, i, this.name);
        if (o) return o.apply(i, n);
        return;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitCallMember(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class CallFunctionExpression {
    constructor(t, e) {
        this.func = t;
        this.args = e;
    }
    get $kind() {
        return 1162;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = this.func.evaluate(t, e, r, s);
        if ("function" === typeof i) return i(...this.args.map((i => i.evaluate(t, e, r, s))));
        if (!(8 & t) && null == i) return;
        throw new Error("AUR0107");
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitCallFunction(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class BinaryExpression {
    constructor(t, e, r) {
        this.operation = t;
        this.left = e;
        this.right = r;
    }
    get $kind() {
        return 46;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        switch (this.operation) {
          case "&&":
            return this.left.evaluate(t, e, r, s) && this.right.evaluate(t, e, r, s);

          case "||":
            return this.left.evaluate(t, e, r, s) || this.right.evaluate(t, e, r, s);

          case "==":
            return this.left.evaluate(t, e, r, s) == this.right.evaluate(t, e, r, s);

          case "===":
            return this.left.evaluate(t, e, r, s) === this.right.evaluate(t, e, r, s);

          case "!=":
            return this.left.evaluate(t, e, r, s) != this.right.evaluate(t, e, r, s);

          case "!==":
            return this.left.evaluate(t, e, r, s) !== this.right.evaluate(t, e, r, s);

          case "instanceof":
            {
                const i = this.right.evaluate(t, e, r, s);
                if ("function" === typeof i) return this.left.evaluate(t, e, r, s) instanceof i;
                return false;
            }

          case "in":
            {
                const i = this.right.evaluate(t, e, r, s);
                if (i instanceof Object) return this.left.evaluate(t, e, r, s) in i;
                return false;
            }

          case "+":
            {
                const i = this.left.evaluate(t, e, r, s);
                const n = this.right.evaluate(t, e, r, s);
                if ((1 & t) > 0) return i + n;
                if (!i || !n) {
                    if (h(i) || h(n)) return (i || 0) + (n || 0);
                    if (u(i) || u(n)) return (i || "") + (n || "");
                }
                return i + n;
            }

          case "-":
            return this.left.evaluate(t, e, r, s) - this.right.evaluate(t, e, r, s);

          case "*":
            return this.left.evaluate(t, e, r, s) * this.right.evaluate(t, e, r, s);

          case "/":
            return this.left.evaluate(t, e, r, s) / this.right.evaluate(t, e, r, s);

          case "%":
            return this.left.evaluate(t, e, r, s) % this.right.evaluate(t, e, r, s);

          case "<":
            return this.left.evaluate(t, e, r, s) < this.right.evaluate(t, e, r, s);

          case ">":
            return this.left.evaluate(t, e, r, s) > this.right.evaluate(t, e, r, s);

          case "<=":
            return this.left.evaluate(t, e, r, s) <= this.right.evaluate(t, e, r, s);

          case ">=":
            return this.left.evaluate(t, e, r, s) >= this.right.evaluate(t, e, r, s);

          default:
            throw new Error(`AUR0108:${this.operation}`);
        }
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitBinary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class UnaryExpression {
    constructor(t, e) {
        this.operation = t;
        this.expression = e;
    }
    get $kind() {
        return 39;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        switch (this.operation) {
          case "void":
            return void this.expression.evaluate(t, e, r, s);

          case "typeof":
            return typeof this.expression.evaluate(1 | t, e, r, s);

          case "!":
            return !this.expression.evaluate(t, e, r, s);

          case "-":
            return -this.expression.evaluate(t, e, r, s);

          case "+":
            return +this.expression.evaluate(t, e, r, s);

          default:
            throw new Error(`AUR0109:${this.operation}`);
        }
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitUnary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class PrimitiveLiteralExpression {
    constructor(t) {
        this.value = t;
    }
    get $kind() {
        return 17925;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return this.value;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitPrimitiveLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);

PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);

PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);

PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);

PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression("");

class HtmlLiteralExpression {
    constructor(t) {
        this.parts = t;
    }
    get $kind() {
        return 51;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        let i = "";
        for (let n = 0; n < this.parts.length; ++n) {
            const o = this.parts[n].evaluate(t, e, r, s);
            if (null == o) continue;
            i += o;
        }
        return i;
    }
    assign(t, e, r, s, i) {
        return;
    }
    accept(t) {
        return t.visitHtmlLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class ArrayLiteralExpression {
    constructor(t) {
        this.elements = t;
    }
    get $kind() {
        return 17955;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return this.elements.map((i => i.evaluate(t, e, r, s)));
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitArrayLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

ArrayLiteralExpression.$empty = new ArrayLiteralExpression(c);

class ObjectLiteralExpression {
    constructor(t, e) {
        this.keys = t;
        this.values = e;
    }
    get $kind() {
        return 17956;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = {};
        for (let n = 0; n < this.keys.length; ++n) i[this.keys[n]] = this.values[n].evaluate(t, e, r, s);
        return i;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitObjectLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

ObjectLiteralExpression.$empty = new ObjectLiteralExpression(c, c);

class TemplateExpression {
    constructor(t, e = c) {
        this.cooked = t;
        this.expressions = e;
    }
    get $kind() {
        return 17958;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        let i = this.cooked[0];
        for (let n = 0; n < this.expressions.length; ++n) {
            i += String(this.expressions[n].evaluate(t, e, r, s));
            i += this.cooked[n + 1];
        }
        return i;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

TemplateExpression.$empty = new TemplateExpression([ "" ]);

class TaggedTemplateExpression {
    constructor(t, e, r, s = c) {
        this.cooked = t;
        this.func = r;
        this.expressions = s;
        t.raw = e;
    }
    get $kind() {
        return 1197;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        const i = this.expressions.map((i => i.evaluate(t, e, r, s)));
        const n = this.func.evaluate(t, e, r, s);
        if ("function" !== typeof n) throw new Error(`AUR0110`);
        return n(this.cooked, ...i);
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitTaggedTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class ArrayBindingPattern {
    constructor(t) {
        this.elements = t;
    }
    get $kind() {
        return 65556;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitArrayBindingPattern(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class ObjectBindingPattern {
    constructor(t, e) {
        this.keys = t;
        this.values = e;
    }
    get $kind() {
        return 65557;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitObjectBindingPattern(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class BindingIdentifier {
    constructor(t) {
        this.name = t;
    }
    get $kind() {
        return 65558;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return this.name;
    }
    accept(t) {
        return t.visitBindingIdentifier(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

const V = Object.prototype.toString;

class ForOfStatement {
    constructor(t, e) {
        this.declaration = t;
        this.iterable = e;
    }
    get $kind() {
        return 6199;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        return this.iterable.evaluate(t, e, r, s);
    }
    assign(t, e, r, s) {
        return;
    }
    count(t, e) {
        switch (V.call(e)) {
          case "[object Array]":
            return e.length;

          case "[object Map]":
            return e.size;

          case "[object Set]":
            return e.size;

          case "[object Number]":
            return e;

          case "[object Null]":
            return 0;

          case "[object Undefined]":
            return 0;

          default:
            throw new Error(`Cannot count ${V.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (V.call(e)) {
          case "[object Array]":
            return N(e, r);

          case "[object Map]":
            return K(e, r);

          case "[object Set]":
            return q(e, r);

          case "[object Number]":
            return H(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${V.call(e)}`);
        }
    }
    bind(t, e, r) {
        if (this.iterable.hasBind) this.iterable.bind(t, e, r);
    }
    unbind(t, e, r) {
        if (this.iterable.hasUnbind) this.iterable.unbind(t, e, r);
    }
    accept(t) {
        return t.visitForOfStatement(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class Interpolation {
    constructor(t, e = c) {
        this.parts = t;
        this.expressions = e;
        this.isMulti = e.length > 1;
        this.firstExpression = e[0];
    }
    get $kind() {
        return 24;
    }
    get hasBind() {
        return false;
    }
    get hasUnbind() {
        return false;
    }
    evaluate(t, e, r, s) {
        if (this.isMulti) {
            let i = this.parts[0];
            for (let n = 0; n < this.expressions.length; ++n) {
                i += String(this.expressions[n].evaluate(t, e, r, s));
                i += this.parts[n + 1];
            }
            return i;
        } else return `${this.parts[0]}${this.firstExpression.evaluate(t, e, r, s)}${this.parts[1]}`;
    }
    assign(t, e, r, s) {
        return;
    }
    accept(t) {
        return t.visitInterpolation(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

function D(t, e, r) {
    const s = null == e ? null : e[r];
    if ("function" === typeof s) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`AUR0111:${r}`);
}

function N(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function K(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    N(r, e);
}

function q(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    N(r, e);
}

function H(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    N(r, e);
}

var Q;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(Q || (Q = {}));

var _;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["persistentBindingFlags"] = 961] = "persistentBindingFlags";
    t[t["allowParentScopeTraversal"] = 64] = "allowParentScopeTraversal";
    t[t["observeLeafPropertiesOnly"] = 128] = "observeLeafPropertiesOnly";
    t[t["targetObserverFlags"] = 769] = "targetObserverFlags";
    t[t["noFlush"] = 256] = "noFlush";
    t[t["persistentTargetObserverQueue"] = 512] = "persistentTargetObserverQueue";
    t[t["bindingStrategy"] = 1] = "bindingStrategy";
    t[t["isStrictBindingStrategy"] = 1] = "isStrictBindingStrategy";
    t[t["fromBind"] = 2] = "fromBind";
    t[t["fromUnbind"] = 4] = "fromUnbind";
    t[t["mustEvaluate"] = 8] = "mustEvaluate";
    t[t["isTraversingParentScope"] = 16] = "isTraversingParentScope";
    t[t["dispose"] = 32] = "dispose";
})(_ || (_ = {}));

var z;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(z || (z = {}));

var W;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(W || (W = {}));

var G;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(G || (G = {}));

var Z;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(Z || (Z = {}));

function J(t, e) {
    const {length: r} = t;
    const s = Array(r);
    let i = 0;
    while (i < r) {
        s[i] = t[i];
        ++i;
    }
    if (void 0 !== e) s.deletedItems = e.slice(0); else if (void 0 !== t.deletedItems) s.deletedItems = t.deletedItems.slice(0); else s.deletedItems = [];
    s.isIndexMap = true;
    return s;
}

function X(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function Y(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function tt(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function et(t) {
    return null == t ? rt : rt(t);
}

function rt(t) {
    const e = t.prototype;
    v(e, "subs", {
        get: st
    });
    b(e, "subscribe", it);
    b(e, "unsubscribe", nt);
}

class SubscriberRecord {
    constructor() {
        this.sf = 0;
        this.count = 0;
    }
    add(t) {
        if (this.has(t)) return false;
        const e = this.sf;
        if (0 === (1 & e)) {
            this.s0 = t;
            this.sf |= 1;
        } else if (0 === (2 & e)) {
            this.s1 = t;
            this.sf |= 2;
        } else if (0 === (4 & e)) {
            this.s2 = t;
            this.sf |= 4;
        } else if (0 === (8 & e)) {
            this.sr = [ t ];
            this.sf |= 8;
        } else this.sr.push(t);
        ++this.count;
        return true;
    }
    has(t) {
        const e = this.sf;
        if ((1 & e) > 0 && this.s0 === t) return true;
        if ((2 & e) > 0 && this.s1 === t) return true;
        if ((4 & e) > 0 && this.s2 === t) return true;
        if ((8 & e) > 0) {
            const e = this.sr;
            const r = e.length;
            let s = 0;
            for (;s < r; ++s) if (e[s] === t) return true;
        }
        return false;
    }
    any() {
        return 0 !== this.sf;
    }
    remove(t) {
        const e = this.sf;
        if ((1 & e) > 0 && this.s0 === t) {
            this.s0 = void 0;
            this.sf = 1 ^ (1 | this.sf);
            --this.count;
            return true;
        } else if ((2 & e) > 0 && this.s1 === t) {
            this.s1 = void 0;
            this.sf = 2 ^ (2 | this.sf);
            --this.count;
            return true;
        } else if ((4 & e) > 0 && this.s2 === t) {
            this.s2 = void 0;
            this.sf = 4 ^ (4 | this.sf);
            --this.count;
            return true;
        } else if ((8 & e) > 0) {
            const e = this.sr;
            const r = e.length;
            let s = 0;
            for (;s < r; ++s) if (e[s] === t) {
                e.splice(s, 1);
                if (1 === r) this.sf = 8 ^ (8 | this.sf);
                --this.count;
                return true;
            }
        }
        return false;
    }
    notify(t, e, r) {
        const s = this.s0;
        const i = this.s1;
        const n = this.s2;
        let o = this.sr;
        if (void 0 !== o) o = o.slice();
        if (void 0 !== s) s.handleChange(t, e, r);
        if (void 0 !== i) i.handleChange(t, e, r);
        if (void 0 !== n) n.handleChange(t, e, r);
        if (void 0 !== o) {
            const s = o.length;
            let i;
            let n = 0;
            for (;n < s; ++n) {
                i = o[n];
                if (void 0 !== i) i.handleChange(t, e, r);
            }
        }
    }
    notifyCollection(t, e) {
        const r = this.s0;
        const s = this.s1;
        const i = this.s2;
        let n = this.sr;
        if (void 0 !== n) n = n.slice();
        if (void 0 !== r) r.handleCollectionChange(t, e);
        if (void 0 !== s) s.handleCollectionChange(t, e);
        if (void 0 !== i) i.handleCollectionChange(t, e);
        if (void 0 !== n) {
            const r = n.length;
            let s;
            let i = 0;
            for (;i < r; ++i) {
                s = n[i];
                if (void 0 !== s) s.handleCollectionChange(t, e);
            }
        }
    }
}

function st() {
    return g(this, "subs", new SubscriberRecord);
}

function it(t) {
    return this.subs.add(t);
}

function nt(t) {
    return this.subs.remove(t);
}

function ot(t) {
    return null == t ? ht : ht(t);
}

function ht(t) {
    const e = t.prototype;
    v(e, "queue", {
        get: ut
    });
}

class FlushQueue {
    constructor() {
        this.t = false;
        this.i = new Set;
    }
    get count() {
        return this.i.size;
    }
    add(t) {
        this.i.add(t);
        if (this.t) return;
        this.t = true;
        try {
            this.i.forEach(ct);
        } finally {
            this.t = false;
        }
    }
    clear() {
        this.i.clear();
        this.t = false;
    }
}

FlushQueue.instance = new FlushQueue;

function ut() {
    return FlushQueue.instance;
}

function ct(t, e, r) {
    r.delete(t);
    t.flush();
}

class CollectionLengthObserver {
    constructor(t) {
        this.owner = t;
        this.type = 18;
        this.f = 0;
        this.v = this.h = (this.o = t.collection).length;
    }
    getValue() {
        return this.o.length;
    }
    setValue(t, e) {
        const r = this.v;
        if (t !== r && a(t)) {
            if (0 === (256 & e)) this.o.length = t;
            this.v = t;
            this.h = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.o.length;
        if ((this.v = s) !== r) {
            this.h = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        dt = this.h;
        this.h = this.v;
        this.subs.notify(this.v, dt, this.f);
    }
}

class CollectionSizeObserver {
    constructor(t) {
        this.owner = t;
        this.f = 0;
        this.v = this.h = (this.o = t.collection).size;
        this.type = this.o instanceof Map ? 66 : 34;
    }
    getValue() {
        return this.o.size;
    }
    setValue() {
        throw new Error("AUR02");
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.o.size;
        if ((this.v = s) !== r) {
            this.h = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        dt = this.h;
        this.h = this.v;
        this.subs.notify(this.v, dt, this.f);
    }
}

function at(t) {
    const e = t.prototype;
    b(e, "subscribe", lt, true);
    b(e, "unsubscribe", ft, true);
    ot(t);
    et(t);
}

function lt(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function ft(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

at(CollectionLengthObserver);

at(CollectionSizeObserver);

let dt;

const vt = new WeakMap;

function pt(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function gt(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function bt(t, e, r, s, i) {
    let n, o, h, u, c;
    let a, l;
    for (a = r + 1; a < s; a++) {
        n = t[a];
        o = e[a];
        for (l = a - 1; l >= r; l--) {
            h = t[l];
            u = e[l];
            c = i(h, n);
            if (c > 0) {
                t[l + 1] = h;
                e[l + 1] = u;
            } else break;
        }
        t[l + 1] = n;
        e[l + 1] = o;
    }
}

function wt(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, u, c;
    let a, l, f;
    let d, v, p;
    let g, b;
    let w, E, y, A;
    let m, U, O, S;
    while (true) {
        if (s - r <= 10) {
            bt(t, e, r, s, i);
            return;
        }
        n = r + (s - r >> 1);
        h = t[r];
        a = e[r];
        u = t[s - 1];
        l = e[s - 1];
        c = t[n];
        f = e[n];
        d = i(h, u);
        if (d > 0) {
            g = h;
            b = a;
            h = u;
            a = l;
            u = g;
            l = b;
        }
        v = i(h, c);
        if (v >= 0) {
            g = h;
            b = a;
            h = c;
            a = f;
            c = u;
            f = l;
            u = g;
            l = b;
        } else {
            p = i(u, c);
            if (p > 0) {
                g = u;
                b = l;
                u = c;
                l = f;
                c = g;
                f = b;
            }
        }
        t[r] = h;
        e[r] = a;
        t[s - 1] = c;
        e[s - 1] = f;
        w = u;
        E = l;
        y = r + 1;
        A = s - 1;
        t[n] = t[y];
        e[n] = e[y];
        t[y] = w;
        e[y] = E;
        t: for (o = y + 1; o < A; o++) {
            m = t[o];
            U = e[o];
            O = i(m, w);
            if (O < 0) {
                t[o] = t[y];
                e[o] = e[y];
                t[y] = m;
                e[y] = U;
                y++;
            } else if (O > 0) {
                do {
                    A--;
                    if (A == o) break t;
                    S = t[A];
                    O = i(S, w);
                } while (O > 0);
                t[o] = t[A];
                e[o] = e[A];
                t[A] = m;
                e[A] = U;
                if (O < 0) {
                    m = t[o];
                    U = e[o];
                    t[o] = t[y];
                    e[o] = e[y];
                    t[y] = m;
                    e[y] = U;
                    y++;
                }
            }
        }
        if (s - A < y - r) {
            wt(t, e, A, s, i);
            s = y;
        } else {
            wt(t, e, r, y, i);
            r = A;
        }
    }
}

const Et = Array.prototype;

const yt = Et.push;

const At = Et.unshift;

const mt = Et.pop;

const Ut = Et.shift;

const Ot = Et.splice;

const St = Et.reverse;

const xt = Et.sort;

const Ct = {
    push: yt,
    unshift: At,
    pop: mt,
    shift: Ut,
    splice: Ot,
    reverse: St,
    sort: xt
};

const Bt = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const kt = {
    push: function(...t) {
        const e = vt.get(this);
        if (void 0 === e) return yt.apply(this, t);
        const r = this.length;
        const s = t.length;
        if (0 === s) return r;
        this.length = e.indexMap.length = r + s;
        let i = r;
        while (i < this.length) {
            this[i] = t[i - r];
            e.indexMap[i] = -2;
            i++;
        }
        e.notify();
        return this.length;
    },
    unshift: function(...t) {
        const e = vt.get(this);
        if (void 0 === e) return At.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        At.apply(e.indexMap, s);
        const n = At.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = vt.get(this);
        if (void 0 === t) return mt.call(this);
        const e = t.indexMap;
        const r = mt.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        mt.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = vt.get(this);
        if (void 0 === t) return Ut.call(this);
        const e = t.indexMap;
        const r = Ut.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        Ut.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = vt.get(this);
        if (void 0 === s) return Ot.apply(this, t);
        const i = this.length;
        const n = 0 | e;
        const o = n < 0 ? Math.max(i + n, 0) : Math.min(n, i);
        const h = s.indexMap;
        const u = t.length;
        const c = 0 === u ? 0 : 1 === u ? i - o : r;
        if (c > 0) {
            let t = o;
            const e = t + c;
            while (t < e) {
                if (h[t] > -1) h.deletedItems.push(h[t]);
                t++;
            }
        }
        if (u > 2) {
            const t = u - 2;
            const s = new Array(t);
            let i = 0;
            while (i < t) s[i++] = -2;
            Ot.call(h, e, r, ...s);
        } else Ot.apply(h, t);
        const a = Ot.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = vt.get(this);
        if (void 0 === t) {
            St.call(this);
            return this;
        }
        const e = this.length;
        const r = e / 2 | 0;
        let s = 0;
        while (s !== r) {
            const r = e - s - 1;
            const i = this[s];
            const n = t.indexMap[s];
            const o = this[r];
            const h = t.indexMap[r];
            this[s] = o;
            t.indexMap[s] = h;
            this[r] = i;
            t.indexMap[r] = n;
            s++;
        }
        t.notify();
        return this;
    },
    sort: function(t) {
        const e = vt.get(this);
        if (void 0 === e) {
            xt.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        wt(this, e.indexMap, 0, r, gt);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || "function" !== typeof t) t = pt;
        wt(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of Bt) v(kt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Lt = false;

function $t() {
    for (const t of Bt) if (true !== Et[t].observing) g(Et, t, kt[t]);
}

function Pt() {
    for (const t of Bt) if (true === Et[t].observing) g(Et, t, Ct[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!Lt) {
            Lt = true;
            $t();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = X(t.length);
        this.lenObs = void 0;
        vt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = X(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionLengthObserver(this);
    }
    getIndexObserver(t) {
        var e;
        var r;
        return null !== (e = (r = this.indexObservers)[t]) && void 0 !== e ? e : r[t] = new ArrayIndexObserver(this, t);
    }
}

class ArrayIndexObserver {
    constructor(t, e) {
        this.owner = t;
        this.index = e;
        this.doNotCache = true;
        this.value = this.getValue();
    }
    getValue() {
        return this.owner.collection[this.index];
    }
    setValue(t, e) {
        if (t === this.getValue()) return;
        const r = this.owner;
        const s = this.index;
        const i = r.indexMap;
        if (i[s] > -1) i.deletedItems.push(i[s]);
        i[s] = -2;
        r.collection[s] = t;
        r.notify();
    }
    handleCollectionChange(t, e) {
        const r = this.index;
        const s = t[r] === r;
        if (s) return;
        const i = this.value;
        const n = this.value = this.getValue();
        if (i !== n) this.subs.notify(n, i, e);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.owner.unsubscribe(this);
    }
}

et(ArrayObserver);

et(ArrayIndexObserver);

function Tt(t) {
    let e = vt.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function Rt(t) {
    let e = 0;
    let r = 0;
    const s = t.length;
    for (let i = 0; i < s; ++i) {
        while (t.deletedItems[r] <= i - e) {
            ++r;
            --e;
        }
        if (-2 === t[i]) ++e; else t[i] += e;
    }
}

function jt(t, e) {
    const r = t.slice();
    const s = e.length;
    let i = 0;
    let n = 0;
    while (i < s) {
        n = e[i];
        if (-2 !== n) t[i] = r[n];
        ++i;
    }
}

const It = new WeakMap;

const Mt = Set.prototype;

const Ft = Mt.add;

const Vt = Mt.clear;

const Dt = Mt.delete;

const Nt = {
    add: Ft,
    clear: Vt,
    delete: Dt
};

const Kt = [ "add", "clear", "delete" ];

const qt = {
    add: function(t) {
        const e = It.get(this);
        if (void 0 === e) {
            Ft.call(this, t);
            return this;
        }
        const r = this.size;
        Ft.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = It.get(this);
        if (void 0 === t) return Vt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Vt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = It.get(this);
        if (void 0 === e) return Dt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Dt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const Ht = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Kt) v(qt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Qt = false;

function _t() {
    for (const t of Kt) if (true !== Mt[t].observing) v(Mt, t, {
        ...Ht,
        value: qt[t]
    });
}

function zt() {
    for (const t of Kt) if (true === Mt[t].observing) v(Mt, t, {
        ...Ht,
        value: Nt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Qt) {
            Qt = true;
            _t();
        }
        this.collection = t;
        this.indexMap = X(t.size);
        this.lenObs = void 0;
        It.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = X(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

et(SetObserver);

function Wt(t) {
    let e = It.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Gt = new WeakMap;

const Zt = Map.prototype;

const Jt = Zt.set;

const Xt = Zt.clear;

const Yt = Zt.delete;

const te = {
    set: Jt,
    clear: Xt,
    delete: Yt
};

const ee = [ "set", "clear", "delete" ];

const re = {
    set: function(t, e) {
        const r = Gt.get(this);
        if (void 0 === r) {
            Jt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        Jt.call(this, t, e);
        const n = this.size;
        if (n === i) {
            let e = 0;
            for (const i of this.entries()) {
                if (i[0] === t) {
                    if (i[1] !== s) {
                        r.indexMap.deletedItems.push(r.indexMap[e]);
                        r.indexMap[e] = -2;
                        r.notify();
                    }
                    return this;
                }
                e++;
            }
            return this;
        }
        r.indexMap[i] = -2;
        r.notify();
        return this;
    },
    clear: function() {
        const t = Gt.get(this);
        if (void 0 === t) return Xt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Xt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Gt.get(this);
        if (void 0 === e) return Yt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Yt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const se = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of ee) v(re[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let ie = false;

function ne() {
    for (const t of ee) if (true !== Zt[t].observing) v(Zt, t, {
        ...se,
        value: re[t]
    });
}

function oe() {
    for (const t of ee) if (true === Zt[t].observing) v(Zt, t, {
        ...se,
        value: te[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!ie) {
            ie = true;
            ne();
        }
        this.collection = t;
        this.indexMap = X(t.size);
        this.lenObs = void 0;
        Gt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = X(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

et(MapObserver);

function he(t) {
    let e = Gt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function ue(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function ce() {
    return g(this, "obs", new BindingObserverRecord(this));
}

function ae(t) {
    let e;
    if (t instanceof Array) e = Tt(t); else if (t instanceof Set) e = Wt(t); else if (t instanceof Map) e = he(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function le(t) {
    this.obs.add(t);
}

function fe() {
    throw new Error(`AUR2011:handleChange`);
}

function de() {
    throw new Error("AUR2012:handleCollectionChange");
}

class BindingObserverRecord {
    constructor(t) {
        this.version = 0;
        this.count = 0;
        this.o = new Map;
        this.b = t;
    }
    handleChange(t, e, r) {
        return this.b.interceptor.handleChange(t, e, r);
    }
    handleCollectionChange(t, e) {
        this.b.interceptor.handleCollectionChange(t, e);
    }
    add(t) {
        if (!this.o.has(t)) {
            t.subscribe(this);
            ++this.count;
        }
        this.o.set(t, this.version);
    }
    clear() {
        this.o.forEach(pe, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(ve, this);
        this.o.clear();
        this.count = 0;
    }
}

function ve(t, e) {
    e.unsubscribe(this);
}

function pe(t, e) {
    if (this.version !== t) {
        e.unsubscribe(this);
        this.o.delete(e);
    }
}

function ge(t) {
    const e = t.prototype;
    b(e, "observe", ue, true);
    b(e, "observeCollection", ae, true);
    b(e, "subscribeTo", le, true);
    v(e, "obs", {
        get: ce
    });
    b(e, "handleChange", fe);
    b(e, "handleCollectionChange", de);
    return t;
}

function be(t) {
    return null == t ? ge : ge(t);
}

class BindingMediator {
    constructor(t, e, r, s) {
        this.key = t;
        this.binding = e;
        this.oL = r;
        this.locator = s;
        this.interceptor = this;
    }
    $bind() {
        throw new Error("AUR0213:$bind");
    }
    $unbind() {
        throw new Error("AUR0214:$unbind");
    }
    handleChange(t, e, r) {
        this.binding[this.key](t, e, r);
    }
}

ge(BindingMediator);

const we = s.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.u = w();
        this.l = w();
        this.A = w();
    }
    parse(t, e) {
        let r;
        switch (e) {
          case 16:
            return new CustomExpression(t);

          case 1:
            r = this.A[t];
            if (void 0 === r) r = this.A[t] = this.$parse(t, e);
            return r;

          case 2:
            r = this.l[t];
            if (void 0 === r) r = this.l[t] = this.$parse(t, e);
            return r;

          default:
            if (0 === t.length) {
                if ((e & (4 | 8)) > 0) return PrimitiveLiteralExpression.$empty;
                throw new Error("AUR0169");
            }
            r = this.u[t];
            if (void 0 === r) r = this.u[t] = this.$parse(t, e);
            return r;
        }
    }
    $parse(t, e) {
        $e.ip = t;
        $e.length = t.length;
        $e.index = 0;
        $e.U = t.charCodeAt(0);
        return Te($e, 0, 61, void 0 === e ? 8 : e);
    }
}

var Ee;

(function(t) {
    t[t["Null"] = 0] = "Null";
    t[t["Backspace"] = 8] = "Backspace";
    t[t["Tab"] = 9] = "Tab";
    t[t["LineFeed"] = 10] = "LineFeed";
    t[t["VerticalTab"] = 11] = "VerticalTab";
    t[t["FormFeed"] = 12] = "FormFeed";
    t[t["CarriageReturn"] = 13] = "CarriageReturn";
    t[t["Space"] = 32] = "Space";
    t[t["Exclamation"] = 33] = "Exclamation";
    t[t["DoubleQuote"] = 34] = "DoubleQuote";
    t[t["Dollar"] = 36] = "Dollar";
    t[t["Percent"] = 37] = "Percent";
    t[t["Ampersand"] = 38] = "Ampersand";
    t[t["SingleQuote"] = 39] = "SingleQuote";
    t[t["OpenParen"] = 40] = "OpenParen";
    t[t["CloseParen"] = 41] = "CloseParen";
    t[t["Asterisk"] = 42] = "Asterisk";
    t[t["Plus"] = 43] = "Plus";
    t[t["Comma"] = 44] = "Comma";
    t[t["Minus"] = 45] = "Minus";
    t[t["Dot"] = 46] = "Dot";
    t[t["Slash"] = 47] = "Slash";
    t[t["Semicolon"] = 59] = "Semicolon";
    t[t["Backtick"] = 96] = "Backtick";
    t[t["OpenBracket"] = 91] = "OpenBracket";
    t[t["Backslash"] = 92] = "Backslash";
    t[t["CloseBracket"] = 93] = "CloseBracket";
    t[t["Caret"] = 94] = "Caret";
    t[t["Underscore"] = 95] = "Underscore";
    t[t["OpenBrace"] = 123] = "OpenBrace";
    t[t["Bar"] = 124] = "Bar";
    t[t["CloseBrace"] = 125] = "CloseBrace";
    t[t["Colon"] = 58] = "Colon";
    t[t["LessThan"] = 60] = "LessThan";
    t[t["Equals"] = 61] = "Equals";
    t[t["GreaterThan"] = 62] = "GreaterThan";
    t[t["Question"] = 63] = "Question";
    t[t["Zero"] = 48] = "Zero";
    t[t["One"] = 49] = "One";
    t[t["Two"] = 50] = "Two";
    t[t["Three"] = 51] = "Three";
    t[t["Four"] = 52] = "Four";
    t[t["Five"] = 53] = "Five";
    t[t["Six"] = 54] = "Six";
    t[t["Seven"] = 55] = "Seven";
    t[t["Eight"] = 56] = "Eight";
    t[t["Nine"] = 57] = "Nine";
    t[t["UpperA"] = 65] = "UpperA";
    t[t["UpperB"] = 66] = "UpperB";
    t[t["UpperC"] = 67] = "UpperC";
    t[t["UpperD"] = 68] = "UpperD";
    t[t["UpperE"] = 69] = "UpperE";
    t[t["UpperF"] = 70] = "UpperF";
    t[t["UpperG"] = 71] = "UpperG";
    t[t["UpperH"] = 72] = "UpperH";
    t[t["UpperI"] = 73] = "UpperI";
    t[t["UpperJ"] = 74] = "UpperJ";
    t[t["UpperK"] = 75] = "UpperK";
    t[t["UpperL"] = 76] = "UpperL";
    t[t["UpperM"] = 77] = "UpperM";
    t[t["UpperN"] = 78] = "UpperN";
    t[t["UpperO"] = 79] = "UpperO";
    t[t["UpperP"] = 80] = "UpperP";
    t[t["UpperQ"] = 81] = "UpperQ";
    t[t["UpperR"] = 82] = "UpperR";
    t[t["UpperS"] = 83] = "UpperS";
    t[t["UpperT"] = 84] = "UpperT";
    t[t["UpperU"] = 85] = "UpperU";
    t[t["UpperV"] = 86] = "UpperV";
    t[t["UpperW"] = 87] = "UpperW";
    t[t["UpperX"] = 88] = "UpperX";
    t[t["UpperY"] = 89] = "UpperY";
    t[t["UpperZ"] = 90] = "UpperZ";
    t[t["LowerA"] = 97] = "LowerA";
    t[t["LowerB"] = 98] = "LowerB";
    t[t["LowerC"] = 99] = "LowerC";
    t[t["LowerD"] = 100] = "LowerD";
    t[t["LowerE"] = 101] = "LowerE";
    t[t["LowerF"] = 102] = "LowerF";
    t[t["LowerG"] = 103] = "LowerG";
    t[t["LowerH"] = 104] = "LowerH";
    t[t["LowerI"] = 105] = "LowerI";
    t[t["LowerJ"] = 106] = "LowerJ";
    t[t["LowerK"] = 107] = "LowerK";
    t[t["LowerL"] = 108] = "LowerL";
    t[t["LowerM"] = 109] = "LowerM";
    t[t["LowerN"] = 110] = "LowerN";
    t[t["LowerO"] = 111] = "LowerO";
    t[t["LowerP"] = 112] = "LowerP";
    t[t["LowerQ"] = 113] = "LowerQ";
    t[t["LowerR"] = 114] = "LowerR";
    t[t["LowerS"] = 115] = "LowerS";
    t[t["LowerT"] = 116] = "LowerT";
    t[t["LowerU"] = 117] = "LowerU";
    t[t["LowerV"] = 118] = "LowerV";
    t[t["LowerW"] = 119] = "LowerW";
    t[t["LowerX"] = 120] = "LowerX";
    t[t["LowerY"] = 121] = "LowerY";
    t[t["LowerZ"] = 122] = "LowerZ";
})(Ee || (Ee = {}));

function ye(t) {
    switch (t) {
      case 98:
        return 8;

      case 116:
        return 9;

      case 110:
        return 10;

      case 118:
        return 11;

      case 102:
        return 12;

      case 114:
        return 13;

      case 34:
        return 34;

      case 39:
        return 39;

      case 92:
        return 92;

      default:
        return t;
    }
}

var Ae;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(Ae || (Ae = {}));

var me;

(function(t) {
    t[t["Variadic"] = 61] = "Variadic";
    t[t["Assign"] = 62] = "Assign";
    t[t["Conditional"] = 63] = "Conditional";
    t[t["LogicalOR"] = 64] = "LogicalOR";
    t[t["LogicalAND"] = 128] = "LogicalAND";
    t[t["Equality"] = 192] = "Equality";
    t[t["Relational"] = 256] = "Relational";
    t[t["Additive"] = 320] = "Additive";
    t[t["Multiplicative"] = 384] = "Multiplicative";
    t[t["Binary"] = 448] = "Binary";
    t[t["LeftHandSide"] = 449] = "LeftHandSide";
    t[t["Primary"] = 450] = "Primary";
    t[t["Unary"] = 451] = "Unary";
})(me || (me = {}));

var Ue;

(function(t) {
    t[t["EOF"] = 1572864] = "EOF";
    t[t["ExpressionTerminal"] = 1048576] = "ExpressionTerminal";
    t[t["AccessScopeTerminal"] = 524288] = "AccessScopeTerminal";
    t[t["ClosingToken"] = 262144] = "ClosingToken";
    t[t["OpeningToken"] = 131072] = "OpeningToken";
    t[t["BinaryOp"] = 65536] = "BinaryOp";
    t[t["UnaryOp"] = 32768] = "UnaryOp";
    t[t["LeftHandSide"] = 16384] = "LeftHandSide";
    t[t["StringOrNumericLiteral"] = 12288] = "StringOrNumericLiteral";
    t[t["NumericLiteral"] = 8192] = "NumericLiteral";
    t[t["StringLiteral"] = 4096] = "StringLiteral";
    t[t["IdentifierName"] = 3072] = "IdentifierName";
    t[t["Keyword"] = 2048] = "Keyword";
    t[t["Identifier"] = 1024] = "Identifier";
    t[t["Contextual"] = 512] = "Contextual";
    t[t["Precedence"] = 448] = "Precedence";
    t[t["Type"] = 63] = "Type";
    t[t["FalseKeyword"] = 2048] = "FalseKeyword";
    t[t["TrueKeyword"] = 2049] = "TrueKeyword";
    t[t["NullKeyword"] = 2050] = "NullKeyword";
    t[t["UndefinedKeyword"] = 2051] = "UndefinedKeyword";
    t[t["ThisScope"] = 3076] = "ThisScope";
    t[t["ParentScope"] = 3078] = "ParentScope";
    t[t["OpenParen"] = 671751] = "OpenParen";
    t[t["OpenBrace"] = 131080] = "OpenBrace";
    t[t["Dot"] = 16393] = "Dot";
    t[t["CloseBrace"] = 1835018] = "CloseBrace";
    t[t["CloseParen"] = 1835019] = "CloseParen";
    t[t["Comma"] = 1572876] = "Comma";
    t[t["OpenBracket"] = 671757] = "OpenBracket";
    t[t["CloseBracket"] = 1835022] = "CloseBracket";
    t[t["Colon"] = 1572879] = "Colon";
    t[t["Question"] = 1572880] = "Question";
    t[t["Ampersand"] = 1572883] = "Ampersand";
    t[t["Bar"] = 1572884] = "Bar";
    t[t["BarBar"] = 1638549] = "BarBar";
    t[t["AmpersandAmpersand"] = 1638614] = "AmpersandAmpersand";
    t[t["EqualsEquals"] = 1638679] = "EqualsEquals";
    t[t["ExclamationEquals"] = 1638680] = "ExclamationEquals";
    t[t["EqualsEqualsEquals"] = 1638681] = "EqualsEqualsEquals";
    t[t["ExclamationEqualsEquals"] = 1638682] = "ExclamationEqualsEquals";
    t[t["LessThan"] = 1638747] = "LessThan";
    t[t["GreaterThan"] = 1638748] = "GreaterThan";
    t[t["LessThanEquals"] = 1638749] = "LessThanEquals";
    t[t["GreaterThanEquals"] = 1638750] = "GreaterThanEquals";
    t[t["InKeyword"] = 1640799] = "InKeyword";
    t[t["InstanceOfKeyword"] = 1640800] = "InstanceOfKeyword";
    t[t["Plus"] = 623009] = "Plus";
    t[t["Minus"] = 623010] = "Minus";
    t[t["TypeofKeyword"] = 34851] = "TypeofKeyword";
    t[t["VoidKeyword"] = 34852] = "VoidKeyword";
    t[t["Asterisk"] = 1638885] = "Asterisk";
    t[t["Percent"] = 1638886] = "Percent";
    t[t["Slash"] = 1638887] = "Slash";
    t[t["Equals"] = 1048616] = "Equals";
    t[t["Exclamation"] = 32809] = "Exclamation";
    t[t["TemplateTail"] = 540714] = "TemplateTail";
    t[t["TemplateContinuation"] = 540715] = "TemplateContinuation";
    t[t["OfKeyword"] = 1051180] = "OfKeyword";
})(Ue || (Ue = {}));

const Oe = PrimitiveLiteralExpression.$false;

const Se = PrimitiveLiteralExpression.$true;

const xe = PrimitiveLiteralExpression.$null;

const Ce = PrimitiveLiteralExpression.$undefined;

const Be = AccessThisExpression.$this;

const ke = AccessThisExpression.$parent;

var Le;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Interpolation"] = 1] = "Interpolation";
    t[t["IsIterator"] = 2] = "IsIterator";
    t[t["IsFunction"] = 4] = "IsFunction";
    t[t["IsProperty"] = 8] = "IsProperty";
    t[t["IsCustom"] = 16] = "IsCustom";
})(Le || (Le = {}));

class ParserState {
    constructor(t) {
        this.ip = t;
        this.index = 0;
        this.O = 0;
        this.C = 0;
        this.B = 1572864;
        this.L = "";
        this.$ = true;
        this.length = t.length;
        this.U = t.charCodeAt(0);
    }
    get P() {
        return this.ip.slice(this.O, this.index);
    }
}

const $e = new ParserState("");

function Pe(t, e) {
    $e.ip = t;
    $e.length = t.length;
    $e.index = 0;
    $e.U = t.charCodeAt(0);
    return Te($e, 0, 61, void 0 === e ? 8 : e);
}

function Te(t, e, r, s) {
    if (16 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (1 & s) return Me(t);
        Ve(t);
        if (1048576 & t.B) throw new Error(`AUR0151:${t.ip}`);
    }
    t.$ = 448 > r;
    let i;
    if (32768 & t.B) {
        const r = We[63 & t.B];
        Ve(t);
        i = new UnaryExpression(r, Te(t, e, 449, s));
        t.$ = false;
    } else {
        t: switch (t.B) {
          case 3078:
            t.$ = false;
            do {
                Ve(t);
                e++;
                if (_e(t, 16393)) {
                    if (16393 === t.B) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.B) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.B) {
                    const t = 511 & e;
                    i = 0 === t ? Be : 1 === t ? ke : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`AUR0154:${t.ip}`);
            } while (3078 === t.B);

          case 1024:
            if (2 & s) i = new BindingIdentifier(t.L); else {
                i = new AccessScopeExpression(t.L, 511 & e);
                e = 1024;
            }
            t.$ = true;
            Ve(t);
            break;

          case 3076:
            t.$ = false;
            Ve(t);
            i = Be;
            e = 512;
            break;

          case 671751:
            Ve(t);
            i = Te(t, 0, 62, s);
            ze(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = Re(t, e, s);
            e = 0;
            break;

          case 131080:
            i = Ie(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.L ]);
            t.$ = false;
            Ve(t);
            e = 0;
            break;

          case 540715:
            i = Fe(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.L);
            t.$ = false;
            Ve(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = We[63 & t.B];
            t.$ = false;
            Ve(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (2 & s) return je(t, i);
        if (449 < r) return i;
        let n = t.L;
        while ((16384 & t.B) > 0) {
            const r = [];
            let o;
            switch (t.B) {
              case 16393:
                t.$ = true;
                Ve(t);
                if (0 === (3072 & t.B)) throw new Error(`AUR0153:${t.ip}`);
                n = t.L;
                Ve(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.B) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.$ = true;
                Ve(t);
                e = 4096;
                i = new AccessKeyedExpression(i, Te(t, 0, 62, s));
                ze(t, 1835022);
                break;

              case 671751:
                t.$ = false;
                Ve(t);
                while (1835019 !== t.B) {
                    r.push(Te(t, 0, 62, s));
                    if (!_e(t, 1572876)) break;
                }
                ze(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.$ = false;
                o = [ t.L ];
                i = new TaggedTemplateExpression(o, o, i);
                Ve(t);
                break;

              case 540715:
                i = Fe(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.B) > 0) {
        const n = t.B;
        if ((448 & n) <= r) break;
        Ve(t);
        i = new BinaryExpression(We[63 & n], i, Te(t, e, 448 & n, s));
        t.$ = false;
    }
    if (63 < r) return i;
    if (_e(t, 1572880)) {
        const r = Te(t, e, 62, s);
        ze(t, 1572879);
        i = new ConditionalExpression(i, r, Te(t, e, 62, s));
        t.$ = false;
    }
    if (62 < r) return i;
    if (_e(t, 1048616)) {
        if (!t.$) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, Te(t, e, 62, s));
    }
    if (61 < r) return i;
    while (_e(t, 1572884)) {
        if (1572864 === t.B) throw new Error(`AUR0159:${t.ip}`);
        const r = t.L;
        Ve(t);
        const n = new Array;
        while (_e(t, 1572879)) n.push(Te(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (_e(t, 1572883)) {
        if (1572864 === t.B) throw new Error(`AUR0160:${t.ip}`);
        const r = t.L;
        Ve(t);
        const n = new Array;
        while (_e(t, 1572879)) n.push(Te(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.B) {
        if (1 & s) return i;
        if ("of" === t.P) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function Re(t, e, r) {
    Ve(t);
    const s = new Array;
    while (1835022 !== t.B) if (_e(t, 1572876)) {
        s.push(Ce);
        if (1835022 === t.B) break;
    } else {
        s.push(Te(t, e, 62, ~2 & r));
        if (_e(t, 1572876)) {
            if (1835022 === t.B) break;
        } else break;
    }
    ze(t, 1835022);
    if (2 & r) return new ArrayBindingPattern(s); else {
        t.$ = false;
        return new ArrayLiteralExpression(s);
    }
}

function je(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.B) throw new Error(`AUR0163:${t.ip}`);
    Ve(t);
    const r = e;
    const s = Te(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function Ie(t, e) {
    const r = new Array;
    const s = new Array;
    Ve(t);
    while (1835018 !== t.B) {
        r.push(t.L);
        if (12288 & t.B) {
            Ve(t);
            ze(t, 1572879);
            s.push(Te(t, 0, 62, ~2 & e));
        } else if (3072 & t.B) {
            const {U: r, B: i, index: n} = t;
            Ve(t);
            if (_e(t, 1572879)) s.push(Te(t, 0, 62, ~2 & e)); else {
                t.U = r;
                t.B = i;
                t.index = n;
                s.push(Te(t, 0, 450, ~2 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.B) ze(t, 1572876);
    }
    ze(t, 1835018);
    if (2 & e) return new ObjectBindingPattern(r, s); else {
        t.$ = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function Me(t) {
    const e = [];
    const r = [];
    const s = t.length;
    let i = "";
    while (t.index < s) {
        switch (t.U) {
          case 36:
            if (123 === t.ip.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.U = t.ip.charCodeAt(t.index);
                Ve(t);
                const s = Te(t, 0, 61, 1);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(ye(De(t)));
            break;

          default:
            i += String.fromCharCode(t.U);
        }
        De(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function Fe(t, e, r, s, i) {
    const n = [ t.L ];
    ze(t, 540715);
    const o = [ Te(t, e, 62, r) ];
    while (540714 !== (t.B = Qe(t))) {
        n.push(t.L);
        ze(t, 540715);
        o.push(Te(t, e, 62, r));
    }
    n.push(t.L);
    t.$ = false;
    if (i) {
        Ve(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        Ve(t);
        return new TemplateExpression(n, o);
    }
}

function Ve(t) {
    while (t.index < t.length) {
        t.O = t.index;
        if (null != (t.B = rr[t.U](t))) return;
    }
    t.B = 1572864;
}

function De(t) {
    return t.U = t.ip.charCodeAt(++t.index);
}

function Ne(t) {
    while (er[De(t)]) ;
    const e = Ge[t.L = t.P];
    return void 0 === e ? 1024 : e;
}

function Ke(t, e) {
    let r = t.U;
    if (false === e) {
        do {
            r = De(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.L = parseInt(t.P, 10);
            return 8192;
        }
        r = De(t);
        if (t.index >= t.length) {
            t.L = parseInt(t.P.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = De(t);
    } while (r <= 57 && r >= 48); else t.U = t.ip.charCodeAt(--t.index);
    t.L = parseFloat(t.P);
    return 8192;
}

function qe(t) {
    const e = t.U;
    De(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.U !== e) if (92 === t.U) {
        s.push(t.ip.slice(i, t.index));
        De(t);
        r = ye(t.U);
        De(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else De(t);
    const n = t.ip.slice(i, t.index);
    De(t);
    s.push(n);
    const o = s.join("");
    t.L = o;
    return 4096;
}

function He(t) {
    let e = true;
    let r = "";
    while (96 !== De(t)) if (36 === t.U) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.U) r += String.fromCharCode(ye(De(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.U);
    }
    De(t);
    t.L = r;
    if (e) return 540714;
    return 540715;
}

function Qe(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return He(t);
}

function _e(t, e) {
    if (t.B === e) {
        Ve(t);
        return true;
    }
    return false;
}

function ze(t, e) {
    if (t.B === e) Ve(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const We = [ Oe, Se, xe, Ce, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Ge = w();

Ge.true = 2049;

Ge.null = 2050;

Ge.false = 2048;

Ge.undefined = 2051;

Ge.$this = 3076;

Ge.$parent = 3078;

Ge.in = 1640799;

Ge.instanceof = 1640800;

Ge.typeof = 34851;

Ge.void = 34852;

Ge.of = 1051180;

const Ze = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Je(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function Xe(t) {
    return e => {
        De(e);
        return t;
    };
}

const Ye = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

Ye.notMapped = true;

const tr = new Set;

Je(null, tr, Ze.AsciiIdPart, true);

const er = new Uint8Array(65535);

Je(er, null, Ze.IdStart, 1);

Je(er, null, Ze.Digit, 1);

const rr = new Array(65535);

rr.fill(Ye, 0, 65535);

Je(rr, null, Ze.Skip, (t => {
    De(t);
    return null;
}));

Je(rr, null, Ze.IdStart, Ne);

Je(rr, null, Ze.Digit, (t => Ke(t, false)));

rr[34] = rr[39] = t => qe(t);

rr[96] = t => He(t);

rr[33] = t => {
    if (61 !== De(t)) return 32809;
    if (61 !== De(t)) return 1638680;
    De(t);
    return 1638682;
};

rr[61] = t => {
    if (61 !== De(t)) return 1048616;
    if (61 !== De(t)) return 1638679;
    De(t);
    return 1638681;
};

rr[38] = t => {
    if (38 !== De(t)) return 1572883;
    De(t);
    return 1638614;
};

rr[124] = t => {
    if (124 !== De(t)) return 1572884;
    De(t);
    return 1638549;
};

rr[46] = t => {
    if (De(t) <= 57 && t.U >= 48) return Ke(t, true);
    return 16393;
};

rr[60] = t => {
    if (61 !== De(t)) return 1638747;
    De(t);
    return 1638749;
};

rr[62] = t => {
    if (61 !== De(t)) return 1638748;
    De(t);
    return 1638750;
};

rr[37] = Xe(1638886);

rr[40] = Xe(671751);

rr[41] = Xe(1835019);

rr[42] = Xe(1638885);

rr[43] = Xe(623009);

rr[44] = Xe(1572876);

rr[45] = Xe(623010);

rr[47] = Xe(1638887);

rr[58] = Xe(1572879);

rr[63] = Xe(1572880);

rr[91] = Xe(671757);

rr[93] = Xe(1835022);

rr[123] = Xe(131080);

rr[125] = Xe(1835018);

let sr = null;

const ir = [];

let nr = false;

function or() {
    nr = false;
}

function hr() {
    nr = true;
}

function ur() {
    return sr;
}

function cr(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == sr) {
        sr = t;
        ir[0] = sr;
        nr = true;
        return;
    }
    if (sr === t) throw new Error("AUR0207");
    ir.push(sr);
    sr = t;
    nr = true;
}

function ar(t) {
    if (null == t) throw new Error("AUR0208");
    if (sr !== t) throw new Error("AUR0209");
    ir.pop();
    sr = ir.length > 0 ? ir[ir.length - 1] : null;
    nr = null != sr;
}

const lr = Object.freeze({
    get current() {
        return sr;
    },
    get connecting() {
        return nr;
    },
    enter: cr,
    exit: ar,
    pause: or,
    resume: hr
});

const fr = Reflect.get;

const dr = Object.prototype.toString;

const vr = new WeakMap;

function pr(t) {
    switch (dr.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const gr = "__raw__";

function br(t) {
    return pr(t) ? wr(t) : t;
}

function wr(t) {
    var e;
    return null !== (e = vr.get(t)) && void 0 !== e ? e : mr(t);
}

function Er(t) {
    var e;
    return null !== (e = t[gr]) && void 0 !== e ? e : t;
}

function yr(t) {
    return pr(t) && t[gr] || t;
}

function Ar(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function mr(t) {
    const e = t instanceof Array ? Or : t instanceof Map || t instanceof Set ? zr : Ur;
    const r = new Proxy(t, e);
    vr.set(t, r);
    return r;
}

const Ur = {
    get(t, e, r) {
        if (e === gr) return t;
        const s = ur();
        if (!nr || Ar(e) || null == s) return fr(t, e, r);
        s.observe(t, e);
        return br(fr(t, e, r));
    }
};

const Or = {
    get(t, e, r) {
        if (e === gr) return t;
        const s = ur();
        if (!nr || Ar(e) || null == s) return fr(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return Sr;

          case "includes":
            return Br;

          case "indexOf":
            return kr;

          case "lastIndexOf":
            return Lr;

          case "every":
            return xr;

          case "filter":
            return Cr;

          case "find":
            return Pr;

          case "findIndex":
            return $r;

          case "flat":
            return Tr;

          case "flatMap":
            return Rr;

          case "join":
            return jr;

          case "push":
            return Mr;

          case "pop":
            return Ir;

          case "reduce":
            return Qr;

          case "reduceRight":
            return _r;

          case "reverse":
            return Nr;

          case "shift":
            return Fr;

          case "unshift":
            return Vr;

          case "slice":
            return Hr;

          case "splice":
            return Dr;

          case "some":
            return Kr;

          case "sort":
            return qr;

          case "keys":
            return es;

          case "values":
          case Symbol.iterator:
            return rs;

          case "entries":
            return ss;
        }
        s.observe(t, e);
        return br(fr(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = ur()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function Sr(t, e) {
    var r;
    const s = Er(this);
    const i = s.map(((r, s) => yr(t.call(e, br(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return br(i);
}

function xr(t, e) {
    var r;
    const s = Er(this);
    const i = s.every(((r, s) => t.call(e, br(r), s, this)));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Cr(t, e) {
    var r;
    const s = Er(this);
    const i = s.filter(((r, s) => yr(t.call(e, br(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return br(i);
}

function Br(t) {
    var e;
    const r = Er(this);
    const s = r.includes(yr(t));
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function kr(t) {
    var e;
    const r = Er(this);
    const s = r.indexOf(yr(t));
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Lr(t) {
    var e;
    const r = Er(this);
    const s = r.lastIndexOf(yr(t));
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function $r(t, e) {
    var r;
    const s = Er(this);
    const i = s.findIndex(((r, s) => yr(t.call(e, br(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Pr(t, e) {
    var r;
    const s = Er(this);
    const i = s.find(((e, r) => t(br(e), r, this)), e);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return br(i);
}

function Tr() {
    var t;
    const e = Er(this);
    null === (t = ur()) || void 0 === t ? void 0 : t.observeCollection(e);
    return br(e.flat());
}

function Rr(t, e) {
    var r;
    const s = Er(this);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return wr(s.flatMap(((r, s) => br(t.call(e, br(r), s, this)))));
}

function jr(t) {
    var e;
    const r = Er(this);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function Ir() {
    return br(Er(this).pop());
}

function Mr(...t) {
    return Er(this).push(...t);
}

function Fr() {
    return br(Er(this).shift());
}

function Vr(...t) {
    return Er(this).unshift(...t);
}

function Dr(...t) {
    return br(Er(this).splice(...t));
}

function Nr(...t) {
    var e;
    const r = Er(this);
    const s = r.reverse();
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return br(s);
}

function Kr(t, e) {
    var r;
    const s = Er(this);
    const i = s.some(((r, s) => yr(t.call(e, br(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function qr(t) {
    var e;
    const r = Er(this);
    const s = r.sort(t);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return br(s);
}

function Hr(t, e) {
    var r;
    const s = Er(this);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return wr(s.slice(t, e));
}

function Qr(t, e) {
    var r;
    const s = Er(this);
    const i = s.reduce(((e, r, s) => t(e, br(r), s, this)), e);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return br(i);
}

function _r(t, e) {
    var r;
    const s = Er(this);
    const i = s.reduceRight(((e, r, s) => t(e, br(r), s, this)), e);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return br(i);
}

const zr = {
    get(t, e, r) {
        if (e === gr) return t;
        const s = ur();
        if (!nr || Ar(e) || null == s) return fr(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return Yr;

          case "delete":
            return ts;

          case "forEach":
            return Wr;

          case "add":
            if (t instanceof Set) return Xr;
            break;

          case "get":
            if (t instanceof Map) return Zr;
            break;

          case "set":
            if (t instanceof Map) return Jr;
            break;

          case "has":
            return Gr;

          case "keys":
            return es;

          case "values":
            return rs;

          case "entries":
            return ss;

          case Symbol.iterator:
            return t instanceof Map ? ss : rs;
        }
        return br(fr(t, e, r));
    }
};

function Wr(t, e) {
    var r;
    const s = Er(this);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, br(r), br(s), this);
    }));
}

function Gr(t) {
    var e;
    const r = Er(this);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(yr(t));
}

function Zr(t) {
    var e;
    const r = Er(this);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return br(r.get(yr(t)));
}

function Jr(t, e) {
    return br(Er(this).set(yr(t), yr(e)));
}

function Xr(t) {
    return br(Er(this).add(yr(t)));
}

function Yr() {
    return br(Er(this).clear());
}

function ts(t) {
    return br(Er(this).delete(yr(t)));
}

function es() {
    var t;
    const e = Er(this);
    null === (t = ur()) || void 0 === t ? void 0 : t.observeCollection(e);
    const r = e.keys();
    return {
        next() {
            const t = r.next();
            const e = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: br(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function rs() {
    var t;
    const e = Er(this);
    null === (t = ur()) || void 0 === t ? void 0 : t.observeCollection(e);
    const r = e.values();
    return {
        next() {
            const t = r.next();
            const e = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: br(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function ss() {
    var t;
    const e = Er(this);
    null === (t = ur()) || void 0 === t ? void 0 : t.observeCollection(e);
    const r = e.entries();
    return {
        next() {
            const t = r.next();
            const e = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: [ br(e[0]), br(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const is = Object.freeze({
    getProxy: wr,
    getRaw: Er,
    wrap: br,
    unwrap: yr,
    rawKey: gr
});

class ComputedObserver {
    constructor(t, e, r, s, i) {
        this.interceptor = this;
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.ir = false;
        this.D = false;
        this.o = t;
        this.get = e;
        this.set = r;
        this.up = s;
        this.oL = i;
    }
    static create(t, e, r, s, i) {
        const n = r.get;
        const o = r.set;
        const h = new ComputedObserver(t, n, o, i, s);
        const u = () => h.getValue();
        u.getObserver = () => h;
        v(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: u,
            set: t => {
                h.setValue(t, 0);
            }
        });
        return h;
    }
    getValue() {
        if (0 === this.subs.count) return this.get.call(this.o, this);
        if (this.D) {
            this.compute();
            this.D = false;
        }
        return this.v;
    }
    setValue(t, e) {
        if ("function" === typeof this.set) {
            if (t !== this.v) {
                this.ir = true;
                this.set.call(this.o, t);
                this.ir = false;
                this.run();
            }
        } else throw new Error("AUR0221");
    }
    handleChange() {
        this.D = true;
        if (this.subs.count > 0) this.run();
    }
    handleCollectionChange() {
        this.D = true;
        if (this.subs.count > 0) this.run();
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.compute();
            this.D = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.D = true;
            this.obs.clearAll();
        }
    }
    flush() {
        ns = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, ns, 0);
    }
    run() {
        if (this.ir) return;
        const t = this.v;
        const e = this.compute();
        this.D = false;
        if (!Object.is(e, t)) {
            this.ov = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.ir = true;
        this.obs.version++;
        try {
            cr(this);
            return this.v = yr(this.get.call(this.up ? br(this.o) : this.o, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            ar(this);
        }
    }
}

be(ComputedObserver);

et(ComputedObserver);

ot(ComputedObserver);

let ns;

const os = s.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const hs = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const us = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.T = null;
        this.R = 0;
        this.check = () => {
            if (hs.disabled) return;
            if (++this.R < hs.timeoutsPerCheck) return;
            this.R = 0;
            const t = this.tracked;
            const e = t.length;
            let r;
            let s = 0;
            for (;s < e; ++s) {
                r = t[s];
                if (r.isDirty()) this.queue.add(r);
            }
        };
    }
    createProperty(t, e) {
        if (hs.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.T = this.p.taskQueue.queueTask(this.check, us);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.T.cancel();
            this.T = null;
        }
    }
}

DirtyChecker.inject = [ l ];

ot(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = 0;
        this.ov = void 0;
        this.j = t;
    }
    getValue() {
        return this.obj[this.key];
    }
    setValue(t, e) {
        throw new Error(`Trying to set value for property ${this.key} in dirty checker`);
    }
    isDirty() {
        return this.ov !== this.obj[this.key];
    }
    flush() {
        const t = this.ov;
        const e = this.getValue();
        this.ov = e;
        this.subs.notify(e, t, 0);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.ov = this.obj[this.key];
            this.j.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.j.removeProperty(this);
    }
}

et(DirtyCheckProperty);

class PrimitiveObserver {
    constructor(t, e) {
        this.type = 0;
        this.o = t;
        this.k = e;
    }
    get doNotCache() {
        return true;
    }
    getValue() {
        return this.o[this.k];
    }
    setValue() {}
    subscribe() {}
    unsubscribe() {}
}

class PropertyAccessor {
    constructor() {
        this.type = 0;
    }
    getValue(t, e) {
        return t[e];
    }
    setValue(t, e, r, s) {
        r[s] = t;
    }
}

let cs;

class SetterObserver {
    constructor(t, e) {
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.iO = false;
        this.f = 0;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        if (this.iO) {
            if (Object.is(t, this.v)) return;
            this.ov = this.v;
            this.v = t;
            this.f = e;
            this.queue.add(this);
        } else this.o[this.k] = t;
    }
    subscribe(t) {
        if (false === this.iO) this.start();
        this.subs.add(t);
    }
    flush() {
        cs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, cs, this.f);
    }
    start() {
        if (false === this.iO) {
            this.iO = true;
            this.v = this.o[this.k];
            v(this.o, this.k, {
                enumerable: true,
                configurable: true,
                get: () => this.getValue(),
                set: t => {
                    this.setValue(t, 0);
                }
            });
        }
        return this;
    }
    stop() {
        if (this.iO) {
            v(this.o, this.k, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.v
            });
            this.iO = false;
        }
        return this;
    }
}

class SetterNotifier {
    constructor(t, e, r, s) {
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.f = 0;
        this.o = t;
        this.S = r;
        this.hs = p(r);
        const i = t[e];
        this.cb = p(i) ? i : void 0;
        this.v = s;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        var r;
        if (this.hs) t = this.S(t);
        if (!Object.is(t, this.v)) {
            this.ov = this.v;
            this.v = t;
            this.f = e;
            null === (r = this.cb) || void 0 === r ? void 0 : r.call(this.o, this.v, this.ov, e);
            this.queue.add(this);
        }
    }
    flush() {
        cs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, cs, this.f);
    }
}

et(SetterObserver);

et(SetterNotifier);

ot(SetterObserver);

ot(SetterNotifier);

const as = new PropertyAccessor;

const ls = s.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const fs = s.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
    t.getAll(f).forEach((t => {
        t.error("Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).");
    }));
    return new DefaultNodeObserverLocator;
}))));

class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return as;
    }
    getAccessor() {
        return as;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.j = t;
        this.I = e;
        this.M = [];
    }
    addAdapter(t) {
        this.M.push(t);
    }
    getObserver(t, e) {
        var r, s;
        return null !== (s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== s ? s : this.F(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== s) return s;
        if (this.I.handles(t, e, this)) return this.I.getAccessor(t, e, this);
        return as;
    }
    getArrayObserver(t) {
        return Tt(t);
    }
    getMapObserver(t) {
        return he(t);
    }
    getSetObserver(t) {
        return Wt(t);
    }
    createObserver(t, e) {
        var r, s, i, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.I.handles(t, e, this)) return this.I.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return Tt(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return he(t).getLengthObserver(); else if (t instanceof Set) return Wt(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && a(e)) return Tt(t).getIndexObserver(Number(e));
            break;
        }
        let o = ps(t, e);
        if (void 0 === o) {
            let r = vs(t);
            while (null !== r) {
                o = ps(r, e);
                if (void 0 === o) r = vs(r); else break;
            }
        }
        if (void 0 !== o && !d.call(o, "value")) {
            let h = this.V(t, e, o);
            if (null == h) h = null === (n = null !== (s = null === (r = o.get) || void 0 === r ? void 0 : r.getObserver) && void 0 !== s ? s : null === (i = o.set) || void 0 === i ? void 0 : i.getObserver) || void 0 === n ? void 0 : n(t, this);
            return null == h ? o.configurable ? ComputedObserver.create(t, e, o, this, true) : this.j.createProperty(t, e) : h;
        }
        return new SetterObserver(t, e);
    }
    V(t, e, r) {
        if (this.M.length > 0) for (const s of this.M) {
            const i = s.getObserver(t, e, r, this);
            if (null != i) return i;
        }
        return null;
    }
    F(t, e, r) {
        if (true === r.doNotCache) return r;
        if (void 0 === t.$observers) {
            v(t, "$observers", {
                value: {
                    [e]: r
                }
            });
            return r;
        }
        return t.$observers[e] = r;
    }
}

ObserverLocator.inject = [ os, fs ];

function ds(t) {
    let e;
    if (t instanceof Array) e = Tt(t); else if (t instanceof Map) e = he(t); else if (t instanceof Set) e = Wt(t);
    return e;
}

const vs = Object.getPrototypeOf;

const ps = Object.getOwnPropertyDescriptor;

const gs = s.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ ls ];
    }
    run(t) {
        const e = new Effect(this.oL, t);
        e.run();
        return e;
    }
}

class Effect {
    constructor(t, e) {
        this.oL = t;
        this.fn = e;
        this.interceptor = this;
        this.maxRunCount = 10;
        this.queued = false;
        this.running = false;
        this.runCount = 0;
        this.stopped = false;
    }
    handleChange() {
        this.queued = true;
        this.run();
    }
    handleCollectionChange() {
        this.queued = true;
        this.run();
    }
    run() {
        if (this.stopped) throw new Error("AUR0225");
        if (this.running) return;
        ++this.runCount;
        this.running = true;
        this.queued = false;
        ++this.obs.version;
        try {
            cr(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            ar(this);
        }
        if (this.queued) {
            if (this.runCount > this.maxRunCount) {
                this.runCount = 0;
                throw new Error(`AUR0226`);
            }
            this.run();
        } else this.runCount = 0;
    }
    stop() {
        this.stopped = true;
        this.obs.clearAll();
    }
}

be(Effect);

function bs(t) {
    if (void 0 === t.$observers) v(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const ws = {};

function Es(t, e, r) {
    if (null == e) return (e, r, i) => s(e, r, i, t);
    return s(t, e, r);
    function s(t, e, r, s) {
        var i;
        const n = void 0 === e;
        s = "object" !== typeof s ? {
            name: s
        } : s || {};
        if (n) e = s.name;
        if (null == e || "" === e) throw new Error("AUR0224");
        const o = s.callback || `${String(e)}Changed`;
        let h = ws;
        if (r) {
            delete r.value;
            delete r.writable;
            h = null === (i = r.initializer) || void 0 === i ? void 0 : i.call(r);
            delete r.initializer;
        } else r = {
            configurable: true
        };
        if (!("enumerable" in r)) r.enumerable = true;
        const u = s.set;
        r.get = function t() {
            var r;
            const s = ys(this, e, o, h, u);
            null === (r = ur()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            ys(this, e, o, h, u).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return ys(r, e, o, h, u);
        };
        if (n) v(t.prototype, e, r); else return r;
    }
}

function ys(t, e, r, s, i) {
    const n = bs(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === ws ? void 0 : s);
        n[e] = o;
    }
    return o;
}

export { Ae as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, Z as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, T as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, k as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, Q as BindingMode, BindingObserverRecord, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Ee as Char, G as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, lr as ConnectableSwitcher, CustomExpression, W as DelegationStrategy, DirtyCheckProperty, hs as DirtyCheckSettings, F as ExpressionKind, Le as ExpressionType, FlushQueue, ForOfStatement, HtmlLiteralExpression, os as IDirtyChecker, we as IExpressionParser, fs as INodeObserverLocator, gs as IObservation, ls as IObserverLocator, B as ISignaler, Interpolation, _ as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, me as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, is as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, M as ValueConverter, ValueConverterDefinition, ValueConverterExpression, S as alias, Rt as applyMutationsToIndices, L as bindingBehavior, Y as cloneIndexMap, be as connectable, J as copyIndexMap, X as createIndexMap, Pt as disableArrayObservation, oe as disableMapObservation, zt as disableSetObservation, $t as enableArrayObservation, ne as enableMapObservation, _t as enableSetObservation, ds as getCollectionObserver, tt as isIndexMap, Es as observable, Te as parse, Pe as parseExpression, x as registerAliases, et as subscriberCollection, jt as synchronizeIndices, R as valueConverter, ot as withFlushQueue };
//# sourceMappingURL=index.js.map
