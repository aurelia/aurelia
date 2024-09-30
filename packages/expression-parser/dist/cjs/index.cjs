"use strict";

var e = require("@aurelia/kernel");

const s = "AccessThis";

const t = "AccessBoundary";

const r = "AccessGlobal";

const n = "AccessScope";

const i = "ArrayLiteral";

const o = "ObjectLiteral";

const a = "PrimitiveLiteral";

const c = "Template";

const h = "Unary";

const l = "CallScope";

const u = "CallMember";

const p = "CallFunction";

const x = "CallGlobal";

const f = "AccessMember";

const w = "AccessKeyed";

const E = "TaggedTemplate";

const d = "Binary";

const k = "Conditional";

const m = "Assign";

const b = "ArrowFunction";

const A = "ValueConverter";

const C = "BindingBehavior";

const g = "ArrayBindingPattern";

const T = "ObjectBindingPattern";

const v = "BindingIdentifier";

const y = "ForOfStatement";

const L = "Interpolation";

const P = "ArrayDestructuring";

const I = "ObjectDestructuring";

const S = "DestructuringAssignmentLeaf";

const B = "Custom";

class CustomExpression {
    constructor(e) {
        this.value = e;
        this.$kind = B;
    }
    evaluate(...e) {
        return this.value;
    }
    assign(...e) {
        return e;
    }
    bind(...e) {}
    unbind(...e) {}
    accept(e) {
        return void 0;
    }
}

class BindingBehaviorExpression {
    constructor(e, s, t) {
        this.expression = e;
        this.name = s;
        this.args = t;
        this.$kind = C;
        this.key = `_bb_${s}`;
    }
}

class ValueConverterExpression {
    constructor(e, s, t) {
        this.expression = e;
        this.name = s;
        this.args = t;
        this.$kind = A;
    }
}

class AssignExpression {
    constructor(e, s, t = "=") {
        this.target = e;
        this.value = s;
        this.op = t;
        this.$kind = m;
    }
}

class ConditionalExpression {
    constructor(e, s, t) {
        this.condition = e;
        this.yes = s;
        this.no = t;
        this.$kind = k;
    }
}

class AccessGlobalExpression {
    constructor(e) {
        this.name = e;
        this.$kind = r;
    }
}

class AccessThisExpression {
    constructor(e = 0) {
        this.ancestor = e;
        this.$kind = s;
    }
}

class AccessBoundaryExpression {
    constructor() {
        this.$kind = t;
    }
}

class AccessScopeExpression {
    constructor(e, s = 0) {
        this.name = e;
        this.ancestor = s;
        this.$kind = n;
    }
}

const isAccessGlobal = e => e.$kind === r || (e.$kind === f || e.$kind === w) && e.accessGlobal;

class AccessMemberExpression {
    constructor(e, s, t = false) {
        this.object = e;
        this.name = s;
        this.optional = t;
        this.$kind = f;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class AccessKeyedExpression {
    constructor(e, s, t = false) {
        this.object = e;
        this.key = s;
        this.optional = t;
        this.$kind = w;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class CallScopeExpression {
    constructor(e, s, t = 0, r = false) {
        this.name = e;
        this.args = s;
        this.ancestor = t;
        this.optional = r;
        this.$kind = l;
    }
}

class CallMemberExpression {
    constructor(e, s, t, r = false, n = false) {
        this.object = e;
        this.name = s;
        this.args = t;
        this.optionalMember = r;
        this.optionalCall = n;
        this.$kind = u;
    }
}

class CallFunctionExpression {
    constructor(e, s, t = false) {
        this.func = e;
        this.args = s;
        this.optional = t;
        this.$kind = p;
    }
}

class CallGlobalExpression {
    constructor(e, s) {
        this.name = e;
        this.args = s;
        this.$kind = x;
    }
}

class BinaryExpression {
    constructor(e, s, t) {
        this.operation = e;
        this.left = s;
        this.right = t;
        this.$kind = d;
    }
}

class UnaryExpression {
    constructor(e, s, t = 0) {
        this.operation = e;
        this.expression = s;
        this.pos = t;
        this.$kind = h;
    }
}

class PrimitiveLiteralExpression {
    constructor(e) {
        this.value = e;
        this.$kind = a;
    }
}

PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);

PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);

PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);

PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);

PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression("");

class ArrayLiteralExpression {
    constructor(e) {
        this.elements = e;
        this.$kind = i;
    }
}

ArrayLiteralExpression.$empty = new ArrayLiteralExpression(e.emptyArray);

class ObjectLiteralExpression {
    constructor(e, s) {
        this.keys = e;
        this.values = s;
        this.$kind = o;
    }
}

ObjectLiteralExpression.$empty = new ObjectLiteralExpression(e.emptyArray, e.emptyArray);

class TemplateExpression {
    constructor(s, t = e.emptyArray) {
        this.cooked = s;
        this.expressions = t;
        this.$kind = c;
    }
}

TemplateExpression.$empty = new TemplateExpression([ "" ]);

class TaggedTemplateExpression {
    constructor(s, t, r, n = e.emptyArray) {
        this.cooked = s;
        this.func = r;
        this.expressions = n;
        this.$kind = E;
        s.raw = t;
    }
}

class ArrayBindingPattern {
    constructor(e) {
        this.elements = e;
        this.$kind = g;
    }
}

class ObjectBindingPattern {
    constructor(e, s) {
        this.keys = e;
        this.values = s;
        this.$kind = T;
    }
}

class BindingIdentifier {
    constructor(e) {
        this.name = e;
        this.$kind = v;
    }
}

class ForOfStatement {
    constructor(e, s, t) {
        this.declaration = e;
        this.iterable = s;
        this.semiIdx = t;
        this.$kind = y;
    }
}

class Interpolation {
    constructor(s, t = e.emptyArray) {
        this.parts = s;
        this.expressions = t;
        this.$kind = L;
        this.isMulti = t.length > 1;
        this.firstExpression = t[0];
    }
}

