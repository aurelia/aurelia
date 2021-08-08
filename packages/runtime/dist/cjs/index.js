"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/kernel");

var e = require("@aurelia/platform");

const r = t.Metadata.getOwn;

const s = t.Metadata.hasOwn;

const i = t.Metadata.define;

const n = t.Protocol.annotation.keyFor;

const o = t.Protocol.resource.keyFor;

const h = t.Protocol.resource.appendTo;

function u(...t) {
    return function(e) {
        const s = n("aliases");
        const o = r(s, e);
        if (void 0 === o) i(s, t, e); else o.push(...t);
    };
}

function c(e, r, s, i) {
    for (let n = 0, o = e.length; n < o; ++n) t.Registration.aliasTo(s, r.keyFrom(e[n])).register(i);
}

const a = Object.freeze({});

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
        if (16 & s) return a;
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

const l = t.DI.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = Object.create(null);
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

function f(t) {
    return function(e) {
        return v.define(t, e);
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
        return new BindingBehaviorDefinition(r, t.firstDefined(p(r, "name"), s), t.mergeArrays(p(r, "aliases"), i.aliases, r.aliases), v.keyFrom(s), t.fromAnnotationOrDefinitionOrTypeOrDefault("strategy", i, r, (() => n ? 2 : 1)));
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
        c(i, v, s, e);
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

const d = o("binding-behavior");

const p = (t, e) => r(n(e), t);

const v = Object.freeze({
    name: d,
    keyFrom(t) {
        return `${d}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && s(d, t);
    },
    define(t, e) {
        const r = BindingBehaviorDefinition.create(t, e);
        i(d, r, r.Type);
        i(d, r, r);
        h(e, d);
        return r.Type;
    },
    getDefinition(t) {
        const e = r(d, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        i(n(e), r, t);
    },
    getAnnotation: p
});

function g(t) {
    return function(e) {
        return x.define(t, e);
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
        return new ValueConverterDefinition(r, t.firstDefined(w(r, "name"), s), t.mergeArrays(w(r, "aliases"), i.aliases, r.aliases), x.keyFrom(s));
    }
    register(e) {
        const {Type: r, key: s, aliases: i} = this;
        t.Registration.singleton(s, r).register(e);
        t.Registration.aliasTo(s, r).register(e);
        c(i, x, s, e);
    }
}

const b = o("value-converter");

const w = (t, e) => r(n(e), t);

const x = Object.freeze({
    name: b,
    keyFrom: t => `${b}:${t}`,
    isType(t) {
        return "function" === typeof t && s(b, t);
    },
    define(t, e) {
        const r = ValueConverterDefinition.create(t, e);
        i(b, r, r.Type);
        i(b, r, r);
        h(e, b);
        return r.Type;
    },
    getDefinition(t) {
        const e = r(b, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        i(n(e), r, t);
    },
    getAnnotation: w
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
        this.behaviorKey = v.keyFrom(e);
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
        this.converterKey = x.keyFrom(e);
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
                const e = r.get(l);
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
        const i = r.locator.get(l);
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
        const o = E(t, n, this.name);
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
        const o = E(t, i, this.name);
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

const m = Object.prototype.toString;

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
        switch (m.call(e)) {
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
            throw new Error(`Cannot count ${m.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (m.call(e)) {
          case "[object Array]":
            return y(e, r);

          case "[object Map]":
            return A(e, r);

          case "[object Set]":
            return U(e, r);

          case "[object Number]":
            return O(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${m.call(e)}`);
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

function E(t, e, r) {
    const s = null == e ? null : e[r];
    if ("function" === typeof s) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`AUR0111:${r}`);
}

function y(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function A(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    y(r, e);
}

function U(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    y(r, e);
}

function O(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    y(r, e);
}

const C = Object.prototype.hasOwnProperty;

const S = Reflect.defineProperty;

const B = t => "function" === typeof t;

function L(t, e, r) {
    S(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function $(t, e, r, s = false) {
    if (s || !C.call(t, e)) L(t, e, r);
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

var k;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(k || (k = {}));

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

function P(t, e) {
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

function R(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function j(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function I(t) {
    return null == t ? M : M(t);
}

function M(t) {
    const e = t.prototype;
    S(e, "subs", {
        get: F
    });
    $(e, "subscribe", V);
    $(e, "unsubscribe", D);
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

function F() {
    return L(this, "subs", new SubscriberRecord);
}

function V(t) {
    return this.subs.add(t);
}

function D(t) {
    return this.subs.remove(t);
}

function N(t) {
    return null == t ? K : K(t);
}

function K(t) {
    const e = t.prototype;
    S(e, "queue", {
        get: q
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
            this.i.forEach(_);
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

function q() {
    return FlushQueue.instance;
}

function _(t, e, r) {
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
        z = this.h;
        this.h = this.v;
        this.subs.notify(this.v, z, this.f);
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
        z = this.h;
        this.h = this.v;
        this.subs.notify(this.v, z, this.f);
    }
}

function H(t) {
    const e = t.prototype;
    $(e, "subscribe", Q, true);
    $(e, "unsubscribe", W, true);
    N(t);
    I(t);
}

function Q(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function W(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

H(CollectionLengthObserver);

H(CollectionSizeObserver);

let z;

const G = new WeakMap;

function Z(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function J(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function X(t, e, r, s, i) {
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

function Y(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, u, c;
    let a, l, f;
    let d, p, v;
    let g, b;
    let w, x, m, E;
    let y, A, U, O;
    while (true) {
        if (s - r <= 10) {
            X(t, e, r, s, i);
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
        p = i(h, c);
        if (p >= 0) {
            g = h;
            b = a;
            h = c;
            a = f;
            c = u;
            f = l;
            u = g;
            l = b;
        } else {
            v = i(u, c);
            if (v > 0) {
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
        x = l;
        m = r + 1;
        E = s - 1;
        t[n] = t[m];
        e[n] = e[m];
        t[m] = w;
        e[m] = x;
        t: for (o = m + 1; o < E; o++) {
            y = t[o];
            A = e[o];
            U = i(y, w);
            if (U < 0) {
                t[o] = t[m];
                e[o] = e[m];
                t[m] = y;
                e[m] = A;
                m++;
            } else if (U > 0) {
                do {
                    E--;
                    if (E == o) break t;
                    O = t[E];
                    U = i(O, w);
                } while (U > 0);
                t[o] = t[E];
                e[o] = e[E];
                t[E] = y;
                e[E] = A;
                if (U < 0) {
                    y = t[o];
                    A = e[o];
                    t[o] = t[m];
                    e[o] = e[m];
                    t[m] = y;
                    e[m] = A;
                    m++;
                }
            }
        }
        if (s - E < m - r) {
            Y(t, e, E, s, i);
            s = m;
        } else {
            Y(t, e, r, m, i);
            r = E;
        }
    }
}

const tt = Array.prototype;

const et = tt.push;

const rt = tt.unshift;

const st = tt.pop;

const it = tt.shift;

const nt = tt.splice;

const ot = tt.reverse;

const ht = tt.sort;

const ut = {
    push: et,
    unshift: rt,
    pop: st,
    shift: it,
    splice: nt,
    reverse: ot,
    sort: ht
};

const ct = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const at = {
    push: function(...t) {
        const e = G.get(this);
        if (void 0 === e) return et.apply(this, t);
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
        const e = G.get(this);
        if (void 0 === e) return rt.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        rt.apply(e.indexMap, s);
        const n = rt.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = G.get(this);
        if (void 0 === t) return st.call(this);
        const e = t.indexMap;
        const r = st.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        st.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = G.get(this);
        if (void 0 === t) return it.call(this);
        const e = t.indexMap;
        const r = it.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        it.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = G.get(this);
        if (void 0 === s) return nt.apply(this, t);
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
            nt.call(h, e, r, ...s);
        } else nt.apply(h, t);
        const a = nt.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = G.get(this);
        if (void 0 === t) {
            ot.call(this);
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
        const e = G.get(this);
        if (void 0 === e) {
            ht.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        Y(this, e.indexMap, 0, r, J);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || "function" !== typeof t) t = Z;
        Y(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of ct) S(at[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let lt = false;

function ft() {
    for (const t of ct) if (true !== tt[t].observing) L(tt, t, at[t]);
}

function dt() {
    for (const t of ct) if (true === tt[t].observing) L(tt, t, ut[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!lt) {
            lt = true;
            ft();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = T(t.length);
        this.lenObs = void 0;
        G.set(t, this);
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

I(ArrayObserver);

I(ArrayIndexObserver);

function pt(t) {
    let e = G.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function vt(t) {
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

function gt(t, e) {
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

const bt = new WeakMap;

const wt = Set.prototype;

const xt = wt.add;

const mt = wt.clear;

const Et = wt.delete;

const yt = {
    add: xt,
    clear: mt,
    delete: Et
};

const At = [ "add", "clear", "delete" ];

const Ut = {
    add: function(t) {
        const e = bt.get(this);
        if (void 0 === e) {
            xt.call(this, t);
            return this;
        }
        const r = this.size;
        xt.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = bt.get(this);
        if (void 0 === t) return mt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            mt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = bt.get(this);
        if (void 0 === e) return Et.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Et.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const Ot = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of At) S(Ut[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Ct = false;

function St() {
    for (const t of At) if (true !== wt[t].observing) S(wt, t, {
        ...Ot,
        value: Ut[t]
    });
}

function Bt() {
    for (const t of At) if (true === wt[t].observing) S(wt, t, {
        ...Ot,
        value: yt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Ct) {
            Ct = true;
            St();
        }
        this.collection = t;
        this.indexMap = T(t.size);
        this.lenObs = void 0;
        bt.set(t, this);
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

I(SetObserver);

function Lt(t) {
    let e = bt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const $t = new WeakMap;

const kt = Map.prototype;

const Pt = kt.set;

const Tt = kt.clear;

const Rt = kt.delete;

const jt = {
    set: Pt,
    clear: Tt,
    delete: Rt
};

const It = [ "set", "clear", "delete" ];

const Mt = {
    set: function(t, e) {
        const r = $t.get(this);
        if (void 0 === r) {
            Pt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        Pt.call(this, t, e);
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
        const t = $t.get(this);
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
        const e = $t.get(this);
        if (void 0 === e) return Rt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Rt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const Ft = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of It) S(Mt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Vt = false;

function Dt() {
    for (const t of It) if (true !== kt[t].observing) S(kt, t, {
        ...Ft,
        value: Mt[t]
    });
}

function Nt() {
    for (const t of It) if (true === kt[t].observing) S(kt, t, {
        ...Ft,
        value: jt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!Vt) {
            Vt = true;
            Dt();
        }
        this.collection = t;
        this.indexMap = T(t.size);
        this.lenObs = void 0;
        $t.set(t, this);
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

I(MapObserver);

function Kt(t) {
    let e = $t.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function qt(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function _t() {
    return L(this, "obs", new BindingObserverRecord(this));
}

function Ht(t) {
    let e;
    if (t instanceof Array) e = pt(t); else if (t instanceof Set) e = Lt(t); else if (t instanceof Map) e = Kt(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function Qt(t) {
    this.obs.add(t);
}

function Wt() {
    throw new Error(`AUR2011:handleChange`);
}

function zt() {
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
        this.o.forEach(Zt, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(Gt, this);
        this.o.clear();
        this.count = 0;
    }
}

function Gt(t, e) {
    e.unsubscribe(this);
}

function Zt(t, e) {
    if (this.version !== t) {
        e.unsubscribe(this);
        this.o.delete(e);
    }
}

function Jt(t) {
    const e = t.prototype;
    $(e, "observe", qt, true);
    $(e, "observeCollection", Ht, true);
    $(e, "subscribeTo", Qt, true);
    S(e, "obs", {
        get: _t
    });
    $(e, "handleChange", Wt);
    $(e, "handleCollectionChange", zt);
    return t;
}

function Xt(t) {
    return null == t ? Jt : Jt(t);
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

Jt(BindingMediator);

const Yt = t.DI.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.expressionLookup = Object.create(null);
        this.forOfLookup = Object.create(null);
        this.interpolationLookup = Object.create(null);
    }
    parse(t, e) {
        switch (e) {
          case 2048:
            {
                let r = this.interpolationLookup[t];
                if (void 0 === r) r = this.interpolationLookup[t] = this.$parse(t, e);
                return r;
            }

          case 539:
            {
                let r = this.forOfLookup[t];
                if (void 0 === r) r = this.forOfLookup[t] = this.$parse(t, e);
                return r;
            }

          default:
            {
                if (0 === t.length && e & (53 | 49 | 50)) return PrimitiveLiteralExpression.$empty;
                let r = this.expressionLookup[t];
                if (void 0 === r) r = this.expressionLookup[t] = this.$parse(t, e);
                return r;
            }
        }
    }
    $parse(t, e) {
        ue.ip = t;
        ue.length = t.length;
        ue.index = 0;
        ue.u = t.charCodeAt(0);
        return ae(ue, 0, 61, void 0 === e ? 53 : e);
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

function te(t) {
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

var ee;

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
})(ee || (ee = {}));

const re = PrimitiveLiteralExpression.$false;

const se = PrimitiveLiteralExpression.$true;

const ie = PrimitiveLiteralExpression.$null;

const ne = PrimitiveLiteralExpression.$undefined;

const oe = AccessThisExpression.$this;

const he = AccessThisExpression.$parent;

exports.BindingType = void 0;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["IgnoreAttr"] = 4096] = "IgnoreAttr";
    t[t["Interpolation"] = 2048] = "Interpolation";
    t[t["IsRef"] = 5376] = "IsRef";
    t[t["IsIterator"] = 512] = "IsIterator";
    t[t["IsCustom"] = 256] = "IsCustom";
    t[t["IsFunction"] = 128] = "IsFunction";
    t[t["IsEvent"] = 64] = "IsEvent";
    t[t["IsProperty"] = 32] = "IsProperty";
    t[t["IsCommand"] = 16] = "IsCommand";
    t[t["IsPropertyCommand"] = 48] = "IsPropertyCommand";
    t[t["IsEventCommand"] = 80] = "IsEventCommand";
    t[t["DelegationStrategyDelta"] = 6] = "DelegationStrategyDelta";
    t[t["Command"] = 15] = "Command";
    t[t["OneTimeCommand"] = 49] = "OneTimeCommand";
    t[t["ToViewCommand"] = 50] = "ToViewCommand";
    t[t["FromViewCommand"] = 51] = "FromViewCommand";
    t[t["TwoWayCommand"] = 52] = "TwoWayCommand";
    t[t["BindCommand"] = 53] = "BindCommand";
    t[t["TriggerCommand"] = 4182] = "TriggerCommand";
    t[t["CaptureCommand"] = 4183] = "CaptureCommand";
    t[t["DelegateCommand"] = 4184] = "DelegateCommand";
    t[t["CallCommand"] = 153] = "CallCommand";
    t[t["OptionsCommand"] = 26] = "OptionsCommand";
    t[t["ForCommand"] = 539] = "ForCommand";
    t[t["CustomCommand"] = 284] = "CustomCommand";
})(exports.BindingType || (exports.BindingType = {}));

class ParserState {
    constructor(t) {
        this.ip = t;
        this.index = 0;
        this.l = 0;
        this.g = 0;
        this.m = 1572864;
        this.A = "";
        this.U = true;
        this.length = t.length;
        this.u = t.charCodeAt(0);
    }
    get C() {
        return this.ip.slice(this.l, this.index);
    }
}

const ue = new ParserState("");

function ce(t, e) {
    ue.ip = t;
    ue.length = t.length;
    ue.index = 0;
    ue.u = t.charCodeAt(0);
    return ae(ue, 0, 61, void 0 === e ? 53 : e);
}

function ae(t, e, r, s) {
    if (284 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (2048 & s) return pe(t);
        ge(t);
        if (1048576 & t.m) throw new Error(`AUR0151:${t.ip}`);
    }
    t.U = 448 > r;
    let i;
    if (32768 & t.m) {
        const r = Oe[63 & t.m];
        ge(t);
        i = new UnaryExpression(r, ae(t, e, 449, s));
        t.U = false;
    } else {
        t: switch (t.m) {
          case 3078:
            t.U = false;
            do {
                ge(t);
                e++;
                if (Ae(t, 16393)) {
                    if (16393 === t.m) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.m) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.m) {
                    const t = 511 & e;
                    i = 0 === t ? oe : 1 === t ? he : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`AUR0154:${t.ip}`);
            } while (3078 === t.m);

          case 1024:
            if (512 & s) i = new BindingIdentifier(t.A); else {
                i = new AccessScopeExpression(t.A, 511 & e);
                e = 1024;
            }
            t.U = true;
            ge(t);
            break;

          case 3076:
            t.U = false;
            ge(t);
            i = oe;
            e = 512;
            break;

          case 671751:
            ge(t);
            i = ae(t, 0, 62, s);
            Ue(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = le(t, e, s);
            e = 0;
            break;

          case 131080:
            i = de(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.A ]);
            t.U = false;
            ge(t);
            e = 0;
            break;

          case 540715:
            i = ve(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.A);
            t.U = false;
            ge(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = Oe[63 & t.m];
            t.U = false;
            ge(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (512 & s) return fe(t, i);
        if (449 < r) return i;
        let n = t.A;
        while ((16384 & t.m) > 0) {
            const r = [];
            let o;
            switch (t.m) {
              case 16393:
                t.U = true;
                ge(t);
                if (0 === (3072 & t.m)) throw new Error(`AUR0153:${t.ip}`);
                n = t.A;
                ge(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.m) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.U = true;
                ge(t);
                e = 4096;
                i = new AccessKeyedExpression(i, ae(t, 0, 62, s));
                Ue(t, 1835022);
                break;

              case 671751:
                t.U = false;
                ge(t);
                while (1835019 !== t.m) {
                    r.push(ae(t, 0, 62, s));
                    if (!Ae(t, 1572876)) break;
                }
                Ue(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.U = false;
                o = [ t.A ];
                i = new TaggedTemplateExpression(o, o, i);
                ge(t);
                break;

              case 540715:
                i = ve(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.m) > 0) {
        const n = t.m;
        if ((448 & n) <= r) break;
        ge(t);
        i = new BinaryExpression(Oe[63 & n], i, ae(t, e, 448 & n, s));
        t.U = false;
    }
    if (63 < r) return i;
    if (Ae(t, 1572880)) {
        const r = ae(t, e, 62, s);
        Ue(t, 1572879);
        i = new ConditionalExpression(i, r, ae(t, e, 62, s));
        t.U = false;
    }
    if (62 < r) return i;
    if (Ae(t, 1048616)) {
        if (!t.U) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, ae(t, e, 62, s));
    }
    if (61 < r) return i;
    while (Ae(t, 1572884)) {
        if (1572864 === t.m) throw new Error(`AUR0159:${t.ip}`);
        const r = t.A;
        ge(t);
        const n = new Array;
        while (Ae(t, 1572879)) n.push(ae(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (Ae(t, 1572883)) {
        if (1572864 === t.m) throw new Error(`AUR0160:${t.ip}`);
        const r = t.A;
        ge(t);
        const n = new Array;
        while (Ae(t, 1572879)) n.push(ae(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.m) {
        if (2048 & s) return i;
        if ("of" === t.C) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function le(t, e, r) {
    ge(t);
    const s = new Array;
    while (1835022 !== t.m) if (Ae(t, 1572876)) {
        s.push(ne);
        if (1835022 === t.m) break;
    } else {
        s.push(ae(t, e, 62, ~512 & r));
        if (Ae(t, 1572876)) {
            if (1835022 === t.m) break;
        } else break;
    }
    Ue(t, 1835022);
    if (512 & r) return new ArrayBindingPattern(s); else {
        t.U = false;
        return new ArrayLiteralExpression(s);
    }
}

function fe(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.m) throw new Error(`AUR0163:${t.ip}`);
    ge(t);
    const r = e;
    const s = ae(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function de(t, e) {
    const r = new Array;
    const s = new Array;
    ge(t);
    while (1835018 !== t.m) {
        r.push(t.A);
        if (12288 & t.m) {
            ge(t);
            Ue(t, 1572879);
            s.push(ae(t, 0, 62, ~512 & e));
        } else if (3072 & t.m) {
            const {u: r, m: i, index: n} = t;
            ge(t);
            if (Ae(t, 1572879)) s.push(ae(t, 0, 62, ~512 & e)); else {
                t.u = r;
                t.m = i;
                t.index = n;
                s.push(ae(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.m) Ue(t, 1572876);
    }
    Ue(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(r, s); else {
        t.U = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function pe(t) {
    const e = [];
    const r = [];
    const s = t.length;
    let i = "";
    while (t.index < s) {
        switch (t.u) {
          case 36:
            if (123 === t.ip.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.u = t.ip.charCodeAt(t.index);
                ge(t);
                const s = ae(t, 0, 61, 2048);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(te(be(t)));
            break;

          default:
            i += String.fromCharCode(t.u);
        }
        be(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function ve(t, e, r, s, i) {
    const n = [ t.A ];
    Ue(t, 540715);
    const o = [ ae(t, e, 62, r) ];
    while (540714 !== (t.m = ye(t))) {
        n.push(t.A);
        Ue(t, 540715);
        o.push(ae(t, e, 62, r));
    }
    n.push(t.A);
    t.U = false;
    if (i) {
        ge(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        ge(t);
        return new TemplateExpression(n, o);
    }
}

function ge(t) {
    while (t.index < t.length) {
        t.l = t.index;
        if (null != (t.m = Te[t.u](t))) return;
    }
    t.m = 1572864;
}

function be(t) {
    return t.u = t.ip.charCodeAt(++t.index);
}

function we(t) {
    while (Pe[be(t)]) ;
    const e = Ce[t.A = t.C];
    return void 0 === e ? 1024 : e;
}

function xe(t, e) {
    let r = t.u;
    if (false === e) {
        do {
            r = be(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.A = parseInt(t.C, 10);
            return 8192;
        }
        r = be(t);
        if (t.index >= t.length) {
            t.A = parseInt(t.C.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = be(t);
    } while (r <= 57 && r >= 48); else t.u = t.ip.charCodeAt(--t.index);
    t.A = parseFloat(t.C);
    return 8192;
}

function me(t) {
    const e = t.u;
    be(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.u !== e) if (92 === t.u) {
        s.push(t.ip.slice(i, t.index));
        be(t);
        r = te(t.u);
        be(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else be(t);
    const n = t.ip.slice(i, t.index);
    be(t);
    s.push(n);
    const o = s.join("");
    t.A = o;
    return 4096;
}

function Ee(t) {
    let e = true;
    let r = "";
    while (96 !== be(t)) if (36 === t.u) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.u) r += String.fromCharCode(te(be(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.u);
    }
    be(t);
    t.A = r;
    if (e) return 540714;
    return 540715;
}

function ye(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return Ee(t);
}

function Ae(t, e) {
    if (t.m === e) {
        ge(t);
        return true;
    }
    return false;
}

function Ue(t, e) {
    if (t.m === e) ge(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const Oe = [ re, se, ie, ne, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Ce = Object.create(null);

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

const Se = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Be(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function Le(t) {
    return e => {
        be(e);
        return t;
    };
}

const $e = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

$e.notMapped = true;

const ke = new Set;

Be(null, ke, Se.AsciiIdPart, true);

const Pe = new Uint8Array(65535);

Be(Pe, null, Se.IdStart, 1);

Be(Pe, null, Se.Digit, 1);

const Te = new Array(65535);

Te.fill($e, 0, 65535);

Be(Te, null, Se.Skip, (t => {
    be(t);
    return null;
}));

Be(Te, null, Se.IdStart, we);

Be(Te, null, Se.Digit, (t => xe(t, false)));

Te[34] = Te[39] = t => me(t);

Te[96] = t => Ee(t);

Te[33] = t => {
    if (61 !== be(t)) return 32809;
    if (61 !== be(t)) return 1638680;
    be(t);
    return 1638682;
};

Te[61] = t => {
    if (61 !== be(t)) return 1048616;
    if (61 !== be(t)) return 1638679;
    be(t);
    return 1638681;
};

Te[38] = t => {
    if (38 !== be(t)) return 1572883;
    be(t);
    return 1638614;
};

Te[124] = t => {
    if (124 !== be(t)) return 1572884;
    be(t);
    return 1638549;
};

Te[46] = t => {
    if (be(t) <= 57 && t.u >= 48) return xe(t, true);
    return 16393;
};

Te[60] = t => {
    if (61 !== be(t)) return 1638747;
    be(t);
    return 1638749;
};

Te[62] = t => {
    if (61 !== be(t)) return 1638748;
    be(t);
    return 1638750;
};

Te[37] = Le(1638886);

Te[40] = Le(671751);

Te[41] = Le(1835019);

Te[42] = Le(1638885);

Te[43] = Le(623009);

Te[44] = Le(1572876);

Te[45] = Le(623010);

Te[47] = Le(1638887);

Te[58] = Le(1572879);

Te[63] = Le(1572880);

Te[91] = Le(671757);

Te[93] = Le(1835022);

Te[123] = Le(131080);

Te[125] = Le(1835018);

let Re = null;

const je = [];

let Ie = false;

function Me() {
    Ie = false;
}

function Fe() {
    Ie = true;
}

function Ve() {
    return Re;
}

function De(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == Re) {
        Re = t;
        je[0] = Re;
        Ie = true;
        return;
    }
    if (Re === t) throw new Error("AUR0207");
    je.push(Re);
    Re = t;
    Ie = true;
}

function Ne(t) {
    if (null == t) throw new Error("AUR0208");
    if (Re !== t) throw new Error("AUR0209");
    je.pop();
    Re = je.length > 0 ? je[je.length - 1] : null;
    Ie = null != Re;
}

const Ke = Object.freeze({
    get current() {
        return Re;
    },
    get connecting() {
        return Ie;
    },
    enter: De,
    exit: Ne,
    pause: Me,
    resume: Fe
});

const qe = Reflect.get;

const _e = Object.prototype.toString;

const He = new WeakMap;

function Qe(t) {
    switch (_e.call(t)) {
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

function ze(t) {
    return Qe(t) ? Ge(t) : t;
}

function Ge(t) {
    var e;
    return null !== (e = He.get(t)) && void 0 !== e ? e : Ye(t);
}

function Ze(t) {
    var e;
    return null !== (e = t[We]) && void 0 !== e ? e : t;
}

function Je(t) {
    return Qe(t) && t[We] || t;
}

function Xe(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function Ye(t) {
    const e = t instanceof Array ? er : t instanceof Map || t instanceof Set ? Ur : tr;
    const r = new Proxy(t, e);
    He.set(t, r);
    return r;
}

const tr = {
    get(t, e, r) {
        if (e === We) return t;
        const s = Ve();
        if (!Ie || Xe(e) || null == s) return qe(t, e, r);
        s.observe(t, e);
        return ze(qe(t, e, r));
    }
};

const er = {
    get(t, e, r) {
        if (e === We) return t;
        const s = Ve();
        if (!Ie || Xe(e) || null == s) return qe(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return rr;

          case "includes":
            return nr;

          case "indexOf":
            return or;

          case "lastIndexOf":
            return hr;

          case "every":
            return sr;

          case "filter":
            return ir;

          case "find":
            return cr;

          case "findIndex":
            return ur;

          case "flat":
            return ar;

          case "flatMap":
            return lr;

          case "join":
            return fr;

          case "push":
            return pr;

          case "pop":
            return dr;

          case "reduce":
            return yr;

          case "reduceRight":
            return Ar;

          case "reverse":
            return wr;

          case "shift":
            return vr;

          case "unshift":
            return gr;

          case "slice":
            return Er;

          case "splice":
            return br;

          case "some":
            return xr;

          case "sort":
            return mr;

          case "keys":
            return Pr;

          case "values":
          case Symbol.iterator:
            return Tr;

          case "entries":
            return Rr;
        }
        s.observe(t, e);
        return ze(qe(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = Ve()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function rr(t, e) {
    var r;
    const s = Ze(this);
    const i = s.map(((r, s) => Je(t.call(e, ze(r), s, this))));
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ze(i);
}

function sr(t, e) {
    var r;
    const s = Ze(this);
    const i = s.every(((r, s) => t.call(e, ze(r), s, this)));
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function ir(t, e) {
    var r;
    const s = Ze(this);
    const i = s.filter(((r, s) => Je(t.call(e, ze(r), s, this))));
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ze(i);
}

function nr(t) {
    var e;
    const r = Ze(this);
    const s = r.includes(Je(t));
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function or(t) {
    var e;
    const r = Ze(this);
    const s = r.indexOf(Je(t));
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function hr(t) {
    var e;
    const r = Ze(this);
    const s = r.lastIndexOf(Je(t));
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function ur(t, e) {
    var r;
    const s = Ze(this);
    const i = s.findIndex(((r, s) => Je(t.call(e, ze(r), s, this))));
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function cr(t, e) {
    var r;
    const s = Ze(this);
    const i = s.find(((e, r) => t(ze(e), r, this)), e);
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ze(i);
}

function ar() {
    var t;
    const e = Ze(this);
    null === (t = Ve()) || void 0 === t ? void 0 : t.observeCollection(e);
    return ze(e.flat());
}

function lr(t, e) {
    var r;
    const s = Ze(this);
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ge(s.flatMap(((r, s) => ze(t.call(e, ze(r), s, this)))));
}

function fr(t) {
    var e;
    const r = Ze(this);
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function dr() {
    return ze(Ze(this).pop());
}

function pr(...t) {
    return Ze(this).push(...t);
}

function vr() {
    return ze(Ze(this).shift());
}

function gr(...t) {
    return Ze(this).unshift(...t);
}

function br(...t) {
    return ze(Ze(this).splice(...t));
}

function wr(...t) {
    var e;
    const r = Ze(this);
    const s = r.reverse();
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return ze(s);
}

function xr(t, e) {
    var r;
    const s = Ze(this);
    const i = s.some(((r, s) => Je(t.call(e, ze(r), s, this))));
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function mr(t) {
    var e;
    const r = Ze(this);
    const s = r.sort(t);
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return ze(s);
}

function Er(t, e) {
    var r;
    const s = Ze(this);
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ge(s.slice(t, e));
}

function yr(t, e) {
    var r;
    const s = Ze(this);
    const i = s.reduce(((e, r, s) => t(e, ze(r), s, this)), e);
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ze(i);
}

function Ar(t, e) {
    var r;
    const s = Ze(this);
    const i = s.reduceRight(((e, r, s) => t(e, ze(r), s, this)), e);
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ze(i);
}

const Ur = {
    get(t, e, r) {
        if (e === We) return t;
        const s = Ve();
        if (!Ie || Xe(e) || null == s) return qe(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return $r;

          case "delete":
            return kr;

          case "forEach":
            return Or;

          case "add":
            if (t instanceof Set) return Lr;
            break;

          case "get":
            if (t instanceof Map) return Sr;
            break;

          case "set":
            if (t instanceof Map) return Br;
            break;

          case "has":
            return Cr;

          case "keys":
            return Pr;

          case "values":
            return Tr;

          case "entries":
            return Rr;

          case Symbol.iterator:
            return t instanceof Map ? Rr : Tr;
        }
        return ze(qe(t, e, r));
    }
};

function Or(t, e) {
    var r;
    const s = Ze(this);
    null === (r = Ve()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, ze(r), ze(s), this);
    }));
}

function Cr(t) {
    var e;
    const r = Ze(this);
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(Je(t));
}

function Sr(t) {
    var e;
    const r = Ze(this);
    null === (e = Ve()) || void 0 === e ? void 0 : e.observeCollection(r);
    return ze(r.get(Je(t)));
}

function Br(t, e) {
    return ze(Ze(this).set(Je(t), Je(e)));
}

function Lr(t) {
    return ze(Ze(this).add(Je(t)));
}

function $r() {
    return ze(Ze(this).clear());
}

function kr(t) {
    return ze(Ze(this).delete(Je(t)));
}

function Pr() {
    var t;
    const e = Ze(this);
    null === (t = Ve()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: ze(e),
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
    const e = Ze(this);
    null === (t = Ve()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: ze(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Rr() {
    var t;
    const e = Ze(this);
    null === (t = Ve()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ ze(e[0]), ze(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const jr = Object.freeze({
    getProxy: Ge,
    getRaw: Ze,
    wrap: ze,
    unwrap: Je,
    rawKey: We
});

class ComputedObserver {
    constructor(t, e, r, s, i) {
        this.interceptor = this;
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.R = false;
        this.D = false;
        this.O = t;
        this.get = e;
        this.set = r;
        this.uP = s;
        this.oL = i;
    }
    static create(t, e, r, s, i) {
        const n = r.get;
        const o = r.set;
        const h = new ComputedObserver(t, n, o, i, s);
        const u = () => h.getValue();
        u.getObserver = () => h;
        S(t, e, {
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
                this.R = true;
                this.set.call(this.O, t);
                this.R = false;
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
        Ir = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Ir, 0);
    }
    run() {
        if (this.R) return;
        const t = this.v;
        const e = this.compute();
        this.D = false;
        if (!Object.is(e, t)) {
            this.ov = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.R = true;
        this.obs.version++;
        try {
            De(this);
            return this.v = Je(this.get.call(this.uP ? ze(this.O) : this.O, this));
        } finally {
            this.obs.clear();
            this.R = false;
            Ne(this);
        }
    }
}

Xt(ComputedObserver);

I(ComputedObserver);

N(ComputedObserver);

let Ir;

const Mr = t.DI.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Fr = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const Vr = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.B = null;
        this.L = 0;
        this.check = () => {
            if (Fr.disabled) return;
            if (++this.L < Fr.timeoutsPerCheck) return;
            this.L = 0;
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
        if (Fr.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.B = this.p.taskQueue.queueTask(this.check, Vr);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.B.cancel();
            this.B = null;
        }
    }
}

DirtyChecker.inject = [ t.IPlatform ];

N(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = 0;
        this.ov = void 0;
        this.$ = t;
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
            this.$.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.$.removeProperty(this);
    }
}

I(DirtyCheckProperty);

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

let Dr;

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
        Dr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Dr, this.f);
    }
    start() {
        if (false === this.iO) {
            this.iO = true;
            this.v = this.O[this.K];
            S(this.O, this.K, {
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
            S(this.O, this.K, {
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
        this.HS = B(r);
        const i = t[e];
        this.cb = B(i) ? i : void 0;
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
        Dr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Dr, this.f);
    }
}

I(SetterObserver);

I(SetterNotifier);

N(SetterObserver);

N(SetterNotifier);

const Nr = new PropertyAccessor;

const Kr = t.DI.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const qr = t.DI.createInterface("INodeObserverLocator", (e => e.cachedCallback((e => {
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
        return Nr;
    }
    getAccessor() {
        return Nr;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.$ = t;
        this.k = e;
        this.P = [];
    }
    addAdapter(t) {
        this.P.push(t);
    }
    getObserver(t, e) {
        var r, s;
        return null !== (s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== s ? s : this.T(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== s) return s;
        if (this.k.handles(t, e, this)) return this.k.getAccessor(t, e, this);
        return Nr;
    }
    getArrayObserver(t) {
        return pt(t);
    }
    getMapObserver(t) {
        return Kt(t);
    }
    getSetObserver(t) {
        return Lt(t);
    }
    createObserver(e, r) {
        var s, i, n, o;
        if (!(e instanceof Object)) return new PrimitiveObserver(e, r);
        if (this.k.handles(e, r, this)) return this.k.getObserver(e, r, this);
        switch (r) {
          case "length":
            if (e instanceof Array) return pt(e).getLengthObserver();
            break;

          case "size":
            if (e instanceof Map) return Kt(e).getLengthObserver(); else if (e instanceof Set) return Lt(e).getLengthObserver();
            break;

          default:
            if (e instanceof Array && t.isArrayIndex(r)) return pt(e).getIndexObserver(Number(r));
            break;
        }
        let h = Qr(e, r);
        if (void 0 === h) {
            let t = Hr(e);
            while (null !== t) {
                h = Qr(t, r);
                if (void 0 === h) t = Hr(t); else break;
            }
        }
        if (void 0 !== h && !C.call(h, "value")) {
            let t = this.j(e, r, h);
            if (null == t) t = null === (o = null !== (i = null === (s = h.get) || void 0 === s ? void 0 : s.getObserver) && void 0 !== i ? i : null === (n = h.set) || void 0 === n ? void 0 : n.getObserver) || void 0 === o ? void 0 : o(e, this);
            return null == t ? h.configurable ? ComputedObserver.create(e, r, h, this, true) : this.$.createProperty(e, r) : t;
        }
        return new SetterObserver(e, r);
    }
    j(t, e, r) {
        if (this.P.length > 0) for (const s of this.P) {
            const i = s.getObserver(t, e, r, this);
            if (null != i) return i;
        }
        return null;
    }
    T(t, e, r) {
        if (true === r.doNotCache) return r;
        if (void 0 === t.$observers) {
            S(t, "$observers", {
                value: {
                    [e]: r
                }
            });
            return r;
        }
        return t.$observers[e] = r;
    }
}

ObserverLocator.inject = [ Mr, qr ];

function _r(t) {
    let e;
    if (t instanceof Array) e = pt(t); else if (t instanceof Map) e = Kt(t); else if (t instanceof Set) e = Lt(t);
    return e;
}

const Hr = Object.getPrototypeOf;

const Qr = Object.getOwnPropertyDescriptor;

const Wr = t.DI.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ Kr ];
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
            De(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            Ne(this);
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

Xt(Effect);

function zr(t) {
    if (void 0 === t.$observers) S(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Gr = {};

function Zr(t, e, r) {
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
        let h = Gr;
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
            const s = Jr(this, e, o, h, u);
            null === (r = Ve()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            Jr(this, e, o, h, u).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return Jr(r, e, o, h, u);
        };
        if (n) S(t.prototype, e, r); else return r;
    }
}

function Jr(t, e, r, s, i) {
    const n = zr(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === Gr ? void 0 : s);
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

exports.BindingBehavior = v;

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

exports.ConnectableSwitcher = Ke;

exports.CustomExpression = CustomExpression;

exports.DirtyCheckProperty = DirtyCheckProperty;

exports.DirtyCheckSettings = Fr;

exports.FlushQueue = FlushQueue;

exports.ForOfStatement = ForOfStatement;

exports.HtmlLiteralExpression = HtmlLiteralExpression;

exports.IDirtyChecker = Mr;

exports.IExpressionParser = Yt;

exports.INodeObserverLocator = qr;

exports.IObservation = Wr;

exports.IObserverLocator = Kr;

exports.ISignaler = l;

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

exports.ProxyObservable = jr;

exports.Scope = Scope;

exports.SetObserver = SetObserver;

exports.SetterObserver = SetterObserver;

exports.SubscriberRecord = SubscriberRecord;

exports.TaggedTemplateExpression = TaggedTemplateExpression;

exports.TemplateExpression = TemplateExpression;

exports.UnaryExpression = UnaryExpression;

exports.ValueConverter = x;

exports.ValueConverterDefinition = ValueConverterDefinition;

exports.ValueConverterExpression = ValueConverterExpression;

exports.alias = u;

exports.applyMutationsToIndices = vt;

exports.bindingBehavior = f;

exports.cloneIndexMap = R;

exports.connectable = Xt;

exports.copyIndexMap = P;

exports.createIndexMap = T;

exports.disableArrayObservation = dt;

exports.disableMapObservation = Nt;

exports.disableSetObservation = Bt;

exports.enableArrayObservation = ft;

exports.enableMapObservation = Dt;

exports.enableSetObservation = St;

exports.getCollectionObserver = _r;

exports.isIndexMap = j;

exports.observable = Zr;

exports.parse = ae;

exports.parseExpression = ce;

exports.registerAliases = c;

exports.subscriberCollection = I;

exports.synchronizeIndices = gt;

exports.valueConverter = g;

exports.withFlushQueue = N;
//# sourceMappingURL=index.js.map
