import { Reporter } from '@aurelia/kernel';
import { IDOM, ILifecycle } from '@aurelia/runtime';
import { Queue } from './queue';
export class BrowserNavigation {
    constructor(lifecycle, dom) {
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
            const method = call.target[call.methodName];
            Reporter.write(10000, 'DEQUEUE', call.methodName, call.parameters);
            method.apply(call.target, call.parameters);
            qCall.resolve();
        };
        this.lifecycle = lifecycle;
        this.window = dom.window;
        this.history = dom.window.history;
        this.location = dom.window.location;
        this.useHash = true;
        this.allowedExecutionCostWithinTick = 2;
        this.pendingCalls = new Queue(this.processCalls);
        this.isActive = false;
        this.callback = null;
        this.forwardedState = {};
    }
    activate(callback) {
        if (this.isActive) {
            throw new Error('Browser navigation has already been activated');
        }
        this.isActive = true;
        this.callback = callback;
        this.pendingCalls.activate({ lifecycle: this.lifecycle, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
        this.window.addEventListener('popstate', this.handlePopstate);
    }
    loadUrl() {
        return this.handlePopstate(null);
    }
    deactivate() {
        if (!this.isActive) {
            throw new Error('Browser navigation has not been activated');
        }
        this.window.removeEventListener('popstate', this.handlePopstate);
        this.pendingCalls.deactivate();
        this.callback = null;
        this.isActive = false;
    }
    get length() {
        return this.history.length;
    }
    get state() {
        return this.history.state;
    }
    go(delta, suppressPopstate = false) {
        return this.enqueue(this.history, 'go', [delta], suppressPopstate);
    }
    pushNavigationState(state) {
        const { title, path } = state.NavigationEntry;
        return this.enqueue(this.history, 'pushState', [state, title, `#${path}`]);
    }
    replaceNavigationState(state) {
        const { title, path } = state.NavigationEntry;
        return this.enqueue(this.history, 'replaceState', [state, title, `#${path}`]);
    }
    popNavigationState() {
        return this.enqueue(this, 'popState', []);
    }
    popstate(ev, resolve, suppressPopstate = false) {
        if (!suppressPopstate) {
            const { pathname, search, hash } = this.location;
            this.callback({
                event: ev,
                state: this.history.state,
                path: pathname,
                data: search,
                hash,
                instruction: this.useHash ? hash.slice(1) : pathname,
            });
        }
        if (resolve) {
            resolve();
        }
    }
    async popState(resolve) {
        await this.go(-1, true);
        const state = this.history.state;
        // TODO: Fix browser forward bug after pop on first entry
        if (state && state.navigationEntry && !state.NavigationEntry.firstEntry) {
            await this.go(-1, true);
            return this.pushNavigationState(state);
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
            let resolve;
            // tslint:disable-next-line:promise-must-complete
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
BrowserNavigation.inject = [ILifecycle, IDOM];
//# sourceMappingURL=browser-navigation.js.map