class DestructuringAssignmentExpression {
    constructor(e, s, t, r) {
        this.$kind = e;
        this.list = s;
        this.source = t;
        this.initializer = r;
    }
}

class DestructuringAssignmentSingleExpression {
    constructor(e, s, t) {
        this.target = e;
        this.source = s;
        this.initializer = t;
        this.$kind = S;
    }
}

class DestructuringAssignmentRestExpression {
    constructor(e, s) {
        this.target = e;
        this.indexOrProperties = s;
        this.$kind = S;
    }
}

class ArrowFunction {
    constructor(e, s, t = false) {
        this.args = e;
        this.body = s;
        this.rest = t;
        this.$kind = b;
    }
}

const createError = e => new Error(e);

const isString = e => typeof e === "string";

const $ = String;

const createLookup = () => Object.create(null);

const astVisit = (e, r) => {
    switch (e.$kind) {
      case w:
        return r.visitAccessKeyed(e);

      case f:
        return r.visitAccessMember(e);

      case n:
        return r.visitAccessScope(e);

      case s:
        return r.visitAccessThis(e);

      case t:
        return r.visitAccessBoundary(e);

      case g:
        return r.visitArrayBindingPattern(e);

      case P:
        return r.visitDestructuringAssignmentExpression(e);

      case i:
        return r.visitArrayLiteral(e);

      case b:
        return r.visitArrowFunction(e);

      case m:
        return r.visitAssign(e);

      case d:
        return r.visitBinary(e);

      case C:
        return r.visitBindingBehavior(e);

      case v:
        return r.visitBindingIdentifier(e);

      case p:
        return r.visitCallFunction(e);

      case u:
        return r.visitCallMember(e);

      case l:
        return r.visitCallScope(e);

      case k:
        return r.visitConditional(e);

      case S:
        return r.visitDestructuringAssignmentSingleExpression(e);

      case y:
        return r.visitForOfStatement(e);

      case L:
        return r.visitInterpolation(e);

      case T:
        return r.visitObjectBindingPattern(e);

      case I:
        return r.visitDestructuringAssignmentExpression(e);

      case o:
        return r.visitObjectLiteral(e);

      case a:
        return r.visitPrimitiveLiteral(e);

      case E:
        return r.visitTaggedTemplate(e);

      case c:
        return r.visitTemplate(e);

      case h:
        return r.visitUnary(e);

      case A:
        return r.visitValueConverter(e);

      case B:
        return r.visitCustom(e);

      default:
        {
            throw createError(`Trying to visit unknown ast node ${JSON.stringify(e)}`);
        }
    }
};

