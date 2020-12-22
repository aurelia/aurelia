"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intrinsics = void 0;
const realm_js_1 = require("./realm.js");
const boolean_js_1 = require("./types/boolean.js");
const empty_js_1 = require("./types/empty.js");
const undefined_js_1 = require("./types/undefined.js");
const null_js_1 = require("./types/null.js");
const number_js_1 = require("./types/number.js");
const string_js_1 = require("./types/string.js");
const symbol_js_1 = require("./types/symbol.js");
const object_js_1 = require("./types/object.js");
const iteration_js_1 = require("./globals/iteration.js");
const string_js_2 = require("./globals/string.js");
const object_js_2 = require("./globals/object.js");
const function_js_1 = require("./globals/function.js");
const number_js_2 = require("./globals/number.js");
const boolean_js_2 = require("./globals/boolean.js");
const symbol_js_2 = require("./globals/symbol.js");
const error_js_1 = require("./globals/error.js");
const throw_type_error_js_1 = require("./globals/throw-type-error.js");
const generator_function_js_1 = require("./globals/generator-function.js");
const promise_js_1 = require("./globals/promise.js");
const _shared_js_1 = require("./globals/_shared.js");
const async_function_js_1 = require("./globals/async-function.js");
const async_generator_function_js_1 = require("./globals/async-generator-function.js");
const proxy_js_1 = require("./globals/proxy.js");
const reflect_js_1 = require("./globals/reflect.js");
const eval_js_1 = require("./globals/eval.js");
const is_finite_js_1 = require("./globals/is-finite.js");
const is_nan_js_1 = require("./globals/is-nan.js");
const parse_float_js_1 = require("./globals/parse-float.js");
const parse_int_js_1 = require("./globals/parse-int.js");
const uri_handling_js_1 = require("./globals/uri-handling.js");
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
class Intrinsics {
    // http://www.ecma-international.org/ecma-262/#sec-createintrinsics
    // 8.2.2 CreateIntrinsics ( realmRec )
    constructor(realm) {
        realm['[[Intrinsics]]'] = this;
        const empty = this['empty'] = new empty_js_1.$Empty(realm);
        this['undefined'] = new undefined_js_1.$Undefined(realm);
        this['null'] = new null_js_1.$Null(realm);
        // Synthetic root context for intrinsics that need the context to be there during initialization.
        // Creating a valid ExecutionContext requires the null value, which is why we do it right here and neither earlier nor later.
        const root = new realm_js_1.ExecutionContext(realm);
        root.Function = this['null'];
        root.ScriptOrModule = this['null'];
        realm.stack.push(root);
        this['true'] = new boolean_js_1.$Boolean(realm, true);
        this['false'] = new boolean_js_1.$Boolean(realm, false);
        this['NaN'] = new number_js_1.$Number(realm, NaN);
        this['Infinity'] = new number_js_1.$Number(realm, Infinity);
        this['-Infinity'] = new number_js_1.$Number(realm, -Infinity);
        this['0'] = new number_js_1.$Number(realm, 0);
        this['-0'] = new number_js_1.$Number(realm, -0);
        this[''] = new string_js_1.$String(realm, '');
        this['*'] = new string_js_1.$String(realm, '*');
        this['*default*'] = new string_js_1.$String(realm, '*default*');
        this['default'] = new string_js_1.$String(realm, 'default');
        this['string'] = new string_js_1.$String(realm, 'string');
        this['number'] = new string_js_1.$String(realm, 'number');
        this['length'] = new string_js_1.$String(realm, 'length');
        this['next'] = new string_js_1.$String(realm, 'next');
        this['return'] = new string_js_1.$String(realm, 'return');
        this['throw'] = new string_js_1.$String(realm, 'throw');
        this['call'] = new string_js_1.$String(realm, 'call');
        this['all'] = new string_js_1.$String(realm, 'all');
        this['race'] = new string_js_1.$String(realm, 'race');
        this['reject'] = new string_js_1.$String(realm, 'reject');
        this['resolve'] = new string_js_1.$String(realm, 'resolve');
        this['finally'] = new string_js_1.$String(realm, 'finally');
        this['then'] = new string_js_1.$String(realm, 'then');
        this['catch'] = new string_js_1.$String(realm, 'catch');
        this['message'] = new string_js_1.$String(realm, 'message');
        this['proxy'] = new string_js_1.$String(realm, 'proxy');
        this['revoke'] = new string_js_1.$String(realm, 'revoke');
        this['revocable'] = new string_js_1.$String(realm, 'revocable');
        this['$arguments'] = new string_js_1.$String(realm, 'arguments');
        this['$callee'] = new string_js_1.$String(realm, 'callee');
        this['$constructor'] = new string_js_1.$String(realm, 'constructor');
        this['$hasOwnProperty'] = new string_js_1.$String(realm, 'hasOwnProperty');
        this['$isPrototypeOf'] = new string_js_1.$String(realm, 'isPrototypeOf');
        this['$propertyIsEnumerable'] = new string_js_1.$String(realm, 'propertyIsEnumerable');
        this['$toLocaleString'] = new string_js_1.$String(realm, 'toLocaleString');
        this['$prototype'] = new string_js_1.$String(realm, 'prototype');
        this['$name'] = new string_js_1.$String(realm, 'name');
        this['$toString'] = new string_js_1.$String(realm, 'toString');
        this['$valueOf'] = new string_js_1.$String(realm, 'valueOf');
        this['$enumerable'] = new string_js_1.$String(realm, 'enumerable');
        this['$configurable'] = new string_js_1.$String(realm, 'configurable');
        this['$writable'] = new string_js_1.$String(realm, 'writable');
        this['$value'] = new string_js_1.$String(realm, 'value');
        this['$return'] = new string_js_1.$String(realm, 'return');
        this['$done'] = new string_js_1.$String(realm, 'done');
        this['$getPrototypeOf'] = new string_js_1.$String(realm, 'getPrototypeOf');
        this['$setPrototypeOf'] = new string_js_1.$String(realm, 'setPrototypeOf');
        this['$isExtensible'] = new string_js_1.$String(realm, 'isExtensible');
        this['$preventExtensions'] = new string_js_1.$String(realm, 'preventExtensions');
        this['$getOwnPropertyDescriptor'] = new string_js_1.$String(realm, 'getOwnPropertyDescriptor');
        this['$defineProperty'] = new string_js_1.$String(realm, 'defineProperty');
        this['$has'] = new string_js_1.$String(realm, 'has');
        this['$get'] = new string_js_1.$String(realm, 'get');
        this['$set'] = new string_js_1.$String(realm, 'set');
        this['$deleteProperty'] = new string_js_1.$String(realm, 'deleteProperty');
        this['$ownKeys'] = new string_js_1.$String(realm, 'ownKeys');
        this['$apply'] = new string_js_1.$String(realm, 'apply');
        this['$construct'] = new string_js_1.$String(realm, 'construct');
        this['$bind'] = new string_js_1.$String(realm, 'bind');
        this['$call'] = new string_js_1.$String(realm, 'call');
        this['$assign'] = new string_js_1.$String(realm, 'assign');
        this['$create'] = new string_js_1.$String(realm, 'create');
        this['$defineProperties'] = new string_js_1.$String(realm, 'defineProperties');
        this['$entries'] = new string_js_1.$String(realm, 'entries');
        this['$freeze'] = new string_js_1.$String(realm, 'freeze');
        this['$fromEntries'] = new string_js_1.$String(realm, 'fromEntries');
        this['$getOwnPropertyDescriptors'] = new string_js_1.$String(realm, 'getOwnPropertyDescriptors');
        this['$getOwnPropertyNames'] = new string_js_1.$String(realm, 'getOwnPropertyNames');
        this['$getOwnPropertySymbols'] = new string_js_1.$String(realm, 'getOwnPropertySymbols');
        this['$is'] = new string_js_1.$String(realm, 'is');
        this['$isFrozen'] = new string_js_1.$String(realm, 'isFrozen');
        this['$isSealed'] = new string_js_1.$String(realm, 'isSealed');
        this['$keys'] = new string_js_1.$String(realm, 'keys');
        this['$seal'] = new string_js_1.$String(realm, 'seal');
        this['$values'] = new string_js_1.$String(realm, 'values');
        this['@@asyncIterator'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.asyncIterator'));
        this['@@hasInstance'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.hasInstance'));
        this['@@isConcatSpreadable'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.isConcatSpreadable'));
        this['@@iterator'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.iterator'));
        this['@@match'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.match'));
        this['@@replace'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.replace'));
        this['@@search'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.search'));
        this['@@species'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.species'));
        this['@@split'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.split'));
        this['@@toPrimitive'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.toPrimitive'));
        this['@@toStringTag'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.toStringTag'));
        this['@@unscopables'] = new symbol_js_1.$Symbol(realm, new string_js_1.$String(realm, 'Symbol.unscopables'));
        const objectPrototype = this['%ObjectPrototype%'] = new object_js_2.$ObjectPrototype(realm);
        const functionPrototype = this['%FunctionPrototype%'] = new function_js_1.$FunctionPrototype(realm, objectPrototype);
        const objectConstructor = this['%Object%'] = new object_js_2.$ObjectConstructor(realm, functionPrototype);
        (objectConstructor.$prototype = objectPrototype).$constructor = objectConstructor;
        const functionConstructor = this['%Function%'] = new function_js_1.$FunctionConstructor(realm, functionPrototype);
        (functionConstructor.$prototype = functionPrototype).$constructor = functionConstructor;
        this['%ThrowTypeError%'] = new throw_type_error_js_1.$ThrowTypeError(realm, '%ThrowTypeError%', functionPrototype);
        objectConstructor.$assign = new object_js_2.$Object_assign(realm, functionPrototype);
        objectConstructor.$create = new object_js_2.$Object_create(realm, functionPrototype);
        objectConstructor.$defineProperties = new object_js_2.$Object_defineProperties(realm, functionPrototype);
        objectConstructor.$defineProperty = new object_js_2.$Object_defineProperty(realm, functionPrototype);
        objectConstructor.$entries = new object_js_2.$Object_entries(realm, functionPrototype);
        objectConstructor.$freeze = new object_js_2.$Object_freeze(realm, functionPrototype);
        objectConstructor.$fromEntries = new object_js_2.$Object_fromEntries(realm, functionPrototype);
        objectConstructor.$getOwnPropertyDescriptor = new object_js_2.$Object_getOwnPropertyDescriptor(realm, functionPrototype);
        objectConstructor.$getOwnPropertyDescriptors = new object_js_2.$Object_getOwnPropertyDescriptors(realm, functionPrototype);
        objectConstructor.$getOwnPropertyNames = new object_js_2.$Object_getOwnPropertyNames(realm, functionPrototype);
        objectConstructor.$getOwnPropertySymbols = new object_js_2.$Object_getOwnPropertySymbols(realm, functionPrototype);
        objectConstructor.$getPrototypeOf = new object_js_2.$Object_getPrototypeOf(realm, functionPrototype);
        objectConstructor.$is = new object_js_2.$Object_is(realm, functionPrototype);
        objectConstructor.$isExtensible = new object_js_2.$Object_isExtensible(realm, functionPrototype);
        objectConstructor.$isFrozen = new object_js_2.$Object_isFrozen(realm, functionPrototype);
        objectConstructor.$isSealed = new object_js_2.$Object_isSealed(realm, functionPrototype);
        objectConstructor.$keys = new object_js_2.$Object_keys(realm, functionPrototype);
        objectConstructor.$preventExtensions = new object_js_2.$Object_preventExtensions(realm, functionPrototype);
        objectConstructor.$seal = new object_js_2.$Object_seal(realm, functionPrototype);
        objectConstructor.$setPrototypeOf = new object_js_2.$Object_setPrototypeOf(realm, functionPrototype);
        objectConstructor.$values = new object_js_2.$Object_values(realm, functionPrototype);
        objectPrototype.$hasOwnProperty = new object_js_2.$ObjectPrototype_hasOwnProperty(realm, functionPrototype);
        objectPrototype.$isPrototypeOf = new object_js_2.$ObjectPrototype_isPrototypeOf(realm, functionPrototype);
        objectPrototype.$propertyIsEnumerable = new object_js_2.$ObjectPrototype_propertyIsEnumerable(realm, functionPrototype);
        objectPrototype.$toLocaleString = new object_js_2.$ObjectPrototype_toLocaleString(realm, functionPrototype);
        objectPrototype.$toString = this['%ObjProto_toString%'] = new object_js_2.$ObjProto_toString(realm, functionPrototype);
        objectPrototype.$valueOf = this['%ObjProto_valueOf%'] = new object_js_2.$ObjProto_valueOf(realm, functionPrototype);
        functionPrototype.$apply = new function_js_1.$FunctionPrototype_apply(realm, functionPrototype);
        functionPrototype.$bind = new function_js_1.$FunctionPrototype_bind(realm, functionPrototype);
        functionPrototype.$call = new function_js_1.$FunctionPrototype_call(realm, functionPrototype);
        functionPrototype.$toString = new function_js_1.$FunctionPrototype_toString(realm, functionPrototype);
        functionPrototype['@@hasInstance'] = new function_js_1.$FunctionPrototype_hasInstance(realm, functionPrototype);
        const stringConstructor = this['%String%'] = new string_js_2.$StringConstructor(realm, functionPrototype);
        const stringPrototype = this['%StringPrototype%'] = new string_js_2.$StringPrototype(realm, objectPrototype);
        (stringConstructor.$prototype = stringPrototype).$constructor = stringConstructor;
        const numberConstructor = this['%Number%'] = new number_js_2.$NumberConstructor(realm, functionPrototype);
        const numberPrototype = this['%NumberPrototype%'] = new number_js_2.$NumberPrototype(realm, objectPrototype);
        (numberConstructor.$prototype = numberPrototype).$constructor = numberConstructor;
        const booleanConstructor = this['%Boolean%'] = new boolean_js_2.$BooleanConstructor(realm, functionPrototype);
        const booleanPrototype = this['%BooleanPrototype%'] = new boolean_js_2.$BooleanPrototype(realm, objectPrototype);
        (booleanConstructor.$prototype = booleanPrototype).$constructor = booleanConstructor;
        const symbolConstructor = this['%Symbol%'] = new symbol_js_2.$SymbolConstructor(realm, functionPrototype);
        const symbolPrototype = this['%SymbolPrototype%'] = new symbol_js_2.$SymbolPrototype(realm, objectPrototype);
        (symbolConstructor.$prototype = symbolPrototype).$constructor = symbolConstructor;
        const errorConstructor = this['%Error%'] = new error_js_1.$ErrorConstructor(realm, functionPrototype);
        const errorPrototype = this['%ErrorPrototype%'] = new error_js_1.$ErrorPrototype(realm, objectPrototype);
        (errorConstructor.$prototype = errorPrototype).$constructor = errorConstructor;
        errorPrototype.message = new string_js_1.$String(realm, '');
        errorPrototype.$name = new string_js_1.$String(realm, 'Error');
        errorPrototype.$toString = new error_js_1.$ErrorPrototype_toString(realm, 'Error.prototype.toString', functionPrototype);
        const evalErrorConstructor = this['%EvalError%'] = new error_js_1.$EvalErrorConstructor(realm, errorConstructor);
        const evalErrorPrototype = this['%EvalErrorPrototype%'] = new error_js_1.$EvalErrorPrototype(realm, errorPrototype);
        (evalErrorConstructor.$prototype = evalErrorPrototype).$constructor = evalErrorConstructor;
        evalErrorPrototype.message = new string_js_1.$String(realm, '');
        evalErrorPrototype.$name = new string_js_1.$String(realm, 'EvalError');
        const rangeErrorConstructor = this['%RangeError%'] = new error_js_1.$RangeErrorConstructor(realm, errorConstructor);
        const rangeErrorPrototype = this['%RangeErrorPrototype%'] = new error_js_1.$RangeErrorPrototype(realm, errorPrototype);
        (rangeErrorConstructor.$prototype = rangeErrorPrototype).$constructor = rangeErrorConstructor;
        rangeErrorPrototype.message = new string_js_1.$String(realm, '');
        rangeErrorPrototype.$name = new string_js_1.$String(realm, 'RangeError');
        const referenceErrorConstructor = this['%ReferenceError%'] = new error_js_1.$ReferenceErrorConstructor(realm, errorConstructor);
        const referenceErrorPrototype = this['%ReferenceErrorPrototype%'] = new error_js_1.$ReferenceErrorPrototype(realm, errorPrototype);
        (referenceErrorConstructor.$prototype = referenceErrorPrototype).$constructor = referenceErrorConstructor;
        referenceErrorPrototype.message = new string_js_1.$String(realm, '');
        referenceErrorPrototype.$name = new string_js_1.$String(realm, 'ReferenceError');
        const syntaxErrorConstructor = this['%SyntaxError%'] = new error_js_1.$SyntaxErrorConstructor(realm, errorConstructor);
        const syntaxErrorPrototype = this['%SyntaxErrorPrototype%'] = new error_js_1.$SyntaxErrorPrototype(realm, errorPrototype);
        (syntaxErrorConstructor.$prototype = syntaxErrorPrototype).$constructor = syntaxErrorConstructor;
        syntaxErrorPrototype.message = new string_js_1.$String(realm, '');
        syntaxErrorPrototype.$name = new string_js_1.$String(realm, 'SyntaxError');
        const typeErrorConstructor = this['%TypeError%'] = new error_js_1.$TypeErrorConstructor(realm, errorConstructor);
        const typeErrorPrototype = this['%TypeErrorPrototype%'] = new error_js_1.$TypeErrorPrototype(realm, errorPrototype);
        (typeErrorConstructor.$prototype = typeErrorPrototype).$constructor = typeErrorConstructor;
        typeErrorPrototype.message = new string_js_1.$String(realm, '');
        typeErrorPrototype.$name = new string_js_1.$String(realm, 'TypeError');
        const URIErrorConstructor = this['%URIError%'] = new error_js_1.$URIErrorConstructor(realm, errorConstructor);
        const URIErrorPrototype = this['%URIErrorPrototype%'] = new error_js_1.$URIErrorPrototype(realm, errorPrototype);
        (URIErrorConstructor.$prototype = URIErrorPrototype).$constructor = URIErrorConstructor;
        URIErrorPrototype.message = new string_js_1.$String(realm, '');
        URIErrorPrototype.$name = new string_js_1.$String(realm, 'URIError');
        const iteratorPrototype = this['%IteratorPrototype%'] = new iteration_js_1.$IteratorPrototype(realm, objectPrototype);
        const generatorFunctionConstructor = this['%GeneratorFunction%'] = new generator_function_js_1.$GeneratorFunctionConstructor(realm, functionConstructor);
        const generatorFunctionPrototype = this['%Generator%'] = new generator_function_js_1.$GeneratorFunctionPrototype(realm, functionPrototype);
        (generatorFunctionConstructor.$prototype = generatorFunctionPrototype).$constructor = generatorFunctionConstructor;
        generatorFunctionConstructor.length = new number_js_1.$Number(realm, 1);
        const generatorPrototype = this['%GeneratorPrototype%'] = new generator_function_js_1.$GeneratorPrototype(realm, iteratorPrototype);
        (generatorFunctionPrototype.$prototype = generatorPrototype).$constructor = generatorFunctionPrototype;
        generatorFunctionPrototype['@@toStringTag'] = new string_js_1.$String(realm, 'GeneratorFunction');
        generatorPrototype.next = new generator_function_js_1.$GeneratorPrototype_next(realm, 'Generator.prototype.next', functionPrototype);
        generatorPrototype.return = new generator_function_js_1.$GeneratorPrototype_return(realm, 'Generator.prototype.return', functionPrototype);
        generatorPrototype.throw = new generator_function_js_1.$GeneratorPrototype_throw(realm, 'Generator.prototype.throw', functionPrototype);
        generatorPrototype['@@toStringTag'] = new string_js_1.$String(realm, 'Generator');
        const promiseConstructor = this['%Promise%'] = new promise_js_1.$PromiseConstructor(realm, functionPrototype);
        const promisePrototype = this['%PromisePrototype%'] = new promise_js_1.$PromisePrototype(realm, functionPrototype);
        (promiseConstructor.$prototype = promisePrototype).$constructor = promiseConstructor;
        promisePrototype.then = this['%PromiseProto_then%'] = new promise_js_1.$PromiseProto_then(realm, functionPrototype);
        promisePrototype.catch = new promise_js_1.$PromiseProto_catch(realm, functionPrototype);
        promisePrototype.finally = new promise_js_1.$PromiseProto_finally(realm, functionPrototype);
        promisePrototype['@@toStringTag'] = new string_js_1.$String(realm, 'Promise');
        promiseConstructor.all = this['%Promise_all%'] = new promise_js_1.$Promise_all(realm, functionPrototype);
        promiseConstructor.race = new promise_js_1.$Promise_race(realm, functionPrototype);
        promiseConstructor.resolve = this['%Promise_resolve%'] = new promise_js_1.$Promise_resolve(realm, functionPrototype);
        promiseConstructor.reject = this['%Promise_reject%'] = new promise_js_1.$Promise_reject(realm, functionPrototype);
        promiseConstructor['@@species'] = new _shared_js_1.$GetSpecies(realm);
        const asyncFunctionConstructor = this['%AsyncFunction%'] = new async_function_js_1.$AsyncFunctionConstructor(realm, functionConstructor);
        const asyncFunctionPrototype = this['%AsyncFunctionPrototype%'] = new async_function_js_1.$AsyncFunctionPrototype(realm, functionPrototype);
        (asyncFunctionConstructor.$prototype = asyncFunctionPrototype).$constructor = asyncFunctionConstructor;
        asyncFunctionConstructor.length = new number_js_1.$Number(realm, 1);
        asyncFunctionPrototype['@@toStringTag'] = new string_js_1.$String(realm, 'AsyncFunction');
        const asyncIteratorPrototype = this['%AsyncIteratorPrototype%'] = new iteration_js_1.$AsyncIteratorPrototype(realm, objectPrototype);
        const asyncFromSyncIteratorPrototype = this['%AsyncFromSyncIteratorPrototype%'] = new iteration_js_1.$AsyncFromSyncIteratorPrototype(realm, asyncIteratorPrototype);
        asyncFromSyncIteratorPrototype.next = new iteration_js_1.$AsyncFromSyncIteratorPrototype_next(realm, functionPrototype);
        asyncFromSyncIteratorPrototype.return = new iteration_js_1.$AsyncFromSyncIteratorPrototype_return(realm, functionPrototype);
        asyncFromSyncIteratorPrototype.throw = new iteration_js_1.$AsyncFromSyncIteratorPrototype_throw(realm, functionPrototype);
        asyncFromSyncIteratorPrototype['@@toStringTag'] = new string_js_1.$String(realm, 'Async-from-Sync Iterator');
        const asyncGeneratorFunctionConstructor = this['%AsyncGeneratorFunction%'] = new async_generator_function_js_1.$AsyncGeneratorFunctionConstructor(realm, functionConstructor);
        const asyncGeneratorFunctionPrototype = this['%AsyncGenerator%'] = new async_generator_function_js_1.$AsyncGeneratorFunctionPrototype(realm, functionPrototype);
        (asyncGeneratorFunctionConstructor.$prototype = asyncGeneratorFunctionPrototype).$constructor = asyncGeneratorFunctionConstructor;
        asyncGeneratorFunctionConstructor.length = new number_js_1.$Number(realm, 1);
        asyncGeneratorFunctionPrototype['@@toStringTag'] = new string_js_1.$String(realm, 'AsyncGeneratorFunction');
        const asyncGeneratorPrototype = this['%AsyncGeneratorPrototype%'] = new async_generator_function_js_1.$AsyncGeneratorPrototype(realm, iteratorPrototype);
        (asyncGeneratorFunctionPrototype.$prototype = asyncGeneratorPrototype).$constructor = asyncGeneratorFunctionPrototype;
        asyncGeneratorPrototype.next = new async_generator_function_js_1.$AsyncGeneratorPrototype_next(realm, functionPrototype);
        asyncGeneratorPrototype.return = new async_generator_function_js_1.$AsyncGeneratorPrototype_return(realm, functionPrototype);
        asyncGeneratorPrototype.throw = new async_generator_function_js_1.$AsyncGeneratorPrototype_throw(realm, functionPrototype);
        this['%RegExpPrototype%'] = new object_js_1.$Object(realm, '%RegExpPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%DatePrototype%'] = new object_js_1.$Object(realm, '%DatePrototype%', objectPrototype, 1 /* normal */, empty);
        this['%ArrayIteratorPrototype%'] = new object_js_1.$Object(realm, '%ArrayIteratorPrototype%', this['%IteratorPrototype%'], 1 /* normal */, empty);
        this['%MapIteratorPrototype%'] = new object_js_1.$Object(realm, '%MapIteratorPrototype%', this['%IteratorPrototype%'], 1 /* normal */, empty);
        this['%SetIteratorPrototype%'] = new object_js_1.$Object(realm, '%SetIteratorPrototype%', this['%IteratorPrototype%'], 1 /* normal */, empty);
        this['%StringIteratorPrototype%'] = new object_js_1.$Object(realm, '%StringIteratorPrototype%', this['%IteratorPrototype%'], 1 /* normal */, empty);
        this['%ArrayPrototype%'] = new object_js_1.$Object(realm, '%ArrayPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%MapPrototype%'] = new object_js_1.$Object(realm, '%MapPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%WeakMapPrototype%'] = new object_js_1.$Object(realm, '%WeakMapPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%SetPrototype%'] = new object_js_1.$Object(realm, '%SetPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%WeakSetPrototype%'] = new object_js_1.$Object(realm, '%WeakSetPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%DataViewPrototype%'] = new object_js_1.$Object(realm, '%DataViewPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%ArrayBufferPrototype%'] = new object_js_1.$Object(realm, '%ArrayBufferPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%SharedArrayBufferPrototype%'] = new object_js_1.$Object(realm, '%SharedArrayBufferPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%TypedArrayPrototype%'] = new object_js_1.$Object(realm, '%TypedArrayPrototype%', objectPrototype, 1 /* normal */, empty);
        this['%Float32ArrayPrototype%'] = new object_js_1.$Object(realm, '%Float32ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Float64ArrayPrototype%'] = new object_js_1.$Object(realm, '%Float64ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Int8ArrayPrototype%'] = new object_js_1.$Object(realm, '%Int8ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Int16ArrayPrototype%'] = new object_js_1.$Object(realm, '%Int16ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Int32ArrayPrototype%'] = new object_js_1.$Object(realm, '%Int32ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Uint8ArrayPrototype%'] = new object_js_1.$Object(realm, '%Uint8ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Uint8ClampedArrayPrototype%'] = new object_js_1.$Object(realm, '%Uint8ClampedArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Uint16ArrayPrototype%'] = new object_js_1.$Object(realm, '%Uint16ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%Uint32ArrayPrototype%'] = new object_js_1.$Object(realm, '%Uint32ArrayPrototype%', this['%TypedArrayPrototype%'], 1 /* normal */, empty);
        this['%RegExp%'] = new object_js_1.$Object(realm, '%RegExp%', functionPrototype, 1 /* normal */, empty);
        this['%Date%'] = new object_js_1.$Object(realm, '%Date%', functionPrototype, 1 /* normal */, empty);
        this['%Array%'] = new object_js_1.$Object(realm, '%Array%', functionPrototype, 1 /* normal */, empty);
        this['%Map%'] = new object_js_1.$Object(realm, '%Map%', functionPrototype, 1 /* normal */, empty);
        this['%WeakMap%'] = new object_js_1.$Object(realm, '%WeakMap%', functionPrototype, 1 /* normal */, empty);
        this['%Set%'] = new object_js_1.$Object(realm, '%Set%', functionPrototype, 1 /* normal */, empty);
        this['%WeakSet%'] = new object_js_1.$Object(realm, '%WeakSet%', functionPrototype, 1 /* normal */, empty);
        this['%DataView%'] = new object_js_1.$Object(realm, '%DataView%', functionPrototype, 1 /* normal */, empty);
        this['%ArrayBuffer%'] = new object_js_1.$Object(realm, '%ArrayBuffer%', functionPrototype, 1 /* normal */, empty);
        this['%SharedArrayBuffer%'] = new object_js_1.$Object(realm, '%SharedArrayBuffer%', functionPrototype, 1 /* normal */, empty);
        this['%TypedArray%'] = new object_js_1.$Object(realm, '%TypedArray%', functionPrototype, 1 /* normal */, empty);
        this['%Float32Array%'] = new object_js_1.$Object(realm, '%Float32Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Float64Array%'] = new object_js_1.$Object(realm, '%Float64Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Int8Array%'] = new object_js_1.$Object(realm, '%Int8Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Int16Array%'] = new object_js_1.$Object(realm, '%Int16Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Int32Array%'] = new object_js_1.$Object(realm, '%Int32Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Uint8Array%'] = new object_js_1.$Object(realm, '%Uint8Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Uint8ClampedArray%'] = new object_js_1.$Object(realm, '%Uint8ClampedArray%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Uint16Array%'] = new object_js_1.$Object(realm, '%Uint16Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Uint32Array%'] = new object_js_1.$Object(realm, '%Uint32Array%', this['%TypedArray%'], 1 /* normal */, empty);
        this['%Atomics%'] = new object_js_1.$Object(realm, '%Atomics%', objectPrototype, 1 /* normal */, empty);
        this['%JSON%'] = new object_js_1.$Object(realm, '%JSON%', objectPrototype, 1 /* normal */, empty);
        this['%Math%'] = new object_js_1.$Object(realm, '%Math%', objectPrototype, 1 /* normal */, empty);
        const reflect = this['%Reflect%'] = new reflect_js_1.$Reflect(realm, objectPrototype);
        reflect.$apply = new reflect_js_1.$Reflect_apply(realm, functionPrototype);
        reflect.$construct = new reflect_js_1.$Reflect_construct(realm, functionPrototype);
        reflect.$defineProperty = new reflect_js_1.$Reflect_defineProperty(realm, functionPrototype);
        reflect.$deleteProperty = new reflect_js_1.$Reflect_deleteProperty(realm, functionPrototype);
        reflect.$get = new reflect_js_1.$Reflect_get(realm, functionPrototype);
        reflect.$getOwnPropertyDescriptor = new reflect_js_1.$Reflect_getOwnPropertyDescriptor(realm, functionPrototype);
        reflect.$getPrototypeOf = new reflect_js_1.$Reflect_getPrototypeOf(realm, functionPrototype);
        reflect.$has = new reflect_js_1.$Reflect_has(realm, functionPrototype);
        reflect.$isExtensible = new reflect_js_1.$Reflect_isExtensible(realm, functionPrototype);
        reflect.$ownKeys = new reflect_js_1.$Reflect_ownKeys(realm, functionPrototype);
        reflect.$preventExtensions = new reflect_js_1.$Reflect_preventExtensions(realm, functionPrototype);
        reflect.$set = new reflect_js_1.$Reflect_set(realm, functionPrototype);
        reflect.$setPrototypeOf = new reflect_js_1.$Reflect_setPrototypeOf(realm, functionPrototype);
        const proxyConstructor = this['%Proxy%'] = new proxy_js_1.$ProxyConstructor(realm, functionPrototype);
        proxyConstructor.revocable = new proxy_js_1.$Proxy_revocable(realm, functionPrototype);
        this['%decodeURI%'] = new uri_handling_js_1.$DecodeURI(realm, functionPrototype);
        this['%decodeURIComponent%'] = new uri_handling_js_1.$DecodeURIComponent(realm, functionPrototype);
        this['%encodeURI%'] = new uri_handling_js_1.$EncodeURI(realm, functionPrototype);
        this['%encodeURIComponent%'] = new uri_handling_js_1.$EncodeURIComponent(realm, functionPrototype);
        this['%eval%'] = new eval_js_1.$Eval(realm, functionPrototype);
        this['%isFinite%'] = new is_finite_js_1.$IsFinite(realm, functionPrototype);
        this['%isNaN%'] = new is_nan_js_1.$IsNaN(realm, functionPrototype);
        this['%parseFloat%'] = new parse_float_js_1.$ParseFloat(realm, functionPrototype);
        this['%parseInt%'] = new parse_int_js_1.$ParseInt(realm, functionPrototype);
        this['%JSONParse%'] = new object_js_1.$Object(realm, '%JSONParse%', functionPrototype, 1 /* normal */, empty);
        this['%JSONStringify%'] = new object_js_1.$Object(realm, '%JSONStringify%', functionPrototype, 1 /* normal */, empty);
        this['%ArrayProto_entries%'] = new object_js_1.$Object(realm, '%ArrayProto_entries%', functionPrototype, 1 /* normal */, empty);
        this['%ArrayProto_forEach%'] = new object_js_1.$Object(realm, '%ArrayProto_forEach%', functionPrototype, 1 /* normal */, empty);
        this['%ArrayProto_keys%'] = new object_js_1.$Object(realm, '%ArrayProto_keys%', functionPrototype, 1 /* normal */, empty);
        this['%ArrayProto_values%'] = new object_js_1.$Object(realm, '%ArrayProto_values%', functionPrototype, 1 /* normal */, empty);
        this['%ObjProto_valueOf%'] = new object_js_1.$Object(realm, '%ObjProto_valueOf%', functionPrototype, 1 /* normal */, empty);
    }
    dispose() {
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
        this['%ObjectPrototype%'].dispose();
        this['%ObjectPrototype%'] = void 0;
        this['%FunctionPrototype%'].dispose();
        this['%FunctionPrototype%'] = void 0;
        this['%Object%'].dispose();
        this['%Object%'] = void 0;
        this['%Function%'].dispose();
        this['%Function%'] = void 0;
        this['%ThrowTypeError%'].dispose();
        this['%ThrowTypeError%'] = void 0;
        this['%ObjProto_toString%'].dispose();
        this['%ObjProto_toString%'] = void 0;
        this['%String%'].dispose();
        this['%String%'] = void 0;
        this['%StringPrototype%'].dispose();
        this['%StringPrototype%'] = void 0;
        this['%Number%'].dispose();
        this['%Number%'] = void 0;
        this['%NumberPrototype%'].dispose();
        this['%NumberPrototype%'] = void 0;
        this['%Boolean%'].dispose();
        this['%Boolean%'] = void 0;
        this['%BooleanPrototype%'].dispose();
        this['%BooleanPrototype%'] = void 0;
        this['%Symbol%'].dispose();
        this['%Symbol%'] = void 0;
        this['%SymbolPrototype%'].dispose();
        this['%SymbolPrototype%'] = void 0;
        this['%Error%'].dispose();
        this['%Error%'] = void 0;
        this['%ErrorPrototype%'].dispose();
        this['%ErrorPrototype%'] = void 0;
        this['%EvalError%'].dispose();
        this['%EvalError%'] = void 0;
        this['%EvalErrorPrototype%'].dispose();
        this['%EvalErrorPrototype%'] = void 0;
        this['%RangeError%'].dispose();
        this['%RangeError%'] = void 0;
        this['%RangeErrorPrototype%'].dispose();
        this['%RangeErrorPrototype%'] = void 0;
        this['%ReferenceError%'].dispose();
        this['%ReferenceError%'] = void 0;
        this['%ReferenceErrorPrototype%'].dispose();
        this['%ReferenceErrorPrototype%'] = void 0;
        this['%SyntaxError%'].dispose();
        this['%SyntaxError%'] = void 0;
        this['%SyntaxErrorPrototype%'].dispose();
        this['%SyntaxErrorPrototype%'] = void 0;
        this['%TypeError%'].dispose();
        this['%TypeError%'] = void 0;
        this['%TypeErrorPrototype%'].dispose();
        this['%TypeErrorPrototype%'] = void 0;
        this['%URIError%'].dispose();
        this['%URIError%'] = void 0;
        this['%URIErrorPrototype%'].dispose();
        this['%URIErrorPrototype%'] = void 0;
        this['%PromisePrototype%'].dispose();
        this['%PromisePrototype%'] = void 0;
        this['%RegExpPrototype%'].dispose();
        this['%RegExpPrototype%'] = void 0;
        this['%DatePrototype%'].dispose();
        this['%DatePrototype%'] = void 0;
        this['%AsyncFunctionPrototype%'].dispose();
        this['%AsyncFunctionPrototype%'] = void 0;
        this['%Generator%'].dispose();
        this['%Generator%'] = void 0;
        this['%AsyncGenerator%'].dispose();
        this['%AsyncGenerator%'] = void 0;
        this['%IteratorPrototype%'].dispose();
        this['%IteratorPrototype%'] = void 0;
        this['%ArrayIteratorPrototype%'].dispose();
        this['%ArrayIteratorPrototype%'] = void 0;
        this['%MapIteratorPrototype%'].dispose();
        this['%MapIteratorPrototype%'] = void 0;
        this['%SetIteratorPrototype%'].dispose();
        this['%SetIteratorPrototype%'] = void 0;
        this['%StringIteratorPrototype%'].dispose();
        this['%StringIteratorPrototype%'] = void 0;
        this['%GeneratorPrototype%'].dispose();
        this['%GeneratorPrototype%'] = void 0;
        this['%AsyncIteratorPrototype%'].dispose();
        this['%AsyncIteratorPrototype%'] = void 0;
        this['%AsyncFromSyncIteratorPrototype%'].dispose();
        this['%AsyncFromSyncIteratorPrototype%'] = void 0;
        this['%AsyncGeneratorPrototype%'].dispose();
        this['%AsyncGeneratorPrototype%'] = void 0;
        this['%ArrayPrototype%'].dispose();
        this['%ArrayPrototype%'] = void 0;
        this['%MapPrototype%'].dispose();
        this['%MapPrototype%'] = void 0;
        this['%WeakMapPrototype%'].dispose();
        this['%WeakMapPrototype%'] = void 0;
        this['%SetPrototype%'].dispose();
        this['%SetPrototype%'] = void 0;
        this['%WeakSetPrototype%'].dispose();
        this['%WeakSetPrototype%'] = void 0;
        this['%DataViewPrototype%'].dispose();
        this['%DataViewPrototype%'] = void 0;
        this['%ArrayBufferPrototype%'].dispose();
        this['%ArrayBufferPrototype%'] = void 0;
        this['%SharedArrayBufferPrototype%'].dispose();
        this['%SharedArrayBufferPrototype%'] = void 0;
        this['%TypedArrayPrototype%'].dispose();
        this['%TypedArrayPrototype%'] = void 0;
        this['%Float32ArrayPrototype%'].dispose();
        this['%Float32ArrayPrototype%'] = void 0;
        this['%Float64ArrayPrototype%'].dispose();
        this['%Float64ArrayPrototype%'] = void 0;
        this['%Int8ArrayPrototype%'].dispose();
        this['%Int8ArrayPrototype%'] = void 0;
        this['%Int16ArrayPrototype%'].dispose();
        this['%Int16ArrayPrototype%'] = void 0;
        this['%Int32ArrayPrototype%'].dispose();
        this['%Int32ArrayPrototype%'] = void 0;
        this['%Uint8ArrayPrototype%'].dispose();
        this['%Uint8ArrayPrototype%'] = void 0;
        this['%Uint8ClampedArrayPrototype%'].dispose();
        this['%Uint8ClampedArrayPrototype%'] = void 0;
        this['%Uint16ArrayPrototype%'].dispose();
        this['%Uint16ArrayPrototype%'] = void 0;
        this['%Uint32ArrayPrototype%'].dispose();
        this['%Uint32ArrayPrototype%'] = void 0;
        this['%Promise%'].dispose();
        this['%Promise%'] = void 0;
        this['%RegExp%'].dispose();
        this['%RegExp%'] = void 0;
        this['%Date%'].dispose();
        this['%Date%'] = void 0;
        this['%AsyncFunction%'].dispose();
        this['%AsyncFunction%'] = void 0;
        this['%GeneratorFunction%'].dispose();
        this['%GeneratorFunction%'] = void 0;
        this['%AsyncGeneratorFunction%'].dispose();
        this['%AsyncGeneratorFunction%'] = void 0;
        this['%Array%'].dispose();
        this['%Array%'] = void 0;
        this['%Map%'].dispose();
        this['%Map%'] = void 0;
        this['%WeakMap%'].dispose();
        this['%WeakMap%'] = void 0;
        this['%Set%'].dispose();
        this['%Set%'] = void 0;
        this['%WeakSet%'].dispose();
        this['%WeakSet%'] = void 0;
        this['%DataView%'].dispose();
        this['%DataView%'] = void 0;
        this['%ArrayBuffer%'].dispose();
        this['%ArrayBuffer%'] = void 0;
        this['%SharedArrayBuffer%'].dispose();
        this['%SharedArrayBuffer%'] = void 0;
        this['%TypedArray%'].dispose();
        this['%TypedArray%'] = void 0;
        this['%Float32Array%'].dispose();
        this['%Float32Array%'] = void 0;
        this['%Float64Array%'].dispose();
        this['%Float64Array%'] = void 0;
        this['%Int8Array%'].dispose();
        this['%Int8Array%'] = void 0;
        this['%Int16Array%'].dispose();
        this['%Int16Array%'] = void 0;
        this['%Int32Array%'].dispose();
        this['%Int32Array%'] = void 0;
        this['%Uint8Array%'].dispose();
        this['%Uint8Array%'] = void 0;
        this['%Uint8ClampedArray%'].dispose();
        this['%Uint8ClampedArray%'] = void 0;
        this['%Uint16Array%'].dispose();
        this['%Uint16Array%'] = void 0;
        this['%Uint32Array%'].dispose();
        this['%Uint32Array%'] = void 0;
        this['%Atomics%'].dispose();
        this['%Atomics%'] = void 0;
        this['%JSON%'].dispose();
        this['%JSON%'] = void 0;
        this['%Math%'].dispose();
        this['%Math%'] = void 0;
        this['%Reflect%'].dispose();
        this['%Reflect%'] = void 0;
        this['%Proxy%'].dispose();
        this['%Proxy%'] = void 0;
        this['%decodeURI%'].dispose();
        this['%decodeURI%'] = void 0;
        this['%decodeURIComponent%'].dispose();
        this['%decodeURIComponent%'] = void 0;
        this['%encodeURI%'].dispose();
        this['%encodeURI%'] = void 0;
        this['%encodeURIComponent%'].dispose();
        this['%encodeURIComponent%'] = void 0;
        this['%eval%'].dispose();
        this['%eval%'] = void 0;
        this['%isFinite%'].dispose();
        this['%isFinite%'] = void 0;
        this['%isNaN%'].dispose();
        this['%isNaN%'] = void 0;
        this['%parseFloat%'].dispose();
        this['%parseFloat%'] = void 0;
        this['%parseInt%'].dispose();
        this['%parseInt%'] = void 0;
        this['%JSONParse%'].dispose();
        this['%JSONParse%'] = void 0;
        this['%JSONStringify%'].dispose();
        this['%JSONStringify%'] = void 0;
        this['%ArrayProto_entries%'].dispose();
        this['%ArrayProto_entries%'] = void 0;
        this['%ArrayProto_forEach%'].dispose();
        this['%ArrayProto_forEach%'] = void 0;
        this['%ArrayProto_keys%'].dispose();
        this['%ArrayProto_keys%'] = void 0;
        this['%ArrayProto_values%'].dispose();
        this['%ArrayProto_values%'] = void 0;
        this['%ObjProto_valueOf%'].dispose();
        this['%ObjProto_valueOf%'] = void 0;
        this['%PromiseProto_then%'].dispose();
        this['%PromiseProto_then%'] = void 0;
        this['%Promise_all%'].dispose();
        this['%Promise_all%'] = void 0;
        this['%Promise_reject%'].dispose();
        this['%Promise_reject%'] = void 0;
        this['%Promise_resolve%'].dispose();
        this['%Promise_resolve%'] = void 0;
    }
}
exports.Intrinsics = Intrinsics;
//# sourceMappingURL=intrinsics.js.map