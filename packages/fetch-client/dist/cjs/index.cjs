"use strict";

var t = require("@aurelia/kernel");

function json(t, e) {
    return JSON.stringify(t !== undefined ? t : {}, e);
}

class MemoryStorage {
    constructor() {
        this.cache = new Map;
        this.delete = t => this.cache.delete(t);
        this.has = t => this.cache.has(t);
        this.set = (t, e) => this.cache.set(t, e);
        this.get = t => this.cache.get(t);
        this.clear = () => this.cache.clear();
    }
}

const e = /*@__PURE__*/ t.DI.createInterface(t => t.singleton(MemoryStorage));

class HttpClientConfiguration {
    constructor() {
        this.baseUrl = "";
        this.defaults = {};
        this.interceptors = [];
        this.dispatcher = null;
        this.c = t.resolve(t.IContainer);
    }
    withBaseUrl(t) {
        this.baseUrl = t;
        return this;
    }
    withDefaults(t) {
        this.defaults = t;
        return this;
    }
    withInterceptor(t) {
        this.interceptors.push(t);
        return this;
    }
    useStandardConfiguration() {
        const t = {
            credentials: "same-origin"
        };
        Object.assign(this.defaults, t, this.defaults);
        return this.rejectErrorResponses();
    }
    rejectErrorResponses() {
        return this.withInterceptor({
            response: rejectOnError
        });
    }
    withRetry(t) {
        const e = this.c.invoke(RetryInterceptor, [ t ]);
        return this.withInterceptor(e);
    }
    withDispatcher(t) {
        this.dispatcher = t;
        return this;
    }
}

function rejectOnError(t) {
    if (!t.ok) {
        throw t;
    }
    return t;
}

const createMappedError = (t, ...e) => new Error(`AUR${String(t).padStart(4, "0")}:${e.map(String)}`);

const s = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

const r = /*@__PURE__*/ t.DI.createInterface("fetch", t => {
    if (typeof fetch !== "function") {
        throw createMappedError(5e3);
    }
    return t.instance(fetch);
});

const i = /*@__PURE__*/ t.DI.createInterface("IHttpClient", t => t.aliasTo(HttpClient));

class HttpClient {
    constructor() {
        this.activeRequestCount = 0;
        this.isRequesting = false;
        this.isConfigured = false;
        this.baseUrl = "";
        this.defaults = null;
        this.t = [];
        this.i = null;
        this.h = t.resolve(t.factory(HttpClientConfiguration));
        this.u = t.resolve(r);
    }
    get interceptors() {
        return this.t.slice(0);
    }
    configure(t) {
        let e;
        if (typeof t === "object") {
            const s = {
                defaults: t
            };
            e = s;
        } else if (typeof t === "function") {
            e = this.h();
            e.baseUrl = this.baseUrl;
            e.defaults = {
                ...this.defaults
            };
            e.interceptors = this.t;
            e.dispatcher = this.i;
            const s = t(e);
            if (s != null) {
                if (typeof s === "object") {
                    e = s;
                } else {
                    throw createMappedError(5001, typeof s);
                }
            }
        } else {
            throw createMappedError(5002, typeof t);
        }
        const s = e.defaults;
        if (s?.headers instanceof Headers) {
            throw createMappedError(5003);
        }
        const r = e.interceptors;
        if (r?.length > 0) {
            if (r.filter(t => t instanceof RetryInterceptor).length > 1) {
                throw createMappedError(5004);
            }
            const t = r.findIndex(t => t instanceof RetryInterceptor);
            if (t >= 0 && t !== r.length - 1) {
                throw createMappedError(5005);
            }
        }
        this.baseUrl = e.baseUrl;
        this.defaults = s;
        this.t = e.interceptors ?? [];
        this.i = e.dispatcher;
        this.isConfigured = true;
        return this;
    }
    fetch(t, e) {
        this.C();
        let s = this.buildRequest(t, e);
        return this.processRequest(s, this.t).then(t => {
            let e;
            if (t instanceof Response) {
                e = Promise.resolve(t);
            } else if (t instanceof Request) {
                s = t;
                e = this.u.call(void 0, s);
            } else {
                throw createMappedError(5006, t);
            }
            return this.processResponse(e, this.t, s);
        }).then(t => {
            if (t instanceof Request) {
                return this.fetch(t);
            }
            return t;
        }).then(t => {
            this.R();
            return t;
        }, t => {
            this.R();
            throw t;
        });
    }
    buildRequest(t, e) {
        const s = this.defaults ?? {};
        let r;
        let i;
        let n;
        const h = parseHeaderValues(s.headers);
        if (t instanceof Request) {
            r = t;
            n = new Headers(r.headers).get("Content-Type");
        } else {
            if (!e) {
                e = {};
            }
            i = e.body;
            const h = i !== undefined ? {
                body: i
            } : null;
            const o = {
                ...s,
                headers: {},
                ...e,
                ...h
            };
            n = new Headers(o.headers).get("Content-Type");
            r = new Request(getRequestUrl(this.baseUrl, t), o);
        }
        if (!n) {
            if (new Headers(h).has("content-type")) {
                r.headers.set("Content-Type", new Headers(h).get("content-type"));
            } else if (i !== undefined && isJSON(i)) {
                r.headers.set("Content-Type", "application/json");
            }
        }
        setDefaultHeaders(r.headers, h);
        if (i instanceof Blob && i.type) {
            r.headers.set("Content-Type", i.type);
        }
        return r;
    }
    get(t, e) {
        return this.fetch(t, e);
    }
    post(t, e, s) {
        return this.I(t, e, s, "POST");
    }
    put(t, e, s) {
        return this.I(t, e, s, "PUT");
    }
    patch(t, e, s) {
        return this.I(t, e, s, "PATCH");
    }
    delete(t, e, s) {
        return this.I(t, e, s, "DELETE");
    }
    dispose() {
        this.t.forEach(t => t.dispose?.());
        this.t.length = 0;
        this.i = null;
    }
    C() {
        this.isRequesting = !!++this.activeRequestCount;
        if (this.isRequesting && this.i != null) {
            dispatch(this.i, n.started);
        }
    }
    R() {
        this.isRequesting = !! --this.activeRequestCount;
        if (!this.isRequesting && this.i != null) {
            dispatch(this.i, n.drained);
        }
    }
    processRequest(t, e) {
        return this.B(t, e, "request", "requestError", Request, this);
    }
    processResponse(t, e, s) {
        return this.B(t, e, "response", "responseError", Response, s, this);
    }
    B(t, e, s, r, i, ...n) {
        return (e ?? []).reduce((t, e) => {
            const h = e[s];
            const o = e[r];
            return t.then(h ? t => t instanceof i ? h.call(e, t, ...n) : t : identity, o ? t => o.call(e, t, ...n) : thrower);
        }, Promise.resolve(t));
    }
    I(t, e, s, r) {
        if (!s) {
            s = {};
        }
        s.method = r;
        if (e != null) {
            s.body = e;
        }
        return this.fetch(t, s);
    }
}

