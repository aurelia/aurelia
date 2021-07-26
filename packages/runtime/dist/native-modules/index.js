import { Protocol as t, Metadata as e, Registration as r, DI as s, firstDefined as i, mergeArrays as n, fromAnnotationOrDefinitionOrTypeOrDefault as o, isNumberOrBigInt as h, isStringOrDate as u, emptyArray as c, isArrayIndex as a, IPlatform as l, ILogger as f } from "../../../kernel/dist/native-modules/index.js";

export { IPlatform } from "../../../kernel/dist/native-modules/index.js";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "../../../platform/dist/native-modules/index.js";

function d(...r) {
    return function(s) {
        const i = t.annotation.keyFor("aliases");
        const n = e.getOwn(i, s);
        if (void 0 === n) e.define(i, r, s); else n.push(...r);
    };
}

function v(t, e, s, i) {
    for (let n = 0, o = t.length; n < o; ++n) r.aliasTo(s, e.keyFrom(t[n])).register(i);
}

const p = Object.freeze({});

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
        if (16 & s) return p;
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

const g = s.createInterface("ISignaler", (t => t.singleton(Signaler)));

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

var b;

(function(t) {
    t[t["singleton"] = 1] = "singleton";
    t[t["interceptor"] = 2] = "interceptor";
})(b || (b = {}));

function w(t) {
    return function(e) {
        return E.define(t, e);
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
        const u = E.getAnnotation;
        return new BindingBehaviorDefinition(e, i(u(e, "name"), r), n(u(e, "aliases"), s.aliases, e.aliases), E.keyFrom(r), o("strategy", s, e, (() => h ? 2 : 1)));
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
        v(i, E, s, t);
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

const m = t.resource.keyFor("binding-behavior");

const E = Object.freeze({
    name: m,
    keyFrom(t) {
        return `${m}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && e.hasOwn(m, t);
    },
    define(r, s) {
        const i = BindingBehaviorDefinition.create(r, s);
        e.define(m, i, i.Type);
        e.define(m, i, i);
        t.resource.appendTo(s, m);
        return i.Type;
    },
    getDefinition(t) {
        const r = e.getOwn(m, t);
        if (void 0 === r) throw new Error(`AUR0151:${t.name}`);
        return r;
    },
    annotate(r, s, i) {
        e.define(t.annotation.keyFor(s), i, r);
    },
    getAnnotation(r, s) {
        return e.getOwn(t.annotation.keyFor(s), r);
    }
});

function y(t) {
    return function(e) {
        return U.define(t, e);
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
        const o = U.getAnnotation;
        return new ValueConverterDefinition(e, i(o(e, "name"), r), n(o(e, "aliases"), s.aliases, e.aliases), U.keyFrom(r));
    }
    register(t) {
        const {Type: e, key: s, aliases: i} = this;
        r.singleton(s, e).register(t);
        r.aliasTo(s, e).register(t);
        v(i, U, s, t);
    }
}

const A = t.resource.keyFor("value-converter");

const U = Object.freeze({
    name: A,
    keyFrom(t) {
        return `${A}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && e.hasOwn(A, t);
    },
    define(r, s) {
        const i = ValueConverterDefinition.create(r, s);
        e.define(A, i, i.Type);
        e.define(A, i, i);
        t.resource.appendTo(s, A);
        return i.Type;
    },
    getDefinition(t) {
        const r = e.getOwn(A, t);
        if (void 0 === r) throw new Error(`AUR0152:${t.name}`);
        return r;
    },
    annotate(r, s, i) {
        e.define(t.annotation.keyFor(s), i, r);
    },
    getAnnotation(r, s) {
        return e.getOwn(t.annotation.keyFor(s), r);
    }
});

var C;

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
})(C || (C = {}));

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
        this.behaviorKey = E.keyFrom(e);
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
        this.converterKey = U.keyFrom(e);
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
                const e = r.get(g);
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
        const i = r.locator.get(g);
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
        const o = S(t, n, this.name);
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
        const o = S(t, i, this.name);
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

