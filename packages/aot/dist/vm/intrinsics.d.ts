import { Realm } from './realm.js';
import { $Boolean } from './types/boolean.js';
import { $Empty } from './types/empty.js';
import { $Undefined } from './types/undefined.js';
import { $Null } from './types/null.js';
import { $Number } from './types/number.js';
import { $String } from './types/string.js';
import { $Symbol } from './types/symbol.js';
import { $Object } from './types/object.js';
import { $IteratorPrototype, $AsyncIteratorPrototype, $AsyncFromSyncIteratorPrototype } from './globals/iteration.js';
import { $StringConstructor, $StringPrototype } from './globals/string.js';
import { $ObjectConstructor, $ObjectPrototype, $ObjProto_toString } from './globals/object.js';
import { $FunctionPrototype, $FunctionConstructor } from './globals/function.js';
import { $NumberConstructor, $NumberPrototype } from './globals/number.js';
import { $BooleanConstructor, $BooleanPrototype } from './globals/boolean.js';
import { $SymbolConstructor, $SymbolPrototype } from './globals/symbol.js';
import { $ErrorConstructor, $ErrorPrototype, $EvalErrorConstructor, $EvalErrorPrototype, $RangeErrorConstructor, $RangeErrorPrototype, $ReferenceErrorConstructor, $ReferenceErrorPrototype, $SyntaxErrorConstructor, $SyntaxErrorPrototype, $TypeErrorConstructor, $TypeErrorPrototype, $URIErrorConstructor, $URIErrorPrototype } from './globals/error.js';
import { $ThrowTypeError } from './globals/throw-type-error.js';
import { IDisposable, Writable } from '@aurelia/kernel';
import { $GeneratorFunctionPrototype, $GeneratorPrototype, $GeneratorFunctionConstructor } from './globals/generator-function.js';
import { $PromiseConstructor, $PromisePrototype, $Promise_all, $Promise_resolve, $Promise_reject, $PromiseProto_then } from './globals/promise.js';
import { $AsyncFunctionPrototype, $AsyncFunctionConstructor } from './globals/async-function.js';
import { $AsyncGeneratorFunctionPrototype, $AsyncGeneratorFunctionConstructor, $AsyncGeneratorPrototype } from './globals/async-generator-function.js';
import { $ProxyConstructor } from './globals/proxy.js';
import { $Reflect } from './globals/reflect.js';
import { $Eval } from './globals/eval.js';
import { $IsFinite } from './globals/is-finite.js';
import { $IsNaN } from './globals/is-nan.js';
import { $ParseFloat } from './globals/parse-float.js';
import { $ParseInt } from './globals/parse-int.js';
import { $DecodeURI, $DecodeURIComponent, $EncodeURI, $EncodeURIComponent } from './globals/uri-handling.js';
export declare type $True = $Boolean<true>;
export declare type $False = $Boolean<false>;
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
export declare class Intrinsics implements IDisposable {
    readonly 'empty': $Empty;
    readonly 'undefined': $Undefined;
    readonly 'null': $Null;
    readonly 'true': $True;
    readonly 'false': $False;
    readonly 'NaN': $Number;
    readonly 'Infinity': $Number;
    readonly '-Infinity': $Number;
    readonly '0': $Number<0>;
    readonly '-0': $Number<-0>;
    readonly '': $String<''>;
    readonly '*': $String<'*'>;
    readonly '*default*': $String<'*default*'>;
    readonly 'default': $String<'default'>;
    readonly 'string': $String<'string'>;
    readonly 'number': $String<'number'>;
    readonly 'length': $String<'length'>;
    readonly 'next': $String<'next'>;
    readonly 'return': $String<'return'>;
    readonly 'throw': $String<'throw'>;
    readonly 'call': $String<'call'>;
    readonly 'all': $String<'all'>;
    readonly 'race': $String<'race'>;
    readonly 'reject': $String<'reject'>;
    readonly 'resolve': $String<'resolve'>;
    readonly 'finally': $String<'finally'>;
    readonly 'then': $String<'then'>;
    readonly 'catch': $String<'catch'>;
    readonly 'message': $String<'message'>;
    readonly 'proxy': $String<'proxy'>;
    readonly 'revoke': $String<'revoke'>;
    readonly 'revocable': $String<'revocable'>;
    readonly '$arguments': $String<'arguments'>;
    readonly '$callee': $String<'callee'>;
    readonly '$constructor': $String<'constructor'>;
    readonly '$hasOwnProperty': $String<'hasOwnProperty'>;
    readonly '$isPrototypeOf': $String<'isPrototypeOf'>;
    readonly '$propertyIsEnumerable': $String<'propertyIsEnumerable'>;
    readonly '$toLocaleString': $String<'toLocaleString'>;
    readonly '$prototype': $String<'prototype'>;
    readonly '$name': $String<'name'>;
    readonly '$toString': $String<'toString'>;
    readonly '$valueOf': $String<'valueOf'>;
    readonly '$enumerable': $String<'enumerable'>;
    readonly '$configurable': $String<'configurable'>;
    readonly '$writable': $String<'writable'>;
    readonly '$value': $String<'value'>;
    readonly '$return': $String<'return'>;
    readonly '$done': $String<'done'>;
    readonly '$getPrototypeOf': $String<'getPrototypeOf'>;
    readonly '$setPrototypeOf': $String<'setPrototypeOf'>;
    readonly '$isExtensible': $String<'isExtensible'>;
    readonly '$preventExtensions': $String<'preventExtensions'>;
    readonly '$getOwnPropertyDescriptor': $String<'getOwnPropertyDescriptor'>;
    readonly '$defineProperty': $String<'defineProperty'>;
    readonly '$has': $String<'has'>;
    readonly '$get': $String<'get'>;
    readonly '$set': $String<'set'>;
    readonly '$deleteProperty': $String<'deleteProperty'>;
    readonly '$ownKeys': $String<'ownKeys'>;
    readonly '$apply': $String<'apply'>;
    readonly '$construct': $String<'construct'>;
    readonly '$bind': $String<'bind'>;
    readonly '$call': $String<'call'>;
    readonly '$assign': $String<'assign'>;
    readonly '$create': $String<'create'>;
    readonly '$defineProperties': $String<'defineProperties'>;
    readonly '$entries': $String<'entries'>;
    readonly '$freeze': $String<'freeze'>;
    readonly '$fromEntries': $String<'fromEntries'>;
    readonly '$getOwnPropertyDescriptors': $String<'getOwnPropertyDescriptors'>;
    readonly '$getOwnPropertyNames': $String<'getOwnPropertyNames'>;
    readonly '$getOwnPropertySymbols': $String<'getOwnPropertySymbols'>;
    readonly '$is': $String<'is'>;
    readonly '$isFrozen': $String<'isFrozen'>;
    readonly '$isSealed': $String<'isSealed'>;
    readonly '$keys': $String<'keys'>;
    readonly '$seal': $String<'seal'>;
    readonly '$values': $String<'values'>;
    readonly '@@asyncIterator': $Symbol<$String<'Symbol.asyncIterator'>>;
    readonly '@@hasInstance': $Symbol<$String<'Symbol.hasInstance'>>;
    readonly '@@isConcatSpreadable': $Symbol<$String<'Symbol.isConcatSpreadable'>>;
    readonly '@@iterator': $Symbol<$String<'Symbol.iterator'>>;
    readonly '@@match': $Symbol<$String<'Symbol.match'>>;
    readonly '@@replace': $Symbol<$String<'Symbol.replace'>>;
    readonly '@@search': $Symbol<$String<'Symbol.search'>>;
    readonly '@@species': $Symbol<$String<'Symbol.species'>>;
    readonly '@@split': $Symbol<$String<'Symbol.split'>>;
    readonly '@@toPrimitive': $Symbol<$String<'Symbol.toPrimitive'>>;
    readonly '@@toStringTag': $Symbol<$String<'Symbol.toStringTag'>>;
    readonly '@@unscopables': $Symbol<$String<'Symbol.unscopables'>>;
    readonly '%ObjectPrototype%': $ObjectPrototype;
    readonly '%FunctionPrototype%': $FunctionPrototype;
    readonly '%Object%': $ObjectConstructor;
    readonly '%Function%': $FunctionConstructor;
    readonly '%ThrowTypeError%': $ThrowTypeError;
    readonly '%ObjProto_toString%': $ObjProto_toString;
    readonly '%String%': $StringConstructor;
    readonly '%StringPrototype%': $StringPrototype;
    readonly '%Number%': $NumberConstructor;
    readonly '%NumberPrototype%': $NumberPrototype;
    readonly '%Boolean%': $BooleanConstructor;
    readonly '%BooleanPrototype%': $BooleanPrototype;
    readonly '%Symbol%': $SymbolConstructor;
    readonly '%SymbolPrototype%': $SymbolPrototype;
    readonly '%Error%': $ErrorConstructor;
    readonly '%ErrorPrototype%': $ErrorPrototype;
    readonly '%EvalError%': $EvalErrorConstructor;
    readonly '%EvalErrorPrototype%': $EvalErrorPrototype;
    readonly '%RangeError%': $RangeErrorConstructor;
    readonly '%RangeErrorPrototype%': $RangeErrorPrototype;
    readonly '%ReferenceError%': $ReferenceErrorConstructor;
    readonly '%ReferenceErrorPrototype%': $ReferenceErrorPrototype;
    readonly '%SyntaxError%': $SyntaxErrorConstructor;
    readonly '%SyntaxErrorPrototype%': $SyntaxErrorPrototype;
    readonly '%TypeError%': $TypeErrorConstructor;
    readonly '%TypeErrorPrototype%': $TypeErrorPrototype;
    readonly '%URIError%': $URIErrorConstructor;
    readonly '%URIErrorPrototype%': $URIErrorPrototype;
    readonly '%IteratorPrototype%': $IteratorPrototype;
    readonly '%GeneratorFunction%': $GeneratorFunctionConstructor;
    readonly '%Generator%': $GeneratorFunctionPrototype;
    readonly '%GeneratorPrototype%': $GeneratorPrototype;
    readonly '%Promise%': $PromiseConstructor;
    readonly '%PromisePrototype%': $PromisePrototype;
    readonly '%PromiseProto_then%': $PromiseProto_then;
    readonly '%Promise_all%': $Promise_all;
    readonly '%Promise_resolve%': $Promise_resolve;
    readonly '%Promise_reject%': $Promise_reject;
    readonly '%AsyncFunction%': $AsyncFunctionConstructor;
    readonly '%AsyncFunctionPrototype%': $AsyncFunctionPrototype;
    readonly '%AsyncIteratorPrototype%': $AsyncIteratorPrototype;
    readonly '%AsyncFromSyncIteratorPrototype%': $AsyncFromSyncIteratorPrototype;
    readonly '%AsyncGeneratorFunction%': $AsyncGeneratorFunctionConstructor;
    readonly '%AsyncGenerator%': $AsyncGeneratorFunctionPrototype;
    readonly '%AsyncGeneratorPrototype%': $AsyncGeneratorPrototype;
    readonly '%RegExpPrototype%': $Object<'%RegExpPrototype%'>;
    readonly '%DatePrototype%': $Object<'%DatePrototype%'>;
    readonly '%ArrayIteratorPrototype%': $Object<'%ArrayIteratorPrototype%'>;
    readonly '%MapIteratorPrototype%': $Object<'%MapIteratorPrototype%'>;
    readonly '%SetIteratorPrototype%': $Object<'%SetIteratorPrototype%'>;
    readonly '%StringIteratorPrototype%': $Object<'%StringIteratorPrototype%'>;
    readonly '%ArrayPrototype%': $Object<'%ArrayPrototype%'>;
    readonly '%MapPrototype%': $Object<'%MapPrototype%'>;
    readonly '%WeakMapPrototype%': $Object<'%WeakMapPrototype%'>;
    readonly '%SetPrototype%': $Object<'%SetPrototype%'>;
    readonly '%WeakSetPrototype%': $Object<'%WeakSetPrototype%'>;
    readonly '%DataViewPrototype%': $Object<'%DataViewPrototype%'>;
    readonly '%ArrayBufferPrototype%': $Object<'%ArrayBufferPrototype%'>;
    readonly '%SharedArrayBufferPrototype%': $Object<'%SharedArrayBufferPrototype%'>;
    readonly '%TypedArrayPrototype%': $Object<'%TypedArrayPrototype%'>;
    readonly '%Float32ArrayPrototype%': $Object<'%Float32ArrayPrototype%'>;
    readonly '%Float64ArrayPrototype%': $Object<'%Float64ArrayPrototype%'>;
    readonly '%Int8ArrayPrototype%': $Object<'%Int8ArrayPrototype%'>;
    readonly '%Int16ArrayPrototype%': $Object<'%Int16ArrayPrototype%'>;
    readonly '%Int32ArrayPrototype%': $Object<'%Int32ArrayPrototype%'>;
    readonly '%Uint8ArrayPrototype%': $Object<'%Uint8ArrayPrototype%'>;
    readonly '%Uint8ClampedArrayPrototype%': $Object<'%Uint8ClampedArrayPrototype%'>;
    readonly '%Uint16ArrayPrototype%': $Object<'%Uint16ArrayPrototype%'>;
    readonly '%Uint32ArrayPrototype%': $Object<'%Uint32ArrayPrototype%'>;
    readonly '%RegExp%': $Object<'%RegExp%'>;
    readonly '%Date%': $Object<'%Date%'>;
    readonly '%Array%': $Object<'%Array%'>;
    readonly '%Map%': $Object<'%Map%'>;
    readonly '%WeakMap%': $Object<'%WeakMap%'>;
    readonly '%Set%': $Object<'%Set%'>;
    readonly '%WeakSet%': $Object<'%WeakSet%'>;
    readonly '%DataView%': $Object<'%DataView%'>;
    readonly '%ArrayBuffer%': $Object<'%ArrayBuffer%'>;
    readonly '%SharedArrayBuffer%': $Object<'%SharedArrayBuffer%'>;
    readonly '%TypedArray%': $Object<'%TypedArray%'>;
    readonly '%Float32Array%': $Object<'%Float32Array%'>;
    readonly '%Float64Array%': $Object<'%Float64Array%'>;
    readonly '%Int8Array%': $Object<'%Int8Array%'>;
    readonly '%Int16Array%': $Object<'%Int16Array%'>;
    readonly '%Int32Array%': $Object<'%Int32Array%'>;
    readonly '%Uint8Array%': $Object<'%Uint8Array%'>;
    readonly '%Uint8ClampedArray%': $Object<'%Uint8ClampedArray%'>;
    readonly '%Uint16Array%': $Object<'%Uint16Array%'>;
    readonly '%Uint32Array%': $Object<'%Uint32Array%'>;
    readonly '%Atomics%': $Object<'%Atomics%'>;
    readonly '%JSON%': $Object<'%JSON%'>;
    readonly '%Math%': $Object<'%Math%'>;
    readonly '%Reflect%': $Reflect;
    readonly '%Proxy%': $ProxyConstructor;
    readonly '%decodeURI%': $DecodeURI;
    readonly '%decodeURIComponent%': $DecodeURIComponent;
    readonly '%encodeURI%': $EncodeURI;
    readonly '%encodeURIComponent%': $EncodeURIComponent;
    readonly '%eval%': $Eval;
    readonly '%isFinite%': $IsFinite;
    readonly '%isNaN%': $IsNaN;
    readonly '%parseFloat%': $ParseFloat;
    readonly '%parseInt%': $ParseInt;
    readonly '%JSONParse%': $Object<'%JSONParse%'>;
    readonly '%JSONStringify%': $Object<'%JSONStringify%'>;
    readonly '%ArrayProto_entries%': $Object<'%ArrayProto_entries%'>;
    readonly '%ArrayProto_forEach%': $Object<'%ArrayProto_forEach%'>;
    readonly '%ArrayProto_keys%': $Object<'%ArrayProto_keys%'>;
    readonly '%ArrayProto_values%': $Object<'%ArrayProto_values%'>;
    readonly '%ObjProto_valueOf%': $Object<'%ObjProto_valueOf%'>;
    constructor(realm: Realm);
    dispose(this: Writable<Partial<Intrinsics>>): void;
}
export declare type IntrinsicObjectKey = {
    [K in keyof Intrinsics]: Intrinsics[K] extends $Object ? K : never;
} extends {
    [K in keyof Intrinsics]: infer U;
} ? ({} extends U ? never : U) : never;
//# sourceMappingURL=intrinsics.d.ts.map