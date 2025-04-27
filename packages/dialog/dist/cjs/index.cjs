"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime-html");

const s = t.DI.createInterface;

const i = t.Registration.singleton;

const o = t.Registration.instance;

const r = /*@__PURE__*/ s("IDialogService");

const n = /*@__PURE__*/ s("IDialogController");

const l = /*@__PURE__*/ s("IDialogDomRenderer");

const a = /*@__PURE__*/ s("IDialogDom");

const c = /*@__PURE__*/ s("IDialogDomAnimator");

const u = /*@__PURE__*/ s("IDialogKeyboardService");

const g = /*@__PURE__*/ s("IDialogGlobalSettings");

class DialogOpenResult {
    constructor(t, e) {
        this.wasCancelled = t;
        this.dialog = e;
    }
    static create(t, e) {
        return new DialogOpenResult(t, e);
    }
}

class DialogCloseResult {
    constructor(t, e) {
        this.status = t;
        this.value = e;
    }
    static create(t, e) {
        return new DialogCloseResult(t, e);
    }
}

const createMappedError = (t, ...e) => {
    const s = String(t).padStart(4, "0");
    return new Error(`AUR${s}:${e.map(String)}`);
};

class DialogController {
    constructor() {
        this.p = t.resolve(e.IPlatform);
        this.ctn = t.resolve(t.IContainer);
        this.t = void 0;
        this.closed = new Promise(((t, e) => {
            this.i = t;
            this.u = e;
        }));
    }
    activate(s) {
        const i = this.ctn.createChild();
        const {model: r, template: n, rejectOnCancel: c, renderer: g = i.get(l)} = s;
        const D = s.host ?? this.p.document.body;
        const f = this.dom = g.render(D, s);
        const p = i.has(e.IEventTarget, true) ? i.get(e.IEventTarget) : null;
        const d = f.contentHost;
        const m = i.get(u);
        this.settings = s;
        if (p == null || !p.contains(D)) {
            i.register(o(e.IEventTarget, D));
        }
        i.register(o(a, f));
        e.registerHostNode(i, d, this.p);
        return new Promise((t => {
            const e = Object.assign(this.cmp = this.getOrCreateVm(i, s, d), {
                $dialog: this
            });
            t(e.canActivate?.(r) ?? true);
        })).then((s => {
            if (s !== true) {
                f.dispose();
                if (c) {
                    throw createDialogCancelError(null, 905);
                }
                return DialogOpenResult.create(true, this);
            }
            const o = this.cmp;
            return t.onResolve(o.activate?.(r), (() => {
                const s = this.controller = e.Controller.$el(i, o, d, null, e.CustomElementDefinition.create(this.getDefinition(o) ?? {
                    name: e.CustomElement.generateName(),
                    template: n
                }));
                return t.onResolve(s.activate(s, null), (() => {
                    this.t = m.add(this, f);
                    return t.onResolve(f.show?.(), (() => DialogOpenResult.create(false, this)));
                }));
            }));
        }), (t => {
            f.dispose();
            throw t;
        }));
    }
    deactivate(e, s) {
        if (this.h) {
            return this.h;
        }
        let i = true;
        const {controller: o, dom: r, cmp: n, settings: {rejectOnCancel: l}} = this;
        const a = DialogCloseResult.create(e, s);
        const c = new Promise((c => {
            c(t.onResolve(n.canDeactivate?.(a) ?? true, (c => {
                if (c !== true) {
                    i = false;
                    this.h = void 0;
                    if (l) {
                        throw createDialogCancelError(null, 906);
                    }
                    return DialogCloseResult.create("abort");
                }
                return t.onResolve(n.deactivate?.(a), (() => t.onResolve(r.hide?.(), (() => t.onResolve(o.deactivate(o, null), (() => {
                    r.dispose();
                    this.t?.dispose();
                    if (!l && e !== "error") {
                        this.i(a);
                    } else {
                        this.u(createDialogCancelError(s, 907));
                    }
                    return a;
                }))))));
            })));
        })).catch((t => {
            this.h = void 0;
            throw t;
        }));
        this.h = i ? c : void 0;
        return c;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(e) {
        const s = createDialogCloseError(e);
        return new Promise((e => e(t.onResolve(this.cmp.deactivate?.(DialogCloseResult.create("error", s)), (() => t.onResolve(this.controller.deactivate(this.controller, null), (() => {
            this.dom.dispose();
            this.u(s);
        })))))));
    }
    getOrCreateVm(s, i, o) {
        const r = i.component;
        if (r == null) {
            return new EmptyComponent;
        }
        if (typeof r === "object") {
            return r;
        }
        const n = this.p;
        s.registerResolver(n.HTMLElement, s.registerResolver(n.Element, s.registerResolver(e.INode, new t.InstanceProvider("ElementResolver", o))));
        return s.invoke(r);
    }
    getDefinition(s) {
        const i = t.isFunction(s) ? s : s?.constructor;
        return e.CustomElement.isType(i) ? e.CustomElement.getDefinition(i) : null;
    }
}

class EmptyComponent {}

function createDialogCancelError(t, e) {
    const s = createMappedError(e);
    s.wasCancelled = true;
    s.value = t;
    return s;
}

function createDialogCloseError(t) {
    const e = createMappedError(908);
    e.wasCancelled = false;
    e.value = t;
    return e;
}

class DialogService {
    constructor() {
        this.dlgs = [];
        this.C = t.resolve(t.IContainer);
        this.R = t.resolve(g);
    }
    static register(s) {
        s.register(i(this, this), t.Registration.aliasTo(this, r), e.AppTask.deactivating(r, (e => t.onResolve(e.closeAll(), (t => {
            if (t.length > 0) {
                throw createMappedError(901, t.length);
            }
        })))));
    }
    get controllers() {
        return this.dlgs.slice(0);
    }
    open(e) {
        return asDialogOpenPromise(new Promise((s => {
            const i = DialogSettings.from(this.R, e);
            const r = i.container ?? this.C.createChild();
            s(t.onResolve(i.load(), (e => {
                const s = r.invoke(DialogController);
                r.register(o(n, s), o(DialogController, s));
                return t.onResolve(s.activate(e), (t => {
                    if (!t.wasCancelled) {
                        this.dlgs.push(s);
                        const $removeController = () => this.remove(s);
                        void s.closed.finally($removeController);
                    }
                    return t;
                }));
            })));
        })));
    }
    closeAll() {
        return Promise.all(Array.from(this.dlgs).map((t => {
            if (t.settings.rejectOnCancel) {
                return t.cancel().then((() => null));
            }
            return t.cancel().then((e => e.status === "cancel" ? null : t));
        }))).then((t => t.filter((t => !!t))));
    }
    remove(t) {
        const e = this.dlgs.indexOf(t);
        if (e > -1) {
            this.dlgs.splice(e, 1);
        }
    }
}

class DialogSettings {
    static from(...t) {
        return Object.assign(new DialogSettings, ...t).P().O();
    }
    load() {
        const e = this;
        const s = this.component;
        const i = this.template;
        const o = t.onResolveAll(...[ s == null ? void 0 : t.onResolve(s(), (t => {
            e.component = t;
        })), t.isFunction(i) ? t.onResolve(i(), (t => {
            e.template = t;
        })) : void 0 ]);
        return t.isPromise(o) ? o.then((() => e)) : e;
    }
    P() {
        if (this.component == null && this.template == null) {
            throw createMappedError(903);
        }
        return this;
    }
    O() {
        if (this.keyboard == null) {
            this.keyboard = this.lock ? [] : [ "Enter", "Escape" ];
        }
        if (typeof this.overlayDismiss !== "boolean") {
            this.overlayDismiss = !this.lock;
        }
        return this;
    }
}

function whenClosed(t, e) {
    return this.then((s => s.dialog.closed.then(t, e)), e);
}

function asDialogOpenPromise(t) {
    t.whenClosed = whenClosed;
    return t;
}

class DefaultDialogGlobalSettings {
    constructor() {
        this.lock = true;
        this.startingZIndex = 1e3;
        this.rejectOnCancel = false;
    }
    static register(t) {
        i(g, this).register(t);
    }
}

class DefaultDialogDomRenderer {
    constructor() {
        this.p = t.resolve(e.IPlatform);
        this.I = t.resolve(t.optional(c));
        this.overlayCss = "position:absolute;width:100%;height:100%;top:0;left:0;";
        this.wrapperCss = `${this.overlayCss} display:flex;`;
        this.hostCss = "position:relative;margin:auto;";
    }
    static register(t) {
        t.register(i(l, this));
    }
    render(t, e) {
        const s = this.p.document;
        const h = (t, e) => {
            const i = s.createElement(t);
            i.style.cssText = e;
            return i;
        };
        const {startingZIndex: i} = e;
        const o = `${this.wrapperCss};${i == null ? "" : `z-index:${i}`}`;
        const r = t.appendChild(h("au-dialog-container", o));
        const n = r.appendChild(h("au-dialog-overlay", this.overlayCss));
        const l = r.appendChild(h("div", this.hostCss));
        return new DefaultDialogDom(r, n, l, this.I);
    }
}

class DefaultDialogDom {
    constructor(t, e, s, i) {
        this.wrapper = t;
        this.overlay = e;
        this.contentHost = s;
        this.I = i;
    }
    show() {
        return this.I?.show(this);
    }
    hide() {
        return this.I?.hide(this);
    }
    dispose() {
        this.wrapper.remove();
    }
}

class DefaultDialogEventManager {
    constructor() {
        this.ctrls = [];
        this.w = t.resolve(e.IWindow);
    }
    static register(t) {
        i(u, this).register(t);
    }
    add(t, e) {
        if (this.ctrls.push(t) === 1) {
            this.w.addEventListener("keydown", this);
        }
        const s = t.settings.mouseEvent ?? "click";
        const handleClick = s => {
            if (t.settings.overlayDismiss && !e.contentHost.contains(s.target)) {
                void t.cancel();
            }
        };
        e.overlay.addEventListener(s, handleClick);
        const handleSubmit = t => {
            const e = t.target;
            const s = !e.getAttribute("action");
            if (e.tagName === "FORM" && s) {
                t.preventDefault();
            }
        };
        e.contentHost.addEventListener("submit", handleSubmit);
        return {
            dispose: () => {
                this.$(t);
                e.overlay.removeEventListener(s, handleClick);
                e.contentHost.removeEventListener("submit", handleSubmit);
            }
        };
    }
    $(t) {
        const e = this.ctrls;
        const s = e.indexOf(t);
        if (s !== -1) {
            e.splice(s, 1);
        }
        if (e.length === 0) {
            this.w.removeEventListener("keydown", this);
        }
    }
    handleEvent(t) {
        const e = t;
        const s = getActionKey(e);
        if (s == null) {
            return;
        }
        const i = this.ctrls.slice(-1)[0];
        if (i == null || i.settings.keyboard.length === 0) {
            return;
        }
        const o = i.settings.keyboard;
        if (s === "Escape" && o.includes(s)) {
            void i.cancel();
        } else if (s === "Enter" && o.includes(s)) {
            void i.ok();
        }
    }
}

function getActionKey(t) {
    if ((t.code || t.key) === "Escape" || t.keyCode === 27) {
        return "Escape";
    }
    if ((t.code || t.key) === "Enter" || t.keyCode === 13) {
        return "Enter";
    }
    return undefined;
}

function createDialogConfiguration(t, s) {
    return {
        settingsProvider: t,
        register: i => i.register(...s, e.AppTask.creating((() => t(i.get(g))))),
        customize(t, e) {
            return createDialogConfiguration(t, e ?? s);
        }
    };
}

const D = /*@__PURE__*/ createDialogConfiguration((() => {
    throw createMappedError(904);
}), [ class NoopDialogGlobalSettings {
    static register(t) {
        t.register(i(g, this));
    }
} ]);

const f = /*@__PURE__*/ createDialogConfiguration(t.noop, [ DialogService, DefaultDialogGlobalSettings, DefaultDialogDomRenderer, DefaultDialogEventManager ]);

exports.DefaultDialogDom = DefaultDialogDom;

exports.DefaultDialogDomRenderer = DefaultDialogDomRenderer;

exports.DefaultDialogEventManager = DefaultDialogEventManager;

exports.DefaultDialogGlobalSettings = DefaultDialogGlobalSettings;

exports.DialogCloseResult = DialogCloseResult;

exports.DialogConfiguration = D;

exports.DialogController = DialogController;

exports.DialogDefaultConfiguration = f;

exports.DialogOpenResult = DialogOpenResult;

exports.DialogService = DialogService;

exports.IDialogController = n;

exports.IDialogDom = a;

exports.IDialogDomAnimator = c;

exports.IDialogDomRenderer = l;

exports.IDialogEventManager = u;

exports.IDialogGlobalSettings = g;

exports.IDialogService = r;
//# sourceMappingURL=index.cjs.map
