import { $BuiltinFunction, $OrdinaryCreateFromConstructor, } from '../types/function.js';
import { $TypeError, } from '../types/error.js';
import { $Object, } from '../types/object.js';
import { $PropertyDescriptor, } from '../types/property-descriptor.js';
import { $DefinePropertyOrThrow, } from '../operations.js';
import { $String, } from '../types/string.js';
// http://www.ecma-international.org/ecma-262/#sec-error-constructor
export class $ErrorConstructor extends $BuiltinFunction {
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
        const O = $OrdinaryCreateFromConstructor(ctx, newTarget, '%ErrorPrototype%', { '[[ErrorData]]': void 0 });
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
            const msgDesc = new $PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-error-prototype-object
export class $ErrorPrototype extends $Object {
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
// http://www.ecma-international.org/ecma-262/#sec-error.prototype.tostring
export class $ErrorPrototype_toString extends $BuiltinFunction {
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let O be the this value.
        const O = thisArgument;
        // 2. If Type(O) is not Object, throw a TypeError exception.
        if (!O.isObject) {
            return new $TypeError(realm, `Error.prototype.toString called on ${O}, but expected an object`);
        }
        // 3. Let name be ? Get(O, "name").
        let name = O['[[Get]]'](ctx, intrinsics.$name, O);
        if (name.isAbrupt) {
            return name;
        }
        // 4. If name is undefined, set name to "Error"; otherwise set name to ? ToString(name).
        if (name.isUndefined) {
            name = new $String(realm, 'Error');
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
            msg = new $String(realm, '');
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
        return new $String(realm, `${name['[[Value]]']}: ${msg['[[Value]]']}`);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
export class $EvalErrorConstructor extends $BuiltinFunction {
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
        const O = $OrdinaryCreateFromConstructor(ctx, newTarget, '%EvalErrorPrototype%', { '[[ErrorData]]': void 0 });
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
            const msgDesc = new $PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
export class $EvalErrorPrototype extends $Object {
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
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
export class $RangeErrorConstructor extends $BuiltinFunction {
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
        const O = $OrdinaryCreateFromConstructor(ctx, newTarget, '%RangeErrorPrototype%', { '[[ErrorData]]': void 0 });
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
            const msgDesc = new $PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
export class $RangeErrorPrototype extends $Object {
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
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
export class $ReferenceErrorConstructor extends $BuiltinFunction {
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
        const O = $OrdinaryCreateFromConstructor(ctx, newTarget, '%ReferenceErrorPrototype%', { '[[ErrorData]]': void 0 });
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
            const msgDesc = new $PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
export class $ReferenceErrorPrototype extends $Object {
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
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
export class $SyntaxErrorConstructor extends $BuiltinFunction {
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
        const O = $OrdinaryCreateFromConstructor(ctx, newTarget, '%SyntaxErrorPrototype%', { '[[ErrorData]]': void 0 });
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
            const msgDesc = new $PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
export class $SyntaxErrorPrototype extends $Object {
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
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
export class $TypeErrorConstructor extends $BuiltinFunction {
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
        const O = $OrdinaryCreateFromConstructor(ctx, newTarget, '%TypeErrorPrototype%', { '[[ErrorData]]': void 0 });
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
            const msgDesc = new $PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
export class $TypeErrorPrototype extends $Object {
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
// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
export class $URIErrorConstructor extends $BuiltinFunction {
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
        const O = $OrdinaryCreateFromConstructor(ctx, newTarget, '%URIErrorPrototype%', { '[[ErrorData]]': void 0 });
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
            const msgDesc = new $PropertyDescriptor(realm, intrinsics.message, {
                '[[Value]]': msg,
                '[[Writable]]': intrinsics.true,
                '[[Enumerable]]': intrinsics.false,
                '[[Configurable]]': intrinsics.true,
            });
            // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
            $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
        }
        // 4. Return O.
        return O;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
export class $URIErrorPrototype extends $Object {
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
//# sourceMappingURL=error.js.map