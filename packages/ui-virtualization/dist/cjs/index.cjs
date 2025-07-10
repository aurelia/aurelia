"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime");

var s = require("@aurelia/runtime-html");

var r = require("@aurelia/template-compiler");

var i = require("@aurelia/expression-parser");

const n = /*@__PURE__*/ t.DI.createInterface("IDomRenderer");

const o = /*@__PURE__*/ t.DI.createInterface("IScrollerObsererLocator");

const l = /*@__PURE__*/ t.DI.createInterface("ICollectionStrategyLocator");

function unwrapExpression(t) {
    let e = false;
    while (t instanceof i.BindingBehaviorExpression) {
        t = t.expression;
    }
    while (t instanceof i.ValueConverterExpression) {
        t = t.expression;
        e = true;
    }
    return e ? t : null;
}

const getScrollerElement = t => {
    let e = t.parentNode;
    while (e !== null && e !== document.body) {
        if (hasOverflowScroll(e)) {
            return e;
        }
        e = e.parentNode;
    }
    throw new Error("Unable to find a scroller");
};

const hasOverflowScroll = t => {
    const e = window.getComputedStyle(t);
    return e != null && (e.overflowY === "scroll" || e.overflow === "scroll" || e.overflowY === "auto" || e.overflow === "auto");
};

const getStyleValues = (t, ...e) => {
    const s = window.getComputedStyle(t);
    let r = 0;
    let i = 0;
    for (let t = 0, n = e.length; n > t; ++t) {
        i = parseFloat(s[e[t]]);
        r += isNaN(i) ? 0 : i;
    }
    return r;
};

const calcOuterHeight = t => {
    let e = t.getBoundingClientRect().height;
    e += getStyleValues(t, "marginTop", "marginBottom");
    return e;
};

const calcScrollerViewportHeight = t => {
    let e = t.getBoundingClientRect().height;
    e -= getStyleValues(t, "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom");
    return e;
};

const getDistanceToScroller = (t, e) => {
    const s = t.offsetParent;
    const r = t.offsetTop;
    if (s === null || s === e) {
        return r;
    }
    if (s.contains(e)) {
        return r - e.offsetTop;
    }
    return r + getDistanceToScroller(s, e);
};

const h = {
    height: 0,
    scrollTop: 0,
    scroller: null,
    width: 0
};

