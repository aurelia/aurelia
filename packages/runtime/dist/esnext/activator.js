import { DI, Registration, } from '@aurelia/kernel';
import { ContinuationTask, } from './lifecycle-task';
import { Controller } from './templating/controller';
export const IActivator = DI.createInterface('IActivator').withDefault(x => x.singleton(Activator));
/** @internal */
export class Activator {
    static register(container) {
        return Registration.singleton(IActivator, this).register(container);
    }
    activate(host, component, locator, flags = 1024 /* fromStartTask */, parentScope) {
        flags = flags === void 0 ? 0 /* none */ : flags;
        const controller = Controller.forCustomElement(component, locator, host, flags);
        let task = controller.bind(flags | 4096 /* fromBind */, parentScope);
        if (task.done) {
            controller.attach(flags | 16384 /* fromAttach */);
        }
        else {
            task = new ContinuationTask(task, controller.attach, controller, flags | 16384 /* fromAttach */);
        }
        return task;
    }
    deactivate(component, flags = 2048 /* fromStopTask */) {
        const controller = Controller.forCustomElement(component, (void 0), (void 0));
        controller.detach(flags | 32768 /* fromDetach */);
        return controller.unbind(flags | 8192 /* fromUnbind */);
    }
}
//# sourceMappingURL=activator.js.map