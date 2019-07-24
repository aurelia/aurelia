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
    exports.ISignaler = kernel_1.DI.createInterface('ISignaler').withDefault(x => x.singleton(Signaler));
    /** @internal */
    class Signaler {
        constructor() {
            this.signals = Object.create(null);
        }
        dispatchSignal(name, flags) {
            const listeners = this.signals[name];
            if (listeners === undefined) {
                return;
            }
            for (const listener of listeners.keys()) {
                listener.handleChange(undefined, undefined, flags | 16 /* updateTargetInstance */);
            }
        }
        addSignalListener(name, listener) {
            const signals = this.signals;
            const listeners = signals[name];
            if (listeners === undefined) {
                signals[name] = new Set([listener]);
            }
            else {
                listeners.add(listener);
            }
        }
        removeSignalListener(name, listener) {
            const listeners = this.signals[name];
            if (listeners) {
                listeners.delete(listener);
            }
        }
    }
    exports.Signaler = Signaler;
});
//# sourceMappingURL=signaler.js.map