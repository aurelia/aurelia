"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ObjProto_valueOf = exports.$ObjProto_toString = exports.$ObjectPrototype_toLocaleString = exports.$ObjectPrototype_propertyIsEnumerable = exports.$ObjectPrototype_isPrototypeOf = exports.$ObjectPrototype_hasOwnProperty = exports.$ObjectPrototype = exports.$Object_values = exports.$Object_setPrototypeOf = exports.$Object_seal = exports.$Object_preventExtensions = exports.$Object_keys = exports.$Object_isSealed = exports.$Object_isFrozen = exports.$Object_isExtensible = exports.$Object_is = exports.$Object_getPrototypeOf = exports.$GetOwnPropertyKeys = exports.$Object_getOwnPropertySymbols = exports.$Object_getOwnPropertyNames = exports.$Object_getOwnPropertyDescriptors = exports.$Object_getOwnPropertyDescriptor = exports.$CreateDataPropertyOnObject = exports.$Object_fromEntries = exports.$Object_freeze = exports.$Object_entries = exports.$Object_defineProperty = exports.$ObjectDefineProperties = exports.$Object_defineProperties = exports.$Object_create = exports.$Object_assign = exports.$ObjectConstructor = void 0;
const function_js_1 = require("../types/function.js");
const object_js_1 = require("../types/object.js");
const string_js_1 = require("../types/string.js");
const string_js_2 = require("../exotics/string.js");
// http://www.ecma-international.org/ecma-262/#sec-object-constructor
// #region 19.1.1 The Object Constructor
class $ObjectConstructor extends function_js_1.$BuiltinFunction {
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype
    // 19.1.2.19 Object.prototype
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.assign
    // 19.1.2.1 Object.assign ( target , ... sources )
    get $assign() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$assign)['[[Value]]'];
    }
    set $assign(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$assign, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.create
    // 19.1.2.2 Object.create ( O , Properties )
    get $create() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$create)['[[Value]]'];
    }
    set $create(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$create, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.defineproperties
    // 19.1.2.3 Object.defineProperties ( O , Properties )
    get $defineProperties() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$defineProperties)['[[Value]]'];
    }
    set $defineProperties(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$defineProperties, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.defineproperty
    // 19.1.2.4 Object.defineProperty ( O , P , Attributes )
    get $defineProperty() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$defineProperty)['[[Value]]'];
    }
    set $defineProperty(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$defineProperty, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.entries
    // 19.1.2.5 Object.entries ( O )
    get $entries() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$entries)['[[Value]]'];
    }
    set $entries(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$entries, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.freeze
    // 19.1.2.6 Object.freeze ( O )
    get $freeze() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$freeze)['[[Value]]'];
    }
    set $freeze(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$freeze, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.fromentries
    // 19.1.2.7 Object.fromEntries ( iterable )
    get $fromEntries() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$fromEntries)['[[Value]]'];
    }
    set $fromEntries(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$fromEntries, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptor
    // 19.1.2.8 Object.getOwnPropertyDescriptor ( O , P )
    get $getOwnPropertyDescriptor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor)['[[Value]]'];
    }
    set $getOwnPropertyDescriptor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptors
    // 19.1.2.9 Object.getOwnPropertyDescriptors ( O )
    get $getOwnPropertyDescriptors() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptors)['[[Value]]'];
    }
    set $getOwnPropertyDescriptors(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptors, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertynames
    // 19.1.2.10 Object.getOwnPropertyNames ( O )
    get $getOwnPropertyNames() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyNames)['[[Value]]'];
    }
    set $getOwnPropertyNames(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyNames, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertysymbols
    // 19.1.2.11 Object.getOwnPropertySymbols ( O )
    get $getOwnPropertySymbols() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertySymbols)['[[Value]]'];
    }
    set $getOwnPropertySymbols(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertySymbols, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.getprototypeof
    // 19.1.2.12 Object.getPrototypeOf ( O )
    get $getPrototypeOf() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf)['[[Value]]'];
    }
    set $getPrototypeOf(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.is
    // 19.1.2.13 Object.is ( value1 , value2 )
    get $is() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$is)['[[Value]]'];
    }
    set $is(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$is, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.isextensible
    // 19.1.2.14 Object.isExtensible ( O )
    get $isExtensible() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$isExtensible)['[[Value]]'];
    }
    set $isExtensible(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$isExtensible, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.isfrozen
    // 19.1.2.15 Object.isFrozen ( O )
    get $isFrozen() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$isFrozen)['[[Value]]'];
    }
    set $isFrozen(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$isFrozen, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.issealed
    // 19.1.2.16 Object.isSealed ( O )
    get $isSealed() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$isSealed)['[[Value]]'];
    }
    set $isSealed(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$isSealed, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.keys
    // 19.1.2.17 Object.keys ( O )
    get $keys() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$keys)['[[Value]]'];
    }
    set $keys(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$keys, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.preventextensions
    // 19.1.2.18 Object.preventExtensions ( O )
    get $preventExtensions() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$preventExtensions)['[[Value]]'];
    }
    set $preventExtensions(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$preventExtensions, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.seal
    // 19.1.2.20 Object.seal ( O )
    get $seal() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$seal)['[[Value]]'];
    }
    set $seal(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$seal, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.setprototypeof
    // 19.1.2.21 Object.setPrototypeOf ( O , proto )
    get $setPrototypeOf() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf)['[[Value]]'];
    }
    set $setPrototypeOf(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.values
    // 19.1.2.22 Object.values ( O )
    get $values() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$values)['[[Value]]'];
    }
    set $values(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$values, value);
    }
    constructor(realm, functionPrototype) {
        super(realm, '%Object%', functionPrototype);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object-value
    // 19.1.1.1 Object ( [ value ] )
    performSteps(ctx, thisArgument, [value], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is neither undefined nor the active function, then
        if (!NewTarget.isUndefined && NewTarget !== this) {
            // 1. a. Return ? OrdinaryCreateFromConstructor(NewTarget, "%ObjectPrototype%").
            return function_js_1.$OrdinaryCreateFromConstructor(ctx, NewTarget, '%ObjectPrototype%');
        }
        // 2. If value is null, undefined or not supplied, return ObjectCreate(%ObjectPrototype%).
        if (value === void 0 || value.isNil) {
            return object_js_1.$Object.ObjectCreate(ctx, 'Object', intrinsics['%ObjectPrototype%']);
        }
        // 3. Return ! ToObject(value).
        return value.ToObject(ctx);
    }
}
exports.$ObjectConstructor = $ObjectConstructor;
// http://www.ecma-international.org/ecma-262/#sec-object.assign
// 19.1.2.1 Object.assign ( target , ... sources )
class $Object_assign extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.assign', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let to be ? ToObject(target).
        // 2. If only one argument was passed, return to.
        // 3. Let sources be the List of argument values starting with the second argument.
        // 4. For each element nextSource of sources, in ascending index order, do
        // 4. a. If nextSource is neither undefined nor null, then
        // 4. a. i. Let from be ! ToObject(nextSource).
        // 4. a. ii. Let keys be ? from.[[OwnPropertyKeys]]().
        // 4. a. iii. For each element nextKey of keys in List order, do
        // 4. a. iii. 1. Let desc be ? from.[[GetOwnProperty]](nextKey).
        // 4. a. iii. 2. If desc is not undefined and desc.[[Enumerable]] is true, then
        // 4. a. iii. 2. a. Let propValue be ? Get(from, nextKey).
        // 4. a. iii. 2. b. Perform ? Set(to, nextKey, propValue, true).
        // 5. Return to.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_assign = $Object_assign;
