import { DI as t, isArray as e, isFunction as r, isSet as s, isMap as n, areEqual as i, Registration as o, resolve as c, IPlatform as u, isObject as a, isArrayIndex as h, createLookup as l, emptyObject as f } from "../../../kernel/dist/native-modules/index.mjs";

import { Metadata as p } from "../../../metadata/dist/native-modules/index.mjs";

const d = Object.prototype.hasOwnProperty;

const b = Reflect.defineProperty;

function rtDefineHiddenProp(t, e, r) {
    b(t, e, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: r
    });
    return r;
}

function ensureProto(t, e, r) {
    if (!(e in t)) {
        rtDefineHiddenProp(t, e, r);
    }
}

const w = Object.assign;

const v = Object.freeze;

const g = String;

const y = t.createInterface;

const C = p.get;

const O = p.define;

const A = /*@__PURE__*/ t.createInterface("ICoercionConfiguration");

const m = 0;

const S = 1;

const R = 2;

const P = 4;

const I = /*@__PURE__*/ v({
    None: m,
    Observer: S,
    Node: R,
    Layout: P
});

function copyIndexMap(t, e, r) {
    const {length: s} = t;
    const n = Array(s);
    let i = 0;
    while (i < s) {
        n[i] = t[i];
        ++i;
    }
    if (e !== void 0) {
        n.deletedIndices = e.slice(0);
    } else if (t.deletedIndices !== void 0) {
        n.deletedIndices = t.deletedIndices.slice(0);
    } else {
        n.deletedIndices = [];
    }
    if (r !== void 0) {
        n.deletedItems = r.slice(0);
    } else if (t.deletedItems !== void 0) {
        n.deletedItems = t.deletedItems.slice(0);
    } else {
        n.deletedItems = [];
    }
    n.isIndexMap = true;
    return n;
}

function createIndexMap(t = 0) {
    const e = Array(t);
    let r = 0;
    while (r < t) {
        e[r] = r++;
    }
    e.deletedIndices = [];
    e.deletedItems = [];
    e.isIndexMap = true;
    return e;
}

function cloneIndexMap(t) {
    const e = t.slice();
    e.deletedIndices = t.deletedIndices.slice();
    e.deletedItems = t.deletedItems.slice();
    e.isIndexMap = true;
    return e;
}

function isIndexMap(t) {
    return e(t) && t.isIndexMap === true;
}

let _ = new Map;

let x = false;

function batch(t) {
    const e = _;
    const r = _ = new Map;
    x = true;
    try {
        t();
    } finally {
        _ = null;
        x = false;
        try {
            let t;
            let s;
            let n;
            let i;
            let o;
            let c = false;
            let u;
            let a;
            for (t of r) {
                s = t[0];
                n = t[1];
                if (e?.has(s)) {
                    e.set(s, n);
                }
                if (n[0] === 1) {
                    s.notify(n[1], n[2]);
                } else {
                    i = n[1];
                    o = n[2];
                    c = false;
                    if (o.deletedIndices.length > 0) {
                        c = true;
                    } else {
                        for (u = 0, a = o.length; u < a; ++u) {
                            if (o[u] !== u) {
                                c = true;
                                break;
                            }
                        }
                    }
                    if (c) {
                        s.notifyCollection(i, o);
                    }
                }
            }
        } finally {
            _ = e;
        }
    }
}

function addCollectionBatch(t, e, r) {
    if (!_.has(t)) {
        _.set(t, [ 2, e, r ]);
    } else {
        _.get(t)[2] = r;
    }
}

function addValueBatch(t, e, r) {
    const s = _.get(t);
    if (s === void 0) {
        _.set(t, [ 1, e, r ]);
    } else {
        s[1] = e;
        s[2] = r;
    }
}

const k = /*@__PURE__*/ (() => {
    function subscriberCollection(t, e) {
        return t == null ? subscriberCollectionDeco : subscriberCollectionDeco(t);
    }
    function getSubscriberRecord() {
        return rtDefineHiddenProp(this, "subs", new SubscriberRecord);
    }
    function addSubscriber(t) {
        return this.subs.add(t);
    }
    function removeSubscriber(t) {
        return this.subs.remove(t);
    }
    const t = new WeakSet;
    function subscriberCollectionDeco(e, r) {
        if (!t.has(e)) {
            t.add(e);
            const r = e.prototype;
            b(r, "subs", {
                get: getSubscriberRecord
            });
            ensureProto(r, "subscribe", addSubscriber);
            ensureProto(r, "unsubscribe", removeSubscriber);
        }
        return e;
    }
    class SubscriberRecord {
        constructor() {
            this.count = 0;
            this.t = [];
        }
        add(t) {
            if (this.t.includes(t)) {
                return false;
            }
            this.t[this.t.length] = t;
            ++this.count;
            return true;
        }
        remove(t) {
            const e = this.t.indexOf(t);
            if (e !== -1) {
                this.t.splice(e, 1);
                --this.count;
                return true;
            }
            return false;
        }
        notify(t, e) {
            if (x) {
                addValueBatch(this, t, e);
                return;
            }
            const r = this.t.slice(0);
            const s = r.length;
            let n = 0;
            for (;n < s; ++n) {
                r[n].handleChange(t, e);
            }
            return;
        }
        notifyCollection(t, e) {
            const r = this.t.slice(0);
            const s = r.length;
            let n = 0;
            for (;n < s; ++n) {
                r[n].handleCollectionChange(t, e);
            }
            return;
        }
    }
    return subscriberCollection;
})();

const createMappedError = (t, ...e) => new Error(`AUR${g(t).padStart(4, "0")}:${e.map(g)}`);

class CollectionLengthObserver {
    constructor(t) {
        this.owner = t;
        this.type = S;
        this.v = (this.o = t.collection).length;
    }
    getValue() {
        return this.o.length;
    }
    setValue(t) {
        if (t !== this.v) {
            if (!Number.isNaN(t)) {
                this.o.splice(t);
                this.v = this.o.length;
            }
        }
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.o.length;
        if ((this.v = s) !== r) {
            this.subs.notify(this.v, r);
        }
    }
}

(() => {
    implementLengthObserver(CollectionLengthObserver);
})();

class CollectionSizeObserver {
    constructor(t) {
        this.owner = t;
        this.type = S;
        this.v = (this.o = t.collection).size;
    }
    getValue() {
        return this.o.size;
    }
    setValue() {
        throw createMappedError(220);
    }
    handleCollectionChange(t, e) {
        const r = this.v;
        const s = this.o.size;
        if ((this.v = s) !== r) {
            this.subs.notify(this.v, r);
        }
    }
}

