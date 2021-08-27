"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime-html");

var r = require("rxjs");

var s = require("rxjs/operators");

function i(t, e) {
    if (!u(t)) throw Error("Provided state is not of type StateHistory");
    if (e > 0) return o(t, e - 1);
    if (e < 0) return n(t, t.past.length + e);
    return t;
}

function o(t, e) {
    if (e < 0 || e >= t.future.length) return t;
    const {past: r, future: s, present: i} = t;
    const o = [ ...r, i, ...s.slice(0, e) ];
    const n = s[e];
    const c = s.slice(e + 1);
    return {
        past: o,
        present: n,
        future: c
    };
}

function n(t, e) {
    if (e < 0 || e >= t.past.length) return t;
    const {past: r, future: s, present: i} = t;
    const o = r.slice(0, e);
    const n = [ ...r.slice(e + 1), i, ...s ];
    const c = r[e];
    return {
        past: o,
        present: c,
        future: n
    };
}

function c(t, e) {
    return {
        ...t,
        past: [ ...t.past, t.present ],
        present: e,
        future: []
    };
}

function a(t, e) {
    if (u(t)) {
        if (t.past.length > e) t.past = t.past.slice(t.past.length - e);
        if (t.future.length > e) t.future = t.future.slice(0, e);
    }
    return t;
}

function u(t) {
    return "undefined" !== typeof t.present && "undefined" !== typeof t.future && "undefined" !== typeof t.past && Array.isArray(t.future) && Array.isArray(t.past);
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
***************************************************************************** */ function h(t, e, r, s) {
    var i = arguments.length, o = i < 3 ? e : null === s ? s = Object.getOwnPropertyDescriptor(e, r) : s, n;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) o = Reflect.decorate(t, e, r, s); else for (var c = t.length - 1; c >= 0; c--) if (n = t[c]) o = (i < 3 ? n(o) : i > 3 ? n(e, r, o) : n(e, r)) || o;
    return i > 3 && o && Object.defineProperty(e, r, o), o;
}

function f(t, e) {
    return function(r, s) {
        e(r, s, t);
    };
}

const p = "aurelia-store-state";

exports.MiddlewarePlacement = void 0;

(function(t) {
    t["Before"] = "before";
    t["After"] = "after";
})(exports.MiddlewarePlacement || (exports.MiddlewarePlacement = {}));

function d(e, r, s) {
    const i = w.container.get(t.IPlatform).console;
    const o = void 0 !== (null === s || void 0 === s ? void 0 : s.logType) && void 0 !== i[s.logType] ? s.logType : "log";
    i[o]("New state: ", e);
}

function l(t, r, s) {
    const i = w.container.get(e.IWindow).localStorage;
    if (void 0 !== i) {
        const e = void 0 !== (null === s || void 0 === s ? void 0 : s.key) ? s.key : p;
        i.setItem(e, JSON.stringify(t));
    }
}