// http://www.ecma-international.org/ecma-262/#sec-object.create
// 19.1.2.2 Object.create ( O , Properties )
class $Object_create extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.create', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is neither Object nor Null, throw a TypeError exception.
        // 2. Let obj be ObjectCreate(O).
        // 3. If Properties is not undefined, then
        // 3. a. Return ? ObjectDefineProperties(obj, Properties).
        // 4. Return obj.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_create = $Object_create;
// http://www.ecma-international.org/ecma-262/#sec-object.defineproperties
// 19.1.2.3 Object.defineProperties ( O , Properties )
class $Object_defineProperties extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.defineProperties', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Return ? ObjectDefineProperties(O, Properties).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_defineProperties = $Object_defineProperties;
// http://www.ecma-international.org/ecma-262/#sec-objectdefineproperties
// 19.1.2.3.1 Runtime Semantics: ObjectDefineProperties ( O , Properties )
function $ObjectDefineProperties(ctx, O, Properties) {
    // 1. If Type(O) is not Object, throw a TypeError exception.
    // 2. Let props be ? ToObject(Properties).
    // 3. Let keys be ? props.[[OwnPropertyKeys]]().
    // 4. Let descriptors be a new empty List.
    // 5. For each element nextKey of keys in List order, do
    // 5. a. Let propDesc be ? props.[[GetOwnProperty]](nextKey).
    // 5. b. If propDesc is not undefined and propDesc.[[Enumerable]] is true, then
    // 5. b. i. Let descObj be ? Get(props, nextKey).
    // 5. b. ii. Let desc be ? ToPropertyDescriptor(descObj).
    // 5. b. iii. Append the pair (a two element List) consisting of nextKey and desc to the end of descriptors.
    // 6. For each pair from descriptors in list order, do
    // 6. a. Let P be the first element of pair.
    // 6. b. Let desc be the second element of pair.
    // 6. c. Perform ? DefinePropertyOrThrow(O, P, desc).
    // 7. Return O.
    throw new Error('Method not implemented.');
}
exports.$ObjectDefineProperties = $ObjectDefineProperties;
// http://www.ecma-international.org/ecma-262/#sec-object.defineproperty
// 19.1.2.4 Object.defineProperty ( O , P , Attributes )
class $Object_defineProperty extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.defineProperty', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is not Object, throw a TypeError exception.
        // 2. Let key be ? ToPropertyKey(P).
        // 3. Let desc be ? ToPropertyDescriptor(Attributes).
        // 4. Perform ? DefinePropertyOrThrow(O, key, desc).
        // 5. Return O.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_defineProperty = $Object_defineProperty;
