import { DI as t } from "../../../kernel/dist/native-modules/index.js";

function e(t, e) {
    return JSON.stringify(void 0 !== t ? t : {}, e);
}

const r = {
    fixed: 0,
    incremental: 1,
    exponential: 2,
    random: 3
};

const n = {
    maxRetries: 3,
    interval: 1e3,
    strategy: r.fixed
};

class RetryInterceptor {
    constructor(t) {
        this.retryConfig = {
            ...n,
            ...void 0 !== t ? t : {}
        };
        if (this.retryConfig.strategy === r.exponential && this.retryConfig.interval <= 1e3) throw new Error("An interval less than or equal to 1 second is not allowed when using the exponential retry strategy");
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
        Reflect.deleteProperty(e, "retryConfig");
        return t;
    }
    responseError(t, e, r) {
        const {retryConfig: n} = e;
        const {requestClone: i} = n;
        return Promise.resolve().then((() => {
            if (n.counter < n.maxRetries) {
                const o = void 0 !== n.doRetry ? n.doRetry(t, e) : true;
                return Promise.resolve(o).then((o => {
                    if (o) {
                        n.counter++;
                        const t = s(n);
                        return new Promise((e => setTimeout(e, !isNaN(t) ? t : 0))).then((() => {
                            const t = i.clone();
                            if ("function" === typeof n.beforeRetry) return n.beforeRetry(t, r);
                            return t;
                        })).then((t => {
                            const e = {
                                ...t,
                                retryConfig: n
                            };
                            return r.fetch(e);
                        }));
                    }
                    Reflect.deleteProperty(e, "retryConfig");
                    throw t;
                }));
            }
            Reflect.deleteProperty(e, "retryConfig");
            throw t;
        }));
    }
}

function s(t) {
    const {interval: e, strategy: n, minRandomInterval: s, maxRandomInterval: o, counter: c} = t;
    if ("function" === typeof n) return t.strategy(c);
    switch (n) {
      case r.fixed:
        return i[r.fixed](e);

      case r.incremental:
        return i[r.incremental](c, e);

      case r.exponential:
        return i[r.exponential](c, e);

      case r.random:
        return i[r.random](c, e, s, o);

      default:
        throw new Error("Unrecognized retry strategy");
    }
}

const i = [ t => t, (t, e) => e * t, (t, e) => 1 === t ? e : e ** t / 1e3, (t, e, r = 0, n = 6e4) => Math.random() * (n - r) + r ];

class HttpClientConfiguration {
    constructor() {
        this.baseUrl = "";
        this.defaults = {};
        this.interceptors = [];
        this.dispatcher = null;
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
            response: o
        });
    }
    withRetry(t) {
        const e = new RetryInterceptor(t);
        return this.withInterceptor(e);
    }
    withDispatcher(t) {
        this.dispatcher = t;
        return this;
    }
}

function o(t) {
    if (!t.ok) throw t;
    return t;
}

const c = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

const u = t.createInterface("IHttpClient", (t => t.singleton(HttpClient)));

