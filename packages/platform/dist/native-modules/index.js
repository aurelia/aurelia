const i = new Map;

function t(i) {
    return function t() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${i}'.`);
    };
}

class Platform {
    constructor(i, s = {}) {
        var h, e, r, n, o, a, c, l, u, f, d, v, p;
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = i;
        this.decodeURI = "decodeURI" in s ? s.decodeURI : i.decodeURI;
        this.decodeURIComponent = "decodeURIComponent" in s ? s.decodeURIComponent : i.decodeURIComponent;
        this.encodeURI = "encodeURI" in s ? s.encodeURI : i.encodeURI;
        this.encodeURIComponent = "encodeURIComponent" in s ? s.encodeURIComponent : i.encodeURIComponent;
        this.Date = "Date" in s ? s.Date : i.Date;
        this.Reflect = "Reflect" in s ? s.Reflect : i.Reflect;
        this.clearInterval = "clearInterval" in s ? s.clearInterval : null !== (e = null === (h = i.clearInterval) || void 0 === h ? void 0 : h.bind(i)) && void 0 !== e ? e : t("clearInterval");
        this.clearTimeout = "clearTimeout" in s ? s.clearTimeout : null !== (n = null === (r = i.clearTimeout) || void 0 === r ? void 0 : r.bind(i)) && void 0 !== n ? n : t("clearTimeout");
        this.queueMicrotask = "queueMicrotask" in s ? s.queueMicrotask : null !== (a = null === (o = i.queueMicrotask) || void 0 === o ? void 0 : o.bind(i)) && void 0 !== a ? a : t("queueMicrotask");
        this.setInterval = "setInterval" in s ? s.setInterval : null !== (l = null === (c = i.setInterval) || void 0 === c ? void 0 : c.bind(i)) && void 0 !== l ? l : t("setInterval");
        this.setTimeout = "setTimeout" in s ? s.setTimeout : null !== (f = null === (u = i.setTimeout) || void 0 === u ? void 0 : u.bind(i)) && void 0 !== f ? f : t("setTimeout");
        this.console = "console" in s ? s.console : i.console;
        this.performanceNow = "performanceNow" in s ? s.performanceNow : null !== (p = null === (v = null === (d = i.performance) || void 0 === d ? void 0 : d.now) || void 0 === v ? void 0 : v.bind(i.performance)) && void 0 !== p ? p : t("performance.now");
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(t, s = {}) {
        let h = i.get(t);
        if (void 0 === h) i.set(t, h = new Platform(t, s));
        return h;
    }
    static set(t, s) {
        i.set(t, s);
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

function s(i) {
    return i.persistent;
}

class TaskQueue {
    constructor(i, t, s) {
        this.platform = i;
        this.$request = t;
        this.$cancel = s;
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
        this.tracer = new Tracer(i.console);
    }
    get isEmpty() {
        return 0 === this.pendingAsyncCount && 0 === this.processing.length && 0 === this.pending.length && 0 === this.delayed.length;
    }
    get hasNoMoreFiniteWork() {
        return 0 === this.pendingAsyncCount && this.processing.every(s) && this.pending.every(s) && this.delayed.every(s);
    }
    flush(i = this.platform.performanceNow()) {
        if (this.tracer.enabled) this.tracer.enter(this, "flush");
        this.flushRequested = false;
        this.lastFlush = i;
        if (void 0 === this.suspenderTask) {
            if (this.pending.length > 0) {
                this.processing.push(...this.pending);
                this.pending.length = 0;
            }
            if (this.delayed.length > 0) {
                let t = -1;
                while (++t < this.delayed.length && this.delayed[t].queueTime <= i) ;
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
                while (++t < this.delayed.length && this.delayed[t].queueTime <= i) ;
                this.processing.push(...this.delayed.splice(0, t));
            }
            if (this.processing.length > 0 || this.delayed.length > 0 || this.pendingAsyncCount > 0) this.requestFlush();
            if (void 0 !== this.yieldPromise && this.hasNoMoreFiniteWork) {
                const i = this.yieldPromise;
                this.yieldPromise = void 0;
                i.resolve();
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
                this.yieldPromise = u();
            }
            await this.yieldPromise;
            if (this.tracer.enabled) this.tracer.leave(this, "yield task");
        }
    }
    queueTask(i, t) {
        if (this.tracer.enabled) this.tracer.enter(this, "queueTask");
        const {delay: s, preempt: h, persistent: e, reusable: r, suspend: n} = {
            ...o,
            ...t
        };
        if (h) {
            if (s > 0) throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
            if (e) throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
        }
        if (0 === this.processing.length) this.requestFlush();
        const a = this.platform.performanceNow();
        let c;
        if (r) {
            const t = this.taskPool;
            const o = this.taskPoolSize - 1;
            if (o >= 0) {
                c = t[o];
                t[o] = void 0;
                this.taskPoolSize = o;
                c.reuse(a, s, h, e, n, i);
            } else c = new Task(this.tracer, this, a, a + s, h, e, n, r, i);
        } else c = new Task(this.tracer, this, a, a + s, h, e, n, r, i);
        if (h) this.processing[this.processing.length] = c; else if (0 === s) this.pending[this.pending.length] = c; else this.delayed[this.delayed.length] = c;
        if (this.tracer.enabled) this.tracer.leave(this, "queueTask");
        return c;
    }
    remove(i) {
        if (this.tracer.enabled) this.tracer.enter(this, "remove");
        let t = this.processing.indexOf(i);
        if (t > -1) {
            this.processing.splice(t, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove processing");
            return;
        }
        t = this.pending.indexOf(i);
        if (t > -1) {
            this.pending.splice(t, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove pending");
            return;
        }
        t = this.delayed.indexOf(i);
        if (t > -1) {
            this.delayed.splice(t, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove delayed");
            return;
        }
        if (this.tracer.enabled) this.tracer.leave(this, "remove error");
        throw new Error(`Task #${i.id} could not be found`);
    }
    returnToPool(i) {
        if (this.tracer.enabled) this.tracer.trace(this, "returnToPool");
        this.taskPool[this.taskPoolSize++] = i;
    }
    resetPersistentTask(i) {
        if (this.tracer.enabled) this.tracer.enter(this, "resetPersistentTask");
        i.reset(this.platform.performanceNow());
        if (i.createdTime === i.queueTime) this.pending[this.pending.length] = i; else this.delayed[this.delayed.length] = i;
        if (this.tracer.enabled) this.tracer.leave(this, "resetPersistentTask");
    }
    completeAsyncTask(i) {
        var t;
        if (this.tracer.enabled) this.tracer.enter(this, "completeAsyncTask");
        if (true === i.suspend) {
            if (this.suspenderTask !== i) {
                if (this.tracer.enabled) this.tracer.leave(this, "completeAsyncTask error");
                throw new Error(`Async task completion mismatch: suspenderTask=${null === (t = this.suspenderTask) || void 0 === t ? void 0 : t.id}, task=${i.id}`);
            }
            this.suspenderTask = void 0;
        } else --this.pendingAsyncCount;
        if (void 0 !== this.yieldPromise && this.hasNoMoreFiniteWork) {
            const i = this.yieldPromise;
            this.yieldPromise = void 0;
            i.resolve();
        }
        if (this.isEmpty) this.cancel();
        if (this.tracer.enabled) this.tracer.leave(this, "completeAsyncTask");
    }
}

class TaskAbortError extends Error {
    constructor(i) {
        super("Task was canceled.");
        this.task = i;
    }
}

let h = 0;

var e;

(function(i) {
    i[i["pending"] = 0] = "pending";
    i[i["running"] = 1] = "running";
    i[i["completed"] = 2] = "completed";
    i[i["canceled"] = 3] = "canceled";
})(e || (e = {}));

class Task {
    constructor(i, t, s, e, r, n, o, a, c) {
        this.tracer = i;
        this.taskQueue = t;
        this.createdTime = s;
        this.queueTime = e;
        this.preempt = r;
        this.persistent = n;
        this.suspend = o;
        this.reusable = a;
        this.callback = c;
        this.id = ++h;
        this.i = void 0;
        this.t = void 0;
        this.h = void 0;
        this.o = 0;
    }
    get result() {
        const i = this.h;
        if (void 0 === i) switch (this.o) {
          case 0:
            {
                const i = this.h = u();
                this.i = i.resolve;
                this.t = i.reject;
                return i;
            }

          case 1:
            throw new Error("Trying to await task from within task will cause a deadlock.");

          case 2:
            return this.h = Promise.resolve();

          case 3:
            return this.h = Promise.reject(new TaskAbortError(this));
        }
        return i;
    }
    get status() {
        return this.o;
    }
    run(i = this.taskQueue.platform.performanceNow()) {
        if (this.tracer.enabled) this.tracer.enter(this, "run");
        if (0 !== this.o) {
            if (this.tracer.enabled) this.tracer.leave(this, "run error");
            throw new Error(`Cannot run task in ${this.o} state`);
        }
        const {persistent: t, reusable: s, taskQueue: h, callback: e, i: r, t: n, createdTime: o} = this;
        let a;
        this.o = 1;
        try {
            a = e(i - o);
            if (a instanceof Promise) a.then((i => {
                if (this.persistent) h["resetPersistentTask"](this); else {
                    if (t) this.o = 3; else this.o = 2;
                    this.dispose();
                }
                h["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async then");
                if (void 0 !== r) r(i);
                if (!this.persistent && s) h["returnToPool"](this);
            })).catch((i => {
                if (!this.persistent) this.dispose();
                h["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async catch");
                if (void 0 !== n) n(i); else throw i;
            })); else {
                if (this.persistent) h["resetPersistentTask"](this); else {
                    if (t) this.o = 3; else this.o = 2;
                    this.dispose();
                }
                if (this.tracer.enabled) this.tracer.leave(this, "run sync success");
                if (void 0 !== r) r(a);
                if (!this.persistent && s) h["returnToPool"](this);
            }
        } catch (i) {
            if (!this.persistent) this.dispose();
            if (this.tracer.enabled) this.tracer.leave(this, "run sync error");
            if (void 0 !== n) n(i); else throw i;
        }
    }
    cancel() {
        if (this.tracer.enabled) this.tracer.enter(this, "cancel");
        if (0 === this.o) {
            const i = this.taskQueue;
            const t = this.reusable;
            const s = this.t;
            i.remove(this);
            if (i.isEmpty) i.cancel();
            this.o = 3;
            this.dispose();
            if (t) i["returnToPool"](this);
            if (void 0 !== s) s(new TaskAbortError(this));
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
    reset(i) {
        if (this.tracer.enabled) this.tracer.enter(this, "reset");
        const t = this.queueTime - this.createdTime;
        this.createdTime = i;
        this.queueTime = i + t;
        this.o = 0;
        this.i = void 0;
        this.t = void 0;
        this.h = void 0;
        if (this.tracer.enabled) this.tracer.leave(this, "reset");
    }
    reuse(i, t, s, h, e, r) {
        if (this.tracer.enabled) this.tracer.enter(this, "reuse");
        this.createdTime = i;
        this.queueTime = i + t;
        this.preempt = s;
        this.persistent = h;
        this.suspend = e;
        this.callback = r;
        this.o = 0;
        if (this.tracer.enabled) this.tracer.leave(this, "reuse");
    }
    dispose() {
        if (this.tracer.enabled) this.tracer.trace(this, "dispose");
        this.callback = void 0;
        this.i = void 0;
        this.t = void 0;
        this.h = void 0;
    }
}

function r(i) {
    switch (i) {
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
    constructor(i) {
        this.console = i;
        this.enabled = false;
        this.depth = 0;
    }
    enter(i, t) {
        this.log(`${"  ".repeat(this.depth++)}> `, i, t);
    }
    leave(i, t) {
        this.log(`${"  ".repeat(--this.depth)}< `, i, t);
    }
    trace(i, t) {
        this.log(`${"  ".repeat(this.depth)}- `, i, t);
    }
    log(i, t, s) {
        if (t instanceof TaskQueue) {
            const h = t["processing"].length;
            const e = t["pending"].length;
            const r = t["delayed"].length;
            const n = t["flushRequested"];
            const o = !!t["suspenderTask"];
            const a = `processing=${h} pending=${e} delayed=${r} flushReq=${n} susTask=${o}`;
            this.console.log(`${i}[Q.${s}] ${a}`);
        } else {
            const h = t["id"];
            const e = Math.round(10 * t["createdTime"]) / 10;
            const n = Math.round(10 * t["queueTime"]) / 10;
            const o = t["preempt"];
            const a = t["reusable"];
            const c = t["persistent"];
            const l = t["suspend"];
            const u = r(t["o"]);
            const f = `id=${h} created=${e} queue=${n} preempt=${o} persistent=${c} reusable=${a} status=${u} suspend=${l}`;
            this.console.log(`${i}[T.${s}] ${f}`);
        }
    }
}

var n;

(function(i) {
    i[i["render"] = 0] = "render";
    i[i["macroTask"] = 1] = "macroTask";
    i[i["postRender"] = 2] = "postRender";
})(n || (n = {}));

const o = {
    delay: 0,
    preempt: false,
    persistent: false,
    reusable: true,
    suspend: false
};

let a;

let c;

function l(i, t) {
    a = i;
    c = t;
}

function u() {
    const i = new Promise(l);
    i.resolve = a;
    i.reject = c;
    return i;
}

export { Platform, Task, TaskAbortError, TaskQueue, n as TaskQueuePriority, e as TaskStatus };
//# sourceMappingURL=index.js.map