// http://www.ecma-international.org/ecma-262/#sec-object.entries
// 19.1.2.5 Object.entries ( O )
class $Object_entries extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.entries', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let obj be ? ToObject(O).
        // 2. Let nameList be ? EnumerableOwnPropertyNames(obj, "key+value").
        // 3. Return CreateArrayFromList(nameList).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_entries = $Object_entries;
// http://www.ecma-international.org/ecma-262/#sec-object.freeze
// 19.1.2.6 Object.freeze ( O )
class $Object_freeze extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.freeze', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is not Object, return O.
        // 2. Let status be ? SetIntegrityLevel(O, "frozen").
        // 3. If status is false, throw a TypeError exception.
        // 4. Return O.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_freeze = $Object_freeze;
// http://www.ecma-international.org/ecma-262/#sec-object.fromentries
// 19.1.2.7 Object.fromEntries ( iterable )
class $Object_fromEntries extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.fromEntries', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Perform ? RequireObjectCoercible(iterable).
        // 2. Let obj be ObjectCreate(%ObjectPrototype%).
        // 3. Assert: obj is an extensible ordinary object with no own properties.
        // 4. Let stepsDefine be the algorithm steps defined in CreateDataPropertyOnObject Functions.
        // 5. Let adder be CreateBuiltinFunction(stepsDefine, « »).
        // 6. Return ? AddEntriesFromIterable(obj, iterable, adder).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_fromEntries = $Object_fromEntries;
