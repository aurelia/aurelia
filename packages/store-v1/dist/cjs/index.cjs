"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime-html");

var r = require("rxjs");

var s = require("rxjs/operators");

function jump(t, e) {
    if (!isStateHistory(t)) {
        throw Error("Provided state is not of type StateHistory");
    }
    if (e > 0) return jumpToFuture(t, e - 1);
    if (e < 0) return jumpToPast(t, t.past.length + e);
    return t;
}

function jumpToFuture(t, e) {
    if (e < 0 || e >= t.future.length) {
        return t;
    }
    const {past: r, future: s, present: i} = t;
    const o = [ ...r, i, ...s.slice(0, e) ];
    const n = s[e];
    const a = s.slice(e + 1);
    return {
        past: o,
        present: n,
        future: a
    };
}

function jumpToPast(t, e) {
    if (e < 0 || e >= t.past.length) {
        return t;
    }
    const {past: r, future: s, present: i} = t;
    const o = r.slice(0, e);
    const n = [ ...r.slice(e + 1), i, ...s ];
    const a = r[e];
    return {
        past: o,
        present: a,
        future: n
    };
}

function nextStateHistory(t, e) {
    return {
        ...t,
        ...{
            past: [ ...t.past, t.present ],
            present: e,
            future: []
        }
    };
}

function applyLimits(t, e) {
    if (isStateHistory(t)) {
        if (t.past.length > e) {
            t.past = t.past.slice(t.past.length - e);
        }
        if (t.future.length > e) {
            t.future = t.future.slice(0, e);
        }
    }
    return t;
}

function isStateHistory(t) {
    return typeof t.present !== "undefined" && typeof t.future !== "undefined" && typeof t.past !== "undefined" && Array.isArray(t.future) && Array.isArray(t.past);
}

const i = "aurelia-store-state";

exports.MiddlewarePlacement = void 0;

(function(t) {
    t["Before"] = "before";
    t["After"] = "after";
})(exports.MiddlewarePlacement || (exports.MiddlewarePlacement = {}));

function logMiddleware(e, r, s) {
    const i = o.container.get(t.IPlatform).console;
    const n = s?.logType !== undefined && i[s.logType] !== undefined ? s.logType : "log";
    i[n]("New state: ", e);
}

function localStorageMiddleware(t, r, s) {
    const n = o.container.get(e.IWindow).localStorage;
    if (n !== undefined) {
        const e = s?.key !== undefined ? s.key : i;
        n.setItem(e, JSON.stringify(t));
    }
}

function rehydrateFromLocalStorage(t, r) {
    const s = o.container.get(e.IWindow).localStorage;
    if (s === undefined) {
        return t;
    }
    const n = s.getItem(r === undefined ? i : r);
    if (n === null || n === "") {
        return t;
    }
    try {
        return JSON.parse(n);
    } catch {}
    return t;
}

exports.LogLevel = void 0;

(function(t) {
    t["trace"] = "trace";
    t["debug"] = "debug";
    t["info"] = "info";
    t["warn"] = "warn";
    t["error"] = "error";
})(exports.LogLevel || (exports.LogLevel = {}));

function getLogType(t, e, r) {
    if (t.logDefinitions?.hasOwnProperty(e) && t.logDefinitions[e] && Object.values(exports.LogLevel).includes(t.logDefinitions[e])) {
        return t.logDefinitions[e];
    }
    return r;
}

exports.PerformanceMeasurement = void 0;

(function(t) {
    t["StartEnd"] = "startEnd";
    t["All"] = "all";
})(exports.PerformanceMeasurement || (exports.PerformanceMeasurement = {}));

const o = {
    container: null
};

class UnregisteredActionError extends Error {
    constructor(t) {
        super(`Tried to dispatch an unregistered action ${t !== undefined && (typeof t === "string" ? t : t.name)}`);
    }
}

class DevToolsRemoteDispatchError extends Error {}

class ActionRegistrationError extends Error {}

class ReducerNoStateError extends Error {}