class VirtualRepeat {
    constructor() {
        this.items = void 0;
        this.views = [];
        this.task = null;
        this.i = h;
        this.u = true;
        this.itemHeight = 0;
        this.minViewsRequired = 0;
        this.dom = null;
        this.scrollerObserver = null;
        this.location = t.resolve(s.IRenderLocation);
        this.instruction = t.resolve(r.IInstruction);
        this.parent = t.resolve(s.IController);
        this.f = t.resolve(s.IViewFactory);
        this.C = t.resolve(l);
        this.O = t.resolve(n);
        this.scrollerObserverLocator = t.resolve(o);
        const e = this.instruction.props[0];
        const i = e.forOf;
        const c = this.iterable = unwrapExpression(i.iterable) ?? i.iterable;
        const a = this.$ = i.iterable !== c;
        this.T = new CollectionObservationMediator(this, () => a ? this.I() : this.L());
        this.local = i.declaration.name;
        this.taskQueue = t.resolve(s.IPlatform).domQueue;
    }
    attaching() {
        this.dom = this.O.render(this.location);
        (this.scrollerObserver = this.scrollerObserverLocator.getObserver(this.dom.scroller)).subscribe(this);
        this.T.start(this.items);
        this.collectionStrategy = this.C.getStrategy(this.items);
        this.B(this.items, this.collectionStrategy);
    }
    detaching() {
        this.task?.cancel();
        this.R();
        this.dom.dispose();
        this.scrollerObserver.unsubscribe(this);
        this.T.stop();
        this.dom = this.scrollerObserver = this.task = null;
    }
    V() {
        if (!(this.collectionStrategy.count > 0)) {
            throw new Error("AURxxxx: Invalid calculation state. Virtual repeater has no items.");
        }
        const t = this._();
        const e = calcOuterHeight(t.nodes.firstChild);
        const s = this.scrollerObserver.getValue();
        const r = this.M(s, this.collectionStrategy.count, e);
        if (r.signals & 1) {
            this.R();
            return r;
        }
        if ((r.signals & 2) === 0) {
            this.R();
            return r;
        }
        this.itemHeight = e;
        this.minViewsRequired = r.minViews;
        this.u = false;
        return r;
    }
    M(t, e, s) {
        if (e === 0) {
            return Calculation.reset;
        }
        if (s === 0) {
            return Calculation.none;
        }
        const r = Math.ceil(calcScrollerViewportHeight(t.scroller) / s);
        return Calculation.from(2, r);
    }
    R() {
        this.u = true;
        this.minViewsRequired = 0;
        this.itemHeight = 0;
        this.dom.update(0, 0);
    }
    B(t, s) {
        const r = this.$controller;
        const i = s.count;
        const n = this.views;
        let o = 0;
        let l = n.length;
        let h = null;
        if (i === 0) {
            for (o = 0; l > o; ++o) {
                h = n[o];
                void h.deactivate(h, r);
            }
            n.length = 0;
            this.R();
            return;
        }
        if (this.u) {
            const t = this.V();
            if (t.signals === 1 || (t.signals & 2) === 0) {
                return;
            }
        } else {
            if (this.itemHeight === 0) {
                return;
            }
        }
        const c = this.minViewsRequired * 2;
        const a = Math.min(c, i);
        if (l > c) {
            while (l > c) {
                h = n[l - 1];
                void h.deactivate(h, r);
                --l;
            }
            n.length = l;
        }
        if (l > i) {
            while (l > i) {
                h = n[l - 1];
                void h.deactivate(h, r);
                --l;
            }
            n.length = i;
        }
        l = n.length;
        for (o = l; o < a; o++) {
            n.push(this.f.create());
        }
        const u = this.itemHeight;
        const f = this.local;
        const {firstIndex: d, topCount: p, botCount: g} = this.measureBuffer(this.scrollerObserver.getValue(), n.length, i, u);
        let m = 0;
        let w;
        let C;
        let v;
        for (o = 0; a > o; ++o) {
            m = d + o;
            w = s.item(m);
            h = n[o];
            C = n[o - 1];
            if (h.isActive) {
                v = h.scope;
                v.bindingContext[f] = w;
                v.overrideContext.$index = m;
                v.overrideContext.$length = i;
            } else {
                h.nodes.insertBefore(C.nodes.firstChild.nextSibling);
                v = e.Scope.fromParent(r.scope, new e.BindingContext(f, s.item(m)));
                v.overrideContext.$index = m;
                v.overrideContext.$length = i;
                enhanceOverrideContext(v.overrideContext);
                void h.activate(r, r, v);
            }
        }
        this.dom.update(p * u, g * u);
    }
    itemsChanged(t) {
        this.T.start(t);
        this.collectionStrategy = this.C.getStrategy(t);
        this.A();
    }
    G(t) {
        const e = t.scrollTop;
        const s = getDistanceToScroller(this.dom.top, t.scroller);
        const r = Math.max(0, e === 0 ? 0 : e - s);
        return r;
    }
    measureBuffer(t, e, s, r) {
        const i = this.G(t);
        let n = i === 0 ? 0 : Math.floor(i / r);
        if (n + e >= s) {
            n = Math.max(0, s - e);
        }
        const o = n;
        const l = Math.max(0, s - o - e);
        return {
            firstIndex: n,
            topCount: o,
            botCount: l
        };
    }
    handleScrollerChange(t) {
        const e = this.task;
        this.task = this.taskQueue.queueTask(() => {
            this.task = null;
            if (this.views.length > 0 && this.itemHeight > 0) {
                this.V();
                this.handleScroll(t);
            }
        });
        e?.cancel();
    }
    handleScroll(t) {
        const e = this.i;
        const s = this.local;
        const r = this.itemHeight;
        const i = this.dom;
        const n = this.views;
        const o = this.collectionStrategy;
        const l = n.length;
        const h = o.count;
        const c = n[0].scope.overrideContext.$index;
        const {firstIndex: a, topCount: u, botCount: f} = this.measureBuffer(t, l, h, r);
        const d = t.scrollTop > e.scrollTop;
        const p = d ? a >= c + l : a + l <= c;
        this.i = t;
        if (a === c) {
            return;
        }
        let g = null;
        let m = null;
        let w = 0;
        let C = 0;
        let v = 0;
        let b = 0;
        if (p) {
            for (b = 0; l > b; ++b) {
                w = a + b;
                m = n[b].scope;
                m.bindingContext[s] = o.item(w);
                m.overrideContext.$index = w;
                m.overrideContext.$length = h;
            }
        } else if (d) {
            C = a - c;
            while (C > 0) {
                g = n.shift();
                w = n[n.length - 1].scope.overrideContext["$index"] + 1;
                n.push(g);
                m = g.scope;
                m.bindingContext[s] = o.item(w);
                m.overrideContext.$index = w;
                m.overrideContext.$length = h;
                g.nodes.insertBefore(i.bottom);
                ++v;
                --C;
            }
        } else {
            C = c - a;
            while (C > 0) {
                w = c - (v + 1);
                g = n.pop();
                m = g.scope;
                m.bindingContext[s] = o.item(w);
                m.overrideContext.$index = w;
                m.overrideContext.$length = h;
                g.nodes.insertBefore(n[0].nodes.firstChild);
                n.unshift(g);
                ++v;
                --C;
            }
        }
        if (d) {
            if (o.isNearBottom(a + (l - 1))) ;
        } else {
            if (o.isNearTop(n[0].scope.overrideContext["$index"])) ;
        }
        i.update(u * r, f * r);
    }
    getDistances() {
        return this.dom?.distances ?? [ 0, 0 ];
    }
    getViews() {
        return this.views.slice(0);
    }
    L() {
        this.A();
    }
    I() {
        const t = e.astEvaluate(this.iterable, this.parent.scope, {
            strict: true
        }, null);
        const s = this.items;
        this.items = t;
        if (t === s) {
            this.A();
        }
    }
    A() {
        const t = this.task;
        this.task = this.taskQueue.queueTask(() => {
            this.task = null;
            this.B(this.items, this.collectionStrategy);
        });
        t?.cancel();
    }
    _() {
        const t = this.getOrCreateFirstView();
        if (!t.isActive) {
            const s = this.$controller;
            const r = this.collectionStrategy;
            const i = s.scope;
            const n = e.Scope.fromParent(i, new e.BindingContext(this.local, r.first()));
            n.overrideContext.$index = 0;
            n.overrideContext.$length = r.count;
            enhanceOverrideContext(n.overrideContext);
            t.nodes.insertBefore(this.dom.bottom);
            void t.activate(t, s, n);
        }
        return t;
    }
    getOrCreateFirstView() {
        const t = this.views;
        if (t.length > 0) {
            return t[0];
        }
        const e = this.f.create();
        t.push(e);
        return e;
    }
}

