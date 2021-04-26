"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppTask = exports.IAppTask = void 0;
const kernel_1 = require("@aurelia/kernel");
exports.IAppTask = kernel_1.DI.createInterface('IAppTask');
class $AppTask {
    constructor(slot, key, cb) {
        /** @internal */
        this.c = (void 0);
        this.slot = slot;
        this.k = key;
        this.cb = cb;
    }
    register(container) {
        return this.c = container.register(kernel_1.Registration.instance(exports.IAppTask, this));
    }
    run() {
        const key = this.k;
        const cb = this.cb;
        return key === null
            ? cb()
            : cb(this.c.get(key));
    }
}
exports.AppTask = Object.freeze({
    beforeCreate: createAppTaskSlotHook('beforeCreate'),
    hydrating: createAppTaskSlotHook('hydrating'),
    hydrated: createAppTaskSlotHook('hydrated'),
    beforeActivate: createAppTaskSlotHook('beforeActivate'),
    afterActivate: createAppTaskSlotHook('afterActivate'),
    beforeDeactivate: createAppTaskSlotHook('beforeDeactivate'),
    afterDeactivate: createAppTaskSlotHook('afterDeactivate'),
});
function createAppTaskSlotHook(slotName) {
    function appTaskFactory(keyOrCallback, callback) {
        if (typeof callback === 'function') {
            return new $AppTask(slotName, keyOrCallback, callback);
        }
        return new $AppTask(slotName, null, keyOrCallback);
    }
    return appTaskFactory;
}
//# sourceMappingURL=app-task.js.map