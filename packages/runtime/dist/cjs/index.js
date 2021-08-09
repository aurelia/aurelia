"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/kernel");

var e = require("@aurelia/platform");

const r = Object.prototype.hasOwnProperty;

const s = Reflect.defineProperty;

const i = t => "function" === typeof t;

function n(t, e, r) {
    s(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function o(t, e, s, i = false) {
    if (i || !r.call(t, e)) n(t, e, s);
}

const h = () => Object.create(null);

const c = t.Metadata.getOwn;

const u = t.Metadata.hasOwn;

const a = t.Metadata.define;

const l = t.Protocol.annotation.keyFor;

const f = t.Protocol.resource.keyFor;

const d = t.Protocol.resource.appendTo;

function p(...t) {
    return function(e) {
        const r = l("aliases");
        const s = c(r, e);
        if (void 0 === s) a(r, t, e); else s.push(...t);
    };
}

function v(e, r, s, i) {
    for (let n = 0, o = e.length; n < o; ++n) t.Registration.aliasTo(s, r.keyFrom(e[n])).register(i);
}

const g = Object.freeze({});

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
        if (16 & s) return g;
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

const b = t.DI.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = h();
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

function w(t) {
    return function(e) {
        return y.define(t, e);
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
        if ("string" === typeof e) {
            s = e;
            i = {
                name: s
            };
        } else {
            s = e.name;
            i = e;
        }
        const n = Object.getPrototypeOf(r) === BindingInterceptor;
        return new BindingBehaviorDefinition(r, t.firstDefined(E(r, "name"), s), t.mergeArrays(E(r, "aliases"), i.aliases, r.aliases), y.keyFrom(s), t.fromAnnotationOrDefinitionOrTypeOrDefault("strategy", i, r, (() => n ? 2 : 1)));
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
        v(i, y, s, e);
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

const x = f("binding-behavior");

const E = (t, e) => c(l(e), t);

const y = Object.freeze({
    name: x,
    keyFrom(t) {
        return `${x}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && u(x, t);
    },
    define(t, e) {
        const r = BindingBehaviorDefinition.create(t, e);
        a(x, r, r.Type);
        a(x, r, r);
        d(e, x);
        return r.Type;
    },
    getDefinition(t) {
        const e = c(x, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        a(l(e), r, t);
    },
    getAnnotation: E
});

function A(t) {
    return function(e) {
        return O.define(t, e);
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
        if ("string" === typeof e) {
            s = e;
            i = {
                name: s
            };
        } else {
            s = e.name;
            i = e;
        }
        return new ValueConverterDefinition(r, t.firstDefined(m(r, "name"), s), t.mergeArrays(m(r, "aliases"), i.aliases, r.aliases), O.keyFrom(s));
    }
    register(e) {
        const {Type: r, key: s, aliases: i} = this;
        t.Registration.singleton(s, r).register(e);
        t.Registration.aliasTo(s, r).register(e);
        v(i, O, s, e);
    }
}

const U = f("value-converter");

const m = (t, e) => c(l(e), t);

const O = Object.freeze({
    name: U,
    keyFrom: t => `${U}:${t}`,
    isType(t) {
        return "function" === typeof t && u(U, t);
    },
    define(t, e) {
        const r = ValueConverterDefinition.create(t, e);
        a(U, r, r.Type);
        a(U, r, r);
        d(e, U);
        return r.Type;
    },
    getDefinition(t) {
        const e = c(U, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        a(l(e), r, t);
    },
    getAnnotation: m
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
        this.behaviorKey = y.keyFrom(e);
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
        this.converterKey = O.keyFrom(e);
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
                const e = r.get(b);
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
        const i = r.locator.get(b);
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
        const o = C(t, n, this.name);
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
        const o = C(t, i, this.name);
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
    evaluate(e, r, s, i) {
        switch (this.operation) {
          case "&&":
            return this.left.evaluate(e, r, s, i) && this.right.evaluate(e, r, s, i);

          case "||":
            return this.left.evaluate(e, r, s, i) || this.right.evaluate(e, r, s, i);

          case "==":
            return this.left.evaluate(e, r, s, i) == this.right.evaluate(e, r, s, i);

          case "===":
            return this.left.evaluate(e, r, s, i) === this.right.evaluate(e, r, s, i);

          case "!=":
            return this.left.evaluate(e, r, s, i) != this.right.evaluate(e, r, s, i);

          case "!==":
            return this.left.evaluate(e, r, s, i) !== this.right.evaluate(e, r, s, i);

          case "instanceof":
            {
                const t = this.right.evaluate(e, r, s, i);
                if ("function" === typeof t) return this.left.evaluate(e, r, s, i) instanceof t;
                return false;
            }

          case "in":
            {
                const t = this.right.evaluate(e, r, s, i);
                if (t instanceof Object) return this.left.evaluate(e, r, s, i) in t;
                return false;
            }

          case "+":
            {
                const n = this.left.evaluate(e, r, s, i);
                const o = this.right.evaluate(e, r, s, i);
                if ((1 & e) > 0) return n + o;
                if (!n || !o) {
                    if (t.isNumberOrBigInt(n) || t.isNumberOrBigInt(o)) return (n || 0) + (o || 0);
                    if (t.isStringOrDate(n) || t.isStringOrDate(o)) return (n || "") + (o || "");
                }
                return n + o;
            }

          case "-":
            return this.left.evaluate(e, r, s, i) - this.right.evaluate(e, r, s, i);

          case "*":
            return this.left.evaluate(e, r, s, i) * this.right.evaluate(e, r, s, i);

          case "/":
            return this.left.evaluate(e, r, s, i) / this.right.evaluate(e, r, s, i);

          case "%":
            return this.left.evaluate(e, r, s, i) % this.right.evaluate(e, r, s, i);

          case "<":
            return this.left.evaluate(e, r, s, i) < this.right.evaluate(e, r, s, i);

          case ">":
            return this.left.evaluate(e, r, s, i) > this.right.evaluate(e, r, s, i);

          case "<=":
            return this.left.evaluate(e, r, s, i) <= this.right.evaluate(e, r, s, i);

          case ">=":
            return this.left.evaluate(e, r, s, i) >= this.right.evaluate(e, r, s, i);

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

const S = Object.prototype.toString;

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
        switch (S.call(e)) {
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
            throw new Error(`Cannot count ${S.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (S.call(e)) {
          case "[object Array]":
            return B(e, r);

          case "[object Map]":
            return L(e, r);

          case "[object Set]":
            return $(e, r);

          case "[object Number]":
            return k(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${S.call(e)}`);
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

function C(t, e, r) {
    const s = null == e ? null : e[r];
    if ("function" === typeof s) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`AUR0111:${r}`);
}

function B(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function L(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    B(r, e);
}

function $(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    B(r, e);
}

function k(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    B(r, e);
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

var P;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(P || (P = {}));

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

function R(t, e) {
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

function T(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function j(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function I(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function M(t) {
    return null == t ? F : F(t);
}

function F(t) {
    const e = t.prototype;
    s(e, "subs", {
        get: V
    });
    o(e, "subscribe", D);
    o(e, "unsubscribe", N);
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

function V() {
    return n(this, "subs", new SubscriberRecord);
}

function D(t) {
    return this.subs.add(t);
}

function N(t) {
    return this.subs.remove(t);
}

function K(t) {
    return null == t ? q : q(t);
}

function q(t) {
    const e = t.prototype;
    s(e, "queue", {
        get: _
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
            this.i.forEach(H);
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

function _() {
    return FlushQueue.instance;
}

function H(t, e, r) {
    r.delete(t);
    t.flush();
}

class CollectionLengthObserver {
    constructor(t) {
        this.owner = t;
        this.type = 18;
        this.f = 0;
        this.v = this.h = (this.O = t.collection).length;
    }
    getValue() {
        return this.O.length;
    }
    setValue(e, r) {
        const s = this.v;
        if (e !== s && t.isArrayIndex(e)) {
            if (0 === (256 & r)) this.O.length = e;
            this.v = e;
            this.h = s;
            this.f = r;
            this.queue.add(this);
        }
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.O.length;
        if ((this.v = s) !== r) {
            this.h = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        G = this.h;
        this.h = this.v;
        this.subs.notify(this.v, G, this.f);
    }
}

class CollectionSizeObserver {
    constructor(t) {
        this.owner = t;
        this.f = 0;
        this.v = this.h = (this.O = t.collection).size;
        this.type = this.O instanceof Map ? 66 : 34;
    }
    getValue() {
        return this.O.size;
    }
    setValue() {
        throw new Error("AUR02");
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.O.size;
        if ((this.v = s) !== r) {
            this.h = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        G = this.h;
        this.h = this.v;
        this.subs.notify(this.v, G, this.f);
    }
}

function Q(t) {
    const e = t.prototype;
    o(e, "subscribe", z, true);
    o(e, "unsubscribe", W, true);
    K(t);
    M(t);
}

function z(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function W(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

Q(CollectionLengthObserver);

Q(CollectionSizeObserver);

let G;

const Z = new WeakMap;

function J(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function X(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function Y(t, e, r, s, i) {
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

function tt(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, c, u;
    let a, l, f;
    let d, p, v;
    let g, b;
    let w, x, E, y;
    let A, U, m, O;
    while (true) {
        if (s - r <= 10) {
            Y(t, e, r, s, i);
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
            tt(t, e, y, s, i);
            s = E;
        } else {
            tt(t, e, r, E, i);
            r = y;
        }
    }
}

const et = Array.prototype;

const rt = et.push;

const st = et.unshift;

const it = et.pop;

const nt = et.shift;

const ot = et.splice;

const ht = et.reverse;

const ct = et.sort;

const ut = {
    push: rt,
    unshift: st,
    pop: it,
    shift: nt,
    splice: ot,
    reverse: ht,
    sort: ct
};

const at = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const lt = {
    push: function(...t) {
        const e = Z.get(this);
        if (void 0 === e) return rt.apply(this, t);
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
        const e = Z.get(this);
        if (void 0 === e) return st.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        st.apply(e.indexMap, s);
        const n = st.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = Z.get(this);
        if (void 0 === t) return it.call(this);
        const e = t.indexMap;
        const r = it.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        it.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = Z.get(this);
        if (void 0 === t) return nt.call(this);
        const e = t.indexMap;
        const r = nt.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        nt.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = Z.get(this);
        if (void 0 === s) return ot.apply(this, t);
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
            ot.call(h, e, r, ...s);
        } else ot.apply(h, t);
        const a = ot.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = Z.get(this);
        if (void 0 === t) {
            ht.call(this);
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
        const e = Z.get(this);
        if (void 0 === e) {
            ct.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        tt(this, e.indexMap, 0, r, X);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || "function" !== typeof t) t = J;
        tt(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of at) s(lt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let ft = false;

function dt() {
    for (const t of at) if (true !== et[t].observing) n(et, t, lt[t]);
}

function pt() {
    for (const t of at) if (true === et[t].observing) n(et, t, ut[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!ft) {
            ft = true;
            dt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = T(t.length);
        this.lenObs = void 0;
        Z.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = T(e);
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

M(ArrayObserver);

M(ArrayIndexObserver);

function vt(t) {
    let e = Z.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function gt(t) {
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

function bt(t, e) {
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

const wt = new WeakMap;

const xt = Set.prototype;

const Et = xt.add;

const yt = xt.clear;

const At = xt.delete;

const Ut = {
    add: Et,
    clear: yt,
    delete: At
};

const mt = [ "add", "clear", "delete" ];

const Ot = {
    add: function(t) {
        const e = wt.get(this);
        if (void 0 === e) {
            Et.call(this, t);
            return this;
        }
        const r = this.size;
        Et.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = wt.get(this);
        if (void 0 === t) return yt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            yt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = wt.get(this);
        if (void 0 === e) return At.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = At.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const St = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of mt) s(Ot[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Ct = false;

function Bt() {
    for (const t of mt) if (true !== xt[t].observing) s(xt, t, {
        ...St,
        value: Ot[t]
    });
}

function Lt() {
    for (const t of mt) if (true === xt[t].observing) s(xt, t, {
        ...St,
        value: Ut[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Ct) {
            Ct = true;
            Bt();
        }
        this.collection = t;
        this.indexMap = T(t.size);
        this.lenObs = void 0;
        wt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = T(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

M(SetObserver);

function $t(t) {
    let e = wt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const kt = new WeakMap;

const Pt = Map.prototype;

const Rt = Pt.set;

const Tt = Pt.clear;

const jt = Pt.delete;

const It = {
    set: Rt,
    clear: Tt,
    delete: jt
};

const Mt = [ "set", "clear", "delete" ];

const Ft = {
    set: function(t, e) {
        const r = kt.get(this);
        if (void 0 === r) {
            Rt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        Rt.call(this, t, e);
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
        const t = kt.get(this);
        if (void 0 === t) return Tt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Tt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = kt.get(this);
        if (void 0 === e) return jt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = jt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const Vt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Mt) s(Ft[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Dt = false;

function Nt() {
    for (const t of Mt) if (true !== Pt[t].observing) s(Pt, t, {
        ...Vt,
        value: Ft[t]
    });
}

function Kt() {
    for (const t of Mt) if (true === Pt[t].observing) s(Pt, t, {
        ...Vt,
        value: It[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!Dt) {
            Dt = true;
            Nt();
        }
        this.collection = t;
        this.indexMap = T(t.size);
        this.lenObs = void 0;
        kt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = T(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

M(MapObserver);

function qt(t) {
    let e = kt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function _t(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function Ht() {
    return n(this, "obs", new BindingObserverRecord(this));
}

function Qt(t) {
    let e;
    if (t instanceof Array) e = vt(t); else if (t instanceof Set) e = $t(t); else if (t instanceof Map) e = qt(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function zt(t) {
    this.obs.add(t);
}

function Wt() {
    throw new Error(`AUR2011:handleChange`);
}

function Gt() {
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
        this.o.forEach(Jt, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(Zt, this);
        this.o.clear();
        this.count = 0;
    }
}

function Zt(t, e) {
    e.unsubscribe(this);
}

function Jt(t, e) {
    if (this.version !== t) {
        e.unsubscribe(this);
        this.o.delete(e);
    }
}

function Xt(t) {
    const e = t.prototype;
    o(e, "observe", _t, true);
    o(e, "observeCollection", Qt, true);
    o(e, "subscribeTo", zt, true);
    s(e, "obs", {
        get: Ht
    });
    o(e, "handleChange", Wt);
    o(e, "handleCollectionChange", Gt);
    return t;
}

function Yt(t) {
    return null == t ? Xt : Xt(t);
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

Xt(BindingMediator);

const te = t.DI.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.u = h();
        this.l = h();
        this.g = h();
    }
    parse(t, e) {
        let r;
        switch (e) {
          case 16:
            return new CustomExpression(t);

          case 1:
            r = this.g[t];
            if (void 0 === r) r = this.g[t] = this.$parse(t, e);
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
        ue.ip = t;
        ue.length = t.length;
        ue.index = 0;
        ue.A = t.charCodeAt(0);
        return le(ue, 0, 61, void 0 === e ? 8 : e);
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

function ee(t) {
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

var re;

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
})(re || (re = {}));

const se = PrimitiveLiteralExpression.$false;

const ie = PrimitiveLiteralExpression.$true;

const ne = PrimitiveLiteralExpression.$null;

const oe = PrimitiveLiteralExpression.$undefined;

const he = AccessThisExpression.$this;

const ce = AccessThisExpression.$parent;

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
        this.U = 0;
        this.C = 0;
        this.B = 1572864;
        this.L = "";
        this.$ = true;
        this.length = t.length;
        this.A = t.charCodeAt(0);
    }
    get k() {
        return this.ip.slice(this.U, this.index);
    }
}

const ue = new ParserState("");

function ae(t, e) {
    ue.ip = t;
    ue.length = t.length;
    ue.index = 0;
    ue.A = t.charCodeAt(0);
    return le(ue, 0, 61, void 0 === e ? 8 : e);
}

function le(t, e, r, s) {
    if (16 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (1 & s) return ve(t);
        be(t);
        if (1048576 & t.B) throw new Error(`AUR0151:${t.ip}`);
    }
    t.$ = 448 > r;
    let i;
    if (32768 & t.B) {
        const r = Se[63 & t.B];
        be(t);
        i = new UnaryExpression(r, le(t, e, 449, s));
        t.$ = false;
    } else {
        t: switch (t.B) {
          case 3078:
            t.$ = false;
            do {
                be(t);
                e++;
                if (me(t, 16393)) {
                    if (16393 === t.B) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.B) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.B) {
                    const t = 511 & e;
                    i = 0 === t ? he : 1 === t ? ce : new AccessThisExpression(t);
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
            be(t);
            break;

          case 3076:
            t.$ = false;
            be(t);
            i = he;
            e = 512;
            break;

          case 671751:
            be(t);
            i = le(t, 0, 62, s);
            Oe(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = fe(t, e, s);
            e = 0;
            break;

          case 131080:
            i = pe(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.L ]);
            t.$ = false;
            be(t);
            e = 0;
            break;

          case 540715:
            i = ge(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.L);
            t.$ = false;
            be(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = Se[63 & t.B];
            t.$ = false;
            be(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (2 & s) return de(t, i);
        if (449 < r) return i;
        let n = t.L;
        while ((16384 & t.B) > 0) {
            const r = [];
            let o;
            switch (t.B) {
              case 16393:
                t.$ = true;
                be(t);
                if (0 === (3072 & t.B)) throw new Error(`AUR0153:${t.ip}`);
                n = t.L;
                be(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.B) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.$ = true;
                be(t);
                e = 4096;
                i = new AccessKeyedExpression(i, le(t, 0, 62, s));
                Oe(t, 1835022);
                break;

              case 671751:
                t.$ = false;
                be(t);
                while (1835019 !== t.B) {
                    r.push(le(t, 0, 62, s));
                    if (!me(t, 1572876)) break;
                }
                Oe(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.$ = false;
                o = [ t.L ];
                i = new TaggedTemplateExpression(o, o, i);
                be(t);
                break;

              case 540715:
                i = ge(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.B) > 0) {
        const n = t.B;
        if ((448 & n) <= r) break;
        be(t);
        i = new BinaryExpression(Se[63 & n], i, le(t, e, 448 & n, s));
        t.$ = false;
    }
    if (63 < r) return i;
    if (me(t, 1572880)) {
        const r = le(t, e, 62, s);
        Oe(t, 1572879);
        i = new ConditionalExpression(i, r, le(t, e, 62, s));
        t.$ = false;
    }
    if (62 < r) return i;
    if (me(t, 1048616)) {
        if (!t.$) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, le(t, e, 62, s));
    }
    if (61 < r) return i;
    while (me(t, 1572884)) {
        if (1572864 === t.B) throw new Error(`AUR0159:${t.ip}`);
        const r = t.L;
        be(t);
        const n = new Array;
        while (me(t, 1572879)) n.push(le(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (me(t, 1572883)) {
        if (1572864 === t.B) throw new Error(`AUR0160:${t.ip}`);
        const r = t.L;
        be(t);
        const n = new Array;
        while (me(t, 1572879)) n.push(le(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.B) {
        if (1 & s) return i;
        if ("of" === t.k) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function fe(t, e, r) {
    be(t);
    const s = new Array;
    while (1835022 !== t.B) if (me(t, 1572876)) {
        s.push(oe);
        if (1835022 === t.B) break;
    } else {
        s.push(le(t, e, 62, ~2 & r));
        if (me(t, 1572876)) {
            if (1835022 === t.B) break;
        } else break;
    }
    Oe(t, 1835022);
    if (2 & r) return new ArrayBindingPattern(s); else {
        t.$ = false;
        return new ArrayLiteralExpression(s);
    }
}

function de(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.B) throw new Error(`AUR0163:${t.ip}`);
    be(t);
    const r = e;
    const s = le(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function pe(t, e) {
    const r = new Array;
    const s = new Array;
    be(t);
    while (1835018 !== t.B) {
        r.push(t.L);
        if (12288 & t.B) {
            be(t);
            Oe(t, 1572879);
            s.push(le(t, 0, 62, ~2 & e));
        } else if (3072 & t.B) {
            const {A: r, B: i, index: n} = t;
            be(t);
            if (me(t, 1572879)) s.push(le(t, 0, 62, ~2 & e)); else {
                t.A = r;
                t.B = i;
                t.index = n;
                s.push(le(t, 0, 450, ~2 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.B) Oe(t, 1572876);
    }
    Oe(t, 1835018);
    if (2 & e) return new ObjectBindingPattern(r, s); else {
        t.$ = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function ve(t) {
    const e = [];
    const r = [];
    const s = t.length;
    let i = "";
    while (t.index < s) {
        switch (t.A) {
          case 36:
            if (123 === t.ip.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.A = t.ip.charCodeAt(t.index);
                be(t);
                const s = le(t, 0, 61, 1);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(ee(we(t)));
            break;

          default:
            i += String.fromCharCode(t.A);
        }
        we(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function ge(t, e, r, s, i) {
    const n = [ t.L ];
    Oe(t, 540715);
    const o = [ le(t, e, 62, r) ];
    while (540714 !== (t.B = Ue(t))) {
        n.push(t.L);
        Oe(t, 540715);
        o.push(le(t, e, 62, r));
    }
    n.push(t.L);
    t.$ = false;
    if (i) {
        be(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        be(t);
        return new TemplateExpression(n, o);
    }
}

function be(t) {
    while (t.index < t.length) {
        t.U = t.index;
        if (null != (t.B = Te[t.A](t))) return;
    }
    t.B = 1572864;
}

function we(t) {
    return t.A = t.ip.charCodeAt(++t.index);
}

function xe(t) {
    while (Re[we(t)]) ;
    const e = Ce[t.L = t.k];
    return void 0 === e ? 1024 : e;
}

function Ee(t, e) {
    let r = t.A;
    if (false === e) {
        do {
            r = we(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.L = parseInt(t.k, 10);
            return 8192;
        }
        r = we(t);
        if (t.index >= t.length) {
            t.L = parseInt(t.k.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = we(t);
    } while (r <= 57 && r >= 48); else t.A = t.ip.charCodeAt(--t.index);
    t.L = parseFloat(t.k);
    return 8192;
}

function ye(t) {
    const e = t.A;
    we(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.A !== e) if (92 === t.A) {
        s.push(t.ip.slice(i, t.index));
        we(t);
        r = ee(t.A);
        we(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else we(t);
    const n = t.ip.slice(i, t.index);
    we(t);
    s.push(n);
    const o = s.join("");
    t.L = o;
    return 4096;
}

function Ae(t) {
    let e = true;
    let r = "";
    while (96 !== we(t)) if (36 === t.A) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.A) r += String.fromCharCode(ee(we(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.A);
    }
    we(t);
    t.L = r;
    if (e) return 540714;
    return 540715;
}

function Ue(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return Ae(t);
}

function me(t, e) {
    if (t.B === e) {
        be(t);
        return true;
    }
    return false;
}

function Oe(t, e) {
    if (t.B === e) be(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const Se = [ se, ie, ne, oe, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Ce = h();

Ce.true = 2049;

Ce.null = 2050;

Ce.false = 2048;

Ce.undefined = 2051;

Ce.$this = 3076;

Ce.$parent = 3078;

Ce.in = 1640799;

Ce.instanceof = 1640800;

Ce.typeof = 34851;

Ce.void = 34852;

Ce.of = 1051180;

const Be = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Le(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function $e(t) {
    return e => {
        we(e);
        return t;
    };
}

const ke = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

ke.notMapped = true;

const Pe = new Set;

Le(null, Pe, Be.AsciiIdPart, true);

const Re = new Uint8Array(65535);

Le(Re, null, Be.IdStart, 1);

Le(Re, null, Be.Digit, 1);

const Te = new Array(65535);

Te.fill(ke, 0, 65535);

Le(Te, null, Be.Skip, (t => {
    we(t);
    return null;
}));

Le(Te, null, Be.IdStart, xe);

Le(Te, null, Be.Digit, (t => Ee(t, false)));

Te[34] = Te[39] = t => ye(t);

Te[96] = t => Ae(t);

Te[33] = t => {
    if (61 !== we(t)) return 32809;
    if (61 !== we(t)) return 1638680;
    we(t);
    return 1638682;
};

Te[61] = t => {
    if (61 !== we(t)) return 1048616;
    if (61 !== we(t)) return 1638679;
    we(t);
    return 1638681;
};

Te[38] = t => {
    if (38 !== we(t)) return 1572883;
    we(t);
    return 1638614;
};

Te[124] = t => {
    if (124 !== we(t)) return 1572884;
    we(t);
    return 1638549;
};

Te[46] = t => {
    if (we(t) <= 57 && t.A >= 48) return Ee(t, true);
    return 16393;
};

Te[60] = t => {
    if (61 !== we(t)) return 1638747;
    we(t);
    return 1638749;
};

Te[62] = t => {
    if (61 !== we(t)) return 1638748;
    we(t);
    return 1638750;
};

Te[37] = $e(1638886);

Te[40] = $e(671751);

Te[41] = $e(1835019);

Te[42] = $e(1638885);

Te[43] = $e(623009);

Te[44] = $e(1572876);

Te[45] = $e(623010);

Te[47] = $e(1638887);

Te[58] = $e(1572879);

Te[63] = $e(1572880);

Te[91] = $e(671757);

Te[93] = $e(1835022);

Te[123] = $e(131080);

Te[125] = $e(1835018);

let je = null;

const Ie = [];

let Me = false;

function Fe() {
    Me = false;
}

function Ve() {
    Me = true;
}

function De() {
    return je;
}

function Ne(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == je) {
        je = t;
        Ie[0] = je;
        Me = true;
        return;
    }
    if (je === t) throw new Error("AUR0207");
    Ie.push(je);
    je = t;
    Me = true;
}

function Ke(t) {
    if (null == t) throw new Error("AUR0208");
    if (je !== t) throw new Error("AUR0209");
    Ie.pop();
    je = Ie.length > 0 ? Ie[Ie.length - 1] : null;
    Me = null != je;
}

const qe = Object.freeze({
    get current() {
        return je;
    },
    get connecting() {
        return Me;
    },
    enter: Ne,
    exit: Ke,
    pause: Fe,
    resume: Ve
});

const _e = Reflect.get;

const He = Object.prototype.toString;

const Qe = new WeakMap;

function ze(t) {
    switch (He.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const We = "__raw__";

function Ge(t) {
    return ze(t) ? Ze(t) : t;
}

function Ze(t) {
    var e;
    return null !== (e = Qe.get(t)) && void 0 !== e ? e : tr(t);
}

function Je(t) {
    var e;
    return null !== (e = t[We]) && void 0 !== e ? e : t;
}

function Xe(t) {
    return ze(t) && t[We] || t;
}

function Ye(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function tr(t) {
    const e = t instanceof Array ? rr : t instanceof Map || t instanceof Set ? Or : er;
    const r = new Proxy(t, e);
    Qe.set(t, r);
    return r;
}

const er = {
    get(t, e, r) {
        if (e === We) return t;
        const s = De();
        if (!Me || Ye(e) || null == s) return _e(t, e, r);
        s.observe(t, e);
        return Ge(_e(t, e, r));
    }
};

const rr = {
    get(t, e, r) {
        if (e === We) return t;
        const s = De();
        if (!Me || Ye(e) || null == s) return _e(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return sr;

          case "includes":
            return or;

          case "indexOf":
            return hr;

          case "lastIndexOf":
            return cr;

          case "every":
            return ir;

          case "filter":
            return nr;

          case "find":
            return ar;

          case "findIndex":
            return ur;

          case "flat":
            return lr;

          case "flatMap":
            return fr;

          case "join":
            return dr;

          case "push":
            return vr;

          case "pop":
            return pr;

          case "reduce":
            return Ur;

          case "reduceRight":
            return mr;

          case "reverse":
            return xr;

          case "shift":
            return gr;

          case "unshift":
            return br;

          case "slice":
            return Ar;

          case "splice":
            return wr;

          case "some":
            return Er;

          case "sort":
            return yr;

          case "keys":
            return Rr;

          case "values":
          case Symbol.iterator:
            return Tr;

          case "entries":
            return jr;
        }
        s.observe(t, e);
        return Ge(_e(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = De()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function sr(t, e) {
    var r;
    const s = Je(this);
    const i = s.map(((r, s) => Xe(t.call(e, Ge(r), s, this))));
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ge(i);
}

function ir(t, e) {
    var r;
    const s = Je(this);
    const i = s.every(((r, s) => t.call(e, Ge(r), s, this)));
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function nr(t, e) {
    var r;
    const s = Je(this);
    const i = s.filter(((r, s) => Xe(t.call(e, Ge(r), s, this))));
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ge(i);
}

function or(t) {
    var e;
    const r = Je(this);
    const s = r.includes(Xe(t));
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function hr(t) {
    var e;
    const r = Je(this);
    const s = r.indexOf(Xe(t));
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function cr(t) {
    var e;
    const r = Je(this);
    const s = r.lastIndexOf(Xe(t));
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function ur(t, e) {
    var r;
    const s = Je(this);
    const i = s.findIndex(((r, s) => Xe(t.call(e, Ge(r), s, this))));
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function ar(t, e) {
    var r;
    const s = Je(this);
    const i = s.find(((e, r) => t(Ge(e), r, this)), e);
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ge(i);
}

function lr() {
    var t;
    const e = Je(this);
    null === (t = De()) || void 0 === t ? void 0 : t.observeCollection(e);
    return Ge(e.flat());
}

function fr(t, e) {
    var r;
    const s = Je(this);
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ze(s.flatMap(((r, s) => Ge(t.call(e, Ge(r), s, this)))));
}

function dr(t) {
    var e;
    const r = Je(this);
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function pr() {
    return Ge(Je(this).pop());
}

function vr(...t) {
    return Je(this).push(...t);
}

function gr() {
    return Ge(Je(this).shift());
}

function br(...t) {
    return Je(this).unshift(...t);
}

function wr(...t) {
    return Ge(Je(this).splice(...t));
}

function xr(...t) {
    var e;
    const r = Je(this);
    const s = r.reverse();
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ge(s);
}

function Er(t, e) {
    var r;
    const s = Je(this);
    const i = s.some(((r, s) => Xe(t.call(e, Ge(r), s, this))));
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function yr(t) {
    var e;
    const r = Je(this);
    const s = r.sort(t);
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ge(s);
}

function Ar(t, e) {
    var r;
    const s = Je(this);
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ze(s.slice(t, e));
}

function Ur(t, e) {
    var r;
    const s = Je(this);
    const i = s.reduce(((e, r, s) => t(e, Ge(r), s, this)), e);
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ge(i);
}

function mr(t, e) {
    var r;
    const s = Je(this);
    const i = s.reduceRight(((e, r, s) => t(e, Ge(r), s, this)), e);
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ge(i);
}

const Or = {
    get(t, e, r) {
        if (e === We) return t;
        const s = De();
        if (!Me || Ye(e) || null == s) return _e(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return kr;

          case "delete":
            return Pr;

          case "forEach":
            return Sr;

          case "add":
            if (t instanceof Set) return $r;
            break;

          case "get":
            if (t instanceof Map) return Br;
            break;

          case "set":
            if (t instanceof Map) return Lr;
            break;

          case "has":
            return Cr;

          case "keys":
            return Rr;

          case "values":
            return Tr;

          case "entries":
            return jr;

          case Symbol.iterator:
            return t instanceof Map ? jr : Tr;
        }
        return Ge(_e(t, e, r));
    }
};

function Sr(t, e) {
    var r;
    const s = Je(this);
    null === (r = De()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, Ge(r), Ge(s), this);
    }));
}

function Cr(t) {
    var e;
    const r = Je(this);
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(Xe(t));
}

function Br(t) {
    var e;
    const r = Je(this);
    null === (e = De()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ge(r.get(Xe(t)));
}

function Lr(t, e) {
    return Ge(Je(this).set(Xe(t), Xe(e)));
}

function $r(t) {
    return Ge(Je(this).add(Xe(t)));
}

function kr() {
    return Ge(Je(this).clear());
}

function Pr(t) {
    return Ge(Je(this).delete(Xe(t)));
}

function Rr() {
    var t;
    const e = Je(this);
    null === (t = De()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Ge(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Tr() {
    var t;
    const e = Je(this);
    null === (t = De()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Ge(e),
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
    const e = Je(this);
    null === (t = De()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ Ge(e[0]), Ge(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const Ir = Object.freeze({
    getProxy: Ze,
    getRaw: Je,
    wrap: Ge,
    unwrap: Xe,
    rawKey: We
});

class ComputedObserver {
    constructor(t, e, r, s, i) {
        this.interceptor = this;
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.iR = false;
        this.D = false;
        this.O = t;
        this.get = e;
        this.set = r;
        this.uP = s;
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
        if (0 === this.subs.count) return this.get.call(this.O, this);
        if (this.D) {
            this.compute();
            this.D = false;
        }
        return this.v;
    }
    setValue(t, e) {
        if ("function" === typeof this.set) {
            if (t !== this.v) {
                this.iR = true;
                this.set.call(this.O, t);
                this.iR = false;
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
        Mr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Mr, 0);
    }
    run() {
        if (this.iR) return;
        const t = this.v;
        const e = this.compute();
        this.D = false;
        if (!Object.is(e, t)) {
            this.ov = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.iR = true;
        this.obs.version++;
        try {
            Ne(this);
            return this.v = Xe(this.get.call(this.uP ? Ge(this.O) : this.O, this));
        } finally {
            this.obs.clear();
            this.iR = false;
            Ke(this);
        }
    }
}

Yt(ComputedObserver);

M(ComputedObserver);

K(ComputedObserver);

let Mr;

const Fr = t.DI.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Vr = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const Dr = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.P = null;
        this.R = 0;
        this.check = () => {
            if (Vr.disabled) return;
            if (++this.R < Vr.timeoutsPerCheck) return;
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
        if (Vr.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.P = this.p.taskQueue.queueTask(this.check, Dr);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.P.cancel();
            this.P = null;
        }
    }
}

DirtyChecker.inject = [ t.IPlatform ];

K(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = 0;
        this.ov = void 0;
        this.T = t;
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
            this.T.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.T.removeProperty(this);
    }
}

M(DirtyCheckProperty);

class PrimitiveObserver {
    constructor(t, e) {
        this.type = 0;
        this.O = t;
        this.K = e;
    }
    get doNotCache() {
        return true;
    }
    getValue() {
        return this.O[this.K];
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

let Nr;

class SetterObserver {
    constructor(t, e) {
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.iO = false;
        this.f = 0;
        this.O = t;
        this.K = e;
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
        } else this.O[this.K] = t;
    }
    subscribe(t) {
        if (false === this.iO) this.start();
        this.subs.add(t);
    }
    flush() {
        Nr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Nr, this.f);
    }
    start() {
        if (false === this.iO) {
            this.iO = true;
            this.v = this.O[this.K];
            s(this.O, this.K, {
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
            s(this.O, this.K, {
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
        this.O = t;
        this.S = r;
        this.HS = i(r);
        const n = t[e];
        this.cb = i(n) ? n : void 0;
        this.v = s;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        var r;
        if (this.HS) t = this.S(t);
        if (!Object.is(t, this.v)) {
            this.ov = this.v;
            this.v = t;
            this.f = e;
            null === (r = this.cb) || void 0 === r ? void 0 : r.call(this.O, this.v, this.ov, e);
            this.queue.add(this);
        }
    }
    flush() {
        Nr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Nr, this.f);
    }
}

M(SetterObserver);

M(SetterNotifier);

K(SetterObserver);

K(SetterNotifier);

const Kr = new PropertyAccessor;

const qr = t.DI.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const _r = t.DI.createInterface("INodeObserverLocator", (e => e.cachedCallback((e => {
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
        return Kr;
    }
    getAccessor() {
        return Kr;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.T = t;
        this.j = e;
        this.I = [];
    }
    addAdapter(t) {
        this.I.push(t);
    }
    getObserver(t, e) {
        var r, s;
        return null !== (s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== s ? s : this.M(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== s) return s;
        if (this.j.handles(t, e, this)) return this.j.getAccessor(t, e, this);
        return Kr;
    }
    getArrayObserver(t) {
        return vt(t);
    }
    getMapObserver(t) {
        return qt(t);
    }
    getSetObserver(t) {
        return $t(t);
    }
    createObserver(e, s) {
        var i, n, o, h;
        if (!(e instanceof Object)) return new PrimitiveObserver(e, s);
        if (this.j.handles(e, s, this)) return this.j.getObserver(e, s, this);
        switch (s) {
          case "length":
            if (e instanceof Array) return vt(e).getLengthObserver();
            break;

          case "size":
            if (e instanceof Map) return qt(e).getLengthObserver(); else if (e instanceof Set) return $t(e).getLengthObserver();
            break;

          default:
            if (e instanceof Array && t.isArrayIndex(s)) return vt(e).getIndexObserver(Number(s));
            break;
        }
        let c = zr(e, s);
        if (void 0 === c) {
            let t = Qr(e);
            while (null !== t) {
                c = zr(t, s);
                if (void 0 === c) t = Qr(t); else break;
            }
        }
        if (void 0 !== c && !r.call(c, "value")) {
            let t = this.F(e, s, c);
            if (null == t) t = null === (h = null !== (n = null === (i = c.get) || void 0 === i ? void 0 : i.getObserver) && void 0 !== n ? n : null === (o = c.set) || void 0 === o ? void 0 : o.getObserver) || void 0 === h ? void 0 : h(e, this);
            return null == t ? c.configurable ? ComputedObserver.create(e, s, c, this, true) : this.T.createProperty(e, s) : t;
        }
        return new SetterObserver(e, s);
    }
    F(t, e, r) {
        if (this.I.length > 0) for (const s of this.I) {
            const i = s.getObserver(t, e, r, this);
            if (null != i) return i;
        }
        return null;
    }
    M(t, e, r) {
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

ObserverLocator.inject = [ Fr, _r ];

function Hr(t) {
    let e;
    if (t instanceof Array) e = vt(t); else if (t instanceof Map) e = qt(t); else if (t instanceof Set) e = $t(t);
    return e;
}

const Qr = Object.getPrototypeOf;

const zr = Object.getOwnPropertyDescriptor;

const Wr = t.DI.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ qr ];
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
            Ne(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            Ke(this);
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

Yt(Effect);

function Gr(t) {
    if (void 0 === t.$observers) s(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Zr = {};

function Jr(t, e, r) {
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
        let c = Zr;
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
            const s = Xr(this, e, h, c, u);
            null === (r = De()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            Xr(this, e, h, c, u).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return Xr(r, e, h, c, u);
        };
        if (o) s(t.prototype, e, r); else return r;
    }
}

function Xr(t, e, r, s, i) {
    const n = Gr(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === Zr ? void 0 : s);
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

exports.BindingBehavior = y;

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

exports.ConnectableSwitcher = qe;

exports.CustomExpression = CustomExpression;

exports.DirtyCheckProperty = DirtyCheckProperty;

exports.DirtyCheckSettings = Vr;

exports.FlushQueue = FlushQueue;

exports.ForOfStatement = ForOfStatement;

exports.HtmlLiteralExpression = HtmlLiteralExpression;

exports.IDirtyChecker = Fr;

exports.IExpressionParser = te;

exports.INodeObserverLocator = _r;

exports.IObservation = Wr;

exports.IObserverLocator = qr;

exports.ISignaler = b;

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

exports.ProxyObservable = Ir;

exports.Scope = Scope;

exports.SetObserver = SetObserver;

exports.SetterObserver = SetterObserver;

exports.SubscriberRecord = SubscriberRecord;

exports.TaggedTemplateExpression = TaggedTemplateExpression;

exports.TemplateExpression = TemplateExpression;

exports.UnaryExpression = UnaryExpression;

exports.ValueConverter = O;

exports.ValueConverterDefinition = ValueConverterDefinition;

exports.ValueConverterExpression = ValueConverterExpression;

exports.alias = p;

exports.applyMutationsToIndices = gt;

exports.bindingBehavior = w;

exports.cloneIndexMap = j;

exports.connectable = Yt;

exports.copyIndexMap = R;

exports.createIndexMap = T;

exports.disableArrayObservation = pt;

exports.disableMapObservation = Kt;

exports.disableSetObservation = Lt;

exports.enableArrayObservation = dt;

exports.enableMapObservation = Nt;

exports.enableSetObservation = Bt;

exports.getCollectionObserver = Hr;

exports.isIndexMap = I;

exports.observable = Jr;

exports.parse = le;

exports.parseExpression = ae;

exports.registerAliases = v;

exports.subscriberCollection = M;

exports.synchronizeIndices = bt;

exports.valueConverter = A;

exports.withFlushQueue = K;
//# sourceMappingURL=index.js.map