VirtualRepeat.$au = {
    type: "custom-attribute",
    name: "virtual-repeat",
    isTemplateController: true,
    bindables: {
        local: true,
        items: {
            primary: true
        }
    }
};

class CollectionObservationMediator {
    constructor(t, e) {
        this.repeat = t;
        this.handleCollectionChange = e;
    }
    start(t) {
        if (this.N === t) {
            return;
        }
        this.stop();
        if (t != null) {
            e.getCollectionObserver(this.N = t)?.subscribe(this);
        }
    }
    stop() {
        e.getCollectionObserver(this.N)?.unsubscribe(this);
    }
}

var c;

(function(t) {
    t[t["none"] = 0] = "none";
    t[t["reset"] = 1] = "reset";
    t[t["has_sizing"] = 2] = "has_sizing";
})(c || (c = {}));

class Calculation {
    static from(t, e) {
        return new Calculation(t, e);
    }
    constructor(t, e) {
        this.signals = t;
        this.minViews = e;
    }
}

Calculation.reset = new Calculation(1, 0);

Calculation.none = new Calculation(0, 0);

const a = new WeakSet;

function enhanceOverrideContext(t) {
    const e = t;
    if (a.has(e)) {
        return;
    }
    Object.defineProperties(e, {
        $first: createGetterDescriptor($first),
        $last: createGetterDescriptor($last),
        $middle: createGetterDescriptor($middle),
        $even: createGetterDescriptor($even),
        $odd: createGetterDescriptor($odd)
    });
}

