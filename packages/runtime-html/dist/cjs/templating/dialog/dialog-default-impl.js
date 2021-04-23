"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDialogDom = exports.DefaultDialogDomRenderer = exports.DefaultDialogGlobalSettings = void 0;
const platform_js_1 = require("../../platform.js");
const dialog_interfaces_js_1 = require("./dialog-interfaces.js");
const kernel_1 = require("@aurelia/kernel");
class DefaultDialogGlobalSettings {
    constructor() {
        this.lock = true;
        this.startingZIndex = 1000;
        this.rejectOnCancel = false;
    }
    static register(container) {
        kernel_1.Registration.singleton(dialog_interfaces_js_1.IDialogGlobalSettings, this).register(container);
    }
}
exports.DefaultDialogGlobalSettings = DefaultDialogGlobalSettings;
const baseWrapperCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
class DefaultDialogDomRenderer {
    constructor(p) {
        this.p = p;
        this.wrapperCss = `${baseWrapperCss} display:flex;`;
        this.overlayCss = baseWrapperCss;
        this.hostCss = 'position:relative;margin:auto;';
    }
    static register(container) {
        kernel_1.Registration.singleton(dialog_interfaces_js_1.IDialogDomRenderer, this).register(container);
    }
    render(dialogHost) {
        const doc = this.p.document;
        const h = (name, css) => {
            const el = doc.createElement(name);
            el.style.cssText = css;
            return el;
        };
        const wrapper = dialogHost.appendChild(h('au-dialog-container', this.wrapperCss));
        const overlay = wrapper.appendChild(h('au-dialog-overlay', this.overlayCss));
        const host = overlay.appendChild(h('div', this.hostCss));
        return new DefaultDialogDom(wrapper, overlay, host);
    }
}
exports.DefaultDialogDomRenderer = DefaultDialogDomRenderer;
DefaultDialogDomRenderer.inject = [platform_js_1.IPlatform];
class DefaultDialogDom {
    constructor(wrapper, overlay, contentHost) {
        this.wrapper = wrapper;
        this.overlay = overlay;
        this.contentHost = contentHost;
    }
    dispose() {
        this.wrapper.remove();
    }
}
exports.DefaultDialogDom = DefaultDialogDom;
//# sourceMappingURL=dialog-default-impl.js.map