class Unparser {
    constructor() {
        this.text = "";
    }
    static unparse(e) {
        const s = new Unparser;
        astVisit(e, s);
        return s.text;
    }
    visitAccessMember(e) {
        astVisit(e.object, this);
        this.text += `${e.optional ? "?" : ""}.${e.name}`;
    }
    visitAccessKeyed(e) {
        astVisit(e.object, this);
        this.text += `${e.optional ? "?." : ""}[`;
        astVisit(e.key, this);
        this.text += "]";
    }
    visitAccessThis(e) {
        if (e.ancestor === 0) {
            this.text += "$this";
            return;
        }
        this.text += "$parent";
        let s = e.ancestor - 1;
        while (s--) {
            this.text += ".$parent";
        }
    }
    visitAccessBoundary(e) {
        this.text += "this";
    }
    visitAccessScope(e) {
        let s = e.ancestor;
        while (s--) {
            this.text += "$parent.";
        }
        this.text += e.name;
    }
    visitArrayLiteral(e) {
        const s = e.elements;
        this.text += "[";
        for (let e = 0, t = s.length; e < t; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            astVisit(s[e], this);
        }
        this.text += "]";
    }
    visitArrowFunction(e) {
        const s = e.args;
        const t = s.length;
        let r = 0;
        let n = "(";
        let i;
        for (;r < t; ++r) {
            i = s[r].name;
            if (r > 0) {
                n += ", ";
            }
            if (r < t - 1) {
                n += i;
            } else {
                n += e.rest ? `...${i}` : i;
            }
        }
        this.text += `${n}) => `;
        astVisit(e.body, this);
    }
    visitObjectLiteral(e) {
        const s = e.keys;
        const t = e.values;
        this.text += "{";
        for (let e = 0, r = s.length; e < r; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            this.text += `'${s[e]}':`;
            astVisit(t[e], this);
        }
        this.text += "}";
    }
    visitPrimitiveLiteral(e) {
        this.text += "(";
        if (isString(e.value)) {
            const s = e.value.replace(/'/g, "\\'");
            this.text += `'${s}'`;
        } else {
            this.text += `${e.value}`;
        }
        this.text += ")";
    }
    visitCallFunction(e) {
        this.text += "(";
        astVisit(e.func, this);
        this.text += e.optional ? "?." : "";
        this.writeArgs(e.args);
        this.text += ")";
    }
    visitCallMember(e) {
        this.text += "(";
        astVisit(e.object, this);
        this.text += `${e.optionalMember ? "?." : ""}.${e.name}${e.optionalCall ? "?." : ""}`;
        this.writeArgs(e.args);
        this.text += ")";
    }
    visitCallScope(e) {
        this.text += "(";
        let s = e.ancestor;
        while (s--) {
            this.text += "$parent.";
        }
        this.text += `${e.name}${e.optional ? "?." : ""}`;
        this.writeArgs(e.args);
        this.text += ")";
    }
    visitTemplate(e) {
        const {cooked: s, expressions: t} = e;
        const r = t.length;
        this.text += "`";
        this.text += s[0];
        for (let e = 0; e < r; e++) {
            astVisit(t[e], this);
            this.text += s[e + 1];
        }
        this.text += "`";
    }
    visitTaggedTemplate(e) {
        const {cooked: s, expressions: t} = e;
        const r = t.length;
        astVisit(e.func, this);
        this.text += "`";
        this.text += s[0];
        for (let e = 0; e < r; e++) {
            astVisit(t[e], this);
            this.text += s[e + 1];
        }
        this.text += "`";
    }
    visitUnary(e) {
        this.text += `(${e.operation}`;
        if (e.operation.charCodeAt(0) >= 97) {
            this.text += " ";
        }
        astVisit(e.expression, this);
        this.text += ")";
    }
    visitBinary(e) {
        this.text += "(";
        astVisit(e.left, this);
        if (e.operation.charCodeAt(0) === 105) {
            this.text += ` ${e.operation} `;
        } else {
            this.text += e.operation;
        }
        astVisit(e.right, this);
        this.text += ")";
    }
    visitConditional(e) {
        this.text += "(";
        astVisit(e.condition, this);
        this.text += "?";
        astVisit(e.yes, this);
        this.text += ":";
        astVisit(e.no, this);
        this.text += ")";
    }
    visitAssign(e) {
        this.text += "(";
        astVisit(e.target, this);
        this.text += "=";
        astVisit(e.value, this);
        this.text += ")";
    }
    visitValueConverter(e) {
        const s = e.args;
        astVisit(e.expression, this);
        this.text += `|${e.name}`;
        for (let e = 0, t = s.length; e < t; ++e) {
            this.text += ":";
            astVisit(s[e], this);
        }
    }
    visitBindingBehavior(e) {
        const s = e.args;
        astVisit(e.expression, this);
        this.text += `&${e.name}`;
        for (let e = 0, t = s.length; e < t; ++e) {
            this.text += ":";
            astVisit(s[e], this);
        }
    }
    visitArrayBindingPattern(e) {
        const s = e.elements;
        this.text += "[";
        for (let e = 0, t = s.length; e < t; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            astVisit(s[e], this);
        }
        this.text += "]";
    }
    visitObjectBindingPattern(e) {
        const s = e.keys;
        const t = e.values;
        this.text += "{";
        for (let e = 0, r = s.length; e < r; ++e) {
            if (e !== 0) {
                this.text += ",";
            }
            this.text += `'${s[e]}':`;
            astVisit(t[e], this);
        }
        this.text += "}";
    }
    visitBindingIdentifier(e) {
        this.text += e.name;
    }
    visitForOfStatement(e) {
        astVisit(e.declaration, this);
        this.text += " of ";
        astVisit(e.iterable, this);
    }
    visitInterpolation(e) {
        const {parts: s, expressions: t} = e;
        const r = t.length;
        this.text += "${";
        this.text += s[0];
        for (let e = 0; e < r; e++) {
            astVisit(t[e], this);
            this.text += s[e + 1];
        }
        this.text += "}";
    }
    visitDestructuringAssignmentExpression(e) {
        const s = e.$kind;
        const t = s === I;
        this.text += t ? "{" : "[";
        const r = e.list;
        const n = r.length;
        let i;
        let o;
        for (i = 0; i < n; i++) {
            o = r[i];
            switch (o.$kind) {
              case S:
                astVisit(o, this);
                break;

              case P:
              case I:
                {
                    const e = o.source;
                    if (e) {
                        astVisit(e, this);
                        this.text += ":";
                    }
                    astVisit(o, this);
                    break;
                }
            }
        }
        this.text += t ? "}" : "]";
    }
    visitDestructuringAssignmentSingleExpression(e) {
        astVisit(e.source, this);
        this.text += ":";
        astVisit(e.target, this);
        const s = e.initializer;
        if (s !== void 0) {
            this.text += "=";
            astVisit(s, this);
        }
    }
    visitDestructuringAssignmentRestExpression(e) {
        this.text += "...";
        astVisit(e.target, this);
    }
    visitCustom(e) {
        this.text += $(e.value);
    }
    writeArgs(e) {
        this.text += "(";
        for (let s = 0, t = e.length; s < t; ++s) {
            if (s !== 0) {
                this.text += ",";
            }
            astVisit(e[s], this);
        }
        this.text += ")";
    }
}

const createMappedError = (e, ...s) => new Error(`AUR${$(e).padStart(4, "0")}:${s.map($)}`);

const O = /*@__PURE__*/ e.DI.createInterface("IExpressionParser");

class ExpressionParser {
    constructor() {
        this.t = createLookup();
        this.i = createLookup();
        this.h = createLookup();
    }
    parse(e, s) {
        let t;
        switch (s) {
          case _:
            return new CustomExpression(e);

          case G:
            t = this.h[e];
            if (t === void 0) {
                t = this.h[e] = this.$parse(e, s);
            }
            return t;

          case H:
            t = this.i[e];
            if (t === void 0) {
                t = this.i[e] = this.$parse(e, s);
            }
            return t;

          default:
            {
                if (e.length === 0) {
                    if (s === z || s === J) {
                        return PrimitiveLiteralExpression.$empty;
                    }
                    throw invalidEmptyExpression();
                }
                t = this.t[e];
                if (t === void 0) {
                    t = this.t[e] = this.$parse(e, s);
                }
                return t;
            }
        }
    }
    $parse(e, s) {
        q = e;
        Q = 0;
        W = e.length;
        X = 0;
        Y = 0;
        Z = 6291456;
        ee = "";
        se = $charCodeAt(0);
        te = true;
        re = false;
        ne = true;
        ie = -1;
        return parse(61, s === void 0 ? J : s);
    }
}

ExpressionParser.register = e.createImplementationRegister(O);

function unescapeCode(e) {
    switch (e) {
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
        return e;
    }
}

const F = PrimitiveLiteralExpression.$false;

const M = PrimitiveLiteralExpression.$true;

const j = PrimitiveLiteralExpression.$null;

const D = PrimitiveLiteralExpression.$undefined;

const U = new AccessThisExpression(0);

const K = new AccessThisExpression(1);

const N = new AccessBoundaryExpression;

const R = "None";

const G = "Interpolation";

const H = "IsIterator";

const V = "IsChainable";

const z = "IsFunction";

const J = "IsProperty";

const _ = "IsCustom";

let q = "";

let Q = 0;

let W = 0;

let X = 0;

let Y = 0;

let Z = 6291456;

let ee = "";

let se;

let te = true;

let re = false;

let ne = true;

let ie = -1;

const oe = String.fromCharCode;

const $charCodeAt = e => q.charCodeAt(e);

const $tokenRaw = () => q.slice(Y, Q);

const ae = ("Infinity NaN isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent" + " Array BigInt Boolean Date Map Number Object RegExp Set String JSON Math Intl").split(" ");

function parseExpression(e, s) {
    q = e;
    Q = 0;
    W = e.length;
    X = 0;
    Y = 0;
    Z = 6291456;
    ee = "";
    se = $charCodeAt(0);
    te = true;
    re = false;
    ne = true;
    ie = -1;
    return parse(61, s === void 0 ? J : s);
}

function parse(e, t) {
    if (t === _) {
        return new CustomExpression(q);
    }
    if (Q === 0) {
        if (t === G) {
            return parseInterpolation();
        }
        nextToken();
        if (Z & 4194304) {
            throw invalidStartOfExpression();
        }
    }
    te = 513 > e;
    re = false;
    ne = 514 > e;
    let i = false;
    let o = void 0;
    let a = 0;
    if (Z & 131072) {
        const e = he[Z & 63];
        nextToken();
        o = new UnaryExpression(e, parse(514, t));
        te = false;
    } else {
        e: switch (Z) {
          case 12295:
            a = X;
            te = false;
            ne = false;
            do {
                nextToken();
                ++a;
                switch (Z) {
                  case 65546:
                    nextToken();
                    if ((Z & 12288) === 0) {
                        throw expectedIdentifier();
                    }
                    break;

                  case 11:
                  case 12:
                    throw expectedIdentifier();

                  case 2162701:
                    re = true;
                    nextToken();
                    if ((Z & 12288) === 0) {
                        o = a === 0 ? U : a === 1 ? K : new AccessThisExpression(a);
                        i = true;
                        break e;
                    }
                    break;

                  default:
                    if (Z & 2097152) {
                        o = a === 0 ? U : a === 1 ? K : new AccessThisExpression(a);
                        break e;
                    }
                    throw invalidMemberExpression();
                }
            } while (Z === 12295);

          case 4096:
            {
                const e = ee;
                if (t === H) {
                    o = new BindingIdentifier(e);
                } else if (ne && ae.includes(e)) {
                    o = new AccessGlobalExpression(e);
                } else if (ne && e === "import") {
                    throw unexpectedImportKeyword();
                } else {
                    o = new AccessScopeExpression(e, a);
                }
                te = !re;
                nextToken();
                if (consumeOpt(51)) {
                    if (Z === 524297) {
                        throw functionBodyInArrowFn();
                    }
                    const s = re;
                    const t = X;
                    ++X;
                    const r = parse(62, R);
                    re = s;
                    X = t;
                    te = false;
                    o = new ArrowFunction([ new BindingIdentifier(e) ], r);
                }
                break;
            }

          case 11:
            throw unexpectedDoubleDot();

          case 12:
            throw invalidSpreadOp();

          case 12292:
            te = false;
            nextToken();
            switch (X) {
              case 0:
                o = U;
                break;

              case 1:
                o = K;
                break;

              default:
                o = new AccessThisExpression(X);
                break;
            }
            break;

          case 12293:
            te = false;
            nextToken();
            o = N;
            break;

          case 2688008:
            o = parseCoverParenthesizedExpressionAndArrowParameterList(t);
            break;

          case 2688019:
            o = q.search(/\s+of\s+/) > Q ? parseArrayDestructuring() : parseArrayLiteralExpression(t);
            break;

          case 524297:
            o = parseObjectLiteralExpression(t);
            break;

          case 2163760:
            o = new TemplateExpression([ ee ]);
            te = false;
            nextToken();
            break;

          case 2163761:
            o = parseTemplate(t, o, false);
            break;

          case 16384:
          case 32768:
            o = new PrimitiveLiteralExpression(ee);
            te = false;
            nextToken();
            break;

          case 8194:
          case 8195:
          case 8193:
          case 8192:
            o = he[Z & 63];
            te = false;
            nextToken();
            break;

          default:
            if (Q >= W) {
                throw unexpectedEndOfExpression();
            } else {
                throw unconsumedToken();
            }
        }
        if (t === H) {
            return parseForOfStatement(o);
        }
        switch (Z) {
          case 2228280:
          case 2228281:
            o = new UnaryExpression(he[Z & 63], o, 1);
            nextToken();
            te = false;
            break;
        }
        if (514 < e) {
            return o;
        }
        if (Z === 11 || Z === 12) {
            throw expectedIdentifier();
        }
        if (o.$kind === s) {
            switch (Z) {
              case 2162701:
                re = true;
                te = false;
                nextToken();
                if ((Z & 13312) === 0) {
                    throw unexpectedTokenInOptionalChain();
                }
                if (Z & 12288) {
                    o = new AccessScopeExpression(ee, o.ancestor);
                    nextToken();
                } else if (Z === 2688008) {
                    o = new CallFunctionExpression(o, parseArguments(), true);
                } else if (Z === 2688019) {
                    o = parseKeyedExpression(o, true);
                } else {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                break;

              case 65546:
                te = !re;
                nextToken();
                if ((Z & 12288) === 0) {
                    throw expectedIdentifier();
                }
                o = new AccessScopeExpression(ee, o.ancestor);
                nextToken();
                break;

              case 11:
              case 12:
                throw expectedIdentifier();

              case 2688008:
                o = new CallFunctionExpression(o, parseArguments(), i);
                break;

              case 2688019:
                o = parseKeyedExpression(o, i);
                break;

              case 2163760:
                o = createTemplateTail(o);
                break;

              case 2163761:
                o = parseTemplate(t, o, true);
                break;
            }
        }
        while ((Z & 65536) > 0) {
            switch (Z) {
              case 2162701:
                o = parseOptionalChainLHS(o);
                break;

              case 65546:
                nextToken();
                if ((Z & 12288) === 0) {
                    throw expectedIdentifier();
                }
                o = parseMemberExpressionLHS(o, false);
                break;

              case 11:
              case 12:
                throw expectedIdentifier();

              case 2688008:
                if (o.$kind === n) {
                    o = new CallScopeExpression(o.name, parseArguments(), o.ancestor, false);
                } else if (o.$kind === f) {
                    o = new CallMemberExpression(o.object, o.name, parseArguments(), o.optional, false);
                } else if (o.$kind === r) {
                    o = new CallGlobalExpression(o.name, parseArguments());
                } else {
                    o = new CallFunctionExpression(o, parseArguments(), false);
                }
                break;

              case 2688019:
                o = parseKeyedExpression(o, false);
                break;

              case 2163760:
                if (re) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                o = createTemplateTail(o);
                break;

              case 2163761:
                if (re) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                o = parseTemplate(t, o, true);
                break;
            }
        }
    }
    if (Z === 11 || Z === 12) {
        throw expectedIdentifier();
    }
    if (513 < e) {
        return o;
    }
    while ((Z & 262144) > 0) {
        const s = Z;
        if ((s & 960) <= e) {
            break;
        }
        nextToken();
        o = new BinaryExpression(he[s & 63], o, parse(s & 960, t));
        te = false;
    }
    if (63 < e) {
        return o;
    }
    if (consumeOpt(6291479)) {
        const e = parse(62, t);
        consume(6291477);
        o = new ConditionalExpression(o, e, parse(62, t));
        te = false;
    }
    if (62 < e) {
        return o;
    }
    switch (Z) {
      case 4194350:
      case 4194356:
      case 4194357:
      case 4194358:
      case 4194359:
        {
            if (!te) {
                throw lhsNotAssignable();
            }
            const e = he[Z & 63];
            nextToken();
            o = new AssignExpression(o, parse(62, t), e);
            break;
        }
    }
    if (61 < e) {
        return o;
    }
    while (consumeOpt(6291481)) {
        if (Z === 6291456) {
            throw expectedValueConverterIdentifier();
        }
        const e = ee;
        nextToken();
        const s = new Array;
        while (consumeOpt(6291477)) {
            s.push(parse(62, t));
        }
        o = new ValueConverterExpression(o, e, s);
    }
    while (consumeOpt(6291480)) {
        if (Z === 6291456) {
            throw expectedBindingBehaviorIdentifier();
        }
        const e = ee;
        nextToken();
        const s = new Array;
        while (consumeOpt(6291477)) {
            s.push(parse(62, t));
        }
        o = new BindingBehaviorExpression(o, e, s);
    }
    if (Z !== 6291456) {
        if (t === G && Z === 7340046) {
            return o;
        }
        if (t === V && Z === 6291478) {
            if (Q === W) {
                throw unconsumedToken();
            }
            ie = Q - 1;
            return o;
        }
        if ($tokenRaw() === "of") {
            throw unexpectedOfKeyword();
        }
        throw unconsumedToken();
    }
    return o;
}

function parseArrayDestructuring() {
    const e = [];
    const s = new DestructuringAssignmentExpression(P, e, void 0, void 0);
    let t = "";
    let r = true;
    let n = 0;
    while (r) {
        nextToken();
        switch (Z) {
          case 7340052:
            r = false;
            addItem();
            break;

          case 6291472:
            addItem();
            break;

          case 4096:
            t = $tokenRaw();
            break;

          default:
            throw unexpectedTokenInDestructuring();
        }
    }
    consume(7340052);
    return s;
    function addItem() {
        if (t !== "") {
            e.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression(U, t), new AccessKeyedExpression(U, new PrimitiveLiteralExpression(n++)), void 0));
            t = "";
        } else {
            n++;
        }
    }
}

