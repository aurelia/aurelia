"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/kernel");

var e = require("@aurelia/platform");

const r = Object.prototype.hasOwnProperty;

const s = Reflect.defineProperty;

const i = t => "function" === typeof t;

const n = t => "string" === typeof t;

function o(t, e, r) {
    s(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function h(t, e, s, i = false) {
    if (i || !r.call(t, e)) o(t, e, s);
}

const c = () => Object.create(null);

const u = t.Metadata.getOwn;

const a = t.Metadata.hasOwn;

const l = t.Metadata.define;

const f = t.Protocol.annotation.keyFor;

const d = t.Protocol.resource.keyFor;

const p = t.Protocol.resource.appendTo;

function v(...t) {
    return function(e) {
        const r = f("aliases");
        const s = u(r, e);
        if (void 0 === s) l(r, t, e); else s.push(...t);
    };
}

function g(e, r, s, i) {
    for (let n = 0, o = e.length; n < o; ++n) t.Registration.aliasTo(s, r.keyFrom(e[n])).register(i);
}

const b = Object.freeze({});

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
        if (16 & s) return b;
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

const w = t.DI.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = c();
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

exports.BindingBehaviorStrategy = void 0;

(function(t) {
    t[t["singleton"] = 1] = "singleton";
    t[t["interceptor"] = 2] = "interceptor";
})(exports.BindingBehaviorStrategy || (exports.BindingBehaviorStrategy = {}));

function x(t) {
    return function(e) {
        return A.define(t, e);
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
    static create(e, r) {
        let s;
        let i;
        if (n(e)) {
            s = e;
            i = {
                name: s
            };
        } else {
            s = e.name;
            i = e;
        }
        const o = Object.getPrototypeOf(r) === BindingInterceptor;
        return new BindingBehaviorDefinition(r, t.firstDefined(y(r, "name"), s), t.mergeArrays(y(r, "aliases"), i.aliases, r.aliases), A.keyFrom(s), t.fromAnnotationOrDefinitionOrTypeOrDefault("strategy", i, r, (() => o ? 2 : 1)));
    }
    register(e) {
        const {Type: r, key: s, aliases: i, strategy: n} = this;
        switch (n) {
          case 1:
            t.Registration.singleton(s, r).register(e);
            break;

          case 2:
            t.Registration.instance(s, new BindingBehaviorFactory(e, r)).register(e);
            break;
        }
        t.Registration.aliasTo(s, r).register(e);
        g(i, A, s, e);
    }
}

class BindingBehaviorFactory {
    constructor(e, r) {
        this.ctn = e;
        this.Type = r;
        this.deps = t.DI.getDependencies(r);
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

const E = d("binding-behavior");

const y = (t, e) => u(f(e), t);

const A = Object.freeze({
    name: E,
    keyFrom(t) {
        return `${E}:${t}`;
    },
    isType(t) {
        return i(t) && a(E, t);
    },
    define(t, e) {
        const r = BindingBehaviorDefinition.create(t, e);
        l(E, r, r.Type);
        l(E, r, r);
        p(e, E);
        return r.Type;
    },
    getDefinition(t) {
        const e = u(E, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        l(f(e), r, t);
    },
    getAnnotation: y
});

function U(t) {
    return function(e) {
        return S.define(t, e);
    };
}

class ValueConverterDefinition {
    constructor(t, e, r, s) {
        this.Type = t;
        this.name = e;
        this.aliases = r;
        this.key = s;
    }
    static create(e, r) {
        let s;
        let i;
        if (n(e)) {
            s = e;
            i = {
                name: s
            };
        } else {
            s = e.name;
            i = e;
        }
        return new ValueConverterDefinition(r, t.firstDefined(O(r, "name"), s), t.mergeArrays(O(r, "aliases"), i.aliases, r.aliases), S.keyFrom(s));
    }
    register(e) {
        const {Type: r, key: s, aliases: i} = this;
        t.Registration.singleton(s, r).register(e);
        t.Registration.aliasTo(s, r).register(e);
        g(i, S, s, e);
    }
}

const m = d("value-converter");

const O = (t, e) => u(f(e), t);

const S = Object.freeze({
    name: m,
    keyFrom: t => `${m}:${t}`,
    isType(t) {
        return i(t) && a(m, t);
    },
    define(t, e) {
        const r = ValueConverterDefinition.create(t, e);
        l(m, r, r.Type);
        l(m, r, r);
        p(e, m);
        return r.Type;
    },
    getDefinition(t) {
        const e = u(m, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        l(f(e), r, t);
    },
    getAnnotation: O
});

exports.ExpressionKind = void 0;

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
})(exports.ExpressionKind || (exports.ExpressionKind = {}));

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
        if (n(t.value)) {
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
        this.behaviorKey = A.keyFrom(e);
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
        const n = r;
        if (void 0 !== n[s]) {
            if (i(n[s].unbind)) n[s].unbind(t, e, r);
            n[s] = void 0;
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
        this.converterKey = S.keyFrom(e);
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
                const e = r.get(w);
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
        const i = r.locator.get(w);
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
        const o = B(t, n, this.name);
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
        const o = B(t, i, this.name);
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
        const n = this.func.evaluate(t, e, r, s);
        if (i(n)) return n(...this.args.map((i => i.evaluate(t, e, r, s))));
        if (!(8 & t) && null == n) return;
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
    evaluate(e, r, s, n) {
        switch (this.operation) {
          case "&&":
            return this.left.evaluate(e, r, s, n) && this.right.evaluate(e, r, s, n);

          case "||":
            return this.left.evaluate(e, r, s, n) || this.right.evaluate(e, r, s, n);

          case "==":
            return this.left.evaluate(e, r, s, n) == this.right.evaluate(e, r, s, n);

          case "===":
            return this.left.evaluate(e, r, s, n) === this.right.evaluate(e, r, s, n);

          case "!=":
            return this.left.evaluate(e, r, s, n) != this.right.evaluate(e, r, s, n);

          case "!==":
            return this.left.evaluate(e, r, s, n) !== this.right.evaluate(e, r, s, n);

          case "instanceof":
            {
                const t = this.right.evaluate(e, r, s, n);
                if (i(t)) return this.left.evaluate(e, r, s, n) instanceof t;
                return false;
            }

          case "in":
            {
                const t = this.right.evaluate(e, r, s, n);
                if (t instanceof Object) return this.left.evaluate(e, r, s, n) in t;
                return false;
            }

          case "+":
            {
                const i = this.left.evaluate(e, r, s, n);
                const o = this.right.evaluate(e, r, s, n);
                if ((1 & e) > 0) return i + o;
                if (!i || !o) {
                    if (t.isNumberOrBigInt(i) || t.isNumberOrBigInt(o)) return (i || 0) + (o || 0);
                    if (t.isStringOrDate(i) || t.isStringOrDate(o)) return (i || "") + (o || "");
                }
                return i + o;
            }

          case "-":
            return this.left.evaluate(e, r, s, n) - this.right.evaluate(e, r, s, n);

          case "*":
            return this.left.evaluate(e, r, s, n) * this.right.evaluate(e, r, s, n);

          case "/":
            return this.left.evaluate(e, r, s, n) / this.right.evaluate(e, r, s, n);

          case "%":
            return this.left.evaluate(e, r, s, n) % this.right.evaluate(e, r, s, n);

          case "<":
            return this.left.evaluate(e, r, s, n) < this.right.evaluate(e, r, s, n);

          case ">":
            return this.left.evaluate(e, r, s, n) > this.right.evaluate(e, r, s, n);

          case "<=":
            return this.left.evaluate(e, r, s, n) <= this.right.evaluate(e, r, s, n);

          case ">=":
            return this.left.evaluate(e, r, s, n) >= this.right.evaluate(e, r, s, n);

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

ArrayLiteralExpression.$empty = new ArrayLiteralExpression(t.emptyArray);

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

ObjectLiteralExpression.$empty = new ObjectLiteralExpression(t.emptyArray, t.emptyArray);

class TemplateExpression {
    constructor(e, r = t.emptyArray) {
        this.cooked = e;
        this.expressions = r;
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
    constructor(e, r, s, i = t.emptyArray) {
        this.cooked = e;
        this.func = s;
        this.expressions = i;
        e.raw = r;
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
        const n = this.expressions.map((i => i.evaluate(t, e, r, s)));
        const o = this.func.evaluate(t, e, r, s);
        if (!i(o)) throw new Error(`AUR0110`);
        return o(this.cooked, ...n);
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

const C = Object.prototype.toString;

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
        switch (C.call(e)) {
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
            throw new Error(`Cannot count ${C.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (C.call(e)) {
          case "[object Array]":
            return L(e, r);

          case "[object Map]":
            return $(e, r);

          case "[object Set]":
            return k(e, r);

          case "[object Number]":
            return P(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${C.call(e)}`);
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
    constructor(e, r = t.emptyArray) {
        this.parts = e;
        this.expressions = r;
        this.isMulti = r.length > 1;
        this.firstExpression = r[0];
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

function B(t, e, r) {
    const s = null == e ? null : e[r];
    if (i(s)) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`AUR0111:${r}`);
}

function L(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function $(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    L(r, e);
}

function k(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    L(r, e);
}

function P(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    L(r, e);
}

exports.BindingMode = void 0;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(exports.BindingMode || (exports.BindingMode = {}));

exports.LifecycleFlags = void 0;

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
})(exports.LifecycleFlags || (exports.LifecycleFlags = {}));

var R;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(R || (R = {}));

exports.DelegationStrategy = void 0;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(exports.DelegationStrategy || (exports.DelegationStrategy = {}));

exports.CollectionKind = void 0;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(exports.CollectionKind || (exports.CollectionKind = {}));

exports.AccessorType = void 0;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(exports.AccessorType || (exports.AccessorType = {}));

function T(t, e) {
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

function j(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function I(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function M(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function F(t) {
    return null == t ? V : V(t);
}

function V(t) {
    const e = t.prototype;
    s(e, "subs", {
        get: D
    });
    h(e, "subscribe", N);
    h(e, "unsubscribe", K);
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

function D() {
    return o(this, "subs", new SubscriberRecord);
}

function N(t) {
    return this.subs.add(t);
}

function K(t) {
    return this.subs.remove(t);
}

function q(t) {
    return null == t ? _ : _(t);
}

function _(t) {
    const e = t.prototype;
    s(e, "queue", {
        get: H
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
            this.i.forEach(Q);
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

function H() {
    return FlushQueue.instance;
}

function Q(t, e, r) {
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
    setValue(e, r) {
        const s = this.v;
        if (e !== s && t.isArrayIndex(e)) {
            if (0 === (256 & r)) this.o.length = e;
            this.v = e;
            this.h = s;
            this.f = r;
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
        Z = this.h;
        this.h = this.v;
        this.subs.notify(this.v, Z, this.f);
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
        Z = this.h;
        this.h = this.v;
        this.subs.notify(this.v, Z, this.f);
    }
}

function z(t) {
    const e = t.prototype;
    h(e, "subscribe", W, true);
    h(e, "unsubscribe", G, true);
    q(t);
    F(t);
}

function W(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function G(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

z(CollectionLengthObserver);

z(CollectionSizeObserver);

let Z;

const J = new WeakMap;

function X(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function Y(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function tt(t, e, r, s, i) {
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

function et(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, c, u;
    let a, l, f;
    let d, p, v;
    let g, b;
    let w, x, E, y;
    let A, U, m, O;
    while (true) {
        if (s - r <= 10) {
            tt(t, e, r, s, i);
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
        p = i(h, u);
        if (p >= 0) {
            g = h;
            b = a;
            h = u;
            a = f;
            u = c;
            f = l;
            c = g;
            l = b;
        } else {
            v = i(c, u);
            if (v > 0) {
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
        x = l;
        E = r + 1;
        y = s - 1;
        t[n] = t[E];
        e[n] = e[E];
        t[E] = w;
        e[E] = x;
        t: for (o = E + 1; o < y; o++) {
            A = t[o];
            U = e[o];
            m = i(A, w);
            if (m < 0) {
                t[o] = t[E];
                e[o] = e[E];
                t[E] = A;
                e[E] = U;
                E++;
            } else if (m > 0) {
                do {
                    y--;
                    if (y == o) break t;
                    O = t[y];
                    m = i(O, w);
                } while (m > 0);
                t[o] = t[y];
                e[o] = e[y];
                t[y] = A;
                e[y] = U;
                if (m < 0) {
                    A = t[o];
                    U = e[o];
                    t[o] = t[E];
                    e[o] = e[E];
                    t[E] = A;
                    e[E] = U;
                    E++;
                }
            }
        }
        if (s - y < E - r) {
            et(t, e, y, s, i);
            s = E;
        } else {
            et(t, e, r, E, i);
            r = y;
        }
    }
}

const rt = Array.prototype;

const st = rt.push;

const it = rt.unshift;

const nt = rt.pop;

const ot = rt.shift;

const ht = rt.splice;

const ct = rt.reverse;

const ut = rt.sort;

const at = {
    push: st,
    unshift: it,
    pop: nt,
    shift: ot,
    splice: ht,
    reverse: ct,
    sort: ut
};

const lt = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const ft = {
    push: function(...t) {
        const e = J.get(this);
        if (void 0 === e) return st.apply(this, t);
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
        const e = J.get(this);
        if (void 0 === e) return it.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        it.apply(e.indexMap, s);
        const n = it.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = J.get(this);
        if (void 0 === t) return nt.call(this);
        const e = t.indexMap;
        const r = nt.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        nt.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = J.get(this);
        if (void 0 === t) return ot.call(this);
        const e = t.indexMap;
        const r = ot.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        ot.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = J.get(this);
        if (void 0 === s) return ht.apply(this, t);
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
            ht.call(h, e, r, ...s);
        } else ht.apply(h, t);
        const a = ht.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = J.get(this);
        if (void 0 === t) {
            ct.call(this);
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
        const e = J.get(this);
        if (void 0 === e) {
            ut.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        et(this, e.indexMap, 0, r, Y);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || !i(t)) t = X;
        et(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of lt) s(ft[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let dt = false;

function pt() {
    for (const t of lt) if (true !== rt[t].observing) o(rt, t, ft[t]);
}

function vt() {
    for (const t of lt) if (true === rt[t].observing) o(rt, t, at[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!dt) {
            dt = true;
            pt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = j(t.length);
        this.lenObs = void 0;
        J.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = j(e);
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

F(ArrayObserver);

F(ArrayIndexObserver);

function gt(t) {
    let e = J.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function bt(t) {
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

function wt(t, e) {
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

const xt = new WeakMap;

const Et = Set.prototype;

const yt = Et.add;

const At = Et.clear;

const Ut = Et.delete;

const mt = {
    add: yt,
    clear: At,
    delete: Ut
};

const Ot = [ "add", "clear", "delete" ];

const St = {
    add: function(t) {
        const e = xt.get(this);
        if (void 0 === e) {
            yt.call(this, t);
            return this;
        }
        const r = this.size;
        yt.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = xt.get(this);
        if (void 0 === t) return At.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            At.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = xt.get(this);
        if (void 0 === e) return Ut.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Ut.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const Ct = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Ot) s(St[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Bt = false;

function Lt() {
    for (const t of Ot) if (true !== Et[t].observing) s(Et, t, {
        ...Ct,
        value: St[t]
    });
}

function $t() {
    for (const t of Ot) if (true === Et[t].observing) s(Et, t, {
        ...Ct,
        value: mt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Bt) {
            Bt = true;
            Lt();
        }
        this.collection = t;
        this.indexMap = j(t.size);
        this.lenObs = void 0;
        xt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = j(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

F(SetObserver);

function kt(t) {
    let e = xt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Pt = new WeakMap;

const Rt = Map.prototype;

const Tt = Rt.set;

const jt = Rt.clear;

const It = Rt.delete;

const Mt = {
    set: Tt,
    clear: jt,
    delete: It
};

const Ft = [ "set", "clear", "delete" ];

const Vt = {
    set: function(t, e) {
        const r = Pt.get(this);
        if (void 0 === r) {
            Tt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        Tt.call(this, t, e);
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
        const t = Pt.get(this);
        if (void 0 === t) return jt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            jt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Pt.get(this);
        if (void 0 === e) return It.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = It.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const Dt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Ft) s(Vt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Nt = false;

function Kt() {
    for (const t of Ft) if (true !== Rt[t].observing) s(Rt, t, {
        ...Dt,
        value: Vt[t]
    });
}

function qt() {
    for (const t of Ft) if (true === Rt[t].observing) s(Rt, t, {
        ...Dt,
        value: Mt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!Nt) {
            Nt = true;
            Kt();
        }
        this.collection = t;
        this.indexMap = j(t.size);
        this.lenObs = void 0;
        Pt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = j(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

F(MapObserver);

function _t(t) {
    let e = Pt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function Ht(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function Qt() {
    return o(this, "obs", new BindingObserverRecord(this));
}

function zt(t) {
    let e;
    if (t instanceof Array) e = gt(t); else if (t instanceof Set) e = kt(t); else if (t instanceof Map) e = _t(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function Wt(t) {
    this.obs.add(t);
}

function Gt() {
    throw new Error(`AUR2011:handleChange`);
}

function Zt() {
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
        this.o.forEach(Xt, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(Jt, this);
        this.o.clear();
        this.count = 0;
    }
}

function Jt(t, e) {
    e.unsubscribe(this);
}

function Xt(t, e) {
    if (this.version !== t) {
        e.unsubscribe(this);
        this.o.delete(e);
    }
}

function Yt(t) {
    const e = t.prototype;
    h(e, "observe", Ht, true);
    h(e, "observeCollection", zt, true);
    h(e, "subscribeTo", Wt, true);
    s(e, "obs", {
        get: Qt
    });
    h(e, "handleChange", Gt);
    h(e, "handleCollectionChange", Zt);
    return t;
}

function te(t) {
    return null == t ? Yt : Yt(t);
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

Yt(BindingMediator);

const ee = t.DI.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.u = c();
        this.A = c();
        this.U = c();
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
        ae.ip = t;
        ae.length = t.length;
        ae.index = 0;
        ae.O = t.charCodeAt(0);
        return fe(ae, 0, 61, void 0 === e ? 8 : e);
    }
}

exports.Char = void 0;

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
})(exports.Char || (exports.Char = {}));

function re(t) {
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

exports.Access = void 0;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(exports.Access || (exports.Access = {}));

exports.Precedence = void 0;

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
})(exports.Precedence || (exports.Precedence = {}));

var se;

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
})(se || (se = {}));

const ie = PrimitiveLiteralExpression.$false;

const ne = PrimitiveLiteralExpression.$true;

const oe = PrimitiveLiteralExpression.$null;

const he = PrimitiveLiteralExpression.$undefined;

const ce = AccessThisExpression.$this;

const ue = AccessThisExpression.$parent;

exports.ExpressionType = void 0;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Interpolation"] = 1] = "Interpolation";
    t[t["IsIterator"] = 2] = "IsIterator";
    t[t["IsFunction"] = 4] = "IsFunction";
    t[t["IsProperty"] = 8] = "IsProperty";
    t[t["IsCustom"] = 16] = "IsCustom";
})(exports.ExpressionType || (exports.ExpressionType = {}));

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
    get R() {
        return this.ip.slice(this.C, this.index);
    }
}

const ae = new ParserState("");

function le(t, e) {
    ae.ip = t;
    ae.length = t.length;
    ae.index = 0;
    ae.O = t.charCodeAt(0);
    return fe(ae, 0, 61, void 0 === e ? 8 : e);
}

function fe(t, e, r, s) {
    if (16 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (1 & s) return ge(t);
        we(t);
        if (1048576 & t.L) throw new Error(`AUR0151:${t.ip}`);
    }
    t.P = 448 > r;
    let i;
    if (32768 & t.L) {
        const r = Ce[63 & t.L];
        we(t);
        i = new UnaryExpression(r, fe(t, e, 449, s));
        t.P = false;
    } else {
        t: switch (t.L) {
          case 3078:
            t.P = false;
            do {
                we(t);
                e++;
                if (Oe(t, 16393)) {
                    if (16393 === t.L) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.L) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.L) {
                    const t = 511 & e;
                    i = 0 === t ? ce : 1 === t ? ue : new AccessThisExpression(t);
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
            we(t);
            break;

          case 3076:
            t.P = false;
            we(t);
            i = ce;
            e = 512;
            break;

          case 671751:
            we(t);
            i = fe(t, 0, 62, s);
            Se(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = de(t, e, s);
            e = 0;
            break;

          case 131080:
            i = ve(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.$ ]);
            t.P = false;
            we(t);
            e = 0;
            break;

          case 540715:
            i = be(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.$);
            t.P = false;
            we(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = Ce[63 & t.L];
            t.P = false;
            we(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (2 & s) return pe(t, i);
        if (449 < r) return i;
        let n = t.$;
        while ((16384 & t.L) > 0) {
            const r = [];
            let o;
            switch (t.L) {
              case 16393:
                t.P = true;
                we(t);
                if (0 === (3072 & t.L)) throw new Error(`AUR0153:${t.ip}`);
                n = t.$;
                we(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.L) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.P = true;
                we(t);
                e = 4096;
                i = new AccessKeyedExpression(i, fe(t, 0, 62, s));
                Se(t, 1835022);
                break;

              case 671751:
                t.P = false;
                we(t);
                while (1835019 !== t.L) {
                    r.push(fe(t, 0, 62, s));
                    if (!Oe(t, 1572876)) break;
                }
                Se(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.P = false;
                o = [ t.$ ];
                i = new TaggedTemplateExpression(o, o, i);
                we(t);
                break;

              case 540715:
                i = be(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.L) > 0) {
        const n = t.L;
        if ((448 & n) <= r) break;
        we(t);
        i = new BinaryExpression(Ce[63 & n], i, fe(t, e, 448 & n, s));
        t.P = false;
    }
    if (63 < r) return i;
    if (Oe(t, 1572880)) {
        const r = fe(t, e, 62, s);
        Se(t, 1572879);
        i = new ConditionalExpression(i, r, fe(t, e, 62, s));
        t.P = false;
    }
    if (62 < r) return i;
    if (Oe(t, 1048616)) {
        if (!t.P) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, fe(t, e, 62, s));
    }
    if (61 < r) return i;
    while (Oe(t, 1572884)) {
        if (1572864 === t.L) throw new Error(`AUR0159:${t.ip}`);
        const r = t.$;
        we(t);
        const n = new Array;
        while (Oe(t, 1572879)) n.push(fe(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (Oe(t, 1572883)) {
        if (1572864 === t.L) throw new Error(`AUR0160:${t.ip}`);
        const r = t.$;
        we(t);
        const n = new Array;
        while (Oe(t, 1572879)) n.push(fe(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.L) {
        if (1 & s) return i;
        if ("of" === t.R) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function de(t, e, r) {
    we(t);
    const s = new Array;
    while (1835022 !== t.L) if (Oe(t, 1572876)) {
        s.push(he);
        if (1835022 === t.L) break;
    } else {
        s.push(fe(t, e, 62, ~2 & r));
        if (Oe(t, 1572876)) {
            if (1835022 === t.L) break;
        } else break;
    }
    Se(t, 1835022);
    if (2 & r) return new ArrayBindingPattern(s); else {
        t.P = false;
        return new ArrayLiteralExpression(s);
    }
}

function pe(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.L) throw new Error(`AUR0163:${t.ip}`);
    we(t);
    const r = e;
    const s = fe(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function ve(t, e) {
    const r = new Array;
    const s = new Array;
    we(t);
    while (1835018 !== t.L) {
        r.push(t.$);
        if (12288 & t.L) {
            we(t);
            Se(t, 1572879);
            s.push(fe(t, 0, 62, ~2 & e));
        } else if (3072 & t.L) {
            const {O: r, L: i, index: n} = t;
            we(t);
            if (Oe(t, 1572879)) s.push(fe(t, 0, 62, ~2 & e)); else {
                t.O = r;
                t.L = i;
                t.index = n;
                s.push(fe(t, 0, 450, ~2 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.L) Se(t, 1572876);
    }
    Se(t, 1835018);
    if (2 & e) return new ObjectBindingPattern(r, s); else {
        t.P = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function ge(t) {
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
                we(t);
                const s = fe(t, 0, 61, 1);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(re(xe(t)));
            break;

          default:
            i += String.fromCharCode(t.O);
        }
        xe(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function be(t, e, r, s, i) {
    const n = [ t.$ ];
    Se(t, 540715);
    const o = [ fe(t, e, 62, r) ];
    while (540714 !== (t.L = me(t))) {
        n.push(t.$);
        Se(t, 540715);
        o.push(fe(t, e, 62, r));
    }
    n.push(t.$);
    t.P = false;
    if (i) {
        we(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        we(t);
        return new TemplateExpression(n, o);
    }
}

function we(t) {
    while (t.index < t.length) {
        t.C = t.index;
        if (null != (t.L = je[t.O](t))) return;
    }
    t.L = 1572864;
}

function xe(t) {
    return t.O = t.ip.charCodeAt(++t.index);
}

function Ee(t) {
    while (Te[xe(t)]) ;
    const e = Be[t.$ = t.R];
    return void 0 === e ? 1024 : e;
}

function ye(t, e) {
    let r = t.O;
    if (false === e) {
        do {
            r = xe(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.$ = parseInt(t.R, 10);
            return 8192;
        }
        r = xe(t);
        if (t.index >= t.length) {
            t.$ = parseInt(t.R.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = xe(t);
    } while (r <= 57 && r >= 48); else t.O = t.ip.charCodeAt(--t.index);
    t.$ = parseFloat(t.R);
    return 8192;
}

function Ae(t) {
    const e = t.O;
    xe(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.O !== e) if (92 === t.O) {
        s.push(t.ip.slice(i, t.index));
        xe(t);
        r = re(t.O);
        xe(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else xe(t);
    const n = t.ip.slice(i, t.index);
    xe(t);
    s.push(n);
    const o = s.join("");
    t.$ = o;
    return 4096;
}

function Ue(t) {
    let e = true;
    let r = "";
    while (96 !== xe(t)) if (36 === t.O) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.O) r += String.fromCharCode(re(xe(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.O);
    }
    xe(t);
    t.$ = r;
    if (e) return 540714;
    return 540715;
}

function me(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return Ue(t);
}

function Oe(t, e) {
    if (t.L === e) {
        we(t);
        return true;
    }
    return false;
}

function Se(t, e) {
    if (t.L === e) we(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const Ce = [ ie, ne, oe, he, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Be = c();

Be.true = 2049;

Be.null = 2050;

Be.false = 2048;

Be.undefined = 2051;

Be.$this = 3076;

Be.$parent = 3078;

Be.in = 1640799;

Be.instanceof = 1640800;

Be.typeof = 34851;

Be.void = 34852;

Be.of = 1051180;

const Le = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function $e(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function ke(t) {
    return e => {
        xe(e);
        return t;
    };
}

const Pe = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

Pe.notMapped = true;

const Re = new Set;

$e(null, Re, Le.AsciiIdPart, true);

const Te = new Uint8Array(65535);

$e(Te, null, Le.IdStart, 1);

$e(Te, null, Le.Digit, 1);

const je = new Array(65535);

je.fill(Pe, 0, 65535);

$e(je, null, Le.Skip, (t => {
    xe(t);
    return null;
}));

$e(je, null, Le.IdStart, Ee);

$e(je, null, Le.Digit, (t => ye(t, false)));

je[34] = je[39] = t => Ae(t);

je[96] = t => Ue(t);

je[33] = t => {
    if (61 !== xe(t)) return 32809;
    if (61 !== xe(t)) return 1638680;
    xe(t);
    return 1638682;
};

je[61] = t => {
    if (61 !== xe(t)) return 1048616;
    if (61 !== xe(t)) return 1638679;
    xe(t);
    return 1638681;
};

je[38] = t => {
    if (38 !== xe(t)) return 1572883;
    xe(t);
    return 1638614;
};

je[124] = t => {
    if (124 !== xe(t)) return 1572884;
    xe(t);
    return 1638549;
};

je[46] = t => {
    if (xe(t) <= 57 && t.O >= 48) return ye(t, true);
    return 16393;
};

je[60] = t => {
    if (61 !== xe(t)) return 1638747;
    xe(t);
    return 1638749;
};

je[62] = t => {
    if (61 !== xe(t)) return 1638748;
    xe(t);
    return 1638750;
};

je[37] = ke(1638886);

je[40] = ke(671751);

je[41] = ke(1835019);

je[42] = ke(1638885);

je[43] = ke(623009);

je[44] = ke(1572876);

je[45] = ke(623010);

je[47] = ke(1638887);

je[58] = ke(1572879);

je[63] = ke(1572880);

je[91] = ke(671757);

je[93] = ke(1835022);

je[123] = ke(131080);

je[125] = ke(1835018);

let Ie = null;

const Me = [];

let Fe = false;

function Ve() {
    Fe = false;
}

function De() {
    Fe = true;
}

function Ne() {
    return Ie;
}

function Ke(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == Ie) {
        Ie = t;
        Me[0] = Ie;
        Fe = true;
        return;
    }
    if (Ie === t) throw new Error("AUR0207");
    Me.push(Ie);
    Ie = t;
    Fe = true;
}

function qe(t) {
    if (null == t) throw new Error("AUR0208");
    if (Ie !== t) throw new Error("AUR0209");
    Me.pop();
    Ie = Me.length > 0 ? Me[Me.length - 1] : null;
    Fe = null != Ie;
}

const _e = Object.freeze({
    get current() {
        return Ie;
    },
    get connecting() {
        return Fe;
    },
    enter: Ke,
    exit: qe,
    pause: Ve,
    resume: De
});

const He = Reflect.get;

const Qe = Object.prototype.toString;

const ze = new WeakMap;

function We(t) {
    switch (Qe.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const Ge = "__raw__";

function Ze(t) {
    return We(t) ? Je(t) : t;
}

function Je(t) {
    var e;
    return null !== (e = ze.get(t)) && void 0 !== e ? e : er(t);
}

function Xe(t) {
    var e;
    return null !== (e = t[Ge]) && void 0 !== e ? e : t;
}

function Ye(t) {
    return We(t) && t[Ge] || t;
}

function tr(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function er(t) {
    const e = t instanceof Array ? sr : t instanceof Map || t instanceof Set ? Sr : rr;
    const r = new Proxy(t, e);
    ze.set(t, r);
    return r;
}

const rr = {
    get(t, e, r) {
        if (e === Ge) return t;
        const s = Ne();
        if (!Fe || tr(e) || null == s) return He(t, e, r);
        s.observe(t, e);
        return Ze(He(t, e, r));
    }
};

const sr = {
    get(t, e, r) {
        if (e === Ge) return t;
        const s = Ne();
        if (!Fe || tr(e) || null == s) return He(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return ir;

          case "includes":
            return hr;

          case "indexOf":
            return cr;

          case "lastIndexOf":
            return ur;

          case "every":
            return nr;

          case "filter":
            return or;

          case "find":
            return lr;

          case "findIndex":
            return ar;

          case "flat":
            return fr;

          case "flatMap":
            return dr;

          case "join":
            return pr;

          case "push":
            return gr;

          case "pop":
            return vr;

          case "reduce":
            return mr;

          case "reduceRight":
            return Or;

          case "reverse":
            return Er;

          case "shift":
            return br;

          case "unshift":
            return wr;

          case "slice":
            return Ur;

          case "splice":
            return xr;

          case "some":
            return yr;

          case "sort":
            return Ar;

          case "keys":
            return Tr;

          case "values":
          case Symbol.iterator:
            return jr;

          case "entries":
            return Ir;
        }
        s.observe(t, e);
        return Ze(He(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = Ne()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function ir(t, e) {
    var r;
    const s = Xe(this);
    const i = s.map(((r, s) => Ye(t.call(e, Ze(r), s, this))));
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ze(i);
}

function nr(t, e) {
    var r;
    const s = Xe(this);
    const i = s.every(((r, s) => t.call(e, Ze(r), s, this)));
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function or(t, e) {
    var r;
    const s = Xe(this);
    const i = s.filter(((r, s) => Ye(t.call(e, Ze(r), s, this))));
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ze(i);
}

function hr(t) {
    var e;
    const r = Xe(this);
    const s = r.includes(Ye(t));
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function cr(t) {
    var e;
    const r = Xe(this);
    const s = r.indexOf(Ye(t));
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function ur(t) {
    var e;
    const r = Xe(this);
    const s = r.lastIndexOf(Ye(t));
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function ar(t, e) {
    var r;
    const s = Xe(this);
    const i = s.findIndex(((r, s) => Ye(t.call(e, Ze(r), s, this))));
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function lr(t, e) {
    var r;
    const s = Xe(this);
    const i = s.find(((e, r) => t(Ze(e), r, this)), e);
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ze(i);
}

function fr() {
    var t;
    const e = Xe(this);
    null === (t = Ne()) || void 0 === t ? void 0 : t.observeCollection(e);
    return Ze(e.flat());
}

function dr(t, e) {
    var r;
    const s = Xe(this);
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Je(s.flatMap(((r, s) => Ze(t.call(e, Ze(r), s, this)))));
}

function pr(t) {
    var e;
    const r = Xe(this);
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function vr() {
    return Ze(Xe(this).pop());
}

function gr(...t) {
    return Xe(this).push(...t);
}

function br() {
    return Ze(Xe(this).shift());
}

function wr(...t) {
    return Xe(this).unshift(...t);
}

function xr(...t) {
    return Ze(Xe(this).splice(...t));
}

function Er(...t) {
    var e;
    const r = Xe(this);
    const s = r.reverse();
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ze(s);
}

function yr(t, e) {
    var r;
    const s = Xe(this);
    const i = s.some(((r, s) => Ye(t.call(e, Ze(r), s, this))));
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Ar(t) {
    var e;
    const r = Xe(this);
    const s = r.sort(t);
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ze(s);
}

function Ur(t, e) {
    var r;
    const s = Xe(this);
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Je(s.slice(t, e));
}

function mr(t, e) {
    var r;
    const s = Xe(this);
    const i = s.reduce(((e, r, s) => t(e, Ze(r), s, this)), e);
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ze(i);
}

function Or(t, e) {
    var r;
    const s = Xe(this);
    const i = s.reduceRight(((e, r, s) => t(e, Ze(r), s, this)), e);
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ze(i);
}

const Sr = {
    get(t, e, r) {
        if (e === Ge) return t;
        const s = Ne();
        if (!Fe || tr(e) || null == s) return He(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return Pr;

          case "delete":
            return Rr;

          case "forEach":
            return Cr;

          case "add":
            if (t instanceof Set) return kr;
            break;

          case "get":
            if (t instanceof Map) return Lr;
            break;

          case "set":
            if (t instanceof Map) return $r;
            break;

          case "has":
            return Br;

          case "keys":
            return Tr;

          case "values":
            return jr;

          case "entries":
            return Ir;

          case Symbol.iterator:
            return t instanceof Map ? Ir : jr;
        }
        return Ze(He(t, e, r));
    }
};

function Cr(t, e) {
    var r;
    const s = Xe(this);
    null === (r = Ne()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, Ze(r), Ze(s), this);
    }));
}

function Br(t) {
    var e;
    const r = Xe(this);
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(Ye(t));
}

function Lr(t) {
    var e;
    const r = Xe(this);
    null === (e = Ne()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ze(r.get(Ye(t)));
}

function $r(t, e) {
    return Ze(Xe(this).set(Ye(t), Ye(e)));
}

function kr(t) {
    return Ze(Xe(this).add(Ye(t)));
}

function Pr() {
    return Ze(Xe(this).clear());
}

function Rr(t) {
    return Ze(Xe(this).delete(Ye(t)));
}

function Tr() {
    var t;
    const e = Xe(this);
    null === (t = Ne()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Ze(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function jr() {
    var t;
    const e = Xe(this);
    null === (t = Ne()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Ze(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Ir() {
    var t;
    const e = Xe(this);
    null === (t = Ne()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ Ze(e[0]), Ze(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const Mr = Object.freeze({
    getProxy: Je,
    getRaw: Xe,
    wrap: Ze,
    unwrap: Ye,
    rawKey: Ge
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
    static create(t, e, r, i, n) {
        const o = r.get;
        const h = r.set;
        const c = new ComputedObserver(t, o, h, n, i);
        const u = () => c.getValue();
        u.getObserver = () => c;
        s(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: u,
            set: t => {
                c.setValue(t, 0);
            }
        });
        return c;
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
        if (i(this.set)) {
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
        Fr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Fr, 0);
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
            Ke(this);
            return this.v = Ye(this.get.call(this.up ? Ze(this.o) : this.o, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            qe(this);
        }
    }
}

te(ComputedObserver);

F(ComputedObserver);

q(ComputedObserver);

let Fr;

const Vr = t.DI.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Dr = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const Nr = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.T = null;
        this.j = 0;
        this.check = () => {
            if (Dr.disabled) return;
            if (++this.j < Dr.timeoutsPerCheck) return;
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
        if (Dr.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.T = this.p.taskQueue.queueTask(this.check, Nr);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.T.cancel();
            this.T = null;
        }
    }
}

DirtyChecker.inject = [ t.IPlatform ];

q(DirtyChecker);

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

F(DirtyCheckProperty);

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

let Kr;

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
        Kr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Kr, this.f);
    }
    start() {
        if (false === this.iO) {
            this.iO = true;
            this.v = this.o[this.k];
            s(this.o, this.k, {
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
            s(this.o, this.k, {
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
        this.hs = i(r);
        const n = t[e];
        this.cb = i(n) ? n : void 0;
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
        Kr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Kr, this.f);
    }
}

F(SetterObserver);

F(SetterNotifier);

q(SetterObserver);

q(SetterNotifier);

const qr = new PropertyAccessor;

const _r = t.DI.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const Hr = t.DI.createInterface("INodeObserverLocator", (e => e.cachedCallback((e => {
    e.getAll(t.ILogger).forEach((t => {
        t.error("Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).");
    }));
    return new DefaultNodeObserverLocator;
}))));

class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return qr;
    }
    getAccessor() {
        return qr;
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
        return qr;
    }
    getArrayObserver(t) {
        return gt(t);
    }
    getMapObserver(t) {
        return _t(t);
    }
    getSetObserver(t) {
        return kt(t);
    }
    createObserver(e, s) {
        var i, n, o, h;
        if (!(e instanceof Object)) return new PrimitiveObserver(e, s);
        if (this.M.handles(e, s, this)) return this.M.getObserver(e, s, this);
        switch (s) {
          case "length":
            if (e instanceof Array) return gt(e).getLengthObserver();
            break;

          case "size":
            if (e instanceof Map) return _t(e).getLengthObserver(); else if (e instanceof Set) return kt(e).getLengthObserver();
            break;

          default:
            if (e instanceof Array && t.isArrayIndex(s)) return gt(e).getIndexObserver(Number(s));
            break;
        }
        let c = Wr(e, s);
        if (void 0 === c) {
            let t = zr(e);
            while (null !== t) {
                c = Wr(t, s);
                if (void 0 === c) t = zr(t); else break;
            }
        }
        if (void 0 !== c && !r.call(c, "value")) {
            let t = this.N(e, s, c);
            if (null == t) t = null === (h = null !== (n = null === (i = c.get) || void 0 === i ? void 0 : i.getObserver) && void 0 !== n ? n : null === (o = c.set) || void 0 === o ? void 0 : o.getObserver) || void 0 === h ? void 0 : h(e, this);
            return null == t ? c.configurable ? ComputedObserver.create(e, s, c, this, true) : this.I.createProperty(e, s) : t;
        }
        return new SetterObserver(e, s);
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
            s(t, "$observers", {
                value: {
                    [e]: r
                }
            });
            return r;
        }
        return t.$observers[e] = r;
    }
}

ObserverLocator.inject = [ Vr, Hr ];

function Qr(t) {
    let e;
    if (t instanceof Array) e = gt(t); else if (t instanceof Map) e = _t(t); else if (t instanceof Set) e = kt(t);
    return e;
}

const zr = Object.getPrototypeOf;

const Wr = Object.getOwnPropertyDescriptor;

const Gr = t.DI.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ _r ];
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
            Ke(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            qe(this);
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

te(Effect);

function Zr(t) {
    if (void 0 === t.$observers) s(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Jr = {};

function Xr(t, e, r) {
    if (null == e) return (e, r, s) => i(e, r, s, t);
    return i(t, e, r);
    function i(t, e, r, i) {
        var n;
        const o = void 0 === e;
        i = "object" !== typeof i ? {
            name: i
        } : i || {};
        if (o) e = i.name;
        if (null == e || "" === e) throw new Error("AUR0224");
        const h = i.callback || `${String(e)}Changed`;
        let c = Jr;
        if (r) {
            delete r.value;
            delete r.writable;
            c = null === (n = r.initializer) || void 0 === n ? void 0 : n.call(r);
            delete r.initializer;
        } else r = {
            configurable: true
        };
        if (!("enumerable" in r)) r.enumerable = true;
        const u = i.set;
        r.get = function t() {
            var r;
            const s = Yr(this, e, h, c, u);
            null === (r = Ne()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            Yr(this, e, h, c, u).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return Yr(r, e, h, c, u);
        };
        if (o) s(t.prototype, e, r); else return r;
    }
}

function Yr(t, e, r, s, i) {
    const n = Zr(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === Jr ? void 0 : s);
        n[e] = o;
    }
    return o;
}

exports.IPlatform = t.IPlatform;

exports.Platform = e.Platform;

exports.Task = e.Task;

exports.TaskAbortError = e.TaskAbortError;

exports.TaskQueue = e.TaskQueue;

exports.TaskQueuePriority = e.TaskQueuePriority;

exports.TaskStatus = e.TaskStatus;

exports.AccessKeyedExpression = AccessKeyedExpression;

exports.AccessMemberExpression = AccessMemberExpression;

exports.AccessScopeExpression = AccessScopeExpression;

exports.AccessThisExpression = AccessThisExpression;

exports.ArrayBindingPattern = ArrayBindingPattern;

exports.ArrayIndexObserver = ArrayIndexObserver;

exports.ArrayLiteralExpression = ArrayLiteralExpression;

exports.ArrayObserver = ArrayObserver;

exports.AssignExpression = AssignExpression;

exports.BinaryExpression = BinaryExpression;

exports.BindingBehavior = A;

exports.BindingBehaviorDefinition = BindingBehaviorDefinition;

exports.BindingBehaviorExpression = BindingBehaviorExpression;

exports.BindingBehaviorFactory = BindingBehaviorFactory;

exports.BindingContext = BindingContext;

exports.BindingIdentifier = BindingIdentifier;

exports.BindingInterceptor = BindingInterceptor;

exports.BindingMediator = BindingMediator;

exports.BindingObserverRecord = BindingObserverRecord;

exports.CallFunctionExpression = CallFunctionExpression;

exports.CallMemberExpression = CallMemberExpression;

exports.CallScopeExpression = CallScopeExpression;

exports.CollectionLengthObserver = CollectionLengthObserver;

exports.CollectionSizeObserver = CollectionSizeObserver;

exports.ComputedObserver = ComputedObserver;

exports.ConditionalExpression = ConditionalExpression;

exports.ConnectableSwitcher = _e;

exports.CustomExpression = CustomExpression;

exports.DirtyCheckProperty = DirtyCheckProperty;

exports.DirtyCheckSettings = Dr;

exports.FlushQueue = FlushQueue;

exports.ForOfStatement = ForOfStatement;

exports.HtmlLiteralExpression = HtmlLiteralExpression;

exports.IDirtyChecker = Vr;

exports.IExpressionParser = ee;

exports.INodeObserverLocator = Hr;

exports.IObservation = Gr;

exports.IObserverLocator = _r;

exports.ISignaler = w;

exports.Interpolation = Interpolation;

exports.MapObserver = MapObserver;

exports.ObjectBindingPattern = ObjectBindingPattern;

exports.ObjectLiteralExpression = ObjectLiteralExpression;

exports.Observation = Observation;

exports.ObserverLocator = ObserverLocator;

exports.OverrideContext = OverrideContext;

exports.ParserState = ParserState;

exports.PrimitiveLiteralExpression = PrimitiveLiteralExpression;

exports.PrimitiveObserver = PrimitiveObserver;

exports.PropertyAccessor = PropertyAccessor;

exports.ProxyObservable = Mr;

exports.Scope = Scope;

exports.SetObserver = SetObserver;

exports.SetterObserver = SetterObserver;

exports.SubscriberRecord = SubscriberRecord;

exports.TaggedTemplateExpression = TaggedTemplateExpression;

exports.TemplateExpression = TemplateExpression;

exports.UnaryExpression = UnaryExpression;

exports.ValueConverter = S;

exports.ValueConverterDefinition = ValueConverterDefinition;

exports.ValueConverterExpression = ValueConverterExpression;

exports.alias = v;

exports.applyMutationsToIndices = bt;

exports.bindingBehavior = x;

exports.cloneIndexMap = I;

exports.connectable = te;

exports.copyIndexMap = T;

exports.createIndexMap = j;

exports.disableArrayObservation = vt;

exports.disableMapObservation = qt;

exports.disableSetObservation = $t;

exports.enableArrayObservation = pt;

exports.enableMapObservation = Kt;

exports.enableSetObservation = Lt;

exports.getCollectionObserver = Qr;

exports.isIndexMap = M;

exports.observable = Xr;

exports.parse = fe;

exports.parseExpression = le;

exports.registerAliases = g;

exports.subscriberCollection = F;

exports.synchronizeIndices = wt;

exports.valueConverter = U;

exports.withFlushQueue = q;
//# sourceMappingURL=index.js.map