(() => {
    implementLengthObserver(CollectionSizeObserver);
})();

function implementLengthObserver(t) {
    const e = t.prototype;
    ensureProto(e, "subscribe", subscribe);
    ensureProto(e, "unsubscribe", unsubscribe);
    return k(t, null);
}

function subscribe(t) {
    if (this.subs.add(t) && this.subs.count === 1) {
        this.owner.subscribe(this);
    }
}

function unsubscribe(t) {
    if (this.subs.remove(t) && this.subs.count === 0) {
        this.owner.subscribe(this);
    }
}

const M = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_arr_obs__");
    const e = Array[t] ?? rtDefineHiddenProp(Array, t, new WeakMap);
    function sortCompare(t, e) {
        if (t === e) {
            return 0;
        }
        t = t === null ? "null" : t.toString();
        e = e === null ? "null" : e.toString();
        return t < e ? -1 : 1;
    }
    function preSortCompare(t, e) {
        if (t === void 0) {
            if (e === void 0) {
                return 0;
            } else {
                return 1;
            }
        }
        if (e === void 0) {
            return -1;
        }
        return 0;
    }
    function insertionSort(t, e, r, s, n) {
        let i, o, c, u, a;
        let h, l;
        for (h = r + 1; h < s; h++) {
            i = t[h];
            o = e[h];
            for (l = h - 1; l >= r; l--) {
                c = t[l];
                u = e[l];
                a = n(c, i);
                if (a > 0) {
                    t[l + 1] = c;
                    e[l + 1] = u;
                } else {
                    break;
                }
            }
            t[l + 1] = i;
            e[l + 1] = o;
        }
    }
    function quickSort(t, e, r, s, n) {
        let i = 0, o = 0;
        let c, u, a;
        let h, l, f;
        let p, d, b;
        let w, v;
        let g, y, C, O;
        let A, m, S, R;
        while (true) {
            if (s - r <= 10) {
                insertionSort(t, e, r, s, n);
                return;
            }
            i = r + (s - r >> 1);
            c = t[r];
            h = e[r];
            u = t[s - 1];
            l = e[s - 1];
            a = t[i];
            f = e[i];
            p = n(c, u);
            if (p > 0) {
                w = c;
                v = h;
                c = u;
                h = l;
                u = w;
                l = v;
            }
            d = n(c, a);
            if (d >= 0) {
                w = c;
                v = h;
                c = a;
                h = f;
                a = u;
                f = l;
                u = w;
                l = v;
            } else {
                b = n(u, a);
                if (b > 0) {
                    w = u;
                    v = l;
                    u = a;
                    l = f;
                    a = w;
                    f = v;
                }
            }
            t[r] = c;
            e[r] = h;
            t[s - 1] = a;
            e[s - 1] = f;
            g = u;
            y = l;
            C = r + 1;
            O = s - 1;
            t[i] = t[C];
            e[i] = e[C];
            t[C] = g;
            e[C] = y;
            t: for (o = C + 1; o < O; o++) {
                A = t[o];
                m = e[o];
                S = n(A, g);
                if (S < 0) {
                    t[o] = t[C];
                    e[o] = e[C];
                    t[C] = A;
                    e[C] = m;
                    C++;
                } else if (S > 0) {
                    do {
                        O--;
                        if (O == o) {
                            break t;
                        }
                        R = t[O];
                        S = n(R, g);
                    } while (S > 0);
                    t[o] = t[O];
                    e[o] = e[O];
                    t[O] = A;
                    e[O] = m;
                    if (S < 0) {
                        A = t[o];
                        m = e[o];
                        t[o] = t[C];
                        e[o] = e[C];
                        t[C] = A;
                        e[C] = m;
                        C++;
                    }
                }
            }
            if (s - O < C - r) {
                quickSort(t, e, O, s, n);
                s = C;
            } else {
                quickSort(t, e, r, C, n);
                r = O;
            }
        }
    }
    const s = Array.prototype;
    const n = [ "push", "unshift", "pop", "shift", "splice", "reverse", "sort" ];
    let i;
    function overrideArrayPrototypes() {
        const t = s.push;
        const o = s.unshift;
        const c = s.pop;
        const u = s.shift;
        const a = s.splice;
        const h = s.reverse;
        const l = s.sort;
        i = {
            push: function(...r) {
                const s = e.get(this);
                if (s === void 0) {
                    return t.apply(this, r);
                }
                const n = this.length;
                const i = r.length;
                if (i === 0) {
                    return n;
                }
                this.length = s.indexMap.length = n + i;
                let o = n;
                while (o < this.length) {
                    this[o] = r[o - n];
                    s.indexMap[o] = -2;
                    o++;
                }
                s.notify();
                return this.length;
            },
            unshift: function(...t) {
                const r = e.get(this);
                if (r === void 0) {
                    return o.apply(this, t);
                }
                const s = t.length;
                const n = new Array(s);
                let i = 0;
                while (i < s) {
                    n[i++] = -2;
                }
                o.apply(r.indexMap, n);
                const c = o.apply(this, t);
                r.notify();
                return c;
            },
            pop: function() {
                const t = e.get(this);
                if (t === void 0) {
                    return c.call(this);
                }
                const r = t.indexMap;
                const s = c.call(this);
                const n = r.length - 1;
                if (r[n] > -1) {
                    r.deletedIndices.push(r[n]);
                    r.deletedItems.push(s);
                }
                c.call(r);
                t.notify();
                return s;
            },
            shift: function() {
                const t = e.get(this);
                if (t === void 0) {
                    return u.call(this);
                }
                const r = t.indexMap;
                const s = u.call(this);
                if (r[0] > -1) {
                    r.deletedIndices.push(r[0]);
                    r.deletedItems.push(s);
                }
                u.call(r);
                t.notify();
                return s;
            },
            splice: function(...t) {
                const r = t[0];
                const s = t[1];
                const n = e.get(this);
                if (n === void 0) {
                    return a.apply(this, t);
                }
                const i = this.length;
                const o = r | 0;
                const c = o < 0 ? Math.max(i + o, 0) : Math.min(o, i);
                const u = n.indexMap;
                const h = t.length;
                const l = h === 0 ? 0 : h === 1 ? i - c : s;
                let f = c;
                if (l > 0) {
                    const t = f + l;
                    while (f < t) {
                        if (u[f] > -1) {
                            u.deletedIndices.push(u[f]);
                            u.deletedItems.push(this[f]);
                        }
                        f++;
                    }
                }
                f = 0;
                if (h > 2) {
                    const t = h - 2;
                    const e = new Array(t);
                    while (f < t) {
                        e[f++] = -2;
                    }
                    a.call(u, r, s, ...e);
                } else {
                    a.apply(u, t);
                }
                const p = a.apply(this, t);
                if (l > 0 || f > 0) {
                    n.notify();
                }
                return p;
            },
            reverse: function() {
                const t = e.get(this);
                if (t === void 0) {
                    h.call(this);
                    return this;
                }
                const r = this.length;
                const s = r / 2 | 0;
                let n = 0;
                while (n !== s) {
                    const e = r - n - 1;
                    const s = this[n];
                    const i = t.indexMap[n];
                    const o = this[e];
                    const c = t.indexMap[e];
                    this[n] = o;
                    t.indexMap[n] = c;
                    this[e] = s;
                    t.indexMap[e] = i;
                    n++;
                }
                t.notify();
                return this;
            },
            sort: function(t) {
                const s = e.get(this);
                if (s === void 0) {
                    l.call(this, t);
                    return this;
                }
                let n = this.length;
                if (n < 2) {
                    return this;
                }
                quickSort(this, s.indexMap, 0, n, preSortCompare);
                let i = 0;
                while (i < n) {
                    if (this[i] === void 0) {
                        break;
                    }
                    i++;
                }
                if (t === void 0 || !r(t)) {
                    t = sortCompare;
                }
                quickSort(this, s.indexMap, 0, i, t);
                let o = false;
                for (i = 0, n = s.indexMap.length; n > i; ++i) {
                    if (s.indexMap[i] !== i) {
                        o = true;
                        break;
                    }
                }
                if (o || x) {
                    s.notify();
                }
                return this;
            }
        };
        for (const t of n) {
            b(i[t], "observing", {
                value: true,
                writable: false,
                configurable: false,
                enumerable: false
            });
        }
    }
    let o = false;
    const c = "__au_arr_on__";
    function enableArrayObservation() {
        if (i === undefined) {
            overrideArrayPrototypes();
        }
        if (!(C(c, Array) ?? false)) {
            O(true, Array, c);
            for (const t of n) {
                if (s[t].observing !== true) {
                    rtDefineHiddenProp(s, t, i[t]);
                }
            }
        }
    }
    class ArrayObserverImpl {
        constructor(t) {
            this.type = S;
            if (!o) {
                o = true;
                enableArrayObservation();
            }
            this.indexObservers = {};
            this.collection = t;
            this.indexMap = createIndexMap(t.length);
            this.lenObs = void 0;
            e.set(t, this);
        }
        notify() {
            const t = this.subs;
            const e = this.indexMap;
            if (x) {
                addCollectionBatch(t, this.collection, e);
                return;
            }
            const r = this.collection;
            const s = r.length;
            this.indexMap = createIndexMap(s);
            this.subs.notifyCollection(r, e);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionLengthObserver(this);
        }
        getIndexObserver(t) {
            return this.indexObservers[t] ??= new ArrayIndexObserverImpl(this, t);
        }
    }
    (() => {
        k(ArrayObserverImpl, null);
    })();
    class ArrayIndexObserverImpl {
        constructor(t, e) {
            this.owner = t;
            this.index = e;
            this.doNotCache = true;
            this.value = this.getValue();
        }
        getValue() {
            return this.owner.collection[this.index];
        }
        setValue(t) {
            if (t === this.getValue()) {
                return;
            }
            const e = this.owner;
            const r = this.index;
            const s = e.indexMap;
            if (s[r] > -1) {
                s.deletedIndices.push(s[r]);
            }
            s[r] = -2;
            e.collection[r] = t;
            e.notify();
        }
        handleCollectionChange(t, e) {
            const r = this.index;
            const s = e[r] === r;
            if (s) {
                return;
            }
            const n = this.value;
            const i = this.value = this.getValue();
            if (n !== i) {
                this.subs.notify(i, n);
            }
        }
        subscribe(t) {
            if (this.subs.add(t) && this.subs.count === 1) {
                this.owner.subscribe(this);
            }
        }
        unsubscribe(t) {
            if (this.subs.remove(t) && this.subs.count === 0) {
                this.owner.unsubscribe(this);
            }
        }
    }
    (() => {
        k(ArrayIndexObserverImpl, null);
    })();
    return function getArrayObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new ArrayObserverImpl(t));
            enableArrayObservation();
        }
        return r;
    };
})();

