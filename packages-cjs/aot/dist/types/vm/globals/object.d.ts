import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $Object } from '../types/object.js';
import { $FunctionPrototype } from './function.js';
import { $List } from '../types/list.js';
export declare class $ObjectConstructor extends $BuiltinFunction<'%Object%'> {
    get $prototype(): $ObjectPrototype;
    set $prototype(value: $ObjectPrototype);
    get $assign(): $Object_assign;
    set $assign(value: $Object_assign);
    get $create(): $Object_create;
    set $create(value: $Object_create);
    get $defineProperties(): $Object_defineProperties;
    set $defineProperties(value: $Object_defineProperties);
    get $defineProperty(): $Object_defineProperty;
    set $defineProperty(value: $Object_defineProperty);
    get $entries(): $Object_entries;
    set $entries(value: $Object_entries);
    get $freeze(): $Object_freeze;
    set $freeze(value: $Object_freeze);
    get $fromEntries(): $Object_fromEntries;
    set $fromEntries(value: $Object_fromEntries);
    get $getOwnPropertyDescriptor(): $Object_getOwnPropertyDescriptor;
    set $getOwnPropertyDescriptor(value: $Object_getOwnPropertyDescriptor);
    get $getOwnPropertyDescriptors(): $Object_getOwnPropertyDescriptors;
    set $getOwnPropertyDescriptors(value: $Object_getOwnPropertyDescriptors);
    get $getOwnPropertyNames(): $Object_getOwnPropertyNames;
    set $getOwnPropertyNames(value: $Object_getOwnPropertyNames);
    get $getOwnPropertySymbols(): $Object_getOwnPropertySymbols;
    set $getOwnPropertySymbols(value: $Object_getOwnPropertySymbols);
    get $getPrototypeOf(): $Object_getPrototypeOf;
    set $getPrototypeOf(value: $Object_getPrototypeOf);
    get $is(): $Object_is;
    set $is(value: $Object_is);
    get $isExtensible(): $Object_isExtensible;
    set $isExtensible(value: $Object_isExtensible);
    get $isFrozen(): $Object_isFrozen;
    set $isFrozen(value: $Object_isFrozen);
    get $isSealed(): $Object_isSealed;
    set $isSealed(value: $Object_isSealed);
    get $keys(): $Object_keys;
    set $keys(value: $Object_keys);
    get $preventExtensions(): $Object_preventExtensions;
    set $preventExtensions(value: $Object_preventExtensions);
    get $seal(): $Object_seal;
    set $seal(value: $Object_seal);
    get $setPrototypeOf(): $Object_setPrototypeOf;
    set $setPrototypeOf(value: $Object_setPrototypeOf);
    get $values(): $Object_values;
    set $values(value: $Object_values);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_assign extends $BuiltinFunction<'Object.assign'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_create extends $BuiltinFunction<'Object.create'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_defineProperties extends $BuiltinFunction<'Object.defineProperties'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $ObjectDefineProperties(ctx: ExecutionContext, O: any, Properties: any): any;
export declare class $Object_defineProperty extends $BuiltinFunction<'Object.defineProperty'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_entries extends $BuiltinFunction<'Object.entries'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_freeze extends $BuiltinFunction<'Object.freeze'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_fromEntries extends $BuiltinFunction<'Object.fromEntries'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $CreateDataPropertyOnObject extends $BuiltinFunction<'CreateDataPropertyOnObject'> {
    constructor(realm: Realm);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_getOwnPropertyDescriptor extends $BuiltinFunction<'Object.getOwnPropertyDescriptor'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_getOwnPropertyDescriptors extends $BuiltinFunction<'Object.getOwnPropertyDescriptors'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_getOwnPropertyNames extends $BuiltinFunction<'Object.getOwnPropertyNames'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_getOwnPropertySymbols extends $BuiltinFunction<'Object.getOwnPropertySymbols'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $GetOwnPropertyKeys(ctx: ExecutionContext, O: any, type: any): any;
export declare class $Object_getPrototypeOf extends $BuiltinFunction<'Object.getPrototypeOf'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_is extends $BuiltinFunction<'Object.is'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_isExtensible extends $BuiltinFunction<'Object.isExtensible'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_isFrozen extends $BuiltinFunction<'Object.isFrozen'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_isSealed extends $BuiltinFunction<'Object.isSealed'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_keys extends $BuiltinFunction<'Object.keys'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_preventExtensions extends $BuiltinFunction<'Object.preventExtensions'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_seal extends $BuiltinFunction<'Object.seal'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_setPrototypeOf extends $BuiltinFunction<'Object.setPrototypeOf'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Object_values extends $BuiltinFunction<'Object.values'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [O]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ObjectPrototype extends $Object<'%ObjectPrototype%'> {
    get $constructor(): $ObjectConstructor;
    set $constructor(value: $ObjectConstructor);
    get $hasOwnProperty(): $ObjectPrototype_hasOwnProperty;
    set $hasOwnProperty(value: $ObjectPrototype_hasOwnProperty);
    get $isPrototypeOf(): $ObjectPrototype_isPrototypeOf;
    set $isPrototypeOf(value: $ObjectPrototype_isPrototypeOf);
    get $propertyIsEnumerable(): $ObjectPrototype_propertyIsEnumerable;
    set $propertyIsEnumerable(value: $ObjectPrototype_propertyIsEnumerable);
    get $toLocaleString(): $ObjectPrototype_toLocaleString;
    set $toLocaleString(value: $ObjectPrototype_toLocaleString);
    get $toString(): $ObjProto_toString;
    set $toString(value: $ObjProto_toString);
    get $valueOf(): $ObjProto_valueOf;
    set $valueOf(value: $ObjProto_valueOf);
    constructor(realm: Realm);
}
export declare class $ObjectPrototype_hasOwnProperty extends $BuiltinFunction<'Object.prototype.hasOwnProperty'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ObjectPrototype_isPrototypeOf extends $BuiltinFunction<'Object.prototype.isPrototypeOf'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ObjectPrototype_propertyIsEnumerable extends $BuiltinFunction<'Object.prototype.propertyIsEnumerable'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ObjectPrototype_toLocaleString extends $BuiltinFunction<'Object.prototype.toLocaleString'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ObjProto_toString extends $BuiltinFunction<'Object.prototype.toString'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ObjProto_valueOf extends $BuiltinFunction<'%ObjProto_valueOf%'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=object.d.ts.map