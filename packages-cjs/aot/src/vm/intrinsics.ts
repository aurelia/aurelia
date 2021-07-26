import {
  $AsyncFromSyncIteratorPrototype,
  $AsyncFromSyncIteratorPrototype_next,
  $AsyncFromSyncIteratorPrototype_return,
  $AsyncFromSyncIteratorPrototype_throw,
  $AsyncIteratorPrototype,
  $IteratorPrototype,
} from './globals/iteration.js';
import {
  $AsyncFunctionConstructor,
  $AsyncFunctionPrototype,
} from './globals/async-function.js';
import {
  $AsyncGeneratorFunctionConstructor,
  $AsyncGeneratorFunctionPrototype,
  $AsyncGeneratorPrototype,
  $AsyncGeneratorPrototype_next,
  $AsyncGeneratorPrototype_return,
  $AsyncGeneratorPrototype_throw,
} from './globals/async-generator-function.js';
import {
  $BooleanConstructor,
  $BooleanPrototype,
} from './globals/boolean.js';
import {
  $DecodeURI,
  $DecodeURIComponent,
  $EncodeURI,
  $EncodeURIComponent,
} from './globals/uri-handling.js';
import {
  $ErrorConstructor,
  $ErrorPrototype,
  $ErrorPrototype_toString,
  $EvalErrorConstructor,
  $EvalErrorPrototype,
  $RangeErrorConstructor,
  $RangeErrorPrototype,
  $ReferenceErrorConstructor,
  $ReferenceErrorPrototype,
  $SyntaxErrorConstructor,
  $SyntaxErrorPrototype,
  $TypeErrorConstructor,
  $TypeErrorPrototype,
  $URIErrorConstructor,
  $URIErrorPrototype,
} from './globals/error.js';
import {
  $FunctionConstructor,
  $FunctionPrototype,
  $FunctionPrototype_apply,
  $FunctionPrototype_bind,
  $FunctionPrototype_call,
  $FunctionPrototype_hasInstance,
  $FunctionPrototype_toString,
} from './globals/function.js';
import {
  $GeneratorFunctionConstructor,
  $GeneratorFunctionPrototype,
  $GeneratorPrototype,
  $GeneratorPrototype_next,
  $GeneratorPrototype_return,
  $GeneratorPrototype_throw,
} from './globals/generator-function.js';
import {
  $NumberConstructor,
  $NumberPrototype,
} from './globals/number.js';
import {
  $ObjProto_toString,
  $ObjProto_valueOf,
  $ObjectConstructor,
  $ObjectPrototype,
  $ObjectPrototype_hasOwnProperty,
  $ObjectPrototype_isPrototypeOf,
  $ObjectPrototype_propertyIsEnumerable,
  $ObjectPrototype_toLocaleString,
  $Object_assign,
  $Object_create,
  $Object_defineProperties,
  $Object_defineProperty,
  $Object_entries,
  $Object_freeze,
  $Object_fromEntries,
  $Object_getOwnPropertyDescriptor,
  $Object_getOwnPropertyDescriptors,
  $Object_getOwnPropertyNames,
  $Object_getOwnPropertySymbols,
  $Object_getPrototypeOf,
  $Object_is,
  $Object_isExtensible,
  $Object_isFrozen,
  $Object_isSealed,
  $Object_keys,
  $Object_preventExtensions,
  $Object_seal,
  $Object_setPrototypeOf,
  $Object_values,
} from './globals/object.js';
import {
  $PromiseConstructor,
  $PromiseProto_catch,
  $PromiseProto_finally,
  $PromiseProto_then,
  $PromisePrototype,
  $Promise_all,
  $Promise_race,
  $Promise_reject,
  $Promise_resolve,
} from './globals/promise.js';
import {
  $ProxyConstructor,
  $Proxy_revocable,
} from './globals/proxy.js';
import {
  $Reflect,
  $Reflect_apply,
  $Reflect_construct,
  $Reflect_defineProperty,
  $Reflect_deleteProperty,
  $Reflect_get,
  $Reflect_getOwnPropertyDescriptor,
  $Reflect_getPrototypeOf,
  $Reflect_has,
  $Reflect_isExtensible,
  $Reflect_ownKeys,
  $Reflect_preventExtensions,
  $Reflect_set,
  $Reflect_setPrototypeOf,
} from './globals/reflect.js';
import {
  $StringConstructor,
  $StringPrototype,
} from './globals/string.js';
import {
  $SymbolConstructor,
  $SymbolPrototype,
} from './globals/symbol.js';
import {
  ExecutionContext,
  Realm,
} from './realm.js';
import {
  IDisposable,
  Writable,
} from '@aurelia/kernel';

import {
  $Boolean,
} from './types/boolean.js';
import {
  $Empty,
} from './types/empty.js';
import {
  $Eval,
} from './globals/eval.js';
import {
  $GetSpecies,
} from './globals/_shared.js';
import {
  $IsFinite,
} from './globals/is-finite.js';
import {
  $IsNaN,
} from './globals/is-nan.js';
import {
  $Null,
} from './types/null.js';
import {
  $Number,
} from './types/number.js';
import {
  $Object,
} from './types/object.js';
import {
  $ParseFloat,
} from './globals/parse-float.js';
import {
  $ParseInt,
} from './globals/parse-int.js';
import {
  $String,
} from './types/string.js';
import {
  $Symbol,
} from './types/symbol.js';
import {
  $ThrowTypeError,
} from './globals/throw-type-error.js';
import {
  $Undefined,
} from './types/undefined.js';
import {
  CompletionType,
} from './types/_shared.js';

export type $True = $Boolean<true>;
export type $False = $Boolean<false>;

