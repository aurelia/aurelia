import { LifecycleFlags } from '../flags';
import { ISubscriber } from '../observation';
declare type Signal = string;
export interface ISignaler {
    signals: Record<string, Set<ISubscriber>>;
    dispatchSignal(name: Signal, flags?: LifecycleFlags): void;
    addSignalListener(name: Signal, listener: ISubscriber): void;
    removeSignalListener(name: Signal, listener: ISubscriber): void;
}
export declare const ISignaler: import("@aurelia/kernel").InterfaceSymbol<ISignaler>;
export {};
//# sourceMappingURL=signaler.d.ts.map