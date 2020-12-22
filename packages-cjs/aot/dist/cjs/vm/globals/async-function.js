"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$AsyncFunctionStart = exports.$AsyncFunctionPrototype = exports.$AsyncFunctionConstructor = void 0;
const function_js_1 = require("../types/function.js");
const object_js_1 = require("../types/object.js");
const function_js_2 = require("./function.js");
const list_js_1 = require("../types/list.js");
const operations_js_1 = require("../operations.js");
// http://www.ecma-international.org/ecma-262/#sec-async-function-objects
// 25.7 AsyncFunction Objects
// http://www.ecma-international.org/ecma-262/#sec-async-function-constructor
// 25.7.1 The AsyncFunction Constructor
class $AsyncFunctionConstructor extends function_js_1.$BuiltinFunction {
    // http://www.ecma-international.org/ecma-262/#sec-async-function-constructor-prototype
    // 25.7.2.2 AsyncFunction.prototype
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    // http://www.ecma-international.org/ecma-262/#sec-async-function-constructor-length
    // 25.7.2.1 AsyncFunction.length
    get length() {
        return this.getProperty(this.realm['[[Intrinsics]]'].length)['[[Value]]'];
    }
    set length(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].length, value, false, false, true);
    }
    constructor(realm, functionConstructor) {
        super(realm, '%AsyncFunction%', functionConstructor);
    }
    // http://www.ecma-international.org/ecma-262/#sec-async-function-constructor-arguments
    // 25.7.1.1 AsyncFunction ( p1 , p2 , … , pn , body )
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Let C be the active function object.
        // 2. Let args be the argumentsList that was passed to this function by [[Call]] or [[Construct]].
        // 3. Return CreateDynamicFunction(C, NewTarget, "async", args).
        return function_js_2.$CreateDynamicFunction(ctx, this, NewTarget, 8 /* async */, argumentsList);
    }
}
exports.$AsyncFunctionConstructor = $AsyncFunctionConstructor;
// http://www.ecma-international.org/ecma-262/#sec-async-function-prototype-properties
// 25.7.3 Properties of the AsyncFunction Prototype Object
class $AsyncFunctionPrototype extends object_js_1.$Object {
    // http://www.ecma-international.org/ecma-262/#sec-async-function-prototype-properties-constructor
    // 25.7.3.1 AsyncFunction.prototype.constructor
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value, false, false, true);
    }
    // http://www.ecma-international.org/ecma-262/#sec-async-function-prototype-properties-toStringTag
    // 25.7.3.2 AsyncFunction.prototype [ @@toStringTag ]
    get '@@toStringTag'() {
        return this.getProperty(this.realm['[[Intrinsics]]']['@@toStringTag'])['[[Value]]'];
    }
    set '@@toStringTag'(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]']['@@toStringTag'], value, false, false, true);
    }
    constructor(realm, functionPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%AsyncFunctionPrototype%', functionPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$AsyncFunctionPrototype = $AsyncFunctionPrototype;
// http://www.ecma-international.org/ecma-262/#sec-async-function-instances
// 25.7.4 AsyncFunction Instances
// http://www.ecma-international.org/ecma-262/#sec-async-function-instances-length
// 25.7.4.1 length
// http://www.ecma-international.org/ecma-262/#sec-async-function-instances-name
// 25.7.4.2 name
// http://www.ecma-international.org/ecma-262/#sec-async-functions-abstract-operations
// 25.7.5 Async Functions Abstract Operations
// http://www.ecma-international.org/ecma-262/#sec-async-functions-abstract-operations-async-function-start
// 25.7.5.1 AsyncFunctionStart ( promiseCapability , asyncFunctionBody )
function $AsyncFunctionStart(ctx, promiseCapability, asyncFunctionBody) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const stack = realm.stack;
    // 1. Let runningContext be the running execution context.
    const runningContext = ctx;
    // 2. Let asyncContext be a copy of runningContext.
    const asyncContext = runningContext.makeCopy();
    // 3. Set the code evaluation state of asyncContext such that when evaluation is resumed for that execution context the following steps will be performed:
    asyncContext.onResume = function (resumptionValue) {
        // 3. a. Let result be the result of evaluating asyncFunctionBody.
        const result = asyncFunctionBody.Evaluate(asyncContext);
        if (result.isAbrupt) {
            return result;
        }
        // 3. b. Assert: If we return here, the async function either threw an exception or performed an implicit or explicit return; all awaiting is done.
        // 3. c. Remove asyncContext from the execution context stack and restore the execution context that is at the top of the execution context stack as the running execution context.
        stack.pop();
        // 3. d. If result.[[Type]] is normal, then
        if (result['[[Type]]'] === 1 /* normal */) {
            // 3. d. i. Perform ! Call(promiseCapability.[[Resolve]], undefined, « undefined »).
            operations_js_1.$Call(asyncContext, promiseCapability['[[Resolve]]'], intrinsics.undefined, new list_js_1.$List(intrinsics.undefined));
        }
        // 3. e. Else if result.[[Type]] is return, then
        else if (result['[[Type]]'] === 4 /* return */) {
            // 3. e. i. Perform ! Call(promiseCapability.[[Resolve]], undefined, « result.[[Value]] »).
            operations_js_1.$Call(asyncContext, promiseCapability['[[Resolve]]'], intrinsics.undefined, new list_js_1.$List(result));
        }
        // 3. f. Else,
        else {
            // 3. f. i. Assert: result.[[Type]] is throw.
            // 3. f. ii. Perform ! Call(promiseCapability.[[Reject]], undefined, « result.[[Value]] »).
            operations_js_1.$Call(asyncContext, promiseCapability['[[Reject]]'], intrinsics.undefined, new list_js_1.$List(result)); // TODO: is this cast safe?
        }
        // 3. g. Return.
        return intrinsics.undefined;
    };
    // 4. Push asyncContext onto the execution context stack; asyncContext is now the running execution context.
    stack.push(asyncContext);
    // 5. Resume the suspended evaluation of asyncContext. Let result be the value returned by the resumed computation.
    asyncContext.resume();
    const result = asyncContext.onResume(intrinsics.undefined); // TODO: sure about this?
    // 6. Assert: When we return here, asyncContext has already been removed from the execution context stack and runningContext is the currently running execution context.
    // 7. Assert: result is a normal completion with a value of undefined. The possible sources of completion values are Await or, if the async function doesn't await anything, the step 3.g above.
    // 8. Return.
    return intrinsics.undefined;
}
exports.$AsyncFunctionStart = $AsyncFunctionStart;
//# sourceMappingURL=async-function.js.map