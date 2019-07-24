import { DI, Registration, } from '@aurelia/kernel';
import { ContinuationTask, IStartTaskManager, } from './lifecycle-task';
import { Controller } from './templating/controller';
export const IActivator = DI.createInterface('IActivator').withDefault(x => x.singleton(Activator));
/** @internal */
export class Activator {
    constructor(taskManager) {
        this.taskManager = taskManager;
    }
    static register(container) {
        return Registration.singleton(IActivator, this).register(container);
    }
    activate(host, component, locator, flags = 1024 /* fromStartTask */, parentScope) {
        flags = flags === void 0 ? 0 /* none */ : flags;
        const mgr = this.taskManager;
        let task = mgr.runBeforeRender();
        if (task.done) {
            this.render(host, component, locator, flags);
        }
        else {
            task = new ContinuationTask(task, this.render, this, host, component, locator, flags);
        }
        if (task.done) {
            task = mgr.runBeforeBind();
        }
        else {
            task = new ContinuationTask(task, mgr.runBeforeBind, mgr);
        }
        if (task.done) {
            task = this.bind(component, flags, parentScope);
        }
        else {
            task = new ContinuationTask(task, this.bind, this, component, flags, parentScope);
        }
        if (task.done) {
            task = mgr.runBeforeAttach();
        }
        else {
            task = new ContinuationTask(task, mgr.runBeforeAttach, mgr);
        }
        if (task.done) {
            this.attach(component, flags);
        }
        else {
            task = new ContinuationTask(task, this.attach, this, component, flags);
        }
        return task;
    }
    deactivate(component, flags = 2048 /* fromStopTask */) {
        const controller = this.getController(component);
        controller.detach(flags | 32768 /* fromDetach */);
        return controller.unbind(flags | 8192 /* fromUnbind */);
    }
    render(host, component, locator, flags) {
        Controller.forCustomElement(component, locator, host, flags);
    }
    bind(component, flags, parentScope) {
        return this.getController(component).bind(flags | 4096 /* fromBind */, parentScope);
    }
    attach(component, flags) {
        this.getController(component).attach(flags | 16384 /* fromAttach */);
    }
    getController(component) {
        return Controller.forCustomElement(component, (void 0), (void 0));
    }
}
Activator.inject = [IStartTaskManager];
//# sourceMappingURL=activator.js.map