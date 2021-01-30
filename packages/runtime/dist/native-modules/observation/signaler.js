import { DI } from '../../../../kernel/dist/native-modules/index.js';
export const ISignaler = DI.createInterface('ISignaler', x => x.singleton(Signaler));
export class Signaler {
    constructor() {
        this.signals = Object.create(null);
    }
    dispatchSignal(name, flags) {
        const listeners = this.signals[name];
        if (listeners === undefined) {
            return;
        }
        for (const listener of listeners.keys()) {
            listener.handleChange(undefined, undefined, flags | 8 /* updateTarget */);
        }
    }
    addSignalListener(name, listener) {
        const signals = this.signals;
        const listeners = signals[name];
        if (listeners === undefined) {
            signals[name] = new Set([listener]);
        }
        else {
            listeners.add(listener);
        }
    }
    removeSignalListener(name, listener) {
        const listeners = this.signals[name];
        if (listeners) {
            listeners.delete(listener);
        }
    }
}
//# sourceMappingURL=signaler.js.map