function parseHeaderValues(t) {
    const e = {};
    const s = t ?? {};
    for (const t of Object.keys(s)) {
        e[t] = typeof s[t] === "function" ? s[t]() : s[t];
    }
    return e;
}

function getRequestUrl(t, e) {
    if (s.test(e)) {
        return e;
    }
    return (t ?? "") + e;
}

function setDefaultHeaders(t, e) {
    const s = e ?? {};
    for (const e of Object.keys(s)) {
        if (!t.has(e)) {
            t.set(e, s[e]);
        }
    }
}

function isJSON(t) {
    try {
        JSON.parse(t);
    } catch (t) {
        return false;
    }
    return true;
}

function identity(t) {
    return t;
}

function thrower(t) {
    throw t;
}

function dispatch(t, e) {
    const s = new t.ownerDocument.defaultView.CustomEvent(e, {
        bubbles: true,
        cancelable: true
    });
    setTimeout(() => {
        t.dispatchEvent(s);
    }, 1);
}

const n = /*@__PURE__*/ Object.freeze({
    started: "aurelia-fetch-client-request-started",
    drained: "aurelia-fetch-client-requests-drained"
});

const h = /*@__PURE__*/ t.DI.createInterface(t => t.singleton(CacheService));

const o = /*@__PURE__*/ Object.freeze({
    Set: "au:fetch:cache:set",
    Get: "au:fetch:cache:get",
    Clear: "au:fetch:cache:clear",
    Reset: "au:fetch:cache:reset",
    Dispose: "au:fetch:cache:dispose",
    CacheHit: "au:fetch:cache:hit",
    CacheMiss: "au:fetch:cache:miss",
    CacheStale: "au:fetch:cache:stale",
    CacheStaleRefreshed: "au:fetch:cache:stale:refreshed",
    CacheExpired: "au:fetch:cache:expired",
    CacheBackgroundRefreshed: "au:fetch:cache:background:refreshed",
    CacheBackgroundRefreshing: "au:fetch:cache:background:refreshing",
    CacheBackgroundStopped: "au:fetch:cache:background:stopped"
});

