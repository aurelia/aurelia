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
        constructor(taskManager) {
            this.taskManager = taskManager;
        }
        static register(container) {
            return kernel_1.Registration.singleton(exports.IActivator, this).register(container);
        }
        activate(host, component, locator, flags = 1024 /* fromStartTask */, parentScope) {
            flags = flags === void 0 ? 0 /* none */ : flags;
            const mgr = this.taskManager;
            let task = mgr.runBeforeRender();
            if (task.done) {
                this.render(host, component, locator, flags);
            }
            else {
                task = new lifecycle_task_1.ContinuationTask(task, this.render, this, host, component, locator, flags);
            }
            if (task.done) {
                task = mgr.runBeforeBind();
            }
            else {
                task = new lifecycle_task_1.ContinuationTask(task, mgr.runBeforeBind, mgr);
            }
            if (task.done) {
                task = this.bind(component, flags, parentScope);
            }
            else {
                task = new lifecycle_task_1.ContinuationTask(task, this.bind, this, component, flags, parentScope);
            }
            if (task.done) {
                task = mgr.runBeforeAttach();
            }
            else {
                task = new lifecycle_task_1.ContinuationTask(task, mgr.runBeforeAttach, mgr);
            }
            if (task.done) {
                this.attach(component, flags);
            }
            else {
                task = new lifecycle_task_1.ContinuationTask(task, this.attach, this, component, flags);
            }
            return task;
        }
        deactivate(component, flags = 2048 /* fromStopTask */) {
            const controller = this.getController(component);
            controller.detach(flags | 32768 /* fromDetach */);
            return controller.unbind(flags | 8192 /* fromUnbind */);
        }
        render(host, component, locator, flags) {
            controller_1.Controller.forCustomElement(component, locator, host, flags);
        }
        bind(component, flags, parentScope) {
            return this.getController(component).bind(flags | 4096 /* fromBind */, parentScope);
        }
        attach(component, flags) {
            this.getController(component).attach(flags | 16384 /* fromAttach */);
        }
        getController(component) {
            return controller_1.Controller.forCustomElement(component, (void 0), (void 0));
        }
    }
    exports.Activator = Activator;
    Activator.inject = [lifecycle_task_1.IStartTaskManager];
});
//# sourceMappingURL=activator.js.map