const O = Object.prototype.toString;

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
        switch (O.call(e)) {
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
            throw new Error(`Cannot count ${O.call(e)}`);
        }
    }
    iterate(t, e, r) {
        switch (O.call(e)) {
          case "[object Array]":
            return x(e, r);

          case "[object Map]":
            return B(e, r);

          case "[object Set]":
            return $(e, r);

          case "[object Number]":
            return k(e, r);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${O.call(e)}`);
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

function S(t, e, r) {
    const s = null == e ? null : e[r];
    if ("function" === typeof s) return s;
    if (!(8 & t) && null == s) return null;
    throw new Error(`AUR0111:${r}`);
}

function x(t, e) {
    for (let r = 0, s = t.length; r < s; ++r) e(t, r, t[r]);
}

function B(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.entries()) r[++s] = e;
    x(r, e);
}

function $(t, e) {
    const r = Array(t.size);
    let s = -1;
    for (const e of t.keys()) r[++s] = e;
    x(r, e);
}

function k(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    x(r, e);
}

const L = Object.prototype.hasOwnProperty;

const T = Reflect.defineProperty;

function P(t, e, r) {
    T(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function R(t, e, r, s = false) {
    if (s || !L.call(t, e)) P(t, e, r);
}

var j;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(j || (j = {}));

var I;

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
})(I || (I = {}));

var M;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(M || (M = {}));

var F;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(F || (F = {}));

var V;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(V || (V = {}));

var D;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(D || (D = {}));

function N(t, e) {
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

function K(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function q(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function H(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function Q(t) {
    return null == t ? _ : _(t);
}

function _(t) {
    const e = t.prototype;
    T(e, "subs", {
        get: W
    });
    R(e, "subscribe", z);
    R(e, "unsubscribe", G);
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

function W() {
    return P(this, "subs", new SubscriberRecord);
}

function z(t) {
    return this.subs.add(t);
}

function G(t) {
    return this.subs.remove(t);
}

function Z(t) {
    return null == t ? J : J(t);
}

function J(t) {
    const e = t.prototype;
    T(e, "queue", {
        get: X
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

function X() {
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
        rt = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, rt, this.f);
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
        rt = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, rt, this.f);
    }
}

function Y(t) {
    const e = t.prototype;
    R(e, "subscribe", tt, true);
    R(e, "unsubscribe", et, true);
    Z(t);
    Q(t);
}

function tt(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function et(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

Y(CollectionLengthObserver);

Y(CollectionSizeObserver);

let rt;

const st = new WeakMap;

function it(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function nt(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function ot(t, e, r, s, i) {
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

function ht(t, e, r, s, i) {
    let n = 0, o = 0;
    let h, u, c;
    let a, l, f;
    let d, v, p;
    let g, b;
    let w, m, E, y;
    let A, U, C, O;
    while (true) {
        if (s - r <= 10) {
            ot(t, e, r, s, i);
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
            ht(t, e, y, s, i);
            s = E;
        } else {
            ht(t, e, r, E, i);
            r = y;
        }
    }
}

const ut = Array.prototype;

const ct = ut.push;

const at = ut.unshift;

const lt = ut.pop;

const ft = ut.shift;

const dt = ut.splice;

const vt = ut.reverse;

const pt = ut.sort;

const gt = {
    push: ct,
    unshift: at,
    pop: lt,
    shift: ft,
    splice: dt,
    reverse: vt,
    sort: pt
};

const bt = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const wt = {
    push: function(...t) {
        const e = st.get(this);
        if (void 0 === e) return ct.apply(this, t);
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
        const e = st.get(this);
        if (void 0 === e) return at.apply(this, t);
        const r = t.length;
        const s = new Array(r);
        let i = 0;
        while (i < r) s[i++] = -2;
        at.apply(e.indexMap, s);
        const n = at.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = st.get(this);
        if (void 0 === t) return lt.call(this);
        const e = t.indexMap;
        const r = lt.call(this);
        const s = e.length - 1;
        if (e[s] > -1) e.deletedItems.push(e[s]);
        lt.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = st.get(this);
        if (void 0 === t) return ft.call(this);
        const e = t.indexMap;
        const r = ft.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        ft.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const s = st.get(this);
        if (void 0 === s) return dt.apply(this, t);
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
            dt.call(h, e, r, ...s);
        } else dt.apply(h, t);
        const a = dt.apply(this, t);
        s.notify();
        return a;
    },
    reverse: function() {
        const t = st.get(this);
        if (void 0 === t) {
            vt.call(this);
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
        const e = st.get(this);
        if (void 0 === e) {
            pt.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        ht(this, e.indexMap, 0, r, nt);
        let s = 0;
        while (s < r) {
            if (void 0 === this[s]) break;
            s++;
        }
        if (void 0 === t || "function" !== typeof t) t = it;
        ht(this, e.indexMap, 0, s, t);
        e.notify();
        return this;
    }
};

for (const t of bt) T(wt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let mt = false;

function Et() {
    for (const t of bt) if (true !== ut[t].observing) P(ut, t, wt[t]);
}

function yt() {
    for (const t of bt) if (true === ut[t].observing) P(ut, t, gt[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!mt) {
            mt = true;
            Et();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = K(t.length);
        this.lenObs = void 0;
        st.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = K(e);
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

Q(ArrayObserver);

Q(ArrayIndexObserver);

function At(t) {
    let e = st.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function Ut(t) {
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

function Ct(t, e) {
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

const Ot = new WeakMap;

const St = Set.prototype;

const xt = St.add;

const Bt = St.clear;

const $t = St.delete;

const kt = {
    add: xt,
    clear: Bt,
    delete: $t
};

const Lt = [ "add", "clear", "delete" ];

const Tt = {
    add: function(t) {
        const e = Ot.get(this);
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
        const t = Ot.get(this);
        if (void 0 === t) return Bt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Bt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Ot.get(this);
        if (void 0 === e) return $t.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = $t.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            s++;
        }
        return false;
    }
};

const Pt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Lt) T(Tt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Rt = false;

function jt() {
    for (const t of Lt) if (true !== St[t].observing) T(St, t, {
        ...Pt,
        value: Tt[t]
    });
}

function It() {
    for (const t of Lt) if (true === St[t].observing) T(St, t, {
        ...Pt,
        value: kt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Rt) {
            Rt = true;
            jt();
        }
        this.collection = t;
        this.indexMap = K(t.size);
        this.lenObs = void 0;
        Ot.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = K(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

Q(SetObserver);

function Mt(t) {
    let e = Ot.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Ft = new WeakMap;

const Vt = Map.prototype;

const Dt = Vt.set;

const Nt = Vt.clear;

const Kt = Vt.delete;

const qt = {
    set: Dt,
    clear: Nt,
    delete: Kt
};

const Ht = [ "set", "clear", "delete" ];

const Qt = {
    set: function(t, e) {
        const r = Ft.get(this);
        if (void 0 === r) {
            Dt.call(this, t, e);
            return this;
        }
        const s = this.get(t);
        const i = this.size;
        Dt.call(this, t, e);
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
        const t = Ft.get(this);
        if (void 0 === t) return Nt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Nt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Ft.get(this);
        if (void 0 === e) return Kt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let s = 0;
        const i = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (i[s] > -1) i.deletedItems.push(i[s]);
                i.splice(s, 1);
                const r = Kt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++s;
        }
        return false;
    }
};

const _t = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Ht) T(Qt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Wt = false;

function zt() {
    for (const t of Ht) if (true !== Vt[t].observing) T(Vt, t, {
        ..._t,
        value: Qt[t]
    });
}

function Gt() {
    for (const t of Ht) if (true === Vt[t].observing) T(Vt, t, {
        ..._t,
        value: qt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!Wt) {
            Wt = true;
            zt();
        }
        this.collection = t;
        this.indexMap = K(t.size);
        this.lenObs = void 0;
        Ft.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = K(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

Q(MapObserver);

function Zt(t) {
    let e = Ft.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function Jt(t, e) {
    const r = this.oL.getObserver(t, e);
    this.obs.add(r);
}

function Xt() {
    return P(this, "obs", new BindingObserverRecord(this));
}

function Yt(t) {
    let e;
    if (t instanceof Array) e = At(t); else if (t instanceof Set) e = Mt(t); else if (t instanceof Map) e = Zt(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function te(t) {
    this.obs.add(t);
}

function ee() {
    throw new Error(`AUR2011:handleChange`);
}

function re() {
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

function se(t) {
    const e = t.prototype;
    R(e, "observe", Jt, true);
    R(e, "observeCollection", Yt, true);
    R(e, "subscribeTo", te, true);
    T(e, "obs", {
        get: Xt
    });
    R(e, "handleChange", ee);
    R(e, "handleCollectionChange", re);
    return t;
}

function ie(t) {
    return null == t ? se : se(t);
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

se(BindingMediator);

const ne = s.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

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
        we.ip = t;
        we.length = t.length;
        we.index = 0;
        we.o = t.charCodeAt(0);
        return Ee(we, 0, 61, void 0 === e ? 53 : e);
    }
}

var oe;

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
})(oe || (oe = {}));

function he(t) {
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

var ue;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(ue || (ue = {}));

var ce;

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
})(ce || (ce = {}));

var ae;

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
})(ae || (ae = {}));

const le = PrimitiveLiteralExpression.$false;

const fe = PrimitiveLiteralExpression.$true;

const de = PrimitiveLiteralExpression.$null;

const ve = PrimitiveLiteralExpression.$undefined;

const pe = AccessThisExpression.$this;

const ge = AccessThisExpression.$parent;

var be;

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
})(be || (be = {}));

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

const we = new ParserState("");

function me(t, e) {
    we.ip = t;
    we.length = t.length;
    we.index = 0;
    we.o = t.charCodeAt(0);
    return Ee(we, 0, 61, void 0 === e ? 53 : e);
}

function Ee(t, e, r, s) {
    if (284 === s) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (2048 & s) return Ce(t);
        Se(t);
        if (1048576 & t.l) throw new Error(`AUR0151:${t.ip}`);
    }
    t.m = 448 > r;
    let i;
    if (32768 & t.l) {
        const r = je[63 & t.l];
        Se(t);
        i = new UnaryExpression(r, Ee(t, e, 449, s));
        t.m = false;
    } else {
        t: switch (t.l) {
          case 3078:
            t.m = false;
            do {
                Se(t);
                e++;
                if (Pe(t, 16393)) {
                    if (16393 === t.l) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.l) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.l) {
                    const t = 511 & e;
                    i = 0 === t ? pe : 1 === t ? ge : new AccessThisExpression(t);
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
            Se(t);
            break;

          case 3076:
            t.m = false;
            Se(t);
            i = pe;
            e = 512;
            break;

          case 671751:
            Se(t);
            i = Ee(t, 0, 62, s);
            Re(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = ye(t, e, s);
            e = 0;
            break;

          case 131080:
            i = Ue(t, s);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.g ]);
            t.m = false;
            Se(t);
            e = 0;
            break;

          case 540715:
            i = Oe(t, e, s, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.g);
            t.m = false;
            Se(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = je[63 & t.l];
            t.m = false;
            Se(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (512 & s) return Ae(t, i);
        if (449 < r) return i;
        let n = t.g;
        while ((16384 & t.l) > 0) {
            const r = [];
            let o;
            switch (t.l) {
              case 16393:
                t.m = true;
                Se(t);
                if (0 === (3072 & t.l)) throw new Error(`AUR0153:${t.ip}`);
                n = t.g;
                Se(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.l) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.m = true;
                Se(t);
                e = 4096;
                i = new AccessKeyedExpression(i, Ee(t, 0, 62, s));
                Re(t, 1835022);
                break;

              case 671751:
                t.m = false;
                Se(t);
                while (1835019 !== t.l) {
                    r.push(Ee(t, 0, 62, s));
                    if (!Pe(t, 1572876)) break;
                }
                Re(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, r, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, r); else i = new CallFunctionExpression(i, r);
                e = 0;
                break;

              case 540714:
                t.m = false;
                o = [ t.g ];
                i = new TaggedTemplateExpression(o, o, i);
                Se(t);
                break;

              case 540715:
                i = Oe(t, e, s, i, true);
            }
        }
    }
    if (448 < r) return i;
    while ((65536 & t.l) > 0) {
        const n = t.l;
        if ((448 & n) <= r) break;
        Se(t);
        i = new BinaryExpression(je[63 & n], i, Ee(t, e, 448 & n, s));
        t.m = false;
    }
    if (63 < r) return i;
    if (Pe(t, 1572880)) {
        const r = Ee(t, e, 62, s);
        Re(t, 1572879);
        i = new ConditionalExpression(i, r, Ee(t, e, 62, s));
        t.m = false;
    }
    if (62 < r) return i;
    if (Pe(t, 1048616)) {
        if (!t.m) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, Ee(t, e, 62, s));
    }
    if (61 < r) return i;
    while (Pe(t, 1572884)) {
        if (1572864 === t.l) throw new Error(`AUR0159:${t.ip}`);
        const r = t.g;
        Se(t);
        const n = new Array;
        while (Pe(t, 1572879)) n.push(Ee(t, e, 62, s));
        i = new ValueConverterExpression(i, r, n);
    }
    while (Pe(t, 1572883)) {
        if (1572864 === t.l) throw new Error(`AUR0160:${t.ip}`);
        const r = t.g;
        Se(t);
        const n = new Array;
        while (Pe(t, 1572879)) n.push(Ee(t, e, 62, s));
        i = new BindingBehaviorExpression(i, r, n);
    }
    if (1572864 !== t.l) {
        if (2048 & s) return i;
        if ("of" === t.A) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function ye(t, e, r) {
    Se(t);
    const s = new Array;
    while (1835022 !== t.l) if (Pe(t, 1572876)) {
        s.push(ve);
        if (1835022 === t.l) break;
    } else {
        s.push(Ee(t, e, 62, ~512 & r));
        if (Pe(t, 1572876)) {
            if (1835022 === t.l) break;
        } else break;
    }
    Re(t, 1835022);
    if (512 & r) return new ArrayBindingPattern(s); else {
        t.m = false;
        return new ArrayLiteralExpression(s);
    }
}

function Ae(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.l) throw new Error(`AUR0163:${t.ip}`);
    Se(t);
    const r = e;
    const s = Ee(t, 0, 61, 0);
    return new ForOfStatement(r, s);
}

function Ue(t, e) {
    const r = new Array;
    const s = new Array;
    Se(t);
    while (1835018 !== t.l) {
        r.push(t.g);
        if (12288 & t.l) {
            Se(t);
            Re(t, 1572879);
            s.push(Ee(t, 0, 62, ~512 & e));
        } else if (3072 & t.l) {
            const {o: r, l: i, index: n} = t;
            Se(t);
            if (Pe(t, 1572879)) s.push(Ee(t, 0, 62, ~512 & e)); else {
                t.o = r;
                t.l = i;
                t.index = n;
                s.push(Ee(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.l) Re(t, 1572876);
    }
    Re(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(r, s); else {
        t.m = false;
        return new ObjectLiteralExpression(r, s);
    }
}

function Ce(t) {
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
                Se(t);
                const s = Ee(t, 0, 61, 2048);
                r.push(s);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(he(xe(t)));
            break;

          default:
            i += String.fromCharCode(t.o);
        }
        xe(t);
    }
    if (r.length) {
        e.push(i);
        return new Interpolation(e, r);
    }
    return null;
}

function Oe(t, e, r, s, i) {
    const n = [ t.g ];
    Re(t, 540715);
    const o = [ Ee(t, e, 62, r) ];
    while (540714 !== (t.l = Te(t))) {
        n.push(t.g);
        Re(t, 540715);
        o.push(Ee(t, e, 62, r));
    }
    n.push(t.g);
    t.m = false;
    if (i) {
        Se(t);
        return new TaggedTemplateExpression(n, n, s, o);
    } else {
        Se(t);
        return new TemplateExpression(n, o);
    }
}

function Se(t) {
    while (t.index < t.length) {
        t.h = t.index;
        if (null != (t.l = qe[t.o](t))) return;
    }
    t.l = 1572864;
}

function xe(t) {
    return t.o = t.ip.charCodeAt(++t.index);
}

function Be(t) {
    while (Ke[xe(t)]) ;
    const e = Ie[t.g = t.A];
    return void 0 === e ? 1024 : e;
}

function $e(t, e) {
    let r = t.o;
    if (false === e) {
        do {
            r = xe(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.g = parseInt(t.A, 10);
            return 8192;
        }
        r = xe(t);
        if (t.index >= t.length) {
            t.g = parseInt(t.A.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = xe(t);
    } while (r <= 57 && r >= 48); else t.o = t.ip.charCodeAt(--t.index);
    t.g = parseFloat(t.A);
    return 8192;
}

function ke(t) {
    const e = t.o;
    xe(t);
    let r = 0;
    const s = new Array;
    let i = t.index;
    while (t.o !== e) if (92 === t.o) {
        s.push(t.ip.slice(i, t.index));
        xe(t);
        r = he(t.o);
        xe(t);
        s.push(String.fromCharCode(r));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else xe(t);
    const n = t.ip.slice(i, t.index);
    xe(t);
    s.push(n);
    const o = s.join("");
    t.g = o;
    return 4096;
}

function Le(t) {
    let e = true;
    let r = "";
    while (96 !== xe(t)) if (36 === t.o) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.o) r += String.fromCharCode(he(xe(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        r += String.fromCharCode(t.o);
    }
    xe(t);
    t.g = r;
    if (e) return 540714;
    return 540715;
}

function Te(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return Le(t);
}

function Pe(t, e) {
    if (t.l === e) {
        Se(t);
        return true;
    }
    return false;
}

function Re(t, e) {
    if (t.l === e) Se(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const je = [ le, fe, de, ve, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Ie = Object.create(null);

Ie.true = 2049;

Ie.null = 2050;

Ie.false = 2048;

Ie.undefined = 2051;

Ie.$this = 3076;

Ie.$parent = 3078;

Ie.in = 1640799;

Ie.instanceof = 1640800;

Ie.typeof = 34851;

Ie.void = 34852;

Ie.of = 1051180;

const Me = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Fe(t, e, r, s) {
    const i = r.length;
    for (let n = 0; n < i; n += 2) {
        const i = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(s, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function Ve(t) {
    return e => {
        xe(e);
        return t;
    };
}

const De = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

De.notMapped = true;

const Ne = new Set;

Fe(null, Ne, Me.AsciiIdPart, true);

const Ke = new Uint8Array(65535);

Fe(Ke, null, Me.IdStart, 1);

Fe(Ke, null, Me.Digit, 1);

const qe = new Array(65535);

qe.fill(De, 0, 65535);

Fe(qe, null, Me.Skip, (t => {
    xe(t);
    return null;
}));

Fe(qe, null, Me.IdStart, Be);

Fe(qe, null, Me.Digit, (t => $e(t, false)));

qe[34] = qe[39] = t => ke(t);

qe[96] = t => Le(t);

qe[33] = t => {
    if (61 !== xe(t)) return 32809;
    if (61 !== xe(t)) return 1638680;
    xe(t);
    return 1638682;
};

qe[61] = t => {
    if (61 !== xe(t)) return 1048616;
    if (61 !== xe(t)) return 1638679;
    xe(t);
    return 1638681;
};

qe[38] = t => {
    if (38 !== xe(t)) return 1572883;
    xe(t);
    return 1638614;
};

qe[124] = t => {
    if (124 !== xe(t)) return 1572884;
    xe(t);
    return 1638549;
};

qe[46] = t => {
    if (xe(t) <= 57 && t.o >= 48) return $e(t, true);
    return 16393;
};

qe[60] = t => {
    if (61 !== xe(t)) return 1638747;
    xe(t);
    return 1638749;
};

qe[62] = t => {
    if (61 !== xe(t)) return 1638748;
    xe(t);
    return 1638750;
};

qe[37] = Ve(1638886);

qe[40] = Ve(671751);

qe[41] = Ve(1835019);

qe[42] = Ve(1638885);

qe[43] = Ve(623009);

qe[44] = Ve(1572876);

qe[45] = Ve(623010);

qe[47] = Ve(1638887);

qe[58] = Ve(1572879);

qe[63] = Ve(1572880);

qe[91] = Ve(671757);

qe[93] = Ve(1835022);

qe[123] = Ve(131080);

qe[125] = Ve(1835018);

let He = null;

const Qe = [];

let _e = false;

function We() {
    _e = false;
}

function ze() {
    _e = true;
}

function Ge() {
    return He;
}

function Ze(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == He) {
        He = t;
        Qe[0] = He;
        _e = true;
        return;
    }
    if (He === t) throw new Error("AUR0207");
    Qe.push(He);
    He = t;
    _e = true;
}

function Je(t) {
    if (null == t) throw new Error("AUR0208");
    if (He !== t) throw new Error("AUR0209");
    Qe.pop();
    He = Qe.length > 0 ? Qe[Qe.length - 1] : null;
    _e = null != He;
}

const Xe = Object.freeze({
    get current() {
        return He;
    },
    get connecting() {
        return _e;
    },
    enter: Ze,
    exit: Je,
    pause: We,
    resume: ze
});

const Ye = Reflect.get;

const tr = Object.prototype.toString;

const er = new WeakMap;

function rr(t) {
    switch (tr.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const sr = "__raw__";

function ir(t) {
    return rr(t) ? nr(t) : t;
}

function nr(t) {
    var e;
    return null !== (e = er.get(t)) && void 0 !== e ? e : cr(t);
}

function or(t) {
    var e;
    return null !== (e = t[sr]) && void 0 !== e ? e : t;
}

function hr(t) {
    return rr(t) && t[sr] || t;
}

function ur(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function cr(t) {
    const e = t instanceof Array ? lr : t instanceof Map || t instanceof Set ? Rr : ar;
    const r = new Proxy(t, e);
    er.set(t, r);
    return r;
}

const ar = {
    get(t, e, r) {
        if (e === sr) return t;
        const s = Ge();
        if (!_e || ur(e) || null == s) return Ye(t, e, r);
        s.observe(t, e);
        return ir(Ye(t, e, r));
    }
};

const lr = {
    get(t, e, r) {
        if (e === sr) return t;
        const s = Ge();
        if (!_e || ur(e) || null == s) return Ye(t, e, r);
        switch (e) {
          case "length":
            s.observe(t, "length");
            return t.length;

          case "map":
            return fr;

          case "includes":
            return pr;

          case "indexOf":
            return gr;

          case "lastIndexOf":
            return br;

          case "every":
            return dr;

          case "filter":
            return vr;

          case "find":
            return mr;

          case "findIndex":
            return wr;

          case "flat":
            return Er;

          case "flatMap":
            return yr;

          case "join":
            return Ar;

          case "push":
            return Cr;

          case "pop":
            return Ur;

          case "reduce":
            return Tr;

          case "reduceRight":
            return Pr;

          case "reverse":
            return Br;

          case "shift":
            return Or;

          case "unshift":
            return Sr;

          case "slice":
            return Lr;

          case "splice":
            return xr;

          case "some":
            return $r;

          case "sort":
            return kr;

          case "keys":
            return Kr;

          case "values":
          case Symbol.iterator:
            return qr;

          case "entries":
            return Hr;
        }
        s.observe(t, e);
        return ir(Ye(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = Ge()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function fr(t, e) {
    var r;
    const s = or(this);
    const i = s.map(((r, s) => hr(t.call(e, ir(r), s, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ir(i);
}

function dr(t, e) {
    var r;
    const s = or(this);
    const i = s.every(((r, s) => t.call(e, ir(r), s, this)));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function vr(t, e) {
    var r;
    const s = or(this);
    const i = s.filter(((r, s) => hr(t.call(e, ir(r), s, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ir(i);
}

function pr(t) {
    var e;
    const r = or(this);
    const s = r.includes(hr(t));
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function gr(t) {
    var e;
    const r = or(this);
    const s = r.indexOf(hr(t));
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function br(t) {
    var e;
    const r = or(this);
    const s = r.lastIndexOf(hr(t));
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return s;
}

function wr(t, e) {
    var r;
    const s = or(this);
    const i = s.findIndex(((r, s) => hr(t.call(e, ir(r), s, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function mr(t, e) {
    var r;
    const s = or(this);
    const i = s.find(((e, r) => t(ir(e), r, this)), e);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ir(i);
}

function Er() {
    var t;
    const e = or(this);
    null === (t = Ge()) || void 0 === t ? void 0 : t.observeCollection(e);
    return ir(e.flat());
}

function yr(t, e) {
    var r;
    const s = or(this);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return nr(s.flatMap(((r, s) => ir(t.call(e, ir(r), s, this)))));
}

function Ar(t) {
    var e;
    const r = or(this);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function Ur() {
    return ir(or(this).pop());
}

function Cr(...t) {
    return or(this).push(...t);
}

function Or() {
    return ir(or(this).shift());
}

function Sr(...t) {
    return or(this).unshift(...t);
}

function xr(...t) {
    return ir(or(this).splice(...t));
}

function Br(...t) {
    var e;
    const r = or(this);
    const s = r.reverse();
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return ir(s);
}

function $r(t, e) {
    var r;
    const s = or(this);
    const i = s.some(((r, s) => hr(t.call(e, ir(r), s, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return i;
}

function kr(t) {
    var e;
    const r = or(this);
    const s = r.sort(t);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return ir(s);
}

function Lr(t, e) {
    var r;
    const s = or(this);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return nr(s.slice(t, e));
}

function Tr(t, e) {
    var r;
    const s = or(this);
    const i = s.reduce(((e, r, s) => t(e, ir(r), s, this)), e);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ir(i);
}

function Pr(t, e) {
    var r;
    const s = or(this);
    const i = s.reduceRight(((e, r, s) => t(e, ir(r), s, this)), e);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return ir(i);
}

const Rr = {
    get(t, e, r) {
        if (e === sr) return t;
        const s = Ge();
        if (!_e || ur(e) || null == s) return Ye(t, e, r);
        switch (e) {
          case "size":
            s.observe(t, "size");
            return t.size;

          case "clear":
            return Dr;

          case "delete":
            return Nr;

          case "forEach":
            return jr;

          case "add":
            if (t instanceof Set) return Vr;
            break;

          case "get":
            if (t instanceof Map) return Mr;
            break;

          case "set":
            if (t instanceof Map) return Fr;
            break;

          case "has":
            return Ir;

          case "keys":
            return Kr;

          case "values":
            return qr;

          case "entries":
            return Hr;

          case Symbol.iterator:
            return t instanceof Map ? Hr : qr;
        }
        return ir(Ye(t, e, r));
    }
};

function jr(t, e) {
    var r;
    const s = or(this);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(s);
    return s.forEach(((r, s) => {
        t.call(e, ir(r), ir(s), this);
    }));
}

function Ir(t) {
    var e;
    const r = or(this);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(hr(t));
}

function Mr(t) {
    var e;
    const r = or(this);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return ir(r.get(hr(t)));
}

function Fr(t, e) {
    return ir(or(this).set(hr(t), hr(e)));
}

function Vr(t) {
    return ir(or(this).add(hr(t)));
}

function Dr() {
    return ir(or(this).clear());
}

function Nr(t) {
    return ir(or(this).delete(hr(t)));
}

function Kr() {
    var t;
    const e = or(this);
    null === (t = Ge()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: ir(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function qr() {
    var t;
    const e = or(this);
    null === (t = Ge()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: ir(e),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Hr() {
    var t;
    const e = or(this);
    null === (t = Ge()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ ir(e[0]), ir(e[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const Qr = Object.freeze({
    getProxy: nr,
    getRaw: or,
    wrap: ir,
    unwrap: hr,
    rawKey: sr
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
        T(t, e, {
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
        _r = this.U;
        this.U = this.value;
        this.subs.notify(this.value, _r, 0);
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
            Ze(this);
            return this.value = hr(this.get.call(this.useProxy ? ir(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            Je(this);
        }
    }
}

ie(ComputedObserver);

Q(ComputedObserver);

Z(ComputedObserver);

let _r;

const Wr = s.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const zr = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const Gr = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.O = null;
        this.S = 0;
        this.check = () => {
            if (zr.disabled) return;
            if (++this.S < zr.timeoutsPerCheck) return;
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
        if (zr.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.O = this.p.taskQueue.queueTask(this.check, Gr);
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

Z(DirtyChecker);

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

Q(DirtyCheckProperty);

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

let Zr;

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
        Zr = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Zr, this.f);
    }
    start() {
        if (false === this.observing) {
            this.observing = true;
            this.value = this.obj[this.propertyKey];
            T(this.obj, this.propertyKey, {
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
            T(this.obj, this.propertyKey, {
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
        Zr = this.oV;
        this.oV = this.v;
        this.subs.notify(this.v, Zr, this.f);
    }
}

Q(SetterObserver);

Q(SetterNotifier);

Z(SetterObserver);

Z(SetterNotifier);

const Jr = new PropertyAccessor;

const Xr = s.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const Yr = s.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
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
        return Jr;
    }
    getAccessor() {
        return Jr;
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
        return Jr;
    }
    getArrayObserver(t) {
        return At(t);
    }
    getMapObserver(t) {
        return Zt(t);
    }
    getSetObserver(t) {
        return Mt(t);
    }
    createObserver(t, e) {
        var r, s, i, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.$.handles(t, e, this)) return this.$.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return At(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return Zt(t).getLengthObserver(); else if (t instanceof Set) return Mt(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && a(e)) return At(t).getIndexObserver(Number(e));
            break;
        }
        let o = rs(t, e);
        if (void 0 === o) {
            let r = es(t);
            while (null !== r) {
                o = rs(r, e);
                if (void 0 === o) r = es(r); else break;
            }
        }
        if (void 0 !== o && !L.call(o, "value")) {
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
            T(t, "$observers", {
                value: {
                    [e]: r
                }
            });
            return r;
        }
        return t.$observers[e] = r;
    }
}

ObserverLocator.inject = [ Wr, Yr ];

function ts(t) {
    let e;
    if (t instanceof Array) e = At(t); else if (t instanceof Map) e = Zt(t); else if (t instanceof Set) e = Mt(t);
    return e;
}

const es = Object.getPrototypeOf;

const rs = Object.getOwnPropertyDescriptor;

const ss = s.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ Xr ];
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
            Ze(this);
            this.fn(this);
        } finally {
            this.obs.clear(false);
            this.running = false;
            Je(this);
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

ie(Effect);

function is(t) {
    if (void 0 === t.$observers) T(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const ns = {};

function os(t, e, r) {
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
        let h = ns;
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
            const s = hs(this, e, o, h, u);
            null === (r = Ge()) || void 0 === r ? void 0 : r.subscribeTo(s);
            return s.getValue();
        };
        r.set = function t(r) {
            hs(this, e, o, h, u).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return hs(r, e, o, h, u);
        };
        if (n) T(t.prototype, e, r); else return r;
    }
}

function hs(t, e, r, s, i) {
    const n = is(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, i, s === ns ? void 0 : s);
        n[e] = o;
    }
    return o;
}

export { ue as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, D as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, E as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, b as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, j as BindingMode, BindingObserverRecord, be as BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, oe as Char, V as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, Xe as ConnectableSwitcher, CustomExpression, F as DelegationStrategy, DirtyCheckProperty, zr as DirtyCheckSettings, C as ExpressionKind, FlushQueue, ForOfStatement, HtmlLiteralExpression, Wr as IDirtyChecker, ne as IExpressionParser, Yr as INodeObserverLocator, ss as IObservation, Xr as IObserverLocator, g as ISignaler, Interpolation, I as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, ce as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Qr as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, U as ValueConverter, ValueConverterDefinition, ValueConverterExpression, d as alias, Ut as applyMutationsToIndices, w as bindingBehavior, q as cloneIndexMap, ie as connectable, N as copyIndexMap, K as createIndexMap, yt as disableArrayObservation, Gt as disableMapObservation, It as disableSetObservation, Et as enableArrayObservation, zt as enableMapObservation, jt as enableSetObservation, ts as getCollectionObserver, H as isIndexMap, os as observable, Ee as parse, me as parseExpression, v as registerAliases, Q as subscriberCollection, Ct as synchronizeIndices, y as valueConverter, Z as withFlushQueue };
//# sourceMappingURL=index.js.map
