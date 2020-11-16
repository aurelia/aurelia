import { $BuiltinFunction, } from '../types/function.js';
import { $TypeError, } from '../types/error.js';
import { $Object, } from '../types/object.js';
import { $ToPropertyDescriptor, $CreateListFromArrayLike, $Call, $Construct, $FromPropertyDescriptor, } from '../operations.js';
import { $CreateArrayFromList, } from '../exotics/array.js';
// http://www.ecma-international.org/ecma-262/#sec-reflection
// 26 Reflection
// http://www.ecma-international.org/ecma-262/#sec-reflect-object
// 26.1 The Reflect Object
export class $Reflect extends $Object {
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
// http://www.ecma-international.org/ecma-262/#sec-reflect.apply
// 26.1.1 Reflect.apply ( target , thisArgument , argumentsList )
export class $Reflect_apply extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be a function, but got: ${target}`);
        }
        // 2. Let args be ? CreateListFromArrayLike(argumentsList).
        const args = $CreateListFromArrayLike(ctx, argumentsList);
        if (args.isAbrupt) {
            return args;
        }
        // 3. Perform PrepareForTailCall().
        ctx.suspend();
        realm.stack.pop();
        // 4. Return ? Call(target, thisArgument, args).
        return $Call(ctx, target, thisArgument, args); // TODO: is this cast safe?
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.construct
// 26.1.2 Reflect.construct ( target , argumentsList [ , newTarget ] )
export class $Reflect_construct extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be a constructor function, but got: ${target}`);
        }
        // 2. If newTarget is not present, set newTarget to target.
        if (newTarget === void 0) {
            newTarget = target;
        }
        // 3. Else if IsConstructor(newTarget) is false, throw a TypeError exception.
        else if (!newTarget.isFunction) {
            return new $TypeError(realm, `Expected newTarget to be a constructor function, but got: ${newTarget}`);
        }
        // 4. Let args be ? CreateListFromArrayLike(argumentsList).
        const args = $CreateListFromArrayLike(ctx, argumentsList);
        if (args.isAbrupt) {
            return args;
        }
        // 5. Return ? Construct(target, args, newTarget).
        return $Construct(ctx, target, args, newTarget);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.defineproperty
// 26.1.3 Reflect.defineProperty ( target , propertyKey , attributes )
export class $Reflect_defineProperty extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let key be ? ToPropertyKey(propertyKey).
        const key = propertyKey.ToPropertyKey(ctx);
        if (key.isAbrupt) {
            return key;
        }
        // 3. Let desc be ? ToPropertyDescriptor(attributes).
        const desc = $ToPropertyDescriptor(ctx, attributes, key);
        if (desc.isAbrupt) {
            return desc;
        }
        // 4. Return ? target.[[DefineOwnProperty]](key, desc).
        return target['[[DefineOwnProperty]]'](ctx, key, desc);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.deleteproperty
// 26.1.4 Reflect.deleteProperty ( target , propertyKey )
export class $Reflect_deleteProperty extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
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
// http://www.ecma-international.org/ecma-262/#sec-reflect.get
// 26.1.5 Reflect.get ( target , propertyKey [ , receiver ] )
export class $Reflect_get extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
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
// http://www.ecma-international.org/ecma-262/#sec-reflect.getownpropertydescriptor
// 26.1.6 Reflect.getOwnPropertyDescriptor ( target , propertyKey )
export class $Reflect_getOwnPropertyDescriptor extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
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
        return $FromPropertyDescriptor(ctx, desc);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.getprototypeof
// 26.1.7 Reflect.getPrototypeOf ( target )
export class $Reflect_getPrototypeOf extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Return ? target.[[GetPrototypeOf]]().
        return target['[[GetPrototypeOf]]'](ctx);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.has
// 26.1.8 Reflect.has ( target , propertyKey )
export class $Reflect_has extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
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
// http://www.ecma-international.org/ecma-262/#sec-reflect.isextensible
// 26.1.9 Reflect.isExtensible ( target )
export class $Reflect_isExtensible extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Return ? target.[[IsExtensible]]().
        return target['[[IsExtensible]]'](ctx);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.ownkeys
// 26.1.10 Reflect.ownKeys ( target )
export class $Reflect_ownKeys extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Let keys be ? target.[[OwnPropertyKeys]]().
        const keys = target['[[OwnPropertyKeys]]'](ctx);
        if (keys.isAbrupt) {
            return keys;
        }
        // 3. Return CreateArrayFromList(keys).
        return $CreateArrayFromList(ctx, keys);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.preventextensions
// 26.1.11 Reflect.preventExtensions ( target )
export class $Reflect_preventExtensions extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. Return ? target.[[PreventExtensions]]().
        return target['[[PreventExtensions]]'](ctx);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.set
// 26.1.12 Reflect.set ( target , propertyKey , V [ , receiver ] )
export class $Reflect_set extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
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
// http://www.ecma-international.org/ecma-262/#sec-reflect.setprototypeof
// 26.1.13 Reflect.setPrototypeOf ( target , proto )
export class $Reflect_setPrototypeOf extends $BuiltinFunction {
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
            return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
        }
        // 2. If Type(proto) is not Object and proto is not null, throw a TypeError exception.
        if (!proto.isObject && !proto.isNull) {
            return new $TypeError(realm, `Expected proto to be an object or null, but got: ${proto}`);
        }
        // 3. Return ? target.[[SetPrototypeOf]](proto).
        return target['[[SetPrototypeOf]]'](ctx, proto);
    }
}
//# sourceMappingURL=reflect.js.map