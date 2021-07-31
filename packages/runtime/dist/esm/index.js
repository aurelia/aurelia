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
        if (null == t) throw new Error(`AUR203:${t}`);
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
        return L.define(t, e);
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
        return new ValueConverterDefinition(e, i(k(e, "name"), r), n(k(e, "aliases"), s.aliases, e.aliases), L.keyFrom(r));
    }
    register(t) {
        const {Type: e, key: s, aliases: i} = this;
        r.singleton(s, e).register(t);
        r.aliasTo(s, e).register(t);
        E(i, L, s, t);
    }
}

const $ = b("value-converter");

const k = (t, e) => d(g(e), t);

const L = Object.freeze({
    name: $,
    keyFrom: t => `${$}:${t}`,
    isType(t) {
        return "function" === typeof t && v($, t);
    },
    define(t, e) {
        const r = ValueConverterDefinition.create(t, e);
        p($, r, r.Type);
        p($, r, r);
        w(e, $);
        return r.Type;
    },
    getDefinition(t) {
        const e = d($, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, r) {
        p(g(e), r, t);
    },
    getAnnotation: k
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
        this.converterKey = L.keyFrom(e);
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

function N(t, e, r) {
    D(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function K(t, e, r, s = false) {
    if (s || !V.call(t, e)) N(t, e, r);
}

var q;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(q || (q = {}));

var H;

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
})(H || (H = {}));

var Q;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(Q || (Q = {}));

var _;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(_ || (_ = {}));

var W;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(W || (W = {}));

var z;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(z || (z = {}));

function G(t, e) {
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

function Z(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function J(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function X(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function Y(t) {
    return null == t ? tt : tt(t);
}

function tt(t) {
    const e = t.prototype;
    D(e, "subs", {
        get: et
    });
    K(e, "subscribe", rt);
    K(e, "unsubscribe", st);
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

function et() {
    return N(this, "subs", new SubscriberRecord);
}

function rt(t) {
    return this.subs.add(t);
}

function st(t) {
    return this.subs.remove(t);
}

function it(t) {
    return null == t ? nt : nt(t);
}

function nt(t) {
    const e = t.prototype;
    D(e, "queue", {
        get: ot
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
        let r;
        try {
            for (r of e) {
                e.delete(r);
                r.flush();
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

function ot() {
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
    setValue(t, e) {
        const r = this.value;
        if (t !== r && a(t)) {
            if (0 === (256 & e)) this.obj.length = t;
            this.value = t;
            this.oldvalue = r;
            this.f = e;
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
        at = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, at, this.f);
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
        const r = this.value;
        const s = this.obj.size;
        if ((this.value = s) !== r) {
            this.oldvalue = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        at = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, at, this.f);
    }
}

function ht(t) {
    const e = t.prototype;
    K(e, "subscribe", ut, true);
    K(e, "unsubscribe", ct, true);
    it(t);
    Y(t);
}

function ut(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function ct(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

ht(CollectionLengthObserver);

ht(CollectionSizeObserver);

let at;

const lt = new WeakMap;

function ft(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function dt(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function vt(t, e, r, s, i) {
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

function pt(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, u, c;
    let a, l, f;
    let d, v, p;
    let g, b;
    let w, m, E, y;
    let A, U, C, O;
    while (true) {
        if (s - r <= 10) {
            vt(t, e, r, s, i);
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
            pt(t, e, y, s, i);
            s = E;
        } else {
            pt(t, e, r, E, i);
            r = y;
        }
    }
}

const gt = Array.prototype;

const bt = gt.push;

const wt = gt.unshift;

const mt = gt.pop;

const Et = gt.shift;

const yt = gt.splice;

const At = gt.reverse;

const Ut = gt.sort;

const Ct = {
    push: bt,
    unshift: wt,
    pop: mt,
    shift: Et,
    splice: yt,
    reverse: At,
    sort: Ut
};

const Ot = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const St = {
    push: function(...t) {
        const e = lt.get(this);
        if (void 0 === e) return bt.apply(this, t);
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
        const e = lt.get(this);
        if (void 0 === e) return wt.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        wt.apply(e.indexMap, s);
        const n = wt.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = lt.get(this);
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
        const t = lt.get(this);
        if (void 0 === t) return Et.call(this);
        const e = t.indexMap;
        const r = Et.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        Et.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = lt.get(this);
        if (void 0 === s) return yt.apply(this, t);
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
            yt.call(h, e, r, ...s);
        } else yt.apply(h, t);
        const a = yt.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = lt.get(this);
        if (void 0 === t) {
            At.call(this);
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
        const e = lt.get(this);
        if (void 0 === e) {
            Ut.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        pt(this, e.indexMap, 0, r, dt);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || "function" !== typeof t) t = ft;
        pt(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of Ot) D(St[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let xt = false;

function Bt() {
    for (const t of Ot) if (true !== gt[t].observing) N(gt, t, St[t]);
}

function $t() {
    for (const t of Ot) if (true === gt[t].observing) N(gt, t, Ct[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!xt) {
            xt = true;
            Bt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = Z(t.length);
        this.lenObs = void 0;
        lt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = Z(e);
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

Y(ArrayObserver);

Y(ArrayIndexObserver);

function kt(t) {
    let e = lt.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function Lt(t) {
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

function Tt(t, e) {
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

const Pt = new WeakMap;

const Rt = Set.prototype;

const jt = Rt.add;

const It = Rt.clear;

const Mt = Rt.delete;

const Ft = {
    add: jt,
    clear: It,
    delete: Mt
};

const Vt = [ "add", "clear", "delete" ];

const Dt = {
    add: function(t) {
        const e = Pt.get(this);
        if (void 0 === e) {
            jt.call(this, t);
            return this;
        }
        const r = this.size;
        jt.call(this, t);
        const s = this.size;
        if (s === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = Pt.get(this);
        if (void 0 === t) return It.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            It.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Pt.get(this);
        if (void 0 === e) return Mt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Mt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const Nt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Vt) D(Dt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Kt = false;

function qt() {
    for (const t of Vt) if (true !== Rt[t].observing) D(Rt, t, {
        ...Nt,
        value: Dt[t]
    });
}

function Ht() {
    for (const t of Vt) if (true === Rt[t].observing) D(Rt, t, {
        ...Nt,
        value: Ft[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Kt) {
            Kt = true;
            qt();
        }
        this.collection = t;
        this.indexMap = Z(t.size);
        this.lenObs = void 0;
        Pt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = Z(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

Y(SetObserver);

function Qt(t) {
    let e = Pt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const _t = new WeakMap;

const Wt = Map.prototype;

const zt = Wt.set;

const Gt = Wt.clear;

const Zt = Wt.delete;

const Jt = {
    set: zt,
    clear: Gt,
    delete: Zt
};

const Xt = [ "set", "clear", "delete" ];

const Yt = {
    set: function(t, e) {
        const r = _t.get(this);
        if (void 0 === r) {
            zt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        zt.call(this, t, e);
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
        const t = _t.get(this);
        if (void 0 === t) return Gt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Gt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = _t.get(this);
        if (void 0 === e) return Zt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Zt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const te = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Xt) D(Yt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let ee = false;

function re() {
    for (const t of Xt) if (true !== Wt[t].observing) D(Wt, t, {
        ...te,
        value: Yt[t]
    });
}

function se() {
    for (const t of Xt) if (true === Wt[t].observing) D(Wt, t, {
        ...te,
        value: Jt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!ee) {
            ee = true;
            re();
        }
        this.collection = t;
        this.indexMap = Z(t.size);
        this.lenObs = void 0;
        _t.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = Z(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

Y(MapObserver);

function ie(t) {
    let e = _t.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function ne(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function oe() {
    return N(this, "obs", new BindingObserverRecord(this));
}

function he(t) {
    let e;
    if (t instanceof Array) e = kt(t); else if (t instanceof Set) e = Qt(t); else if (t instanceof Map) e = ie(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function ue(t) {
    this.obs.add(t);
}

function ce() {
    throw new Error(`AUR2011:handleChange`);
}

function ae() {
    throw new Error("AUR2012:handleCollectionChange");
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

function le(t) {
    const e = t.prototype;
    K(e, "observe", ne, true);
    K(e, "observeCollection", he, true);
    K(e, "subscribeTo", ue, true);
    D(e, "obs", {
        get: oe
    });
    K(e, "handleChange", ce);
    K(e, "handleCollectionChange", ae);
    return t;
}

function fe(t) {
    return null == t ? le : le(t);
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

le(BindingMediator);

const de = s.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

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
        Se.ip = t;
        Se.length = t.length;
        Se.index = 0;
        Se.o = t.charCodeAt(0);
        return Be(Se, 0, 61, void 0 === e ? 53 : e);
    }
}

var ve;

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
})(ve || (ve = {}));

function pe(t) {
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

var ge;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(ge || (ge = {}));

var be;

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
})(be || (be = {}));

var we;

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
})(we || (we = {}));

const me = PrimitiveLiteralExpression.$false;

const Ee = PrimitiveLiteralExpression.$true;

const ye = PrimitiveLiteralExpression.$null;

const Ae = PrimitiveLiteralExpression.$undefined;

const Ue = AccessThisExpression.$this;

const Ce = AccessThisExpression.$parent;

var Oe;

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
})(Oe || (Oe = {}));

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

const Se = new ParserState("");

function xe(t, e) {
    Se.ip = t;
    Se.length = t.length;
    Se.index = 0;
    Se.o = t.charCodeAt(0);
    return Be(Se, 0, 61, void 0 === e ? 53 : e);
}

function Be(t, e, r, s) {
    if (284 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (2048 & s) return Te(t);
        Re(t);
        if (1048576 & t.l) throw new Error(`AUR0151:${t.ip}`);
    }
    t.m = 448 > r;
    let i;
    if (32768 & t.l) {
        const r = qe[63 & t.l];
        Re(t);
        i = new UnaryExpression(r, Be(t, e, 449, s));
        t.m = false;
    } else {
        t: switch (t.l) {
          case 3078:
            t.m = false;
            do {
                Re(t);
                e++;
                if (Ne(t, 16393)) {
                    if (16393 === t.l) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.l) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.l) {
                    const t = 511 & e;
                    i = 0 === t ? Ue : 1 === t ? Ce : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`AUR0154:${t.ip}`);
            } while (3078 === t.l);

          case 1024:
            if (512 & s) i = new BindingIdentifier(t.g); else {
                i = new AccessScopeExpression(t.g, 511 & e);
                e = 1024;
            }
            t.m = true;
            Re(t);
            break;

          case 3076:
            t.m = false;
            Re(t);
            i = Ue;
            e = 512;
            break;

          case 671751:
            Re(t);
            i = Be(t, 0, 62, s);
            Ke(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = $e(t, e, s);
            e = 0;
            break;

          case 131080:
            i = Le(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.g ]);
            t.m = false;
            Re(t);
            e = 0;
            break;

          case 540715:
            i = Pe(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.g);
            t.m = false;
            Re(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = qe[63 & t.l];
            t.m = false;
            Re(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (512 & s) return ke(t, i);
        if (449 < r) return i;
        let n = t.g;
        while ((16384 & t.l) > 0) {
            const r = [];
            let o;
            switch (t.l) {
              case 16393:
                t.m = true;
                Re(t);
                if (0 === (3072 & t.l)) throw new Error(`AUR0153:${t.ip}`);
                n = t.g;
                Re(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.l) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.m = true;
                Re(t);
                e = 4096;
                i = new AccessKeyedExpression(i, Be(t, 0, 62, s));
                Ke(t, 1835022);
                break;

              case 671751:
                t.m = false;
                Re(t);
                while (1835019 !== t.l) {
                    r.push(Be(t, 0, 62, s));
                    if (!Ne(t, 1572876)) break;
                }
                Ke(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.m = false;
                o = [ t.g ];
                i = new TaggedTemplateExpression(o, o, i);
                Re(t);
                break;

              case 540715:
                i = Pe(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.l) > 0) {
        const n = t.l;
        if ((448 & n) <= r) break;
        Re(t);
        i = new BinaryExpression(qe[63 & n], i, Be(t, e, 448 & n, s));
        t.m = false;
    }
    if (63 < r) return i;
    if (Ne(t, 1572880)) {
        const r = Be(t, e, 62, s);
        Ke(t, 1572879);
        i = new ConditionalExpression(i, r, Be(t, e, 62, s));
        t.m = false;
    }
    if (62 < r) return i;
    if (Ne(t, 1048616)) {
        if (!t.m) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, Be(t, e, 62, s));
    }
    if (61 < r) return i;
    while (Ne(t, 1572884)) {
        if (1572864 === t.l) throw new Error(`AUR0159:${t.ip}`);
        const r = t.g;
        Re(t);
        const n = new Array;
        while (Ne(t, 1572879)) n.push(Be(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (Ne(t, 1572883)) {
        if (1572864 === t.l) throw new Error(`AUR0160:${t.ip}`);
        const r = t.g;
        Re(t);
        const n = new Array;
        while (Ne(t, 1572879)) n.push(Be(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.l) {
        if (2048 & s) return i;
        if ("of" === t.A) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function $e(t, e, r) {
    Re(t);
    const s = new Array;
    while (1835022 !== t.l) if (Ne(t, 1572876)) {
        s.push(Ae);
        if (1835022 === t.l) break;
    } else {
        s.push(Be(t, e, 62, ~512 & r));
        if (Ne(t, 1572876)) {
            if (1835022 === t.l) break;
        } else break;
    }
    Ke(t, 1835022);
    if (512 & r) return new ArrayBindingPattern(s); else {
        t.m = false;
        return new ArrayLiteralExpression(s);
    }
}

function ke(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.l) throw new Error(`AUR0163:${t.ip}`);
    Re(t);
    const r = e;
    const s = Be(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function Le(t, e) {
    const r = new Array;
    const s = new Array;
    Re(t);
    while (1835018 !== t.l) {
        r.push(t.g);
        if (12288 & t.l) {
            Re(t);
            Ke(t, 1572879);
            s.push(Be(t, 0, 62, ~512 & e));
        } else if (3072 & t.l) {
            const {o: r, l: i, index: n} = t;
            Re(t);
            if (Ne(t, 1572879)) s.push(Be(t, 0, 62, ~512 & e)); else {
                t.o = r;
                t.l = i;
                t.index = n;
                s.push(Be(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.l) Ke(t, 1572876);
    }
    Ke(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(r, s); else {
        t.m = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function Te(t) {
    const e = [];
    const r = [];
    const s = t.length;
    let i = "";
    while (t.index < s) {
        switch (t.o) {
          case 36:
            if (123 === t.ip.charCodeAt(t.index + 1)) {
                e.push(i);
                i = "";
                t.index += 2;
                t.o = t.ip.charCodeAt(t.index);
                Re(t);
                const s = Be(t, 0, 61, 2048);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(pe(je(t)));
            break;

          default:
            i += String.fromCharCode(t.o);
        }
        je(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function Pe(t, e, r, s, i) {
    const n = [ t.g ];
    Ke(t, 540715);
    const o = [ Be(t, e, 62, r) ];
    while (540714 !== (t.l = De(t))) {
        n.push(t.g);
        Ke(t, 540715);
        o.push(Be(t, e, 62, r));
    }
    n.push(t.g);
    t.m = false;
    if (i) {
        Re(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        Re(t);
        return new TemplateExpression(n, o);
    }
}

function Re(t) {
    while (t.index < t.length) {
        t.h = t.index;
        if (null != (t.l = Je[t.o](t))) return;
    }
    t.l = 1572864;
}

function je(t) {
    return t.o = t.ip.charCodeAt(++t.index);
}

function Ie(t) {
    while (Ze[je(t)]) ;
    const e = He[t.g = t.A];
    return void 0 === e ? 1024 : e;
}

function Me(t, e) {
    let r = t.o;
    if (false === e) {
        do {
            r = je(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.g = parseInt(t.A, 10);
            return 8192;
        }
        r = je(t);
        if (t.index >= t.length) {
            t.g = parseInt(t.A.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = je(t);
    } while (r <= 57 && r >= 48); else t.o = t.ip.charCodeAt(--t.index);
    t.g = parseFloat(t.A);
    return 8192;
}

function Fe(t) {
    const e = t.o;
    je(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.o !== e) if (92 === t.o) {
        s.push(t.ip.slice(i, t.index));
        je(t);
        r = pe(t.o);
        je(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else je(t);
    const n = t.ip.slice(i, t.index);
    je(t);
    s.push(n);
    const o = s.join("");
    t.g = o;
    return 4096;
}

function Ve(t) {
    let e = true;
    let r = "";
    while (96 !== je(t)) if (36 === t.o) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.o) r += String.fromCharCode(pe(je(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.o);
    }
    je(t);
    t.g = r;
    if (e) return 540714;
    return 540715;
}

function De(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return Ve(t);
}

function Ne(t, e) {
    if (t.l === e) {
        Re(t);
        return true;
    }
    return false;
}

function Ke(t, e) {
    if (t.l === e) Re(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const qe = [ me, Ee, ye, Ae, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const He = Object.create(null);

He.true = 2049;

He.null = 2050;

He.false = 2048;

He.undefined = 2051;

He.$this = 3076;

He.$parent = 3078;

He.in = 1640799;

He.instanceof = 1640800;

He.typeof = 34851;

He.void = 34852;

He.of = 1051180;

const Qe = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function _e(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function We(t) {
    return e => {
        je(e);
        return t;
    };
}

const ze = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

ze.notMapped = true;

const Ge = new Set;

_e(null, Ge, Qe.AsciiIdPart, true);

const Ze = new Uint8Array(65535);

_e(Ze, null, Qe.IdStart, 1);

_e(Ze, null, Qe.Digit, 1);

const Je = new Array(65535);

Je.fill(ze, 0, 65535);

_e(Je, null, Qe.Skip, (t => {
    je(t);
    return null;
}));

_e(Je, null, Qe.IdStart, Ie);

_e(Je, null, Qe.Digit, (t => Me(t, false)));

Je[34] = Je[39] = t => Fe(t);

Je[96] = t => Ve(t);

Je[33] = t => {
    if (61 !== je(t)) return 32809;
    if (61 !== je(t)) return 1638680;
    je(t);
    return 1638682;
};

Je[61] = t => {
    if (61 !== je(t)) return 1048616;
    if (61 !== je(t)) return 1638679;
    je(t);
    return 1638681;
};

Je[38] = t => {
    if (38 !== je(t)) return 1572883;
    je(t);
    return 1638614;
};

Je[124] = t => {
    if (124 !== je(t)) return 1572884;
    je(t);
    return 1638549;
};

Je[46] = t => {
    if (je(t) <= 57 && t.o >= 48) return Me(t, true);
    return 16393;
};

Je[60] = t => {
    if (61 !== je(t)) return 1638747;
    je(t);
    return 1638749;
};

Je[62] = t => {
    if (61 !== je(t)) return 1638748;
    je(t);
    return 1638750;
};

Je[37] = We(1638886);

Je[40] = We(671751);

Je[41] = We(1835019);

Je[42] = We(1638885);

Je[43] = We(623009);

Je[44] = We(1572876);

Je[45] = We(623010);

Je[47] = We(1638887);

Je[58] = We(1572879);

Je[63] = We(1572880);

Je[91] = We(671757);

Je[93] = We(1835022);

Je[123] = We(131080);

Je[125] = We(1835018);

let Xe = null;

const Ye = [];

let tr = false;

function er() {
    tr = false;
}

function rr() {
    tr = true;
}

function sr() {
    return Xe;
}

function ir(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == Xe) {
        Xe = t;
        Ye[0] = Xe;
        tr = true;
        return;
    }
    if (Xe === t) throw new Error("AUR0207");
    Ye.push(Xe);
    Xe = t;
    tr = true;
}

function nr(t) {
    if (null == t) throw new Error("AUR0208");
    if (Xe !== t) throw new Error("AUR0209");
    Ye.pop();
    Xe = Ye.length > 0 ? Ye[Ye.length - 1] : null;
    tr = null != Xe;
}

const or = Object.freeze({
    get current() {
        return Xe;
    },
    get connecting() {
        return tr;
    },
    enter: ir,
    exit: nr,
    pause: er,
    resume: rr
});

const hr = Reflect.get;

const ur = Object.prototype.toString;

const cr = new WeakMap;

function ar(t) {
    switch (ur.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const lr = "__raw__";

function fr(t) {
    return ar(t) ? dr(t) : t;
}

function dr(t) {
    var e;
    return null !== (e = cr.get(t)) && void 0 !== e ? e : br(t);
}

function vr(t) {
    var e;
    return null !== (e = t[lr]) && void 0 !== e ? e : t;
}

function pr(t) {
    return ar(t) && t[lr] || t;
}

function gr(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function br(t) {
    const e = t instanceof Array ? mr : t instanceof Map || t instanceof Set ? Kr : wr;
    const r = new Proxy(t, e);
    cr.set(t, r);
    return r;
}

const wr = {
    get(t, e, r) {
        if (e === lr) return t;
        const s = sr();
        if (!tr || gr(e) || null == s) return hr(t, e, r);
        s.observe(t, e);
        return fr(hr(t, e, r));
    }
};

const mr = {
    get(t, e, r) {
        if (e === lr) return t;
        const s = sr();
        if (!tr || gr(e) || null == s) return hr(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return Er;

          case "includes":
            return Ur;

          case "indexOf":
            return Cr;

          case "lastIndexOf":
            return Or;

          case "every":
            return yr;

          case "filter":
            return Ar;

          case "find":
            return xr;

          case "findIndex":
            return Sr;

          case "flat":
            return Br;

          case "flatMap":
            return $r;

          case "join":
            return kr;

          case "push":
            return Tr;

          case "pop":
            return Lr;

          case "reduce":
            return Dr;

          case "reduceRight":
            return Nr;

          case "reverse":
            return Ir;

          case "shift":
            return Pr;

          case "unshift":
            return Rr;

          case "slice":
            return Vr;

          case "splice":
            return jr;

          case "some":
            return Mr;

          case "sort":
            return Fr;

          case "keys":
            return Zr;

          case "values":
          case Symbol.iterator:
            return Jr;

          case "entries":
            return Xr;
        }
        s.observe(t, e);
        return fr(hr(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = sr()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function Er(t, e) {
    var r;
    const s = vr(this);
    const i = s.map(((r, s) => pr(t.call(e, fr(r), s, this))));
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return fr(i);
}

function yr(t, e) {
    var r;
    const s = vr(this);
    const i = s.every(((r, s) => t.call(e, fr(r), s, this)));
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Ar(t, e) {
    var r;
    const s = vr(this);
    const i = s.filter(((r, s) => pr(t.call(e, fr(r), s, this))));
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return fr(i);
}

function Ur(t) {
    var e;
    const r = vr(this);
    const s = r.includes(pr(t));
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Cr(t) {
    var e;
    const r = vr(this);
    const s = r.indexOf(pr(t));
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Or(t) {
    var e;
    const r = vr(this);
    const s = r.lastIndexOf(pr(t));
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function Sr(t, e) {
    var r;
    const s = vr(this);
    const i = s.findIndex(((r, s) => pr(t.call(e, fr(r), s, this))));
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function xr(t, e) {
    var r;
    const s = vr(this);
    const i = s.find(((e, r) => t(fr(e), r, this)), e);
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return fr(i);
}

function Br() {
    var t;
    const e = vr(this);
    null === (t = sr()) || void 0 === t ? void 0 : t.observeCollection(e);
    return fr(e.flat());
}

function $r(t, e) {
    var r;
    const s = vr(this);
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return dr(s.flatMap(((r, s) => fr(t.call(e, fr(r), s, this)))));
}

function kr(t) {
    var e;
    const r = vr(this);
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function Lr() {
    return fr(vr(this).pop());
}

function Tr(...t) {
    return vr(this).push(...t);
}

function Pr() {
    return fr(vr(this).shift());
}

function Rr(...t) {
    return vr(this).unshift(...t);
}

function jr(...t) {
    return fr(vr(this).splice(...t));
}

function Ir(...t) {
    var e;
    const r = vr(this);
    const s = r.reverse();
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return fr(s);
}

function Mr(t, e) {
    var r;
    const s = vr(this);
    const i = s.some(((r, s) => pr(t.call(e, fr(r), s, this))));
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function Fr(t) {
    var e;
    const r = vr(this);
    const s = r.sort(t);
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return fr(s);
}

function Vr(t, e) {
    var r;
    const s = vr(this);
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return dr(s.slice(t, e));
}

function Dr(t, e) {
    var r;
    const s = vr(this);
    const i = s.reduce(((e, r, s) => t(e, fr(r), s, this)), e);
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return fr(i);
}

function Nr(t, e) {
    var r;
    const s = vr(this);
    const i = s.reduceRight(((e, r, s) => t(e, fr(r), s, this)), e);
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return fr(i);
}

const Kr = {
    get(t, e, r) {
        if (e === lr) return t;
        const s = sr();
        if (!tr || gr(e) || null == s) return hr(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return zr;

          case "delete":
            return Gr;

          case "forEach":
            return qr;

          case "add":
            if (t instanceof Set) return Wr;
            break;

          case "get":
            if (t instanceof Map) return Qr;
            break;

          case "set":
            if (t instanceof Map) return _r;
            break;

          case "has":
            return Hr;

          case "keys":
            return Zr;

          case "values":
            return Jr;

          case "entries":
            return Xr;

          case Symbol.iterator:
            return t instanceof Map ? Xr : Jr;
        }
        return fr(hr(t, e, r));
    }
};

function qr(t, e) {
    var r;
    const s = vr(this);
    null === (r = sr()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, fr(r), fr(s), this);
    }));
}

function Hr(t) {
    var e;
    const r = vr(this);
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(pr(t));
}

function Qr(t) {
    var e;
    const r = vr(this);
    null === (e = sr()) || void 0 === e ? void 0 : e.observeCollection(r);
    return fr(r.get(pr(t)));
}

function _r(t, e) {
    return fr(vr(this).set(pr(t), pr(e)));
}

function Wr(t) {
    return fr(vr(this).add(pr(t)));
}

function zr() {
    return fr(vr(this).clear());
}

function Gr(t) {
    return fr(vr(this).delete(pr(t)));
}

function Zr() {
    var t;
    const e = vr(this);
    null === (t = sr()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: fr(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Jr() {
    var t;
    const e = vr(this);
    null === (t = sr()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: fr(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Xr() {
    var t;
    const e = vr(this);
    null === (t = sr()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ fr(e[0]), fr(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const Yr = Object.freeze({
    getProxy: dr,
    getRaw: vr,
    wrap: fr,
    unwrap: pr,
    rawKey: lr
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
        this.U = void 0;
        this.running = false;
        this.C = false;
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
        if (0 === this.subs.count) return this.get.call(this.obj, this);
        if (this.C) {
            this.compute();
            this.C = false;
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
        this.C = true;
        if (this.subs.count > 0) this.run();
    }
    handleCollectionChange() {
        this.C = true;
        if (this.subs.count > 0) this.run();
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.compute();
            this.C = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.C = true;
            this.obs.clear(true);
        }
    }
    flush() {
        ts = this.U;
        this.U = this.value;
        this.subs.notify(this.value, ts, 0);
    }
    run() {
        if (this.running) return;
        const t = this.value;
        const e = this.compute();
        this.C = false;
        if (!Object.is(e, t)) {
            this.U = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            ir(this);
            return this.value = pr(this.get.call(this.useProxy ? fr(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            nr(this);
        }
    }
}

fe(ComputedObserver);

Y(ComputedObserver);

it(ComputedObserver);

let ts;

const es = s.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const rs = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const ss = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.O = null;
        this.S = 0;
        this.check = () => {
            if (rs.disabled) return;
            if (++this.S < rs.timeoutsPerCheck) return;
            this.S = 0;
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
        if (rs.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.O = this.p.taskQueue.queueTask(this.check, ss);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.O.cancel();
            this.O = null;
        }
    }
}

DirtyChecker.inject = [ l ];

it(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
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

Y(DirtyCheckProperty);

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

let is;

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
        is = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, is, this.f);
    }
    start() {
        if (false === this.observing) {
            this.observing = true;
            this.value = this.obj[this.propertyKey];
            D(this.obj, this.propertyKey, {
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
            D(this.obj, this.propertyKey, {
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
        is = this.oV;
        this.oV = this.v;
        this.subs.notify(this.v, is, this.f);
    }
}

Y(SetterObserver);

Y(SetterNotifier);

it(SetterObserver);

it(SetterNotifier);

const ns = new PropertyAccessor;

const os = s.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const hs = s.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
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
        return ns;
    }
    getAccessor() {
        return ns;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.B = t;
        this.$ = e;
        this.k = [];
    }
    addAdapter(t) {
        this.k.push(t);
    }
    getObserver(t, e) {
        var r, s;
        return null !== (s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== s ? s : this.L(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const s = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== s) return s;
        if (this.$.handles(t, e, this)) return this.$.getAccessor(t, e, this);
        return ns;
    }
    getArrayObserver(t) {
        return kt(t);
    }
    getMapObserver(t) {
        return ie(t);
    }
    getSetObserver(t) {
        return Qt(t);
    }
    createObserver(t, e) {
        var r, s, i, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.$.handles(t, e, this)) return this.$.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return kt(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return ie(t).getLengthObserver(); else if (t instanceof Set) return Qt(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && a(e)) return kt(t).getIndexObserver(Number(e));
            break;
        }
        let o = as(t, e);
        if (void 0 === o) {
            let r = cs(t);
            while (null !== r) {
                o = as(r, e);
                if (void 0 === o) r = cs(r); else break;
            }
        }
        if (void 0 !== o && !V.call(o, "value")) {
            let h = this.T(t, e, o);
            if (null == h) h = null === (n = null !== (s = null === (r = o.get) || void 0 === r ? void 0 : r.getObserver) && void 0 !== s ? s : null === (i = o.set) || void 0 === i ? void 0 : i.getObserver) || void 0 === n ? void 0 : n(t, this);
            return null == h ? o.configurable ? ComputedObserver.create(t, e, o, this, true) : this.B.createProperty(t, e) : h;
        }
        return new SetterObserver(t, e);
    }
    T(t, e, r) {
        if (this.k.length > 0) for (const s of this.k) {
            const i = s.getObserver(t, e, r, this);
            if (null != i) return i;
        }
        return null;
    }
    L(t, e, r) {
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

ObserverLocator.inject = [ es, hs ];

function us(t) {
    let e;
    if (t instanceof Array) e = kt(t); else if (t instanceof Map) e = ie(t); else if (t instanceof Set) e = Qt(t);
    return e;
}

const cs = Object.getPrototypeOf;

const as = Object.getOwnPropertyDescriptor;

const ls = s.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ os ];
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
            ir(this);
            this.fn(this);
        } finally {
            this.obs.clear(false);
            this.running = false;
            nr(this);
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

fe(Effect);

function fs(t) {
    if (void 0 === t.$observers) D(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const ds = {};

function vs(t, e, r) {
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
        let h = ds;
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
            const s = ps(this, e, o, h, u);
            null === (r = sr()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            ps(this, e, o, h, u).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return ps(r, e, o, h, u);
        };
        if (n) D(t.prototype, e, r); else return r;
    }
}

function ps(t, e, r, s, i) {
    const n = fs(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === ds ? void 0 : s);
        n[e] = o;
    }
    return o;
}

export { ge as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, z as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, x as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, U as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, q as BindingMode, BindingObserverRecord, Oe as BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, ve as Char, W as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, or as ConnectableSwitcher, CustomExpression, _ as DelegationStrategy, DirtyCheckProperty, rs as DirtyCheckSettings, T as ExpressionKind, FlushQueue, ForOfStatement, HtmlLiteralExpression, es as IDirtyChecker, de as IExpressionParser, hs as INodeObserverLocator, ls as IObservation, os as IObserverLocator, A as ISignaler, Interpolation, H as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, be as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Yr as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, L as ValueConverter, ValueConverterDefinition, ValueConverterExpression, m as alias, Lt as applyMutationsToIndices, C as bindingBehavior, J as cloneIndexMap, fe as connectable, G as copyIndexMap, Z as createIndexMap, $t as disableArrayObservation, se as disableMapObservation, Ht as disableSetObservation, Bt as enableArrayObservation, re as enableMapObservation, qt as enableSetObservation, us as getCollectionObserver, X as isIndexMap, vs as observable, Be as parse, xe as parseExpression, E as registerAliases, Y as subscriberCollection, Tt as synchronizeIndices, B as valueConverter, it as withFlushQueue };
//# sourceMappingURL=index.js.map
