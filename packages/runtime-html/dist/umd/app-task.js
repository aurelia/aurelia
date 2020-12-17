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
    exports.AppTask = exports.IAppTask = void 0;
    /* eslint-disable @typescript-eslint/promise-function-async */
    const kernel_1 = require("@aurelia/kernel");
    exports.IAppTask = kernel_1.DI.createInterface('IAppTask');
    class $AppTask {
        constructor(key) {
            this.key = key;
            this.slot = (void 0);
            this.callback = (void 0);
            this.container = (void 0);
        }
        static with(key) {
            return new $AppTask(key);
        }
        beforeCreate() {
            return this.at('beforeCreate');
        }
        hydrating() {
            return this.at('hydrating');
        }
        hydrated() {
            return this.at('hydrated');
        }
        beforeActivate() {
            return this.at('beforeActivate');
        }
        afterActivate() {
            return this.at('afterActivate');
        }
        beforeDeactivate() {
            return this.at('beforeDeactivate');
        }
        afterDeactivate() {
            return this.at('afterDeactivate');
        }
        at(slot) {
            this.slot = slot;
            return this;
        }
        call(fn) {
            this.callback = fn;
            return this;
        }
        register(container) {
            return this.container = container.register(kernel_1.Registration.instance(exports.IAppTask, this));
        }
        run() {
            const callback = this.callback;
            const instance = this.container.get(this.key);
            return callback(instance);
        }
    }
    exports.AppTask = $AppTask;
});
//# sourceMappingURL=app-task.js.map