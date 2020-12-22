"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$OmittedExpression = exports.$SpreadElement = exports.$BindingElement = exports.$ArrayBindingPattern = exports.$bindingElementList = exports.$$arrayBindingElementList = exports.$$arrayBindingElement = exports.$ObjectBindingPattern = exports.$ComputedPropertyName = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const empty_js_1 = require("../types/empty.js");
const iteration_js_1 = require("../globals/iteration.js");
const error_js_1 = require("../types/error.js");
const _shared_js_1 = require("./_shared.js");
const number_js_1 = require("../types/number.js");
const operations_js_1 = require("../operations.js");
const list_js_1 = require("../types/list.js");
class $ComputedPropertyName {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ComputedPropertyName`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
        this.PropName = new empty_js_1.$Empty(realm, void 0, void 0, this);
    }
    get $kind() { return typescript_1.SyntaxKind.ComputedPropertyName; }
    // http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
    // 12.2.6.7 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        // ComputedPropertyName : [ AssignmentExpression ]
        // 1. Let exprValue be the result of evaluating AssignmentExpression.
        const exprValue = this.$expression.Evaluate(ctx);
        // 2. Let propName be ? GetValue(exprValue).
        const propName = exprValue.GetValue(ctx);
        if (propName.isAbrupt) {
            return propName.enrichWith(ctx, this);
        }
        // 3. Return ? ToPropertyKey(propName).
        return propName.ToPropertyKey(ctx).enrichWith(ctx, this);
    }
    // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
    EvaluatePropName(ctx) {
        ctx.checkTimeout();
        return this.Evaluate(ctx);
    }
}
exports.$ComputedPropertyName = $ComputedPropertyName;
class $ObjectBindingPattern {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ObjectBindingPattern`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.combinedModifierFlags = parent.combinedModifierFlags;
        ctx |= 64 /* InBindingPattern */;
        const $elements = this.$elements = $bindingElementList(node.elements, this, ctx);
        this.BoundNames = $elements.flatMap(_shared_js_1.getBoundNames);
        this.ContainsExpression = $elements.some(_shared_js_1.getContainsExpression);
        this.HasInitializer = $elements.some(_shared_js_1.getHasInitializer);
        this.IsSimpleParameterList = $elements.every(_shared_js_1.getIsSimpleParameterList);
    }
    get $kind() { return typescript_1.SyntaxKind.ObjectBindingPattern; }
    // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-bindinginitialization
    // 13.3.3.5 Runtime Semantics: BindingInitialization
    InitializeBinding(ctx, value, environment) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializeBinding(#${ctx.id})`);
        const realm = ctx.Realm;
        // BindingPattern : ObjectBindingPattern
        // 1. Perform ? RequireObjectCoercible(value).
        if (value.isNil) {
            return new error_js_1.$TypeError(realm, `Cannot destructure ${value['[[Value]]']} into object`).enrichWith(ctx, this);
        }
        // 2. Return the result of performing BindingInitialization for ObjectBindingPattern using value and environment as arguments.
        // ObjectBindingPattern : { }
        // 1. Return NormalCompletion(empty).
        // ObjectBindingPattern : { BindingPropertyList } { BindingPropertyList , }
        // 1. Perform ? PropertyBindingInitialization for BindingPropertyList using value and environment as the arguments.
        // 2. Return NormalCompletion(empty).
        // ObjectBindingPattern : { BindingRestProperty }
        // 1. Let excludedNames be a new empty List.
        // 2. Return the result of performing RestBindingInitialization of BindingRestProperty with value, environment, and excludedNames as the arguments.
        // ObjectBindingPattern : { BindingPropertyList , BindingRestProperty }
        // 1. Let excludedNames be the result of performing ? PropertyBindingInitialization of BindingPropertyList using value and environment as arguments.
        // 2. Return the result of performing RestBindingInitialization of BindingRestProperty with value, environment, and excludedNames as the arguments.
        // TODO: implement rest element thingy
        const excludedNames = [];
        const elements = this.$elements;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            const el = elements[i];
            const result = el.InitializePropertyBinding(ctx, value, environment);
            if (result.isAbrupt) {
                return result.enrichWith(ctx, this);
            }
            if (i + 1 === ii) {
                // return result;
            }
        }
        return new empty_js_1.$Empty(realm);
    }
}
exports.$ObjectBindingPattern = $ObjectBindingPattern;
function $$arrayBindingElement(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.BindingElement:
            return new $BindingElement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.OmittedExpression:
            return new $OmittedExpression(node, parent, ctx, idx);
    }
}
exports.$$arrayBindingElement = $$arrayBindingElement;
function $$arrayBindingElementList(nodes, parent, ctx) {
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = $$arrayBindingElement(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
exports.$$arrayBindingElementList = $$arrayBindingElementList;
function $bindingElementList(nodes, parent, ctx) {
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new $BindingElement(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
exports.$bindingElementList = $bindingElementList;
class $ArrayBindingPattern {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.ArrayBindingPattern`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.combinedModifierFlags = parent.combinedModifierFlags;
        ctx |= 64 /* InBindingPattern */;
        const $elements = this.$elements = $$arrayBindingElementList(node.elements, this, ctx);
        this.BoundNames = $elements.flatMap(_shared_js_1.getBoundNames);
        this.ContainsExpression = $elements.some(_shared_js_1.getContainsExpression);
        this.HasInitializer = $elements.some(_shared_js_1.getHasInitializer);
        this.IsSimpleParameterList = $elements.every(_shared_js_1.getIsSimpleParameterList);
    }
    get $kind() { return typescript_1.SyntaxKind.ArrayBindingPattern; }
    // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-bindinginitialization
    // 13.3.3.5 Runtime Semantics: BindingInitialization
    InitializeBinding(ctx, value, environment) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializeBinding(#${ctx.id})`);
        // BindingPattern : ArrayBindingPattern
        // 1. Let iteratorRecord be ? GetIterator(value).
        const iteratorRecord = iteration_js_1.$GetIterator(ctx, value);
        if (iteratorRecord.isAbrupt) {
            return iteratorRecord.enrichWith(ctx, this);
        }
        // 2. Let result be IteratorBindingInitialization for ArrayBindingPattern using iteratorRecord and environment as arguments.
        const result = this.InitializeIteratorBinding(ctx, iteratorRecord, environment);
        if (result.isAbrupt) {
            return result.enrichWith(ctx, this);
        } // TODO: we sure about this? Spec doesn't say it
        // 3. If iteratorRecord.[[Done]] is false, return ? IteratorClose(iteratorRecord, result).
        if (iteratorRecord['[[Done]]'].isFalsey) {
            return iteration_js_1.$IteratorClose(ctx, iteratorRecord, result).enrichWith(ctx, this);
        }
        // 4. Return result.
        return result;
    }
    // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-iteratorbindinginitialization
    // 13.3.3.8 Runtime Semantics: IteratorBindingInitialization
    InitializeIteratorBinding(ctx, iteratorRecord, environment) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializeIteratorBinding(#${ctx.id})`);
        const realm = ctx.Realm;
        const elements = this.$elements;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            const el = elements[i];
            switch (el.$kind) {
                case typescript_1.SyntaxKind.OmittedExpression: {
                    if (i + 1 === ii) {
                        // If the last element is an elision, skip it as per the runtime semantics:
                        // ArrayBindingPattern : [ BindingElementList , ]
                        // 1. Return the result of performing IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.
                        // ArrayBindingPattern : [ Elision ]
                        // 1. Return the result of performing IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.
                        break;
                    }
                    const result = el.EvaluateDestructuringAssignmentIterator(ctx, iteratorRecord);
                    if (result.isAbrupt) {
                        return result.enrichWith(ctx, this);
                    }
                    break;
                }
                case typescript_1.SyntaxKind.BindingElement: {
                    // ArrayBindingPattern : [ Elision opt BindingRestElement ]
                    // 1. If Elision is present, then
                    // 1. a. Perform ? IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.
                    // 2. Return the result of performing IteratorBindingInitialization for BindingRestElement with iteratorRecord and environment as arguments.
                    // ArrayBindingPattern : [ BindingElementList ]
                    // 1. Return the result of performing IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.
                    // ArrayBindingPattern : [ BindingElementList , Elision ]
                    // 1. Perform ? IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.
                    // 2. Return the result of performing IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.
                    // ArrayBindingPattern : [ BindingElementList , Elision opt BindingRestElement ]
                    // 1. Perform ? IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.
                    // 2. If Elision is present, then
                    // 2. a. Perform ? IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.
                    // 3. Return the result of performing IteratorBindingInitialization for BindingRestElement with iteratorRecord and environment as arguments.
                    const result = el.InitializeIteratorBinding(ctx, iteratorRecord, environment);
                    if (result.isAbrupt) {
                        return result.enrichWith(ctx, this);
                    }
                    if (i + 1 === ii) {
                        return result;
                    }
                }
            }
        }
        // ArrayBindingPattern : [ ]
        // 1. Return NormalCompletion(empty).
        return new empty_js_1.$Empty(realm);
    }
}
exports.$ArrayBindingPattern = $ArrayBindingPattern;
class $BindingElement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.BindingElement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.modifierFlags = _shared_js_1.modifiersToModifierFlags(node.modifiers);
        this.combinedModifierFlags = this.modifierFlags | parent.combinedModifierFlags;
        ctx = _shared_js_1.clearBit(ctx, 8 /* IsBindingName */);
        if (node.propertyName === void 0) {
            this.$propertyName = void 0;
            const $name = this.$name = _shared_js_1.$$bindingName(node.name, this, ctx | 8 /* IsBindingName */, -1);
            this.BoundNames = $name.BoundNames;
            if (node.initializer === void 0) {
                this.$initializer = void 0;
                this.ContainsExpression = $name.ContainsExpression;
                this.HasInitializer = false;
                this.IsSimpleParameterList = $name.$kind === typescript_1.SyntaxKind.Identifier;
            }
            else {
                this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
                this.ContainsExpression = true;
                this.HasInitializer = true;
                this.IsSimpleParameterList = false;
            }
        }
        else {
            const $propertyName = this.$propertyName = _shared_js_1.$$propertyName(node.propertyName, this, ctx, -1);
            const $name = this.$name = _shared_js_1.$$bindingName(node.name, this, ctx | 8 /* IsBindingName */, -1);
            this.BoundNames = $name.BoundNames;
            if (node.initializer === void 0) {
                this.$initializer = void 0;
                this.ContainsExpression = $propertyName.$kind === typescript_1.SyntaxKind.ComputedPropertyName || $name.ContainsExpression;
                this.HasInitializer = false;
                this.IsSimpleParameterList = $name.$kind === typescript_1.SyntaxKind.Identifier;
            }
            else {
                this.$initializer = _shared_js_1.$assignmentExpression(node.initializer, this, ctx, -1);
                this.ContainsExpression = true;
                this.HasInitializer = true;
                this.IsSimpleParameterList = false;
            }
        }
    }
    get $kind() { return typescript_1.SyntaxKind.BindingElement; }
    // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-propertybindinginitialization
    // 13.3.3.6 Runtime Semantics: PropertyBindingInitialization
    InitializePropertyBinding(ctx, value, environment) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializePropertyBinding(#${ctx.id})`);
        const PropertyName = this.$propertyName;
        // BindingProperty : SingleNameBinding
        if (PropertyName === void 0) {
            // 1. Let name be the string that is the only element of BoundNames of SingleNameBinding.
            // 2. Perform ? KeyedBindingInitialization for SingleNameBinding using value, environment, and name as the arguments.
            // 3. Return a new List containing name.
            // Cast is safe because when propertyName is undefined, destructuring is syntactically not possible
            return this.$name.InitializePropertyBinding(ctx, value, environment).enrichWith(ctx, this);
        }
        // BindingProperty : PropertyName : BindingElement
        // 1. Let P be the result of evaluating PropertyName.
        const P = PropertyName.Evaluate(ctx);
        // 2. ReturnIfAbrupt(P).
        if (P.isAbrupt) {
            return P.enrichWith(ctx, this);
        }
        // 3. Perform ? KeyedBindingInitialization of BindingElement with value, environment, and P as the arguments.
        const result = this.InitializeKeyedBinding(ctx, value, environment, P); // TODO: this cast is very wrong. Need to revisit later
        if (result.isAbrupt) {
            return result.enrichWith(ctx, this);
        }
        // 4. Return a new List containing P.
        return new list_js_1.$List(P); // TODO: this cast is very wrong. Need to revisit later
    }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-keyedbindinginitialization
    // 13.3.3.9 Runtime Semantics: KeyedBindingInitialization
    InitializeKeyedBinding(ctx, value, environment, propertyName, initializer) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializeKeyedBinding(#${ctx.id})`);
        const realm = ctx.Realm;
        const BindingElement = this.$name;
        // SingleNameBinding : BindingIdentifier Initializer opt
        // 1. Let bindingId be StringValue of BindingIdentifier.
        // 2. Let lhs be ? ResolveBinding(bindingId, environment).
        // 3. Let v be ? GetV(value, propertyName).
        // 4. If Initializer is present and v is undefined, then
        // 4. a. If IsAnonymousFunctionDefinition(Initializer) is true, then
        // 4. a. i. Set v to the result of performing NamedEvaluation for Initializer with argument bindingId.
        // 4. b. Else,
        // 4. b. i. Let defaultValue be the result of evaluating Initializer.
        // 4. b. ii. Set v to ? GetValue(defaultValue).
        // 5. If environment is undefined, return ? PutValue(lhs, v).
        // 6. Return InitializeReferencedBinding(lhs, v).
        if (BindingElement.$kind === typescript_1.SyntaxKind.Identifier) {
            return BindingElement.InitializeKeyedBinding(ctx, value, environment, propertyName, initializer).enrichWith(ctx, this);
        }
        // BindingElement : BindingPattern Initializer opt
        // 1. Let v be ? GetV(value, propertyName).
        const obj = value.ToObject(ctx);
        if (obj.isAbrupt) {
            return obj.enrichWith(ctx, this);
        }
        let v = obj['[[Get]]'](ctx, propertyName, obj);
        if (v.isAbrupt) {
            return v.enrichWith(ctx, this);
        }
        // 2. If Initializer is present and v is undefined, then
        if (initializer !== void 0 && v.isUndefined) {
            // 2. a. Let defaultValue be the result of evaluating Initializer.
            const defaultValue = initializer.Evaluate(ctx);
            // 2. b. Set v to ? GetValue(defaultValue).
            v = defaultValue.GetValue(ctx);
            if (v.isAbrupt) {
                return v.enrichWith(ctx, this);
            }
        }
        // 3. Return the result of performing BindingInitialization for BindingPattern passing v and environment as arguments.
        return BindingElement.InitializeBinding(ctx, v, environment).enrichWith(ctx, this);
    }
    // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-iteratorbindinginitialization
    // 13.3.3.8 Runtime Semantics: IteratorBindingInitialization
    InitializeIteratorBinding(ctx, iteratorRecord, environment) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.InitializeIteratorBinding(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const BindingElement = this.$name;
        // BindingElement : SingleNameBinding
        // 1. Return the result of performing IteratorBindingInitialization for SingleNameBinding with iteratorRecord and environment as the arguments.
        // SingleNameBinding : BindingIdentifier Initializer opt
        // 1. Let bindingId be StringValue of BindingIdentifier.
        // 2. Let lhs be ? ResolveBinding(bindingId, environment).
        // 3. If iteratorRecord.[[Done]] is false, then
        // 3. a. Let next be IteratorStep(iteratorRecord).
        // 3. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
        // 3. c. ReturnIfAbrupt(next).
        // 3. d. If next is false, set iteratorRecord.[[Done]] to true.
        // 3. e. Else,
        // 3. e. i. Let v be IteratorValue(next).
        // 3. e. ii. If v is an abrupt completion, set iteratorRecord.[[Done]] to true.
        // 3. e. iii. ReturnIfAbrupt(v).
        // 4. If iteratorRecord.[[Done]] is true, let v be undefined.
        // 5. If Initializer is present and v is undefined, then
        // 5. a. If IsAnonymousFunctionDefinition(Initializer) is true, then
        // 5. a. i. Set v to the result of performing NamedEvaluation for Initializer with argument bindingId.
        // 5. b. Else,
        // 5. b. i. Let defaultValue be the result of evaluating Initializer.
        // 5. b. ii. Set v to ? GetValue(defaultValue).
        // 6. If environment is undefined, return ? PutValue(lhs, v).
        // 7. Return InitializeReferencedBinding(lhs, v).
        if (BindingElement.$kind === typescript_1.SyntaxKind.Identifier) {
            return BindingElement.InitializeIteratorBinding(ctx, iteratorRecord, environment, this.$initializer).enrichWith(ctx, this);
        }
        // NOTE: this section is duplicated in ParameterDeclaration
        // BindingElement : BindingPattern Initializer opt
        let v = intrinsics.undefined; // TODO: sure about this?
        // 1. If iteratorRecord.[[Done]] is false, then
        if (iteratorRecord['[[Done]]'].isFalsey) {
            // 1. a. Let next be IteratorStep(iteratorRecord).
            const next = iteration_js_1.$IteratorStep(ctx, iteratorRecord);
            // 1. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
            if (next.isAbrupt) {
                iteratorRecord['[[Done]]'] = intrinsics.true;
                // 1. c. ReturnIfAbrupt(next).
                if (next.isAbrupt) {
                    return next.enrichWith(ctx, this);
                }
            }
            // 1. d. If next is false, set iteratorRecord.[[Done]] to true.
            if (next.isFalsey) {
                iteratorRecord['[[Done]]'] = intrinsics.true;
            }
            // 1. e. Else,
            else {
                // 1. e. i. Let v be IteratorValue(next).
                v = iteration_js_1.$IteratorValue(ctx, next);
                // 1. e. ii. If v is an abrupt completion, set iteratorRecord.[[Done]] to true.
                if (v.isAbrupt) {
                    iteratorRecord['[[Done]]'] = intrinsics.true;
                    // 1. e. iii. ReturnIfAbrupt(v).
                    if (v.isAbrupt) {
                        return v.enrichWith(ctx, this);
                    }
                }
            }
        }
        // 2. If iteratorRecord.[[Done]] is true, let v be undefined.
        if (iteratorRecord['[[Done]]'].isTruthy) {
            v = intrinsics.undefined;
        }
        const initializer = this.$initializer;
        // 3. If Initializer is present and v is undefined, then
        if (initializer !== void 0 && v.isUndefined) {
            // 3. a. Let defaultValue be the result of evaluating Initializer.
            const defaultValue = initializer.Evaluate(ctx);
            // 3. b. Set v to ? GetValue(defaultValue).
            v = defaultValue.GetValue(ctx);
            if (v.isAbrupt) {
                return v.enrichWith(ctx, this);
            }
        }
        // 4. Return the result of performing BindingInitialization of BindingPattern with v and environment as the arguments.
        return BindingElement.InitializeBinding(ctx, v, environment).enrichWith(ctx, this);
    }
}
exports.$BindingElement = $BindingElement;
class $SpreadElement {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.SpreadElement`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = _shared_js_1.$assignmentExpression(node.expression, this, ctx, -1);
    }
    get $kind() { return typescript_1.SyntaxKind.SpreadElement; }
    // http://www.ecma-international.org/ecma-262/#sec-argument-lists-runtime-semantics-argumentlistevaluation
    // 12.3.6.1 Runtime Semantics: ArgumentListEvaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        // ArgumentList :
        //     ... AssignmentExpression
        // 1. Let list be a new empty List.
        const list = new list_js_1.$List();
        // 2. Let spreadRef be the result of evaluating AssignmentExpression.
        const spreadRef = this.$expression.Evaluate(ctx);
        // 3. Let spreadObj be ? GetValue(spreadRef).
        const spreadObj = spreadRef.GetValue(ctx);
        if (spreadObj.isAbrupt) {
            return spreadObj.enrichWith(ctx, this);
        }
        // 4. Let iteratorRecord be ? GetIterator(spreadObj).
        const iteratorRecord = iteration_js_1.$GetIterator(ctx, spreadObj);
        if (iteratorRecord.isAbrupt) {
            return iteratorRecord.enrichWith(ctx, this);
        }
        // 5. Repeat,
        while (true) {
            // 5. a. Let next be ? IteratorStep(iteratorRecord).
            const next = iteration_js_1.$IteratorStep(ctx, iteratorRecord);
            if (next.isAbrupt) {
                return next.enrichWith(ctx, this);
            }
            // 5. b. If next is false, return list.
            if (next.isFalsey) {
                return list;
            }
            // 5. c. Let nextArg be ? IteratorValue(next).
            const nextArg = iteration_js_1.$IteratorValue(ctx, next);
            if (nextArg.isAbrupt) {
                return nextArg.enrichWith(ctx, this);
            }
            // 5. d. Append nextArg as the last element of list.
            list.push(nextArg);
        }
    }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-arrayaccumulation
    // 12.2.5.2 Runtime Semantics: ArrayAccumulation
    AccumulateArray(ctx, array, nextIndex) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        // SpreadElement : ... AssignmentExpression
        // 1. Let spreadRef be the result of evaluating AssignmentExpression.
        const spreadRef = this.$expression.Evaluate(ctx);
        // 2. Let spreadObj be ? GetValue(spreadRef).
        const spreadObj = spreadRef.GetValue(ctx);
        if (spreadObj.isAbrupt) {
            return spreadObj.enrichWith(ctx, this);
        }
        // 3. Let iteratorRecord be ? GetIterator(spreadObj).
        const iteratorRecord = iteration_js_1.$GetIterator(ctx, spreadObj);
        if (iteratorRecord.isAbrupt) {
            return iteratorRecord.enrichWith(ctx, this);
        }
        // 4. Repeat,
        while (true) {
            // 4. a. Let next be ? IteratorStep(iteratorRecord).
            const next = iteration_js_1.$IteratorStep(ctx, iteratorRecord);
            if (next.isAbrupt) {
                return next.enrichWith(ctx, this);
            }
            // 4. b. If next is false, return nextIndex.
            if (next.isFalsey) {
                return nextIndex;
            }
            // 4. c. Let nextValue be ? IteratorValue(next).
            const nextValue = iteration_js_1.$IteratorValue(ctx, next);
            if (nextValue.isAbrupt) {
                return nextValue.enrichWith(ctx, this);
            }
            // 4. d. Let status be CreateDataProperty(array, ToString(ToUint32(nextIndex)), nextValue).
            const status = operations_js_1.$CreateDataProperty(ctx, array, nextIndex.ToUint32(ctx).ToString(ctx), nextValue);
            // 4. e. Assert: status is true.
            // 4. f. Increase nextIndex by 1.
            nextIndex = new number_js_1.$Number(realm, nextIndex['[[Value]]'] + 1);
        }
    }
}
exports.$SpreadElement = $SpreadElement;
class $OmittedExpression {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${_shared_js_1.$i(idx)}.OmittedExpression`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
        // 13.3.3.1 Static Semantics: BoundNames
        this.BoundNames = kernel_1.emptyArray;
        // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
        // 13.3.3.2 Static Semantics: ContainsExpression
        this.ContainsExpression = false;
        // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
        // 13.3.3.3 Static Semantics: HasInitializer
        this.HasInitializer = false;
        // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
        // 13.3.3.4 Static Semantics: IsSimpleParameterList
        this.IsSimpleParameterList = false;
    }
    get $kind() { return typescript_1.SyntaxKind.OmittedExpression; }
    // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-iteratordestructuringassignmentevaluation
    // 12.15.5.5 Runtime Semantics: IteratorDestructuringAssignmentEvaluation
    EvaluateDestructuringAssignmentIterator(ctx, iteratorRecord) {
        ctx.checkTimeout();
        this.logger.debug(`${this.path}.EvaluateDestructuringAssignmentIterator(#${ctx.id})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // Elision : ,
        // 1. If iteratorRecord.[[Done]] is false, then
        if (iteratorRecord['[[Done]]'].isFalsey) {
            // 1. a. Let next be IteratorStep(iteratorRecord).
            const next = iteration_js_1.$IteratorStep(ctx, iteratorRecord);
            // 1. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
            if (next.isAbrupt) {
                iteratorRecord['[[Done]]'] = intrinsics.true;
                // 1. c. ReturnIfAbrupt(next).
                return next;
            }
            // 1. d. If next is false, set iteratorRecord.[[Done]] to true.
            if (next.isFalsey) {
                iteratorRecord['[[Done]]'] = intrinsics.true;
            }
        }
        // 2. Return NormalCompletion(empty).
        return new empty_js_1.$Empty(realm);
    }
    Evaluate(ctx) {
        ctx.checkTimeout();
        return null; // TODO: implement this;
    }
}
exports.$OmittedExpression = $OmittedExpression;
// #endregion
//# sourceMappingURL=bindings.js.map