/**
 * http://www.ecma-international.org/ecma-262/#table-7
 *
 * Intrinsic Name                    Global Name                  ECMAScript Language Association
 * ----------                        ----------                   ----------
 * %Array%                           Array                        The Array constructor (22.1.1)
 * %ArrayBuffer%                     ArrayBuffer                  The ArrayBuffer constructor (24.1.2)
 * %ArrayBufferPrototype%            ArrayBuffer.prototype        The initial value of the prototype data property of %ArrayBuffer%.
 * %ArrayIteratorPrototype%                                       The prototype of Array iterator objects (22.1.5)
 * %ArrayPrototype%                  Array.prototype              The initial value of the prototype data property of %Array% (22.1.3)
 * %ArrayProto_entries%              Array.prototype.entries      The initial value of the entries data property of %ArrayPrototype% (22.1.3.4)
 * %ArrayProto_forEach%              Array.prototype.forEach      The initial value of the forEach data property of %ArrayPrototype% (22.1.3.12)
 * %ArrayProto_keys%                 Array.prototype.keys         The initial value of the keys data property of %ArrayPrototype% (22.1.3.16)
 * %ArrayProto_values%               Array.prototype.values       The initial value of the values data property of %ArrayPrototype% (22.1.3.32)
 * %AsyncFromSyncIteratorPrototype%                               The prototype of async-from-sync iterator objects (25.1.4)
 * %AsyncFunction%                                                The constructor of async function objects (25.7.1)
 * %AsyncFunctionPrototype%                                       The initial value of the prototype data property of %AsyncFunction%
 * %AsyncGenerator%                                               The initial value of the prototype property of %AsyncGeneratorFunction%
 * %AsyncGeneratorFunction%                                       The constructor of async iterator objects (25.3.1)
 * %AsyncGeneratorPrototype%                                      The initial value of the prototype property of %AsyncGenerator%
 * %AsyncIteratorPrototype%                                       An object that all standard built-in async iterator objects indirectly inherit from
 * %Atomics%                         Atomics                      The Atomics object (24.4)
 * %Boolean%                         Boolean                      The Boolean constructor (19.3.1)
 * %BooleanPrototype%                Boolean.prototype            The initial value of the prototype data property of %Boolean% (19.3.3)
 * %DataView%                        DataView                     The DataView constructor (24.3.2)
 * %DataViewPrototype%               DataView.prototype           The initial value of the prototype data property of %DataView%
 * %Date%                            Date                         The Date constructor (20.3.2)
 * %DatePrototype%                   Date.prototype               The initial value of the prototype data property of %Date%.
 * %decodeURI%                       decodeURI                    The decodeURI function (18.2.6.2)
 * %decodeURIComponent%              decodeURIComponent           The decodeURIComponent function (18.2.6.3)
 * %encodeURI%                       encodeURI                    The encodeURI function (18.2.6.4)
 * %encodeURIComponent%              encodeURIComponent           The encodeURIComponent function (18.2.6.5)
 * %Error%                           Error                        The Error constructor (19.5.1)
 * %ErrorPrototype%                  Error.prototype              The initial value of the prototype data property of %Error%
 * %eval%                            eval                         The eval function (18.2.1)
 * %EvalError%                       EvalError                    The EvalError constructor (19.5.5.1)
 * %EvalErrorPrototype%              EvalError.prototype          The initial value of the prototype data property of %EvalError%
 * %Float32Array%                    Float32Array                 The Float32Array constructor (22.2)
 * %Float32ArrayPrototype%           Float32Array.prototype       The initial value of the prototype data property of %Float32Array%
 * %Float64Array%                    Float64Array                 The Float64Array constructor (22.2)
 * %Float64ArrayPrototype%           Float64Array.prototype       The initial value of the prototype data property of %Float64Array%
 * %Function%                        Function                     The Function constructor (19.2.1)
 * %FunctionPrototype%               Function.prototype           The initial value of the prototype data property of %Function%
 * %Generator%                                                    The initial value of the prototype data property of %GeneratorFunction%
 * %GeneratorFunction%                                            The constructor of generator objects (25.2.1)
 * %GeneratorPrototype%                                           The initial value of the prototype data property of %Generator%
 * %Int8Array%                       Int8Array                    The Int8Array constructor (22.2)
 * %Int8ArrayPrototype%              Int8Array.prototype          The initial value of the prototype data property of %Int8Array%
 * %Int16Array%                      Int16Array                   The Int16Array constructor (22.2)
 * %Int16ArrayPrototype%             Int16Array.prototype         The initial value of the prototype data property of %Int16Array%
 * %Int32Array%                      Int32Array                   The Int32Array constructor (22.2)
 * %Int32ArrayPrototype%             Int32Array.prototype         The initial value of the prototype data property of %Int32Array%
 * %isFinite%                        isFinite                     The isFinite function (18.2.2)
 * %isNaN%                           isNaN                        The isNaN function (18.2.3)
 * %IteratorPrototype%                                            An object that all standard built-in iterator objects indirectly inherit from
 * %JSON%                            JSON                         The JSON object (24.5)
 * %JSONParse%                       JSON.parse                   The initial value of the parse data property of %JSON%
 * %JSONStringify%                   JSON.stringify               The initial value of the stringify data property of %JSON%
 * %Map%                             Map                          The Map constructor (23.1.1)
 * %MapIteratorPrototype%                                         The prototype of Map iterator objects (23.1.5)
 * %MapPrototype%                    Map.prototype                The initial value of the prototype data property of %Map%
 * %Math%                            Math                         The Math object (20.2)
 * %Number%                          Number                       The Number constructor (20.1.1)
 * %NumberPrototype%                 Number.prototype             The initial value of the prototype data property of %Number%
 * %Object%                          Object                       The Object constructor (19.1.1)
 * %ObjectPrototype%                 Object.prototype             The initial value of the prototype data property of %Object% (19.1.3)
 * %ObjProto_toString%               Object.prototype.toString    The initial value of the toString data property of %ObjectPrototype% (19.1.3.6)
 * %ObjProto_valueOf%                Object.prototype.valueOf     The initial value of the valueOf data property of %ObjectPrototype% (19.1.3.7)
 * %parseFloat%                      parseFloat                   The parseFloat function (18.2.4)
 * %parseInt%                        parseInt                     The parseInt function (18.2.5)
 * %Promise%                         Promise                      The Promise constructor (25.6.3)
 * %PromisePrototype%                Promise.prototype            The initial value of the prototype data property of %Promise%
 * %PromiseProto_then%               Promise.prototype.then       The initial value of the then data property of %PromisePrototype% (25.6.5.4)
 * %Promise_all%                     Promise.all                  The initial value of the all data property of %Promise% (25.6.4.1)
 * %Promise_reject%                  Promise.reject               The initial value of the reject data property of %Promise% (25.6.4.4)
 * %Promise_resolve%                 Promise.resolve              The initial value of the resolve data property of %Promise% (25.6.4.5)
 * %Proxy%                           Proxy                        The Proxy constructor (26.2.1)
 * %RangeError%                      RangeError                   The RangeError constructor (19.5.5.2)
 * %RangeErrorPrototype%             RangeError.prototype         The initial value of the prototype data property of %RangeError%
 * %ReferenceError%                  ReferenceError               The ReferenceError constructor (19.5.5.3)
 * %ReferenceErrorPrototype%         ReferenceError.prototype     The initial value of the prototype data property of %ReferenceError%
 * %Reflect%                         Reflect                      The Reflect object (26.1)
 * %RegExp%                          RegExp                       The RegExp constructor (21.2.3)
 * %RegExpPrototype%                 RegExp.prototype             The initial value of the prototype data property of %RegExp%
 * %Set%                             Set                          The Set constructor (23.2.1)
 * %SetIteratorPrototype%                                         The prototype of Set iterator objects (23.2.5)
 * %SetPrototype%                    Set.prototype                The initial value of the prototype data property of %Set%
 * %SharedArrayBuffer%               SharedArrayBuffer            The SharedArrayBuffer constructor (24.2.2)
 * %SharedArrayBufferPrototype%      SharedArrayBuffer.prototype  The initial value of the prototype data property of %SharedArrayBuffer%
 * %String%                          String                       The String constructor (21.1.1)
 * %StringIteratorPrototype%                                      The prototype of String iterator objects (21.1.5)
 * %StringPrototype%                 String.prototype             The initial value of the prototype data property of %String%
 * %Symbol%                          Symbol                       The Symbol constructor (19.4.1)
 * %SymbolPrototype%                 Symbol.prototype             The initial value of the prototype data property of %Symbol% (19.4.3)
 * %SyntaxError%                     SyntaxError                  The SyntaxError constructor (19.5.5.4)
 * %SyntaxErrorPrototype%            SyntaxError.prototype        The initial value of the prototype data property of %SyntaxError%
 * %ThrowTypeError%                                               A function object that unconditionally throws a new instance of %TypeError%
 * %TypedArray%                                                   The super class of all typed Array constructors (22.2.1)
 * %TypedArrayPrototype%                                          The initial value of the prototype data property of %TypedArray%
 * %TypeError%                       TypeError                    The TypeError constructor (19.5.5.5)
 * %TypeErrorPrototype%              TypeError.prototype          The initial value of the prototype data property of %TypeError%
 * %Uint8Array%                      Uint8Array                   The Uint8Array constructor (22.2)
 * %Uint8ArrayPrototype%             Uint8Array.prototype         The initial value of the prototype data property of %Uint8Array%
 * %Uint8ClampedArray%               Uint8ClampedArray            The Uint8ClampedArray constructor (22.2)
 * %Uint8ClampedArrayPrototype%      Uint8ClampedArray.prototype  The initial value of the prototype data property of %Uint8ClampedArray%
 * %Uint16Array%                     Uint16Array                  The Uint16Array constructor (22.2)
 * %Uint16ArrayPrototype%            Uint16Array.prototype        The initial value of the prototype data property of %Uint16Array%
 * %Uint32Array%                     Uint32Array                  The Uint32Array constructor (22.2)
 * %Uint32ArrayPrototype%            Uint32Array.prototype        The initial value of the prototype data property of %Uint32Array%
 * %URIError%                        URIError                     The URIError constructor (19.5.5.6)
 * %URIErrorPrototype%               URIError.prototype           The initial value of the prototype data property of %URIError%
 * %WeakMap%                         WeakMap                      The WeakMap constructor (23.3.1)
 * %WeakMapPrototype%                WeakMap.prototype            The initial value of the prototype data property of %WeakMap%
 * %WeakSet%                         WeakSet                      The WeakSet constructor (23.4.1)
 * %WeakSetPrototype%                WeakSet.prototype            The initial value of the prototype data property of %WeakSet%
 */
export class Intrinsics implements IDisposable {
  public readonly 'empty': $Empty;
  public readonly 'undefined': $Undefined;
  public readonly 'null': $Null;
  public readonly 'true': $True;
  public readonly 'false': $False;
  public readonly 'NaN': $Number;
  public readonly 'Infinity': $Number;
  public readonly '-Infinity': $Number;
  public readonly '0': $Number<0>;
  public readonly '-0': $Number<-0>;
  public readonly '': $String<''>;
  public readonly '*': $String<'*'>;
  public readonly '*default*': $String<'*default*'>;
  public readonly 'default': $String<'default'>;
  public readonly 'string': $String<'string'>;
  public readonly 'number': $String<'number'>;
  public readonly 'length': $String<'length'>;
  public readonly 'next': $String<'next'>;
  public readonly 'return': $String<'return'>;
  public readonly 'throw': $String<'throw'>;
  public readonly 'call': $String<'call'>;
  public readonly 'all': $String<'all'>;
  public readonly 'race': $String<'race'>;
  public readonly 'reject': $String<'reject'>;
  public readonly 'resolve': $String<'resolve'>;
  public readonly 'finally': $String<'finally'>;
  public readonly 'then': $String<'then'>;
  public readonly 'catch': $String<'catch'>;
  public readonly 'message': $String<'message'>;
  public readonly 'proxy': $String<'proxy'>;
  public readonly 'revoke': $String<'revoke'>;
  public readonly 'revocable': $String<'revocable'>;
  public readonly '$arguments': $String<'arguments'>;
  public readonly '$callee': $String<'callee'>;
  public readonly '$constructor': $String<'constructor'>;
  public readonly '$hasOwnProperty': $String<'hasOwnProperty'>;
  public readonly '$isPrototypeOf': $String<'isPrototypeOf'>;
  public readonly '$propertyIsEnumerable': $String<'propertyIsEnumerable'>;
  public readonly '$toLocaleString': $String<'toLocaleString'>;
  public readonly '$prototype': $String<'prototype'>;
  public readonly '$name': $String<'name'>;
  public readonly '$toString': $String<'toString'>;
  public readonly '$valueOf': $String<'valueOf'>;

