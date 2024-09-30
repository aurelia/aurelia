import { emptyArray, createImplementationRegister, DI } from '../../../kernel/dist/native-modules/index.mjs';

/* eslint-disable @typescript-eslint/no-unused-vars */
/** @internal */ const ekAccessThis = 'AccessThis';
/** @internal */ const ekAccessBoundary = 'AccessBoundary';
/** @internal */ const ekAccessGlobal = 'AccessGlobal';
/** @internal */ const ekAccessScope = 'AccessScope';
/** @internal */ const ekArrayLiteral = 'ArrayLiteral';
/** @internal */ const ekObjectLiteral = 'ObjectLiteral';
/** @internal */ const ekPrimitiveLiteral = 'PrimitiveLiteral';
/** @internal */ const ekTemplate = 'Template';
/** @internal */ const ekUnary = 'Unary';
/** @internal */ const ekCallScope = 'CallScope';
/** @internal */ const ekCallMember = 'CallMember';
/** @internal */ const ekCallFunction = 'CallFunction';
/** @internal */ const ekCallGlobal = 'CallGlobal';
/** @internal */ const ekAccessMember = 'AccessMember';
/** @internal */ const ekAccessKeyed = 'AccessKeyed';
/** @internal */ const ekTaggedTemplate = 'TaggedTemplate';
/** @internal */ const ekBinary = 'Binary';
/** @internal */ const ekConditional = 'Conditional';
/** @internal */ const ekAssign = 'Assign';
/** @internal */ const ekArrowFunction = 'ArrowFunction';
/** @internal */ const ekValueConverter = 'ValueConverter';
/** @internal */ const ekBindingBehavior = 'BindingBehavior';
/** @internal */ const ekArrayBindingPattern = 'ArrayBindingPattern';
/** @internal */ const ekObjectBindingPattern = 'ObjectBindingPattern';
/** @internal */ const ekBindingIdentifier = 'BindingIdentifier';
/** @internal */ const ekForOfStatement = 'ForOfStatement';
/** @internal */ const ekInterpolation = 'Interpolation';
/** @internal */ const ekArrayDestructuring = 'ArrayDestructuring';
/** @internal */ const ekObjectDestructuring = 'ObjectDestructuring';
/** @internal */ const ekDestructuringAssignmentLeaf = 'DestructuringAssignmentLeaf';
/** @internal */ const ekCustom = 'Custom';
class CustomExpression {
    constructor(value) {
        this.value = value;
        this.$kind = ekCustom;
    }
    evaluate(...params) {
        return this.value;
    }
    assign(...params) {
        return params;
    }
    bind(...params) {
        // empty
    }
    unbind(...params) {
        // empty
    }
    accept(_visitor) {
        return (void 0);
    }
}
class BindingBehaviorExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.$kind = ekBindingBehavior;
        this.key = `_bb_${name}`;
    }
}
class ValueConverterExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.$kind = ekValueConverter;
    }
}
class AssignExpression {
    constructor(target, value, op = '=') {
        this.target = target;
        this.value = value;
        this.op = op;
        this.$kind = ekAssign;
    }
}
class ConditionalExpression {
    constructor(condition, yes, no) {
        this.condition = condition;
        this.yes = yes;
        this.no = no;
        this.$kind = ekConditional;
    }
}
class AccessGlobalExpression {
    constructor(name) {
        this.name = name;
        this.$kind = ekAccessGlobal;
    }
}
class AccessThisExpression {
    constructor(ancestor = 0) {
        this.ancestor = ancestor;
        this.$kind = ekAccessThis;
    }
}
class AccessBoundaryExpression {
    constructor() {
        this.$kind = ekAccessBoundary;
    }
}
class AccessScopeExpression {
    constructor(name, ancestor = 0) {
        this.name = name;
        this.ancestor = ancestor;
        this.$kind = ekAccessScope;
    }
}
const isAccessGlobal = (ast) => (ast.$kind === ekAccessGlobal ||
    (ast.$kind === ekAccessMember ||
        ast.$kind === ekAccessKeyed) && ast.accessGlobal);
class AccessMemberExpression {
    constructor(object, name, optional = false) {
        this.object = object;
        this.name = name;
        this.optional = optional;
        this.$kind = ekAccessMember;
        this.accessGlobal = isAccessGlobal(object);
    }
}
class AccessKeyedExpression {
    constructor(object, key, optional = false) {
        this.object = object;
        this.key = key;
        this.optional = optional;
        this.$kind = ekAccessKeyed;
        this.accessGlobal = isAccessGlobal(object);
    }
}
class CallScopeExpression {
    constructor(name, args, ancestor = 0, optional = false) {
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
        this.optional = optional;
        this.$kind = ekCallScope;
    }
}
class CallMemberExpression {
    constructor(object, name, args, optionalMember = false, optionalCall = false) {
        this.object = object;
        this.name = name;
        this.args = args;
        this.optionalMember = optionalMember;
        this.optionalCall = optionalCall;
        this.$kind = ekCallMember;
    }
}
class CallFunctionExpression {
    constructor(func, args, optional = false) {
        this.func = func;
        this.args = args;
        this.optional = optional;
        this.$kind = ekCallFunction;
    }
}
class CallGlobalExpression {
    constructor(name, args) {
        this.name = name;
        this.args = args;
        this.$kind = ekCallGlobal;
    }
}
class BinaryExpression {
    constructor(operation, left, right) {
        this.operation = operation;
        this.left = left;
        this.right = right;
        this.$kind = ekBinary;
    }
}
class UnaryExpression {
    constructor(operation, expression, pos = 0) {
        this.operation = operation;
        this.expression = expression;
        this.pos = pos;
        this.$kind = ekUnary;
    }
}
class PrimitiveLiteralExpression {
    constructor(value) {
        this.value = value;
        this.$kind = ekPrimitiveLiteral;
    }
}
PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);
PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);
PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);
PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);
PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression('');
class ArrayLiteralExpression {
    constructor(elements) {
        this.elements = elements;
        this.$kind = ekArrayLiteral;
    }
}
ArrayLiteralExpression.$empty = new ArrayLiteralExpression(emptyArray);
class ObjectLiteralExpression {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
        this.$kind = ekObjectLiteral;
    }
}
ObjectLiteralExpression.$empty = new ObjectLiteralExpression(emptyArray, emptyArray);
class TemplateExpression {
    constructor(cooked, expressions = emptyArray) {
        this.cooked = cooked;
        this.expressions = expressions;
        this.$kind = ekTemplate;
    }
}
TemplateExpression.$empty = new TemplateExpression(['']);
class TaggedTemplateExpression {
    constructor(cooked, raw, func, expressions = emptyArray) {
        this.cooked = cooked;
        this.func = func;
        this.expressions = expressions;
        this.$kind = ekTaggedTemplate;
        cooked.raw = raw;
    }
}
class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.elements = elements;
        this.$kind = ekArrayBindingPattern;
    }
}
class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
        this.$kind = ekObjectBindingPattern;
    }
}
class BindingIdentifier {
    constructor(name) {
        this.name = name;
        this.$kind = ekBindingIdentifier;
    }
}
// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
class ForOfStatement {
    constructor(declaration, iterable, semiIdx) {
        this.declaration = declaration;
        this.iterable = iterable;
        this.semiIdx = semiIdx;
        this.$kind = ekForOfStatement;
    }
}
/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
class Interpolation {
    constructor(parts, expressions = emptyArray) {
        this.parts = parts;
        this.expressions = expressions;
        this.$kind = ekInterpolation;
        this.isMulti = expressions.length > 1;
        this.firstExpression = expressions[0];
    }
}
// spec: https://tc39.es/ecma262/#sec-destructuring-assignment
/** This is an internal API */
class DestructuringAssignmentExpression {
    constructor($kind, list, source, initializer) {
        this.$kind = $kind;
        this.list = list;
        this.source = source;
        this.initializer = initializer;
    }
}
/** This is an internal API */
class DestructuringAssignmentSingleExpression {
    constructor(target, source, initializer) {
        this.target = target;
        this.source = source;
        this.initializer = initializer;
        this.$kind = ekDestructuringAssignmentLeaf;
    }
}
/** This is an internal API */
class DestructuringAssignmentRestExpression {
    constructor(target, indexOrProperties) {
        this.target = target;
        this.indexOrProperties = indexOrProperties;
        this.$kind = ekDestructuringAssignmentLeaf;
    }
}
class ArrowFunction {
    constructor(args, body, rest = false) {
        this.args = args;
        this.body = body;
        this.rest = rest;
        this.$kind = ekArrowFunction;
    }
}

/** @internal */
const createError = (message) => new Error(message);
/** @internal */
const isString = (v) => typeof v === 'string';
// this is used inside template literal, since TS errs without String(...value)
/** @internal */ const safeString = String;
/** @internal */ const createLookup = () => Object.create(null);

