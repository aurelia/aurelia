import { DI, Registration, } from '../../../kernel/dist/native-modules/index.js';
export const IAppTask = DI.createInterface('IAppTask');
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
        return this.container = container.register(Registration.instance(IAppTask, this));
    }
    run() {
        const callback = this.callback;
        const instance = this.container.get(this.key);
        return callback(instance);
    }
}
export const AppTask = $AppTask;
//# sourceMappingURL=app-task.js.map