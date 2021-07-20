"use strict";

Object.defineProperty(exports, "t", {
    value: true
});

const s = new Map;

function t(s) {
    return function t() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${s}'.`);
    };
}

class Platform {
    constructor(s, i = {}) {
        var h, e, r, n, o, c, a, l, u, f, d, v, p;
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = s;
        this.decodeURI = "decodeURI" in i ? i.decodeURI : s.decodeURI;
        this.decodeURIComponent = "decodeURIComponent" in i ? i.decodeURIComponent : s.decodeURIComponent;
        this.encodeURI = "encodeURI" in i ? i.encodeURI : s.encodeURI;
        this.encodeURIComponent = "encodeURIComponent" in i ? i.encodeURIComponent : s.encodeURIComponent;
        this.Date = "Date" in i ? i.Date : s.Date;
        this.Reflect = "Reflect" in i ? i.Reflect : s.Reflect;
        this.clearInterval = "clearInterval" in i ? i.clearInterval : null !== (e = null === (h = s.clearInterval) || void 0 === h ? void 0 : h.bind(s)) && void 0 !== e ? e : t("clearInterval");
        this.clearTimeout = "clearTimeout" in i ? i.clearTimeout : null !== (n = null === (r = s.clearTimeout) || void 0 === r ? void 0 : r.bind(s)) && void 0 !== n ? n : t("clearTimeout");
        this.queueMicrotask = "queueMicrotask" in i ? i.queueMicrotask : null !== (c = null === (o = s.queueMicrotask) || void 0 === o ? void 0 : o.bind(s)) && void 0 !== c ? c : t("queueMicrotask");
        this.setInterval = "setInterval" in i ? i.setInterval : null !== (l = null === (a = s.setInterval) || void 0 === a ? void 0 : a.bind(s)) && void 0 !== l ? l : t("setInterval");
        this.setTimeout = "setTimeout" in i ? i.setTimeout : null !== (f = null === (u = s.setTimeout) || void 0 === u ? void 0 : u.bind(s)) && void 0 !== f ? f : t("setTimeout");
        this.console = "console" in i ? i.console : s.console;
        this.performanceNow = "performanceNow" in i ? i.performanceNow : null !== (p = null === (v = null === (d = s.performance) || void 0 === d ? void 0 : d.now) || void 0 === v ? void 0 : v.bind(s.performance)) && void 0 !== p ? p : t("performance.now");
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(t, i = {}) {
        let h = s.get(t);
        if (void 0 === h) s.set(t, h = new Platform(t, i));
        return h;
    }
    static set(t, i) {
        s.set(t, i);
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

function i(s) {
    return s.persistent;
}

class TaskQueue {
    constructor(s, t, i) {
        this.platform = s;
        this.$request = t;
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
        this.tracer = new Tracer(s.console);
    }
    get isEmpty() {
        return 0 === this.pendingAsyncCount && 0 === this.processing.length && 0 === this.pending.length && 0 === this.delayed.length;
    }
    get hasNoMoreFiniteWork() {
        return 0 === this.pendingAsyncCount && this.processing.every(i) && this.pending.every(i) && this.delayed.every(i);
    }
    flush(s = this.platform.performanceNow()) {
        if (this.tracer.enabled) this.tracer.enter(this, "flush");
        this.flushRequested = false;
        this.lastFlush = s;
        if (void 0 === this.suspenderTask) {
            if (this.pending.length > 0) {
                this.processing.push(...this.pending);
                this.pending.length = 0;
            }
            if (this.delayed.length > 0) {
                let t = -1;
                while (++t < this.delayed.length && this.delayed[t].queueTime <= s) ;
                this.processing.push(...this.delayed.splice(0, t));
            }
            let t;
            while (this.processing.length > 0) {
                (t = this.processing.shift()).run();
                if (1 === t.status) if (true === t.suspend) {
                    this.suspenderTask = t;
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
                let t = -1;
                while (++t < this.delayed.length && this.delayed[t].queueTime <= s) ;
                this.processing.push(...this.delayed.splice(0, t));
            }
            if (this.processing.length > 0 || this.delayed.length > 0 || this.pendingAsyncCount > 0) this.requestFlush();
            if (void 0 !== this.yieldPromise && this.hasNoMoreFiniteWork) {
                const s = this.yieldPromise;
                this.yieldPromise = void 0;
                s.resolve();
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
    queueTask(s, t) {
        if (this.tracer.enabled) this.tracer.enter(this, "queueTask");
        const {delay: i, preempt: h, persistent: e, reusable: n, suspend: o} = {
            ...r,
            ...t
        };
        if (h) {
            if (i > 0) throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
            if (e) throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
        }
        if (0 === this.processing.length) this.requestFlush();
        const c = this.platform.performanceNow();
        let a;
        if (n) {
            const t = this.taskPool;
            const r = this.taskPoolSize - 1;
            if (r >= 0) {
                a = t[r];
                t[r] = void 0;
                this.taskPoolSize = r;
                a.reuse(c, i, h, e, o, s);
            } else a = new Task(this.tracer, this, c, c + i, h, e, o, n, s);
        } else a = new Task(this.tracer, this, c, c + i, h, e, o, n, s);
        if (h) this.processing[this.processing.length] = a; else if (0 === i) this.pending[this.pending.length] = a; else this.delayed[this.delayed.length] = a;
        if (this.tracer.enabled) this.tracer.leave(this, "queueTask");
        return a;
    }
    remove(s) {
        if (this.tracer.enabled) this.tracer.enter(this, "remove");
        let t = this.processing.indexOf(s);
        if (t > -1) {
            this.processing.splice(t, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove processing");
            return;
        }
        t = this.pending.indexOf(s);
        if (t > -1) {
            this.pending.splice(t, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove pending");
            return;
        }
        t = this.delayed.indexOf(s);
        if (t > -1) {
            this.delayed.splice(t, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove delayed");
            return;
        }
        if (this.tracer.enabled) this.tracer.leave(this, "remove error");
        throw new Error(`Task #${s.id} could not be found`);
    }
    returnToPool(s) {
        if (this.tracer.enabled) this.tracer.trace(this, "returnToPool");
        this.taskPool[this.taskPoolSize++] = s;
    }
    resetPersistentTask(s) {
        if (this.tracer.enabled) this.tracer.enter(this, "resetPersistentTask");
        s.reset(this.platform.performanceNow());
        if (s.createdTime === s.queueTime) this.pending[this.pending.length] = s; else this.delayed[this.delayed.length] = s;
        if (this.tracer.enabled) this.tracer.leave(this, "resetPersistentTask");
    }
    completeAsyncTask(s) {
        var t;
        if (this.tracer.enabled) this.tracer.enter(this, "completeAsyncTask");
        if (true === s.suspend) {
            if (this.suspenderTask !== s) {
                if (this.tracer.enabled) this.tracer.leave(this, "completeAsyncTask error");
                throw new Error(`Async task completion mismatch: suspenderTask=${null === (t = this.suspenderTask) || void 0 === t ? void 0 : t.id}, task=${s.id}`);
            }
            this.suspenderTask = void 0;
        } else --this.pendingAsyncCount;
        if (void 0 !== this.yieldPromise && this.hasNoMoreFiniteWork) {
            const s = this.yieldPromise;
            this.yieldPromise = void 0;
            s.resolve();
        }
        if (this.isEmpty) this.cancel();
        if (this.tracer.enabled) this.tracer.leave(this, "completeAsyncTask");
    }
}

class TaskAbortError extends Error {
    constructor(s) {
        super("Task was canceled.");
        this.task = s;
    }
}

let h = 0;

exports.TaskStatus = void 0;

(function(s) {
    s[s["pending"] = 0] = "pending";
    s[s["running"] = 1] = "running";
    s[s["completed"] = 2] = "completed";
    s[s["canceled"] = 3] = "canceled";
})(exports.TaskStatus || (exports.TaskStatus = {}));

class Task {
    constructor(s, t, i, e, r, n, o, c, a) {
        this.tracer = s;
        this.taskQueue = t;
        this.createdTime = i;
        this.queueTime = e;
        this.preempt = r;
        this.persistent = n;
        this.suspend = o;
        this.reusable = c;
        this.callback = a;
        this.id = ++h;
        this.resolve = void 0;
        this.reject = void 0;
        this.i = void 0;
        this.h = 0;
    }
    get result() {
        const s = this.i;
        if (void 0 === s) switch (this.h) {
          case 0:
            {
                const s = this.i = a();
                this.resolve = s.resolve;
                this.reject = s.reject;
                return s;
            }

          case 1:
            throw new Error("Trying to await task from within task will cause a deadlock.");

          case 2:
            return this.i = Promise.resolve();

          case 3:
            return this.i = Promise.reject(new TaskAbortError(this));
        }
        return s;
    }
    get status() {
        return this.h;
    }
    run(s = this.taskQueue.platform.performanceNow()) {
        if (this.tracer.enabled) this.tracer.enter(this, "run");
        if (0 !== this.h) {
            if (this.tracer.enabled) this.tracer.leave(this, "run error");
            throw new Error(`Cannot run task in ${this.h} state`);
        }
        const {persistent: t, reusable: i, taskQueue: h, callback: e, resolve: r, reject: n, createdTime: o} = this;
        this.h = 1;
        try {
            const c = e(s - o);
            if (c instanceof Promise) c.then((s => {
                if (this.persistent) h["resetPersistentTask"](this); else {
                    if (t) this.h = 3; else this.h = 2;
                    this.dispose();
                }
                h["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async then");
                if (void 0 !== r) r(s);
                if (!this.persistent && i) h["returnToPool"](this);
            })).catch((s => {
                if (!this.persistent) this.dispose();
                h["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async catch");
                if (void 0 !== n) n(s); else throw s;
            })); else {
                if (this.persistent) h["resetPersistentTask"](this); else {
                    if (t) this.h = 3; else this.h = 2;
                    this.dispose();
                }
                if (this.tracer.enabled) this.tracer.leave(this, "run sync success");
                if (void 0 !== r) r(c);
                if (!this.persistent && i) h["returnToPool"](this);
            }
        } catch (s) {
            if (!this.persistent) this.dispose();
            if (this.tracer.enabled) this.tracer.leave(this, "run sync error");
            if (void 0 !== n) n(s); else throw s;
        }
    }
    cancel() {
        if (this.tracer.enabled) this.tracer.enter(this, "cancel");
        if (0 === this.h) {
            const s = this.taskQueue;
            const t = this.reusable;
            const i = this.reject;
            s.remove(this);
            if (s.isEmpty) s.cancel();
            this.h = 3;
            this.dispose();
            if (t) s["returnToPool"](this);
            if (void 0 !== i) i(new TaskAbortError(this));
            if (this.tracer.enabled) this.tracer.leave(this, "cancel true =pending");
            return true;
        } else if (1 === this.h && this.persistent) {
            this.persistent = false;
            if (this.tracer.enabled) this.tracer.leave(this, "cancel true =running+persistent");
            return true;
        }
        if (this.tracer.enabled) this.tracer.leave(this, "cancel false");
        return false;
    }
    reset(s) {
        if (this.tracer.enabled) this.tracer.enter(this, "reset");
        const t = this.queueTime - this.createdTime;
        this.createdTime = s;
        this.queueTime = s + t;
        this.h = 0;
        this.resolve = void 0;
        this.reject = void 0;
        this.i = void 0;
        if (this.tracer.enabled) this.tracer.leave(this, "reset");
    }
    reuse(s, t, i, h, e, r) {
        if (this.tracer.enabled) this.tracer.enter(this, "reuse");
        this.createdTime = s;
        this.queueTime = s + t;
        this.preempt = i;
        this.persistent = h;
        this.suspend = e;
        this.callback = r;
        this.h = 0;
        if (this.tracer.enabled) this.tracer.leave(this, "reuse");
    }
    dispose() {
        if (this.tracer.enabled) this.tracer.trace(this, "dispose");
        this.callback = void 0;
        this.resolve = void 0;
        this.reject = void 0;
        this.i = void 0;
    }
}

function e(s) {
    switch (s) {
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
            const h = t["processing"].length;
            const e = t["pending"].length;
            const r = t["delayed"].length;
            const n = t["flushRequested"];
            const o = !!t["suspenderTask"];
            const c = `processing=${h} pending=${e} delayed=${r} flushReq=${n} susTask=${o}`;
            this.console.log(`${s}[Q.${i}] ${c}`);
        } else {
            const h = t["id"];
            const r = Math.round(10 * t["createdTime"]) / 10;
            const n = Math.round(10 * t["queueTime"]) / 10;
            const o = t["preempt"];
            const c = t["reusable"];
            const a = t["persistent"];
            const l = t["suspend"];
            const u = e(t["h"]);
            const f = `id=${h} created=${r} queue=${n} preempt=${o} persistent=${a} reusable=${c} status=${u} suspend=${l}`;
            this.console.log(`${s}[T.${i}] ${f}`);
        }
    }
}

exports.TaskQueuePriority = void 0;

(function(s) {
    s[s["render"] = 0] = "render";
    s[s["macroTask"] = 1] = "macroTask";
    s[s["postRender"] = 2] = "postRender";
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

function c(s, t) {
    n = s;
    o = t;
}

function a() {
    const s = new Promise(c);
    s.resolve = n;
    s.reject = o;
    return s;
}

exports.Platform = Platform;

exports.Task = Task;

exports.TaskAbortError = TaskAbortError;

exports.TaskQueue = TaskQueue;
//# sourceMappingURL=index.js.map
