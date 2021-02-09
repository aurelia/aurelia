"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpolation = exports.ForOfStatement = exports.BindingIdentifier = exports.ObjectBindingPattern = exports.ArrayBindingPattern = exports.TaggedTemplateExpression = exports.TemplateExpression = exports.ObjectLiteralExpression = exports.ArrayLiteralExpression = exports.HtmlLiteralExpression = exports.PrimitiveLiteralExpression = exports.UnaryExpression = exports.BinaryExpression = exports.CallFunctionExpression = exports.CallMemberExpression = exports.CallScopeExpression = exports.AccessKeyedExpression = exports.AccessMemberExpression = exports.AccessScopeExpression = exports.AccessThisExpression = exports.ConditionalExpression = exports.AssignExpression = exports.ValueConverterExpression = exports.BindingBehaviorExpression = exports.CustomExpression = exports.Unparser = exports.ExpressionKind = void 0;
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
const kernel_1 = require("@aurelia/kernel");
const binding_context_js_1 = require("../observation/binding-context.js");
const signaler_js_1 = require("../observation/signaler.js");
const binding_behavior_js_1 = require("../binding-behavior.js");
const value_converter_js_1 = require("../value-converter.js");
var ExpressionKind;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["Connects"] = 32] = "Connects";
    ExpressionKind[ExpressionKind["Observes"] = 64] = "Observes";
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
})(ExpressionKind = exports.ExpressionKind || (exports.ExpressionKind = {}));
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
exports.Unparser = Unparser;
function chooseScope(accessHostScope, s, hs) {
    if (accessHostScope) {
        if (hs === null || hs === void 0) {
            throw new Error('Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?');
        }
        return hs;
    }
    return s;
}
class CustomExpression {
    constructor(value) {
        this.value = value;
    }
    evaluate(_f, _s, _hs, _l, _c) {
        return this.value;
    }
}
exports.CustomExpression = CustomExpression;
class BindingBehaviorExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.behaviorKey = binding_behavior_js_1.BindingBehavior.keyFrom(name);
    }
    get $kind() { return 38962 /* BindingBehavior */; }
    get hasBind() { return true; }
    get hasUnbind() { return true; }
    evaluate(f, s, hs, l, c) {
        return this.expression.evaluate(f, s, hs, l, c);
    }
    assign(f, s, hs, l, val) {
        return this.expression.assign(f, s, hs, l, val);
    }
    bind(f, s, hs, b) {
        if (this.expression.hasBind) {
            this.expression.bind(f, s, hs, b);
        }
        const behavior = b.locator.get(this.behaviorKey);
        if (behavior == null) {
            throw new Error(`BindingBehavior named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        if (!(behavior instanceof binding_behavior_js_1.BindingBehaviorFactory)) {
            if (b[this.behaviorKey] === void 0) {
                b[this.behaviorKey] = behavior;
                behavior.bind.call(behavior, f, s, hs, b, ...this.args.map(a => a.evaluate(f, s, hs, b.locator, null)));
            }
            else {
                throw new Error(`BindingBehavior named '${this.name}' already applied.`);
            }
        }
    }
    unbind(f, s, hs, b) {
        const key = this.behaviorKey;
        const $b = b;
        if ($b[key] !== void 0) {
            if (typeof $b[key].unbind === 'function') {
                $b[key].unbind(f, s, hs, b);
            }
            $b[key] = void 0;
        }
        if (this.expression.hasUnbind) {
            this.expression.unbind(f, s, hs, b);
        }
    }
    accept(visitor) {
        return visitor.visitBindingBehavior(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.BindingBehaviorExpression = BindingBehaviorExpression;
class ValueConverterExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.converterKey = value_converter_js_1.ValueConverter.keyFrom(name);
    }
    get $kind() { return 36913 /* ValueConverter */; }
    get hasBind() { return false; }
    get hasUnbind() { return true; }
    evaluate(f, s, hs, l, c) {
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
                const signaler = l.get(signaler_js_1.ISignaler);
                for (let i = 0, ii = signals.length; i < ii; ++i) {
                    signaler.addSignalListener(signals[i], c);
                }
            }
        }
        if ('toView' in vc) {
            return vc.toView(this.expression.evaluate(f, s, hs, l, c), ...this.args.map(a => a.evaluate(f, s, hs, l, c)));
        }
        return this.expression.evaluate(f, s, hs, l, c);
    }
    assign(f, s, hs, l, val) {
        const vc = l.get(this.converterKey);
        if (vc == null) {
            throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        if ('fromView' in vc) {
            val = vc.fromView(val, ...this.args.map(a => a.evaluate(f, s, hs, l, null)));
        }
        return this.expression.assign(f, s, hs, l, val);
    }
    unbind(_f, _s, _hs, b) {
        const vc = b.locator.get(this.converterKey);
        if (vc.signals === void 0) {
            return;
        }
        const signaler = b.locator.get(signaler_js_1.ISignaler);
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
exports.ValueConverterExpression = ValueConverterExpression;
class AssignExpression {
    constructor(target, value) {
        this.target = target;
        this.value = value;
    }
    get $kind() { return 8208 /* Assign */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        return this.target.assign(f, s, hs, l, this.value.evaluate(f, s, hs, l, c));
    }
    assign(f, s, hs, l, val) {
        this.value.assign(f, s, hs, l, val);
        return this.target.assign(f, s, hs, l, val);
    }
    accept(visitor) {
        return visitor.visitAssign(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.AssignExpression = AssignExpression;
class ConditionalExpression {
    constructor(condition, yes, no) {
        this.condition = condition;
        this.yes = yes;
        this.no = no;
    }
    get $kind() { return 63 /* Conditional */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        return this.condition.evaluate(f, s, hs, l, c) ? this.yes.evaluate(f, s, hs, l, c) : this.no.evaluate(f, s, hs, l, c);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitConditional(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.ConditionalExpression = ConditionalExpression;
class AccessThisExpression {
    constructor(ancestor = 0) {
        this.ancestor = ancestor;
    }
    get $kind() { return 1793 /* AccessThis */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, s, hs, _l, _c) {
        var _a;
        if (this === AccessThisExpression.$host) {
            s = chooseScope(true, s, hs);
        }
        let oc = s.overrideContext;
        let currentScope = s;
        let i = this.ancestor;
        while (i-- && oc) {
            currentScope = currentScope.parentScope;
            oc = (_a = currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) !== null && _a !== void 0 ? _a : null;
        }
        return i < 1 && oc ? oc.bindingContext : void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitAccessThis(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.AccessThisExpression = AccessThisExpression;
AccessThisExpression.$this = new AccessThisExpression(0);
// $host and $this are loosely the same thing. $host is used in the context of `au-slot` with the primary objective of determining the s.
AccessThisExpression.$host = new AccessThisExpression(0);
AccessThisExpression.$parent = new AccessThisExpression(1);
class AccessScopeExpression {
    constructor(name, ancestor = 0, accessHostScope = false) {
        this.name = name;
        this.ancestor = ancestor;
        this.accessHostScope = accessHostScope;
    }
    get $kind() { return 10082 /* AccessScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, _l, c) {
        const obj = binding_context_js_1.BindingContext.get(chooseScope(this.accessHostScope, s, hs), this.name, this.ancestor, f, hs);
        if (c !== null) {
            c.observeProperty(obj, this.name);
        }
        const evaluatedValue = obj[this.name];
        if (f & 4 /* isStrictBindingStrategy */) {
            return evaluatedValue;
        }
        return evaluatedValue == null ? '' : evaluatedValue;
    }
    assign(f, s, hs, _l, val) {
        var _a;
        const obj = binding_context_js_1.BindingContext.get(chooseScope(this.accessHostScope, s, hs), this.name, this.ancestor, f, hs);
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
exports.AccessScopeExpression = AccessScopeExpression;
class AccessMemberExpression {
    constructor(object, name) {
        this.object = object;
        this.name = name;
    }
    get $kind() { return 9323 /* AccessMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = this.object.evaluate(f, s, hs, l, (f & 512 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        if (f & 4 /* isStrictBindingStrategy */) {
            if (instance == null) {
                return instance;
            }
            if (c !== null) {
                c.observeProperty(instance, this.name);
            }
            return instance[this.name];
        }
        if (c !== null && instance instanceof Object) {
            c.observeProperty(instance, this.name);
        }
        return instance ? instance[this.name] : '';
    }
    assign(f, s, hs, l, val) {
        const obj = this.object.evaluate(f, s, hs, l, null);
        if (obj instanceof Object) {
            if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                obj.$observers[this.name].setValue(val, f);
            }
            else {
                obj[this.name] = val;
            }
        }
        else {
            this.object.assign(f, s, hs, l, { [this.name]: val });
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
exports.AccessMemberExpression = AccessMemberExpression;
class AccessKeyedExpression {
    constructor(object, key) {
        this.object = object;
        this.key = key;
    }
    get $kind() { return 9324 /* AccessKeyed */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = this.object.evaluate(f, s, hs, l, (f & 512 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        if (instance instanceof Object) {
            const key = this.key.evaluate(f, s, hs, l, (f & 512 /* observeLeafPropertiesOnly */) > 0 ? null : c);
            if (c !== null) {
                c.observeProperty(instance, key);
            }
            return instance[key];
        }
        return void 0;
    }
    assign(f, s, hs, l, val) {
        const instance = this.object.evaluate(f, s, hs, l, null);
        const key = this.key.evaluate(f, s, hs, l, null);
        return instance[key] = val;
    }
    accept(visitor) {
        return visitor.visitAccessKeyed(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.AccessKeyedExpression = AccessKeyedExpression;
class CallScopeExpression {
    constructor(name, args, ancestor = 0, accessHostScope = false) {
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
        this.accessHostScope = accessHostScope;
    }
    get $kind() { return 1448 /* CallScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        s = chooseScope(this.accessHostScope, s, hs);
        const args = this.args.map(a => a.evaluate(f, s, hs, l, c));
        const context = binding_context_js_1.BindingContext.get(s, this.name, this.ancestor, f, hs);
        // ideally, should observe property represents by this.name as well
        // because it could be changed
        // todo: did it ever surprise anyone?
        const func = getFunction(f, context, this.name);
        if (func) {
            return func.apply(context, args);
        }
        return void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallScope(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.CallScopeExpression = CallScopeExpression;
class CallMemberExpression {
    constructor(object, name, args) {
        this.object = object;
        this.name = name;
        this.args = args;
    }
    get $kind() { return 1161 /* CallMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = this.object.evaluate(f, s, hs, l, (f & 512 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        const args = this.args.map(a => a.evaluate(f, s, hs, l, c));
        const func = getFunction(f, instance, this.name);
        if (func) {
            return func.apply(instance, args);
        }
        return void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallMember(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.CallMemberExpression = CallMemberExpression;
class CallFunctionExpression {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }
    get $kind() { return 1162 /* CallFunction */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const func = this.func.evaluate(f, s, hs, l, c);
        if (typeof func === 'function') {
            return func(...this.args.map(a => a.evaluate(f, s, hs, l, c)));
        }
        if (!(f & 32 /* mustEvaluate */) && (func == null)) {
            return void 0;
        }
        throw new Error(`Expression is not a function.`);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallFunction(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.CallFunctionExpression = CallFunctionExpression;
class BinaryExpression {
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
                return this.left.evaluate(f, s, hs, l, c) == this.right.evaluate(f, s, hs, l, c);
            case '===':
                return this.left.evaluate(f, s, hs, l, c) === this.right.evaluate(f, s, hs, l, c);
            case '!=':
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
                    if (kernel_1.isNumberOrBigInt(left) || kernel_1.isNumberOrBigInt(right)) {
                        return (left || 0) + (right || 0);
                    }
                    if (kernel_1.isStringOrDate(left) || kernel_1.isStringOrDate(right)) {
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
                throw new Error(`Unknown binary operator: '${this.operation}'`);
        }
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitBinary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.BinaryExpression = BinaryExpression;
class UnaryExpression {
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
                throw new Error(`Unknown unary operator: '${this.operation}'`);
        }
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitUnary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.UnaryExpression = UnaryExpression;
class PrimitiveLiteralExpression {
    constructor(value) {
        this.value = value;
    }
    get $kind() { return 17925 /* PrimitiveLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
        return this.value;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitPrimitiveLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.PrimitiveLiteralExpression = PrimitiveLiteralExpression;
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
    evaluate(f, s, hs, l, c) {
        let result = '';
        for (let i = 0; i < this.parts.length; ++i) {
            const v = this.parts[i].evaluate(f, s, hs, l, c);
            if (v == null) {
                continue;
            }
            result += v;
        }
        return result;
    }
    assign(_f, _s, _hs, _l, _obj, _projection) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitHtmlLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.HtmlLiteralExpression = HtmlLiteralExpression;
class ArrayLiteralExpression {
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 17955 /* ArrayLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        return this.elements.map(e => e.evaluate(f, s, hs, l, c));
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitArrayLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.ArrayLiteralExpression = ArrayLiteralExpression;
ArrayLiteralExpression.$empty = new ArrayLiteralExpression(kernel_1.emptyArray);
class ObjectLiteralExpression {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 17956 /* ObjectLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = {};
        for (let i = 0; i < this.keys.length; ++i) {
            instance[this.keys[i]] = this.values[i].evaluate(f, s, hs, l, c);
        }
        return instance;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitObjectLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.ObjectLiteralExpression = ObjectLiteralExpression;
ObjectLiteralExpression.$empty = new ObjectLiteralExpression(kernel_1.emptyArray, kernel_1.emptyArray);
class TemplateExpression {
    constructor(cooked, expressions = kernel_1.emptyArray) {
        this.cooked = cooked;
        this.expressions = expressions;
    }
    get $kind() { return 17958 /* Template */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        let result = this.cooked[0];
        for (let i = 0; i < this.expressions.length; ++i) {
            result += String(this.expressions[i].evaluate(f, s, hs, l, c));
            result += this.cooked[i + 1];
        }
        return result;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.TemplateExpression = TemplateExpression;
TemplateExpression.$empty = new TemplateExpression(['']);
class TaggedTemplateExpression {
    constructor(cooked, raw, func, expressions = kernel_1.emptyArray) {
        this.cooked = cooked;
        this.func = func;
        this.expressions = expressions;
        cooked.raw = raw;
    }
    get $kind() { return 1197 /* TaggedTemplate */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const results = this.expressions.map(e => e.evaluate(f, s, hs, l, c));
        const func = this.func.evaluate(f, s, hs, l, c);
        if (typeof func !== 'function') {
            throw new Error(`Left-hand side of tagged template expression is not a function.`);
        }
        return func(this.cooked, ...results);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitTaggedTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.TaggedTemplateExpression = TaggedTemplateExpression;
class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 65556 /* ArrayBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
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
    assign(_f, _s, _hs, _l, _obj) {
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
exports.ArrayBindingPattern = ArrayBindingPattern;
class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 65557 /* ObjectBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
        // TODO
        // similar to array binding ast, this should only come after batch
        // for a single notification per destructing,
        // regardless number of property assignments on the scope binding context
        return void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
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
exports.ObjectBindingPattern = ObjectBindingPattern;
class BindingIdentifier {
    constructor(name) {
        this.name = name;
    }
    get $kind() { return 65558 /* BindingIdentifier */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
        return this.name;
    }
    accept(visitor) {
        return visitor.visitBindingIdentifier(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.BindingIdentifier = BindingIdentifier;
const toStringTag = Object.prototype.toString;
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
    evaluate(f, s, hs, l, c) {
        return this.iterable.evaluate(f, s, hs, l, c);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    count(_f, result) {
        switch (toStringTag.call(result)) {
            case '[object Array]': return result.length;
            case '[object Map]': return result.size;
            case '[object Set]': return result.size;
            case '[object Number]': return result;
            case '[object Null]': return 0;
            case '[object Undefined]': return 0;
            default: throw new Error(`Cannot count ${toStringTag.call(result)}`);
        }
    }
    // deepscan-disable-next-line
    iterate(f, result, func) {
        switch (toStringTag.call(result)) {
            case '[object Array]': return $array(result, func);
            case '[object Map]': return $map(result, func);
            case '[object Set]': return $set(result, func);
            case '[object Number]': return $number(result, func);
            case '[object Null]': return;
            case '[object Undefined]': return;
            default: throw new Error(`Cannot iterate over ${toStringTag.call(result)}`);
        }
    }
    bind(f, s, hs, b) {
        if (this.iterable.hasBind) {
            this.iterable.bind(f, s, hs, b);
        }
    }
    unbind(f, s, hs, b) {
        if (this.iterable.hasUnbind) {
            this.iterable.unbind(f, s, hs, b);
        }
    }
    accept(visitor) {
        return visitor.visitForOfStatement(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.ForOfStatement = ForOfStatement;
/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
class Interpolation {
    constructor(parts, expressions = kernel_1.emptyArray) {
        this.parts = parts;
        this.expressions = expressions;
        this.isMulti = expressions.length > 1;
        this.firstExpression = expressions[0];
    }
    get $kind() { return 24 /* Interpolation */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        if (this.isMulti) {
            let result = this.parts[0];
            for (let i = 0; i < this.expressions.length; ++i) {
                result += String(this.expressions[i].evaluate(f, s, hs, l, c));
                result += this.parts[i + 1];
            }
            return result;
        }
        else {
            return `${this.parts[0]}${this.firstExpression.evaluate(f, s, hs, l, c)}${this.parts[1]}`;
        }
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitInterpolation(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
exports.Interpolation = Interpolation;
function getFunction(f, obj, name) {
    const func = obj == null ? null : obj[name];
    if (typeof func === 'function') {
        return func;
    }
    if (!(f & 32 /* mustEvaluate */) && func == null) {
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
function $set(result, func) {
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
//# sourceMappingURL=ast.js.map