import { DI as t, resolve as s, Registration as e } from "../../../kernel/dist/native-modules/index.mjs";

import { Scope as i, BindingContext as r, astEvaluate as n, queueAsyncTask as o, getCollectionObserver as h } from "../../../runtime/dist/native-modules/index.mjs";

import { IRenderLocation as l, IController as c, IViewFactory as a, IPlatform as u } from "../../../runtime-html/dist/native-modules/index.mjs";

import { IInstruction as f } from "../../../template-compiler/dist/native-modules/index.mjs";

import { BindingBehaviorExpression as d, ValueConverterExpression as m } from "../../../expression-parser/dist/native-modules/index.mjs";

const p = /*@__PURE__*/ t.createInterface("IDomRenderer");

const b = /*@__PURE__*/ t.createInterface("ICollectionStrategyLocator");

const g = "near-top";

const w = "near-bottom";

function unwrapExpression(t) {
    let s = false;
    while (t instanceof d) {
        t = t.expression;
    }
    while (t instanceof m) {
        t = t.expression;
        s = true;
    }
    return s ? t : null;
}

const C = String;

const createMappedError = (t, ...s) => {
    const e = C(t).padStart(4, "0");
    return new Error(`AUR${e}:${s.map(C)}`);
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
        this.location = s(l);
        this.instruction = s(f);
        this.parent = s(c);
        this.f = s(a);
        this.B = s(b);
        this._ = s(p);
        this.I = false;
        this.p = s(u);
        this.M = 0;
        const t = this.instruction.props[0];
        const e = t.forOf;
        const i = this.iterable = unwrapExpression(e.iterable) ?? e.iterable;
        const r = this.R = e.iterable !== i;
        this.L = new CollectionObservationMediator(this, () => r ? this.O() : this.A());
        this.local = e.declaration.name;
        const n = t.props ?? [];
        for (const t of n) {
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
        this.G = this.H();
        this.I = true;
        this.j();
    }
    detaching() {
        this.I = false;
        this.G?.();
        this.task?.cancel();
        this.P();
        this.dom.dispose();
        this.L.stop();
        this.dom = this.task = null;
    }
    H() {
        const t = this.dom.scroller;
        const s = new this.p.window.ResizeObserver(() => {
            if (!this.I) return;
            this.j();
        });
        const handleScroll = () => this.handleScroll(t);
        s.observe(t);
        t.addEventListener("scroll", handleScroll);
        return () => {
            s.disconnect();
            t.removeEventListener("scroll", handleScroll);
        };
    }
    j() {
        const t = this.collectionStrategy.count;
        const s = t > 0;
        if (!s) {
            return;
        }
        const e = this.U();
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
            this.Y(e, 0);
        }
        this.q(this.items, this.collectionStrategy);
    }
    P() {
        this.minViewsRequired = 0;
        this.itemHeight = 0;
        this.itemWidth = 0;
        this.dom.update(0, 0);
        this.u.length = 0;
        this.C.length = 0;
        this.$ = [];
        this.T = [];
    }
    Y(t, s) {
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
    q(t, s) {
        const e = this.$controller;
        const n = s.count;
        const o = this.views;
        let h = 0;
        let l = o.length;
        let c = null;
        if (n === 0) {
            for (h = 0; l > h; ++h) {
                c = o[h];
                void c.deactivate(c, e);
            }
            o.splice(0);
            this.P();
            return;
        }
        if (this.X() === 0) {
            return this.j();
        }
        const a = this.F ?? 2;
        const u = this.minViewsRequired * a;
        const f = Math.min(u, n);
        if (l > u) {
            while (l > u) {
                c = o[l - 1];
                void c.deactivate(c, e);
                --l;
            }
            o.splice(l);
        }
        if (l > n) {
            while (l > n) {
                c = o[l - 1];
                void c.deactivate(c, e);
                --l;
            }
            o.splice(n);
        }
        l = o.length;
        for (h = l; h < f; h++) {
            o.push(this.f.create());
        }
        const d = this.t === "horizontal";
        const m = this.X();
        const p = this.local;
        const {firstIndex: b, topCount: g, botCount: w} = this.measureBuffer(this.dom.scroller, o.length, n, m);
        let C = 0;
        let v;
        let D;
        let $;
        for (h = 0; f > h; ++h) {
            C = b + h;
            v = s.item(C);
            c = o[h];
            D = o[h - 1];
            if (c.isActive) {
                $ = c.scope;
                $.bindingContext[p] = v;
                $.overrideContext.$index = C;
                $.overrideContext.$length = n;
            } else {
                c.nodes.insertBefore(D.nodes.firstChild.nextSibling);
                $ = i.fromParent(e.scope, new r(p, s.item(C)));
                $.overrideContext.$index = C;
                $.overrideContext.$length = n;
                enhanceOverrideContext($.overrideContext);
                void c.activate(e, e, $);
            }
            if (d && this.h || !d && this.i) {
                this.Y(c, C);
            }
        }
        if (d && this.h || !d && this.i) {
            this.J(n);
        }
        let x = 0;
        let S = 0;
        if (d && this.h || !d && this.i) {
            x = this.Z(g, d);
            S = this.Z(n - b - f, d);
        } else {
            x = g * m;
            S = w * m;
        }
        this.dom.update(x, S);
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
        const h = this.collectionStrategy;
        const l = h.count;
        const c = s[0].scope.overrideContext.$index;
        const {firstIndex: a, topCount: u, botCount: f} = this.measureBuffer(t, e, l, n);
        const d = r ? t.scrollLeft > this.M : t.scrollTop > this.M;
        const m = d ? a >= c + e : a + e <= c;
        this.M = r ? t.scrollLeft : t.scrollTop;
        if (a === c) {
            return;
        }
        let p = null;
        let b = null;
        let C = 0;
        let v = 0;
        let D = 0;
        let $ = 0;
        if (m) {
            for ($ = 0; e > $; ++$) {
                C = a + $;
                b = s[$].scope;
                b.bindingContext[i] = h.item(C);
                b.overrideContext.$index = C;
                b.overrideContext.$length = l;
            }
        } else if (d) {
            v = a - c;
            while (v > 0) {
                p = s.shift();
                C = s[s.length - 1].scope.overrideContext["$index"] + 1;
                s.push(p);
                b = p.scope;
                b.bindingContext[i] = h.item(C);
                b.overrideContext.$index = C;
                b.overrideContext.$length = l;
                p.nodes.insertBefore(o.bottom);
                ++D;
                --v;
            }
        } else {
            v = c - a;
            while (v > 0) {
                C = c - (D + 1);
                p = s.pop();
                b = p.scope;
                b.bindingContext[i] = h.item(C);
                b.overrideContext.$index = C;
                b.overrideContext.$length = l;
                p.nodes.insertBefore(s[0].nodes.firstChild);
                s.unshift(p);
                ++D;
                --v;
            }
        }
        if (d) {
            if (h.isNearBottom(a + (e - 1))) {
                o.scroller.dispatchEvent(new CustomEvent(w, {
                    bubbles: true,
                    detail: {
                        lastVisibleIndex: a + (e - 1),
                        itemCount: l
                    }
                }));
            }
        } else {
            if (h.isNearTop(s[0].scope.overrideContext["$index"])) {
                o.scroller.dispatchEvent(new CustomEvent(g, {
                    bubbles: true,
                    detail: {
                        firstVisibleIndex: s[0].scope.overrideContext["$index"],
                        itemCount: l
                    }
                }));
            }
        }
        let x = 0;
        let S = 0;
        if (r && this.h || !r && this.i) {
            x = this.Z(u, r);
            S = this.Z(f, r);
        } else {
            x = u * n;
            S = f * n;
        }
        o.update(x, S);
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
        const t = n(this.iterable, this.parent.scope, {
            strict: true
        }, null);
        const s = this.items;
        this.items = t;
        if (t === s) {
            this.tt();
        }
    }
    tt() {
        const t = this.task;
        this.task = o(() => {
            this.task = null;
            this.q(this.items, this.collectionStrategy);
        });
        t?.cancel();
    }
    U() {
        const t = this.getOrCreateFirstView();
        if (!t.isActive) {
            const s = this.$controller;
            const e = this.collectionStrategy;
            const n = s.scope;
            const o = i.fromParent(n, new r(this.local, e.first()));
            o.overrideContext.$index = 0;
            o.overrideContext.$length = e.count;
            enhanceOverrideContext(o.overrideContext);
            t.nodes.insertBefore(this.dom.bottom);
            void t.activate(t, s, o);
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
            h(this.nt = t)?.subscribe(this);
        }
    }
    stop() {
        h(this.nt)?.unsubscribe(this);
    }
}

const v = new WeakSet;

function enhanceOverrideContext(t) {
    const s = t;
    if (v.has(s)) {
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
    static register(t) {
        return e.singleton(b, this).register(t);
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
        return [ u ];
    }
    static register(t) {
        return e.singleton(p, this).register(t);
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

const D = {
    register(t) {
        return t.register(CollectionStrategyLocator, DefaultDomRenderer, VirtualRepeat);
    }
};

export { CollectionStrategyLocator, DefaultDomRenderer, D as DefaultVirtualizationConfiguration, b as ICollectionStrategyLocator, p as IDomRenderer, w as VIRTUAL_REPEAT_NEAR_BOTTOM, g as VIRTUAL_REPEAT_NEAR_TOP, VirtualRepeat };

