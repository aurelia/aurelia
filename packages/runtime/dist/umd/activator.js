(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./lifecycle-task", "./templating/controller"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_task_1 = require("./lifecycle-task");
    const controller_1 = require("./templating/controller");
    exports.IActivator = kernel_1.DI.createInterface('IActivator').withDefault(x => x.singleton(Activator));
    /** @internal */
    class Activator {
        static register(container) {
            return kernel_1.Registration.singleton(exports.IActivator, this).register(container);
        }
        activate(host, component, locator, flags = 1024 /* fromStartTask */, parentScope) {
            flags = flags === void 0 ? 0 /* none */ : flags;
            const controller = controller_1.Controller.forCustomElement(component, locator, host, flags);
            let task = controller.bind(flags | 4096 /* fromBind */, parentScope);
            if (task.done) {
                controller.attach(flags | 16384 /* fromAttach */);
            }
            else {
                task = new lifecycle_task_1.ContinuationTask(task, controller.attach, controller, flags | 16384 /* fromAttach */);
            }
            return task;
        }
        deactivate(component, flags = 2048 /* fromStopTask */) {
            const controller = controller_1.Controller.forCustomElement(component, (void 0), (void 0));
            controller.detach(flags | 32768 /* fromDetach */);
            return controller.unbind(flags | 8192 /* fromUnbind */);
        }
    }
    exports.Activator = Activator;
});
//# sourceMappingURL=activator.js.map