import { DI } from '@aurelia/kernel';
class ScrollState {
    constructor(el) {
        this.el = el;
        this.top = el.scrollTop;
        this.left = el.scrollLeft;
    }
    static has(el) {
        return el.scrollTop > 0 || el.scrollLeft > 0;
    }
    restore() {
        this.el.scrollTo(this.left, this.top);
        this.el = null;
    }
}
function restoreState(state) {
    state.restore();
}
class HostElementState {
    constructor(host) {
        this.scrollStates = [];
        this.save(host.children);
    }
    save(elements) {
        let el;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            el = elements[i];
            if (ScrollState.has(el)) {
                this.scrollStates.push(new ScrollState(el));
            }
            this.save(el.children);
        }
    }
    restore() {
        this.scrollStates.forEach(restoreState);
        this.scrollStates = null;
    }
}
export const IStateManager = DI.createInterface('IStateManager', x => x.singleton(ScrollStateManager));
export class ScrollStateManager {
    constructor() {
        this.cache = new WeakMap();
    }
    saveState(controller) {
        this.cache.set(controller.host, new HostElementState(controller.host));
    }
    restoreState(controller) {
        const state = this.cache.get(controller.host);
        if (state !== void 0) {
            state.restore();
            this.cache.delete(controller.host);
        }
    }
}
//# sourceMappingURL=state-manager.js.map