function parseArguments() {
    const e = re;
    nextToken();
    const s = [];
    while (Z !== 7340047) {
        s.push(parse(62, R));
        if (!consumeOpt(6291472)) {
            break;
        }
    }
    consume(7340047);
    te = false;
    re = e;
    return s;
}

function parseKeyedExpression(e, s) {
    const t = re;
    nextToken();
    e = new AccessKeyedExpression(e, parse(62, R), s);
    consume(7340052);
    te = !t;
    re = t;
    return e;
}

function parseOptionalChainLHS(e) {
    re = true;
    te = false;
    nextToken();
    if ((Z & 13312) === 0) {
        throw unexpectedTokenInOptionalChain();
    }
    if (Z & 12288) {
        return parseMemberExpressionLHS(e, true);
    }
    if (Z === 2688008) {
        if (e.$kind === n) {
            return new CallScopeExpression(e.name, parseArguments(), e.ancestor, true);
        } else if (e.$kind === f) {
            return new CallMemberExpression(e.object, e.name, parseArguments(), e.optional, true);
        } else {
            return new CallFunctionExpression(e, parseArguments(), true);
        }
    }
    if (Z === 2688019) {
        return parseKeyedExpression(e, true);
    }
    throw invalidTaggedTemplateOnOptionalChain();
}

