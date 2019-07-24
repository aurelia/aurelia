(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const slice = Array.prototype.slice;
    const noop = kernel_1.PLATFORM.noop;
    // note: string.length is the only property of any primitive that is not a function,
    // so we can hardwire it to that and simply return undefined for anything else
    // note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
    class PrimitiveObserver {
        constructor(obj, propertyKey) {
            this.doNotCache = true;
            // we don't need to store propertyName because only 'length' can return a useful value
            if (propertyKey === 'length') {
                // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
                this.obj = obj;
                this.getValue = this.getStringLength;
            }
            else {
                this.getValue = this.returnUndefined;
            }
        }
        getStringLength() {
            return this.obj.length;
        }
        returnUndefined() {
            return undefined;
        }
    }
    exports.PrimitiveObserver = PrimitiveObserver;
    PrimitiveObserver.prototype.setValue = noop;
    PrimitiveObserver.prototype.subscribe = noop;
    PrimitiveObserver.prototype.unsubscribe = noop;
    PrimitiveObserver.prototype.dispose = noop;
});
//# sourceMappingURL=primitive-observer.js.map