class HttpClient {
    constructor() {
        this.dispatcher = null;
        this.activeRequestCount = 0;
        this.isRequesting = false;
        this.isConfigured = false;
        this.baseUrl = "";
        this.defaults = null;
        this.interceptors = [];
    }
    configure(t) {
        let e;
        if ("object" === typeof t) {
            const r = {
                defaults: t
            };
            e = r;
        } else if ("function" === typeof t) {
            e = new HttpClientConfiguration;
            e.baseUrl = this.baseUrl;
            e.defaults = {
                ...this.defaults
            };
            e.interceptors = this.interceptors;
            e.dispatcher = this.dispatcher;
            const r = t(e);
            if (Object.prototype.isPrototypeOf.call(HttpClientConfiguration.prototype, r)) e = r;
        } else throw new Error("invalid config");
        const r = e.defaults;
        if (void 0 !== r && Object.prototype.isPrototypeOf.call(Headers.prototype, r.headers)) throw new Error("Default headers must be a plain object.");
        const n = e.interceptors;
        if (void 0 !== n && n.length) {
            if (n.filter((t => Object.prototype.isPrototypeOf.call(RetryInterceptor.prototype, t))).length > 1) throw new Error("Only one RetryInterceptor is allowed.");
            const t = n.findIndex((t => Object.prototype.isPrototypeOf.call(RetryInterceptor.prototype, t)));
            if (t >= 0 && t !== n.length - 1) throw new Error("The retry interceptor must be the last interceptor defined.");
        }
        this.baseUrl = e.baseUrl;
        this.defaults = r;
        this.interceptors = void 0 !== e.interceptors ? e.interceptors : [];
        this.dispatcher = e.dispatcher;
        this.isConfigured = true;
        return this;
    }
    fetch(t, e) {
        this.trackRequestStart();
        let r = this.buildRequest(t, e);
        return this.processRequest(r, this.interceptors).then((t => {
            let e;
            if (Object.prototype.isPrototypeOf.call(Response.prototype, t)) e = Promise.resolve(t); else if (Object.prototype.isPrototypeOf.call(Request.prototype, t)) {
                r = t;
                e = fetch(r);
            } else throw new Error(`An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [${t}]`);
            return this.processResponse(e, this.interceptors, r);
        })).then((t => {
            if (Object.prototype.isPrototypeOf.call(Request.prototype, t)) return this.fetch(t);
            return t;
        })).then((t => {
            this.trackRequestEnd();
            return t;
        }), (t => {
            this.trackRequestEnd();
            throw t;
        }));
    }
    buildRequest(t, e) {
        const r = null !== this.defaults ? this.defaults : {};
        let n;
        let s;
        let i;
        const o = h(r.headers);
        if (Object.prototype.isPrototypeOf.call(Request.prototype, t)) {
            n = t;
            i = new Headers(n.headers).get("Content-Type");
        } else {
            if (!e) e = {};
            s = e.body;
            const o = void 0 !== s ? {
                body: s
            } : null;
            const c = {
                ...r,
                headers: {},
                ...e,
                ...o
            };
            i = new Headers(c.headers).get("Content-Type");
            n = new Request(l(this.baseUrl, t), c);
        }
        if (!i) if (new Headers(o).has("content-type")) n.headers.set("Content-Type", new Headers(o).get("content-type")); else if (void 0 !== s && f(s)) n.headers.set("Content-Type", "application/json");
        a(n.headers, o);
        if (void 0 !== s && Object.prototype.isPrototypeOf.call(Blob.prototype, s) && s.type) n.headers.set("Content-Type", s.type);
        return n;
    }
    get(t, e) {
        return this.fetch(t, e);
    }
    post(t, e, r) {
        return this.callFetch(t, e, r, "POST");
    }
    put(t, e, r) {
        return this.callFetch(t, e, r, "PUT");
    }
    patch(t, e, r) {
        return this.callFetch(t, e, r, "PATCH");
    }
    delete(t, e, r) {
        return this.callFetch(t, e, r, "DELETE");
    }
    trackRequestStart() {
        this.isRequesting = !!++this.activeRequestCount;
        if (this.isRequesting && null !== this.dispatcher) {
            const t = new this.dispatcher.ownerDocument.defaultView.CustomEvent("aurelia-fetch-client-request-started", {
                bubbles: true,
                cancelable: true
            });
            setTimeout((() => {
                this.dispatcher.dispatchEvent(t);
            }), 1);
        }
    }
    trackRequestEnd() {
        this.isRequesting = !!--this.activeRequestCount;
        if (!this.isRequesting && null !== this.dispatcher) {
            const t = new this.dispatcher.ownerDocument.defaultView.CustomEvent("aurelia-fetch-client-requests-drained", {
                bubbles: true,
                cancelable: true
            });
            setTimeout((() => {
                this.dispatcher.dispatchEvent(t);
            }), 1);
        }
    }
    processRequest(t, e) {
        return this.applyInterceptors(t, e, "request", "requestError", this);
    }
    processResponse(t, e, r) {
        return this.applyInterceptors(t, e, "response", "responseError", r, this);
    }
    applyInterceptors(t, e, r, n, ...s) {
        return (void 0 !== e ? e : []).reduce(((t, e) => {
            const i = e[r];
            const o = e[n];
            return t.then(i ? t => i.call(e, t, ...s) : p, o ? t => o.call(e, t, ...s) : d);
        }), Promise.resolve(t));
    }
    callFetch(t, e, r, n) {
        if (!r) r = {};
        r.method = n;
        if (e) r.body = e;
        return this.fetch(t, r);
    }
}

function h(t) {
    const e = {};
    const r = void 0 !== t ? t : {};
    for (const t in r) if (Object.prototype.hasOwnProperty.call(r, t)) e[t] = "function" === typeof r[t] ? r[t]() : r[t];
    return e;
}

function l(t, e) {
    if (c.test(e)) return e;
    return (void 0 !== t ? t : "") + e;
}

function a(t, e) {
    const r = void 0 !== e ? e : {};
    for (const e in r) if (Object.prototype.hasOwnProperty.call(r, e) && !t.has(e)) t.set(e, r[e]);
}

function f(t) {
    try {
        JSON.parse(t);
    } catch (t) {
        return false;
    }
    return true;
}

function p(t) {
    return t;
}

function d(t) {
    throw t;
}

export { HttpClient, HttpClientConfiguration, u as IHttpClient, RetryInterceptor, e as json, r as retryStrategy };
//# sourceMappingURL=index.js.map
