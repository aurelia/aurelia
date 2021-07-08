import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $FunctionPrototype } from './function.js';
import { $Object } from '../types/object.js';
import { $List } from '../types/list.js';
import { $ObjectPrototype } from './object.js';
export declare class $Reflect extends $Object<'%Reflect%'> {
    get $apply(): $Reflect_apply;
    set $apply(value: $Reflect_apply);
    get $construct(): $Reflect_construct;
    set $construct(value: $Reflect_construct);
    get $defineProperty(): $Reflect_defineProperty;
    set $defineProperty(value: $Reflect_defineProperty);
    get $deleteProperty(): $Reflect_deleteProperty;
    set $deleteProperty(value: $Reflect_deleteProperty);
    get $get(): $Reflect_get;
    set $get(value: $Reflect_get);
    get $getOwnPropertyDescriptor(): $Reflect_getOwnPropertyDescriptor;
    set $getOwnPropertyDescriptor(value: $Reflect_getOwnPropertyDescriptor);
    get $getPrototypeOf(): $Reflect_getPrototypeOf;
    set $getPrototypeOf(value: $Reflect_getPrototypeOf);
    get $has(): $Reflect_has;
    set $has(value: $Reflect_has);
    get $isExtensible(): $Reflect_isExtensible;
    set $isExtensible(value: $Reflect_isExtensible);
    get $ownKeys(): $Reflect_ownKeys;
    set $ownKeys(value: $Reflect_ownKeys);
    get $preventExtensions(): $Reflect_preventExtensions;
    set $preventExtensions(value: $Reflect_preventExtensions);
    get $set(): $Reflect_set;
    set $set(value: $Reflect_set);
    get $setPrototypeOf(): $Reflect_setPrototypeOf;
    set $setPrototypeOf(value: $Reflect_setPrototypeOf);
    constructor(realm: Realm, proto: $ObjectPrototype);
}
export declare class $Reflect_apply extends $BuiltinFunction<'Reflect.apply'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, thisArgument, argumentsList]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_construct extends $BuiltinFunction<'Reflect.construct'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, argumentsList, newTarget]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_defineProperty extends $BuiltinFunction<'Reflect.defineProperty'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, propertyKey, attributes]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_deleteProperty extends $BuiltinFunction<'Reflect.deleteProperty'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, propertyKey]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_get extends $BuiltinFunction<'Reflect.get'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, propertyKey, receiver]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_getOwnPropertyDescriptor extends $BuiltinFunction<'Reflect.getOwnPropertyDescriptor'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, propertyKey]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_getPrototypeOf extends $BuiltinFunction<'Reflect.getPrototypeOf'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_has extends $BuiltinFunction<'Reflect.has'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, propertyKey]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_isExtensible extends $BuiltinFunction<'Reflect.isExtensible'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_ownKeys extends $BuiltinFunction<'Reflect.ownKeys'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_preventExtensions extends $BuiltinFunction<'Reflect.preventExtensions'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_set extends $BuiltinFunction<'Reflect.set'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, propertyKey, V, receiver]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Reflect_setPrototypeOf extends $BuiltinFunction<'Reflect.setPrototypeOf'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, $thisArgument: $AnyNonEmptyNonError, [target, proto]: $List<$AnyNonEmpty>, $NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=reflect.d.ts.map