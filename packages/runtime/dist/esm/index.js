import { Protocol as t, Metadata as e, Registration as r, DI as i, firstDefined as s, mergeArrays as n, fromAnnotationOrDefinitionOrTypeOrDefault as o, isNumberOrBigInt as h, isStringOrDate as c, emptyArray as u, isArrayIndex as a, IPlatform as l, ILogger as f } from "@aurelia/kernel";

export { IPlatform } from "@aurelia/kernel";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "@aurelia/platform";

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
        let i;
        for (i of r.keys()) i.handleChange(void 0, void 0, e);
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
        return y.define(t, e);
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
        return new BindingBehaviorDefinition(e, s(y.getAnnotation(e, "name"), r), n(y.getAnnotation(e, "aliases"), i.aliases, e.aliases), y.keyFrom(r), o("strategy", i, e, (() => h ? 2 : 1)));
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
        v(s, y, i, t);
    }
}

class BindingBehaviorFactory {
    constructor(t, e) {
        this.ctn = t;
        this.Type = e;
        this.deps = i.getDependencies(e);
    }
    construct(t, e) {
        const r = this.ctn;
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

const y = Object.freeze({
    name: m,
    keyFrom(t) {
        return `${m}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && e.hasOwn(m, t);
    },
    define(r, i) {
        const s = BindingBehaviorDefinition.create(r, i);
        e.define(m, s, s.Type);
        e.define(m, s, s);
        t.resource.appendTo(i, m);
        return s.Type;
    },
    getDefinition(t) {
        const r = e.getOwn(m, t);
        if (void 0 === r) throw new Error(`No definition found for type ${t.name}`);
        return r;
    },
    annotate(r, i, s) {
        e.define(t.annotation.keyFor(i), s, r);
    },
    getAnnotation(r, i) {
        return e.getOwn(t.annotation.keyFor(i), r);
    }
});

function E(t) {
    return function(e) {
        return C.define(t, e);
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
        return new ValueConverterDefinition(e, s(C.getAnnotation(e, "name"), r), n(C.getAnnotation(e, "aliases"), i.aliases, e.aliases), C.keyFrom(r));
    }
    register(t) {
        const {Type: e, key: i, aliases: s} = this;
        r.singleton(i, e).register(t);
        r.aliasTo(i, e).register(t);
        v(s, C, i, t);
    }
}

const x = t.resource.keyFor("value-converter");

const C = Object.freeze({
    name: x,
    keyFrom(t) {
        return `${x}:${t}`;
    },
    isType(t) {
        return "function" === typeof t && e.hasOwn(x, t);
    },
    define(r, i) {
        const s = ValueConverterDefinition.create(r, i);
        e.define(x, s, s.Type);
        e.define(x, s, s);
        t.resource.appendTo(i, x);
        return s.Type;
    },
    getDefinition(t) {
        const r = e.getOwn(x, t);
        if (void 0 === r) throw new Error(`No definition found for type ${t.name}`);
        return r;
    },
    annotate(r, i, s) {
        e.define(t.annotation.keyFor(i), s, r);
    },
    getAnnotation(r, i) {
        return e.getOwn(t.annotation.keyFor(i), r);
    }
});

var O;

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
})(O || (O = {}));

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
    evaluate(t, e, r, i) {
        return this.expression.evaluate(t, e, r, i);
    }
    assign(t, e, r, i) {
        return this.expression.assign(t, e, r, i);
    }
    bind(t, e, r) {
        if (this.expression.hasBind) this.expression.bind(t, e, r);
        const i = r.locator.get(this.behaviorKey);
        if (null == i) throw new Error(`AUR0101:${this.name}`);
        if (!(i instanceof BindingBehaviorFactory)) if (void 0 === r[this.behaviorKey]) {
            r[this.behaviorKey] = i;
            i.bind.call(i, t, e, r, ...this.args.map((i => i.evaluate(t, e, r.locator, null))));
        } else throw new Error(`AUR0102:${this.name}`);
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
        this.converterKey = C.keyFrom(e);
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
        if (null == s) throw new Error(`AUR0103:${this.name}`);
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
        if (null == s) throw new Error(`AUR0104:${this.name}`);
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
        if (null == n && "$host" === this.name) throw new Error("AUR0105");
        if (1 & t) return n;
        return null == n ? "" : n;
    }
    assign(t, e, r, i) {
        var s;
        if ("$host" === this.name) throw new Error("AUR0106");
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
        const o = A(t, n, this.name);
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
        const o = A(t, s, this.name);
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
        throw new Error("AUR0107");
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
                    if (c(s) || c(n)) return (s || "") + (n || "");
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
            throw new Error(`AUR0108:${this.operation}`);
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
            throw new Error(`AUR0109:${this.operation}`);
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

ArrayLiteralExpression.$empty = new ArrayLiteralExpression(u);

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

ObjectLiteralExpression.$empty = new ObjectLiteralExpression(u, u);

class TemplateExpression {
    constructor(t, e = u) {
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
    constructor(t, e, r, i = u) {
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
        if ("function" !== typeof n) throw new Error(`AUR0110`);
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
    evaluate(t, e, r, i) {
        return this.iterable.evaluate(t, e, r, i);
    }
    assign(t, e, r, i) {
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
            return U(e, r);

          case "[object Set]":
            return k(e, r);

          case "[object Number]":
            return $(e, r);

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
    constructor(t, e = u) {
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

function A(t, e, r) {
    const i = null == e ? null : e[r];
    if ("function" === typeof i) return i;
    if (!(8 & t) && null == i) return null;
    throw new Error(`AUR0111:${r}`);
}

function B(t, e) {
    for (let r = 0, i = t.length; r < i; ++r) e(t, r, t[r]);
}

function U(t, e) {
    const r = Array(t.size);
    let i = -1;
    for (const e of t.entries()) r[++i] = e;
    B(r, e);
}

function k(t, e) {
    const r = Array(t.size);
    let i = -1;
    for (const e of t.keys()) r[++i] = e;
    B(r, e);
}

function $(t, e) {
    const r = Array(t);
    for (let e = 0; e < t; ++e) r[e] = e;
    B(r, e);
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

function I(t, e, r, i = false) {
    if (i || !L.call(t, e)) P(t, e, r);
}

var j;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(j || (j = {}));

var M;

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
})(M || (M = {}));

var F;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(F || (F = {}));

var V;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(V || (V = {}));

var D;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(D || (D = {}));

var R;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(R || (R = {}));

function N(t, e) {
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
        get: z
    });
    I(e, "subscribe", W);
    I(e, "unsubscribe", G);
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

function z() {
    return P(this, "subs", new SubscriberRecord);
}

function W(t) {
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
        const i = this.obj.length;
        if ((this.value = i) !== r) {
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
        rt = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, rt, this.f);
    }
}

function Y(t) {
    const e = t.prototype;
    I(e, "subscribe", tt, true);
    I(e, "unsubscribe", et, true);
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

const it = new WeakMap;

function st(t, e) {
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

function ot(t, e, r, i, s) {
    let n, o, h, c, u;
    let a, l;
    for (a = r + 1; a < i; a++) {
        n = t[a];
        o = e[a];
        for (l = a - 1; l >= r; l--) {
            h = t[l];
            c = e[l];
            u = s(h, n);
            if (u > 0) {
                t[l + 1] = h;
                e[l + 1] = c;
            } else break;
        }
        t[l + 1] = n;
        e[l + 1] = o;
    }
}

function ht(t, e, r, i, s) {
    let n = 0, o = 0;
    let h, c, u;
    let a, l, f;
    let d, v, p;
    let g, b;
    let w, m, y, E;
    let x, C, O, S;
    while (true) {
        if (i - r <= 10) {
            ot(t, e, r, i, s);
            return;
        }
        n = r + (i - r >> 1);
        h = t[r];
        a = e[r];
        c = t[i - 1];
        l = e[i - 1];
        u = t[n];
        f = e[n];
        d = s(h, c);
        if (d > 0) {
            g = h;
            b = a;
            h = c;
            a = l;
            c = g;
            l = b;
        }
        v = s(h, u);
        if (v >= 0) {
            g = h;
            b = a;
            h = u;
            a = f;
            u = c;
            f = l;
            c = g;
            l = b;
        } else {
            p = s(c, u);
            if (p > 0) {
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
        t[i - 1] = u;
        e[i - 1] = f;
        w = c;
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
            ht(t, e, E, i, s);
            i = y;
        } else {
            ht(t, e, r, y, s);
            r = E;
        }
    }
}

const ct = Array.prototype;

const ut = ct.push;

const at = ct.unshift;

const lt = ct.pop;

const ft = ct.shift;

const dt = ct.splice;

const vt = ct.reverse;

const pt = ct.sort;

const gt = {
    push: ut,
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
        const e = it.get(this);
        if (void 0 === e) return ut.apply(this, t);
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
        const e = it.get(this);
        if (void 0 === e) return at.apply(this, t);
        const r = t.length;
        const i = new Array(r);
        let s = 0;
        while (s < r) i[s++] = -2;
        at.apply(e.indexMap, i);
        const n = at.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = it.get(this);
        if (void 0 === t) return lt.call(this);
        const e = t.indexMap;
        const r = lt.call(this);
        const i = e.length - 1;
        if (e[i] > -1) e.deletedItems.push(e[i]);
        lt.call(e);
        t.notify();
        return r;
    },
    shift: function() {
        const t = it.get(this);
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
        const i = it.get(this);
        if (void 0 === i) return dt.apply(this, t);
        const s = this.length;
        const n = 0 | e;
        const o = n < 0 ? Math.max(s + n, 0) : Math.min(n, s);
        const h = i.indexMap;
        const c = t.length;
        const u = 0 === c ? 0 : 1 === c ? s - o : r;
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
            const i = new Array(t);
            let s = 0;
            while (s < t) i[s++] = -2;
            dt.call(h, e, r, ...i);
        } else dt.apply(h, t);
        const a = dt.apply(this, t);
        i.notify();
        return a;
    },
    reverse: function() {
        const t = it.get(this);
        if (void 0 === t) {
            vt.call(this);
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
        const e = it.get(this);
        if (void 0 === e) {
            pt.call(this, t);
            return this;
        }
        const r = this.length;
        if (r < 2) return this;
        ht(this, e.indexMap, 0, r, nt);
        let i = 0;
        while (i < r) {
            if (void 0 === this[i]) break;
            i++;
        }
        if (void 0 === t || "function" !== typeof t) t = st;
        ht(this, e.indexMap, 0, i, t);
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

function yt() {
    for (const t of bt) if (true !== ct[t].observing) P(ct, t, wt[t]);
}

function Et() {
    for (const t of bt) if (true === ct[t].observing) P(ct, t, gt[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!mt) {
            mt = true;
            yt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = K(t.length);
        this.lenObs = void 0;
        it.set(t, this);
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

Q(ArrayObserver);

Q(ArrayIndexObserver);

function xt(t) {
    let e = it.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function Ct(t) {
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

function Ot(t, e) {
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

const St = new WeakMap;

const At = Set.prototype;

const Bt = At.add;

const Ut = At.clear;

const kt = At.delete;

const $t = {
    add: Bt,
    clear: Ut,
    delete: kt
};

const Lt = [ "add", "clear", "delete" ];

const Tt = {
    add: function(t) {
        const e = St.get(this);
        if (void 0 === e) {
            Bt.call(this, t);
            return this;
        }
        const r = this.size;
        Bt.call(this, t);
        const i = this.size;
        if (i === r) return this;
        e.indexMap[r] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = St.get(this);
        if (void 0 === t) return Ut.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let r = 0;
            for (const t of this.keys()) {
                if (e[r] > -1) e.deletedItems.push(e[r]);
                r++;
            }
            Ut.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = St.get(this);
        if (void 0 === e) return kt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let i = 0;
        const s = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (s[i] > -1) s.deletedItems.push(s[i]);
                s.splice(i, 1);
                const r = kt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            i++;
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

let It = false;

function jt() {
    for (const t of Lt) if (true !== At[t].observing) T(At, t, {
        ...Pt,
        value: Tt[t]
    });
}

function Mt() {
    for (const t of Lt) if (true === At[t].observing) T(At, t, {
        ...Pt,
        value: $t[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!It) {
            It = true;
            jt();
        }
        this.collection = t;
        this.indexMap = K(t.size);
        this.lenObs = void 0;
        St.set(t, this);
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

function Ft(t) {
    let e = St.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Vt = new WeakMap;

const Dt = Map.prototype;

const Rt = Dt.set;

const Nt = Dt.clear;

const Kt = Dt.delete;

const qt = {
    set: Rt,
    clear: Nt,
    delete: Kt
};

const Ht = [ "set", "clear", "delete" ];

const Qt = {
    set: function(t, e) {
        const r = Vt.get(this);
        if (void 0 === r) {
            Rt.call(this, t, e);
            return this;
        }
        const i = this.get(t);
        const s = this.size;
        Rt.call(this, t, e);
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
        const t = Vt.get(this);
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
        const e = Vt.get(this);
        if (void 0 === e) return Kt.call(this, t);
        const r = this.size;
        if (0 === r) return false;
        let i = 0;
        const s = e.indexMap;
        for (const r of this.keys()) {
            if (r === t) {
                if (s[i] > -1) s.deletedItems.push(s[i]);
                s.splice(i, 1);
                const r = Kt.call(this, t);
                if (true === r) e.notify();
                return r;
            }
            ++i;
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

let zt = false;

function Wt() {
    for (const t of Ht) if (true !== Dt[t].observing) T(Dt, t, {
        ..._t,
        value: Qt[t]
    });
}

function Gt() {
    for (const t of Ht) if (true === Dt[t].observing) T(Dt, t, {
        ..._t,
        value: qt[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!zt) {
            zt = true;
            Wt();
        }
        this.collection = t;
        this.indexMap = K(t.size);
        this.lenObs = void 0;
        Vt.set(t, this);
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
    let e = Vt.get(t);
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
    if (t instanceof Array) e = xt(t); else if (t instanceof Set) e = Ft(t); else if (t instanceof Map) e = Zt(t); else throw new Error("Unrecognised collection type.");
    this.obs.add(e);
}

function te(t) {
    this.obs.add(t);
}

function ee() {
    throw new Error('method "handleChange" not implemented');
}

function re() {
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

function ie(t) {
    const e = t.prototype;
    I(e, "observe", Jt, true);
    I(e, "observeCollection", Yt, true);
    I(e, "subscribeTo", te, true);
    T(e, "obs", {
        get: Xt
    });
    I(e, "handleChange", ee);
    I(e, "handleCollectionChange", re);
    return t;
}

function se(t) {
    return null == t ? ie : ie(t);
}

class BindingMediator {
    constructor(t, e, r, i) {
        this.key = t;
        this.binding = e;
        this.oL = r;
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

ie(BindingMediator);

const ne = i.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

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
        we.input = t;
        we.length = t.length;
        we.index = 0;
        we.currentChar = t.charCodeAt(0);
        return ye(we, 0, 61, void 0 === e ? 53 : e);
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

var ce;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(ce || (ce = {}));

var ue;

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
})(ue || (ue = {}));

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

const we = new ParserState("");

function me(t, e) {
    we.input = t;
    we.length = t.length;
    we.index = 0;
    we.currentChar = t.charCodeAt(0);
    return ye(we, 0, 61, void 0 === e ? 53 : e);
}

function ye(t, e, r, i) {
    if (284 === i) return new CustomExpression(t.input);
    if (0 === t.index) {
        if (2048 & i) return Oe(t);
        Ae(t);
        if (1048576 & t.currentToken) throw new Error(`Invalid start of expression: '${t.input}'`);
    }
    t.assignable = 448 > r;
    let s;
    if (32768 & t.currentToken) {
        const r = je[63 & t.currentToken];
        Ae(t);
        s = new UnaryExpression(r, ye(t, e, 449, i));
        t.assignable = false;
    } else {
        t: switch (t.currentToken) {
          case 3078:
            t.assignable = false;
            do {
                Ae(t);
                e++;
                if (Pe(t, 16393)) {
                    if (16393 === t.currentToken) throw new Error(`Double dot and spread operators are not supported: '${t.input}'`); else if (1572864 === t.currentToken) throw new Error(`Expected identifier: '${t.input}'`);
                } else if (524288 & t.currentToken) {
                    const t = 511 & e;
                    s = 0 === t ? pe : 1 === t ? ge : new AccessThisExpression(t);
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
            Ae(t);
            break;

          case 3076:
            t.assignable = false;
            Ae(t);
            s = pe;
            e = 512;
            break;

          case 671751:
            Ae(t);
            s = ye(t, 0, 62, i);
            Ie(t, 1835019);
            e = 0;
            break;

          case 671757:
            s = Ee(t, e, i);
            e = 0;
            break;

          case 131080:
            s = Ce(t, i);
            e = 0;
            break;

          case 540714:
            s = new TemplateExpression([ t.tokenValue ]);
            t.assignable = false;
            Ae(t);
            e = 0;
            break;

          case 540715:
            s = Se(t, e, i, s, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            s = new PrimitiveLiteralExpression(t.tokenValue);
            t.assignable = false;
            Ae(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            s = je[63 & t.currentToken];
            t.assignable = false;
            Ae(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`Unexpected end of expression: '${t.input}'`); else throw new Error(`Unconsumed token: '${t.input}'`);
        }
        if (512 & i) return xe(t, s);
        if (449 < r) return s;
        let n = t.tokenValue;
        while ((16384 & t.currentToken) > 0) {
            const r = [];
            let o;
            switch (t.currentToken) {
              case 16393:
                t.assignable = true;
                Ae(t);
                if (0 === (3072 & t.currentToken)) throw new Error(`Expected identifier: '${t.input}'`);
                n = t.tokenValue;
                Ae(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.currentToken) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) s = new AccessScopeExpression(n, s.ancestor); else s = new AccessMemberExpression(s, n);
                continue;

              case 671757:
                t.assignable = true;
                Ae(t);
                e = 4096;
                s = new AccessKeyedExpression(s, ye(t, 0, 62, i));
                Ie(t, 1835022);
                break;

              case 671751:
                t.assignable = false;
                Ae(t);
                while (1835019 !== t.currentToken) {
                    r.push(ye(t, 0, 62, i));
                    if (!Pe(t, 1572876)) break;
                }
                Ie(t, 1835019);
                if (1024 & e) s = new CallScopeExpression(n, r, s.ancestor); else if (2048 & e) s = new CallMemberExpression(s, n, r); else s = new CallFunctionExpression(s, r);
                e = 0;
                break;

              case 540714:
                t.assignable = false;
                o = [ t.tokenValue ];
                s = new TaggedTemplateExpression(o, o, s);
                Ae(t);
                break;

              case 540715:
                s = Se(t, e, i, s, true);
            }
        }
    }
    if (448 < r) return s;
    while ((65536 & t.currentToken) > 0) {
        const n = t.currentToken;
        if ((448 & n) <= r) break;
        Ae(t);
        s = new BinaryExpression(je[63 & n], s, ye(t, e, 448 & n, i));
        t.assignable = false;
    }
    if (63 < r) return s;
    if (Pe(t, 1572880)) {
        const r = ye(t, e, 62, i);
        Ie(t, 1572879);
        s = new ConditionalExpression(s, r, ye(t, e, 62, i));
        t.assignable = false;
    }
    if (62 < r) return s;
    if (Pe(t, 1048616)) {
        if (!t.assignable) throw new Error(`Left hand side of expression is not assignable: '${t.input}'`);
        s = new AssignExpression(s, ye(t, e, 62, i));
    }
    if (61 < r) return s;
    while (Pe(t, 1572884)) {
        if (1572864 === t.currentToken) throw new Error(`Expected identifier to come after ValueConverter operator: '${t.input}'`);
        const r = t.tokenValue;
        Ae(t);
        const n = new Array;
        while (Pe(t, 1572879)) n.push(ye(t, e, 62, i));
        s = new ValueConverterExpression(s, r, n);
    }
    while (Pe(t, 1572883)) {
        if (1572864 === t.currentToken) throw new Error(`Expected identifier to come after BindingBehavior operator: '${t.input}'`);
        const r = t.tokenValue;
        Ae(t);
        const n = new Array;
        while (Pe(t, 1572879)) n.push(ye(t, e, 62, i));
        s = new BindingBehaviorExpression(s, r, n);
    }
    if (1572864 !== t.currentToken) {
        if (2048 & i) return s;
        if ("of" === t.tokenRaw) throw new Error(`Unexpected keyword "of": '${t.input}'`);
        throw new Error(`Unconsumed token: '${t.input}'`);
    }
    return s;
}

function Ee(t, e, r) {
    Ae(t);
    const i = new Array;
    while (1835022 !== t.currentToken) if (Pe(t, 1572876)) {
        i.push(ve);
        if (1835022 === t.currentToken) break;
    } else {
        i.push(ye(t, e, 62, ~512 & r));
        if (Pe(t, 1572876)) {
            if (1835022 === t.currentToken) break;
        } else break;
    }
    Ie(t, 1835022);
    if (512 & r) return new ArrayBindingPattern(i); else {
        t.assignable = false;
        return new ArrayLiteralExpression(i);
    }
}

function xe(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${t.input}'`);
    if (1051180 !== t.currentToken) throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${t.input}'`);
    Ae(t);
    const r = e;
    const i = ye(t, 0, 61, 0);
    return new ForOfStatement(r, i);
}

function Ce(t, e) {
    const r = new Array;
    const i = new Array;
    Ae(t);
    while (1835018 !== t.currentToken) {
        r.push(t.tokenValue);
        if (12288 & t.currentToken) {
            Ae(t);
            Ie(t, 1572879);
            i.push(ye(t, 0, 62, ~512 & e));
        } else if (3072 & t.currentToken) {
            const {currentChar: r, currentToken: s, index: n} = t;
            Ae(t);
            if (Pe(t, 1572879)) i.push(ye(t, 0, 62, ~512 & e)); else {
                t.currentChar = r;
                t.currentToken = s;
                t.index = n;
                i.push(ye(t, 0, 450, ~512 & e));
            }
        } else throw new Error(`Invalid or unsupported property definition in object literal: '${t.input}'`);
        if (1835018 !== t.currentToken) Ie(t, 1572876);
    }
    Ie(t, 1835018);
    if (512 & e) return new ObjectBindingPattern(r, i); else {
        t.assignable = false;
        return new ObjectLiteralExpression(r, i);
    }
}

function Oe(t) {
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
                Ae(t);
                const i = ye(t, 0, 61, 2048);
                r.push(i);
                continue;
            } else s += "$";
            break;

          case 92:
            s += String.fromCharCode(he(Be(t)));
            break;

          default:
            s += String.fromCharCode(t.currentChar);
        }
        Be(t);
    }
    if (r.length) {
        e.push(s);
        return new Interpolation(e, r);
    }
    return null;
}