function createGetterDescriptor(t) {
    return {
        configurable: true,
        enumerable: true,
        get: t
    };
}

function $even() {
    return this.$index % 2 === 0;
}

function $odd() {
    return this.$index % 2 !== 0;
}

function $first() {
    return this.$index === 0;
}

function $last() {
    return this.$index === this.$length - 1;
}

function $middle() {
    return this.$index > 0 && this.$index < this.$length - 1;
}

class CollectionStrategyLocator {
    static register(e) {
        return t.Registration.singleton(l, this).register(e);
    }
    getStrategy(t) {
        if (t == null) {
            return new NullCollectionStrategy;
        }
        if (t instanceof Array) {
            return new ArrayCollectionStrategy(t);
        }
        throw new Error(`Unable to find a strategy for collection type: ${typeof t}`);
    }
}

class ArrayCollectionStrategy {
    constructor(t) {
        this.val = t;
    }
    get count() {
        return this.val.length;
    }
    first() {
        return this.count > 0 ? this.val[0] : null;
    }
    last() {
        return this.count > 0 ? this.val[this.count - 1] : null;
    }
    item(t) {
        return this.val[t] ?? null;
    }
    range(t, e) {
        const s = this.val;
        const r = this.count;
        if (r > t && e > t) {
            return s.slice(t, e);
        }
        return [];
    }
    isNearTop(t) {
        return t < 5;
    }
    isNearBottom(t) {
        return t > this.val.length - 5;
    }
}

class NullCollectionStrategy {
    constructor() {
        this.val = null;
        this.count = 0;
    }
    isNearTop() {
        return false;
    }
    isNearBottom() {
        return false;
    }
    first() {
        return null;
    }
    last() {
        return null;
    }
    item() {
        return null;
    }
    range() {
        return [];
    }
}

class ScrollerObserverLocator {
    static get inject() {
        return [ s.IPlatform ];
    }
    static register(e) {
        return t.Registration.singleton(o, this).register(e);
    }
    constructor(t) {
        this.cache = new WeakMap;
        this.p = t;
    }
    getObserver(t) {
        const e = this.cache;
        let s = e.get(t);
        if (!e.has(t)) {
            e.set(t, s = new ScrollerObserver(this.p, t));
        }
        return s;
    }
}

class ScrollerObserver {
    constructor(t, e) {
        this.p = t;
        this.scroller = e;
        this.subs = new Set;
        this.geo = null;
    }
    start() {
        this.scroller.addEventListener("scroll", this);
        const t = getResizeObserverClass(this.p);
        if (typeof t === "function") {
            (this.sizeObs = new t(t => {
                const e = this.geo;
                const s = new ElementGeometry(t[0].contentRect);
                if (!s.equals(e)) {
                    this.geo = s;
                    this.notify();
                }
            })).observe(this.scroller);
        }
    }
    stop() {
        this.scroller.removeEventListener("scroll", this);
        this.sizeObs?.disconnect();
        this.sizeObs = void 0;
    }
    notify() {
        this.subs.forEach(notifySubscriber, this.getValue());
    }
    setValue() {
        throw new Error("scroller info is readonly");
    }
    getValue() {
        const t = this.scroller;
        const e = t.getBoundingClientRect();
        return new ScrollerInfo(t, t.scrollTop, e.width, e.height);
    }
    handleEvent(t) {
        this.notify();
    }
    subscribe(t) {
        if (this.subs.size === 0) {
            this.start();
        }
        this.subs.add(t);
    }
    unsubscribe(t) {
        const e = this.subs;
        if (e.has(t) && e.size === 1) {
            this.stop();
        }
        e.delete(t);
    }
}