const D = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_set_obs__");
    const e = Set[t] ?? rtDefineHiddenProp(Set, t, new WeakMap);
    const {add: r, clear: s, delete: n} = Set.prototype;
    const i = [ "add", "clear", "delete" ];
    const o = {
        add: function(t) {
            const s = e.get(this);
            if (s === undefined) {
                r.call(this, t);
                return this;
            }
            const n = this.size;
            r.call(this, t);
            const i = this.size;
            if (i === n) {
                return this;
            }
            s.indexMap[n] = -2;
            s.notify();
            return this;
        },
        clear: function() {
            const t = e.get(this);
            if (t === undefined) {
                return s.call(this);
            }
            const r = this.size;
            if (r > 0) {
                const e = t.indexMap;
                let r = 0;
                for (const t of this.keys()) {
                    if (e[r] > -1) {
                        e.deletedIndices.push(e[r]);
                        e.deletedItems.push(t);
                    }
                    r++;
                }
                s.call(this);
                e.length = 0;
                t.notify();
            }
            return undefined;
        },
        delete: function(t) {
            const r = e.get(this);
            if (r === undefined) {
                return n.call(this, t);
            }
            const s = this.size;
            if (s === 0) {
                return false;
            }
            let i = 0;
            const o = r.indexMap;
            for (const e of this.keys()) {
                if (e === t) {
                    if (o[i] > -1) {
                        o.deletedIndices.push(o[i]);
                        o.deletedItems.push(e);
                    }
                    o.splice(i, 1);
                    const s = n.call(this, t);
                    if (s === true) {
                        r.notify();
                    }
                    return s;
                }
                i++;
            }
            return false;
        }
    };
    function enableSetObservation(t) {
        for (const e of i) {
            rtDefineHiddenProp(t, e, o[e]);
        }
    }
    class SetObserverImpl {
        constructor(t) {
            this.type = S;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            const e = this.indexMap;
            if (x) {
                addCollectionBatch(t, this.collection, e);
                return;
            }
            const r = this.collection;
            const s = r.size;
            this.indexMap = createIndexMap(s);
            this.subs.notifyCollection(r, e);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionSizeObserver(this);
        }
    }
    k(SetObserverImpl, null);
    return function getSetObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new SetObserverImpl(t));
            enableSetObservation(t);
        }
        return r;
    };
})();

