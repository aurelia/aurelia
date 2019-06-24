import { DI } from '@aurelia/kernel';
export const ISignaler = DI.createInterface('ISignaler').withDefault(x => x.singleton(Signaler));
/** @internal */
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
            listener.handleChange(undefined, undefined, flags | 16 /* updateTargetInstance */);
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