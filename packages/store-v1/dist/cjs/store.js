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
exports.dispatchify = exports.Store = exports.ReducerNoStateError = exports.ActionRegistrationError = exports.DevToolsRemoteDispatchError = exports.UnregisteredActionError = exports.STORE = exports.PerformanceMeasurement = void 0;
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const rxjs_1 = require("rxjs");
const history_js_1 = require("./history.js");
const middleware_js_1 = require("./middleware.js");
const logging_js_1 = require("./logging.js");
var PerformanceMeasurement;
(function (PerformanceMeasurement) {
    PerformanceMeasurement["StartEnd"] = "startEnd";
    PerformanceMeasurement["All"] = "all";
})(PerformanceMeasurement = exports.PerformanceMeasurement || (exports.PerformanceMeasurement = {}));
exports.STORE = {
    container: null
};
class UnregisteredActionError extends Error {
    constructor(reducer) {
        super(`Tried to dispatch an unregistered action ${reducer !== undefined && (typeof reducer === "string" ? reducer : reducer.name)}`);
    }
}
exports.UnregisteredActionError = UnregisteredActionError;
class DevToolsRemoteDispatchError extends Error {
}
exports.DevToolsRemoteDispatchError = DevToolsRemoteDispatchError;
class ActionRegistrationError extends Error {
}
exports.ActionRegistrationError = ActionRegistrationError;
class ReducerNoStateError extends Error {
}
exports.ReducerNoStateError = ReducerNoStateError;
let Store = class Store {
    constructor(initialState, logger, window, options) {
        var _a, _b, _c, _d;
        this.initialState = initialState;
        this.logger = logger;
        this.window = window;
        // TODO: need an alternative for the Reporter which supports multiple log levels
        this.devToolsAvailable = false;
        this.actions = new Map();
        this.middlewares = new Map();
        this.dispatchQueue = [];
        this.options = options !== null && options !== void 0 ? options : {};
        const isUndoable = ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.history) === null || _b === void 0 ? void 0 : _b.undoable) === true;
        this._state = new rxjs_1.BehaviorSubject(initialState);
        this.state = this._state.asObservable();
        if (((_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.devToolsOptions) === null || _d === void 0 ? void 0 : _d.disable) !== true) {
            this.setupDevTools();
        }
        if (isUndoable) {
            this.registerHistoryMethods();
        }
    }
    registerMiddleware(reducer, placement, settings) {
        this.middlewares.set(reducer, { placement, settings });
    }
    unregisterMiddleware(reducer) {
        if (this.middlewares.has(reducer)) {
            this.middlewares.delete(reducer);
        }
    }
    isMiddlewareRegistered(middleware) {
        return this.middlewares.has(middleware);
    }
    registerAction(name, reducer) {
        if (reducer.length === 0) {
            // The reducer is expected to have one or more parameters, where the first will be the present state
            throw new ActionRegistrationError("The reducer is expected to have one or more parameters, where the first will be the present state");
        }
        this.actions.set(reducer, { type: name });
    }
    unregisterAction(reducer) {
        if (this.actions.has(reducer)) {
            this.actions.delete(reducer);
        }
    }
    isActionRegistered(reducer) {
        if (typeof reducer === 'string') {
            return Array.from(this.actions).find((action) => action[1].type === reducer) !== undefined;
        }
        return this.actions.has(reducer);
    }
    resetToState(state) {
        this._state.next(state);
    }
    async dispatch(reducer, ...params) {
        const action = this.lookupAction(reducer);
        if (!action) {
            return Promise.reject(new UnregisteredActionError(reducer));
        }
        return this.queueDispatch([{
                reducer: action,
                params
            }]);
    }
    pipe(reducer, ...params) {
        const pipeline = [];
        const dispatchPipe = {
            dispatch: async () => this.queueDispatch(pipeline),
            pipe: (nextReducer, ...nextParams) => {
                const action = this.lookupAction(nextReducer);
                if (!action) {
                    throw new UnregisteredActionError(reducer);
                }
                pipeline.push({ reducer: action, params: nextParams });
                return dispatchPipe;
            }
        };
        return dispatchPipe.pipe(reducer, ...params);
    }
    lookupAction(reducer) {
        if (typeof reducer === "string") {
            const result = Array.from(this.actions).find(([_, action]) => action.type === reducer);
            if (result) {
                return result[0];
            }
        }
        else if (this.actions.has(reducer)) {
            return reducer;
        }
        return undefined;
    }
    async queueDispatch(actions) {
        return new Promise((resolve, reject) => {
            this.dispatchQueue.push({ actions, resolve, reject });
            if (this.dispatchQueue.length === 1) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.handleQueue();
            }
        });
    }
    async handleQueue() {
        if (this.dispatchQueue.length > 0) {
            const queueItem = this.dispatchQueue[0];
            try {
                await this.internalDispatch(queueItem.actions);
                queueItem.resolve();
            }
            catch (e) {
                queueItem.reject(e);
            }
            this.dispatchQueue.shift();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.handleQueue();
        }
    }
    async internalDispatch(actions) {
        var _a;
        const unregisteredAction = actions.find((a) => !this.actions.has(a.reducer));
        if (unregisteredAction) {
            throw new UnregisteredActionError(unregisteredAction.reducer);
        }
        exports.STORE.container.get(runtime_html_1.IWindow).performance.mark("dispatch-start");
        const pipedActions = actions.map((a) => ({
            type: this.actions.get(a.reducer).type,
            params: a.params,
            reducer: a.reducer
        }));
        const callingAction = {
            name: pipedActions.map((a) => a.type).join("->"),
            params: pipedActions.reduce((p, a) => p.concat(a.params), []),
            pipedActions: pipedActions.map((a) => ({
                name: a.type,
                params: a.params
            }))
        };
        if (this.options.logDispatchedActions) {
            this.logger[logging_js_1.getLogType(this.options, "dispatchedActions", logging_js_1.LogLevel.info)](`Dispatching: ${callingAction.name}`);
        }
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const beforeMiddleswaresResult = await this.executeMiddlewares(this._state.getValue(), middleware_js_1.MiddlewarePlacement.Before, callingAction);
        if (beforeMiddleswaresResult === false) {
            exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMarks();
            exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMeasures();
            return;
        }
        let result = beforeMiddleswaresResult;
        for (const action of pipedActions) {
            // eslint-disable-next-line no-await-in-loop
            result = await action.reducer(result, ...action.params);
            if (result === false) {
                exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMarks();
                exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMeasures();
                return;
            }
            exports.STORE.container.get(runtime_html_1.IWindow).performance.mark(`dispatch-after-reducer-${action.type}`);
            if (!result && typeof result !== "object") {
                throw new ReducerNoStateError("The reducer has to return a new state");
            }
        }
        // eslint-disable-next-line @typescript-eslint/await-thenable
        let resultingState = await this.executeMiddlewares(result, middleware_js_1.MiddlewarePlacement.After, callingAction);
        if (resultingState === false) {
            exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMarks();
            exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMeasures();
            return;
        }
        if (history_js_1.isStateHistory(resultingState) && ((_a = this.options.history) === null || _a === void 0 ? void 0 : _a.limit)) {
            resultingState = history_js_1.applyLimits(resultingState, this.options.history.limit);
        }
        this._state.next(resultingState);
        exports.STORE.container.get(runtime_html_1.IWindow).performance.mark("dispatch-end");
        if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
            exports.STORE.container.get(runtime_html_1.IWindow).performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const measures = exports.STORE.container.get(runtime_html_1.IWindow).performance.getEntriesByName("startEndDispatchDuration");
            this.logger[logging_js_1.getLogType(this.options, "performanceLog", logging_js_1.LogLevel.info)](`Total duration ${measures[0].duration} of dispatched action ${callingAction.name}:`, measures);
        }
        else if (this.options.measurePerformance === PerformanceMeasurement.All) {
            const marks = exports.STORE.container.get(runtime_html_1.IWindow).performance.getEntriesByType("mark");
            const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
            this.logger[logging_js_1.getLogType(this.options, "performanceLog", logging_js_1.LogLevel.info)](`Total duration ${totalDuration} of dispatched action ${callingAction.name}:`, marks);
        }
        exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMarks();
        exports.STORE.container.get(runtime_html_1.IWindow).performance.clearMeasures();
        this.updateDevToolsState({ type: callingAction.name, params: callingAction.params }, resultingState);
    }
    executeMiddlewares(state, placement, action) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Array.from(this.middlewares)
            .filter((middleware) => middleware[1].placement === placement)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .reduce(async (prev, curr, _) => {
            try {
                const result = await curr[0](await prev, this._state.getValue(), curr[1].settings, action);
                if (result === false) {
                    return false;
                }
                return result || await prev;
            }
            catch (e) {
                if (this.options.propagateError) {
                    throw e;
                }
                // eslint-disable-next-line @typescript-eslint/return-await
                return await prev;
            }
            finally {
                exports.STORE.container.get(runtime_html_1.IWindow).performance.mark(`dispatch-${placement}-${curr[0].name}`);
            }
        }, state);
    }
    setupDevTools() {
        // TODO: needs a better solution for global override
        if (this.window.__REDUX_DEVTOOLS_EXTENSION__) {
            this.logger[logging_js_1.getLogType(this.options, "devToolsStatus", logging_js_1.LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            // TODO: needs a better solution for global override
            this.devTools = this.window.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe((message) => {
                var _a, _b;
                this.logger[logging_js_1.getLogType(this.options, "devToolsStatus", logging_js_1.LogLevel.debug)](`DevTools sent change ${message.type}`);
                if (message.type === "ACTION" && message.payload !== undefined) {
                    const byName = Array.from(this.actions).find(function ([reducer]) {
                        var _a;
                        return reducer.name === ((_a = message.payload) === null || _a === void 0 ? void 0 : _a.name);
                    });
                    const action = (_b = this.lookupAction((_a = message.payload) === null || _a === void 0 ? void 0 : _a.name)) !== null && _b !== void 0 ? _b : byName === null || byName === void 0 ? void 0 : byName[0];
                    if (!action) {
                        throw new DevToolsRemoteDispatchError("Tried to remotely dispatch an unregistered action");
                    }
                    if (!message.payload.args || message.payload.args.length < 1) {
                        throw new DevToolsRemoteDispatchError("No action arguments provided");
                    }
                    this.dispatch(action, ...message.payload.args.slice(1).map((arg) => JSON.parse(arg))).catch(() => {
                        throw new DevToolsRemoteDispatchError("Issue when trying to dispatch an action through devtools");
                    });
                    return;
                }
                if (message.type === "DISPATCH" && message.payload) {
                    switch (message.payload.type) {
                        case "JUMP_TO_STATE":
                        case "JUMP_TO_ACTION":
                            this._state.next(JSON.parse(message.state));
                            return;
                        case "COMMIT":
                            this.devTools.init(this._state.getValue());
                            return;
                        case "RESET":
                            this.devTools.init(this.initialState);
                            this.resetToState(this.initialState);
                            return;
                        case "ROLLBACK": {
                            const parsedState = JSON.parse(message.state);
                            this.resetToState(parsedState);
                            this.devTools.init(parsedState);
                            return;
                        }
                    }
                }
            });
        }
    }
    updateDevToolsState(action, state) {
        if (this.devToolsAvailable && this.devTools) {
            this.devTools.send(action, state);
        }
    }
    registerHistoryMethods() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.registerAction("jump", history_js_1.jump);
    }
};
Store = __decorate([
    __param(1, kernel_1.ILogger),
    __param(2, runtime_html_1.IWindow)
], Store);
exports.Store = Store;
function dispatchify(action) {
    const store = exports.STORE.container.get(Store);
    return async function (...params) {
        return store.dispatch(action, ...params);
    };
}
exports.dispatchify = dispatchify;
//# sourceMappingURL=store.js.map