// http://www.ecma-international.org/ecma-262/#sec-create-data-property-on-object-functions
// 19.1.2.7.1 CreateDataPropertyOnObject Functions
class $CreateDataPropertyOnObject extends function_js_1.$BuiltinFunction {
    constructor(realm) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, 'CreateDataPropertyOnObject', intrinsics['%FunctionPrototype%']);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let O be the this value.
        // 2. Assert: Type(O) is Object.
        // 3. Assert: O is an extensible ordinary object.
        // 4. Let propertyKey be ? ToPropertyKey(key).
        // 5. Perform ! CreateDataPropertyOrThrow(O, propertyKey, value).
        // 6. Return undefined.
        throw new Error('Method not implemented.');
    }
}
exports.$CreateDataPropertyOnObject = $CreateDataPropertyOnObject;
// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptor
// 19.1.2.8 Object.getOwnPropertyDescriptor ( O , P )
class $Object_getOwnPropertyDescriptor extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.getOwnPropertyDescriptor', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let obj be ? ToObject(O).
        // 2. Let key be ? ToPropertyKey(P).
        // 3. Let desc be ? obj.[[GetOwnProperty]](key).
        // 4. Return FromPropertyDescriptor(desc).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_getOwnPropertyDescriptor = $Object_getOwnPropertyDescriptor;
// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptors
// 19.1.2.9 Object.getOwnPropertyDescriptors ( O )
class $Object_getOwnPropertyDescriptors extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.getOwnPropertyDescriptors', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let obj be ? ToObject(O).
        // 2. Let ownKeys be ? obj.[[OwnPropertyKeys]]().
        // 3. Let descriptors be ! ObjectCreate(%ObjectPrototype%).
        // 4. For each element key of ownKeys in List order, do
        // 4. a. Let desc be ? obj.[[GetOwnProperty]](key).
        // 4. b. Let descriptor be ! FromPropertyDescriptor(desc).
        // 4. c. If descriptor is not undefined, perform ! CreateDataProperty(descriptors, key, descriptor).
        // 5. Return descriptors.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_getOwnPropertyDescriptors = $Object_getOwnPropertyDescriptors;
// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertynames
// 19.1.2.10 Object.getOwnPropertyNames ( O )
class $Object_getOwnPropertyNames extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.getOwnPropertyNames', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Return ? GetOwnPropertyKeys(O, String).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_getOwnPropertyNames = $Object_getOwnPropertyNames;
// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertysymbols
// 19.1.2.11 Object.getOwnPropertySymbols ( O )
class $Object_getOwnPropertySymbols extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.getOwnPropertySymbols', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Return ? GetOwnPropertyKeys(O, Symbol).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_getOwnPropertySymbols = $Object_getOwnPropertySymbols;
// http://www.ecma-international.org/ecma-262/#sec-getownpropertykeys
// 19.1.2.11.1 Runtime Semantics: GetOwnPropertyKeys ( O , type )
function $GetOwnPropertyKeys(ctx, O, type) {
    // 1. Let obj be ? ToObject(O).
    // 2. Let keys be ? obj.[[OwnPropertyKeys]]().
    // 3. Let nameList be a new empty List.
    // 4. For each element nextKey of keys in List order, do
    // 4. a. If Type(nextKey) is type, then
    // 4. a. i. Append nextKey as the last element of nameList.
    // 5. Return CreateArrayFromList(nameList).
    throw new Error('Method not implemented.');
}
exports.$GetOwnPropertyKeys = $GetOwnPropertyKeys;
// http://www.ecma-international.org/ecma-262/#sec-object.getprototypeof
// 19.1.2.12 Object.getPrototypeOf ( O )
class $Object_getPrototypeOf extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.getPrototypeOf', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let obj be ? ToObject(O).
        // 2. Return ? obj.[[GetPrototypeOf]]().
        throw new Error('Method not implemented.');
    }
}
exports.$Object_getPrototypeOf = $Object_getPrototypeOf;
// http://www.ecma-international.org/ecma-262/#sec-object.is
// 19.1.2.13 Object.is ( value1 , value2 )
class $Object_is extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.is', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Return SameValue(value1, value2).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_is = $Object_is;
// http://www.ecma-international.org/ecma-262/#sec-object.isextensible
// 19.1.2.14 Object.isExtensible ( O )
class $Object_isExtensible extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.isExtensible', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is not Object, return false.
        // 2. Return ? IsExtensible(O).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_isExtensible = $Object_isExtensible;
