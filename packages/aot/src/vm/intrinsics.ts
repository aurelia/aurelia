import {
  $Empty,
  $Undefined,
  $Null,
  $Boolean,
  $Number,
  $String,
  $Symbol,
  $Object,
} from './value';
import { Host } from './host';

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

// http://www.ecma-international.org/ecma-262/#sec-createintrinsics
/* eslint-disable max-lines-per-function,@typescript-eslint/camelcase */
export function CreateIntrinsics(host: Host) {
  const _empty = new $Empty(host);
  const _undefined = new $Undefined(host);
  const _null = new $Null(host);
  const _true = new $Boolean(host, true);
  const _false = new $Boolean(host, false);
  const _NaN = new $Number(host, NaN);
  const _Infinity = new $Number(host, Infinity);
  const _NegativeInfinity = new $Number(host, -Infinity);
  const _Zero = new $Number(host, 0);
  const _NegativeZero = new $Number(host, -0);
  const _EmptyString = new $String(host, '');

  const _Symbol_asyncIterator = new $Symbol(host, new $String(host, 'Symbol.asyncIterator'));
  const _Symbol_hasInstance = new $Symbol(host, new $String(host, 'Symbol.hasInstance'));
  const _Symbol_isConcatSpreadable = new $Symbol(host, new $String(host, 'Symbol.isConcatSpreadable'));
  const _Symbol_iterator = new $Symbol(host, new $String(host, 'Symbol.iterator'));
  const _Symbol_match = new $Symbol(host, new $String(host, 'Symbol.match'));
  const _Symbol_replace = new $Symbol(host, new $String(host, 'Symbol.replace'));
  const _Symbol_search = new $Symbol(host, new $String(host, 'Symbol.search'));
  const _Symbol_species = new $Symbol(host, new $String(host, 'Symbol.species'));
  const _Symbol_split = new $Symbol(host, new $String(host, 'Symbol.split'));
  const _Symbol_toPrimitive = new $Symbol(host, new $String(host, 'Symbol.toPrimitive'));
  const _Symbol_toStringTag = new $Symbol(host, new $String(host, 'Symbol.toStringTag'));
  const _Symbol_unscopables = new $Symbol(host, new $String(host, 'Symbol.unscopables'));

  const _ObjectPrototype = new $Object(host, '%ObjectPrototype%', _null);
  const _BooleanPrototype = new $Object(host, '%BooleanPrototype%', _ObjectPrototype);
  const _NumberPrototype = new $Object(host, '%NumberPrototype%', _ObjectPrototype);
  const _StringPrototype = new $Object(host, '%StringPrototype%', _ObjectPrototype);
  const _SymbolPrototype = new $Object(host, '%SymbolPrototype%', _ObjectPrototype);
  const _PromisePrototype = new $Object(host, '%PromisePrototype%', _ObjectPrototype);
  const _RegExpPrototype = new $Object(host, '%RegExpPrototype%', _ObjectPrototype);
  const _DatePrototype = new $Object(host, '%DatePrototype%', _ObjectPrototype);

  const _FunctionPrototype = new $Object(host, '%FunctionPrototype%', _ObjectPrototype);
  const _AsyncFunctionPrototype = new $Object(host, '%AsyncFunctionPrototype%', _FunctionPrototype);

  const _Generator = new $Object(host, '%Generator%', _FunctionPrototype);
  const _AsyncGenerator = new $Object(host, '%AsyncGenerator%', _FunctionPrototype);

  const _IteratorPrototype = new $Object(host, '%IteratorPrototype%', _ObjectPrototype);
  const _ArrayIteratorPrototype = new $Object(host, '%ArrayIteratorPrototype%', _IteratorPrototype);
  const _MapIteratorPrototype = new $Object(host, '%MapIteratorPrototype%', _IteratorPrototype);
  const _SetIteratorPrototype = new $Object(host, '%SetIteratorPrototype%', _IteratorPrototype);
  const _StringIteratorPrototype = new $Object(host, '%StringIteratorPrototype%', _IteratorPrototype);
  const _GeneratorPrototype = new $Object(host, '%GeneratorPrototype%', _IteratorPrototype);

  const _AsyncIteratorPrototype = new $Object(host, '%AsyncIteratorPrototype%', _ObjectPrototype);
  const _AsyncFromSyncIteratorPrototype = new $Object(host, '%AsyncFromSyncIteratorPrototype%', _AsyncIteratorPrototype);
  const _AsyncGeneratorPrototype = new $Object(host, '%AsyncGeneratorPrototype%', _AsyncIteratorPrototype);

  const _ArrayPrototype = new $Object(host, '%ArrayPrototype%', _ObjectPrototype);
  const _MapPrototype = new $Object(host, '%MapPrototype%', _ObjectPrototype);
  const _WeakMapPrototype = new $Object(host, '%WeakMapPrototype%', _ObjectPrototype);
  const _SetPrototype = new $Object(host, '%SetPrototype%', _ObjectPrototype);
  const _WeakSetPrototype = new $Object(host, '%WeakSetPrototype%', _ObjectPrototype);
  const _DataViewPrototype = new $Object(host, '%DataViewPrototype%', _ObjectPrototype);
  const _ArrayBufferPrototype = new $Object(host, '%ArrayBufferPrototype%', _ObjectPrototype);
  const _SharedArrayBufferPrototype = new $Object(host, '%SharedArrayBufferPrototype%', _ObjectPrototype);

  const _TypedArrayPrototype = new $Object(host, '%TypedArrayPrototype%', _ObjectPrototype);
  const _Float32ArrayPrototype = new $Object(host, '%Float32ArrayPrototype%', _TypedArrayPrototype);
  const _Float64ArrayPrototype = new $Object(host, '%Float64ArrayPrototype%', _TypedArrayPrototype);
  const _Int8ArrayPrototype = new $Object(host, '%Int8ArrayPrototype%', _TypedArrayPrototype);
  const _Int16ArrayPrototype = new $Object(host, '%Int16ArrayPrototype%', _TypedArrayPrototype);
  const _Int32ArrayPrototype = new $Object(host, '%Int32ArrayPrototype%', _TypedArrayPrototype);
  const _Uint8ArrayPrototype = new $Object(host, '%Uint8ArrayPrototype%', _TypedArrayPrototype);
  const _Uint8ClampedArrayPrototype = new $Object(host, '%Uint8ClampedArrayPrototype%', _TypedArrayPrototype);
  const _Uint16ArrayPrototype = new $Object(host, '%Uint16ArrayPrototype%', _TypedArrayPrototype);
  const _Uint32ArrayPrototype = new $Object(host, '%Uint32ArrayPrototype%', _TypedArrayPrototype);

  const _ErrorPrototype = new $Object(host, '%ErrorPrototype%', _ObjectPrototype);
  const _EvalErrorPrototype = new $Object(host, '%EvalErrorPrototype%', _ErrorPrototype);
  const _RangeErrorPrototype = new $Object(host, '%RangeErrorPrototype%', _ErrorPrototype);
  const _ReferenceErrorPrototype = new $Object(host, '%ReferenceErrorPrototype%', _ErrorPrototype);
  const _SyntaxErrorPrototype = new $Object(host, '%SyntaxErrorPrototype%', _ErrorPrototype);
  const _TypeErrorPrototype = new $Object(host, '%TypeErrorPrototype%', _ErrorPrototype);
  const _URIErrorPrototype = new $Object(host, '%URIErrorPrototype%', _ErrorPrototype);

  const _Object = new $Object(host, '%Object%', _FunctionPrototype);
  const _Boolean = new $Object(host, '%Boolean%', _FunctionPrototype);
  const _Number = new $Object(host, '%Number%', _FunctionPrototype);
  const _String = new $Object(host, '%String%', _FunctionPrototype);
  const _Symbol = new $Object(host, '%Symbol%', _FunctionPrototype);
  const _Promise = new $Object(host, '%Promise%', _FunctionPrototype);
  const _RegExp = new $Object(host, '%RegExp%', _FunctionPrototype);
  const _Date = new $Object(host, '%Date%', _FunctionPrototype);

  const _Function = new $Object(host, '%Function%', _FunctionPrototype);
  const _AsyncFunction = new $Object(host, '%AsyncFunction%', _Function);

  const _GeneratorFunction = new $Object(host, '%GeneratorFunction%', _Function);
  const _AsyncGeneratorFunction = new $Object(host, '%AsyncGeneratorFunction%', _Function);

  const _Array = new $Object(host, '%Array%', _FunctionPrototype);
  const _Map = new $Object(host, '%Map%', _FunctionPrototype);
  const _WeakMap = new $Object(host, '%WeakMap%', _FunctionPrototype);
  const _Set = new $Object(host, '%Set%', _FunctionPrototype);
  const _WeakSet = new $Object(host, '%WeakSet%', _FunctionPrototype);
  const _DataView = new $Object(host, '%DataView%', _FunctionPrototype);
  const _ArrayBuffer = new $Object(host, '%ArrayBuffer%', _FunctionPrototype);
  const _SharedArrayBuffer = new $Object(host, '%SharedArrayBuffer%', _FunctionPrototype);

  const _TypedArray = new $Object(host, '%TypedArray%', _FunctionPrototype);
  const _Float32Array = new $Object(host, '%Float32Array%', _TypedArray);
  const _Float64Array = new $Object(host, '%Float64Array%', _TypedArray);
  const _Int8Array = new $Object(host, '%Int8Array%', _TypedArray);
  const _Int16Array = new $Object(host, '%Int16Array%', _TypedArray);
  const _Int32Array = new $Object(host, '%Int32Array%', _TypedArray);
  const _Uint8Array = new $Object(host, '%Uint8Array%', _TypedArray);
  const _Uint8ClampedArray = new $Object(host, '%Uint8ClampedArray%', _TypedArray);
  const _Uint16Array = new $Object(host, '%Uint16Array%', _TypedArray);
  const _Uint32Array = new $Object(host, '%Uint32Array%', _TypedArray);

  const _Error = new $Object(host, '%Error%', _FunctionPrototype);
  const _EvalError = new $Object(host, '%EvalError%', _Error);
  const _RangeError = new $Object(host, '%RangeError%', _Error);
  const _ReferenceError = new $Object(host, '%ReferenceError%', _Error);
  const _SyntaxError = new $Object(host, '%SyntaxError%', _Error);
  const _TypeError = new $Object(host, '%TypeError%', _Error);
  const _URIError = new $Object(host, '%URIError%', _Error);

  const _Atomics = new $Object(host, '%Atomics%', _ObjectPrototype);
  const _JSON = new $Object(host, '%JSON%', _ObjectPrototype);
  const _Math = new $Object(host, '%Math%', _ObjectPrototype);
  const _Reflect = new $Object(host, '%Reflect%', _ObjectPrototype);
  const _Proxy = new $Object(host, '%Proxy%', _FunctionPrototype);

  const _decodeURI = new $Object(host, '%decodeURI%', _FunctionPrototype);
  const _decodeURIComponent = new $Object(host, '%decodeURIComponent%', _FunctionPrototype);
  const _encodeURI = new $Object(host, '%encodeURI%', _FunctionPrototype);
  const _encodeURIComponent = new $Object(host, '%encodeURIComponent%', _FunctionPrototype);
  const _eval = new $Object(host, '%eval%', _FunctionPrototype);
  const _isFinite = new $Object(host, '%isFinite%', _FunctionPrototype);
  const _isNaN = new $Object(host, '%isNaN%', _FunctionPrototype);
  const _parseFloat = new $Object(host, '%parseFloat%', _FunctionPrototype);
  const _parseInt = new $Object(host, '%parseInt%', _FunctionPrototype);
  const _JSONParse = new $Object(host, '%JSONParse%', _FunctionPrototype);
  const _JSONStringify = new $Object(host, '%JSONStringify%', _FunctionPrototype);
  const _ThrowTypeError = new $Object(host, '%ThrowTypeError%', _FunctionPrototype);

  const _ArrayProto_entries = new $Object(host, '%ArrayProto_entries%', _FunctionPrototype);
  const _ArrayProto_forEach = new $Object(host, '%ArrayProto_forEach%', _FunctionPrototype);
  const _ArrayProto_keys = new $Object(host, '%ArrayProto_keys%', _FunctionPrototype);
  const _ArrayProto_values = new $Object(host, '%ArrayProto_values%', _FunctionPrototype);
  const _ObjProto_toString = new $Object(host, '%ObjProto_toString%', _FunctionPrototype);
  const _ObjProto_valueOf = new $Object(host, '%ObjProto_valueOf%', _FunctionPrototype);
  const _PromiseProto_then = new $Object(host, '%PromiseProto_then%', _FunctionPrototype);
  const _Promise_all = new $Object(host, '%Promise_all%', _FunctionPrototype);
  const _Promise_reject = new $Object(host, '%Promise_reject%', _FunctionPrototype);
  const _Promise_resolve = new $Object(host, '%Promise_resolve%', _FunctionPrototype);

  return Object.assign(Object.create(null) as {}, {
    'empty': _empty,
    'undefined': _undefined,
    'null': _null,
    'true': _true,
    'false': _false,
    'NaN': _NaN,
    'Infinity': _Infinity,
    '-Infinity': _NegativeInfinity,
    '0': _Zero,
    '-0': _NegativeZero,
    '': _EmptyString,

    '@@asyncIterator': _Symbol_asyncIterator,
    '@@hasInstance': _Symbol_hasInstance,
    '@@isConcatSpreadable': _Symbol_isConcatSpreadable,
    '@@iterator': _Symbol_iterator,
    '@@match': _Symbol_match,
    '@@replace': _Symbol_replace,
    '@@search': _Symbol_search,
    '@@species': _Symbol_species,
    '@@split': _Symbol_split,
    '@@toPrimitive': _Symbol_toPrimitive,
    '@@toStringTag': _Symbol_toStringTag,
    '@@unscopables': _Symbol_unscopables,

    '%ObjectPrototype%': _ObjectPrototype,
    '%BooleanPrototype%': _BooleanPrototype,
    '%NumberPrototype%': _NumberPrototype,
    '%StringPrototype%': _StringPrototype,
    '%SymbolPrototype%': _SymbolPrototype,
    '%PromisePrototype%': _PromisePrototype,
    '%RegExpPrototype%': _RegExpPrototype,
    '%DatePrototype%': _DatePrototype,

    '%FunctionPrototype%': _FunctionPrototype,
    '%AsyncFunctionPrototype%': _AsyncFunctionPrototype,

    '%Generator%': _Generator,
    '%AsyncGenerator%': _AsyncGenerator,

    '%IteratorPrototype%': _IteratorPrototype,
    '%ArrayIteratorPrototype%': _ArrayIteratorPrototype,
    '%MapIteratorPrototype%': _MapIteratorPrototype,
    '%SetIteratorPrototype%': _SetIteratorPrototype,
    '%StringIteratorPrototype%': _StringIteratorPrototype,
    '%GeneratorPrototype%': _GeneratorPrototype,

    '%AsyncIteratorPrototype%': _AsyncIteratorPrototype,
    '%AsyncFromSyncIteratorPrototype%': _AsyncFromSyncIteratorPrototype,
    '%AsyncGeneratorPrototype%': _AsyncGeneratorPrototype,

    '%ArrayPrototype%': _ArrayPrototype,
    '%MapPrototype%': _MapPrototype,
    '%WeakMapPrototype%': _WeakMapPrototype,
    '%SetPrototype%': _SetPrototype,
    '%WeakSetPrototype%': _WeakSetPrototype,
    '%DataViewPrototype%': _DataViewPrototype,
    '%ArrayBufferPrototype%': _ArrayBufferPrototype,
    '%SharedArrayBufferPrototype%': _SharedArrayBufferPrototype,

    '%TypedArrayPrototype%': _TypedArrayPrototype,
    '%Float32ArrayPrototype%': _Float32ArrayPrototype,
    '%Float64ArrayPrototype%': _Float64ArrayPrototype,
    '%Int8ArrayPrototype%': _Int8ArrayPrototype,
    '%Int16ArrayPrototype%': _Int16ArrayPrototype,
    '%Int32ArrayPrototype%': _Int32ArrayPrototype,
    '%Uint8ArrayPrototype%': _Uint8ArrayPrototype,
    '%Uint8ClampedArrayPrototype%': _Uint8ClampedArrayPrototype,
    '%Uint16ArrayPrototype%': _Uint16ArrayPrototype,
    '%Uint32ArrayPrototype%': _Uint32ArrayPrototype,

    '%ErrorPrototype%': _ErrorPrototype,
    '%EvalErrorPrototype%': _EvalErrorPrototype,
    '%RangeErrorPrototype%': _RangeErrorPrototype,
    '%ReferenceErrorPrototype%': _ReferenceErrorPrototype,
    '%SyntaxErrorPrototype%': _SyntaxErrorPrototype,
    '%TypeErrorPrototype%': _TypeErrorPrototype,
    '%URIErrorPrototype%': _URIErrorPrototype,

    '%Object%': _Object,
    '%Boolean%': _Boolean,
    '%Number%': _Number,
    '%String%': _String,
    '%Symbol%': _Symbol,
    '%Promise%': _Promise,
    '%RegExp%': _RegExp,
    '%Date%': _Date,

    '%Function%': _Function,
    '%AsyncFunction%': _AsyncFunction,

    '%GeneratorFunction%': _GeneratorFunction,
    '%AsyncGeneratorFunction%': _AsyncGeneratorFunction,

    '%Array%': _Array,
    '%Map%': _Map,
    '%WeakMap%': _WeakMap,
    '%Set%': _Set,
    '%WeakSet%': _WeakSet,
    '%DataView%': _DataView,
    '%ArrayBuffer%': _ArrayBuffer,
    '%SharedArrayBuffer%': _SharedArrayBuffer,

    '%TypedArray%': _TypedArray,
    '%Float32Array%': _Float32Array,
    '%Float64Array%': _Float64Array,
    '%Int8Array%': _Int8Array,
    '%Int16Array%': _Int16Array,
    '%Int32Array%': _Int32Array,
    '%Uint8Array%': _Uint8Array,
    '%Uint8ClampedArray%': _Uint8ClampedArray,
    '%Uint16Array%': _Uint16Array,
    '%Uint32Array%': _Uint32Array,

    '%Error%': _Error,
    '%EvalError%': _EvalError,
    '%RangeError%': _RangeError,
    '%ReferenceError%': _ReferenceError,
    '%SyntaxError%': _SyntaxError,
    '%TypeError%': _TypeError,
    '%URIError%': _URIError,

    '%Atomics%': _Atomics,
    '%JSON%': _JSON,
    '%Math%': _Math,
    '%Reflect%': _Reflect,
    '%Proxy%': _Proxy,

    '%decodeURI%': _decodeURI,
    '%decodeURIComponent%': _decodeURIComponent,
    '%encodeURI%': _encodeURI,
    '%encodeURIComponent%': _encodeURIComponent,
    '%eval%': _eval,
    '%isFinite%': _isFinite,
    '%isNaN%': _isNaN,
    '%parseFloat%': _parseFloat,
    '%parseInt%': _parseInt,
    '%JSONParse%': _JSONParse,
    '%JSONStringify%': _JSONStringify,
    '%ThrowTypeError%': _ThrowTypeError,

    '%ArrayProto_entries%': _ArrayProto_entries,
    '%ArrayProto_forEach%': _ArrayProto_forEach,
    '%ArrayProto_keys%': _ArrayProto_keys,
    '%ArrayProto_values%': _ArrayProto_values,
    '%ObjProto_toString%': _ObjProto_toString,
    '%ObjProto_valueOf%': _ObjProto_valueOf,
    '%PromiseProto_then%': _PromiseProto_then,
    '%Promise_all%': _Promise_all,
    '%Promise_reject%': _Promise_reject,
    '%Promise_resolve%': _Promise_resolve,
  } as const);
}

export type Intrinsics = ReturnType<typeof CreateIntrinsics>;
