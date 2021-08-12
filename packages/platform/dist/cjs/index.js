"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const t = new Map;

function s(t) {
    return function s() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${t}'.`);
    };
}

class Platform {
    constructor(t, i = {}) {
        var e, h, r, o, n, a, l, c, u, f, d, v, p;
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = t;
        this.decodeURI = "decodeURI" in i ? i.decodeURI : t.decodeURI;
        this.decodeURIComponent = "decodeURIComponent" in i ? i.decodeURIComponent : t.decodeURIComponent;
        this.encodeURI = "encodeURI" in i ? i.encodeURI : t.encodeURI;
        this.encodeURIComponent = "encodeURIComponent" in i ? i.encodeURIComponent : t.encodeURIComponent;
        this.Date = "Date" in i ? i.Date : t.Date;
        this.Reflect = "Reflect" in i ? i.Reflect : t.Reflect;
        this.clearInterval = "clearInterval" in i ? i.clearInterval : null !== (h = null === (e = t.clearInterval) || void 0 === e ? void 0 : e.bind(t)) && void 0 !== h ? h : s("clearInterval");
        this.clearTimeout = "clearTimeout" in i ? i.clearTimeout : null !== (o = null === (r = t.clearTimeout) || void 0 === r ? void 0 : r.bind(t)) && void 0 !== o ? o : s("clearTimeout");
        this.queueMicrotask = "queueMicrotask" in i ? i.queueMicrotask : null !== (a = null === (n = t.queueMicrotask) || void 0 === n ? void 0 : n.bind(t)) && void 0 !== a ? a : s("queueMicrotask");
        this.setInterval = "setInterval" in i ? i.setInterval : null !== (c = null === (l = t.setInterval) || void 0 === l ? void 0 : l.bind(t)) && void 0 !== c ? c : s("setInterval");
        this.setTimeout = "setTimeout" in i ? i.setTimeout : null !== (f = null === (u = t.setTimeout) || void 0 === u ? void 0 : u.bind(t)) && void 0 !== f ? f : s("setTimeout");
        this.console = "console" in i ? i.console : t.console;
        this.performanceNow = "performanceNow" in i ? i.performanceNow : null !== (p = null === (v = null === (d = t.performance) || void 0 === d ? void 0 : d.now) || void 0 === v ? void 0 : v.bind(t.performance)) && void 0 !== p ? p : s("performance.now");
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(s, i = {}) {
        let e = t.get(s);
        if (void 0 === e) t.set(s, e = new Platform(s, i));
        return e;
    }
    static set(s, i) {
        t.set(s, i);
    }
    requestMacroTask() {
        this.macroTaskRequested = true;
        if (-1 === this.macroTaskHandle) this.macroTaskHandle = this.setTimeout(this.flushMacroTask, 0);
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
        if (true === this.macroTaskRequested) {
            this.macroTaskRequested = false;
            this.taskQueue.flush();
        }
    }
}

function i(t) {
    return t.persistent;
}

class TaskQueue {
    constructor(t, s, i) {
        this.platform = t;
        this.$request = s;
        this.$cancel = i;
        this.t = void 0;
        this.i = 0;
        this.processing = [];
        this.pending = [];
        this.delayed = [];
        this.flushRequested = false;
        this.h = void 0;
        this.taskPool = [];
        this.l = 0;
        this.u = 0;
        this.T = 0;
        this.$ = () => {
            if (!this.flushRequested) {
                this.flushRequested = true;
                this.u = this.platform.performanceNow();
                this.$request();
            }
        };
        this.M = new Tracer(t.console);
    }
    get isEmpty() {
        return 0 === this.i && 0 === this.processing.length && 0 === this.pending.length && 0 === this.delayed.length;
    }
    get I() {
        return 0 === this.i && this.processing.every(i) && this.pending.every(i) && this.delayed.every(i);
    }
    flush(t = this.platform.performanceNow()) {
        this.flushRequested = false;
        this.T = t;
        if (void 0 === this.t) {
            if (this.pending.length > 0) {
                this.processing.push(...this.pending);
                this.pending.length = 0;
            }
            if (this.delayed.length > 0) {
                let s = -1;
                while (++s < this.delayed.length && this.delayed[s].queueTime <= t) ;
                this.processing.push(...this.delayed.splice(0, s));
            }
            let s;
            while (this.processing.length > 0) {
                (s = this.processing.shift()).run();
                if (1 === s.status) if (true === s.suspend) {
                    this.t = s;
                    this.$();
                    return;
                } else ++this.i;
            }
            if (this.pending.length > 0) {
                this.processing.push(...this.pending);
                this.pending.length = 0;
            }
            if (this.delayed.length > 0) {
                let s = -1;
                while (++s < this.delayed.length && this.delayed[s].queueTime <= t) ;
                this.processing.push(...this.delayed.splice(0, s));
            }
            if (this.processing.length > 0 || this.delayed.length > 0 || this.i > 0) this.$();
            if (void 0 !== this.h && this.I) {
                const t = this.h;
                this.h = void 0;
                t.resolve();
            }
        } else this.$();
    }
    cancel() {
        if (this.flushRequested) {
            this.$cancel();
            this.flushRequested = false;
        }
    }
    async yield() {
        if (this.isEmpty) ; else {
            if (void 0 === this.h) this.h = l();
            await this.h;
        }
    }
    queueTask(t, s) {
        const {delay: i, preempt: e, persistent: h, reusable: o, suspend: n} = {
            ...r,
            ...s
        };
        if (e) {
            if (i > 0) throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
            if (h) throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
        }
        if (0 === this.processing.length) this.$();
        const a = this.platform.performanceNow();
        let l;
        if (o) {
            const s = this.taskPool;
            const r = this.l - 1;
            if (r >= 0) {
                l = s[r];
                s[r] = void 0;
                this.l = r;
                l.reuse(a, i, e, h, n, t);
            } else l = new Task(this.M, this, a, a + i, e, h, n, o, t);
        } else l = new Task(this.M, this, a, a + i, e, h, n, o, t);
        if (e) this.processing[this.processing.length] = l; else if (0 === i) this.pending[this.pending.length] = l; else this.delayed[this.delayed.length] = l;
        return l;
    }
    remove(t) {
        let s = this.processing.indexOf(t);
        if (s > -1) {
            this.processing.splice(s, 1);
            return;
        }
        s = this.pending.indexOf(t);
        if (s > -1) {
            this.pending.splice(s, 1);
            return;
        }
        s = this.delayed.indexOf(t);
        if (s > -1) {
            this.delayed.splice(s, 1);
            return;
        }
        throw new Error(`Task #${t.id} could not be found`);
    }
    returnToPool(t) {
        this.taskPool[this.l++] = t;
    }
    resetPersistentTask(t) {
        t.reset(this.platform.performanceNow());
        if (t.createdTime === t.queueTime) this.pending[this.pending.length] = t; else this.delayed[this.delayed.length] = t;
    }
    completeAsyncTask(t) {
        var s;
        if (true === t.suspend) {
            if (this.t !== t) throw new Error(`Async task completion mismatch: suspenderTask=${null === (s = this.t) || void 0 === s ? void 0 : s.id}, task=${t.id}`);
            this.t = void 0;
        } else --this.i;
        if (void 0 !== this.h && this.I) {
            const t = this.h;
            this.h = void 0;
            t.resolve();
        }
        if (this.isEmpty) this.cancel();
    }
}

class TaskAbortError extends Error {
    constructor(t) {
        super("Task was canceled.");
        this.task = t;
    }
}

let e = 0;

exports.TaskStatus = void 0;

(function(t) {
    t[t["pending"] = 0] = "pending";
    t[t["running"] = 1] = "running";
    t[t["completed"] = 2] = "completed";
    t[t["canceled"] = 3] = "canceled";
})(exports.TaskStatus || (exports.TaskStatus = {}));

class Task {
    constructor(t, s, i, h, r, o, n, a, l) {
        this.taskQueue = s;
        this.createdTime = i;
        this.queueTime = h;
        this.preempt = r;
        this.persistent = o;
        this.suspend = n;
        this.reusable = a;
        this.callback = l;
        this.id = ++e;
        this.P = void 0;
        this.R = void 0;
        this.A = void 0;
        this.q = 0;
        this.M = t;
    }
    get result() {
        const t = this.A;
        if (void 0 === t) switch (this.q) {
          case 0:
            {
                const t = this.A = l();
                this.P = t.resolve;
                this.R = t.reject;
                return t;
            }

          case 1:
            throw new Error("Trying to await task from within task will cause a deadlock.");

          case 2:
            return this.A = Promise.resolve();

          case 3:
            return this.A = Promise.reject(new TaskAbortError(this));
        }
        return t;
    }
    get status() {
        return this.q;
    }
    run(t = this.taskQueue.platform.performanceNow()) {
        if (0 !== this.q) throw new Error(`Cannot run task in ${this.q} state`);
        const {persistent: s, reusable: i, taskQueue: e, callback: h, P: r, R: o, createdTime: n} = this;
        let a;
        this.q = 1;
        try {
            a = h(t - n);
            if (a instanceof Promise) a.then((t => {
                if (this.persistent) e["resetPersistentTask"](this); else {
                    if (s) this.q = 3; else this.q = 2;
                    this.dispose();
                }
                e["completeAsyncTask"](this);
                if (false && this.M.enabled) ;
                if (void 0 !== r) r(t);
                if (!this.persistent && i) e["returnToPool"](this);
            })).catch((t => {
                if (!this.persistent) this.dispose();
                e["completeAsyncTask"](this);
                if (false && this.M.enabled) ;
                if (void 0 !== o) o(t); else throw t;
            })); else {
                if (this.persistent) e["resetPersistentTask"](this); else {
                    if (s) this.q = 3; else this.q = 2;
                    this.dispose();
                }
                if (false && this.M.enabled) ;
                if (void 0 !== r) r(a);
                if (!this.persistent && i) e["returnToPool"](this);
            }
        } catch (t) {
            if (!this.persistent) this.dispose();
            if (void 0 !== o) o(t); else throw t;
        }
    }
    cancel() {
        if (0 === this.q) {
            const t = this.taskQueue;
            const s = this.reusable;
            const i = this.R;
            t.remove(this);
            if (t.isEmpty) t.cancel();
            this.q = 3;
            this.dispose();
            if (s) t["returnToPool"](this);
            if (void 0 !== i) i(new TaskAbortError(this));
            return true;
        } else if (1 === this.q && this.persistent) {
            this.persistent = false;
            return true;
        }
        return false;
    }
    reset(t) {
        const s = this.queueTime - this.createdTime;
        this.createdTime = t;
        this.queueTime = t + s;
        this.q = 0;
        this.P = void 0;
        this.R = void 0;
        this.A = void 0;
    }
    reuse(t, s, i, e, h, r) {
        this.createdTime = t;
        this.queueTime = t + s;
        this.preempt = i;
        this.persistent = e;
        this.suspend = h;
        this.callback = r;
        this.q = 0;
    }
    dispose() {
        this.callback = void 0;
        this.P = void 0;
        this.R = void 0;
        this.A = void 0;
    }
}

function h(t) {
    switch (t) {
      case 0:
        return "pending";

      case 1:
        return "running";

      case 3:
        return "canceled";

      case 2:
        return "completed";
    }
}

class Tracer {
    constructor(t) {
        this.console = t;
        this.enabled = false;
        this.depth = 0;
    }
    enter(t, s) {
        this.log(`${"  ".repeat(this.depth++)}> `, t, s);
    }
    leave(t, s) {
        this.log(`${"  ".repeat(--this.depth)}< `, t, s);
    }
    trace(t, s) {
        this.log(`${"  ".repeat(this.depth)}- `, t, s);
    }
    log(t, s, i) {
        if (s instanceof TaskQueue) {
            const e = s["processing"].length;
            const h = s["pending"].length;
            const r = s["delayed"].length;
            const o = s["flushRequested"];
            const n = !!s.t;
            const a = `processing=${e} pending=${h} delayed=${r} flushReq=${o} susTask=${n}`;
            this.console.log(`${t}[Q.${i}] ${a}`);
        } else {
            const e = s["id"];
            const r = Math.round(10 * s["createdTime"]) / 10;
            const o = Math.round(10 * s["queueTime"]) / 10;
            const n = s["preempt"];
            const a = s["reusable"];
            const l = s["persistent"];
            const c = s["suspend"];
            const u = h(s["q"]);
            const f = `id=${e} created=${r} queue=${o} preempt=${n} persistent=${l} reusable=${a} status=${u} suspend=${c}`;
            this.console.log(`${t}[T.${i}] ${f}`);
        }
    }
}

exports.TaskQueuePriority = void 0;

(function(t) {
    t[t["render"] = 0] = "render";
    t[t["macroTask"] = 1] = "macroTask";
    t[t["postRender"] = 2] = "postRender";
})(exports.TaskQueuePriority || (exports.TaskQueuePriority = {}));

const r = {
    delay: 0,
    preempt: false,
    persistent: false,
    reusable: true,
    suspend: false
};

let o;

let n;

function a(t, s) {
    o = t;
    n = s;
}

function l() {
    const t = new Promise(a);
    t.resolve = o;
    t.reject = n;
    return t;
}

exports.Platform = Platform;

exports.Task = Task;

exports.TaskAbortError = TaskAbortError;

exports.TaskQueue = TaskQueue;
//# sourceMappingURL=index.js.map
