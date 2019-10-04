(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function lifecycleLogger(name) {
        const lifecycles = [
            'canLeave', 'leave',
            'canEnter', 'enter',
            'created',
            'binding', 'bound',
            'attaching', 'attached',
            'detaching', 'detached',
            'unbinding', 'unbound',
        ];
        return function (target) {
            for (const lifecycle of lifecycles) {
                const existing = target.prototype[lifecycle];
                if (existing !== void 0) {
                    target.prototype[lifecycle] = function (...args) {
                        console.log(`${name} ${lifecycle}`, args);
                        return existing.apply(target, args);
                    };
                }
                else {
                    target.prototype[lifecycle] = function (...args) {
                        console.log(`${name} ${lifecycle}`, args);
                        if (lifecycle.startsWith('can')) {
                            return true;
                        }
                    };
                }
            }
        };
    }
    exports.lifecycleLogger = lifecycleLogger;
    class LifecycleClass {
        canEnter() { console.log(`name canEnter`); return true; }
        enter(params) { console.log(`name enter`); }
        created() { console.log(`name created`); }
        binding() { console.log(`name binding`); }
        bound() { console.log(`name bound`); }
        attaching() { console.log(`name attaching`); }
        attached() { console.log(`name attached`); }
        canLeave() { console.log(`name canLeave`); return true; }
        leave() { console.log(`name leave`); }
        detaching() { console.log(`name detaching`); }
        detached() { console.log(`name detached`); }
        unbinding() { console.log(`name unbinding`); }
        unbound() { console.log(`name unbound`); }
    }
    exports.LifecycleClass = LifecycleClass;
});
//# sourceMappingURL=lifecycle-logger.js.map