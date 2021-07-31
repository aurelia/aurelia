"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/kernel");

var e = require("@aurelia/platform");

const s = t.Metadata.getOwn;

const r = t.Metadata.hasOwn;

const i = t.Metadata.define;

const n = t.Protocol.annotation.keyFor;

const o = t.Protocol.resource.keyFor;

const h = t.Protocol.resource.appendTo;

function c(...t) {
    return function(e) {
        const r = n("aliases");
        const o = s(r, e);
        if (void 0 === o) i(r, t, e); else o.push(...t);
    };
}

function u(e, s, r, i) {
    for (let n = 0, o = e.length; n < o; ++n) t.Registration.aliasTo(r, s.keyFrom(e[n])).register(i);
}

const a = Object.freeze({});

class BindingContext {
    constructor(t, e) {
        if (void 0 !== t) if (void 0 !== e) this[t] = e; else for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) this[e] = t[e];
    }
    static create(t, e) {
        return new BindingContext(t, e);
    }
    static get(t, e, s, r) {
        var i, n;
        if (null == t) throw new Error(`AUR203:${t}`);
        let o = t.overrideContext;
        let h = t;
        if (s > 0) {
            while (s > 0) {
                s--;
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
        if (16 & r) return a;
        return t.bindingContext || t.overrideContext;
    }
}

class Scope {
    constructor(t, e, s, r) {
        this.parentScope = t;
        this.bindingContext = e;
        this.overrideContext = s;
        this.isBoundary = r;
    }
    static create(t, e, s) {
        return new Scope(null, t, null == e ? OverrideContext.create(t) : e, null !== s && void 0 !== s ? s : false);
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
        const s = this.signals[t];
        if (void 0 === s) return;
        let r;
        for (r of s.keys()) r.handleChange(void 0, void 0, e);
    }
    addSignalListener(t, e) {
        const s = this.signals;
        const r = s[t];
        if (void 0 === r) s[t] = new Set([ e ]); else r.add(e);
    }
    removeSignalListener(t, e) {
        const s = this.signals[t];
        if (s) s.delete(e);
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
    constructor(t, e, s, r, i) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = r;
        this.strategy = i;
    }
    static create(e, s) {
        let r;
        let i;
        if ("string" === typeof e) {
            r = e;
            i = {
                name: r
            };
        } else {
            r = e.name;
            i = e;
        }
        const n = Object.getPrototypeOf(s) === BindingInterceptor;
        return new BindingBehaviorDefinition(s, t.firstDefined(p(s, "name"), r), t.mergeArrays(p(s, "aliases"), i.aliases, s.aliases), v.keyFrom(r), t.fromAnnotationOrDefinitionOrTypeOrDefault("strategy", i, s, (() => n ? 2 : 1)));
    }
    register(e) {
        const {Type: s, key: r, aliases: i, strategy: n} = this;
        switch (n) {
          case 1:
            t.Registration.singleton(r, s).register(e);
            break;

          case 2:
            t.Registration.instance(r, new BindingBehaviorFactory(e, s)).register(e);
            break;
        }
        t.Registration.aliasTo(r, s).register(e);
        u(i, v, r, e);
    }
}

class BindingBehaviorFactory {
    constructor(e, s) {
        this.ctn = e;
        this.Type = s;
        this.deps = t.DI.getDependencies(s);
    }
    construct(t, e) {
        const s = this.ctn;
        const r = this.deps;
        switch (r.length) {
          case 0:
          case 1:
          case 2:
            return new this.Type(t, e);

          case 3:
            return new this.Type(s.get(r[0]), t, e);

          case 4:
            return new this.Type(s.get(r[0]), s.get(r[1]), t, e);

          default:
            return new this.Type(...r.map((t => s.get(t))), t, e);
        }
    }
}

class BindingInterceptor {
    constructor(t, e) {
        this.binding = t;
        this.expr = e;
        this.interceptor = this;
        let s;
        while (t.interceptor !== this) {
            s = t.interceptor;
            t.interceptor = this;
            t = s;
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
    handleChange(t, e, s) {
        this.binding.handleChange(t, e, s);
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

const p = (t, e) => s(n(e), t);

const v = Object.freeze({
    name: d,
    keyFrom(t) {
        return `${d}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && r(d, t);
    },
    define(t, e) {
        const s = BindingBehaviorDefinition.create(t, e);
        i(d, s, s.Type);
        i(d, s, s);
        h(e, d);
        return s.Type;
    },
    getDefinition(t) {
        const e = s(d, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        i(n(e), s, t);
    },
    getAnnotation: p
});

function g(t) {
    return function(e) {
        return x.define(t, e);
    };
}

class ValueConverterDefinition {
    constructor(t, e, s, r) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = r;
    }
    static create(e, s) {
        let r;
        let i;
        if ("string" === typeof e) {
            r = e;
            i = {
                name: r
            };
        } else {
            r = e.name;
            i = e;
        }
        return new ValueConverterDefinition(s, t.firstDefined(w(s, "name"), r), t.mergeArrays(w(s, "aliases"), i.aliases, s.aliases), x.keyFrom(r));
    }
    register(e) {
        const {Type: s, key: r, aliases: i} = this;
        t.Registration.singleton(r, s).register(e);
        t.Registration.aliasTo(r, s).register(e);
        u(i, x, r, e);
    }
}

const b = o("value-converter");

const w = (t, e) => s(n(e), t);

const x = Object.freeze({
    name: b,
    keyFrom: t => `${b}:${t}`,
    isType(t) {
        return "function" === typeof t && r(b, t);
    },
    define(t, e) {
        const s = ValueConverterDefinition.create(t, e);
        i(b, s, s.Type);
        i(b, s, s);
        h(e, b);
        return s.Type;
    },
    getDefinition(t) {
        const e = s(b, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        i(n(e), s, t);
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
        for (let t = 0, s = e.length; t < s; ++t) {
            if (0 !== t) this.text += ",";
            e[t].accept(this);
        }
        this.text += "]";
    }
    visitObjectLiteral(t) {
        const e = t.keys;
        const s = t.values;
        this.text += "{";
        for (let t = 0, r = e.length; t < r; ++t) {
            if (0 !== t) this.text += ",";
            this.text += `'${e[t]}':`;
            s[t].accept(this);
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
        const {cooked: e, expressions: s} = t;
        const r = s.length;
        this.text += "`";
        this.text += e[0];
        for (let t = 0; t < r; t++) {
            s[t].accept(this);
            this.text += e[t + 1];
        }
        this.text += "`";
    }
    visitTaggedTemplate(t) {
        const {cooked: e, expressions: s} = t;
        const r = s.length;
        t.func.accept(this);
        this.text += "`";
        this.text += e[0];
        for (let t = 0; t < r; t++) {
            s[t].accept(this);
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
        for (let t = 0, s = e.length; t < s; ++t) {
            this.text += ":";
            e[t].accept(this);
        }
    }
    visitBindingBehavior(t) {
        const e = t.args;
        t.expression.accept(this);
        this.text += `&${t.name}`;
        for (let t = 0, s = e.length; t < s; ++t) {
            this.text += ":";
            e[t].accept(this);
        }
    }
    visitArrayBindingPattern(t) {
        const e = t.elements;
        this.text += "[";
        for (let t = 0, s = e.length; t < s; ++t) {
            if (0 !== t) this.text += ",";
            e[t].accept(this);
        }
        this.text += "]";
    }
    visitObjectBindingPattern(t) {
        const e = t.keys;
        const s = t.values;
        this.text += "{";
        for (let t = 0, r = e.length; t < r; ++t) {
            if (0 !== t) this.text += ",";
            this.text += `'${e[t]}':`;
            s[t].accept(this);
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
        const {parts: e, expressions: s} = t;
        const r = s.length;
        this.text += "${";
        this.text += e[0];
        for (let t = 0; t < r; t++) {
            s[t].accept(this);
            this.text += e[t + 1];
        }
        this.text += "}";
    }
    writeArgs(t) {
        this.text += "(";
        for (let e = 0, s = t.length; e < s; ++e) {
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
    evaluate(t, e, s, r) {
        return this.value;
    }
}

class BindingBehaviorExpression {
    constructor(t, e, s) {
        this.expression = t;
        this.name = e;
        this.args = s;
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
    evaluate(t, e, s, r) {
        return this.expression.evaluate(t, e, s, r);
    }
    assign(t, e, s, r) {
        return this.expression.assign(t, e, s, r);
    }
    bind(t, e, s) {
        if (this.expression.hasBind) this.expression.bind(t, e, s);
        const r = s.locator.get(this.behaviorKey);
        if (null == r) throw new Error(`AUR0101:${this.name}`);
        if (!(r instanceof BindingBehaviorFactory)) if (void 0 === s[this.behaviorKey]) {
            s[this.behaviorKey] = r;
            r.bind.call(r, t, e, s, ...this.args.map((r => r.evaluate(t, e, s.locator, null))));
        } else throw new Error(`AUR0102:${this.name}`);
    }
    unbind(t, e, s) {
        const r = this.behaviorKey;
        const i = s;
        if (void 0 !== i[r]) {
            if ("function" === typeof i[r].unbind) i[r].unbind(t, e, s);
            i[r] = void 0;
        }
        if (this.expression.hasUnbind) this.expression.unbind(t, e, s);
    }
    accept(t) {
        return t.visitBindingBehavior(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class ValueConverterExpression {
    constructor(t, e, s) {
        this.expression = t;
        this.name = e;
        this.args = s;
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
    evaluate(t, e, s, r) {
        const i = s.get(this.converterKey);
        if (null == i) throw new Error(`AUR0103:${this.name}`);
        if (null !== r && "handleChange" in r) {
            const t = i.signals;
            if (null != t) {
                const e = s.get(l);
                for (let s = 0, i = t.length; s < i; ++s) e.addSignalListener(t[s], r);
            }
        }
        if ("toView" in i) return i.toView(this.expression.evaluate(t, e, s, r), ...this.args.map((i => i.evaluate(t, e, s, r))));
        return this.expression.evaluate(t, e, s, r);
    }
    assign(t, e, s, r) {
        const i = s.get(this.converterKey);
        if (null == i) throw new Error(`AUR0104:${this.name}`);
        if ("fromView" in i) r = i.fromView(r, ...this.args.map((r => r.evaluate(t, e, s, null))));
        return this.expression.assign(t, e, s, r);
    }
    unbind(t, e, s) {
        const r = s.locator.get(this.converterKey);
        if (void 0 === r.signals) return;
        const i = s.locator.get(l);
        for (let t = 0; t < r.signals.length; ++t) i.removeSignalListener(r.signals[t], s);
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
    evaluate(t, e, s, r) {
        return this.target.assign(t, e, s, this.value.evaluate(t, e, s, r));
    }
    assign(t, e, s, r) {
        this.value.assign(t, e, s, r);
        return this.target.assign(t, e, s, r);
    }
    accept(t) {
        return t.visitAssign(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class ConditionalExpression {
    constructor(t, e, s) {
        this.condition = t;
        this.yes = e;
        this.no = s;
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
    evaluate(t, e, s, r) {
        return this.condition.evaluate(t, e, s, r) ? this.yes.evaluate(t, e, s, r) : this.no.evaluate(t, e, s, r);
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
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
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        const i = BindingContext.get(e, this.name, this.ancestor, t);
        if (null !== r) r.observe(i, this.name);
        const n = i[this.name];
        if (null == n && "$host" === this.name) throw new Error("AUR0105");
        if (1 & t) return n;
        return null == n ? "" : n;
    }
    assign(t, e, s, r) {
        var i;
        if ("$host" === this.name) throw new Error("AUR0106");
        const n = BindingContext.get(e, this.name, this.ancestor, t);
        if (n instanceof Object) if (void 0 !== (null === (i = n.$observers) || void 0 === i ? void 0 : i[this.name])) {
            n.$observers[this.name].setValue(r, t);
            return r;
        } else return n[this.name] = r;
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
    evaluate(t, e, s, r) {
        const i = this.object.evaluate(t, e, s, (128 & t) > 0 ? null : r);
        if (1 & t) {
            if (null == i) return i;
            if (null !== r) r.observe(i, this.name);
            return i[this.name];
        }
        if (null !== r && i instanceof Object) r.observe(i, this.name);
        return i ? i[this.name] : "";
    }
    assign(t, e, s, r) {
        const i = this.object.evaluate(t, e, s, null);
        if (i instanceof Object) if (void 0 !== i.$observers && void 0 !== i.$observers[this.name]) i.$observers[this.name].setValue(r, t); else i[this.name] = r; else this.object.assign(t, e, s, {
            [this.name]: r
        });
        return r;
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
    evaluate(t, e, s, r) {
        const i = this.object.evaluate(t, e, s, (128 & t) > 0 ? null : r);
        if (i instanceof Object) {
            const n = this.key.evaluate(t, e, s, (128 & t) > 0 ? null : r);
            if (null !== r) r.observe(i, n);
            return i[n];
        }
        return;
    }
    assign(t, e, s, r) {
        const i = this.object.evaluate(t, e, s, null);
        const n = this.key.evaluate(t, e, s, null);
        return i[n] = r;
    }
    accept(t) {
        return t.visitAccessKeyed(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class CallScopeExpression {
    constructor(t, e, s = 0) {
        this.name = t;
        this.args = e;
        this.ancestor = s;
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
    evaluate(t, e, s, r) {
        const i = this.args.map((i => i.evaluate(t, e, s, r)));
        const n = BindingContext.get(e, this.name, this.ancestor, t);
        const o = E(t, n, this.name);
        if (o) return o.apply(n, i);
        return;
    }
    assign(t, e, s, r) {
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
    constructor(t, e, s) {
        this.object = t;
        this.name = e;
        this.args = s;
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
    evaluate(t, e, s, r) {
        const i = this.object.evaluate(t, e, s, (128 & t) > 0 ? null : r);
        const n = this.args.map((i => i.evaluate(t, e, s, r)));
        const o = E(t, i, this.name);
        if (o) return o.apply(i, n);
        return;
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        const i = this.func.evaluate(t, e, s, r);
        if ("function" === typeof i) return i(...this.args.map((i => i.evaluate(t, e, s, r))));
        if (!(8 & t) && null == i) return;
        throw new Error("AUR0107");
    }
    assign(t, e, s, r) {
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
    constructor(t, e, s) {
        this.operation = t;
        this.left = e;
        this.right = s;
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
    evaluate(e, s, r, i) {
        switch (this.operation) {
          case "&&":
            return this.left.evaluate(e, s, r, i) && this.right.evaluate(e, s, r, i);

          case "||":
            return this.left.evaluate(e, s, r, i) || this.right.evaluate(e, s, r, i);

          case "==":
            return this.left.evaluate(e, s, r, i) == this.right.evaluate(e, s, r, i);

          case "===":
            return this.left.evaluate(e, s, r, i) === this.right.evaluate(e, s, r, i);

          case "!=":
            return this.left.evaluate(e, s, r, i) != this.right.evaluate(e, s, r, i);

          case "!==":
            return this.left.evaluate(e, s, r, i) !== this.right.evaluate(e, s, r, i);

          case "instanceof":
            {
                const t = this.right.evaluate(e, s, r, i);
                if ("function" === typeof t) return this.left.evaluate(e, s, r, i) instanceof t;
                return false;
            }

          case "in":
            {
                const t = this.right.evaluate(e, s, r, i);
                if (t instanceof Object) return this.left.evaluate(e, s, r, i) in t;
                return false;
            }

          case "+":
            {
                const n = this.left.evaluate(e, s, r, i);
                const o = this.right.evaluate(e, s, r, i);
                if ((1 & e) > 0) return n + o;
                if (!n || !o) {
                    if (t.isNumberOrBigInt(n) || t.isNumberOrBigInt(o)) return (n || 0) + (o || 0);
                    if (t.isStringOrDate(n) || t.isStringOrDate(o)) return (n || "") + (o || "");
                }
                return n + o;
            }

          case "-":
            return this.left.evaluate(e, s, r, i) - this.right.evaluate(e, s, r, i);

          case "*":
            return this.left.evaluate(e, s, r, i) * this.right.evaluate(e, s, r, i);

          case "/":
            return this.left.evaluate(e, s, r, i) / this.right.evaluate(e, s, r, i);

          case "%":
            return this.left.evaluate(e, s, r, i) % this.right.evaluate(e, s, r, i);

          case "<":
            return this.left.evaluate(e, s, r, i) < this.right.evaluate(e, s, r, i);

          case ">":
            return this.left.evaluate(e, s, r, i) > this.right.evaluate(e, s, r, i);

          case "<=":
            return this.left.evaluate(e, s, r, i) <= this.right.evaluate(e, s, r, i);

          case ">=":
            return this.left.evaluate(e, s, r, i) >= this.right.evaluate(e, s, r, i);

          default:
            throw new Error(`AUR0108:${this.operation}`);
        }
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        switch (this.operation) {
          case "void":
            return void this.expression.evaluate(t, e, s, r);

          case "typeof":
            return typeof this.expression.evaluate(1 | t, e, s, r);

          case "!":
            return !this.expression.evaluate(t, e, s, r);

          case "-":
            return -this.expression.evaluate(t, e, s, r);

          case "+":
            return +this.expression.evaluate(t, e, s, r);

          default:
            throw new Error(`AUR0109:${this.operation}`);
        }
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        return this.value;
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        let i = "";
        for (let n = 0; n < this.parts.length; ++n) {
            const o = this.parts[n].evaluate(t, e, s, r);
            if (null == o) continue;
            i += o;
        }
        return i;
    }
    assign(t, e, s, r, i) {
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
    evaluate(t, e, s, r) {
        return this.elements.map((i => i.evaluate(t, e, s, r)));
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        const i = {};
        for (let n = 0; n < this.keys.length; ++n) i[this.keys[n]] = this.values[n].evaluate(t, e, s, r);
        return i;
    }
    assign(t, e, s, r) {
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
    constructor(e, s = t.emptyArray) {
        this.cooked = e;
        this.expressions = s;
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
    evaluate(t, e, s, r) {
        let i = this.cooked[0];
        for (let n = 0; n < this.expressions.length; ++n) {
            i += String(this.expressions[n].evaluate(t, e, s, r));
            i += this.cooked[n + 1];
        }
        return i;
    }
    assign(t, e, s, r) {
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
    constructor(e, s, r, i = t.emptyArray) {
        this.cooked = e;
        this.func = r;
        this.expressions = i;
        e.raw = s;
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
    evaluate(t, e, s, r) {
        const i = this.expressions.map((i => i.evaluate(t, e, s, r)));
        const n = this.func.evaluate(t, e, s, r);
        if ("function" !== typeof n) throw new Error(`AUR0110`);
        return n(this.cooked, ...i);
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        return;
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        return;
    }
    assign(t, e, s, r) {
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
    evaluate(t, e, s, r) {
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
    evaluate(t, e, s, r) {
        return this.iterable.evaluate(t, e, s, r);
    }
    assign(t, e, s, r) {
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
    iterate(t, e, s) {
        switch (m.call(e)) {
          case "[object Array]":
            return y(e, s);

          case "[object Map]":
            return A(e, s);

          case "[object Set]":
            return U(e, s);

          case "[object Number]":
            return O(e, s);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${m.call(e)}`);
        }
    }
    bind(t, e, s) {
        if (this.iterable.hasBind) this.iterable.bind(t, e, s);
    }
    unbind(t, e, s) {
        if (this.iterable.hasUnbind) this.iterable.unbind(t, e, s);
    }
    accept(t) {
        return t.visitForOfStatement(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class Interpolation {
    constructor(e, s = t.emptyArray) {
        this.parts = e;
        this.expressions = s;
        this.isMulti = s.length > 1;
        this.firstExpression = s[0];
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
    evaluate(t, e, s, r) {
        if (this.isMulti) {
            let i = this.parts[0];
            for (let n = 0; n < this.expressions.length; ++n) {
                i += String(this.expressions[n].evaluate(t, e, s, r));
                i += this.parts[n + 1];
            }
            return i;
        } else return `${this.parts[0]}${this.firstExpression.evaluate(t, e, s, r)}${this.parts[1]}`;
    }
    assign(t, e, s, r) {
        return;
    }
    accept(t) {
        return t.visitInterpolation(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

function E(t, e, s) {
    const r = null == e ? null : e[s];
    if ("function" === typeof r) return r;
    if (!(8 & t) && null == r) return null;
    throw new Error(`AUR0111:${s}`);
}

function y(t, e) {
    for (let s = 0, r = t.length; s < r; ++s) e(t, s, t[s]);
}

function A(t, e) {
    const s = Array(t.size);
    let r = -1;
    for (const e of t.entries()) s[++r] = e;
    y(s, e);
}

function U(t, e) {
    const s = Array(t.size);
    let r = -1;
    for (const e of t.keys()) s[++r] = e;
    y(s, e);
}

function O(t, e) {
    const s = Array(t);
    for (let e = 0; e < t; ++e) s[e] = e;
    y(s, e);
}

const C = Object.prototype.hasOwnProperty;

const S = Reflect.defineProperty;

function B(t, e, s) {
    S(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: s
    });
    return s;
}

function $(t, e, s, r = false) {
    if (r || !C.call(t, e)) B(t, e, s);
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

var L;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(L || (L = {}));

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

function k(t, e) {
    const {length: s} = t;
    const r = Array(s);
    let i = 0;
    while (i < s) {
        r[i] = t[i];
        ++i;
    }
    if (void 0 !== e) r.deletedItems = e.slice(0); else if (void 0 !== t.deletedItems) r.deletedItems = t.deletedItems.slice(0); else r.deletedItems = [];
    r.isIndexMap = true;
    return r;
}

function P(t = 0) {
    const e = Array(t);
    let s = 0;
    while (s < t) e[s] = s++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function T(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function R(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function j(t) {
    return null == t ? I : I(t);
}

function I(t) {
    const e = t.prototype;
    S(e, "subs", {
        get: M
    });
    $(e, "subscribe", F);
    $(e, "unsubscribe", V);
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
            const s = e.length;
            let r = 0;
            for (;r < s; ++r) if (e[r] === t) return true;
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
            const s = e.length;
            let r = 0;
            for (;r < s; ++r) if (e[r] === t) {
                e.splice(r, 1);
                if (1 === s) this.sf = 8 ^ (8 | this.sf);
                --this.count;
                return true;
            }
        }
        return false;
    }
    notify(t, e, s) {
        const r = this.s0;
        const i = this.s1;
        const n = this.s2;
        let o = this.sr;
        if (void 0 !== o) o = o.slice();
        if (void 0 !== r) r.handleChange(t, e, s);
        if (void 0 !== i) i.handleChange(t, e, s);
        if (void 0 !== n) n.handleChange(t, e, s);
        if (void 0 !== o) {
            const r = o.length;
            let i;
            let n = 0;
            for (;n < r; ++n) {
                i = o[n];
                if (void 0 !== i) i.handleChange(t, e, s);
            }
        }
    }
    notifyCollection(t, e) {
        const s = this.s0;
        const r = this.s1;
        const i = this.s2;
        let n = this.sr;
        if (void 0 !== n) n = n.slice();
        if (void 0 !== s) s.handleCollectionChange(t, e);
        if (void 0 !== r) r.handleCollectionChange(t, e);
        if (void 0 !== i) i.handleCollectionChange(t, e);
        if (void 0 !== n) {
            const s = n.length;
            let r;
            let i = 0;
            for (;i < s; ++i) {
                r = n[i];
                if (void 0 !== r) r.handleCollectionChange(t, e);
            }
        }
    }
}

function M() {
    return B(this, "subs", new SubscriberRecord);
}

function F(t) {
    return this.subs.add(t);
}

function V(t) {
    return this.subs.remove(t);
}

function D(t) {
    return null == t ? N : N(t);
}

function N(t) {
    const e = t.prototype;
    S(e, "queue", {
        get: K
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
        const e = this.i;
        let s;
        try {
            for (s of e) {
                e.delete(s);
                s.flush();
            }
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

function K() {
    return FlushQueue.instance;
}

class CollectionLengthObserver {
    constructor(t) {
        this.owner = t;
        this.f = 0;
        this.type = 18;
        this.value = this.oldvalue = (this.obj = t.collection).length;
    }
    getValue() {
        return this.obj.length;
    }
    setValue(e, s) {
        const r = this.value;
        if (e !== r && t.isArrayIndex(e)) {
            if (0 === (256 & s)) this.obj.length = e;
            this.value = e;
            this.oldvalue = r;
            this.f = s;
            this.queue.add(this);
        }
    }
    handleCollectionChange(t, e) {
        const s = this.value;
        const r = this.obj.length;
        if ((this.value = r) !== s) {
            this.oldvalue = s;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        Q = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, Q, this.f);
    }
}

class CollectionSizeObserver {
    constructor(t) {
        this.owner = t;
        this.f = 0;
        this.value = this.oldvalue = (this.obj = t.collection).size;
        this.type = this.obj instanceof Map ? 66 : 34;
    }
    getValue() {
        return this.obj.size;
    }
    setValue() {
        throw new Error("AUR02");
    }
    handleCollectionChange(t, e) {
        const s = this.value;
        const r = this.obj.size;
        if ((this.value = r) !== s) {
            this.oldvalue = s;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        Q = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, Q, this.f);
    }
}

function q(t) {
    const e = t.prototype;
    $(e, "subscribe", _, true);
    $(e, "unsubscribe", H, true);
    D(t);
    j(t);
}

function _(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function H(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

q(CollectionLengthObserver);

q(CollectionSizeObserver);

let Q;

const W = new WeakMap;

function z(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function G(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function Z(t, e, s, r, i) {
    let n, o, h, c, u;
    let a, l;
    for (a = s + 1; a < r; a++) {
        n = t[a];
        o = e[a];
        for (l = a - 1; l >= s; l--) {
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

function J(t, e, s, r, i) {
    let n = 0, o = 0;
    let h, c, u;
    let a, l, f;
    let d, p, v;
    let g, b;
    let w, x, m, E;
    let y, A, U, O;
    while (true) {
        if (r - s <= 10) {
            Z(t, e, s, r, i);
            return;
        }
        n = s + (r - s >> 1);
        h = t[s];
        a = e[s];
        c = t[r - 1];
        l = e[r - 1];
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
        t[s] = h;
        e[s] = a;
        t[r - 1] = u;
        e[r - 1] = f;
        w = c;
        x = l;
        m = s + 1;
        E = r - 1;
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
        if (r - E < m - s) {
            J(t, e, E, r, i);
            r = m;
        } else {
            J(t, e, s, m, i);
            s = E;
        }
    }
}

const X = Array.prototype;

const Y = X.push;

const tt = X.unshift;

const et = X.pop;

const st = X.shift;

const rt = X.splice;

const it = X.reverse;

const nt = X.sort;

const ot = {
    push: Y,
    unshift: tt,
    pop: et,
    shift: st,
    splice: rt,
    reverse: it,
    sort: nt
};

const ht = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const ct = {
    push: function(...t) {
        const e = W.get(this);
        if (void 0 === e) return Y.apply(this, t);
        const s = this.length;
        const r = t.length;
        if (0 === r) return s;
        this.length = e.indexMap.length = s + r;
        let i = s;
        while (i < this.length) {
            this[i] = t[i - s];
            e.indexMap[i] = -2;
            i++;
        }
        e.notify();
        return this.length;
    },
    unshift: function(...t) {
        const e = W.get(this);
        if (void 0 === e) return tt.apply(this, t);
        const s = t.length;
        const r = new Array(s);
        let i = 0;
        while (i < s) r[i++] = -2;
        tt.apply(e.indexMap, r);
        const n = tt.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = W.get(this);
        if (void 0 === t) return et.call(this);
        const e = t.indexMap;
        const s = et.call(this);
        const r = e.length - 1;
        if (e[r] > -1) e.deletedItems.push(e[r]);
        et.call(e);
        t.notify();
        return s;
    },
    shift: function() {
        const t = W.get(this);
        if (void 0 === t) return st.call(this);
        const e = t.indexMap;
        const s = st.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        st.call(e);
        t.notify();
        return s;
    },
    splice: function(...t) {
        const e = t[0];
        const s = t[1];
        const r = W.get(this);
        if (void 0 === r) return rt.apply(this, t);
        const i = this.length;
        const n = 0 | e;
        const o = n < 0 ? Math.max(i + n, 0) : Math.min(n, i);
        const h = r.indexMap;
        const c = t.length;
        const u = 0 === c ? 0 : 1 === c ? i - o : s;
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
            const r = new Array(t);
            let i = 0;
            while (i < t) r[i++] = -2;
            rt.call(h, e, s, ...r);
        } else rt.apply(h, t);
        const a = rt.apply(this, t);
        r.notify();
        return a;
    },
    reverse: function() {
        const t = W.get(this);
        if (void 0 === t) {
            it.call(this);
            return this;
        }
        const e = this.length;
        const s = e / 2 | 0;
        let r = 0;
        while (r !== s) {
            const s = e - r - 1;
            const i = this[r];
            const n = t.indexMap[r];
            const o = this[s];
            const h = t.indexMap[s];
            this[r] = o;
            t.indexMap[r] = h;
            this[s] = i;
            t.indexMap[s] = n;
            r++;
        }
        t.notify();
        return this;
    },
    sort: function(t) {
        const e = W.get(this);
        if (void 0 === e) {
            nt.call(this, t);
            return this;
        }
        const s = this.length;
        if (s < 2) return this;
        J(this, e.indexMap, 0, s, G);
        let r = 0;
        while (r < s) {
            if (void 0 === this[r]) break;
            r++;
        }
        if (void 0 === t || "function" !== typeof t) t = z;
        J(this, e.indexMap, 0, r, t);
        e.notify();
        return this;
    }
};

for (const t of ht) S(ct[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let ut = false;

function at() {
    for (const t of ht) if (true !== X[t].observing) B(X, t, ct[t]);
}

function lt() {
    for (const t of ht) if (true === X[t].observing) B(X, t, ot[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!ut) {
            ut = true;
            at();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = P(t.length);
        this.lenObs = void 0;
        W.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = P(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionLengthObserver(this);
    }
    getIndexObserver(t) {
        var e;
        var s;
        return null !== (e = (s = this.indexObservers)[t]) && void 0 !== e ? e : s[t] = new ArrayIndexObserver(this, t);
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
        const s = this.owner;
        const r = this.index;
        const i = s.indexMap;
        if (i[r] > -1) i.deletedItems.push(i[r]);
        i[r] = -2;
        s.collection[r] = t;
        s.notify();
    }
    handleCollectionChange(t, e) {
        const s = this.index;
        const r = t[s] === s;
        if (r) return;
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

j(ArrayObserver);

j(ArrayIndexObserver);

function ft(t) {
    let e = W.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function dt(t) {
    let e = 0;
    let s = 0;
    const r = t.length;
    for (let i = 0; i < r; ++i) {
        while (t.deletedItems[s] <= i - e) {
            ++s;
            --e;
        }
        if (-2 === t[i]) ++e; else t[i] += e;
    }
}

function pt(t, e) {
    const s = t.slice();
    const r = e.length;
    let i = 0;
    let n = 0;
    while (i < r) {
        n = e[i];
        if (-2 !== n) t[i] = s[n];
        ++i;
    }
}

const vt = new WeakMap;

const gt = Set.prototype;

const bt = gt.add;

const wt = gt.clear;

const xt = gt.delete;

const mt = {
    add: bt,
    clear: wt,
    delete: xt
};

const Et = [ "add", "clear", "delete" ];

const yt = {
    add: function(t) {
        const e = vt.get(this);
        if (void 0 === e) {
            bt.call(this, t);
            return this;
        }
        const s = this.size;
        bt.call(this, t);
        const r = this.size;
        if (r === s) return this;
        e.indexMap[s] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = vt.get(this);
        if (void 0 === t) return wt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let s = 0;
            for (const t of this.keys()) {
                if (e[s] > -1) e.deletedItems.push(e[s]);
                s++;
            }
            wt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = vt.get(this);
        if (void 0 === e) return xt.call(this, t);
        const s = this.size;
        if (0 === s) return false;
        let r = 0;
        const i = e.indexMap;
        for (const s of this.keys()) {
            if (s === t) {
                if (i[r] > -1) i.deletedItems.push(i[r]);
                i.splice(r, 1);
                const s = xt.call(this, t);
                if (true === s) e.notify();
                return s;
            }
            r++;
        }
        return false;
    }
};

const At = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Et) S(yt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Ut = false;

function Ot() {
    for (const t of Et) if (true !== gt[t].observing) S(gt, t, {
        ...At,
        value: yt[t]
    });
}

function Ct() {
    for (const t of Et) if (true === gt[t].observing) S(gt, t, {
        ...At,
        value: mt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Ut) {
            Ut = true;
            Ot();
        }
        this.collection = t;
        this.indexMap = P(t.size);
        this.lenObs = void 0;
        vt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = P(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

j(SetObserver);

function St(t) {
    let e = vt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Bt = new WeakMap;

const $t = Map.prototype;

const Lt = $t.set;

const kt = $t.clear;

const Pt = $t.delete;

const Tt = {
    set: Lt,
    clear: kt,
    delete: Pt
};

const Rt = [ "set", "clear", "delete" ];

const jt = {
    set: function(t, e) {
        const s = Bt.get(this);
        if (void 0 === s) {
            Lt.call(this, t, e);
            return this;
        }
        const r = this.get(t);
        const i = this.size;
        Lt.call(this, t, e);
        const n = this.size;
        if (n === i) {
            let e = 0;
            for (const i of this.entries()) {
                if (i[0] === t) {
                    if (i[1] !== r) {
                        s.indexMap.deletedItems.push(s.indexMap[e]);
                        s.indexMap[e] = -2;
                        s.notify();
                    }
                    return this;
                }
                e++;
            }
            return this;
        }
        s.indexMap[i] = -2;
        s.notify();
        return this;
    },
    clear: function() {
        const t = Bt.get(this);
        if (void 0 === t) return kt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let s = 0;
            for (const t of this.keys()) {
                if (e[s] > -1) e.deletedItems.push(e[s]);
                s++;
            }
            kt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Bt.get(this);
        if (void 0 === e) return Pt.call(this, t);
        const s = this.size;
        if (0 === s) return false;
        let r = 0;
        const i = e.indexMap;
        for (const s of this.keys()) {
            if (s === t) {
                if (i[r] > -1) i.deletedItems.push(i[r]);
                i.splice(r, 1);
                const s = Pt.call(this, t);
                if (true === s) e.notify();
                return s;
            }
            ++r;
        }
        return false;
    }
};

const It = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Rt) S(jt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Mt = false;

function Ft() {
    for (const t of Rt) if (true !== $t[t].observing) S($t, t, {
        ...It,
        value: jt[t]
    });
}

function Vt() {
    for (const t of Rt) if (true === $t[t].observing) S($t, t, {
        ...It,
        value: Tt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!Mt) {
            Mt = true;
            Ft();
        }
        this.collection = t;
        this.indexMap = P(t.size);
        this.lenObs = void 0;
        Bt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = P(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

j(MapObserver);

function Dt(t) {
    let e = Bt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function Nt(t, e) {
    const s = this.oL.getObserver(t, e);
    this.obs.add(s);
}

function Kt() {
    return B(this, "obs", new BindingObserverRecord(this));
}

function qt(t) {
    let e;
    if (t instanceof Array) e = ft(t); else if (t instanceof Set) e = St(t); else if (t instanceof Map) e = Dt(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function _t(t) {
    this.obs.add(t);
}

function Ht() {
    throw new Error(`AUR2011:handleChange`);
}

function Qt() {
    throw new Error("AUR2012:handleCollectionChange");
}

class BindingObserverRecord {
    constructor(t) {
        this.binding = t;
        this.version = 0;
        this.count = 0;
        this.slots = 0;
    }
    handleChange(t, e, s) {
        return this.binding.interceptor.handleChange(t, e, s);
    }
    handleCollectionChange(t, e) {
        this.binding.interceptor.handleCollectionChange(t, e);
    }
    add(t) {
        const e = this.slots;
        let s = e;
        while (s-- && this[`o${s}`] !== t) ;
        if (-1 === s) {
            s = 0;
            while (void 0 !== this[`o${s}`]) s++;
            this[`o${s}`] = t;
            t.subscribe(this);
            if (s === e) this.slots = s + 1;
            ++this.count;
        }
        this[`v${s}`] = this.version;
    }
    clear(t) {
        const e = this.slots;
        let s;
        let r;
        let i = 0;
        if (true === t) {
            for (;i < e; ++i) {
                s = `o${i}`;
                r = this[s];
                if (void 0 !== r) {
                    this[s] = void 0;
                    r.unsubscribe(this);
                }
            }
            this.count = this.slots = 0;
        } else for (;i < e; ++i) if (this[`v${i}`] !== this.version) {
            s = `o${i}`;
            r = this[s];
            if (void 0 !== r) {
                this[s] = void 0;
                r.unsubscribe(this);
                this.count--;
            }
        }
    }
}

function Wt(t) {
    const e = t.prototype;
    $(e, "observe", Nt, true);
    $(e, "observeCollection", qt, true);
    $(e, "subscribeTo", _t, true);
    S(e, "obs", {
        get: Kt
    });
    $(e, "handleChange", Ht);
    $(e, "handleCollectionChange", Qt);
    return t;
}

function zt(t) {
    return null == t ? Wt : Wt(t);
}

class BindingMediator {
    constructor(t, e, s, r) {
        this.key = t;
        this.binding = e;
        this.oL = s;
        this.locator = r;
        this.interceptor = this;
    }
    $bind() {
        throw new Error("AUR0213:$bind");
    }
    $unbind() {
        throw new Error("AUR0214:$unbind");
    }
    handleChange(t, e, s) {
        this.binding[this.key](t, e, s);
    }
}

Wt(BindingMediator);

const Gt = t.DI.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

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
                let s = this.interpolationLookup[t];
                if (void 0 === s) s = this.interpolationLookup[t] = this.$parse(t, e);
                return s;
            }

          case 539:
            {
                let s = this.forOfLookup[t];
                if (void 0 === s) s = this.forOfLookup[t] = this.$parse(t, e);
                return s;
            }

          default:
            {
                if (0 === t.length && e & (53 | 49 | 50)) return PrimitiveLiteralExpression.$empty;
                let s = this.expressionLookup[t];
                if (void 0 === s) s = this.expressionLookup[t] = this.$parse(t, e);
                return s;
            }
        }
    }
    $parse(t, e) {
        ie.ip = t;
        ie.length = t.length;
        ie.index = 0;
        ie.o = t.charCodeAt(0);
        return oe(ie, 0, 61, void 0 === e ? 53 : e);
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

function Zt(t) {
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

var Jt;

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
})(Jt || (Jt = {}));

const Xt = PrimitiveLiteralExpression.$false;

const Yt = PrimitiveLiteralExpression.$true;

const te = PrimitiveLiteralExpression.$null;

const ee = PrimitiveLiteralExpression.$undefined;

const se = AccessThisExpression.$this;

const re = AccessThisExpression.$parent;

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
        this.h = 0;
        this.u = 0;
        this.l = 1572864;
        this.g = "";
        this.m = true;
        this.length = t.length;
        this.o = t.charCodeAt(0);
    }
    get A() {
        return this.ip.slice(this.h, this.index);
    }
}

const ie = new ParserState("");

function ne(t, e) {
    ie.ip = t;
    ie.length = t.length;
    ie.index = 0;
    ie.o = t.charCodeAt(0);
    return oe(ie, 0, 61, void 0 === e ? 53 : e);
}

function oe(t, e, s, r) {
    if (284 === r) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (2048 & r) return ae(t);
        fe(t);
        if (1048576 & t.l) throw new Error(`AUR0151:${t.ip}`);
    }
    t.m = 448 > s;
    let i;
    if (32768 & t.l) {
        const s = Ee[63 & t.l];
        fe(t);
        i = new UnaryExpression(s, oe(t, e, 449, r));
        t.m = false;
    } else {
        t: switch (t.l) {
          case 3078:
            t.m = false;
            do {
                fe(t);
                e++;
                if (xe(t, 16393)) {
                    if (16393 === t.l) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.l) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.l) {
                    const t = 511 & e;
                    i = 0 === t ? se : 1 === t ? re : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`AUR0154:${t.ip}`);
            } while (3078 === t.l);

          case 1024:
            if (512 & r) i = new BindingIdentifier(t.g); else {
                i = new AccessScopeExpression(t.g, 511 & e);
                e = 1024;
            }
            t.m = true;
            fe(t);
            break;

          case 3076:
            t.m = false;
            fe(t);
            i = se;
            e = 512;
            break;

          case 671751:
            fe(t);
            i = oe(t, 0, 62, r);
            me(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = he(t, e, r);
            e = 0;
            break;

          case 131080:
            i = ue(t, r);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.g ]);
            t.m = false;
            fe(t);
            e = 0;
            break;

          case 540715:
            i = le(t, e, r, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.g);
            t.m = false;
            fe(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = Ee[63 & t.l];
            t.m = false;
            fe(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (512 & r) return ce(t, i);
        if (449 < s) return i;
        let n = t.g;
        while ((16384 & t.l) > 0) {
            const s = [];
            let o;
            switch (t.l) {
              case 16393:
                t.m = true;
                fe(t);
                if (0 === (3072 & t.l)) throw new Error(`AUR0153:${t.ip}`);
                n = t.g;
                fe(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.l) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.m = true;
                fe(t);
                e = 4096;
                i = new AccessKeyedExpression(i, oe(t, 0, 62, r));
                me(t, 1835022);
                break;

              case 671751:
                t.m = false;
                fe(t);
                while (1835019 !== t.l) {
                    s.push(oe(t, 0, 62, r));
                    if (!xe(t, 1572876)) break;
                }
                me(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, s, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, s); else i = new CallFunctionExpression(i, s);
                e = 0;
                break;

              case 540714:
                t.m = false;
                o = [ t.g ];
                i = new TaggedTemplateExpression(o, o, i);
                fe(t);
                break;

              case 540715:
                i = le(t, e, r, i, true);
            }
        }
    }
    if (448 < s) return i;
    while ((65536 & t.l) > 0) {
        const n = t.l;
        if ((448 & n) <= s) break;
        fe(t);
        i = new BinaryExpression(Ee[63 & n], i, oe(t, e, 448 & n, r));
        t.m = false;
    }
    if (63 < s) return i;
    if (xe(t, 1572880)) {
        const s = oe(t, e, 62, r);
        me(t, 1572879);
        i = new ConditionalExpression(i, s, oe(t, e, 62, r));
        t.m = false;
    }
    if (62 < s) return i;
    if (xe(t, 1048616)) {
        if (!t.m) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, oe(t, e, 62, r));
    }
    if (61 < s) return i;
    while (xe(t, 1572884)) {
        if (1572864 === t.l) throw new Error(`AUR0159:${t.ip}`);
        const s = t.g;
        fe(t);
        const n = new Array;
        while (xe(t, 1572879)) n.push(oe(t, e, 62, r));
        i = new ValueConverterExpression(i, s, n);
    }
    while (xe(t, 1572883)) {
        if (1572864 === t.l) throw new Error(`AUR0160:${t.ip}`);
        const s = t.g;
        fe(t);
        const n = new Array;
        while (xe(t, 1572879)) n.push(oe(t, e, 62, r));
        i = new BindingBehaviorExpression(i, s, n);
    }
    if (1572864 !== t.l) {
        if (2048 & r) return i;
        if ("of" === t.A) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function he(t, e, s) {
    fe(t);
    const r = new Array;
    while (1835022 !== t.l) if (xe(t, 1572876)) {
        r.push(ee);
        if (1835022 === t.l) break;
    } else {
        r.push(oe(t, e, 62, ~512 & s));
        if (xe(t, 1572876)) {
            if (1835022 === t.l) break;
        } else break;
    }
    me(t, 1835022);
    if (512 & s) return new ArrayBindingPattern(r); else {
        t.m = false;
        return new ArrayLiteralExpression(r);
    }
}

function ce(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.l) throw new Error(`AUR0163:${t.ip}`);
    fe(t);
    const s = e;
    const r = oe(t, 0, 61, 0);
    return new ForOfStatement(s, r);
}

function ue(t, e) {
    const s = new Array;
    const r = new Array;
    fe(t);
    while (1835018 !== t.l) {
        s.push(t.g);
        if (12288 & t.l) {
            fe(t);
            me(t, 1572879);
            r.push(oe(t, 0, 62, ~512 & e));
        } else if (3072 & t.l) {
            const {o: s, l: i, index: n} = t;
            fe(t);
            if (xe(t, 1572879)) r.push(oe(t, 0, 62, ~512 & e)); else {
                t.o = s;
                t.l = i;
                t.index = n;
                r.push(oe(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.l) me(t, 1572876);
    }
    me(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(s, r); else {
        t.m = false;
        return new ObjectLiteralExpression(s, r);
    }
}

function ae(t) {
    const e = [];
    const s = [];
    const r = t.length;
    let i = "";
    while (t.index < r) {
        switch (t.o) {
          case 36:
            if (123 === t.ip.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.o = t.ip.charCodeAt(t.index);
                fe(t);
                const r = oe(t, 0, 61, 2048);
                s.push(r);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(Zt(de(t)));
            break;

          default:
            i += String.fromCharCode(t.o);
        }
        de(t);
    }
    if (s.length) {
        e.push(i);
        return new Interpolation(e, s);
    }
    return null;
}

function le(t, e, s, r, i) {
    const n = [ t.g ];
    me(t, 540715);
    const o = [ oe(t, e, 62, s) ];
    while (540714 !== (t.l = we(t))) {
        n.push(t.g);
        me(t, 540715);
        o.push(oe(t, e, 62, s));
    }
    n.push(t.g);
    t.m = false;
    if (i) {
        fe(t);
        return new TaggedTemplateExpression(n, n, r, o);
    } else {
        fe(t);
        return new TemplateExpression(n, o);
    }
}

function fe(t) {
    while (t.index < t.length) {
        t.h = t.index;
        if (null != (t.l = $e[t.o](t))) return;
    }
    t.l = 1572864;
}

function de(t) {
    return t.o = t.ip.charCodeAt(++t.index);
}

function pe(t) {
    while (Be[de(t)]) ;
    const e = ye[t.g = t.A];
    return void 0 === e ? 1024 : e;
}

function ve(t, e) {
    let s = t.o;
    if (false === e) {
        do {
            s = de(t);
        } while (s <= 57 && s >= 48);
        if (46 !== s) {
            t.g = parseInt(t.A, 10);
            return 8192;
        }
        s = de(t);
        if (t.index >= t.length) {
            t.g = parseInt(t.A.slice(0, -1), 10);
            return 8192;
        }
    }
    if (s <= 57 && s >= 48) do {
        s = de(t);
    } while (s <= 57 && s >= 48); else t.o = t.ip.charCodeAt(--t.index);
    t.g = parseFloat(t.A);
    return 8192;
}

function ge(t) {
    const e = t.o;
    de(t);
    let s = 0;
    const r = new Array;
    let i = t.index;
    while (t.o !== e) if (92 === t.o) {
        r.push(t.ip.slice(i, t.index));
        de(t);
        s = Zt(t.o);
        de(t);
        r.push(String.fromCharCode(s));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else de(t);
    const n = t.ip.slice(i, t.index);
    de(t);
    r.push(n);
    const o = r.join("");
    t.g = o;
    return 4096;
}

function be(t) {
    let e = true;
    let s = "";
    while (96 !== de(t)) if (36 === t.o) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else s += "$"; else if (92 === t.o) s += String.fromCharCode(Zt(de(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        s += String.fromCharCode(t.o);
    }
    de(t);
    t.g = s;
    if (e) return 540714;
    return 540715;
}

function we(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return be(t);
}

function xe(t, e) {
    if (t.l === e) {
        fe(t);
        return true;
    }
    return false;
}

function me(t, e) {
    if (t.l === e) fe(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const Ee = [ Xt, Yt, te, ee, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const ye = Object.create(null);

ye.true = 2049;

ye.null = 2050;

ye.false = 2048;

ye.undefined = 2051;

ye.$this = 3076;

ye.$parent = 3078;

ye.in = 1640799;

ye.instanceof = 1640800;

ye.typeof = 34851;

ye.void = 34852;

ye.of = 1051180;

const Ae = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Ue(t, e, s, r) {
    const i = s.length;
    for (let n = 0; n < i; n += 2) {
        const i = s[n];
        let o = s[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(r, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function Oe(t) {
    return e => {
        de(e);
        return t;
    };
}

const Ce = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

Ce.notMapped = true;

const Se = new Set;

Ue(null, Se, Ae.AsciiIdPart, true);

const Be = new Uint8Array(65535);

Ue(Be, null, Ae.IdStart, 1);

Ue(Be, null, Ae.Digit, 1);

const $e = new Array(65535);

$e.fill(Ce, 0, 65535);

Ue($e, null, Ae.Skip, (t => {
    de(t);
    return null;
}));

Ue($e, null, Ae.IdStart, pe);

Ue($e, null, Ae.Digit, (t => ve(t, false)));

$e[34] = $e[39] = t => ge(t);

$e[96] = t => be(t);

$e[33] = t => {
    if (61 !== de(t)) return 32809;
    if (61 !== de(t)) return 1638680;
    de(t);
    return 1638682;
};

$e[61] = t => {
    if (61 !== de(t)) return 1048616;
    if (61 !== de(t)) return 1638679;
    de(t);
    return 1638681;
};

$e[38] = t => {
    if (38 !== de(t)) return 1572883;
    de(t);
    return 1638614;
};

$e[124] = t => {
    if (124 !== de(t)) return 1572884;
    de(t);
    return 1638549;
};

$e[46] = t => {
    if (de(t) <= 57 && t.o >= 48) return ve(t, true);
    return 16393;
};

$e[60] = t => {
    if (61 !== de(t)) return 1638747;
    de(t);
    return 1638749;
};

$e[62] = t => {
    if (61 !== de(t)) return 1638748;
    de(t);
    return 1638750;
};

$e[37] = Oe(1638886);

$e[40] = Oe(671751);

$e[41] = Oe(1835019);

$e[42] = Oe(1638885);

$e[43] = Oe(623009);

$e[44] = Oe(1572876);

$e[45] = Oe(623010);

$e[47] = Oe(1638887);

$e[58] = Oe(1572879);

$e[63] = Oe(1572880);

$e[91] = Oe(671757);

$e[93] = Oe(1835022);

$e[123] = Oe(131080);

$e[125] = Oe(1835018);

let Le = null;

const ke = [];

let Pe = false;

function Te() {
    Pe = false;
}

function Re() {
    Pe = true;
}

function je() {
    return Le;
}

function Ie(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == Le) {
        Le = t;
        ke[0] = Le;
        Pe = true;
        return;
    }
    if (Le === t) throw new Error("AUR0207");
    ke.push(Le);
    Le = t;
    Pe = true;
}

function Me(t) {
    if (null == t) throw new Error("AUR0208");
    if (Le !== t) throw new Error("AUR0209");
    ke.pop();
    Le = ke.length > 0 ? ke[ke.length - 1] : null;
    Pe = null != Le;
}

const Fe = Object.freeze({
    get current() {
        return Le;
    },
    get connecting() {
        return Pe;
    },
    enter: Ie,
    exit: Me,
    pause: Te,
    resume: Re
});

const Ve = Reflect.get;

const De = Object.prototype.toString;

const Ne = new WeakMap;

function Ke(t) {
    switch (De.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const qe = "__raw__";

function _e(t) {
    return Ke(t) ? He(t) : t;
}

function He(t) {
    var e;
    return null !== (e = Ne.get(t)) && void 0 !== e ? e : Ge(t);
}

function Qe(t) {
    var e;
    return null !== (e = t[qe]) && void 0 !== e ? e : t;
}

function We(t) {
    return Ke(t) && t[qe] || t;
}

function ze(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function Ge(t) {
    const e = t instanceof Array ? Je : t instanceof Map || t instanceof Set ? ms : Ze;
    const s = new Proxy(t, e);
    Ne.set(t, s);
    return s;
}

const Ze = {
    get(t, e, s) {
        if (e === qe) return t;
        const r = je();
        if (!Pe || ze(e) || null == r) return Ve(t, e, s);
        r.observe(t, e);
        return _e(Ve(t, e, s));
    }
};

const Je = {
    get(t, e, s) {
        if (e === qe) return t;
        const r = je();
        if (!Pe || ze(e) || null == r) return Ve(t, e, s);
        switch (e) {
          case "length":
            r.observe(t, "length");
            return t.length;

          case "map":
            return Xe;

          case "includes":
            return es;

          case "indexOf":
            return ss;

          case "lastIndexOf":
            return rs;

          case "every":
            return Ye;

          case "filter":
            return ts;

          case "find":
            return ns;

          case "findIndex":
            return is;

          case "flat":
            return os;

          case "flatMap":
            return hs;

          case "join":
            return cs;

          case "push":
            return as;

          case "pop":
            return us;

          case "reduce":
            return ws;

          case "reduceRight":
            return xs;

          case "reverse":
            return ps;

          case "shift":
            return ls;

          case "unshift":
            return fs;

          case "slice":
            return bs;

          case "splice":
            return ds;

          case "some":
            return vs;

          case "sort":
            return gs;

          case "keys":
            return Bs;

          case "values":
          case Symbol.iterator:
            return $s;

          case "entries":
            return Ls;
        }
        r.observe(t, e);
        return _e(Ve(t, e, s));
    },
    ownKeys(t) {
        var e;
        null === (e = je()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function Xe(t, e) {
    var s;
    const r = Qe(this);
    const i = r.map(((s, r) => We(t.call(e, _e(s), r, this))));
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return _e(i);
}

function Ye(t, e) {
    var s;
    const r = Qe(this);
    const i = r.every(((s, r) => t.call(e, _e(s), r, this)));
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function ts(t, e) {
    var s;
    const r = Qe(this);
    const i = r.filter(((s, r) => We(t.call(e, _e(s), r, this))));
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return _e(i);
}

function es(t) {
    var e;
    const s = Qe(this);
    const r = s.includes(We(t));
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function ss(t) {
    var e;
    const s = Qe(this);
    const r = s.indexOf(We(t));
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function rs(t) {
    var e;
    const s = Qe(this);
    const r = s.lastIndexOf(We(t));
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function is(t, e) {
    var s;
    const r = Qe(this);
    const i = r.findIndex(((s, r) => We(t.call(e, _e(s), r, this))));
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function ns(t, e) {
    var s;
    const r = Qe(this);
    const i = r.find(((e, s) => t(_e(e), s, this)), e);
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return _e(i);
}

function os() {
    var t;
    const e = Qe(this);
    null === (t = je()) || void 0 === t ? void 0 : t.observeCollection(e);
    return _e(e.flat());
}

function hs(t, e) {
    var s;
    const r = Qe(this);
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return He(r.flatMap(((s, r) => _e(t.call(e, _e(s), r, this)))));
}

function cs(t) {
    var e;
    const s = Qe(this);
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return s.join(t);
}

function us() {
    return _e(Qe(this).pop());
}

function as(...t) {
    return Qe(this).push(...t);
}

function ls() {
    return _e(Qe(this).shift());
}

function fs(...t) {
    return Qe(this).unshift(...t);
}

function ds(...t) {
    return _e(Qe(this).splice(...t));
}

function ps(...t) {
    var e;
    const s = Qe(this);
    const r = s.reverse();
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return _e(r);
}

function vs(t, e) {
    var s;
    const r = Qe(this);
    const i = r.some(((s, r) => We(t.call(e, _e(s), r, this))));
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function gs(t) {
    var e;
    const s = Qe(this);
    const r = s.sort(t);
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return _e(r);
}

function bs(t, e) {
    var s;
    const r = Qe(this);
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return He(r.slice(t, e));
}

function ws(t, e) {
    var s;
    const r = Qe(this);
    const i = r.reduce(((e, s, r) => t(e, _e(s), r, this)), e);
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return _e(i);
}

function xs(t, e) {
    var s;
    const r = Qe(this);
    const i = r.reduceRight(((e, s, r) => t(e, _e(s), r, this)), e);
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return _e(i);
}

const ms = {
    get(t, e, s) {
        if (e === qe) return t;
        const r = je();
        if (!Pe || ze(e) || null == r) return Ve(t, e, s);
        switch (e) {
          case "size":
            r.observe(t, "size");
            return t.size;

          case "clear":
            return Cs;

          case "delete":
            return Ss;

          case "forEach":
            return Es;

          case "add":
            if (t instanceof Set) return Os;
            break;

          case "get":
            if (t instanceof Map) return As;
            break;

          case "set":
            if (t instanceof Map) return Us;
            break;

          case "has":
            return ys;

          case "keys":
            return Bs;

          case "values":
            return $s;

          case "entries":
            return Ls;

          case Symbol.iterator:
            return t instanceof Map ? Ls : $s;
        }
        return _e(Ve(t, e, s));
    }
};

function Es(t, e) {
    var s;
    const r = Qe(this);
    null === (s = je()) || void 0 === s ? void 0 : s.observeCollection(r);
    return r.forEach(((s, r) => {
        t.call(e, _e(s), _e(r), this);
    }));
}

function ys(t) {
    var e;
    const s = Qe(this);
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return s.has(We(t));
}

function As(t) {
    var e;
    const s = Qe(this);
    null === (e = je()) || void 0 === e ? void 0 : e.observeCollection(s);
    return _e(s.get(We(t)));
}

function Us(t, e) {
    return _e(Qe(this).set(We(t), We(e)));
}

function Os(t) {
    return _e(Qe(this).add(We(t)));
}

function Cs() {
    return _e(Qe(this).clear());
}

function Ss(t) {
    return _e(Qe(this).delete(We(t)));
}

function Bs() {
    var t;
    const e = Qe(this);
    null === (t = je()) || void 0 === t ? void 0 : t.observeCollection(e);
    const s = e.keys();
    return {
        next() {
            const t = s.next();
            const e = t.value;
            const r = t.done;
            return r ? {
                value: void 0,
                done: r
            } : {
                value: _e(e),
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function $s() {
    var t;
    const e = Qe(this);
    null === (t = je()) || void 0 === t ? void 0 : t.observeCollection(e);
    const s = e.values();
    return {
        next() {
            const t = s.next();
            const e = t.value;
            const r = t.done;
            return r ? {
                value: void 0,
                done: r
            } : {
                value: _e(e),
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Ls() {
    var t;
    const e = Qe(this);
    null === (t = je()) || void 0 === t ? void 0 : t.observeCollection(e);
    const s = e.entries();
    return {
        next() {
            const t = s.next();
            const e = t.value;
            const r = t.done;
            return r ? {
                value: void 0,
                done: r
            } : {
                value: [ _e(e[0]), _e(e[1]) ],
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const ks = Object.freeze({
    getProxy: He,
    getRaw: Qe,
    wrap: _e,
    unwrap: We,
    rawKey: qe
});

class ComputedObserver {
    constructor(t, e, s, r, i) {
        this.obj = t;
        this.get = e;
        this.set = s;
        this.useProxy = r;
        this.interceptor = this;
        this.type = 1;
        this.value = void 0;
        this.U = void 0;
        this.running = false;
        this.O = false;
        this.oL = i;
    }
    static create(t, e, s, r, i) {
        const n = s.get;
        const o = s.set;
        const h = new ComputedObserver(t, n, o, i, r);
        const c = () => h.getValue();
        c.getObserver = () => h;
        S(t, e, {
            enumerable: s.enumerable,
            configurable: true,
            get: c,
            set: t => {
                h.setValue(t, 0);
            }
        });
        return h;
    }
    getValue() {
        if (0 === this.subs.count) return this.get.call(this.obj, this);
        if (this.O) {
            this.compute();
            this.O = false;
        }
        return this.value;
    }
    setValue(t, e) {
        if ("function" === typeof this.set) {
            if (t !== this.value) {
                this.running = true;
                this.set.call(this.obj, t);
                this.running = false;
                this.run();
            }
        } else throw new Error("AUR0221");
    }
    handleChange() {
        this.O = true;
        if (this.subs.count > 0) this.run();
    }
    handleCollectionChange() {
        this.O = true;
        if (this.subs.count > 0) this.run();
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.compute();
            this.O = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.O = true;
            this.obs.clear(true);
        }
    }
    flush() {
        Ps = this.U;
        this.U = this.value;
        this.subs.notify(this.value, Ps, 0);
    }
    run() {
        if (this.running) return;
        const t = this.value;
        const e = this.compute();
        this.O = false;
        if (!Object.is(e, t)) {
            this.U = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            Ie(this);
            return this.value = We(this.get.call(this.useProxy ? _e(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            Me(this);
        }
    }
}

zt(ComputedObserver);

j(ComputedObserver);

D(ComputedObserver);

let Ps;

const Ts = t.DI.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Rs = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const js = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.C = null;
        this.S = 0;
        this.check = () => {
            if (Rs.disabled) return;
            if (++this.S < Rs.timeoutsPerCheck) return;
            this.S = 0;
            const t = this.tracked;
            const e = t.length;
            let s;
            let r = 0;
            for (;r < e; ++r) {
                s = t[r];
                if (s.isDirty()) this.queue.add(s);
            }
        };
    }
    createProperty(t, e) {
        if (Rs.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.C = this.p.taskQueue.queueTask(this.check, js);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.C.cancel();
            this.C = null;
        }
    }
}

DirtyChecker.inject = [ t.IPlatform ];

D(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, s) {
        this.obj = e;
        this.key = s;
        this.type = 0;
        this.U = void 0;
        this.B = t;
    }
    getValue() {
        return this.obj[this.key];
    }
    setValue(t, e) {
        throw new Error(`Trying to set value for property ${this.key} in dirty checker`);
    }
    isDirty() {
        return this.U !== this.obj[this.key];
    }
    flush() {
        const t = this.U;
        const e = this.getValue();
        this.U = e;
        this.subs.notify(e, t, 0);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.U = this.obj[this.key];
            this.B.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.B.removeProperty(this);
    }
}

j(DirtyCheckProperty);

class PrimitiveObserver {
    constructor(t, e) {
        this.obj = t;
        this.propertyKey = e;
        this.type = 0;
    }
    get doNotCache() {
        return true;
    }
    getValue() {
        return this.obj[this.propertyKey];
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
    setValue(t, e, s, r) {
        s[r] = t;
    }
}

let Is;

class SetterObserver {
    constructor(t, e) {
        this.obj = t;
        this.propertyKey = e;
        this.value = void 0;
        this.oldValue = void 0;
        this.observing = false;
        this.type = 1;
        this.f = 0;
    }
    getValue() {
        return this.value;
    }
    setValue(t, e) {
        if (this.observing) {
            const s = this.value;
            if (Object.is(t, s)) return;
            this.value = t;
            this.oldValue = s;
            this.f = e;
            this.queue.add(this);
        } else this.obj[this.propertyKey] = t;
    }
    subscribe(t) {
        if (false === this.observing) this.start();
        this.subs.add(t);
    }
    flush() {
        Is = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Is, this.f);
    }
    start() {
        if (false === this.observing) {
            this.observing = true;
            this.value = this.obj[this.propertyKey];
            S(this.obj, this.propertyKey, {
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
        if (this.observing) {
            S(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.value
            });
            this.observing = false;
        }
        return this;
    }
}

class SetterNotifier {
    constructor(t, e, s, r) {
        this.type = 1;
        this.v = void 0;
        this.oV = void 0;
        this.f = 0;
        this.obj = t;
        this.s = s;
        const i = t[e];
        this.cb = "function" === typeof i ? i : void 0;
        this.v = r;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        var s;
        if ("function" === typeof this.s) t = this.s(t);
        if (!Object.is(t, this.v)) {
            this.oV = this.v;
            this.v = t;
            this.f = e;
            null === (s = this.cb) || void 0 === s ? void 0 : s.call(this.obj, this.v, this.oV, e);
            this.queue.add(this);
        }
    }
    flush() {
        Is = this.oV;
        this.oV = this.v;
        this.subs.notify(this.v, Is, this.f);
    }
}

j(SetterObserver);

j(SetterNotifier);

D(SetterObserver);

D(SetterNotifier);

const Ms = new PropertyAccessor;

const Fs = t.DI.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const Vs = t.DI.createInterface("INodeObserverLocator", (e => e.cachedCallback((e => {
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
        return Ms;
    }
    getAccessor() {
        return Ms;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.B = t;
        this.$ = e;
        this.L = [];
    }
    addAdapter(t) {
        this.L.push(t);
    }
    getObserver(t, e) {
        var s, r;
        return null !== (r = null === (s = t.$observers) || void 0 === s ? void 0 : s[e]) && void 0 !== r ? r : this.k(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var s;
        const r = null === (s = t.$observers) || void 0 === s ? void 0 : s[e];
        if (void 0 !== r) return r;
        if (this.$.handles(t, e, this)) return this.$.getAccessor(t, e, this);
        return Ms;
    }
    getArrayObserver(t) {
        return ft(t);
    }
    getMapObserver(t) {
        return Dt(t);
    }
    getSetObserver(t) {
        return St(t);
    }
    createObserver(e, s) {
        var r, i, n, o;
        if (!(e instanceof Object)) return new PrimitiveObserver(e, s);
        if (this.$.handles(e, s, this)) return this.$.getObserver(e, s, this);
        switch (s) {
          case "length":
            if (e instanceof Array) return ft(e).getLengthObserver();
            break;

          case "size":
            if (e instanceof Map) return Dt(e).getLengthObserver(); else if (e instanceof Set) return St(e).getLengthObserver();
            break;

          default:
            if (e instanceof Array && t.isArrayIndex(s)) return ft(e).getIndexObserver(Number(s));
            break;
        }
        let h = Ks(e, s);
        if (void 0 === h) {
            let t = Ns(e);
            while (null !== t) {
                h = Ks(t, s);
                if (void 0 === h) t = Ns(t); else break;
            }
        }
        if (void 0 !== h && !C.call(h, "value")) {
            let t = this.P(e, s, h);
            if (null == t) t = null === (o = null !== (i = null === (r = h.get) || void 0 === r ? void 0 : r.getObserver) && void 0 !== i ? i : null === (n = h.set) || void 0 === n ? void 0 : n.getObserver) || void 0 === o ? void 0 : o(e, this);
            return null == t ? h.configurable ? ComputedObserver.create(e, s, h, this, true) : this.B.createProperty(e, s) : t;
        }
        return new SetterObserver(e, s);
    }
    P(t, e, s) {
        if (this.L.length > 0) for (const r of this.L) {
            const i = r.getObserver(t, e, s, this);
            if (null != i) return i;
        }
        return null;
    }
    k(t, e, s) {
        if (true === s.doNotCache) return s;
        if (void 0 === t.$observers) {
            S(t, "$observers", {
                value: {
                    [e]: s
                }
            });
            return s;
        }
        return t.$observers[e] = s;
    }
}

ObserverLocator.inject = [ Ts, Vs ];

function Ds(t) {
    let e;
    if (t instanceof Array) e = ft(t); else if (t instanceof Map) e = Dt(t); else if (t instanceof Set) e = St(t);
    return e;
}

const Ns = Object.getPrototypeOf;

const Ks = Object.getOwnPropertyDescriptor;

const qs = t.DI.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ Fs ];
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
            Ie(this);
            this.fn(this);
        } finally {
            this.obs.clear(false);
            this.running = false;
            Me(this);
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
        this.obs.clear(true);
    }
}

zt(Effect);

function _s(t) {
    if (void 0 === t.$observers) S(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Hs = {};

function Qs(t, e, s) {
    if (null == e) return (e, s, i) => r(e, s, i, t);
    return r(t, e, s);
    function r(t, e, s, r) {
        var i;
        const n = void 0 === e;
        r = "object" !== typeof r ? {
            name: r
        } : r || {};
        if (n) e = r.name;
        if (null == e || "" === e) throw new Error("AUR0224");
        const o = r.callback || `${String(e)}Changed`;
        let h = Hs;
        if (s) {
            delete s.value;
            delete s.writable;
            h = null === (i = s.initializer) || void 0 === i ? void 0 : i.call(s);
            delete s.initializer;
        } else s = {
            configurable: true
        };
        if (!("enumerable" in s)) s.enumerable = true;
        const c = r.set;
        s.get = function t() {
            var s;
            const r = Ws(this, e, o, h, c);
            null === (s = je()) || void 0 === s ? void 0 : s.subscribeTo(r);
            return r.getValue();
        };
        s.set = function t(s) {
            Ws(this, e, o, h, c).setValue(s, 0);
        };
        s.get.getObserver = function t(s) {
            return Ws(s, e, o, h, c);
        };
        if (n) S(t.prototype, e, s); else return s;
    }
}

function Ws(t, e, s, r, i) {
    const n = _s(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, s, i, r === Hs ? void 0 : r);
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

exports.ConnectableSwitcher = Fe;

exports.CustomExpression = CustomExpression;

exports.DirtyCheckProperty = DirtyCheckProperty;

exports.DirtyCheckSettings = Rs;

exports.FlushQueue = FlushQueue;

exports.ForOfStatement = ForOfStatement;

exports.HtmlLiteralExpression = HtmlLiteralExpression;

exports.IDirtyChecker = Ts;

exports.IExpressionParser = Gt;

exports.INodeObserverLocator = Vs;

exports.IObservation = qs;

exports.IObserverLocator = Fs;

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

exports.ProxyObservable = ks;

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

exports.alias = c;

exports.applyMutationsToIndices = dt;

exports.bindingBehavior = f;

exports.cloneIndexMap = T;

exports.connectable = zt;

exports.copyIndexMap = k;

exports.createIndexMap = P;

exports.disableArrayObservation = lt;

exports.disableMapObservation = Vt;

exports.disableSetObservation = Ct;

exports.enableArrayObservation = at;

exports.enableMapObservation = Ft;

exports.enableSetObservation = Ot;

exports.getCollectionObserver = Ds;

exports.isIndexMap = R;

exports.observable = Qs;

exports.parse = oe;

exports.parseExpression = ne;

exports.registerAliases = u;

exports.subscriberCollection = j;

exports.synchronizeIndices = pt;

exports.valueConverter = g;

exports.withFlushQueue = D;
//# sourceMappingURL=index.js.map