function parseMemberExpressionLHS(e, s) {
    const t = ee;
    switch (Z) {
      case 2162701:
        {
            re = true;
            te = false;
            const r = Q;
            const n = Y;
            const i = Z;
            const o = se;
            const a = ee;
            const c = te;
            const h = re;
            nextToken();
            if ((Z & 13312) === 0) {
                throw unexpectedTokenInOptionalChain();
            }
            if (Z === 2688008) {
                return new CallMemberExpression(e, t, parseArguments(), s, true);
            }
            Q = r;
            Y = n;
            Z = i;
            se = o;
            ee = a;
            te = c;
            re = h;
            return new AccessMemberExpression(e, t, s);
        }

      case 2688008:
        {
            te = false;
            return new CallMemberExpression(e, t, parseArguments(), s, false);
        }

      default:
        {
            te = !re;
            nextToken();
            return new AccessMemberExpression(e, t, s);
        }
    }
}

function parseCoverParenthesizedExpressionAndArrowParameterList(e) {
    nextToken();
    const s = Q;
    const t = Y;
    const r = Z;
    const n = se;
    const i = ee;
    const o = re;
    const a = [];
    let c = 1;
    let h = false;
    e: while (true) {
        if (Z === 12) {
            nextToken();
            if (Z !== 4096) {
                throw expectedIdentifier();
            }
            a.push(new BindingIdentifier(ee));
            nextToken();
            if (Z === 6291472) {
                throw restParamsMustBeLastParam();
            }
            if (Z !== 7340047) {
                throw invalidSpreadOp();
            }
            nextToken();
            if (Z !== 51) {
                throw invalidSpreadOp();
            }
            nextToken();
            const e = re;
            const s = X;
            ++X;
            const t = parse(62, R);
            re = e;
            X = s;
            te = false;
            return new ArrowFunction(a, t, true);
        }
        switch (Z) {
          case 4096:
            a.push(new BindingIdentifier(ee));
            nextToken();
            break;

          case 7340047:
            nextToken();
            break e;

          case 524297:
          case 2688019:
            nextToken();
            c = 4;
            break;

          case 6291472:
            c = 2;
            h = true;
            break e;

          case 2688008:
            c = 2;
            break e;

          default:
            nextToken();
            c = 2;
            break;
        }
        switch (Z) {
          case 6291472:
            nextToken();
            h = true;
            if (c === 1) {
                break;
            }
            break e;

          case 7340047:
            nextToken();
            break e;

          case 4194350:
            if (c === 1) {
                c = 3;
            }
            break e;

          case 51:
            if (h) {
                throw invalidArrowParameterList();
            }
            nextToken();
            c = 2;
            break e;

          default:
            if (c === 1) {
                c = 2;
            }
            break e;
        }
    }
    if (Z === 51) {
        if (c === 1) {
            nextToken();
            if (Z === 524297) {
                throw functionBodyInArrowFn();
            }
            const e = re;
            const s = X;
            ++X;
            const t = parse(62, R);
            re = e;
            X = s;
            te = false;
            return new ArrowFunction(a, t);
        }
        throw invalidArrowParameterList();
    } else if (c === 1 && a.length === 0) {
        throw missingExpectedToken();
    }
    if (h) {
        switch (c) {
          case 2:
            throw invalidArrowParameterList();

          case 3:
            throw defaultParamsInArrowFn();

          case 4:
            throw destructuringParamsInArrowFn();
        }
    }
    Q = s;
    Y = t;
    Z = r;
    se = n;
    ee = i;
    re = o;
    const l = re;
    const u = parse(62, e);
    re = l;
    consume(7340047);
    if (Z === 51) {
        switch (c) {
          case 2:
            throw invalidArrowParameterList();

          case 3:
            throw defaultParamsInArrowFn();

          case 4:
            throw destructuringParamsInArrowFn();
        }
    }
    return u;
}