  public readonly '$enumerable': $String<'enumerable'>;
  public readonly '$configurable': $String<'configurable'>;
  public readonly '$writable': $String<'writable'>;
  public readonly '$value': $String<'value'>;
  public readonly '$return': $String<'return'>;
  public readonly '$done': $String<'done'>;

  // Reflect
  public readonly '$getPrototypeOf': $String<'getPrototypeOf'>;
  public readonly '$setPrototypeOf': $String<'setPrototypeOf'>;
  public readonly '$isExtensible': $String<'isExtensible'>;
  public readonly '$preventExtensions': $String<'preventExtensions'>;
  public readonly '$getOwnPropertyDescriptor': $String<'getOwnPropertyDescriptor'>;
  public readonly '$defineProperty': $String<'defineProperty'>;
  public readonly '$has': $String<'has'>;
  public readonly '$get': $String<'get'>;
  public readonly '$set': $String<'set'>;
  public readonly '$deleteProperty': $String<'deleteProperty'>;
  public readonly '$ownKeys': $String<'ownKeys'>;
  public readonly '$apply': $String<'apply'>;
  public readonly '$construct': $String<'construct'>;

  // Function.prototype
  public readonly '$bind': $String<'bind'>;
  public readonly '$call': $String<'call'>;

  // Object
  public readonly '$assign': $String<'assign'>;
  public readonly '$create': $String<'create'>;
  public readonly '$defineProperties': $String<'defineProperties'>;
  // public readonly '$defineProperty': $String<'defineProperty'>;
  public readonly '$entries': $String<'entries'>;
  public readonly '$freeze': $String<'freeze'>;
  public readonly '$fromEntries': $String<'fromEntries'>;
  // public readonly '$getOwnPropertyDescriptor': $String<'getOwnPropertyDescriptor'>;
  public readonly '$getOwnPropertyDescriptors': $String<'getOwnPropertyDescriptors'>;
  public readonly '$getOwnPropertyNames': $String<'getOwnPropertyNames'>;
  public readonly '$getOwnPropertySymbols': $String<'getOwnPropertySymbols'>;
  // public readonly '$getPrototypeOf': $String<'getPrototypeOf'>;
  public readonly '$is': $String<'is'>;
  // public readonly '$isExtensible': $String<'isExtensible'>;
  public readonly '$isFrozen': $String<'isFrozen'>;
  public readonly '$isSealed': $String<'isSealed'>;
  public readonly '$keys': $String<'keys'>;
  // public readonly '$preventExtensions': $String<'preventExtensions'>;
  public readonly '$seal': $String<'seal'>;
  // public readonly '$setPrototypeOf': $String<'setPrototypeOf'>;
  public readonly '$values': $String<'values'>;

  public readonly '@@asyncIterator': $Symbol<$String<'Symbol.asyncIterator'>>;
  public readonly '@@hasInstance': $Symbol<$String<'Symbol.hasInstance'>>;
  public readonly '@@isConcatSpreadable': $Symbol<$String<'Symbol.isConcatSpreadable'>>;
  public readonly '@@iterator': $Symbol<$String<'Symbol.iterator'>>;
  public readonly '@@match': $Symbol<$String<'Symbol.match'>>;
  public readonly '@@replace': $Symbol<$String<'Symbol.replace'>>;
  public readonly '@@search': $Symbol<$String<'Symbol.search'>>;
  public readonly '@@species': $Symbol<$String<'Symbol.species'>>;
  public readonly '@@split': $Symbol<$String<'Symbol.split'>>;
  public readonly '@@toPrimitive': $Symbol<$String<'Symbol.toPrimitive'>>;
  public readonly '@@toStringTag': $Symbol<$String<'Symbol.toStringTag'>>;
  public readonly '@@unscopables': $Symbol<$String<'Symbol.unscopables'>>;

  public readonly '%ObjectPrototype%': $ObjectPrototype;
  public readonly '%FunctionPrototype%': $FunctionPrototype;

  public readonly '%Object%': $ObjectConstructor;
  public readonly '%Function%': $FunctionConstructor;

  public readonly '%ThrowTypeError%': $ThrowTypeError;

  public readonly '%ObjProto_toString%': $ObjProto_toString;

  public readonly '%String%': $StringConstructor;
  public readonly '%StringPrototype%': $StringPrototype;

  public readonly '%Number%': $NumberConstructor;
  public readonly '%NumberPrototype%': $NumberPrototype;

  public readonly '%Boolean%': $BooleanConstructor;
  public readonly '%BooleanPrototype%': $BooleanPrototype;

  public readonly '%Symbol%': $SymbolConstructor;
  public readonly '%SymbolPrototype%': $SymbolPrototype;

  public readonly '%Error%': $ErrorConstructor;
  public readonly '%ErrorPrototype%': $ErrorPrototype;

  public readonly '%EvalError%': $EvalErrorConstructor;
  public readonly '%EvalErrorPrototype%': $EvalErrorPrototype;

  public readonly '%RangeError%': $RangeErrorConstructor;
  public readonly '%RangeErrorPrototype%': $RangeErrorPrototype;

  public readonly '%ReferenceError%': $ReferenceErrorConstructor;
  public readonly '%ReferenceErrorPrototype%': $ReferenceErrorPrototype;

  public readonly '%SyntaxError%': $SyntaxErrorConstructor;
  public readonly '%SyntaxErrorPrototype%': $SyntaxErrorPrototype;

  public readonly '%TypeError%': $TypeErrorConstructor;
  public readonly '%TypeErrorPrototype%': $TypeErrorPrototype;

  public readonly '%URIError%': $URIErrorConstructor;
  public readonly '%URIErrorPrototype%': $URIErrorPrototype;

  public readonly '%IteratorPrototype%': $IteratorPrototype;

  public readonly '%GeneratorFunction%': $GeneratorFunctionConstructor;
  public readonly '%Generator%': $GeneratorFunctionPrototype;
  public readonly '%GeneratorPrototype%': $GeneratorPrototype;

  public readonly '%Promise%': $PromiseConstructor;
  public readonly '%PromisePrototype%': $PromisePrototype;

  public readonly '%PromiseProto_then%': $PromiseProto_then;
  public readonly '%Promise_all%': $Promise_all;
  public readonly '%Promise_resolve%': $Promise_resolve;
  public readonly '%Promise_reject%': $Promise_reject;

  public readonly '%AsyncFunction%': $AsyncFunctionConstructor;
  public readonly '%AsyncFunctionPrototype%': $AsyncFunctionPrototype;

  public readonly '%AsyncIteratorPrototype%': $AsyncIteratorPrototype;
  public readonly '%AsyncFromSyncIteratorPrototype%': $AsyncFromSyncIteratorPrototype;

  public readonly '%AsyncGeneratorFunction%': $AsyncGeneratorFunctionConstructor;
  public readonly '%AsyncGenerator%': $AsyncGeneratorFunctionPrototype;

  public readonly '%AsyncGeneratorPrototype%': $AsyncGeneratorPrototype;

  public readonly '%RegExpPrototype%': $Object<'%RegExpPrototype%'>;
  public readonly '%DatePrototype%': $Object<'%DatePrototype%'>;

  public readonly '%ArrayIteratorPrototype%': $Object<'%ArrayIteratorPrototype%'>;
  public readonly '%MapIteratorPrototype%': $Object<'%MapIteratorPrototype%'>;
  public readonly '%SetIteratorPrototype%': $Object<'%SetIteratorPrototype%'>;
  public readonly '%StringIteratorPrototype%': $Object<'%StringIteratorPrototype%'>;

  public readonly '%ArrayPrototype%': $Object<'%ArrayPrototype%'>;
  public readonly '%MapPrototype%': $Object<'%MapPrototype%'>;
  public readonly '%WeakMapPrototype%': $Object<'%WeakMapPrototype%'>;
  public readonly '%SetPrototype%': $Object<'%SetPrototype%'>;
  public readonly '%WeakSetPrototype%': $Object<'%WeakSetPrototype%'>;
  public readonly '%DataViewPrototype%': $Object<'%DataViewPrototype%'>;
  public readonly '%ArrayBufferPrototype%': $Object<'%ArrayBufferPrototype%'>;
  public readonly '%SharedArrayBufferPrototype%': $Object<'%SharedArrayBufferPrototype%'>;

