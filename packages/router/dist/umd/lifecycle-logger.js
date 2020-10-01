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
    exports.LifecycleClass = exports.lifecycleLogger = void 0;
    /**
     * @internal - Will be removed
     */
    function lifecycleLogger(name) {
        const lifecycles = [
            'canUnload', 'unload',
            'canLoad', 'load',
            'created',
            'beforeBind', 'afterBind',
            'beforeAttach', 'afterAttach',
            'beforeDetach', 'afterDetach',
            'beforeUnbind', 'afterUnbind',
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
        canLoad() { console.log(`name canLoad`); return true; }
        load(params) { console.log(`name load`); }
        created() { console.log(`name created`); }
        beforeBind() { console.log(`name binding`); }
        afterBind() { console.log(`name bound`); }
        beforeAttach() { console.log(`name beforeAttach`); }
        afterAttach() { console.log(`name afterAttach`); }
        canUnload() { console.log(`name canUnload`); return true; }
        unload() { console.log(`name unload`); }
        beforeDetach() { console.log(`name beforeDetach`); }
        afterDetach() { console.log(`name afterDetach`); }
        beforeUnbind() { console.log(`name beforeUnbind`); }
        afterUnbind() { console.log(`name unbound`); }
    }
    exports.LifecycleClass = LifecycleClass;
});
//# sourceMappingURL=lifecycle-logger.js.map