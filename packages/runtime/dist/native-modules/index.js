import { Metadata as t, Protocol as e, Registration as s, DI as r, firstDefined as i, mergeArrays as n, fromAnnotationOrDefinitionOrTypeOrDefault as o, isNumberOrBigInt as h, isStringOrDate as c, emptyArray as u, isArrayIndex as a, IPlatform as l, ILogger as f } from "../../../kernel/dist/native-modules/index.js";

export { IPlatform } from "../../../kernel/dist/native-modules/index.js";

export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from "../../../platform/dist/native-modules/index.js";

const d = Object.prototype.hasOwnProperty;

const v = Reflect.defineProperty;

const p = t => "function" === typeof t;

const g = t => "string" === typeof t;

function w(t, e, s) {
    v(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: s
    });
    return s;
}

function b(t, e, s, r = false) {
    if (r || !d.call(t, e)) w(t, e, s);
}

const E = () => Object.create(null);

const A = t.getOwn;

const y = t.hasOwn;

const m = t.define;

const U = e.annotation.keyFor;

const x = e.resource.keyFor;

const S = e.resource.appendTo;

function O(...t) {
    return function(e) {
        const s = U("aliases");
        const r = A(s, e);
        if (void 0 === r) m(s, t, e); else r.push(...t);
    };
}

function C(t, e, r, i) {
    for (let n = 0, o = t.length; n < o; ++n) s.aliasTo(r, e.keyFrom(t[n])).register(i);
}

const k = Object.freeze({});

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
        if (16 & r) return k;
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

const B = r.createInterface("ISignaler", (t => t.singleton(Signaler)));

