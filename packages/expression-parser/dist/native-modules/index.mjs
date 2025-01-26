import { emptyArray as e, createImplementationRegister as s, DI as t } from "../../../kernel/dist/native-modules/index.mjs";

const r = "AccessThis";

const n = "AccessBoundary";

const i = "AccessGlobal";

const o = "AccessScope";

const a = "ArrayLiteral";

const c = "ObjectLiteral";

const h = "PrimitiveLiteral";

const l = "New";

const u = "Template";

const p = "Unary";

const f = "CallScope";

const x = "CallMember";

const w = "CallFunction";

const E = "CallGlobal";

const d = "AccessMember";

const k = "AccessKeyed";

const m = "TaggedTemplate";

const b = "Binary";

const A = "Conditional";

const C = "Assign";

const g = "ArrowFunction";

const T = "ValueConverter";

const v = "BindingBehavior";

const y = "ArrayBindingPattern";

const L = "ObjectBindingPattern";

const P = "BindingIdentifier";

const I = "ForOfStatement";

const S = "Interpolation";

const B = "ArrayDestructuring";

const $ = "ObjectDestructuring";

const O = "DestructuringAssignmentLeaf";

const F = "Custom";

class CustomExpression {
    constructor(e) {
        this.value = e;
        this.$kind = F;
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
        this.$kind = v;
        this.key = `_bb_${s}`;
    }
}

class ValueConverterExpression {
    constructor(e, s, t) {
        this.expression = e;
        this.name = s;
        this.args = t;
        this.$kind = T;
    }
}

class AssignExpression {
    constructor(e, s, t = "=") {
        this.target = e;
        this.value = s;
        this.op = t;
        this.$kind = C;
    }
}