const L = /*@__PURE__*/ (() => {
    const t = Symbol.for("__au_map_obs__");
    const e = Map[t] ?? rtDefineHiddenProp(Map, t, new WeakMap);
    const {set: r, clear: s, delete: n} = Map.prototype;
    const i = [ "set", "clear", "delete" ];
    const o = {
        set: function(t, s) {
            const n = e.get(this);
            if (n === undefined) {
                r.call(this, t, s);
                return this;
            }
            const i = this.get(t);
            const o = this.size;
            r.call(this, t, s);
            const c = this.size;
            if (c === o) {
                let e = 0;
                for (const r of this.entries()) {
                    if (r[0] === t) {
                        if (r[1] !== i) {
                            n.indexMap.deletedIndices.push(n.indexMap[e]);
                            n.indexMap.deletedItems.push(r);
                            n.indexMap[e] = -2;
                            n.notify();
                        }
                        return this;
                    }
                    e++;
                }
                return this;
            }
            n.indexMap[o] = -2;
            n.notify();
            return this;
        },
        clear: function() {
            const t = e.get(this);
            if (t === undefined) {
                return s.call(this);
            }
            const r = this.size;
            if (r > 0) {
                const e = t.indexMap;
                let r = 0;
                for (const t of this.keys()) {
                    if (e[r] > -1) {
                        e.deletedIndices.push(e[r]);
                        e.deletedItems.push(t);
                    }
                    r++;
                }
                s.call(this);
                e.length = 0;
                t.notify();
            }
            return undefined;
        },
        delete: function(t) {
            const r = e.get(this);
            if (r === undefined) {
                return n.call(this, t);
            }
            const s = this.size;
            if (s === 0) {
                return false;
            }
            let i = 0;
            const o = r.indexMap;
            for (const e of this.keys()) {
                if (e === t) {
                    if (o[i] > -1) {
                        o.deletedIndices.push(o[i]);
                        o.deletedItems.push(e);
                    }
                    o.splice(i, 1);
                    const s = n.call(this, t);
                    if (s === true) {
                        r.notify();
                    }
                    return s;
                }
                ++i;
            }
            return false;
        }
    };
    function enableMapObservation(t) {
        for (const e of i) {
            rtDefineHiddenProp(t, e, o[e]);
        }
    }
    class MapObserverImpl {
        constructor(t) {
            this.type = S;
            this.collection = t;
            this.indexMap = createIndexMap(t.size);
            this.lenObs = void 0;
        }
        notify() {
            const t = this.subs;
            const e = this.indexMap;
            if (x) {
                addCollectionBatch(t, this.collection, e);
                return;
            }
            const r = this.collection;
            const s = r.size;
            this.indexMap = createIndexMap(s);
            t.notifyCollection(r, e);
        }
        getLengthObserver() {
            return this.lenObs ??= new CollectionSizeObserver(this);
        }
    }
    k(MapObserverImpl, null);
    return function getMapObserver(t) {
        let r = e.get(t);
        if (r === void 0) {
            e.set(t, r = new MapObserverImpl(t));
            enableMapObservation(t);
        }
        return r;
    };
})();

const V = /*@__PURE__*/ (() => {
    class BindingObserverRecord {
        constructor(t) {
            this.version = 0;
            this.count = 0;
            this.o = new Map;
            this.b = t;
        }
        add(t) {
            if (!this.o.has(t)) {
                t.subscribe(this.b);
                ++this.count;
            }
            this.o.set(t, this.version);
        }
        clear() {
            this.o.forEach(unsubscribeStale, this);
            this.count = this.o.size;
        }
        clearAll() {
            this.o.forEach(unsubscribeAll, this);
            this.o.clear();
            this.count = 0;
        }
    }
    function unsubscribeAll(t, e) {
        e.unsubscribe(this.b);
    }
    function unsubscribeStale(t, e) {
        if (this.version !== t) {
            e.unsubscribe(this.b);
            this.o.delete(e);
        }
    }
    function getObserverRecord() {
        return rtDefineHiddenProp(this, "obs", new BindingObserverRecord(this));
    }
    function observe(t, e) {
        this.obs.add(this.oL.getObserver(t, e));
    }
    function observeCollection(t) {
        let r;
        if (e(t)) {
            r = M(t);
        } else if (s(t)) {
            r = D(t);
        } else if (n(t)) {
            r = L(t);
        } else {
            throw createMappedError(210, t);
        }
        this.obs.add(r);
    }
    function subscribeTo(t) {
        this.obs.add(t);
    }
    function noopHandleChange() {
        throw createMappedError(99, "handleChange");
    }
    function noopHandleCollectionChange() {
        throw createMappedError(99, "handleCollectionChange");
    }
    return function connectableDecorator(t, e) {
        const r = t.prototype;
        ensureProto(r, "observe", observe);
        ensureProto(r, "observeCollection", observeCollection);
        ensureProto(r, "subscribeTo", subscribeTo);
        b(r, "obs", {
            get: getObserverRecord
        });
        ensureProto(r, "handleChange", noopHandleChange);
        ensureProto(r, "handleCollectionChange", noopHandleCollectionChange);
        return t;
    };
})();

function connectable(t, e) {
    return t == null ? V : V(t, e);
}

let N = null;

const H = [];

let F = false;

function pauseConnecting() {
    F = false;
}

function resumeConnecting() {
    F = true;
}

function currentConnectable() {
    return N;
}

function enterConnectable(t) {
    if (t == null) {
        throw createMappedError(206);
    }
    if (N == null) {
        N = t;
        H[0] = N;
        F = true;
        return;
    }
    if (N === t) {
        throw createMappedError(207);
    }
    H.push(t);
    N = t;
    F = true;
}

function exitConnectable(t) {
    if (t == null) {
        throw createMappedError(208);
    }
    if (N !== t) {
        throw createMappedError(209);
    }
    H.pop();
    N = H.length > 0 ? H[H.length - 1] : null;
    F = N != null;
}

