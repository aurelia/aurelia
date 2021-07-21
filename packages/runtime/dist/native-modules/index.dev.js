import { Protocol, Metadata, Registration, DI, firstDefined, mergeArrays, fromAnnotationOrDefinitionOrTypeOrDefault, isNumberOrBigInt, isStringOrDate, emptyArray, isArrayIndex, IPlatform, ILogger } from '../../../kernel/dist/native-modules/index.js';
export { IPlatform } from '../../../kernel/dist/native-modules/index.js';
export { Platform, Task, TaskAbortError, TaskQueue, TaskQueuePriority, TaskStatus } from '../../../platform/dist/native-modules/index.js';

function alias(...aliases) {
    return function (target) {
        const key = Protocol.annotation.keyFor('aliases');
        const existing = Metadata.getOwn(key, target);
        if (existing === void 0) {
            Metadata.define(key, aliases, target);
        }
        else {
            existing.push(...aliases);
        }
    };
}
function registerAliases(aliases, resource, key, container) {
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
    }
}

const marker = Object.freeze({});
class BindingContext {
    constructor(keyOrObj, value) {
        if (keyOrObj !== void 0) {
            if (value !== void 0) {
                // if value is defined then it's just a property and a value to initialize with
                this[keyOrObj] = value;
            }
            else {
                // can either be some random object or another bindingContext to clone from
                for (const prop in keyOrObj) {
                    if (Object.prototype.hasOwnProperty.call(keyOrObj, prop)) {
                        this[prop] = keyOrObj[prop];
                    }
                }
            }
        }
    }
    static create(keyOrObj, value) {
        return new BindingContext(keyOrObj, value);
    }
    static get(scope, name, ancestor, flags) {
        var _a, _b;
        if (scope == null) {
            throw new Error(`Scope is ${scope}.`);
        }
        let overrideContext = scope.overrideContext;
        let currentScope = scope;
        // let bc: IBindingContext | null;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                ancestor--;
                currentScope = currentScope.parentScope;
                if ((currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) == null) {
                    return void 0;
                }
            }
            overrideContext = currentScope.overrideContext;
            // Here we are giving benefit of doubt considering the dev has used one or more `$parent` token, and thus should know what s/he is targeting.
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
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
        while (!(currentScope === null || currentScope === void 0 ? void 0 : currentScope.isBoundary)
            && overrideContext != null
            && !(name in overrideContext)
            && !(overrideContext.bindingContext
                && name in overrideContext.bindingContext)) {
            currentScope = (_a = currentScope.parentScope) !== null && _a !== void 0 ? _a : null;
            overrideContext = (_b = currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) !== null && _b !== void 0 ? _b : null;
        }
        if (overrideContext) {
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // This following code block is the v1 behavior of scope selection
        // where it would walk the scope hierarchy and stop at the first scope
        // that has matching property.
        // if no scope in the hierarchy, until the closest boundary scope has the property
        // then pick the scope it started with
        // ------------------
        // if (currentScope.isBoundary) {
        //   if (overrideContext != null) {
        //     if (name in overrideContext) {
        //       return overrideContext;
        //     }
        //     bc = overrideContext.bindingContext;
        //     if (bc != null && name in bc) {
        //       return bc;
        //     }
        //   }
        // } else {
        //   // traverse the context and it's ancestors, searching for a context that has the name.
        //   do {
        //     if (overrideContext != null) {
        //       if (name in overrideContext) {
        //         return overrideContext;
        //       }
        //       bc = overrideContext.bindingContext;
        //       if (bc != null && name in bc) {
        //         return bc;
        //       }
        //     }
        //     if (currentScope.isBoundary) {
        //       break;
        //     }
        //     currentScope = currentScope.parentScope;
        //     overrideContext = currentScope == null ? null : currentScope.overrideContext;
        //   } while (currentScope != null);
        // }
        // still nothing found. return the root binding context (or null
        // if this is a parent scope traversal, to ensure we fall back to the
        // correct level)
        if (flags & 16 /* isTraversingParentScope */) {
            return marker;
        }
        return scope.bindingContext || scope.overrideContext;
    }
}
class Scope {
    constructor(parentScope, bindingContext, overrideContext, isBoundary) {
        this.parentScope = parentScope;
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
        this.isBoundary = isBoundary;
    }
    static create(bc, oc, isBoundary) {
        return new Scope(null, bc, oc == null ? OverrideContext.create(bc) : oc, isBoundary !== null && isBoundary !== void 0 ? isBoundary : false);
    }
    static fromOverride(oc) {
        if (oc == null) {
            throw new Error(`OverrideContext is ${oc}`);
        }
        return new Scope(null, oc.bindingContext, oc, false);
    }
    static fromParent(ps, bc) {
        if (ps == null) {
            throw new Error(`ParentScope is ${ps}`);
        }
        return new Scope(ps, bc, OverrideContext.create(bc), false);
    }
}
class OverrideContext {
    constructor(bindingContext) {
        this.bindingContext = bindingContext;
    }
    static create(bc) {
        return new OverrideContext(bc);
    }
}

const ISignaler = DI.createInterface('ISignaler', x => x.singleton(Signaler));
class Signaler {
    constructor() {
        this.signals = Object.create(null);
    }
    dispatchSignal(name, flags) {
        const listeners = this.signals[name];
        if (listeners === undefined) {
            return;
        }
        let listener;
        for (listener of listeners.keys()) {
            listener.handleChange(undefined, undefined, flags);
        }
    }
    addSignalListener(name, listener) {
        const signals = this.signals;
        const listeners = signals[name];
        if (listeners === undefined) {
            signals[name] = new Set([listener]);
        }
        else {
            listeners.add(listener);
        }
    }
    removeSignalListener(name, listener) {
        const listeners = this.signals[name];
        if (listeners) {
            listeners.delete(listener);
        }
    }
}

