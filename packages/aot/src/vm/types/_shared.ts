import {
  $Undefined,
} from './undefined';
import {
  $Null,
} from './null';
import {
  $Boolean,
} from './boolean';
import {
  $String,
} from './string';
import {
  $Symbol,
} from './symbol';
import {
  $Number,
} from './number';
import {
  $Empty,
} from './empty';
import {
  $Object,
} from './object';
import {
  $Function,
  $BuiltinFunction,
} from './function';
import {
  $BoundFunctionExoticObject,
} from '../exotics/bound-function';
import {
  $ArrayExoticObject,
} from '../exotics/array';
import {
  $ProxyExoticObject,
} from '../exotics/proxy';
import {
  $ImmutablePrototypeExoticObject,
} from '../exotics/immutable-prototype';
import {
  $NamespaceExoticObject,
} from '../exotics/namespace';
import {
  $StringExoticObject,
} from '../exotics/string';
import {
  $IntegerIndexedExoticObject,
} from '../exotics/integer-indexed';
import {
  $ArgumentsExoticObject,
} from '../exotics/arguments';
import {
  $Error,
} from './error';

export const enum CompletionType {
  normal   = 1,
  break    = 2,
  continue = 3,
  return   = 4,
  throw    = 5,
}

export type AbruptCompletionType = (
  CompletionType.break |
  CompletionType.continue |
  CompletionType.return |
  CompletionType.throw
);

// CompletionType.break and CompletionType.continue *always* have the value empty.
// The other 3 (listed below) are the only possible types for values that are not empty.
export type PotentialNonEmptyCompletionType = (
  CompletionType.normal |
  CompletionType.return |
  CompletionType.throw
);

// CompletionType.return and CompletionType.throw *never* have the value empty.
// The other 3 (listed below) are the only possible types for the value empty.
export type PotentialEmptyCompletionType = (
  CompletionType.normal |
  CompletionType.break |
  CompletionType.continue
);

export type CompletionTarget = $String | $Empty;

export const nextValueId = (function () {
  let id = 0;

  return function () {
    return ++id;
  };
})();

export type $Primitive = (
  $Undefined |
  $Null |
  $Boolean |
  $String |
  $Symbol |
  $Number
);

export type $AnyNonEmpty = (
  $Primitive |
  $AnyObject |
  $Error
);

export type $AnyNonEmptyNonError = (
  $Primitive |
  $AnyObject
);

export type $AnyObject = (
  $ArgumentsExoticObject |
  $ArrayExoticObject |
  $BoundFunctionExoticObject |
  $BuiltinFunction |
  $Function |
  $ImmutablePrototypeExoticObject |
  $IntegerIndexedExoticObject |
  $NamespaceExoticObject |
  $Object |
  $ProxyExoticObject |
  $StringExoticObject
);

export type $AnyNonError = (
  $Empty |
  $AnyNonEmpty
);

export type $Any = (
  $AnyNonError |
  $Error
);

export type $PropertyKey = (
  $String |
  $Symbol
);

export type ESType = 'Undefined' | 'Null' | 'Boolean' | 'String' | 'Symbol' | 'Number' | 'Object';

export type $NonNumberPrimitive = Exclude<$Primitive, $Number>;
export type $NonNilPrimitive = Exclude<$Primitive, $Undefined | $Null>;
export type $NonNil = Exclude<$AnyNonError, $Undefined | $Null>;

export function getPath(obj: { path: string }): string {
  return obj.path;
}

export const Int32 = (function () {
  const $ = new Int32Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
export const Uint32 = (function () {
  const $ = new Uint32Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
export const Int16 = (function () {
  const $ = new Int16Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
export const Uint16 = (function () {
  const $ = new Uint16Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
export const Int8 = (function () {
  const $ = new Int8Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
export const Uint8 = (function () {
  const $ = new Uint8Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
export const Uint8Clamp = (function () {
  const $ = new Uint8ClampedArray(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();

// Sort two strings numerically instead of alphabetically
export function compareIndices(a: $String, b: $String): number {
  // Rely on coercion as natively subtracting strings has some shortcuts (for better perf) compared to explicitly converting to number first
  return (a['[[Value]]'] as unknown as number) - (b['[[Value]]'] as unknown as number);
}