class CacheService {
    constructor() {
        this.storage = t.resolve(e);
        this.p = t.resolve(t.IPlatform);
        this.ea = t.resolve(t.IEventAggregator);
        this.q = t.resolve(i);
        this.H = [];
        this.O = -1;
        this.j = [];
        this.T = new Map;
    }
    subscribe(t, e) {
        const s = this.ea.subscribe(t, e);
        this.H.push(s);
        return s;
    }
    subscribeOnce(t, e) {
        const s = this.ea.subscribeOnce(t, e);
        this.H.push(s);
        return s;
    }
    setStaleTimer(t, e, s) {
        const r = this.p.setTimeout(async () => {
            this.delete(t);
            await this.q.get(s);
            const e = this.getItem(t);
            this.ea.publish(o.CacheStaleRefreshed, {
                key: t,
                value: e
            });
            this.N(r);
        }, e);
        this.j.push(r);
    }
    startBackgroundRefresh(t) {
        if (!t || this.O > -1) return;
        this.O = this.p.setInterval(() => {
            this.ea.publish(o.CacheBackgroundRefreshing);
            this.T.forEach((t, e) => {
                this.delete(e);
                void this.q.get(t).then(() => {
                    const t = this.getItem(e);
                    this.ea.publish(o.CacheBackgroundRefreshed, {
                        key: e,
                        value: t
                    });
                });
            });
        }, t);
    }
    stopBackgroundRefresh() {
        this.p.clearInterval(this.O);
        this.O = -1;
        this.ea.publish(o.CacheBackgroundStopped);
    }
    set(t, e, s, r) {
        const i = {
            data: e,
            ...s
        };
        this.setItem(t, i, r);
    }
    get(t) {
        return this.getItem(t)?.data;
    }
    setItem(t, e, s) {
        e.lastCached = Date.now();
        this.storage.set(t, e);
        this.T.set(t, s);
        this.ea.publish(o.Set, {
            key: t,
            value: e
        });
    }
    getItem(t) {
        if (!this.storage.has(t)) {
            this.ea.publish(o.CacheMiss, {
                key: t
            });
            return;
        }
        const e = this.storage.get(t);
        if (!e?.staleTime || !e?.lastCached) {
            this.ea.publish(o.CacheHit, {
                key: t,
                value: e
            });
            return e;
        }
        const s = Date.now();
        if (s > e.lastCached + (e.staleTime ?? 0)) {
            this.ea.publish(o.CacheStale, {
                key: t,
                value: e
            });
            return;
        }
        if (s > e.lastCached + (e.cacheTime ?? 0)) {
            this.ea.publish(o.CacheExpired, {
                key: t,
                value: e
            });
            return;
        }
        this.ea.publish(o.CacheHit, {
            key: t,
            value: e
        });
        return e;
    }
    delete(t) {
        this.storage.delete(t);
        this.ea.publish(o.Clear, {
            key: t
        });
    }
    clear() {
        this.storage.clear();
        this.T.clear();
        this.ea.publish(o.Reset);
        this.stopBackgroundRefresh();
        this.j.forEach(t => {
            this.p.clearTimeout(t);
        });
        this.j.length = 0;
    }
    dispose() {
        this.clear();
        this.H.forEach(t => t.dispose());
        this.ea.publish(o.Dispose);
    }
    N(t) {
        this.p.clearTimeout(t);
        const e = this.j.indexOf(t);
        if (e > -1) {
            this.j.splice(e, 1);
        }
    }
}

const c = {
    cacheTime: 3e5,
    staleTime: 0,
    refreshStaleImmediate: false,
    refreshInterval: 0
};

class CacheInterceptor {
    constructor(e) {
        this.P = t.resolve(h);
        this.cf = {
            ...c,
            ...e ?? {}
        };
    }
    request(t) {
        this.P.startBackgroundRefresh(this.cf.refreshInterval);
        if (t.method !== "GET") return t;
        const e = this.P.get(this.key(t));
        return this.mark(e) ?? t;
    }
    response(t, e) {
        if (!e) {
            return t;
        }
        if (t.headers.has(CacheInterceptor.cacheHeader)) {
            return t;
        }
        const s = this.key(e);
        this.P.setItem(s, {
            data: t,
            ...this.cf
        }, e);
        if (this.cf?.refreshStaleImmediate && this.cf.staleTime > 0) {
            this.P.setStaleTimer(s, this.cf.staleTime, e);
        }
        return t;
    }
    dispose() {
        this.P.stopBackgroundRefresh();
    }
    key(t) {
        return `${CacheInterceptor.prefix}${t.url}`;
    }
    mark(t) {
        t?.headers.set(CacheInterceptor.cacheHeader, "hit");
        return t;
    }
}

CacheInterceptor.prefix = "au:interceptor:";

CacheInterceptor.cacheHeader = "x-au-fetch-cache";

