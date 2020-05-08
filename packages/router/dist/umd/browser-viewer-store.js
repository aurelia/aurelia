var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "@aurelia/runtime-html", "./task-queue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const task_queue_1 = require("./task-queue");
    let BrowserViewerStore = class BrowserViewerStore {
        constructor(scheduler, dom) {
            this.scheduler = scheduler;
            this.allowedExecutionCostWithinTick = 2; // Limit no of executed actions within the same RAF (due to browser limitation)
            this.isActive = false;
            this.options = {
                useUrlFragmentHash: true,
                callback: () => { return; },
            };
            this.forwardedState = { eventTask: null, suppressPopstate: false };
            this.handlePopstate = (event) => {
                const { eventTask, suppressPopstate } = this.forwardedState;
                this.forwardedState = { eventTask: null, suppressPopstate: false };
                return this.pendingCalls.enqueue(async (task) => {
                    const store = this;
                    const ev = event;
                    const evTask = eventTask;
                    const suppressPopstateEvent = suppressPopstate;
                    await store.popstate(ev, evTask, suppressPopstateEvent);
                    task.resolve();
                }, 1).wait();
            };
            this.window = dom.window;
            this.history = dom.window.history;
            this.location = dom.window.location;
            this.pendingCalls = new task_queue_1.TaskQueue();
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
            this.pendingCalls.activate({ scheduler: this.scheduler, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
            this.window.addEventListener('popstate', this.handlePopstate);
        }
        deactivate() {
            if (!this.isActive) {
                throw new Error('Browser navigation has not been activated');
            }
            this.window.removeEventListener('popstate', this.handlePopstate);
            this.pendingCalls.deactivate();
            this.options = { useUrlFragmentHash: true, callback: () => { return; } };
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
        go(delta, suppressPopstateEvent = false) {
            const doneTask = this.pendingCalls.createQueueTask((task) => task.resolve(), 1);
            this.pendingCalls.enqueue([
                (task) => {
                    const store = this;
                    const eventTask = doneTask;
                    const suppressPopstate = suppressPopstateEvent;
                    store.forwardState({ eventTask, suppressPopstate });
                    task.resolve();
                },
                (task) => {
                    const history = this.history;
                    const steps = delta;
                    history.go(steps);
                    task.resolve();
                },
            ], [0, 1]);
            return doneTask.wait();
        }
        pushNavigatorState(state) {
            const { title, path } = state.currentEntry;
            const fragment = this.options.useUrlFragmentHash ? '#/' : '';
            return this.pendingCalls.enqueue((task) => {
                const history = this.history;
                const data = state;
                const titleOrEmpty = title || '';
                const url = `${fragment}${path}`;
                history.pushState(data, titleOrEmpty, url);
                task.resolve();
            }, 1).wait();
        }
        replaceNavigatorState(state) {
            const { title, path } = state.currentEntry;
            const fragment = this.options.useUrlFragmentHash ? '#/' : '';
            return this.pendingCalls.enqueue((task) => {
                const history = this.history;
                const data = state;
                const titleOrEmpty = title || '';
                const url = `${fragment}${path}`;
                history.replaceState(data, titleOrEmpty, url);
                task.resolve();
            }, 1).wait();
        }
        popNavigatorState() {
            const doneTask = this.pendingCalls.createQueueTask((task) => task.resolve(), 1);
            this.pendingCalls.enqueue(async (task) => {
                const store = this;
                const eventTask = doneTask;
                await store.popState(eventTask);
                task.resolve();
            }, 1);
            return doneTask.wait();
        }
        async popState(doneTask) {
            await this.go(-1, true);
            const state = this.history.state;
            // TODO: Fix browser forward bug after pop on first entry
            if (state && state.navigationEntry && !state.navigationEntry.firstEntry) {
                await this.go(-1, true);
                await this.pushNavigatorState(state);
            }
            await doneTask.execute();
        }
        forwardState(state) {
            this.forwardedState = state;
        }
        async popstate(ev, eventTask, suppressPopstate = false) {
            if (!suppressPopstate) {
                this.options.callback({
                    ...this.viewerState,
                    ...{
                        event: ev,
                        state: this.history.state,
                    },
                });
            }
            if (eventTask !== null) {
                await eventTask.execute();
            }
        }
    };
    BrowserViewerStore = __decorate([
        __param(0, runtime_1.IScheduler),
        __param(1, runtime_1.IDOM),
        __metadata("design:paramtypes", [Object, runtime_html_1.HTMLDOM])
    ], BrowserViewerStore);
    exports.BrowserViewerStore = BrowserViewerStore;
});
//# sourceMappingURL=browser-viewer-store.js.map