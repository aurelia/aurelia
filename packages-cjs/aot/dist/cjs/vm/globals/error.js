"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$URIErrorPrototype = exports.$URIErrorConstructor = exports.$TypeErrorPrototype = exports.$TypeErrorConstructor = exports.$SyntaxErrorPrototype = exports.$SyntaxErrorConstructor = exports.$ReferenceErrorPrototype = exports.$ReferenceErrorConstructor = exports.$RangeErrorPrototype = exports.$RangeErrorConstructor = exports.$EvalErrorPrototype = exports.$EvalErrorConstructor = exports.$ErrorPrototype_toString = exports.$ErrorPrototype = exports.$ErrorConstructor = void 0;
const function_js_1 = require("../types/function.js");
const error_js_1 = require("../types/error.js");
const object_js_1 = require("../types/object.js");
const property_descriptor_js_1 = require("../types/property-descriptor.js");
const operations_js_1 = require("../operations.js");
const string_js_1 = require("../types/string.js");
// http://www.ecma-international.org/ecma-262/#sec-error-constructor
class $ErrorConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, functionPrototype) {
        super(realm, '%Error%', functionPrototype);
    }
    // http://www.ecma-international.org/ecma-262/#sec-error-message
    // 19.5.1.1 Error ( message )
    performSteps(ctx, thisArgument, [message], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
        const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;
        // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%ErrorPrototype%", « [[ErrorData]] »).
        const O = function_js_1.$OrdinaryCreateFromConstructor(ctx, newTarget, '%ErrorPrototype%', { '[[ErrorData]]': void 0 });
        if (O.isAbrupt) {
            return O;
        }
        // 3. If message is not undefined, then
        if (message !== void 0) {
            // 3. a. Let msg be ? ToString(message).
            const msg = message.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
            // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
            const msgDesc = new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            operations_js_1.$DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
exports.$ErrorConstructor = $ErrorConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-error-prototype-object
class $ErrorPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    get message() {
        return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'];
    }
    set message(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
    }
    get $name() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $name(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    get $toString() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $toString(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    constructor(realm, objectPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%ErrorPrototype%', objectPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$ErrorPrototype = $ErrorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-error.prototype.tostring
class $ErrorPrototype_toString extends function_js_1.$BuiltinFunction {
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let O be the this value.
        const O = thisArgument;
        // 2. If Type(O) is not Object, throw a TypeError exception.
        if (!O.isObject) {
            return new error_js_1.$TypeError(realm, `Error.prototype.toString called on ${O}, but expected an object`);
        }
        // 3. Let name be ? Get(O, "name").
        let name = O['[[Get]]'](ctx, intrinsics.$name, O);
        if (name.isAbrupt) {
            return name;
        }
        // 4. If name is undefined, set name to "Error"; otherwise set name to ? ToString(name).
        if (name.isUndefined) {
            name = new string_js_1.$String(realm, 'Error');
        }
        else {
            name = name.ToString(ctx);
            if (name.isAbrupt) {
                return name;
            }
        }
        // 5. Let msg be ? Get(O, "message").
        let msg = O['[[Get]]'](ctx, intrinsics.message, O);
        if (msg.isAbrupt) {
            return msg;
        }
        // 6. If msg is undefined, set msg to the empty String; otherwise set msg to ? ToString(msg).
        if (msg.isUndefined) {
            msg = new string_js_1.$String(realm, '');
        }
        else {
            msg = msg.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
        }
        // 7. If name is the empty String, return msg.
        if (name['[[Value]]'] === '') {
            return msg;
        }
        // 8. If msg is the empty String, return name.
        if (msg['[[Value]]'] === '') {
            return name;
        }
        // 9. Return the string-concatenation of name, the code unit 0x003A (COLON), the code unit 0x0020 (SPACE), and msg.
        return new string_js_1.$String(realm, `${name['[[Value]]']}: ${msg['[[Value]]']}`);
    }
}
exports.$ErrorPrototype_toString = $ErrorPrototype_toString;
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
class $EvalErrorConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, errorConstructor) {
        super(realm, '%EvalError%', errorConstructor);
    }
    // http://www.ecma-international.org/ecma-262/#sec-nativeerror
    // 19.5.6.1.1 NativeError ( message )
    performSteps(ctx, thisArgument, [message], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
        const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;
        // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%EvalErrorPrototype%", « [[ErrorData]] »).
        const O = function_js_1.$OrdinaryCreateFromConstructor(ctx, newTarget, '%EvalErrorPrototype%', { '[[ErrorData]]': void 0 });
        if (O.isAbrupt) {
            return O;
        }
        // 3. If message is not undefined, then
        if (message !== void 0) {
            // 3. a. Let msg be ? ToString(message).
            const msg = message.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
            // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
            const msgDesc = new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            operations_js_1.$DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
exports.$EvalErrorConstructor = $EvalErrorConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
class $EvalErrorPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    get message() {
        return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'];
    }
    set message(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
    }
    get $name() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $name(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    constructor(realm, errorPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%EvalErrorPrototype%', errorPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$EvalErrorPrototype = $EvalErrorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
class $RangeErrorConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, errorConstructor) {
        super(realm, '%RangeError%', errorConstructor);
    }
    // http://www.ecma-international.org/ecma-262/#sec-nativeerror
    // 19.5.6.1.1 NativeError ( message )
    performSteps(ctx, thisArgument, [message], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
        const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;
        // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%RangeErrorPrototype%", « [[ErrorData]] »).
        const O = function_js_1.$OrdinaryCreateFromConstructor(ctx, newTarget, '%RangeErrorPrototype%', { '[[ErrorData]]': void 0 });
        if (O.isAbrupt) {
            return O;
        }
        // 3. If message is not undefined, then
        if (message !== void 0) {
            // 3. a. Let msg be ? ToString(message).
            const msg = message.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
            // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
            const msgDesc = new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            operations_js_1.$DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
exports.$RangeErrorConstructor = $RangeErrorConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
class $RangeErrorPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    get message() {
        return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'];
    }
    set message(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
    }
    get $name() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $name(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    constructor(realm, errorPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%RangeErrorPrototype%', errorPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$RangeErrorPrototype = $RangeErrorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
class $ReferenceErrorConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, errorConstructor) {
        super(realm, '%ReferenceError%', errorConstructor);
    }
    // http://www.ecma-international.org/ecma-262/#sec-nativeerror
    // 19.5.6.1.1 NativeError ( message )
    performSteps(ctx, thisArgument, [message], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
        const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;
        // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%ReferenceErrorPrototype%", « [[ErrorData]] »).
        const O = function_js_1.$OrdinaryCreateFromConstructor(ctx, newTarget, '%ReferenceErrorPrototype%', { '[[ErrorData]]': void 0 });
        if (O.isAbrupt) {
            return O;
        }
        // 3. If message is not undefined, then
        if (message !== void 0) {
            // 3. a. Let msg be ? ToString(message).
            const msg = message.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
            // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
            const msgDesc = new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            operations_js_1.$DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
exports.$ReferenceErrorConstructor = $ReferenceErrorConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
class $ReferenceErrorPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    get message() {
        return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'];
    }
    set message(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
    }
    get $name() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $name(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    constructor(realm, errorPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%ReferenceErrorPrototype%', errorPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$ReferenceErrorPrototype = $ReferenceErrorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
class $SyntaxErrorConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, errorConstructor) {
        super(realm, '%SyntaxError%', errorConstructor);
    }
    // http://www.ecma-international.org/ecma-262/#sec-nativeerror
    // 19.5.6.1.1 NativeError ( message )
    performSteps(ctx, thisArgument, [message], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
        const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;
        // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%SyntaxErrorPrototype%", « [[ErrorData]] »).
        const O = function_js_1.$OrdinaryCreateFromConstructor(ctx, newTarget, '%SyntaxErrorPrototype%', { '[[ErrorData]]': void 0 });
        if (O.isAbrupt) {
            return O;
        }
        // 3. If message is not undefined, then
        if (message !== void 0) {
            // 3. a. Let msg be ? ToString(message).
            const msg = message.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
            // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
            const msgDesc = new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            operations_js_1.$DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
exports.$SyntaxErrorConstructor = $SyntaxErrorConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
class $SyntaxErrorPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    get message() {
        return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'];
    }
    set message(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
    }
    get $name() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $name(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    constructor(realm, errorPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%SyntaxErrorPrototype%', errorPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$SyntaxErrorPrototype = $SyntaxErrorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
class $TypeErrorConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, errorConstructor) {
        super(realm, '%TypeError%', errorConstructor);
    }
    // http://www.ecma-international.org/ecma-262/#sec-nativeerror
    // 19.5.6.1.1 NativeError ( message )
    performSteps(ctx, thisArgument, [message], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
        const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;
        // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%TypeErrorPrototype%", « [[ErrorData]] »).
        const O = function_js_1.$OrdinaryCreateFromConstructor(ctx, newTarget, '%TypeErrorPrototype%', { '[[ErrorData]]': void 0 });
        if (O.isAbrupt) {
            return O;
        }
        // 3. If message is not undefined, then
        if (message !== void 0) {
            // 3. a. Let msg be ? ToString(message).
            const msg = message.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
            // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
            const msgDesc = new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            operations_js_1.$DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
exports.$TypeErrorConstructor = $TypeErrorConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
class $TypeErrorPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    get message() {
        return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'];
    }
    set message(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
    }
    get $name() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $name(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    constructor(realm, errorPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%TypeErrorPrototype%', errorPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$TypeErrorPrototype = $TypeErrorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
class $URIErrorConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, errorConstructor) {
        super(realm, '%URIError%', errorConstructor);
    }
    // http://www.ecma-international.org/ecma-262/#sec-nativeerror
    // 19.5.6.1.1 NativeError ( message )
    performSteps(ctx, thisArgument, [message], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
        const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;
        // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%URIErrorPrototype%", « [[ErrorData]] »).
        const O = function_js_1.$OrdinaryCreateFromConstructor(ctx, newTarget, '%URIErrorPrototype%', { '[[ErrorData]]': void 0 });
        if (O.isAbrupt) {
            return O;
        }
        // 3. If message is not undefined, then
        if (message !== void 0) {
            // 3. a. Let msg be ? ToString(message).
            const msg = message.ToString(ctx);
            if (msg.isAbrupt) {
                return msg;
            }
            // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
            const msgDesc = new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            operations_js_1.$DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
exports.$URIErrorConstructor = $URIErrorConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
class $URIErrorPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    get message() {
        return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'];
    }
    set message(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
    }
    get $name() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'];
    }
    set $name(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
    }
    constructor(realm, errorPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%URIErrorPrototype%', errorPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$URIErrorPrototype = $URIErrorPrototype;
//# sourceMappingURL=error.js.map