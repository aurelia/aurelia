import { DI as t, resolve as s, IContainer as e, InstanceProvider as n } from "../../../kernel/dist/native-modules/index.mjs";

import { IPlatform as i, IRendering as l, CustomElementDefinition as o, CustomElement as r, INode as c, Controller as a } from "../../../runtime-html/dist/native-modules/index.mjs";

const u = /*@__PURE__*/ t.createInterface((t => t.singleton(WcCustomElementRegistry)));

class WcCustomElementRegistry {
    constructor() {
        this.ctn = s(e);
        this.p = s(i);
        this.r = s(l);
    }
    define(t, s, e) {
        if (!t.includes("-")) {
            throw createError('Invalid web-components custom element name. It must include a "-"');
        }
        let i;
        if (s == null) {
            throw createError("Invalid custom element definition");
        }
        switch (typeof s) {
          case "function":
            i = r.isType(s) ? r.getDefinition(s) : o.create(r.generateName(), s);
            break;

          default:
            i = o.getOrCreate(s);
            break;
        }
        if (i.containerless) {
            throw createError("Containerless custom element is not supported. Consider using buitl-in extends instead");
        }
        const l = e?.extends ? this.p.document.createElement(e.extends).constructor : this.p.HTMLElement;
        const u = this.ctn;
        const m = this.r;
        const h = i.bindables;
        const C = this.p;
        class CustomElementClass extends l {
            auInit() {
                if (this.auInited) {
                    return;
                }
                this.auInited = true;
                const t = u.createChild();
                registerResolver(t, C.HTMLElement, registerResolver(t, C.Element, registerResolver(t, c, new n("ElementProvider", this))));
                const s = m.compile(i, t);
                const e = t.invoke(s.Type);
                this.auCtrl = a.$el(t, e, this, null, s);
            }
            connectedCallback() {
                this.auInit();
                this.auCtrl.activate(this.auCtrl, null);
            }
            disconnectedCallback() {
                this.auCtrl.deactivate(this.auCtrl, null);
            }
            adoptedCallback() {
                this.auInit();
            }
            attributeChangedCallback(t, s, e) {
                this.auInit();
                this.auCtrl.viewModel[t] = e;
            }
        }
        CustomElementClass.observedAttributes = Object.keys(h);
        for (const t in h) {
            Object.defineProperty(CustomElementClass.prototype, t, {
                configurable: true,
                enumerable: false,
                get() {
                    return this["auCtrl"].viewModel[t];
                },
                set(s) {
                    if (!this["auInited"]) {
                        this["auInit"]();
                    }
                    this["auCtrl"].viewModel[t] = s;
                }
            });
        }
        this.p.customElements.define(t, CustomElementClass, e);
        return CustomElementClass;
    }
}

const registerResolver = (t, s, e) => t.registerResolver(s, e);

const createError = t => new Error(t);

export { u as IWcElementRegistry, WcCustomElementRegistry };

