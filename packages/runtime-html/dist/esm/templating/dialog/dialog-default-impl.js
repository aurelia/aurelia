import { IPlatform } from '../../platform.js';
import { IDialogDomRenderer, IDialogGlobalSettings, } from './dialog-interfaces.js';
import { Registration } from '@aurelia/kernel';
export class DefaultDialogGlobalSettings {
    constructor() {
        this.lock = true;
        this.startingZIndex = 1000;
        this.rejectOnCancel = false;
    }
    static register(container) {
        Registration.singleton(IDialogGlobalSettings, this).register(container);
    }
}
const baseWrapperCss = 'position:absolute;width:100%;height:100%;top:0;left:0;';
export class DefaultDialogDomRenderer {
    constructor(p) {
        this.p = p;
        this.wrapperCss = `${baseWrapperCss} display:flex;`;
        this.overlayCss = baseWrapperCss;
        this.hostCss = 'position:relative;margin:auto;';
    }
    static register(container) {
        Registration.singleton(IDialogDomRenderer, this).register(container);
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
DefaultDialogDomRenderer.inject = [IPlatform];
export class DefaultDialogDom {
    constructor(wrapper, overlay, contentHost) {
        this.wrapper = wrapper;
        this.overlay = overlay;
        this.contentHost = contentHost;
    }
    dispose() {
        this.wrapper.remove();
    }
}
//# sourceMappingURL=dialog-default-impl.js.map