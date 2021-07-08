import { IPlatform, ILogger, Registration } from '@aurelia/kernel';
import { IWindow, Controller } from '@aurelia/runtime-html';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { skip as skip$1, take as take$1, delay as delay$1 } from 'rxjs/operators/index.js';

function jump(state, n) {
    if (!isStateHistory(state)) {
        throw Error("Provided state is not of type StateHistory");
    }
    if (n > 0)
        return jumpToFuture(state, n - 1);
    if (n < 0)
        return jumpToPast(state, state.past.length + n);
    return state;
}
function jumpToFuture(state, index) {
    if (index < 0 || index >= state.future.length) {
        return state;
    }
    const { past, future, present } = state;
    const newPast = [...past, present, ...future.slice(0, index)];
    const newPresent = future[index];
    const newFuture = future.slice(index + 1);
    return { past: newPast, present: newPresent, future: newFuture };
}
function jumpToPast(state, index) {
    if (index < 0 || index >= state.past.length) {
        return state;
    }
    const { past, future, present } = state;
    const newPast = past.slice(0, index);
    const newFuture = [...past.slice(index + 1), present, ...future];
    const newPresent = past[index];
    return { past: newPast, present: newPresent, future: newFuture };
}
function nextStateHistory(presentStateHistory, nextPresent) {
    return {
        ...presentStateHistory,
        ...{
            past: [...presentStateHistory.past, presentStateHistory.present],
            present: nextPresent,
            future: []
        }
    };
}
function applyLimits(state, limit) {
    if (isStateHistory(state)) {
        if (state.past.length > limit) {
            state.past = state.past.slice(state.past.length - limit);
        }
        if (state.future.length > limit) {
            state.future = state.future.slice(0, limit);
        }
    }
    return state;
}
function isStateHistory(history) {
    return typeof history.present !== 'undefined' &&
        typeof history.future !== 'undefined' &&
        typeof history.past !== 'undefined' &&
        Array.isArray(history.future) &&
        Array.isArray(history.past);
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

const DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";
var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement || (MiddlewarePlacement = {}));
function logMiddleware(state, _, settings) {
    const cons = STORE.container.get(IPlatform).console;
    const logType = (settings === null || settings === void 0 ? void 0 : settings.logType) !== undefined && cons[settings.logType] !== undefined ? settings.logType : "log";
    cons[logType]("New state: ", state);
}
function localStorageMiddleware(state, _, settings) {
    const localStorage = STORE.container.get(IWindow).localStorage;
    if (localStorage !== undefined) {
        const key = (settings === null || settings === void 0 ? void 0 : settings.key) !== undefined ? settings.key : DEFAULT_LOCAL_STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(state));
    }
}
function rehydrateFromLocalStorage(state, key) {
    const localStorage = STORE.container.get(IWindow).localStorage;
    if (localStorage === undefined) {
        return state;
    }
    const storedState = localStorage.getItem(key === undefined ? DEFAULT_LOCAL_STORAGE_KEY : key);
    if (storedState === null || storedState === "") {
        return state;
    }
    try {
        return JSON.parse(storedState);
    }
    catch ( /**/_a) { /**/ }
    return state;
}

var LogLevel;
(function (LogLevel) {
    LogLevel["trace"] = "trace";
    LogLevel["debug"] = "debug";
    LogLevel["info"] = "info";
    LogLevel["warn"] = "warn";
    LogLevel["error"] = "error";
})(LogLevel || (LogLevel = {}));
function getLogType(options, definition, defaultLevel) {
    var _a;
    // eslint-disable-next-line no-prototype-builtins
    if (((_a = options.logDefinitions) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(definition)) &&
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        options.logDefinitions[definition] &&
        Object.values(LogLevel).includes(options.logDefinitions[definition])) {
        return options.logDefinitions[definition];
    }
    return defaultLevel;
}

