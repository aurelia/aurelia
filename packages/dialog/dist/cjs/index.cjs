"use strict";

var t = require("@aurelia/kernel");

var s = require("@aurelia/runtime-html");

const e = t.DI.createInterface;

const i = t.Registration.singleton;

const o = t.Registration.instance;

const r = /*@__PURE__*/ e("IDialogService");

const n = /*@__PURE__*/ e("IDialogController");

const l = /*@__PURE__*/ e("IDialogDomRenderer");

const a = /*@__PURE__*/ e("IDialogDom");

const c = /*@__PURE__*/ e("IDialogGlobalSettings");

class DialogOpenResult {
    constructor(t, s) {
        this.wasCancelled = t;
        this.dialog = s;
    }
    static create(t, s) {
        return new DialogOpenResult(t, s);
    }
}

class DialogCloseResult {
    constructor(t, s) {
        this.status = t;
        this.value = s;
    }
    static create(t, s) {
        return new DialogCloseResult(t, s);
    }
}

const createMappedError = (t, ...s) => {
    const e = String(t).padStart(4, "0");
    return new Error(`AUR${e}:${s.map(String)}`);
};

class DialogController {
    constructor() {
        this.p = t.resolve(s.IPlatform);
        this.ctn = t.resolve(t.IContainer);
        this.closed = new Promise((t, s) => {
            this.t = t;
            this.i = s;
        });
    }
    activate(e) {
        const i = this.ctn.createChild();
        const {model: r, template: n, rejectOnCancel: l, renderer: c} = e;
        const u = t.isFunction(c) ? i.invoke(c) : c;
        const g = e.host ?? this.p.document.body;
        const D = this.dom = u.render(g, this, e.options);
        const d = i.has(s.IEventTarget, true) ? i.get(s.IEventTarget) : null;
        const f = D.contentHost;
        this.settings = e;
        if (d == null || !d.contains(g)) {
            i.register(o(s.IEventTarget, g));
        }
        i.register(o(a, D));
        s.registerHostNode(i, f, this.p);
        return new Promise(t => {
            const s = Object.assign(this.cmp = this.getOrCreateVm(i, e, f), {
                $dialog: this
            });
            t(s.canActivate?.(r) ?? true);
        }).then(e => {
            if (e !== true) {
                D.dispose();
                if (l) {
                    throw createDialogCancelError(null, 905);
                }
                return DialogOpenResult.create(true, this);
            }
            const o = this.cmp;
            return t.onResolve(o.activate?.(r), () => {
                const e = this.controller = s.Controller.$el(i, o, f, null, s.CustomElementDefinition.create(this.getDefinition(o) ?? {
                    name: s.CustomElement.generateName(),
                    template: n
                }));
                return t.onResolve(e.activate(e, null), () => t.onResolve(D.show?.(), () => DialogOpenResult.create(false, this)));
            });
        }, t => {
            D.dispose();
            throw t;
        });
    }
    deactivate(s, e) {
        if (this.h) {
            return this.h;
        }
        let i = true;
        const {controller: o, dom: r, cmp: n, settings: {rejectOnCancel: l}} = this;
        const a = DialogCloseResult.create(s, e);
        const c = new Promise(c => {
            c(t.onResolve(n.canDeactivate?.(a) ?? true, c => {
                if (c !== true) {
                    i = false;
                    this.h = void 0;
                    if (l) {
                        throw createDialogCancelError(null, 906);
                    }
                    return DialogCloseResult.create("abort");
                }
                return t.onResolve(n.deactivate?.(a), () => t.onResolve(r.hide?.(), () => t.onResolve(o.deactivate(o, null), () => {
                    r.dispose();
                    if (!l && s !== "error") {
                        this.t(a);
                    } else {
                        this.i(createDialogCancelError(e, 907));
                    }
                    return a;
                })));
            }));
        }).catch(t => {
            this.h = void 0;
            throw t;
        });
        this.h = i ? c : void 0;
        return c;
    }
    ok(t) {
        return this.deactivate("ok", t);
    }
    cancel(t) {
        return this.deactivate("cancel", t);
    }
    error(s) {
        const e = createDialogCloseError(s);
        return new Promise(s => s(t.onResolve(this.cmp.deactivate?.(DialogCloseResult.create("error", e)), () => t.onResolve(this.controller.deactivate(this.controller, null), () => {
            this.dom.dispose();
            this.i(e);
        }))));
    }
    getOrCreateVm(e, i, o) {
        const r = i.component;
        if (r == null) {
            return new EmptyComponent;
        }
        if (typeof r === "object") {
            return r;
        }
        const n = this.p;
        e.registerResolver(n.HTMLElement, e.registerResolver(n.Element, e.registerResolver(s.INode, new t.InstanceProvider("ElementResolver", o))));
        return e.invoke(r);
    }
    getDefinition(e) {
        const i = t.isFunction(e) ? e : e?.constructor;
        return s.CustomElement.isType(i) ? s.CustomElement.getDefinition(i) : null;
    }
}

