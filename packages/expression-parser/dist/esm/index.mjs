import { emptyArray as e, createImplementationRegister as s, DI as t } from "@aurelia/kernel";

const r = "AccessThis";

const n = "AccessBoundary";

const i = "AccessGlobal";

const o = "AccessScope";

const a = "ArrayLiteral";

const c = "ObjectLiteral";

const h = "PrimitiveLiteral";

const l = "Template";

const u = "Unary";

const p = "CallScope";

const f = "CallMember";

const x = "CallFunction";

const w = "CallGlobal";

const E = "AccessMember";

const d = "AccessKeyed";

const m = "TaggedTemplate";

const k = "Binary";

const b = "Conditional";

const A = "Assign";

const C = "ArrowFunction";

const g = "ValueConverter";

const T = "BindingBehavior";

const v = "ArrayBindingPattern";

const y = "ObjectBindingPattern";

const L = "BindingIdentifier";

const P = "ForOfStatement";

const I = "Interpolation";

const S = "ArrayDestructuring";

const B = "ObjectDestructuring";

const $ = "DestructuringAssignmentLeaf";

const O = "Custom";

class CustomExpression {
    constructor(e) {
        this.value = e;
        this.$kind = O;
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
        this.$kind = T;
        this.key = `_bb_${s}`;
    }
}

class ValueConverterExpression {
    constructor(e, s, t) {
        this.expression = e;
        this.name = s;
        this.args = t;
        this.$kind = g;
    }
}

class AssignExpression {
    constructor(e, s, t = "=") {
        this.target = e;
        this.value = s;
        this.op = t;
        this.$kind = A;
    }
}

class ConditionalExpression {
    constructor(e, s, t) {
        this.condition = e;
        this.yes = s;
        this.no = t;
        this.$kind = b;
    }
}

class AccessGlobalExpression {
    constructor(e) {
        this.name = e;
        this.$kind = i;
    }
}

class AccessThisExpression {
    constructor(e = 0) {
        this.ancestor = e;
        this.$kind = r;
    }
}

class AccessBoundaryExpression {
    constructor() {
        this.$kind = n;
    }
}

class AccessScopeExpression {
    constructor(e, s = 0) {
        this.name = e;
        this.ancestor = s;
        this.$kind = o;
    }
}

const isAccessGlobal = e => e.$kind === i || (e.$kind === E || e.$kind === d) && e.accessGlobal;