// http://www.ecma-international.org/ecma-262/#sec-object.isfrozen
// 19.1.2.15 Object.isFrozen ( O )
class $Object_isFrozen extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.isFrozen', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is not Object, return true.
        // 2. Return ? TestIntegrityLevel(O, "frozen").
        throw new Error('Method not implemented.');
    }
}
exports.$Object_isFrozen = $Object_isFrozen;
// http://www.ecma-international.org/ecma-262/#sec-object.issealed
// 19.1.2.16 Object.isSealed ( O )
class $Object_isSealed extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.isSealed', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is not Object, return true.
        // 2. Return ? TestIntegrityLevel(O, "sealed").
        throw new Error('Method not implemented.');
    }
}
exports.$Object_isSealed = $Object_isSealed;
// http://www.ecma-international.org/ecma-262/#sec-object.keys
// 19.1.2.17 Object.keys ( O )
class $Object_keys extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.keys', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let obj be ? ToObject(O).
        // 2. Let nameList be ? EnumerableOwnPropertyNames(obj, "key").
        // 3. Return CreateArrayFromList(nameList).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_keys = $Object_keys;
// http://www.ecma-international.org/ecma-262/#sec-object.preventextensions
// 19.1.2.18 Object.preventExtensions ( O )
class $Object_preventExtensions extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.preventExtensions', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is not Object, return O.
        // 2. Let status be ? O.[[PreventExtensions]]().
        // 3. If status is false, throw a TypeError exception.
        // 4. Return O.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_preventExtensions = $Object_preventExtensions;
// http://www.ecma-international.org/ecma-262/#sec-object.seal
// 19.1.2.20 Object.seal ( O )
class $Object_seal extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.seal', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. If Type(O) is not Object, return O.
        // 2. Let status be ? SetIntegrityLevel(O, "sealed").
        // 3. If status is false, throw a TypeError exception.
        // 4. Return O.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_seal = $Object_seal;
