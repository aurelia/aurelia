"use strict";

var t = require("@aurelia/kernel");

var s = require("@aurelia/runtime");

var e = require("@aurelia/runtime-html");

var i = require("@aurelia/template-compiler");

var r = require("@aurelia/expression-parser");

const n = /*@__PURE__*/ t.DI.createInterface("IDomRenderer");

const o = /*@__PURE__*/ t.DI.createInterface("ICollectionStrategyLocator");

const h = "near-top";

const l = "near-bottom";

function unwrapExpression(t) {
    let s = false;
    while (t instanceof r.BindingBehaviorExpression) {
        t = t.expression;
    }
    while (t instanceof r.ValueConverterExpression) {
        t = t.expression;
        s = true;
    }
    return s ? t : null;
}

const c = String;

const createMappedError = (t, ...s) => {
    const e = c(t).padStart(4, "0");
    return new Error(`AUR${e}:${s.map(c)}`);
};

const getScrollerElement = (t, s) => {
    let e = t.parentNode;
    while (e !== null && e !== document.body) {
        if (hasOverflowScroll(e, s)) {
            return e;
        }
        e = e.parentNode;
    }
    throw createMappedError(6002);
};

const hasOverflowScroll = (t, s) => {
    const e = window.getComputedStyle(t);
    if (s === "vertical") {
        return e != null && (e.overflowY === "scroll" || e.overflow === "scroll" || e.overflowY === "auto" || e.overflow === "auto");
    }
    return e != null && (e.overflowX === "scroll" || e.overflow === "scroll" || e.overflowX === "auto" || e.overflow === "auto");
};

const getStyleValues = (t, ...s) => {
    const e = window.getComputedStyle(t);
    let i = 0;
    let r = 0;
    for (let t = 0, n = s.length; n > t; ++t) {
        r = parseFloat(e[s[t]]);
        i += isNaN(r) ? 0 : r;
    }
    return i;
};

const calcOuterHeight = t => {
    let s = t.getBoundingClientRect().height;
    s += getStyleValues(t, "marginTop", "marginBottom");
    return s;
};

const calcOuterWidth = t => {
    let s = t.getBoundingClientRect().width;
    s += getStyleValues(t, "marginLeft", "marginRight");
    return s;
};

const calcScrollerViewportHeight = t => {
    let s = t.getBoundingClientRect().height;
    s -= getStyleValues(t, "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom");
    return s;
};

const calcScrollerViewportWidth = t => {
    let s = t.getBoundingClientRect().width;
    s -= getStyleValues(t, "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight");
    return s;
};

const getDistanceToScroller = (t, s) => {
    const e = t.offsetParent;
    const i = t.offsetTop;
    if (e === null || e === s) {
        return i;
    }
    if (e.contains(s)) {
        return i - s.offsetTop;
    }
    return i + getDistanceToScroller(e, s);
};

const getHorizontalDistanceToScroller = (t, s) => {
    const e = t.offsetParent;
    const i = t.offsetLeft;
    if (e === null || e === s) {
        return i;
    }
    if (e.contains(s)) {
        return i - s.offsetLeft;
    }
    return i + getHorizontalDistanceToScroller(e, s);
};

