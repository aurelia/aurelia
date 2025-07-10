import { Platform as e, TaskQueue as t } from "@aurelia/platform";

class BrowserPlatform extends e {
    static getOrCreate(e, t = {}) {
        let r = BrowserPlatform.t.get(e);
        if (r === void 0) {
            BrowserPlatform.t.set(e, r = new BrowserPlatform(e, t));
        }
        return r;
    }
    static set(e, t) {
        BrowserPlatform.t.set(e, t);
    }
    get domWriteQueue() {
        return this.domQueue;
    }
    get domReadQueue() {
        return this.domQueue;
    }
    constructor(e, r = {}) {
        super(e, r);
        const notImplemented = e => () => {
            throw new Error(`The PLATFORM did not receive a valid reference to the global function '${e}'.`);
        };
        ("Node Element HTMLElement CustomEvent CSSStyleSheet ShadowRoot MutationObserver " + "window document customElements").split(" ").forEach(t => this[t] = t in r ? r[t] : e[t]);
        "fetch requestAnimationFrame cancelAnimationFrame".split(" ").forEach(t => this[t] = t in r ? r[t] : e[t]?.bind(e) ?? notImplemented(t));
        this.domQueue = (() => {
            let e = false;
            let r = -1;
            const requestDomFlush = () => {
                e = true;
                if (r === -1) {
                    r = this.requestAnimationFrame(flushDomQueue);
                }
            };
            const cancelDomFlush = () => {
                e = false;
                if (r > -1) {
                    this.cancelAnimationFrame(r);
                    r = -1;
                }
            };
            const flushDomQueue = () => {
                r = -1;
                if (e === true) {
                    e = false;
                    o.flush();
                }
            };
            const o = new t(this, requestDomFlush, cancelDomFlush);
            return o;
        })();
    }
}

BrowserPlatform.t = new WeakMap;

export { BrowserPlatform };
//# sourceMappingURL=index.mjs.map
