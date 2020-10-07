import { PLATFORM, Reporter, isNumberOrBigInt, isStringOrDate, } from '@aurelia/kernel';
import { BindingContext } from '../observation/binding-context';
import { ProxyObserver } from '../observation/proxy-observer';
import { ISignaler } from '../observation/signaler';
import { BindingBehavior, BindingBehaviorFactory, } from '../resources/binding-behavior';
import { ValueConverter, } from '../resources/value-converter';
function chooseScope(accessHostScope, scope, hostScope) {
    if (accessHostScope) {
        if (hostScope === null || hostScope === void 0) {
            throw new Error('Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?');
        }
        return hostScope;
    }
    return scope;
}
var RuntimeError;
(function (RuntimeError) {
    RuntimeError[RuntimeError["NoLocator"] = 202] = "NoLocator";
    RuntimeError[RuntimeError["NoBehaviorFound"] = 203] = "NoBehaviorFound";
    RuntimeError[RuntimeError["BehaviorAlreadyApplied"] = 204] = "BehaviorAlreadyApplied";
    RuntimeError[RuntimeError["NoConverterFound"] = 205] = "NoConverterFound";
    RuntimeError[RuntimeError["NoBinding"] = 206] = "NoBinding";
    RuntimeError[RuntimeError["NotAFunction"] = 207] = "NotAFunction";
    RuntimeError[RuntimeError["UnknownOperator"] = 208] = "UnknownOperator";
    RuntimeError[RuntimeError["NilScope"] = 250] = "NilScope";
})(RuntimeError || (RuntimeError = {}));
export class CustomExpression {
    constructor(value) {
        this.value = value;
    }
    evaluate(flags, scope, hostScope, locator, connectable) {
        return this.value;
    }
}
export class BindingBehaviorExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.behaviorKey = BindingBehavior.keyFrom(name);
    }
    get $kind() { return 38962 /* BindingBehavior */; }
    get hasBind() { return true; }
    get hasUnbind() { return true; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        return this.expression.evaluate(flags, scope, hostScope, locator, connectable);
    }
    assign(flags, scope, hostScope, locator, value) {
        return this.expression.assign(flags, scope, hostScope, locator, value);
    }
    connect(flags, scope, hostScope, binding) {
        this.expression.connect(flags, scope, hostScope, binding);
    }
    bind(flags, scope, hostScope, binding) {
        if (scope == null) {
            throw Reporter.error(250 /* NilScope */, this);
        }
        if (!binding) {
            throw Reporter.error(206 /* NoBinding */, this);
        }
        const locator = binding.locator;
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        if (this.expression.hasBind) {
            this.expression.bind(flags, scope, hostScope, binding);
        }
        const behaviorKey = this.behaviorKey;
        const behavior = locator.get(behaviorKey);
        if (!behavior) {
            throw Reporter.error(203 /* NoBehaviorFound */, this);
        }
        if (!(behavior instanceof BindingBehaviorFactory)) {
            if (binding[behaviorKey] === void 0) {
                binding[behaviorKey] = behavior;
                behavior.bind.call(behavior, flags, scope, hostScope, binding, ...evalList(flags, scope, locator, this.args, hostScope, null));
            }
            else {
                Reporter.write(204 /* BehaviorAlreadyApplied */, this);
            }
        }
    }
    unbind(flags, scope, hostScope, binding) {
        const behaviorKey = this.behaviorKey;
        if (binding[behaviorKey] !== void 0) {
            if (typeof binding[behaviorKey].unbind === 'function') {
                binding[behaviorKey].unbind(flags, scope, hostScope, binding);
            }
            binding[behaviorKey] = void 0;
        }
        if (this.expression.hasUnbind) {
            this.expression.unbind(flags, scope, hostScope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitBindingBehavior(this);
    }
}
export class ValueConverterExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.converterKey = ValueConverter.keyFrom(name);
    }
    get $kind() { return 36913 /* ValueConverter */; }
    get hasBind() { return false; }
    get hasUnbind() { return true; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        if ('toView' in converter) {
            const args = this.args;
            const len = args.length;
            const result = Array(len + 1);
            result[0] = this.expression.evaluate(flags, scope, hostScope, locator, connectable);
            for (let i = 0; i < len; ++i) {
                result[i + 1] = args[i].evaluate(flags, scope, hostScope, locator, connectable);
            }
            // note: everything should be ISubscriber eventually
            // for now, it's sort of internal thing where only built-in bindings are passed as connectable
            // so it by default satisfies ISubscriber constrain
            if (connectable != null && ('handleChange' in connectable)) {
                const signals = converter.signals;
                if (signals != null) {
                    const signaler = locator.get(ISignaler);
                    for (let i = 0, ii = signals.length; i < ii; ++i) {
                        signaler.addSignalListener(signals[i], connectable);
                    }
                }
            }
            return converter.toView.call(converter, ...result);
        }
        return this.expression.evaluate(flags, scope, hostScope, locator, connectable);
    }
    assign(flags, scope, hostScope, locator, value) {
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        if ('fromView' in converter) {
            value = converter.fromView.call(converter, value, ...(evalList(flags, scope, locator, this.args, hostScope, null)));
        }
        return this.expression.assign(flags, scope, hostScope, locator, value);
    }
    connect(flags, scope, hostScope, binding) {
        if (scope == null) {
            throw Reporter.error(250 /* NilScope */, this);
        }
        if (!binding) {
            throw Reporter.error(206 /* NoBinding */, this);
        }
        const locator = binding.locator;
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        this.expression.connect(flags, scope, hostScope, binding);
        const args = this.args;
        for (let i = 0, ii = args.length; i < ii; ++i) {
            args[i].connect(flags, scope, hostScope, binding);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        const signals = converter.signals;
        if (signals === void 0) {
            return;
        }
        const signaler = locator.get(ISignaler);
        for (let i = 0, ii = signals.length; i < ii; ++i) {
            signaler.addSignalListener(signals[i], binding);
        }
    }
    unbind(flags, scope, hostScope, binding) {
        const locator = binding.locator;
        const converter = locator.get(this.converterKey);
        const signals = converter.signals;
        if (signals === void 0) {
            return;
        }
        const signaler = locator.get(ISignaler);
        for (let i = 0, ii = signals.length; i < ii; ++i) {
            signaler.removeSignalListener(signals[i], binding);
        }
    }
    accept(visitor) {
        return visitor.visitValueConverter(this);
    }
}
export class AssignExpression {
    constructor(target, value) {
        this.target = target;
        this.value = value;
    }
    get $kind() { return 8208 /* Assign */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        return this.target.assign(flags, scope, hostScope, locator, this.value.evaluate(flags, scope, hostScope, locator, connectable));
    }
    connect(flags, scope, hostScope, binding) {
        return;
    }
    assign(flags, scope, hostScope, locator, value) {
        this.value.assign(flags, scope, hostScope, locator, value);
        return this.target.assign(flags, scope, hostScope, locator, value);
    }
    accept(visitor) {
        return visitor.visitAssign(this);
    }
}
export class ConditionalExpression {
    constructor(condition, yes, no) {
        this.condition = condition;
        this.yes = yes;
        this.no = no;
    }
    get $kind() { return 63 /* Conditional */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        return (!!this.condition.evaluate(flags, scope, hostScope, locator, connectable))
            ? this.yes.evaluate(flags, scope, hostScope, locator, connectable)
            : this.no.evaluate(flags, scope, hostScope, locator, connectable);
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const condition = this.condition;
        if (condition.evaluate(flags, scope, hostScope, binding.locator, null)) {
            condition.connect(flags, scope, hostScope, binding);
            this.yes.connect(flags, scope, hostScope, binding);
        }
        else {
            condition.connect(flags, scope, hostScope, binding);
            this.no.connect(flags, scope, hostScope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitConditional(this);
    }
}
export class AccessThisExpression {
    constructor(ancestor = 0) {
        this.ancestor = ancestor;
    }
    get $kind() { return 1793 /* AccessThis */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        var _a;
        if (scope == null) {
            throw Reporter.error(250 /* NilScope */, this);
        }
        if (this === AccessThisExpression.$host) {
            scope = chooseScope(true, scope, hostScope);
        }
        let oc = scope.overrideContext;
        let currentScope = scope;
        let i = this.ancestor;
        while (i-- && oc) {
            currentScope = currentScope.parentScope;
            oc = (_a = currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) !== null && _a !== void 0 ? _a : null;
        }
        return i < 1 && oc ? oc.bindingContext : void 0;
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        return;
    }
    accept(visitor) {
        return visitor.visitAccessThis(this);
    }
}
AccessThisExpression.$this = new AccessThisExpression(0);
// $host and $this are loosely the same thing. $host is used in the context of `au-slot` with the primary objective of determining the scope.
AccessThisExpression.$host = new AccessThisExpression(0);
AccessThisExpression.$parent = new AccessThisExpression(1);
export class AccessScopeExpression {
    constructor(name, ancestor = 0, accessHostScope = false) {
        this.name = name;
        this.ancestor = ancestor;
        this.accessHostScope = accessHostScope;
    }
    get $kind() { return 10082 /* AccessScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const obj = BindingContext.get(chooseScope(this.accessHostScope, scope, hostScope), this.name, this.ancestor, flags, hostScope);
        if (connectable != null) {
            connectable.observeProperty(flags, obj, this.name);
        }
        const evaluatedValue = obj[this.name];
        if (flags & 4 /* isStrictBindingStrategy */) {
            return evaluatedValue;
        }
        return evaluatedValue == null ? '' : evaluatedValue;
    }
    assign(flags, scope, hostScope, locator, value) {
        var _a;
        const obj = BindingContext.get(chooseScope(this.accessHostScope, scope, hostScope), this.name, this.ancestor, flags, hostScope);
        if (obj instanceof Object) {
            if (((_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[this.name]) != null) {
                obj.$observers[this.name].setValue(value, flags);
                return value;
            }
            else {
                return obj[this.name] = value;
            }
        }
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const context = BindingContext.get(chooseScope(this.accessHostScope, scope, hostScope), this.name, this.ancestor, flags, hostScope);
        binding.observeProperty(flags, context, this.name);
    }
    accept(visitor) {
        return visitor.visitAccessScope(this);
    }
}
export class AccessMemberExpression {
    constructor(object, name) {
        this.object = object;
        this.name = name;
    }
    get $kind() { return 9323 /* AccessMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const instance = this.object.evaluate(flags, scope, hostScope, locator, connectable);
        if (flags & 4 /* isStrictBindingStrategy */) {
            if (instance == null) {
                return instance;
            }
            if (connectable != null) {
                connectable.observeProperty(flags, instance, this.name);
            }
            return instance[this.name];
        }
        if (connectable != null && instance instanceof Object) {
            connectable.observeProperty(flags, instance, this.name);
        }
        return instance ? instance[this.name] : '';
    }
    assign(flags, scope, hostScope, locator, value) {
        const obj = this.object.evaluate(flags, scope, hostScope, locator, null);
        if (obj instanceof Object) {
            if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                obj.$observers[this.name].setValue(value, flags);
            }
            else {
                obj[this.name] = value;
            }
        }
        else {
            this.object.assign(flags, scope, hostScope, locator, { [this.name]: value });
        }
        return value;
    }
    connect(flags, scope, hostScope, binding) {
        const obj = this.object.evaluate(flags, scope, hostScope, binding.locator, null);
        if ((flags & 2048 /* observeLeafPropertiesOnly */) === 0) {
            this.object.connect(flags, scope, hostScope, binding);
        }
        if (obj instanceof Object) {
            binding.observeProperty(flags, obj, this.name);
        }
    }
    accept(visitor) {
        return visitor.visitAccessMember(this);
    }
}
export class AccessKeyedExpression {
    constructor(object, key) {
        this.object = object;
        this.key = key;
    }
    get $kind() { return 9324 /* AccessKeyed */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const instance = this.object.evaluate(flags, scope, hostScope, locator, connectable);
        if (instance instanceof Object) {
            const key = this.key.evaluate(flags, scope, hostScope, locator, connectable);
            if (connectable != null) {
                connectable.observeProperty(flags, instance, key);
            }
            return instance[key];
        }
        return void 0;
    }
    assign(flags, scope, hostScope, locator, value) {
        const instance = this.object.evaluate(flags, scope, hostScope, locator, null);
        const key = this.key.evaluate(flags, scope, hostScope, locator, null);
        return instance[key] = value;
    }
    connect(flags, scope, hostScope, binding) {
        const obj = this.object.evaluate(flags, scope, hostScope, binding.locator, null);
        if ((flags & 2048 /* observeLeafPropertiesOnly */) === 0) {
            this.object.connect(flags, scope, hostScope, binding);
        }
        if (obj instanceof Object) {
            this.key.connect(flags, scope, hostScope, binding);
            const key = this.key.evaluate(flags, scope, hostScope, binding.locator, null);
            // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
            binding.observeProperty(flags, obj, key);
        }
    }
    accept(visitor) {
        return visitor.visitAccessKeyed(this);
    }
}
export class CallScopeExpression {
    constructor(name, args, ancestor = 0, accessHostScope = false) {
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
        this.accessHostScope = accessHostScope;
    }
    get $kind() { return 1448 /* CallScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        scope = chooseScope(this.accessHostScope, scope, hostScope);
        const args = evalList(flags, scope, locator, this.args, hostScope, connectable);
        const context = BindingContext.get(scope, this.name, this.ancestor, flags, hostScope);
        // ideally, should observe property represents by this.name as well
        // because it could be changed
        // todo: did it ever surprise anyone?
        const func = getFunction(flags, context, this.name);
        if (func) {
            return func.apply(context, args);
        }
        return void 0;
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const args = this.args;
        for (let i = 0, ii = args.length; i < ii; ++i) {
            args[i].connect(flags, scope, hostScope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitCallScope(this);
    }
}
export class CallMemberExpression {
    constructor(object, name, args) {
        this.object = object;
        this.name = name;
        this.args = args;
    }
    get $kind() { return 1161 /* CallMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const instance = this.object.evaluate(flags, scope, hostScope, locator, connectable);
        const args = evalList(flags, scope, locator, this.args, hostScope, connectable);
        const func = getFunction(flags, instance, this.name);
        if (func) {
            return func.apply(instance, args);
        }
        return void 0;
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const obj = this.object.evaluate(flags, scope, hostScope, binding.locator, null);
        if ((flags & 2048 /* observeLeafPropertiesOnly */) === 0) {
            this.object.connect(flags, scope, hostScope, binding);
        }
        if (getFunction(flags & ~128 /* mustEvaluate */, obj, this.name)) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, hostScope, binding);
            }
        }
    }
    accept(visitor) {
        return visitor.visitCallMember(this);
    }
}
export class CallFunctionExpression {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }
    get $kind() { return 1162 /* CallFunction */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const func = this.func.evaluate(flags, scope, hostScope, locator, connectable);
        if (typeof func === 'function') {
            return func(...evalList(flags, scope, locator, this.args, hostScope, connectable));
        }
        if (!(flags & 128 /* mustEvaluate */) && (func == null)) {
            return void 0;
        }
        throw Reporter.error(207 /* NotAFunction */, this);
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const func = this.func.evaluate(flags, scope, hostScope, binding.locator, null);
        this.func.connect(flags, scope, hostScope, binding);
        if (typeof func === 'function') {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, hostScope, binding);
            }
        }
    }
    accept(visitor) {
        return visitor.visitCallFunction(this);
    }
}
export class BinaryExpression {
    constructor(operation, left, right) {
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    get $kind() { return 46 /* Binary */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        switch (this.operation) {
            case '&&':
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return this.left.evaluate(f, s, hs, l, c) && this.right.evaluate(f, s, hs, l, c);
            case '||':
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return this.left.evaluate(f, s, hs, l, c) || this.right.evaluate(f, s, hs, l, c);
            case '==':
                // eslint-disable-next-line eqeqeq
                return this.left.evaluate(f, s, hs, l, c) == this.right.evaluate(f, s, hs, l, c);
            case '===':
                return this.left.evaluate(f, s, hs, l, c) === this.right.evaluate(f, s, hs, l, c);
            case '!=':
                // eslint-disable-next-line eqeqeq
                return this.left.evaluate(f, s, hs, l, c) != this.right.evaluate(f, s, hs, l, c);
            case '!==':
                return this.left.evaluate(f, s, hs, l, c) !== this.right.evaluate(f, s, hs, l, c);
            case 'instanceof': {
                const right = this.right.evaluate(f, s, hs, l, c);
                if (typeof right === 'function') {
                    return this.left.evaluate(f, s, hs, l, c) instanceof right;
                }
                return false;
            }
            case 'in': {
                const right = this.right.evaluate(f, s, hs, l, c);
                if (right instanceof Object) {
                    return this.left.evaluate(f, s, hs, l, c) in right;
                }
                return false;
            }
            // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
            // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
            // this makes bugs in user code easier to track down for end users
            // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
            case '+': {
                const left = this.left.evaluate(f, s, hs, l, c);
                const right = this.right.evaluate(f, s, hs, l, c);
                if ((f & 4 /* isStrictBindingStrategy */) > 0) {
                    return left + right;
                }
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!left || !right) {
                    if (isNumberOrBigInt(left) || isNumberOrBigInt(right)) {
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        return (left || 0) + (right || 0);
                    }
                    if (isStringOrDate(left) || isStringOrDate(right)) {
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        return (left || '') + (right || '');
                    }
                }
                return left + right;
            }
            case '-':
                return this.left.evaluate(f, s, hs, l, c) - this.right.evaluate(f, s, hs, l, c);
            case '*':
                return this.left.evaluate(f, s, hs, l, c) * this.right.evaluate(f, s, hs, l, c);
            case '/':
                return this.left.evaluate(f, s, hs, l, c) / this.right.evaluate(f, s, hs, l, c);
            case '%':
                return this.left.evaluate(f, s, hs, l, c) % this.right.evaluate(f, s, hs, l, c);
            case '<':
                return this.left.evaluate(f, s, hs, l, c) < this.right.evaluate(f, s, hs, l, c);
            case '>':
                return this.left.evaluate(f, s, hs, l, c) > this.right.evaluate(f, s, hs, l, c);
            case '<=':
                return this.left.evaluate(f, s, hs, l, c) <= this.right.evaluate(f, s, hs, l, c);
            case '>=':
                return this.left.evaluate(f, s, hs, l, c) >= this.right.evaluate(f, s, hs, l, c);
            default:
                throw Reporter.error(208 /* UnknownOperator */, this);
        }
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        this.left.connect(flags, scope, hostScope, binding);
        this.right.connect(flags, scope, hostScope, binding);
    }
    accept(visitor) {
        return visitor.visitBinary(this);
    }
}
export class UnaryExpression {
    constructor(operation, expression) {
        this.operation = operation;
        this.expression = expression;
    }
    get $kind() { return 39 /* Unary */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        switch (this.operation) {
            case 'void':
                return void this.expression.evaluate(f, s, hs, l, c);
            case 'typeof':
                return typeof this.expression.evaluate(f | 4 /* isStrictBindingStrategy */, s, hs, l, c);
            case '!':
                return !this.expression.evaluate(f, s, hs, l, c);
            case '-':
                return -this.expression.evaluate(f, s, hs, l, c);
            case '+':
                return +this.expression.evaluate(f, s, hs, l, c);
            default:
                throw Reporter.error(208 /* UnknownOperator */, this);
        }
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        this.expression.connect(flags, scope, hostScope, binding);
    }
    accept(visitor) {
        return visitor.visitUnary(this);
    }
}
export class PrimitiveLiteralExpression {
    constructor(value) {
        this.value = value;
    }
    get $kind() { return 17925 /* PrimitiveLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        return this.value;
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        return;
    }
    accept(visitor) {
        return visitor.visitPrimitiveLiteral(this);
    }
}
PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);
PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);
PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);
PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);
PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression('');
export class HtmlLiteralExpression {
    constructor(parts) {
        this.parts = parts;
    }
    get $kind() { return 51 /* HtmlLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const elements = this.parts;
        let result = '';
        let value;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            value = elements[i].evaluate(flags, scope, hostScope, locator, connectable);
            if (value == null) {
                continue;
            }
            result += value;
        }
        return result;
    }
    assign(flags, scope, hostScope, locator, obj, rojection) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        for (let i = 0, ii = this.parts.length; i < ii; ++i) {
            this.parts[i].connect(flags, scope, hostScope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitHtmlLiteral(this);
    }
}
export class ArrayLiteralExpression {
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 17955 /* ArrayLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const elements = this.elements;
        const length = elements.length;
        const result = Array(length);
        for (let i = 0; i < length; ++i) {
            result[i] = elements[i].evaluate(flags, scope, hostScope, locator, connectable);
        }
        return result;
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const elements = this.elements;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            elements[i].connect(flags, scope, hostScope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitArrayLiteral(this);
    }
}
ArrayLiteralExpression.$empty = new ArrayLiteralExpression(PLATFORM.emptyArray);
export class ObjectLiteralExpression {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 17956 /* ObjectLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const instance = {};
        const keys = this.keys;
        const values = this.values;
        for (let i = 0, ii = keys.length; i < ii; ++i) {
            instance[keys[i]] = values[i].evaluate(flags, scope, hostScope, locator, connectable);
        }
        return instance;
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const keys = this.keys;
        const values = this.values;
        for (let i = 0, ii = keys.length; i < ii; ++i) {
            values[i].connect(flags, scope, hostScope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitObjectLiteral(this);
    }
}
ObjectLiteralExpression.$empty = new ObjectLiteralExpression(PLATFORM.emptyArray, PLATFORM.emptyArray);
export class TemplateExpression {
    constructor(cooked, expressions = PLATFORM.emptyArray) {
        this.cooked = cooked;
        this.expressions = expressions;
    }
    get $kind() { return 17958 /* Template */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const expressions = this.expressions;
        const cooked = this.cooked;
        let result = cooked[0];
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            result += expressions[i].evaluate(flags, scope, hostScope, locator, connectable);
            result += cooked[i + 1];
        }
        return result;
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const expressions = this.expressions;
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            expressions[i].connect(flags, scope, hostScope, binding);
            i++;
        }
    }
    accept(visitor) {
        return visitor.visitTemplate(this);
    }
}
TemplateExpression.$empty = new TemplateExpression(['']);
export class TaggedTemplateExpression {
    constructor(cooked, raw, func, expressions = PLATFORM.emptyArray) {
        this.cooked = cooked;
        this.func = func;
        this.expressions = expressions;
        cooked.raw = raw;
    }
    get $kind() { return 1197 /* TaggedTemplate */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        const expressions = this.expressions;
        const len = expressions.length;
        const results = Array(len);
        for (let i = 0, ii = len; i < ii; ++i) {
            results[i] = expressions[i].evaluate(flags, scope, hostScope, locator, connectable);
        }
        const func = this.func.evaluate(flags, scope, hostScope, locator, connectable);
        if (typeof func !== 'function') {
            throw Reporter.error(207 /* NotAFunction */, this);
        }
        return func(this.cooked, ...results);
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        const expressions = this.expressions;
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            expressions[i].connect(flags, scope, hostScope, binding);
        }
        this.func.connect(flags, scope, hostScope, binding);
    }
    accept(visitor) {
        return visitor.visitTaggedTemplate(this);
    }
}
export class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 65556 /* ArrayBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        // TODO
        return void 0;
    }
    assign(flags, scope, hostScope, locator, obj) {
        // TODO
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        return;
    }
    accept(visitor) {
        return visitor.visitArrayBindingPattern(this);
    }
}
export class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 65557 /* ObjectBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        // TODO
        return void 0;
    }
    assign(flags, scope, hostScope, locator, obj) {
        // TODO
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        return;
    }
    accept(visitor) {
        return visitor.visitObjectBindingPattern(this);
    }
}
export class BindingIdentifier {
    constructor(name) {
        this.name = name;
    }
    get $kind() { return 65558 /* BindingIdentifier */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        return this.name;
    }
    connect(flags, scope, hostScope, binding) {
        return;
    }
    accept(visitor) {
        return visitor.visitBindingIdentifier(this);
    }
}
const toStringTag = Object.prototype.toString;
// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement {
    constructor(declaration, iterable) {
        this.declaration = declaration;
        this.iterable = iterable;
    }
    get $kind() { return 6199 /* ForOfStatement */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        return this.iterable.evaluate(flags, scope, hostScope, locator, connectable);
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    count(flags, result) {
        switch (toStringTag.call(result)) {
            case '[object Array]': return result.length;
            case '[object Map]': return result.size;
            case '[object Set]': return result.size;
            case '[object Number]': return result;
            case '[object Null]': return 0;
            case '[object Undefined]': return 0;
            default: throw Reporter.error(0); // TODO: Set error code
        }
    }
    iterate(flags, result, func) {
        switch (toStringTag.call(result)) {
            case '[object Array]': return $array(flags, result, func);
            case '[object Map]': return $map(flags, result, func);
            case '[object Set]': return $set(flags, result, func);
            case '[object Number]': return $number(flags, result, func);
            case '[object Null]': return;
            case '[object Undefined]': return;
            default: throw Reporter.error(0); // TODO: Set error code
        }
    }
    connect(flags, scope, hostScope, binding) {
        this.declaration.connect(flags, scope, hostScope, binding);
        this.iterable.connect(flags, scope, hostScope, binding);
    }
    bind(flags, scope, hostScope, binding) {
        if (this.iterable.hasBind) {
            this.iterable.bind(flags, scope, hostScope, binding);
        }
    }
    unbind(flags, scope, hostScope, binding) {
        if (this.iterable.hasUnbind) {
            this.iterable.unbind(flags, scope, hostScope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitForOfStatement(this);
    }
}
/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
export class Interpolation {
    constructor(parts, expressions = PLATFORM.emptyArray) {
        this.parts = parts;
        this.expressions = expressions;
        this.isMulti = expressions.length > 1;
        this.firstExpression = expressions[0];
    }
    get $kind() { return 24 /* Interpolation */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(flags, scope, hostScope, locator, connectable) {
        if (this.isMulti) {
            const expressions = this.expressions;
            const parts = this.parts;
            let result = parts[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, hostScope, locator, connectable);
                result += parts[i + 1];
            }
            return result;
        }
        else {
            const parts = this.parts;
            return `${parts[0]}${this.firstExpression.evaluate(flags, scope, hostScope, locator, connectable)}${parts[1]}`;
        }
    }
    assign(flags, scope, hostScope, locator, obj) {
        return void 0;
    }
    connect(flags, scope, hostScope, binding) {
        return;
    }
    accept(visitor) {
        return visitor.visitInterpolation(this);
    }
}
/// Evaluate the [list] in context of the [scope].
function evalList(flags, scope, locator, list, hostScope, connectable) {
    const len = list.length;
    const result = Array(len);
    for (let i = 0; i < len; ++i) {
        result[i] = list[i].evaluate(flags, scope, hostScope, locator, connectable);
    }
    return result;
}
function getFunction(flags, obj, name) {
    const func = obj == null ? null : obj[name];
    if (typeof func === 'function') {
        return func;
    }
    if (!(flags & 128 /* mustEvaluate */) && func == null) {
        return null;
    }
    throw Reporter.error(207 /* NotAFunction */, obj, name, func);
}
const proxyAndOriginalArray = 2 /* proxyStrategy */;
function $array(flags, result, func) {
    if ((flags & proxyAndOriginalArray) === proxyAndOriginalArray) {
        // If we're in proxy mode, and the array is the original "items" (and not an array we created here to iterate over e.g. a set)
        // then replace all items (which are Objects) with proxies so their properties are observed in the source view model even if no
        // observers are explicitly created
        const rawArray = ProxyObserver.getRawIfProxy(result);
        const len = rawArray.length;
        let item;
        let i = 0;
        for (; i < len; ++i) {
            item = rawArray[i];
            if (item instanceof Object) {
                item = rawArray[i] = ProxyObserver.getOrCreate(item).proxy;
            }
            func(rawArray, i, item);
        }
    }
    else {
        for (let i = 0, ii = result.length; i < ii; ++i) {
            func(result, i, result[i]);
        }
    }
}
function $map(flags, result, func) {
    const arr = Array(result.size);
    let i = -1;
    for (const entry of result.entries()) {
        arr[++i] = entry;
    }
    $array(flags, arr, func);
}
function $set(flags, result, func) {
    const arr = Array(result.size);
    let i = -1;
    for (const key of result.keys()) {
        arr[++i] = key;
    }
    $array(flags, arr, func);
}
function $number(flags, result, func) {
    const arr = Array(result);
    for (let i = 0; i < result; ++i) {
        arr[i] = i;
    }
    $array(flags, arr, func);
}
//# sourceMappingURL=ast.js.map