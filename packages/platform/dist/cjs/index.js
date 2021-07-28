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
        var e, h, r, n, o, c, a, l, u, f, d, v, p;
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
        this.clearTimeout = "clearTimeout" in i ? i.clearTimeout : null !== (n = null === (r = t.clearTimeout) || void 0 === r ? void 0 : r.bind(t)) && void 0 !== n ? n : s("clearTimeout");
        this.queueMicrotask = "queueMicrotask" in i ? i.queueMicrotask : null !== (c = null === (o = t.queueMicrotask) || void 0 === o ? void 0 : o.bind(t)) && void 0 !== c ? c : s("queueMicrotask");
        this.setInterval = "setInterval" in i ? i.setInterval : null !== (l = null === (a = t.setInterval) || void 0 === a ? void 0 : a.bind(t)) && void 0 !== l ? l : s("setInterval");
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
        this.processing = [];
        this.suspenderTask = void 0;
        this.pendingAsyncCount = 0;
        this.pending = [];
        this.delayed = [];
        this.flushRequested = false;
        this.yieldPromise = void 0;
        this.taskPool = [];
        this.taskPoolSize = 0;
        this.lastRequest = 0;
        this.lastFlush = 0;
        this.requestFlush = () => {
            if (this.tracer.enabled) this.tracer.enter(this, "requestFlush");
            if (!this.flushRequested) {
                this.flushRequested = true;
                this.lastRequest = this.platform.performanceNow();
                this.$request();
            }
            if (this.tracer.enabled) this.tracer.leave(this, "requestFlush");
        };
        this.tracer = new Tracer(t.console);
    }
    get isEmpty() {
        return 0 === this.pendingAsyncCount && 0 === this.processing.length && 0 === this.pending.length && 0 === this.delayed.length;
    }
    get hasNoMoreFiniteWork() {
        return 0 === this.pendingAsyncCount && this.processing.every(i) && this.pending.every(i) && this.delayed.every(i);
    }
    flush(t = this.platform.performanceNow()) {
        if (this.tracer.enabled) this.tracer.enter(this, "flush");
        this.flushRequested = false;
        this.lastFlush = t;
        if (void 0 === this.suspenderTask) {
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
                    this.suspenderTask = s;
                    this.requestFlush();
                    if (this.tracer.enabled) this.tracer.leave(this, "flush early async");
                    return;
                } else ++this.pendingAsyncCount;
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
            if (this.processing.length > 0 || this.delayed.length > 0 || this.pendingAsyncCount > 0) this.requestFlush();
            if (void 0 !== this.yieldPromise && this.hasNoMoreFiniteWork) {
                const t = this.yieldPromise;
                this.yieldPromise = void 0;
                t.resolve();
            }
        } else this.requestFlush();
        if (this.tracer.enabled) this.tracer.leave(this, "flush full");
    }
    cancel() {
        if (this.tracer.enabled) this.tracer.enter(this, "cancel");
        if (this.flushRequested) {
            this.$cancel();
            this.flushRequested = false;
        }
        if (this.tracer.enabled) this.tracer.leave(this, "cancel");
    }
    async yield() {
        if (this.tracer.enabled) this.tracer.enter(this, "yield");
        if (this.isEmpty) {
            if (this.tracer.enabled) this.tracer.leave(this, "yield empty");
        } else {
            if (void 0 === this.yieldPromise) {
                if (this.tracer.enabled) this.tracer.trace(this, "yield - creating promise");
                this.yieldPromise = a();
            }
            await this.yieldPromise;
            if (this.tracer.enabled) this.tracer.leave(this, "yield task");
        }
    }
    queueTask(t, s) {
        if (this.tracer.enabled) this.tracer.enter(this, "queueTask");
        const {delay: i, preempt: e, persistent: h, reusable: n, suspend: o} = {
            ...r,
            ...s
        };
        if (e) {
            if (i > 0) throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
            if (h) throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
        }
        if (0 === this.processing.length) this.requestFlush();
        const c = this.platform.performanceNow();
        let a;
        if (n) {
            const s = this.taskPool;
            const r = this.taskPoolSize - 1;
            if (r >= 0) {
                a = s[r];
                s[r] = void 0;
                this.taskPoolSize = r;
                a.reuse(c, i, e, h, o, t);
            } else a = new Task(this.tracer, this, c, c + i, e, h, o, n, t);
        } else a = new Task(this.tracer, this, c, c + i, e, h, o, n, t);
        if (e) this.processing[this.processing.length] = a; else if (0 === i) this.pending[this.pending.length] = a; else this.delayed[this.delayed.length] = a;
        if (this.tracer.enabled) this.tracer.leave(this, "queueTask");
        return a;
    }
    remove(t) {
        if (this.tracer.enabled) this.tracer.enter(this, "remove");
        let s = this.processing.indexOf(t);
        if (s > -1) {
            this.processing.splice(s, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove processing");
            return;
        }
        s = this.pending.indexOf(t);
        if (s > -1) {
            this.pending.splice(s, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove pending");
            return;
        }
        s = this.delayed.indexOf(t);
        if (s > -1) {
            this.delayed.splice(s, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove delayed");
            return;
        }
        if (this.tracer.enabled) this.tracer.leave(this, "remove error");
        throw new Error(`Task #${t.id} could not be found`);
    }
    returnToPool(t) {
        if (this.tracer.enabled) this.tracer.trace(this, "returnToPool");
        this.taskPool[this.taskPoolSize++] = t;
    }
    resetPersistentTask(t) {
        if (this.tracer.enabled) this.tracer.enter(this, "resetPersistentTask");
        t.reset(this.platform.performanceNow());
        if (t.createdTime === t.queueTime) this.pending[this.pending.length] = t; else this.delayed[this.delayed.length] = t;
        if (this.tracer.enabled) this.tracer.leave(this, "resetPersistentTask");
    }
    completeAsyncTask(t) {
        var s;
        if (this.tracer.enabled) this.tracer.enter(this, "completeAsyncTask");
        if (true === t.suspend) {
            if (this.suspenderTask !== t) {
                if (this.tracer.enabled) this.tracer.leave(this, "completeAsyncTask error");
                throw new Error(`Async task completion mismatch: suspenderTask=${null === (s = this.suspenderTask) || void 0 === s ? void 0 : s.id}, task=${t.id}`);
            }
            this.suspenderTask = void 0;
        } else --this.pendingAsyncCount;
        if (void 0 !== this.yieldPromise && this.hasNoMoreFiniteWork) {
            const t = this.yieldPromise;
            this.yieldPromise = void 0;
            t.resolve();
        }
        if (this.isEmpty) this.cancel();
        if (this.tracer.enabled) this.tracer.leave(this, "completeAsyncTask");
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
    constructor(t, s, i, h, r, n, o, c, a) {
        this.tracer = t;
        this.taskQueue = s;
        this.createdTime = i;
        this.queueTime = h;
        this.preempt = r;
        this.persistent = n;
        this.suspend = o;
        this.reusable = c;
        this.callback = a;
        this.id = ++e;
        this.t = void 0;
        this.i = void 0;
        this.h = void 0;
        this.o = 0;
    }
    get result() {
        const t = this.h;
        if (void 0 === t) switch (this.o) {
          case 0:
            {
                const t = this.h = a();
                this.t = t.resolve;
                this.i = t.reject;
                return t;
            }

          case 1:
            throw new Error("Trying to await task from within task will cause a deadlock.");

          case 2:
            return this.h = Promise.resolve();

          case 3:
            return this.h = Promise.reject(new TaskAbortError(this));
        }
        return t;
    }
    get status() {
        return this.o;
    }
    run(t = this.taskQueue.platform.performanceNow()) {
        if (this.tracer.enabled) this.tracer.enter(this, "run");
        if (0 !== this.o) {
            if (this.tracer.enabled) this.tracer.leave(this, "run error");
            throw new Error(`Cannot run task in ${this.o} state`);
        }
        const {persistent: s, reusable: i, taskQueue: e, callback: h, t: r, i: n, createdTime: o} = this;
        let c;
        this.o = 1;
        try {
            c = h(t - o);
            if (c instanceof Promise) c.then((t => {
                if (this.persistent) e["resetPersistentTask"](this); else {
                    if (s) this.o = 3; else this.o = 2;
                    this.dispose();
                }
                e["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async then");
                if (void 0 !== r) r(t);
                if (!this.persistent && i) e["returnToPool"](this);
            })).catch((t => {
                if (!this.persistent) this.dispose();
                e["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async catch");
                if (void 0 !== n) n(t); else throw t;
            })); else {
                if (this.persistent) e["resetPersistentTask"](this); else {
                    if (s) this.o = 3; else this.o = 2;
                    this.dispose();
                }
                if (this.tracer.enabled) this.tracer.leave(this, "run sync success");
                if (void 0 !== r) r(c);
                if (!this.persistent && i) e["returnToPool"](this);
            }
        } catch (t) {
            if (!this.persistent) this.dispose();
            if (this.tracer.enabled) this.tracer.leave(this, "run sync error");
            if (void 0 !== n) n(t); else throw t;
        }
    }
    cancel() {
        if (this.tracer.enabled) this.tracer.enter(this, "cancel");
        if (0 === this.o) {
            const t = this.taskQueue;
            const s = this.reusable;
            const i = this.i;
            t.remove(this);
            if (t.isEmpty) t.cancel();
            this.o = 3;
            this.dispose();
            if (s) t["returnToPool"](this);
            if (void 0 !== i) i(new TaskAbortError(this));
            if (this.tracer.enabled) this.tracer.leave(this, "cancel true =pending");
            return true;
        } else if (1 === this.o && this.persistent) {
            this.persistent = false;
            if (this.tracer.enabled) this.tracer.leave(this, "cancel true =running+persistent");
            return true;
        }
        if (this.tracer.enabled) this.tracer.leave(this, "cancel false");
        return false;
    }
    reset(t) {
        if (this.tracer.enabled) this.tracer.enter(this, "reset");
        const s = this.queueTime - this.createdTime;
        this.createdTime = t;
        this.queueTime = t + s;
        this.o = 0;
        this.t = void 0;
        this.i = void 0;
        this.h = void 0;
        if (this.tracer.enabled) this.tracer.leave(this, "reset");
    }
    reuse(t, s, i, e, h, r) {
        if (this.tracer.enabled) this.tracer.enter(this, "reuse");
        this.createdTime = t;
        this.queueTime = t + s;
        this.preempt = i;
        this.persistent = e;
        this.suspend = h;
        this.callback = r;
        this.o = 0;
        if (this.tracer.enabled) this.tracer.leave(this, "reuse");
    }
    dispose() {
        if (this.tracer.enabled) this.tracer.trace(this, "dispose");
        this.callback = void 0;
        this.t = void 0;
        this.i = void 0;
        this.h = void 0;
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
            const n = s["flushRequested"];
            const o = !!s["suspenderTask"];
            const c = `processing=${e} pending=${h} delayed=${r} flushReq=${n} susTask=${o}`;
            this.console.log(`${t}[Q.${i}] ${c}`);
        } else {
            const e = s["id"];
            const r = Math.round(10 * s["createdTime"]) / 10;
            const n = Math.round(10 * s["queueTime"]) / 10;
            const o = s["preempt"];
            const c = s["reusable"];
            const a = s["persistent"];
            const l = s["suspend"];
            const u = h(s["o"]);
            const f = `id=${e} created=${r} queue=${n} preempt=${o} persistent=${a} reusable=${c} status=${u} suspend=${l}`;
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

let n;

let o;

function c(t, s) {
    n = t;
    o = s;
}

function a() {
    const t = new Promise(c);
    t.resolve = n;
    t.reject = o;
    return t;
}

exports.Platform = Platform;

exports.Task = Task;

exports.TaskAbortError = TaskAbortError;

exports.TaskQueue = TaskQueue;
//# sourceMappingURL=index.js.map
