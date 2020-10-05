import { DI, Registration, } from '@aurelia/kernel';
import { ILifecycle } from './lifecycle';
import { ContinuationTask, IStartTaskManager, hasAsyncWork, TerminalTask, LifecycleTask, } from './lifecycle-task';
import { Controller } from './templating/controller';
export const IActivator = DI.createInterface('IActivator').withDefault(x => x.singleton(Activator));
/** @internal */
let Activator = /** @class */ (() => {
    class Activator {
        constructor(taskManager) {
            this.taskManager = taskManager;
        }
        static register(container) {
            return Registration.singleton(IActivator, this).register(container);
        }
        activate(host, component, container, flags = 0 /* none */, parentScope) {
            flags = flags === void 0 ? 0 /* none */ : flags;
            const mgr = this.taskManager;
            let task = mgr.runBeforeCompile();
            if (task.done) {
                this.render(host, component, container, flags);
            }
            else {
                task = new ContinuationTask(task, this.render, this, host, component, container, flags);
            }
            if (task.done) {
                task = mgr.runBeforeActivate();
            }
            else {
                task = new ContinuationTask(task, mgr.runBeforeActivate, mgr);
            }
            if (task.done) {
                task = this.activateController(component, flags, parentScope);
            }
            else {
                task = new ContinuationTask(task, this.activateController, this, component, flags, parentScope);
            }
            if (task.done) {
                task = mgr.runAfterActivate();
            }
            else {
                task = new ContinuationTask(task, mgr.runAfterActivate, mgr);
            }
            return task;
        }
        deactivate(component, flags = 0 /* none */) {
            const controller = Controller.getCachedOrThrow(component);
            const mgr = this.taskManager;
            let task = mgr.runBeforeDeactivate();
            if (task.done) {
                const ret = controller.deactivate(controller, null, flags);
                if (hasAsyncWork(ret)) {
                    task = new TerminalTask(ret);
                }
            }
            else {
                task = new ContinuationTask(task, controller.deactivate, controller, controller, null, flags);
            }
            if (task.done) {
                task = mgr.runAfterDeactivate();
            }
            else {
                task = new ContinuationTask(task, mgr.runAfterDeactivate, mgr);
            }
            return task;
        }
        render(host, component, container, flags) {
            const lifecycle = container.get(ILifecycle);
            Controller.forCustomElement(component, lifecycle, host, container, null, flags);
        }
        activateController(component, flags, parentScope) {
            const controller = Controller.getCachedOrThrow(component);
            const ret = controller.activate(controller, null, flags | 32 /* fromBind */, parentScope);
            if (hasAsyncWork(ret)) {
                return new TerminalTask(ret);
            }
            return LifecycleTask.done;
        }
    }
    Activator.inject = [IStartTaskManager];
    return Activator;
})();
export { Activator };
//# sourceMappingURL=activator.js.map