function parseArrayLiteralExpression(e) {
    const s = re;
    nextToken();
    const t = new Array;
    while (Z !== 7340052) {
        if (consumeOpt(6291472)) {
            t.push(D);
            if (Z === 7340052) {
                break;
            }
        } else {
            t.push(parse(62, e === H ? R : e));
            if (consumeOpt(6291472)) {
                if (Z === 7340052) {
                    break;
                }
            } else {
                break;
            }
        }
    }
    re = s;
    consume(7340052);
    if (e === H) {
        return new ArrayBindingPattern(t);
    } else {
        te = false;
        return new ArrayLiteralExpression(t);
    }
}

const ce = [ g, T, v, P, I ];

function parseForOfStatement(e) {
    if (!ce.includes(e.$kind)) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    if (Z !== 4204594) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    nextToken();
    const s = e;
    const t = parse(61, V);
    return new ForOfStatement(s, t, ie);
}

function parseObjectLiteralExpression(e) {
    const s = re;
    const t = new Array;
    const r = new Array;
    nextToken();
    while (Z !== 7340046) {
        t.push(ee);
        if (Z & 49152) {
            nextToken();
            consume(6291477);
            r.push(parse(62, e === H ? R : e));
        } else if (Z & 12288) {
            const s = se;
            const t = Z;
            const n = Q;
            nextToken();
            if (consumeOpt(6291477)) {
                r.push(parse(62, e === H ? R : e));
            } else {
                se = s;
                Z = t;
                Q = n;
                r.push(parse(515, e === H ? R : e));
            }
        } else {
            throw invalidPropDefInObjLiteral();
        }
        if (Z !== 7340046) {
            consume(6291472);
        }
    }
    re = s;
    consume(7340046);
    if (e === H) {
        return new ObjectBindingPattern(t, r);
    } else {
        te = false;
        return new ObjectLiteralExpression(t, r);
    }
}

function parseInterpolation() {
    const e = [];
    const s = [];
    const t = W;
    let r = "";
    while (Q < t) {
        switch (se) {
          case 36:
            if ($charCodeAt(Q + 1) === 123) {
                e.push(r);
                r = "";
                Q += 2;
                se = $charCodeAt(Q);
                nextToken();
                const t = parse(61, G);
                s.push(t);
                continue;
            } else {
                r += "$";
            }
            break;

          case 92:
            r += oe(unescapeCode(nextChar()));
            break;

          default:
            r += oe(se);
        }
        nextChar();
    }
    if (s.length) {
        e.push(r);
        return new Interpolation(e, s);
    }
    return null;
}

function parseTemplate(e, s, t) {
    const r = re;
    const n = [ ee ];
    consume(2163761);
    const i = [ parse(62, e) ];
    while ((Z = scanTemplateTail()) !== 2163760) {
        n.push(ee);
        consume(2163761);
        i.push(parse(62, e));
    }
    n.push(ee);
    te = false;
    re = r;
    if (t) {
        nextToken();
        return new TaggedTemplateExpression(n, n, s, i);
    } else {
        nextToken();
        return new TemplateExpression(n, i);
    }
}

function createTemplateTail(e) {
    te = false;
    const s = [ ee ];
    nextToken();
    return new TaggedTemplateExpression(s, s, e);
}

