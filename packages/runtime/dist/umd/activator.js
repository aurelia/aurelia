(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./lifecycle", "./lifecycle-task", "./templating/controller"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Activator = exports.IActivator = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("./lifecycle");
    const lifecycle_task_1 = require("./lifecycle-task");
    const controller_1 = require("./templating/controller");
    exports.IActivator = kernel_1.DI.createInterface('IActivator').withDefault(x => x.singleton(Activator));
    /** @internal */
    let Activator = /** @class */ (() => {
        class Activator {
            constructor(taskManager) {
                this.taskManager = taskManager;
            }
            static register(container) {
                return kernel_1.Registration.singleton(exports.IActivator, this).register(container);
            }
            activate(host, component, container, flags = 0 /* none */, parentScope) {
                flags = flags === void 0 ? 0 /* none */ : flags;
                const mgr = this.taskManager;
                let task = mgr.runBeforeRender();
                if (task.done) {
                    this.render(host, component, container, flags);
                }
                else {
                    task = new lifecycle_task_1.ContinuationTask(task, this.render, this, host, component, container, flags);
                }
                if (task.done) {
                    task = mgr.runBeforeBind();
                }
                else {
                    task = new lifecycle_task_1.ContinuationTask(task, mgr.runBeforeBind, mgr);
                }
                if (task.done) {
                    task = this.activateController(component, flags, parentScope);
                }
                else {
                    task = new lifecycle_task_1.ContinuationTask(task, this.activateController, this, component, flags, parentScope);
                }
                if (task.done) {
                    task = mgr.runAfterAttach();
                }
                else {
                    task = new lifecycle_task_1.ContinuationTask(task, mgr.runAfterAttach, mgr);
                }
                return task;
            }
            deactivate(component, flags = 0 /* none */) {
                const controller = controller_1.Controller.getCachedOrThrow(component);
                const ret = controller.deactivate(controller, null, flags);
                if (lifecycle_task_1.hasAsyncWork(ret)) {
                    return new lifecycle_task_1.TerminalTask(ret);
                }
                return lifecycle_task_1.LifecycleTask.done;
            }
            render(host, component, container, flags) {
                const lifecycle = container.get(lifecycle_1.ILifecycle);
                controller_1.Controller.forCustomElement(component, lifecycle, host, container, void 0, flags);
            }
            activateController(component, flags, parentScope) {
                const controller = controller_1.Controller.getCachedOrThrow(component);
                const ret = controller.activate(controller, null, flags | 32 /* fromBind */, parentScope);
                if (lifecycle_task_1.hasAsyncWork(ret)) {
                    return new lifecycle_task_1.TerminalTask(ret);
                }
                return lifecycle_task_1.LifecycleTask.done;
            }
        }
        Activator.inject = [lifecycle_task_1.IStartTaskManager];
        return Activator;
    })();
    exports.Activator = Activator;
});
//# sourceMappingURL=activator.js.map