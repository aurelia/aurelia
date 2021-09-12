import { Metadata as t, Protocol as e, Registration as r, DI as s, firstDefined as i, mergeArrays as n, fromAnnotationOrDefinitionOrTypeOrDefault as o, isNumberOrBigInt as h, isStringOrDate as c, emptyArray as u, isArrayIndex as a, IPlatform as l, ILogger as f } from "@aurelia/kernel";

export { IPlatform } from "@aurelia/kernel";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "@aurelia/platform";

const d = Object.prototype.hasOwnProperty;

const v = Reflect.defineProperty;

const p = t => "function" === typeof t;

const g = t => "string" === typeof t;

function b(t, e, r) {
    v(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function w(t, e, r, s = false) {
    if (s || !d.call(t, e)) b(t, e, r);
}

const E = () => Object.create(null);

const y = t.getOwn;

const A = t.hasOwn;

const m = t.define;

const U = e.annotation.keyFor;

const O = e.resource.keyFor;

const S = e.resource.appendTo;

function x(...t) {
    return function(e) {
        const r = U("aliases");
        const s = y(r, e);
        if (void 0 === s) m(r, t, e); else s.push(...t);
    };
}

function C(t, e, s, i) {
    for (let n = 0, o = t.length; n < o; ++n) r.aliasTo(s, e.keyFrom(t[n])).register(i);
}

const B = Object.freeze({});

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
        if (16 & s) return B;
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

const k = s.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = E();
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

var L;

(function(t) {
    t[t["singleton"] = 1] = "singleton";
    t[t["interceptor"] = 2] = "interceptor";
})(L || (L = {}));

function $(t) {
    return function(e) {
        return R.define(t, e);
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
        if (g(t)) {
            r = t;
            s = {
                name: r
            };
        } else {
            r = t.name;
            s = t;
        }
        const h = Object.getPrototypeOf(e) === BindingInterceptor;
        return new BindingBehaviorDefinition(e, i(T(e, "name"), r), n(T(e, "aliases"), s.aliases, e.aliases), R.keyFrom(r), o("strategy", s, e, (() => h ? 2 : 1)));
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
        C(i, R, s, t);
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

const P = O("binding-behavior");

const T = (t, e) => y(U(e), t);

const R = Object.freeze({
    name: P,
    keyFrom(t) {
        return `${P}:${t}`;
    },
    isType(t) {
        return p(t) && A(P, t);
    },
    define(t, e) {
        const r = BindingBehaviorDefinition.create(t, e);
        m(P, r, r.Type);
        m(P, r, r);
        S(e, P);
        return r.Type;
    },
    getDefinition(t) {
        const e = y(P, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        m(U(e), r, t);
    },
    getAnnotation: T
});

function j(t) {
    return function(e) {
        return F.define(t, e);
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
        if (g(t)) {
            r = t;
            s = {
                name: r
            };
        } else {
            r = t.name;
            s = t;
        }
        return new ValueConverterDefinition(e, i(M(e, "name"), r), n(M(e, "aliases"), s.aliases, e.aliases), F.keyFrom(r));
    }
    register(t) {
        const {Type: e, key: s, aliases: i} = this;
        r.singleton(s, e).register(t);
        r.aliasTo(s, e).register(t);
        C(i, F, s, t);
    }
}

const I = O("value-converter");

const M = (t, e) => y(U(e), t);

const F = Object.freeze({
    name: I,
    keyFrom: t => `${I}:${t}`,
    isType(t) {
        return p(t) && A(I, t);
    },
    define(t, e) {
        const r = ValueConverterDefinition.create(t, e);
        m(I, r, r.Type);
        m(I, r, r);
        S(e, I);
        return r.Type;
    },
    getDefinition(t) {
        const e = y(I, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        m(U(e), r, t);
    },
    getAnnotation: M
});

var V;

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
})(V || (V = {}));

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
        if (g(t.value)) {
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
        this.behaviorKey = R.keyFrom(e);
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
            if (p(i[s].unbind)) i[s].unbind(t, e, r);
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
        this.converterKey = F.keyFrom(e);
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
                const e = r.get(k);
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
        const i = r.locator.get(k);
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
        const o = N(t, n, this.name);
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
        const o = N(t, i, this.name);
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
        if (p(i)) return i(...this.args.map((i => i.evaluate(t, e, r, s))));
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
                if (p(i)) return this.left.evaluate(t, e, r, s) instanceof i;
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
                    if (c(i) || c(n)) return (i || "") + (n || "");
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

ArrayLiteralExpression.$empty = new ArrayLiteralExpression(u);

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

ObjectLiteralExpression.$empty = new ObjectLiteralExpression(u, u);

class TemplateExpression {
    constructor(t, e = u) {
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
    constructor(t, e, r, s = u) {
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
        if (!p(n)) throw new Error(`AUR0110`);
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

const D = Object.prototype.toString;

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
        switch (D.call(e)) {
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
            throw new Error(`Cannot count ${D.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (D.call(e)) {
          case "[object Array]":
            return K(e, r);

          case "[object Map]":
            return q(e, r);

          case "[object Set]":
            return H(e, r);

          case "[object Number]":
            return Q(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${D.call(e)}`);
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
    constructor(t, e = u) {
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

function N(t, e, r) {
    const s = null == e ? null : e[r];
    if (p(s)) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`AUR0111:${r}`);
}

function K(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function q(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    K(r, e);
}

function H(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    K(r, e);
}

function Q(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    K(r, e);
}

var _;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(_ || (_ = {}));

var z;

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
})(z || (z = {}));

var W;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(W || (W = {}));

var G;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(G || (G = {}));

var Z;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(Z || (Z = {}));

var J;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(J || (J = {}));

function X(t, e) {
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

function Y(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function tt(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function et(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function rt(t) {
    return null == t ? st : st(t);
}

function st(t) {
    const e = t.prototype;
    v(e, "subs", {
        get: it
    });
    w(e, "subscribe", nt);
    w(e, "unsubscribe", ot);
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

function it() {
    return b(this, "subs", new SubscriberRecord);
}

function nt(t) {
    return this.subs.add(t);
}

function ot(t) {
    return this.subs.remove(t);
}

function ht(t) {
    return null == t ? ct : ct(t);
}

function ct(t) {
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
            this.i.forEach(at);
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

function at(t, e, r) {
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
        vt = this.h;
        this.h = this.v;
        this.subs.notify(this.v, vt, this.f);
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
        vt = this.h;
        this.h = this.v;
        this.subs.notify(this.v, vt, this.f);
    }
}

function lt(t) {
    const e = t.prototype;
    w(e, "subscribe", ft, true);
    w(e, "unsubscribe", dt, true);
    ht(t);
    rt(t);
}

function ft(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function dt(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

lt(CollectionLengthObserver);

lt(CollectionSizeObserver);

let vt;

const pt = new WeakMap;

function gt(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function bt(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function wt(t, e, r, s, i) {
    let n, o, h, c, u;
    let a, l;
    for (a = r + 1; a < s; a++) {
        n = t[a];
        o = e[a];
        for (l = a - 1; l >= r; l--) {
            h = t[l];
            c = e[l];
            u = i(h, n);
            if (u > 0) {
                t[l + 1] = h;
                e[l + 1] = c;
            } else break;
        }
        t[l + 1] = n;
        e[l + 1] = o;
    }
}

function Et(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, c, u;
    let a, l, f;
    let d, v, p;
    let g, b;
    let w, E, y, A;
    let m, U, O, S;
    while (true) {
        if (s - r <= 10) {
            wt(t, e, r, s, i);
            return;
        }
        n = r + (s - r >> 1);
        h = t[r];
        a = e[r];
        c = t[s - 1];
        l = e[s - 1];
        u = t[n];
        f = e[n];
        d = i(h, c);
        if (d > 0) {
            g = h;
            b = a;
            h = c;
            a = l;
            c = g;
            l = b;
        }
        v = i(h, u);
        if (v >= 0) {
            g = h;
            b = a;
            h = u;
            a = f;
            u = c;
            f = l;
            c = g;
            l = b;
        } else {
            p = i(c, u);
            if (p > 0) {
                g = c;
                b = l;
                c = u;
                l = f;
                u = g;
                f = b;
            }
        }
        t[r] = h;
        e[r] = a;
        t[s - 1] = u;
        e[s - 1] = f;
        w = c;
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
            Et(t, e, A, s, i);
            s = y;
        } else {
            Et(t, e, r, y, i);
            r = A;
        }
    }
}

const yt = Array.prototype;

const At = yt.push;

const mt = yt.unshift;

const Ut = yt.pop;

const Ot = yt.shift;

const St = yt.splice;

const xt = yt.reverse;

const Ct = yt.sort;

const Bt = {
    push: At,
    unshift: mt,
    pop: Ut,
    shift: Ot,
    splice: St,
    reverse: xt,
    sort: Ct
};

const kt = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const Lt = {
    push: function(...t) {
        const e = pt.get(this);
        if (void 0 === e) return At.apply(this, t);
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
        const e = pt.get(this);
        if (void 0 === e) return mt.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        mt.apply(e.indexMap, s);
        const n = mt.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = pt.get(this);
        if (void 0 === t) return Ut.call(this);
        const e = t.indexMap;
        const r = Ut.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        Ut.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = pt.get(this);
        if (void 0 === t) return Ot.call(this);
        const e = t.indexMap;
        const r = Ot.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        Ot.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = pt.get(this);
        if (void 0 === s) return St.apply(this, t);
        const i = this.length;
        const n = 0 | e;
        const o = n < 0 ? Math.max(i + n, 0) : Math.min(n, i);
        const h = s.indexMap;
        const c = t.length;
        const u = 0 === c ? 0 : 1 === c ? i - o : r;
        if (u > 0) {
            let t = o;
            const e = t + u;
            while (t < e) {
                if (h[t] > -1) h.deletedItems.push(h[t]);
                t++;
            }
        }
        if (c > 2) {
            const t = c - 2;
            const s = new Array(t);
            let i = 0;
            while (i < t) s[i++] = -2;
            St.call(h, e, r, ...s);
        } else St.apply(h, t);
        const a = St.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = pt.get(this);
        if (void 0 === t) {
            xt.call(this);
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
        const e = pt.get(this);
        if (void 0 === e) {
            Ct.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        Et(this, e.indexMap, 0, r, bt);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || !p(t)) t = gt;
        Et(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of kt) v(Lt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let $t = false;

function Pt() {
    for (const t of kt) if (true !== yt[t].observing) b(yt, t, Lt[t]);
}

function Tt() {
    for (const t of kt) if (true === yt[t].observing) b(yt, t, Bt[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!$t) {
            $t = true;
            Pt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = Y(t.length);
        this.lenObs = void 0;
        pt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = Y(e);
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

rt(ArrayObserver);

rt(ArrayIndexObserver);

function Rt(t) {
    let e = pt.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function jt(t) {
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

function It(t, e) {
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

const Mt = new WeakMap;

const Ft = Set.prototype;

const Vt = Ft.add;

const Dt = Ft.clear;

const Nt = Ft.delete;

const Kt = {
    add: Vt,
    clear: Dt,
    delete: Nt
};

const qt = [ "add", "clear", "delete" ];

const Ht = {
    add: function(t) {
        const e = Mt.get(this);
        if (void 0 === e) {
            Vt.call(this, t);
            return this;
        }
        const r = this.size;
        Vt.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = Mt.get(this);
        if (void 0 === t) return Dt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Dt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Mt.get(this);
        if (void 0 === e) return Nt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Nt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const Qt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of qt) v(Ht[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let _t = false;

function zt() {
    for (const t of qt) if (true !== Ft[t].observing) v(Ft, t, {
        ...Qt,
        value: Ht[t]
    });
}

function Wt() {
    for (const t of qt) if (true === Ft[t].observing) v(Ft, t, {
        ...Qt,
        value: Kt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!_t) {
            _t = true;
            zt();
        }
        this.collection = t;
        this.indexMap = Y(t.size);
        this.lenObs = void 0;
        Mt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = Y(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

rt(SetObserver);

function Gt(t) {
    let e = Mt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Zt = new WeakMap;

const Jt = Map.prototype;

const Xt = Jt.set;

const Yt = Jt.clear;

const te = Jt.delete;

const ee = {
    set: Xt,
    clear: Yt,
    delete: te
};

const re = [ "set", "clear", "delete" ];

const se = {
    set: function(t, e) {
        const r = Zt.get(this);
        if (void 0 === r) {
            Xt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        Xt.call(this, t, e);
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
        const t = Zt.get(this);
        if (void 0 === t) return Yt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Yt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Zt.get(this);
        if (void 0 === e) return te.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = te.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const ie = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of re) v(se[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let ne = false;

function oe() {
    for (const t of re) if (true !== Jt[t].observing) v(Jt, t, {
        ...ie,
        value: se[t]
    });
}

function he() {
    for (const t of re) if (true === Jt[t].observing) v(Jt, t, {
        ...ie,
        value: ee[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!ne) {
            ne = true;
            oe();
        }
        this.collection = t;
        this.indexMap = Y(t.size);
        this.lenObs = void 0;
        Zt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = Y(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

rt(MapObserver);

function ce(t) {
    let e = Zt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function ue(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function ae() {
    return b(this, "obs", new BindingObserverRecord(this));
}

function le(t) {
    let e;
    if (t instanceof Array) e = Rt(t); else if (t instanceof Set) e = Gt(t); else if (t instanceof Map) e = ce(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function fe(t) {
    this.obs.add(t);
}

function de() {
    throw new Error(`AUR2011:handleChange`);
}

function ve() {
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
        this.o.forEach(ge, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(pe, this);
        this.o.clear();
        this.count = 0;
    }
}

function pe(t, e) {
    e.unsubscribe(this);
}

function ge(t, e) {
    if (this.version !== t) {
        e.unsubscribe(this);
        this.o.delete(e);
    }
}

function be(t) {
    const e = t.prototype;
    w(e, "observe", ue, true);
    w(e, "observeCollection", le, true);
    w(e, "subscribeTo", fe, true);
    v(e, "obs", {
        get: ae
    });
    w(e, "handleChange", de);
    w(e, "handleCollectionChange", ve);
    return t;
}

function we(t) {
    return null == t ? be : be(t);
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

be(BindingMediator);

const Ee = s.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.u = E();
        this.A = E();
        this.U = E();
    }
    parse(t, e) {
        let r;
        switch (e) {
          case 16:
            return new CustomExpression(t);

          case 1:
            r = this.U[t];
            if (void 0 === r) r = this.U[t] = this.$parse(t, e);
            return r;

          case 2:
            r = this.A[t];
            if (void 0 === r) r = this.A[t] = this.$parse(t, e);
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
        Pe.ip = t;
        Pe.length = t.length;
        Pe.index = 0;
        Pe.O = t.charCodeAt(0);
        return Re(Pe, 0, 61, void 0 === e ? 8 : e);
    }
}

var ye;

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
})(ye || (ye = {}));

function Ae(t) {
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

var me;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(me || (me = {}));

var Ue;

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
})(Ue || (Ue = {}));

var Oe;

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
})(Oe || (Oe = {}));

const Se = PrimitiveLiteralExpression.$false;

const xe = PrimitiveLiteralExpression.$true;

const Ce = PrimitiveLiteralExpression.$null;

const Be = PrimitiveLiteralExpression.$undefined;

const ke = AccessThisExpression.$this;

const Le = AccessThisExpression.$parent;

var $e;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Interpolation"] = 1] = "Interpolation";
    t[t["IsIterator"] = 2] = "IsIterator";
    t[t["IsFunction"] = 4] = "IsFunction";
    t[t["IsProperty"] = 8] = "IsProperty";
    t[t["IsCustom"] = 16] = "IsCustom";
})($e || ($e = {}));

class ParserState {
    constructor(t) {
        this.ip = t;
        this.index = 0;
        this.C = 0;
        this.B = 0;
        this.L = 1572864;
        this.$ = "";
        this.P = true;
        this.length = t.length;
        this.O = t.charCodeAt(0);
    }
    get T() {
        return this.ip.slice(this.C, this.index);
    }
}

const Pe = new ParserState("");

function Te(t, e) {
    Pe.ip = t;
    Pe.length = t.length;
    Pe.index = 0;
    Pe.O = t.charCodeAt(0);
    return Re(Pe, 0, 61, void 0 === e ? 8 : e);
}

function Re(t, e, r, s) {
    if (16 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (1 & s) return Fe(t);
        De(t);
        if (1048576 & t.L) throw new Error(`AUR0151:${t.ip}`);
    }
    t.P = 448 > r;
    let i;
    if (32768 & t.L) {
        const r = Ge[63 & t.L];
        De(t);
        i = new UnaryExpression(r, Re(t, e, 449, s));
        t.P = false;
    } else {
        t: switch (t.L) {
          case 3078:
            t.P = false;
            do {
                De(t);
                e++;
                if (ze(t, 16393)) {
                    if (16393 === t.L) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.L) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.L) {
                    const t = 511 & e;
                    i = 0 === t ? ke : 1 === t ? Le : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`AUR0154:${t.ip}`);
            } while (3078 === t.L);

          case 1024:
            if (2 & s) i = new BindingIdentifier(t.$); else {
                i = new AccessScopeExpression(t.$, 511 & e);
                e = 1024;
            }
            t.P = true;
            De(t);
            break;

          case 3076:
            t.P = false;
            De(t);
            i = ke;
            e = 512;
            break;

          case 671751:
            De(t);
            i = Re(t, 0, 62, s);
            We(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = je(t, e, s);
            e = 0;
            break;

          case 131080:
            i = Me(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.$ ]);
            t.P = false;
            De(t);
            e = 0;
            break;

          case 540715:
            i = Ve(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.$);
            t.P = false;
            De(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = Ge[63 & t.L];
            t.P = false;
            De(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (2 & s) return Ie(t, i);
        if (449 < r) return i;
        let n = t.$;
        while ((16384 & t.L) > 0) {
            const r = [];
            let o;
            switch (t.L) {
              case 16393:
                t.P = true;
                De(t);
                if (0 === (3072 & t.L)) throw new Error(`AUR0153:${t.ip}`);
                n = t.$;
                De(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.L) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.P = true;
                De(t);
                e = 4096;
                i = new AccessKeyedExpression(i, Re(t, 0, 62, s));
                We(t, 1835022);
                break;

              case 671751:
                t.P = false;
                De(t);
                while (1835019 !== t.L) {
                    r.push(Re(t, 0, 62, s));
                    if (!ze(t, 1572876)) break;
                }
                We(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.P = false;
                o = [ t.$ ];
                i = new TaggedTemplateExpression(o, o, i);
                De(t);
                break;

              case 540715:
                i = Ve(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.L) > 0) {
        const n = t.L;
        if ((448 & n) <= r) break;
        De(t);
        i = new BinaryExpression(Ge[63 & n], i, Re(t, e, 448 & n, s));
        t.P = false;
    }
    if (63 < r) return i;
    if (ze(t, 1572880)) {
        const r = Re(t, e, 62, s);
        We(t, 1572879);
        i = new ConditionalExpression(i, r, Re(t, e, 62, s));
        t.P = false;
    }
    if (62 < r) return i;
    if (ze(t, 1048616)) {
        if (!t.P) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, Re(t, e, 62, s));
    }
    if (61 < r) return i;
    while (ze(t, 1572884)) {
        if (1572864 === t.L) throw new Error(`AUR0159:${t.ip}`);
        const r = t.$;
        De(t);
        const n = new Array;
        while (ze(t, 1572879)) n.push(Re(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (ze(t, 1572883)) {
        if (1572864 === t.L) throw new Error(`AUR0160:${t.ip}`);
        const r = t.$;
        De(t);
        const n = new Array;
        while (ze(t, 1572879)) n.push(Re(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.L) {
        if (1 & s) return i;
        if ("of" === t.T) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function je(t, e, r) {
    De(t);
    const s = new Array;
    while (1835022 !== t.L) if (ze(t, 1572876)) {
        s.push(Be);
        if (1835022 === t.L) break;
    } else {
        s.push(Re(t, e, 62, ~2 & r));
        if (ze(t, 1572876)) {
            if (1835022 === t.L) break;
        } else break;
    }
    We(t, 1835022);
    if (2 & r) return new ArrayBindingPattern(s); else {
        t.P = false;
        return new ArrayLiteralExpression(s);
    }
}

function Ie(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.L) throw new Error(`AUR0163:${t.ip}`);
    De(t);
    const r = e;
    const s = Re(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function Me(t, e) {
    const r = new Array;
    const s = new Array;
    De(t);
    while (1835018 !== t.L) {
        r.push(t.$);
        if (12288 & t.L) {
            De(t);
            We(t, 1572879);
            s.push(Re(t, 0, 62, ~2 & e));
        } else if (3072 & t.L) {
            const {O: r, L: i, index: n} = t;
            De(t);
            if (ze(t, 1572879)) s.push(Re(t, 0, 62, ~2 & e)); else {
                t.O = r;
                t.L = i;
                t.index = n;
                s.push(Re(t, 0, 450, ~2 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.L) We(t, 1572876);
    }
    We(t, 1835018);
    if (2 & e) return new ObjectBindingPattern(r, s); else {
        t.P = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function Fe(t) {
    const e = [];
    const r = [];
    const s = t.length;
    let i = "";
    while (t.index < s) {
        switch (t.O) {
          case 36:
            if (123 === t.ip.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.O = t.ip.charCodeAt(t.index);
                De(t);
                const s = Re(t, 0, 61, 1);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(Ae(Ne(t)));
            break;

          default:
            i += String.fromCharCode(t.O);
        }
        Ne(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function Ve(t, e, r, s, i) {
    const n = [ t.$ ];
    We(t, 540715);
    const o = [ Re(t, e, 62, r) ];
    while (540714 !== (t.L = _e(t))) {
        n.push(t.$);
        We(t, 540715);
        o.push(Re(t, e, 62, r));
    }
    n.push(t.$);
    t.P = false;
    if (i) {
        De(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        De(t);
        return new TemplateExpression(n, o);
    }
}

function De(t) {
    while (t.index < t.length) {
        t.C = t.index;
        if (null != (t.L = sr[t.O](t))) return;
    }
    t.L = 1572864;
}

function Ne(t) {
    return t.O = t.ip.charCodeAt(++t.index);
}

function Ke(t) {
    while (rr[Ne(t)]) ;
    const e = Ze[t.$ = t.T];
    return void 0 === e ? 1024 : e;
}

function qe(t, e) {
    let r = t.O;
    if (false === e) {
        do {
            r = Ne(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.$ = parseInt(t.T, 10);
            return 8192;
        }
        r = Ne(t);
        if (t.index >= t.length) {
            t.$ = parseInt(t.T.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = Ne(t);
    } while (r <= 57 && r >= 48); else t.O = t.ip.charCodeAt(--t.index);
    t.$ = parseFloat(t.T);
    return 8192;
}

function He(t) {
    const e = t.O;
    Ne(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.O !== e) if (92 === t.O) {
        s.push(t.ip.slice(i, t.index));
        Ne(t);
        r = Ae(t.O);
        Ne(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else Ne(t);
    const n = t.ip.slice(i, t.index);
    Ne(t);
    s.push(n);
    const o = s.join("");
    t.$ = o;
    return 4096;
}

function Qe(t) {
    let e = true;
    let r = "";
    while (96 !== Ne(t)) if (36 === t.O) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.O) r += String.fromCharCode(Ae(Ne(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.O);
    }
    Ne(t);
    t.$ = r;
    if (e) return 540714;
    return 540715;
}

function _e(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return Qe(t);
}

function ze(t, e) {
    if (t.L === e) {
        De(t);
        return true;
    }
    return false;
}

function We(t, e) {
    if (t.L === e) De(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const Ge = [ Se, xe, Ce, Be, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Ze = E();

Ze.true = 2049;

Ze.null = 2050;

Ze.false = 2048;

Ze.undefined = 2051;

Ze.$this = 3076;

Ze.$parent = 3078;

Ze.in = 1640799;

Ze.instanceof = 1640800;

Ze.typeof = 34851;

Ze.void = 34852;

Ze.of = 1051180;

const Je = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Xe(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function Ye(t) {
    return e => {
        Ne(e);
        return t;
    };
}

const tr = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

tr.notMapped = true;

const er = new Set;

Xe(null, er, Je.AsciiIdPart, true);

const rr = new Uint8Array(65535);

Xe(rr, null, Je.IdStart, 1);

Xe(rr, null, Je.Digit, 1);

const sr = new Array(65535);

sr.fill(tr, 0, 65535);

Xe(sr, null, Je.Skip, (t => {
    Ne(t);
    return null;
}));

Xe(sr, null, Je.IdStart, Ke);

Xe(sr, null, Je.Digit, (t => qe(t, false)));

sr[34] = sr[39] = t => He(t);

sr[96] = t => Qe(t);

sr[33] = t => {
    if (61 !== Ne(t)) return 32809;
    if (61 !== Ne(t)) return 1638680;
    Ne(t);
    return 1638682;
};

sr[61] = t => {
    if (61 !== Ne(t)) return 1048616;
    if (61 !== Ne(t)) return 1638679;
    Ne(t);
    return 1638681;
};

sr[38] = t => {
    if (38 !== Ne(t)) return 1572883;
    Ne(t);
    return 1638614;
};

sr[124] = t => {
    if (124 !== Ne(t)) return 1572884;
    Ne(t);
    return 1638549;
};

sr[46] = t => {
    if (Ne(t) <= 57 && t.O >= 48) return qe(t, true);
    return 16393;
};

sr[60] = t => {
    if (61 !== Ne(t)) return 1638747;
    Ne(t);
    return 1638749;
};

sr[62] = t => {
    if (61 !== Ne(t)) return 1638748;
    Ne(t);
    return 1638750;
};

sr[37] = Ye(1638886);

sr[40] = Ye(671751);

sr[41] = Ye(1835019);

sr[42] = Ye(1638885);

sr[43] = Ye(623009);

sr[44] = Ye(1572876);

sr[45] = Ye(623010);

sr[47] = Ye(1638887);

sr[58] = Ye(1572879);

sr[63] = Ye(1572880);

sr[91] = Ye(671757);

sr[93] = Ye(1835022);

sr[123] = Ye(131080);

sr[125] = Ye(1835018);

let ir = null;

const nr = [];

let or = false;

function hr() {
    or = false;
}

function cr() {
    or = true;
}

function ur() {
    return ir;
}

function ar(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == ir) {
        ir = t;
        nr[0] = ir;
        or = true;
        return;
    }
    if (ir === t) throw new Error("AUR0207");
    nr.push(ir);
    ir = t;
    or = true;
}

function lr(t) {
    if (null == t) throw new Error("AUR0208");
    if (ir !== t) throw new Error("AUR0209");
    nr.pop();
    ir = nr.length > 0 ? nr[nr.length - 1] : null;
    or = null != ir;
}

const fr = Object.freeze({
    get current() {
        return ir;
    },
    get connecting() {
        return or;
    },
    enter: ar,
    exit: lr,
    pause: hr,
    resume: cr
});

const dr = Reflect.get;

const vr = Object.prototype.toString;

const pr = new WeakMap;

function gr(t) {
    switch (vr.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const br = "__raw__";

function wr(t) {
    return gr(t) ? Er(t) : t;
}

function Er(t) {
    var e;
    return null !== (e = pr.get(t)) && void 0 !== e ? e : Ur(t);
}

function yr(t) {
    var e;
    return null !== (e = t[br]) && void 0 !== e ? e : t;
}

function Ar(t) {
    return gr(t) && t[br] || t;
}

function mr(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function Ur(t) {
    const e = t instanceof Array ? Sr : t instanceof Map || t instanceof Set ? Wr : Or;
    const r = new Proxy(t, e);
    pr.set(t, r);
    return r;
}

const Or = {
    get(t, e, r) {
        if (e === br) return t;
        const s = ur();
        if (!or || mr(e) || null == s) return dr(t, e, r);
        s.observe(t, e);
        return wr(dr(t, e, r));
    }
};

const Sr = {
    get(t, e, r) {
        if (e === br) return t;
        const s = ur();
        if (!or || mr(e) || null == s) return dr(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return xr;

          case "includes":
            return kr;

          case "indexOf":
            return Lr;

          case "lastIndexOf":
            return $r;

          case "every":
            return Cr;

          case "filter":
            return Br;

          case "find":
            return Tr;

          case "findIndex":
            return Pr;

          case "flat":
            return Rr;

          case "flatMap":
            return jr;

          case "join":
            return Ir;

          case "push":
            return Fr;

          case "pop":
            return Mr;

          case "reduce":
            return _r;

          case "reduceRight":
            return zr;

          case "reverse":
            return Kr;

          case "shift":
            return Vr;

          case "unshift":
            return Dr;

          case "slice":
            return Qr;

          case "splice":
            return Nr;

          case "some":
            return qr;

          case "sort":
            return Hr;

          case "keys":
            return rs;

          case "values":
          case Symbol.iterator:
            return ss;

          case "entries":
            return is;
        }
        s.observe(t, e);
        return wr(dr(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = ur()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function xr(t, e) {
    var r;
    const s = yr(this);
    const i = s.map(((r, s) => Ar(t.call(e, wr(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return wr(i);
}

function Cr(t, e) {
    var r;
    const s = yr(this);
    const i = s.every(((r, s) => t.call(e, wr(r), s, this)));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Br(t, e) {
    var r;
    const s = yr(this);
    const i = s.filter(((r, s) => Ar(t.call(e, wr(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return wr(i);
}

function kr(t) {
    var e;
    const r = yr(this);
    const s = r.includes(Ar(t));
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Lr(t) {
    var e;
    const r = yr(this);
    const s = r.indexOf(Ar(t));
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function $r(t) {
    var e;
    const r = yr(this);
    const s = r.lastIndexOf(Ar(t));
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Pr(t, e) {
    var r;
    const s = yr(this);
    const i = s.findIndex(((r, s) => Ar(t.call(e, wr(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Tr(t, e) {
    var r;
    const s = yr(this);
    const i = s.find(((e, r) => t(wr(e), r, this)), e);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return wr(i);
}

function Rr() {
    var t;
    const e = yr(this);
    null === (t = ur()) || void 0 === t ? void 0 : t.observeCollection(e);
    return wr(e.flat());
}

function jr(t, e) {
    var r;
    const s = yr(this);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Er(s.flatMap(((r, s) => wr(t.call(e, wr(r), s, this)))));
}

function Ir(t) {
    var e;
    const r = yr(this);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function Mr() {
    return wr(yr(this).pop());
}

function Fr(...t) {
    return yr(this).push(...t);
}

function Vr() {
    return wr(yr(this).shift());
}

function Dr(...t) {
    return yr(this).unshift(...t);
}

function Nr(...t) {
    return wr(yr(this).splice(...t));
}

function Kr(...t) {
    var e;
    const r = yr(this);
    const s = r.reverse();
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return wr(s);
}

function qr(t, e) {
    var r;
    const s = yr(this);
    const i = s.some(((r, s) => Ar(t.call(e, wr(r), s, this))));
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Hr(t) {
    var e;
    const r = yr(this);
    const s = r.sort(t);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return wr(s);
}

function Qr(t, e) {
    var r;
    const s = yr(this);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Er(s.slice(t, e));
}

function _r(t, e) {
    var r;
    const s = yr(this);
    const i = s.reduce(((e, r, s) => t(e, wr(r), s, this)), e);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return wr(i);
}

function zr(t, e) {
    var r;
    const s = yr(this);
    const i = s.reduceRight(((e, r, s) => t(e, wr(r), s, this)), e);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return wr(i);
}

const Wr = {
    get(t, e, r) {
        if (e === br) return t;
        const s = ur();
        if (!or || mr(e) || null == s) return dr(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return ts;

          case "delete":
            return es;

          case "forEach":
            return Gr;

          case "add":
            if (t instanceof Set) return Yr;
            break;

          case "get":
            if (t instanceof Map) return Jr;
            break;

          case "set":
            if (t instanceof Map) return Xr;
            break;

          case "has":
            return Zr;

          case "keys":
            return rs;

          case "values":
            return ss;

          case "entries":
            return is;

          case Symbol.iterator:
            return t instanceof Map ? is : ss;
        }
        return wr(dr(t, e, r));
    }
};

function Gr(t, e) {
    var r;
    const s = yr(this);
    null === (r = ur()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, wr(r), wr(s), this);
    }));
}

function Zr(t) {
    var e;
    const r = yr(this);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(Ar(t));
}

function Jr(t) {
    var e;
    const r = yr(this);
    null === (e = ur()) || void 0 === e ? void 0 : e.observeCollection(r);
    return wr(r.get(Ar(t)));
}

function Xr(t, e) {
    return wr(yr(this).set(Ar(t), Ar(e)));
}

function Yr(t) {
    return wr(yr(this).add(Ar(t)));
}

function ts() {
    return wr(yr(this).clear());
}

function es(t) {
    return wr(yr(this).delete(Ar(t)));
}

function rs() {
    var t;
    const e = yr(this);
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
                value: wr(e),
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
    const e = yr(this);
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
                value: wr(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function is() {
    var t;
    const e = yr(this);
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
                value: [ wr(e[0]), wr(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const ns = Object.freeze({
    getProxy: Er,
    getRaw: yr,
    wrap: wr,
    unwrap: Ar,
    rawKey: br
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
        const c = () => h.getValue();
        c.getObserver = () => h;
        v(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: c,
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
        if (p(this.set)) {
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
        os = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, os, 0);
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
            ar(this);
            return this.v = Ar(this.get.call(this.up ? wr(this.o) : this.o, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            lr(this);
        }
    }
}

we(ComputedObserver);

rt(ComputedObserver);

ht(ComputedObserver);

let os;

const hs = s.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const cs = {
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
        this.R = null;
        this.j = 0;
        this.check = () => {
            if (cs.disabled) return;
            if (++this.j < cs.timeoutsPerCheck) return;
            this.j = 0;
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
        if (cs.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.R = this.p.taskQueue.queueTask(this.check, us);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.R.cancel();
            this.R = null;
        }
    }
}

DirtyChecker.inject = [ l ];

ht(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = 0;
        this.ov = void 0;
        this.I = t;
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
            this.I.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.I.removeProperty(this);
    }
}

rt(DirtyCheckProperty);

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

let as;

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
        as = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, as, this.f);
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
        as = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, as, this.f);
    }
}

rt(SetterObserver);

rt(SetterNotifier);

ht(SetterObserver);

ht(SetterNotifier);

const ls = new PropertyAccessor;

const fs = s.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const ds = s.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
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
        return ls;
    }
    getAccessor() {
        return ls;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.I = t;
        this.M = e;
        this.F = [];
    }
    addAdapter(t) {
        this.F.push(t);
    }
    getObserver(t, e) {
        var r, s;
        return null !== (s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== s ? s : this.V(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== s) return s;
        if (this.M.handles(t, e, this)) return this.M.getAccessor(t, e, this);
        return ls;
    }
    getArrayObserver(t) {
        return Rt(t);
    }
    getMapObserver(t) {
        return ce(t);
    }
    getSetObserver(t) {
        return Gt(t);
    }
    createObserver(t, e) {
        var r, s, i, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.M.handles(t, e, this)) return this.M.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return Rt(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return ce(t).getLengthObserver(); else if (t instanceof Set) return Gt(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && a(e)) return Rt(t).getIndexObserver(Number(e));
            break;
        }
        let o = gs(t, e);
        if (void 0 === o) {
            let r = ps(t);
            while (null !== r) {
                o = gs(r, e);
                if (void 0 === o) r = ps(r); else break;
            }
        }
        if (void 0 !== o && !d.call(o, "value")) {
            let h = this.N(t, e, o);
            if (null == h) h = null === (n = null !== (s = null === (r = o.get) || void 0 === r ? void 0 : r.getObserver) && void 0 !== s ? s : null === (i = o.set) || void 0 === i ? void 0 : i.getObserver) || void 0 === n ? void 0 : n(t, this);
            return null == h ? o.configurable ? ComputedObserver.create(t, e, o, this, true) : this.I.createProperty(t, e) : h;
        }
        return new SetterObserver(t, e);
    }
    N(t, e, r) {
        if (this.F.length > 0) for (const s of this.F) {
            const i = s.getObserver(t, e, r, this);
            if (null != i) return i;
        }
        return null;
    }
    V(t, e, r) {
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

ObserverLocator.inject = [ hs, ds ];

function vs(t) {
    let e;
    if (t instanceof Array) e = Rt(t); else if (t instanceof Map) e = ce(t); else if (t instanceof Set) e = Gt(t);
    return e;
}

const ps = Object.getPrototypeOf;

const gs = Object.getOwnPropertyDescriptor;

const bs = s.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ fs ];
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
            ar(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            lr(this);
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

we(Effect);

function ws(t) {
    if (void 0 === t.$observers) v(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Es = {};

function ys(t, e, r) {
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
        let h = Es;
        if (r) {
            delete r.value;
            delete r.writable;
            h = null === (i = r.initializer) || void 0 === i ? void 0 : i.call(r);
            delete r.initializer;
        } else r = {
            configurable: true
        };
        if (!("enumerable" in r)) r.enumerable = true;
        const c = s.set;
        r.get = function t() {
            var r;
            const s = As(this, e, o, h, c);
            null === (r = ur()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            As(this, e, o, h, c).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return As(r, e, o, h, c);
        };
        if (n) v(t.prototype, e, r); else return r;
    }
}

function As(t, e, r, s, i) {
    const n = ws(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === Es ? void 0 : s);
        n[e] = o;
    }
    return o;
}

export { me as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, J as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, R as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, L as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, _ as BindingMode, BindingObserverRecord, CallFunctionExpression, CallMemberExpression, CallScopeExpression, ye as Char, Z as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, fr as ConnectableSwitcher, CustomExpression, G as DelegationStrategy, DirtyCheckProperty, cs as DirtyCheckSettings, V as ExpressionKind, $e as ExpressionType, FlushQueue, ForOfStatement, HtmlLiteralExpression, hs as IDirtyChecker, Ee as IExpressionParser, ds as INodeObserverLocator, bs as IObservation, fs as IObserverLocator, k as ISignaler, Interpolation, z as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, Ue as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, ns as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, F as ValueConverter, ValueConverterDefinition, ValueConverterExpression, x as alias, jt as applyMutationsToIndices, $ as bindingBehavior, tt as cloneIndexMap, we as connectable, X as copyIndexMap, Y as createIndexMap, Tt as disableArrayObservation, he as disableMapObservation, Wt as disableSetObservation, Pt as enableArrayObservation, oe as enableMapObservation, zt as enableSetObservation, vs as getCollectionObserver, et as isIndexMap, ys as observable, Re as parse, Te as parseExpression, C as registerAliases, rt as subscriberCollection, It as synchronizeIndices, j as valueConverter, ht as withFlushQueue };
//# sourceMappingURL=index.js.map