class AccessMemberExpression {
    constructor(e, s, t = false) {
        this.object = e;
        this.name = s;
        this.optional = t;
        this.$kind = E;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class AccessKeyedExpression {
    constructor(e, s, t = false) {
        this.object = e;
        this.key = s;
        this.optional = t;
        this.$kind = d;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class CallScopeExpression {
    constructor(e, s, t = 0, r = false) {
        this.name = e;
        this.args = s;
        this.ancestor = t;
        this.optional = r;
        this.$kind = p;
    }
}

class CallMemberExpression {
    constructor(e, s, t, r = false, n = false) {
        this.object = e;
        this.name = s;
        this.args = t;
        this.optionalMember = r;
        this.optionalCall = n;
        this.$kind = f;
    }
}

class CallFunctionExpression {
    constructor(e, s, t = false) {
        this.func = e;
        this.args = s;
        this.optional = t;
        this.$kind = x;
    }
}

class CallGlobalExpression {
    constructor(e, s) {
        this.name = e;
        this.args = s;
        this.$kind = w;
    }
}

class BinaryExpression {
    constructor(e, s, t) {
        this.operation = e;
        this.left = s;
        this.right = t;
        this.$kind = k;
    }
}

class UnaryExpression {
    constructor(e, s, t = 0) {
        this.operation = e;
        this.expression = s;
        this.pos = t;
        this.$kind = u;
    }
}

class PrimitiveLiteralExpression {
    constructor(e) {
        this.value = e;
        this.$kind = h;
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
        this.$kind = a;
    }
}

ArrayLiteralExpression.$empty = new ArrayLiteralExpression(e);

class ObjectLiteralExpression {
    constructor(e, s) {
        this.keys = e;
        this.values = s;
        this.$kind = c;
    }
}

ObjectLiteralExpression.$empty = new ObjectLiteralExpression(e, e);

class TemplateExpression {
    constructor(s, t = e) {
        this.cooked = s;
        this.expressions = t;
        this.$kind = l;
    }
}

TemplateExpression.$empty = new TemplateExpression([ "" ]);

class TaggedTemplateExpression {
    constructor(s, t, r, n = e) {
        this.cooked = s;
        this.func = r;
        this.expressions = n;
        this.$kind = m;
        s.raw = t;
    }
}

class ArrayBindingPattern {
    constructor(e) {
        this.elements = e;
        this.$kind = v;
    }
}

class ObjectBindingPattern {
    constructor(e, s) {
        this.keys = e;
        this.values = s;
        this.$kind = y;
    }
}

class BindingIdentifier {
    constructor(e) {
        this.name = e;
        this.$kind = L;
    }
}

class ForOfStatement {
    constructor(e, s, t) {
        this.declaration = e;
        this.iterable = s;
        this.semiIdx = t;
        this.$kind = P;
    }
}

class Interpolation {
    constructor(s, t = e) {
        this.parts = s;
        this.expressions = t;
        this.$kind = I;
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
        this.$kind = $;
    }
}

class DestructuringAssignmentRestExpression {
    constructor(e, s) {
        this.target = e;
        this.indexOrProperties = s;
        this.$kind = $;
    }
}

class ArrowFunction {
    constructor(e, s, t = false) {
        this.args = e;
        this.body = s;
        this.rest = t;
        this.$kind = C;
    }
}

const createError = e => new Error(e);

const isString = e => typeof e === "string";

const F = String;

const createLookup = () => Object.create(null);

const astVisit = (e, s) => {
    switch (e.$kind) {
      case d:
        return s.visitAccessKeyed(e);

      case E:
        return s.visitAccessMember(e);

      case o:
        return s.visitAccessScope(e);

      case r:
        return s.visitAccessThis(e);

      case n:
        return s.visitAccessBoundary(e);

      case v:
        return s.visitArrayBindingPattern(e);

      case S:
        return s.visitDestructuringAssignmentExpression(e);

      case a:
        return s.visitArrayLiteral(e);

      case C:
        return s.visitArrowFunction(e);

      case A:
        return s.visitAssign(e);

      case k:
        return s.visitBinary(e);

      case T:
        return s.visitBindingBehavior(e);

      case L:
        return s.visitBindingIdentifier(e);

      case x:
        return s.visitCallFunction(e);

      case f:
        return s.visitCallMember(e);

      case p:
        return s.visitCallScope(e);

      case b:
        return s.visitConditional(e);

      case $:
        return s.visitDestructuringAssignmentSingleExpression(e);

      case P:
        return s.visitForOfStatement(e);

      case I:
        return s.visitInterpolation(e);

      case y:
        return s.visitObjectBindingPattern(e);

      case B:
        return s.visitDestructuringAssignmentExpression(e);

      case c:
        return s.visitObjectLiteral(e);

      case h:
        return s.visitPrimitiveLiteral(e);

      case m:
        return s.visitTaggedTemplate(e);

      case l:
        return s.visitTemplate(e);

      case u:
        return s.visitUnary(e);

      case g:
        return s.visitValueConverter(e);

      case O:
        return s.visitCustom(e);

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
        const t = s === B;
        this.text += t ? "{" : "[";
        const r = e.list;
        const n = r.length;
        let i;
        let o;
        for (i = 0; i < n; i++) {
            o = r[i];
            switch (o.$kind) {
              case $:
                astVisit(o, this);
                break;

              case S:
              case B:
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
        this.text += F(e.value);
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

const createMappedError = (e, ...s) => new Error(`AUR${F(e).padStart(4, "0")}:${s.map(F)}`);

const M = /*@__PURE__*/ t.createInterface("IExpressionParser");

class ExpressionParser {
    constructor() {
        this.t = createLookup();
        this.i = createLookup();
        this.h = createLookup();
    }
    parse(e, s) {
        let t;
        switch (s) {
          case Q:
            return new CustomExpression(e);

          case V:
            t = this.h[e];
            if (t === void 0) {
                t = this.h[e] = this.$parse(e, s);
            }
            return t;

          case z:
            t = this.i[e];
            if (t === void 0) {
                t = this.i[e] = this.$parse(e, s);
            }
            return t;

          default:
            {
                if (e.length === 0) {
                    if (s === _ || s === q) {
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
        W = e;
        X = 0;
        Y = e.length;
        Z = 0;
        ee = 0;
        se = 6291456;
        te = "";
        re = $charCodeAt(0);
        ne = true;
        ie = false;
        oe = true;
        ae = -1;
        return parse(61, s === void 0 ? q : s);
    }
}

ExpressionParser.register = s(M);

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

const j = PrimitiveLiteralExpression.$false;

const D = PrimitiveLiteralExpression.$true;

const U = PrimitiveLiteralExpression.$null;

const K = PrimitiveLiteralExpression.$undefined;

const N = new AccessThisExpression(0);

const R = new AccessThisExpression(1);

const G = new AccessBoundaryExpression;

const H = "None";

const V = "Interpolation";

const z = "IsIterator";

const J = "IsChainable";

const _ = "IsFunction";

const q = "IsProperty";

const Q = "IsCustom";

let W = "";

let X = 0;

let Y = 0;

let Z = 0;

let ee = 0;

let se = 6291456;

let te = "";

let re;

let ne = true;

let ie = false;

let oe = true;

let ae = -1;

const ce = String.fromCharCode;

const $charCodeAt = e => W.charCodeAt(e);

const $tokenRaw = () => W.slice(ee, X);

const he = ("Infinity NaN isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent" + " Array BigInt Boolean Date Map Number Object RegExp Set String JSON Math Intl").split(" ");

function parseExpression(e, s) {
    W = e;
    X = 0;
    Y = e.length;
    Z = 0;
    ee = 0;
    se = 6291456;
    te = "";
    re = $charCodeAt(0);
    ne = true;
    ie = false;
    oe = true;
    ae = -1;
    return parse(61, s === void 0 ? q : s);
}

function parse(e, s) {
    if (s === Q) {
        return new CustomExpression(W);
    }
    if (X === 0) {
        if (s === V) {
            return parseInterpolation();
        }
        nextToken();
        if (se & 4194304) {
            throw invalidStartOfExpression();
        }
    }
    ne = 513 > e;
    ie = false;
    oe = 514 > e;
    let t = false;
    let n = void 0;
    let a = 0;
    if (se & 131072) {
        const e = ue[se & 63];
        nextToken();
        n = new UnaryExpression(e, parse(514, s));
        ne = false;
    } else {
        e: switch (se) {
          case 12295:
            a = Z;
            ne = false;
            oe = false;
            do {
                nextToken();
                ++a;
                switch (se) {
                  case 65546:
                    nextToken();
                    if ((se & 12288) === 0) {
                        throw expectedIdentifier();
                    }
                    break;

                  case 11:
                  case 12:
                    throw expectedIdentifier();

                  case 2162701:
                    ie = true;
                    nextToken();
                    if ((se & 12288) === 0) {
                        n = a === 0 ? N : a === 1 ? R : new AccessThisExpression(a);
                        t = true;
                        break e;
                    }
                    break;

                  default:
                    if (se & 2097152) {
                        n = a === 0 ? N : a === 1 ? R : new AccessThisExpression(a);
                        break e;
                    }
                    throw invalidMemberExpression();
                }
            } while (se === 12295);

          case 4096:
            {
                const e = te;
                if (s === z) {
                    n = new BindingIdentifier(e);
                } else if (oe && he.includes(e)) {
                    n = new AccessGlobalExpression(e);
                } else if (oe && e === "import") {
                    throw unexpectedImportKeyword();
                } else {
                    n = new AccessScopeExpression(e, a);
                }
                ne = !ie;
                nextToken();
                if (consumeOpt(51)) {
                    if (se === 524297) {
                        throw functionBodyInArrowFn();
                    }
                    const s = ie;
                    const t = Z;
                    ++Z;
                    const r = parse(62, H);
                    ie = s;
                    Z = t;
                    ne = false;
                    n = new ArrowFunction([ new BindingIdentifier(e) ], r);
                }
                break;
            }

          case 11:
            throw unexpectedDoubleDot();

          case 12:
            throw invalidSpreadOp();

          case 12292:
            ne = false;
            nextToken();
            switch (Z) {
              case 0:
                n = N;
                break;

              case 1:
                n = R;
                break;

              default:
                n = new AccessThisExpression(Z);
                break;
            }
            break;

          case 12293:
            ne = false;
            nextToken();
            n = G;
            break;

          case 2688008:
            n = parseCoverParenthesizedExpressionAndArrowParameterList(s);
            break;

          case 2688019:
            n = W.search(/\s+of\s+/) > X ? parseArrayDestructuring() : parseArrayLiteralExpression(s);
            break;

          case 524297:
            n = parseObjectLiteralExpression(s);
            break;

          case 2163760:
            n = new TemplateExpression([ te ]);
            ne = false;
            nextToken();
            break;

          case 2163761:
            n = parseTemplate(s, n, false);
            break;

          case 16384:
          case 32768:
            n = new PrimitiveLiteralExpression(te);
            ne = false;
            nextToken();
            break;

          case 8194:
          case 8195:
          case 8193:
          case 8192:
            n = ue[se & 63];
            ne = false;
            nextToken();
            break;

          default:
            if (X >= Y) {
                throw unexpectedEndOfExpression();
            } else {
                throw unconsumedToken();
            }
        }
        if (s === z) {
            return parseForOfStatement(n);
        }
        switch (se) {
          case 2228280:
          case 2228281:
            n = new UnaryExpression(ue[se & 63], n, 1);
            nextToken();
            ne = false;
            break;
        }
        if (514 < e) {
            return n;
        }
        if (se === 11 || se === 12) {
            throw expectedIdentifier();
        }
        if (n.$kind === r) {
            switch (se) {
              case 2162701:
                ie = true;
                ne = false;
                nextToken();
                if ((se & 13312) === 0) {
                    throw unexpectedTokenInOptionalChain();
                }
                if (se & 12288) {
                    n = new AccessScopeExpression(te, n.ancestor);
                    nextToken();
                } else if (se === 2688008) {
                    n = new CallFunctionExpression(n, parseArguments(), true);
                } else if (se === 2688019) {
                    n = parseKeyedExpression(n, true);
                } else {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                break;

              case 65546:
                ne = !ie;
                nextToken();
                if ((se & 12288) === 0) {
                    throw expectedIdentifier();
                }
                n = new AccessScopeExpression(te, n.ancestor);
                nextToken();
                break;

              case 11:
              case 12:
                throw expectedIdentifier();

              case 2688008:
                n = new CallFunctionExpression(n, parseArguments(), t);
                break;

              case 2688019:
                n = parseKeyedExpression(n, t);
                break;

              case 2163760:
                n = createTemplateTail(n);
                break;

              case 2163761:
                n = parseTemplate(s, n, true);
                break;
            }
        }
        while ((se & 65536) > 0) {
            switch (se) {
              case 2162701:
                n = parseOptionalChainLHS(n);
                break;

              case 65546:
                nextToken();
                if ((se & 12288) === 0) {
                    throw expectedIdentifier();
                }
                n = parseMemberExpressionLHS(n, false);
                break;

              case 11:
              case 12:
                throw expectedIdentifier();

              case 2688008:
                if (n.$kind === o) {
                    n = new CallScopeExpression(n.name, parseArguments(), n.ancestor, false);
                } else if (n.$kind === E) {
                    n = new CallMemberExpression(n.object, n.name, parseArguments(), n.optional, false);
                } else if (n.$kind === i) {
                    n = new CallGlobalExpression(n.name, parseArguments());
                } else {
                    n = new CallFunctionExpression(n, parseArguments(), false);
                }
                break;

              case 2688019:
                n = parseKeyedExpression(n, false);
                break;

              case 2163760:
                if (ie) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                n = createTemplateTail(n);
                break;

              case 2163761:
                if (ie) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                n = parseTemplate(s, n, true);
                break;
            }
        }
    }
    if (se === 11 || se === 12) {
        throw expectedIdentifier();
    }
    if (513 < e) {
        return n;
    }
    while ((se & 262144) > 0) {
        const t = se;
        if ((t & 960) <= e) {
            break;
        }
        nextToken();
        n = new BinaryExpression(ue[t & 63], n, parse(t & 960, s));
        ne = false;
    }
    if (63 < e) {
        return n;
    }
    if (consumeOpt(6291479)) {
        const e = parse(62, s);
        consume(6291477);
        n = new ConditionalExpression(n, e, parse(62, s));
        ne = false;
    }
    if (62 < e) {
        return n;
    }
    switch (se) {
      case 4194350:
      case 4194356:
      case 4194357:
      case 4194358:
      case 4194359:
        {
            if (!ne) {
                throw lhsNotAssignable();
            }
            const e = ue[se & 63];
            nextToken();
            n = new AssignExpression(n, parse(62, s), e);
            break;
        }
    }
    if (61 < e) {
        return n;
    }
    while (consumeOpt(6291481)) {
        if (se === 6291456) {
            throw expectedValueConverterIdentifier();
        }
        const e = te;
        nextToken();
        const t = new Array;
        while (consumeOpt(6291477)) {
            t.push(parse(62, s));
        }
        n = new ValueConverterExpression(n, e, t);
    }
    while (consumeOpt(6291480)) {
        if (se === 6291456) {
            throw expectedBindingBehaviorIdentifier();
        }
        const e = te;
        nextToken();
        const t = new Array;
        while (consumeOpt(6291477)) {
            t.push(parse(62, s));
        }
        n = new BindingBehaviorExpression(n, e, t);
    }
    if (se !== 6291456) {
        if (s === V && se === 7340046) {
            return n;
        }
        if (s === J && se === 6291478) {
            if (X === Y) {
                throw unconsumedToken();
            }
            ae = X - 1;
            return n;
        }
        if ($tokenRaw() === "of") {
            throw unexpectedOfKeyword();
        }
        throw unconsumedToken();
    }
    return n;
}

function parseArrayDestructuring() {
    const e = [];
    const s = new DestructuringAssignmentExpression(S, e, void 0, void 0);
    let t = "";
    let r = true;
    let n = 0;
    while (r) {
        nextToken();
        switch (se) {
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
            e.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression(N, t), new AccessKeyedExpression(N, new PrimitiveLiteralExpression(n++)), void 0));
            t = "";
        } else {
            n++;
        }
    }
}

function parseArguments() {
    const e = ie;
    nextToken();
    const s = [];
    while (se !== 7340047) {
        s.push(parse(62, H));
        if (!consumeOpt(6291472)) {
            break;
        }
    }
    consume(7340047);
    ne = false;
    ie = e;
    return s;
}

function parseKeyedExpression(e, s) {
    const t = ie;
    nextToken();
    e = new AccessKeyedExpression(e, parse(62, H), s);
    consume(7340052);
    ne = !t;
    ie = t;
    return e;
}

function parseOptionalChainLHS(e) {
    ie = true;
    ne = false;
    nextToken();
    if ((se & 13312) === 0) {
        throw unexpectedTokenInOptionalChain();
    }
    if (se & 12288) {
        return parseMemberExpressionLHS(e, true);
    }
    if (se === 2688008) {
        if (e.$kind === o) {
            return new CallScopeExpression(e.name, parseArguments(), e.ancestor, true);
        } else if (e.$kind === E) {
            return new CallMemberExpression(e.object, e.name, parseArguments(), e.optional, true);
        } else {
            return new CallFunctionExpression(e, parseArguments(), true);
        }
    }
    if (se === 2688019) {
        return parseKeyedExpression(e, true);
    }
    throw invalidTaggedTemplateOnOptionalChain();
}

function parseMemberExpressionLHS(e, s) {
    const t = te;
    switch (se) {
      case 2162701:
        {
            ie = true;
            ne = false;
            const r = X;
            const n = ee;
            const i = se;
            const o = re;
            const a = te;
            const c = ne;
            const h = ie;
            nextToken();
            if ((se & 13312) === 0) {
                throw unexpectedTokenInOptionalChain();
            }
            if (se === 2688008) {
                return new CallMemberExpression(e, t, parseArguments(), s, true);
            }
            X = r;
            ee = n;
            se = i;
            re = o;
            te = a;
            ne = c;
            ie = h;
            return new AccessMemberExpression(e, t, s);
        }

      case 2688008:
        {
            ne = false;
            return new CallMemberExpression(e, t, parseArguments(), s, false);
        }

      default:
        {
            ne = !ie;
            nextToken();
            return new AccessMemberExpression(e, t, s);
        }
    }
}

function parseCoverParenthesizedExpressionAndArrowParameterList(e) {
    nextToken();
    const s = X;
    const t = ee;
    const r = se;
    const n = re;
    const i = te;
    const o = ie;
    const a = [];
    let c = 1;
    let h = false;
    e: while (true) {
        if (se === 12) {
            nextToken();
            if (se !== 4096) {
                throw expectedIdentifier();
            }
            a.push(new BindingIdentifier(te));
            nextToken();
            if (se === 6291472) {
                throw restParamsMustBeLastParam();
            }
            if (se !== 7340047) {
                throw invalidSpreadOp();
            }
            nextToken();
            if (se !== 51) {
                throw invalidSpreadOp();
            }
            nextToken();
            const e = ie;
            const s = Z;
            ++Z;
            const t = parse(62, H);
            ie = e;
            Z = s;
            ne = false;
            return new ArrowFunction(a, t, true);
        }
        switch (se) {
          case 4096:
            a.push(new BindingIdentifier(te));
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
        switch (se) {
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
    if (se === 51) {
        if (c === 1) {
            nextToken();
            if (se === 524297) {
                throw functionBodyInArrowFn();
            }
            const e = ie;
            const s = Z;
            ++Z;
            const t = parse(62, H);
            ie = e;
            Z = s;
            ne = false;
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
    X = s;
    ee = t;
    se = r;
    re = n;
    te = i;
    ie = o;
    const l = ie;
    const u = parse(62, e);
    ie = l;
    consume(7340047);
    if (se === 51) {
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
    const s = ie;
    nextToken();
    const t = new Array;
    while (se !== 7340052) {
        if (consumeOpt(6291472)) {
            t.push(K);
            if (se === 7340052) {
                break;
            }
        } else {
            t.push(parse(62, e === z ? H : e));
            if (consumeOpt(6291472)) {
                if (se === 7340052) {
                    break;
                }
            } else {
                break;
            }
        }
    }
    ie = s;
    consume(7340052);
    if (e === z) {
        return new ArrayBindingPattern(t);
    } else {
        ne = false;
        return new ArrayLiteralExpression(t);
    }
}

const le = [ v, y, L, S, B ];

function parseForOfStatement(e) {
    if (!le.includes(e.$kind)) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    if (se !== 4204594) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    nextToken();
    const s = e;
    const t = parse(61, J);
    return new ForOfStatement(s, t, ae);
}

function parseObjectLiteralExpression(e) {
    const s = ie;
    const t = new Array;
    const r = new Array;
    nextToken();
    while (se !== 7340046) {
        t.push(te);
        if (se & 49152) {
            nextToken();
            consume(6291477);
            r.push(parse(62, e === z ? H : e));
        } else if (se & 12288) {
            const s = re;
            const t = se;
            const n = X;
            nextToken();
            if (consumeOpt(6291477)) {
                r.push(parse(62, e === z ? H : e));
            } else {
                re = s;
                se = t;
                X = n;
                r.push(parse(515, e === z ? H : e));
            }
        } else {
            throw invalidPropDefInObjLiteral();
        }
        if (se !== 7340046) {
            consume(6291472);
        }
    }
    ie = s;
    consume(7340046);
    if (e === z) {
        return new ObjectBindingPattern(t, r);
    } else {
        ne = false;
        return new ObjectLiteralExpression(t, r);
    }
}

function parseInterpolation() {
    const e = [];
    const s = [];
    const t = Y;
    let r = "";
    while (X < t) {
        switch (re) {
          case 36:
            if ($charCodeAt(X + 1) === 123) {
                e.push(r);
                r = "";
                X += 2;
                re = $charCodeAt(X);
                nextToken();
                const t = parse(61, V);
                s.push(t);
                continue;
            } else {
                r += "$";
            }
            break;

          case 92:
            r += ce(unescapeCode(nextChar()));
            break;

          default:
            r += ce(re);
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
    const r = ie;
    const n = [ te ];
    consume(2163761);
    const i = [ parse(62, e) ];
    while ((se = scanTemplateTail()) !== 2163760) {
        n.push(te);
        consume(2163761);
        i.push(parse(62, e));
    }
    n.push(te);
    ne = false;
    ie = r;
    if (t) {
        nextToken();
        return new TaggedTemplateExpression(n, n, s, i);
    } else {
        nextToken();
        return new TemplateExpression(n, i);
    }
}

function createTemplateTail(e) {
    ne = false;
    const s = [ te ];
    nextToken();
    return new TaggedTemplateExpression(s, s, e);
}

function nextToken() {
    while (X < Y) {
        ee = X;
        if ((se = fe[re]()) != null) {
            return;
        }
    }
    se = 6291456;
}

function nextChar() {
    return re = $charCodeAt(++X);
}

function scanIdentifier() {
    while (xe[nextChar()]) ;
    const e = pe[te = $tokenRaw()];
    return e === undefined ? 4096 : e;
}

function scanNumber(e) {
    let s = re;
    if (e === false) {
        do {
            s = nextChar();
        } while (s <= 57 && s >= 48);
        if (s !== 46) {
            te = parseInt($tokenRaw(), 10);
            return 32768;
        }
        s = nextChar();
        if (X >= Y) {
            te = parseInt($tokenRaw().slice(0, -1), 10);
            return 32768;
        }
    }
    if (s <= 57 && s >= 48) {
        do {
            s = nextChar();
        } while (s <= 57 && s >= 48);
    } else {
        re = $charCodeAt(--X);
    }
    te = parseFloat($tokenRaw());
    return 32768;
}

function scanString() {
    const e = re;
    nextChar();
    let s = 0;
    const t = new Array;
    let r = X;
    while (re !== e) {
        if (re === 92) {
            t.push(W.slice(r, X));
            nextChar();
            s = unescapeCode(re);
            nextChar();
            t.push(ce(s));
            r = X;
        } else if (X >= Y) {
            throw unterminatedStringLiteral();
        } else {
            nextChar();
        }
    }
    const n = W.slice(r, X);
    nextChar();
    t.push(n);
    const i = t.join("");
    te = i;
    return 16384;
}

function scanTemplate() {
    let e = true;
    let s = "";
    while (nextChar() !== 96) {
        if (re === 36) {
            if (X + 1 < Y && $charCodeAt(X + 1) === 123) {
                X++;
                e = false;
                break;
            } else {
                s += "$";
            }
        } else if (re === 92) {
            s += ce(unescapeCode(nextChar()));
        } else {
            if (X >= Y) {
                throw unterminatedTemplateLiteral();
            }
            s += ce(re);
        }
    }
    nextChar();
    te = s;
    if (e) {
        return 2163760;
    }
    return 2163761;
}

const scanTemplateTail = () => {
    if (X >= Y) {
        throw unterminatedTemplateLiteral();
    }
    X--;
    return scanTemplate();
};

const consumeOpt = e => {
    if (se === e) {
        nextToken();
        return true;
    }
    return false;
};

const consume = e => {
    if (se === e) {
        nextToken();
    } else {
        throw missingExpectedToken();
    }
};

const invalidStartOfExpression = () => createMappedError(151, W);

const invalidSpreadOp = () => createMappedError(152, W);

const expectedIdentifier = () => createMappedError(153, W);

const invalidMemberExpression = () => createMappedError(154, W);

const unexpectedEndOfExpression = () => createMappedError(155, W);

const unconsumedToken = () => createMappedError(156, $tokenRaw(), X, W);

const invalidEmptyExpression = () => createMappedError(157);

const lhsNotAssignable = () => createMappedError(158, W);

const expectedValueConverterIdentifier = () => createMappedError(159, W);

const expectedBindingBehaviorIdentifier = () => createMappedError(160, W);

const unexpectedOfKeyword = () => createMappedError(161, W);

const unexpectedImportKeyword = () => createMappedError(162, W);

const invalidLHSBindingIdentifierInForOf = e => createMappedError(163, W, e);

const invalidPropDefInObjLiteral = () => createMappedError(164, W);

const unterminatedStringLiteral = () => createMappedError(165, W);

const unterminatedTemplateLiteral = () => createMappedError(166, W);

const missingExpectedToken = e => createMappedError(167, W);

const unexpectedTokenInDestructuring = () => createMappedError(170, W);

const unexpectedTokenInOptionalChain = () => createMappedError(171, W);

const invalidTaggedTemplateOnOptionalChain = () => createMappedError(172, W);

const invalidArrowParameterList = () => createMappedError(173, W);

const defaultParamsInArrowFn = () => createMappedError(174, W);

const destructuringParamsInArrowFn = () => createMappedError(175, W);

const restParamsMustBeLastParam = () => createMappedError(176, W);

const functionBodyInArrowFn = () => createMappedError(178, W);

const unexpectedDoubleDot = () => createMappedError(179, W);

const ue = [ j, D, U, K, "this", "$this", null, "$parent", "(", "{", ".", "..", "...", "?.", "}", ")", ",", "[", "]", ":", ";", "?", "'", '"', "&", "|", "??", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "=", "!", 2163760, 2163761, "of", "=>", "+=", "-=", "*=", "/=", "++", "--" ];

const pe = /*@__PURE__*/ Object.assign(createLookup(), {
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

const {CharScanners: fe, IdParts: xe} = /*@__PURE__*/ (() => {
    const unexpectedCharacter = () => {
        throw createMappedError(168, W);
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
        if (re !== 61) {
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
            const e = $charCodeAt(X + 1);
            if (e <= 48 || e >= 57) {
                nextChar();
                return 2162701;
            }
            return 6291479;
        }
        if (re !== 63) {
            return 6291479;
        }
        nextChar();
        return 6553754;
    };
    t[46] = () => {
        if (nextChar() <= 57 && re >= 48) {
            return scanNumber(true);
        }
        if (re === 46) {
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
        if (re !== 61) {
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
        if (re !== 61) {
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

export { AccessBoundaryExpression, AccessGlobalExpression, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, ArrayBindingPattern, ArrayLiteralExpression, ArrowFunction, AssignExpression, BinaryExpression, BindingBehaviorExpression, BindingIdentifier, CallFunctionExpression, CallGlobalExpression, CallMemberExpression, CallScopeExpression, ConditionalExpression, CustomExpression, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, ExpressionParser, ForOfStatement, M as IExpressionParser, Interpolation, ObjectBindingPattern, ObjectLiteralExpression, PrimitiveLiteralExpression, TaggedTemplateExpression, TemplateExpression, UnaryExpression, Unparser, ValueConverterExpression, astVisit, parseExpression };
//# sourceMappingURL=index.mjs.map