function nextToken() {
    while (Q < W) {
        Y = Q;
        if ((Z = ue[se]()) != null) {
            return;
        }
    }
    Z = 6291456;
}

function nextChar() {
    return se = $charCodeAt(++Q);
}

function scanIdentifier() {
    while (pe[nextChar()]) ;
    const e = le[ee = $tokenRaw()];
    return e === undefined ? 4096 : e;
}

function scanNumber(e) {
    let s = se;
    if (e === false) {
        do {
            s = nextChar();
        } while (s <= 57 && s >= 48);
        if (s !== 46) {
            ee = parseInt($tokenRaw(), 10);
            return 32768;
        }
        s = nextChar();
        if (Q >= W) {
            ee = parseInt($tokenRaw().slice(0, -1), 10);
            return 32768;
        }
    }
    if (s <= 57 && s >= 48) {
        do {
            s = nextChar();
        } while (s <= 57 && s >= 48);
    } else {
        se = $charCodeAt(--Q);
    }
    ee = parseFloat($tokenRaw());
    return 32768;
}

function scanString() {
    const e = se;
    nextChar();
    let s = 0;
    const t = new Array;
    let r = Q;
    while (se !== e) {
        if (se === 92) {
            t.push(q.slice(r, Q));
            nextChar();
            s = unescapeCode(se);
            nextChar();
            t.push(oe(s));
            r = Q;
        } else if (Q >= W) {
            throw unterminatedStringLiteral();
        } else {
            nextChar();
        }
    }
    const n = q.slice(r, Q);
    nextChar();
    t.push(n);
    const i = t.join("");
    ee = i;
    return 16384;
}

function scanTemplate() {
    let e = true;
    let s = "";
    while (nextChar() !== 96) {
        if (se === 36) {
            if (Q + 1 < W && $charCodeAt(Q + 1) === 123) {
                Q++;
                e = false;
                break;
            } else {
                s += "$";
            }
        } else if (se === 92) {
            s += oe(unescapeCode(nextChar()));
        } else {
            if (Q >= W) {
                throw unterminatedTemplateLiteral();
            }
            s += oe(se);
        }
    }
    nextChar();
    ee = s;
    if (e) {
        return 2163760;
    }
    return 2163761;
}

const scanTemplateTail = () => {
    if (Q >= W) {
        throw unterminatedTemplateLiteral();
    }
    Q--;
    return scanTemplate();
};

const consumeOpt = e => {
    if (Z === e) {
        nextToken();
        return true;
    }
    return false;
};

const consume = e => {
    if (Z === e) {
        nextToken();
    } else {
        throw missingExpectedToken();
    }
};

const invalidStartOfExpression = () => createMappedError(151, q);

const invalidSpreadOp = () => createMappedError(152, q);

const expectedIdentifier = () => createMappedError(153, q);

const invalidMemberExpression = () => createMappedError(154, q);

const unexpectedEndOfExpression = () => createMappedError(155, q);

const unconsumedToken = () => createMappedError(156, $tokenRaw(), Q, q);

const invalidEmptyExpression = () => createMappedError(157);

const lhsNotAssignable = () => createMappedError(158, q);

const expectedValueConverterIdentifier = () => createMappedError(159, q);

const expectedBindingBehaviorIdentifier = () => createMappedError(160, q);

const unexpectedOfKeyword = () => createMappedError(161, q);

const unexpectedImportKeyword = () => createMappedError(162, q);

const invalidLHSBindingIdentifierInForOf = e => createMappedError(163, q, e);

const invalidPropDefInObjLiteral = () => createMappedError(164, q);

const unterminatedStringLiteral = () => createMappedError(165, q);

const unterminatedTemplateLiteral = () => createMappedError(166, q);

const missingExpectedToken = e => createMappedError(167, q);

const unexpectedTokenInDestructuring = () => createMappedError(170, q);

const unexpectedTokenInOptionalChain = () => createMappedError(171, q);

const invalidTaggedTemplateOnOptionalChain = () => createMappedError(172, q);

const invalidArrowParameterList = () => createMappedError(173, q);

const defaultParamsInArrowFn = () => createMappedError(174, q);

const destructuringParamsInArrowFn = () => createMappedError(175, q);

const restParamsMustBeLastParam = () => createMappedError(176, q);

const functionBodyInArrowFn = () => createMappedError(178, q);

const unexpectedDoubleDot = () => createMappedError(179, q);

const he = [ F, M, j, D, "this", "$this", null, "$parent", "(", "{", ".", "..", "...", "?.", "}", ")", ",", "[", "]", ":", ";", "?", "'", '"', "&", "|", "??", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 2163760, 2163761, "of", "=>", "+=", "-=", "*=", "/=", "++", "--" ];

const le = /*@__PURE__*/ Object.assign(createLookup(), {
    true: 8193,
    null: 8194,
    false: 8192,
    undefined: 8195,
    this: 12293,
    $this: 12292,
    $parent: 12295,
    in: 6562213,
    instanceof: 6562214,
    typeof: 139305,
    void: 139306,
    of: 4204594
});

