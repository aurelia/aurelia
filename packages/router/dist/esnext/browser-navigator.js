import { Reporter } from '@aurelia/kernel';
import { IDOM, ILifecycle } from '@aurelia/runtime';
import { Queue } from './queue';
export class BrowserNavigator {
    constructor(lifecycle, dom) {
        this.lifecycle = lifecycle;
        this.allowedExecutionCostWithinTick = 2; // Limit no of executed actions within the same RAF (due to browser limitation)
        this.isActive = false;
        this.options = {
            useUrlFragmentHash: true,
            // tslint:disable-next-line:no-empty
            callback: () => { },
        };
        this.forwardedState = {};
        this.handlePopstate = (ev) => {
            return this.enqueue(this, 'popstate', [ev]);
        };
        this.processCalls = (qCall) => {
            const call = qCall;
            if (call.target === this && call.methodName !== 'forwardState') {
                call.parameters.push(this.forwardedState.resolve);
                this.forwardedState.resolve = null;
                // Should we suppress this popstate event?
                if (call.methodName === 'popstate' && this.forwardedState.suppressPopstate) {
                    call.parameters.push(true);
                    this.forwardedState.suppressPopstate = false;
                }
            }
            // tslint:disable-next-line:ban-types
            const method = call.target[call.methodName];
            Reporter.write(10000, 'DEQUEUE', call.methodName, call.parameters);
            if (method) {
                method.apply(call.target, call.parameters);
            }
            qCall.resolve();
        };
        this.window = dom.window;
        this.history = dom.window.history;
        this.location = dom.window.location;
        this.pendingCalls = new Queue(this.processCalls);
    }
    activate(options) {
        if (this.isActive) {
            throw new Error('Browser navigation has already been activated');
        }
        this.isActive = true;
        this.options.callback = options.callback;
        if (options.useUrlFragmentHash != void 0) {
            this.options.useUrlFragmentHash = options.useUrlFragmentHash;
        }
        this.pendingCalls.activate({ lifecycle: this.lifecycle, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
        this.window.addEventListener('popstate', this.handlePopstate);
    }
    deactivate() {
        if (!this.isActive) {
            throw new Error('Browser navigation has not been activated');
        }
        this.window.removeEventListener('popstate', this.handlePopstate);
        this.pendingCalls.deactivate();
        // tslint:disable-next-line:no-empty
        this.options = { useUrlFragmentHash: true, callback: () => { } };
        this.isActive = false;
    }
    get length() {
        return this.history.length;
    }
    get state() {
        return this.history.state;
    }
    get viewerState() {
        const { pathname, search, hash } = this.location;
        return {
            path: pathname,
            query: search,
            hash,
            instruction: this.options.useUrlFragmentHash ? hash.slice(1) : pathname,
        };
    }
    go(delta, suppressPopstate = false) {
        return this.enqueue(this.history, 'go', [delta], suppressPopstate);
    }
    pushNavigatorState(state) {
        const { title, path } = state.currentEntry;
        const fragment = this.options.useUrlFragmentHash ? '#/' : '';
        return this.enqueue(this.history, 'pushState', [state, title, `${fragment}${path}`]);
    }
    replaceNavigatorState(state) {
        const { title, path } = state.currentEntry;
        const fragment = this.options.useUrlFragmentHash ? '#/' : '';
        return this.enqueue(this.history, 'replaceState', [state, title, `${fragment}${path}`]);
    }
    popNavigatorState() {
        return this.enqueue(this, 'popState', []);
    }
    popstate(ev, resolve, suppressPopstate = false) {
        if (!suppressPopstate) {
            this.options.callback({
                ...this.viewerState,
                ...{
                    event: ev,
                    state: this.history.state,
                },
            });
        }
        if (resolve !== null && resolve !== void 0) {
            resolve();
        }
    }
    async popState(resolve) {
        await this.go(-1, true);
        const state = this.history.state;
        // TODO: Fix browser forward bug after pop on first entry
        if (state && state.navigationEntry && !state.navigationEntry.firstEntry) {
            await this.go(-1, true);
            return this.pushNavigatorState(state);
        }
        resolve();
    }
    forwardState(state) {
        this.forwardedState = state;
    }
    // Everything that wants to await a browser event should pass suppressPopstate param
    // Events NOT resulting in popstate events should NOT pass suppressPopstate param
    enqueue(target, methodName, parameters, suppressPopstate) {
        const calls = [];
        const costs = [];
        const promises = [];
        if (suppressPopstate !== undefined) {
            // Due to (browser) events not having a promise, we create and propagate one
            let resolve = null;
            promises.push(new Promise(_resolve => {
                resolve = _resolve;
            }));
            calls.push({
                target: this,
                methodName: 'forwardState',
                parameters: [
                    {
                        resolve,
                        suppressPopstate,
                    }
                ],
            });
            costs.push(0);
        }
        calls.push({
            target: target,
            methodName: methodName,
            parameters: parameters,
        });
        costs.push(1);
        // The first promise is the relevant one since it's either a) the propagated one (in
        // case of a browser action), or b) the only one since there's only one call
        promises.push(this.pendingCalls.enqueue(calls, costs)[0]);
        return promises[0];
    }
}
BrowserNavigator.inject = [ILifecycle, IDOM];
//# sourceMappingURL=browser-navigator.js.map