  public readonly '%TypedArrayPrototype%': $Object<'%TypedArrayPrototype%'>;
  public readonly '%Float32ArrayPrototype%': $Object<'%Float32ArrayPrototype%'>;
  public readonly '%Float64ArrayPrototype%': $Object<'%Float64ArrayPrototype%'>;
  public readonly '%Int8ArrayPrototype%': $Object<'%Int8ArrayPrototype%'>;
  public readonly '%Int16ArrayPrototype%': $Object<'%Int16ArrayPrototype%'>;
  public readonly '%Int32ArrayPrototype%': $Object<'%Int32ArrayPrototype%'>;
  public readonly '%Uint8ArrayPrototype%': $Object<'%Uint8ArrayPrototype%'>;
  public readonly '%Uint8ClampedArrayPrototype%': $Object<'%Uint8ClampedArrayPrototype%'>;
  public readonly '%Uint16ArrayPrototype%': $Object<'%Uint16ArrayPrototype%'>;
  public readonly '%Uint32ArrayPrototype%': $Object<'%Uint32ArrayPrototype%'>;

  public readonly '%RegExp%': $Object<'%RegExp%'>;
  public readonly '%Date%': $Object<'%Date%'>;

  public readonly '%Array%': $Object<'%Array%'>;
  public readonly '%Map%': $Object<'%Map%'>;
  public readonly '%WeakMap%': $Object<'%WeakMap%'>;
  public readonly '%Set%': $Object<'%Set%'>;
  public readonly '%WeakSet%': $Object<'%WeakSet%'>;
  public readonly '%DataView%': $Object<'%DataView%'>;
  public readonly '%ArrayBuffer%': $Object<'%ArrayBuffer%'>;
  public readonly '%SharedArrayBuffer%': $Object<'%SharedArrayBuffer%'>;

  public readonly '%TypedArray%': $Object<'%TypedArray%'>;
  public readonly '%Float32Array%': $Object<'%Float32Array%'>;
  public readonly '%Float64Array%': $Object<'%Float64Array%'>;
  public readonly '%Int8Array%': $Object<'%Int8Array%'>;
  public readonly '%Int16Array%': $Object<'%Int16Array%'>;
  public readonly '%Int32Array%': $Object<'%Int32Array%'>;
  public readonly '%Uint8Array%': $Object<'%Uint8Array%'>;
  public readonly '%Uint8ClampedArray%': $Object<'%Uint8ClampedArray%'>;
  public readonly '%Uint16Array%': $Object<'%Uint16Array%'>;
  public readonly '%Uint32Array%': $Object<'%Uint32Array%'>;

  public readonly '%Atomics%': $Object<'%Atomics%'>;
  public readonly '%JSON%': $Object<'%JSON%'>;
  public readonly '%Math%': $Object<'%Math%'>;
  public readonly '%Reflect%': $Reflect;
  public readonly '%Proxy%': $ProxyConstructor;

  public readonly '%decodeURI%': $DecodeURI;
  public readonly '%decodeURIComponent%': $DecodeURIComponent;
  public readonly '%encodeURI%': $EncodeURI;
  public readonly '%encodeURIComponent%': $EncodeURIComponent;
  public readonly '%eval%': $Eval;
  public readonly '%isFinite%': $IsFinite;
  public readonly '%isNaN%': $IsNaN;
  public readonly '%parseFloat%': $ParseFloat;
  public readonly '%parseInt%': $ParseInt;
  public readonly '%JSONParse%': $Object<'%JSONParse%'>;
  public readonly '%JSONStringify%': $Object<'%JSONStringify%'>;

  public readonly '%ArrayProto_entries%': $Object<'%ArrayProto_entries%'>;
  public readonly '%ArrayProto_forEach%': $Object<'%ArrayProto_forEach%'>;
  public readonly '%ArrayProto_keys%': $Object<'%ArrayProto_keys%'>;
  public readonly '%ArrayProto_values%': $Object<'%ArrayProto_values%'>;
  public readonly '%ObjProto_valueOf%': $Object<'%ObjProto_valueOf%'>;

