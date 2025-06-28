const s = "pending";

const t = "running";

const i = "completed";

const e = "canceled";

const h = new Map;

const notImplemented = s => () => {
    throw createError(`AUR1005:${s}`);
};

class Platform {
    constructor(s, t = {}) {
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = s;
        "decodeURI decodeURIComponent encodeURI encodeURIComponent Date Reflect console".split(" ").forEach(i => {
            this[i] = i in t ? t[i] : s[i];
        });
        "clearInterval clearTimeout queueMicrotask setInterval setTimeout".split(" ").forEach(i => {
            this[i] = i in t ? t[i] : s[i]?.bind(s) ?? notImplemented(i);
        });
        this.performanceNow = "performanceNow" in t ? t.performanceNow : s.performance?.now?.bind(s.performance) ?? notImplemented("performance.now");
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(s, t = {}) {
        let i = h.get(s);
        if (i === void 0) {
            h.set(s, i = new Platform(s, t));
        }
        return i;
    }
    static set(s, t) {
        h.set(s, t);
    }
    requestMacroTask() {
        this.macroTaskRequested = true;
        if (this.macroTaskHandle === -1) {
            this.macroTaskHandle = this.setTimeout(this.flushMacroTask, 0);
        }
    }
    cancelMacroTask() {
        this.macroTaskRequested = false;
        if (this.macroTaskHandle > -1) {
            this.clearTimeout(this.macroTaskHandle);
            this.macroTaskHandle = -1;
        }
    }
    flushMacroTask() {
        this.macroTaskHandle = -1;
        if (this.macroTaskRequested === true) {
            this.macroTaskRequested = false;
            this.taskQueue.flush();
        }
    }
}

class TaskQueue {
    get isEmpty() {
        return this.t === 0 && this.i.length === 0 && this.h.length === 0 && this.u.length === 0;
    }
    get T() {
        return this.t === 0 && this.i.every(isPersistent) && this.h.every(isPersistent) && this.u.every(isPersistent);
    }
    constructor(s, t, i) {
        this.platform = s;
        this.$request = t;
        this.$cancel = i;
        this.$ = void 0;
        this.t = 0;
        this.i = [];
        this.h = [];
        this.u = [];
        this.R = false;
        this.A = void 0;
        this.M = 0;
        this.P = 0;
        this.U = () => {
            if (!this.R) {
                this.R = true;
                this.M = this.q();
                this.$request();
            }
        };
        this.q = s.performanceNow;
        this.I = new Tracer(s.console);
    }
    flush(s = this.q()) {
        this.R = false;
        this.P = s;
        if (this.$ === void 0) {
            let i;
            if (this.h.length > 0) {
                this.i.push(...this.h);
                this.h.length = 0;
            }
            if (this.u.length > 0) {
                for (let t = 0; t < this.u.length; ++t) {
                    i = this.u[t];
                    if (i.queueTime <= s) {
                        this.i.push(i);
                        this.u.splice(t--, 1);
                    }
                }
            }
            let e;
            while (this.i.length > 0) {
                (e = this.i.shift()).run();
                if (e.status === t) {
                    if (e.suspend === true) {
                        this.$ = e;
                        this.U();
                        return;
                    } else {
                        ++this.t;
                    }
                }
            }
            if (this.h.length > 0) {
                this.i.push(...this.h);
                this.h.length = 0;
            }
            if (this.u.length > 0) {
                for (let t = 0; t < this.u.length; ++t) {
                    i = this.u[t];
                    if (i.queueTime <= s) {
                        this.i.push(i);
                        this.u.splice(t--, 1);
                    }
                }
            }
            if (this.i.length > 0 || this.u.length > 0 || this.t > 0) {
                this.U();
            }
            if (this.A !== void 0 && this.T) {
                const s = this.A;
                this.A = void 0;
                s.resolve();
            }
        } else {
            this.U();
        }
    }
    cancel() {
        if (this.R) {
            this.$cancel();
            this.R = false;
        }
    }
    async yield() {
        if (this.isEmpty) ; else {
            if (this.A === void 0) {
                this.A = createExposedPromise();
            }
            await this.A;
        }
    }
    queueTask(s, t) {
        const {delay: i, preempt: e, persistent: h, suspend: o} = {
            ...r,
            ...t
        };
        if (e) {
            if (i > 0) {
                throw preemptDelayComboError();
            }
            if (h) {
                throw preemptyPersistentComboError();
            }
        }
        if (this.i.length === 0) {
            this.U();
        }
        const n = this.q();
        const c = new Task(this.I, this, n, n + i, e, h, o, s);
        if (e) {
            this.i[this.i.length] = c;
        } else if (i === 0) {
            this.h[this.h.length] = c;
        } else {
            this.u[this.u.length] = c;
        }
        return c;
    }
    remove(s) {
        let t = this.i.indexOf(s);
        if (t > -1) {
            this.i.splice(t, 1);
            return;
        }
        t = this.h.indexOf(s);
        if (t > -1) {
            this.h.splice(t, 1);
            return;
        }
        t = this.u.indexOf(s);
        if (t > -1) {
            this.u.splice(t, 1);
            return;
        }
        throw createError(`Task #${s.id} could not be found`);
    }
    _(s) {
        s.reset(this.q());
        if (s.createdTime === s.queueTime) {
            this.h[this.h.length] = s;
        } else {
            this.u[this.u.length] = s;
        }
    }
    C(s) {
        if (s.suspend === true) {
            if (this.$ !== s) {
                throw createError(`Async task completion mismatch: suspenderTask=${this.$?.id}, task=${s.id}`);
            }
            this.$ = void 0;
        } else {
            --this.t;
        }
        if (this.A !== void 0 && this.T) {
            const s = this.A;
            this.A = void 0;
            s.resolve();
        }
        if (this.isEmpty) {
            this.cancel();
        }
    }
}

class TaskAbortError extends Error {
    constructor(s) {
        super("Task was canceled.");
        this.task = s;
    }
}

let o = 0;

class Task {
    get result() {
        const h = this.N;
        if (h === void 0) {
            switch (this.j) {
              case s:
                {
                    const s = this.N = createExposedPromise();
                    this.F = s.resolve;
                    this.O = s.reject;
                    return s;
                }

              case t:
                throw createError("Trying to await task from within task will cause a deadlock.");

              case i:
                return this.N = Promise.resolve();

              case e:
                return this.N = Promise.reject(new TaskAbortError(this));
            }
        }
        return h;
    }
    get status() {
        return this.j;
    }
    constructor(t, i, e, h, r, n, c, a) {
        this.taskQueue = i;
        this.createdTime = e;
        this.queueTime = h;
        this.preempt = r;
        this.persistent = n;
        this.suspend = c;
        this.callback = a;
        this.id = ++o;
        this.F = void 0;
        this.O = void 0;
        this.N = void 0;
        this.j = s;
        this.I = t;
    }
    run(h = this.taskQueue.platform.performanceNow()) {
        if (this.j !== s) {
            throw createError(`Cannot run task in ${this.j} state`);
        }
        const {persistent: o, taskQueue: r, callback: n, F: c, O: a, createdTime: f} = this;
        let l;
        this.j = t;
        try {
            l = n(h - f);
            if (l instanceof Promise) {
                l.then(s => {
                    if (this.persistent) {
                        r._(this);
                    } else {
                        if (o) {
                            this.j = e;
                        } else {
                            this.j = i;
                        }
                        this.dispose();
                    }
                    r.C(this);
                    if (false && this.I.enabled) ;
                    if (c !== void 0) {
                        c(s);
                    }
                }).catch(s => {
                    if (!this.persistent) {
                        this.dispose();
                    }
                    r.C(this);
                    if (false && this.I.enabled) ;
                    if (a !== void 0) {
                        a(s);
                    } else {
                        throw s;
                    }
                });
            } else {
                if (this.persistent) {
                    r._(this);
                } else {
                    if (o) {
                        this.j = e;
                    } else {
                        this.j = i;
                    }
                    this.dispose();
                }
                if (false && this.I.enabled) ;
                if (c !== void 0) {
                    c(l);
                }
            }
        } catch (s) {
            if (!this.persistent) {
                this.dispose();
            }
            if (a !== void 0) {
                a(s);
            } else {
                throw s;
            }
        }
    }
    cancel() {
        if (this.j === s) {
            const s = this.taskQueue;
            const t = this.O;
            s.remove(this);
            if (s.isEmpty) {
                s.cancel();
            }
            this.j = e;
            this.dispose();
            if (t !== void 0) {
                t(new TaskAbortError(this));
            }
            return true;
        } else if (this.j === t && this.persistent) {
            this.persistent = false;
            return true;
        }
        return false;
    }
    reset(t) {
        const i = this.queueTime - this.createdTime;
        this.createdTime = t;
        this.queueTime = t + i;
        this.j = s;
        this.F = void 0;
        this.O = void 0;
        this.N = void 0;
    }
    dispose() {
        this.callback = void 0;
        this.F = void 0;
        this.O = void 0;
        this.N = void 0;
    }
}

class Tracer {
    constructor(s) {
        this.console = s;
        this.enabled = false;
        this.depth = 0;
    }
    enter(s, t) {
        this.log(`${"  ".repeat(this.depth++)}> `, s, t);
    }
    leave(s, t) {
        this.log(`${"  ".repeat(--this.depth)}< `, s, t);
    }
    trace(s, t) {
        this.log(`${"  ".repeat(this.depth)}- `, s, t);
    }
    log(s, t, i) {
        if (t instanceof TaskQueue) {
            const e = t.i.length;
            const h = t.h.length;
            const o = t.u.length;
            const r = t.R;
            const n = !!t.$;
            const c = `processing=${e} pending=${h} delayed=${o} flushReq=${r} susTask=${n}`;
            this.console.log(`${s}[Q.${i}] ${c}`);
        } else {
            const e = t["id"];
            const h = Math.round(t["createdTime"] * 10) / 10;
            const o = Math.round(t["queueTime"] * 10) / 10;
            const r = t["preempt"];
            const n = t["persistent"];
            const c = t["suspend"];
            const a = t["j"];
            const f = `id=${e} created=${h} queue=${o} preempt=${r} persistent=${n} status=${a} suspend=${c}`;
            this.console.log(`${s}[T.${i}] ${f}`);
        }
    }
}

const r = {
    delay: 0,
    preempt: false,
    persistent: false,
    suspend: false
};

let n;

let c;

const executor = (s, t) => {
    n = s;
    c = t;
};

const createExposedPromise = () => {
    const s = new Promise(executor);
    s.resolve = n;
    s.reject = c;
    return s;
};

const isPersistent = s => s.persistent;

const preemptDelayComboError = () => createError(`AUR1006`);

const preemptyPersistentComboError = () => createError(`AUR1007`);

const createError = s => new Error(s);

const reportTaskQueue = s => {
    const t = s.i;
    const i = s.h;
    const e = s.u;
    const h = s.R;
    return {
        processing: t,
        pending: i,
        delayed: e,
        flushRequested: h
    };
};

const ensureEmpty = s => {
    s.flush();
    s.h.forEach(s => s.cancel());
};

export { Platform, Task, TaskAbortError, TaskQueue, ensureEmpty, reportTaskQueue };
//# sourceMappingURL=index.mjs.map
