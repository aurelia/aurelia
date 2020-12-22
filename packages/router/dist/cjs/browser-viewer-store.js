"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserViewerStore = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const task_queue_js_1 = require("./task-queue.js");
/**
 * @internal - Shouldn't be used directly
 */
let BrowserViewerStore = class BrowserViewerStore {
    constructor(platform, window, history, location) {
        this.platform = platform;
        this.window = window;
        this.history = history;
        this.location = location;
        this.allowedExecutionCostWithinTick = 2; // Limit no of executed actions within the same RAF (due to browser limitation)
        this.isActive = false;
        this.options = {
            useUrlFragmentHash: true,
            callback: () => { return; },
        };
        this.forwardedState = { eventTask: null, suppressPopstate: false };
        this.handlePopstate = async (event) => {
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
        this.pendingCalls = new task_queue_js_1.TaskQueue();
    }
    start(options) {
        if (this.isActive) {
            throw new Error('Browser navigation has already been started');
        }
        this.isActive = true;
        this.options.callback = options.callback;
        if (options.useUrlFragmentHash != void 0) {
            this.options.useUrlFragmentHash = options.useUrlFragmentHash;
        }
        this.pendingCalls.start({ platform: this.platform, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
        this.window.addEventListener('popstate', this.handlePopstate);
    }
    stop() {
        if (!this.isActive) {
            throw new Error('Browser navigation has not been started');
        }
        this.window.removeEventListener('popstate', this.handlePopstate);
        this.pendingCalls.stop();
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
    async go(delta, suppressPopstateEvent = false) {
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
    async pushNavigatorState(state) {
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
    async replaceNavigatorState(state) {
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
    async popNavigatorState() {
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
        if (state && state.currentEntry && !state.currentEntry.firstEntry) {
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
    setTitle(title) {
        this.window.document.title = title;
    }
};
BrowserViewerStore = __decorate([
    __param(0, runtime_html_1.IPlatform),
    __param(1, runtime_html_1.IWindow),
    __param(2, runtime_html_1.IHistory),
    __param(3, runtime_html_1.ILocation)
], BrowserViewerStore);
exports.BrowserViewerStore = BrowserViewerStore;
//# sourceMappingURL=browser-viewer-store.js.map