function Se(t, e, r, i, s) {
    const n = [ t.tokenValue ];
    Ie(t, 540715);
    const o = [ ye(t, e, 62, r) ];
    while (540714 !== (t.currentToken = Te(t))) {
        n.push(t.tokenValue);
        Ie(t, 540715);
        o.push(ye(t, e, 62, r));
    }
    n.push(t.tokenValue);
    t.assignable = false;
    if (s) {
        Ae(t);
        return new TaggedTemplateExpression(n, n, i, o);
    } else {
        Ae(t);
        return new TemplateExpression(n, o);
    }
}

function Ae(t) {
    while (t.index < t.length) {
        t.startIndex = t.index;
        if (null != (t.currentToken = qe[t.currentChar](t))) return;
    }
    t.currentToken = 1572864;
}

function Be(t) {
    return t.currentChar = t.input.charCodeAt(++t.index);
}

function Ue(t) {
    while (Ke[Be(t)]) ;
    const e = Me[t.tokenValue = t.tokenRaw];
    return void 0 === e ? 1024 : e;
}

function ke(t, e) {
    let r = t.currentChar;
    if (false === e) {
        do {
            r = Be(t);
        } while (r <= 57 && r >= 48);
        if (46 !== r) {
            t.tokenValue = parseInt(t.tokenRaw, 10);
            return 8192;
        }
        r = Be(t);
        if (t.index >= t.length) {
            t.tokenValue = parseInt(t.tokenRaw.slice(0, -1), 10);
            return 8192;
        }
    }
    if (r <= 57 && r >= 48) do {
        r = Be(t);
    } while (r <= 57 && r >= 48); else t.currentChar = t.input.charCodeAt(--t.index);
    t.tokenValue = parseFloat(t.tokenRaw);
    return 8192;
}