const astVisit = (ast, visitor) => {
    switch (ast.$kind) {
        case ekAccessKeyed: return visitor.visitAccessKeyed(ast);
        case ekAccessMember: return visitor.visitAccessMember(ast);
        case ekAccessScope: return visitor.visitAccessScope(ast);
        case ekAccessThis: return visitor.visitAccessThis(ast);
        case ekAccessBoundary: return visitor.visitAccessBoundary(ast);
        case ekArrayBindingPattern: return visitor.visitArrayBindingPattern(ast);
        case ekArrayDestructuring: return visitor.visitDestructuringAssignmentExpression(ast);
        case ekArrayLiteral: return visitor.visitArrayLiteral(ast);
        case ekArrowFunction: return visitor.visitArrowFunction(ast);
        case ekAssign: return visitor.visitAssign(ast);
        case ekBinary: return visitor.visitBinary(ast);
        case ekBindingBehavior: return visitor.visitBindingBehavior(ast);
        case ekBindingIdentifier: return visitor.visitBindingIdentifier(ast);
        case ekCallFunction: return visitor.visitCallFunction(ast);
        case ekCallMember: return visitor.visitCallMember(ast);
        case ekCallScope: return visitor.visitCallScope(ast);
        case ekConditional: return visitor.visitConditional(ast);
        case ekDestructuringAssignmentLeaf: return visitor.visitDestructuringAssignmentSingleExpression(ast);
        case ekForOfStatement: return visitor.visitForOfStatement(ast);
        case ekInterpolation: return visitor.visitInterpolation(ast);
        case ekObjectBindingPattern: return visitor.visitObjectBindingPattern(ast);
        case ekObjectDestructuring: return visitor.visitDestructuringAssignmentExpression(ast);
        case ekObjectLiteral: return visitor.visitObjectLiteral(ast);
        case ekPrimitiveLiteral: return visitor.visitPrimitiveLiteral(ast);
        case ekTaggedTemplate: return visitor.visitTaggedTemplate(ast);
        case ekTemplate: return visitor.visitTemplate(ast);
        case ekUnary: return visitor.visitUnary(ast);
        case ekValueConverter: return visitor.visitValueConverter(ast);
        case ekCustom: return visitor.visitCustom(ast);
        default: {
            throw createError(`Trying to visit unknown ast node ${JSON.stringify(ast)}`);
        }
    }
};
class Unparser {
    constructor() {
        this.text = '';
    }
    static unparse(expr) {
        const visitor = new Unparser();
        astVisit(expr, visitor);
        return visitor.text;
    }
    visitAccessMember(expr) {
        astVisit(expr.object, this);
        this.text += `${expr.optional ? '?' : ''}.${expr.name}`;
    }
    visitAccessKeyed(expr) {
        astVisit(expr.object, this);
        this.text += `${expr.optional ? '?.' : ''}[`;
        astVisit(expr.key, this);
        this.text += ']';
    }
    visitAccessThis(expr) {
        if (expr.ancestor === 0) {
            this.text += '$this';
            return;
        }
        this.text += '$parent';
        let i = expr.ancestor - 1;
        while (i--) {
            this.text += '.$parent';
        }
    }
    visitAccessBoundary(_expr) {
        this.text += 'this';
    }
    visitAccessScope(expr) {
        let i = expr.ancestor;
        while (i--) {
            this.text += '$parent.';
        }
        this.text += expr.name;
    }
    visitArrayLiteral(expr) {
        const elements = expr.elements;
        this.text += '[';
        for (let i = 0, length = elements.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            astVisit(elements[i], this);
        }
        this.text += ']';
    }
    visitArrowFunction(expr) {
        const args = expr.args;
        const ii = args.length;
        let i = 0;
        let text = '(';
        let name;
        for (; i < ii; ++i) {
            name = args[i].name;
            if (i > 0) {
                text += ', ';
            }
            if (i < ii - 1) {
                text += name;
            }
            else {
                text += expr.rest ? `...${name}` : name;
            }
        }
        this.text += `${text}) => `;
        astVisit(expr.body, this);
    }
    visitObjectLiteral(expr) {
        const keys = expr.keys;
        const values = expr.values;
        this.text += '{';
        for (let i = 0, length = keys.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            this.text += `'${keys[i]}':`;
            astVisit(values[i], this);
        }
        this.text += '}';
    }
    visitPrimitiveLiteral(expr) {
        this.text += '(';
        if (isString(expr.value)) {
            const escaped = expr.value.replace(/'/g, '\\\'');
            this.text += `'${escaped}'`;
        }
        else {
            this.text += `${expr.value}`;
        }
        this.text += ')';
    }
    visitCallFunction(expr) {
        this.text += '(';
        astVisit(expr.func, this);
        this.text += expr.optional ? '?.' : '';
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallMember(expr) {
        this.text += '(';
        astVisit(expr.object, this);
        this.text += `${expr.optionalMember ? '?.' : ''}.${expr.name}${expr.optionalCall ? '?.' : ''}`;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallScope(expr) {
        this.text += '(';
        let i = expr.ancestor;
        while (i--) {
            this.text += '$parent.';
        }
        this.text += `${expr.name}${expr.optional ? '?.' : ''}`;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            astVisit(expressions[i], this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitTaggedTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        astVisit(expr.func, this);
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            astVisit(expressions[i], this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitUnary(expr) {
        this.text += `(${expr.operation}`;
        if (expr.operation.charCodeAt(0) >= /* a */ 97) {
            this.text += ' ';
        }
        astVisit(expr.expression, this);
        this.text += ')';
    }
    visitBinary(expr) {
        this.text += '(';
        astVisit(expr.left, this);
        if (expr.operation.charCodeAt(0) === /* i */ 105) {
            this.text += ` ${expr.operation} `;
        }
        else {
            this.text += expr.operation;
        }
        astVisit(expr.right, this);
        this.text += ')';
    }
    visitConditional(expr) {
        this.text += '(';
        astVisit(expr.condition, this);
        this.text += '?';
        astVisit(expr.yes, this);
        this.text += ':';
        astVisit(expr.no, this);
        this.text += ')';
    }
    visitAssign(expr) {
        this.text += '(';
        astVisit(expr.target, this);
        this.text += '=';
        astVisit(expr.value, this);
        this.text += ')';
    }
    visitValueConverter(expr) {
        const args = expr.args;
        astVisit(expr.expression, this);
        this.text += `|${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            astVisit(args[i], this);
        }
    }
    visitBindingBehavior(expr) {
        const args = expr.args;
        astVisit(expr.expression, this);
        this.text += `&${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            astVisit(args[i], this);
        }
    }
    visitArrayBindingPattern(expr) {
        const elements = expr.elements;
        this.text += '[';
        for (let i = 0, length = elements.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            astVisit(elements[i], this);
        }
        this.text += ']';
    }
    visitObjectBindingPattern(expr) {
        const keys = expr.keys;
        const values = expr.values;
        this.text += '{';
        for (let i = 0, length = keys.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            this.text += `'${keys[i]}':`;
            astVisit(values[i], this);
        }
        this.text += '}';
    }
    visitBindingIdentifier(expr) {
        this.text += expr.name;
    }
    visitForOfStatement(expr) {
        astVisit(expr.declaration, this);
        this.text += ' of ';
        astVisit(expr.iterable, this);
    }
    visitInterpolation(expr) {
        const { parts, expressions } = expr;
        const length = expressions.length;
        this.text += '${';
        this.text += parts[0];
        for (let i = 0; i < length; i++) {
            astVisit(expressions[i], this);
            this.text += parts[i + 1];
        }
        this.text += '}';
    }
    visitDestructuringAssignmentExpression(expr) {
        const $kind = expr.$kind;
        const isObjDes = $kind === ekObjectDestructuring;
        this.text += isObjDes ? '{' : '[';
        const list = expr.list;
        const len = list.length;
        let i;
        let item;
        for (i = 0; i < len; i++) {
            item = list[i];
            switch (item.$kind) {
                case ekDestructuringAssignmentLeaf:
                    astVisit(item, this);
                    break;
                case ekArrayDestructuring:
                case ekObjectDestructuring: {
                    const source = item.source;
                    if (source) {
                        astVisit(source, this);
                        this.text += ':';
                    }
                    astVisit(item, this);
                    break;
                }
            }
        }
        this.text += isObjDes ? '}' : ']';
    }
    visitDestructuringAssignmentSingleExpression(expr) {
        astVisit(expr.source, this);
        this.text += ':';
        astVisit(expr.target, this);
        const initializer = expr.initializer;
        if (initializer !== void 0) {
            this.text += '=';
            astVisit(initializer, this);
        }
    }
    visitDestructuringAssignmentRestExpression(expr) {
        this.text += '...';
        astVisit(expr.target, this);
    }
    visitCustom(expr) {
        this.text += safeString(expr.value);
    }
    writeArgs(args) {
        this.text += '(';
        for (let i = 0, length = args.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            astVisit(args[i], this);
        }
        this.text += ')';
    }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => new Error(`AUR${safeString(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
    ;

const errorsMap = {
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    [101 /* ErrorNames.ast_behavior_not_found */]: `Ast eval error: binding behavior "{{0}}" could not be found. Did you forget to register it as a dependency?`,
    [102 /* ErrorNames.ast_behavior_duplicated */]: `Ast eval error: binding behavior "{{0}}" already applied.`,
    [103 /* ErrorNames.ast_converter_not_found */]: `Ast eval error: value converter "{{0}}" could not be found. Did you forget to register it as a dependency?`,
    [105 /* ErrorNames.ast_$host_not_found */]: `Ast eval error: unable to find $host context. Did you forget [au-slot] attribute?`,
    [106 /* ErrorNames.ast_no_assign_$host */]: `Ast eval error: invalid assignment. "$host" is a reserved keyword.`,
    [107 /* ErrorNames.ast_not_a_function */]: `Ast eval error: expression is not a function.`,
    [109 /* ErrorNames.ast_unknown_unary_operator */]: `Ast eval error: unknown unary operator: "{{0}}"`,
    [108 /* ErrorNames.ast_unknown_binary_operator */]: `Ast eval error: unknown binary operator: "{{0}}"`,
    [110 /* ErrorNames.ast_tagged_not_a_function */]: `Ast eval error: left-hand side of tagged template expression is not a function.`,
    [111 /* ErrorNames.ast_name_is_not_a_function */]: `Ast eval error: expected "{{0}}" to be a function`,
    [112 /* ErrorNames.ast_destruct_null */]: `Ast eval error: cannot use non-object value for destructuring assignment.`,
    [151 /* ErrorNames.parse_invalid_start */]: `Expression error: invalid start: "{{0}}"`,
    [152 /* ErrorNames.parse_no_spread */]: `Expression error: spread operator is not supported: "{{0}}"`,
    [153 /* ErrorNames.parse_expected_identifier */]: `Expression error: expected identifier: "{{0}}"`,
    [154 /* ErrorNames.parse_invalid_member_expr */]: `Expression error: invalid member expression: "{{0}}"`,
    [155 /* ErrorNames.parse_unexpected_end */]: `Expression error: unexpected end of expression: "{{0}}"`,
    [156 /* ErrorNames.parse_unconsumed_token */]: `Expression error: unconsumed token: "{{0}}" at position {{1}} of "{{2}}"`,
    [157 /* ErrorNames.parse_invalid_empty */]: `Expression error: invalid empty expression. Empty expression is only valid in event bindings (trigger, delegate, capture etc...)`,
    [158 /* ErrorNames.parse_left_hand_side_not_assignable */]: `Expression error: left hand side of expression is not assignable: "{{0}}"`,
    [159 /* ErrorNames.parse_expected_converter_identifier */]: `Expression error: expected identifier to come after value converter operator: "{{0}}"`,
    [160 /* ErrorNames.parse_expected_behavior_identifier */]: `Expression error: expected identifier to come after binding behavior operator: {{0}}`,
    [161 /* ErrorNames.parse_unexpected_keyword_of */]: `Expression error: unexpected keyword "of": "{{0}}"`,
    [162 /* ErrorNames.parse_unexpected_keyword_import */]: `Expression error: unexpected keyword "import": "{{0}}"`,
    [163 /* ErrorNames.parse_invalid_identifier_in_forof */]: `Expression error: invalid BindingIdentifier at left hand side of "of": "{{0}}" | kind: {{1}}`,
    [164 /* ErrorNames.parse_invalid_identifier_object_literal_key */]: `Expression error: invalid or unsupported property definition in object literal: "{{0}}"`,
    [165 /* ErrorNames.parse_unterminated_string */]: `Expression error: unterminated quote in string literal: "{{0}}"`,
    [166 /* ErrorNames.parse_unterminated_template_string */]: `Expression error: unterminated template string: "{{0}}"`,
    [167 /* ErrorNames.parse_missing_expected_token */]: `Expression error: missing expected token "{{0}}" in "{{1}}"`,
    [168 /* ErrorNames.parse_unexpected_character */]: `Expression error: unexpected character: "{{0}}"`,
    [170 /* ErrorNames.parse_unexpected_token_destructuring */]: `Expression error: unexpected "{{0}}" at position "{{1}}" for destructuring assignment in "{{2}}"`,
    [171 /* ErrorNames.parse_unexpected_token_optional_chain */]: `Expression error: unexpected {{0}} at position "{{1}}" for optional chain in "{{2}}"`,
    [172 /* ErrorNames.parse_invalid_tag_in_optional_chain */]: `Expression error: invalid tagged template on optional chain in "{{1}}"`,
    [173 /* ErrorNames.parse_invalid_arrow_params */]: `Expression error: invalid arrow parameter list in "{{0}}"`,
    [174 /* ErrorNames.parse_no_arrow_param_default_value */]: `Expression error: arrow function with default parameters is not supported: "{{0}}"`,
    [175 /* ErrorNames.parse_no_arrow_param_destructuring */]: `Expression error: arrow function with destructuring parameters is not supported: "{{0}}"`,
    [176 /* ErrorNames.parse_rest_must_be_last */]: `Expression error: rest parameter must be last formal parameter in arrow function: "{{0}}"`,
    [178 /* ErrorNames.parse_no_arrow_fn_body */]: `Expression error: arrow function with function body is not supported: "{{0}}"`,
    [179 /* ErrorNames.parse_unexpected_double_dot */]: `Expression error: unexpected token '.' at position "{{1}}" in "{{0}}"`,
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'toString':
                        value = Object.prototype.toString.call(value);
                        break;
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            value = safeString(value[method.slice(1)]);
                        }
                        else {
                            value = safeString(value);
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + value + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
const IExpressionParser = /*@__PURE__*/ DI.createInterface('IExpressionParser');
/**
 * A default implementation of the IExpressionParser interface
 */
class ExpressionParser {
    constructor() {
        /** @internal */ this._expressionLookup = createLookup();
        /** @internal */ this._forOfLookup = createLookup();
        /** @internal */ this._interpolationLookup = createLookup();
    }
    parse(expression, expressionType) {
        let found;
        switch (expressionType) {
            case etIsCustom:
                return new CustomExpression(expression);
            case etInterpolation:
                found = this._interpolationLookup[expression];
                if (found === void 0) {
                    found = this._interpolationLookup[expression] = this.$parse(expression, expressionType);
                }
                return found;
            case etIsIterator:
                found = this._forOfLookup[expression];
                if (found === void 0) {
                    found = this._forOfLookup[expression] = this.$parse(expression, expressionType);
                }
                return found;
            default: {
                if (expression.length === 0) {
                    if (expressionType === etIsFunction || expressionType === etIsProperty) {
                        return PrimitiveLiteralExpression.$empty;
                    }
                    throw invalidEmptyExpression();
                }
                found = this._expressionLookup[expression];
                if (found === void 0) {
                    found = this._expressionLookup[expression] = this.$parse(expression, expressionType);
                }
                return found;
            }
        }
    }
    /** @internal */
    $parse(expression, expressionType) {
        $input = expression;
        $index = 0;
        $length = expression.length;
        $scopeDepth = 0;
        $startIndex = 0;
        $currentToken = 6291456 /* Token.EOF */;
        $tokenValue = '';
        $currentChar = $charCodeAt(0);
        $assignable = true;
        $optional = false;
        $accessGlobal = true;
        $semicolonIndex = -1;
        return parse(61 /* Precedence.Variadic */, expressionType === void 0 ? etIsProperty : expressionType);
    }
}
ExpressionParser.register = createImplementationRegister(IExpressionParser);

function unescapeCode(code) {
    switch (code) {
        case 98 /* Char.LowerB */: return 8 /* Char.Backspace */;
        case 116 /* Char.LowerT */: return 9 /* Char.Tab */;
        case 110 /* Char.LowerN */: return 10 /* Char.LineFeed */;
        case 118 /* Char.LowerV */: return 11 /* Char.VerticalTab */;
        case 102 /* Char.LowerF */: return 12 /* Char.FormFeed */;
        case 114 /* Char.LowerR */: return 13 /* Char.CarriageReturn */;
        case 34 /* Char.DoubleQuote */: return 34 /* Char.DoubleQuote */;
        case 39 /* Char.SingleQuote */: return 39 /* Char.SingleQuote */;
        case 92 /* Char.Backslash */: return 92 /* Char.Backslash */;
        default: return code;
    }
}


const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $this = new AccessThisExpression(0);
const $parent = new AccessThisExpression(1);
const boundary = new AccessBoundaryExpression();
const etNone = 'None';
const etInterpolation = 'Interpolation';
const etIsIterator = 'IsIterator';
const etIsChainable = 'IsChainable';
const etIsFunction = 'IsFunction';
const etIsProperty = 'IsProperty';
const etIsCustom = 'IsCustom';
let $input = '';
let $index = 0;
let $length = 0;
let $scopeDepth = 0;
let $startIndex = 0;
let $currentToken = 6291456 /* Token.EOF */;
let $tokenValue = '';
let $currentChar;
let $assignable = true;
let $optional = false;
let $accessGlobal = true;
let $semicolonIndex = -1;
const stringFromCharCode = String.fromCharCode;
const $charCodeAt = (index) => $input.charCodeAt(index);
const $tokenRaw = () => $input.slice($startIndex, $index);
const globalNames = ('Infinity NaN isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent' +
    ' Array BigInt Boolean Date Map Number Object RegExp Set String JSON Math Intl').split(' ');
function parseExpression(input, expressionType) {
    $input = input;
    $index = 0;
    $length = input.length;
    $scopeDepth = 0;
    $startIndex = 0;
    $currentToken = 6291456 /* Token.EOF */;
    $tokenValue = '';
    $currentChar = $charCodeAt(0);
    $assignable = true;
    $optional = false;
    $accessGlobal = true;
    $semicolonIndex = -1;
    return parse(61 /* Precedence.Variadic */, expressionType === void 0 ? etIsProperty : expressionType);
}
// This is performance-critical code which follows a subset of the well-known ES spec.
// Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
// single source of information for being able to figure it out.
// It generally does not need to change unless the spec changes or spec violations are found, or optimization
// opportunities are found (which would likely not fix these warnings in any case).
// It's therefore not considered to have any tangible impact on the maintainability of the code base.
// For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
// eslint-disable-next-line max-lines-per-function
function parse(minPrecedence, expressionType) {
    if (expressionType === etIsCustom) {
        return new CustomExpression($input);
    }
    if ($index === 0) {
        if (expressionType === etInterpolation) {
            return parseInterpolation();
        }
        nextToken();
        if ($currentToken & 4194304 /* Token.ExpressionTerminal */) {
            throw invalidStartOfExpression();
        }
    }
    $assignable = 513 /* Precedence.Binary */ > minPrecedence;
    $optional = false;
    $accessGlobal = 514 /* Precedence.LeftHandSide */ > minPrecedence;
    let optionalThisTail = false;
    let result = void 0;
    let ancestor = 0;
    if ($currentToken & 131072 /* Token.UnaryOp */) {
        /**
         * parseUnaryExpression
         *
         * https://tc39.github.io/ecma262/#sec-unary-operators
         *
         * UnaryExpression :
         * 1. LeftHandSideExpression
         * 2. void UnaryExpression
         * 3. typeof UnaryExpression
         * 4. + UnaryExpression
         * 5. - UnaryExpression
         * 6. ! UnaryExpression
         * 7. ++ UnaryExpression
         * 8. -- UnaryExpression
         *
         * IsValidAssignmentTarget
         * 2,3,4,5,6,7,8 = false
         * 1 = see parseLeftHandSideExpression
         *
         * Note: technically we should throw on +++ / ---, but there's nothing to gain from that
         */
        const op = TokenValues[$currentToken & 63 /* Token.Type */];
        nextToken();
        result = new UnaryExpression(op, parse(514 /* Precedence.LeftHandSide */, expressionType));
        $assignable = false;
    }
    else {
        /**
         * parsePrimaryExpression
         *
         * https://tc39.github.io/ecma262/#sec-primary-expression
         *
         * PrimaryExpression :
         * 1. this
         * 2. IdentifierName
         * 3. Literal
         * 4. ArrayLiteralExpression
         * 5. ObjectLiteralExpression
         * 6. TemplateLiteral
         * 7. ParenthesizedExpression
         *
         * Literal :
         * NullLiteral
         * BooleanLiteral
         * NumericLiteral
         * StringLiteral
         *
         * ParenthesizedExpression :
         * ( AssignmentExpression )
         *
         * IsValidAssignmentTarget
         * 1,3,4,5,6,7 = false
         * 2 = true
         */
        primary: switch ($currentToken) {
            case 12295 /* Token.ParentScope */: // $parent
                ancestor = $scopeDepth;
                $assignable = false;
                $accessGlobal = false;
                do {
                    nextToken();
                    ++ancestor;
                    switch ($currentToken) {
                        case 65546 /* Token.Dot */:
                            nextToken();
                            if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                                throw expectedIdentifier();
                            }
                            break;
                        case 11 /* Token.DotDot */:
                        case 12 /* Token.DotDotDot */:
                            throw expectedIdentifier();
                        case 2162701 /* Token.QuestionDot */:
                            $optional = true;
                            nextToken();
                            if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                                result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                                optionalThisTail = true;
                                break primary;
                            }
                            break;
                        default:
                            if ($currentToken & 2097152 /* Token.AccessScopeTerminal */) {
                                result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                                break primary;
                            }
                            throw invalidMemberExpression();
                    }
                } while ($currentToken === 12295 /* Token.ParentScope */);
            // falls through
            case 4096 /* Token.Identifier */: { // identifier
                const id = $tokenValue;
                if (expressionType === etIsIterator) {
                    result = new BindingIdentifier(id);
                }
                else if ($accessGlobal && globalNames.includes(id)) {
                    result = new AccessGlobalExpression(id);
                }
                else if ($accessGlobal && id === 'import') {
                    throw unexpectedImportKeyword();
                }
                else {
                    result = new AccessScopeExpression(id, ancestor);
                }
                $assignable = !$optional;
                nextToken();
                if (consumeOpt(51 /* Token.Arrow */)) {
                    if ($currentToken === 524297 /* Token.OpenBrace */) {
                        throw functionBodyInArrowFn();
                    }
                    const _optional = $optional;
                    const _scopeDepth = $scopeDepth;
                    ++$scopeDepth;
                    const body = parse(62 /* Precedence.Assign */, etNone);
                    $optional = _optional;
                    $scopeDepth = _scopeDepth;
                    $assignable = false;
                    result = new ArrowFunction([new BindingIdentifier(id)], body);
                }
                break;
            }
            case 11 /* Token.DotDot */:
                throw unexpectedDoubleDot();
            case 12 /* Token.DotDotDot */:
                throw invalidSpreadOp();
            case 12292 /* Token.ThisScope */: // $this
                $assignable = false;
                nextToken();
                switch ($scopeDepth) {
                    case 0:
                        result = $this;
                        break;
                    case 1:
                        result = $parent;
                        break;
                    default:
                        result = new AccessThisExpression($scopeDepth);
                        break;
                }
                break;
            case 12293 /* Token.AccessBoundary */: // this
                $assignable = false;
                nextToken();
                result = boundary;
                break;
            case 2688008 /* Token.OpenParen */:
                result = parseCoverParenthesizedExpressionAndArrowParameterList(expressionType);
                break;
            case 2688019 /* Token.OpenBracket */:
                result = $input.search(/\s+of\s+/) > $index ? parseArrayDestructuring() : parseArrayLiteralExpression(expressionType);
                break;
            case 524297 /* Token.OpenBrace */:
                result = parseObjectLiteralExpression(expressionType);
                break;
            case 2163760 /* Token.TemplateTail */:
                result = new TemplateExpression([$tokenValue]);
                $assignable = false;
                nextToken();
                break;
            case 2163761 /* Token.TemplateContinuation */:
                result = parseTemplate(expressionType, result, false);
                break;
            case 16384 /* Token.StringLiteral */:
            case 32768 /* Token.NumericLiteral */:
                result = new PrimitiveLiteralExpression($tokenValue);
                $assignable = false;
                nextToken();
                break;
            case 8194 /* Token.NullKeyword */:
            case 8195 /* Token.UndefinedKeyword */:
            case 8193 /* Token.TrueKeyword */:
            case 8192 /* Token.FalseKeyword */:
                result = TokenValues[$currentToken & 63 /* Token.Type */];
                $assignable = false;
                nextToken();
                break;
            default:
                if ($index >= $length) {
                    throw unexpectedEndOfExpression();
                }
                else {
                    throw unconsumedToken();
                }
        }
        if (expressionType === etIsIterator) {
            return parseForOfStatement(result);
        }
        switch ($currentToken) {
            case 2228280 /* Token.PlusPlus */:
            case 2228281 /* Token.MinusMinus */:
                result = new UnaryExpression(TokenValues[$currentToken & 63 /* Token.Type */], result, 1);
                nextToken();
                $assignable = false;
                break;
        }
        if (514 /* Precedence.LeftHandSide */ < minPrecedence) {
            return result;
        }
        if ($currentToken === 11 /* Token.DotDot */ || $currentToken === 12 /* Token.DotDotDot */) {
            throw expectedIdentifier();
        }
        if (result.$kind === ekAccessThis) {
            switch ($currentToken) {
                case 2162701 /* Token.QuestionDot */:
                    $optional = true;
                    $assignable = false;
                    nextToken();
                    if (($currentToken & 13312 /* Token.OptionalSuffix */) === 0) {
                        throw unexpectedTokenInOptionalChain();
                    }
                    if ($currentToken & 12288 /* Token.IdentifierName */) {
                        result = new AccessScopeExpression($tokenValue, result.ancestor);
                        nextToken();
                    }
                    else if ($currentToken === 2688008 /* Token.OpenParen */) {
                        result = new CallFunctionExpression(result, parseArguments(), true);
                    }
                    else if ($currentToken === 2688019 /* Token.OpenBracket */) {
                        result = parseKeyedExpression(result, true);
                    }
                    else {
                        throw invalidTaggedTemplateOnOptionalChain();
                    }
                    break;
                case 65546 /* Token.Dot */:
                    $assignable = !$optional;
                    nextToken();
                    if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                        throw expectedIdentifier();
                    }
                    result = new AccessScopeExpression($tokenValue, result.ancestor);
                    nextToken();
                    break;
                case 11 /* Token.DotDot */:
                case 12 /* Token.DotDotDot */:
                    throw expectedIdentifier();
                case 2688008 /* Token.OpenParen */:
                    result = new CallFunctionExpression(result, parseArguments(), optionalThisTail);
                    break;
                case 2688019 /* Token.OpenBracket */:
                    result = parseKeyedExpression(result, optionalThisTail);
                    break;
                case 2163760 /* Token.TemplateTail */:
                    result = createTemplateTail(result);
                    break;
                case 2163761 /* Token.TemplateContinuation */:
                    result = parseTemplate(expressionType, result, true);
                    break;
            }
        }
        /**
         * parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
         *
         * MemberExpression :
         * 1. PrimaryExpression
         * 2. MemberExpression [ AssignmentExpression ]
         * 3. MemberExpression . IdentifierName
         * 4. MemberExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,4 = false
         * 2,3 = true
         *
         *
         * parseCallExpression (Token.OpenParen)
         * CallExpression :
         * 1. MemberExpression Arguments
         * 2. CallExpression Arguments
         * 3. CallExpression [ AssignmentExpression ]
         * 4. CallExpression . IdentifierName
         * 5. CallExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,2,5 = false
         * 3,4 = true
         */
        while (($currentToken & 65536 /* Token.LeftHandSide */) > 0) {
            switch ($currentToken) {
                case 2162701 /* Token.QuestionDot */:
                    result = parseOptionalChainLHS(result);
                    break;
                case 65546 /* Token.Dot */:
                    nextToken();
                    if (($currentToken & 12288 /* Token.IdentifierName */) === 0) {
                        throw expectedIdentifier();
                    }
                    result = parseMemberExpressionLHS(result, false);
                    break;
                case 11 /* Token.DotDot */:
                case 12 /* Token.DotDotDot */:
                    throw expectedIdentifier();
                case 2688008 /* Token.OpenParen */:
                    if (result.$kind === ekAccessScope) {
                        result = new CallScopeExpression(result.name, parseArguments(), result.ancestor, false);
                    }
                    else if (result.$kind === ekAccessMember) {
                        result = new CallMemberExpression(result.object, result.name, parseArguments(), result.optional, false);
                    }
                    else if (result.$kind === ekAccessGlobal) {
                        result = new CallGlobalExpression(result.name, parseArguments());
                    }
                    else {
                        result = new CallFunctionExpression(result, parseArguments(), false);
                    }
                    break;
                case 2688019 /* Token.OpenBracket */:
                    result = parseKeyedExpression(result, false);
                    break;
                case 2163760 /* Token.TemplateTail */:
                    if ($optional) {
                        throw invalidTaggedTemplateOnOptionalChain();
                    }
                    result = createTemplateTail(result);
                    break;
                case 2163761 /* Token.TemplateContinuation */:
                    if ($optional) {
                        throw invalidTaggedTemplateOnOptionalChain();
                    }
                    result = parseTemplate(expressionType, result, true);
                    break;
            }
        }
    }
    if ($currentToken === 11 /* Token.DotDot */ || $currentToken === 12 /* Token.DotDotDot */) {
        throw expectedIdentifier();
    }
    if (513 /* Precedence.Binary */ < minPrecedence) {
        return result;
    }
    /**
     * parseBinaryExpression
     *
     * https://tc39.github.io/ecma262/#sec-multiplicative-operators
     *
     * MultiplicativeExpression : (local precedence 6)
     * UnaryExpression
     * MultiplicativeExpression * / % UnaryExpression
     *
     * AdditiveExpression : (local precedence 5)
     * MultiplicativeExpression
     * AdditiveExpression + - MultiplicativeExpression
     *
     * RelationalExpression : (local precedence 4)
     * AdditiveExpression
     * RelationalExpression < > <= >= instanceof in AdditiveExpression
     *
     * EqualityExpression : (local precedence 3)
     * RelationalExpression
     * EqualityExpression == != === !== RelationalExpression
     *
     * LogicalANDExpression : (local precedence 2)
     * EqualityExpression
     * LogicalANDExpression && EqualityExpression
     *
     * LogicalORExpression : (local precedence 1)
     * LogicalANDExpression
     * LogicalORExpression || LogicalANDExpression
     *
     * CoalesceExpression :
     * CoalesceExpressionHead ?? BitwiseORExpression
     *
     * CoalesceExpressionHead :
     * CoelesceExpression
     * BitwiseORExpression
     *
     * ShortCircuitExpression :
     * LogicalORExpression
     * CoalesceExpression
     */
    while (($currentToken & 262144 /* Token.BinaryOp */) > 0) {
        const opToken = $currentToken;
        if ((opToken & 960 /* Token.Precedence */) <= minPrecedence) {
            break;
        }
        nextToken();
        result = new BinaryExpression(TokenValues[opToken & 63 /* Token.Type */], result, parse(opToken & 960 /* Token.Precedence */, expressionType));
        $assignable = false;
    }
    if (63 /* Precedence.Conditional */ < minPrecedence) {
        return result;
    }
    /**
     * parseConditionalExpression
     * https://tc39.github.io/ecma262/#prod-ConditionalExpression
     *
     * ConditionalExpression :
     * 1. ShortCircuitExpression
     * 2. ShortCircuitExpression ? AssignmentExpression : AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(6291479 /* Token.Question */)) {
        const yes = parse(62 /* Precedence.Assign */, expressionType);
        consume(6291477 /* Token.Colon */);
        result = new ConditionalExpression(result, yes, parse(62 /* Precedence.Assign */, expressionType));
        $assignable = false;
    }
    if (62 /* Precedence.Assign */ < minPrecedence) {
        return result;
    }
    /**
     * parseAssignmentExpression
     *
     * https://tc39.github.io/ecma262/#prod-AssignmentExpression
     * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
     *
     * AssignmentExpression :
     * 1. ConditionalExpression
     * 2. LeftHandSideExpression = AssignmentExpression
     * 3. LeftHandSideExpression AssignmentOperator AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    switch ($currentToken) {
        case 4194350 /* Token.Equals */:
        case 4194356 /* Token.PlusEquals */:
        case 4194357 /* Token.MinusEquals */:
        case 4194358 /* Token.AsteriskEquals */:
        case 4194359 /* Token.SlashEquals */: {
            if (!$assignable) {
                throw lhsNotAssignable();
            }
            const op = TokenValues[$currentToken & 63 /* Token.Type */];
            nextToken();
            result = new AssignExpression(result, parse(62 /* Precedence.Assign */, expressionType), op);
            break;
        }
    }
    if (61 /* Precedence.Variadic */ < minPrecedence) {
        return result;
    }
    /**
     * parseValueConverter
     */
    while (consumeOpt(6291481 /* Token.Bar */)) {
        if ($currentToken === 6291456 /* Token.EOF */) {
            throw expectedValueConverterIdentifier();
        }
        const name = $tokenValue;
        nextToken();
        const args = new Array();
        while (consumeOpt(6291477 /* Token.Colon */)) {
            args.push(parse(62 /* Precedence.Assign */, expressionType));
        }
        result = new ValueConverterExpression(result, name, args);
    }
    /**
     * parseBindingBehavior
     */
    while (consumeOpt(6291480 /* Token.Ampersand */)) {
        if ($currentToken === 6291456 /* Token.EOF */) {
            throw expectedBindingBehaviorIdentifier();
        }
        const name = $tokenValue;
        nextToken();
        const args = new Array();
        while (consumeOpt(6291477 /* Token.Colon */)) {
            args.push(parse(62 /* Precedence.Assign */, expressionType));
        }
        result = new BindingBehaviorExpression(result, name, args);
    }
    if ($currentToken !== 6291456 /* Token.EOF */) {
        if (expressionType === etInterpolation && $currentToken === 7340046 /* Token.CloseBrace */) {
            return result;
        }
        if (expressionType === etIsChainable && $currentToken === 6291478 /* Token.Semicolon */) {
            if ($index === $length) {
                throw unconsumedToken();
            }
            $semicolonIndex = $index - 1;
            return result;
        }
        if ($tokenRaw() === 'of') {
            throw unexpectedOfKeyword();
        }
        throw unconsumedToken();
    }
    return result;
}
/**
 * [key,]
 * [key]
 * [,value]
 * [key,value]
 */
function parseArrayDestructuring() {
    const items = [];
    const dae = new DestructuringAssignmentExpression(ekArrayDestructuring, items, void 0, void 0);
    let target = '';
    let $continue = true;
    let index = 0;
    while ($continue) {
        nextToken();
        switch ($currentToken) {
            case 7340052 /* Token.CloseBracket */:
                $continue = false;
                addItem();
                break;
            case 6291472 /* Token.Comma */:
                addItem();
                break;
            case 4096 /* Token.Identifier */:
                target = $tokenRaw();
                break;
            default:
                throw unexpectedTokenInDestructuring();
        }
    }
    consume(7340052 /* Token.CloseBracket */);
    return dae;
    function addItem() {
        if (target !== '') {
            items.push(new DestructuringAssignmentSingleExpression(new AccessMemberExpression($this, target), new AccessKeyedExpression($this, new PrimitiveLiteralExpression(index++)), void 0));
            target = '';
        }
        else {
            index++;
        }
    }
}
function parseArguments() {
    const _optional = $optional;
    nextToken();
    const args = [];
    while ($currentToken !== 7340047 /* Token.CloseParen */) {
        args.push(parse(62 /* Precedence.Assign */, etNone));
        if (!consumeOpt(6291472 /* Token.Comma */)) {
            break;
        }
    }
    consume(7340047 /* Token.CloseParen */);
    $assignable = false;
    $optional = _optional;
    return args;
}
function parseKeyedExpression(result, optional) {
    const _optional = $optional;
    nextToken();
    result = new AccessKeyedExpression(result, parse(62 /* Precedence.Assign */, etNone), optional);
    consume(7340052 /* Token.CloseBracket */);
    $assignable = !_optional;
    $optional = _optional;
    return result;
}
function parseOptionalChainLHS(lhs) {
    $optional = true;
    $assignable = false;
    nextToken();
    if (($currentToken & 13312 /* Token.OptionalSuffix */) === 0) {
        throw unexpectedTokenInOptionalChain();
    }
    if ($currentToken & 12288 /* Token.IdentifierName */) {
        return parseMemberExpressionLHS(lhs, true);
    }
    if ($currentToken === 2688008 /* Token.OpenParen */) {
        if (lhs.$kind === ekAccessScope) {
            return new CallScopeExpression(lhs.name, parseArguments(), lhs.ancestor, true);
        }
        else if (lhs.$kind === ekAccessMember) {
            return new CallMemberExpression(lhs.object, lhs.name, parseArguments(), lhs.optional, true);
        }
        else {
            return new CallFunctionExpression(lhs, parseArguments(), true);
        }
    }
    if ($currentToken === 2688019 /* Token.OpenBracket */) {
        return parseKeyedExpression(lhs, true);
    }
    throw invalidTaggedTemplateOnOptionalChain();
}
function parseMemberExpressionLHS(lhs, optional) {
    const rhs = $tokenValue;
    switch ($currentToken) {
        case 2162701 /* Token.QuestionDot */: {
            $optional = true;
            $assignable = false;
            const indexSave = $index;
            const startIndexSave = $startIndex;
            const currentTokenSave = $currentToken;
            const currentCharSave = $currentChar;
            const tokenValueSave = $tokenValue;
            const assignableSave = $assignable;
            const optionalSave = $optional;
            nextToken();
            if (($currentToken & 13312 /* Token.OptionalSuffix */) === 0) {
                throw unexpectedTokenInOptionalChain();
            }
            if ($currentToken === 2688008 /* Token.OpenParen */) {
                return new CallMemberExpression(lhs, rhs, parseArguments(), optional, true);
            }
            $index = indexSave;
            $startIndex = startIndexSave;
            $currentToken = currentTokenSave;
            $currentChar = currentCharSave;
            $tokenValue = tokenValueSave;
            $assignable = assignableSave;
            $optional = optionalSave;
            return new AccessMemberExpression(lhs, rhs, optional);
        }
        case 2688008 /* Token.OpenParen */: {
            $assignable = false;
            return new CallMemberExpression(lhs, rhs, parseArguments(), optional, false);
        }
        default: {
            $assignable = !$optional;
            nextToken();
            return new AccessMemberExpression(lhs, rhs, optional);
        }
    }
}

/**
 * https://tc39.es/ecma262/#prod-CoverParenthesizedExpressionAndArrowParameterList
 * CoverParenthesizedExpressionAndArrowParameterList :
 * ( Expression )
 * ( )
 * ( BindingIdentifier )
 * ( Expression , BindingIdentifier )
 */
function parseCoverParenthesizedExpressionAndArrowParameterList(expressionType) {
    nextToken();
    const indexSave = $index;
    const startIndexSave = $startIndex;
    const currentTokenSave = $currentToken;
    const currentCharSave = $currentChar;
    const tokenValueSave = $tokenValue;
    const optionalSave = $optional;
    const arrowParams = [];
    let paramsState = 1 /* ArrowFnParams.Valid */;
    let isParamList = false;
    // eslint-disable-next-line no-constant-condition
    loop: while (true) {
        if ($currentToken === 12 /* Token.DotDotDot */) {
            nextToken();
            if ($currentToken !== 4096 /* Token.Identifier */) {
                throw expectedIdentifier();
            }
            arrowParams.push(new BindingIdentifier($tokenValue));
            nextToken();
            if ($currentToken === 6291472 /* Token.Comma */) {
                throw restParamsMustBeLastParam();
            }
            if ($currentToken !== 7340047 /* Token.CloseParen */) {
                throw invalidSpreadOp();
            }
            nextToken();
            if ($currentToken !== 51 /* Token.Arrow */) {
                throw invalidSpreadOp();
            }
            nextToken();
            const _optional = $optional;
            const _scopeDepth = $scopeDepth;
            ++$scopeDepth;
            const body = parse(62 /* Precedence.Assign */, etNone);
            $optional = _optional;
            $scopeDepth = _scopeDepth;
            $assignable = false;
            return new ArrowFunction(arrowParams, body, true);
        }
        switch ($currentToken) {
            case 4096 /* Token.Identifier */:
                arrowParams.push(new BindingIdentifier($tokenValue));
                nextToken();
                break;
            case 7340047 /* Token.CloseParen */:
                // ()     - only valid if followed directly by an arrow
                nextToken();
                break loop;
            /* eslint-disable */
            case 524297 /* Token.OpenBrace */:
            // ({     - may be a valid parenthesized expression
            case 2688019 /* Token.OpenBracket */:
                // ([     - may be a valid parenthesized expression
                nextToken();
                paramsState = 4 /* ArrowFnParams.Destructuring */;
                break;
            /* eslint-enable */
            case 6291472 /* Token.Comma */:
                // (,     - never valid
                // (a,,   - never valid
                paramsState = 2 /* ArrowFnParams.Invalid */;
                isParamList = true;
                break loop;
            case 2688008 /* Token.OpenParen */:
                // ((     - may be a valid nested parenthesized expression or arrow fn
                // (a,(   - never valid
                paramsState = 2 /* ArrowFnParams.Invalid */;
                break loop;
            default:
                nextToken();
                paramsState = 2 /* ArrowFnParams.Invalid */;
                break;
        }
        switch ($currentToken) {
            case 6291472 /* Token.Comma */:
                nextToken();
                isParamList = true;
                if (paramsState === 1 /* ArrowFnParams.Valid */) {
                    break;
                }
                // ([something invalid],   - treat as arrow fn / invalid arrow params
                break loop;
            case 7340047 /* Token.CloseParen */:
                nextToken();
                break loop;
            case 4194350 /* Token.Equals */:
                // (a=a     - may be a valid parenthesized expression
                if (paramsState === 1 /* ArrowFnParams.Valid */) {
                    paramsState = 3 /* ArrowFnParams.Default */;
                }
                break loop;
            case 51 /* Token.Arrow */:
                // (a,a=>  - never valid
                if (isParamList) {
                    throw invalidArrowParameterList();
                }
                // (a=>    - may be a valid parenthesized expression with nested arrow fn
                nextToken();
                paramsState = 2 /* ArrowFnParams.Invalid */;
                break loop;
            default:
                if (paramsState === 1 /* ArrowFnParams.Valid */) {
                    paramsState = 2 /* ArrowFnParams.Invalid */;
                }
                break loop;
        }
    }
    if ($currentToken === 51 /* Token.Arrow */) {
        if (paramsState === 1 /* ArrowFnParams.Valid */) {
            nextToken();
            if ($currentToken === 524297 /* Token.OpenBrace */) {
                throw functionBodyInArrowFn();
            }
            const _optional = $optional;
            const _scopeDepth = $scopeDepth;
            ++$scopeDepth;
            const body = parse(62 /* Precedence.Assign */, etNone);
            $optional = _optional;
            $scopeDepth = _scopeDepth;
            $assignable = false;
            return new ArrowFunction(arrowParams, body);
        }
        throw invalidArrowParameterList();
    }
    else if (paramsState === 1 /* ArrowFnParams.Valid */ && arrowParams.length === 0) {
        // ()    - never valid as a standalone expression
        throw missingExpectedToken(51 /* Token.Arrow */);
    }
    if (isParamList) {
        // ([something invalid],   - treat as arrow fn / invalid arrow params
        switch (paramsState) {
            case 2 /* ArrowFnParams.Invalid */:
                throw invalidArrowParameterList();
            case 3 /* ArrowFnParams.Default */:
                throw defaultParamsInArrowFn();
            case 4 /* ArrowFnParams.Destructuring */:
                throw destructuringParamsInArrowFn();
        }
    }
    $index = indexSave;
    $startIndex = startIndexSave;
    $currentToken = currentTokenSave;
    $currentChar = currentCharSave;
    $tokenValue = tokenValueSave;
    $optional = optionalSave;
    const _optional = $optional;
    const expr = parse(62 /* Precedence.Assign */, expressionType);
    $optional = _optional;
    consume(7340047 /* Token.CloseParen */);
    if ($currentToken === 51 /* Token.Arrow */) {
        // we only get here if there was a valid parenthesized expression which was not valid as arrow fn params
        switch (paramsState) {
            case 2 /* ArrowFnParams.Invalid */:
                throw invalidArrowParameterList();
            case 3 /* ArrowFnParams.Default */:
                throw defaultParamsInArrowFn();
            case 4 /* ArrowFnParams.Destructuring */:
                throw destructuringParamsInArrowFn();
        }
    }
    return expr;
}
/**
 * parseArrayLiteralExpression
 * https://tc39.github.io/ecma262/#prod-ArrayLiteralExpression
 *
 * ArrayLiteralExpression :
 * [ Elision(opt) ]
 * [ ElementList ]
 * [ ElementList, Elision(opt) ]
 *
 * ElementList :
 * Elision(opt) AssignmentExpression
 * ElementList, Elision(opt) AssignmentExpression
 *
 * Elision :
 * ,
 * Elision ,
 */
function parseArrayLiteralExpression(expressionType) {
    const _optional = $optional;
    nextToken();
    const elements = new Array();
    while ($currentToken !== 7340052 /* Token.CloseBracket */) {
        if (consumeOpt(6291472 /* Token.Comma */)) {
            elements.push($undefined);
            if ($currentToken === 7340052 /* Token.CloseBracket */) {
                break;
            }
        }
        else {
            elements.push(parse(62 /* Precedence.Assign */, expressionType === etIsIterator ? etNone : expressionType));
            if (consumeOpt(6291472 /* Token.Comma */)) {
                if ($currentToken === 7340052 /* Token.CloseBracket */) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    $optional = _optional;
    consume(7340052 /* Token.CloseBracket */);
    if (expressionType === etIsIterator) {
        return new ArrayBindingPattern(elements);
    }
    else {
        $assignable = false;
        return new ArrayLiteralExpression(elements);
    }
}
const allowedForExprKinds = [ekArrayBindingPattern, ekObjectBindingPattern, ekBindingIdentifier, ekArrayDestructuring, ekObjectDestructuring];
function parseForOfStatement(result) {
    if (!allowedForExprKinds.includes(result.$kind)) {
        throw invalidLHSBindingIdentifierInForOf(result.$kind);
    }
    if ($currentToken !== 4204594 /* Token.OfKeyword */) {
        throw invalidLHSBindingIdentifierInForOf(result.$kind);
    }
    nextToken();
    const declaration = result;
    const statement = parse(61 /* Precedence.Variadic */, etIsChainable);
    return new ForOfStatement(declaration, statement, $semicolonIndex);
}
/**
 * parseObjectLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * ObjectLiteralExpression :
 * { }
 * { PropertyDefinitionList }
 *
 * PropertyDefinitionList :
 * PropertyDefinition
 * PropertyDefinitionList, PropertyDefinition
 *
 * PropertyDefinition :
 * IdentifierName
 * PropertyName : AssignmentExpression
 *
 * PropertyName :
 * IdentifierName
 * StringLiteral
 * NumericLiteral
 */
function parseObjectLiteralExpression(expressionType) {
    const _optional = $optional;
    const keys = new Array();
    const values = new Array();
    nextToken();
    while ($currentToken !== 7340046 /* Token.CloseBrace */) {
        keys.push($tokenValue);
        // Literal = mandatory colon
        if ($currentToken & 49152 /* Token.StringOrNumericLiteral */) {
            nextToken();
            consume(6291477 /* Token.Colon */);
            values.push(parse(62 /* Precedence.Assign */, expressionType === etIsIterator ? etNone : expressionType));
        }
        else if ($currentToken & 12288 /* Token.IdentifierName */) {
            // IdentifierName = optional colon
            const currentChar = $currentChar;
            const currentToken = $currentToken;
            const index = $index;
            nextToken();
            if (consumeOpt(6291477 /* Token.Colon */)) {
                values.push(parse(62 /* Precedence.Assign */, expressionType === etIsIterator ? etNone : expressionType));
            }
            else {
                // Shorthand
                $currentChar = currentChar;
                $currentToken = currentToken;
                $index = index;
                values.push(parse(515 /* Precedence.Primary */, expressionType === etIsIterator ? etNone : expressionType));
            }
        }
        else {
            throw invalidPropDefInObjLiteral();
        }
        if ($currentToken !== 7340046 /* Token.CloseBrace */) {
            consume(6291472 /* Token.Comma */);
        }
    }
    $optional = _optional;
    consume(7340046 /* Token.CloseBrace */);
    if (expressionType === etIsIterator) {
        return new ObjectBindingPattern(keys, values);
    }
    else {
        $assignable = false;
        return new ObjectLiteralExpression(keys, values);
    }
}
function parseInterpolation() {
    const parts = [];
    const expressions = [];
    const length = $length;
    let result = '';
    while ($index < length) {
        switch ($currentChar) {
            case 36 /* Char.Dollar */:
                if ($charCodeAt($index + 1) === 123 /* Char.OpenBrace */) {
                    parts.push(result);
                    result = '';
                    $index += 2;
                    $currentChar = $charCodeAt($index);
                    nextToken();
                    const expression = parse(61 /* Precedence.Variadic */, etInterpolation);
                    expressions.push(expression);
                    continue;
                }
                else {
                    result += '$';
                }
                break;
            case 92 /* Char.Backslash */:
                result += stringFromCharCode(unescapeCode(nextChar()));
                break;
            default:
                result += stringFromCharCode($currentChar);
        }
        nextChar();
    }
    if (expressions.length) {
        parts.push(result);
        return new Interpolation(parts, expressions);
    }
    return null;
}
/**
 * parseTemplateLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * TemplateExpression :
 * NoSubstitutionTemplate
 * TemplateHead
 *
 * NoSubstitutionTemplate :
 * ` TemplateCharacters(opt) `
 *
 * TemplateHead :
 * ` TemplateCharacters(opt) ${
 *
 * TemplateSubstitutionTail :
 * TemplateMiddle
 * TemplateTail
 *
 * TemplateMiddle :
 * } TemplateCharacters(opt) ${
 *
 * TemplateTail :
 * } TemplateCharacters(opt) `
 *
 * TemplateCharacters :
 * TemplateCharacter TemplateCharacters(opt)
 *
 * TemplateCharacter :
 * $ [lookahead ≠ {]
 * \ EscapeSequence
 * SourceCharacter (but not one of ` or \ or $)
 */
function parseTemplate(expressionType, result, tagged) {
    const _optional = $optional;
    const cooked = [$tokenValue];
    // TODO: properly implement raw parts / decide whether we want this
    consume(2163761 /* Token.TemplateContinuation */);
    const expressions = [parse(62 /* Precedence.Assign */, expressionType)];
    while (($currentToken = scanTemplateTail()) !== 2163760 /* Token.TemplateTail */) {
        cooked.push($tokenValue);
        consume(2163761 /* Token.TemplateContinuation */);
        expressions.push(parse(62 /* Precedence.Assign */, expressionType));
    }
    cooked.push($tokenValue);
    $assignable = false;
    $optional = _optional;
    if (tagged) {
        nextToken();
        return new TaggedTemplateExpression(cooked, cooked, result, expressions);
    }
    else {
        nextToken();
        return new TemplateExpression(cooked, expressions);
    }
}
function createTemplateTail(result) {
    $assignable = false;
    const strings = [$tokenValue];
    nextToken();
    return new TaggedTemplateExpression(strings, strings, result);
}
function nextToken() {
    while ($index < $length) {
        $startIndex = $index;
        if (($currentToken = (CharScanners[$currentChar]())) != null) { // a null token means the character must be skipped
            return;
        }
    }
    $currentToken = 6291456 /* Token.EOF */;
}
function nextChar() {
    return $currentChar = $charCodeAt(++$index);
}
function scanIdentifier() {
    // run to the next non-idPart
    while (IdParts[nextChar()])
        ;
    const token = KeywordLookup[$tokenValue = $tokenRaw()];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return token === undefined ? 4096 /* Token.Identifier */ : token;
}
function scanNumber(isFloat) {
    let char = $currentChar;
    if (isFloat === false) {
        do {
            char = nextChar();
        } while (char <= 57 /* Char.Nine */ && char >= 48 /* Char.Zero */);
        if (char !== 46 /* Char.Dot */) {
            $tokenValue = parseInt($tokenRaw(), 10);
            return 32768 /* Token.NumericLiteral */;
        }
        // past this point it's always a float
        char = nextChar();
        if ($index >= $length) {
            // unless the number ends with a dot - that behaves a little different in native ES expressions
            // but in our AST that behavior has no effect because numbers are always stored in variables
            $tokenValue = parseInt($tokenRaw().slice(0, -1), 10);
            return 32768 /* Token.NumericLiteral */;
        }
    }
    if (char <= 57 /* Char.Nine */ && char >= 48 /* Char.Zero */) {
        do {
            char = nextChar();
        } while (char <= 57 /* Char.Nine */ && char >= 48 /* Char.Zero */);
    }
    else {
        $currentChar = $charCodeAt(--$index);
    }
    $tokenValue = parseFloat($tokenRaw());
    return 32768 /* Token.NumericLiteral */;
}
function scanString() {
    const quote = $currentChar;
    nextChar(); // Skip initial quote.
    let unescaped = 0;
    const buffer = new Array();
    let marker = $index;
    while ($currentChar !== quote) {
        if ($currentChar === 92 /* Char.Backslash */) {
            buffer.push($input.slice(marker, $index));
            nextChar();
            unescaped = unescapeCode($currentChar);
            nextChar();
            buffer.push(stringFromCharCode(unescaped));
            marker = $index;
        }
        else if ($index >= $length) {
            throw unterminatedStringLiteral();
        }
        else {
            nextChar();
        }
    }
    const last = $input.slice(marker, $index);
    nextChar(); // Skip terminating quote.
    // Compute the unescaped string value.
    buffer.push(last);
    const unescapedStr = buffer.join('');
    $tokenValue = unescapedStr;
    return 16384 /* Token.StringLiteral */;
}
function scanTemplate() {
    let tail = true;
    let result = '';
    while (nextChar() !== 96 /* Char.Backtick */) {
        if ($currentChar === 36 /* Char.Dollar */) {
            if (($index + 1) < $length && $charCodeAt($index + 1) === 123 /* Char.OpenBrace */) {
                $index++;
                tail = false;
                break;
            }
            else {
                result += '$';
            }
        }
        else if ($currentChar === 92 /* Char.Backslash */) {
            result += stringFromCharCode(unescapeCode(nextChar()));
        }
        else {
            if ($index >= $length) {
                throw unterminatedTemplateLiteral();
            }
            result += stringFromCharCode($currentChar);
        }
    }
    nextChar();
    $tokenValue = result;
    if (tail) {
        return 2163760 /* Token.TemplateTail */;
    }
    return 2163761 /* Token.TemplateContinuation */;
}
const scanTemplateTail = () => {
    if ($index >= $length) {
        throw unterminatedTemplateLiteral();
    }
    $index--;
    return scanTemplate();
};
const consumeOpt = (token) => {
    if ($currentToken === token) {
        nextToken();
        return true;
    }
    return false;
};
const consume = (token) => {
    if ($currentToken === token) {
        nextToken();
    }
    else {
        throw missingExpectedToken(token);
    }
};
// #region errors
const invalidStartOfExpression = () => createMappedError(151 /* ErrorNames.parse_invalid_start */, $input);
const invalidSpreadOp = () => createMappedError(152 /* ErrorNames.parse_no_spread */, $input);
const expectedIdentifier = () => createMappedError(153 /* ErrorNames.parse_expected_identifier */, $input);
const invalidMemberExpression = () => createMappedError(154 /* ErrorNames.parse_invalid_member_expr */, $input);
const unexpectedEndOfExpression = () => createMappedError(155 /* ErrorNames.parse_unexpected_end */, $input);
const unconsumedToken = () => createMappedError(156 /* ErrorNames.parse_unconsumed_token */, $tokenRaw(), $index, $input);
const invalidEmptyExpression = () => createMappedError(157 /* ErrorNames.parse_invalid_empty */);
const lhsNotAssignable = () => createMappedError(158 /* ErrorNames.parse_left_hand_side_not_assignable */, $input);
const expectedValueConverterIdentifier = () => createMappedError(159 /* ErrorNames.parse_expected_converter_identifier */, $input);
const expectedBindingBehaviorIdentifier = () => createMappedError(160 /* ErrorNames.parse_expected_behavior_identifier */, $input);
const unexpectedOfKeyword = () => createMappedError(161 /* ErrorNames.parse_unexpected_keyword_of */, $input);
const unexpectedImportKeyword = () => createMappedError(162 /* ErrorNames.parse_unexpected_keyword_import */, $input);
const invalidLHSBindingIdentifierInForOf = (kind) => createMappedError(163 /* ErrorNames.parse_invalid_identifier_in_forof */, $input, kind);
const invalidPropDefInObjLiteral = () => createMappedError(164 /* ErrorNames.parse_invalid_identifier_object_literal_key */, $input);
const unterminatedStringLiteral = () => createMappedError(165 /* ErrorNames.parse_unterminated_string */, $input);
const unterminatedTemplateLiteral = () => createMappedError(166 /* ErrorNames.parse_unterminated_template_string */, $input);
const missingExpectedToken = (token) => createMappedError(167 /* ErrorNames.parse_missing_expected_token */, TokenValues[token & 63 /* Token.Type */], $input)
    ;
const unexpectedTokenInDestructuring = () => createMappedError(170 /* ErrorNames.parse_unexpected_token_destructuring */, $tokenRaw(), $index, $input)
    ;
const unexpectedTokenInOptionalChain = () => createMappedError(171 /* ErrorNames.parse_unexpected_token_optional_chain */, $tokenRaw(), $index - 1, $input)
    ;
const invalidTaggedTemplateOnOptionalChain = () => createMappedError(172 /* ErrorNames.parse_invalid_tag_in_optional_chain */, $input);
const invalidArrowParameterList = () => createMappedError(173 /* ErrorNames.parse_invalid_arrow_params */, $input);
const defaultParamsInArrowFn = () => createMappedError(174 /* ErrorNames.parse_no_arrow_param_default_value */, $input);
const destructuringParamsInArrowFn = () => createMappedError(175 /* ErrorNames.parse_no_arrow_param_destructuring */, $input);
const restParamsMustBeLastParam = () => createMappedError(176 /* ErrorNames.parse_rest_must_be_last */, $input);
const functionBodyInArrowFn = () => createMappedError(178 /* ErrorNames.parse_no_arrow_fn_body */, $input);
const unexpectedDoubleDot = () => createMappedError(179 /* ErrorNames.parse_unexpected_double_dot */, $index - 1, $input)
    ;
// #endregion
/**
 * Array for mapping tokens to token values. The indices of the values
 * correspond to the token bits 0-38.
 * For this to work properly, the values in the array must be kept in
 * the same order as the token bits.
 * Usage: TokenValues[token & Token.Type]
 */
const TokenValues = [
    $false, $true, $null, $undefined, 'this', '$this', null /* '$host' */, '$parent',
    '(', '{', '.', '..', '...', '?.', '}', ')', ',', '[', ']', ':', ';', '?', '\'', '"',
    '&', '|', '??', '||', '&&', '==', '!=', '===', '!==', '<', '>',
    '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
    2163760 /* Token.TemplateTail */, 2163761 /* Token.TemplateContinuation */,
    'of', '=>', '+=', '-=', '*=', '/=', '++', '--'
];
const KeywordLookup = /*@__PURE__*/ Object.assign(createLookup(), {
    true: 8193 /* Token.TrueKeyword */,
    null: 8194 /* Token.NullKeyword */,
    false: 8192 /* Token.FalseKeyword */,
    undefined: 8195 /* Token.UndefinedKeyword */,
    this: 12293 /* Token.AccessBoundary */,
    $this: 12292 /* Token.ThisScope */,
    $parent: 12295 /* Token.ParentScope */,
    in: 6562213 /* Token.InKeyword */,
    instanceof: 6562214 /* Token.InstanceOfKeyword */,
    typeof: 139305 /* Token.TypeofKeyword */,
    void: 139306 /* Token.VoidKeyword */,
    of: 4204594 /* Token.OfKeyword */,
});
// Character scanning function lookup
const { CharScanners, IdParts, } = /*@__PURE__*/ (() => {
    const unexpectedCharacter = () => {
        throw createMappedError(168 /* ErrorNames.parse_unexpected_character */, $input);
    };
    unexpectedCharacter.notMapped = true;
    /**
     * Ranges of code points in pairs of 2 (eg 0x41-0x5B, 0x61-0x7B, ...) where the second value is not inclusive (5-7 means 5 and 6)
     * Single values are denoted by the second value being a 0
     *
     * Copied from output generated with "node build/generate-unicode.js"
     *
     * See also: https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
     */
    const codes = {
        /* [$0-9A-Za_a-z] */
        AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
        IdStart: /* IdentifierStart */ [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
        Digit: /* DecimalNumber */ [0x30, 0x3A],
        Skip: /* Skippable */ [0, 0x21, 0x7F, 0xA1]
    };
    /**
     * Decompress the ranges into an array of numbers so that the char code
     * can be used as an index to the lookup
     */
    const decompress = (lookup, $set, compressed, value) => {
        const rangeCount = compressed.length;
        for (let i = 0; i < rangeCount; i += 2) {
            const start = compressed[i];
            let end = compressed[i + 1];
            end = end > 0 ? end : start + 1;
            if (lookup) {
                lookup.fill(value, start, end);
            }
            if ($set) {
                for (let ch = start; ch < end; ch++) {
                    $set.add(ch);
                }
            }
        }
    };
    // // ASCII IdentifierPart lookup
    // const AsciiIdParts = ((AsciiIdParts) => {
    //   decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
    //   return AsciiIdParts;
    // })(new Set<number>());
    // IdentifierPart lookup
    const IdParts = /*@__PURE__*/ ((IdParts) => {
        decompress(IdParts, null, codes.IdStart, 1);
        decompress(IdParts, null, codes.Digit, 1);
        return IdParts;
    })(new Uint8Array(0xFFFF));
    // CharFuncLookup functions
    const returnToken = (token) => () => {
        nextChar();
        return token;
    };
    const CharScanners = new Array(0xFFFF);
    CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
    decompress(CharScanners, null, codes.Skip, () => {
        nextChar();
        return null;
    });
    decompress(CharScanners, null, codes.IdStart, scanIdentifier);
    decompress(CharScanners, null, codes.Digit, () => scanNumber(false));
    CharScanners[34 /* Char.DoubleQuote */] =
        CharScanners[39 /* Char.SingleQuote */] = () => {
            return scanString();
        };
    CharScanners[96 /* Char.Backtick */] = () => {
        return scanTemplate();
    };
    // !, !=, !==
    CharScanners[33 /* Char.Exclamation */] = () => {
        if (nextChar() !== 61 /* Char.Equals */) {
            return 131119 /* Token.Exclamation */;
        }
        if (nextChar() !== 61 /* Char.Equals */) {
            return 6553950 /* Token.ExclamationEquals */;
        }
        nextChar();
        return 6553952 /* Token.ExclamationEqualsEquals */;
    };
    // =, ==, ===, =>
    CharScanners[61 /* Char.Equals */] = () => {
        if (nextChar() === 62 /* Char.GreaterThan */) {
            nextChar();
            return 51 /* Token.Arrow */;
        }
        if ($currentChar !== 61 /* Char.Equals */) {
            return 4194350 /* Token.Equals */;
        }
        if (nextChar() !== 61 /* Char.Equals */) {
            return 6553949 /* Token.EqualsEquals */;
        }
        nextChar();
        return 6553951 /* Token.EqualsEqualsEquals */;
    };
    // &, &&
    CharScanners[38 /* Char.Ampersand */] = () => {
        if (nextChar() !== 38 /* Char.Ampersand */) {
            return 6291480 /* Token.Ampersand */;
        }
        nextChar();
        return 6553884 /* Token.AmpersandAmpersand */;
    };
    // |, ||
    CharScanners[124 /* Char.Bar */] = () => {
        if (nextChar() !== 124 /* Char.Bar */) {
            return 6291481 /* Token.Bar */;
        }
        nextChar();
        return 6553819 /* Token.BarBar */;
    };
    // ?, ??, ?.
    CharScanners[63 /* Char.Question */] = () => {
        if (nextChar() === 46 /* Char.Dot */) {
            const peek = $charCodeAt($index + 1);
            if (peek <= 48 /* Char.Zero */ || peek >= 57 /* Char.Nine */) {
                nextChar();
                return 2162701 /* Token.QuestionDot */;
            }
            return 6291479 /* Token.Question */;
        }
        if ($currentChar !== 63 /* Char.Question */) {
            return 6291479 /* Token.Question */;
        }
        nextChar();
        return 6553754 /* Token.QuestionQuestion */;
    };
    // ., ...
    CharScanners[46 /* Char.Dot */] = () => {
        if (nextChar() <= 57 /* Char.Nine */ && $currentChar >= 48 /* Char.Zero */) {
            return scanNumber(true);
        }
        if ($currentChar === 46 /* Char.Dot */) {
            if (nextChar() !== 46 /* Char.Dot */) {
                return 11 /* Token.DotDot */;
            }
            nextChar();
            return 12 /* Token.DotDotDot */;
        }
        return 65546 /* Token.Dot */;
    };
    // <, <=
    CharScanners[60 /* Char.LessThan */] = () => {
        if (nextChar() !== 61 /* Char.Equals */) {
            return 6554017 /* Token.LessThan */;
        }
        nextChar();
        return 6554019 /* Token.LessThanEquals */;
    };
    // >, >=
    CharScanners[62 /* Char.GreaterThan */] = () => {
        if (nextChar() !== 61 /* Char.Equals */) {
            return 6554018 /* Token.GreaterThan */;
        }
        nextChar();
        return 6554020 /* Token.GreaterThanEquals */;
    };
    CharScanners[37 /* Char.Percent */] = returnToken(6554156 /* Token.Percent */);
    CharScanners[40 /* Char.OpenParen */] = returnToken(2688008 /* Token.OpenParen */);
    CharScanners[41 /* Char.CloseParen */] = returnToken(7340047 /* Token.CloseParen */);
    // *, *=
    CharScanners[42 /* Char.Asterisk */] = () => {
        if (nextChar() !== 61 /* Char.Equals */) {
            return 6554155 /* Token.Asterisk */;
        }
        nextChar();
        return 4194358 /* Token.AsteriskEquals */;
    };
    // +, +=, ++
    CharScanners[43 /* Char.Plus */] = () => {
        if (nextChar() === 43 /* Char.Plus */) {
            nextChar();
            return 2228280 /* Token.PlusPlus */;
        }
        if ($currentChar !== 61 /* Char.Equals */) {
            return 2490855 /* Token.Plus */;
        }
        nextChar();
        return 4194356 /* Token.PlusEquals */;
    };
    CharScanners[44 /* Char.Comma */] = returnToken(6291472 /* Token.Comma */);
    // -, -=, --
    CharScanners[45 /* Char.Minus */] = () => {
        if (nextChar() === 45 /* Char.Minus */) {
            nextChar();
            return 2228281 /* Token.MinusMinus */;
        }
        if ($currentChar !== 61 /* Char.Equals */) {
            return 2490856 /* Token.Minus */;
        }
        nextChar();
        return 4194357 /* Token.MinusEquals */;
    };
    // /, /=
    CharScanners[47 /* Char.Slash */] = () => {
        if (nextChar() !== 61 /* Char.Equals */) {
            return 6554157 /* Token.Slash */;
        }
        nextChar();
        return 4194359 /* Token.SlashEquals */;
    };
    CharScanners[58 /* Char.Colon */] = returnToken(6291477 /* Token.Colon */);
    CharScanners[59 /* Char.Semicolon */] = returnToken(6291478 /* Token.Semicolon */);
    CharScanners[91 /* Char.OpenBracket */] = returnToken(2688019 /* Token.OpenBracket */);
    CharScanners[93 /* Char.CloseBracket */] = returnToken(7340052 /* Token.CloseBracket */);
    CharScanners[123 /* Char.OpenBrace */] = returnToken(524297 /* Token.OpenBrace */);
    CharScanners[125 /* Char.CloseBrace */] = returnToken(7340046 /* Token.CloseBrace */);
    return { CharScanners, IdParts };
})();

export { AccessBoundaryExpression, AccessGlobalExpression, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, ArrayBindingPattern, ArrayLiteralExpression, ArrowFunction, AssignExpression, BinaryExpression, BindingBehaviorExpression, BindingIdentifier, CallFunctionExpression, CallGlobalExpression, CallMemberExpression, CallScopeExpression, ConditionalExpression, CustomExpression, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, ExpressionParser, ForOfStatement, IExpressionParser, Interpolation, ObjectBindingPattern, ObjectLiteralExpression, PrimitiveLiteralExpression, TaggedTemplateExpression, TemplateExpression, UnaryExpression, Unparser, ValueConverterExpression, astVisit, parseExpression };
//# sourceMappingURL=index.dev.mjs.map
