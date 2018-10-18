import { Immutable } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IPropertySubscriber } from './observation';
declare type Signal = string;
export interface ISignaler {
    signals: Immutable<Record<string, Set<IPropertySubscriber>>>;
    dispatchSignal(name: Signal, flags?: BindingFlags): void;
    addSignalListener(name: Signal, listener: IPropertySubscriber): void;
    removeSignalListener(name: Signal, listener: IPropertySubscriber): void;
}
export declare const ISignaler: import("@aurelia/kernel/dist/di").InterfaceSymbol<ISignaler>;
export {};
//# sourceMappingURL=signaler.d.ts.map