const {CharScanners: ue, IdParts: pe} = /*@__PURE__*/ (() => {
    const unexpectedCharacter = () => {
        throw createMappedError(168, q);
    };
    unexpectedCharacter.notMapped = true;
    const e = {
        AsciiIdPart: [ 36, 0, 48, 58, 65, 91, 95, 0, 97, 123 ],
        IdStart: [ 36, 0, 65, 91, 95, 0, 97, 123, 170, 0, 186, 0, 192, 215, 216, 247, 248, 697, 736, 741, 7424, 7462, 7468, 7517, 7522, 7526, 7531, 7544, 7545, 7615, 7680, 7936, 8305, 0, 8319, 0, 8336, 8349, 8490, 8492, 8498, 0, 8526, 0, 8544, 8585, 11360, 11392, 42786, 42888, 42891, 42927, 42928, 42936, 42999, 43008, 43824, 43867, 43868, 43877, 64256, 64263, 65313, 65339, 65345, 65371 ],
        Digit: [ 48, 58 ],
        Skip: [ 0, 33, 127, 161 ]
    };
    const decompress = (e, s, t, r) => {
        const n = t.length;
        for (let i = 0; i < n; i += 2) {
            const n = t[i];
            let o = t[i + 1];
            o = o > 0 ? o : n + 1;
            if (e) {
                e.fill(r, n, o);
            }
            if (s) {
                for (let e = n; e < o; e++) {
                    s.add(e);
                }
            }
        }
    };
    const s = /*@__PURE__*/ (s => {
        decompress(s, null, e.IdStart, 1);
        decompress(s, null, e.Digit, 1);
        return s;
    })(new Uint8Array(65535));
    const returnToken = e => () => {
        nextChar();
        return e;
    };
    const t = new Array(65535);
    t.fill(unexpectedCharacter, 0, 65535);
    decompress(t, null, e.Skip, (() => {
        nextChar();
        return null;
    }));
    decompress(t, null, e.IdStart, scanIdentifier);
    decompress(t, null, e.Digit, (() => scanNumber(false)));
    t[34] = t[39] = () => scanString();
    t[96] = () => scanTemplate();
    t[33] = () => {
        if (nextChar() !== 61) {
            return 131119;
        }
        if (nextChar() !== 61) {
            return 6553950;
        }
        nextChar();
        return 6553952;
    };
    t[61] = () => {
        if (nextChar() === 62) {
            nextChar();
            return 51;
        }
        if (se !== 61) {
            return 4194350;
        }
        if (nextChar() !== 61) {
            return 6553949;
        }
        nextChar();
        return 6553951;
    };
    t[38] = () => {
        if (nextChar() !== 38) {
            return 6291480;
        }
        nextChar();
        return 6553884;
    };
    t[124] = () => {
        if (nextChar() !== 124) {
            return 6291481;
        }
        nextChar();
        return 6553819;
    };
    t[63] = () => {
        if (nextChar() === 46) {
            const e = $charCodeAt(Q + 1);
            if (e <= 48 || e >= 57) {
                nextChar();
                return 2162701;
            }
            return 6291479;
        }
        if (se !== 63) {
            return 6291479;
        }
        nextChar();
        return 6553754;
    };
    t[46] = () => {
        if (nextChar() <= 57 && se >= 48) {
            return scanNumber(true);
        }
        if (se === 46) {
            if (nextChar() !== 46) {
                return 11;
            }
            nextChar();
            return 12;
        }
        return 65546;
    };
    t[60] = () => {
        if (nextChar() !== 61) {
            return 6554017;
        }
        nextChar();
        return 6554019;
    };
    t[62] = () => {
        if (nextChar() !== 61) {
            return 6554018;
        }
        nextChar();
        return 6554020;
    };
    t[37] = returnToken(6554156);
    t[40] = returnToken(2688008);
    t[41] = returnToken(7340047);
    t[42] = () => {
        if (nextChar() !== 61) {
            return 6554155;
        }
        nextChar();
        return 4194358;
    };
    t[43] = () => {
        if (nextChar() === 43) {
            nextChar();
            return 2228280;
        }
        if (se !== 61) {
            return 2490855;
        }
        nextChar();
        return 4194356;
    };
    t[44] = returnToken(6291472);
    t[45] = () => {
        if (nextChar() === 45) {
            nextChar();
            return 2228281;
        }
        if (se !== 61) {
            return 2490856;
        }
        nextChar();
        return 4194357;
    };
    t[47] = () => {
        if (nextChar() !== 61) {
            return 6554157;
        }
        nextChar();
        return 4194359;
    };
    t[58] = returnToken(6291477);
    t[59] = returnToken(6291478);
    t[91] = returnToken(2688019);
    t[93] = returnToken(7340052);
    t[123] = returnToken(524297);
    t[125] = returnToken(7340046);
    return {
        CharScanners: t,
        IdParts: s
    };
})();

exports.AccessBoundaryExpression = AccessBoundaryExpression;

exports.AccessGlobalExpression = AccessGlobalExpression;

exports.AccessKeyedExpression = AccessKeyedExpression;

exports.AccessMemberExpression = AccessMemberExpression;

exports.AccessScopeExpression = AccessScopeExpression;

exports.AccessThisExpression = AccessThisExpression;

exports.ArrayBindingPattern = ArrayBindingPattern;

exports.ArrayLiteralExpression = ArrayLiteralExpression;

exports.ArrowFunction = ArrowFunction;

exports.AssignExpression = AssignExpression;

exports.BinaryExpression = BinaryExpression;

exports.BindingBehaviorExpression = BindingBehaviorExpression;

exports.BindingIdentifier = BindingIdentifier;

exports.CallFunctionExpression = CallFunctionExpression;

exports.CallGlobalExpression = CallGlobalExpression;

exports.CallMemberExpression = CallMemberExpression;

exports.CallScopeExpression = CallScopeExpression;

exports.ConditionalExpression = ConditionalExpression;

exports.CustomExpression = CustomExpression;

exports.DestructuringAssignmentExpression = DestructuringAssignmentExpression;

exports.DestructuringAssignmentRestExpression = DestructuringAssignmentRestExpression;

exports.DestructuringAssignmentSingleExpression = DestructuringAssignmentSingleExpression;

exports.ExpressionParser = ExpressionParser;

exports.ForOfStatement = ForOfStatement;

exports.IExpressionParser = O;

exports.Interpolation = Interpolation;

exports.ObjectBindingPattern = ObjectBindingPattern;

exports.ObjectLiteralExpression = ObjectLiteralExpression;

exports.PrimitiveLiteralExpression = PrimitiveLiteralExpression;

exports.TaggedTemplateExpression = TaggedTemplateExpression;

exports.TemplateExpression = TemplateExpression;

exports.UnaryExpression = UnaryExpression;

exports.Unparser = Unparser;

exports.ValueConverterExpression = ValueConverterExpression;

exports.astVisit = astVisit;

exports.parseExpression = parseExpression;
//# sourceMappingURL=index.cjs.map
