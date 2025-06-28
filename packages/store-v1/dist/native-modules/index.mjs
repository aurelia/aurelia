import { IPlatform as t, ILogger as e, Registration as r } from "../../../kernel/dist/native-modules/index.mjs";

import { IWindow as i, Controller as s } from "../../../runtime-html/dist/native-modules/index.mjs";

import { BehaviorSubject as n, Subscription as o, Observable as a } from "rxjs";

import { skip as c, take as h, delay as u } from "rxjs/operators";

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
    const {past: r, future: i, present: s} = t;
    const n = [ ...r, s, ...i.slice(0, e) ];
    const o = i[e];
    const a = i.slice(e + 1);
    return {
        past: n,
        present: o,
        future: a
    };
}

function jumpToPast(t, e) {
    if (e < 0 || e >= t.past.length) {
        return t;
    }
    const {past: r, future: i, present: s} = t;
    const n = r.slice(0, e);
    const o = [ ...r.slice(e + 1), s, ...i ];
    const a = r[e];
    return {
        past: n,
        present: a,
        future: o
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

const f = "aurelia-store-state";

var d;

(function(t) {
    t["Before"] = "before";
    t["After"] = "after";
})(d || (d = {}));

function logMiddleware(e, r, i) {
    const s = y.container.get(t).console;
    const n = i?.logType !== undefined && s[i.logType] !== undefined ? i.logType : "log";
    s[n]("New state: ", e);
}

function localStorageMiddleware(t, e, r) {
    const s = y.container.get(i).localStorage;
    if (s !== undefined) {
        const e = r?.key !== undefined ? r.key : f;
        s.setItem(e, JSON.stringify(t));
    }
}

function rehydrateFromLocalStorage(t, e) {
    const r = y.container.get(i).localStorage;
    if (r === undefined) {
        return t;
    }
    const s = r.getItem(e === undefined ? f : e);
    if (s === null || s === "") {
        return t;
    }
    try {
        return JSON.parse(s);
    } catch {}
    return t;
}

var p;

(function(t) {
    t["trace"] = "trace";
    t["debug"] = "debug";
    t["info"] = "info";
    t["warn"] = "warn";
    t["error"] = "error";
})(p || (p = {}));

function getLogType(t, e, r) {
    if (t.logDefinitions?.hasOwnProperty(e) && t.logDefinitions[e] && Object.values(p).includes(t.logDefinitions[e])) {
        return t.logDefinitions[e];
    }
    return r;
}

var l;

(function(t) {
    t["StartEnd"] = "startEnd";
    t["All"] = "all";
})(l || (l = {}));

const y = {
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
    constructor(t, e, r, i) {
        this.initialState = t;
        this.logger = e;
        this.t = r;
        this.devToolsAvailable = false;
        this.actions = new Map;
        this.middlewares = new Map;
        this.dispatchQueue = [];
        this.options = i ?? {};
        const s = this.options?.history?.undoable === true;
        this._state = new n(t);
        this.state = this._state.asObservable();
        if (this.options?.devToolsOptions?.disable !== true) {
            this.setupDevTools();
        }
        if (s) {
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
        const i = {
            dispatch: async () => this.queueDispatch(r),
            pipe: (e, ...s) => {
                const n = this.lookupAction(e);
                if (!n) {
                    throw new UnregisteredActionError(t);
                }
                r.push({
                    reducer: n,
                    params: s
                });
                return i;
            }
        };
        return i.pipe(t, ...e);
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
        const e = t.find(t => !this.actions.has(t.reducer));
        if (e) {
            throw new UnregisteredActionError(e.reducer);
        }
        y.container.get(i).performance.mark("dispatch-start");
        const r = t.map(t => ({
            type: this.actions.get(t.reducer).type,
            params: t.params,
            reducer: t.reducer
        }));
        const s = {
            name: r.map(t => t.type).join("->"),
            params: r.reduce((t, e) => t.concat(e.params), []),
            pipedActions: r.map(t => ({
                name: t.type,
                params: t.params
            }))
        };
        if (this.options.logDispatchedActions) {
            this.logger[getLogType(this.options, "dispatchedActions", p.info)](`Dispatching: ${s.name}`);
        }
        const n = await this.executeMiddlewares(this._state.getValue(), d.Before, s);
        if (n === false) {
            y.container.get(i).performance.clearMarks();
            y.container.get(i).performance.clearMeasures();
            return;
        }
        let o = n;
        for (const t of r) {
            o = await t.reducer(o, ...t.params);
            if (o === false) {
                y.container.get(i).performance.clearMarks();
                y.container.get(i).performance.clearMeasures();
                return;
            }
            y.container.get(i).performance.mark(`dispatch-after-reducer-${t.type}`);
            if (!o && typeof o !== "object") {
                throw new ReducerNoStateError("The reducer has to return a new state");
            }
        }
        let a = await this.executeMiddlewares(o, d.After, s);
        if (a === false) {
            y.container.get(i).performance.clearMarks();
            y.container.get(i).performance.clearMeasures();
            return;
        }
        if (isStateHistory(a) && this.options.history?.limit) {
            a = applyLimits(a, this.options.history.limit);
        }
        this._state.next(a);
        y.container.get(i).performance.mark("dispatch-end");
        if (this.options.measurePerformance === l.StartEnd) {
            y.container.get(i).performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const t = y.container.get(i).performance.getEntriesByName("startEndDispatchDuration");
            this.logger[getLogType(this.options, "performanceLog", p.info)](`Total duration ${t[0].duration} of dispatched action ${s.name}:`, t);
        } else if (this.options.measurePerformance === l.All) {
            const t = y.container.get(i).performance.getEntriesByType("mark");
            const e = t[t.length - 1].startTime - t[0].startTime;
            this.logger[getLogType(this.options, "performanceLog", p.info)](`Total duration ${e} of dispatched action ${s.name}:`, t);
        }
        y.container.get(i).performance.clearMarks();
        y.container.get(i).performance.clearMeasures();
        this.updateDevToolsState({
            type: s.name,
            params: s.params
        }, a);
    }
    executeMiddlewares(t, e, r) {
        return Array.from(this.middlewares).filter(t => t[1].placement === e).reduce(async (t, s, n) => {
            try {
                const e = await s[0](await t, this._state.getValue(), s[1].settings, r);
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
                y.container.get(i).performance.mark(`dispatch-${e}-${s[0].name}`);
            }
        }, t);
    }
    setupDevTools() {
        if (this.t.__REDUX_DEVTOOLS_EXTENSION__) {
            this.logger[getLogType(this.options, "devToolsStatus", p.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = this.t.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe(t => {
                this.logger[getLogType(this.options, "devToolsStatus", p.debug)](`DevTools sent change ${t.type}`);
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
    const e = y.container.get(Store);
    return async function(...r) {
        return e.dispatch(t, ...r);
    };
}

async function executeSteps(t, e, ...r) {
    const logStep = (t, r) => async i => {
        if (e) {
            console.group(`Step ${r}`);
            console.log(i);
            console.groupEnd();
        }
        await t(i);
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
        let s = 0;
        r.slice(0, -1).forEach(e => {
            t.state.pipe(c(s), h(1), u(0)).subscribe(tryStep(logStep(e, s), i));
            s++;
        });
        t.state.pipe(c(s), h(1)).subscribe(lastStep(tryStep(logStep(r[r.length - 1], s), i), e));
    });
}

const defaultSelector = t => t.state;

function connectTo(t) {
    const e = {
        selector: typeof t === "function" ? t : defaultSelector,
        ...t
    };
    function getSource(t, e) {
        const r = e(t);
        if (r instanceof a) {
            return r;
        }
        return t.state;
    }
    function createSelectors() {
        const t = typeof e.selector === "object";
        const r = {
            [e.target || "state"]: e.selector || defaultSelector
        };
        return Object.entries({
            ...t ? e.selector : r
        }).map(([r, i]) => ({
            targets: e.target && t ? [ e.target, r ] : [ r ],
            selector: i,
            changeHandlers: {
                [e.onChanged ?? ""]: 1,
                [`${e.target ?? r}Changed`]: e.target ? 0 : 1,
                propertyChanged: 0
            }
        }));
    }
    return function(e, r) {
        const i = typeof t === "object" && t.setup ? e.prototype[t.setup] : e.prototype.binding;
        const n = typeof t === "object" && t.teardown ? e.prototype[t.teardown] : e.prototype.unbinding;
        e.prototype[typeof t === "object" && t.setup !== undefined ? t.setup : "binding"] = function() {
            if (typeof t === "object" && typeof t.onChanged === "string" && !(t.onChanged in this)) {
                throw new Error("Provided onChanged handler does not exist on target VM");
            }
            const e = s.getCached(this) ? s.getCached(this).container.get(Store) : y.container.get(Store);
            this._stateSubscriptions = createSelectors().map(t => getSource(e, t.selector).subscribe(e => {
                const r = t.targets.length - 1;
                const i = t.targets.reduce((t = {}, e) => t[e], this);
                Object.entries(t.changeHandlers).forEach(([s, n]) => {
                    if (s in this) {
                        this[s](...[ t.targets[r], e, i ].slice(n, 3));
                    }
                });
                t.targets.reduce((t, i, s) => {
                    t[i] = s === r ? e : t[i] || {};
                    return t[i];
                }, this);
            }));
            if (i) {
                return i.apply(this, arguments);
            }
        };
        e.prototype[typeof t === "object" && t.teardown ? t.teardown : "unbinding"] = function() {
            if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
                this._stateSubscriptions.forEach(t => {
                    if (t instanceof o && t.closed === false) {
                        t.unsubscribe();
                    }
                });
            }
            if (n) {
                return n.apply(this, arguments);
            }
        };
    };
}

const g = {
    withInitialState(t) {
        Reflect.set(this, "state", t);
        return this;
    },
    withOptions(t) {
        Reflect.set(this, "options", t);
        return this;
    },
    register(t) {
        y.container = t;
        const s = Reflect.get(this, "state");
        const n = Reflect.get(this, "options");
        const o = t.get(e);
        const a = t.get(i);
        if (!s) {
            throw new Error("initialState must be provided via withInitialState builder method");
        }
        let c = s;
        if (n?.history?.undoable && !isStateHistory(s)) {
            c = {
                past: [],
                present: s,
                future: []
            };
        }
        r.instance(Store, new Store(c, o, a, n)).register(t);
        return t;
    }
};

export { ActionRegistrationError, f as DEFAULT_LOCAL_STORAGE_KEY, DevToolsRemoteDispatchError, p as LogLevel, d as MiddlewarePlacement, l as PerformanceMeasurement, ReducerNoStateError, y as STORE, Store, g as StoreConfiguration, UnregisteredActionError, applyLimits, connectTo, dispatchify, executeSteps, getLogType, isStateHistory, jump, localStorageMiddleware, logMiddleware, nextStateHistory, rehydrateFromLocalStorage };

