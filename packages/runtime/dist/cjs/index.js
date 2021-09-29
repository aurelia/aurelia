"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/kernel");

var e = require("@aurelia/platform");

const s = Object.prototype.hasOwnProperty;

const r = Reflect.defineProperty;

const i = t => "function" === typeof t;

const n = t => "string" === typeof t;

function o(t, e, s) {
    r(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: s
    });
    return s;
}

function h(t, e, r, i = false) {
    if (i || !s.call(t, e)) o(t, e, r);
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
        const s = f("aliases");
        const r = u(s, e);
        if (void 0 === r) l(s, t, e); else r.push(...t);
    };
}

function g(e, s, r, i) {
    for (let n = 0, o = e.length; n < o; ++n) t.Registration.aliasTo(r, s.keyFrom(e[n])).register(i);
}

const w = Object.freeze({});

class BindingContext {
    constructor(t, e) {
        if (void 0 !== t) if (void 0 !== e) this[t] = e; else for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) this[e] = t[e];
    }
    static create(t, e) {
        return new BindingContext(t, e);
    }
    static get(t, e, s, r) {
        var i, n;
        if (null == t) throw new Error(`AUR0203:${t}`);
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
        if (16 & r) return w;
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

const b = t.DI.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = c();
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

function x(t) {
    return function(e) {
        return y.define(t, e);
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
        if (n(e)) {
            r = e;
            i = {
                name: r
            };
        } else {
            r = e.name;
            i = e;
        }
        const o = Object.getPrototypeOf(s) === BindingInterceptor;
        return new BindingBehaviorDefinition(s, t.firstDefined(A(s, "name"), r), t.mergeArrays(A(s, "aliases"), i.aliases, s.aliases), y.keyFrom(r), t.fromAnnotationOrDefinitionOrTypeOrDefault("strategy", i, s, (() => o ? 2 : 1)));
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
        g(i, y, r, e);
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
            return new this.Type(t, e);

          case 1:
            return new this.Type(s.get(r[0]), t, e);

          case 2:
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

const E = d("binding-behavior");

const A = (t, e) => u(f(e), t);

const y = Object.freeze({
    name: E,
    keyFrom(t) {
        return `${E}:${t}`;
    },
    isType(t) {
        return i(t) && a(E, t);
    },
    define(t, e) {
        const s = BindingBehaviorDefinition.create(t, e);
        l(E, s, s.Type);
        l(E, s, s);
        p(e, E);
        return s.Type;
    },
    getDefinition(t) {
        const e = u(E, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        l(f(e), s, t);
    },
    getAnnotation: A
});

function m(t) {
    return function(e) {
        return O.define(t, e);
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
        if (n(e)) {
            r = e;
            i = {
                name: r
            };
        } else {
            r = e.name;
            i = e;
        }
        return new ValueConverterDefinition(s, t.firstDefined(S(s, "name"), r), t.mergeArrays(S(s, "aliases"), i.aliases, s.aliases), O.keyFrom(r));
    }
    register(e) {
        const {Type: s, key: r, aliases: i} = this;
        t.Registration.singleton(r, s).register(e);
        t.Registration.aliasTo(r, s).register(e);
        g(i, O, r, e);
    }
}

const U = d("value-converter");

const S = (t, e) => u(f(e), t);

const O = Object.freeze({
    name: U,
    keyFrom: t => `${U}:${t}`,
    isType(t) {
        return i(t) && a(U, t);
    },
    define(t, e) {
        const s = ValueConverterDefinition.create(t, e);
        l(U, s, s.Type);
        l(U, s, s);
        p(e, U);
        return s.Type;
    },
    getDefinition(t) {
        const e = u(U, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        l(f(e), s, t);
    },
    getAnnotation: S
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
    t[t["ArrayDestructuring"] = 90137] = "ArrayDestructuring";
    t[t["ObjectDestructuring"] = 106521] = "ObjectDestructuring";
    t[t["DestructuringAssignmentLeaf"] = 139289] = "DestructuringAssignmentLeaf";
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
    visitDestructuringAssignmentExpression(t) {
        const e = t.$kind;
        const s = 106521 === e;
        this.text += s ? "{" : "[";
        const r = t.list;
        const i = r.length;
        let n;
        let o;
        for (n = 0; n < i; n++) {
            o = r[n];
            switch (o.$kind) {
              case 139289:
                o.accept(this);
                break;

              case 90137:
              case 106521:
                {
                    const t = o.source;
                    if (t) {
                        t.accept(this);
                        this.text += ":";
                    }
                    o.accept(this);
                    break;
                }
            }
        }
        this.text += s ? "}" : "]";
    }
    visitDestructuringAssignmentSingleExpression(t) {
        t.source.accept(this);
        this.text += ":";
        t.target.accept(this);
        const e = t.initializer;
        if (void 0 !== e) {
            this.text += "=";
            e.accept(this);
        }
    }
    visitDestructuringAssignmentRestExpression(t) {
        this.text += "...";
        t.accept(this);
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
        const n = s;
        if (void 0 !== n[r]) {
            if (i(n[r].unbind)) n[r].unbind(t, e, s);
            n[r] = void 0;
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
    evaluate(t, e, s, r) {
        const i = s.get(this.converterKey);
        if (null == i) throw new Error(`AUR0103:${this.name}`);
        if (null !== r && "handleChange" in r) {
            const t = i.signals;
            if (null != t) {
                const e = s.get(b);
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
        const i = s.locator.get(b);
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
        const o = B(t, n, this.name);
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
        const o = B(t, i, this.name);
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
        const n = this.func.evaluate(t, e, s, r);
        if (i(n)) return n(...this.args.map((i => i.evaluate(t, e, s, r))));
        if (!(8 & t) && null == n) return;
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
    evaluate(e, s, r, n) {
        switch (this.operation) {
          case "&&":
            return this.left.evaluate(e, s, r, n) && this.right.evaluate(e, s, r, n);

          case "||":
            return this.left.evaluate(e, s, r, n) || this.right.evaluate(e, s, r, n);

          case "==":
            return this.left.evaluate(e, s, r, n) == this.right.evaluate(e, s, r, n);

          case "===":
            return this.left.evaluate(e, s, r, n) === this.right.evaluate(e, s, r, n);

          case "!=":
            return this.left.evaluate(e, s, r, n) != this.right.evaluate(e, s, r, n);

          case "!==":
            return this.left.evaluate(e, s, r, n) !== this.right.evaluate(e, s, r, n);

          case "instanceof":
            {
                const t = this.right.evaluate(e, s, r, n);
                if (i(t)) return this.left.evaluate(e, s, r, n) instanceof t;
                return false;
            }

          case "in":
            {
                const t = this.right.evaluate(e, s, r, n);
                if (t instanceof Object) return this.left.evaluate(e, s, r, n) in t;
                return false;
            }

          case "+":
            {
                const i = this.left.evaluate(e, s, r, n);
                const o = this.right.evaluate(e, s, r, n);
                if ((1 & e) > 0) return i + o;
                if (!i || !o) {
                    if (t.isNumberOrBigInt(i) || t.isNumberOrBigInt(o)) return (i || 0) + (o || 0);
                    if (t.isStringOrDate(i) || t.isStringOrDate(o)) return (i || "") + (o || "");
                }
                return i + o;
            }

          case "-":
            return this.left.evaluate(e, s, r, n) - this.right.evaluate(e, s, r, n);

          case "*":
            return this.left.evaluate(e, s, r, n) * this.right.evaluate(e, s, r, n);

          case "/":
            return this.left.evaluate(e, s, r, n) / this.right.evaluate(e, s, r, n);

          case "%":
            return this.left.evaluate(e, s, r, n) % this.right.evaluate(e, s, r, n);

          case "<":
            return this.left.evaluate(e, s, r, n) < this.right.evaluate(e, s, r, n);

          case ">":
            return this.left.evaluate(e, s, r, n) > this.right.evaluate(e, s, r, n);

          case "<=":
            return this.left.evaluate(e, s, r, n) <= this.right.evaluate(e, s, r, n);

          case ">=":
            return this.left.evaluate(e, s, r, n) >= this.right.evaluate(e, s, r, n);

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
        const n = this.expressions.map((i => i.evaluate(t, e, s, r)));
        const o = this.func.evaluate(t, e, s, r);
        if (!i(o)) throw new Error(`AUR0110`);
        return o(this.cooked, ...n);
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
    evaluate(t, e, s, r) {
        return this.iterable.evaluate(t, e, s, r);
    }
    assign(t, e, s, r) {
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
    iterate(t, e, s) {
        switch (C.call(e)) {
          case "[object Array]":
            return k(e, s);

          case "[object Map]":
            return $(e, s);

          case "[object Set]":
            return L(e, s);

          case "[object Number]":
            return R(e, s);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${C.call(e)}`);
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

class DestructuringAssignmentExpression {
    constructor(t, e, s, r) {
        this.$kind = t;
        this.list = e;
        this.source = s;
        this.initializer = r;
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
        var i;
        const n = this.list;
        const o = n.length;
        let h;
        let c;
        for (h = 0; h < o; h++) {
            c = n[h];
            switch (c.$kind) {
              case 139289:
                c.assign(t, e, s, r);
                break;

              case 90137:
              case 106521:
                {
                    if ("object" !== typeof r || null === r) throw new Error("AUR0112");
                    let n = c.source.evaluate(t, Scope.create(r), s, null);
                    if (void 0 === n) n = null === (i = c.initializer) || void 0 === i ? void 0 : i.evaluate(t, e, s, null);
                    c.assign(t, e, s, n);
                    break;
                }
            }
        }
    }
    accept(t) {
        return t.visitDestructuringAssignmentExpression(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class DestructuringAssignmentSingleExpression {
    constructor(t, e, s) {
        this.target = t;
        this.source = e;
        this.initializer = s;
    }
    get $kind() {
        return 139289;
    }
    evaluate(t, e, s, r) {
        return;
    }
    assign(t, e, s, r) {
        var i;
        if (null == r) return;
        if ("object" !== typeof r) throw new Error("AUR0112");
        let n = this.source.evaluate(t, Scope.create(r), s, null);
        if (void 0 === n) n = null === (i = this.initializer) || void 0 === i ? void 0 : i.evaluate(t, e, s, null);
        this.target.assign(t, e, s, n);
    }
    accept(t) {
        return t.visitDestructuringAssignmentSingleExpression(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

class DestructuringAssignmentRestExpression {
    constructor(t, e) {
        this.target = t;
        this.indexOrProperties = e;
    }
    get $kind() {
        return 139289;
    }
    evaluate(t, e, s, r) {
        return;
    }
    assign(e, s, r, i) {
        if (null == i) return;
        if ("object" !== typeof i) throw new Error("AUR0112");
        const n = this.indexOrProperties;
        let o;
        if (t.isArrayIndex(n)) {
            if (!Array.isArray(i)) throw new Error("AUR0112");
            o = i.slice(n);
        } else o = Object.entries(i).reduce(((t, [e, s]) => {
            if (!n.includes(e)) t[e] = s;
            return t;
        }), {});
        this.target.assign(e, s, r, o);
    }
    accept(t) {
        return t.visitDestructuringAssignmentRestExpression(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

function B(t, e, s) {
    const r = null == e ? null : e[s];
    if (i(r)) return r;
    if (!(8 & t) && null == r) return null;
    throw new Error(`AUR0111:${s}`);
}

function k(t, e) {
    for (let s = 0, r = t.length; s < r; ++s) e(t, s, t[s]);
}

function $(t, e) {
    const s = Array(t.size);
    let r = -1;
    for (const e of t.entries()) s[++r] = e;
    k(s, e);
}

function L(t, e) {
    const s = Array(t.size);
    let r = -1;
    for (const e of t.keys()) s[++r] = e;
    k(s, e);
}

function R(t, e) {
    const s = Array(t);
    for (let e = 0; e < t; ++e) s[e] = e;
    k(s, e);
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

function T(t, e) {
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

function j(t = 0) {
    const e = Array(t);
    let s = 0;
    while (s < t) e[s] = s++;
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

function D(t) {
    return null == t ? F : F(t);
}

function F(t) {
    const e = t.prototype;
    r(e, "subs", {
        get: V
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

function V() {
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
    r(e, "queue", {
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

function Q(t, e, s) {
    s.delete(t);
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
    setValue(e, s) {
        const r = this.v;
        if (e !== r && t.isArrayIndex(e)) {
            if (0 === (256 & s)) this.o.length = e;
            this.v = e;
            this.h = r;
            this.f = s;
            this.queue.add(this);
        }
    }
    handleCollectionChange(t, e) {
        const s = this.v;
        const r = this.o.length;
        if ((this.v = r) !== s) {
            this.h = s;
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
        const s = this.v;
        const r = this.o.size;
        if ((this.v = r) !== s) {
            this.h = s;
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
    D(t);
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

function tt(t, e, s, r, i) {
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

function et(t, e, s, r, i) {
    let n = 0, o = 0;
    let h, c, u;
    let a, l, f;
    let d, p, v;
    let g, w;
    let b, x, E, A;
    let y, m, U, S;
    while (true) {
        if (r - s <= 10) {
            tt(t, e, s, r, i);
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
            w = a;
            h = c;
            a = l;
            c = g;
            l = w;
        }
        p = i(h, u);
        if (p >= 0) {
            g = h;
            w = a;
            h = u;
            a = f;
            u = c;
            f = l;
            c = g;
            l = w;
        } else {
            v = i(c, u);
            if (v > 0) {
                g = c;
                w = l;
                c = u;
                l = f;
                u = g;
                f = w;
            }
        }
        t[s] = h;
        e[s] = a;
        t[r - 1] = u;
        e[r - 1] = f;
        b = c;
        x = l;
        E = s + 1;
        A = r - 1;
        t[n] = t[E];
        e[n] = e[E];
        t[E] = b;
        e[E] = x;
        t: for (o = E + 1; o < A; o++) {
            y = t[o];
            m = e[o];
            U = i(y, b);
            if (U < 0) {
                t[o] = t[E];
                e[o] = e[E];
                t[E] = y;
                e[E] = m;
                E++;
            } else if (U > 0) {
                do {
                    A--;
                    if (A == o) break t;
                    S = t[A];
                    U = i(S, b);
                } while (U > 0);
                t[o] = t[A];
                e[o] = e[A];
                t[A] = y;
                e[A] = m;
                if (U < 0) {
                    y = t[o];
                    m = e[o];
                    t[o] = t[E];
                    e[o] = e[E];
                    t[E] = y;
                    e[E] = m;
                    E++;
                }
            }
        }
        if (r - A < E - s) {
            et(t, e, A, r, i);
            r = E;
        } else {
            et(t, e, s, E, i);
            s = A;
        }
    }
}

const st = Array.prototype;

const rt = st.push;

const it = st.unshift;

const nt = st.pop;

const ot = st.shift;

const ht = st.splice;

const ct = st.reverse;

const ut = st.sort;

const at = {
    push: rt,
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
        if (void 0 === e) return rt.apply(this, t);
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
        const e = J.get(this);
        if (void 0 === e) return it.apply(this, t);
        const s = t.length;
        const r = new Array(s);
        let i = 0;
        while (i < s) r[i++] = -2;
        it.apply(e.indexMap, r);
        const n = it.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = J.get(this);
        if (void 0 === t) return nt.call(this);
        const e = t.indexMap;
        const s = nt.call(this);
        const r = e.length - 1;
        if (e[r] > -1) e.deletedItems.push(e[r]);
        nt.call(e);
        t.notify();
        return s;
    },
    shift: function() {
        const t = J.get(this);
        if (void 0 === t) return ot.call(this);
        const e = t.indexMap;
        const s = ot.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        ot.call(e);
        t.notify();
        return s;
    },
    splice: function(...t) {
        const e = t[0];
        const s = t[1];
        const r = J.get(this);
        if (void 0 === r) return ht.apply(this, t);
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
            ht.call(h, e, s, ...r);
        } else ht.apply(h, t);
        const a = ht.apply(this, t);
        r.notify();
        return a;
    },
    reverse: function() {
        const t = J.get(this);
        if (void 0 === t) {
            ct.call(this);
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
        const e = J.get(this);
        if (void 0 === e) {
            ut.call(this, t);
            return this;
        }
        const s = this.length;
        if (s < 2) return this;
        et(this, e.indexMap, 0, s, Y);
        let r = 0;
        while (r < s) {
            if (void 0 === this[r]) break;
            r++;
        }
        if (void 0 === t || !i(t)) t = X;
        et(this, e.indexMap, 0, r, t);
        e.notify();
        return this;
    }
};

for (const t of lt) r(ft[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let dt = false;

function pt() {
    for (const t of lt) if (true !== st[t].observing) o(st, t, ft[t]);
}

function vt() {
    for (const t of lt) if (true === st[t].observing) o(st, t, at[t]);
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

D(ArrayObserver);

D(ArrayIndexObserver);

function gt(t) {
    let e = J.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function wt(t) {
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

function bt(t, e) {
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

const xt = new WeakMap;

const Et = Set.prototype;

const At = Et.add;

const yt = Et.clear;

const mt = Et.delete;

const Ut = {
    add: At,
    clear: yt,
    delete: mt
};

const St = [ "add", "clear", "delete" ];

const Ot = {
    add: function(t) {
        const e = xt.get(this);
        if (void 0 === e) {
            At.call(this, t);
            return this;
        }
        const s = this.size;
        At.call(this, t);
        const r = this.size;
        if (r === s) return this;
        e.indexMap[s] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = xt.get(this);
        if (void 0 === t) return yt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let s = 0;
            for (const t of this.keys()) {
                if (e[s] > -1) e.deletedItems.push(e[s]);
                s++;
            }
            yt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = xt.get(this);
        if (void 0 === e) return mt.call(this, t);
        const s = this.size;
        if (0 === s) return false;
        let r = 0;
        const i = e.indexMap;
        for (const s of this.keys()) {
            if (s === t) {
                if (i[r] > -1) i.deletedItems.push(i[r]);
                i.splice(r, 1);
                const s = mt.call(this, t);
                if (true === s) e.notify();
                return s;
            }
            r++;
        }
        return false;
    }
};

const Ct = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of St) r(Ot[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Bt = false;

function kt() {
    for (const t of St) if (true !== Et[t].observing) r(Et, t, {
        ...Ct,
        value: Ot[t]
    });
}

function $t() {
    for (const t of St) if (true === Et[t].observing) r(Et, t, {
        ...Ct,
        value: Ut[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Bt) {
            Bt = true;
            kt();
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

D(SetObserver);

function Lt(t) {
    let e = xt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Rt = new WeakMap;

const Pt = Map.prototype;

const Tt = Pt.set;

const jt = Pt.clear;

const It = Pt.delete;

const Mt = {
    set: Tt,
    clear: jt,
    delete: It
};

const Dt = [ "set", "clear", "delete" ];

const Ft = {
    set: function(t, e) {
        const s = Rt.get(this);
        if (void 0 === s) {
            Tt.call(this, t, e);
            return this;
        }
        const r = this.get(t);
        const i = this.size;
        Tt.call(this, t, e);
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
        const t = Rt.get(this);
        if (void 0 === t) return jt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let s = 0;
            for (const t of this.keys()) {
                if (e[s] > -1) e.deletedItems.push(e[s]);
                s++;
            }
            jt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Rt.get(this);
        if (void 0 === e) return It.call(this, t);
        const s = this.size;
        if (0 === s) return false;
        let r = 0;
        const i = e.indexMap;
        for (const s of this.keys()) {
            if (s === t) {
                if (i[r] > -1) i.deletedItems.push(i[r]);
                i.splice(r, 1);
                const s = It.call(this, t);
                if (true === s) e.notify();
                return s;
            }
            ++r;
        }
        return false;
    }
};

const Vt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Dt) r(Ft[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Nt = false;

function Kt() {
    for (const t of Dt) if (true !== Pt[t].observing) r(Pt, t, {
        ...Vt,
        value: Ft[t]
    });
}

function qt() {
    for (const t of Dt) if (true === Pt[t].observing) r(Pt, t, {
        ...Vt,
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
        Rt.set(t, this);
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

D(MapObserver);

function _t(t) {
    let e = Rt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function Ht(t, e) {
    const s = this.oL.getObserver(t, e);
    this.obs.add(s);
}

function Qt() {
    return o(this, "obs", new BindingObserverRecord(this));
}

function zt(t) {
    let e;
    if (t instanceof Array) e = gt(t); else if (t instanceof Set) e = Lt(t); else if (t instanceof Map) e = _t(t); else throw new Error("AUR0210");
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
    handleChange(t, e, s) {
        return this.b.interceptor.handleChange(t, e, s);
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
    r(e, "obs", {
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

Yt(BindingMediator);

const ee = t.DI.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.u = c();
        this.A = c();
        this.U = c();
    }
    parse(t, e) {
        let s;
        switch (e) {
          case 16:
            return new CustomExpression(t);

          case 1:
            s = this.U[t];
            if (void 0 === s) s = this.U[t] = this.$parse(t, e);
            return s;

          case 2:
            s = this.A[t];
            if (void 0 === s) s = this.A[t] = this.$parse(t, e);
            return s;

          default:
            if (0 === t.length) {
                if ((e & (4 | 8)) > 0) return PrimitiveLiteralExpression.$empty;
                throw new Error("AUR0169");
            }
            s = this.u[t];
            if (void 0 === s) s = this.u[t] = this.$parse(t, e);
            return s;
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

function se(t) {
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
        this.$ = 1572864;
        this.L = "";
        this.R = true;
        this.length = t.length;
        this.O = t.charCodeAt(0);
    }
    get P() {
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

function fe(t, e, s, r) {
    if (16 === r) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (1 & r) return we(t);
        xe(t);
        if (1048576 & t.$) throw new Error(`AUR0151:${t.ip}`);
    }
    t.R = 448 > s;
    let i;
    if (32768 & t.$) {
        const s = Be[63 & t.$];
        xe(t);
        i = new UnaryExpression(s, fe(t, e, 449, r));
        t.R = false;
    } else {
        t: switch (t.$) {
          case 3078:
            t.R = false;
            do {
                xe(t);
                e++;
                if (Oe(t, 16393)) {
                    if (16393 === t.$) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.$) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.$) {
                    const t = 511 & e;
                    i = 0 === t ? ce : 1 === t ? ue : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`AUR0154:${t.ip}`);
            } while (3078 === t.$);

          case 1024:
            if (2 & r) i = new BindingIdentifier(t.L); else {
                i = new AccessScopeExpression(t.L, 511 & e);
                e = 1024;
            }
            t.R = true;
            xe(t);
            break;

          case 3076:
            t.R = false;
            xe(t);
            i = ce;
            e = 512;
            break;

          case 671751:
            xe(t);
            i = fe(t, 0, 62, r);
            Ce(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = t.ip.search(/\s+of\s+/) > t.index ? de(t) : pe(t, e, r);
            e = 0;
            break;

          case 131080:
            i = ge(t, r);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.L ]);
            t.R = false;
            xe(t);
            e = 0;
            break;

          case 540715:
            i = be(t, e, r, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.L);
            t.R = false;
            xe(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = Be[63 & t.$];
            t.R = false;
            xe(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (2 & r) return ve(t, i);
        if (449 < s) return i;
        let n = t.L;
        while ((16384 & t.$) > 0) {
            const s = [];
            let o;
            switch (t.$) {
              case 16393:
                t.R = true;
                xe(t);
                if (0 === (3072 & t.$)) throw new Error(`AUR0153:${t.ip}`);
                n = t.L;
                xe(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.$) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.R = true;
                xe(t);
                e = 4096;
                i = new AccessKeyedExpression(i, fe(t, 0, 62, r));
                Ce(t, 1835022);
                break;

              case 671751:
                t.R = false;
                xe(t);
                while (1835019 !== t.$) {
                    s.push(fe(t, 0, 62, r));
                    if (!Oe(t, 1572876)) break;
                }
                Ce(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, s, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, s); else i = new CallFunctionExpression(i, s);
                e = 0;
                break;

              case 540714:
                t.R = false;
                o = [ t.L ];
                i = new TaggedTemplateExpression(o, o, i);
                xe(t);
                break;

              case 540715:
                i = be(t, e, r, i, true);
            }
        }
    }
    if (448 < s) return i;
    while ((65536 & t.$) > 0) {
        const n = t.$;
        if ((448 & n) <= s) break;
        xe(t);
        i = new BinaryExpression(Be[63 & n], i, fe(t, e, 448 & n, r));
        t.R = false;
    }
    if (63 < s) return i;
    if (Oe(t, 1572880)) {
        const s = fe(t, e, 62, r);
        Ce(t, 1572879);
        i = new ConditionalExpression(i, s, fe(t, e, 62, r));
        t.R = false;
    }
    if (62 < s) return i;
    if (Oe(t, 1048616)) {
        if (!t.R) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, fe(t, e, 62, r));
    }
    if (61 < s) return i;
    while (Oe(t, 1572884)) {
        if (1572864 === t.$) throw new Error(`AUR0159:${t.ip}`);
        const s = t.L;
        xe(t);
        const n = new Array;
        while (Oe(t, 1572879)) n.push(fe(t, e, 62, r));
        i = new ValueConverterExpression(i, s, n);
    }
    while (Oe(t, 1572883)) {
        if (1572864 === t.$) throw new Error(`AUR0160:${t.ip}`);
        const s = t.L;
        xe(t);
        const n = new Array;
        while (Oe(t, 1572879)) n.push(fe(t, e, 62, r));
        i = new BindingBehaviorExpression(i, s, n);
    }
    if (1572864 !== t.$) {
        if (1 & r) return i;
        if ("of" === t.P) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function de(t) {
    const e = [];
    const s = new DestructuringAssignmentExpression(90137, e, void 0, void 0);
    let r = "";
    let i = true;
    let n = 0;
    while (i) {
        xe(t);
        switch (t.$) {
          case 1835022:
            i = false;
            o();
            break;

          case 1572876:
            o();
            break;

          case 1024:
            r = t.P;
            break;

          default:
            throw new Error(`AUR0170:${t.ip}`);
        }
    }
    Ce(t, 1835022);
    return s;
    function o() {
        if ("" !== r) {
            e.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression(ce, r), new AccessKeyedExpression(ce, new PrimitiveLiteralExpression(n++)), void 0));
            r = "";
        } else n++;
    }
}

function pe(t, e, s) {
    xe(t);
    const r = new Array;
    while (1835022 !== t.$) if (Oe(t, 1572876)) {
        r.push(he);
        if (1835022 === t.$) break;
    } else {
        r.push(fe(t, e, 62, ~2 & s));
        if (Oe(t, 1572876)) {
            if (1835022 === t.$) break;
        } else break;
    }
    Ce(t, 1835022);
    if (2 & s) return new ArrayBindingPattern(r); else {
        t.R = false;
        return new ArrayLiteralExpression(r);
    }
}

function ve(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.$) throw new Error(`AUR0163:${t.ip}`);
    xe(t);
    const s = e;
    const r = fe(t, 0, 61, 0);
    return new ForOfStatement(s, r);
}

function ge(t, e) {
    const s = new Array;
    const r = new Array;
    xe(t);
    while (1835018 !== t.$) {
        s.push(t.L);
        if (12288 & t.$) {
            xe(t);
            Ce(t, 1572879);
            r.push(fe(t, 0, 62, ~2 & e));
        } else if (3072 & t.$) {
            const {O: s, $: i, index: n} = t;
            xe(t);
            if (Oe(t, 1572879)) r.push(fe(t, 0, 62, ~2 & e)); else {
                t.O = s;
                t.$ = i;
                t.index = n;
                r.push(fe(t, 0, 450, ~2 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.$) Ce(t, 1572876);
    }
    Ce(t, 1835018);
    if (2 & e) return new ObjectBindingPattern(s, r); else {
        t.R = false;
        return new ObjectLiteralExpression(s, r);
    }
}

function we(t) {
    const e = [];
    const s = [];
    const r = t.length;
    let i = "";
    while (t.index < r) {
        switch (t.O) {
          case 36:
            if (123 === t.ip.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.O = t.ip.charCodeAt(t.index);
                xe(t);
                const r = fe(t, 0, 61, 1);
                s.push(r);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(se(Ee(t)));
            break;

          default:
            i += String.fromCharCode(t.O);
        }
        Ee(t);
    }
    if (s.length) {
        e.push(i);
        return new Interpolation(e, s);
    }
    return null;
}

function be(t, e, s, r, i) {
    const n = [ t.L ];
    Ce(t, 540715);
    const o = [ fe(t, e, 62, s) ];
    while (540714 !== (t.$ = Se(t))) {
        n.push(t.L);
        Ce(t, 540715);
        o.push(fe(t, e, 62, s));
    }
    n.push(t.L);
    t.R = false;
    if (i) {
        xe(t);
        return new TaggedTemplateExpression(n, n, r, o);
    } else {
        xe(t);
        return new TemplateExpression(n, o);
    }
}

function xe(t) {
    while (t.index < t.length) {
        t.C = t.index;
        if (null != (t.$ = Ie[t.O](t))) return;
    }
    t.$ = 1572864;
}

function Ee(t) {
    return t.O = t.ip.charCodeAt(++t.index);
}

function Ae(t) {
    while (je[Ee(t)]) ;
    const e = ke[t.L = t.P];
    return void 0 === e ? 1024 : e;
}

function ye(t, e) {
    let s = t.O;
    if (false === e) {
        do {
            s = Ee(t);
        } while (s <= 57 && s >= 48);
        if (46 !== s) {
            t.L = parseInt(t.P, 10);
            return 8192;
        }
        s = Ee(t);
        if (t.index >= t.length) {
            t.L = parseInt(t.P.slice(0, -1), 10);
            return 8192;
        }
    }
    if (s <= 57 && s >= 48) do {
        s = Ee(t);
    } while (s <= 57 && s >= 48); else t.O = t.ip.charCodeAt(--t.index);
    t.L = parseFloat(t.P);
    return 8192;
}

function me(t) {
    const e = t.O;
    Ee(t);
    let s = 0;
    const r = new Array;
    let i = t.index;
    while (t.O !== e) if (92 === t.O) {
        r.push(t.ip.slice(i, t.index));
        Ee(t);
        s = se(t.O);
        Ee(t);
        r.push(String.fromCharCode(s));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else Ee(t);
    const n = t.ip.slice(i, t.index);
    Ee(t);
    r.push(n);
    const o = r.join("");
    t.L = o;
    return 4096;
}

function Ue(t) {
    let e = true;
    let s = "";
    while (96 !== Ee(t)) if (36 === t.O) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else s += "$"; else if (92 === t.O) s += String.fromCharCode(se(Ee(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        s += String.fromCharCode(t.O);
    }
    Ee(t);
    t.L = s;
    if (e) return 540714;
    return 540715;
}

function Se(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return Ue(t);
}

function Oe(t, e) {
    if (t.$ === e) {
        xe(t);
        return true;
    }
    return false;
}

function Ce(t, e) {
    if (t.$ === e) xe(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const Be = [ ie, ne, oe, he, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const ke = c();

ke.true = 2049;

ke.null = 2050;

ke.false = 2048;

ke.undefined = 2051;

ke.$this = 3076;

ke.$parent = 3078;

ke.in = 1640799;

ke.instanceof = 1640800;

ke.typeof = 34851;

ke.void = 34852;

ke.of = 1051180;

const $e = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Le(t, e, s, r) {
    const i = s.length;
    for (let n = 0; n < i; n += 2) {
        const i = s[n];
        let o = s[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(r, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function Re(t) {
    return e => {
        Ee(e);
        return t;
    };
}

const Pe = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

Pe.notMapped = true;

const Te = new Set;

Le(null, Te, $e.AsciiIdPart, true);

const je = new Uint8Array(65535);

Le(je, null, $e.IdStart, 1);

Le(je, null, $e.Digit, 1);

const Ie = new Array(65535);

Ie.fill(Pe, 0, 65535);

Le(Ie, null, $e.Skip, (t => {
    Ee(t);
    return null;
}));

Le(Ie, null, $e.IdStart, Ae);

Le(Ie, null, $e.Digit, (t => ye(t, false)));

Ie[34] = Ie[39] = t => me(t);

Ie[96] = t => Ue(t);

Ie[33] = t => {
    if (61 !== Ee(t)) return 32809;
    if (61 !== Ee(t)) return 1638680;
    Ee(t);
    return 1638682;
};

Ie[61] = t => {
    if (61 !== Ee(t)) return 1048616;
    if (61 !== Ee(t)) return 1638679;
    Ee(t);
    return 1638681;
};

Ie[38] = t => {
    if (38 !== Ee(t)) return 1572883;
    Ee(t);
    return 1638614;
};

Ie[124] = t => {
    if (124 !== Ee(t)) return 1572884;
    Ee(t);
    return 1638549;
};

Ie[46] = t => {
    if (Ee(t) <= 57 && t.O >= 48) return ye(t, true);
    return 16393;
};

Ie[60] = t => {
    if (61 !== Ee(t)) return 1638747;
    Ee(t);
    return 1638749;
};

Ie[62] = t => {
    if (61 !== Ee(t)) return 1638748;
    Ee(t);
    return 1638750;
};

Ie[37] = Re(1638886);

Ie[40] = Re(671751);

Ie[41] = Re(1835019);

Ie[42] = Re(1638885);

Ie[43] = Re(623009);

Ie[44] = Re(1572876);

Ie[45] = Re(623010);

Ie[47] = Re(1638887);

Ie[58] = Re(1572879);

Ie[63] = Re(1572880);

Ie[91] = Re(671757);

Ie[93] = Re(1835022);

Ie[123] = Re(131080);

Ie[125] = Re(1835018);

let Me = null;

const De = [];

let Fe = false;

function Ve() {
    Fe = false;
}

function Ne() {
    Fe = true;
}

function Ke() {
    return Me;
}

function qe(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == Me) {
        Me = t;
        De[0] = Me;
        Fe = true;
        return;
    }
    if (Me === t) throw new Error("AUR0207");
    De.push(Me);
    Me = t;
    Fe = true;
}

function _e(t) {
    if (null == t) throw new Error("AUR0208");
    if (Me !== t) throw new Error("AUR0209");
    De.pop();
    Me = De.length > 0 ? De[De.length - 1] : null;
    Fe = null != Me;
}

const He = Object.freeze({
    get current() {
        return Me;
    },
    get connecting() {
        return Fe;
    },
    enter: qe,
    exit: _e,
    pause: Ve,
    resume: Ne
});

const Qe = Reflect.get;

const ze = Object.prototype.toString;

const We = new WeakMap;

function Ge(t) {
    switch (ze.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const Ze = "__raw__";

function Je(t) {
    return Ge(t) ? Xe(t) : t;
}

function Xe(t) {
    var e;
    return null !== (e = We.get(t)) && void 0 !== e ? e : ss(t);
}

function Ye(t) {
    var e;
    return null !== (e = t[Ze]) && void 0 !== e ? e : t;
}

function ts(t) {
    return Ge(t) && t[Ze] || t;
}

function es(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function ss(t) {
    const e = t instanceof Array ? is : t instanceof Map || t instanceof Set ? Cs : rs;
    const s = new Proxy(t, e);
    We.set(t, s);
    return s;
}

const rs = {
    get(t, e, s) {
        if (e === Ze) return t;
        const r = Ke();
        if (!Fe || es(e) || null == r) return Qe(t, e, s);
        r.observe(t, e);
        return Je(Qe(t, e, s));
    }
};

const is = {
    get(t, e, s) {
        if (e === Ze) return t;
        const r = Ke();
        if (!Fe || es(e) || null == r) return Qe(t, e, s);
        switch (e) {
          case "length":
            r.observe(t, "length");
            return t.length;

          case "map":
            return ns;

          case "includes":
            return cs;

          case "indexOf":
            return us;

          case "lastIndexOf":
            return as;

          case "every":
            return os;

          case "filter":
            return hs;

          case "find":
            return fs;

          case "findIndex":
            return ls;

          case "flat":
            return ds;

          case "flatMap":
            return ps;

          case "join":
            return vs;

          case "push":
            return ws;

          case "pop":
            return gs;

          case "reduce":
            return Ss;

          case "reduceRight":
            return Os;

          case "reverse":
            return As;

          case "shift":
            return bs;

          case "unshift":
            return xs;

          case "slice":
            return Us;

          case "splice":
            return Es;

          case "some":
            return ys;

          case "sort":
            return ms;

          case "keys":
            return js;

          case "values":
          case Symbol.iterator:
            return Is;

          case "entries":
            return Ms;
        }
        r.observe(t, e);
        return Je(Qe(t, e, s));
    },
    ownKeys(t) {
        var e;
        null === (e = Ke()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function ns(t, e) {
    var s;
    const r = Ye(this);
    const i = r.map(((s, r) => ts(t.call(e, Je(s), r, this))));
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Je(i);
}

function os(t, e) {
    var s;
    const r = Ye(this);
    const i = r.every(((s, r) => t.call(e, Je(s), r, this)));
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function hs(t, e) {
    var s;
    const r = Ye(this);
    const i = r.filter(((s, r) => ts(t.call(e, Je(s), r, this))));
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Je(i);
}

function cs(t) {
    var e;
    const s = Ye(this);
    const r = s.includes(ts(t));
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function us(t) {
    var e;
    const s = Ye(this);
    const r = s.indexOf(ts(t));
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function as(t) {
    var e;
    const s = Ye(this);
    const r = s.lastIndexOf(ts(t));
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function ls(t, e) {
    var s;
    const r = Ye(this);
    const i = r.findIndex(((s, r) => ts(t.call(e, Je(s), r, this))));
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function fs(t, e) {
    var s;
    const r = Ye(this);
    const i = r.find(((e, s) => t(Je(e), s, this)), e);
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Je(i);
}

function ds() {
    var t;
    const e = Ye(this);
    null === (t = Ke()) || void 0 === t ? void 0 : t.observeCollection(e);
    return Je(e.flat());
}

function ps(t, e) {
    var s;
    const r = Ye(this);
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Xe(r.flatMap(((s, r) => Je(t.call(e, Je(s), r, this)))));
}

function vs(t) {
    var e;
    const s = Ye(this);
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return s.join(t);
}

function gs() {
    return Je(Ye(this).pop());
}

function ws(...t) {
    return Ye(this).push(...t);
}

function bs() {
    return Je(Ye(this).shift());
}

function xs(...t) {
    return Ye(this).unshift(...t);
}

function Es(...t) {
    return Je(Ye(this).splice(...t));
}

function As(...t) {
    var e;
    const s = Ye(this);
    const r = s.reverse();
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return Je(r);
}

function ys(t, e) {
    var s;
    const r = Ye(this);
    const i = r.some(((s, r) => ts(t.call(e, Je(s), r, this))));
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function ms(t) {
    var e;
    const s = Ye(this);
    const r = s.sort(t);
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return Je(r);
}

function Us(t, e) {
    var s;
    const r = Ye(this);
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Xe(r.slice(t, e));
}

function Ss(t, e) {
    var s;
    const r = Ye(this);
    const i = r.reduce(((e, s, r) => t(e, Je(s), r, this)), e);
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Je(i);
}

function Os(t, e) {
    var s;
    const r = Ye(this);
    const i = r.reduceRight(((e, s, r) => t(e, Je(s), r, this)), e);
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Je(i);
}

const Cs = {
    get(t, e, s) {
        if (e === Ze) return t;
        const r = Ke();
        if (!Fe || es(e) || null == r) return Qe(t, e, s);
        switch (e) {
          case "size":
            r.observe(t, "size");
            return t.size;

          case "clear":
            return Ps;

          case "delete":
            return Ts;

          case "forEach":
            return Bs;

          case "add":
            if (t instanceof Set) return Rs;
            break;

          case "get":
            if (t instanceof Map) return $s;
            break;

          case "set":
            if (t instanceof Map) return Ls;
            break;

          case "has":
            return ks;

          case "keys":
            return js;

          case "values":
            return Is;

          case "entries":
            return Ms;

          case Symbol.iterator:
            return t instanceof Map ? Ms : Is;
        }
        return Je(Qe(t, e, s));
    }
};

function Bs(t, e) {
    var s;
    const r = Ye(this);
    null === (s = Ke()) || void 0 === s ? void 0 : s.observeCollection(r);
    return r.forEach(((s, r) => {
        t.call(e, Je(s), Je(r), this);
    }));
}

function ks(t) {
    var e;
    const s = Ye(this);
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return s.has(ts(t));
}

function $s(t) {
    var e;
    const s = Ye(this);
    null === (e = Ke()) || void 0 === e ? void 0 : e.observeCollection(s);
    return Je(s.get(ts(t)));
}

function Ls(t, e) {
    return Je(Ye(this).set(ts(t), ts(e)));
}

function Rs(t) {
    return Je(Ye(this).add(ts(t)));
}

function Ps() {
    return Je(Ye(this).clear());
}

function Ts(t) {
    return Je(Ye(this).delete(ts(t)));
}

function js() {
    var t;
    const e = Ye(this);
    null === (t = Ke()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Je(e),
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Is() {
    var t;
    const e = Ye(this);
    null === (t = Ke()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Je(e),
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Ms() {
    var t;
    const e = Ye(this);
    null === (t = Ke()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ Je(e[0]), Je(e[1]) ],
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const Ds = Object.freeze({
    getProxy: Xe,
    getRaw: Ye,
    wrap: Je,
    unwrap: ts,
    rawKey: Ze
});

class ComputedObserver {
    constructor(t, e, s, r, i) {
        this.interceptor = this;
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.ir = false;
        this.D = false;
        this.o = t;
        this.get = e;
        this.set = s;
        this.up = r;
        this.oL = i;
    }
    static create(t, e, s, i, n) {
        const o = s.get;
        const h = s.set;
        const c = new ComputedObserver(t, o, h, n, i);
        const u = () => c.getValue();
        u.getObserver = () => c;
        r(t, e, {
            enumerable: s.enumerable,
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
        Fs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, Fs, 0);
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
            qe(this);
            return this.v = ts(this.get.call(this.up ? Je(this.o) : this.o, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            _e(this);
        }
    }
}

te(ComputedObserver);

D(ComputedObserver);

q(ComputedObserver);

let Fs;

const Vs = t.DI.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Ns = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const Ks = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.T = null;
        this.j = 0;
        this.check = () => {
            if (Ns.disabled) return;
            if (++this.j < Ns.timeoutsPerCheck) return;
            this.j = 0;
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
        if (Ns.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.T = this.p.taskQueue.queueTask(this.check, Ks);
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
    constructor(t, e, s) {
        this.obj = e;
        this.key = s;
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

D(DirtyCheckProperty);

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
    setValue(t, e, s, r) {
        s[r] = t;
    }
}

let qs;

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
        qs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, qs, this.f);
    }
    start() {
        if (false === this.iO) {
            this.iO = true;
            this.v = this.o[this.k];
            r(this.o, this.k, {
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
            r(this.o, this.k, {
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
    constructor(t, e, s, r) {
        this.type = 1;
        this.v = void 0;
        this.ov = void 0;
        this.f = 0;
        this.o = t;
        this.S = s;
        this.hs = i(s);
        const n = t[e];
        this.cb = i(n) ? n : void 0;
        this.v = r;
    }
    getValue() {
        return this.v;
    }
    setValue(t, e) {
        var s;
        if (this.hs) t = this.S(t);
        if (!Object.is(t, this.v)) {
            this.ov = this.v;
            this.v = t;
            this.f = e;
            null === (s = this.cb) || void 0 === s ? void 0 : s.call(this.o, this.v, this.ov, e);
            this.queue.add(this);
        }
    }
    flush() {
        qs = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, qs, this.f);
    }
}

D(SetterObserver);

D(SetterNotifier);

q(SetterObserver);

q(SetterNotifier);

const _s = new PropertyAccessor;

const Hs = t.DI.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const Qs = t.DI.createInterface("INodeObserverLocator", (e => e.cachedCallback((e => {
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
        return _s;
    }
    getAccessor() {
        return _s;
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
        var s, r;
        return null !== (r = null === (s = t.$observers) || void 0 === s ? void 0 : s[e]) && void 0 !== r ? r : this.V(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var s;
        const r = null === (s = t.$observers) || void 0 === s ? void 0 : s[e];
        if (void 0 !== r) return r;
        if (this.M.handles(t, e, this)) return this.M.getAccessor(t, e, this);
        return _s;
    }
    getArrayObserver(t) {
        return gt(t);
    }
    getMapObserver(t) {
        return _t(t);
    }
    getSetObserver(t) {
        return Lt(t);
    }
    createObserver(e, r) {
        var i, n, o, h;
        if (!(e instanceof Object)) return new PrimitiveObserver(e, r);
        if (this.M.handles(e, r, this)) return this.M.getObserver(e, r, this);
        switch (r) {
          case "length":
            if (e instanceof Array) return gt(e).getLengthObserver();
            break;

          case "size":
            if (e instanceof Map) return _t(e).getLengthObserver(); else if (e instanceof Set) return Lt(e).getLengthObserver();
            break;

          default:
            if (e instanceof Array && t.isArrayIndex(r)) return gt(e).getIndexObserver(Number(r));
            break;
        }
        let c = Gs(e, r);
        if (void 0 === c) {
            let t = Ws(e);
            while (null !== t) {
                c = Gs(t, r);
                if (void 0 === c) t = Ws(t); else break;
            }
        }
        if (void 0 !== c && !s.call(c, "value")) {
            let t = this.N(e, r, c);
            if (null == t) t = null === (h = null !== (n = null === (i = c.get) || void 0 === i ? void 0 : i.getObserver) && void 0 !== n ? n : null === (o = c.set) || void 0 === o ? void 0 : o.getObserver) || void 0 === h ? void 0 : h(e, this);
            return null == t ? c.configurable ? ComputedObserver.create(e, r, c, this, true) : this.I.createProperty(e, r) : t;
        }
        return new SetterObserver(e, r);
    }
    N(t, e, s) {
        if (this.F.length > 0) for (const r of this.F) {
            const i = r.getObserver(t, e, s, this);
            if (null != i) return i;
        }
        return null;
    }
    V(t, e, s) {
        if (true === s.doNotCache) return s;
        if (void 0 === t.$observers) {
            r(t, "$observers", {
                value: {
                    [e]: s
                }
            });
            return s;
        }
        return t.$observers[e] = s;
    }
}

ObserverLocator.inject = [ Vs, Qs ];

function zs(t) {
    let e;
    if (t instanceof Array) e = gt(t); else if (t instanceof Map) e = _t(t); else if (t instanceof Set) e = Lt(t);
    return e;
}

const Ws = Object.getPrototypeOf;

const Gs = Object.getOwnPropertyDescriptor;

const Zs = t.DI.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ Hs ];
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
            qe(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            _e(this);
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

function Js(t) {
    if (void 0 === t.$observers) r(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Xs = {};

function Ys(t, e, s) {
    if (null == e) return (e, s, r) => i(e, s, r, t);
    return i(t, e, s);
    function i(t, e, s, i) {
        var n;
        const o = void 0 === e;
        i = "object" !== typeof i ? {
            name: i
        } : i || {};
        if (o) e = i.name;
        if (null == e || "" === e) throw new Error("AUR0224");
        const h = i.callback || `${String(e)}Changed`;
        let c = Xs;
        if (s) {
            delete s.value;
            delete s.writable;
            c = null === (n = s.initializer) || void 0 === n ? void 0 : n.call(s);
            delete s.initializer;
        } else s = {
            configurable: true
        };
        if (!("enumerable" in s)) s.enumerable = true;
        const u = i.set;
        s.get = function t() {
            var s;
            const r = tr(this, e, h, c, u);
            null === (s = Ke()) || void 0 === s ? void 0 : s.subscribeTo(r);
            return r.getValue();
        };
        s.set = function t(s) {
            tr(this, e, h, c, u).setValue(s, 0);
        };
        s.get.getObserver = function t(s) {
            return tr(s, e, h, c, u);
        };
        if (o) r(t.prototype, e, s); else return s;
    }
}

function tr(t, e, s, r, i) {
    const n = Js(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, s, i, r === Xs ? void 0 : r);
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

exports.ConnectableSwitcher = He;

exports.CustomExpression = CustomExpression;

exports.DestructuringAssignmentExpression = DestructuringAssignmentExpression;

exports.DestructuringAssignmentRestExpression = DestructuringAssignmentRestExpression;

exports.DestructuringAssignmentSingleExpression = DestructuringAssignmentSingleExpression;

exports.DirtyCheckProperty = DirtyCheckProperty;

exports.DirtyCheckSettings = Ns;

exports.FlushQueue = FlushQueue;

exports.ForOfStatement = ForOfStatement;

exports.HtmlLiteralExpression = HtmlLiteralExpression;

exports.IDirtyChecker = Vs;

exports.IExpressionParser = ee;

exports.INodeObserverLocator = Qs;

exports.IObservation = Zs;

exports.IObserverLocator = Hs;

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

exports.ProxyObservable = Ds;

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

exports.alias = v;

exports.applyMutationsToIndices = wt;

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

exports.enableSetObservation = kt;

exports.getCollectionObserver = zs;

exports.isIndexMap = M;

exports.observable = Ys;

exports.parse = fe;

exports.parseExpression = le;

exports.registerAliases = g;

exports.subscriberCollection = D;

exports.synchronizeIndices = bt;

exports.valueConverter = m;

exports.withFlushQueue = q;
//# sourceMappingURL=index.js.map
