import type { ISubscriber, LifecycleFlags } from '../observation.js';
declare type Signal = string;
export interface ISignaler extends Signaler {
}
export declare const ISignaler: import("@aurelia/kernel").InterfaceSymbol<ISignaler>;
export declare class Signaler {
    signals: Record<string, Set<ISubscriber>>;
    dispatchSignal(name: Signal, flags?: LifecycleFlags): void;
    addSignalListener(name: Signal, listener: ISubscriber): void;
    removeSignalListener(name: Signal, listener: ISubscriber): void;
}
export {};
//# sourceMappingURL=signaler.d.ts.map