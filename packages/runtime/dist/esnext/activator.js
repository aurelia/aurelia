import { DI, Registration, } from '@aurelia/kernel';
import { ILifecycle } from './lifecycle';
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
    activate(host, component, container, flags = 1024 /* fromStartTask */, parentScope) {
        flags = flags === void 0 ? 0 /* none */ : flags;
        const mgr = this.taskManager;
        let task = mgr.runBeforeRender();
        if (task.done) {
            this.render(host, component, container, flags);
        }
        else {
            task = new ContinuationTask(task, this.render, this, host, component, container, flags);
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
        const controller = Controller.getCachedOrThrow(component);
        controller.detach(flags | 32768 /* fromDetach */);
        return controller.unbind(flags | 8192 /* fromUnbind */);
    }
    render(host, component, container, flags) {
        const lifecycle = container.get(ILifecycle);
        Controller.forCustomElement(component, lifecycle, host, container, void 0, flags);
    }
    bind(component, flags, parentScope) {
        return Controller.getCachedOrThrow(component).bind(flags | 4096 /* fromBind */, parentScope);
    }
    attach(component, flags) {
        Controller.getCachedOrThrow(component).attach(flags | 16384 /* fromAttach */);
    }
}
Activator.inject = [IStartTaskManager];
//# sourceMappingURL=activator.js.map