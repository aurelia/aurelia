import {
  Realm,
  ExecutionContext,
} from './realm';
import {
  $Boolean,
} from './types/boolean';
import {
  $Empty,
} from './types/empty';
import {
  $Undefined,
} from './types/undefined';
import {
  $Null,
} from './types/null';
import {
  $Number,
} from './types/number';
import {
  $String,
} from './types/string';
import {
  $Symbol,
} from './types/symbol';
import {
  $Object,
} from './types/object';
import {
  $Function,
} from './types/function';
import {
  $IteratorPrototype,
} from './iteration';
import {
  $StringConstructor,
  $StringPrototype,
} from './globals/string';
import {
  $ObjectConstructor,
  $ObjectPrototype,
  $ObjProto_toString,
} from './globals/object';
import {
  $FunctionPrototype,
  $FunctionConstructor,
  $FunctionPrototype_call,
} from './globals/function';
import {
  CompletionType,
} from './types/_shared';
import {
  $NumberConstructor,
  $NumberPrototype,
} from './globals/number';

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
export class Intrinsics {
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
  public readonly 'call': $String<'call'>;
  public readonly '$arguments': $String<'arguments'>;
  public readonly '$callee': $String<'callee'>;
  public readonly '$constructor': $String<'constructor'>;
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

  public readonly '%ObjectPrototype%': $Object<'%ObjectPrototype%'>;
  public readonly '%BooleanPrototype%': $Object<'%BooleanPrototype%'>;
  public readonly '%NumberPrototype%': $Object<'%NumberPrototype%'>;
  public readonly '%StringPrototype%': $Object<'%StringPrototype%'>;
  public readonly '%SymbolPrototype%': $Object<'%SymbolPrototype%'>;
  public readonly '%PromisePrototype%': $Object<'%PromisePrototype%'>;
  public readonly '%RegExpPrototype%': $Object<'%RegExpPrototype%'>;
  public readonly '%DatePrototype%': $Object<'%DatePrototype%'>;

  public readonly '%FunctionPrototype%': $Object<'%FunctionPrototype%'>;
  public readonly '%AsyncFunctionPrototype%': $Object<'%AsyncFunctionPrototype%'>;

  public readonly '%Generator%': $Object<'%Generator%'>;
  public readonly '%AsyncGenerator%': $Object<'%AsyncGenerator%'>;

  public readonly '%IteratorPrototype%': $IteratorPrototype;
  public readonly '%ArrayIteratorPrototype%': $Object<'%ArrayIteratorPrototype%'>;
  public readonly '%MapIteratorPrototype%': $Object<'%MapIteratorPrototype%'>;
  public readonly '%SetIteratorPrototype%': $Object<'%SetIteratorPrototype%'>;
  public readonly '%StringIteratorPrototype%': $Object<'%StringIteratorPrototype%'>;
  public readonly '%GeneratorPrototype%': $Object<'%GeneratorPrototype%'>;

  public readonly '%AsyncIteratorPrototype%': $Object<'%AsyncIteratorPrototype%'>;
  public readonly '%AsyncFromSyncIteratorPrototype%': $Object<'%AsyncFromSyncIteratorPrototype%'>;
  public readonly '%AsyncGeneratorPrototype%': $Object<'%AsyncGeneratorPrototype%'>;

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

  public readonly '%ErrorPrototype%': $Object<'%ErrorPrototype%'>;
  public readonly '%EvalErrorPrototype%': $Object<'%EvalErrorPrototype%'>;
  public readonly '%RangeErrorPrototype%': $Object<'%RangeErrorPrototype%'>;
  public readonly '%ReferenceErrorPrototype%': $Object<'%ReferenceErrorPrototype%'>;
  public readonly '%SyntaxErrorPrototype%': $Object<'%SyntaxErrorPrototype%'>;
  public readonly '%TypeErrorPrototype%': $Object<'%TypeErrorPrototype%'>;
  public readonly '%URIErrorPrototype%': $Object<'%URIErrorPrototype%'>;

  public readonly '%Object%': $ObjectConstructor;
  public readonly '%Boolean%': $Object<'%Boolean%'>;
  public readonly '%Number%': $Object<'%Number%'>;
  public readonly '%String%': $StringConstructor;
  public readonly '%Symbol%': $Object<'%Symbol%'>;
  public readonly '%Promise%': $Object<'%Promise%'>;
  public readonly '%RegExp%': $Object<'%RegExp%'>;
  public readonly '%Date%': $Object<'%Date%'>;