function notifySubscriber(t) {
    t.handleScrollerChange(this);
}

class ElementGeometry {
    constructor(t) {
        this.t = t.top;
        this.l = t.left;
        this.w = t.width;
        this.h = t.height;
    }
    equals(t) {
        if (t == null) {
            return false;
        }
        return this.t === t.t && this.l === t.l && this.w === t.w && this.h === t.h;
    }
}

class ScrollerInfo {
    constructor(t, e, s, r) {
        this.scroller = t;
        this.scrollTop = e;
        this.width = s;
        this.height = r;
    }
}

const getResizeObserverClass = t => t.window.ResizeObserver;

class DefaultDomRenderer {
    static get inject() {
        return [ s.IPlatform ];
    }
    static register(e) {
        return t.Registration.singleton(n, this).register(e);
    }
    constructor(t) {
        this.p = t;
    }
    render(t) {
        const e = this.p.document;
        const s = t.parentNode;
        if (s === null) {
            throw new Error("Invalid render target");
        }
        let r;
        switch (s.tagName) {
          case "TBODY":
          case "THEAD":
          case "TFOOT":
          case "TABLE":
            r = insertBefore(e, "tr", t);
            return new TableDom(s.closest("table"), t, r[0], r[1]);

          case "UL":
          case "OL":
            r = insertBefore(e, "div", t);
            return new ListDom(s, t, r[0], r[1]);

          default:
            r = insertBefore(e, "div", t);
            return new DefaultDom(t, r[0], r[1]);
        }
    }
}

class DefaultDom {
    constructor(t, e, s) {
        this.anchor = t;
        this.top = e;
        this.bottom = s;
        this.tH = 0;
        this.bH = 0;
    }
    get scroller() {
        return getScrollerElement(this.anchor);
    }
    get distances() {
        return [ this.tH, this.bH ];
    }
    update(t, e) {
        this.top.style.height = `${this.tH = t}px`;
        this.bottom.style.height = `${this.bH = e}px`;
    }
    dispose() {
        this.top.remove();
        this.bottom.remove();
    }
}

class ListDom extends DefaultDom {
    constructor(t, e, s, r) {
        super(e, s, r);
        this.list = t;
    }
    get scroller() {
        return getScrollerElement(this.list);
    }
}

class TableDom extends DefaultDom {
    constructor(t, e, s, r) {
        super(e, s, r);
        this.table = t;
    }
    get scroller() {
        return getScrollerElement(this.table);
    }
}

function insertBefore(t, e, s) {
    const r = s.parentNode;
    return [ r.insertBefore(t.createElement(e), s), r.insertBefore(t.createElement(e), s) ];
}

const u = {
    register(t) {
        return t.register(ScrollerObserverLocator, CollectionStrategyLocator, DefaultDomRenderer, VirtualRepeat);
    }
};

exports.CollectionStrategyLocator = CollectionStrategyLocator;

exports.DefaultDomRenderer = DefaultDomRenderer;

exports.DefaultVirtualizationConfiguration = u;

exports.ICollectionStrategyLocator = l;

exports.IDomRenderer = n;

exports.IScrollerObsererLocator = o;

exports.ScrollerObserver = ScrollerObserver;

exports.ScrollerObserverLocator = ScrollerObserverLocator;

exports.VirtualRepeat = VirtualRepeat;
//# sourceMappingURL=index.cjs.map
