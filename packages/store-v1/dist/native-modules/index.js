import { IPlatform as t, ILogger as e, Registration as r } from "../../../kernel/dist/native-modules/index.js";

import { IWindow as i, Controller as s } from "../../../runtime-html/dist/native-modules/index.js";

import { BehaviorSubject as n, Subscription as o, Observable as a } from "rxjs";

import { skip as c, take as h, delay as u } from "rxjs/operators/index.js";

function f(t, e) {
    if (!w(t)) throw Error("Provided state is not of type StateHistory");
    if (e > 0) return d(t, e - 1);
    if (e < 0) return l(t, t.past.length + e);
    return t;
}

function d(t, e) {
    if (e < 0 || e >= t.future.length) return t;
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

function l(t, e) {
    if (e < 0 || e >= t.past.length) return t;
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

function p(t, e) {
    return {
        ...t,
        past: [ ...t.past, t.present ],
        present: e,
        future: []
    };
}

function v(t, e) {
    if (w(t)) {
        if (t.past.length > e) t.past = t.past.slice(t.past.length - e);
        if (t.future.length > e) t.future = t.future.slice(0, e);
    }
    return t;
}

function w(t) {
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
***************************************************************************** */ function y(t, e, r, i) {
    var s = arguments.length, n = s < 3 ? e : null === i ? i = Object.getOwnPropertyDescriptor(e, r) : i, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) n = Reflect.decorate(t, e, r, i); else for (var a = t.length - 1; a >= 0; a--) if (o = t[a]) n = (s < 3 ? o(n) : s > 3 ? o(e, r, n) : o(e, r)) || n;
    return s > 3 && n && Object.defineProperty(e, r, n), n;
}

function g(t, e) {
    return function(r, i) {
        e(r, i, t);
    };
}

const m = "aurelia-store-state";

var E;

(function(t) {
    t["Before"] = "before";
    t["After"] = "after";
})(E || (E = {}));

function T(e, r, i) {
    const s = j.container.get(t).console;
    const n = void 0 !== (null === i || void 0 === i ? void 0 : i.logType) && void 0 !== s[i.logType] ? i.logType : "log";
    s[n]("New state: ", e);
}

function A(t, e, r) {
    const s = j.container.get(i).localStorage;
    if (void 0 !== s) {
        const e = void 0 !== (null === r || void 0 === r ? void 0 : r.key) ? r.key : m;
        s.setItem(e, JSON.stringify(t));
    }
}

function D(t, e) {
    const r = j.container.get(i).localStorage;
    if (void 0 === r) return t;
    const s = r.getItem(void 0 === e ? m : e);
    if (null === s || "" === s) return t;
    try {
        return JSON.parse(s);
    } catch (t) {}
    return t;
}

var R;

(function(t) {
    t["trace"] = "trace";
    t["debug"] = "debug";
    t["info"] = "info";
    t["warn"] = "warn";
    t["error"] = "error";
})(R || (R = {}));

function S(t, e, r) {
    var i;
    if ((null === (i = t.logDefinitions) || void 0 === i ? void 0 : i.hasOwnProperty(e)) && t.logDefinitions[e] && Object.values(R).includes(t.logDefinitions[e])) return t.logDefinitions[e];
    return r;
}

var b;

(function(t) {
    t["StartEnd"] = "startEnd";
    t["All"] = "all";
})(b || (b = {}));

const j = {
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

let O = class Store {
    constructor(t, e, r, i) {
        var s, o, a, c;
        this.initialState = t;
        this.logger = e;
        this.window = r;
        this.devToolsAvailable = false;
        this.actions = new Map;
        this.middlewares = new Map;
        this.dispatchQueue = [];
        this.options = null !== i && void 0 !== i ? i : {};
        const h = true === (null === (o = null === (s = this.options) || void 0 === s ? void 0 : s.history) || void 0 === o ? void 0 : o.undoable);
        this.t = new n(t);
        this.state = this.t.asObservable();
        if (true !== (null === (c = null === (a = this.options) || void 0 === a ? void 0 : a.devToolsOptions) || void 0 === c ? void 0 : c.disable)) this.setupDevTools();
        if (h) this.registerHistoryMethods();
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
        this.t.next(t);
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
        const i = {
            dispatch: async () => this.queueDispatch(r),
            pipe: (e, ...s) => {
                const n = this.lookupAction(e);
                if (!n) throw new UnregisteredActionError(t);
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
        var e;
        const r = t.find((t => !this.actions.has(t.reducer)));
        if (r) throw new UnregisteredActionError(r.reducer);
        j.container.get(i).performance.mark("dispatch-start");
        const s = t.map((t => ({
            type: this.actions.get(t.reducer).type,
            params: t.params,
            reducer: t.reducer
        })));
        const n = {
            name: s.map((t => t.type)).join("->"),
            params: s.reduce(((t, e) => t.concat(e.params)), []),
            pipedActions: s.map((t => ({
                name: t.type,
                params: t.params
            })))
        };
        if (this.options.logDispatchedActions) this.logger[S(this.options, "dispatchedActions", R.info)](`Dispatching: ${n.name}`);
        const o = await this.executeMiddlewares(this.t.getValue(), E.Before, n);
        if (false === o) {
            j.container.get(i).performance.clearMarks();
            j.container.get(i).performance.clearMeasures();
            return;
        }
        let a = o;
        for (const t of s) {
            a = await t.reducer(a, ...t.params);
            if (false === a) {
                j.container.get(i).performance.clearMarks();
                j.container.get(i).performance.clearMeasures();
                return;
            }
            j.container.get(i).performance.mark(`dispatch-after-reducer-${t.type}`);
            if (!a && "object" !== typeof a) throw new ReducerNoStateError("The reducer has to return a new state");
        }
        let c = await this.executeMiddlewares(a, E.After, n);
        if (false === c) {
            j.container.get(i).performance.clearMarks();
            j.container.get(i).performance.clearMeasures();
            return;
        }
        if (w(c) && (null === (e = this.options.history) || void 0 === e ? void 0 : e.limit)) c = v(c, this.options.history.limit);
        this.t.next(c);
        j.container.get(i).performance.mark("dispatch-end");
        if (this.options.measurePerformance === b.StartEnd) {
            j.container.get(i).performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const t = j.container.get(i).performance.getEntriesByName("startEndDispatchDuration");
            this.logger[S(this.options, "performanceLog", R.info)](`Total duration ${t[0].duration} of dispatched action ${n.name}:`, t);
        } else if (this.options.measurePerformance === b.All) {
            const t = j.container.get(i).performance.getEntriesByType("mark");
            const e = t[t.length - 1].startTime - t[0].startTime;
            this.logger[S(this.options, "performanceLog", R.info)](`Total duration ${e} of dispatched action ${n.name}:`, t);
        }
        j.container.get(i).performance.clearMarks();
        j.container.get(i).performance.clearMeasures();
        this.updateDevToolsState({
            type: n.name,
            params: n.params
        }, c);
    }
    executeMiddlewares(t, e, r) {
        return Array.from(this.middlewares).filter((t => t[1].placement === e)).reduce((async (t, s, n) => {
            try {
                const n = await s[0](await t, this.t.getValue(), s[1].settings, r);
                if (false === n) return false;
                return n || await t;
            } catch (e) {
                if (this.options.propagateError) throw e;
                return await t;
            } finally {
                j.container.get(i).performance.mark(`dispatch-${e}-${s[0].name}`);
            }
        }), t);
    }
    setupDevTools() {
        if (this.window.i) {
            this.logger[S(this.options, "devToolsStatus", R.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = this.window.i.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe((t => {
                var e, r;
                this.logger[S(this.options, "devToolsStatus", R.debug)](`DevTools sent change ${t.type}`);
                if ("ACTION" === t.type && void 0 !== t.payload) {
                    const i = Array.from(this.actions).find((function([e]) {
                        var r;
                        return e.name === (null === (r = t.payload) || void 0 === r ? void 0 : r.name);
                    }));
                    const s = null !== (r = this.lookupAction(null === (e = t.payload) || void 0 === e ? void 0 : e.name)) && void 0 !== r ? r : null === i || void 0 === i ? void 0 : i[0];
                    if (!s) throw new DevToolsRemoteDispatchError("Tried to remotely dispatch an unregistered action");
                    if (!t.payload.args || t.payload.args.length < 1) throw new DevToolsRemoteDispatchError("No action arguments provided");
                    this.dispatch(s, ...t.payload.args.slice(1).map((t => JSON.parse(t)))).catch((() => {
                        throw new DevToolsRemoteDispatchError("Issue when trying to dispatch an action through devtools");
                    }));
                    return;
                }
                if ("DISPATCH" === t.type && t.payload) switch (t.payload.type) {
                  case "JUMP_TO_STATE":
                  case "JUMP_TO_ACTION":
                    this.t.next(JSON.parse(t.state));
                    return;

                  case "COMMIT":
                    this.devTools.init(this.t.getValue());
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
        this.registerAction("jump", f);
    }
};

O = y([ g(1, e), g(2, i) ], O);

function M(t) {
    const e = j.container.get(O);
    return async function(...r) {
        return e.dispatch(t, ...r);
    };
}

const N = c;

const $ = h;

const x = u;

async function C(t, e, ...r) {
    const i = (t, r) => i => {
        if (e) {
            console.group(`Step ${r}`);
            console.log(i);
            console.groupEnd();
        }
        t(i);
    };
    const s = (t, e) => r => {
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
    return new Promise(((e, o) => {
        let a = 0;
        r.slice(0, -1).forEach((e => {
            t.state.pipe(N(a), $(1), x(0)).subscribe(s(i(e, a), o));
            a++;
        }));
        t.state.pipe(N(a), $(1)).subscribe(n(s(i(r[r.length - 1], a), o), e));
    }));
}

const P = t => t.state;

function I(t) {
    const e = {
        selector: "function" === typeof t ? t : P,
        ...t
    };
    function r(t, e) {
        const r = e(t);
        if (r instanceof a) return r;
        return t.state;
    }
    function i() {
        const t = "object" === typeof e.selector;
        const r = {
            [e.target || "state"]: e.selector || P
        };
        return Object.entries({
            ...t ? e.selector : r
        }).map((([r, i]) => ({
            targets: e.target && t ? [ e.target, r ] : [ r ],
            selector: i,
            changeHandlers: {
                [e.onChanged || ""]: 1,
                [`${e.target || r}Changed`]: e.target ? 0 : 1,
                propertyChanged: 0
            }
        })));
    }
    return function(e) {
        const n = "object" === typeof t && t.setup ? e.prototype[t.setup] : e.prototype.binding;
        const a = "object" === typeof t && t.teardown ? e.prototype[t.teardown] : e.prototype.bound;
        e.prototype["object" === typeof t && void 0 !== t.setup ? t.setup : "binding"] = function() {
            if ("object" === typeof t && "string" === typeof t.onChanged && !(t.onChanged in this)) throw new Error("Provided onChanged handler does not exist on target VM");
            const e = s.getCached(this) ? s.getCached(this).container.get(O) : j.container.get(O);
            this.h = i().map((t => r(e, t.selector).subscribe((e => {
                const r = t.targets.length - 1;
                const i = t.targets.reduce(((t = {}, e) => t[e]), this);
                Object.entries(t.changeHandlers).forEach((([s, n]) => {
                    if (s in this) this[s](...[ t.targets[r], e, i ].slice(n, 3));
                }));
                t.targets.reduce(((t, i, s) => {
                    t[i] = s === r ? e : t[i] || {};
                    return t[i];
                }), this);
            }))));
            if (n) return n.apply(this, arguments);
        };
        e.prototype["object" === typeof t && t.teardown ? t.teardown : "bound"] = function() {
            if (this.h && Array.isArray(this.h)) this.h.forEach((t => {
                if (t instanceof o && false === t.closed) t.unsubscribe();
            }));
            if (a) return a.apply(this, arguments);
        };
    };
}

const J = {
    withInitialState(t) {
        Reflect.set(this, "state", t);
        return this;
    },
    withOptions(t) {
        Reflect.set(this, "options", t);
        return this;
    },
    register(t) {
        var s;
        j.container = t;
        const n = Reflect.get(this, "state");
        const o = Reflect.get(this, "options");
        const a = t.get(e);
        const c = t.get(i);
        if (!n) throw new Error("initialState must be provided via withInitialState builder method");
        let h = n;
        if ((null === (s = null === o || void 0 === o ? void 0 : o.history) || void 0 === s ? void 0 : s.undoable) && !w(n)) h = {
            past: [],
            present: n,
            future: []
        };
        r.instance(O, new O(h, a, c, o)).register(t);
        return t;
    }
};

export { ActionRegistrationError, m as DEFAULT_LOCAL_STORAGE_KEY, DevToolsRemoteDispatchError, R as LogLevel, E as MiddlewarePlacement, b as PerformanceMeasurement, ReducerNoStateError, j as STORE, O as Store, J as StoreConfiguration, UnregisteredActionError, v as applyLimits, I as connectTo, M as dispatchify, C as executeSteps, S as getLogType, w as isStateHistory, f as jump, A as localStorageMiddleware, T as logMiddleware, p as nextStateHistory, D as rehydrateFromLocalStorage };
//# sourceMappingURL=index.js.map
