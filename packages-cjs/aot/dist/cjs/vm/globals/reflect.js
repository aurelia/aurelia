"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Reflect_setPrototypeOf = exports.$Reflect_set = exports.$Reflect_preventExtensions = exports.$Reflect_ownKeys = exports.$Reflect_isExtensible = exports.$Reflect_has = exports.$Reflect_getPrototypeOf = exports.$Reflect_getOwnPropertyDescriptor = exports.$Reflect_get = exports.$Reflect_deleteProperty = exports.$Reflect_defineProperty = exports.$Reflect_construct = exports.$Reflect_apply = exports.$Reflect = void 0;
const function_js_1 = require("../types/function.js");
const error_js_1 = require("../types/error.js");
const object_js_1 = require("../types/object.js");
const operations_js_1 = require("../operations.js");
const array_js_1 = require("../exotics/array.js");
// http://www.ecma-international.org/ecma-262/#sec-reflection
// 26 Reflection
// http://www.ecma-international.org/ecma-262/#sec-reflect-object
// 26.1 The Reflect Object
class $Reflect extends object_js_1.$Object {
    // http://www.ecma-international.org/ecma-262/#sec-reflect.apply
    // 26.1.1 Reflect.apply ( target , thisArgument , argumentsList )
    get $apply() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$apply)['[[Value]]'];
    }
    set $apply(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$apply, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.construct
    // 26.1.2 Reflect.construct ( target , argumentsList [ , newTarget ] )
    get $construct() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$construct)['[[Value]]'];
    }
    set $construct(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$construct, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.defineproperty
    // 26.1.3 Reflect.defineProperty ( target , propertyKey , attributes )
    get $defineProperty() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$defineProperty)['[[Value]]'];
    }
    set $defineProperty(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$defineProperty, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.deleteproperty
    // 26.1.4 Reflect.deleteProperty ( target , propertyKey )
    get $deleteProperty() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$deleteProperty)['[[Value]]'];
    }
    set $deleteProperty(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$deleteProperty, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.get
    // 26.1.5 Reflect.get ( target , propertyKey [ , receiver ] )
    get $get() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$get)['[[Value]]'];
    }
    set $get(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$get, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.getownpropertydescriptor
    // 26.1.6 Reflect.getOwnPropertyDescriptor ( target , propertyKey )
    get $getOwnPropertyDescriptor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor)['[[Value]]'];
    }
    set $getOwnPropertyDescriptor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.getprototypeof
    // 26.1.7 Reflect.getPrototypeOf ( target )
    get $getPrototypeOf() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf)['[[Value]]'];
    }
    set $getPrototypeOf(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.has
    // 26.1.8 Reflect.has ( target , propertyKey )
    get $has() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$has)['[[Value]]'];
    }
    set $has(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$has, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.isextensible
    // 26.1.9 Reflect.isExtensible ( target )
    get $isExtensible() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$isExtensible)['[[Value]]'];
    }
    set $isExtensible(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$isExtensible, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.ownkeys
    // 26.1.10 Reflect.ownKeys ( target )
    get $ownKeys() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$ownKeys)['[[Value]]'];
    }
    set $ownKeys(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$ownKeys, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.preventextensions
    // 26.1.11 Reflect.preventExtensions ( target )
    get $preventExtensions() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$preventExtensions)['[[Value]]'];
    }
    set $preventExtensions(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$preventExtensions, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.set
    // 26.1.12 Reflect.set ( target , propertyKey , V [ , receiver ] )
    get $set() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$set)['[[Value]]'];
    }
    set $set(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$set, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-reflect.setprototypeof
    // 26.1.13 Reflect.setPrototypeOf ( target , proto )
    get $setPrototypeOf() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf)['[[Value]]'];
    }
    set $setPrototypeOf(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf, value);
    }
    constructor(realm, proto) {
        super(realm, '%Reflect%', proto, 1 /* normal */, realm['[[Intrinsics]]'].empty);
    }
}
exports.$Reflect = $Reflect;
// http://www.ecma-international.org/ecma-262/#sec-reflect.apply
// 26.1.1 Reflect.apply ( target , thisArgument , argumentsList )
class $Reflect_apply extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.apply', proto);
    }
    performSteps(ctx, $thisArgument, [target, thisArgument, argumentsList], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (thisArgument === void 0) {
            thisArgument = intrinsics.undefined;
        }
        if (argumentsList === void 0) {
            argumentsList = intrinsics.undefined;
        }
        // 1. If IsCallable(target) is false, throw a TypeError exception.
        if (!target.isFunction) {
            return new error_js_1.$TypeError(realm, `Expected target to be a function, but got: ${target}`);
        }
        // 2. Let args be ? CreateListFromArrayLike(argumentsList).
        const args = operations_js_1.$CreateListFromArrayLike(ctx, argumentsList);
        if (args.isAbrupt) {
            return args;
        }
        // 3. Perform PrepareForTailCall().
        ctx.suspend();
        realm.stack.pop();
        // 4. Return ? Call(target, thisArgument, args).
        return operations_js_1.$Call(ctx, target, thisArgument, args); // TODO: is this cast safe?
    }
}
exports.$Reflect_apply = $Reflect_apply;
// http://www.ecma-international.org/ecma-262/#sec-reflect.construct
// 26.1.2 Reflect.construct ( target , argumentsList [ , newTarget ] )
class $Reflect_construct extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.construct', proto);
    }
    performSteps(ctx, $thisArgument, [target, argumentsList, newTarget], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (argumentsList === void 0) {
            argumentsList = intrinsics.undefined;
        }
        // 1. If IsConstructor(target) is false, throw a TypeError exception.
        if (!target.isFunction) {
            return new error_js_1.$TypeError(realm, `Expected target to be a constructor function, but got: ${target}`);
        }
        // 2. If newTarget is not present, set newTarget to target.
        if (newTarget === void 0) {
            newTarget = target;
        }
        // 3. Else if IsConstructor(newTarget) is false, throw a TypeError exception.
        else if (!newTarget.isFunction) {
            return new error_js_1.$TypeError(realm, `Expected newTarget to be a constructor function, but got: ${newTarget}`);
        }
        // 4. Let args be ? CreateListFromArrayLike(argumentsList).
        const args = operations_js_1.$CreateListFromArrayLike(ctx, argumentsList);
        if (args.isAbrupt) {
            return args;
        }
        // 5. Return ? Construct(target, args, newTarget).
        return operations_js_1.$Construct(ctx, target, args, newTarget);
    }
}
exports.$Reflect_construct = $Reflect_construct;
// http://www.ecma-international.org/ecma-262/#sec-reflect.defineproperty
// 26.1.3 Reflect.defineProperty ( target , propertyKey , attributes )
class $Reflect_defineProperty extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.defineProperty', proto);
    }
    performSteps(ctx, $thisArgument, [target, propertyKey, attributes], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (propertyKey === void 0) {
            propertyKey = intrinsics.undefined;
        }
        if (attributes === void 0) {
            attributes = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let key be ? ToPropertyKey(propertyKey).
        const key = propertyKey.ToPropertyKey(ctx);
        if (key.isAbrupt) {
            return key;
        }
        // 3. Let desc be ? ToPropertyDescriptor(attributes).
        const desc = operations_js_1.$ToPropertyDescriptor(ctx, attributes, key);
        if (desc.isAbrupt) {
            return desc;
        }
        // 4. Return ? target.[[DefineOwnProperty]](key, desc).
        return target['[[DefineOwnProperty]]'](ctx, key, desc);
    }
}
exports.$Reflect_defineProperty = $Reflect_defineProperty;
// http://www.ecma-international.org/ecma-262/#sec-reflect.deleteproperty
// 26.1.4 Reflect.deleteProperty ( target , propertyKey )
class $Reflect_deleteProperty extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.deleteProperty', proto);
    }
    performSteps(ctx, $thisArgument, [target, propertyKey], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (propertyKey === void 0) {
            propertyKey = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let key be ? ToPropertyKey(propertyKey).
        const key = propertyKey.ToPropertyKey(ctx);
        if (key.isAbrupt) {
            return key;
        }
        // 3. Return ? target.[[Delete]](key).
        return target['[[Delete]]'](ctx, key);
    }
}
exports.$Reflect_deleteProperty = $Reflect_deleteProperty;
// http://www.ecma-international.org/ecma-262/#sec-reflect.get
// 26.1.5 Reflect.get ( target , propertyKey [ , receiver ] )
class $Reflect_get extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.get', proto);
    }
    performSteps(ctx, $thisArgument, [target, propertyKey, receiver], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (propertyKey === void 0) {
            propertyKey = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let key be ? ToPropertyKey(propertyKey).
        const key = propertyKey.ToPropertyKey(ctx);
        if (key.isAbrupt) {
            return key;
        }
        // 3. If receiver is not present, then
        if (receiver === void 0) {
            // 3. a. Set receiver to target.
            receiver = target;
        }
        // 4. Return ? target.[[Get]](key, receiver).
        return target['[[Get]]'](ctx, key, receiver); // TODO: is this cast safe?
    }
}
exports.$Reflect_get = $Reflect_get;
// http://www.ecma-international.org/ecma-262/#sec-reflect.getownpropertydescriptor
// 26.1.6 Reflect.getOwnPropertyDescriptor ( target , propertyKey )
class $Reflect_getOwnPropertyDescriptor extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.getOwnPropertyDescriptor', proto);
    }
    performSteps(ctx, $thisArgument, [target, propertyKey], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (propertyKey === void 0) {
            propertyKey = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let key be ? ToPropertyKey(propertyKey).
        const key = propertyKey.ToPropertyKey(ctx);
        if (key.isAbrupt) {
            return key;
        }
        // 3. Let desc be ? target.[[GetOwnProperty]](key).
        const desc = target['[[GetOwnProperty]]'](ctx, key);
        if (desc.isAbrupt) {
            return desc;
        }
        // 4. Return FromPropertyDescriptor(desc).
        return operations_js_1.$FromPropertyDescriptor(ctx, desc);
    }
}
exports.$Reflect_getOwnPropertyDescriptor = $Reflect_getOwnPropertyDescriptor;
// http://www.ecma-international.org/ecma-262/#sec-reflect.getprototypeof
// 26.1.7 Reflect.getPrototypeOf ( target )
class $Reflect_getPrototypeOf extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.getPrototypeOf', proto);
    }
    performSteps(ctx, $thisArgument, [target], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Return ? target.[[GetPrototypeOf]]().
        return target['[[GetPrototypeOf]]'](ctx);
    }
}
exports.$Reflect_getPrototypeOf = $Reflect_getPrototypeOf;
// http://www.ecma-international.org/ecma-262/#sec-reflect.has
// 26.1.8 Reflect.has ( target , propertyKey )
class $Reflect_has extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.has', proto);
    }
    performSteps(ctx, $thisArgument, [target, propertyKey], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (propertyKey === void 0) {
            propertyKey = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let key be ? ToPropertyKey(propertyKey).
        const key = propertyKey.ToPropertyKey(ctx);
        if (key.isAbrupt) {
            return key;
        }
        // 3. Return ? target.[[HasProperty]](key).
        return target['[[HasProperty]]'](ctx, key);
    }
}
exports.$Reflect_has = $Reflect_has;
// http://www.ecma-international.org/ecma-262/#sec-reflect.isextensible
// 26.1.9 Reflect.isExtensible ( target )
class $Reflect_isExtensible extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.isExtensible', proto);
    }
    performSteps(ctx, $thisArgument, [target], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Return ? target.[[IsExtensible]]().
        return target['[[IsExtensible]]'](ctx);
    }
}
exports.$Reflect_isExtensible = $Reflect_isExtensible;
// http://www.ecma-international.org/ecma-262/#sec-reflect.ownkeys
// 26.1.10 Reflect.ownKeys ( target )
class $Reflect_ownKeys extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.ownKeys', proto);
    }
    performSteps(ctx, $thisArgument, [target], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let keys be ? target.[[OwnPropertyKeys]]().
        const keys = target['[[OwnPropertyKeys]]'](ctx);
        if (keys.isAbrupt) {
            return keys;
        }
        // 3. Return CreateArrayFromList(keys).
        return array_js_1.$CreateArrayFromList(ctx, keys);
    }
}
exports.$Reflect_ownKeys = $Reflect_ownKeys;
// http://www.ecma-international.org/ecma-262/#sec-reflect.preventextensions
// 26.1.11 Reflect.preventExtensions ( target )
class $Reflect_preventExtensions extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.preventExtensions', proto);
    }
    performSteps(ctx, $thisArgument, [target], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Return ? target.[[PreventExtensions]]().
        return target['[[PreventExtensions]]'](ctx);
    }
}
exports.$Reflect_preventExtensions = $Reflect_preventExtensions;
// http://www.ecma-international.org/ecma-262/#sec-reflect.set
// 26.1.12 Reflect.set ( target , propertyKey , V [ , receiver ] )
class $Reflect_set extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.set', proto);
    }
    performSteps(ctx, $thisArgument, [target, propertyKey, V, receiver], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (propertyKey === void 0) {
            propertyKey = intrinsics.undefined;
        }
        if (V === void 0) {
            V = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let key be ? ToPropertyKey(propertyKey).
        const key = propertyKey.ToPropertyKey(ctx);
        if (key.isAbrupt) {
            return key;
        }
        // 3. If receiver is not present, then
        if (receiver === void 0) {
            // 3. a. Set receiver to target.
            receiver = target;
        }
        // 4. Return ? target.[[Set]](key, V, receiver).
        return target['[[Set]]'](ctx, key, V, receiver); // TODO: is this cast safe?
    }
}
exports.$Reflect_set = $Reflect_set;
// http://www.ecma-international.org/ecma-262/#sec-reflect.setprototypeof
// 26.1.13 Reflect.setPrototypeOf ( target , proto )
class $Reflect_setPrototypeOf extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, 'Reflect.setPrototypeOf', proto);
    }
    performSteps(ctx, $thisArgument, [target, proto], $NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (target === void 0) {
            target = intrinsics.undefined;
        }
        if (proto === void 0) {
            proto = intrinsics.undefined;
        }
        // 1. If Type(target) is not Object, throw a TypeError exception.
        if (!target.isObject) {
            return new error_js_1.$TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. If Type(proto) is not Object and proto is not null, throw a TypeError exception.
        if (!proto.isObject && !proto.isNull) {
            return new error_js_1.$TypeError(realm, `Expected proto to be an object or null, but got: ${proto}`);
        }
        // 3. Return ? target.[[SetPrototypeOf]](proto).
        return target['[[SetPrototypeOf]]'](ctx, proto);
    }
}
exports.$Reflect_setPrototypeOf = $Reflect_setPrototypeOf;
//# sourceMappingURL=reflect.js.map