"use strict";

var t = require("@aurelia/kernel");

var e = require("@aurelia/runtime-html");

const s = /*@__PURE__*/ t.DI.createInterface((t => t.singleton(WcCustomElementRegistry)));

class WcCustomElementRegistry {
    constructor() {
        this.ctn = t.resolve(t.IContainer);
        this.p = t.resolve(e.IPlatform);
        this.r = t.resolve(e.IRendering);
    }
    define(s, n, i) {
        if (!s.includes("-")) {
            throw createError('Invalid web-components custom element name. It must include a "-"');
        }
        let l;
        if (n == null) {
            throw createError("Invalid custom element definition");
        }
        switch (typeof n) {
          case "function":
            l = e.CustomElement.isType(n) ? e.CustomElement.getDefinition(n) : e.CustomElementDefinition.create(e.CustomElement.generateName(), n);
            break;

          default:
            l = e.CustomElementDefinition.getOrCreate(n);
            break;
        }
        if (l.containerless) {
            throw createError("Containerless custom element is not supported. Consider using buitl-in extends instead");
        }
        const o = i?.extends ? this.p.document.createElement(i.extends).constructor : this.p.HTMLElement;
        const r = this.ctn;
        const c = this.r;
        const a = l.bindables;
        const u = this.p;
        class CustomElementClass extends o {
            auInit() {
                if (this.auInited) {
                    return;
                }
                this.auInited = true;
                const s = r.createChild();
                registerResolver(s, u.HTMLElement, registerResolver(s, u.Element, registerResolver(s, e.INode, new t.InstanceProvider("ElementProvider", this))));
                const n = c.compile(l, s);
                const i = s.invoke(n.Type);
                this.auCtrl = e.Controller.$el(s, i, this, null, n);
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
            attributeChangedCallback(t, e, s) {
                this.auInit();
                this.auCtrl.viewModel[t] = s;
            }
        }
        CustomElementClass.observedAttributes = Object.keys(a);
        for (const t in a) {
            Object.defineProperty(CustomElementClass.prototype, t, {
                configurable: true,
                enumerable: false,
                get() {
                    return this["auCtrl"].viewModel[t];
                },
                set(e) {
                    if (!this["auInited"]) {
                        this["auInit"]();
                    }
                    this["auCtrl"].viewModel[t] = e;
                }
            });
        }
        this.p.customElements.define(s, CustomElementClass, i);
        return CustomElementClass;
    }
}

const registerResolver = (t, e, s) => t.registerResolver(e, s);

const createError = t => new Error(t);

exports.IWcElementRegistry = s;

exports.WcCustomElementRegistry = WcCustomElementRegistry;
//# sourceMappingURL=index.cjs.map