class ConditionalExpression {
    constructor(e, s, t) {
        this.condition = e;
        this.yes = s;
        this.no = t;
        this.$kind = A;
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

const isAccessGlobal = e => e.$kind === i || (e.$kind === d || e.$kind === k) && e.accessGlobal;

class AccessMemberExpression {
    constructor(e, s, t = false) {
        this.object = e;
        this.name = s;
        this.optional = t;
        this.$kind = d;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class AccessKeyedExpression {
    constructor(e, s, t = false) {
        this.object = e;
        this.key = s;
        this.optional = t;
        this.$kind = k;
        this.accessGlobal = isAccessGlobal(e);
    }
}

class NewExpression {
    constructor(e, s) {
        this.func = e;
        this.args = s;
        this.$kind = l;
    }
}

class CallScopeExpression {
    constructor(e, s, t = 0, r = false) {
        this.name = e;
        this.args = s;
        this.ancestor = t;
        this.optional = r;
        this.$kind = f;
    }
}

class CallMemberExpression {
    constructor(e, s, t, r = false, n = false) {
        this.object = e;
        this.name = s;
        this.args = t;
        this.optionalMember = r;
        this.optionalCall = n;
        this.$kind = x;
    }
}

class CallFunctionExpression {
    constructor(e, s, t = false) {
        this.func = e;
        this.args = s;
        this.optional = t;
        this.$kind = w;
    }
}

class CallGlobalExpression {
    constructor(e, s) {
        this.name = e;
        this.args = s;
        this.$kind = E;
    }
}

class BinaryExpression {
    constructor(e, s, t) {
        this.operation = e;
        this.left = s;
        this.right = t;
        this.$kind = b;
    }
}

class UnaryExpression {
    constructor(e, s, t = 0) {
        this.operation = e;
        this.expression = s;
        this.pos = t;
        this.$kind = p;
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
        this.$kind = u;
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
        this.$kind = y;
    }
}

class ObjectBindingPattern {
    constructor(e, s) {
        this.keys = e;
        this.values = s;
        this.$kind = L;
    }
}

class BindingIdentifier {
    constructor(e) {
        this.name = e;
        this.$kind = P;
    }
}

class ForOfStatement {
    constructor(e, s, t) {
        this.declaration = e;
        this.iterable = s;
        this.semiIdx = t;
        this.$kind = I;
    }
}

class Interpolation {
    constructor(s, t = e) {
        this.parts = s;
        this.expressions = t;
        this.$kind = S;
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
        this.$kind = O;
    }
}

class DestructuringAssignmentRestExpression {
    constructor(e, s) {
        this.target = e;
        this.indexOrProperties = s;
        this.$kind = O;
    }
}

class ArrowFunction {
    constructor(e, s, t = false) {
        this.args = e;
        this.body = s;
        this.rest = t;
        this.$kind = g;
    }
}

const createError = e => new Error(e);

const isString = e => typeof e === "string";

const M = String;

const createLookup = () => Object.create(null);

const astVisit = (e, s) => {
    switch (e.$kind) {
      case k:
        return s.visitAccessKeyed(e);

      case d:
        return s.visitAccessMember(e);

      case o:
        return s.visitAccessScope(e);

      case r:
        return s.visitAccessThis(e);

      case n:
        return s.visitAccessBoundary(e);

      case y:
        return s.visitArrayBindingPattern(e);

      case B:
        return s.visitDestructuringAssignmentExpression(e);

      case a:
        return s.visitArrayLiteral(e);

      case g:
        return s.visitArrowFunction(e);

      case C:
        return s.visitAssign(e);

      case b:
        return s.visitBinary(e);

      case v:
        return s.visitBindingBehavior(e);

      case P:
        return s.visitBindingIdentifier(e);

      case w:
        return s.visitCallFunction(e);

      case x:
        return s.visitCallMember(e);

      case f:
        return s.visitCallScope(e);

      case A:
        return s.visitConditional(e);

      case O:
        return s.visitDestructuringAssignmentSingleExpression(e);

      case I:
        return s.visitForOfStatement(e);

      case S:
        return s.visitInterpolation(e);

      case L:
        return s.visitObjectBindingPattern(e);

      case $:
        return s.visitDestructuringAssignmentExpression(e);

      case c:
        return s.visitObjectLiteral(e);

      case h:
        return s.visitPrimitiveLiteral(e);

      case m:
        return s.visitTaggedTemplate(e);

      case u:
        return s.visitTemplate(e);

      case p:
        return s.visitUnary(e);

      case T:
        return s.visitValueConverter(e);

      case F:
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
        astVisit(e.object, this);
        this.text += `${e.optionalMember ? "?." : ""}.${e.name}${e.optionalCall ? "?." : ""}`;
        this.writeArgs(e.args);
    }
    visitCallScope(e) {
        let s = e.ancestor;
        while (s--) {
            this.text += "$parent.";
        }
        this.text += `${e.name}${e.optional ? "?." : ""}`;
        this.writeArgs(e.args);
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
        const t = s === $;
        this.text += t ? "{" : "[";
        const r = e.list;
        const n = r.length;
        let i;
        let o;
        for (i = 0; i < n; i++) {
            o = r[i];
            switch (o.$kind) {
              case O:
                astVisit(o, this);
                break;

              case B:
              case $:
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
        this.text += M(e.value);
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

const createMappedError = (e, ...s) => new Error(`AUR${M(e).padStart(4, "0")}:${s.map(M)}`);

const j = /*@__PURE__*/ t.createInterface("IExpressionParser");

class ExpressionParser {
    constructor() {
        this.t = createLookup();
        this.i = createLookup();
        this.h = createLookup();
    }
    parse(e, s) {
        let t;
        switch (s) {
          case W:
            return new CustomExpression(e);

          case z:
            t = this.h[e];
            if (t === void 0) {
                t = this.h[e] = this.$parse(e, s);
            }
            return t;

          case J:
            t = this.i[e];
            if (t === void 0) {
                t = this.i[e] = this.$parse(e, s);
            }
            return t;

          default:
            {
                if (e.length === 0) {
                    if (s === q || s === Q) {
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
        X = e;
        Y = 0;
        Z = e.length;
        ee = 0;
        se = 0;
        te = 6291456;
        re = "";
        ne = $charCodeAt(0);
        ie = true;
        oe = false;
        ae = true;
        ce = -1;
        return parse(61, s === void 0 ? Q : s);
    }
}

ExpressionParser.register = s(j);

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

const D = PrimitiveLiteralExpression.$false;

const N = PrimitiveLiteralExpression.$true;

const U = PrimitiveLiteralExpression.$null;

const K = PrimitiveLiteralExpression.$undefined;

const R = new AccessThisExpression(0);

const G = new AccessThisExpression(1);

const H = new AccessBoundaryExpression;

const V = "None";

const z = "Interpolation";

const J = "IsIterator";

const _ = "IsChainable";

const q = "IsFunction";

const Q = "IsProperty";

const W = "IsCustom";

let X = "";

let Y = 0;

let Z = 0;

let ee = 0;

let se = 0;

let te = 6291456;

let re = "";

let ne;

let ie = true;

let oe = false;

let ae = true;

let ce = -1;

const he = String.fromCharCode;

const $charCodeAt = e => X.charCodeAt(e);

const $tokenRaw = () => X.slice(se, Y);

const le = ("Infinity NaN isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent" + " Array BigInt Boolean Date Map Number Object RegExp Set String JSON Math Intl").split(" ");

function parseExpression(e, s) {
    X = e;
    Y = 0;
    Z = e.length;
    ee = 0;
    se = 0;
    te = 6291456;
    re = "";
    ne = $charCodeAt(0);
    ie = true;
    oe = false;
    ae = true;
    ce = -1;
    return parse(61, s === void 0 ? Q : s);
}

function parse(e, s) {
    if (s === W) {
        return new CustomExpression(X);
    }
    if (Y === 0) {
        if (s === z) {
            return parseInterpolation();
        }
        nextToken();
        if (te & 4194304) {
            throw invalidStartOfExpression();
        }
    }
    ie = 577 > e;
    oe = false;
    ae = 579 > e;
    let t = false;
    let n = void 0;
    let a = 0;
    if (te & 131072) {
        const e = pe[te & 63];
        nextToken();
        n = new UnaryExpression(e, parse(579, s));
        ie = false;
    } else {
        e: switch (te) {
          case 12296:
            a = ee;
            ie = false;
            ae = false;
            do {
                nextToken();
                ++a;
                switch (te) {
                  case 65547:
                    nextToken();
                    if ((te & 12288) === 0) {
                        throw expectedIdentifier();
                    }
                    break;

                  case 12:
                  case 13:
                    throw expectedIdentifier();

                  case 2162702:
                    oe = true;
                    nextToken();
                    if ((te & 12288) === 0) {
                        n = a === 0 ? R : a === 1 ? G : new AccessThisExpression(a);
                        t = true;
                        break e;
                    }
                    break;

                  default:
                    if (te & 2097152) {
                        n = a === 0 ? R : a === 1 ? G : new AccessThisExpression(a);
                        break e;
                    }
                    throw invalidMemberExpression();
                }
            } while (te === 12296);

          case 4096:
            {
                const e = re;
                if (s === J) {
                    n = new BindingIdentifier(e);
                } else if (ae && le.includes(e)) {
                    n = new AccessGlobalExpression(e);
                } else if (ae && e === "import") {
                    throw unexpectedImportKeyword();
                } else {
                    n = new AccessScopeExpression(e, a);
                }
                ie = !oe;
                nextToken();
                if (consumeOpt(53)) {
                    if (te === 524298) {
                        throw functionBodyInArrowFn();
                    }
                    const s = oe;
                    const t = ee;
                    ++ee;
                    const r = parse(62, V);
                    oe = s;
                    ee = t;
                    ie = false;
                    n = new ArrowFunction([ new BindingIdentifier(e) ], r);
                }
                break;
            }

          case 12:
            throw unexpectedDoubleDot();

          case 13:
            throw invalidSpreadOp();

          case 12293:
            ie = false;
            nextToken();
            switch (ee) {
              case 0:
                n = R;
                break;

              case 1:
                n = G;
                break;

              default:
                n = new AccessThisExpression(ee);
                break;
            }
            break;

          case 12294:
            ie = false;
            nextToken();
            n = H;
            break;

          case 2688009:
            n = parseCoverParenthesizedExpressionAndArrowParameterList(s);
            break;

          case 2688020:
            n = X.search(/\s+of\s+/) > Y ? parseArrayDestructuring() : parseArrayLiteralExpression(s);
            break;

          case 524298:
            n = parseObjectLiteralExpression(s);
            break;

          case 2163762:
            n = new TemplateExpression([ re ]);
            ie = false;
            nextToken();
            break;

          case 2163763:
            n = parseTemplate(s, n, false);
            break;

          case 16384:
          case 32768:
            n = new PrimitiveLiteralExpression(re);
            ie = false;
            nextToken();
            break;

          case 8194:
          case 8195:
          case 8193:
          case 8192:
            n = pe[te & 63];
            ie = false;
            nextToken();
            break;

          case 8196:
            {
                nextToken();
                const e = parse(578, s);
                let t;
                if (te === 2688009) {
                    t = parseArguments();
                } else {
                    t = [];
                    nextToken();
                }
                n = new NewExpression(e, t);
                ie = false;
                break;
            }

          default:
            if (Y >= Z) {
                throw unexpectedEndOfExpression();
            } else {
                throw unconsumedToken();
            }
        }
        if (s === J) {
            return parseForOfStatement(n);
        }
        switch (te) {
          case 2228282:
          case 2228283:
            n = new UnaryExpression(pe[te & 63], n, 1);
            nextToken();
            ie = false;
            break;
        }
        if (579 < e) {
            return n;
        }
        if (te === 12 || te === 13) {
            throw expectedIdentifier();
        }
        if (n.$kind === r) {
            switch (te) {
              case 2162702:
                oe = true;
                ie = false;
                nextToken();
                if ((te & 13312) === 0) {
                    throw unexpectedTokenInOptionalChain();
                }
                if (te & 12288) {
                    n = new AccessScopeExpression(re, n.ancestor);
                    nextToken();
                } else if (te === 2688009) {
                    n = new CallFunctionExpression(n, parseArguments(), true);
                } else if (te === 2688020) {
                    n = parseKeyedExpression(n, true);
                } else {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                break;

              case 65547:
                ie = !oe;
                nextToken();
                if ((te & 12288) === 0) {
                    throw expectedIdentifier();
                }
                n = new AccessScopeExpression(re, n.ancestor);
                nextToken();
                break;

              case 12:
              case 13:
                throw expectedIdentifier();

              case 2688009:
                n = new CallFunctionExpression(n, parseArguments(), t);
                break;

              case 2688020:
                n = parseKeyedExpression(n, t);
                break;

              case 2163762:
                n = createTemplateTail(n);
                break;

              case 2163763:
                n = parseTemplate(s, n, true);
                break;
            }
        }
        while ((te & 65536) > 0) {
            switch (te) {
              case 2162702:
                n = parseOptionalChainLHS(n);
                break;

              case 65547:
                nextToken();
                if ((te & 12288) === 0) {
                    throw expectedIdentifier();
                }
                n = parseMemberExpressionLHS(n, false);
                break;

              case 12:
              case 13:
                throw expectedIdentifier();

              case 2688009:
                if (578 === e) {
                    return n;
                }
                if (n.$kind === o) {
                    n = new CallScopeExpression(n.name, parseArguments(), n.ancestor, false);
                } else if (n.$kind === d) {
                    n = new CallMemberExpression(n.object, n.name, parseArguments(), n.optional, false);
                } else if (n.$kind === i) {
                    n = new CallGlobalExpression(n.name, parseArguments());
                } else {
                    n = new CallFunctionExpression(n, parseArguments(), false);
                }
                break;

              case 2688020:
                n = parseKeyedExpression(n, false);
                break;

              case 2163762:
                if (oe) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                n = createTemplateTail(n);
                break;

              case 2163763:
                if (oe) {
                    throw invalidTaggedTemplateOnOptionalChain();
                }
                n = parseTemplate(s, n, true);
                break;
            }
        }
    }
    if (te === 12 || te === 13) {
        throw expectedIdentifier();
    }
    if (577 < e) {
        return n;
    }
    while ((te & 262144) > 0) {
        const t = te;
        if ((t & 960) <= e) {
            break;
        }
        nextToken();
        n = new BinaryExpression(pe[t & 63], n, parse(t & 960, s));
        ie = false;
    }
    if (63 < e) {
        return n;
    }
    if (consumeOpt(6291480)) {
        const e = parse(62, s);
        consume(6291478);
        n = new ConditionalExpression(n, e, parse(62, s));
        ie = false;
    }
    if (62 < e) {
        return n;
    }
    switch (te) {
      case 4194352:
      case 4194358:
      case 4194359:
      case 4194360:
      case 4194361:
        {
            if (!ie) {
                throw lhsNotAssignable();
            }
            const e = pe[te & 63];
            nextToken();
            n = new AssignExpression(n, parse(62, s), e);
            break;
        }
    }
    if (61 < e) {
        return n;
    }
    while (consumeOpt(6291482)) {
        if (te === 6291456) {
            throw expectedValueConverterIdentifier();
        }
        const e = re;
        nextToken();
        const t = new Array;
        while (consumeOpt(6291478)) {
            t.push(parse(62, s));
        }
        n = new ValueConverterExpression(n, e, t);
    }
    while (consumeOpt(6291481)) {
        if (te === 6291456) {
            throw expectedBindingBehaviorIdentifier();
        }
        const e = re;
        nextToken();
        const t = new Array;
        while (consumeOpt(6291478)) {
            t.push(parse(62, s));
        }
        n = new BindingBehaviorExpression(n, e, t);
    }
    if (te !== 6291456) {
        if (s === z && te === 7340047) {
            return n;
        }
        if (s === _ && te === 6291479) {
            if (Y === Z) {
                throw unconsumedToken();
            }
            ce = Y - 1;
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
    const s = new DestructuringAssignmentExpression(B, e, void 0, void 0);
    let t = "";
    let r = true;
    let n = 0;
    while (r) {
        nextToken();
        switch (te) {
          case 7340053:
            r = false;
            addItem();
            break;

          case 6291475:
            addItem();
            break;

          case 4096:
            t = $tokenRaw();
            break;

          default:
            throw unexpectedTokenInDestructuring();
        }
    }
    consume(7340053);
    return s;
    function addItem() {
        if (t !== "") {
            e.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression(R, t), new AccessKeyedExpression(R, new PrimitiveLiteralExpression(n++)), void 0));
            t = "";
        } else {
            n++;
        }
    }
}

function parseArguments() {
    const e = oe;
    nextToken();
    const s = [];
    while (te !== 7340048) {
        s.push(parse(62, V));
        if (!consumeOpt(6291475)) {
            break;
        }
    }
    consume(7340048);
    ie = false;
    oe = e;
    return s;
}

function parseKeyedExpression(e, s) {
    const t = oe;
    nextToken();
    e = new AccessKeyedExpression(e, parse(62, V), s);
    consume(7340053);
    ie = !t;
    oe = t;
    return e;
}

function parseOptionalChainLHS(e) {
    oe = true;
    ie = false;
    nextToken();
    if ((te & 13312) === 0) {
        throw unexpectedTokenInOptionalChain();
    }
    if (te & 12288) {
        return parseMemberExpressionLHS(e, true);
    }
    if (te === 2688009) {
        if (e.$kind === o) {
            return new CallScopeExpression(e.name, parseArguments(), e.ancestor, true);
        } else if (e.$kind === d) {
            return new CallMemberExpression(e.object, e.name, parseArguments(), e.optional, true);
        } else {
            return new CallFunctionExpression(e, parseArguments(), true);
        }
    }
    if (te === 2688020) {
        return parseKeyedExpression(e, true);
    }
    throw invalidTaggedTemplateOnOptionalChain();
}

function parseMemberExpressionLHS(e, s) {
    const t = re;
    switch (te) {
      case 2162702:
        {
            oe = true;
            ie = false;
            const r = Y;
            const n = se;
            const i = te;
            const o = ne;
            const a = re;
            const c = ie;
            const h = oe;
            nextToken();
            if ((te & 13312) === 0) {
                throw unexpectedTokenInOptionalChain();
            }
            if (te === 2688009) {
                return new CallMemberExpression(e, t, parseArguments(), s, true);
            }
            Y = r;
            se = n;
            te = i;
            ne = o;
            re = a;
            ie = c;
            oe = h;
            return new AccessMemberExpression(e, t, s);
        }

      case 2688009:
        {
            ie = false;
            return new CallMemberExpression(e, t, parseArguments(), s, false);
        }

      default:
        {
            ie = !oe;
            nextToken();
            return new AccessMemberExpression(e, t, s);
        }
    }
}

function parseCoverParenthesizedExpressionAndArrowParameterList(e) {
    nextToken();
    const s = Y;
    const t = se;
    const r = te;
    const n = ne;
    const i = re;
    const o = oe;
    const a = [];
    let c = 1;
    let h = false;
    e: while (true) {
        if (te === 13) {
            nextToken();
            if (te !== 4096) {
                throw expectedIdentifier();
            }
            a.push(new BindingIdentifier(re));
            nextToken();
            if (te === 6291475) {
                throw restParamsMustBeLastParam();
            }
            if (te !== 7340048) {
                throw invalidSpreadOp();
            }
            nextToken();
            if (te !== 53) {
                throw invalidSpreadOp();
            }
            nextToken();
            const e = oe;
            const s = ee;
            ++ee;
            const t = parse(62, V);
            oe = e;
            ee = s;
            ie = false;
            return new ArrowFunction(a, t, true);
        }
        switch (te) {
          case 4096:
            a.push(new BindingIdentifier(re));
            nextToken();
            break;

          case 7340048:
            nextToken();
            break e;

          case 524298:
          case 2688020:
            nextToken();
            c = 4;
            break;

          case 6291475:
            c = 2;
            h = true;
            break e;

          case 2688009:
            c = 2;
            break e;

          default:
            nextToken();
            c = 2;
            break;
        }
        switch (te) {
          case 6291475:
            nextToken();
            h = true;
            if (c === 1) {
                break;
            }
            break e;

          case 7340048:
            nextToken();
            break e;

          case 4194352:
            if (c === 1) {
                c = 3;
            }
            break e;

          case 53:
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
    if (te === 53) {
        if (c === 1) {
            nextToken();
            if (te === 524298) {
                throw functionBodyInArrowFn();
            }
            const e = oe;
            const s = ee;
            ++ee;
            const t = parse(62, V);
            oe = e;
            ee = s;
            ie = false;
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
    Y = s;
    se = t;
    te = r;
    ne = n;
    re = i;
    oe = o;
    const l = oe;
    const u = parse(62, e);
    oe = l;
    consume(7340048);
    if (te === 53) {
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
    const s = oe;
    nextToken();
    const t = new Array;
    while (te !== 7340053) {
        if (consumeOpt(6291475)) {
            t.push(K);
            if (te === 7340053) {
                break;
            }
        } else {
            t.push(parse(62, e === J ? V : e));
            if (consumeOpt(6291475)) {
                if (te === 7340053) {
                    break;
                }
            } else {
                break;
            }
        }
    }
    oe = s;
    consume(7340053);
    if (e === J) {
        return new ArrayBindingPattern(t);
    } else {
        ie = false;
        return new ArrayLiteralExpression(t);
    }
}

const ue = [ y, L, P, B, $ ];

function parseForOfStatement(e) {
    if (!ue.includes(e.$kind)) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    if (te !== 4204596) {
        throw invalidLHSBindingIdentifierInForOf(e.$kind);
    }
    nextToken();
    const s = e;
    const t = parse(61, _);
    return new ForOfStatement(s, t, ce);
}

function parseObjectLiteralExpression(e) {
    const s = oe;
    const t = new Array;
    const r = new Array;
    nextToken();
    while (te !== 7340047) {
        t.push(re);
        if (te & 49152) {
            nextToken();
            consume(6291478);
            r.push(parse(62, e === J ? V : e));
        } else if (te & 12288) {
            const s = ne;
            const t = te;
            const n = Y;
            nextToken();
            if (consumeOpt(6291478)) {
                r.push(parse(62, e === J ? V : e));
            } else {
                ne = s;
                te = t;
                Y = n;
                r.push(parse(580, e === J ? V : e));
            }
        } else {
            throw invalidPropDefInObjLiteral();
        }
        if (te !== 7340047) {
            consume(6291475);
        }
    }
    oe = s;
    consume(7340047);
    if (e === J) {
        return new ObjectBindingPattern(t, r);
    } else {
        ie = false;
        return new ObjectLiteralExpression(t, r);
    }
}

function parseInterpolation() {
    const e = [];
    const s = [];
    const t = Z;
    let r = "";
    while (Y < t) {
        switch (ne) {
          case 36:
            if ($charCodeAt(Y + 1) === 123) {
                e.push(r);
                r = "";
                Y += 2;
                ne = $charCodeAt(Y);
                nextToken();
                const t = parse(61, z);
                s.push(t);
                continue;
            } else {
                r += "$";
            }
            break;

          case 92:
            r += he(unescapeCode(nextChar()));
            break;

          default:
            r += he(ne);
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
    const r = oe;
    const n = [ re ];
    consume(2163763);
    const i = [ parse(62, e) ];
    while ((te = scanTemplateTail()) !== 2163762) {
        n.push(re);
        consume(2163763);
        i.push(parse(62, e));
    }
    n.push(re);
    ie = false;
    oe = r;
    if (t) {
        nextToken();
        return new TaggedTemplateExpression(n, n, s, i);
    } else {
        nextToken();
        return new TemplateExpression(n, i);
    }
}

function createTemplateTail(e) {
    ie = false;
    const s = [ re ];
    nextToken();
    return new TaggedTemplateExpression(s, s, e);
}

function nextToken() {
    while (Y < Z) {
        se = Y;
        if ((te = xe[ne]()) != null) {
            return;
        }
    }
    te = 6291456;
}

function nextChar() {
    return ne = $charCodeAt(++Y);
}

function scanIdentifier() {
    while (we[nextChar()]) ;
    const e = fe[re = $tokenRaw()];
    return e === undefined ? 4096 : e;
}

function scanNumber(e) {
    let s = ne;
    if (e === false) {
        do {
            s = nextChar();
        } while (s <= 57 && s >= 48);
        if (s !== 46) {
            re = parseInt($tokenRaw(), 10);
            return 32768;
        }
        s = nextChar();
        if (Y >= Z) {
            re = parseInt($tokenRaw().slice(0, -1), 10);
            return 32768;
        }
    }
    if (s <= 57 && s >= 48) {
        do {
            s = nextChar();
        } while (s <= 57 && s >= 48);
    } else {
        ne = $charCodeAt(--Y);
    }
    re = parseFloat($tokenRaw());
    return 32768;
}

function scanString() {
    const e = ne;
    nextChar();
    let s = 0;
    const t = new Array;
    let r = Y;
    while (ne !== e) {
        if (ne === 92) {
            t.push(X.slice(r, Y));
            nextChar();
            s = unescapeCode(ne);
            nextChar();
            t.push(he(s));
            r = Y;
        } else if (Y >= Z) {
            throw unterminatedStringLiteral();
        } else {
            nextChar();
        }
    }
    const n = X.slice(r, Y);
    nextChar();
    t.push(n);
    const i = t.join("");
    re = i;
    return 16384;
}

function scanTemplate() {
    let e = true;
    let s = "";
    while (nextChar() !== 96) {
        if (ne === 36) {
            if (Y + 1 < Z && $charCodeAt(Y + 1) === 123) {
                Y++;
                e = false;
                break;
            } else {
                s += "$";
            }
        } else if (ne === 92) {
            s += he(unescapeCode(nextChar()));
        } else {
            if (Y >= Z) {
                throw unterminatedTemplateLiteral();
            }
            s += he(ne);
        }
    }
    nextChar();
    re = s;
    if (e) {
        return 2163762;
    }
    return 2163763;
}

const scanTemplateTail = () => {
    if (Y >= Z) {
        throw unterminatedTemplateLiteral();
    }
    Y--;
    return scanTemplate();
};

const consumeOpt = e => {
    if (te === e) {
        nextToken();
        return true;
    }
    return false;
};

const consume = e => {
    if (te === e) {
        nextToken();
    } else {
        throw missingExpectedToken();
    }
};

const invalidStartOfExpression = () => createMappedError(151, X);

const invalidSpreadOp = () => createMappedError(152, X);

const expectedIdentifier = () => createMappedError(153, X);

const invalidMemberExpression = () => createMappedError(154, X);

const unexpectedEndOfExpression = () => createMappedError(155, X);

const unconsumedToken = () => createMappedError(156, $tokenRaw(), Y, X);

const invalidEmptyExpression = () => createMappedError(157);

const lhsNotAssignable = () => createMappedError(158, X);

const expectedValueConverterIdentifier = () => createMappedError(159, X);

const expectedBindingBehaviorIdentifier = () => createMappedError(160, X);

const unexpectedOfKeyword = () => createMappedError(161, X);

const unexpectedImportKeyword = () => createMappedError(162, X);

const invalidLHSBindingIdentifierInForOf = e => createMappedError(163, X, e);

const invalidPropDefInObjLiteral = () => createMappedError(164, X);

const unterminatedStringLiteral = () => createMappedError(165, X);

const unterminatedTemplateLiteral = () => createMappedError(166, X);

const missingExpectedToken = e => createMappedError(167, X);

const unexpectedTokenInDestructuring = () => createMappedError(170, X);

const unexpectedTokenInOptionalChain = () => createMappedError(171, X);

const invalidTaggedTemplateOnOptionalChain = () => createMappedError(172, X);

const invalidArrowParameterList = () => createMappedError(173, X);

const defaultParamsInArrowFn = () => createMappedError(174, X);

const destructuringParamsInArrowFn = () => createMappedError(175, X);

const restParamsMustBeLastParam = () => createMappedError(176, X);

const functionBodyInArrowFn = () => createMappedError(178, X);

const unexpectedDoubleDot = () => createMappedError(179, X);

const pe = [ D, N, U, K, "new", "this", "$this", null, "$parent", "(", "{", ".", "..", "...", "?.", "}", ")", ",", "[", "]", ":", ";", "?", "'", '"', "&", "|", "??", "||", "&&", "==", "!=", "===", "!==", "<", ">", "<=", ">=", "in", "instanceof", "+", "-", "typeof", "void", "*", "%", "/", "**", "=", "!", 2163762, 2163763, "of", "=>", "+=", "-=", "*=", "/=", "++", "--" ];

const fe = /*@__PURE__*/ Object.assign(createLookup(), {
    true: 8193,
    null: 8194,
    false: 8192,
    undefined: 8195,
    new: 8196,
    this: 12294,
    $this: 12293,
    $parent: 12296,
    in: 6562214,
    instanceof: 6562215,
    typeof: 139306,
    void: 139307,
    of: 4204596
});

const {CharScanners: xe, IdParts: we} = /*@__PURE__*/ (() => {
    const unexpectedCharacter = () => {
        throw createMappedError(168, X);
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
        for (let s = 0; s < n; s += 2) {
            const n = t[s];
            let i = t[s + 1];
            i = i > 0 ? i : n + 1;
            if (e) {
                e.fill(r, n, i);
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
            return 131121;
        }
        if (nextChar() !== 61) {
            return 6553951;
        }
        nextChar();
        return 6553953;
    };
    t[61] = () => {
        if (nextChar() === 62) {
            nextChar();
            return 53;
        }
        if (ne !== 61) {
            return 4194352;
        }
        if (nextChar() !== 61) {
            return 6553950;
        }
        nextChar();
        return 6553952;
    };
    t[38] = () => {
        if (nextChar() !== 38) {
            return 6291481;
        }
        nextChar();
        return 6553885;
    };
    t[124] = () => {
        if (nextChar() !== 124) {
            return 6291482;
        }
        nextChar();
        return 6553820;
    };
    t[63] = () => {
        if (nextChar() === 46) {
            const e = $charCodeAt(Y + 1);
            if (e <= 48 || e >= 57) {
                nextChar();
                return 2162702;
            }
            return 6291480;
        }
        if (ne !== 63) {
            return 6291480;
        }
        nextChar();
        return 6553755;
    };
    t[46] = () => {
        if (nextChar() <= 57 && ne >= 48) {
            return scanNumber(true);
        }
        if (ne === 46) {
            if (nextChar() !== 46) {
                return 12;
            }
            nextChar();
            return 13;
        }
        return 65547;
    };
    t[60] = () => {
        if (nextChar() !== 61) {
            return 6554018;
        }
        nextChar();
        return 6554020;
    };
    t[62] = () => {
        if (nextChar() !== 61) {
            return 6554019;
        }
        nextChar();
        return 6554021;
    };
    t[37] = returnToken(6554157);
    t[40] = returnToken(2688009);
    t[41] = returnToken(7340048);
    t[42] = () => {
        if (nextChar() === 61) {
            nextChar();
            return 4194360;
        }
        if (ne === 42) {
            nextChar();
            return 6554223;
        }
        return 6554156;
    };
    t[43] = () => {
        if (nextChar() === 43) {
            nextChar();
            return 2228282;
        }
        if (ne !== 61) {
            return 2490856;
        }
        nextChar();
        return 4194358;
    };
    t[44] = returnToken(6291475);
    t[45] = () => {
        if (nextChar() === 45) {
            nextChar();
            return 2228283;
        }
        if (ne !== 61) {
            return 2490857;
        }
        nextChar();
        return 4194359;
    };
    t[47] = () => {
        if (nextChar() !== 61) {
            return 6554158;
        }
        nextChar();
        return 4194361;
    };
    t[58] = returnToken(6291478);
    t[59] = returnToken(6291479);
    t[91] = returnToken(2688020);
    t[93] = returnToken(7340053);
    t[123] = returnToken(524298);
    t[125] = returnToken(7340047);
    return {
        CharScanners: t,
        IdParts: s
    };
})();

export { AccessBoundaryExpression, AccessGlobalExpression, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, ArrayBindingPattern, ArrayLiteralExpression, ArrowFunction, AssignExpression, BinaryExpression, BindingBehaviorExpression, BindingIdentifier, CallFunctionExpression, CallGlobalExpression, CallMemberExpression, CallScopeExpression, ConditionalExpression, CustomExpression, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, ExpressionParser, ForOfStatement, j as IExpressionParser, Interpolation, NewExpression, ObjectBindingPattern, ObjectLiteralExpression, PrimitiveLiteralExpression, TaggedTemplateExpression, TemplateExpression, UnaryExpression, Unparser, ValueConverterExpression, astVisit, parseExpression };