class BrowserIndexDBStorage {
    constructor() {
        this.cache = t.resolve(t.IPlatform).globalThis.indexedDB;
        this.getStore = () => this.database.transaction(BrowserIndexDBStorage.cacheName, "readwrite").objectStore(BrowserIndexDBStorage.cacheName);
        this.delete = t => {
            const e = this.getStore();
            e.delete(t);
        };
        this.has = t => this.getStore().count(t).result > 0;
        this.set = (t, e) => this.getStore().put(e, t);
        this.get = t => this.getStore().get(t).result;
        this.clear = () => {
            const t = this.getStore();
            t.getAllKeys().result.forEach(e => {
                t.delete(e);
            });
        };
        this.database = this.cache.open(BrowserIndexDBStorage.cacheName).result;
    }
}

BrowserIndexDBStorage.cacheName = "au-cache";

class BrowserStorage {
    constructor(t) {
        this.cache = t;
        this.delete = t => this.cache.removeItem(t);
        this.has = t => Object.keys(this.cache).some(e => e === t);
        this.set = (t, e) => this.cache.setItem(t, JSON.stringify(e));
        this.get = t => JSON.parse(this.cache.getItem(t) ?? "null");
        this.clear = () => {
            Object.keys(this.cache).forEach(t => {
                if (!t.startsWith(CacheInterceptor.prefix)) return;
                this.cache.removeItem(t);
            });
        };
    }
}

class BrowserLocalStorage extends BrowserStorage {
    constructor() {
        super(t.resolve(t.IPlatform).globalThis.localStorage);
    }
}

class BrowserSessionStorage extends BrowserStorage {
    constructor() {
        super(t.resolve(t.IPlatform).globalThis.sessionStorage);
    }
}

const a = /*@__PURE__*/ Object.freeze({
    fixed: 0,
    incremental: 1,
    exponential: 2,
    random: 3
});

const u = {
    maxRetries: 3,
    interval: 1e3,
    strategy: a.fixed
};

class RetryInterceptor {
    constructor(e) {
        this.p = t.resolve(t.IPlatform);
        this.retryConfig = {
            ...u,
            ...e ?? {}
        };
        if (this.retryConfig.strategy === a.exponential && this.retryConfig.interval <= 1e3) {
            throw createMappedError(5007, this.retryConfig.interval);
        }
    }
    request(t) {
        if (!t.retryConfig) {
            t.retryConfig = {
                ...this.retryConfig
            };
            t.retryConfig.counter = 0;
        }
        t.retryConfig.requestClone = t.clone();
        return t;
    }
    response(t, e) {
        delete e.retryConfig;
        return t;
    }
    responseError(t, e, s) {
        const {retryConfig: r} = e;
        const {requestClone: i} = r;
        return Promise.resolve().then(() => {
            if (r.counter < r.maxRetries) {
                const n = r.doRetry != null ? r.doRetry(t, e) : true;
                return Promise.resolve(n).then(n => {
                    if (n) {
                        r.counter++;
                        const t = calculateDelay(r);
                        return new Promise(e => this.p.setTimeout(e, !isNaN(t) ? t : 0)).then(() => {
                            const t = i.clone();
                            if (typeof r.beforeRetry === "function") {
                                return r.beforeRetry(t, s);
                            }
                            return t;
                        }).then(t => {
                            const e = {
                                ...t,
                                retryConfig: r
                            };
                            return s.fetch(e);
                        });
                    }
                    delete e.retryConfig;
                    throw t;
                });
            }
            delete e.retryConfig;
            throw t;
        });
    }
}

function calculateDelay(t) {
    const {interval: e, strategy: s, minRandomInterval: r, maxRandomInterval: i, counter: n} = t;
    if (typeof s === "function") {
        return t.strategy(n);
    }
    switch (s) {
      case a.fixed:
        return f[a.fixed](e);

      case a.incremental:
        return f[a.incremental](n, e);

      case a.exponential:
        return f[a.exponential](n, e);

      case a.random:
        return f[a.random](n, e, r, i);

      default:
        throw createMappedError(5008, s);
    }
}

const f = [ t => t, (t, e) => e * t, (t, e) => t === 1 ? e : e ** t / 1e3, (t, e, s = 0, r = 6e4) => Math.random() * (r - s) + s ];

exports.BrowserIndexDBStorage = BrowserIndexDBStorage;

exports.BrowserLocalStorage = BrowserLocalStorage;

exports.BrowserSessionStorage = BrowserSessionStorage;

exports.CacheEvent = o;

exports.CacheInterceptor = CacheInterceptor;

exports.CacheService = CacheService;

exports.HttpClient = HttpClient;

exports.HttpClientConfiguration = HttpClientConfiguration;

exports.HttpClientEvent = n;

exports.ICacheService = h;

exports.ICacheStorage = e;

exports.IFetchFn = r;

exports.IHttpClient = i;

exports.MemoryStorage = MemoryStorage;

exports.RetryInterceptor = RetryInterceptor;

exports.RetryStrategy = a;

exports.json = json;
//# sourceMappingURL=index.cjs.map