class VirtualRepeat {
    constructor() {
        this.items = void 0;
        this.views = [];
        this.task = null;
        this.itemHeight = 0;
        this.itemWidth = 0;
        this.minViewsRequired = 0;
        this.dom = null;
        this.t = "vertical";
        this.i = false;
        this.h = false;
        this.u = [];
        this.C = [];
        this.$ = [];
        this.T = [];
        this.location = t.resolve(e.IRenderLocation);
        this.instruction = t.resolve(i.IInstruction);
        this.parent = t.resolve(e.IController);
        this.f = t.resolve(e.IViewFactory);
        this.B = t.resolve(o);
        this._ = t.resolve(n);
        this.I = false;
        this.p = t.resolve(e.IPlatform);
        this.M = 0;
        const s = this.instruction.props[0];
        const r = s.forOf;
        const h = this.iterable = unwrapExpression(r.iterable) ?? r.iterable;
        const l = this.R = r.iterable !== h;
        this.L = new CollectionObservationMediator(this, () => l ? this.O() : this.A());
        this.local = r.declaration.name;
        const c = s.props ?? [];
        for (const t of c) {
            if (t == null) continue;
            const s = `${t.to}:${t.value}`;
            const e = s.split(";");
            for (const t of e) {
                const [s, e] = t.split(":");
                if (!s || e === void 0) continue;
                const i = s.trim();
                const r = e.trim();
                const n = Number(r);
                switch (i) {
                  case "itemHeight":
                  case "item-height":
                    {
                        if (!Number.isNaN(n) && n > 0) {
                            this.N = n;
                        }
                        break;
                    }

                  case "itemWidth":
                  case "item-width":
                    {
                        if (!Number.isNaN(n) && n > 0) {
                            this.V = n;
                        }
                        break;
                    }

                  case "bufferSize":
                  case "buffer-size":
                    {
                        if (!Number.isNaN(n) && n > 0) {
                            this.F = n;
                        }
                        break;
                    }

                  case "minViews":
                  case "min-views":
                    {
                        if (!Number.isNaN(n) && n > 0) {
                            this.W = n;
                        }
                        break;
                    }

                  case "layout":
                    {
                        if (r === "horizontal" || r === "vertical") {
                            this.t = r;
                        }
                        break;
                    }

                  case "variableHeight":
                  case "variable-height":
                    {
                        if (r === "true" || r === "1") {
                            this.i = true;
                        }
                        break;
                    }

                  case "variableWidth":
                  case "variable-width":
                    {
                        if (r === "true" || r === "1") {
                            this.h = true;
                        }
                        break;
                    }
                }
            }
        }
    }
    attaching() {
        this.dom = this._.render(this.location, this.t);
        const t = this.dom.anchor.parentNode.tagName;
        if (this.t === "horizontal" && (t === "TBODY" || t === "THEAD" || t === "TFOOT" || t === "TABLE")) {
            throw createMappedError(6e3);
        }
        this.L.start(this.items);
        this.collectionStrategy = this.B.getStrategy(this.items);
        this.q = this.G();
        this.I = true;
        this.H();
    }
    detaching() {
        this.I = false;
        this.q?.();
        this.task?.cancel();
        this.j();
        this.dom.dispose();
        this.L.stop();
        this.dom = this.task = null;
    }
    G() {
        const t = this.dom.scroller;
        const s = new this.p.window.ResizeObserver(() => {
            if (!this.I) return;
            this.H();
        });
        const handleScroll = () => this.handleScroll(t);
        s.observe(t);
        t.addEventListener("scroll", handleScroll);
        return () => {
            s.disconnect();
            t.removeEventListener("scroll", handleScroll);
        };
    }
    H() {
        const t = this.collectionStrategy.count;
        const s = t > 0;
        if (!s) {
            return;
        }
        const e = this.P();
        const i = this.t === "horizontal";
        const r = e.nodes.firstChild;
        const n = this.N ?? calcOuterHeight(r);
        const o = this.V ?? calcOuterWidth(r);
        if (!i && n === 0 || i && o === 0) {
            return;
        }
        const h = this.dom.scroller;
        const l = i ? calcScrollerViewportWidth(h) : calcScrollerViewportHeight(h);
        const c = i ? h.scrollWidth > l : h.scrollHeight > l;
        if (!c) {
            const s = this.views.length;
            this.dom.update(0, (i ? o : n) * (t - s));
        }
        this.itemHeight = n;
        this.itemWidth = o;
        const a = this.W ?? l / (i ? o : n);
        this.minViewsRequired = Math.ceil(a);
        if (i && this.h || !i && this.i) {
            this.U(e, 0);
        }
        this.Y(this.items, this.collectionStrategy);
    }
    j() {
        this.minViewsRequired = 0;
        this.itemHeight = 0;
        this.itemWidth = 0;
        this.dom.update(0, 0);
        this.u.length = 0;
        this.C.length = 0;
        this.$ = [];
        this.T = [];
    }
    U(t, s) {
        const e = t.nodes.firstChild;
        if (e == null) return;
        const i = calcOuterHeight(e);
        const r = calcOuterWidth(e);
        this.u[s] = i;
        this.C[s] = r;
    }
    J(t) {
        this.$ = new Array(t);
        let s = 0;
        for (let e = 0; e < t; e++) {
            const t = this.u[e] ?? this.itemHeight;
            s += t;
            this.$[e] = s;
        }
        this.T = new Array(t);
        let e = 0;
        for (let s = 0; s < t; s++) {
            const t = this.C[s] ?? this.itemWidth;
            e += t;
            this.T[s] = e;
        }
    }
    K(t, s) {
        const e = s ? this.T : this.$;
        if (e.length === 0) {
            const s = this.X();
            return s > 0 ? Math.floor(t / s) : 0;
        }
        let i = 0;
        let r = e.length - 1;
        while (i <= r) {
            const s = Math.floor((i + r) / 2);
            const n = e[s];
            const o = s > 0 ? e[s - 1] : 0;
            if (t >= o && t < n) {
                return s;
            } else if (t < o) {
                r = s - 1;
            } else {
                i = s + 1;
            }
        }
        return Math.max(0, Math.min(i, e.length - 1));
    }
    Z(t, s) {
        const e = s ? this.T : this.$;
        if (e.length === 0 || t === 0) {
            return 0;
        }
        if (t >= e.length) {
            const s = this.X();
            return t * s;
        }
        return t > 0 ? e[t - 1] : 0;
    }
    X() {
        return this.t === "horizontal" ? this.itemWidth : this.itemHeight;
    }
    Y(t, e) {
        const i = this.$controller;
        const r = e.count;
        const n = this.views;
        let o = 0;
        let h = n.length;
        let l = null;
        if (r === 0) {
            for (o = 0; h > o; ++o) {
                l = n[o];
                void l.deactivate(l, i);
            }
            n.splice(0);
            this.j();
            return;
        }
        if (this.X() === 0) {
            return this.H();
        }
        const c = this.F ?? 2;
        const a = this.minViewsRequired * c;
        const u = Math.min(a, r);
        if (h > a) {
            while (h > a) {
                l = n[h - 1];
                void l.deactivate(l, i);
                --h;
            }
            n.splice(h);
        }
        if (h > r) {
            while (h > r) {
                l = n[h - 1];
                void l.deactivate(l, i);
                --h;
            }
            n.splice(r);
        }
        h = n.length;
        for (o = h; o < u; o++) {
            n.push(this.f.create());
        }
        const f = this.t === "horizontal";
        const d = this.X();
        const m = this.local;
        const {firstIndex: p, topCount: b, botCount: g} = this.measureBuffer(this.dom.scroller, n.length, r, d);
        let w = 0;
        let v;
        let C;
        let D;
        for (o = 0; u > o; ++o) {
            w = p + o;
            v = e.item(w);
            l = n[o];
            C = n[o - 1];
            if (l.isActive) {
                D = l.scope;
                D.bindingContext[m] = v;
                D.overrideContext.$index = w;
                D.overrideContext.$length = r;
            } else {
                l.nodes.insertBefore(C.nodes.firstChild.nextSibling);
                D = s.Scope.fromParent(i.scope, new s.BindingContext(m, e.item(w)));
                D.overrideContext.$index = w;
                D.overrideContext.$length = r;
                enhanceOverrideContext(D.overrideContext);
                void l.activate(i, i, D);
            }
            if (f && this.h || !f && this.i) {
                this.U(l, w);
            }
        }
        if (f && this.h || !f && this.i) {
            this.J(r);
        }
        let x = 0;
        let $ = 0;
        if (f && this.h || !f && this.i) {
            x = this.Z(b, f);
            $ = this.Z(r - p - u, f);
        } else {
            x = b * d;
            $ = g * d;
        }
        this.dom.update(x, $);
    }
    itemsChanged(t) {
        this.L.start(t);
        this.collectionStrategy = this.B.getStrategy(t);
        this.tt();
    }
    st(t) {
        const s = t.scrollTop;
        const e = getDistanceToScroller(this.dom.top, t);
        const i = Math.max(0, s === 0 ? 0 : s - e);
        return i;
    }
    et(t) {
        const s = t.scrollLeft;
        const e = getHorizontalDistanceToScroller(this.dom.top, t);
        const i = Math.max(0, s === 0 ? 0 : s - e);
        return i;
    }
    measureBuffer(t, s, e, i) {
        const r = this.t === "horizontal";
        const n = r ? this.h : this.i;
        if (n && (r ? this.T.length > 0 : this.$.length > 0)) {
            return this.it(t, s, e, r);
        } else {
            return this.rt(t, s, e, i, r);
        }
    }
    rt(t, s, e, i, r) {
        const n = r ? this.et(t) : this.st(t);
        let o = n === 0 ? 0 : Math.floor(n / i);
        if (o + s >= e) {
            o = Math.max(0, e - s);
        }
        const h = o;
        const l = Math.max(0, e - h - s);
        return {
            firstIndex: o,
            topCount: h,
            botCount: l
        };
    }
    it(t, s, e, i) {
        const r = i ? this.et(t) : this.st(t);
        let n = r === 0 ? 0 : this.K(r, i);
        if (n + s >= e) {
            n = Math.max(0, e - s);
        }
        const o = n;
        const h = Math.max(0, e - o - s);
        return {
            firstIndex: n,
            topCount: o,
            botCount: h
        };
    }
    handleScroll(t) {
        const s = this.views;
        const e = s.length;
        if (e === 0) {
            return;
        }
        const i = this.local;
        const r = this.t === "horizontal";
        const n = this.X();
        const o = this.dom;
        const c = this.collectionStrategy;
        const a = c.count;
        const u = s[0].scope.overrideContext.$index;
        const {firstIndex: f, topCount: d, botCount: m} = this.measureBuffer(t, e, a, n);
        const p = r ? t.scrollLeft > this.M : t.scrollTop > this.M;
        const b = p ? f >= u + e : f + e <= u;
        this.M = r ? t.scrollLeft : t.scrollTop;
        if (f === u) {
            return;
        }
        let g = null;
        let w = null;
        let v = 0;
        let C = 0;
        let D = 0;
        let x = 0;
        if (b) {
            for (x = 0; e > x; ++x) {
                v = f + x;
                w = s[x].scope;
                w.bindingContext[i] = c.item(v);
                w.overrideContext.$index = v;
                w.overrideContext.$length = a;
            }
        } else if (p) {
            C = f - u;
            while (C > 0) {
                g = s.shift();
                v = s[s.length - 1].scope.overrideContext["$index"] + 1;
                s.push(g);
                w = g.scope;
                w.bindingContext[i] = c.item(v);
                w.overrideContext.$index = v;
                w.overrideContext.$length = a;
                g.nodes.insertBefore(o.bottom);
                ++D;
                --C;
            }
        } else {
            C = u - f;
            while (C > 0) {
                v = u - (D + 1);
                g = s.pop();
                w = g.scope;
                w.bindingContext[i] = c.item(v);
                w.overrideContext.$index = v;
                w.overrideContext.$length = a;
                g.nodes.insertBefore(s[0].nodes.firstChild);
                s.unshift(g);
                ++D;
                --C;
            }
        }
        if (p) {
            if (c.isNearBottom(f + (e - 1))) {
                o.scroller.dispatchEvent(new CustomEvent(l, {
                    bubbles: true,
                    detail: {
                        lastVisibleIndex: f + (e - 1),
                        itemCount: a
                    }
                }));
            }
        } else {
            if (c.isNearTop(s[0].scope.overrideContext["$index"])) {
                o.scroller.dispatchEvent(new CustomEvent(h, {
                    bubbles: true,
                    detail: {
                        firstVisibleIndex: s[0].scope.overrideContext["$index"],
                        itemCount: a
                    }
                }));
            }
        }
        let $ = 0;
        let S = 0;
        if (r && this.h || !r && this.i) {
            $ = this.Z(d, r);
            S = this.Z(m, r);
        } else {
            $ = d * n;
            S = m * n;
        }
        o.update($, S);
    }
    getDistances() {
        return this.dom?.distances ?? [ 0, 0 ];
    }
    getViews() {
        return this.views.slice(0);
    }
    A() {
        this.tt();
    }
    O() {
        const t = s.astEvaluate(this.iterable, this.parent.scope, {
            strict: true
        }, null);
        const e = this.items;
        this.items = t;
        if (t === e) {
            this.tt();
        }
    }
    tt() {
        const t = this.task;
        this.task = s.queueAsyncTask(() => {
            this.task = null;
            this.Y(this.items, this.collectionStrategy);
        });
        t?.cancel();
    }
    P() {
        const t = this.getOrCreateFirstView();
        if (!t.isActive) {
            const e = this.$controller;
            const i = this.collectionStrategy;
            const r = e.scope;
            const n = s.Scope.fromParent(r, new s.BindingContext(this.local, i.first()));
            n.overrideContext.$index = 0;
            n.overrideContext.$length = i.count;
            enhanceOverrideContext(n.overrideContext);
            t.nodes.insertBefore(this.dom.bottom);
            void t.activate(t, e, n);
        }
        return t;
    }
    getOrCreateFirstView() {
        const t = this.views;
        if (t.length > 0) {
            return t[0];
        }
        const s = this.f.create();
        t.push(s);
        return s;
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
    constructor(t, s) {
        this.repeat = t;
        this.handleCollectionChange = s;
    }
    start(t) {
        if (this.nt === t) {
            return;
        }
        this.stop();
        if (t != null) {
            s.getCollectionObserver(this.nt = t)?.subscribe(this);
        }
    }
    stop() {
        s.getCollectionObserver(this.nt)?.unsubscribe(this);
    }
}

const a = new WeakSet;

function enhanceOverrideContext(t) {
    const s = t;
    if (a.has(s)) {
        return;
    }
    Object.defineProperties(s, {
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
    static register(s) {
        return t.Registration.singleton(o, this).register(s);
    }
    getStrategy(t) {
        if (t == null) {
            return new NullCollectionStrategy;
        }
        if (t instanceof Array) {
            return new ArrayCollectionStrategy(t);
        }
        throw createMappedError(6005, typeof t);
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
    range(t, s) {
        const e = this.val;
        const i = this.count;
        if (i > t && s > t) {
            return e.slice(t, s);
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

class DefaultDomRenderer {
    static get inject() {
        return [ e.IPlatform ];
    }
    static register(s) {
        return t.Registration.singleton(n, this).register(s);
    }
    constructor(t) {
        this.p = t;
    }
    render(t, s = "vertical") {
        const e = this.p.document;
        const i = t.parentNode;
        if (i === null) {
            throw createMappedError(6004);
        }
        let r;
        switch (i.tagName) {
          case "TBODY":
          case "THEAD":
          case "TFOOT":
          case "TABLE":
            r = insertBefore(e, "tr", t);
            return new TableDom(i.closest("table"), t, r[0], r[1], s);

          case "UL":
          case "OL":
            r = insertBefore(e, "div", t);
            return new ListDom(i, t, r[0], r[1], s);

          default:
            r = insertBefore(e, "div", t);
            return new DefaultDom(t, r[0], r[1], s);
        }
    }
}

class DefaultDom {
    constructor(t, s, e, i) {
        this.anchor = t;
        this.top = s;
        this.bottom = e;
        this.layout = i;
        this.tH = 0;
        this.bH = 0;
    }
    get scroller() {
        return getScrollerElement(this.anchor, this.layout);
    }
    get distances() {
        return [ this.tH, this.bH ];
    }
    update(t, s) {
        if (this.layout === "horizontal") {
            this.top.style.width = `${this.tH = t}px`;
            this.bottom.style.width = `${this.bH = s}px`;
            this.top.style.height = "100%";
            this.bottom.style.height = "100%";
            this.top.style.display = "inline-block";
            this.bottom.style.display = "inline-block";
        } else {
            this.top.style.height = `${this.tH = t}px`;
            this.bottom.style.height = `${this.bH = s}px`;
            this.top.style.width = "";
            this.bottom.style.width = "";
            this.top.style.display = "";
            this.bottom.style.display = "";
        }
    }
    dispose() {
        this.top.remove();
        this.bottom.remove();
    }
}

class ListDom extends DefaultDom {
    constructor(t, s, e, i, r) {
        super(s, e, i, r);
        this.list = t;
    }
    get scroller() {
        return getScrollerElement(this.list, this.layout);
    }
}

class TableDom extends DefaultDom {
    constructor(t, s, e, i, r) {
        super(s, e, i, r);
        this.table = t;
    }
    get scroller() {
        return getScrollerElement(this.table, this.layout);
    }
}

function insertBefore(t, s, e) {
    const i = e.parentNode;
    return [ i.insertBefore(t.createElement(s), e), i.insertBefore(t.createElement(s), e) ];
}

const u = {
    register(t) {
        return t.register(CollectionStrategyLocator, DefaultDomRenderer, VirtualRepeat);
    }
};

exports.CollectionStrategyLocator = CollectionStrategyLocator;

exports.DefaultDomRenderer = DefaultDomRenderer;

exports.DefaultVirtualizationConfiguration = u;

exports.ICollectionStrategyLocator = o;

exports.IDomRenderer = n;

exports.VIRTUAL_REPEAT_NEAR_BOTTOM = l;

exports.VIRTUAL_REPEAT_NEAR_TOP = h;

exports.VirtualRepeat = VirtualRepeat;
//# sourceMappingURL=index.cjs.map
