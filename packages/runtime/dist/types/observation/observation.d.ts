import { IObserverLocator } from './observer-locator.js';
import type { IConnectable } from '../observation.js';
export interface IObservation extends Observation {
}
export declare const IObservation: import("@aurelia/kernel").InterfaceSymbol<IObservation>;
export declare class Observation implements IObservation {
    readonly observerLocator: IObserverLocator;
    static get inject(): import("@aurelia/kernel").InterfaceSymbol<IObserverLocator>[];
    constructor(observerLocator: IObserverLocator);
    /**
     * Run an effect function an track the dependencies inside it,
     * to re-run whenever a dependency has changed
     */
    run(fn: EffectFunc): IEffect;
}
export declare type EffectFunc = (runner: IConnectable) => void;
export interface IEffect extends IConnectable {
    run(): void;
    stop(): void;
}
//# sourceMappingURL=observation.d.ts.map