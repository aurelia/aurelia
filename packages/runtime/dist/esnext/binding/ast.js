import { isNumeric, PLATFORM, Reporter, isNumberOrBigInt, isStringOrDate, } from '@aurelia/kernel';
import { BindingContext } from '../observation/binding-context';
import { ProxyObserver } from '../observation/proxy-observer';
import { ISignaler } from '../observation/signaler';
import { BindingBehavior, } from '../resources/binding-behavior';
import { ValueConverter, } from '../resources/value-converter';
export function connects(expr) {
    return (expr.$kind & 32 /* Connects */) === 32 /* Connects */;
}
export function observes(expr) {
    return (expr.$kind & 64 /* Observes */) === 64 /* Observes */;
}
export function callsFunction(expr) {
    return (expr.$kind & 128 /* CallsFunction */) === 128 /* CallsFunction */;
}
export function hasAncestor(expr) {
    return (expr.$kind & 256 /* HasAncestor */) === 256 /* HasAncestor */;
}
export function isAssignable(expr) {
    return (expr.$kind & 8192 /* IsAssignable */) === 8192 /* IsAssignable */;
}
export function isLeftHandSide(expr) {
    return (expr.$kind & 1024 /* IsLeftHandSide */) === 1024 /* IsLeftHandSide */;
}
export function isPrimary(expr) {
    return (expr.$kind & 512 /* IsPrimary */) === 512 /* IsPrimary */;
}
export function isResource(expr) {
    return (expr.$kind & 32768 /* IsResource */) === 32768 /* IsResource */;
}
export function hasBind(expr) {
    return (expr.$kind & 2048 /* HasBind */) === 2048 /* HasBind */;
}
export function hasUnbind(expr) {
    return (expr.$kind & 4096 /* HasUnbind */) === 4096 /* HasUnbind */;
}
export function isLiteral(expr) {
    return (expr.$kind & 16384 /* IsLiteral */) === 16384 /* IsLiteral */;
}
export function arePureLiterals(expressions) {
    if (expressions === void 0 || expressions.length === 0) {
        return true;
    }
    for (let i = 0; i < expressions.length; ++i) {
        if (!isPureLiteral(expressions[i])) {
            return false;
        }
    }
    return true;
}
export function isPureLiteral(expr) {
    if (isLiteral(expr)) {
        switch (expr.$kind) {
            case 17955 /* ArrayLiteral */:
                return arePureLiterals(expr.elements);
            case 17956 /* ObjectLiteral */:
                return arePureLiterals(expr.values);
            case 17958 /* Template */:
                return arePureLiterals(expr.expressions);
            case 17925 /* PrimitiveLiteral */:
                return true;
        }
    }
    return false;
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
    evaluate(flags, scope, locator, part) {
        return this.value;
    }
}
export class BindingBehaviorExpression {
    constructor(expression, name, args) {
        this.$kind = 38962 /* BindingBehavior */;
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.behaviorKey = BindingBehavior.keyFrom(this.name);
    }
    evaluate(flags, scope, locator, part) {
        return this.expression.evaluate(flags, scope, locator, part);
    }
    assign(flags, scope, locator, value, part) {
        return this.expression.assign(flags, scope, locator, value, part);
    }
    connect(flags, scope, binding, part) {
        this.expression.connect(flags, scope, binding, part);
    }
    bind(flags, scope, binding) {
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
        if (hasBind(this.expression)) {
            this.expression.bind(flags, scope, binding);
        }
        const behaviorKey = this.behaviorKey;
        const behavior = locator.get(behaviorKey);
        if (!behavior) {
            throw Reporter.error(203 /* NoBehaviorFound */, this);
        }
        if (binding[behaviorKey] === void 0) {
            binding[behaviorKey] = behavior;
            behavior.bind.call(behavior, flags, scope, binding, ...evalList(flags, scope, locator, this.args));
        }
        else {
            Reporter.write(204 /* BehaviorAlreadyApplied */, this);
        }
    }
    unbind(flags, scope, binding) {
        const behaviorKey = this.behaviorKey;
        if (binding[behaviorKey] !== void 0) {
            binding[behaviorKey].unbind(flags, scope, binding);
            binding[behaviorKey] = void 0;
        }
        else {
            // TODO: this is a temporary hack to make testing repeater keyed mode easier,
            // we should remove this idempotency again when track-by attribute is implemented
            Reporter.write(204 /* BehaviorAlreadyApplied */, this);
        }
        if (hasUnbind(this.expression)) {
            this.expression.unbind(flags, scope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitBindingBehavior(this);
    }
}
export class ValueConverterExpression {
    constructor(expression, name, args) {
        this.$kind = 36913 /* ValueConverter */;
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.converterKey = ValueConverter.keyFrom(this.name);
    }
    evaluate(flags, scope, locator, part) {
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
            result[0] = this.expression.evaluate(flags, scope, locator, part);
            for (let i = 0; i < len; ++i) {
                result[i + 1] = args[i].evaluate(flags, scope, locator, part);
            }
            return converter.toView.call(converter, ...result);
        }
        return this.expression.evaluate(flags, scope, locator, part);
    }
    assign(flags, scope, locator, value, part) {
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        if ('fromView' in converter) {
            value = converter.fromView.call(converter, value, ...(evalList(flags, scope, locator, this.args)));
        }
        return this.expression.assign(flags, scope, locator, value, part);
    }
    connect(flags, scope, binding, part) {
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
        this.expression.connect(flags, scope, binding, part);
        const args = this.args;
        for (let i = 0, ii = args.length; i < ii; ++i) {
            args[i].connect(flags, scope, binding, part);
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
    unbind(flags, scope, binding) {
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
        this.$kind = 8208 /* Assign */;
        this.target = target;
        this.value = value;
    }
    evaluate(flags, scope, locator, part) {
        return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator), part);
    }
    connect(flags, scope, binding, part) {
        return;
    }
    assign(flags, scope, locator, value, part) {
        this.value.assign(flags, scope, locator, value, part);
        return this.target.assign(flags, scope, locator, value, part);
    }
    accept(visitor) {
        return visitor.visitAssign(this);
    }
}
export class ConditionalExpression {
    constructor(condition, yes, no) {
        this.$kind = 63 /* Conditional */;
        this.assign = PLATFORM.noop;
        this.condition = condition;
        this.yes = yes;
        this.no = no;
    }
    evaluate(flags, scope, locator, part) {
        return (!!this.condition.evaluate(flags, scope, locator, part))
            ? this.yes.evaluate(flags, scope, locator, part)
            : this.no.evaluate(flags, scope, locator, part);
    }
    connect(flags, scope, binding, part) {
        const condition = this.condition;
        if (condition.evaluate(flags, scope, null, part)) {
            this.condition.connect(flags, scope, binding, part);
            this.yes.connect(flags, scope, binding, part);
        }
        else {
            this.condition.connect(flags, scope, binding, part);
            this.no.connect(flags, scope, binding, part);
        }
    }
    accept(visitor) {
        return visitor.visitConditional(this);
    }
}
export class AccessThisExpression {
    constructor(ancestor = 0) {
        this.$kind = 1793 /* AccessThis */;
        this.assign = PLATFORM.noop;
        this.connect = PLATFORM.noop;
        this.ancestor = ancestor;
    }
    evaluate(flags, scope, locator, part) {
        if (scope == null) {
            throw Reporter.error(250 /* NilScope */, this);
        }
        if ((flags & 67108864 /* allowParentScopeTraversal */) > 0) {
            let parent = scope.parentScope;
            while (parent !== null) {
                if (!parent.scopeParts.includes(part)) {
                    parent = parent.parentScope;
                }
            }
            if (parent === null) {
                throw new Error(`No target scope cold be found for part "${part}"`);
            }
        }
        let oc = scope.overrideContext;
        let i = this.ancestor;
        while (i-- && oc) {
            oc = oc.parentOverrideContext;
        }
        return i < 1 && oc ? oc.bindingContext : void 0;
    }
    accept(visitor) {
        return visitor.visitAccessThis(this);
    }
}
AccessThisExpression.$this = new AccessThisExpression(0);
AccessThisExpression.$parent = new AccessThisExpression(1);
export class AccessScopeExpression {
    constructor(name, ancestor = 0) {
        this.$kind = 10082 /* AccessScope */;
        this.name = name;
        this.ancestor = ancestor;
    }
    evaluate(flags, scope, locator, part) {
        const obj = BindingContext.get(scope, this.name, this.ancestor, flags, part);
        const evaluatedValue = obj[this.name];
        if (flags & 4 /* isStrictBindingStrategy */) {
            return evaluatedValue;
        }
        return evaluatedValue == null ? '' : evaluatedValue;
    }
    assign(flags, scope, locator, value, part) {
        const obj = BindingContext.get(scope, this.name, this.ancestor, flags, part);
        if (obj instanceof Object) {
            if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                obj.$observers[this.name].setValue(value, flags);
                return value;
            }
            else {
                return obj[this.name] = value;
            }
        }
        return void 0;
    }
    connect(flags, scope, binding, part) {
        const context = BindingContext.get(scope, this.name, this.ancestor, flags, part);
        binding.observeProperty(flags, context, this.name);
    }
    accept(visitor) {
        return visitor.visitAccessScope(this);
    }
}
export class AccessMemberExpression {
    constructor(object, name) {
        this.$kind = 9323 /* AccessMember */;
        this.object = object;
        this.name = name;
    }
    evaluate(flags, scope, locator, part) {
        const instance = this.object.evaluate(flags, scope, locator, part);
        if (flags & 4 /* isStrictBindingStrategy */) {
            return instance == null ? instance : instance[this.name];
        }
        return instance ? instance[this.name] : '';
    }
    assign(flags, scope, locator, value, part) {
        const obj = this.object.evaluate(flags, scope, locator, part);
        if (obj instanceof Object) {
            if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                obj.$observers[this.name].setValue(value, flags);
            }
            else {
                obj[this.name] = value;
            }
        }
        else {
            this.object.assign(flags, scope, locator, { [this.name]: value });
        }
        return value;
    }
    connect(flags, scope, binding, part) {
        const obj = this.object.evaluate(flags, scope, null, part);
        if ((flags & 134217728 /* observeLeafPropertiesOnly */) === 0) {
            this.object.connect(flags, scope, binding, part);
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
        this.$kind = 9324 /* AccessKeyed */;
        this.object = object;
        this.key = key;
    }
    evaluate(flags, scope, locator, part) {
        const instance = this.object.evaluate(flags, scope, locator, part);
        if (instance instanceof Object) {
            const key = this.key.evaluate(flags, scope, locator, part);
            return instance[key];
        }
        return void 0;
    }
    assign(flags, scope, locator, value, part) {
        const instance = this.object.evaluate(flags, scope, locator, part);
        const key = this.key.evaluate(flags, scope, locator, part);
        return instance[key] = value;
    }
    connect(flags, scope, binding, part) {
        const obj = this.object.evaluate(flags, scope, null, part);
        if ((flags & 134217728 /* observeLeafPropertiesOnly */) === 0) {
            this.object.connect(flags, scope, binding, part);
        }
        if (obj instanceof Object) {
            this.key.connect(flags, scope, binding, part);
            const key = this.key.evaluate(flags, scope, null, part);
            if (Array.isArray(obj) && isNumeric(key)) {
                // Only observe array indexers in proxy mode
                if (flags & 2 /* proxyStrategy */) {
                    binding.observeProperty(flags, obj, key);
                }
            }
            else {
                // observe the property represented by the key as long as it's not an array indexer
                // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
                binding.observeProperty(flags, obj, key);
            }
        }
    }
    accept(visitor) {
        return visitor.visitAccessKeyed(this);
    }
}
export class CallScopeExpression {
    constructor(name, args, ancestor = 0) {
        this.$kind = 1448 /* CallScope */;
        this.assign = PLATFORM.noop;
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
    }
    evaluate(flags, scope, locator, part) {
        const args = evalList(flags, scope, locator, this.args, part);
        const context = BindingContext.get(scope, this.name, this.ancestor, flags, part);
        const func = getFunction(flags, context, this.name);
        if (func) {
            return func.apply(context, args);
        }
        return void 0;
    }
    connect(flags, scope, binding, part) {
        const args = this.args;
        for (let i = 0, ii = args.length; i < ii; ++i) {
            args[i].connect(flags, scope, binding, part);
        }
    }
    accept(visitor) {
        return visitor.visitCallScope(this);
    }
}
export class CallMemberExpression {
    constructor(object, name, args) {
        this.$kind = 1161 /* CallMember */;
        this.assign = PLATFORM.noop;
        this.object = object;
        this.name = name;
        this.args = args;
    }
    evaluate(flags, scope, locator, part) {
        const instance = this.object.evaluate(flags, scope, locator, part);
        const args = evalList(flags, scope, locator, this.args, part);
        const func = getFunction(flags, instance, this.name);
        if (func) {
            return func.apply(instance, args);
        }
        return void 0;
    }
    connect(flags, scope, binding, part) {
        const obj = this.object.evaluate(flags, scope, null, part);
        if ((flags & 134217728 /* observeLeafPropertiesOnly */) === 0) {
            this.object.connect(flags, scope, binding, part);
        }
        if (getFunction(flags & ~2097152 /* mustEvaluate */, obj, this.name)) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding, part);
            }
        }
    }
    accept(visitor) {
        return visitor.visitCallMember(this);
    }
}
export class CallFunctionExpression {
    constructor(func, args) {
        this.$kind = 1162 /* CallFunction */;
        this.assign = PLATFORM.noop;
        this.func = func;
        this.args = args;
    }
    evaluate(flags, scope, locator, part) {
        const func = this.func.evaluate(flags, scope, locator, part);
        if (typeof func === 'function') {
            return func(...evalList(flags, scope, locator, this.args, part));
        }
        if (!(flags & 2097152 /* mustEvaluate */) && (func == null)) {
            return void 0;
        }
        throw Reporter.error(207 /* NotAFunction */, this);
    }
    connect(flags, scope, binding, part) {
        const func = this.func.evaluate(flags, scope, null, part);
        this.func.connect(flags, scope, binding, part);
        if (typeof func === 'function') {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding, part);
            }
        }
    }
    accept(visitor) {
        return visitor.visitCallFunction(this);
    }
}
export class BinaryExpression {
    constructor(operation, left, right) {
        this.$kind = 46 /* Binary */;
        this.assign = PLATFORM.noop;
        this.operation = operation;
        this.left = left;
        this.right = right;
        // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
        // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
        // work to do; we can do this because the operation can't change after it's parsed
        this.evaluate = this[operation];
    }
    evaluate(flags, scope, locator, part) {
        throw Reporter.error(208 /* UnknownOperator */, this);
    }
    connect(flags, scope, binding, part) {
        this.left.connect(flags, scope, binding, part);
        this.right.connect(flags, scope, binding, part);
    }
    ['&&'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) && this.right.evaluate(f, s, l, p);
    }
    ['||'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) || this.right.evaluate(f, s, l, p);
    }
    ['=='](f, s, l, p) {
        // eslint-disable-next-line eqeqeq
        return this.left.evaluate(f, s, l, p) == this.right.evaluate(f, s, l, p);
    }
    ['==='](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) === this.right.evaluate(f, s, l, p);
    }
    ['!='](f, s, l, p) {
        // eslint-disable-next-line eqeqeq
        return this.left.evaluate(f, s, l, p) != this.right.evaluate(f, s, l, p);
    }
    ['!=='](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) !== this.right.evaluate(f, s, l, p);
    }
    ['instanceof'](f, s, l, p) {
        const right = this.right.evaluate(f, s, l, p);
        if (typeof right === 'function') {
            return this.left.evaluate(f, s, l, p) instanceof right;
        }
        return false;
    }
    ['in'](f, s, l, p) {
        const right = this.right.evaluate(f, s, l, p);
        if (right instanceof Object) {
            return this.left.evaluate(f, s, l, p) in right;
        }
        return false;
    }
    // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
    // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
    // this makes bugs in user code easier to track down for end users
    // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
    ['+'](f, s, l, p) {
        const left = this.left.evaluate(f, s, l, p);
        const right = this.right.evaluate(f, s, l, p);
        if ((f & 4 /* isStrictBindingStrategy */) > 0) {
            return left + right;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!left || !right) {
            if (isNumberOrBigInt(left) || isNumberOrBigInt(right)) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
                return (left || 0) + (right || 0);
            }
            if (isStringOrDate(left) || isStringOrDate(right)) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
                return (left || '') + (right || '');
            }
        }
        return left + right;
    }
    ['-'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) - this.right.evaluate(f, s, l, p);
    }
    ['*'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) * this.right.evaluate(f, s, l, p);
    }
    ['/'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) / this.right.evaluate(f, s, l, p);
    }
    ['%'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) % this.right.evaluate(f, s, l, p);
    }
    ['<'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) < this.right.evaluate(f, s, l, p);
    }
    ['>'](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) > this.right.evaluate(f, s, l, p);
    }
    ['<='](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) <= this.right.evaluate(f, s, l, p);
    }
    ['>='](f, s, l, p) {
        return this.left.evaluate(f, s, l, p) >= this.right.evaluate(f, s, l, p);
    }
    accept(visitor) {
        return visitor.visitBinary(this);
    }
}
export class UnaryExpression {
    constructor(operation, expression) {
        this.$kind = 39 /* Unary */;
        this.assign = PLATFORM.noop;
        this.operation = operation;
        this.expression = expression;
        // see Binary (we're doing the same thing here)
        this.evaluate = this[operation];
    }
    evaluate(flags, scope, locator, part) {
        throw Reporter.error(208 /* UnknownOperator */, this);
    }
    connect(flags, scope, binding, part) {
        this.expression.connect(flags, scope, binding, part);
    }
    ['void'](f, s, l, p) {
        return void this.expression.evaluate(f, s, l, p);
    }
    ['typeof'](f, s, l, p) {
        return typeof this.expression.evaluate(f | 4 /* isStrictBindingStrategy */, s, l, p);
    }
    ['!'](f, s, l, p) {
        return !this.expression.evaluate(f, s, l, p);
    }
    ['-'](f, s, l, p) {
        return -this.expression.evaluate(f, s, l, p);
    }
    ['+'](f, s, l, p) {
        return +this.expression.evaluate(f, s, l, p);
    }
    accept(visitor) {
        return visitor.visitUnary(this);
    }
}
export class PrimitiveLiteralExpression {
    constructor(value) {
        this.$kind = 17925 /* PrimitiveLiteral */;
        this.assign = PLATFORM.noop;
        this.connect = PLATFORM.noop;
        this.value = value;
    }
    evaluate(flags, scope, locator, part) {
        return this.value;
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
        this.$kind = 51 /* HtmlLiteral */;
        this.assign = PLATFORM.noop;
        this.parts = parts;
    }
    evaluate(flags, scope, locator, part) {
        const elements = this.parts;
        let result = '';
        let value;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            value = elements[i].evaluate(flags, scope, locator, part);
            if (value == null) {
                continue;
            }
            result += value;
        }
        return result;
    }
    connect(flags, scope, binding, part) {
        for (let i = 0, ii = this.parts.length; i < ii; ++i) {
            this.parts[i].connect(flags, scope, binding, part);
        }
    }
    accept(visitor) {
        return visitor.visitHtmlLiteral(this);
    }
}
export class ArrayLiteralExpression {
    constructor(elements) {
        this.$kind = 17955 /* ArrayLiteral */;
        this.assign = PLATFORM.noop;
        this.elements = elements;
    }
    evaluate(flags, scope, locator, part) {
        const elements = this.elements;
        const length = elements.length;
        const result = Array(length);
        for (let i = 0; i < length; ++i) {
            result[i] = elements[i].evaluate(flags, scope, locator, part);
        }
        return result;
    }
    connect(flags, scope, binding, part) {
        const elements = this.elements;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            elements[i].connect(flags, scope, binding, part);
        }
    }
    accept(visitor) {
        return visitor.visitArrayLiteral(this);
    }
}
ArrayLiteralExpression.$empty = new ArrayLiteralExpression(PLATFORM.emptyArray);
export class ObjectLiteralExpression {
    constructor(keys, values) {
        this.$kind = 17956 /* ObjectLiteral */;
        this.assign = PLATFORM.noop;
        this.keys = keys;
        this.values = values;
    }
    evaluate(flags, scope, locator, part) {
        const instance = {};
        const keys = this.keys;
        const values = this.values;
        for (let i = 0, ii = keys.length; i < ii; ++i) {
            instance[keys[i]] = values[i].evaluate(flags, scope, locator, part);
        }
        return instance;
    }
    connect(flags, scope, binding, part) {
        const keys = this.keys;
        const values = this.values;
        for (let i = 0, ii = keys.length; i < ii; ++i) {
            values[i].connect(flags, scope, binding, part);
        }
    }
    accept(visitor) {
        return visitor.visitObjectLiteral(this);
    }
}
ObjectLiteralExpression.$empty = new ObjectLiteralExpression(PLATFORM.emptyArray, PLATFORM.emptyArray);
export class TemplateExpression {
    constructor(cooked, expressions) {
        this.$kind = 17958 /* Template */;
        this.assign = PLATFORM.noop;
        this.cooked = cooked;
        this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
    }
    evaluate(flags, scope, locator, part) {
        const expressions = this.expressions;
        const cooked = this.cooked;
        let result = cooked[0];
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            result += expressions[i].evaluate(flags, scope, locator, part);
            result += cooked[i + 1];
        }
        return result;
    }
    connect(flags, scope, binding, part) {
        const expressions = this.expressions;
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            expressions[i].connect(flags, scope, binding, part);
            i++;
        }
    }
    accept(visitor) {
        return visitor.visitTemplate(this);
    }
}
TemplateExpression.$empty = new TemplateExpression(['']);
export class TaggedTemplateExpression {
    constructor(cooked, raw, func, expressions) {
        this.$kind = 1197 /* TaggedTemplate */;
        this.assign = PLATFORM.noop;
        this.cooked = cooked;
        this.cooked.raw = raw;
        this.func = func;
        this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
    }
    evaluate(flags, scope, locator, part) {
        const expressions = this.expressions;
        const len = expressions.length;
        const results = Array(len);
        for (let i = 0, ii = len; i < ii; ++i) {
            results[i] = expressions[i].evaluate(flags, scope, locator, part);
        }
        const func = this.func.evaluate(flags, scope, locator, part);
        if (typeof func !== 'function') {
            throw Reporter.error(207 /* NotAFunction */, this);
        }
        return func(this.cooked, ...results);
    }
    connect(flags, scope, binding, part) {
        const expressions = this.expressions;
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            expressions[i].connect(flags, scope, binding);
        }
        this.func.connect(flags, scope, binding);
    }
    accept(visitor) {
        return visitor.visitTaggedTemplate(this);
    }
}
export class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.$kind = 65556 /* ArrayBindingPattern */;
        this.elements = elements;
    }
    evaluate(flags, scope, locator, part) {
        // TODO
        return void 0;
    }
    assign(flags, scope, locator, obj, part) {
        // TODO
        return void 0;
    }
    connect(flags, scope, binding, part) {
        return;
    }
    accept(visitor) {
        return visitor.visitArrayBindingPattern(this);
    }
}
export class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.$kind = 65557 /* ObjectBindingPattern */;
        this.keys = keys;
        this.values = values;
    }
    evaluate(flags, scope, locator, part) {
        // TODO
        return void 0;
    }
    assign(flags, scope, locator, obj, part) {
        // TODO
        return void 0;
    }
    connect(flags, scope, binding, part) {
        return;
    }
    accept(visitor) {
        return visitor.visitObjectBindingPattern(this);
    }
}
export class BindingIdentifier {
    constructor(name) {
        this.$kind = 65558 /* BindingIdentifier */;
        this.name = name;
    }
    evaluate(flags, scope, locator, part) {
        return this.name;
    }
    connect(flags, scope, binding, part) {
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
        this.$kind = 6199 /* ForOfStatement */;
        this.assign = PLATFORM.noop;
        this.declaration = declaration;
        this.iterable = iterable;
    }
    evaluate(flags, scope, locator, part) {
        return this.iterable.evaluate(flags, scope, locator, part);
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
            case '[object Array]': return $array(flags | 8388608 /* isOriginalArray */, result, func);
            case '[object Map]': return $map(flags | 8388608 /* isOriginalArray */, result, func);
            case '[object Set]': return $set(flags | 8388608 /* isOriginalArray */, result, func);
            case '[object Number]': return $number(flags | 8388608 /* isOriginalArray */, result, func);
            case '[object Null]': return;
            case '[object Undefined]': return;
            default: throw Reporter.error(0); // TODO: Set error code
        }
    }
    connect(flags, scope, binding, part) {
        this.declaration.connect(flags, scope, binding, part);
        this.iterable.connect(flags, scope, binding, part);
    }
    bind(flags, scope, binding) {
        if (hasBind(this.iterable)) {
            this.iterable.bind(flags, scope, binding);
        }
    }
    unbind(flags, scope, binding) {
        if (hasUnbind(this.iterable)) {
            this.iterable.unbind(flags, scope, binding);
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
    constructor(parts, expressions) {
        this.$kind = 24 /* Interpolation */;
        this.assign = PLATFORM.noop;
        this.parts = parts;
        this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
        this.isMulti = this.expressions.length > 1;
        this.firstExpression = this.expressions[0];
    }
    evaluate(flags, scope, locator, part) {
        if (this.isMulti) {
            const expressions = this.expressions;
            const parts = this.parts;
            let result = parts[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, locator, part);
                result += parts[i + 1];
            }
            return result;
        }
        else {
            const parts = this.parts;
            return parts[0] + this.firstExpression.evaluate(flags, scope, locator, part) + parts[1];
        }
    }
    connect(flags, scope, binding, part) {
        return;
    }
    accept(visitor) {
        return visitor.visitInterpolation(this);
    }
}
/// Evaluate the [list] in context of the [scope].
function evalList(flags, scope, locator, list, part) {
    const len = list.length;
    const result = Array(len);
    for (let i = 0; i < len; ++i) {
        result[i] = list[i].evaluate(flags, scope, locator, part);
    }
    return result;
}
function getFunction(flags, obj, name) {
    const func = obj == null ? null : obj[name];
    if (typeof func === 'function') {
        return func;
    }
    if (!(flags & 2097152 /* mustEvaluate */) && func == null) {
        return null;
    }
    throw Reporter.error(207 /* NotAFunction */, obj, name, func);
}
const proxyAndOriginalArray = 2 /* proxyStrategy */ | 8388608 /* isOriginalArray */;
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
    $array(flags & ~8388608 /* isOriginalArray */, arr, func);
}
function $set(flags, result, func) {
    const arr = Array(result.size);
    let i = -1;
    for (const key of result.keys()) {
        arr[++i] = key;
    }
    $array(flags & ~8388608 /* isOriginalArray */, arr, func);
}
function $number(flags, result, func) {
    const arr = Array(result);
    for (let i = 0; i < result; ++i) {
        arr[i] = i;
    }
    $array(flags & ~8388608 /* isOriginalArray */, arr, func);
}
//# sourceMappingURL=ast.js.map