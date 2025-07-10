import { DI as t, Registration as s, resolve as i, IContainer as e, isFunction as o, onResolve as r, InstanceProvider as n, onResolveAll as l, isString as a, noop as c } from "../../../kernel/dist/native-modules/index.mjs";

import { IPlatform as u, IEventTarget as g, registerHostNode as D, Controller as d, CustomElementDefinition as f, CustomElement as m, INode as C, AppTask as p, IWindow as v } from "../../../runtime-html/dist/native-modules/index.mjs";

const w = t.createInterface;

const E = s.singleton;

const R = s.instance;

const S = /*@__PURE__*/ w("IDialogService");

const O = /*@__PURE__*/ w("IDialogController");

const y = /*@__PURE__*/ w("IDialogDomRenderer");

const b = /*@__PURE__*/ w("IDialogDom");

const k = /*@__PURE__*/ w("IDialogGlobalSettings");

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
    const i = String(t).padStart(4, "0");
    return new Error(`AUR${i}:${s.map(String)}`);
};

class DialogController {
    constructor() {
        this.p = i(u);
        this.ctn = i(e);
        this.closed = new Promise((t, s) => {
            this.t = t;
            this.i = s;
        });
    }
    activate(t) {
        const s = this.ctn.createChild();
        const {model: i, template: e, rejectOnCancel: n, renderer: l} = t;
        const a = o(l) ? s.invoke(l) : l;
        const c = t.host ?? this.p.document.body;
        const u = this.dom = a.render(c, this, t.options);
        const C = s.has(g, true) ? s.get(g) : null;
        const p = u.contentHost;
        this.settings = t;
        if (C == null || !C.contains(c)) {
            s.register(R(g, c));
        }
        s.register(R(b, u));
        D(s, p, this.p);
        return new Promise(e => {
            const o = Object.assign(this.cmp = this.getOrCreateVm(s, t, p), {
                $dialog: this
            });
            e(o.canActivate?.(i) ?? true);
        }).then(t => {
            if (t !== true) {
                u.dispose();
                if (n) {
                    throw createDialogCancelError(null, 905);
                }
                return DialogOpenResult.create(true, this);
            }
            const o = this.cmp;
            return r(o.activate?.(i), () => {
                const t = this.controller = d.$el(s, o, p, null, f.create(this.getDefinition(o) ?? {
                    name: m.generateName(),
                    template: e
                }));
                return r(t.activate(t, null), () => r(u.show?.(), () => DialogOpenResult.create(false, this)));
            });
        }, t => {
            u.dispose();
            throw t;
        });
    }
    deactivate(t, s) {
        if (this.h) {
            return this.h;
        }
        let i = true;
        const {controller: e, dom: o, cmp: n, settings: {rejectOnCancel: l}} = this;
        const a = DialogCloseResult.create(t, s);
        const c = new Promise(c => {
            c(r(n.canDeactivate?.(a) ?? true, c => {
                if (c !== true) {
                    i = false;
                    this.h = void 0;
                    if (l) {
                        throw createDialogCancelError(null, 906);
                    }
                    return DialogCloseResult.create("abort");
                }
                return r(n.deactivate?.(a), () => r(o.hide?.(), () => r(e.deactivate(e, null), () => {
                    o.dispose();
                    if (!l && t !== "error") {
                        this.t(a);
                    } else {
                        this.i(createDialogCancelError(s, 907));
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
    error(t) {
        const s = createDialogCloseError(t);
        return new Promise(t => t(r(this.cmp.deactivate?.(DialogCloseResult.create("error", s)), () => r(this.controller.deactivate(this.controller, null), () => {
            this.dom.dispose();
            this.i(s);
        }))));
    }
    getOrCreateVm(t, s, i) {
        const e = s.component;
        if (e == null) {
            return new EmptyComponent;
        }
        if (typeof e === "object") {
            return e;
        }
        const o = this.p;
        t.registerResolver(o.HTMLElement, t.registerResolver(o.Element, t.registerResolver(C, new n("ElementResolver", i))));
        return t.invoke(e);
    }
    getDefinition(t) {
        const s = o(t) ? t : t?.constructor;
        return m.isType(s) ? m.getDefinition(s) : null;
    }
}

class EmptyComponent {}

function createDialogCancelError(t, s) {
    const i = createMappedError(s);
    i.wasCancelled = true;
    i.value = t;
    return i;
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
        this.u = i(e);
        this.C = i(k);
    }
    static register(t) {
        t.register(E(this, this), s.aliasTo(this, S), p.deactivating(S, t => r(t.closeAll(), t => {
            if (t.length > 0) {
                throw createMappedError(901, t.length);
            }
        })));
    }
    get controllers() {
        return this.dlgs.slice(0);
    }
    open(t) {
        return asDialogOpenPromise(new Promise(s => {
            const i = DialogSettings.from(this.C, t);
            const e = i.container ?? this.u.createChild();
            s(r(i.load(), t => {
                const s = e.invoke(DialogController);
                e.register(R(O, s), R(DialogController, s));
                return r(s.activate(t), t => {
                    if (!t.wasCancelled) {
                        this.dlgs.push(s);
                        const $removeController = () => this.remove(s);
                        void s.closed.finally($removeController);
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
        const i = Object.assign(new DialogSettings, t, s, {
            options: {
                ...t.options ?? {},
                ...s.options ?? {}
            }
        });
        if (i.component == null && i.template == null) {
            throw createMappedError(903);
        }
        return i;
    }
    load() {
        const t = this;
        const s = this.component;
        const i = this.template;
        const e = l(s == null ? void 0 : r(m.isType(s) ? s : s(), s => {
            t.component = s;
        }), o(i) ? r(i(), s => {
            t.template = s;
        }) : void 0);
        return r(e, () => t);
    }
}

function whenClosed(t, s) {
    return this.then(i => i.dialog.closed.then(t, s), s);
}

function asDialogOpenPromise(t) {
    t.whenClosed = whenClosed;
    return t;
}

class DialogDomRendererClassic {
    constructor() {
        this.p = i(u);
        this.R = i(I);
        this.overlayCss = "position:absolute;width:100%;height:100%;top:0;left:0;";
        this.wrapperCss = `${this.overlayCss} display:flex;`;
        this.hostCss = "position:relative;margin:auto;";
    }
    render(t, s, i) {
        const e = this.p.document;
        const h = (t, s) => {
            const i = e.createElement(t);
            i.style.cssText = s;
            return i;
        };
        const {startingZIndex: o} = i ?? {};
        const r = `${this.wrapperCss};${o == null ? "" : `z-index:${o}`}`;
        const n = t.appendChild(h("au-dialog-container", r));
        const l = n.appendChild(h("au-dialog-overlay", this.overlayCss));
        const a = n.appendChild(h("div", this.hostCss));
        return new DialogDomClassic(n, l, a, s, this.R, i ?? {});
    }
}

class DialogDomClassic {
    constructor(t, s, i, e, o, r) {
        this.root = t;
        this.overlay = s;
        this.contentHost = i;
        this.O = null;
        this.I = e;
        this.R = o;
        this.P = r ?? {};
    }
    show() {
        return r(this.P?.show?.(this), () => {
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

const I = /*@__PURE__*/ w("IDialogEventManager", t => t.singleton(DialogEventManagerClassic));

class DialogEventManagerClassic {
    constructor() {
        this.ctrls = [];
        this.w = i(v);
    }
    add(t, s) {
        if (this.ctrls.push(t) === 1) {
            this.w.addEventListener("keydown", this);
        }
        const i = t.settings.options;
        const e = i.lock;
        let o = i.overlayDismiss;
        o = typeof o === "boolean" ? o : !e;
        const r = i.mouseEvent ?? "click";
        const handleClick = i => {
            if (o && !s.contentHost.contains(i.target)) {
                void t.cancel();
            }
        };
        s.overlay?.addEventListener(r, handleClick);
        const handleSubmit = t => {
            const s = t.target;
            const i = !s.getAttribute("action");
            if (s.tagName === "FORM" && i) {
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
        const i = s.indexOf(t);
        if (i !== -1) {
            s.splice(i, 1);
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
        const i = DialogEventManagerClassic.M(s);
        if (i == null) {
            return;
        }
        const e = this.ctrls.slice(-1)[0];
        if (e == null) {
            return;
        }
        const o = this.j(e);
        if (i === "Escape" && o.includes(i)) {
            void e.cancel();
        } else if (i === "Enter" && o.includes(i)) {
            void e.ok();
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
        this.p = i(u);
    }
    render(t, s, i = {}) {
        const h = t => this.p.document.createElement(t);
        const e = h("dialog");
        const o = e.appendChild(h("div"));
        if (i.closedby) {
            e.setAttribute("closedby", i.closedby);
        }
        t.appendChild(e);
        return new DialogDomStandard(e, o, s, i);
    }
}

class DialogDomStandard {
    constructor(t, s, i, e) {
        this.root = t;
        this.contentHost = s;
        this.A = null;
        this.I = i;
        this.P = e;
        this._ = t.ownerDocument.createElement("div");
        if (e.overlayStyle != null) {
            this.setOverlayStyle(e.overlayStyle);
        }
    }
    setOverlayStyle(t) {
        const s = this.A ??= this.root.insertAdjacentElement("afterbegin", this.root.ownerDocument.createElement("style"));
        const i = this._;
        i.style.cssText = "";
        if (a(t)) {
            i.style.cssText = t;
        } else {
            Object.assign(i.style, t);
        }
        s.textContent = `:modal::backdrop{${i.style.cssText}}`;
    }
    show() {
        if (this.P.modal) {
            this.root.showModal();
        } else {
            this.root.show();
        }
        return r(this.P.show?.(this), () => {
            this.root.addEventListener("cancel", this);
        });
    }
    hide() {
        if (!this.root.open) ;
        return r(this.P.hide?.(this), () => {
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

function createDialogConfiguration(t, s) {
    return {
        register: i => i.register(E(k, s), DialogService, p.creating(() => t(i.get(k)))),
        customize(t) {
            return createDialogConfiguration(t, s);
        }
    };
}

const P = /*@__PURE__*/ createDialogConfiguration(() => {
    throw createMappedError(904);
}, class {
    constructor() {
        this.options = {};
    }
});

const $ = /*@__PURE__*/ createDialogConfiguration(c, class {
    constructor() {
        this.renderer = DialogDomRendererStandard;
        this.options = {
            modal: true
        };
    }
});

const j = /*@__PURE__*/ createDialogConfiguration(c, class {
    constructor() {
        this.renderer = DialogDomRendererClassic;
        this.options = {
            lock: true,
            startingZIndex: 1e3
        };
    }
});

export { DialogCloseResult, P as DialogConfiguration, j as DialogConfigurationClassic, $ as DialogConfigurationStandard, DialogController, DialogDomClassic, DialogDomRendererClassic, DialogDomRendererStandard, DialogDomStandard, DialogOpenResult, DialogService, O as IDialogController, b as IDialogDom, y as IDialogDomRenderer, k as IDialogGlobalSettings, S as IDialogService, createDialogConfiguration };

