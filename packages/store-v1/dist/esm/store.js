var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ILogger } from '@aurelia/kernel';
import { IWindow } from "@aurelia/runtime-html";
import { BehaviorSubject } from 'rxjs';
import { jump, applyLimits, isStateHistory } from './history.js';
import { MiddlewarePlacement } from './middleware.js';
import { LogLevel, getLogType } from './logging.js';
export var PerformanceMeasurement;
(function (PerformanceMeasurement) {
    PerformanceMeasurement["StartEnd"] = "startEnd";
    PerformanceMeasurement["All"] = "all";
})(PerformanceMeasurement || (PerformanceMeasurement = {}));
export const STORE = {
    container: null
};
export class UnregisteredActionError extends Error {
    constructor(reducer) {
        super(`Tried to dispatch an unregistered action ${reducer !== undefined && (typeof reducer === "string" ? reducer : reducer.name)}`);
    }
}
export class DevToolsRemoteDispatchError extends Error {
}
export class ActionRegistrationError extends Error {
}
export class ReducerNoStateError extends Error {
}
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
        this._state = new BehaviorSubject(initialState);
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
        STORE.container.get(IWindow).performance.mark("dispatch-start");
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
            this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${callingAction.name}`);
        }
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const beforeMiddleswaresResult = await this.executeMiddlewares(this._state.getValue(), MiddlewarePlacement.Before, callingAction);
        if (beforeMiddleswaresResult === false) {
            STORE.container.get(IWindow).performance.clearMarks();
            STORE.container.get(IWindow).performance.clearMeasures();
            return;
        }
        let result = beforeMiddleswaresResult;
        for (const action of pipedActions) {
            // eslint-disable-next-line no-await-in-loop
            result = await action.reducer(result, ...action.params);
            if (result === false) {
                STORE.container.get(IWindow).performance.clearMarks();
                STORE.container.get(IWindow).performance.clearMeasures();
                return;
            }
            STORE.container.get(IWindow).performance.mark(`dispatch-after-reducer-${action.type}`);
            if (!result && typeof result !== "object") {
                throw new ReducerNoStateError("The reducer has to return a new state");
            }
        }
        // eslint-disable-next-line @typescript-eslint/await-thenable
        let resultingState = await this.executeMiddlewares(result, MiddlewarePlacement.After, callingAction);
        if (resultingState === false) {
            STORE.container.get(IWindow).performance.clearMarks();
            STORE.container.get(IWindow).performance.clearMeasures();
            return;
        }
        if (isStateHistory(resultingState) && ((_a = this.options.history) === null || _a === void 0 ? void 0 : _a.limit)) {
            resultingState = applyLimits(resultingState, this.options.history.limit);
        }
        this._state.next(resultingState);
        STORE.container.get(IWindow).performance.mark("dispatch-end");
        if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
            STORE.container.get(IWindow).performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const measures = STORE.container.get(IWindow).performance.getEntriesByName("startEndDispatchDuration");
            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](`Total duration ${measures[0].duration} of dispatched action ${callingAction.name}:`, measures);
        }
        else if (this.options.measurePerformance === PerformanceMeasurement.All) {
            const marks = STORE.container.get(IWindow).performance.getEntriesByType("mark");
            const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](`Total duration ${totalDuration} of dispatched action ${callingAction.name}:`, marks);
        }
        STORE.container.get(IWindow).performance.clearMarks();
        STORE.container.get(IWindow).performance.clearMeasures();
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
                STORE.container.get(IWindow).performance.mark(`dispatch-${placement}-${curr[0].name}`);
            }
        }, state);
    }
    setupDevTools() {
        // TODO: needs a better solution for global override
        if (this.window.__REDUX_DEVTOOLS_EXTENSION__) {
            this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            // TODO: needs a better solution for global override
            this.devTools = this.window.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe((message) => {
                var _a, _b;
                this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)](`DevTools sent change ${message.type}`);
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
        this.registerAction("jump", jump);
    }
};
Store = __decorate([
    __param(1, ILogger),
    __param(2, IWindow)
], Store);
export { Store };
export function dispatchify(action) {
    const store = STORE.container.get(Store);
    return async function (...params) {
        return store.dispatch(action, ...params);
    };
}
//# sourceMappingURL=store.js.map