var BindingBehaviorStrategy;
(function (BindingBehaviorStrategy) {
    BindingBehaviorStrategy[BindingBehaviorStrategy["singleton"] = 1] = "singleton";
    BindingBehaviorStrategy[BindingBehaviorStrategy["interceptor"] = 2] = "interceptor";
})(BindingBehaviorStrategy || (BindingBehaviorStrategy = {}));
function bindingBehavior(nameOrDef) {
    return function (target) {
        return BindingBehavior.define(nameOrDef, target);
    };
}
class BindingBehaviorDefinition {
    constructor(Type, name, aliases, key, strategy) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.strategy = strategy;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        const inheritsFromInterceptor = Object.getPrototypeOf(Type) === BindingInterceptor;
        return new BindingBehaviorDefinition(Type, firstDefined(BindingBehavior.getAnnotation(Type, 'name'), name), mergeArrays(BindingBehavior.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingBehavior.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('strategy', def, Type, () => inheritsFromInterceptor ? 2 /* interceptor */ : 1 /* singleton */));
    }
    register(container) {
        const { Type, key, aliases, strategy } = this;
        switch (strategy) {
            case 1 /* singleton */:
                Registration.singleton(key, Type).register(container);
                break;
            case 2 /* interceptor */:
                Registration.instance(key, new BindingBehaviorFactory(container, Type)).register(container);
                break;
        }
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, BindingBehavior, key, container);
    }
}
class BindingBehaviorFactory {
    constructor(ctn, Type) {
        this.ctn = ctn;
        this.Type = Type;
        this.deps = DI.getDependencies(Type);
    }
    construct(binding, expr) {
        const container = this.ctn;
        const deps = this.deps;
        switch (deps.length) {
            case 0:
            case 1:
            case 2:
                // TODO(fkleuver): fix this cast
                return new this.Type(binding, expr);
            case 3:
                return new this.Type(container.get(deps[0]), binding, expr);
            case 4:
                return new this.Type(container.get(deps[0]), container.get(deps[1]), binding, expr);
            default:
                return new this.Type(...deps.map(d => container.get(d)), binding, expr);
        }
    }
}
class BindingInterceptor {
    constructor(binding, expr) {
        this.binding = binding;
        this.expr = expr;
        this.interceptor = this;
        let interceptor;
        while (binding.interceptor !== this) {
            interceptor = binding.interceptor;
            binding.interceptor = this;
            binding = interceptor;
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
    updateTarget(value, flags) {
        this.binding.updateTarget(value, flags);
    }
    updateSource(value, flags) {
        this.binding.updateSource(value, flags);
    }
    callSource(args) {
        return this.binding.callSource(args);
    }
    handleChange(newValue, previousValue, flags) {
        this.binding.handleChange(newValue, previousValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.binding.handleCollectionChange(indexMap, flags);
    }
    observe(obj, key) {
        this.binding.observe(obj, key);
    }
    observeCollection(observer) {
        this.binding.observeCollection(observer);
    }
    $bind(flags, scope) {
        this.binding.$bind(flags, scope);
    }
    $unbind(flags) {
        this.binding.$unbind(flags);
    }
}
const bbBaseName = Protocol.resource.keyFor('binding-behavior');
const BindingBehavior = Object.freeze({
    name: bbBaseName,
    keyFrom(name) {
        return `${bbBaseName}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(bbBaseName, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingBehaviorDefinition.create(nameOrDef, Type);
        Metadata.define(bbBaseName, definition, definition.Type);
        Metadata.define(bbBaseName, definition, definition);
        Protocol.resource.appendTo(Type, bbBaseName);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(bbBaseName, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
});

function valueConverter(nameOrDef) {
    return function (target) {
        return ValueConverter.define(nameOrDef, target);
    };
}
class ValueConverterDefinition {
    constructor(Type, name, aliases, key) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        return new ValueConverterDefinition(Type, firstDefined(ValueConverter.getAnnotation(Type, 'name'), name), mergeArrays(ValueConverter.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), ValueConverter.keyFrom(name));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, ValueConverter, key, container);
    }
}
const vcBaseName = Protocol.resource.keyFor('value-converter');
const ValueConverter = Object.freeze({
    name: vcBaseName,
    keyFrom(name) {
        return `${vcBaseName}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(vcBaseName, value);
    },
    define(nameOrDef, Type) {
        const definition = ValueConverterDefinition.create(nameOrDef, Type);
        Metadata.define(vcBaseName, definition, definition.Type);
        Metadata.define(vcBaseName, definition, definition);
        Protocol.resource.appendTo(Type, vcBaseName);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(vcBaseName, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
});

/* eslint-disable eqeqeq */
var ExpressionKind;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["CallsFunction"] = 128] = "CallsFunction";
    ExpressionKind[ExpressionKind["HasAncestor"] = 256] = "HasAncestor";
    ExpressionKind[ExpressionKind["IsPrimary"] = 512] = "IsPrimary";
    ExpressionKind[ExpressionKind["IsLeftHandSide"] = 1024] = "IsLeftHandSide";
    ExpressionKind[ExpressionKind["HasBind"] = 2048] = "HasBind";
    ExpressionKind[ExpressionKind["HasUnbind"] = 4096] = "HasUnbind";
    ExpressionKind[ExpressionKind["IsAssignable"] = 8192] = "IsAssignable";
    ExpressionKind[ExpressionKind["IsLiteral"] = 16384] = "IsLiteral";
    ExpressionKind[ExpressionKind["IsResource"] = 32768] = "IsResource";
    ExpressionKind[ExpressionKind["IsForDeclaration"] = 65536] = "IsForDeclaration";
    ExpressionKind[ExpressionKind["Type"] = 31] = "Type";
    // ---------------------------------------------------------------------------------------------------------------------------
    ExpressionKind[ExpressionKind["AccessThis"] = 1793] = "AccessThis";
    ExpressionKind[ExpressionKind["AccessScope"] = 10082] = "AccessScope";
    ExpressionKind[ExpressionKind["ArrayLiteral"] = 17955] = "ArrayLiteral";
    ExpressionKind[ExpressionKind["ObjectLiteral"] = 17956] = "ObjectLiteral";
    ExpressionKind[ExpressionKind["PrimitiveLiteral"] = 17925] = "PrimitiveLiteral";
    ExpressionKind[ExpressionKind["Template"] = 17958] = "Template";
    ExpressionKind[ExpressionKind["Unary"] = 39] = "Unary";
    ExpressionKind[ExpressionKind["CallScope"] = 1448] = "CallScope";
    ExpressionKind[ExpressionKind["CallMember"] = 1161] = "CallMember";
    ExpressionKind[ExpressionKind["CallFunction"] = 1162] = "CallFunction";
    ExpressionKind[ExpressionKind["AccessMember"] = 9323] = "AccessMember";
    ExpressionKind[ExpressionKind["AccessKeyed"] = 9324] = "AccessKeyed";
    ExpressionKind[ExpressionKind["TaggedTemplate"] = 1197] = "TaggedTemplate";
    ExpressionKind[ExpressionKind["Binary"] = 46] = "Binary";
    ExpressionKind[ExpressionKind["Conditional"] = 63] = "Conditional";
    ExpressionKind[ExpressionKind["Assign"] = 8208] = "Assign";
    ExpressionKind[ExpressionKind["ValueConverter"] = 36913] = "ValueConverter";
    ExpressionKind[ExpressionKind["BindingBehavior"] = 38962] = "BindingBehavior";
    ExpressionKind[ExpressionKind["HtmlLiteral"] = 51] = "HtmlLiteral";
    ExpressionKind[ExpressionKind["ArrayBindingPattern"] = 65556] = "ArrayBindingPattern";
    ExpressionKind[ExpressionKind["ObjectBindingPattern"] = 65557] = "ObjectBindingPattern";
    ExpressionKind[ExpressionKind["BindingIdentifier"] = 65558] = "BindingIdentifier";
    ExpressionKind[ExpressionKind["ForOfStatement"] = 6199] = "ForOfStatement";
    ExpressionKind[ExpressionKind["Interpolation"] = 24] = "Interpolation"; //
})(ExpressionKind || (ExpressionKind = {}));
class Unparser {
    constructor() {
        this.text = '';
    }
    static unparse(expr) {
        const visitor = new Unparser();
        expr.accept(visitor);
        return visitor.text;
    }
    visitAccessMember(expr) {
        expr.object.accept(this);
        this.text += `.${expr.name}`;
    }
    visitAccessKeyed(expr) {
        expr.object.accept(this);
        this.text += '[';
        expr.key.accept(this);
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
            elements[i].accept(this);
        }
        this.text += ']';
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
            values[i].accept(this);
        }
        this.text += '}';
    }
    visitPrimitiveLiteral(expr) {
        this.text += '(';
        if (typeof expr.value === 'string') {
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
        expr.func.accept(this);
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallMember(expr) {
        this.text += '(';
        expr.object.accept(this);
        this.text += `.${expr.name}`;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallScope(expr) {
        this.text += '(';
        let i = expr.ancestor;
        while (i--) {
            this.text += '$parent.';
        }
        this.text += expr.name;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            expressions[i].accept(this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitTaggedTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        expr.func.accept(this);
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            expressions[i].accept(this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitUnary(expr) {
        this.text += `(${expr.operation}`;
        if (expr.operation.charCodeAt(0) >= /* a */ 97) {
            this.text += ' ';
        }
        expr.expression.accept(this);
        this.text += ')';
    }
    visitBinary(expr) {
        this.text += '(';
        expr.left.accept(this);
        if (expr.operation.charCodeAt(0) === /* i */ 105) {
            this.text += ` ${expr.operation} `;
        }
        else {
            this.text += expr.operation;
        }
        expr.right.accept(this);
        this.text += ')';
    }
    visitConditional(expr) {
        this.text += '(';
        expr.condition.accept(this);
        this.text += '?';
        expr.yes.accept(this);
        this.text += ':';
        expr.no.accept(this);
        this.text += ')';
    }
    visitAssign(expr) {
        this.text += '(';
        expr.target.accept(this);
        this.text += '=';
        expr.value.accept(this);
        this.text += ')';
    }
    visitValueConverter(expr) {
        const args = expr.args;
        expr.expression.accept(this);
        this.text += `|${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            args[i].accept(this);
        }
    }
    visitBindingBehavior(expr) {
        const args = expr.args;
        expr.expression.accept(this);
        this.text += `&${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            args[i].accept(this);
        }
    }
    visitArrayBindingPattern(expr) {
        const elements = expr.elements;
        this.text += '[';
        for (let i = 0, length = elements.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            elements[i].accept(this);
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
            values[i].accept(this);
        }
        this.text += '}';
    }
    visitBindingIdentifier(expr) {
        this.text += expr.name;
    }
    visitHtmlLiteral(expr) { throw new Error('visitHtmlLiteral'); }
    visitForOfStatement(expr) {
        expr.declaration.accept(this);
        this.text += ' of ';
        expr.iterable.accept(this);
    }
    visitInterpolation(expr) {
        const { parts, expressions } = expr;
        const length = expressions.length;
        this.text += '${';
        this.text += parts[0];
        for (let i = 0; i < length; i++) {
            expressions[i].accept(this);
            this.text += parts[i + 1];
        }
        this.text += '}';
    }
    writeArgs(args) {
        this.text += '(';
        for (let i = 0, length = args.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            args[i].accept(this);
        }
        this.text += ')';
    }
}
class CustomExpression {
    constructor(value) {
        this.value = value;
    }
    evaluate(_f, _s, _l, _c) {
        return this.value;
    }
}
class BindingBehaviorExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.behaviorKey = BindingBehavior.keyFrom(name);
    }
    get $kind() { return 38962 /* BindingBehavior */; }
    get hasBind() { return true; }
    get hasUnbind() { return true; }
    evaluate(f, s, l, c) {
        return this.expression.evaluate(f, s, l, c);
    }
    assign(f, s, l, val) {
        return this.expression.assign(f, s, l, val);
    }
    bind(f, s, b) {
        if (this.expression.hasBind) {
            this.expression.bind(f, s, b);
        }
        const behavior = b.locator.get(this.behaviorKey);
        if (behavior == null) {
            throw new Error(`BindingBehavior named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        if (!(behavior instanceof BindingBehaviorFactory)) {
            if (b[this.behaviorKey] === void 0) {
                b[this.behaviorKey] = behavior;
                behavior.bind.call(behavior, f, s, b, ...this.args.map(a => a.evaluate(f, s, b.locator, null)));
            }
            else {
                throw new Error(`BindingBehavior named '${this.name}' already applied.`);
            }
        }
    }
    unbind(f, s, b) {
        const key = this.behaviorKey;
        const $b = b;
        if ($b[key] !== void 0) {
            if (typeof $b[key].unbind === 'function') {
                $b[key].unbind(f, s, b);
            }
            $b[key] = void 0;
        }
        if (this.expression.hasUnbind) {
            this.expression.unbind(f, s, b);
        }
    }
    accept(visitor) {
        return visitor.visitBindingBehavior(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ValueConverterExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.converterKey = ValueConverter.keyFrom(name);
    }
    get $kind() { return 36913 /* ValueConverter */; }
    get hasBind() { return false; }
    get hasUnbind() { return true; }
    evaluate(f, s, l, c) {
        const vc = l.get(this.converterKey);
        if (vc == null) {
            throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        // note: the cast is expected. To connect, it just needs to be a IConnectable
        // though to work with signal, it needs to have `handleChange`
        // so having `handleChange` as a guard in the connectable as a safe measure is needed
        // to make sure signaler works
        if (c !== null && ('handleChange' in c)) {
            const signals = vc.signals;
            if (signals != null) {
                const signaler = l.get(ISignaler);
                for (let i = 0, ii = signals.length; i < ii; ++i) {
                    signaler.addSignalListener(signals[i], c);
                }
            }
        }
        if ('toView' in vc) {
            return vc.toView(this.expression.evaluate(f, s, l, c), ...this.args.map(a => a.evaluate(f, s, l, c)));
        }
        return this.expression.evaluate(f, s, l, c);
    }
    assign(f, s, l, val) {
        const vc = l.get(this.converterKey);
        if (vc == null) {
            throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        if ('fromView' in vc) {
            val = vc.fromView(val, ...this.args.map(a => a.evaluate(f, s, l, null)));
        }
        return this.expression.assign(f, s, l, val);
    }
    unbind(_f, _s, b) {
        const vc = b.locator.get(this.converterKey);
        if (vc.signals === void 0) {
            return;
        }
        const signaler = b.locator.get(ISignaler);
        for (let i = 0; i < vc.signals.length; ++i) {
            // the cast is correct, as the value converter expression would only add
            // a IConnectable that also implements `ISubscriber` interface to the signaler
            signaler.removeSignalListener(vc.signals[i], b);
        }
    }
    accept(visitor) {
        return visitor.visitValueConverter(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AssignExpression {
    constructor(target, value) {
        this.target = target;
        this.value = value;
    }
    get $kind() { return 8208 /* Assign */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        return this.target.assign(f, s, l, this.value.evaluate(f, s, l, c));
    }
    assign(f, s, l, val) {
        this.value.assign(f, s, l, val);
        return this.target.assign(f, s, l, val);
    }
    accept(visitor) {
        return visitor.visitAssign(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ConditionalExpression {
    constructor(condition, yes, no) {
        this.condition = condition;
        this.yes = yes;
        this.no = no;
    }
    get $kind() { return 63 /* Conditional */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        return this.condition.evaluate(f, s, l, c) ? this.yes.evaluate(f, s, l, c) : this.no.evaluate(f, s, l, c);
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitConditional(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AccessThisExpression {
    constructor(ancestor = 0) {
        this.ancestor = ancestor;
    }
    get $kind() { return 1793 /* AccessThis */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, s, _l, _c) {
        var _a;
        let oc = s.overrideContext;
        let currentScope = s;
        let i = this.ancestor;
        while (i-- && oc) {
            currentScope = currentScope.parentScope;
            oc = (_a = currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) !== null && _a !== void 0 ? _a : null;
        }
        return i < 1 && oc ? oc.bindingContext : void 0;
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitAccessThis(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
AccessThisExpression.$this = new AccessThisExpression(0);
AccessThisExpression.$parent = new AccessThisExpression(1);
class AccessScopeExpression {
    constructor(name, ancestor = 0) {
        this.name = name;
        this.ancestor = ancestor;
    }
    get $kind() { return 10082 /* AccessScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, _l, c) {
        const obj = BindingContext.get(s, this.name, this.ancestor, f);
        if (c !== null) {
            c.observe(obj, this.name);
        }
        const evaluatedValue = obj[this.name];
        if (evaluatedValue == null && this.name === '$host') {
            throw new Error('Unable to find $host context. Did you forget [au-slot] attribute?');
        }
        if (f & 1 /* isStrictBindingStrategy */) {
            return evaluatedValue;
        }
        return evaluatedValue == null ? '' : evaluatedValue;
    }
    assign(f, s, _l, val) {
        var _a;
        if (this.name === '$host') {
            throw new Error('Invalid assignment. $host is a reserved keyword.');
        }
        const obj = BindingContext.get(s, this.name, this.ancestor, f);
        if (obj instanceof Object) {
            if (((_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[this.name]) !== void 0) {
                obj.$observers[this.name].setValue(val, f);
                return val;
            }
            else {
                return obj[this.name] = val;
            }
        }
        return void 0;
    }
    accept(visitor) {
        return visitor.visitAccessScope(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AccessMemberExpression {
    constructor(object, name) {
        this.object = object;
        this.name = name;
    }
    get $kind() { return 9323 /* AccessMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        const instance = this.object.evaluate(f, s, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        if (f & 1 /* isStrictBindingStrategy */) {
            if (instance == null) {
                return instance;
            }
            if (c !== null) {
                c.observe(instance, this.name);
            }
            return instance[this.name];
        }
        if (c !== null && instance instanceof Object) {
            c.observe(instance, this.name);
        }
        return instance ? instance[this.name] : '';
    }
    assign(f, s, l, val) {
        const obj = this.object.evaluate(f, s, l, null);
        if (obj instanceof Object) {
            if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                obj.$observers[this.name].setValue(val, f);
            }
            else {
                obj[this.name] = val;
            }
        }
        else {
            this.object.assign(f, s, l, { [this.name]: val });
        }
        return val;
    }
    accept(visitor) {
        return visitor.visitAccessMember(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AccessKeyedExpression {
    constructor(object, key) {
        this.object = object;
        this.key = key;
    }
    get $kind() { return 9324 /* AccessKeyed */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        const instance = this.object.evaluate(f, s, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        if (instance instanceof Object) {
            const key = this.key.evaluate(f, s, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
            if (c !== null) {
                c.observe(instance, key);
            }
            return instance[key];
        }
        return void 0;
    }
    assign(f, s, l, val) {
        const instance = this.object.evaluate(f, s, l, null);
        const key = this.key.evaluate(f, s, l, null);
        return instance[key] = val;
    }
    accept(visitor) {
        return visitor.visitAccessKeyed(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class CallScopeExpression {
    constructor(name, args, ancestor = 0) {
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
    }
    get $kind() { return 1448 /* CallScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        const args = this.args.map(a => a.evaluate(f, s, l, c));
        const context = BindingContext.get(s, this.name, this.ancestor, f);
        // ideally, should observe property represents by this.name as well
        // because it could be changed
        // todo: did it ever surprise anyone?
        const func = getFunction(f, context, this.name);
        if (func) {
            return func.apply(context, args);
        }
        return void 0;
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallScope(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class CallMemberExpression {
    constructor(object, name, args) {
        this.object = object;
        this.name = name;
        this.args = args;
    }
    get $kind() { return 1161 /* CallMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        const instance = this.object.evaluate(f, s, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        const args = this.args.map(a => a.evaluate(f, s, l, c));
        const func = getFunction(f, instance, this.name);
        if (func) {
            return func.apply(instance, args);
        }
        return void 0;
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallMember(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class CallFunctionExpression {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }
    get $kind() { return 1162 /* CallFunction */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        const func = this.func.evaluate(f, s, l, c);
        if (typeof func === 'function') {
            return func(...this.args.map(a => a.evaluate(f, s, l, c)));
        }
        if (!(f & 8 /* mustEvaluate */) && (func == null)) {
            return void 0;
        }
        throw new Error(`Expression is not a function.`);
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallFunction(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class BinaryExpression {
    constructor(operation, left, right) {
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    get $kind() { return 46 /* Binary */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        switch (this.operation) {
            case '&&':
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return this.left.evaluate(f, s, l, c) && this.right.evaluate(f, s, l, c);
            case '||':
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return this.left.evaluate(f, s, l, c) || this.right.evaluate(f, s, l, c);
            case '==':
                return this.left.evaluate(f, s, l, c) == this.right.evaluate(f, s, l, c);
            case '===':
                return this.left.evaluate(f, s, l, c) === this.right.evaluate(f, s, l, c);
            case '!=':
                return this.left.evaluate(f, s, l, c) != this.right.evaluate(f, s, l, c);
            case '!==':
                return this.left.evaluate(f, s, l, c) !== this.right.evaluate(f, s, l, c);
            case 'instanceof': {
                const right = this.right.evaluate(f, s, l, c);
                if (typeof right === 'function') {
                    return this.left.evaluate(f, s, l, c) instanceof right;
                }
                return false;
            }
            case 'in': {
                const right = this.right.evaluate(f, s, l, c);
                if (right instanceof Object) {
                    return this.left.evaluate(f, s, l, c) in right;
                }
                return false;
            }
            // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
            // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
            // this makes bugs in user code easier to track down for end users
            // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
            case '+': {
                const left = this.left.evaluate(f, s, l, c);
                const right = this.right.evaluate(f, s, l, c);
                if ((f & 1 /* isStrictBindingStrategy */) > 0) {
                    return left + right;
                }
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!left || !right) {
                    if (isNumberOrBigInt(left) || isNumberOrBigInt(right)) {
                        return (left || 0) + (right || 0);
                    }
                    if (isStringOrDate(left) || isStringOrDate(right)) {
                        return (left || '') + (right || '');
                    }
                }
                return left + right;
            }
            case '-':
                return this.left.evaluate(f, s, l, c) - this.right.evaluate(f, s, l, c);
            case '*':
                return this.left.evaluate(f, s, l, c) * this.right.evaluate(f, s, l, c);
            case '/':
                return this.left.evaluate(f, s, l, c) / this.right.evaluate(f, s, l, c);
            case '%':
                return this.left.evaluate(f, s, l, c) % this.right.evaluate(f, s, l, c);
            case '<':
                return this.left.evaluate(f, s, l, c) < this.right.evaluate(f, s, l, c);
            case '>':
                return this.left.evaluate(f, s, l, c) > this.right.evaluate(f, s, l, c);
            case '<=':
                return this.left.evaluate(f, s, l, c) <= this.right.evaluate(f, s, l, c);
            case '>=':
                return this.left.evaluate(f, s, l, c) >= this.right.evaluate(f, s, l, c);
            default:
                throw new Error(`Unknown binary operator: '${this.operation}'`);
        }
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitBinary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class UnaryExpression {
    constructor(operation, expression) {
        this.operation = operation;
        this.expression = expression;
    }
    get $kind() { return 39 /* Unary */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        switch (this.operation) {
            case 'void':
                return void this.expression.evaluate(f, s, l, c);
            case 'typeof':
                return typeof this.expression.evaluate(f | 1 /* isStrictBindingStrategy */, s, l, c);
            case '!':
                return !this.expression.evaluate(f, s, l, c);
            case '-':
                return -this.expression.evaluate(f, s, l, c);
            case '+':
                return +this.expression.evaluate(f, s, l, c);
            default:
                throw new Error(`Unknown unary operator: '${this.operation}'`);
        }
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitUnary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class PrimitiveLiteralExpression {
    constructor(value) {
        this.value = value;
    }
    get $kind() { return 17925 /* PrimitiveLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _l, _c) {
        return this.value;
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitPrimitiveLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);
PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);
PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);
PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);
PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression('');
class HtmlLiteralExpression {
    constructor(parts) {
        this.parts = parts;
    }
    get $kind() { return 51 /* HtmlLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        let result = '';
        for (let i = 0; i < this.parts.length; ++i) {
            const v = this.parts[i].evaluate(f, s, l, c);
            if (v == null) {
                continue;
            }
            result += v;
        }
        return result;
    }
    assign(_f, _s, _l, _obj, _projection) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitHtmlLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ArrayLiteralExpression {
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 17955 /* ArrayLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        return this.elements.map(e => e.evaluate(f, s, l, c));
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitArrayLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
ArrayLiteralExpression.$empty = new ArrayLiteralExpression(emptyArray);
class ObjectLiteralExpression {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 17956 /* ObjectLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        const instance = {};
        for (let i = 0; i < this.keys.length; ++i) {
            instance[this.keys[i]] = this.values[i].evaluate(f, s, l, c);
        }
        return instance;
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitObjectLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
ObjectLiteralExpression.$empty = new ObjectLiteralExpression(emptyArray, emptyArray);
class TemplateExpression {
    constructor(cooked, expressions = emptyArray) {
        this.cooked = cooked;
        this.expressions = expressions;
    }
    get $kind() { return 17958 /* Template */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        let result = this.cooked[0];
        for (let i = 0; i < this.expressions.length; ++i) {
            result += String(this.expressions[i].evaluate(f, s, l, c));
            result += this.cooked[i + 1];
        }
        return result;
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
TemplateExpression.$empty = new TemplateExpression(['']);
class TaggedTemplateExpression {
    constructor(cooked, raw, func, expressions = emptyArray) {
        this.cooked = cooked;
        this.func = func;
        this.expressions = expressions;
        cooked.raw = raw;
    }
    get $kind() { return 1197 /* TaggedTemplate */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        const results = this.expressions.map(e => e.evaluate(f, s, l, c));
        const func = this.func.evaluate(f, s, l, c);
        if (typeof func !== 'function') {
            throw new Error(`Left-hand side of tagged template expression is not a function.`);
        }
        return func(this.cooked, ...results);
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitTaggedTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 65556 /* ArrayBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _l, _c) {
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
        return void 0;
    }
    assign(_f, _s, _l, _obj) {
        // TODO
        return void 0;
    }
    accept(visitor) {
        return visitor.visitArrayBindingPattern(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 65557 /* ObjectBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _l, _c) {
        // TODO
        // similar to array binding ast, this should only come after batch
        // for a single notification per destructing,
        // regardless number of property assignments on the scope binding context
        return void 0;
    }
    assign(_f, _s, _l, _obj) {
        // TODO
        return void 0;
    }
    accept(visitor) {
        return visitor.visitObjectBindingPattern(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class BindingIdentifier {
    constructor(name) {
        this.name = name;
    }
    get $kind() { return 65558 /* BindingIdentifier */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _l, _c) {
        return this.name;
    }
    accept(visitor) {
        return visitor.visitBindingIdentifier(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
const toStringTag$1 = Object.prototype.toString;
// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
class ForOfStatement {
    constructor(declaration, iterable) {
        this.declaration = declaration;
        this.iterable = iterable;
    }
    get $kind() { return 6199 /* ForOfStatement */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        return this.iterable.evaluate(f, s, l, c);
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    count(_f, result) {
        switch (toStringTag$1.call(result)) {
            case '[object Array]': return result.length;
            case '[object Map]': return result.size;
            case '[object Set]': return result.size;
            case '[object Number]': return result;
            case '[object Null]': return 0;
            case '[object Undefined]': return 0;
            default: throw new Error(`Cannot count ${toStringTag$1.call(result)}`);
        }
    }
    // deepscan-disable-next-line
    iterate(f, result, func) {
        switch (toStringTag$1.call(result)) {
            case '[object Array]': return $array(result, func);
            case '[object Map]': return $map(result, func);
            case '[object Set]': return $set$1(result, func);
            case '[object Number]': return $number(result, func);
            case '[object Null]': return;
            case '[object Undefined]': return;
            default: throw new Error(`Cannot iterate over ${toStringTag$1.call(result)}`);
        }
    }
    bind(f, s, b) {
        if (this.iterable.hasBind) {
            this.iterable.bind(f, s, b);
        }
    }
    unbind(f, s, b) {
        if (this.iterable.hasUnbind) {
            this.iterable.unbind(f, s, b);
        }
    }
    accept(visitor) {
        return visitor.visitForOfStatement(this);
    }
    toString() {
        return Unparser.unparse(this);
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
        this.isMulti = expressions.length > 1;
        this.firstExpression = expressions[0];
    }
    get $kind() { return 24 /* Interpolation */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, l, c) {
        if (this.isMulti) {
            let result = this.parts[0];
            for (let i = 0; i < this.expressions.length; ++i) {
                result += String(this.expressions[i].evaluate(f, s, l, c));
                result += this.parts[i + 1];
            }
            return result;
        }
        else {
            return `${this.parts[0]}${this.firstExpression.evaluate(f, s, l, c)}${this.parts[1]}`;
        }
    }
    assign(_f, _s, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitInterpolation(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
function getFunction(f, obj, name) {
    const func = obj == null ? null : obj[name];
    if (typeof func === 'function') {
        return func;
    }
    if (!(f & 8 /* mustEvaluate */) && func == null) {
        return null;
    }
    throw new Error(`Expected '${name}' to be a function`);
}
function $array(result, func) {
    for (let i = 0, ii = result.length; i < ii; ++i) {
        func(result, i, result[i]);
    }
}
function $map(result, func) {
    const arr = Array(result.size);
    let i = -1;
    for (const entry of result.entries()) {
        arr[++i] = entry;
    }
    $array(arr, func);
}
function $set$1(result, func) {
    const arr = Array(result.size);
    let i = -1;
    for (const key of result.keys()) {
        arr[++i] = key;
    }
    $array(arr, func);
}
function $number(result, func) {
    const arr = Array(result);
    for (let i = 0; i < result; ++i) {
        arr[i] = i;
    }
    $array(arr, func);
}

const def = Reflect.defineProperty;
function defineHiddenProp(obj, key, value) {
    def(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value
    });
    return value;
}
function ensureProto(proto, key, defaultValue, force = false) {
    if (force || !Object.prototype.hasOwnProperty.call(proto, key)) {
        defineHiddenProp(proto, key, defaultValue);
    }
}

/*
* Note: the oneTime binding now has a non-zero value for 2 reasons:
*  - plays nicer with bitwise operations (more consistent code, more explicit settings)
*  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
*
* Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
* This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
*/
var BindingMode;
(function (BindingMode) {
    BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
    BindingMode[BindingMode["toView"] = 2] = "toView";
    BindingMode[BindingMode["fromView"] = 4] = "fromView";
    BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
    BindingMode[BindingMode["default"] = 8] = "default";
})(BindingMode || (BindingMode = {}));
var LifecycleFlags;
(function (LifecycleFlags) {
    LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
    // Bitmask for flags that need to be stored on a binding during $bind for mutation
    // callbacks outside of $bind
    LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 961] = "persistentBindingFlags";
    LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 64] = "allowParentScopeTraversal";
    LifecycleFlags[LifecycleFlags["observeLeafPropertiesOnly"] = 128] = "observeLeafPropertiesOnly";
    LifecycleFlags[LifecycleFlags["targetObserverFlags"] = 769] = "targetObserverFlags";
    LifecycleFlags[LifecycleFlags["noFlush"] = 256] = "noFlush";
    LifecycleFlags[LifecycleFlags["persistentTargetObserverQueue"] = 512] = "persistentTargetObserverQueue";
    LifecycleFlags[LifecycleFlags["bindingStrategy"] = 1] = "bindingStrategy";
    LifecycleFlags[LifecycleFlags["isStrictBindingStrategy"] = 1] = "isStrictBindingStrategy";
    LifecycleFlags[LifecycleFlags["fromBind"] = 2] = "fromBind";
    LifecycleFlags[LifecycleFlags["fromUnbind"] = 4] = "fromUnbind";
    LifecycleFlags[LifecycleFlags["mustEvaluate"] = 8] = "mustEvaluate";
    LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 16] = "isTraversingParentScope";
    LifecycleFlags[LifecycleFlags["dispose"] = 32] = "dispose";
})(LifecycleFlags || (LifecycleFlags = {}));
/** @internal */
var SubscriberFlags;
(function (SubscriberFlags) {
    SubscriberFlags[SubscriberFlags["None"] = 0] = "None";
    SubscriberFlags[SubscriberFlags["Subscriber0"] = 1] = "Subscriber0";
    SubscriberFlags[SubscriberFlags["Subscriber1"] = 2] = "Subscriber1";
    SubscriberFlags[SubscriberFlags["Subscriber2"] = 4] = "Subscriber2";
    SubscriberFlags[SubscriberFlags["SubscribersRest"] = 8] = "SubscribersRest";
    SubscriberFlags[SubscriberFlags["Any"] = 15] = "Any";
})(SubscriberFlags || (SubscriberFlags = {}));
var DelegationStrategy;
(function (DelegationStrategy) {
    DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
    DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
    DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
})(DelegationStrategy || (DelegationStrategy = {}));
var CollectionKind;
(function (CollectionKind) {
    CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
    CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
    CollectionKind[CollectionKind["array"] = 9] = "array";
    CollectionKind[CollectionKind["map"] = 6] = "map";
    CollectionKind[CollectionKind["set"] = 7] = "set";
})(CollectionKind || (CollectionKind = {}));
var AccessorType;
(function (AccessorType) {
    AccessorType[AccessorType["None"] = 0] = "None";
    AccessorType[AccessorType["Observer"] = 1] = "Observer";
    AccessorType[AccessorType["Node"] = 2] = "Node";
    // misc characteristic of accessors/observers when update
    //
    // by default, everything is synchronous
    // except changes that are supposed to cause reflow/heavy computation
    // an observer can use this flag to signal binding that don't carelessly tell it to update
    // queue it instead
    // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    // todo: https://csstriggers.com/
    AccessorType[AccessorType["Layout"] = 4] = "Layout";
    // by default, everything is an object
    // eg: a property is accessed on an object
    // unless explicitly not so
    AccessorType[AccessorType["Primtive"] = 8] = "Primtive";
    AccessorType[AccessorType["Array"] = 18] = "Array";
    AccessorType[AccessorType["Set"] = 34] = "Set";
    AccessorType[AccessorType["Map"] = 66] = "Map";
})(AccessorType || (AccessorType = {}));
function copyIndexMap(existing, deletedItems) {
    const { length } = existing;
    const arr = Array(length);
    let i = 0;
    while (i < length) {
        arr[i] = existing[i];
        ++i;
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
    arr.deletedItems = [];
    arr.isIndexMap = true;
    return arr;
}
function cloneIndexMap(indexMap) {
    const clone = indexMap.slice();
    clone.deletedItems = indexMap.deletedItems.slice();
    clone.isIndexMap = true;
    return clone;
}
function isIndexMap(value) {
    return value instanceof Array && value.isIndexMap === true;
}

function subscriberCollection(target) {
    return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target);
}
function subscriberCollectionDeco(target) {
    const proto = target.prototype;
    // not configurable, as in devtool, the getter could be invoked on the prototype,
    // and become permanently broken
    def(proto, 'subs', { get: getSubscriberRecord });
    ensureProto(proto, 'subscribe', addSubscriber);
    ensureProto(proto, 'unsubscribe', removeSubscriber);
}
/* eslint-enable @typescript-eslint/ban-types */
class SubscriberRecord {
    constructor() {
        /**
         * subscriber flags: bits indicating the existence status of the subscribers of this record
         */
        this.sf = 0 /* None */;
        this.count = 0;
    }
    add(subscriber) {
        if (this.has(subscriber)) {
            return false;
        }
        const subscriberFlags = this.sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this.s0 = subscriber;
            this.sf |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this.s1 = subscriber;
            this.sf |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this.s2 = subscriber;
            this.sf |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this.sr = [subscriber];
            this.sf |= 8 /* SubscribersRest */;
        }
        else {
            this.sr.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
        }
        ++this.count;
        return true;
    }
    has(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this.sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this.s0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this.s1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this.s2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            const subscribers = this.sr; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const ii = subscribers.length;
            let i = 0;
            for (; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    any() {
        return this.sf !== 0 /* None */;
    }
    remove(subscriber) {
        const subscriberFlags = this.sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this.s0 === subscriber) {
            this.s0 = void 0;
            this.sf = (this.sf | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this.s1 === subscriber) {
            this.s1 = void 0;
            this.sf = (this.sf | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this.s2 === subscriber) {
            this.s2 = void 0;
            this.sf = (this.sf | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            const subscribers = this.sr; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const ii = subscribers.length;
            let i = 0;
            for (; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this.sf = (this.sf | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    --this.count;
                    return true;
                }
            }
        }
        return false;
    }
    notify(val, oldVal, flags) {
        /**
         * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
         * callSubscribers invocation, so we're caching them all before invoking any.
         * Subscribers added during this invocation are not invoked (and they shouldn't be).
         * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
         * however this is accounted for via $isBound and similar flags on the subscriber objects)
         */
        const sub0 = this.s0;
        const sub1 = this.s1;
        const sub2 = this.s2;
        let subs = this.sr;
        if (subs !== void 0) {
            subs = subs.slice();
        }
        if (sub0 !== void 0) {
            sub0.handleChange(val, oldVal, flags);
        }
        if (sub1 !== void 0) {
            sub1.handleChange(val, oldVal, flags);
        }
        if (sub2 !== void 0) {
            sub2.handleChange(val, oldVal, flags);
        }
        if (subs !== void 0) {
            const ii = subs.length;
            let sub;
            let i = 0;
            for (; i < ii; ++i) {
                sub = subs[i];
                if (sub !== void 0) {
                    sub.handleChange(val, oldVal, flags);
                }
            }
        }
    }
    notifyCollection(indexMap, flags) {
        const sub0 = this.s0;
        const sub1 = this.s1;
        const sub2 = this.s2;
        let subs = this.sr;
        if (subs !== void 0) {
            subs = subs.slice();
        }
        if (sub0 !== void 0) {
            sub0.handleCollectionChange(indexMap, flags);
        }
        if (sub1 !== void 0) {
            sub1.handleCollectionChange(indexMap, flags);
        }
        if (sub2 !== void 0) {
            sub2.handleCollectionChange(indexMap, flags);
        }
        if (subs !== void 0) {
            const ii = subs.length;
            let sub;
            let i = 0;
            for (; i < ii; ++i) {
                sub = subs[i];
                if (sub !== void 0) {
                    sub.handleCollectionChange(indexMap, flags);
                }
            }
        }
    }
}
function getSubscriberRecord() {
    return defineHiddenProp(this, 'subs', new SubscriberRecord());
}
function addSubscriber(subscriber) {
    return this.subs.add(subscriber);
}
function removeSubscriber(subscriber) {
    return this.subs.remove(subscriber);
}

function withFlushQueue(target) {
    return target == null ? queueableDeco : queueableDeco(target);
}
function queueableDeco(target) {
    const proto = target.prototype;
    def(proto, 'queue', { get: getFlushQueue });
}
class FlushQueue {
    constructor() {
        this._flushing = false;
        this._items = new Set();
    }
    get count() {
        return this._items.size;
    }
    add(callable) {
        this._items.add(callable);
        if (this._flushing) {
            return;
        }
        this._flushing = true;
        const items = this._items;
        let item;
        try {
            for (item of items) {
                items.delete(item);
                item.flush();
            }
        }
        finally {
            this._flushing = false;
        }
    }
    clear() {
        this._items.clear();
        this._flushing = false;
    }
}
FlushQueue.instance = new FlushQueue();
function getFlushQueue() {
    return FlushQueue.instance;
}

class CollectionLengthObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.type = 18 /* Array */;
        this.value = this.oldvalue = (this.obj = owner.collection).length;
    }
    getValue() {
        return this.obj.length;
    }
    setValue(newValue, flags) {
        const currentValue = this.value;
        // if in the template, length is two-way bound directly
        // then there's a chance that the new value is invalid
        // add a guard so that we don't accidentally broadcast invalid values
        if (newValue !== currentValue && isArrayIndex(newValue)) {
            if ((flags & 256 /* noFlush */) === 0) {
                this.obj.length = newValue;
            }
            this.value = newValue;
            this.oldvalue = currentValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.length;
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV$2 = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV$2, this.f);
    }
}
class CollectionSizeObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.value = this.oldvalue = (this.obj = owner.collection).size;
        this.type = this.obj instanceof Map ? 66 /* Map */ : 34 /* Set */;
    }
    getValue() {
        return this.obj.size;
    }
    setValue() {
        throw new Error('Map/Set "size" is a readonly property');
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.size;
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV$2 = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV$2, this.f);
    }
}
function implementLengthObserver(klass) {
    const proto = klass.prototype;
    ensureProto(proto, 'subscribe', subscribe, true);
    ensureProto(proto, 'unsubscribe', unsubscribe, true);
    withFlushQueue(klass);
    subscriberCollection(klass);
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
implementLengthObserver(CollectionLengthObserver);
implementLengthObserver(CollectionSizeObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$2 = void 0;

const observerLookup$2 = new WeakMap();
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
const proto$2 = Array.prototype;
const $push = proto$2.push;
const $unshift = proto$2.unshift;
const $pop = proto$2.pop;
const $shift = proto$2.shift;
const $splice = proto$2.splice;
const $reverse = proto$2.reverse;
const $sort = proto$2.sort;
const native$2 = { push: $push, unshift: $unshift, pop: $pop, shift: $shift, splice: $splice, reverse: $reverse, sort: $sort };
const methods$2 = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'];
const observe$3 = {
    // https://tc39.github.io/ecma262/#sec-array.prototype.push
    push: function (...args) {
        const o = observerLookup$2.get(this);
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
        const o = observerLookup$2.get(this);
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
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $pop.call(this);
        }
        const indexMap = o.indexMap;
        const element = $pop.call(this);
        // only mark indices as deleted if they actually existed in the original array
        const index = indexMap.length - 1;
        if (indexMap[index] > -1) {
            indexMap.deletedItems.push(indexMap[index]);
        }
        $pop.call(indexMap);
        o.notify();
        return element;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.shift
    shift: function () {
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $shift.call(this);
        }
        const indexMap = o.indexMap;
        const element = $shift.call(this);
        // only mark indices as deleted if they actually existed in the original array
        if (indexMap[0] > -1) {
            indexMap.deletedItems.push(indexMap[0]);
        }
        $shift.call(indexMap);
        o.notify();
        return element;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.splice
    splice: function (...args) {
        const start = args[0];
        const deleteCount = args[1];
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $splice.apply(this, args);
        }
        const len = this.length;
        const relativeStart = start | 0;
        const actualStart = relativeStart < 0 ? Math.max((len + relativeStart), 0) : Math.min(relativeStart, len);
        const indexMap = o.indexMap;
        const argCount = args.length;
        const actualDeleteCount = argCount === 0 ? 0 : argCount === 1 ? len - actualStart : deleteCount;
        if (actualDeleteCount > 0) {
            let i = actualStart;
            const to = i + actualDeleteCount;
            while (i < to) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                i++;
            }
        }
        if (argCount > 2) {
            const itemCount = argCount - 2;
            const inserts = new Array(itemCount);
            let i = 0;
            while (i < itemCount) {
                inserts[i++] = -2;
            }
            $splice.call(indexMap, start, deleteCount, ...inserts);
        }
        else {
            $splice.apply(indexMap, args);
        }
        const deleted = $splice.apply(this, args);
        o.notify();
        return deleted;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
    reverse: function () {
        const o = observerLookup$2.get(this);
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
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            $sort.call(this, compareFn);
            return this;
        }
        const len = this.length;
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
        if (compareFn === void 0 || typeof compareFn !== 'function' /* spec says throw a TypeError, should we do that too? */) {
            compareFn = sortCompare;
        }
        quickSort(this, o.indexMap, 0, i, compareFn);
        o.notify();
        return this;
    }
};
for (const method of methods$2) {
    def(observe$3[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableArrayObservationCalled = false;
function enableArrayObservation() {
    for (const method of methods$2) {
        if (proto$2[method].observing !== true) {
            defineHiddenProp(proto$2, method, observe$3[method]);
        }
    }
}
function disableArrayObservation() {
    for (const method of methods$2) {
        if (proto$2[method].observing === true) {
            defineHiddenProp(proto$2, method, native$2[method]);
        }
    }
}
class ArrayObserver {
    constructor(array) {
        this.type = 18 /* Array */;
        if (!enableArrayObservationCalled) {
            enableArrayObservationCalled = true;
            enableArrayObservation();
        }
        this.indexObservers = {};
        this.collection = array;
        this.indexMap = createIndexMap(array.length);
        this.lenObs = void 0;
        observerLookup$2.set(array, this);
    }
    notify() {
        const indexMap = this.indexMap;
        const length = this.collection.length;
        this.indexMap = createIndexMap(length);
        this.subs.notifyCollection(indexMap, 0 /* none */);
    }
    getLengthObserver() {
        var _a;
        return (_a = this.lenObs) !== null && _a !== void 0 ? _a : (this.lenObs = new CollectionLengthObserver(this));
    }
    getIndexObserver(index) {
        var _a;
        var _b;
        // It's unnecessary to destroy/recreate index observer all the time,
        // so just create once, and add/remove instead
        return (_a = (_b = this.indexObservers)[index]) !== null && _a !== void 0 ? _a : (_b[index] = new ArrayIndexObserver(this, index));
    }
}
class ArrayIndexObserver {
    constructor(owner, index) {
        this.owner = owner;
        this.index = index;
        this.doNotCache = true;
        this.value = this.getValue();
    }
    getValue() {
        return this.owner.collection[this.index];
    }
    setValue(newValue, flags) {
        if (newValue === this.getValue()) {
            return;
        }
        const arrayObserver = this.owner;
        const index = this.index;
        const indexMap = arrayObserver.indexMap;
        if (indexMap[index] > -1) {
            indexMap.deletedItems.push(indexMap[index]);
        }
        indexMap[index] = -2;
        // do not need to update current value here
        // as it will be updated inside handle collection change
        arrayObserver.collection[index] = newValue;
        arrayObserver.notify();
    }
    /**
     * From interface `ICollectionSubscriber`
     */
    handleCollectionChange(indexMap, flags) {
        const index = this.index;
        const noChange = indexMap[index] === index;
        if (noChange) {
            return;
        }
        const prevValue = this.value;
        const currValue = this.value = this.getValue();
        // hmm
        if (prevValue !== currValue) {
            this.subs.notify(currValue, prevValue, flags);
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
subscriberCollection(ArrayObserver);
subscriberCollection(ArrayIndexObserver);
function getArrayObserver(array) {
    let observer = observerLookup$2.get(array);
    if (observer === void 0) {
        observer = new ArrayObserver(array);
    }
    return observer;
}
/**
 * Applies offsets to the non-negative indices in the IndexMap
 * based on added and deleted items relative to those indices.
 *
 * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
 * used for sorting/reordering items if needed
 */
function applyMutationsToIndices(indexMap) {
    let offset = 0;
    let j = 0;
    const len = indexMap.length;
    for (let i = 0; i < len; ++i) {
        while (indexMap.deletedItems[j] <= i - offset) {
            ++j;
            --offset;
        }
        if (indexMap[i] === -2) {
            ++offset;
        }
        else {
            indexMap[i] += offset;
        }
    }
}
/**
 * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
 * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
 */
function synchronizeIndices(items, indexMap) {
    const copy = items.slice();
    const len = indexMap.length;
    let to = 0;
    let from = 0;
    while (to < len) {
        from = indexMap[to];
        if (from !== -2) {
            items[to] = copy[from];
        }
        ++to;
    }
}

const observerLookup$1 = new WeakMap();
const proto$1 = Set.prototype;
const $add = proto$1.add;
const $clear$1 = proto$1.clear;
const $delete$1 = proto$1.delete;
const native$1 = { add: $add, clear: $clear$1, delete: $delete$1 };
const methods$1 = ['add', 'clear', 'delete'];
// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap
const observe$2 = {
    // https://tc39.github.io/ecma262/#sec-set.prototype.add
    add: function (value) {
        const o = observerLookup$1.get(this);
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
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            return $clear$1.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            // deepscan-disable-next-line
            for (const _ of this.keys()) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                i++;
            }
            $clear$1.call(this);
            indexMap.length = 0;
            o.notify();
        }
        return undefined;
    },
    // https://tc39.github.io/ecma262/#sec-set.prototype.delete
    delete: function (value) {
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            return $delete$1.call(this, value);
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
                    indexMap.deletedItems.push(indexMap[i]);
                }
                indexMap.splice(i, 1);
                const deleteResult = $delete$1.call(this, value);
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
const descriptorProps$1 = {
    writable: true,
    enumerable: false,
    configurable: true
};
for (const method of methods$1) {
    def(observe$2[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableSetObservationCalled = false;
function enableSetObservation() {
    for (const method of methods$1) {
        if (proto$1[method].observing !== true) {
            def(proto$1, method, { ...descriptorProps$1, value: observe$2[method] });
        }
    }
}
function disableSetObservation() {
    for (const method of methods$1) {
        if (proto$1[method].observing === true) {
            def(proto$1, method, { ...descriptorProps$1, value: native$1[method] });
        }
    }
}
class SetObserver {
    constructor(observedSet) {
        this.type = 34 /* Set */;
        if (!enableSetObservationCalled) {
            enableSetObservationCalled = true;
            enableSetObservation();
        }
        this.collection = observedSet;
        this.indexMap = createIndexMap(observedSet.size);
        this.lenObs = void 0;
        observerLookup$1.set(observedSet, this);
    }
    notify() {
        const indexMap = this.indexMap;
        const size = this.collection.size;
        this.indexMap = createIndexMap(size);
        this.subs.notifyCollection(indexMap, 0 /* none */);
    }
    getLengthObserver() {
        var _a;
        return (_a = this.lenObs) !== null && _a !== void 0 ? _a : (this.lenObs = new CollectionSizeObserver(this));
    }
}
subscriberCollection(SetObserver);
function getSetObserver(observedSet) {
    let observer = observerLookup$1.get(observedSet);
    if (observer === void 0) {
        observer = new SetObserver(observedSet);
    }
    return observer;
}

const observerLookup = new WeakMap();
const proto = Map.prototype;
const $set = proto.set;
const $clear = proto.clear;
const $delete = proto.delete;
const native = { set: $set, clear: $clear, delete: $delete };
const methods = ['set', 'clear', 'delete'];
// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap
const observe$1 = {
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
                        o.indexMap.deletedItems.push(o.indexMap[i]);
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
            for (const _ of this.keys()) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
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
                    indexMap.deletedItems.push(indexMap[i]);
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
const descriptorProps = {
    writable: true,
    enumerable: false,
    configurable: true
};
for (const method of methods) {
    def(observe$1[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableMapObservationCalled = false;
function enableMapObservation() {
    for (const method of methods) {
        if (proto[method].observing !== true) {
            def(proto, method, { ...descriptorProps, value: observe$1[method] });
        }
    }
}
function disableMapObservation() {
    for (const method of methods) {
        if (proto[method].observing === true) {
            def(proto, method, { ...descriptorProps, value: native[method] });
        }
    }
}
class MapObserver {
    constructor(map) {
        this.type = 66 /* Map */;
        if (!enableMapObservationCalled) {
            enableMapObservationCalled = true;
            enableMapObservation();
        }
        this.collection = map;
        this.indexMap = createIndexMap(map.size);
        this.lenObs = void 0;
        observerLookup.set(map, this);
    }
    notify() {
        const indexMap = this.indexMap;
        const size = this.collection.size;
        this.indexMap = createIndexMap(size);
        this.subs.notifyCollection(indexMap, 0 /* none */);
    }
    getLengthObserver() {
        var _a;
        return (_a = this.lenObs) !== null && _a !== void 0 ? _a : (this.lenObs = new CollectionSizeObserver(this));
    }
}
subscriberCollection(MapObserver);
function getMapObserver(map) {
    let observer = observerLookup.get(map);
    if (observer === void 0) {
        observer = new MapObserver(map);
    }
    return observer;
}

function observe(obj, key) {
    const observer = this.oL.getObserver(obj, key);
    /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
     *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
     *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
     *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
     *
     * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
     */
    this.obs.add(observer);
}
function getObserverRecord() {
    return defineHiddenProp(this, 'obs', new BindingObserverRecord(this));
}
function observeCollection(collection) {
    let obs;
    if (collection instanceof Array) {
        obs = getArrayObserver(collection);
    }
    else if (collection instanceof Set) {
        obs = getSetObserver(collection);
    }
    else if (collection instanceof Map) {
        obs = getMapObserver(collection);
    }
    else {
        throw new Error('Unrecognised collection type.');
    }
    this.obs.add(obs);
}
function subscribeTo(subscribable) {
    this.obs.add(subscribable);
}
function noopHandleChange() {
    throw new Error('method "handleChange" not implemented');
}
function noopHandleCollectionChange() {
    throw new Error('method "handleCollectionChange" not implemented');
}
class BindingObserverRecord {
    constructor(binding) {
        this.binding = binding;
        this.version = 0;
        this.count = 0;
        this.slots = 0;
    }
    handleChange(value, oldValue, flags) {
        return this.binding.interceptor.handleChange(value, oldValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.binding.interceptor.handleCollectionChange(indexMap, flags);
    }
    /**
     * Add, and subscribe to a given observer
     */
    add(observer) {
        // find the observer.
        const observerSlots = this.slots;
        let i = observerSlots;
        // find the slot number of the observer
        while (i-- && this[`o${i}`] !== observer)
            ;
        // if we are not already observing, put the observer in an open slot and subscribe.
        if (i === -1) {
            i = 0;
            // go from the start, find an open slot number
            while (this[`o${i}`] !== void 0) {
                i++;
            }
            // store the reference to the observer and subscribe
            this[`o${i}`] = observer;
            observer.subscribe(this);
            // increment the slot count.
            if (i === observerSlots) {
                this.slots = i + 1;
            }
            ++this.count;
        }
        this[`v${i}`] = this.version;
    }
    /**
     * Unsubscribe the observers that are not up to date with the record version
     */
    clear(all) {
        const slotCount = this.slots;
        let slotName;
        let observer;
        let i = 0;
        if (all === true) {
            for (; i < slotCount; ++i) {
                slotName = `o${i}`;
                observer = this[slotName];
                if (observer !== void 0) {
                    this[slotName] = void 0;
                    observer.unsubscribe(this);
                }
            }
            this.count = this.slots = 0;
        }
        else {
            for (; i < slotCount; ++i) {
                if (this[`v${i}`] !== this.version) {
                    slotName = `o${i}`;
                    observer = this[slotName];
                    if (observer !== void 0) {
                        this[slotName] = void 0;
                        observer.unsubscribe(this);
                        this.count--;
                    }
                }
            }
        }
    }
}
function connectableDecorator(target) {
    const proto = target.prototype;
    ensureProto(proto, 'observe', observe, true);
    ensureProto(proto, 'observeCollection', observeCollection, true);
    ensureProto(proto, 'subscribeTo', subscribeTo, true);
    def(proto, 'obs', { get: getObserverRecord });
    // optionally add these two methods to normalize a connectable impl
    ensureProto(proto, 'handleChange', noopHandleChange);
    ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);
    return target;
}
function connectable(target) {
    return target == null ? connectableDecorator : connectableDecorator(target);
}
class BindingMediator {
    constructor(key, binding, oL, locator) {
        this.key = key;
        this.binding = binding;
        this.oL = oL;
        this.locator = locator;
        this.interceptor = this;
    }
    $bind() {
        throw new Error('Method not implemented.');
    }
    $unbind() {
        throw new Error('Method not implemented.');
    }
    handleChange(newValue, previousValue, flags) {
        this.binding[this.key](newValue, previousValue, flags);
    }
}
connectableDecorator(BindingMediator);

const IExpressionParser = DI.createInterface('IExpressionParser', x => x.singleton(ExpressionParser));
class ExpressionParser {
    constructor() {
        this.expressionLookup = Object.create(null);
        this.forOfLookup = Object.create(null);
        this.interpolationLookup = Object.create(null);
    }
    parse(expression, bindingType) {
        switch (bindingType) {
            case 2048 /* Interpolation */: {
                let found = this.interpolationLookup[expression];
                if (found === void 0) {
                    found = this.interpolationLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
            case 539 /* ForCommand */: {
                let found = this.forOfLookup[expression];
                if (found === void 0) {
                    found = this.forOfLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
            default: {
                // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                // But don't cache it, because empty strings are always invalid for any other type of binding
                if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                    return PrimitiveLiteralExpression.$empty;
                }
                let found = this.expressionLookup[expression];
                if (found === void 0) {
                    found = this.expressionLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
        }
    }
    $parse(expression, bindingType) {
        $state.input = expression;
        $state.length = expression.length;
        $state.index = 0;
        $state.currentChar = expression.charCodeAt(0);
        return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
    }
}
var Char;
(function (Char) {
    Char[Char["Null"] = 0] = "Null";
    Char[Char["Backspace"] = 8] = "Backspace";
    Char[Char["Tab"] = 9] = "Tab";
    Char[Char["LineFeed"] = 10] = "LineFeed";
    Char[Char["VerticalTab"] = 11] = "VerticalTab";
    Char[Char["FormFeed"] = 12] = "FormFeed";
    Char[Char["CarriageReturn"] = 13] = "CarriageReturn";
    Char[Char["Space"] = 32] = "Space";
    Char[Char["Exclamation"] = 33] = "Exclamation";
    Char[Char["DoubleQuote"] = 34] = "DoubleQuote";
    Char[Char["Dollar"] = 36] = "Dollar";
    Char[Char["Percent"] = 37] = "Percent";
    Char[Char["Ampersand"] = 38] = "Ampersand";
    Char[Char["SingleQuote"] = 39] = "SingleQuote";
    Char[Char["OpenParen"] = 40] = "OpenParen";
    Char[Char["CloseParen"] = 41] = "CloseParen";
    Char[Char["Asterisk"] = 42] = "Asterisk";
    Char[Char["Plus"] = 43] = "Plus";
    Char[Char["Comma"] = 44] = "Comma";
    Char[Char["Minus"] = 45] = "Minus";
    Char[Char["Dot"] = 46] = "Dot";
    Char[Char["Slash"] = 47] = "Slash";
    Char[Char["Semicolon"] = 59] = "Semicolon";
    Char[Char["Backtick"] = 96] = "Backtick";
    Char[Char["OpenBracket"] = 91] = "OpenBracket";
    Char[Char["Backslash"] = 92] = "Backslash";
    Char[Char["CloseBracket"] = 93] = "CloseBracket";
    Char[Char["Caret"] = 94] = "Caret";
    Char[Char["Underscore"] = 95] = "Underscore";
    Char[Char["OpenBrace"] = 123] = "OpenBrace";
    Char[Char["Bar"] = 124] = "Bar";
    Char[Char["CloseBrace"] = 125] = "CloseBrace";
    Char[Char["Colon"] = 58] = "Colon";
    Char[Char["LessThan"] = 60] = "LessThan";
    Char[Char["Equals"] = 61] = "Equals";
    Char[Char["GreaterThan"] = 62] = "GreaterThan";
    Char[Char["Question"] = 63] = "Question";
    Char[Char["Zero"] = 48] = "Zero";
    Char[Char["One"] = 49] = "One";
    Char[Char["Two"] = 50] = "Two";
    Char[Char["Three"] = 51] = "Three";
    Char[Char["Four"] = 52] = "Four";
    Char[Char["Five"] = 53] = "Five";
    Char[Char["Six"] = 54] = "Six";
    Char[Char["Seven"] = 55] = "Seven";
    Char[Char["Eight"] = 56] = "Eight";
    Char[Char["Nine"] = 57] = "Nine";
    Char[Char["UpperA"] = 65] = "UpperA";
    Char[Char["UpperB"] = 66] = "UpperB";
    Char[Char["UpperC"] = 67] = "UpperC";
    Char[Char["UpperD"] = 68] = "UpperD";
    Char[Char["UpperE"] = 69] = "UpperE";
    Char[Char["UpperF"] = 70] = "UpperF";
    Char[Char["UpperG"] = 71] = "UpperG";
    Char[Char["UpperH"] = 72] = "UpperH";
    Char[Char["UpperI"] = 73] = "UpperI";
    Char[Char["UpperJ"] = 74] = "UpperJ";
    Char[Char["UpperK"] = 75] = "UpperK";
    Char[Char["UpperL"] = 76] = "UpperL";
    Char[Char["UpperM"] = 77] = "UpperM";
    Char[Char["UpperN"] = 78] = "UpperN";
    Char[Char["UpperO"] = 79] = "UpperO";
    Char[Char["UpperP"] = 80] = "UpperP";
    Char[Char["UpperQ"] = 81] = "UpperQ";
    Char[Char["UpperR"] = 82] = "UpperR";
    Char[Char["UpperS"] = 83] = "UpperS";
    Char[Char["UpperT"] = 84] = "UpperT";
    Char[Char["UpperU"] = 85] = "UpperU";
    Char[Char["UpperV"] = 86] = "UpperV";
    Char[Char["UpperW"] = 87] = "UpperW";
    Char[Char["UpperX"] = 88] = "UpperX";
    Char[Char["UpperY"] = 89] = "UpperY";
    Char[Char["UpperZ"] = 90] = "UpperZ";
    Char[Char["LowerA"] = 97] = "LowerA";
    Char[Char["LowerB"] = 98] = "LowerB";
    Char[Char["LowerC"] = 99] = "LowerC";
    Char[Char["LowerD"] = 100] = "LowerD";
    Char[Char["LowerE"] = 101] = "LowerE";
    Char[Char["LowerF"] = 102] = "LowerF";
    Char[Char["LowerG"] = 103] = "LowerG";
    Char[Char["LowerH"] = 104] = "LowerH";
    Char[Char["LowerI"] = 105] = "LowerI";
    Char[Char["LowerJ"] = 106] = "LowerJ";
    Char[Char["LowerK"] = 107] = "LowerK";
    Char[Char["LowerL"] = 108] = "LowerL";
    Char[Char["LowerM"] = 109] = "LowerM";
    Char[Char["LowerN"] = 110] = "LowerN";
    Char[Char["LowerO"] = 111] = "LowerO";
    Char[Char["LowerP"] = 112] = "LowerP";
    Char[Char["LowerQ"] = 113] = "LowerQ";
    Char[Char["LowerR"] = 114] = "LowerR";
    Char[Char["LowerS"] = 115] = "LowerS";
    Char[Char["LowerT"] = 116] = "LowerT";
    Char[Char["LowerU"] = 117] = "LowerU";
    Char[Char["LowerV"] = 118] = "LowerV";
    Char[Char["LowerW"] = 119] = "LowerW";
    Char[Char["LowerX"] = 120] = "LowerX";
    Char[Char["LowerY"] = 121] = "LowerY";
    Char[Char["LowerZ"] = 122] = "LowerZ";
})(Char || (Char = {}));
function unescapeCode(code) {
    switch (code) {
        case 98 /* LowerB */: return 8 /* Backspace */;
        case 116 /* LowerT */: return 9 /* Tab */;
        case 110 /* LowerN */: return 10 /* LineFeed */;
        case 118 /* LowerV */: return 11 /* VerticalTab */;
        case 102 /* LowerF */: return 12 /* FormFeed */;
        case 114 /* LowerR */: return 13 /* CarriageReturn */;
        case 34 /* DoubleQuote */: return 34 /* DoubleQuote */;
        case 39 /* SingleQuote */: return 39 /* SingleQuote */;
        case 92 /* Backslash */: return 92 /* Backslash */;
        default: return code;
    }
}
var Access;
(function (Access) {
    Access[Access["Reset"] = 0] = "Reset";
    Access[Access["Ancestor"] = 511] = "Ancestor";
    Access[Access["This"] = 512] = "This";
    Access[Access["Scope"] = 1024] = "Scope";
    Access[Access["Member"] = 2048] = "Member";
    Access[Access["Keyed"] = 4096] = "Keyed";
})(Access || (Access = {}));
var Precedence;
(function (Precedence) {
    Precedence[Precedence["Variadic"] = 61] = "Variadic";
    Precedence[Precedence["Assign"] = 62] = "Assign";
    Precedence[Precedence["Conditional"] = 63] = "Conditional";
    Precedence[Precedence["LogicalOR"] = 64] = "LogicalOR";
    Precedence[Precedence["LogicalAND"] = 128] = "LogicalAND";
    Precedence[Precedence["Equality"] = 192] = "Equality";
    Precedence[Precedence["Relational"] = 256] = "Relational";
    Precedence[Precedence["Additive"] = 320] = "Additive";
    Precedence[Precedence["Multiplicative"] = 384] = "Multiplicative";
    Precedence[Precedence["Binary"] = 448] = "Binary";
    Precedence[Precedence["LeftHandSide"] = 449] = "LeftHandSide";
    Precedence[Precedence["Primary"] = 450] = "Primary";
    Precedence[Precedence["Unary"] = 451] = "Unary";
})(Precedence || (Precedence = {}));
var Token;
(function (Token) {
    Token[Token["EOF"] = 1572864] = "EOF";
    Token[Token["ExpressionTerminal"] = 1048576] = "ExpressionTerminal";
    Token[Token["AccessScopeTerminal"] = 524288] = "AccessScopeTerminal";
    Token[Token["ClosingToken"] = 262144] = "ClosingToken";
    Token[Token["OpeningToken"] = 131072] = "OpeningToken";
    Token[Token["BinaryOp"] = 65536] = "BinaryOp";
    Token[Token["UnaryOp"] = 32768] = "UnaryOp";
    Token[Token["LeftHandSide"] = 16384] = "LeftHandSide";
    Token[Token["StringOrNumericLiteral"] = 12288] = "StringOrNumericLiteral";
    Token[Token["NumericLiteral"] = 8192] = "NumericLiteral";
    Token[Token["StringLiteral"] = 4096] = "StringLiteral";
    Token[Token["IdentifierName"] = 3072] = "IdentifierName";
    Token[Token["Keyword"] = 2048] = "Keyword";
    Token[Token["Identifier"] = 1024] = "Identifier";
    Token[Token["Contextual"] = 512] = "Contextual";
    Token[Token["Precedence"] = 448] = "Precedence";
    Token[Token["Type"] = 63] = "Type";
    Token[Token["FalseKeyword"] = 2048] = "FalseKeyword";
    Token[Token["TrueKeyword"] = 2049] = "TrueKeyword";
    Token[Token["NullKeyword"] = 2050] = "NullKeyword";
    Token[Token["UndefinedKeyword"] = 2051] = "UndefinedKeyword";
    Token[Token["ThisScope"] = 3076] = "ThisScope";
    // HostScope               = 0b000000000110_000_000101,
    Token[Token["ParentScope"] = 3078] = "ParentScope";
    Token[Token["OpenParen"] = 671751] = "OpenParen";
    Token[Token["OpenBrace"] = 131080] = "OpenBrace";
    Token[Token["Dot"] = 16393] = "Dot";
    Token[Token["CloseBrace"] = 1835018] = "CloseBrace";
    Token[Token["CloseParen"] = 1835019] = "CloseParen";
    Token[Token["Comma"] = 1572876] = "Comma";
    Token[Token["OpenBracket"] = 671757] = "OpenBracket";
    Token[Token["CloseBracket"] = 1835022] = "CloseBracket";
    Token[Token["Colon"] = 1572879] = "Colon";
    Token[Token["Question"] = 1572880] = "Question";
    Token[Token["Ampersand"] = 1572883] = "Ampersand";
    Token[Token["Bar"] = 1572884] = "Bar";
    Token[Token["BarBar"] = 1638549] = "BarBar";
    Token[Token["AmpersandAmpersand"] = 1638614] = "AmpersandAmpersand";
    Token[Token["EqualsEquals"] = 1638679] = "EqualsEquals";
    Token[Token["ExclamationEquals"] = 1638680] = "ExclamationEquals";
    Token[Token["EqualsEqualsEquals"] = 1638681] = "EqualsEqualsEquals";
    Token[Token["ExclamationEqualsEquals"] = 1638682] = "ExclamationEqualsEquals";
    Token[Token["LessThan"] = 1638747] = "LessThan";
    Token[Token["GreaterThan"] = 1638748] = "GreaterThan";
    Token[Token["LessThanEquals"] = 1638749] = "LessThanEquals";
    Token[Token["GreaterThanEquals"] = 1638750] = "GreaterThanEquals";
    Token[Token["InKeyword"] = 1640799] = "InKeyword";
    Token[Token["InstanceOfKeyword"] = 1640800] = "InstanceOfKeyword";
    Token[Token["Plus"] = 623009] = "Plus";
    Token[Token["Minus"] = 623010] = "Minus";
    Token[Token["TypeofKeyword"] = 34851] = "TypeofKeyword";
    Token[Token["VoidKeyword"] = 34852] = "VoidKeyword";
    Token[Token["Asterisk"] = 1638885] = "Asterisk";
    Token[Token["Percent"] = 1638886] = "Percent";
    Token[Token["Slash"] = 1638887] = "Slash";
    Token[Token["Equals"] = 1048616] = "Equals";
    Token[Token["Exclamation"] = 32809] = "Exclamation";
    Token[Token["TemplateTail"] = 540714] = "TemplateTail";
    Token[Token["TemplateContinuation"] = 540715] = "TemplateContinuation";
    Token[Token["OfKeyword"] = 1051180] = "OfKeyword";
})(Token || (Token = {}));
const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $this = AccessThisExpression.$this;
const $parent = AccessThisExpression.$parent;
var BindingType;
(function (BindingType) {
    BindingType[BindingType["None"] = 0] = "None";
    // if a binding command is taking over the processing of an attribute
    // then it should add this flag to its binding type
    // which then tell the binder to proceed the attribute compilation as is,
    // instead of normal process: transformation -> compilation
    BindingType[BindingType["IgnoreAttr"] = 4096] = "IgnoreAttr";
    BindingType[BindingType["Interpolation"] = 2048] = "Interpolation";
    BindingType[BindingType["IsRef"] = 5376] = "IsRef";
    BindingType[BindingType["IsIterator"] = 512] = "IsIterator";
    BindingType[BindingType["IsCustom"] = 256] = "IsCustom";
    BindingType[BindingType["IsFunction"] = 128] = "IsFunction";
    BindingType[BindingType["IsEvent"] = 64] = "IsEvent";
    BindingType[BindingType["IsProperty"] = 32] = "IsProperty";
    BindingType[BindingType["IsCommand"] = 16] = "IsCommand";
    BindingType[BindingType["IsPropertyCommand"] = 48] = "IsPropertyCommand";
    BindingType[BindingType["IsEventCommand"] = 80] = "IsEventCommand";
    BindingType[BindingType["DelegationStrategyDelta"] = 6] = "DelegationStrategyDelta";
    BindingType[BindingType["Command"] = 15] = "Command";
    BindingType[BindingType["OneTimeCommand"] = 49] = "OneTimeCommand";
    BindingType[BindingType["ToViewCommand"] = 50] = "ToViewCommand";
    BindingType[BindingType["FromViewCommand"] = 51] = "FromViewCommand";
    BindingType[BindingType["TwoWayCommand"] = 52] = "TwoWayCommand";
    BindingType[BindingType["BindCommand"] = 53] = "BindCommand";
    BindingType[BindingType["TriggerCommand"] = 4182] = "TriggerCommand";
    BindingType[BindingType["CaptureCommand"] = 4183] = "CaptureCommand";
    BindingType[BindingType["DelegateCommand"] = 4184] = "DelegateCommand";
    BindingType[BindingType["CallCommand"] = 153] = "CallCommand";
    BindingType[BindingType["OptionsCommand"] = 26] = "OptionsCommand";
    BindingType[BindingType["ForCommand"] = 539] = "ForCommand";
    BindingType[BindingType["CustomCommand"] = 284] = "CustomCommand";
})(BindingType || (BindingType = {}));
/* eslint-enable @typescript-eslint/indent */
/** @internal */
class ParserState {
    constructor(input) {
        this.input = input;
        this.index = 0;
        this.startIndex = 0;
        this.lastIndex = 0;
        this.currentToken = 1572864 /* EOF */;
        this.tokenValue = '';
        this.assignable = true;
        this.length = input.length;
        this.currentChar = input.charCodeAt(0);
    }
    get tokenRaw() {
        return this.input.slice(this.startIndex, this.index);
    }
}
const $state = new ParserState('');
/** @internal */
function parseExpression(input, bindingType) {
    $state.input = input;
    $state.length = input.length;
    $state.index = 0;
    $state.currentChar = input.charCodeAt(0);
    return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
}
/** @internal */
// This is performance-critical code which follows a subset of the well-known ES spec.
// Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
// single source of information for being able to figure it out.
// It generally does not need to change unless the spec changes or spec violations are found, or optimization
// opportunities are found (which would likely not fix these warnings in any case).
// It's therefore not considered to have any tangible impact on the maintainability of the code base.
// For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
// eslint-disable-next-line max-lines-per-function
function parse(state, access, minPrecedence, bindingType) {
    if (bindingType === 284 /* CustomCommand */) {
        return new CustomExpression(state.input);
    }
    if (state.index === 0) {
        if (bindingType & 2048 /* Interpolation */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseInterpolation(state);
        }
        nextToken(state);
        if (state.currentToken & 1048576 /* ExpressionTerminal */) {
            throw new Error(`Invalid start of expression: '${state.input}'`);
        }
    }
    state.assignable = 448 /* Binary */ > minPrecedence;
    let result = void 0;
    if (state.currentToken & 32768 /* UnaryOp */) {
        /** parseUnaryExpression
         * https://tc39.github.io/ecma262/#sec-unary-operators
         *
         * UnaryExpression :
         * 1. LeftHandSideExpression
         * 2. void UnaryExpression
         * 3. typeof UnaryExpression
         * 4. + UnaryExpression
         * 5. - UnaryExpression
         * 6. ! UnaryExpression
         *
         * IsValidAssignmentTarget
         * 2,3,4,5,6 = false
         * 1 = see parseLeftHandSideExpression
         *
         * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
         */
        const op = TokenValues[state.currentToken & 63 /* Type */];
        nextToken(state);
        result = new UnaryExpression(op, parse(state, access, 449 /* LeftHandSide */, bindingType));
        state.assignable = false;
    }
    else {
        /** parsePrimaryExpression
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
        primary: switch (state.currentToken) {
            case 3078 /* ParentScope */: // $parent
                state.assignable = false;
                do {
                    nextToken(state);
                    access++; // ancestor
                    if (consumeOpt(state, 16393 /* Dot */)) {
                        if (state.currentToken === 16393 /* Dot */) {
                            throw new Error(`Double dot and spread operators are not supported: '${state.input}'`);
                        }
                        else if (state.currentToken === 1572864 /* EOF */) {
                            throw new Error(`Expected identifier: '${state.input}'`);
                        }
                    }
                    else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                        const ancestor = access & 511 /* Ancestor */;
                        result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                        access = 512 /* This */;
                        break primary;
                    }
                    else {
                        throw new Error(`Invalid member expression: '${state.input}'`);
                    }
                } while (state.currentToken === 3078 /* ParentScope */);
            // falls through
            case 1024 /* Identifier */: // identifier
                if (bindingType & 512 /* IsIterator */) {
                    result = new BindingIdentifier(state.tokenValue);
                }
                else {
                    result = new AccessScopeExpression(state.tokenValue, access & 511 /* Ancestor */);
                    access = 1024 /* Scope */;
                }
                state.assignable = true;
                nextToken(state);
                break;
            case 3076 /* ThisScope */: // $this
                state.assignable = false;
                nextToken(state);
                result = $this;
                access = 512 /* This */;
                break;
            case 671751 /* OpenParen */: // parenthesized expression
                nextToken(state);
                result = parse(state, 0 /* Reset */, 62 /* Assign */, bindingType);
                consume(state, 1835019 /* CloseParen */);
                access = 0 /* Reset */;
                break;
            case 671757 /* OpenBracket */:
                result = parseArrayLiteralExpression(state, access, bindingType);
                access = 0 /* Reset */;
                break;
            case 131080 /* OpenBrace */:
                result = parseObjectLiteralExpression(state, bindingType);
                access = 0 /* Reset */;
                break;
            case 540714 /* TemplateTail */:
                result = new TemplateExpression([state.tokenValue]);
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            case 540715 /* TemplateContinuation */:
                result = parseTemplate(state, access, bindingType, result, false);
                access = 0 /* Reset */;
                break;
            case 4096 /* StringLiteral */:
            case 8192 /* NumericLiteral */:
                result = new PrimitiveLiteralExpression(state.tokenValue);
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            case 2050 /* NullKeyword */:
            case 2051 /* UndefinedKeyword */:
            case 2049 /* TrueKeyword */:
            case 2048 /* FalseKeyword */:
                result = TokenValues[state.currentToken & 63 /* Type */];
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            default:
                if (state.index >= state.length) {
                    throw new Error(`Unexpected end of expression: '${state.input}'`);
                }
                else {
                    throw new Error(`Unconsumed token: '${state.input}'`);
                }
        }
        if (bindingType & 512 /* IsIterator */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseForOfStatement(state, result);
        }
        if (449 /* LeftHandSide */ < minPrecedence) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        /** parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
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
        let name = state.tokenValue;
        while ((state.currentToken & 16384 /* LeftHandSide */) > 0) {
            const args = [];
            let strings;
            switch (state.currentToken) {
                case 16393 /* Dot */:
                    state.assignable = true;
                    nextToken(state);
                    if ((state.currentToken & 3072 /* IdentifierName */) === 0) {
                        throw new Error(`Expected identifier: '${state.input}'`);
                    }
                    name = state.tokenValue;
                    nextToken(state);
                    // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
                    access = ((access & (512 /* This */ | 1024 /* Scope */)) << 1) | (access & 2048 /* Member */) | ((access & 4096 /* Keyed */) >> 1);
                    if (state.currentToken === 671751 /* OpenParen */) {
                        if (access === 0 /* Reset */) { // if the left hand side is a literal, make sure we parse a CallMemberExpression
                            access = 2048 /* Member */;
                        }
                        continue;
                    }
                    if (access & 1024 /* Scope */) {
                        result = new AccessScopeExpression(name, result.ancestor);
                    }
                    else { // if it's not $Scope, it's $Member
                        result = new AccessMemberExpression(result, name);
                    }
                    continue;
                case 671757 /* OpenBracket */:
                    state.assignable = true;
                    nextToken(state);
                    access = 4096 /* Keyed */;
                    result = new AccessKeyedExpression(result, parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                    consume(state, 1835022 /* CloseBracket */);
                    break;
                case 671751 /* OpenParen */:
                    state.assignable = false;
                    nextToken(state);
                    while (state.currentToken !== 1835019 /* CloseParen */) {
                        args.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                        if (!consumeOpt(state, 1572876 /* Comma */)) {
                            break;
                        }
                    }
                    consume(state, 1835019 /* CloseParen */);
                    if (access & 1024 /* Scope */) {
                        result = new CallScopeExpression(name, args, result.ancestor);
                    }
                    else if (access & 2048 /* Member */) {
                        result = new CallMemberExpression(result, name, args);
                    }
                    else {
                        result = new CallFunctionExpression(result, args);
                    }
                    access = 0;
                    break;
                case 540714 /* TemplateTail */:
                    state.assignable = false;
                    strings = [state.tokenValue];
                    result = new TaggedTemplateExpression(strings, strings, result);
                    nextToken(state);
                    break;
                case 540715 /* TemplateContinuation */:
                    result = parseTemplate(state, access, bindingType, result, true);
            }
        }
    }
    if (448 /* Binary */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseBinaryExpression
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
     */
    while ((state.currentToken & 65536 /* BinaryOp */) > 0) {
        const opToken = state.currentToken;
        if ((opToken & 448 /* Precedence */) <= minPrecedence) {
            break;
        }
        nextToken(state);
        result = new BinaryExpression(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
        state.assignable = false;
    }
    if (63 /* Conditional */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /**
     * parseConditionalExpression
     * https://tc39.github.io/ecma262/#prod-ConditionalExpression
     *
     * ConditionalExpression :
     * 1. BinaryExpression
     * 2. BinaryExpression ? AssignmentExpression : AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(state, 1572880 /* Question */)) {
        const yes = parse(state, access, 62 /* Assign */, bindingType);
        consume(state, 1572879 /* Colon */);
        result = new ConditionalExpression(result, yes, parse(state, access, 62 /* Assign */, bindingType));
        state.assignable = false;
    }
    if (62 /* Assign */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseAssignmentExpression
     * https://tc39.github.io/ecma262/#prod-AssignmentExpression
     * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
     *
     * AssignmentExpression :
     * 1. ConditionalExpression
     * 2. LeftHandSideExpression = AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(state, 1048616 /* Equals */)) {
        if (!state.assignable) {
            throw new Error(`Left hand side of expression is not assignable: '${state.input}'`);
        }
        result = new AssignExpression(result, parse(state, access, 62 /* Assign */, bindingType));
    }
    if (61 /* Variadic */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseValueConverter
     */
    while (consumeOpt(state, 1572884 /* Bar */)) {
        if (state.currentToken === 1572864 /* EOF */) {
            throw new Error(`Expected identifier to come after ValueConverter operator: '${state.input}'`);
        }
        const name = state.tokenValue;
        nextToken(state);
        const args = new Array();
        while (consumeOpt(state, 1572879 /* Colon */)) {
            args.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        result = new ValueConverterExpression(result, name, args);
    }
    /** parseBindingBehavior
     */
    while (consumeOpt(state, 1572883 /* Ampersand */)) {
        if (state.currentToken === 1572864 /* EOF */) {
            throw new Error(`Expected identifier to come after BindingBehavior operator: '${state.input}'`);
        }
        const name = state.tokenValue;
        nextToken(state);
        const args = new Array();
        while (consumeOpt(state, 1572879 /* Colon */)) {
            args.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        result = new BindingBehaviorExpression(result, name, args);
    }
    if (state.currentToken !== 1572864 /* EOF */) {
        if (bindingType & 2048 /* Interpolation */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        if (state.tokenRaw === 'of') {
            throw new Error(`Unexpected keyword "of": '${state.input}'`);
        }
        throw new Error(`Unconsumed token: '${state.input}'`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result;
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
function parseArrayLiteralExpression(state, access, bindingType) {
    nextToken(state);
    const elements = new Array();
    while (state.currentToken !== 1835022 /* CloseBracket */) {
        if (consumeOpt(state, 1572876 /* Comma */)) {
            elements.push($undefined);
            if (state.currentToken === 1835022 /* CloseBracket */) {
                break;
            }
        }
        else {
            elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            if (consumeOpt(state, 1572876 /* Comma */)) {
                if (state.currentToken === 1835022 /* CloseBracket */) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    consume(state, 1835022 /* CloseBracket */);
    if (bindingType & 512 /* IsIterator */) {
        return new ArrayBindingPattern(elements);
    }
    else {
        state.assignable = false;
        return new ArrayLiteralExpression(elements);
    }
}
function parseForOfStatement(state, result) {
    if ((result.$kind & 65536 /* IsForDeclaration */) === 0) {
        throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.input}'`);
    }
    if (state.currentToken !== 1051180 /* OfKeyword */) {
        throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.input}'`);
    }
    nextToken(state);
    const declaration = result;
    const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
    return new ForOfStatement(declaration, statement);
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
function parseObjectLiteralExpression(state, bindingType) {
    const keys = new Array();
    const values = new Array();
    nextToken(state);
    while (state.currentToken !== 1835018 /* CloseBrace */) {
        keys.push(state.tokenValue);
        // Literal = mandatory colon
        if (state.currentToken & 12288 /* StringOrNumericLiteral */) {
            nextToken(state);
            consume(state, 1572879 /* Colon */);
            values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
        }
        else if (state.currentToken & 3072 /* IdentifierName */) {
            // IdentifierName = optional colon
            const { currentChar, currentToken, index } = state;
            nextToken(state);
            if (consumeOpt(state, 1572879 /* Colon */)) {
                values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            }
            else {
                // Shorthand
                state.currentChar = currentChar;
                state.currentToken = currentToken;
                state.index = index;
                values.push(parse(state, 0 /* Reset */, 450 /* Primary */, bindingType & ~512 /* IsIterator */));
            }
        }
        else {
            throw new Error(`Invalid or unsupported property definition in object literal: '${state.input}'`);
        }
        if (state.currentToken !== 1835018 /* CloseBrace */) {
            consume(state, 1572876 /* Comma */);
        }
    }
    consume(state, 1835018 /* CloseBrace */);
    if (bindingType & 512 /* IsIterator */) {
        return new ObjectBindingPattern(keys, values);
    }
    else {
        state.assignable = false;
        return new ObjectLiteralExpression(keys, values);
    }
}
function parseInterpolation(state) {
    const parts = [];
    const expressions = [];
    const length = state.length;
    let result = '';
    while (state.index < length) {
        switch (state.currentChar) {
            case 36 /* Dollar */:
                if (state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                    parts.push(result);
                    result = '';
                    state.index += 2;
                    state.currentChar = state.input.charCodeAt(state.index);
                    nextToken(state);
                    const expression = parse(state, 0 /* Reset */, 61 /* Variadic */, 2048 /* Interpolation */);
                    expressions.push(expression);
                    continue;
                }
                else {
                    result += '$';
                }
                break;
            case 92 /* Backslash */:
                result += String.fromCharCode(unescapeCode(nextChar(state)));
                break;
            default:
                result += String.fromCharCode(state.currentChar);
        }
        nextChar(state);
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
function parseTemplate(state, access, bindingType, result, tagged) {
    const cooked = [state.tokenValue];
    // TODO: properly implement raw parts / decide whether we want this
    consume(state, 540715 /* TemplateContinuation */);
    const expressions = [parse(state, access, 62 /* Assign */, bindingType)];
    while ((state.currentToken = scanTemplateTail(state)) !== 540714 /* TemplateTail */) {
        cooked.push(state.tokenValue);
        consume(state, 540715 /* TemplateContinuation */);
        expressions.push(parse(state, access, 62 /* Assign */, bindingType));
    }
    cooked.push(state.tokenValue);
    state.assignable = false;
    if (tagged) {
        nextToken(state);
        return new TaggedTemplateExpression(cooked, cooked, result, expressions);
    }
    else {
        nextToken(state);
        return new TemplateExpression(cooked, expressions);
    }
}
function nextToken(state) {
    while (state.index < state.length) {
        state.startIndex = state.index;
        if ((state.currentToken = (CharScanners[state.currentChar](state))) != null) { // a null token means the character must be skipped
            return;
        }
    }
    state.currentToken = 1572864 /* EOF */;
}
function nextChar(state) {
    return state.currentChar = state.input.charCodeAt(++state.index);
}
function scanIdentifier(state) {
    // run to the next non-idPart
    while (IdParts[nextChar(state)])
        ;
    const token = KeywordLookup[state.tokenValue = state.tokenRaw];
    return token === undefined ? 1024 /* Identifier */ : token;
}
function scanNumber(state, isFloat) {
    let char = state.currentChar;
    if (isFloat === false) {
        do {
            char = nextChar(state);
        } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
        if (char !== 46 /* Dot */) {
            state.tokenValue = parseInt(state.tokenRaw, 10);
            return 8192 /* NumericLiteral */;
        }
        // past this point it's always a float
        char = nextChar(state);
        if (state.index >= state.length) {
            // unless the number ends with a dot - that behaves a little different in native ES expressions
            // but in our AST that behavior has no effect because numbers are always stored in variables
            state.tokenValue = parseInt(state.tokenRaw.slice(0, -1), 10);
            return 8192 /* NumericLiteral */;
        }
    }
    if (char <= 57 /* Nine */ && char >= 48 /* Zero */) {
        do {
            char = nextChar(state);
        } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
    }
    else {
        state.currentChar = state.input.charCodeAt(--state.index);
    }
    state.tokenValue = parseFloat(state.tokenRaw);
    return 8192 /* NumericLiteral */;
}
function scanString(state) {
    const quote = state.currentChar;
    nextChar(state); // Skip initial quote.
    let unescaped = 0;
    const buffer = new Array();
    let marker = state.index;
    while (state.currentChar !== quote) {
        if (state.currentChar === 92 /* Backslash */) {
            buffer.push(state.input.slice(marker, state.index));
            nextChar(state);
            unescaped = unescapeCode(state.currentChar);
            nextChar(state);
            buffer.push(String.fromCharCode(unescaped));
            marker = state.index;
        }
        else if (state.index >= state.length) {
            throw new Error(`Unterminated quote in string literal: '${state.input}'`);
        }
        else {
            nextChar(state);
        }
    }
    const last = state.input.slice(marker, state.index);
    nextChar(state); // Skip terminating quote.
    // Compute the unescaped string value.
    buffer.push(last);
    const unescapedStr = buffer.join('');
    state.tokenValue = unescapedStr;
    return 4096 /* StringLiteral */;
}
function scanTemplate(state) {
    let tail = true;
    let result = '';
    while (nextChar(state) !== 96 /* Backtick */) {
        if (state.currentChar === 36 /* Dollar */) {
            if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                state.index++;
                tail = false;
                break;
            }
            else {
                result += '$';
            }
        }
        else if (state.currentChar === 92 /* Backslash */) {
            result += String.fromCharCode(unescapeCode(nextChar(state)));
        }
        else {
            if (state.index >= state.length) {
                throw new Error(`Unterminated template string: '${state.input}'`);
            }
            result += String.fromCharCode(state.currentChar);
        }
    }
    nextChar(state);
    state.tokenValue = result;
    if (tail) {
        return 540714 /* TemplateTail */;
    }
    return 540715 /* TemplateContinuation */;
}
function scanTemplateTail(state) {
    if (state.index >= state.length) {
        throw new Error(`Unterminated template string: '${state.input}'`);
    }
    state.index--;
    return scanTemplate(state);
}
function consumeOpt(state, token) {
    if (state.currentToken === token) {
        nextToken(state);
        return true;
    }
    return false;
}
function consume(state, token) {
    if (state.currentToken === token) {
        nextToken(state);
    }
    else {
        throw new Error(`Missing expected token: '${state.input}'`);
    }
}
/**
 * Array for mapping tokens to token values. The indices of the values
 * correspond to the token bits 0-38.
 * For this to work properly, the values in the array must be kept in
 * the same order as the token bits.
 * Usage: TokenValues[token & Token.Type]
 */
const TokenValues = [
    $false, $true, $null, $undefined, '$this', null /* '$host' */, '$parent',
    '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',
    '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
    '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
    540714 /* TemplateTail */, 540715 /* TemplateContinuation */,
    'of'
];
const KeywordLookup = Object.create(null);
KeywordLookup.true = 2049 /* TrueKeyword */;
KeywordLookup.null = 2050 /* NullKeyword */;
KeywordLookup.false = 2048 /* FalseKeyword */;
KeywordLookup.undefined = 2051 /* UndefinedKeyword */;
KeywordLookup.$this = 3076 /* ThisScope */;
KeywordLookup.$parent = 3078 /* ParentScope */;
KeywordLookup.in = 1640799 /* InKeyword */;
KeywordLookup.instanceof = 1640800 /* InstanceOfKeyword */;
KeywordLookup.typeof = 34851 /* TypeofKeyword */;
KeywordLookup.void = 34852 /* VoidKeyword */;
KeywordLookup.of = 1051180 /* OfKeyword */;
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
function decompress(lookup, $set, compressed, value) {
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
}
// CharFuncLookup functions
function returnToken(token) {
    return s => {
        nextChar(s);
        return token;
    };
}
const unexpectedCharacter = s => {
    throw new Error(`Unexpected character: '${s.input}'`);
};
unexpectedCharacter.notMapped = true;
// ASCII IdentifierPart lookup
const AsciiIdParts = new Set();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.IdStart, 1);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.Digit, 1);
// Character scanning function lookup
const CharScanners = new Array(0xFFFF);
CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
decompress(CharScanners, null, codes.Skip, s => {
    nextChar(s);
    return null;
});
decompress(CharScanners, null, codes.IdStart, scanIdentifier);
decompress(CharScanners, null, codes.Digit, s => scanNumber(s, false));
CharScanners[34 /* DoubleQuote */] =
    CharScanners[39 /* SingleQuote */] = s => {
        return scanString(s);
    };
CharScanners[96 /* Backtick */] = s => {
    return scanTemplate(s);
};
// !, !=, !==
CharScanners[33 /* Exclamation */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 32809 /* Exclamation */;
    }
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638680 /* ExclamationEquals */;
    }
    nextChar(s);
    return 1638682 /* ExclamationEqualsEquals */;
};
// =, ==, ===
CharScanners[61 /* Equals */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1048616 /* Equals */;
    }
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638679 /* EqualsEquals */;
    }
    nextChar(s);
    return 1638681 /* EqualsEqualsEquals */;
};
// &, &&
CharScanners[38 /* Ampersand */] = s => {
    if (nextChar(s) !== 38 /* Ampersand */) {
        return 1572883 /* Ampersand */;
    }
    nextChar(s);
    return 1638614 /* AmpersandAmpersand */;
};
// |, ||
CharScanners[124 /* Bar */] = s => {
    if (nextChar(s) !== 124 /* Bar */) {
        return 1572884 /* Bar */;
    }
    nextChar(s);
    return 1638549 /* BarBar */;
};
// .
CharScanners[46 /* Dot */] = s => {
    if (nextChar(s) <= 57 /* Nine */ && s.currentChar >= 48 /* Zero */) {
        return scanNumber(s, true);
    }
    return 16393 /* Dot */;
};
// <, <=
CharScanners[60 /* LessThan */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638747 /* LessThan */;
    }
    nextChar(s);
    return 1638749 /* LessThanEquals */;
};
// >, >=
CharScanners[62 /* GreaterThan */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638748 /* GreaterThan */;
    }
    nextChar(s);
    return 1638750 /* GreaterThanEquals */;
};
CharScanners[37 /* Percent */] = returnToken(1638886 /* Percent */);
CharScanners[40 /* OpenParen */] = returnToken(671751 /* OpenParen */);
CharScanners[41 /* CloseParen */] = returnToken(1835019 /* CloseParen */);
CharScanners[42 /* Asterisk */] = returnToken(1638885 /* Asterisk */);
CharScanners[43 /* Plus */] = returnToken(623009 /* Plus */);
CharScanners[44 /* Comma */] = returnToken(1572876 /* Comma */);
CharScanners[45 /* Minus */] = returnToken(623010 /* Minus */);
CharScanners[47 /* Slash */] = returnToken(1638887 /* Slash */);
CharScanners[58 /* Colon */] = returnToken(1572879 /* Colon */);
CharScanners[63 /* Question */] = returnToken(1572880 /* Question */);
CharScanners[91 /* OpenBracket */] = returnToken(671757 /* OpenBracket */);
CharScanners[93 /* CloseBracket */] = returnToken(1835022 /* CloseBracket */);
CharScanners[123 /* OpenBrace */] = returnToken(131080 /* OpenBrace */);
CharScanners[125 /* CloseBrace */] = returnToken(1835018 /* CloseBrace */);