class Store {
    constructor(t, e, s, i) {
        this.initialState = t;
        this.logger = e;
        this.t = s;
        this.devToolsAvailable = false;
        this.actions = new Map;
        this.middlewares = new Map;
        this.dispatchQueue = [];
        this.options = i ?? {};
        const o = this.options?.history?.undoable === true;
        this._state = new r.BehaviorSubject(t);
        this.state = this._state.asObservable();
        if (this.options?.devToolsOptions?.disable !== true) {
            this.setupDevTools();
        }
        if (o) {
            this.registerHistoryMethods();
        }
    }
    registerMiddleware(t, e, r) {
        this.middlewares.set(t, {
            placement: e,
            settings: r
        });
    }
    unregisterMiddleware(t) {
        if (this.middlewares.has(t)) {
            this.middlewares.delete(t);
        }
    }
    isMiddlewareRegistered(t) {
        return this.middlewares.has(t);
    }
    registerAction(t, e) {
        if (e.length === 0) {
            throw new ActionRegistrationError("The reducer is expected to have one or more parameters, where the first will be the present state");
        }
        this.actions.set(e, {
            type: t
        });
    }
    unregisterAction(t) {
        if (this.actions.has(t)) {
            this.actions.delete(t);
        }
    }
    isActionRegistered(t) {
        if (typeof t === "string") {
            return Array.from(this.actions).find(e => e[1].type === t) !== undefined;
        }
        return this.actions.has(t);
    }
    resetToState(t) {
        this._state.next(t);
    }
    async dispatch(t, ...e) {
        const r = this.lookupAction(t);
        if (!r) {
            return Promise.reject(new UnregisteredActionError(t));
        }
        return this.queueDispatch([ {
            reducer: r,
            params: e
        } ]);
    }
    pipe(t, ...e) {
        const r = [];
        const s = {
            dispatch: async () => this.queueDispatch(r),
            pipe: (e, ...i) => {
                const o = this.lookupAction(e);
                if (!o) {
                    throw new UnregisteredActionError(t);
                }
                r.push({
                    reducer: o,
                    params: i
                });
                return s;
            }
        };
        return s.pipe(t, ...e);
    }
    lookupAction(t) {
        if (typeof t === "string") {
            const e = Array.from(this.actions).find(([e, r]) => r.type === t);
            if (e) {
                return e[0];
            }
        } else if (this.actions.has(t)) {
            return t;
        }
        return undefined;
    }
    async queueDispatch(t) {
        return new Promise((e, r) => {
            this.dispatchQueue.push({
                actions: t,
                resolve: e,
                reject: r
            });
            if (this.dispatchQueue.length === 1) {
                this.handleQueue();
            }
        });
    }
    async handleQueue() {
        if (this.dispatchQueue.length > 0) {
            const t = this.dispatchQueue[0];
            try {
                await this.internalDispatch(t.actions);
                t.resolve();
            } catch (e) {
                t.reject(e);
            }
            this.dispatchQueue.shift();
            this.handleQueue();
        }
    }
    async internalDispatch(t) {
        const r = t.find(t => !this.actions.has(t.reducer));
        if (r) {
            throw new UnregisteredActionError(r.reducer);
        }
        o.container.get(e.IWindow).performance.mark("dispatch-start");
        const s = t.map(t => ({
            type: this.actions.get(t.reducer).type,
            params: t.params,
            reducer: t.reducer
        }));
        const i = {
            name: s.map(t => t.type).join("->"),
            params: s.reduce((t, e) => t.concat(e.params), []),
            pipedActions: s.map(t => ({
                name: t.type,
                params: t.params
            }))
        };
        if (this.options.logDispatchedActions) {
            this.logger[getLogType(this.options, "dispatchedActions", exports.LogLevel.info)](`Dispatching: ${i.name}`);
        }
        const n = await this.executeMiddlewares(this._state.getValue(), exports.MiddlewarePlacement.Before, i);
        if (n === false) {
            o.container.get(e.IWindow).performance.clearMarks();
            o.container.get(e.IWindow).performance.clearMeasures();
            return;
        }
        let a = n;
        for (const t of s) {
            a = await t.reducer(a, ...t.params);
            if (a === false) {
                o.container.get(e.IWindow).performance.clearMarks();
                o.container.get(e.IWindow).performance.clearMeasures();
                return;
            }
            o.container.get(e.IWindow).performance.mark(`dispatch-after-reducer-${t.type}`);
            if (!a && typeof a !== "object") {
                throw new ReducerNoStateError("The reducer has to return a new state");
            }
        }
        let c = await this.executeMiddlewares(a, exports.MiddlewarePlacement.After, i);
        if (c === false) {
            o.container.get(e.IWindow).performance.clearMarks();
            o.container.get(e.IWindow).performance.clearMeasures();
            return;
        }
        if (isStateHistory(c) && this.options.history?.limit) {
            c = applyLimits(c, this.options.history.limit);
        }
        this._state.next(c);
        o.container.get(e.IWindow).performance.mark("dispatch-end");
        if (this.options.measurePerformance === exports.PerformanceMeasurement.StartEnd) {
            o.container.get(e.IWindow).performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const t = o.container.get(e.IWindow).performance.getEntriesByName("startEndDispatchDuration");
            this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${t[0].duration} of dispatched action ${i.name}:`, t);
        } else if (this.options.measurePerformance === exports.PerformanceMeasurement.All) {
            const t = o.container.get(e.IWindow).performance.getEntriesByType("mark");
            const r = t[t.length - 1].startTime - t[0].startTime;
            this.logger[getLogType(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${r} of dispatched action ${i.name}:`, t);
        }
        o.container.get(e.IWindow).performance.clearMarks();
        o.container.get(e.IWindow).performance.clearMeasures();
        this.updateDevToolsState({
            type: i.name,
            params: i.params
        }, c);
    }
    executeMiddlewares(t, r, s) {
        return Array.from(this.middlewares).filter(t => t[1].placement === r).reduce(async (t, i, n) => {
            try {
                const e = await i[0](await t, this._state.getValue(), i[1].settings, s);
                if (e === false) {
                    return false;
                }
                return e || await t;
            } catch (e) {
                if (this.options.propagateError) {
                    throw e;
                }
                return await t;
            } finally {
                o.container.get(e.IWindow).performance.mark(`dispatch-${r}-${i[0].name}`);
            }
        }, t);
    }
    setupDevTools() {
        if (this.t.__REDUX_DEVTOOLS_EXTENSION__) {
            this.logger[getLogType(this.options, "devToolsStatus", exports.LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = this.t.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe(t => {
                this.logger[getLogType(this.options, "devToolsStatus", exports.LogLevel.debug)](`DevTools sent change ${t.type}`);
                if (t.type === "ACTION" && t.payload !== undefined) {
                    const e = Array.from(this.actions).find(function([e]) {
                        return e.name === t.payload?.name;
                    });
                    const r = this.lookupAction(t.payload?.name) ?? e?.[0];
                    if (!r) {
                        throw new DevToolsRemoteDispatchError("Tried to remotely dispatch an unregistered action");
                    }
                    if (!t.payload.args || t.payload.args.length < 1) {
                        throw new DevToolsRemoteDispatchError("No action arguments provided");
                    }
                    this.dispatch(r, ...t.payload.args.slice(1).map(t => JSON.parse(t))).catch(() => {
                        throw new DevToolsRemoteDispatchError("Issue when trying to dispatch an action through devtools");
                    });
                    return;
                }
                if (t.type === "DISPATCH" && t.payload) {
                    switch (t.payload.type) {
                      case "JUMP_TO_STATE":
                      case "JUMP_TO_ACTION":
                        this._state.next(JSON.parse(t.state));
                        return;

                      case "COMMIT":
                        this.devTools.init(this._state.getValue());
                        return;

                      case "RESET":
                        this.devTools.init(this.initialState);
                        this.resetToState(this.initialState);
                        return;

                      case "ROLLBACK":
                        {
                            const e = JSON.parse(t.state);
                            this.resetToState(e);
                            this.devTools.init(e);
                            return;
                        }
                    }
                }
            });
        }
    }
    updateDevToolsState(t, e) {
        if (this.devToolsAvailable && this.devTools) {
            this.devTools.send(t, e);
        }
    }
    registerHistoryMethods() {
        this.registerAction("jump", jump);
    }
}

function dispatchify(t) {
    const e = o.container.get(Store);
    return async function(...r) {
        return e.dispatch(t, ...r);
    };
}

async function executeSteps(t, e, ...r) {
    const logStep = (t, r) => async s => {
        if (e) {
            console.group(`Step ${r}`);
            console.log(s);
            console.groupEnd();
        }
        await t(s);
    };
    const tryStep = (t, e) => async r => {
        try {
            await t(r);
        } catch (t) {
            e(t);
        }
    };
    const lastStep = (t, e) => async r => {
        await t(r);
        e();
    };
    return new Promise((e, i) => {
        let o = 0;
        r.slice(0, -1).forEach(e => {
            t.state.pipe(s.skip(o), s.take(1), s.delay(0)).subscribe(tryStep(logStep(e, o), i));
            o++;
        });
        t.state.pipe(s.skip(o), s.take(1)).subscribe(lastStep(tryStep(logStep(r[r.length - 1], o), i), e));
    });
}

const defaultSelector = t => t.state;

function connectTo(t) {
    const s = {
        selector: typeof t === "function" ? t : defaultSelector,
        ...t
    };
    function getSource(t, e) {
        const s = e(t);
        if (s instanceof r.Observable) {
            return s;
        }
        return t.state;
    }
    function createSelectors() {
        const t = typeof s.selector === "object";
        const e = {
            [s.target || "state"]: s.selector || defaultSelector
        };
        return Object.entries({
            ...t ? s.selector : e
        }).map(([e, r]) => ({
            targets: s.target && t ? [ s.target, e ] : [ e ],
            selector: r,
            changeHandlers: {
                [s.onChanged ?? ""]: 1,
                [`${s.target ?? e}Changed`]: s.target ? 0 : 1,
                propertyChanged: 0
            }
        }));
    }
    return function(s, i) {
        const n = typeof t === "object" && t.setup ? s.prototype[t.setup] : s.prototype.binding;
        const a = typeof t === "object" && t.teardown ? s.prototype[t.teardown] : s.prototype.unbinding;
        s.prototype[typeof t === "object" && t.setup !== undefined ? t.setup : "binding"] = function() {
            if (typeof t === "object" && typeof t.onChanged === "string" && !(t.onChanged in this)) {
                throw new Error("Provided onChanged handler does not exist on target VM");
            }
            const r = e.Controller.getCached(this) ? e.Controller.getCached(this).container.get(Store) : o.container.get(Store);
            this._stateSubscriptions = createSelectors().map(t => getSource(r, t.selector).subscribe(e => {
                const r = t.targets.length - 1;
                const s = t.targets.reduce((t = {}, e) => t[e], this);
                Object.entries(t.changeHandlers).forEach(([i, o]) => {
                    if (i in this) {
                        this[i](...[ t.targets[r], e, s ].slice(o, 3));
                    }
                });
                t.targets.reduce((t, s, i) => {
                    t[s] = i === r ? e : t[s] || {};
                    return t[s];
                }, this);
            }));
            if (n) {
                return n.apply(this, arguments);
            }
        };
        s.prototype[typeof t === "object" && t.teardown ? t.teardown : "unbinding"] = function() {
            if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
                this._stateSubscriptions.forEach(t => {
                    if (t instanceof r.Subscription && t.closed === false) {
                        t.unsubscribe();
                    }
                });
            }
            if (a) {
                return a.apply(this, arguments);
            }
        };
    };
}

