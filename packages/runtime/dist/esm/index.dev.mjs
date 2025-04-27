import { DestructuringAssignmentSingleExpression, IExpressionParser } from '@aurelia/expression-parser';
import { DI, isObjectOrFunction, isFunction, isArray, isArrayIndex, isSet, isMap, areEqual, Registration, resolve, IPlatform, ILogger, isObject, createLookup, emptyObject } from '@aurelia/kernel';
import { Metadata } from '@aurelia/metadata';

/**
 * A shortcut to Object.prototype.hasOwnProperty
 * Needs to do explicit .call
 *
 * @internal
 */
const hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * Reflect does not throw on invalid property def
 *
 * @internal
 */
const rtDef = Reflect.defineProperty;
/** @internal */
function rtDefineHiddenProp(obj, key, value) {
    rtDef(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value
    });
    return value;
}
/** @internal */
function ensureProto(proto, key, defaultValue) {
    if (!(key in proto)) {
        rtDefineHiddenProp(proto, key, defaultValue);
    }
}
/** @internal */ const rtObjectAssign = Object.assign;
/** @internal */ const rtObjectFreeze = Object.freeze;
// this is used inside template literal, since TS errs without String(...value)
/** @internal */ const rtSafeString = String;
/** @internal */ const rtCreateInterface = DI.createInterface;
/** @internal */ const rtGetMetadata = Metadata.get;
/** @internal */ const rtDefineMetadata = Metadata.define;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => new Error(`AUR${rtSafeString(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
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
    [113 /* ErrorNames.ast_increment_infinite_loop */]: `Ast eval error: infinite loop detected. Increment operators should only be used in event handlers.`,
    [114 /* ErrorNames.ast_nullish_member_access */]: `Ast eval error: cannot access property "{{0}}" of {{1}}.`,
    [115 /* ErrorNames.ast_nullish_keyed_access */]: `Ast eval error: cannot access key "{{0}}" of {{1}}.`,
    [116 /* ErrorNames.ast_nullish_assignment */]: `Ast eval error: cannot assign value to property "{{0}}" of null/undefined.`,
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
    [199 /* ErrorNames.observing_null_undefined */]: `Trying to observe property {{0}} on null/undefined`,
    [203 /* ErrorNames.null_scope */]: `Trying to retrieve a property or build a scope from a null/undefined scope`,
    [204 /* ErrorNames.create_scope_with_null_context */]: 'Trying to create a scope with null/undefined binding context',
    [206 /* ErrorNames.switch_on_null_connectable */]: `Trying to switch to a null/undefined connectable`,
    [207 /* ErrorNames.switch_active_connectable */]: `Trying to enter an active connectable`,
    [208 /* ErrorNames.switch_off_null_connectable */]: `Trying to pop a null/undefined connectable`,
    [209 /* ErrorNames.switch_off_inactive_connectable */]: `Trying to exit an inactive connectable`,
    [210 /* ErrorNames.non_recognisable_collection_type */]: `Unrecognised collection type {{0:toString}}.`,
    [217 /* ErrorNames.dirty_check_no_handler */]: 'There is no registration for IDirtyChecker interface. If you want to use your own dirty checker, make sure you register it.',
    [218 /* ErrorNames.dirty_check_not_allowed */]: `Dirty checked is not permitted in this application. Property key {{0}} is being dirty checked.`,
    [219 /* ErrorNames.dirty_check_setter_not_allowed */]: `Trying to set value for property {{0}} in dirty checker`,
    [220 /* ErrorNames.assign_readonly_size */]: `Map/Set "size" is a readonly property`,
    [221 /* ErrorNames.assign_readonly_readonly_property_from_computed */]: `Trying to assign value to readonly property "{{0}}" through computed observer.`,
    [224 /* ErrorNames.invalid_observable_decorator_usage */]: `Invalid @observable decorator usage, cannot determine property name`,
    [225 /* ErrorNames.stopping_a_stopped_effect */]: `Trying to stop an effect that has already been stopped`,
    [226 /* ErrorNames.effect_maximum_recursion_reached */]: `Maximum number of recursive effect run reached. Consider handle effect dependencies differently.`,
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'typeof':
                        value = typeof value;
                        break;
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
                            value = rtSafeString(value[method.slice(1)]);
                        }
                        else {
                            value = rtSafeString(value);
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

class Scope {
    constructor(parent, bindingContext, overrideContext, isBoundary) {
        this.parent = parent;
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
        this.isBoundary = isBoundary;
    }
    static getContext(scope, name, ancestor) {
        if (scope == null) {
            throw createMappedError(203 /* ErrorNames.null_scope */);
        }
        let overrideContext = scope.overrideContext;
        let currentScope = scope;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                ancestor--;
                currentScope = currentScope.parent;
                if (currentScope == null) {
                    return void 0;
                }
            }
            overrideContext = currentScope.overrideContext;
            // Here we are giving benefit of doubt considering the dev has used one or more `$parent` token, and thus should know what s/he is targeting.
            return name in overrideContext ? overrideContext : currentScope.bindingContext;
        }
        // walk the scope hierarchy until
        // the first scope that has the property in its contexts
        // or
        // the closet boundary scope
        // -------------------------
        // this behavior is different with v1
        // where it would fallback to the immediate scope instead of the root one
        // TODO: maybe avoid immediate loop and return earlier
        // -------------------------
        while (currentScope != null
            && !currentScope.isBoundary
            && !(name in currentScope.overrideContext)
            && !(name in currentScope.bindingContext)) {
            currentScope = currentScope.parent;
        }
        if (currentScope == null) {
            return scope.bindingContext;
        }
        overrideContext = currentScope.overrideContext;
        return name in overrideContext ? overrideContext : currentScope.bindingContext;
    }
    static create(bc, oc, isBoundary) {
        if (bc == null) {
            throw createMappedError(204 /* ErrorNames.create_scope_with_null_context */);
        }
        return new Scope(null, bc, oc ?? new OverrideContext(), isBoundary ?? false);
    }
    static fromParent(ps, bc, oc = new OverrideContext()) {
        if (ps == null) {
            throw createMappedError(203 /* ErrorNames.null_scope */);
        }
        return new Scope(ps, bc, oc, false);
    }
}
/**
 * A class for creating context in synthetic scope to keep the number of classes of context in scope small
 */
class BindingContext {
    constructor(key, value) {
        if (key !== void 0) {
            this[key] = value;
        }
    }
}
class OverrideContext {
}

/* eslint-disable no-fallthrough */
const { astAssign, astEvaluate, astBind, astUnbind } = /*@__PURE__*/ (() => {
    const ekAccessThis = 'AccessThis';
    const ekAccessBoundary = 'AccessBoundary';
    const ekAccessGlobal = 'AccessGlobal';
    const ekAccessScope = 'AccessScope';
    const ekArrayLiteral = 'ArrayLiteral';
    const ekObjectLiteral = 'ObjectLiteral';
    const ekPrimitiveLiteral = 'PrimitiveLiteral';
    const ekNew = 'New';
    const ekTemplate = 'Template';
    const ekUnary = 'Unary';
    const ekCallScope = 'CallScope';
    const ekCallMember = 'CallMember';
    const ekCallFunction = 'CallFunction';
    const ekCallGlobal = 'CallGlobal';
    const ekAccessMember = 'AccessMember';
    const ekAccessKeyed = 'AccessKeyed';
    const ekTaggedTemplate = 'TaggedTemplate';
    const ekBinary = 'Binary';
    const ekConditional = 'Conditional';
    const ekAssign = 'Assign';
    const ekArrowFunction = 'ArrowFunction';
    const ekValueConverter = 'ValueConverter';
    const ekBindingBehavior = 'BindingBehavior';
    const ekArrayBindingPattern = 'ArrayBindingPattern';
    const ekObjectBindingPattern = 'ObjectBindingPattern';
    const ekBindingIdentifier = 'BindingIdentifier';
    const ekForOfStatement = 'ForOfStatement';
    const ekInterpolation = 'Interpolation';
    const ekArrayDestructuring = 'ArrayDestructuring';
    const ekObjectDestructuring = 'ObjectDestructuring';
    const ekDestructuringAssignmentLeaf = 'DestructuringAssignmentLeaf';
    const ekCustom = 'Custom';
    const getContext = Scope.getContext;
    // eslint-disable-next-line max-lines-per-function
    function astEvaluate(ast, s, e, c) {
        switch (ast.$kind) {
            case ekAccessThis: {
                let oc = s.overrideContext;
                let currentScope = s;
                let i = ast.ancestor;
                while (i-- && oc) {
                    currentScope = currentScope.parent;
                    oc = currentScope?.overrideContext ?? null;
                }
                return i < 1 && currentScope ? currentScope.bindingContext : void 0;
            }
            case ekAccessBoundary: {
                let currentScope = s;
                while (currentScope != null
                    && !currentScope.isBoundary) {
                    currentScope = currentScope.parent;
                }
                return currentScope ? currentScope.bindingContext : void 0;
            }
            case ekAccessScope: {
                const obj = getContext(s, ast.name, ast.ancestor);
                if (c !== null) {
                    c.observe(obj, ast.name);
                }
                const evaluatedValue = obj[ast.name];
                if (evaluatedValue == null) {
                    if (ast.name === '$host') {
                        throw createMappedError(105 /* ErrorNames.ast_$host_not_found */);
                    }
                    return evaluatedValue;
                }
                return e?.boundFn && isFunction(evaluatedValue)
                    ? evaluatedValue.bind(obj)
                    : evaluatedValue;
            }
            case ekAccessGlobal:
                return globalThis[ast.name];
            case ekCallGlobal: {
                const func = globalThis[ast.name];
                if (isFunction(func)) {
                    return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
                }
                /* istanbul ignore next */
                if (!e?.strict && func == null) {
                    return void 0;
                }
                throw createMappedError(107 /* ErrorNames.ast_not_a_function */);
            }
            case ekArrayLiteral:
                return ast.elements.map(expr => astEvaluate(expr, s, e, c));
            case ekObjectLiteral: {
                const instance = {};
                for (let i = 0; i < ast.keys.length; ++i) {
                    instance[ast.keys[i]] = astEvaluate(ast.values[i], s, e, c);
                }
                return instance;
            }
            case ekPrimitiveLiteral:
                return ast.value;
            case ekNew: {
                const func = astEvaluate(ast.func, s, e, c);
                if (isFunction(func)) {
                    return new func(...ast.args.map(a => astEvaluate(a, s, e, c)));
                }
                throw createMappedError(107 /* ErrorNames.ast_not_a_function */);
            }
            case ekTemplate: {
                let result = ast.cooked[0];
                for (let i = 0; i < ast.expressions.length; ++i) {
                    result += rtSafeString(astEvaluate(ast.expressions[i], s, e, c));
                    result += ast.cooked[i + 1];
                }
                return result;
            }
            case ekUnary: {
                const value = astEvaluate(ast.expression, s, e, c);
                switch (ast.operation) {
                    case 'void':
                        return void value;
                    case 'typeof':
                        return typeof value;
                    case '!':
                        return !value;
                    case '-':
                        return -value;
                    case '+':
                        return +value;
                    case '--':
                        if (c != null)
                            throw createMappedError(113 /* ErrorNames.ast_increment_infinite_loop */);
                        return astAssign(ast.expression, s, e, c, value - 1) + ast.pos;
                    case '++':
                        if (c != null)
                            throw createMappedError(113 /* ErrorNames.ast_increment_infinite_loop */);
                        return astAssign(ast.expression, s, e, c, value + 1) - ast.pos;
                    default:
                        throw createMappedError(109 /* ErrorNames.ast_unknown_unary_operator */, ast.operation);
                }
            }
            case ekCallScope: {
                const context = getContext(s, ast.name, ast.ancestor);
                if (context == null) {
                    if (e?.strict) {
                        throw createMappedError(114 /* ErrorNames.ast_nullish_member_access */, ast.name, context);
                    }
                    return void 0;
                }
                const fn = context[ast.name];
                if (isFunction(fn)) {
                    return fn.apply(context, ast.args.map(a => astEvaluate(a, s, e, c)));
                }
                if (fn == null) {
                    if (e?.strict && !ast.optional) {
                        throw createMappedError(111 /* ErrorNames.ast_name_is_not_a_function */, ast.name);
                    }
                    return void 0;
                }
                throw createMappedError(111 /* ErrorNames.ast_name_is_not_a_function */, ast.name);
            }
            case ekCallMember: {
                const instance = astEvaluate(ast.object, s, e, c);
                if (instance == null) {
                    if (e?.strict && !ast.optionalMember) {
                        throw createMappedError(114 /* ErrorNames.ast_nullish_member_access */, ast.name, instance);
                    }
                }
                const fn = instance?.[ast.name];
                if (fn == null) {
                    if (!ast.optionalCall && e?.strict) {
                        throw createMappedError(111 /* ErrorNames.ast_name_is_not_a_function */, ast.name);
                    }
                    return void 0;
                }
                if (!isFunction(fn)) {
                    throw createMappedError(111 /* ErrorNames.ast_name_is_not_a_function */, ast.name);
                }
                const ret = fn.apply(instance, ast.args.map(a => astEvaluate(a, s, e, c)));
                if (isArray(instance) && autoObserveArrayMethods.includes(ast.name)) {
                    c?.observeCollection(instance);
                }
                return ret;
            }
            case ekCallFunction: {
                const func = astEvaluate(ast.func, s, e, c);
                if (isFunction(func)) {
                    return func(...ast.args.map(a => astEvaluate(a, s, e, c)));
                }
                if (func == null) {
                    if (!ast.optional && e?.strict) {
                        throw createMappedError(107 /* ErrorNames.ast_not_a_function */);
                    }
                    return void 0;
                }
                throw createMappedError(107 /* ErrorNames.ast_not_a_function */);
            }
            case ekArrowFunction: {
                const func = (...args) => {
                    const params = ast.args;
                    const rest = ast.rest;
                    const lastIdx = params.length - 1;
                    const context = params.reduce((map, param, i) => {
                        if (rest && i === lastIdx) {
                            map[param.name] = args.slice(i);
                        }
                        else {
                            map[param.name] = args[i];
                        }
                        return map;
                    }, {});
                    const functionScope = Scope.fromParent(s, context);
                    return astEvaluate(ast.body, functionScope, e, c);
                };
                return func;
            }
            case ekAccessMember: {
                const instance = astEvaluate(ast.object, s, e, c);
                if (instance == null) {
                    if (!ast.optional && e?.strict) {
                        throw createMappedError(114 /* ErrorNames.ast_nullish_member_access */, ast.name, instance);
                    }
                    return void 0;
                }
                if (c !== null && !ast.accessGlobal) {
                    c.observe(instance, ast.name);
                }
                const ret = instance[ast.name];
                return e?.boundFn && isFunction(ret)
                    // event listener wants the returned function to be bound to the instance
                    ? ret.bind(instance)
                    : ret;
            }
            case ekAccessKeyed: {
                const instance = astEvaluate(ast.object, s, e, c);
                const key = astEvaluate(ast.key, s, e, c);
                if (instance == null) {
                    if (!ast.optional && e?.strict) {
                        throw createMappedError(115 /* ErrorNames.ast_nullish_keyed_access */, key, instance);
                    }
                    return void 0;
                }
                if (c !== null && !ast.accessGlobal) {
                    c.observe(instance, key);
                }
                return instance[key];
            }
            case ekTaggedTemplate: {
                const results = ast.expressions.map(expr => astEvaluate(expr, s, e, c));
                const func = astEvaluate(ast.func, s, e, c);
                if (!isFunction(func)) {
                    throw createMappedError(110 /* ErrorNames.ast_tagged_not_a_function */);
                }
                return func(ast.cooked, ...results);
            }
            case ekBinary: {
                const left = ast.left;
                const right = ast.right;
                switch (ast.operation) {
                    case '&&':
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        return astEvaluate(left, s, e, c) && astEvaluate(right, s, e, c);
                    case '||':
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        return astEvaluate(left, s, e, c) || astEvaluate(right, s, e, c);
                    case '??':
                        return astEvaluate(left, s, e, c) ?? astEvaluate(right, s, e, c);
                    case '==':
                        // eslint-disable-next-line eqeqeq
                        return astEvaluate(left, s, e, c) == astEvaluate(right, s, e, c);
                    case '===':
                        return astEvaluate(left, s, e, c) === astEvaluate(right, s, e, c);
                    case '!=':
                        // eslint-disable-next-line eqeqeq
                        return astEvaluate(left, s, e, c) != astEvaluate(right, s, e, c);
                    case '!==':
                        return astEvaluate(left, s, e, c) !== astEvaluate(right, s, e, c);
                    case 'instanceof': {
                        const $right = astEvaluate(right, s, e, c);
                        if (isFunction($right)) {
                            return astEvaluate(left, s, e, c) instanceof $right;
                        }
                        return false;
                    }
                    case 'in': {
                        const $right = astEvaluate(right, s, e, c);
                        if (isObjectOrFunction($right)) {
                            return astEvaluate(left, s, e, c) in $right;
                        }
                        return false;
                    }
                    case '+':
                        return astEvaluate(left, s, e, c) + astEvaluate(right, s, e, c);
                    case '-':
                        return astEvaluate(left, s, e, c) - astEvaluate(right, s, e, c);
                    case '*':
                        return astEvaluate(left, s, e, c) * astEvaluate(right, s, e, c);
                    case '/':
                        return astEvaluate(left, s, e, c) / astEvaluate(right, s, e, c);
                    case '%':
                        return astEvaluate(left, s, e, c) % astEvaluate(right, s, e, c);
                    case '**':
                        return astEvaluate(left, s, e, c) ** astEvaluate(right, s, e, c);
                    case '<':
                        return astEvaluate(left, s, e, c) < astEvaluate(right, s, e, c);
                    case '>':
                        return astEvaluate(left, s, e, c) > astEvaluate(right, s, e, c);
                    case '<=':
                        return astEvaluate(left, s, e, c) <= astEvaluate(right, s, e, c);
                    case '>=':
                        return astEvaluate(left, s, e, c) >= astEvaluate(right, s, e, c);
                    default:
                        throw createMappedError(108 /* ErrorNames.ast_unknown_binary_operator */, ast.operation);
                }
            }
            case ekConditional:
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return astEvaluate(ast.condition, s, e, c) ? astEvaluate(ast.yes, s, e, c) : astEvaluate(ast.no, s, e, c);
            case ekAssign: {
                let value = astEvaluate(ast.value, s, e, c);
                if (ast.op !== '=') {
                    if (c != null) {
                        throw createMappedError(113 /* ErrorNames.ast_increment_infinite_loop */);
                    }
                    const target = astEvaluate(ast.target, s, e, c);
                    switch (ast.op) {
                        case '/=':
                            value = target / value;
                            break;
                        case '*=':
                            value = target * value;
                            break;
                        case '+=':
                            value = target + value;
                            break;
                        case '-=':
                            value = target - value;
                            break;
                        default:
                            throw createMappedError(108 /* ErrorNames.ast_unknown_binary_operator */, ast.op);
                    }
                }
                return astAssign(ast.target, s, e, c, value);
            }
            case ekValueConverter: {
                return e?.useConverter?.(ast.name, 'toView', astEvaluate(ast.expression, s, e, c), ast.args.map(a => astEvaluate(a, s, e, c)));
            }
            case ekBindingBehavior:
                return astEvaluate(ast.expression, s, e, c);
            case ekBindingIdentifier:
                return ast.name;
            case ekForOfStatement:
                return astEvaluate(ast.iterable, s, e, c);
            case ekInterpolation:
                if (ast.isMulti) {
                    let result = ast.parts[0];
                    let i = 0;
                    for (; i < ast.expressions.length; ++i) {
                        result += rtSafeString(astEvaluate(ast.expressions[i], s, e, c));
                        result += ast.parts[i + 1];
                    }
                    return result;
                }
                else {
                    return `${ast.parts[0]}${astEvaluate(ast.firstExpression, s, e, c)}${ast.parts[1]}`;
                }
            case ekDestructuringAssignmentLeaf:
                return astEvaluate(ast.target, s, e, c);
            case ekArrayDestructuring: {
                return ast.list.map(x => astEvaluate(x, s, e, c));
            }
            // TODO: this should come after batch
            // as a destructuring expression like [x, y] = value
            //
            // should only trigger change only once:
            // batch(() => {
            //   object.x = value[0]
            //   object.y = value[1]
            // })
            //
            // instead of twice:
            // object.x = value[0]
            // object.y = value[1]
            case ekArrayBindingPattern:
            // TODO
            // similar to array binding ast, this should only come after batch
            // for a single notification per destructing,
            // regardless number of property assignments on the scope binding context
            case ekObjectBindingPattern:
            case ekObjectDestructuring:
            default:
                return void 0;
            case ekCustom:
                return ast.evaluate(s, e, c);
        }
    }
    function astAssign(ast, s, e, c, val) {
        switch (ast.$kind) {
            case ekAccessScope: {
                if (ast.name === '$host') {
                    throw createMappedError(106 /* ErrorNames.ast_no_assign_$host */);
                }
                const obj = getContext(s, ast.name, ast.ancestor);
                return obj[ast.name] = val;
            }
            case ekAccessMember: {
                const obj = astEvaluate(ast.object, s, e, c);
                if (obj == null) {
                    if (e?.strict) {
                        // if ast optional and the optional assignment proposal goes ahead
                        // we can allow this to be a no-op instead of throwing (check via ast.optional)
                        // https://github.com/tc39/proposal-optional-chaining-assignment
                        throw createMappedError(116 /* ErrorNames.ast_nullish_assignment */, ast.name);
                    }
                    // creating an object and assign it to the owning property of the ast
                    // this is a good enough behavior, and it works well in v1
                    astAssign(ast.object, s, e, c, { [ast.name]: val });
                }
                else if (isObjectOrFunction(obj)) {
                    if (ast.name === 'length' && isArray(obj) && !isNaN(val)) {
                        obj.splice(val);
                    }
                    else {
                        obj[ast.name] = val;
                    }
                }
                else ;
                return val;
            }
            case ekAccessKeyed: {
                const instance = astEvaluate(ast.object, s, e, c);
                const key = astEvaluate(ast.key, s, e, c);
                if (instance == null) {
                    if (e?.strict) {
                        // if ast optional and the optional assignment proposal goes ahead
                        // we can allow this to be a no-op instead of throwing (check via ast.optional)
                        // https://github.com/tc39/proposal-optional-chaining-assignment
                        throw createMappedError(116 /* ErrorNames.ast_nullish_assignment */, key);
                    }
                    // creating an object and assign it to the owning property of the ast
                    // this is a good enough behavior, and it works well in v1
                    astAssign(ast.object, s, e, c, { [key]: val });
                    return val;
                }
                if (isArray(instance)) {
                    if (key === 'length' && !isNaN(val)) {
                        instance.splice(val);
                        return val;
                    }
                    if (isArrayIndex(key)) {
                        instance.splice(key, 1, val);
                        return val;
                    }
                }
                return instance[key] = val;
            }
            case ekAssign:
                astAssign(ast.value, s, e, c, val);
                return astAssign(ast.target, s, e, c, val);
            case ekValueConverter: {
                val = e?.useConverter?.(ast.name, 'fromView', val, ast.args.map(a => astEvaluate(a, s, e, c)));
                return astAssign(ast.expression, s, e, c, val);
            }
            case ekBindingBehavior:
                return astAssign(ast.expression, s, e, c, val);
            case ekArrayDestructuring:
            case ekObjectDestructuring: {
                const list = ast.list;
                const len = list.length;
                let i;
                let item;
                for (i = 0; i < len; i++) {
                    item = list[i];
                    switch (item.$kind) {
                        case ekDestructuringAssignmentLeaf:
                            astAssign(item, s, e, c, val);
                            break;
                        case ekArrayDestructuring:
                        case ekObjectDestructuring: {
                            if (typeof val !== 'object' || val === null) {
                                throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                            }
                            let source = astEvaluate(item.source, Scope.create(val), e, null);
                            if (source === void 0 && item.initializer) {
                                source = astEvaluate(item.initializer, s, e, null);
                            }
                            astAssign(item, s, e, c, source);
                            break;
                        }
                    }
                }
                break;
            }
            case ekDestructuringAssignmentLeaf: {
                if (ast instanceof DestructuringAssignmentSingleExpression) {
                    if (val == null) {
                        return;
                    }
                    if (typeof val !== 'object') {
                        throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                    }
                    let source = astEvaluate(ast.source, Scope.create(val), e, c);
                    if (source === void 0 && ast.initializer) {
                        source = astEvaluate(ast.initializer, s, e, c);
                    }
                    astAssign(ast.target, s, e, c, source);
                }
                else {
                    if (val == null) {
                        return;
                    }
                    if (typeof val !== 'object') {
                        throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                    }
                    const indexOrProperties = ast.indexOrProperties;
                    let restValue;
                    if (isArrayIndex(indexOrProperties)) {
                        if (!Array.isArray(val)) {
                            throw createMappedError(112 /* ErrorNames.ast_destruct_null */);
                        }
                        restValue = val.slice(indexOrProperties);
                    }
                    else {
                        restValue = Object
                            .entries(val)
                            .reduce((acc, [k, v]) => {
                            if (!indexOrProperties.includes(k)) {
                                acc[k] = v;
                            }
                            return acc;
                            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        }, {});
                    }
                    astAssign(ast.target, s, e, c, restValue);
                }
                break;
            }
            case ekCustom:
                return ast.assign(s, e, val);
            default:
                return void 0;
        }
    }
    function astBind(ast, s, b) {
        switch (ast.$kind) {
            case ekBindingBehavior: {
                b.bindBehavior?.(ast.name, s, ast.args.map(a => astEvaluate(a, s, b, null)));
                astBind(ast.expression, s, b);
                break;
            }
            case ekValueConverter: {
                b.bindConverter?.(ast.name);
                astBind(ast.expression, s, b);
                break;
            }
            case ekForOfStatement: {
                astBind(ast.iterable, s, b);
                break;
            }
            case ekCustom: {
                ast.bind?.(s, b);
            }
        }
    }
    function astUnbind(ast, s, b) {
        switch (ast.$kind) {
            case ekBindingBehavior: {
                b.unbindBehavior?.(ast.name, s);
                astUnbind(ast.expression, s, b);
                break;
            }
            case ekValueConverter: {
                b.unbindConverter?.(ast.name);
                astUnbind(ast.expression, s, b);
                break;
            }
            case ekForOfStatement: {
                astUnbind(ast.iterable, s, b);
                break;
            }
            case ekCustom: {
                ast.unbind?.(s, b);
            }
        }
    }
    const autoObserveArrayMethods = 'at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort'.split(' ');
    // sort,      // bad supported, self mutation + unclear dependency
    // push,      // not supported, self mutation + unclear dependency
    // pop,       // not supported, self mutation + unclear dependency
    // shift,     // not supported, self mutation + unclear dependency
    // splice,    // not supported, self mutation + unclear dependency
    // unshift,   // not supported, self mutation + unclear dependency
    // reverse,   // not supported, self mutation + unclear dependency
    // keys,    // not meaningful in template
    // values,  // not meaningful in template
    // entries, // not meaningful in template
    return {
        astEvaluate,
        astAssign,
        astBind,
        astUnbind,
    };
})();

/**
 * For Aurelia packages internal use only, do not use this in application code.
 *
 * Add ast evaluator mixin with throw implementation for all methods.
 */
const mixinNoopAstEvaluator = (() => (target) => {
    const proto = target.prototype;
    ['bindBehavior', 'unbindBehavior', 'bindConverter', 'unbindConverter', 'useConverter'].forEach(name => {
        rtDefineHiddenProp(proto, name, () => { throw createMappedError(99 /* ErrorNames.method_not_implemented */, name); });
    });
})();

const ICoercionConfiguration = /*@__PURE__*/ DI.createInterface('ICoercionConfiguration');
/** @internal */ const atNone = 0b0_000_000;
/** @internal */ const atObserver = 0b0_000_001;
/** @internal */ const atNode = 0b0_000_010;
/** @internal */ const atLayout = 0b0_000_100;
const AccessorType = /*@__PURE__*/ rtObjectFreeze({
    None: atNone,
    Observer: atObserver,
    Node: atNode,
    // misc characteristic of accessors/observers when update
    //
    // by default, everything is synchronous
    // except changes that are supposed to cause reflow/heavy computation
    // an observer can use this flag to signal binding that don't carelessly tell it to update
    // queue it instead
    // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    // todo: https://csstriggers.com/
    Layout: atLayout,
});
function copyIndexMap(existing, deletedIndices, deletedItems) {
    const { length } = existing;
    const arr = Array(length);
    let i = 0;
    while (i < length) {
        arr[i] = existing[i];
        ++i;
    }
    if (deletedIndices !== void 0) {
        arr.deletedIndices = deletedIndices.slice(0);
    }
    else if (existing.deletedIndices !== void 0) {
        arr.deletedIndices = existing.deletedIndices.slice(0);
    }
    else {
        arr.deletedIndices = [];
    }
    if (deletedItems !== void 0) {
        arr.deletedItems = deletedItems.slice(0);
    }
    else if (existing.deletedItems !== void 0) {
        arr.deletedItems = existing.deletedItems.slice(0);
    }
    else {
        arr.deletedItems = [];
    }
    arr.isIndexMap = true;
    return arr;
}
function createIndexMap(length = 0) {
    const arr = Array(length);
    let i = 0;
    while (i < length) {
        arr[i] = i++;
    }
    arr.deletedIndices = [];
    arr.deletedItems = [];
    arr.isIndexMap = true;
    return arr;
}
function cloneIndexMap(indexMap) {
    const clone = indexMap.slice();
    clone.deletedIndices = indexMap.deletedIndices.slice();
    clone.deletedItems = indexMap.deletedItems.slice();
    clone.isIndexMap = true;
    return clone;
}
function isIndexMap(value) {
    return isArray(value) && value.isIndexMap === true;
}

let currBatch = new Map();
// eslint-disable-next-line import/no-mutable-exports
let batching = false;
function batch(fn) {
    const prevBatch = currBatch;
    const newBatch = currBatch = new Map();
    batching = true;
    try {
        fn();
    }
    finally {
        currBatch = null;
        batching = false;
        try {
            let pair;
            let subs;
            let batchRecord;
            let col;
            let indexMap;
            let hasChanges = false;
            let i;
            let ii;
            for (pair of newBatch) {
                subs = pair[0];
                batchRecord = pair[1];
                if (prevBatch?.has(subs)) {
                    prevBatch.set(subs, batchRecord);
                }
                if (batchRecord[0] === 1) {
                    subs.notify(batchRecord[1], batchRecord[2]);
                }
                else {
                    col = batchRecord[1];
                    indexMap = batchRecord[2];
                    hasChanges = false;
                    if (indexMap.deletedIndices.length > 0) {
                        hasChanges = true;
                    }
                    else {
                        for (i = 0, ii = indexMap.length; i < ii; ++i) {
                            if (indexMap[i] !== i) {
                                hasChanges = true;
                                break;
                            }
                        }
                    }
                    if (hasChanges) {
                        subs.notifyCollection(col, indexMap);
                    }
                }
            }
        }
        finally {
            currBatch = prevBatch;
        }
    }
}
function addCollectionBatch(subs, collection, indexMap) {
    if (!currBatch.has(subs)) {
        currBatch.set(subs, [2, collection, indexMap]);
    }
    else {
        currBatch.get(subs)[2] = indexMap;
    }
}
function addValueBatch(subs, newValue, oldValue) {
    const batchRecord = currBatch.get(subs);
    if (batchRecord === void 0) {
        currBatch.set(subs, [1, newValue, oldValue]);
    }
    else {
        batchRecord[1] = newValue;
        batchRecord[2] = oldValue;
    }
}

const subscriberCollection = /*@__PURE__*/ (() => {
    function subscriberCollection(target, context) {
        return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target);
    }
    function getSubscriberRecord() {
        return rtDefineHiddenProp(this, 'subs', new SubscriberRecord());
    }
    function addSubscriber(subscriber) {
        return this.subs.add(subscriber);
    }
    function removeSubscriber(subscriber) {
        return this.subs.remove(subscriber);
    }
    const decoratedTarget = new WeakSet();
    function subscriberCollectionDeco(target, context) {
        if (!decoratedTarget.has(target)) {
            decoratedTarget.add(target);
            const proto = target.prototype;
            // not configurable, as in devtool, the getter could be invoked on the prototype,
            // and become permanently broken
            rtDef(proto, 'subs', { get: getSubscriberRecord });
            ensureProto(proto, 'subscribe', addSubscriber);
            ensureProto(proto, 'unsubscribe', removeSubscriber);
        }
        return target;
    }
    class SubscriberRecord {
        constructor() {
            this.count = 0;
            /** @internal */
            this._subs = [];
            /** @internal */
            this._requestDirtySubs = [];
            /** @internal */
            this._hasDirtySubs = false;
        }
        add(subscriber) {
            if (this._subs.includes(subscriber)) {
                return false;
            }
            this._subs[this._subs.length] = subscriber;
            if ('handleDirty' in subscriber) {
                this._requestDirtySubs[this._requestDirtySubs.length] = subscriber;
                this._hasDirtySubs = true;
            }
            ++this.count;
            return true;
        }
        remove(subscriber) {
            let idx = this._subs.indexOf(subscriber);
            if (idx !== -1) {
                this._subs.splice(idx, 1);
                idx = this._requestDirtySubs.indexOf(subscriber);
                if (idx !== -1) {
                    this._requestDirtySubs.splice(idx, 1);
                    this._hasDirtySubs = this._requestDirtySubs.length > 0;
                }
                --this.count;
                return true;
            }
            return false;
        }
        notify(val, oldVal) {
            if (batching) {
                addValueBatch(this, val, oldVal);
                return;
            }
            /**
             * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
             * callSubscribers invocation, so we're caching them all before invoking any.
             * Subscribers added during this invocation are not invoked (and they shouldn't be).
             * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
             * however this is accounted for via $isBound and similar flags on the subscriber objects)
             */
            for (const sub of this._subs.slice(0)) {
                sub.handleChange(val, oldVal);
            }
        }
        notifyCollection(collection, indexMap) {
            const _subs = this._subs.slice(0);
            const len = _subs.length;
            let i = 0;
            for (; i < len; ++i) {
                _subs[i].handleCollectionChange(collection, indexMap);
            }
            return;
        }
        notifyDirty() {
            if (this._hasDirtySubs) {
                for (const dirtySub of this._requestDirtySubs.slice(0)) {
                    dirtySub.handleDirty();
                }
            }
        }
    }
    return subscriberCollection;
})();

class CollectionLengthObserver {
    constructor(owner) {
        this.owner = owner;
        this.type = atObserver;
        this._value = (this._obj = owner.collection).length;
    }
    getValue() {
        return this._obj.length;
    }
    setValue(newValue) {
        // if in the template, length is two-way bound directly
        // then there's a chance that the new value is invalid
        // add a guard so that we don't accidentally broadcast invalid values
        if (newValue !== this._value) {
            if (!Number.isNaN(newValue)) {
                this._obj.splice(newValue);
                this._value = this._obj.length;
                // todo: maybe use splice so that it'll notify everything properly
                // this._obj.length = newValue;
                // this.subs.notify(newValue, currentValue);
            }
            else {
                // eslint-disable-next-line no-console
                console.warn(`Invalid value "${newValue}" for array length`);
            }
        }
    }
    handleDirty() {
        if (this._value !== this._obj.length) {
            this.subs.notifyDirty();
        }
    }
    handleCollectionChange(_arr, _) {
        const oldValue = this._value;
        const value = this._obj.length;
        if ((this._value = value) !== oldValue) {
            this.subs.notifyDirty();
            this.subs.notify(this._value, oldValue);
        }
    }
}
(() => {
    implementLengthObserver(CollectionLengthObserver);
})();
class CollectionSizeObserver {
    constructor(owner) {
        this.owner = owner;
        this.type = atObserver;
        this._value = (this._obj = owner.collection).size;
    }
    getValue() {
        return this._obj.size;
    }
    setValue() {
        throw createMappedError(220 /* ErrorNames.assign_readonly_size */);
    }
    handleDirty() {
        if (this._value !== this._obj.size) {
            this.subs.notifyDirty();
        }
    }
    handleCollectionChange(_collection, _) {
        const oldValue = this._value;
        const value = this._obj.size;
        if ((this._value = value) !== oldValue) {
            this.subs.notify(this._value, oldValue);
        }
    }
}
(() => {
    implementLengthObserver(CollectionSizeObserver);
})();
function implementLengthObserver(klass) {
    const proto = klass.prototype;
    ensureProto(proto, 'subscribe', subscribe);
    ensureProto(proto, 'unsubscribe', unsubscribe);
    return subscriberCollection(klass, null);
}
function subscribe(subscriber) {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
        this.owner.subscribe(this);
    }
}
function unsubscribe(subscriber) {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
        this.owner.subscribe(this);
    }
}

const getArrayObserver = /*@__PURE__*/ (() => {
    // multiple applications of Aurelia wouldn't have different observers for the same Array object
    const lookupMetadataKey = Symbol.for('__au_arr_obs__');
    const observerLookup = (Array[lookupMetadataKey]
        ?? rtDefineHiddenProp(Array, lookupMetadataKey, new WeakMap()));
    // https://tc39.github.io/ecma262/#sec-sortcompare
    function sortCompare(x, y) {
        if (x === y) {
            return 0;
        }
        x = x === null ? 'null' : x.toString();
        y = y === null ? 'null' : y.toString();
        return x < y ? -1 : 1;
    }
    function preSortCompare(x, y) {
        if (x === void 0) {
            if (y === void 0) {
                return 0;
            }
            else {
                return 1;
            }
        }
        if (y === void 0) {
            return -1;
        }
        return 0;
    }
    function insertionSort(arr, indexMap, from, to, compareFn) {
        let velement, ielement, vtmp, itmp, order;
        let i, j;
        for (i = from + 1; i < to; i++) {
            velement = arr[i];
            ielement = indexMap[i];
            for (j = i - 1; j >= from; j--) {
                vtmp = arr[j];
                itmp = indexMap[j];
                order = compareFn(vtmp, velement);
                if (order > 0) {
                    arr[j + 1] = vtmp;
                    indexMap[j + 1] = itmp;
                }
                else {
                    break;
                }
            }
            arr[j + 1] = velement;
            indexMap[j + 1] = ielement;
        }
    }
    function quickSort(arr, indexMap, from, to, compareFn) {
        let thirdIndex = 0, i = 0;
        let v0, v1, v2;
        let i0, i1, i2;
        let c01, c02, c12;
        let vtmp, itmp;
        let vpivot, ipivot, lowEnd, highStart;
        let velement, ielement, order, vtopElement;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (to - from <= 10) {
                insertionSort(arr, indexMap, from, to, compareFn);
                return;
            }
            thirdIndex = from + ((to - from) >> 1);
            v0 = arr[from];
            i0 = indexMap[from];
            v1 = arr[to - 1];
            i1 = indexMap[to - 1];
            v2 = arr[thirdIndex];
            i2 = indexMap[thirdIndex];
            c01 = compareFn(v0, v1);
            if (c01 > 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v1;
                i0 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            c02 = compareFn(v0, v2);
            if (c02 >= 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v2;
                i0 = i2;
                v2 = v1;
                i2 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            else {
                c12 = compareFn(v1, v2);
                if (c12 > 0) {
                    vtmp = v1;
                    itmp = i1;
                    v1 = v2;
                    i1 = i2;
                    v2 = vtmp;
                    i2 = itmp;
                }
            }
            arr[from] = v0;
            indexMap[from] = i0;
            arr[to - 1] = v2;
            indexMap[to - 1] = i2;
            vpivot = v1;
            ipivot = i1;
            lowEnd = from + 1;
            highStart = to - 1;
            arr[thirdIndex] = arr[lowEnd];
            indexMap[thirdIndex] = indexMap[lowEnd];
            arr[lowEnd] = vpivot;
            indexMap[lowEnd] = ipivot;
            partition: for (i = lowEnd + 1; i < highStart; i++) {
                velement = arr[i];
                ielement = indexMap[i];
                order = compareFn(velement, vpivot);
                if (order < 0) {
                    arr[i] = arr[lowEnd];
                    indexMap[i] = indexMap[lowEnd];
                    arr[lowEnd] = velement;
                    indexMap[lowEnd] = ielement;
                    lowEnd++;
                }
                else if (order > 0) {
                    do {
                        highStart--;
                        // eslint-disable-next-line eqeqeq
                        if (highStart == i) {
                            break partition;
                        }
                        vtopElement = arr[highStart];
                        order = compareFn(vtopElement, vpivot);
                    } while (order > 0);
                    arr[i] = arr[highStart];
                    indexMap[i] = indexMap[highStart];
                    arr[highStart] = velement;
                    indexMap[highStart] = ielement;
                    if (order < 0) {
                        velement = arr[i];
                        ielement = indexMap[i];
                        arr[i] = arr[lowEnd];
                        indexMap[i] = indexMap[lowEnd];
                        arr[lowEnd] = velement;
                        indexMap[lowEnd] = ielement;
                        lowEnd++;
                    }
                }
            }
            if (to - highStart < lowEnd - from) {
                quickSort(arr, indexMap, highStart, to, compareFn);
                to = lowEnd;
            }
            else {
                quickSort(arr, indexMap, from, lowEnd, compareFn);
                from = highStart;
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proto = Array.prototype;
    const methods = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'];
    let observe;
    // let native: undefined | Pick<typeof proto, typeof methods[number]>;
    function overrideArrayPrototypes() {
        const $push = proto.push;
        const $unshift = proto.unshift;
        const $pop = proto.pop;
        const $shift = proto.shift;
        const $splice = proto.splice;
        const $reverse = proto.reverse;
        const $sort = proto.sort;
        // native = { push: $push, unshift: $unshift, pop: $pop, shift: $shift, splice: $splice, reverse: $reverse, sort: $sort };
        observe = {
            // https://tc39.github.io/ecma262/#sec-array.prototype.push
            push: function (...args) {
                const o = observerLookup.get(this);
                if (o === void 0) {
                    return $push.apply(this, args);
                }
                const len = this.length;
                const argCount = args.length;
                if (argCount === 0) {
                    return len;
                }
                this.length = o.indexMap.length = len + argCount;
                let i = len;
                while (i < this.length) {
                    this[i] = args[i - len];
                    o.indexMap[i] = -2;
                    i++;
                }
                o.notify();
                return this.length;
            },
            // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
            unshift: function (...args) {
                const o = observerLookup.get(this);
                if (o === void 0) {
                    return $unshift.apply(this, args);
                }
                const argCount = args.length;
                const inserts = new Array(argCount);
                let i = 0;
                while (i < argCount) {
                    inserts[i++] = -2;
                }
                $unshift.apply(o.indexMap, inserts);
                const len = $unshift.apply(this, args);
                o.notify();
                return len;
            },
            // https://tc39.github.io/ecma262/#sec-array.prototype.pop
            pop: function () {
                const o = observerLookup.get(this);
                if (o === void 0) {
                    return $pop.call(this);
                }
                const indexMap = o.indexMap;
                const element = $pop.call(this);
                // only mark indices as deleted if they actually existed in the original array
                const index = indexMap.length - 1;
                if (indexMap[index] > -1) {
                    indexMap.deletedIndices.push(indexMap[index]);
                    indexMap.deletedItems.push(element);
                }
                $pop.call(indexMap);
                o.notify();
                return element;
            },
            // https://tc39.github.io/ecma262/#sec-array.prototype.shift
            shift: function () {
                const o = observerLookup.get(this);
                if (o === void 0) {
                    return $shift.call(this);
                }
                const indexMap = o.indexMap;
                const element = $shift.call(this);
                // only mark indices as deleted if they actually existed in the original array
                if (indexMap[0] > -1) {
                    indexMap.deletedIndices.push(indexMap[0]);
                    indexMap.deletedItems.push(element);
                }
                $shift.call(indexMap);
                o.notify();
                return element;
            },
            // https://tc39.github.io/ecma262/#sec-array.prototype.splice
            splice: function (...args) {
                const start = args[0];
                const deleteCount = args[1];
                const o = observerLookup.get(this);
                if (o === void 0) {
                    return $splice.apply(this, args);
                }
                const len = this.length;
                const relativeStart = start | 0;
                const actualStart = relativeStart < 0 ? Math.max((len + relativeStart), 0) : Math.min(relativeStart, len);
                const indexMap = o.indexMap;
                const argCount = args.length;
                const actualDeleteCount = argCount === 0 ? 0 : argCount === 1 ? len - actualStart : deleteCount;
                let i = actualStart;
                if (actualDeleteCount > 0) {
                    const to = i + actualDeleteCount;
                    while (i < to) {
                        // only mark indices as deleted if they actually existed in the original array
                        if (indexMap[i] > -1) {
                            indexMap.deletedIndices.push(indexMap[i]);
                            indexMap.deletedItems.push(this[i]);
                        }
                        i++;
                    }
                }
                i = 0;
                if (argCount > 2) {
                    const itemCount = argCount - 2;
                    const inserts = new Array(itemCount);
                    while (i < itemCount) {
                        inserts[i++] = -2;
                    }
                    $splice.call(indexMap, start, deleteCount, ...inserts);
                }
                else {
                    $splice.apply(indexMap, args);
                }
                const deleted = $splice.apply(this, args);
                // only notify when there's deletion, or addition
                if (actualDeleteCount > 0 || i > 0) {
                    o.notify();
                }
                return deleted;
            },
            // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
            reverse: function () {
                const o = observerLookup.get(this);
                if (o === void 0) {
                    $reverse.call(this);
                    return this;
                }
                const len = this.length;
                const middle = (len / 2) | 0;
                let lower = 0;
                while (lower !== middle) {
                    const upper = len - lower - 1;
                    const lowerValue = this[lower];
                    const lowerIndex = o.indexMap[lower];
                    const upperValue = this[upper];
                    const upperIndex = o.indexMap[upper];
                    this[lower] = upperValue;
                    o.indexMap[lower] = upperIndex;
                    this[upper] = lowerValue;
                    o.indexMap[upper] = lowerIndex;
                    lower++;
                }
                o.notify();
                return this;
            },
            // https://tc39.github.io/ecma262/#sec-array.prototype.sort
            // https://github.com/v8/v8/blob/master/src/js/array.js
            sort: function (compareFn) {
                const o = observerLookup.get(this);
                if (o === void 0) {
                    $sort.call(this, compareFn);
                    return this;
                }
                let len = this.length;
                if (len < 2) {
                    return this;
                }
                quickSort(this, o.indexMap, 0, len, preSortCompare);
                let i = 0;
                while (i < len) {
                    if (this[i] === void 0) {
                        break;
                    }
                    i++;
                }
                if (compareFn === void 0 || !isFunction(compareFn) /* spec says throw a TypeError, should we do that too? */) {
                    compareFn = sortCompare;
                }
                quickSort(this, o.indexMap, 0, i, compareFn);
                // todo(fred): it shouldn't notify if the sort produce a stable array:
                //             where every item has the same index before/after
                //             though this is inefficient we loop a few times like this
                let shouldNotify = false;
                for (i = 0, len = o.indexMap.length; len > i; ++i) {
                    if (o.indexMap[i] !== i) {
                        shouldNotify = true;
                        break;
                    }
                }
                if (shouldNotify || batching) {
                    o.notify();
                }
                return this;
            }
        };
        for (const method of methods) {
            rtDef(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
        }
    }
    let enableArrayObservationCalled = false;
    const observationEnabledKey = '__au_arr_on__';
    function enableArrayObservation() {
        if (observe === undefined) {
            overrideArrayPrototypes();
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!(rtGetMetadata(observationEnabledKey, Array) ?? false)) {
            rtDefineMetadata(true, Array, observationEnabledKey);
            for (const method of methods) {
                if (proto[method].observing !== true) {
                    rtDefineHiddenProp(proto, method, observe[method]);
                }
            }
        }
    }
    class ArrayObserverImpl {
        constructor(array) {
            this.type = atObserver;
            if (!enableArrayObservationCalled) {
                enableArrayObservationCalled = true;
                enableArrayObservation();
            }
            this.indexObservers = {};
            this.collection = array;
            this.indexMap = createIndexMap(array.length);
            this.lenObs = void 0;
            observerLookup.set(array, this);
        }
        notify() {
            const subs = this.subs;
            subs.notifyDirty();
            const indexMap = this.indexMap;
            if (batching) {
                addCollectionBatch(subs, this.collection, indexMap);
                return;
            }
            const arr = this.collection;
            const length = arr.length;
            this.indexMap = createIndexMap(length);
            subs.notifyCollection(arr, indexMap);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionLengthObserver(this);
        }
        getIndexObserver(index) {
            // It's unnecessary to destroy/recreate index observer all the time,
            // so just create once, and add/remove instead
            return this.indexObservers[index] ??= new ArrayIndexObserverImpl(this, index);
        }
    }
    (() => {
        subscriberCollection(ArrayObserverImpl, null);
    })();
    class ArrayIndexObserverImpl {
        constructor(owner, index) {
            this.owner = owner;
            this.index = index;
            this.doNotCache = true;
            this.value = this.getValue();
        }
        getValue() {
            return this.owner.collection[this.index];
        }
        setValue(newValue) {
            if (newValue === this.getValue()) {
                return;
            }
            const arrayObserver = this.owner;
            const index = this.index;
            const indexMap = arrayObserver.indexMap;
            if (indexMap[index] > -1) {
                indexMap.deletedIndices.push(indexMap[index]);
            }
            indexMap[index] = -2;
            // do not need to update current value here
            // as it will be updated inside handle collection change
            arrayObserver.collection[index] = newValue;
            arrayObserver.notify();
        }
        handleDirty() {
            if (this.value !== this.getValue()) {
                this.subs.notifyDirty();
            }
        }
        /**
         * From interface `ICollectionSubscriber`
         */
        handleCollectionChange(_arr, indexMap) {
            const index = this.index;
            const noChange = indexMap[index] === index;
            if (noChange) {
                return;
            }
            const prevValue = this.value;
            const currValue = this.value = this.getValue();
            if (prevValue !== currValue) {
                this.subs.notify(currValue, prevValue);
            }
        }
        subscribe(subscriber) {
            if (this.subs.add(subscriber) && this.subs.count === 1) {
                this.owner.subscribe(this);
            }
        }
        unsubscribe(subscriber) {
            if (this.subs.remove(subscriber) && this.subs.count === 0) {
                this.owner.unsubscribe(this);
            }
        }
    }
    (() => {
        subscriberCollection(ArrayIndexObserverImpl, null);
    })();
    return function getArrayObserver(array) {
        let observer = observerLookup.get(array);
        if (observer === void 0) {
            observerLookup.set(array, observer = new ArrayObserverImpl(array));
            enableArrayObservation();
        }
        return observer;
    };
})();

const getSetObserver = /*@__PURE__*/ (() => {
    // multiple applications of Aurelia wouldn't have different observers for the same Set object
    const lookupMetadataKey = Symbol.for('__au_set_obs__');
    const observerLookup = (Set[lookupMetadataKey]
        ?? rtDefineHiddenProp(Set, lookupMetadataKey, new WeakMap()));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { add: $add, clear: $clear, delete: $delete } = Set.prototype;
    const methods = ['add', 'clear', 'delete'];
    // note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, add/delete/clear are easy to reconstruct for the indexMap
    const observe = {
        // https://tc39.github.io/ecma262/#sec-set.prototype.add
        add: function (value) {
            const o = observerLookup.get(this);
            if (o === undefined) {
                $add.call(this, value);
                return this;
            }
            const oldSize = this.size;
            $add.call(this, value);
            const newSize = this.size;
            if (newSize === oldSize) {
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.clear
        clear: function () {
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $clear.call(this);
            }
            const size = this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                // deepscan-disable-next-line
                for (const key of this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedIndices.push(indexMap[i]);
                        indexMap.deletedItems.push(key);
                    }
                    i++;
                }
                $clear.call(this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-set.prototype.delete
        delete: function (value) {
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $delete.call(this, value);
            }
            const size = this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedIndices.push(indexMap[i]);
                        indexMap.deletedItems.push(entry);
                    }
                    indexMap.splice(i, 1);
                    const deleteResult = $delete.call(this, value);
                    if (deleteResult === true) {
                        o.notify();
                    }
                    return deleteResult;
                }
                i++;
            }
            return false;
        }
    };
    function enableSetObservation(set) {
        for (const method of methods) {
            rtDefineHiddenProp(set, method, observe[method]);
        }
    }
    class SetObserverImpl {
        constructor(observedSet) {
            this.type = atObserver;
            this.collection = observedSet;
            this.indexMap = createIndexMap(observedSet.size);
            this.lenObs = void 0;
        }
        notify() {
            const subs = this.subs;
            subs.notifyDirty();
            const indexMap = this.indexMap;
            if (batching) {
                addCollectionBatch(subs, this.collection, indexMap);
                return;
            }
            const set = this.collection;
            const size = set.size;
            this.indexMap = createIndexMap(size);
            subs.notifyCollection(set, indexMap);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionSizeObserver(this);
        }
    }
    subscriberCollection(SetObserverImpl, null);
    return function getSetObserver(set) {
        let observer = observerLookup.get(set);
        if (observer === void 0) {
            observerLookup.set(set, observer = new SetObserverImpl(set));
            enableSetObservation(set);
        }
        return observer;
    };
})();

const getMapObserver = /*@__PURE__*/ (() => {
    // multiple applications of Aurelia wouldn't have different observers for the same Map object
    const lookupMetadataKey = Symbol.for('__au_map_obs__');
    const observerLookup = (Map[lookupMetadataKey]
        ?? rtDefineHiddenProp(Map, lookupMetadataKey, new WeakMap()));
    const { set: $set, clear: $clear, delete: $delete } = Map.prototype;
    const methods = ['set', 'clear', 'delete'];
    // note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, map/delete/clear are easy to reconstruct for the indexMap
    const observe = {
        // https://tc39.github.io/ecma262/#sec-map.prototype.map
        set: function (key, value) {
            const o = observerLookup.get(this);
            if (o === undefined) {
                $set.call(this, key, value);
                return this;
            }
            const oldValue = this.get(key);
            const oldSize = this.size;
            $set.call(this, key, value);
            const newSize = this.size;
            if (newSize === oldSize) {
                let i = 0;
                for (const entry of this.entries()) {
                    if (entry[0] === key) {
                        if (entry[1] !== oldValue) {
                            o.indexMap.deletedIndices.push(o.indexMap[i]);
                            o.indexMap.deletedItems.push(entry);
                            o.indexMap[i] = -2;
                            o.notify();
                        }
                        return this;
                    }
                    i++;
                }
                return this;
            }
            o.indexMap[oldSize] = -2;
            o.notify();
            return this;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.clear
        clear: function () {
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $clear.call(this);
            }
            const size = this.size;
            if (size > 0) {
                const indexMap = o.indexMap;
                let i = 0;
                // deepscan-disable-next-line
                for (const key of this.keys()) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedIndices.push(indexMap[i]);
                        indexMap.deletedItems.push(key);
                    }
                    i++;
                }
                $clear.call(this);
                indexMap.length = 0;
                o.notify();
            }
            return undefined;
        },
        // https://tc39.github.io/ecma262/#sec-map.prototype.delete
        delete: function (value) {
            const o = observerLookup.get(this);
            if (o === undefined) {
                return $delete.call(this, value);
            }
            const size = this.size;
            if (size === 0) {
                return false;
            }
            let i = 0;
            const indexMap = o.indexMap;
            for (const entry of this.keys()) {
                if (entry === value) {
                    if (indexMap[i] > -1) {
                        indexMap.deletedIndices.push(indexMap[i]);
                        indexMap.deletedItems.push(entry);
                    }
                    indexMap.splice(i, 1);
                    const deleteResult = $delete.call(this, value);
                    if (deleteResult === true) {
                        o.notify();
                    }
                    return deleteResult;
                }
                ++i;
            }
            return false;
        }
    };
    function enableMapObservation(map) {
        for (const method of methods) {
            rtDefineHiddenProp(map, method, observe[method]);
        }
    }
    class MapObserverImpl {
        constructor(map) {
            this.type = atObserver;
            this.collection = map;
            this.indexMap = createIndexMap(map.size);
            this.lenObs = void 0;
        }
        notify() {
            const subs = this.subs;
            subs.notifyDirty();
            const indexMap = this.indexMap;
            if (batching) {
                addCollectionBatch(subs, this.collection, indexMap);
                return;
            }
            const map = this.collection;
            const size = map.size;
            this.indexMap = createIndexMap(size);
            subs.notifyCollection(map, indexMap);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionSizeObserver(this);
        }
    }
    subscriberCollection(MapObserverImpl, null);
    return function getMapObserver(map) {
        let observer = observerLookup.get(map);
        if (observer === void 0) {
            observerLookup.set(map, observer = new MapObserverImpl(map));
            enableMapObservation(map);
        }
        return observer;
    };
})();

const connectableDecorator = /*@__PURE__*/ (() => {
    class BindingObserverRecord {
        constructor(b) {
            this.version = 0;
            this.count = 0;
            // a map of the observers (subscribables) that the owning binding of this record
            // is currently subscribing to. The values are the version of the observers,
            // as the observers version may need to be changed during different evaluation
            /** @internal */
            this.o = new Map();
            this.b = b;
        }
        /**
         * Add, and subscribe to a given observer
         */
        add(observer) {
            if (!this.o.has(observer)) {
                observer.subscribe(this.b);
                ++this.count;
            }
            this.o.set(observer, this.version);
        }
        /**
         * Unsubscribe the observers that are not up to date with the record version
         */
        clear() {
            this.o.forEach(unsubscribeStale, this);
            this.count = this.o.size;
        }
        clearAll() {
            this.o.forEach(unsubscribeAll, this);
            this.o.clear();
            this.count = 0;
        }
    }
    function unsubscribeAll(version, subscribable) {
        subscribable.unsubscribe(this.b);
    }
    function unsubscribeStale(version, subscribable) {
        if (this.version !== version) {
            subscribable.unsubscribe(this.b);
            this.o.delete(subscribable);
        }
    }
    function getObserverRecord() {
        return rtDefineHiddenProp(this, 'obs', new BindingObserverRecord(this));
    }
    function observe(obj, key) {
        this.obs.add(this.oL.getObserver(obj, key));
    }
    function observeCollection(collection) {
        let observer;
        if (isArray(collection)) {
            observer = getArrayObserver(collection);
        }
        else if (isSet(collection)) {
            observer = getSetObserver(collection);
        }
        else if (isMap(collection)) {
            observer = getMapObserver(collection);
        }
        else {
            throw createMappedError(210 /* ErrorNames.non_recognisable_collection_type */, collection);
        }
        this.obs.add(observer);
    }
    function subscribeTo(subscribable) {
        this.obs.add(subscribable);
    }
    function noopHandleChange() {
        throw createMappedError(99 /* ErrorNames.method_not_implemented */, 'handleChange');
    }
    function noopHandleCollectionChange() {
        throw createMappedError(99 /* ErrorNames.method_not_implemented */, 'handleCollectionChange');
    }
    return function connectableDecorator(target, context) {
        const proto = target.prototype;
        ensureProto(proto, 'observe', observe);
        ensureProto(proto, 'observeCollection', observeCollection);
        ensureProto(proto, 'subscribeTo', subscribeTo);
        rtDef(proto, 'obs', { get: getObserverRecord });
        // optionally add these two methods to normalize a connectable impl
        // though don't override if it already exists
        ensureProto(proto, 'handleChange', noopHandleChange);
        ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);
        return target;
    };
})();
function connectable(target, context) {
    return target == null ? connectableDecorator : connectableDecorator(target, context);
}

/**
 * Current subscription collector
 */
// eslint-disable-next-line import/no-mutable-exports
let _connectable = null;
const connectables = [];
// eslint-disable-next-line
let connecting = false;
// todo: layer based collection pause/resume?
function pauseConnecting() {
    connecting = false;
}
function resumeConnecting() {
    connecting = true;
}
function currentConnectable() {
    return _connectable;
}
function enterConnectable(connectable) {
    if (connectable == null) {
        throw createMappedError(206 /* ErrorNames.switch_on_null_connectable */);
    }
    if (_connectable == null) {
        _connectable = connectable;
        connectables[0] = _connectable;
        connecting = true;
        return;
    }
    if (_connectable === connectable) {
        throw createMappedError(207 /* ErrorNames.switch_active_connectable */);
    }
    connectables.push(connectable);
    _connectable = connectable;
    connecting = true;
}
function exitConnectable(connectable) {
    if (connectable == null) {
        throw createMappedError(208 /* ErrorNames.switch_off_null_connectable */);
    }
    if (_connectable !== connectable) {
        throw createMappedError(209 /* ErrorNames.switch_off_inactive_connectable */);
    }
    connectables.pop();
    _connectable = connectables.length > 0 ? connectables[connectables.length - 1] : null;
    connecting = _connectable != null;
}
const ConnectableSwitcher = /*@__PURE__*/ rtObjectFreeze({
    get current() {
        return _connectable;
    },
    get connecting() {
        return connecting;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting,
});

const R$get = Reflect.get;
const toStringTag = Object.prototype.toString;
const proxyMap = new WeakMap();
/** @internal */
const nowrapClassKey = '__au_nw__';
/** @internal */
const nowrapPropKey = '__au_nw';
function canWrap(obj) {
    switch (toStringTag.call(obj)) {
        case '[object Object]':
            // enable inheritance decoration
            return obj.constructor[nowrapClassKey] !== true;
        case '[object Array]':
        case '[object Map]':
        case '[object Set]':
            // it's unlikely that methods on the following 2 objects need to be observed for changes
            // so while they are valid/ we don't wrap them either
            // case '[object Math]':
            // case '[object Reflect]':
            return true;
        default:
            return false;
    }
}
const rawKey = '__raw__';
function wrap(v) {
    return canWrap(v) ? getProxy(v) : v;
}
function getProxy(obj) {
    // deepscan-disable-next-line
    return proxyMap.get(obj) ?? createProxy(obj);
}
function getRaw(obj) {
    // todo: get in a weakmap if null/undef
    return obj[rawKey] ?? obj;
}
function unwrap(v) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return canWrap(v) && v[rawKey] || v;
}
function doNotCollect(object, key) {
    return key === 'constructor'
        || key === '__proto__'
        // probably should revert to v1 naming style for consistency with builtin?
        // __o__ is shorters & less chance of conflict with other libs as well
        || key === '$observers'
        || key === Symbol.toPrimitive
        || key === Symbol.toStringTag
        // limit to string first
        // symbol can be added later
        // looking up from the constructor means inheritance is supported
        || object.constructor[`${nowrapPropKey}_${rtSafeString(key)}__`] === true;
}
function createProxy(obj) {
    const handler = isArray(obj)
        ? arrayHandler
        : isMap(obj) || isSet(obj)
            ? collectionHandler
            : objectHandler;
    const proxiedObj = new Proxy(obj, handler);
    proxyMap.set(obj, proxiedObj);
    proxyMap.set(proxiedObj, proxiedObj);
    return proxiedObj;
}
const objectHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(target, key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        // todo: static
        connectable.observe(target, key);
        return wrap(R$get(target, key, receiver));
    },
    deleteProperty(target, p) {
        {
            // eslint-disable-next-line no-console
            console.warn(`[DEV:aurelia] deletion of a property will not always be working with Aurelia observation system, as it depends on getter/setter installation.`);
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        return delete target[p];
    },
};
const arrayHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        if (!connecting || doNotCollect(target, key) || _connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'length':
                _connectable.observe(target, 'length');
                return target.length;
            case 'map':
                return wrappedArrayMap;
            case 'includes':
                return wrappedArrayIncludes;
            case 'indexOf':
                return wrappedArrayIndexOf;
            case 'lastIndexOf':
                return wrappedArrayLastIndexOf;
            case 'every':
                return wrappedArrayEvery;
            case 'filter':
                return wrappedArrayFilter;
            case 'find':
                return wrappedArrayFind;
            case 'findIndex':
                return wrappedArrayFindIndex;
            case 'flat':
                return wrappedArrayFlat;
            case 'flatMap':
                return wrappedArrayFlatMap;
            case 'join':
                return wrappedArrayJoin;
            case 'push':
                return wrappedArrayPush;
            case 'pop':
                return wrappedArrayPop;
            case 'reduce':
                return wrappedReduce;
            case 'reduceRight':
                return wrappedReduceRight;
            case 'reverse':
                return wrappedArrayReverse;
            case 'shift':
                return wrappedArrayShift;
            case 'unshift':
                return wrappedArrayUnshift;
            case 'slice':
                return wrappedArraySlice;
            case 'splice':
                return wrappedArraySplice;
            case 'some':
                return wrappedArraySome;
            case 'sort':
                return wrappedArraySort;
            case 'keys':
                return wrappedKeys;
            case 'values':
            case Symbol.iterator:
                return wrappedValues;
            case 'entries':
                return wrappedEntries;
        }
        _connectable.observe(target, key);
        return wrap(R$get(target, key, receiver));
    },
    // for (let i in array) ...
    ownKeys(target) {
        currentConnectable()?.observe(target, 'length');
        return Reflect.ownKeys(target);
    },
};
function wrappedArrayMap(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.map((v, i) => 
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArrayEvery(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.every((v, i) => cb.call(thisArg, wrap(v), i, this));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayFilter(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.filter((v, i) => 
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArrayIncludes(v) {
    const raw = getRaw(this);
    const res = raw.includes(unwrap(v));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayIndexOf(v) {
    const raw = getRaw(this);
    const res = raw.indexOf(unwrap(v));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayLastIndexOf(v) {
    const raw = getRaw(this);
    const res = raw.lastIndexOf(unwrap(v));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayFindIndex(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.findIndex((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArrayFind(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.find((v, i) => cb(wrap(v), i, this), thisArg);
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArrayFlat() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return wrap(raw.flat());
}
function wrappedArrayFlatMap(cb, thisArg) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return getProxy(raw.flatMap((v, i) => wrap(cb.call(thisArg, wrap(v), i, this))));
}
function wrappedArrayJoin(separator) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return raw.join(separator);
}
function wrappedArrayPop() {
    return wrap(getRaw(this).pop());
}
function wrappedArrayPush(...args) {
    return getRaw(this).push(...args);
}
function wrappedArrayShift() {
    return wrap(getRaw(this).shift());
}
function wrappedArrayUnshift(...args) {
    return getRaw(this).unshift(...args);
}
function wrappedArraySplice(...args) {
    return wrap(getRaw(this).splice(...args));
}
function wrappedArrayReverse(..._args) {
    const raw = getRaw(this);
    const res = raw.reverse();
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArraySome(cb, thisArg) {
    const raw = getRaw(this);
    const res = raw.some((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
    observeCollection(_connectable, raw);
    return res;
}
function wrappedArraySort(cb) {
    const raw = getRaw(this);
    const res = raw.sort(cb);
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedArraySlice(start, end) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return getProxy(raw.slice(start, end));
}
function wrappedReduce(cb, initValue) {
    const raw = getRaw(this);
    const res = raw.reduce((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
    observeCollection(_connectable, raw);
    return wrap(res);
}
function wrappedReduceRight(cb, initValue) {
    const raw = getRaw(this);
    const res = raw.reduceRight((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
    observeCollection(_connectable, raw);
    return wrap(res);
}
// the below logic takes inspiration from Vue, Mobx
// much thanks to them for working out this
const collectionHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(target, key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'size':
                connectable.observe(target, 'size');
                return target.size;
            case 'clear':
                return wrappedClear;
            case 'delete':
                return wrappedDelete;
            case 'forEach':
                return wrappedForEach;
            case 'add':
                if (isSet(target)) {
                    return wrappedAdd;
                }
                break;
            case 'get':
                if (isMap(target)) {
                    return wrappedGet;
                }
                break;
            case 'set':
                if (isMap(target)) {
                    return wrappedSet;
                }
                break;
            case 'has':
                return wrappedHas;
            case 'keys':
                return wrappedKeys;
            case 'values':
                return wrappedValues;
            case 'entries':
                return wrappedEntries;
            case Symbol.iterator:
                return isMap(target) ? wrappedEntries : wrappedValues;
        }
        return wrap(R$get(target, key, receiver));
    },
};
function wrappedForEach(cb, thisArg) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return raw.forEach((v, key) => {
        cb.call(/* should wrap or not?? */ thisArg, wrap(v), wrap(key), this);
    });
}
function wrappedHas(v) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return raw.has(unwrap(v));
}
function wrappedGet(k) {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    return wrap(raw.get(unwrap(k)));
}
function wrappedSet(k, v) {
    return wrap(getRaw(this).set(unwrap(k), unwrap(v)));
}
function wrappedAdd(v) {
    return wrap(getRaw(this).add(unwrap(v)));
}
function wrappedClear() {
    return wrap(getRaw(this).clear());
}
function wrappedDelete(k) {
    return wrap(getRaw(this).delete(unwrap(k)));
}
function wrappedKeys() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    const iterator = raw.keys();
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: wrap(value), done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
function wrappedValues() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    const iterator = raw.values();
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: wrap(value), done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
function wrappedEntries() {
    const raw = getRaw(this);
    observeCollection(_connectable, raw);
    const iterator = raw.entries();
    // return a wrapped iterator which returns observed versions of the
    // values emitted from the real iterator
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: [wrap(value[0]), wrap(value[1])], done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
const observeCollection = (connectable, collection) => connectable?.observeCollection(collection);
const ProxyObservable = /*@__PURE__*/ rtObjectFreeze({
    getProxy,
    getRaw,
    wrap,
    unwrap,
    rawKey,
});

class ComputedObserver {
    constructor(obj, get, set, observerLocator, useProxy) {
        this.type = atObserver;
        /** @internal */
        this._oldValue = void 0;
        /** @internal */
        this._value = void 0;
        this._notified = false;
        // todo: maybe use a counter allow recursive call to a certain level
        /** @internal */
        this._isRunning = false;
        /** @internal */
        this._isDirty = false;
        /** @internal */
        this._callback = void 0;
        /** @internal */
        this._coercer = void 0;
        /** @internal */
        this._coercionConfig = void 0;
        this._obj = obj;
        this._wrapped = useProxy ? wrap(obj) : obj;
        this.$get = get;
        this.$set = set;
        this.oL = observerLocator;
    }
    init(value) {
        this._value = value;
        this._isDirty = false;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.$get.call(this._obj, this._obj, this);
        }
        if (this._isDirty) {
            this.compute();
            this._isDirty = false;
            this._notified = false;
        }
        return this._value;
    }
    // deepscan-disable-next-line
    setValue(v) {
        if (isFunction(this.$set)) {
            if (this._coercer !== void 0) {
                v = this._coercer.call(null, v, this._coercionConfig);
            }
            if (!areEqual(v, this._value)) {
                // setting running true as a form of batching
                this._isRunning = true;
                this.$set.call(this._obj, v);
                this._isRunning = false;
                this.run();
            }
        }
        else {
            throw createMappedError(221 /* ErrorNames.assign_readonly_readonly_property_from_computed */);
        }
    }
    useCoercer(coercer, coercionConfig) {
        this._coercer = coercer;
        this._coercionConfig = coercionConfig;
        return true;
    }
    useCallback(callback) {
        this._callback = callback;
        return true;
    }
    handleDirty() {
        if (!this._isDirty) {
            this._isDirty = true;
            this.subs.notifyDirty();
        }
    }
    handleChange() {
        this._isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this._isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    subscribe(subscriber) {
        // in theory, a collection subscriber could be added before a property subscriber
        // and it should be handled similarly in subscribeToCollection
        // though not handling for now, and wait until the merge of normal + collection subscription
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            // start collecting dependencies
            this._oldValue = this.compute();
            this._isDirty = false;
            this._notified = false;
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this._isDirty = true;
            this.obs.clearAll();
            this._oldValue = void 0;
            this._notified = true;
        }
    }
    run() {
        if (this._isRunning) {
            return;
        }
        const currValue = this._value;
        const oldValue = this._oldValue;
        const newValue = this.compute();
        this._isDirty = false;
        // there's case where the _value property was updated without notifying subscribers
        // such is the case when this computed observer value was requested
        // before the dependencies of this observer notify it of their changes
        //
        // if we are to notify whenever we are computing new value, it'd cause a depth first & potentially circular update
        // (subscriber of this observer requests value -> this observer re-computes -> subscribers gets updated)
        // so we are only notifying subscribers when it's the actual notify phase
        if (!this._notified || !areEqual(newValue, currValue)) {
            this._callback?.(newValue, oldValue);
            this.subs.notify(newValue, oldValue);
            this._oldValue = this._value = newValue;
            this._notified = true;
        }
    }
    compute() {
        this._isRunning = true;
        this.obs.version++;
        try {
            enterConnectable(this);
            return this._value = unwrap(this.$get.call(this._wrapped, this._wrapped, this));
        }
        finally {
            this.obs.clear();
            this._isRunning = false;
            exitConnectable(this);
        }
    }
}
(() => {
    connectable(ComputedObserver, null);
    subscriberCollection(ComputedObserver, null);
})();

const IDirtyChecker = /*@__PURE__*/ rtCreateInterface('IDirtyChecker', x => x.callback(() => {
        throw createMappedError(217 /* ErrorNames.dirty_check_no_handler */);
    })
    );
const DirtyCheckSettings = {
    /**
     * Default: `6`
     *
     * Adjust the global dirty check frequency.
     * Measures in "timeouts per check", such that (given a default of 250 timeouts per second in modern browsers):
     * - A value of 1 will result in 250 dirty checks per second (or 1 dirty check per second for an inactive tab)
     * - A value of 25 will result in 10 dirty checks per second (or 1 dirty check per 25 seconds for an inactive tab)
     */
    timeoutsPerCheck: 25,
    /**
     * Default: `false`
     *
     * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
     * or an adapter, will simply not be observed.
     */
    disabled: false,
    /**
     * Default: `false`
     *
     * Throw an error if a property is being dirty-checked.
     */
    throw: false,
    /**
     * Resets all dirty checking settings to the framework's defaults.
     */
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};
class DirtyChecker {
    static register(c) {
        c.register(Registration.singleton(this, this), Registration.aliasTo(this, IDirtyChecker));
    }
    constructor() {
        this.tracked = [];
        /** @internal */
        this._task = null;
        /** @internal */
        this._elapsedFrames = 0;
        this.p = resolve(IPlatform);
        this.check = () => {
            if (DirtyCheckSettings.disabled) {
                return;
            }
            if (++this._elapsedFrames < DirtyCheckSettings.timeoutsPerCheck) {
                return;
            }
            this._elapsedFrames = 0;
            const tracked = this.tracked.slice(0);
            const len = tracked.length;
            let current;
            let i = 0;
            for (; i < len; ++i) {
                current = tracked[i];
                if (current.isDirty()) {
                    current.flush();
                }
            }
        };
        subscriberCollection(DirtyCheckProperty, null);
    }
    createProperty(obj, key) {
        if (DirtyCheckSettings.throw) {
            throw createMappedError(218 /* ErrorNames.dirty_check_not_allowed */, key);
        }
        return new DirtyCheckProperty(this, obj, key);
    }
    addProperty(property) {
        this.tracked.push(property);
        if (this.tracked.length === 1) {
            this._task = this.p.taskQueue.queueTask(this.check, { persistent: true });
        }
    }
    removeProperty(property) {
        this.tracked.splice(this.tracked.indexOf(property), 1);
        if (this.tracked.length === 0) {
            this._task.cancel();
            this._task = null;
        }
    }
}
class DirtyCheckProperty {
    constructor(dirtyChecker, obj, key) {
        this.obj = obj;
        this.key = key;
        this.type = atNone;
        /** @internal */
        this._oldValue = void 0;
        this._dirtyChecker = dirtyChecker;
    }
    getValue() {
        return this.obj[this.key];
    }
    setValue(_v) {
        // todo: this should be allowed, probably
        // but the construction of dirty checker should throw instead
        throw createMappedError(219 /* ErrorNames.dirty_check_setter_not_allowed */, this.key);
    }
    isDirty() {
        return this._oldValue !== this.obj[this.key];
    }
    flush() {
        const oldValue = this._oldValue;
        const newValue = this.getValue();
        this._oldValue = newValue;
        this.subs.notify(newValue, oldValue);
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this._oldValue = this.obj[this.key];
            this._dirtyChecker.addProperty(this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this._dirtyChecker.removeProperty(this);
        }
    }
}

class PrimitiveObserver {
    get doNotCache() { return true; }
    constructor(obj, key) {
        this.type = atNone;
        this._obj = obj;
        this._key = key;
    }
    getValue() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
        return this._obj[this._key];
    }
    setValue() { }
    subscribe() { }
    unsubscribe() { }
}

class PropertyAccessor {
    constructor() {
        // the only thing can be guaranteed is it's an object
        // even if this property accessor is used to access an element
        this.type = atNone;
    }
    getValue(obj, key) {
        return obj[key];
    }
    setValue(value, obj, key) {
        obj[key] = value;
    }
}

/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
class SetterObserver {
    constructor(obj, key) {
        // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
        this.type = atObserver;
        /** @internal */
        this._value = void 0;
        /** @internal */
        this._observing = false;
        /** @internal */
        this._callback = void 0;
        /** @internal */
        this._coercer = void 0;
        /** @internal */
        this._coercionConfig = void 0;
        this._obj = obj;
        this._key = key;
    }
    getValue() {
        return this._value;
    }
    setValue(newValue) {
        if (this._coercer !== void 0) {
            newValue = this._coercer.call(void 0, newValue, this._coercionConfig);
        }
        const oldValue = this._value;
        if (this._observing) {
            if (areEqual(newValue, this._value)) {
                return;
            }
            this._value = newValue;
            this.subs.notifyDirty();
            this.subs.notify(newValue, oldValue);
            // only call the callback if _value is the same with newValue
            // which means if during subs.notify() the value of this observer is changed
            // then it's the job of that setValue() to call the callback
            if (areEqual(newValue, this._value)) {
                this._callback?.(newValue, oldValue);
            }
        }
        else {
            // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
            // so calling obj[propertyKey] will actually return this.value.
            // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
            // is unmodified and we need to explicitly set the property value.
            // This will happen in one-time, to-view and two-way bindings during bind, meaning that the bind will not actually update the target value.
            // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether bind updated the target or not.
            this._value = this._obj[this._key] = newValue;
            this._callback?.(newValue, oldValue);
        }
    }
    useCallback(callback) {
        this._callback = callback;
        this.start();
        return true;
    }
    useCoercer(coercer, coercionConfig) {
        this._coercer = coercer;
        this._coercionConfig = coercionConfig;
        this.start();
        return true;
    }
    subscribe(subscriber) {
        if (this._observing === false) {
            this.start();
        }
        this.subs.add(subscriber);
    }
    start() {
        if (this._observing === false) {
            this._observing = true;
            this._value = this._obj[this._key];
            rtDef(this._obj, this._key, {
                enumerable: true,
                configurable: true,
                get: rtObjectAssign(( /* Setter Observer */) => this.getValue(), { getObserver: () => this }),
                set: (/* Setter Observer */ value) => {
                    this.setValue(value);
                },
            });
        }
        return this;
    }
    stop() {
        if (this._observing) {
            rtDef(this._obj, this._key, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this._value,
            });
            this._observing = false;
            // todo(bigopon/fred): add .removeAllSubscribers()
        }
        return this;
    }
}
(() => {
    subscriberCollection(SetterObserver, null);
})();

const propertyAccessor = new PropertyAccessor();
const IObserverLocator = /*@__PURE__*/ rtCreateInterface('IObserverLocator', x => x.singleton(ObserverLocator));
const INodeObserverLocator = /*@__PURE__*/ rtCreateInterface('INodeObserverLocator', x => x.cachedCallback(handler => {
    {
        handler.getAll(ILogger).forEach(logger => {
            logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
        });
    }
    return new DefaultNodeObserverLocator();
}));
class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return propertyAccessor;
    }
    getAccessor() {
        return propertyAccessor;
    }
}
const IComputedObserverLocator = /*@__PURE__*/ rtCreateInterface('IComputedObserverLocator', x => x.singleton(class DefaultLocator {
    getObserver(obj, key, pd, requestor) {
        const observer = new ComputedObserver(obj, pd.get, pd.set, requestor, true);
        rtDef(obj, key, {
            enumerable: pd.enumerable,
            configurable: true,
            get: rtObjectAssign((( /* Computed Observer */) => observer.getValue()), { getObserver: () => observer }),
            set: (/* Computed Observer */ v) => {
                observer.setValue(v);
            },
        });
        return observer;
    }
}));
class ObserverLocator {
    constructor() {
        /** @internal */ this._adapters = [];
        /** @internal */ this._dirtyChecker = resolve(IDirtyChecker);
        /** @internal */ this._nodeObserverLocator = resolve(INodeObserverLocator);
        /** @internal */ this._computedObserverLocator = resolve(IComputedObserverLocator);
    }
    addAdapter(adapter) {
        this._adapters.push(adapter);
    }
    getObserver(obj, key) {
        if (obj == null) {
            throw createMappedError(199 /* ErrorNames.observing_null_undefined */, key);
        }
        if (!isObject(obj)) {
            return new PrimitiveObserver(obj, isFunction(key) ? '' : key);
        }
        if (isFunction(key)) {
            return new ComputedObserver(obj, key, void 0, this, true);
        }
        const lookup = getObserverLookup(obj);
        let observer = lookup[key];
        if (observer === void 0) {
            observer = this.createObserver(obj, key);
            if (!observer.doNotCache) {
                lookup[key] = observer;
            }
        }
        return observer;
    }
    getAccessor(obj, key) {
        const cached = obj.$observers?.[key];
        if (cached !== void 0) {
            return cached;
        }
        if (this._nodeObserverLocator.handles(obj, key, this)) {
            return this._nodeObserverLocator.getAccessor(obj, key, this);
        }
        return propertyAccessor;
    }
    getArrayObserver(observedArray) {
        return getArrayObserver(observedArray);
    }
    getMapObserver(observedMap) {
        return getMapObserver(observedMap);
    }
    getSetObserver(observedSet) {
        return getSetObserver(observedSet);
    }
    createObserver(obj, key) {
        if (this._nodeObserverLocator.handles(obj, key, this)) {
            return this._nodeObserverLocator.getObserver(obj, key, this);
        }
        switch (key) {
            case 'length':
                if (isArray(obj)) {
                    return getArrayObserver(obj).getLengthObserver();
                }
                break;
            case 'size':
                if (isMap(obj)) {
                    return getMapObserver(obj).getLengthObserver();
                }
                else if (isSet(obj)) {
                    return getSetObserver(obj).getLengthObserver();
                }
                break;
            default:
                if (isArray(obj) && isArrayIndex(key)) {
                    return getArrayObserver(obj).getIndexObserver(Number(key));
                }
                break;
        }
        let pd = getOwnPropDesc(obj, key);
        // Only instance properties will yield a descriptor here, otherwise walk up the proto chain
        if (pd === void 0) {
            let proto = getProto(obj);
            while (proto !== null) {
                pd = getOwnPropDesc(proto, key);
                if (pd === void 0) {
                    proto = getProto(proto);
                }
                else {
                    break;
                }
            }
        }
        // If the descriptor does not have a 'value' prop, it must have a getter and/or setter
        if (pd !== void 0 && !hasOwnProp.call(pd, 'value')) {
            let obs = this._getAdapterObserver(obj, key, pd);
            if (obs == null) {
                obs = (pd.get?.getObserver)?.(obj);
            }
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return obs == null
                ? pd.configurable
                    // ? this._createComputedObserver(obj, key, pd, true)
                    ? this._computedObserverLocator.getObserver(obj, key, pd, this)
                    : this._dirtyChecker.createProperty(obj, key)
                : obs;
        }
        // Ordinary get/set observation (the common use case)
        // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
        return new SetterObserver(obj, key);
    }
    // /** @internal */
    // private _createComputedObserver(obj: object, key: PropertyKey, pd: PropertyDescriptor, useProxy?: boolean) {
    //   const observer = new ComputedObserver(obj, pd.get!, pd.set, this, !!useProxy);
    //   def(obj, key, {
    //     enumerable: pd.enumerable,
    //     configurable: true,
    //     get: objectAssign(((/* Computed Observer */) => observer.getValue()) as ObservableGetter, { getObserver: () => observer }),
    //     set: (/* Computed Observer */v) => {
    //       observer.setValue(v);
    //     },
    //   });
    //   return observer;
    // }
    /** @internal */
    _getAdapterObserver(obj, key, pd) {
        if (this._adapters.length > 0) {
            for (const adapter of this._adapters) {
                const observer = adapter.getObserver(obj, key, pd, this);
                if (observer != null) {
                    return observer;
                }
            }
        }
        return null;
    }
}
// T extends unknown[]
//   ? ArrayObserver
//   : T extends Map<unknown, unknown>
//     ? MapObserver
//     : T extends Set<unknown>
//       ? SetObserver
//       :
const getCollectionObserver = (collection) => {
    let obs;
    if (isArray(collection)) {
        obs = getArrayObserver(collection);
    }
    else if (isMap(collection)) {
        obs = getMapObserver(collection);
    }
    else if (isSet(collection)) {
        obs = getSetObserver(collection);
    }
    return obs;
};
const getProto = Object.getPrototypeOf;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getObserverLookup = (instance) => {
    let lookup = instance.$observers;
    if (lookup === void 0) {
        rtDef(instance, '$observers', {
            enumerable: false,
            value: lookup = createLookup(),
        });
    }
    return lookup;
};

const IObservation = /*@__PURE__*/ rtCreateInterface('IObservation', x => x.singleton(Observation));
class Observation {
    constructor() {
        /** @internal */
        this.oL = resolve(IObserverLocator);
        /** @internal */
        this._parser = resolve(IExpressionParser);
    }
    run(fn) {
        const effect = new RunEffect(this.oL, fn);
        // todo: batch effect run after it's in
        effect.run();
        return effect;
    }
    watch(obj, getter, callback, options) {
        // eslint-disable-next-line no-undef-init
        let $oldValue = undefined;
        let running = false;
        let cleanupTask;
        const observer = this.oL.getObserver(obj, getter);
        const handleChange = (newValue, oldValue) => {
            cleanupTask?.();
            cleanupTask = void 0;
            const result = callback(newValue, $oldValue = oldValue);
            if (isFunction(result)) {
                cleanupTask = result;
            }
        };
        const handler = {
            handleChange
        };
        const run = () => {
            if (running)
                return;
            running = true;
            observer.subscribe(handler);
            handleChange(observer.getValue(), $oldValue);
        };
        const stop = () => {
            if (!running)
                return;
            running = false;
            observer.unsubscribe(handler);
            cleanupTask?.();
            cleanupTask = void 0;
        };
        if (options?.immediate !== false) {
            run();
        }
        return { run, stop };
    }
    watchExpression(obj, expression, callback, options) {
        let running = false;
        let cleanupTask;
        const handleChange = (newValue, oldValue) => {
            cleanupTask?.();
            cleanupTask = void 0;
            const result = callback(newValue, oldValue);
            if (isFunction(result)) {
                cleanupTask = result;
            }
        };
        const observer = new ExpressionObserver(Scope.create(obj), this.oL, this._parser.parse(expression, 'IsProperty'), handleChange);
        const run = () => {
            if (running)
                return;
            running = true;
            observer.run();
        };
        const stop = () => {
            if (!running)
                return;
            running = false;
            observer.stop();
            cleanupTask?.();
            cleanupTask = void 0;
        };
        if (options?.immediate !== false) {
            run();
        }
        return { run, stop };
    }
}
class RunEffect {
    constructor(oL, fn) {
        this.oL = oL;
        this.fn = fn;
        // to configure this, potentially a 2nd parameter is needed for run
        this.maxRunCount = 10;
        this.queued = false;
        this.running = false;
        this.runCount = 0;
        this.stopped = false;
        /** @internal */
        this._cleanupTask = undefined;
        this.run = () => {
            if (this.stopped) {
                throw createMappedError(225 /* ErrorNames.stopping_a_stopped_effect */);
            }
            if (this.running) {
                return;
            }
            ++this.runCount;
            this.running = true;
            this.queued = false;
            ++this.obs.version;
            try {
                this._cleanupTask?.call(void 0);
                enterConnectable(this);
                this._cleanupTask = this.fn(this);
            }
            finally {
                this.obs.clear();
                this.running = false;
                exitConnectable(this);
            }
            // when doing this.fn(this), there's a chance that it has recursive effect
            // continue to run for a certain number before bailing
            // whenever there's a dependency change while running, this.queued will be true
            // so we use it as an indicator to continue to run the effect
            if (this.queued) {
                if (this.runCount > this.maxRunCount) {
                    this.runCount = 0;
                    throw createMappedError(226 /* ErrorNames.effect_maximum_recursion_reached */);
                }
                this.run();
            }
            else {
                this.runCount = 0;
            }
        };
        this.stop = () => {
            this._cleanupTask?.call(void 0);
            this._cleanupTask = void 0;
            this.stopped = true;
            this.obs.clearAll();
        };
    }
    handleChange() {
        this.queued = true;
        this.run();
    }
    handleCollectionChange() {
        this.queued = true;
        this.run();
    }
}
(() => {
    connectable(RunEffect, null);
})();
class ExpressionObserver {
    constructor(scope, oL, expression, callback) {
        this.oL = oL;
        /** @internal */
        this._value = void 0;
        // see Listener binding for explanation
        /** @internal */
        this.boundFn = false;
        this._scope = scope;
        this.ast = expression;
        this._callback = callback;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    run() {
        this.obs.version++;
        const oldValue = this._value;
        const value = astEvaluate(this.ast, this._scope, this, this);
        this.obs.clear();
        if (!areEqual(value, oldValue)) {
            this._value = value;
            this._callback.call(void 0, value, oldValue);
        }
    }
    stop() {
        this.obs.clearAll();
        this._value = void 0;
    }
}
(() => {
    connectable(ExpressionObserver, null);
    mixinNoopAstEvaluator(ExpressionObserver);
})();

const observable = /*@__PURE__*/ (() => {
    function getObserversLookup(obj) {
        if (obj.$observers === void 0) {
            rtDef(obj, '$observers', { value: {} });
            // todo: define in a weakmap
        }
        return obj.$observers;
    }
    const noValue = {};
    // impl, wont be seen
    function observable(targetOrConfig, context) {
        if (!SetterNotifier.mixed) {
            SetterNotifier.mixed = true;
            subscriberCollection(SetterNotifier, null);
        }
        let isClassDecorator = false;
        let config;
        if (typeof targetOrConfig === 'object') {
            config = targetOrConfig;
        }
        else if (targetOrConfig != null) {
            config = { name: targetOrConfig };
            isClassDecorator = true;
        }
        else {
            config = emptyObject;
        }
        // case: @observable() prop
        if (arguments.length === 0) {
            return function (target, context) {
                if (context.kind !== 'field')
                    throw createMappedError(224 /* ErrorNames.invalid_observable_decorator_usage */);
                return createFieldInitializer(context);
            };
        }
        // case: @observable prop
        if (context?.kind === 'field')
            return createFieldInitializer(context);
        // case:  @observable(PropertyKey) class
        if (isClassDecorator) {
            return function (target, context) {
                createDescriptor(target, config.name, () => noValue, true);
            };
        }
        // case: @observable({...}) class | @observable({...}) prop
        return function (target, context) {
            switch (context.kind) {
                case 'field': return createFieldInitializer(context);
                case 'class': return createDescriptor(target, config.name, () => noValue, true);
                default: throw createMappedError(224 /* ErrorNames.invalid_observable_decorator_usage */);
            }
        };
        function createFieldInitializer(context) {
            let $initialValue;
            context.addInitializer(function () {
                createDescriptor(this, context.name, () => $initialValue, false);
            });
            return function (initialValue) {
                return $initialValue = initialValue;
            };
        }
        function createDescriptor(target, property, initialValue, targetIsClass) {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
            const callback = config.callback || `${rtSafeString(property)}Changed`;
            const $set = config.set;
            const observableGetter = function () {
                const notifier = getNotifier(this, property, callback, initialValue, $set);
                currentConnectable()?.subscribeTo(notifier);
                return notifier.getValue();
            };
            observableGetter.getObserver = function (obj) {
                return getNotifier(obj, property, callback, initialValue, $set);
            };
            const descriptor = {
                enumerable: true,
                configurable: true,
                get: observableGetter,
                set(newValue) {
                    getNotifier(this, property, callback, initialValue, $set).setValue(newValue);
                }
            };
            if (targetIsClass)
                rtDef(target.prototype, property, descriptor);
            else
                rtDef(target, property, descriptor);
        }
    }
    function getNotifier(obj, key, callbackKey, initialValue, set) {
        const lookup = getObserversLookup(obj);
        let notifier = lookup[key];
        if (notifier == null) {
            const $initialValue = initialValue();
            notifier = new SetterNotifier(obj, callbackKey, set, $initialValue === noValue ? void 0 : $initialValue);
            lookup[key] = notifier;
        }
        return notifier;
    }
    class SetterNotifier {
        constructor(obj, callbackKey, set, initialValue) {
            this.type = atObserver;
            /** @internal */
            this._value = void 0;
            /** @internal */
            this._oldValue = void 0;
            this._obj = obj;
            this._setter = set;
            this._hasSetter = isFunction(set);
            const callback = obj[callbackKey];
            this.cb = isFunction(callback) ? callback : void 0;
            this._value = initialValue;
        }
        getValue() {
            return this._value;
        }
        setValue(value) {
            if (this._hasSetter) {
                value = this._setter(value);
            }
            if (!areEqual(value, this._value)) {
                this._oldValue = this._value;
                this._value = value;
                this.subs.notifyDirty();
                this.subs.notify(this._value, this._oldValue);
                // if the value has been changed during the notify, don't call the callback
                // it's the job of the last .setValue() to call the callback
                if (areEqual(value, this._value)) {
                    this.cb?.call(this._obj, this._value, this._oldValue);
                }
            }
        }
    }
    SetterNotifier.mixed = false;
    /*
              | typescript       | babel
    ----------|------------------|-------------------------
    property  | config           | config
    w/parens  | target, key      | target, key, descriptor
    ----------|------------------|-------------------------
    property  | target, key      | target, key, descriptor
    no parens | n/a              | n/a
    ----------|------------------|-------------------------
    class     | config           | config
              | target           | target
    */
    return observable;
})();

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
function nowrap(target, context) {
    return arguments.length === 0 ? decorator : decorator(target, context);
    function decorator(target, context) {
        switch (context.kind) {
            case 'class':
                rtDefineHiddenProp(target, nowrapClassKey, true);
                break;
            case 'field':
                context.addInitializer(function () {
                    const target = this.constructor;
                    const property = `${nowrapPropKey}_${rtSafeString(context.name)}__`;
                    if (property in target)
                        return;
                    rtDefineHiddenProp(target, property, true);
                });
                break;
        }
    }
}
/* eslint-enable */

export { AccessorType, BindingContext, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConnectableSwitcher, DirtyCheckProperty, DirtyCheckSettings, DirtyChecker, ICoercionConfiguration, IComputedObserverLocator, IDirtyChecker, INodeObserverLocator, IObservation, IObserverLocator, Observation, ObserverLocator, PrimitiveObserver, PropertyAccessor, ProxyObservable, Scope, SetterObserver, astAssign, astBind, astEvaluate, astUnbind, batch, cloneIndexMap, connectable, copyIndexMap, createIndexMap, getCollectionObserver, getObserverLookup, isIndexMap, mixinNoopAstEvaluator, nowrap, observable, subscriberCollection };
//# sourceMappingURL=index.dev.mjs.map