  public readonly '%Function%': $Object<'%Function%'>;
  public readonly '%AsyncFunction%': $Object<'%AsyncFunction%'>;

  public readonly '%GeneratorFunction%': $Object<'%GeneratorFunction%'>;
  public readonly '%AsyncGeneratorFunction%': $Object<'%AsyncGeneratorFunction%'>;

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

  public readonly '%Error%': $Object<'%Error%'>;
  public readonly '%EvalError%': $Object<'%EvalError%'>;
  public readonly '%RangeError%': $Object<'%RangeError%'>;
  public readonly '%ReferenceError%': $Object<'%ReferenceError%'>;
  public readonly '%SyntaxError%': $Object<'%SyntaxError%'>;
  public readonly '%TypeError%': $Object<'%TypeError%'>;
  public readonly '%URIError%': $Object<'%URIError%'>;

  public readonly '%Atomics%': $Object<'%Atomics%'>;
  public readonly '%JSON%': $Object<'%JSON%'>;
  public readonly '%Math%': $Object<'%Math%'>;
  public readonly '%Reflect%': $Object<'%Reflect%'>;
  public readonly '%Proxy%': $Object<'%Proxy%'>;

  public readonly '%decodeURI%': $Object<'%decodeURI%'>;
  public readonly '%decodeURIComponent%': $Object<'%decodeURIComponent%'>;
  public readonly '%encodeURI%': $Object<'%encodeURI%'>;
  public readonly '%encodeURIComponent%': $Object<'%encodeURIComponent%'>;
  public readonly '%eval%': $Object<'%eval%'>;
  public readonly '%isFinite%': $Object<'%isFinite%'>;
  public readonly '%isNaN%': $Object<'%isNaN%'>;
  public readonly '%parseFloat%': $Object<'%parseFloat%'>;
  public readonly '%parseInt%': $Object<'%parseInt%'>;
  public readonly '%JSONParse%': $Object<'%JSONParse%'>;
  public readonly '%JSONStringify%': $Object<'%JSONStringify%'>;
  public readonly '%ThrowTypeError%': $Function<'%ThrowTypeError%'>;

  public readonly '%ArrayProto_entries%': $Object<'%ArrayProto_entries%'>;
  public readonly '%ArrayProto_forEach%': $Object<'%ArrayProto_forEach%'>;
  public readonly '%ArrayProto_keys%': $Object<'%ArrayProto_keys%'>;
  public readonly '%ArrayProto_values%': $Object<'%ArrayProto_values%'>;
  public readonly '%ObjProto_toString%': $ObjProto_toString;
  public readonly '%ObjProto_valueOf%': $Object<'%ObjProto_valueOf%'>;
  public readonly '%PromiseProto_then%': $Object<'%PromiseProto_then%'>;
  public readonly '%Promise_all%': $Object<'%Promise_all%'>;
  public readonly '%Promise_reject%': $Object<'%Promise_reject%'>;
  public readonly '%Promise_resolve%': $Object<'%Promise_resolve%'>;

  // http://www.ecma-international.org/ecma-262/#sec-createintrinsics
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
    this['call'] = new $String(realm, 'call');
    this['$arguments'] = new $String(realm, 'arguments');
    this['$callee'] = new $String(realm, 'callee');
    this['$constructor'] = new $String(realm, 'constructor');
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

    objectPrototype.$toString = this['%ObjProto_toString%'] = new $ObjProto_toString(realm, 'Object.prototype.toString', functionPrototype);

    functionPrototype.$call = new $FunctionPrototype_call(realm, 'Function.prototype.call', functionPrototype);

    const stringConstructor = this['%String%'] = new $StringConstructor(realm, functionPrototype);
    const stringPrototype = this['%StringPrototype%'] = new $StringPrototype(realm, objectPrototype);
    (stringConstructor.$prototype = stringPrototype).$constructor = stringConstructor;

    const numberConstructor = this['%Number%'] = new $NumberConstructor(realm, functionPrototype);
    const numberPrototype = this['%NumberPrototype%'] = new $NumberPrototype(realm, objectPrototype);
    (numberConstructor.$prototype = numberPrototype).$constructor = numberConstructor;

