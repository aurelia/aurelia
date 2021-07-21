"use strict";

Object.defineProperty(exports, "t", {
    value: true
});

var t = require("@aurelia/kernel");

var e = require("@aurelia/platform");

function r(...e) {
    return function(r) {
        const s = t.Protocol.annotation.keyFor("aliases");
        const i = t.Metadata.getOwn(s, r);
        if (void 0 === i) t.Metadata.define(s, e, r); else i.push(...e);
    };
}

function s(e, r, s, i) {
    for (let n = 0, o = e.length; n < o; ++n) t.Registration.aliasTo(s, r.keyFrom(e[n])).register(i);
}

const i = Object.freeze({});

class BindingContext {
    constructor(t, e) {
        if (void 0 !== t) if (void 0 !== e) this[t] = e; else for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) this[e] = t[e];
    }
    static create(t, e) {
        return new BindingContext(t, e);
    }
    static get(t, e, r, s) {
        var n, o;
        if (null == t) throw new Error(`Scope is ${t}.`);
        let u = t.overrideContext;
        let c = t;
        if (r > 0) {
            while (r > 0) {
                r--;
                c = c.parentScope;
                if (null == (null === c || void 0 === c ? void 0 : c.overrideContext)) return;
            }
            u = c.overrideContext;
            return e in u ? u : u.bindingContext;
        }
        while (!(null === c || void 0 === c ? void 0 : c.isBoundary) && null != u && !(e in u) && !(u.bindingContext && e in u.bindingContext)) {
            c = null !== (n = c.parentScope) && void 0 !== n ? n : null;
            u = null !== (o = null === c || void 0 === c ? void 0 : c.overrideContext) && void 0 !== o ? o : null;
        }
        if (u) return e in u ? u : u.bindingContext;
        if (16 & s) return i;
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
        if (null == t) throw new Error(`OverrideContext is ${t}`);
        return new Scope(null, t.bindingContext, t, false);
    }
    static fromParent(t, e) {
        if (null == t) throw new Error(`ParentScope is ${t}`);
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

const n = t.DI.createInterface("ISignaler", (t => t.singleton(Signaler)));

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

function o(t) {
    return function(e) {
        return c.define(t, e);
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
        return new BindingBehaviorDefinition(r, t.firstDefined(c.getAnnotation(r, "name"), s), t.mergeArrays(c.getAnnotation(r, "aliases"), i.aliases, r.aliases), c.keyFrom(s), t.fromAnnotationOrDefinitionOrTypeOrDefault("strategy", i, r, (() => n ? 2 : 1)));
    }
    register(e) {
        const {Type: r, key: i, aliases: n, strategy: o} = this;
        switch (o) {
          case 1:
            t.Registration.singleton(i, r).register(e);
            break;

          case 2:
            t.Registration.instance(i, new BindingBehaviorFactory(e, r)).register(e);
            break;
        }
        t.Registration.aliasTo(i, r).register(e);
        s(n, c, i, e);
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
          case 1:
          case 2:
            return new this.Type(t, e);

          case 3:
            return new this.Type(r.get(s[0]), t, e);

          case 4:
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

const u = t.Protocol.resource.keyFor("binding-behavior");

const c = Object.freeze({
    name: u,
    keyFrom(t) {
        return `${u}:${t}`;
    },
    isType(e) {
        return "function" === typeof e && t.Metadata.hasOwn(u, e);
    },
    define(e, r) {
        const s = BindingBehaviorDefinition.create(e, r);
        t.Metadata.define(u, s, s.Type);
        t.Metadata.define(u, s, s);
        t.Protocol.resource.appendTo(r, u);
        return s.Type;
    },
    getDefinition(e) {
        const r = t.Metadata.getOwn(u, e);
        if (void 0 === r) throw new Error(`No definition found for type ${e.name}`);
        return r;
    },
    annotate(e, r, s) {
        t.Metadata.define(t.Protocol.annotation.keyFor(r), s, e);
    },
    getAnnotation(e, r) {
        return t.Metadata.getOwn(t.Protocol.annotation.keyFor(r), e);
    }
});

function h(t) {
    return function(e) {
        return l.define(t, e);
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
        return new ValueConverterDefinition(r, t.firstDefined(l.getAnnotation(r, "name"), s), t.mergeArrays(l.getAnnotation(r, "aliases"), i.aliases, r.aliases), l.keyFrom(s));
    }
    register(e) {
        const {Type: r, key: i, aliases: n} = this;
        t.Registration.singleton(i, r).register(e);
        t.Registration.aliasTo(i, r).register(e);
        s(n, l, i, e);
    }
}

const a = t.Protocol.resource.keyFor("value-converter");

const l = Object.freeze({
    name: a,
    keyFrom(t) {
        return `${a}:${t}`;
    },
    isType(e) {
        return "function" === typeof e && t.Metadata.hasOwn(a, e);
    },
    define(e, r) {
        const s = ValueConverterDefinition.create(e, r);
        t.Metadata.define(a, s, s.Type);
        t.Metadata.define(a, s, s);
        t.Protocol.resource.appendTo(r, a);
        return s.Type;
    },
    getDefinition(e) {
        const r = t.Metadata.getOwn(a, e);
        if (void 0 === r) throw new Error(`No definition found for type ${e.name}`);
        return r;
    },
    annotate(e, r, s) {
        t.Metadata.define(t.Protocol.annotation.keyFor(r), s, e);
    },
    getAnnotation(e, r) {
        return t.Metadata.getOwn(t.Protocol.annotation.keyFor(r), e);
    }
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
        this.behaviorKey = c.keyFrom(e);
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
        if (null == s) throw new Error(`BindingBehavior named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        if (!(s instanceof BindingBehaviorFactory)) if (void 0 === r[this.behaviorKey]) {
            r[this.behaviorKey] = s;
            s.bind.call(s, t, e, r, ...this.args.map((s => s.evaluate(t, e, r.locator, null))));
        } else throw new Error(`BindingBehavior named '${this.name}' already applied.`);
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
        this.converterKey = l.keyFrom(e);
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
        if (null == i) throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        if (null !== s && "handleChange" in s) {
            const t = i.signals;
            if (null != t) {
                const e = r.get(n);
                for (let r = 0, i = t.length; r < i; ++r) e.addSignalListener(t[r], s);
            }
        }
        if ("toView" in i) return i.toView(this.expression.evaluate(t, e, r, s), ...this.args.map((i => i.evaluate(t, e, r, s))));
        return this.expression.evaluate(t, e, r, s);
    }
    assign(t, e, r, s) {
        const i = r.get(this.converterKey);
        if (null == i) throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        if ("fromView" in i) s = i.fromView(s, ...this.args.map((s => s.evaluate(t, e, r, null))));
        return this.expression.assign(t, e, r, s);
    }
    unbind(t, e, r) {
        const s = r.locator.get(this.converterKey);
        if (void 0 === s.signals) return;
        const i = r.locator.get(n);
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
        let u = this.ancestor;
        while (u-- && n) {
            o = o.parentScope;
            n = null !== (i = null === o || void 0 === o ? void 0 : o.overrideContext) && void 0 !== i ? i : null;
        }
        return u < 1 && n ? n.bindingContext : void 0;
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
        if (null == n && "$host" === this.name) throw new Error("Unable to find $host context. Did you forget [au-slot] attribute?");
        if (1 & t) return n;
        return null == n ? "" : n;
    }
    assign(t, e, r, s) {
        var i;
        if ("$host" === this.name) throw new Error("Invalid assignment. $host is a reserved keyword.");
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
        const o = d(t, n, this.name);
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
        const o = d(t, i, this.name);
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
        throw new Error(`Expression is not a function.`);
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
            throw new Error(`Unknown binary operator: '${this.operation}'`);
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
            throw new Error(`Unknown unary operator: '${this.operation}'`);
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
        if ("function" !== typeof n) throw new Error(`Left-hand side of tagged template expression is not a function.`);
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

const f = Object.prototype.toString;

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
        switch (f.call(e)) {
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
            throw new Error(`Cannot count ${f.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (f.call(e)) {
          case "[object Array]":
            return p(e, r);

          case "[object Map]":
            return v(e, r);

          case "[object Set]":
            return g(e, r);

          case "[object Number]":
            return b(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${f.call(e)}`);
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

function d(t, e, r) {
    const s = null == e ? null : e[r];
    if ("function" === typeof s) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`Expected '${r}' to be a function`);
}

function p(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function v(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    p(r, e);
}

function g(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    p(r, e);
}

function b(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    p(r, e);
}

const w = Reflect.defineProperty;

function x(t, e, r) {
    w(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function m(t, e, r, s = false) {
    if (s || !Object.prototype.hasOwnProperty.call(t, e)) x(t, e, r);
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

var y;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(y || (y = {}));

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

function E(t, e) {
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

function O(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function C(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function S(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function B(t) {
    return null == t ? k : k(t);
}

function k(t) {
    const e = t.prototype;
    w(e, "subs", {
        get: A
    });
    m(e, "subscribe", $);
    m(e, "unsubscribe", U);
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

function A() {
    return x(this, "subs", new SubscriberRecord);
}

function $(t) {
    return this.subs.add(t);
}

function U(t) {
    return this.subs.remove(t);
}

function L(t) {
    return null == t ? T : T(t);
}

function T(t) {
    const e = t.prototype;
    w(e, "queue", {
        get: P
    });
}

class FlushQueue {
    constructor() {
        this.i = false;
        this.o = new Set;
    }
    get count() {
        return this.o.size;
    }
    add(t) {
        this.o.add(t);
        if (this.i) return;
        this.i = true;
        const e = this.o;
        let r;
        try {
            for (r of e) {
                e.delete(r);
                r.flush();
            }
        } finally {
            this.i = false;
        }
    }
    clear() {
        this.o.clear();
        this.i = false;
    }
}

FlushQueue.instance = new FlushQueue;

function P() {
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
    setValue(e, r) {
        const s = this.value;
        if (e !== s && t.isArrayIndex(e)) {
            if (0 === (256 & r)) this.obj.length = e;
            this.value = e;
            this.oldvalue = s;
            this.f = r;
            this.queue.add(this);
        }
    }
    handleCollectionChange(t, e) {
        const r = this.value;
        const s = this.obj.length;
        if ((this.value = s) !== r) {
            this.oldvalue = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        V = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, V, this.f);
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
        throw new Error('Map/Set "size" is a readonly property');
    }
    handleCollectionChange(t, e) {
        const r = this.value;
        const s = this.obj.size;
        if ((this.value = s) !== r) {
            this.oldvalue = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        V = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, V, this.f);
    }
}

function j(t) {
    const e = t.prototype;
    m(e, "subscribe", I, true);
    m(e, "unsubscribe", M, true);
    L(t);
    B(t);
}

function I(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function M(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

j(CollectionLengthObserver);

j(CollectionSizeObserver);

let V;

const D = new WeakMap;

function F(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function N(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function R(t, e, r, s, i) {
    let n, o, u, c, h;
    let a, l;
    for (a = r + 1; a < s; a++) {
        n = t[a];
        o = e[a];
        for (l = a - 1; l >= r; l--) {
            u = t[l];
            c = e[l];
            h = i(u, n);
            if (h > 0) {
                t[l + 1] = u;
                e[l + 1] = c;
            } else break;
        }
        t[l + 1] = n;
        e[l + 1] = o;
    }
}

function K(t, e, r, s, i) {
    let n = 0, o = 0;
    let u, c, h;
    let a, l, f;
    let d, p, v;
    let g, b;
    let w, x, m, y;
    let E, O, C, S;
    while (true) {
        if (s - r <= 10) {
            R(t, e, r, s, i);
            return;
        }
        n = r + (s - r >> 1);
        u = t[r];
        a = e[r];
        c = t[s - 1];
        l = e[s - 1];
        h = t[n];
        f = e[n];
        d = i(u, c);
        if (d > 0) {
            g = u;
            b = a;
            u = c;
            a = l;
            c = g;
            l = b;
        }
        p = i(u, h);
        if (p >= 0) {
            g = u;
            b = a;
            u = h;
            a = f;
            h = c;
            f = l;
            c = g;
            l = b;
        } else {
            v = i(c, h);
            if (v > 0) {
                g = c;
                b = l;
                c = h;
                l = f;
                h = g;
                f = b;
            }
        }
        t[r] = u;
        e[r] = a;
        t[s - 1] = h;
        e[s - 1] = f;
        w = c;
        x = l;
        m = r + 1;
        y = s - 1;
        t[n] = t[m];
        e[n] = e[m];
        t[m] = w;
        e[m] = x;
        t: for (o = m + 1; o < y; o++) {
            E = t[o];
            O = e[o];
            C = i(E, w);
            if (C < 0) {
                t[o] = t[m];
                e[o] = e[m];
                t[m] = E;
                e[m] = O;
                m++;
            } else if (C > 0) {
                do {
                    y--;
                    if (y == o) break t;
                    S = t[y];
                    C = i(S, w);
                } while (C > 0);
                t[o] = t[y];
                e[o] = e[y];
                t[y] = E;
                e[y] = O;
                if (C < 0) {
                    E = t[o];
                    O = e[o];
                    t[o] = t[m];
                    e[o] = e[m];
                    t[m] = E;
                    e[m] = O;
                    m++;
                }
            }
        }
        if (s - y < m - r) {
            K(t, e, y, s, i);
            s = m;
        } else {
            K(t, e, r, m, i);
            r = y;
        }
    }
}

const q = Array.prototype;

const H = q.push;

const Q = q.unshift;

const _ = q.pop;

const z = q.shift;

const W = q.splice;

const G = q.reverse;

const Z = q.sort;

const J = {
    push: H,
    unshift: Q,
    pop: _,
    shift: z,
    splice: W,
    reverse: G,
    sort: Z
};

const X = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const Y = {
    push: function(...t) {
        const e = D.get(this);
        if (void 0 === e) return H.apply(this, t);
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
        const e = D.get(this);
        if (void 0 === e) return Q.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        Q.apply(e.indexMap, s);
        const n = Q.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = D.get(this);
        if (void 0 === t) return _.call(this);
        const e = t.indexMap;
        const r = _.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        _.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = D.get(this);
        if (void 0 === t) return z.call(this);
        const e = t.indexMap;
        const r = z.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        z.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = D.get(this);
        if (void 0 === s) return W.apply(this, t);
        const i = this.length;
        const n = 0 | e;
        const o = n < 0 ? Math.max(i + n, 0) : Math.min(n, i);
        const u = s.indexMap;
        const c = t.length;
        const h = 0 === c ? 0 : 1 === c ? i - o : r;
        if (h > 0) {
            let t = o;
            const e = t + h;
            while (t < e) {
                if (u[t] > -1) u.deletedItems.push(u[t]);
                t++;
            }
        }
        if (c > 2) {
            const t = c - 2;
            const s = new Array(t);
            let i = 0;
            while (i < t) s[i++] = -2;
            W.call(u, e, r, ...s);
        } else W.apply(u, t);
        const a = W.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = D.get(this);
        if (void 0 === t) {
            G.call(this);
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
            const u = t.indexMap[r];
            this[s] = o;
            t.indexMap[s] = u;
            this[r] = i;
            t.indexMap[r] = n;
            s++;
        }
        t.notify();
        return this;
    },
    sort: function(t) {
        const e = D.get(this);
        if (void 0 === e) {
            Z.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        K(this, e.indexMap, 0, r, N);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || "function" !== typeof t) t = F;
        K(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of X) w(Y[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let tt = false;

function et() {
    for (const t of X) if (true !== q[t].observing) x(q, t, Y[t]);
}

function rt() {
    for (const t of X) if (true === q[t].observing) x(q, t, J[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!tt) {
            tt = true;
            et();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = O(t.length);
        this.lenObs = void 0;
        D.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = O(e);
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

B(ArrayObserver);

B(ArrayIndexObserver);

function st(t) {
    let e = D.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function it(t) {
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

function nt(t, e) {
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

const ot = new WeakMap;

const ut = Set.prototype;

const ct = ut.add;

const ht = ut.clear;

const at = ut.delete;

const lt = {
    add: ct,
    clear: ht,
    delete: at
};

const ft = [ "add", "clear", "delete" ];

const dt = {
    add: function(t) {
        const e = ot.get(this);
        if (void 0 === e) {
            ct.call(this, t);
            return this;
        }
        const r = this.size;
        ct.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = ot.get(this);
        if (void 0 === t) return ht.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            ht.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = ot.get(this);
        if (void 0 === e) return at.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = at.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const pt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of ft) w(dt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let vt = false;

function gt() {
    for (const t of ft) if (true !== ut[t].observing) w(ut, t, {
        ...pt,
        value: dt[t]
    });
}

function bt() {
    for (const t of ft) if (true === ut[t].observing) w(ut, t, {
        ...pt,
        value: lt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!vt) {
            vt = true;
            gt();
        }
        this.collection = t;
        this.indexMap = O(t.size);
        this.lenObs = void 0;
        ot.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = O(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

B(SetObserver);

function wt(t) {
    let e = ot.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const xt = new WeakMap;

const mt = Map.prototype;

const yt = mt.set;

const Et = mt.clear;

const Ot = mt.delete;

const Ct = {
    set: yt,
    clear: Et,
    delete: Ot
};

const St = [ "set", "clear", "delete" ];

const Bt = {
    set: function(t, e) {
        const r = xt.get(this);
        if (void 0 === r) {
            yt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        yt.call(this, t, e);
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
        const t = xt.get(this);
        if (void 0 === t) return Et.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Et.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = xt.get(this);
        if (void 0 === e) return Ot.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Ot.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const kt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of St) w(Bt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let At = false;

function $t() {
    for (const t of St) if (true !== mt[t].observing) w(mt, t, {
        ...kt,
        value: Bt[t]
    });
}

function Ut() {
    for (const t of St) if (true === mt[t].observing) w(mt, t, {
        ...kt,
        value: Ct[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!At) {
            At = true;
            $t();
        }
        this.collection = t;
        this.indexMap = O(t.size);
        this.lenObs = void 0;
        xt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = O(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

B(MapObserver);

function Lt(t) {
    let e = xt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function Tt(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function Pt() {
    return x(this, "obs", new BindingObserverRecord(this));
}

function jt(t) {
    let e;
    if (t instanceof Array) e = st(t); else if (t instanceof Set) e = wt(t); else if (t instanceof Map) e = Lt(t); else throw new Error("Unrecognised collection type.");
    this.obs.add(e);
}

function It(t) {
    this.obs.add(t);
}

function Mt() {
    throw new Error('method "handleChange" not implemented');
}

function Vt() {
    throw new Error('method "handleCollectionChange" not implemented');
}

class BindingObserverRecord {
    constructor(t) {
        this.binding = t;
        this.version = 0;
        this.count = 0;
        this.slots = 0;
    }
    handleChange(t, e, r) {
        return this.binding.interceptor.handleChange(t, e, r);
    }
    handleCollectionChange(t, e) {
        this.binding.interceptor.handleCollectionChange(t, e);
    }
    add(t) {
        const e = this.slots;
        let r = e;
        while (r-- && this[`o${r}`] !== t) ;
        if (-1 === r) {
            r = 0;
            while (void 0 !== this[`o${r}`]) r++;
            this[`o${r}`] = t;
            t.subscribe(this);
            if (r === e) this.slots = r + 1;
            ++this.count;
        }
        this[`v${r}`] = this.version;
    }
    clear(t) {
        const e = this.slots;
        let r;
        let s;
        let i = 0;
        if (true === t) {
            for (;i < e; ++i) {
                r = `o${i}`;
                s = this[r];
                if (void 0 !== s) {
                    this[r] = void 0;
                    s.unsubscribe(this);
                }
            }
            this.count = this.slots = 0;
        } else for (;i < e; ++i) if (this[`v${i}`] !== this.version) {
            r = `o${i}`;
            s = this[r];
            if (void 0 !== s) {
                this[r] = void 0;
                s.unsubscribe(this);
                this.count--;
            }
        }
    }
}

function Dt(t) {
    const e = t.prototype;
    m(e, "observe", Tt, true);
    m(e, "observeCollection", jt, true);
    m(e, "subscribeTo", It, true);
    w(e, "obs", {
        get: Pt
    });
    m(e, "handleChange", Mt);
    m(e, "handleCollectionChange", Vt);
    return t;
}

function Ft(t) {
    return null == t ? Dt : Dt(t);
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
        throw new Error("Method not implemented.");
    }
    $unbind() {
        throw new Error("Method not implemented.");
    }
    handleChange(t, e, r) {
        this.binding[this.key](t, e, r);
    }
}

Dt(BindingMediator);

const Nt = t.DI.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

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
        Gt.input = t;
        Gt.length = t.length;
        Gt.index = 0;
        Gt.currentChar = t.charCodeAt(0);
        return Jt(Gt, 0, 61, void 0 === e ? 53 : e);
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

function Rt(t) {
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

var Kt;

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
})(Kt || (Kt = {}));

const qt = PrimitiveLiteralExpression.$false;

const Ht = PrimitiveLiteralExpression.$true;

const Qt = PrimitiveLiteralExpression.$null;

const _t = PrimitiveLiteralExpression.$undefined;

const zt = AccessThisExpression.$this;

const Wt = AccessThisExpression.$parent;

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
        this.input = t;
        this.index = 0;
        this.startIndex = 0;
        this.lastIndex = 0;
        this.currentToken = 1572864;
        this.tokenValue = "";
        this.assignable = true;
        this.length = t.length;
        this.currentChar = t.charCodeAt(0);
    }
    get tokenRaw() {
        return this.input.slice(this.startIndex, this.index);
    }
}

const Gt = new ParserState("");

function Zt(t, e) {
    Gt.input = t;
    Gt.length = t.length;
    Gt.index = 0;
    Gt.currentChar = t.charCodeAt(0);
    return Jt(Gt, 0, 61, void 0 === e ? 53 : e);
}

function Jt(t, e, r, s) {
    if (284 === s) return new CustomExpression(t.input);
    if (0 === t.index) {
        if (2048 & s) return ee(t);
        se(t);
        if (1048576 & t.currentToken) throw new Error(`Invalid start of expression: '${t.input}'`);
    }
    t.assignable = 448 > r;
    let i;
    if (32768 & t.currentToken) {
        const r = fe[63 & t.currentToken];
        se(t);
        i = new UnaryExpression(r, Jt(t, e, 449, s));
        t.assignable = false;
    } else {
        t: switch (t.currentToken) {
          case 3078:
            t.assignable = false;
            do {
                se(t);
                e++;
                if (ae(t, 16393)) {
                    if (16393 === t.currentToken) throw new Error(`Double dot and spread operators are not supported: '${t.input}'`); else if (1572864 === t.currentToken) throw new Error(`Expected identifier: '${t.input}'`);
                } else if (524288 & t.currentToken) {
                    const t = 511 & e;
                    i = 0 === t ? zt : 1 === t ? Wt : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`Invalid member expression: '${t.input}'`);
            } while (3078 === t.currentToken);

          case 1024:
            if (512 & s) i = new BindingIdentifier(t.tokenValue); else {
                i = new AccessScopeExpression(t.tokenValue, 511 & e);
                e = 1024;
            }
            t.assignable = true;
            se(t);
            break;

          case 3076:
            t.assignable = false;
            se(t);
            i = zt;
            e = 512;
            break;

          case 671751:
            se(t);
            i = Jt(t, 0, 62, s);
            le(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = Xt(t, e, s);
            e = 0;
            break;

          case 131080:
            i = te(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.tokenValue ]);
            t.assignable = false;
            se(t);
            e = 0;
            break;

          case 540715:
            i = re(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.tokenValue);
            t.assignable = false;
            se(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = fe[63 & t.currentToken];
            t.assignable = false;
            se(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`Unexpected end of expression: '${t.input}'`); else throw new Error(`Unconsumed token: '${t.input}'`);
        }
        if (512 & s) return Yt(t, i);
        if (449 < r) return i;
        let n = t.tokenValue;
        while ((16384 & t.currentToken) > 0) {
            const r = [];
            let o;
            switch (t.currentToken) {
              case 16393:
                t.assignable = true;
                se(t);
                if (0 === (3072 & t.currentToken)) throw new Error(`Expected identifier: '${t.input}'`);
                n = t.tokenValue;
                se(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.currentToken) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.assignable = true;
                se(t);
                e = 4096;
                i = new AccessKeyedExpression(i, Jt(t, 0, 62, s));
                le(t, 1835022);
                break;

              case 671751:
                t.assignable = false;
                se(t);
                while (1835019 !== t.currentToken) {
                    r.push(Jt(t, 0, 62, s));
                    if (!ae(t, 1572876)) break;
                }
                le(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.assignable = false;
                o = [ t.tokenValue ];
                i = new TaggedTemplateExpression(o, o, i);
                se(t);
                break;

              case 540715:
                i = re(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.currentToken) > 0) {
        const n = t.currentToken;
        if ((448 & n) <= r) break;
        se(t);
        i = new BinaryExpression(fe[63 & n], i, Jt(t, e, 448 & n, s));
        t.assignable = false;
    }
    if (63 < r) return i;
    if (ae(t, 1572880)) {
        const r = Jt(t, e, 62, s);
        le(t, 1572879);
        i = new ConditionalExpression(i, r, Jt(t, e, 62, s));
        t.assignable = false;
    }
    if (62 < r) return i;
    if (ae(t, 1048616)) {
        if (!t.assignable) throw new Error(`Left hand side of expression is not assignable: '${t.input}'`);
        i = new AssignExpression(i, Jt(t, e, 62, s));
    }
    if (61 < r) return i;
    while (ae(t, 1572884)) {
        if (1572864 === t.currentToken) throw new Error(`Expected identifier to come after ValueConverter operator: '${t.input}'`);
        const r = t.tokenValue;
        se(t);
        const n = new Array;
        while (ae(t, 1572879)) n.push(Jt(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (ae(t, 1572883)) {
        if (1572864 === t.currentToken) throw new Error(`Expected identifier to come after BindingBehavior operator: '${t.input}'`);
        const r = t.tokenValue;
        se(t);
        const n = new Array;
        while (ae(t, 1572879)) n.push(Jt(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.currentToken) {
        if (2048 & s) return i;
        if ("of" === t.tokenRaw) throw new Error(`Unexpected keyword "of": '${t.input}'`);
        throw new Error(`Unconsumed token: '${t.input}'`);
    }
    return i;
}

function Xt(t, e, r) {
    se(t);
    const s = new Array;
    while (1835022 !== t.currentToken) if (ae(t, 1572876)) {
        s.push(_t);
        if (1835022 === t.currentToken) break;
    } else {
        s.push(Jt(t, e, 62, ~512 & r));
        if (ae(t, 1572876)) {
            if (1835022 === t.currentToken) break;
        } else break;
    }
    le(t, 1835022);
    if (512 & r) return new ArrayBindingPattern(s); else {
        t.assignable = false;
        return new ArrayLiteralExpression(s);
    }
}

function Yt(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${t.input}'`);
    if (1051180 !== t.currentToken) throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${t.input}'`);
    se(t);
    const r = e;
    const s = Jt(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function te(t, e) {
    const r = new Array;
    const s = new Array;
    se(t);
    while (1835018 !== t.currentToken) {
        r.push(t.tokenValue);
        if (12288 & t.currentToken) {
            se(t);
            le(t, 1572879);
            s.push(Jt(t, 0, 62, ~512 & e));
        } else if (3072 & t.currentToken) {
            const {currentChar: r, currentToken: i, index: n} = t;
            se(t);
            if (ae(t, 1572879)) s.push(Jt(t, 0, 62, ~512 & e)); else {
                t.currentChar = r;
                t.currentToken = i;
                t.index = n;
                s.push(Jt(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`Invalid or unsupported property definition in object literal: '${t.input}'`);
        if (1835018 !== t.currentToken) le(t, 1572876);
    }
    le(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(r, s); else {
        t.assignable = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function ee(t) {
    const e = [];
    const r = [];
    const s = t.length;
    let i = "";
    while (t.index < s) {
        switch (t.currentChar) {
          case 36:
            if (123 === t.input.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.currentChar = t.input.charCodeAt(t.index);
                se(t);
                const s = Jt(t, 0, 61, 2048);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(Rt(ie(t)));
            break;

          default:
            i += String.fromCharCode(t.currentChar);
        }
        ie(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function re(t, e, r, s, i) {
    const n = [ t.tokenValue ];
    le(t, 540715);
    const o = [ Jt(t, e, 62, r) ];
    while (540714 !== (t.currentToken = he(t))) {
        n.push(t.tokenValue);
        le(t, 540715);
        o.push(Jt(t, e, 62, r));
    }
    n.push(t.tokenValue);
    t.assignable = false;
    if (i) {
        se(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        se(t);
        return new TemplateExpression(n, o);
    }
}

function se(t) {
    while (t.index < t.length) {
        t.startIndex = t.index;
        if (null != (t.currentToken = me[t.currentChar](t))) return;
    }
    t.currentToken = 1572864;
}

function ie(t) {
    return t.currentChar = t.input.charCodeAt(++t.index);
}

function ne(t) {
    while (xe[ie(t)]) ;
    const e = de[t.tokenValue = t.tokenRaw];
    return void 0 === e ? 1024 : e;
}

function oe(t, e) {
    let r = t.currentChar;
    if (false === e) {
        do {
            r = ie(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.tokenValue = parseInt(t.tokenRaw, 10);
            return 8192;
        }
        r = ie(t);
        if (t.index >= t.length) {
            t.tokenValue = parseInt(t.tokenRaw.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = ie(t);
    } while (r <= 57 && r >= 48); else t.currentChar = t.input.charCodeAt(--t.index);
    t.tokenValue = parseFloat(t.tokenRaw);
    return 8192;
}

function ue(t) {
    const e = t.currentChar;
    ie(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.currentChar !== e) if (92 === t.currentChar) {
        s.push(t.input.slice(i, t.index));
        ie(t);
        r = Rt(t.currentChar);
        ie(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`Unterminated quote in string literal: '${t.input}'`); else ie(t);
    const n = t.input.slice(i, t.index);
    ie(t);
    s.push(n);
    const o = s.join("");
    t.tokenValue = o;
    return 4096;
}

function ce(t) {
    let e = true;
    let r = "";
    while (96 !== ie(t)) if (36 === t.currentChar) if (t.index + 1 < t.length && 123 === t.input.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.currentChar) r += String.fromCharCode(Rt(ie(t))); else {
        if (t.index >= t.length) throw new Error(`Unterminated template string: '${t.input}'`);
        r += String.fromCharCode(t.currentChar);
    }
    ie(t);
    t.tokenValue = r;
    if (e) return 540714;
    return 540715;
}

function he(t) {
    if (t.index >= t.length) throw new Error(`Unterminated template string: '${t.input}'`);
    t.index--;
    return ce(t);
}

function ae(t, e) {
    if (t.currentToken === e) {
        se(t);
        return true;
    }
    return false;
}

function le(t, e) {
    if (t.currentToken === e) se(t); else throw new Error(`Missing expected token: '${t.input}'`);
}

const fe = [ qt, Ht, Qt, _t, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const de = Object.create(null);

de.true = 2049;

de.null = 2050;

de.false = 2048;

de.undefined = 2051;

de.$this = 3076;

de.$parent = 3078;

de.in = 1640799;

de.instanceof = 1640800;

de.typeof = 34851;

de.void = 34852;

de.of = 1051180;

const pe = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function ve(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function ge(t) {
    return e => {
        ie(e);
        return t;
    };
}

const be = t => {
    throw new Error(`Unexpected character: '${t.input}'`);
};

be.notMapped = true;

const we = new Set;

ve(null, we, pe.AsciiIdPart, true);

const xe = new Uint8Array(65535);

ve(xe, null, pe.IdStart, 1);

ve(xe, null, pe.Digit, 1);

const me = new Array(65535);

me.fill(be, 0, 65535);

ve(me, null, pe.Skip, (t => {
    ie(t);
    return null;
}));

ve(me, null, pe.IdStart, ne);

ve(me, null, pe.Digit, (t => oe(t, false)));

me[34] = me[39] = t => ue(t);

me[96] = t => ce(t);

me[33] = t => {
    if (61 !== ie(t)) return 32809;
    if (61 !== ie(t)) return 1638680;
    ie(t);
    return 1638682;
};

me[61] = t => {
    if (61 !== ie(t)) return 1048616;
    if (61 !== ie(t)) return 1638679;
    ie(t);
    return 1638681;
};

me[38] = t => {
    if (38 !== ie(t)) return 1572883;
    ie(t);
    return 1638614;
};

me[124] = t => {
    if (124 !== ie(t)) return 1572884;
    ie(t);
    return 1638549;
};

me[46] = t => {
    if (ie(t) <= 57 && t.currentChar >= 48) return oe(t, true);
    return 16393;
};

me[60] = t => {
    if (61 !== ie(t)) return 1638747;
    ie(t);
    return 1638749;
};

me[62] = t => {
    if (61 !== ie(t)) return 1638748;
    ie(t);
    return 1638750;
};

me[37] = ge(1638886);

me[40] = ge(671751);

me[41] = ge(1835019);

me[42] = ge(1638885);

me[43] = ge(623009);

me[44] = ge(1572876);

me[45] = ge(623010);

me[47] = ge(1638887);

me[58] = ge(1572879);

me[63] = ge(1572880);

me[91] = ge(671757);

me[93] = ge(1835022);

me[123] = ge(131080);

me[125] = ge(1835018);

let ye = null;

const Ee = [];

let Oe = false;

function Ce() {
    Oe = false;
}

function Se() {
    Oe = true;
}

function Be() {
    return ye;
}

function ke(t) {
    if (null == t) throw new Error("Connectable cannot be null/undefined");
    if (null == ye) {
        ye = t;
        Ee[0] = ye;
        Oe = true;
        return;
    }
    if (ye === t) throw new Error(`Trying to enter an active connectable`);
    Ee.push(ye);
    ye = t;
    Oe = true;
}

function Ae(t) {
    if (null == t) throw new Error("Connectable cannot be null/undefined");
    if (ye !== t) throw new Error(`Trying to exit an unactive connectable`);
    Ee.pop();
    ye = Ee.length > 0 ? Ee[Ee.length - 1] : null;
    Oe = null != ye;
}

const $e = Object.freeze({
    get current() {
        return ye;
    },
    get connecting() {
        return Oe;
    },
    enter: ke,
    exit: Ae,
    pause: Ce,
    resume: Se
});

const Ue = Reflect.get;

const Le = Object.prototype.toString;

const Te = new WeakMap;

function Pe(t) {
    switch (Le.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const je = "__raw__";

function Ie(t) {
    return Pe(t) ? Me(t) : t;
}

function Me(t) {
    var e;
    return null !== (e = Te.get(t)) && void 0 !== e ? e : Ne(t);
}

function Ve(t) {
    var e;
    return null !== (e = t[je]) && void 0 !== e ? e : t;
}

function De(t) {
    return Pe(t) && t[je] || t;
}

function Fe(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function Ne(t) {
    const e = t instanceof Array ? Ke : t instanceof Map || t instanceof Set ? lr : Re;
    const r = new Proxy(t, e);
    Te.set(t, r);
    return r;
}

const Re = {
    get(t, e, r) {
        if (e === je) return t;
        const s = Be();
        if (!Oe || Fe(e) || null == s) return Ue(t, e, r);
        s.observe(t, e);
        return Ie(Ue(t, e, r));
    }
};

const Ke = {
    get(t, e, r) {
        if (e === je) return t;
        const s = Be();
        if (!Oe || Fe(e) || null == s) return Ue(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return qe;

          case "includes":
            return _e;

          case "indexOf":
            return ze;

          case "lastIndexOf":
            return We;

          case "every":
            return He;

          case "filter":
            return Qe;

          case "find":
            return Ze;

          case "findIndex":
            return Ge;

          case "flat":
            return Je;

          case "flatMap":
            return Xe;

          case "join":
            return Ye;

          case "push":
            return er;

          case "pop":
            return tr;

          case "reduce":
            return hr;

          case "reduceRight":
            return ar;

          case "reverse":
            return nr;

          case "shift":
            return rr;

          case "unshift":
            return sr;

          case "slice":
            return cr;

          case "splice":
            return ir;

          case "some":
            return or;

          case "sort":
            return ur;

          case "keys":
            return xr;

          case "values":
          case Symbol.iterator:
            return mr;

          case "entries":
            return yr;
        }
        s.observe(t, e);
        return Ie(Ue(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = Be()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function qe(t, e) {
    var r;
    const s = Ve(this);
    const i = s.map(((r, s) => De(t.call(e, Ie(r), s, this))));
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ie(i);
}

function He(t, e) {
    var r;
    const s = Ve(this);
    const i = s.every(((r, s) => t.call(e, Ie(r), s, this)));
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Qe(t, e) {
    var r;
    const s = Ve(this);
    const i = s.filter(((r, s) => De(t.call(e, Ie(r), s, this))));
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ie(i);
}

function _e(t) {
    var e;
    const r = Ve(this);
    const s = r.includes(De(t));
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function ze(t) {
    var e;
    const r = Ve(this);
    const s = r.indexOf(De(t));
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function We(t) {
    var e;
    const r = Ve(this);
    const s = r.lastIndexOf(De(t));
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Ge(t, e) {
    var r;
    const s = Ve(this);
    const i = s.findIndex(((r, s) => De(t.call(e, Ie(r), s, this))));
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Ze(t, e) {
    var r;
    const s = Ve(this);
    const i = s.find(((e, r) => t(Ie(e), r, this)), e);
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ie(i);
}

function Je() {
    var t;
    const e = Ve(this);
    null === (t = Be()) || void 0 === t ? void 0 : t.observeCollection(e);
    return Ie(e.flat());
}

function Xe(t, e) {
    var r;
    const s = Ve(this);
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Me(s.flatMap(((r, s) => Ie(t.call(e, Ie(r), s, this)))));
}

function Ye(t) {
    var e;
    const r = Ve(this);
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function tr() {
    return Ie(Ve(this).pop());
}

function er(...t) {
    return Ve(this).push(...t);
}

function rr() {
    return Ie(Ve(this).shift());
}

function sr(...t) {
    return Ve(this).unshift(...t);
}

function ir(...t) {
    return Ie(Ve(this).splice(...t));
}

function nr(...t) {
    var e;
    const r = Ve(this);
    const s = r.reverse();
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ie(s);
}

function or(t, e) {
    var r;
    const s = Ve(this);
    const i = s.some(((r, s) => De(t.call(e, Ie(r), s, this))));
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function ur(t) {
    var e;
    const r = Ve(this);
    const s = r.sort(t);
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ie(s);
}

function cr(t, e) {
    var r;
    const s = Ve(this);
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Me(s.slice(t, e));
}

function hr(t, e) {
    var r;
    const s = Ve(this);
    const i = s.reduce(((e, r, s) => t(e, Ie(r), s, this)), e);
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ie(i);
}

function ar(t, e) {
    var r;
    const s = Ve(this);
    const i = s.reduceRight(((e, r, s) => t(e, Ie(r), s, this)), e);
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return Ie(i);
}

const lr = {
    get(t, e, r) {
        if (e === je) return t;
        const s = Be();
        if (!Oe || Fe(e) || null == s) return Ue(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return br;

          case "delete":
            return wr;

          case "forEach":
            return fr;

          case "add":
            if (t instanceof Set) return gr;
            break;

          case "get":
            if (t instanceof Map) return pr;
            break;

          case "set":
            if (t instanceof Map) return vr;
            break;

          case "has":
            return dr;

          case "keys":
            return xr;

          case "values":
            return mr;

          case "entries":
            return yr;

          case Symbol.iterator:
            return t instanceof Map ? yr : mr;
        }
        return Ie(Ue(t, e, r));
    }
};

function fr(t, e) {
    var r;
    const s = Ve(this);
    null === (r = Be()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, Ie(r), Ie(s), this);
    }));
}

function dr(t) {
    var e;
    const r = Ve(this);
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(De(t));
}

function pr(t) {
    var e;
    const r = Ve(this);
    null === (e = Be()) || void 0 === e ? void 0 : e.observeCollection(r);
    return Ie(r.get(De(t)));
}

function vr(t, e) {
    return Ie(Ve(this).set(De(t), De(e)));
}

function gr(t) {
    return Ie(Ve(this).add(De(t)));
}

function br() {
    return Ie(Ve(this).clear());
}

function wr(t) {
    return Ie(Ve(this).delete(De(t)));
}

function xr() {
    var t;
    const e = Ve(this);
    null === (t = Be()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Ie(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function mr() {
    var t;
    const e = Ve(this);
    null === (t = Be()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Ie(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function yr() {
    var t;
    const e = Ve(this);
    null === (t = Be()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ Ie(e[0]), Ie(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const Er = Object.freeze({
    getProxy: Me,
    getRaw: Ve,
    wrap: Ie,
    unwrap: De,
    rawKey: je
});

class ComputedObserver {
    constructor(t, e, r, s, i) {
        this.obj = t;
        this.get = e;
        this.set = r;
        this.useProxy = s;
        this.interceptor = this;
        this.type = 1;
        this.value = void 0;
        this.u = void 0;
        this.running = false;
        this.h = false;
        this.oL = i;
    }
    static create(t, e, r, s, i) {
        const n = r.get;
        const o = r.set;
        const u = new ComputedObserver(t, n, o, i, s);
        const c = () => u.getValue();
        c.getObserver = () => u;
        w(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: c,
            set: t => {
                u.setValue(t, 0);
            }
        });
        return u;
    }
    getValue() {
        if (0 === this.subs.count) return this.get.call(this.obj, this);
        if (this.h) {
            this.compute();
            this.h = false;
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
        } else throw new Error("Property is readonly");
    }
    handleChange() {
        this.h = true;
        if (this.subs.count > 0) this.run();
    }
    handleCollectionChange() {
        this.h = true;
        if (this.subs.count > 0) this.run();
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.compute();
            this.h = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.h = true;
            this.obs.clear(true);
        }
    }
    flush() {
        Or = this.u;
        this.u = this.value;
        this.subs.notify(this.value, Or, 0);
    }
    run() {
        if (this.running) return;
        const t = this.value;
        const e = this.compute();
        this.h = false;
        if (!Object.is(e, t)) {
            this.u = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            ke(this);
            return this.value = De(this.get.call(this.useProxy ? Ie(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            Ae(this);
        }
    }
}

Ft(ComputedObserver);

B(ComputedObserver);

L(ComputedObserver);

let Or;

const Cr = t.DI.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Sr = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const Br = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.l = null;
        this.g = 0;
        this.check = () => {
            if (Sr.disabled) return;
            if (++this.g < Sr.timeoutsPerCheck) return;
            this.g = 0;
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
        if (Sr.throw) throw new Error(`Property '${e}' is being dirty-checked.`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.l = this.p.taskQueue.queueTask(this.check, Br);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.l.cancel();
            this.l = null;
        }
    }
}

DirtyChecker.inject = [ t.IPlatform ];

L(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.m = t;
        this.obj = e;
        this.propertyKey = r;
        this.oldValue = void 0;
        this.type = 0;
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(t, e) {
        throw new Error(`Trying to set value for property ${this.propertyKey} in dirty checker`);
    }
    isDirty() {
        return this.oldValue !== this.obj[this.propertyKey];
    }
    flush() {
        const t = this.oldValue;
        const e = this.getValue();
        this.oldValue = e;
        this.subs.notify(e, t, 0);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.oldValue = this.obj[this.propertyKey];
            this.m.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.m.removeProperty(this);
    }
}

B(DirtyCheckProperty);

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
    setValue(t, e, r, s) {
        r[s] = t;
    }
}

let kr;

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
            const r = this.value;
            if (Object.is(t, r)) return;
            this.value = t;
            this.oldValue = r;
            this.f = e;
            this.queue.add(this);
        } else this.obj[this.propertyKey] = t;
    }
    subscribe(t) {
        if (false === this.observing) this.start();
        this.subs.add(t);
    }
    flush() {
        kr = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, kr, this.f);
    }
    start() {
        if (false === this.observing) {
            this.observing = true;
            this.value = this.obj[this.propertyKey];
            w(this.obj, this.propertyKey, {
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
            w(this.obj, this.propertyKey, {
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
    constructor(t, e, r, s) {
        this.type = 1;
        this.v = void 0;
        this.oV = void 0;
        this.f = 0;
        this.obj = t;
        this.s = r;
        const i = t[e];
        this.cb = "function" === typeof i ? i : void 0;
        this.v = s;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        var r;
        if ("function" === typeof this.s) t = this.s(t);
        if (!Object.is(t, this.v)) {
            this.oV = this.v;
            this.v = t;
            this.f = e;
            null === (r = this.cb) || void 0 === r ? void 0 : r.call(this.obj, this.v, this.oV, e);
            this.queue.add(this);
        }
    }
    flush() {
        kr = this.oV;
        this.oV = this.v;
        this.subs.notify(this.v, kr, this.f);
    }
}

B(SetterObserver);

B(SetterNotifier);

L(SetterObserver);

L(SetterNotifier);

const Ar = new PropertyAccessor;

const $r = t.DI.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const Ur = t.DI.createInterface("INodeObserverLocator", (e => e.cachedCallback((e => {
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
        return Ar;
    }
    getAccessor() {
        return Ar;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.m = t;
        this.O = e;
        this.C = [];
    }
    addAdapter(t) {
        this.C.push(t);
    }
    getObserver(t, e) {
        var r, s;
        return null !== (s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== s ? s : this.S(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== s) return s;
        if (this.O.handles(t, e, this)) return this.O.getAccessor(t, e, this);
        return Ar;
    }
    getArrayObserver(t) {
        return st(t);
    }
    getMapObserver(t) {
        return Lt(t);
    }
    getSetObserver(t) {
        return wt(t);
    }
    createObserver(e, r) {
        var s, i, n, o;
        if (!(e instanceof Object)) return new PrimitiveObserver(e, r);
        if (this.O.handles(e, r, this)) return this.O.getObserver(e, r, this);
        switch (r) {
          case "length":
            if (e instanceof Array) return st(e).getLengthObserver();
            break;

          case "size":
            if (e instanceof Map) return Lt(e).getLengthObserver(); else if (e instanceof Set) return wt(e).getLengthObserver();
            break;

          default:
            if (e instanceof Array && t.isArrayIndex(r)) return st(e).getIndexObserver(Number(r));
            break;
        }
        let u = Pr(e, r);
        if (void 0 === u) {
            let t = Tr(e);
            while (null !== t) {
                u = Pr(t, r);
                if (void 0 === u) t = Tr(t); else break;
            }
        }
        if (void 0 !== u && !jr.call(u, "value")) {
            let t = this.B(e, r, u);
            if (null == t) t = null === (o = null !== (i = null === (s = u.get) || void 0 === s ? void 0 : s.getObserver) && void 0 !== i ? i : null === (n = u.set) || void 0 === n ? void 0 : n.getObserver) || void 0 === o ? void 0 : o(e, this);
            return null == t ? u.configurable ? ComputedObserver.create(e, r, u, this, true) : this.m.createProperty(e, r) : t;
        }
        return new SetterObserver(e, r);
    }
    B(t, e, r) {
        if (this.C.length > 0) for (const s of this.C) {
            const i = s.getObserver(t, e, r, this);
            if (null != i) return i;
        }
        return null;
    }
    S(t, e, r) {
        if (true === r.doNotCache) return r;
        if (void 0 === t.$observers) {
            w(t, "$observers", {
                value: {
                    [e]: r
                }
            });
            return r;
        }
        return t.$observers[e] = r;
    }
}

ObserverLocator.inject = [ Cr, Ur ];

function Lr(t) {
    let e;
    if (t instanceof Array) e = st(t); else if (t instanceof Map) e = Lt(t); else if (t instanceof Set) e = wt(t);
    return e;
}

const Tr = Object.getPrototypeOf;

const Pr = Object.getOwnPropertyDescriptor;

const jr = Object.prototype.hasOwnProperty;

const Ir = t.DI.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ $r ];
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
        if (this.stopped) throw new Error("Effect has already been stopped");
        if (this.running) return;
        ++this.runCount;
        this.running = true;
        this.queued = false;
        ++this.obs.version;
        try {
            ke(this);
            this.fn(this);
        } finally {
            this.obs.clear(false);
            this.running = false;
            Ae(this);
        }
        if (this.queued) {
            if (this.runCount > this.maxRunCount) {
                this.runCount = 0;
                throw new Error("Maximum number of recursive effect run reached. Consider handle effect dependencies differently.");
            }
            this.run();
        } else this.runCount = 0;
    }
    stop() {
        this.stopped = true;
        this.obs.clear(true);
    }
}

Ft(Effect);

function Mr(t) {
    if (void 0 === t.$observers) w(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Vr = {};

function Dr(t, e, r) {
    if (null == e) return (e, r, i) => s(e, r, i, t);
    return s(t, e, r);
    function s(t, e, r, s) {
        var i;
        const n = void 0 === e;
        s = "object" !== typeof s ? {
            name: s
        } : s || {};
        if (n) e = s.name;
        if (null == e || "" === e) throw new Error("Invalid usage, cannot determine property name for @observable");
        const o = s.callback || `${String(e)}Changed`;
        let u = Vr;
        if (r) {
            delete r.value;
            delete r.writable;
            u = null === (i = r.initializer) || void 0 === i ? void 0 : i.call(r);
            delete r.initializer;
        } else r = {
            configurable: true
        };
        if (!("enumerable" in r)) r.enumerable = true;
        const c = s.set;
        r.get = function t() {
            var r;
            const s = Fr(this, e, o, u, c);
            null === (r = Be()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            Fr(this, e, o, u, c).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return Fr(r, e, o, u, c);
        };
        if (n) w(t.prototype, e, r); else return r;
    }
}

function Fr(t, e, r, s, i) {
    const n = Mr(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === Vr ? void 0 : s);
        n[e] = o;
    }
    return o;
}

Object.defineProperty(exports, "IPlatform", {
    enumerable: true,
    get: function() {
        return t.IPlatform;
    }
});

Object.defineProperty(exports, "Platform", {
    enumerable: true,
    get: function() {
        return e.Platform;
    }
});

Object.defineProperty(exports, "Task", {
    enumerable: true,
    get: function() {
        return e.Task;
    }
});

Object.defineProperty(exports, "TaskAbortError", {
    enumerable: true,
    get: function() {
        return e.TaskAbortError;
    }
});

Object.defineProperty(exports, "TaskQueue", {
    enumerable: true,
    get: function() {
        return e.TaskQueue;
    }
});

Object.defineProperty(exports, "TaskQueuePriority", {
    enumerable: true,
    get: function() {
        return e.TaskQueuePriority;
    }
});

Object.defineProperty(exports, "TaskStatus", {
    enumerable: true,
    get: function() {
        return e.TaskStatus;
    }
});

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

exports.BindingBehavior = c;

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

exports.ConnectableSwitcher = $e;

exports.CustomExpression = CustomExpression;

exports.DirtyCheckProperty = DirtyCheckProperty;

exports.DirtyCheckSettings = Sr;

exports.FlushQueue = FlushQueue;

exports.ForOfStatement = ForOfStatement;

exports.HtmlLiteralExpression = HtmlLiteralExpression;

exports.IDirtyChecker = Cr;

exports.IExpressionParser = Nt;

exports.INodeObserverLocator = Ur;

exports.IObservation = Ir;

exports.IObserverLocator = $r;

exports.ISignaler = n;

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

exports.ProxyObservable = Er;

exports.Scope = Scope;

exports.SetObserver = SetObserver;

exports.SetterObserver = SetterObserver;

exports.SubscriberRecord = SubscriberRecord;

exports.TaggedTemplateExpression = TaggedTemplateExpression;

exports.TemplateExpression = TemplateExpression;

exports.UnaryExpression = UnaryExpression;

exports.ValueConverter = l;

exports.ValueConverterDefinition = ValueConverterDefinition;

exports.ValueConverterExpression = ValueConverterExpression;

exports.alias = r;

exports.applyMutationsToIndices = it;

exports.bindingBehavior = o;

exports.cloneIndexMap = C;

exports.connectable = Ft;

exports.copyIndexMap = E;

exports.createIndexMap = O;

exports.disableArrayObservation = rt;

exports.disableMapObservation = Ut;

exports.disableSetObservation = bt;

exports.enableArrayObservation = et;

exports.enableMapObservation = $t;

exports.enableSetObservation = gt;

exports.getCollectionObserver = Lr;

exports.isIndexMap = S;

exports.observable = Dr;

exports.parse = Jt;

exports.parseExpression = Zt;

exports.registerAliases = s;

exports.subscriberCollection = B;

exports.synchronizeIndices = nt;

exports.valueConverter = h;

exports.withFlushQueue = L;
//# sourceMappingURL=index.js.map
