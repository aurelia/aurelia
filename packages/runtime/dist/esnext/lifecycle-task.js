export const LifecycleTask = {
    done: {
        done: true,
        canCancel() { return false; },
        cancel() { return; },
        wait() { return Promise.resolve(); }
    }
};
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
                // @ts-ignore
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