// http://www.ecma-international.org/ecma-262/#sec-object.setprototypeof
// 19.1.2.21 Object.setPrototypeOf ( O , proto )
class $Object_setPrototypeOf extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.setPrototypeOf', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Set O to ? RequireObjectCoercible(O).
        // 2. If Type(proto) is neither Object nor Null, throw a TypeError exception.
        // 3. If Type(O) is not Object, return O.
        // 4. Let status be ? O.[[SetPrototypeOf]](proto).
        // 5. If status is false, throw a TypeError exception.
        // 6. Return O.
        throw new Error('Method not implemented.');
    }
}
exports.$Object_setPrototypeOf = $Object_setPrototypeOf;
// http://www.ecma-international.org/ecma-262/#sec-object.values
// 19.1.2.22 Object.values ( O )
class $Object_values extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.values', proto);
    }
    performSteps(ctx, thisArgument, [O], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (O === void 0) {
            O = intrinsics.undefined;
        }
        // 1. Let obj be ? ToObject(O).
        // 2. Let nameList be ? EnumerableOwnPropertyNames(obj, "value").
        // 3. Return CreateArrayFromList(nameList).
        throw new Error('Method not implemented.');
    }
}
exports.$Object_values = $Object_values;
// #endregion
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-object-prototype-object
// #region 19.1.3 Properties of the Object Prototype Object
class $ObjectPrototype extends object_js_1.$Object {
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype.constructor
    // 19.1.3.1 Object.prototype.constructor
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype.hasownproperty
    // 19.1.3.2 Object.prototype.hasOwnProperty ( V )
    get $hasOwnProperty() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$hasOwnProperty)['[[Value]]'];
    }
    set $hasOwnProperty(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$hasOwnProperty, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype.isprototypeof
    // 19.1.3.3 Object.prototype.isPrototypeOf ( V )
    get $isPrototypeOf() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$isPrototypeOf)['[[Value]]'];
    }
    set $isPrototypeOf(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$isPrototypeOf, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype.propertyisenumerable
    // 19.1.3.4 Object.prototype.propertyIsEnumerable ( V )
    get $propertyIsEnumerable() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$propertyIsEnumerable)['[[Value]]'];
    }
    set $propertyIsEnumerable(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$propertyIsEnumerable, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype.tolocalestring
    // 19.1.3.5 Object.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
    get $toLocaleString() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$toLocaleString)['[[Value]]'];
    }
    set $toLocaleString(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$toLocaleString, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype.tostring
    // 19.1.3.6 Object.prototype.toString ( )
    get $toString() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$toString)['[[Value]]'];
    }
    set $toString(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$toString, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-object.prototype.valueof
    // 19.1.3.7 Object.prototype.valueOf ( )
    get $valueOf() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$valueOf)['[[Value]]'];
    }
    set $valueOf(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$valueOf, value);
    }
    constructor(realm) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%ObjectPrototype%', intrinsics.null, 1 /* normal */, intrinsics.empty);
    }
}
exports.$ObjectPrototype = $ObjectPrototype;
// http://www.ecma-international.org/ecma-262/#sec-object.prototype.hasownproperty
// 19.1.3.2 Object.prototype.hasOwnProperty ( V )
class $ObjectPrototype_hasOwnProperty extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.prototype.hasOwnProperty', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let P be ? ToPropertyKey(V).
        // 2. Let O be ? ToObject(this value).
        // 3. Return ? HasOwnProperty(O, P).
        throw new Error('Method not implemented.');
    }
}
exports.$ObjectPrototype_hasOwnProperty = $ObjectPrototype_hasOwnProperty;
// http://www.ecma-international.org/ecma-262/#sec-object.prototype.isprototypeof
// 19.1.3.3 Object.prototype.isPrototypeOf ( V )
class $ObjectPrototype_isPrototypeOf extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.prototype.isPrototypeOf', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If Type(V) is not Object, return false.
        // 2. Let O be ? ToObject(this value).
        // 3. Repeat,
        // 3. a. Set V to ? V.[[GetPrototypeOf]]().
        // 3. b. If V is null, return false.
        // 3. c. If SameValue(O, V) is true, return true.
        throw new Error('Method not implemented.');
    }
}
exports.$ObjectPrototype_isPrototypeOf = $ObjectPrototype_isPrototypeOf;
// http://www.ecma-international.org/ecma-262/#sec-object.prototype.propertyisenumerable
// 19.1.3.4 Object.prototype.propertyIsEnumerable ( V )
class $ObjectPrototype_propertyIsEnumerable extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.prototype.propertyIsEnumerable', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let P be ? ToPropertyKey(V).
        // 2. Let O be ? ToObject(this value).
        // 3. Let desc be ? O.[[GetOwnProperty]](P).
        // 4. If desc is undefined, return false.
        // 5. Return desc.[[Enumerable]].
        throw new Error('Method not implemented.');
    }
}
exports.$ObjectPrototype_propertyIsEnumerable = $ObjectPrototype_propertyIsEnumerable;
// http://www.ecma-international.org/ecma-262/#sec-object.prototype.tolocalestring
// 19.1.3.5 Object.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
class $ObjectPrototype_toLocaleString extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.prototype.toLocaleString', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let O be the this value.
        // 2. Return ? Invoke(O, "toString").
        throw new Error('Method not implemented.');
    }
}
exports.$ObjectPrototype_toLocaleString = $ObjectPrototype_toLocaleString;
// http://www.ecma-international.org/ecma-262/#sec-object.prototype.tostring
// 19.1.3.6 Object.prototype.toString ( )
class $ObjProto_toString extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Object.prototype.toString', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If the this value is undefined, return "[object Undefined]".
        if (thisArgument.isUndefined) {
            return new string_js_1.$String(realm, '[object Undefined]');
        }
        // 2. If the this value is null, return "[object Null]".
        if (thisArgument.isNull) {
            return new string_js_1.$String(realm, '[object Null]');
        }
        // 3. Let O be ! ToObject(this value).
        const O = thisArgument.ToObject(ctx);
        const tag = O['[[Get]]'](ctx, intrinsics['@@toStringTag'], O);
        if (tag.isAbrupt) {
            return tag;
        }
        if (tag.isString) {
            return new string_js_1.$String(realm, `[object ${tag['[[Value]]']}]`);
        }
        // 4. Let isArray be ? IsArray(O).
        // 5. If isArray is true, let builtinTag be "Array".
        if (O.isArray) {
            // TODO: implement IsArray semantics for proxy with null handler (which throws type error)
            return new string_js_1.$String(realm, `[object Array]`);
        }
        // 6. Else if O is a String exotic object, let builtinTag be "String".
        if (O instanceof string_js_2.$StringExoticObject) {
            return new string_js_1.$String(realm, `[object String]`);
        }
        // 7. Else if O has a [[ParameterMap]] internal slot, let builtinTag be "Arguments".
        if ('[[ParameterMap]]' in O) {
            return new string_js_1.$String(realm, `[object Arguments]`);
        }
        // 8. Else if O has a [[Call]] internal method, let builtinTag be "Function".
        if ('[[Call]]' in O) {
            return new string_js_1.$String(realm, `[object Function]`);
        }
        // 9. Else if O has an [[ErrorData]] internal slot, let builtinTag be "Error".
        if ('[[ErrorData]]' in O) {
            return new string_js_1.$String(realm, `[object Error]`);
        }
        // 10. Else if O has a [[BooleanData]] internal slot, let builtinTag be "Boolean".
        if ('[[BooleanData]]' in O) {
            return new string_js_1.$String(realm, `[object Boolean]`);
        }
        // 11. Else if O has a [[NumberData]] internal slot, let builtinTag be "Number".
        if ('[[NumberData]]' in O) {
            return new string_js_1.$String(realm, `[object Number]`);
        }
        // 12. Else if O has a [[DateValue]] internal slot, let builtinTag be "Date".
        if ('[[DateValue]]' in O) {
            return new string_js_1.$String(realm, `[object Date]`);
        }
        // 13. Else if O has a [[RegExpMatcher]] internal slot, let builtinTag be "RegExp".
        if ('[[RegExpMatcher]]' in O) {
            return new string_js_1.$String(realm, `[object RegExp]`);
        }
        // 14. Else, let builtinTag be "Object".
        return new string_js_1.$String(realm, `[object Object]`);
        // 15. Let tag be ? Get(O, @@toStringTag).
        // 16. If Type(tag) is not String, set tag to builtinTag.
        // 17. Return the string-concatenation of "[object ", tag, and "]".
    }
}
exports.$ObjProto_toString = $ObjProto_toString;
// http://www.ecma-international.org/ecma-262/#sec-object.prototype.valueof
// 19.1.3.7 Object.prototype.valueOf ( )
class $ObjProto_valueOf extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%ObjProto_valueOf%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Return ? ToObject(this value).
        throw new Error('Method not implemented.');
    }
}
exports.$ObjProto_valueOf = $ObjProto_valueOf;
// #endregion
//# sourceMappingURL=object.js.map