/**
 * Current subscription collector
 */
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
        throw new Error('Connectable cannot be null/undefined');
    }
    if (_connectable == null) {
        _connectable = connectable;
        connectables[0] = _connectable;
        connecting = true;
        return;
    }
    if (_connectable === connectable) {
        throw new Error(`Trying to enter an active connectable`);
    }
    connectables.push(_connectable);
    _connectable = connectable;
    connecting = true;
}
function exitConnectable(connectable) {
    if (connectable == null) {
        throw new Error('Connectable cannot be null/undefined');
    }
    if (_connectable !== connectable) {
        throw new Error(`Trying to exit an unactive connectable`);
    }
    connectables.pop();
    _connectable = connectables.length > 0 ? connectables[connectables.length - 1] : null;
    connecting = _connectable != null;
}
const ConnectableSwitcher = Object.freeze({
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
function canWrap(obj) {
    switch (toStringTag.call(obj)) {
        case '[object Object]':
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
    var _a;
    // deepscan-disable-next-line
    return (_a = proxyMap.get(obj)) !== null && _a !== void 0 ? _a : createProxy(obj);
}
function getRaw(obj) {
    var _a;
    // todo: get in a weakmap if null/undef
    return (_a = obj[rawKey]) !== null && _a !== void 0 ? _a : obj;
}
function unwrap(v) {
    return canWrap(v) && v[rawKey] || v;
}
function doNotCollect(key) {
    return key === 'constructor'
        || key === '__proto__'
        // probably should revert to v1 naming style for consistency with builtin?
        // __o__ is shorters & less chance of conflict with other libs as well
        || key === '$observers'
        || key === Symbol.toPrimitive
        || key === Symbol.toStringTag;
}
function createProxy(obj) {
    const handler = obj instanceof Array
        ? arrayHandler
        : obj instanceof Map || obj instanceof Set
            ? collectionHandler
            : objectHandler;
    const proxiedObj = new Proxy(obj, handler);
    proxyMap.set(obj, proxiedObj);
    return proxiedObj;
}
const objectHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        // todo: static
        connectable.observe(target, key);
        return wrap(R$get(target, key, receiver));
    },
};
const arrayHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'length':
                connectable.observe(target, 'length');
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
        connectable.observe(target, key);
        return wrap(R$get(target, key, receiver));
    },
    // for (let i in array) ...
    ownKeys(target) {
        var _a;
        (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observe(target, 'length');
        return Reflect.ownKeys(target);
    },
};
function wrappedArrayMap(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.map((v, i) => 
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap(res);
}
function wrappedArrayEvery(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.every((v, i) => cb.call(thisArg, wrap(v), i, this));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFilter(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.filter((v, i) => 
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap(res);
}
function wrappedArrayIncludes(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.includes(unwrap(v));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayIndexOf(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.indexOf(unwrap(v));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayLastIndexOf(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.lastIndexOf(unwrap(v));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFindIndex(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.findIndex((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFind(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.find((v, i) => cb(wrap(v), i, this), thisArg);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap(res);
}
function wrappedArrayFlat() {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap(raw.flat());
}
function wrappedArrayFlatMap(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxy(raw.flatMap((v, i) => wrap(cb.call(thisArg, wrap(v), i, this))));
}
function wrappedArrayJoin(separator) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
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
function wrappedArrayReverse(...args) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reverse();
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap(res);
}
function wrappedArraySome(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.some((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArraySort(cb) {
    var _a;
    const raw = getRaw(this);
    const res = raw.sort(cb);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap(res);
}
function wrappedArraySlice(start, end) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxy(raw.slice(start, end));
}
function wrappedReduce(cb, initValue) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reduce((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap(res);
}
function wrappedReduceRight(cb, initValue) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reduceRight((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
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
        if (!connecting || doNotCollect(key) || connectable == null) {
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
                if (target instanceof Set) {
                    return wrappedAdd;
                }
                break;
            case 'get':
                if (target instanceof Map) {
                    return wrappedGet;
                }
                break;
            case 'set':
                if (target instanceof Map) {
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
                return target instanceof Map ? wrappedEntries : wrappedValues;
        }
        return wrap(R$get(target, key, receiver));
    },
};
function wrappedForEach(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.forEach((v, key) => {
        cb.call(/* should wrap or not?? */ thisArg, wrap(v), wrap(key), this);
    });
}
function wrappedHas(v) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.has(unwrap(v));
}
function wrappedGet(k) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
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
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
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
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
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
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
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
const ProxyObservable = Object.freeze({
    getProxy,
    getRaw,
    wrap,
    unwrap,
    rawKey,
});

class ComputedObserver {
    constructor(obj, get, set, useProxy, observerLocator) {
        this.obj = obj;
        this.get = get;
        this.set = set;
        this.useProxy = useProxy;
        this.interceptor = this;
        this.type = 1 /* Observer */;
        this.value = void 0;
        this._oldValue = void 0;
        // todo: maybe use a counter allow recursive call to a certain level
        /**
         * @internal
         */
        this.running = false;
        this._isDirty = false;
        this.oL = observerLocator;
    }
    static create(obj, key, descriptor, observerLocator, useProxy) {
        const getter = descriptor.get;
        const setter = descriptor.set;
        const observer = new ComputedObserver(obj, getter, setter, useProxy, observerLocator);
        const $get = (( /* Computed Observer */) => observer.getValue());
        $get.getObserver = () => observer;
        def(obj, key, {
            enumerable: descriptor.enumerable,
            configurable: true,
            get: $get,
            set: (/* Computed Observer */ v) => {
                observer.setValue(v, 0 /* none */);
            },
        });
        return observer;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.get.call(this.obj, this);
        }
        if (this._isDirty) {
            this.compute();
            this._isDirty = false;
        }
        return this.value;
    }
    // deepscan-disable-next-line
    setValue(v, _flags) {
        if (typeof this.set === 'function') {
            if (v !== this.value) {
                // setting running true as a form of batching
                this.running = true;
                this.set.call(this.obj, v);
                this.running = false;
                this.run();
            }
        }
        else {
            throw new Error('Property is readonly');
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
            this.compute();
            this._isDirty = false;
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this._isDirty = true;
            this.obs.clear(true);
        }
    }
    flush() {
        oV$1 = this._oldValue;
        this._oldValue = this.value;
        this.subs.notify(this.value, oV$1, 0 /* none */);
    }
    run() {
        if (this.running) {
            return;
        }
        const oldValue = this.value;
        const newValue = this.compute();
        this._isDirty = false;
        if (!Object.is(newValue, oldValue)) {
            this._oldValue = oldValue;
            this.queue.add(this);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            enterConnectable(this);
            return this.value = unwrap(this.get.call(this.useProxy ? wrap(this.obj) : this.obj, this));
        }
        finally {
            this.obs.clear(false);
            this.running = false;
            exitConnectable(this);
        }
    }
}
connectable(ComputedObserver);
subscriberCollection(ComputedObserver);
withFlushQueue(ComputedObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$1 = void 0;

const IDirtyChecker = DI.createInterface('IDirtyChecker', x => x.singleton(DirtyChecker));
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
const queueTaskOpts = {
    persistent: true,
};
class DirtyChecker {
    constructor(p) {
        this.p = p;
        this.tracked = [];
        this._task = null;
        this._elapsedFrames = 0;
        this.check = () => {
            if (DirtyCheckSettings.disabled) {
                return;
            }
            if (++this._elapsedFrames < DirtyCheckSettings.timeoutsPerCheck) {
                return;
            }
            this._elapsedFrames = 0;
            const tracked = this.tracked;
            const len = tracked.length;
            let current;
            let i = 0;
            for (; i < len; ++i) {
                current = tracked[i];
                if (current.isDirty()) {
                    this.queue.add(current);
                }
            }
        };
    }
    createProperty(obj, propertyName) {
        if (DirtyCheckSettings.throw) {
            throw new Error(`Property '${propertyName}' is being dirty-checked.`);
        }
        return new DirtyCheckProperty(this, obj, propertyName);
    }
    addProperty(property) {
        this.tracked.push(property);
        if (this.tracked.length === 1) {
            this._task = this.p.taskQueue.queueTask(this.check, queueTaskOpts);
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
/**
 * @internal
 */
DirtyChecker.inject = [IPlatform];
withFlushQueue(DirtyChecker);
class DirtyCheckProperty {
    constructor(_dirtyChecker, obj, propertyKey) {
        this._dirtyChecker = _dirtyChecker;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.oldValue = void 0;
        this.type = 0 /* None */;
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(v, f) {
        // todo: this should be allowed, probably
        // but the construction of dirty checker should throw instead
        throw new Error(`Trying to set value for property ${this.propertyKey} in dirty checker`);
    }
    isDirty() {
        return this.oldValue !== this.obj[this.propertyKey];
    }
    flush() {
        const oldValue = this.oldValue;
        const newValue = this.getValue();
        this.oldValue = newValue;
        this.subs.notify(newValue, oldValue, 0 /* none */);
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.oldValue = this.obj[this.propertyKey];
            this._dirtyChecker.addProperty(this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this._dirtyChecker.removeProperty(this);
        }
    }
}
subscriberCollection(DirtyCheckProperty);

class PrimitiveObserver {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.type = 0 /* None */;
    }
    get doNotCache() { return true; }
    getValue() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
        return this.obj[this.propertyKey];
    }
    setValue() { }
    subscribe() { }
    unsubscribe() { }
}

class PropertyAccessor {
    constructor() {
        // the only thing can be guaranteed is it's an object
        // even if this property accessor is used to access an element
        this.type = 0 /* None */;
    }
    getValue(obj, key) {
        return obj[key];
    }
    setValue(value, flags, obj, key) {
        obj[key] = value;
    }
}

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;
/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
class SetterObserver {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.value = void 0;
        this.oldValue = void 0;
        this.observing = false;
        // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
        this.type = 1 /* Observer */;
        this.f = 0 /* none */;
    }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        if (this.observing) {
            const value = this.value;
            if (Object.is(newValue, value)) {
                return;
            }
            this.value = newValue;
            this.oldValue = value;
            this.f = flags;
            this.queue.add(this);
        }
        else {
            // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
            // so calling obj[propertyKey] will actually return this.value.
            // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
            // is unmodified and we need to explicitly set the property value.
            // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
            // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
            this.obj[this.propertyKey] = newValue;
        }
    }
    subscribe(subscriber) {
        if (this.observing === false) {
            this.start();
        }
        this.subs.add(subscriber);
    }
    flush() {
        oV = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV, this.f);
    }
    start() {
        if (this.observing === false) {
            this.observing = true;
            this.value = this.obj[this.propertyKey];
            def(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: ( /* Setter Observer */) => this.getValue(),
                set: (/* Setter Observer */ value) => {
                    this.setValue(value, 0 /* none */);
                },
            });
        }
        return this;
    }
    stop() {
        if (this.observing) {
            def(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.value,
            });
            this.observing = false;
            // todo(bigopon/fred): add .removeAllSubscribers()
        }
        return this;
    }
}
class SetterNotifier {
    constructor(obj, callbackKey, set, initialValue) {
        this.type = 1 /* Observer */;
        /**
         * @internal
         */
        this.v = void 0;
        /**
         * @internal
         */
        this.oV = void 0;
        /**
         * @internal
         */
        this.f = 0 /* none */;
        this.obj = obj;
        this.s = set;
        const callback = obj[callbackKey];
        this.cb = typeof callback === 'function' ? callback : void 0;
        this.v = initialValue;
    }
    getValue() {
        return this.v;
    }
    setValue(value, flags) {
        var _a;
        if (typeof this.s === 'function') {
            value = this.s(value);
        }
        if (!Object.is(value, this.v)) {
            this.oV = this.v;
            this.v = value;
            this.f = flags;
            (_a = this.cb) === null || _a === void 0 ? void 0 : _a.call(this.obj, this.v, this.oV, flags);
            this.queue.add(this);
        }
    }
    flush() {
        oV = this.oV;
        this.oV = this.v;
        this.subs.notify(this.v, oV, this.f);
    }
}
subscriberCollection(SetterObserver);
subscriberCollection(SetterNotifier);
withFlushQueue(SetterObserver);
withFlushQueue(SetterNotifier);

const propertyAccessor = new PropertyAccessor();
const IObserverLocator = DI.createInterface('IObserverLocator', x => x.singleton(ObserverLocator));
const INodeObserverLocator = DI
    .createInterface('INodeObserverLocator', x => x.cachedCallback(handler => {
    handler.getAll(ILogger).forEach(logger => {
        logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
    });
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
class ObserverLocator {
    constructor(_dirtyChecker, _nodeObserverLocator) {
        this._dirtyChecker = _dirtyChecker;
        this._nodeObserverLocator = _nodeObserverLocator;
        this._adapters = [];
    }
    addAdapter(adapter) {
        this._adapters.push(adapter);
    }
    getObserver(obj, key) {
        var _a, _b;
        return (_b = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this._cache(obj, key, this.createObserver(obj, key));
    }
    getAccessor(obj, key) {
        var _a;
        const cached = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key];
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
        var _a, _b, _c, _d;
        if (!(obj instanceof Object)) {
            return new PrimitiveObserver(obj, key);
        }
        if (this._nodeObserverLocator.handles(obj, key, this)) {
            return this._nodeObserverLocator.getObserver(obj, key, this);
        }
        switch (key) {
            case 'length':
                if (obj instanceof Array) {
                    return getArrayObserver(obj).getLengthObserver();
                }
                break;
            case 'size':
                if (obj instanceof Map) {
                    return getMapObserver(obj).getLengthObserver();
                }
                else if (obj instanceof Set) {
                    return getSetObserver(obj).getLengthObserver();
                }
                break;
            default:
                if (obj instanceof Array && isArrayIndex(key)) {
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
                obs = (_d = ((_b = (_a = pd.get) === null || _a === void 0 ? void 0 : _a.getObserver) !== null && _b !== void 0 ? _b : (_c = pd.set) === null || _c === void 0 ? void 0 : _c.getObserver)) === null || _d === void 0 ? void 0 : _d(obj, this);
            }
            return obs == null
                ? pd.configurable
                    ? ComputedObserver.create(obj, key, pd, this, /* AOT: not true for IE11 */ true)
                    : this._dirtyChecker.createProperty(obj, key)
                : obs;
        }
        // Ordinary get/set observation (the common use case)
        // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
        return new SetterObserver(obj, key);
    }
    _getAdapterObserver(obj, propertyName, pd) {
        if (this._adapters.length > 0) {
            for (const adapter of this._adapters) {
                const observer = adapter.getObserver(obj, propertyName, pd, this);
                if (observer != null) {
                    return observer;
                }
            }
        }
        return null;
    }
    _cache(obj, key, observer) {
        if (observer.doNotCache === true) {
            return observer;
        }
        if (obj.$observers === void 0) {
            def(obj, '$observers', { value: { [key]: observer } });
            return observer;
        }
        return obj.$observers[key] = observer;
    }
}
ObserverLocator.inject = [IDirtyChecker, INodeObserverLocator];
function getCollectionObserver(collection) {
    let obs;
    if (collection instanceof Array) {
        obs = getArrayObserver(collection);
    }
    else if (collection instanceof Map) {
        obs = getMapObserver(collection);
    }
    else if (collection instanceof Set) {
        obs = getSetObserver(collection);
    }
    return obs;
}
const getProto = Object.getPrototypeOf;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const hasOwnProp = Object.prototype.hasOwnProperty;

const IObservation = DI.createInterface('IObservation', x => x.singleton(Observation));
class Observation {
    constructor(oL) {
        this.oL = oL;
    }
    static get inject() { return [IObserverLocator]; }
    /**
     * Run an effect function an track the dependencies inside it,
     * to re-run whenever a dependency has changed
     */
    run(fn) {
        const effect = new Effect(this.oL, fn);
        // todo: batch effect run after it's in
        effect.run();
        return effect;
    }
}
class Effect {
    constructor(oL, fn) {
        this.oL = oL;
        this.fn = fn;
        this.interceptor = this;
        // to configure this, potentially a 2nd parameter is needed for run
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
        if (this.stopped) {
            throw new Error('Effect has already been stopped');
        }
        if (this.running) {
            return;
        }
        ++this.runCount;
        this.running = true;
        this.queued = false;
        ++this.obs.version;
        try {
            enterConnectable(this);
            this.fn(this);
        }
        finally {
            this.obs.clear(false);
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
                throw new Error('Maximum number of recursive effect run reached. Consider handle effect dependencies differently.');
            }
            this.run();
        }
        else {
            this.runCount = 0;
        }
    }
    stop() {
        this.stopped = true;
        this.obs.clear(true);
    }
}
connectable(Effect);

function getObserversLookup(obj) {
    if (obj.$observers === void 0) {
        def(obj, '$observers', { value: {} });
        // todo: define in a weakmap
    }
    return obj.$observers;
}
const noValue = {};
// impl, wont be seen
function observable(targetOrConfig, key, descriptor) {
    // either this check, or arguments.length === 3
    // or could be both, so can throw against user error for better DX
    if (key == null) {
        // for:
        //    @observable('prop')
        //    class {}
        //
        //    @observable({ name: 'prop', callback: ... })
        //    class {}
        //
        //    class {
        //      @observable() prop
        //      @observable({ callback: ... }) prop2
        //    }
        return ((t, k, d) => deco(t, k, d, targetOrConfig));
    }
    // for:
    //    class {
    //      @observable prop
    //    }
    return deco(targetOrConfig, key, descriptor);
    function deco(target, key, descriptor, config) {
        var _a;
        // class decorator?
        const isClassDecorator = key === void 0;
        config = typeof config !== 'object'
            ? { name: config }
            : (config || {});
        if (isClassDecorator) {
            key = config.name;
        }
        if (key == null || key === '') {
            throw new Error('Invalid usage, cannot determine property name for @observable');
        }
        // determine callback name based on config or convention.
        const callback = config.callback || `${String(key)}Changed`;
        let initialValue = noValue;
        if (descriptor) {
            // we're adding a getter and setter which means the property descriptor
            // cannot have a "value" or "writable" attribute
            delete descriptor.value;
            delete descriptor.writable;
            initialValue = (_a = descriptor.initializer) === null || _a === void 0 ? void 0 : _a.call(descriptor);
            delete descriptor.initializer;
        }
        else {
            descriptor = { configurable: true };
        }
        // make the accessor enumerable by default, as fields are enumerable
        if (!('enumerable' in descriptor)) {
            descriptor.enumerable = true;
        }
        // todo(bigopon/fred): discuss string api for converter
        const $set = config.set;
        descriptor.get = function g( /* @observable */) {
            var _a;
            const notifier = getNotifier(this, key, callback, initialValue, $set);
            (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.subscribeTo(notifier);
            return notifier.getValue();
        };
        descriptor.set = function s(newValue) {
            getNotifier(this, key, callback, initialValue, $set).setValue(newValue, 0 /* none */);
        };
        descriptor.get.getObserver = function gO(/* @observable */ obj) {
            return getNotifier(obj, key, callback, initialValue, $set);
        };
        if (isClassDecorator) {
            def(target.prototype, key, descriptor);
        }
        else {
            return descriptor;
        }
    }
}
function getNotifier(obj, key, callbackKey, initialValue, set) {
    const lookup = getObserversLookup(obj);
    let notifier = lookup[key];
    if (notifier == null) {
        notifier = new SetterNotifier(obj, callbackKey, set, initialValue === noValue ? void 0 : initialValue);
        lookup[key] = notifier;
    }
    return notifier;
}
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

export { Access, AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, AccessorType, ArrayBindingPattern, ArrayIndexObserver, ArrayLiteralExpression, ArrayObserver, AssignExpression, BinaryExpression, BindingBehavior, BindingBehaviorDefinition, BindingBehaviorExpression, BindingBehaviorFactory, BindingBehaviorStrategy, BindingContext, BindingIdentifier, BindingInterceptor, BindingMediator, BindingMode, BindingObserverRecord, BindingType, CallFunctionExpression, CallMemberExpression, CallScopeExpression, Char, CollectionKind, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, ConditionalExpression, ConnectableSwitcher, CustomExpression, DelegationStrategy, DirtyCheckProperty, DirtyCheckSettings, ExpressionKind, FlushQueue, ForOfStatement, HtmlLiteralExpression, IDirtyChecker, IExpressionParser, INodeObserverLocator, IObservation, IObserverLocator, ISignaler, Interpolation, LifecycleFlags, MapObserver, ObjectBindingPattern, ObjectLiteralExpression, Observation, ObserverLocator, OverrideContext, ParserState, Precedence, PrimitiveLiteralExpression, PrimitiveObserver, PropertyAccessor, ProxyObservable, Scope, SetObserver, SetterObserver, SubscriberRecord, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverter, ValueConverterDefinition, ValueConverterExpression, alias, applyMutationsToIndices, bindingBehavior, cloneIndexMap, connectable, copyIndexMap, createIndexMap, disableArrayObservation, disableMapObservation, disableSetObservation, enableArrayObservation, enableMapObservation, enableSetObservation, getCollectionObserver, isIndexMap, observable, parse, parseExpression, registerAliases, subscriberCollection, synchronizeIndices, valueConverter, withFlushQueue };
//# sourceMappingURL=index.dev.js.map