const j = /*@__PURE__*/ v({
    get current() {
        return N;
    },
    get connecting() {
        return F;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting
});

const E = Reflect.get;

const z = Object.prototype.toString;

const $ = new WeakMap;

const B = "__au_nw__";

const W = "__au_nw";

function canWrap(t) {
    switch (z.call(t)) {
      case "[object Object]":
        return t.constructor[B] !== true;

      case "[object Array]":
      case "[object Map]":
      case "[object Set]":
        return true;

      default:
        return false;
    }
}

const q = "__raw__";

function wrap(t) {
    return canWrap(t) ? getProxy(t) : t;
}

function getProxy(t) {
    return $.get(t) ?? createProxy(t);
}

function getRaw(t) {
    return t[q] ?? t;
}

function unwrap(t) {
    return canWrap(t) && t[q] || t;
}

function doNotCollect(t, e) {
    return e === "constructor" || e === "__proto__" || e === "$observers" || e === Symbol.toPrimitive || e === Symbol.toStringTag || t.constructor[`${W}_${g(e)}__`] === true;
}

function createProxy(t) {
    const r = e(t) ? T : n(t) || s(t) ? U : K;
    const i = new Proxy(t, r);
    $.set(t, i);
    $.set(i, i);
    return i;
}

const K = {
    get(t, e, r) {
        if (e === q) {
            return t;
        }
        const s = currentConnectable();
        if (!F || doNotCollect(t, e) || s == null) {
            return E(t, e, r);
        }
        s.observe(t, e);
        return wrap(E(t, e, r));
    }
};

const T = {
    get(t, e, r) {
        if (e === q) {
            return t;
        }
        if (!F || doNotCollect(t, e) || N == null) {
            return E(t, e, r);
        }
        switch (e) {
          case "length":
            N.observe(t, "length");
            return t.length;

          case "map":
            return wrappedArrayMap;

          case "includes":
            return wrappedArrayIncludes;

          case "indexOf":
            return wrappedArrayIndexOf;

          case "lastIndexOf":
            return wrappedArrayLastIndexOf;

          case "every":
            return wrappedArrayEvery;

          case "filter":
            return wrappedArrayFilter;

          case "find":
            return wrappedArrayFind;

          case "findIndex":
            return wrappedArrayFindIndex;

          case "flat":
            return wrappedArrayFlat;

          case "flatMap":
            return wrappedArrayFlatMap;

          case "join":
            return wrappedArrayJoin;

          case "push":
            return wrappedArrayPush;

          case "pop":
            return wrappedArrayPop;

          case "reduce":
            return wrappedReduce;

          case "reduceRight":
            return wrappedReduceRight;

          case "reverse":
            return wrappedArrayReverse;

          case "shift":
            return wrappedArrayShift;

          case "unshift":
            return wrappedArrayUnshift;

          case "slice":
            return wrappedArraySlice;

          case "splice":
            return wrappedArraySplice;

          case "some":
            return wrappedArraySome;

          case "sort":
            return wrappedArraySort;

          case "keys":
            return wrappedKeys;

          case "values":
          case Symbol.iterator:
            return wrappedValues;

          case "entries":
            return wrappedEntries;
        }
        N.observe(t, e);
        return wrap(E(t, e, r));
    },
    ownKeys(t) {
        currentConnectable()?.observe(t, "length");
        return Reflect.ownKeys(t);
    }
};

function wrappedArrayMap(t, e) {
    const r = getRaw(this);
    const s = r.map(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(N, r);
    return wrap(s);
}

function wrappedArrayEvery(t, e) {
    const r = getRaw(this);
    const s = r.every(((r, s) => t.call(e, wrap(r), s, this)));
    observeCollection(N, r);
    return s;
}

function wrappedArrayFilter(t, e) {
    const r = getRaw(this);
    const s = r.filter(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(N, r);
    return wrap(s);
}

function wrappedArrayIncludes(t) {
    const e = getRaw(this);
    const r = e.includes(unwrap(t));
    observeCollection(N, e);
    return r;
}

function wrappedArrayIndexOf(t) {
    const e = getRaw(this);
    const r = e.indexOf(unwrap(t));
    observeCollection(N, e);
    return r;
}

function wrappedArrayLastIndexOf(t) {
    const e = getRaw(this);
    const r = e.lastIndexOf(unwrap(t));
    observeCollection(N, e);
    return r;
}

function wrappedArrayFindIndex(t, e) {
    const r = getRaw(this);
    const s = r.findIndex(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(N, r);
    return s;
}

function wrappedArrayFind(t, e) {
    const r = getRaw(this);
    const s = r.find(((e, r) => t(wrap(e), r, this)), e);
    observeCollection(N, r);
    return wrap(s);
}

function wrappedArrayFlat() {
    const t = getRaw(this);
    observeCollection(N, t);
    return wrap(t.flat());
}

function wrappedArrayFlatMap(t, e) {
    const r = getRaw(this);
    observeCollection(N, r);
    return getProxy(r.flatMap(((r, s) => wrap(t.call(e, wrap(r), s, this)))));
}

function wrappedArrayJoin(t) {
    const e = getRaw(this);
    observeCollection(N, e);
    return e.join(t);
}

function wrappedArrayPop() {
    return wrap(getRaw(this).pop());
}

function wrappedArrayPush(...t) {
    return getRaw(this).push(...t);
}

function wrappedArrayShift() {
    return wrap(getRaw(this).shift());
}

function wrappedArrayUnshift(...t) {
    return getRaw(this).unshift(...t);
}

function wrappedArraySplice(...t) {
    return wrap(getRaw(this).splice(...t));
}

function wrappedArrayReverse(...t) {
    const e = getRaw(this);
    const r = e.reverse();
    observeCollection(N, e);
    return wrap(r);
}

function wrappedArraySome(t, e) {
    const r = getRaw(this);
    const s = r.some(((r, s) => unwrap(t.call(e, wrap(r), s, this))));
    observeCollection(N, r);
    return s;
}

function wrappedArraySort(t) {
    const e = getRaw(this);
    const r = e.sort(t);
    observeCollection(N, e);
    return wrap(r);
}

function wrappedArraySlice(t, e) {
    const r = getRaw(this);
    observeCollection(N, r);
    return getProxy(r.slice(t, e));
}

function wrappedReduce(t, e) {
    const r = getRaw(this);
    const s = r.reduce(((e, r, s) => t(e, wrap(r), s, this)), e);
    observeCollection(N, r);
    return wrap(s);
}

function wrappedReduceRight(t, e) {
    const r = getRaw(this);
    const s = r.reduceRight(((e, r, s) => t(e, wrap(r), s, this)), e);
    observeCollection(N, r);
    return wrap(s);
}

const U = {
    get(t, e, r) {
        if (e === q) {
            return t;
        }
        const i = currentConnectable();
        if (!F || doNotCollect(t, e) || i == null) {
            return E(t, e, r);
        }
        switch (e) {
          case "size":
            i.observe(t, "size");
            return t.size;

          case "clear":
            return wrappedClear;

          case "delete":
            return wrappedDelete;

          case "forEach":
            return wrappedForEach;

          case "add":
            if (s(t)) {
                return wrappedAdd;
            }
            break;

          case "get":
            if (n(t)) {
                return wrappedGet;
            }
            break;

          case "set":
            if (n(t)) {
                return wrappedSet;
            }
            break;

          case "has":
            return wrappedHas;

          case "keys":
            return wrappedKeys;

          case "values":
            return wrappedValues;

          case "entries":
            return wrappedEntries;

          case Symbol.iterator:
            return n(t) ? wrappedEntries : wrappedValues;
        }
        return wrap(E(t, e, r));
    }
};

function wrappedForEach(t, e) {
    const r = getRaw(this);
    observeCollection(N, r);
    return r.forEach(((r, s) => {
        t.call(e, wrap(r), wrap(s), this);
    }));
}

function wrappedHas(t) {
    const e = getRaw(this);
    observeCollection(N, e);
    return e.has(unwrap(t));
}

function wrappedGet(t) {
    const e = getRaw(this);
    observeCollection(N, e);
    return wrap(e.get(unwrap(t)));
}

function wrappedSet(t, e) {
    return wrap(getRaw(this).set(unwrap(t), unwrap(e)));
}

function wrappedAdd(t) {
    return wrap(getRaw(this).add(unwrap(t)));
}

function wrappedClear() {
    return wrap(getRaw(this).clear());
}

function wrappedDelete(t) {
    return wrap(getRaw(this).delete(unwrap(t)));
}

function wrappedKeys() {
    const t = getRaw(this);
    observeCollection(N, t);
    const e = t.keys();
    return {
        next() {
            const t = e.next();
            const r = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: wrap(r),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function wrappedValues() {
    const t = getRaw(this);
    observeCollection(N, t);
    const e = t.values();
    return {
        next() {
            const t = e.next();
            const r = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: wrap(r),
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

function wrappedEntries() {
    const t = getRaw(this);
    observeCollection(N, t);
    const e = t.entries();
    return {
        next() {
            const t = e.next();
            const r = t.value;
            const s = t.done;
            return s ? {
                value: void 0,
                done: s
            } : {
                value: [ wrap(r[0]), wrap(r[1]) ],
                done: s
            };
        },
        [Symbol.iterator]() {
            return this;
        }
    };
}

const observeCollection = (t, e) => t?.observeCollection(e);

const G = /*@__PURE__*/ v({
    getProxy: getProxy,
    getRaw: getRaw,
    wrap: wrap,
    unwrap: unwrap,
    rawKey: q
});

class ComputedObserver {
    constructor(t, e, r, s, n) {
        this.type = S;
        this.v = void 0;
        this.ir = false;
        this.D = false;
        this.cb = void 0;
        this.i = void 0;
        this.u = void 0;
        this.o = t;
        this.h = n ? wrap(t) : t;
        this.$get = e;
        this.$set = r;
        this.oL = s;
    }
    init(t) {
        this.v = t;
        this.D = false;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.$get.call(this.o, this.o, this);
        }
        if (this.D) {
            this.compute();
            this.D = false;
        }
        return this.v;
    }
    setValue(t) {
        if (r(this.$set)) {
            if (this.i !== void 0) {
                t = this.i.call(null, t, this.u);
            }
            if (!i(t, this.v)) {
                this.ir = true;
                this.$set.call(this.o, t);
                this.ir = false;
                this.run();
            }
        } else {
            throw createMappedError(221);
        }
    }
    useCoercer(t, e) {
        this.i = t;
        this.u = e;
        return true;
    }
    useCallback(t) {
        this.cb = t;
        return true;
    }
    handleChange() {
        this.D = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this.D = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    subscribe(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            this.compute();
            this.D = false;
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.D = true;
            this.obs.clearAll();
        }
    }
    run() {
        if (this.ir) {
            return;
        }
        const t = this.v;
        const e = this.compute();
        this.D = false;
        if (!i(e, t)) {
            this.cb?.(e, t);
            this.subs.notify(this.v, t);
        }
    }
    compute() {
        this.ir = true;
        this.obs.version++;
        try {
            enterConnectable(this);
            return this.v = unwrap(this.$get.call(this.h, this.h, this));
        } finally {
            this.obs.clear();
            this.ir = false;
            exitConnectable(this);
        }
    }
}

(() => {
    connectable(ComputedObserver, null);
    k(ComputedObserver, null);
})();

const J = /*@__PURE__*/ y("IDirtyChecker", void 0);

const Q = {
    timeoutsPerCheck: 25,
    disabled: false,
    throw: false,
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};

class DirtyChecker {
    static register(t) {
        t.register(o.singleton(this, this), o.aliasTo(this, J));
    }
    constructor() {
        this.tracked = [];
        this.C = null;
        this.O = 0;
        this.p = c(u);
        this.check = () => {
            if (Q.disabled) {
                return;
            }
            if (++this.O < Q.timeoutsPerCheck) {
                return;
            }
            this.O = 0;
            const t = this.tracked;
            const e = t.length;
            let r;
            let s = 0;
            for (;s < e; ++s) {
                r = t[s];
                if (r.isDirty()) {
                    r.flush();
                }
            }
        };
        k(DirtyCheckProperty, null);
    }
    createProperty(t, e) {
        if (Q.throw) {
            throw createMappedError(218, e);
        }
        return new DirtyCheckProperty(this, t, e);
    }
    addProperty(t) {
        this.tracked.push(t);
        if (this.tracked.length === 1) {
            this.C = this.p.taskQueue.queueTask(this.check, {
                persistent: true
            });
        }
    }
    removeProperty(t) {
        this.tracked.splice(this.tracked.indexOf(t), 1);
        if (this.tracked.length === 0) {
            this.C.cancel();
            this.C = null;
        }
    }
}

class DirtyCheckProperty {
    constructor(t, e, r) {
        this.obj = e;
        this.key = r;
        this.type = m;
        this.ov = void 0;
        this.A = t;
    }
    getValue() {
        return this.obj[this.key];
    }
    setValue(t) {
        throw createMappedError(219, this.key);
    }
    isDirty() {
        return this.ov !== this.obj[this.key];
    }
    flush() {
        const t = this.ov;
        const e = this.getValue();
        this.ov = e;
        this.subs.notify(e, t);
    }
    subscribe(t) {
        if (this.subs.add(t) && this.subs.count === 1) {
            this.ov = this.obj[this.key];
            this.A.addProperty(this);
        }
    }
    unsubscribe(t) {
        if (this.subs.remove(t) && this.subs.count === 0) {
            this.A.removeProperty(this);
        }
    }
}

class PrimitiveObserver {
    get doNotCache() {
        return true;
    }
    constructor(t, e) {
        this.type = m;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.o[this.k];
    }
    setValue() {}
    subscribe() {}
    unsubscribe() {}
}

class PropertyAccessor {
    constructor() {
        this.type = m;
    }
    getValue(t, e) {
        return t[e];
    }
    setValue(t, e, r) {
        e[r] = t;
    }
}

class SetterObserver {
    constructor(t, e) {
        this.type = S;
        this.v = void 0;
        this.iO = false;
        this.cb = void 0;
        this.i = void 0;
        this.u = void 0;
        this.o = t;
        this.k = e;
    }
    getValue() {
        return this.v;
    }
    setValue(t) {
        if (this.i !== void 0) {
            t = this.i.call(void 0, t, this.u);
        }
        if (this.iO) {
            if (i(t, this.v)) {
                return;
            }
            X = this.v;
            this.v = t;
            this.cb?.(t, X);
            this.subs.notify(t, X);
        } else {
            this.v = this.o[this.k] = t;
            this.cb?.(t, X);
        }
    }
    useCallback(t) {
        this.cb = t;
        this.start();
        return true;
    }
    useCoercer(t, e) {
        this.i = t;
        this.u = e;
        this.start();
        return true;
    }
    subscribe(t) {
        if (this.iO === false) {
            this.start();
        }
        this.subs.add(t);
    }
    start() {
        if (this.iO === false) {
            this.iO = true;
            this.v = this.o[this.k];
            b(this.o, this.k, {
                enumerable: true,
                configurable: true,
                get: w((() => this.getValue()), {
                    getObserver: () => this
                }),
                set: t => {
                    this.setValue(t);
                }
            });
        }
        return this;
    }
    stop() {
        if (this.iO) {
            b(this.o, this.k, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.v
            });
            this.iO = false;
        }
        return this;
    }
}

(() => {
    k(SetterObserver, null);
})();

let X = void 0;

const Y = new PropertyAccessor;

const Z = /*@__PURE__*/ y("IObserverLocator", (t => t.singleton(ObserverLocator)));

const tt = /*@__PURE__*/ y("INodeObserverLocator", (t => t.cachedCallback((t => new DefaultNodeObserverLocator))));

class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return Y;
    }
    getAccessor() {
        return Y;
    }
}

const et = /*@__PURE__*/ y("IComputedObserverLocator", (t => t.singleton(class DefaultLocator {
    getObserver(t, e, r, s) {
        const n = new ComputedObserver(t, r.get, r.set, s, true);
        b(t, e, {
            enumerable: r.enumerable,
            configurable: true,
            get: w((() => n.getValue()), {
                getObserver: () => n
            }),
            set: t => {
                n.setValue(t);
            }
        });
        return n;
    }
})));

class ObserverLocator {
    constructor() {
        this.R = [];
        this.A = c(J);
        this.P = c(tt);
        this.I = c(et);
    }
    addAdapter(t) {
        this.R.push(t);
    }
    getObserver(t, e) {
        if (t == null) {
            throw createMappedError(199, e);
        }
        if (!a(t)) {
            return new PrimitiveObserver(t, r(e) ? "" : e);
        }
        if (r(e)) {
            return new ComputedObserver(t, e, void 0, this, true);
        }
        const s = getObserverLookup(t);
        let n = s[e];
        if (n === void 0) {
            n = this.createObserver(t, e);
            if (!n.doNotCache) {
                s[e] = n;
            }
        }
        return n;
    }
    getAccessor(t, e) {
        const r = t.$observers?.[e];
        if (r !== void 0) {
            return r;
        }
        if (this.P.handles(t, e, this)) {
            return this.P.getAccessor(t, e, this);
        }
        return Y;
    }
    getArrayObserver(t) {
        return M(t);
    }
    getMapObserver(t) {
        return L(t);
    }
    getSetObserver(t) {
        return D(t);
    }
    createObserver(t, r) {
        if (this.P.handles(t, r, this)) {
            return this.P.getObserver(t, r, this);
        }
        switch (r) {
          case "length":
            if (e(t)) {
                return M(t).getLengthObserver();
            }
            break;

          case "size":
            if (n(t)) {
                return L(t).getLengthObserver();
            } else if (s(t)) {
                return D(t).getLengthObserver();
            }
            break;

          default:
            if (e(t) && h(r)) {
                return M(t).getIndexObserver(Number(r));
            }
            break;
        }
        let i = st(t, r);
        if (i === void 0) {
            let e = rt(t);
            while (e !== null) {
                i = st(e, r);
                if (i === void 0) {
                    e = rt(e);
                } else {
                    break;
                }
            }
        }
        if (i !== void 0 && !d.call(i, "value")) {
            let e = this._(t, r, i);
            if (e == null) {
                e = (i.get?.getObserver)?.(t);
            }
            return e == null ? i.configurable ? this.I.getObserver(t, r, i, this) : this.A.createProperty(t, r) : e;
        }
        return new SetterObserver(t, r);
    }
    _(t, e, r) {
        if (this.R.length > 0) {
            for (const s of this.R) {
                const n = s.getObserver(t, e, r, this);
                if (n != null) {
                    return n;
                }
            }
        }
        return null;
    }
}

const getCollectionObserver = t => {
    let r;
    if (e(t)) {
        r = M(t);
    } else if (n(t)) {
        r = L(t);
    } else if (s(t)) {
        r = D(t);
    }
    return r;
};

const rt = Object.getPrototypeOf;

const st = Object.getOwnPropertyDescriptor;

const getObserverLookup = t => {
    let e = t.$observers;
    if (e === void 0) {
        b(t, "$observers", {
            enumerable: false,
            value: e = l()
        });
    }
    return e;
};

const nt = /*@__PURE__*/ y("IObservation", (t => t.singleton(Observation)));

class Observation {
    static get inject() {
        return [ Z ];
    }
    constructor(t) {
        this.oL = t;
        this.M = {
            immediate: true
        };
    }
    run(t) {
        const e = new RunEffect(this.oL, t);
        e.run();
        return e;
    }
    watch(t, e, r, s = this.M) {
        let n = undefined;
        let i = false;
        const o = this.oL.getObserver(t, e);
        const c = {
            handleChange: (t, e) => r(t, n = e)
        };
        const run = () => {
            if (i) return;
            r(o.getValue(), n);
        };
        const stop = () => {
            i = true;
            o.unsubscribe(c);
        };
        o.subscribe(c);
        if (s.immediate) {
            run();
        }
        return {
            run: run,
            stop: stop
        };
    }
}

class RunEffect {
    constructor(t, e) {
        this.oL = t;
        this.fn = e;
        this.maxRunCount = 10;
        this.queued = false;
        this.running = false;
        this.runCount = 0;
        this.stopped = false;
    }
    handleChange() {
        this.queued = true;
        this.run();
    }
    handleCollectionChange() {
        this.queued = true;
        this.run();
    }
    run() {
        if (this.stopped) {
            throw createMappedError(225);
        }
        if (this.running) {
            return;
        }
        ++this.runCount;
        this.running = true;
        this.queued = false;
        ++this.obs.version;
        try {
            enterConnectable(this);
            this.fn(this);
        } finally {
            this.obs.clear();
            this.running = false;
            exitConnectable(this);
        }
        if (this.queued) {
            if (this.runCount > this.maxRunCount) {
                this.runCount = 0;
                throw createMappedError(226);
            }
            this.run();
        } else {
            this.runCount = 0;
        }
    }
    stop() {
        this.stopped = true;
        this.obs.clearAll();
    }
}

(() => {
    connectable(RunEffect, null);
})();

const it = /*@__PURE__*/ (() => {
    function getObserversLookup(t) {
        if (t.$observers === void 0) {
            b(t, "$observers", {
                value: {}
            });
        }
        return t.$observers;
    }
    const t = {};
    function observable(e, r) {
        if (!SetterNotifier.mixed) {
            SetterNotifier.mixed = true;
            k(SetterNotifier, null);
        }
        let s = false;
        let n;
        if (typeof e === "object") {
            n = e;
        } else if (e != null) {
            n = {
                name: e
            };
            s = true;
        } else {
            n = f;
        }
        if (arguments.length === 0) {
            return function(t, e) {
                if (e.kind !== "field") throw createMappedError(224);
                return createFieldInitializer(e);
            };
        }
        if (r?.kind === "field") return createFieldInitializer(r);
        if (s) {
            return function(e, r) {
                createDescriptor(e, n.name, (() => t), true);
            };
        }
        return function(e, r) {
            switch (r.kind) {
              case "field":
                return createFieldInitializer(r);

              case "class":
                return createDescriptor(e, n.name, (() => t), true);

              default:
                throw createMappedError(224);
            }
        };
        function createFieldInitializer(t) {
            let e;
            t.addInitializer((function() {
                createDescriptor(this, t.name, (() => e), false);
            }));
            return function(t) {
                return e = t;
            };
        }
        function createDescriptor(t, e, r, s) {
            const i = n.callback || `${g(e)}Changed`;
            const o = n.set;
            const observableGetter = function() {
                const t = getNotifier(this, e, i, r, o);
                currentConnectable()?.subscribeTo(t);
                return t.getValue();
            };
            observableGetter.getObserver = function(t) {
                return getNotifier(t, e, i, r, o);
            };
            const c = {
                enumerable: true,
                configurable: true,
                get: observableGetter,
                set(t) {
                    getNotifier(this, e, i, r, o).setValue(t);
                }
            };
            if (s) b(t.prototype, e, c); else b(t, e, c);
        }
    }
    function getNotifier(e, r, s, n, i) {
        const o = getObserversLookup(e);
        let c = o[r];
        if (c == null) {
            const u = n();
            c = new SetterNotifier(e, s, i, u === t ? void 0 : u);
            o[r] = c;
        }
        return c;
    }
    class SetterNotifier {
        constructor(t, e, s, n) {
            this.type = S;
            this.v = void 0;
            this.ov = void 0;
            this.o = t;
            this.S = s;
            this.hs = r(s);
            const i = t[e];
            this.cb = r(i) ? i : void 0;
            this.v = n;
        }
        getValue() {
            return this.v;
        }
        setValue(t) {
            if (this.hs) {
                t = this.S(t);
            }
            if (!i(t, this.v)) {
                this.ov = this.v;
                this.v = t;
                this.cb?.call(this.o, this.v, this.ov);
                t = this.ov;
                this.ov = this.v;
                this.subs.notify(this.v, t);
            }
        }
    }
    SetterNotifier.mixed = false;
    return observable;
})();

function nowrap(t, e) {
    return arguments.length === 0 ? decorator : decorator(t, e);
    function decorator(t, e) {
        switch (e.kind) {
          case "class":
            rtDefineHiddenProp(t, B, true);
            break;

          case "field":
            e.addInitializer((function() {
                const t = this.constructor;
                const r = `${W}_${g(e.name)}__`;
                if (r in t) return;
                rtDefineHiddenProp(t, r, true);
            }));
            break;
        }
    }
}

export { I as AccessorType, CollectionLengthObserver, CollectionSizeObserver, ComputedObserver, j as ConnectableSwitcher, DirtyCheckProperty, Q as DirtyCheckSettings, DirtyChecker, A as ICoercionConfiguration, et as IComputedObserverLocator, J as IDirtyChecker, tt as INodeObserverLocator, nt as IObservation, Z as IObserverLocator, Observation, ObserverLocator, PrimitiveObserver, PropertyAccessor, G as ProxyObservable, SetterObserver, batch, cloneIndexMap, connectable, copyIndexMap, createIndexMap, getCollectionObserver, getObserverLookup, isIndexMap, nowrap, it as observable, k as subscriberCollection };

