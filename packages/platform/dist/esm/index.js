const i = new Map;

function s(i) {
    return function s() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${i}'.`);
    };
}

class Platform {
    constructor(i, t = {}) {
        var h, e, r, n, o, a, c, l, u, f, d, v, p;
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = i;
        this.decodeURI = "decodeURI" in t ? t.decodeURI : i.decodeURI;
        this.decodeURIComponent = "decodeURIComponent" in t ? t.decodeURIComponent : i.decodeURIComponent;
        this.encodeURI = "encodeURI" in t ? t.encodeURI : i.encodeURI;
        this.encodeURIComponent = "encodeURIComponent" in t ? t.encodeURIComponent : i.encodeURIComponent;
        this.Date = "Date" in t ? t.Date : i.Date;
        this.Reflect = "Reflect" in t ? t.Reflect : i.Reflect;
        this.clearInterval = "clearInterval" in t ? t.clearInterval : null !== (e = null === (h = i.clearInterval) || void 0 === h ? void 0 : h.bind(i)) && void 0 !== e ? e : s("clearInterval");
        this.clearTimeout = "clearTimeout" in t ? t.clearTimeout : null !== (n = null === (r = i.clearTimeout) || void 0 === r ? void 0 : r.bind(i)) && void 0 !== n ? n : s("clearTimeout");
        this.queueMicrotask = "queueMicrotask" in t ? t.queueMicrotask : null !== (a = null === (o = i.queueMicrotask) || void 0 === o ? void 0 : o.bind(i)) && void 0 !== a ? a : s("queueMicrotask");
        this.setInterval = "setInterval" in t ? t.setInterval : null !== (l = null === (c = i.setInterval) || void 0 === c ? void 0 : c.bind(i)) && void 0 !== l ? l : s("setInterval");
        this.setTimeout = "setTimeout" in t ? t.setTimeout : null !== (f = null === (u = i.setTimeout) || void 0 === u ? void 0 : u.bind(i)) && void 0 !== f ? f : s("setTimeout");
        this.console = "console" in t ? t.console : i.console;
        this.performanceNow = "performanceNow" in t ? t.performanceNow : null !== (p = null === (v = null === (d = i.performance) || void 0 === d ? void 0 : d.now) || void 0 === v ? void 0 : v.bind(i.performance)) && void 0 !== p ? p : s("performance.now");
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(s, t = {}) {
        let h = i.get(s);
        if (void 0 === h) i.set(s, h = new Platform(s, t));
        return h;
    }
    static set(s, t) {
        i.set(s, t);
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

function t(i) {
    return i.persistent;
}

class TaskQueue {
    constructor(i, s, t) {
        this.platform = i;
        this.$request = s;
        this.$cancel = t;
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
        return 0 === this.pendingAsyncCount && this.processing.every(t) && this.pending.every(t) && this.delayed.every(t);
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
                let s = -1;
                while (++s < this.delayed.length && this.delayed[s].queueTime <= i) ;
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
                while (++s < this.delayed.length && this.delayed[s].queueTime <= i) ;
                this.processing.push(...this.delayed.splice(0, s));
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
    queueTask(i, s) {
        if (this.tracer.enabled) this.tracer.enter(this, "queueTask");
        const {delay: t, preempt: h, persistent: e, reusable: r, suspend: n} = {
            ...o,
            ...s
        };
        if (h) {
            if (t > 0) throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
            if (e) throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
        }
        if (0 === this.processing.length) this.requestFlush();
        const a = this.platform.performanceNow();
        let c;
        if (r) {
            const s = this.taskPool;
            const o = this.taskPoolSize - 1;
            if (o >= 0) {
                c = s[o];
                s[o] = void 0;
                this.taskPoolSize = o;
                c.reuse(a, t, h, e, n, i);
            } else c = new Task(this.tracer, this, a, a + t, h, e, n, r, i);
        } else c = new Task(this.tracer, this, a, a + t, h, e, n, r, i);
        if (h) this.processing[this.processing.length] = c; else if (0 === t) this.pending[this.pending.length] = c; else this.delayed[this.delayed.length] = c;
        if (this.tracer.enabled) this.tracer.leave(this, "queueTask");
        return c;
    }
    remove(i) {
        if (this.tracer.enabled) this.tracer.enter(this, "remove");
        let s = this.processing.indexOf(i);
        if (s > -1) {
            this.processing.splice(s, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove processing");
            return;
        }
        s = this.pending.indexOf(i);
        if (s > -1) {
            this.pending.splice(s, 1);
            if (this.tracer.enabled) this.tracer.leave(this, "remove pending");
            return;
        }
        s = this.delayed.indexOf(i);
        if (s > -1) {
            this.delayed.splice(s, 1);
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
        var s;
        if (this.tracer.enabled) this.tracer.enter(this, "completeAsyncTask");
        if (true === i.suspend) {
            if (this.suspenderTask !== i) {
                if (this.tracer.enabled) this.tracer.leave(this, "completeAsyncTask error");
                throw new Error(`Async task completion mismatch: suspenderTask=${null === (s = this.suspenderTask) || void 0 === s ? void 0 : s.id}, task=${i.id}`);
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
    constructor(i, s, t, e, r, n, o, a, c) {
        this.tracer = i;
        this.taskQueue = s;
        this.createdTime = t;
        this.queueTime = e;
        this.preempt = r;
        this.persistent = n;
        this.suspend = o;
        this.reusable = a;
        this.callback = c;
        this.id = ++h;
        this.resolve = void 0;
        this.reject = void 0;
        this.i = void 0;
        this.t = 0;
    }
    get result() {
        const i = this.i;
        if (void 0 === i) switch (this.t) {
          case 0:
            {
                const i = this.i = u();
                this.resolve = i.resolve;
                this.reject = i.reject;
                return i;
            }

          case 1:
            throw new Error("Trying to await task from within task will cause a deadlock.");

          case 2:
            return this.i = Promise.resolve();

          case 3:
            return this.i = Promise.reject(new TaskAbortError(this));
        }
        return i;
    }
    get status() {
        return this.t;
    }
    run(i = this.taskQueue.platform.performanceNow()) {
        if (this.tracer.enabled) this.tracer.enter(this, "run");
        if (0 !== this.t) {
            if (this.tracer.enabled) this.tracer.leave(this, "run error");
            throw new Error(`Cannot run task in ${this.t} state`);
        }
        const {persistent: s, reusable: t, taskQueue: h, callback: e, resolve: r, reject: n, createdTime: o} = this;
        this.t = 1;
        try {
            const a = e(i - o);
            if (a instanceof Promise) a.then((i => {
                if (this.persistent) h["resetPersistentTask"](this); else {
                    if (s) this.t = 3; else this.t = 2;
                    this.dispose();
                }
                h["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async then");
                if (void 0 !== r) r(i);
                if (!this.persistent && t) h["returnToPool"](this);
            })).catch((i => {
                if (!this.persistent) this.dispose();
                h["completeAsyncTask"](this);
                if (this.tracer.enabled) this.tracer.leave(this, "run async catch");
                if (void 0 !== n) n(i); else throw i;
            })); else {
                if (this.persistent) h["resetPersistentTask"](this); else {
                    if (s) this.t = 3; else this.t = 2;
                    this.dispose();
                }
                if (this.tracer.enabled) this.tracer.leave(this, "run sync success");
                if (void 0 !== r) r(a);
                if (!this.persistent && t) h["returnToPool"](this);
            }
        } catch (i) {
            if (!this.persistent) this.dispose();
            if (this.tracer.enabled) this.tracer.leave(this, "run sync error");
            if (void 0 !== n) n(i); else throw i;
        }
    }
    cancel() {
        if (this.tracer.enabled) this.tracer.enter(this, "cancel");
        if (0 === this.t) {
            const i = this.taskQueue;
            const s = this.reusable;
            const t = this.reject;
            i.remove(this);
            if (i.isEmpty) i.cancel();
            this.t = 3;
            this.dispose();
            if (s) i["returnToPool"](this);
            if (void 0 !== t) t(new TaskAbortError(this));
            if (this.tracer.enabled) this.tracer.leave(this, "cancel true =pending");
            return true;
        } else if (1 === this.t && this.persistent) {
            this.persistent = false;
            if (this.tracer.enabled) this.tracer.leave(this, "cancel true =running+persistent");
            return true;
        }
        if (this.tracer.enabled) this.tracer.leave(this, "cancel false");
        return false;
    }
    reset(i) {
        if (this.tracer.enabled) this.tracer.enter(this, "reset");
        const s = this.queueTime - this.createdTime;
        this.createdTime = i;
        this.queueTime = i + s;
        this.t = 0;
        this.resolve = void 0;
        this.reject = void 0;
        this.i = void 0;
        if (this.tracer.enabled) this.tracer.leave(this, "reset");
    }
    reuse(i, s, t, h, e, r) {
        if (this.tracer.enabled) this.tracer.enter(this, "reuse");
        this.createdTime = i;
        this.queueTime = i + s;
        this.preempt = t;
        this.persistent = h;
        this.suspend = e;
        this.callback = r;
        this.t = 0;
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
    enter(i, s) {
        this.log(`${"  ".repeat(this.depth++)}> `, i, s);
    }
    leave(i, s) {
        this.log(`${"  ".repeat(--this.depth)}< `, i, s);
    }
    trace(i, s) {
        this.log(`${"  ".repeat(this.depth)}- `, i, s);
    }
    log(i, s, t) {
        if (s instanceof TaskQueue) {
            const h = s["processing"].length;
            const e = s["pending"].length;
            const r = s["delayed"].length;
            const n = s["flushRequested"];
            const o = !!s["suspenderTask"];
            const a = `processing=${h} pending=${e} delayed=${r} flushReq=${n} susTask=${o}`;
            this.console.log(`${i}[Q.${t}] ${a}`);
        } else {
            const h = s["id"];
            const e = Math.round(10 * s["createdTime"]) / 10;
            const n = Math.round(10 * s["queueTime"]) / 10;
            const o = s["preempt"];
            const a = s["reusable"];
            const c = s["persistent"];
            const l = s["suspend"];
            const u = r(s["t"]);
            const f = `id=${h} created=${e} queue=${n} preempt=${o} persistent=${c} reusable=${a} status=${u} suspend=${l}`;
            this.console.log(`${i}[T.${t}] ${f}`);
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

function l(i, s) {
    a = i;
    c = s;
}

function u() {
    const i = new Promise(l);
    i.resolve = a;
    i.reject = c;
    return i;
}

export { Platform, Task, TaskAbortError, TaskQueue, n as TaskQueuePriority, e as TaskStatus };
//# sourceMappingURL=index.js.map
