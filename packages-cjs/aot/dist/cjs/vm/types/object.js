"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Object = void 0;
const _shared_js_1 = require("./_shared.js");
const property_descriptor_js_1 = require("./property-descriptor.js");
const operations_js_1 = require("../operations.js");
const error_js_1 = require("./error.js");
const list_js_1 = require("./list.js");
// http://www.ecma-international.org/ecma-262/#sec-object-type
class $Object {
    constructor(realm, IntrinsicName, proto, type, target) {
        this.realm = realm;
        this.IntrinsicName = IntrinsicName;
        this.disposed = false;
        this.id = _shared_js_1.nextValueId();
        this.propertyMap = new Map();
        this.propertyDescriptors = [];
        this.propertyKeys = [];
        this.nodeStack = [];
        this.ctx = null;
        this.stack = '';
        this['[[Prototype]]'] = proto;
        this['[[Extensible]]'] = realm['[[Intrinsics]]'].true;
        this['[[Type]]'] = type;
        this['[[Target]]'] = target;
    }
    get '[[Value]]'() {
        const obj = {};
        for (const pd of this.propertyDescriptors) {
            // Reflect.defineProperty(obj, pd.name['[[Value]]'], {
            // TODO: materialize
            // })
        }
        return obj;
    }
    // Note: this typing is incorrect, but we do it this way to prevent having to cast in 100+ places.
    // The purpose is to ensure the `isAbrupt === true` flow narrows down to the $Error type.
    // It could be done correctly, but that would require complex conditional types which is not worth the effort right now.
    get isAbrupt() { return (this['[[Type]]'] !== 1 /* normal */); }
    get Type() { return 'Object'; }
    get isEmpty() { return false; }
    get isUndefined() { return false; }
    get isNull() { return false; }
    get isNil() { return false; }
    get isBoolean() { return false; }
    get isNumber() { return false; }
    get isString() { return false; }
    get isSymbol() { return false; }
    get isPrimitive() { return false; }
    get isObject() { return true; }
    get isArray() { return false; }
    get isProxy() { return false; }
    get isFunction() { return false; }
    get isBoundFunction() { return false; }
    get isTruthy() { return true; }
    get isFalsey() { return false; }
    get isSpeculative() { return false; }
    get hasValue() { return false; }
    get isList() { return false; }
    // http://www.ecma-international.org/ecma-262/#sec-objectcreate
    // 9.1.12 ObjectCreate ( proto [ , internalSlotsList ] )
    static ObjectCreate(ctx, IntrinsicName, proto, internalSlotsList) {
        const realm = ctx.Realm;
        // 1. If internalSlotsList is not present, set internalSlotsList to a new empty List.
        // 2. Let obj be a newly created object with an internal slot for each name in internalSlotsList.
        const obj = new $Object(realm, IntrinsicName, proto, 1 /* normal */, realm['[[Intrinsics]]'].empty);
        Object.assign(obj, internalSlotsList);
        // 3. Set obj's essential internal methods to the default ordinary object definitions specified in 9.1.
        // 4. Set obj.[[Prototype]] to proto.
        // 5. Set obj.[[Extensible]] to true.
        // 6. Return obj.
        return obj;
    }
    is(other) {
        return this.id === other.id;
    }
    enrichWith(ctx, node) {
        if (this['[[Type]]'] === 5 /* throw */) {
            this.nodeStack.push(node);
            if (this.ctx === null) {
                this.ctx = ctx;
                this.stack = ctx.Realm.stack.toString();
            }
        }
        return this;
    }
    [Symbol.toPrimitive]() {
        return String(this['[[Value]]']);
    }
    [Symbol.toStringTag]() {
        return Object.prototype.toString.call(this['[[Value]]']);
    }
    ToCompletion(type, target) {
        this['[[Type]]'] = type;
        this['[[Target]]'] = target;
        return this;
    }
    // http://www.ecma-international.org/ecma-262/#sec-updateempty
    // 6.2.3.4 UpdateEmpty ( completionRecord , value )
    UpdateEmpty(value) {
        // 1. Assert: If completionRecord.[[Type]] is either return or throw, then completionRecord.[[Value]] is not empty.
        // 2. If completionRecord.[[Value]] is not empty, return Completion(completionRecord).
        return this;
        // 3. Return Completion { [[Type]]: completionRecord.[[Type]], [[Value]]: value, [[Target]]: completionRecord.[[Target]] }.
    }
    ToObject(ctx) {
        return this;
    }
    ToPropertyKey(ctx) {
        return this.ToString(ctx);
    }
    ToLength(ctx) {
        return this.ToNumber(ctx).ToLength(ctx);
    }
    ToBoolean(ctx) {
        return this.ToPrimitive(ctx, 'number').ToBoolean(ctx);
    }
    ToNumber(ctx) {
        return this.ToPrimitive(ctx, 'number').ToNumber(ctx);
    }
    ToInt32(ctx) {
        return this.ToPrimitive(ctx, 'number').ToInt32(ctx);
    }
    ToUint32(ctx) {
        return this.ToPrimitive(ctx, 'number').ToUint32(ctx);
    }
    ToInt16(ctx) {
        return this.ToPrimitive(ctx, 'number').ToInt16(ctx);
    }
    ToUint16(ctx) {
        return this.ToPrimitive(ctx, 'number').ToUint16(ctx);
    }
    ToInt8(ctx) {
        return this.ToPrimitive(ctx, 'number').ToInt8(ctx);
    }
    ToUint8(ctx) {
        return this.ToPrimitive(ctx, 'number').ToUint8(ctx);
    }
    ToUint8Clamp(ctx) {
        return this.ToPrimitive(ctx, 'number').ToUint8Clamp(ctx);
    }
    ToString(ctx) {
        return this.ToPrimitive(ctx, 'string').ToString(ctx);
    }
    // http://www.ecma-international.org/ecma-262/#sec-toprimitive
    // 7.1.1 ToPrimitive ( input [ , PreferredType ] )
    ToPrimitive(ctx, PreferredType = 'default') {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const input = this;
        // 1. Assert: input is an ECMAScript language value.
        // 2. If Type(input) is Object, then
        // 2. a. If PreferredType is not present, let hint be "default".
        // 2. b. Else if PreferredType is hint String, let hint be "string".
        // 2. c. Else PreferredType is hint Number, let hint be "number".
        let hint = intrinsics[PreferredType];
        // 2. d. Let exoticToPrim be ? GetMethod(input, @@toPrimitive).
        const exoticToPrim = input.GetMethod(ctx, intrinsics['@@toPrimitive']);
        if (exoticToPrim.isAbrupt) {
            return exoticToPrim;
        }
        // 2. e. If exoticToPrim is not undefined, then
        if (!exoticToPrim.isUndefined) {
            // 2. e. i. Let result be ? Call(exoticToPrim, input, « hint »).
            const result = operations_js_1.$Call(ctx, exoticToPrim, input, new list_js_1.$List(hint));
            if (result.isAbrupt) {
                return result;
            }
            // 2. e. ii. If Type(result) is not Object, return result.
            if (result.isPrimitive) {
                return result;
            }
            // 2. e. iii. Throw a TypeError exception.
            return new error_js_1.$TypeError(realm, `Symbol.toPrimitive returned ${result}, but expected a primitive`);
        }
        // 2. f. If hint is "default", set hint to "number".
        if (hint['[[Value]]'] === 'default') {
            hint = intrinsics.number;
        }
        // 2. g. Return ? OrdinaryToPrimitive(input, hint).
        return input.OrdinaryToPrimitive(ctx, hint['[[Value]]']);
        // 3. Return input.
        // N/A since this is always an object
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinarytoprimitive
    // 7.1.1.1 OrdinaryToPrimitive ( O , hint )
    OrdinaryToPrimitive(ctx, hint) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const O = this;
        // 1. Assert: Type(O) is Object.
        // 2. Assert: Type(hint) is String and its value is either "string" or "number".
        // 3. If hint is "string", then
        if (hint === 'string') {
            // 3. a. Let methodNames be « "toString", "valueOf" ».
            // 5. For each name in methodNames in List order, do
            // 5. a. Let method be ? Get(O, name).
            let method = O['[[Get]]'](ctx, intrinsics.$toString, O);
            if (method.isAbrupt) {
                return method;
            }
            // 5. b. If IsCallable(method) is true, then
            if (method.isFunction) {
                // 5. b. i. Let result be ? Call(method, O).
                const result = operations_js_1.$Call(ctx, method, O, intrinsics.undefined);
                if (result.isAbrupt) {
                    return result;
                }
                // 5. b. ii. If Type(result) is not Object, return result.
                if (result.isPrimitive) {
                    return result;
                }
            }
            method = O['[[Get]]'](ctx, intrinsics.$valueOf, O);
            if (method.isAbrupt) {
                return method;
            }
            // 5. b. If IsCallable(method) is true, then
            if (method.isFunction) {
                // 5. b. i. Let result be ? Call(method, O).
                const result = operations_js_1.$Call(ctx, method, O, intrinsics.undefined);
                if (result.isAbrupt) {
                    return result;
                }
                // 5. b. ii. If Type(result) is not Object, return result.
                if (result.isPrimitive) {
                    return result;
                }
                // 6. Throw a TypeError exception.
                return new error_js_1.$TypeError(realm, `valueOf returned ${result}, but expected a primitive`);
            }
            // 6. Throw a TypeError exception.
            return new error_js_1.$TypeError(realm, `${this} has neither a toString nor a valueOf method that returns a primitive`);
        }
        // 4. Else,
        else {
            // 4. a. Let methodNames be « "valueOf", "toString" ».
            // 5. For each name in methodNames in List order, do
            // 5. a. Let method be ? Get(O, name).
            let method = O['[[Get]]'](ctx, intrinsics.$valueOf, O);
            if (method.isAbrupt) {
                return method;
            }
            // 5. b. If IsCallable(method) is true, then
            if (method.isFunction) {
                // 5. b. i. Let result be ? Call(method, O).
                const result = operations_js_1.$Call(ctx, method, O, intrinsics.undefined);
                if (result.isAbrupt) {
                    return result;
                }
                // 5. b. ii. If Type(result) is not Object, return result.
                if (result.isPrimitive) {
                    return result;
                }
            }
            method = O['[[Get]]'](ctx, intrinsics.$toString, O);
            if (method.isAbrupt) {
                return method;
            }
            // 5. b. If IsCallable(method) is true, then
            if (method.isFunction) {
                // 5. b. i. Let result be ? Call(method, O).
                const result = operations_js_1.$Call(ctx, method, O, intrinsics.undefined);
                if (result.isAbrupt) {
                    return result;
                }
                // 5. b. ii. If Type(result) is not Object, return result.
                if (result.isPrimitive) {
                    return result;
                }
                // 6. Throw a TypeError exception.
                return new error_js_1.$TypeError(realm, `toString returned ${result}, but expected a primitive`);
            }
            // 6. Throw a TypeError exception.
            return new error_js_1.$TypeError(realm, `${this} has neither a valueOf nor a toString method that returns a primitive`);
        }
    }
    GetValue(ctx) {
        return this;
    }
    // http://www.ecma-international.org/ecma-262/#sec-getmethod
    // 7.3.9 GetMethod ( V , P )
    GetMethod(ctx, P) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const V = this;
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Let func be ? GetV(V, P).
        const func = V['[[Get]]'](ctx, P, V);
        if (func.isAbrupt) {
            return func;
        }
        // 3. If func is either undefined or null, return undefined.
        if (func.isNil) {
            return intrinsics.undefined;
        }
        // 4. If IsCallable(func) is false, throw a TypeError exception.
        if (!func.isFunction) {
            return new error_js_1.$TypeError(realm, `Return value from GetMethod is ${func}, but expected a callable function`);
        }
        // 5. Return func.
        return func;
    }
    hasProperty(key) {
        return this.propertyMap.has(key['[[Value]]']);
    }
    getProperty(key) {
        return this.propertyDescriptors[this.propertyMap.get(key['[[Value]]'])];
    }
    setProperty(desc) {
        if (this.propertyMap.has(desc.name['[[Value]]'])) {
            const idx = this.propertyMap.get(desc.name['[[Value]]']);
            this.propertyDescriptors[idx] = desc;
            this.propertyKeys[idx] = desc.name;
        }
        else {
            const idx = this.propertyDescriptors.length;
            this.propertyDescriptors[idx] = desc;
            this.propertyKeys[idx] = desc.name;
            this.propertyMap.set(desc.name['[[Value]]'], idx);
        }
    }
    deleteProperty(key) {
        const idx = this.propertyMap.get(key['[[Value]]']);
        this.propertyMap.delete(key['[[Value]]']);
        this.propertyDescriptors.splice(idx, 1);
        this.propertyKeys.splice(idx, 1);
    }
    setDataProperty(name, value, writable = true, enumerable = false, configurable = true) {
        const realm = this.realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const desc = new property_descriptor_js_1.$PropertyDescriptor(realm, name);
        desc['[[Value]]'] = value;
        desc['[[Writable]]'] = writable ? intrinsics.true : intrinsics.false;
        desc['[[Enumerable]]'] = enumerable ? intrinsics.true : intrinsics.false;
        desc['[[Configurable]]'] = configurable ? intrinsics.true : intrinsics.false;
        const idx = this.propertyDescriptors.length;
        this.propertyDescriptors[idx] = desc;
        this.propertyKeys[idx] = name;
        this.propertyMap.set(name['[[Value]]'], idx);
    }
    setAccessorProperty(name, getter, setter, enumerable = false, configurable = true) {
        const realm = this.realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const desc = new property_descriptor_js_1.$PropertyDescriptor(realm, name);
        desc['[[Enumerable]]'] = enumerable ? intrinsics.true : intrinsics.false;
        desc['[[Configurable]]'] = configurable ? intrinsics.true : intrinsics.false;
        if (getter !== null) {
            desc['[[Get]]'] = getter;
        }
        if (setter !== null) {
            desc['[[Set]]'] = setter;
        }
        const idx = this.propertyDescriptors.length;
        this.propertyDescriptors[idx] = desc;
        this.propertyKeys[idx] = name;
        this.propertyMap.set(name['[[Value]]'], idx);
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-getprototypeof
    // 9.1.1 [[GetPrototypeOf]] ( )
    '[[GetPrototypeOf]]'(ctx) {
        // 1. Return ! OrdinaryGetPrototypeOf(O)
        // http://www.ecma-international.org/ecma-262/#sec-ordinarygetprototypeof
        // 9.1.1.1 OrdinaryGetPrototypeOf ( O )
        const O = this;
        // 1. Return O.[[Prototype]].
        return O['[[Prototype]]'];
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-setprototypeof-v
    // 9.1.2 [[SetPrototypeOf]] ( V )
    '[[SetPrototypeOf]]'(ctx, V) {
        const intrinsics = this.realm['[[Intrinsics]]'];
        // 1. Return ! OrdinarySetPrototypeOf(O, V).
        // http://www.ecma-international.org/ecma-262/#sec-ordinarysetprototypeof
        // 9.1.2.1 OrdinarySetPrototypeOf ( O , V )
        const O = this;
        // 1. Assert: Either Type(V) is Object or Type(V) is Null.
        // 2. Let extensible be O.[[Extensible]].
        const extensible = O['[[Extensible]]']['[[Value]]'];
        // 3. Let current be O.[[Prototype]].
        const current = O['[[Prototype]]'];
        // 4. If SameValue(V, current) is true, return true.
        if (V.is(current)) {
            return intrinsics.true;
        }
        // 5. If extensible is false, return false.
        if (!extensible) {
            return intrinsics.false;
        }
        // 6. Let p be V.
        let p = V;
        // 7. Let done be false.
        let done = false;
        // 8. Repeat, while done is false,
        while (!done) {
            // 8. a. If p is null, set done to true.
            if (p.isNull) {
                done = true;
            }
            // 8. b. Else if SameValue(p, O) is true, return false.
            else if (p.is(O)) {
                return intrinsics.false;
            }
            // 8. c. Else,
            else {
                // 8. c. i. If p.[[GetPrototypeOf]] is not the ordinary object internal method defined in 9.1.1, set done to true.
                if (p['[[GetPrototypeOf]]'] !== $Object.prototype['[[GetPrototypeOf]]']) {
                    done = true;
                }
                // 8. c. ii. Else, set p to p.[[Prototype]].
                else {
                    p = p['[[Prototype]]'];
                }
            }
        }
        // 9. Set O.[[Prototype]] to V.
        O['[[Prototype]]'] = V;
        // 10. Return true.
        return intrinsics.true;
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-isextensible
    // 9.1.3 [[IsExtensible]] ( )
    '[[IsExtensible]]'(ctx) {
        // 1. Return ! OrdinaryIsExtensible(O).
        // http://www.ecma-international.org/ecma-262/#sec-ordinaryisextensible
        // 9.1.3.1 OrdinaryIsExtensible ( O )
        const O = this;
        // 1. Return O.[[Extensible]].
        return O['[[Extensible]]'];
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-preventextensions
    // 9.1.4 [[PreventExtensions]] ( )
    '[[PreventExtensions]]'(ctx) {
        const intrinsics = this.realm['[[Intrinsics]]'];
        // 1. Return ! OrdinaryPreventExtensions(O).
        // http://www.ecma-international.org/ecma-262/#sec-ordinarypreventextensions
        // 9.1.4.1 OrdinaryPreventExtensions ( O )
        const O = this;
        // 1. Set O.[[Extensible]] to false.
        O['[[Extensible]]'] = intrinsics.false;
        // 2. Return true.
        return intrinsics.true;
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-getownproperty-p
    // 9.1.5 [[GetOwnProperty]] ( P )
    '[[GetOwnProperty]]'(ctx, P) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Return ! OrdinaryGetOwnProperty(O, P).
        // http://www.ecma-international.org/ecma-262/#sec-ordinarygetownproperty
        // 9.1.5.1 OrdinaryGetOwnProperty ( O , P )
        const O = this;
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. If O does not have an own property with key P, return undefined.
        if (!O.hasProperty(P)) {
            return intrinsics.undefined;
        }
        // 3. Let D be a newly created Property Descriptor with no fields.
        const D = new property_descriptor_js_1.$PropertyDescriptor(realm, P);
        // 4. Let X be O's own property whose key is P.
        const X = O.getProperty(P);
        // 5. If X is a data property, then
        if (X.isDataDescriptor) {
            // 5. a. Set D.[[Value]] to the value of X's [[Value]] attribute.
            D['[[Value]]'] = X['[[Value]]'];
            // 5. b. Set D.[[Writable]] to the value of X's [[Writable]] attribute.
            D['[[Writable]]'] = X['[[Writable]]'];
        }
        // 6. Else X is an accessor property,
        else {
            // 6. a. Set D.[[Get]] to the value of X's [[Get]] attribute.
            D['[[Get]]'] = X['[[Get]]'];
            // 6. b. Set D.[[Set]] to the value of X's [[Set]] attribute.
            D['[[Set]]'] = X['[[Set]]'];
        }
        // 7. Set D.[[Enumerable]] to the value of X's [[Enumerable]] attribute.
        D['[[Enumerable]]'] = X['[[Enumerable]]'];
        // 8. Set D.[[Configurable]] to the value of X's [[Configurable]] attribute.
        D['[[Configurable]]'] = X['[[Configurable]]'];
        // 9. Return D.
        return D;
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-defineownproperty-p-desc
    // 9.1.6 [[DefineOwnProperty]] ( P , Desc )
    '[[DefineOwnProperty]]'(ctx, P, Desc) {
        // 1. Return ? OrdinaryDefineOwnProperty(O, P, Desc).
        const O = this;
        // http://www.ecma-international.org/ecma-262/#sec-ordinarydefineownproperty
        // 9.1.6.1 OrdinaryDefineOwnProperty ( O , P , Desc )
        // 1. Let current be ? O.[[GetOwnProperty]](P).
        const current = O['[[GetOwnProperty]]'](ctx, P);
        if (current.isAbrupt) {
            return current;
        }
        // 2. Let extensible be ? IsExtensible(O).
        const extensible = O['[[IsExtensible]]'](ctx);
        if (extensible.isAbrupt) {
            return extensible;
        }
        // 3. Return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current).
        return operations_js_1.$ValidateAndApplyPropertyDescriptor(ctx, O, P, extensible, Desc, current);
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-hasproperty-p
    // 9.1.7 [[HasProperty]] ( P )
    '[[HasProperty]]'(ctx, P) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Return ? OrdinaryHasProperty(O, P).
        // http://www.ecma-international.org/ecma-262/#sec-ordinaryhasproperty
        // 9.1.7.1 OrdinaryHasProperty ( O , P )
        const O = this;
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Let hasOwn be ? O.[[GetOwnProperty]](P).
        const hasOwn = O['[[GetOwnProperty]]'](ctx, P);
        if (hasOwn.isAbrupt) {
            return hasOwn;
        }
        // 3. If hasOwn is not undefined, return true.
        if (!hasOwn.isUndefined) {
            return intrinsics.true;
        }
        // 4. Let parent be ? O.[[GetPrototypeOf]]().
        const parent = O['[[GetPrototypeOf]]'](ctx);
        if (parent.isAbrupt) {
            return parent;
        }
        // 5. If parent is not null, then
        if (!parent.isNull) {
            // 5. a. Return ? parent.[[HasProperty]](P).
            return parent['[[HasProperty]]'](ctx, P);
        }
        // 6. Return false.
        return intrinsics.false;
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver
    // 9.1.8 [[Get]] ( P , Receiver )
    '[[Get]]'(ctx, P, Receiver) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Return ? OrdinaryGet(O, P, Receiver).
        // http://www.ecma-international.org/ecma-262/#sec-ordinaryget
        // 9.1.8.1 OrdinaryGet ( O , P , Receiver )
        const O = this;
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Let desc be ? O.[[GetOwnProperty]](P).
        const desc = O['[[GetOwnProperty]]'](ctx, P);
        if (desc.isAbrupt) {
            return desc;
        }
        // 3. If desc is undefined, then
        if (desc.isUndefined) {
            // 3. a. Let parent be ? O.[[GetPrototypeOf]]().
            const parent = O['[[GetPrototypeOf]]'](ctx);
            if (parent.isAbrupt) {
                return parent;
            }
            // 3. b. If parent is null, return undefined.
            if (parent.isNull) {
                return intrinsics.undefined;
            }
            // 3. c. Return ? parent.[[Get]](P, Receiver).
            return parent['[[Get]]'](ctx, P, Receiver);
        }
        // 4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
        if (desc.isDataDescriptor) {
            return desc['[[Value]]'];
        }
        // 5. Assert: IsAccessorDescriptor(desc) is true.
        // 6. Let getter be desc.[[Get]].
        const getter = desc['[[Get]]'];
        // 7. If getter is undefined, return undefined.
        if (getter.isUndefined) {
            return getter;
        }
        // 8. Return ? Call(getter, Receiver).
        return operations_js_1.$Call(ctx, getter, Receiver, intrinsics.undefined);
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-set-p-v-receiver
    // 9.1.9 [[Set]] ( P , V , Receiver )
    '[[Set]]'(ctx, P, V, Receiver) {
        // 1. Return ? OrdinarySet(O, P, V, Receiver).
        // http://www.ecma-international.org/ecma-262/#sec-ordinaryset
        // 9.1.9.1 OrdinarySet ( O , P , V , Receiver )
        const O = this;
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Let ownDesc be ? O.[[GetOwnProperty]](P).
        const ownDesc = O['[[GetOwnProperty]]'](ctx, P);
        if (ownDesc.isAbrupt) {
            return ownDesc;
        }
        // 3. Return OrdinarySetWithOwnDescriptor(O, P, V, Receiver, ownDesc).
        return operations_js_1.$OrdinarySetWithOwnDescriptor(ctx, O, P, V, Receiver, ownDesc);
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-delete-p
    // 9.1.10 [[Delete]] ( P )
    '[[Delete]]'(ctx, P) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Return ? OrdinaryDelete(O, P).
        // http://www.ecma-international.org/ecma-262/#sec-ordinarydelete
        // 9.1.10.1 OrdinaryDelete ( O , P )
        const O = this;
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Let desc be ? O.[[GetOwnProperty]](P).
        const desc = O['[[GetOwnProperty]]'](ctx, P);
        if (desc.isAbrupt) {
            return desc;
        }
        // 3. If desc is undefined, return true.
        if (desc.isUndefined) {
            return intrinsics.true;
        }
        // 4. If desc.[[Configurable]] is true, then
        if (desc['[[Configurable]]'].isTruthy) {
            // 4. a. Remove the own property with name P from O.
            O.deleteProperty(P);
            // 4. b. Return true.
            return intrinsics.true;
        }
        // 5. Return false.
        return intrinsics.false;
    }
    // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
    // 9.1.11 [[OwnPropertyKeys]] ( )
    '[[OwnPropertyKeys]]'(ctx) {
        // 1. Return ! OrdinaryOwnPropertyKeys(O).
        // http://www.ecma-international.org/ecma-262/#sec-ordinaryownpropertykeys
        // 9.1.11.1 OrdinaryOwnPropertyKeys ( O )
        // 1. Let keys be a new empty List.
        const keys = new list_js_1.$List();
        let arrayIndexLen = 0;
        let stringLen = 0;
        let symbolLen = 0;
        const arrayIndexProps = [];
        const stringProps = [];
        const symbolProps = [];
        const ownPropertyKeys = this.propertyKeys;
        let ownPropertyKey;
        for (let i = 0, ii = ownPropertyKeys.length; i < ii; ++i) {
            ownPropertyKey = ownPropertyKeys[i];
            if (ownPropertyKey.isString) {
                if (ownPropertyKey.IsArrayIndex) {
                    arrayIndexProps[arrayIndexLen++] = ownPropertyKey;
                }
                else {
                    stringProps[stringLen++] = ownPropertyKey;
                }
            }
            else {
                symbolProps[symbolLen++] = ownPropertyKey;
            }
        }
        arrayIndexProps.sort(_shared_js_1.compareIndices);
        let i = 0;
        let keysLen = 0;
        // 2. For each own property key P of O that is an array index, in ascending numeric index order, do
        for (i = 0; i < arrayIndexLen; ++i) {
            // 2. a. Add P as the last element of keys.
            keys[keysLen++] = arrayIndexProps[i];
        }
        // 3. For each own property key P of O that is a String but is not an array index, in ascending chronological order of property creation, do
        for (i = 0; i < stringLen; ++i) {
            // 3. a. Add P as the last element of keys.
            keys[keysLen++] = stringProps[i];
        }
        // 4. For each own property key P of O that is a Symbol, in ascending chronological order of property creation, do
        for (i = 0; i < symbolLen; ++i) {
            // 4. a. Add P as the last element of keys.
            keys[keysLen++] = symbolProps[i];
        }
        // 5. Return keys.
        return keys;
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        this.propertyDescriptors.forEach(x => { x.dispose(); });
        this.propertyDescriptors = void 0;
        this.propertyKeys = void 0;
        this.propertyMap = void 0;
        this['[[Target]]'] = void 0;
        this['[[Prototype]]'] = void 0;
        this['[[Extensible]]'] = void 0;
        this.realm = void 0;
    }
}
exports.$Object = $Object;
//# sourceMappingURL=object.js.map