function v(t, r) {
    const s = w.container.get(e.IWindow).localStorage;
    if (void 0 === s) return t;
    const i = s.getItem(void 0 === r ? p : r);
    if (null === i || "" === i) return t;
    try {
        return JSON.parse(i);
    } catch (t) {}
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

function x(t, e, r) {
    var s;
    if ((null === (s = t.logDefinitions) || void 0 === s ? void 0 : s.hasOwnProperty(e)) && t.logDefinitions[e] && Object.values(exports.LogLevel).includes(t.logDefinitions[e])) return t.logDefinitions[e];
    return r;
}

exports.PerformanceMeasurement = void 0;

(function(t) {
    t["StartEnd"] = "startEnd";
    t["All"] = "all";
})(exports.PerformanceMeasurement || (exports.PerformanceMeasurement = {}));

const w = {
    container: null
};

class UnregisteredActionError extends Error {
    constructor(t) {
        super(`Tried to dispatch an unregistered action ${void 0 !== t && ("string" === typeof t ? t : t.name)}`);
    }
}

class DevToolsRemoteDispatchError extends Error {}

class ActionRegistrationError extends Error {}

class ReducerNoStateError extends Error {}

exports.Store = class Store {
    constructor(t, e, s, i) {
        var o, n, c, a;
        this.initialState = t;
        this.logger = e;
        this.t = s;
        this.devToolsAvailable = false;
        this.actions = new Map;
        this.middlewares = new Map;
        this.dispatchQueue = [];
        this.options = null !== i && void 0 !== i ? i : {};
        const u = true === (null === (n = null === (o = this.options) || void 0 === o ? void 0 : o.history) || void 0 === n ? void 0 : n.undoable);
        this._state = new r.BehaviorSubject(t);
        this.state = this._state.asObservable();
        if (true !== (null === (a = null === (c = this.options) || void 0 === c ? void 0 : c.devToolsOptions) || void 0 === a ? void 0 : a.disable)) this.setupDevTools();
        if (u) this.registerHistoryMethods();
    }
    registerMiddleware(t, e, r) {
        this.middlewares.set(t, {
            placement: e,
            settings: r
        });
    }
    unregisterMiddleware(t) {
        if (this.middlewares.has(t)) this.middlewares.delete(t);
    }
    isMiddlewareRegistered(t) {
        return this.middlewares.has(t);
    }
    registerAction(t, e) {
        if (0 === e.length) throw new ActionRegistrationError("The reducer is expected to have one or more parameters, where the first will be the present state");
        this.actions.set(e, {
            type: t
        });
    }
    unregisterAction(t) {
        if (this.actions.has(t)) this.actions.delete(t);
    }
    isActionRegistered(t) {
        if ("string" === typeof t) return void 0 !== Array.from(this.actions).find((e => e[1].type === t));
        return this.actions.has(t);
    }
    resetToState(t) {
        this._state.next(t);
    }
    async dispatch(t, ...e) {
        const r = this.lookupAction(t);
        if (!r) return Promise.reject(new UnregisteredActionError(t));
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
                if (!o) throw new UnregisteredActionError(t);
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
        if ("string" === typeof t) {
            const e = Array.from(this.actions).find((([e, r]) => r.type === t));
            if (e) return e[0];
        } else if (this.actions.has(t)) return t;
        return;
    }
    async queueDispatch(t) {
        return new Promise(((e, r) => {
            this.dispatchQueue.push({
                actions: t,
                resolve: e,
                reject: r
            });
            if (1 === this.dispatchQueue.length) this.handleQueue();
        }));
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
        var r;
        const s = t.find((t => !this.actions.has(t.reducer)));
        if (s) throw new UnregisteredActionError(s.reducer);
        w.container.get(e.IWindow).performance.mark("dispatch-start");
        const i = t.map((t => ({
            type: this.actions.get(t.reducer).type,
            params: t.params,
            reducer: t.reducer
        })));
        const o = {
            name: i.map((t => t.type)).join("->"),
            params: i.reduce(((t, e) => t.concat(e.params)), []),
            pipedActions: i.map((t => ({
                name: t.type,
                params: t.params
            })))
        };
        if (this.options.logDispatchedActions) this.logger[x(this.options, "dispatchedActions", exports.LogLevel.info)](`Dispatching: ${o.name}`);
        const n = await this.executeMiddlewares(this._state.getValue(), exports.MiddlewarePlacement.Before, o);
        if (false === n) {
            w.container.get(e.IWindow).performance.clearMarks();
            w.container.get(e.IWindow).performance.clearMeasures();
            return;
        }
        let c = n;
        for (const t of i) {
            c = await t.reducer(c, ...t.params);
            if (false === c) {
                w.container.get(e.IWindow).performance.clearMarks();
                w.container.get(e.IWindow).performance.clearMeasures();
                return;
            }
            w.container.get(e.IWindow).performance.mark(`dispatch-after-reducer-${t.type}`);
            if (!c && "object" !== typeof c) throw new ReducerNoStateError("The reducer has to return a new state");
        }
        let h = await this.executeMiddlewares(c, exports.MiddlewarePlacement.After, o);
        if (false === h) {
            w.container.get(e.IWindow).performance.clearMarks();
            w.container.get(e.IWindow).performance.clearMeasures();
            return;
        }
        if (u(h) && (null === (r = this.options.history) || void 0 === r ? void 0 : r.limit)) h = a(h, this.options.history.limit);
        this._state.next(h);
        w.container.get(e.IWindow).performance.mark("dispatch-end");
        if (this.options.measurePerformance === exports.PerformanceMeasurement.StartEnd) {
            w.container.get(e.IWindow).performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const t = w.container.get(e.IWindow).performance.getEntriesByName("startEndDispatchDuration");
            this.logger[x(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${t[0].duration} of dispatched action ${o.name}:`, t);
        } else if (this.options.measurePerformance === exports.PerformanceMeasurement.All) {
            const t = w.container.get(e.IWindow).performance.getEntriesByType("mark");
            const r = t[t.length - 1].startTime - t[0].startTime;
            this.logger[x(this.options, "performanceLog", exports.LogLevel.info)](`Total duration ${r} of dispatched action ${o.name}:`, t);
        }
        w.container.get(e.IWindow).performance.clearMarks();
        w.container.get(e.IWindow).performance.clearMeasures();
        this.updateDevToolsState({
            type: o.name,
            params: o.params
        }, h);
    }
    executeMiddlewares(t, r, s) {
        return Array.from(this.middlewares).filter((t => t[1].placement === r)).reduce((async (t, i, o) => {
            try {
                const o = await i[0](await t, this._state.getValue(), i[1].settings, s);
                if (false === o) return false;
                return o || await t;
            } catch (e) {
                if (this.options.propagateError) throw e;
                return await t;
            } finally {
                w.container.get(e.IWindow).performance.mark(`dispatch-${r}-${i[0].name}`);
            }
        }), t);
    }
    setupDevTools() {
        if (this.t.__REDUX_DEVTOOLS_EXTENSION__) {
            this.logger[x(this.options, "devToolsStatus", exports.LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = this.t.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe((t => {
                var e, r;
                this.logger[x(this.options, "devToolsStatus", exports.LogLevel.debug)](`DevTools sent change ${t.type}`);
                if ("ACTION" === t.type && void 0 !== t.payload) {
                    const s = Array.from(this.actions).find((function([e]) {
                        var r;
                        return e.name === (null === (r = t.payload) || void 0 === r ? void 0 : r.name);
                    }));
                    const i = null !== (r = this.lookupAction(null === (e = t.payload) || void 0 === e ? void 0 : e.name)) && void 0 !== r ? r : null === s || void 0 === s ? void 0 : s[0];
                    if (!i) throw new DevToolsRemoteDispatchError("Tried to remotely dispatch an unregistered action");
                    if (!t.payload.args || t.payload.args.length < 1) throw new DevToolsRemoteDispatchError("No action arguments provided");
                    this.dispatch(i, ...t.payload.args.slice(1).map((t => JSON.parse(t)))).catch((() => {
                        throw new DevToolsRemoteDispatchError("Issue when trying to dispatch an action through devtools");
                    }));
                    return;
                }
                if ("DISPATCH" === t.type && t.payload) switch (t.payload.type) {
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
            }));
        }
    }
    updateDevToolsState(t, e) {
        if (this.devToolsAvailable && this.devTools) this.devTools.send(t, e);
    }
    registerHistoryMethods() {
        this.registerAction("jump", i);
    }
};

exports.Store = h([ f(1, t.ILogger), f(2, e.IWindow) ], exports.Store);

function y(t) {
    const e = w.container.get(exports.Store);
    return async function(...r) {
        return e.dispatch(t, ...r);
    };
}

async function g(t, e, ...r) {
    const i = (t, r) => s => {
        if (e) {
            console.group(`Step ${r}`);
            console.log(s);
            console.groupEnd();
        }
        t(s);
    };
    const o = (t, e) => r => {
        try {
            t(r);
        } catch (t) {
            e(t);
        }
    };
    const n = (t, e) => r => {
        t(r);
        e();
    };
    return new Promise(((e, c) => {
        let a = 0;
        r.slice(0, -1).forEach((e => {
            t.state.pipe(s.skip(a), s.take(1), s.delay(0)).subscribe(o(i(e, a), c));
            a++;
        }));
        t.state.pipe(s.skip(a), s.take(1)).subscribe(n(o(i(r[r.length - 1], a), c), e));
    }));
}

const m = t => t.state;

function E(t) {
    const s = {
        selector: "function" === typeof t ? t : m,
        ...t
    };
    function i(t, e) {
        const s = e(t);
        if (s instanceof r.Observable) return s;
        return t.state;
    }
    function o() {
        const t = "object" === typeof s.selector;
        const e = {
            [s.target || "state"]: s.selector || m
        };
        return Object.entries({
            ...t ? s.selector : e
        }).map((([e, r]) => {
            var i, o;
            return {
                targets: s.target && t ? [ s.target, e ] : [ e ],
                selector: r,
                changeHandlers: {
                    [null !== (i = s.onChanged) && void 0 !== i ? i : ""]: 1,
                    [`${null !== (o = s.target) && void 0 !== o ? o : e}Changed`]: s.target ? 0 : 1,
                    propertyChanged: 0
                }
            };
        }));
    }
    return function(s) {
        const n = "object" === typeof t && t.setup ? s.prototype[t.setup] : s.prototype.binding;
        const c = "object" === typeof t && t.teardown ? s.prototype[t.teardown] : s.prototype.unbinding;
        s.prototype["object" === typeof t && void 0 !== t.setup ? t.setup : "binding"] = function() {
            if ("object" === typeof t && "string" === typeof t.onChanged && !(t.onChanged in this)) throw new Error("Provided onChanged handler does not exist on target VM");
            const r = e.Controller.getCached(this) ? e.Controller.getCached(this).container.get(exports.Store) : w.container.get(exports.Store);
            this._stateSubscriptions = o().map((t => i(r, t.selector).subscribe((e => {
                const r = t.targets.length - 1;
                const s = t.targets.reduce(((t = {}, e) => t[e]), this);
                Object.entries(t.changeHandlers).forEach((([i, o]) => {
                    if (i in this) this[i](...[ t.targets[r], e, s ].slice(o, 3));
                }));
                t.targets.reduce(((t, s, i) => {
                    t[s] = i === r ? e : t[s] || {};
                    return t[s];
                }), this);
            }))));
            if (n) return n.apply(this, arguments);
        };
        s.prototype["object" === typeof t && t.teardown ? t.teardown : "unbinding"] = function() {
            if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) this._stateSubscriptions.forEach((t => {
                if (t instanceof r.Subscription && false === t.closed) t.unsubscribe();
            }));
            if (c) return c.apply(this, arguments);
        };
    };
}

const T = {
    withInitialState(t) {
        Reflect.set(this, "state", t);
        return this;
    },
    withOptions(t) {
        Reflect.set(this, "options", t);
        return this;
    },
    register(r) {
        var s;
        w.container = r;
        const i = Reflect.get(this, "state");
        const o = Reflect.get(this, "options");
        const n = r.get(t.ILogger);
        const c = r.get(e.IWindow);
        if (!i) throw new Error("initialState must be provided via withInitialState builder method");
        let a = i;
        if ((null === (s = null === o || void 0 === o ? void 0 : o.history) || void 0 === s ? void 0 : s.undoable) && !u(i)) a = {
            past: [],
            present: i,
            future: []
        };
        t.Registration.instance(exports.Store, new exports.Store(a, n, c, o)).register(r);
        return r;
    }
};

exports.ActionRegistrationError = ActionRegistrationError;

exports.DEFAULT_LOCAL_STORAGE_KEY = p;

exports.DevToolsRemoteDispatchError = DevToolsRemoteDispatchError;

exports.ReducerNoStateError = ReducerNoStateError;

exports.STORE = w;

exports.StoreConfiguration = T;

exports.UnregisteredActionError = UnregisteredActionError;

exports.applyLimits = a;

exports.connectTo = E;

exports.dispatchify = y;

exports.executeSteps = g;

exports.getLogType = x;

exports.isStateHistory = u;

exports.jump = i;

exports.localStorageMiddleware = l;

exports.logMiddleware = d;

exports.nextStateHistory = c;

exports.rehydrateFromLocalStorage = v;
//# sourceMappingURL=index.js.map