    this['%BooleanPrototype%'] = new $Object(realm, '%BooleanPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%SymbolPrototype%'] = new $Object(realm, '%SymbolPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%PromisePrototype%'] = new $Object(realm, '%PromisePrototype%', objectPrototype, CompletionType.normal, empty);
    this['%RegExpPrototype%'] = new $Object(realm, '%RegExpPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%DatePrototype%'] = new $Object(realm, '%DatePrototype%', objectPrototype, CompletionType.normal, empty);

    this['%AsyncFunctionPrototype%'] = new $Object(realm, '%AsyncFunctionPrototype%', functionPrototype, CompletionType.normal, empty);

    this['%Generator%'] = new $Object(realm, '%Generator%', functionPrototype, CompletionType.normal, empty);
    this['%AsyncGenerator%'] = new $Object(realm, '%AsyncGenerator%', functionPrototype, CompletionType.normal, empty);

    this['%IteratorPrototype%'] = new $IteratorPrototype(realm);
    this['%ArrayIteratorPrototype%'] = new $Object(realm, '%ArrayIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);
    this['%MapIteratorPrototype%'] = new $Object(realm, '%MapIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);
    this['%SetIteratorPrototype%'] = new $Object(realm, '%SetIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);
    this['%StringIteratorPrototype%'] = new $Object(realm, '%StringIteratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);
    this['%GeneratorPrototype%'] = new $Object(realm, '%GeneratorPrototype%', this['%IteratorPrototype%'], CompletionType.normal, empty);

    this['%AsyncIteratorPrototype%'] = new $Object(realm, '%AsyncIteratorPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%AsyncFromSyncIteratorPrototype%'] = new $Object(realm, '%AsyncFromSyncIteratorPrototype%', this['%AsyncIteratorPrototype%'], CompletionType.normal, empty);
    this['%AsyncGeneratorPrototype%'] = new $Object(realm, '%AsyncGeneratorPrototype%', this['%AsyncIteratorPrototype%'], CompletionType.normal, empty);

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

    this['%ErrorPrototype%'] = new $Object(realm, '%ErrorPrototype%', objectPrototype, CompletionType.normal, empty);
    this['%EvalErrorPrototype%'] = new $Object(realm, '%EvalErrorPrototype%', this['%ErrorPrototype%'], CompletionType.normal, empty);
    this['%RangeErrorPrototype%'] = new $Object(realm, '%RangeErrorPrototype%', this['%ErrorPrototype%'], CompletionType.normal, empty);
    this['%ReferenceErrorPrototype%'] = new $Object(realm, '%ReferenceErrorPrototype%', this['%ErrorPrototype%'], CompletionType.normal, empty);
    this['%SyntaxErrorPrototype%'] = new $Object(realm, '%SyntaxErrorPrototype%', this['%ErrorPrototype%'], CompletionType.normal, empty);
    this['%TypeErrorPrototype%'] = new $Object(realm, '%TypeErrorPrototype%', this['%ErrorPrototype%'], CompletionType.normal, empty);
    this['%URIErrorPrototype%'] = new $Object(realm, '%URIErrorPrototype%', this['%ErrorPrototype%'], CompletionType.normal, empty);

    this['%Boolean%'] = new $Object(realm, '%Boolean%', functionPrototype, CompletionType.normal, empty);
    this['%Symbol%'] = new $Object(realm, '%Symbol%', functionPrototype, CompletionType.normal, empty);
    this['%Promise%'] = new $Object(realm, '%Promise%', functionPrototype, CompletionType.normal, empty);
    this['%RegExp%'] = new $Object(realm, '%RegExp%', functionPrototype, CompletionType.normal, empty);
    this['%Date%'] = new $Object(realm, '%Date%', functionPrototype, CompletionType.normal, empty);

    this['%AsyncFunction%'] = new $Object(realm, '%AsyncFunction%', functionConstructor, CompletionType.normal, empty);

    this['%GeneratorFunction%'] = new $Object(realm, '%GeneratorFunction%', functionConstructor, CompletionType.normal, empty);
    this['%AsyncGeneratorFunction%'] = new $Object(realm, '%AsyncGeneratorFunction%', functionConstructor, CompletionType.normal, empty);

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

    this['%Error%'] = new $Object(realm, '%Error%', functionPrototype, CompletionType.normal, empty);
    this['%EvalError%'] = new $Object(realm, '%EvalError%', this['%Error%'], CompletionType.normal, empty);
    this['%RangeError%'] = new $Object(realm, '%RangeError%', this['%Error%'], CompletionType.normal, empty);
    this['%ReferenceError%'] = new $Object(realm, '%ReferenceError%', this['%Error%'], CompletionType.normal, empty);
    this['%SyntaxError%'] = new $Object(realm, '%SyntaxError%', this['%Error%'], CompletionType.normal, empty);
    this['%TypeError%'] = new $Object(realm, '%TypeError%', this['%Error%'], CompletionType.normal, empty);
    this['%URIError%'] = new $Object(realm, '%URIError%', this['%Error%'], CompletionType.normal, empty);

    this['%Atomics%'] = new $Object(realm, '%Atomics%', objectPrototype, CompletionType.normal, empty);
    this['%JSON%'] = new $Object(realm, '%JSON%', objectPrototype, CompletionType.normal, empty);
    this['%Math%'] = new $Object(realm, '%Math%', objectPrototype, CompletionType.normal, empty);
    this['%Reflect%'] = new $Object(realm, '%Reflect%', objectPrototype, CompletionType.normal, empty);
    this['%Proxy%'] = new $Object(realm, '%Proxy%', functionPrototype, CompletionType.normal, empty);

    this['%decodeURI%'] = new $Object(realm, '%decodeURI%', functionPrototype, CompletionType.normal, empty);
    this['%decodeURIComponent%'] = new $Object(realm, '%decodeURIComponent%', functionPrototype, CompletionType.normal, empty);
    this['%encodeURI%'] = new $Object(realm, '%encodeURI%', functionPrototype, CompletionType.normal, empty);
    this['%encodeURIComponent%'] = new $Object(realm, '%encodeURIComponent%', functionPrototype, CompletionType.normal, empty);
    this['%eval%'] = new $Object(realm, '%eval%', functionPrototype, CompletionType.normal, empty);
    this['%isFinite%'] = new $Object(realm, '%isFinite%', functionPrototype, CompletionType.normal, empty);
    this['%isNaN%'] = new $Object(realm, '%isNaN%', functionPrototype, CompletionType.normal, empty);
    this['%parseFloat%'] = new $Object(realm, '%parseFloat%', functionPrototype, CompletionType.normal, empty);
    this['%parseInt%'] = new $Object(realm, '%parseInt%', functionPrototype, CompletionType.normal, empty);
    this['%JSONParse%'] = new $Object(realm, '%JSONParse%', functionPrototype, CompletionType.normal, empty);
    this['%JSONStringify%'] = new $Object(realm, '%JSONStringify%', functionPrototype, CompletionType.normal, empty);
    this['%ThrowTypeError%'] = new $Function(realm, '%ThrowTypeError%', functionPrototype);

    this['%ArrayProto_entries%'] = new $Object(realm, '%ArrayProto_entries%', functionPrototype, CompletionType.normal, empty);
    this['%ArrayProto_forEach%'] = new $Object(realm, '%ArrayProto_forEach%', functionPrototype, CompletionType.normal, empty);
    this['%ArrayProto_keys%'] = new $Object(realm, '%ArrayProto_keys%', functionPrototype, CompletionType.normal, empty);
    this['%ArrayProto_values%'] = new $Object(realm, '%ArrayProto_values%', functionPrototype, CompletionType.normal, empty);
    this['%ObjProto_valueOf%'] = new $Object(realm, '%ObjProto_valueOf%', functionPrototype, CompletionType.normal, empty);
    this['%PromiseProto_then%'] = new $Object(realm, '%PromiseProto_then%', functionPrototype, CompletionType.normal, empty);
    this['%Promise_all%'] = new $Object(realm, '%Promise_all%', functionPrototype, CompletionType.normal, empty);
    this['%Promise_reject%'] = new $Object(realm, '%Promise_reject%', functionPrototype, CompletionType.normal, empty);
    this['%Promise_resolve%'] = new $Object(realm, '%Promise_resolve%', functionPrototype, CompletionType.normal, empty);
  }
}
