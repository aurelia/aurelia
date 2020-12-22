import { $Undefined } from './undefined.js';
import { $Null } from './null.js';
import { $Boolean } from './boolean.js';
import { $String } from './string.js';
import { $Symbol } from './symbol.js';
import { $Number } from './number.js';
import { $Empty } from './empty.js';
import { $Object } from './object.js';
import { $Function, $BuiltinFunction } from './function.js';
import { $BoundFunctionExoticObject } from '../exotics/bound-function.js';
import { $ArrayExoticObject } from '../exotics/array.js';
import { $ProxyExoticObject } from '../exotics/proxy.js';
import { $ImmutablePrototypeExoticObject } from '../exotics/immutable-prototype.js';
import { $NamespaceExoticObject } from '../exotics/namespace.js';
import { $StringExoticObject } from '../exotics/string.js';
import { $IntegerIndexedExoticObject } from '../exotics/integer-indexed.js';
import { $ArgumentsExoticObject } from '../exotics/arguments.js';
import { $Error } from './error.js';
export declare const enum CompletionType {
    normal = 1,
    break = 2,
    continue = 3,
    return = 4,
    throw = 5
}
export declare type AbruptCompletionType = (CompletionType.break | CompletionType.continue | CompletionType.return | CompletionType.throw);
export declare type PotentialNonEmptyCompletionType = (CompletionType.normal | CompletionType.return | CompletionType.throw);
export declare type PotentialEmptyCompletionType = (CompletionType.normal | CompletionType.break | CompletionType.continue);
export declare type CompletionTarget = $String | $Empty;
export declare const nextValueId: () => number;
export declare type $Primitive = ($Undefined | $Null | $Boolean | $String | $Symbol | $Number);
export declare type $AnyNonEmpty = ($Primitive | $AnyObject | $Error);
export declare type $AnyNonEmptyNonError = ($Primitive | $AnyObject);
export declare type $AnyObject = ($ArgumentsExoticObject | $ArrayExoticObject | $BoundFunctionExoticObject | $BuiltinFunction | $Function | $ImmutablePrototypeExoticObject | $IntegerIndexedExoticObject | $NamespaceExoticObject | $Object | $ProxyExoticObject | $StringExoticObject);
export declare type $AnyNonError = ($Empty | $AnyNonEmpty);
export declare type $Any = ($AnyNonError | $Error);
export declare type $PropertyKey = ($String | $Symbol);
export declare type ESType = 'Undefined' | 'Null' | 'Boolean' | 'String' | 'Symbol' | 'Number' | 'Object';
export declare type $NonNumberPrimitive = Exclude<$Primitive, $Number>;
export declare type $NonNilPrimitive = Exclude<$Primitive, $Undefined | $Null>;
export declare type $NonNil = Exclude<$AnyNonError, $Undefined | $Null>;
export declare function getPath(obj: {
    path: string;
}): string;
export declare const Int32: (value: unknown) => number;
export declare const Uint32: (value: unknown) => number;
export declare const Int16: (value: unknown) => number;
export declare const Uint16: (value: unknown) => number;
export declare const Int8: (value: unknown) => number;
export declare const Uint8: (value: unknown) => number;
export declare const Uint8Clamp: (value: unknown) => number;
export declare function compareIndices(a: $String, b: $String): number;
//# sourceMappingURL=_shared.d.ts.map