var PerformanceMeasurement;
(function (PerformanceMeasurement) {
    PerformanceMeasurement["StartEnd"] = "startEnd";
    PerformanceMeasurement["All"] = "all";
})(PerformanceMeasurement || (PerformanceMeasurement = {}));
const STORE = {
    container: null
};
class UnregisteredActionError extends Error {
    constructor(reducer) {
        super(`Tried to dispatch an unregistered action ${reducer !== undefined && (typeof reducer === "string" ? reducer : reducer.name)}`);
    }
}
class DevToolsRemoteDispatchError extends Error {
}
class ActionRegistrationError extends Error {
}
class ReducerNoStateError extends Error {
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
function dispatchify(action) {
    const store = STORE.container.get(Store);
    return async function (...params) {
        return store.dispatch(action, ...params);
    };
}

const skip = skip$1;
const take = take$1;
const delay = delay$1;
async function executeSteps(store, shouldLogResults, ...steps) {
    const logStep = (step, stepIdx) => (res) => {
        if (shouldLogResults) {
            console.group(`Step ${stepIdx}`);
            console.log(res);
            console.groupEnd();
        }
        step(res);
    };
    const tryStep = (step, reject) => (res) => {
        try {
            step(res);
        }
        catch (err) {
            reject(err);
        }
    };
    const lastStep = (step, resolve) => (res) => {
        step(res);
        resolve();
    };
    return new Promise((resolve, reject) => {
        let currentStep = 0;
        steps.slice(0, -1).forEach((step) => {
            store.state.pipe(skip(currentStep), take(1), delay(0)).subscribe(tryStep(logStep(step, currentStep), reject));
            currentStep++;
        });
        store.state.pipe(skip(currentStep), take(1)).subscribe(lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
    });
}

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
const defaultSelector = (store) => store.state;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function connectTo(settings) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _settings = {
        selector: typeof settings === 'function' ? settings : defaultSelector,
        ...settings
    };
    function getSource(store, selector) {
        const source = selector(store);
        if (source instanceof Observable) {
            return source;
        }
        return store.state;
    }
    function createSelectors() {
        const isSelectorObj = typeof _settings.selector === "object";
        const fallbackSelector = {
            [_settings.target || 'state']: _settings.selector || defaultSelector
        };
        return Object.entries({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(isSelectorObj ? _settings.selector : fallbackSelector)
        }).map(([target, selector]) => ({
            targets: _settings.target && isSelectorObj ? [_settings.target, target] : [target],
            selector,
            // numbers are the starting index to slice all the change handling args,
            // which are prop name, new state and old state
            changeHandlers: {
                [_settings.onChanged || '']: 1,
                [`${_settings.target || target}Changed`]: _settings.target ? 0 : 1,
                propertyChanged: 0
            }
        }));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (target) {
        const originalSetup = typeof settings === 'object' && settings.setup
            ? target.prototype[settings.setup]
            : target.prototype.binding;
        const originalTeardown = typeof settings === 'object' && settings.teardown
            ? target.prototype[settings.teardown]
            : target.prototype.bound;
        target.prototype[typeof settings === 'object' && settings.setup !== undefined ? settings.setup : 'binding'] = function () {
            if (typeof settings === 'object' &&
                typeof settings.onChanged === 'string' &&
                !(settings.onChanged in this)) {
                // Provided onChanged handler does not exist on target VM
                throw new Error('Provided onChanged handler does not exist on target VM');
            }
            const store = Controller.getCached(this)
                ? Controller.getCached(this).container.get(Store)
                : STORE.container.get(Store); // TODO: need to get rid of this helper for classic unit tests
            this._stateSubscriptions = createSelectors().map(s => getSource(store, s.selector).subscribe((state) => {
                const lastTargetIdx = s.targets.length - 1;
                // eslint-disable-next-line default-param-last
                const oldState = s.targets.reduce((accu = {}, curr) => accu[curr], this);
                Object.entries(s.changeHandlers).forEach(([handlerName, args]) => {
                    if (handlerName in this) {
                        this[handlerName](...[s.targets[lastTargetIdx], state, oldState].slice(args, 3));
                    }
                });
                s.targets.reduce((accu, curr, idx) => {
                    accu[curr] = idx === lastTargetIdx ? state : accu[curr] || {};
                    return accu[curr];
                }, this);
            }));
            if (originalSetup) {
                // eslint-disable-next-line prefer-rest-params
                return originalSetup.apply(this, arguments);
            }
        };
        target.prototype[typeof settings === 'object' && settings.teardown ? settings.teardown : 'bound'] = function () {
            if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
                this._stateSubscriptions.forEach((sub) => {
                    if (sub instanceof Subscription && sub.closed === false) {
                        sub.unsubscribe();
                    }
                });
            }
            if (originalTeardown) {
                // eslint-disable-next-line prefer-rest-params
                return originalTeardown.apply(this, arguments);
            }
        };
    };
}

const StoreConfiguration = {
    withInitialState(state) {
        Reflect.set(this, 'state', state);
        return this;
    },
    withOptions(options) {
        Reflect.set(this, 'options', options);
        return this;
    },
    register(container) {
        var _a;
        // Stores a reference of the DI container for internal use
        // TODO: get rid of this workaround for unit tests
        STORE.container = container;
        const state = Reflect.get(this, 'state');
        const options = Reflect.get(this, 'options');
        const logger = container.get(ILogger);
        const window = container.get(IWindow);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!state) {
            throw new Error("initialState must be provided via withInitialState builder method");
        }
        let initState = state;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (((_a = options === null || options === void 0 ? void 0 : options.history) === null || _a === void 0 ? void 0 : _a.undoable) && !isStateHistory(state)) {
            initState = { past: [], present: state, future: [] };
        }
        Registration.instance(Store, new Store(initState, logger, window, options)).register(container);
        return container;
    }
};

export { ActionRegistrationError, DEFAULT_LOCAL_STORAGE_KEY, DevToolsRemoteDispatchError, LogLevel, MiddlewarePlacement, PerformanceMeasurement, ReducerNoStateError, STORE, Store, StoreConfiguration, UnregisteredActionError, applyLimits, connectTo, dispatchify, executeSteps, getLogType, isStateHistory, jump, localStorageMiddleware, logMiddleware, nextStateHistory, rehydrateFromLocalStorage };
//# sourceMappingURL=index.esm.js.map
