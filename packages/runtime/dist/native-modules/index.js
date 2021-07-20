import { Protocol as t, Metadata as e, Registration as r, DI as i, firstDefined as s, mergeArrays as n, fromAnnotationOrDefinitionOrTypeOrDefault as o, isNumberOrBigInt as h, isStringOrDate as a, emptyArray as c, isArrayIndex as u, IPlatform as l, ILogger as f } from "../../../kernel/dist/native-modules/index.js";

export { IPlatform } from "../../../kernel/dist/native-modules/index.js";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "../../../platform/dist/native-modules/index.js";

function d(...r) {
    return function(i) {
        const s = t.annotation.keyFor("aliases");
        const n = e.getOwn(s, i);
        if (void 0 === n) e.define(s, r, i); else n.push(...r);
    };
}

function v(t, e, i, s) {
    for (let n = 0, o = t.length; n < o; ++n) r.aliasTo(i, e.keyFrom(t[n])).register(s);
}

const p = Object.freeze({});

class BindingContext {
    constructor(t, e) {
        if (void 0 !== t) if (void 0 !== e) this[t] = e; else for (const e in t) if (Object.prototype.hasOwnProperty.call(t, e)) this[e] = t[e];
    }
    static create(t, e) {
        return new BindingContext(t, e);
    }
    static get(t, e, r, i) {
        var s, n;
        if (null == t) throw new Error(`Scope is ${t}.`);
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
            h = null !== (s = h.parentScope) && void 0 !== s ? s : null;
            o = null !== (n = null === h || void 0 === h ? void 0 : h.overrideContext) && void 0 !== n ? n : null;
        }
        if (o) return e in o ? o : o.bindingContext;
        if (16 & i) return p;
        return t.bindingContext || t.overrideContext;
    }
}

class Scope {
    constructor(t, e, r, i) {
        this.parentScope = t;
        this.bindingContext = e;
        this.overrideContext = r;
        this.isBoundary = i;
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

const g = i.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = Object.create(null);
    }
    dispatchSignal(t, e) {
        const r = this.signals[t];
        if (void 0 === r) return;
        for (const t of r.keys()) t.handleChange(void 0, void 0, e);
    }
    addSignalListener(t, e) {
        const r = this.signals;
        const i = r[t];
        if (void 0 === i) r[t] = new Set([ e ]); else i.add(e);
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
        return m.define(t, e);
    };
}

class BindingBehaviorDefinition {
    constructor(t, e, r, i, s) {
        this.Type = t;
        this.name = e;
        this.aliases = r;
        this.key = i;
        this.strategy = s;
    }
    static create(t, e) {
        let r;
        let i;
        if ("string" === typeof t) {
            r = t;
            i = {
                name: r
            };
        } else {
            r = t.name;
            i = t;
        }
        const h = Object.getPrototypeOf(e) === BindingInterceptor;
        return new BindingBehaviorDefinition(e, s(m.getAnnotation(e, "name"), r), n(m.getAnnotation(e, "aliases"), i.aliases, e.aliases), m.keyFrom(r), o("strategy", i, e, (() => h ? 2 : 1)));
    }
    register(t) {
        const {Type: e, key: i, aliases: s, strategy: n} = this;
        switch (n) {
          case 1:
            r.singleton(i, e).register(t);
            break;

          case 2:
            r.instance(i, new BindingBehaviorFactory(t, e)).register(t);
            break;
        }
        r.aliasTo(i, e).register(t);
        v(s, m, i, t);
    }
}