class EmptyComponent {}

function createDialogCancelError(t, s) {
    const e = createMappedError(s);
    e.wasCancelled = true;
    e.value = t;
    return e;
}

function createDialogCloseError(t) {
    const s = createMappedError(908);
    s.wasCancelled = false;
    s.value = t;
    return s;
}

class DialogService {
    constructor() {
        this.dlgs = [];
        this.u = t.resolve(t.IContainer);
        this.C = t.resolve(c);
    }
    static register(e) {
        e.register(i(this, this), t.Registration.aliasTo(this, r), s.AppTask.deactivating(r, s => t.onResolve(s.closeAll(), t => {
            if (t.length > 0) {
                throw createMappedError(901, t.length);
            }
        })));
    }
    get controllers() {
        return this.dlgs.slice(0);
    }
    open(s) {
        return asDialogOpenPromise(new Promise(e => {
            const i = DialogSettings.from(this.C, s);
            const r = i.container ?? this.u.createChild();
            e(t.onResolve(i.load(), s => {
                const e = r.invoke(DialogController);
                r.register(o(n, e), o(DialogController, e));
                return t.onResolve(e.activate(s), t => {
                    if (!t.wasCancelled) {
                        this.dlgs.push(e);
                        const $removeController = () => this.remove(e);
                        void e.closed.finally($removeController);
                    }
                    return t;
                });
            }));
        }));
    }
    closeAll() {
        return Promise.all(Array.from(this.dlgs).map(t => {
            if (t.settings.rejectOnCancel) {
                return t.cancel().then(() => null);
            }
            return t.cancel().then(s => s.status === "cancel" ? null : t);
        })).then(t => t.filter(t => !!t));
    }
    remove(t) {
        const s = this.dlgs.indexOf(t);
        if (s > -1) {
            this.dlgs.splice(s, 1);
        }
    }
}

class DialogSettings {
    static from(t, s) {
        const e = Object.assign(new DialogSettings, t, s, {
            options: {
                ...t.options ?? {},
                ...s.options ?? {}
            }
        });
        if (e.component == null && e.template == null) {
            throw createMappedError(903);
        }
        return e;
    }
    load() {
        const e = this;
        const i = this.component;
        const o = this.template;
        const r = t.onResolveAll(i == null ? void 0 : t.onResolve(s.CustomElement.isType(i) ? i : i(), t => {
            e.component = t;
        }), t.isFunction(o) ? t.onResolve(o(), t => {
            e.template = t;
        }) : void 0);
        return t.onResolve(r, () => e);
    }
}

function whenClosed(t, s) {
    return this.then(e => e.dialog.closed.then(t, s), s);
}

function asDialogOpenPromise(t) {
    t.whenClosed = whenClosed;
    return t;
}

class DialogDomRendererClassic {
    constructor() {
        this.p = t.resolve(s.IPlatform);
        this.R = t.resolve(u);
        this.overlayCss = "position:absolute;width:100%;height:100%;top:0;left:0;";
        this.wrapperCss = `${this.overlayCss} display:flex;`;
        this.hostCss = "position:relative;margin:auto;";
    }
    render(t, s, e) {
        const i = this.p.document;
        const h = (t, s) => {
            const e = i.createElement(t);
            e.style.cssText = s;
            return e;
        };
        const {startingZIndex: o} = e ?? {};
        const r = `${this.wrapperCss};${o == null ? "" : `z-index:${o}`}`;
        const n = t.appendChild(h("au-dialog-container", r));
        const l = n.appendChild(h("au-dialog-overlay", this.overlayCss));
        const a = n.appendChild(h("div", this.hostCss));
        return new DialogDomClassic(n, l, a, s, this.R, e ?? {});
    }
}

class DialogDomClassic {
    constructor(t, s, e, i, o, r) {
        this.root = t;
        this.overlay = s;
        this.contentHost = e;
        this.O = null;
        this.I = i;
        this.R = o;
        this.P = r ?? {};
    }
    show() {
        return t.onResolve(this.P?.show?.(this), () => {
            this.O = this.R.add(this.I, this);
        });
    }
    hide() {
        this.O?.dispose();
        return this.P?.hide?.(this);
    }
    dispose() {
        this.O?.dispose();
        this.root.remove();
    }
}

const u = /*@__PURE__*/ e("IDialogEventManager", t => t.singleton(DialogEventManagerClassic));

