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
        'binding', 'bound',
        'beforeAttach', 'attaching',
        'detaching',
        'unbinding',
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
    binding() { console.log(`name binding`); }
    bound() { console.log(`name bound`); }
    beforeAttach() { console.log(`name beforeAttach`); }
    attaching() { console.log(`name attaching`); }
    canUnload() { console.log(`name canUnload`); return true; }
    unload() { console.log(`name unload`); }
    detaching() { console.log(`name detaching`); }
    unbinding() { console.log(`name unbinding`); }
}
exports.LifecycleClass = LifecycleClass;
//# sourceMappingURL=lifecycle-logger.js.map