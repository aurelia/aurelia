import { Metadata as t, Protocol as e, Registration as r, DI as s, firstDefined as i, mergeArrays as n, fromAnnotationOrDefinitionOrTypeOrDefault as o, isNumberOrBigInt as h, isStringOrDate as u, emptyArray as c, isArrayIndex as a, IPlatform as l, ILogger as f } from "@aurelia/kernel";

export { IPlatform } from "@aurelia/kernel";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "@aurelia/platform";

const d = t.getOwn;

const v = t.hasOwn;

const p = t.define;

const g = e.annotation.keyFor;

const b = e.resource.keyFor;

const w = e.resource.appendTo;

function m(...t) {
    return function(e) {
        const r = g("aliases");
        const s = d(r, e);
        if (void 0 === s) p(r, t, e); else s.push(...t);
    };
}

function E(t, e, s, i) {
    for (let n = 0, o = t.length; n < o; ++n) r.aliasTo(s, e.keyFrom(t[n])).register(i);
}

const y = Object.freeze({});

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
        if (16 & s) return y;
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

const A = s.createInterface("ISignaler", (t => t.singleton(Signaler)));

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

var U;

(function(t) {
    t[t["singleton"] = 1] = "singleton";
    t[t["interceptor"] = 2] = "interceptor";
})(U || (U = {}));