function $e(t) {
    const e = t.currentChar;
    Be(t);
    let r = 0;
    const i = new Array;
    let s = t.index;
    while (t.currentChar !== e) if (92 === t.currentChar) {
        i.push(t.input.slice(s, t.index));
        Be(t);
        r = he(t.currentChar);
        Be(t);
        i.push(String.fromCharCode(r));
        s = t.index;
    } else if (t.index >= t.length) throw new Error(`Unterminated quote in string literal: '${t.input}'`); else Be(t);
    const n = t.input.slice(s, t.index);
    Be(t);
    i.push(n);
    const o = i.join("");
    t.tokenValue = o;
    return 4096;
}

function Le(t) {
    let e = true;
    let r = "";
    while (96 !== Be(t)) if (36 === t.currentChar) if (t.index + 1 < t.length && 123 === t.input.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else r += "$"; else if (92 === t.currentChar) r += String.fromCharCode(he(Be(t))); else {
        if (t.index >= t.length) throw new Error(`Unterminated template string: '${t.input}'`);
        r += String.fromCharCode(t.currentChar);
    }
    Be(t);
    t.tokenValue = r;
    if (e) return 540714;
    return 540715;
}

function Te(t) {
    if (t.index >= t.length) throw new Error(`Unterminated template string: '${t.input}'`);
    t.index--;
    return Le(t);
}

function Pe(t, e) {
    if (t.currentToken === e) {
        Ae(t);
        return true;
    }
    return false;
}

function Ie(t, e) {
    if (t.currentToken === e) Ae(t); else throw new Error(`Missing expected token: '${t.input}'`);
}

const je = [ le, fe, de, ve, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Me = Object.create(null);

Me.true = 2049;

Me.null = 2050;

Me.false = 2048;

Me.undefined = 2051;

Me.$this = 3076;

Me.$parent = 3078;

Me.in = 1640799;

Me.instanceof = 1640800;

Me.typeof = 34851;

Me.void = 34852;

Me.of = 1051180;

const Fe = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Ve(t, e, r, i) {
    const s = r.length;
    for (let n = 0; n < s; n += 2) {
        const s = r[n];
        let o = r[n + 1];
        o = o > 0 ? o : s + 1;
        if (t) t.fill(i, s, o);
        if (e) for (let t = s; t < o; t++) e.add(t);
    }
}

function De(t) {
    return e => {
        Be(e);
        return t;
    };
}

const Re = t => {
    throw new Error(`Unexpected character: '${t.input}'`);
};

Re.notMapped = true;

const Ne = new Set;

Ve(null, Ne, Fe.AsciiIdPart, true);

const Ke = new Uint8Array(65535);

Ve(Ke, null, Fe.IdStart, 1);

Ve(Ke, null, Fe.Digit, 1);

const qe = new Array(65535);

qe.fill(Re, 0, 65535);

Ve(qe, null, Fe.Skip, (t => {
    Be(t);
    return null;
}));

Ve(qe, null, Fe.IdStart, Ue);

Ve(qe, null, Fe.Digit, (t => ke(t, false)));

qe[34] = qe[39] = t => $e(t);

qe[96] = t => Le(t);

qe[33] = t => {
    if (61 !== Be(t)) return 32809;
    if (61 !== Be(t)) return 1638680;
    Be(t);
    return 1638682;
};

qe[61] = t => {
    if (61 !== Be(t)) return 1048616;
    if (61 !== Be(t)) return 1638679;
    Be(t);
    return 1638681;
};

qe[38] = t => {
    if (38 !== Be(t)) return 1572883;
    Be(t);
    return 1638614;
};

qe[124] = t => {
    if (124 !== Be(t)) return 1572884;
    Be(t);
    return 1638549;
};

qe[46] = t => {
    if (Be(t) <= 57 && t.currentChar >= 48) return ke(t, true);
    return 16393;
};

qe[60] = t => {
    if (61 !== Be(t)) return 1638747;
    Be(t);
    return 1638749;
};

qe[62] = t => {
    if (61 !== Be(t)) return 1638748;
    Be(t);
    return 1638750;
};

qe[37] = De(1638886);

qe[40] = De(671751);

qe[41] = De(1835019);

qe[42] = De(1638885);

qe[43] = De(623009);

qe[44] = De(1572876);

qe[45] = De(623010);

qe[47] = De(1638887);

qe[58] = De(1572879);

qe[63] = De(1572880);

qe[91] = De(671757);

qe[93] = De(1835022);

qe[123] = De(131080);

qe[125] = De(1835018);

let He = null;

const Qe = [];

let _e = false;

function ze() {
    _e = false;
}

function We() {
    _e = true;
}

function Ge() {
    return He;
}

function Ze(t) {
    if (null == t) throw new Error("Connectable cannot be null/undefined");
    if (null == He) {
        He = t;
        Qe[0] = He;
        _e = true;
        return;
    }
    if (He === t) throw new Error(`Trying to enter an active connectable`);
    Qe.push(He);
    He = t;
    _e = true;
}

function Je(t) {
    if (null == t) throw new Error("Connectable cannot be null/undefined");
    if (He !== t) throw new Error(`Trying to exit an unactive connectable`);
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
    pause: ze,
    resume: We
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

const ir = "__raw__";

function sr(t) {
    return rr(t) ? nr(t) : t;
}

function nr(t) {
    var e;
    return null !== (e = er.get(t)) && void 0 !== e ? e : ur(t);
}

function or(t) {
    var e;
    return null !== (e = t[ir]) && void 0 !== e ? e : t;
}

function hr(t) {
    return rr(t) && t[ir] || t;
}

function cr(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function ur(t) {
    const e = t instanceof Array ? lr : t instanceof Map || t instanceof Set ? Ir : ar;
    const r = new Proxy(t, e);
    er.set(t, r);
    return r;
}

const ar = {
    get(t, e, r) {
        if (e === ir) return t;
        const i = Ge();
        if (!_e || cr(e) || null == i) return Ye(t, e, r);
        i.observe(t, e);
        return sr(Ye(t, e, r));
    }
};

const lr = {
    get(t, e, r) {
        if (e === ir) return t;
        const i = Ge();
        if (!_e || cr(e) || null == i) return Ye(t, e, r);
        switch (e) {
          case "length":
            i.observe(t, "length");
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
            return yr;

          case "flatMap":
            return Er;

          case "join":
            return xr;

          case "push":
            return Or;

          case "pop":
            return Cr;

          case "reduce":
            return Tr;

          case "reduceRight":
            return Pr;

          case "reverse":
            return Ur;

          case "shift":
            return Sr;

          case "unshift":
            return Ar;

          case "slice":
            return Lr;

          case "splice":
            return Br;

          case "some":
            return kr;

          case "sort":
            return $r;

          case "keys":
            return Kr;

          case "values":
          case Symbol.iterator:
            return qr;

          case "entries":
            return Hr;
        }
        i.observe(t, e);
        return sr(Ye(t, e, r));
    },
    ownKeys(t) {
        var e;
        null === (e = Ge()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function fr(t, e) {
    var r;
    const i = or(this);
    const s = i.map(((r, i) => hr(t.call(e, sr(r), i, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return sr(s);
}

function dr(t, e) {
    var r;
    const i = or(this);
    const s = i.every(((r, i) => t.call(e, sr(r), i, this)));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return s;
}

function vr(t, e) {
    var r;
    const i = or(this);
    const s = i.filter(((r, i) => hr(t.call(e, sr(r), i, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return sr(s);
}

function pr(t) {
    var e;
    const r = or(this);
    const i = r.includes(hr(t));
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return i;
}

function gr(t) {
    var e;
    const r = or(this);
    const i = r.indexOf(hr(t));
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return i;
}

function br(t) {
    var e;
    const r = or(this);
    const i = r.lastIndexOf(hr(t));
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return i;
}

function wr(t, e) {
    var r;
    const i = or(this);
    const s = i.findIndex(((r, i) => hr(t.call(e, sr(r), i, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return s;
}

function mr(t, e) {
    var r;
    const i = or(this);
    const s = i.find(((e, r) => t(sr(e), r, this)), e);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return sr(s);
}

function yr() {
    var t;
    const e = or(this);
    null === (t = Ge()) || void 0 === t ? void 0 : t.observeCollection(e);
    return sr(e.flat());
}

function Er(t, e) {
    var r;
    const i = or(this);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return nr(i.flatMap(((r, i) => sr(t.call(e, sr(r), i, this)))));
}

function xr(t) {
    var e;
    const r = or(this);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.join(t);
}

function Cr() {
    return sr(or(this).pop());
}

function Or(...t) {
    return or(this).push(...t);
}

function Sr() {
    return sr(or(this).shift());
}

function Ar(...t) {
    return or(this).unshift(...t);
}

function Br(...t) {
    return sr(or(this).splice(...t));
}

function Ur(...t) {
    var e;
    const r = or(this);
    const i = r.reverse();
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return sr(i);
}

function kr(t, e) {
    var r;
    const i = or(this);
    const s = i.some(((r, i) => hr(t.call(e, sr(r), i, this))));
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return s;
}

function $r(t) {
    var e;
    const r = or(this);
    const i = r.sort(t);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return sr(i);
}

function Lr(t, e) {
    var r;
    const i = or(this);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return nr(i.slice(t, e));
}

function Tr(t, e) {
    var r;
    const i = or(this);
    const s = i.reduce(((e, r, i) => t(e, sr(r), i, this)), e);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return sr(s);
}

function Pr(t, e) {
    var r;
    const i = or(this);
    const s = i.reduceRight(((e, r, i) => t(e, sr(r), i, this)), e);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return sr(s);
}

const Ir = {
    get(t, e, r) {
        if (e === ir) return t;
        const i = Ge();
        if (!_e || cr(e) || null == i) return Ye(t, e, r);
        switch (e) {
          case "size":
            i.observe(t, "size");
            return t.size;

          case "clear":
            return Rr;

          case "delete":
            return Nr;

          case "forEach":
            return jr;

          case "add":
            if (t instanceof Set) return Dr;
            break;

          case "get":
            if (t instanceof Map) return Fr;
            break;

          case "set":
            if (t instanceof Map) return Vr;
            break;

          case "has":
            return Mr;

          case "keys":
            return Kr;

          case "values":
            return qr;

          case "entries":
            return Hr;

          case Symbol.iterator:
            return t instanceof Map ? Hr : qr;
        }
        return sr(Ye(t, e, r));
    }
};

function jr(t, e) {
    var r;
    const i = or(this);
    null === (r = Ge()) || void 0 === r ? void 0 : r.observeCollection(i);
    return i.forEach(((r, i) => {
        t.call(e, sr(r), sr(i), this);
    }));
}

function Mr(t) {
    var e;
    const r = or(this);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return r.has(hr(t));
}

function Fr(t) {
    var e;
    const r = or(this);
    null === (e = Ge()) || void 0 === e ? void 0 : e.observeCollection(r);
    return sr(r.get(hr(t)));
}

function Vr(t, e) {
    return sr(or(this).set(hr(t), hr(e)));
}

function Dr(t) {
    return sr(or(this).add(hr(t)));
}

function Rr() {
    return sr(or(this).clear());
}

function Nr(t) {
    return sr(or(this).delete(hr(t)));
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
            const i = t.done;
            return i ? {
                value: void 0,
                done: i
            } : {
                value: sr(e),
                done: i
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
            const i = t.done;
            return i ? {
                value: void 0,
                done: i
            } : {
                value: sr(e),
                done: i
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
            const i = t.done;
            return i ? {
                value: void 0,
                done: i
            } : {
                value: [ sr(e[0]), sr(e[1]) ],
                done: i
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
    wrap: sr,
    unwrap: hr,
    rawKey: ir
});

class ComputedObserver {
    constructor(t, e, r, i, s) {
        this.obj = t;
        this.get = e;
        this.set = r;
        this.useProxy = i;
        this.interceptor = this;
        this.type = 1;
        this.value = void 0;
        this.o = void 0;
        this.running = false;
        this.h = false;
        this.oL = s;
    }
    static create(t, e, r, i, s) {
        const n = r.get;
        const o = r.set;
        const h = new ComputedObserver(t, n, o, s, i);
        const c = () => h.getValue();
        c.getObserver = () => h;
        T(t, e, {
            enumerable: r.enumerable,
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
        _r = this.o;
        this.o = this.value;
        this.subs.notify(this.value, _r, 0);
    }
    run() {
        if (this.running) return;
        const t = this.value;
        const e = this.compute();
        this.h = false;
        if (!Object.is(e, t)) {
            this.o = t;
            this.queue.add(this);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            Ze(this);
            return this.value = hr(this.get.call(this.useProxy ? sr(this.obj) : this.obj, this));
        } finally {
            this.obs.clear(false);
            this.running = false;
            Je(this);
        }
    }
}

se(ComputedObserver);

Q(ComputedObserver);

Z(ComputedObserver);

let _r;

const zr = i.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const Wr = {
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
        this.u = null;
        this.l = 0;
        this.check = () => {
            if (Wr.disabled) return;
            if (++this.l < Wr.timeoutsPerCheck) return;
            this.l = 0;
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
        if (Wr.throw) throw new Error(`Property '${e}' is being dirty-checked.`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.u = this.p.taskQueue.queueTask(this.check, Gr);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.u.cancel();
            this.u = null;
        }
    }
}

DirtyChecker.inject = [ l ];

Z(DirtyChecker);

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.g = t;
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
            this.g.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && 0 === this.subs.count) this.g.removeProperty(this);
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
    setValue(t, e, r, i) {
        r[i] = t;
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

const Xr = i.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const Yr = i.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
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
        this.g = t;
        this.m = e;
        this.C = [];
    }
    addAdapter(t) {
        this.C.push(t);
    }
    getObserver(t, e) {
        var r, i;
        return null !== (i = null === (r = t.$observers) || void 0 === r ? void 0 : r[e]) && void 0 !== i ? i : this.O(t, e, this.createObserver(t, e));
    }
    getAccessor(t, e) {
        var r;
        const i = null === (r = t.$observers) || void 0 === r ? void 0 : r[e];
        if (void 0 !== i) return i;
        if (this.m.handles(t, e, this)) return this.m.getAccessor(t, e, this);
        return Jr;
    }
    getArrayObserver(t) {
        return xt(t);
    }
    getMapObserver(t) {
        return Zt(t);
    }
    getSetObserver(t) {
        return Ft(t);
    }
    createObserver(t, e) {
        var r, i, s, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.m.handles(t, e, this)) return this.m.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return xt(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return Zt(t).getLengthObserver(); else if (t instanceof Set) return Ft(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && a(e)) return xt(t).getIndexObserver(Number(e));
            break;
        }
        let o = ri(t, e);
        if (void 0 === o) {
            let r = ei(t);
            while (null !== r) {
                o = ri(r, e);
                if (void 0 === o) r = ei(r); else break;
            }
        }
        if (void 0 !== o && !L.call(o, "value")) {
            let h = this.S(t, e, o);
            if (null == h) h = null === (n = null !== (i = null === (r = o.get) || void 0 === r ? void 0 : r.getObserver) && void 0 !== i ? i : null === (s = o.set) || void 0 === s ? void 0 : s.getObserver) || void 0 === n ? void 0 : n(t, this);
            return null == h ? o.configurable ? ComputedObserver.create(t, e, o, this, true) : this.g.createProperty(t, e) : h;
        }
        return new SetterObserver(t, e);
    }
    S(t, e, r) {
        if (this.C.length > 0) for (const i of this.C) {
            const s = i.getObserver(t, e, r, this);
            if (null != s) return s;
        }
        return null;
    }
    O(t, e, r) {
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

ObserverLocator.inject = [ zr, Yr ];

function ti(t) {
    let e;
    if (t instanceof Array) e = xt(t); else if (t instanceof Map) e = Zt(t); else if (t instanceof Set) e = Ft(t);
    return e;
}

const ei = Object.getPrototypeOf;

const ri = Object.getOwnPropertyDescriptor;

const ii = i.createInterface("IObservation", (t => t.singleton(Observation)));

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
        if (this.stopped) throw new Error("Effect has already been stopped");
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

se(Effect);

function si(t) {
    if (void 0 === t.$observers) T(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const ni = {};

function oi(t, e, r) {
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
        let h = ni;
        if (r) {
            delete r.value;
            delete r.writable;
            h = null === (s = r.initializer) || void 0 === s ? void 0 : s.call(r);
            delete r.initializer;
        } else r = {
            configurable: true
        };
        if (!("enumerable" in r)) r.enumerable = true;
        const c = i.set;
        r.get = function t() {
            var r;
            const i = hi(this, e, o, h, c);
            null === (r = Ge()) || void 0 === r ? void 0 : r.subscribeTo(i);
            return i.getValue();
        };
        r.set = function t(r) {
            hi(this, e, o, h, c).setValue(r, 0);
        };
        r.get.getObserver = function t(r) {
            return hi(r, e, o, h, c);
        };
        if (n) T(t.prototype, e, r); else return r;
    }
}

function hi(t, e, r, i, s) {
    const n = si(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, r, s, i === ni ? void 0 : i);
        n[e] = o;
    }
    return o;
}

export { ce as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, R as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, y as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, b as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, j as BindingMode, BindingObserverRecord, be as BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, oe as Char, D as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, Xe as ConnectableSwitcher, CustomExpression, V as DelegationStrategy, DirtyCheckProperty, Wr as DirtyCheckSettings, O as ExpressionKind, FlushQueue, ForOfStatement, HtmlLiteralExpression, zr as IDirtyChecker, ne as IExpressionParser, Yr as INodeObserverLocator, ii as IObservation, Xr as IObserverLocator, g as ISignaler, Interpolation, M as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, ue as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, Qr as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, C as ValueConverter, ValueConverterDefinition, ValueConverterExpression, d as alias, Ct as applyMutationsToIndices, w as bindingBehavior, q as cloneIndexMap, se as connectable, N as copyIndexMap, K as createIndexMap, Et as disableArrayObservation, Gt as disableMapObservation, Mt as disableSetObservation, yt as enableArrayObservation, Wt as enableMapObservation, jt as enableSetObservation, ti as getCollectionObserver, H as isIndexMap, oi as observable, ye as parse, me as parseExpression, v as registerAliases, Q as subscriberCollection, Ot as synchronizeIndices, E as valueConverter, Z as withFlushQueue };
//# sourceMappingURL=index.js.map