class BindingBehaviorFactory {
    constructor(t, e) {
        this.container = t;
        this.Type = e;
        this.deps = i.getDependencies(e);
    }
    construct(t, e) {
        const r = this.container;
        const i = this.deps;
        switch (i.length) {
          case 0:
          case 1:
          case 2:
            return new this.Type(t, e);

          case 3:
            return new this.Type(r.get(i[0]), t, e);

          case 4:
            return new this.Type(r.get(i[0]), r.get(i[1]), t, e);

          default:
            return new this.Type(...i.map((t => r.get(t))), t, e);
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
    get observerLocator() {
        return this.binding.observerLocator;
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

const m = {
    name: t.resource.keyFor("binding-behavior"),
    keyFrom(t) {
        return `${m.name}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && e.hasOwn(m.name, t);
    },
    define(r, i) {
        const s = BindingBehaviorDefinition.create(r, i);
        e.define(m.name, s, s.Type);
        e.define(m.name, s, s);
        t.resource.appendTo(i, m.name);
        return s.Type;
    },
    getDefinition(t) {
        const r = e.getOwn(m.name, t);
        if (void 0 === r) throw new Error(`No definition found for type ${t.name}`);
        return r;
    },
    annotate(r, i, s) {
        e.define(t.annotation.keyFor(i), s, r);
    },
    getAnnotation(r, i) {
        return e.getOwn(t.annotation.keyFor(i), r);
    }
};

function y(t) {
    return function(e) {
        return E.define(t, e);
    };
}

class ValueConverterDefinition {
    constructor(t, e, r, i) {
        this.Type = t;
        this.name = e;
        this.aliases = r;
        this.key = i;
    }
    static create(t, e) {
        let r;
        let i;
        if ("string" === typeof t) {
            r = t;
            i = {
                name: r
            };
        } else {
            r = t.name;
            i = t;
        }
        return new ValueConverterDefinition(e, s(E.getAnnotation(e, "name"), r), n(E.getAnnotation(e, "aliases"), i.aliases, e.aliases), E.keyFrom(r));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        r.singleton(i, e).register(t);
        r.aliasTo(i, e).register(t);
        v(s, E, i, t);
    }
}

const E = {
    name: t.resource.keyFor("value-converter"),
    keyFrom(t) {
        return `${E.name}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && e.hasOwn(E.name, t);
    },
    define(r, i) {
        const s = ValueConverterDefinition.create(r, i);
        e.define(E.name, s, s.Type);
        e.define(E.name, s, s);
        t.resource.appendTo(i, E.name);
        return s.Type;
    },
    getDefinition(t) {
        const r = e.getOwn(E.name, t);
        if (void 0 === r) throw new Error(`No definition found for type ${t.name}`);
        return r;
    },
    annotate(r, i, s) {
        e.define(t.annotation.keyFor(i), s, r);
    },
    getAnnotation(r, i) {
        return e.getOwn(t.annotation.keyFor(i), r);
    }
};

var x;

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
})(x || (x = {}));

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
        for (let t = 0, i = e.length; t < i; ++t) {
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
        const i = r.length;
        this.text += "`";
        this.text += e[0];
        for (let t = 0; t < i; t++) {
            r[t].accept(this);
            this.text += e[t + 1];
        }
        this.text += "`";
    }
    visitTaggedTemplate(t) {
        const {cooked: e, expressions: r} = t;
        const i = r.length;
        t.func.accept(this);
        this.text += "`";
        this.text += e[0];
        for (let t = 0; t < i; t++) {
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
        for (let t = 0, i = e.length; t < i; ++t) {
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
        const i = r.length;
        this.text += "${";
        this.text += e[0];
        for (let t = 0; t < i; t++) {
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
    evaluate(t, e, r, i) {
        return this.value;
    }
}

class BindingBehaviorExpression {
    constructor(t, e, r) {
        this.expression = t;
        this.name = e;
        this.args = r;
        this.behaviorKey = m.keyFrom(e);
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
    evaluate(t, e, r, i) {
        return this.expression.evaluate(t, e, r, i);
    }
    assign(t, e, r, i) {
        return this.expression.assign(t, e, r, i);
    }
    bind(t, e, r) {
        if (this.expression.hasBind) this.expression.bind(t, e, r);
        const i = r.locator.get(this.behaviorKey);
        if (null == i) throw new Error(`BindingBehavior named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        if (!(i instanceof BindingBehaviorFactory)) if (void 0 === r[this.behaviorKey]) {
            r[this.behaviorKey] = i;
            i.bind.call(i, t, e, r, ...this.args.map((i => i.evaluate(t, e, r.locator, null))));
        } else throw new Error(`BindingBehavior named '${this.name}' already applied.`);
    }
    unbind(t, e, r) {
        const i = this.behaviorKey;
        const s = r;
        if (void 0 !== s[i]) {
            if ("function" === typeof s[i].unbind) s[i].unbind(t, e, r);
            s[i] = void 0;
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
        this.converterKey = E.keyFrom(e);
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
    evaluate(t, e, r, i) {
        const s = r.get(this.converterKey);
        if (null == s) throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        if (null !== i && "handleChange" in i) {
            const t = s.signals;
            if (null != t) {
                const e = r.get(g);
                for (let r = 0, s = t.length; r < s; ++r) e.addSignalListener(t[r], i);
            }
        }
        if ("toView" in s) return s.toView(this.expression.evaluate(t, e, r, i), ...this.args.map((s => s.evaluate(t, e, r, i))));
        return this.expression.evaluate(t, e, r, i);
    }
    assign(t, e, r, i) {
        const s = r.get(this.converterKey);
        if (null == s) throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        if ("fromView" in s) i = s.fromView(i, ...this.args.map((i => i.evaluate(t, e, r, null))));
        return this.expression.assign(t, e, r, i);
    }
    unbind(t, e, r) {
        const i = r.locator.get(this.converterKey);
        if (void 0 === i.signals) return;
        const s = r.locator.get(g);
        for (let t = 0; t < i.signals.length; ++t) s.removeSignalListener(i.signals[t], r);
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
    evaluate(t, e, r, i) {
        return this.target.assign(t, e, r, this.value.evaluate(t, e, r, i));
    }
    assign(t, e, r, i) {
        this.value.assign(t, e, r, i);
        return this.target.assign(t, e, r, i);
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
    evaluate(t, e, r, i) {
        return this.condition.evaluate(t, e, r, i) ? this.yes.evaluate(t, e, r, i) : this.no.evaluate(t, e, r, i);
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        var s;
        let n = e.overrideContext;
        let o = e;
        let h = this.ancestor;
        while (h-- && n) {
            o = o.parentScope;
            n = null !== (s = null === o || void 0 === o ? void 0 : o.overrideContext) && void 0 !== s ? s : null;
        }
        return h < 1 && n ? n.bindingContext : void 0;
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        const s = BindingContext.get(e, this.name, this.ancestor, t);
        if (null !== i) i.observe(s, this.name);
        const n = s[this.name];
        if (null == n && "$host" === this.name) throw new Error("Unable to find $host context. Did you forget [au-slot] attribute?");
        if (1 & t) return n;
        return null == n ? "" : n;
    }
    assign(t, e, r, i) {
        var s;
        if ("$host" === this.name) throw new Error("Invalid assignment. $host is a reserved keyword.");
        const n = BindingContext.get(e, this.name, this.ancestor, t);
        if (n instanceof Object) if (void 0 !== (null === (s = n.$observers) || void 0 === s ? void 0 : s[this.name])) {
            n.$observers[this.name].setValue(i, t);
            return i;
        } else return n[this.name] = i;
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
    evaluate(t, e, r, i) {
        const s = this.object.evaluate(t, e, r, (128 & t) > 0 ? null : i);
        if (1 & t) {
            if (null == s) return s;
            if (null !== i) i.observe(s, this.name);
            return s[this.name];
        }
        if (null !== i && s instanceof Object) i.observe(s, this.name);
        return s ? s[this.name] : "";
    }
    assign(t, e, r, i) {
        const s = this.object.evaluate(t, e, r, null);
        if (s instanceof Object) if (void 0 !== s.$observers && void 0 !== s.$observers[this.name]) s.$observers[this.name].setValue(i, t); else s[this.name] = i; else this.object.assign(t, e, r, {
            [this.name]: i
        });
        return i;
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
    evaluate(t, e, r, i) {
        const s = this.object.evaluate(t, e, r, (128 & t) > 0 ? null : i);
        if (s instanceof Object) {
            const n = this.key.evaluate(t, e, r, (128 & t) > 0 ? null : i);
            if (null !== i) i.observe(s, n);
            return s[n];
        }
        return;
    }
    assign(t, e, r, i) {
        const s = this.object.evaluate(t, e, r, null);
        const n = this.key.evaluate(t, e, r, null);
        return s[n] = i;
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
    evaluate(t, e, r, i) {
        const s = this.args.map((s => s.evaluate(t, e, r, i)));
        const n = BindingContext.get(e, this.name, this.ancestor, t);
        const o = O(t, n, this.name);
        if (o) return o.apply(n, s);
        return;
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        const s = this.object.evaluate(t, e, r, (128 & t) > 0 ? null : i);
        const n = this.args.map((s => s.evaluate(t, e, r, i)));
        const o = O(t, s, this.name);
        if (o) return o.apply(s, n);
        return;
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        const s = this.func.evaluate(t, e, r, i);
        if ("function" === typeof s) return s(...this.args.map((s => s.evaluate(t, e, r, i))));
        if (!(8 & t) && null == s) return;
        throw new Error(`Expression is not a function.`);
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        switch (this.operation) {
          case "&&":
            return this.left.evaluate(t, e, r, i) && this.right.evaluate(t, e, r, i);

          case "||":
            return this.left.evaluate(t, e, r, i) || this.right.evaluate(t, e, r, i);

          case "==":
            return this.left.evaluate(t, e, r, i) == this.right.evaluate(t, e, r, i);

          case "===":
            return this.left.evaluate(t, e, r, i) === this.right.evaluate(t, e, r, i);

          case "!=":
            return this.left.evaluate(t, e, r, i) != this.right.evaluate(t, e, r, i);

          case "!==":
            return this.left.evaluate(t, e, r, i) !== this.right.evaluate(t, e, r, i);

          case "instanceof":
            {
                const s = this.right.evaluate(t, e, r, i);
                if ("function" === typeof s) return this.left.evaluate(t, e, r, i) instanceof s;
                return false;
            }

          case "in":
            {
                const s = this.right.evaluate(t, e, r, i);
                if (s instanceof Object) return this.left.evaluate(t, e, r, i) in s;
                return false;
            }

          case "+":
            {
                const s = this.left.evaluate(t, e, r, i);
                const n = this.right.evaluate(t, e, r, i);
                if ((1 & t) > 0) return s + n;
                if (!s || !n) {
                    if (h(s) || h(n)) return (s || 0) + (n || 0);
                    if (a(s) || a(n)) return (s || "") + (n || "");
                }
                return s + n;
            }

          case "-":
            return this.left.evaluate(t, e, r, i) - this.right.evaluate(t, e, r, i);

          case "*":
            return this.left.evaluate(t, e, r, i) * this.right.evaluate(t, e, r, i);

          case "/":
            return this.left.evaluate(t, e, r, i) / this.right.evaluate(t, e, r, i);

          case "%":
            return this.left.evaluate(t, e, r, i) % this.right.evaluate(t, e, r, i);

          case "<":
            return this.left.evaluate(t, e, r, i) < this.right.evaluate(t, e, r, i);

          case ">":
            return this.left.evaluate(t, e, r, i) > this.right.evaluate(t, e, r, i);

          case "<=":
            return this.left.evaluate(t, e, r, i) <= this.right.evaluate(t, e, r, i);

          case ">=":
            return this.left.evaluate(t, e, r, i) >= this.right.evaluate(t, e, r, i);

          default:
            throw new Error(`Unknown binary operator: '${this.operation}'`);
        }
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        switch (this.operation) {
          case "void":
            return void this.expression.evaluate(t, e, r, i);

          case "typeof":
            return typeof this.expression.evaluate(1 | t, e, r, i);

          case "!":
            return !this.expression.evaluate(t, e, r, i);

          case "-":
            return -this.expression.evaluate(t, e, r, i);

          case "+":
            return +this.expression.evaluate(t, e, r, i);

          default:
            throw new Error(`Unknown unary operator: '${this.operation}'`);
        }
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        return this.value;
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        let s = "";
        for (let n = 0; n < this.parts.length; ++n) {
            const o = this.parts[n].evaluate(t, e, r, i);
            if (null == o) continue;
            s += o;
        }
        return s;
    }
    assign(t, e, r, i, s) {
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
    evaluate(t, e, r, i) {
        return this.elements.map((s => s.evaluate(t, e, r, i)));
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        const s = {};
        for (let n = 0; n < this.keys.length; ++n) s[this.keys[n]] = this.values[n].evaluate(t, e, r, i);
        return s;
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        let s = this.cooked[0];
        for (let n = 0; n < this.expressions.length; ++n) {
            s += String(this.expressions[n].evaluate(t, e, r, i));
            s += this.cooked[n + 1];
        }
        return s;
    }
    assign(t, e, r, i) {
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
    constructor(t, e, r, i = c) {
        this.cooked = t;
        this.func = r;
        this.expressions = i;
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
    evaluate(t, e, r, i) {
        const s = this.expressions.map((s => s.evaluate(t, e, r, i)));
        const n = this.func.evaluate(t, e, r, i);
        if ("function" !== typeof n) throw new Error(`Left-hand side of tagged template expression is not a function.`);
        return n(this.cooked, ...s);
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        return;
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        return;
    }
    assign(t, e, r, i) {
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
    evaluate(t, e, r, i) {
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
    evaluate(t, e, r, i) {
        return this.iterable.evaluate(t, e, r, i);
    }
    assign(t, e, r, i) {
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
            return S(e, r);

          case "[object Map]":
            return B(e, r);

          case "[object Set]":
            return k(e, r);

          case "[object Number]":
            return A(e, r);

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
    evaluate(t, e, r, i) {
        if (this.isMulti) {
            let s = this.parts[0];
            for (let n = 0; n < this.expressions.length; ++n) {
                s += String(this.expressions[n].evaluate(t, e, r, i));
                s += this.parts[n + 1];
            }
            return s;
        } else return `${this.parts[0]}${this.firstExpression.evaluate(t, e, r, i)}${this.parts[1]}`;
    }
    assign(t, e, r, i) {
        return;
    }
    accept(t) {
        return t.visitInterpolation(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

function O(t, e, r) {
    const i = null == e ? null : e[r];
    if ("function" === typeof i) return i;
    if (!(8 & t) && null == i) return null;
    throw new Error(`Expected '${r}' to be a function`);
}

function S(t, e) {
    for (let r = 0, i = t.length; r < i; ++r) e(t, r, t[r]);
}

function B(t, e) {
    const r = Array(t.size);
    let i = -1;
    for (const e of t.entries()) r[++i] = e;
    S(r, e);
}

function k(t, e) {
    const r = Array(t.size);
    let i = -1;
    for (const e of t.keys()) r[++i] = e;
    S(r, e);
}

function A(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    S(r, e);
}

const $ = Reflect.defineProperty;

function U(t, e, r) {
    $(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
}

function L(t, e, r, i = false) {
    if (i || !Object.prototype.hasOwnProperty.call(t, e)) U(t, e, r);
}

var T;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(T || (T = {}));

var P;

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
})(P || (P = {}));

var I;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(I || (I = {}));

var j;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(j || (j = {}));

var M;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(M || (M = {}));

var V;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(V || (V = {}));

function D(t, e) {
    const {length: r} = t;
    const i = Array(r);
    let s = 0;
    while (s < r) {
        i[s] = t[s];
        ++s;
    }
    if (void 0 !== e) i.deletedItems = e.slice(0); else if (void 0 !== t.deletedItems) i.deletedItems = t.deletedItems.slice(0); else i.deletedItems = [];
    i.isIndexMap = true;
    return i;
}

function F(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) e[r] = r++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function N(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function R(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function K(t) {
    return null == t ? q : q(t);
}

function q(t) {
    const e = t.prototype;
    $(e, "subs", {
        get: H
    });
    L(e, "subscribe", Q);
    L(e, "unsubscribe", z);
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
            let i = 0;
            for (;i < r; ++i) if (e[i] === t) return true;
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
            let i = 0;
            for (;i < r; ++i) if (e[i] === t) {
                e.splice(i, 1);
                if (1 === r) this.sf = 8 ^ (8 | this.sf);
                --this.count;
                return true;
            }
        }
        return false;
    }
    notify(t, e, r) {
        const i = this.s0;
        const s = this.s1;
        const n = this.s2;
        let o = this.sr;
        if (void 0 !== o) o = o.slice();
        if (void 0 !== i) i.handleChange(t, e, r);
        if (void 0 !== s) s.handleChange(t, e, r);
        if (void 0 !== n) n.handleChange(t, e, r);
        if (void 0 !== o) {
            const i = o.length;
            let s;
            let n = 0;
            for (;n < i; ++n) {
                s = o[n];
                if (void 0 !== s) s.handleChange(t, e, r);
            }
        }
    }
    notifyCollection(t, e) {
        const r = this.s0;
        const i = this.s1;
        const s = this.s2;
        let n = this.sr;
        if (void 0 !== n) n = n.slice();
        if (void 0 !== r) r.handleCollectionChange(t, e);
        if (void 0 !== i) i.handleCollectionChange(t, e);
        if (void 0 !== s) s.handleCollectionChange(t, e);
        if (void 0 !== n) {
            const r = n.length;
            let i;
            let s = 0;
            for (;s < r; ++s) {
                i = n[s];
                if (void 0 !== i) i.handleCollectionChange(t, e);
            }
        }
    }
}

function H() {
    const t = new SubscriberRecord;
    U(this, "subs", t);
    return t;
}

function Q(t) {
    return this.subs.add(t);
}

function z(t) {
    return this.subs.remove(t);
}

function W(t) {
    return null == t ? _ : _(t);
}

function _(t) {
    const e = t.prototype;
    $(e, "queue", {
        get: G
    });
}

class FlushQueue {
    constructor() {
        this.flushing = false;
        this.items = new Set;
    }
    get count() {
        return this.items.size;
    }
    add(t) {
        this.items.add(t);
        if (this.flushing) return;
        this.flushing = true;
        const e = this.items;
        let r;
        try {
            for (r of e) {
                e.delete(r);
                r.flush();
            }
        } finally {
            this.flushing = false;
        }
    }
    clear() {
        this.items.clear();
        this.flushing = false;
    }
}

FlushQueue.instance = new FlushQueue;

function G() {
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
        if (t !== r && u(t)) {
            if (0 === (256 & e)) this.obj.length = t;
            this.value = t;
            this.oldvalue = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    handleCollectionChange(t, e) {
        const r = this.value;
        const i = this.obj.length;
        if ((this.value = i) !== r) {
            this.oldvalue = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        Y = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, Y, this.f);
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
        const i = this.obj.size;
        if ((this.value = i) !== r) {
            this.oldvalue = r;
            this.f = e;
            this.queue.add(this);
        }
    }
    flush() {
        Y = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, Y, this.f);
    }
}

function Z(t) {
    const e = t.prototype;
    L(e, "subscribe", J, true);
    L(e, "unsubscribe", X, true);
    W(t);
    K(t);
}

function J(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function X(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

Z(CollectionLengthObserver);

Z(CollectionSizeObserver);

let Y;

const tt = new WeakMap;

function et(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function rt(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function it(t, e, r, i, s) {
    let n, o, h, a, c;
    let u, l;
    for (u = r + 1; u < i; u++) {
        n = t[u];
        o = e[u];
        for (l = u - 1; l >= r; l--) {
            h = t[l];
            a = e[l];
            c = s(h, n);
            if (c > 0) {
                t[l + 1] = h;
                e[l + 1] = a;
            } else break;
        }
        t[l + 1] = n;
        e[l + 1] = o;
    }
}

function st(t, e, r, i, s) {
    let n = 0, o = 0;
    let h, a, c;
    let u, l, f;
    let d, v, p;
    let g, b;
    let w, m, y, E;
    let x, C, O, S;
    while (true) {
        if (i - r <= 10) {
            it(t, e, r, i, s);
            return;
        }
        n = r + (i - r >> 1);
        h = t[r];
        u = e[r];
        a = t[i - 1];
        l = e[i - 1];
        c = t[n];
        f = e[n];
        d = s(h, a);
        if (d > 0) {
            g = h;
            b = u;
            h = a;
            u = l;
            a = g;
            l = b;
        }
        v = s(h, c);
        if (v >= 0) {
            g = h;
            b = u;
            h = c;
            u = f;
            c = a;
            f = l;
            a = g;
            l = b;
        } else {
            p = s(a, c);
            if (p > 0) {
                g = a;
                b = l;
                a = c;
                l = f;
                c = g;
                f = b;
            }
        }
        t[r] = h;
        e[r] = u;
        t[i - 1] = c;
        e[i - 1] = f;
        w = a;
        m = l;
        y = r + 1;
        E = i - 1;
        t[n] = t[y];
        e[n] = e[y];
        t[y] = w;
        e[y] = m;
        t: for (o = y + 1; o < E; o++) {
            x = t[o];
            C = e[o];
            O = s(x, w);
            if (O < 0) {
                t[o] = t[y];
                e[o] = e[y];
                t[y] = x;
                e[y] = C;
                y++;
            } else if (O > 0) {
                do {
                    E--;
                    if (E == o) break t;
                    S = t[E];
                    O = s(S, w);
                } while (O > 0);
                t[o] = t[E];
                e[o] = e[E];
                t[E] = x;
                e[E] = C;
                if (O < 0) {
                    x = t[o];
                    C = e[o];
                    t[o] = t[y];
                    e[o] = e[y];
                    t[y] = x;
                    e[y] = C;
                    y++;
                }
            }
        }
        if (i - E < y - r) {
            st(t, e, E, i, s);
            i = y;
        } else {
            st(t, e, r, y, s);
            r = E;
        }
    }
}

const nt = Array.prototype;

const ot = nt.push;

const ht = nt.unshift;

const at = nt.pop;

const ct = nt.shift;

const ut = nt.splice;

const lt = nt.reverse;

const ft = nt.sort;

const dt = {
    push: ot,
    unshift: ht,
    pop: at,
    shift: ct,
    splice: ut,
    reverse: lt,
    sort: ft
};

const vt = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const pt = {
    push: function(...t) {
        const e = tt.get(this);
        if (void 0 === e) return ot.apply(this, t);
        const r = this.length;
        const i = t.length;
        if (0 === i) return r;
        this.length = e.indexMap.length = r + i;
        let s = r;
        while (s < this.length) {
            this[s] = t[s - r];
            e.indexMap[s] = -2;
            s++;
        }
        e.notify();
        return this.length;
    },
    unshift: function(...t) {
        const e = tt.get(this);
        if (void 0 === e) return ht.apply(this, t);
        const r = t.length;
        const i = new Array(r);
        let s = 0;
        while (s < r) i[s++] = -2;
        ht.apply(e.indexMap, i);
        const n = ht.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = tt.get(this);
        if (void 0 === t) return at.call(this);
        const e = t.indexMap;
        const r = at.call(this);
        const i = e.length - 1;
        if (e[i] > -1) e.deletedItems.push(e[i]);
        at.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = tt.get(this);
        if (void 0 === t) return ct.call(this);
        const e = t.indexMap;
        const r = ct.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        ct.call(e);
        t.notify();
        return r;
    },
    splice: function(...t) {
        const e = t[0];
        const r = t[1];
        const i = tt.get(this);
        if (void 0 === i) return ut.apply(this, t);
        const s = this.length;
        const n = 0 | e;
        const o = n < 0 ? Math.max(s + n, 0) : Math.min(n, s);
        const h = i.indexMap;
        const a = t.length;
        const c = 0 === a ? 0 : 1 === a ? s - o : r;
        if (c > 0) {
            let t = o;
            const e = t + c;
            while (t < e) {
                if (h[t] > -1) h.deletedItems.push(h[t]);
                t++;
            }
        }
        if (a > 2) {
            const t = a - 2;
            const i = new Array(t);
            let s = 0;
            while (s < t) i[s++] = -2;
            ut.call(h, e, r, ...i);
        } else ut.apply(h, t);
        const u = ut.apply(this, t);
        i.notify();
        return u;
    },
    reverse: function() {
        const t = tt.get(this);
        if (void 0 === t) {
            lt.call(this);
            return this;
        }
        const e = this.length;
        const r = e / 2 | 0;
        let i = 0;
        while (i !== r) {
            const r = e - i - 1;
            const s = this[i];
            const n = t.indexMap[i];
            const o = this[r];
            const h = t.indexMap[r];
            this[i] = o;
            t.indexMap[i] = h;
            this[r] = s;
            t.indexMap[r] = n;
            i++;
        }
        t.notify();
        return this;
    },
    sort: function(t) {
        const e = tt.get(this);
        if (void 0 === e) {
            ft.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        st(this, e.indexMap, 0, r, rt);
        let i = 0;
        while (i < r) {
            if (void 0 === this[i]) break;
            i++;
        }
        if (void 0 === t || "function" !== typeof t) t = et;
        st(this, e.indexMap, 0, i, t);
        e.notify();
        return this;
    }
};

for (const t of vt) $(pt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let gt = false;

function bt() {
    for (const t of vt) if (true !== nt[t].observing) U(nt, t, pt[t]);
}

function wt() {
    for (const t of vt) if (true === nt[t].observing) U(nt, t, dt[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!gt) {
            gt = true;
            bt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = F(t.length);
        this.lenObs = void 0;
        tt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = F(e);
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
        const i = this.index;
        const s = r.indexMap;
        if (s[i] > -1) s.deletedItems.push(s[i]);
        s[i] = -2;
        r.collection[i] = t;
        r.notify();
    }
    handleCollectionChange(t, e) {
        const r = this.index;
        const i = t[r] === r;
        if (i) return;
        const s = this.value;
        const n = this.value = this.getValue();
        if (s !== n) this.subs.notify(n, s, e);
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.owner.unsubscribe(this);
    }
}

K(ArrayObserver);

K(ArrayIndexObserver);

function mt(t) {
    let e = tt.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function yt(t) {
    let e = 0;
    let r = 0;
    const i = t.length;
    for (let s = 0; s < i; ++s) {
        while (t.deletedItems[r] <= s - e) {
            ++r;
            --e;
        }
        if (-2 === t[s]) ++e; else t[s] += e;
    }
}

function Et(t, e) {
    const r = t.slice();
    const i = e.length;
    let s = 0;
    let n = 0;
    while (s < i) {
        n = e[s];
        if (-2 !== n) t[s] = r[n];
        ++s;
    }
}

const xt = new WeakMap;

const Ct = Set.prototype;

const Ot = Ct.add;

const St = Ct.clear;

const Bt = Ct.delete;

const kt = {
    add: Ot,
    clear: St,
    delete: Bt
};

const At = [ "add", "clear", "delete" ];

const $t = {
    add: function(t) {
        const e = xt.get(this);
        if (void 0 === e) {
            Ot.call(this, t);
            return this;
        }
        const r = this.size;
        Ot.call(this, t);
        const i = this.size;
        if (i === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = xt.get(this);
        if (void 0 === t) return St.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            St.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = xt.get(this);
        if (void 0 === e) return Bt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let i = 0;
        const s = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (s[i] > -1) s.deletedItems.push(s[i]);
                s.splice(i, 1);
                const r = Bt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            i++;
        }
        return false;
    }
};

const Ut = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of At) $($t[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Lt = false;

function Tt() {
    for (const t of At) if (true !== Ct[t].observing) $(Ct, t, {
        ...Ut,
        value: $t[t]
    });
}

function Pt() {
    for (const t of At) if (true === Ct[t].observing) $(Ct, t, {
        ...Ut,
        value: kt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!Lt) {
            Lt = true;
            Tt();
        }
        this.collection = t;
        this.indexMap = F(t.size);
        this.lenObs = void 0;
        xt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = F(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

K(SetObserver);

function It(t) {
    let e = xt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const jt = new WeakMap;

const Mt = Map.prototype;

const Vt = Mt.set;

const Dt = Mt.clear;

const Ft = Mt.delete;

const Nt = {
    set: Vt,
    clear: Dt,
    delete: Ft
};

const Rt = [ "set", "clear", "delete" ];

const Kt = {
    set: function(t, e) {
        const r = jt.get(this);
        if (void 0 === r) {
            Vt.call(this, t, e);
            return this;
        }
        const i = this.get(t);
        const s = this.size;
        Vt.call(this, t, e);
        const n = this.size;
        if (n === s) {
            let e = 0;
            for (const s of this.entries()) {
                if (s[0] === t) {
                    if (s[1] !== i) {
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
        r.indexMap[s] = -2;
        r.notify();
        return this;
    },
    clear: function() {
        const t = jt.get(this);
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
        const e = jt.get(this);
        if (void 0 === e) return Ft.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let i = 0;
        const s = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (s[i] > -1) s.deletedItems.push(s[i]);
                s.splice(i, 1);
                const r = Ft.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++i;
        }
        return false;
    }
};

const qt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of Rt) $(Kt[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Ht = false;

function Qt() {
    for (const t of Rt) if (true !== Mt[t].observing) $(Mt, t, {
        ...qt,
        value: Kt[t]
    });
}

function zt() {
    for (const t of Rt) if (true === Mt[t].observing) $(Mt, t, {
        ...qt,
        value: Nt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!Ht) {
            Ht = true;
            Qt();
        }
        this.collection = t;
        this.indexMap = F(t.size);
        this.lenObs = void 0;
        jt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = F(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

K(MapObserver);

function Wt(t) {
    let e = jt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function _t(t, e) {
    const r = this.observerLocator.getObserver(t, e);
    this.obs.add(r);
}

function Gt() {
    const t = new BindingObserverRecord(this);
    U(this, "obs", t);
    return t;
}

function Zt(t) {
    let e;
    if (t instanceof Array) e = mt(t); else if (t instanceof Set) e = It(t); else if (t instanceof Map) e = Wt(t); else throw new Error("Unrecognised collection type.");
    this.obs.add(e);
}

function Jt(t) {
    this.obs.add(t);
}

function Xt() {
    throw new Error('method "handleChange" not implemented');
}

function Yt() {
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
        let i;
        let s = 0;
        if (true === t) {
            for (;s < e; ++s) {
                r = `o${s}`;
                i = this[r];
                if (void 0 !== i) {
                    this[r] = void 0;
                    i.unsubscribe(this);
                }
            }
            this.count = this.slots = 0;
        } else for (;s < e; ++s) if (this[`v${s}`] !== this.version) {
            r = `o${s}`;
            i = this[r];
            if (void 0 !== i) {
                this[r] = void 0;
                i.unsubscribe(this);
                this.count--;
            }
        }
    }
}

function te(t) {
    const e = t.prototype;
    L(e, "observe", _t, true);
    L(e, "observeCollection", Zt, true);
    L(e, "subscribeTo", Jt, true);
    $(e, "obs", {
        get: Gt
    });
    L(e, "handleChange", Xt);
    L(e, "handleCollectionChange", Yt);
    return t;
}

function ee(t) {
    return null == t ? te : te(t);
}

class BindingMediator {
    constructor(t, e, r, i) {
        this.key = t;
        this.binding = e;
        this.observerLocator = r;
        this.locator = i;
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

te(BindingMediator);

const re = i.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

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
        pe.input = t;
        pe.length = t.length;
        pe.index = 0;
        pe.currentChar = t.charCodeAt(0);
        return be(pe, 0, 61, void 0 === e ? 53 : e);
    }
}

var ie;

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
})(ie || (ie = {}));

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

var ne;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(ne || (ne = {}));

var oe;

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
})(oe || (oe = {}));

var he;

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
})(he || (he = {}));

const ae = PrimitiveLiteralExpression.$false;

const ce = PrimitiveLiteralExpression.$true;

const ue = PrimitiveLiteralExpression.$null;

const le = PrimitiveLiteralExpression.$undefined;

const fe = AccessThisExpression.$this;

const de = AccessThisExpression.$parent;

var ve;

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
})(ve || (ve = {}));

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

const pe = new ParserState("");

function ge(t, e) {
    pe.input = t;
    pe.length = t.length;
    pe.index = 0;
    pe.currentChar = t.charCodeAt(0);
    return be(pe, 0, 61, void 0 === e ? 53 : e);
}

function be(t, e, r, i) {
    if (284 === i) return new CustomExpression(t.input);
    if (0 === t.index) {
        if (2048 & i) return Ee(t);
        Ce(t);
        if (1048576 & t.currentToken) throw new Error(`Invalid start of expression: '${t.input}'`);
    }
    t.assignable = 448 > r;
    let s;
    if (32768 & t.currentToken) {
        const r = Te[63 & t.currentToken];
        Ce(t);
        s = new UnaryExpression(r, be(t, e, 449, i));
        t.assignable = false;
    } else {
        t: switch (t.currentToken) {
          case 3078:
            t.assignable = false;
            do {
                Ce(t);
                e++;
                if (Ue(t, 16393)) {
                    if (16393 === t.currentToken) throw new Error(`Double dot and spread operators are not supported: '${t.input}'`); else if (1572864 === t.currentToken) throw new Error(`Expected identifier: '${t.input}'`);
                } else if (524288 & t.currentToken) {
                    const t = 511 & e;
                    s = 0 === t ? fe : 1 === t ? de : new AccessThisExpression(t);
                    e = 512;
                    break t;
                } else throw new Error(`Invalid member expression: '${t.input}'`);
            } while (3078 === t.currentToken);

          case 1024:
            if (512 & i) s = new BindingIdentifier(t.tokenValue); else {
                s = new AccessScopeExpression(t.tokenValue, 511 & e);
                e = 1024;
            }
            t.assignable = true;
            Ce(t);
            break;

          case 3076:
            t.assignable = false;
            Ce(t);
            s = fe;
            e = 512;
            break;

          case 671751:
            Ce(t);
            s = be(t, 0, 62, i);
            Le(t, 1835019);
            e = 0;
            break;

          case 671757:
            s = we(t, e, i);
            e = 0;
            break;

          case 131080:
            s = ye(t, i);
            e = 0;
            break;

          case 540714:
            s = new TemplateExpression([ t.tokenValue ]);
            t.assignable = false;
            Ce(t);
            e = 0;
            break;

          case 540715:
            s = xe(t, e, i, s, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            s = new PrimitiveLiteralExpression(t.tokenValue);
            t.assignable = false;
            Ce(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            s = Te[63 & t.currentToken];
            t.assignable = false;
            Ce(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`Unexpected end of expression: '${t.input}'`); else throw new Error(`Unconsumed token: '${t.input}'`);
        }
        if (512 & i) return me(t, s);
        if (449 < r) return s;
        let n = t.tokenValue;
        while ((16384 & t.currentToken) > 0) {
            const r = [];
            let o;
            switch (t.currentToken) {
              case 16393:
                t.assignable = true;
                Ce(t);
                if (0 === (3072 & t.currentToken)) throw new Error(`Expected identifier: '${t.input}'`);
                n = t.tokenValue;
                Ce(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.currentToken) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) s = new AccessScopeExpression(n, s.ancestor); else s = new AccessMemberExpression(s, n);
                continue;

              case 671757:
                t.assignable = true;
                Ce(t);
                e = 4096;
                s = new AccessKeyedExpression(s, be(t, 0, 62, i));
                Le(t, 1835022);
                break;

              case 671751:
                t.assignable = false;
                Ce(t);
                while (1835019 !== t.currentToken) {
                    r.push(be(t, 0, 62, i));
                    if (!Ue(t, 1572876)) break;
                }
                Le(t, 1835019);
                if (1024 & e) s = new CallScopeExpression(n, r, s.ancestor); else if (2048 & e) s = new CallMemberExpression(s, n, r); else s = new CallFunctionExpression(s, r);
                e = 0;
                break;

              case 540714:
                t.assignable = false;
                o = [ t.tokenValue ];
                s = new TaggedTemplateExpression(o, o, s);
                Ce(t);
                break;

              case 540715:
                s = xe(t, e, i, s, true);
            }
        }
    }
    if (448 < r) return s;
    while ((65536 & t.currentToken) > 0) {
        const n = t.currentToken;
        if ((448 & n) <= r) break;
        Ce(t);
        s = new BinaryExpression(Te[63 & n], s, be(t, e, 448 & n, i));
        t.assignable = false;
    }
    if (63 < r) return s;
    if (Ue(t, 1572880)) {
        const r = be(t, e, 62, i);
        Le(t, 1572879);
        s = new ConditionalExpression(s, r, be(t, e, 62, i));
        t.assignable = false;
    }
    if (62 < r) return s;
    if (Ue(t, 1048616)) {
        if (!t.assignable) throw new Error(`Left hand side of expression is not assignable: '${t.input}'`);
        s = new AssignExpression(s, be(t, e, 62, i));
    }
    if (61 < r) return s;
    while (Ue(t, 1572884)) {
        if (1572864 === t.currentToken) throw new Error(`Expected identifier to come after ValueConverter operator: '${t.input}'`);
        const r = t.tokenValue;
        Ce(t);
        const n = new Array;
        while (Ue(t, 1572879)) n.push(be(t, e, 62, i));
        s = new ValueConverterExpression(s, r, n);
    }
    while (Ue(t, 1572883)) {
        if (1572864 === t.currentToken) throw new Error(`Expected identifier to come after BindingBehavior operator: '${t.input}'`);
        const r = t.tokenValue;
        Ce(t);
        const n = new Array;
        while (Ue(t, 1572879)) n.push(be(t, e, 62, i));
        s = new BindingBehaviorExpression(s, r, n);
    }
    if (1572864 !== t.currentToken) {
        if (2048 & i) return s;
        if ("of" === t.tokenRaw) throw new Error(`Unexpected keyword "of": '${t.input}'`);
        throw new Error(`Unconsumed token: '${t.input}'`);
    }
    return s;
}

function we(t, e, r) {
    Ce(t);
    const i = new Array;
    while (1835022 !== t.currentToken) if (Ue(t, 1572876)) {
        i.push(le);
        if (1835022 === t.currentToken) break;
    } else {
        i.push(be(t, e, 62, ~512 & r));
        if (Ue(t, 1572876)) {
            if (1835022 === t.currentToken) break;
        } else break;
    }
    Le(t, 1835022);
    if (512 & r) return new ArrayBindingPattern(i); else {
        t.assignable = false;
        return new ArrayLiteralExpression(i);
    }
}

function me(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${t.input}'`);
    if (1051180 !== t.currentToken) throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${t.input}'`);
    Ce(t);
    const r = e;
    const i = be(t, 0, 61, 0);
    return new ForOfStatement(r, i);
}

function ye(t, e) {
    const r = new Array;
    const i = new Array;
    Ce(t);
    while (1835018 !== t.currentToken) {
        r.push(t.tokenValue);
        if (12288 & t.currentToken) {
            Ce(t);
            Le(t, 1572879);
            i.push(be(t, 0, 62, ~512 & e));
        } else if (3072 & t.currentToken) {
            const {currentChar: r, currentToken: s, index: n} = t;
            Ce(t);
            if (Ue(t, 1572879)) i.push(be(t, 0, 62, ~512 & e)); else {
                t.currentChar = r;
                t.currentToken = s;
                t.index = n;
                i.push(be(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`Invalid or unsupported property definition in object literal: '${t.input}'`);
        if (1835018 !== t.currentToken) Le(t, 1572876);
    }
    Le(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(r, i); else {
        t.assignable = false;
        return new ObjectLiteralExpression(r, i);
    }
}

function Ee(t) {
    const e = [];
    const r = [];
    const i = t.length;
    let s = "";
    while (t.index < i) {
        switch (t.currentChar) {
          case 36:
            if (123 === t.input.charCodeAt(t.index + 1)) {
                e.push(s);
                s = "";
                t.index += 2;
                t.currentChar = t.input.charCodeAt(t.index);
                Ce(t);
                const i = be(t, 0, 61, 2048);
                r.push(i);
                continue;
            } else s += "$";
            break;

          case 92:
            s += String.fromCharCode(se(Oe(t)));
            break;

          default:
            s += String.fromCharCode(t.currentChar);
        }
        Oe(t);
    }
    if (r.length) {
        e.push(s);
        return new Interpolation(e, r);
    }
    return null;
}

function xe(t, e, r, i, s) {
    const n = [ t.tokenValue ];
    Le(t, 540715);
    const o = [ be(t, e, 62, r) ];
    while (540714 !== (t.currentToken = $e(t))) {
        n.push(t.tokenValue);
        Le(t, 540715);
        o.push(be(t, e, 62, r));
    }
    n.push(t.tokenValue);
    t.assignable = false;
    if (s) {
        Ce(t);
        return new TaggedTemplateExpression(n, n, i, o);
    } else {
        Ce(t);
        return new TemplateExpression(n, o);
    }
}

function Ce(t) {
    while (t.index < t.length) {
        t.startIndex = t.index;
        if (null != (t.currentToken = Ne[t.currentChar](t))) return;
    }
    t.currentToken = 1572864;
}

function Oe(t) {
    return t.currentChar = t.input.charCodeAt(++t.index);
}

function Se(t) {
    while (Fe[Oe(t)]) ;
    const e = Pe[t.tokenValue = t.tokenRaw];
    return void 0 === e ? 1024 : e;
}

function Be(t, e) {
    let r = t.currentChar;
    if (false === e) {
        do {
            r = Oe(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.tokenValue = parseInt(t.tokenRaw, 10);
            return 8192;
        }
        r = Oe(t);
        if (t.index >= t.length) {
            t.tokenValue = parseInt(t.tokenRaw.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = Oe(t);
    } while (r <= 57 && r >= 48); else t.currentChar = t.input.charCodeAt(--t.index);
    t.tokenValue = parseFloat(t.tokenRaw);
    return 8192;
}

function ke(t) {
    const e = t.currentChar;
    Oe(t);
    let r = 0;
    const i = new Array;
    let s = t.index;
    while (t.currentChar !== e) if (92 === t.currentChar) {
        i.push(t.input.slice(s, t.index));
        Oe(t);
        r = se(t.currentChar);
        Oe(t);
        i.push(String.fromCharCode(r));
        s = t.index;
    } else if (t.index >= t.length) throw new Error(`Unterminated quote in string literal: '${t.input}'`); else Oe(t);
    const n = t.input.slice(s, t.index);
    Oe(t);
    i.push(n);
    const o = i.join("");
    t.tokenValue = o;
    return 4096;
}

function Ae(t) {
    let e = true;
    let r = "";
    while (96 !== Oe(t)) if (36 === t.currentChar) if (t.index + 1 < t.length && 123 === t.input.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.currentChar) r += String.fromCharCode(se(Oe(t))); else {
        if (t.index >= t.length) throw new Error(`Unterminated template string: '${t.input}'`);
        r += String.fromCharCode(t.currentChar);
    }
    Oe(t);
    t.tokenValue = r;
    if (e) return 540714;
    return 540715;
}

function $e(t) {
    if (t.index >= t.length) throw new Error(`Unterminated template string: '${t.input}'`);
    t.index--;
    return Ae(t);
}

function Ue(t, e) {
    if (t.currentToken === e) {
        Ce(t);
        return true;
    }
    return false;
}

function Le(t, e) {
    if (t.currentToken === e) Ce(t); else throw new Error(`Missing expected token: '${t.input}'`);
}

const Te = [ ae, ce, ue, le, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Pe = Object.create(null);

Pe.true = 2049;

Pe.null = 2050;

Pe.false = 2048;

Pe.undefined = 2051;

Pe.$this = 3076;

Pe.$parent = 3078;

Pe.in = 1640799;

Pe.instanceof = 1640800;

Pe.typeof = 34851;

Pe.void = 34852;

Pe.of = 1051180;

const Ie = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function je(t, e, r, i) {
    const s = r.length;
    for (let n = 0; n < s; n += 2) {
        const s = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : s + 1;
        if (t) t.fill(i, s, o);
        if (e) for (let t = s; t < o; t++) e.add(t);
    }
}

function Me(t) {
    return e => {
        Oe(e);
        return t;
    };
}

const Ve = t => {
    throw new Error(`Unexpected character: '${t.input}'`);
};

Ve.notMapped = true;

const De = new Set;

je(null, De, Ie.AsciiIdPart, true);

const Fe = new Uint8Array(65535);

je(Fe, null, Ie.IdStart, 1);

je(Fe, null, Ie.Digit, 1);

const Ne = new Array(65535);

Ne.fill(Ve, 0, 65535);

je(Ne, null, Ie.Skip, (t => {
    Oe(t);
    return null;
}));

je(Ne, null, Ie.IdStart, Se);

je(Ne, null, Ie.Digit, (t => Be(t, false)));

Ne[34] = Ne[39] = t => ke(t);

Ne[96] = t => Ae(t);

Ne[33] = t => {
    if (61 !== Oe(t)) return 32809;
    if (61 !== Oe(t)) return 1638680;
    Oe(t);
    return 1638682;
};

Ne[61] = t => {
    if (61 !== Oe(t)) return 1048616;
    if (61 !== Oe(t)) return 1638679;
    Oe(t);
    return 1638681;
};

Ne[38] = t => {
    if (38 !== Oe(t)) return 1572883;
    Oe(t);
    return 1638614;
};

Ne[124] = t => {
    if (124 !== Oe(t)) return 1572884;
    Oe(t);
    return 1638549;
};

Ne[46] = t => {
    if (Oe(t) <= 57 && t.currentChar >= 48) return Be(t, true);
    return 16393;
};

Ne[60] = t => {
    if (61 !== Oe(t)) return 1638747;
    Oe(t);
    return 1638749;
};

Ne[62] = t => {
    if (61 !== Oe(t)) return 1638748;
    Oe(t);
    return 1638750;
};

Ne[37] = Me(1638886);

Ne[40] = Me(671751);

Ne[41] = Me(1835019);

Ne[42] = Me(1638885);

Ne[43] = Me(623009);

Ne[44] = Me(1572876);

Ne[45] = Me(623010);

Ne[47] = Me(1638887);

Ne[58] = Me(1572879);

Ne[63] = Me(1572880);

Ne[91] = Me(671757);

Ne[93] = Me(1835022);

Ne[123] = Me(131080);

Ne[125] = Me(1835018);

let Re = null;

const Ke = [];

let qe = false;

function He() {
    qe = false;
}

function Qe() {
    qe = true;
}

function ze() {
    return Re;
}

function We(t) {
    if (null == t) throw new Error("Connectable cannot be null/undefined");
    if (null == Re) {
        Re = t;
        Ke[0] = Re;
        qe = true;
        return;
    }
    if (Re === t) throw new Error(`Trying to enter an active connectable`);
    Ke.push(Re);
    Re = t;
    qe = true;
}

function _e(t) {
    if (null == t) throw new Error("Connectable cannot be null/undefined");
    if (Re !== t) throw new Error(`Trying to exit an unactive connectable`);
    Ke.pop();
    Re = Ke.length > 0 ? Ke[Ke.length - 1] : null;
    qe = null != Re;
}

const Ge = Object.freeze({
    get current() {
        return Re;
    },
    get connecting() {
        return qe;
    },
    enter: We,
    exit: _e,
    pause: He,
    resume: Qe
});

const Ze = Reflect.get;

const Je = Object.prototype.toString;

const Xe = new WeakMap;

function Ye(t) {
    switch (Je.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const tr = "__raw__";

function er(t) {
    return Ye(t) ? rr(t) : t;
}

function rr(t) {
    var e;
    return null !== (e = Xe.get(t)) && void 0 !== e ? e : or(t);
}

function ir(t) {
    var e;
    return null !== (e = t[tr]) && void 0 !== e ? e : t;
}

function sr(t) {
    return Ye(t) && t[tr] || t;
}

function nr(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function or(t) {
    const e = t instanceof Array ? ar : t instanceof Map || t instanceof Set ? Lr : hr;
    const r = new Proxy(t, e);
    Xe.set(t, r);
    return r;
}

const hr = {
    get(t, e, r) {
        if (e === tr) return t;
        const i = ze();
        if (!qe || nr(e) || null == i) return Ze(t, e, r);
        i.observe(t, e);
        return er(Ze(t, e, r));
    }
};

const ar = {
    get(t, e, r) {
        if (e === tr) return t;
        const i = ze();
        if (!qe || nr(e) || null == i) return Ze(t, e, r);
        switch (e) {
          case "length":
            i.observe(t, "length");
            return t.length;

          case "map":
            return cr;

          case "includes":
            return fr;

          case "indexOf":
            return dr;

          case "lastIndexOf":
            return vr;

          case "every":
            return ur;

          case "filter":
            return lr;

          case "find":
            return gr;

          case "findIndex":
            return pr;

          case "flat":
            return br;

          case "flatMap":
            return wr;

          case "join":
            return mr;

          case "push":
            return Er;

          case "pop":
            return yr;

          case "reduce":
            return $r;

          case "reduceRight":
            return Ur;

          case "reverse":
            return Sr;

          case "shift":
            return xr;

          case "unshift":
            return Cr;

          case "slice":
            return Ar;

          case "splice":
            return Or;

          case "some":
            return Br;

          case "sort":
            return kr;

          case "keys":
            return Fr;

          case "values":
          case Symbol.iterator:
            return Nr;

          case "entries":
            return Rr;
        }
        i.observe(t, e);
        return er(Ze(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = ze()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function cr(t, e) {
    var r;
    const i = ir(this);
    const s = i.map(((r, i) => sr(t.call(e, er(r), i, this))));
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return er(s);
}

function ur(t, e) {
    var r;
    const i = ir(this);
    const s = i.every(((r, i) => t.call(e, er(r), i, this)));
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return s;
}

function lr(t, e) {
    var r;
    const i = ir(this);
    const s = i.filter(((r, i) => sr(t.call(e, er(r), i, this))));
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return er(s);
}

function fr(t) {
    var e;
    const r = ir(this);
    const i = r.includes(sr(t));
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return i;
}

function dr(t) {
    var e;
    const r = ir(this);
    const i = r.indexOf(sr(t));
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return i;
}

function vr(t) {
    var e;
    const r = ir(this);
    const i = r.lastIndexOf(sr(t));
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return i;
}

function pr(t, e) {
    var r;
    const i = ir(this);
    const s = i.findIndex(((r, i) => sr(t.call(e, er(r), i, this))));
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return s;
}

function gr(t, e) {
    var r;
    const i = ir(this);
    const s = i.find(((e, r) => t(er(e), r, this)), e);
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return er(s);
}

function br() {
    var t;
    const e = ir(this);
    null === (t = ze()) || void 0 === t ? void 0 : t.observeCollection(e);
    return er(e.flat());
}

function wr(t, e) {
    var r;
    const i = ir(this);
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return rr(i.flatMap(((r, i) => er(t.call(e, er(r), i, this)))));
}

function mr(t) {
    var e;
    const r = ir(this);
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function yr() {
    return er(ir(this).pop());
}

function Er(...t) {
    return ir(this).push(...t);
}

function xr() {
    return er(ir(this).shift());
}

function Cr(...t) {
    return ir(this).unshift(...t);
}

function Or(...t) {
    return er(ir(this).splice(...t));
}

function Sr(...t) {
    var e;
    const r = ir(this);
    const i = r.reverse();
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return er(i);
}

function Br(t, e) {
    var r;
    const i = ir(this);
    const s = i.some(((r, i) => sr(t.call(e, er(r), i, this))));
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return s;
}

function kr(t) {
    var e;
    const r = ir(this);
    const i = r.sort(t);
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return er(i);
}

function Ar(t, e) {
    var r;
    const i = ir(this);
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return rr(i.slice(t, e));
}

function $r(t, e) {
    var r;
    const i = ir(this);
    const s = i.reduce(((e, r, i) => t(e, er(r), i, this)), e);
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return er(s);
}

function Ur(t, e) {
    var r;
    const i = ir(this);
    const s = i.reduceRight(((e, r, i) => t(e, er(r), i, this)), e);
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return er(s);
}

const Lr = {
    get(t, e, r) {
        if (e === tr) return t;
        const i = ze();
        if (!qe || nr(e) || null == i) return Ze(t, e, r);
        switch (e) {
          case "size":
            i.observe(t, "size");
            return t.size;

          case "clear":
            return Vr;

          case "delete":
            return Dr;

          case "forEach":
            return Tr;

          case "add":
            if (t instanceof Set) return Mr;
            break;

          case "get":
            if (t instanceof Map) return Ir;
            break;

          case "set":
            if (t instanceof Map) return jr;
            break;

          case "has":
            return Pr;

          case "keys":
            return Fr;

          case "values":
            return Nr;

          case "entries":
            return Rr;

          case Symbol.iterator:
            return t instanceof Map ? Rr : Nr;
        }
        return er(Ze(t, e, r));
    }
};

function Tr(t, e) {
    var r;
    const i = ir(this);
    null === (r = ze()) || void 0 === r ? void 0 : r.observeCollection(i);
    return i.forEach(((r, i) => {
        t.call(e, er(r), er(i), this);
    }));
}

function Pr(t) {
    var e;
    const r = ir(this);
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(sr(t));
}

function Ir(t) {
    var e;
    const r = ir(this);
    null === (e = ze()) || void 0 === e ? void 0 : e.observeCollection(r);
    return er(r.get(sr(t)));
}

function jr(t, e) {
    return er(ir(this).set(sr(t), sr(e)));
}

function Mr(t) {
    return er(ir(this).add(sr(t)));
}

function Vr() {
    return er(ir(this).clear());
}

function Dr(t) {
    return er(ir(this).delete(sr(t)));
}

function Fr() {
    var t;
    const e = ir(this);
    null === (t = ze()) || void 0 === t ? void 0 : t.observeCollection(e);
    const r = e.keys();
    return {
        next() {
            const t = r.next();
            const e = t.value;
            const i = t.done;
            return i ? {
                value: void 0,
                done: i
            } : {
                value: er(e),
                done: i
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Nr() {
    var t;
    const e = ir(this);
    null === (t = ze()) || void 0 === t ? void 0 : t.observeCollection(e);
    const r = e.values();
    return {
        next() {
            const t = r.next();
            const e = t.value;
            const i = t.done;
            return i ? {
                value: void 0,
                done: i
            } : {
                value: er(e),
                done: i
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function Rr() {
    var t;
    const e = ir(this);
    null === (t = ze()) || void 0 === t ? void 0 : t.observeCollection(e);
    const r = e.entries();
    return {
        next() {
            const t = r.next();
            const e = t.value;
            const i = t.done;
            return i ? {
                value: void 0,
                done: i
            } : {
                value: [ er(e[0]), er(e[1]) ],
                done: i
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const Kr = Object.freeze({
    getProxy: rr,
    getRaw: ir,
    wrap: er,
    unwrap: sr,
    rawKey: tr
});

class ComputedObserver {
    constructor(t, e, r, i, s) {
        this.obj = t;
        this.get = e;
        this.set = r;
        this.useProxy = i;
        this.observerLocator = s;
        this.interceptor = this;
        this.type = 1;
        this.value = void 0;
        this.oldValue = void 0;
        this.running = false;
        this.isDirty = false;
    }
    static create(t, e, r, i, s) {
        const n = r.get;
        const o = r.set;
        const h = new ComputedObserver(t, n, o, s, i);
        const a = () => h.getValue();
        a.getObserver = () => h;
        $(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: a,
            set: t => {
                h.setValue(t, 0);
            }
        });
        return h;
    }
    getValue() {
        if (0 === this.subs.count) return this.get.call(this.obj, this);
        if (this.isDirty) {
            this.compute();
            this.isDirty = false;
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
        this.isDirty = true;
        if (this.subs.count > 0) this.run();
    }
    handleCollectionChange() {
        this.isDirty = true;
        if (this.subs.count > 0) this.run();
    }
    subscribe(t) {
        if (this.subs.add(t) && 1 === this.subs.count) {
            this.compute();
            this.isDirty = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) {
            this.isDirty = true;
            this.obs.clear(true);
        }
    }
    flush() {
        qr = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, qr, 0);
    }
    run() {
        if (this.running) return;
        const t = this.value;
        const e = this.compute();
        this.isDirty = false;
        if (!Object.is(e, t)) {
            this.oldValue = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            We(this);
            return this.value = sr(this.get.call(this.useProxy ? er(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            _e(this);
        }
    }
}

ee(ComputedObserver);

K(ComputedObserver);

W(ComputedObserver);

let qr;

const Hr = i.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Qr = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const zr = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.platform = t;
        this.tracked = [];
        this.task = null;
        this.elapsedFrames = 0;
        this.check = () => {
            if (Qr.disabled) return;
            if (++this.elapsedFrames < Qr.timeoutsPerCheck) return;
            this.elapsedFrames = 0;
            const t = this.tracked;
            const e = t.length;
            let r;
            let i = 0;
            for (;i < e; ++i) {
                r = t[i];
                if (r.isDirty()) this.queue.add(r);
            }
        };
    }
    createProperty(t, e) {
        if (Qr.throw) throw new Error(`Property '${e}' is being dirty-checked.`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.task = this.platform.taskQueue.queueTask(this.check, zr);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.task.cancel();
            this.task = null;
        }
    }
}

DirtyChecker.inject = [ l ];

W(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.dirtyChecker = t;
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
            this.dirtyChecker.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.dirtyChecker.removeProperty(this);
    }
}

K(DirtyCheckProperty);

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
    setValue(t, e, r, i) {
        r[i] = t;
    }
}

let Wr;

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
        Wr = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, Wr, this.f);
    }
    start() {
        if (false === this.observing) {
            this.observing = true;
            this.value = this.obj[this.propertyKey];
            $(this.obj, this.propertyKey, {
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
            $(this.obj, this.propertyKey, {
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
    constructor(t, e, r, i) {
        this.type = 1;
        this.v = void 0;
        this.oV = void 0;
        this.f = 0;
        this.obj = t;
        this.s = r;
        const s = t[e];
        this.cb = "function" === typeof s ? s : void 0;
        this.v = i;
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
        Wr = this.oV;
        this.oV = this.v;
        this.subs.notify(this.v, Wr, this.f);
    }
}

K(SetterObserver);

K(SetterNotifier);

W(SetterObserver);

W(SetterNotifier);

const _r = new PropertyAccessor;

const Gr = i.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const Zr = i.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
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
        return _r;
    }
    getAccessor() {
        return _r;
    }
}

class ObserverLocator {
    constructor(t, e) {
        this.dirtyChecker = t;
        this.nodeObserverLocator = e;
        this.adapters = [];
    }
    addAdapter(t) {
        this.adapters.push(t);
    }
    getObserver(t, e) {
        var r, i;
        return null !== (i = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== i ? i : this.cache(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const i = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== i) return i;
        if (this.nodeObserverLocator.handles(t, e, this)) return this.nodeObserverLocator.getAccessor(t, e, this);
        return _r;
    }
    getArrayObserver(t) {
        return mt(t);
    }
    getMapObserver(t) {
        return Wt(t);
    }
    getSetObserver(t) {
        return It(t);
    }
    createObserver(t, e) {
        var r, i, s, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.nodeObserverLocator.handles(t, e, this)) return this.nodeObserverLocator.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return mt(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return Wt(t).getLengthObserver(); else if (t instanceof Set) return It(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && u(e)) return mt(t).getIndexObserver(Number(e));
            break;
        }
        let o = Object.getOwnPropertyDescriptor(t, e);
        if (void 0 === o) {
            let r = Object.getPrototypeOf(t);
            while (null !== r) {
                o = Object.getOwnPropertyDescriptor(r, e);
                if (void 0 === o) r = Object.getPrototypeOf(r); else break;
            }
        }
        if (void 0 !== o && !Object.prototype.hasOwnProperty.call(o, "value")) {
            let h = this.getAdapterObserver(t, e, o);
            if (null == h) h = null === (n = null !== (i = null === (r = o.get) || void 0 === r ? void 0 : r.getObserver) && void 0 !== i ? i : null === (s = o.set) || void 0 === s ? void 0 : s.getObserver) || void 0 === n ? void 0 : n(t, this);
            return null == h ? o.configurable ? ComputedObserver.create(t, e, o, this, true) : this.dirtyChecker.createProperty(t, e) : h;
        }
        return new SetterObserver(t, e);
    }
    getAdapterObserver(t, e, r) {
        if (this.adapters.length > 0) for (const i of this.adapters) {
            const s = i.getObserver(t, e, r, this);
            if (null != s) return s;
        }
        return null;
    }
    cache(t, e, r) {
        if (true === r.doNotCache) return r;
        if (void 0 === t.$observers) {
            $(t, "$observers", {
                value: {
                    [e]: r
                }
            });
            return r;
        }
        return t.$observers[e] = r;
    }
}

ObserverLocator.inject = [ Hr, Zr ];

function Jr(t) {
    let e;
    if (t instanceof Array) e = mt(t); else if (t instanceof Map) e = Wt(t); else if (t instanceof Set) e = It(t);
    return e;
}

const Xr = i.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.observerLocator = t;
    }
    static get inject() {
        return [ Gr ];
    }
    run(t) {
        const e = new Effect(this.observerLocator, t);
        e.run();
        return e;
    }
}

class Effect {
    constructor(t, e) {
        this.observerLocator = t;
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
            We(this);
            this.fn(this);
        } finally {
            this.obs.clear(false);
            this.running = false;
            _e(this);
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

ee(Effect);

function Yr(t) {
    if (void 0 === t.$observers) $(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const ti = {};

function ei(t, e, r) {
    if (null == e) return (e, r, s) => i(e, r, s, t);
    return i(t, e, r);
    function i(t, e, r, i) {
        var s;
        const n = void 0 === e;
        i = "object" !== typeof i ? {
            name: i
        } : i || {};
        if (n) e = i.name;
        if (null == e || "" === e) throw new Error("Invalid usage, cannot determine property name for @observable");
        const o = i.callback || `${String(e)}Changed`;
        let h = ti;
        if (r) {
            delete r.value;
            delete r.writable;
            h = null === (s = r.initializer) || void 0 === s ? void 0 : s.call(r);
            delete r.initializer;
        } else r = {
            configurable: true
        };
        if (!("enumerable" in r)) r.enumerable = true;
        const a = i.set;
        r.get = function t() {
            var r;
            const i = ri(this, e, o, h, a);
            null === (r = ze()) || void 0 === r ? void 0 : r.subscribeTo(i);
            return i.getValue();
        };
        r.set = function t(r) {
            ri(this, e, o, h, a).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return ri(r, e, o, h, a);
        };
        if (n) $(t.prototype, e, r); else return r;
    }
}

function ri(t, e, r, i, s) {
    const n = Yr(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, s, i === ti ? void 0 : i);
        n[e] = o;
    }
    return o;
}

export { ne as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, V as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, m as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, b as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, T as BindingMode, BindingObserverRecord, ve as BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, ie as Char, M as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, Ge as ConnectableSwitcher, CustomExpression, j as DelegationStrategy, DirtyCheckProperty, Qr as DirtyCheckSettings, x as ExpressionKind, FlushQueue, ForOfStatement, HtmlLiteralExpression, Hr as IDirtyChecker, re as IExpressionParser, Zr as INodeObserverLocator, Xr as IObservation, Gr as IObserverLocator, g as ISignaler, Interpolation, P as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, oe as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Kr as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, E as ValueConverter, ValueConverterDefinition, ValueConverterExpression, d as alias, yt as applyMutationsToIndices, w as bindingBehavior, N as cloneIndexMap, ee as connectable, D as copyIndexMap, F as createIndexMap, wt as disableArrayObservation, zt as disableMapObservation, Pt as disableSetObservation, bt as enableArrayObservation, Qt as enableMapObservation, Tt as enableSetObservation, Jr as getCollectionObserver, R as isIndexMap, ei as observable, be as parse, ge as parseExpression, v as registerAliases, K as subscriberCollection, Et as synchronizeIndices, y as valueConverter, W as withFlushQueue };
//# sourceMappingURL=index.js.map
