import { DI, IServiceLocator, Registration, } from '@aurelia/kernel';
export const LifecycleTask = {
    done: {
        done: true,
        canCancel() { return false; },
        cancel() { return; },
        wait() { return Promise.resolve(); }
    }
};
export var TaskSlot;
(function (TaskSlot) {
    TaskSlot[TaskSlot["beforeCreate"] = 0] = "beforeCreate";
    TaskSlot[TaskSlot["beforeRender"] = 1] = "beforeRender";
    TaskSlot[TaskSlot["beforeBind"] = 2] = "beforeBind";
    TaskSlot[TaskSlot["beforeAttach"] = 3] = "beforeAttach";
})(TaskSlot || (TaskSlot = {}));
export const IStartTask = DI.createInterface('IStartTask').noDefault();
var TaskType;
(function (TaskType) {
    TaskType[TaskType["with"] = 0] = "with";
    TaskType[TaskType["from"] = 1] = "from";
})(TaskType || (TaskType = {}));
// eslint-disable-next-line @typescript-eslint/class-name-casing
export const StartTask = class $StartTask {
    constructor(type) {
        this.type = type;
        this._slot = void 0;
        this._promiseOrTask = void 0;
        this._container = void 0;
        this._key = void 0;
        this._callback = void 0;
        this._task = void 0;
    }
    get slot() {
        if (this._slot === void 0) {
            throw new Error('StartTask.slot is not set');
        }
        return this._slot;
    }
    get promiseOrTask() {
        if (this._promiseOrTask === void 0) {
            throw new Error('StartTask.promiseOrTask is not set');
        }
        return this._promiseOrTask;
    }
    get container() {
        if (this._container === void 0) {
            throw new Error('StartTask.container is not set');
        }
        return this._container;
    }
    get key() {
        if (this._key === void 0) {
            throw new Error('StartTask.key is not set');
        }
        return this._key;
    }
    get callback() {
        if (this._callback === void 0) {
            throw new Error('StartTask.callback is not set');
        }
        return this._callback;
    }
    get task() {
        if (this._task === void 0) {
            throw new Error('StartTask.task is not set');
        }
        return this._task;
    }
    static with(key) {
        const task = new $StartTask(0 /* with */);
        task._key = key;
        return task;
    }
    static from(promiseOrTask) {
        const task = new $StartTask(1 /* from */);
        task._promiseOrTask = promiseOrTask;
        return task;
    }
    beforeCreate() {
        return this.at(0 /* beforeCreate */);
    }
    beforeRender() {
        return this.at(1 /* beforeRender */);
    }
    beforeBind() {
        return this.at(2 /* beforeBind */);
    }
    beforeAttach() {
        return this.at(3 /* beforeAttach */);
    }
    at(slot) {
        this._slot = slot;
        return this;
    }
    call(fn) {
        this._callback = fn;
        return this;
    }
    register(container) {
        return this._container = container.register(Registration.instance(IStartTask, this));
    }
    resolveTask() {
        if (this._task === void 0) {
            switch (this.type) {
                case 0 /* with */:
                    this._task = new ProviderTask(this.container, this.key, this.callback);
                    break;
                case 1 /* from */:
                    this._task = new TerminalTask(this.promiseOrTask);
                    break;
            }
        }
        return this.task;
    }
};
export const IStartTaskManager = DI.createInterface('IStartTaskManager').noDefault();
export class StartTaskManager {
    constructor(locator) {
        this.locator = locator;
    }
    static register(container) {
        return Registration.singleton(IStartTaskManager, this).register(container);
    }
    runBeforeCreate(locator = this.locator) {
        return this.run(0 /* beforeCreate */, locator);
    }
    runBeforeRender(locator = this.locator) {
        return this.run(1 /* beforeRender */, locator);
    }
    runBeforeBind(locator = this.locator) {
        return this.run(2 /* beforeBind */, locator);
    }
    runBeforeAttach(locator = this.locator) {
        return this.run(3 /* beforeAttach */, locator);
    }
    run(slot, locator = this.locator) {
        const tasks = locator.getAll(IStartTask)
            .filter(startTask => startTask.slot === slot)
            .map(startTask => startTask.resolveTask())
            .filter(task => !task.done);
        if (tasks.length === 0) {
            return LifecycleTask.done;
        }
        return new AggregateTerminalTask(tasks);
    }
}
StartTaskManager.inject = [IServiceLocator];
export class PromiseTask {
    constructor(promise, next, context, ...args) {
        this.done = false;
        this.isCancelled = false;
        this.hasStarted = false;
        this.promise = promise.then(value => {
            if (this.isCancelled === true) {
                return;
            }
            this.hasStarted = true;
            if (next !== null) {
                const nextResult = next.call(context, value, ...args);
                if (nextResult === void 0) {
                    this.done = true;
                }
                else {
                    const nextPromise = nextResult.then instanceof Function
                        ? nextResult
                        : nextResult.wait();
                    return nextPromise.then(() => {
                        this.done = true;
                    });
                }
            }
        });
    }
    canCancel() {
        return !this.hasStarted;
    }
    cancel() {
        if (this.canCancel()) {
            this.isCancelled = true;
        }
    }
    wait() {
        return this.promise;
    }
}
export class ProviderTask {
    constructor(container, key, callback) {
        this.container = container;
        this.key = key;
        this.callback = callback;
        this.done = false;
    }
    canCancel() {
        return false;
    }
    cancel() {
        return;
    }
    wait() {
        if (this.promise === void 0) {
            const instance = this.container.get(this.key);
            const maybePromiseOrTask = this.callback.call(void 0, instance);
            this.promise = maybePromiseOrTask === void 0
                ? Promise.resolve()
                : maybePromiseOrTask.then instanceof Function
                    ? maybePromiseOrTask
                    : maybePromiseOrTask.wait();
            this.promise = this.promise.then(() => {
                this.done = true;
                this.container = (void 0);
                this.key = (void 0);
                this.callback = (void 0);
            }).catch(e => { throw e; });
        }
        return this.promise;
    }
}
export class ContinuationTask {
    constructor(antecedent, next, context, ...args) {
        this.done = false;
        this.hasStarted = false;
        this.isCancelled = false;
        const promise = antecedent.then instanceof Function
            ? antecedent
            : antecedent.wait();
        this.promise = promise.then(() => {
            if (this.isCancelled === true) {
                return;
            }
            this.hasStarted = true;
            const nextResult = next.call(context, ...args);
            if (nextResult === void 0) {
                this.done = true;
            }
            else {
                const nextPromise = nextResult.then instanceof Function
                    ? nextResult
                    : nextResult.wait();
                return nextPromise.then(() => {
                    this.done = true;
                });
            }
        });
    }
    canCancel() {
        return !this.hasStarted;
    }
    cancel() {
        if (this.canCancel()) {
            this.isCancelled = true;
        }
    }
    wait() {
        return this.promise;
    }
}
export class TerminalTask {
    constructor(antecedent) {
        this.done = false;
        this.promise = antecedent.then instanceof Function
            ? antecedent
            : antecedent.wait();
        this.promise.then(() => {
            this.done = true;
        }).catch(e => { throw e; });
    }
    canCancel() {
        return false;
    }
    cancel() {
        return;
    }
    wait() {
        return this.promise;
    }
}
export class AggregateContinuationTask {
    constructor(antecedents, next, context, ...args) {
        this.done = false;
        this.hasStarted = false;
        this.isCancelled = false;
        this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
            if (this.isCancelled === true) {
                return;
            }
            this.hasStarted = true;
            const nextResult = next.call(context, ...args);
            if (nextResult === void 0) {
                this.done = true;
            }
            else {
                return nextResult.wait().then(() => {
                    this.done = true;
                });
            }
        });
    }
    canCancel() {
        return !this.hasStarted;
    }
    cancel() {
        if (this.canCancel()) {
            this.isCancelled = true;
        }
    }
    wait() {
        return this.promise;
    }
}
export class AggregateTerminalTask {
    constructor(antecedents) {
        this.done = false;
        this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
            this.done = true;
        });
    }
    canCancel() {
        return false;
    }
    cancel() {
        return;
    }
    wait() {
        return this.promise;
    }
}
export function hasAsyncWork(value) {
    return !(value === void 0 || value.done === true);
}
//# sourceMappingURL=lifecycle-task.js.map