class Signaler {
    constructor() {
        this.signals = E();
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

var $;

(function(t) {
    t[t["singleton"] = 1] = "singleton";
    t[t["interceptor"] = 2] = "interceptor";
})($ || ($ = {}));

function L(t) {
    return function(e) {
        return T.define(t, e);
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
    static create(t, e) {
        let s;
        let r;
        if (g(t)) {
            s = t;
            r = {
                name: s
            };
        } else {
            s = t.name;
            r = t;
        }
        const h = Object.getPrototypeOf(e) === BindingInterceptor;
        return new BindingBehaviorDefinition(e, i(P(e, "name"), s), n(P(e, "aliases"), r.aliases, e.aliases), T.keyFrom(s), o("strategy", r, e, (() => h ? 2 : 1)));
    }
    register(t) {
        const {Type: e, key: r, aliases: i, strategy: n} = this;
        switch (n) {
          case 1:
            s.singleton(r, e).register(t);
            break;

          case 2:
            s.instance(r, new BindingBehaviorFactory(t, e)).register(t);
            break;
        }
        s.aliasTo(r, e).register(t);
        C(i, T, r, t);
    }
}

class BindingBehaviorFactory {
    constructor(t, e) {
        this.ctn = t;
        this.Type = e;
        this.deps = r.getDependencies(e);
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

const R = x("binding-behavior");

const P = (t, e) => A(U(e), t);

const T = Object.freeze({
    name: R,
    keyFrom(t) {
        return `${R}:${t}`;
    },
    isType(t) {
        return p(t) && y(R, t);
    },
    define(t, e) {
        const s = BindingBehaviorDefinition.create(t, e);
        m(R, s, s.Type);
        m(R, s, s);
        S(e, R);
        return s.Type;
    },
    getDefinition(t) {
        const e = A(R, t);
        if (void 0 === e) throw new Error(`AUR0151:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        m(U(e), s, t);
    },
    getAnnotation: P
});

function j(t) {
    return function(e) {
        return D.define(t, e);
    };
}

class ValueConverterDefinition {
    constructor(t, e, s, r) {
        this.Type = t;
        this.name = e;
        this.aliases = s;
        this.key = r;
    }
    static create(t, e) {
        let s;
        let r;
        if (g(t)) {
            s = t;
            r = {
                name: s
            };
        } else {
            s = t.name;
            r = t;
        }
        return new ValueConverterDefinition(e, i(M(e, "name"), s), n(M(e, "aliases"), r.aliases, e.aliases), D.keyFrom(s));
    }
    register(t) {
        const {Type: e, key: r, aliases: i} = this;
        s.singleton(r, e).register(t);
        s.aliasTo(r, e).register(t);
        C(i, D, r, t);
    }
}

const I = x("value-converter");

const M = (t, e) => A(U(e), t);

const D = Object.freeze({
    name: I,
    keyFrom: t => `${I}:${t}`,
    isType(t) {
        return p(t) && y(I, t);
    },
    define(t, e) {
        const s = ValueConverterDefinition.create(t, e);
        m(I, s, s.Type);
        m(I, s, s);
        S(e, I);
        return s.Type;
    },
    getDefinition(t) {
        const e = A(I, t);
        if (void 0 === e) throw new Error(`AUR0152:${t.name}`);
        return e;
    },
    annotate(t, e, s) {
        m(U(e), s, t);
    },
    getAnnotation: M
});

var F;

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
})(F || (F = {}));

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
        if (g(t.value)) {
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
        this.behaviorKey = T.keyFrom(e);
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
            if (p(i[r].unbind)) i[r].unbind(t, e, s);
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
        this.converterKey = D.keyFrom(e);
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
                const e = s.get(B);
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
        const i = s.locator.get(B);
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
        const o = N(t, n, this.name);
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
        const o = N(t, i, this.name);
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
        if (p(i)) return i(...this.args.map((i => i.evaluate(t, e, s, r))));
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
    evaluate(t, e, s, r) {
        switch (this.operation) {
          case "&&":
            return this.left.evaluate(t, e, s, r) && this.right.evaluate(t, e, s, r);

          case "||":
            return this.left.evaluate(t, e, s, r) || this.right.evaluate(t, e, s, r);

          case "==":
            return this.left.evaluate(t, e, s, r) == this.right.evaluate(t, e, s, r);

          case "===":
            return this.left.evaluate(t, e, s, r) === this.right.evaluate(t, e, s, r);

          case "!=":
            return this.left.evaluate(t, e, s, r) != this.right.evaluate(t, e, s, r);

          case "!==":
            return this.left.evaluate(t, e, s, r) !== this.right.evaluate(t, e, s, r);

          case "instanceof":
            {
                const i = this.right.evaluate(t, e, s, r);
                if (p(i)) return this.left.evaluate(t, e, s, r) instanceof i;
                return false;
            }

          case "in":
            {
                const i = this.right.evaluate(t, e, s, r);
                if (i instanceof Object) return this.left.evaluate(t, e, s, r) in i;
                return false;
            }

          case "+":
            {
                const i = this.left.evaluate(t, e, s, r);
                const n = this.right.evaluate(t, e, s, r);
                if ((1 & t) > 0) return i + n;
                if (!i || !n) {
                    if (h(i) || h(n)) return (i || 0) + (n || 0);
                    if (c(i) || c(n)) return (i || "") + (n || "");
                }
                return i + n;
            }

          case "-":
            return this.left.evaluate(t, e, s, r) - this.right.evaluate(t, e, s, r);

          case "*":
            return this.left.evaluate(t, e, s, r) * this.right.evaluate(t, e, s, r);

          case "/":
            return this.left.evaluate(t, e, s, r) / this.right.evaluate(t, e, s, r);

          case "%":
            return this.left.evaluate(t, e, s, r) % this.right.evaluate(t, e, s, r);

          case "<":
            return this.left.evaluate(t, e, s, r) < this.right.evaluate(t, e, s, r);

          case ">":
            return this.left.evaluate(t, e, s, r) > this.right.evaluate(t, e, s, r);

          case "<=":
            return this.left.evaluate(t, e, s, r) <= this.right.evaluate(t, e, s, r);

          case ">=":
            return this.left.evaluate(t, e, s, r) >= this.right.evaluate(t, e, s, r);

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
    constructor(t, e, s, r = u) {
        this.cooked = t;
        this.func = s;
        this.expressions = r;
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
    evaluate(t, e, s, r) {
        const i = this.expressions.map((i => i.evaluate(t, e, s, r)));
        const n = this.func.evaluate(t, e, s, r);
        if (!p(n)) throw new Error(`AUR0110`);
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

const V = Object.prototype.toString;

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
        switch (V.call(e)) {
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
            throw new Error(`Cannot count ${V.call(e)}`);
        }
    }
    iterate(t, e, s) {
        switch (V.call(e)) {
          case "[object Array]":
            return K(e, s);

          case "[object Map]":
            return q(e, s);

          case "[object Set]":
            return H(e, s);

          case "[object Number]":
            return Q(e, s);

          case "[object Null]":
            return;

          case "[object Undefined]":
            return;

          default:
            throw new Error(`Cannot iterate over ${V.call(e)}`);
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
    assign(t, e, s, r) {
        if (null == r) return;
        if ("object" !== typeof r) throw new Error("AUR0112");
        const i = this.indexOrProperties;
        let n;
        if (a(i)) {
            if (!Array.isArray(r)) throw new Error("AUR0112");
            n = r.slice(i);
        } else n = Object.entries(r).reduce(((t, [e, s]) => {
            if (!i.includes(e)) t[e] = s;
            return t;
        }), {});
        this.target.assign(t, e, s, n);
    }
    accept(t) {
        return t.visitDestructuringAssignmentRestExpression(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}

function N(t, e, s) {
    const r = null == e ? null : e[s];
    if (p(r)) return r;
    if (!(8 & t) && null == r) return null;
    throw new Error(`AUR0111:${s}`);
}

function K(t, e) {
    for (let s = 0, r = t.length; s < r; ++s) e(t, s, t[s]);
}

function q(t, e) {
    const s = Array(t.size);
    let r = -1;
    for (const e of t.entries()) s[++r] = e;
    K(s, e);
}

function H(t, e) {
    const s = Array(t.size);
    let r = -1;
    for (const e of t.keys()) s[++r] = e;
    K(s, e);
}

function Q(t, e) {
    const s = Array(t);
    for (let e = 0; e < t; ++e) s[e] = e;
    K(s, e);
}

var _;

(function(t) {
    t[t["oneTime"] = 1] = "oneTime";
    t[t["toView"] = 2] = "toView";
    t[t["fromView"] = 4] = "fromView";
    t[t["twoWay"] = 6] = "twoWay";
    t[t["default"] = 8] = "default";
})(_ || (_ = {}));

var z;

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
})(z || (z = {}));

var W;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Subscriber0"] = 1] = "Subscriber0";
    t[t["Subscriber1"] = 2] = "Subscriber1";
    t[t["Subscriber2"] = 4] = "Subscriber2";
    t[t["SubscribersRest"] = 8] = "SubscribersRest";
    t[t["Any"] = 15] = "Any";
})(W || (W = {}));

var G;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["capturing"] = 1] = "capturing";
    t[t["bubbling"] = 2] = "bubbling";
})(G || (G = {}));

var Z;

(function(t) {
    t[t["indexed"] = 8] = "indexed";
    t[t["keyed"] = 4] = "keyed";
    t[t["array"] = 9] = "array";
    t[t["map"] = 6] = "map";
    t[t["set"] = 7] = "set";
})(Z || (Z = {}));

var J;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Observer"] = 1] = "Observer";
    t[t["Node"] = 2] = "Node";
    t[t["Layout"] = 4] = "Layout";
    t[t["Primtive"] = 8] = "Primtive";
    t[t["Array"] = 18] = "Array";
    t[t["Set"] = 34] = "Set";
    t[t["Map"] = 66] = "Map";
})(J || (J = {}));

function X(t, e) {
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

function Y(t = 0) {
    const e = Array(t);
    let s = 0;
    while (s < t) e[s] = s++;
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function tt(t) {
    const e = t.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function et(t) {
    return t instanceof Array && true === t.isIndexMap;
}

function st(t) {
    return null == t ? rt : rt(t);
}

function rt(t) {
    const e = t.prototype;
    v(e, "subs", {
        get: it
    });
    b(e, "subscribe", nt);
    b(e, "unsubscribe", ot);
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

function it() {
    return w(this, "subs", new SubscriberRecord);
}

function nt(t) {
    return this.subs.add(t);
}

function ot(t) {
    return this.subs.remove(t);
}

function ht(t) {
    return null == t ? ct : ct(t);
}

function ct(t) {
    const e = t.prototype;
    v(e, "queue", {
        get: ut
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
            this.i.forEach(at);
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

function ut() {
    return FlushQueue.instance;
}

function at(t, e, s) {
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
    setValue(t, e) {
        const s = this.v;
        if (t !== s && a(t)) {
            if (0 === (256 & e)) this.o.length = t;
            this.v = t;
            this.h = s;
            this.f = e;
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
        vt = this.h;
        this.h = this.v;
        this.subs.notify(this.v, vt, this.f);
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
        vt = this.h;
        this.h = this.v;
        this.subs.notify(this.v, vt, this.f);
    }
}

function lt(t) {
    const e = t.prototype;
    b(e, "subscribe", ft, true);
    b(e, "unsubscribe", dt, true);
    ht(t);
    st(t);
}

function ft(t) {
    if (this.subs.add(t) && 1 === this.subs.count) this.owner.subscribe(this);
}

function dt(t) {
    if (this.subs.remove(t) && 0 === this.subs.count) this.owner.subscribe(this);
}

lt(CollectionLengthObserver);

lt(CollectionSizeObserver);

let vt;

const pt = new WeakMap;

function gt(t, e) {
    if (t === e) return 0;
    t = null === t ? "null" : t.toString();
    e = null === e ? "null" : e.toString();
    return t < e ? -1 : 1;
}

function wt(t, e) {
    if (void 0 === t) if (void 0 === e) return 0; else return 1;
    if (void 0 === e) return -1;
    return 0;
}

function bt(t, e, s, r, i) {
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

function Et(t, e, s, r, i) {
    let n = 0, o = 0;
    let h, c, u;
    let a, l, f;
    let d, v, p;
    let g, w;
    let b, E, A, y;
    let m, U, x, S;
    while (true) {
        if (r - s <= 10) {
            bt(t, e, s, r, i);
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
        v = i(h, u);
        if (v >= 0) {
            g = h;
            w = a;
            h = u;
            a = f;
            u = c;
            f = l;
            c = g;
            l = w;
        } else {
            p = i(c, u);
            if (p > 0) {
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
        E = l;
        A = s + 1;
        y = r - 1;
        t[n] = t[A];
        e[n] = e[A];
        t[A] = b;
        e[A] = E;
        t: for (o = A + 1; o < y; o++) {
            m = t[o];
            U = e[o];
            x = i(m, b);
            if (x < 0) {
                t[o] = t[A];
                e[o] = e[A];
                t[A] = m;
                e[A] = U;
                A++;
            } else if (x > 0) {
                do {
                    y--;
                    if (y == o) break t;
                    S = t[y];
                    x = i(S, b);
                } while (x > 0);
                t[o] = t[y];
                e[o] = e[y];
                t[y] = m;
                e[y] = U;
                if (x < 0) {
                    m = t[o];
                    U = e[o];
                    t[o] = t[A];
                    e[o] = e[A];
                    t[A] = m;
                    e[A] = U;
                    A++;
                }
            }
        }
        if (r - y < A - s) {
            Et(t, e, y, r, i);
            r = A;
        } else {
            Et(t, e, s, A, i);
            s = y;
        }
    }
}

const At = Array.prototype;

const yt = At.push;

const mt = At.unshift;

const Ut = At.pop;

const xt = At.shift;

const St = At.splice;

const Ot = At.reverse;

const Ct = At.sort;

const kt = {
    push: yt,
    unshift: mt,
    pop: Ut,
    shift: xt,
    splice: St,
    reverse: Ot,
    sort: Ct
};

const Bt = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];

const $t = {
    push: function(...t) {
        const e = pt.get(this);
        if (void 0 === e) return yt.apply(this, t);
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
        const e = pt.get(this);
        if (void 0 === e) return mt.apply(this, t);
        const s = t.length;
        const r = new Array(s);
        let i = 0;
        while (i < s) r[i++] = -2;
        mt.apply(e.indexMap, r);
        const n = mt.apply(this, t);
        e.notify();
        return n;
    },
    pop: function() {
        const t = pt.get(this);
        if (void 0 === t) return Ut.call(this);
        const e = t.indexMap;
        const s = Ut.call(this);
        const r = e.length - 1;
        if (e[r] > -1) e.deletedItems.push(e[r]);
        Ut.call(e);
        t.notify();
        return s;
    },
    shift: function() {
        const t = pt.get(this);
        if (void 0 === t) return xt.call(this);
        const e = t.indexMap;
        const s = xt.call(this);
        if (e[0] > -1) e.deletedItems.push(e[0]);
        xt.call(e);
        t.notify();
        return s;
    },
    splice: function(...t) {
        const e = t[0];
        const s = t[1];
        const r = pt.get(this);
        if (void 0 === r) return St.apply(this, t);
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
            St.call(h, e, s, ...r);
        } else St.apply(h, t);
        const a = St.apply(this, t);
        r.notify();
        return a;
    },
    reverse: function() {
        const t = pt.get(this);
        if (void 0 === t) {
            Ot.call(this);
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
        const e = pt.get(this);
        if (void 0 === e) {
            Ct.call(this, t);
            return this;
        }
        const s = this.length;
        if (s < 2) return this;
        Et(this, e.indexMap, 0, s, wt);
        let r = 0;
        while (r < s) {
            if (void 0 === this[r]) break;
            r++;
        }
        if (void 0 === t || !p(t)) t = gt;
        Et(this, e.indexMap, 0, r, t);
        e.notify();
        return this;
    }
};

for (const t of Bt) v($t[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let Lt = false;

function Rt() {
    for (const t of Bt) if (true !== At[t].observing) w(At, t, $t[t]);
}

function Pt() {
    for (const t of Bt) if (true === At[t].observing) w(At, t, kt[t]);
}

class ArrayObserver {
    constructor(t) {
        this.type = 18;
        if (!Lt) {
            Lt = true;
            Rt();
        }
        this.indexObservers = {};
        this.collection = t;
        this.indexMap = Y(t.length);
        this.lenObs = void 0;
        pt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.length;
        this.indexMap = Y(e);
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

st(ArrayObserver);

st(ArrayIndexObserver);

function Tt(t) {
    let e = pt.get(t);
    if (void 0 === e) e = new ArrayObserver(t);
    return e;
}

function jt(t) {
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

function It(t, e) {
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

const Mt = new WeakMap;

const Dt = Set.prototype;

const Ft = Dt.add;

const Vt = Dt.clear;

const Nt = Dt.delete;

const Kt = {
    add: Ft,
    clear: Vt,
    delete: Nt
};

const qt = [ "add", "clear", "delete" ];

const Ht = {
    add: function(t) {
        const e = Mt.get(this);
        if (void 0 === e) {
            Ft.call(this, t);
            return this;
        }
        const s = this.size;
        Ft.call(this, t);
        const r = this.size;
        if (r === s) return this;
        e.indexMap[s] = -2;
        e.notify();
        return this;
    },
    clear: function() {
        const t = Mt.get(this);
        if (void 0 === t) return Vt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let s = 0;
            for (const t of this.keys()) {
                if (e[s] > -1) e.deletedItems.push(e[s]);
                s++;
            }
            Vt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Mt.get(this);
        if (void 0 === e) return Nt.call(this, t);
        const s = this.size;
        if (0 === s) return false;
        let r = 0;
        const i = e.indexMap;
        for (const s of this.keys()) {
            if (s === t) {
                if (i[r] > -1) i.deletedItems.push(i[r]);
                i.splice(r, 1);
                const s = Nt.call(this, t);
                if (true === s) e.notify();
                return s;
            }
            r++;
        }
        return false;
    }
};

const Qt = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of qt) v(Ht[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let _t = false;

function zt() {
    for (const t of qt) if (true !== Dt[t].observing) v(Dt, t, {
        ...Qt,
        value: Ht[t]
    });
}

function Wt() {
    for (const t of qt) if (true === Dt[t].observing) v(Dt, t, {
        ...Qt,
        value: Kt[t]
    });
}

class SetObserver {
    constructor(t) {
        this.type = 34;
        if (!_t) {
            _t = true;
            zt();
        }
        this.collection = t;
        this.indexMap = Y(t.size);
        this.lenObs = void 0;
        Mt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = Y(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

st(SetObserver);

function Gt(t) {
    let e = Mt.get(t);
    if (void 0 === e) e = new SetObserver(t);
    return e;
}

const Zt = new WeakMap;

const Jt = Map.prototype;

const Xt = Jt.set;

const Yt = Jt.clear;

const te = Jt.delete;

const ee = {
    set: Xt,
    clear: Yt,
    delete: te
};

const se = [ "set", "clear", "delete" ];

const re = {
    set: function(t, e) {
        const s = Zt.get(this);
        if (void 0 === s) {
            Xt.call(this, t, e);
            return this;
        }
        const r = this.get(t);
        const i = this.size;
        Xt.call(this, t, e);
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
        const t = Zt.get(this);
        if (void 0 === t) return Yt.call(this);
        const e = this.size;
        if (e > 0) {
            const e = t.indexMap;
            let s = 0;
            for (const t of this.keys()) {
                if (e[s] > -1) e.deletedItems.push(e[s]);
                s++;
            }
            Yt.call(this);
            e.length = 0;
            t.notify();
        }
        return;
    },
    delete: function(t) {
        const e = Zt.get(this);
        if (void 0 === e) return te.call(this, t);
        const s = this.size;
        if (0 === s) return false;
        let r = 0;
        const i = e.indexMap;
        for (const s of this.keys()) {
            if (s === t) {
                if (i[r] > -1) i.deletedItems.push(i[r]);
                i.splice(r, 1);
                const s = te.call(this, t);
                if (true === s) e.notify();
                return s;
            }
            ++r;
        }
        return false;
    }
};

const ie = {
    writable: true,
    enumerable: false,
    configurable: true
};

for (const t of se) v(re[t], "observing", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});

let ne = false;

function oe() {
    for (const t of se) if (true !== Jt[t].observing) v(Jt, t, {
        ...ie,
        value: re[t]
    });
}

function he() {
    for (const t of se) if (true === Jt[t].observing) v(Jt, t, {
        ...ie,
        value: ee[t]
    });
}

class MapObserver {
    constructor(t) {
        this.type = 66;
        if (!ne) {
            ne = true;
            oe();
        }
        this.collection = t;
        this.indexMap = Y(t.size);
        this.lenObs = void 0;
        Zt.set(t, this);
    }
    notify() {
        const t = this.indexMap;
        const e = this.collection.size;
        this.indexMap = Y(e);
        this.subs.notifyCollection(t, 0);
    }
    getLengthObserver() {
        var t;
        return null !== (t = this.lenObs) && void 0 !== t ? t : this.lenObs = new CollectionSizeObserver(this);
    }
}

st(MapObserver);

function ce(t) {
    let e = Zt.get(t);
    if (void 0 === e) e = new MapObserver(t);
    return e;
}

function ue(t, e) {
    const s = this.oL.getObserver(t, e);
    this.obs.add(s);
}

function ae() {
    return w(this, "obs", new BindingObserverRecord(this));
}

function le(t) {
    let e;
    if (t instanceof Array) e = Tt(t); else if (t instanceof Set) e = Gt(t); else if (t instanceof Map) e = ce(t); else throw new Error("AUR0210");
    this.obs.add(e);
}

function fe(t) {
    this.obs.add(t);
}

function de() {
    throw new Error(`AUR2011:handleChange`);
}

function ve() {
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
        this.o.forEach(ge, this);
        this.count = this.o.size;
    }
    clearAll() {
        this.o.forEach(pe, this);
        this.o.clear();
        this.count = 0;
    }
}

function pe(t, e) {
    e.unsubscribe(this);
}

function ge(t, e) {
    if (this.version !== t) {
        e.unsubscribe(this);
        this.o.delete(e);
    }
}

function we(t) {
    const e = t.prototype;
    b(e, "observe", ue, true);
    b(e, "observeCollection", le, true);
    b(e, "subscribeTo", fe, true);
    v(e, "obs", {
        get: ae
    });
    b(e, "handleChange", de);
    b(e, "handleCollectionChange", ve);
    return t;
}

function be(t) {
    return null == t ? we : we(t);
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

we(BindingMediator);

const Ee = r.createInterface("IExpressionParser", (t => t.singleton(ExpressionParser)));

class ExpressionParser {
    constructor() {
        this.u = E();
        this.A = E();
        this.U = E();
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
        Re.ip = t;
        Re.length = t.length;
        Re.index = 0;
        Re.O = t.charCodeAt(0);
        return Te(Re, 0, 61, void 0 === e ? 8 : e);
    }
}

var Ae;

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
})(Ae || (Ae = {}));

function ye(t) {
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

var me;

(function(t) {
    t[t["Reset"] = 0] = "Reset";
    t[t["Ancestor"] = 511] = "Ancestor";
    t[t["This"] = 512] = "This";
    t[t["Scope"] = 1024] = "Scope";
    t[t["Member"] = 2048] = "Member";
    t[t["Keyed"] = 4096] = "Keyed";
})(me || (me = {}));

var Ue;

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
})(Ue || (Ue = {}));

var xe;

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
})(xe || (xe = {}));

const Se = PrimitiveLiteralExpression.$false;

const Oe = PrimitiveLiteralExpression.$true;

const Ce = PrimitiveLiteralExpression.$null;

const ke = PrimitiveLiteralExpression.$undefined;

const Be = AccessThisExpression.$this;

const $e = AccessThisExpression.$parent;

var Le;

(function(t) {
    t[t["None"] = 0] = "None";
    t[t["Interpolation"] = 1] = "Interpolation";
    t[t["IsIterator"] = 2] = "IsIterator";
    t[t["IsFunction"] = 4] = "IsFunction";
    t[t["IsProperty"] = 8] = "IsProperty";
    t[t["IsCustom"] = 16] = "IsCustom";
})(Le || (Le = {}));

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

const Re = new ParserState("");

function Pe(t, e) {
    Re.ip = t;
    Re.length = t.length;
    Re.index = 0;
    Re.O = t.charCodeAt(0);
    return Te(Re, 0, 61, void 0 === e ? 8 : e);
}

function Te(t, e, s, r) {
    if (16 === r) return new CustomExpression(t.ip);
    if (0 === t.index) {
        if (1 & r) return Fe(t);
        Ne(t);
        if (1048576 & t.$) throw new Error(`AUR0151:${t.ip}`);
    }
    t.R = 448 > s;
    let i;
    if (32768 & t.$) {
        const s = Ze[63 & t.$];
        Ne(t);
        i = new UnaryExpression(s, Te(t, e, 449, r));
        t.R = false;
    } else {
        t: switch (t.$) {
          case 3078:
            t.R = false;
            do {
                Ne(t);
                e++;
                if (We(t, 16393)) {
                    if (16393 === t.$) throw new Error(`AUR0152:${t.ip}`); else if (1572864 === t.$) throw new Error(`AUR0153:${t.ip}`);
                } else if (524288 & t.$) {
                    const t = 511 & e;
                    i = 0 === t ? Be : 1 === t ? $e : new AccessThisExpression(t);
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
            Ne(t);
            break;

          case 3076:
            t.R = false;
            Ne(t);
            i = Be;
            e = 512;
            break;

          case 671751:
            Ne(t);
            i = Te(t, 0, 62, r);
            Ge(t, 1835019);
            e = 0;
            break;

          case 671757:
            i = t.ip.search(/\s+of\s+/) > t.index ? je(t) : Ie(t, e, r);
            e = 0;
            break;

          case 131080:
            i = De(t, r);
            e = 0;
            break;

          case 540714:
            i = new TemplateExpression([ t.L ]);
            t.R = false;
            Ne(t);
            e = 0;
            break;

          case 540715:
            i = Ve(t, e, r, i, false);
            e = 0;
            break;

          case 4096:
          case 8192:
            i = new PrimitiveLiteralExpression(t.L);
            t.R = false;
            Ne(t);
            e = 0;
            break;

          case 2050:
          case 2051:
          case 2049:
          case 2048:
            i = Ze[63 & t.$];
            t.R = false;
            Ne(t);
            e = 0;
            break;

          default:
            if (t.index >= t.length) throw new Error(`AUR0155:${t.ip}`); else throw new Error(`AUR0156:${t.ip}`);
        }
        if (2 & r) return Me(t, i);
        if (449 < s) return i;
        let n = t.L;
        while ((16384 & t.$) > 0) {
            const s = [];
            let o;
            switch (t.$) {
              case 16393:
                t.R = true;
                Ne(t);
                if (0 === (3072 & t.$)) throw new Error(`AUR0153:${t.ip}`);
                n = t.L;
                Ne(t);
                e = (e & (512 | 1024)) << 1 | 2048 & e | (4096 & e) >> 1;
                if (671751 === t.$) {
                    if (0 === e) e = 2048;
                    continue;
                }
                if (1024 & e) i = new AccessScopeExpression(n, i.ancestor); else i = new AccessMemberExpression(i, n);
                continue;

              case 671757:
                t.R = true;
                Ne(t);
                e = 4096;
                i = new AccessKeyedExpression(i, Te(t, 0, 62, r));
                Ge(t, 1835022);
                break;

              case 671751:
                t.R = false;
                Ne(t);
                while (1835019 !== t.$) {
                    s.push(Te(t, 0, 62, r));
                    if (!We(t, 1572876)) break;
                }
                Ge(t, 1835019);
                if (1024 & e) i = new CallScopeExpression(n, s, i.ancestor); else if (2048 & e) i = new CallMemberExpression(i, n, s); else i = new CallFunctionExpression(i, s);
                e = 0;
                break;

              case 540714:
                t.R = false;
                o = [ t.L ];
                i = new TaggedTemplateExpression(o, o, i);
                Ne(t);
                break;

              case 540715:
                i = Ve(t, e, r, i, true);
            }
        }
    }
    if (448 < s) return i;
    while ((65536 & t.$) > 0) {
        const n = t.$;
        if ((448 & n) <= s) break;
        Ne(t);
        i = new BinaryExpression(Ze[63 & n], i, Te(t, e, 448 & n, r));
        t.R = false;
    }
    if (63 < s) return i;
    if (We(t, 1572880)) {
        const s = Te(t, e, 62, r);
        Ge(t, 1572879);
        i = new ConditionalExpression(i, s, Te(t, e, 62, r));
        t.R = false;
    }
    if (62 < s) return i;
    if (We(t, 1048616)) {
        if (!t.R) throw new Error(`AUR0158:${t.ip}`);
        i = new AssignExpression(i, Te(t, e, 62, r));
    }
    if (61 < s) return i;
    while (We(t, 1572884)) {
        if (1572864 === t.$) throw new Error(`AUR0159:${t.ip}`);
        const s = t.L;
        Ne(t);
        const n = new Array;
        while (We(t, 1572879)) n.push(Te(t, e, 62, r));
        i = new ValueConverterExpression(i, s, n);
    }
    while (We(t, 1572883)) {
        if (1572864 === t.$) throw new Error(`AUR0160:${t.ip}`);
        const s = t.L;
        Ne(t);
        const n = new Array;
        while (We(t, 1572879)) n.push(Te(t, e, 62, r));
        i = new BindingBehaviorExpression(i, s, n);
    }
    if (1572864 !== t.$) {
        if (1 & r) return i;
        if ("of" === t.P) throw new Error(`AUR0161:${t.ip}`);
        throw new Error(`AUR0162:${t.ip}`);
    }
    return i;
}

function je(t) {
    const e = [];
    const s = new DestructuringAssignmentExpression(90137, e, void 0, void 0);
    let r = "";
    let i = true;
    let n = 0;
    while (i) {
        Ne(t);
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
    Ge(t, 1835022);
    return s;
    function o() {
        if ("" !== r) {
            e.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression(Be, r), new AccessKeyedExpression(Be, new PrimitiveLiteralExpression(n++)), void 0));
            r = "";
        } else n++;
    }
}

function Ie(t, e, s) {
    Ne(t);
    const r = new Array;
    while (1835022 !== t.$) if (We(t, 1572876)) {
        r.push(ke);
        if (1835022 === t.$) break;
    } else {
        r.push(Te(t, e, 62, ~2 & s));
        if (We(t, 1572876)) {
            if (1835022 === t.$) break;
        } else break;
    }
    Ge(t, 1835022);
    if (2 & s) return new ArrayBindingPattern(r); else {
        t.R = false;
        return new ArrayLiteralExpression(r);
    }
}

function Me(t, e) {
    if (0 === (65536 & e.$kind)) throw new Error(`AUR0163:${t.ip}`);
    if (1051180 !== t.$) throw new Error(`AUR0163:${t.ip}`);
    Ne(t);
    const s = e;
    const r = Te(t, 0, 61, 0);
    return new ForOfStatement(s, r);
}

function De(t, e) {
    const s = new Array;
    const r = new Array;
    Ne(t);
    while (1835018 !== t.$) {
        s.push(t.L);
        if (12288 & t.$) {
            Ne(t);
            Ge(t, 1572879);
            r.push(Te(t, 0, 62, ~2 & e));
        } else if (3072 & t.$) {
            const {O: s, $: i, index: n} = t;
            Ne(t);
            if (We(t, 1572879)) r.push(Te(t, 0, 62, ~2 & e)); else {
                t.O = s;
                t.$ = i;
                t.index = n;
                r.push(Te(t, 0, 450, ~2 & e));
            }
        } else throw new Error(`AUR0164:${t.ip}`);
        if (1835018 !== t.$) Ge(t, 1572876);
    }
    Ge(t, 1835018);
    if (2 & e) return new ObjectBindingPattern(s, r); else {
        t.R = false;
        return new ObjectLiteralExpression(s, r);
    }
}

function Fe(t) {
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
                Ne(t);
                const r = Te(t, 0, 61, 1);
                s.push(r);
                continue;
            } else i += "$";
            break;

          case 92:
            i += String.fromCharCode(ye(Ke(t)));
            break;

          default:
            i += String.fromCharCode(t.O);
        }
        Ke(t);
    }
    if (s.length) {
        e.push(i);
        return new Interpolation(e, s);
    }
    return null;
}

function Ve(t, e, s, r, i) {
    const n = [ t.L ];
    Ge(t, 540715);
    const o = [ Te(t, e, 62, s) ];
    while (540714 !== (t.$ = ze(t))) {
        n.push(t.L);
        Ge(t, 540715);
        o.push(Te(t, e, 62, s));
    }
    n.push(t.L);
    t.R = false;
    if (i) {
        Ne(t);
        return new TaggedTemplateExpression(n, n, r, o);
    } else {
        Ne(t);
        return new TemplateExpression(n, o);
    }
}

function Ne(t) {
    while (t.index < t.length) {
        t.C = t.index;
        if (null != (t.$ = is[t.O](t))) return;
    }
    t.$ = 1572864;
}

function Ke(t) {
    return t.O = t.ip.charCodeAt(++t.index);
}

function qe(t) {
    while (rs[Ke(t)]) ;
    const e = Je[t.L = t.P];
    return void 0 === e ? 1024 : e;
}

function He(t, e) {
    let s = t.O;
    if (false === e) {
        do {
            s = Ke(t);
        } while (s <= 57 && s >= 48);
        if (46 !== s) {
            t.L = parseInt(t.P, 10);
            return 8192;
        }
        s = Ke(t);
        if (t.index >= t.length) {
            t.L = parseInt(t.P.slice(0, -1), 10);
            return 8192;
        }
    }
    if (s <= 57 && s >= 48) do {
        s = Ke(t);
    } while (s <= 57 && s >= 48); else t.O = t.ip.charCodeAt(--t.index);
    t.L = parseFloat(t.P);
    return 8192;
}

function Qe(t) {
    const e = t.O;
    Ke(t);
    let s = 0;
    const r = new Array;
    let i = t.index;
    while (t.O !== e) if (92 === t.O) {
        r.push(t.ip.slice(i, t.index));
        Ke(t);
        s = ye(t.O);
        Ke(t);
        r.push(String.fromCharCode(s));
        i = t.index;
    } else if (t.index >= t.length) throw new Error(`AUR0165:${t.ip}`); else Ke(t);
    const n = t.ip.slice(i, t.index);
    Ke(t);
    r.push(n);
    const o = r.join("");
    t.L = o;
    return 4096;
}

function _e(t) {
    let e = true;
    let s = "";
    while (96 !== Ke(t)) if (36 === t.O) if (t.index + 1 < t.length && 123 === t.ip.charCodeAt(t.index + 1)) {
        t.index++;
        e = false;
        break;
    } else s += "$"; else if (92 === t.O) s += String.fromCharCode(ye(Ke(t))); else {
        if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
        s += String.fromCharCode(t.O);
    }
    Ke(t);
    t.L = s;
    if (e) return 540714;
    return 540715;
}

function ze(t) {
    if (t.index >= t.length) throw new Error(`AUR0166:${t.ip}`);
    t.index--;
    return _e(t);
}

function We(t, e) {
    if (t.$ === e) {
        Ne(t);
        return true;
    }
    return false;
}

function Ge(t, e) {
    if (t.$ === e) Ne(t); else throw new Error(`AUR0167:${t.ip}<${e}`);
}

const Ze = [ Se, Oe, Ce, ke, "$this", null, "$parent", "(", "{", ".", "}", ")", ",", "[", "]", ":", "?", "'", '"', "&", "|", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 540714, 540715, "of" ];

const Je = E();

Je.true = 2049;

Je.null = 2050;

Je.false = 2048;

Je.undefined = 2051;

Je.$this = 3076;

Je.$parent = 3078;

Je.in = 1640799;

Je.instanceof = 1640800;

Je.typeof = 34851;

Je.void = 34852;

Je.of = 1051180;

const Xe = {
    AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
    IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
    Digit: [ 48, 58 ],
    Skip: [ 0, 33, 127, 161 ]
};

function Ye(t, e, s, r) {
    const i = s.length;
    for (let n = 0; n < i; n += 2) {
        const i = s[n];
        let o = s[n + 1];
        o = o > 0 ? o : i + 1;
        if (t) t.fill(r, i, o);
        if (e) for (let t = i; t < o; t++) e.add(t);
    }
}

function ts(t) {
    return e => {
        Ke(e);
        return t;
    };
}

const es = t => {
    throw new Error(`AUR0168:${t.ip}`);
};

es.notMapped = true;

const ss = new Set;

Ye(null, ss, Xe.AsciiIdPart, true);

const rs = new Uint8Array(65535);

Ye(rs, null, Xe.IdStart, 1);

Ye(rs, null, Xe.Digit, 1);

const is = new Array(65535);

is.fill(es, 0, 65535);

Ye(is, null, Xe.Skip, (t => {
    Ke(t);
    return null;
}));

Ye(is, null, Xe.IdStart, qe);

Ye(is, null, Xe.Digit, (t => He(t, false)));

is[34] = is[39] = t => Qe(t);

is[96] = t => _e(t);

is[33] = t => {
    if (61 !== Ke(t)) return 32809;
    if (61 !== Ke(t)) return 1638680;
    Ke(t);
    return 1638682;
};

is[61] = t => {
    if (61 !== Ke(t)) return 1048616;
    if (61 !== Ke(t)) return 1638679;
    Ke(t);
    return 1638681;
};

is[38] = t => {
    if (38 !== Ke(t)) return 1572883;
    Ke(t);
    return 1638614;
};

is[124] = t => {
    if (124 !== Ke(t)) return 1572884;
    Ke(t);
    return 1638549;
};

is[46] = t => {
    if (Ke(t) <= 57 && t.O >= 48) return He(t, true);
    return 16393;
};

is[60] = t => {
    if (61 !== Ke(t)) return 1638747;
    Ke(t);
    return 1638749;
};

is[62] = t => {
    if (61 !== Ke(t)) return 1638748;
    Ke(t);
    return 1638750;
};

is[37] = ts(1638886);

is[40] = ts(671751);

is[41] = ts(1835019);

is[42] = ts(1638885);

is[43] = ts(623009);

is[44] = ts(1572876);

is[45] = ts(623010);

is[47] = ts(1638887);

is[58] = ts(1572879);

is[63] = ts(1572880);

is[91] = ts(671757);

is[93] = ts(1835022);

is[123] = ts(131080);

is[125] = ts(1835018);

let ns = null;

const os = [];

let hs = false;

function cs() {
    hs = false;
}

function us() {
    hs = true;
}

function as() {
    return ns;
}

function ls(t) {
    if (null == t) throw new Error("AUR0206");
    if (null == ns) {
        ns = t;
        os[0] = ns;
        hs = true;
        return;
    }
    if (ns === t) throw new Error("AUR0207");
    os.push(ns);
    ns = t;
    hs = true;
}

function fs(t) {
    if (null == t) throw new Error("AUR0208");
    if (ns !== t) throw new Error("AUR0209");
    os.pop();
    ns = os.length > 0 ? os[os.length - 1] : null;
    hs = null != ns;
}

const ds = Object.freeze({
    get current() {
        return ns;
    },
    get connecting() {
        return hs;
    },
    enter: ls,
    exit: fs,
    pause: cs,
    resume: us
});

const vs = Reflect.get;

const ps = Object.prototype.toString;

const gs = new WeakMap;

function ws(t) {
    switch (ps.call(t)) {
      case "[object Object]":
      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const bs = "__raw__";

function Es(t) {
    return ws(t) ? As(t) : t;
}

function As(t) {
    var e;
    return null !== (e = gs.get(t)) && void 0 !== e ? e : xs(t);
}

function ys(t) {
    var e;
    return null !== (e = t[bs]) && void 0 !== e ? e : t;
}

function ms(t) {
    return ws(t) && t[bs] || t;
}

function Us(t) {
    return "constructor" === t || "__proto__" === t || "$observers" === t || t === Symbol.toPrimitive || t === Symbol.toStringTag;
}

function xs(t) {
    const e = t instanceof Array ? Os : t instanceof Map || t instanceof Set ? Gs : Ss;
    const s = new Proxy(t, e);
    gs.set(t, s);
    return s;
}

const Ss = {
    get(t, e, s) {
        if (e === bs) return t;
        const r = as();
        if (!hs || Us(e) || null == r) return vs(t, e, s);
        r.observe(t, e);
        return Es(vs(t, e, s));
    }
};

const Os = {
    get(t, e, s) {
        if (e === bs) return t;
        const r = as();
        if (!hs || Us(e) || null == r) return vs(t, e, s);
        switch (e) {
          case "length":
            r.observe(t, "length");
            return t.length;

          case "map":
            return Cs;

          case "includes":
            return $s;

          case "indexOf":
            return Ls;

          case "lastIndexOf":
            return Rs;

          case "every":
            return ks;

          case "filter":
            return Bs;

          case "find":
            return Ts;

          case "findIndex":
            return Ps;

          case "flat":
            return js;

          case "flatMap":
            return Is;

          case "join":
            return Ms;

          case "push":
            return Fs;

          case "pop":
            return Ds;

          case "reduce":
            return zs;

          case "reduceRight":
            return Ws;

          case "reverse":
            return qs;

          case "shift":
            return Vs;

          case "unshift":
            return Ns;

          case "slice":
            return _s;

          case "splice":
            return Ks;

          case "some":
            return Hs;

          case "sort":
            return Qs;

          case "keys":
            return rr;

          case "values":
          case Symbol.iterator:
            return ir;

          case "entries":
            return nr;
        }
        r.observe(t, e);
        return Es(vs(t, e, s));
    },
    ownKeys(t) {
        var e;
        null === (e = as()) || void 0 === e ? void 0 : e.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function Cs(t, e) {
    var s;
    const r = ys(this);
    const i = r.map(((s, r) => ms(t.call(e, Es(s), r, this))));
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Es(i);
}

function ks(t, e) {
    var s;
    const r = ys(this);
    const i = r.every(((s, r) => t.call(e, Es(s), r, this)));
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function Bs(t, e) {
    var s;
    const r = ys(this);
    const i = r.filter(((s, r) => ms(t.call(e, Es(s), r, this))));
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Es(i);
}

function $s(t) {
    var e;
    const s = ys(this);
    const r = s.includes(ms(t));
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function Ls(t) {
    var e;
    const s = ys(this);
    const r = s.indexOf(ms(t));
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function Rs(t) {
    var e;
    const s = ys(this);
    const r = s.lastIndexOf(ms(t));
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return r;
}

function Ps(t, e) {
    var s;
    const r = ys(this);
    const i = r.findIndex(((s, r) => ms(t.call(e, Es(s), r, this))));
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function Ts(t, e) {
    var s;
    const r = ys(this);
    const i = r.find(((e, s) => t(Es(e), s, this)), e);
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Es(i);
}

function js() {
    var t;
    const e = ys(this);
    null === (t = as()) || void 0 === t ? void 0 : t.observeCollection(e);
    return Es(e.flat());
}

function Is(t, e) {
    var s;
    const r = ys(this);
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return As(r.flatMap(((s, r) => Es(t.call(e, Es(s), r, this)))));
}

function Ms(t) {
    var e;
    const s = ys(this);
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return s.join(t);
}

function Ds() {
    return Es(ys(this).pop());
}

function Fs(...t) {
    return ys(this).push(...t);
}

function Vs() {
    return Es(ys(this).shift());
}

function Ns(...t) {
    return ys(this).unshift(...t);
}

function Ks(...t) {
    return Es(ys(this).splice(...t));
}

function qs(...t) {
    var e;
    const s = ys(this);
    const r = s.reverse();
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return Es(r);
}

function Hs(t, e) {
    var s;
    const r = ys(this);
    const i = r.some(((s, r) => ms(t.call(e, Es(s), r, this))));
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return i;
}

function Qs(t) {
    var e;
    const s = ys(this);
    const r = s.sort(t);
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return Es(r);
}

function _s(t, e) {
    var s;
    const r = ys(this);
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return As(r.slice(t, e));
}

function zs(t, e) {
    var s;
    const r = ys(this);
    const i = r.reduce(((e, s, r) => t(e, Es(s), r, this)), e);
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Es(i);
}

function Ws(t, e) {
    var s;
    const r = ys(this);
    const i = r.reduceRight(((e, s, r) => t(e, Es(s), r, this)), e);
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return Es(i);
}

const Gs = {
    get(t, e, s) {
        if (e === bs) return t;
        const r = as();
        if (!hs || Us(e) || null == r) return vs(t, e, s);
        switch (e) {
          case "size":
            r.observe(t, "size");
            return t.size;

          case "clear":
            return er;

          case "delete":
            return sr;

          case "forEach":
            return Zs;

          case "add":
            if (t instanceof Set) return tr;
            break;

          case "get":
            if (t instanceof Map) return Xs;
            break;

          case "set":
            if (t instanceof Map) return Ys;
            break;

          case "has":
            return Js;

          case "keys":
            return rr;

          case "values":
            return ir;

          case "entries":
            return nr;

          case Symbol.iterator:
            return t instanceof Map ? nr : ir;
        }
        return Es(vs(t, e, s));
    }
};

function Zs(t, e) {
    var s;
    const r = ys(this);
    null === (s = as()) || void 0 === s ? void 0 : s.observeCollection(r);
    return r.forEach(((s, r) => {
        t.call(e, Es(s), Es(r), this);
    }));
}

function Js(t) {
    var e;
    const s = ys(this);
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return s.has(ms(t));
}

function Xs(t) {
    var e;
    const s = ys(this);
    null === (e = as()) || void 0 === e ? void 0 : e.observeCollection(s);
    return Es(s.get(ms(t)));
}

function Ys(t, e) {
    return Es(ys(this).set(ms(t), ms(e)));
}

function tr(t) {
    return Es(ys(this).add(ms(t)));
}

function er() {
    return Es(ys(this).clear());
}

function sr(t) {
    return Es(ys(this).delete(ms(t)));
}

function rr() {
    var t;
    const e = ys(this);
    null === (t = as()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Es(e),
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function ir() {
    var t;
    const e = ys(this);
    null === (t = as()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: Es(e),
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function nr() {
    var t;
    const e = ys(this);
    null === (t = as()) || void 0 === t ? void 0 : t.observeCollection(e);
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
                value: [ Es(e[0]), Es(e[1]) ],
                done: r
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const or = Object.freeze({
    getProxy: As,
    getRaw: ys,
    wrap: Es,
    unwrap: ms,
    rawKey: bs
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
    static create(t, e, s, r, i) {
        const n = s.get;
        const o = s.set;
        const h = new ComputedObserver(t, n, o, i, r);
        const c = () => h.getValue();
        c.getObserver = () => h;
        v(t, e, {
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
        if (0 === this.subs.count) return this.get.call(this.o, this);
        if (this.D) {
            this.compute();
            this.D = false;
        }
        return this.v;
    }
    setValue(t, e) {
        if (p(this.set)) {
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
        hr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, hr, 0);
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
            ls(this);
            return this.v = ms(this.get.call(this.up ? Es(this.o) : this.o, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            fs(this);
        }
    }
}

be(ComputedObserver);

st(ComputedObserver);

ht(ComputedObserver);

let hr;

const cr = r.createInterface("IDirtyChecker", (t => t.singleton(DirtyChecker)));

const ur = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

const ar = {
    persistent: true
};

class DirtyChecker {
    constructor(t) {
        this.p = t;
        this.tracked = [];
        this.T = null;
        this.j = 0;
        this.check = () => {
            if (ur.disabled) return;
            if (++this.j < ur.timeoutsPerCheck) return;
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
        if (ur.throw) throw new Error(`AUR0222:${e}`);
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (1 === this.tracked.length) this.T = this.p.taskQueue.queueTask(this.check, ar);
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (0 === this.tracked.length) {
            this.T.cancel();
            this.T = null;
        }
    }
}

DirtyChecker.inject = [ l ];

ht(DirtyChecker);

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

st(DirtyCheckProperty);

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

let lr;

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
        lr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, lr, this.f);
    }
    start() {
        if (false === this.iO) {
            this.iO = true;
            this.v = this.o[this.k];
            v(this.o, this.k, {
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
            v(this.o, this.k, {
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
        this.hs = p(s);
        const i = t[e];
        this.cb = p(i) ? i : void 0;
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
        lr = this.ov;
        this.ov = this.v;
        this.subs.notify(this.v, lr, this.f);
    }
}

st(SetterObserver);

st(SetterNotifier);

ht(SetterObserver);

ht(SetterNotifier);

const fr = new PropertyAccessor;

const dr = r.createInterface("IObserverLocator", (t => t.singleton(ObserverLocator)));

const vr = r.createInterface("INodeObserverLocator", (t => t.cachedCallback((t => {
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
        return fr;
    }
    getAccessor() {
        return fr;
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
        return fr;
    }
    getArrayObserver(t) {
        return Tt(t);
    }
    getMapObserver(t) {
        return ce(t);
    }
    getSetObserver(t) {
        return Gt(t);
    }
    createObserver(t, e) {
        var s, r, i, n;
        if (!(t instanceof Object)) return new PrimitiveObserver(t, e);
        if (this.M.handles(t, e, this)) return this.M.getObserver(t, e, this);
        switch (e) {
          case "length":
            if (t instanceof Array) return Tt(t).getLengthObserver();
            break;

          case "size":
            if (t instanceof Map) return ce(t).getLengthObserver(); else if (t instanceof Set) return Gt(t).getLengthObserver();
            break;

          default:
            if (t instanceof Array && a(e)) return Tt(t).getIndexObserver(Number(e));
            break;
        }
        let o = wr(t, e);
        if (void 0 === o) {
            let s = gr(t);
            while (null !== s) {
                o = wr(s, e);
                if (void 0 === o) s = gr(s); else break;
            }
        }
        if (void 0 !== o && !d.call(o, "value")) {
            let h = this.N(t, e, o);
            if (null == h) h = null === (n = null !== (r = null === (s = o.get) || void 0 === s ? void 0 : s.getObserver) && void 0 !== r ? r : null === (i = o.set) || void 0 === i ? void 0 : i.getObserver) || void 0 === n ? void 0 : n(t, this);
            return null == h ? o.configurable ? ComputedObserver.create(t, e, o, this, true) : this.I.createProperty(t, e) : h;
        }
        return new SetterObserver(t, e);
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
            v(t, "$observers", {
                value: {
                    [e]: s
                }
            });
            return s;
        }
        return t.$observers[e] = s;
    }
}

ObserverLocator.inject = [ cr, vr ];

function pr(t) {
    let e;
    if (t instanceof Array) e = Tt(t); else if (t instanceof Map) e = ce(t); else if (t instanceof Set) e = Gt(t);
    return e;
}

const gr = Object.getPrototypeOf;

const wr = Object.getOwnPropertyDescriptor;

const br = r.createInterface("IObservation", (t => t.singleton(Observation)));

class Observation {
    constructor(t) {
        this.oL = t;
    }
    static get inject() {
        return [ dr ];
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
            ls(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            fs(this);
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

be(Effect);

function Er(t) {
    if (void 0 === t.$observers) v(t, "$observers", {
        value: {}
    });
    return t.$observers;
}

const Ar = {};

function yr(t, e, s) {
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
        let h = Ar;
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
            const r = mr(this, e, o, h, c);
            null === (s = as()) || void 0 === s ? void 0 : s.subscribeTo(r);
            return r.getValue();
        };
        s.set = function t(s) {
            mr(this, e, o, h, c).setValue(s, 0);
        };
        s.get.getObserver = function t(s) {
            return mr(s, e, o, h, c);
        };
        if (n) v(t.prototype, e, s); else return s;
    }
}

function mr(t, e, s, r, i) {
    const n = Er(t);
    let o = n[e];
    if (null == o) {
        o = new SetterNotifier(t, s, i, r === Ar ? void 0 : r);
        n[e] = o;
    }
    return o;
}

export { me as Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, J as AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, T as BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, $ as BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, _ as BindingMode, BindingObserverRecord, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Ae as Char, Z as CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, ds as ConnectableSwitcher, CustomExpression, G as DelegationStrategy, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, DirtyCheckProperty, ur as DirtyCheckSettings, F as ExpressionKind, Le as ExpressionType, FlushQueue, ForOfStatement, HtmlLiteralExpression, cr as IDirtyChecker, Ee as IExpressionParser, vr as INodeObserverLocator, br as IObservation, dr as IObserverLocator, B as ISignaler, Interpolation, z as LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, Ue as Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, or as ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, D as ValueConverter, ValueConverterDefinition, ValueConverterExpression, O as alias, jt as applyMutationsToIndices, L as bindingBehavior, tt as cloneIndexMap, be as connectable, X as copyIndexMap, Y as createIndexMap, Pt as disableArrayObservation, he as disableMapObservation, Wt as disableSetObservation, Rt as enableArrayObservation, oe as enableMapObservation, zt as enableSetObservation, pr as getCollectionObserver, et as isIndexMap, yr as observable, Te as parse, Pe as parseExpression, C as registerAliases, st as subscriberCollection, It as synchronizeIndices, j as valueConverter, ht as withFlushQueue };
//# sourceMappingURL=index.js.map
