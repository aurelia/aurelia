import { DI, resolve } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';
export class HookInvocationTracker {
    get promise() {
        this.setTimeout(this.aggregator.config.resolveTimeoutMs);
        return this._promise;
    }
    constructor(aggregator, methodName) {
        this.aggregator = aggregator;
        this.methodName = methodName;
        this.timeout = -1;
        this.notifyHistory = [];
        this.platform = aggregator.platform;
        this._promise = new Promise(resolve => this.$resolve = resolve);
    }
    notify(componentName, step = '') {
        this.notifyHistory.push(componentName);
        this.aggregator.notify(componentName, step, this);
    }
    resolve() {
        const $resolve = this.$resolve;
        // Also re-create the promise immediately, for any potential subsequent await
        this._promise = new Promise(resolve => this.$resolve = resolve);
        this.clearTimeout();
        $resolve();
    }
    setTimeout(ms) {
        if (this.timeout === -1) {
            this.timeout = this.platform.setTimeout(() => {
                throw new Error(`${this.methodName} timed out after ${ms}ms. Notification history: [${this.notifyHistory.join(',')}]. Lifecycle call history: [${this.aggregator.notifyHistory.join(',')}]`);
            }, ms);
        }
    }
    clearTimeout() {
        const timeout = this.timeout;
        if (timeout >= 0) {
            this.timeout = -1;
            this.platform.clearTimeout(timeout);
        }
    }
    dispose() {
        const $this = this;
        this.clearTimeout();
        $this.notifyHistory = void 0;
        $this._promise = void 0;
        $this.$resolve = void 0;
        $this.platform = void 0;
        $this.aggregator = void 0;
    }
}
export const IHIAConfig = /*@__PURE__*/ DI.createInterface('IHIAConfig');
export class HIAConfig {
    constructor(resolveLabels, resolveTimeoutMs) {
        this.resolveLabels = resolveLabels;
        this.resolveTimeoutMs = resolveTimeoutMs;
    }
}
export const IHookInvocationAggregator = /*@__PURE__*/ DI.createInterface('IHookInvocationAggregator', x => x.singleton(HookInvocationAggregator));
export class HookInvocationAggregator {
    constructor() {
        this.notifyHistory = [];
        this.phase = '';
        this.platform = resolve(IPlatform);
        this.config = resolve(IHIAConfig);
        this.binding = new HookInvocationTracker(this, 'binding');
        this.bound = new HookInvocationTracker(this, 'bound');
        this.attaching = new HookInvocationTracker(this, 'attaching');
        this.attached = new HookInvocationTracker(this, 'attached');
        this.detaching = new HookInvocationTracker(this, 'detaching');
        this.unbinding = new HookInvocationTracker(this, 'unbinding');
        this.$$dispose = new HookInvocationTracker(this, 'dispose');
        this.canLoad = new HookInvocationTracker(this, 'canLoad');
        this.loading = new HookInvocationTracker(this, 'loading');
        this.canUnload = new HookInvocationTracker(this, 'canUnload');
        this.unloading = new HookInvocationTracker(this, 'unloading');
    }
    notify(componentName, step, tracker) {
        let label = `${this.phase}:${componentName}.${tracker.methodName}`;
        if (step) {
            label += `.${step}`;
        }
        this.notifyHistory.push(label);
        if (this.config.resolveLabels.includes(label)) {
            tracker.resolve();
        }
    }
    setPhase(label) {
        this.phase = label;
    }
    dispose() {
        this.binding.dispose();
        this.bound.dispose();
        this.attaching.dispose();
        this.attached.dispose();
        this.detaching.dispose();
        this.unbinding.dispose();
        this.$$dispose.dispose();
        this.canLoad.dispose();
        this.loading.dispose();
        this.canUnload.dispose();
        this.unloading.dispose();
        const $this = this;
        $this.notifyHistory = void 0;
        $this.platform = void 0;
        $this.config = void 0;
        $this.binding = void 0;
        $this.bound = void 0;
        $this.attaching = void 0;
        $this.attached = void 0;
        $this.detaching = void 0;
        $this.unbinding = void 0;
        $this.$$dispose = void 0;
        $this.canLoad = void 0;
        $this.loading = void 0;
        $this.canUnload = void 0;
        $this.unloading = void 0;
    }
}
//# sourceMappingURL=hook-invocation-tracker.js.map