const n = {
    withInitialState(t) {
        Reflect.set(this, "state", t);
        return this;
    },
    withOptions(t) {
        Reflect.set(this, "options", t);
        return this;
    },
    register(r) {
        o.container = r;
        const s = Reflect.get(this, "state");
        const i = Reflect.get(this, "options");
        const n = r.get(t.ILogger);
        const a = r.get(e.IWindow);
        if (!s) {
            throw new Error("initialState must be provided via withInitialState builder method");
        }
        let c = s;
        if (i?.history?.undoable && !isStateHistory(s)) {
            c = {
                past: [],
                present: s,
                future: []
            };
        }
        t.Registration.instance(Store, new Store(c, n, a, i)).register(r);
        return r;
    }
};

exports.ActionRegistrationError = ActionRegistrationError;

exports.DEFAULT_LOCAL_STORAGE_KEY = i;

exports.DevToolsRemoteDispatchError = DevToolsRemoteDispatchError;

exports.ReducerNoStateError = ReducerNoStateError;

exports.STORE = o;

exports.Store = Store;

exports.StoreConfiguration = n;

exports.UnregisteredActionError = UnregisteredActionError;

exports.applyLimits = applyLimits;

exports.connectTo = connectTo;

exports.dispatchify = dispatchify;

exports.executeSteps = executeSteps;

exports.getLogType = getLogType;

exports.isStateHistory = isStateHistory;

exports.jump = jump;

exports.localStorageMiddleware = localStorageMiddleware;

exports.logMiddleware = logMiddleware;

exports.nextStateHistory = nextStateHistory;

exports.rehydrateFromLocalStorage = rehydrateFromLocalStorage;
//# sourceMappingURL=index.cjs.map