function C(t) {
    return function(e) {
        return x.define(t, e);
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
        return new BindingBehaviorDefinition(e, i(S(e, "name"), r), n(S(e, "aliases"), s.aliases, e.aliases), x.keyFrom(r), o("strategy", s, e, (() => h ? 2 : 1)));
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
        E(i, x, s, t);
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

const O = b("binding-behavior");

const S = (t, e) => d(g(e), t);

const x = Object.freeze({
    name: O,
    keyFrom(t) {
        return `${O}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && v(O, t);
    },
    define(t, e) {
        const r = BindingBehaviorDefinition.create(t, e);
        p(O, r, r.Type);
        p(O, r, r);
        w(e, O);
        return r.Type;
    },
    getDefinition(t) {
        const e = d(O, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        p(g(e), r, t);
    },
    getAnnotation: S
});

function B(t) {
    return function(e) {
        return $.define(t, e);
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
        return new ValueConverterDefinition(e, i(L(e, "name"), r), n(L(e, "aliases"), s.aliases, e.aliases), $.keyFrom(r));
    }
    register(t) {
        const {Type: e, key: s, aliases: i} = this;
        r.singleton(s, e).register(t);
        r.aliasTo(s, e).register(t);
        E(i, $, s, t);
    }
}

const k = b("value-converter");

const L = (t, e) => d(g(e), t);

const $ = Object.freeze({
    name: k,
    keyFrom: t => `${k}:${t}`,
    isType(t) {
        return "function" === typeof t && v(k, t);
    },
    define(t, e) {
        const r = ValueConverterDefinition.create(t, e);
        p(k, r, r.Type);
        p(k, r, r);
        w(e, k);
        return r.Type;
    },
    getDefinition(t) {
        const e = d(k, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        p(g(e), r, t);
    },
    getAnnotation: L
});

var T;

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
})(T || (T = {}));

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
        this.behaviorKey = x.keyFrom(e);
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
        this.converterKey = $.keyFrom(e);
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
                const e = r.get(A);
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
        const i = r.locator.get(A);
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
        const o = R(t, n, this.name);
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
        const o = R(t, i, this.name);
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

const P = Object.prototype.toString;

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
        switch (P.call(e)) {
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
            throw new Error(`Cannot count ${P.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (P.call(e)) {
          case "[object Array]":
            return j(e, r);

          case "[object Map]":
            return I(e, r);

          case "[object Set]":
            return M(e, r);

          case "[object Number]":
            return F(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${P.call(e)}`);
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

function R(t, e, r) {
    const s = null == e ? null : e[r];
    if ("function" === typeof s) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`AUR0111:${r}`);
}

function j(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function I(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    j(r, e);
}

function M(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    j(r, e);
}

function F(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    j(r, e);
}

const V = Object.prototype.hasOwnProperty;

const D = Reflect.defineProperty;

const N = t => "function" === typeof t;

function K(t, e, r) {
    D(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function q(t, e, r, s = false) {
    if (s || !V.call(t, e)) K(t, e, r);
}

var H;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(H || (H = {}));

var Q;

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
})(Q || (Q = {}));

var _;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(_ || (_ = {}));

var W;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(W || (W = {}));

var z;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(z || (z = {}));

var G;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(G || (G = {}));

function Z(t, e) {
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

function J(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function X(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function Y(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function tt(t) {
    return null == t ? et : et(t);
}

function et(t) {
    const e = t.prototype;
    D(e, "subs", {
        get: rt
    });
    q(e, "subscribe", st);
    q(e, "unsubscribe", it);
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

function rt() {
    return K(this, "subs", new SubscriberRecord);
}

function st(t) {
    return this.subs.add(t);
}

function it(t) {
    return this.subs.remove(t);
}

function nt(t) {
    return null == t ? ot : ot(t);
}

function ot(t) {
    const e = t.prototype;
    D(e, "queue", {
        get: ht
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
            this.i.forEach(ut);
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

function ht() {
    return FlushQueue.instance;
}

function ut(t, e, r) {
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
    setValue(t, e) {
        const r = this.v;
        if (t !== r && a(t)) {
            if (0 === (256 & e)) this.O.length = t;
            this.v = t;
            this.h = r;
            this.f = e;
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
        ft = this.h;
        this.h = this.v;
        this.subs.notify(this.v, ft, this.f);
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
        ft = this.h;
        this.h = this.v;
        this.subs.notify(this.v, ft, this.f);
    }
}

function ct(t) {
    const e = t.prototype;
    q(e, "subscribe", at, true);
    q(e, "unsubscribe", lt, true);
    nt(t);
    tt(t);
}

function at(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function lt(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

ct(CollectionLengthObserver);

ct(CollectionSizeObserver);

let ft;

const dt = new WeakMap;

function vt(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function pt(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function gt(t, e, r, s, i) {
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

function bt(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, u, c;
    let a, l, f;
    let d, v, p;
    let g, b;
    let w, m, E, y;
    let A, U, C, O;
    while (true) {
        if (s - r <= 10) {
            gt(t, e, r, s, i);
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
        m = l;
        E = r + 1;
        y = s - 1;
        t[n] = t[E];
        e[n] = e[E];
        t[E] = w;
        e[E] = m;
        t: for (o = E + 1; o < y; o++) {
            A = t[o];
            U = e[o];
            C = i(A, w);
            if (C < 0) {
                t[o] = t[E];
                e[o] = e[E];
                t[E] = A;
                e[E] = U;
                E++;
            } else if (C > 0) {
                do {
                    y--;
                    if (y == o) break t;
                    O = t[y];
                    C = i(O, w);
                } while (C > 0);
                t[o] = t[y];
                e[o] = e[y];
                t[y] = A;
                e[y] = U;
                if (C < 0) {
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
            bt(t, e, y, s, i);
            s = E;
        } else {
            bt(t, e, r, E, i);
            r = y;
        }
    }
}

const wt = Array.prototype;

const mt = wt.push;

const Et = wt.unshift;

const yt = wt.pop;

const At = wt.shift;

const Ut = wt.splice;

const Ct = wt.reverse;

const Ot = wt.sort;

const St = {
    push: mt,
    unshift: Et,
    pop: yt,
    shift: At,
    splice: Ut,
    reverse: Ct,
    sort: Ot
};

const xt = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const Bt = {
    push: function(...t) {
        const e = dt.get(this);
        if (void 0 === e) return mt.apply(this, t);
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
        const e = dt.get(this);
        if (void 0 === e) return Et.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        Et.apply(e.indexMap, s);
        const n = Et.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = dt.get(this);
        if (void 0 === t) return yt.call(this);
        const e = t.indexMap;
        const r = yt.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        yt.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = dt.get(this);
        if (void 0 === t) return At.call(this);
        const e = t.indexMap;
        const r = At.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        At.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = dt.get(this);
        if (void 0 === s) return Ut.apply(this, t);
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
            Ut.call(h, e, r, ...s);
        } else Ut.apply(h, t);
        const a = Ut.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = dt.get(this);
        if (void 0 === t) {
            Ct.call(this);
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
        const e = dt.get(this);
        if (void 0 === e) {
            Ot.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        bt(this, e.indexMap, 0, r, pt);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || "function" !== typeof t) t = vt;
        bt(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of xt) D(Bt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let kt = false;

function Lt() {
    for (const t of xt) if (true !== wt[t].observing) K(wt, t, Bt[t]);
}

function $t() {
    for (const t of xt) if (true === wt[t].observing) K(wt, t, St[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!kt) {
            kt = true;
            Lt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = J(t.length);
        this.lenObs = void 0;
        dt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = J(e);
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

tt(ArrayObserver);

tt(ArrayIndexObserver);

function Tt(t) {
    let e = dt.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function Pt(t) {
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

function Rt(t, e) {
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

const jt = new WeakMap;

const It = Set.prototype;

const Mt = It.add;

const Ft = It.clear;

const Vt = It.delete;

const Dt = {
    add: Mt,
    clear: Ft,
    delete: Vt
};

const Nt = [ "add", "clear", "delete" ];

const Kt = {
    add: function(t) {
        const e = jt.get(this);
        if (void 0 === e) {
            Mt.call(this, t);
            return this;
        }
        const r = this.size;
        Mt.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = jt.get(this);
        if (void 0 === t) return Ft.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Ft.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = jt.get(this);
        if (void 0 === e) return Vt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Vt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const qt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Nt) D(Kt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Ht = false;

function Qt() {
    for (const t of Nt) if (true !== It[t].observing) D(It, t, {
        ...qt,
        value: Kt[t]
    });
}

function _t() {
    for (const t of Nt) if (true === It[t].observing) D(It, t, {
        ...qt,
        value: Dt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Ht) {
            Ht = true;
            Qt();
        }
        this.collection = t;
        this.indexMap = J(t.size);
        this.lenObs = void 0;
        jt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = J(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

tt(SetObserver);

function Wt(t) {
    let e = jt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const zt = new WeakMap;

const Gt = Map.prototype;

const Zt = Gt.set;

const Jt = Gt.clear;

const Xt = Gt.delete;

const Yt = {
    set: Zt,
    clear: Jt,
    delete: Xt
};

const te = [ "set", "clear", "delete" ];

const ee = {
    set: function(t, e) {
        const r = zt.get(this);
        if (void 0 === r) {
            Zt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        Zt.call(this, t, e);
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
        const t = zt.get(this);
        if (void 0 === t) return Jt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Jt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = zt.get(this);
        if (void 0 === e) return Xt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Xt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const re = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of te) D(ee[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let se = false;

function ie() {
    for (const t of te) if (true !== Gt[t].observing) D(Gt, t, {
        ...re,
        value: ee[t]
    });
}

function ne() {
    for (const t of te) if (true === Gt[t].observing) D(Gt, t, {
        ...re,
        value: Yt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!se) {
            se = true;
            ie();
        }
        this.collection = t;
        this.indexMap = J(t.size);
        this.lenObs = void 0;
        zt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = J(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

tt(MapObserver);

function oe(t) {
    let e = zt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function he(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function ue() {
    return K(this, "obs", new BindingObserverRecord(this));
}

function ce(t) {
    let e;
    if (t instanceof Array) e = Tt(t); else if (t instanceof Set) e = Wt(t); else if (t instanceof Map) e = oe(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function ae(t) {
    this.obs.add(t);
}

function le() {
    throw new Error(`AUR2011:handleChange`);
}

function fe() {
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
        this.o.forEach(ve, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(de, this);
        this.o.clear();
        this.count = 0;
    }
}

function de(t, e) {
    e.unsubscribe(this);
}

function ve(t, e) {
    if (this.version !== t) {
        e.unsubscribe(this);
        this.o.delete(e);
    }
}

function pe(t) {
    const e = t.prototype;
    q(e, "observe", he, true);
    q(e, "observeCollection", ce, true);
    q(e, "subscribeTo", ae, true);
    D(e, "obs", {
        get: ue
    });
    q(e, "handleChange", le);
    q(e, "handleCollectionChange", fe);
    return t;
}

function ge(t) {
    return null == t ? pe : pe(t);
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

pe(BindingMediator);

const be = s.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

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
        Le.ip = t;
        Le.length = t.length;
        Le.index = 0;
        Le.u = t.charCodeAt(0);
        return Te(Le, 0, 61, void 0 === e ? 53 : e);
    }
}

var we;

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
})(we || (we = {}));

function me(t) {
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

var Ee;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(Ee || (Ee = {}));

var ye;

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
})(ye || (ye = {}));

var Ae;

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
})(Ae || (Ae = {}));

const Ue = PrimitiveLiteralExpression.$false;

const Ce = PrimitiveLiteralExpression.$true;

const Oe = PrimitiveLiteralExpression.$null;

const Se = PrimitiveLiteralExpression.$undefined;

const xe = AccessThisExpression.$this;

const Be = AccessThisExpression.$parent;

var ke;

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
})(ke || (ke = {}));

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

const Le = new ParserState("");

function $e(t, e) {
    Le.ip = t;
    Le.length = t.length;
    Le.index = 0;
    Le.u = t.charCodeAt(0);
    return Te(Le, 0, 61, void 0 === e ? 53 : e);
}

function Te(t, e, r, s) {
    if (284 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (2048 & s) return Ie(t);
        Fe(t);
        if (1048576 & t.m) throw new Error(`AUR0151:${t.ip}`);
    }
    t.U = 448 > r;
    let i;
    if (32768 & t.m) {
        const r = We[63 & t.m];
        Fe(t);
        i = new UnaryExpression(r, Te(t, e, 449, s));
        t.U = false;
    } else {
        t: switch (t.m) {
          case 3078:
            t.U = false;
            do {
                Fe(t);
                e++;
                if (Qe(t, 16393)) {
                    if (16393 === t.m) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.m) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.m) {
                    const t = 511 & e;
                    i = 0 === t ? xe : 1 === t ? Be : new AccessThisExpression(t);
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
            Fe(t);
            break;

          case 3076:
            t.U = false;
            Fe(t);
            i = xe;
            e = 512;
            break;

          case 671751:
            Fe(t);
            i = Te(t, 0, 62, s);
            _e(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = Pe(t, e, s);
            e = 0;
            break;

          case 131080:
            i = je(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.A ]);
            t.U = false;
            Fe(t);
            e = 0;
            break;

          case 540715:
            i = Me(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.A);
            t.U = false;
            Fe(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = We[63 & t.m];
            t.U = false;
            Fe(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (512 & s) return Re(t, i);
        if (449 < r) return i;
        let n = t.A;
        while ((16384 & t.m) > 0) {
            const r = [];
            let o;
            switch (t.m) {
              case 16393:
                t.U = true;
                Fe(t);
                if (0 === (3072 & t.m)) throw new Error(`AUR0153:${t.ip}`);
                n = t.A;
                Fe(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.m) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.U = true;
                Fe(t);
                e = 4096;
                i = new AccessKeyedExpression(i, Te(t, 0, 62, s));
                _e(t, 1835022);
                break;

              case 671751:
                t.U = false;
                Fe(t);
                while (1835019 !== t.m) {
                    r.push(Te(t, 0, 62, s));
                    if (!Qe(t, 1572876)) break;
                }
                _e(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.U = false;
                o = [ t.A ];
                i = new TaggedTemplateExpression(o, o, i);
                Fe(t);
                break;

              case 540715:
                i = Me(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.m) > 0) {
        const n = t.m;
        if ((448 & n) <= r) break;
        Fe(t);
        i = new BinaryExpression(We[63 & n], i, Te(t, e, 448 & n, s));
        t.U = false;
    }
    if (63 < r) return i;
    if (Qe(t, 1572880)) {
        const r = Te(t, e, 62, s);
        _e(t, 1572879);
        i = new ConditionalExpression(i, r, Te(t, e, 62, s));
        t.U = false;
    }
    if (62 < r) return i;
    if (Qe(t, 1048616)) {
        if (!t.U) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, Te(t, e, 62, s));
    }
    if (61 < r) return i;
    while (Qe(t, 1572884)) {
        if (1572864 === t.m) throw new Error(`AUR0159:${t.ip}`);
        const r = t.A;
        Fe(t);
        const n = new Array;
        while (Qe(t, 1572879)) n.push(Te(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (Qe(t, 1572883)) {
        if (1572864 === t.m) throw new Error(`AUR0160:${t.ip}`);
        const r = t.A;
        Fe(t);
        const n = new Array;
        while (Qe(t, 1572879)) n.push(Te(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.m) {
        if (2048 & s) return i;
        if ("of" === t.C) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function Pe(t, e, r) {
    Fe(t);
    const s = new Array;
    while (1835022 !== t.m) if (Qe(t, 1572876)) {
        s.push(Se);
        if (1835022 === t.m) break;
    } else {
        s.push(Te(t, e, 62, ~512 & r));
        if (Qe(t, 1572876)) {
            if (1835022 === t.m) break;
        } else break;
    }
    _e(t, 1835022);
    if (512 & r) return new ArrayBindingPattern(s); else {
        t.U = false;
        return new ArrayLiteralExpression(s);
    }
}

function Re(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.m) throw new Error(`AUR0163:${t.ip}`);
    Fe(t);
    const r = e;
    const s = Te(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function je(t, e) {
    const r = new Array;
    const s = new Array;
    Fe(t);
    while (1835018 !== t.m) {
        r.push(t.A);
        if (12288 & t.m) {
            Fe(t);
            _e(t, 1572879);
            s.push(Te(t, 0, 62, ~512 & e));
        } else if (3072 & t.m) {
            const {u: r, m: i, index: n} = t;
            Fe(t);
            if (Qe(t, 1572879)) s.push(Te(t, 0, 62, ~512 & e)); else {
                t.u = r;
                t.m = i;
                t.index = n;
                s.push(Te(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.m) _e(t, 1572876);
    }
    _e(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(r, s); else {
        t.U = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function Ie(t) {
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
                Fe(t);
                const s = Te(t, 0, 61, 2048);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(me(Ve(t)));
            break;

          default:
            i += String.fromCharCode(t.u);
        }
        Ve(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function Me(t, e, r, s, i) {
    const n = [ t.A ];
    _e(t, 540715);
    const o = [ Te(t, e, 62, r) ];
    while (540714 !== (t.m = He(t))) {
        n.push(t.A);
        _e(t, 540715);
        o.push(Te(t, e, 62, r));
    }
    n.push(t.A);
    t.U = false;
    if (i) {
        Fe(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        Fe(t);
        return new TemplateExpression(n, o);
    }
}

function Fe(t) {
    while (t.index < t.length) {
        t.l = t.index;
        if (null != (t.m = er[t.u](t))) return;
    }
    t.m = 1572864;
}

function Ve(t) {
    return t.u = t.ip.charCodeAt(++t.index);
}

function De(t) {
    while (tr[Ve(t)]) ;
    const e = ze[t.A = t.C];
    return void 0 === e ? 1024 : e;
}

function Ne(t, e) {
    let r = t.u;
    if (false === e) {
        do {
            r = Ve(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.A = parseInt(t.C, 10);
            return 8192;
        }
        r = Ve(t);
        if (t.index >= t.length) {
            t.A = parseInt(t.C.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = Ve(t);
    } while (r <= 57 && r >= 48); else t.u = t.ip.charCodeAt(--t.index);
    t.A = parseFloat(t.C);
    return 8192;
}

function Ke(t) {
    const e = t.u;
    Ve(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.u !== e) if (92 === t.u) {
        s.push(t.ip.slice(i, t.index));
        Ve(t);
        r = me(t.u);
        Ve(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else Ve(t);
    const n = t.ip.slice(i, t.index);
    Ve(t);
    s.push(n);
    const o = s.join("");
    t.A = o;
    return 4096;
}

function qe(t) {
    let e = true;
    let r = "";
    while (96 !== Ve(t)) if (36 === t.u) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.u) r += String.fromCharCode(me(Ve(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.u);
    }
    Ve(t);
    t.A = r;
    if (e) return 540714;
    return 540715;
}

function He(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return qe(t);
}

function Qe(t, e) {
    if (t.m === e) {
        Fe(t);
        return true;
    }
    return false;
}

function _e(t, e) {
    if (t.m === e) Fe(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const We = [ Ue, Ce, Oe, Se, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const ze = Object.create(null);

ze.true = 2049;

ze.null = 2050;

ze.false = 2048;

ze.undefined = 2051;

ze.$this = 3076;

ze.$parent = 3078;

ze.in = 1640799;

ze.instanceof = 1640800;

ze.typeof = 34851;

ze.void = 34852;

ze.of = 1051180;

const Ge = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Ze(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function Je(t) {
    return e => {
        Ve(e);
        return t;
    };
}

const Xe = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

Xe.notMapped = true;

const Ye = new Set;

Ze(null, Ye, Ge.AsciiIdPart, true);

const tr = new Uint8Array(65535);

Ze(tr, null, Ge.IdStart, 1);

Ze(tr, null, Ge.Digit, 1);

const er = new Array(65535);

er.fill(Xe, 0, 65535);

Ze(er, null, Ge.Skip, (t => {
    Ve(t);
    return null;
}));

Ze(er, null, Ge.IdStart, De);

Ze(er, null, Ge.Digit, (t => Ne(t, false)));

er[34] = er[39] = t => Ke(t);

er[96] = t => qe(t);

er[33] = t => {
    if (61 !== Ve(t)) return 32809;
    if (61 !== Ve(t)) return 1638680;
    Ve(t);
    return 1638682;
};

er[61] = t => {
    if (61 !== Ve(t)) return 1048616;
    if (61 !== Ve(t)) return 1638679;
    Ve(t);
    return 1638681;
};

er[38] = t => {
    if (38 !== Ve(t)) return 1572883;
    Ve(t);
    return 1638614;
};

er[124] = t => {
    if (124 !== Ve(t)) return 1572884;
    Ve(t);
    return 1638549;
};

er[46] = t => {
    if (Ve(t) <= 57 && t.u >= 48) return Ne(t, true);
    return 16393;
};

er[60] = t => {
    if (61 !== Ve(t)) return 1638747;
    Ve(t);
    return 1638749;
};

er[62] = t => {
    if (61 !== Ve(t)) return 1638748;
    Ve(t);
    return 1638750;
};

er[37] = Je(1638886);

er[40] = Je(671751);

er[41] = Je(1835019);

er[42] = Je(1638885);

er[43] = Je(623009);

er[44] = Je(1572876);

er[45] = Je(623010);

er[47] = Je(1638887);

er[58] = Je(1572879);

er[63] = Je(1572880);

er[91] = Je(671757);

er[93] = Je(1835022);

er[123] = Je(131080);

er[125] = Je(1835018);

let rr = null;

const sr = [];

let ir = false;

function nr() {
    ir = false;
}

function or() {
    ir = true;
}

function hr() {
    return rr;
}

function ur(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == rr) {
        rr = t;
        sr[0] = rr;
        ir = true;
        return;
    }
    if (rr === t) throw new Error("AUR0207");
    sr.push(rr);
    rr = t;
    ir = true;
}

function cr(t) {
    if (null == t) throw new Error("AUR0208");
    if (rr !== t) throw new Error("AUR0209");
    sr.pop();
    rr = sr.length > 0 ? sr[sr.length - 1] : null;
    ir = null != rr;
}

const ar = Object.freeze({
    get current() {
        return rr;
    },
    get connecting() {
        return ir;
    },
    enter: ur,
    exit: cr,
    pause: nr,
    resume: or
});

const lr = Reflect.get;

const fr = Object.prototype.toString;

const dr = new WeakMap;

function vr(t) {
    switch (fr.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const pr = "__raw__";

function gr(t) {
    return vr(t) ? br(t) : t;
}

function br(t) {
    var e;
    return null !== (e = dr.get(t)) && void 0 !== e ? e : yr(t);
}

function wr(t) {
    var e;
    return null !== (e = t[pr]) && void 0 !== e ? e : t;
}

function mr(t) {
    return vr(t) && t[pr] || t;
}

function Er(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function yr(t) {
    const e = t instanceof Array ? Ur : t instanceof Map || t instanceof Set ? _r : Ar;
    const r = new Proxy(t, e);
    dr.set(t, r);
    return r;
}

const Ar = {
    get(t, e, r) {
        if (e === pr) return t;
        const s = hr();
        if (!ir || Er(e) || null == s) return lr(t, e, r);
        s.observe(t, e);
        return gr(lr(t, e, r));
    }
};

const Ur = {
    get(t, e, r) {
        if (e === pr) return t;
        const s = hr();
        if (!ir || Er(e) || null == s) return lr(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return Cr;

          case "includes":
            return xr;

          case "indexOf":
            return Br;

          case "lastIndexOf":
            return kr;

          case "every":
            return Or;

          case "filter":
            return Sr;

          case "find":
            return $r;

          case "findIndex":
            return Lr;

          case "flat":
            return Tr;

          case "flatMap":
            return Pr;

          case "join":
            return Rr;

          case "push":
            return Ir;

          case "pop":
            return jr;

          case "reduce":
            return Hr;

          case "reduceRight":
            return Qr;

          case "reverse":
            return Dr;

          case "shift":
            return Mr;

          case "unshift":
            return Fr;

          case "slice":
            return qr;

          case "splice":
            return Vr;

          case "some":
            return Nr;

          case "sort":
            return Kr;

          case "keys":
            return ts;

          case "values":
          case Symbol.iterator:
            return es;

          case "entries":
            return rs;
        }
        s.observe(t, e);
        return gr(lr(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = hr()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function Cr(t, e) {
    var r;
    const s = wr(this);
    const i = s.map(((r, s) => mr(t.call(e, gr(r), s, this))));
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return gr(i);
}

function Or(t, e) {
    var r;
    const s = wr(this);
    const i = s.every(((r, s) => t.call(e, gr(r), s, this)));
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Sr(t, e) {
    var r;
    const s = wr(this);
    const i = s.filter(((r, s) => mr(t.call(e, gr(r), s, this))));
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return gr(i);
}

function xr(t) {
    var e;
    const r = wr(this);
    const s = r.includes(mr(t));
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Br(t) {
    var e;
    const r = wr(this);
    const s = r.indexOf(mr(t));
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function kr(t) {
    var e;
    const r = wr(this);
    const s = r.lastIndexOf(mr(t));
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Lr(t, e) {
    var r;
    const s = wr(this);
    const i = s.findIndex(((r, s) => mr(t.call(e, gr(r), s, this))));
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function $r(t, e) {
    var r;
    const s = wr(this);
    const i = s.find(((e, r) => t(gr(e), r, this)), e);
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return gr(i);
}

function Tr() {
    var t;
    const e = wr(this);
    null === (t = hr()) || void 0 === t ? void 0 : t.observeCollection(e);
    return gr(e.flat());
}

function Pr(t, e) {
    var r;
    const s = wr(this);
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return br(s.flatMap(((r, s) => gr(t.call(e, gr(r), s, this)))));
}

function Rr(t) {
    var e;
    const r = wr(this);
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function jr() {
    return gr(wr(this).pop());
}

function Ir(...t) {
    return wr(this).push(...t);
}

function Mr() {
    return gr(wr(this).shift());
}

function Fr(...t) {
    return wr(this).unshift(...t);
}

function Vr(...t) {
    return gr(wr(this).splice(...t));
}

function Dr(...t) {
    var e;
    const r = wr(this);
    const s = r.reverse();
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return gr(s);
}

function Nr(t, e) {
    var r;
    const s = wr(this);
    const i = s.some(((r, s) => mr(t.call(e, gr(r), s, this))));
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Kr(t) {
    var e;
    const r = wr(this);
    const s = r.sort(t);
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return gr(s);
}

function qr(t, e) {
    var r;
    const s = wr(this);
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return br(s.slice(t, e));
}

function Hr(t, e) {
    var r;
    const s = wr(this);
    const i = s.reduce(((e, r, s) => t(e, gr(r), s, this)), e);
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return gr(i);
}

function Qr(t, e) {
    var r;
    const s = wr(this);
    const i = s.reduceRight(((e, r, s) => t(e, gr(r), s, this)), e);
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return gr(i);
}

const _r = {
    get(t, e, r) {
        if (e === pr) return t;
        const s = hr();
        if (!ir || Er(e) || null == s) return lr(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return Xr;

          case "delete":
            return Yr;

          case "forEach":
            return Wr;

          case "add":
            if (t instanceof Set) return Jr;
            break;

          case "get":
            if (t instanceof Map) return Gr;
            break;

          case "set":
            if (t instanceof Map) return Zr;
            break;

          case "has":
            return zr;

          case "keys":
            return ts;

          case "values":
            return es;

          case "entries":
            return rs;

          case Symbol.iterator:
            return t instanceof Map ? rs : es;
        }
        return gr(lr(t, e, r));
    }
};

function Wr(t, e) {
    var r;
    const s = wr(this);
    null === (r = hr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, gr(r), gr(s), this);
    }));
}

function zr(t) {
    var e;
    const r = wr(this);
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(mr(t));
}

function Gr(t) {
    var e;
    const r = wr(this);
    null === (e = hr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return gr(r.get(mr(t)));
}

function Zr(t, e) {
    return gr(wr(this).set(mr(t), mr(e)));
}

function Jr(t) {
    return gr(wr(this).add(mr(t)));
}

function Xr() {
    return gr(wr(this).clear());
}

function Yr(t) {
    return gr(wr(this).delete(mr(t)));
}

function ts() {
    var t;
    const e = wr(this);
    null === (t = hr()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: gr(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function es() {
    var t;
    const e = wr(this);
    null === (t = hr()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: gr(e),
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
    const e = wr(this);
    null === (t = hr()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ gr(e[0]), gr(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const ss = Object.freeze({
    getProxy: br,
    getRaw: wr,
    wrap: gr,
    unwrap: mr,
    rawKey: pr
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
        D(t, e, {
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
        is = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, is, 0);
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
            ur(this);
            return this.v = mr(this.get.call(this.uP ? gr(this.O) : this.O, this));
        } finally {
            this.obs.clear();
            this.R = false;
            cr(this);
        }
    }
}

ge(ComputedObserver);

tt(ComputedObserver);

nt(ComputedObserver);

let is;

const ns = s.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const os = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const hs = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.B = null;
        this.k = 0;
        this.check = () => {
            if (os.disabled) return;
            if (++this.k < os.timeoutsPerCheck) return;
            this.k = 0;
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
        if (os.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.B = this.p.taskQueue.queueTask(this.check, hs);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.B.cancel();
            this.B = null;
        }
    }
}

DirtyChecker.inject = [ l ];

nt(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = 0;
        this.ov = void 0;
        this.L = t;
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
            this.L.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.L.removeProperty(this);
    }
}

tt(DirtyCheckProperty);

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

let us;

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
        us = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, us, this.f);
    }
    start() {
        if (false === this.iO) {
            this.iO = true;
            this.v = this.O[this.K];
            D(this.O, this.K, {
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
            D(this.O, this.K, {
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
        this.HS = N(r);
        const i = t[e];
        this.cb = N(i) ? i : void 0;
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
        us = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, us, this.f);
    }
}

tt(SetterObserver);

tt(SetterNotifier);

nt(SetterObserver);

nt(SetterNotifier);

const cs = new PropertyAccessor;

const as = s.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const ls = s.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
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
        return cs;
    }
    getAccessor() {
        return cs;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.L = t;
        this.$ = e;
        this.T = [];
    }
    addAdapter(t) {
        this.T.push(t);
    }
    getObserver(t, e) {
        var r, s;
        return null !== (s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== s ? s : this.P(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== s) return s;
        if (this.$.handles(t, e, this)) return this.$.getAccessor(t, e, this);
        return cs;
    }
    getArrayObserver(t) {
        return Tt(t);
    }
    getMapObserver(t) {
        return oe(t);
    }
    getSetObserver(t) {
        return Wt(t);
    }
    createObserver(t, e) {
        var r, s, i, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.$.handles(t, e, this)) return this.$.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return Tt(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return oe(t).getLengthObserver(); else if (t instanceof Set) return Wt(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && a(e)) return Tt(t).getIndexObserver(Number(e));
            break;
        }
        let o = vs(t, e);
        if (void 0 === o) {
            let r = ds(t);
            while (null !== r) {
                o = vs(r, e);
                if (void 0 === o) r = ds(r); else break;
            }
        }
        if (void 0 !== o && !V.call(o, "value")) {
            let h = this.j(t, e, o);
            if (null == h) h = null === (n = null !== (s = null === (r = o.get) || void 0 === r ? void 0 : r.getObserver) && void 0 !== s ? s : null === (i = o.set) || void 0 === i ? void 0 : i.getObserver) || void 0 === n ? void 0 : n(t, this);
            return null == h ? o.configurable ? ComputedObserver.create(t, e, o, this, true) : this.L.createProperty(t, e) : h;
        }
        return new SetterObserver(t, e);
    }
    j(t, e, r) {
        if (this.T.length > 0) for (const s of this.T) {
            const i = s.getObserver(t, e, r, this);
            if (null != i) return i;
        }
        return null;
    }
    P(t, e, r) {
        if (true === r.doNotCache) return r;
        if (void 0 === t.$observers) {
            D(t, "$observers", {
                value: {
                    [e]: r
                }
            });
            return r;
        }
        return t.$observers[e] = r;
    }
}

ObserverLocator.inject = [ ns, ls ];

function fs(t) {
    let e;
    if (t instanceof Array) e = Tt(t); else if (t instanceof Map) e = oe(t); else if (t instanceof Set) e = Wt(t);
    return e;
}

const ds = Object.getPrototypeOf;

const vs = Object.getOwnPropertyDescriptor;

const ps = s.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ as ];
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
            ur(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            cr(this);
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

ge(Effect);

function gs(t) {
    if (void 0 === t.$observers) D(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const bs = {};

function ws(t, e, r) {
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
        let h = bs;
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
            const s = ms(this, e, o, h, u);
            null === (r = hr()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            ms(this, e, o, h, u).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return ms(r, e, o, h, u);
        };
        if (n) D(t.prototype, e, r); else return r;
    }
}

function ms(t, e, r, s, i) {
    const n = gs(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === bs ? void 0 : s);
        n[e] = o;
    }
    return o;
}

export { Ee as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, G as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, x as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, U as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, H as BindingMode, BindingObserverRecord, ke as BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, we as Char, z as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, ar as ConnectableSwitcher, CustomExpression, W as DelegationStrategy, DirtyCheckProperty, os as DirtyCheckSettings, T as ExpressionKind, FlushQueue, ForOfStatement, HtmlLiteralExpression, ns as IDirtyChecker, be as IExpressionParser, ls as INodeObserverLocator, ps as IObservation, as as IObserverLocator, A as ISignaler, Interpolation, Q as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, ye as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, ss as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, $ as ValueConverter, ValueConverterDefinition, ValueConverterExpression, m as alias, Pt as applyMutationsToIndices, C as bindingBehavior, X as cloneIndexMap, ge as connectable, Z as copyIndexMap, J as createIndexMap, $t as disableArrayObservation, ne as disableMapObservation, _t as disableSetObservation, Lt as enableArrayObservation, ie as enableMapObservation, Qt as enableSetObservation, fs as getCollectionObserver, Y as isIndexMap, ws as observable, Te as parse, $e as parseExpression, E as registerAliases, tt as subscriberCollection, Rt as synchronizeIndices, B as valueConverter, nt as withFlushQueue };
//# sourceMappingURL=index.js.map