  // http://www.ecma-international.org/ecma-262/#sec-createintrinsics
  // 8.2.2 CreateIntrinsics ( realmRec )
  public constructor(realm: Realm) {
    realm['[[Intrinsics]]'] = this;

    const empty = this['empty'] = new $Empty(realm);
    this['undefined'] = new $Undefined(realm);
    this['null'] = new $Null(realm);

    // Synthetic root context for intrinsics that need the context to be there during initialization.
    // Creating a valid ExecutionContext requires the null value, which is why we do it right here and neither earlier nor later.
    const root = new ExecutionContext(realm);
    root.Function = this['null'];
    root.ScriptOrModule = this['null'];
    realm.stack.push(root);

    this['true'] = new $Boolean(realm, true);
    this['false'] = new $Boolean(realm, false);
    this['NaN'] = new $Number(realm, NaN);
    this['Infinity'] = new $Number(realm, Infinity);
    this['-Infinity'] = new $Number(realm, -Infinity);
    this['0'] = new $Number(realm, 0);
    this['-0'] = new $Number(realm, -0);
    this[''] = new $String(realm, '');
    this['*'] = new $String(realm, '*');
    this['*default*'] = new $String(realm, '*default*');
    this['default'] = new $String(realm, 'default');
    this['string'] = new $String(realm, 'string');
    this['number'] = new $String(realm, 'number');
    this['length'] = new $String(realm, 'length');
    this['next'] = new $String(realm, 'next');
    this['return'] = new $String(realm, 'return');
    this['throw'] = new $String(realm, 'throw');
    this['call'] = new $String(realm, 'call');
    this['all'] = new $String(realm, 'all');
    this['race'] = new $String(realm, 'race');
    this['reject'] = new $String(realm, 'reject');
    this['resolve'] = new $String(realm, 'resolve');
    this['finally'] = new $String(realm, 'finally');
    this['then'] = new $String(realm, 'then');
    this['catch'] = new $String(realm, 'catch');
    this['message'] = new $String(realm, 'message');
    this['proxy'] = new $String(realm, 'proxy');
    this['revoke'] = new $String(realm, 'revoke');
    this['revocable'] = new $String(realm, 'revocable');
    this['$arguments'] = new $String(realm, 'arguments');
    this['$callee'] = new $String(realm, 'callee');
    this['$constructor'] = new $String(realm, 'constructor');
    this['$hasOwnProperty'] = new $String(realm, 'hasOwnProperty');
    this['$isPrototypeOf'] = new $String(realm, 'isPrototypeOf');
    this['$propertyIsEnumerable'] = new $String(realm, 'propertyIsEnumerable');
    this['$toLocaleString'] = new $String(realm, 'toLocaleString');
    this['$prototype'] = new $String(realm, 'prototype');
    this['$name'] = new $String(realm, 'name');
    this['$toString'] = new $String(realm, 'toString');
    this['$valueOf'] = new $String(realm, 'valueOf');

    this['$enumerable'] = new $String(realm, 'enumerable');
    this['$configurable'] = new $String(realm, 'configurable');
    this['$writable'] = new $String(realm, 'writable');
    this['$value'] = new $String(realm, 'value');
    this['$return'] = new $String(realm, 'return');
    this['$done'] = new $String(realm, 'done');

    this['$getPrototypeOf'] = new $String(realm, 'getPrototypeOf');
    this['$setPrototypeOf'] = new $String(realm, 'setPrototypeOf');
    this['$isExtensible'] = new $String(realm, 'isExtensible');
    this['$preventExtensions'] = new $String(realm, 'preventExtensions');
    this['$getOwnPropertyDescriptor'] = new $String(realm, 'getOwnPropertyDescriptor');
    this['$defineProperty'] = new $String(realm, 'defineProperty');
    this['$has'] = new $String(realm, 'has');
    this['$get'] = new $String(realm, 'get');
    this['$set'] = new $String(realm, 'set');
    this['$deleteProperty'] = new $String(realm, 'deleteProperty');
    this['$ownKeys'] = new $String(realm, 'ownKeys');
    this['$apply'] = new $String(realm, 'apply');
    this['$construct'] = new $String(realm, 'construct');

    this['$bind'] = new $String(realm, 'bind');
    this['$call'] = new $String(realm, 'call');

    this['$assign'] = new $String(realm, 'assign');
    this['$create'] = new $String(realm, 'create');
    this['$defineProperties'] = new $String(realm, 'defineProperties');
    this['$entries'] = new $String(realm, 'entries');
    this['$freeze'] = new $String(realm, 'freeze');
    this['$fromEntries'] = new $String(realm, 'fromEntries');
    this['$getOwnPropertyDescriptors'] = new $String(realm, 'getOwnPropertyDescriptors');
    this['$getOwnPropertyNames'] = new $String(realm, 'getOwnPropertyNames');
    this['$getOwnPropertySymbols'] = new $String(realm, 'getOwnPropertySymbols');
    this['$is'] = new $String(realm, 'is');
    this['$isFrozen'] = new $String(realm, 'isFrozen');
    this['$isSealed'] = new $String(realm, 'isSealed');
    this['$keys'] = new $String(realm, 'keys');
    this['$seal'] = new $String(realm, 'seal');
    this['$values'] = new $String(realm, 'values');

    this['@@asyncIterator'] = new $Symbol(realm, new $String(realm, 'Symbol.asyncIterator'));
    this['@@hasInstance'] = new $Symbol(realm, new $String(realm, 'Symbol.hasInstance'));
    this['@@isConcatSpreadable'] = new $Symbol(realm, new $String(realm, 'Symbol.isConcatSpreadable'));
    this['@@iterator'] = new $Symbol(realm, new $String(realm, 'Symbol.iterator'));
    this['@@match'] = new $Symbol(realm, new $String(realm, 'Symbol.match'));
    this['@@replace'] = new $Symbol(realm, new $String(realm, 'Symbol.replace'));
    this['@@search'] = new $Symbol(realm, new $String(realm, 'Symbol.search'));
    this['@@species'] = new $Symbol(realm, new $String(realm, 'Symbol.species'));
    this['@@split'] = new $Symbol(realm, new $String(realm, 'Symbol.split'));
    this['@@toPrimitive'] = new $Symbol(realm, new $String(realm, 'Symbol.toPrimitive'));
    this['@@toStringTag'] = new $Symbol(realm, new $String(realm, 'Symbol.toStringTag'));
    this['@@unscopables'] = new $Symbol(realm, new $String(realm, 'Symbol.unscopables'));

    const objectPrototype = this['%ObjectPrototype%'] = new $ObjectPrototype(realm);
    const functionPrototype = this['%FunctionPrototype%'] = new $FunctionPrototype(realm, objectPrototype);

    const objectConstructor = this['%Object%'] = new $ObjectConstructor(realm, functionPrototype);
    (objectConstructor.$prototype = objectPrototype).$constructor = objectConstructor;

    const functionConstructor = this['%Function%'] = new $FunctionConstructor(realm, functionPrototype);
    (functionConstructor.$prototype = functionPrototype).$constructor = functionConstructor;

    this['%ThrowTypeError%'] = new $ThrowTypeError(realm, '%ThrowTypeError%', functionPrototype);

    objectConstructor.$assign = new $Object_assign(realm, functionPrototype);
    objectConstructor.$create = new $Object_create(realm, functionPrototype);
    objectConstructor.$defineProperties = new $Object_defineProperties(realm, functionPrototype);
    objectConstructor.$defineProperty = new $Object_defineProperty(realm, functionPrototype);
    objectConstructor.$entries = new $Object_entries(realm, functionPrototype);
    objectConstructor.$freeze = new $Object_freeze(realm, functionPrototype);
    objectConstructor.$fromEntries = new $Object_fromEntries(realm, functionPrototype);
    objectConstructor.$getOwnPropertyDescriptor = new $Object_getOwnPropertyDescriptor(realm, functionPrototype);
    objectConstructor.$getOwnPropertyDescriptors = new $Object_getOwnPropertyDescriptors(realm, functionPrototype);
    objectConstructor.$getOwnPropertyNames = new $Object_getOwnPropertyNames(realm, functionPrototype);
    objectConstructor.$getOwnPropertySymbols = new $Object_getOwnPropertySymbols(realm, functionPrototype);
    objectConstructor.$getPrototypeOf = new $Object_getPrototypeOf(realm, functionPrototype);
    objectConstructor.$is = new $Object_is(realm, functionPrototype);
    objectConstructor.$isExtensible = new $Object_isExtensible(realm, functionPrototype);
    objectConstructor.$isFrozen = new $Object_isFrozen(realm, functionPrototype);
    objectConstructor.$isSealed = new $Object_isSealed(realm, functionPrototype);
    objectConstructor.$keys = new $Object_keys(realm, functionPrototype);
    objectConstructor.$preventExtensions = new $Object_preventExtensions(realm, functionPrototype);
    objectConstructor.$seal = new $Object_seal(realm, functionPrototype);
    objectConstructor.$setPrototypeOf = new $Object_setPrototypeOf(realm, functionPrototype);
    objectConstructor.$values = new $Object_values(realm, functionPrototype);

    objectPrototype.$hasOwnProperty = new $ObjectPrototype_hasOwnProperty(realm, functionPrototype);
    objectPrototype.$isPrototypeOf = new $ObjectPrototype_isPrototypeOf(realm, functionPrototype);
    objectPrototype.$propertyIsEnumerable = new $ObjectPrototype_propertyIsEnumerable(realm, functionPrototype);
    objectPrototype.$toLocaleString = new $ObjectPrototype_toLocaleString(realm, functionPrototype);
    objectPrototype.$toString = this['%ObjProto_toString%'] = new $ObjProto_toString(realm, functionPrototype);
    objectPrototype.$valueOf = this['%ObjProto_valueOf%'] = new $ObjProto_valueOf(realm, functionPrototype);

    functionPrototype.$apply = new $FunctionPrototype_apply(realm, functionPrototype);
    functionPrototype.$bind = new $FunctionPrototype_bind(realm, functionPrototype);
    functionPrototype.$call = new $FunctionPrototype_call(realm, functionPrototype);
    functionPrototype.$toString = new $FunctionPrototype_toString(realm, functionPrototype);
    functionPrototype['@@hasInstance'] = new $FunctionPrototype_hasInstance(realm, functionPrototype);

    const stringConstructor = this['%String%'] = new $StringConstructor(realm, functionPrototype);
    const stringPrototype = this['%StringPrototype%'] = new $StringPrototype(realm, objectPrototype);
    (stringConstructor.$prototype = stringPrototype).$constructor = stringConstructor;

    const numberConstructor = this['%Number%'] = new $NumberConstructor(realm, functionPrototype);
    const numberPrototype = this['%NumberPrototype%'] = new $NumberPrototype(realm, objectPrototype);
    (numberConstructor.$prototype = numberPrototype).$constructor = numberConstructor;

    const booleanConstructor = this['%Boolean%'] = new $BooleanConstructor(realm, functionPrototype);
    const booleanPrototype = this['%BooleanPrototype%'] = new $BooleanPrototype(realm, objectPrototype);
    (booleanConstructor.$prototype = booleanPrototype).$constructor = booleanConstructor;

    const symbolConstructor = this['%Symbol%'] = new $SymbolConstructor(realm, functionPrototype);
    const symbolPrototype = this['%SymbolPrototype%'] = new $SymbolPrototype(realm, objectPrototype);
    (symbolConstructor.$prototype = symbolPrototype).$constructor = symbolConstructor;

    const errorConstructor = this['%Error%'] = new $ErrorConstructor(realm, functionPrototype);
    const errorPrototype = this['%ErrorPrototype%'] = new $ErrorPrototype(realm, objectPrototype);
    (errorConstructor.$prototype = errorPrototype).$constructor = errorConstructor;
    errorPrototype.message = new $String(realm, '');
    errorPrototype.$name = new $String(realm, 'Error');
    errorPrototype.$toString = new $ErrorPrototype_toString(realm, 'Error.prototype.toString', functionPrototype);

    const evalErrorConstructor = this['%EvalError%'] = new $EvalErrorConstructor(realm, errorConstructor);
    const evalErrorPrototype = this['%EvalErrorPrototype%'] = new $EvalErrorPrototype(realm, errorPrototype);
    (evalErrorConstructor.$prototype = evalErrorPrototype).$constructor = evalErrorConstructor;
    evalErrorPrototype.message = new $String(realm, '');
    evalErrorPrototype.$name = new $String(realm, 'EvalError');

    const rangeErrorConstructor = this['%RangeError%'] = new $RangeErrorConstructor(realm, errorConstructor);
    const rangeErrorPrototype = this['%RangeErrorPrototype%'] = new $RangeErrorPrototype(realm, errorPrototype);
    (rangeErrorConstructor.$prototype = rangeErrorPrototype).$constructor = rangeErrorConstructor;
    rangeErrorPrototype.message = new $String(realm, '');
    rangeErrorPrototype.$name = new $String(realm, 'RangeError');

    const referenceErrorConstructor = this['%ReferenceError%'] = new $ReferenceErrorConstructor(realm, errorConstructor);
    const referenceErrorPrototype = this['%ReferenceErrorPrototype%'] = new $ReferenceErrorPrototype(realm, errorPrototype);
    (referenceErrorConstructor.$prototype = referenceErrorPrototype).$constructor = referenceErrorConstructor;
    referenceErrorPrototype.message = new $String(realm, '');
    referenceErrorPrototype.$name = new $String(realm, 'ReferenceError');

    const syntaxErrorConstructor = this['%SyntaxError%'] = new $SyntaxErrorConstructor(realm, errorConstructor);
    const syntaxErrorPrototype = this['%SyntaxErrorPrototype%'] = new $SyntaxErrorPrototype(realm, errorPrototype);
    (syntaxErrorConstructor.$prototype = syntaxErrorPrototype).$constructor = syntaxErrorConstructor;
    syntaxErrorPrototype.message = new $String(realm, '');
    syntaxErrorPrototype.$name = new $String(realm, 'SyntaxError');

    const typeErrorConstructor = this['%TypeError%'] = new $TypeErrorConstructor(realm, errorConstructor);
    const typeErrorPrototype = this['%TypeErrorPrototype%'] = new $TypeErrorPrototype(realm, errorPrototype);
    (typeErrorConstructor.$prototype = typeErrorPrototype).$constructor = typeErrorConstructor;
    typeErrorPrototype.message = new $String(realm, '');
    typeErrorPrototype.$name = new $String(realm, 'TypeError');

    const URIErrorConstructor = this['%URIError%'] = new $URIErrorConstructor(realm, errorConstructor);
    const URIErrorPrototype = this['%URIErrorPrototype%'] = new $URIErrorPrototype(realm, errorPrototype);
    (URIErrorConstructor.$prototype = URIErrorPrototype).$constructor = URIErrorConstructor;
    URIErrorPrototype.message = new $String(realm, '');
    URIErrorPrototype.$name = new $String(realm, 'URIError');

    const iteratorPrototype = this['%IteratorPrototype%'] = new $IteratorPrototype(realm, objectPrototype);

    const generatorFunctionConstructor = this['%GeneratorFunction%'] = new $GeneratorFunctionConstructor(realm, functionConstructor);
    const generatorFunctionPrototype = this['%Generator%'] = new $GeneratorFunctionPrototype(realm, functionPrototype);
    (generatorFunctionConstructor.$prototype = generatorFunctionPrototype).$constructor = generatorFunctionConstructor;
    generatorFunctionConstructor.length = new $Number(realm, 1);

    const generatorPrototype = this['%GeneratorPrototype%'] = new $GeneratorPrototype(realm, iteratorPrototype);
    (generatorFunctionPrototype.$prototype = generatorPrototype).$constructor = generatorFunctionPrototype;

    generatorFunctionPrototype['@@toStringTag'] = new $String(realm, 'GeneratorFunction');

    generatorPrototype.next = new $GeneratorPrototype_next(realm, 'Generator.prototype.next', functionPrototype);
    generatorPrototype.return = new $GeneratorPrototype_return(realm, 'Generator.prototype.return', functionPrototype);
    generatorPrototype.throw = new $GeneratorPrototype_throw(realm, 'Generator.prototype.throw', functionPrototype);

    generatorPrototype['@@toStringTag'] = new $String(realm, 'Generator');

    const promiseConstructor = this['%Promise%'] = new $PromiseConstructor(realm, functionPrototype);
    const promisePrototype = this['%PromisePrototype%'] = new $PromisePrototype(realm, functionPrototype);
    (promiseConstructor.$prototype = promisePrototype).$constructor = promiseConstructor;

    promisePrototype.then = this['%PromiseProto_then%'] = new $PromiseProto_then(realm, functionPrototype);
    promisePrototype.catch = new $PromiseProto_catch(realm, functionPrototype);
    promisePrototype.finally = new $PromiseProto_finally(realm, functionPrototype);

    promisePrototype['@@toStringTag'] = new $String(realm, 'Promise');

    promiseConstructor.all = this['%Promise_all%'] = new $Promise_all(realm, functionPrototype);
    promiseConstructor.race = new $Promise_race(realm, functionPrototype);
    promiseConstructor.resolve = this['%Promise_resolve%'] = new $Promise_resolve(realm, functionPrototype);
    promiseConstructor.reject = this['%Promise_reject%'] = new $Promise_reject(realm, functionPrototype);

    promiseConstructor['@@species'] = new $GetSpecies(realm);

    const asyncFunctionConstructor = this['%AsyncFunction%'] = new $AsyncFunctionConstructor(realm, functionConstructor);
    const asyncFunctionPrototype = this['%AsyncFunctionPrototype%'] = new $AsyncFunctionPrototype(realm, functionPrototype);
    (asyncFunctionConstructor.$prototype = asyncFunctionPrototype).$constructor = asyncFunctionConstructor;

    asyncFunctionConstructor.length = new $Number(realm, 1);

    asyncFunctionPrototype['@@toStringTag'] = new $String(realm, 'AsyncFunction');

    const asyncIteratorPrototype = this['%AsyncIteratorPrototype%'] = new $AsyncIteratorPrototype(realm, objectPrototype);
    const asyncFromSyncIteratorPrototype = this['%AsyncFromSyncIteratorPrototype%'] = new $AsyncFromSyncIteratorPrototype(realm, asyncIteratorPrototype);
    asyncFromSyncIteratorPrototype.next = new $AsyncFromSyncIteratorPrototype_next(realm, functionPrototype);
    asyncFromSyncIteratorPrototype.return = new $AsyncFromSyncIteratorPrototype_return(realm, functionPrototype);
    asyncFromSyncIteratorPrototype.throw = new $AsyncFromSyncIteratorPrototype_throw(realm, functionPrototype);

    asyncFromSyncIteratorPrototype['@@toStringTag'] = new $String(realm, 'Async-from-Sync Iterator');

    const asyncGeneratorFunctionConstructor = this['%AsyncGeneratorFunction%'] = new $AsyncGeneratorFunctionConstructor(realm, functionConstructor);
    const asyncGeneratorFunctionPrototype = this['%AsyncGenerator%'] = new $AsyncGeneratorFunctionPrototype(realm, functionPrototype);
    (asyncGeneratorFunctionConstructor.$prototype = asyncGeneratorFunctionPrototype).$constructor = asyncGeneratorFunctionConstructor;

    asyncGeneratorFunctionConstructor.length = new $Number(realm, 1);

    asyncGeneratorFunctionPrototype['@@toStringTag'] = new $String(realm, 'AsyncGeneratorFunction');

    const asyncGeneratorPrototype = this['%AsyncGeneratorPrototype%'] = new $AsyncGeneratorPrototype(realm, iteratorPrototype);
    (asyncGeneratorFunctionPrototype.$prototype = asyncGeneratorPrototype).$constructor = asyncGeneratorFunctionPrototype;
    asyncGeneratorPrototype.next = new $AsyncGeneratorPrototype_next(realm, functionPrototype);
    asyncGeneratorPrototype.return = new $AsyncGeneratorPrototype_return(realm, functionPrototype);
    asyncGeneratorPrototype.throw = new $AsyncGeneratorPrototype_throw(realm, functionPrototype);

    this['%RegExpPrototype%'] = new $Object(realm, '%RegExpPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%DatePrototype%'] = new $Object(realm, '%DatePrototype%', objectPrototype, CompletionType.normal, empty);

    this['%ArrayIteratorPrototype%'] = new $Object(realm, '%ArrayIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);
    this['%MapIteratorPrototype%'] = new $Object(realm, '%MapIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);
    this['%SetIteratorPrototype%'] = new $Object(realm, '%SetIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);
    this['%StringIteratorPrototype%'] = new $Object(realm, '%StringIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);

    this['%ArrayPrototype%'] = new $Object(realm, '%ArrayPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%MapPrototype%'] = new $Object(realm, '%MapPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%WeakMapPrototype%'] = new $Object(realm, '%WeakMapPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%SetPrototype%'] = new $Object(realm, '%SetPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%WeakSetPrototype%'] = new $Object(realm, '%WeakSetPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%DataViewPrototype%'] = new $Object(realm, '%DataViewPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%ArrayBufferPrototype%'] = new $Object(realm, '%ArrayBufferPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%SharedArrayBufferPrototype%'] = new $Object(realm, '%SharedArrayBufferPrototype%', objectPrototype, CompletionType.normal, empty);

    this['%TypedArrayPrototype%'] = new $Object(realm, '%TypedArrayPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%Float32ArrayPrototype%'] = new $Object(realm, '%Float32ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Float64ArrayPrototype%'] = new $Object(realm, '%Float64ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Int8ArrayPrototype%'] = new $Object(realm, '%Int8ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Int16ArrayPrototype%'] = new $Object(realm, '%Int16ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Int32ArrayPrototype%'] = new $Object(realm, '%Int32ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Uint8ArrayPrototype%'] = new $Object(realm, '%Uint8ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Uint8ClampedArrayPrototype%'] = new $Object(realm, '%Uint8ClampedArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Uint16ArrayPrototype%'] = new $Object(realm, '%Uint16ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);
    this['%Uint32ArrayPrototype%'] = new $Object(realm, '%Uint32ArrayPrototype%', this['%TypedArrayPrototype%'], CompletionType.normal, empty);

    this['%RegExp%'] = new $Object(realm, '%RegExp%', functionPrototype, CompletionType.normal, empty);
    this['%Date%'] = new $Object(realm, '%Date%', functionPrototype, CompletionType.normal, empty);

    this['%Array%'] = new $Object(realm, '%Array%', functionPrototype, CompletionType.normal, empty);
    this['%Map%'] = new $Object(realm, '%Map%', functionPrototype, CompletionType.normal, empty);
    this['%WeakMap%'] = new $Object(realm, '%WeakMap%', functionPrototype, CompletionType.normal, empty);
    this['%Set%'] = new $Object(realm, '%Set%', functionPrototype, CompletionType.normal, empty);
    this['%WeakSet%'] = new $Object(realm, '%WeakSet%', functionPrototype, CompletionType.normal, empty);
    this['%DataView%'] = new $Object(realm, '%DataView%', functionPrototype, CompletionType.normal, empty);
    this['%ArrayBuffer%'] = new $Object(realm, '%ArrayBuffer%', functionPrototype, CompletionType.normal, empty);
    this['%SharedArrayBuffer%'] = new $Object(realm, '%SharedArrayBuffer%', functionPrototype, CompletionType.normal, empty);

    this['%TypedArray%'] = new $Object(realm, '%TypedArray%', functionPrototype, CompletionType.normal, empty);
    this['%Float32Array%'] = new $Object(realm, '%Float32Array%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Float64Array%'] = new $Object(realm, '%Float64Array%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Int8Array%'] = new $Object(realm, '%Int8Array%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Int16Array%'] = new $Object(realm, '%Int16Array%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Int32Array%'] = new $Object(realm, '%Int32Array%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Uint8Array%'] = new $Object(realm, '%Uint8Array%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Uint8ClampedArray%'] = new $Object(realm, '%Uint8ClampedArray%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Uint16Array%'] = new $Object(realm, '%Uint16Array%', this['%TypedArray%'], CompletionType.normal, empty);
    this['%Uint32Array%'] = new $Object(realm, '%Uint32Array%', this['%TypedArray%'], CompletionType.normal, empty);

    this['%Atomics%'] = new $Object(realm, '%Atomics%', objectPrototype, CompletionType.normal, empty);
    this['%JSON%'] = new $Object(realm, '%JSON%', objectPrototype, CompletionType.normal, empty);
    this['%Math%'] = new $Object(realm, '%Math%', objectPrototype, CompletionType.normal, empty);

    const reflect = this['%Reflect%'] = new $Reflect(realm, objectPrototype);
    reflect.$apply = new $Reflect_apply(realm, functionPrototype);
    reflect.$construct = new $Reflect_construct(realm, functionPrototype);
    reflect.$defineProperty = new $Reflect_defineProperty(realm, functionPrototype);
    reflect.$deleteProperty = new $Reflect_deleteProperty(realm, functionPrototype);
    reflect.$get = new $Reflect_get(realm, functionPrototype);
    reflect.$getOwnPropertyDescriptor = new $Reflect_getOwnPropertyDescriptor(realm, functionPrototype);
    reflect.$getPrototypeOf = new $Reflect_getPrototypeOf(realm, functionPrototype);
    reflect.$has = new $Reflect_has(realm, functionPrototype);
    reflect.$isExtensible = new $Reflect_isExtensible(realm, functionPrototype);
    reflect.$ownKeys = new $Reflect_ownKeys(realm, functionPrototype);
    reflect.$preventExtensions = new $Reflect_preventExtensions(realm, functionPrototype);
    reflect.$set = new $Reflect_set(realm, functionPrototype);
    reflect.$setPrototypeOf = new $Reflect_setPrototypeOf(realm, functionPrototype);

    const proxyConstructor = this['%Proxy%'] = new $ProxyConstructor(realm, functionPrototype);
    proxyConstructor.revocable = new $Proxy_revocable(realm, functionPrototype);

    this['%decodeURI%'] = new $DecodeURI(realm, functionPrototype);
    this['%decodeURIComponent%'] = new $DecodeURIComponent(realm, functionPrototype);
    this['%encodeURI%'] = new $EncodeURI(realm, functionPrototype);
    this['%encodeURIComponent%'] = new $EncodeURIComponent(realm, functionPrototype);

    this['%eval%'] = new $Eval(realm, functionPrototype);
    this['%isFinite%'] = new $IsFinite(realm, functionPrototype);
    this['%isNaN%'] = new $IsNaN(realm, functionPrototype);
    this['%parseFloat%'] = new $ParseFloat(realm, functionPrototype);
    this['%parseInt%'] = new $ParseInt(realm, functionPrototype);
    this['%JSONParse%'] = new $Object(realm, '%JSONParse%', functionPrototype, CompletionType.normal, empty);
    this['%JSONStringify%'] = new $Object(realm, '%JSONStringify%', functionPrototype, CompletionType.normal, empty);

    this['%ArrayProto_entries%'] = new $Object(realm, '%ArrayProto_entries%', functionPrototype, CompletionType.normal, empty);
    this['%ArrayProto_forEach%'] = new $Object(realm, '%ArrayProto_forEach%', functionPrototype, CompletionType.normal, empty);
    this['%ArrayProto_keys%'] = new $Object(realm, '%ArrayProto_keys%', functionPrototype, CompletionType.normal, empty);
    this['%ArrayProto_values%'] = new $Object(realm, '%ArrayProto_values%', functionPrototype, CompletionType.normal, empty);
    this['%ObjProto_valueOf%'] = new $Object(realm, '%ObjProto_valueOf%', functionPrototype, CompletionType.normal, empty);
  }

  public dispose(this: Writable<Partial<Intrinsics>>): void {
    this['true'] = void 0;
    this['false'] = void 0;
    this['NaN'] = void 0;
    this['Infinity'] = void 0;
    this['-Infinity'] = void 0;
    this['0'] = void 0;
    this['-0'] = void 0;
    this[''] = void 0;
    this['*'] = void 0;
    this['*default*'] = void 0;
    this['default'] = void 0;
    this['string'] = void 0;
    this['number'] = void 0;
    this['length'] = void 0;
    this['next'] = void 0;
    this['return'] = void 0;
    this['throw'] = void 0;
    this['call'] = void 0;
    this['message'] = void 0;
    this['$arguments'] = void 0;
    this['$callee'] = void 0;
    this['$constructor'] = void 0;
    this['$prototype'] = void 0;
    this['$name'] = void 0;
    this['$toString'] = void 0;
    this['$valueOf'] = void 0;

    this['$enumerable'] = void 0;
    this['$configurable'] = void 0;
    this['$writable'] = void 0;
    this['$value'] = void 0;
    this['$return'] = void 0;
    this['$done'] = void 0;

    this['$getPrototypeOf'] = void 0;
    this['$setPrototypeOf'] = void 0;
    this['$isExtensible'] = void 0;
    this['$preventExtensions'] = void 0;
    this['$getOwnPropertyDescriptor'] = void 0;
    this['$defineProperty'] = void 0;
    this['$has'] = void 0;
    this['$get'] = void 0;
    this['$set'] = void 0;
    this['$deleteProperty'] = void 0;
    this['$ownKeys'] = void 0;
    this['$apply'] = void 0;
    this['$construct'] = void 0;

    this['@@asyncIterator'] = void 0;
    this['@@hasInstance'] = void 0;
    this['@@isConcatSpreadable'] = void 0;
    this['@@iterator'] = void 0;
    this['@@match'] = void 0;
    this['@@replace'] = void 0;
    this['@@search'] = void 0;
    this['@@species'] = void 0;
    this['@@split'] = void 0;
    this['@@toPrimitive'] = void 0;
    this['@@toStringTag'] = void 0;
    this['@@unscopables'] = void 0;

    this['%ObjectPrototype%']!.dispose();
    this['%ObjectPrototype%'] = void 0;
    this['%FunctionPrototype%']!.dispose();
    this['%FunctionPrototype%'] = void 0;

    this['%Object%']!.dispose();
    this['%Object%'] = void 0;
    this['%Function%']!.dispose();
    this['%Function%'] = void 0;

    this['%ThrowTypeError%']!.dispose();
    this['%ThrowTypeError%'] = void 0;

    this['%ObjProto_toString%']!.dispose();
    this['%ObjProto_toString%'] = void 0;

    this['%String%']!.dispose();
    this['%String%'] = void 0;
    this['%StringPrototype%']!.dispose();
    this['%StringPrototype%'] = void 0;

    this['%Number%']!.dispose();
    this['%Number%'] = void 0;
    this['%NumberPrototype%']!.dispose();
    this['%NumberPrototype%'] = void 0;

    this['%Boolean%']!.dispose();
    this['%Boolean%'] = void 0;
    this['%BooleanPrototype%']!.dispose();
    this['%BooleanPrototype%'] = void 0;

    this['%Symbol%']!.dispose();
    this['%Symbol%'] = void 0;
    this['%SymbolPrototype%']!.dispose();
    this['%SymbolPrototype%'] = void 0;

    this['%Error%']!.dispose();
    this['%Error%'] = void 0;
    this['%ErrorPrototype%']!.dispose();
    this['%ErrorPrototype%'] = void 0;

    this['%EvalError%']!.dispose();
    this['%EvalError%'] = void 0;
    this['%EvalErrorPrototype%']!.dispose();
    this['%EvalErrorPrototype%'] = void 0;

    this['%RangeError%']!.dispose();
    this['%RangeError%'] = void 0;
    this['%RangeErrorPrototype%']!.dispose();
    this['%RangeErrorPrototype%'] = void 0;

    this['%ReferenceError%']!.dispose();
    this['%ReferenceError%'] = void 0;
    this['%ReferenceErrorPrototype%']!.dispose();
    this['%ReferenceErrorPrototype%'] = void 0;

    this['%SyntaxError%']!.dispose();
    this['%SyntaxError%'] = void 0;
    this['%SyntaxErrorPrototype%']!.dispose();
    this['%SyntaxErrorPrototype%'] = void 0;

    this['%TypeError%']!.dispose();
    this['%TypeError%'] = void 0;
    this['%TypeErrorPrototype%']!.dispose();
    this['%TypeErrorPrototype%'] = void 0;

    this['%URIError%']!.dispose();
    this['%URIError%'] = void 0;
    this['%URIErrorPrototype%']!.dispose();
    this['%URIErrorPrototype%'] = void 0;

    this['%PromisePrototype%']!.dispose();
    this['%PromisePrototype%'] = void 0;
    this['%RegExpPrototype%']!.dispose();
    this['%RegExpPrototype%'] = void 0;
    this['%DatePrototype%']!.dispose();
    this['%DatePrototype%'] = void 0;

    this['%AsyncFunctionPrototype%']!.dispose();
    this['%AsyncFunctionPrototype%'] = void 0;

    this['%Generator%']!.dispose();
    this['%Generator%'] = void 0;
    this['%AsyncGenerator%']!.dispose();
    this['%AsyncGenerator%'] = void 0;

    this['%IteratorPrototype%']!.dispose();
    this['%IteratorPrototype%'] = void 0;
    this['%ArrayIteratorPrototype%']!.dispose();
    this['%ArrayIteratorPrototype%'] = void 0;
    this['%MapIteratorPrototype%']!.dispose();
    this['%MapIteratorPrototype%'] = void 0;
    this['%SetIteratorPrototype%']!.dispose();
    this['%SetIteratorPrototype%'] = void 0;
    this['%StringIteratorPrototype%']!.dispose();
    this['%StringIteratorPrototype%'] = void 0;
    this['%GeneratorPrototype%']!.dispose();
    this['%GeneratorPrototype%'] = void 0;

    this['%AsyncIteratorPrototype%']!.dispose();
    this['%AsyncIteratorPrototype%'] = void 0;
    this['%AsyncFromSyncIteratorPrototype%']!.dispose();
    this['%AsyncFromSyncIteratorPrototype%'] = void 0;
    this['%AsyncGeneratorPrototype%']!.dispose();
    this['%AsyncGeneratorPrototype%'] = void 0;

    this['%ArrayPrototype%']!.dispose();
    this['%ArrayPrototype%'] = void 0;
    this['%MapPrototype%']!.dispose();
    this['%MapPrototype%'] = void 0;
    this['%WeakMapPrototype%']!.dispose();
    this['%WeakMapPrototype%'] = void 0;
    this['%SetPrototype%']!.dispose();
    this['%SetPrototype%'] = void 0;
    this['%WeakSetPrototype%']!.dispose();
    this['%WeakSetPrototype%'] = void 0;
    this['%DataViewPrototype%']!.dispose();
    this['%DataViewPrototype%'] = void 0;
    this['%ArrayBufferPrototype%']!.dispose();
    this['%ArrayBufferPrototype%'] = void 0;
    this['%SharedArrayBufferPrototype%']!.dispose();
    this['%SharedArrayBufferPrototype%'] = void 0;

    this['%TypedArrayPrototype%']!.dispose();
    this['%TypedArrayPrototype%'] = void 0;
    this['%Float32ArrayPrototype%']!.dispose();
    this['%Float32ArrayPrototype%'] = void 0;
    this['%Float64ArrayPrototype%']!.dispose();
    this['%Float64ArrayPrototype%'] = void 0;
    this['%Int8ArrayPrototype%']!.dispose();
    this['%Int8ArrayPrototype%'] = void 0;
    this['%Int16ArrayPrototype%']!.dispose();
    this['%Int16ArrayPrototype%'] = void 0;
    this['%Int32ArrayPrototype%']!.dispose();
    this['%Int32ArrayPrototype%'] = void 0;
    this['%Uint8ArrayPrototype%']!.dispose();
    this['%Uint8ArrayPrototype%'] = void 0;
    this['%Uint8ClampedArrayPrototype%']!.dispose();
    this['%Uint8ClampedArrayPrototype%'] = void 0;
    this['%Uint16ArrayPrototype%']!.dispose();
    this['%Uint16ArrayPrototype%'] = void 0;
    this['%Uint32ArrayPrototype%']!.dispose();
    this['%Uint32ArrayPrototype%'] = void 0;

    this['%Promise%']!.dispose();
    this['%Promise%'] = void 0;
    this['%RegExp%']!.dispose();
    this['%RegExp%'] = void 0;
    this['%Date%']!.dispose();
    this['%Date%'] = void 0;

    this['%AsyncFunction%']!.dispose();
    this['%AsyncFunction%'] = void 0;

    this['%GeneratorFunction%']!.dispose();
    this['%GeneratorFunction%'] = void 0;
    this['%AsyncGeneratorFunction%']!.dispose();
    this['%AsyncGeneratorFunction%'] = void 0;

    this['%Array%']!.dispose();
    this['%Array%'] = void 0;
    this['%Map%']!.dispose();
    this['%Map%'] = void 0;
    this['%WeakMap%']!.dispose();
    this['%WeakMap%'] = void 0;
    this['%Set%']!.dispose();
    this['%Set%'] = void 0;
    this['%WeakSet%']!.dispose();
    this['%WeakSet%'] = void 0;
    this['%DataView%']!.dispose();
    this['%DataView%'] = void 0;
    this['%ArrayBuffer%']!.dispose();
    this['%ArrayBuffer%'] = void 0;
    this['%SharedArrayBuffer%']!.dispose();
    this['%SharedArrayBuffer%'] = void 0;

    this['%TypedArray%']!.dispose();
    this['%TypedArray%'] = void 0;
    this['%Float32Array%']!.dispose();
    this['%Float32Array%'] = void 0;
    this['%Float64Array%']!.dispose();
    this['%Float64Array%'] = void 0;
    this['%Int8Array%']!.dispose();
    this['%Int8Array%'] = void 0;
    this['%Int16Array%']!.dispose();
    this['%Int16Array%'] = void 0;
    this['%Int32Array%']!.dispose();
    this['%Int32Array%'] = void 0;
    this['%Uint8Array%']!.dispose();
    this['%Uint8Array%'] = void 0;
    this['%Uint8ClampedArray%']!.dispose();
    this['%Uint8ClampedArray%'] = void 0;
    this['%Uint16Array%']!.dispose();
    this['%Uint16Array%'] = void 0;
    this['%Uint32Array%']!.dispose();
    this['%Uint32Array%'] = void 0;

    this['%Atomics%']!.dispose();
    this['%Atomics%'] = void 0;
    this['%JSON%']!.dispose();
    this['%JSON%'] = void 0;
    this['%Math%']!.dispose();
    this['%Math%'] = void 0;
    this['%Reflect%']!.dispose();
    this['%Reflect%'] = void 0;
    this['%Proxy%']!.dispose();
    this['%Proxy%'] = void 0;

    this['%decodeURI%']!.dispose();
    this['%decodeURI%'] = void 0;
    this['%decodeURIComponent%']!.dispose();
    this['%decodeURIComponent%'] = void 0;
    this['%encodeURI%']!.dispose();
    this['%encodeURI%'] = void 0;
    this['%encodeURIComponent%']!.dispose();
    this['%encodeURIComponent%'] = void 0;
    this['%eval%']!.dispose();
    this['%eval%'] = void 0;
    this['%isFinite%']!.dispose();
    this['%isFinite%'] = void 0;
    this['%isNaN%']!.dispose();
    this['%isNaN%'] = void 0;
    this['%parseFloat%']!.dispose();
    this['%parseFloat%'] = void 0;
    this['%parseInt%']!.dispose();
    this['%parseInt%'] = void 0;
    this['%JSONParse%']!.dispose();
    this['%JSONParse%'] = void 0;
    this['%JSONStringify%']!.dispose();
    this['%JSONStringify%'] = void 0;

    this['%ArrayProto_entries%']!.dispose();
    this['%ArrayProto_entries%'] = void 0;
    this['%ArrayProto_forEach%']!.dispose();
    this['%ArrayProto_forEach%'] = void 0;
    this['%ArrayProto_keys%']!.dispose();
    this['%ArrayProto_keys%'] = void 0;
    this['%ArrayProto_values%']!.dispose();
    this['%ArrayProto_values%'] = void 0;
    this['%ObjProto_valueOf%']!.dispose();
    this['%ObjProto_valueOf%'] = void 0;
    this['%PromiseProto_then%']!.dispose();
    this['%PromiseProto_then%'] = void 0;
    this['%Promise_all%']!.dispose();
    this['%Promise_all%'] = void 0;
    this['%Promise_reject%']!.dispose();
    this['%Promise_reject%'] = void 0;
    this['%Promise_resolve%']!.dispose();
    this['%Promise_resolve%'] = void 0;
  }
}

export type IntrinsicObjectKey = { [K in keyof Intrinsics]: Intrinsics[K] extends $Object ? K : never }[keyof Intrinsics];
// export type IntrinsicObjectKey =
//   { [K in keyof Intrinsics]: Intrinsics[K] extends $Object ? K : never; } extends { [K in keyof Intrinsics]: infer U; }
//     ? ({} extends U ? never : U)
//     : never;