class DialogEventManagerClassic {
    constructor() {
        this.ctrls = [];
        this.w = t.resolve(s.IWindow);
    }
    add(t, s) {
        if (this.ctrls.push(t) === 1) {
            this.w.addEventListener("keydown", this);
        }
        const e = t.settings.options;
        const i = e.lock;
        let o = e.overlayDismiss;
        o = typeof o === "boolean" ? o : !i;
        const r = e.mouseEvent ?? "click";
        const handleClick = e => {
            if (o && !s.contentHost.contains(e.target)) {
                void t.cancel();
            }
        };
        s.overlay?.addEventListener(r, handleClick);
        const handleSubmit = t => {
            const s = t.target;
            const e = !s.getAttribute("action");
            if (s.tagName === "FORM" && e) {
                t.preventDefault();
            }
        };
        s.contentHost.addEventListener("submit", handleSubmit);
        let n = false;
        return {
            dispose: () => {
                if (n) {
                    return;
                }
                n = true;
                this.$(t);
                s.overlay?.removeEventListener(r, handleClick);
                s.contentHost.removeEventListener("submit", handleSubmit);
            }
        };
    }
    $(t) {
        const s = this.ctrls;
        const e = s.indexOf(t);
        if (e !== -1) {
            s.splice(e, 1);
        }
        if (s.length === 0) {
            this.w.removeEventListener("keydown", this);
        }
    }
    j(t) {
        const s = t.settings.options;
        return s.keyboard ?? (s.lock ? [] : [ "Enter", "Escape" ]);
    }
    handleEvent(t) {
        const s = t;
        const e = DialogEventManagerClassic.M(s);
        if (e == null) {
            return;
        }
        const i = this.ctrls.slice(-1)[0];
        if (i == null) {
            return;
        }
        const o = this.j(i);
        if (e === "Escape" && o.includes(e)) {
            void i.cancel();
        } else if (e === "Enter" && o.includes(e)) {
            void i.ok();
        }
    }
    static M(t) {
        if ((t.code || t.key) === "Escape" || t.keyCode === 27) {
            return "Escape";
        }
        if ((t.code || t.key) === "Enter" || t.keyCode === 13) {
            return "Enter";
        }
        return undefined;
    }
}

class DialogDomRendererStandard {
    constructor() {
        this.p = t.resolve(s.IPlatform);
    }
    render(t, s, e = {}) {
        const h = t => this.p.document.createElement(t);
        const i = h("dialog");
        const o = i.appendChild(h("div"));
        if (e.closedby) {
            i.setAttribute("closedby", e.closedby);
        }
        t.appendChild(i);
        return new DialogDomStandard(i, o, s, e);
    }
}

class DialogDomStandard {
    constructor(t, s, e, i) {
        this.root = t;
        this.contentHost = s;
        this.A = null;
        this.I = e;
        this.P = i;
        this._ = t.ownerDocument.createElement("div");
        if (i.overlayStyle != null) {
            this.setOverlayStyle(i.overlayStyle);
        }
    }
    setOverlayStyle(s) {
        const e = this.A ??= this.root.insertAdjacentElement("afterbegin", this.root.ownerDocument.createElement("style"));
        const i = this._;
        i.style.cssText = "";
        if (t.isString(s)) {
            i.style.cssText = s;
        } else {
            Object.assign(i.style, s);
        }
        e.textContent = `:modal::backdrop{${i.style.cssText}}`;
    }
    show() {
        if (this.P.modal) {
            this.root.showModal();
        } else {
            this.root.show();
        }
        return t.onResolve(this.P.show?.(this), () => {
            this.root.addEventListener("cancel", this);
        });
    }
    hide() {
        if (!this.root.open) ;
        return t.onResolve(this.P.hide?.(this), () => {
            this.root.removeEventListener("cancel", this);
            this.root.close();
        });
    }
    dispose() {
        this.root.remove();
    }
    handleEvent(t) {
        t.preventDefault();
        void this.I.cancel();
    }
}

function createDialogConfiguration(t, e) {
    return {
        register: o => o.register(i(c, e), DialogService, s.AppTask.creating(() => t(o.get(c)))),
        customize(t) {
            return createDialogConfiguration(t, e);
        }
    };
}

const g = /*@__PURE__*/ createDialogConfiguration(() => {
    throw createMappedError(904);
}, class {
    constructor() {
        this.options = {};
    }
});

const D = /*@__PURE__*/ createDialogConfiguration(t.noop, class {
    constructor() {
        this.renderer = DialogDomRendererStandard;
        this.options = {
            modal: true
        };
    }
});

const d = /*@__PURE__*/ createDialogConfiguration(t.noop, class {
    constructor() {
        this.renderer = DialogDomRendererClassic;
        this.options = {
            lock: true,
            startingZIndex: 1e3
        };
    }
});

exports.DialogCloseResult = DialogCloseResult;

exports.DialogConfiguration = g;

exports.DialogConfigurationClassic = d;

exports.DialogConfigurationStandard = D;

exports.DialogController = DialogController;

exports.DialogDomClassic = DialogDomClassic;

exports.DialogDomRendererClassic = DialogDomRendererClassic;

exports.DialogDomRendererStandard = DialogDomRendererStandard;

exports.DialogDomStandard = DialogDomStandard;

exports.DialogOpenResult = DialogOpenResult;

exports.DialogService = DialogService;

exports.IDialogController = n;

exports.IDialogDom = a;

exports.IDialogDomRenderer = l;

exports.IDialogGlobalSettings = c;

exports.IDialogService = r;

exports.createDialogConfiguration = createDialogConfiguration;
//# sourceMappingURL=index.cjs.map
